using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Application.Contracts.Notifications;
using STS.Mfg.Infrastructure.Configuration;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Platform.Notifications;

public sealed class NotificationOutboxProcessor(
    IServiceScopeFactory serviceScopeFactory,
    IOptions<BackgroundJobsOptions> options,
    IBackgroundJobMonitor backgroundJobMonitor,
    ILogger<NotificationOutboxProcessor> logger) : BackgroundService
{
    private const string JobName = "notification-outbox";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessBatchAsync(stoppingToken);
                backgroundJobMonitor.MarkSuccess(JobName);
            }
            catch (Exception exception)
            {
                backgroundJobMonitor.MarkFailure(JobName, exception.Message);
                logger.LogError(exception, "Notification outbox batch failed.");
            }

            await Task.Delay(TimeSpan.FromSeconds(Math.Max(5, options.Value.NotificationPollSeconds)), stoppingToken);
        }
    }

    private async Task ProcessBatchAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MfgDbContext>();
        var templateLookup = scope.ServiceProvider.GetRequiredService<INotificationTemplateLookup>();
        var channels = scope.ServiceProvider.GetServices<INotificationChannel>().ToDictionary(channel => channel.ChannelType, StringComparer.OrdinalIgnoreCase);

        var batch = await dbContext.Notifications
            .Where(message => message.DeliveryStatus == "Queued")
            .OrderBy(message => message.CreatedOn)
            .Take(options.Value.NotificationBatchSize)
            .ToListAsync(cancellationToken);

        foreach (var message in batch)
        {
            try
            {
                var template = await templateLookup.ResolveTemplateAsync(
                    message.TemplateCode,
                    message.ChannelType,
                    message.CompanyId,
                    message.BranchId,
                    cancellationToken);

                if (string.IsNullOrWhiteSpace(template))
                {
                    throw new InvalidOperationException($"Template '{message.TemplateCode}' for channel '{message.ChannelType}' is not configured.");
                }

                if (!channels.TryGetValue(message.ChannelType, out var channel))
                {
                    throw new InvalidOperationException($"Channel '{message.ChannelType}' is not registered.");
                }

                var tokens = JsonSerializer.Deserialize<Dictionary<string, string>>(message.PayloadJson) ?? new Dictionary<string, string>();
                var renderedMessage = RenderTemplate(template, tokens);

                await channel.SendAsync(
                    new NotificationDeliveryContext(
                        message.ChannelType,
                        message.RecipientRef,
                        renderedMessage,
                        message.CompanyId,
                        message.BranchId,
                        message.RelatedDocumentType,
                        message.RelatedDocumentId),
                    cancellationToken);

                message.MarkDelivered();
            }
            catch (Exception exception)
            {
                if (message.AttemptCount < 2)
                {
                    message.MarkRetryQueued(exception.Message);
                }
                else
                {
                    message.MarkFailed(exception.Message);
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string RenderTemplate(string template, IReadOnlyDictionary<string, string> tokens)
    {
        var output = template;

        foreach (var token in tokens)
        {
            output = output.Replace($"{{{{{token.Key}}}}}", token.Value, StringComparison.OrdinalIgnoreCase);
        }

        return output;
    }
}
