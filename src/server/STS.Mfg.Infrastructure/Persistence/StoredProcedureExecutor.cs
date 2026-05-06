using System.Diagnostics;
using Dapper;
using Microsoft.Extensions.Logging;
using STS.Mfg.Application.Abstractions.Persistence;
using STS.Mfg.Application.Abstractions.Security;

namespace STS.Mfg.Infrastructure.Persistence;

public sealed class StoredProcedureExecutor(
    ISqlConnectionFactory connectionFactory,
    ICurrentUserContextAccessor currentUserContextAccessor,
    ILogger<StoredProcedureExecutor> logger) : IStoredProcedureExecutor
{
    public async Task<IReadOnlyCollection<T>> QueryAsync<T>(
        StoredProcedureRequest request,
        CancellationToken cancellationToken = default)
    {
        using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var stopwatch = Stopwatch.StartNew();
        var parameters = ToDynamicParameters(request.Parameters);

        try
        {
            var rows = await connection.QueryAsync<T>(
                new CommandDefinition(
                    request.ProcedureName,
                    parameters,
                    commandType: System.Data.CommandType.StoredProcedure,
                    cancellationToken: cancellationToken));

            logger.LogInformation(
                "Stored procedure {ProcedureName} completed in {DurationMs} ms for correlation {CorrelationId}.",
                request.ProcedureName,
                stopwatch.ElapsedMilliseconds,
                currentUserContextAccessor.GetCurrent().UserId);

            return rows.ToArray();
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Stored procedure {ProcedureName} failed after {DurationMs} ms.",
                request.ProcedureName,
                stopwatch.ElapsedMilliseconds);

            throw;
        }
    }

    public async Task<int> ExecuteAsync(StoredProcedureRequest request, CancellationToken cancellationToken = default)
    {
        using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var parameters = ToDynamicParameters(request.Parameters);

        return await connection.ExecuteAsync(
            new CommandDefinition(
                request.ProcedureName,
                parameters,
                commandType: System.Data.CommandType.StoredProcedure,
                cancellationToken: cancellationToken));
    }

    private static DynamicParameters ToDynamicParameters(IReadOnlyDictionary<string, object?> parameters)
    {
        var dynamicParameters = new DynamicParameters();

        foreach (var parameter in parameters)
        {
            dynamicParameters.Add(parameter.Key, parameter.Value);
        }

        return dynamicParameters;
    }
}
