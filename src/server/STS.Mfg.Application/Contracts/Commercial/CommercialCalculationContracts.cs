namespace STS.Mfg.Application.Contracts.Commercial;

public sealed record CommercialChargeInput(
    decimal FreightAmount,
    decimal PackingAmount,
    decimal InsuranceAmount,
    decimal OtherChargesAmount,
    decimal AddLessAmount,
    decimal RoundOffAmount);

public sealed record CommercialLineCalculationRequest(
    int LineNo,
    long ItemId,
    long? ItemVariantId,
    long UomId,
    decimal Quantity,
    decimal UnitPrice,
    string? PriceSourceType,
    long? PriceListLineId,
    long? DiscountSchemeId,
    long? DiscountRuleId,
    decimal DiscountPercent,
    decimal DiscountAmount,
    long? TaxCodeId,
    decimal? TaxRateSnapshot,
    string? OverrideReason);

public sealed record CommercialDocumentCalculationRequest(
    long CompanyId,
    long BranchId,
    long CustomerId,
    DateOnly DocumentDate,
    long? PriceListId,
    long? DiscountSchemeId,
    long? TaxCategoryId,
    string? TaxTreatment,
    long? CurrencyId,
    long? ExchangeRateId,
    decimal? ExchangeRateSnapshot,
    CommercialChargeInput Charges,
    IReadOnlyCollection<CommercialLineCalculationRequest> Lines);

public sealed record CommercialLineCalculationResult(
    int LineNo,
    long? PriceListLineId,
    string PriceSourceType,
    long? DiscountSchemeId,
    long? DiscountRuleId,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal DiscountAmount,
    long? TaxCodeId,
    decimal TaxRateSnapshot,
    decimal TaxAmount,
    decimal LineSubtotal,
    decimal LineTaxableAmount,
    decimal LineTotalAmount,
    bool OverrideApplied,
    string? OverrideReason);

public sealed record CommercialDocumentCalculationResult(
    long? CurrencyId,
    long? ExchangeRateId,
    decimal? ExchangeRateSnapshot,
    decimal SubtotalAmount,
    decimal DiscountTotalAmount,
    decimal TaxableAmount,
    decimal TaxTotalAmount,
    decimal GrandTotalAmount,
    IReadOnlyCollection<CommercialLineCalculationResult> Lines);
