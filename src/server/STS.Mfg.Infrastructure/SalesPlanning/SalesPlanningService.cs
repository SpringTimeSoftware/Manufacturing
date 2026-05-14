using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.SalesPlanning;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.SalesPlanning;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Procurement;
using STS.Mfg.Domain.Production;
using STS.Mfg.Domain.SalesPlanning;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.SalesPlanning;

internal sealed class SalesPlanningService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), ISalesPlanningService
{
    public async Task<PagedResult<QuoteDto>> ListQuotesAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Quotes.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyQuoteFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.QuoteDate).ThenBy(entity => entity.QuoteNo).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadQuoteLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapQuote(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<QuoteLineDto>())));
    }

    public async Task<QuoteDto> GetQuoteAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.Quotes.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Quote was not found in the active scope.", "sales.quote_not_found");
        var lines = await LoadQuoteLinesAsync(new[] { id }, cancellationToken);
        return MapQuote(entity, lines.GetValueOrDefault(id, Array.Empty<QuoteLineDto>()));
    }

    public async Task<QuoteDto> CreateQuoteAsync(QuoteUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateQuote(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var customerId = await ResolveCustomerIdAsync(request.CompanyId, request.CustomerId, request.CustomerCode, cancellationToken);
        var customerAddressId = await ResolveCustomerAddressIdAsync(request.CompanyId, customerId, request.CustomerAddressId, request.CustomerAddressCode, nameof(request.CustomerAddressCode), cancellationToken);

        var entity = Quote.Create(
            request.CompanyId,
            request.BranchId,
            request.QuoteNo,
            customerId,
            customerAddressId,
            request.QuoteDate,
            request.ExpiryDate,
            request.PriorityCode,
            request.Status,
            Normalize(request.CustomerSpecRef),
            GetUserId());

        DbContext.Quotes.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            var lines = new List<QuoteLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                var itemVariantId = await ResolveItemVariantIdAsync(request.CompanyId, itemId, line.ItemVariantId, line.ItemVariantCode, cancellationToken);
                lines.Add(QuoteLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    itemVariantId,
                    line.OrderUomId,
                    line.Quantity,
                    line.UnitPrice,
                    line.DiscountPercent,
                    line.TaxPercent,
                    line.MakeType,
                    line.PromisedDate,
                    line.PriorityCode,
                    Normalize(line.CustomerSpecRef),
                    line.Status,
                    GetUserId()));
            }

            DbContext.QuoteLines.AddRange(lines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetQuoteAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("sales", nameof(Quote), "quote.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<QuoteDto> UpdateQuoteAsync(long id, QuoteUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateQuote(request);

        var scope = GetScope();
        var entity = await DbContext.Quotes.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Quote was not found in the active scope.", "sales.quote_not_found");
        var customerId = await ResolveCustomerIdAsync(request.CompanyId, request.CustomerId, request.CustomerCode, cancellationToken);
        var customerAddressId = await ResolveCustomerAddressIdAsync(request.CompanyId, customerId, request.CustomerAddressId, request.CustomerAddressCode, nameof(request.CustomerAddressCode), cancellationToken);
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Quote company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Quote branch cannot be changed."),
            Immutable(entity.CustomerId, customerId, nameof(request.CustomerId), "Quote customer cannot be changed."),
            Immutable(entity.CustomerAddressId, customerAddressId, nameof(request.CustomerAddressId), "Quote address cannot be changed."));

        var before = await GetQuoteAsync(id, cancellationToken);
        entity.Update(request.QuoteNo, request.QuoteDate, request.ExpiryDate, request.PriorityCode, request.Status, Normalize(request.CustomerSpecRef), GetUserId());

        var existingLines = await DbContext.QuoteLines.Where(record => record.QuoteId == id).ToListAsync(cancellationToken);
        DbContext.QuoteLines.RemoveRange(existingLines);
        if (request.Lines.Count > 0)
        {
            var lines = new List<QuoteLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                var itemVariantId = await ResolveItemVariantIdAsync(request.CompanyId, itemId, line.ItemVariantId, line.ItemVariantCode, cancellationToken);
                lines.Add(QuoteLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    itemVariantId,
                    line.OrderUomId,
                    line.Quantity,
                    line.UnitPrice,
                    line.DiscountPercent,
                    line.TaxPercent,
                    line.MakeType,
                    line.PromisedDate,
                    line.PriorityCode,
                    Normalize(line.CustomerSpecRef),
                    line.Status,
                    GetUserId()));
            }

            DbContext.QuoteLines.AddRange(lines);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetQuoteAsync(id, cancellationToken);
        await WriteAuditAsync("sales", nameof(Quote), "quote.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<SalesOrderDto>> ListSalesOrdersAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.SalesOrders.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplySalesOrderFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.OrderDate).ThenBy(entity => entity.SalesOrderNo).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadSalesOrderLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapSalesOrder(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<SalesOrderLineDto>())));
    }

    public async Task<SalesOrderDto> GetSalesOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.SalesOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Sales order was not found in the active scope.", "sales.salesorder_not_found");
        var lines = await LoadSalesOrderLinesAsync(new[] { id }, cancellationToken);
        return MapSalesOrder(entity, lines.GetValueOrDefault(id, Array.Empty<SalesOrderLineDto>()));
    }

    public async Task<SalesOrderDto> CreateSalesOrderAsync(SalesOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSalesOrder(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var customerId = await ResolveCustomerIdAsync(request.CompanyId, request.CustomerId, request.CustomerCode, cancellationToken);
        var billToAddressId = await ResolveCustomerAddressIdAsync(request.CompanyId, customerId, request.BillToAddressId, request.BillToAddressCode, nameof(request.BillToAddressCode), cancellationToken);
        var shipToAddressId = await ResolveCustomerAddressIdAsync(request.CompanyId, customerId, request.ShipToAddressId, request.ShipToAddressCode, nameof(request.ShipToAddressCode), cancellationToken);

        var entity = SalesOrder.Create(
            request.CompanyId,
            request.BranchId,
            request.SalesOrderNo,
            customerId,
            billToAddressId,
            shipToAddressId,
            request.OrderDate,
            request.PromisedDate,
            request.PriorityCode,
            request.Status,
            request.SourceQuoteId,
            GetUserId());

        DbContext.SalesOrders.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            var lines = new List<SalesOrderLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                var itemVariantId = await ResolveItemVariantIdAsync(request.CompanyId, itemId, line.ItemVariantId, line.ItemVariantCode, cancellationToken);
                lines.Add(SalesOrderLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    itemVariantId,
                    line.OrderUomId,
                    line.Quantity,
                    line.MakeType,
                    line.PromisedDate,
                    line.PriorityCode,
                    Normalize(line.CustomerSpecRef),
                    line.RequestedShipDate,
                    line.Status,
                    GetUserId()));
            }

            DbContext.SalesOrderLines.AddRange(lines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetSalesOrderAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("sales", nameof(SalesOrder), "salesorder.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<SalesOrderDto> UpdateSalesOrderAsync(long id, SalesOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSalesOrder(request);

        var scope = GetScope();
        var entity = await DbContext.SalesOrders.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Sales order was not found in the active scope.", "sales.salesorder_not_found");
        var customerId = await ResolveCustomerIdAsync(request.CompanyId, request.CustomerId, request.CustomerCode, cancellationToken);
        var billToAddressId = await ResolveCustomerAddressIdAsync(request.CompanyId, customerId, request.BillToAddressId, request.BillToAddressCode, nameof(request.BillToAddressCode), cancellationToken);
        var shipToAddressId = await ResolveCustomerAddressIdAsync(request.CompanyId, customerId, request.ShipToAddressId, request.ShipToAddressCode, nameof(request.ShipToAddressCode), cancellationToken);
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Sales-order company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Sales-order branch cannot be changed."),
            Immutable(entity.CustomerId, customerId, nameof(request.CustomerId), "Sales-order customer cannot be changed."),
            Immutable(entity.BillToAddressId, billToAddressId, nameof(request.BillToAddressId), "Bill-to address cannot be changed."),
            Immutable(entity.ShipToAddressId, shipToAddressId, nameof(request.ShipToAddressId), "Ship-to address cannot be changed."),
            Immutable(entity.SourceQuoteId, request.SourceQuoteId, nameof(request.SourceQuoteId), "Source quote cannot be changed."));

        var before = await GetSalesOrderAsync(id, cancellationToken);
        entity.Update(request.SalesOrderNo, request.OrderDate, request.PromisedDate, request.PriorityCode, request.Status, GetUserId());

        var existingLines = await DbContext.SalesOrderLines.Where(record => record.SalesOrderId == id).ToListAsync(cancellationToken);
        DbContext.SalesOrderLines.RemoveRange(existingLines);
        if (request.Lines.Count > 0)
        {
            var lines = new List<SalesOrderLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                var itemVariantId = await ResolveItemVariantIdAsync(request.CompanyId, itemId, line.ItemVariantId, line.ItemVariantCode, cancellationToken);
                lines.Add(SalesOrderLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    itemVariantId,
                    line.OrderUomId,
                    line.Quantity,
                    line.MakeType,
                    line.PromisedDate,
                    line.PriorityCode,
                    Normalize(line.CustomerSpecRef),
                    line.RequestedShipDate,
                    line.Status,
                    GetUserId()));
            }

            DbContext.SalesOrderLines.AddRange(lines);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetSalesOrderAsync(id, cancellationToken);
        await WriteAuditAsync("sales", nameof(SalesOrder), "salesorder.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<BlanketOrderDto>> ListBlanketOrdersAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.BlanketOrders.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyBlanketOrderFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.StartDate).ThenBy(entity => entity.BlanketOrderNo).ToPagedResultAsync(filter, cancellationToken);
        var schedules = await LoadBlanketSchedulesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapBlanketOrder(entity, schedules.GetValueOrDefault(entity.Id, Array.Empty<BlanketOrderScheduleDto>())));
    }

    public async Task<BlanketOrderDto> GetBlanketOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.BlanketOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Blanket order was not found in the active scope.", "sales.blanketorder_not_found");
        var schedules = await LoadBlanketSchedulesAsync(new[] { id }, cancellationToken);
        return MapBlanketOrder(entity, schedules.GetValueOrDefault(id, Array.Empty<BlanketOrderScheduleDto>()));
    }

    public async Task<BlanketOrderDto> CreateBlanketOrderAsync(BlanketOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBlanketOrder(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var customerId = await ResolveCustomerIdAsync(request.CompanyId, request.CustomerId, request.CustomerCode, cancellationToken);

        var entity = BlanketOrder.Create(
            request.CompanyId,
            request.BranchId,
            request.BlanketOrderNo,
            customerId,
            request.StartDate,
            request.EndDate,
            request.Status,
            GetUserId());

        DbContext.BlanketOrders.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Schedules.Count > 0)
        {
            var schedules = new List<BlanketOrderSchedule>();
            foreach (var schedule in request.Schedules.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, schedule.ItemId, schedule.ItemCode, cancellationToken);
                schedules.Add(BlanketOrderSchedule.Create(
                    entity.Id,
                    schedule.LineNo,
                    itemId,
                    schedule.ScheduleDate,
                    schedule.Quantity,
                    schedule.OrderUomId,
                    schedule.Status,
                    GetUserId()));
            }

            DbContext.BlanketOrderSchedules.AddRange(schedules);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetBlanketOrderAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("sales", nameof(BlanketOrder), "blanketorder.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<BlanketOrderDto> UpdateBlanketOrderAsync(long id, BlanketOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBlanketOrder(request);

        var scope = GetScope();
        var entity = await DbContext.BlanketOrders.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Blanket order was not found in the active scope.", "sales.blanketorder_not_found");
        var customerId = await ResolveCustomerIdAsync(request.CompanyId, request.CustomerId, request.CustomerCode, cancellationToken);
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Blanket-order company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Blanket-order branch cannot be changed."),
            Immutable(entity.CustomerId, customerId, nameof(request.CustomerId), "Blanket-order customer cannot be changed."));

        var before = await GetBlanketOrderAsync(id, cancellationToken);
        entity.Update(request.BlanketOrderNo, request.StartDate, request.EndDate, request.Status, GetUserId());

        var existingSchedules = await DbContext.BlanketOrderSchedules.Where(record => record.BlanketOrderId == id).ToListAsync(cancellationToken);
        DbContext.BlanketOrderSchedules.RemoveRange(existingSchedules);
        if (request.Schedules.Count > 0)
        {
            var schedules = new List<BlanketOrderSchedule>();
            foreach (var schedule in request.Schedules.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, schedule.ItemId, schedule.ItemCode, cancellationToken);
                schedules.Add(BlanketOrderSchedule.Create(
                    entity.Id,
                    schedule.LineNo,
                    itemId,
                    schedule.ScheduleDate,
                    schedule.Quantity,
                    schedule.OrderUomId,
                    schedule.Status,
                    GetUserId()));
            }

            DbContext.BlanketOrderSchedules.AddRange(schedules);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetBlanketOrderAsync(id, cancellationToken);
        await WriteAuditAsync("sales", nameof(BlanketOrder), "blanketorder.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<DemandForecastDto>> ListDemandForecastsAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.DemandForecasts.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyForecastFilters(query, filter);

        var page = await query.OrderBy(entity => entity.ForecastCode).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadForecastLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapForecast(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<DemandForecastLineDto>())));
    }

    public async Task<DemandForecastDto> GetDemandForecastAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.DemandForecasts.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Forecast was not found in the active scope.", "planning.forecast_not_found");
        var lines = await LoadForecastLinesAsync(new[] { id }, cancellationToken);
        return MapForecast(entity, lines.GetValueOrDefault(id, Array.Empty<DemandForecastLineDto>()));
    }

    public async Task<DemandForecastDto> CreateDemandForecastAsync(DemandForecastUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateForecast(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = DemandForecast.Create(request.CompanyId, request.BranchId, request.ForecastCode, request.ForecastName, request.PeriodType, request.Status, GetUserId());
        DbContext.DemandForecasts.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            var lines = new List<DemandForecastLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(DemandForecastLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.ForecastPeriodStart,
                    line.ForecastPeriodEnd,
                    line.Quantity,
                    line.ForecastUomId,
                    GetUserId()));
            }

            DbContext.DemandForecastLines.AddRange(lines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetDemandForecastAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("planning", nameof(DemandForecast), "forecast.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<DemandForecastDto> UpdateDemandForecastAsync(long id, DemandForecastUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateForecast(request);

        var scope = GetScope();
        var entity = await DbContext.DemandForecasts.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Forecast was not found in the active scope.", "planning.forecast_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Forecast company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Forecast branch cannot be changed."));

        var before = await GetDemandForecastAsync(id, cancellationToken);
        entity.Update(request.ForecastCode, request.ForecastName, request.PeriodType, request.Status, GetUserId());

        var existingLines = await DbContext.DemandForecastLines.Where(record => record.DemandForecastId == id).ToListAsync(cancellationToken);
        DbContext.DemandForecastLines.RemoveRange(existingLines);
        if (request.Lines.Count > 0)
        {
            var lines = new List<DemandForecastLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(DemandForecastLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.ForecastPeriodStart,
                    line.ForecastPeriodEnd,
                    line.Quantity,
                    line.ForecastUomId,
                    GetUserId()));
            }

            DbContext.DemandForecastLines.AddRange(lines);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetDemandForecastAsync(id, cancellationToken);
        await WriteAuditAsync("planning", nameof(DemandForecast), "forecast.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<MasterProductionScheduleDto>> ListMpsAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.MasterProductionSchedules.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyMpsFilters(query, filter);

        var page = await query.OrderBy(entity => entity.MpsCode).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadMpsLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapMps(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<MpsLineDto>())));
    }

    public async Task<MasterProductionScheduleDto> GetMpsAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.MasterProductionSchedules.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "MPS was not found in the active scope.", "planning.mps_not_found");
        var lines = await LoadMpsLinesAsync(new[] { id }, cancellationToken);
        return MapMps(entity, lines.GetValueOrDefault(id, Array.Empty<MpsLineDto>()));
    }

    public async Task<MasterProductionScheduleDto> CreateMpsAsync(MasterProductionScheduleUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMps(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = MasterProductionSchedule.Create(
            request.CompanyId,
            request.BranchId,
            request.MpsCode,
            request.PlanningHorizonStart,
            request.PlanningHorizonEnd,
            request.Status,
            GetUserId());

        DbContext.MasterProductionSchedules.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            var lines = new List<MpsLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(MpsLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.PeriodStart,
                    line.PeriodEnd,
                    line.PlannedQuantity,
                    line.PlanningUomId,
                    GetUserId()));
            }

            DbContext.MpsLines.AddRange(lines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetMpsAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("planning", nameof(MasterProductionSchedule), "mps.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<MasterProductionScheduleDto> UpdateMpsAsync(long id, MasterProductionScheduleUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMps(request);

        var scope = GetScope();
        var entity = await DbContext.MasterProductionSchedules.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "MPS was not found in the active scope.", "planning.mps_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "MPS company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "MPS branch cannot be changed."));

        var before = await GetMpsAsync(id, cancellationToken);
        entity.Update(request.MpsCode, request.PlanningHorizonStart, request.PlanningHorizonEnd, request.Status, GetUserId());

        var existingLines = await DbContext.MpsLines.Where(record => record.MasterProductionScheduleId == id).ToListAsync(cancellationToken);
        DbContext.MpsLines.RemoveRange(existingLines);
        if (request.Lines.Count > 0)
        {
            var lines = new List<MpsLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(MpsLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.PeriodStart,
                    line.PeriodEnd,
                    line.PlannedQuantity,
                    line.PlanningUomId,
                    GetUserId()));
            }

            DbContext.MpsLines.AddRange(lines);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetMpsAsync(id, cancellationToken);
        await WriteAuditAsync("planning", nameof(MasterProductionSchedule), "mps.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<MrpRunDto>> ListMrpRunsAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.MrpRuns.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyMrpFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.RunStartedOn).ThenBy(entity => entity.RunCode).ToPagedResultAsync(filter, cancellationToken);
        var items = await LoadMrpItemsAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapMrpRun(entity, items.GetValueOrDefault(entity.Id, Array.Empty<MrpRunItemDto>())));
    }

    public async Task<MrpRunDto> GetMrpRunAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.MrpRuns.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "MRP run was not found in the active scope.", "planning.mrp_not_found");
        var items = await LoadMrpItemsAsync(new[] { id }, cancellationToken);
        return MapMrpRun(entity, items.GetValueOrDefault(id, Array.Empty<MrpRunItemDto>()));
    }

    public async Task<MrpRunDto> StartMrpRunAsync(MrpRunStartRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMrpRun(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var startedOn = DateTimeOffset.UtcNow;
        var entity = MrpRun.Create(
            request.CompanyId,
            request.BranchId,
            request.RunCode,
            request.RunType,
            request.TriggeredFromMpsId,
            request.PlanningHorizonStart,
            request.PlanningHorizonEnd,
            "Completed",
            startedOn,
            startedOn,
            GetUserId());

        DbContext.MrpRuns.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.TriggeredFromMpsId.HasValue)
        {
            var mpsLines = await DbContext.MpsLines.AsNoTracking()
                .Where(record => record.MasterProductionScheduleId == request.TriggeredFromMpsId.Value)
                .GroupBy(record => new { record.ItemId })
                .Select(group => new { group.Key.ItemId, Quantity = group.Sum(item => item.PlannedQuantity) })
                .ToListAsync(cancellationToken);

            if (mpsLines.Count > 0)
            {
                DbContext.MrpRunItems.AddRange(mpsLines.Select(line => MrpRunItem.Create(
                    entity.Id,
                    line.ItemId,
                    "Mps",
                    line.Quantity,
                    line.Quantity,
                    0m,
                    "PlanOrder",
                    null,
                    GetUserId())));
                await DbContext.SaveChangesAsync(cancellationToken);
            }
        }

        var dto = await GetMrpRunAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("planning", nameof(MrpRun), "mrp.start", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<BoqRequirementDto>> ListBoqRequirementsAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.BoqRequirements.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyBoqFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadBoqLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapBoq(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<BoqRequirementLineDto>())));
    }

    public async Task<BoqRequirementDto> GetBoqRequirementAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.BoqRequirements.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "BOQ requirement was not found in the active scope.", "planning.boq_not_found");
        var lines = await LoadBoqLinesAsync(new[] { id }, cancellationToken);
        return MapBoq(entity, lines.GetValueOrDefault(id, Array.Empty<BoqRequirementLineDto>()));
    }

    public async Task<BoqRequirementDto> CreateBoqRequirementAsync(BoqRequirementUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBoq(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = BoqRequirement.Create(
            request.CompanyId,
            request.BranchId,
            request.MrpRunId,
            request.SourceDocumentType,
            request.SourceDocumentId,
            request.Status,
            GetUserId());

        DbContext.BoqRequirements.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            var lines = new List<BoqRequirementLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(BoqRequirementLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.RequiredQuantity,
                    line.RequirementUomId,
                    line.NeedByDate,
                    line.RecommendedAction,
                    Normalize(line.ApprovedAction),
                    Normalize(line.OverrideReasonCode),
                    line.OverriddenByUserId,
                    line.Status,
                    GetUserId()));
            }

            DbContext.BoqRequirementLines.AddRange(lines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetBoqRequirementAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("planning", nameof(BoqRequirement), "boq.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<BoqRequirementDto> UpdateBoqRequirementAsync(long id, BoqRequirementUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBoq(request);

        var scope = GetScope();
        var entity = await DbContext.BoqRequirements.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "BOQ requirement was not found in the active scope.", "planning.boq_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "BOQ company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "BOQ branch cannot be changed."),
            Immutable(entity.MrpRunId, request.MrpRunId, nameof(request.MrpRunId), "BOQ MRP run cannot be changed."),
            Immutable(entity.SourceDocumentType, request.SourceDocumentType, nameof(request.SourceDocumentType), "BOQ source document type cannot be changed."),
            Immutable(entity.SourceDocumentId, request.SourceDocumentId, nameof(request.SourceDocumentId), "BOQ source document cannot be changed."));

        var before = await GetBoqRequirementAsync(id, cancellationToken);
        entity.Update(request.SourceDocumentType, request.Status, GetUserId());

        var existingLines = await DbContext.BoqRequirementLines.Where(record => record.BoqRequirementId == id).ToListAsync(cancellationToken);
        DbContext.BoqRequirementLines.RemoveRange(existingLines);
        if (request.Lines.Count > 0)
        {
            var lines = new List<BoqRequirementLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(BoqRequirementLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.RequiredQuantity,
                    line.RequirementUomId,
                    line.NeedByDate,
                    line.RecommendedAction,
                    Normalize(line.ApprovedAction),
                    Normalize(line.OverrideReasonCode),
                    line.OverriddenByUserId,
                    line.Status,
                    GetUserId()));
            }

            DbContext.BoqRequirementLines.AddRange(lines);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetBoqRequirementAsync(id, cancellationToken);
        await WriteAuditAsync("planning", nameof(BoqRequirement), "boq.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<BoqRequirementLineDto> ApproveBoqLineAsync(long boqRequirementId, long lineId, BoqLineActionRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(Required(request.ApprovedAction, nameof(request.ApprovedAction), "Approved action is required."));

        var scope = GetScope();
        var boq = await DbContext.BoqRequirements.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == boqRequirementId, cancellationToken);

        boq = EnsureFound(boq, "BOQ requirement was not found in the active scope.", "planning.boq_not_found");

        var line = await DbContext.BoqRequirementLines.FirstOrDefaultAsync(record => record.Id == lineId && record.BoqRequirementId == boqRequirementId, cancellationToken);
        line = EnsureFound(line, "BOQ line was not found.", "planning.boq_line_not_found");

        var before = MapBoqLine(line);
        line.Update(line.RequiredQuantity, line.NeedByDate, line.RecommendedAction, request.ApprovedAction, Normalize(request.OverrideReasonCode), GetUserId(), "Reviewed", GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapBoqLine(line);
        await WriteAuditAsync("planning", nameof(BoqRequirementLine), "boqline.approve", line.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<BoqRequirementLineDto> ConvertBoqLineAsync(long boqRequirementId, long lineId, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var boq = await DbContext.BoqRequirements.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == boqRequirementId, cancellationToken);

        boq = EnsureFound(boq, "BOQ requirement was not found in the active scope.", "planning.boq_not_found");

        var line = await DbContext.BoqRequirementLines.FirstOrDefaultAsync(record => record.Id == lineId && record.BoqRequirementId == boqRequirementId, cancellationToken);
        line = EnsureFound(line, "BOQ line was not found.", "planning.boq_line_not_found");

        var before = MapBoqLine(line);
        line.Update(
            line.RequiredQuantity,
            line.NeedByDate,
            line.RecommendedAction,
            Normalize(line.ApprovedAction) ?? line.RecommendedAction,
            line.OverrideReasonCode,
            GetUserId(),
            "Converted",
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapBoqLine(line);
        await WriteAuditAsync("planning", nameof(BoqRequirementLine), "boqline.convert", line.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<IReadOnlyCollection<BoqRequirementLineDto>> ConvertReviewedBoqLinesAsync(long boqRequirementId, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var boq = await DbContext.BoqRequirements.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == boqRequirementId, cancellationToken);

        boq = EnsureFound(boq, "BOQ requirement was not found in the active scope.", "planning.boq_not_found");

        var lines = await DbContext.BoqRequirementLines
            .Where(record => record.BoqRequirementId == boqRequirementId && record.Status == "Reviewed")
            .OrderBy(record => record.LineNo)
            .ToListAsync(cancellationToken);

        if (lines.Count == 0)
        {
            return Array.Empty<BoqRequirementLineDto>();
        }

        var converted = new List<BoqRequirementLineDto>(lines.Count);
        foreach (var line in lines)
        {
            var before = MapBoqLine(line);
            line.Update(
                line.RequiredQuantity,
                line.NeedByDate,
                line.RecommendedAction,
                Normalize(line.ApprovedAction) ?? line.RecommendedAction,
                line.OverrideReasonCode,
                GetUserId(),
                "Converted",
                GetUserId());

            var after = MapBoqLine(line);
            converted.Add(after);
            await WriteAuditAsync("planning", nameof(BoqRequirementLine), "boqline.convert.bulk", line.Id, before, after, cancellationToken);
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        return converted;
    }

    public async Task<PagedResult<PlanningPlanDto>> ListPlanningPlansAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.PlanningPlans.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyPlanningPlanFilters(query, filter);
        var page = await query.OrderByDescending(entity => entity.ModifiedOn).ThenBy(entity => entity.PlanCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapPlanningPlan);
    }

    public async Task<PlanningPlanDto> GetPlanningPlanAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.PlanningPlans.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Planning plan was not found in the active scope.", "planning.plan_not_found");
        return MapPlanningPlan(entity);
    }

    public async Task<PlanningPlanDto> CreatePlanningPlanAsync(PlanningPlanUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePlanningPlan(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = PlanningPlan.Create(
            request.CompanyId,
            request.BranchId,
            request.PlanCode,
            request.PlanName,
            request.PlanType,
            request.HorizonStart,
            request.HorizonEnd,
            request.FirmFenceDays,
            request.ForecastFenceDays,
            request.IncludeForecast,
            request.IncludeCapacity,
            request.Status,
            GetUserId());

        DbContext.PlanningPlans.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapPlanningPlan(entity);
        await WriteAuditAsync("planning", nameof(PlanningPlan), "plan.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PlanningPlanDto> UpdatePlanningPlanAsync(long id, PlanningPlanUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePlanningPlan(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var scope = GetScope();
        var entity = await DbContext.PlanningPlans.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Planning plan was not found in the active scope.", "planning.plan_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId, request.CompanyId, nameof(request.CompanyId), "Planning plan company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Planning plan branch cannot be changed."));

        var before = MapPlanningPlan(entity);
        entity.Update(request.PlanCode, request.PlanName, request.PlanType, request.HorizonStart, request.HorizonEnd, request.FirmFenceDays, request.ForecastFenceDays, request.IncludeForecast, request.IncludeCapacity, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapPlanningPlan(entity);
        await WriteAuditAsync("planning", nameof(PlanningPlan), "plan.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<PlanningSnapshotDto>> ListPlanningSnapshotsAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.PlanningSnapshots.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyPlanningSnapshotFilters(query, filter);
        var page = await query.OrderByDescending(entity => entity.CapturedOn).ThenBy(entity => entity.SnapshotCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapPlanningSnapshot);
    }

    public async Task<PlanningSnapshotDto> CreatePlanningSnapshotAsync(PlanningSnapshotCreateRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePlanningSnapshot(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = PlanningSnapshot.Create(
            request.CompanyId,
            request.BranchId,
            request.PlanningPlanId,
            request.MrpRunId,
            request.SnapshotCode,
            request.SnapshotType,
            request.InputHash,
            request.OutputHash,
            request.DemandLineCount,
            request.SupplyLineCount,
            request.ExceptionCount,
            request.PlannedQuantity,
            request.Status,
            GetUserId());

        DbContext.PlanningSnapshots.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapPlanningSnapshot(entity);
        await WriteAuditAsync("planning", nameof(PlanningSnapshot), "snapshot.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<PlannedOrderDto>> ListPlannedOrdersAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.PlannedOrders.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyPlannedOrderFilters(query, filter);
        var page = await query.OrderBy(entity => entity.PlannedDueDate).ThenBy(entity => entity.PlannedOrderNo).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapPlannedOrder);
    }

    public async Task<PlannedOrderDto> GetPlannedOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.PlannedOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Planned order was not found in the active scope.", "planning.planned_order_not_found");
        return MapPlannedOrder(entity);
    }

    public async Task<PlannedOrderDto> CreatePlannedOrderAsync(PlannedOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePlannedOrder(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var itemId = await ResolveItemIdAsync(request.CompanyId, request.ItemId, request.ItemCode, cancellationToken);

        var entity = PlannedOrder.Create(
            request.CompanyId,
            request.BranchId,
            request.PlanningPlanId,
            request.MrpRunId,
            request.BoqRequirementLineId,
            request.PlannedOrderNo,
            request.OrderType,
            itemId,
            request.Quantity,
            request.UomId,
            request.PlannedStartDate,
            request.PlannedDueDate,
            request.SourceWarehouseId,
            request.TargetWarehouseId,
            request.BomRevisionId,
            request.RoutingId,
            request.IsFirm,
            request.IsExpedite,
            request.PeggingSourceType,
            request.PeggingSourceId,
            request.Status,
            GetUserId());

        DbContext.PlannedOrders.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapPlannedOrder(entity);
        await WriteAuditAsync("planning", nameof(PlannedOrder), "plannedorder.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PlannedOrderDto> UpdatePlannedOrderAsync(long id, PlannedOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePlannedOrder(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var itemId = await ResolveItemIdAsync(request.CompanyId, request.ItemId, request.ItemCode, cancellationToken);

        var scope = GetScope();
        var entity = await DbContext.PlannedOrders.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Planned order was not found in the active scope.", "planning.planned_order_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId, request.CompanyId, nameof(request.CompanyId), "Planned order company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Planned order branch cannot be changed."));

        var before = MapPlannedOrder(entity);
        entity.Update(request.PlannedOrderNo, request.OrderType, itemId, request.Quantity, request.UomId, request.PlannedStartDate, request.PlannedDueDate, request.SourceWarehouseId, request.TargetWarehouseId, request.BomRevisionId, request.RoutingId, request.IsFirm, request.IsExpedite, request.PeggingSourceType, request.PeggingSourceId, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapPlannedOrder(entity);
        await WriteAuditAsync("planning", nameof(PlannedOrder), "plannedorder.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PlannedOrderDto> FirmPlannedOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.PlannedOrders.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Planned order was not found in the active scope.", "planning.planned_order_not_found");
        var before = MapPlannedOrder(entity);
        entity.Firm(GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapPlannedOrder(entity);
        await WriteAuditAsync("planning", nameof(PlannedOrder), "plannedorder.firm", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PlannedOrderConversionResultDto> ConvertPlannedOrderToPurchaseRequisitionAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.PlannedOrders.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Planned order was not found in the active scope.", "planning.planned_order_not_found");
        ThrowIfInvalid(
            entity.OrderType.Equals("Purchase", StringComparison.OrdinalIgnoreCase) ? null : new ApiError("validation.invalid_state", nameof(entity.OrderType), "Only purchase planned orders can convert to purchase requisitions."),
            entity.TargetDocumentId.HasValue ? new ApiError("validation.invalid_state", nameof(entity.Status), "Planned order is already converted.") : null);

        var before = MapPlannedOrder(entity);
        var requisitionNo = $"PR-PLAN-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
        var requisition = PurchaseRequisition.Create(entity.CompanyId ?? 0, entity.BranchId ?? 0, requisitionNo, "PlannedOrder", entity.Id, "Draft", GetUserId());
        DbContext.PurchaseRequisitions.Add(requisition);
        await DbContext.SaveChangesAsync(cancellationToken);

        DbContext.PurchaseRequisitionLines.Add(PurchaseRequisitionLine.Create(
            requisition.Id,
            10,
            entity.ItemId,
            entity.Quantity,
            entity.UomId,
            entity.PlannedDueDate,
            entity.BoqRequirementLineId,
            null,
            "Draft",
            GetUserId()));

        entity.MarkConverted("PurchaseRequisition", requisition.Id, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapPlannedOrder(entity);
        await WriteAuditAsync("planning", nameof(PlannedOrder), "plannedorder.convert.pr", entity.Id, before, after, cancellationToken);
        return new(entity.Id, "PurchaseRequisition", requisition.Id, requisition.PurchaseRequisitionNo, entity.Status);
    }

    public async Task<PlannedOrderConversionResultDto> ConvertPlannedOrderToWorkOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.PlannedOrders.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Planned order was not found in the active scope.", "planning.planned_order_not_found");
        ThrowIfInvalid(
            entity.OrderType.Equals("Make", StringComparison.OrdinalIgnoreCase) ? null : new ApiError("validation.invalid_state", nameof(entity.OrderType), "Only make planned orders can convert to work orders."),
            !entity.BomRevisionId.HasValue || entity.BomRevisionId.Value <= 0 ? new ApiError("validation.required", nameof(entity.BomRevisionId), "Released BOM revision is required before converting to a work order.") : null,
            entity.TargetDocumentId.HasValue ? new ApiError("validation.invalid_state", nameof(entity.Status), "Planned order is already converted.") : null);

        var before = MapPlannedOrder(entity);
        var workOrderNo = $"WO-PLAN-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}";
        var workOrder = WorkOrder.Create(
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            workOrderNo,
            null,
            entity.ItemId,
            entity.BomRevisionId ?? 0,
            entity.RoutingId,
            entity.Quantity,
            entity.UomId,
            entity.PlannedStartDate,
            entity.PlannedDueDate,
            "Draft",
            $"Created from planned order {entity.PlannedOrderNo}.",
            GetUserId());

        DbContext.WorkOrders.Add(workOrder);
        await DbContext.SaveChangesAsync(cancellationToken);

        entity.MarkConverted("WorkOrder", workOrder.Id, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapPlannedOrder(entity);
        await WriteAuditAsync("planning", nameof(PlannedOrder), "plannedorder.convert.wo", entity.Id, before, after, cancellationToken);
        return new(entity.Id, "WorkOrder", workOrder.Id, workOrder.WorkOrderNo, entity.Status);
    }

    public async Task<PagedResult<ShortageActionDto>> ListShortageActionsAsync(SalesFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.ShortageActions.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyShortageActionFilters(query, filter);
        var page = await query.OrderBy(entity => entity.DueDate).ThenBy(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapShortageAction);
    }

    public async Task<ShortageActionDto> CreateShortageActionAsync(ShortageActionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateShortageAction(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var itemId = await ResolveItemIdAsync(request.CompanyId, request.ItemId, request.ItemCode, cancellationToken);

        var entity = ShortageAction.Create(request.CompanyId, request.BranchId, request.PlannedOrderId, request.MrpRunItemId, itemId, request.ShortageQuantity, request.ActionType, request.OwnerUserId, request.DueDate, request.ReasonCode, request.Status, request.ResolutionNote, GetUserId());
        DbContext.ShortageActions.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapShortageAction(entity);
        await WriteAuditAsync("planning", nameof(ShortageAction), "shortageaction.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ShortageActionDto> UpdateShortageActionAsync(long id, ShortageActionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateShortageAction(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var itemId = await ResolveItemIdAsync(request.CompanyId, request.ItemId, request.ItemCode, cancellationToken);

        var scope = GetScope();
        var entity = await DbContext.ShortageActions.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Shortage action was not found in the active scope.", "planning.shortage_action_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId, request.CompanyId, nameof(request.CompanyId), "Shortage action company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Shortage action branch cannot be changed."));

        var before = MapShortageAction(entity);
        entity.Update(itemId, request.ShortageQuantity, request.ActionType, request.OwnerUserId, request.DueDate, request.ReasonCode, request.Status, request.ResolutionNote, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapShortageAction(entity);
        await WriteAuditAsync("planning", nameof(ShortageAction), "shortageaction.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    private static IQueryable<Quote> ApplyQuoteFilters(IQueryable<Quote> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.QuoteNo.Contains(search) || entity.PriorityCode.Contains(search) || (entity.CustomerSpecRef != null && entity.CustomerSpecRef.Contains(search)));
        }

        return query;
    }

    private static IQueryable<SalesOrder> ApplySalesOrderFilters(IQueryable<SalesOrder> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.SalesOrderNo.Contains(search) || entity.PriorityCode.Contains(search));
        }

        return query;
    }

    private static IQueryable<BlanketOrder> ApplyBlanketOrderFilters(IQueryable<BlanketOrder> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.BlanketOrderNo.Contains(search));
        }

        return query;
    }

    private static IQueryable<DemandForecast> ApplyForecastFilters(IQueryable<DemandForecast> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ForecastCode.Contains(search) || entity.ForecastName.Contains(search) || entity.PeriodType.Contains(search));
        }

        return query;
    }

    private static IQueryable<MasterProductionSchedule> ApplyMpsFilters(IQueryable<MasterProductionSchedule> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.MpsCode.Contains(search));
        }

        return query;
    }

    private static IQueryable<MrpRun> ApplyMrpFilters(IQueryable<MrpRun> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.RunCode.Contains(search) || entity.RunType.Contains(search));
        }

        return query;
    }

    private static IQueryable<BoqRequirement> ApplyBoqFilters(IQueryable<BoqRequirement> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.SourceDocumentType.Contains(search));
        }

        return query;
    }

    private static IQueryable<PlanningPlan> ApplyPlanningPlanFilters(IQueryable<PlanningPlan> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.PlanCode.Contains(search) || entity.PlanName.Contains(search) || entity.PlanType.Contains(search));
        }

        return query;
    }

    private static IQueryable<PlanningSnapshot> ApplyPlanningSnapshotFilters(IQueryable<PlanningSnapshot> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.SnapshotCode.Contains(search) || entity.SnapshotType.Contains(search) || entity.InputHash.Contains(search) || entity.OutputHash.Contains(search));
        }

        return query;
    }

    private static IQueryable<PlannedOrder> ApplyPlannedOrderFilters(IQueryable<PlannedOrder> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.PlannedOrderNo.Contains(search) || entity.OrderType.Contains(search) || entity.PeggingSourceType.Contains(search));
        }

        return query;
    }

    private static IQueryable<ShortageAction> ApplyShortageActionFilters(IQueryable<ShortageAction> query, SalesFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ActionType.Contains(search) || entity.ReasonCode.Contains(search) || entity.ResolutionNote.Contains(search));
        }

        return query;
    }

    private static void ValidateQuote(QuoteUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            request.CustomerId > 0 || !string.IsNullOrWhiteSpace(request.CustomerCode)
                ? null
                : new ApiError("validation.required", nameof(request.CustomerId), "Customer id or customer code is required."),
            Required(request.QuoteNo, nameof(request.QuoteNo), "Quote number is required."),
            Required(request.PriorityCode, nameof(request.PriorityCode), "Priority code is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Quote line numbers must be unique."));
        }

        errors.AddRange(request.Lines.SelectMany(ValidateQuoteLine));
        ThrowIfInvalid(errors);
    }

    private static IEnumerable<ApiError?> ValidateQuoteLine(QuoteLineUpsertRequest request)
    {
        yield return request.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(request.LineNo), "Line number must be greater than zero.") : null;
        yield return request.ItemId > 0 || !string.IsNullOrWhiteSpace(request.ItemCode)
            ? null
            : new ApiError("validation.required", nameof(request.ItemId), "Item id or item code is required.");
        yield return Positive(request.OrderUomId, nameof(request.OrderUomId), "Order UOM is required.");
        yield return Positive(request.Quantity, nameof(request.Quantity), "Quantity must be greater than zero.");
        yield return request.UnitPrice < 0 ? new ApiError("validation.out_of_range", nameof(request.UnitPrice), "Unit price cannot be negative.") : null;
        yield return request.DiscountPercent is < 0 or > 100 ? new ApiError("validation.out_of_range", nameof(request.DiscountPercent), "Discount percent must be between 0 and 100.") : null;
        yield return request.TaxPercent is < 0 or > 100 ? new ApiError("validation.out_of_range", nameof(request.TaxPercent), "Tax percent must be between 0 and 100.") : null;
        yield return Required(request.MakeType, nameof(request.MakeType), "Make type is required.");
        yield return Required(request.PriorityCode, nameof(request.PriorityCode), "Priority code is required.");
        yield return Required(request.Status, nameof(request.Status), "Status is required.");
    }

    private static void ValidateSalesOrder(SalesOrderUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            request.CustomerId > 0 || !string.IsNullOrWhiteSpace(request.CustomerCode)
                ? null
                : new ApiError("validation.required", nameof(request.CustomerId), "Customer id or customer code is required."),
            Required(request.SalesOrderNo, nameof(request.SalesOrderNo), "Sales-order number is required."),
            Required(request.PriorityCode, nameof(request.PriorityCode), "Priority code is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Sales-order line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.OrderUomId, nameof(line.OrderUomId), "Order UOM is required."));
            errors.Add(Positive(line.Quantity, nameof(line.Quantity), "Quantity must be greater than zero."));
            errors.Add(Required(line.MakeType, nameof(line.MakeType), "Make type is required."));
            errors.Add(Required(line.PriorityCode, nameof(line.PriorityCode), "Priority code is required."));
            errors.Add(Required(line.Status, nameof(line.Status), "Status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateBlanketOrder(BlanketOrderUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            request.CustomerId > 0 || !string.IsNullOrWhiteSpace(request.CustomerCode)
                ? null
                : new ApiError("validation.required", nameof(request.CustomerId), "Customer id or customer code is required."),
            Required(request.BlanketOrderNo, nameof(request.BlanketOrderNo), "Blanket-order number is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Schedules.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Schedules), "Blanket-order schedules must have unique line numbers."));
        }

        foreach (var line in request.Schedules)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.OrderUomId, nameof(line.OrderUomId), "Order UOM is required."));
            errors.Add(Positive(line.Quantity, nameof(line.Quantity), "Quantity must be greater than zero."));
            errors.Add(Required(line.Status, nameof(line.Status), "Status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateForecast(DemandForecastUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.ForecastCode, nameof(request.ForecastCode), "Forecast code is required."),
            Required(request.ForecastName, nameof(request.ForecastName), "Forecast name is required."),
            Required(request.PeriodType, nameof(request.PeriodType), "Period type is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Forecast line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.ForecastUomId, nameof(line.ForecastUomId), "Forecast UOM is required."));
            errors.Add(Positive(line.Quantity, nameof(line.Quantity), "Quantity must be greater than zero."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateMps(MasterProductionScheduleUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.MpsCode, nameof(request.MpsCode), "MPS code is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "MPS line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.PlanningUomId, nameof(line.PlanningUomId), "Planning UOM is required."));
            errors.Add(Positive(line.PlannedQuantity, nameof(line.PlannedQuantity), "Planned quantity must be greater than zero."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateMrpRun(MrpRunStartRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.RunCode, nameof(request.RunCode), "Run code is required."),
            Required(request.RunType, nameof(request.RunType), "Run type is required."));

    private static void ValidateBoq(BoqRequirementUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.SourceDocumentType, nameof(request.SourceDocumentType), "Source document type is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "BOQ line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.RequirementUomId, nameof(line.RequirementUomId), "Requirement UOM is required."));
            errors.Add(Positive(line.RequiredQuantity, nameof(line.RequiredQuantity), "Required quantity must be greater than zero."));
            errors.Add(Required(line.RecommendedAction, nameof(line.RecommendedAction), "Recommended action is required."));
            errors.Add(Required(line.Status, nameof(line.Status), "Status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidatePlanningPlan(PlanningPlanUpsertRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.PlanCode, nameof(request.PlanCode), "Plan code is required."),
            Required(request.PlanName, nameof(request.PlanName), "Plan name is required."),
            Required(request.PlanType, nameof(request.PlanType), "Plan type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            request.HorizonEnd < request.HorizonStart ? new ApiError("validation.out_of_range", nameof(request.HorizonEnd), "Plan horizon end must be on or after start.") : null,
            NonNegative(request.FirmFenceDays, nameof(request.FirmFenceDays), "Firm fence days cannot be negative."),
            NonNegative(request.ForecastFenceDays, nameof(request.ForecastFenceDays), "Forecast fence days cannot be negative."));
    }

    private static void ValidatePlanningSnapshot(PlanningSnapshotCreateRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.SnapshotCode, nameof(request.SnapshotCode), "Snapshot code is required."),
            Required(request.SnapshotType, nameof(request.SnapshotType), "Snapshot type is required."),
            Required(request.InputHash, nameof(request.InputHash), "Input hash is required."),
            Required(request.OutputHash, nameof(request.OutputHash), "Output hash is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.DemandLineCount, nameof(request.DemandLineCount), "Demand line count cannot be negative."),
            NonNegative(request.SupplyLineCount, nameof(request.SupplyLineCount), "Supply line count cannot be negative."),
            NonNegative(request.ExceptionCount, nameof(request.ExceptionCount), "Exception count cannot be negative."),
            NonNegative(request.PlannedQuantity, nameof(request.PlannedQuantity), "Planned quantity cannot be negative."));
    }

    private static void ValidatePlannedOrder(PlannedOrderUpsertRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.PlannedOrderNo, nameof(request.PlannedOrderNo), "Planned order number is required."),
            Required(request.OrderType, nameof(request.OrderType), "Order type is required."),
            request.ItemId > 0 || !string.IsNullOrWhiteSpace(request.ItemCode) ? null : new ApiError("validation.required", nameof(request.ItemId), "Item id or item code is required."),
            Positive(request.Quantity, nameof(request.Quantity), "Quantity must be greater than zero."),
            Positive(request.UomId, nameof(request.UomId), "UOM is required."),
            request.PlannedDueDate < request.PlannedStartDate ? new ApiError("validation.out_of_range", nameof(request.PlannedDueDate), "Planned due date must be on or after start date.") : null,
            Required(request.PeggingSourceType, nameof(request.PeggingSourceType), "Pegging source type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));
    }

    private static void ValidateShortageAction(ShortageActionUpsertRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            request.ItemId > 0 || !string.IsNullOrWhiteSpace(request.ItemCode) ? null : new ApiError("validation.required", nameof(request.ItemId), "Item id or item code is required."),
            Positive(request.ShortageQuantity, nameof(request.ShortageQuantity), "Shortage quantity must be greater than zero."),
            Required(request.ActionType, nameof(request.ActionType), "Action type is required."),
            Required(request.ReasonCode, nameof(request.ReasonCode), "Reason code is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));
    }

    private async Task<long> ResolveCustomerIdAsync(long companyId, long customerId, string? customerCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        if (customerId > 0)
        {
            var customer = await DbContext.Customers.AsNoTracking()
                .ApplyCompanyScope(scope)
                .FirstOrDefaultAsync(record => record.Id == customerId, cancellationToken);

            customer = EnsureFound(customer, "Customer was not found in the active scope.", "master.customer_not_found");
            ThrowIfInvalid(
                customer.CompanyId != companyId
                    ? new ApiError("validation.mismatch", nameof(companyId), "Customer does not belong to the requested company.")
                    : null,
                !string.IsNullOrWhiteSpace(customerCode) && !string.Equals(customer.CustomerCode, customerCode.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(customerCode), "Customer id and customer code do not match.")
                    : null);
            return customer.Id;
        }

        ThrowIfInvalid(Required(customerCode, nameof(customerCode), "Customer code is required when customer id is not supplied."));
        var resolved = await DbContext.Customers.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record =>
                record.CompanyId == companyId &&
                record.CustomerCode == customerCode!.Trim(),
                cancellationToken);

        resolved = EnsureFound(resolved, "Customer code was not found in the active scope.", "master.customer_not_found");
        return resolved.Id;
    }

    private async Task<long?> ResolveCustomerAddressIdAsync(
        long companyId,
        long customerId,
        long? addressId,
        string? addressCode,
        string addressFieldName,
        CancellationToken cancellationToken)
    {
        var scope = GetScope();
        if (addressId.HasValue && addressId.Value > 0)
        {
            var address = await DbContext.CustomerAddresses.AsNoTracking()
                .ApplyCompanyScope(scope)
                .FirstOrDefaultAsync(record => record.Id == addressId.Value, cancellationToken);

            address = EnsureFound(address, "Customer address was not found in the active scope.", "master.customer_address_not_found");
            ThrowIfInvalid(
                address.CompanyId != companyId
                    ? new ApiError("validation.mismatch", nameof(companyId), "Customer address does not belong to the requested company.")
                    : null,
                address.CustomerId != customerId
                    ? new ApiError("validation.mismatch", addressFieldName, "Customer address does not belong to the resolved customer.")
                    : null,
                !string.IsNullOrWhiteSpace(addressCode) && !string.Equals(address.AddressCode, addressCode.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", addressFieldName, "Customer address id and address code do not match.")
                    : null);
            return address.Id;
        }

        if (string.IsNullOrWhiteSpace(addressCode))
        {
            return null;
        }

        var resolved = await DbContext.CustomerAddresses.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record =>
                record.CompanyId == companyId &&
                record.CustomerId == customerId &&
                record.AddressCode == addressCode.Trim(),
                cancellationToken);

        resolved = EnsureFound(resolved, "Customer address code was not found in the active scope.", "master.customer_address_not_found");
        return resolved.Id;
    }

    private async Task<long> ResolveItemIdAsync(long companyId, long itemId, string? itemCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        if (itemId > 0)
        {
            var item = await DbContext.Items.AsNoTracking()
                .ApplyCompanyScope(scope)
                .FirstOrDefaultAsync(record => record.Id == itemId, cancellationToken);

            item = EnsureFound(item, "Item was not found in the active scope.", "master.item_not_found");
            ThrowIfInvalid(
                item.CompanyId != companyId
                    ? new ApiError("validation.mismatch", nameof(companyId), "Item does not belong to the requested company.")
                    : null,
                !string.IsNullOrWhiteSpace(itemCode) && !string.Equals(item.ItemCode, itemCode.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(itemCode), "Item id and item code do not match.")
                    : null);
            return item.Id;
        }

        ThrowIfInvalid(Required(itemCode, nameof(itemCode), "Item code is required when item id is not supplied."));
        var resolved = await DbContext.Items.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record =>
                record.CompanyId == companyId &&
                record.ItemCode == itemCode!.Trim(),
                cancellationToken);

        resolved = EnsureFound(resolved, "Item code was not found in the active scope.", "master.item_not_found");
        return resolved.Id;
    }

    private async Task<long?> ResolveItemVariantIdAsync(long companyId, long itemId, long? itemVariantId, string? itemVariantCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        if (itemVariantId.HasValue && itemVariantId.Value > 0)
        {
            var variant = await DbContext.ItemVariants.AsNoTracking()
                .ApplyCompanyScope(scope)
                .FirstOrDefaultAsync(record => record.Id == itemVariantId.Value, cancellationToken);

            variant = EnsureFound(variant, "Item variant was not found in the active scope.", "master.item_variant_not_found");
            ThrowIfInvalid(
                variant.CompanyId != companyId
                    ? new ApiError("validation.mismatch", nameof(companyId), "Item variant does not belong to the requested company.")
                    : null,
                variant.ItemId != itemId
                    ? new ApiError("validation.mismatch", nameof(itemVariantId), "Item variant does not belong to the resolved item.")
                    : null,
                !string.IsNullOrWhiteSpace(itemVariantCode) && !string.Equals(variant.VariantCode, itemVariantCode.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(itemVariantCode), "Item variant id and item variant code do not match.")
                    : null);
            return variant.Id;
        }

        if (string.IsNullOrWhiteSpace(itemVariantCode))
        {
            return null;
        }

        var resolved = await DbContext.ItemVariants.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record =>
                record.CompanyId == companyId &&
                record.ItemId == itemId &&
                record.VariantCode == itemVariantCode.Trim(),
                cancellationToken);

        resolved = EnsureFound(resolved, "Item variant code was not found in the active scope.", "master.item_variant_not_found");
        return resolved.Id;
    }

    private async Task<Dictionary<long, IReadOnlyCollection<QuoteLineDto>>> LoadQuoteLinesAsync(IReadOnlyCollection<long> quoteIds, CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.QuoteLines.AsNoTracking()
                .Where(record => quoteIds.Contains(record.QuoteId))
                .OrderBy(record => record.LineNo),
            record => record.QuoteId,
            MapQuoteLine,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<SalesOrderLineDto>>> LoadSalesOrderLinesAsync(IReadOnlyCollection<long> orderIds, CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.SalesOrderLines.AsNoTracking()
                .Where(record => orderIds.Contains(record.SalesOrderId))
                .OrderBy(record => record.LineNo),
            record => record.SalesOrderId,
            MapSalesOrderLine,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<BlanketOrderScheduleDto>>> LoadBlanketSchedulesAsync(IReadOnlyCollection<long> orderIds, CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.BlanketOrderSchedules.AsNoTracking()
                .Where(record => orderIds.Contains(record.BlanketOrderId))
                .OrderBy(record => record.LineNo),
            record => record.BlanketOrderId,
            MapBlanketSchedule,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<DemandForecastLineDto>>> LoadForecastLinesAsync(IReadOnlyCollection<long> forecastIds, CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.DemandForecastLines.AsNoTracking()
                .Where(record => forecastIds.Contains(record.DemandForecastId))
                .OrderBy(record => record.LineNo),
            record => record.DemandForecastId,
            MapForecastLine,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<MpsLineDto>>> LoadMpsLinesAsync(IReadOnlyCollection<long> scheduleIds, CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.MpsLines.AsNoTracking()
                .Where(record => scheduleIds.Contains(record.MasterProductionScheduleId))
                .OrderBy(record => record.LineNo),
            record => record.MasterProductionScheduleId,
            MapMpsLine,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<MrpRunItemDto>>> LoadMrpItemsAsync(IReadOnlyCollection<long> runIds, CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.MrpRunItems.AsNoTracking()
                .Where(record => runIds.Contains(record.MrpRunId))
                .OrderBy(record => record.ItemId),
            record => record.MrpRunId,
            MapMrpItem,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<BoqRequirementLineDto>>> LoadBoqLinesAsync(IReadOnlyCollection<long> boqIds, CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.BoqRequirementLines.AsNoTracking()
                .Where(record => boqIds.Contains(record.BoqRequirementId))
                .OrderBy(record => record.LineNo),
            record => record.BoqRequirementId,
            MapBoqLine,
            cancellationToken);

    private static async Task<Dictionary<long, IReadOnlyCollection<TDto>>> LoadGroupedAsync<TEntity, TDto>(
        IQueryable<TEntity> query,
        Func<TEntity, long> keySelector,
        Func<TEntity, TDto> map,
        CancellationToken cancellationToken)
    {
        var records = await query.ToListAsync(cancellationToken);
        return records.GroupBy(keySelector)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<TDto>)group.Select(map).ToArray());
    }

    private static QuoteLineDto MapQuoteLine(QuoteLine entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.ItemVariantId, entity.OrderUomId, entity.Quantity, entity.UnitPrice, entity.DiscountPercent, entity.DiscountAmount, entity.TaxPercent, entity.TaxAmount, entity.LineAmount, entity.MakeType, entity.PromisedDate, entity.PriorityCode, entity.CustomerSpecRef, entity.Status);

    private static QuoteDto MapQuote(Quote entity, IReadOnlyCollection<QuoteLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.QuoteNo, entity.CustomerId, entity.CustomerAddressId, entity.QuoteDate, entity.ExpiryDate, entity.PriorityCode, entity.Status, entity.CustomerSpecRef, lines);

    private static SalesOrderLineDto MapSalesOrderLine(SalesOrderLine entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.ItemVariantId, entity.OrderUomId, entity.Quantity, entity.MakeType, entity.PromisedDate, entity.PriorityCode, entity.CustomerSpecRef, entity.RequestedShipDate, entity.Status);

    private static SalesOrderDto MapSalesOrder(SalesOrder entity, IReadOnlyCollection<SalesOrderLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.SalesOrderNo, entity.CustomerId, entity.BillToAddressId, entity.ShipToAddressId, entity.OrderDate, entity.PromisedDate, entity.PriorityCode, entity.Status, entity.SourceQuoteId, lines);

    private static BlanketOrderScheduleDto MapBlanketSchedule(BlanketOrderSchedule entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.ScheduleDate, entity.Quantity, entity.OrderUomId, entity.Status);

    private static BlanketOrderDto MapBlanketOrder(BlanketOrder entity, IReadOnlyCollection<BlanketOrderScheduleDto> schedules) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.BlanketOrderNo, entity.CustomerId, entity.StartDate, entity.EndDate, entity.Status, schedules);

    private static DemandForecastLineDto MapForecastLine(DemandForecastLine entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.ForecastPeriodStart, entity.ForecastPeriodEnd, entity.Quantity, entity.ForecastUomId);

    private static DemandForecastDto MapForecast(DemandForecast entity, IReadOnlyCollection<DemandForecastLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.ForecastCode, entity.ForecastName, entity.PeriodType, entity.Status, lines);

    private static MpsLineDto MapMpsLine(MpsLine entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.PeriodStart, entity.PeriodEnd, entity.PlannedQuantity, entity.PlanningUomId);

    private static MasterProductionScheduleDto MapMps(MasterProductionSchedule entity, IReadOnlyCollection<MpsLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.MpsCode, entity.PlanningHorizonStart, entity.PlanningHorizonEnd, entity.Status, lines);

    private static MrpRunItemDto MapMrpItem(MrpRunItem entity) =>
        new(entity.Id, entity.ItemId, entity.DemandSourceType, entity.GrossRequirementQty, entity.NetRequirementQty, entity.AvailableQtyAtRun, entity.RecommendedAction, entity.ExceptionCode);

    private static MrpRunDto MapMrpRun(MrpRun entity, IReadOnlyCollection<MrpRunItemDto> items) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.RunCode, entity.RunType, entity.TriggeredFromMpsId, entity.PlanningHorizonStart, entity.PlanningHorizonEnd, entity.Status, entity.RunStartedOn, entity.RunCompletedOn, items);

    private static BoqRequirementLineDto MapBoqLine(BoqRequirementLine entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.RequiredQuantity, entity.RequirementUomId, entity.NeedByDate, entity.RecommendedAction, entity.ApprovedAction, entity.OverrideReasonCode, entity.OverriddenByUserId, entity.Status);

    private static BoqRequirementDto MapBoq(BoqRequirement entity, IReadOnlyCollection<BoqRequirementLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.MrpRunId, entity.SourceDocumentType, entity.SourceDocumentId, entity.Status, lines);

    private static PlanningPlanDto MapPlanningPlan(PlanningPlan entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PlanCode, entity.PlanName, entity.PlanType, entity.HorizonStart, entity.HorizonEnd, entity.FirmFenceDays, entity.ForecastFenceDays, entity.IncludeForecast, entity.IncludeCapacity, entity.Status);

    private static PlanningSnapshotDto MapPlanningSnapshot(PlanningSnapshot entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PlanningPlanId, entity.MrpRunId, entity.SnapshotCode, entity.SnapshotType, entity.InputHash, entity.OutputHash, entity.DemandLineCount, entity.SupplyLineCount, entity.ExceptionCount, entity.PlannedQuantity, entity.CapturedOn, entity.Status);

    private static PlannedOrderDto MapPlannedOrder(PlannedOrder entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PlanningPlanId, entity.MrpRunId, entity.BoqRequirementLineId, entity.PlannedOrderNo, entity.OrderType, entity.ItemId, entity.Quantity, entity.UomId, entity.PlannedStartDate, entity.PlannedDueDate, entity.SourceWarehouseId, entity.TargetWarehouseId, entity.BomRevisionId, entity.RoutingId, entity.IsFirm, entity.IsReleased, entity.IsExpedite, entity.PeggingSourceType, entity.PeggingSourceId, entity.Status, entity.TargetDocumentId, entity.TargetDocumentType);

    private static ShortageActionDto MapShortageAction(ShortageAction entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PlannedOrderId, entity.MrpRunItemId, entity.ItemId, entity.ShortageQuantity, entity.ActionType, entity.OwnerUserId, entity.DueDate, entity.ReasonCode, entity.Status, entity.ResolutionNote);
}
