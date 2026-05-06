namespace STS.Mfg.Application.Contracts.Production;

public sealed record MachineBoardQuery(
    DateTime DateFrom,
    DateTime DateTo,
    int Page = 1,
    int PageSize = 25,
    long? WorkCenterId = null,
    long? MachineId = null,
    string? MachineStatus = null,
    long? ItemId = null,
    long? WorkOrderId = null,
    long? JobCardId = null);

public sealed record MachineBoardItem(
    long MachineId,
    string MachineCode,
    string MachineName,
    long? WorkCenterId,
    string CurrentStatus,
    long? ActiveJobCardId,
    string? ActiveJobCardNo,
    string? ActiveWorkOrderNo,
    string? ItemCode,
    DateTimeOffset? PlannedStartOn,
    DateTimeOffset? PlannedEndOn,
    string? RiskStatus,
    string QueuedJobCardsJson);
