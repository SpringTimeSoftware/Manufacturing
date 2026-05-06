using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Integration;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Integration;
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
        var payload = JsonSerializer.Serialize(request.Tokens ?? new Dictionary<string, string>());
        var entity = NotificationOutboxMessage.Queue(
            request.CompanyId,
            request.BranchId,
            channelType,
            request.RecipientRef.Trim(),
            request.TemplateCode.Trim(),
            payload,
            Normalize(request.RelatedDocumentType),
            request.RelatedDocumentId);

        DbContext.Notifications.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapDelivery(entity);
        await WriteAuditAsync("integration", nameof(NotificationOutboxMessage), "integration.message.queue", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<OutboundMessagePreviewDto> PreviewMessageAsync(OutboundMessagePreviewRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMessage(request.ChannelType, request.RecipientRef, request.TemplateCode);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var channelType = NormalizeChannel(request.ChannelType);
        var template = await templateLookup.ResolveTemplateAsync(request.TemplateCode.Trim(), channelType, request.CompanyId, request.BranchId, cancellationToken);
        template = EnsureFound(template, "Notification template was not found for this channel.", "integration.template_not_found");

        return new OutboundMessagePreviewDto(channelType, request.TemplateCode.Trim(), RedactRecipient(request.RecipientRef), RenderTemplate(template, request.Tokens));
    }

    public async Task<PagedResult<OutboundDeliveryStatusDto>> ListDeliveryStatusesAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Notifications.AsNoTracking().ApplyActiveOrganizationScope(scope);

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
            query = query.Where(entity => entity.DeliveryStatus == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.RecipientRef.Contains(search) ||
                entity.TemplateCode.Contains(search) ||
                (entity.RelatedDocumentType != null && entity.RelatedDocumentType.Contains(search)));
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
                .FirstOrDefault(candidate => string.Equals(candidate.ProviderType, channel, StringComparison.OrdinalIgnoreCase));

            if (provider is null)
            {
                return new OutboundProviderHealthDto(channel, null, "MissingProvider", 0, "No provider record is configured for this channel.");
            }

            var activeConnections = connections.Count(connection =>
                connection.IntegrationProviderId == provider.Id &&
                string.Equals(connection.Status, "Active", StringComparison.OrdinalIgnoreCase));

            var status = !string.Equals(provider.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? "InactiveProvider"
                : activeConnections == 0 ? "NoActiveConnection" : "Ready";

            var notes = status == "Ready"
                ? "Provider abstraction is configured; secrets remain referenced by credential keys only."
                : "Configure an active provider and connection before live delivery.";

            return new OutboundProviderHealthDto(channel, provider.ProviderCode, status, activeConnections, notes);
        }).ToArray();
    }

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

    private static OutboundDeliveryStatusDto MapDelivery(NotificationOutboxMessage entity) =>
        new(entity.Id, entity.ChannelType, RedactRecipient(entity.RecipientRef), entity.TemplateCode, entity.DeliveryStatus, entity.AttemptCount, entity.CreatedOn, entity.ProcessedOn, entity.LastError);
}
