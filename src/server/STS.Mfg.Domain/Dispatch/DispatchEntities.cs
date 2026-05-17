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
    public long? PcidId { get; private set; }
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
        long? pcidId,
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
            PcidId = pcidId,
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
    public string? TransporterName { get; private set; }
    public string? DriverName { get; private set; }
    public string? DriverContact { get; private set; }
    public string? DeliveryAddressSnapshot { get; private set; }
    public string? PodReceivedBy { get; private set; }
    public string? PodReceiverContact { get; private set; }
    public DateTimeOffset? PodReceivedOn { get; private set; }
    public long? PodEvidenceAttachmentId { get; private set; }
    public string? PodRemarks { get; private set; }
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
        string? transporterName,
        string? driverName,
        string? driverContact,
        string? deliveryAddressSnapshot,
        string status,
        DateTimeOffset? loadedOn,
        DateTimeOffset? deliveredOn,
        long? userId)
    {
        var entity = new Shipment { CompanyId = companyId, BranchId = branchId, PackListId = packListId, CustomerId = customerId };
        entity.Update(shipmentNo, dispatchDate, vehicleRef, trackingRef, sealNo, proofNotes, transporterName, driverName, driverContact, deliveryAddressSnapshot, status, loadedOn, deliveredOn, userId);
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
        string? transporterName,
        string? driverName,
        string? driverContact,
        string? deliveryAddressSnapshot,
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
        TransporterName = string.IsNullOrWhiteSpace(transporterName) ? null : transporterName.Trim();
        DriverName = string.IsNullOrWhiteSpace(driverName) ? null : driverName.Trim();
        DriverContact = string.IsNullOrWhiteSpace(driverContact) ? null : driverContact.Trim();
        DeliveryAddressSnapshot = string.IsNullOrWhiteSpace(deliveryAddressSnapshot) ? null : deliveryAddressSnapshot.Trim();
        Status = status.Trim();
        LoadedOn = loadedOn;
        DeliveredOn = deliveredOn;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void UpdateProof(
        string? vehicleRef,
        string? trackingRef,
        string? sealNo,
        string? proofNotes,
        string status,
        DateTimeOffset? loadedOn,
        DateTimeOffset? deliveredOn,
        string? podReceivedBy,
        string? podReceiverContact,
        DateTimeOffset? podReceivedOn,
        long? podEvidenceAttachmentId,
        string? podRemarks,
        long? userId)
    {
        VehicleRef = string.IsNullOrWhiteSpace(vehicleRef) ? VehicleRef : vehicleRef.Trim();
        TrackingRef = string.IsNullOrWhiteSpace(trackingRef) ? TrackingRef : trackingRef.Trim();
        SealNo = string.IsNullOrWhiteSpace(sealNo) ? SealNo : sealNo.Trim();
        ProofNotes = string.IsNullOrWhiteSpace(proofNotes) ? ProofNotes : proofNotes.Trim();
        Status = status.Trim();
        LoadedOn = loadedOn;
        DeliveredOn = deliveredOn;
        PodReceivedBy = string.IsNullOrWhiteSpace(podReceivedBy) ? PodReceivedBy : podReceivedBy.Trim();
        PodReceiverContact = string.IsNullOrWhiteSpace(podReceiverContact) ? PodReceiverContact : podReceiverContact.Trim();
        PodReceivedOn = podReceivedOn;
        PodEvidenceAttachmentId = podEvidenceAttachmentId ?? PodEvidenceAttachmentId;
        PodRemarks = string.IsNullOrWhiteSpace(podRemarks) ? PodRemarks : podRemarks.Trim();
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
    public long? PcidId { get; private set; }
    public decimal ShippedQuantity { get; private set; }
    public decimal DeliveredQuantity { get; private set; }
    public decimal ShortQuantity { get; private set; }
    public decimal DamagedQuantity { get; private set; }
    public long ShipUomId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public long? SalesOrderId { get; private set; }
    public string? SourceDocumentNo { get; private set; }
    public long? SourceDocumentLineId { get; private set; }
    public int? SourceDocumentRevisionNo { get; private set; }
    public int? SourceDocumentVersionNo { get; private set; }
    public long? ItemRevisionId { get; private set; }
    public long? EngineeringDocumentRevisionId { get; private set; }
    public long? BomRevisionId { get; private set; }
    public long? RoutingId { get; private set; }
    public decimal UnitPrice { get; private set; }
    public string? PriceSourceType { get; private set; }
    public long? PriceListLineId { get; private set; }
    public long? DiscountSchemeId { get; private set; }
    public long? DiscountRuleId { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public long? TaxCodeId { get; private set; }
    public decimal TaxRateSnapshot { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal LineSubtotal { get; private set; }
    public decimal LineTaxableAmount { get; private set; }
    public decimal LineTotalAmount { get; private set; }
    public string? LineInternalRemarks { get; private set; }
    public string? LineCustomerFacingRemarks { get; private set; }

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
        long? pcidId,
        decimal shippedQuantity,
        long shipUomId,
        string status,
        long? salesOrderId,
        string? sourceDocumentNo,
        long? sourceDocumentLineId,
        int? sourceDocumentRevisionNo,
        int? sourceDocumentVersionNo,
        long? itemRevisionId,
        long? engineeringDocumentRevisionId,
        long? bomRevisionId,
        long? routingId,
        decimal unitPrice,
        string? priceSourceType,
        long? priceListLineId,
        long? discountSchemeId,
        long? discountRuleId,
        decimal discountPercent,
        decimal discountAmount,
        long? taxCodeId,
        decimal taxRateSnapshot,
        decimal taxAmount,
        decimal lineSubtotal,
        decimal lineTaxableAmount,
        decimal lineTotalAmount,
        string? lineInternalRemarks,
        string? lineCustomerFacingRemarks,
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
            PcidId = pcidId,
            SalesOrderId = salesOrderId,
            SourceDocumentLineId = sourceDocumentLineId,
            SourceDocumentRevisionNo = sourceDocumentRevisionNo,
            SourceDocumentVersionNo = sourceDocumentVersionNo,
            ItemRevisionId = itemRevisionId,
            EngineeringDocumentRevisionId = engineeringDocumentRevisionId,
            BomRevisionId = bomRevisionId,
            RoutingId = routingId,
            PriceListLineId = priceListLineId,
            DiscountSchemeId = discountSchemeId,
            DiscountRuleId = discountRuleId,
            TaxCodeId = taxCodeId,
            ShipUomId = shipUomId
        };
        entity.ApplySourceSnapshot(
            sourceDocumentNo,
            unitPrice,
            priceSourceType,
            discountPercent,
            discountAmount,
            taxRateSnapshot,
            taxAmount,
            lineSubtotal,
            lineTaxableAmount,
            lineTotalAmount,
            lineInternalRemarks,
            lineCustomerFacingRemarks);
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

    public void UpdatePod(decimal deliveredQuantity, decimal shortQuantity, decimal damagedQuantity, string status, long? userId)
    {
        DeliveredQuantity = deliveredQuantity;
        ShortQuantity = shortQuantity;
        DamagedQuantity = damagedQuantity;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private void ApplySourceSnapshot(
        string? sourceDocumentNo,
        decimal unitPrice,
        string? priceSourceType,
        decimal discountPercent,
        decimal discountAmount,
        decimal taxRateSnapshot,
        decimal taxAmount,
        decimal lineSubtotal,
        decimal lineTaxableAmount,
        decimal lineTotalAmount,
        string? lineInternalRemarks,
        string? lineCustomerFacingRemarks)
    {
        SourceDocumentNo = string.IsNullOrWhiteSpace(sourceDocumentNo) ? null : sourceDocumentNo.Trim();
        UnitPrice = unitPrice;
        PriceSourceType = string.IsNullOrWhiteSpace(priceSourceType) ? null : priceSourceType.Trim();
        DiscountPercent = discountPercent;
        DiscountAmount = discountAmount;
        TaxRateSnapshot = taxRateSnapshot;
        TaxAmount = taxAmount;
        LineSubtotal = lineSubtotal;
        LineTaxableAmount = lineTaxableAmount;
        LineTotalAmount = lineTotalAmount;
        LineInternalRemarks = string.IsNullOrWhiteSpace(lineInternalRemarks) ? null : lineInternalRemarks.Trim();
        LineCustomerFacingRemarks = string.IsNullOrWhiteSpace(lineCustomerFacingRemarks) ? null : lineCustomerFacingRemarks.Trim();
    }
}
