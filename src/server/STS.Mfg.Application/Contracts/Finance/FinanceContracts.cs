using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Finance;

public sealed record FinanceFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    long? CompanyId = null,
    long? BranchId = null,
    string? PostingKey = null,
    long? SourceDocumentId = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record ChartOfAccountDto(
    long Id,
    long CompanyId,
    string AccountCode,
    string AccountName,
    string AccountClass,
    long? ParentAccountId,
    string NormalBalance,
    bool IsActive,
    bool IsPostingAllowed,
    string Status);

public sealed record ChartOfAccountUpsertRequest(
    long CompanyId,
    string AccountCode,
    string AccountName,
    string AccountClass,
    long? ParentAccountId,
    string NormalBalance,
    bool IsActive,
    bool IsPostingAllowed,
    string Status);

public sealed record FiscalPeriodDto(
    long Id,
    long CompanyId,
    int FiscalYear,
    int PeriodNo,
    string PeriodName,
    DateOnly StartDate,
    DateOnly EndDate,
    string Status,
    bool ApLocked,
    bool ArLocked,
    bool InventoryLocked,
    bool ProductionLocked,
    bool GlLocked);

public sealed record FiscalPeriodUpsertRequest(
    long CompanyId,
    int FiscalYear,
    int PeriodNo,
    string PeriodName,
    DateOnly StartDate,
    DateOnly EndDate,
    string Status,
    bool ApLocked,
    bool ArLocked,
    bool InventoryLocked,
    bool ProductionLocked,
    bool GlLocked);

public sealed record PostingProfileDto(
    long Id,
    long CompanyId,
    string ProfileCode,
    string PostingKey,
    long DebitAccountId,
    string DebitAccountCode,
    long CreditAccountId,
    string CreditAccountCode,
    string MappingSource,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record PostingProfileUpsertRequest(
    long CompanyId,
    string ProfileCode,
    string PostingKey,
    long DebitAccountId,
    long CreditAccountId,
    string MappingSource,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record JournalLineDto(
    long Id,
    int LineNo,
    long AccountId,
    string AccountCode,
    decimal DebitAmount,
    decimal CreditAmount,
    long? BranchId,
    string? Narration);

public sealed record JournalLineUpsertRequest(
    int LineNo,
    long AccountId,
    decimal DebitAmount,
    decimal CreditAmount,
    long? BranchId,
    string? Narration);

public sealed record JournalDto(
    long Id,
    long CompanyId,
    long? BranchId,
    string JournalNo,
    DateOnly PostingDate,
    DateOnly DocumentDate,
    string SourceModule,
    string SourceDocumentType,
    long? SourceDocumentId,
    string? SourceDocumentNo,
    string CurrencyCode,
    decimal ExchangeRateSnapshot,
    string Status,
    string? Remarks,
    DateTimeOffset? PostedAt,
    long? PostedByUserId,
    long? ReversalJournalId,
    IReadOnlyCollection<JournalLineDto> Lines);

public sealed record JournalUpsertRequest(
    long CompanyId,
    long? BranchId,
    string JournalNo,
    DateOnly PostingDate,
    DateOnly DocumentDate,
    string SourceModule,
    string SourceDocumentType,
    long? SourceDocumentId,
    string? SourceDocumentNo,
    string CurrencyCode,
    decimal ExchangeRateSnapshot,
    string Status,
    string? Remarks,
    IReadOnlyCollection<JournalLineUpsertRequest> Lines);

public sealed record ArInvoiceLineDto(
    long Id,
    int LineNo,
    long? SalesOrderLineId,
    long? ShipmentLineId,
    long ItemId,
    long? ItemRevisionId,
    decimal InvoiceQuantity,
    long UomId,
    decimal UnitPrice,
    decimal DiscountAmount,
    long? TaxCodeId,
    decimal TaxRateSnapshot,
    decimal TaxAmount,
    decimal LineSubtotal,
    decimal LineTaxableAmount,
    decimal LineTotalAmount);

public sealed record ArInvoiceDto(
    long Id,
    long CompanyId,
    long? BranchId,
    string InvoiceNo,
    long CustomerId,
    long? SalesOrderId,
    long? ShipmentId,
    string? SourceDocumentNo,
    DateOnly InvoiceDate,
    DateOnly? DueDate,
    string CurrencyCode,
    decimal ExchangeRateSnapshot,
    decimal SubtotalAmount,
    decimal DiscountTotalAmount,
    decimal TaxableAmount,
    decimal TaxTotalAmount,
    decimal FreightAmount,
    decimal PackingAmount,
    decimal InsuranceAmount,
    decimal OtherChargesAmount,
    decimal AddLessAmount,
    decimal RoundOffAmount,
    decimal GrandTotalAmount,
    string Status,
    string ArStatus,
    IReadOnlyCollection<ArInvoiceLineDto> Lines);

public sealed record ArInvoiceFromShipmentRequest(
    long ShipmentId,
    string InvoiceNo,
    DateOnly InvoiceDate,
    DateOnly? DueDate,
    string CurrencyCode,
    decimal ExchangeRateSnapshot);

public sealed record ArSubledgerEntryDto(
    long Id,
    long CompanyId,
    long? BranchId,
    string EntryNo,
    long ArInvoiceId,
    long CustomerId,
    DateOnly PostingDate,
    DateOnly DueDate,
    decimal ReceivableAmount,
    decimal ReceivedAmount,
    decimal BalanceAmount,
    string Status);

public sealed record TaxLedgerEntryDto(
    long Id,
    long CompanyId,
    long? BranchId,
    string TaxDirection,
    long? TaxCodeId,
    decimal TaxRateSnapshot,
    decimal TaxableAmount,
    decimal TaxAmount,
    string SourceDocumentType,
    long SourceDocumentId,
    DateOnly PostingDate,
    long? FiscalPeriodId,
    string Status);

public sealed record InventoryValuationEntryDto(
    long Id,
    long CompanyId,
    long? BranchId,
    long? StockTransactionId,
    string SourceDocumentType,
    long? SourceDocumentId,
    string? SourceDocumentNo,
    long ItemId,
    long? WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    long? PcidId,
    DateOnly ValuationDate,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalCost,
    string ValuationMethod,
    string Status);

public sealed record SupplierInvoiceFinancePostingDto(
    long JournalId,
    long LiabilityId,
    IReadOnlyCollection<TaxLedgerEntryDto> TaxEntries,
    IReadOnlyCollection<InventoryValuationEntryDto> ValuationEntries);

public sealed record ArInvoicePostingResultDto(
    ArInvoiceDto Invoice,
    ArSubledgerEntryDto Receivable,
    JournalDto Journal,
    IReadOnlyCollection<TaxLedgerEntryDto> TaxEntries);
