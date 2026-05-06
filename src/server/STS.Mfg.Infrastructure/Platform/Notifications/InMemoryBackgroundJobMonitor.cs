using System.Collections.Concurrent;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Application.Contracts.Notifications;

namespace STS.Mfg.Infrastructure.Platform.Notifications;

public sealed class InMemoryBackgroundJobMonitor : IBackgroundJobMonitor
{
    private readonly ConcurrentDictionary<string, BackgroundJobSnapshot> _snapshots = new(StringComparer.OrdinalIgnoreCase);

    public void MarkSuccess(string jobName)
    {
        _snapshots.AddOrUpdate(
            jobName,
            new BackgroundJobSnapshot(jobName, DateTimeOffset.UtcNow, null, null),
            (_, current) => current with { LastSuccessOnUtc = DateTimeOffset.UtcNow, LastError = null });
    }

    public void MarkFailure(string jobName, string error)
    {
        _snapshots.AddOrUpdate(
            jobName,
            new BackgroundJobSnapshot(jobName, null, DateTimeOffset.UtcNow, error),
            (_, current) => current with { LastFailureOnUtc = DateTimeOffset.UtcNow, LastError = error });
    }

    public BackgroundJobSnapshot GetSnapshot(string jobName)
    {
        return _snapshots.TryGetValue(jobName, out var snapshot)
            ? snapshot
            : new BackgroundJobSnapshot(jobName, null, null, null);
    }
}
