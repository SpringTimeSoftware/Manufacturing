using System.Globalization;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;
using STS.Mfg.Application.Contracts.Production;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Production;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Inventory;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Production;

internal sealed class ProductionOutputService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail,
    InventoryPostingService inventoryPostingService)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IProductionOutputService
{
    public async Task<PagedResult<ProductionReceiptSummaryDto>> ListProductionReceiptsAsync(ProductionReceiptFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.ProductionReceipts.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.WorkOrderId.HasValue)
        {
            query = query.Where(entity => entity.WorkOrderId == filter.WorkOrderId.Value);
        }

        if (filter.JobCardId.HasValue)
        {
            query = query.Where(entity => entity.JobCardId == filter.JobCardId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
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
            query = query.Where(entity => entity.ReceiptNo.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.PostingDate)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        return MapPage(page, MapReceiptSummary);
    }

    public async Task<ProductionReceiptDto> GetProductionReceiptAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.ProductionReceipts.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Production receipt was not found in the active scope.", "production.receipt_not_found");
        return await MapReceiptAsync(entity, cancellationToken);
    }

    public async Task<ProductionReceiptDto> CreateProductionReceiptAsync(ProductionReceiptCreateRequest request, CancellationToken cancellationToken = default)
    {
        ValidateReceipt(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var scope = GetScope();
        var workOrder = request.WorkOrderId.HasValue
            ? await DbContext.WorkOrders.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == request.WorkOrderId.Value, cancellationToken)
            : null;
        var jobCard = request.JobCardId.HasValue
            ? await DbContext.JobCards.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == request.JobCardId.Value, cancellationToken)
            : null;

        if (request.WorkOrderId.HasValue)
        {
            workOrder = EnsureFound(workOrder, "Work order was not found in the active scope.", "work_order.not_found");
        }

        if (request.JobCardId.HasValue)
        {
            jobCard = EnsureFound(jobCard, "Job card was not found in the active scope.", "job_card.not_found");
        }

        ThrowIfInvalid(
            workOrder is not null && (string.Equals(workOrder.Status, "Cancelled", StringComparison.OrdinalIgnoreCase) || string.Equals(workOrder.Status, "Closed", StringComparison.OrdinalIgnoreCase))
                ? new ApiError("validation.invalid_state", nameof(request.WorkOrderId), "Closed or cancelled work orders cannot receive new production receipts.")
                : null,
            jobCard is not null && (string.Equals(jobCard.Status, "Created", StringComparison.OrdinalIgnoreCase) || string.Equals(jobCard.Status, "Assigned", StringComparison.OrdinalIgnoreCase) || string.Equals(jobCard.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
                ? new ApiError("validation.invalid_state", nameof(request.JobCardId), "Job card must be started, completed, or on quality hold before posting a production receipt.")
                : null,
            workOrder is not null && jobCard is not null && jobCard.WorkOrderId != workOrder.Id
                ? new ApiError("validation.mismatch", nameof(request.JobCardId), "Job card does not belong to the requested work order.")
                : null);

        var requestedGoodQuantity = request.Lines
            .Where(line => string.Equals(line.LineType, "Good", StringComparison.OrdinalIgnoreCase))
            .Sum(line => line.Quantity);

        if (jobCard is not null)
        {
            var alreadyReceiptedQuantity = await (
                from line in DbContext.ProductionReceiptLines
                join receipt in DbContext.ProductionReceipts on line.ProductionReceiptId equals receipt.Id
                where receipt.JobCardId == jobCard.Id && line.LineType == "Good"
                select line.Quantity).SumAsync(cancellationToken);

            ThrowIfInvalid(
                alreadyReceiptedQuantity + requestedGoodQuantity > jobCard.CompletedGoodQty
                    ? new ApiError("production.receipt_exceeds_logged_qty", nameof(request.Lines), "Receipt quantity exceeds the good quantity logged against the job card.")
                    : null);
        }

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        var entity = ProductionReceipt.Create(
            request.CompanyId,
            request.BranchId,
            request.ReceiptNo,
            request.PostingDate,
            workOrder?.Id,
            jobCard?.Id,
            "Posted",
            request.CorrelationId,
            request.Remarks,
            DateTimeOffset.UtcNow,
            GetUserId());

        DbContext.ProductionReceipts.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var stockTransactions = await inventoryPostingService.ReceiveAsync(
            new InventoryReceiptCommand(
                request.CompanyId,
                request.BranchId,
                request.ReceiptNo,
                request.PostingDate,
                nameof(ProductionReceipt),
                entity.Id,
                request.Remarks,
                "stock.receive",
                request.Lines
                    .OrderBy(line => line.LineNo)
                    .Select(line => new InventoryReceiptLine(
                        line.LineNo,
                        string.Equals(line.LineType, "ByProduct", StringComparison.OrdinalIgnoreCase) ? "ByProductReceipt" : "ProductionReceipt",
                        line.ItemId,
                        line.ItemVariantId,
                        line.WarehouseId,
                        line.BinId,
                        line.Quantity,
                        line.CatchWeightQty,
                        line.InventoryState,
                        line.LotId,
                        line.LotNo,
                        line.ManufacturedOn,
                        line.ExpiryOn,
                        line.SerialId,
                        line.SerialNo,
                        line.ItemCode,
                        line.ItemVariantCode))
                    .ToArray()),
            cancellationToken);

        var transactionsByLine = request.Lines.Count == 1
            ? new Dictionary<int, StockTransactionDto> { [request.Lines.First().LineNo] = stockTransactions.Single() }
            : stockTransactions.ToDictionary(
                tx => ResolveLineNo(tx.TransactionNo),
                tx => tx);

        var lines = new List<ProductionReceiptLine>();
        foreach (var requestLine in request.Lines.OrderBy(line => line.LineNo))
        {
            var movement = transactionsByLine.GetValueOrDefault(requestLine.LineNo);
            if (movement is null)
            {
                throw CreateBusinessRule(
                    "Production receipt stock posting did not return the expected line linkage.",
                    "production.receipt_posting_mismatch",
                    new ApiError("production.receipt_posting_mismatch", nameof(request.Lines), $"No stock movement was returned for receipt line {requestLine.LineNo}."));
            }

            lines.Add(ProductionReceiptLine.Create(
                entity.Id,
                requestLine.LineNo,
                requestLine.LineType,
                movement.ItemId,
                movement.ItemVariantId,
                requestLine.OutputUomId,
                requestLine.WarehouseId,
                requestLine.BinId,
                movement.LotId,
                movement.SerialId,
                requestLine.Quantity,
                requestLine.CatchWeightQty,
                requestLine.InventoryState,
                requestLine.Remarks,
                GetUserId()));
        }

        DbContext.ProductionReceiptLines.AddRange(lines);

        if (jobCard is not null)
        {
            DbContext.JobCardEvents.Add(JobCardEvent.Create(
                jobCard.CompanyId ?? 0,
                jobCard.BranchId ?? 0,
                jobCard.Id,
                "ProductionReceiptPosted",
                jobCard.AssignedMachineId,
                jobCard.AssignedOperatorUserId,
                DateTimeOffset.UtcNow,
                requestedGoodQuantity,
                null,
                request.Remarks,
                GetUserId()));
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var dto = await GetProductionReceiptAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("production", nameof(ProductionReceipt), "production.receipt.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<ScrapEntryDto>> ListScrapEntriesAsync(ScrapEntryFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.ScrapEntries.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.WorkOrderId.HasValue)
        {
            query = query.Where(entity => entity.WorkOrderId == filter.WorkOrderId.Value);
        }

        if (filter.JobCardId.HasValue)
        {
            query = query.Where(entity => entity.JobCardId == filter.JobCardId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
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
            query = query.Where(entity => entity.ScrapNo.Contains(search) || entity.ReasonCode.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.PostingDate)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        var stockTransactions = await LoadStockTransactionsAsync(nameof(ScrapEntry), page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapScrap(entity, stockTransactions.GetValueOrDefault(entity.Id, Array.Empty<StockTransactionDto>())));
    }

    public async Task<ScrapEntryDto> CreateScrapEntryAsync(ScrapEntryCreateRequest request, CancellationToken cancellationToken = default)
    {
        ValidateScrap(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var reference = await inventoryPostingService.ResolveReferenceAsync(
            request.CompanyId,
            request.ItemId,
            request.ItemCode,
            request.ItemVariantId,
            request.ItemVariantCode,
            request.LotId,
            request.LotNo,
            request.SerialId,
            request.SerialNo,
            cancellationToken);

        var scope = GetScope();
        var workOrder = request.WorkOrderId.HasValue
            ? await DbContext.WorkOrders.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == request.WorkOrderId.Value, cancellationToken)
            : null;
        var jobCard = request.JobCardId.HasValue
            ? await DbContext.JobCards.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == request.JobCardId.Value, cancellationToken)
            : null;

        if (request.WorkOrderId.HasValue)
        {
            workOrder = EnsureFound(workOrder, "Work order was not found in the active scope.", "work_order.not_found");
        }

        if (request.JobCardId.HasValue)
        {
            jobCard = EnsureFound(jobCard, "Job card was not found in the active scope.", "job_card.not_found");
        }

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        var entity = ScrapEntry.Create(
            request.CompanyId,
            request.BranchId,
            request.ScrapNo,
            request.PostingDate,
            workOrder?.Id,
            jobCard?.Id,
            reference.ItemId,
            reference.ItemVariantId,
            request.WarehouseId,
            request.BinId,
            reference.LotId,
            reference.SerialId,
            request.Quantity,
            request.CatchWeightQty,
            request.ReasonCode,
            request.InventoryState,
            "Posted",
            request.Remarks,
            GetUserId());

        DbContext.ScrapEntries.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var stockTransactions = await inventoryPostingService.IssueAsync(
            new InventoryIssueCommand(
                request.CompanyId,
                request.BranchId,
                request.ScrapNo,
                request.PostingDate,
                nameof(ScrapEntry),
                entity.Id,
                request.Remarks,
                "stock.scrap",
                new[]
                {
                    new InventoryIssueLine(
                        1,
                        "Scrap",
                        reference.ItemId,
                        reference.ItemVariantId,
                        request.WarehouseId,
                        request.BinId,
                        request.Quantity,
                        request.CatchWeightQty,
                        request.InventoryState,
                        reference.LotId,
                        request.LotNo,
                        reference.SerialId,
                        request.SerialNo)
                }),
            cancellationToken);

        if (jobCard is not null)
        {
            DbContext.JobCardEvents.Add(JobCardEvent.Create(
                jobCard.CompanyId ?? 0,
                jobCard.BranchId ?? 0,
                jobCard.Id,
                "ScrapPosted",
                jobCard.AssignedMachineId,
                jobCard.AssignedOperatorUserId,
                DateTimeOffset.UtcNow,
                request.Quantity,
                request.ReasonCode,
                request.Remarks,
                GetUserId()));
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var dto = MapScrap(entity, stockTransactions);
        await WriteAuditAsync("production", nameof(ScrapEntry), "production.scrap.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<PagedResult<ReworkOrderDto>> ListReworkOrdersAsync(ReworkOrderFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.ReworkOrders.AsNoTracking().ApplyActiveOrganizationScope(scope);

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

        if (filter.DateFrom.HasValue)
        {
            query = query.Where(entity => entity.CreatedOn >= filter.DateFrom.Value);
        }

        if (filter.DateTo.HasValue)
        {
            query = query.Where(entity => entity.CreatedOn <= filter.DateTo.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ReworkNo.Contains(search) || (entity.ReasonCode != null && entity.ReasonCode.Contains(search)));
        }

        var page = await query.OrderByDescending(entity => entity.CreatedOn)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        var stockTransactions = await LoadStockTransactionsAsync(nameof(ReworkOrder), page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapRework(entity, stockTransactions.GetValueOrDefault(entity.Id, Array.Empty<StockTransactionDto>())));
    }

    public async Task<ReworkOrderDto> GetReworkOrderAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.ReworkOrders.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Rework order was not found in the active scope.", "production.rework_not_found");
        return MapRework(entity, await LoadStockTransactionsForDocumentAsync(nameof(ReworkOrder), id, cancellationToken));
    }

    public async Task<ReworkOrderDto> CreateReworkOrderAsync(ReworkOrderCreateRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRework(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var reference = await inventoryPostingService.ResolveReferenceAsync(
            request.CompanyId,
            request.ItemId,
            request.ItemCode,
            request.ItemVariantId,
            request.ItemVariantCode,
            request.LotId,
            request.LotNo,
            request.SerialId,
            request.SerialNo,
            cancellationToken);

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);

        var entity = ReworkOrder.Create(
            request.CompanyId,
            request.BranchId,
            request.ReworkNo,
            request.SourceDocumentType,
            request.SourceDocumentId,
            request.WorkOrderId,
            request.JobCardId,
            reference.ItemId,
            reference.ItemVariantId,
            request.SourceWarehouseId,
            request.SourceBinId,
            request.TargetWarehouseId,
            request.TargetBinId,
            request.Quantity,
            request.CatchWeightQty,
            request.ReasonCode,
            request.Instructions,
            "Created",
            GetUserId());

        DbContext.ReworkOrders.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.SourceWarehouseId.HasValue && request.TargetWarehouseId.HasValue)
        {
            await inventoryPostingService.TransferAsync(
                new InventoryTransferCommand(
                    request.CompanyId,
                    request.BranchId,
                    request.ReworkNo,
                    DateOnly.FromDateTime(DateTime.UtcNow),
                    nameof(ReworkOrder),
                    entity.Id,
                    request.Instructions,
                    "stock.rework.transfer",
                    new[]
                    {
                        new InventoryTransferLine(
                            1,
                            "ReworkTransfer",
                            reference.ItemId,
                            reference.ItemVariantId,
                            request.SourceWarehouseId.Value,
                            request.SourceBinId,
                            request.TargetWarehouseId.Value,
                            request.TargetBinId,
                            request.Quantity,
                            request.CatchWeightQty,
                            request.InventoryState,
                            request.InventoryState,
                            reference.LotId,
                            request.LotNo,
                            reference.SerialId,
                            request.SerialNo)
                    }),
                cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);

        var dto = await GetReworkOrderAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("production", nameof(ReworkOrder), "production.rework.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ActionResponse> ReleaseReworkOrderAsync(long id, ReworkOrderActionRequest? request, CancellationToken cancellationToken = default)
    {
        var entity = await LoadReworkForWriteAsync(id, cancellationToken);
        if (string.Equals(entity.Status, "Released", StringComparison.OrdinalIgnoreCase))
        {
            return BuildActionResponse(entity, "Rework order is already released.");
        }

        ThrowIfInvalid(
            string.Equals(entity.Status, "Completed", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Completed rework orders cannot be released again.")
                : null);

        var before = await GetReworkOrderAsync(id, cancellationToken);
        entity.MarkReleased(DateTimeOffset.UtcNow, request?.Instructions, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetReworkOrderAsync(id, cancellationToken);
        await WriteAuditAsync("production", nameof(ReworkOrder), "production.rework.release", entity.Id, before, after, cancellationToken);
        return BuildActionResponse(entity);
    }

    public async Task<ActionResponse> CompleteReworkOrderAsync(long id, ReworkOrderActionRequest? request, CancellationToken cancellationToken = default)
    {
        var entity = await LoadReworkForWriteAsync(id, cancellationToken);
        if (string.Equals(entity.Status, "Completed", StringComparison.OrdinalIgnoreCase))
        {
            return BuildActionResponse(entity, "Rework order is already completed.");
        }

        ThrowIfInvalid(
            !string.Equals(entity.Status, "Released", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(entity.Status, "Created", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(entity.Status), "Only created or released rework orders can be completed.")
                : null);

        var before = await GetReworkOrderAsync(id, cancellationToken);
        entity.MarkCompleted(DateTimeOffset.UtcNow, request?.Instructions, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetReworkOrderAsync(id, cancellationToken);
        await WriteAuditAsync("production", nameof(ReworkOrder), "production.rework.complete", entity.Id, before, after, cancellationToken);
        return BuildActionResponse(entity);
    }

    private async Task<ProductionReceiptDto> MapReceiptAsync(ProductionReceipt entity, CancellationToken cancellationToken)
    {
        var lines = await DbContext.ProductionReceiptLines.AsNoTracking()
            .Where(record => record.ProductionReceiptId == entity.Id)
            .OrderBy(record => record.LineNo)
            .Select(record => new ProductionReceiptLineDto(
                record.Id,
                record.LineNo,
                record.LineType,
                record.ItemId,
                record.ItemVariantId,
                record.OutputUomId,
                record.WarehouseId,
                record.BinId,
                record.LotId,
                record.SerialId,
                record.Quantity,
                record.CatchWeightQty,
                record.InventoryState,
                record.Remarks))
            .ToArrayAsync(cancellationToken);

        var stockTransactions = await LoadStockTransactionsForDocumentAsync(nameof(ProductionReceipt), entity.Id, cancellationToken);
        return new ProductionReceiptDto(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.ReceiptNo,
            entity.PostingDate,
            entity.WorkOrderId,
            entity.JobCardId,
            entity.Status,
            entity.CorrelationId,
            entity.Remarks,
            entity.PostedOn,
            lines,
            stockTransactions);
    }

    private async Task<ReworkOrder> LoadReworkForWriteAsync(long id, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.ReworkOrders
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        return EnsureFound(entity, "Rework order was not found in the active scope.", "production.rework_not_found");
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

    private static void ValidateReceipt(ProductionReceiptCreateRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.ReceiptNo, nameof(request.ReceiptNo), "Receipt number is required."),
            request.Lines.Count == 0 ? new ApiError("validation.required", nameof(request.Lines), "At least one receipt line is required.") : null);

        foreach (var line in request.Lines)
        {
            ThrowIfInvalid(
                line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be positive.") : null,
                Required(line.LineType, nameof(line.LineType), "Line type is required."),
                Positive(line.OutputUomId, nameof(line.OutputUomId), "Output UOM is required."),
                Positive(line.WarehouseId, nameof(line.WarehouseId), "Warehouse is required."),
                Positive(line.Quantity, nameof(line.Quantity), "Receipt quantity must be positive."),
                Required(line.InventoryState, nameof(line.InventoryState), "Inventory state is required."));
        }
    }

    private static void ValidateScrap(ScrapEntryCreateRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.ScrapNo, nameof(request.ScrapNo), "Scrap number is required."),
            Positive(request.WarehouseId, nameof(request.WarehouseId), "Warehouse is required."),
            Positive(request.Quantity, nameof(request.Quantity), "Scrap quantity must be positive."),
            Required(request.ReasonCode, nameof(request.ReasonCode), "Reason code is required."),
            Required(request.InventoryState, nameof(request.InventoryState), "Inventory state is required."));
    }

    private static void ValidateRework(ReworkOrderCreateRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.ReworkNo, nameof(request.ReworkNo), "Rework number is required."),
            Positive(request.Quantity, nameof(request.Quantity), "Rework quantity must be positive."),
            Required(request.InventoryState, nameof(request.InventoryState), "Inventory state is required."));
    }

    private static ProductionReceiptSummaryDto MapReceiptSummary(ProductionReceipt entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.ReceiptNo, entity.PostingDate, entity.WorkOrderId, entity.JobCardId, entity.Status, entity.PostedOn);

    private static ScrapEntryDto MapScrap(ScrapEntry entity, IReadOnlyCollection<StockTransactionDto> stockTransactions) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.ScrapNo,
            entity.PostingDate,
            entity.WorkOrderId,
            entity.JobCardId,
            entity.ItemId,
            entity.ItemVariantId,
            entity.WarehouseId,
            entity.BinId,
            entity.LotId,
            entity.SerialId,
            entity.Quantity,
            entity.CatchWeightQty,
            entity.ReasonCode,
            entity.InventoryState,
            entity.Status,
            entity.Remarks,
            stockTransactions);

    private static ReworkOrderDto MapRework(ReworkOrder entity, IReadOnlyCollection<StockTransactionDto> stockTransactions) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.ReworkNo,
            entity.SourceDocumentType,
            entity.SourceDocumentId,
            entity.WorkOrderId,
            entity.JobCardId,
            entity.ItemId,
            entity.ItemVariantId,
            entity.SourceWarehouseId,
            entity.SourceBinId,
            entity.TargetWarehouseId,
            entity.TargetBinId,
            entity.Quantity,
            entity.CatchWeightQty,
            entity.ReasonCode,
            entity.Instructions,
            entity.Status,
            entity.ReleasedOn,
            entity.ClosedOn,
            stockTransactions);

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
            entity.Quantity,
            entity.CatchWeightQty,
            entity.InventoryState,
            entity.SourceDocumentType,
            entity.SourceDocumentId,
            entity.Remarks);

    private static int ResolveLineNo(string transactionNo)
    {
        var index = transactionNo.LastIndexOf('-');
        if (index < 0)
        {
            return 1;
        }

        return int.TryParse(transactionNo[(index + 1)..], NumberStyles.Integer, CultureInfo.InvariantCulture, out var lineNo)
            ? lineNo
            : 1;
    }

    private static ActionResponse BuildActionResponse(ReworkOrder entity, params string[] warnings) =>
        new(
            entity.Id.ToString(CultureInfo.InvariantCulture),
            entity.Status,
            entity.ReworkNo,
            warnings.Where(warning => !string.IsNullOrWhiteSpace(warning)).ToArray());

    private static BusinessRuleException CreateBusinessRule(string message, string errorCode, params ApiError?[] errors)
    {
        var materialized = errors.Where(error => error is not null).Cast<ApiError>().ToArray();
        return new BusinessRuleException(message, errorCode, materialized);
    }
}
