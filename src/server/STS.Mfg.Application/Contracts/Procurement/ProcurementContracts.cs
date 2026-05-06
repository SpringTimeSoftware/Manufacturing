using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Procurement;

public sealed record ProcurementFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? SupplierId = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record PurchaseRequisitionLineDto(
    long Id,
    int LineNo,
    long ItemId,
    decimal RequiredQuantity,
    long OrderUomId,
    DateOnly NeedByDate,
    long? SourceBoqRequirementLineId,
    long? LinkedWorkOrderId,
    string Status);

public sealed record PurchaseRequisitionLineUpsertRequest(
    int LineNo,
    long ItemId,
    decimal RequiredQuantity,
    long OrderUomId,
    DateOnly NeedByDate,
    long? SourceBoqRequirementLineId,
    long? LinkedWorkOrderId,
    string Status,
    string? ItemCode = null);

public sealed record PurchaseRequisitionDto(
    long Id,
    long CompanyId,
    long BranchId,
    string PurchaseRequisitionNo,
    string SourceDocumentType,
    long? SourceDocumentId,
    string Status,
    IReadOnlyCollection<PurchaseRequisitionLineDto> Lines);

public sealed record PurchaseRequisitionUpsertRequest(
    long CompanyId,
    long BranchId,
    string PurchaseRequisitionNo,
    string SourceDocumentType,
    long? SourceDocumentId,
    string Status,
    IReadOnlyCollection<PurchaseRequisitionLineUpsertRequest> Lines);

public sealed record PurchaseOrderLineDto(
    long Id,
    int LineNo,
    long ItemId,
    long? PurchaseRequisitionLineId,
    decimal OrderedQuantity,
    long OrderUomId,
    DateOnly ExpectedDate,
    long? LinkedWorkOrderId,
    long? SourceBoqRequirementLineId,
    string Status);

public sealed record PurchaseOrderLineUpsertRequest(
    int LineNo,
    long ItemId,
    long? PurchaseRequisitionLineId,
    decimal OrderedQuantity,
    long OrderUomId,
    DateOnly ExpectedDate,
    long? LinkedWorkOrderId,
    long? SourceBoqRequirementLineId,
    string Status,
    string? ItemCode = null);

public sealed record PurchaseOrderDto(
    long Id,
    long CompanyId,
    long BranchId,
    string PurchaseOrderNo,
    long SupplierId,
    long? OrderAddressId,
    string Status,
    DateOnly? ExpectedReceiptDate,
    IReadOnlyCollection<PurchaseOrderLineDto> Lines);

public sealed record PurchaseOrderUpsertRequest(
    long CompanyId,
    long BranchId,
    string PurchaseOrderNo,
    long SupplierId,
    long? OrderAddressId,
    string Status,
    DateOnly? ExpectedReceiptDate,
    IReadOnlyCollection<PurchaseOrderLineUpsertRequest> Lines,
    string? SupplierCode = null,
    string? OrderAddressCode = null);

public sealed record SubcontractOrderDto(
    long Id,
    long CompanyId,
    long BranchId,
    string SubcontractOrderNo,
    long SupplierId,
    long? WorkOrderId,
    long? OperationId,
    string Status,
    DateOnly? ExpectedReturnDate);

public sealed record SubcontractOrderUpsertRequest(
    long CompanyId,
    long BranchId,
    string SubcontractOrderNo,
    long SupplierId,
    long? WorkOrderId,
    long? OperationId,
    string Status,
    DateOnly? ExpectedReturnDate,
    string? SupplierCode = null);
