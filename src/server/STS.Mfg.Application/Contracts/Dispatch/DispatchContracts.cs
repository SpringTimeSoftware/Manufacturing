using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;
using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Application.Contracts.Dispatch;

public sealed record DispatchFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? SalesOrderId = null,
    long? CustomerId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record PackListLineDto(
    long Id,
    int LineNo,
    long? SalesOrderLineId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    decimal PackedQuantity,
    long PackUomId,
    string? PackageRef,
    string Status);

public sealed record PackListDto(
    long Id,
    long CompanyId,
    long BranchId,
    string PackListNo,
    long? SalesOrderId,
    DateOnly? PlannedShipDate,
    string Status,
    string? Remarks,
    IReadOnlyCollection<PackListLineDto> Lines);

public sealed record PackListLineRequest(
    int LineNo,
    long? SalesOrderLineId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    decimal PackedQuantity,
    long PackUomId,
    string? PackageRef,
    string Status,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    string? LotNo = null,
    string? SerialNo = null,
    string? PcidNo = null);

public sealed record PackListUpsertRequest(
    long CompanyId,
    long BranchId,
    string PackListNo,
    long? SalesOrderId,
    DateOnly? PlannedShipDate,
    string Status,
    string? Remarks,
    IReadOnlyCollection<PackListLineRequest> Lines);

public sealed record ShipmentLineDto(
    long Id,
    int LineNo,
    long? PackListLineId,
    long? SalesOrderLineId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    decimal ShippedQuantity,
    decimal DeliveredQuantity,
    decimal ShortQuantity,
    decimal DamagedQuantity,
    long ShipUomId,
    string Status,
    long? SalesOrderId,
    string? SourceDocumentNo,
    long? SourceDocumentLineId,
    int? SourceDocumentRevisionNo,
    int? SourceDocumentVersionNo,
    long? ItemRevisionId,
    long? EngineeringDocumentRevisionId,
    long? BomRevisionId,
    long? RoutingId,
    decimal UnitPrice,
    string? PriceSourceType,
    long? PriceListLineId,
    long? DiscountSchemeId,
    long? DiscountRuleId,
    decimal DiscountPercent,
    decimal DiscountAmount,
    long? TaxCodeId,
    decimal TaxRateSnapshot,
    decimal TaxAmount,
    decimal LineSubtotal,
    decimal LineTaxableAmount,
    decimal LineTotalAmount,
    string? LineInternalRemarks,
    string? LineCustomerFacingRemarks);

public sealed record ShipmentDto(
    long Id,
    long CompanyId,
    long BranchId,
    string ShipmentNo,
    long? PackListId,
    long CustomerId,
    DateOnly DispatchDate,
    string? VehicleRef,
    string? TrackingRef,
    string? SealNo,
    string? ProofNotes,
    string? TransporterName,
    string? DriverName,
    string? DriverContact,
    string? DeliveryAddressSnapshot,
    string? PodReceivedBy,
    string? PodReceiverContact,
    DateTimeOffset? PodReceivedOn,
    long? PodEvidenceAttachmentId,
    string? PodRemarks,
    string Status,
    DateTimeOffset? LoadedOn,
    DateTimeOffset? DeliveredOn,
    IReadOnlyCollection<ShipmentLineDto> Lines,
    IReadOnlyCollection<StockTransactionDto> StockTransactions);

public sealed record ShipmentLineRequest(
    int LineNo,
    long? PackListLineId,
    long? SalesOrderLineId,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    decimal ShippedQuantity,
    long ShipUomId,
    string Status,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    string? LotNo = null,
    string? SerialNo = null,
    string? PcidNo = null);

public sealed record ShipmentUpsertRequest(
    long CompanyId,
    long BranchId,
    string ShipmentNo,
    long? PackListId,
    long CustomerId,
    DateOnly DispatchDate,
    string? VehicleRef,
    string? TrackingRef,
    string? SealNo,
    string? ProofNotes,
    string? TransporterName,
    string? DriverName,
    string? DriverContact,
    string? DeliveryAddressSnapshot,
    string Status,
    IReadOnlyCollection<ShipmentLineRequest> Lines);

public sealed record ShipmentProofRequest(
    string? VehicleRef,
    string? TrackingRef,
    string? SealNo,
    string? ProofNotes,
    string Status,
    string? PodReceivedBy = null,
    string? PodReceiverContact = null,
    DateTimeOffset? PodReceivedOn = null,
    long? PodEvidenceAttachmentId = null,
    string? PodRemarks = null,
    IReadOnlyCollection<ShipmentProofLineRequest>? Lines = null,
    DateTimeOffset? LoadedOn = null,
    DateTimeOffset? DeliveredOn = null);

public sealed record ShipmentProofLineRequest(
    long ShipmentLineId,
    decimal DeliveredQuantity,
    decimal ShortQuantity,
    decimal DamagedQuantity);

public sealed record DispatchPlanningItemDto(
    long SalesOrderId,
    string SalesOrderNo,
    long CustomerId,
    string? CustomerName,
    DateOnly? PromisedDate,
    decimal OrderedQuantity,
    decimal PackedQuantity,
    decimal ShippedQuantity,
    decimal DispatchReadinessPercent,
    string Status,
    string? NextAction);

public sealed record StageWiseDashboardItemDto(
    long SalesOrderId,
    string SalesOrderNo,
    string? CustomerName,
    string StageCode,
    string StageStatus,
    string? BlockerCode,
    string OwnerRole,
    int DaysInStage,
    string NextRequiredAction);

public sealed record OrderRiskItemDto(
    long SalesOrderId,
    string SalesOrderNo,
    string? CustomerName,
    DateOnly? PromisedDate,
    decimal CompletionPercent,
    int PendingOperationCount,
    int ShortageCount,
    int SupplierLateCount,
    int QcPendingCount,
    decimal DispatchReadinessPercent,
    string RiskStatus,
    string? PrimaryBlockerCode);

public sealed record ExecutiveCockpitDto(
    int OpenOrders,
    int OverdueOrders,
    int CriticalShortages,
    int DelayedSuppliers,
    decimal MachineDowntimeMinutesToday,
    int DispatchReadyToday,
    int QcPending);

public sealed record PackListPrintDto(
    PackListDto PackList,
    string? SalesOrderNo,
    string? CustomerName,
    IReadOnlyCollection<ShipmentDto> Shipments);

public sealed record WorkOrderTravelerDto(
    WorkOrderDto WorkOrder,
    IReadOnlyCollection<JobCardDto> JobCards);
