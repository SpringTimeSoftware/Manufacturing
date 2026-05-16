using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.SalesPlanning;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Commercial;
using STS.Mfg.Application.Contracts.SalesPlanning;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Commercial;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Measurements;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Infrastructure.Commercial;
using STS.Mfg.Infrastructure.Persistence;
using STS.Mfg.Infrastructure.SalesPlanning;

namespace STS.Mfg.Tests;

public sealed class SalesPlanningCommercialContractTests
{
    [Fact]
    public async Task QuoteReleaseAndConversion_ShouldCopyCommercialSnapshotWithoutRecalculation()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedSalesPlanningSetupAsync(dbContext);
        var auditTrail = new TestAuditTrail();
        var service = CreateService(dbContext, auditTrail);

        var quote = await service.CreateQuoteAsync(CreateQuoteRequest(seed, "Q-2026-0001"));
        Assert.Equal(342.20m, quote.GrandTotalAmount);

        var released = await service.ReleaseQuoteAsync(quote.Id);
        Assert.Equal("Released", released.CommercialStatus);
        Assert.NotNull(released.ReleasedAt);

        dbContext.PriceListLines.Add(PriceListLine.Create(seed.PriceListId, 30, seed.ItemId, null, seed.UomId, 1m, 999m, true, seed.TaxCategoryId, new DateOnly(2026, 5, 1), null, "Active", 77));
        dbContext.TaxCodes.Add(TaxCode.Create(seed.TaxCategoryId, "GST28", "GST 28", 28m, new DateOnly(2026, 5, 1), null, "Active", 77));
        await dbContext.SaveChangesAsync();

        var order = await service.ConvertQuoteToSalesOrderAsync(released.Id, new QuoteConvertRequest("SO-2026-0001", new DateOnly(2026, 5, 16), null, null, null));

        Assert.Equal(released.Id, order.SourceQuoteId);
        Assert.Equal(released.RevisionNo, order.SourceQuoteRevisionNo);
        Assert.Equal(released.GrandTotalAmount, order.GrandTotalAmount);
        Assert.Equal(released.SubtotalAmount, order.SubtotalAmount);
        Assert.Equal(released.TaxTotalAmount, order.TaxTotalAmount);

        var quoteLine = Assert.Single(released.Lines);
        var orderLine = Assert.Single(order.Lines);
        Assert.Equal(quoteLine.UnitPrice, orderLine.UnitPrice);
        Assert.Equal(quoteLine.DiscountPercent, orderLine.DiscountPercent);
        Assert.Equal(quoteLine.TaxRateSnapshot, orderLine.TaxRateSnapshot);
        Assert.Equal(quoteLine.LineTotalAmount, orderLine.LineTotalAmount);
        Assert.Equal(quoteLine.LineInternalRemarks, orderLine.LineInternalRemarks);
        Assert.Equal(quoteLine.LineCustomerFacingRemarks, orderLine.LineCustomerFacingRemarks);

        var converted = await service.GetQuoteAsync(released.Id);
        Assert.Equal("Converted", converted.CommercialStatus);
        Assert.NotNull(converted.ConvertedAt);
        Assert.Contains(auditTrail.Entries, entry => entry.ActionCode == "quote.release");
        Assert.Contains(auditTrail.Entries, entry => entry.ActionCode == "quote.convert.salesorder");

        await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.ConvertQuoteToSalesOrderAsync(released.Id, new QuoteConvertRequest("SO-2026-0002", new DateOnly(2026, 5, 16), null, null, null)));
    }

    [Fact]
    public async Task ReleasedQuote_ShouldBlockDirectCommercialMutationUntilReopenedWithReason()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedSalesPlanningSetupAsync(dbContext);
        var service = CreateService(dbContext, new TestAuditTrail());

        var quote = await service.CreateQuoteAsync(CreateQuoteRequest(seed, "Q-2026-0002"));
        var released = await service.ReleaseQuoteAsync(quote.Id);

        var blockedRequest = CreateQuoteRequest(seed, "Q-2026-0002") with
        {
            FreightAmount = 25m,
            Lines =
            [
                CreateQuoteLine(seed) with
                {
                    UnitPrice = 99m,
                    PriceSourceType = "ManualOverride",
                    OverrideReason = "Customer exception"
                }
            ]
        };

        await Assert.ThrowsAsync<ValidationFailureException>(() => service.UpdateQuoteAsync(released.Id, blockedRequest));
        await Assert.ThrowsAsync<ValidationFailureException>(() => service.ReopenQuoteAsync(released.Id, new QuoteReopenRequest("")));

        var reopened = await service.ReopenQuoteAsync(released.Id, new QuoteReopenRequest("Commercial terms changed before customer confirmation."));
        Assert.Equal("Draft", reopened.CommercialStatus);
        Assert.NotNull(reopened.ReopenedAt);

        var updated = await service.UpdateQuoteAsync(released.Id, blockedRequest);
        Assert.Equal(25m, updated.FreightAmount);
        Assert.Equal("ManualOverride", Assert.Single(updated.Lines).PriceSourceType);
    }

    [Fact]
    public async Task QuoteRevisionReferences_ShouldFailInsteadOfUsingLatestFallback()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedSalesPlanningSetupAsync(dbContext);
        var service = CreateService(dbContext, new TestAuditTrail());

        var request = CreateQuoteRequest(seed, "Q-2026-0003") with
        {
            Lines =
            [
                CreateQuoteLine(seed) with { ItemRevisionId = 999 }
            ]
        };

        var exception = await Assert.ThrowsAsync<ValidationFailureException>(() => service.CreateQuoteAsync(request));
        Assert.Contains(exception.Errors, error => error.Code == "validation.unsupported_revision");
    }

    [Fact]
    public async Task NewQuote_ShouldDefaultCommercialValuesFromCustomerProfileServerSide()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedSalesPlanningSetupAsync(dbContext);
        var defaulting = new TestCustomerCommercialDefaultsService(seed);
        var service = CreateService(dbContext, new TestAuditTrail(), defaulting);

        var request = CreateQuoteRequest(seed, "Q-DEFAULT-001") with
        {
            SalesOwnerUserId = null,
            SalesOwnerName = null,
            PaymentTermsId = null,
            PriceListId = null,
            DiscountSchemeId = null,
            TaxCategoryId = null,
            TaxTreatment = null,
            CurrencyId = null,
            TradeTermsId = null
        };

        var quote = await service.CreateQuoteAsync(request);

        Assert.Equal(77, quote.SalesOwnerUserId);
        Assert.Equal("Platform Admin", quote.SalesOwnerName);
        Assert.Equal(seed.PriceListId, quote.PriceListId);
        Assert.Equal(seed.DiscountSchemeId, quote.DiscountSchemeId);
        Assert.Equal(seed.TaxCategoryId, quote.TaxCategoryId);
        Assert.Equal(seed.CurrencyId, quote.CurrencyId);
        Assert.Equal("Taxable", quote.TaxTreatment);
        Assert.Equal(342.20m, quote.GrandTotalAmount);
    }

    [Fact]
    public async Task DirectSalesOrder_ShouldDefaultCommercialValuesFromCustomerProfileServerSide()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedSalesPlanningSetupAsync(dbContext);
        var defaulting = new TestCustomerCommercialDefaultsService(seed);
        var service = CreateService(dbContext, new TestAuditTrail(), defaulting);

        var order = await service.CreateSalesOrderAsync(new SalesOrderUpsertRequest(
            1,
            10,
            "SO-DEFAULT-001",
            seed.CustomerId,
            null,
            null,
            new DateOnly(2026, 5, 16),
            new DateOnly(2026, 5, 30),
            "Normal",
            "Draft",
            null,
            [new SalesOrderLineUpsertRequest(10, seed.ItemId, null, seed.UomId, 2m, "Make", new DateOnly(2026, 5, 30), "Normal", "Line spec", null, "Draft")],
            InternalRemarks: "SO internal note",
            CustomerFacingRemarks: "SO customer note",
            FreightAmount: 20m));

        Assert.Equal(77, order.SalesOwnerUserId);
        Assert.Equal(seed.PriceListId, order.PriceListId);
        Assert.Equal(seed.DiscountSchemeId, order.DiscountSchemeId);
        Assert.Equal(seed.TaxCategoryId, order.TaxCategoryId);
        Assert.Equal(seed.CurrencyId, order.CurrencyId);
        Assert.Equal(342.20m, order.GrandTotalAmount);
    }

    [Fact]
    public async Task DirectSalesOrder_ShouldNotMutateWhenCustomerDefaultsChangeLater()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedSalesPlanningSetupAsync(dbContext);
        var defaulting = new TestCustomerCommercialDefaultsService(seed);
        var service = CreateService(dbContext, new TestAuditTrail(), defaulting);

        var order = await service.CreateSalesOrderAsync(new SalesOrderUpsertRequest(
            1,
            10,
            "SO-DEFAULT-LOCK-001",
            seed.CustomerId,
            null,
            null,
            new DateOnly(2026, 5, 16),
            new DateOnly(2026, 5, 30),
            "Normal",
            "Draft",
            null,
            [new SalesOrderLineUpsertRequest(10, seed.ItemId, null, seed.UomId, 2m, "Make", new DateOnly(2026, 5, 30), "Normal", "Line spec", null, "Draft")]));

        defaulting.DefaultSalesOwnerUserId = 88;
        defaulting.DefaultSalesOwnerName = "Changed Owner";
        defaulting.DefaultPriceListId = 9876;

        var reloaded = await service.GetSalesOrderAsync(order.Id);

        Assert.Equal(order.SalesOwnerUserId, reloaded.SalesOwnerUserId);
        Assert.Equal(order.SalesOwnerName, reloaded.SalesOwnerName);
        Assert.Equal(order.PriceListId, reloaded.PriceListId);
        Assert.Equal(order.GrandTotalAmount, reloaded.GrandTotalAmount);
    }

    [Fact]
    public async Task MissingCustomerCommercialDefaults_ShouldNotCreateFakeFallbackValues()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedSalesPlanningSetupAsync(dbContext);
        var service = CreateService(dbContext, new TestAuditTrail(), new TestCustomerCommercialDefaultsService());

        var quote = await service.CreateQuoteAsync(CreateQuoteRequest(seed, "Q-NO-DEFAULT-001") with
        {
            SalesOwnerUserId = null,
            SalesOwnerName = null,
            PaymentTermsId = null,
            PriceListId = null,
            DiscountSchemeId = null,
            TaxCategoryId = null,
            TaxTreatment = null,
            CurrencyId = null,
            TradeTermsId = null
        });

        Assert.Null(quote.SalesOwnerUserId);
        Assert.Null(quote.SalesOwnerName);
        Assert.Null(quote.PaymentTermsId);
        Assert.Null(quote.PriceListId);
        Assert.Null(quote.DiscountSchemeId);
        Assert.Null(quote.TaxCategoryId);
        Assert.Null(quote.TaxTreatment);
        Assert.Null(quote.CurrencyId);
        Assert.Null(quote.TradeTermsId);
    }

    [Fact]
    public async Task QuoteConversion_ShouldNotRedefaultFromChangedCustomerProfile()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedSalesPlanningSetupAsync(dbContext);
        var defaulting = new TestCustomerCommercialDefaultsService(seed);
        var service = CreateService(dbContext, new TestAuditTrail(), defaulting);

        var quote = await service.CreateQuoteAsync(CreateQuoteRequest(seed, "Q-DEFAULT-002"));
        var released = await service.ReleaseQuoteAsync(quote.Id);
        defaulting.DefaultSalesOwnerUserId = 88;
        defaulting.DefaultSalesOwnerName = "Changed Owner";

        var order = await service.ConvertQuoteToSalesOrderAsync(released.Id, new QuoteConvertRequest("SO-DEFAULT-002", new DateOnly(2026, 5, 16), null, null, null));

        Assert.Equal(released.SalesOwnerUserId, order.SalesOwnerUserId);
        Assert.Equal(released.SalesOwnerName, order.SalesOwnerName);
        Assert.Equal(released.GrandTotalAmount, order.GrandTotalAmount);
    }

    private static SalesPlanningService CreateService(MfgDbContext dbContext, TestAuditTrail auditTrail, ICustomerCommercialDefaultsService? defaultsService = null)
    {
        var dataScope = new AllowAllDataScopeService();
        return new SalesPlanningService(
            dbContext,
            dataScope,
            new TestCurrentUserContextAccessor(),
            auditTrail,
            new CommercialCalculationService(dbContext, dataScope),
            defaultsService ?? new TestCustomerCommercialDefaultsService());
    }

    private static QuoteUpsertRequest CreateQuoteRequest(SeedIds seed, string quoteNo) =>
        new(
            1,
            10,
            quoteNo,
            seed.CustomerId,
            null,
            new DateOnly(2026, 5, 16),
            new DateOnly(2026, 6, 16),
            "Normal",
            "Draft",
            "Customer drawing package A",
            [CreateQuoteLine(seed)],
            SalesOwnerUserId: 77,
            SalesOwnerName: "Platform Admin",
            InternalRemarks: "Internal margin note",
            CustomerFacingRemarks: "Customer-visible quote note",
            PrintRemarks: "Print note",
            PaymentTermsId: 901,
            PriceListId: seed.PriceListId,
            DiscountSchemeId: seed.DiscountSchemeId,
            TaxCategoryId: seed.TaxCategoryId,
            TaxTreatment: "Taxable",
            CurrencyId: seed.CurrencyId,
            TradeTermsId: 902,
            FreightAmount: 20m,
            PackingAmount: 0m,
            InsuranceAmount: 0m,
            OtherChargesAmount: 0m,
            AddLessAmount: 0m,
            RoundOffAmount: 0m);

    private static QuoteLineUpsertRequest CreateQuoteLine(SeedIds seed) =>
        new(
            10,
            seed.ItemId,
            null,
            seed.UomId,
            2m,
            0m,
            0m,
            0m,
            "Make",
            new DateOnly(2026, 5, 30),
            "Normal",
            "Line spec",
            "Draft",
            LineInternalRemarks: "Line internal note",
            LineCustomerFacingRemarks: "Line print note");

    private static MfgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .ConfigureWarnings(builder => builder.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new MfgDbContext(options);
    }

    private static async Task<SeedIds> SeedSalesPlanningSetupAsync(MfgDbContext dbContext)
    {
        var customer = Customer.Create(1, "CUST-001", "Premier Customer", "Premier", "Dealer", 10, null, "GSTIN001", "NET30", 30, "Active", 77);
        dbContext.Customers.Add(customer);

        var uomClass = UomClass.Create("QTY", "Quantity", null, false, "Active", 77);
        dbContext.UomClasses.Add(uomClass);
        await dbContext.SaveChangesAsync();

        var uom = Uom.Create("PCS", "Pieces", "pcs", uomClass.Id, 0, true, "Active", 77);
        dbContext.Uoms.Add(uom);
        await dbContext.SaveChangesAsync();

        var item = Item.Create(
            1,
            "FG-001",
            "Finished Good",
            "FG",
            "Manufactured",
            100,
            200,
            uom.Id,
            null,
            uom.Id,
            null,
            null,
            "None",
            false,
            false,
            false,
            "Manual",
            "Make",
            null,
            null,
            5,
            "MRP",
            "Active",
            77);
        dbContext.Items.Add(item);
        await dbContext.SaveChangesAsync();

        var currency = Currency.Create(1, "INR", "Indian Rupee", "INR", 2, "RoundHalfUp", true, "Active", 77);
        var taxCategory = TaxCategory.Create(1, "GST", "GST taxable", "Domestic", 18m, false, "Active", 77);
        dbContext.Currencies.Add(currency);
        dbContext.TaxCategories.Add(taxCategory);
        await dbContext.SaveChangesAsync();

        dbContext.TaxCodes.Add(TaxCode.Create(taxCategory.Id, "GST18", "GST 18", 18m, new DateOnly(2026, 4, 1), null, "Active", 77));
        var priceList = PriceList.Create(1, "PL-STD", "Standard", currency.Id, "Customer", new DateOnly(2026, 1, 1), null, null, "Approved", "Active", 77);
        dbContext.PriceLists.Add(priceList);
        await dbContext.SaveChangesAsync();

        dbContext.PriceListLines.Add(PriceListLine.Create(priceList.Id, 10, item.Id, null, uom.Id, 1m, 150m, true, taxCategory.Id, new DateOnly(2026, 4, 1), null, "Active", 77));

        var discountScheme = DiscountScheme.Create(1, "DISC-STD", "Standard discount", "Line", currency.Id, new DateOnly(2026, 1, 1), null, false, "Approved", "Active", 77);
        dbContext.DiscountSchemes.Add(discountScheme);
        await dbContext.SaveChangesAsync();

        dbContext.DiscountRules.Add(DiscountRule.Create(discountScheme.Id, 10, "Customer line discount", "CustomerItem", customer.Id, null, item.Id, null, 1m, 10m, null, priceList.Id, "Active", 77));
        await dbContext.SaveChangesAsync();

        return new SeedIds(customer.Id, item.Id, uom.Id, currency.Id, taxCategory.Id, priceList.Id, discountScheme.Id);
    }

    private sealed record SeedIds(long CustomerId, long ItemId, long UomId, long CurrencyId, long TaxCategoryId, long PriceListId, long DiscountSchemeId);

    private sealed class TestCurrentUserContextAccessor : ICurrentUserContextAccessor
    {
        public CurrentUserContext GetCurrent() => GetRequired();

        public CurrentUserContext GetRequired() =>
            new(
                true,
                77,
                "platform.admin",
                "Platform Admin",
                "platform.admin@sts.local",
                "en-IN",
                "web",
                1,
                10,
                []);
    }

    private sealed class AllowAllDataScopeService : IDataScopeService
    {
        private static readonly DataScopeContext Scope = new(
            77,
            1,
            10,
            true,
            RecordVisibilityMode.AllInScope,
            [1],
            [10],
            [],
            [],
            [],
            []);

        public DataScopeContext GetCurrentScope() => Scope;

        public void EnsureContextAccess(long? companyId, long? branchId)
        {
        }

        public void EnsureWarehouseAccess(long? warehouseId)
        {
        }

        public void EnsureDepartmentAccess(long? departmentId)
        {
        }

        public void EnsureRecordAccess(long? ownerUserId)
        {
        }

        public IReadOnlyDictionary<string, object?> CreateStoredProcedureScope(long? warehouseId = null, long? departmentId = null, long? ownerUserId = null) =>
            new Dictionary<string, object?>();
    }

    private sealed class TestAuditTrail : IAuditTrail
    {
        public List<AuditEntryDraft> Entries { get; } = [];

        public Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default)
        {
            Entries.Add(entry);
            return Task.CompletedTask;
        }
    }

    private sealed class TestCustomerCommercialDefaultsService : ICustomerCommercialDefaultsService
    {
        public TestCustomerCommercialDefaultsService()
        {
        }

        public TestCustomerCommercialDefaultsService(SeedIds seed)
        {
            DefaultSalesOwnerUserId = 77;
            DefaultSalesOwnerName = "Platform Admin";
            DefaultPriceListId = seed.PriceListId;
            DefaultDiscountSchemeId = seed.DiscountSchemeId;
            DefaultPaymentTermsId = 901;
            DefaultTaxCategoryId = seed.TaxCategoryId;
            DefaultTaxTreatment = "Taxable";
            DefaultCurrencyId = seed.CurrencyId;
            DefaultTradeTermsId = 902;
        }

        public long? DefaultSalesOwnerUserId { get; set; }
        public string? DefaultSalesOwnerName { get; set; }
        public long? DefaultPriceListId { get; set; }
        public long? DefaultDiscountSchemeId { get; set; }
        public long? DefaultPaymentTermsId { get; set; }
        public long? DefaultTaxCategoryId { get; set; }
        public string? DefaultTaxTreatment { get; set; }
        public long? DefaultCurrencyId { get; set; }
        public long? DefaultTradeTermsId { get; set; }

        public Task<CustomerCommercialDefaultsDto> ResolveAsync(CustomerCommercialDefaultsRequest request, CancellationToken cancellationToken = default)
        {
            var result = new CustomerCommercialDefaultsDto(
                request.CustomerId,
                null,
                null,
                null,
                null,
                LongValue(request.SalesOwnerUserId, DefaultSalesOwnerUserId, request.SalesOwnerName ?? DefaultSalesOwnerName),
                LongValue(request.PriceListId, DefaultPriceListId, null),
                LongValue(request.DiscountSchemeId, DefaultDiscountSchemeId, null),
                LongValue(request.PaymentTermsId, DefaultPaymentTermsId, null),
                LongValue(request.TaxCategoryId, DefaultTaxCategoryId, null),
                StringValue(request.TaxTreatment, DefaultTaxTreatment),
                LongValue(request.CurrencyId, DefaultCurrencyId, null),
                LongValue(request.TradeTermsId, DefaultTradeTermsId, null),
                []);
            return Task.FromResult(result);
        }

        public Task<IReadOnlyCollection<SalesTerritoryDto>> ListSalesTerritoriesAsync(long companyId, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyCollection<SalesTerritoryDto>>(Array.Empty<SalesTerritoryDto>());

        public Task<IReadOnlyCollection<SalesTeamDto>> ListSalesTeamsAsync(long companyId, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyCollection<SalesTeamDto>>(Array.Empty<SalesTeamDto>());

        private static CommercialLongDefaultValue LongValue(long? explicitValue, long? defaultValue, string? display)
        {
            var value = explicitValue ?? defaultValue;
            var isOverride = explicitValue.HasValue;
            return new CommercialLongDefaultValue(value, display, isOverride ? "DocumentOverride" : value.HasValue ? "CustomerProfile" : "NotConfigured", !isOverride && value.HasValue, isOverride);
        }

        private static CommercialStringDefaultValue StringValue(string? explicitValue, string? defaultValue)
        {
            var value = explicitValue ?? defaultValue;
            var isOverride = !string.IsNullOrWhiteSpace(explicitValue);
            return new CommercialStringDefaultValue(value, value, isOverride ? "DocumentOverride" : !string.IsNullOrWhiteSpace(value) ? "CustomerProfile" : "NotConfigured", !isOverride && !string.IsNullOrWhiteSpace(value), isOverride);
        }
    }
}
