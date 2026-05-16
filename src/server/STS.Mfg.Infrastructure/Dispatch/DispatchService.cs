using System.Globalization;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Dispatch;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Dispatch;
using STS.Mfg.Application.Contracts.Inventory;
using STS.Mfg.Application.Contracts.Production;
using STS.Mfg.Domain.Dispatch;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Procurement;
using STS.Mfg.Domain.Production;
using STS.Mfg.Domain.Quality;
using STS.Mfg.Domain.SalesPlanning;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Inventory;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Dispatch;

internal sealed class DispatchService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail,
    InventoryPostingService inventoryPostingService,
    IWorkOrderService workOrderService,
    IJobCardService jobCardService)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IDispatchService
{
    public async Task<PagedResult<PackListDto>> ListPackListsAsync(DispatchFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.PackLists.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.SalesOrderId.HasValue)
        {
            query = query.Where(entity => entity.SalesOrderId == filter.SalesOrderId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (filter.DateFrom.HasValue)
        {
            var dateFrom = DateOnly.FromDateTime(filter.DateFrom.Value.Date);
            query = query.Where(entity => entity.PlannedShipDate.HasValue && entity.PlannedShipDate.Value >= dateFrom);
        }

        if (filter.DateTo.HasValue)
        {
            var dateTo = DateOnly.FromDateTime(filter.DateTo.Value.Date);
            query = query.Where(entity => entity.PlannedShipDate.HasValue && entity.PlannedShipDate.Value <= dateTo);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.PackListNo.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.PlannedShipDate)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        var lines = await LoadPackListLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapPackList(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<PackListLineDto>())));
    }

    public async Task<PackListDto> GetPackListAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.PackLists.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Pack list was not found in the active scope.", "dispatch.packlist_not_found");
        var lines = await LoadPackListLinesAsync(new[] { id }, cancellationToken);
        return MapPackList(entity, lines.GetValueOrDefault(id, Array.Empty<PackListLineDto>()));
    }

    public async Task<PackListDto> CreatePackListAsync(PackListUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePackList(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        await EnsureSalesOrderContextAsync(request.CompanyId, request.BranchId, request.SalesOrderId, cancellationToken);

        var entity = PackList.Create(
            request.CompanyId,
            request.BranchId,
            request.PackListNo,
            request.SalesOrderId,
            request.PlannedShipDate,
            request.Status,
            request.Remarks,
            GetUserId());

        DbContext.PackLists.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            var lines = await MaterializePackListLinesAsync(request, entity.Id, cancellationToken);
            DbContext.PackListLines.AddRange(lines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetPackListAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("dispatch", nameof(PackList), "dispatch.packlist.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PackListDto> UpdatePackListAsync(long id, PackListUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePackList(request);
        var scope = GetScope();
        var entity = await DbContext.PackLists.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Pack list was not found in the active scope.", "dispatch.packlist_not_found");
        await EnsureSalesOrderContextAsync(request.CompanyId, request.BranchId, request.SalesOrderId, cancellationToken);
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Pack-list company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Pack-list branch cannot be changed."),
            Immutable(entity.SalesOrderId, request.SalesOrderId, nameof(request.SalesOrderId), "Pack-list sales order cannot be changed."));

        var before = await GetPackListAsync(id, cancellationToken);
        entity.Update(request.PackListNo, request.PlannedShipDate, request.Status, request.Remarks, GetUserId());

        var existingLines = await DbContext.PackListLines.Where(record => record.PackListId == id).ToListAsync(cancellationToken);
        DbContext.PackListLines.RemoveRange(existingLines);
        if (request.Lines.Count > 0)
        {
            var lines = await MaterializePackListLinesAsync(request, entity.Id, cancellationToken);
            DbContext.PackListLines.AddRange(lines);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetPackListAsync(id, cancellationToken);
        await WriteAuditAsync("dispatch", nameof(PackList), "dispatch.packlist.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ShipmentDto>> ListShipmentsAsync(DispatchFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Shipments.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.CustomerId.HasValue)
        {
            query = query.Where(entity => entity.CustomerId == filter.CustomerId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (filter.DateFrom.HasValue)
        {
            var dateFrom = DateOnly.FromDateTime(filter.DateFrom.Value.Date);
            query = query.Where(entity => entity.DispatchDate >= dateFrom);
        }

        if (filter.DateTo.HasValue)
        {
            var dateTo = DateOnly.FromDateTime(filter.DateTo.Value.Date);
            query = query.Where(entity => entity.DispatchDate <= dateTo);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.ShipmentNo.Contains(search) ||
                (entity.VehicleRef != null && entity.VehicleRef.Contains(search)) ||
                (entity.TrackingRef != null && entity.TrackingRef.Contains(search)));
        }

        var page = await query.OrderByDescending(entity => entity.DispatchDate)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        var lines = await LoadShipmentLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        var stockTransactions = await LoadStockTransactionsAsync(nameof(Shipment), page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapShipment(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<ShipmentLineDto>()), stockTransactions.GetValueOrDefault(entity.Id, Array.Empty<StockTransactionDto>())));
    }

    public async Task<ShipmentDto> GetShipmentAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.Shipments.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Shipment was not found in the active scope.", "dispatch.shipment_not_found");
        var lines = await LoadShipmentLinesAsync(new[] { id }, cancellationToken);
        var stockTransactions = await LoadStockTransactionsForDocumentAsync(nameof(Shipment), id, cancellationToken);
        return MapShipment(entity, lines.GetValueOrDefault(id, Array.Empty<ShipmentLineDto>()), stockTransactions);
    }

    public async Task<ShipmentDto> CreateShipmentAsync(ShipmentUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateShipment(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var customer = await ResolveCustomerAsync(request.CompanyId, request.CustomerId, cancellationToken);
        var packList = request.PackListId.HasValue
            ? await ResolvePackListAsync(request.CompanyId, request.BranchId, request.PackListId.Value, cancellationToken)
            : null;

        ThrowIfInvalid(
            packList is not null && packList.SalesOrderId.HasValue
                ? await ValidateShipmentCustomerAsync(packList.SalesOrderId.Value, customer.Id, cancellationToken)
                : null);

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        var entity = Shipment.Create(
            request.CompanyId,
            request.BranchId,
            request.ShipmentNo,
            request.PackListId,
            customer.Id,
            request.DispatchDate,
            request.VehicleRef,
            request.TrackingRef,
            request.SealNo,
            request.ProofNotes,
            request.Status,
            null,
            null,
            GetUserId());

        DbContext.Shipments.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var materializedLines = await MaterializeShipmentLinesAsync(request, entity.Id, request.PackListId, cancellationToken);
        if (materializedLines.Count > 0)
        {
            DbContext.ShipmentLines.AddRange(materializedLines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        IReadOnlyCollection<StockTransactionDto> stockTransactions = Array.Empty<StockTransactionDto>();
        if (materializedLines.Count > 0)
        {
            stockTransactions = await inventoryPostingService.IssueAsync(
                new InventoryIssueCommand(
                    request.CompanyId,
                    request.BranchId,
                    request.ShipmentNo,
                    request.DispatchDate,
                    nameof(Shipment),
                    entity.Id,
                    request.ProofNotes,
                    "stock.shipment.issue",
                    materializedLines
                        .OrderBy(line => line.LineNo)
                        .Select(line => new InventoryIssueLine(
                            line.LineNo,
                            "Shipment",
                            line.ItemId,
                            line.ItemVariantId,
                            line.WarehouseId,
                            line.BinId,
                            line.ShippedQuantity,
                            null,
                            "Available",
                            line.LotId,
                            null,
                            line.SerialId))
                        .ToArray()),
                cancellationToken);
        }

        if (request.PackListId.HasValue)
        {
            await UpdatePackListShipmentStatusAsync(request.PackListId.Value, materializedLines, cancellationToken);
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var dto = MapShipment(entity, materializedLines.Select(MapShipmentLine).ToArray(), stockTransactions);
        await WriteAuditAsync("dispatch", nameof(Shipment), "dispatch.shipment.create", entity.Id, null, dto, cancellationToken);
        return await GetShipmentAsync(entity.Id, cancellationToken);
    }

    public async Task<ShipmentDto> UpdateShipmentProofAsync(long id, ShipmentProofRequest request, CancellationToken cancellationToken = default)
    {
        ValidateShipmentProof(request);
        var scope = GetScope();
        var entity = await DbContext.Shipments.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Shipment was not found in the active scope.", "dispatch.shipment_not_found");
        var before = await GetShipmentAsync(id, cancellationToken);
        entity.Update(
            entity.ShipmentNo,
            entity.DispatchDate,
            request.VehicleRef ?? entity.VehicleRef,
            request.TrackingRef ?? entity.TrackingRef,
            request.SealNo ?? entity.SealNo,
            request.ProofNotes ?? entity.ProofNotes,
            request.Status,
            request.LoadedOn ?? entity.LoadedOn,
            request.DeliveredOn ?? entity.DeliveredOn,
            GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetShipmentAsync(id, cancellationToken);
        await WriteAuditAsync("dispatch", nameof(Shipment), "dispatch.shipment.proof", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<IReadOnlyCollection<DispatchPlanningItemDto>> GetDispatchPlanningAsync(DispatchFilter filter, CancellationToken cancellationToken = default)
    {
        var snapshot = await BuildOrderSnapshotsAsync(filter, cancellationToken);
        return snapshot
            .OrderBy(item => item.PromisedDate ?? DateOnly.MaxValue)
            .ThenBy(item => item.SalesOrderNo)
            .Select(MapDispatchPlanning)
            .ToArray();
    }

    public async Task<IReadOnlyCollection<StageWiseDashboardItemDto>> GetStageWiseDashboardAsync(DispatchFilter filter, CancellationToken cancellationToken = default)
    {
        var snapshot = await BuildOrderSnapshotsAsync(filter, cancellationToken);
        return snapshot
            .OrderBy(item => item.PromisedDate ?? DateOnly.MaxValue)
            .ThenBy(item => item.SalesOrderNo)
            .Select(MapStageWise)
            .ToArray();
    }

    public async Task<IReadOnlyCollection<OrderRiskItemDto>> GetOrderRiskDashboardAsync(DispatchFilter filter, CancellationToken cancellationToken = default)
    {
        var snapshot = await BuildOrderSnapshotsAsync(filter, cancellationToken);
        return snapshot
            .OrderByDescending(item => item.RiskRank)
            .ThenBy(item => item.PromisedDate ?? DateOnly.MaxValue)
            .ThenBy(item => item.SalesOrderNo)
            .Select(MapOrderRisk)
            .ToArray();
    }

    public async Task<ExecutiveCockpitDto> GetExecutiveCockpitAsync(DispatchFilter filter, CancellationToken cancellationToken = default)
    {
        var snapshot = await BuildOrderSnapshotsAsync(filter, cancellationToken);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var scope = GetScope();
        var dayStartUtc = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero);
        var dayEndUtc = dayStartUtc.AddDays(1);
        var downtimeRows = await (
            from downtime in DbContext.DowntimeEvents.AsNoTracking()
            join jobCard in DbContext.JobCards.AsNoTracking() on downtime.JobCardId equals jobCard.Id
            join workOrder in DbContext.WorkOrders.AsNoTracking() on jobCard.WorkOrderId equals workOrder.Id
            join orderLine in DbContext.SalesOrderLines.AsNoTracking() on workOrder.SalesOrderLineId equals orderLine.Id
            join salesOrder in DbContext.SalesOrders.AsNoTracking().ApplyActiveOrganizationScope(scope) on orderLine.SalesOrderId equals salesOrder.Id
            where downtime.StartOn >= dayStartUtc && downtime.StartOn < dayEndUtc
            select downtime.DurationMinutes).ToListAsync(cancellationToken);
        var downtimeMinutesToday = downtimeRows.Sum();

        return new ExecutiveCockpitDto(
            snapshot.Count(item => !IsOrderClosed(item.OrderStatus)),
            snapshot.Count(item => item.PromisedDate.HasValue && item.PromisedDate.Value < today && item.DispatchReadinessPercent < 100m),
            snapshot.Sum(item => item.ShortageCount),
            snapshot.Sum(item => item.SupplierLateCount),
            downtimeMinutesToday,
            snapshot.Count(item => item.DispatchReadinessPercent >= 100m && item.ShippedQuantity < item.OrderedQuantity),
            snapshot.Sum(item => item.QcPendingCount));
    }

    public async Task<PackListPrintDto> GetPackListPrintAsync(long id, CancellationToken cancellationToken = default)
    {
        var packList = await GetPackListAsync(id, cancellationToken);
        string? salesOrderNo = null;
        string? customerName = null;

        if (packList.SalesOrderId.HasValue)
        {
            var scope = GetScope();
            var order = await DbContext.SalesOrders.AsNoTracking()
                .ApplyActiveOrganizationScope(scope)
                .FirstOrDefaultAsync(record => record.Id == packList.SalesOrderId.Value, cancellationToken);

            if (order is not null)
            {
                salesOrderNo = order.SalesOrderNo;
                customerName = await DbContext.Customers.AsNoTracking()
                    .ApplyCompanyScope(scope)
                    .Where(record => record.Id == order.CustomerId)
                    .Select(record => record.CustomerName)
                    .FirstOrDefaultAsync(cancellationToken);
            }
        }

        var shipments = await DbContext.Shipments.AsNoTracking()
            .Where(record => record.PackListId == id)
            .OrderBy(record => record.DispatchDate)
            .ThenBy(record => record.ShipmentNo)
            .ToListAsync(cancellationToken);

        var shipmentLines = await LoadShipmentLinesAsync(shipments.Select(record => record.Id).ToArray(), cancellationToken);
        var stockTransactions = await LoadStockTransactionsAsync(nameof(Shipment), shipments.Select(record => record.Id).ToArray(), cancellationToken);

        return new PackListPrintDto(
            packList,
            salesOrderNo,
            customerName,
            shipments.Select(entity => MapShipment(entity, shipmentLines.GetValueOrDefault(entity.Id, Array.Empty<ShipmentLineDto>()), stockTransactions.GetValueOrDefault(entity.Id, Array.Empty<StockTransactionDto>()))).ToArray());
    }

    public async Task<WorkOrderTravelerDto> GetWorkOrderTravelerAsync(long workOrderId, CancellationToken cancellationToken = default)
    {
        var workOrder = await workOrderService.GetWorkOrderAsync(workOrderId, cancellationToken);
        var jobCards = await jobCardService.ListJobCardsAsync(
            new JobCardFilter(Page: 1, PageSize: 1000, WorkOrderId: workOrderId),
            cancellationToken);

        var details = new List<JobCardDto>();
        foreach (var jobCard in jobCards.Items.OrderBy(record => record.JobCardNo))
        {
            details.Add(await jobCardService.GetJobCardAsync(jobCard.Id, cancellationToken));
        }

        return new WorkOrderTravelerDto(workOrder, details);
    }

    private async Task<List<PackListLine>> MaterializePackListLinesAsync(PackListUpsertRequest request, long packListId, CancellationToken cancellationToken)
    {
        var lines = new List<PackListLine>();
        foreach (var line in request.Lines.OrderBy(record => record.LineNo))
        {
            var reference = await inventoryPostingService.ResolveReferenceAsync(
                request.CompanyId,
                line.ItemId,
                line.ItemCode,
                line.ItemVariantId,
                line.ItemVariantCode,
                line.LotId,
                line.LotNo,
                line.SerialId,
                line.SerialNo,
                cancellationToken);

            lines.Add(PackListLine.Create(
                packListId,
                line.LineNo,
                line.SalesOrderLineId,
                reference.ItemId,
                reference.ItemVariantId,
                line.WarehouseId,
                line.BinId,
                reference.LotId,
                reference.SerialId,
                line.PackedQuantity,
                line.PackUomId,
                line.PackageRef,
                line.Status,
                GetUserId()));
        }

        return lines;
    }

    private async Task<List<ShipmentLine>> MaterializeShipmentLinesAsync(
        ShipmentUpsertRequest request,
        long shipmentId,
        long? packListId,
        CancellationToken cancellationToken)
    {
        var lines = new List<ShipmentLine>();
        foreach (var line in request.Lines.OrderBy(record => record.LineNo))
        {
            var reference = await inventoryPostingService.ResolveReferenceAsync(
                request.CompanyId,
                line.ItemId,
                line.ItemCode,
                line.ItemVariantId,
                line.ItemVariantCode,
                line.LotId,
                line.LotNo,
                line.SerialId,
                line.SerialNo,
                cancellationToken);

            if (line.PackListLineId.HasValue)
            {
                await EnsurePackListLineAsync(packListId, line.PackListLineId.Value, reference.ItemId, cancellationToken);
            }

            lines.Add(ShipmentLine.Create(
                shipmentId,
                line.LineNo,
                line.PackListLineId,
                line.SalesOrderLineId,
                reference.ItemId,
                reference.ItemVariantId,
                line.WarehouseId,
                line.BinId,
                reference.LotId,
                reference.SerialId,
                line.ShippedQuantity,
                line.ShipUomId,
                line.Status,
                GetUserId()));
        }

        return lines;
    }

    private async Task<PackList?> ResolvePackListAsync(long companyId, long branchId, long packListId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var packList = await DbContext.PackLists.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == packListId, cancellationToken);

        packList = EnsureFound(packList, "Pack list was not found in the active scope.", "dispatch.packlist_not_found");
        ThrowIfInvalid(
            packList.CompanyId != companyId ? new ApiError("validation.mismatch", nameof(companyId), "Pack list does not belong to the requested company.") : null,
            packList.BranchId != branchId ? new ApiError("validation.mismatch", nameof(branchId), "Pack list does not belong to the requested branch.") : null);
        return packList;
    }

    private async Task<Customer> ResolveCustomerAsync(long companyId, long customerId, CancellationToken cancellationToken)
    {
        ThrowIfInvalid(Positive(customerId, nameof(customerId), "Customer is required."));
        var scope = GetScope();
        var customer = await DbContext.Customers.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == customerId, cancellationToken);

        customer = EnsureFound(customer, "Customer was not found in the active scope.", "master.customer_not_found");
        ThrowIfInvalid(customer.CompanyId != companyId
            ? new ApiError("validation.mismatch", nameof(companyId), "Customer does not belong to the requested company.")
            : null);
        return customer;
    }

    private async Task EnsureSalesOrderContextAsync(long companyId, long branchId, long? salesOrderId, CancellationToken cancellationToken)
    {
        if (!salesOrderId.HasValue)
        {
            return;
        }

        var scope = GetScope();
        var salesOrder = await DbContext.SalesOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == salesOrderId.Value, cancellationToken);

        salesOrder = EnsureFound(salesOrder, "Sales order was not found in the active scope.", "sales.salesorder_not_found");
        ThrowIfInvalid(
            salesOrder.CompanyId != companyId ? new ApiError("validation.mismatch", nameof(companyId), "Sales order does not belong to the requested company.") : null,
            salesOrder.BranchId != branchId ? new ApiError("validation.mismatch", nameof(branchId), "Sales order does not belong to the requested branch.") : null);
    }

    private async Task<ApiError?> ValidateShipmentCustomerAsync(long salesOrderId, long customerId, CancellationToken cancellationToken)
    {
        var salesOrder = await DbContext.SalesOrders.AsNoTracking()
            .FirstOrDefaultAsync(record => record.Id == salesOrderId, cancellationToken);

        return salesOrder is not null && salesOrder.CustomerId != customerId
            ? new ApiError("validation.mismatch", nameof(customerId), "Shipment customer does not match the linked sales order.")
            : null;
    }

    private async Task EnsurePackListLineAsync(long? packListId, long packListLineId, long itemId, CancellationToken cancellationToken)
    {
        var packListLine = await DbContext.PackListLines.FirstOrDefaultAsync(record => record.Id == packListLineId, cancellationToken);
        packListLine = EnsureFound(packListLine, "Pack-list line was not found.", "dispatch.packlist_line_not_found");

        ThrowIfInvalid(
            packListId.HasValue && packListLine.PackListId != packListId.Value
                ? new ApiError("validation.mismatch", nameof(packListId), "Shipment line does not belong to the requested pack list.")
                : null,
            packListLine.ItemId != itemId
                ? new ApiError("validation.mismatch", nameof(itemId), "Shipment line item does not match the linked pack-list line.")
                : null);
    }

    private async Task UpdatePackListShipmentStatusAsync(long packListId, IReadOnlyCollection<ShipmentLine> shipmentLines, CancellationToken cancellationToken)
    {
        var packList = await DbContext.PackLists.FirstOrDefaultAsync(record => record.Id == packListId, cancellationToken);
        if (packList is null)
        {
            return;
        }

        var linkedLineIds = shipmentLines.Where(line => line.PackListLineId.HasValue).Select(line => line.PackListLineId!.Value).ToHashSet();
        if (linkedLineIds.Count > 0)
        {
            var packListLines = await DbContext.PackListLines.Where(record => linkedLineIds.Contains(record.Id)).ToListAsync(cancellationToken);
            foreach (var line in packListLines)
            {
                line.Update(line.PackedQuantity, line.PackageRef, "Shipped", GetUserId());
            }
        }

        var hasOpenLines = await DbContext.PackListLines
            .Where(record => record.PackListId == packListId)
            .AnyAsync(record => !string.Equals(record.Status, "Shipped", StringComparison.OrdinalIgnoreCase), cancellationToken);

        packList.Update(packList.PackListNo, packList.PlannedShipDate, hasOpenLines ? "PartiallyShipped" : "Shipped", packList.Remarks, GetUserId());
    }

    private async Task<Dictionary<long, IReadOnlyCollection<PackListLineDto>>> LoadPackListLinesAsync(IReadOnlyCollection<long> packListIds, CancellationToken cancellationToken)
    {
        if (packListIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<PackListLineDto>>();
        }

        var lines = await DbContext.PackListLines.AsNoTracking()
            .Where(record => packListIds.Contains(record.PackListId))
            .OrderBy(record => record.LineNo)
            .ToListAsync(cancellationToken);

        return lines.GroupBy(record => record.PackListId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<PackListLineDto>)group.Select(MapPackListLine).ToArray());
    }

    private async Task<Dictionary<long, IReadOnlyCollection<ShipmentLineDto>>> LoadShipmentLinesAsync(IReadOnlyCollection<long> shipmentIds, CancellationToken cancellationToken)
    {
        if (shipmentIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<ShipmentLineDto>>();
        }

        var lines = await DbContext.ShipmentLines.AsNoTracking()
            .Where(record => shipmentIds.Contains(record.ShipmentId))
            .OrderBy(record => record.LineNo)
            .ToListAsync(cancellationToken);

        return lines.GroupBy(record => record.ShipmentId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<ShipmentLineDto>)group.Select(MapShipmentLine).ToArray());
    }

    private async Task<Dictionary<long, IReadOnlyCollection<StockTransactionDto>>> LoadStockTransactionsAsync(string documentType, IReadOnlyCollection<long> ids, CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<StockTransactionDto>>();
        }

        return await DbContext.StockTransactions.AsNoTracking()
            .Where(record => record.SourceDocumentType == documentType && record.SourceDocumentId.HasValue && ids.Contains(record.SourceDocumentId.Value))
            .OrderBy(record => record.PostingDate)
            .ThenBy(record => record.Id)
            .GroupBy(record => record.SourceDocumentId!.Value)
            .ToDictionaryAsync(
                group => group.Key,
                group => (IReadOnlyCollection<StockTransactionDto>)group.Select(MapStockTransaction).ToArray(),
                cancellationToken);
    }

    private async Task<IReadOnlyCollection<StockTransactionDto>> LoadStockTransactionsForDocumentAsync(string documentType, long id, CancellationToken cancellationToken)
    {
        var result = await LoadStockTransactionsAsync(documentType, new[] { id }, cancellationToken);
        return result.GetValueOrDefault(id, Array.Empty<StockTransactionDto>());
    }

    private async Task<IReadOnlyCollection<OrderSnapshot>> BuildOrderSnapshotsAsync(DispatchFilter filter, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var orderQuery = DbContext.SalesOrders.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            orderQuery = orderQuery.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            orderQuery = orderQuery.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.CustomerId.HasValue)
        {
            orderQuery = orderQuery.Where(entity => entity.CustomerId == filter.CustomerId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            orderQuery = orderQuery.Where(entity => entity.Status == status);
        }

        if (filter.DateFrom.HasValue)
        {
            var dateFrom = DateOnly.FromDateTime(filter.DateFrom.Value.Date);
            orderQuery = orderQuery.Where(entity => entity.PromisedDate.HasValue && entity.PromisedDate.Value >= dateFrom);
        }

        if (filter.DateTo.HasValue)
        {
            var dateTo = DateOnly.FromDateTime(filter.DateTo.Value.Date);
            orderQuery = orderQuery.Where(entity => entity.PromisedDate.HasValue && entity.PromisedDate.Value <= dateTo);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            orderQuery = orderQuery.Where(entity => entity.SalesOrderNo.Contains(search));
        }

        var orders = await orderQuery.OrderBy(entity => entity.PromisedDate).ThenBy(entity => entity.SalesOrderNo).ToListAsync(cancellationToken);
        if (orders.Count == 0)
        {
            return Array.Empty<OrderSnapshot>();
        }

        var orderIds = orders.Select(record => record.Id).ToArray();
        var orderLines = await DbContext.SalesOrderLines.AsNoTracking()
            .Where(record => orderIds.Contains(record.SalesOrderId))
            .ToListAsync(cancellationToken);
        var orderLineIds = orderLines.Select(record => record.Id).ToArray();
        var customerIds = orders.Select(record => record.CustomerId).Distinct().ToArray();

        var customers = await DbContext.Customers.AsNoTracking()
            .ApplyCompanyScope(scope)
            .Where(record => customerIds.Contains(record.Id))
            .ToDictionaryAsync(record => record.Id, record => record.CustomerName, cancellationToken);

        var workOrders = await DbContext.WorkOrders.AsNoTracking().ApplyActiveOrganizationScope(scope)
            .Where(record => record.SalesOrderLineId.HasValue && orderLineIds.Contains(record.SalesOrderLineId.Value))
            .ToListAsync(cancellationToken);
        var workOrderIds = workOrders.Select(record => record.Id).ToArray();

        var operations = await DbContext.WorkOrderOperations.AsNoTracking()
            .Where(record => workOrderIds.Contains(record.WorkOrderId))
            .ToListAsync(cancellationToken);

        var jobCards = await DbContext.JobCards.AsNoTracking().ApplyActiveOrganizationScope(scope)
            .Where(record => workOrderIds.Contains(record.WorkOrderId))
            .ToListAsync(cancellationToken);
        var jobCardIds = jobCards.Select(record => record.Id).ToArray();

        var productionReceipts = await (
            from receipt in DbContext.ProductionReceipts.AsNoTracking().ApplyActiveOrganizationScope(scope)
            join receiptLine in DbContext.ProductionReceiptLines.AsNoTracking() on receipt.Id equals receiptLine.ProductionReceiptId
            join workOrder in DbContext.WorkOrders.AsNoTracking() on receipt.WorkOrderId equals workOrder.Id
            where workOrder.SalesOrderLineId.HasValue && orderLineIds.Contains(workOrder.SalesOrderLineId.Value)
            select new ReceiptLineLink(workOrder.SalesOrderLineId!.Value, receiptLine.InventoryState)).ToListAsync(cancellationToken);

        var inspections = await DbContext.InspectionRecords.AsNoTracking().ApplyActiveOrganizationScope(scope)
            .Where(record =>
                (record.SourceDocumentType == nameof(JobCard) && record.SourceDocumentId.HasValue && jobCardIds.Contains(record.SourceDocumentId.Value)) ||
                (record.SourceDocumentType == nameof(ProductionReceipt) && record.SourceDocumentId.HasValue))
            .ToListAsync(cancellationToken);

        var receiptInspectionMap = await (
            from inspection in DbContext.InspectionRecords.AsNoTracking().ApplyActiveOrganizationScope(scope)
            join receipt in DbContext.ProductionReceipts.AsNoTracking() on inspection.SourceDocumentId equals receipt.Id
            join workOrder in DbContext.WorkOrders.AsNoTracking() on receipt.WorkOrderId equals workOrder.Id
            where inspection.SourceDocumentType == nameof(ProductionReceipt) &&
                  workOrder.SalesOrderLineId.HasValue &&
                  orderLineIds.Contains(workOrder.SalesOrderLineId.Value)
            select new ReceiptInspectionLink(workOrder.SalesOrderLineId!.Value, inspection.Status, inspection.OverallResult, inspection.ModifiedOn)).ToListAsync(cancellationToken);

        var packLists = await DbContext.PackLists.AsNoTracking().ApplyActiveOrganizationScope(scope)
            .Where(record => record.SalesOrderId.HasValue && orderIds.Contains(record.SalesOrderId.Value))
            .ToListAsync(cancellationToken);
        var packListIds = packLists.Select(record => record.Id).ToArray();
        var packListLines = await DbContext.PackListLines.AsNoTracking()
            .Where(record => packListIds.Contains(record.PackListId))
            .ToListAsync(cancellationToken);

        var shipments = await DbContext.Shipments.AsNoTracking().ApplyActiveOrganizationScope(scope)
            .Where(record => record.PackListId.HasValue && packListIds.Contains(record.PackListId.Value))
            .ToListAsync(cancellationToken);
        var shipmentIds = shipments.Select(record => record.Id).ToArray();
        var shipmentLines = await DbContext.ShipmentLines.AsNoTracking()
            .Where(record => shipmentIds.Contains(record.ShipmentId))
            .ToListAsync(cancellationToken);

        var boqLines = await (
            from boq in DbContext.BoqRequirements.AsNoTracking().ApplyActiveOrganizationScope(scope)
            join line in DbContext.BoqRequirementLines.AsNoTracking() on boq.Id equals line.BoqRequirementId
            where boq.SourceDocumentType == nameof(WorkOrder) && boq.SourceDocumentId.HasValue && workOrderIds.Contains(boq.SourceDocumentId.Value)
            select new BoqLink(boq.SourceDocumentId!.Value, line.Status, line.NeedByDate)).ToListAsync(cancellationToken);

        var purchaseOrderLinks = await (
            from line in DbContext.PurchaseOrderLines.AsNoTracking()
            where line.LinkedWorkOrderId.HasValue && workOrderIds.Contains(line.LinkedWorkOrderId.Value)
            select new PurchaseOrderLink(line.LinkedWorkOrderId!.Value, line.Status, line.ExpectedDate)).ToListAsync(cancellationToken);

        var downtimeLinks = await (
            from downtime in DbContext.DowntimeEvents.AsNoTracking()
            join jobCard in DbContext.JobCards.AsNoTracking() on downtime.JobCardId equals jobCard.Id
            where workOrderIds.Contains(jobCard.WorkOrderId)
            select new DowntimeLink(jobCard.WorkOrderId, downtime.DurationMinutes, downtime.StartOn)).ToListAsync(cancellationToken);

        var workOrdersByLine = workOrders.Where(record => record.SalesOrderLineId.HasValue)
            .GroupBy(record => record.SalesOrderLineId!.Value)
            .ToDictionary(group => group.Key, group => group.ToArray());
        var operationsByWorkOrder = operations.GroupBy(record => record.WorkOrderId).ToDictionary(group => group.Key, group => group.ToArray());
        var jobCardsByWorkOrder = jobCards.GroupBy(record => record.WorkOrderId).ToDictionary(group => group.Key, group => group.ToArray());
        var receiptsByOrderLine = productionReceipts.GroupBy(record => record.SalesOrderLineId).ToDictionary(group => group.Key, group => group.ToArray());
        var inspectionsByJobCard = inspections
            .Where(record => record.SourceDocumentType == nameof(JobCard) && record.SourceDocumentId.HasValue)
            .GroupBy(record => record.SourceDocumentId!.Value)
            .ToDictionary(group => group.Key, group => group.ToArray());
        var inspectionsByOrderLine = receiptInspectionMap.GroupBy(record => record.SalesOrderLineId).ToDictionary(group => group.Key, group => group.ToArray());
        var packListsByOrder = packLists.Where(record => record.SalesOrderId.HasValue)
            .GroupBy(record => record.SalesOrderId!.Value)
            .ToDictionary(group => group.Key, group => group.ToArray());
        var packLinesByPackList = packListLines.GroupBy(record => record.PackListId).ToDictionary(group => group.Key, group => group.ToArray());
        var shipmentsByPackList = shipments.Where(record => record.PackListId.HasValue)
            .GroupBy(record => record.PackListId!.Value)
            .ToDictionary(group => group.Key, group => group.ToArray());
        var shipmentLinesByShipment = shipmentLines.GroupBy(record => record.ShipmentId).ToDictionary(group => group.Key, group => group.ToArray());
        var boqByWorkOrder = boqLines.GroupBy(record => record.WorkOrderId).ToDictionary(group => group.Key, group => group.ToArray());
        var purchaseOrdersByWorkOrder = purchaseOrderLinks.GroupBy(record => record.WorkOrderId).ToDictionary(group => group.Key, group => group.ToArray());
        var downtimeByWorkOrder = downtimeLinks.GroupBy(record => record.WorkOrderId).ToDictionary(group => group.Key, group => group.ToArray());

        var snapshots = new List<OrderSnapshot>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var order in orders)
        {
            var linesForOrder = orderLines.Where(record => record.SalesOrderId == order.Id).ToArray();
            var orderedQuantity = linesForOrder.Sum(record => record.Quantity);
            var workOrdersForOrder = linesForOrder
                .SelectMany(record => workOrdersByLine.GetValueOrDefault(record.Id, Array.Empty<WorkOrder>()))
                .ToArray();
            var operationsForOrder = workOrdersForOrder.SelectMany(record => operationsByWorkOrder.GetValueOrDefault(record.Id, Array.Empty<WorkOrderOperation>())).ToArray();
            var jobCardsForOrder = workOrdersForOrder.SelectMany(record => jobCardsByWorkOrder.GetValueOrDefault(record.Id, Array.Empty<JobCard>())).ToArray();
            var packListsForOrder = packListsByOrder.GetValueOrDefault(order.Id, Array.Empty<PackList>());
            var shipmentsForOrder = packListsForOrder.SelectMany(record => shipmentsByPackList.GetValueOrDefault(record.Id, Array.Empty<Shipment>())).ToArray();

            var packedQuantity = packListsForOrder.Sum(packList =>
                packLinesByPackList.GetValueOrDefault(packList.Id, Array.Empty<PackListLine>()).Sum(line => line.PackedQuantity));
            var shippedQuantity = shipmentsForOrder.Sum(shipment =>
                shipmentLinesByShipment.GetValueOrDefault(shipment.Id, Array.Empty<ShipmentLine>()).Sum(line => line.ShippedQuantity));

            var productionPercent = CalculateProductionPercent(workOrdersForOrder, operationsForOrder);
            var dispatchPercent = orderedQuantity <= 0 ? 0m : Math.Round(Math.Min(100m, shippedQuantity / orderedQuantity * 100m), 2, MidpointRounding.AwayFromZero);
            var completionPercent = orderedQuantity <= 0
                ? productionPercent
                : Math.Round(Math.Min(100m, (productionPercent * 0.7m) + (dispatchPercent * 0.3m)), 2, MidpointRounding.AwayFromZero);

            var pendingOperationCount = operationsForOrder.Count(operation => !IsOperationClosed(operation.Status));
            var shortageCount = workOrdersForOrder.Sum(workOrder =>
                boqByWorkOrder.GetValueOrDefault(workOrder.Id, Array.Empty<BoqLink>())
                    .Count(link => !IsRequirementClosed(link.Status) && (!order.PromisedDate.HasValue || link.NeedByDate <= order.PromisedDate.Value)));
            var supplierLateCount = workOrdersForOrder.Sum(workOrder =>
                purchaseOrdersByWorkOrder.GetValueOrDefault(workOrder.Id, Array.Empty<PurchaseOrderLink>())
                    .Count(link => !IsSupplyClosed(link.Status) && link.ExpectedDate < today));
            var qcPendingCount =
                jobCardsForOrder.Sum(jobCard =>
                    inspectionsByJobCard.GetValueOrDefault(jobCard.Id, Array.Empty<InspectionRecord>())
                        .Count(record => !string.Equals(record.OverallResult, "Pass", StringComparison.OrdinalIgnoreCase))) +
                linesForOrder.Sum(line =>
                    inspectionsByOrderLine.GetValueOrDefault(line.Id, Array.Empty<ReceiptInspectionLink>())
                        .Count(record => !string.Equals(record.OverallResult, "Pass", StringComparison.OrdinalIgnoreCase)));

            var downtimeMinutes = workOrdersForOrder.Sum(workOrder =>
                downtimeByWorkOrder.GetValueOrDefault(workOrder.Id, Array.Empty<DowntimeLink>())
                    .Where(link => DateOnly.FromDateTime(link.StartOn.UtcDateTime) >= today.AddDays(-3))
                    .Sum(link => link.DurationMinutes));

            var dispatchReadinessPercent = orderedQuantity <= 0
                ? 0m
                : Math.Round(Math.Min(100m, packedQuantity / orderedQuantity * 100m), 2, MidpointRounding.AwayFromZero);

            var primaryBlocker = ResolvePrimaryBlocker(qcPendingCount, shortageCount, supplierLateCount, downtimeMinutes, dispatchReadinessPercent, workOrdersForOrder.Length);
            var riskStatus = ResolveRiskStatus(order.PromisedDate, completionPercent, dispatchReadinessPercent, shortageCount, supplierLateCount, qcPendingCount, downtimeMinutes);
            var stage = ResolveStage(order.Status, completionPercent, dispatchReadinessPercent, qcPendingCount, shortageCount, supplierLateCount, shipmentsForOrder.Length, packListsForOrder.Length, workOrdersForOrder.Length);
            var stageAnchor = ResolveStageAnchor(stage.StageCode, order, workOrdersForOrder, packListsForOrder, shipmentsForOrder, jobCardsForOrder, inspectionsByJobCard, inspectionsByOrderLine, linesForOrder);
            var daysInStage = (int)Math.Max(0, (DateTimeOffset.UtcNow - stageAnchor).TotalDays);

            snapshots.Add(new OrderSnapshot(
                order.Id,
                order.SalesOrderNo,
                order.CustomerId,
                customers.GetValueOrDefault(order.CustomerId),
                order.PromisedDate,
                order.Status,
                orderedQuantity,
                packedQuantity,
                shippedQuantity,
                completionPercent,
                pendingOperationCount,
                shortageCount,
                supplierLateCount,
                qcPendingCount,
                dispatchReadinessPercent,
                riskStatus,
                RiskRank(riskStatus),
                primaryBlocker,
                stage.StageCode,
                stage.StageStatus,
                stage.OwnerRole,
                daysInStage,
                ResolveNextAction(stage.StageCode, primaryBlocker, dispatchReadinessPercent, completionPercent)));
        }

        return snapshots;
    }

    private static decimal CalculateProductionPercent(IReadOnlyCollection<WorkOrder> workOrders, IReadOnlyCollection<WorkOrderOperation> operations)
    {
        if (operations.Count > 0)
        {
            var totalPlanned = operations.Sum(record => record.PlannedQuantity);
            if (totalPlanned > 0)
            {
                var totalCompleted = operations.Sum(record => Math.Min(record.CompletedQuantity, record.PlannedQuantity));
                return Math.Round(Math.Min(100m, totalCompleted / totalPlanned * 100m), 2, MidpointRounding.AwayFromZero);
            }
        }

        if (workOrders.Count > 0 && workOrders.All(record => string.Equals(record.Status, "Completed", StringComparison.OrdinalIgnoreCase)))
        {
            return 100m;
        }

        return 0m;
    }

    private static StageSnapshot ResolveStage(
        string orderStatus,
        decimal completionPercent,
        decimal dispatchReadinessPercent,
        int qcPendingCount,
        int shortageCount,
        int supplierLateCount,
        int shipmentCount,
        int packListCount,
        int workOrderCount)
    {
        if (shipmentCount > 0 && dispatchReadinessPercent >= 100m)
        {
            return new StageSnapshot("Dispatch", "InTransit", "DispatchManager");
        }

        if (packListCount > 0 || dispatchReadinessPercent > 0m)
        {
            return new StageSnapshot("Dispatch", dispatchReadinessPercent >= 100m ? "Ready" : "Packing", "DispatchManager");
        }

        if (qcPendingCount > 0)
        {
            return new StageSnapshot("Quality", "Waiting", "QCInspector");
        }

        if (completionPercent > 0m || workOrderCount > 0)
        {
            return new StageSnapshot("Production", completionPercent >= 100m ? "Completed" : "InProgress", "ProductionSupervisor");
        }

        if (shortageCount > 0 || supplierLateCount > 0)
        {
            return new StageSnapshot("Planning", "Waiting", supplierLateCount > 0 ? "PurchaseManager" : "PlanningManager");
        }

        return new StageSnapshot("Sales", string.IsNullOrWhiteSpace(orderStatus) ? "Confirmed" : orderStatus, "SalesCoordinator");
    }

    private static DateTimeOffset ResolveStageAnchor(
        string stageCode,
        SalesOrder order,
        IReadOnlyCollection<WorkOrder> workOrders,
        IReadOnlyCollection<PackList> packLists,
        IReadOnlyCollection<Shipment> shipments,
        IReadOnlyCollection<JobCard> jobCards,
        IReadOnlyDictionary<long, InspectionRecord[]> inspectionsByJobCard,
        IReadOnlyDictionary<long, ReceiptInspectionLink[]> inspectionsByOrderLine,
        IReadOnlyCollection<SalesOrderLine> orderLines)
    {
        return stageCode switch
        {
            "Dispatch" when shipments.Count > 0 => shipments.Max(record => record.ModifiedOn),
            "Dispatch" when packLists.Count > 0 => packLists.Max(record => record.ModifiedOn),
            "Quality" => ResolveQualityAnchor(jobCards, inspectionsByJobCard, inspectionsByOrderLine, orderLines, order.ModifiedOn),
            "Production" when workOrders.Count > 0 => workOrders.Max(record => record.ModifiedOn),
            _ => order.ModifiedOn
        };
    }

    private static DateTimeOffset ResolveQualityAnchor(
        IReadOnlyCollection<JobCard> jobCards,
        IReadOnlyDictionary<long, InspectionRecord[]> inspectionsByJobCard,
        IReadOnlyDictionary<long, ReceiptInspectionLink[]> inspectionsByOrderLine,
        IReadOnlyCollection<SalesOrderLine> orderLines,
        DateTimeOffset fallback)
    {
        var anchors = new List<DateTimeOffset>();
        foreach (var jobCard in jobCards)
        {
            anchors.Add(jobCard.ModifiedOn);
            foreach (var inspection in inspectionsByJobCard.GetValueOrDefault(jobCard.Id, Array.Empty<InspectionRecord>()))
            {
                anchors.Add(inspection.ModifiedOn);
            }
        }

        foreach (var line in orderLines)
        {
            foreach (var inspection in inspectionsByOrderLine.GetValueOrDefault(line.Id, Array.Empty<ReceiptInspectionLink>()))
            {
                anchors.Add(inspection.ModifiedOn);
            }
        }

        return anchors.Count == 0 ? fallback : anchors.Max();
    }

    private static string? ResolvePrimaryBlocker(
        int qcPendingCount,
        int shortageCount,
        int supplierLateCount,
        decimal downtimeMinutes,
        decimal dispatchReadinessPercent,
        int workOrderCount)
    {
        if (qcPendingCount > 0)
        {
            return "QC_Hold";
        }

        if (shortageCount > 0)
        {
            return "MaterialShortage";
        }

        if (supplierLateCount > 0)
        {
            return "SupplierDelay";
        }

        if (downtimeMinutes > 0)
        {
            return "MachineDowntime";
        }

        if (workOrderCount == 0)
        {
            return "EngineeringPending";
        }

        if (dispatchReadinessPercent < 100m)
        {
            return "DispatchPending";
        }

        return null;
    }

    private static string ResolveRiskStatus(
        DateOnly? promisedDate,
        decimal completionPercent,
        decimal dispatchReadinessPercent,
        int shortageCount,
        int supplierLateCount,
        int qcPendingCount,
        decimal downtimeMinutes)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var daysToPromise = promisedDate.HasValue ? promisedDate.Value.DayNumber - today.DayNumber : 999;

        if ((promisedDate.HasValue && promisedDate.Value < today && dispatchReadinessPercent < 100m) ||
            qcPendingCount > 0 ||
            shortageCount > 0 && daysToPromise <= 3)
        {
            return "Critical";
        }

        if (daysToPromise <= 2 && (completionPercent < 80m || supplierLateCount > 0 || downtimeMinutes > 0))
        {
            return "High";
        }

        if (daysToPromise <= 5 && (completionPercent < 90m || dispatchReadinessPercent < 50m))
        {
            return "Medium";
        }

        return "Low";
    }

    private static int RiskRank(string riskStatus) =>
        riskStatus switch
        {
            "Critical" => 0,
            "High" => 1,
            "Medium" => 2,
            _ => 3
        };

    private static string ResolveNextAction(string stageCode, string? blockerCode, decimal dispatchReadinessPercent, decimal completionPercent) =>
        blockerCode switch
        {
            "QC_Hold" => "Release or disposition held inspection lots.",
            "MaterialShortage" => "Close BOQ shortages and expedite missing material.",
            "SupplierDelay" => "Escalate supplier due lines and update delivery promise.",
            "MachineDowntime" => "Recover machine capacity and resequence affected job cards.",
            "DispatchPending" when dispatchReadinessPercent < 100m => "Complete packing and loading proof for ready lines.",
            "EngineeringPending" => "Create and release production order coverage.",
            _ when stageCode == "Production" && completionPercent < 100m => "Advance pending operations and clear execution blockers.",
            _ => "Review order and confirm next milestone."
        };

    private static bool IsRequirementClosed(string status) =>
        status.Equals("Closed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Approved", StringComparison.OrdinalIgnoreCase);

    private static bool IsSupplyClosed(string status) =>
        status.Equals("Closed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Received", StringComparison.OrdinalIgnoreCase);

    private static bool IsOperationClosed(string status) =>
        status.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase);

    private static bool IsOrderClosed(string status) =>
        status.Equals("Closed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase);

    private static void ValidatePackList(PackListUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.PackListNo, nameof(request.PackListNo), "Pack-list number is required."),
            Required(request.Status, nameof(request.Status), "Pack-list status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Pack-list line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.WarehouseId, nameof(line.WarehouseId), "Warehouse is required."));
            errors.Add(Positive(line.PackUomId, nameof(line.PackUomId), "Pack UOM is required."));
            errors.Add(Positive(line.PackedQuantity, nameof(line.PackedQuantity), "Packed quantity must be greater than zero."));
            errors.Add(Required(line.Status, nameof(line.Status), "Line status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateShipment(ShipmentUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.ShipmentNo, nameof(request.ShipmentNo), "Shipment number is required."),
            Positive(request.CustomerId, nameof(request.CustomerId), "Customer is required."),
            Required(request.Status, nameof(request.Status), "Shipment status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Shipment line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.WarehouseId, nameof(line.WarehouseId), "Warehouse is required."));
            errors.Add(Positive(line.ShipUomId, nameof(line.ShipUomId), "Ship UOM is required."));
            errors.Add(Positive(line.ShippedQuantity, nameof(line.ShippedQuantity), "Shipped quantity must be greater than zero."));
            errors.Add(Required(line.Status, nameof(line.Status), "Line status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateShipmentProof(ShipmentProofRequest request) =>
        ThrowIfInvalid(Required(request.Status, nameof(request.Status), "Shipment status is required."));

    private static PackListLineDto MapPackListLine(PackListLine entity) =>
        new(entity.Id, entity.LineNo, entity.SalesOrderLineId, entity.ItemId, entity.ItemVariantId, entity.WarehouseId, entity.BinId, entity.LotId, entity.SerialId, entity.PackedQuantity, entity.PackUomId, entity.PackageRef, entity.Status);

    private static PackListDto MapPackList(PackList entity, IReadOnlyCollection<PackListLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PackListNo, entity.SalesOrderId, entity.PlannedShipDate, entity.Status, entity.Remarks, lines);

    private static ShipmentLineDto MapShipmentLine(ShipmentLine entity) =>
        new(entity.Id, entity.LineNo, entity.PackListLineId, entity.SalesOrderLineId, entity.ItemId, entity.ItemVariantId, entity.WarehouseId, entity.BinId, entity.LotId, entity.SerialId, entity.ShippedQuantity, entity.ShipUomId, entity.Status);

    private static ShipmentDto MapShipment(Shipment entity, IReadOnlyCollection<ShipmentLineDto> lines, IReadOnlyCollection<StockTransactionDto> stockTransactions) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.ShipmentNo, entity.PackListId, entity.CustomerId, entity.DispatchDate, entity.VehicleRef, entity.TrackingRef, entity.SealNo, entity.ProofNotes, entity.Status, entity.LoadedOn, entity.DeliveredOn, lines, stockTransactions);

    private static StockTransactionDto MapStockTransaction(StockTransaction entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.TransactionNo, entity.TransactionType, entity.PostingDate, entity.ItemId, entity.ItemVariantId, entity.FromWarehouseId, entity.FromBinId, entity.ToWarehouseId, entity.ToBinId, entity.LotId, entity.SerialId, entity.PcidId, entity.Quantity, entity.CatchWeightQty, entity.InventoryState, entity.SourceDocumentType, entity.SourceDocumentId, entity.Remarks, entity.SourceDocumentNo, entity.SourceDocumentLineId, entity.SourceDocumentRevisionNo, entity.SourceDocumentVersionNo, entity.ItemRevisionId, entity.EngineeringDocumentRevisionId, entity.BomRevisionId, entity.RoutingId, entity.RoutingRevisionId, entity.WorkOrderId, entity.ProductionOrderId, entity.SalesOrderId, entity.SalesOrderLineId, entity.PurchaseOrderId, entity.PurchaseOrderLineId, entity.QualityDocumentId, entity.LegacyTrackingIncomplete);

    private static DispatchPlanningItemDto MapDispatchPlanning(OrderSnapshot snapshot) =>
        new(snapshot.SalesOrderId, snapshot.SalesOrderNo, snapshot.CustomerId, snapshot.CustomerName, snapshot.PromisedDate, snapshot.OrderedQuantity, snapshot.PackedQuantity, snapshot.ShippedQuantity, snapshot.DispatchReadinessPercent, snapshot.StageStatus, snapshot.NextRequiredAction);

    private static StageWiseDashboardItemDto MapStageWise(OrderSnapshot snapshot) =>
        new(snapshot.SalesOrderId, snapshot.SalesOrderNo, snapshot.CustomerName, snapshot.StageCode, snapshot.StageStatus, snapshot.PrimaryBlockerCode, snapshot.OwnerRole, snapshot.DaysInStage, snapshot.NextRequiredAction);

    private static OrderRiskItemDto MapOrderRisk(OrderSnapshot snapshot) =>
        new(snapshot.SalesOrderId, snapshot.SalesOrderNo, snapshot.CustomerName, snapshot.PromisedDate, snapshot.CompletionPercent, snapshot.PendingOperationCount, snapshot.ShortageCount, snapshot.SupplierLateCount, snapshot.QcPendingCount, snapshot.DispatchReadinessPercent, snapshot.RiskStatus, snapshot.PrimaryBlockerCode);

    private sealed record ReceiptLineLink(long SalesOrderLineId, string InventoryState);
    private sealed record ReceiptInspectionLink(long SalesOrderLineId, string Status, string OverallResult, DateTimeOffset ModifiedOn);

    private sealed record BoqLink(long WorkOrderId, string Status, DateOnly NeedByDate);
    private sealed record PurchaseOrderLink(long WorkOrderId, string Status, DateOnly ExpectedDate);
    private sealed record DowntimeLink(long WorkOrderId, decimal DurationMinutes, DateTimeOffset StartOn);

    private sealed record StageSnapshot(string StageCode, string StageStatus, string OwnerRole);

    private sealed record OrderSnapshot(
        long SalesOrderId,
        string SalesOrderNo,
        long CustomerId,
        string? CustomerName,
        DateOnly? PromisedDate,
        string OrderStatus,
        decimal OrderedQuantity,
        decimal PackedQuantity,
        decimal ShippedQuantity,
        decimal CompletionPercent,
        int PendingOperationCount,
        int ShortageCount,
        int SupplierLateCount,
        int QcPendingCount,
        decimal DispatchReadinessPercent,
        string RiskStatus,
        int RiskRank,
        string? PrimaryBlockerCode,
        string StageCode,
        string StageStatus,
        string OwnerRole,
        int DaysInStage,
        string NextRequiredAction);
}
