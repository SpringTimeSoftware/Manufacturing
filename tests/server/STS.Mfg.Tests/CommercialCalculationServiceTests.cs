using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts.Commercial;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Commercial;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Infrastructure.Commercial;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Tests;

public sealed class CommercialCalculationServiceTests
{
    [Fact]
    public async Task CalculateAsync_UsesDocumentDateForPriceDiscountTaxAndChargeTax()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedCommercialSetupAsync(dbContext);
        var service = new CommercialCalculationService(dbContext, new AllowAllDataScopeService());

        var result = await service.CalculateAsync(new CommercialDocumentCalculationRequest(
            CompanyId: 1,
            BranchId: 10,
            CustomerId: 501,
            DocumentDate: new DateOnly(2026, 5, 16),
            PriceListId: seed.PriceListId,
            DiscountSchemeId: seed.DiscountSchemeId,
            TaxCategoryId: seed.TaxCategoryId,
            TaxTreatment: "Taxable",
            CurrencyId: seed.CurrencyId,
            ExchangeRateId: null,
            ExchangeRateSnapshot: null,
            Charges: new CommercialChargeInput(100m, 0m, 0m, 0m, 0m, 0m),
            Lines:
            [
                new CommercialLineCalculationRequest(
                    LineNo: 10,
                    ItemId: 301,
                    ItemVariantId: null,
                    UomId: 41,
                    Quantity: 2m,
                    UnitPrice: 0m,
                    PriceSourceType: null,
                    PriceListLineId: null,
                    DiscountSchemeId: null,
                    DiscountRuleId: null,
                    DiscountPercent: 0m,
                    DiscountAmount: 0m,
                    TaxCodeId: null,
                    TaxRateSnapshot: null,
                    OverrideReason: null)
            ]));

        var line = Assert.Single(result.Lines);
        Assert.Equal(150m, line.UnitPrice);
        Assert.Equal(10m, line.DiscountPercent);
        Assert.Equal(30m, line.DiscountAmount);
        Assert.Equal(18m, line.TaxRateSnapshot);
        Assert.Equal(48.60m, line.TaxAmount);
        Assert.Equal(370m, result.TaxableAmount);
        Assert.Equal(66.60m, result.TaxTotalAmount);
        Assert.Equal(436.60m, result.GrandTotalAmount);
    }

    [Fact]
    public async Task CalculateAsync_UsesOlderEffectiveRowsForOlderDocumentDate()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedCommercialSetupAsync(dbContext);
        var service = new CommercialCalculationService(dbContext, new AllowAllDataScopeService());

        var result = await service.CalculateAsync(new CommercialDocumentCalculationRequest(
            1,
            10,
            501,
            new DateOnly(2026, 2, 15),
            seed.PriceListId,
            seed.DiscountSchemeId,
            seed.TaxCategoryId,
            "Taxable",
            seed.CurrencyId,
            null,
            null,
            new CommercialChargeInput(0m, 0m, 0m, 0m, 0m, 0m),
            [
                new CommercialLineCalculationRequest(10, 301, null, 41, 1m, 0m, null, null, null, null, 0m, 0m, null, null, null)
            ]));

        var line = Assert.Single(result.Lines);
        Assert.Equal(100m, line.UnitPrice);
        Assert.Equal(12m, line.TaxRateSnapshot);
        Assert.Equal(100.80m, result.GrandTotalAmount);
    }

    [Fact]
    public async Task CalculateAsync_RequiresReasonForManualOverride()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedCommercialSetupAsync(dbContext);
        var service = new CommercialCalculationService(dbContext, new AllowAllDataScopeService());

        var request = new CommercialDocumentCalculationRequest(
            1,
            10,
            501,
            new DateOnly(2026, 5, 16),
            seed.PriceListId,
            seed.DiscountSchemeId,
            seed.TaxCategoryId,
            "Taxable",
            seed.CurrencyId,
            null,
            null,
            new CommercialChargeInput(0m, 0m, 0m, 0m, 0m, 0m),
            [
                new CommercialLineCalculationRequest(10, 301, null, 41, 1m, 123m, "ManualOverride", null, null, null, 0m, 0m, null, 5m, null)
            ]);

        await Assert.ThrowsAsync<ValidationFailureException>(() => service.CalculateAsync(request));
    }

    [Fact]
    public async Task CalculateAsync_PreservesManualOverrideWhenReasonIsPresent()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedCommercialSetupAsync(dbContext);
        var service = new CommercialCalculationService(dbContext, new AllowAllDataScopeService());

        var result = await service.CalculateAsync(new CommercialDocumentCalculationRequest(
            1,
            10,
            501,
            new DateOnly(2026, 5, 16),
            seed.PriceListId,
            seed.DiscountSchemeId,
            seed.TaxCategoryId,
            "Taxable",
            seed.CurrencyId,
            null,
            null,
            new CommercialChargeInput(0m, 0m, 0m, 0m, 0m, 0m),
            [
                new CommercialLineCalculationRequest(10, 301, null, 41, 1m, 123m, "ManualOverride", null, null, null, 7m, 0m, null, 5m, "Approved customer exception")
            ]));

        var line = Assert.Single(result.Lines);
        Assert.Equal("ManualOverride", line.PriceSourceType);
        Assert.Equal(123m, line.UnitPrice);
        Assert.Equal(7m, line.DiscountPercent);
        Assert.Equal(5m, line.TaxRateSnapshot);
        Assert.Equal("Approved customer exception", line.OverrideReason);
    }

    private static MfgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new MfgDbContext(options);
    }

    private static async Task<SeedIds> SeedCommercialSetupAsync(MfgDbContext dbContext)
    {
        var currency = Currency.Create(1, "INR", "Indian Rupee", "INR", 2, "RoundHalfUp", true, "Active", 77);
        var taxCategory = TaxCategory.Create(1, "GST", "GST taxable", "Domestic", 18m, false, "Active", 77);
        dbContext.Currencies.Add(currency);
        dbContext.TaxCategories.Add(taxCategory);
        await dbContext.SaveChangesAsync();

        dbContext.ExchangeRateSetups.Add(ExchangeRateSetup.Create(1, currency.Id, "Manual", "Finance table", 1m, new DateOnly(2026, 1, 1), null, "Active", 77));
        dbContext.TaxCodes.Add(TaxCode.Create(taxCategory.Id, "GST12", "GST 12", 12m, new DateOnly(2026, 1, 1), new DateOnly(2026, 3, 31), "Active", 77));
        dbContext.TaxCodes.Add(TaxCode.Create(taxCategory.Id, "GST18", "GST 18", 18m, new DateOnly(2026, 4, 1), null, "Active", 77));

        var priceList = PriceList.Create(1, "PL-STD", "Standard", currency.Id, "Customer", new DateOnly(2026, 1, 1), null, null, "Approved", "Active", 77);
        dbContext.PriceLists.Add(priceList);
        await dbContext.SaveChangesAsync();

        dbContext.PriceListLines.Add(PriceListLine.Create(priceList.Id, 10, 301, null, 41, 1m, 100m, true, taxCategory.Id, new DateOnly(2026, 1, 1), new DateOnly(2026, 3, 31), "Active", 77));
        dbContext.PriceListLines.Add(PriceListLine.Create(priceList.Id, 20, 301, null, 41, 1m, 150m, true, taxCategory.Id, new DateOnly(2026, 4, 1), null, "Active", 77));

        var discountScheme = DiscountScheme.Create(1, "DISC-STD", "Standard discount", "Line", currency.Id, new DateOnly(2026, 1, 1), null, false, "Approved", "Active", 77);
        dbContext.DiscountSchemes.Add(discountScheme);
        await dbContext.SaveChangesAsync();

        dbContext.DiscountRules.Add(DiscountRule.Create(discountScheme.Id, 10, "Customer line discount", "CustomerItem", 501, null, 301, null, 1m, 10m, null, priceList.Id, "Active", 77));
        await dbContext.SaveChangesAsync();

        return new SeedIds(currency.Id, taxCategory.Id, priceList.Id, discountScheme.Id);
    }

    private sealed record SeedIds(long CurrencyId, long TaxCategoryId, long PriceListId, long DiscountSchemeId);

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
}
