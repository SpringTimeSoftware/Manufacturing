namespace STS.Mfg.Infrastructure.Configuration;

public sealed class BackgroundJobsOptions
{
    public const string SectionName = "BackgroundJobs";

    public int NotificationPollSeconds { get; init; } = 30;

    public int NotificationBatchSize { get; init; } = 25;
}
