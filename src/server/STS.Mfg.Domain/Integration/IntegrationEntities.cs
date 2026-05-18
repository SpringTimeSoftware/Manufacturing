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
    public string Channel { get; private set; } = string.Empty;
    public string VendorType { get; private set; } = string.Empty;
    public string EnvironmentName { get; private set; } = string.Empty;
    public string? BaseUrl { get; private set; }
    public string? CredentialReference { get; private set; }
    public string? SenderIdentity { get; private set; }
    public string? WhatsAppBusinessNumber { get; private set; }
    public string? TemplateNamespace { get; private set; }
    public string? CrmTenantReference { get; private set; }
    public string? CallbackUrl { get; private set; }
    public int? RateLimitPerMinute { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string HealthStatus { get; private set; } = string.Empty;
    public DateTimeOffset? LastVerifiedAt { get; private set; }
    public string? FailureReason { get; private set; }
    public bool IsSystemBase { get; private set; }

    public static IntegrationProvider Create(string providerCode, string providerName, string providerType, string? baseUrl, string status, bool isSystemBase, long? userId)
    {
        var entity = new IntegrationProvider();
        entity.Update(
            providerCode,
            providerName,
            providerType,
            providerType,
            providerType,
            "Production",
            baseUrl,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            status,
            "Unverified",
            null,
            null,
            isSystemBase,
            userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string providerCode, string providerName, string providerType, string? baseUrl, string status, bool isSystemBase, long? userId)
    {
        Update(
            providerCode,
            providerName,
            providerType,
            string.IsNullOrWhiteSpace(Channel) ? providerType : Channel,
            string.IsNullOrWhiteSpace(VendorType) ? providerType : VendorType,
            string.IsNullOrWhiteSpace(EnvironmentName) ? "Production" : EnvironmentName,
            baseUrl,
            CredentialReference,
            SenderIdentity,
            WhatsAppBusinessNumber,
            TemplateNamespace,
            CrmTenantReference,
            CallbackUrl,
            RateLimitPerMinute,
            status,
            string.IsNullOrWhiteSpace(HealthStatus) ? "Unverified" : HealthStatus,
            LastVerifiedAt,
            FailureReason,
            isSystemBase,
            userId);
    }

    public void Update(
        string providerCode,
        string providerName,
        string providerType,
        string channel,
        string vendorType,
        string environmentName,
        string? baseUrl,
        string? credentialReference,
        string? senderIdentity,
        string? whatsAppBusinessNumber,
        string? templateNamespace,
        string? crmTenantReference,
        string? callbackUrl,
        int? rateLimitPerMinute,
        string status,
        string healthStatus,
        DateTimeOffset? lastVerifiedAt,
        string? failureReason,
        bool isSystemBase,
        long? userId)
    {
        ProviderCode = providerCode.Trim();
        ProviderName = providerName.Trim();
        ProviderType = providerType.Trim();
        Channel = string.IsNullOrWhiteSpace(channel) ? ProviderType : channel.Trim();
        VendorType = string.IsNullOrWhiteSpace(vendorType) ? ProviderType : vendorType.Trim();
        EnvironmentName = string.IsNullOrWhiteSpace(environmentName) ? "Production" : environmentName.Trim();
        BaseUrl = string.IsNullOrWhiteSpace(baseUrl) ? null : baseUrl.Trim();
        CredentialReference = string.IsNullOrWhiteSpace(credentialReference) ? null : credentialReference.Trim();
        SenderIdentity = string.IsNullOrWhiteSpace(senderIdentity) ? null : senderIdentity.Trim();
        WhatsAppBusinessNumber = string.IsNullOrWhiteSpace(whatsAppBusinessNumber) ? null : whatsAppBusinessNumber.Trim();
        TemplateNamespace = string.IsNullOrWhiteSpace(templateNamespace) ? null : templateNamespace.Trim();
        CrmTenantReference = string.IsNullOrWhiteSpace(crmTenantReference) ? null : crmTenantReference.Trim();
        CallbackUrl = string.IsNullOrWhiteSpace(callbackUrl) ? null : callbackUrl.Trim();
        RateLimitPerMinute = rateLimitPerMinute;
        Status = status.Trim();
        HealthStatus = string.IsNullOrWhiteSpace(healthStatus) ? "Unverified" : healthStatus.Trim();
        LastVerifiedAt = lastVerifiedAt;
        FailureReason = string.IsNullOrWhiteSpace(failureReason) ? null : failureReason.Trim();
        IsSystemBase = isSystemBase;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class IntegrationMessageTemplate : AuditableEntity, ICompanyScoped
{
    private IntegrationMessageTemplate()
    {
    }

    public long? CompanyId { get; private set; }
    public long? IntegrationProviderId { get; private set; }
    public string ChannelType { get; private set; } = string.Empty;
    public string TemplateCode { get; private set; } = string.Empty;
    public string TemplateName { get; private set; } = string.Empty;
    public string TemplateVersion { get; private set; } = string.Empty;
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string BodyTemplate { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static IntegrationMessageTemplate Create(long? companyId, long? integrationProviderId, string channelType, string templateCode, string templateName, string templateVersion, string approvalStatus, string bodyTemplate, string status, long? userId)
    {
        var entity = new IntegrationMessageTemplate { CompanyId = companyId, IntegrationProviderId = integrationProviderId };
        entity.Update(channelType, templateCode, templateName, templateVersion, approvalStatus, bodyTemplate, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string channelType, string templateCode, string templateName, string templateVersion, string approvalStatus, string bodyTemplate, string status, long? userId)
    {
        ChannelType = channelType.Trim();
        TemplateCode = templateCode.Trim();
        TemplateName = templateName.Trim();
        TemplateVersion = templateVersion.Trim();
        ApprovalStatus = approvalStatus.Trim();
        BodyTemplate = bodyTemplate.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class IntegrationOutboundMessage : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private IntegrationOutboundMessage()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ChannelType { get; private set; } = string.Empty;
    public long? IntegrationProviderId { get; private set; }
    public string? SourceModule { get; private set; }
    public string? SourceDocumentType { get; private set; }
    public long? SourceDocumentId { get; private set; }
    public string? SourceDocumentNo { get; private set; }
    public string Recipient { get; private set; } = string.Empty;
    public string RecipientType { get; private set; } = string.Empty;
    public string TemplateCode { get; private set; } = string.Empty;
    public string? Subject { get; private set; }
    public string PayloadSnapshotJson { get; private set; } = string.Empty;
    public string BodySnapshot { get; private set; } = string.Empty;
    public long? ReportOutputId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? ProviderMessageId { get; private set; }
    public int AttemptCount { get; private set; }
    public DateTimeOffset? LastAttemptedAt { get; private set; }
    public DateTimeOffset? NextRetryAt { get; private set; }
    public string? FailureReason { get; private set; }
    public string? DeliveryReceiptStatus { get; private set; }

    public static IntegrationOutboundMessage Create(
        long? companyId,
        long? branchId,
        string channelType,
        long? integrationProviderId,
        string? sourceModule,
        string? sourceDocumentType,
        long? sourceDocumentId,
        string? sourceDocumentNo,
        string recipient,
        string recipientType,
        string templateCode,
        string? subject,
        string payloadSnapshotJson,
        string bodySnapshot,
        long? reportOutputId,
        string status,
        string? failureReason,
        long? userId)
    {
        var entity = new IntegrationOutboundMessage
        {
            CompanyId = companyId,
            BranchId = branchId,
            ChannelType = channelType.Trim(),
            IntegrationProviderId = integrationProviderId,
            SourceModule = string.IsNullOrWhiteSpace(sourceModule) ? null : sourceModule.Trim(),
            SourceDocumentType = string.IsNullOrWhiteSpace(sourceDocumentType) ? null : sourceDocumentType.Trim(),
            SourceDocumentId = sourceDocumentId,
            SourceDocumentNo = string.IsNullOrWhiteSpace(sourceDocumentNo) ? null : sourceDocumentNo.Trim(),
            Recipient = recipient.Trim(),
            RecipientType = string.IsNullOrWhiteSpace(recipientType) ? "External" : recipientType.Trim(),
            TemplateCode = templateCode.Trim(),
            Subject = string.IsNullOrWhiteSpace(subject) ? null : subject.Trim(),
            PayloadSnapshotJson = payloadSnapshotJson,
            BodySnapshot = bodySnapshot,
            ReportOutputId = reportOutputId,
            Status = status.Trim(),
            FailureReason = string.IsNullOrWhiteSpace(failureReason) ? null : failureReason.Trim(),
            DeliveryReceiptStatus = status.Trim(),
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId,
            ModifiedOn = DateTimeOffset.UtcNow,
            ModifiedByUserId = userId
        };

        if (status.Equals("Failed", StringComparison.OrdinalIgnoreCase))
        {
            entity.AttemptCount = 1;
            entity.LastAttemptedAt = DateTimeOffset.UtcNow;
        }

        return entity;
    }

    public void QueueRetry(string? failureReason, long? userId)
    {
        AttemptCount += 1;
        LastAttemptedAt = DateTimeOffset.UtcNow;
        NextRetryAt = DateTimeOffset.UtcNow.AddMinutes(Math.Min(60, Math.Max(5, AttemptCount * 5)));
        Status = string.IsNullOrWhiteSpace(failureReason) ? "Queued" : "Failed";
        FailureReason = string.IsNullOrWhiteSpace(failureReason) ? null : failureReason.Trim();
        DeliveryReceiptStatus = Status;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class IntegrationDeliveryEvent : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private IntegrationDeliveryEvent()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long IntegrationOutboundMessageId { get; private set; }
    public string EventType { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string? ProviderMessageId { get; private set; }
    public int? ResponseCode { get; private set; }
    public string? ResponseSummary { get; private set; }
    public string? FailureReason { get; private set; }
    public DateTimeOffset EventOn { get; private set; }

    public static IntegrationDeliveryEvent Create(long? companyId, long? branchId, long messageId, string eventType, string status, string? providerMessageId, int? responseCode, string? responseSummary, string? failureReason, long? userId)
    {
        return new IntegrationDeliveryEvent
        {
            CompanyId = companyId,
            BranchId = branchId,
            IntegrationOutboundMessageId = messageId,
            EventType = eventType.Trim(),
            Status = status.Trim(),
            ProviderMessageId = string.IsNullOrWhiteSpace(providerMessageId) ? null : providerMessageId.Trim(),
            ResponseCode = responseCode,
            ResponseSummary = string.IsNullOrWhiteSpace(responseSummary) ? null : responseSummary.Trim(),
            FailureReason = string.IsNullOrWhiteSpace(failureReason) ? null : failureReason.Trim(),
            EventOn = DateTimeOffset.UtcNow,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId,
            ModifiedOn = DateTimeOffset.UtcNow,
            ModifiedByUserId = userId
        };
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

public sealed class WebhookEvent : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private WebhookEvent()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WebhookSubscriptionId { get; private set; }
    public long? IntegrationProviderId { get; private set; }
    public string Direction { get; private set; } = string.Empty;
    public string EventType { get; private set; } = string.Empty;
    public string? SourceDocumentType { get; private set; }
    public long? SourceDocumentId { get; private set; }
    public string PayloadReference { get; private set; } = string.Empty;
    public string PayloadHash { get; private set; } = string.Empty;
    public bool SignatureVerified { get; private set; }
    public int AttemptCount { get; private set; }
    public int? ResponseCode { get; private set; }
    public string? ResponseSummary { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? FailureReason { get; private set; }
    public DateTimeOffset EventOn { get; private set; }

    public static WebhookEvent Create(
        long? companyId,
        long? branchId,
        long? webhookSubscriptionId,
        long? integrationProviderId,
        string direction,
        string eventType,
        string? sourceDocumentType,
        long? sourceDocumentId,
        string payloadReference,
        string payloadHash,
        bool signatureVerified,
        int attemptCount,
        int? responseCode,
        string? responseSummary,
        string status,
        string? failureReason,
        long? userId)
    {
        return new WebhookEvent
        {
            CompanyId = companyId,
            BranchId = branchId,
            WebhookSubscriptionId = webhookSubscriptionId,
            IntegrationProviderId = integrationProviderId,
            Direction = direction.Trim(),
            EventType = eventType.Trim(),
            SourceDocumentType = string.IsNullOrWhiteSpace(sourceDocumentType) ? null : sourceDocumentType.Trim(),
            SourceDocumentId = sourceDocumentId,
            PayloadReference = payloadReference.Trim(),
            PayloadHash = payloadHash.Trim(),
            SignatureVerified = signatureVerified,
            AttemptCount = attemptCount,
            ResponseCode = responseCode,
            ResponseSummary = string.IsNullOrWhiteSpace(responseSummary) ? null : responseSummary.Trim(),
            Status = status.Trim(),
            FailureReason = string.IsNullOrWhiteSpace(failureReason) ? null : failureReason.Trim(),
            EventOn = DateTimeOffset.UtcNow,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId,
            ModifiedOn = DateTimeOffset.UtcNow,
            ModifiedByUserId = userId
        };
    }
}

public sealed class CrmObjectMapping : AuditableEntity, ICompanyScoped
{
    private CrmObjectMapping()
    {
    }

    public long? CompanyId { get; private set; }
    public long IntegrationProviderId { get; private set; }
    public string ErpObjectType { get; private set; } = string.Empty;
    public long? ErpObjectId { get; private set; }
    public string ExternalObjectType { get; private set; } = string.Empty;
    public string ExternalId { get; private set; } = string.Empty;
    public string SyncDirection { get; private set; } = string.Empty;
    public string ConflictStatus { get; private set; } = string.Empty;
    public DateTimeOffset? LastSyncedAt { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static CrmObjectMapping Create(long? companyId, long integrationProviderId, string erpObjectType, long? erpObjectId, string externalObjectType, string externalId, string syncDirection, string conflictStatus, string status, long? userId)
    {
        var entity = new CrmObjectMapping { CompanyId = companyId, IntegrationProviderId = integrationProviderId };
        entity.Update(erpObjectType, erpObjectId, externalObjectType, externalId, syncDirection, conflictStatus, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string erpObjectType, long? erpObjectId, string externalObjectType, string externalId, string syncDirection, string conflictStatus, string status, long? userId)
    {
        ErpObjectType = erpObjectType.Trim();
        ErpObjectId = erpObjectId;
        ExternalObjectType = externalObjectType.Trim();
        ExternalId = externalId.Trim();
        SyncDirection = syncDirection.Trim();
        ConflictStatus = conflictStatus.Trim();
        Status = status.Trim();
        LastSyncedAt = conflictStatus.Equals("None", StringComparison.OrdinalIgnoreCase) ? DateTimeOffset.UtcNow : LastSyncedAt;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class CrmSyncJob : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private CrmSyncJob()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long IntegrationProviderId { get; private set; }
    public long? CrmObjectMappingId { get; private set; }
    public string ObjectType { get; private set; } = string.Empty;
    public string SyncDirection { get; private set; } = string.Empty;
    public string PayloadSnapshotJson { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string? FailureReason { get; private set; }
    public DateTimeOffset RequestedOn { get; private set; }
    public DateTimeOffset? CompletedOn { get; private set; }

    public static CrmSyncJob Create(long? companyId, long? branchId, long integrationProviderId, long? crmObjectMappingId, string objectType, string syncDirection, string payloadSnapshotJson, string status, string? failureReason, long? userId)
    {
        return new CrmSyncJob
        {
            CompanyId = companyId,
            BranchId = branchId,
            IntegrationProviderId = integrationProviderId,
            CrmObjectMappingId = crmObjectMappingId,
            ObjectType = objectType.Trim(),
            SyncDirection = syncDirection.Trim(),
            PayloadSnapshotJson = payloadSnapshotJson,
            Status = status.Trim(),
            FailureReason = string.IsNullOrWhiteSpace(failureReason) ? null : failureReason.Trim(),
            RequestedOn = DateTimeOffset.UtcNow,
            CompletedOn = status.Equals("Failed", StringComparison.OrdinalIgnoreCase) || status.Equals("Completed", StringComparison.OrdinalIgnoreCase) ? DateTimeOffset.UtcNow : null,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId,
            ModifiedOn = DateTimeOffset.UtcNow,
            ModifiedByUserId = userId
        };
    }
}

public sealed class CrmSyncConflict : AuditableEntity, ICompanyScoped
{
    private CrmSyncConflict()
    {
    }

    public long? CompanyId { get; private set; }
    public long CrmSyncJobId { get; private set; }
    public string ObjectType { get; private set; } = string.Empty;
    public long? ErpObjectId { get; private set; }
    public string? ExternalId { get; private set; }
    public string ConflictType { get; private set; } = string.Empty;
    public string ResolutionStatus { get; private set; } = string.Empty;
    public string DetailsJson { get; private set; } = string.Empty;

    public static CrmSyncConflict Create(long? companyId, long crmSyncJobId, string objectType, long? erpObjectId, string? externalId, string conflictType, string resolutionStatus, string detailsJson, long? userId)
    {
        return new CrmSyncConflict
        {
            CompanyId = companyId,
            CrmSyncJobId = crmSyncJobId,
            ObjectType = objectType.Trim(),
            ErpObjectId = erpObjectId,
            ExternalId = string.IsNullOrWhiteSpace(externalId) ? null : externalId.Trim(),
            ConflictType = conflictType.Trim(),
            ResolutionStatus = resolutionStatus.Trim(),
            DetailsJson = detailsJson,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId,
            ModifiedOn = DateTimeOffset.UtcNow,
            ModifiedByUserId = userId
        };
    }
}
