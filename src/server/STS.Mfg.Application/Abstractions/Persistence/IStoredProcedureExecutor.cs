namespace STS.Mfg.Application.Abstractions.Persistence;

public sealed record StoredProcedureRequest(string ProcedureName, IReadOnlyDictionary<string, object?> Parameters);

public interface IStoredProcedureExecutor
{
    Task<IReadOnlyCollection<T>> QueryAsync<T>(StoredProcedureRequest request, CancellationToken cancellationToken = default);

    Task<int> ExecuteAsync(StoredProcedureRequest request, CancellationToken cancellationToken = default);
}
