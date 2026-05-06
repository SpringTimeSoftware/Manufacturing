using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Commercial;

public sealed class Currency : AuditableEntity, ICompanyScoped
{
    private Currency()
    {
    }

    public long? CompanyId { get; private set; }
    public string CurrencyCode { get; private set; } = string.Empty;
    public string CurrencyName { get; private set; } = string.Empty;
    public string? Symbol { get; private set; }
    public int DecimalPrecision { get; private set; }
    public string RoundingMode { get; private set; } = string.Empty;
    public bool IsBaseCurrency { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Currency Create(long companyId, string currencyCode, string currencyName, string? symbol, int decimalPrecision, string roundingMode, bool isBaseCurrency, string status, long? userId)
    {
        var entity = new Currency { CompanyId = companyId };
        entity.Update(currencyCode, currencyName, symbol, decimalPrecision, roundingMode, isBaseCurrency, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string currencyCode, string currencyName, string? symbol, int decimalPrecision, string roundingMode, bool isBaseCurrency, string status, long? userId)
    {
        CurrencyCode = currencyCode.Trim().ToUpperInvariant();
        CurrencyName = currencyName.Trim();
        Symbol = string.IsNullOrWhiteSpace(symbol) ? null : symbol.Trim();
        DecimalPrecision = decimalPrecision;
        RoundingMode = roundingMode.Trim();
        IsBaseCurrency = isBaseCurrency;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ExchangeRateSetup : AuditableEntity, ICompanyScoped
{
    private ExchangeRateSetup()
    {
    }

    public long? CompanyId { get; private set; }
    public long CurrencyId { get; private set; }
    public string RateType { get; private set; } = string.Empty;
    public string RateSource { get; private set; } = string.Empty;
    public decimal? ManualRate { get; private set; }
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ExchangeRateSetup Create(long companyId, long currencyId, string rateType, string rateSource, decimal? manualRate, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        var entity = new ExchangeRateSetup { CompanyId = companyId, CurrencyId = currencyId };
        entity.Update(rateType, rateSource, manualRate, effectiveFrom, effectiveTo, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string rateType, string rateSource, decimal? manualRate, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        RateType = rateType.Trim();
        RateSource = rateSource.Trim();
        ManualRate = manualRate;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class TaxCategory : AuditableEntity, ICompanyScoped
{
    private TaxCategory()
    {
    }

    public long? CompanyId { get; private set; }
    public string TaxCategoryCode { get; private set; } = string.Empty;
    public string TaxCategoryName { get; private set; } = string.Empty;
    public string TaxScope { get; private set; } = string.Empty;
    public decimal DefaultRatePercent { get; private set; }
    public bool IsRecoverable { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static TaxCategory Create(long companyId, string taxCategoryCode, string taxCategoryName, string taxScope, decimal defaultRatePercent, bool isRecoverable, string status, long? userId)
    {
        var entity = new TaxCategory { CompanyId = companyId };
        entity.Update(taxCategoryCode, taxCategoryName, taxScope, defaultRatePercent, isRecoverable, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string taxCategoryCode, string taxCategoryName, string taxScope, decimal defaultRatePercent, bool isRecoverable, string status, long? userId)
    {
        TaxCategoryCode = taxCategoryCode.Trim().ToUpperInvariant();
        TaxCategoryName = taxCategoryName.Trim();
        TaxScope = taxScope.Trim();
        DefaultRatePercent = defaultRatePercent;
        IsRecoverable = isRecoverable;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class TaxCode : AuditableEntity
{
    private TaxCode()
    {
    }

    public long TaxCategoryId { get; private set; }
    public string TaxCodeValue { get; private set; } = string.Empty;
    public string TaxCodeName { get; private set; } = string.Empty;
    public decimal RatePercent { get; private set; }
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static TaxCode Create(long taxCategoryId, string taxCodeValue, string taxCodeName, decimal ratePercent, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        var entity = new TaxCode { TaxCategoryId = taxCategoryId };
        entity.Update(taxCodeValue, taxCodeName, ratePercent, effectiveFrom, effectiveTo, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string taxCodeValue, string taxCodeName, decimal ratePercent, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        TaxCodeValue = taxCodeValue.Trim().ToUpperInvariant();
        TaxCodeName = taxCodeName.Trim();
        RatePercent = ratePercent;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PaymentTerm : AuditableEntity, ICompanyScoped
{
    private PaymentTerm()
    {
    }

    public long? CompanyId { get; private set; }
    public string PaymentTermsCode { get; private set; } = string.Empty;
    public string PaymentTermsName { get; private set; } = string.Empty;
    public int NetDays { get; private set; }
    public int? DiscountDays { get; private set; }
    public decimal? DiscountPercent { get; private set; }
    public string DueCalculationMode { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static PaymentTerm Create(long companyId, string paymentTermsCode, string paymentTermsName, int netDays, int? discountDays, decimal? discountPercent, string dueCalculationMode, string status, long? userId)
    {
        var entity = new PaymentTerm { CompanyId = companyId };
        entity.Update(paymentTermsCode, paymentTermsName, netDays, discountDays, discountPercent, dueCalculationMode, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string paymentTermsCode, string paymentTermsName, int netDays, int? discountDays, decimal? discountPercent, string dueCalculationMode, string status, long? userId)
    {
        PaymentTermsCode = paymentTermsCode.Trim().ToUpperInvariant();
        PaymentTermsName = paymentTermsName.Trim();
        NetDays = netDays;
        DiscountDays = discountDays;
        DiscountPercent = discountPercent;
        DueCalculationMode = dueCalculationMode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class TradeTerm : AuditableEntity, ICompanyScoped
{
    private TradeTerm()
    {
    }

    public long? CompanyId { get; private set; }
    public string TradeTermsCode { get; private set; } = string.Empty;
    public string TradeTermsName { get; private set; } = string.Empty;
    public string TradeMode { get; private set; } = string.Empty;
    public string? ResponsibilitySummary { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static TradeTerm Create(long companyId, string tradeTermsCode, string tradeTermsName, string tradeMode, string? responsibilitySummary, string status, long? userId)
    {
        var entity = new TradeTerm { CompanyId = companyId };
        entity.Update(tradeTermsCode, tradeTermsName, tradeMode, responsibilitySummary, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string tradeTermsCode, string tradeTermsName, string tradeMode, string? responsibilitySummary, string status, long? userId)
    {
        TradeTermsCode = tradeTermsCode.Trim().ToUpperInvariant();
        TradeTermsName = tradeTermsName.Trim();
        TradeMode = tradeMode.Trim();
        ResponsibilitySummary = string.IsNullOrWhiteSpace(responsibilitySummary) ? null : responsibilitySummary.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PriceList : AuditableEntity, ICompanyScoped
{
    private PriceList()
    {
    }

    public long? CompanyId { get; private set; }
    public string PriceListCode { get; private set; } = string.Empty;
    public string PriceListName { get; private set; } = string.Empty;
    public long CurrencyId { get; private set; }
    public string PriceListType { get; private set; } = string.Empty;
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string? CustomerSegment { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static PriceList Create(long companyId, string priceListCode, string priceListName, long currencyId, string priceListType, DateOnly effectiveFrom, DateOnly? effectiveTo, string? customerSegment, string approvalStatus, string status, long? userId)
    {
        var entity = new PriceList { CompanyId = companyId };
        entity.Update(priceListCode, priceListName, currencyId, priceListType, effectiveFrom, effectiveTo, customerSegment, approvalStatus, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string priceListCode, string priceListName, long currencyId, string priceListType, DateOnly effectiveFrom, DateOnly? effectiveTo, string? customerSegment, string approvalStatus, string status, long? userId)
    {
        PriceListCode = priceListCode.Trim().ToUpperInvariant();
        PriceListName = priceListName.Trim();
        CurrencyId = currencyId;
        PriceListType = priceListType.Trim();
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        CustomerSegment = string.IsNullOrWhiteSpace(customerSegment) ? null : customerSegment.Trim();
        ApprovalStatus = approvalStatus.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PriceListLine : AuditableEntity
{
    private PriceListLine()
    {
    }

    public long PriceListId { get; private set; }
    public int LineNo { get; private set; }
    public long? ItemId { get; private set; }
    public long? ItemGroupId { get; private set; }
    public long UomId { get; private set; }
    public decimal MinQuantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public bool DiscountEligible { get; private set; }
    public long? TaxCategoryId { get; private set; }
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static PriceListLine Create(long priceListId, int lineNo, long? itemId, long? itemGroupId, long uomId, decimal minQuantity, decimal unitPrice, bool discountEligible, long? taxCategoryId, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        var entity = new PriceListLine { PriceListId = priceListId };
        entity.Update(lineNo, itemId, itemGroupId, uomId, minQuantity, unitPrice, discountEligible, taxCategoryId, effectiveFrom, effectiveTo, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(int lineNo, long? itemId, long? itemGroupId, long uomId, decimal minQuantity, decimal unitPrice, bool discountEligible, long? taxCategoryId, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        LineNo = lineNo;
        ItemId = itemId;
        ItemGroupId = itemGroupId;
        UomId = uomId;
        MinQuantity = minQuantity;
        UnitPrice = unitPrice;
        DiscountEligible = discountEligible;
        TaxCategoryId = taxCategoryId;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PriceAssignment : AuditableEntity
{
    private PriceAssignment()
    {
    }

    public long PriceListId { get; private set; }
    public long? CustomerId { get; private set; }
    public string? CustomerGroupCode { get; private set; }
    public long? ItemGroupId { get; private set; }
    public long? BranchId { get; private set; }
    public int PriorityRank { get; private set; }
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static PriceAssignment Create(long priceListId, long? customerId, string? customerGroupCode, long? itemGroupId, long? branchId, int priorityRank, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        var entity = new PriceAssignment { PriceListId = priceListId };
        entity.Update(customerId, customerGroupCode, itemGroupId, branchId, priorityRank, effectiveFrom, effectiveTo, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(long? customerId, string? customerGroupCode, long? itemGroupId, long? branchId, int priorityRank, DateOnly effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        CustomerId = customerId;
        CustomerGroupCode = string.IsNullOrWhiteSpace(customerGroupCode) ? null : customerGroupCode.Trim();
        ItemGroupId = itemGroupId;
        BranchId = branchId;
        PriorityRank = priorityRank;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class DiscountScheme : AuditableEntity, ICompanyScoped
{
    private DiscountScheme()
    {
    }

    public long? CompanyId { get; private set; }
    public string SchemeCode { get; private set; } = string.Empty;
    public string SchemeName { get; private set; } = string.Empty;
    public string DiscountType { get; private set; } = string.Empty;
    public long? CurrencyId { get; private set; }
    public DateOnly EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public bool RequiresApproval { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static DiscountScheme Create(long companyId, string schemeCode, string schemeName, string discountType, long? currencyId, DateOnly effectiveFrom, DateOnly? effectiveTo, bool requiresApproval, string approvalStatus, string status, long? userId)
    {
        var entity = new DiscountScheme { CompanyId = companyId };
        entity.Update(schemeCode, schemeName, discountType, currencyId, effectiveFrom, effectiveTo, requiresApproval, approvalStatus, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string schemeCode, string schemeName, string discountType, long? currencyId, DateOnly effectiveFrom, DateOnly? effectiveTo, bool requiresApproval, string approvalStatus, string status, long? userId)
    {
        SchemeCode = schemeCode.Trim().ToUpperInvariant();
        SchemeName = schemeName.Trim();
        DiscountType = discountType.Trim();
        CurrencyId = currencyId;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        RequiresApproval = requiresApproval;
        ApprovalStatus = approvalStatus.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class DiscountRule : AuditableEntity
{
    private DiscountRule()
    {
    }

    public long DiscountSchemeId { get; private set; }
    public int RuleNo { get; private set; }
    public string RuleName { get; private set; } = string.Empty;
    public string ApplicabilityType { get; private set; } = string.Empty;
    public long? CustomerId { get; private set; }
    public string? CustomerGroupCode { get; private set; }
    public long? ItemId { get; private set; }
    public long? ItemGroupId { get; private set; }
    public decimal MinQuantity { get; private set; }
    public decimal? DiscountPercent { get; private set; }
    public decimal? DiscountAmount { get; private set; }
    public long? PriceListId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static DiscountRule Create(long discountSchemeId, int ruleNo, string ruleName, string applicabilityType, long? customerId, string? customerGroupCode, long? itemId, long? itemGroupId, decimal minQuantity, decimal? discountPercent, decimal? discountAmount, long? priceListId, string status, long? userId)
    {
        var entity = new DiscountRule { DiscountSchemeId = discountSchemeId };
        entity.Update(ruleNo, ruleName, applicabilityType, customerId, customerGroupCode, itemId, itemGroupId, minQuantity, discountPercent, discountAmount, priceListId, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(int ruleNo, string ruleName, string applicabilityType, long? customerId, string? customerGroupCode, long? itemId, long? itemGroupId, decimal minQuantity, decimal? discountPercent, decimal? discountAmount, long? priceListId, string status, long? userId)
    {
        RuleNo = ruleNo;
        RuleName = ruleName.Trim();
        ApplicabilityType = applicabilityType.Trim();
        CustomerId = customerId;
        CustomerGroupCode = string.IsNullOrWhiteSpace(customerGroupCode) ? null : customerGroupCode.Trim();
        ItemId = itemId;
        ItemGroupId = itemGroupId;
        MinQuantity = minQuantity;
        DiscountPercent = discountPercent;
        DiscountAmount = discountAmount;
        PriceListId = priceListId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
