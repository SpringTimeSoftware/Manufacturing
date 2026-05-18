using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Integration;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Integration;
using STS.Mfg.Domain.Integration;
using STS.Mfg.Domain.Platform.Notifications;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Integration;

internal sealed class OutboundMessageService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail,
    INotificationTemplateLookup templateLookup)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IOutboundMessageService
{
    private static readonly string[] MessageChannels = ["Email", "Sms", "WhatsApp"];

    public async Task<OutboundDeliveryStatusDto> QueueMessageAsync(OutboundMessageRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMessage(request.ChannelType, request.RecipientRef, request.TemplateCode);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var channelType = NormalizeChannel(request.ChannelType);
        var template = await ResolveMessageTemplateAsync(channelType, request.TemplateCode, request.CompanyId, cancellationToken);
        var provider = await ResolveProviderAsync(channelType, request.CompanyId, request.BranchId, cancellationToken);
        var providerIssue = await ResolveProviderIssueAsync(provider, request.CompanyId, request.BranchId, cancellationToken);
        var templateIssue = ValidateTemplateForChannel(channelType, request.TemplateCode, template);
        var recipientIssue = ValidateRecipient(channelType, request.RecipientRef);
        var reportIssue = await ValidateReportOutputAsync(request.ReportOutputId, cancellationToken);
        var failure = FirstIssue(providerIssue, templateIssue, recipientIssue, reportIssue);
        var payload = JsonSerializer.Serialize(request.Tokens ?? new Dictionary<string, string>());
        var rendered = RenderTemplate(request.BodyOverride ?? template?.BodyTemplate ?? string.Empty, request.Tokens);
        var status = failure is null ? "Queued" : "Failed";
        var entity = IntegrationOutboundMessage.Create(
            request.CompanyId,
            request.BranchId,
            channelType,
            provider?.Id,
            request.SourceModule,
            request.RelatedDocumentType,
            request.RelatedDocumentId,
            request.SourceDocumentNo,
            request.RecipientRef.Trim(),
            request.RecipientType ?? "External",
            request.TemplateCode.Trim(),
            request.Subject,
            payload,
            rendered,
            request.ReportOutputId,
            status,
            failure,
            GetUserId());

        DbContext.IntegrationOutboundMessages.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        DbContext.IntegrationDeliveryEvents.Add(IntegrationDeliveryEvent.Create(
            entity.CompanyId,
            entity.BranchId,
            entity.Id,
            status == "Failed" ? "ValidationFailed" : "Queued",
            status,
            null,
            null,
            status == "Queued" ? "Provider delivery worker must confirm final delivery." : null,
            failure,
            GetUserId()));
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapDelivery(entity);
        await WriteAuditAsync("integration", nameof(IntegrationOutboundMessage), "integration.message.queue", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<OutboundMessagePreviewDto> PreviewMessageAsync(OutboundMessagePreviewRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMessage(request.ChannelType, request.RecipientRef, request.TemplateCode);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var channelType = NormalizeChannel(request.ChannelType);
        var template = await ResolveMessageTemplateAsync(channelType, request.TemplateCode, request.CompanyId, cancellationToken);
        if (template is null && string.IsNullOrWhiteSpace(request.BodyOverride))
        {
            var legacyTemplate = await templateLookup.ResolveTemplateAsync(request.TemplateCode.Trim(), channelType, request.CompanyId, request.BranchId, cancellationToken);
            template = string.IsNullOrWhiteSpace(legacyTemplate)
                ? null
                : IntegrationMessageTemplate.Create(request.CompanyId, null, channelType, request.TemplateCode, request.TemplateCode, "legacy", "Approved", legacyTemplate, "Active", GetUserId());
        }

        template = EnsureFound(template, "Message template was not found for this channel.", "integration.template_not_found");

        return new OutboundMessagePreviewDto(channelType, request.TemplateCode.Trim(), RedactRecipient(request.RecipientRef), RenderTemplate(request.BodyOverride ?? template.BodyTemplate, request.Tokens));
    }

    public async Task<PagedResult<OutboundDeliveryStatusDto>> ListDeliveryStatusesAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.IntegrationOutboundMessages.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.ProviderType))
        {
            var channelType = NormalizeChannel(filter.ProviderType);
            query = query.Where(entity => entity.ChannelType == channelType);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.Recipient.Contains(search) ||
                entity.TemplateCode.Contains(search) ||
                (entity.SourceDocumentType != null && entity.SourceDocumentType.Contains(search)));
        }

        var page = await query.OrderByDescending(entity => entity.CreatedOn).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapDelivery);
    }

    public async Task<IReadOnlyCollection<OutboundProviderHealthDto>> GetProviderHealthAsync(CancellationToken cancellationToken = default)
    {
        var providers = await DbContext.IntegrationProviders.AsNoTracking().ToListAsync(cancellationToken);
        var connections = await DbContext.IntegrationConnections.AsNoTracking().ToListAsync(cancellationToken);

        return MessageChannels.Select(channel =>
        {
            var provider = providers
                .OrderBy(candidate => candidate.ProviderCode)
                .FirstOrDefault(candidate =>
                    string.Equals(candidate.Channel, channel, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(candidate.ProviderType, channel, StringComparison.OrdinalIgnoreCase));

            if (provider is null)
            {
                return new OutboundProviderHealthDto(channel, null, "MissingProvider", 0, "No provider record is configured for this channel.");
            }

            var activeConnections = connections.Count(connection =>
                connection.IntegrationProviderId == provider.Id &&
                string.Equals(connection.Status, "Active", StringComparison.OrdinalIgnoreCase));

            var status = !string.Equals(provider.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? "InactiveProvider"
                : activeConnections == 0 ? "NoActiveConnection"
                : string.IsNullOrWhiteSpace(provider.CredentialReference) && !connections.Any(connection => connection.IntegrationProviderId == provider.Id && !string.IsNullOrWhiteSpace(connection.CredentialReference))
                    ? "MissingCredential"
                    : provider.EnvironmentName.Equals("Sandbox", StringComparison.OrdinalIgnoreCase) ? "SandboxReady" : "Ready";

            var notes = status == "Ready"
                ? "Provider abstraction is configured; secrets remain referenced by credential keys only."
                : status == "SandboxReady" ? "Sandbox provider can record dry-run delivery only."
                : "Configure an active provider and connection before live delivery.";

            return new OutboundProviderHealthDto(channel, provider.ProviderCode, status, activeConnections, notes);
        }).ToArray();
    }

    public async Task<OutboundDeliveryStatusDto> RetryMessageAsync(long id, OutboundRetryRequest request, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.IntegrationOutboundMessages.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Outbound message was not found in the active scope.", "integration.message_not_found");
        var provider = await ResolveProviderAsync(entity.ChannelType, entity.CompanyId, entity.BranchId, cancellationToken);
        var providerIssue = await ResolveProviderIssueAsync(provider, entity.CompanyId, entity.BranchId, cancellationToken);
        entity.QueueRetry(providerIssue ?? request.Reason, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        DbContext.IntegrationDeliveryEvents.Add(IntegrationDeliveryEvent.Create(entity.CompanyId, entity.BranchId, entity.Id, "Retry", entity.Status, null, null, "Retry attempt recorded.", entity.FailureReason, GetUserId()));
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapDelivery(entity);
        await WriteAuditAsync("integration", nameof(IntegrationOutboundMessage), "integration.message.retry", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    private async Task<IntegrationMessageTemplate?> ResolveMessageTemplateAsync(string channelType, string templateCode, long? companyId, CancellationToken cancellationToken)
    {
        var code = templateCode.Trim();
        return await DbContext.IntegrationMessageTemplates.AsNoTracking()
            .Where(record => record.ChannelType == channelType && record.TemplateCode == code && record.Status == "Active")
            .Where(record => record.CompanyId == companyId || record.CompanyId == null)
            .OrderByDescending(record => record.CompanyId.HasValue)
            .ThenByDescending(record => record.TemplateVersion)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<IntegrationProvider?> ResolveProviderAsync(string channelType, long? companyId, long? branchId, CancellationToken cancellationToken)
    {
        _ = companyId;
        _ = branchId;
        return await DbContext.IntegrationProviders.AsNoTracking()
            .Where(record => record.Channel == channelType || record.ProviderType == channelType)
            .OrderBy(record => record.ProviderCode)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<string?> ResolveProviderIssueAsync(IntegrationProvider? provider, long? companyId, long? branchId, CancellationToken cancellationToken)
    {
        if (provider is null)
        {
            return "No provider is configured for this channel.";
        }

        if (!provider.Status.Equals("Active", StringComparison.OrdinalIgnoreCase))
        {
            return $"{provider.ProviderCode} is not active.";
        }

        var connection = await DbContext.IntegrationConnections.AsNoTracking()
            .Where(record => record.IntegrationProviderId == provider.Id && record.Status == "Active")
            .Where(record => !companyId.HasValue || record.CompanyId == companyId.Value)
            .Where(record => !branchId.HasValue || record.BranchId == branchId.Value || record.BranchId == null)
            .OrderByDescending(record => record.BranchId.HasValue)
            .ThenBy(record => record.ConnectionCode)
            .FirstOrDefaultAsync(cancellationToken);

        if (connection is null)
        {
            return $"{provider.ProviderCode} has no active connection for this scope.";
        }

        if (string.IsNullOrWhiteSpace(provider.CredentialReference) && string.IsNullOrWhiteSpace(connection.CredentialReference))
        {
            return $"{provider.ProviderCode} requires a credential reference before live delivery.";
        }

        if (!provider.EnvironmentName.Equals("Sandbox", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(provider.BaseUrl) && string.IsNullOrWhiteSpace(connection.EndpointUrl))
        {
            return $"{provider.ProviderCode} requires an endpoint before live delivery.";
        }

        return null;
    }

    private async Task<string?> ValidateReportOutputAsync(long? reportOutputId, CancellationToken cancellationToken)
    {
        if (!reportOutputId.HasValue)
        {
            return null;
        }

        var exists = await DbContext.ReportOutputs.AsNoTracking().AnyAsync(record => record.Id == reportOutputId.Value && record.Status == "Completed", cancellationToken);
        return exists ? null : "Generated report output is not available for delivery.";
    }

    private static string? ValidateTemplateForChannel(string channelType, string templateCode, IntegrationMessageTemplate? template)
    {
        if (template is null)
        {
            return $"Template {templateCode.Trim()} is not configured for {channelType}.";
        }

        if (channelType.Equals("WhatsApp", StringComparison.OrdinalIgnoreCase) &&
            !template.ApprovalStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase))
        {
            return "WhatsApp delivery requires an approved template.";
        }

        return null;
    }

    private static string? ValidateRecipient(string channelType, string recipient)
    {
        var value = recipient.Trim();
        if (channelType.Equals("Email", StringComparison.OrdinalIgnoreCase) && !value.Contains('@'))
        {
            return "Email recipient must contain a valid email address.";
        }

        if ((channelType.Equals("Sms", StringComparison.OrdinalIgnoreCase) || channelType.Equals("WhatsApp", StringComparison.OrdinalIgnoreCase)) &&
            value.Count(char.IsDigit) < 8)
        {
            return $"{channelType} recipient must contain a valid phone number.";
        }

        return null;
    }

    private static string? FirstIssue(params string?[] issues) => issues.FirstOrDefault(issue => !string.IsNullOrWhiteSpace(issue));

    private static void ValidateMessage(string channelType, string recipientRef, string templateCode)
    {
        ThrowIfInvalid(
            Required(channelType, nameof(channelType), "Channel type is required."),
            Required(recipientRef, nameof(recipientRef), "Recipient reference is required."),
            Required(templateCode, nameof(templateCode), "Template code is required."));

        var normalized = NormalizeChannel(channelType);
        ThrowIfInvalid(!MessageChannels.Contains(normalized, StringComparer.OrdinalIgnoreCase)
            ? new ApiError("validation.unsupported", nameof(channelType), "Only Email, Sms, and WhatsApp channels are supported by this abstraction.")
            : null);
    }

    private static string NormalizeChannel(string channelType) =>
        channelType.Trim().Equals("SMS", StringComparison.OrdinalIgnoreCase) ? "Sms" : channelType.Trim();

    private static string RenderTemplate(string template, IReadOnlyDictionary<string, string>? tokens)
    {
        var output = template;
        foreach (var token in tokens ?? new Dictionary<string, string>())
        {
            output = output.Replace($"{{{{{token.Key}}}}}", token.Value, StringComparison.OrdinalIgnoreCase);
        }

        return output;
    }

    private static string RedactRecipient(string recipientRef)
    {
        var value = recipientRef.Trim();
        var atIndex = value.IndexOf('@');
        if (atIndex > 1)
        {
            return $"{value[0]}***{value[atIndex..]}";
        }

        if (value.Length <= 4)
        {
            return "***";
        }

        return $"***{value[^4..]}";
    }

    private static OutboundDeliveryStatusDto MapDelivery(IntegrationOutboundMessage entity) =>
        new(entity.Id, entity.ChannelType, RedactRecipient(entity.Recipient), entity.TemplateCode, entity.Status, entity.AttemptCount, entity.CreatedOn, entity.LastAttemptedAt, entity.FailureReason, entity.IntegrationProviderId, null, entity.SourceModule, entity.SourceDocumentType, entity.SourceDocumentId, entity.SourceDocumentNo, entity.ReportOutputId, entity.DeliveryReceiptStatus);
}
