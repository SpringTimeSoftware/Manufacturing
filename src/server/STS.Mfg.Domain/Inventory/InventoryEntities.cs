using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Inventory;

public sealed class StockBalance : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private StockBalance()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long? BinId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public decimal OnHandQty { get; private set; }
    public decimal ReservedQty { get; private set; }
    public decimal QcHoldQty { get; private set; }
    public decimal BlockedQty { get; private set; }
    public decimal InTransitQty { get; private set; }
    public decimal? CatchWeightQty { get; private set; }

    public static StockBalance Create(
        long companyId,
        long branchId,
        long itemId,
        long? itemVariantId,
        long warehouseId,
        long? binId,
        long? lotId,
        long? serialId,
        decimal onHandQty,
        decimal reservedQty,
        decimal qcHoldQty,
        decimal blockedQty,
        decimal inTransitQty,
        decimal? catchWeightQty,
        long? userId)
    {
        var entity = new StockBalance
        {
            CompanyId = companyId,
            BranchId = branchId,
            WarehouseId = warehouseId,
            ItemId = itemId,
            ItemVariantId = itemVariantId,
            BinId = binId,
            LotId = lotId,
            SerialId = serialId
        };
        entity.UpdateQuantities(onHandQty, reservedQty, qcHoldQty, blockedQty, inTransitQty, catchWeightQty, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void UpdateQuantities(
        decimal onHandQty,
        decimal reservedQty,
        decimal qcHoldQty,
        decimal blockedQty,
        decimal inTransitQty,
        decimal? catchWeightQty,
        long? userId)
    {
        OnHandQty = onHandQty;
        ReservedQty = reservedQty;
        QcHoldQty = qcHoldQty;
        BlockedQty = blockedQty;
        InTransitQty = inTransitQty;
        CatchWeightQty = catchWeightQty;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class StockTransaction : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private StockTransaction()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string TransactionNo { get; private set; } = string.Empty;
    public string TransactionType { get; private set; } = string.Empty;
    public DateOnly PostingDate { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long? FromWarehouseId { get; private set; }
    public long? FromBinId { get; private set; }
    public long? ToWarehouseId { get; private set; }
    public long? ToBinId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal? CatchWeightQty { get; private set; }
    public string InventoryState { get; private set; } = string.Empty;
    public string? SourceDocumentType { get; private set; }
    public long? SourceDocumentId { get; private set; }
    public string? Remarks { get; private set; }

    public static StockTransaction Create(
        long companyId,
        long branchId,
        string transactionNo,
        string transactionType,
        DateOnly postingDate,
        long itemId,
        long? itemVariantId,
        long? fromWarehouseId,
        long? fromBinId,
        long? toWarehouseId,
        long? toBinId,
        long? lotId,
        long? serialId,
        decimal quantity,
        decimal? catchWeightQty,
        string inventoryState,
        string? sourceDocumentType,
        long? sourceDocumentId,
        string? remarks,
        long? userId)
    {
        var entity = new StockTransaction
        {
            CompanyId = companyId,
            BranchId = branchId,
            ItemId = itemId,
            ItemVariantId = itemVariantId,
            FromWarehouseId = fromWarehouseId,
            FromBinId = fromBinId,
            ToWarehouseId = toWarehouseId,
            ToBinId = toBinId,
            LotId = lotId,
            SerialId = serialId,
            SourceDocumentId = sourceDocumentId
        };
        entity.Update(transactionNo, transactionType, postingDate, quantity, catchWeightQty, inventoryState, sourceDocumentType, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string transactionNo,
        string transactionType,
        DateOnly postingDate,
        decimal quantity,
        decimal? catchWeightQty,
        string inventoryState,
        string? sourceDocumentType,
        string? remarks,
        long? userId)
    {
        TransactionNo = transactionNo.Trim();
        TransactionType = transactionType.Trim();
        PostingDate = postingDate;
        Quantity = quantity;
        CatchWeightQty = catchWeightQty;
        InventoryState = inventoryState.Trim();
        SourceDocumentType = string.IsNullOrWhiteSpace(sourceDocumentType) ? null : sourceDocumentType.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class StockReservation : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private StockReservation()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long? BinId { get; private set; }
    public long? LotId { get; private set; }
    public decimal ReservedQuantity { get; private set; }
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long SourceDocumentId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static StockReservation Create(
        long companyId,
        long branchId,
        long itemId,
        long? itemVariantId,
        long? warehouseId,
        long? binId,
        long? lotId,
        decimal reservedQuantity,
        string sourceDocumentType,
        long sourceDocumentId,
        string status,
        long? userId)
    {
        var entity = new StockReservation
        {
            CompanyId = companyId,
            BranchId = branchId,
            WarehouseId = warehouseId,
            ItemId = itemId,
            ItemVariantId = itemVariantId,
            BinId = binId,
            LotId = lotId,
            SourceDocumentId = sourceDocumentId
        };
        entity.Update(reservedQuantity, sourceDocumentType, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal reservedQuantity, string sourceDocumentType, string status, long? userId)
    {
        ReservedQuantity = reservedQuantity;
        SourceDocumentType = sourceDocumentType.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Lot : AuditableEntity, ICompanyScoped
{
    private Lot()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public string LotNo { get; private set; } = string.Empty;
    public DateOnly? ManufacturedOn { get; private set; }
    public DateOnly? ExpiryOn { get; private set; }
    public string LotStatus { get; private set; } = string.Empty;
    public decimal? CatchWeightQty { get; private set; }

    public static Lot Create(
        long companyId,
        long itemId,
        string lotNo,
        DateOnly? manufacturedOn,
        DateOnly? expiryOn,
        string lotStatus,
        decimal? catchWeightQty,
        long? userId)
    {
        var entity = new Lot { CompanyId = companyId, ItemId = itemId };
        entity.Update(lotNo, manufacturedOn, expiryOn, lotStatus, catchWeightQty, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string lotNo,
        DateOnly? manufacturedOn,
        DateOnly? expiryOn,
        string lotStatus,
        decimal? catchWeightQty,
        long? userId)
    {
        LotNo = lotNo.Trim();
        ManufacturedOn = manufacturedOn;
        ExpiryOn = expiryOn;
        LotStatus = lotStatus.Trim();
        CatchWeightQty = catchWeightQty;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Serial : AuditableEntity, ICompanyScoped
{
    private Serial()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public string SerialNo { get; private set; } = string.Empty;
    public long? LotId { get; private set; }
    public long? CurrentWarehouseId { get; private set; }
    public long? CurrentBinId { get; private set; }
    public string SerialStatus { get; private set; } = string.Empty;
    public DateOnly? ManufacturedOn { get; private set; }
    public DateOnly? ExpiryOn { get; private set; }

    public static Serial Create(
        long companyId,
        long itemId,
        string serialNo,
        long? lotId,
        long? currentWarehouseId,
        long? currentBinId,
        string serialStatus,
        DateOnly? manufacturedOn,
        DateOnly? expiryOn,
        long? userId)
    {
        var entity = new Serial { CompanyId = companyId, ItemId = itemId };
        entity.Update(serialNo, lotId, currentWarehouseId, currentBinId, serialStatus, manufacturedOn, expiryOn, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string serialNo,
        long? lotId,
        long? currentWarehouseId,
        long? currentBinId,
        string serialStatus,
        DateOnly? manufacturedOn,
        DateOnly? expiryOn,
        long? userId)
    {
        SerialNo = serialNo.Trim();
        LotId = lotId;
        CurrentWarehouseId = currentWarehouseId;
        CurrentBinId = currentBinId;
        SerialStatus = serialStatus.Trim();
        ManufacturedOn = manufacturedOn;
        ExpiryOn = expiryOn;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class CycleCount : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private CycleCount()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId { get; private set; }
    public string CountNo { get; private set; } = string.Empty;
    public DateOnly CountDate { get; private set; }
    public string CountType { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }
    public DateTimeOffset? PostedOn { get; private set; }

    public static CycleCount Create(
        long companyId,
        long branchId,
        long warehouseId,
        string countNo,
        DateOnly countDate,
        string countType,
        string status,
        string? remarks,
        long? userId)
    {
        var entity = new CycleCount { CompanyId = companyId, BranchId = branchId, WarehouseId = warehouseId };
        entity.Update(countNo, countDate, countType, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string countNo,
        DateOnly countDate,
        string countType,
        string status,
        string? remarks,
        long? userId)
    {
        CountNo = countNo.Trim();
        CountDate = countDate;
        CountType = countType.Trim();
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkPosted(DateTimeOffset postedOn, long? userId)
    {
        PostedOn = postedOn;
        Status = "Posted";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class CycleCountLine : AuditableEntity
{
    private CycleCountLine()
    {
    }

    public long CycleCountId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long? BinId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public decimal SystemQuantity { get; private set; }
    public decimal CountedQuantity { get; private set; }
    public decimal VarianceQuantity { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static CycleCountLine Create(
        long cycleCountId,
        int lineNo,
        long itemId,
        long? itemVariantId,
        long? binId,
        long? lotId,
        long? serialId,
        decimal systemQuantity,
        decimal countedQuantity,
        string status,
        string? remarks,
        long? userId)
    {
        var entity = new CycleCountLine
        {
            CycleCountId = cycleCountId,
            LineNo = lineNo,
            ItemId = itemId,
            ItemVariantId = itemVariantId,
            BinId = binId,
            LotId = lotId,
            SerialId = serialId
        };
        entity.Update(systemQuantity, countedQuantity, countedQuantity - systemQuantity, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        decimal systemQuantity,
        decimal countedQuantity,
        decimal varianceQuantity,
        string status,
        string? remarks,
        long? userId)
    {
        SystemQuantity = systemQuantity;
        CountedQuantity = countedQuantity;
        VarianceQuantity = varianceQuantity;
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
