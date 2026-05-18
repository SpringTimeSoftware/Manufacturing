using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Integration;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Integration;
using STS.Mfg.Domain.Integration;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Integration;

internal sealed class IntegrationService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IIntegrationService
{
    public async Task<PagedResult<IntegrationProviderDto>> ListProvidersAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.IntegrationProviders.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(filter.ProviderType))
        {
            var providerType = filter.ProviderType.Trim();
            query = query.Where(entity => entity.ProviderType == providerType);
        }

        if (!string.IsNullOrWhiteSpace(filter.ChannelType))
        {
            var channel = filter.ChannelType.Trim();
            query = query.Where(entity => entity.Channel == channel);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ProviderCode.Contains(search) || entity.ProviderName.Contains(search));
        }

        var page = await query.OrderBy(entity => entity.ProviderCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapProvider);
    }

    public async Task<IntegrationProviderDto> GetProviderAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.IntegrationProviders.AsNoTracking().FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Integration provider was not found.", "integration.provider_not_found");
        return MapProvider(entity);
    }

    public async Task<IntegrationProviderDto> CreateProviderAsync(IntegrationProviderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateProvider(request);
        var entity = IntegrationProvider.Create(request.ProviderCode, request.ProviderName, request.ProviderType, request.BaseUrl, request.Status, request.IsSystemBase, GetUserId());
        entity.Update(
            request.ProviderCode,
            request.ProviderName,
            request.ProviderType,
            request.Channel ?? request.ProviderType,
            request.VendorType ?? request.ProviderType,
            request.EnvironmentName ?? "Production",
            request.BaseUrl,
            request.CredentialReference,
            request.SenderIdentity,
            request.WhatsAppBusinessNumber,
            request.TemplateNamespace,
            request.CrmTenantReference,
            request.CallbackUrl,
            request.RateLimitPerMinute,
            request.Status,
            request.HealthStatus ?? "Unverified",
            request.LastVerifiedAt,
            request.FailureReason,
            request.IsSystemBase,
            GetUserId());
        DbContext.IntegrationProviders.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapProvider(entity);
        await WriteAuditAsync("integration", nameof(IntegrationProvider), "integration.provider.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<IntegrationProviderDto> UpdateProviderAsync(long id, IntegrationProviderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateProvider(request);
        var entity = await DbContext.IntegrationProviders.FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Integration provider was not found.", "integration.provider_not_found");

        var before = MapProvider(entity);
        entity.Update(
            request.ProviderCode,
            request.ProviderName,
            request.ProviderType,
            request.Channel ?? request.ProviderType,
            request.VendorType ?? request.ProviderType,
            request.EnvironmentName ?? "Production",
            request.BaseUrl,
            request.CredentialReference,
            request.SenderIdentity,
            request.WhatsAppBusinessNumber,
            request.TemplateNamespace,
            request.CrmTenantReference,
            request.CallbackUrl,
            request.RateLimitPerMinute,
            request.Status,
            request.HealthStatus ?? entity.HealthStatus,
            request.LastVerifiedAt ?? entity.LastVerifiedAt,
            request.FailureReason,
            request.IsSystemBase,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapProvider(entity);
        await WriteAuditAsync("integration", nameof(IntegrationProvider), "integration.provider.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<IntegrationConnectionDto>> ListConnectionsAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.IntegrationConnections.AsNoTracking().ApplyActiveOrganizationScope(scope);
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.ProviderId.HasValue)
        {
            query = query.Where(entity => entity.IntegrationProviderId == filter.ProviderId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ConnectionCode.Contains(search) || entity.ConnectionName.Contains(search));
        }

        var page = await query.OrderBy(entity => entity.ConnectionCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapConnection);
    }

    public async Task<IntegrationConnectionDto> GetConnectionAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.IntegrationConnections.AsNoTracking().ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Integration connection was not found in the active scope.", "integration.connection_not_found");
        return MapConnection(entity);
    }

    public async Task<IntegrationConnectionDto> CreateConnectionAsync(IntegrationConnectionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateConnection(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        await EnsureProviderExistsAsync(request.IntegrationProviderId, cancellationToken);

        var entity = IntegrationConnection.Create(request.CompanyId, request.BranchId, request.IntegrationProviderId, request.ConnectionCode, request.ConnectionName, request.EndpointUrl, request.CredentialReference, request.Status, GetUserId());
        entity.UpdateHealth(DateTimeOffset.UtcNow, "PendingValidation", GetUserId());
        DbContext.IntegrationConnections.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapConnection(entity);
        await WriteAuditAsync("integration", nameof(IntegrationConnection), "integration.connection.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<IntegrationConnectionDto> UpdateConnectionAsync(long id, IntegrationConnectionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateConnection(request);
        var scope = GetScope();
        var entity = await DbContext.IntegrationConnections.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Integration connection was not found in the active scope.", "integration.connection_not_found");

        await EnsureProviderExistsAsync(request.IntegrationProviderId, cancellationToken);
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Connection company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Connection branch cannot be changed."),
            Immutable(entity.IntegrationProviderId, request.IntegrationProviderId, nameof(request.IntegrationProviderId), "Integration provider cannot be changed."));

        var before = MapConnection(entity);
        entity.Update(request.ConnectionCode, request.ConnectionName, request.EndpointUrl, request.CredentialReference, request.Status, GetUserId());
        entity.UpdateHealth(DateTimeOffset.UtcNow, "PendingValidation", GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapConnection(entity);
        await WriteAuditAsync("integration", nameof(IntegrationConnection), "integration.connection.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<WebhookSubscriptionDto>> ListWebhooksAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.WebhookSubscriptions.AsNoTracking().ApplyActiveOrganizationScope(scope);
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.SubscriptionCode.Contains(search) || entity.EventType.Contains(search));
        }

        var page = await query.OrderBy(entity => entity.SubscriptionCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapWebhook);
    }

    public async Task<WebhookSubscriptionDto> GetWebhookAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.WebhookSubscriptions.AsNoTracking().ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Webhook subscription was not found in the active scope.", "integration.webhook_not_found");
        return MapWebhook(entity);
    }

    public async Task<WebhookSubscriptionDto> CreateWebhookAsync(WebhookSubscriptionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWebhook(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = WebhookSubscription.Create(request.CompanyId, request.BranchId, request.SubscriptionCode, request.EventType, request.TargetUrl, request.SecretReference, request.HeadersJson, request.Status, GetUserId());
        entity.MarkRetryQueued(DateTimeOffset.UtcNow, GetUserId());
        DbContext.WebhookSubscriptions.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapWebhook(entity);
        await WriteAuditAsync("integration", nameof(WebhookSubscription), "integration.webhook.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<WebhookSubscriptionDto> UpdateWebhookAsync(long id, WebhookSubscriptionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWebhook(request);
        var scope = GetScope();
        var entity = await DbContext.WebhookSubscriptions.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Webhook subscription was not found in the active scope.", "integration.webhook_not_found");

        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Webhook company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Webhook branch cannot be changed."));

        var before = MapWebhook(entity);
        entity.Update(request.SubscriptionCode, request.EventType, request.TargetUrl, request.SecretReference, request.HeadersJson, request.Status, GetUserId());
        entity.MarkRetryQueued(DateTimeOffset.UtcNow, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapWebhook(entity);
        await WriteAuditAsync("integration", nameof(WebhookSubscription), "integration.webhook.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ImportJobDto>> ListImportJobsAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.ImportJobs.AsNoTracking().ApplyActiveOrganizationScope(scope);
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.JobNo.Contains(search) || entity.Module.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.RequestedOn).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapImportJob);
    }

    public async Task<ImportJobDto> GetImportJobAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.ImportJobs.AsNoTracking().ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Import job was not found in the active scope.", "integration.import_not_found");
        return MapImportJob(entity);
    }

    public async Task<ImportJobDto> CreateImportJobAsync(ImportJobCreateRequest request, CancellationToken cancellationToken = default)
    {
        ValidateImportJob(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = ImportJob.Create(request.CompanyId, request.BranchId, request.JobNo, request.Module, request.SourceFormat, request.StoragePath, request.RequestToken, "Queued", GetUserId());
        DbContext.ImportJobs.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapImportJob(entity);
        await WriteAuditAsync("integration", nameof(ImportJob), "integration.import.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<ExportJobDto>> ListExportJobsAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.ExportJobs.AsNoTracking().ApplyActiveOrganizationScope(scope);
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.JobNo.Contains(search) || entity.Module.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.RequestedOn).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapExportJob);
    }

    public async Task<ExportJobDto> GetExportJobAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.ExportJobs.AsNoTracking().ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Export job was not found in the active scope.", "integration.export_not_found");
        return MapExportJob(entity);
    }

    public async Task<ExportJobDto> CreateExportJobAsync(ExportJobCreateRequest request, CancellationToken cancellationToken = default)
    {
        ValidateExportJob(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = ExportJob.Create(request.CompanyId, request.BranchId, request.JobNo, request.Module, request.OutputFormat, request.FilterJson, request.StoragePath, "Queued", GetUserId());
        DbContext.ExportJobs.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapExportJob(entity);
        await WriteAuditAsync("integration", nameof(ExportJob), "integration.export.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<WebhookDispatchResultDto> DispatchWebhookAsync(WebhookDispatchRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWebhookDispatch(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var scope = GetScope();
        var subscriptions = await DbContext.WebhookSubscriptions
            .ApplyActiveOrganizationScope(scope)
            .Where(entity =>
                entity.CompanyId == request.CompanyId &&
                entity.EventType == request.EventType &&
                entity.Status == "Active" &&
                (!request.BranchId.HasValue || entity.BranchId == request.BranchId.Value || entity.BranchId == null))
            .OrderBy(entity => entity.SubscriptionCode)
            .ToListAsync(cancellationToken);

        var delivered = 0;
        var retryQueued = 0;
        var messages = new List<string>();
        foreach (var subscription in subscriptions)
        {
            if (request.SimulateFailure || string.IsNullOrWhiteSpace(subscription.TargetUrl))
            {
                subscription.MarkRetryQueued(DateTimeOffset.UtcNow, GetUserId());
                DbContext.WebhookEvents.Add(WebhookEvent.Create(
                    request.CompanyId,
                    request.BranchId,
                    subscription.Id,
                    null,
                    "Outbound",
                    request.EventType,
                    null,
                    null,
                    request.PayloadReference,
                    ComputeHash(request.PayloadReference),
                    true,
                    1,
                    null,
                    null,
                    "RetryQueued",
                    "Webhook delivery was queued for retry.",
                    GetUserId()));
                retryQueued += 1;
                messages.Add($"{subscription.SubscriptionCode}: retry queued for {request.PayloadReference}.");
                continue;
            }

            subscription.MarkDelivered(DateTimeOffset.UtcNow, GetUserId());
            DbContext.WebhookEvents.Add(WebhookEvent.Create(
                request.CompanyId,
                request.BranchId,
                subscription.Id,
                null,
                "Outbound",
                request.EventType,
                null,
                null,
                request.PayloadReference,
                ComputeHash(request.PayloadReference),
                true,
                1,
                202,
                "Webhook dispatch recorded for delivery worker.",
                "Queued",
                null,
                GetUserId()));
            delivered += 1;
            messages.Add($"{subscription.SubscriptionCode}: dispatch acknowledged for {request.PayloadReference}.");
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        var result = new WebhookDispatchResultDto(request.EventType, subscriptions.Count, delivered, retryQueued, messages);
        await WriteAuditAsync("integration", nameof(WebhookSubscription), "integration.webhook.dispatch", request.CompanyId, null, result, cancellationToken);
        return result;
    }

    public async Task<PagedResult<WebhookEventDto>> ListWebhookEventsAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.WebhookEvents.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.EventType))
        {
            var eventType = filter.EventType.Trim();
            query = query.Where(entity => entity.EventType == eventType);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        var page = await query.OrderByDescending(entity => entity.EventOn).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapWebhookEvent);
    }

    public async Task<WebhookEventDto> RecordInboundWebhookAsync(string providerCode, InboundWebhookRequest request, CancellationToken cancellationToken = default)
    {
        ValidateInboundWebhook(providerCode, request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var provider = await DbContext.IntegrationProviders
            .AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.ProviderCode == providerCode.Trim(), cancellationToken);

        var providerMissing = provider is null;
        var signatureRequired = provider?.CredentialReference is not null;
        var signatureVerified = !signatureRequired || !string.IsNullOrWhiteSpace(request.Signature);
        var failureReason = providerMissing
            ? "Provider configuration was not found for this callback."
            : signatureVerified ? null : "Callback signature is required for this provider.";
        var status = failureReason is null ? "Received" : "Rejected";
        var payloadHash = ComputeHash(request.RawPayload);

        var entity = WebhookEvent.Create(
            request.CompanyId,
            request.BranchId,
            null,
            provider?.Id,
            "Inbound",
            request.EventType,
            request.SourceDocumentType,
            request.SourceDocumentId,
            request.PayloadReference,
            payloadHash,
            signatureVerified,
            1,
            status == "Received" ? 202 : 401,
            status == "Received" ? "Callback recorded for processing." : null,
            status,
            failureReason,
            GetUserId());

        DbContext.WebhookEvents.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapWebhookEvent(entity);
        await WriteAuditAsync("integration", nameof(WebhookEvent), "integration.webhook.inbound", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<IntegrationMessageTemplateDto>> ListMessageTemplatesAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.IntegrationMessageTemplates.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value || entity.CompanyId == null);
        }

        if (!string.IsNullOrWhiteSpace(filter.ChannelType))
        {
            var channel = NormalizeChannel(filter.ChannelType);
            query = query.Where(entity => entity.ChannelType == channel);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.TemplateCode.Contains(search) || entity.TemplateName.Contains(search));
        }

        var page = await query.OrderBy(entity => entity.ChannelType).ThenBy(entity => entity.TemplateCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapTemplate);
    }

    public async Task<IntegrationMessageTemplateDto> UpsertMessageTemplateAsync(IntegrationMessageTemplateUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTemplate(request);
        EnsureContextAccess(request.CompanyId, null);

        var channel = NormalizeChannel(request.ChannelType);
        var entity = await DbContext.IntegrationMessageTemplates.FirstOrDefaultAsync(record =>
            record.CompanyId == request.CompanyId &&
            record.ChannelType == channel &&
            record.TemplateCode == request.TemplateCode.Trim() &&
            record.TemplateVersion == request.TemplateVersion.Trim(),
            cancellationToken);

        object? before = null;
        if (entity is null)
        {
            entity = IntegrationMessageTemplate.Create(request.CompanyId, request.IntegrationProviderId, channel, request.TemplateCode, request.TemplateName, request.TemplateVersion, request.ApprovalStatus, request.BodyTemplate, request.Status, GetUserId());
            DbContext.IntegrationMessageTemplates.Add(entity);
        }
        else
        {
            before = MapTemplate(entity);
            entity.Update(channel, request.TemplateCode, request.TemplateName, request.TemplateVersion, request.ApprovalStatus, request.BodyTemplate, request.Status, GetUserId());
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapTemplate(entity);
        await WriteAuditAsync("integration", nameof(IntegrationMessageTemplate), "integration.template.upsert", entity.Id, before, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<CrmObjectMappingDto>> ListCrmMappingsAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.CrmObjectMappings.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value || entity.CompanyId == null);
        }

        if (filter.ProviderId.HasValue)
        {
            query = query.Where(entity => entity.IntegrationProviderId == filter.ProviderId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.ObjectType))
        {
            var objectType = filter.ObjectType.Trim();
            query = query.Where(entity => entity.ErpObjectType == objectType || entity.ExternalObjectType == objectType);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        var page = await query.OrderByDescending(entity => entity.LastSyncedAt ?? DateTimeOffset.MinValue).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapCrmMapping);
    }

    public async Task<CrmObjectMappingDto> UpsertCrmMappingAsync(CrmObjectMappingUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCrmMapping(request);
        EnsureContextAccess(request.CompanyId, null);
        await EnsureProviderExistsAsync(request.IntegrationProviderId, cancellationToken);

        var entity = await DbContext.CrmObjectMappings.FirstOrDefaultAsync(record =>
            record.CompanyId == request.CompanyId &&
            record.IntegrationProviderId == request.IntegrationProviderId &&
            record.ExternalObjectType == request.ExternalObjectType.Trim() &&
            record.ExternalId == request.ExternalId.Trim(),
            cancellationToken);

        object? before = null;
        if (entity is null)
        {
            entity = CrmObjectMapping.Create(request.CompanyId, request.IntegrationProviderId, request.ErpObjectType, request.ErpObjectId, request.ExternalObjectType, request.ExternalId, request.SyncDirection, request.ConflictStatus, request.Status, GetUserId());
            DbContext.CrmObjectMappings.Add(entity);
        }
        else
        {
            before = MapCrmMapping(entity);
            entity.Update(request.ErpObjectType, request.ErpObjectId, request.ExternalObjectType, request.ExternalId, request.SyncDirection, request.ConflictStatus, request.Status, GetUserId());
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapCrmMapping(entity);
        await WriteAuditAsync("integration", nameof(CrmObjectMapping), "integration.crm.mapping.upsert", entity.Id, before, dto, cancellationToken);
        return dto;
    }

    public async Task<CrmSyncJobDto> RunCrmSyncAsync(CrmSyncRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCrmSync(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var provider = await DbContext.IntegrationProviders.AsNoTracking().FirstOrDefaultAsync(record => record.Id == request.IntegrationProviderId, cancellationToken);
        provider = EnsureFound(provider, "CRM provider was not found.", "integration.provider_not_found");
        var configIssue = await ResolveProviderIssueAsync("CRM", request.CompanyId, request.BranchId, provider.Id, cancellationToken);

        var mapping = request.CrmObjectMappingId.HasValue
            ? await DbContext.CrmObjectMappings.AsNoTracking().FirstOrDefaultAsync(record => record.Id == request.CrmObjectMappingId.Value, cancellationToken)
            : null;

        var missingMapping = mapping is null || string.IsNullOrWhiteSpace(mapping.ExternalId);
        var failure = configIssue ?? (missingMapping ? "CRM sync requires a governed external-id mapping before execution." : null);
        var status = failure is null ? "Queued" : "Failed";
        var job = CrmSyncJob.Create(request.CompanyId, request.BranchId, request.IntegrationProviderId, mapping?.Id, request.ObjectType, request.SyncDirection, JsonSerializer.Serialize(request.Payload), status, failure, GetUserId());
        DbContext.CrmSyncJobs.Add(job);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (missingMapping)
        {
            DbContext.CrmSyncConflicts.Add(CrmSyncConflict.Create(request.CompanyId, job.Id, request.ObjectType, null, null, "MissingExternalMapping", "Open", JsonSerializer.Serialize(request.Payload), GetUserId()));
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = MapCrmSyncJob(job);
        await WriteAuditAsync("integration", nameof(CrmSyncJob), "integration.crm.sync", job.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<CrmSyncConflictDto>> ListCrmConflictsAsync(IntegrationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.CrmSyncConflicts.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value || entity.CompanyId == null);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.ResolutionStatus == status);
        }

        var page = await query.OrderByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapCrmConflict);
    }

    public async Task<ImportJobDto> UpdateImportJobStatusAsync(long id, IntegrationJobStatusUpdateRequest request, CancellationToken cancellationToken = default)
    {
        ValidateJobStatus(request);
        var scope = GetScope();
        var entity = await DbContext.ImportJobs.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Import job was not found in the active scope.", "integration.import_not_found");

        var before = MapImportJob(entity);
        entity.Update(
            entity.JobNo,
            entity.Module,
            entity.SourceFormat,
            entity.StoragePath,
            entity.RequestToken,
            request.Status.Trim(),
            ShouldCloseJob(request.Status) ? DateTimeOffset.UtcNow : entity.ProcessedOn,
            BuildJobFeedback(request),
            GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapImportJob(entity);
        await WriteAuditAsync("integration", nameof(ImportJob), "integration.import.status", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<ExportJobDto> UpdateExportJobStatusAsync(long id, IntegrationJobStatusUpdateRequest request, CancellationToken cancellationToken = default)
    {
        ValidateJobStatus(request);
        var scope = GetScope();
        var entity = await DbContext.ExportJobs.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Export job was not found in the active scope.", "integration.export_not_found");

        var before = MapExportJob(entity);
        entity.Update(
            entity.JobNo,
            entity.Module,
            entity.OutputFormat,
            entity.FilterJson,
            entity.StoragePath,
            request.Status.Trim(),
            ShouldCloseJob(request.Status) ? DateTimeOffset.UtcNow : entity.ProcessedOn,
            BuildJobFeedback(request),
            GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapExportJob(entity);
        await WriteAuditAsync("integration", nameof(ExportJob), "integration.export.status", entity.Id, before, after, cancellationToken);
        return after;
    }

    private async Task EnsureProviderExistsAsync(long providerId, CancellationToken cancellationToken)
    {
        ThrowIfInvalid(Positive(providerId, nameof(providerId), "Provider is required."));
        var exists = await DbContext.IntegrationProviders.AnyAsync(record => record.Id == providerId, cancellationToken);
        ThrowIfInvalid(!exists ? new ApiError("integration.provider_not_found", nameof(providerId), "Integration provider was not found.") : null);
    }

    private static void ValidateProvider(IntegrationProviderUpsertRequest request) =>
        ThrowIfInvalid(
            Required(request.ProviderCode, nameof(request.ProviderCode), "Provider code is required."),
            Required(request.ProviderName, nameof(request.ProviderName), "Provider name is required."),
            Required(request.ProviderType, nameof(request.ProviderType), "Provider type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.RateLimitPerMinute ?? 0, nameof(request.RateLimitPerMinute), "Rate limit cannot be negative."));

    private static void ValidateConnection(IntegrationConnectionUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.IntegrationProviderId, nameof(request.IntegrationProviderId), "Provider is required."),
            Required(request.ConnectionCode, nameof(request.ConnectionCode), "Connection code is required."),
            Required(request.ConnectionName, nameof(request.ConnectionName), "Connection name is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateWebhook(WebhookSubscriptionUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.SubscriptionCode, nameof(request.SubscriptionCode), "Subscription code is required."),
            Required(request.EventType, nameof(request.EventType), "Event type is required."),
            Required(request.TargetUrl, nameof(request.TargetUrl), "Target URL is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateImportJob(ImportJobCreateRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.JobNo, nameof(request.JobNo), "Job number is required."),
            Required(request.Module, nameof(request.Module), "Module is required."),
            Required(request.SourceFormat, nameof(request.SourceFormat), "Source format is required."),
            Required(request.StoragePath, nameof(request.StoragePath), "Storage path is required."));

    private static void ValidateExportJob(ExportJobCreateRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.JobNo, nameof(request.JobNo), "Job number is required."),
            Required(request.Module, nameof(request.Module), "Module is required."),
            Required(request.OutputFormat, nameof(request.OutputFormat), "Output format is required."),
            Required(request.StoragePath, nameof(request.StoragePath), "Storage path is required."));

    private static void ValidateWebhookDispatch(WebhookDispatchRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.EventType, nameof(request.EventType), "Event type is required."),
            Required(request.PayloadReference, nameof(request.PayloadReference), "Payload reference is required."));

    private static void ValidateInboundWebhook(string providerCode, InboundWebhookRequest request) =>
        ThrowIfInvalid(
            Required(providerCode, nameof(providerCode), "Provider code is required."),
            Required(request.EventType, nameof(request.EventType), "Event type is required."),
            Required(request.PayloadReference, nameof(request.PayloadReference), "Payload reference is required."),
            Required(request.RawPayload, nameof(request.RawPayload), "Raw payload is required."));

    private static void ValidateTemplate(IntegrationMessageTemplateUpsertRequest request) =>
        ThrowIfInvalid(
            Required(request.ChannelType, nameof(request.ChannelType), "Channel is required."),
            Required(request.TemplateCode, nameof(request.TemplateCode), "Template code is required."),
            Required(request.TemplateName, nameof(request.TemplateName), "Template name is required."),
            Required(request.TemplateVersion, nameof(request.TemplateVersion), "Template version is required."),
            Required(request.ApprovalStatus, nameof(request.ApprovalStatus), "Approval status is required."),
            Required(request.BodyTemplate, nameof(request.BodyTemplate), "Template body is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateCrmMapping(CrmObjectMappingUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.IntegrationProviderId, nameof(request.IntegrationProviderId), "Provider is required."),
            Required(request.ErpObjectType, nameof(request.ErpObjectType), "ERP object type is required."),
            Required(request.ExternalObjectType, nameof(request.ExternalObjectType), "External object type is required."),
            Required(request.ExternalId, nameof(request.ExternalId), "External ID is required."),
            Required(request.SyncDirection, nameof(request.SyncDirection), "Sync direction is required."),
            Required(request.ConflictStatus, nameof(request.ConflictStatus), "Conflict status is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateCrmSync(CrmSyncRequest request) =>
        ThrowIfInvalid(
            Positive(request.IntegrationProviderId, nameof(request.IntegrationProviderId), "CRM provider is required."),
            Required(request.ObjectType, nameof(request.ObjectType), "CRM object type is required."),
            Required(request.SyncDirection, nameof(request.SyncDirection), "Sync direction is required."));

    private static void ValidateJobStatus(IntegrationJobStatusUpdateRequest request) =>
        ThrowIfInvalid(
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.FailedRowCount ?? 0, nameof(request.FailedRowCount), "Failed row count cannot be negative."));

    private static bool ShouldCloseJob(string status) =>
        status.Equals("Processed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Failed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Rejected", StringComparison.OrdinalIgnoreCase);

    private async Task<string?> ResolveProviderIssueAsync(string channelType, long? companyId, long? branchId, long? providerId, CancellationToken cancellationToken)
    {
        var channel = NormalizeChannel(channelType);
        var provider = providerId.HasValue
            ? await DbContext.IntegrationProviders.AsNoTracking().FirstOrDefaultAsync(record => record.Id == providerId.Value, cancellationToken)
            : await DbContext.IntegrationProviders.AsNoTracking()
                .OrderBy(record => record.ProviderCode)
                .FirstOrDefaultAsync(record => record.Channel == channel || record.ProviderType == channel, cancellationToken);

        if (provider is null)
        {
            return $"No {channel} provider is configured.";
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
            return $"{provider.ProviderCode} requires a credential reference before live sync.";
        }

        return null;
    }

    private static string NormalizeChannel(string channelType) =>
        channelType.Trim().Equals("SMS", StringComparison.OrdinalIgnoreCase) ? "Sms" : channelType.Trim();

    private static string ComputeHash(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static string? BuildJobFeedback(IntegrationJobStatusUpdateRequest request)
    {
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(request.LastError))
        {
            parts.Add(request.LastError.Trim());
        }

        if (request.FailedRowCount.HasValue && request.FailedRowCount.Value > 0)
        {
            parts.Add($"{request.FailedRowCount.Value} failed row(s).");
        }

        if (!string.IsNullOrWhiteSpace(request.FailureSummary))
        {
            parts.Add(request.FailureSummary.Trim());
        }

        if (parts.Count == 0)
        {
            return null;
        }

        var feedback = string.Join(" ", parts);
        return feedback.Length <= 512 ? feedback : feedback[..512];
    }

    private static IntegrationProviderDto MapProvider(IntegrationProvider entity) =>
        new(
            entity.Id,
            entity.ProviderCode,
            entity.ProviderName,
            entity.ProviderType,
            string.IsNullOrWhiteSpace(entity.Channel) ? entity.ProviderType : entity.Channel,
            string.IsNullOrWhiteSpace(entity.VendorType) ? entity.ProviderType : entity.VendorType,
            string.IsNullOrWhiteSpace(entity.EnvironmentName) ? "Production" : entity.EnvironmentName,
            entity.BaseUrl,
            MaskSecretReference(entity.CredentialReference),
            entity.SenderIdentity,
            entity.WhatsAppBusinessNumber,
            entity.TemplateNamespace,
            entity.CrmTenantReference,
            entity.CallbackUrl,
            entity.RateLimitPerMinute,
            entity.Status,
            string.IsNullOrWhiteSpace(entity.HealthStatus) ? "Unverified" : entity.HealthStatus,
            entity.LastVerifiedAt,
            entity.FailureReason,
            entity.IsSystemBase);

    private static IntegrationConnectionDto MapConnection(IntegrationConnection entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.IntegrationProviderId, entity.ConnectionCode, entity.ConnectionName, entity.EndpointUrl, MaskSecretReference(entity.CredentialReference), entity.Status, entity.LastHealthCheckedOn, entity.LastHealthStatus);

    private static WebhookSubscriptionDto MapWebhook(WebhookSubscription entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.SubscriptionCode, entity.EventType, entity.TargetUrl, MaskSecretReference(entity.SecretReference), MaskHeadersJson(entity.HeadersJson), entity.Status, entity.LastDeliveredOn, entity.RetryQueuedOn);

    private static ImportJobDto MapImportJob(ImportJob entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.JobNo, entity.Module, entity.SourceFormat, entity.StoragePath, entity.RequestToken, entity.Status, entity.RequestedOn, entity.ProcessedOn, entity.LastError);

    private static ExportJobDto MapExportJob(ExportJob entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.JobNo, entity.Module, entity.OutputFormat, entity.FilterJson, entity.StoragePath, entity.Status, entity.RequestedOn, entity.ProcessedOn, entity.LastError);

    private static IntegrationMessageTemplateDto MapTemplate(IntegrationMessageTemplate entity) =>
        new(entity.Id, entity.CompanyId, entity.IntegrationProviderId, entity.ChannelType, entity.TemplateCode, entity.TemplateName, entity.TemplateVersion, entity.ApprovalStatus, entity.BodyTemplate, entity.Status);

    private static WebhookEventDto MapWebhookEvent(WebhookEvent entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.WebhookSubscriptionId, entity.IntegrationProviderId, entity.Direction, entity.EventType, entity.SourceDocumentType, entity.SourceDocumentId, entity.PayloadReference, entity.PayloadHash, entity.SignatureVerified, entity.AttemptCount, entity.ResponseCode, entity.ResponseSummary, entity.Status, entity.FailureReason, entity.EventOn);

    private static CrmObjectMappingDto MapCrmMapping(CrmObjectMapping entity) =>
        new(entity.Id, entity.CompanyId, entity.IntegrationProviderId, entity.ErpObjectType, entity.ErpObjectId, entity.ExternalObjectType, entity.ExternalId, entity.SyncDirection, entity.ConflictStatus, entity.LastSyncedAt, entity.Status);

    private static CrmSyncJobDto MapCrmSyncJob(CrmSyncJob entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.IntegrationProviderId, entity.CrmObjectMappingId, entity.ObjectType, entity.SyncDirection, entity.PayloadSnapshotJson, entity.Status, entity.FailureReason, entity.RequestedOn, entity.CompletedOn);

    private static CrmSyncConflictDto MapCrmConflict(CrmSyncConflict entity) =>
        new(entity.Id, entity.CompanyId, entity.CrmSyncJobId, entity.ObjectType, entity.ErpObjectId, entity.ExternalId, entity.ConflictType, entity.ResolutionStatus, entity.DetailsJson);

    private static string? MaskSecretReference(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();
        if (trimmed.Length <= 8)
        {
            return "masked";
        }

        return $"{trimmed[..4]}...{trimmed[^4..]}";
    }

    private static string? MaskHeadersJson(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        try
        {
            var headers = JsonSerializer.Deserialize<Dictionary<string, string>>(value);
            if (headers is null)
            {
                return value;
            }

            var masked = headers.ToDictionary(entry => entry.Key, entry => MaskSecretReference(entry.Value) ?? "masked");
            return JsonSerializer.Serialize(masked);
        }
        catch (JsonException)
        {
            return value.Contains("secret", StringComparison.OrdinalIgnoreCase) ||
                value.Contains("token", StringComparison.OrdinalIgnoreCase) ||
                value.Contains("authorization", StringComparison.OrdinalIgnoreCase)
                    ? "masked"
                    : value;
        }
    }
}
