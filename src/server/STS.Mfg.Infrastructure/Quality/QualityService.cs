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
        var characteristics = await LoadPlanCharacteristicsAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapPlan(entity, characteristics.GetValueOrDefault(entity.Id, Array.Empty<InspectionPlanCharacteristicDto>())));
    }

    public async Task<InspectionPlanDto> GetInspectionPlanAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.InspectionPlans.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Inspection plan was not found in the active scope.", "quality.plan_not_found");
        var characteristics = await LoadPlanCharacteristicsAsync(new[] { id }, cancellationToken);
        return MapPlan(entity, characteristics.GetValueOrDefault(entity.Id, Array.Empty<InspectionPlanCharacteristicDto>()));
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
        await ReplacePlanCharacteristicsAsync(entity.Id, request.Characteristics ?? Array.Empty<InspectionPlanCharacteristicRequest>(), cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var characteristics = await LoadPlanCharacteristicsAsync(new[] { entity.Id }, cancellationToken);
        var dto = MapPlan(entity, characteristics.GetValueOrDefault(entity.Id, Array.Empty<InspectionPlanCharacteristicDto>()));
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

        var beforeCharacteristics = await LoadPlanCharacteristicsAsync(new[] { entity.Id }, cancellationToken);
        var before = MapPlan(entity, beforeCharacteristics.GetValueOrDefault(entity.Id, Array.Empty<InspectionPlanCharacteristicDto>()));
        entity.Update(request.PlanCode, request.PlanName, request.InspectionType, request.AutoHoldOnFail, request.AutoCreateNcrOnFail, request.Status, GetUserId());
        await ReplacePlanCharacteristicsAsync(entity.Id, request.Characteristics ?? Array.Empty<InspectionPlanCharacteristicRequest>(), cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var afterCharacteristics = await LoadPlanCharacteristicsAsync(new[] { entity.Id }, cancellationToken);
        var after = MapPlan(entity, afterCharacteristics.GetValueOrDefault(entity.Id, Array.Empty<InspectionPlanCharacteristicDto>()));
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
        var lines = await LoadNcrLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapNcr(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<NonConformanceLineDto>())));
    }

    public async Task<NonConformanceDto> GetNonConformanceAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.NonConformances.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "NCR was not found in the active scope.", "quality.ncr_not_found");
        var lines = await LoadNcrLinesAsync(new[] { id }, cancellationToken);
        return MapNcr(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<NonConformanceLineDto>()));
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
            request.DefectCategory,
            request.ContainmentAction,
            request.RootCause,
            request.CorrectiveAction,
            request.PreventiveAction,
            request.ReworkOrderId,
            request.Remarks,
            GetUserId());

        DbContext.NonConformances.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        await ReplaceNcrLinesAsync(entity.Id, request.Lines ?? Array.Empty<NonConformanceLineRequest>(), cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var lines = await LoadNcrLinesAsync(new[] { entity.Id }, cancellationToken);
        var dto = MapNcr(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<NonConformanceLineDto>()));
        await WriteAuditAsync("quality", nameof(NonConformance), "quality.ncr.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<NonConformanceDto> UpdateNonConformanceAsync(long id, NonConformanceUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateNcr(request);
        var scope = GetScope();
        var entity = await DbContext.NonConformances.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "NCR was not found in the active scope.", "quality.ncr_not_found");
        var beforeLines = await LoadNcrLinesAsync(new[] { entity.Id }, cancellationToken);
        var before = MapNcr(entity, beforeLines.GetValueOrDefault(entity.Id, Array.Empty<NonConformanceLineDto>()));
        entity.Update(request.NcrNo, request.SourceDocumentType, request.Disposition, request.Status, request.DefectCategory, request.ContainmentAction, request.RootCause, request.CorrectiveAction, request.PreventiveAction, request.Remarks, GetUserId());
        entity.LinkRework(request.ReworkOrderId, GetUserId());
        await ReplaceNcrLinesAsync(entity.Id, request.Lines ?? Array.Empty<NonConformanceLineRequest>(), cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var afterLines = await LoadNcrLinesAsync(new[] { entity.Id }, cancellationToken);
        var after = MapNcr(entity, afterLines.GetValueOrDefault(entity.Id, Array.Empty<NonConformanceLineDto>()));
        await WriteAuditAsync("quality", nameof(NonConformance), "quality.ncr.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<ActionResponse> ReleaseNonConformanceDispositionAsync(long id, NonConformanceDispositionRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDispositionRelease(request);
        var scope = GetScope();
        var entity = await DbContext.NonConformances.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "NCR was not found in the active scope.", "quality.ncr_not_found");
        if (string.Equals(entity.Status, "Closed", StringComparison.OrdinalIgnoreCase))
        {
            ThrowIfInvalid(new ApiError("quality.ncr_closed", nameof(id), "Closed NCR records cannot release a new disposition."));
        }

        var lines = await DbContext.NonConformanceLines.Where(record => record.NonConformanceId == entity.Id).ToListAsync(cancellationToken);
        ThrowIfInvalid(
            lines.Count == 0 ? new ApiError("validation.required", nameof(NonConformanceUpsertRequest.Lines), "At least one NCR affected line is required before disposition release.") : null,
            lines.Any(line => !line.AffectedQuantity.HasValue || line.AffectedQuantity <= 0)
                ? new ApiError("validation.required", nameof(NonConformanceLineRequest.AffectedQuantity), "Every NCR line must carry an affected quantity before disposition release.")
                : null);

        var before = MapNcr(entity, lines.Select(MapNcrLine).ToArray());
        entity.ReleaseDisposition(request.Disposition, request.ContainmentAction, request.RootCause, request.CorrectiveAction, request.PreventiveAction, request.Remarks, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapNcr(entity, lines.Select(MapNcrLine).ToArray());
        await WriteAuditAsync("quality", nameof(NonConformance), "quality.ncr.disposition.release", entity.Id, before, after, cancellationToken);
        return new ActionResponse(entity.Id.ToString(CultureInfo.InvariantCulture), entity.Status, entity.NcrNo, Array.Empty<string>());
    }

    public async Task<ActionResponse> CloseNonConformanceAsync(long id, NonConformanceActionRequest? request, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.NonConformances.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "NCR was not found in the active scope.", "quality.ncr_not_found");
        entity.Close(request?.Remarks, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var lines = await LoadNcrLinesAsync(new[] { entity.Id }, cancellationToken);
        var after = MapNcr(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<NonConformanceLineDto>()));
        await WriteAuditAsync("quality", nameof(NonConformance), "quality.ncr.close", entity.Id, null, after, cancellationToken);
        return new ActionResponse(entity.Id.ToString(CultureInfo.InvariantCulture), entity.Status, entity.NcrNo, Array.Empty<string>());
    }

    public async Task<PagedResult<CoaCertificateDto>> ListCoaCertificatesAsync(CoaCertificateFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.CoaCertificates.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.InspectionRecordId.HasValue)
        {
            query = query.Where(entity => entity.InspectionRecordId == filter.InspectionRecordId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.CoaNo.Contains(search) || entity.TemplateCode.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.GeneratedOn).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        var lines = await LoadCoaLinesAsync(page.Items.Select(entity => entity.Id).ToArray(), cancellationToken);
        return MapPage(page, entity => MapCoa(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<CoaCertificateLineDto>())));
    }

    public async Task<CoaCertificateDto> GetCoaCertificateAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.CoaCertificates.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "COA certificate was not found in the active scope.", "quality.coa_not_found");
        var lines = await LoadCoaLinesAsync(new[] { id }, cancellationToken);
        return MapCoa(entity, lines.GetValueOrDefault(entity.Id, Array.Empty<CoaCertificateLineDto>()));
    }

    public async Task<CoaCertificateDto> GenerateCoaCertificateAsync(CoaGenerateRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCoaGenerate(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var scope = GetScope();
        var inspection = await DbContext.InspectionRecords.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == request.InspectionRecordId, cancellationToken);

        inspection = EnsureFound(inspection, "Inspection was not found in the active scope.", "quality.inspection_not_found");
        ThrowIfInvalid(
            !string.Equals(inspection.InspectionType, "Final", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("quality.coa_final_required", nameof(request.InspectionRecordId), "COA can be generated only from final inspection evidence.")
                : null,
            !(string.Equals(inspection.OverallResult, "Pass", StringComparison.OrdinalIgnoreCase) ||
              string.Equals(inspection.Status, "Released", StringComparison.OrdinalIgnoreCase) ||
              string.Equals(inspection.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                ? new ApiError("quality.coa_approved_required", nameof(request.InspectionRecordId), "COA generation requires approved or released passing inspection results.")
                : null);

        var resultLines = await DbContext.InspectionResults.AsNoTracking()
            .Where(record => record.InspectionRecordId == inspection.Id)
            .OrderBy(record => record.LineNo)
            .ToListAsync(cancellationToken);

        ThrowIfInvalid(resultLines.Count == 0
            ? new ApiError("validation.required", nameof(InspectionDto.Results), "COA generation requires inspection result lines.")
            : null);

        var latestVersion = await DbContext.CoaCertificates.AsNoTracking()
            .Where(record => record.CompanyId == request.CompanyId && record.CoaNo == request.CoaNo.Trim())
            .Select(record => (int?)record.VersionNo)
            .MaxAsync(cancellationToken) ?? 0;

        var version = latestVersion + 1;
        var storagePath = BuildCoaStoragePath(request.CompanyId, request.BranchId, request.CoaNo, version);
        var entity = CoaCertificate.Create(
            request.CompanyId,
            request.BranchId,
            request.CoaNo,
            inspection.Id,
            inspection.SourceDocumentType,
            inspection.SourceDocumentId,
            inspection.LotId,
            inspection.SerialId,
            request.TemplateCode,
            version,
            storagePath,
            request.IssueImmediately ? "Issued" : "Generated",
            request.ReissueReason,
            GetUserId());

        DbContext.CoaCertificates.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        DbContext.CoaCertificateLines.AddRange(resultLines.Select(line =>
            CoaCertificateLine.Create(entity.Id, line.LineNo, line.ParameterCode, line.ExpectedValue, line.ActualValue, line.ResultStatus, line.Remarks, GetUserId())));

        if (request.IssueImmediately)
        {
            entity.MarkIssued(GetUserId());
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = await GetCoaCertificateAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("quality", nameof(CoaCertificate), version == 1 ? "quality.coa.generate" : "quality.coa.reissue", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<CoaCertificateDto> ReissueCoaCertificateAsync(long id, CoaReissueRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(Required(request.ReissueReason, nameof(request.ReissueReason), "COA reissue reason is required."));
        var existing = await GetCoaCertificateAsync(id, cancellationToken);
        return await GenerateCoaCertificateAsync(
            new CoaGenerateRequest(
                existing.CompanyId,
                existing.BranchId,
                existing.InspectionRecordId,
                existing.CoaNo,
                string.IsNullOrWhiteSpace(request.TemplateCode) ? existing.TemplateCode : request.TemplateCode,
                request.IssueImmediately,
                request.ReissueReason),
            cancellationToken);
    }

    public async Task<ActionResponse> IssueCoaCertificateAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.CoaCertificates.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "COA certificate was not found in the active scope.", "quality.coa_not_found");
        if (!string.Equals(entity.Status, "Issued", StringComparison.OrdinalIgnoreCase))
        {
            entity.MarkIssued(GetUserId());
            await DbContext.SaveChangesAsync(cancellationToken);
            var after = await GetCoaCertificateAsync(entity.Id, cancellationToken);
            await WriteAuditAsync("quality", nameof(CoaCertificate), "quality.coa.issue", entity.Id, null, after, cancellationToken);
        }

        return new ActionResponse(entity.Id.ToString(CultureInfo.InvariantCulture), entity.Status, entity.CoaNo, Array.Empty<string>());
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
            existing.Update(existing.NcrNo, existing.SourceDocumentType, disposition, existing.Status, existing.DefectCategory, existing.ContainmentAction, rootCause ?? existing.RootCause, existing.CorrectiveAction, existing.PreventiveAction, existing.Remarks, GetUserId());
            return;
        }

        var ncr = NonConformance.Create(
            inspection.CompanyId ?? 0,
            inspection.BranchId ?? 0,
            string.IsNullOrWhiteSpace(ncrNo) ? BuildNcrNo(inspection.InspectionNo) : ncrNo,
            inspection.SourceDocumentType,
            inspection.SourceDocumentId,
            inspection.LotId,
            inspection.SerialId,
            disposition,
            "Open",
            "Inspection failure",
            inspection.Notes,
            rootCause,
            null,
            null,
            null,
            inspection.Notes,
            GetUserId());
        DbContext.NonConformances.Add(ncr);
        await DbContext.SaveChangesAsync(cancellationToken);

        var failedLines = await DbContext.InspectionResults.AsNoTracking()
            .Where(record => record.InspectionRecordId == inspection.Id && (record.ResultStatus == "Fail" || record.ResultStatus == "Hold"))
            .OrderBy(record => record.LineNo)
            .ToListAsync(cancellationToken);

        if (failedLines.Count > 0)
        {
            DbContext.NonConformanceLines.AddRange(failedLines.Select((line, index) =>
                NonConformanceLine.Create(
                    ncr.Id,
                    (index + 1) * 10,
                    null,
                    null,
                    inspection.LotId,
                    inspection.SerialId,
                    null,
                    null,
                    line.ParameterCode,
                    line.Remarks ?? line.ActualValue ?? line.ParameterCode,
                    disposition,
                    inspection.Notes,
                    GetUserId())));
        }
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

    private async Task<Dictionary<long, IReadOnlyCollection<InspectionPlanCharacteristicDto>>> LoadPlanCharacteristicsAsync(IReadOnlyCollection<long> planIds, CancellationToken cancellationToken)
    {
        if (planIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<InspectionPlanCharacteristicDto>>();
        }

        return await DbContext.InspectionPlanCharacteristics.AsNoTracking()
            .Where(record => planIds.Contains(record.InspectionPlanId))
            .OrderBy(record => record.LineNo)
            .GroupBy(record => record.InspectionPlanId)
            .ToDictionaryAsync(
                group => group.Key,
                group => (IReadOnlyCollection<InspectionPlanCharacteristicDto>)group.Select(MapPlanCharacteristic).ToArray(),
                cancellationToken);
    }

    private async Task ReplacePlanCharacteristicsAsync(long planId, IReadOnlyCollection<InspectionPlanCharacteristicRequest> requested, CancellationToken cancellationToken)
    {
        var existing = await DbContext.InspectionPlanCharacteristics.Where(record => record.InspectionPlanId == planId).ToListAsync(cancellationToken);
        DbContext.InspectionPlanCharacteristics.RemoveRange(existing);

        if (requested.Count == 0)
        {
            return;
        }

        ValidatePlanCharacteristics(requested);
        DbContext.InspectionPlanCharacteristics.AddRange(requested
            .OrderBy(record => record.LineNo)
            .Select(record => InspectionPlanCharacteristic.Create(
                planId,
                record.LineNo,
                record.ParameterCode,
                record.ParameterName,
                record.CharacteristicType,
                record.ExpectedValue,
                record.LowerLimit,
                record.UpperLimit,
                record.UomId,
                record.SampleSize,
                record.IsMandatory,
                record.Status,
                record.Remarks,
                GetUserId())));
    }

    private async Task<Dictionary<long, IReadOnlyCollection<NonConformanceLineDto>>> LoadNcrLinesAsync(IReadOnlyCollection<long> ncrIds, CancellationToken cancellationToken)
    {
        if (ncrIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<NonConformanceLineDto>>();
        }

        return await DbContext.NonConformanceLines.AsNoTracking()
            .Where(record => ncrIds.Contains(record.NonConformanceId))
            .OrderBy(record => record.LineNo)
            .GroupBy(record => record.NonConformanceId)
            .ToDictionaryAsync(
                group => group.Key,
                group => (IReadOnlyCollection<NonConformanceLineDto>)group.Select(MapNcrLine).ToArray(),
                cancellationToken);
    }

    private async Task ReplaceNcrLinesAsync(long ncrId, IReadOnlyCollection<NonConformanceLineRequest> requested, CancellationToken cancellationToken)
    {
        var existing = await DbContext.NonConformanceLines.Where(record => record.NonConformanceId == ncrId).ToListAsync(cancellationToken);
        DbContext.NonConformanceLines.RemoveRange(existing);

        if (requested.Count == 0)
        {
            return;
        }

        ValidateNcrLines(requested);
        DbContext.NonConformanceLines.AddRange(requested
            .OrderBy(record => record.LineNo)
            .Select(record => NonConformanceLine.Create(
                ncrId,
                record.LineNo,
                record.ItemId,
                record.ItemRevisionId,
                record.LotId,
                record.SerialId,
                record.AffectedQuantity,
                record.UomId,
                record.DefectCode,
                record.DefectDescription,
                record.Disposition,
                record.Remarks,
                GetUserId())));
    }

    private async Task<Dictionary<long, IReadOnlyCollection<CoaCertificateLineDto>>> LoadCoaLinesAsync(IReadOnlyCollection<long> coaIds, CancellationToken cancellationToken)
    {
        if (coaIds.Count == 0)
        {
            return new Dictionary<long, IReadOnlyCollection<CoaCertificateLineDto>>();
        }

        return await DbContext.CoaCertificateLines.AsNoTracking()
            .Where(record => coaIds.Contains(record.CoaCertificateId))
            .OrderBy(record => record.LineNo)
            .GroupBy(record => record.CoaCertificateId)
            .ToDictionaryAsync(
                group => group.Key,
                group => (IReadOnlyCollection<CoaCertificateLineDto>)group.Select(MapCoaLine).ToArray(),
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

    private static void ValidatePlanCharacteristics(IReadOnlyCollection<InspectionPlanCharacteristicRequest> records)
    {
        ThrowIfInvalid(records.SelectMany((record, index) => new[]
        {
            record.LineNo <= 0 ? new ApiError("validation.out_of_range", $"{nameof(InspectionPlanUpsertRequest.Characteristics)}[{index}].{nameof(record.LineNo)}", "Characteristic line number must be positive.") : null,
            Required(record.ParameterCode, $"{nameof(InspectionPlanUpsertRequest.Characteristics)}[{index}].{nameof(record.ParameterCode)}", "Characteristic parameter code is required."),
            Required(record.ParameterName, $"{nameof(InspectionPlanUpsertRequest.Characteristics)}[{index}].{nameof(record.ParameterName)}", "Characteristic parameter name is required."),
            Required(record.CharacteristicType, $"{nameof(InspectionPlanUpsertRequest.Characteristics)}[{index}].{nameof(record.CharacteristicType)}", "Characteristic type is required."),
            record.SampleSize <= 0 ? new ApiError("validation.out_of_range", $"{nameof(InspectionPlanUpsertRequest.Characteristics)}[{index}].{nameof(record.SampleSize)}", "Sample size must be positive.") : null,
            Required(record.Status, $"{nameof(InspectionPlanUpsertRequest.Characteristics)}[{index}].{nameof(record.Status)}", "Characteristic status is required.")
        }));
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

    private static void ValidateNcrLines(IReadOnlyCollection<NonConformanceLineRequest> records)
    {
        ThrowIfInvalid(records.SelectMany((record, index) => new[]
        {
            record.LineNo <= 0 ? new ApiError("validation.out_of_range", $"{nameof(NonConformanceUpsertRequest.Lines)}[{index}].{nameof(record.LineNo)}", "NCR line number must be positive.") : null,
            Required(record.DefectCode, $"{nameof(NonConformanceUpsertRequest.Lines)}[{index}].{nameof(record.DefectCode)}", "NCR defect code is required."),
            Required(record.DefectDescription, $"{nameof(NonConformanceUpsertRequest.Lines)}[{index}].{nameof(record.DefectDescription)}", "NCR defect description is required."),
            Required(record.Disposition, $"{nameof(NonConformanceUpsertRequest.Lines)}[{index}].{nameof(record.Disposition)}", "NCR line disposition is required."),
            record.AffectedQuantity.HasValue && record.AffectedQuantity <= 0
                ? new ApiError("validation.out_of_range", $"{nameof(NonConformanceUpsertRequest.Lines)}[{index}].{nameof(record.AffectedQuantity)}", "Affected quantity must be positive when provided.")
                : null
        }));
    }

    private static void ValidateDispositionRelease(NonConformanceDispositionRequest request)
    {
        ThrowIfInvalid(
            Required(request.Disposition, nameof(request.Disposition), "Disposition is required before release."),
            Required(request.RootCause, nameof(request.RootCause), "Root cause is required before disposition release."),
            Required(request.ContainmentAction, nameof(request.ContainmentAction), "Containment action is required before disposition release."));
    }

    private static void ValidateCoaGenerate(CoaGenerateRequest request)
    {
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Positive(request.InspectionRecordId, nameof(request.InspectionRecordId), "Inspection is required."),
            Required(request.CoaNo, nameof(request.CoaNo), "COA number is required."),
            Required(request.TemplateCode, nameof(request.TemplateCode), "COA template code is required."));
    }

    private static InspectionPlanDto MapPlan(InspectionPlan entity, IReadOnlyCollection<InspectionPlanCharacteristicDto> characteristics) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.PlanCode, entity.PlanName, entity.InspectionType, entity.ItemId, entity.OperationId, entity.AutoHoldOnFail, entity.AutoCreateNcrOnFail, entity.Status, characteristics);

    private static InspectionPlanCharacteristicDto MapPlanCharacteristic(InspectionPlanCharacteristic entity) =>
        new(entity.Id, entity.LineNo, entity.ParameterCode, entity.ParameterName, entity.CharacteristicType, entity.ExpectedValue, entity.LowerLimit, entity.UpperLimit, entity.UomId, entity.SampleSize, entity.IsMandatory, entity.Status, entity.Remarks);

    private static InspectionResultDto MapResult(InspectionResult entity) =>
        new(entity.Id, entity.LineNo, entity.ParameterCode, entity.ExpectedValue, entity.ActualValue, entity.ResultStatus, entity.Remarks);

    private static InspectionDto MapInspection(InspectionRecord entity, IReadOnlyCollection<InspectionResultDto> results) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.InspectionNo, entity.InspectionPlanId, entity.InspectionType, entity.SourceDocumentType, entity.SourceDocumentId, entity.LotId, entity.SerialId, entity.Status, entity.OverallResult, entity.RequestToken, entity.Notes, entity.HeldOn, entity.ReleasedOn, results);

    private static NonConformanceDto MapNcr(NonConformance entity, IReadOnlyCollection<NonConformanceLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.NcrNo, entity.SourceDocumentType, entity.SourceDocumentId, entity.LotId, entity.SerialId, entity.Disposition, entity.Status, entity.DefectCategory, entity.ContainmentAction, entity.RootCause, entity.CorrectiveAction, entity.PreventiveAction, entity.DispositionReleasedOn, entity.DispositionReleasedByUserId, entity.ClosedOn, entity.ClosedByUserId, entity.ReworkOrderId, entity.Remarks, lines);

    private static NonConformanceLineDto MapNcrLine(NonConformanceLine entity) =>
        new(entity.Id, entity.LineNo, entity.ItemId, entity.ItemRevisionId, entity.LotId, entity.SerialId, entity.AffectedQuantity, entity.UomId, entity.DefectCode, entity.DefectDescription, entity.Disposition, entity.Remarks);

    private static CoaCertificateDto MapCoa(CoaCertificate entity, IReadOnlyCollection<CoaCertificateLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.CoaNo, entity.InspectionRecordId, entity.SourceDocumentType, entity.SourceDocumentId, entity.LotId, entity.SerialId, entity.TemplateCode, entity.VersionNo, entity.StoragePath, entity.Status, entity.GeneratedOn, entity.GeneratedByUserId, entity.IssuedOn, entity.IssuedByUserId, entity.ReissueReason, lines);

    private static CoaCertificateLineDto MapCoaLine(CoaCertificateLine entity) =>
        new(entity.Id, entity.LineNo, entity.ParameterCode, entity.ExpectedValue, entity.ActualValue, entity.ResultStatus, entity.Remarks);

    private static string BuildCoaStoragePath(long companyId, long branchId, string coaNo, int version)
    {
        var safeCoaNo = string.Concat(coaNo.Trim().Select(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' ? ch : '-'));
        return $"quality/coa/company-{companyId}/branch-{branchId}/{safeCoaNo}-v{version}.json";
    }

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
