using STS.Mfg.Application.Abstractions.Persistence;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts.Production;
using STS.Mfg.Infrastructure.Persistence.Mappers.Production;
using STS.Mfg.Infrastructure.Persistence.Procedures.Production;

namespace STS.Mfg.Infrastructure.Production;

public sealed class MachineBoardReadService(
    IDataScopeService dataScopeService,
    IStoredProcedureExecutor storedProcedureExecutor,
    MachineBoardRowMapper mapper) : IMachineBoardReadService
{
    public async Task<IReadOnlyCollection<MachineBoardItem>> GetBoardAsync(
        MachineBoardQuery query,
        CancellationToken cancellationToken = default)
    {
        var scope = dataScopeService.CreateStoredProcedureScope();
        var request = MachineBoardStoredProcedure.BuildRequest(query, scope);
        var rows = await storedProcedureExecutor.QueryAsync<MachineBoardRow>(request, cancellationToken);

        return rows.Select(mapper.Map).ToArray();
    }
}
