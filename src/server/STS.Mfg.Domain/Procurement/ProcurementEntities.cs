using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Procurement;

public sealed class PurchaseRequisition : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private PurchaseRequisition()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string PurchaseRequisitionNo { get; private set; } = string.Empty;
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long? SourceDocumentId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static PurchaseRequisition Create(
        long companyId,
        long branchId,
        string purchaseRequisitionNo,
        string sourceDocumentType,
        long? sourceDocumentId,
        string status,
        long? userId)
    {
        var entity = new PurchaseRequisition { CompanyId = companyId, BranchId = branchId };
        entity.Update(purchaseRequisitionNo, sourceDocumentType, sourceDocumentId, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string purchaseRequisitionNo,
        string sourceDocumentType,
        long? sourceDocumentId,
        string status,
        long? userId)
    {
        PurchaseRequisitionNo = purchaseRequisitionNo.Trim();
        SourceDocumentType = sourceDocumentType.Trim();
        SourceDocumentId = sourceDocumentId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PurchaseRequisitionLine : AuditableEntity
{
    private PurchaseRequisitionLine()
    {
    }

    public long PurchaseRequisitionId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public decimal RequiredQuantity { get; private set; }
    public long OrderUomId { get; private set; }
    public DateOnly NeedByDate { get; private set; }
    public long? SourceBoqRequirementLineId { get; private set; }
    public long? LinkedWorkOrderId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static PurchaseRequisitionLine Create(
        long purchaseRequisitionId,
        int lineNo,
        long itemId,
        decimal requiredQuantity,
        long orderUomId,
        DateOnly needByDate,
        long? sourceBoqRequirementLineId,
        long? linkedWorkOrderId,
        string status,
        long? userId)
    {
        var entity = new PurchaseRequisitionLine
        {
            PurchaseRequisitionId = purchaseRequisitionId,
            LineNo = lineNo,
            ItemId = itemId,
            OrderUomId = orderUomId
        };
        entity.Update(requiredQuantity, needByDate, sourceBoqRequirementLineId, linkedWorkOrderId, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        decimal requiredQuantity,
        DateOnly needByDate,
        long? sourceBoqRequirementLineId,
        long? linkedWorkOrderId,
        string status,
        long? userId)
    {
        RequiredQuantity = requiredQuantity;
        NeedByDate = needByDate;
        SourceBoqRequirementLineId = sourceBoqRequirementLineId;
        LinkedWorkOrderId = linkedWorkOrderId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PurchaseOrder : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private PurchaseOrder()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string PurchaseOrderNo { get; private set; } = string.Empty;
    public long SupplierId { get; private set; }
    public long? OrderAddressId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public DateOnly? ExpectedReceiptDate { get; private set; }

    public static PurchaseOrder Create(
        long companyId,
        long branchId,
        string purchaseOrderNo,
        long supplierId,
        long? orderAddressId,
        string status,
        DateOnly? expectedReceiptDate,
        long? userId)
    {
        var entity = new PurchaseOrder
        {
            CompanyId = companyId,
            BranchId = branchId,
            SupplierId = supplierId,
            OrderAddressId = orderAddressId
        };
        entity.Update(purchaseOrderNo, status, expectedReceiptDate, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string purchaseOrderNo,
        string status,
        DateOnly? expectedReceiptDate,
        long? userId)
    {
        PurchaseOrderNo = purchaseOrderNo.Trim();
        Status = status.Trim();
        ExpectedReceiptDate = expectedReceiptDate;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PurchaseOrderLine : AuditableEntity
{
    private PurchaseOrderLine()
    {
    }

    public long PurchaseOrderId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public long? PurchaseRequisitionLineId { get; private set; }
    public decimal OrderedQuantity { get; private set; }
    public long OrderUomId { get; private set; }
    public DateOnly ExpectedDate { get; private set; }
    public long? LinkedWorkOrderId { get; private set; }
    public long? SourceBoqRequirementLineId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static PurchaseOrderLine Create(
        long purchaseOrderId,
        int lineNo,
        long itemId,
        long? purchaseRequisitionLineId,
        decimal orderedQuantity,
        long orderUomId,
        DateOnly expectedDate,
        long? linkedWorkOrderId,
        long? sourceBoqRequirementLineId,
        string status,
        long? userId)
    {
        var entity = new PurchaseOrderLine
        {
            PurchaseOrderId = purchaseOrderId,
            LineNo = lineNo,
            ItemId = itemId,
            PurchaseRequisitionLineId = purchaseRequisitionLineId,
            OrderUomId = orderUomId
        };
        entity.Update(orderedQuantity, expectedDate, linkedWorkOrderId, sourceBoqRequirementLineId, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        decimal orderedQuantity,
        DateOnly expectedDate,
        long? linkedWorkOrderId,
        long? sourceBoqRequirementLineId,
        string status,
        long? userId)
    {
        OrderedQuantity = orderedQuantity;
        ExpectedDate = expectedDate;
        LinkedWorkOrderId = linkedWorkOrderId;
        SourceBoqRequirementLineId = sourceBoqRequirementLineId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class SubcontractOrder : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private SubcontractOrder()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string SubcontractOrderNo { get; private set; } = string.Empty;
    public long SupplierId { get; private set; }
    public long? WorkOrderId { get; private set; }
    public long? OperationId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public DateOnly? ExpectedReturnDate { get; private set; }

    public static SubcontractOrder Create(
        long companyId,
        long branchId,
        string subcontractOrderNo,
        long supplierId,
        long? workOrderId,
        long? operationId,
        string status,
        DateOnly? expectedReturnDate,
        long? userId)
    {
        var entity = new SubcontractOrder
        {
            CompanyId = companyId,
            BranchId = branchId,
            SupplierId = supplierId,
            WorkOrderId = workOrderId,
            OperationId = operationId
        };
        entity.Update(subcontractOrderNo, status, expectedReturnDate, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string subcontractOrderNo,
        string status,
        DateOnly? expectedReturnDate,
        long? userId)
    {
        SubcontractOrderNo = subcontractOrderNo.Trim();
        Status = status.Trim();
        ExpectedReturnDate = expectedReturnDate;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
