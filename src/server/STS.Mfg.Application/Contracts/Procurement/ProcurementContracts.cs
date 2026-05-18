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
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal DiscountAmount,
    decimal TaxPercent,
    decimal TaxAmount,
    decimal LineAmount,
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
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal TaxPercent,
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

public sealed record SubcontractReceiptDto(
    long Id,
    long CompanyId,
    long BranchId,
    string ReceiptNo,
    long SubcontractOrderId,
    DateOnly ReceiptDate,
    decimal ReceivedQuantity,
    decimal AcceptedQuantity,
    decimal RejectedQuantity,
    string QcStatus,
    string Status,
    string? Remarks);

public sealed record SubcontractReceiptUpsertRequest(
    long CompanyId,
    long BranchId,
    string ReceiptNo,
    long SubcontractOrderId,
    DateOnly ReceiptDate,
    decimal ReceivedQuantity,
    decimal AcceptedQuantity,
    decimal RejectedQuantity,
    string QcStatus,
    string Status,
    string? Remarks);

public sealed record GoodsReceiptLineDto(long Id, int LineNo, long PurchaseOrderLineId, long ItemId, long OrderUomId, decimal ReceivedQuantity, decimal AcceptedQuantity, decimal RejectedQuantity, decimal UnitPrice, decimal TaxPercent, decimal LineAmount, string QcStatus, string Status);
public sealed record GoodsReceiptLineUpsertRequest(int LineNo, long PurchaseOrderLineId, decimal ReceivedQuantity, decimal AcceptedQuantity, decimal RejectedQuantity, string QcStatus, string Status);
public sealed record GoodsReceiptDto(long Id, long CompanyId, long BranchId, string GoodsReceiptNo, long PurchaseOrderId, long SupplierId, DateOnly ReceiptDate, long? WarehouseId, string Status, string? Remarks, IReadOnlyCollection<GoodsReceiptLineDto> Lines);
public sealed record GoodsReceiptUpsertRequest(long CompanyId, long BranchId, string GoodsReceiptNo, long PurchaseOrderId, DateOnly ReceiptDate, long? WarehouseId, string Status, string? Remarks, IReadOnlyCollection<GoodsReceiptLineUpsertRequest> Lines);

public sealed record SupplierInvoiceLineDto(long Id, int LineNo, long PurchaseOrderLineId, long GoodsReceiptLineId, long ItemId, decimal InvoiceQuantity, decimal UnitPrice, decimal TaxPercent, decimal TaxAmount, decimal LineAmount, string MatchStatus);
public sealed record SupplierInvoiceLineUpsertRequest(int LineNo, long PurchaseOrderLineId, long GoodsReceiptLineId, decimal InvoiceQuantity, decimal UnitPrice, decimal TaxPercent);
public sealed record SupplierInvoiceDto(long Id, long CompanyId, long BranchId, string SupplierInvoiceNo, long SupplierId, long PurchaseOrderId, long GoodsReceiptId, DateOnly InvoiceDate, DateOnly? DueDate, string CurrencyCode, decimal SubtotalAmount, decimal TaxAmount, decimal TotalAmount, string MatchStatus, string ApStatus, string Status, IReadOnlyCollection<SupplierInvoiceLineDto> Lines);
public sealed record SupplierInvoiceUpsertRequest(long CompanyId, long BranchId, string SupplierInvoiceNo, long SupplierId, long PurchaseOrderId, long GoodsReceiptId, DateOnly InvoiceDate, DateOnly? DueDate, string CurrencyCode, string Status, IReadOnlyCollection<SupplierInvoiceLineUpsertRequest> Lines);

public sealed record AccountsPayableLiabilityDto(long Id, long CompanyId, long BranchId, string LiabilityNo, long SupplierInvoiceId, long SupplierId, DateOnly PostingDate, DateOnly DueDate, decimal PayableAmount, decimal PaidAmount, decimal BalanceAmount, string Status);
public sealed record AccountingPostingDto(
    long Id,
    long CompanyId,
    long BranchId,
    string PostingNo,
    string SourceDocumentType,
    long SourceDocumentId,
    DateOnly PostingDate,
    string DebitAccountCode,
    string CreditAccountCode,
    decimal Amount,
    string Status,
    long? DebitAccountId = null,
    long? CreditAccountId = null,
    long? PostingProfileId = null,
    long? FiscalPeriodId = null,
    long? JournalId = null,
    string? MappingSource = null);
public sealed record SupplierInvoicePostingResultDto(SupplierInvoiceDto Invoice, AccountsPayableLiabilityDto Liability, IReadOnlyCollection<AccountingPostingDto> Postings);

public sealed record RfqLineDto(
    long Id,
    int LineNo,
    long ItemId,
    long OrderUomId,
    decimal RequestedQuantity,
    DateOnly NeedByDate,
    long? PurchaseRequisitionLineId,
    string Status);

public sealed record RfqLineUpsertRequest(
    int LineNo,
    long ItemId,
    long OrderUomId,
    decimal RequestedQuantity,
    DateOnly NeedByDate,
    long? PurchaseRequisitionLineId,
    string Status,
    string? ItemCode = null);

public sealed record RfqSupplierDto(
    long Id,
    long SupplierId,
    string InvitationStatus,
    DateOnly ResponseDueDate,
    string? Remarks);

public sealed record RfqSupplierUpsertRequest(
    long SupplierId,
    string InvitationStatus,
    DateOnly ResponseDueDate,
    string? Remarks,
    string? SupplierCode = null);

public sealed record RfqDto(
    long Id,
    long CompanyId,
    long BranchId,
    string RfqNo,
    long? PurchaseRequisitionId,
    DateOnly IssueDate,
    DateOnly ResponseDueDate,
    string CurrencyCode,
    string Status,
    string? Remarks,
    IReadOnlyCollection<RfqLineDto> Lines,
    IReadOnlyCollection<RfqSupplierDto> Suppliers);

public sealed record RfqUpsertRequest(
    long CompanyId,
    long BranchId,
    string RfqNo,
    long? PurchaseRequisitionId,
    DateOnly IssueDate,
    DateOnly ResponseDueDate,
    string CurrencyCode,
    string Status,
    string? Remarks,
    IReadOnlyCollection<RfqLineUpsertRequest> Lines,
    IReadOnlyCollection<RfqSupplierUpsertRequest> Suppliers);

public sealed record SupplierQuotationLineDto(
    long Id,
    int LineNo,
    long RfqLineId,
    long ItemId,
    long OrderUomId,
    decimal OfferedQuantity,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal DiscountAmount,
    decimal TaxPercent,
    decimal TaxAmount,
    decimal LineAmount,
    int LeadTimeDays,
    string Status);

public sealed record SupplierQuotationLineUpsertRequest(
    int LineNo,
    long RfqLineId,
    long ItemId,
    long OrderUomId,
    decimal OfferedQuantity,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal TaxPercent,
    int LeadTimeDays,
    string Status,
    string? ItemCode = null);

public sealed record SupplierQuotationDto(
    long Id,
    long CompanyId,
    long BranchId,
    string SupplierQuotationNo,
    long RfqId,
    long SupplierId,
    DateOnly QuotationDate,
    DateOnly ValidUntil,
    string CurrencyCode,
    decimal SubtotalAmount,
    decimal TaxAmount,
    decimal TotalAmount,
    string SelectionStatus,
    string? SelectionReason,
    string Status,
    IReadOnlyCollection<SupplierQuotationLineDto> Lines);

public sealed record SupplierQuotationUpsertRequest(
    long CompanyId,
    long BranchId,
    string SupplierQuotationNo,
    long RfqId,
    long SupplierId,
    DateOnly QuotationDate,
    DateOnly ValidUntil,
    string CurrencyCode,
    string Status,
    IReadOnlyCollection<SupplierQuotationLineUpsertRequest> Lines,
    string? SupplierCode = null);

public sealed record SupplierQuotationSelectionRequest(string SelectionReason);

public sealed record QuoteComparisonLineDto(
    long RfqLineId,
    int LineNo,
    long ItemId,
    long OrderUomId,
    decimal RequestedQuantity,
    IReadOnlyCollection<SupplierQuotationLineDto> SupplierLines);

public sealed record QuoteComparisonDto(
    RfqDto Rfq,
    IReadOnlyCollection<SupplierQuotationDto> SupplierQuotations,
    IReadOnlyCollection<QuoteComparisonLineDto> Lines);
