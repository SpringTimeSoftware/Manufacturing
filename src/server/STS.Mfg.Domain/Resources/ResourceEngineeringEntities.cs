using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Resources;

public sealed class Operation : AuditableEntity, ICompanyScoped
{
    private Operation()
    {
    }

    public long? CompanyId { get; private set; }
    public string OperationCode { get; private set; } = string.Empty;
    public string OperationName { get; private set; } = string.Empty;
    public string OperationType { get; private set; } = string.Empty;
    public long? DefaultWorkCenterId { get; private set; }
    public decimal DefaultSetupMinutes { get; private set; }
    public decimal DefaultRunMinutesPerUnit { get; private set; }
    public decimal DefaultTeardownMinutes { get; private set; }
    public bool AllowsOverlap { get; private set; }
    public bool IsOutsideProcessing { get; private set; }
    public bool RequiresQcCheckpoint { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Operation Create(long companyId, string operationCode, string operationName, string operationType, long? defaultWorkCenterId, decimal defaultSetupMinutes, decimal defaultRunMinutesPerUnit, decimal defaultTeardownMinutes, bool allowsOverlap, bool isOutsideProcessing, bool requiresQcCheckpoint, string status, long? userId)
    {
        var entity = new Operation { CompanyId = companyId };
        entity.Update(operationCode, operationName, operationType, defaultWorkCenterId, defaultSetupMinutes, defaultRunMinutesPerUnit, defaultTeardownMinutes, allowsOverlap, isOutsideProcessing, requiresQcCheckpoint, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string operationCode, string operationName, string operationType, long? defaultWorkCenterId, decimal defaultSetupMinutes, decimal defaultRunMinutesPerUnit, decimal defaultTeardownMinutes, bool allowsOverlap, bool isOutsideProcessing, bool requiresQcCheckpoint, string status, long? userId)
    {
        OperationCode = operationCode.Trim();
        OperationName = operationName.Trim();
        OperationType = operationType.Trim();
        DefaultWorkCenterId = defaultWorkCenterId;
        DefaultSetupMinutes = defaultSetupMinutes;
        DefaultRunMinutesPerUnit = defaultRunMinutesPerUnit;
        DefaultTeardownMinutes = defaultTeardownMinutes;
        AllowsOverlap = allowsOverlap;
        IsOutsideProcessing = isOutsideProcessing;
        RequiresQcCheckpoint = requiresQcCheckpoint;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class WorkCenter : AuditableEntity, ICompanyScoped, IBranchScoped, IDepartmentScoped
{
    private WorkCenter()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? DepartmentId { get; private set; }
    public string WorkCenterCode { get; private set; } = string.Empty;
    public string WorkCenterName { get; private set; } = string.Empty;
    public long? CapacityUomId { get; private set; }
    public string? DefaultShiftPatternCode { get; private set; }
    public int ParallelCapacityUnits { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static WorkCenter Create(long companyId, long branchId, string workCenterCode, string workCenterName, long? departmentId, long? capacityUomId, string? defaultShiftPatternCode, int parallelCapacityUnits, string status, long? userId)
    {
        var entity = new WorkCenter { CompanyId = companyId, BranchId = branchId, DepartmentId = departmentId };
        entity.Update(workCenterCode, workCenterName, capacityUomId, defaultShiftPatternCode, parallelCapacityUnits, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string workCenterCode, string workCenterName, long? capacityUomId, string? defaultShiftPatternCode, int parallelCapacityUnits, string status, long? userId)
    {
        WorkCenterCode = workCenterCode.Trim();
        WorkCenterName = workCenterName.Trim();
        CapacityUomId = capacityUomId;
        DefaultShiftPatternCode = string.IsNullOrWhiteSpace(defaultShiftPatternCode) ? null : defaultShiftPatternCode.Trim();
        ParallelCapacityUnits = parallelCapacityUnits;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Machine : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private Machine()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long WorkCenterId { get; private set; }
    public string MachineCode { get; private set; } = string.Empty;
    public string MachineName { get; private set; } = string.Empty;
    public decimal CapacityPerHour { get; private set; }
    public string CurrentStatus { get; private set; } = string.Empty;
    public long? DefaultShiftId { get; private set; }
    public bool IsUnderMaintenance { get; private set; }
    public bool IsSchedulingEnabled { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Machine Create(long companyId, long branchId, long workCenterId, string machineCode, string machineName, decimal capacityPerHour, string currentStatus, long? defaultShiftId, bool isUnderMaintenance, bool isSchedulingEnabled, string status, long? userId)
    {
        var entity = new Machine { CompanyId = companyId, BranchId = branchId, WorkCenterId = workCenterId };
        entity.Update(machineCode, machineName, capacityPerHour, currentStatus, defaultShiftId, isUnderMaintenance, isSchedulingEnabled, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string machineCode, string machineName, decimal capacityPerHour, string currentStatus, long? defaultShiftId, bool isUnderMaintenance, bool isSchedulingEnabled, string status, long? userId)
    {
        MachineCode = machineCode.Trim();
        MachineName = machineName.Trim();
        CapacityPerHour = capacityPerHour;
        CurrentStatus = currentStatus.Trim();
        DefaultShiftId = defaultShiftId;
        IsUnderMaintenance = isUnderMaintenance;
        IsSchedulingEnabled = isSchedulingEnabled;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Tool : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private Tool()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ToolCode { get; private set; } = string.Empty;
    public string ToolName { get; private set; } = string.Empty;
    public string ToolType { get; private set; } = string.Empty;
    public string? CompatibleMachineGroup { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Tool Create(long companyId, long? branchId, string toolCode, string toolName, string toolType, string? compatibleMachineGroup, string status, long? userId)
    {
        var entity = new Tool { CompanyId = companyId, BranchId = branchId };
        entity.Update(toolCode, toolName, toolType, compatibleMachineGroup, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string toolCode, string toolName, string toolType, string? compatibleMachineGroup, string status, long? userId)
    {
        ToolCode = toolCode.Trim();
        ToolName = toolName.Trim();
        ToolType = toolType.Trim();
        CompatibleMachineGroup = string.IsNullOrWhiteSpace(compatibleMachineGroup) ? null : compatibleMachineGroup.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Routing : AuditableEntity, ICompanyScoped
{
    private Routing()
    {
    }

    public long? CompanyId { get; private set; }
    public string RoutingCode { get; private set; } = string.Empty;
    public string RoutingName { get; private set; } = string.Empty;
    public long? OutputItemId { get; private set; }
    public string? RevisionCode { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Routing Create(long companyId, string routingCode, string routingName, long? outputItemId, string? revisionCode, string status, long? userId)
    {
        var entity = new Routing { CompanyId = companyId, OutputItemId = outputItemId };
        entity.Update(routingCode, routingName, revisionCode, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string routingCode, string routingName, string? revisionCode, string status, long? userId)
    {
        RoutingCode = routingCode.Trim();
        RoutingName = routingName.Trim();
        RevisionCode = string.IsNullOrWhiteSpace(revisionCode) ? null : revisionCode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class RoutingOperation : AuditableEntity
{
    private RoutingOperation()
    {
    }

    public long RoutingId { get; private set; }
    public int SequenceNo { get; private set; }
    public long OperationId { get; private set; }
    public long? WorkCenterId { get; private set; }
    public long? ToolId { get; private set; }
    public decimal SetupMinutes { get; private set; }
    public decimal RunMinutesPerUnit { get; private set; }
    public decimal TeardownMinutes { get; private set; }
    public decimal? OverlapPercent { get; private set; }
    public bool IsOutsideProcessing { get; private set; }
    public bool RequiresQcCheckpoint { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static RoutingOperation Create(long routingId, int sequenceNo, long operationId, long? workCenterId, long? toolId, decimal setupMinutes, decimal runMinutesPerUnit, decimal teardownMinutes, decimal? overlapPercent, bool isOutsideProcessing, bool requiresQcCheckpoint, string status, long? userId)
    {
        var entity = new RoutingOperation { RoutingId = routingId, SequenceNo = sequenceNo, OperationId = operationId };
        entity.Update(workCenterId, toolId, setupMinutes, runMinutesPerUnit, teardownMinutes, overlapPercent, isOutsideProcessing, requiresQcCheckpoint, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(long? workCenterId, long? toolId, decimal setupMinutes, decimal runMinutesPerUnit, decimal teardownMinutes, decimal? overlapPercent, bool isOutsideProcessing, bool requiresQcCheckpoint, string status, long? userId)
    {
        WorkCenterId = workCenterId;
        ToolId = toolId;
        SetupMinutes = setupMinutes;
        RunMinutesPerUnit = runMinutesPerUnit;
        TeardownMinutes = teardownMinutes;
        OverlapPercent = overlapPercent;
        IsOutsideProcessing = isOutsideProcessing;
        RequiresQcCheckpoint = requiresQcCheckpoint;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
