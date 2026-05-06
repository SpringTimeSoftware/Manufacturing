using System.Globalization;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Quality;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Quality;
using STS.Mfg.Domain.Production;
using STS.Mfg.Domain.Quality;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Inventory;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Quality;

internal sealed class QualityService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail,
    InventoryPostingService inventoryPostingService)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IQualityService
{
    public async Task<PagedResult<InspectionPlanDto>> ListInspectionPlansAsync(InspectionPlanFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.InspectionPlans.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.InspectionType))
        {
            var inspectionType = filter.InspectionType.Trim();
            query = query.Where(entity => entity.InspectionType == inspectionType);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.PlanCode.Contains(search) || entity.PlanName.Contains(search));
        }

        var page = await query.OrderBy(entity => entity.PlanCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapPlan);
    }

    public async Task<InspectionPlanDto> GetInspectionPlanAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.InspectionPlans.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Inspection plan was not found in the active scope.", "quality.plan_not_found");
        return MapPlan(entity);
    }

    public async Task<InspectionPlanDto> CreateInspectionPlanAsync(InspectionPlanUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePlan(request);
        EnsureContextAccess(request.CompanyId, null);
        var itemId = await ResolveItemIdAsync(request.CompanyId, request.ItemId, request.ItemCode, cancellationToken);

        var entity = InspectionPlan.Create(
            request.CompanyId,
            request.PlanCode,
            request.PlanName,
            request.InspectionType,
            itemId,
            request.OperationId,
            request.AutoHoldOnFail,
            request.AutoCreateNcrOnFail,
            request.Status,
            GetUserId());

        DbContext.InspectionPlans.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapPlan(entity);
        await WriteAuditAsync("quality", nameof(InspectionPlan), "quality.plan.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<InspectionPlanDto> UpdateInspectionPlanAsync(long id, InspectionPlanUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePlan(request);
        var scope = GetScope();
        var entity = await DbContext.InspectionPlans
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Inspection plan was not found in the active scope.", "quality.plan_not_found");
        var itemId = await ResolveItemIdAsync(request.CompanyId, request.ItemId, request.ItemCode, cancellationToken);

        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Inspection-plan company cannot be changed."),
            Immutable(entity.ItemId, itemId, nameof(request.ItemId), "Inspection-plan item cannot be changed."),
            Immutable(entity.OperationId, request.OperationId, nameof(request.OperationId), "Inspection-plan operation cannot be changed."));

        var before = MapPlan(entity);
        entity.Update(request.PlanCode, request.PlanName, request.InspectionType, request.AutoHoldOnFail, request.AutoCreateNcrOnFail, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapPlan(entity);
        await WriteAuditAsync("quality", nameof(InspectionPlan), "quality.plan.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<InspectionDto>> ListInspectionsAsync(InspectionFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.InspectionRecords.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.InspectionType))
        {
            var inspectionType = filter.InspectionType.Trim();
            query = query.Where(entity => entity.InspectionType == inspectionType);
        }

        if (!string.IsNullOrWhiteSpace(filter.SourceDocumentType))
        {
            var sourceDocumentType = filter.SourceDocumentType.Trim();
            query = query.Where(entity => entity.SourceDocumentType == sourceDocumentType);
        }

        if (filter.SourceDocumentId.HasValue)
        {
            query = query.Where(entity => entity.SourceDocumentId == filter.SourceDocumentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.InspectionNo.Contains(search) || entity.OverallResult.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.CreatedOn)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        var results = await LoadResultsAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapInspection(entity, results.GetValueOrDefault(entity.Id, Array.Empty<InspectionResultDto>())));
    }

    public async Task<InspectionDto> GetInspectionAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.InspectionRecords.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Inspection was not found in the active scope.", "quality.inspection_not_found");
        var results = await LoadResultsAsync(new[] { id }, cancellationToken);
        return MapInspection(entity, results.GetValueOrDefault(id, Array.Empty<InspectionResultDto>()));
    }

    public async Task<InspectionDto> SaveInspectionAsync(InspectionSaveRequest request, CancellationToken cancellationToken = default)
    {
        ValidateInspection(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        await using var transaction = await DbContext.Database.BeginTransactionAsync(cancellationToken);
        var scope = GetScope();

        var plan = request.InspectionPlanId.HasValue
            ? await DbContext.InspectionPlans.ApplyCompanyScope(scope).FirstOrDefaultAsync(record => record.Id == request.InspectionPlanId.Value, cancellationToken)
            : null;

        if (request.InspectionPlanId.HasValue)
        {
            plan = EnsureFound(plan, "Inspection plan was not found in the active scope.", "quality.plan_not_found");
        }

        var entity = !string.IsNullOrWhiteSpace(request.RequestToken)
            ? await DbContext.InspectionRecords.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.RequestToken == request.RequestToken!.Trim(), cancellationToken)
            : null;

        var overallResult = ResolveOverallResult(request.OverallResult, request.Results);
        var status = overallResult is "Hold" or "Fail" ? "Held" : "Completed";

        if (entity is null)
        {
            entity = InspectionRecord.Create(
                request.CompanyId,
                request.BranchId,
                request.InspectionNo,
                request.InspectionPlanId,
                request.InspectionType,
                request.SourceDocumentType,
                request.SourceDocumentId,
                request.LotId,
                request.SerialId,
                status,
                overallResult,
                request.RequestToken,
                request.Notes,
                GetUserId());

            DbContext.InspectionRecords.Add(entity);
            await DbContext.SaveChangesAsync(cancellationToken);
        }
        else
        {
            entity.Update(request.InspectionNo, request.InspectionType, request.SourceDocumentType, status, overallResult, request.RequestToken, request.Notes, GetUserId());
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var existingResults = await DbContext.InspectionResults.Where(record => record.InspectionRecordId == entity.Id).ToListAsync(cancellationToken);
        DbContext.InspectionResults.RemoveRange(existingResults);

        if (request.Results.Count > 0)
        {
            DbContext.InspectionResults.AddRange(request.Results
                .OrderBy(result => result.LineNo)
                .Select(result => InspectionResult.Create(entity.Id, result.LineNo, result.ParameterCode, result.ExpectedValue, result.ActualValue, result.ResultStatus, result.Remarks, GetUserId())));
        }

        await ApplyInspectionOutcomeAsync(entity, plan, overallResult, request.Notes, cancellationToken);
        if ((request.AutoCreateNcr || plan?.AutoCreateNcrOnFail == true) && overallResult is "Hold" or "Fail")
        {
            await CreateOrReuseNcrAsync(entity, request.NcrNo, request.NcrDisposition ?? "Hold", request.NcrRootCause, cancellationToken);
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var dto = await GetInspectionAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("quality", nameof(InspectionRecord), "quality.inspection.save", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ActionResponse> HoldInspectionAsync(long id, InspectionHoldReleaseRequest? request, CancellationToken cancellationToken = default)
    {
        var entity = await LoadInspectionForWriteAsync(id, cancellationToken);
        if (string.Equals(entity.Status, "Held", StringComparison.OrdinalIgnoreCase))
        {
            return BuildActionResponse(entity, "Inspection is already held.");
        }

        entity.MarkHeld(request?.Notes, GetUserId());
        await ApplyInspectionOutcomeAsync(entity, null, "Hold", request?.Notes, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetInspectionAsync(id, cancellationToken);
        await WriteAuditAsync("quality", nameof(InspectionRecord), "quality.inspection.hold", entity.Id, null, after, cancellationToken);
        return BuildActionResponse(entity);
    }

    public async Task<ActionResponse> ReleaseInspectionAsync(long id, InspectionHoldReleaseRequest? request, CancellationToken cancellationToken = default)
    {
        var entity = await LoadInspectionForWriteAsync(id, cancellationToken);
        entity.MarkReleased(request?.Notes, GetUserId());
        await ApplyInspectionOutcomeAsync(entity, null, "Pass", request?.Notes, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetInspectionAsync(id, cancellationToken);
        await WriteAuditAsync("quality", nameof(InspectionRecord), "quality.inspection.release", entity.Id, null, after, cancellationToken);
        return BuildActionResponse(entity);
    }

    public async Task<PagedResult<NonConformanceDto>> ListNonConformancesAsync(NonConformanceFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.NonConformances.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.SourceDocumentType))
        {
            var sourceDocumentType = filter.SourceDocumentType.Trim();
            query = query.Where(entity => entity.SourceDocumentType == sourceDocumentType);
        }

        if (filter.SourceDocumentId.HasValue)
        {
            query = query.Where(entity => entity.SourceDocumentId == filter.SourceDocumentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.NcrNo.Contains(search) || entity.Disposition.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.CreatedOn).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapNcr);
    }

    public async Task<NonConformanceDto> GetNonConformanceAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.NonConformances.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "NCR was not found in the active scope.", "quality.ncr_not_found");
        return MapNcr(entity);
    }

    public async Task<NonConformanceDto> CreateNonConformanceAsync(NonConformanceUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateNcr(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = NonConformance.Create(
            request.CompanyId,
            request.BranchId,
            request.NcrNo,
            request.SourceDocumentType,
            request.SourceDocumentId,
            request.LotId,
            request.SerialId,
            request.Disposition,
            request.Status,
            request.RootCause,
            request.ReworkOrderId,
            request.Remarks,
            GetUserId());

        DbContext.NonConformances.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapNcr(entity);
        await WriteAuditAsync("quality", nameof(NonConformance), "quality.ncr.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<NonConformanceDto> UpdateNonConformanceAsync(long id, NonConformanceUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateNcr(request);
        var scope = GetScope();
        var entity = await DbContext.NonConformances.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "NCR was not found in the active scope.", "quality.ncr_not_found");
        var before = MapNcr(entity);
        entity.Update(request.NcrNo, request.SourceDocumentType, request.Disposition, request.Status, request.RootCause, request.Remarks, GetUserId());
        entity.LinkRework(request.ReworkOrderId, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapNcr(entity);
        await WriteAuditAsync("quality", nameof(NonConformance), "quality.ncr.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<ActionResponse> CloseNonConformanceAsync(long id, NonConformanceActionRequest? request, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.NonConformances.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "NCR was not found in the active scope.", "quality.ncr_not_found");
        entity.Update(entity.NcrNo, entity.SourceDocumentType, entity.Disposition, "Closed", entity.RootCause, request?.Remarks ?? entity.Remarks, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapNcr(entity);
        await WriteAuditAsync("quality", nameof(NonConformance), "quality.ncr.close", entity.Id, null, after, cancellationToken);
        return new ActionResponse(entity.Id.ToString(CultureInfo.InvariantCulture), entity.Status, entity.NcrNo, Array.Empty<string>());
    }

    private async Task ApplyInspectionOutcomeAsync(InspectionRecord inspection, InspectionPlan? plan, string overallResult, string? notes, CancellationToken cancellationToken)
    {
        if (string.Equals(inspection.SourceDocumentType, nameof(JobCard), StringComparison.OrdinalIgnoreCase) && inspection.SourceDocumentId.HasValue)
        {
            var jobCard = await DbContext.JobCards.FirstOrDefaultAsync(record => record.Id == inspection.SourceDocumentId.Value, cancellationToken);
            if (jobCard is null)
            {
                return;
            }

            var operation = await DbContext.WorkOrderOperations.FirstOrDefaultAsync(record => record.Id == jobCard.WorkOrderOperationId, cancellationToken);
            var workOrder = await DbContext.WorkOrders.FirstOrDefaultAsync(record => record.Id == jobCard.WorkOrderId, cancellationToken);
            if (operation is null || workOrder is null)
            {
                return;
            }

            if (overallResult is "Hold" or "Fail")
            {
                if (plan?.AutoHoldOnFail != false)
                {
                    inspection.MarkHeld(notes, GetUserId());
                    jobCard.SetStatus("QC_Hold", GetUserId());
                    operation.UpdateExecutionProgress(operation.CompletedQuantity, "QC_Hold", GetUserId());
                    workOrder.SetExecutionStatus("OnHold", notes, GetUserId());
                }
            }
            else if (string.Equals(jobCard.Status, "QC_Hold", StringComparison.OrdinalIgnoreCase))
            {
                jobCard.SetStatus("Completed", GetUserId());
                operation.UpdateExecutionProgress(operation.CompletedQuantity, "Completed", GetUserId());
                workOrder.SetExecutionStatus(ResolveWorkOrderStatus(await LoadWorkOrderOperationsAsync(workOrder.Id, cancellationToken), workOrder.Status), notes, GetUserId());
            }

            return;
        }

        if (string.Equals(inspection.SourceDocumentType, nameof(ProductionReceipt), StringComparison.OrdinalIgnoreCase) && inspection.SourceDocumentId.HasValue)
        {
            var receipt = await DbContext.ProductionReceipts.FirstOrDefaultAsync(record => record.Id == inspection.SourceDocumentId.Value, cancellationToken);
            if (receipt is null)
            {
                return;
            }

            var lines = await DbContext.ProductionReceiptLines.Where(record => record.ProductionReceiptId == receipt.Id).OrderBy(record => record.LineNo).ToListAsync(cancellationToken);
            if (lines.Count == 0)
            {
                return;
            }

            if (overallResult is "Hold" or "Fail")
            {
                inspection.MarkHeld(notes, GetUserId());
                var holdLines = lines
                    .Where(line => !string.Equals(line.InventoryState, "QC_Hold", StringComparison.OrdinalIgnoreCase))
                    .Select(line => new InventoryStateChangeLine(
                        line.LineNo,
                        "QcHold",
                        line.ItemId,
                        line.ItemVariantId,
                        line.WarehouseId,
                        line.BinId,
                        line.Quantity,
                        line.CatchWeightQty,
                        line.InventoryState,
                        "QC_Hold",
                        line.LotId,
                        null,
                        line.SerialId))
                    .ToArray();

                if (holdLines.Length > 0)
                {
                    await inventoryPostingService.ChangeStateAsync(
                        new InventoryStateChangeCommand(
                            receipt.CompanyId ?? 0,
                            receipt.BranchId ?? 0,
                            $"{inspection.InspectionNo}-HOLD",
                            DateOnly.FromDateTime(DateTime.UtcNow),
                            nameof(InspectionRecord),
                            inspection.Id,
                            notes,
                            "stock.quality.hold",
                            holdLines),
                        cancellationToken);

                    foreach (var line in lines.Where(line => !string.Equals(line.InventoryState, "QC_Hold", StringComparison.OrdinalIgnoreCase)))
                    {
                        line.Update(line.LineType, line.Quantity, line.CatchWeightQty, "QC_Hold", line.Remarks, GetUserId());
                    }
                }
            }
            else
            {
                var releaseLines = lines
                    .Where(line => string.Equals(line.InventoryState, "QC_Hold", StringComparison.OrdinalIgnoreCase))
                    .Select(line => new InventoryStateChangeLine(
                        line.LineNo,
                        "QcRelease",
                        line.ItemId,
                        line.ItemVariantId,
                        line.WarehouseId,
                        line.BinId,
                        line.Quantity,
                        line.CatchWeightQty,
                        "QC_Hold",
                        "Available",
                        line.LotId,
                        null,
                        line.SerialId))
                    .ToArray();

                if (releaseLines.Length > 0)
                {
                    await inventoryPostingService.ChangeStateAsync(
                        new InventoryStateChangeCommand(
                            receipt.CompanyId ?? 0,
                            receipt.BranchId ?? 0,
                            $"{inspection.InspectionNo}-REL",
                            DateOnly.FromDateTime(DateTime.UtcNow),
                            nameof(InspectionRecord),
                            inspection.Id,
                            notes,
                            "stock.quality.release",
                            releaseLines),
                        cancellationToken);

                    foreach (var line in lines.Where(line => string.Equals(line.InventoryState, "QC_Hold", StringComparison.OrdinalIgnoreCase)))
                    {
                        line.Update(line.LineType, line.Quantity, line.CatchWeightQty, "Available", line.Remarks, GetUserId());
                    }
                }
            }
        }
    }

    private async Task CreateOrReuseNcrAsync(InspectionRecord inspection, string? ncrNo, string disposition, string? rootCause, CancellationToken cancellationToken)
    {
        var existing = await DbContext.NonConformances.FirstOrDefaultAsync(
            record => record.SourceDocumentType == inspection.SourceDocumentType &&
                      record.SourceDocumentId == inspection.SourceDocumentId &&
                      record.Status != "Closed",
            cancellationToken);

        if (existing is not null)
        {
            existing.Update(existing.NcrNo, existing.SourceDocumentType, disposition, existing.Status, rootCause ?? existing.RootCause, existing.Remarks, GetUserId());
            return;
        }

        DbContext.NonConformances.Add(NonConformance.Create(
            inspection.CompanyId ?? 0,
            inspection.BranchId ?? 0,
            string.IsNullOrWhiteSpace(ncrNo) ? BuildNcrNo(inspection.InspectionNo) : ncrNo,
            inspection.SourceDocumentType,
            inspection.SourceDocumentId,
            inspection.LotId,
            inspection.SerialId,
            disposition,
            "Open",
            rootCause,
            null,
            inspection.Notes,
            GetUserId()));
        await DbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<InspectionRecord> LoadInspectionForWriteAsync(long id, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.InspectionRecords.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        return EnsureFound(entity, "Inspection was not found in the active scope.", "quality.inspection_not_found");
    }

    private async Task<long?> ResolveItemIdAsync(long companyId, long? itemId, string? itemCode, CancellationToken cancellationToken)
    {
        if (itemId.HasValue && itemId.Value > 0)
        {
            return itemId.Value;
        }

        if (string.IsNullOrWhiteSpace(itemCode))
        {
            return null;
        }

        var scope = GetScope();
        var item = await DbContext.Items.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.CompanyId == companyId && record.ItemCode == itemCode.Trim(), cancellationToken);

        item = EnsureFound(item, "Item code was not found in the active scope.", "master.item_not_found");
        return item.Id;
    }

    private async Task<Dictionary<long, IReadOnlyCollection<InspectionResultDto>>> LoadResultsAsync(IReadOnlyCollection<long> inspectionIds, CancellationToken cancellationToken)
    {
        if (inspectionIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<InspectionResultDto>>();
        }

        return await DbContext.InspectionResults.AsNoTracking()
            .Where(record => inspectionIds.Contains(record.InspectionRecordId))
            .OrderBy(record => record.LineNo)
            .GroupBy(record => record.InspectionRecordId)
            .ToDictionaryAsync(
                group => group.Key,
                group => (IReadOnlyCollection<InspectionResultDto>)group.Select(MapResult).ToArray(),
                cancellationToken);
    }

    private async Task<IReadOnlyCollection<WorkOrderOperation>> LoadWorkOrderOperationsAsync(long workOrderId, CancellationToken cancellationToken) =>
        await DbContext.WorkOrderOperations.Where(record => record.WorkOrderId == workOrderId).ToListAsync(cancellationToken);

    private static string ResolveOverallResult(string? requestedOverallResult, IReadOnlyCollection<InspectionResultRequest> results)
    {
        if (!string.IsNullOrWhiteSpace(requestedOverallResult))
        {
            return requestedOverallResult.Trim();
        }

        if (results.Any(result => string.Equals(result.ResultStatus, "Hold", StringComparison.OrdinalIgnoreCase)))
        {
            return "Hold";
        }

        if (results.Any(result => string.Equals(result.ResultStatus, "Fail", StringComparison.OrdinalIgnoreCase)))
        {
            return "Fail";
        }

        return "Pass";
    }

    private static void ValidatePlan(InspectionPlanUpsertRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.PlanCode, nameof(request.PlanCode), "Plan code is required."),
            Required(request.PlanName, nameof(request.PlanName), "Plan name is required."),
            Required(request.InspectionType, nameof(request.InspectionType), "Inspection type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));
    }

    private static void ValidateInspection(InspectionSaveRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.InspectionNo, nameof(request.InspectionNo), "Inspection number is required."),
            Required(request.InspectionType, nameof(request.InspectionType), "Inspection type is required."),
            Required(request.SourceDocumentType, nameof(request.SourceDocumentType), "Source document type is required."),
            request.Results.Count == 0 ? new ApiError("validation.required", nameof(request.Results), "At least one inspection result line is required.") : null);
    }

    private static void ValidateNcr(NonConformanceUpsertRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.NcrNo, nameof(request.NcrNo), "NCR number is required."),
            Required(request.SourceDocumentType, nameof(request.SourceDocumentType), "Source document type is required."),
            Required(request.Disposition, nameof(request.Disposition), "Disposition is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));
    }

    private static InspectionPlanDto MapPlan(InspectionPlan entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.PlanCode, entity.PlanName, entity.InspectionType, entity.ItemId, entity.OperationId, entity.AutoHoldOnFail, entity.AutoCreateNcrOnFail, entity.Status);

    private static InspectionResultDto MapResult(InspectionResult entity) =>
        new(entity.Id, entity.LineNo, entity.ParameterCode, entity.ExpectedValue, entity.ActualValue, entity.ResultStatus, entity.Remarks);

    private static InspectionDto MapInspection(InspectionRecord entity, IReadOnlyCollection<InspectionResultDto> results) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.InspectionNo, entity.InspectionPlanId, entity.InspectionType, entity.SourceDocumentType, entity.SourceDocumentId, entity.LotId, entity.SerialId, entity.Status, entity.OverallResult, entity.RequestToken, entity.Notes, entity.HeldOn, entity.ReleasedOn, results);

    private static NonConformanceDto MapNcr(NonConformance entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.NcrNo, entity.SourceDocumentType, entity.SourceDocumentId, entity.LotId, entity.SerialId, entity.Disposition, entity.Status, entity.RootCause, entity.ReworkOrderId, entity.Remarks);

    private static string ResolveWorkOrderStatus(IReadOnlyCollection<WorkOrderOperation> operations, string currentStatus)
    {
        if (operations.Count == 0)
        {
            return currentStatus;
        }

        if (operations.Any(record => record.Status.Equals("QC_Hold", StringComparison.OrdinalIgnoreCase)))
        {
            return "OnHold";
        }

        if (operations.All(record =>
                record.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
                record.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase)))
        {
            return "Completed";
        }

        if (operations.Any(record => record.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase)))
        {
            return "PartiallyCompleted";
        }

        if (operations.Any(record => record.Status.Equals("InProgress", StringComparison.OrdinalIgnoreCase)))
        {
            return "InProgress";
        }

        return currentStatus;
    }

    private static string BuildNcrNo(string inspectionNo)
    {
        var candidate = $"{inspectionNo.Trim()}-NCR";
        return candidate.Length <= 32 ? candidate : candidate[..32];
    }

    private static ActionResponse BuildActionResponse(InspectionRecord entity, params string[] warnings) =>
        new(entity.Id.ToString(CultureInfo.InvariantCulture), entity.Status, entity.InspectionNo, warnings.Where(warning => !string.IsNullOrWhiteSpace(warning)).ToArray());
}
