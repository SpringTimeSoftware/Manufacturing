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
    string? ProviderType = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record IntegrationProviderDto(long Id, string ProviderCode, string ProviderName, string ProviderType, string? BaseUrl, string Status, bool IsSystemBase);
public sealed record IntegrationProviderUpsertRequest(string ProviderCode, string ProviderName, string ProviderType, string? BaseUrl, string Status, bool IsSystemBase = false);

public sealed record IntegrationConnectionDto(long Id, long CompanyId, long? BranchId, long IntegrationProviderId, string ConnectionCode, string ConnectionName, string? EndpointUrl, string? CredentialReference, string Status, DateTimeOffset? LastHealthCheckedOn, string? LastHealthStatus);
public sealed record IntegrationConnectionUpsertRequest(long CompanyId, long? BranchId, long IntegrationProviderId, string ConnectionCode, string ConnectionName, string? EndpointUrl, string? CredentialReference, string Status);

public sealed record WebhookSubscriptionDto(long Id, long CompanyId, long? BranchId, string SubscriptionCode, string EventType, string TargetUrl, string? SecretReference, string? HeadersJson, string Status, DateTimeOffset? LastDeliveredOn, DateTimeOffset? RetryQueuedOn);
public sealed record WebhookSubscriptionUpsertRequest(long CompanyId, long? BranchId, string SubscriptionCode, string EventType, string TargetUrl, string? SecretReference, string? HeadersJson, string Status);

public sealed record ImportJobDto(long Id, long CompanyId, long BranchId, string JobNo, string Module, string SourceFormat, string StoragePath, string? RequestToken, string Status, DateTimeOffset RequestedOn, DateTimeOffset? ProcessedOn, string? LastError);
public sealed record ImportJobCreateRequest(long CompanyId, long BranchId, string JobNo, string Module, string SourceFormat, string StoragePath, string? RequestToken = null);

public sealed record ExportJobDto(long Id, long CompanyId, long BranchId, string JobNo, string Module, string OutputFormat, string? FilterJson, string StoragePath, string Status, DateTimeOffset RequestedOn, DateTimeOffset? ProcessedOn, string? LastError);
public sealed record ExportJobCreateRequest(long CompanyId, long BranchId, string JobNo, string Module, string OutputFormat, string? FilterJson, string StoragePath);

public sealed record OutboundMessageRequest(
    long? CompanyId,
    long? BranchId,
    string ChannelType,
    string RecipientRef,
    string TemplateCode,
    IReadOnlyDictionary<string, string> Tokens,
    string? RelatedDocumentType = null,
    long? RelatedDocumentId = null);

public sealed record OutboundMessagePreviewRequest(
    long? CompanyId,
    long? BranchId,
    string ChannelType,
    string RecipientRef,
    string TemplateCode,
    IReadOnlyDictionary<string, string> Tokens);

public sealed record OutboundMessagePreviewDto(string ChannelType, string TemplateCode, string RedactedRecipientRef, string RenderedMessage);

public sealed record OutboundDeliveryStatusDto(long Id, string ChannelType, string RedactedRecipientRef, string TemplateCode, string DeliveryStatus, int AttemptCount, DateTimeOffset CreatedOn, DateTimeOffset? ProcessedOn, string? LastError);

public sealed record OutboundProviderHealthDto(string ChannelType, string? ProviderCode, string Status, int ActiveConnectionCount, string Notes);

public sealed record WebhookDispatchRequest(long CompanyId, long? BranchId, string EventType, string PayloadReference, bool SimulateFailure = false);

public sealed record WebhookDispatchResultDto(string EventType, int MatchedSubscriptions, int DeliveredCount, int RetryQueuedCount, IReadOnlyCollection<string> OperatorMessages);

public sealed record IntegrationJobStatusUpdateRequest(string Status, string? LastError = null, int? FailedRowCount = null, string? FailureSummary = null);
