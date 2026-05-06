using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Application.Abstractions.Production;

public interface IWorkOrderService
{
    Task<PagedResult<WorkOrderSummaryDto>> ListWorkOrdersAsync(WorkOrderFilter filter, CancellationToken cancellationToken = default);
    Task<WorkOrderDto> GetWorkOrderAsync(long id, CancellationToken cancellationToken = default);
    Task<WorkOrderDto> CreateWorkOrderAsync(WorkOrderUpsertRequest request, CancellationToken cancellationToken = default);
    Task<WorkOrderDto> UpdateWorkOrderAsync(long id, WorkOrderUpsertRequest request, CancellationToken cancellationToken = default);

    Task<ActionResponse> ReleaseWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default);
    Task<ActionResponse> ReReleaseWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default);
    Task<ActionResponse> CancelWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default);
    Task<ActionResponse> CloseWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default);

    Task<WorkOrderReadinessDto> GetReadinessAsync(long id, CancellationToken cancellationToken = default);
}
