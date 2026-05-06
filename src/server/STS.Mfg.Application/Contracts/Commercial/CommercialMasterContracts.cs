using STS.Mfg.Application.Contracts.Masters;

namespace STS.Mfg.Application.Contracts.Commercial;

public sealed record CurrencyDto(
    long Id,
    long CompanyId,
    string CurrencyCode,
    string CurrencyName,
    string? Symbol,
    int DecimalPrecision,
    string RoundingMode,
    bool IsBaseCurrency,
    string Status);

public sealed record CurrencyUpsertRequest(
    long CompanyId,
    string CurrencyCode,
    string CurrencyName,
    string? Symbol,
    int DecimalPrecision,
    string RoundingMode,
    bool IsBaseCurrency,
    string Status);

public sealed record ExchangeRateSetupDto(
    long Id,
    long CompanyId,
    long CurrencyId,
    string CurrencyCode,
    string RateType,
    string RateSource,
    decimal? ManualRate,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record ExchangeRateSetupUpsertRequest(
    long CompanyId,
    long CurrencyId,
    string RateType,
    string RateSource,
    decimal? ManualRate,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record TaxCodeDto(
    long Id,
    long TaxCategoryId,
    string TaxCode,
    string TaxCodeName,
    decimal RatePercent,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record TaxCodeUpsertRequest(
    string TaxCode,
    string TaxCodeName,
    decimal RatePercent,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record TaxCategoryDto(
    long Id,
    long CompanyId,
    string TaxCategoryCode,
    string TaxCategoryName,
    string TaxScope,
    decimal DefaultRatePercent,
    bool IsRecoverable,
    string Status,
    IReadOnlyCollection<TaxCodeDto> TaxCodes);

public sealed record TaxCategoryUpsertRequest(
    long CompanyId,
    string TaxCategoryCode,
    string TaxCategoryName,
    string TaxScope,
    decimal DefaultRatePercent,
    bool IsRecoverable,
    string Status,
    IReadOnlyCollection<TaxCodeUpsertRequest> TaxCodes);

public sealed record PaymentTermDto(
    long Id,
    long CompanyId,
    string PaymentTermsCode,
    string PaymentTermsName,
    int NetDays,
    int? DiscountDays,
    decimal? DiscountPercent,
    string DueCalculationMode,
    string Status);

public sealed record PaymentTermUpsertRequest(
    long CompanyId,
    string PaymentTermsCode,
    string PaymentTermsName,
    int NetDays,
    int? DiscountDays,
    decimal? DiscountPercent,
    string DueCalculationMode,
    string Status);

public sealed record TradeTermDto(
    long Id,
    long CompanyId,
    string TradeTermsCode,
    string TradeTermsName,
    string TradeMode,
    string? ResponsibilitySummary,
    string Status);

public sealed record TradeTermUpsertRequest(
    long CompanyId,
    string TradeTermsCode,
    string TradeTermsName,
    string TradeMode,
    string? ResponsibilitySummary,
    string Status);

public sealed record PriceListLineDto(
    long Id,
    long PriceListId,
    int LineNo,
    long? ItemId,
    string? ItemCode,
    string? ItemName,
    long? ItemGroupId,
    string? ItemGroupName,
    long UomId,
    string UomCode,
    decimal MinQuantity,
    decimal UnitPrice,
    bool DiscountEligible,
    long? TaxCategoryId,
    string? TaxCategoryCode,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record PriceListLineUpsertRequest(
    int LineNo,
    long? ItemId,
    long? ItemGroupId,
    long UomId,
    decimal MinQuantity,
    decimal UnitPrice,
    bool DiscountEligible,
    long? TaxCategoryId,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record PriceAssignmentDto(
    long Id,
    long PriceListId,
    long? CustomerId,
    string? CustomerName,
    string? CustomerGroupCode,
    long? ItemGroupId,
    string? ItemGroupName,
    long? BranchId,
    string? BranchName,
    int PriorityRank,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record PriceAssignmentUpsertRequest(
    long? CustomerId,
    string? CustomerGroupCode,
    long? ItemGroupId,
    long? BranchId,
    int PriorityRank,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record PriceListDto(
    long Id,
    long CompanyId,
    string PriceListCode,
    string PriceListName,
    long CurrencyId,
    string CurrencyCode,
    string PriceListType,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string? CustomerSegment,
    string ApprovalStatus,
    string Status,
    IReadOnlyCollection<PriceListLineDto> Lines,
    IReadOnlyCollection<PriceAssignmentDto> Assignments);

public sealed record PriceListUpsertRequest(
    long CompanyId,
    string PriceListCode,
    string PriceListName,
    long CurrencyId,
    string PriceListType,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string? CustomerSegment,
    string ApprovalStatus,
    string Status,
    IReadOnlyCollection<PriceListLineUpsertRequest> Lines,
    IReadOnlyCollection<PriceAssignmentUpsertRequest> Assignments);

public sealed record DiscountRuleDto(
    long Id,
    long DiscountSchemeId,
    int RuleNo,
    string RuleName,
    string ApplicabilityType,
    long? CustomerId,
    string? CustomerName,
    string? CustomerGroupCode,
    long? ItemId,
    string? ItemCode,
    string? ItemName,
    long? ItemGroupId,
    string? ItemGroupName,
    decimal MinQuantity,
    decimal? DiscountPercent,
    decimal? DiscountAmount,
    long? PriceListId,
    string? PriceListCode,
    string Status);

public sealed record DiscountRuleUpsertRequest(
    int RuleNo,
    string RuleName,
    string ApplicabilityType,
    long? CustomerId,
    string? CustomerGroupCode,
    long? ItemId,
    long? ItemGroupId,
    decimal MinQuantity,
    decimal? DiscountPercent,
    decimal? DiscountAmount,
    long? PriceListId,
    string Status);

public sealed record DiscountSchemeDto(
    long Id,
    long CompanyId,
    string SchemeCode,
    string SchemeName,
    string DiscountType,
    long? CurrencyId,
    string? CurrencyCode,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    bool RequiresApproval,
    string ApprovalStatus,
    string Status,
    IReadOnlyCollection<DiscountRuleDto> Rules);

public sealed record DiscountSchemeUpsertRequest(
    long CompanyId,
    string SchemeCode,
    string SchemeName,
    string DiscountType,
    long? CurrencyId,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    bool RequiresApproval,
    string ApprovalStatus,
    string Status,
    IReadOnlyCollection<DiscountRuleUpsertRequest> Rules);

public interface ICommercialCompanyScopedRequest
{
    long CompanyId { get; }
}
