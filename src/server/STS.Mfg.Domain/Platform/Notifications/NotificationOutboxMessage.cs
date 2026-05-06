using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Platform.Notifications;

public sealed class NotificationOutboxMessage : AggregateRoot, ICompanyScoped, IBranchScoped
{
    private NotificationOutboxMessage()
    {
    }

    private NotificationOutboxMessage(
        long? companyId,
        long? branchId,
        string channelType,
        string recipientRef,
        string templateCode,
        string payloadJson,
        string? relatedDocumentType,
        long? relatedDocumentId)
    {
        CompanyId = companyId;
        BranchId = branchId;
        ChannelType = channelType;
        RecipientRef = recipientRef;
        TemplateCode = templateCode;
        PayloadJson = payloadJson;
        RelatedDocumentType = relatedDocumentType;
        RelatedDocumentId = relatedDocumentId;
        DeliveryStatus = "Queued";
        AttemptCount = 0;
        CreatedOn = DateTimeOffset.UtcNow;
    }

    public long? CompanyId { get; private set; }

    public long? BranchId { get; private set; }

    public string ChannelType { get; private set; } = string.Empty;

    public string RecipientRef { get; private set; } = string.Empty;

    public string TemplateCode { get; private set; } = string.Empty;

    public string PayloadJson { get; private set; } = string.Empty;

    public string? RelatedDocumentType { get; private set; }

    public long? RelatedDocumentId { get; private set; }

    public string DeliveryStatus { get; private set; } = string.Empty;

    public int AttemptCount { get; private set; }

    public string? LastError { get; private set; }

    public DateTimeOffset CreatedOn { get; private set; }

    public DateTimeOffset? ProcessedOn { get; private set; }

    public static NotificationOutboxMessage Queue(
        long? companyId,
        long? branchId,
        string channelType,
        string recipientRef,
        string templateCode,
        string payloadJson,
        string? relatedDocumentType,
        long? relatedDocumentId)
    {
        return new NotificationOutboxMessage(
            companyId,
            branchId,
            channelType,
            recipientRef,
            templateCode,
            payloadJson,
            relatedDocumentType,
            relatedDocumentId);
    }

    public void MarkDelivered()
    {
        DeliveryStatus = "Delivered";
        ProcessedOn = DateTimeOffset.UtcNow;
        LastError = null;
    }

    public void MarkFailed(string error)
    {
        DeliveryStatus = "Failed";
        AttemptCount += 1;
        LastError = error;
        ProcessedOn = DateTimeOffset.UtcNow;
    }

    public void MarkRetryQueued(string error)
    {
        DeliveryStatus = "Queued";
        AttemptCount += 1;
        LastError = error;
    }
}
