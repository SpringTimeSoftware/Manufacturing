using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Finance;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Finance;
using STS.Mfg.Application.Contracts.Procurement;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Finance;
using STS.Mfg.Domain.Procurement;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Finance;

internal sealed class FinanceService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IFinanceService
{
    private const string StatusDraft = "Draft";
    private const string StatusPosted = "Posted";
    private const string StatusActive = "Active";

    public async Task<PagedResult<ChartOfAccountDto>> ListAccountsAsync(FinanceFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ChartOfAccounts.AsNoTracking().ApplyCompanyScope(GetScope());
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.AccountCode.Contains(search) || entity.AccountName.Contains(search));
        }

        var page = await query.OrderBy(entity => entity.AccountCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapAccount);
    }

    public async Task<ChartOfAccountDto> CreateAccountAsync(ChartOfAccountUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateAccount(request);
        EnsureContextAccess(request.CompanyId, null);
        var entity = ChartOfAccount.Create(request.CompanyId, request.AccountCode, request.AccountName, request.AccountClass, request.ParentAccountId, request.NormalBalance, request.IsActive, request.IsPostingAllowed, request.Status, GetUserId());
        DbContext.ChartOfAccounts.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapAccount(entity);
        await WriteAuditAsync("finance", nameof(ChartOfAccount), "coa.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<FiscalPeriodDto>> ListFiscalPeriodsAsync(FinanceFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.FiscalPeriods.AsNoTracking().ApplyCompanyScope(GetScope());
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        var page = await query.OrderByDescending(entity => entity.FiscalYear).ThenBy(entity => entity.PeriodNo).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapPeriod);
    }

    public async Task<FiscalPeriodDto> CreateFiscalPeriodAsync(FiscalPeriodUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePeriod(request);
        EnsureContextAccess(request.CompanyId, null);
        var entity = FiscalPeriod.Create(request.CompanyId, request.FiscalYear, request.PeriodNo, request.PeriodName, request.StartDate, request.EndDate, request.Status, request.ApLocked, request.ArLocked, request.InventoryLocked, request.ProductionLocked, request.GlLocked, GetUserId());
        DbContext.FiscalPeriods.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapPeriod(entity);
        await WriteAuditAsync("finance", nameof(FiscalPeriod), "period.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<PostingProfileDto>> ListPostingProfilesAsync(FinanceFilter filter, CancellationToken cancellationToken = default)
    {
        var accounts = await DbContext.ChartOfAccounts.AsNoTracking().ToDictionaryAsync(entity => entity.Id, cancellationToken);
        var query = DbContext.FinancePostingProfiles.AsNoTracking().ApplyCompanyScope(GetScope());
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.PostingKey))
        {
            var key = filter.PostingKey.Trim();
            query = query.Where(entity => entity.PostingKey == key);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        var page = await query.OrderBy(entity => entity.PostingKey).ThenBy(entity => entity.ProfileCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, entity => MapProfile(entity, accounts));
    }

    public async Task<PostingProfileDto> CreatePostingProfileAsync(PostingProfileUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateProfile(request);
        EnsureContextAccess(request.CompanyId, null);
        await EnsurePostingAccountAsync(request.CompanyId, request.DebitAccountId, nameof(request.DebitAccountId), cancellationToken);
        await EnsurePostingAccountAsync(request.CompanyId, request.CreditAccountId, nameof(request.CreditAccountId), cancellationToken);
        var entity = FinancePostingProfile.Create(request.CompanyId, request.ProfileCode, request.PostingKey, request.DebitAccountId, request.CreditAccountId, request.MappingSource, request.EffectiveFrom, request.EffectiveTo, request.Status, GetUserId());
        DbContext.FinancePostingProfiles.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var accounts = await DbContext.ChartOfAccounts.AsNoTracking().ToDictionaryAsync(record => record.Id, cancellationToken);
        var dto = MapProfile(entity, accounts);
        await WriteAuditAsync("finance", nameof(FinancePostingProfile), "postingprofile.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<JournalDto>> ListJournalsAsync(FinanceFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.GeneralLedgerJournals.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.JournalNo.Contains(search) || (entity.SourceDocumentNo != null && entity.SourceDocumentNo.Contains(search)));
        }

        var page = await query.OrderByDescending(entity => entity.PostingDate).ThenBy(entity => entity.JournalNo).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadJournalLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapJournal(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<JournalLineDto>())));
    }

    public async Task<JournalDto> CreateJournalAsync(JournalUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateJournal(request, requireBalanced: false);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        await EnsureOpenPeriodAsync(request.CompanyId, request.PostingDate, "GL", cancellationToken);
        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);
        var journal = await CreateJournalInternalAsync(request, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        var dto = await LoadJournalDtoAsync(journal.Id, cancellationToken);
        await WriteAuditAsync("finance", nameof(GeneralLedgerJournal), "journal.create", journal.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<JournalDto> PostJournalAsync(long id, CancellationToken cancellationToken = default)
    {
        var journal = await DbContext.GeneralLedgerJournals.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        journal = EnsureFound(journal, "Journal was not found in the active scope.", "finance.journal_not_found");
        var lines = await DbContext.GeneralLedgerJournalLines.Where(line => line.JournalId == id).ToListAsync(cancellationToken);
        ValidateJournalBalance(lines);
        await EnsureOpenPeriodAsync(journal.CompanyId ?? 0, journal.PostingDate, "GL", cancellationToken);
        foreach (var line in lines)
        {
            await EnsurePostingAccountAsync(journal.CompanyId ?? 0, line.AccountId, nameof(line.AccountId), cancellationToken);
        }

        journal.MarkPosted(GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = await LoadJournalDtoAsync(id, cancellationToken);
        await WriteAuditAsync("finance", nameof(GeneralLedgerJournal), "journal.post", id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<JournalDto> ReverseJournalAsync(long id, string reason, CancellationToken cancellationToken = default)
    {
        var journal = await DbContext.GeneralLedgerJournals.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        journal = EnsureFound(journal, "Journal was not found in the active scope.", "finance.journal_not_found");
        ThrowIfInvalid(journal.Status != StatusPosted
            ? new ApiError("finance.journal_not_posted", nameof(journal.Status), "Only posted journals can be reversed.")
            : null,
            Required(reason, nameof(reason), "Reversal reason is required."));

        var lines = await DbContext.GeneralLedgerJournalLines.AsNoTracking().Where(line => line.JournalId == id).OrderBy(line => line.LineNo).ToArrayAsync(cancellationToken);
        var reversalRequest = new JournalUpsertRequest(
            journal.CompanyId ?? 0,
            journal.BranchId,
            $"{journal.JournalNo}-REV",
            DateOnly.FromDateTime(DateTime.UtcNow),
            journal.DocumentDate,
            journal.SourceModule,
            journal.SourceDocumentType,
            journal.SourceDocumentId,
            journal.SourceDocumentNo,
            journal.CurrencyCode,
            journal.ExchangeRateSnapshot,
            StatusDraft,
            $"Reversal of {journal.JournalNo}: {reason.Trim()}",
            lines.Select(line => new JournalLineUpsertRequest(line.LineNo, line.AccountId, line.CreditAmount, line.DebitAmount, line.BranchId, line.Narration)).ToArray());

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);
        var reversal = await CreateJournalInternalAsync(reversalRequest, cancellationToken);
        reversal.MarkPosted(GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        journal.MarkReversed(reversal.Id, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        var dto = await LoadJournalDtoAsync(reversal.Id, cancellationToken);
        await WriteAuditAsync("finance", nameof(GeneralLedgerJournal), "journal.reverse", id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<SupplierInvoicePostingResultDto> PostSupplierInvoiceAsync(long supplierInvoiceId, CancellationToken cancellationToken = default)
    {
        var invoice = await DbContext.SupplierInvoices.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(entity => entity.Id == supplierInvoiceId, cancellationToken);
        invoice = EnsureFound(invoice, "Supplier invoice was not found in the active scope.", "procurement.invoice_not_found");
        ThrowIfInvalid(invoice.MatchStatus != "Matched"
            ? new ApiError("validation.blocked", nameof(invoice.MatchStatus), "Only matched supplier invoices can be posted to AP.")
            : null);

        var existingLiability = await DbContext.AccountsPayableLiabilities.AsNoTracking().FirstOrDefaultAsync(entity => entity.SupplierInvoiceId == invoice.Id, cancellationToken);
        if (existingLiability is not null)
        {
            var existingPostings = await DbContext.AccountingPostings.AsNoTracking()
                .Where(entity => entity.SourceDocumentType == nameof(SupplierInvoice) && entity.SourceDocumentId == invoice.Id)
                .OrderBy(entity => entity.PostingNo)
                .ToArrayAsync(cancellationToken);
            invoice.SetTotals(invoice.SubtotalAmount, invoice.TaxAmount, invoice.MatchStatus, "Posted", GetUserId());
            invoice.UpdateHeader(invoice.SupplierInvoiceNo, invoice.InvoiceDate, invoice.DueDate, invoice.CurrencyCode, StatusPosted, GetUserId());
            await DbContext.SaveChangesAsync(cancellationToken);
            return new SupplierInvoicePostingResultDto(MapSupplierInvoice(invoice, await LoadSupplierInvoiceLinesAsync(invoice.Id, cancellationToken)), MapLiability(existingLiability), existingPostings.Select(MapPosting).ToArray());
        }

        await EnsureOpenPeriodAsync(invoice.CompanyId ?? 0, invoice.InvoiceDate, "AP", cancellationToken);
        var inventoryProfile = await ResolveProfileAsync(invoice.CompanyId ?? 0, "AP_INVOICE_INVENTORY", invoice.InvoiceDate, cancellationToken);
        var inputTaxProfile = invoice.TaxAmount > 0 ? await ResolveProfileAsync(invoice.CompanyId ?? 0, "AP_INVOICE_INPUT_TAX", invoice.InvoiceDate, cancellationToken) : null;
        var period = await ResolveOpenPeriodAsync(invoice.CompanyId ?? 0, invoice.InvoiceDate, "AP", cancellationToken);

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);
        var liability = AccountsPayableLiability.Create(invoice.CompanyId ?? 0, invoice.BranchId ?? 0, $"AP-{invoice.SupplierInvoiceNo}", invoice.Id, invoice.SupplierId, invoice.InvoiceDate, invoice.DueDate ?? invoice.InvoiceDate.AddDays(30), invoice.TotalAmount, GetUserId());
        DbContext.AccountsPayableLiabilities.Add(liability);

        var journalLines = new List<JournalLineUpsertRequest>
        {
            new(10, inventoryProfile.DebitAccountId, invoice.SubtotalAmount, 0m, invoice.BranchId, $"Supplier invoice {invoice.SupplierInvoiceNo} inventory clearing")
        };
        if (inputTaxProfile is not null)
        {
            journalLines.Add(new JournalLineUpsertRequest(20, inputTaxProfile.DebitAccountId, invoice.TaxAmount, 0m, invoice.BranchId, $"Supplier invoice {invoice.SupplierInvoiceNo} input tax"));
        }

        journalLines.Add(new JournalLineUpsertRequest(90, inventoryProfile.CreditAccountId, 0m, invoice.TotalAmount, invoice.BranchId, $"Supplier invoice {invoice.SupplierInvoiceNo} AP liability"));
        var journal = await CreateJournalInternalAsync(new JournalUpsertRequest(
            invoice.CompanyId ?? 0,
            invoice.BranchId,
            $"GL-{invoice.SupplierInvoiceNo}",
            invoice.InvoiceDate,
            invoice.InvoiceDate,
            "AP",
            nameof(SupplierInvoice),
            invoice.Id,
            invoice.SupplierInvoiceNo,
            invoice.CurrencyCode,
            1m,
            StatusDraft,
            "Supplier invoice AP posting",
            journalLines), cancellationToken);
        journal.MarkPosted(GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var inventoryPosting = AccountingPosting.CreateMapped(invoice.CompanyId ?? 0, invoice.BranchId ?? 0, $"GL-{invoice.SupplierInvoiceNo}-INV", nameof(SupplierInvoice), invoice.Id, invoice.InvoiceDate, inventoryProfile.DebitAccountId, inventoryProfile.DebitAccountCode, inventoryProfile.CreditAccountId, inventoryProfile.CreditAccountCode, inventoryProfile.ProfileId, period.Id, journal.Id, inventoryProfile.MappingSource, invoice.SubtotalAmount, StatusPosted, GetUserId());
        var postings = new List<AccountingPosting> { inventoryPosting };
        DbContext.AccountingPostings.Add(inventoryPosting);

        if (inputTaxProfile is not null)
        {
            var taxPosting = AccountingPosting.CreateMapped(invoice.CompanyId ?? 0, invoice.BranchId ?? 0, $"GL-{invoice.SupplierInvoiceNo}-TAX", nameof(SupplierInvoice), invoice.Id, invoice.InvoiceDate, inputTaxProfile.DebitAccountId, inputTaxProfile.DebitAccountCode, inputTaxProfile.CreditAccountId, inputTaxProfile.CreditAccountCode, inputTaxProfile.ProfileId, period.Id, journal.Id, inputTaxProfile.MappingSource, invoice.TaxAmount, StatusPosted, GetUserId());
            postings.Add(taxPosting);
            DbContext.AccountingPostings.Add(taxPosting);
            DbContext.TaxLedgerEntries.Add(TaxLedgerEntry.Create(invoice.CompanyId ?? 0, invoice.BranchId, "Input", null, 0m, invoice.SubtotalAmount, invoice.TaxAmount, nameof(SupplierInvoice), invoice.Id, invoice.InvoiceDate, period.Id, StatusPosted, GetUserId()));
        }

        await CreateGrnValuationEntriesAsync(invoice, cancellationToken);
        invoice.SetTotals(invoice.SubtotalAmount, invoice.TaxAmount, invoice.MatchStatus, StatusPosted, GetUserId());
        invoice.UpdateHeader(invoice.SupplierInvoiceNo, invoice.InvoiceDate, invoice.DueDate, invoice.CurrencyCode, StatusPosted, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var result = new SupplierInvoicePostingResultDto(
            MapSupplierInvoice(invoice, await LoadSupplierInvoiceLinesAsync(invoice.Id, cancellationToken)),
            MapLiability(liability),
            postings.Select(MapPosting).ToArray());
        await WriteAuditAsync("finance", nameof(SupplierInvoice), "supplierinvoice.post", invoice.Id, null, result, cancellationToken);
        return result;
    }

    public async Task<PagedResult<ArInvoiceDto>> ListArInvoicesAsync(FinanceFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.AccountsReceivableInvoices.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status || entity.ArStatus == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.InvoiceNo.Contains(search) || (entity.SourceDocumentNo != null && entity.SourceDocumentNo.Contains(search)));
        }

        var page = await query.OrderByDescending(entity => entity.InvoiceDate).ThenBy(entity => entity.InvoiceNo).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadArInvoiceLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapArInvoice(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<ArInvoiceLineDto>())));
    }

    public async Task<ArInvoiceDto> CreateArInvoiceFromShipmentAsync(ArInvoiceFromShipmentRequest request, CancellationToken cancellationToken = default)
    {
        var shipment = await DbContext.Shipments.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(entity => entity.Id == request.ShipmentId, cancellationToken);
        shipment = EnsureFound(shipment, "Shipment was not found in the active scope.", "dispatch.shipment_not_found");
        ThrowIfInvalid(
            shipment.Status is not ("Dispatched" or "Delivered" or "POD Received" or "Closed")
                ? new ApiError("finance.shipment_not_billable", nameof(request.ShipmentId), "Only dispatched or delivered shipments can be invoiced.")
                : null);

        var existing = await DbContext.AccountsReceivableInvoices.AsNoTracking().FirstOrDefaultAsync(entity => entity.ShipmentId == shipment.Id, cancellationToken);
        if (existing is not null)
        {
            return MapArInvoice(existing, await LoadArInvoiceLinesAsync(existing.Id, cancellationToken));
        }

        var shipmentLines = await DbContext.ShipmentLines.AsNoTracking().Where(line => line.ShipmentId == shipment.Id).OrderBy(line => line.LineNo).ToArrayAsync(cancellationToken);
        ThrowIfInvalid(shipmentLines.Length == 0
            ? new ApiError("finance.no_shipment_lines", nameof(request.ShipmentId), "Shipment must have at least one line before AR invoice creation.")
            : null);

        var salesOrderId = shipmentLines.Select(line => line.SalesOrderId).FirstOrDefault(id => id.HasValue);
        var salesOrder = salesOrderId.HasValue
            ? await DbContext.SalesOrders.AsNoTracking().FirstOrDefaultAsync(entity => entity.Id == salesOrderId.Value, cancellationToken)
            : null;
        var companyId = shipment.CompanyId ?? salesOrder?.CompanyId ?? 0;
        EnsureContextAccess(companyId, shipment.BranchId);

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);
        var invoice = AccountsReceivableInvoice.Create(companyId, shipment.BranchId, request.InvoiceNo, shipment.CustomerId, salesOrderId, shipment.Id, shipment.ShipmentNo, request.InvoiceDate, request.DueDate, request.CurrencyCode, request.ExchangeRateSnapshot <= 0 ? 1m : request.ExchangeRateSnapshot, StatusDraft, GetUserId());
        DbContext.AccountsReceivableInvoices.Add(invoice);
        await DbContext.SaveChangesAsync(cancellationToken);

        var lines = shipmentLines.Select(line => AccountsReceivableInvoiceLine.Create(
            invoice.Id,
            line.LineNo,
            line.SalesOrderLineId,
            line.Id,
            line.ItemId,
            line.ItemRevisionId,
            line.ShippedQuantity,
            line.ShipUomId,
            line.UnitPrice,
            line.DiscountAmount,
            line.TaxCodeId,
            line.TaxRateSnapshot,
            line.TaxAmount,
            line.LineSubtotal,
            line.LineTaxableAmount,
            line.LineTotalAmount,
            GetUserId())).ToArray();
        DbContext.AccountsReceivableInvoiceLines.AddRange(lines);
        invoice.SetTotals(
            lines.Sum(line => line.LineSubtotal),
            lines.Sum(line => line.DiscountAmount),
            lines.Sum(line => line.LineTaxableAmount),
            lines.Sum(line => line.TaxAmount),
            salesOrder?.FreightAmount ?? 0m,
            salesOrder?.PackingAmount ?? 0m,
            salesOrder?.InsuranceAmount ?? 0m,
            salesOrder?.OtherChargesAmount ?? 0m,
            salesOrder?.AddLessAmount ?? 0m,
            salesOrder?.RoundOffAmount ?? 0m,
            lines.Sum(line => line.LineTotalAmount) + (salesOrder?.FreightAmount ?? 0m) + (salesOrder?.PackingAmount ?? 0m) + (salesOrder?.InsuranceAmount ?? 0m) + (salesOrder?.OtherChargesAmount ?? 0m) + (salesOrder?.AddLessAmount ?? 0m) + (salesOrder?.RoundOffAmount ?? 0m),
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        var dto = MapArInvoice(invoice, lines.Select(MapArInvoiceLine).ToArray());
        await WriteAuditAsync("finance", nameof(AccountsReceivableInvoice), "arinvoice.create_from_shipment", invoice.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ArInvoicePostingResultDto> PostArInvoiceAsync(long id, CancellationToken cancellationToken = default)
    {
        var invoice = await DbContext.AccountsReceivableInvoices.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        invoice = EnsureFound(invoice, "AR invoice was not found in the active scope.", "finance.ar_invoice_not_found");
        if (string.Equals(invoice.ArStatus, StatusPosted, StringComparison.OrdinalIgnoreCase))
        {
            var existingJournal = await DbContext.GeneralLedgerJournals.AsNoTracking().FirstOrDefaultAsync(entity => entity.SourceDocumentType == nameof(AccountsReceivableInvoice) && entity.SourceDocumentId == invoice.Id, cancellationToken);
            var existingReceivable = await DbContext.AccountsReceivableLedgerEntries.AsNoTracking().FirstAsync(entity => entity.ArInvoiceId == invoice.Id, cancellationToken);
            return new ArInvoicePostingResultDto(MapArInvoice(invoice, await LoadArInvoiceLinesAsync(invoice.Id, cancellationToken)), MapArLedger(existingReceivable), await LoadJournalDtoAsync(existingJournal!.Id, cancellationToken), await LoadTaxEntriesAsync(nameof(AccountsReceivableInvoice), invoice.Id, cancellationToken));
        }

        await EnsureOpenPeriodAsync(invoice.CompanyId ?? 0, invoice.InvoiceDate, "AR", cancellationToken);
        var revenueProfile = await ResolveProfileAsync(invoice.CompanyId ?? 0, "AR_INVOICE_REVENUE", invoice.InvoiceDate, cancellationToken);
        var outputTaxProfile = invoice.TaxTotalAmount > 0 ? await ResolveProfileAsync(invoice.CompanyId ?? 0, "AR_INVOICE_OUTPUT_TAX", invoice.InvoiceDate, cancellationToken) : null;
        var period = await ResolveOpenPeriodAsync(invoice.CompanyId ?? 0, invoice.InvoiceDate, "AR", cancellationToken);

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);
        var receivable = AccountsReceivableLedgerEntry.Create(invoice.CompanyId ?? 0, invoice.BranchId, $"AR-{invoice.InvoiceNo}", invoice.Id, invoice.CustomerId, invoice.InvoiceDate, invoice.DueDate ?? invoice.InvoiceDate.AddDays(30), invoice.GrandTotalAmount, GetUserId());
        DbContext.AccountsReceivableLedgerEntries.Add(receivable);

        var journalLines = new List<JournalLineUpsertRequest>
        {
            new(10, revenueProfile.DebitAccountId, invoice.GrandTotalAmount, 0m, invoice.BranchId, $"AR invoice {invoice.InvoiceNo} receivable"),
            new(20, revenueProfile.CreditAccountId, 0m, invoice.TaxableAmount + invoice.FreightAmount + invoice.PackingAmount + invoice.InsuranceAmount + invoice.OtherChargesAmount + invoice.AddLessAmount + invoice.RoundOffAmount, invoice.BranchId, $"AR invoice {invoice.InvoiceNo} revenue")
        };
        if (outputTaxProfile is not null)
        {
            journalLines.Add(new JournalLineUpsertRequest(30, outputTaxProfile.CreditAccountId, 0m, invoice.TaxTotalAmount, invoice.BranchId, $"AR invoice {invoice.InvoiceNo} output tax"));
        }

        var journal = await CreateJournalInternalAsync(new JournalUpsertRequest(invoice.CompanyId ?? 0, invoice.BranchId, $"GL-{invoice.InvoiceNo}", invoice.InvoiceDate, invoice.InvoiceDate, "AR", nameof(AccountsReceivableInvoice), invoice.Id, invoice.InvoiceNo, invoice.CurrencyCode, invoice.ExchangeRateSnapshot, StatusDraft, "AR invoice posting", journalLines), cancellationToken);
        journal.MarkPosted(GetUserId());

        if (invoice.TaxTotalAmount > 0)
        {
            DbContext.TaxLedgerEntries.Add(TaxLedgerEntry.Create(invoice.CompanyId ?? 0, invoice.BranchId, "Output", null, 0m, invoice.TaxableAmount, invoice.TaxTotalAmount, nameof(AccountsReceivableInvoice), invoice.Id, invoice.InvoiceDate, period.Id, StatusPosted, GetUserId()));
        }

        await CreateShipmentValuationEntriesAsync(invoice, cancellationToken);
        invoice.UpdateHeader(invoice.InvoiceNo, invoice.SourceDocumentNo, invoice.InvoiceDate, invoice.DueDate, invoice.CurrencyCode, invoice.ExchangeRateSnapshot, StatusPosted, StatusPosted, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var result = new ArInvoicePostingResultDto(MapArInvoice(invoice, await LoadArInvoiceLinesAsync(invoice.Id, cancellationToken)), MapArLedger(receivable), await LoadJournalDtoAsync(journal.Id, cancellationToken), await LoadTaxEntriesAsync(nameof(AccountsReceivableInvoice), invoice.Id, cancellationToken));
        await WriteAuditAsync("finance", nameof(AccountsReceivableInvoice), "arinvoice.post", invoice.Id, null, result, cancellationToken);
        return result;
    }

    public async Task<PagedResult<TaxLedgerEntryDto>> ListTaxLedgerAsync(FinanceFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.TaxLedgerEntries.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        var page = await query.OrderByDescending(entity => entity.PostingDate).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapTaxLedger);
    }

    public async Task<PagedResult<InventoryValuationEntryDto>> ListInventoryValuationAsync(FinanceFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.InventoryValuationEntries.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        var page = await query.OrderByDescending(entity => entity.ValuationDate).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapValuation);
    }

    private async Task<GeneralLedgerJournal> CreateJournalInternalAsync(JournalUpsertRequest request, CancellationToken cancellationToken)
    {
        ValidateJournal(request, requireBalanced: true);
        foreach (var line in request.Lines)
        {
            await EnsurePostingAccountAsync(request.CompanyId, line.AccountId, nameof(line.AccountId), cancellationToken);
        }

        var journal = GeneralLedgerJournal.Create(request.CompanyId, request.BranchId, request.JournalNo, request.PostingDate, request.DocumentDate, request.SourceModule, request.SourceDocumentType, request.SourceDocumentId, request.SourceDocumentNo, request.CurrencyCode, request.ExchangeRateSnapshot <= 0 ? 1m : request.ExchangeRateSnapshot, request.Status, request.Remarks, GetUserId());
        DbContext.GeneralLedgerJournals.Add(journal);
        await DbContext.SaveChangesAsync(cancellationToken);
        var lines = request.Lines.OrderBy(line => line.LineNo).Select(line => GeneralLedgerJournalLine.Create(journal.Id, line.LineNo, line.AccountId, line.DebitAmount, line.CreditAmount, line.BranchId, line.Narration, GetUserId())).ToArray();
        DbContext.GeneralLedgerJournalLines.AddRange(lines);
        return journal;
    }

    private async Task<ResolvedProfile> ResolveProfileAsync(long companyId, string postingKey, DateOnly postingDate, CancellationToken cancellationToken)
    {
        var profile = await DbContext.FinancePostingProfiles.AsNoTracking()
            .Where(entity => entity.CompanyId == companyId && entity.PostingKey == postingKey && entity.Status == StatusActive && entity.EffectiveFrom <= postingDate && (!entity.EffectiveTo.HasValue || entity.EffectiveTo >= postingDate))
            .OrderByDescending(entity => entity.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);
        if (profile is null)
        {
            throw new ValidationFailureException(new[] { new ApiError("finance.mapping_missing", postingKey, $"Posting profile '{postingKey}' is not configured for the posting date.") });
        }

        var accounts = await DbContext.ChartOfAccounts.AsNoTracking().Where(account => account.Id == profile.DebitAccountId || account.Id == profile.CreditAccountId).ToDictionaryAsync(account => account.Id, cancellationToken);
        var debit = EnsurePostingAccount(accounts.GetValueOrDefault(profile.DebitAccountId), nameof(profile.DebitAccountId));
        var credit = EnsurePostingAccount(accounts.GetValueOrDefault(profile.CreditAccountId), nameof(profile.CreditAccountId));
        return new ResolvedProfile(profile.Id, debit.Id, debit.AccountCode, credit.Id, credit.AccountCode, profile.MappingSource);
    }

    private async Task<FiscalPeriod> ResolveOpenPeriodAsync(long companyId, DateOnly postingDate, string module, CancellationToken cancellationToken)
    {
        var period = await DbContext.FiscalPeriods.AsNoTracking()
            .Where(entity => entity.CompanyId == companyId && entity.StartDate <= postingDate && entity.EndDate >= postingDate)
            .OrderBy(entity => entity.PeriodNo)
            .FirstOrDefaultAsync(cancellationToken);
        if (period is null)
        {
            throw new ValidationFailureException(new[] { new ApiError("finance.period_missing", nameof(postingDate), "No fiscal period is configured for the posting date.") });
        }

        if (period.Status is "Closed" or "Locked" || IsModuleLocked(period, module))
        {
            throw new ValidationFailureException(new[] { new ApiError("finance.period_closed", nameof(postingDate), $"Fiscal period {period.PeriodName} is not open for {module} postings.") });
        }

        return period;
    }

    private async Task EnsureOpenPeriodAsync(long companyId, DateOnly postingDate, string module, CancellationToken cancellationToken) =>
        _ = await ResolveOpenPeriodAsync(companyId, postingDate, module, cancellationToken);

    private async Task EnsurePostingAccountAsync(long companyId, long accountId, string field, CancellationToken cancellationToken)
    {
        var account = await DbContext.ChartOfAccounts.AsNoTracking().FirstOrDefaultAsync(entity => entity.Id == accountId && entity.CompanyId == companyId, cancellationToken);
        EnsurePostingAccount(account, field);
    }

    private static ChartOfAccount EnsurePostingAccount(ChartOfAccount? account, string field)
    {
        if (account is null)
        {
            throw new ValidationFailureException(new[] { new ApiError("finance.account_missing", field, "Posting account was not found.") });
        }

        if (!account.IsActive || account.Status != StatusActive || !account.IsPostingAllowed)
        {
            throw new ValidationFailureException(new[] { new ApiError("finance.account_not_posting", field, $"Account {account.AccountCode} is inactive or not marked for posting.") });
        }

        return account;
    }

    private async Task CreateGrnValuationEntriesAsync(SupplierInvoice invoice, CancellationToken cancellationToken)
    {
        var lines = await DbContext.SupplierInvoiceLines.AsNoTracking().Where(line => line.SupplierInvoiceId == invoice.Id).ToArrayAsync(cancellationToken);
        var receipt = await DbContext.GoodsReceipts.AsNoTracking().FirstOrDefaultAsync(record => record.Id == invoice.GoodsReceiptId, cancellationToken);
        foreach (var line in lines)
        {
            if (await DbContext.InventoryValuationEntries.AnyAsync(entry => entry.SourceDocumentType == nameof(SupplierInvoiceLine) && entry.SourceDocumentId == line.Id, cancellationToken))
            {
                continue;
            }

            DbContext.InventoryValuationEntries.Add(InventoryValuationEntry.Create(invoice.CompanyId ?? 0, invoice.BranchId, null, nameof(SupplierInvoiceLine), line.Id, invoice.SupplierInvoiceNo, line.ItemId, receipt?.WarehouseId, null, null, null, null, invoice.InvoiceDate, line.InvoiceQuantity, line.UnitPrice, "WeightedAverage", StatusPosted, GetUserId()));
        }
    }

    private async Task CreateShipmentValuationEntriesAsync(AccountsReceivableInvoice invoice, CancellationToken cancellationToken)
    {
        if (!invoice.ShipmentId.HasValue)
        {
            return;
        }

        var movements = await DbContext.StockTransactions.AsNoTracking()
            .Where(record => record.SourceDocumentType == "Shipment" && record.SourceDocumentId == invoice.ShipmentId)
            .ToArrayAsync(cancellationToken);
        foreach (var movement in movements)
        {
            if (await DbContext.InventoryValuationEntries.AnyAsync(entry => entry.StockTransactionId == movement.Id, cancellationToken))
            {
                continue;
            }

            DbContext.InventoryValuationEntries.Add(InventoryValuationEntry.Create(invoice.CompanyId ?? 0, invoice.BranchId, movement.Id, "Shipment", invoice.ShipmentId, movement.SourceDocumentNo, movement.ItemId, movement.FromWarehouseId ?? movement.ToWarehouseId, movement.FromBinId ?? movement.ToBinId, movement.LotId, movement.SerialId, movement.PcidId, invoice.InvoiceDate, movement.Quantity, 0m, "WeightedAverage", "Valuation Pending", GetUserId()));
        }
    }

    private async Task<Dictionary<long, IReadOnlyCollection<JournalLineDto>>> LoadJournalLinesAsync(IReadOnlyCollection<long> journalIds, CancellationToken cancellationToken)
    {
        if (journalIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<JournalLineDto>>();
        }

        var accounts = await DbContext.ChartOfAccounts.AsNoTracking().ToDictionaryAsync(account => account.Id, cancellationToken);
        var lines = await DbContext.GeneralLedgerJournalLines.AsNoTracking().Where(line => journalIds.Contains(line.JournalId)).OrderBy(line => line.LineNo).ToArrayAsync(cancellationToken);
        return lines.GroupBy(line => line.JournalId).ToDictionary(group => group.Key, group => (IReadOnlyCollection<JournalLineDto>)group.Select(line => MapJournalLine(line, accounts)).ToArray());
    }

    private async Task<JournalDto> LoadJournalDtoAsync(long id, CancellationToken cancellationToken)
    {
        var journal = await DbContext.GeneralLedgerJournals.AsNoTracking().FirstAsync(entity => entity.Id == id, cancellationToken);
        var lines = await LoadJournalLinesAsync(new[] { id }, cancellationToken);
        return MapJournal(journal, lines.GetValueOrDefault(id, Array.Empty<JournalLineDto>()));
    }

    private async Task<IReadOnlyCollection<SupplierInvoiceLineDto>> LoadSupplierInvoiceLinesAsync(long supplierInvoiceId, CancellationToken cancellationToken)
    {
        var lines = await DbContext.SupplierInvoiceLines.AsNoTracking().Where(line => line.SupplierInvoiceId == supplierInvoiceId).OrderBy(line => line.LineNo).ToArrayAsync(cancellationToken);
        return lines.Select(MapSupplierInvoiceLine).ToArray();
    }

    private async Task<Dictionary<long, IReadOnlyCollection<ArInvoiceLineDto>>> LoadArInvoiceLinesAsync(IReadOnlyCollection<long> invoiceIds, CancellationToken cancellationToken)
    {
        if (invoiceIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<ArInvoiceLineDto>>();
        }

        var lines = await DbContext.AccountsReceivableInvoiceLines.AsNoTracking().Where(line => invoiceIds.Contains(line.ArInvoiceId)).OrderBy(line => line.LineNo).ToArrayAsync(cancellationToken);
        return lines.GroupBy(line => line.ArInvoiceId).ToDictionary(group => group.Key, group => (IReadOnlyCollection<ArInvoiceLineDto>)group.Select(MapArInvoiceLine).ToArray());
    }

    private async Task<IReadOnlyCollection<ArInvoiceLineDto>> LoadArInvoiceLinesAsync(long invoiceId, CancellationToken cancellationToken)
    {
        var lines = await LoadArInvoiceLinesAsync(new[] { invoiceId }, cancellationToken);
        return lines.GetValueOrDefault(invoiceId, Array.Empty<ArInvoiceLineDto>());
    }

    private async Task<IReadOnlyCollection<TaxLedgerEntryDto>> LoadTaxEntriesAsync(string sourceDocumentType, long sourceDocumentId, CancellationToken cancellationToken)
    {
        var entries = await DbContext.TaxLedgerEntries.AsNoTracking()
            .Where(entry => entry.SourceDocumentType == sourceDocumentType && entry.SourceDocumentId == sourceDocumentId)
            .OrderBy(entry => entry.Id)
            .ToArrayAsync(cancellationToken);
        return entries.Select(MapTaxLedger).ToArray();
    }

    private static bool IsModuleLocked(FiscalPeriod period, string module) =>
        module.ToUpperInvariant() switch
        {
            "AP" => period.ApLocked,
            "AR" => period.ArLocked,
            "INVENTORY" => period.InventoryLocked,
            "PRODUCTION" => period.ProductionLocked,
            "GL" => period.GlLocked,
            _ => false
        };

    private static void ValidateAccount(ChartOfAccountUpsertRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.AccountCode, nameof(request.AccountCode), "Account code is required."),
            Required(request.AccountName, nameof(request.AccountName), "Account name is required."),
            Required(request.AccountClass, nameof(request.AccountClass), "Account class is required."),
            Required(request.NormalBalance, nameof(request.NormalBalance), "Normal balance is required."),
            request.NormalBalance is not ("Debit" or "Credit") ? new ApiError("validation.invalid", nameof(request.NormalBalance), "Normal balance must be Debit or Credit.") : null);
    }

    private static void ValidatePeriod(FiscalPeriodUpsertRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            request.PeriodNo <= 0 ? new ApiError("validation.out_of_range", nameof(request.PeriodNo), "Period number must be greater than zero.") : null,
            request.EndDate < request.StartDate ? new ApiError("validation.invalid", nameof(request.EndDate), "Period end must be on or after start date.") : null,
            Required(request.Status, nameof(request.Status), "Period status is required."));
    }

    private static void ValidateProfile(PostingProfileUpsertRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.ProfileCode, nameof(request.ProfileCode), "Profile code is required."),
            Required(request.PostingKey, nameof(request.PostingKey), "Posting key is required."),
            Positive(request.DebitAccountId, nameof(request.DebitAccountId), "Debit account is required."),
            Positive(request.CreditAccountId, nameof(request.CreditAccountId), "Credit account is required."),
            request.EffectiveTo.HasValue && request.EffectiveTo < request.EffectiveFrom ? new ApiError("validation.invalid", nameof(request.EffectiveTo), "Effective-to date must be on or after effective-from date.") : null);
    }

    private static void ValidateJournal(JournalUpsertRequest request, bool requireBalanced)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.JournalNo, nameof(request.JournalNo), "Journal number is required."),
            Required(request.SourceModule, nameof(request.SourceModule), "Source module is required."),
            Required(request.SourceDocumentType, nameof(request.SourceDocumentType), "Source document type is required."),
            Required(request.CurrencyCode, nameof(request.CurrencyCode), "Currency is required."),
            request.Lines.Count == 0 ? new ApiError("validation.required", nameof(request.Lines), "At least one journal line is required.") : null
        };
        errors.AddRange(request.Lines.SelectMany(line => new ApiError?[]
        {
            Positive(line.AccountId, nameof(line.AccountId), "Journal line account is required."),
            NonNegative(line.DebitAmount, nameof(line.DebitAmount), "Debit amount cannot be negative."),
            NonNegative(line.CreditAmount, nameof(line.CreditAmount), "Credit amount cannot be negative."),
            line.DebitAmount > 0 && line.CreditAmount > 0 ? new ApiError("validation.invalid", nameof(line.DebitAmount), "A journal line cannot contain both debit and credit.") : null
        }));

        ThrowIfInvalid(errors);
        if (requireBalanced)
        {
            ValidateJournalBalance(request.Lines);
        }
    }

    private static void ValidateJournalBalance(IEnumerable<JournalLineUpsertRequest> lines)
    {
        var debit = lines.Sum(line => line.DebitAmount);
        var credit = lines.Sum(line => line.CreditAmount);
        if (debit <= 0 || credit <= 0 || debit != credit)
        {
            throw new ValidationFailureException(new[] { new ApiError("finance.journal_unbalanced", "lines", "Journal debit and credit totals must balance before posting.") });
        }
    }

    private static void ValidateJournalBalance(IEnumerable<GeneralLedgerJournalLine> lines)
    {
        var debit = lines.Sum(line => line.DebitAmount);
        var credit = lines.Sum(line => line.CreditAmount);
        if (debit <= 0 || credit <= 0 || debit != credit)
        {
            throw new ValidationFailureException(new[] { new ApiError("finance.journal_unbalanced", "lines", "Journal debit and credit totals must balance before posting.") });
        }
    }

    private static ChartOfAccountDto MapAccount(ChartOfAccount entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.AccountCode, entity.AccountName, entity.AccountClass, entity.ParentAccountId, entity.NormalBalance, entity.IsActive, entity.IsPostingAllowed, entity.Status);

    private static FiscalPeriodDto MapPeriod(FiscalPeriod entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.FiscalYear, entity.PeriodNo, entity.PeriodName, entity.StartDate, entity.EndDate, entity.Status, entity.ApLocked, entity.ArLocked, entity.InventoryLocked, entity.ProductionLocked, entity.GlLocked);

    private static PostingProfileDto MapProfile(FinancePostingProfile entity, IReadOnlyDictionary<long, ChartOfAccount> accounts) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.ProfileCode, entity.PostingKey, entity.DebitAccountId, accounts.GetValueOrDefault(entity.DebitAccountId)?.AccountCode ?? "Missing account", entity.CreditAccountId, accounts.GetValueOrDefault(entity.CreditAccountId)?.AccountCode ?? "Missing account", entity.MappingSource, entity.EffectiveFrom, entity.EffectiveTo, entity.Status);

    private static JournalDto MapJournal(GeneralLedgerJournal entity, IReadOnlyCollection<JournalLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.JournalNo, entity.PostingDate, entity.DocumentDate, entity.SourceModule, entity.SourceDocumentType, entity.SourceDocumentId, entity.SourceDocumentNo, entity.CurrencyCode, entity.ExchangeRateSnapshot, entity.Status, entity.Remarks, entity.PostedAt, entity.PostedByUserId, entity.ReversalJournalId, lines);

    private static JournalLineDto MapJournalLine(GeneralLedgerJournalLine entity, IReadOnlyDictionary<long, ChartOfAccount> accounts) =>
        new(entity.Id, entity.LineNo, entity.AccountId, accounts.GetValueOrDefault(entity.AccountId)?.AccountCode ?? "Missing account", entity.DebitAmount, entity.CreditAmount, entity.BranchId, entity.Narration);

    private static SupplierInvoiceLineDto MapSupplierInvoiceLine(SupplierInvoiceLine entity) =>
        new(entity.Id, entity.LineNo, entity.PurchaseOrderLineId, entity.GoodsReceiptLineId, entity.ItemId, entity.InvoiceQuantity, entity.UnitPrice, entity.TaxPercent, entity.TaxAmount, entity.LineAmount, entity.MatchStatus);

    private static SupplierInvoiceDto MapSupplierInvoice(SupplierInvoice entity, IReadOnlyCollection<SupplierInvoiceLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.SupplierInvoiceNo, entity.SupplierId, entity.PurchaseOrderId, entity.GoodsReceiptId, entity.InvoiceDate, entity.DueDate, entity.CurrencyCode, entity.SubtotalAmount, entity.TaxAmount, entity.TotalAmount, entity.MatchStatus, entity.ApStatus, entity.Status, lines);

    private static AccountsPayableLiabilityDto MapLiability(AccountsPayableLiability entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.LiabilityNo, entity.SupplierInvoiceId, entity.SupplierId, entity.PostingDate, entity.DueDate, entity.PayableAmount, entity.PaidAmount, entity.BalanceAmount, entity.Status);

    private static AccountingPostingDto MapPosting(AccountingPosting entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PostingNo, entity.SourceDocumentType, entity.SourceDocumentId, entity.PostingDate, entity.DebitAccountCode, entity.CreditAccountCode, entity.Amount, entity.Status, entity.DebitAccountId, entity.CreditAccountId, entity.PostingProfileId, entity.FiscalPeriodId, entity.JournalId, entity.MappingSource);

    private static ArInvoiceDto MapArInvoice(AccountsReceivableInvoice entity, IReadOnlyCollection<ArInvoiceLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.InvoiceNo, entity.CustomerId, entity.SalesOrderId, entity.ShipmentId, entity.SourceDocumentNo, entity.InvoiceDate, entity.DueDate, entity.CurrencyCode, entity.ExchangeRateSnapshot, entity.SubtotalAmount, entity.DiscountTotalAmount, entity.TaxableAmount, entity.TaxTotalAmount, entity.FreightAmount, entity.PackingAmount, entity.InsuranceAmount, entity.OtherChargesAmount, entity.AddLessAmount, entity.RoundOffAmount, entity.GrandTotalAmount, entity.Status, entity.ArStatus, lines);

    private static ArInvoiceLineDto MapArInvoiceLine(AccountsReceivableInvoiceLine entity) =>
        new(entity.Id, entity.LineNo, entity.SalesOrderLineId, entity.ShipmentLineId, entity.ItemId, entity.ItemRevisionId, entity.InvoiceQuantity, entity.UomId, entity.UnitPrice, entity.DiscountAmount, entity.TaxCodeId, entity.TaxRateSnapshot, entity.TaxAmount, entity.LineSubtotal, entity.LineTaxableAmount, entity.LineTotalAmount);

    private static ArSubledgerEntryDto MapArLedger(AccountsReceivableLedgerEntry entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.EntryNo, entity.ArInvoiceId, entity.CustomerId, entity.PostingDate, entity.DueDate, entity.ReceivableAmount, entity.ReceivedAmount, entity.BalanceAmount, entity.Status);

    private static TaxLedgerEntryDto MapTaxLedger(TaxLedgerEntry entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.TaxDirection, entity.TaxCodeId, entity.TaxRateSnapshot, entity.TaxableAmount, entity.TaxAmount, entity.SourceDocumentType, entity.SourceDocumentId, entity.PostingDate, entity.FiscalPeriodId, entity.Status);

    private static InventoryValuationEntryDto MapValuation(InventoryValuationEntry entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.StockTransactionId, entity.SourceDocumentType, entity.SourceDocumentId, entity.SourceDocumentNo, entity.ItemId, entity.WarehouseId, entity.BinId, entity.LotId, entity.SerialId, entity.PcidId, entity.ValuationDate, entity.Quantity, entity.UnitCost, entity.TotalCost, entity.ValuationMethod, entity.Status);

    private sealed record ResolvedProfile(long ProfileId, long DebitAccountId, string DebitAccountCode, long CreditAccountId, string CreditAccountCode, string MappingSource);
}
