using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Application.Abstractions.Production;

public interface IMachineBoardReadService
{
    Task<IReadOnlyCollection<MachineBoardItem>> GetBoardAsync(
        MachineBoardQuery query,
        CancellationToken cancellationToken = default);
}
