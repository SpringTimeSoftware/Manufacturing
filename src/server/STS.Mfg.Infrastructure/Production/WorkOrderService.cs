using System.Globalization;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Production;
using STS.Mfg.Domain.Engineering;
using STS.Mfg.Domain.Production;
using STS.Mfg.Domain.Resources;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Production;

internal sealed class WorkOrderService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IWorkOrderService
{
    public async Task<PagedResult<WorkOrderSummaryDto>> ListWorkOrdersAsync(WorkOrderFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.WorkOrders.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.ItemId.HasValue)
        {
            query = query.Where(entity => entity.ItemId == filter.ItemId.Value);
        }

        if (filter.SalesOrderLineId.HasValue)
        {
            query = query.Where(entity => entity.SalesOrderLineId == filter.SalesOrderLineId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (filter.DateFrom.HasValue)
        {
            var dateFrom = DateOnly.FromDateTime(filter.DateFrom.Value.Date);
            query = query.Where(entity => entity.PlannedStartDate == null || entity.PlannedStartDate >= dateFrom);
        }

        if (filter.DateTo.HasValue)
        {
            var dateTo = DateOnly.FromDateTime(filter.DateTo.Value.Date);
            query = query.Where(entity => entity.PlannedEndDate == null || entity.PlannedEndDate <= dateTo);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.WorkOrderNo.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.PlannedStartDate)
            .ThenBy(entity => entity.WorkOrderNo)
            .ToPagedResultAsync(filter, cancellationToken);

        var counts = await LoadOperationCountsAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapWorkOrderSummary(entity, counts.GetValueOrDefault(entity.Id, (0, 0))));
    }

    public async Task<WorkOrderDto> GetWorkOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.WorkOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Work order was not found in the active scope.", "work_order.not_found");
        var operations = await LoadOperationsAsync(new[] { id }, cancellationToken);
        return MapWorkOrder(entity, operations.GetValueOrDefault(id, Array.Empty<WorkOrderOperationDto>()));
    }

    public async Task<WorkOrderDto> CreateWorkOrderAsync(WorkOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWorkOrder(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        await EnsurePlanningReferencesAsync(request, cancellationToken);

        var entity = WorkOrder.Create(
            request.CompanyId,
            request.BranchId,
            request.WorkOrderNo,
            request.SalesOrderLineId,
            request.ItemId,
            request.BomRevisionId,
            request.RoutingId,
            request.PlannedQuantity,
            request.ProductionUomId,
            request.PlannedStartDate,
            request.PlannedEndDate,
            request.Status,
            request.Remarks,
            GetUserId());

        DbContext.WorkOrders.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = await GetWorkOrderAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("production", nameof(WorkOrder), "work-order.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<WorkOrderDto> UpdateWorkOrderAsync(long id, WorkOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWorkOrder(request);

        var scope = GetScope();
        var entity = await DbContext.WorkOrders
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Work order was not found in the active scope.", "work_order.not_found");
        ThrowIfInvalid(
            string.Equals(entity.Status, "Released", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(entity.Status, "InProgress", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(entity.Status, "PartiallyCompleted", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(entity.Status, "Completed", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(entity.Status, "Closed", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(entity.Status, "Cancelled", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Released or closed work orders cannot be edited directly in this pass.")
                : null,
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Work-order company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Work-order branch cannot be changed."));

        await EnsurePlanningReferencesAsync(request, cancellationToken);

        var before = await GetWorkOrderAsync(id, cancellationToken);
        entity.UpdatePlanningLinks(request.SalesOrderLineId, request.ItemId, request.BomRevisionId, request.RoutingId, request.ProductionUomId, GetUserId());
        entity.Update(request.WorkOrderNo, request.PlannedQuantity, request.PlannedStartDate, request.PlannedEndDate, request.Status, request.Remarks, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetWorkOrderAsync(id, cancellationToken);
        await WriteAuditAsync("production", nameof(WorkOrder), "work-order.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<ActionResponse> ReleaseWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default)
    {
        var entity = await LoadWorkOrderForWriteAsync(id, cancellationToken);
        if (string.Equals(entity.Status, "Released", StringComparison.OrdinalIgnoreCase))
        {
            return BuildActionResponse(entity, "Work order already released.");
        }

        ThrowIfInvalid(
            string.Equals(entity.Status, "Closed", StringComparison.OrdinalIgnoreCase) || string.Equals(entity.Status, "Cancelled", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Closed or cancelled work orders cannot be released.")
                : null);

        var readiness = await BuildReadinessAsync(entity, cancellationToken);
        ThrowIfInvalid(readiness.BlockingReasons.Select(MapBlockerToError));

        var before = await GetWorkOrderAsync(entity.Id, cancellationToken);
        await RefreshOperationsAsync(entity, cancellationToken);
        entity.MarkReleased(request?.Remarks, DateTimeOffset.UtcNow, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetWorkOrderAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("production", nameof(WorkOrder), "work-order.release", entity.Id, before, after, cancellationToken);
        return BuildActionResponse(entity);
    }

    public async Task<ActionResponse> ReReleaseWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default)
    {
        var entity = await LoadWorkOrderForWriteAsync(id, cancellationToken);
        ThrowIfInvalid(
            !string.Equals(entity.Status, "Released", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(entity.Status, "PendingRelease", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(entity.Status, "OnHold", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Only released, pending-release, or on-hold work orders can be re-released.")
                : null);

        var readiness = await BuildReadinessAsync(entity, cancellationToken);
        ThrowIfInvalid(readiness.BlockingReasons.Select(MapBlockerToError));

        var before = await GetWorkOrderAsync(entity.Id, cancellationToken);
        await RefreshOperationsAsync(entity, cancellationToken);
        entity.MarkReleased(request?.Remarks, DateTimeOffset.UtcNow, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetWorkOrderAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("production", nameof(WorkOrder), "work-order.re-release", entity.Id, before, after, cancellationToken);
        return BuildActionResponse(entity);
    }

    public async Task<ActionResponse> CancelWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default)
    {
        var entity = await LoadWorkOrderForWriteAsync(id, cancellationToken);
        ThrowIfInvalid(
            string.Equals(entity.Status, "Closed", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Closed work orders cannot be cancelled.")
                : null,
            string.Equals(entity.Status, "Cancelled", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Work order is already cancelled.")
                : null);

        var operations = await DbContext.WorkOrderOperations.Where(record => record.WorkOrderId == entity.Id).ToListAsync(cancellationToken);
        ThrowIfInvalid(
            operations.Any(record =>
                string.Equals(record.Status, "InProgress", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(record.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Work orders with in-progress or completed operations cannot be cancelled in this pass.")
                : null);

        var before = await GetWorkOrderAsync(entity.Id, cancellationToken);
        foreach (var operation in operations)
        {
            operation.SetStatus("Cancelled", GetUserId());
        }

        entity.MarkCancelled(request?.Remarks, DateTimeOffset.UtcNow, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetWorkOrderAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("production", nameof(WorkOrder), "work-order.cancel", entity.Id, before, after, cancellationToken);
        return BuildActionResponse(entity);
    }

    public async Task<ActionResponse> CloseWorkOrderAsync(long id, WorkOrderActionRequest? request, CancellationToken cancellationToken = default)
    {
        var entity = await LoadWorkOrderForWriteAsync(id, cancellationToken);
        ThrowIfInvalid(
            string.Equals(entity.Status, "Closed", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Work order is already closed.")
                : null,
            string.Equals(entity.Status, "Cancelled", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Cancelled work orders cannot be closed.")
                : null);

        var operations = await DbContext.WorkOrderOperations.Where(record => record.WorkOrderId == entity.Id).ToListAsync(cancellationToken);
        ThrowIfInvalid(
            operations.Any(record =>
                !string.Equals(record.Status, "Completed", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(record.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "All operations must be completed or cancelled before closing the work order.")
                : null);

        var before = await GetWorkOrderAsync(entity.Id, cancellationToken);
        entity.MarkClosed(request?.Remarks, DateTimeOffset.UtcNow, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetWorkOrderAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("production", nameof(WorkOrder), "work-order.close", entity.Id, before, after, cancellationToken);
        return BuildActionResponse(entity);
    }

    public async Task<WorkOrderReadinessDto> GetReadinessAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.WorkOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Work order was not found in the active scope.", "work_order.not_found");
        return await BuildReadinessAsync(entity, cancellationToken);
    }

    private async Task<WorkOrder> LoadWorkOrderForWriteAsync(long id, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.WorkOrders
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        return EnsureFound(entity, "Work order was not found in the active scope.", "work_order.not_found");
    }

    private async Task EnsurePlanningReferencesAsync(WorkOrderUpsertRequest request, CancellationToken cancellationToken)
    {
        var item = await DbContext.Items.AsNoTracking().FirstOrDefaultAsync(record => record.Id == request.ItemId && record.CompanyId == request.CompanyId, cancellationToken);
        var bomRevision = await DbContext.BomRevisions.AsNoTracking().FirstOrDefaultAsync(record => record.Id == request.BomRevisionId, cancellationToken);

        ThrowIfInvalid(
            item is null ? new ApiError("work_order.item_not_found", nameof(request.ItemId), "Item was not found.") : null,
            item is not null && !string.Equals(item.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("work_order.item_inactive", nameof(request.ItemId), "Work-order item must be active.")
                : null,
            bomRevision is null ? new ApiError("work_order.bom_revision_not_found", nameof(request.BomRevisionId), "BOM revision was not found.") : null,
            bomRevision is not null && bomRevision.ApprovalStatus is not ("Released" or "Approved")
                ? new ApiError("work_order.bom_revision_invalid", nameof(request.BomRevisionId), "BOM revision must be approved or released.")
                : null);

        if (request.SalesOrderLineId.HasValue)
        {
            var salesOrderLink = await (from line in DbContext.SalesOrderLines.AsNoTracking()
                                        join order in DbContext.SalesOrders.AsNoTracking() on line.SalesOrderId equals order.Id
                                        where line.Id == request.SalesOrderLineId.Value
                                        select new { OrderStatus = order.Status }).FirstOrDefaultAsync(cancellationToken);

            ThrowIfInvalid(
                salesOrderLink is null ? new ApiError("work_order.sales_order_line_not_found", nameof(request.SalesOrderLineId), "Sales-order line was not found.") : null,
                salesOrderLink is not null && (string.Equals(salesOrderLink.OrderStatus, "Cancelled", StringComparison.OrdinalIgnoreCase) ||
                                               string.Equals(salesOrderLink.OrderStatus, "Closed", StringComparison.OrdinalIgnoreCase))
                    ? new ApiError("work_order.sales_order_invalid", nameof(request.SalesOrderLineId), "Linked sales order must be open for work-order planning.")
                    : null);
        }

        if (request.RoutingId.HasValue)
        {
            var routing = await DbContext.Routings.AsNoTracking().FirstOrDefaultAsync(record => record.Id == request.RoutingId.Value && record.CompanyId == request.CompanyId, cancellationToken);
            ThrowIfInvalid(
                routing is null ? new ApiError("work_order.routing_not_found", nameof(request.RoutingId), "Routing was not found.") : null,
                routing is not null && !string.Equals(routing.Status, "Released", StringComparison.OrdinalIgnoreCase) && !string.Equals(routing.Status, "Approved", StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("work_order.routing_invalid", nameof(request.RoutingId), "Routing must be approved or released.")
                    : null);
        }
    }

    private async Task RefreshOperationsAsync(WorkOrder workOrder, CancellationToken cancellationToken)
    {
        var blueprints = await BuildOperationBlueprintsAsync(workOrder, cancellationToken);
        var existingOperations = await DbContext.WorkOrderOperations
            .Where(record => record.WorkOrderId == workOrder.Id)
            .OrderBy(record => record.SequenceNo)
            .ToListAsync(cancellationToken);

        var existingBySequence = existingOperations.ToDictionary(record => record.SequenceNo);
        var activeSequences = blueprints.Select(record => record.SequenceNo).ToHashSet();
        var userId = GetUserId();

        foreach (var blueprint in blueprints)
        {
            if (existingBySequence.TryGetValue(blueprint.SequenceNo, out var existing))
            {
                if (CanReplaceOperation(existing))
                {
                    existing.UpdateDefinition(blueprint.WorkCenterId, blueprint.PlannedQuantity, blueprint.RequiresQcCheckpoint, blueprint.Status, userId);
                }

                continue;
            }

            DbContext.WorkOrderOperations.Add(WorkOrderOperation.Create(
                workOrder.Id,
                blueprint.SequenceNo,
                blueprint.OperationId,
                blueprint.RoutingOperationId,
                blueprint.WorkCenterId,
                blueprint.PlannedQuantity,
                0m,
                blueprint.RequiresQcCheckpoint,
                blueprint.Status,
                userId));
        }

        foreach (var existing in existingOperations.Where(record => CanReplaceOperation(record) && !activeSequences.Contains(record.SequenceNo)))
        {
            DbContext.WorkOrderOperations.Remove(existing);
        }
    }

    private async Task<WorkOrderReadinessDto> BuildReadinessAsync(WorkOrder workOrder, CancellationToken cancellationToken)
    {
        var blockers = new List<WorkOrderReadinessBlockerDto>();
        var workflowReady = EvaluateWorkflowReady(workOrder.Status, blockers);

        var bomRevision = await DbContext.BomRevisions.AsNoTracking().FirstOrDefaultAsync(record => record.Id == workOrder.BomRevisionId, cancellationToken);
        var engineeringReady = bomRevision is not null && string.Equals(bomRevision.ApprovalStatus, "Released", StringComparison.OrdinalIgnoreCase);
        if (!engineeringReady)
        {
            blockers.Add(new WorkOrderReadinessBlockerDto("MissingReleasedBomRevision", "A released BOM revision is required before the work order can be released."));
        }

        var materialReadiness = new List<WorkOrderMaterialReadinessDto>();
        if (engineeringReady && bomRevision is not null)
        {
            materialReadiness.AddRange(await BuildMaterialReadinessAsync(workOrder, bomRevision, cancellationToken));
            if (materialReadiness.Any(record => record.ShortageQuantity > 0))
            {
                blockers.Add(new WorkOrderReadinessBlockerDto("MaterialShortage", "Material shortage exists for one or more required components."));
            }

            if (materialReadiness.Any(record => record.ShortageQuantity > 0 && record.BlockedQuantity > 0))
            {
                blockers.Add(new WorkOrderReadinessBlockerDto("BlockedStock", "Blocked stock is contributing to the current material shortage."));
            }

            if (materialReadiness.Any(record => record.ShortageQuantity > 0 && record.QcHoldQuantity > 0))
            {
                blockers.Add(new WorkOrderReadinessBlockerDto("QcHoldStock", "QC-hold stock is contributing to the current material shortage."));
            }
        }

        var documentReady = await ValidateLinkedDocumentStateAsync(workOrder, cancellationToken);
        if (!documentReady)
        {
            blockers.Add(new WorkOrderReadinessBlockerDto("InvalidDocumentState", "The linked demand or document context is not valid for release."));
        }

        var operationBlueprints = await BuildOperationBlueprintsAsync(workOrder, cancellationToken);
        if (operationBlueprints.Count == 0)
        {
            blockers.Add(new WorkOrderReadinessBlockerDto("MissingRouting", "Routing or BOM operation definitions are required before release."));
        }

        var operationReadiness = operationBlueprints
            .Select(record => new WorkOrderOperationReadinessDto(
                record.SequenceNo,
                record.OperationId,
                record.RoutingOperationId,
                record.WorkCenterId,
                record.Status,
                record.CapacityReady,
                record.CapacityMessage))
            .ToArray();

        if (operationReadiness.Any(record => !record.CapacityReady))
        {
            blockers.Add(new WorkOrderReadinessBlockerDto("NoCapacitySlot", "At least one operation lacks a viable work-center or machine path."));
        }

        var materialReady = materialReadiness.All(record => record.ShortageQuantity <= 0);
        var capacityReady = operationReadiness.All(record => record.CapacityReady);
        var canRelease = blockers.Count == 0;

        return new WorkOrderReadinessDto(
            workOrder.Id,
            workOrder.WorkOrderNo,
            workOrder.Status,
            canRelease,
            engineeringReady && operationBlueprints.Count > 0,
            materialReady,
            capacityReady,
            workflowReady,
            blockers,
            materialReadiness,
            operationReadiness);
    }

    private static bool EvaluateWorkflowReady(string status, ICollection<WorkOrderReadinessBlockerDto> blockers)
    {
        if (string.Equals(status, "Draft", StringComparison.OrdinalIgnoreCase))
        {
            blockers.Add(new WorkOrderReadinessBlockerDto("WorkflowPending", "Move the work order to PendingRelease before release."));
            return false;
        }

        if (string.Equals(status, "OnHold", StringComparison.OrdinalIgnoreCase))
        {
            blockers.Add(new WorkOrderReadinessBlockerDto("WorkflowPending", "Work order is on hold and cannot be released."));
            return false;
        }

        return !string.Equals(status, "Cancelled", StringComparison.OrdinalIgnoreCase) &&
               !string.Equals(status, "Closed", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<bool> ValidateLinkedDocumentStateAsync(WorkOrder workOrder, CancellationToken cancellationToken)
    {
        if (!workOrder.SalesOrderLineId.HasValue)
        {
            return true;
        }

        var record = await (from line in DbContext.SalesOrderLines.AsNoTracking()
                            join order in DbContext.SalesOrders.AsNoTracking() on line.SalesOrderId equals order.Id
                            where line.Id == workOrder.SalesOrderLineId.Value
                            select new { order.Status }).FirstOrDefaultAsync(cancellationToken);

        return record is not null &&
               !string.Equals(record.Status, "Cancelled", StringComparison.OrdinalIgnoreCase) &&
               !string.Equals(record.Status, "Closed", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<IReadOnlyCollection<WorkOrderMaterialReadinessDto>> BuildMaterialReadinessAsync(
        WorkOrder workOrder,
        BomRevision bomRevision,
        CancellationToken cancellationToken)
    {
        var effectiveDate = workOrder.PlannedStartDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var bomLines = await DbContext.BomLines.AsNoTracking()
            .Where(record => record.BomRevisionId == bomRevision.Id)
            .Where(record =>
                (!record.EffectiveFrom.HasValue || record.EffectiveFrom.Value <= effectiveDate) &&
                (!record.EffectiveTo.HasValue || record.EffectiveTo.Value >= effectiveDate))
            .OrderBy(record => record.SequenceNo)
            .ToListAsync(cancellationToken);

        if (bomLines.Count == 0)
        {
            return Array.Empty<WorkOrderMaterialReadinessDto>();
        }

        var componentIds = bomLines.Select(record => record.ComponentItemId).Distinct().ToArray();
        var balances = await DbContext.StockBalances.AsNoTracking()
            .Where(record =>
                record.CompanyId == workOrder.CompanyId &&
                record.BranchId == workOrder.BranchId &&
                componentIds.Contains(record.ItemId))
            .ToListAsync(cancellationToken);

        var reservations = await DbContext.StockReservations.AsNoTracking()
            .Where(record =>
                record.CompanyId == workOrder.CompanyId &&
                record.BranchId == workOrder.BranchId &&
                record.SourceDocumentType == "WorkOrder" &&
                record.SourceDocumentId == workOrder.Id &&
                componentIds.Contains(record.ItemId) &&
                (record.Status == "Active" || record.Status == "Released"))
            .ToListAsync(cancellationToken);

        return bomLines.Select(line =>
            {
                var requiredQuantity = workOrder.PlannedQuantity * line.QuantityPer * (1m + (line.ScrapPercent / 100m));
                var componentBalances = balances.Where(record => record.ItemId == line.ComponentItemId).ToArray();
                var reservedQuantity = reservations.Where(record => record.ItemId == line.ComponentItemId).Sum(record => record.ReservedQuantity);
                var availableQuantity = componentBalances.Sum(record => record.OnHandQty - record.ReservedQty - record.QcHoldQty - record.BlockedQty);
                var effectiveAvailable = availableQuantity + reservedQuantity;
                var shortageQuantity = Math.Max(0m, requiredQuantity - effectiveAvailable);

                return new WorkOrderMaterialReadinessDto(
                    line.ComponentItemId,
                    requiredQuantity,
                    reservedQuantity,
                    availableQuantity,
                    shortageQuantity,
                    componentBalances.Sum(record => record.BlockedQty),
                    componentBalances.Sum(record => record.QcHoldQty));
            })
            .ToArray();
    }

    private async Task<IReadOnlyCollection<OperationBlueprint>> BuildOperationBlueprintsAsync(WorkOrder workOrder, CancellationToken cancellationToken)
    {
        var effectiveRoutingId = workOrder.RoutingId;
        BomRevision? bomRevision = null;

        if (!effectiveRoutingId.HasValue)
        {
            bomRevision = await DbContext.BomRevisions.AsNoTracking().FirstOrDefaultAsync(record => record.Id == workOrder.BomRevisionId, cancellationToken);
            effectiveRoutingId = bomRevision?.RoutingId;
        }

        var routingOperations = Array.Empty<RoutingOperation>();
        if (effectiveRoutingId.HasValue)
        {
            routingOperations = await DbContext.RoutingOperations.AsNoTracking()
                .Where(record => record.RoutingId == effectiveRoutingId.Value && record.Status != "Obsolete")
                .OrderBy(record => record.SequenceNo)
                .ToArrayAsync(cancellationToken);
        }

        if (routingOperations.Length > 0)
        {
            return await BuildBlueprintsFromRoutingAsync(workOrder, routingOperations, cancellationToken);
        }

        bomRevision ??= await DbContext.BomRevisions.AsNoTracking().FirstOrDefaultAsync(record => record.Id == workOrder.BomRevisionId, cancellationToken);
        if (bomRevision is null)
        {
            return Array.Empty<OperationBlueprint>();
        }

        var bomOperations = await DbContext.BomOperations.AsNoTracking()
            .Where(record => record.BomRevisionId == bomRevision.Id)
            .OrderBy(record => record.SequenceNo)
            .ToListAsync(cancellationToken);

        if (bomOperations.Count == 0)
        {
            return Array.Empty<OperationBlueprint>();
        }

        var linkedRoutingOperationIds = bomOperations.Where(record => record.RoutingOperationId.HasValue).Select(record => record.RoutingOperationId!.Value).Distinct().ToArray();
        var linkedRoutingOperations = linkedRoutingOperationIds.Length == 0
            ? new Dictionary<long, RoutingOperation>()
            : await DbContext.RoutingOperations.AsNoTracking()
                .Where(record => linkedRoutingOperationIds.Contains(record.Id))
                .ToDictionaryAsync(record => record.Id, cancellationToken);

        var operationIds = bomOperations.Where(record => record.OperationId.HasValue).Select(record => record.OperationId!.Value).Distinct().ToArray();
        var operations = operationIds.Length == 0
            ? new Dictionary<long, Operation>()
            : await DbContext.Operations.AsNoTracking()
                .Where(record => operationIds.Contains(record.Id))
                .ToDictionaryAsync(record => record.Id, cancellationToken);

        var result = new List<OperationBlueprint>();
        foreach (var bomOperation in bomOperations)
        {
            var linkedRoutingOperation = bomOperation.RoutingOperationId.HasValue
                ? linkedRoutingOperations.GetValueOrDefault(bomOperation.RoutingOperationId.Value)
                : null;

            var operationId = bomOperation.OperationId ?? linkedRoutingOperation?.OperationId;
            if (!operationId.HasValue)
            {
                continue;
            }

            var operation = operations.GetValueOrDefault(operationId.Value);
            var workCenterId = linkedRoutingOperation?.WorkCenterId ?? operation?.DefaultWorkCenterId;
            var capacity = await EvaluateCapacityPathAsync(workOrder.CompanyId ?? 0, workOrder.BranchId ?? 0, workCenterId, linkedRoutingOperation?.IsOutsideProcessing ?? false, cancellationToken);

            result.Add(new OperationBlueprint(
                bomOperation.SequenceNo,
                operationId.Value,
                bomOperation.RoutingOperationId,
                workCenterId,
                workOrder.PlannedQuantity,
                bomOperation.RequiresQcCheckpoint || linkedRoutingOperation?.RequiresQcCheckpoint == true,
                bomOperation.SequenceNo == result.Count + 1 ? "Ready" : "Pending",
                capacity.CapacityReady,
                capacity.CapacityMessage));
        }

        return result;
    }

    private async Task<IReadOnlyCollection<OperationBlueprint>> BuildBlueprintsFromRoutingAsync(
        WorkOrder workOrder,
        IReadOnlyCollection<RoutingOperation> routingOperations,
        CancellationToken cancellationToken)
    {
        var result = new List<OperationBlueprint>();
        foreach (var routingOperation in routingOperations)
        {
            var capacity = await EvaluateCapacityPathAsync(
                workOrder.CompanyId ?? 0,
                workOrder.BranchId ?? 0,
                routingOperation.WorkCenterId,
                routingOperation.IsOutsideProcessing,
                cancellationToken);

            result.Add(new OperationBlueprint(
                routingOperation.SequenceNo,
                routingOperation.OperationId,
                routingOperation.Id,
                routingOperation.WorkCenterId,
                workOrder.PlannedQuantity,
                routingOperation.RequiresQcCheckpoint,
                routingOperation.SequenceNo == 1 ? "Ready" : "Pending",
                capacity.CapacityReady,
                capacity.CapacityMessage));
        }

        return result;
    }

    private async Task<(bool CapacityReady, string? CapacityMessage)> EvaluateCapacityPathAsync(
        long companyId,
        long branchId,
        long? workCenterId,
        bool isOutsideProcessing,
        CancellationToken cancellationToken)
    {
        if (isOutsideProcessing)
        {
            return (true, null);
        }

        if (!workCenterId.HasValue)
        {
            return (false, "Work center is missing.");
        }

        var workCenter = await DbContext.WorkCenters.AsNoTracking().FirstOrDefaultAsync(record =>
            record.Id == workCenterId.Value &&
            record.CompanyId == companyId &&
            record.BranchId == branchId,
            cancellationToken);

        if (workCenter is null || !string.Equals(workCenter.Status, "Active", StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Work center is not active.");
        }

        var hasMachinePath = await DbContext.Machines.AsNoTracking().AnyAsync(record =>
            record.WorkCenterId == workCenterId.Value &&
            record.CompanyId == companyId &&
            record.BranchId == branchId &&
            string.Equals(record.Status, "Active", StringComparison.OrdinalIgnoreCase) &&
            record.IsSchedulingEnabled &&
            !record.IsUnderMaintenance,
            cancellationToken);

        return hasMachinePath
            ? (true, null)
            : (false, "No active scheduling-enabled machine was found for the work center.");
    }

    private async Task<Dictionary<long, (int OperationCount, int CompletedOperationCount)>> LoadOperationCountsAsync(
        IReadOnlyCollection<long> workOrderIds,
        CancellationToken cancellationToken)
    {
        var operations = await DbContext.WorkOrderOperations.AsNoTracking()
            .Where(record => workOrderIds.Contains(record.WorkOrderId))
            .ToListAsync(cancellationToken);

        return operations.GroupBy(record => record.WorkOrderId)
            .ToDictionary(
                group => group.Key,
                group => (
                    group.Count(),
                    group.Count(record => string.Equals(record.Status, "Completed", StringComparison.OrdinalIgnoreCase))));
    }

    private async Task<Dictionary<long, IReadOnlyCollection<WorkOrderOperationDto>>> LoadOperationsAsync(
        IReadOnlyCollection<long> workOrderIds,
        CancellationToken cancellationToken)
    {
        var operations = await DbContext.WorkOrderOperations.AsNoTracking()
            .Where(record => workOrderIds.Contains(record.WorkOrderId))
            .OrderBy(record => record.SequenceNo)
            .ToListAsync(cancellationToken);

        return operations.GroupBy(record => record.WorkOrderId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<WorkOrderOperationDto>)group.Select(MapOperation).ToArray());
    }

    private static bool CanReplaceOperation(WorkOrderOperation operation) =>
        string.Equals(operation.Status, "Pending", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(operation.Status, "Ready", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(operation.Status, "Cancelled", StringComparison.OrdinalIgnoreCase);

    private static ApiError? MapBlockerToError(WorkOrderReadinessBlockerDto blocker) =>
        blocker.Code switch
        {
            "MissingReleasedBomRevision" => new ApiError("work_order.missing_bom", null, blocker.Message),
            "MissingRouting" => new ApiError("work_order.missing_routing", null, blocker.Message),
            "MaterialShortage" => new ApiError("work_order.material_shortage", null, blocker.Message),
            "BlockedStock" => new ApiError("work_order.blocked_stock", null, blocker.Message),
            "QcHoldStock" => new ApiError("work_order.qc_hold_stock", null, blocker.Message),
            "NoCapacitySlot" => new ApiError("work_order.no_capacity", null, blocker.Message),
            "WorkflowPending" => new ApiError("work_order.workflow_pending", null, blocker.Message),
            "InvalidDocumentState" => new ApiError("work_order.invalid_document_state", null, blocker.Message),
            _ => new ApiError("work_order.release_blocked", null, blocker.Message)
        };

    private static void ValidateWorkOrder(WorkOrderUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Positive(request.ItemId, nameof(request.ItemId), "Item is required."),
            Positive(request.BomRevisionId, nameof(request.BomRevisionId), "BOM revision is required."),
            Positive(request.ProductionUomId, nameof(request.ProductionUomId), "Production UOM is required."),
            Positive(request.PlannedQuantity, nameof(request.PlannedQuantity), "Planned quantity must be greater than zero."),
            Required(request.WorkOrderNo, nameof(request.WorkOrderNo), "Work-order number is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static WorkOrderSummaryDto MapWorkOrderSummary(WorkOrder entity, (int OperationCount, int CompletedOperationCount) counts) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.WorkOrderNo,
            entity.SalesOrderLineId,
            entity.ItemId,
            entity.BomRevisionId,
            entity.RoutingId,
            entity.PlannedQuantity,
            entity.ProductionUomId,
            entity.PlannedStartDate,
            entity.PlannedEndDate,
            entity.Status,
            entity.ReleasedOn,
            counts.OperationCount,
            counts.CompletedOperationCount);

    private static WorkOrderDto MapWorkOrder(WorkOrder entity, IReadOnlyCollection<WorkOrderOperationDto> operations) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.WorkOrderNo,
            entity.SalesOrderLineId,
            entity.ItemId,
            entity.BomRevisionId,
            entity.RoutingId,
            entity.PlannedQuantity,
            entity.ProductionUomId,
            entity.PlannedStartDate,
            entity.PlannedEndDate,
            entity.Status,
            entity.Remarks,
            entity.ReleasedOn,
            entity.ClosedOn,
            entity.CancelledOn,
            operations);

    private static WorkOrderOperationDto MapOperation(WorkOrderOperation entity) =>
        new(
            entity.Id,
            entity.SequenceNo,
            entity.OperationId,
            entity.RoutingOperationId,
            entity.WorkCenterId,
            entity.PlannedQuantity,
            entity.CompletedQuantity,
            entity.RequiresQcCheckpoint,
            entity.Status);

    private static ActionResponse BuildActionResponse(WorkOrder entity, params string[] warnings) =>
        new(
            entity.Id.ToString(CultureInfo.InvariantCulture),
            entity.Status,
            entity.WorkOrderNo,
            warnings.Where(warning => !string.IsNullOrWhiteSpace(warning)).ToArray());

    private sealed record OperationBlueprint(
        int SequenceNo,
        long OperationId,
        long? RoutingOperationId,
        long? WorkCenterId,
        decimal PlannedQuantity,
        bool RequiresQcCheckpoint,
        string Status,
        bool CapacityReady,
        string? CapacityMessage);
}
