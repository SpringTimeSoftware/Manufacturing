using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Resources;

public sealed record ResourceFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    long? CompanyId = null,
    long? BranchId = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record OperationDto(long Id, long CompanyId, string OperationCode, string OperationName, string OperationType, long? DefaultWorkCenterId, decimal DefaultSetupMinutes, decimal DefaultRunMinutesPerUnit, decimal DefaultTeardownMinutes, bool AllowsOverlap, bool IsOutsideProcessing, bool RequiresQcCheckpoint, string Status);
public sealed record OperationUpsertRequest(long CompanyId, string OperationCode, string OperationName, string OperationType, long? DefaultWorkCenterId, decimal DefaultSetupMinutes, decimal DefaultRunMinutesPerUnit, decimal DefaultTeardownMinutes, bool AllowsOverlap, bool IsOutsideProcessing, bool RequiresQcCheckpoint, string Status);
public sealed record WorkCenterDto(long Id, long CompanyId, long BranchId, string WorkCenterCode, string WorkCenterName, long? DepartmentId, long? CapacityUomId, string? DefaultShiftPatternCode, int ParallelCapacityUnits, string Status);
public sealed record WorkCenterUpsertRequest(long CompanyId, long BranchId, string WorkCenterCode, string WorkCenterName, long? DepartmentId, long? CapacityUomId, string? DefaultShiftPatternCode, int ParallelCapacityUnits, string Status);
public sealed record MachineDto(long Id, long CompanyId, long BranchId, long WorkCenterId, string MachineCode, string MachineName, decimal CapacityPerHour, string CurrentStatus, long? DefaultShiftId, bool IsUnderMaintenance, bool IsSchedulingEnabled, string Status);
public sealed record MachineUpsertRequest(long CompanyId, long BranchId, long WorkCenterId, string MachineCode, string MachineName, decimal CapacityPerHour, string CurrentStatus, long? DefaultShiftId, bool IsUnderMaintenance, bool IsSchedulingEnabled, string Status);
public sealed record ToolDto(long Id, long CompanyId, long? BranchId, string ToolCode, string ToolName, string ToolType, string? CompatibleMachineGroup, string Status);
public sealed record ToolUpsertRequest(long CompanyId, long? BranchId, string ToolCode, string ToolName, string ToolType, string? CompatibleMachineGroup, string Status);
