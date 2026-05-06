using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;

namespace STS.Mfg.Application.Contracts.Production;

public sealed record ProductionReceiptFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? WorkOrderId = null,
    long? JobCardId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record ProductionReceiptLineDto(
    long Id,
    int LineNo,
    string LineType,
    long ItemId,
    long? ItemVariantId,
    long OutputUomId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string InventoryState,
    string? Remarks);

public sealed record ProductionReceiptSummaryDto(
    long Id,
    long CompanyId,
    long BranchId,
    string ReceiptNo,
    DateOnly PostingDate,
    long? WorkOrderId,
    long? JobCardId,
    string Status,
    DateTimeOffset? PostedOn);

public sealed record ProductionReceiptDto(
    long Id,
    long CompanyId,
    long BranchId,
    string ReceiptNo,
    DateOnly PostingDate,
    long? WorkOrderId,
    long? JobCardId,
    string Status,
    string? CorrelationId,
    string? Remarks,
    DateTimeOffset? PostedOn,
    IReadOnlyCollection<ProductionReceiptLineDto> Lines,
    IReadOnlyCollection<StockTransactionDto> StockTransactions);

public sealed record ProductionReceiptLineRequest(
    int LineNo,
    string LineType,
    long ItemId,
    long? ItemVariantId,
    long OutputUomId,
    long WarehouseId,
    long? BinId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string InventoryState,
    string? Remarks,
    long? LotId = null,
    string? LotNo = null,
    DateOnly? ManufacturedOn = null,
    DateOnly? ExpiryOn = null,
    long? SerialId = null,
    string? SerialNo = null,
    string? ItemCode = null,
    string? ItemVariantCode = null);

public sealed record ProductionReceiptCreateRequest(
    long CompanyId,
    long BranchId,
    string ReceiptNo,
    DateOnly PostingDate,
    long? WorkOrderId,
    long? JobCardId,
    string? CorrelationId,
    string? Remarks,
    IReadOnlyCollection<ProductionReceiptLineRequest> Lines);

public sealed record ScrapEntryFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? WorkOrderId = null,
    long? JobCardId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record ScrapEntryDto(
    long Id,
    long CompanyId,
    long BranchId,
    string ScrapNo,
    DateOnly PostingDate,
    long? WorkOrderId,
    long? JobCardId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string ReasonCode,
    string InventoryState,
    string Status,
    string? Remarks,
    IReadOnlyCollection<StockTransactionDto> StockTransactions);

public sealed record ScrapEntryCreateRequest(
    long CompanyId,
    long BranchId,
    string ScrapNo,
    DateOnly PostingDate,
    long? WorkOrderId,
    long? JobCardId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string ReasonCode,
    string InventoryState,
    string? Remarks,
    long? LotId = null,
    string? LotNo = null,
    long? SerialId = null,
    string? SerialNo = null,
    string? ItemCode = null,
    string? ItemVariantCode = null);

public sealed record ReworkOrderFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record ReworkOrderDto(
    long Id,
    long CompanyId,
    long BranchId,
    string ReworkNo,
    string? SourceDocumentType,
    long? SourceDocumentId,
    long? WorkOrderId,
    long? JobCardId,
    long ItemId,
    long? ItemVariantId,
    long? SourceWarehouseId,
    long? SourceBinId,
    long? TargetWarehouseId,
    long? TargetBinId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string? ReasonCode,
    string? Instructions,
    string Status,
    DateTimeOffset? ReleasedOn,
    DateTimeOffset? ClosedOn,
    IReadOnlyCollection<StockTransactionDto> StockTransactions);

public sealed record ReworkOrderCreateRequest(
    long CompanyId,
    long BranchId,
    string ReworkNo,
    string? SourceDocumentType,
    long? SourceDocumentId,
    long? WorkOrderId,
    long? JobCardId,
    long ItemId,
    long? ItemVariantId,
    long? SourceWarehouseId,
    long? SourceBinId,
    long? TargetWarehouseId,
    long? TargetBinId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string? ReasonCode,
    string? Instructions,
    string InventoryState,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    long? LotId = null,
    string? LotNo = null,
    long? SerialId = null,
    string? SerialNo = null);

public sealed record ReworkOrderActionRequest(string? Instructions = null);
