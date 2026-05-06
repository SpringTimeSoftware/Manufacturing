using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Production;

public sealed class WorkOrder : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private WorkOrder()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string WorkOrderNo { get; private set; } = string.Empty;
    public long? SalesOrderLineId { get; private set; }
    public long ItemId { get; private set; }
    public long BomRevisionId { get; private set; }
    public long? RoutingId { get; private set; }
    public decimal PlannedQuantity { get; private set; }
    public long ProductionUomId { get; private set; }
    public DateOnly? PlannedStartDate { get; private set; }
    public DateOnly? PlannedEndDate { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }
    public DateTimeOffset? ReleasedOn { get; private set; }
    public DateTimeOffset? ClosedOn { get; private set; }
    public DateTimeOffset? CancelledOn { get; private set; }

    public static WorkOrder Create(
        long companyId,
        long branchId,
        string workOrderNo,
        long? salesOrderLineId,
        long itemId,
        long bomRevisionId,
        long? routingId,
        decimal plannedQuantity,
        long productionUomId,
        DateOnly? plannedStartDate,
        DateOnly? plannedEndDate,
        string status,
        string? remarks,
        long? userId)
    {
        var entity = new WorkOrder
        {
            CompanyId = companyId,
            BranchId = branchId,
            SalesOrderLineId = salesOrderLineId,
            ItemId = itemId,
            BomRevisionId = bomRevisionId,
            RoutingId = routingId,
            ProductionUomId = productionUomId
        };
        entity.Update(workOrderNo, plannedQuantity, plannedStartDate, plannedEndDate, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string workOrderNo,
        decimal plannedQuantity,
        DateOnly? plannedStartDate,
        DateOnly? plannedEndDate,
        string status,
        string? remarks,
        long? userId)
    {
        WorkOrderNo = workOrderNo.Trim();
        PlannedQuantity = plannedQuantity;
        PlannedStartDate = plannedStartDate;
        PlannedEndDate = plannedEndDate;
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void UpdatePlanningLinks(
        long? salesOrderLineId,
        long itemId,
        long bomRevisionId,
        long? routingId,
        long productionUomId,
        long? userId)
    {
        SalesOrderLineId = salesOrderLineId;
        ItemId = itemId;
        BomRevisionId = bomRevisionId;
        RoutingId = routingId;
        ProductionUomId = productionUomId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkReleased(string? remarks, DateTimeOffset releasedOn, long? userId)
    {
        Status = "Released";
        Remarks = string.IsNullOrWhiteSpace(remarks) ? Remarks : remarks.Trim();
        ReleasedOn = releasedOn;
        CancelledOn = null;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkClosed(string? remarks, DateTimeOffset closedOn, long? userId)
    {
        Status = "Closed";
        Remarks = string.IsNullOrWhiteSpace(remarks) ? Remarks : remarks.Trim();
        ClosedOn = closedOn;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkCancelled(string? remarks, DateTimeOffset cancelledOn, long? userId)
    {
        Status = "Cancelled";
        Remarks = string.IsNullOrWhiteSpace(remarks) ? Remarks : remarks.Trim();
        CancelledOn = cancelledOn;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void SetExecutionStatus(string status, string? remarks, long? userId)
    {
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? Remarks : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class WorkOrderOperation : AuditableEntity
{
    private WorkOrderOperation()
    {
    }

    public long WorkOrderId { get; private set; }
    public int SequenceNo { get; private set; }
    public long OperationId { get; private set; }
    public long? RoutingOperationId { get; private set; }
    public long? WorkCenterId { get; private set; }
    public decimal PlannedQuantity { get; private set; }
    public decimal CompletedQuantity { get; private set; }
    public bool RequiresQcCheckpoint { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static WorkOrderOperation Create(
        long workOrderId,
        int sequenceNo,
        long operationId,
        long? routingOperationId,
        long? workCenterId,
        decimal plannedQuantity,
        decimal completedQuantity,
        bool requiresQcCheckpoint,
        string status,
        long? userId)
    {
        var entity = new WorkOrderOperation
        {
            WorkOrderId = workOrderId,
            SequenceNo = sequenceNo,
            OperationId = operationId,
            RoutingOperationId = routingOperationId
        };
        entity.UpdateDefinition(workCenterId, plannedQuantity, requiresQcCheckpoint, status, userId);
        entity.CompletedQuantity = completedQuantity;
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void UpdateDefinition(
        long? workCenterId,
        decimal plannedQuantity,
        bool requiresQcCheckpoint,
        string status,
        long? userId)
    {
        WorkCenterId = workCenterId;
        PlannedQuantity = plannedQuantity;
        RequiresQcCheckpoint = requiresQcCheckpoint;
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

    public void UpdateExecutionProgress(decimal completedQuantity, string status, long? userId)
    {
        CompletedQuantity = completedQuantity;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
