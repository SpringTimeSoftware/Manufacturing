namespace STS.Mfg.Application.Contracts.SalesPlanning;

public sealed record CustomerCommercialDefaultsRequest(
    long CompanyId,
    long BranchId,
    long CustomerId,
    long? CustomerAddressId,
    DateOnly DocumentDate,
    long? SalesOwnerUserId = null,
    string? SalesOwnerName = null,
    long? PriceListId = null,
    long? DiscountSchemeId = null,
    long? PaymentTermsId = null,
    long? TaxCategoryId = null,
    string? TaxTreatment = null,
    long? CurrencyId = null,
    long? TradeTermsId = null);

public sealed record CommercialLongDefaultValue(
    long? Value,
    string? Display,
    string Source,
    bool IsDefaulted,
    bool IsOverridden);

public sealed record CommercialStringDefaultValue(
    string? Value,
    string? Display,
    string Source,
    bool IsDefaulted,
    bool IsOverridden);

public sealed record CustomerCommercialDefaultsDto(
    long CustomerId,
    long? SalesTeamId,
    string? SalesTeamName,
    long? TerritoryId,
    string? TerritoryName,
    CommercialLongDefaultValue SalesOwner,
    CommercialLongDefaultValue PriceList,
    CommercialLongDefaultValue DiscountScheme,
    CommercialLongDefaultValue PaymentTerms,
    CommercialLongDefaultValue TaxCategory,
    CommercialStringDefaultValue TaxTreatment,
    CommercialLongDefaultValue Currency,
    CommercialLongDefaultValue TradeTerms,
    IReadOnlyCollection<string> ValidationMessages);

public sealed record SalesTerritoryDto(
    long Id,
    long CompanyId,
    string TerritoryCode,
    string TerritoryName,
    long? ParentTerritoryId,
    string Status);

public sealed record SalesTeamDto(
    long Id,
    long CompanyId,
    string TeamCode,
    string TeamName,
    long? DefaultTerritoryId,
    string Status);
