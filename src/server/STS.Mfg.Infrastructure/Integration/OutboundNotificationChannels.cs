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
        logger.LogWarning("Email provider delivery was blocked because no live adapter is configured for {DocumentType}:{DocumentId}.", context.RelatedDocumentType, context.RelatedDocumentId);
        throw new InvalidOperationException("Email provider delivery is not configured. Configure a live provider adapter and credential reference before sending.");
    }
}

internal sealed class SmsNotificationChannel(ILogger<SmsNotificationChannel> logger) : INotificationChannel
{
    public string ChannelType => "Sms";

    public Task SendAsync(NotificationDeliveryContext context, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        logger.LogWarning("SMS provider delivery was blocked because no live adapter is configured for {DocumentType}:{DocumentId}.", context.RelatedDocumentType, context.RelatedDocumentId);
        throw new InvalidOperationException("SMS provider delivery is not configured. Configure a live provider adapter and credential reference before sending.");
    }
}

internal sealed class WhatsAppNotificationChannel(ILogger<WhatsAppNotificationChannel> logger) : INotificationChannel
{
    public string ChannelType => "WhatsApp";

    public Task SendAsync(NotificationDeliveryContext context, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        logger.LogWarning("WhatsApp provider delivery was blocked because no live adapter is configured for {DocumentType}:{DocumentId}.", context.RelatedDocumentType, context.RelatedDocumentId);
        throw new InvalidOperationException("WhatsApp provider delivery is not configured. Configure a live provider adapter and credential reference before sending.");
    }
}
