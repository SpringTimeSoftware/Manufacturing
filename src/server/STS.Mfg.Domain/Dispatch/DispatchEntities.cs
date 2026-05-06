using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Dispatch;

public sealed class PackList : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private PackList()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string PackListNo { get; private set; } = string.Empty;
    public long? SalesOrderId { get; private set; }
    public DateOnly? PlannedShipDate { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static PackList Create(long companyId, long branchId, string packListNo, long? salesOrderId, DateOnly? plannedShipDate, string status, string? remarks, long? userId)
    {
        var entity = new PackList { CompanyId = companyId, BranchId = branchId, SalesOrderId = salesOrderId };
        entity.Update(packListNo, plannedShipDate, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string packListNo, DateOnly? plannedShipDate, string status, string? remarks, long? userId)
    {
        PackListNo = packListNo.Trim();
        PlannedShipDate = plannedShipDate;
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PackListLine : AuditableEntity
{
    private PackListLine()
    {
    }

    public long PackListId { get; private set; }
    public int LineNo { get; private set; }
    public long? SalesOrderLineId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long WarehouseId { get; private set; }
    public long? BinId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public decimal PackedQuantity { get; private set; }
    public long PackUomId { get; private set; }
    public string? PackageRef { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static PackListLine Create(
        long packListId,
        int lineNo,
        long? salesOrderLineId,
        long itemId,
        long? itemVariantId,
        long warehouseId,
        long? binId,
        long? lotId,
        long? serialId,
        decimal packedQuantity,
        long packUomId,
        string? packageRef,
        string status,
        long? userId)
    {
        var entity = new PackListLine
        {
            PackListId = packListId,
            LineNo = lineNo,
            SalesOrderLineId = salesOrderLineId,
            ItemId = itemId,
            ItemVariantId = itemVariantId,
            WarehouseId = warehouseId,
            BinId = binId,
            LotId = lotId,
            SerialId = serialId,
            PackUomId = packUomId
        };
        entity.Update(packedQuantity, packageRef, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal packedQuantity, string? packageRef, string status, long? userId)
    {
        PackedQuantity = packedQuantity;
        PackageRef = string.IsNullOrWhiteSpace(packageRef) ? null : packageRef.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Shipment : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private Shipment()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ShipmentNo { get; private set; } = string.Empty;
    public long? PackListId { get; private set; }
    public long CustomerId { get; private set; }
    public DateOnly DispatchDate { get; private set; }
    public string? VehicleRef { get; private set; }
    public string? TrackingRef { get; private set; }
    public string? SealNo { get; private set; }
    public string? ProofNotes { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset? LoadedOn { get; private set; }
    public DateTimeOffset? DeliveredOn { get; private set; }

    public static Shipment Create(
        long companyId,
        long branchId,
        string shipmentNo,
        long? packListId,
        long customerId,
        DateOnly dispatchDate,
        string? vehicleRef,
        string? trackingRef,
        string? sealNo,
        string? proofNotes,
        string status,
        DateTimeOffset? loadedOn,
        DateTimeOffset? deliveredOn,
        long? userId)
    {
        var entity = new Shipment { CompanyId = companyId, BranchId = branchId, PackListId = packListId, CustomerId = customerId };
        entity.Update(shipmentNo, dispatchDate, vehicleRef, trackingRef, sealNo, proofNotes, status, loadedOn, deliveredOn, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string shipmentNo,
        DateOnly dispatchDate,
        string? vehicleRef,
        string? trackingRef,
        string? sealNo,
        string? proofNotes,
        string status,
        DateTimeOffset? loadedOn,
        DateTimeOffset? deliveredOn,
        long? userId)
    {
        ShipmentNo = shipmentNo.Trim();
        DispatchDate = dispatchDate;
        VehicleRef = string.IsNullOrWhiteSpace(vehicleRef) ? null : vehicleRef.Trim();
        TrackingRef = string.IsNullOrWhiteSpace(trackingRef) ? null : trackingRef.Trim();
        SealNo = string.IsNullOrWhiteSpace(sealNo) ? null : sealNo.Trim();
        ProofNotes = string.IsNullOrWhiteSpace(proofNotes) ? null : proofNotes.Trim();
        Status = status.Trim();
        LoadedOn = loadedOn;
        DeliveredOn = deliveredOn;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ShipmentLine : AuditableEntity
{
    private ShipmentLine()
    {
    }

    public long ShipmentId { get; private set; }
    public int LineNo { get; private set; }
    public long? PackListLineId { get; private set; }
    public long? SalesOrderLineId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long WarehouseId { get; private set; }
    public long? BinId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public decimal ShippedQuantity { get; private set; }
    public long ShipUomId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ShipmentLine Create(
        long shipmentId,
        int lineNo,
        long? packListLineId,
        long? salesOrderLineId,
        long itemId,
        long? itemVariantId,
        long warehouseId,
        long? binId,
        long? lotId,
        long? serialId,
        decimal shippedQuantity,
        long shipUomId,
        string status,
        long? userId)
    {
        var entity = new ShipmentLine
        {
            ShipmentId = shipmentId,
            LineNo = lineNo,
            PackListLineId = packListLineId,
            SalesOrderLineId = salesOrderLineId,
            ItemId = itemId,
            ItemVariantId = itemVariantId,
            WarehouseId = warehouseId,
            BinId = binId,
            LotId = lotId,
            SerialId = serialId,
            ShipUomId = shipUomId
        };
        entity.Update(shippedQuantity, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal shippedQuantity, string status, long? userId)
    {
        ShippedQuantity = shippedQuantity;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
