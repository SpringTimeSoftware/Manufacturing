using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using STS.Mfg.Infrastructure.Configuration;

namespace STS.Mfg.Infrastructure.HealthChecks;

public sealed class AttachmentStorageHealthCheck(
    IOptions<StorageOptions> options,
    IHostEnvironment hostEnvironment) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        _ = context;
        _ = cancellationToken;

        try
        {
            var configured = options.Value.AttachmentsRoot;
            var rootPath = Path.IsPathRooted(configured)
                ? configured
                : Path.Combine(hostEnvironment.ContentRootPath, configured);

            Directory.CreateDirectory(rootPath);

            return Task.FromResult(HealthCheckResult.Healthy($"Attachment storage root is available at '{rootPath}'."));
        }
        catch (Exception exception)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Attachment storage is not available.", exception));
        }
    }
}
