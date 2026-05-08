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
        entity.Update(request.ProviderCode, request.ProviderName, request.ProviderType, request.BaseUrl, request.Status, request.IsSystemBase, GetUserId());
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
                retryQueued += 1;
                messages.Add($"{subscription.SubscriptionCode}: retry queued for {request.PayloadReference}.");
                continue;
            }

            subscription.MarkDelivered(DateTimeOffset.UtcNow, GetUserId());
            delivered += 1;
            messages.Add($"{subscription.SubscriptionCode}: dispatch acknowledged for {request.PayloadReference}.");
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        var result = new WebhookDispatchResultDto(request.EventType, subscriptions.Count, delivered, retryQueued, messages);
        await WriteAuditAsync("integration", nameof(WebhookSubscription), "integration.webhook.dispatch", request.CompanyId, null, result, cancellationToken);
        return result;
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
            Required(request.Status, nameof(request.Status), "Status is required."));

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

    private static void ValidateJobStatus(IntegrationJobStatusUpdateRequest request) =>
        ThrowIfInvalid(
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.FailedRowCount ?? 0, nameof(request.FailedRowCount), "Failed row count cannot be negative."));

    private static bool ShouldCloseJob(string status) =>
        status.Equals("Processed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Failed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Rejected", StringComparison.OrdinalIgnoreCase);

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
        new(entity.Id, entity.ProviderCode, entity.ProviderName, entity.ProviderType, entity.BaseUrl, entity.Status, entity.IsSystemBase);

    private static IntegrationConnectionDto MapConnection(IntegrationConnection entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.IntegrationProviderId, entity.ConnectionCode, entity.ConnectionName, entity.EndpointUrl, MaskSecretReference(entity.CredentialReference), entity.Status, entity.LastHealthCheckedOn, entity.LastHealthStatus);

    private static WebhookSubscriptionDto MapWebhook(WebhookSubscription entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.SubscriptionCode, entity.EventType, entity.TargetUrl, MaskSecretReference(entity.SecretReference), MaskHeadersJson(entity.HeadersJson), entity.Status, entity.LastDeliveredOn, entity.RetryQueuedOn);

    private static ImportJobDto MapImportJob(ImportJob entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.JobNo, entity.Module, entity.SourceFormat, entity.StoragePath, entity.RequestToken, entity.Status, entity.RequestedOn, entity.ProcessedOn, entity.LastError);

    private static ExportJobDto MapExportJob(ExportJob entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.JobNo, entity.Module, entity.OutputFormat, entity.FilterJson, entity.StoragePath, entity.Status, entity.RequestedOn, entity.ProcessedOn, entity.LastError);

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
