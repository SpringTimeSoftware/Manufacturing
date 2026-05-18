using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts.Reporting;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Platform.Customization;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Infrastructure.Persistence;
using STS.Mfg.Infrastructure.Reporting;

namespace STS.Mfg.Tests;

public sealed class ReportsDashboardBuilderServiceTests
{
    [Fact]
    public async Task RunReportAsync_PersistsRunOutputAndDownloadAuditFromRealDataset()
    {
        await using var dbContext = CreateDbContext();
        dbContext.StockBalances.Add(StockBalance.Create(1, 10, 1001, null, 901, 902, 903, null, 12m, 2m, 1m, 0m, 0m, null, 77, 904));
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext);

        var definitions = await service.ListReportDefinitionsAsync(new ReportFilter(ReportCode: "INVENTORY-STOCK-BALANCE"));
        var definition = Assert.Single(definitions.Items);

        var run = await service.RunReportAsync(definition.Id, new ReportRunRequest(new Dictionary<string, string?>(), "CSV"));

        Assert.Equal("Completed", run.Status);
        Assert.Equal(1, run.RowCount);
        Assert.Contains("PCID Id", run.Columns);
        var output = Assert.Single(run.Outputs);
        Assert.Equal("Completed", output.Status);
        Assert.Equal(0, output.DownloadCount);

        var download = await service.DownloadOutputAsync(output.Id);

        Assert.Equal("text/csv", download.ContentType);
        Assert.Contains("INVENTORY-STOCK-BALANCE", download.FileName);
        var audited = await dbContext.ReportOutputs.SingleAsync(record => record.Id == output.Id);
        Assert.Equal(1, audited.DownloadCount);
        Assert.NotNull(audited.LastDownloadedOn);
    }

    [Fact]
    public async Task RunReportAsync_BlocksInactiveReportAndInvalidDateRange()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);
        var inactive = await service.UpsertReportDefinitionAsync(new ReportDefinitionUpsertRequest(
            null,
            "TEST-INACTIVE",
            "Inactive Test",
            "Sales",
            "Register",
            null,
            "sales.quote-register",
            "register",
            new[] { "CSV" },
            "reports.sales.test",
            "{}",
            null,
            "Tester",
            "Inactive",
            false));

        var inactiveEx = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.RunReportAsync(inactive.Id, new ReportRunRequest(new Dictionary<string, string?>(), "CSV")));
        Assert.Contains(inactiveEx.Errors, error => error.Code == "report.inactive");

        var definitions = await service.ListReportDefinitionsAsync(new ReportFilter(ReportCode: "SALES-QUOTE-REGISTER"));
        var quoteReport = Assert.Single(definitions.Items);
        var rangeEx = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.RunReportAsync(quoteReport.Id, new ReportRunRequest(new Dictionary<string, string?>
            {
                ["dateFrom"] = "2026-05-20",
                ["dateTo"] = "2026-05-01"
            }, "CSV")));
        Assert.Contains(rangeEx.Errors, error => error.Code == "report.parameter_date_range");
    }

    [Fact]
    public async Task FinanceReport_RequiresFinanceOrManagementPermission()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateService(dbContext, roles: new[] { "SalesCoordinator" });
        var definitions = await service.ListReportDefinitionsAsync(new ReportFilter(ReportCode: "FINANCE-TAX-LEDGER"));
        var definition = Assert.Single(definitions.Items);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.RunReportAsync(definition.Id, new ReportRunRequest(new Dictionary<string, string?>(), "CSV")));

        Assert.Contains(ex.Errors, error => error.Code == "report.permission_denied");
    }

    [Fact]
    public async Task SaveDashboardAsync_PersistsWidgetsAndReturnsLiveWidgetData()
    {
        await using var dbContext = CreateDbContext();
        dbContext.StockBalances.Add(StockBalance.Create(1, 10, 1002, null, 901, null, null, null, 4m, 0m, 0m, 0m, 0m, null, 77));
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext);
        var definitions = await service.ListReportDefinitionsAsync(new ReportFilter(ReportCode: "INVENTORY-STOCK-BALANCE"));
        var definition = Assert.Single(definitions.Items);

        var dashboard = await service.SaveDashboardAsync(new DashboardUpsertRequest(
            1,
            10,
            "INV-DASH-TEST",
            "Inventory Dashboard Test",
            "Inventory",
            "Inventory live widget test.",
            "StoreKeeper",
            77,
            "Active",
            new[]
            {
                new DashboardWidgetUpsertRequest(null, "STOCK", "Stock balance", "Table", definition.Id, definition.DatasetSource, "{}", "/inventory/stock", "{}", 0, 0, 2, 1, 15, "Active")
            }));

        var data = await service.GetDashboardDataAsync(dashboard.Id);

        Assert.Single(dashboard.Widgets);
        var widget = Assert.Single(data.Widgets);
        Assert.Null(widget.DisabledReason);
        Assert.Contains(widget.Rows, row => row.Values["Item Id"] == "1002");
    }

    [Fact]
    public async Task UdfValueReport_ExportsReportableTypedValuesOnly()
    {
        await using var dbContext = CreateDbContext();
        var publicDefinition = CreateUdfDefinition("Quote", "customerApprovalRef", "Customer approval reference", isReportable: true, isSensitive: false);
        var sensitiveDefinition = CreateUdfDefinition("Quote", "secretNote", "Secret note", isReportable: true, isSensitive: true);
        dbContext.UdfDefinitions.AddRange(publicDefinition, sensitiveDefinition);
        await dbContext.SaveChangesAsync();
        dbContext.UdfValues.Add(CreateUdfValue(publicDefinition.Id, "Quote", 5001, "APPROVED-42"));
        dbContext.UdfValues.Add(CreateUdfValue(sensitiveDefinition.Id, "Quote", 5001, "hidden"));
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext);

        var definitions = await service.ListReportDefinitionsAsync(new ReportFilter(ReportCode: "PLATFORM-UDF-VALUE-REGISTER"));
        var definition = Assert.Single(definitions.Items);
        var run = await service.RunReportAsync(definition.Id, new ReportRunRequest(new Dictionary<string, string?>(), "CSV"));

        Assert.Equal("Completed", run.Status);
        Assert.Contains("Field Code", run.Columns);
        var row = Assert.Single(run.Rows);
        Assert.Equal("customerApprovalRef", row.Values["Field Code"]);
        Assert.Equal("APPROVED-42", row.Values["Typed Value"]);
        var output = Assert.Single(run.Outputs);
        var download = await service.DownloadOutputAsync(output.Id);
        var csv = System.Text.Encoding.UTF8.GetString(download.Content);
        Assert.Contains("Customer approval reference", csv);
        Assert.DoesNotContain("secretNote", csv);
    }

    private static ReportingService CreateService(MfgDbContext dbContext, IReadOnlyCollection<string>? roles = null) =>
        new(dbContext, new AllowAllDataScopeService(), new TestCurrentUserContextAccessor(roles ?? new[] { "ManagementViewer" }), new TestAuditTrail());

    private static MfgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .ConfigureWarnings(builder => builder.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new MfgDbContext(options);
    }

    private static UdfDefinition CreateUdfDefinition(string entityType, string fieldKey, string label, bool isReportable, bool isSensitive)
    {
        var definition = NewEntity<UdfDefinition>();
        Set(definition, nameof(UdfDefinition.CompanyId), 1L);
        Set(definition, nameof(UdfDefinition.Module), "Sales");
        Set(definition, nameof(UdfDefinition.EntityType), entityType);
        Set(definition, nameof(UdfDefinition.EntityLevel), "Header");
        Set(definition, nameof(UdfDefinition.FieldKey), fieldKey);
        Set(definition, nameof(UdfDefinition.Label), label);
        Set(definition, nameof(UdfDefinition.DataType), "Text");
        Set(definition, nameof(UdfDefinition.ControlType), "Text");
        Set(definition, nameof(UdfDefinition.RoleVisibility), "All");
        Set(definition, nameof(UdfDefinition.DisplayOrder), 10);
        Set(definition, nameof(UdfDefinition.VersionNo), 1);
        Set(definition, nameof(UdfDefinition.IsReportable), isReportable);
        Set(definition, nameof(UdfDefinition.IsSensitive), isSensitive);
        Set(definition, nameof(UdfDefinition.Status), "Active");
        return definition;
    }

    private static UdfValue CreateUdfValue(long definitionId, string entityType, long entityId, string value)
    {
        var udfValue = NewEntity<UdfValue>();
        Set(udfValue, nameof(UdfValue.CompanyId), 1L);
        Set(udfValue, nameof(UdfValue.DefinitionId), definitionId);
        Set(udfValue, nameof(UdfValue.EntityType), entityType);
        Set(udfValue, nameof(UdfValue.EntityId), entityId);
        Set(udfValue, nameof(UdfValue.ValueText), value);
        Set(udfValue, nameof(UdfValue.DisplayValue), value);
        Set(udfValue, nameof(UdfValue.Status), "Active");
        return udfValue;
    }

    private static T NewEntity<T>() where T : class =>
        (T)Activator.CreateInstance(typeof(T), nonPublic: true)!;

    private static void Set<T>(T entity, string propertyName, object? value)
    {
        typeof(T).GetProperty(propertyName)!.SetValue(entity, value);
    }

    private sealed class AllowAllDataScopeService : IDataScopeService
    {
        private static readonly DataScopeContext Scope = new(77, 1, 10, true, RecordVisibilityMode.AllInScope, [1], [10], [], [1], [], []);

        public DataScopeContext GetCurrentScope() => Scope;
        public void EnsureContextAccess(long? companyId, long? branchId) { }
        public void EnsureWarehouseAccess(long? warehouseId) { }
        public void EnsureDepartmentAccess(long? departmentId) { }
        public void EnsureRecordAccess(long? ownerUserId) { }
        public IReadOnlyDictionary<string, object?> CreateStoredProcedureScope(long? warehouseId = null, long? departmentId = null, long? ownerUserId = null) => new Dictionary<string, object?>();
    }

    private sealed class TestCurrentUserContextAccessor(IReadOnlyCollection<string> roles) : ICurrentUserContextAccessor
    {
        public CurrentUserContext GetCurrent() => GetRequired();
        public CurrentUserContext GetRequired() => new(true, 77, "reports.tester", "Reports Tester", "reports.tester@sts.local", "en-IN", "web", 1, 10, roles);
    }

    private sealed class TestAuditTrail : IAuditTrail
    {
        public Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
