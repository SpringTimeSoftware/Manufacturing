using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Procurement;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Procurement;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Procurement;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Procurement;

internal sealed class ProcurementService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IProcurementService
{
    public async Task<PagedResult<PurchaseRequisitionDto>> ListPurchaseRequisitionsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.PurchaseRequisitions.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyPurchaseRequisitionFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.Id).ThenBy(entity => entity.PurchaseRequisitionNo).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadPurchaseRequisitionLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapPurchaseRequisition(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<PurchaseRequisitionLineDto>())));
    }

    public async Task<PurchaseRequisitionDto> GetPurchaseRequisitionAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.PurchaseRequisitions.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Purchase requisition was not found in the active scope.", "procurement.pr_not_found");
        var lines = await LoadPurchaseRequisitionLinesAsync(new[] { id }, cancellationToken);
        return MapPurchaseRequisition(entity, lines.GetValueOrDefault(id, Array.Empty<PurchaseRequisitionLineDto>()));
    }

    public async Task<PurchaseRequisitionDto> CreatePurchaseRequisitionAsync(PurchaseRequisitionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePurchaseRequisition(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = PurchaseRequisition.Create(
            request.CompanyId,
            request.BranchId,
            request.PurchaseRequisitionNo,
            request.SourceDocumentType,
            request.SourceDocumentId,
            request.Status,
            GetUserId());

        DbContext.PurchaseRequisitions.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            var lines = new List<PurchaseRequisitionLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(PurchaseRequisitionLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.RequiredQuantity,
                    line.OrderUomId,
                    line.NeedByDate,
                    line.SourceBoqRequirementLineId,
                    line.LinkedWorkOrderId,
                    line.Status,
                    GetUserId()));
            }

            DbContext.PurchaseRequisitionLines.AddRange(lines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetPurchaseRequisitionAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(PurchaseRequisition), "pr.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PurchaseRequisitionDto> UpdatePurchaseRequisitionAsync(long id, PurchaseRequisitionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePurchaseRequisition(request);

        var scope = GetScope();
        var entity = await DbContext.PurchaseRequisitions
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Purchase requisition was not found in the active scope.", "procurement.pr_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Purchase-requisition company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Purchase-requisition branch cannot be changed."));

        var before = await GetPurchaseRequisitionAsync(id, cancellationToken);
        entity.Update(request.PurchaseRequisitionNo, request.SourceDocumentType, request.SourceDocumentId, request.Status, GetUserId());

        var existingLines = await DbContext.PurchaseRequisitionLines.Where(record => record.PurchaseRequisitionId == id).ToListAsync(cancellationToken);
        DbContext.PurchaseRequisitionLines.RemoveRange(existingLines);
        if (request.Lines.Count > 0)
        {
            var lines = new List<PurchaseRequisitionLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(PurchaseRequisitionLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.RequiredQuantity,
                    line.OrderUomId,
                    line.NeedByDate,
                    line.SourceBoqRequirementLineId,
                    line.LinkedWorkOrderId,
                    line.Status,
                    GetUserId()));
            }

            DbContext.PurchaseRequisitionLines.AddRange(lines);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetPurchaseRequisitionAsync(id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(PurchaseRequisition), "pr.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public Task<PurchaseRequisitionDto> ApprovePurchaseRequisitionAsync(long id, CancellationToken cancellationToken = default) =>
        ApprovePurchaseRequisitionInternalAsync(id, "Approved", "pr.approve", cancellationToken);

    public async Task<PagedResult<PurchaseOrderDto>> ListPurchaseOrdersAsync(ProcurementFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.PurchaseOrders.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.SupplierId.HasValue)
        {
            query = query.Where(entity => entity.SupplierId == filter.SupplierId.Value);
        }

        query = ApplyPurchaseOrderFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.Id).ThenBy(entity => entity.PurchaseOrderNo).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadPurchaseOrderLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapPurchaseOrder(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<PurchaseOrderLineDto>())));
    }

    public async Task<PurchaseOrderDto> GetPurchaseOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.PurchaseOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Purchase order was not found in the active scope.", "procurement.po_not_found");
        var lines = await LoadPurchaseOrderLinesAsync(new[] { id }, cancellationToken);
        return MapPurchaseOrder(entity, lines.GetValueOrDefault(id, Array.Empty<PurchaseOrderLineDto>()));
    }

    public async Task<PurchaseOrderDto> CreatePurchaseOrderAsync(PurchaseOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePurchaseOrder(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var supplierId = await ResolveSupplierIdAsync(request.CompanyId, request.SupplierId, request.SupplierCode, cancellationToken);
        var orderAddressId = await ResolveSupplierAddressIdAsync(request.CompanyId, supplierId, request.OrderAddressId, request.OrderAddressCode, cancellationToken);

        var entity = PurchaseOrder.Create(
            request.CompanyId,
            request.BranchId,
            request.PurchaseOrderNo,
            supplierId,
            orderAddressId,
            request.Status,
            request.ExpectedReceiptDate,
            GetUserId());

        DbContext.PurchaseOrders.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            var lines = new List<PurchaseOrderLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(PurchaseOrderLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.PurchaseRequisitionLineId,
                    line.OrderedQuantity,
                    line.OrderUomId,
                    line.ExpectedDate,
                    line.LinkedWorkOrderId,
                    line.SourceBoqRequirementLineId,
                    line.Status,
                    GetUserId()));
            }

            DbContext.PurchaseOrderLines.AddRange(lines);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetPurchaseOrderAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(PurchaseOrder), "po.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PurchaseOrderDto> UpdatePurchaseOrderAsync(long id, PurchaseOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePurchaseOrder(request);

        var scope = GetScope();
        var entity = await DbContext.PurchaseOrders
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Purchase order was not found in the active scope.", "procurement.po_not_found");
        var supplierId = await ResolveSupplierIdAsync(request.CompanyId, request.SupplierId, request.SupplierCode, cancellationToken);
        var orderAddressId = await ResolveSupplierAddressIdAsync(request.CompanyId, supplierId, request.OrderAddressId, request.OrderAddressCode, cancellationToken);
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Purchase-order company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Purchase-order branch cannot be changed."),
            Immutable(entity.SupplierId, supplierId, nameof(request.SupplierId), "Purchase-order supplier cannot be changed."),
            Immutable(entity.OrderAddressId, orderAddressId, nameof(request.OrderAddressId), "Purchase-order address cannot be changed."));

        var before = await GetPurchaseOrderAsync(id, cancellationToken);
        entity.Update(request.PurchaseOrderNo, request.Status, request.ExpectedReceiptDate, GetUserId());

        var existingLines = await DbContext.PurchaseOrderLines.Where(record => record.PurchaseOrderId == id).ToListAsync(cancellationToken);
        DbContext.PurchaseOrderLines.RemoveRange(existingLines);
        if (request.Lines.Count > 0)
        {
            var lines = new List<PurchaseOrderLine>();
            foreach (var line in request.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                lines.Add(PurchaseOrderLine.Create(
                    entity.Id,
                    line.LineNo,
                    itemId,
                    line.PurchaseRequisitionLineId,
                    line.OrderedQuantity,
                    line.OrderUomId,
                    line.ExpectedDate,
                    line.LinkedWorkOrderId,
                    line.SourceBoqRequirementLineId,
                    line.Status,
                    GetUserId()));
            }

            DbContext.PurchaseOrderLines.AddRange(lines);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetPurchaseOrderAsync(id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(PurchaseOrder), "po.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public Task<PurchaseOrderDto> ApprovePurchaseOrderAsync(long id, CancellationToken cancellationToken = default) =>
        ApprovePurchaseOrderInternalAsync(id, "Approved", "po.approve", cancellationToken);

    public async Task<PagedResult<SubcontractOrderDto>> ListSubcontractOrdersAsync(ProcurementFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.SubcontractOrders.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.SupplierId.HasValue)
        {
            query = query.Where(entity => entity.SupplierId == filter.SupplierId.Value);
        }

        query = ApplySubcontractOrderFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.Id).ThenBy(entity => entity.SubcontractOrderNo).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapSubcontractOrder);
    }

    public async Task<SubcontractOrderDto> GetSubcontractOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.SubcontractOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        return MapSubcontractOrder(EnsureFound(entity, "Subcontract order was not found in the active scope.", "procurement.subcontract_not_found"));
    }

    public async Task<SubcontractOrderDto> CreateSubcontractOrderAsync(SubcontractOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSubcontractOrder(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var supplierId = await ResolveSupplierIdAsync(request.CompanyId, request.SupplierId, request.SupplierCode, cancellationToken);

        var entity = SubcontractOrder.Create(
            request.CompanyId,
            request.BranchId,
            request.SubcontractOrderNo,
            supplierId,
            request.WorkOrderId,
            request.OperationId,
            request.Status,
            request.ExpectedReturnDate,
            GetUserId());

        DbContext.SubcontractOrders.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapSubcontractOrder(entity);
        await WriteAuditAsync("procurement", nameof(SubcontractOrder), "subcontract.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<SubcontractOrderDto> UpdateSubcontractOrderAsync(long id, SubcontractOrderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSubcontractOrder(request);

        var scope = GetScope();
        var entity = await DbContext.SubcontractOrders
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Subcontract order was not found in the active scope.", "procurement.subcontract_not_found");
        var supplierId = await ResolveSupplierIdAsync(request.CompanyId, request.SupplierId, request.SupplierCode, cancellationToken);
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Subcontract company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Subcontract branch cannot be changed."),
            Immutable(entity.SupplierId, supplierId, nameof(request.SupplierId), "Subcontract supplier cannot be changed."),
            Immutable(entity.WorkOrderId, request.WorkOrderId, nameof(request.WorkOrderId), "Subcontract work order cannot be changed."),
            Immutable(entity.OperationId, request.OperationId, nameof(request.OperationId), "Subcontract operation cannot be changed."));

        var before = MapSubcontractOrder(entity);
        entity.Update(request.SubcontractOrderNo, request.Status, request.ExpectedReturnDate, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapSubcontractOrder(entity);
        await WriteAuditAsync("procurement", nameof(SubcontractOrder), "subcontract.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public Task<SubcontractOrderDto> ApproveSubcontractOrderAsync(long id, CancellationToken cancellationToken = default) =>
        ApproveSubcontractOrderInternalAsync(id, "Approved", "subcontract.approve", cancellationToken);

    private async Task<PurchaseRequisitionDto> ApprovePurchaseRequisitionInternalAsync(long id, string status, string actionCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.PurchaseRequisitions
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Purchase requisition was not found in the active scope.", "procurement.pr_not_found");

        var before = await GetPurchaseRequisitionAsync(id, cancellationToken);
        entity.Update(entity.PurchaseRequisitionNo, entity.SourceDocumentType, entity.SourceDocumentId, status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetPurchaseRequisitionAsync(id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(PurchaseRequisition), actionCode, entity.Id, before, after, cancellationToken);
        return after;
    }

    private async Task<PurchaseOrderDto> ApprovePurchaseOrderInternalAsync(long id, string status, string actionCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.PurchaseOrders
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Purchase order was not found in the active scope.", "procurement.po_not_found");

        var before = await GetPurchaseOrderAsync(id, cancellationToken);
        entity.Update(entity.PurchaseOrderNo, status, entity.ExpectedReceiptDate, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetPurchaseOrderAsync(id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(PurchaseOrder), actionCode, entity.Id, before, after, cancellationToken);
        return after;
    }

    private async Task<SubcontractOrderDto> ApproveSubcontractOrderInternalAsync(long id, string status, string actionCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.SubcontractOrders
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Subcontract order was not found in the active scope.", "procurement.subcontract_not_found");

        var before = MapSubcontractOrder(entity);
        entity.Update(entity.SubcontractOrderNo, status, entity.ExpectedReturnDate, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapSubcontractOrder(entity);
        await WriteAuditAsync("procurement", nameof(SubcontractOrder), actionCode, entity.Id, before, after, cancellationToken);
        return after;
    }

    private async Task<Dictionary<long, IReadOnlyCollection<PurchaseRequisitionLineDto>>> LoadPurchaseRequisitionLinesAsync(
        IReadOnlyCollection<long> headerIds,
        CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.PurchaseRequisitionLines.AsNoTracking()
                .Where(record => headerIds.Contains(record.PurchaseRequisitionId))
                .OrderBy(record => record.LineNo),
            record => record.PurchaseRequisitionId,
            MapPurchaseRequisitionLine,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<PurchaseOrderLineDto>>> LoadPurchaseOrderLinesAsync(
        IReadOnlyCollection<long> headerIds,
        CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.PurchaseOrderLines.AsNoTracking()
                .Where(record => headerIds.Contains(record.PurchaseOrderId))
                .OrderBy(record => record.LineNo),
            record => record.PurchaseOrderId,
            MapPurchaseOrderLine,
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

    private static IQueryable<PurchaseRequisition> ApplyPurchaseRequisitionFilters(IQueryable<PurchaseRequisition> query, ProcurementFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.PurchaseRequisitionNo.Contains(search) || entity.SourceDocumentType.Contains(search));
        }

        return query;
    }

    private static IQueryable<PurchaseOrder> ApplyPurchaseOrderFilters(IQueryable<PurchaseOrder> query, ProcurementFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.PurchaseOrderNo.Contains(search));
        }

        return query;
    }

    private static IQueryable<SubcontractOrder> ApplySubcontractOrderFilters(IQueryable<SubcontractOrder> query, ProcurementFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.SubcontractOrderNo.Contains(search));
        }

        return query;
    }

    private static void ValidatePurchaseRequisition(PurchaseRequisitionUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.PurchaseRequisitionNo, nameof(request.PurchaseRequisitionNo), "Purchase-requisition number is required."),
            Required(request.SourceDocumentType, nameof(request.SourceDocumentType), "Source document type is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Purchase-requisition line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.OrderUomId, nameof(line.OrderUomId), "Order UOM is required."));
            errors.Add(Positive(line.RequiredQuantity, nameof(line.RequiredQuantity), "Required quantity must be greater than zero."));
            errors.Add(Required(line.Status, nameof(line.Status), "Status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidatePurchaseOrder(PurchaseOrderUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            request.SupplierId > 0 || !string.IsNullOrWhiteSpace(request.SupplierCode)
                ? null
                : new ApiError("validation.required", nameof(request.SupplierId), "Supplier id or supplier code is required."),
            Required(request.PurchaseOrderNo, nameof(request.PurchaseOrderNo), "Purchase-order number is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Purchase-order line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.OrderUomId, nameof(line.OrderUomId), "Order UOM is required."));
            errors.Add(Positive(line.OrderedQuantity, nameof(line.OrderedQuantity), "Ordered quantity must be greater than zero."));
            errors.Add(Required(line.Status, nameof(line.Status), "Status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateSubcontractOrder(SubcontractOrderUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            request.SupplierId > 0 || !string.IsNullOrWhiteSpace(request.SupplierCode)
                ? null
                : new ApiError("validation.required", nameof(request.SupplierId), "Supplier id or supplier code is required."),
            Required(request.SubcontractOrderNo, nameof(request.SubcontractOrderNo), "Subcontract-order number is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private async Task<long> ResolveSupplierIdAsync(long companyId, long supplierId, string? supplierCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        if (supplierId > 0)
        {
            var supplier = await DbContext.Suppliers.AsNoTracking()
                .ApplyCompanyScope(scope)
                .FirstOrDefaultAsync(record => record.Id == supplierId, cancellationToken);

            supplier = EnsureFound(supplier, "Supplier was not found in the active scope.", "master.supplier_not_found");
            ThrowIfInvalid(
                supplier.CompanyId != companyId
                    ? new ApiError("validation.mismatch", nameof(companyId), "Supplier does not belong to the requested company.")
                    : null,
                !string.IsNullOrWhiteSpace(supplierCode) && !string.Equals(supplier.SupplierCode, supplierCode.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(supplierCode), "Supplier id and supplier code do not match.")
                    : null);
            return supplier.Id;
        }

        ThrowIfInvalid(Required(supplierCode, nameof(supplierCode), "Supplier code is required when supplier id is not supplied."));
        var resolved = await DbContext.Suppliers.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record =>
                record.CompanyId == companyId &&
                record.SupplierCode == supplierCode!.Trim(),
                cancellationToken);

        resolved = EnsureFound(resolved, "Supplier code was not found in the active scope.", "master.supplier_not_found");
        return resolved.Id;
    }

    private async Task<long?> ResolveSupplierAddressIdAsync(long companyId, long supplierId, long? addressId, string? addressCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        if (addressId.HasValue && addressId.Value > 0)
        {
            var address = await DbContext.SupplierAddresses.AsNoTracking()
                .ApplyCompanyScope(scope)
                .FirstOrDefaultAsync(record => record.Id == addressId.Value, cancellationToken);

            address = EnsureFound(address, "Supplier address was not found in the active scope.", "master.supplier_address_not_found");
            ThrowIfInvalid(
                address.CompanyId != companyId
                    ? new ApiError("validation.mismatch", nameof(companyId), "Supplier address does not belong to the requested company.")
                    : null,
                address.SupplierId != supplierId
                    ? new ApiError("validation.mismatch", nameof(addressId), "Supplier address does not belong to the resolved supplier.")
                    : null,
                !string.IsNullOrWhiteSpace(addressCode) && !string.Equals(address.AddressCode, addressCode.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(addressCode), "Supplier address id and address code do not match.")
                    : null);
            return address.Id;
        }

        if (string.IsNullOrWhiteSpace(addressCode))
        {
            return null;
        }

        var resolved = await DbContext.SupplierAddresses.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record =>
                record.CompanyId == companyId &&
                record.SupplierId == supplierId &&
                record.AddressCode == addressCode.Trim(),
                cancellationToken);

        resolved = EnsureFound(resolved, "Supplier address code was not found in the active scope.", "master.supplier_address_not_found");
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

    private static PurchaseRequisitionLineDto MapPurchaseRequisitionLine(PurchaseRequisitionLine entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.RequiredQuantity, entity.OrderUomId, entity.NeedByDate, entity.SourceBoqRequirementLineId, entity.LinkedWorkOrderId, entity.Status);

    private static PurchaseRequisitionDto MapPurchaseRequisition(PurchaseRequisition entity, IReadOnlyCollection<PurchaseRequisitionLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PurchaseRequisitionNo, entity.SourceDocumentType, entity.SourceDocumentId, entity.Status, lines);

    private static PurchaseOrderLineDto MapPurchaseOrderLine(PurchaseOrderLine entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.PurchaseRequisitionLineId, entity.OrderedQuantity, entity.OrderUomId, entity.ExpectedDate, entity.LinkedWorkOrderId, entity.SourceBoqRequirementLineId, entity.Status);

    private static PurchaseOrderDto MapPurchaseOrder(PurchaseOrder entity, IReadOnlyCollection<PurchaseOrderLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PurchaseOrderNo, entity.SupplierId, entity.OrderAddressId, entity.Status, entity.ExpectedReceiptDate, lines);

    private static SubcontractOrderDto MapSubcontractOrder(SubcontractOrder entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.SubcontractOrderNo, entity.SupplierId, entity.WorkOrderId, entity.OperationId, entity.Status, entity.ExpectedReturnDate);
}
