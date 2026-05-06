using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Production;

public sealed class JobCard : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private JobCard()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string JobCardNo { get; private set; } = string.Empty;
    public long WorkOrderId { get; private set; }
    public long WorkOrderOperationId { get; private set; }
    public long? ParentJobCardId { get; private set; }
    public int? SplitSequenceNo { get; private set; }
    public long? AssignedMachineId { get; private set; }
    public long? AssignedOperatorUserId { get; private set; }
    public long? ShiftId { get; private set; }
    public decimal PlannedQuantity { get; private set; }
    public decimal CompletedGoodQty { get; private set; }
    public decimal CompletedRejectQty { get; private set; }
    public decimal CompletedScrapQty { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static JobCard Create(
        long companyId,
        long branchId,
        string jobCardNo,
        long workOrderId,
        long workOrderOperationId,
        long? parentJobCardId,
        int? splitSequenceNo,
        long? assignedMachineId,
        long? assignedOperatorUserId,
        long? shiftId,
        decimal plannedQuantity,
        decimal completedGoodQty,
        decimal completedRejectQty,
        decimal completedScrapQty,
        string status,
        long? userId)
    {
        var entity = new JobCard
        {
            CompanyId = companyId,
            BranchId = branchId,
            WorkOrderId = workOrderId,
            WorkOrderOperationId = workOrderOperationId,
            ParentJobCardId = parentJobCardId,
            SplitSequenceNo = splitSequenceNo
        };
        entity.Update(jobCardNo, assignedMachineId, assignedOperatorUserId, shiftId, plannedQuantity, completedGoodQty, completedRejectQty, completedScrapQty, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string jobCardNo,
        long? assignedMachineId,
        long? assignedOperatorUserId,
        long? shiftId,
        decimal plannedQuantity,
        decimal completedGoodQty,
        decimal completedRejectQty,
        decimal completedScrapQty,
        string status,
        long? userId)
    {
        JobCardNo = jobCardNo.Trim();
        AssignedMachineId = assignedMachineId;
        AssignedOperatorUserId = assignedOperatorUserId;
        ShiftId = shiftId;
        PlannedQuantity = plannedQuantity;
        CompletedGoodQty = completedGoodQty;
        CompletedRejectQty = completedRejectQty;
        CompletedScrapQty = completedScrapQty;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void Assign(long? machineId, long? operatorUserId, long? shiftId, string status, long? userId)
    {
        AssignedMachineId = machineId;
        AssignedOperatorUserId = operatorUserId;
        ShiftId = shiftId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void Start(long machineId, long operatorUserId, string status, long? userId)
    {
        AssignedMachineId = machineId;
        AssignedOperatorUserId = operatorUserId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void SetStatus(string status, long? userId)
    {
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void LogQuantities(decimal goodQty, decimal rejectQty, decimal scrapQty, long? userId)
    {
        CompletedGoodQty += goodQty;
        CompletedRejectQty += rejectQty;
        CompletedScrapQty += scrapQty;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class JobCardEvent : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private JobCardEvent()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long JobCardId { get; private set; }
    public string EventType { get; private set; } = string.Empty;
    public long? MachineId { get; private set; }
    public long? OperatorUserId { get; private set; }
    public DateTimeOffset EventOn { get; private set; }
    public decimal? Quantity { get; private set; }
    public string? ReasonCode { get; private set; }
    public string? Remarks { get; private set; }

    public static JobCardEvent Create(
        long companyId,
        long branchId,
        long jobCardId,
        string eventType,
        long? machineId,
        long? operatorUserId,
        DateTimeOffset eventOn,
        decimal? quantity,
        string? reasonCode,
        string? remarks,
        long? userId)
    {
        var entity = new JobCardEvent { CompanyId = companyId, BranchId = branchId, JobCardId = jobCardId };
        entity.Update(eventType, machineId, operatorUserId, eventOn, quantity, reasonCode, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string eventType,
        long? machineId,
        long? operatorUserId,
        DateTimeOffset eventOn,
        decimal? quantity,
        string? reasonCode,
        string? remarks,
        long? userId)
    {
        EventType = eventType.Trim();
        MachineId = machineId;
        OperatorUserId = operatorUserId;
        EventOn = eventOn;
        Quantity = quantity;
        ReasonCode = string.IsNullOrWhiteSpace(reasonCode) ? null : reasonCode.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class DowntimeEvent : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private DowntimeEvent()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long JobCardId { get; private set; }
    public long MachineId { get; private set; }
    public string ReasonCode { get; private set; } = string.Empty;
    public DateTimeOffset StartOn { get; private set; }
    public DateTimeOffset EndOn { get; private set; }
    public decimal DurationMinutes { get; private set; }
    public string? Remarks { get; private set; }

    public static DowntimeEvent Create(
        long companyId,
        long branchId,
        long jobCardId,
        long machineId,
        string reasonCode,
        DateTimeOffset startOn,
        DateTimeOffset endOn,
        decimal durationMinutes,
        string? remarks,
        long? userId)
    {
        var entity = new DowntimeEvent { CompanyId = companyId, BranchId = branchId, JobCardId = jobCardId, MachineId = machineId };
        entity.Update(reasonCode, startOn, endOn, durationMinutes, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string reasonCode,
        DateTimeOffset startOn,
        DateTimeOffset endOn,
        decimal durationMinutes,
        string? remarks,
        long? userId)
    {
        ReasonCode = reasonCode.Trim();
        StartOn = startOn;
        EndOn = endOn;
        DurationMinutes = durationMinutes;
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
