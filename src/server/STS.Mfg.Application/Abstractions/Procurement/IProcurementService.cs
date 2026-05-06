using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Procurement;

namespace STS.Mfg.Application.Abstractions.Procurement;

public interface IProcurementService
{
    Task<PagedResult<PurchaseRequisitionDto>> ListPurchaseRequisitionsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default);
    Task<PurchaseRequisitionDto> GetPurchaseRequisitionAsync(long id, CancellationToken cancellationToken = default);
    Task<PurchaseRequisitionDto> CreatePurchaseRequisitionAsync(PurchaseRequisitionUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseRequisitionDto> UpdatePurchaseRequisitionAsync(long id, PurchaseRequisitionUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseRequisitionDto> ApprovePurchaseRequisitionAsync(long id, CancellationToken cancellationToken = default);

    Task<PagedResult<PurchaseOrderDto>> ListPurchaseOrdersAsync(ProcurementFilter filter, CancellationToken cancellationToken = default);
    Task<PurchaseOrderDto> GetPurchaseOrderAsync(long id, CancellationToken cancellationToken = default);
    Task<PurchaseOrderDto> CreatePurchaseOrderAsync(PurchaseOrderUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseOrderDto> UpdatePurchaseOrderAsync(long id, PurchaseOrderUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PurchaseOrderDto> ApprovePurchaseOrderAsync(long id, CancellationToken cancellationToken = default);

    Task<PagedResult<SubcontractOrderDto>> ListSubcontractOrdersAsync(ProcurementFilter filter, CancellationToken cancellationToken = default);
    Task<SubcontractOrderDto> GetSubcontractOrderAsync(long id, CancellationToken cancellationToken = default);
    Task<SubcontractOrderDto> CreateSubcontractOrderAsync(SubcontractOrderUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SubcontractOrderDto> UpdateSubcontractOrderAsync(long id, SubcontractOrderUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SubcontractOrderDto> ApproveSubcontractOrderAsync(long id, CancellationToken cancellationToken = default);
}
