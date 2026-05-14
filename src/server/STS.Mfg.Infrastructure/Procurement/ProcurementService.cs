using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Procurement;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Procurement;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Procurement;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Inventory;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Procurement;

internal sealed class ProcurementService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail,
    InventoryPostingService inventoryPostingService)
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
                    line.UnitPrice,
                    line.DiscountPercent,
                    line.TaxPercent,
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
                    line.UnitPrice,
                    line.DiscountPercent,
                    line.TaxPercent,
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

    public async Task<PagedResult<SubcontractReceiptDto>> ListSubcontractReceiptsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.SubcontractReceipts.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ReceiptNo.Contains(search) || (entity.Remarks != null && entity.Remarks.Contains(search)));
        }

        var page = await query.OrderByDescending(entity => entity.Id).ThenBy(entity => entity.ReceiptNo).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapSubcontractReceipt);
    }

    public async Task<SubcontractReceiptDto> CreateSubcontractReceiptAsync(SubcontractReceiptUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSubcontractReceipt(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var scope = GetScope();
        var order = await DbContext.SubcontractOrders
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == request.SubcontractOrderId, cancellationToken);

        order = EnsureFound(order, "Subcontract order was not found in the active scope.", "procurement.subcontract_not_found");
        ThrowIfInvalid(
            Immutable(order.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Subcontract receipt company must match the subcontract order."),
            Immutable(order.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Subcontract receipt branch must match the subcontract order."));

        var receipt = SubcontractReceipt.Create(
            request.CompanyId,
            request.BranchId,
            request.ReceiptNo,
            request.SubcontractOrderId,
            request.ReceiptDate,
            request.ReceivedQuantity,
            request.AcceptedQuantity,
            request.RejectedQuantity,
            request.QcStatus,
            request.Status,
            request.Remarks,
            GetUserId());

        var before = MapSubcontractOrder(order);
        if (string.Equals(request.Status, "Received", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(request.Status, "Posted", StringComparison.OrdinalIgnoreCase))
        {
            order.Update(order.SubcontractOrderNo, "Closed", order.ExpectedReturnDate, GetUserId());
        }

        DbContext.SubcontractReceipts.Add(receipt);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapSubcontractReceipt(receipt);
        await WriteAuditAsync("procurement", nameof(SubcontractReceipt), "subcontract.receipt.create", receipt.Id, null, dto, cancellationToken);
        await WriteAuditAsync("procurement", nameof(SubcontractOrder), "subcontract.receive_back", order.Id, before, MapSubcontractOrder(order), cancellationToken);
        return dto;
    }

    public async Task<PagedResult<GoodsReceiptDto>> ListGoodsReceiptsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.GoodsReceipts.AsNoTracking().ApplyActiveOrganizationScope(scope);

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

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.GoodsReceiptNo.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.ReceiptDate).ThenBy(entity => entity.GoodsReceiptNo).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadGoodsReceiptLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapGoodsReceipt(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<GoodsReceiptLineDto>())));
    }

    public async Task<GoodsReceiptDto> CreateGoodsReceiptAsync(GoodsReceiptUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateGoodsReceipt(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var purchaseOrder = await DbContext.PurchaseOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(GetScope())
            .FirstOrDefaultAsync(entity => entity.Id == request.PurchaseOrderId, cancellationToken);

        purchaseOrder = EnsureFound(purchaseOrder, "Purchase order was not found in the active scope.", "procurement.po_not_found");
        ThrowIfInvalid(
            Immutable(purchaseOrder.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Goods receipt company must match the purchase order."),
            Immutable(purchaseOrder.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Goods receipt branch must match the purchase order."));

        var poLineIds = request.Lines.Select(line => line.PurchaseOrderLineId).ToArray();
        var poLines = await DbContext.PurchaseOrderLines.AsNoTracking()
            .Where(line => line.PurchaseOrderId == request.PurchaseOrderId && poLineIds.Contains(line.Id))
            .ToDictionaryAsync(line => line.Id, cancellationToken);

        ThrowIfInvalid(poLines.Count != poLineIds.Distinct().Count()
            ? new ApiError("validation.mismatch", nameof(request.Lines), "Every receipt line must reference a line on the selected purchase order.")
            : null);

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        var entity = GoodsReceipt.Create(request.CompanyId, request.BranchId, request.GoodsReceiptNo, request.PurchaseOrderId, purchaseOrder.SupplierId, request.ReceiptDate, request.WarehouseId, request.Status, Normalize(request.Remarks), GetUserId());
        DbContext.GoodsReceipts.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var lines = request.Lines.OrderBy(line => line.LineNo).Select(line =>
        {
            var poLine = poLines[line.PurchaseOrderLineId];
            return GoodsReceiptLine.Create(entity.Id, line.LineNo, poLine.Id, poLine.ItemId, poLine.OrderUomId, line.ReceivedQuantity, line.AcceptedQuantity, line.RejectedQuantity, poLine.UnitPrice, poLine.TaxPercent, line.QcStatus, line.Status, GetUserId());
        }).ToArray();
        DbContext.GoodsReceiptLines.AddRange(lines);

        var receiptPostingLines = lines.SelectMany(line =>
        {
            var postings = new List<InventoryReceiptLine>();
            if (line.AcceptedQuantity > 0)
            {
                postings.Add(new InventoryReceiptLine(
                    line.LineNo,
                    "PurchaseReceipt",
                    line.ItemId,
                    null,
                    request.WarehouseId!.Value,
                    null,
                    line.AcceptedQuantity,
                    null,
                    "Available"));
            }

            if (line.RejectedQuantity > 0)
            {
                postings.Add(new InventoryReceiptLine(
                    line.LineNo + 1,
                    "PurchaseReceiptRejected",
                    line.ItemId,
                    null,
                    request.WarehouseId!.Value,
                    null,
                    line.RejectedQuantity,
                    null,
                    "QC_Hold"));
            }

            return postings;
        }).ToArray();

        if (receiptPostingLines.Length > 0)
        {
            await inventoryPostingService.ReceiveAsync(
                new InventoryReceiptCommand(
                    request.CompanyId,
                    request.BranchId,
                    request.GoodsReceiptNo,
                    request.ReceiptDate,
                    nameof(GoodsReceipt),
                    entity.Id,
                    request.Remarks,
                    "stock.purchase_receipt",
                    receiptPostingLines),
                cancellationToken);
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var dto = MapGoodsReceipt(entity, lines.Select(MapGoodsReceiptLine).ToArray());
        await WriteAuditAsync("procurement", nameof(GoodsReceipt), "grn.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<SupplierInvoiceDto>> ListSupplierInvoicesAsync(ProcurementFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.SupplierInvoices.AsNoTracking().ApplyActiveOrganizationScope(scope);

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

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status || entity.MatchStatus == status || entity.ApStatus == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.SupplierInvoiceNo.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.InvoiceDate).ThenBy(entity => entity.SupplierInvoiceNo).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadSupplierInvoiceLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapSupplierInvoice(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<SupplierInvoiceLineDto>())));
    }

    public async Task<SupplierInvoiceDto> CreateSupplierInvoiceAsync(SupplierInvoiceUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplierInvoice(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var receipt = await DbContext.GoodsReceipts.AsNoTracking()
            .ApplyActiveOrganizationScope(GetScope())
            .FirstOrDefaultAsync(entity => entity.Id == request.GoodsReceiptId, cancellationToken);

        receipt = EnsureFound(receipt, "Goods receipt was not found in the active scope.", "procurement.grn_not_found");
        ThrowIfInvalid(
            Immutable(receipt.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Supplier invoice company must match the goods receipt."),
            Immutable(receipt.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Supplier invoice branch must match the goods receipt."),
            Immutable(receipt.PurchaseOrderId, request.PurchaseOrderId, nameof(request.PurchaseOrderId), "Supplier invoice purchase order must match the goods receipt."),
            Immutable(receipt.SupplierId, request.SupplierId, nameof(request.SupplierId), "Supplier invoice supplier must match the goods receipt."));

        var grnLineIds = request.Lines.Select(line => line.GoodsReceiptLineId).ToArray();
        var grnLines = await DbContext.GoodsReceiptLines.AsNoTracking()
            .Where(line => line.GoodsReceiptId == request.GoodsReceiptId && grnLineIds.Contains(line.Id))
            .ToDictionaryAsync(line => line.Id, cancellationToken);

        ThrowIfInvalid(grnLines.Count != grnLineIds.Distinct().Count()
            ? new ApiError("validation.mismatch", nameof(request.Lines), "Every invoice line must reference a line on the selected goods receipt.")
            : null);

        var entity = SupplierInvoice.Create(request.CompanyId, request.BranchId, request.SupplierInvoiceNo, request.SupplierId, request.PurchaseOrderId, request.GoodsReceiptId, request.InvoiceDate, request.DueDate, request.CurrencyCode, request.Status, GetUserId());
        DbContext.SupplierInvoices.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var lines = request.Lines.OrderBy(line => line.LineNo).Select(line =>
        {
            var grnLine = grnLines[line.GoodsReceiptLineId];
            var matchStatus = line.PurchaseOrderLineId == grnLine.PurchaseOrderLineId && line.InvoiceQuantity <= grnLine.AcceptedQuantity ? "Matched" : "Mismatch";
            return SupplierInvoiceLine.Create(entity.Id, line.LineNo, line.PurchaseOrderLineId, grnLine.Id, grnLine.ItemId, line.InvoiceQuantity, line.UnitPrice, line.TaxPercent, matchStatus, GetUserId());
        }).ToArray();
        DbContext.SupplierInvoiceLines.AddRange(lines);

        var subtotal = lines.Sum(line => decimal.Round(line.InvoiceQuantity * line.UnitPrice, 2, MidpointRounding.AwayFromZero));
        entity.SetTotals(subtotal, lines.Sum(line => line.TaxAmount), lines.All(line => line.MatchStatus == "Matched") ? "Matched" : "Mismatch", "Not Posted", GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapSupplierInvoice(entity, lines.Select(MapSupplierInvoiceLine).ToArray());
        await WriteAuditAsync("procurement", nameof(SupplierInvoice), "supplierinvoice.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<SupplierInvoiceDto> MatchSupplierInvoiceAsync(long id, CancellationToken cancellationToken = default)
    {
        var invoice = await DbContext.SupplierInvoices.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        invoice = EnsureFound(invoice, "Supplier invoice was not found in the active scope.", "procurement.invoice_not_found");
        var before = await LoadSupplierInvoiceDtoAsync(invoice.Id, cancellationToken);
        var lines = await DbContext.SupplierInvoiceLines.Where(line => line.SupplierInvoiceId == invoice.Id).ToListAsync(cancellationToken);
        invoice.SetTotals(lines.Sum(line => decimal.Round(line.InvoiceQuantity * line.UnitPrice, 2, MidpointRounding.AwayFromZero)), lines.Sum(line => line.TaxAmount), lines.All(line => line.MatchStatus == "Matched") ? "Matched" : "Mismatch", invoice.ApStatus, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = await LoadSupplierInvoiceDtoAsync(invoice.Id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(SupplierInvoice), "supplierinvoice.match", invoice.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<SupplierInvoicePostingResultDto> PostSupplierInvoiceAsync(long id, CancellationToken cancellationToken = default)
    {
        var invoice = await DbContext.SupplierInvoices.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
        invoice = EnsureFound(invoice, "Supplier invoice was not found in the active scope.", "procurement.invoice_not_found");
        ThrowIfInvalid(invoice.MatchStatus != "Matched"
            ? new ApiError("validation.blocked", nameof(invoice.MatchStatus), "Only matched supplier invoices can be posted to AP.")
            : null);

        var existingLiability = await DbContext.AccountsPayableLiabilities.AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.SupplierInvoiceId == invoice.Id, cancellationToken);
        if (existingLiability is not null)
        {
            var existingPostings = await DbContext.AccountingPostings.AsNoTracking()
                .Where(entity => entity.SourceDocumentType == nameof(SupplierInvoice) && entity.SourceDocumentId == invoice.Id)
                .OrderBy(entity => entity.PostingNo)
                .ToArrayAsync(cancellationToken);
            if (!string.Equals(invoice.ApStatus, "Posted", StringComparison.OrdinalIgnoreCase))
            {
                invoice.SetTotals(invoice.SubtotalAmount, invoice.TaxAmount, invoice.MatchStatus, "Posted", GetUserId());
                invoice.UpdateHeader(invoice.SupplierInvoiceNo, invoice.InvoiceDate, invoice.DueDate, invoice.CurrencyCode, "Posted", GetUserId());
                await DbContext.SaveChangesAsync(cancellationToken);
            }

            return new SupplierInvoicePostingResultDto(
                await LoadSupplierInvoiceDtoAsync(invoice.Id, cancellationToken),
                MapLiability(existingLiability),
                existingPostings.Select(MapPosting).ToArray());
        }

        var liability = AccountsPayableLiability.Create(invoice.CompanyId ?? 0, invoice.BranchId ?? 0, $"AP-{invoice.SupplierInvoiceNo}", invoice.Id, invoice.SupplierId, invoice.InvoiceDate, invoice.DueDate ?? invoice.InvoiceDate.AddDays(30), invoice.TotalAmount, GetUserId());
        var inventoryPosting = AccountingPosting.Create(invoice.CompanyId ?? 0, invoice.BranchId ?? 0, $"GL-{invoice.SupplierInvoiceNo}-DR", nameof(SupplierInvoice), invoice.Id, invoice.InvoiceDate, "InventoryClearing", "AccountsPayable", invoice.SubtotalAmount, "Posted", GetUserId());
        var taxPosting = AccountingPosting.Create(invoice.CompanyId ?? 0, invoice.BranchId ?? 0, $"GL-{invoice.SupplierInvoiceNo}-TAX", nameof(SupplierInvoice), invoice.Id, invoice.InvoiceDate, "InputTax", "AccountsPayable", invoice.TaxAmount, "Posted", GetUserId());
        DbContext.AccountsPayableLiabilities.Add(liability);
        DbContext.AccountingPostings.AddRange(inventoryPosting, taxPosting);
        invoice.SetTotals(invoice.SubtotalAmount, invoice.TaxAmount, invoice.MatchStatus, "Posted", GetUserId());
        invoice.UpdateHeader(invoice.SupplierInvoiceNo, invoice.InvoiceDate, invoice.DueDate, invoice.CurrencyCode, "Posted", GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var invoiceDto = await LoadSupplierInvoiceDtoAsync(invoice.Id, cancellationToken);
        var result = new SupplierInvoicePostingResultDto(invoiceDto, MapLiability(liability), new[] { MapPosting(inventoryPosting), MapPosting(taxPosting) });
        await WriteAuditAsync("finance", nameof(SupplierInvoice), "supplierinvoice.post", invoice.Id, null, result, cancellationToken);
        return result;
    }

    public async Task<PagedResult<RfqDto>> ListRfqsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.RequestForQuotations.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyRfqFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.Id).ThenBy(entity => entity.RfqNo).ToPagedResultAsync(filter, cancellationToken);
        var ids = page.Items.Select(entity => entity.Id).ToArray();
        var lines = await LoadRfqLinesAsync(ids, cancellationToken);
        var suppliers = await LoadRfqSuppliersAsync(ids, cancellationToken);
        return MapPage(page, entity => MapRfq(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<RfqLineDto>()), suppliers.GetValueOrDefault(entity.Id, Array.Empty<RfqSupplierDto>())));
    }

    public async Task<RfqDto> GetRfqAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.RequestForQuotations.AsNoTracking()
            .ApplyActiveOrganizationScope(GetScope())
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "RFQ was not found in the active scope.", "procurement.rfq_not_found");
        var lines = await LoadRfqLinesAsync(new[] { id }, cancellationToken);
        var suppliers = await LoadRfqSuppliersAsync(new[] { id }, cancellationToken);
        return MapRfq(entity, lines.GetValueOrDefault(id, Array.Empty<RfqLineDto>()), suppliers.GetValueOrDefault(id, Array.Empty<RfqSupplierDto>()));
    }

    public async Task<RfqDto> CreateRfqAsync(RfqUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRfq(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = RequestForQuotation.Create(request.CompanyId, request.BranchId, request.RfqNo, request.PurchaseRequisitionId, request.IssueDate, request.ResponseDueDate, request.CurrencyCode, request.Status, Normalize(request.Remarks), GetUserId());
        DbContext.RequestForQuotations.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        await ReplaceRfqLinesAndSuppliersAsync(entity.Id, request, cancellationToken);
        var dto = await GetRfqAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(RequestForQuotation), "rfq.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<RfqDto> UpdateRfqAsync(long id, RfqUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRfq(request);
        var entity = await DbContext.RequestForQuotations.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "RFQ was not found in the active scope.", "procurement.rfq_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "RFQ company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "RFQ branch cannot be changed."));

        var before = await GetRfqAsync(id, cancellationToken);
        entity.Update(request.RfqNo, request.PurchaseRequisitionId, request.IssueDate, request.ResponseDueDate, request.CurrencyCode, request.Status, Normalize(request.Remarks), GetUserId());
        await ReplaceRfqLinesAndSuppliersAsync(entity.Id, request, cancellationToken);
        var after = await GetRfqAsync(id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(RequestForQuotation), "rfq.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<RfqDto> SendRfqAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.RequestForQuotations.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "RFQ was not found in the active scope.", "procurement.rfq_not_found");
        var before = await GetRfqAsync(id, cancellationToken);
        entity.Update(entity.RfqNo, entity.PurchaseRequisitionId, entity.IssueDate, entity.ResponseDueDate, entity.CurrencyCode, "Sent", entity.Remarks, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = await GetRfqAsync(id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(RequestForQuotation), "rfq.send", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<SupplierQuotationDto>> ListSupplierQuotationsAsync(ProcurementFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.SupplierQuotations.AsNoTracking().ApplyActiveOrganizationScope(scope);

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

        query = ApplySupplierQuotationFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.Id).ThenBy(entity => entity.SupplierQuotationNo).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadSupplierQuotationLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapSupplierQuotation(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<SupplierQuotationLineDto>())));
    }

    public async Task<SupplierQuotationDto> GetSupplierQuotationAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.SupplierQuotations.AsNoTracking()
            .ApplyActiveOrganizationScope(GetScope())
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Supplier quotation was not found in the active scope.", "procurement.supplier_quote_not_found");
        var lines = await LoadSupplierQuotationLinesAsync(new[] { id }, cancellationToken);
        return MapSupplierQuotation(entity, lines.GetValueOrDefault(id, Array.Empty<SupplierQuotationLineDto>()));
    }

    public async Task<SupplierQuotationDto> CreateSupplierQuotationAsync(SupplierQuotationUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplierQuotation(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var supplierId = await ResolveSupplierIdAsync(request.CompanyId, request.SupplierId, request.SupplierCode, cancellationToken);
        await EnsureRfqInScopeAsync(request.RfqId, request.CompanyId, request.BranchId, cancellationToken);

        var entity = SupplierQuotation.Create(request.CompanyId, request.BranchId, request.SupplierQuotationNo, request.RfqId, supplierId, request.QuotationDate, request.ValidUntil, request.CurrencyCode, request.Status, GetUserId());
        DbContext.SupplierQuotations.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        await ReplaceSupplierQuotationLinesAsync(entity.Id, request, cancellationToken);
        var dto = await GetSupplierQuotationAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(SupplierQuotation), "supplierquote.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<SupplierQuotationDto> UpdateSupplierQuotationAsync(long id, SupplierQuotationUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplierQuotation(request);
        var entity = await DbContext.SupplierQuotations.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Supplier quotation was not found in the active scope.", "procurement.supplier_quote_not_found");
        var supplierId = await ResolveSupplierIdAsync(request.CompanyId, request.SupplierId, request.SupplierCode, cancellationToken);
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Supplier quotation company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Supplier quotation branch cannot be changed."),
            Immutable(entity.SupplierId, supplierId, nameof(request.SupplierId), "Supplier cannot be changed after the quotation is saved."),
            Immutable(entity.RfqId, request.RfqId, nameof(request.RfqId), "RFQ cannot be changed after the quotation is saved."));

        var before = await GetSupplierQuotationAsync(id, cancellationToken);
        entity.UpdateHeader(request.SupplierQuotationNo, request.QuotationDate, request.ValidUntil, request.CurrencyCode, request.Status, GetUserId());
        await ReplaceSupplierQuotationLinesAsync(entity.Id, request, cancellationToken);
        var after = await GetSupplierQuotationAsync(id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(SupplierQuotation), "supplierquote.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<SupplierQuotationDto> SelectSupplierQuotationAsync(long id, SupplierQuotationSelectionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.SupplierQuotations.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Supplier quotation was not found in the active scope.", "procurement.supplier_quote_not_found");
        ThrowIfInvalid(Required(request.SelectionReason, nameof(request.SelectionReason), "Selection reason is required."));
        var before = await GetSupplierQuotationAsync(id, cancellationToken);
        var competingQuotes = await DbContext.SupplierQuotations
            .Where(record => record.RfqId == entity.RfqId && record.Id != entity.Id)
            .ToListAsync(cancellationToken);
        foreach (var quote in competingQuotes)
        {
            quote.UpdateSelection("Not Selected", quote.SelectionReason, GetUserId());
        }

        entity.UpdateSelection("Selected", request.SelectionReason, GetUserId());
        entity.UpdateHeader(entity.SupplierQuotationNo, entity.QuotationDate, entity.ValidUntil, entity.CurrencyCode, "Selected", GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = await GetSupplierQuotationAsync(id, cancellationToken);
        await WriteAuditAsync("procurement", nameof(SupplierQuotation), "supplierquote.select", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<QuoteComparisonDto> GetQuoteComparisonAsync(long rfqId, CancellationToken cancellationToken = default)
    {
        var rfq = await GetRfqAsync(rfqId, cancellationToken);
        var quotations = await DbContext.SupplierQuotations.AsNoTracking()
            .ApplyActiveOrganizationScope(GetScope())
            .Where(record => record.RfqId == rfqId)
            .OrderBy(record => record.TotalAmount)
            .ToArrayAsync(cancellationToken);
        var quotationLines = await LoadSupplierQuotationLinesAsync(quotations.Select(record => record.Id).ToArray(), cancellationToken);
        var quotationDtos = quotations.Select(record => MapSupplierQuotation(record, quotationLines.GetValueOrDefault(record.Id, Array.Empty<SupplierQuotationLineDto>()))).ToArray();
        var comparisonLines = rfq.Lines
            .Select(line => new QuoteComparisonLineDto(
                line.Id,
                line.LineNo,
                line.ItemId,
                line.OrderUomId,
                line.RequestedQuantity,
                quotationDtos.SelectMany(quote => quote.Lines.Where(quoteLine => quoteLine.RfqLineId == line.Id)).OrderBy(quoteLine => quoteLine.LineAmount).ToArray()))
            .ToArray();
        return new QuoteComparisonDto(rfq, quotationDtos, comparisonLines);
    }

    public async Task<PurchaseOrderDto> ConvertSupplierQuotationToPurchaseOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var quote = await GetSupplierQuotationAsync(id, cancellationToken);
        ThrowIfInvalid(quote.SelectionStatus != "Selected"
            ? new ApiError("validation.blocked", nameof(quote.SelectionStatus), "Select the supplier quotation before converting it to a purchase order.")
            : null);

        var request = new PurchaseOrderUpsertRequest(
            quote.CompanyId,
            quote.BranchId,
            $"PO-{quote.SupplierQuotationNo}",
            quote.SupplierId,
            null,
            "Draft",
            quote.Lines.Count > 0 ? DateOnly.FromDateTime(DateTime.UtcNow).AddDays(Math.Max(quote.Lines.Max(line => line.LeadTimeDays), 1)) : null,
            quote.Lines.Select(line => new PurchaseOrderLineUpsertRequest(
                line.LineNo,
                line.ItemId,
                null,
                line.OfferedQuantity,
                line.UnitPrice,
                line.DiscountPercent,
                line.TaxPercent,
                line.OrderUomId,
                DateOnly.FromDateTime(DateTime.UtcNow).AddDays(Math.Max(line.LeadTimeDays, 1)),
                null,
                null,
                "Open")).ToArray());

        var po = await CreatePurchaseOrderAsync(request, cancellationToken);
        await WriteAuditAsync("procurement", nameof(SupplierQuotation), "supplierquote.convert_po", id, quote, po, cancellationToken);
        return po;
    }

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

    private async Task<Dictionary<long, IReadOnlyCollection<GoodsReceiptLineDto>>> LoadGoodsReceiptLinesAsync(
        IReadOnlyCollection<long> headerIds,
        CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.GoodsReceiptLines.AsNoTracking()
                .Where(record => headerIds.Contains(record.GoodsReceiptId))
                .OrderBy(record => record.LineNo),
            record => record.GoodsReceiptId,
            MapGoodsReceiptLine,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<SupplierInvoiceLineDto>>> LoadSupplierInvoiceLinesAsync(
        IReadOnlyCollection<long> headerIds,
        CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.SupplierInvoiceLines.AsNoTracking()
                .Where(record => headerIds.Contains(record.SupplierInvoiceId))
                .OrderBy(record => record.LineNo),
            record => record.SupplierInvoiceId,
            MapSupplierInvoiceLine,
            cancellationToken);

    private async Task<SupplierInvoiceDto> LoadSupplierInvoiceDtoAsync(long invoiceId, CancellationToken cancellationToken)
    {
        var invoice = await DbContext.SupplierInvoices.AsNoTracking()
            .ApplyActiveOrganizationScope(GetScope())
            .FirstOrDefaultAsync(entity => entity.Id == invoiceId, cancellationToken);

        invoice = EnsureFound(invoice, "Supplier invoice was not found in the active scope.", "procurement.invoice_not_found");
        var lines = await LoadSupplierInvoiceLinesAsync(new[] { invoiceId }, cancellationToken);
        return MapSupplierInvoice(invoice, lines.GetValueOrDefault(invoice.Id, Array.Empty<SupplierInvoiceLineDto>()));
    }

    private async Task<Dictionary<long, IReadOnlyCollection<RfqLineDto>>> LoadRfqLinesAsync(
        IReadOnlyCollection<long> headerIds,
        CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.RequestForQuotationLines.AsNoTracking()
                .Where(record => headerIds.Contains(record.RfqId))
                .OrderBy(record => record.LineNo),
            record => record.RfqId,
            MapRfqLine,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<RfqSupplierDto>>> LoadRfqSuppliersAsync(
        IReadOnlyCollection<long> headerIds,
        CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.RequestForQuotationSuppliers.AsNoTracking()
                .Where(record => headerIds.Contains(record.RfqId))
                .OrderBy(record => record.SupplierId),
            record => record.RfqId,
            MapRfqSupplier,
            cancellationToken);

    private async Task<Dictionary<long, IReadOnlyCollection<SupplierQuotationLineDto>>> LoadSupplierQuotationLinesAsync(
        IReadOnlyCollection<long> headerIds,
        CancellationToken cancellationToken) =>
        await LoadGroupedAsync(
            DbContext.SupplierQuotationLines.AsNoTracking()
                .Where(record => headerIds.Contains(record.SupplierQuotationId))
                .OrderBy(record => record.LineNo),
            record => record.SupplierQuotationId,
            MapSupplierQuotationLine,
            cancellationToken);

    private async Task ReplaceRfqLinesAndSuppliersAsync(long rfqId, RfqUpsertRequest request, CancellationToken cancellationToken)
    {
        var existingLines = await DbContext.RequestForQuotationLines.Where(record => record.RfqId == rfqId).ToListAsync(cancellationToken);
        var existingSuppliers = await DbContext.RequestForQuotationSuppliers.Where(record => record.RfqId == rfqId).ToListAsync(cancellationToken);
        DbContext.RequestForQuotationLines.RemoveRange(existingLines);
        DbContext.RequestForQuotationSuppliers.RemoveRange(existingSuppliers);

        var lines = new List<RequestForQuotationLine>();
        foreach (var line in request.Lines.OrderBy(record => record.LineNo))
        {
            var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
            lines.Add(RequestForQuotationLine.Create(rfqId, line.LineNo, itemId, line.OrderUomId, line.RequestedQuantity, line.NeedByDate, line.PurchaseRequisitionLineId, line.Status, GetUserId()));
        }

        var suppliers = new List<RequestForQuotationSupplier>();
        foreach (var supplier in request.Suppliers.OrderBy(record => record.SupplierId))
        {
            var supplierId = await ResolveSupplierIdAsync(request.CompanyId, supplier.SupplierId, supplier.SupplierCode, cancellationToken);
            suppliers.Add(RequestForQuotationSupplier.Create(rfqId, supplierId, supplier.InvitationStatus, supplier.ResponseDueDate, Normalize(supplier.Remarks), GetUserId()));
        }

        DbContext.RequestForQuotationLines.AddRange(lines);
        DbContext.RequestForQuotationSuppliers.AddRange(suppliers);
        await DbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ReplaceSupplierQuotationLinesAsync(long supplierQuotationId, SupplierQuotationUpsertRequest request, CancellationToken cancellationToken)
    {
        var existingLines = await DbContext.SupplierQuotationLines.Where(record => record.SupplierQuotationId == supplierQuotationId).ToListAsync(cancellationToken);
        DbContext.SupplierQuotationLines.RemoveRange(existingLines);

        var rfqLineIds = request.Lines.Select(line => line.RfqLineId).ToArray();
        var rfqLines = await DbContext.RequestForQuotationLines.AsNoTracking()
            .Where(line => line.RfqId == request.RfqId && rfqLineIds.Contains(line.Id))
            .ToDictionaryAsync(line => line.Id, cancellationToken);

        var lines = new List<SupplierQuotationLine>();
        foreach (var line in request.Lines.OrderBy(record => record.LineNo))
        {
            if (!rfqLines.TryGetValue(line.RfqLineId, out var rfqLine))
            {
                ThrowIfInvalid(new ApiError("validation.not_found", nameof(line.RfqLineId), "Supplier quotation line must reference a line on the selected RFQ."));
                continue;
            }

            var itemId = await ResolveItemIdAsync(request.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
            lines.Add(SupplierQuotationLine.Create(supplierQuotationId, line.LineNo, line.RfqLineId, itemId, line.OrderUomId > 0 ? line.OrderUomId : rfqLine.OrderUomId, line.OfferedQuantity, line.UnitPrice, line.DiscountPercent, line.TaxPercent, line.LeadTimeDays, line.Status, GetUserId()));
        }

        DbContext.SupplierQuotationLines.AddRange(lines);
        await DbContext.SaveChangesAsync(cancellationToken);

        var entity = await DbContext.SupplierQuotations.FirstAsync(record => record.Id == supplierQuotationId, cancellationToken);
        entity.SetTotals(lines.Sum(line => decimal.Round(line.OfferedQuantity * line.UnitPrice, 2, MidpointRounding.AwayFromZero) - line.DiscountAmount), lines.Sum(line => line.TaxAmount), GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureRfqInScopeAsync(long rfqId, long companyId, long branchId, CancellationToken cancellationToken)
    {
        var rfq = await DbContext.RequestForQuotations.AsNoTracking()
            .ApplyActiveOrganizationScope(GetScope())
            .FirstOrDefaultAsync(record => record.Id == rfqId, cancellationToken);

        rfq = EnsureFound(rfq, "RFQ was not found in the active scope.", "procurement.rfq_not_found");
        ThrowIfInvalid(
            rfq.CompanyId != companyId ? new ApiError("validation.mismatch", nameof(companyId), "RFQ company does not match the supplier quotation.") : null,
            rfq.BranchId != branchId ? new ApiError("validation.mismatch", nameof(branchId), "RFQ branch does not match the supplier quotation.") : null);
    }

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

    private static IQueryable<RequestForQuotation> ApplyRfqFilters(IQueryable<RequestForQuotation> query, ProcurementFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status) && !string.Equals(filter.Status, "all", StringComparison.OrdinalIgnoreCase))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.RfqNo.Contains(search) || entity.CurrencyCode.Contains(search));
        }

        return query;
    }

    private static IQueryable<SupplierQuotation> ApplySupplierQuotationFilters(IQueryable<SupplierQuotation> query, ProcurementFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status) && !string.Equals(filter.Status, "all", StringComparison.OrdinalIgnoreCase))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status || entity.SelectionStatus == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.SupplierQuotationNo.Contains(search) || entity.CurrencyCode.Contains(search));
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
            errors.Add(line.UnitPrice < 0 ? new ApiError("validation.out_of_range", nameof(line.UnitPrice), "Unit price cannot be negative.") : null);
            errors.Add(line.DiscountPercent is < 0 or > 100 ? new ApiError("validation.out_of_range", nameof(line.DiscountPercent), "Discount percent must be between 0 and 100.") : null);
            errors.Add(line.TaxPercent is < 0 or > 100 ? new ApiError("validation.out_of_range", nameof(line.TaxPercent), "Tax percent must be between 0 and 100.") : null);
            errors.Add(Required(line.Status, nameof(line.Status), "Status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateGoodsReceipt(GoodsReceiptUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Positive(request.PurchaseOrderId, nameof(request.PurchaseOrderId), "Purchase order is required."),
            request.WarehouseId is > 0 ? null : new ApiError("validation.required", nameof(request.WarehouseId), "Receiving warehouse is required so accepted and rejected quantities can post to inventory."),
            Required(request.GoodsReceiptNo, nameof(request.GoodsReceiptNo), "GRN number is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            request.Lines.Count == 0 ? new ApiError("validation.required", nameof(request.Lines), "At least one receipt line is required.") : null
        };

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(Positive(line.PurchaseOrderLineId, nameof(line.PurchaseOrderLineId), "Purchase order line is required."));
            errors.Add(Positive(line.ReceivedQuantity, nameof(line.ReceivedQuantity), "Received quantity must be greater than zero."));
            errors.Add(line.AcceptedQuantity < 0 ? new ApiError("validation.out_of_range", nameof(line.AcceptedQuantity), "Accepted quantity cannot be negative.") : null);
            errors.Add(line.RejectedQuantity < 0 ? new ApiError("validation.out_of_range", nameof(line.RejectedQuantity), "Rejected quantity cannot be negative.") : null);
            errors.Add(line.AcceptedQuantity + line.RejectedQuantity != line.ReceivedQuantity ? new ApiError("validation.out_of_range", nameof(line.AcceptedQuantity), "Accepted plus rejected quantity must equal received quantity before GRN posting.") : null);
            errors.Add(Required(line.QcStatus, nameof(line.QcStatus), "QC status is required."));
            errors.Add(Required(line.Status, nameof(line.Status), "Line status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateSupplierInvoice(SupplierInvoiceUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Positive(request.SupplierId, nameof(request.SupplierId), "Supplier is required."),
            Positive(request.PurchaseOrderId, nameof(request.PurchaseOrderId), "Purchase order is required."),
            Positive(request.GoodsReceiptId, nameof(request.GoodsReceiptId), "Goods receipt is required."),
            Required(request.SupplierInvoiceNo, nameof(request.SupplierInvoiceNo), "Supplier invoice number is required."),
            Required(request.CurrencyCode, nameof(request.CurrencyCode), "Currency is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            request.Lines.Count == 0 ? new ApiError("validation.required", nameof(request.Lines), "At least one invoice line is required.") : null
        };

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(Positive(line.PurchaseOrderLineId, nameof(line.PurchaseOrderLineId), "Purchase order line is required."));
            errors.Add(Positive(line.GoodsReceiptLineId, nameof(line.GoodsReceiptLineId), "Goods receipt line is required."));
            errors.Add(Positive(line.InvoiceQuantity, nameof(line.InvoiceQuantity), "Invoice quantity must be greater than zero."));
            errors.Add(line.UnitPrice < 0 ? new ApiError("validation.out_of_range", nameof(line.UnitPrice), "Unit price cannot be negative.") : null);
            errors.Add(line.TaxPercent is < 0 or > 100 ? new ApiError("validation.out_of_range", nameof(line.TaxPercent), "Tax percent must be between 0 and 100.") : null);
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

    private static void ValidateSubcontractReceipt(SubcontractReceiptUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Positive(request.SubcontractOrderId, nameof(request.SubcontractOrderId), "Subcontract order is required."),
            Required(request.ReceiptNo, nameof(request.ReceiptNo), "Subcontract receipt number is required."),
            Positive(request.ReceivedQuantity, nameof(request.ReceivedQuantity), "Received quantity must be greater than zero."),
            request.AcceptedQuantity < 0 ? new ApiError("validation.out_of_range", nameof(request.AcceptedQuantity), "Accepted quantity cannot be negative.") : null,
            request.RejectedQuantity < 0 ? new ApiError("validation.out_of_range", nameof(request.RejectedQuantity), "Rejected quantity cannot be negative.") : null,
            Required(request.QcStatus, nameof(request.QcStatus), "QC status is required."),
            Required(request.Status, nameof(request.Status), "Receipt status is required.")
        };

        if (request.AcceptedQuantity + request.RejectedQuantity != request.ReceivedQuantity)
        {
            errors.Add(new ApiError("validation.mismatch", nameof(request.ReceivedQuantity), "Accepted plus rejected quantity must equal received quantity."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateRfq(RfqUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.RfqNo, nameof(request.RfqNo), "RFQ number is required."),
            Required(request.CurrencyCode, nameof(request.CurrencyCode), "Currency is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            request.ResponseDueDate < request.IssueDate ? new ApiError("validation.out_of_range", nameof(request.ResponseDueDate), "Response due date cannot be before issue date.") : null,
            request.Lines.Count == 0 ? new ApiError("validation.required", nameof(request.Lines), "At least one RFQ line is required.") : null,
            request.Suppliers.Count < 2 ? new ApiError("validation.required", nameof(request.Suppliers), "Invite at least two suppliers for quote comparison.") : null
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "RFQ line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.OrderUomId, nameof(line.OrderUomId), "Order UOM is required."));
            errors.Add(Positive(line.RequestedQuantity, nameof(line.RequestedQuantity), "Requested quantity must be greater than zero."));
            errors.Add(Required(line.Status, nameof(line.Status), "Line status is required."));
        }

        foreach (var supplier in request.Suppliers)
        {
            errors.Add(supplier.SupplierId > 0 || !string.IsNullOrWhiteSpace(supplier.SupplierCode)
                ? null
                : new ApiError("validation.required", nameof(supplier.SupplierId), "Supplier id or supplier code is required."));
            errors.Add(Required(supplier.InvitationStatus, nameof(supplier.InvitationStatus), "Invitation status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateSupplierQuotation(SupplierQuotationUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Positive(request.RfqId, nameof(request.RfqId), "RFQ is required."),
            request.SupplierId > 0 || !string.IsNullOrWhiteSpace(request.SupplierCode)
                ? null
                : new ApiError("validation.required", nameof(request.SupplierId), "Supplier id or supplier code is required."),
            Required(request.SupplierQuotationNo, nameof(request.SupplierQuotationNo), "Supplier quotation number is required."),
            Required(request.CurrencyCode, nameof(request.CurrencyCode), "Currency is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            request.ValidUntil < request.QuotationDate ? new ApiError("validation.out_of_range", nameof(request.ValidUntil), "Valid-until date cannot be before quotation date.") : null,
            request.Lines.Count == 0 ? new ApiError("validation.required", nameof(request.Lines), "At least one supplier quotation line is required.") : null
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Supplier quotation line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(Positive(line.RfqLineId, nameof(line.RfqLineId), "RFQ line is required."));
            errors.Add(line.ItemId > 0 || !string.IsNullOrWhiteSpace(line.ItemCode)
                ? null
                : new ApiError("validation.required", nameof(line.ItemId), "Item id or item code is required."));
            errors.Add(Positive(line.OrderUomId, nameof(line.OrderUomId), "Order UOM is required."));
            errors.Add(Positive(line.OfferedQuantity, nameof(line.OfferedQuantity), "Offered quantity must be greater than zero."));
            errors.Add(line.UnitPrice < 0 ? new ApiError("validation.out_of_range", nameof(line.UnitPrice), "Unit price cannot be negative.") : null);
            errors.Add(line.DiscountPercent is < 0 or > 100 ? new ApiError("validation.out_of_range", nameof(line.DiscountPercent), "Discount percent must be between 0 and 100.") : null);
            errors.Add(line.TaxPercent is < 0 or > 100 ? new ApiError("validation.out_of_range", nameof(line.TaxPercent), "Tax percent must be between 0 and 100.") : null);
            errors.Add(line.LeadTimeDays < 0 ? new ApiError("validation.out_of_range", nameof(line.LeadTimeDays), "Lead time days cannot be negative.") : null);
            errors.Add(Required(line.Status, nameof(line.Status), "Line status is required."));
        }

        ThrowIfInvalid(errors);
    }

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
        new(entity.Id, entity.LineNo, entity.ItemId, entity.PurchaseRequisitionLineId, entity.OrderedQuantity, entity.UnitPrice, entity.DiscountPercent, entity.DiscountAmount, entity.TaxPercent, entity.TaxAmount, entity.LineAmount, entity.OrderUomId, entity.ExpectedDate, entity.LinkedWorkOrderId, entity.SourceBoqRequirementLineId, entity.Status);

    private static PurchaseOrderDto MapPurchaseOrder(PurchaseOrder entity, IReadOnlyCollection<PurchaseOrderLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PurchaseOrderNo, entity.SupplierId, entity.OrderAddressId, entity.Status, entity.ExpectedReceiptDate, lines);

    private static SubcontractOrderDto MapSubcontractOrder(SubcontractOrder entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.SubcontractOrderNo, entity.SupplierId, entity.WorkOrderId, entity.OperationId, entity.Status, entity.ExpectedReturnDate);

    private static SubcontractReceiptDto MapSubcontractReceipt(SubcontractReceipt entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.ReceiptNo, entity.SubcontractOrderId, entity.ReceiptDate, entity.ReceivedQuantity, entity.AcceptedQuantity, entity.RejectedQuantity, entity.QcStatus, entity.Status, entity.Remarks);

    private static GoodsReceiptLineDto MapGoodsReceiptLine(GoodsReceiptLine entity) =>
        new(entity.Id, entity.LineNo, entity.PurchaseOrderLineId, entity.ItemId, entity.OrderUomId, entity.ReceivedQuantity, entity.AcceptedQuantity, entity.RejectedQuantity, entity.UnitPrice, entity.TaxPercent, entity.LineAmount, entity.QcStatus, entity.Status);

    private static GoodsReceiptDto MapGoodsReceipt(GoodsReceipt entity, IReadOnlyCollection<GoodsReceiptLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.GoodsReceiptNo, entity.PurchaseOrderId, entity.SupplierId, entity.ReceiptDate, entity.WarehouseId, entity.Status, entity.Remarks, lines);

    private static SupplierInvoiceLineDto MapSupplierInvoiceLine(SupplierInvoiceLine entity) =>
        new(entity.Id, entity.LineNo, entity.PurchaseOrderLineId, entity.GoodsReceiptLineId, entity.ItemId, entity.InvoiceQuantity, entity.UnitPrice, entity.TaxPercent, entity.TaxAmount, entity.LineAmount, entity.MatchStatus);

    private static SupplierInvoiceDto MapSupplierInvoice(SupplierInvoice entity, IReadOnlyCollection<SupplierInvoiceLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.SupplierInvoiceNo, entity.SupplierId, entity.PurchaseOrderId, entity.GoodsReceiptId, entity.InvoiceDate, entity.DueDate, entity.CurrencyCode, entity.SubtotalAmount, entity.TaxAmount, entity.TotalAmount, entity.MatchStatus, entity.ApStatus, entity.Status, lines);

    private static AccountsPayableLiabilityDto MapLiability(AccountsPayableLiability entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.LiabilityNo, entity.SupplierInvoiceId, entity.SupplierId, entity.PostingDate, entity.DueDate, entity.PayableAmount, entity.PaidAmount, entity.BalanceAmount, entity.Status);

    private static AccountingPostingDto MapPosting(AccountingPosting entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.PostingNo, entity.SourceDocumentType, entity.SourceDocumentId, entity.PostingDate, entity.DebitAccountCode, entity.CreditAccountCode, entity.Amount, entity.Status);

    private static RfqLineDto MapRfqLine(RequestForQuotationLine entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.OrderUomId, entity.RequestedQuantity, entity.NeedByDate, entity.PurchaseRequisitionLineId, entity.Status);

    private static RfqSupplierDto MapRfqSupplier(RequestForQuotationSupplier entity) =>
        new(entity.Id, entity.SupplierId, entity.InvitationStatus, entity.ResponseDueDate, entity.Remarks);

    private static RfqDto MapRfq(RequestForQuotation entity, IReadOnlyCollection<RfqLineDto> lines, IReadOnlyCollection<RfqSupplierDto> suppliers) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.RfqNo, entity.PurchaseRequisitionId, entity.IssueDate, entity.ResponseDueDate, entity.CurrencyCode, entity.Status, entity.Remarks, lines, suppliers);

    private static SupplierQuotationLineDto MapSupplierQuotationLine(SupplierQuotationLine entity) =>
        new(entity.Id, entity.LineNo, entity.RfqLineId, entity.ItemId, entity.OrderUomId, entity.OfferedQuantity, entity.UnitPrice, entity.DiscountPercent, entity.DiscountAmount, entity.TaxPercent, entity.TaxAmount, entity.LineAmount, entity.LeadTimeDays, entity.Status);

    private static SupplierQuotationDto MapSupplierQuotation(SupplierQuotation entity, IReadOnlyCollection<SupplierQuotationLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.SupplierQuotationNo, entity.RfqId, entity.SupplierId, entity.QuotationDate, entity.ValidUntil, entity.CurrencyCode, entity.SubtotalAmount, entity.TaxAmount, entity.TotalAmount, entity.SelectionStatus, entity.SelectionReason, entity.Status, lines);
}
