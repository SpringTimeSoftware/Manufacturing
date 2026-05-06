using System.Text.Json;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Application.Contracts.Notifications;
using STS.Mfg.Domain.Platform.Notifications;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Platform.Notifications;

public sealed class NotificationOutboxService(MfgDbContext dbContext) : INotificationOutbox
{
    public async Task QueueAsync(NotificationDispatchRequest request, CancellationToken cancellationToken = default)
    {
        var payload = JsonSerializer.Serialize(request.Tokens);
        var message = NotificationOutboxMessage.Queue(
            request.CompanyId,
            request.BranchId,
            request.ChannelType,
            request.RecipientRef,
            request.TemplateCode,
            payload,
            request.RelatedDocumentType,
            request.RelatedDocumentId);

        await dbContext.Notifications.AddAsync(message, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
