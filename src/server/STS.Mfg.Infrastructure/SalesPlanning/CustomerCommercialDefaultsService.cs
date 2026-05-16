using Dapper;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Persistence;
using STS.Mfg.Application.Abstractions.SalesPlanning;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts.SalesPlanning;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.SalesPlanning;

internal sealed class CustomerCommercialDefaultsService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ISqlConnectionFactory connectionFactory)
    : ICustomerCommercialDefaultsService
{
    public async Task<CustomerCommercialDefaultsDto> ResolveAsync(
        CustomerCommercialDefaultsRequest request,
        CancellationToken cancellationToken = default)
    {
        dataScopeService.EnsureContextAccess(request.CompanyId, request.BranchId);

        var profile = await dbContext.CustomerPartnerProfiles.AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.CustomerId == request.CustomerId, cancellationToken);
        var assignment = await dbContext.CustomerSalesAssignments.AsNoTracking()
            .Where(entity =>
                entity.CompanyId == request.CompanyId &&
                entity.CustomerId == request.CustomerId &&
                IsActive(entity.Status) &&
                entity.EffectiveFrom <= request.DocumentDate &&
                (!entity.EffectiveTo.HasValue || entity.EffectiveTo.Value >= request.DocumentDate))
            .OrderByDescending(entity => entity.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        var salesOwnerId = request.SalesOwnerUserId ?? assignment?.SalesOwnerUserId ?? profile?.DefaultSalesOwnerUserId;
        var salesOwnerName = await ResolveSalesOwnerNameAsync(salesOwnerId, cancellationToken) ??
                             (request.SalesOwnerUserId.HasValue ? request.SalesOwnerName : null);
        var salesTeamId = assignment?.SalesTeamId ?? profile?.DefaultSalesTeamId;
        var territoryId = assignment?.TerritoryId ?? profile?.DefaultTerritoryId;

        var salesTeamName = await dbContext.SalesTeams.AsNoTracking()
            .Where(entity => entity.Id == salesTeamId && entity.CompanyId == request.CompanyId && IsActive(entity.Status))
            .Select(entity => entity.TeamName)
            .FirstOrDefaultAsync(cancellationToken);
        var territoryName = await dbContext.SalesTerritories.AsNoTracking()
            .Where(entity => entity.Id == territoryId && entity.CompanyId == request.CompanyId && IsActive(entity.Status))
            .Select(entity => entity.TerritoryName)
            .FirstOrDefaultAsync(cancellationToken);

        var priceList = await ResolveDisplayAsync(
            dbContext.PriceLists.AsNoTracking(),
            request.CompanyId,
            request.PriceListId ?? profile?.DefaultPriceListId,
            entity => entity.PriceListName,
            cancellationToken);
        var discountScheme = await ResolveDisplayAsync(
            dbContext.DiscountSchemes.AsNoTracking(),
            request.CompanyId,
            request.DiscountSchemeId ?? profile?.DefaultDiscountSchemeId,
            entity => entity.SchemeName,
            cancellationToken);
        var paymentTerms = await ResolveDisplayAsync(
            dbContext.PaymentTerms.AsNoTracking(),
            request.CompanyId,
            request.PaymentTermsId ?? profile?.DefaultPaymentTermsId,
            entity => entity.PaymentTermsName,
            cancellationToken);
        var taxCategory = await ResolveDisplayAsync(
            dbContext.TaxCategories.AsNoTracking(),
            request.CompanyId,
            request.TaxCategoryId ?? profile?.DefaultTaxCategoryId,
            entity => entity.TaxCategoryName,
            cancellationToken);
        var currency = await ResolveDisplayAsync(
            dbContext.Currencies.AsNoTracking(),
            request.CompanyId,
            request.CurrencyId ?? profile?.DefaultCurrencyId,
            entity => entity.CurrencyName,
            cancellationToken);
        var tradeTerms = await ResolveDisplayAsync(
            dbContext.TradeTerms.AsNoTracking(),
            request.CompanyId,
            request.TradeTermsId ?? profile?.DefaultTradeTermsId,
            entity => entity.TradeTermsName,
            cancellationToken);

        var validation = new List<string>();
        if (salesOwnerId.HasValue && string.IsNullOrWhiteSpace(salesOwnerName))
        {
            validation.Add("Configured sales owner is no longer an active platform user.");
        }

        return new CustomerCommercialDefaultsDto(
            request.CustomerId,
            salesTeamId,
            salesTeamName,
            territoryId,
            territoryName,
            BuildLong(request.SalesOwnerUserId, salesOwnerId, salesOwnerName, assignment?.SalesOwnerUserId is not null ? "CustomerSalesAssignment" : "CustomerProfile"),
            BuildLong(request.PriceListId, priceList.Value, priceList.Display, "CustomerProfile"),
            BuildLong(request.DiscountSchemeId, discountScheme.Value, discountScheme.Display, "CustomerProfile"),
            BuildLong(request.PaymentTermsId, paymentTerms.Value, paymentTerms.Display, "CustomerProfile"),
            BuildLong(request.TaxCategoryId, taxCategory.Value, taxCategory.Display, "CustomerProfile"),
            BuildString(request.TaxTreatment, request.TaxTreatment ?? profile?.DefaultTaxTreatment, "CustomerProfile"),
            BuildLong(request.CurrencyId, currency.Value, currency.Display, "CustomerProfile"),
            BuildLong(request.TradeTermsId, tradeTerms.Value, tradeTerms.Display, "CustomerProfile"),
            validation);
    }

    public async Task<IReadOnlyCollection<SalesTerritoryDto>> ListSalesTerritoriesAsync(
        long companyId,
        CancellationToken cancellationToken = default)
    {
        dataScopeService.EnsureContextAccess(companyId, null);
        return await dbContext.SalesTerritories.AsNoTracking()
            .Where(entity => entity.CompanyId == companyId && IsActive(entity.Status))
            .OrderBy(entity => entity.TerritoryName)
            .Select(entity => new SalesTerritoryDto(entity.Id, entity.CompanyId ?? 0, entity.TerritoryCode, entity.TerritoryName, entity.ParentTerritoryId, entity.Status))
            .ToArrayAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<SalesTeamDto>> ListSalesTeamsAsync(
        long companyId,
        CancellationToken cancellationToken = default)
    {
        dataScopeService.EnsureContextAccess(companyId, null);
        return await dbContext.SalesTeams.AsNoTracking()
            .Where(entity => entity.CompanyId == companyId && IsActive(entity.Status))
            .OrderBy(entity => entity.TeamName)
            .Select(entity => new SalesTeamDto(entity.Id, entity.CompanyId ?? 0, entity.TeamCode, entity.TeamName, entity.DefaultTerritoryId, entity.Status))
            .ToArrayAsync(cancellationToken);
    }

    private async Task<string?> ResolveSalesOwnerNameAsync(long? userId, CancellationToken cancellationToken)
    {
        if (!userId.HasValue || userId.Value <= 0)
        {
            return null;
        }

        const string sql = """
            SELECT TOP (1) DisplayName
            FROM platform.AppUsers
            WHERE Id = @UserId AND Status IN (N'Active', N'Enabled')
            ORDER BY DisplayName;
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        return await connection.QueryFirstOrDefaultAsync<string?>(new CommandDefinition(sql, new { UserId = userId.Value }, cancellationToken: cancellationToken));
    }

    private static CommercialLongDefaultValue BuildLong(long? explicitValue, long? resolvedValue, string? display, string source)
    {
        var isOverridden = explicitValue.HasValue && explicitValue.Value > 0;
        var hasDefault = !isOverridden && resolvedValue.HasValue && resolvedValue.Value > 0;
        return new CommercialLongDefaultValue(
            resolvedValue,
            display,
            isOverridden ? "DocumentOverride" : hasDefault ? source : "NotConfigured",
            hasDefault,
            isOverridden);
    }

    private static CommercialStringDefaultValue BuildString(string? explicitValue, string? resolvedValue, string source)
    {
        var isOverridden = !string.IsNullOrWhiteSpace(explicitValue);
        var value = string.IsNullOrWhiteSpace(resolvedValue) ? null : resolvedValue.Trim();
        var hasDefault = !isOverridden && !string.IsNullOrWhiteSpace(value);
        return new CommercialStringDefaultValue(
            value,
            value,
            isOverridden ? "DocumentOverride" : hasDefault ? source : "NotConfigured",
            hasDefault,
            isOverridden);
    }

    private static async Task<(long? Value, string? Display)> ResolveDisplayAsync<TEntity>(
        IQueryable<TEntity> query,
        long companyId,
        long? id,
        System.Linq.Expressions.Expression<Func<TEntity, string>> displaySelector,
        CancellationToken cancellationToken)
        where TEntity : STS.Mfg.Domain.Abstractions.AuditableEntity, STS.Mfg.Domain.Abstractions.ICompanyScoped
    {
        if (!id.HasValue || id.Value <= 0)
        {
            return (null, null);
        }

        var display = await query
            .Where(entity => entity.Id == id.Value && entity.CompanyId == companyId)
            .Select(displaySelector)
            .FirstOrDefaultAsync(cancellationToken);
        return string.IsNullOrWhiteSpace(display) ? (null, null) : (id.Value, display);
    }

    private static bool IsActive(string? status) =>
        status is not null && (status.Equals("Active", StringComparison.OrdinalIgnoreCase) ||
                               status.Equals("Approved", StringComparison.OrdinalIgnoreCase) ||
                               status.Equals("Released", StringComparison.OrdinalIgnoreCase));
}
