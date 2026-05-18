using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Reporting;
using STS.Mfg.Application.Contracts.ServiceManagement;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Dispatch;
using STS.Mfg.Domain.Finance;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Domain.SalesPlanning;
using STS.Mfg.Infrastructure.Inventory;
using STS.Mfg.Infrastructure.Persistence;
using STS.Mfg.Infrastructure.Reporting;
using STS.Mfg.Infrastructure.ServiceManagement;

namespace STS.Mfg.Tests;

public sealed class ServiceWarrantyAmcServiceTests
{
    [Fact]
    public async Task InstalledAsset_PersistsSourceSerialRevisionAndWarrantySnapshot()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedServiceBaseAsync(dbContext);
        var service = CreateService(dbContext);

        var asset = await service.CreateInstalledAssetAsync(new InstalledAssetUpsertRequest(
            1,
            10,
            "AST-001",
            seed.CustomerId,
            null,
            null,
            seed.ItemId,
            501,
            null,
            "SER-001",
            seed.LotId,
            null,
            seed.SalesOrderId,
            seed.SalesOrderLineId,
            seed.DispatchId,
            seed.DispatchLineId,
            seed.InvoiceId,
            "Dispatch",
            "SHP-SVC-001",
            4,
            new DateOnly(2026, 5, 18),
            new DateOnly(2026, 5, 19),
            new DateOnly(2026, 5, 18),
            new DateOnly(2027, 5, 18),
            null,
            "Active",
            "Customer plant, Line 1",
            "Commissioned after dispatch.",
            false));

        Assert.Equal(seed.CustomerId, asset.CustomerId);
        Assert.Equal(501, asset.ItemRevisionId);
        Assert.Equal("SER-001", asset.SerialNo);
        Assert.Equal(seed.DispatchId, asset.SourceDispatchId);
        Assert.Equal("SHP-SVC-001", asset.SourceDocumentNo);
        Assert.Equal(new DateOnly(2027, 5, 18), asset.WarrantyEndDate);
    }

    [Fact]
    public async Task WarrantyEntitlement_ResolvesPolicyAndExpiredClaimRequiresOverride()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedServiceBaseAsync(dbContext);
        var service = CreateService(dbContext);
        await service.CreateWarrantyPolicyAsync(new WarrantyPolicyUpsertRequest(
            1,
            "STD-365",
            "Standard 365 day warranty",
            seed.ItemId,
            null,
            null,
            365,
            "InstallationDate",
            true,
            true,
            false,
            false,
            null,
            null,
            "Active"));
        var asset = await service.CreateInstalledAssetAsync(BuildAssetRequest(seed, new DateOnly(2026, 5, 18), new DateOnly(2026, 6, 18)));

        var active = await service.ResolveEntitlementAsync(asset.Id, seed.CustomerId, seed.ItemId, new DateOnly(2026, 6, 1));
        var expired = await service.ResolveEntitlementAsync(asset.Id, seed.CustomerId, seed.ItemId, new DateOnly(2026, 7, 1));

        Assert.Equal("Warranty", active.EntitlementType);
        Assert.Equal("Paid", expired.EntitlementType);

        var ticket = await service.CreateServiceTicketAsync(BuildTicketRequest(seed, asset.Id, "SVC-CLAIM-001"));
        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.CreateWarrantyClaimAsync(new WarrantyClaimUpsertRequest(
                1,
                10,
                "WCL-EXP-001",
                ticket.Id,
                asset.Id,
                seed.CustomerId,
                seed.ItemId,
                "SER-001",
                "Repair",
                "Paid",
                expired.SnapshotJson,
                "Pending",
                null,
                null,
                null,
                null,
                null,
                "Draft")));

        Assert.Contains(ex.Errors, error => error.Code == "service.claim_entitlement_required");
    }

    [Fact]
    public async Task ServiceTicket_WorkflowRequiresGovernedReopenReason()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedServiceBaseAsync(dbContext);
        var service = CreateService(dbContext);
        var ticket = await service.CreateServiceTicketAsync(BuildTicketRequest(seed, null, "SVC-WF-001"));

        var assigned = await service.AssignServiceTicketAsync(ticket.Id, new ServiceTicketAssignmentRequest(77, null, DateTimeOffset.UtcNow.AddHours(4), DateTimeOffset.UtcNow.AddDays(1)));
        var closed = await service.ChangeServiceTicketStatusAsync(assigned.Id, new ServiceTicketStatusRequest("Closed", "Issue resolved and customer accepted."));

        Assert.Equal("Assigned", assigned.Status);
        Assert.Equal("Closed", closed.Status);
        Assert.NotNull(closed.ClosedOn);

        await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.UpdateServiceTicketAsync(closed.Id, BuildTicketRequest(seed, null, "SVC-WF-001")));

        var reopened = await service.ChangeServiceTicketStatusAsync(closed.Id, new ServiceTicketStatusRequest("Reopened", "Customer reported repeat issue."));
        Assert.Equal("Reopened", reopened.Status);
        Assert.Equal("Customer reported repeat issue.", reopened.ReopenReason);
    }

    [Fact]
    public async Task ServiceVisit_CompletionPersistsDiagnosisResolutionAndEvidenceMetadata()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedServiceBaseAsync(dbContext);
        var service = CreateService(dbContext);
        var ticket = await service.CreateServiceTicketAsync(BuildTicketRequest(seed, null, "SVC-VISIT-001"));
        await service.AssignServiceTicketAsync(ticket.Id, new ServiceTicketAssignmentRequest(77, null, null, null));

        var visit = await service.CreateServiceVisitAsync(new ServiceVisitUpsertRequest(
            1,
            10,
            ticket.Id,
            77,
            null,
            new DateTimeOffset(2026, 5, 19, 9, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 5, 19, 11, 0, 0, TimeSpan.Zero),
            "Customer plant",
            null,
            new DateTimeOffset(2026, 5, 19, 9, 15, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 5, 19, 10, 30, 0, TimeSpan.Zero),
            "Inspected unit and replaced consumable.",
            "Loose connector",
            "Connector reseated and tested.",
            "Asha Customer",
            new DateTimeOffset(2026, 5, 19, 10, 35, 0, TimeSpan.Zero),
            88001,
            99001,
            "Completed",
            "Customer signoff metadata captured."));

        Assert.Equal("Completed", visit.Status);
        Assert.Equal("Loose connector", visit.Diagnosis);
        Assert.Equal(88001, visit.EvidenceAttachmentId);
        Assert.Equal(99001, visit.PhotoEvidenceId);
    }

    [Fact]
    public async Task ServiceSpareIssue_UsesInventoryPostingAndBlocksMissingBin()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedServiceBaseAsync(dbContext, requiresBin: true);
        var service = CreateService(dbContext);
        var ticket = await service.CreateServiceTicketAsync(BuildTicketRequest(seed, null, "SVC-SPARE-001"));

        var missingBin = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.IssueServiceSpareAsync(new ServiceSpareMovementRequest(
                1,
                10,
                "SSI-MISS-BIN",
                ticket.Id,
                null,
                seed.ItemId,
                501,
                seed.WarehouseId,
                null,
                seed.LotId,
                null,
                null,
                null,
                1m,
                "Available",
                "Replace",
                "Missing bin rejected.",
                null,
                null,
                new DateOnly(2026, 5, 20),
                "SVC-SPARE-001")));

        Assert.Contains(missingBin.Errors, error => error.Code == "inventory.bin_required");
        Assert.Empty(await dbContext.StockTransactions.ToArrayAsync());

        var posted = await service.IssueServiceSpareAsync(new ServiceSpareMovementRequest(
            1,
            10,
            "SSI-POST-001",
            ticket.Id,
            null,
            seed.ItemId,
            501,
            seed.WarehouseId,
            seed.BinId,
            seed.LotId,
            null,
            null,
            null,
            2m,
            "Available",
            "Replace",
            "Spare issued through service.",
            null,
            null,
            new DateOnly(2026, 5, 20),
            "SVC-SPARE-001"));

        Assert.Equal("Posted", posted.Movement.Status);
        var txn = Assert.Single(await dbContext.StockTransactions.ToArrayAsync());
        Assert.Equal("ServiceSpareIssue", txn.SourceDocumentType);
        Assert.Equal(posted.Movement.Id, txn.SourceDocumentId);
        Assert.Equal(posted.Movement.Id, txn.SourceDocumentLineId);
        Assert.Equal(501, txn.ItemRevisionId);
        Assert.Equal(-2m, txn.Quantity);
    }

    [Fact]
    public async Task ServiceReports_ReadPersistedTicketAndChargeData()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedServiceBaseAsync(dbContext);
        var service = CreateService(dbContext);
        var ticket = await service.CreateServiceTicketAsync(BuildTicketRequest(seed, null, "SVC-RPT-001"));
        await service.CreateServiceChargeAsync(new ServiceChargeUpsertRequest(
            1,
            10,
            "SCH-001",
            ticket.Id,
            seed.CustomerId,
            null,
            100m,
            25m,
            10m,
            0m,
            0m,
            null,
            18m,
            24.3m,
            159.3m,
            "Billable",
            null,
            null,
            "InvoiceReady",
            "{\"source\":\"service-ticket\"}"));
        var reporting = CreateReportingService(dbContext);
        var definitions = await reporting.ListReportDefinitionsAsync(new ReportFilter(ReportCode: "SERVICE-TICKET-REGISTER"));
        var definition = Assert.Single(definitions.Items);

        var run = await reporting.RunReportAsync(definition.Id, new ReportRunRequest(new Dictionary<string, string?>(), "CSV"));

        Assert.Equal("Completed", run.Status);
        Assert.Contains("Entitlement", run.Columns);
        Assert.Contains(run.Rows, row => row.Values["Ticket No"] == "SVC-RPT-001");
    }

    private static ServiceTicketUpsertRequest BuildTicketRequest(ServiceSeed seed, long? assetId, string ticketNo) =>
        new(
            1,
            10,
            ticketNo,
            seed.CustomerId,
            null,
            assetId,
            seed.ItemId,
            "SER-001",
            "Breakdown",
            "Machine stopped during production.",
            "High",
            "Major",
            "Phone",
            null,
            null,
            null,
            null,
            null,
            "Registered",
            "Internal troubleshooting notes.",
            "Technician will visit.",
            seed.SalesOrderId,
            seed.DispatchId,
            seed.InvoiceId);

    private static InstalledAssetUpsertRequest BuildAssetRequest(ServiceSeed seed, DateOnly warrantyStart, DateOnly warrantyEnd) =>
        new(
            1,
            10,
            "AST-WAR-001",
            seed.CustomerId,
            null,
            null,
            seed.ItemId,
            501,
            null,
            "SER-001",
            seed.LotId,
            null,
            seed.SalesOrderId,
            seed.SalesOrderLineId,
            seed.DispatchId,
            seed.DispatchLineId,
            seed.InvoiceId,
            "Dispatch",
            "SHP-SVC-001",
            4,
            warrantyStart,
            warrantyStart,
            warrantyStart,
            warrantyEnd,
            null,
            "Active",
            "Customer line",
            null,
            false);

    private static ServiceManagementService CreateService(MfgDbContext dbContext)
    {
        var dataScope = new AllowAllDataScopeService();
        var currentUser = new TestCurrentUserContextAccessor();
        var audit = new TestAuditTrail();
        var policy = new InventoryPolicyService(dbContext, dataScope, currentUser, audit);
        var posting = new InventoryPostingService(dbContext, dataScope, currentUser, audit, policy);
        var inventory = new InventoryService(dbContext, dataScope, currentUser, audit, posting, policy);
        return new ServiceManagementService(dbContext, dataScope, currentUser, audit, inventory);
    }

    private static ReportingService CreateReportingService(MfgDbContext dbContext) =>
        new(dbContext, new AllowAllDataScopeService(), new TestCurrentUserContextAccessor(), new TestAuditTrail());

    private static MfgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .ConfigureWarnings(builder => builder.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new MfgDbContext(options);
    }

    private static async Task<ServiceSeed> SeedServiceBaseAsync(MfgDbContext dbContext, bool requiresBin = false)
    {
        var customer = Customer.Create(1, "CUST-SVC", "Service Customer", null, "OEM", 10, null, null, null, null, "Active", 77);
        dbContext.Customers.Add(customer);
        var warehouse = Warehouse.Create(1, 10, "SVC", "Service Warehouse", "Service", false, true, true, false, false, "Active", 77);
        dbContext.Warehouses.Add(warehouse);
        await dbContext.SaveChangesAsync();
        var bin = Bin.Create(1, 10, warehouse.Id, null, "SVC-A", "Service A", "Service", null, null, true, true, false, null, false, null, "Active", 77);
        dbContext.Bins.Add(bin);
        var item = Item.Create(
            1,
            "SP-SVC",
            "Service spare item",
            "SP",
            "Component",
            100,
            501,
            200,
            300,
            null,
            null,
            null,
            "Lot",
            false,
            false,
            true,
            "Manual",
            "Buy",
            warehouse.Id,
            bin.Id,
            1,
            "MinMax",
            "Active",
            77);
        dbContext.Items.Add(item);
        await dbContext.SaveChangesAsync();
        dbContext.ItemInventoryPolicies.Add(ItemInventoryPolicy.Create(
            1,
            item.Id,
            warehouse.Id,
            bin.Id,
            "None",
            "Lot",
            false,
            "Block",
            null,
            null,
            "Active",
            77,
            requiresBin,
            true,
            false));
        var lot = Lot.Create(1, item.Id, "LOT-SVC", new DateOnly(2026, 1, 1), new DateOnly(2027, 1, 1), "Available", null, 77);
        dbContext.Lots.Add(lot);
        await dbContext.SaveChangesAsync();
        dbContext.StockBalances.Add(StockBalance.Create(1, 10, item.Id, null, warehouse.Id, bin.Id, lot.Id, null, 10m, 0m, 0m, 0m, 0m, null, 77));
        await dbContext.SaveChangesAsync();

        var salesOrder = SalesOrder.Create(
            1,
            10,
            "SO-SVC-001",
            customer.Id,
            null,
            null,
            new DateOnly(2026, 5, 15),
            new DateOnly(2026, 5, 20),
            "Normal",
            "Released",
            null,
            null,
            null,
            77,
            "Service Owner",
            "Internal service handoff",
            "Customer service handoff",
            "Print service handoff",
            null,
            null,
            null,
            null,
            "GST",
            null,
            null,
            null,
            null,
            0m,
            0m,
            0m,
            0m,
            0m,
            0m,
            100m,
            0m,
            100m,
            18m,
            118m,
            "Released",
            new DateTimeOffset(2026, 5, 15, 8, 0, 0, TimeSpan.Zero),
            77,
            77);
        dbContext.SalesOrders.Add(salesOrder);
        await dbContext.SaveChangesAsync();
        var salesOrderLine = SalesOrderLine.Create(
            salesOrder.Id,
            10,
            item.Id,
            null,
            1,
            1m,
            "Make",
            new DateOnly(2026, 5, 20),
            "Normal",
            "Service serial",
            new DateOnly(2026, 5, 19),
            "Open",
            501,
            null,
            null,
            null,
            100m,
            "Snapshot",
            null,
            null,
            null,
            0m,
            0m,
            null,
            18m,
            18m,
            100m,
            100m,
            118m,
            "Internal",
            "Customer",
            null,
            77);
        dbContext.SalesOrderLines.Add(salesOrderLine);
        var shipment = Shipment.Create(
            1,
            10,
            "SHP-SVC-001",
            null,
            customer.Id,
            new DateOnly(2026, 5, 18),
            "MH-12-SVC",
            "LR-SVC",
            null,
            "Service installed-base source.",
            "STS Transport",
            "Driver",
            "9000000000",
            "Customer plant",
            "Delivered",
            new DateTimeOffset(2026, 5, 18, 9, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 5, 18, 12, 0, 0, TimeSpan.Zero),
            77);
        dbContext.Shipments.Add(shipment);
        var invoice = AccountsReceivableInvoice.Create(
            1,
            10,
            "AR-SVC-001",
            customer.Id,
            salesOrder.Id,
            shipment.Id,
            "SHP-SVC-001",
            new DateOnly(2026, 5, 18),
            new DateOnly(2026, 6, 17),
            "INR",
            1m,
            "Posted",
            77);
        dbContext.AccountsReceivableInvoices.Add(invoice);
        await dbContext.SaveChangesAsync();

        return new ServiceSeed(customer.Id, item.Id, warehouse.Id, bin.Id, lot.Id, salesOrder.Id, salesOrderLine.Id, shipment.Id, 9102, invoice.Id);
    }

    private sealed record ServiceSeed(long CustomerId, long ItemId, long WarehouseId, long BinId, long LotId, long SalesOrderId, long SalesOrderLineId, long DispatchId, long DispatchLineId, long InvoiceId);

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

    private sealed class TestCurrentUserContextAccessor : ICurrentUserContextAccessor
    {
        public CurrentUserContext GetCurrent() => GetRequired();
        public CurrentUserContext GetRequired() => new(true, 77, "service.tester", "Service Tester", "service.tester@sts.local", "en-IN", "web", 1, 10, ["ManagementViewer"]);
    }

    private sealed class TestAuditTrail : IAuditTrail
    {
        public Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
