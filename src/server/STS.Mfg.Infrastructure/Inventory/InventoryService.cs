using System.Globalization;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Inventory;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Inventory;

internal sealed class InventoryService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail,
    InventoryPostingService inventoryPostingService,
    IInventoryPolicyService inventoryPolicyService)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IInventoryService
{
    public async Task<PagedResult<StockBalanceDto>> ListStockBalancesAsync(InventoryFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.StockBalances.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.WarehouseId.HasValue)
        {
            query = query.Where(entity => entity.WarehouseId == filter.WarehouseId.Value);
        }

        if (filter.BinId.HasValue)
        {
            query = query.Where(entity => entity.BinId == filter.BinId.Value);
        }

        if (filter.ItemId.HasValue)
        {
            query = query.Where(entity => entity.ItemId == filter.ItemId.Value);
        }

        if (filter.ItemVariantId.HasValue)
        {
            query = query.Where(entity => entity.ItemVariantId == filter.ItemVariantId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search) && long.TryParse(filter.Search.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var searchId))
        {
            query = query.Where(entity =>
                entity.ItemId == searchId ||
                entity.LotId == searchId ||
                entity.SerialId == searchId);
        }

        var page = await query.OrderBy(entity => entity.ItemId)
            .ThenBy(entity => entity.WarehouseId)
            .ThenBy(entity => entity.BinId)
            .ThenBy(entity => entity.LotId)
            .ThenBy(entity => entity.SerialId)
            .ToPagedResultAsync(filter, cancellationToken);

        return MapPage(page, MapStockBalance);
    }

    public async Task<PagedResult<StockTransactionDto>> ListStockTransactionsAsync(InventoryFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.StockTransactions.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.WarehouseId.HasValue)
        {
            query = query.Where(entity => entity.FromWarehouseId == filter.WarehouseId.Value || entity.ToWarehouseId == filter.WarehouseId.Value);
        }

        if (filter.BinId.HasValue)
        {
            query = query.Where(entity => entity.FromBinId == filter.BinId.Value || entity.ToBinId == filter.BinId.Value);
        }

        if (filter.ItemId.HasValue)
        {
            query = query.Where(entity => entity.ItemId == filter.ItemId.Value);
        }

        if (filter.ItemVariantId.HasValue)
        {
            query = query.Where(entity => entity.ItemVariantId == filter.ItemVariantId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.TransactionType))
        {
            var transactionType = filter.TransactionType.Trim();
            query = query.Where(entity => entity.TransactionType == transactionType);
        }

        if (filter.DateFrom.HasValue)
        {
            var dateFrom = DateOnly.FromDateTime(filter.DateFrom.Value.Date);
            query = query.Where(entity => entity.PostingDate >= dateFrom);
        }

        if (filter.DateTo.HasValue)
        {
            var dateTo = DateOnly.FromDateTime(filter.DateTo.Value.Date);
            query = query.Where(entity => entity.PostingDate <= dateTo);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.TransactionNo.Contains(search) ||
                (entity.SourceDocumentType != null && entity.SourceDocumentType.Contains(search)));
        }

        var page = await query.OrderByDescending(entity => entity.PostingDate)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        return MapPage(page, MapStockTransaction);
    }

    public async Task<PagedResult<StockReservationDto>> ListStockReservationsAsync(InventoryFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.StockReservations.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.WarehouseId.HasValue)
        {
            query = query.Where(entity => entity.WarehouseId == filter.WarehouseId.Value);
        }

        if (filter.ItemId.HasValue)
        {
            query = query.Where(entity => entity.ItemId == filter.ItemId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = long.TryParse(search, NumberStyles.Integer, CultureInfo.InvariantCulture, out var sourceDocumentId)
                ? query.Where(entity => entity.SourceDocumentType.Contains(search) || entity.SourceDocumentId == sourceDocumentId)
                : query.Where(entity => entity.SourceDocumentType.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.CreatedOn)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        return MapPage(page, MapStockReservation);
    }

    public async Task<StockReservationDto> ReserveStockAsync(StockReservationRequest request, CancellationToken cancellationToken = default)
    {
        ValidateReservation(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var itemId = await ResolveItemIdAsync(request.CompanyId, request.ItemId, request.ItemCode, cancellationToken);
        var itemVariantId = await ResolveItemVariantIdAsync(request.CompanyId, itemId, request.ItemVariantId, request.ItemVariantCode, cancellationToken);
        var lotId = await ResolveLotIdAsync(request.CompanyId, itemId, request.LotId, request.LotNo, cancellationToken);
        EnsureWarehouseAccess(request.WarehouseId);
        await EnsureWarehouseAndBinAreUsableAsync(request.CompanyId, request.BranchId, request.WarehouseId, request.BinId, cancellationToken);
        var reservationValidation = await inventoryPolicyService.ValidateMovementAsync(
            new StockMovementValidationRequest(
                request.CompanyId,
                request.BranchId,
                DateOnly.FromDateTime(DateTime.UtcNow),
                request.SourceDocumentType,
                request.SourceDocumentId,
                new[]
                {
                    new StockMovementValidationLineRequest(
                        10,
                        "Reserve",
                        itemId,
                        itemVariantId,
                        request.WarehouseId,
                        request.BinId,
                        null,
                        null,
                        lotId,
                        null,
                        null,
                        request.ReservedQuantity,
                        "Available",
                        request.SourceDocumentType,
                        request.SourceDocumentId)
                }),
            cancellationToken);

        ThrowIfInvalid(reservationValidation.Errors);

        var balance = await FindStockBalanceAsync(
            request.CompanyId,
            request.BranchId,
            itemId,
            itemVariantId,
            request.WarehouseId,
            request.BinId,
            lotId,
            null,
            cancellationToken);

        balance = EnsureFound(balance, "Stock balance was not found for the reservation line.", "inventory.balance_not_found");
        var availableQty = GetAvailableQuantity(balance);
        ThrowIfInvalid(
            availableQty < request.ReservedQuantity
                ? new ApiError("inventory.insufficient_qty", nameof(request.ReservedQuantity), "Insufficient available quantity for the requested reservation.")
                : null);

        var entity = StockReservation.Create(
            request.CompanyId,
            request.BranchId,
            itemId,
            itemVariantId,
            request.WarehouseId,
            request.BinId,
            lotId,
            request.ReservedQuantity,
            request.SourceDocumentType,
            request.SourceDocumentId,
            string.IsNullOrWhiteSpace(request.Status) ? "Reserved" : request.Status,
            GetUserId());

        UpdateReservedQuantity(balance, request.ReservedQuantity, GetUserId());
        DbContext.StockReservations.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapStockReservation(entity);
        await WriteAuditAsync("inventory", nameof(StockReservation), "stock.reservation.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ActionResponse> ReleaseStockReservationAsync(long id, StockReservationReleaseRequest? request, CancellationToken cancellationToken = default)
    {
        _ = request;
        var scope = GetScope();
        var entity = await DbContext.StockReservations
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Stock reservation was not found in the active scope.", "inventory.reservation_not_found");
        if (string.Equals(entity.Status, "Released", StringComparison.OrdinalIgnoreCase))
        {
            return new ActionResponse(entity.Id.ToString(CultureInfo.InvariantCulture), entity.Status, $"{entity.SourceDocumentType} {entity.SourceDocumentId}", Array.Empty<string>());
        }

        var balance = await FindStockBalanceAsync(
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.ItemId,
            entity.ItemVariantId,
            entity.WarehouseId ?? 0,
            entity.BinId,
            entity.LotId,
            null,
            cancellationToken);

        balance = EnsureFound(balance, "Stock balance was not found for the reservation release.", "inventory.balance_not_found");
        var releasedQty = entity.ReservedQuantity;
        var before = MapStockReservation(entity);
        entity.Update(0m, entity.SourceDocumentType, "Released", GetUserId());
        UpdateReservedQuantity(balance, -releasedQty, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapStockReservation(entity);
        await WriteAuditAsync("inventory", nameof(StockReservation), "stock.reservation.release", entity.Id, before, after, cancellationToken);
        return new ActionResponse(entity.Id.ToString(CultureInfo.InvariantCulture), entity.Status, $"{entity.SourceDocumentType} {entity.SourceDocumentId}", Array.Empty<string>());
    }

    public async Task<IReadOnlyCollection<StockTransactionDto>> IssueStockAsync(StockIssueRequest request, CancellationToken cancellationToken = default)
    {
        ValidateStockIssue(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        return await inventoryPostingService.IssueAsync(
            new InventoryIssueCommand(
                request.CompanyId,
                request.BranchId,
                request.TransactionNo,
                request.PostingDate,
                request.SourceDocumentType,
                request.SourceDocumentId,
                request.Remarks,
                "stock.issue",
                request.Lines
                    .OrderBy(line => line.LineNo)
                    .Select(line => new InventoryIssueLine(
                        line.LineNo,
                        "Issue",
                        line.ItemId,
                        line.ItemVariantId,
                        line.FromWarehouseId,
                        line.FromBinId,
                        line.Quantity,
                        line.CatchWeightQty,
                        line.InventoryState,
                        line.LotId,
                        line.LotNo,
                        line.SerialId,
                        line.SerialNo,
                        line.ItemCode,
                        line.ItemVariantCode,
                        line.PcidId,
                        line.PcidNo,
                        line.SourceDocumentNo,
                        line.SourceDocumentLineId,
                        line.SourceDocumentRevisionNo,
                        line.SourceDocumentVersionNo,
                        line.ItemRevisionId,
                        line.EngineeringDocumentRevisionId,
                        line.BomRevisionId,
                        line.RoutingId,
                        line.RoutingRevisionId,
                        line.WorkOrderId,
                        line.ProductionOrderId,
                        line.SalesOrderId,
                        line.SalesOrderLineId,
                        line.PurchaseOrderId,
                        line.PurchaseOrderLineId,
                        line.QualityDocumentId))
                    .ToArray()),
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<StockTransactionDto>> ReturnStockAsync(StockReturnRequest request, CancellationToken cancellationToken = default)
    {
        ValidateStockReturn(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        return await inventoryPostingService.ReceiveAsync(
            new InventoryReceiptCommand(
                request.CompanyId,
                request.BranchId,
                request.TransactionNo,
                request.PostingDate,
                request.SourceDocumentType,
                request.SourceDocumentId,
                request.Remarks,
                "stock.return",
                request.Lines
                    .OrderBy(line => line.LineNo)
                    .Select(line => new InventoryReceiptLine(
                        line.LineNo,
                        "Return",
                        line.ItemId,
                        line.ItemVariantId,
                        line.ToWarehouseId,
                        line.ToBinId,
                        line.Quantity,
                        line.CatchWeightQty,
                        line.InventoryState,
                        line.LotId,
                        line.LotNo,
                        null,
                        null,
                        line.SerialId,
                        line.SerialNo,
                        line.ItemCode,
                        line.ItemVariantCode,
                        line.PcidId,
                        line.PcidNo,
                        line.SourceDocumentNo,
                        line.SourceDocumentLineId,
                        line.SourceDocumentRevisionNo,
                        line.SourceDocumentVersionNo,
                        line.ItemRevisionId,
                        line.EngineeringDocumentRevisionId,
                        line.BomRevisionId,
                        line.RoutingId,
                        line.RoutingRevisionId,
                        line.WorkOrderId,
                        line.ProductionOrderId,
                        line.SalesOrderId,
                        line.SalesOrderLineId,
                        line.PurchaseOrderId,
                        line.PurchaseOrderLineId,
                        line.QualityDocumentId))
                    .ToArray()),
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<StockTransactionDto>> TransferStockAsync(StockTransferRequest request, CancellationToken cancellationToken = default)
    {
        ValidateStockTransfer(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        return await inventoryPostingService.TransferAsync(
            new InventoryTransferCommand(
                request.CompanyId,
                request.BranchId,
                request.TransactionNo,
                request.PostingDate,
                request.SourceDocumentType,
                request.SourceDocumentId,
                request.Remarks,
                "stock.transfer",
                request.Lines
                    .OrderBy(line => line.LineNo)
                    .Select(line => new InventoryTransferLine(
                        line.LineNo,
                        "Transfer",
                        line.ItemId,
                        line.ItemVariantId,
                        line.FromWarehouseId,
                        line.FromBinId,
                        line.ToWarehouseId,
                        line.ToBinId,
                        line.Quantity,
                        line.CatchWeightQty,
                        line.InventoryState,
                        line.InventoryState,
                        line.LotId,
                        line.LotNo,
                        line.SerialId,
                        line.SerialNo,
                        line.ItemCode,
                        line.ItemVariantCode,
                        line.PcidId,
                        line.PcidNo,
                        line.SourceDocumentNo,
                        line.SourceDocumentLineId,
                        line.SourceDocumentRevisionNo,
                        line.SourceDocumentVersionNo,
                        line.ItemRevisionId,
                        line.EngineeringDocumentRevisionId,
                        line.BomRevisionId,
                        line.RoutingId,
                        line.RoutingRevisionId,
                        line.WorkOrderId,
                        line.ProductionOrderId,
                        line.SalesOrderId,
                        line.SalesOrderLineId,
                        line.PurchaseOrderId,
                        line.PurchaseOrderLineId,
                        line.QualityDocumentId))
                    .ToArray()),
            cancellationToken);
    }

    public async Task<PagedResult<CycleCountDto>> ListCycleCountsAsync(CycleCountFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.CycleCounts.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.WarehouseId.HasValue)
        {
            query = query.Where(entity => entity.WarehouseId == filter.WarehouseId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (filter.DateFrom.HasValue)
        {
            var dateFrom = DateOnly.FromDateTime(filter.DateFrom.Value.Date);
            query = query.Where(entity => entity.CountDate >= dateFrom);
        }

        if (filter.DateTo.HasValue)
        {
            var dateTo = DateOnly.FromDateTime(filter.DateTo.Value.Date);
            query = query.Where(entity => entity.CountDate <= dateTo);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.CountNo.Contains(search) || entity.CountType.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.CountDate)
            .ThenBy(entity => entity.CountNo)
            .ToPagedResultAsync(filter, cancellationToken);

        var lines = await LoadCycleCountLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapCycleCount(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<CycleCountLineDto>())));
    }

    public async Task<CycleCountDto> GetCycleCountAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.CycleCounts.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Cycle count was not found in the active scope.", "inventory.cycle_count_not_found");
        var lines = await LoadCycleCountLinesAsync(new[] { id }, cancellationToken);
        return MapCycleCount(entity, lines.GetValueOrDefault(id, Array.Empty<CycleCountLineDto>()));
    }

    public async Task<CycleCountDto> CreateCycleCountAsync(CycleCountUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCycleCount(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureWarehouseAccess(request.WarehouseId);
        await EnsureWarehouseAndBinAreUsableAsync(request.CompanyId, request.BranchId, request.WarehouseId, null, cancellationToken);

        var entity = CycleCount.Create(
            request.CompanyId,
            request.BranchId,
            request.WarehouseId,
            request.CountNo,
            request.CountDate,
            request.CountType,
            request.Status,
            request.Remarks,
            GetUserId());

        DbContext.CycleCounts.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            var lines = await MaterializeCycleCountLinesAsync(entity.Id, request, cancellationToken);
            DbContext.CycleCountLines.AddRange(lines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetCycleCountAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("inventory", nameof(CycleCount), "cycle-count.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<CycleCountDto> UpdateCycleCountAsync(long id, CycleCountUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCycleCount(request);

        var scope = GetScope();
        var entity = await DbContext.CycleCounts
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Cycle count was not found in the active scope.", "inventory.cycle_count_not_found");
        ThrowIfInvalid(
            string.Equals(entity.Status, "Posted", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Posted cycle counts cannot be modified.")
                : null,
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Cycle-count company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Cycle-count branch cannot be changed."),
            Immutable(entity.WarehouseId ?? 0, request.WarehouseId, nameof(request.WarehouseId), "Cycle-count warehouse cannot be changed."));

        var before = await GetCycleCountAsync(id, cancellationToken);
        entity.Update(request.CountNo, request.CountDate, request.CountType, request.Status, request.Remarks, GetUserId());

        var existingLines = await DbContext.CycleCountLines.Where(record => record.CycleCountId == id).ToListAsync(cancellationToken);
        DbContext.CycleCountLines.RemoveRange(existingLines);
        if (request.Lines.Count > 0)
        {
            var lines = await MaterializeCycleCountLinesAsync(id, request, cancellationToken);
            DbContext.CycleCountLines.AddRange(lines);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetCycleCountAsync(id, cancellationToken);
        await WriteAuditAsync("inventory", nameof(CycleCount), "cycle-count.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<CycleCountDto> PostCycleCountAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.CycleCounts
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Cycle count was not found in the active scope.", "inventory.cycle_count_not_found");
        ThrowIfInvalid(
            string.Equals(entity.Status, "Posted", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Cycle count has already been posted.")
                : null);

        var lines = await DbContext.CycleCountLines.Where(record => record.CycleCountId == id).OrderBy(record => record.LineNo).ToListAsync(cancellationToken);
        var before = await GetCycleCountAsync(id, cancellationToken);
        var transactions = new List<StockTransaction>();
        var userId = GetUserId();

        foreach (var line in lines)
        {
            var (lot, serial) = await LoadTraceabilityAsync(entity.CompanyId ?? 0, line.LotId, line.SerialId, cancellationToken);
            var balance = await GetOrCreateStockBalanceAsync(
                entity.CompanyId ?? 0,
                entity.BranchId ?? 0,
                line.ItemId,
                line.ItemVariantId,
                entity.WarehouseId ?? 0,
                line.BinId,
                line.LotId,
                line.SerialId,
                cancellationToken);

            var variance = line.CountedQuantity - line.SystemQuantity;
            if (variance != 0)
            {
                balance.UpdateQuantities(
                    line.CountedQuantity,
                    balance.ReservedQty,
                    balance.QcHoldQty,
                    balance.BlockedQty,
                    balance.InTransitQty,
                    balance.CatchWeightQty,
                    userId);

                transactions.Add(StockTransaction.Create(
                    entity.CompanyId ?? 0,
                    entity.BranchId ?? 0,
                    BuildCycleCountAdjustmentTransactionNo(entity.CountNo, line.LineNo),
                    "Adjustment",
                    entity.CountDate,
                    line.ItemId,
                    line.ItemVariantId,
                    variance < 0 ? entity.WarehouseId : null,
                    variance < 0 ? line.BinId : null,
                    variance > 0 ? entity.WarehouseId : null,
                    variance > 0 ? line.BinId : null,
                    line.LotId,
                    line.SerialId,
                    variance,
                    null,
                    "Available",
                    "CycleCount",
                    entity.Id,
                    entity.Remarks,
                    userId));
            }

            UpdateLotAfterAvailableMovement(lot, null, line.CountedQuantity > 0, userId);
            UpdateSerialAfterCycleCount(serial, entity.WarehouseId, line.BinId, line.CountedQuantity > 0, userId);
            line.Update(line.SystemQuantity, line.CountedQuantity, variance, "Posted", line.Remarks, userId);
        }

        entity.MarkPosted(DateTimeOffset.UtcNow, userId);
        if (transactions.Count > 0)
        {
            DbContext.StockTransactions.AddRange(transactions);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetCycleCountAsync(id, cancellationToken);
        await WriteAuditAsync("inventory", nameof(CycleCount), "cycle-count.post", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<LotTraceabilityDto> GetLotTraceabilityAsync(string lotNo, TraceabilityFilter filter, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(Required(lotNo, nameof(lotNo), "Lot number is required."));

        var scope = GetScope();
        var itemId = await ResolveTraceabilityItemIdAsync(filter, cancellationToken);
        var normalizedLotNo = lotNo.Trim();
        var query = DbContext.Lots.AsNoTracking().ApplyCompanyScope(scope).Where(entity => entity.LotNo == normalizedLotNo);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (itemId.HasValue)
        {
            query = query.Where(entity => entity.ItemId == itemId.Value);
        }

        var lots = await query.OrderBy(entity => entity.Id).ToListAsync(cancellationToken);
        ThrowIfInvalid(
            lots.Count > 1 && !itemId.HasValue
                ? new ApiError("validation.ambiguous", nameof(filter.ItemId), "Multiple lots share this lot number. Supply itemId to disambiguate.")
                : null);

        var lot = EnsureFound(lots.FirstOrDefault(), "Lot was not found in the active scope.", "inventory.lot_not_found");
        var balances = await LoadTraceBalancesAsync(lot.Id, null, filter.BranchId, cancellationToken);
        var transactions = await LoadTraceTransactionsAsync(lot.Id, null, filter.BranchId, cancellationToken);

        return new LotTraceabilityDto(
            lot.Id,
            lot.CompanyId ?? 0,
            lot.ItemId,
            lot.LotNo,
            lot.ManufacturedOn,
            lot.ExpiryOn,
            lot.LotStatus,
            lot.CatchWeightQty,
            balances,
            transactions);
    }

    public async Task<SerialTraceabilityDto> GetSerialTraceabilityAsync(string serialNo, TraceabilityFilter filter, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(Required(serialNo, nameof(serialNo), "Serial number is required."));

        var scope = GetScope();
        var itemId = await ResolveTraceabilityItemIdAsync(filter, cancellationToken);
        var normalizedSerialNo = serialNo.Trim();
        var query = DbContext.Serials.AsNoTracking().ApplyCompanyScope(scope).Where(entity => entity.SerialNo == normalizedSerialNo);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (itemId.HasValue)
        {
            query = query.Where(entity => entity.ItemId == itemId.Value);
        }

        var serial = await query.OrderBy(entity => entity.Id).FirstOrDefaultAsync(cancellationToken);
        serial = EnsureFound(serial, "Serial was not found in the active scope.", "inventory.serial_not_found");

        var balances = await LoadTraceBalancesAsync(null, serial.Id, filter.BranchId, cancellationToken);
        var transactions = await LoadTraceTransactionsAsync(null, serial.Id, filter.BranchId, cancellationToken);

        return new SerialTraceabilityDto(
            serial.Id,
            serial.CompanyId ?? 0,
            serial.ItemId,
            serial.SerialNo,
            serial.LotId,
            serial.CurrentWarehouseId,
            serial.CurrentBinId,
            serial.SerialStatus,
            serial.ManufacturedOn,
            serial.ExpiryOn,
            balances,
            transactions);
    }

    private async Task<IReadOnlyCollection<CycleCountLine>> MaterializeCycleCountLinesAsync(
        long cycleCountId,
        CycleCountUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var lines = new List<CycleCountLine>();
        foreach (var line in request.Lines.OrderBy(record => record.LineNo))
        {
            var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
            var itemVariantId = await ResolveItemVariantIdAsync(request.CompanyId, itemId, line.ItemVariantId, line.ItemVariantCode, cancellationToken);
            var lotId = await ResolveLotIdAsync(request.CompanyId, itemId, line.LotId, line.LotNo, cancellationToken);
            var serialId = await ResolveSerialIdAsync(request.CompanyId, itemId, lotId, line.SerialId, line.SerialNo, cancellationToken);
            await LoadTraceabilityAsync(request.CompanyId, lotId, serialId, cancellationToken);
            if (line.BinId.HasValue)
            {
                await EnsureWarehouseAndBinAreUsableAsync(request.CompanyId, request.BranchId, request.WarehouseId, line.BinId, cancellationToken);
            }

            var systemQuantity = await GetCurrentOnHandQuantityAsync(
                request.CompanyId,
                request.BranchId,
                request.WarehouseId,
                itemId,
                itemVariantId,
                line.BinId,
                lotId,
                serialId,
                cancellationToken);

            lines.Add(CycleCountLine.Create(
                cycleCountId,
                line.LineNo,
                itemId,
                itemVariantId,
                line.BinId,
                lotId,
                serialId,
                systemQuantity,
                line.CountedQuantity,
                line.Status,
                line.Remarks,
                GetUserId()));
        }

        return lines;
    }

    private async Task<Dictionary<long, IReadOnlyCollection<CycleCountLineDto>>> LoadCycleCountLinesAsync(
        IReadOnlyCollection<long> cycleCountIds,
        CancellationToken cancellationToken)
    {
        var lines = await DbContext.CycleCountLines.AsNoTracking()
            .Where(record => cycleCountIds.Contains(record.CycleCountId))
            .OrderBy(record => record.LineNo)
            .ToListAsync(cancellationToken);

        return lines.GroupBy(record => record.CycleCountId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<CycleCountLineDto>)group.Select(MapCycleCountLine).ToArray());
    }

    private async Task<decimal> GetCurrentOnHandQuantityAsync(
        long companyId,
        long branchId,
        long warehouseId,
        long itemId,
        long? itemVariantId,
        long? binId,
        long? lotId,
        long? serialId,
        CancellationToken cancellationToken)
    {
        var query = DbContext.StockBalances.AsNoTracking().Where(record =>
            record.CompanyId == companyId &&
            record.BranchId == branchId &&
            record.WarehouseId == warehouseId &&
            record.ItemId == itemId &&
            record.ItemVariantId == itemVariantId &&
            record.BinId == binId &&
            record.LotId == lotId &&
            record.SerialId == serialId &&
            record.PcidId == null);

        return await query.Select(record => (decimal?)record.OnHandQty).FirstOrDefaultAsync(cancellationToken) ?? 0m;
    }

    private async Task<StockBalance?> FindStockBalanceAsync(
        long companyId,
        long branchId,
        long itemId,
        long? itemVariantId,
        long warehouseId,
        long? binId,
        long? lotId,
        long? serialId,
        CancellationToken cancellationToken) =>
        await DbContext.StockBalances.FirstOrDefaultAsync(record =>
            record.CompanyId == companyId &&
            record.BranchId == branchId &&
            record.ItemId == itemId &&
            record.ItemVariantId == itemVariantId &&
            record.WarehouseId == warehouseId &&
            record.BinId == binId &&
            record.LotId == lotId &&
            record.SerialId == serialId &&
            record.PcidId == null,
            cancellationToken);

    private async Task<StockBalance> GetOrCreateStockBalanceAsync(
        long companyId,
        long branchId,
        long itemId,
        long? itemVariantId,
        long warehouseId,
        long? binId,
        long? lotId,
        long? serialId,
        CancellationToken cancellationToken)
    {
        var balance = await FindStockBalanceAsync(companyId, branchId, itemId, itemVariantId, warehouseId, binId, lotId, serialId, cancellationToken);
        if (balance is not null)
        {
            return balance;
        }

        balance = StockBalance.Create(companyId, branchId, itemId, itemVariantId, warehouseId, binId, lotId, serialId, 0m, 0m, 0m, 0m, 0m, null, GetUserId());
        DbContext.StockBalances.Add(balance);
        return balance;
    }

    private async Task<(Lot? Lot, Serial? Serial)> LoadTraceabilityAsync(
        long companyId,
        long? lotId,
        long? serialId,
        CancellationToken cancellationToken)
    {
        Lot? lot = null;
        Serial? serial = null;

        if (lotId.HasValue)
        {
            lot = await DbContext.Lots.FirstOrDefaultAsync(record => record.Id == lotId.Value && record.CompanyId == companyId, cancellationToken);
            lot = EnsureFound(lot, "Lot was not found for the requested movement.", "inventory.lot_not_found");
        }

        if (serialId.HasValue)
        {
            serial = await DbContext.Serials.FirstOrDefaultAsync(record => record.Id == serialId.Value && record.CompanyId == companyId, cancellationToken);
            serial = EnsureFound(serial, "Serial was not found for the requested movement.", "inventory.serial_not_found");
        }

        ThrowIfInvalid(
            serial is not null && lotId.HasValue && serial.LotId.HasValue && serial.LotId != lotId
                ? new ApiError("validation.mismatch", nameof(serialId), "Serial does not belong to the specified lot.")
                : null);

        return (lot, serial);
    }

    private async Task EnsureWarehouseAndBinAreUsableAsync(
        long companyId,
        long branchId,
        long warehouseId,
        long? binId,
        CancellationToken cancellationToken)
    {
        var warehouse = await DbContext.Warehouses.AsNoTracking().FirstOrDefaultAsync(record =>
            record.Id == warehouseId &&
            record.CompanyId == companyId &&
            record.BranchId == branchId,
            cancellationToken);

        warehouse = EnsureFound(warehouse, "Warehouse was not found in the active scope.", "inventory.warehouse_not_found");
        ThrowIfInvalid(
            !string.Equals(warehouse.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(warehouse.Status), "Warehouse must be active.")
                : null);

        if (!binId.HasValue)
        {
            return;
        }

        var bin = await DbContext.Bins.AsNoTracking().FirstOrDefaultAsync(record =>
            record.Id == binId.Value &&
            record.CompanyId == companyId &&
            record.BranchId == branchId &&
            record.WarehouseId == warehouseId,
            cancellationToken);

        bin = EnsureFound(bin, "Bin was not found in the active scope.", "inventory.bin_not_found");
        ThrowIfInvalid(
            !string.Equals(bin.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(bin.Status), "Bin must be active.")
                : null,
            bin.IsBlocked
                ? new ApiError("validation.invalid_state", nameof(binId), "Blocked bins cannot be used for stock movement.")
                : null);
    }

    private async Task<IReadOnlyCollection<StockBalanceDto>> LoadTraceBalancesAsync(
        long? lotId,
        long? serialId,
        long? branchId,
        CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var query = DbContext.StockBalances.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope);

        if (lotId.HasValue)
        {
            query = query.Where(entity => entity.LotId == lotId.Value);
        }

        if (serialId.HasValue)
        {
            query = query.Where(entity => entity.SerialId == serialId.Value);
        }

        if (branchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == branchId.Value);
        }

        var balances = await query.OrderBy(entity => entity.WarehouseId)
            .ThenBy(entity => entity.BinId)
            .ThenBy(entity => entity.Id)
            .ToListAsync(cancellationToken);

        return balances.Select(MapStockBalance).ToArray();
    }

    private async Task<IReadOnlyCollection<StockTransactionDto>> LoadTraceTransactionsAsync(
        long? lotId,
        long? serialId,
        long? branchId,
        CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var query = DbContext.StockTransactions.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (lotId.HasValue)
        {
            query = query.Where(entity => entity.LotId == lotId.Value);
        }

        if (serialId.HasValue)
        {
            query = query.Where(entity => entity.SerialId == serialId.Value);
        }

        if (branchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == branchId.Value);
        }

        var transactions = await query.OrderByDescending(entity => entity.PostingDate)
            .ThenByDescending(entity => entity.Id)
            .ToListAsync(cancellationToken);

        return transactions.Select(MapStockTransaction).ToArray();
    }

    private async Task WriteMovementAuditAsync(
        string actionCode,
        IReadOnlyCollection<StockTransaction> transactions,
        IReadOnlyCollection<StockTransactionDto> payload,
        CancellationToken cancellationToken)
    {
        var anchor = transactions.OrderBy(entity => entity.Id).FirstOrDefault();
        if (anchor is null)
        {
            return;
        }

        await WriteAuditAsync("inventory", nameof(StockTransaction), actionCode, anchor.Id, null, payload, cancellationToken);
    }

    private static decimal GetAvailableQuantity(StockBalance balance) =>
        balance.OnHandQty - balance.ReservedQty - balance.QcHoldQty - balance.BlockedQty;

    private static void UpdateBalance(StockBalance balance, decimal onHandDelta, decimal? catchWeightDelta, long? userId) =>
        balance.UpdateQuantities(
            balance.OnHandQty + onHandDelta,
            balance.ReservedQty,
            balance.QcHoldQty,
            balance.BlockedQty,
            balance.InTransitQty,
            Add(balance.CatchWeightQty, catchWeightDelta),
            userId);

    private static void UpdateReservedQuantity(StockBalance balance, decimal reservedDelta, long? userId) =>
        balance.UpdateQuantities(
            balance.OnHandQty,
            Math.Max(balance.ReservedQty + reservedDelta, 0m),
            balance.QcHoldQty,
            balance.BlockedQty,
            balance.InTransitQty,
            balance.CatchWeightQty,
            userId);

    private static decimal? Add(decimal? current, decimal? delta)
    {
        if (!delta.HasValue)
        {
            return current;
        }

        return (current ?? 0m) + delta.Value;
    }

    private static decimal? Negate(decimal? value) => value.HasValue ? -value.Value : null;

    private static void UpdateLotAfterAvailableMovement(Lot? lot, decimal? catchWeightDelta, bool hasAvailableQuantity, long? userId)
    {
        if (lot is null)
        {
            return;
        }

        lot.Update(
            lot.LotNo,
            lot.ManufacturedOn,
            lot.ExpiryOn,
            hasAvailableQuantity ? "Available" : "Consumed",
            Add(lot.CatchWeightQty, catchWeightDelta),
            userId);
    }

    private static void UpdateSerialAfterIssue(Serial? serial, StockBalance sourceBalance, long? userId)
    {
        if (serial is null)
        {
            return;
        }

        var hasAvailableQuantity = sourceBalance.OnHandQty > 0;
        serial.Update(
            serial.SerialNo,
            serial.LotId,
            hasAvailableQuantity ? serial.CurrentWarehouseId : null,
            hasAvailableQuantity ? serial.CurrentBinId : null,
            hasAvailableQuantity ? "Available" : "Issued",
            serial.ManufacturedOn,
            serial.ExpiryOn,
            userId);
    }

    private static void UpdateSerialAfterReceiptOrTransfer(Serial? serial, long warehouseId, long? binId, long? userId)
    {
        if (serial is null)
        {
            return;
        }

        serial.Update(
            serial.SerialNo,
            serial.LotId,
            warehouseId,
            binId,
            "Available",
            serial.ManufacturedOn,
            serial.ExpiryOn,
            userId);
    }

    private static void UpdateSerialAfterCycleCount(Serial? serial, long? warehouseId, long? binId, bool hasAvailableQuantity, long? userId)
    {
        if (serial is null)
        {
            return;
        }

        serial.Update(
            serial.SerialNo,
            serial.LotId,
            hasAvailableQuantity ? warehouseId : null,
            hasAvailableQuantity ? binId : null,
            hasAvailableQuantity ? "Available" : "Consumed",
            serial.ManufacturedOn,
            serial.ExpiryOn,
            userId);
    }

    private static string BuildTransactionNo(string transactionNo, int lineNo, int lineCount)
    {
        var normalized = transactionNo.Trim();
        if (lineCount <= 1)
        {
            return normalized;
        }

        var suffix = $"-{lineNo:D3}";
        return normalized.Length + suffix.Length <= 48
            ? normalized + suffix
            : normalized[..(48 - suffix.Length)] + suffix;
    }

    private static string BuildCycleCountAdjustmentTransactionNo(string countNo, int lineNo)
    {
        var normalized = countNo.Trim();
        var suffix = $"-ADJ-{lineNo:D3}";
        return normalized.Length + suffix.Length <= 48
            ? normalized + suffix
            : normalized[..(48 - suffix.Length)] + suffix;
    }

    private static void ValidateStockIssue(StockIssueRequest request)
    {
        var errors = ValidateMovementHeader(request.CompanyId, request.BranchId, request.TransactionNo, request.Lines.Count);
        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Issue line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.AddRange(ValidateIssueLine(line));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateStockReturn(StockReturnRequest request)
    {
        var errors = ValidateMovementHeader(request.CompanyId, request.BranchId, request.TransactionNo, request.Lines.Count);
        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Return line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.AddRange(ValidateReturnLine(line));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateStockTransfer(StockTransferRequest request)
    {
        var errors = ValidateMovementHeader(request.CompanyId, request.BranchId, request.TransactionNo, request.Lines.Count);
        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Transfer line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.AddRange(ValidateTransferLine(line));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateReservation(StockReservationRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.SourceDocumentType, nameof(request.SourceDocumentType), "Reservation source type is required."),
            request.SourceDocumentId <= 0
                ? new ApiError("validation.required", nameof(request.SourceDocumentId), "Reservation source id is required.")
                : null,
            request.ItemId <= 0 && string.IsNullOrWhiteSpace(request.ItemCode)
                ? new ApiError("validation.required", nameof(request.ItemId), "Item is required.")
                : null,
            request.WarehouseId <= 0
                ? new ApiError("validation.required", nameof(request.WarehouseId), "Warehouse is required.")
                : null,
            request.ReservedQuantity <= 0
                ? new ApiError("validation.range", nameof(request.ReservedQuantity), "Reserved quantity must be greater than zero.")
                : null);
    }

    private static List<ApiError?> ValidateMovementHeader(long companyId, long branchId, string transactionNo, int lineCount) =>
        new()
        {
            Positive(companyId, nameof(companyId), "Company is required."),
            Positive(branchId, nameof(branchId), "Branch is required."),
            Required(transactionNo, nameof(transactionNo), "Transaction number is required."),
            lineCount == 0 ? new ApiError("validation.required", "Lines", "At least one movement line is required.") : null
        };

    private static IEnumerable<ApiError?> ValidateIssueLine(StockIssueLineRequest line) =>
        new ApiError?[]
        {
            line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null,
            line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."),
            Positive(line.FromWarehouseId, nameof(line.FromWarehouseId), "Source warehouse is required."),
            Positive(line.Quantity, nameof(line.Quantity), "Issue quantity must be greater than zero."),
            Required(line.InventoryState, nameof(line.InventoryState), "Inventory state is required."),
            !string.Equals(line.InventoryState, "Available", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.unsupported", nameof(line.InventoryState), "Only Available-state issue moves are supported in this pass.")
                : null
        };

    private static IEnumerable<ApiError?> ValidateReturnLine(StockReturnLineRequest line) =>
        new ApiError?[]
        {
            line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null,
            line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."),
            Positive(line.ToWarehouseId, nameof(line.ToWarehouseId), "Destination warehouse is required."),
            Positive(line.Quantity, nameof(line.Quantity), "Return quantity must be greater than zero."),
            Required(line.InventoryState, nameof(line.InventoryState), "Inventory state is required."),
            !string.Equals(line.InventoryState, "Available", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.unsupported", nameof(line.InventoryState), "Only Available-state return moves are supported in this pass.")
                : null
        };

    private static IEnumerable<ApiError?> ValidateTransferLine(StockTransferLineRequest line) =>
        new ApiError?[]
        {
            line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null,
            line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."),
            Positive(line.FromWarehouseId, nameof(line.FromWarehouseId), "Source warehouse is required."),
            Positive(line.ToWarehouseId, nameof(line.ToWarehouseId), "Destination warehouse is required."),
            Positive(line.Quantity, nameof(line.Quantity), "Transfer quantity must be greater than zero."),
            Required(line.InventoryState, nameof(line.InventoryState), "Inventory state is required."),
            line.FromWarehouseId == line.ToWarehouseId && line.FromBinId == line.ToBinId
                ? new ApiError("validation.same_target", nameof(line.ToWarehouseId), "Source and destination location must differ.")
                : null,
            !string.Equals(line.InventoryState, "Available", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.unsupported", nameof(line.InventoryState), "Only Available-state transfer moves are supported in this pass.")
                : null
        };

    private static void ValidateCycleCount(CycleCountUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Positive(request.WarehouseId, nameof(request.WarehouseId), "Warehouse is required."),
            Required(request.CountNo, nameof(request.CountNo), "Count number is required."),
            Required(request.CountType, nameof(request.CountType), "Count type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            request.Lines.Count == 0 ? new ApiError("validation.required", nameof(request.Lines), "At least one count line is required.") : null
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Cycle-count line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(line.CountedQuantity < 0 ? new ApiError("validation.out_of_range", nameof(line.CountedQuantity), "Counted quantity cannot be negative.") : null);
            errors.Add(Required(line.Status, nameof(line.Status), "Line status is required."));
        }

        ThrowIfInvalid(errors);
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

    private async Task<long?> ResolveLotIdAsync(long companyId, long itemId, long? lotId, string? lotNo, CancellationToken cancellationToken)
    {
        if (lotId.HasValue && lotId.Value > 0)
        {
            var lot = await DbContext.Lots.AsNoTracking()
                .FirstOrDefaultAsync(record => record.Id == lotId.Value && record.CompanyId == companyId, cancellationToken);

            lot = EnsureFound(lot, "Lot was not found in the active scope.", "inventory.lot_not_found");
            ThrowIfInvalid(
                lot.ItemId != itemId
                    ? new ApiError("validation.mismatch", nameof(lotId), "Lot does not belong to the resolved item.")
                    : null,
                !string.IsNullOrWhiteSpace(lotNo) && !string.Equals(lot.LotNo, lotNo.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(lotNo), "Lot id and lot number do not match.")
                    : null);
            return lot.Id;
        }

        if (string.IsNullOrWhiteSpace(lotNo))
        {
            return null;
        }

        var resolved = await DbContext.Lots.AsNoTracking()
            .Where(record =>
                record.CompanyId == companyId &&
                record.ItemId == itemId &&
                record.LotNo == lotNo.Trim())
            .OrderBy(record => record.Id)
            .FirstOrDefaultAsync(cancellationToken);

        resolved = EnsureFound(resolved, "Lot number was not found in the active scope.", "inventory.lot_not_found");
        return resolved.Id;
    }

    private async Task<long?> ResolveSerialIdAsync(long companyId, long itemId, long? lotId, long? serialId, string? serialNo, CancellationToken cancellationToken)
    {
        if (serialId.HasValue && serialId.Value > 0)
        {
            var serial = await DbContext.Serials.AsNoTracking()
                .FirstOrDefaultAsync(record => record.Id == serialId.Value && record.CompanyId == companyId, cancellationToken);

            serial = EnsureFound(serial, "Serial was not found in the active scope.", "inventory.serial_not_found");
            ThrowIfInvalid(
                serial.ItemId != itemId
                    ? new ApiError("validation.mismatch", nameof(serialId), "Serial does not belong to the resolved item.")
                    : null,
                lotId.HasValue && serial.LotId.HasValue && serial.LotId != lotId
                    ? new ApiError("validation.mismatch", nameof(lotId), "Serial does not belong to the resolved lot.")
                    : null,
                !string.IsNullOrWhiteSpace(serialNo) && !string.Equals(serial.SerialNo, serialNo.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(serialNo), "Serial id and serial number do not match.")
                    : null);
            return serial.Id;
        }

        if (string.IsNullOrWhiteSpace(serialNo))
        {
            return null;
        }

        var resolved = await DbContext.Serials.AsNoTracking()
            .Where(record =>
                record.CompanyId == companyId &&
                record.ItemId == itemId &&
                record.SerialNo == serialNo.Trim())
            .OrderBy(record => record.Id)
            .FirstOrDefaultAsync(cancellationToken);

        resolved = EnsureFound(resolved, "Serial number was not found in the active scope.", "inventory.serial_not_found");
        ThrowIfInvalid(
            lotId.HasValue && resolved.LotId.HasValue && resolved.LotId != lotId
                ? new ApiError("validation.mismatch", nameof(lotId), "Serial does not belong to the resolved lot.")
                : null);
        return resolved.Id;
    }

    private async Task<long?> ResolveTraceabilityItemIdAsync(TraceabilityFilter filter, CancellationToken cancellationToken)
    {
        if (filter.ItemId.HasValue && filter.ItemId.Value > 0)
        {
            return filter.ItemId.Value;
        }

        if (string.IsNullOrWhiteSpace(filter.ItemCode))
        {
            return null;
        }

        var scope = GetScope();
        var query = DbContext.Items.AsNoTracking()
            .ApplyCompanyScope(scope)
            .Where(record => record.ItemCode == filter.ItemCode.Trim());

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(record => record.CompanyId == filter.CompanyId.Value);
        }

        var items = await query.OrderBy(record => record.Id).ToListAsync(cancellationToken);
        ThrowIfInvalid(
            items.Count > 1
                ? new ApiError("validation.ambiguous", nameof(filter.ItemCode), "Item code is ambiguous in the active scope. Supply companyId or itemId.")
                : null);

        return EnsureFound(items.FirstOrDefault(), "Item code was not found in the active scope.", "master.item_not_found").Id;
    }

    private static StockBalanceDto MapStockBalance(StockBalance entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.ItemId,
            entity.ItemVariantId,
            entity.WarehouseId ?? 0,
            entity.BinId,
            entity.LotId,
            entity.SerialId,
            entity.PcidId,
            entity.OnHandQty,
            entity.ReservedQty,
            entity.QcHoldQty,
            entity.BlockedQty,
            entity.InTransitQty,
            entity.CatchWeightQty);

    private static StockReservationDto MapStockReservation(StockReservation entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.ItemId,
            entity.ItemVariantId,
            entity.WarehouseId,
            entity.BinId,
            entity.LotId,
            entity.ReservedQuantity,
            entity.SourceDocumentType,
            entity.SourceDocumentId,
            entity.Status);

    private static StockTransactionDto MapStockTransaction(StockTransaction entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.TransactionNo,
            entity.TransactionType,
            entity.PostingDate,
            entity.ItemId,
            entity.ItemVariantId,
            entity.FromWarehouseId,
            entity.FromBinId,
            entity.ToWarehouseId,
            entity.ToBinId,
            entity.LotId,
            entity.SerialId,
            entity.PcidId,
            entity.Quantity,
            entity.CatchWeightQty,
            entity.InventoryState,
            entity.SourceDocumentType,
            entity.SourceDocumentId,
            entity.Remarks,
            entity.SourceDocumentNo,
            entity.SourceDocumentLineId,
            entity.SourceDocumentRevisionNo,
            entity.SourceDocumentVersionNo,
            entity.ItemRevisionId,
            entity.EngineeringDocumentRevisionId,
            entity.BomRevisionId,
            entity.RoutingId,
            entity.RoutingRevisionId,
            entity.WorkOrderId,
            entity.ProductionOrderId,
            entity.SalesOrderId,
            entity.SalesOrderLineId,
            entity.PurchaseOrderId,
            entity.PurchaseOrderLineId,
            entity.QualityDocumentId,
            entity.LegacyTrackingIncomplete);

    private static CycleCountLineDto MapCycleCountLine(CycleCountLine entity) =>
        new(
            entity.Id,
            entity.LineNo,
            entity.ItemId,
            entity.ItemVariantId,
            entity.BinId,
            entity.LotId,
            entity.SerialId,
            entity.SystemQuantity,
            entity.CountedQuantity,
            entity.VarianceQuantity,
            entity.Status,
            entity.Remarks);

    private static CycleCountDto MapCycleCount(CycleCount entity, IReadOnlyCollection<CycleCountLineDto> lines) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.WarehouseId ?? 0,
            entity.CountNo,
            entity.CountDate,
            entity.CountType,
            entity.Status,
            entity.Remarks,
            entity.PostedOn,
            lines);
}
