using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Domain.Engineering;
using STS.Mfg.Domain.Production;
using STS.Mfg.Domain.Resources;
using STS.Mfg.Infrastructure.Inventory;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Tests;

public sealed class InventoryPolicyServiceTests
{
    [Fact]
    public async Task IssueAsync_RequiresGovernedBinLotAndSerialBeforePosting()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedInventoryAsync(dbContext, requiresSerial: true, requiresLot: true, requiresBin: true);
        var service = CreatePostingService(dbContext);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.IssueAsync(
                new InventoryIssueCommand(
                    1,
                    10,
                    "ISS-MISS-001",
                    new DateOnly(2026, 5, 16),
                    "WorkOrder",
                    9001,
                    "Missing tracking dimensions",
                    "stock.issue",
                    new[]
                    {
                        new InventoryIssueLine(
                            10,
                            "Issue",
                            seed.ItemId,
                            null,
                            seed.WarehouseId,
                            null,
                            1m,
                            null,
                            "Available")
                    })));

        Assert.Contains(ex.Errors, error => error.Code == "inventory.bin_required");
        Assert.Contains(ex.Errors, error => error.Code == "inventory.lot_required");
        Assert.Contains(ex.Errors, error => error.Code == "inventory.serial_required");
        Assert.Empty(await dbContext.StockTransactions.ToListAsync());
    }

    [Fact]
    public async Task IssueAsync_BlocksQualityHeldStockAndDoesNotCreatePartialTransactions()
    {
        var dbName = Guid.NewGuid().ToString("N");
        await using (var dbContext = CreateDbContext(dbName))
        {
            var seed = await SeedInventoryAsync(dbContext, requiresSerial: false, requiresLot: true, requiresBin: true);
            var service = CreatePostingService(dbContext);

            await Assert.ThrowsAsync<ValidationFailureException>(() =>
                service.IssueAsync(
                    new InventoryIssueCommand(
                        1,
                        10,
                        "ISS-QC-001",
                        new DateOnly(2026, 5, 16),
                        "WorkOrder",
                        9002,
                        "Reject QC hold issue",
                        "stock.issue",
                        new[]
                        {
                            new InventoryIssueLine(
                                10,
                                "Issue",
                                seed.ItemId,
                                null,
                                seed.WarehouseId,
                                seed.BinId,
                                1m,
                                null,
                                "Available",
                                seed.LotId),
                            new InventoryIssueLine(
                                20,
                                "Issue",
                                seed.ItemId,
                                null,
                                seed.WarehouseId,
                                seed.BinId,
                                1m,
                                null,
                                "QC_Hold",
                                seed.LotId)
                        })));
        }

        await using (var verification = CreateDbContext(dbName))
        {
            Assert.Empty(await verification.StockTransactions.ToListAsync());
            var balance = await verification.StockBalances.SingleAsync();
            Assert.Equal(5m, balance.OnHandQty);
        }
    }

    [Fact]
    public async Task TransferAsync_PersistsPcidAndSourceRevisionSnapshots()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedInventoryAsync(dbContext, requiresSerial: false, requiresLot: true, requiresBin: true, requiresPcid: true);
        var targetBin = Bin.Create(1, 10, seed.WarehouseId, null, "BIN-B", "Bin B", "Storage", null, null, false, false, false, null, false, null, "Active", 77);
        dbContext.Bins.Add(targetBin);
        await dbContext.SaveChangesAsync();

        var service = CreatePostingService(dbContext);
        var result = await service.TransferAsync(
            new InventoryTransferCommand(
                1,
                10,
                "TRF-PCID-001",
                new DateOnly(2026, 5, 16),
                "WorkOrder",
                9003,
                "Move license plate to staging",
                "stock.transfer",
                new[]
                {
                    new InventoryTransferLine(
                        10,
                        "Transfer",
                        seed.ItemId,
                        null,
                        seed.WarehouseId,
                        seed.BinId,
                        seed.WarehouseId,
                        targetBin.Id,
                        2m,
                        null,
                        "Available",
                        "Available",
                        seed.LotId,
                        null,
                        null,
                        null,
                        null,
                        null,
                        seed.PcidId,
                        null,
                        "WO-9003",
                        55,
                        2,
                        7,
                        501,
                        null,
                        seed.BomRevisionId,
                        seed.RoutingId,
                        null,
                        seed.WorkOrderId)
                }));

        var movement = Assert.Single(result);
        Assert.Equal(seed.PcidId, movement.PcidId);
        Assert.Equal("WO-9003", movement.SourceDocumentNo);
        Assert.Equal(55, movement.SourceDocumentLineId);
        Assert.Equal(2, movement.SourceDocumentRevisionNo);
        Assert.Equal(501, movement.ItemRevisionId);
        Assert.Equal(seed.BomRevisionId, movement.BomRevisionId);
        Assert.Equal(seed.RoutingId, movement.RoutingId);
        Assert.Equal(seed.WorkOrderId, movement.WorkOrderId);

        var pcid = await dbContext.InventoryLicensePlates.SingleAsync();
        Assert.Equal(targetBin.Id, pcid.BinId);
    }

    [Fact]
    public async Task ReceiveAsync_AllowsReceiptIntoEmptyActivePcidAndCreatesContent()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedInventoryAsync(dbContext, requiresSerial: false, requiresLot: false, requiresBin: true, requiresPcid: true);
        var emptyPcid = InventoryLicensePlate.Create(1, 10, "PCID-EMPTY", "Pallet", seed.WarehouseId, seed.BinId, "Available", 77);
        dbContext.InventoryLicensePlates.Add(emptyPcid);
        await dbContext.SaveChangesAsync();

        var service = CreatePostingService(dbContext);
        var result = await service.ReceiveAsync(
            new InventoryReceiptCommand(
                1,
                10,
                "RCPT-PCID-001",
                new DateOnly(2026, 5, 16),
                "GRN",
                91001,
                "Receive into empty PCID",
                "stock.receipt",
                new[]
                {
                    new InventoryReceiptLine(
                        10,
                        "Receipt",
                        seed.ItemId,
                        null,
                        seed.WarehouseId,
                        seed.BinId,
                        2m,
                        null,
                        "Available",
                        PcidId: emptyPcid.Id,
                        SourceDocumentNo: "GRN-91001",
                        SourceDocumentLineId: 101)
                }));

        var movement = Assert.Single(result);
        Assert.Equal(emptyPcid.Id, movement.PcidId);
        Assert.Equal("GRN-91001", movement.SourceDocumentNo);
        Assert.Equal(101, movement.SourceDocumentLineId);

        var content = await dbContext.InventoryLicensePlateContents.SingleAsync(record => record.LicensePlateId == emptyPcid.Id);
        Assert.Equal(2m, content.Quantity);

        var balance = await dbContext.StockBalances.SingleAsync(record => record.PcidId == emptyPcid.Id);
        Assert.Equal(2m, balance.OnHandQty);
    }

    [Fact]
    public async Task ValidateMovementAsync_DoesNotUseLatestRevisionFallback()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedInventoryAsync(dbContext, requiresSerial: false, requiresLot: false, requiresBin: true);
        var policyService = CreatePolicyService(dbContext);

        var result = await policyService.ValidateMovementAsync(
            new StockMovementValidationRequest(
                1,
                10,
                new DateOnly(2026, 5, 16),
                "WorkOrder",
                9004,
                new[]
                {
                    new StockMovementValidationLineRequest(
                        10,
                        "Issue",
                        seed.ItemId,
                        null,
                        seed.WarehouseId,
                        seed.BinId,
                        null,
                        null,
                        null,
                        null,
                        null,
                        1m,
                        "Available",
                        BomRevisionId: 987654)
                }));

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.Code == "inventory.bom_revision_not_found");
    }

    private static InventoryPostingService CreatePostingService(MfgDbContext dbContext)
    {
        var dataScope = new AllowAllDataScopeService();
        var currentUser = new TestCurrentUserContextAccessor();
        var auditTrail = new TestAuditTrail();
        return new InventoryPostingService(
            dbContext,
            dataScope,
            currentUser,
            auditTrail,
            new InventoryPolicyService(dbContext, dataScope, currentUser, auditTrail));
    }

    private static InventoryPolicyService CreatePolicyService(MfgDbContext dbContext)
    {
        var dataScope = new AllowAllDataScopeService();
        var currentUser = new TestCurrentUserContextAccessor();
        var auditTrail = new TestAuditTrail();
        return new InventoryPolicyService(dbContext, dataScope, currentUser, auditTrail);
    }

    private static MfgDbContext CreateDbContext(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString("N"))
            .ConfigureWarnings(builder => builder.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new MfgDbContext(options);
    }

    private static async Task<SeedIds> SeedInventoryAsync(
        MfgDbContext dbContext,
        bool requiresSerial,
        bool requiresLot,
        bool requiresBin,
        bool requiresPcid = false)
    {
        var warehouse = Warehouse.Create(1, 10, "WH-A", "Warehouse A", "Stores", true, true, true, false, false, "Active", 77);
        dbContext.Warehouses.Add(warehouse);
        await dbContext.SaveChangesAsync();

        var bin = Bin.Create(1, 10, warehouse.Id, null, "BIN-A", "Bin A", "Storage", null, null, true, true, false, null, false, null, "Active", 77);
        dbContext.Bins.Add(bin);

        var item = Item.Create(
            1,
            "RM-POLICY",
            "Policy raw material",
            "RM",
            "RawMaterial",
            100,
            200,
            300,
            null,
            null,
            null,
            null,
            requiresSerial ? "Serial" : requiresLot ? "Lot" : "None",
            false,
            false,
            requiresLot,
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
            requiresSerial ? "Serial" : "None",
            requiresLot ? "Lot" : "None",
            false,
            "Block",
            null,
            null,
            "Active",
            77,
            true,
            requiresBin,
            requiresPcid));

        var routing = Routing.Create(1, "ROUTE-A", "Route A", item.Id, "R1", "Released", 77);
        dbContext.Routings.Add(routing);
        await dbContext.SaveChangesAsync();

        var bom = Bom.Create(1, item.Id, "BOM-A", "BOM A", "Active", 77);
        dbContext.Boms.Add(bom);
        await dbContext.SaveChangesAsync();

        var bomRevision = BomRevision.Create(bom.Id, "R1", new DateOnly(2026, 1, 1), null, "Released", routing.Id, "Released for production", false, 77);
        dbContext.BomRevisions.Add(bomRevision);
        await dbContext.SaveChangesAsync();

        var workOrder = WorkOrder.Create(1, 10, "WO-9003", null, item.Id, bomRevision.Id, routing.Id, 5m, 300, new DateOnly(2026, 5, 16), new DateOnly(2026, 5, 20), "Released", null, 77);
        dbContext.WorkOrders.Add(workOrder);
        await dbContext.SaveChangesAsync();

        var lot = Lot.Create(1, item.Id, "LOT-A", new DateOnly(2026, 1, 1), new DateOnly(2027, 1, 1), "Available", null, 77);
        dbContext.Lots.Add(lot);
        await dbContext.SaveChangesAsync();

        Serial? serial = null;
        if (requiresSerial)
        {
            serial = Serial.Create(1, item.Id, "SER-A", lot.Id, warehouse.Id, bin.Id, "Available", null, null, 77);
            dbContext.Serials.Add(serial);
            await dbContext.SaveChangesAsync();
        }

        InventoryLicensePlate? pcid = null;
        if (requiresPcid)
        {
            pcid = InventoryLicensePlate.Create(1, 10, "PCID-A", "Pallet", warehouse.Id, bin.Id, "Available", 77);
            dbContext.InventoryLicensePlates.Add(pcid);
            await dbContext.SaveChangesAsync();
            dbContext.InventoryLicensePlateContents.Add(InventoryLicensePlateContent.Create(1, pcid.Id, item.Id, null, lot.Id, null, 5m, "Available", "Active", 77));
        }

        dbContext.StockBalances.Add(StockBalance.Create(1, 10, item.Id, null, warehouse.Id, bin.Id, lot.Id, serial?.Id, 5m, 0m, 0m, 0m, 0m, null, 77, pcid?.Id));
        await dbContext.SaveChangesAsync();

        return new SeedIds(item.Id, warehouse.Id, bin.Id, lot.Id, serial?.Id, pcid?.Id, bomRevision.Id, routing.Id, workOrder.Id);
    }

    private sealed record SeedIds(long ItemId, long WarehouseId, long BinId, long LotId, long? SerialId, long? PcidId, long BomRevisionId, long RoutingId, long WorkOrderId);

    private sealed class AllowAllDataScopeService : IDataScopeService
    {
        private static readonly DataScopeContext Scope = new(
            77,
            1,
            10,
            true,
            RecordVisibilityMode.AllInScope,
            [1],
            [10],
            [],
            [1],
            [],
            []);

        public DataScopeContext GetCurrentScope() => Scope;
        public void EnsureContextAccess(long? companyId, long? branchId) { }
        public void EnsureWarehouseAccess(long? warehouseId) { }
        public void EnsureDepartmentAccess(long? departmentId) { }
        public void EnsureRecordAccess(long? ownerUserId) { }
        public IReadOnlyDictionary<string, object?> CreateStoredProcedureScope(long? warehouseId = null, long? departmentId = null, long? ownerUserId = null) =>
            new Dictionary<string, object?>();
    }

    private sealed class TestCurrentUserContextAccessor : ICurrentUserContextAccessor
    {
        public CurrentUserContext GetCurrent() => GetRequired();

        public CurrentUserContext GetRequired() =>
            new(true, 77, "inventory.tester", "Inventory Tester", "inventory.tester@sts.local", "en-IN", "web", 1, 10, []);
    }

    private sealed class TestAuditTrail : IAuditTrail
    {
        public List<AuditEntryDraft> Entries { get; } = [];

        public Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default)
        {
            Entries.Add(entry);
            return Task.CompletedTask;
        }
    }
}
