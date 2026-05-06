using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Integration;

public sealed class IntegrationProvider : AuditableEntity
{
    private IntegrationProvider()
    {
    }

    public string ProviderCode { get; private set; } = string.Empty;
    public string ProviderName { get; private set; } = string.Empty;
    public string ProviderType { get; private set; } = string.Empty;
    public string? BaseUrl { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public bool IsSystemBase { get; private set; }

    public static IntegrationProvider Create(string providerCode, string providerName, string providerType, string? baseUrl, string status, bool isSystemBase, long? userId)
    {
        var entity = new IntegrationProvider();
        entity.Update(providerCode, providerName, providerType, baseUrl, status, isSystemBase, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string providerCode, string providerName, string providerType, string? baseUrl, string status, bool isSystemBase, long? userId)
    {
        ProviderCode = providerCode.Trim();
        ProviderName = providerName.Trim();
        ProviderType = providerType.Trim();
        BaseUrl = string.IsNullOrWhiteSpace(baseUrl) ? null : baseUrl.Trim();
        Status = status.Trim();
        IsSystemBase = isSystemBase;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class IntegrationConnection : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private IntegrationConnection()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long IntegrationProviderId { get; private set; }
    public string ConnectionCode { get; private set; } = string.Empty;
    public string ConnectionName { get; private set; } = string.Empty;
    public string? EndpointUrl { get; private set; }
    public string? CredentialReference { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset? LastHealthCheckedOn { get; private set; }
    public string? LastHealthStatus { get; private set; }

    public static IntegrationConnection Create(long companyId, long? branchId, long integrationProviderId, string connectionCode, string connectionName, string? endpointUrl, string? credentialReference, string status, long? userId)
    {
        var entity = new IntegrationConnection { CompanyId = companyId, BranchId = branchId, IntegrationProviderId = integrationProviderId };
        entity.Update(connectionCode, connectionName, endpointUrl, credentialReference, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string connectionCode, string connectionName, string? endpointUrl, string? credentialReference, string status, long? userId)
    {
        ConnectionCode = connectionCode.Trim();
        ConnectionName = connectionName.Trim();
        EndpointUrl = string.IsNullOrWhiteSpace(endpointUrl) ? null : endpointUrl.Trim();
        CredentialReference = string.IsNullOrWhiteSpace(credentialReference) ? null : credentialReference.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void UpdateHealth(DateTimeOffset checkedOn, string? healthStatus, long? userId)
    {
        LastHealthCheckedOn = checkedOn;
        LastHealthStatus = string.IsNullOrWhiteSpace(healthStatus) ? null : healthStatus.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class WebhookSubscription : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private WebhookSubscription()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string SubscriptionCode { get; private set; } = string.Empty;
    public string EventType { get; private set; } = string.Empty;
    public string TargetUrl { get; private set; } = string.Empty;
    public string? SecretReference { get; private set; }
    public string? HeadersJson { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset? LastDeliveredOn { get; private set; }
    public DateTimeOffset? RetryQueuedOn { get; private set; }

    public static WebhookSubscription Create(long companyId, long? branchId, string subscriptionCode, string eventType, string targetUrl, string? secretReference, string? headersJson, string status, long? userId)
    {
        var entity = new WebhookSubscription { CompanyId = companyId, BranchId = branchId };
        entity.Update(subscriptionCode, eventType, targetUrl, secretReference, headersJson, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string subscriptionCode, string eventType, string targetUrl, string? secretReference, string? headersJson, string status, long? userId)
    {
        SubscriptionCode = subscriptionCode.Trim();
        EventType = eventType.Trim();
        TargetUrl = targetUrl.Trim();
        SecretReference = string.IsNullOrWhiteSpace(secretReference) ? null : secretReference.Trim();
        HeadersJson = string.IsNullOrWhiteSpace(headersJson) ? null : headersJson.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkDelivered(DateTimeOffset deliveredOn, long? userId)
    {
        LastDeliveredOn = deliveredOn;
        RetryQueuedOn = null;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkRetryQueued(DateTimeOffset queuedOn, long? userId)
    {
        RetryQueuedOn = queuedOn;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ImportJob : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ImportJob()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string JobNo { get; private set; } = string.Empty;
    public string Module { get; private set; } = string.Empty;
    public string SourceFormat { get; private set; } = string.Empty;
    public string StoragePath { get; private set; } = string.Empty;
    public string? RequestToken { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset RequestedOn { get; private set; }
    public DateTimeOffset? ProcessedOn { get; private set; }
    public string? LastError { get; private set; }

    public static ImportJob Create(long companyId, long branchId, string jobNo, string module, string sourceFormat, string storagePath, string? requestToken, string status, long? userId)
    {
        var entity = new ImportJob { CompanyId = companyId, BranchId = branchId };
        entity.Update(jobNo, module, sourceFormat, storagePath, requestToken, status, null, null, userId);
        entity.RequestedOn = DateTimeOffset.UtcNow;
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string jobNo, string module, string sourceFormat, string storagePath, string? requestToken, string status, DateTimeOffset? processedOn, string? lastError, long? userId)
    {
        JobNo = jobNo.Trim();
        Module = module.Trim();
        SourceFormat = sourceFormat.Trim();
        StoragePath = storagePath.Trim();
        RequestToken = string.IsNullOrWhiteSpace(requestToken) ? null : requestToken.Trim();
        Status = status.Trim();
        ProcessedOn = processedOn;
        LastError = string.IsNullOrWhiteSpace(lastError) ? null : lastError.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ExportJob : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ExportJob()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string JobNo { get; private set; } = string.Empty;
    public string Module { get; private set; } = string.Empty;
    public string OutputFormat { get; private set; } = string.Empty;
    public string? FilterJson { get; private set; }
    public string StoragePath { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset RequestedOn { get; private set; }
    public DateTimeOffset? ProcessedOn { get; private set; }
    public string? LastError { get; private set; }

    public static ExportJob Create(long companyId, long branchId, string jobNo, string module, string outputFormat, string? filterJson, string storagePath, string status, long? userId)
    {
        var entity = new ExportJob { CompanyId = companyId, BranchId = branchId };
        entity.Update(jobNo, module, outputFormat, filterJson, storagePath, status, null, null, userId);
        entity.RequestedOn = DateTimeOffset.UtcNow;
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string jobNo, string module, string outputFormat, string? filterJson, string storagePath, string status, DateTimeOffset? processedOn, string? lastError, long? userId)
    {
        JobNo = jobNo.Trim();
        Module = module.Trim();
        OutputFormat = outputFormat.Trim();
        FilterJson = string.IsNullOrWhiteSpace(filterJson) ? null : filterJson.Trim();
        StoragePath = storagePath.Trim();
        Status = status.Trim();
        ProcessedOn = processedOn;
        LastError = string.IsNullOrWhiteSpace(lastError) ? null : lastError.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
