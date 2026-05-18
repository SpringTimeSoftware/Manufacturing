using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Finance;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Dispatch;
using STS.Mfg.Domain.Finance;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Domain.Procurement;
using STS.Mfg.Domain.SalesPlanning;
using STS.Mfg.Infrastructure.Finance;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Tests;

public sealed class FinanceGlApArCostingServiceTests
{
    [Fact]
    public async Task CreateJournalAsync_BlocksUnbalancedJournal()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedFinanceSetupAsync(dbContext);
        var service = CreateService(dbContext);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.CreateJournalAsync(new JournalUpsertRequest(
                1,
                10,
                "JV-UNBAL-001",
                new DateOnly(2026, 5, 16),
                new DateOnly(2026, 5, 16),
                "GL",
                "Manual",
                null,
                null,
                "INR",
                1m,
                "Draft",
                "Unbalanced draft should not post.",
                new[]
                {
                    new JournalLineUpsertRequest(10, seed.InventoryAccountId, 100m, 0m, 10, "Debit inventory"),
                    new JournalLineUpsertRequest(20, seed.ApAccountId, 0m, 90m, 10, "Credit AP")
                })));

        Assert.Contains(ex.Errors, error => error.Code == "finance.journal_unbalanced");
        Assert.Empty(await dbContext.GeneralLedgerJournals.ToArrayAsync());
    }

    [Fact]
    public async Task CreateJournalAsync_BlocksClosedFiscalPeriod()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedFinanceSetupAsync(dbContext, periodStatus: "Closed");
        var service = CreateService(dbContext);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.CreateJournalAsync(new JournalUpsertRequest(
                1,
                10,
                "JV-CLOSED-001",
                new DateOnly(2026, 5, 16),
                new DateOnly(2026, 5, 16),
                "GL",
                "Manual",
                null,
                null,
                "INR",
                1m,
                "Draft",
                "Closed period block.",
                new[]
                {
                    new JournalLineUpsertRequest(10, seed.InventoryAccountId, 100m, 0m, 10, "Debit inventory"),
                    new JournalLineUpsertRequest(20, seed.ApAccountId, 0m, 100m, 10, "Credit AP")
                })));

        Assert.Contains(ex.Errors, error => error.Code == "finance.period_closed");
    }

    [Fact]
    public async Task PostSupplierInvoiceAsync_UsesMappedAccountsAndCreatesApTaxAndValuation()
    {
        await using var dbContext = CreateDbContext();
        var financeSeed = await SeedFinanceSetupAsync(dbContext);
        var invoice = await SeedMatchedSupplierInvoiceAsync(dbContext);
        var service = CreateService(dbContext);

        var result = await service.PostSupplierInvoiceAsync(invoice.Id);

        Assert.Equal("Posted", result.Invoice.ApStatus);
        Assert.Equal(236m, result.Liability.PayableAmount);
        Assert.All(result.Postings, posting =>
        {
            Assert.NotNull(posting.DebitAccountId);
            Assert.NotNull(posting.CreditAccountId);
            Assert.NotEqual("InventoryClearing", posting.DebitAccountCode);
            Assert.NotEqual("AccountsPayable", posting.CreditAccountCode);
            Assert.Equal("Company finance posting profile", posting.MappingSource);
        });
        Assert.Contains(result.Postings, posting => posting.DebitAccountId == financeSeed.InventoryAccountId && posting.CreditAccountId == financeSeed.ApAccountId);
        Assert.Contains(result.Postings, posting => posting.DebitAccountId == financeSeed.InputTaxAccountId && posting.CreditAccountId == financeSeed.ApAccountId);

        var tax = Assert.Single(await dbContext.TaxLedgerEntries.ToArrayAsync());
        Assert.Equal("Input", tax.TaxDirection);
        Assert.Equal(36m, tax.TaxAmount);

        var valuation = Assert.Single(await dbContext.InventoryValuationEntries.ToArrayAsync());
        Assert.Equal(nameof(SupplierInvoiceLine), valuation.SourceDocumentType);
        Assert.Equal(2m, valuation.Quantity);
        Assert.Equal(100m, valuation.UnitCost);
        Assert.Equal(200m, valuation.TotalCost);
    }

    [Fact]
    public async Task PostSupplierInvoiceAsync_MissingPostingProfileBlocksPosting()
    {
        await using var dbContext = CreateDbContext();
        await SeedFinanceSetupAsync(dbContext, includeProfiles: false);
        var invoice = await SeedMatchedSupplierInvoiceAsync(dbContext);
        var service = CreateService(dbContext);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() => service.PostSupplierInvoiceAsync(invoice.Id));

        Assert.Contains(ex.Errors, error => error.Code == "finance.mapping_missing" && error.Field == "AP_INVOICE_INVENTORY");
        Assert.Empty(await dbContext.AccountsPayableLiabilities.ToArrayAsync());
        Assert.Empty(await dbContext.AccountingPostings.ToArrayAsync());
    }

    [Fact]
    public async Task CreateArInvoiceFromShipmentAsync_CopiesShipmentCommercialSnapshotWithoutRecalculation()
    {
        await using var dbContext = CreateDbContext();
        await SeedFinanceSetupAsync(dbContext);
        var shipment = await SeedShipmentAsync(dbContext);
        var service = CreateService(dbContext);

        var invoice = await service.CreateArInvoiceFromShipmentAsync(new ArInvoiceFromShipmentRequest(
            shipment.Id,
            "AR-SHP-001",
            new DateOnly(2026, 5, 18),
            new DateOnly(2026, 6, 17),
            "INR",
            1m));

        Assert.Equal(shipment.Id, invoice.ShipmentId);
        Assert.Equal("SHP-FIN-001", invoice.SourceDocumentNo);
        Assert.Equal(252m, invoice.SubtotalAmount);
        Assert.Equal(252m, invoice.TaxableAmount);
        Assert.Equal(45.36m, invoice.TaxTotalAmount);
        Assert.Equal(337.36m, invoice.GrandTotalAmount);
        var line = Assert.Single(invoice.Lines);
        Assert.Equal(501, line.ItemRevisionId);
        Assert.Equal(120m, line.UnitPrice);
        Assert.Equal(12m, line.DiscountAmount);
        Assert.Equal(18m, line.TaxRateSnapshot);
        Assert.Equal(45.36m, line.TaxAmount);
        Assert.Equal(297.36m, line.LineTotalAmount);
    }

    [Fact]
    public async Task PostArInvoiceAsync_CreatesArLedgerJournalTaxAndValuationPending()
    {
        await using var dbContext = CreateDbContext();
        var financeSeed = await SeedFinanceSetupAsync(dbContext);
        var shipment = await SeedShipmentAsync(dbContext, withStockMovement: true);
        var service = CreateService(dbContext);
        var invoice = await service.CreateArInvoiceFromShipmentAsync(new ArInvoiceFromShipmentRequest(
            shipment.Id,
            "AR-SHP-POST-001",
            new DateOnly(2026, 5, 18),
            new DateOnly(2026, 6, 17),
            "INR",
            1m));

        var posted = await service.PostArInvoiceAsync(invoice.Id);

        Assert.Equal("Posted", posted.Invoice.ArStatus);
        Assert.Equal(posted.Invoice.GrandTotalAmount, posted.Receivable.ReceivableAmount);
        Assert.Equal("Posted", posted.Journal.Status);
        Assert.Contains(posted.Journal.Lines, line => line.AccountId == financeSeed.ArAccountId && line.DebitAmount == posted.Invoice.GrandTotalAmount);
        Assert.Contains(posted.Journal.Lines, line => line.AccountId == financeSeed.SalesAccountId && line.CreditAmount == posted.Invoice.TaxableAmount + posted.Invoice.FreightAmount + posted.Invoice.PackingAmount + posted.Invoice.InsuranceAmount + posted.Invoice.OtherChargesAmount + posted.Invoice.AddLessAmount + posted.Invoice.RoundOffAmount);
        Assert.Contains(posted.Journal.Lines, line => line.AccountId == financeSeed.OutputTaxAccountId && line.CreditAmount == posted.Invoice.TaxTotalAmount);
        Assert.Single(posted.TaxEntries);

        var valuation = Assert.Single(await dbContext.InventoryValuationEntries.Where(entry => entry.SourceDocumentType == "Shipment").ToArrayAsync());
        Assert.Equal("Valuation Pending", valuation.Status);
        Assert.Equal(-2m, valuation.Quantity);
        Assert.Equal(shipment.Id, valuation.SourceDocumentId);
    }

    private static FinanceService CreateService(MfgDbContext dbContext) =>
        new(dbContext, new AllowAllDataScopeService(), new TestCurrentUserContextAccessor(), new TestAuditTrail());

    private static MfgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .ConfigureWarnings(builder => builder.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new MfgDbContext(options);
    }

    private static async Task<FinanceSeed> SeedFinanceSetupAsync(MfgDbContext dbContext, string periodStatus = "Open", bool includeProfiles = true)
    {
        var ar = ChartOfAccount.Create(1, "1200-AR", "Accounts Receivable", "Asset", null, "Debit", true, true, "Active", 77);
        var inventory = ChartOfAccount.Create(1, "1300-INVENTORY", "Inventory", "Asset", null, "Debit", true, true, "Active", 77);
        var inputTax = ChartOfAccount.Create(1, "1450-INPUT-TAX", "Input Tax", "Asset", null, "Debit", true, true, "Active", 77);
        var ap = ChartOfAccount.Create(1, "2100-AP", "Accounts Payable", "Liability", null, "Credit", true, true, "Active", 77);
        var outputTax = ChartOfAccount.Create(1, "2200-OUTPUT-TAX", "Output Tax", "Liability", null, "Credit", true, true, "Active", 77);
        var sales = ChartOfAccount.Create(1, "4100-SALES", "Sales Revenue", "Revenue", null, "Credit", true, true, "Active", 77);
        dbContext.ChartOfAccounts.AddRange(ar, inventory, inputTax, ap, outputTax, sales);
        dbContext.FiscalPeriods.Add(FiscalPeriod.Create(1, 2026, 5, "May 2026", new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 31), periodStatus, false, false, false, false, false, 77));
        await dbContext.SaveChangesAsync();

        if (includeProfiles)
        {
            dbContext.FinancePostingProfiles.AddRange(
                FinancePostingProfile.Create(1, "AP inventory clearing", "AP_INVOICE_INVENTORY", inventory.Id, ap.Id, "Company finance posting profile", new DateOnly(2026, 1, 1), null, "Active", 77),
                FinancePostingProfile.Create(1, "AP input tax", "AP_INVOICE_INPUT_TAX", inputTax.Id, ap.Id, "Company finance posting profile", new DateOnly(2026, 1, 1), null, "Active", 77),
                FinancePostingProfile.Create(1, "AR revenue", "AR_INVOICE_REVENUE", ar.Id, sales.Id, "Company finance posting profile", new DateOnly(2026, 1, 1), null, "Active", 77),
                FinancePostingProfile.Create(1, "AR output tax", "AR_INVOICE_OUTPUT_TAX", ar.Id, outputTax.Id, "Company finance posting profile", new DateOnly(2026, 1, 1), null, "Active", 77));
            await dbContext.SaveChangesAsync();
        }

        return new FinanceSeed(ar.Id, inventory.Id, inputTax.Id, ap.Id, outputTax.Id, sales.Id);
    }

    private static async Task<SupplierInvoice> SeedMatchedSupplierInvoiceAsync(MfgDbContext dbContext)
    {
        var supplier = Supplier.Create(1, "SUP-FIN", "Finance Supplier", "Manufacturer", false, 10, null, null, "NET30", "Active", 77);
        dbContext.Suppliers.Add(supplier);
        await dbContext.SaveChangesAsync();

        var purchaseOrder = PurchaseOrder.Create(1, 10, "PO-FIN-001", supplier.Id, null, "Approved", new DateOnly(2026, 5, 20), 77);
        dbContext.PurchaseOrders.Add(purchaseOrder);
        await dbContext.SaveChangesAsync();

        var poLine = PurchaseOrderLine.Create(purchaseOrder.Id, 10, 1001, null, 2m, 100m, 0m, 18m, 1, new DateOnly(2026, 5, 20), null, null, "Open", 77);
        dbContext.PurchaseOrderLines.Add(poLine);
        await dbContext.SaveChangesAsync();

        var receipt = GoodsReceipt.Create(1, 10, "GRN-FIN-001", purchaseOrder.Id, supplier.Id, new DateOnly(2026, 5, 16), 901, "Received", null, 77);
        dbContext.GoodsReceipts.Add(receipt);
        await dbContext.SaveChangesAsync();

        var receiptLine = GoodsReceiptLine.Create(receipt.Id, 10, poLine.Id, poLine.ItemId, poLine.OrderUomId, 2m, 2m, 0m, 100m, 18m, "Accepted", "Received", 77);
        dbContext.GoodsReceiptLines.Add(receiptLine);
        await dbContext.SaveChangesAsync();

        var invoice = SupplierInvoice.Create(1, 10, "SIN-FIN-001", supplier.Id, purchaseOrder.Id, receipt.Id, new DateOnly(2026, 5, 16), new DateOnly(2026, 6, 15), "INR", "Matched", 77);
        dbContext.SupplierInvoices.Add(invoice);
        await dbContext.SaveChangesAsync();

        dbContext.SupplierInvoiceLines.Add(SupplierInvoiceLine.Create(invoice.Id, 10, poLine.Id, receiptLine.Id, poLine.ItemId, 2m, 100m, 18m, "Matched", 77));
        invoice.SetTotals(200m, 36m, "Matched", "Not Posted", 77);
        await dbContext.SaveChangesAsync();
        return invoice;
    }

    private static async Task<Shipment> SeedShipmentAsync(MfgDbContext dbContext, bool withStockMovement = false)
    {
        var customer = Customer.Create(1, "CUST-FIN", "Finance Customer", null, "OEM", 10, null, null, null, null, "Active", 77);
        dbContext.Customers.Add(customer);
        await dbContext.SaveChangesAsync();

        var salesOrder = SalesOrder.Create(
            1,
            10,
            "SO-FIN-001",
            customer.Id,
            null,
            null,
            new DateOnly(2026, 5, 15),
            new DateOnly(2026, 5, 20),
            "Normal",
            "Released",
            7001,
            3,
            8,
            77,
            "Sales Owner",
            "Internal note",
            "Customer note",
            "Print note",
            null,
            null,
            null,
            null,
            "GST",
            null,
            null,
            1m,
            null,
            10m,
            5m,
            3m,
            2m,
            0m,
            20m,
            252m,
            12m,
            252m,
            45.36m,
            337.36m,
            "Released",
            new DateTimeOffset(2026, 5, 15, 10, 0, 0, TimeSpan.Zero),
            77,
            77);
        dbContext.SalesOrders.Add(salesOrder);
        await dbContext.SaveChangesAsync();

        var salesOrderLine = SalesOrderLine.Create(
            salesOrder.Id,
            10,
            1002,
            null,
            1,
            2m,
            "Make",
            new DateOnly(2026, 5, 20),
            "Normal",
            "Customer spec",
            new DateOnly(2026, 5, 19),
            "Open",
            501,
            null,
            null,
            null,
            120m,
            "PriceList",
            901,
            902,
            903,
            5m,
            12m,
            904,
            18m,
            45.36m,
            252m,
            252m,
            297.36m,
            "Line internal",
            "Line customer",
            null,
            77);
        dbContext.SalesOrderLines.Add(salesOrderLine);
        await dbContext.SaveChangesAsync();

        var shipment = Shipment.Create(1, 10, "SHP-FIN-001", null, customer.Id, new DateOnly(2026, 5, 17), "MH-12-AR-001", "LR-FIN", null, "Finance shipment", "STS Transport", "Driver", "9000000000", "Customer DC", "Dispatched", null, null, 77);
        dbContext.Shipments.Add(shipment);
        await dbContext.SaveChangesAsync();

        var shipmentLine = ShipmentLine.Create(
            shipment.Id,
            10,
            null,
            salesOrderLine.Id,
            salesOrderLine.ItemId,
            null,
            901,
            902,
            903,
            null,
            null,
            2m,
            1,
            "Shipped",
            salesOrder.Id,
            salesOrder.SalesOrderNo,
            salesOrderLine.Id,
            salesOrder.SourceQuoteRevisionNo,
            salesOrder.SourceQuoteVersionNo,
            salesOrderLine.ItemRevisionId,
            salesOrderLine.EngineeringDocumentRevisionId,
            salesOrderLine.BomRevisionId,
            salesOrderLine.RoutingId,
            salesOrderLine.UnitPrice,
            salesOrderLine.PriceSourceType,
            salesOrderLine.PriceListLineId,
            salesOrderLine.DiscountSchemeId,
            salesOrderLine.DiscountRuleId,
            salesOrderLine.DiscountPercent,
            salesOrderLine.DiscountAmount,
            salesOrderLine.TaxCodeId,
            salesOrderLine.TaxRateSnapshot,
            salesOrderLine.TaxAmount,
            salesOrderLine.LineSubtotal,
            salesOrderLine.LineTaxableAmount,
            salesOrderLine.LineTotalAmount,
            salesOrderLine.LineInternalRemarks,
            salesOrderLine.LineCustomerFacingRemarks,
            77);
        dbContext.ShipmentLines.Add(shipmentLine);
        await dbContext.SaveChangesAsync();

        if (withStockMovement)
        {
            var movement = StockTransaction.Create(1, 10, "ST-SHP-FIN-001", "Issue", new DateOnly(2026, 5, 17), salesOrderLine.ItemId, null, 901, 902, null, null, 903, null, -2m, null, "Available", "Shipment", shipment.Id, "Shipment issue", 77);
            movement.ApplyTrackingSnapshot(null, shipment.ShipmentNo, shipmentLine.Id, salesOrder.SourceQuoteRevisionNo, salesOrder.SourceQuoteVersionNo, salesOrderLine.ItemRevisionId, salesOrderLine.EngineeringDocumentRevisionId, salesOrderLine.BomRevisionId, salesOrderLine.RoutingId, null, null, null, salesOrder.Id, salesOrderLine.Id, null, null, null, false, 77);
            dbContext.StockTransactions.Add(movement);
            await dbContext.SaveChangesAsync();
        }

        return shipment;
    }

    private sealed record FinanceSeed(long ArAccountId, long InventoryAccountId, long InputTaxAccountId, long ApAccountId, long OutputTaxAccountId, long SalesAccountId);

    private sealed class AllowAllDataScopeService : IDataScopeService
    {
        private static readonly DataScopeContext Scope = new(77, 1, 10, true, RecordVisibilityMode.AllInScope, [1], [10], [], [1], [], []);

        public DataScopeContext GetCurrentScope() => Scope;
        public void EnsureContextAccess(long? companyId, long? branchId) { }
        public void EnsureWarehouseAccess(long? warehouseId) { }
        public void EnsureDepartmentAccess(long? departmentId) { }
        public void EnsureRecordAccess(long? ownerUserId) { }
        public IReadOnlyDictionary<string, object?> CreateStoredProcedureScope(long? warehouseId = null, long? departmentId = null, long? ownerUserId = null) => new Dictionary<string, object?>();
    }

    private sealed class TestCurrentUserContextAccessor : ICurrentUserContextAccessor
    {
        public CurrentUserContext GetCurrent() => GetRequired();
        public CurrentUserContext GetRequired() => new(true, 77, "finance.tester", "Finance Tester", "finance.tester@sts.local", "en-IN", "web", 1, 10, []);
    }

    private sealed class TestAuditTrail : IAuditTrail
    {
        public Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
