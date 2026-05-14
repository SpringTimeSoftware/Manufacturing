using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Procurement;

public sealed class GoodsReceipt : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private GoodsReceipt()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string GoodsReceiptNo { get; private set; } = string.Empty;
    public long PurchaseOrderId { get; private set; }
    public long SupplierId { get; private set; }
    public DateOnly ReceiptDate { get; private set; }
    public long? WarehouseId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static GoodsReceipt Create(long companyId, long branchId, string goodsReceiptNo, long purchaseOrderId, long supplierId, DateOnly receiptDate, long? warehouseId, string status, string? remarks, long? userId)
    {
        var entity = new GoodsReceipt { CompanyId = companyId, BranchId = branchId, PurchaseOrderId = purchaseOrderId, SupplierId = supplierId };
        entity.Update(goodsReceiptNo, receiptDate, warehouseId, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string goodsReceiptNo, DateOnly receiptDate, long? warehouseId, string status, string? remarks, long? userId)
    {
        GoodsReceiptNo = goodsReceiptNo.Trim();
        ReceiptDate = receiptDate;
        WarehouseId = warehouseId;
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class GoodsReceiptLine : AuditableEntity
{
    private GoodsReceiptLine()
    {
    }

    public long GoodsReceiptId { get; private set; }
    public int LineNo { get; private set; }
    public long PurchaseOrderLineId { get; private set; }
    public long ItemId { get; private set; }
    public long OrderUomId { get; private set; }
    public decimal ReceivedQuantity { get; private set; }
    public decimal AcceptedQuantity { get; private set; }
    public decimal RejectedQuantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TaxPercent { get; private set; }
    public decimal LineAmount { get; private set; }
    public string QcStatus { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static GoodsReceiptLine Create(long goodsReceiptId, int lineNo, long purchaseOrderLineId, long itemId, long orderUomId, decimal receivedQuantity, decimal acceptedQuantity, decimal rejectedQuantity, decimal unitPrice, decimal taxPercent, string qcStatus, string status, long? userId)
    {
        var entity = new GoodsReceiptLine { GoodsReceiptId = goodsReceiptId, LineNo = lineNo, PurchaseOrderLineId = purchaseOrderLineId, ItemId = itemId, OrderUomId = orderUomId };
        entity.Update(receivedQuantity, acceptedQuantity, rejectedQuantity, unitPrice, taxPercent, qcStatus, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal receivedQuantity, decimal acceptedQuantity, decimal rejectedQuantity, decimal unitPrice, decimal taxPercent, string qcStatus, string status, long? userId)
    {
        ReceivedQuantity = receivedQuantity;
        AcceptedQuantity = acceptedQuantity;
        RejectedQuantity = rejectedQuantity;
        UnitPrice = unitPrice;
        TaxPercent = taxPercent;
        var taxableAmount = decimal.Round(acceptedQuantity * unitPrice, 2, MidpointRounding.AwayFromZero);
        LineAmount = taxableAmount + decimal.Round(taxableAmount * taxPercent / 100m, 2, MidpointRounding.AwayFromZero);
        QcStatus = qcStatus.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class SupplierInvoice : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private SupplierInvoice()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string SupplierInvoiceNo { get; private set; } = string.Empty;
    public long SupplierId { get; private set; }
    public long PurchaseOrderId { get; private set; }
    public long GoodsReceiptId { get; private set; }
    public DateOnly InvoiceDate { get; private set; }
    public DateOnly? DueDate { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public decimal SubtotalAmount { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string MatchStatus { get; private set; } = string.Empty;
    public string ApStatus { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static SupplierInvoice Create(long companyId, long branchId, string supplierInvoiceNo, long supplierId, long purchaseOrderId, long goodsReceiptId, DateOnly invoiceDate, DateOnly? dueDate, string currencyCode, string status, long? userId)
    {
        var entity = new SupplierInvoice { CompanyId = companyId, BranchId = branchId, SupplierId = supplierId, PurchaseOrderId = purchaseOrderId, GoodsReceiptId = goodsReceiptId };
        entity.UpdateHeader(supplierInvoiceNo, invoiceDate, dueDate, currencyCode, status, userId);
        entity.SetTotals(0, 0, "Pending Match", "Not Posted", userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void UpdateHeader(string supplierInvoiceNo, DateOnly invoiceDate, DateOnly? dueDate, string currencyCode, string status, long? userId)
    {
        SupplierInvoiceNo = supplierInvoiceNo.Trim();
        InvoiceDate = invoiceDate;
        DueDate = dueDate;
        CurrencyCode = currencyCode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void SetTotals(decimal subtotalAmount, decimal taxAmount, string matchStatus, string apStatus, long? userId)
    {
        SubtotalAmount = subtotalAmount;
        TaxAmount = taxAmount;
        TotalAmount = subtotalAmount + taxAmount;
        MatchStatus = matchStatus.Trim();
        ApStatus = apStatus.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class SupplierInvoiceLine : AuditableEntity
{
    private SupplierInvoiceLine()
    {
    }

    public long SupplierInvoiceId { get; private set; }
    public int LineNo { get; private set; }
    public long PurchaseOrderLineId { get; private set; }
    public long GoodsReceiptLineId { get; private set; }
    public long ItemId { get; private set; }
    public decimal InvoiceQuantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TaxPercent { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal LineAmount { get; private set; }
    public string MatchStatus { get; private set; } = string.Empty;

    public static SupplierInvoiceLine Create(long supplierInvoiceId, int lineNo, long purchaseOrderLineId, long goodsReceiptLineId, long itemId, decimal invoiceQuantity, decimal unitPrice, decimal taxPercent, string matchStatus, long? userId)
    {
        var entity = new SupplierInvoiceLine { SupplierInvoiceId = supplierInvoiceId, LineNo = lineNo, PurchaseOrderLineId = purchaseOrderLineId, GoodsReceiptLineId = goodsReceiptLineId, ItemId = itemId };
        entity.Update(invoiceQuantity, unitPrice, taxPercent, matchStatus, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal invoiceQuantity, decimal unitPrice, decimal taxPercent, string matchStatus, long? userId)
    {
        InvoiceQuantity = invoiceQuantity;
        UnitPrice = unitPrice;
        TaxPercent = taxPercent;
        var subtotal = decimal.Round(invoiceQuantity * unitPrice, 2, MidpointRounding.AwayFromZero);
        TaxAmount = decimal.Round(subtotal * taxPercent / 100m, 2, MidpointRounding.AwayFromZero);
        LineAmount = subtotal + TaxAmount;
        MatchStatus = matchStatus.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class AccountsPayableLiability : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private AccountsPayableLiability()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string LiabilityNo { get; private set; } = string.Empty;
    public long SupplierInvoiceId { get; private set; }
    public long SupplierId { get; private set; }
    public DateOnly PostingDate { get; private set; }
    public DateOnly DueDate { get; private set; }
    public decimal PayableAmount { get; private set; }
    public decimal PaidAmount { get; private set; }
    public decimal BalanceAmount { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static AccountsPayableLiability Create(long companyId, long branchId, string liabilityNo, long supplierInvoiceId, long supplierId, DateOnly postingDate, DateOnly dueDate, decimal payableAmount, long? userId)
    {
        var entity = new AccountsPayableLiability { CompanyId = companyId, BranchId = branchId, SupplierInvoiceId = supplierInvoiceId, SupplierId = supplierId };
        entity.Update(liabilityNo, postingDate, dueDate, payableAmount, 0, "Open", userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string liabilityNo, DateOnly postingDate, DateOnly dueDate, decimal payableAmount, decimal paidAmount, string status, long? userId)
    {
        LiabilityNo = liabilityNo.Trim();
        PostingDate = postingDate;
        DueDate = dueDate;
        PayableAmount = payableAmount;
        PaidAmount = paidAmount;
        BalanceAmount = payableAmount - paidAmount;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class AccountingPosting : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private AccountingPosting()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string PostingNo { get; private set; } = string.Empty;
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long SourceDocumentId { get; private set; }
    public DateOnly PostingDate { get; private set; }
    public string DebitAccountCode { get; private set; } = string.Empty;
    public string CreditAccountCode { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static AccountingPosting Create(long companyId, long branchId, string postingNo, string sourceDocumentType, long sourceDocumentId, DateOnly postingDate, string debitAccountCode, string creditAccountCode, decimal amount, string status, long? userId)
    {
        var entity = new AccountingPosting { CompanyId = companyId, BranchId = branchId, SourceDocumentId = sourceDocumentId };
        entity.Update(postingNo, sourceDocumentType, postingDate, debitAccountCode, creditAccountCode, amount, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string postingNo, string sourceDocumentType, DateOnly postingDate, string debitAccountCode, string creditAccountCode, decimal amount, string status, long? userId)
    {
        PostingNo = postingNo.Trim();
        SourceDocumentType = sourceDocumentType.Trim();
        PostingDate = postingDate;
        DebitAccountCode = debitAccountCode.Trim();
        CreditAccountCode = creditAccountCode.Trim();
        Amount = amount;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
