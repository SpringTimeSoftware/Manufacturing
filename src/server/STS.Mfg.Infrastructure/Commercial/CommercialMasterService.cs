using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Commercial;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Commercial;
using STS.Mfg.Application.Contracts.Masters;
using STS.Mfg.Domain.Commercial;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Commercial;

internal sealed class CommercialMasterService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), ICommercialMasterService
{
    public async Task<PagedResult<CurrencyDto>> ListCurrenciesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.Currencies.AsNoTracking().ApplyCompanyScope(GetScope());
        query = ApplyCompanyFilter(query, filter.CompanyId);
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.CurrencyCode.Contains(search) || entity.CurrencyName.Contains(search));
        }

        query = ApplyStatusFilter(query, filter.Status);
        var page = await query.OrderByDescending(entity => entity.IsBaseCurrency).ThenBy(entity => entity.CurrencyCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapCurrency);
    }

    public async Task<CurrencyDto> CreateCurrencyAsync(CurrencyUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCurrency(request);
        EnsureContextAccess(request.CompanyId, null);

        var entity = Currency.Create(request.CompanyId, request.CurrencyCode, request.CurrencyName, Normalize(request.Symbol), request.DecimalPrecision, request.RoundingMode, request.IsBaseCurrency, request.Status, GetUserId());
        DbContext.Currencies.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapCurrency(entity);
        await WriteAuditAsync("commercial", nameof(Currency), "currency.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<CurrencyDto> UpdateCurrencyAsync(long id, CurrencyUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCurrency(request);
        var entity = await DbContext.Currencies.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Currency was not found in the active scope.", "commercial.currency_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Currency company cannot be changed."));

        var before = MapCurrency(entity);
        entity.Update(request.CurrencyCode, request.CurrencyName, Normalize(request.Symbol), request.DecimalPrecision, request.RoundingMode, request.IsBaseCurrency, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapCurrency(entity);
        await WriteAuditAsync("commercial", nameof(Currency), "currency.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ExchangeRateSetupDto>> ListExchangeRatesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ExchangeRateSetups.AsNoTracking().ApplyCompanyScope(GetScope());
        query = ApplyCompanyFilter(query, filter.CompanyId);
        query = ApplyStatusFilter(query, filter.Status);
        var page = await query.OrderByDescending(entity => entity.EffectiveFrom).ThenBy(entity => entity.CurrencyId).ToPagedResultAsync(filter, cancellationToken);
        var currencies = await LoadCurrencyCodesAsync(page.Items.Select(entity => entity.CurrencyId), cancellationToken);
        return MapPage(page, entity => MapExchangeRate(entity, currencies));
    }

    public async Task<ExchangeRateSetupDto> CreateExchangeRateAsync(ExchangeRateSetupUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateExchangeRate(request);
        EnsureContextAccess(request.CompanyId, null);
        await RequireCurrencyAsync(request.CompanyId, request.CurrencyId, cancellationToken);

        var entity = ExchangeRateSetup.Create(request.CompanyId, request.CurrencyId, request.RateType, request.RateSource, request.ManualRate, request.EffectiveFrom, request.EffectiveTo, request.Status, GetUserId());
        DbContext.ExchangeRateSetups.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapExchangeRate(entity, await LoadCurrencyCodesAsync(new[] { entity.CurrencyId }, cancellationToken));
        await WriteAuditAsync("commercial", nameof(ExchangeRateSetup), "exchangerate.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ExchangeRateSetupDto> UpdateExchangeRateAsync(long id, ExchangeRateSetupUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateExchangeRate(request);
        var entity = await DbContext.ExchangeRateSetups.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Exchange-rate setup was not found in the active scope.", "commercial.exchange_rate_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Exchange-rate company cannot be changed."));
        await RequireCurrencyAsync(request.CompanyId, request.CurrencyId, cancellationToken);

        var before = MapExchangeRate(entity, await LoadCurrencyCodesAsync(new[] { entity.CurrencyId }, cancellationToken));
        entity.Update(request.RateType, request.RateSource, request.ManualRate, request.EffectiveFrom, request.EffectiveTo, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapExchangeRate(entity, await LoadCurrencyCodesAsync(new[] { entity.CurrencyId }, cancellationToken));
        await WriteAuditAsync("commercial", nameof(ExchangeRateSetup), "exchangerate.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<TaxCategoryDto>> ListTaxCategoriesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.TaxCategories.AsNoTracking().ApplyCompanyScope(GetScope());
        query = ApplyCompanyFilter(query, filter.CompanyId);
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.TaxCategoryCode.Contains(search) || entity.TaxCategoryName.Contains(search));
        }

        query = ApplyStatusFilter(query, filter.Status);
        var page = await query.OrderBy(entity => entity.TaxCategoryCode).ToPagedResultAsync(filter, cancellationToken);
        var codes = await LoadTaxCodesAsync(page.Items.Select(entity => entity.Id), cancellationToken);
        return MapPage(page, entity => MapTaxCategory(entity, codes.GetValueOrDefault(entity.Id, Array.Empty<TaxCodeDto>())));
    }

    public async Task<TaxCategoryDto> CreateTaxCategoryAsync(TaxCategoryUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTaxCategory(request);
        EnsureContextAccess(request.CompanyId, null);
        var userId = GetUserId();

        var entity = TaxCategory.Create(request.CompanyId, request.TaxCategoryCode, request.TaxCategoryName, request.TaxScope, request.DefaultRatePercent, request.IsRecoverable, request.Status, userId);
        DbContext.TaxCategories.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        await ReplaceTaxCodesAsync(entity.Id, request.TaxCodes, userId, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = await LoadTaxCategoryDtoAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("commercial", nameof(TaxCategory), "taxcategory.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<TaxCategoryDto> UpdateTaxCategoryAsync(long id, TaxCategoryUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTaxCategory(request);
        var entity = await DbContext.TaxCategories.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Tax category was not found in the active scope.", "commercial.tax_category_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Tax category company cannot be changed."));

        var before = await LoadTaxCategoryDtoAsync(id, cancellationToken);
        entity.Update(request.TaxCategoryCode, request.TaxCategoryName, request.TaxScope, request.DefaultRatePercent, request.IsRecoverable, request.Status, GetUserId());
        await ReplaceTaxCodesAsync(entity.Id, request.TaxCodes, GetUserId(), cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await LoadTaxCategoryDtoAsync(id, cancellationToken);
        await WriteAuditAsync("commercial", nameof(TaxCategory), "taxcategory.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<PaymentTermDto>> ListPaymentTermsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.PaymentTerms.AsNoTracking().ApplyCompanyScope(GetScope());
        query = ApplyCompanyFilter(query, filter.CompanyId);
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.PaymentTermsCode.Contains(search) || entity.PaymentTermsName.Contains(search));
        }

        query = ApplyStatusFilter(query, filter.Status);
        var page = await query.OrderBy(entity => entity.PaymentTermsCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapPaymentTerm);
    }

    public async Task<PaymentTermDto> CreatePaymentTermAsync(PaymentTermUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePaymentTerm(request);
        EnsureContextAccess(request.CompanyId, null);
        var entity = PaymentTerm.Create(request.CompanyId, request.PaymentTermsCode, request.PaymentTermsName, request.NetDays, request.DiscountDays, request.DiscountPercent, request.DueCalculationMode, request.Status, GetUserId());
        DbContext.PaymentTerms.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapPaymentTerm(entity);
        await WriteAuditAsync("commercial", nameof(PaymentTerm), "paymentterm.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PaymentTermDto> UpdatePaymentTermAsync(long id, PaymentTermUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePaymentTerm(request);
        var entity = await DbContext.PaymentTerms.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Payment term was not found in the active scope.", "commercial.payment_term_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Payment term company cannot be changed."));

        var before = MapPaymentTerm(entity);
        entity.Update(request.PaymentTermsCode, request.PaymentTermsName, request.NetDays, request.DiscountDays, request.DiscountPercent, request.DueCalculationMode, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapPaymentTerm(entity);
        await WriteAuditAsync("commercial", nameof(PaymentTerm), "paymentterm.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<TradeTermDto>> ListTradeTermsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.TradeTerms.AsNoTracking().ApplyCompanyScope(GetScope());
        query = ApplyCompanyFilter(query, filter.CompanyId);
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.TradeTermsCode.Contains(search) || entity.TradeTermsName.Contains(search));
        }

        query = ApplyStatusFilter(query, filter.Status);
        var page = await query.OrderBy(entity => entity.TradeTermsCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapTradeTerm);
    }

    public async Task<TradeTermDto> CreateTradeTermAsync(TradeTermUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTradeTerm(request);
        EnsureContextAccess(request.CompanyId, null);
        var entity = TradeTerm.Create(request.CompanyId, request.TradeTermsCode, request.TradeTermsName, request.TradeMode, Normalize(request.ResponsibilitySummary), request.Status, GetUserId());
        DbContext.TradeTerms.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapTradeTerm(entity);
        await WriteAuditAsync("commercial", nameof(TradeTerm), "tradeterm.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<TradeTermDto> UpdateTradeTermAsync(long id, TradeTermUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTradeTerm(request);
        var entity = await DbContext.TradeTerms.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Trade term was not found in the active scope.", "commercial.trade_term_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Trade term company cannot be changed."));

        var before = MapTradeTerm(entity);
        entity.Update(request.TradeTermsCode, request.TradeTermsName, request.TradeMode, Normalize(request.ResponsibilitySummary), request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapTradeTerm(entity);
        await WriteAuditAsync("commercial", nameof(TradeTerm), "tradeterm.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<PriceListDto>> ListPriceListsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.PriceLists.AsNoTracking().ApplyCompanyScope(GetScope());
        query = ApplyCompanyFilter(query, filter.CompanyId);
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.PriceListCode.Contains(search) || entity.PriceListName.Contains(search) || (entity.CustomerSegment != null && entity.CustomerSegment.Contains(search)));
        }

        query = ApplyStatusFilter(query, filter.Status);
        var page = await query.OrderBy(entity => entity.PriceListCode).ToPagedResultAsync(filter, cancellationToken);
        var dtos = new List<PriceListDto>();
        foreach (var item in page.Items)
        {
            dtos.Add(await MapPriceListAsync(item, cancellationToken));
        }

        return new PagedResult<PriceListDto>(dtos, page.Page, page.PageSize, page.TotalCount, page.TotalPages);
    }

    public async Task<PriceListDto> GetPriceListAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.PriceLists.AsNoTracking().ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Price list was not found in the active scope.", "commercial.price_list_not_found");
        return await MapPriceListAsync(entity, cancellationToken);
    }

    public async Task<PriceListDto> CreatePriceListAsync(PriceListUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePriceList(request);
        EnsureContextAccess(request.CompanyId, null);
        await RequireCurrencyAsync(request.CompanyId, request.CurrencyId, cancellationToken);
        var userId = GetUserId();

        var entity = PriceList.Create(request.CompanyId, request.PriceListCode, request.PriceListName, request.CurrencyId, request.PriceListType, request.EffectiveFrom, request.EffectiveTo, Normalize(request.CustomerSegment), request.ApprovalStatus, request.Status, userId);
        DbContext.PriceLists.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        await ReplacePriceListChildrenAsync(entity.Id, request.Lines, request.Assignments, userId, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = await GetPriceListAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("commercial", nameof(PriceList), "pricelist.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PriceListDto> UpdatePriceListAsync(long id, PriceListUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePriceList(request);
        var entity = await DbContext.PriceLists.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Price list was not found in the active scope.", "commercial.price_list_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Price list company cannot be changed."));
        await RequireCurrencyAsync(request.CompanyId, request.CurrencyId, cancellationToken);

        var before = await GetPriceListAsync(id, cancellationToken);
        entity.Update(request.PriceListCode, request.PriceListName, request.CurrencyId, request.PriceListType, request.EffectiveFrom, request.EffectiveTo, Normalize(request.CustomerSegment), request.ApprovalStatus, request.Status, GetUserId());
        await ReplacePriceListChildrenAsync(entity.Id, request.Lines, request.Assignments, GetUserId(), cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetPriceListAsync(id, cancellationToken);
        await WriteAuditAsync("commercial", nameof(PriceList), "pricelist.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<DiscountSchemeDto>> ListDiscountSchemesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.DiscountSchemes.AsNoTracking().ApplyCompanyScope(GetScope());
        query = ApplyCompanyFilter(query, filter.CompanyId);
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.SchemeCode.Contains(search) || entity.SchemeName.Contains(search));
        }

        query = ApplyStatusFilter(query, filter.Status);
        var page = await query.OrderBy(entity => entity.SchemeCode).ToPagedResultAsync(filter, cancellationToken);
        var dtos = new List<DiscountSchemeDto>();
        foreach (var item in page.Items)
        {
            dtos.Add(await MapDiscountSchemeAsync(item, cancellationToken));
        }

        return new PagedResult<DiscountSchemeDto>(dtos, page.Page, page.PageSize, page.TotalCount, page.TotalPages);
    }

    public async Task<DiscountSchemeDto> GetDiscountSchemeAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.DiscountSchemes.AsNoTracking().ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Discount scheme was not found in the active scope.", "commercial.discount_scheme_not_found");
        return await MapDiscountSchemeAsync(entity, cancellationToken);
    }

    public async Task<DiscountSchemeDto> CreateDiscountSchemeAsync(DiscountSchemeUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDiscountScheme(request);
        EnsureContextAccess(request.CompanyId, null);
        if (request.CurrencyId.HasValue)
        {
            await RequireCurrencyAsync(request.CompanyId, request.CurrencyId.Value, cancellationToken);
        }

        var userId = GetUserId();
        var entity = DiscountScheme.Create(request.CompanyId, request.SchemeCode, request.SchemeName, request.DiscountType, request.CurrencyId, request.EffectiveFrom, request.EffectiveTo, request.RequiresApproval, request.ApprovalStatus, request.Status, userId);
        DbContext.DiscountSchemes.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        await ReplaceDiscountRulesAsync(entity.Id, request.Rules, userId, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = await GetDiscountSchemeAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("commercial", nameof(DiscountScheme), "discountscheme.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<DiscountSchemeDto> UpdateDiscountSchemeAsync(long id, DiscountSchemeUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDiscountScheme(request);
        var entity = await DbContext.DiscountSchemes.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Discount scheme was not found in the active scope.", "commercial.discount_scheme_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Discount scheme company cannot be changed."));
        if (request.CurrencyId.HasValue)
        {
            await RequireCurrencyAsync(request.CompanyId, request.CurrencyId.Value, cancellationToken);
        }

        var before = await GetDiscountSchemeAsync(id, cancellationToken);
        entity.Update(request.SchemeCode, request.SchemeName, request.DiscountType, request.CurrencyId, request.EffectiveFrom, request.EffectiveTo, request.RequiresApproval, request.ApprovalStatus, request.Status, GetUserId());
        await ReplaceDiscountRulesAsync(entity.Id, request.Rules, GetUserId(), cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetDiscountSchemeAsync(id, cancellationToken);
        await WriteAuditAsync("commercial", nameof(DiscountScheme), "discountscheme.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    private static IQueryable<T> ApplyCompanyFilter<T>(IQueryable<T> query, long? companyId)
        where T : class, STS.Mfg.Domain.Abstractions.ICompanyScoped =>
        companyId.HasValue ? query.Where(entity => entity.CompanyId == companyId.Value) : query;

    private static IQueryable<Currency> ApplyStatusFilter(IQueryable<Currency> query, string? status) =>
        string.IsNullOrWhiteSpace(status) || status.Equals("all", StringComparison.OrdinalIgnoreCase) ? query : query.Where(entity => entity.Status == status);

    private static IQueryable<ExchangeRateSetup> ApplyStatusFilter(IQueryable<ExchangeRateSetup> query, string? status) =>
        string.IsNullOrWhiteSpace(status) || status.Equals("all", StringComparison.OrdinalIgnoreCase) ? query : query.Where(entity => entity.Status == status);

    private static IQueryable<TaxCategory> ApplyStatusFilter(IQueryable<TaxCategory> query, string? status) =>
        string.IsNullOrWhiteSpace(status) || status.Equals("all", StringComparison.OrdinalIgnoreCase) ? query : query.Where(entity => entity.Status == status);

    private static IQueryable<PaymentTerm> ApplyStatusFilter(IQueryable<PaymentTerm> query, string? status) =>
        string.IsNullOrWhiteSpace(status) || status.Equals("all", StringComparison.OrdinalIgnoreCase) ? query : query.Where(entity => entity.Status == status);

    private static IQueryable<TradeTerm> ApplyStatusFilter(IQueryable<TradeTerm> query, string? status) =>
        string.IsNullOrWhiteSpace(status) || status.Equals("all", StringComparison.OrdinalIgnoreCase) ? query : query.Where(entity => entity.Status == status);

    private static IQueryable<PriceList> ApplyStatusFilter(IQueryable<PriceList> query, string? status) =>
        string.IsNullOrWhiteSpace(status) || status.Equals("all", StringComparison.OrdinalIgnoreCase) ? query : query.Where(entity => entity.Status == status);

    private static IQueryable<DiscountScheme> ApplyStatusFilter(IQueryable<DiscountScheme> query, string? status) =>
        string.IsNullOrWhiteSpace(status) || status.Equals("all", StringComparison.OrdinalIgnoreCase) ? query : query.Where(entity => entity.Status == status);

    private async Task<Currency> RequireCurrencyAsync(long companyId, long currencyId, CancellationToken cancellationToken)
    {
        var entity = await DbContext.Currencies.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == currencyId && record.CompanyId == companyId, cancellationToken);
        return EnsureFound(entity, "Currency was not found for the selected company.", "commercial.currency_not_found");
    }

    private async Task<PriceListDto> MapPriceListAsync(PriceList entity, CancellationToken cancellationToken)
    {
        var lines = await DbContext.PriceListLines.AsNoTracking().Where(record => record.PriceListId == entity.Id).OrderBy(record => record.LineNo).ToArrayAsync(cancellationToken);
        var assignments = await DbContext.PriceAssignments.AsNoTracking().Where(record => record.PriceListId == entity.Id).OrderBy(record => record.PriorityRank).ToArrayAsync(cancellationToken);
        var currencies = await LoadCurrencyCodesAsync(new[] { entity.CurrencyId }, cancellationToken);
        var lineDtos = await MapPriceListLinesAsync(lines, cancellationToken);
        var assignmentDtos = await MapPriceAssignmentsAsync(assignments, cancellationToken);
        return new PriceListDto(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.PriceListCode,
            entity.PriceListName,
            entity.CurrencyId,
            currencies.GetValueOrDefault(entity.CurrencyId, "Currency"),
            entity.PriceListType,
            entity.EffectiveFrom,
            entity.EffectiveTo,
            entity.CustomerSegment,
            entity.ApprovalStatus,
            entity.Status,
            lineDtos,
            assignmentDtos);
    }

    private async Task<DiscountSchemeDto> MapDiscountSchemeAsync(DiscountScheme entity, CancellationToken cancellationToken)
    {
        var rules = await DbContext.DiscountRules.AsNoTracking().Where(record => record.DiscountSchemeId == entity.Id).OrderBy(record => record.RuleNo).ToArrayAsync(cancellationToken);
        var currencies = entity.CurrencyId.HasValue ? await LoadCurrencyCodesAsync(new[] { entity.CurrencyId.Value }, cancellationToken) : new Dictionary<long, string>();
        var ruleDtos = await MapDiscountRulesAsync(rules, cancellationToken);
        return new DiscountSchemeDto(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.SchemeCode,
            entity.SchemeName,
            entity.DiscountType,
            entity.CurrencyId,
            entity.CurrencyId.HasValue ? currencies.GetValueOrDefault(entity.CurrencyId.Value) : null,
            entity.EffectiveFrom,
            entity.EffectiveTo,
            entity.RequiresApproval,
            entity.ApprovalStatus,
            entity.Status,
            ruleDtos);
    }

    private async Task<IReadOnlyCollection<PriceListLineDto>> MapPriceListLinesAsync(IReadOnlyCollection<PriceListLine> lines, CancellationToken cancellationToken)
    {
        var itemIds = lines.Select(record => record.ItemId).OfType<long>().Distinct().ToArray();
        var itemGroupIds = lines.Select(record => record.ItemGroupId).OfType<long>().Distinct().ToArray();
        var uomIds = lines.Select(record => record.UomId).Distinct().ToArray();
        var taxIds = lines.Select(record => record.TaxCategoryId).OfType<long>().Distinct().ToArray();
        var items = await DbContext.Items.AsNoTracking().Where(record => itemIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);
        var itemGroups = await DbContext.ItemGroups.AsNoTracking().Where(record => itemGroupIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);
        var uoms = await DbContext.Uoms.AsNoTracking().Where(record => uomIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);
        var taxes = await DbContext.TaxCategories.AsNoTracking().Where(record => taxIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);

        return lines.Select(line =>
        {
            items.TryGetValue(line.ItemId ?? 0, out var item);
            itemGroups.TryGetValue(line.ItemGroupId ?? 0, out var group);
            uoms.TryGetValue(line.UomId, out var uom);
            taxes.TryGetValue(line.TaxCategoryId ?? 0, out var tax);
            return new PriceListLineDto(
                line.Id,
                line.PriceListId,
                line.LineNo,
                line.ItemId,
                item?.ItemCode,
                item?.ItemName,
                line.ItemGroupId,
                group?.ItemGroupName,
                line.UomId,
                uom?.UomCode ?? "UOM",
                line.MinQuantity,
                line.UnitPrice,
                line.DiscountEligible,
                line.TaxCategoryId,
                tax?.TaxCategoryCode,
                line.EffectiveFrom,
                line.EffectiveTo,
                line.Status);
        }).ToArray();
    }

    private async Task<IReadOnlyCollection<PriceAssignmentDto>> MapPriceAssignmentsAsync(IReadOnlyCollection<PriceAssignment> assignments, CancellationToken cancellationToken)
    {
        var customerIds = assignments.Select(record => record.CustomerId).OfType<long>().Distinct().ToArray();
        var itemGroupIds = assignments.Select(record => record.ItemGroupId).OfType<long>().Distinct().ToArray();
        var branchIds = assignments.Select(record => record.BranchId).OfType<long>().Distinct().ToArray();
        var customers = await DbContext.Customers.AsNoTracking().Where(record => customerIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);
        var itemGroups = await DbContext.ItemGroups.AsNoTracking().Where(record => itemGroupIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);
        var branches = await DbContext.Branches.AsNoTracking().Where(record => branchIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);

        return assignments.Select(assignment =>
        {
            customers.TryGetValue(assignment.CustomerId ?? 0, out var customer);
            itemGroups.TryGetValue(assignment.ItemGroupId ?? 0, out var group);
            branches.TryGetValue(assignment.BranchId ?? 0, out var branch);
            return new PriceAssignmentDto(
                assignment.Id,
                assignment.PriceListId,
                assignment.CustomerId,
                customer?.CustomerName,
                assignment.CustomerGroupCode,
                assignment.ItemGroupId,
                group?.ItemGroupName,
                assignment.BranchId,
                branch?.BranchName,
                assignment.PriorityRank,
                assignment.EffectiveFrom,
                assignment.EffectiveTo,
                assignment.Status);
        }).ToArray();
    }

    private async Task<IReadOnlyCollection<DiscountRuleDto>> MapDiscountRulesAsync(IReadOnlyCollection<DiscountRule> rules, CancellationToken cancellationToken)
    {
        var customerIds = rules.Select(record => record.CustomerId).OfType<long>().Distinct().ToArray();
        var itemIds = rules.Select(record => record.ItemId).OfType<long>().Distinct().ToArray();
        var itemGroupIds = rules.Select(record => record.ItemGroupId).OfType<long>().Distinct().ToArray();
        var priceListIds = rules.Select(record => record.PriceListId).OfType<long>().Distinct().ToArray();
        var customers = await DbContext.Customers.AsNoTracking().Where(record => customerIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);
        var items = await DbContext.Items.AsNoTracking().Where(record => itemIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);
        var itemGroups = await DbContext.ItemGroups.AsNoTracking().Where(record => itemGroupIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);
        var priceLists = await DbContext.PriceLists.AsNoTracking().Where(record => priceListIds.Contains(record.Id)).ToDictionaryAsync(record => record.Id, cancellationToken);

        return rules.Select(rule =>
        {
            customers.TryGetValue(rule.CustomerId ?? 0, out var customer);
            items.TryGetValue(rule.ItemId ?? 0, out var item);
            itemGroups.TryGetValue(rule.ItemGroupId ?? 0, out var group);
            priceLists.TryGetValue(rule.PriceListId ?? 0, out var priceList);
            return new DiscountRuleDto(
                rule.Id,
                rule.DiscountSchemeId,
                rule.RuleNo,
                rule.RuleName,
                rule.ApplicabilityType,
                rule.CustomerId,
                customer?.CustomerName,
                rule.CustomerGroupCode,
                rule.ItemId,
                item?.ItemCode,
                item?.ItemName,
                rule.ItemGroupId,
                group?.ItemGroupName,
                rule.MinQuantity,
                rule.DiscountPercent,
                rule.DiscountAmount,
                rule.PriceListId,
                priceList?.PriceListCode,
                rule.Status);
        }).ToArray();
    }

    private async Task ReplacePriceListChildrenAsync(long priceListId, IReadOnlyCollection<PriceListLineUpsertRequest> lines, IReadOnlyCollection<PriceAssignmentUpsertRequest> assignments, long? userId, CancellationToken cancellationToken)
    {
        var existingLines = await DbContext.PriceListLines.Where(record => record.PriceListId == priceListId).ToArrayAsync(cancellationToken);
        var existingAssignments = await DbContext.PriceAssignments.Where(record => record.PriceListId == priceListId).ToArrayAsync(cancellationToken);
        DbContext.PriceListLines.RemoveRange(existingLines);
        DbContext.PriceAssignments.RemoveRange(existingAssignments);

        foreach (var line in lines.OrderBy(record => record.LineNo))
        {
            DbContext.PriceListLines.Add(PriceListLine.Create(priceListId, line.LineNo, line.ItemId, line.ItemGroupId, line.UomId, line.MinQuantity, line.UnitPrice, line.DiscountEligible, line.TaxCategoryId, line.EffectiveFrom, line.EffectiveTo, line.Status, userId));
        }

        foreach (var assignment in assignments.OrderBy(record => record.PriorityRank))
        {
            DbContext.PriceAssignments.Add(PriceAssignment.Create(priceListId, assignment.CustomerId, Normalize(assignment.CustomerGroupCode), assignment.ItemGroupId, assignment.BranchId, assignment.PriorityRank, assignment.EffectiveFrom, assignment.EffectiveTo, assignment.Status, userId));
        }
    }

    private async Task ReplaceDiscountRulesAsync(long discountSchemeId, IReadOnlyCollection<DiscountRuleUpsertRequest> rules, long? userId, CancellationToken cancellationToken)
    {
        var existing = await DbContext.DiscountRules.Where(record => record.DiscountSchemeId == discountSchemeId).ToArrayAsync(cancellationToken);
        DbContext.DiscountRules.RemoveRange(existing);

        foreach (var rule in rules.OrderBy(record => record.RuleNo))
        {
            DbContext.DiscountRules.Add(DiscountRule.Create(discountSchemeId, rule.RuleNo, rule.RuleName, rule.ApplicabilityType, rule.CustomerId, Normalize(rule.CustomerGroupCode), rule.ItemId, rule.ItemGroupId, rule.MinQuantity, rule.DiscountPercent, rule.DiscountAmount, rule.PriceListId, rule.Status, userId));
        }
    }

    private async Task ReplaceTaxCodesAsync(long taxCategoryId, IReadOnlyCollection<TaxCodeUpsertRequest> taxCodes, long? userId, CancellationToken cancellationToken)
    {
        var existing = await DbContext.TaxCodes.Where(record => record.TaxCategoryId == taxCategoryId).ToArrayAsync(cancellationToken);
        DbContext.TaxCodes.RemoveRange(existing);

        foreach (var code in taxCodes.OrderBy(record => record.TaxCode))
        {
            DbContext.TaxCodes.Add(TaxCode.Create(taxCategoryId, code.TaxCode, code.TaxCodeName, code.RatePercent, code.EffectiveFrom, code.EffectiveTo, code.Status, userId));
        }
    }

    private async Task<TaxCategoryDto> LoadTaxCategoryDtoAsync(long id, CancellationToken cancellationToken)
    {
        var entity = await DbContext.TaxCategories.AsNoTracking().ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Tax category was not found in the active scope.", "commercial.tax_category_not_found");
        var codes = await LoadTaxCodesAsync(new[] { id }, cancellationToken);
        return MapTaxCategory(entity, codes.GetValueOrDefault(id, Array.Empty<TaxCodeDto>()));
    }

    private async Task<Dictionary<long, IReadOnlyCollection<TaxCodeDto>>> LoadTaxCodesAsync(IEnumerable<long> taxCategoryIds, CancellationToken cancellationToken)
    {
        var ids = taxCategoryIds.Distinct().ToArray();
        if (ids.Length == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<TaxCodeDto>>();
        }

        var rows = await DbContext.TaxCodes.AsNoTracking()
            .Where(record => ids.Contains(record.TaxCategoryId))
            .OrderBy(record => record.TaxCodeValue)
            .ToArrayAsync(cancellationToken);

        return rows
            .GroupBy(record => record.TaxCategoryId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyCollection<TaxCodeDto>)group.Select(MapTaxCode).ToArray());
    }

    private async Task<Dictionary<long, string>> LoadCurrencyCodesAsync(IEnumerable<long> currencyIds, CancellationToken cancellationToken)
    {
        var ids = currencyIds.Distinct().ToArray();
        if (ids.Length == 0)
        {
            return new Dictionary<long, string>();
        }

        return await DbContext.Currencies.AsNoTracking()
            .Where(record => ids.Contains(record.Id))
            .ToDictionaryAsync(record => record.Id, record => record.CurrencyCode, cancellationToken);
    }

    private static CurrencyDto MapCurrency(Currency entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.CurrencyCode, entity.CurrencyName, entity.Symbol, entity.DecimalPrecision, entity.RoundingMode, entity.IsBaseCurrency, entity.Status);

    private static ExchangeRateSetupDto MapExchangeRate(ExchangeRateSetup entity, IReadOnlyDictionary<long, string> currencyCodes) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.CurrencyId, currencyCodes.GetValueOrDefault(entity.CurrencyId, "Currency"), entity.RateType, entity.RateSource, entity.ManualRate, entity.EffectiveFrom, entity.EffectiveTo, entity.Status);

    private static TaxCategoryDto MapTaxCategory(TaxCategory entity, IReadOnlyCollection<TaxCodeDto> taxCodes) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.TaxCategoryCode, entity.TaxCategoryName, entity.TaxScope, entity.DefaultRatePercent, entity.IsRecoverable, entity.Status, taxCodes);

    private static TaxCodeDto MapTaxCode(TaxCode entity) =>
        new(entity.Id, entity.TaxCategoryId, entity.TaxCodeValue, entity.TaxCodeName, entity.RatePercent, entity.EffectiveFrom, entity.EffectiveTo, entity.Status);

    private static PaymentTermDto MapPaymentTerm(PaymentTerm entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.PaymentTermsCode, entity.PaymentTermsName, entity.NetDays, entity.DiscountDays, entity.DiscountPercent, entity.DueCalculationMode, entity.Status);

    private static TradeTermDto MapTradeTerm(TradeTerm entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.TradeTermsCode, entity.TradeTermsName, entity.TradeMode, entity.ResponsibilitySummary, entity.Status);

    private static void ValidateCurrency(CurrencyUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.CurrencyCode, nameof(request.CurrencyCode), "Currency code is required."),
            Required(request.CurrencyName, nameof(request.CurrencyName), "Currency name is required."),
            NonNegative(request.DecimalPrecision, nameof(request.DecimalPrecision), "Decimal precision cannot be negative."),
            Required(request.RoundingMode, nameof(request.RoundingMode), "Rounding mode is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateExchangeRate(ExchangeRateSetupUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.CurrencyId, nameof(request.CurrencyId), "Currency is required."),
            Required(request.RateType, nameof(request.RateType), "Rate type is required."),
            Required(request.RateSource, nameof(request.RateSource), "Rate source is required."),
            NonNegative(request.ManualRate, nameof(request.ManualRate), "Manual rate cannot be negative."),
            DateOrder(request.EffectiveFrom, request.EffectiveTo, nameof(request.EffectiveTo), "Effective-to date cannot be before effective-from date."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateTaxCategory(TaxCategoryUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.TaxCategoryCode, nameof(request.TaxCategoryCode), "Tax category code is required."),
            Required(request.TaxCategoryName, nameof(request.TaxCategoryName), "Tax category name is required."),
            Required(request.TaxScope, nameof(request.TaxScope), "Tax scope is required."),
            NonNegative(request.DefaultRatePercent, nameof(request.DefaultRatePercent), "Default tax rate cannot be negative."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        foreach (var code in request.TaxCodes)
        {
            errors.Add(Required(code.TaxCode, nameof(code.TaxCode), "Tax code is required."));
            errors.Add(Required(code.TaxCodeName, nameof(code.TaxCodeName), "Tax code name is required."));
            errors.Add(NonNegative(code.RatePercent, nameof(code.RatePercent), "Tax code rate cannot be negative."));
            errors.Add(DateOrder(code.EffectiveFrom, code.EffectiveTo, nameof(code.EffectiveTo), "Tax code effective-to date cannot be before effective-from date."));
            errors.Add(Required(code.Status, nameof(code.Status), "Tax code status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidatePaymentTerm(PaymentTermUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.PaymentTermsCode, nameof(request.PaymentTermsCode), "Payment terms code is required."),
            Required(request.PaymentTermsName, nameof(request.PaymentTermsName), "Payment terms name is required."),
            NonNegative(request.NetDays, nameof(request.NetDays), "Net days cannot be negative."),
            request.DiscountDays.HasValue ? NonNegative(request.DiscountDays.Value, nameof(request.DiscountDays), "Discount days cannot be negative.") : null,
            NonNegative(request.DiscountPercent, nameof(request.DiscountPercent), "Discount percent cannot be negative."),
            Required(request.DueCalculationMode, nameof(request.DueCalculationMode), "Due calculation mode is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateTradeTerm(TradeTermUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.TradeTermsCode, nameof(request.TradeTermsCode), "Trade terms code is required."),
            Required(request.TradeTermsName, nameof(request.TradeTermsName), "Trade terms name is required."),
            Required(request.TradeMode, nameof(request.TradeMode), "Trade mode is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidatePriceList(PriceListUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.PriceListCode, nameof(request.PriceListCode), "Price list code is required."),
            Required(request.PriceListName, nameof(request.PriceListName), "Price list name is required."),
            Positive(request.CurrencyId, nameof(request.CurrencyId), "Currency is required."),
            Required(request.PriceListType, nameof(request.PriceListType), "Price list type is required."),
            DateOrder(request.EffectiveFrom, request.EffectiveTo, nameof(request.EffectiveTo), "Effective-to date cannot be before effective-from date."),
            Required(request.ApprovalStatus, nameof(request.ApprovalStatus), "Approval status is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        foreach (var line in request.Lines)
        {
            errors.Add(Positive(line.LineNo, nameof(line.LineNo), "Line number is required."));
            if (!line.ItemId.HasValue && !line.ItemGroupId.HasValue)
            {
                errors.Add(new ApiError("validation.required", nameof(line.ItemId), "A price line requires either an item or item group."));
            }

            errors.Add(Positive(line.UomId, nameof(line.UomId), "Line UOM is required."));
            errors.Add(NonNegative(line.MinQuantity, nameof(line.MinQuantity), "Minimum quantity cannot be negative."));
            errors.Add(Positive(line.UnitPrice, nameof(line.UnitPrice), "Unit price must be greater than zero."));
            errors.Add(DateOrder(line.EffectiveFrom, line.EffectiveTo, nameof(line.EffectiveTo), "Line effective-to date cannot be before effective-from date."));
            errors.Add(Required(line.Status, nameof(line.Status), "Line status is required."));
        }

        foreach (var assignment in request.Assignments)
        {
            errors.Add(Positive(assignment.PriorityRank, nameof(assignment.PriorityRank), "Assignment priority is required."));
            errors.Add(DateOrder(assignment.EffectiveFrom, assignment.EffectiveTo, nameof(assignment.EffectiveTo), "Assignment effective-to date cannot be before effective-from date."));
            errors.Add(Required(assignment.Status, nameof(assignment.Status), "Assignment status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateDiscountScheme(DiscountSchemeUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.SchemeCode, nameof(request.SchemeCode), "Discount scheme code is required."),
            Required(request.SchemeName, nameof(request.SchemeName), "Discount scheme name is required."),
            Required(request.DiscountType, nameof(request.DiscountType), "Discount type is required."),
            DateOrder(request.EffectiveFrom, request.EffectiveTo, nameof(request.EffectiveTo), "Effective-to date cannot be before effective-from date."),
            Required(request.ApprovalStatus, nameof(request.ApprovalStatus), "Approval status is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        foreach (var rule in request.Rules)
        {
            errors.Add(Positive(rule.RuleNo, nameof(rule.RuleNo), "Rule number is required."));
            errors.Add(Required(rule.RuleName, nameof(rule.RuleName), "Rule name is required."));
            errors.Add(Required(rule.ApplicabilityType, nameof(rule.ApplicabilityType), "Applicability type is required."));
            errors.Add(NonNegative(rule.MinQuantity, nameof(rule.MinQuantity), "Minimum quantity cannot be negative."));
            errors.Add(NonNegative(rule.DiscountPercent, nameof(rule.DiscountPercent), "Discount percent cannot be negative."));
            errors.Add(NonNegative(rule.DiscountAmount, nameof(rule.DiscountAmount), "Discount amount cannot be negative."));
            errors.Add(Required(rule.Status, nameof(rule.Status), "Rule status is required."));
            if (!rule.DiscountPercent.HasValue && !rule.DiscountAmount.HasValue)
            {
                errors.Add(new ApiError("validation.required", nameof(rule.DiscountPercent), "A discount rule requires a percentage or amount."));
            }
        }

        ThrowIfInvalid(errors);
    }

    private static ApiError? DateOrder(DateOnly from, DateOnly? to, string field, string message) =>
        to.HasValue && to.Value < from ? new ApiError("validation.date_order", field, message) : null;
}
