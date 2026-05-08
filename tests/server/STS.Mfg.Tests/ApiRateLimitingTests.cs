using Microsoft.AspNetCore.Http;
using STS.Mfg.Host;

namespace STS.Mfg.Tests;

public sealed class ApiRateLimitingTests
{
    [Theory]
    [InlineData("/api/auth/login", ApiRateLimiting.AuthSensitiveBucket, 12)]
    [InlineData("/api/auth/forgot-password", ApiRateLimiting.AuthSensitiveBucket, 12)]
    [InlineData("/api/ai/drafts", ApiRateLimiting.AiBucket, 60)]
    [InlineData("/api/integration/providers", ApiRateLimiting.IntegrationBucket, 45)]
    [InlineData("/api/exports", ApiRateLimiting.ImportExportBucket, 30)]
    [InlineData("/api/users", ApiRateLimiting.DefaultBucket, 600)]
    public void ResolveBucket_ShouldApplyExpectedRatePolicy(string path, string bucket, int permitLimit)
    {
        var resolved = ApiRateLimiting.ResolveBucket(new PathString(path));
        var options = ApiRateLimiting.CreateLimiterOptions(resolved);

        Assert.Equal(bucket, resolved);
        Assert.Equal(permitLimit, options.PermitLimit);
        Assert.Equal(TimeSpan.FromMinutes(1), options.Window);
        Assert.Equal(0, options.QueueLimit);
    }
}
