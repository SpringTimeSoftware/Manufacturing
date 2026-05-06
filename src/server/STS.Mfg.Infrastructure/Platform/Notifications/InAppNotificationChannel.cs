using Microsoft.Extensions.Logging;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Application.Contracts.Notifications;

namespace STS.Mfg.Infrastructure.Platform.Notifications;

public sealed class InAppNotificationChannel(ILogger<InAppNotificationChannel> logger) : INotificationChannel
{
    public string ChannelType => "InApp";

    public Task SendAsync(NotificationDeliveryContext context, CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        logger.LogInformation(
            "In-app notification delivered to {RecipientRef} for document {DocumentType}:{DocumentId}.",
            context.RecipientRef,
            context.RelatedDocumentType,
            context.RelatedDocumentId);

        return Task.CompletedTask;
    }
}
