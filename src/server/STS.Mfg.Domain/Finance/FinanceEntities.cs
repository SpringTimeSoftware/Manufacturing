using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Finance;

public sealed class ChartOfAccount : AuditableEntity, ICompanyScoped
{
    private ChartOfAccount()
    {
    }

    public long? CompanyId { get; private set; }
    public string AccountCode { get; private set; } = string.Empty;
    public string AccountName { get; private set; } = string.Empty;
    public string AccountClass { get; private set; } = string.Empty;
    public long? ParentAccountId { get; private set; }
    public string NormalBalance { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public bool IsPostingAllowed { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ChartOfAccount Create(long companyId, string accountCode, string accountName, string accountClass, long? parentAccountId, string normalBalance, bool isActive, bool isPostingAllowed, string status, long? userId)
    {
        var entity = new ChartOfAccount { CompanyId = companyId };
        entity.Update(accountCode, accountName, accountClass, parentAccountId, normalBalance, isActive, isPostingAllowed, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string accountCode, string accountName, string accountClass, long? parentAccountId, string normalBalance, bool isActive, bool isPostingAllowed, string status, long? userId)
    {
        AccountCode = accountCode.Trim();
        AccountName = accountName.Trim();
        AccountClass = accountClass.Trim();
        ParentAccountId = parentAccountId;
        NormalBalance = normalBalance.Trim();
        IsActive = isActive;
        IsPostingAllowed = isPostingAllowed;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class FiscalPeriod : AuditableEntity, ICompanyScoped
{
    private FiscalPeriod()
    {
    }

    public long? CompanyId { get; private set; }
    public int FiscalYear { get; private set; }
    public int PeriodNo { get; private set; }
    public string PeriodName { get; private set; } = string.Empty;
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public bool ApLocked { get; private set; }
    public bool ArLocked { get; private set; }
    public bool InventoryLocked { get; private set; }
    public bool ProductionLocked { get; private set; }
    public bool GlLocked { get; private set; }

    public static FiscalPeriod Create(long companyId, int fiscalYear, int periodNo, string periodName, DateOnly startDate, DateOnly endDate, string status, bool apLocked, bool arLocked, bool inventoryLocked, bool productionLocked, bool glLocked, long? userId)
    {
        var entity = new FiscalPeriod { CompanyId = companyId };
        entity.Update(fiscalYear, periodNo, periodName, startDate, endDate, status, apLocked, arLocked, inventoryLocked, productionLocked, glLocked, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(int fiscalYear, int periodNo, string periodName, DateOnly startDate, DateOnly endDate, string status, bool apLocked, bool arLocked, bool inventoryLocked, bool productionLocked, bool glLocked, long? userId)
    {
        FiscalYear = fiscalYear;
        PeriodNo = periodNo;
        PeriodName = periodName.Trim();
        StartDate = startDate;
        EndDate = endDate;
        Status = status.Trim();
        ApLocked = apLocked;
        ArLocked = arLocked;
        InventoryLocked = inventoryLocked;
        ProductionLocked = productionLocked;
        GlLocked = glLocked;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class FinancePostingProfile : AuditableEntity, ICompanyScoped
{
    private FinancePostingProfile()
    {
    }

    public long? CompanyId { get; private set; }
    public string ProfileCode { get; private set; } = string.Empty;
    public string PostingKey { get; private set; } = string.Empty;
    public long DebitAccountId { get; private set; }
    public long CreditAccountId { get; private set; }
    public string MappingSource { get; private set; } = string.Empty;
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static FinancePostingProfile Create(long companyId, string profileCode, string postingKey, long debitAccountId, long creditAccountId, string mappingSource, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        var entity = new FinancePostingProfile { CompanyId = companyId };
        entity.Update(profileCode, postingKey, debitAccountId, creditAccountId, mappingSource, effectiveFrom, effectiveTo, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string profileCode, string postingKey, long debitAccountId, long creditAccountId, string mappingSource, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        ProfileCode = profileCode.Trim();
        PostingKey = postingKey.Trim();
        DebitAccountId = debitAccountId;
        CreditAccountId = creditAccountId;
        MappingSource = mappingSource.Trim();
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class GeneralLedgerJournal : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private GeneralLedgerJournal()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string JournalNo { get; private set; } = string.Empty;
    public DateOnly PostingDate { get; private set; }
    public DateOnly DocumentDate { get; private set; }
    public string SourceModule { get; private set; } = string.Empty;
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long? SourceDocumentId { get; private set; }
    public string? SourceDocumentNo { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public decimal ExchangeRateSnapshot { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }
    public DateTimeOffset? PostedAt { get; private set; }
    public long? PostedByUserId { get; private set; }
    public long? ReversalJournalId { get; private set; }

    public static GeneralLedgerJournal Create(long companyId, long? branchId, string journalNo, DateOnly postingDate, DateOnly documentDate, string sourceModule, string sourceDocumentType, long? sourceDocumentId, string? sourceDocumentNo, string currencyCode, decimal exchangeRateSnapshot, string status, string? remarks, long? userId)
    {
        var entity = new GeneralLedgerJournal { CompanyId = companyId, BranchId = branchId, SourceDocumentId = sourceDocumentId };
        entity.Update(journalNo, postingDate, documentDate, sourceModule, sourceDocumentType, sourceDocumentNo, currencyCode, exchangeRateSnapshot, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string journalNo, DateOnly postingDate, DateOnly documentDate, string sourceModule, string sourceDocumentType, string? sourceDocumentNo, string currencyCode, decimal exchangeRateSnapshot, string status, string? remarks, long? userId)
    {
        JournalNo = journalNo.Trim();
        PostingDate = postingDate;
        DocumentDate = documentDate;
        SourceModule = sourceModule.Trim();
        SourceDocumentType = sourceDocumentType.Trim();
        SourceDocumentNo = string.IsNullOrWhiteSpace(sourceDocumentNo) ? null : sourceDocumentNo.Trim();
        CurrencyCode = currencyCode.Trim();
        ExchangeRateSnapshot = exchangeRateSnapshot;
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkPosted(long? userId)
    {
        Status = "Posted";
        PostedAt = DateTimeOffset.UtcNow;
        PostedByUserId = userId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkReversed(long reversalJournalId, long? userId)
    {
        Status = "Reversed";
        ReversalJournalId = reversalJournalId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class GeneralLedgerJournalLine : AuditableEntity
{
    private GeneralLedgerJournalLine()
    {
    }

    public long JournalId { get; private set; }
    public int LineNo { get; private set; }
    public long AccountId { get; private set; }
    public decimal DebitAmount { get; private set; }
    public decimal CreditAmount { get; private set; }
    public long? BranchId { get; private set; }
    public string? Narration { get; private set; }

    public static GeneralLedgerJournalLine Create(long journalId, int lineNo, long accountId, decimal debitAmount, decimal creditAmount, long? branchId, string? narration, long? userId)
    {
        var entity = new GeneralLedgerJournalLine { JournalId = journalId, LineNo = lineNo };
        entity.Update(accountId, debitAmount, creditAmount, branchId, narration, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(long accountId, decimal debitAmount, decimal creditAmount, long? branchId, string? narration, long? userId)
    {
        AccountId = accountId;
        DebitAmount = debitAmount;
        CreditAmount = creditAmount;
        BranchId = branchId;
        Narration = string.IsNullOrWhiteSpace(narration) ? null : narration.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class AccountsReceivableInvoice : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private AccountsReceivableInvoice()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string InvoiceNo { get; private set; } = string.Empty;
    public long CustomerId { get; private set; }
    public long? SalesOrderId { get; private set; }
    public long? ShipmentId { get; private set; }
    public string? SourceDocumentNo { get; private set; }
    public DateOnly InvoiceDate { get; private set; }
    public DateOnly? DueDate { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public decimal ExchangeRateSnapshot { get; private set; }
    public decimal SubtotalAmount { get; private set; }
    public decimal DiscountTotalAmount { get; private set; }
    public decimal TaxableAmount { get; private set; }
    public decimal TaxTotalAmount { get; private set; }
    public decimal FreightAmount { get; private set; }
    public decimal PackingAmount { get; private set; }
    public decimal InsuranceAmount { get; private set; }
    public decimal OtherChargesAmount { get; private set; }
    public decimal AddLessAmount { get; private set; }
    public decimal RoundOffAmount { get; private set; }
    public decimal GrandTotalAmount { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string ArStatus { get; private set; } = string.Empty;

    public static AccountsReceivableInvoice Create(long companyId, long? branchId, string invoiceNo, long customerId, long? salesOrderId, long? shipmentId, string? sourceDocumentNo, DateOnly invoiceDate, DateOnly? dueDate, string currencyCode, decimal exchangeRateSnapshot, string status, long? userId)
    {
        var entity = new AccountsReceivableInvoice { CompanyId = companyId, BranchId = branchId, CustomerId = customerId, SalesOrderId = salesOrderId, ShipmentId = shipmentId };
        entity.UpdateHeader(invoiceNo, sourceDocumentNo, invoiceDate, dueDate, currencyCode, exchangeRateSnapshot, status, "Not Posted", userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void UpdateHeader(string invoiceNo, string? sourceDocumentNo, DateOnly invoiceDate, DateOnly? dueDate, string currencyCode, decimal exchangeRateSnapshot, string status, string arStatus, long? userId)
    {
        InvoiceNo = invoiceNo.Trim();
        SourceDocumentNo = string.IsNullOrWhiteSpace(sourceDocumentNo) ? null : sourceDocumentNo.Trim();
        InvoiceDate = invoiceDate;
        DueDate = dueDate;
        CurrencyCode = currencyCode.Trim();
        ExchangeRateSnapshot = exchangeRateSnapshot;
        Status = status.Trim();
        ArStatus = arStatus.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void SetTotals(decimal subtotal, decimal discount, decimal taxable, decimal tax, decimal freight, decimal packing, decimal insurance, decimal other, decimal addLess, decimal roundOff, decimal grandTotal, long? userId)
    {
        SubtotalAmount = subtotal;
        DiscountTotalAmount = discount;
        TaxableAmount = taxable;
        TaxTotalAmount = tax;
        FreightAmount = freight;
        PackingAmount = packing;
        InsuranceAmount = insurance;
        OtherChargesAmount = other;
        AddLessAmount = addLess;
        RoundOffAmount = roundOff;
        GrandTotalAmount = grandTotal;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class AccountsReceivableInvoiceLine : AuditableEntity
{
    private AccountsReceivableInvoiceLine()
    {
    }

    public long ArInvoiceId { get; private set; }
    public int LineNo { get; private set; }
    public long? SalesOrderLineId { get; private set; }
    public long? ShipmentLineId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemRevisionId { get; private set; }
    public decimal InvoiceQuantity { get; private set; }
    public long UomId { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public long? TaxCodeId { get; private set; }
    public decimal TaxRateSnapshot { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal LineSubtotal { get; private set; }
    public decimal LineTaxableAmount { get; private set; }
    public decimal LineTotalAmount { get; private set; }

    public static AccountsReceivableInvoiceLine Create(long arInvoiceId, int lineNo, long? salesOrderLineId, long? shipmentLineId, long itemId, long? itemRevisionId, decimal invoiceQuantity, long uomId, decimal unitPrice, decimal discountAmount, long? taxCodeId, decimal taxRateSnapshot, decimal taxAmount, decimal lineSubtotal, decimal lineTaxableAmount, decimal lineTotalAmount, long? userId)
    {
        var entity = new AccountsReceivableInvoiceLine { ArInvoiceId = arInvoiceId, LineNo = lineNo, SalesOrderLineId = salesOrderLineId, ShipmentLineId = shipmentLineId, ItemId = itemId, ItemRevisionId = itemRevisionId, UomId = uomId, TaxCodeId = taxCodeId };
        entity.Update(invoiceQuantity, unitPrice, discountAmount, taxRateSnapshot, taxAmount, lineSubtotal, lineTaxableAmount, lineTotalAmount, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal invoiceQuantity, decimal unitPrice, decimal discountAmount, decimal taxRateSnapshot, decimal taxAmount, decimal lineSubtotal, decimal lineTaxableAmount, decimal lineTotalAmount, long? userId)
    {
        InvoiceQuantity = invoiceQuantity;
        UnitPrice = unitPrice;
        DiscountAmount = discountAmount;
        TaxRateSnapshot = taxRateSnapshot;
        TaxAmount = taxAmount;
        LineSubtotal = lineSubtotal;
        LineTaxableAmount = lineTaxableAmount;
        LineTotalAmount = lineTotalAmount;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class AccountsReceivableLedgerEntry : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private AccountsReceivableLedgerEntry()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string EntryNo { get; private set; } = string.Empty;
    public long ArInvoiceId { get; private set; }
    public long CustomerId { get; private set; }
    public DateOnly PostingDate { get; private set; }
    public DateOnly DueDate { get; private set; }
    public decimal ReceivableAmount { get; private set; }
    public decimal ReceivedAmount { get; private set; }
    public decimal BalanceAmount { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static AccountsReceivableLedgerEntry Create(long companyId, long? branchId, string entryNo, long arInvoiceId, long customerId, DateOnly postingDate, DateOnly dueDate, decimal receivableAmount, long? userId)
    {
        var entity = new AccountsReceivableLedgerEntry { CompanyId = companyId, BranchId = branchId, ArInvoiceId = arInvoiceId, CustomerId = customerId };
        entity.Update(entryNo, postingDate, dueDate, receivableAmount, 0m, "Open", userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string entryNo, DateOnly postingDate, DateOnly dueDate, decimal receivableAmount, decimal receivedAmount, string status, long? userId)
    {
        EntryNo = entryNo.Trim();
        PostingDate = postingDate;
        DueDate = dueDate;
        ReceivableAmount = receivableAmount;
        ReceivedAmount = receivedAmount;
        BalanceAmount = receivableAmount - receivedAmount;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class TaxLedgerEntry : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private TaxLedgerEntry()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string TaxDirection { get; private set; } = string.Empty;
    public long? TaxCodeId { get; private set; }
    public decimal TaxRateSnapshot { get; private set; }
    public decimal TaxableAmount { get; private set; }
    public decimal TaxAmount { get; private set; }
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long SourceDocumentId { get; private set; }
    public DateOnly PostingDate { get; private set; }
    public long? FiscalPeriodId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static TaxLedgerEntry Create(long companyId, long? branchId, string taxDirection, long? taxCodeId, decimal taxRateSnapshot, decimal taxableAmount, decimal taxAmount, string sourceDocumentType, long sourceDocumentId, DateOnly postingDate, long? fiscalPeriodId, string status, long? userId)
    {
        var entity = new TaxLedgerEntry { CompanyId = companyId, BranchId = branchId, TaxCodeId = taxCodeId, SourceDocumentId = sourceDocumentId, FiscalPeriodId = fiscalPeriodId };
        entity.Update(taxDirection, taxRateSnapshot, taxableAmount, taxAmount, sourceDocumentType, postingDate, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string taxDirection, decimal taxRateSnapshot, decimal taxableAmount, decimal taxAmount, string sourceDocumentType, DateOnly postingDate, string status, long? userId)
    {
        TaxDirection = taxDirection.Trim();
        TaxRateSnapshot = taxRateSnapshot;
        TaxableAmount = taxableAmount;
        TaxAmount = taxAmount;
        SourceDocumentType = sourceDocumentType.Trim();
        PostingDate = postingDate;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class InventoryValuationEntry : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private InventoryValuationEntry()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? StockTransactionId { get; private set; }
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long? SourceDocumentId { get; private set; }
    public string? SourceDocumentNo { get; private set; }
    public long ItemId { get; private set; }
    public long? WarehouseId { get; private set; }
    public long? BinId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public long? PcidId { get; private set; }
    public DateOnly ValuationDate { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public decimal TotalCost { get; private set; }
    public string ValuationMethod { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static InventoryValuationEntry Create(long companyId, long? branchId, long? stockTransactionId, string sourceDocumentType, long? sourceDocumentId, string? sourceDocumentNo, long itemId, long? warehouseId, long? binId, long? lotId, long? serialId, long? pcidId, DateOnly valuationDate, decimal quantity, decimal unitCost, string valuationMethod, string status, long? userId)
    {
        var entity = new InventoryValuationEntry { CompanyId = companyId, BranchId = branchId, StockTransactionId = stockTransactionId, SourceDocumentId = sourceDocumentId, ItemId = itemId, WarehouseId = warehouseId, BinId = binId, LotId = lotId, SerialId = serialId, PcidId = pcidId };
        entity.Update(sourceDocumentType, sourceDocumentNo, valuationDate, quantity, unitCost, valuationMethod, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string sourceDocumentType, string? sourceDocumentNo, DateOnly valuationDate, decimal quantity, decimal unitCost, string valuationMethod, string status, long? userId)
    {
        SourceDocumentType = sourceDocumentType.Trim();
        SourceDocumentNo = string.IsNullOrWhiteSpace(sourceDocumentNo) ? null : sourceDocumentNo.Trim();
        ValuationDate = valuationDate;
        Quantity = quantity;
        UnitCost = unitCost;
        TotalCost = decimal.Round(quantity * unitCost, 2, MidpointRounding.AwayFromZero);
        ValuationMethod = valuationMethod.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
