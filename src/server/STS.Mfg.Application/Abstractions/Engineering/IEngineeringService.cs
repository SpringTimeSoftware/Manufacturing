using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Engineering;

namespace STS.Mfg.Application.Abstractions.Engineering;

public interface IEngineeringService
{
    Task<PagedResult<RoutingDto>> ListRoutingsAsync(EngineeringFilter filter, CancellationToken cancellationToken = default);
    Task<RoutingDto> GetRoutingAsync(long id, CancellationToken cancellationToken = default);
    Task<RoutingDto> CreateRoutingAsync(RoutingUpsertRequest request, CancellationToken cancellationToken = default);
    Task<RoutingDto> UpdateRoutingAsync(long id, RoutingUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<BomDto>> ListBomsAsync(EngineeringFilter filter, CancellationToken cancellationToken = default);
    Task<BomDto> GetBomAsync(long id, CancellationToken cancellationToken = default);
    Task<BomDto> CreateBomAsync(BomUpsertRequest request, CancellationToken cancellationToken = default);
    Task<BomDto> UpdateBomAsync(long id, BomUpsertRequest request, CancellationToken cancellationToken = default);
    Task<BomRevisionDto> CloneBomRevisionAsync(long bomId, long revisionId, CancellationToken cancellationToken = default);
    Task<BomRevisionDto> ApproveBomRevisionAsync(long bomId, long revisionId, CancellationToken cancellationToken = default);
    Task<BomRevisionDto> ObsoleteBomRevisionAsync(long bomId, long revisionId, CancellationToken cancellationToken = default);

    Task<PagedResult<AlternateItemDto>> ListAlternateItemsAsync(EngineeringFilter filter, CancellationToken cancellationToken = default);
    Task<AlternateItemDto> CreateAlternateItemAsync(AlternateItemUpsertRequest request, CancellationToken cancellationToken = default);
    Task<AlternateItemDto> UpdateAlternateItemAsync(long id, AlternateItemUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<EngineeringChangeDto>> ListEngineeringChangesAsync(EngineeringFilter filter, CancellationToken cancellationToken = default);
    Task<EngineeringChangeDto> GetEngineeringChangeAsync(long id, CancellationToken cancellationToken = default);
    Task<EngineeringChangeDto> CreateEngineeringChangeAsync(EngineeringChangeUpsertRequest request, CancellationToken cancellationToken = default);
    Task<EngineeringChangeDto> UpdateEngineeringChangeAsync(long id, EngineeringChangeUpsertRequest request, CancellationToken cancellationToken = default);
    Task<EngineeringChangeDto> SubmitEngineeringChangeAsync(long id, CancellationToken cancellationToken = default);
    Task<EngineeringChangeDto> ApproveEngineeringChangeAsync(long id, CancellationToken cancellationToken = default);
    Task<EngineeringChangeDto> ImplementEngineeringChangeAsync(long id, CancellationToken cancellationToken = default);
}
