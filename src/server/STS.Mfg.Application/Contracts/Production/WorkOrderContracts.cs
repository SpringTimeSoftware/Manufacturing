using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Production;

public sealed record WorkOrderFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? ItemId = null,
    long? SalesOrderLineId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record WorkOrderOperationDto(
    long Id,
    int SequenceNo,
    long OperationId,
    long? RoutingOperationId,
    long? WorkCenterId,
    decimal PlannedQuantity,
    decimal CompletedQuantity,
    bool RequiresQcCheckpoint,
    string Status);

public sealed record WorkOrderSummaryDto(
    long Id,
    long CompanyId,
    long BranchId,
    string WorkOrderNo,
    long? SalesOrderLineId,
    long ItemId,
    long BomRevisionId,
    long? RoutingId,
    decimal PlannedQuantity,
    long ProductionUomId,
    DateOnly? PlannedStartDate,
    DateOnly? PlannedEndDate,
    string Status,
    DateTimeOffset? ReleasedOn,
    int OperationCount,
    int CompletedOperationCount);

public sealed record WorkOrderDto(
    long Id,
    long CompanyId,
    long BranchId,
    string WorkOrderNo,
    long? SalesOrderLineId,
    long ItemId,
    long BomRevisionId,
    long? RoutingId,
    decimal PlannedQuantity,
    long ProductionUomId,
    DateOnly? PlannedStartDate,
    DateOnly? PlannedEndDate,
    string Status,
    string? Remarks,
    DateTimeOffset? ReleasedOn,
    DateTimeOffset? ClosedOn,
    DateTimeOffset? CancelledOn,
    IReadOnlyCollection<WorkOrderOperationDto> Operations);

public sealed record WorkOrderUpsertRequest(
    long CompanyId,
    long BranchId,
    string WorkOrderNo,
    long? SalesOrderLineId,
    long ItemId,
    long BomRevisionId,
    long? RoutingId,
    decimal PlannedQuantity,
    long ProductionUomId,
    DateOnly? PlannedStartDate,
    DateOnly? PlannedEndDate,
    string Status,
    string? Remarks);

public sealed record WorkOrderActionRequest(string? Remarks);

public sealed record WorkOrderReadinessBlockerDto(
    string Code,
    string Message);

public sealed record WorkOrderMaterialReadinessDto(
    long ComponentItemId,
    decimal RequiredQuantity,
    decimal ReservedQuantity,
    decimal AvailableQuantity,
    decimal ShortageQuantity,
    decimal BlockedQuantity,
    decimal QcHoldQuantity);

public sealed record WorkOrderOperationReadinessDto(
    int SequenceNo,
    long OperationId,
    long? RoutingOperationId,
    long? WorkCenterId,
    string Status,
    bool CapacityReady,
    string? CapacityMessage);

public sealed record WorkOrderReadinessDto(
    long WorkOrderId,
    string WorkOrderNo,
    string Status,
    bool CanRelease,
    bool EngineeringReady,
    bool MaterialReady,
    bool CapacityReady,
    bool WorkflowReady,
    IReadOnlyCollection<WorkOrderReadinessBlockerDto> BlockingReasons,
    IReadOnlyCollection<WorkOrderMaterialReadinessDto> MaterialReadiness,
    IReadOnlyCollection<WorkOrderOperationReadinessDto> OperationReadiness);
