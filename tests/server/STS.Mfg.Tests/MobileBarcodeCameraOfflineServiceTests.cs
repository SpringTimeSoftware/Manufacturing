using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Inventory;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;
using STS.Mfg.Application.Contracts.Mobile;
using STS.Mfg.Domain.Engineering;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Domain.Resources;
using STS.Mfg.Domain.ServiceManagement;
using STS.Mfg.Infrastructure.Inventory;
using STS.Mfg.Infrastructure.Mobile;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Tests;

public sealed class MobileBarcodeCameraOfflineServiceTests
{
    [Fact]
    public async Task DeviceRegistration_PersistsTrustAndRevokedDeviceCannotSyncPost()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);
        var device = await RegisterDeviceAsync(service, "MOB-REV", trusted: true);
        var payload = JsonSerializer.Serialize(new MobileStockSyncPayload(null, null, null, null, null, null, null, null));
        await service.QueueOfflineOperationAsync(new MobileOfflineOperationRequest(1, 10, null, device.DeviceCode, "StockIssue", "Inventory", payload, "idem-revoked", DateTimeOffset.UtcNow));
        var persisted = await dbContext.MobileDeviceRegistrations.SingleAsync();
        persisted.Revoke(77);
        await dbContext.SaveChangesAsync();

        var result = await service.SyncOfflineOperationsAsync(new MobileOfflineSyncRequest(device.DeviceCode, ["idem-revoked"]));

        var synced = Assert.Single(result);
        Assert.Equal("Conflict", synced.Status);
        Assert.Contains("revoked", synced.ConflictReason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task BarcodeResolution_UsesLiveItemBarcodeAndPersistsScanEvent()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedInventoryAsync(dbContext, requiresLot: false, requiresBin: false);
        dbContext.ItemBarcodes.Add(ItemBarcode.Create(1, seed.ItemId, null, null, "BC-LIVE-001", "QR", "Mobile", 1, true, "Active", 77));
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext);
        var device = await RegisterDeviceAsync(service, "MOB-SCAN", trusted: true);

        var result = await service.ResolveScanAsync(new MobileScanResolveRequest(1, 10, seed.WarehouseId, device.DeviceCode, "BC-LIVE-001", "Hardware", "MaterialIssue", DateTimeOffset.UtcNow));

        Assert.Equal("Resolved", result.ResolutionStatus);
        Assert.Equal("Item", result.ResolvedEntityType);
        Assert.Equal(seed.ItemId, result.ResolvedEntityId);
        Assert.Single(await dbContext.MobileScanEvents.ToListAsync());
    }

    [Fact]
    public async Task InvalidBarcode_ReturnsClearReasonAndNoFakeSuccess()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);
        var device = await RegisterDeviceAsync(service, "MOB-BAD-SCAN", trusted: true);

        var result = await service.ResolveScanAsync(new MobileScanResolveRequest(1, 10, null, device.DeviceCode, "UNKNOWN-CODE", "Manual", "Lookup", DateTimeOffset.UtcNow));

        Assert.Equal("NotFound", result.ResolutionStatus);
        Assert.Contains("did not resolve", result.ValidationMessage, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task OfflineSync_RerunsInventoryValidationAndCreatesConflictForQualityHold()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedInventoryAsync(dbContext, requiresLot: true, requiresBin: true, qcHoldQuantity: 5m);
        var service = CreateService(dbContext);
        var device = await RegisterDeviceAsync(service, "MOB-QC-HOLD", trusted: true);
        var validationRequest = new StockMovementValidationRequest(
            1,
            10,
            new DateOnly(2026, 5, 18),
            "Dispatch",
            9501,
            [
                new StockMovementValidationLineRequest(
                    10,
                    "Issue",
                    seed.ItemId,
                    null,
                    seed.WarehouseId,
                    seed.BinId,
                    null,
                    null,
                    seed.LotId,
                    null,
                    null,
                    1m,
                    "QC_Hold",
                    SourceDocumentNo: "SHIP-9501")
            ]);
        var payload = JsonSerializer.Serialize(new MobileStockSyncPayload(validationRequest, null, null, null, null, null, null, null));
        await service.QueueOfflineOperationAsync(new MobileOfflineOperationRequest(1, 10, seed.WarehouseId, device.DeviceCode, "DispatchPick", "Dispatch", payload, "idem-qc-hold", DateTimeOffset.UtcNow));

        var result = await service.SyncOfflineOperationsAsync(new MobileOfflineSyncRequest(device.DeviceCode, ["idem-qc-hold"]));

        var operation = Assert.Single(result);
        Assert.Equal("Conflict", operation.Status);
        Assert.Contains("available stock", operation.ConflictReason, StringComparison.OrdinalIgnoreCase);
        Assert.Single(await dbContext.MobileSyncConflicts.ToListAsync());
        Assert.Empty(await dbContext.StockTransactions.ToListAsync());
    }

    [Fact]
    public async Task OfflineStockIssue_PostsThroughInventoryServiceAndIdempotencyPreventsDuplicate()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedInventoryAsync(dbContext, requiresLot: true, requiresBin: true);
        var service = CreateService(dbContext);
        var device = await RegisterDeviceAsync(service, "MOB-STOCK-POST", trusted: true);
        var issue = new StockIssueRequest(
            1,
            10,
            "MOB-ISS-001",
            new DateOnly(2026, 5, 18),
            "MobileInventory",
            1001,
            "Mobile offline stock issue",
            [
                new StockIssueLineRequest(
                    10,
                    seed.ItemId,
                    null,
                    seed.WarehouseId,
                    seed.BinId,
                    seed.LotId,
                    null,
                    2m,
                    null,
                    "Available",
                    SourceDocumentNo: "MOB-ISS-001",
                    SourceDocumentLineId: 10)
            ]);
        var payload = JsonSerializer.Serialize(new MobileStockSyncPayload(null, issue, null, null, null, null, null, null));

        await service.QueueOfflineOperationAsync(new MobileOfflineOperationRequest(1, 10, seed.WarehouseId, device.DeviceCode, "StockIssue", "Inventory", payload, "idem-stock-post", DateTimeOffset.UtcNow));
        var firstSync = await service.SyncOfflineOperationsAsync(new MobileOfflineSyncRequest(device.DeviceCode, ["idem-stock-post"]));
        var secondSync = await service.SyncOfflineOperationsAsync(new MobileOfflineSyncRequest(device.DeviceCode, ["idem-stock-post"]));

        Assert.Equal("Synced", Assert.Single(firstSync).Status);
        Assert.Empty(secondSync);
        Assert.Single(await dbContext.StockTransactions.ToListAsync());
        var operation = await dbContext.MobileOfflineOperations.SingleAsync();
        Assert.Equal("StockIssue", operation.ServerReferenceType);
    }

    [Fact]
    public async Task PhotoEvidence_MetadataPersistsPendingUploadWithoutFakeSuccess()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);
        var device = await RegisterDeviceAsync(service, "MOB-PHOTO", trusted: true);

        var evidence = await service.CapturePhotoEvidenceAsync(new MobilePhotoEvidenceRequest(
            1,
            10,
            null,
            device.DeviceCode,
            "Dispatch",
            "Shipment",
            5001,
            "SHIP-5001",
            "POD",
            "pod-5001.jpg",
            "image/jpeg",
            null,
            DateTimeOffset.UtcNow,
            "{\"source\":\"camera\"}"));

        Assert.Equal("PendingUpload", evidence.UploadStatus);
        Assert.Contains("pending", evidence.FailureReason, StringComparison.OrdinalIgnoreCase);
        Assert.Single(await dbContext.MobilePhotoEvidence.ToListAsync());
    }

    [Fact]
    public async Task MobilePodCannotSyncBeforeShipment()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);
        var device = await RegisterDeviceAsync(service, "MOB-POD", trusted: true);
        var payload = JsonSerializer.Serialize(new MobileStockSyncPayload(null, null, null, null, "Draft", "R Mehta", DateTimeOffset.UtcNow, "Received at gate"));
        await service.QueueOfflineOperationAsync(new MobileOfflineOperationRequest(1, 10, null, device.DeviceCode, "MobilePod", "Dispatch", payload, "idem-pod", DateTimeOffset.UtcNow));

        var result = await service.SyncOfflineOperationsAsync(new MobileOfflineSyncRequest(device.DeviceCode, ["idem-pod"]));

        var operation = Assert.Single(result);
        Assert.Equal("Conflict", operation.Status);
        Assert.Contains("before the shipment", operation.ConflictReason, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task MobileTasks_IncludePersistedServiceTicketsAndServiceScanResolvesLiveTicket()
    {
        await using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);
        var device = await RegisterDeviceAsync(service, "MOB-SERVICE", trusted: true);
        var ticket = ServiceTicket.Create(
            new ServiceTicketDraft(
                1,
                10,
                "SVC-MOB-001",
                7001,
                null,
                null,
                null,
                null,
                "Breakdown",
                "Mobile technician assignment.",
                "High",
                "Major",
                "Phone",
                null,
                77,
                null,
                null,
                null,
                "Assigned",
                "Internal service note.",
                "Technician assigned.",
                null,
                null,
                null),
            new EntitlementSnapshot("Paid", "NoConfiguredDefault", null, null, null, null, new DateOnly(2026, 5, 18), "{\"source\":\"test\"}"),
            null,
            77);
        dbContext.ServiceTickets.Add(ticket);
        await dbContext.SaveChangesAsync();

        var tasks = await service.ListTasksAsync(device.DeviceCode);
        var scan = await service.ResolveScanAsync(new MobileScanResolveRequest(1, 10, null, device.DeviceCode, "SERVICE:SVC-MOB-001", "Hardware", "ServiceTicket", DateTimeOffset.UtcNow));

        var serviceTask = Assert.Single(tasks.Where(task => task.Module == "Service"));
        Assert.Equal("ServiceTicketJob", serviceTask.TaskType);
        Assert.Equal("SVC-MOB-001", serviceTask.DocumentNo);
        Assert.Equal("Resolved", scan.ResolutionStatus);
        Assert.Equal("ServiceTicket", scan.ResolvedEntityType);
    }

    private static MobileRuntimeService CreateService(MfgDbContext dbContext)
    {
        var dataScope = new AllowAllDataScopeService();
        var currentUser = new TestCurrentUserContextAccessor();
        var auditTrail = new TestAuditTrail();
        var policyService = new InventoryPolicyService(dbContext, dataScope, currentUser, auditTrail);
        var postingService = new InventoryPostingService(dbContext, dataScope, currentUser, auditTrail, policyService);
        var inventoryService = new InventoryService(dbContext, dataScope, currentUser, auditTrail, postingService, policyService);
        return new MobileRuntimeService(dbContext, dataScope, currentUser, auditTrail, policyService, inventoryService);
    }

    private static async Task<MobileDeviceRegistrationDto> RegisterDeviceAsync(MobileRuntimeService service, string deviceCode, bool trusted)
    {
        return await service.RegisterDeviceAsync(new MobileDeviceRegistrationRequest(
            1,
            10,
            null,
            deviceCode,
            $"Device {deviceCode}",
            "PWA",
            "ReactNative",
            "1.0.0",
            "Windows",
            "Test runtime",
            "HardwareCameraManual",
            "Available",
            true,
            "secret://mobile/test-device",
            trusted));
    }

    private static MfgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .ConfigureWarnings(builder => builder.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new MfgDbContext(options);
    }

    private static async Task<SeedIds> SeedInventoryAsync(MfgDbContext dbContext, bool requiresLot, bool requiresBin, decimal qcHoldQuantity = 0m)
    {
        var warehouse = Warehouse.Create(1, 10, "WH-MOB", "Mobile warehouse", "Stores", true, true, true, false, false, "Active", 77);
        dbContext.Warehouses.Add(warehouse);
        await dbContext.SaveChangesAsync();

        var bin = Bin.Create(1, 10, warehouse.Id, null, "BIN-MOB", "Mobile bin", "Storage", null, null, true, true, false, null, false, null, "Active", 77);
        dbContext.Bins.Add(bin);

        var item = Item.Create(
            1,
            $"MOB-ITEM-{Guid.NewGuid():N}"[..18],
            "Mobile tracked item",
            null,
            "RawMaterial",
            100,
            200,
            300,
            null,
            null,
            null,
            null,
            requiresLot ? "Lot" : "None",
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
            "None",
            requiresLot ? "Lot" : "None",
            false,
            "Block",
            null,
            null,
            "Active",
            77,
            true,
            requiresBin,
            false));

        var routing = Routing.Create(1, "MOB-ROUTE", "Mobile Route", item.Id, "R1", "Released", 77);
        dbContext.Routings.Add(routing);
        await dbContext.SaveChangesAsync();

        var bom = Bom.Create(1, item.Id, "MOB-BOM", "Mobile BOM", "Active", 77);
        dbContext.Boms.Add(bom);
        await dbContext.SaveChangesAsync();

        var bomRevision = BomRevision.Create(bom.Id, "R1", new DateOnly(2026, 1, 1), null, "Released", routing.Id, "Released", false, 77);
        dbContext.BomRevisions.Add(bomRevision);

        Lot? lot = null;
        if (requiresLot)
        {
            lot = Lot.Create(1, item.Id, "LOT-MOB", new DateOnly(2026, 1, 1), new DateOnly(2027, 1, 1), "Available", null, 77);
            dbContext.Lots.Add(lot);
        }

        await dbContext.SaveChangesAsync();

        dbContext.StockBalances.Add(StockBalance.Create(
            1,
            10,
            item.Id,
            null,
            warehouse.Id,
            requiresBin ? bin.Id : null,
            lot?.Id,
            null,
            5m,
            0m,
            qcHoldQuantity,
            0m,
            0m,
            null,
            77));
        await dbContext.SaveChangesAsync();

        return new SeedIds(item.Id, warehouse.Id, bin.Id, lot?.Id, bomRevision.Id, routing.Id);
    }

    private sealed record SeedIds(long ItemId, long WarehouseId, long BinId, long? LotId, long BomRevisionId, long RoutingId);

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
            new(true, 77, "mobile.tester", "Mobile Tester", "mobile.tester@sts.local", "en-IN", "mobile", 1, 10, []);
    }

    private sealed class TestAuditTrail : IAuditTrail
    {
        public Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
