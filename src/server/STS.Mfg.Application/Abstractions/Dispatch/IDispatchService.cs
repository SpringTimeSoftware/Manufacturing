using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Dispatch;

namespace STS.Mfg.Application.Abstractions.Dispatch;

public interface IDispatchService
{
    Task<PagedResult<PackListDto>> ListPackListsAsync(DispatchFilter filter, CancellationToken cancellationToken = default);
    Task<PackListDto> GetPackListAsync(long id, CancellationToken cancellationToken = default);
    Task<PackListDto> CreatePackListAsync(PackListUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PackListDto> UpdatePackListAsync(long id, PackListUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ShipmentDto>> ListShipmentsAsync(DispatchFilter filter, CancellationToken cancellationToken = default);
    Task<ShipmentDto> GetShipmentAsync(long id, CancellationToken cancellationToken = default);
    Task<ShipmentDto> CreateShipmentAsync(ShipmentUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ShipmentDto> UpdateShipmentProofAsync(long id, ShipmentProofRequest request, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<DispatchPlanningItemDto>> GetDispatchPlanningAsync(DispatchFilter filter, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<StageWiseDashboardItemDto>> GetStageWiseDashboardAsync(DispatchFilter filter, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OrderRiskItemDto>> GetOrderRiskDashboardAsync(DispatchFilter filter, CancellationToken cancellationToken = default);
    Task<ExecutiveCockpitDto> GetExecutiveCockpitAsync(DispatchFilter filter, CancellationToken cancellationToken = default);

    Task<PackListPrintDto> GetPackListPrintAsync(long id, CancellationToken cancellationToken = default);
    Task<WorkOrderTravelerDto> GetWorkOrderTravelerAsync(long workOrderId, CancellationToken cancellationToken = default);
}
