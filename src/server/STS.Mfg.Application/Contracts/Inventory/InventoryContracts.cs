using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Inventory;

public sealed record InventoryFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? WarehouseId = null,
    long? BinId = null,
    long? ItemId = null,
    long? ItemVariantId = null,
    string? TransactionType = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record StockBalanceDto(
    long Id,
    long CompanyId,
    long BranchId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    decimal OnHandQty,
    decimal ReservedQty,
    decimal QcHoldQty,
    decimal BlockedQty,
    decimal InTransitQty,
    decimal? CatchWeightQty);

public sealed record StockTransactionDto(
    long Id,
    long CompanyId,
    long BranchId,
    string TransactionNo,
    string TransactionType,
    DateOnly PostingDate,
    long ItemId,
    long? ItemVariantId,
    long? FromWarehouseId,
    long? FromBinId,
    long? ToWarehouseId,
    long? ToBinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string InventoryState,
    string? SourceDocumentType,
    long? SourceDocumentId,
    string? Remarks,
    string? SourceDocumentNo = null,
    long? SourceDocumentLineId = null,
    int? SourceDocumentRevisionNo = null,
    int? SourceDocumentVersionNo = null,
    long? ItemRevisionId = null,
    long? EngineeringDocumentRevisionId = null,
    long? BomRevisionId = null,
    long? RoutingId = null,
    long? RoutingRevisionId = null,
    long? WorkOrderId = null,
    long? ProductionOrderId = null,
    long? SalesOrderId = null,
    long? SalesOrderLineId = null,
    long? PurchaseOrderId = null,
    long? PurchaseOrderLineId = null,
    long? QualityDocumentId = null,
    bool LegacyTrackingIncomplete = false);

public sealed record StockReservationDto(
    long Id,
    long CompanyId,
    long BranchId,
    long ItemId,
    long? ItemVariantId,
    long? WarehouseId,
    long? BinId,
    long? LotId,
    decimal ReservedQuantity,
    string SourceDocumentType,
    long SourceDocumentId,
    string Status);

public sealed record StockReservationRequest(
    long CompanyId,
    long BranchId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    decimal ReservedQuantity,
    string SourceDocumentType,
    long SourceDocumentId,
    string Status,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    string? LotNo = null);

public sealed record StockReservationReleaseRequest(string? Remarks = null);

public sealed record InventoryTrackingPolicyRequest(
    long CompanyId,
    long BranchId,
    long ItemId,
    long? WarehouseId,
    string MovementType = "Issue");

public sealed record InventoryTrackingPolicyDto(
    long CompanyId,
    long BranchId,
    long ItemId,
    long? WarehouseId,
    bool IsStockControlled,
    bool RequiresBin,
    bool RequiresLot,
    bool RequiresSerial,
    bool RequiresPcid,
    bool AllowsNegativeStock,
    string PolicySource,
    IReadOnlyCollection<string> RequiredDimensions);

public sealed record InventoryAvailableStockRequest(
    long CompanyId,
    long BranchId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    string InventoryState = "Available");

public sealed record InventoryAvailableStockDto(
    long CompanyId,
    long BranchId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    string InventoryState,
    decimal AvailableQuantity,
    string? BlockedReason);

public sealed record InventoryDimensionQuery(
    long CompanyId,
    long BranchId,
    long? ItemId = null,
    long? WarehouseId = null,
    long? BinId = null,
    long? LotId = null,
    long? SerialId = null,
    long? PcidId = null,
    string? InventoryState = null);

public sealed record InventoryDimensionOptionDto(
    long Id,
    string Code,
    string Label,
    string Status,
    decimal? AvailableQuantity,
    string? DisabledReason);

public sealed record StockMovementValidationLineRequest(
    int LineNo,
    string MovementType,
    long ItemId,
    long? ItemVariantId,
    long? FromWarehouseId,
    long? FromBinId,
    long? ToWarehouseId,
    long? ToBinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    decimal Quantity,
    string InventoryState,
    string? SourceDocumentType = null,
    long? SourceDocumentId = null,
    string? SourceDocumentNo = null,
    long? SourceDocumentLineId = null,
    int? SourceDocumentRevisionNo = null,
    int? SourceDocumentVersionNo = null,
    long? ItemRevisionId = null,
    long? EngineeringDocumentRevisionId = null,
    long? BomRevisionId = null,
    long? RoutingId = null,
    long? RoutingRevisionId = null,
    long? WorkOrderId = null,
    long? ProductionOrderId = null,
    long? SalesOrderId = null,
    long? SalesOrderLineId = null,
    long? PurchaseOrderId = null,
    long? PurchaseOrderLineId = null,
    long? QualityDocumentId = null);

public sealed record StockMovementValidationRequest(
    long CompanyId,
    long BranchId,
    DateOnly PostingDate,
    string? SourceDocumentType,
    long? SourceDocumentId,
    IReadOnlyCollection<StockMovementValidationLineRequest> Lines);

public sealed record StockMovementValidationLineResultDto(
    int LineNo,
    bool IsValid,
    InventoryTrackingPolicyDto Policy,
    decimal? AvailableQuantity,
    IReadOnlyCollection<ApiError> Errors);

public sealed record StockMovementValidationResultDto(
    bool IsValid,
    IReadOnlyCollection<StockMovementValidationLineResultDto> Lines,
    IReadOnlyCollection<ApiError> Errors);

public sealed record StockIssueLineRequest(
    int LineNo,
    long ItemId,
    long? ItemVariantId,
    long FromWarehouseId,
    long? FromBinId,
    long? LotId,
    long? SerialId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string InventoryState,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    string? LotNo = null,
    string? SerialNo = null,
    long? PcidId = null,
    string? PcidNo = null,
    string? SourceDocumentNo = null,
    long? SourceDocumentLineId = null,
    int? SourceDocumentRevisionNo = null,
    int? SourceDocumentVersionNo = null,
    long? ItemRevisionId = null,
    long? EngineeringDocumentRevisionId = null,
    long? BomRevisionId = null,
    long? RoutingId = null,
    long? RoutingRevisionId = null,
    long? WorkOrderId = null,
    long? ProductionOrderId = null,
    long? SalesOrderId = null,
    long? SalesOrderLineId = null,
    long? PurchaseOrderId = null,
    long? PurchaseOrderLineId = null,
    long? QualityDocumentId = null);

public sealed record StockIssueRequest(
    long CompanyId,
    long BranchId,
    string TransactionNo,
    DateOnly PostingDate,
    string? SourceDocumentType,
    long? SourceDocumentId,
    string? Remarks,
    IReadOnlyCollection<StockIssueLineRequest> Lines);

public sealed record StockReturnLineRequest(
    int LineNo,
    long ItemId,
    long? ItemVariantId,
    long ToWarehouseId,
    long? ToBinId,
    long? LotId,
    long? SerialId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string InventoryState,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    string? LotNo = null,
    string? SerialNo = null,
    long? PcidId = null,
    string? PcidNo = null,
    string? SourceDocumentNo = null,
    long? SourceDocumentLineId = null,
    int? SourceDocumentRevisionNo = null,
    int? SourceDocumentVersionNo = null,
    long? ItemRevisionId = null,
    long? EngineeringDocumentRevisionId = null,
    long? BomRevisionId = null,
    long? RoutingId = null,
    long? RoutingRevisionId = null,
    long? WorkOrderId = null,
    long? ProductionOrderId = null,
    long? SalesOrderId = null,
    long? SalesOrderLineId = null,
    long? PurchaseOrderId = null,
    long? PurchaseOrderLineId = null,
    long? QualityDocumentId = null);

public sealed record StockReturnRequest(
    long CompanyId,
    long BranchId,
    string TransactionNo,
    DateOnly PostingDate,
    string? SourceDocumentType,
    long? SourceDocumentId,
    string? Remarks,
    IReadOnlyCollection<StockReturnLineRequest> Lines);

public sealed record StockTransferLineRequest(
    int LineNo,
    long ItemId,
    long? ItemVariantId,
    long FromWarehouseId,
    long? FromBinId,
    long ToWarehouseId,
    long? ToBinId,
    long? LotId,
    long? SerialId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string InventoryState,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    string? LotNo = null,
    string? SerialNo = null,
    long? PcidId = null,
    string? PcidNo = null,
    string? SourceDocumentNo = null,
    long? SourceDocumentLineId = null,
    int? SourceDocumentRevisionNo = null,
    int? SourceDocumentVersionNo = null,
    long? ItemRevisionId = null,
    long? EngineeringDocumentRevisionId = null,
    long? BomRevisionId = null,
    long? RoutingId = null,
    long? RoutingRevisionId = null,
    long? WorkOrderId = null,
    long? ProductionOrderId = null,
    long? SalesOrderId = null,
    long? SalesOrderLineId = null,
    long? PurchaseOrderId = null,
    long? PurchaseOrderLineId = null,
    long? QualityDocumentId = null);

public sealed record StockTransferRequest(
    long CompanyId,
    long BranchId,
    string TransactionNo,
    DateOnly PostingDate,
    string? SourceDocumentType,
    long? SourceDocumentId,
    string? Remarks,
    IReadOnlyCollection<StockTransferLineRequest> Lines);

public sealed record CycleCountFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? WarehouseId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record CycleCountLineDto(
    long Id,
    int LineNo,
    long ItemId,
    long? ItemVariantId,
    long? BinId,
    long? LotId,
    long? SerialId,
    decimal SystemQuantity,
    decimal CountedQuantity,
    decimal VarianceQuantity,
    string Status,
    string? Remarks);

public sealed record CycleCountLineUpsertRequest(
    int LineNo,
    long ItemId,
    long? ItemVariantId,
    long? BinId,
    long? LotId,
    long? SerialId,
    decimal CountedQuantity,
    string Status,
    string? Remarks,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    string? LotNo = null,
    string? SerialNo = null);

public sealed record CycleCountDto(
    long Id,
    long CompanyId,
    long BranchId,
    long WarehouseId,
    string CountNo,
    DateOnly CountDate,
    string CountType,
    string Status,
    string? Remarks,
    DateTimeOffset? PostedOn,
    IReadOnlyCollection<CycleCountLineDto> Lines);

public sealed record CycleCountUpsertRequest(
    long CompanyId,
    long BranchId,
    long WarehouseId,
    string CountNo,
    DateOnly CountDate,
    string CountType,
    string Status,
    string? Remarks,
    IReadOnlyCollection<CycleCountLineUpsertRequest> Lines);

public sealed record TraceabilityFilter(
    long? CompanyId = null,
    long? BranchId = null,
    long? ItemId = null,
    string? ItemCode = null);

public sealed record LotTraceabilityDto(
    long Id,
    long CompanyId,
    long ItemId,
    string LotNo,
    DateOnly? ManufacturedOn,
    DateOnly? ExpiryOn,
    string LotStatus,
    decimal? CatchWeightQty,
    IReadOnlyCollection<StockBalanceDto> Balances,
    IReadOnlyCollection<StockTransactionDto> Transactions);

public sealed record SerialTraceabilityDto(
    long Id,
    long CompanyId,
    long ItemId,
    string SerialNo,
    long? LotId,
    long? CurrentWarehouseId,
    long? CurrentBinId,
    string SerialStatus,
    DateOnly? ManufacturedOn,
    DateOnly? ExpiryOn,
    IReadOnlyCollection<StockBalanceDto> Balances,
    IReadOnlyCollection<StockTransactionDto> Transactions);
