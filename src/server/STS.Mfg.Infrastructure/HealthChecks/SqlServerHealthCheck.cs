using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using STS.Mfg.Application.Abstractions.Persistence;

namespace STS.Mfg.Infrastructure.HealthChecks;

public sealed class SqlServerHealthCheck(ISqlConnectionFactory connectionFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT 1";
            await command.ExecuteScalarAsync(cancellationToken);

            return HealthCheckResult.Healthy("SQL Server connectivity is available.");
        }
        catch (SqlException exception)
        {
            return HealthCheckResult.Unhealthy("SQL Server connectivity failed.", exception);
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Degraded("SQL Server is not configured yet.", exception);
        }
    }
}
