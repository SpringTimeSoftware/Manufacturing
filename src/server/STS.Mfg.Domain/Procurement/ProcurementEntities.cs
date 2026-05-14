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
    public decimal UnitPrice { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxPercent { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal LineAmount { get; private set; }
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
        decimal unitPrice,
        decimal discountPercent,
        decimal taxPercent,
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
        entity.Update(orderedQuantity, unitPrice, discountPercent, taxPercent, expectedDate, linkedWorkOrderId, sourceBoqRequirementLineId, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        decimal orderedQuantity,
        decimal unitPrice,
        decimal discountPercent,
        decimal taxPercent,
        DateOnly expectedDate,
        long? linkedWorkOrderId,
        long? sourceBoqRequirementLineId,
        string status,
        long? userId)
    {
        OrderedQuantity = orderedQuantity;
        UnitPrice = unitPrice;
        DiscountPercent = discountPercent;
        TaxPercent = taxPercent;
        var grossAmount = decimal.Round(orderedQuantity * unitPrice, 2, MidpointRounding.AwayFromZero);
        DiscountAmount = decimal.Round(grossAmount * discountPercent / 100m, 2, MidpointRounding.AwayFromZero);
        var taxableAmount = grossAmount - DiscountAmount;
        TaxAmount = decimal.Round(taxableAmount * taxPercent / 100m, 2, MidpointRounding.AwayFromZero);
        LineAmount = taxableAmount + TaxAmount;
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

public sealed class SubcontractReceipt : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private SubcontractReceipt()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ReceiptNo { get; private set; } = string.Empty;
    public long SubcontractOrderId { get; private set; }
    public DateOnly ReceiptDate { get; private set; }
    public decimal ReceivedQuantity { get; private set; }
    public decimal AcceptedQuantity { get; private set; }
    public decimal RejectedQuantity { get; private set; }
    public string QcStatus { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static SubcontractReceipt Create(
        long companyId,
        long branchId,
        string receiptNo,
        long subcontractOrderId,
        DateOnly receiptDate,
        decimal receivedQuantity,
        decimal acceptedQuantity,
        decimal rejectedQuantity,
        string qcStatus,
        string status,
        string? remarks,
        long? userId)
    {
        var entity = new SubcontractReceipt
        {
            CompanyId = companyId,
            BranchId = branchId,
            SubcontractOrderId = subcontractOrderId
        };
        entity.Update(receiptNo, receiptDate, receivedQuantity, acceptedQuantity, rejectedQuantity, qcStatus, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string receiptNo,
        DateOnly receiptDate,
        decimal receivedQuantity,
        decimal acceptedQuantity,
        decimal rejectedQuantity,
        string qcStatus,
        string status,
        string? remarks,
        long? userId)
    {
        ReceiptNo = receiptNo.Trim();
        ReceiptDate = receiptDate;
        ReceivedQuantity = receivedQuantity;
        AcceptedQuantity = acceptedQuantity;
        RejectedQuantity = rejectedQuantity;
        QcStatus = qcStatus.Trim();
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class RequestForQuotation : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private RequestForQuotation()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string RfqNo { get; private set; } = string.Empty;
    public long? PurchaseRequisitionId { get; private set; }
    public DateOnly IssueDate { get; private set; }
    public DateOnly ResponseDueDate { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static RequestForQuotation Create(
        long companyId,
        long branchId,
        string rfqNo,
        long? purchaseRequisitionId,
        DateOnly issueDate,
        DateOnly responseDueDate,
        string currencyCode,
        string status,
        string? remarks,
        long? userId)
    {
        var entity = new RequestForQuotation { CompanyId = companyId, BranchId = branchId };
        entity.Update(rfqNo, purchaseRequisitionId, issueDate, responseDueDate, currencyCode, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string rfqNo,
        long? purchaseRequisitionId,
        DateOnly issueDate,
        DateOnly responseDueDate,
        string currencyCode,
        string status,
        string? remarks,
        long? userId)
    {
        RfqNo = rfqNo.Trim();
        PurchaseRequisitionId = purchaseRequisitionId;
        IssueDate = issueDate;
        ResponseDueDate = responseDueDate;
        CurrencyCode = currencyCode.Trim();
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class RequestForQuotationLine : AuditableEntity
{
    private RequestForQuotationLine()
    {
    }

    public long RfqId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public long OrderUomId { get; private set; }
    public decimal RequestedQuantity { get; private set; }
    public DateOnly NeedByDate { get; private set; }
    public long? PurchaseRequisitionLineId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static RequestForQuotationLine Create(
        long rfqId,
        int lineNo,
        long itemId,
        long orderUomId,
        decimal requestedQuantity,
        DateOnly needByDate,
        long? purchaseRequisitionLineId,
        string status,
        long? userId)
    {
        var entity = new RequestForQuotationLine
        {
            RfqId = rfqId,
            LineNo = lineNo,
            ItemId = itemId,
            OrderUomId = orderUomId,
            PurchaseRequisitionLineId = purchaseRequisitionLineId
        };
        entity.Update(requestedQuantity, needByDate, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal requestedQuantity, DateOnly needByDate, string status, long? userId)
    {
        RequestedQuantity = requestedQuantity;
        NeedByDate = needByDate;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class RequestForQuotationSupplier : AuditableEntity
{
    private RequestForQuotationSupplier()
    {
    }

    public long RfqId { get; private set; }
    public long SupplierId { get; private set; }
    public string InvitationStatus { get; private set; } = string.Empty;
    public DateOnly ResponseDueDate { get; private set; }
    public string? Remarks { get; private set; }

    public static RequestForQuotationSupplier Create(
        long rfqId,
        long supplierId,
        string invitationStatus,
        DateOnly responseDueDate,
        string? remarks,
        long? userId)
    {
        var entity = new RequestForQuotationSupplier { RfqId = rfqId, SupplierId = supplierId };
        entity.Update(invitationStatus, responseDueDate, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string invitationStatus, DateOnly responseDueDate, string? remarks, long? userId)
    {
        InvitationStatus = invitationStatus.Trim();
        ResponseDueDate = responseDueDate;
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class SupplierQuotation : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private SupplierQuotation()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string SupplierQuotationNo { get; private set; } = string.Empty;
    public long RfqId { get; private set; }
    public long SupplierId { get; private set; }
    public DateOnly QuotationDate { get; private set; }
    public DateOnly ValidUntil { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public decimal SubtotalAmount { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string SelectionStatus { get; private set; } = string.Empty;
    public string? SelectionReason { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static SupplierQuotation Create(
        long companyId,
        long branchId,
        string supplierQuotationNo,
        long rfqId,
        long supplierId,
        DateOnly quotationDate,
        DateOnly validUntil,
        string currencyCode,
        string status,
        long? userId)
    {
        var entity = new SupplierQuotation { CompanyId = companyId, BranchId = branchId, RfqId = rfqId, SupplierId = supplierId };
        entity.UpdateHeader(supplierQuotationNo, quotationDate, validUntil, currencyCode, status, userId);
        entity.SetTotals(0, 0, userId);
        entity.UpdateSelection("Pending", null, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void UpdateHeader(string supplierQuotationNo, DateOnly quotationDate, DateOnly validUntil, string currencyCode, string status, long? userId)
    {
        SupplierQuotationNo = supplierQuotationNo.Trim();
        QuotationDate = quotationDate;
        ValidUntil = validUntil;
        CurrencyCode = currencyCode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void SetTotals(decimal subtotalAmount, decimal taxAmount, long? userId)
    {
        SubtotalAmount = subtotalAmount;
        TaxAmount = taxAmount;
        TotalAmount = subtotalAmount + taxAmount;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void UpdateSelection(string selectionStatus, string? selectionReason, long? userId)
    {
        SelectionStatus = selectionStatus.Trim();
        SelectionReason = string.IsNullOrWhiteSpace(selectionReason) ? null : selectionReason.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class SupplierQuotationLine : AuditableEntity
{
    private SupplierQuotationLine()
    {
    }

    public long SupplierQuotationId { get; private set; }
    public int LineNo { get; private set; }
    public long RfqLineId { get; private set; }
    public long ItemId { get; private set; }
    public long OrderUomId { get; private set; }
    public decimal OfferedQuantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxPercent { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal LineAmount { get; private set; }
    public int LeadTimeDays { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static SupplierQuotationLine Create(
        long supplierQuotationId,
        int lineNo,
        long rfqLineId,
        long itemId,
        long orderUomId,
        decimal offeredQuantity,
        decimal unitPrice,
        decimal discountPercent,
        decimal taxPercent,
        int leadTimeDays,
        string status,
        long? userId)
    {
        var entity = new SupplierQuotationLine
        {
            SupplierQuotationId = supplierQuotationId,
            LineNo = lineNo,
            RfqLineId = rfqLineId,
            ItemId = itemId,
            OrderUomId = orderUomId
        };
        entity.Update(offeredQuantity, unitPrice, discountPercent, taxPercent, leadTimeDays, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal offeredQuantity, decimal unitPrice, decimal discountPercent, decimal taxPercent, int leadTimeDays, string status, long? userId)
    {
        OfferedQuantity = offeredQuantity;
        UnitPrice = unitPrice;
        DiscountPercent = discountPercent;
        TaxPercent = taxPercent;
        var grossAmount = decimal.Round(offeredQuantity * unitPrice, 2, MidpointRounding.AwayFromZero);
        DiscountAmount = decimal.Round(grossAmount * discountPercent / 100m, 2, MidpointRounding.AwayFromZero);
        var taxableAmount = grossAmount - DiscountAmount;
        TaxAmount = decimal.Round(taxableAmount * taxPercent / 100m, 2, MidpointRounding.AwayFromZero);
        LineAmount = taxableAmount + TaxAmount;
        LeadTimeDays = leadTimeDays;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
