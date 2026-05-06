using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using STS.Mfg.Infrastructure.Configuration;

namespace STS.Mfg.Infrastructure.HealthChecks;

public sealed class IntegrationConfigurationHealthCheck(IOptions<IntegrationOptions> options) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        _ = context;
        _ = cancellationToken;

        if (!options.Value.Enabled)
        {
            return Task.FromResult(HealthCheckResult.Healthy("Integration providers are disabled."));
        }

        return options.Value.ConfiguredProviders.Count > 0
            ? Task.FromResult(HealthCheckResult.Healthy("Integration provider placeholders are configured."))
            : Task.FromResult(HealthCheckResult.Degraded("Integrations are enabled but no providers are configured."));
    }
}
