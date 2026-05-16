using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Commercial;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Commercial;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Commercial;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Commercial;

internal sealed class CommercialCalculationService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService)
    : ICommercialCalculationService
{
    public async Task<CommercialDocumentCalculationResult> CalculateAsync(
        CommercialDocumentCalculationRequest request,
        CancellationToken cancellationToken = default)
    {
        dataScopeService.EnsureContextAccess(request.CompanyId, request.BranchId);

        var priceList = await ResolvePriceListAsync(request, cancellationToken);
        var effectiveCurrencyId = request.CurrencyId ?? priceList?.CurrencyId;
        var exchangeRate = await ResolveExchangeRateAsync(request, effectiveCurrencyId, cancellationToken);
        var itemIds = request.Lines.Select(line => line.ItemId).Distinct().ToArray();
        var itemGroups = await dbContext.Items.AsNoTracking()
            .Where(item => item.CompanyId == request.CompanyId && itemIds.Contains(item.Id))
            .ToDictionaryAsync(item => item.Id, item => item.ItemGroupId, cancellationToken);

        var calculatedLines = new List<CommercialLineCalculationResult>();
        foreach (var line in request.Lines.OrderBy(line => line.LineNo))
        {
            if (line.Quantity <= 0)
            {
                throw Validation(nameof(line.Quantity), "Line quantity must be greater than zero.");
            }

            var priceLine = priceList is null
                ? null
                : await ResolvePriceListLineAsync(priceList.Id, request.DocumentDate, line, itemGroups, cancellationToken);

            var isManualOverride = string.Equals(line.PriceSourceType, "ManualOverride", StringComparison.OrdinalIgnoreCase);
            if (isManualOverride && string.IsNullOrWhiteSpace(line.OverrideReason))
            {
                throw Validation(nameof(line.OverrideReason), "Manual price, discount, or tax override requires a reason.");
            }

            if (priceList is not null && priceLine is null)
            {
                throw Validation(nameof(line.ItemId), "No effective price-list line was found for the requested item, UOM, quantity, and document date.");
            }

            var unitPrice = isManualOverride || priceLine is null
                ? line.UnitPrice
                : priceLine.UnitPrice;
            var priceSourceType = isManualOverride
                ? "ManualOverride"
                : priceLine is null ? "Manual" : "PriceList";

            var discount = await ResolveDiscountAsync(request, line, priceLine, itemGroups, isManualOverride, cancellationToken);
            var tax = await ResolveTaxAsync(request, line, priceLine, isManualOverride, cancellationToken);

            var subtotal = RoundMoney(line.Quantity * unitPrice);
            var discountAmount = discount.Amount > 0
                ? Math.Min(RoundMoney(discount.Amount), subtotal)
                : RoundMoney(subtotal * discount.Percent / 100m);
            var taxable = Math.Max(subtotal - discountAmount, 0m);
            var taxAmount = RoundMoney(tax.RatePercent > 0 ? taxable * tax.RatePercent / 100m : 0m);
            var total = taxable + taxAmount;

            calculatedLines.Add(new CommercialLineCalculationResult(
                line.LineNo,
                priceLine?.Id ?? line.PriceListLineId,
                priceSourceType,
                discount.SchemeId,
                discount.RuleId,
                unitPrice,
                discount.Percent,
                discountAmount,
                tax.TaxCodeId,
                tax.RatePercent,
                taxAmount,
                subtotal,
                taxable,
                total,
                isManualOverride,
                string.IsNullOrWhiteSpace(line.OverrideReason) ? null : line.OverrideReason.Trim()));
        }

        var subtotalAmount = calculatedLines.Sum(line => line.LineSubtotal);
        var discountTotal = calculatedLines.Sum(line => line.DiscountAmount);
        var lineTaxable = calculatedLines.Sum(line => line.LineTaxableAmount);
        var lineTax = calculatedLines.Sum(line => line.TaxAmount);
        var taxableCharges = request.Charges.FreightAmount +
                             request.Charges.PackingAmount +
                             request.Charges.InsuranceAmount +
                             request.Charges.OtherChargesAmount;
        var chargeTaxRate = await ResolveChargeTaxRateAsync(request, cancellationToken);
        var chargeTax = RoundMoney(taxableCharges > 0 && chargeTaxRate > 0 ? taxableCharges * chargeTaxRate / 100m : 0m);
        var taxableAmount = lineTaxable + taxableCharges;
        var taxTotal = lineTax + chargeTax;
        var grandTotal = RoundMoney(
            taxableAmount +
            taxTotal +
            request.Charges.AddLessAmount +
            request.Charges.RoundOffAmount);

        return new CommercialDocumentCalculationResult(
            effectiveCurrencyId,
            exchangeRate?.Id ?? request.ExchangeRateId,
            exchangeRate?.ManualRate ?? request.ExchangeRateSnapshot,
            subtotalAmount,
            discountTotal,
            taxableAmount,
            taxTotal,
            grandTotal,
            calculatedLines);
    }

    private async Task<PriceList?> ResolvePriceListAsync(CommercialDocumentCalculationRequest request, CancellationToken cancellationToken)
    {
        if (request.PriceListId.HasValue && request.PriceListId.Value > 0)
        {
            var selected = await dbContext.PriceLists.AsNoTracking()
                .FirstOrDefaultAsync(record => record.Id == request.PriceListId.Value, cancellationToken);
            if (selected is null || selected.CompanyId != request.CompanyId || !IsActive(selected.Status) || !IsEffective(selected.EffectiveFrom, selected.EffectiveTo, request.DocumentDate))
            {
                throw Validation(nameof(request.PriceListId), "Selected price list is not active for the document date.");
            }

            return selected;
        }

        var assignments =
            from assignment in dbContext.PriceAssignments.AsNoTracking()
            join list in dbContext.PriceLists.AsNoTracking() on assignment.PriceListId equals list.Id
            where list.CompanyId == request.CompanyId &&
                  (assignment.Status == "Active" || assignment.Status == "Approved" || assignment.Status == "Released") &&
                  (list.Status == "Active" || list.Status == "Approved" || list.Status == "Released") &&
                  assignment.EffectiveFrom <= request.DocumentDate &&
                  (!assignment.EffectiveTo.HasValue || assignment.EffectiveTo.Value >= request.DocumentDate) &&
                  list.EffectiveFrom <= request.DocumentDate &&
                  (!list.EffectiveTo.HasValue || list.EffectiveTo.Value >= request.DocumentDate) &&
                  (!assignment.CustomerId.HasValue || assignment.CustomerId == request.CustomerId) &&
                  (!assignment.BranchId.HasValue || assignment.BranchId == request.BranchId)
            orderby assignment.PriorityRank, list.EffectiveFrom descending
            select list;

        return await assignments.FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<PriceListLine?> ResolvePriceListLineAsync(
        long priceListId,
        DateOnly documentDate,
        CommercialLineCalculationRequest line,
        IReadOnlyDictionary<long, long> itemGroups,
        CancellationToken cancellationToken)
    {
        itemGroups.TryGetValue(line.ItemId, out var itemGroupId);
        var query = dbContext.PriceListLines.AsNoTracking()
            .Where(record =>
                record.PriceListId == priceListId &&
                record.UomId == line.UomId &&
                record.MinQuantity <= line.Quantity &&
                (record.Status == "Active" || record.Status == "Approved" || record.Status == "Released") &&
                record.EffectiveFrom <= documentDate &&
                (!record.EffectiveTo.HasValue || record.EffectiveTo.Value >= documentDate) &&
                ((record.ItemId.HasValue && record.ItemId == line.ItemId) ||
                 (!record.ItemId.HasValue && record.ItemGroupId.HasValue && record.ItemGroupId == itemGroupId) ||
                 (!record.ItemId.HasValue && !record.ItemGroupId.HasValue)));

        return await query
            .OrderByDescending(record => record.ItemId == line.ItemId)
            .ThenByDescending(record => record.ItemGroupId == itemGroupId)
            .ThenByDescending(record => record.MinQuantity)
            .ThenByDescending(record => record.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<DiscountResolution> ResolveDiscountAsync(
        CommercialDocumentCalculationRequest request,
        CommercialLineCalculationRequest line,
        PriceListLine? priceLine,
        IReadOnlyDictionary<long, long> itemGroups,
        bool isManualOverride,
        CancellationToken cancellationToken)
    {
        var schemeId = line.DiscountSchemeId ?? request.DiscountSchemeId;
        if (!schemeId.HasValue || schemeId.Value <= 0)
        {
            return new DiscountResolution(null, null, line.DiscountPercent, line.DiscountAmount);
        }

        var scheme = await dbContext.DiscountSchemes.AsNoTracking()
            .FirstOrDefaultAsync(record => record.Id == schemeId.Value, cancellationToken);
        if (scheme is null || scheme.CompanyId != request.CompanyId || !IsActive(scheme.Status) || !IsEffective(scheme.EffectiveFrom, scheme.EffectiveTo, request.DocumentDate))
        {
            throw Validation(nameof(request.DiscountSchemeId), "Selected discount scheme is not active for the document date.");
        }

        if (isManualOverride)
        {
            return new DiscountResolution(scheme.Id, line.DiscountRuleId, line.DiscountPercent, line.DiscountAmount);
        }

        itemGroups.TryGetValue(line.ItemId, out var itemGroupId);
        var resolvedPriceListId = priceLine?.PriceListId ?? request.PriceListId;
        var rule = await dbContext.DiscountRules.AsNoTracking()
            .Where(record =>
                record.DiscountSchemeId == scheme.Id &&
                (record.Status == "Active" || record.Status == "Approved" || record.Status == "Released") &&
                record.MinQuantity <= line.Quantity &&
                (!record.CustomerId.HasValue || record.CustomerId == request.CustomerId) &&
                (!record.ItemId.HasValue || record.ItemId == line.ItemId) &&
                (!record.ItemGroupId.HasValue || record.ItemGroupId == itemGroupId) &&
                (!record.PriceListId.HasValue || record.PriceListId == resolvedPriceListId))
            .OrderByDescending(record => record.ItemId == line.ItemId)
            .ThenByDescending(record => record.ItemGroupId == itemGroupId)
            .ThenByDescending(record => record.CustomerId == request.CustomerId)
            .ThenByDescending(record => record.MinQuantity)
            .FirstOrDefaultAsync(cancellationToken);

        return rule is null
            ? new DiscountResolution(scheme.Id, null, 0m, 0m)
            : new DiscountResolution(scheme.Id, rule.Id, rule.DiscountPercent ?? 0m, rule.DiscountAmount ?? 0m);
    }

    private async Task<TaxResolution> ResolveTaxAsync(
        CommercialDocumentCalculationRequest request,
        CommercialLineCalculationRequest line,
        PriceListLine? priceLine,
        bool isManualOverride,
        CancellationToken cancellationToken)
    {
        if (IsTaxExempt(request.TaxTreatment))
        {
            return new TaxResolution(null, 0m);
        }

        if (isManualOverride && line.TaxRateSnapshot.HasValue)
        {
            return new TaxResolution(line.TaxCodeId, line.TaxRateSnapshot.Value);
        }

        if (line.TaxCodeId.HasValue && line.TaxCodeId.Value > 0)
        {
            var selected = await dbContext.TaxCodes.AsNoTracking()
                .FirstOrDefaultAsync(record => record.Id == line.TaxCodeId.Value, cancellationToken);
            if (selected is null || !IsActive(selected.Status) || !IsEffective(selected.EffectiveFrom, selected.EffectiveTo, request.DocumentDate))
            {
                throw Validation(nameof(line.TaxCodeId), "Selected tax code is not active for the document date.");
            }

            return new TaxResolution(selected.Id, selected.RatePercent);
        }

        var taxCategoryId = priceLine?.TaxCategoryId ?? request.TaxCategoryId;
        if (!taxCategoryId.HasValue || taxCategoryId.Value <= 0)
        {
            return new TaxResolution(null, 0m);
        }

        var taxCode = await dbContext.TaxCodes.AsNoTracking()
            .Where(record =>
                record.TaxCategoryId == taxCategoryId.Value &&
                (record.Status == "Active" || record.Status == "Approved" || record.Status == "Released") &&
                record.EffectiveFrom <= request.DocumentDate &&
                (!record.EffectiveTo.HasValue || record.EffectiveTo.Value >= request.DocumentDate))
            .OrderByDescending(record => record.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        if (taxCode is not null)
        {
            return new TaxResolution(taxCode.Id, taxCode.RatePercent);
        }

        var taxCategory = await dbContext.TaxCategories.AsNoTracking()
            .FirstOrDefaultAsync(record => record.Id == taxCategoryId.Value, cancellationToken);
        return taxCategory is null || !IsActive(taxCategory.Status)
            ? new TaxResolution(null, 0m)
            : new TaxResolution(null, taxCategory.DefaultRatePercent);
    }

    private async Task<decimal> ResolveChargeTaxRateAsync(CommercialDocumentCalculationRequest request, CancellationToken cancellationToken)
    {
        if (IsTaxExempt(request.TaxTreatment) || !request.TaxCategoryId.HasValue)
        {
            return 0m;
        }

        var tax = await ResolveTaxAsync(
            request,
            new CommercialLineCalculationRequest(0, 0, null, 0, 0, 0, null, null, null, null, 0, 0, null, null, null),
            null,
            false,
            cancellationToken);
        return tax.RatePercent;
    }

    private async Task<ExchangeRateSetup?> ResolveExchangeRateAsync(CommercialDocumentCalculationRequest request, long? currencyId, CancellationToken cancellationToken)
    {
        if (request.ExchangeRateId.HasValue && request.ExchangeRateId.Value > 0)
        {
            var selected = await dbContext.ExchangeRateSetups.AsNoTracking()
                .FirstOrDefaultAsync(record => record.Id == request.ExchangeRateId.Value, cancellationToken);
            if (selected is null || selected.CompanyId != request.CompanyId || !IsActive(selected.Status) || !IsEffective(selected.EffectiveFrom, selected.EffectiveTo, request.DocumentDate))
            {
                throw Validation(nameof(request.ExchangeRateId), "Selected exchange rate is not active for the document date.");
            }

            return selected;
        }

        if (!currencyId.HasValue || currencyId.Value <= 0)
        {
            return null;
        }

        return await dbContext.ExchangeRateSetups.AsNoTracking()
            .Where(record =>
                record.CompanyId == request.CompanyId &&
                record.CurrencyId == currencyId.Value &&
                (record.Status == "Active" || record.Status == "Approved" || record.Status == "Released") &&
                record.EffectiveFrom <= request.DocumentDate &&
                (!record.EffectiveTo.HasValue || record.EffectiveTo.Value >= request.DocumentDate))
            .OrderByDescending(record => record.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static bool IsActive(string status) =>
        status.Equals("Active", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Approved", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Released", StringComparison.OrdinalIgnoreCase);

    private static bool IsEffective(DateOnly effectiveFrom, DateOnly? effectiveTo, DateOnly documentDate) =>
        effectiveFrom <= documentDate && (!effectiveTo.HasValue || effectiveTo.Value >= documentDate);

    private static bool IsTaxExempt(string? taxTreatment) =>
        !string.IsNullOrWhiteSpace(taxTreatment) &&
        (taxTreatment.Equals("Exempt", StringComparison.OrdinalIgnoreCase) ||
         taxTreatment.Equals("OutOfScope", StringComparison.OrdinalIgnoreCase) ||
         taxTreatment.Equals("ZeroRated", StringComparison.OrdinalIgnoreCase));

    private static decimal RoundMoney(decimal value) =>
        decimal.Round(value, 2, MidpointRounding.AwayFromZero);

    private static ValidationFailureException Validation(string field, string message) =>
        new([new ApiError("validation.commercial_calculation", field, message)]);

    private sealed record DiscountResolution(long? SchemeId, long? RuleId, decimal Percent, decimal Amount);

    private sealed record TaxResolution(long? TaxCodeId, decimal RatePercent);
}
