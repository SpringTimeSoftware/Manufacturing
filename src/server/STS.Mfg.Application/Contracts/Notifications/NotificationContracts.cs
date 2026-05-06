namespace STS.Mfg.Application.Contracts.Notifications;

public sealed record NotificationDispatchRequest(
    string TemplateCode,
    string ChannelType,
    string RecipientRef,
    IReadOnlyDictionary<string, string> Tokens,
    long? CompanyId,
    long? BranchId,
    string? RelatedDocumentType,
    long? RelatedDocumentId);

public sealed record NotificationDeliveryContext(
    string ChannelType,
    string RecipientRef,
    string Message,
    long? CompanyId,
    long? BranchId,
    string? RelatedDocumentType,
    long? RelatedDocumentId);

public sealed record BackgroundJobSnapshot(
    string JobName,
    DateTimeOffset? LastSuccessOnUtc,
    DateTimeOffset? LastFailureOnUtc,
    string? LastError);
