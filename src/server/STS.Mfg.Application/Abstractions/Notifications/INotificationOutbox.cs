using STS.Mfg.Application.Contracts.Notifications;

namespace STS.Mfg.Application.Abstractions.Notifications;

public interface INotificationOutbox
{
    Task QueueAsync(NotificationDispatchRequest request, CancellationToken cancellationToken = default);
}

public interface INotificationTemplateLookup
{
    Task<string?> ResolveTemplateAsync(
        string templateCode,
        string channelType,
        long? companyId,
        long? branchId,
        CancellationToken cancellationToken = default);
}

public interface INotificationChannel
{
    string ChannelType { get; }

    Task SendAsync(NotificationDeliveryContext context, CancellationToken cancellationToken = default);
}

public interface IBackgroundJobMonitor
{
    void MarkSuccess(string jobName);

    void MarkFailure(string jobName, string error);

    BackgroundJobSnapshot GetSnapshot(string jobName);
}
