using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Reporting;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Reporting;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Reporting;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Reporting;

internal sealed class ReportingService : ApplicationServiceBase, IReportingService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly ICurrentUserContextAccessor _currentUserContextAccessor;

    public ReportingService(
        MfgDbContext dbContext,
        IDataScopeService dataScopeService,
        ICurrentUserContextAccessor currentUserContextAccessor,
        IAuditTrail auditTrail)
        : base(dbContext, dataScopeService, currentUserContextAccessor, auditTrail)
    {
        _currentUserContextAccessor = currentUserContextAccessor;
    }

    public async Task<PagedResult<ReportDefinitionDto>> ListReportDefinitionsAsync(ReportFilter filter, CancellationToken cancellationToken = default)
    {
        await EnsureBuiltInDefinitionsAsync(cancellationToken);
        var query = DbContext.ReportDefinitions.AsNoTracking().ApplyCompanyScope(GetScope());
        query = ApplyDefinitionFilters(query, filter);
        var page = await query.OrderBy(entity => entity.Module).ThenBy(entity => entity.ReportName).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapDefinition);
    }

    public async Task<ReportDefinitionDto> GetReportDefinitionAsync(long id, CancellationToken cancellationToken = default)
    {
        await EnsureBuiltInDefinitionsAsync(cancellationToken);
        var entity = await DbContext.ReportDefinitions.AsNoTracking().ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Report definition was not found in the active scope.", "report.definition_not_found");
        EnsureReportPermission(entity);
        return MapDefinition(entity);
    }

    public async Task<ReportDefinitionDto> UpsertReportDefinitionAsync(ReportDefinitionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDefinition(request);
        if (request.CompanyId.HasValue)
        {
            EnsureContextAccess(request.CompanyId.Value, null);
        }

        var code = request.ReportCode.Trim();
        var existing = await DbContext.ReportDefinitions
            .FirstOrDefaultAsync(record => record.CompanyId == request.CompanyId && record.ReportCode == code, cancellationToken);
        if (existing is null)
        {
            existing = ReportDefinition.Create(
                request.CompanyId,
                code,
                request.ReportName,
                request.Module,
                request.Category,
                request.Description,
                request.DatasetSource,
                request.ReportType,
                SerializeFormats(request.OutputFormats),
                request.PermissionKey,
                request.ParameterSchemaJson,
                request.DefaultFiltersJson,
                request.OwnerUserName,
                request.Status,
                request.IsActive,
                GetUserId());
            DbContext.ReportDefinitions.Add(existing);
        }
        else
        {
            existing.Update(
                request.ReportName,
                request.Module,
                request.Category,
                request.Description,
                request.DatasetSource,
                request.ReportType,
                SerializeFormats(request.OutputFormats),
                request.PermissionKey,
                request.ParameterSchemaJson,
                request.DefaultFiltersJson,
                request.OwnerUserName,
                request.Status,
                request.IsActive,
                GetUserId());
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapDefinition(existing);
        await WriteAuditAsync("reporting", nameof(ReportDefinition), "reportdefinition.upsert", existing.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ReportRunDto> RunReportAsync(long reportDefinitionId, ReportRunRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureBuiltInDefinitionsAsync(cancellationToken);
        var definition = await DbContext.ReportDefinitions.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == reportDefinitionId, cancellationToken);
        definition = EnsureFound(definition, "Report definition was not found in the active scope.", "report.definition_not_found");
        EnsureRunnable(definition, request);
        var parameters = NormalizeParameters(request.Parameters);
        ValidateParameters(parameters);

        var scope = GetScope();
        var run = ReportRun.Create(
            scope.ActiveCompanyId ?? definition.CompanyId,
            scope.ActiveBranchId,
            definition.Id,
            $"RPT-{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}",
            JsonSerializer.Serialize(parameters, JsonOptions),
            request.OutputFormat.Trim().ToUpperInvariant(),
            definition.VersionNo,
            request.SourceEntityType,
            request.SourceEntityId,
            GetUserId());

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);
        DbContext.ReportRuns.Add(run);
        await DbContext.SaveChangesAsync(cancellationToken);

        try
        {
            var data = await ExecuteDatasetAsync(definition.DatasetSource, parameters, cancellationToken);
            run.MarkCompleted(data.Rows.Count, GetUserId());
            var output = CreateOutput(run, definition, data, request.OutputFormat);
            DbContext.ReportOutputs.Add(output);
            await DbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            var dto = MapRun(run, definition, data.Columns, data.Rows, new[] { MapOutput(output) });
            await WriteAuditAsync("reporting", nameof(ReportRun), "report.run", run.Id, null, dto, cancellationToken);
            return dto;
        }
        catch (Exception ex) when (ex is not ValidationFailureException)
        {
            run.MarkFailed(ex.Message, GetUserId());
            await DbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            throw;
        }
    }

    public async Task<PagedResult<ReportRunDto>> ListReportRunsAsync(ReportFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ReportRuns.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(record => record.Status == status);
        }

        var page = await query.OrderByDescending(record => record.StartedOn).ToPagedResultAsync(filter, cancellationToken);
        var definitions = await DbContext.ReportDefinitions.AsNoTracking().ToDictionaryAsync(record => record.Id, cancellationToken);
        var outputs = await LoadOutputsByRunAsync(page.Items.Select(record => record.Id).ToArray(), cancellationToken);
        return MapPage(page, run => MapRun(
            run,
            definitions.GetValueOrDefault(run.ReportDefinitionId),
            Array.Empty<string>(),
            Array.Empty<ReportRowDto>(),
            outputs.GetValueOrDefault(run.Id, Array.Empty<ReportOutputDto>())));
    }

    public async Task<PagedResult<ReportOutputDto>> ListReportOutputsAsync(ReportFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ReportOutputs.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(record => record.Status == status);
        }

        var page = await query.OrderByDescending(record => record.GeneratedOn).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapOutput);
    }

    public async Task<ReportDownloadDto> DownloadOutputAsync(long outputId, CancellationToken cancellationToken = default)
    {
        var output = await DbContext.ReportOutputs.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == outputId, cancellationToken);
        output = EnsureFound(output, "Generated report output was not found in the active scope.", "report.output_not_found");
        var run = await DbContext.ReportRuns.AsNoTracking().FirstAsync(record => record.Id == output.ReportRunId, cancellationToken);
        var definition = await DbContext.ReportDefinitions.AsNoTracking().FirstAsync(record => record.Id == run.ReportDefinitionId, cancellationToken);
        EnsureReportPermission(definition);

        output.MarkDownloaded(GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var bytes = Encoding.UTF8.GetBytes(output.ContentText ?? string.Empty);
        await WriteAuditAsync("reporting", nameof(ReportOutput), "reportoutput.download", output.Id, null, MapOutput(output), cancellationToken);
        return new ReportDownloadDto(bytes, output.ContentType, output.FileName);
    }

    public async Task<PagedResult<DashboardDefinitionDto>> ListDashboardsAsync(ReportFilter filter, CancellationToken cancellationToken = default)
    {
        await EnsureBuiltInDefinitionsAsync(cancellationToken);
        await EnsureBuiltInDashboardsAsync(cancellationToken);
        var query = DbContext.DashboardDefinitions.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        if (!string.IsNullOrWhiteSpace(filter.Module))
        {
            var module = filter.Module.Trim();
            query = query.Where(record => record.Module == module);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(record => record.Status == status);
        }

        var page = await query.OrderBy(record => record.Module).ThenBy(record => record.DashboardName).ToPagedResultAsync(filter, cancellationToken);
        var widgets = await LoadWidgetsByDashboardAsync(page.Items.Select(record => record.Id).ToArray(), cancellationToken);
        return MapPage(page, dashboard => MapDashboard(dashboard, widgets.GetValueOrDefault(dashboard.Id, Array.Empty<DashboardWidgetDto>())));
    }

    public async Task<DashboardDefinitionDto> SaveDashboardAsync(DashboardUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDashboard(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var existing = await DbContext.DashboardDefinitions.ApplyActiveOrganizationScope(GetScope())
            .FirstOrDefaultAsync(record => record.DashboardCode == request.DashboardCode.Trim(), cancellationToken);
        if (existing is null)
        {
            existing = DashboardDefinition.Create(request.CompanyId, request.BranchId, request.DashboardCode, request.DashboardName, request.Module, request.Description, request.VisibilityRole, request.OwnerUserId, request.Status, GetUserId());
            DbContext.DashboardDefinitions.Add(existing);
            await DbContext.SaveChangesAsync(cancellationToken);
        }
        else
        {
            existing.Update(request.DashboardName, request.Module, request.Description, request.VisibilityRole, request.OwnerUserId, request.Status, GetUserId());
            var oldWidgets = await DbContext.DashboardWidgets.Where(record => record.DashboardDefinitionId == existing.Id).ToArrayAsync(cancellationToken);
            DbContext.DashboardWidgets.RemoveRange(oldWidgets);
        }

        foreach (var widget in request.Widgets.OrderBy(record => record.LayoutY).ThenBy(record => record.LayoutX))
        {
            if (widget.ReportDefinitionId.HasValue)
            {
                _ = await DbContext.ReportDefinitions.AsNoTracking().FirstOrDefaultAsync(record => record.Id == widget.ReportDefinitionId.Value, cancellationToken)
                    ?? throw new ValidationFailureException(new[] { new ApiError("report.definition_not_found", nameof(widget.ReportDefinitionId), "Widget report definition was not found.") });
            }

            DbContext.DashboardWidgets.Add(DashboardWidget.Create(existing.Id, widget.WidgetCode, widget.Title, widget.WidgetType, widget.ReportDefinitionId, widget.DatasetSource, widget.FiltersJson, widget.DrilldownRoute, widget.DrilldownFilterJson, widget.LayoutX, widget.LayoutY, widget.LayoutW, widget.LayoutH, widget.RefreshMinutes, widget.Status, GetUserId()));
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = await LoadDashboardDtoAsync(existing.Id, cancellationToken);
        await WriteAuditAsync("reporting", nameof(DashboardDefinition), "dashboard.save", existing.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<DashboardDataDto> GetDashboardDataAsync(long dashboardId, CancellationToken cancellationToken = default)
    {
        await EnsureBuiltInDefinitionsAsync(cancellationToken);
        await EnsureBuiltInDashboardsAsync(cancellationToken);
        var dashboard = await LoadDashboardDtoAsync(dashboardId, cancellationToken);
        var widgetData = new List<DashboardWidgetDataDto>();
        foreach (var widget in dashboard.Widgets.OrderBy(record => record.LayoutY).ThenBy(record => record.LayoutX))
        {
            if (widget.Status != "Active")
            {
                widgetData.Add(new DashboardWidgetDataDto(widget, Array.Empty<string>(), Array.Empty<ReportRowDto>(), DateTimeOffset.UtcNow, "Widget is not active."));
                continue;
            }

            var datasetSource = widget.DatasetSource;
            if (widget.ReportDefinitionId.HasValue)
            {
                var definition = await DbContext.ReportDefinitions.AsNoTracking().FirstOrDefaultAsync(record => record.Id == widget.ReportDefinitionId.Value, cancellationToken);
                if (definition is null || !definition.IsActive)
                {
                    widgetData.Add(new DashboardWidgetDataDto(widget, Array.Empty<string>(), Array.Empty<ReportRowDto>(), DateTimeOffset.UtcNow, "Widget report definition is not active."));
                    continue;
                }

                EnsureReportPermission(definition);
                datasetSource = definition.DatasetSource;
            }

            if (string.IsNullOrWhiteSpace(datasetSource))
            {
                widgetData.Add(new DashboardWidgetDataDto(widget, Array.Empty<string>(), Array.Empty<ReportRowDto>(), DateTimeOffset.UtcNow, "Widget dataset is not configured."));
                continue;
            }

            var parameters = DeserializeParameters(widget.FiltersJson);
            var data = await ExecuteDatasetAsync(datasetSource, parameters, cancellationToken);
            widgetData.Add(new DashboardWidgetDataDto(widget, data.Columns, data.Rows.Take(20).ToArray(), DateTimeOffset.UtcNow, null));
        }

        return new DashboardDataDto(dashboard, widgetData);
    }

    private async Task EnsureBuiltInDefinitionsAsync(CancellationToken cancellationToken)
    {
        var existingCodes = await DbContext.ReportDefinitions.Select(record => record.ReportCode).ToArrayAsync(cancellationToken);
        var existing = existingCodes.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var userId = GetUserId();
        foreach (var definition in BuiltInDefinitions())
        {
            if (existing.Contains(definition.ReportCode))
            {
                continue;
            }

            DbContext.ReportDefinitions.Add(ReportDefinition.Create(null, definition.ReportCode, definition.ReportName, definition.Module, definition.Category, definition.Description, definition.DatasetSource, definition.ReportType, SerializeFormats(definition.OutputFormats), definition.PermissionKey, definition.ParameterSchemaJson, definition.DefaultFiltersJson, definition.OwnerUserName, "Active", true, userId));
        }

        if (DbContext.ChangeTracker.HasChanges())
        {
            await DbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task EnsureBuiltInDashboardsAsync(CancellationToken cancellationToken)
    {
        if (await DbContext.DashboardDefinitions.AnyAsync(record => record.DashboardCode == "EXECUTIVE-OVERVIEW", cancellationToken))
        {
            return;
        }

        var defs = await DbContext.ReportDefinitions.ToDictionaryAsync(record => record.ReportCode, cancellationToken);
        var dashboard = DashboardDefinition.Create(GetScope().ActiveCompanyId, GetScope().ActiveBranchId, "EXECUTIVE-OVERVIEW", "Executive Overview", "Executive", "Live operational and finance overview sourced from registered reports.", "ManagementViewer", GetUserId(), "Active", GetUserId());
        DbContext.DashboardDefinitions.Add(dashboard);
        await DbContext.SaveChangesAsync(cancellationToken);
        var widgets = new[]
        {
            ("SALES-ORDERS", "Open sales orders", "Kpi", "SALES-SO-REGISTER", "/sales/orders", 0, 0),
            ("DISPATCH-POD", "Pending POD", "StatusList", "DISPATCH-POD-REGISTER", "/dispatch/shipments", 1, 0),
            ("QUALITY-NCR", "Open NCR", "StatusList", "QUALITY-NCR-REGISTER", "/quality/ncr", 0, 1),
            ("FINANCE-AR", "AR ledger", "Table", "FINANCE-AR-LEDGER", "/finance/ar-invoices", 1, 1)
        };
        foreach (var (code, title, type, reportCode, drilldown, x, y) in widgets)
        {
            defs.TryGetValue(reportCode, out var definition);
            DbContext.DashboardWidgets.Add(DashboardWidget.Create(dashboard.Id, code, title, type, definition?.Id, definition?.DatasetSource, "{}", drilldown, "{}", x, y, 1, 1, 15, "Active", GetUserId()));
        }

        await DbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<ReportDataset> ExecuteDatasetAsync(string datasetSource, IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        return datasetSource switch
        {
            "sales.quote-register" => await QueryQuotesAsync(parameters, cancellationToken),
            "sales.sales-order-register" => await QuerySalesOrdersAsync(parameters, cancellationToken),
            "sales.commercial-snapshot-audit" => await QueryCommercialSnapshotAuditAsync(parameters, cancellationToken),
            "procurement.po-register" => await QueryPurchaseOrdersAsync(parameters, cancellationToken),
            "procurement.grn-register" => await QueryGoodsReceiptsAsync(parameters, cancellationToken),
            "procurement.supplier-invoice-register" => await QuerySupplierInvoicesAsync(parameters, cancellationToken),
            "inventory.stock-balance" => await QueryStockBalancesAsync(parameters, cancellationToken),
            "inventory.stock-movement" => await QueryStockMovementsAsync(parameters, cancellationToken),
            "inventory.traceability" => await QueryTraceabilityAsync(parameters, cancellationToken),
            "production.work-order-register" => await QueryWorkOrdersAsync(parameters, cancellationToken),
            "production.job-card-register" => await QueryJobCardsAsync(parameters, cancellationToken),
            "quality.ncr-register" => await QueryNcrsAsync(parameters, cancellationToken),
            "quality.coa-register" => await QueryCoasAsync(parameters, cancellationToken),
            "dispatch.shipment-register" => await QueryShipmentsAsync(parameters, cancellationToken),
            "dispatch.pod-register" => await QueryPodAsync(parameters, cancellationToken),
            "finance.gl-journal-register" => await QueryGlJournalsAsync(parameters, cancellationToken),
            "finance.tax-ledger" => await QueryTaxLedgerAsync(parameters, cancellationToken),
            "finance.inventory-valuation" => await QueryInventoryValuationAsync(parameters, cancellationToken),
            "finance.ar-ledger" => await QueryArLedgerAsync(parameters, cancellationToken),
            _ => throw new ValidationFailureException(new[] { new ApiError("report.dataset_missing", nameof(datasetSource), $"Report dataset '{datasetSource}' is not configured.") })
        };
    }

    private async Task<ReportDataset> QueryQuotesAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var range = ParseRange(parameters);
        var query = DbContext.Quotes.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyDateRange(query, record => record.QuoteDate, range);
        var records = await query.OrderByDescending(record => record.QuoteDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Quote No", record.QuoteNo),
            ("Customer Id", record.CustomerId.ToString()),
            ("Quote Date", record.QuoteDate.ToString("yyyy-MM-dd")),
            ("Status", record.Status),
            ("Commercial Status", record.CommercialStatus),
            ("Sales Owner", record.SalesOwnerName),
            ("Subtotal", FormatMoney(record.SubtotalAmount)),
            ("Tax", FormatMoney(record.TaxTotalAmount)),
            ("Grand Total", FormatMoney(record.GrandTotalAmount)))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QuerySalesOrdersAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var range = ParseRange(parameters);
        var query = DbContext.SalesOrders.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyDateRange(query, record => record.OrderDate, range);
        var records = await query.OrderByDescending(record => record.OrderDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Sales Order No", record.SalesOrderNo),
            ("Customer Id", record.CustomerId.ToString()),
            ("Order Date", record.OrderDate.ToString("yyyy-MM-dd")),
            ("Status", record.Status),
            ("Commercial Status", record.CommercialStatus),
            ("Source Quote Id", record.SourceQuoteId.HasValue ? record.SourceQuoteId.Value.ToString() : null),
            ("Source Quote Revision", record.SourceQuoteRevisionNo.HasValue ? record.SourceQuoteRevisionNo.Value.ToString() : null),
            ("Grand Total", FormatMoney(record.GrandTotalAmount)))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryCommercialSnapshotAuditAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var quoteRecords = await DbContext.QuoteLines.AsNoTracking().Take(250).ToArrayAsync(cancellationToken);
        var soRecords = await DbContext.SalesOrderLines.AsNoTracking().Take(250).ToArrayAsync(cancellationToken);
        var quoteLines = quoteRecords.Select(record => Row(
            ("Document Type", "Quote"),
            ("Document Line Id", record.Id.ToString()),
            ("Item Id", record.ItemId.ToString()),
            ("Item Revision", record.ItemRevisionId.HasValue ? record.ItemRevisionId.Value.ToString() : null),
            ("Price Source", record.PriceSourceType),
            ("Discount Amount", FormatMoney(record.DiscountAmount)),
            ("Tax Rate", FormatMoney(record.TaxRateSnapshot)),
            ("Line Total", FormatMoney(record.LineTotalAmount)))).ToArray();
        var soLines = soRecords.Select(record => Row(
            ("Document Type", "Sales Order"),
            ("Document Line Id", record.Id.ToString()),
            ("Item Id", record.ItemId.ToString()),
            ("Item Revision", record.ItemRevisionId.HasValue ? record.ItemRevisionId.Value.ToString() : null),
            ("Price Source", record.PriceSourceType),
            ("Discount Amount", FormatMoney(record.DiscountAmount)),
            ("Tax Rate", FormatMoney(record.TaxRateSnapshot)),
            ("Line Total", FormatMoney(record.LineTotalAmount)))).ToArray();
        return Dataset(quoteLines.Concat(soLines).ToArray());
    }

    private async Task<ReportDataset> QueryPurchaseOrdersAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var records = await DbContext.PurchaseOrders.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).OrderBy(record => record.PurchaseOrderNo).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Purchase Order No", record.PurchaseOrderNo),
            ("Supplier Id", record.SupplierId.ToString()),
            ("Expected Receipt", record.ExpectedReceiptDate.HasValue ? record.ExpectedReceiptDate.Value.ToString("yyyy-MM-dd") : null),
            ("Status", record.Status))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryGoodsReceiptsAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var range = ParseRange(parameters);
        var query = DbContext.GoodsReceipts.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyDateRange(query, record => record.ReceiptDate, range);
        var records = await query.OrderByDescending(record => record.ReceiptDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("GRN No", record.GoodsReceiptNo),
            ("PO Id", record.PurchaseOrderId.ToString()),
            ("Supplier Id", record.SupplierId.ToString()),
            ("Receipt Date", record.ReceiptDate.ToString("yyyy-MM-dd")),
            ("Warehouse Id", record.WarehouseId.HasValue ? record.WarehouseId.Value.ToString() : null),
            ("Status", record.Status))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QuerySupplierInvoicesAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var range = ParseRange(parameters);
        var query = DbContext.SupplierInvoices.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyDateRange(query, record => record.InvoiceDate, range);
        var records = await query.OrderByDescending(record => record.InvoiceDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Supplier Invoice No", record.SupplierInvoiceNo),
            ("Supplier Id", record.SupplierId.ToString()),
            ("PO Id", record.PurchaseOrderId.ToString()),
            ("GRN Id", record.GoodsReceiptId.ToString()),
            ("Match Status", record.MatchStatus),
            ("AP Status", record.ApStatus),
            ("Total", FormatMoney(record.TotalAmount)))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryStockBalancesAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var records = await DbContext.StockBalances.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Item Id", record.ItemId.ToString()),
            ("Variant Id", record.ItemVariantId.HasValue ? record.ItemVariantId.Value.ToString() : null),
            ("Warehouse Id", record.WarehouseId.ToString()),
            ("Bin Id", record.BinId.HasValue ? record.BinId.Value.ToString() : null),
            ("Lot Id", record.LotId.HasValue ? record.LotId.Value.ToString() : null),
            ("Serial Id", record.SerialId.HasValue ? record.SerialId.Value.ToString() : null),
            ("PCID Id", record.PcidId.HasValue ? record.PcidId.Value.ToString() : null),
            ("On Hand", FormatMoney(record.OnHandQty)),
            ("Reserved", FormatMoney(record.ReservedQty)),
            ("QC Hold", FormatMoney(record.QcHoldQty)),
            ("Blocked", FormatMoney(record.BlockedQty)))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryStockMovementsAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var range = ParseRange(parameters);
        var query = DbContext.StockTransactions.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyDateRange(query, record => record.PostingDate, range);
        var records = await query.OrderByDescending(record => record.PostingDate).ThenByDescending(record => record.Id).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Transaction No", record.TransactionNo),
            ("Movement Type", record.TransactionType),
            ("Posting Date", record.PostingDate.ToString("yyyy-MM-dd")),
            ("Item Id", record.ItemId.ToString()),
            ("Warehouse Id", (record.FromWarehouseId ?? record.ToWarehouseId).HasValue ? (record.FromWarehouseId ?? record.ToWarehouseId)!.Value.ToString() : null),
            ("Bin Id", (record.FromBinId ?? record.ToBinId).HasValue ? (record.FromBinId ?? record.ToBinId)!.Value.ToString() : null),
            ("Lot Id", record.LotId.HasValue ? record.LotId.Value.ToString() : null),
            ("Serial Id", record.SerialId.HasValue ? record.SerialId.Value.ToString() : null),
            ("PCID Id", record.PcidId.HasValue ? record.PcidId.Value.ToString() : null),
            ("Stock Status", record.InventoryState),
            ("Quantity", FormatMoney(record.Quantity)),
            ("Source", record.SourceDocumentNo is null
                ? $"{record.SourceDocumentType}:{(record.SourceDocumentId.HasValue ? record.SourceDocumentId.Value.ToString() : null)}"
                : $"{record.SourceDocumentType}:{record.SourceDocumentNo}"))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryTraceabilityAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var records = await DbContext.StockTransactions.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).Where(record => record.LotId.HasValue || record.SerialId.HasValue || record.PcidId.HasValue).OrderByDescending(record => record.PostingDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Item Id", record.ItemId.ToString()),
            ("Lot Id", record.LotId.HasValue ? record.LotId.Value.ToString() : null),
            ("Serial Id", record.SerialId.HasValue ? record.SerialId.Value.ToString() : null),
            ("PCID Id", record.PcidId.HasValue ? record.PcidId.Value.ToString() : null),
            ("Source Type", record.SourceDocumentType),
            ("Source No", record.SourceDocumentNo),
            ("Item Revision", record.ItemRevisionId.HasValue ? record.ItemRevisionId.Value.ToString() : null),
            ("Quantity", FormatMoney(record.Quantity)),
            ("Movement Date", record.PostingDate.ToString("yyyy-MM-dd")))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryWorkOrdersAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var records = await DbContext.WorkOrders.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).OrderByDescending(record => record.Id).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Work Order No", record.WorkOrderNo),
            ("Item Id", record.ItemId.ToString()),
            ("BOM Revision Id", record.BomRevisionId.ToString()),
            ("Routing Id", record.RoutingId.HasValue ? record.RoutingId.Value.ToString() : null),
            ("Planned Qty", FormatMoney(record.PlannedQuantity)),
            ("Status", record.Status))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryJobCardsAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var records = await DbContext.JobCards.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).OrderByDescending(record => record.Id).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Job Card No", record.JobCardNo),
            ("Work Order Id", record.WorkOrderId.ToString()),
            ("Machine Id", record.AssignedMachineId.HasValue ? record.AssignedMachineId.Value.ToString() : null),
            ("Planned Qty", FormatMoney(record.PlannedQuantity)),
            ("Good Qty", FormatMoney(record.CompletedGoodQty)),
            ("Reject Qty", FormatMoney(record.CompletedRejectQty)),
            ("Scrap Qty", FormatMoney(record.CompletedScrapQty)),
            ("Status", record.Status))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryNcrsAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var records = await DbContext.NonConformances.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).OrderByDescending(record => record.Id).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("NCR No", record.NcrNo),
            ("Source", $"{record.SourceDocumentType}:{record.SourceDocumentId}"),
            ("Lot Id", record.LotId.HasValue ? record.LotId.Value.ToString() : null),
            ("Serial Id", record.SerialId.HasValue ? record.SerialId.Value.ToString() : null),
            ("Disposition", record.Disposition),
            ("Status", record.Status))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryCoasAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var records = await DbContext.CoaCertificates.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).OrderByDescending(record => record.GeneratedOn).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("COA No", record.CoaNo),
            ("Source", $"{record.SourceDocumentType}:{record.SourceDocumentId}"),
            ("Template", record.TemplateCode),
            ("Version", record.VersionNo.ToString()),
            ("Status", record.Status),
            ("Generated On", record.GeneratedOn.ToString("u")),
            ("Issued On", record.IssuedOn.HasValue ? record.IssuedOn.Value.ToString("u") : null))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryShipmentsAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var range = ParseRange(parameters);
        var query = DbContext.Shipments.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyDateRange(query, record => record.DispatchDate, range);
        var records = await query.OrderByDescending(record => record.DispatchDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Shipment No", record.ShipmentNo),
            ("Customer Id", record.CustomerId.ToString()),
            ("Dispatch Date", record.DispatchDate.ToString("yyyy-MM-dd")),
            ("Transporter", record.TransporterName),
            ("Vehicle", record.VehicleRef),
            ("Tracking", record.TrackingRef),
            ("Status", record.Status),
            ("POD Received By", record.PodReceivedBy))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryPodAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var records = await DbContext.Shipments.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).OrderByDescending(record => record.DeliveredOn ?? record.LoadedOn ?? record.CreatedOn).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Shipment No", record.ShipmentNo),
            ("Status", record.Status),
            ("Delivered On", record.DeliveredOn.HasValue ? record.DeliveredOn.Value.ToString("u") : null),
            ("POD Received On", record.PodReceivedOn.HasValue ? record.PodReceivedOn.Value.ToString("u") : null),
            ("Received By", record.PodReceivedBy),
            ("Receiver Contact", record.PodReceiverContact),
            ("POD Remarks", record.PodRemarks))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryGlJournalsAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var range = ParseRange(parameters);
        var query = DbContext.GeneralLedgerJournals.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyDateRange(query, record => record.PostingDate, range);
        var records = await query.OrderByDescending(record => record.PostingDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Journal No", record.JournalNo),
            ("Posting Date", record.PostingDate.ToString("yyyy-MM-dd")),
            ("Source Module", record.SourceModule),
            ("Source Document", record.SourceDocumentNo is null
                ? $"{record.SourceDocumentType}:{(record.SourceDocumentId.HasValue ? record.SourceDocumentId.Value.ToString() : null)}"
                : $"{record.SourceDocumentType}:{record.SourceDocumentNo}"),
            ("Currency", record.CurrencyCode),
            ("Status", record.Status))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryTaxLedgerAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var range = ParseRange(parameters);
        var query = DbContext.TaxLedgerEntries.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyDateRange(query, record => record.PostingDate, range);
        var records = await query.OrderByDescending(record => record.PostingDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Direction", record.TaxDirection),
            ("Tax Code Id", record.TaxCodeId.HasValue ? record.TaxCodeId.Value.ToString() : null),
            ("Rate", FormatMoney(record.TaxRateSnapshot)),
            ("Taxable", FormatMoney(record.TaxableAmount)),
            ("Tax", FormatMoney(record.TaxAmount)),
            ("Source", $"{record.SourceDocumentType}:{record.SourceDocumentId}"),
            ("Posting Date", record.PostingDate.ToString("yyyy-MM-dd")),
            ("Status", record.Status))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryInventoryValuationAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var range = ParseRange(parameters);
        var query = DbContext.InventoryValuationEntries.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyDateRange(query, record => record.ValuationDate, range);
        var records = await query.OrderByDescending(record => record.ValuationDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Source", record.SourceDocumentNo is null
                ? $"{record.SourceDocumentType}:{(record.SourceDocumentId.HasValue ? record.SourceDocumentId.Value.ToString() : null)}"
                : $"{record.SourceDocumentType}:{record.SourceDocumentNo}"),
            ("Stock Transaction Id", record.StockTransactionId.HasValue ? record.StockTransactionId.Value.ToString() : null),
            ("Item Id", record.ItemId.ToString()),
            ("Warehouse Id", record.WarehouseId.HasValue ? record.WarehouseId.Value.ToString() : null),
            ("Bin Id", record.BinId.HasValue ? record.BinId.Value.ToString() : null),
            ("Quantity", FormatMoney(record.Quantity)),
            ("Unit Cost", FormatMoney(record.UnitCost)),
            ("Total Cost", FormatMoney(record.TotalCost)),
            ("Status", record.Status))).ToArray();
        return Dataset(rows);
    }

    private async Task<ReportDataset> QueryArLedgerAsync(IReadOnlyDictionary<string, string?> parameters, CancellationToken cancellationToken)
    {
        var records = await DbContext.AccountsReceivableLedgerEntries.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).OrderByDescending(record => record.PostingDate).Take(500).ToArrayAsync(cancellationToken);
        var rows = records.Select(record => Row(
            ("Entry No", record.EntryNo),
            ("Customer Id", record.CustomerId.ToString()),
            ("AR Invoice Id", record.ArInvoiceId.ToString()),
            ("Posting Date", record.PostingDate.ToString("yyyy-MM-dd")),
            ("Due Date", record.DueDate.ToString("yyyy-MM-dd")),
            ("Receivable", FormatMoney(record.ReceivableAmount)),
            ("Received", FormatMoney(record.ReceivedAmount)),
            ("Balance", FormatMoney(record.BalanceAmount)),
            ("Status", record.Status))).ToArray();
        return Dataset(rows);
    }

    private static IQueryable<ReportDefinition> ApplyDefinitionFilters(IQueryable<ReportDefinition> query, ReportFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Module))
        {
            var module = filter.Module.Trim();
            query = query.Where(record => record.Module == module);
        }

        if (!string.IsNullOrWhiteSpace(filter.Category))
        {
            var category = filter.Category.Trim();
            query = query.Where(record => record.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(filter.ReportType))
        {
            var type = filter.ReportType.Trim();
            query = query.Where(record => record.ReportType == type);
        }

        if (!string.IsNullOrWhiteSpace(filter.ReportCode))
        {
            var code = filter.ReportCode.Trim();
            query = query.Where(record => record.ReportCode == code);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(record => record.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(record => record.ReportCode.Contains(search) || record.ReportName.Contains(search) || record.Module.Contains(search));
        }

        return query;
    }

    private static IQueryable<T> ApplyDateRange<T>(IQueryable<T> query, System.Linq.Expressions.Expression<Func<T, DateOnly>> selector, (DateOnly? From, DateOnly? To) range)
    {
        if (!range.From.HasValue && !range.To.HasValue)
        {
            return query;
        }

        if (range.From.HasValue)
        {
            var from = range.From.Value;
            query = query.Where(ExpressionGreaterOrEqual(selector, from));
        }

        if (range.To.HasValue)
        {
            var to = range.To.Value;
            query = query.Where(ExpressionLessOrEqual(selector, to));
        }

        return query;
    }

    private static System.Linq.Expressions.Expression<Func<T, bool>> ExpressionGreaterOrEqual<T>(System.Linq.Expressions.Expression<Func<T, DateOnly>> selector, DateOnly value)
    {
        var body = System.Linq.Expressions.Expression.GreaterThanOrEqual(selector.Body, System.Linq.Expressions.Expression.Constant(value));
        return System.Linq.Expressions.Expression.Lambda<Func<T, bool>>(body, selector.Parameters);
    }

    private static System.Linq.Expressions.Expression<Func<T, bool>> ExpressionLessOrEqual<T>(System.Linq.Expressions.Expression<Func<T, DateOnly>> selector, DateOnly value)
    {
        var body = System.Linq.Expressions.Expression.LessThanOrEqual(selector.Body, System.Linq.Expressions.Expression.Constant(value));
        return System.Linq.Expressions.Expression.Lambda<Func<T, bool>>(body, selector.Parameters);
    }

    private static void ValidateDefinition(ReportDefinitionUpsertRequest request)
    {
        ThrowIfInvalid(
            Required(request.ReportCode, nameof(request.ReportCode), "Report code is required."),
            Required(request.ReportName, nameof(request.ReportName), "Report name is required."),
            Required(request.Module, nameof(request.Module), "Module is required."),
            Required(request.DatasetSource, nameof(request.DatasetSource), "Dataset source is required."),
            request.OutputFormats.Count == 0 ? new ApiError("validation.required", nameof(request.OutputFormats), "At least one output format is required.") : null);
    }

    private static void ValidateDashboard(DashboardUpsertRequest request)
    {
        ThrowIfInvalid(
            Required(request.DashboardCode, nameof(request.DashboardCode), "Dashboard code is required."),
            Required(request.DashboardName, nameof(request.DashboardName), "Dashboard name is required."),
            Required(request.Module, nameof(request.Module), "Dashboard module is required."));
    }

    private static void ValidateParameters(IReadOnlyDictionary<string, string?> parameters)
    {
        var range = ParseRange(parameters);
        if (range.From.HasValue && range.To.HasValue && range.From.Value > range.To.Value)
        {
            throw new ValidationFailureException(new[] { new ApiError("report.parameter_date_range", "dateTo", "Report date-to must be on or after date-from.") });
        }
    }

    private void EnsureRunnable(ReportDefinition definition, ReportRunRequest request)
    {
        EnsureReportPermission(definition);
        var formats = ParseFormats(definition.OutputFormatsJson);
        var requested = request.OutputFormat.Trim().ToUpperInvariant();
        ThrowIfInvalid(
            !definition.IsActive || definition.Status != "Active" ? new ApiError("report.inactive", nameof(definition.Status), "Inactive reports cannot be run.") : null,
            !formats.Contains(requested, StringComparer.OrdinalIgnoreCase) ? new ApiError("report.format_not_supported", nameof(request.OutputFormat), "Requested output format is not enabled for this report.") : null);
    }

    private void EnsureReportPermission(ReportDefinition definition)
    {
        var current = _currentUserContextAccessor.GetRequired();
        var roles = current.Roles.ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (!definition.PermissionKey.StartsWith("reports.finance", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (roles.Contains("SuperAdmin") || roles.Contains("PlatformAdmin") || roles.Contains("CompanyAdmin") || roles.Contains("PlantHead") || roles.Contains("ManagementViewer"))
        {
            return;
        }

        throw new ValidationFailureException(new[] { new ApiError("report.permission_denied", nameof(definition.PermissionKey), "Finance reports require finance or management report permission.") });
    }

    private ReportOutput CreateOutput(ReportRun run, ReportDefinition definition, ReportDataset data, string format)
    {
        var normalizedFormat = format.Trim().ToUpperInvariant();
        var content = BuildContent(definition, data, normalizedFormat);
        var bytes = Encoding.UTF8.GetBytes(content);
        var checksum = Convert.ToHexString(SHA256.HashData(bytes));
        var extension = normalizedFormat.ToLowerInvariant() switch
        {
            "XLSX" => "xlsx",
            "PDF" => "pdf",
            "JSON" => "json",
            _ => "csv"
        };
        var contentType = normalizedFormat switch
        {
            "XLSX" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "PDF" => "application/pdf",
            "JSON" => "application/json",
            _ => "text/csv"
        };
        var fileName = $"{definition.ReportCode}-{run.RunNo}.{extension}";
        return ReportOutput.Create(run.CompanyId, run.BranchId, run.Id, fileName, normalizedFormat, contentType, $"reports/{definition.Module}/{definition.ReportCode}/{fileName}", checksum, bytes.LongLength, content, "Completed", GetUserId());
    }

    private static string BuildContent(ReportDefinition definition, ReportDataset data, string format)
    {
        if (format == "JSON")
        {
            return JsonSerializer.Serialize(new { reportCode = definition.ReportCode, columns = data.Columns, rows = data.Rows.Select(row => row.Values) }, JsonOptions);
        }

        var builder = new StringBuilder();
        if (format == "PDF")
        {
            builder.AppendLine(definition.ReportName);
            builder.AppendLine(new string('=', definition.ReportName.Length));
        }

        builder.AppendLine(string.Join(",", data.Columns.Select(EscapeCsv)));
        foreach (var row in data.Rows)
        {
            builder.AppendLine(string.Join(",", data.Columns.Select(column => EscapeCsv(row.Values.GetValueOrDefault(column)))));
        }

        return builder.ToString();
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        return value.Contains(',') || value.Contains('"') || value.Contains('\n')
            ? $"\"{value.Replace("\"", "\"\"", StringComparison.Ordinal)}\""
            : value;
    }

    private static (DateOnly? From, DateOnly? To) ParseRange(IReadOnlyDictionary<string, string?> parameters)
    {
        var from = TryGetDate(parameters, "dateFrom");
        var to = TryGetDate(parameters, "dateTo");
        return (from, to);
    }

    private static DateOnly? TryGetDate(IReadOnlyDictionary<string, string?> parameters, string key)
    {
        if (!parameters.TryGetValue(key, out var value) || string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return DateOnly.TryParse(value, out var parsed) ? parsed : null;
    }

    private async Task<Dictionary<long, IReadOnlyCollection<ReportOutputDto>>> LoadOutputsByRunAsync(IReadOnlyCollection<long> runIds, CancellationToken cancellationToken)
    {
        if (runIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<ReportOutputDto>>();
        }

        var outputs = await DbContext.ReportOutputs.AsNoTracking().Where(record => runIds.Contains(record.ReportRunId)).OrderByDescending(record => record.GeneratedOn).ToArrayAsync(cancellationToken);
        return outputs.GroupBy(record => record.ReportRunId).ToDictionary(group => group.Key, group => (IReadOnlyCollection<ReportOutputDto>)group.Select(MapOutput).ToArray());
    }

    private async Task<Dictionary<long, IReadOnlyCollection<DashboardWidgetDto>>> LoadWidgetsByDashboardAsync(IReadOnlyCollection<long> dashboardIds, CancellationToken cancellationToken)
    {
        if (dashboardIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<DashboardWidgetDto>>();
        }

        var widgets = await DbContext.DashboardWidgets.AsNoTracking().Where(record => dashboardIds.Contains(record.DashboardDefinitionId)).OrderBy(record => record.LayoutY).ThenBy(record => record.LayoutX).ToArrayAsync(cancellationToken);
        return widgets.GroupBy(record => record.DashboardDefinitionId).ToDictionary(group => group.Key, group => (IReadOnlyCollection<DashboardWidgetDto>)group.Select(MapWidget).ToArray());
    }

    private async Task<DashboardDefinitionDto> LoadDashboardDtoAsync(long id, CancellationToken cancellationToken)
    {
        var dashboard = await DbContext.DashboardDefinitions.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        dashboard = EnsureFound(dashboard, "Dashboard was not found in the active scope.", "report.dashboard_not_found");
        var widgets = await LoadWidgetsByDashboardAsync(new[] { id }, cancellationToken);
        return MapDashboard(dashboard, widgets.GetValueOrDefault(id, Array.Empty<DashboardWidgetDto>()));
    }

    private static Dictionary<string, string?> Row(params (string Key, string? Value)[] values) =>
        values.ToDictionary(value => value.Key, value => value.Value);

    private static ReportDataset Dataset(IReadOnlyCollection<Dictionary<string, string?>> rows)
    {
        var columns = rows.FirstOrDefault()?.Keys.ToArray() ?? Array.Empty<string>();
        return new ReportDataset(columns, rows.Select(row => new ReportRowDto(row)).ToArray());
    }

    private static IReadOnlyDictionary<string, string?> NormalizeParameters(IReadOnlyDictionary<string, string?> parameters) =>
        parameters.ToDictionary(pair => pair.Key, pair => string.IsNullOrWhiteSpace(pair.Value) ? null : pair.Value.Trim(), StringComparer.OrdinalIgnoreCase);

    private static IReadOnlyDictionary<string, string?> DeserializeParameters(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        }

        return JsonSerializer.Deserialize<Dictionary<string, string?>>(json, JsonOptions) ?? new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
    }

    private static string SerializeFormats(IReadOnlyCollection<string> formats) =>
        JsonSerializer.Serialize(formats.Select(format => format.Trim().ToUpperInvariant()).Where(format => !string.IsNullOrWhiteSpace(format)).Distinct(StringComparer.OrdinalIgnoreCase).ToArray(), JsonOptions);

    private static IReadOnlyCollection<string> ParseFormats(string json) =>
        JsonSerializer.Deserialize<string[]>(json, JsonOptions) ?? Array.Empty<string>();

    private static string FormatMoney(decimal value) => value.ToString("0.####", System.Globalization.CultureInfo.InvariantCulture);

    private static ReportDefinitionDto MapDefinition(ReportDefinition entity) =>
        new(entity.Id, entity.CompanyId, entity.ReportCode, entity.ReportName, entity.Module, entity.Category, entity.Description, entity.DatasetSource, entity.ReportType, ParseFormats(entity.OutputFormatsJson), entity.PermissionKey, entity.ParameterSchemaJson, entity.DefaultFiltersJson, entity.OwnerUserName, entity.VersionNo, entity.Status, entity.IsActive);

    private static ReportRunDto MapRun(ReportRun entity, ReportDefinition? definition, IReadOnlyCollection<string> columns, IReadOnlyCollection<ReportRowDto> rows, IReadOnlyCollection<ReportOutputDto> outputs) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.ReportDefinitionId, entity.RunNo, entity.ParametersJson, entity.OutputFormat, entity.Status, entity.RowCount, entity.FailureReason, entity.StartedOn, entity.CompletedOn, entity.GeneratedByUserId, entity.SourceReportVersion, entity.SourceEntityType, entity.SourceEntityId, definition is null ? null : MapDefinition(definition), columns, rows, outputs);

    private static ReportOutputDto MapOutput(ReportOutput entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.ReportRunId, entity.FileName, entity.OutputFormat, entity.ContentType, entity.StoragePath, entity.Checksum, entity.SizeBytes, entity.Status, entity.GeneratedOn, entity.DownloadCount, entity.LastDownloadedOn, entity.LastDownloadedByUserId);

    private static DashboardDefinitionDto MapDashboard(DashboardDefinition entity, IReadOnlyCollection<DashboardWidgetDto> widgets) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.DashboardCode, entity.DashboardName, entity.Module, entity.Description, entity.VisibilityRole, entity.OwnerUserId, entity.Status, widgets);

    private static DashboardWidgetDto MapWidget(DashboardWidget entity) =>
        new(entity.Id, entity.DashboardDefinitionId, entity.WidgetCode, entity.Title, entity.WidgetType, entity.ReportDefinitionId, entity.DatasetSource, entity.FiltersJson, entity.DrilldownRoute, entity.DrilldownFilterJson, entity.LayoutX, entity.LayoutY, entity.LayoutW, entity.LayoutH, entity.RefreshMinutes, entity.Status);

    private static IReadOnlyCollection<BuiltInReport> BuiltInDefinitions() =>
        new[]
        {
            BuiltIn("SALES-QUOTE-REGISTER", "Quote Register", "Sales", "Commercial", "Quote commercial snapshots by document date.", "sales.quote-register", "register", "reports.sales.quote", ["CSV", "XLSX", "PDF", "JSON"]),
            BuiltIn("SALES-SO-REGISTER", "Sales Order Register", "Sales", "Commercial", "Sales order commercial snapshots with source quote references.", "sales.sales-order-register", "register", "reports.sales.order", ["CSV", "XLSX", "PDF", "JSON"]),
            BuiltIn("SALES-COMMERCIAL-SNAPSHOT-AUDIT", "Commercial Snapshot Audit", "Sales", "Audit", "Line price, discount, tax, and revision snapshot evidence.", "sales.commercial-snapshot-audit", "ledger", "reports.sales.audit", ["CSV", "XLSX", "JSON"]),
            BuiltIn("PROCUREMENT-PO-REGISTER", "Purchase Order Register", "Procurement", "Register", "Purchase order status and expected receipt dates.", "procurement.po-register", "register", "reports.procurement.po", ["CSV", "XLSX", "PDF"]),
            BuiltIn("PROCUREMENT-GRN-REGISTER", "GRN Register", "Procurement", "Register", "Goods receipt status by supplier, PO, warehouse, and date.", "procurement.grn-register", "register", "reports.procurement.grn", ["CSV", "XLSX", "PDF"]),
            BuiltIn("PROCUREMENT-SUPPLIER-INVOICE-REGISTER", "Supplier Invoice Register", "Procurement", "AP", "Supplier invoice match and AP posting status.", "procurement.supplier-invoice-register", "ledger", "reports.procurement.invoice", ["CSV", "XLSX", "PDF"]),
            BuiltIn("INVENTORY-STOCK-BALANCE", "Inventory Stock Balance", "Inventory", "Stock", "On-hand, reserved, hold, blocked, bin, lot, serial, and PCID grain.", "inventory.stock-balance", "ledger", "reports.inventory.balance", ["CSV", "XLSX", "JSON"]),
            BuiltIn("INVENTORY-MOVEMENT-REGISTER", "Stock Movement Register", "Inventory", "Stock", "Append-only stock movement ledger with source document references.", "inventory.stock-movement", "ledger", "reports.inventory.movement", ["CSV", "XLSX", "PDF", "JSON"]),
            BuiltIn("INVENTORY-TRACEABILITY", "Inventory Traceability", "Inventory", "Traceability", "Lot, serial, and PCID movement traceability.", "inventory.traceability", "analytical", "reports.inventory.traceability", ["CSV", "XLSX", "PDF"]),
            BuiltIn("PRODUCTION-WORK-ORDER-REGISTER", "Work Order Register", "Production", "Execution", "Work order status and BOM/routing references.", "production.work-order-register", "register", "reports.production.workorder", ["CSV", "XLSX", "PDF"]),
            BuiltIn("PRODUCTION-JOB-CARD-REGISTER", "Job Card Register", "Production", "Execution", "Job card traveler status and quantity evidence.", "production.job-card-register", "document", "reports.production.jobcard", ["CSV", "XLSX", "PDF"]),
            BuiltIn("QUALITY-NCR-REGISTER", "NCR Register", "Quality", "NCR", "Non-conformance source, lot/serial, disposition, and status.", "quality.ncr-register", "register", "reports.quality.ncr", ["CSV", "XLSX", "PDF"]),
            BuiltIn("QUALITY-COA-REGISTER", "COA Register", "Quality", "COA", "COA generation, issue, and reissue register.", "quality.coa-register", "document", "reports.quality.coa", ["CSV", "XLSX", "PDF"]),
            BuiltIn("DISPATCH-SHIPMENT-REGISTER", "Dispatch Shipment Register", "Dispatch", "Logistics", "Shipment, transporter, POD, and status register.", "dispatch.shipment-register", "register", "reports.dispatch.shipment", ["CSV", "XLSX", "PDF"]),
            BuiltIn("DISPATCH-POD-REGISTER", "POD Register", "Dispatch", "POD", "Proof-of-delivery status and receiver evidence.", "dispatch.pod-register", "document", "reports.dispatch.pod", ["CSV", "XLSX", "PDF"]),
            BuiltIn("FINANCE-GL-JOURNAL-REGISTER", "GL Journal Register", "Finance", "GL", "Posted, draft, reversed, and source-generated journals.", "finance.gl-journal-register", "ledger", "reports.finance.gl", ["CSV", "XLSX", "PDF"]),
            BuiltIn("FINANCE-TAX-LEDGER", "Tax Ledger", "Finance", "Tax", "Input and output tax ledger entries from posted document snapshots.", "finance.tax-ledger", "ledger", "reports.finance.tax", ["CSV", "XLSX", "PDF"]),
            BuiltIn("FINANCE-INVENTORY-VALUATION", "Inventory Valuation Report", "Finance", "Valuation", "Inventory value entries linked to stock and source documents.", "finance.inventory-valuation", "ledger", "reports.finance.valuation", ["CSV", "XLSX", "PDF"]),
            BuiltIn("FINANCE-AR-LEDGER", "AR Ledger", "Finance", "AR", "Customer receivable ledger balances and due dates.", "finance.ar-ledger", "ledger", "reports.finance.ar", ["CSV", "XLSX", "PDF"])
        };

    private static BuiltInReport BuiltIn(string code, string name, string module, string category, string description, string source, string type, string permission, IReadOnlyCollection<string> formats) =>
        new(code, name, module, category, description, source, type, permission, formats, "{\"parameters\":[\"dateFrom\",\"dateTo\",\"status\",\"documentNo\"]}", null, "System");

    private sealed record BuiltInReport(string ReportCode, string ReportName, string Module, string Category, string Description, string DatasetSource, string ReportType, string PermissionKey, IReadOnlyCollection<string> OutputFormats, string ParameterSchemaJson, string? DefaultFiltersJson, string OwnerUserName);

    private sealed record ReportDataset(IReadOnlyCollection<string> Columns, IReadOnlyCollection<ReportRowDto> Rows);
}
