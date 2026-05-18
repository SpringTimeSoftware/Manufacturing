using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Integration;

public sealed record IntegrationFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? ProviderId = null,
    string? ProviderType = null,
    string? ChannelType = null,
    string? EventType = null,
    string? ObjectType = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record IntegrationProviderDto(
    long Id,
    string ProviderCode,
    string ProviderName,
    string ProviderType,
    string Channel,
    string VendorType,
    string EnvironmentName,
    string? BaseUrl,
    string? CredentialReference,
    string? SenderIdentity,
    string? WhatsAppBusinessNumber,
    string? TemplateNamespace,
    string? CrmTenantReference,
    string? CallbackUrl,
    int? RateLimitPerMinute,
    string Status,
    string HealthStatus,
    DateTimeOffset? LastVerifiedAt,
    string? FailureReason,
    bool IsSystemBase);

public sealed record IntegrationProviderUpsertRequest(
    string ProviderCode,
    string ProviderName,
    string ProviderType,
    string? BaseUrl,
    string Status,
    bool IsSystemBase = false,
    string? Channel = null,
    string? VendorType = null,
    string? EnvironmentName = null,
    string? CredentialReference = null,
    string? SenderIdentity = null,
    string? WhatsAppBusinessNumber = null,
    string? TemplateNamespace = null,
    string? CrmTenantReference = null,
    string? CallbackUrl = null,
    int? RateLimitPerMinute = null,
    string? HealthStatus = null,
    DateTimeOffset? LastVerifiedAt = null,
    string? FailureReason = null);

public sealed record IntegrationConnectionDto(long Id, long CompanyId, long? BranchId, long IntegrationProviderId, string ConnectionCode, string ConnectionName, string? EndpointUrl, string? CredentialReference, string Status, DateTimeOffset? LastHealthCheckedOn, string? LastHealthStatus);
public sealed record IntegrationConnectionUpsertRequest(long CompanyId, long? BranchId, long IntegrationProviderId, string ConnectionCode, string ConnectionName, string? EndpointUrl, string? CredentialReference, string Status);

public sealed record WebhookSubscriptionDto(long Id, long CompanyId, long? BranchId, string SubscriptionCode, string EventType, string TargetUrl, string? SecretReference, string? HeadersJson, string Status, DateTimeOffset? LastDeliveredOn, DateTimeOffset? RetryQueuedOn);
public sealed record WebhookSubscriptionUpsertRequest(long CompanyId, long? BranchId, string SubscriptionCode, string EventType, string TargetUrl, string? SecretReference, string? HeadersJson, string Status);

public sealed record ImportJobDto(long Id, long CompanyId, long BranchId, string JobNo, string Module, string SourceFormat, string StoragePath, string? RequestToken, string Status, DateTimeOffset RequestedOn, DateTimeOffset? ProcessedOn, string? LastError);
public sealed record ImportJobCreateRequest(long CompanyId, long BranchId, string JobNo, string Module, string SourceFormat, string StoragePath, string? RequestToken = null);

public sealed record ExportJobDto(long Id, long CompanyId, long BranchId, string JobNo, string Module, string OutputFormat, string? FilterJson, string StoragePath, string Status, DateTimeOffset RequestedOn, DateTimeOffset? ProcessedOn, string? LastError);
public sealed record ExportJobCreateRequest(long CompanyId, long BranchId, string JobNo, string Module, string OutputFormat, string? FilterJson, string StoragePath);

public sealed record IntegrationMessageTemplateDto(long Id, long? CompanyId, long? IntegrationProviderId, string ChannelType, string TemplateCode, string TemplateName, string TemplateVersion, string ApprovalStatus, string BodyTemplate, string Status);
public sealed record IntegrationMessageTemplateUpsertRequest(long? CompanyId, long? IntegrationProviderId, string ChannelType, string TemplateCode, string TemplateName, string TemplateVersion, string ApprovalStatus, string BodyTemplate, string Status);

public sealed record OutboundMessageRequest(
    long? CompanyId,
    long? BranchId,
    string ChannelType,
    string RecipientRef,
    string TemplateCode,
    IReadOnlyDictionary<string, string> Tokens,
    string? RelatedDocumentType = null,
    long? RelatedDocumentId = null,
    string? SourceModule = null,
    string? SourceDocumentNo = null,
    string? RecipientType = null,
    string? Subject = null,
    string? BodyOverride = null,
    long? ReportOutputId = null);

public sealed record OutboundMessagePreviewRequest(
    long? CompanyId,
    long? BranchId,
    string ChannelType,
    string RecipientRef,
    string TemplateCode,
    IReadOnlyDictionary<string, string> Tokens,
    string? Subject = null,
    string? BodyOverride = null);

public sealed record OutboundMessagePreviewDto(string ChannelType, string TemplateCode, string RedactedRecipientRef, string RenderedMessage);

public sealed record OutboundDeliveryStatusDto(
    long Id,
    string ChannelType,
    string RedactedRecipientRef,
    string TemplateCode,
    string DeliveryStatus,
    int AttemptCount,
    DateTimeOffset CreatedOn,
    DateTimeOffset? ProcessedOn,
    string? LastError,
    long? ProviderId = null,
    string? ProviderCode = null,
    string? SourceModule = null,
    string? SourceDocumentType = null,
    long? SourceDocumentId = null,
    string? SourceDocumentNo = null,
    long? ReportOutputId = null,
    string? DeliveryReceiptStatus = null);

public sealed record OutboundRetryRequest(string? Reason = null);

public sealed record OutboundProviderHealthDto(string ChannelType, string? ProviderCode, string Status, int ActiveConnectionCount, string Notes);

public sealed record WebhookDispatchRequest(long CompanyId, long? BranchId, string EventType, string PayloadReference, bool SimulateFailure = false);

public sealed record WebhookDispatchResultDto(string EventType, int MatchedSubscriptions, int DeliveredCount, int RetryQueuedCount, IReadOnlyCollection<string> OperatorMessages);

public sealed record WebhookEventDto(long Id, long? CompanyId, long? BranchId, long? WebhookSubscriptionId, long? IntegrationProviderId, string Direction, string EventType, string? SourceDocumentType, long? SourceDocumentId, string PayloadReference, string PayloadHash, bool SignatureVerified, int AttemptCount, int? ResponseCode, string? ResponseSummary, string Status, string? FailureReason, DateTimeOffset EventOn);
public sealed record InboundWebhookRequest(long? CompanyId, long? BranchId, string EventType, string PayloadReference, string RawPayload, string? Signature, string? SourceDocumentType = null, long? SourceDocumentId = null);

public sealed record CrmObjectMappingDto(long Id, long? CompanyId, long IntegrationProviderId, string ErpObjectType, long? ErpObjectId, string ExternalObjectType, string ExternalId, string SyncDirection, string ConflictStatus, DateTimeOffset? LastSyncedAt, string Status);
public sealed record CrmObjectMappingUpsertRequest(long? CompanyId, long IntegrationProviderId, string ErpObjectType, long? ErpObjectId, string ExternalObjectType, string ExternalId, string SyncDirection, string ConflictStatus, string Status);
public sealed record CrmSyncRequest(long? CompanyId, long? BranchId, long IntegrationProviderId, long? CrmObjectMappingId, string ObjectType, string SyncDirection, IReadOnlyDictionary<string, string> Payload);
public sealed record CrmSyncJobDto(long Id, long? CompanyId, long? BranchId, long IntegrationProviderId, long? CrmObjectMappingId, string ObjectType, string SyncDirection, string PayloadSnapshotJson, string Status, string? FailureReason, DateTimeOffset RequestedOn, DateTimeOffset? CompletedOn);
public sealed record CrmSyncConflictDto(long Id, long? CompanyId, long CrmSyncJobId, string ObjectType, long? ErpObjectId, string? ExternalId, string ConflictType, string ResolutionStatus, string DetailsJson);

public sealed record IntegrationJobStatusUpdateRequest(string Status, string? LastError = null, int? FailedRowCount = null, string? FailureSummary = null);
