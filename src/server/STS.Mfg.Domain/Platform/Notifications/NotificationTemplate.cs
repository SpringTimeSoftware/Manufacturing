using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Platform.Notifications;

public sealed class NotificationTemplate : AggregateRoot, ICompanyScoped, IBranchScoped
{
    private NotificationTemplate()
    {
    }

    private NotificationTemplate(
        long? companyId,
        long? branchId,
        string templateCode,
        string channelType,
        string templateBody,
        string status)
    {
        CompanyId = companyId;
        BranchId = branchId;
        TemplateCode = templateCode;
        ChannelType = channelType;
        TemplateBody = templateBody;
        Status = status;
        CreatedOn = DateTimeOffset.UtcNow;
    }

    public long? CompanyId { get; private set; }

    public long? BranchId { get; private set; }

    public string TemplateCode { get; private set; } = string.Empty;

    public string ChannelType { get; private set; } = string.Empty;

    public string TemplateBody { get; private set; } = string.Empty;

    public string Status { get; private set; } = string.Empty;

    public DateTimeOffset CreatedOn { get; private set; }

    public static NotificationTemplate Create(
        long? companyId,
        long? branchId,
        string templateCode,
        string channelType,
        string templateBody,
        string status)
    {
        return new NotificationTemplate(companyId, branchId, templateCode, channelType, templateBody, status);
    }
}
