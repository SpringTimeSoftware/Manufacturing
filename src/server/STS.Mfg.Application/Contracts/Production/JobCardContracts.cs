using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Production;

public sealed record JobCardFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? WorkOrderId = null,
    long? WorkOrderOperationId = null,
    long? MachineId = null,
    long? OperatorUserId = null,
    long? ShiftId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record DowntimeFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? JobCardId = null,
    long? MachineId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record JobCardEventDto(
    long Id,
    string EventType,
    long? MachineId,
    long? OperatorUserId,
    DateTimeOffset EventOn,
    decimal? Quantity,
    string? ReasonCode,
    string? Remarks);

public sealed record DowntimeEventDto(
    long Id,
    long JobCardId,
    long MachineId,
    string ReasonCode,
    DateTimeOffset StartOn,
    DateTimeOffset EndOn,
    decimal DurationMinutes,
    string? Remarks);

public sealed record JobCardSummaryDto(
    long Id,
    long CompanyId,
    long BranchId,
    string JobCardNo,
    long WorkOrderId,
    string? WorkOrderNo,
    long WorkOrderOperationId,
    long OperationId,
    int? SplitSequenceNo,
    long? AssignedMachineId,
    long? AssignedOperatorUserId,
    long? ShiftId,
    decimal PlannedQuantity,
    decimal CompletedGoodQty,
    decimal CompletedRejectQty,
    decimal CompletedScrapQty,
    string Status);

public sealed record JobCardDto(
    long Id,
    long CompanyId,
    long BranchId,
    string JobCardNo,
    long WorkOrderId,
    string? WorkOrderNo,
    long WorkOrderOperationId,
    long OperationId,
    long? ParentJobCardId,
    int? SplitSequenceNo,
    long? AssignedMachineId,
    long? AssignedOperatorUserId,
    long? ShiftId,
    decimal PlannedQuantity,
    decimal CompletedGoodQty,
    decimal CompletedRejectQty,
    decimal CompletedScrapQty,
    string Status,
    IReadOnlyCollection<JobCardEventDto> Events,
    IReadOnlyCollection<DowntimeEventDto> Downtimes);

public sealed record CreateJobCardsRequest(long WorkOrderId, bool RegenerateIfExists = false);

public sealed record JobCardAssignRequest(
    long? MachineId,
    long? OperatorUserId,
    long? ShiftId,
    string? Remarks);

public sealed record JobCardStartRequest(
    long MachineId,
    long OperatorUserId,
    DateTimeOffset? EventOn = null,
    string? Remarks = null);

public sealed record JobCardPauseRequest(
    string ReasonCode,
    string? Remarks = null);

public sealed record JobCardResumeRequest(
    long? MachineId = null,
    long? OperatorUserId = null,
    string? Remarks = null);

public sealed record JobCardQuantityRequest(
    decimal GoodQty = 0,
    decimal RejectQty = 0,
    decimal ScrapQty = 0,
    decimal? CatchWeightQty = null,
    string? ReasonCode = null,
    string? Remarks = null);

public sealed record JobCardQuantityResultDto(
    long JobCardId,
    string JobCardNo,
    decimal CompletedGoodQty,
    decimal CompletedRejectQty,
    decimal CompletedScrapQty,
    decimal TotalProcessedQty,
    decimal RemainingQuantity,
    string Status);

public sealed record JobCardDowntimeRequest(
    long MachineId,
    string ReasonCode,
    DateTimeOffset StartOn,
    DateTimeOffset EndOn,
    string? Remarks = null);

public sealed record JobCardCompleteRequest(string? Remarks = null);

public sealed record JobCardReplayActionRequest(
    string ActionType,
    long JobCardId,
    long? MachineId = null,
    long? OperatorUserId = null,
    long? ShiftId = null,
    DateTimeOffset? EventOn = null,
    DateTimeOffset? StartOn = null,
    DateTimeOffset? EndOn = null,
    decimal GoodQty = 0,
    decimal RejectQty = 0,
    decimal ScrapQty = 0,
    decimal? CatchWeightQty = null,
    string? ReasonCode = null,
    string? Remarks = null);

public sealed record JobCardReplayRequest(IReadOnlyCollection<JobCardReplayActionRequest> Actions);

public sealed record JobCardReplayActionResult(
    string ActionType,
    long JobCardId,
    bool Success,
    string? Status,
    string? ReferenceNo,
    string? Message,
    IReadOnlyCollection<ApiError> Errors);

public sealed record JobCardReplayResult(IReadOnlyCollection<JobCardReplayActionResult> Results);
