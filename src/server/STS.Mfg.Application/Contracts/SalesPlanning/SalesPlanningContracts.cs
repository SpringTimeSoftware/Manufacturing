using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.SalesPlanning;

public sealed record SalesFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    long? CompanyId = null,
    long? BranchId = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record QuoteLineDto(long Id, int LineNo, long ItemId, long? ItemVariantId, long OrderUomId, decimal Quantity, decimal UnitPrice, decimal DiscountPercent, decimal DiscountAmount, decimal TaxPercent, decimal TaxAmount, decimal LineAmount, string MakeType, DateOnly? PromisedDate, string PriorityCode, string? CustomerSpecRef, string Status);
public sealed record QuoteLineUpsertRequest(
    int LineNo,
    long ItemId,
    long? ItemVariantId,
    long OrderUomId,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal TaxPercent,
    string MakeType,
    DateOnly? PromisedDate,
    string PriorityCode,
    string? CustomerSpecRef,
    string Status,
    string? ItemCode = null,
    string? ItemVariantCode = null);
public sealed record QuoteDto(long Id, long CompanyId, long BranchId, string QuoteNo, long CustomerId, long? CustomerAddressId, DateOnly QuoteDate, DateOnly? ExpiryDate, string PriorityCode, string Status, string? CustomerSpecRef, IReadOnlyCollection<QuoteLineDto> Lines);
public sealed record QuoteUpsertRequest(
    long CompanyId,
    long BranchId,
    string QuoteNo,
    long CustomerId,
    long? CustomerAddressId,
    DateOnly QuoteDate,
    DateOnly? ExpiryDate,
    string PriorityCode,
    string Status,
    string? CustomerSpecRef,
    IReadOnlyCollection<QuoteLineUpsertRequest> Lines,
    string? CustomerCode = null,
    string? CustomerAddressCode = null);

public sealed record SalesOrderLineDto(long Id, int LineNo, long ItemId, long? ItemVariantId, long OrderUomId, decimal Quantity, string MakeType, DateOnly? PromisedDate, string PriorityCode, string? CustomerSpecRef, DateOnly? RequestedShipDate, string Status);
public sealed record SalesOrderLineUpsertRequest(
    int LineNo,
    long ItemId,
    long? ItemVariantId,
    long OrderUomId,
    decimal Quantity,
    string MakeType,
    DateOnly? PromisedDate,
    string PriorityCode,
    string? CustomerSpecRef,
    DateOnly? RequestedShipDate,
    string Status,
    string? ItemCode = null,
    string? ItemVariantCode = null);
public sealed record SalesOrderDto(long Id, long CompanyId, long BranchId, string SalesOrderNo, long CustomerId, long? BillToAddressId, long? ShipToAddressId, DateOnly OrderDate, DateOnly? PromisedDate, string PriorityCode, string Status, long? SourceQuoteId, IReadOnlyCollection<SalesOrderLineDto> Lines);
public sealed record SalesOrderUpsertRequest(
    long CompanyId,
    long BranchId,
    string SalesOrderNo,
    long CustomerId,
    long? BillToAddressId,
    long? ShipToAddressId,
    DateOnly OrderDate,
    DateOnly? PromisedDate,
    string PriorityCode,
    string Status,
    long? SourceQuoteId,
    IReadOnlyCollection<SalesOrderLineUpsertRequest> Lines,
    string? CustomerCode = null,
    string? BillToAddressCode = null,
    string? ShipToAddressCode = null);

public sealed record BlanketOrderScheduleDto(long Id, int LineNo, long ItemId, DateOnly ScheduleDate, decimal Quantity, long OrderUomId, string Status);
public sealed record BlanketOrderScheduleUpsertRequest(
    int LineNo,
    long ItemId,
    DateOnly ScheduleDate,
    decimal Quantity,
    long OrderUomId,
    string Status,
    string? ItemCode = null);
public sealed record BlanketOrderDto(long Id, long CompanyId, long? BranchId, string BlanketOrderNo, long CustomerId, DateOnly StartDate, DateOnly EndDate, string Status, IReadOnlyCollection<BlanketOrderScheduleDto> Schedules);
public sealed record BlanketOrderUpsertRequest(
    long CompanyId,
    long? BranchId,
    string BlanketOrderNo,
    long CustomerId,
    DateOnly StartDate,
    DateOnly EndDate,
    string Status,
    IReadOnlyCollection<BlanketOrderScheduleUpsertRequest> Schedules,
    string? CustomerCode = null);

public sealed record DemandForecastLineDto(long Id, int LineNo, long ItemId, DateOnly ForecastPeriodStart, DateOnly ForecastPeriodEnd, decimal Quantity, long ForecastUomId);
public sealed record DemandForecastLineUpsertRequest(
    int LineNo,
    long ItemId,
    DateOnly ForecastPeriodStart,
    DateOnly ForecastPeriodEnd,
    decimal Quantity,
    long ForecastUomId,
    string? ItemCode = null);
public sealed record DemandForecastDto(long Id, long CompanyId, long? BranchId, string ForecastCode, string ForecastName, string PeriodType, string Status, IReadOnlyCollection<DemandForecastLineDto> Lines);
public sealed record DemandForecastUpsertRequest(long CompanyId, long? BranchId, string ForecastCode, string ForecastName, string PeriodType, string Status, IReadOnlyCollection<DemandForecastLineUpsertRequest> Lines);

public sealed record MpsLineDto(long Id, int LineNo, long ItemId, DateOnly PeriodStart, DateOnly PeriodEnd, decimal PlannedQuantity, long PlanningUomId);
public sealed record MpsLineUpsertRequest(
    int LineNo,
    long ItemId,
    DateOnly PeriodStart,
    DateOnly PeriodEnd,
    decimal PlannedQuantity,
    long PlanningUomId,
    string? ItemCode = null);
public sealed record MasterProductionScheduleDto(long Id, long CompanyId, long BranchId, string MpsCode, DateOnly PlanningHorizonStart, DateOnly PlanningHorizonEnd, string Status, IReadOnlyCollection<MpsLineDto> Lines);
public sealed record MasterProductionScheduleUpsertRequest(long CompanyId, long BranchId, string MpsCode, DateOnly PlanningHorizonStart, DateOnly PlanningHorizonEnd, string Status, IReadOnlyCollection<MpsLineUpsertRequest> Lines);

public sealed record MrpRunItemDto(long Id, long ItemId, string DemandSourceType, decimal GrossRequirementQty, decimal NetRequirementQty, decimal AvailableQtyAtRun, string RecommendedAction, string? ExceptionCode);
public sealed record MrpRunDto(long Id, long CompanyId, long BranchId, string RunCode, string RunType, long? TriggeredFromMpsId, DateOnly PlanningHorizonStart, DateOnly PlanningHorizonEnd, string Status, DateTimeOffset RunStartedOn, DateTimeOffset? RunCompletedOn, IReadOnlyCollection<MrpRunItemDto> Items);
public sealed record MrpRunStartRequest(long CompanyId, long BranchId, string RunCode, string RunType, long? TriggeredFromMpsId, DateOnly PlanningHorizonStart, DateOnly PlanningHorizonEnd);

public sealed record BoqRequirementLineDto(long Id, int LineNo, long ItemId, decimal RequiredQuantity, long RequirementUomId, DateOnly NeedByDate, string RecommendedAction, string? ApprovedAction, string? OverrideReasonCode, long? OverriddenByUserId, string Status);
public sealed record BoqRequirementLineUpsertRequest(
    int LineNo,
    long ItemId,
    decimal RequiredQuantity,
    long RequirementUomId,
    DateOnly NeedByDate,
    string RecommendedAction,
    string? ApprovedAction,
    string? OverrideReasonCode,
    long? OverriddenByUserId,
    string Status,
    string? ItemCode = null);
public sealed record BoqRequirementDto(long Id, long CompanyId, long BranchId, long? MrpRunId, string SourceDocumentType, long? SourceDocumentId, string Status, IReadOnlyCollection<BoqRequirementLineDto> Lines);
public sealed record BoqRequirementUpsertRequest(long CompanyId, long BranchId, long? MrpRunId, string SourceDocumentType, long? SourceDocumentId, string Status, IReadOnlyCollection<BoqRequirementLineUpsertRequest> Lines);
public sealed record BoqLineActionRequest(string ApprovedAction, string? OverrideReasonCode);

public sealed record PlanningPlanDto(
    long Id,
    long CompanyId,
    long BranchId,
    string PlanCode,
    string PlanName,
    string PlanType,
    DateOnly HorizonStart,
    DateOnly HorizonEnd,
    int FirmFenceDays,
    int ForecastFenceDays,
    bool IncludeForecast,
    bool IncludeCapacity,
    string Status);

public sealed record PlanningPlanUpsertRequest(
    long CompanyId,
    long BranchId,
    string PlanCode,
    string PlanName,
    string PlanType,
    DateOnly HorizonStart,
    DateOnly HorizonEnd,
    int FirmFenceDays,
    int ForecastFenceDays,
    bool IncludeForecast,
    bool IncludeCapacity,
    string Status);

public sealed record PlanningSnapshotDto(
    long Id,
    long CompanyId,
    long BranchId,
    long? PlanningPlanId,
    long? MrpRunId,
    string SnapshotCode,
    string SnapshotType,
    string InputHash,
    string OutputHash,
    int DemandLineCount,
    int SupplyLineCount,
    int ExceptionCount,
    decimal PlannedQuantity,
    DateTimeOffset CapturedOn,
    string Status);

public sealed record PlanningSnapshotCreateRequest(
    long CompanyId,
    long BranchId,
    long? PlanningPlanId,
    long? MrpRunId,
    string SnapshotCode,
    string SnapshotType,
    string InputHash,
    string OutputHash,
    int DemandLineCount,
    int SupplyLineCount,
    int ExceptionCount,
    decimal PlannedQuantity,
    string Status);

public sealed record PlannedOrderDto(
    long Id,
    long CompanyId,
    long BranchId,
    long? PlanningPlanId,
    long? MrpRunId,
    long? BoqRequirementLineId,
    string PlannedOrderNo,
    string OrderType,
    long ItemId,
    decimal Quantity,
    long UomId,
    DateOnly PlannedStartDate,
    DateOnly PlannedDueDate,
    long? SourceWarehouseId,
    long? TargetWarehouseId,
    long? BomRevisionId,
    long? RoutingId,
    bool IsFirm,
    bool IsReleased,
    bool IsExpedite,
    string PeggingSourceType,
    long? PeggingSourceId,
    string Status,
    long? TargetDocumentId,
    string? TargetDocumentType);

public sealed record PlannedOrderUpsertRequest(
    long CompanyId,
    long BranchId,
    long? PlanningPlanId,
    long? MrpRunId,
    long? BoqRequirementLineId,
    string PlannedOrderNo,
    string OrderType,
    long ItemId,
    decimal Quantity,
    long UomId,
    DateOnly PlannedStartDate,
    DateOnly PlannedDueDate,
    long? SourceWarehouseId,
    long? TargetWarehouseId,
    long? BomRevisionId,
    long? RoutingId,
    bool IsFirm,
    bool IsExpedite,
    string PeggingSourceType,
    long? PeggingSourceId,
    string Status,
    string? ItemCode = null);

public sealed record PlannedOrderConversionResultDto(
    long PlannedOrderId,
    string TargetDocumentType,
    long TargetDocumentId,
    string TargetDocumentNo,
    string Status);

public sealed record ShortageActionDto(
    long Id,
    long CompanyId,
    long BranchId,
    long? PlannedOrderId,
    long? MrpRunItemId,
    long ItemId,
    decimal ShortageQuantity,
    string ActionType,
    long? OwnerUserId,
    DateOnly DueDate,
    string ReasonCode,
    string Status,
    string ResolutionNote);

public sealed record ShortageActionUpsertRequest(
    long CompanyId,
    long BranchId,
    long? PlannedOrderId,
    long? MrpRunItemId,
    long ItemId,
    decimal ShortageQuantity,
    string ActionType,
    long? OwnerUserId,
    DateOnly DueDate,
    string ReasonCode,
    string Status,
    string ResolutionNote,
    string? ItemCode = null);
