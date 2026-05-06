using Microsoft.Extensions.Logging;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Application.Contracts.Notifications;

namespace STS.Mfg.Infrastructure.Integration;

internal sealed class EmailNotificationChannel(ILogger<EmailNotificationChannel> logger) : INotificationChannel
{
    public string ChannelType => "Email";

    public Task SendAsync(NotificationDeliveryContext context, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        logger.LogInformation("Email notification queued through provider abstraction for {DocumentType}:{DocumentId}.", context.RelatedDocumentType, context.RelatedDocumentId);
        return Task.CompletedTask;
    }
}

internal sealed class SmsNotificationChannel(ILogger<SmsNotificationChannel> logger) : INotificationChannel
{
    public string ChannelType => "Sms";

    public Task SendAsync(NotificationDeliveryContext context, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        logger.LogInformation("SMS notification queued through provider abstraction for {DocumentType}:{DocumentId}.", context.RelatedDocumentType, context.RelatedDocumentId);
        return Task.CompletedTask;
    }
}

internal sealed class WhatsAppNotificationChannel(ILogger<WhatsAppNotificationChannel> logger) : INotificationChannel
{
    public string ChannelType => "WhatsApp";

    public Task SendAsync(NotificationDeliveryContext context, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        logger.LogInformation("WhatsApp notification queued through provider abstraction for {DocumentType}:{DocumentId}.", context.RelatedDocumentType, context.RelatedDocumentId);
        return Task.CompletedTask;
    }
}
