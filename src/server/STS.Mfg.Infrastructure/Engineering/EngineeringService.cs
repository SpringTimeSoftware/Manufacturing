using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Engineering;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Engineering;
using STS.Mfg.Domain.Engineering;
using STS.Mfg.Domain.Resources;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Engineering;

internal sealed class EngineeringService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IEngineeringService
{
    public async Task<PagedResult<RoutingDto>> ListRoutingsAsync(EngineeringFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Routings.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyRoutingFilters(query, filter);

        var page = await query.OrderBy(entity => entity.RoutingCode).ToPagedResultAsync(filter, cancellationToken);
        var routingIds = page.Items.Select(entity => entity.Id).ToArray();
        var operations = await DbContext.RoutingOperations.AsNoTracking()
            .Where(entity => routingIds.Contains(entity.RoutingId))
            .OrderBy(entity => entity.SequenceNo)
            .ToListAsync(cancellationToken);

        var operationLookup = operations.GroupBy(entity => entity.RoutingId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<RoutingOperationDto>)group.Select(MapRoutingOperation).ToArray());

        return MapPage(page, routing => MapRouting(routing, operationLookup.GetValueOrDefault(routing.Id, Array.Empty<RoutingOperationDto>())));
    }

    public async Task<RoutingDto> GetRoutingAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var routing = await DbContext.Routings.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

        routing = EnsureFound(routing, "Routing was not found in the active scope.", "engineering.routing_not_found");

        var operations = await DbContext.RoutingOperations.AsNoTracking()
            .Where(entity => entity.RoutingId == id)
            .OrderBy(entity => entity.SequenceNo)
            .Select(entity => MapRoutingOperation(entity))
            .ToArrayAsync(cancellationToken);

        return MapRouting(routing, operations);
    }

    public async Task<RoutingDto> CreateRoutingAsync(RoutingUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRouting(request);
        EnsureContextAccess(request.CompanyId, null);

        var routing = Routing.Create(
            request.CompanyId,
            request.RoutingCode,
            request.RoutingName,
            request.OutputItemId,
            Normalize(request.RevisionCode),
            request.Status,
            GetUserId());

        DbContext.Routings.Add(routing);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Operations.Count > 0)
        {
            var operations = request.Operations
                .OrderBy(operation => operation.SequenceNo)
                .Select(operation => RoutingOperation.Create(
                    routing.Id,
                    operation.SequenceNo,
                    operation.OperationId,
                    operation.WorkCenterId,
                    operation.ToolId,
                    operation.SetupMinutes,
                    operation.RunMinutesPerUnit,
                    operation.TeardownMinutes,
                    operation.OverlapPercent,
                    operation.IsOutsideProcessing,
                    operation.RequiresQcCheckpoint,
                    operation.Status,
                    GetUserId()))
                .ToArray();

            DbContext.RoutingOperations.AddRange(operations);
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetRoutingAsync(routing.Id, cancellationToken);
        await WriteAuditAsync("engineering", nameof(Routing), "routing.create", routing.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<RoutingDto> UpdateRoutingAsync(long id, RoutingUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRouting(request);

        var scope = GetScope();
        var routing = await DbContext.Routings.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

        routing = EnsureFound(routing, "Routing was not found in the active scope.", "engineering.routing_not_found");
        ThrowIfInvalid(
            Immutable(routing.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Routing company cannot be changed."),
            Immutable(routing.OutputItemId, request.OutputItemId, nameof(request.OutputItemId), "Routing output item cannot be changed."));

        var before = await GetRoutingAsync(id, cancellationToken);
        routing.Update(request.RoutingCode, request.RoutingName, Normalize(request.RevisionCode), request.Status, GetUserId());

        var existingOperations = await DbContext.RoutingOperations
            .Where(entity => entity.RoutingId == id)
            .ToListAsync(cancellationToken);
        DbContext.RoutingOperations.RemoveRange(existingOperations);

        if (request.Operations.Count > 0)
        {
            DbContext.RoutingOperations.AddRange(
                request.Operations
                    .OrderBy(operation => operation.SequenceNo)
                    .Select(operation => RoutingOperation.Create(
                        routing.Id,
                        operation.SequenceNo,
                        operation.OperationId,
                        operation.WorkCenterId,
                        operation.ToolId,
                        operation.SetupMinutes,
                        operation.RunMinutesPerUnit,
                        operation.TeardownMinutes,
                        operation.OverlapPercent,
                        operation.IsOutsideProcessing,
                        operation.RequiresQcCheckpoint,
                        operation.Status,
                        GetUserId())));
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetRoutingAsync(id, cancellationToken);
        await WriteAuditAsync("engineering", nameof(Routing), "routing.update", routing.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<BomDto>> ListBomsAsync(EngineeringFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Boms.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyBomFilters(query, filter);

        var page = await query.OrderBy(entity => entity.BomCode).ToPagedResultAsync(filter, cancellationToken);
        var bomIds = page.Items.Select(entity => entity.Id).ToArray();

        var revisions = await DbContext.BomRevisions.AsNoTracking()
            .Where(entity => bomIds.Contains(entity.BomId))
            .OrderBy(entity => entity.RevisionCode)
            .ToListAsync(cancellationToken);
        var revisionIds = revisions.Select(entity => entity.Id).ToArray();

        var lines = await DbContext.BomLines.AsNoTracking()
            .Where(entity => revisionIds.Contains(entity.BomRevisionId))
            .OrderBy(entity => entity.SequenceNo)
            .ToListAsync(cancellationToken);
        var operations = await DbContext.BomOperations.AsNoTracking()
            .Where(entity => revisionIds.Contains(entity.BomRevisionId))
            .OrderBy(entity => entity.SequenceNo)
            .ToListAsync(cancellationToken);

        var lineLookup = lines.GroupBy(entity => entity.BomRevisionId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<BomLineDto>)group.Select(MapBomLine).ToArray());
        var operationLookup = operations.GroupBy(entity => entity.BomRevisionId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<BomOperationDto>)group.Select(MapBomOperation).ToArray());
        var revisionLookup = revisions.GroupBy(entity => entity.BomId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyCollection<BomRevisionDto>)group
                    .Select(entity => MapBomRevision(
                        entity,
                        lineLookup.GetValueOrDefault(entity.Id, Array.Empty<BomLineDto>()),
                        operationLookup.GetValueOrDefault(entity.Id, Array.Empty<BomOperationDto>())))
                    .ToArray());

        return MapPage(page, bom => MapBom(bom, revisionLookup.GetValueOrDefault(bom.Id, Array.Empty<BomRevisionDto>())));
    }

    public async Task<BomDto> GetBomAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var bom = await DbContext.Boms.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

        bom = EnsureFound(bom, "BOM was not found in the active scope.", "engineering.bom_not_found");

        var revisions = await DbContext.BomRevisions.AsNoTracking()
            .Where(entity => entity.BomId == id)
            .OrderBy(entity => entity.RevisionCode)
            .ToListAsync(cancellationToken);
        var revisionIds = revisions.Select(entity => entity.Id).ToArray();

        var lines = await DbContext.BomLines.AsNoTracking()
            .Where(entity => revisionIds.Contains(entity.BomRevisionId))
            .OrderBy(entity => entity.SequenceNo)
            .ToListAsync(cancellationToken);
        var operations = await DbContext.BomOperations.AsNoTracking()
            .Where(entity => revisionIds.Contains(entity.BomRevisionId))
            .OrderBy(entity => entity.SequenceNo)
            .ToListAsync(cancellationToken);

        var lineLookup = lines.GroupBy(entity => entity.BomRevisionId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<BomLineDto>)group.Select(MapBomLine).ToArray());
        var operationLookup = operations.GroupBy(entity => entity.BomRevisionId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<BomOperationDto>)group.Select(MapBomOperation).ToArray());

        var revisionDtos = revisions.Select(entity => MapBomRevision(
            entity,
            lineLookup.GetValueOrDefault(entity.Id, Array.Empty<BomLineDto>()),
            operationLookup.GetValueOrDefault(entity.Id, Array.Empty<BomOperationDto>())))
            .ToArray();

        return MapBom(bom, revisionDtos);
    }

    public async Task<BomDto> CreateBomAsync(BomUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBom(request);
        EnsureContextAccess(request.CompanyId, null);

        var bom = Bom.Create(request.CompanyId, request.ItemId, request.BomCode, request.BomName, request.Status, GetUserId());
        DbContext.Boms.Add(bom);
        await DbContext.SaveChangesAsync(cancellationToken);

        await UpsertBomRevisionsAsync(bom, request.Revisions, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = await GetBomAsync(bom.Id, cancellationToken);
        await WriteAuditAsync("engineering", nameof(Bom), "bom.create", bom.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<BomDto> UpdateBomAsync(long id, BomUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBom(request);

        var scope = GetScope();
        var bom = await DbContext.Boms.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);

        bom = EnsureFound(bom, "BOM was not found in the active scope.", "engineering.bom_not_found");
        ThrowIfInvalid(
            Immutable(bom.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "BOM company cannot be changed."),
            Immutable(bom.ItemId, request.ItemId, nameof(request.ItemId), "BOM item cannot be changed."));

        var before = await GetBomAsync(id, cancellationToken);
        bom.Update(request.BomCode, request.BomName, bom.CurrentReleasedRevisionId, request.Status, GetUserId());

        await UpsertBomRevisionsAsync(bom, request.Revisions, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetBomAsync(id, cancellationToken);
        await WriteAuditAsync("engineering", nameof(Bom), "bom.update", bom.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<BomRevisionDto> CloneBomRevisionAsync(long bomId, long revisionId, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var bom = await DbContext.Boms.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.Id == bomId, cancellationToken);

        bom = EnsureFound(bom, "BOM was not found in the active scope.", "engineering.bom_not_found");

        var revision = await DbContext.BomRevisions.FirstOrDefaultAsync(entity => entity.Id == revisionId && entity.BomId == bomId, cancellationToken);
        revision = EnsureFound(revision, "BOM revision was not found.", "engineering.bom_revision_not_found");

        var existingCodes = await DbContext.BomRevisions
            .Where(entity => entity.BomId == bomId)
            .Select(entity => entity.RevisionCode)
            .ToListAsync(cancellationToken);

        var nextRevisionCode = CreateNextCode(revision.RevisionCode, existingCodes);
        var clone = BomRevision.Create(
            bomId,
            nextRevisionCode,
            revision.EffectiveFrom,
            revision.EffectiveTo,
            "Draft",
            revision.RoutingId,
            revision.ChangeSummary,
            revision.IsPhantomParentAllowed,
            GetUserId());

        DbContext.BomRevisions.Add(clone);
        await DbContext.SaveChangesAsync(cancellationToken);

        var lines = await DbContext.BomLines.AsNoTracking()
            .Where(entity => entity.BomRevisionId == revisionId)
            .OrderBy(entity => entity.SequenceNo)
            .ToListAsync(cancellationToken);
        var operations = await DbContext.BomOperations.AsNoTracking()
            .Where(entity => entity.BomRevisionId == revisionId)
            .OrderBy(entity => entity.SequenceNo)
            .ToListAsync(cancellationToken);

        if (lines.Count > 0)
        {
            DbContext.BomLines.AddRange(lines.Select(entity => BomLine.Create(
                clone.Id,
                entity.SequenceNo,
                entity.ComponentItemId,
                entity.QuantityPer,
                entity.IssueUomId,
                entity.ScrapPercent,
                entity.IssueMethod,
                entity.IsPhantom,
                entity.AlternateItemId,
                entity.EffectiveFrom,
                entity.EffectiveTo,
                GetUserId())));
        }

        if (operations.Count > 0)
        {
            DbContext.BomOperations.AddRange(operations.Select(entity => BomOperation.Create(
                clone.Id,
                entity.SequenceNo,
                entity.RoutingOperationId,
                entity.OperationId,
                entity.SetupMinutes,
                entity.RunMinutesPerUnit,
                entity.TeardownMinutes,
                entity.RequiresQcCheckpoint,
                entity.IsOptional,
                GetUserId())));
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = await GetBomRevisionDtoAsync(clone.Id, cancellationToken);
        await WriteAuditAsync("engineering", nameof(BomRevision), "bomrevision.clone", clone.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<BomRevisionDto> ApproveBomRevisionAsync(long bomId, long revisionId, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var bom = await DbContext.Boms.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.Id == bomId, cancellationToken);

        bom = EnsureFound(bom, "BOM was not found in the active scope.", "engineering.bom_not_found");

        var revision = await DbContext.BomRevisions.FirstOrDefaultAsync(entity => entity.Id == revisionId && entity.BomId == bomId, cancellationToken);
        revision = EnsureFound(revision, "BOM revision was not found.", "engineering.bom_revision_not_found");

        var before = await GetBomRevisionDtoAsync(revisionId, cancellationToken);
        revision.Update(revision.RevisionCode, revision.EffectiveFrom, revision.EffectiveTo, "Approved", revision.ChangeSummary, revision.IsPhantomParentAllowed, GetUserId());
        bom.MarkReleased(revision.Id, GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetBomRevisionDtoAsync(revisionId, cancellationToken);
        await WriteAuditAsync("engineering", nameof(BomRevision), "bomrevision.approve", revision.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<BomRevisionDto> ObsoleteBomRevisionAsync(long bomId, long revisionId, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var bom = await DbContext.Boms.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.Id == bomId, cancellationToken);

        bom = EnsureFound(bom, "BOM was not found in the active scope.", "engineering.bom_not_found");

        var revision = await DbContext.BomRevisions.FirstOrDefaultAsync(entity => entity.Id == revisionId && entity.BomId == bomId, cancellationToken);
        revision = EnsureFound(revision, "BOM revision was not found.", "engineering.bom_revision_not_found");

        var before = await GetBomRevisionDtoAsync(revisionId, cancellationToken);
        revision.Update(revision.RevisionCode, revision.EffectiveFrom, revision.EffectiveTo, "Obsolete", revision.ChangeSummary, revision.IsPhantomParentAllowed, GetUserId());

        if (bom.CurrentReleasedRevisionId == revision.Id)
        {
            bom.Update(bom.BomCode, bom.BomName, null, bom.Status, GetUserId());
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetBomRevisionDtoAsync(revisionId, cancellationToken);
        await WriteAuditAsync("engineering", nameof(BomRevision), "bomrevision.obsolete", revision.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<AlternateItemDto>> ListAlternateItemsAsync(EngineeringFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.AlternateItems.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyAlternateItemFilters(query, filter);

        var page = await query.OrderBy(entity => entity.PrimaryItemId).ThenBy(entity => entity.PriorityRank).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapAlternateItem);
    }

    public async Task<AlternateItemDto> CreateAlternateItemAsync(AlternateItemUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateAlternateItem(request);
        EnsureContextAccess(request.CompanyId, null);

        var entity = AlternateItem.Create(
            request.CompanyId,
            request.PrimaryItemId,
            request.AlternateItemId,
            request.ContextType,
            request.BomId,
            request.PriorityRank,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.ApprovalStatus,
            Normalize(request.ReasonCode),
            GetUserId());

        DbContext.AlternateItems.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapAlternateItem(entity);
        await WriteAuditAsync("engineering", nameof(AlternateItem), "alternateitem.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<AlternateItemDto> UpdateAlternateItemAsync(long id, AlternateItemUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateAlternateItem(request);

        var scope = GetScope();
        var entity = await DbContext.AlternateItems.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Alternate item was not found in the active scope.", "engineering.alternate_item_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Alternate item company cannot be changed."),
            Immutable(entity.PrimaryItemId, request.PrimaryItemId, nameof(request.PrimaryItemId), "Primary item cannot be changed."),
            Immutable(entity.AlternateItemValueId, request.AlternateItemId, nameof(request.AlternateItemId), "Alternate item cannot be changed."),
            Immutable(entity.BomId, request.BomId, nameof(request.BomId), "Context BOM cannot be changed."));

        var before = MapAlternateItem(entity);
        entity.Update(request.ContextType, request.PriorityRank, request.EffectiveFrom, request.EffectiveTo, request.ApprovalStatus, Normalize(request.ReasonCode), GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapAlternateItem(entity);
        await WriteAuditAsync("engineering", nameof(AlternateItem), "alternateitem.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<EngineeringChangeDto>> ListEngineeringChangesAsync(EngineeringFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.EngineeringChanges.AsNoTracking()
            .ApplyCompanyScope(scope)
            .ApplyRecordVisibility(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyEngineeringChangeFilters(query, filter);

        var page = await query.OrderByDescending(entity => entity.RequestedOn).ThenBy(entity => entity.EcoCode).ToPagedResultAsync(filter, cancellationToken);
        var ecoIds = page.Items.Select(entity => entity.Id).ToArray();
        var lines = await DbContext.EngineeringChangeLines.AsNoTracking()
            .Where(entity => ecoIds.Contains(entity.EngineeringChangeId))
            .OrderBy(entity => entity.LineNo)
            .ToListAsync(cancellationToken);

        var lineLookup = lines.GroupBy(entity => entity.EngineeringChangeId)
            .ToDictionary(group => group.Key, group => (IReadOnlyCollection<EngineeringChangeLineDto>)group.Select(MapEngineeringChangeLine).ToArray());

        return MapPage(page, entity => MapEngineeringChange(entity, lineLookup.GetValueOrDefault(entity.Id, Array.Empty<EngineeringChangeLineDto>())));
    }

    public async Task<EngineeringChangeDto> GetEngineeringChangeAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.EngineeringChanges.AsNoTracking()
            .ApplyCompanyScope(scope)
            .ApplyRecordVisibility(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Engineering change was not found in the active scope.", "engineering.change_not_found");
        var lines = await DbContext.EngineeringChangeLines.AsNoTracking()
            .Where(record => record.EngineeringChangeId == id)
            .OrderBy(record => record.LineNo)
            .Select(record => MapEngineeringChangeLine(record))
            .ToArrayAsync(cancellationToken);

        return MapEngineeringChange(entity, lines);
    }

    public async Task<EngineeringChangeDto> CreateEngineeringChangeAsync(EngineeringChangeUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateEngineeringChange(request);
        EnsureContextAccess(request.CompanyId, null);
        EnsureRecordAccess(request.RequestedByUserId);

        var entity = EngineeringChange.Create(
            request.CompanyId,
            request.EcoCode,
            request.EcoTitle,
            request.ChangeType,
            request.RequestedByUserId,
            request.RequestedOn,
            request.EffectiveFrom,
            request.ApprovalStatus,
            Normalize(request.ReasonCode),
            GetUserId());

        DbContext.EngineeringChanges.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        if (request.Lines.Count > 0)
        {
            DbContext.EngineeringChangeLines.AddRange(
                request.Lines
                    .OrderBy(line => line.LineNo)
                    .Select(line => EngineeringChangeLine.Create(
                        entity.Id,
                        line.LineNo,
                        line.ImpactType,
                        line.TargetEntityId,
                        line.ActionType,
                        Normalize(line.FromValueSummary),
                        Normalize(line.ToValueSummary),
                        line.EffectiveFrom,
                        GetUserId())));
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var dto = await GetEngineeringChangeAsync(entity.Id, cancellationToken);
        await WriteAuditAsync("engineering", nameof(EngineeringChange), "change.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<EngineeringChangeDto> UpdateEngineeringChangeAsync(long id, EngineeringChangeUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateEngineeringChange(request);

        var scope = GetScope();
        var entity = await DbContext.EngineeringChanges
            .ApplyCompanyScope(scope)
            .ApplyRecordVisibility(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Engineering change was not found in the active scope.", "engineering.change_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Engineering-change company cannot be changed."));
        EnsureRecordAccess(request.RequestedByUserId);

        var before = await GetEngineeringChangeAsync(id, cancellationToken);
        entity.Update(
            request.EcoCode,
            request.EcoTitle,
            request.ChangeType,
            request.RequestedByUserId,
            request.RequestedOn,
            request.EffectiveFrom,
            request.ApprovalStatus,
            Normalize(request.ReasonCode),
            GetUserId());

        var existingLines = await DbContext.EngineeringChangeLines
            .Where(record => record.EngineeringChangeId == id)
            .ToListAsync(cancellationToken);
        DbContext.EngineeringChangeLines.RemoveRange(existingLines);

        if (request.Lines.Count > 0)
        {
            DbContext.EngineeringChangeLines.AddRange(
                request.Lines
                    .OrderBy(line => line.LineNo)
                    .Select(line => EngineeringChangeLine.Create(
                        entity.Id,
                        line.LineNo,
                        line.ImpactType,
                        line.TargetEntityId,
                        line.ActionType,
                        Normalize(line.FromValueSummary),
                        Normalize(line.ToValueSummary),
                        line.EffectiveFrom,
                        GetUserId())));
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetEngineeringChangeAsync(id, cancellationToken);
        await WriteAuditAsync("engineering", nameof(EngineeringChange), "change.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public Task<EngineeringChangeDto> SubmitEngineeringChangeAsync(long id, CancellationToken cancellationToken = default) =>
        ChangeEngineeringStatusAsync(id, "Submitted", "change.submit", cancellationToken);

    public Task<EngineeringChangeDto> ApproveEngineeringChangeAsync(long id, CancellationToken cancellationToken = default) =>
        ChangeEngineeringStatusAsync(id, "Approved", "change.approve", cancellationToken);

    public Task<EngineeringChangeDto> ImplementEngineeringChangeAsync(long id, CancellationToken cancellationToken = default) =>
        ChangeEngineeringStatusAsync(id, "Implemented", "change.implement", cancellationToken);

    private async Task<EngineeringChangeDto> ChangeEngineeringStatusAsync(long id, string status, string actionCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.EngineeringChanges
            .ApplyCompanyScope(scope)
            .ApplyRecordVisibility(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Engineering change was not found in the active scope.", "engineering.change_not_found");

        var before = await GetEngineeringChangeAsync(id, cancellationToken);
        entity.Update(entity.EcoCode, entity.EcoTitle, entity.ChangeType, entity.RequestedByUserId, entity.RequestedOn, entity.EffectiveFrom, status, entity.ReasonCode, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetEngineeringChangeAsync(id, cancellationToken);
        await WriteAuditAsync("engineering", nameof(EngineeringChange), actionCode, entity.Id, before, after, cancellationToken);
        return after;
    }

    private async Task UpsertBomRevisionsAsync(Bom bom, IReadOnlyCollection<BomRevisionUpsertRequest> requests, CancellationToken cancellationToken)
    {
        var existingRevisions = await DbContext.BomRevisions
            .Where(entity => entity.BomId == bom.Id)
            .ToListAsync(cancellationToken);

        foreach (var request in requests.OrderBy(revision => revision.RevisionCode))
        {
            var revision = existingRevisions.FirstOrDefault(entity => string.Equals(entity.RevisionCode, request.RevisionCode, StringComparison.OrdinalIgnoreCase));
            if (revision is null)
            {
                revision = BomRevision.Create(
                    bom.Id,
                    request.RevisionCode,
                    request.EffectiveFrom,
                    request.EffectiveTo,
                    request.ApprovalStatus,
                    request.RoutingId,
                    Normalize(request.ChangeSummary),
                    request.IsPhantomParentAllowed,
                    GetUserId());
                DbContext.BomRevisions.Add(revision);
                await DbContext.SaveChangesAsync(cancellationToken);
            }
            else
            {
                ThrowIfInvalid(Immutable(revision.RoutingId, request.RoutingId, nameof(request.RoutingId), "Revision routing cannot be changed."));
                revision.Update(
                    request.RevisionCode,
                    request.EffectiveFrom,
                    request.EffectiveTo,
                    request.ApprovalStatus,
                    Normalize(request.ChangeSummary),
                    request.IsPhantomParentAllowed,
                    GetUserId());
            }

            var existingLines = await DbContext.BomLines.Where(entity => entity.BomRevisionId == revision.Id).ToListAsync(cancellationToken);
            var existingOperations = await DbContext.BomOperations.Where(entity => entity.BomRevisionId == revision.Id).ToListAsync(cancellationToken);
            DbContext.BomLines.RemoveRange(existingLines);
            DbContext.BomOperations.RemoveRange(existingOperations);

            if (request.Lines.Count > 0)
            {
                DbContext.BomLines.AddRange(request.Lines
                    .OrderBy(line => line.SequenceNo)
                    .Select(line => BomLine.Create(
                        revision.Id,
                        line.SequenceNo,
                        line.ComponentItemId,
                        line.QuantityPer,
                        line.IssueUomId,
                        line.ScrapPercent,
                        line.IssueMethod,
                        line.IsPhantom,
                        line.AlternateItemId,
                        line.EffectiveFrom,
                        line.EffectiveTo,
                        GetUserId())));
            }

            if (request.Operations.Count > 0)
            {
                DbContext.BomOperations.AddRange(request.Operations
                    .OrderBy(operation => operation.SequenceNo)
                    .Select(operation => BomOperation.Create(
                        revision.Id,
                        operation.SequenceNo,
                        operation.RoutingOperationId,
                        operation.OperationId,
                        operation.SetupMinutes,
                        operation.RunMinutesPerUnit,
                        operation.TeardownMinutes,
                        operation.RequiresQcCheckpoint,
                        operation.IsOptional,
                        GetUserId())));
            }

            if (string.Equals(request.ApprovalStatus, "Approved", StringComparison.OrdinalIgnoreCase))
            {
                bom.MarkReleased(revision.Id, GetUserId());
            }
        }
    }

    private async Task<BomRevisionDto> GetBomRevisionDtoAsync(long revisionId, CancellationToken cancellationToken)
    {
        var revision = await DbContext.BomRevisions.AsNoTracking().FirstOrDefaultAsync(entity => entity.Id == revisionId, cancellationToken);
        revision = EnsureFound(revision, "BOM revision was not found.", "engineering.bom_revision_not_found");

        var lines = await DbContext.BomLines.AsNoTracking()
            .Where(entity => entity.BomRevisionId == revisionId)
            .OrderBy(entity => entity.SequenceNo)
            .Select(entity => MapBomLine(entity))
            .ToArrayAsync(cancellationToken);
        var operations = await DbContext.BomOperations.AsNoTracking()
            .Where(entity => entity.BomRevisionId == revisionId)
            .OrderBy(entity => entity.SequenceNo)
            .Select(entity => MapBomOperation(entity))
            .ToArrayAsync(cancellationToken);

        return MapBomRevision(revision, lines, operations);
    }

    private static string CreateNextCode(string sourceCode, IReadOnlyCollection<string> existingCodes)
    {
        var prefix = $"{sourceCode}-COPY";
        var next = prefix;
        var index = 1;

        while (existingCodes.Contains(next, StringComparer.OrdinalIgnoreCase))
        {
            next = $"{prefix}{index}";
            index++;
        }

        return next;
    }

    private static IQueryable<Routing> ApplyRoutingFilters(IQueryable<Routing> query, EngineeringFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.RoutingCode.Contains(search) || entity.RoutingName.Contains(search) || (entity.RevisionCode != null && entity.RevisionCode.Contains(search)));
        }

        return query;
    }

    private static IQueryable<Bom> ApplyBomFilters(IQueryable<Bom> query, EngineeringFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.BomCode.Contains(search) || entity.BomName.Contains(search));
        }

        return query;
    }

    private static IQueryable<AlternateItem> ApplyAlternateItemFilters(IQueryable<AlternateItem> query, EngineeringFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.ApprovalStatus == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ContextType.Contains(search) || (entity.ReasonCode != null && entity.ReasonCode.Contains(search)));
        }

        return query;
    }

    private static IQueryable<EngineeringChange> ApplyEngineeringChangeFilters(IQueryable<EngineeringChange> query, EngineeringFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.ApprovalStatus == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.EcoCode.Contains(search) || entity.EcoTitle.Contains(search) || entity.ChangeType.Contains(search));
        }

        return query;
    }

    private static void ValidateRouting(RoutingUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.RoutingCode, nameof(request.RoutingCode), "Routing code is required."),
            Required(request.RoutingName, nameof(request.RoutingName), "Routing name is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Operations.GroupBy(operation => operation.SequenceNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Operations), "Routing operation sequence numbers must be unique."));
        }

        errors.AddRange(request.Operations.SelectMany(operation => ValidateRoutingOperation(operation)));
        ThrowIfInvalid(errors);
    }

    private static IEnumerable<ApiError?> ValidateRoutingOperation(RoutingOperationUpsertRequest request)
    {
        yield return request.SequenceNo <= 0 ? new ApiError("validation.out_of_range", nameof(request.SequenceNo), "Sequence number must be greater than zero.") : null;
        yield return Positive(request.OperationId, nameof(request.OperationId), "Operation is required.");
        yield return Required(request.Status, nameof(request.Status), "Status is required.");
        yield return NonNegative(request.SetupMinutes, nameof(request.SetupMinutes), "Setup minutes cannot be negative.");
        yield return NonNegative(request.RunMinutesPerUnit, nameof(request.RunMinutesPerUnit), "Run minutes cannot be negative.");
        yield return NonNegative(request.TeardownMinutes, nameof(request.TeardownMinutes), "Teardown minutes cannot be negative.");
        yield return NonNegative(request.OverlapPercent, nameof(request.OverlapPercent), "Overlap percent cannot be negative.");
    }

    private static void ValidateBom(BomUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.ItemId, nameof(request.ItemId), "Item is required."),
            Required(request.BomCode, nameof(request.BomCode), "BOM code is required."),
            Required(request.BomName, nameof(request.BomName), "BOM name is required."),
            Required(request.Status, nameof(request.Status), "Status is required.")
        };

        if (request.Revisions.GroupBy(revision => revision.RevisionCode, StringComparer.OrdinalIgnoreCase).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Revisions), "Revision codes must be unique within the BOM."));
        }

        foreach (var revision in request.Revisions)
        {
            errors.Add(Required(revision.RevisionCode, nameof(revision.RevisionCode), "Revision code is required."));
            errors.Add(Required(revision.ApprovalStatus, nameof(revision.ApprovalStatus), "Revision status is required."));

            if (revision.Lines.GroupBy(line => line.SequenceNo).Any(group => group.Count() > 1))
            {
                errors.Add(new ApiError("validation.duplicate", nameof(revision.Lines), $"Revision {revision.RevisionCode} contains duplicate BOM-line sequence numbers."));
            }

            if (revision.Operations.GroupBy(operation => operation.SequenceNo).Any(group => group.Count() > 1))
            {
                errors.Add(new ApiError("validation.duplicate", nameof(revision.Operations), $"Revision {revision.RevisionCode} contains duplicate BOM-operation sequence numbers."));
            }

            foreach (var line in revision.Lines)
            {
                errors.Add(line.SequenceNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.SequenceNo), "Line sequence must be greater than zero.") : null);
                errors.Add(Positive(line.ComponentItemId, nameof(line.ComponentItemId), "Component item is required."));
                errors.Add(Positive(line.IssueUomId, nameof(line.IssueUomId), "Issue UOM is required."));
                errors.Add(Positive(line.QuantityPer, nameof(line.QuantityPer), "Quantity per must be greater than zero."));
                errors.Add(Required(line.IssueMethod, nameof(line.IssueMethod), "Issue method is required."));
                errors.Add(NonNegative(line.ScrapPercent, nameof(line.ScrapPercent), "Scrap percent cannot be negative."));
            }

            foreach (var operation in revision.Operations)
            {
                errors.Add(operation.SequenceNo <= 0 ? new ApiError("validation.out_of_range", nameof(operation.SequenceNo), "Operation sequence must be greater than zero.") : null);
                errors.Add(NonNegative(operation.SetupMinutes, nameof(operation.SetupMinutes), "Setup minutes cannot be negative."));
                errors.Add(NonNegative(operation.RunMinutesPerUnit, nameof(operation.RunMinutesPerUnit), "Run minutes cannot be negative."));
                errors.Add(NonNegative(operation.TeardownMinutes, nameof(operation.TeardownMinutes), "Teardown minutes cannot be negative."));
            }
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateAlternateItem(AlternateItemUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.PrimaryItemId, nameof(request.PrimaryItemId), "Primary item is required."),
            Positive(request.AlternateItemId, nameof(request.AlternateItemId), "Alternate item is required."),
            Required(request.ContextType, nameof(request.ContextType), "Context type is required."),
            Required(request.ApprovalStatus, nameof(request.ApprovalStatus), "Approval status is required."),
            request.PriorityRank < 0 ? new ApiError("validation.out_of_range", nameof(request.PriorityRank), "Priority rank cannot be negative.") : null);

    private static void ValidateEngineeringChange(EngineeringChangeUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.RequestedByUserId, nameof(request.RequestedByUserId), "Requested-by user is required."),
            Required(request.EcoCode, nameof(request.EcoCode), "ECO code is required."),
            Required(request.EcoTitle, nameof(request.EcoTitle), "ECO title is required."),
            Required(request.ChangeType, nameof(request.ChangeType), "Change type is required."),
            Required(request.ApprovalStatus, nameof(request.ApprovalStatus), "Approval status is required.")
        };

        if (request.Lines.GroupBy(line => line.LineNo).Any(group => group.Count() > 1))
        {
            errors.Add(new ApiError("validation.duplicate", nameof(request.Lines), "Engineering-change line numbers must be unique."));
        }

        foreach (var line in request.Lines)
        {
            errors.Add(line.LineNo <= 0 ? new ApiError("validation.out_of_range", nameof(line.LineNo), "Line number must be greater than zero.") : null);
            errors.Add(Positive(line.TargetEntityId, nameof(line.TargetEntityId), "Target entity is required."));
            errors.Add(Required(line.ImpactType, nameof(line.ImpactType), "Impact type is required."));
            errors.Add(Required(line.ActionType, nameof(line.ActionType), "Action type is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static RoutingOperationDto MapRoutingOperation(RoutingOperation entity) =>
        new(entity.Id, entity.SequenceNo, entity.OperationId, entity.WorkCenterId, entity.ToolId, entity.SetupMinutes, entity.RunMinutesPerUnit, entity.TeardownMinutes, entity.OverlapPercent, entity.IsOutsideProcessing, entity.RequiresQcCheckpoint, entity.Status);

    private static RoutingDto MapRouting(Routing entity, IReadOnlyCollection<RoutingOperationDto> operations) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.RoutingCode, entity.RoutingName, entity.OutputItemId, entity.RevisionCode, entity.Status, operations);

    private static BomLineDto MapBomLine(BomLine entity) =>
        new(entity.Id, entity.SequenceNo, entity.ComponentItemId, entity.QuantityPer, entity.IssueUomId, entity.ScrapPercent, entity.IssueMethod, entity.IsPhantom, entity.AlternateItemId, entity.EffectiveFrom, entity.EffectiveTo);

    private static BomOperationDto MapBomOperation(BomOperation entity) =>
        new(entity.Id, entity.SequenceNo, entity.RoutingOperationId, entity.OperationId, entity.SetupMinutes, entity.RunMinutesPerUnit, entity.TeardownMinutes, entity.RequiresQcCheckpoint, entity.IsOptional);

    private static BomRevisionDto MapBomRevision(BomRevision entity, IReadOnlyCollection<BomLineDto> lines, IReadOnlyCollection<BomOperationDto> operations) =>
        new(entity.Id, entity.RevisionCode, entity.EffectiveFrom, entity.EffectiveTo, entity.ApprovalStatus, entity.RoutingId, entity.ChangeSummary, entity.IsPhantomParentAllowed, lines, operations);

    private static BomDto MapBom(Bom entity, IReadOnlyCollection<BomRevisionDto> revisions) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.ItemId, entity.BomCode, entity.BomName, entity.CurrentReleasedRevisionId, entity.Status, revisions);

    private static AlternateItemDto MapAlternateItem(AlternateItem entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.PrimaryItemId, entity.AlternateItemValueId, entity.ContextType, entity.BomId, entity.PriorityRank, entity.EffectiveFrom, entity.EffectiveTo, entity.ApprovalStatus, entity.ReasonCode);

    private static EngineeringChangeLineDto MapEngineeringChangeLine(EngineeringChangeLine entity) =>
        new(entity.Id, entity.LineNo, entity.ImpactType, entity.TargetEntityId, entity.ActionType, entity.FromValueSummary, entity.ToValueSummary, entity.EffectiveFrom);

    private static EngineeringChangeDto MapEngineeringChange(EngineeringChange entity, IReadOnlyCollection<EngineeringChangeLineDto> lines) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.EcoCode, entity.EcoTitle, entity.ChangeType, entity.RequestedByUserId, entity.RequestedOn, entity.EffectiveFrom, entity.ApprovalStatus, entity.ReasonCode, lines);
}
