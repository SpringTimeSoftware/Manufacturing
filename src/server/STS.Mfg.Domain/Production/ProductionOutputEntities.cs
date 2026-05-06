using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Production;

public sealed class ProductionReceipt : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ProductionReceipt()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ReceiptNo { get; private set; } = string.Empty;
    public DateOnly PostingDate { get; private set; }
    public long? WorkOrderId { get; private set; }
    public long? JobCardId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? CorrelationId { get; private set; }
    public string? Remarks { get; private set; }
    public DateTimeOffset? PostedOn { get; private set; }

    public static ProductionReceipt Create(
        long companyId,
        long branchId,
        string receiptNo,
        DateOnly postingDate,
        long? workOrderId,
        long? jobCardId,
        string status,
        string? correlationId,
        string? remarks,
        DateTimeOffset? postedOn,
        long? userId)
    {
        var entity = new ProductionReceipt
        {
            CompanyId = companyId,
            BranchId = branchId,
            WorkOrderId = workOrderId,
            JobCardId = jobCardId
        };
        entity.Update(receiptNo, postingDate, status, correlationId, remarks, postedOn, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string receiptNo,
        DateOnly postingDate,
        string status,
        string? correlationId,
        string? remarks,
        DateTimeOffset? postedOn,
        long? userId)
    {
        ReceiptNo = receiptNo.Trim();
        PostingDate = postingDate;
        Status = status.Trim();
        CorrelationId = string.IsNullOrWhiteSpace(correlationId) ? null : correlationId.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        PostedOn = postedOn;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ProductionReceiptLine : AuditableEntity
{
    private ProductionReceiptLine()
    {
    }

    public long ProductionReceiptId { get; private set; }
    public int LineNo { get; private set; }
    public string LineType { get; private set; } = string.Empty;
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long OutputUomId { get; private set; }
    public long WarehouseId { get; private set; }
    public long? BinId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal? CatchWeightQty { get; private set; }
    public string InventoryState { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static ProductionReceiptLine Create(
        long productionReceiptId,
        int lineNo,
        string lineType,
        long itemId,
        long? itemVariantId,
        long outputUomId,
        long warehouseId,
        long? binId,
        long? lotId,
        long? serialId,
        decimal quantity,
        decimal? catchWeightQty,
        string inventoryState,
        string? remarks,
        long? userId)
    {
        var entity = new ProductionReceiptLine
        {
            ProductionReceiptId = productionReceiptId,
            LineNo = lineNo,
            ItemId = itemId,
            ItemVariantId = itemVariantId,
            OutputUomId = outputUomId,
            WarehouseId = warehouseId,
            BinId = binId,
            LotId = lotId,
            SerialId = serialId
        };
        entity.Update(lineType, quantity, catchWeightQty, inventoryState, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string lineType,
        decimal quantity,
        decimal? catchWeightQty,
        string inventoryState,
        string? remarks,
        long? userId)
    {
        LineType = lineType.Trim();
        Quantity = quantity;
        CatchWeightQty = catchWeightQty;
        InventoryState = inventoryState.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ScrapEntry : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ScrapEntry()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ScrapNo { get; private set; } = string.Empty;
    public DateOnly PostingDate { get; private set; }
    public long? WorkOrderId { get; private set; }
    public long? JobCardId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long WarehouseId { get; private set; }
    public long? BinId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal? CatchWeightQty { get; private set; }
    public string ReasonCode { get; private set; } = string.Empty;
    public string InventoryState { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static ScrapEntry Create(
        long companyId,
        long branchId,
        string scrapNo,
        DateOnly postingDate,
        long? workOrderId,
        long? jobCardId,
        long itemId,
        long? itemVariantId,
        long warehouseId,
        long? binId,
        long? lotId,
        long? serialId,
        decimal quantity,
        decimal? catchWeightQty,
        string reasonCode,
        string inventoryState,
        string status,
        string? remarks,
        long? userId)
    {
        var entity = new ScrapEntry
        {
            CompanyId = companyId,
            BranchId = branchId,
            WorkOrderId = workOrderId,
            JobCardId = jobCardId,
            ItemId = itemId,
            ItemVariantId = itemVariantId,
            WarehouseId = warehouseId,
            BinId = binId,
            LotId = lotId,
            SerialId = serialId
        };
        entity.Update(scrapNo, postingDate, quantity, catchWeightQty, reasonCode, inventoryState, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string scrapNo,
        DateOnly postingDate,
        decimal quantity,
        decimal? catchWeightQty,
        string reasonCode,
        string inventoryState,
        string status,
        string? remarks,
        long? userId)
    {
        ScrapNo = scrapNo.Trim();
        PostingDate = postingDate;
        Quantity = quantity;
        CatchWeightQty = catchWeightQty;
        ReasonCode = reasonCode.Trim();
        InventoryState = inventoryState.Trim();
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ReworkOrder : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ReworkOrder()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ReworkNo { get; private set; } = string.Empty;
    public string? SourceDocumentType { get; private set; }
    public long? SourceDocumentId { get; private set; }
    public long? WorkOrderId { get; private set; }
    public long? JobCardId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long? SourceWarehouseId { get; private set; }
    public long? SourceBinId { get; private set; }
    public long? TargetWarehouseId { get; private set; }
    public long? TargetBinId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal? CatchWeightQty { get; private set; }
    public string? ReasonCode { get; private set; }
    public string? Instructions { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset? ReleasedOn { get; private set; }
    public DateTimeOffset? ClosedOn { get; private set; }

    public static ReworkOrder Create(
        long companyId,
        long branchId,
        string reworkNo,
        string? sourceDocumentType,
        long? sourceDocumentId,
        long? workOrderId,
        long? jobCardId,
        long itemId,
        long? itemVariantId,
        long? sourceWarehouseId,
        long? sourceBinId,
        long? targetWarehouseId,
        long? targetBinId,
        decimal quantity,
        decimal? catchWeightQty,
        string? reasonCode,
        string? instructions,
        string status,
        long? userId)
    {
        var entity = new ReworkOrder
        {
            CompanyId = companyId,
            BranchId = branchId,
            SourceDocumentId = sourceDocumentId,
            WorkOrderId = workOrderId,
            JobCardId = jobCardId,
            ItemId = itemId,
            ItemVariantId = itemVariantId,
            SourceWarehouseId = sourceWarehouseId,
            SourceBinId = sourceBinId,
            TargetWarehouseId = targetWarehouseId,
            TargetBinId = targetBinId
        };
        entity.Update(reworkNo, sourceDocumentType, quantity, catchWeightQty, reasonCode, instructions, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string reworkNo,
        string? sourceDocumentType,
        decimal quantity,
        decimal? catchWeightQty,
        string? reasonCode,
        string? instructions,
        string status,
        long? userId)
    {
        ReworkNo = reworkNo.Trim();
        SourceDocumentType = string.IsNullOrWhiteSpace(sourceDocumentType) ? null : sourceDocumentType.Trim();
        Quantity = quantity;
        CatchWeightQty = catchWeightQty;
        ReasonCode = string.IsNullOrWhiteSpace(reasonCode) ? null : reasonCode.Trim();
        Instructions = string.IsNullOrWhiteSpace(instructions) ? null : instructions.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkReleased(DateTimeOffset releasedOn, string? instructions, long? userId)
    {
        Status = "Released";
        ReleasedOn = releasedOn;
        if (!string.IsNullOrWhiteSpace(instructions))
        {
            Instructions = instructions.Trim();
        }

        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkCompleted(DateTimeOffset closedOn, string? instructions, long? userId)
    {
        Status = "Completed";
        ClosedOn = closedOn;
        if (!string.IsNullOrWhiteSpace(instructions))
        {
            Instructions = instructions.Trim();
        }

        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
