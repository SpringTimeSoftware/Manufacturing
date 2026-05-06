using System.Globalization;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Production;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Domain.Production;
using STS.Mfg.Domain.Resources;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Production;

internal sealed class JobCardService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IJobCardService
{
    public async Task<PagedResult<JobCardSummaryDto>> ListJobCardsAsync(JobCardFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query =
            from jobCard in DbContext.JobCards.AsNoTracking().ApplyActiveOrganizationScope(scope)
            join workOrder in DbContext.WorkOrders.AsNoTracking() on jobCard.WorkOrderId equals workOrder.Id
            join operation in DbContext.WorkOrderOperations.AsNoTracking() on jobCard.WorkOrderOperationId equals operation.Id
            select new JobCardListRow(
                jobCard.Id,
                jobCard.CompanyId ?? 0,
                jobCard.BranchId ?? 0,
                jobCard.JobCardNo,
                jobCard.WorkOrderId,
                workOrder.WorkOrderNo,
                jobCard.WorkOrderOperationId,
                operation.OperationId,
                jobCard.SplitSequenceNo,
                jobCard.AssignedMachineId,
                jobCard.AssignedOperatorUserId,
                jobCard.ShiftId,
                jobCard.PlannedQuantity,
                jobCard.CompletedGoodQty,
                jobCard.CompletedRejectQty,
                jobCard.CompletedScrapQty,
                jobCard.Status,
                jobCard.CreatedOn);

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

        if (filter.WorkOrderOperationId.HasValue)
        {
            query = query.Where(entity => entity.WorkOrderOperationId == filter.WorkOrderOperationId.Value);
        }

        if (filter.MachineId.HasValue)
        {
            query = query.Where(entity => entity.AssignedMachineId == filter.MachineId.Value);
        }

        if (filter.OperatorUserId.HasValue)
        {
            query = query.Where(entity => entity.AssignedOperatorUserId == filter.OperatorUserId.Value);
        }

        if (filter.ShiftId.HasValue)
        {
            query = query.Where(entity => entity.ShiftId == filter.ShiftId.Value);
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
            query = query.Where(entity =>
                entity.JobCardNo.Contains(search) ||
                entity.WorkOrderNo.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.CreatedOn)
            .ThenBy(entity => entity.JobCardNo)
            .ToPagedResultAsync(filter, cancellationToken);

        return MapPage(page, MapSummary);
    }

    public async Task<JobCardDto> GetJobCardAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var projection = await (
            from jobCard in DbContext.JobCards.AsNoTracking().ApplyActiveOrganizationScope(scope)
            join workOrder in DbContext.WorkOrders.AsNoTracking() on jobCard.WorkOrderId equals workOrder.Id
            join operation in DbContext.WorkOrderOperations.AsNoTracking() on jobCard.WorkOrderOperationId equals operation.Id
            where jobCard.Id == id
            select new JobCardDetailRow(
                jobCard.Id,
                jobCard.CompanyId ?? 0,
                jobCard.BranchId ?? 0,
                jobCard.JobCardNo,
                jobCard.WorkOrderId,
                workOrder.WorkOrderNo,
                jobCard.WorkOrderOperationId,
                operation.OperationId,
                jobCard.ParentJobCardId,
                jobCard.SplitSequenceNo,
                jobCard.AssignedMachineId,
                jobCard.AssignedOperatorUserId,
                jobCard.ShiftId,
                jobCard.PlannedQuantity,
                jobCard.CompletedGoodQty,
                jobCard.CompletedRejectQty,
                jobCard.CompletedScrapQty,
                jobCard.Status))
            .FirstOrDefaultAsync(cancellationToken);

        projection = EnsureFound(projection, "Job card was not found in the active scope.", "job_card.not_found");
        var events = await LoadEventsAsync(new[] { id }, cancellationToken);
        var downtimes = await LoadDowntimesAsync(new[] { id }, cancellationToken);

        return MapDetail(
            projection,
            events.GetValueOrDefault(id, Array.Empty<JobCardEventDto>()),
            downtimes.GetValueOrDefault(id, Array.Empty<DowntimeEventDto>()));
    }

    public async Task<IReadOnlyCollection<JobCardDto>> CreateForWorkOrderAsync(CreateJobCardsRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(
            Positive(request.WorkOrderId, nameof(request.WorkOrderId), "Work order is required."));

        var scope = GetScope();
        var workOrder = await DbContext.WorkOrders
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == request.WorkOrderId, cancellationToken);

        workOrder = EnsureFound(workOrder, "Work order was not found in the active scope.", "work_order.not_found");
        var operations = await DbContext.WorkOrderOperations
            .Where(record => record.WorkOrderId == workOrder.Id)
            .OrderBy(record => record.SequenceNo)
            .ToListAsync(cancellationToken);

        if (operations.Count == 0)
        {
            throw CreateBusinessRule(
                "Work order does not have released operations to create job cards from.",
                "job_card.operations_missing",
                new ApiError("job_card.operations_missing", nameof(request.WorkOrderId), "Create and release work-order operations before generating job cards."));
        }

        var existing = await DbContext.JobCards
            .Where(record => record.WorkOrderId == workOrder.Id)
            .OrderBy(record => record.JobCardNo)
            .ToListAsync(cancellationToken);

        if (existing.Count > 0 && !request.RegenerateIfExists)
        {
            return await LoadJobCardsAsync(existing.Select(record => record.Id).ToArray(), cancellationToken);
        }

        if (existing.Count > 0)
        {
            var lockedStates = existing.Where(record => !CanRegenerate(record)).Select(record => record.JobCardNo).ToArray();
            if (lockedStates.Length > 0)
            {
                throw CreateBusinessRule(
                    "Existing job cards already moved past the pre-start states and cannot be regenerated.",
                    "job_card.regeneration_blocked",
                    new ApiError("job_card.regeneration_blocked", nameof(request.RegenerateIfExists), $"These job cards cannot be regenerated: {string.Join(", ", lockedStates)}."));
            }

            var existingIds = existing.Select(record => record.Id).ToArray();
            var existingEvents = await DbContext.JobCardEvents.Where(record => existingIds.Contains(record.JobCardId)).ToListAsync(cancellationToken);
            var existingDowntimes = await DbContext.DowntimeEvents.Where(record => existingIds.Contains(record.JobCardId)).ToListAsync(cancellationToken);
            DbContext.DowntimeEvents.RemoveRange(existingDowntimes);
            DbContext.JobCardEvents.RemoveRange(existingEvents);
            DbContext.JobCards.RemoveRange(existing);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var userId = GetUserId();
        var createdOn = DateTimeOffset.UtcNow;
        var jobCards = new List<JobCard>();

        foreach (var operation in operations)
        {
            jobCards.Add(JobCard.Create(
                workOrder.CompanyId ?? 0,
                workOrder.BranchId ?? 0,
                BuildJobCardNo(workOrder.WorkOrderNo, operation.SequenceNo, 1),
                workOrder.Id,
                operation.Id,
                null,
                1,
                null,
                null,
                null,
                operation.PlannedQuantity,
                0m,
                0m,
                0m,
                "Created",
                userId));
        }

        DbContext.JobCards.AddRange(jobCards);
        await DbContext.SaveChangesAsync(cancellationToken);

        var events = jobCards.Select(jobCard =>
            JobCardEvent.Create(
                workOrder.CompanyId ?? 0,
                workOrder.BranchId ?? 0,
                jobCard.Id,
                "Created",
                null,
                null,
                createdOn,
                null,
                null,
                "Generated from work-order operations.",
                userId))
            .ToArray();

        DbContext.JobCardEvents.AddRange(events);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = await LoadJobCardsAsync(jobCards.Select(record => record.Id).ToArray(), cancellationToken);
        await WriteAuditAsync("production", nameof(JobCard), "job-card.create-for-wo", jobCards[0].Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ActionResponse> AssignAsync(long jobCardId, JobCardAssignRequest request, CancellationToken cancellationToken = default)
    {
        var context = await LoadJobCardContextForWriteAsync(jobCardId, cancellationToken);
        EnsureTransitionAllowed(context.JobCard, new[] { "Created", "Assigned", "Paused" }, "assign");

        var effectiveMachineId = request.MachineId ?? context.JobCard.AssignedMachineId;
        var effectiveOperatorUserId = request.OperatorUserId ?? context.JobCard.AssignedOperatorUserId;
        var effectiveShiftId = request.ShiftId ?? context.JobCard.ShiftId;

        ThrowIfInvalid(
            !effectiveMachineId.HasValue && !effectiveOperatorUserId.HasValue && !effectiveShiftId.HasValue
                ? new ApiError("validation.required", nameof(request.MachineId), "Assignment requires a machine, operator, shift, or existing assignment context.")
                : null,
            effectiveOperatorUserId.HasValue && effectiveOperatorUserId.Value <= 0
                ? new ApiError("validation.out_of_range", nameof(request.OperatorUserId), "Operator user is invalid.")
                : null);

        if (context.JobCard.Status.Equals("Assigned", StringComparison.OrdinalIgnoreCase) &&
            context.JobCard.AssignedMachineId == effectiveMachineId &&
            context.JobCard.AssignedOperatorUserId == effectiveOperatorUserId &&
            context.JobCard.ShiftId == effectiveShiftId)
        {
            return BuildActionResponse(context.JobCard, "Job card assignment already matches the requested machine, operator, and shift.");
        }

        if (effectiveMachineId.HasValue)
        {
            await EnsureMachineCanBeUsedAsync(context, effectiveMachineId.Value, cancellationToken);
        }

        if (effectiveShiftId.HasValue)
        {
            await EnsureShiftCanBeUsedAsync(context, effectiveShiftId.Value, cancellationToken);
        }

        var before = await GetJobCardAsync(jobCardId, cancellationToken);
        context.JobCard.Assign(effectiveMachineId, effectiveOperatorUserId, effectiveShiftId, "Assigned", GetUserId());
        DbContext.JobCardEvents.Add(BuildEvent(context, "Assigned", effectiveMachineId, effectiveOperatorUserId, DateTimeOffset.UtcNow, null, null, request.Remarks));
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetJobCardAsync(jobCardId, cancellationToken);
        await WriteAuditAsync("production", nameof(JobCard), "job-card.assign", context.JobCard.Id, before, after, cancellationToken);
        return BuildActionResponse(context.JobCard);
    }

    public async Task<ActionResponse> StartAsync(long jobCardId, JobCardStartRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(
            Positive(request.MachineId, nameof(request.MachineId), "Machine is required."),
            Positive(request.OperatorUserId, nameof(request.OperatorUserId), "Operator user is required."));

        var context = await LoadJobCardContextForWriteAsync(jobCardId, cancellationToken);
        EnsureOperationCanExecute(context.Operation, "start");

        if (context.JobCard.Status.Equals("Started", StringComparison.OrdinalIgnoreCase))
        {
            if (context.JobCard.AssignedMachineId == request.MachineId && context.JobCard.AssignedOperatorUserId == request.OperatorUserId)
            {
                return BuildActionResponse(context.JobCard, "Job card is already started on the requested machine and operator context.");
            }

            throw CreateBusinessRule(
                "Job card is already started in a different execution context.",
                "job_card.already_started",
                new ApiError("job_card.already_started", nameof(jobCardId), "Pause the current execution before starting the job card with a different machine or operator."));
        }

        EnsureTransitionAllowed(context.JobCard, new[] { "Assigned" }, "start");
        await EnsureMachineCanBeUsedAsync(context, request.MachineId, cancellationToken);
        await EnsureMachineAvailabilityAsync(context, request.MachineId, cancellationToken);

        var before = await GetJobCardAsync(jobCardId, cancellationToken);
        context.JobCard.Start(request.MachineId, request.OperatorUserId, "Started", GetUserId());
        context.Operation.SetStatus("InProgress", GetUserId());
        context.WorkOrder.SetExecutionStatus("InProgress", request.Remarks, GetUserId());
        DbContext.JobCardEvents.Add(BuildEvent(
            context,
            "Started",
            request.MachineId,
            request.OperatorUserId,
            request.EventOn ?? DateTimeOffset.UtcNow,
            null,
            null,
            request.Remarks));
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetJobCardAsync(jobCardId, cancellationToken);
        await WriteAuditAsync("production", nameof(JobCard), "job-card.start", context.JobCard.Id, before, after, cancellationToken);
        return BuildActionResponse(context.JobCard);
    }

    public async Task<ActionResponse> PauseAsync(long jobCardId, JobCardPauseRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(
            Required(request.ReasonCode, nameof(request.ReasonCode), "Pause reason is required."));

        var context = await LoadJobCardContextForWriteAsync(jobCardId, cancellationToken);
        if (context.JobCard.Status.Equals("Paused", StringComparison.OrdinalIgnoreCase))
        {
            return BuildActionResponse(context.JobCard, "Job card is already paused.");
        }

        EnsureTransitionAllowed(context.JobCard, new[] { "Started" }, "pause");
        var before = await GetJobCardAsync(jobCardId, cancellationToken);
        context.JobCard.SetStatus("Paused", GetUserId());
        DbContext.JobCardEvents.Add(BuildEvent(
            context,
            "Paused",
            context.JobCard.AssignedMachineId,
            context.JobCard.AssignedOperatorUserId,
            DateTimeOffset.UtcNow,
            null,
            request.ReasonCode,
            request.Remarks));
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetJobCardAsync(jobCardId, cancellationToken);
        await WriteAuditAsync("production", nameof(JobCard), "job-card.pause", context.JobCard.Id, before, after, cancellationToken);
        return BuildActionResponse(context.JobCard);
    }

    public async Task<ActionResponse> ResumeAsync(long jobCardId, JobCardResumeRequest request, CancellationToken cancellationToken = default)
    {
        var context = await LoadJobCardContextForWriteAsync(jobCardId, cancellationToken);
        var effectiveMachineId = request.MachineId ?? context.JobCard.AssignedMachineId;
        var effectiveOperatorUserId = request.OperatorUserId ?? context.JobCard.AssignedOperatorUserId;

        ThrowIfInvalid(
            !effectiveMachineId.HasValue ? new ApiError("validation.required", nameof(request.MachineId), "Machine is required to resume a paused job card.") : null,
            !effectiveOperatorUserId.HasValue ? new ApiError("validation.required", nameof(request.OperatorUserId), "Operator user is required to resume a paused job card.") : null);

        EnsureOperationCanExecute(context.Operation, "resume");

        if (context.JobCard.Status.Equals("Started", StringComparison.OrdinalIgnoreCase) &&
            context.JobCard.AssignedMachineId == effectiveMachineId &&
            context.JobCard.AssignedOperatorUserId == effectiveOperatorUserId)
        {
            return BuildActionResponse(context.JobCard, "Job card is already running on the requested machine and operator context.");
        }

        EnsureTransitionAllowed(context.JobCard, new[] { "Paused" }, "resume");
        await EnsureMachineCanBeUsedAsync(context, effectiveMachineId!.Value, cancellationToken);
        await EnsureMachineAvailabilityAsync(context, effectiveMachineId.Value, cancellationToken);

        var before = await GetJobCardAsync(jobCardId, cancellationToken);
        context.JobCard.Start(effectiveMachineId.Value, effectiveOperatorUserId!.Value, "Started", GetUserId());
        context.Operation.SetStatus("InProgress", GetUserId());
        context.WorkOrder.SetExecutionStatus(
            ResolveWorkOrderStatus(await LoadWorkOrderOperationsAsync(context.WorkOrder.Id, cancellationToken), context.WorkOrder.Status),
            request.Remarks,
            GetUserId());
        DbContext.JobCardEvents.Add(BuildEvent(
            context,
            "Resumed",
            effectiveMachineId.Value,
            effectiveOperatorUserId.Value,
            DateTimeOffset.UtcNow,
            null,
            null,
            request.Remarks));
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetJobCardAsync(jobCardId, cancellationToken);
        await WriteAuditAsync("production", nameof(JobCard), "job-card.resume", context.JobCard.Id, before, after, cancellationToken);
        return BuildActionResponse(context.JobCard);
    }

    public async Task<JobCardQuantityResultDto> LogQuantityAsync(long jobCardId, JobCardQuantityRequest request, CancellationToken cancellationToken = default)
    {
        ValidateQuantityRequest(request);
        var context = await LoadJobCardContextForWriteAsync(jobCardId, cancellationToken);
        EnsureTransitionAllowed(context.JobCard, new[] { "Started" }, "log quantities");

        var currentCardTotal = GetTotalProcessed(context.JobCard);
        var nextCardTotal = currentCardTotal + request.GoodQty + request.RejectQty + request.ScrapQty;
        var otherOperationTotal = await GetOtherProcessedQuantityAsync(context.JobCard.WorkOrderOperationId, context.JobCard.Id, cancellationToken);
        var nextOperationTotal = otherOperationTotal + nextCardTotal;

        if (nextCardTotal > context.JobCard.PlannedQuantity)
        {
            throw CreateBusinessRule(
                "Posted quantities exceed the job-card planned quantity.",
                "job_card.qty_exceeds_card",
                new ApiError("job_card.qty_exceeds_card", nameof(request.GoodQty), "Reduce the posted quantity so the job card stays within its planned quantity."));
        }

        if (nextOperationTotal > context.Operation.PlannedQuantity)
        {
            throw CreateBusinessRule(
                "Posted quantities exceed the work-order operation allowable quantity.",
                "job_card.qty_exceeds_operation",
                new ApiError("job_card.qty_exceeds_operation", nameof(request.GoodQty), "Reduce the posted quantity so the operation stays within its planned quantity."));
        }

        var before = await GetJobCardAsync(jobCardId, cancellationToken);
        context.JobCard.LogQuantities(request.GoodQty, request.RejectQty, request.ScrapQty, GetUserId());
        context.Operation.UpdateExecutionProgress(nextOperationTotal, "InProgress", GetUserId());
        context.WorkOrder.SetExecutionStatus(
            ResolveWorkOrderStatus(await LoadWorkOrderOperationsAsync(context.WorkOrder.Id, cancellationToken), "InProgress"),
            request.Remarks,
            GetUserId());

        DbContext.JobCardEvents.Add(BuildEvent(
            context,
            "QtyLogged",
            context.JobCard.AssignedMachineId,
            context.JobCard.AssignedOperatorUserId,
            DateTimeOffset.UtcNow,
            request.GoodQty + request.RejectQty + request.ScrapQty,
            request.ReasonCode,
            request.Remarks));
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetJobCardAsync(jobCardId, cancellationToken);
        await WriteAuditAsync("production", nameof(JobCard), "job-card.log-qty", context.JobCard.Id, before, after, cancellationToken);
        return MapQuantityResult(context.JobCard);
    }

    public async Task<DowntimeEventDto> LogDowntimeAsync(long jobCardId, JobCardDowntimeRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(
            Positive(request.MachineId, nameof(request.MachineId), "Machine is required."),
            Required(request.ReasonCode, nameof(request.ReasonCode), "Downtime reason is required."),
            request.EndOn <= request.StartOn ? new ApiError("validation.out_of_range", nameof(request.EndOn), "Downtime end must be later than start.") : null);

        var context = await LoadJobCardContextForWriteAsync(jobCardId, cancellationToken);
        await EnsureMachineCanBeUsedAsync(context, request.MachineId, cancellationToken);

        if (context.JobCard.AssignedMachineId.HasValue && context.JobCard.AssignedMachineId.Value != request.MachineId)
        {
            throw CreateBusinessRule(
                "Downtime machine does not match the job-card assignment.",
                "job_card.machine_mismatch",
                new ApiError("job_card.machine_mismatch", nameof(request.MachineId), "Log downtime against the same machine assigned to the active job card."));
        }

        var before = await GetJobCardAsync(jobCardId, cancellationToken);
        var durationMinutes = Math.Round((decimal)(request.EndOn - request.StartOn).TotalMinutes, 2, MidpointRounding.AwayFromZero);
        var downtime = DowntimeEvent.Create(
            context.JobCard.CompanyId ?? 0,
            context.JobCard.BranchId ?? 0,
            context.JobCard.Id,
            request.MachineId,
            request.ReasonCode,
            request.StartOn,
            request.EndOn,
            durationMinutes,
            request.Remarks,
            GetUserId());

        DbContext.DowntimeEvents.Add(downtime);
        DbContext.JobCardEvents.Add(BuildEvent(
            context,
            "DowntimeLogged",
            request.MachineId,
            context.JobCard.AssignedOperatorUserId,
            request.EndOn,
            durationMinutes,
            request.ReasonCode,
            request.Remarks));
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapDowntime(downtime);
        await WriteAuditAsync("production", nameof(DowntimeEvent), "job-card.log-downtime", downtime.Id, before, dto, cancellationToken);
        return dto;
    }

    public async Task<ActionResponse> CompleteAsync(long jobCardId, JobCardCompleteRequest? request, CancellationToken cancellationToken = default)
    {
        var context = await LoadJobCardContextForWriteAsync(jobCardId, cancellationToken);
        if (context.JobCard.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
            context.JobCard.Status.Equals("QC_Hold", StringComparison.OrdinalIgnoreCase))
        {
            return BuildActionResponse(context.JobCard, "Job card completion was already posted.");
        }

        EnsureTransitionAllowed(context.JobCard, new[] { "Started" }, "complete");
        var currentTotal = GetTotalProcessed(context.JobCard);
        var otherOperationTotal = await GetOtherProcessedQuantityAsync(context.JobCard.WorkOrderOperationId, context.JobCard.Id, cancellationToken);
        var operationTotal = otherOperationTotal + currentTotal;

        if (operationTotal < context.Operation.PlannedQuantity)
        {
            throw CreateBusinessRule(
                "Job card cannot be completed before all planned quantity is posted.",
                "job_card.qty_incomplete",
                new ApiError("job_card.qty_incomplete", nameof(jobCardId), "Post the remaining open quantity before completing the job card."));
        }

        var before = await GetJobCardAsync(jobCardId, cancellationToken);
        string[] warnings;

        if (context.Operation.RequiresQcCheckpoint)
        {
            context.JobCard.SetStatus("QC_Hold", GetUserId());
            context.Operation.UpdateExecutionProgress(operationTotal, "QC_Hold", GetUserId());
            DbContext.JobCardEvents.Add(BuildEvent(
                context,
                "QC_Hold",
                context.JobCard.AssignedMachineId,
                context.JobCard.AssignedOperatorUserId,
                DateTimeOffset.UtcNow,
                operationTotal,
                null,
                request?.Remarks));
            warnings = new[] { "Operation requires QC review. Job card moved to QC_Hold." };
        }
        else
        {
            context.JobCard.SetStatus("Completed", GetUserId());
            context.Operation.UpdateExecutionProgress(operationTotal, "Completed", GetUserId());
            DbContext.JobCardEvents.Add(BuildEvent(
                context,
                "Completed",
                context.JobCard.AssignedMachineId,
                context.JobCard.AssignedOperatorUserId,
                DateTimeOffset.UtcNow,
                operationTotal,
                null,
                request?.Remarks));
            await MarkNextOperationReadyAsync(context.Operation, cancellationToken);
            warnings = Array.Empty<string>();
        }

        var workOrderOperations = await LoadWorkOrderOperationsAsync(context.WorkOrder.Id, cancellationToken);
        context.WorkOrder.SetExecutionStatus(ResolveWorkOrderStatus(workOrderOperations, context.WorkOrder.Status), request?.Remarks, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetJobCardAsync(jobCardId, cancellationToken);
        await WriteAuditAsync("production", nameof(JobCard), "job-card.complete", context.JobCard.Id, before, after, cancellationToken);
        return BuildActionResponse(context.JobCard, warnings);
    }

    public async Task<PagedResult<DowntimeEventDto>> ListDowntimeAsync(DowntimeFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query =
            from downtime in DbContext.DowntimeEvents.AsNoTracking()
            join jobCard in DbContext.JobCards.AsNoTracking().ApplyActiveOrganizationScope(scope) on downtime.JobCardId equals jobCard.Id
            join workOrder in DbContext.WorkOrders.AsNoTracking() on jobCard.WorkOrderId equals workOrder.Id
            select new DowntimeListRow(
                downtime.Id,
                jobCard.CompanyId ?? 0,
                jobCard.BranchId ?? 0,
                downtime.JobCardId,
                jobCard.JobCardNo,
                workOrder.WorkOrderNo,
                downtime.MachineId,
                downtime.ReasonCode,
                downtime.StartOn,
                downtime.EndOn,
                downtime.DurationMinutes,
                downtime.Remarks);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.JobCardId.HasValue)
        {
            query = query.Where(entity => entity.JobCardId == filter.JobCardId.Value);
        }

        if (filter.MachineId.HasValue)
        {
            query = query.Where(entity => entity.MachineId == filter.MachineId.Value);
        }

        if (filter.DateFrom.HasValue)
        {
            query = query.Where(entity => entity.StartOn >= filter.DateFrom.Value);
        }

        if (filter.DateTo.HasValue)
        {
            query = query.Where(entity => entity.EndOn <= filter.DateTo.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.JobCardNo.Contains(search) ||
                entity.WorkOrderNo.Contains(search) ||
                entity.ReasonCode.Contains(search));
        }

        var page = await query.OrderByDescending(entity => entity.StartOn)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        return MapPage(page, MapDowntime);
    }

    public async Task<JobCardReplayResult> ReplayMobileActionsAsync(JobCardReplayRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(
            request.Actions.Count == 0
                ? new ApiError("validation.required", nameof(request.Actions), "At least one mobile replay action is required.")
                : null);

        var results = new List<JobCardReplayActionResult>();
        foreach (var action in request.Actions)
        {
            try
            {
                var result = await ReplayActionAsync(action, cancellationToken);
                results.Add(result);
            }
            catch (AppException exception)
            {
                var errors = exception.Errors.Count > 0
                    ? exception.Errors
                    : new[] { new ApiError(exception.ErrorCode, null, exception.Message) };

                results.Add(new JobCardReplayActionResult(
                    action.ActionType,
                    action.JobCardId,
                    false,
                    null,
                    null,
                    exception.Message,
                    errors));
            }
        }

        return new JobCardReplayResult(results);
    }

    private async Task<JobCardReplayActionResult> ReplayActionAsync(JobCardReplayActionRequest action, CancellationToken cancellationToken)
    {
        var actionType = Normalize(action.ActionType)?.ToLowerInvariant();
        return actionType switch
        {
            "assign" => MapReplayAction(action.ActionType, action.JobCardId, await AssignAsync(action.JobCardId, new JobCardAssignRequest(action.MachineId, action.OperatorUserId, action.ShiftId, action.Remarks), cancellationToken)),
            "start" => MapReplayAction(action.ActionType, action.JobCardId, await StartAsync(action.JobCardId, new JobCardStartRequest(action.MachineId ?? 0, action.OperatorUserId ?? 0, action.EventOn, action.Remarks), cancellationToken)),
            "pause" => MapReplayAction(action.ActionType, action.JobCardId, await PauseAsync(action.JobCardId, new JobCardPauseRequest(action.ReasonCode ?? string.Empty, action.Remarks), cancellationToken)),
            "resume" => MapReplayAction(action.ActionType, action.JobCardId, await ResumeAsync(action.JobCardId, new JobCardResumeRequest(action.MachineId, action.OperatorUserId, action.Remarks), cancellationToken)),
            "qty" or "quantity" or "logqty" => MapReplayAction(action.ActionType, action.JobCardId, await LogQuantityAsync(action.JobCardId, new JobCardQuantityRequest(action.GoodQty, action.RejectQty, action.ScrapQty, action.CatchWeightQty, action.ReasonCode, action.Remarks), cancellationToken)),
            "downtime" or "logdowntime" => MapReplayAction(action.ActionType, action.JobCardId, await LogDowntimeAsync(action.JobCardId, new JobCardDowntimeRequest(action.MachineId ?? 0, action.ReasonCode ?? string.Empty, action.StartOn ?? default, action.EndOn ?? default, action.Remarks), cancellationToken)),
            "complete" => MapReplayAction(action.ActionType, action.JobCardId, await CompleteAsync(action.JobCardId, new JobCardCompleteRequest(action.Remarks), cancellationToken)),
            _ => new JobCardReplayActionResult(
                action.ActionType,
                action.JobCardId,
                false,
                null,
                null,
                "Unsupported mobile replay action type.",
                new[] { new ApiError("job_card.replay_unsupported", nameof(action.ActionType), "Supported actions are assign, start, pause, resume, qty, downtime, and complete.") })
        };
    }

    private async Task<IReadOnlyCollection<JobCardDto>> LoadJobCardsAsync(IReadOnlyCollection<long> ids, CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
        {
            return Array.Empty<JobCardDto>();
        }

        var scope = GetScope();
        var detailRows = await (
            from jobCard in DbContext.JobCards.AsNoTracking().ApplyActiveOrganizationScope(scope)
            join workOrder in DbContext.WorkOrders.AsNoTracking() on jobCard.WorkOrderId equals workOrder.Id
            join operation in DbContext.WorkOrderOperations.AsNoTracking() on jobCard.WorkOrderOperationId equals operation.Id
            where ids.Contains(jobCard.Id)
            select new JobCardDetailRow(
                jobCard.Id,
                jobCard.CompanyId ?? 0,
                jobCard.BranchId ?? 0,
                jobCard.JobCardNo,
                jobCard.WorkOrderId,
                workOrder.WorkOrderNo,
                jobCard.WorkOrderOperationId,
                operation.OperationId,
                jobCard.ParentJobCardId,
                jobCard.SplitSequenceNo,
                jobCard.AssignedMachineId,
                jobCard.AssignedOperatorUserId,
                jobCard.ShiftId,
                jobCard.PlannedQuantity,
                jobCard.CompletedGoodQty,
                jobCard.CompletedRejectQty,
                jobCard.CompletedScrapQty,
                jobCard.Status))
            .OrderBy(entity => entity.JobCardNo)
            .ToArrayAsync(cancellationToken);

        var events = await LoadEventsAsync(ids, cancellationToken);
        var downtimes = await LoadDowntimesAsync(ids, cancellationToken);

        return detailRows
            .Select(entity => MapDetail(
                entity,
                events.GetValueOrDefault(entity.Id, Array.Empty<JobCardEventDto>()),
                downtimes.GetValueOrDefault(entity.Id, Array.Empty<DowntimeEventDto>())))
            .ToArray();
    }

    private async Task<JobCardContext> LoadJobCardContextForWriteAsync(long jobCardId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var jobCard = await DbContext.JobCards
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == jobCardId, cancellationToken);

        jobCard = EnsureFound(jobCard, "Job card was not found in the active scope.", "job_card.not_found");
        var workOrder = await DbContext.WorkOrders.FirstOrDefaultAsync(record => record.Id == jobCard.WorkOrderId, cancellationToken);
        var operation = await DbContext.WorkOrderOperations.FirstOrDefaultAsync(record => record.Id == jobCard.WorkOrderOperationId, cancellationToken);

        workOrder = EnsureFound(workOrder, "Linked work order was not found.", "job_card.work_order_not_found");
        operation = EnsureFound(operation, "Linked work-order operation was not found.", "job_card.operation_not_found");
        return new JobCardContext(jobCard, workOrder, operation);
    }

    private async Task EnsureMachineCanBeUsedAsync(JobCardContext context, long machineId, CancellationToken cancellationToken)
    {
        var machine = await DbContext.Machines.AsNoTracking().FirstOrDefaultAsync(record =>
            record.Id == machineId &&
            record.CompanyId == context.JobCard.CompanyId &&
            record.BranchId == context.JobCard.BranchId,
            cancellationToken);

        machine = EnsureFound(machine, "Machine was not found in the active scope.", "job_card.machine_not_found");
        ThrowIfInvalid(
            !string.Equals(machine.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(machineId), "Machine must be active.")
                : null,
            machine.IsUnderMaintenance
                ? new ApiError("validation.invalid_state", nameof(machineId), "Machine under maintenance cannot be assigned or started.")
                : null,
            !machine.IsSchedulingEnabled
                ? new ApiError("validation.invalid_state", nameof(machineId), "Machine must be scheduling-enabled for execution.")
                : null,
            context.Operation.WorkCenterId.HasValue && machine.WorkCenterId != context.Operation.WorkCenterId.Value
                ? new ApiError("validation.mismatch", nameof(machineId), "Machine does not belong to the operation work center.")
                : null);
    }

    private async Task EnsureShiftCanBeUsedAsync(JobCardContext context, long shiftId, CancellationToken cancellationToken)
    {
        var shift = await DbContext.Shifts.AsNoTracking().FirstOrDefaultAsync(record =>
            record.Id == shiftId &&
            record.CompanyId == context.JobCard.CompanyId &&
            record.BranchId == context.JobCard.BranchId,
            cancellationToken);

        shift = EnsureFound(shift, "Shift was not found in the active scope.", "job_card.shift_not_found");
        ThrowIfInvalid(
            !string.Equals(shift.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(shiftId), "Shift must be active.")
                : null);
    }

    private async Task EnsureMachineAvailabilityAsync(JobCardContext context, long machineId, CancellationToken cancellationToken)
    {
        var activeCard = await DbContext.JobCards.AsNoTracking()
            .Where(record =>
                record.Id != context.JobCard.Id &&
                record.CompanyId == context.JobCard.CompanyId &&
                record.BranchId == context.JobCard.BranchId &&
                record.AssignedMachineId == machineId &&
                record.Status == "Started")
            .OrderBy(record => record.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeCard is not null)
        {
            throw CreateBusinessRule(
                "Machine already has another started job card.",
                "job_card.machine_busy",
                new ApiError("job_card.machine_busy", nameof(machineId), $"Machine is currently occupied by job card {activeCard.JobCardNo}."));
        }
    }

    private static void EnsureOperationCanExecute(WorkOrderOperation operation, string action)
    {
        if (operation.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
        {
            throw CreateBusinessRule(
                $"Work-order operation is not ready to {action}.",
                "job_card.operation_not_ready",
                new ApiError("job_card.operation_not_ready", nameof(operation.Status), "Only Ready or InProgress operations can accept job-card execution."));
        }

        if (operation.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
            operation.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase) ||
            operation.Status.Equals("QC_Hold", StringComparison.OrdinalIgnoreCase))
        {
            throw CreateBusinessRule(
                $"Work-order operation cannot {action} in its current state.",
                "job_card.operation_locked",
                new ApiError("job_card.operation_locked", nameof(operation.Status), "The linked work-order operation is already completed, cancelled, or held for QC."));
        }
    }

    private static void EnsureTransitionAllowed(JobCard jobCard, IReadOnlyCollection<string> allowedStatuses, string action)
    {
        if (allowedStatuses.Any(status => status.Equals(jobCard.Status, StringComparison.OrdinalIgnoreCase)))
        {
            return;
        }

        throw CreateBusinessRule(
            $"Job card cannot {action} from status {jobCard.Status}.",
            "job_card.invalid_transition",
            new ApiError("job_card.invalid_transition", nameof(jobCard.Status), $"Allowed states for {action}: {string.Join(", ", allowedStatuses)}."));
    }

    private async Task<Dictionary<long, IReadOnlyCollection<JobCardEventDto>>> LoadEventsAsync(IReadOnlyCollection<long> jobCardIds, CancellationToken cancellationToken)
    {
        var events = await DbContext.JobCardEvents.AsNoTracking()
            .Where(record => jobCardIds.Contains(record.JobCardId))
            .OrderBy(record => record.EventOn)
            .ThenBy(record => record.Id)
            .ToListAsync(cancellationToken);

        return events.GroupBy(record => record.JobCardId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<JobCardEventDto>)group.Select(MapEvent).ToArray());
    }

    private async Task<Dictionary<long, IReadOnlyCollection<DowntimeEventDto>>> LoadDowntimesAsync(IReadOnlyCollection<long> jobCardIds, CancellationToken cancellationToken)
    {
        var downtimes = await DbContext.DowntimeEvents.AsNoTracking()
            .Where(record => jobCardIds.Contains(record.JobCardId))
            .OrderBy(record => record.StartOn)
            .ThenBy(record => record.Id)
            .ToListAsync(cancellationToken);

        return downtimes.GroupBy(record => record.JobCardId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<DowntimeEventDto>)group.Select(MapDowntime).ToArray());
    }

    private async Task<decimal> GetOtherProcessedQuantityAsync(long workOrderOperationId, long excludedJobCardId, CancellationToken cancellationToken)
    {
        var cards = await DbContext.JobCards.AsNoTracking()
            .Where(record => record.WorkOrderOperationId == workOrderOperationId && record.Id != excludedJobCardId)
            .ToListAsync(cancellationToken);

        return cards.Sum(GetTotalProcessed);
    }

    private async Task<IReadOnlyCollection<WorkOrderOperation>> LoadWorkOrderOperationsAsync(long workOrderId, CancellationToken cancellationToken) =>
        await DbContext.WorkOrderOperations
            .Where(record => record.WorkOrderId == workOrderId)
            .OrderBy(record => record.SequenceNo)
            .ToArrayAsync(cancellationToken);

    private async Task MarkNextOperationReadyAsync(WorkOrderOperation currentOperation, CancellationToken cancellationToken)
    {
        var nextOperation = await DbContext.WorkOrderOperations
            .Where(record => record.WorkOrderId == currentOperation.WorkOrderId && record.SequenceNo > currentOperation.SequenceNo)
            .OrderBy(record => record.SequenceNo)
            .FirstOrDefaultAsync(cancellationToken);

        if (nextOperation is not null && nextOperation.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
        {
            nextOperation.SetStatus("Ready", GetUserId());
        }
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

    private static void ValidateQuantityRequest(JobCardQuantityRequest request)
    {
        var total = request.GoodQty + request.RejectQty + request.ScrapQty;
        ThrowIfInvalid(
            request.GoodQty < 0 ? new ApiError("validation.out_of_range", nameof(request.GoodQty), "Good quantity cannot be negative.") : null,
            request.RejectQty < 0 ? new ApiError("validation.out_of_range", nameof(request.RejectQty), "Reject quantity cannot be negative.") : null,
            request.ScrapQty < 0 ? new ApiError("validation.out_of_range", nameof(request.ScrapQty), "Scrap quantity cannot be negative.") : null,
            total <= 0 ? new ApiError("validation.out_of_range", nameof(request.GoodQty), "At least one quantity must be greater than zero.") : null,
            (request.RejectQty > 0 || request.ScrapQty > 0) && string.IsNullOrWhiteSpace(request.ReasonCode)
                ? new ApiError("validation.required", nameof(request.ReasonCode), "Reject or scrap entries require a reason code.")
                : null);
    }

    private JobCardEvent BuildEvent(
        JobCardContext context,
        string eventType,
        long? machineId,
        long? operatorUserId,
        DateTimeOffset eventOn,
        decimal? quantity,
        string? reasonCode,
        string? remarks) =>
        JobCardEvent.Create(
            context.JobCard.CompanyId ?? 0,
            context.JobCard.BranchId ?? 0,
            context.JobCard.Id,
            eventType,
            machineId,
            operatorUserId,
            eventOn,
            quantity,
            reasonCode,
            remarks,
            GetUserId());

    private static string BuildJobCardNo(string workOrderNo, int sequenceNo, int splitSequenceNo)
    {
        var candidate = $"{workOrderNo.Trim()}-{sequenceNo:D3}-S{splitSequenceNo:D2}";
        return candidate.Length <= 32 ? candidate : candidate[..32];
    }

    private static bool CanRegenerate(JobCard jobCard) =>
        jobCard.Status.Equals("Created", StringComparison.OrdinalIgnoreCase) ||
        jobCard.Status.Equals("Assigned", StringComparison.OrdinalIgnoreCase) ||
        jobCard.Status.Equals("Paused", StringComparison.OrdinalIgnoreCase);

    private static decimal GetTotalProcessed(JobCard jobCard) =>
        jobCard.CompletedGoodQty + jobCard.CompletedRejectQty + jobCard.CompletedScrapQty;

    private static JobCardSummaryDto MapSummary(JobCardListRow entity) =>
        new(
            entity.Id,
            entity.CompanyId,
            entity.BranchId,
            entity.JobCardNo,
            entity.WorkOrderId,
            entity.WorkOrderNo,
            entity.WorkOrderOperationId,
            entity.OperationId,
            entity.SplitSequenceNo,
            entity.AssignedMachineId,
            entity.AssignedOperatorUserId,
            entity.ShiftId,
            entity.PlannedQuantity,
            entity.CompletedGoodQty,
            entity.CompletedRejectQty,
            entity.CompletedScrapQty,
            entity.Status);

    private static JobCardDto MapDetail(
        JobCardDetailRow entity,
        IReadOnlyCollection<JobCardEventDto> events,
        IReadOnlyCollection<DowntimeEventDto> downtimes) =>
        new(
            entity.Id,
            entity.CompanyId,
            entity.BranchId,
            entity.JobCardNo,
            entity.WorkOrderId,
            entity.WorkOrderNo,
            entity.WorkOrderOperationId,
            entity.OperationId,
            entity.ParentJobCardId,
            entity.SplitSequenceNo,
            entity.AssignedMachineId,
            entity.AssignedOperatorUserId,
            entity.ShiftId,
            entity.PlannedQuantity,
            entity.CompletedGoodQty,
            entity.CompletedRejectQty,
            entity.CompletedScrapQty,
            entity.Status,
            events,
            downtimes);

    private static JobCardEventDto MapEvent(JobCardEvent entity) =>
        new(
            entity.Id,
            entity.EventType,
            entity.MachineId,
            entity.OperatorUserId,
            entity.EventOn,
            entity.Quantity,
            entity.ReasonCode,
            entity.Remarks);

    private static DowntimeEventDto MapDowntime(DowntimeEvent entity) =>
        new(
            entity.Id,
            entity.JobCardId,
            entity.MachineId,
            entity.ReasonCode,
            entity.StartOn,
            entity.EndOn,
            entity.DurationMinutes,
            entity.Remarks);

    private static DowntimeEventDto MapDowntime(DowntimeListRow entity) =>
        new(
            entity.Id,
            entity.JobCardId,
            entity.MachineId,
            entity.ReasonCode,
            entity.StartOn,
            entity.EndOn,
            entity.DurationMinutes,
            entity.Remarks);

    private static JobCardQuantityResultDto MapQuantityResult(JobCard entity)
    {
        var totalProcessed = GetTotalProcessed(entity);
        var remainingQuantity = Math.Max(0m, entity.PlannedQuantity - totalProcessed);
        return new JobCardQuantityResultDto(
            entity.Id,
            entity.JobCardNo,
            entity.CompletedGoodQty,
            entity.CompletedRejectQty,
            entity.CompletedScrapQty,
            totalProcessed,
            remainingQuantity,
            entity.Status);
    }

    private static ActionResponse BuildActionResponse(JobCard entity, params string[] warnings) =>
        new(
            entity.Id.ToString(CultureInfo.InvariantCulture),
            entity.Status,
            entity.JobCardNo,
            warnings.Where(warning => !string.IsNullOrWhiteSpace(warning)).ToArray());

    private static JobCardReplayActionResult MapReplayAction(string actionType, long jobCardId, ActionResponse response) =>
        new(
            actionType,
            jobCardId,
            true,
            response.Status,
            response.ReferenceNo,
            response.Warnings.Count > 0 ? string.Join(" ", response.Warnings) : null,
            Array.Empty<ApiError>());

    private static JobCardReplayActionResult MapReplayAction(string actionType, long jobCardId, JobCardQuantityResultDto response) =>
        new(
            actionType,
            jobCardId,
            true,
            response.Status,
            response.JobCardNo,
            $"Processed quantity now totals {response.TotalProcessedQty.ToString("0.######", CultureInfo.InvariantCulture)}.",
            Array.Empty<ApiError>());

    private static JobCardReplayActionResult MapReplayAction(string actionType, long jobCardId, DowntimeEventDto response) =>
        new(
            actionType,
            jobCardId,
            true,
            "Logged",
            response.Id.ToString(CultureInfo.InvariantCulture),
            $"Downtime logged for {response.DurationMinutes.ToString("0.##", CultureInfo.InvariantCulture)} minutes.",
            Array.Empty<ApiError>());

    private static BusinessRuleException CreateBusinessRule(string message, string errorCode, params ApiError?[] errors)
    {
        var materialized = errors.Where(error => error is not null).Cast<ApiError>().ToArray();
        return new BusinessRuleException(message, errorCode, materialized);
    }

    private sealed record JobCardListRow(
        long Id,
        long CompanyId,
        long BranchId,
        string JobCardNo,
        long WorkOrderId,
        string WorkOrderNo,
        long WorkOrderOperationId,
        long OperationId,
        int? SplitSequenceNo,
        long? AssignedMachineId,
        long? AssignedOperatorUserId,
        long? ShiftId,
        decimal PlannedQuantity,
        decimal CompletedGoodQty,
        decimal CompletedRejectQty,
        decimal CompletedScrapQty,
        string Status,
        DateTimeOffset CreatedOn);

    private sealed record JobCardDetailRow(
        long Id,
        long CompanyId,
        long BranchId,
        string JobCardNo,
        long WorkOrderId,
        string WorkOrderNo,
        long WorkOrderOperationId,
        long OperationId,
        long? ParentJobCardId,
        int? SplitSequenceNo,
        long? AssignedMachineId,
        long? AssignedOperatorUserId,
        long? ShiftId,
        decimal PlannedQuantity,
        decimal CompletedGoodQty,
        decimal CompletedRejectQty,
        decimal CompletedScrapQty,
        string Status);

    private sealed record DowntimeListRow(
        long Id,
        long CompanyId,
        long BranchId,
        long JobCardId,
        string JobCardNo,
        string WorkOrderNo,
        long MachineId,
        string ReasonCode,
        DateTimeOffset StartOn,
        DateTimeOffset EndOn,
        decimal DurationMinutes,
        string? Remarks);

    private sealed record JobCardContext(JobCard JobCard, WorkOrder WorkOrder, WorkOrderOperation Operation);
}
