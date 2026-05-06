using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Infrastructure.Configuration;

namespace STS.Mfg.Infrastructure.HealthChecks;

public sealed class BackgroundJobsHealthCheck(
    IBackgroundJobMonitor backgroundJobMonitor,
    IOptions<BackgroundJobsOptions> options) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        _ = context;
        _ = cancellationToken;

        var snapshot = backgroundJobMonitor.GetSnapshot("notification-outbox");

        if (!snapshot.LastSuccessOnUtc.HasValue && !snapshot.LastFailureOnUtc.HasValue)
        {
            return Task.FromResult(HealthCheckResult.Degraded("Notification outbox worker has not completed its first cycle yet."));
        }

        if (snapshot.LastFailureOnUtc.HasValue &&
            (!snapshot.LastSuccessOnUtc.HasValue || snapshot.LastFailureOnUtc > snapshot.LastSuccessOnUtc))
        {
            return Task.FromResult(HealthCheckResult.Degraded($"Notification outbox worker reported an error: {snapshot.LastError}"));
        }

        var acceptableStaleness = TimeSpan.FromSeconds(Math.Max(30, options.Value.NotificationPollSeconds * 3));
        var age = DateTimeOffset.UtcNow - snapshot.LastSuccessOnUtc!.Value;

        return age <= acceptableStaleness
            ? Task.FromResult(HealthCheckResult.Healthy("Notification outbox worker heartbeat is current."))
            : Task.FromResult(HealthCheckResult.Degraded("Notification outbox worker heartbeat is stale."));
    }
}
