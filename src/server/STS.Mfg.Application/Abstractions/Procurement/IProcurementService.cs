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
    Task<PagedResult<SubcontractReceiptDto>> ListSubcontractReceiptsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default);
    Task<SubcontractReceiptDto> CreateSubcontractReceiptAsync(SubcontractReceiptUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<GoodsReceiptDto>> ListGoodsReceiptsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default);
    Task<GoodsReceiptDto> CreateGoodsReceiptAsync(GoodsReceiptUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<SupplierInvoiceDto>> ListSupplierInvoicesAsync(ProcurementFilter filter, CancellationToken cancellationToken = default);
    Task<SupplierInvoiceDto> CreateSupplierInvoiceAsync(SupplierInvoiceUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SupplierInvoiceDto> MatchSupplierInvoiceAsync(long id, CancellationToken cancellationToken = default);
    Task<SupplierInvoicePostingResultDto> PostSupplierInvoiceAsync(long id, CancellationToken cancellationToken = default);

    Task<PagedResult<RfqDto>> ListRfqsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default);
    Task<RfqDto> GetRfqAsync(long id, CancellationToken cancellationToken = default);
    Task<RfqDto> CreateRfqAsync(RfqUpsertRequest request, CancellationToken cancellationToken = default);
    Task<RfqDto> UpdateRfqAsync(long id, RfqUpsertRequest request, CancellationToken cancellationToken = default);
    Task<RfqDto> SendRfqAsync(long id, CancellationToken cancellationToken = default);

    Task<PagedResult<SupplierQuotationDto>> ListSupplierQuotationsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default);
    Task<SupplierQuotationDto> GetSupplierQuotationAsync(long id, CancellationToken cancellationToken = default);
    Task<SupplierQuotationDto> CreateSupplierQuotationAsync(SupplierQuotationUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SupplierQuotationDto> UpdateSupplierQuotationAsync(long id, SupplierQuotationUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SupplierQuotationDto> SelectSupplierQuotationAsync(long id, SupplierQuotationSelectionRequest request, CancellationToken cancellationToken = default);
    Task<QuoteComparisonDto> GetQuoteComparisonAsync(long rfqId, CancellationToken cancellationToken = default);
    Task<PurchaseOrderDto> ConvertSupplierQuotationToPurchaseOrderAsync(long id, CancellationToken cancellationToken = default);
}
