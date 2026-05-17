using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Dispatch;
using STS.Mfg.Application.Contracts.Production;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Domain.SalesPlanning;
using STS.Mfg.Infrastructure.Dispatch;
using STS.Mfg.Infrastructure.Inventory;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Tests;

public sealed class DispatchLogisticsPodServiceTests
{
    [Fact]
    public async Task CreateShipmentAsync_PostsInventoryIssueWithPcidAndSalesOrderSnapshot()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedDispatchAsync(dbContext, requiresPcid: true);
        var service = CreateDispatchService(dbContext);

        var shipment = await service.CreateShipmentAsync(new ShipmentUpsertRequest(
            1,
            10,
            "SHP-0001",
            null,
            seed.CustomerId,
            new DateOnly(2026, 5, 16),
            "MH-12-AB-1001",
            "LR-7788",
            "SEAL-1",
            "Loaded with dispatch proof.",
            "STS Transport",
            "Ravi Driver",
            "9000000000",
            "Customer DC, Pune",
            "Dispatched",
            new[]
            {
                new ShipmentLineRequest(
                    10,
                    null,
                    seed.SalesOrderLineId,
                    seed.ItemId,
                    null,
                    seed.WarehouseId,
                    seed.BinId,
                    seed.LotId,
                    null,
                    seed.PcidId,
                    2m,
                    seed.UomId,
                    "Shipped")
            }));

        var line = Assert.Single(shipment.Lines);
        Assert.Equal(seed.SalesOrderId, line.SalesOrderId);
        Assert.Equal("SO-DISP-001", line.SourceDocumentNo);
        Assert.Equal(seed.SalesOrderLineId, line.SourceDocumentLineId);
        Assert.Equal(4, line.SourceDocumentRevisionNo);
        Assert.Equal(seed.ItemRevisionId, line.ItemRevisionId);
        Assert.Equal(125m, line.UnitPrice);
        Assert.Equal(25m, line.TaxAmount);

        var movement = Assert.Single(shipment.StockTransactions);
        Assert.Equal("Shipment", movement.SourceDocumentType);
        Assert.Equal(shipment.Id, movement.SourceDocumentId);
        Assert.Equal(line.Id, movement.SourceDocumentLineId);
        Assert.Equal(seed.SalesOrderId, movement.SalesOrderId);
        Assert.Equal(seed.SalesOrderLineId, movement.SalesOrderLineId);
        Assert.Equal(seed.PcidId, movement.PcidId);
        Assert.Equal(-2m, movement.Quantity);
        Assert.Equal(seed.ItemRevisionId, movement.ItemRevisionId);
    }

    [Fact]
    public async Task CreateShipmentAsync_BlocksDispatchBeyondSalesOrderOpenQuantity()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedDispatchAsync(dbContext, requiresPcid: false);
        var service = CreateDispatchService(dbContext);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.CreateShipmentAsync(new ShipmentUpsertRequest(
                1,
                10,
                "SHP-OVER-001",
                null,
                seed.CustomerId,
                new DateOnly(2026, 5, 16),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "Dispatched",
                new[]
                {
                    new ShipmentLineRequest(
                        10,
                        null,
                        seed.SalesOrderLineId,
                        seed.ItemId,
                        null,
                        seed.WarehouseId,
                        seed.BinId,
                        seed.LotId,
                        null,
                        null,
                        6m,
                        seed.UomId,
                        "Shipped")
                })));

        Assert.Contains(ex.Errors, error => error.Code == "dispatch.sales_order_quantity_exceeded");
        Assert.Empty(await dbContext.StockTransactions.ToListAsync());
    }

    [Fact]
    public async Task CreateShipmentAsync_AllowsMultiplePartialDispatchesAgainstSalesOrderBalance()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedDispatchAsync(dbContext, requiresPcid: false);
        var service = CreateDispatchService(dbContext);

        await service.CreateShipmentAsync(new ShipmentUpsertRequest(
            1,
            10,
            "SHP-PART-001",
            null,
            seed.CustomerId,
            new DateOnly(2026, 5, 16),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "Dispatched",
            new[] { BuildShipmentLine(seed, 10, 2m) }));

        var second = await service.CreateShipmentAsync(new ShipmentUpsertRequest(
            1,
            10,
            "SHP-PART-002",
            null,
            seed.CustomerId,
            new DateOnly(2026, 5, 17),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "Dispatched",
            new[] { BuildShipmentLine(seed, 10, 3m) }));

        Assert.Equal(3m, Assert.Single(second.Lines).ShippedQuantity);
        Assert.Equal(-5m, await dbContext.StockTransactions.SumAsync(record => record.Quantity));
    }

    [Fact]
    public async Task CreateShipmentAsync_RequiresPcidWhenInventoryPolicyRequiresIt()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedDispatchAsync(dbContext, requiresPcid: true);
        var service = CreateDispatchService(dbContext);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.CreateShipmentAsync(new ShipmentUpsertRequest(
                1,
                10,
                "SHP-PCID-REQ",
                null,
                seed.CustomerId,
                new DateOnly(2026, 5, 16),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "Dispatched",
                new[] { BuildShipmentLine(seed, 10, 1m, pcidId: null) })));

        Assert.Contains(ex.Errors, error => error.Code == "inventory.pcid_required");
        Assert.Empty(await dbContext.StockTransactions.ToListAsync());
    }

    [Fact]
    public async Task CreateShipmentAsync_BlocksQualityHeldStockFromDispatch()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedDispatchAsync(dbContext, requiresPcid: false, availableQuantity: 0m, qcHoldQuantity: 5m);
        var service = CreateDispatchService(dbContext);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.CreateShipmentAsync(new ShipmentUpsertRequest(
                1,
                10,
                "SHP-QC-HOLD",
                null,
                seed.CustomerId,
                new DateOnly(2026, 5, 16),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "Dispatched",
                new[] { BuildShipmentLine(seed, 10, 1m) })));

        Assert.Contains(ex.Errors, error => error.Code == "inventory.insufficient_qty");
        Assert.Empty(await dbContext.StockTransactions.ToListAsync());
    }

    [Fact]
    public async Task CreateShipmentAsync_BlocksShipmentQuantityBeyondPackedQuantity()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedDispatchAsync(dbContext, requiresPcid: false);
        var service = CreateDispatchService(dbContext);
        var pack = await service.CreatePackListAsync(new PackListUpsertRequest(
            1,
            10,
            "PACK-0001",
            seed.SalesOrderId,
            new DateOnly(2026, 5, 16),
            "Packed",
            "Two pieces packed.",
            new[]
            {
                new PackListLineRequest(
                    10,
                    seed.SalesOrderLineId,
                    seed.ItemId,
                    null,
                    seed.WarehouseId,
                    seed.BinId,
                    seed.LotId,
                    null,
                    null,
                    2m,
                    seed.UomId,
                    "Carton 1",
                    "Packed")
            }));
        var packLine = Assert.Single(pack.Lines);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.CreateShipmentAsync(new ShipmentUpsertRequest(
                1,
                10,
                "SHP-PACK-OVER",
                pack.Id,
                seed.CustomerId,
                new DateOnly(2026, 5, 16),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "Dispatched",
                new[] { BuildShipmentLine(seed, 10, 3m, packListLineId: packLine.Id) })));

        Assert.Contains(ex.Errors, error => error.Code == "dispatch.pack_quantity_exceeded");
    }

    [Fact]
    public async Task UpdateShipmentProofAsync_BlocksPodBeforeShipmentDispatched()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedDispatchAsync(dbContext, requiresPcid: false);
        var service = CreateDispatchService(dbContext);

        var shipment = await service.CreateShipmentAsync(new ShipmentUpsertRequest(
            1,
            10,
            "SHP-LOADING-001",
            null,
            seed.CustomerId,
            new DateOnly(2026, 5, 16),
            null,
            null,
            null,
            "Loading only.",
            null,
            null,
            null,
            null,
            "Loading",
            Array.Empty<ShipmentLineRequest>()));

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.UpdateShipmentProofAsync(shipment.Id, new ShipmentProofRequest(
                null,
                null,
                null,
                "Delivered at dock.",
                "Delivered",
                "Ajay Receiver",
                "9111111111",
                new DateTimeOffset(2026, 5, 16, 12, 0, 0, TimeSpan.Zero),
                null,
                "No shortage.",
                Array.Empty<ShipmentProofLineRequest>(),
                DeliveredOn: new DateTimeOffset(2026, 5, 16, 12, 0, 0, TimeSpan.Zero))));

        Assert.Contains(ex.Errors, error => error.Code == "dispatch.pod_before_shipment");
    }

    [Fact]
    public async Task UpdateShipmentProofAsync_PersistsPodHeaderAndLineQuantities()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedDispatchAsync(dbContext, requiresPcid: false);
        var service = CreateDispatchService(dbContext);

        var shipment = await service.CreateShipmentAsync(new ShipmentUpsertRequest(
            1,
            10,
            "SHP-POD-001",
            null,
            seed.CustomerId,
            new DateOnly(2026, 5, 16),
            "MH-12-AB-1002",
            "LR-9900",
            "SEAL-2",
            "Dispatched with one short piece risk.",
            "STS Transport",
            "Ravi Driver",
            "9000000000",
            "Customer DC, Pune",
            "Dispatched",
            new[]
            {
                new ShipmentLineRequest(
                    10,
                    null,
                    seed.SalesOrderLineId,
                    seed.ItemId,
                    null,
                    seed.WarehouseId,
                    seed.BinId,
                    seed.LotId,
                    null,
                    null,
                    2m,
                    seed.UomId,
                    "Shipped")
            }));
        var shipmentLine = Assert.Single(shipment.Lines);

        var pod = await service.UpdateShipmentProofAsync(shipment.Id, new ShipmentProofRequest(
            "MH-12-AB-1002",
            "LR-9900",
            "SEAL-2",
            "Receiver signed delivery copy.",
            "Delivered",
            "Ajay Receiver",
            "9111111111",
            new DateTimeOffset(2026, 5, 16, 12, 0, 0, TimeSpan.Zero),
            88001,
            "One item accepted with shortage noted.",
            new[]
            {
                new ShipmentProofLineRequest(shipmentLine.Id, 1m, 1m, 0m)
            },
            DeliveredOn: new DateTimeOffset(2026, 5, 16, 12, 0, 0, TimeSpan.Zero)));

        Assert.Equal("Delivered", pod.Status);
        Assert.Equal("Ajay Receiver", pod.PodReceivedBy);
        Assert.Equal(88001, pod.PodEvidenceAttachmentId);
        var podLine = Assert.Single(pod.Lines);
        Assert.Equal(1m, podLine.DeliveredQuantity);
        Assert.Equal(1m, podLine.ShortQuantity);
        Assert.Equal(0m, podLine.DamagedQuantity);
    }

    [Fact]
    public async Task UpdateShipmentProofAsync_BlocksDeliveredQuantityBeyondShippedQuantity()
    {
        await using var dbContext = CreateDbContext();
        var seed = await SeedDispatchAsync(dbContext, requiresPcid: false);
        var service = CreateDispatchService(dbContext);

        var shipment = await service.CreateShipmentAsync(new ShipmentUpsertRequest(
            1,
            10,
            "SHP-POD-OVER",
            null,
            seed.CustomerId,
            new DateOnly(2026, 5, 16),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "Dispatched",
            new[] { BuildShipmentLine(seed, 10, 2m) }));
        var shipmentLine = Assert.Single(shipment.Lines);

        var ex = await Assert.ThrowsAsync<ValidationFailureException>(() =>
            service.UpdateShipmentProofAsync(shipment.Id, new ShipmentProofRequest(
                null,
                null,
                null,
                "Receiver attempted over-delivery.",
                "Delivered",
                "Ajay Receiver",
                "9111111111",
                new DateTimeOffset(2026, 5, 16, 12, 0, 0, TimeSpan.Zero),
                null,
                "Over delivery rejected.",
                new[] { new ShipmentProofLineRequest(shipmentLine.Id, 3m, 0m, 0m) },
                DeliveredOn: new DateTimeOffset(2026, 5, 16, 12, 0, 0, TimeSpan.Zero))));

        Assert.Contains(ex.Errors, error => error.Code == "dispatch.pod_quantity_exceeded");
    }

    private static DispatchService CreateDispatchService(MfgDbContext dbContext)
    {
        var dataScope = new AllowAllDataScopeService();
        var currentUser = new TestCurrentUserContextAccessor();
        var auditTrail = new TestAuditTrail();
        var policy = new InventoryPolicyService(dbContext, dataScope, currentUser, auditTrail);
        var posting = new InventoryPostingService(dbContext, dataScope, currentUser, auditTrail, policy);
        return new DispatchService(dbContext, dataScope, currentUser, auditTrail, posting, new StubWorkOrderService(), new StubJobCardService());
    }

    private static MfgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .ConfigureWarnings(builder => builder.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new MfgDbContext(options);
    }

    private static ShipmentLineRequest BuildShipmentLine(DispatchSeed seed, int lineNo, decimal quantity, long? pcidId = null, long? packListLineId = null) =>
        new(
            lineNo,
            packListLineId,
            seed.SalesOrderLineId,
            seed.ItemId,
            null,
            seed.WarehouseId,
            seed.BinId,
            seed.LotId,
            null,
            pcidId,
            quantity,
            seed.UomId,
            "Shipped");

    private static async Task<DispatchSeed> SeedDispatchAsync(MfgDbContext dbContext, bool requiresPcid, decimal availableQuantity = 5m, decimal qcHoldQuantity = 0m)
    {
        var customer = Customer.Create(1, "CUST-DISP", "Dispatch Customer", null, "OEM", 10, null, null, null, null, "Active", 77);
        dbContext.Customers.Add(customer);

        var warehouse = Warehouse.Create(1, 10, "FG", "Finished Goods", "Dispatch", false, true, true, false, false, "Active", 77);
        dbContext.Warehouses.Add(warehouse);
        await dbContext.SaveChangesAsync();

        var bin = Bin.Create(1, 10, warehouse.Id, null, "FG-A", "FG A", "Dispatch", null, null, true, true, false, null, false, null, "Active", 77);
        dbContext.Bins.Add(bin);

        var item = Item.Create(
            1,
            "FG-DISP",
            "Dispatch finished good",
            "FG",
            "FinishedGood",
            100,
            200,
            300,
            null,
            null,
            null,
            null,
            "Lot",
            false,
            false,
            true,
            "Manual",
            "Make",
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
            true,
            true,
            requiresPcid));

        var lot = Lot.Create(1, item.Id, "LOT-DISP", new DateOnly(2026, 1, 1), new DateOnly(2027, 1, 1), "Available", null, 77);
        dbContext.Lots.Add(lot);
        await dbContext.SaveChangesAsync();

        InventoryLicensePlate? pcid = null;
        if (requiresPcid)
        {
            pcid = InventoryLicensePlate.Create(1, 10, "PCID-DISP", "Pallet", warehouse.Id, bin.Id, "Available", 77);
            dbContext.InventoryLicensePlates.Add(pcid);
            await dbContext.SaveChangesAsync();
            dbContext.InventoryLicensePlateContents.Add(InventoryLicensePlateContent.Create(1, pcid.Id, item.Id, null, lot.Id, null, 5m, "Available", "Active", 77));
        }

        dbContext.StockBalances.Add(StockBalance.Create(1, 10, item.Id, null, warehouse.Id, bin.Id, lot.Id, null, availableQuantity, 0m, qcHoldQuantity, 0m, 0m, null, 77, pcid?.Id));

        var salesOrder = SalesOrder.Create(
            1,
            10,
            "SO-DISP-001",
            customer.Id,
            null,
            null,
            new DateOnly(2026, 5, 15),
            new DateOnly(2026, 5, 20),
            "Normal",
            "Released",
            5001,
            4,
            9,
            77,
            "Sales Owner",
            "Internal dispatch remark",
            "Customer dispatch remark",
            "Print dispatch remark",
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
            625m,
            0m,
            625m,
            125m,
            750m,
            "Released",
            new DateTimeOffset(2026, 5, 15, 10, 0, 0, TimeSpan.Zero),
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
            5m,
            "Make",
            new DateOnly(2026, 5, 20),
            "Normal",
            "Customer spec",
            new DateOnly(2026, 5, 19),
            "Open",
            501,
            null,
            null,
            null,
            125m,
            "PriceList",
            7001,
            8001,
            8101,
            0m,
            0m,
            9001,
            20m,
            25m,
            250m,
            250m,
            275m,
            "Line internal remark",
            "Line customer remark",
            null,
            77);
        dbContext.SalesOrderLines.Add(salesOrderLine);
        await dbContext.SaveChangesAsync();

        return new DispatchSeed(customer.Id, item.Id, warehouse.Id, bin.Id, lot.Id, pcid?.Id, 1, salesOrder.Id, salesOrderLine.Id, 501);
    }

    private sealed record DispatchSeed(long CustomerId, long ItemId, long WarehouseId, long BinId, long LotId, long? PcidId, long UomId, long SalesOrderId, long SalesOrderLineId, long ItemRevisionId);

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
        public CurrentUserContext GetRequired() => new(true, 77, "dispatch.tester", "Dispatch Tester", "dispatch.tester@sts.local", "en-IN", "web", 1, 10, []);
    }

    private sealed class TestAuditTrail : IAuditTrail
    {
        public Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }

    private sealed class StubWorkOrderService : IWorkOrderService
    {
        public Task<PagedResult<WorkOrderSummaryDto>> ListWorkOrdersAsync(WorkOrderFilter filter, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<WorkOrderDto> GetWorkOrderAsync(long id, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<WorkOrderDto> CreateWorkOrderAsync(WorkOrderUpsertRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<WorkOrderDto> UpdateWorkOrderAsync(long id, WorkOrderUpsertRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ActionResponse> ReleaseWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ActionResponse> ReReleaseWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ActionResponse> CancelWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ActionResponse> CloseWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<WorkOrderReadinessDto> GetReadinessAsync(long id, CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class StubJobCardService : IJobCardService
    {
        public Task<PagedResult<JobCardSummaryDto>> ListJobCardsAsync(JobCardFilter filter, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<JobCardDto> GetJobCardAsync(long id, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<JobCardDto>> CreateForWorkOrderAsync(CreateJobCardsRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ActionResponse> AssignAsync(long jobCardId, JobCardAssignRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ActionResponse> StartAsync(long jobCardId, JobCardStartRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ActionResponse> PauseAsync(long jobCardId, JobCardPauseRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ActionResponse> ResumeAsync(long jobCardId, JobCardResumeRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<JobCardQuantityResultDto> LogQuantityAsync(long jobCardId, JobCardQuantityRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<DowntimeEventDto> LogDowntimeAsync(long jobCardId, JobCardDowntimeRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ActionResponse> CompleteAsync(long jobCardId, JobCardCompleteRequest? request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<PagedResult<DowntimeEventDto>> ListDowntimeAsync(DowntimeFilter filter, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<JobCardReplayResult> ReplayMobileActionsAsync(JobCardReplayRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }
}
