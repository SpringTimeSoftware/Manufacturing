using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Inventory;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Abstractions.ServiceManagement;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;
using STS.Mfg.Application.Contracts.ServiceManagement;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.ServiceManagement;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.ServiceManagement;

internal sealed class ServiceManagementService : ApplicationServiceBase, IServiceManagementService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IInventoryService _inventoryService;

    public ServiceManagementService(
        MfgDbContext dbContext,
        IDataScopeService dataScopeService,
        ICurrentUserContextAccessor currentUserContextAccessor,
        IAuditTrail auditTrail,
        IInventoryService inventoryService)
        : base(dbContext, dataScopeService, currentUserContextAccessor, auditTrail)
    {
        _inventoryService = inventoryService;
    }

    public async Task<ServiceDashboardDto> GetDashboardAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ServiceTickets.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyCommonFilters(query, filter);
        var openTickets = await query.CountAsync(record => record.Status != "Closed" && record.Status != "Cancelled", cancellationToken);
        var waitingForParts = await query.CountAsync(record => record.Status == "Waiting for Parts", cancellationToken);
        var activeContracts = await DbContext.ServiceContracts.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).CountAsync(record => record.Status == "Active", cancellationToken);
        var pendingClaims = await DbContext.WarrantyClaims.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).CountAsync(record => record.ApprovalStatus == "Pending", cancellationToken);
        var invoiceReady = await DbContext.ServiceCharges.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).CountAsync(record => record.Status == "InvoiceReady", cancellationToken);
        var reasons = new[]
        {
            "Customer signoff binary signature capture is disabled until a signature-pad storage adapter is configured.",
            "Customer credit note/refund from warranty claim is disabled until the customer-return finance path is configured."
        };

        return new ServiceDashboardDto(openTickets, waitingForParts, activeContracts, pendingClaims, invoiceReady, reasons);
    }

    public async Task<PagedResult<InstalledAssetDto>> ListInstalledAssetsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.InstalledAssets.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyCommonFilters(query, filter);
        if (filter.CustomerId.HasValue)
        {
            query = query.Where(record => record.CustomerId == filter.CustomerId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(record => record.AssetNo.Contains(search) || (record.SerialNo != null && record.SerialNo.Contains(search)) || (record.SourceDocumentNo != null && record.SourceDocumentNo.Contains(search)));
        }

        var page = await query.OrderBy(record => record.AssetNo).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapAsset);
    }

    public async Task<InstalledAssetDto> GetInstalledAssetAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.InstalledAssets.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        return MapAsset(EnsureFound(entity, "Installed asset was not found in the active scope.", "service.asset_not_found"));
    }

    public async Task<InstalledAssetDto> CreateInstalledAssetAsync(InstalledAssetUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateAsset(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        await EnsureCustomerItemAndSourceAsync(request.CustomerId, request.ItemId, request.SourceSalesOrderId, request.SourceDispatchId, request.SourceInvoiceId, cancellationToken);
        var entity = InstalledAsset.Create(ToDraft(request), GetUserId());
        DbContext.InstalledAssets.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapAsset(entity);
        await WriteAuditAsync("service", nameof(InstalledAsset), "service.asset.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<InstalledAssetDto> UpdateInstalledAssetAsync(long id, InstalledAssetUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateAsset(request);
        var entity = await DbContext.InstalledAssets.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Installed asset was not found in the active scope.", "service.asset_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Installed asset company cannot change."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Installed asset branch cannot change."));
        await EnsureCustomerItemAndSourceAsync(request.CustomerId, request.ItemId, request.SourceSalesOrderId, request.SourceDispatchId, request.SourceInvoiceId, cancellationToken);
        var before = MapAsset(entity);
        entity.Update(ToDraft(request), GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapAsset(entity);
        await WriteAuditAsync("service", nameof(InstalledAsset), "service.asset.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<WarrantyPolicyDto>> ListWarrantyPoliciesAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.WarrantyPolicies.AsNoTracking().ApplyCompanyScope(GetScope());
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(record => record.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(record => record.PolicyCode.Contains(search) || record.PolicyName.Contains(search));
        }

        var page = await query.OrderBy(record => record.PolicyCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapPolicy);
    }

    public async Task<WarrantyPolicyDto> CreateWarrantyPolicyAsync(WarrantyPolicyUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePolicy(request);
        if (request.CompanyId.HasValue)
        {
            EnsureContextAccess(request.CompanyId.Value, null);
        }

        var entity = WarrantyPolicy.Create(ToDraft(request), GetUserId());
        DbContext.WarrantyPolicies.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapPolicy(entity);
        await WriteAuditAsync("service", nameof(WarrantyPolicy), "service.warranty_policy.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<WarrantyPolicyDto> UpdateWarrantyPolicyAsync(long id, WarrantyPolicyUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidatePolicy(request);
        var entity = await DbContext.WarrantyPolicies.ApplyCompanyScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Warranty policy was not found in the active scope.", "service.warranty_policy_not_found");
        var before = MapPolicy(entity);
        entity.Update(ToDraft(request), GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapPolicy(entity);
        await WriteAuditAsync("service", nameof(WarrantyPolicy), "service.warranty_policy.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ServiceContractDto>> ListServiceContractsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ServiceContracts.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyCommonFilters(query, filter);
        if (filter.CustomerId.HasValue)
        {
            query = query.Where(record => record.CustomerId == filter.CustomerId.Value);
        }

        if (filter.InstalledAssetId.HasValue)
        {
            query = query.Where(record => record.InstalledAssetId == filter.InstalledAssetId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(record => record.ContractNo.Contains(search) || record.CoverageSummary.Contains(search));
        }

        var page = await query.OrderByDescending(record => record.StartDate).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapContract);
    }

    public async Task<ServiceContractDto> CreateServiceContractAsync(ServiceContractUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateContract(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var entity = ServiceContract.Create(ToDraft(request), GetUserId());
        DbContext.ServiceContracts.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapContract(entity);
        await WriteAuditAsync("service", nameof(ServiceContract), "service.contract.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ServiceContractDto> UpdateServiceContractAsync(long id, ServiceContractUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateContract(request);
        var entity = await DbContext.ServiceContracts.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Service contract was not found in the active scope.", "service.contract_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Service contract company cannot change."));
        var before = MapContract(entity);
        entity.Update(ToDraft(request), GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapContract(entity);
        await WriteAuditAsync("service", nameof(ServiceContract), "service.contract.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<ServiceEntitlementDto> ResolveEntitlementAsync(long? installedAssetId, long? customerId, long? itemId, DateOnly? asOfDate, CancellationToken cancellationToken = default)
    {
        var snapshot = await ResolveEntitlementSnapshotAsync(installedAssetId, customerId, itemId, asOfDate ?? Today(), cancellationToken);
        return new ServiceEntitlementDto(snapshot.EntitlementType, snapshot.Source, snapshot.WarrantyPolicyId, snapshot.ServiceContractId, snapshot.StartDate, snapshot.EndDate, snapshot.CheckedOn, snapshot.SnapshotJson);
    }

    public async Task<PagedResult<ServiceTicketDto>> ListServiceTicketsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ServiceTickets.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyCommonFilters(query, filter);
        if (filter.CustomerId.HasValue)
        {
            query = query.Where(record => record.CustomerId == filter.CustomerId.Value);
        }

        if (filter.InstalledAssetId.HasValue)
        {
            query = query.Where(record => record.InstalledAssetId == filter.InstalledAssetId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(record => record.TicketNo.Contains(search) || record.IssueDescription.Contains(search) || (record.SerialNo != null && record.SerialNo.Contains(search)));
        }

        var page = await query.OrderByDescending(record => record.CreatedOn).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapTicket);
    }

    public async Task<ServiceTicketDto> GetServiceTicketAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.ServiceTickets.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        return MapTicket(EnsureFound(entity, "Service ticket was not found in the active scope.", "service.ticket_not_found"));
    }

    public async Task<ServiceTicketDto> CreateServiceTicketAsync(ServiceTicketUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTicket(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var entitlement = await ResolveEntitlementSnapshotAsync(request.InstalledAssetId, request.CustomerId, request.ItemId, Today(), cancellationToken);
        var assetSnapshot = await BuildAssetSnapshotAsync(request.InstalledAssetId, cancellationToken);
        var entity = ServiceTicket.Create(ToDraft(request), entitlement, assetSnapshot, GetUserId());
        DbContext.ServiceTickets.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapTicket(entity);
        await WriteAuditAsync("service", nameof(ServiceTicket), "service.ticket.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ServiceTicketDto> UpdateServiceTicketAsync(long id, ServiceTicketUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTicket(request);
        var entity = await DbContext.ServiceTickets.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Service ticket was not found in the active scope.", "service.ticket_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Service ticket company cannot change."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Service ticket branch cannot change."));
        var before = MapTicket(entity);
        var entitlement = await ResolveEntitlementSnapshotAsync(request.InstalledAssetId, request.CustomerId, request.ItemId, Today(), cancellationToken);
        var assetSnapshot = await BuildAssetSnapshotAsync(request.InstalledAssetId, cancellationToken);
        try
        {
            entity.UpdateDraft(ToDraft(request), entitlement, assetSnapshot, GetUserId());
        }
        catch (InvalidOperationException ex)
        {
            throw Validation(ex.Message, nameof(request.Status), "service.closed_ticket_locked");
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapTicket(entity);
        await WriteAuditAsync("service", nameof(ServiceTicket), "service.ticket.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<ServiceTicketDto> AssignServiceTicketAsync(long id, ServiceTicketAssignmentRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.ServiceTickets.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Service ticket was not found in the active scope.", "service.ticket_not_found");
        var before = MapTicket(entity);
        try
        {
            entity.Assign(request.AssignedOwnerUserId, request.AssignedTeamId, request.TargetResponseOn, request.TargetResolutionOn, GetUserId());
        }
        catch (InvalidOperationException ex)
        {
            throw Validation(ex.Message, nameof(entity.Status), "service.closed_ticket_locked");
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapTicket(entity);
        await WriteAuditAsync("service", nameof(ServiceTicket), "service.ticket.assign", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<ServiceTicketDto> ChangeServiceTicketStatusAsync(long id, ServiceTicketStatusRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(Required(request.Status, nameof(request.Status), "Service ticket status is required."));
        var entity = await DbContext.ServiceTickets.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Service ticket was not found in the active scope.", "service.ticket_not_found");
        var before = MapTicket(entity);
        try
        {
            entity.ChangeStatus(request.Status, request.Reason, GetUserId());
        }
        catch (InvalidOperationException ex)
        {
            throw Validation(ex.Message, nameof(request.Status), "service.invalid_status_transition");
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapTicket(entity);
        await WriteAuditAsync("service", nameof(ServiceTicket), "service.ticket.status", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ServiceVisitDto>> ListServiceVisitsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ServiceVisits.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyCommonFilters(query, filter);
        if (filter.ServiceTicketId.HasValue)
        {
            query = query.Where(record => record.ServiceTicketId == filter.ServiceTicketId.Value);
        }

        var page = await query.OrderByDescending(record => record.ScheduledStartOn).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapVisit);
    }

    public async Task<ServiceVisitDto> CreateServiceVisitAsync(ServiceVisitUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateVisit(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        await EnsureTicketAllowsVisitAsync(request.ServiceTicketId, cancellationToken);
        var entity = ServiceVisit.Create(ToDraft(request), GetUserId());
        DbContext.ServiceVisits.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapVisit(entity);
        await WriteAuditAsync("service", nameof(ServiceVisit), "service.visit.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ServiceVisitDto> UpdateServiceVisitAsync(long id, ServiceVisitUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateVisit(request);
        var entity = await DbContext.ServiceVisits.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Service visit was not found in the active scope.", "service.visit_not_found");
        await EnsureTicketAllowsVisitAsync(request.ServiceTicketId, cancellationToken);
        var before = MapVisit(entity);
        entity.Update(ToDraft(request), GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapVisit(entity);
        await WriteAuditAsync("service", nameof(ServiceVisit), "service.visit.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ServiceSpareMovementDto>> ListServiceSpareMovementsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ServiceSpareMovements.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).ApplyWarehouseScope(GetScope());
        query = ApplyCommonFilters(query, filter);
        if (filter.ServiceTicketId.HasValue)
        {
            query = query.Where(record => record.ServiceTicketId == filter.ServiceTicketId.Value);
        }

        var page = await query.OrderByDescending(record => record.CreatedOn).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapSpareMovement);
    }

    public async Task<ServiceSparePostResultDto> IssueServiceSpareAsync(ServiceSpareMovementRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSpareMovement(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureWarehouseAccess(request.WarehouseId);
        var ticket = await EnsureServiceTicketAsync(request.ServiceTicketId, cancellationToken);
        var movement = ServiceSpareMovement.Create(ToDraft(request, "Issue"), GetUserId());
        DbContext.ServiceSpareMovements.Add(movement);
        await DbContext.SaveChangesAsync(cancellationToken);

        try
        {
            var transactions = await _inventoryService.IssueStockAsync(new StockIssueRequest(
                request.CompanyId,
                request.BranchId ?? 0,
                $"SSI-{movement.Id.ToString(CultureInfo.InvariantCulture)}",
                request.PostingDate,
                "ServiceSpareIssue",
                movement.Id,
                request.Remarks,
                new[]
                {
                    new StockIssueLineRequest(
                        1,
                        request.ItemId,
                        null,
                        request.WarehouseId,
                        request.BinId,
                        request.LotId,
                        request.SerialId,
                        request.Quantity,
                        null,
                        request.InventoryState,
                        null,
                        null,
                        null,
                        request.SerialNo,
                        request.PcidId,
                        null,
                        request.SourceDocumentNo ?? ticket.TicketNo,
                        movement.Id,
                        null,
                        null,
                        request.ItemRevisionId,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null)
                }),
                cancellationToken);

            movement.MarkPosted(transactions.FirstOrDefault()?.Id, GetUserId());
            await DbContext.SaveChangesAsync(cancellationToken);
            var dto = MapSpareMovement(movement);
            await WriteAuditAsync("service", nameof(ServiceSpareMovement), "service.spare.issue", movement.Id, null, dto, cancellationToken);
            return new ServiceSparePostResultDto(dto, transactions);
        }
        catch (Exception ex) when (ex is ValidationFailureException)
        {
            movement.MarkFailed(ex.Message, GetUserId());
            await DbContext.SaveChangesAsync(cancellationToken);
            throw;
        }
    }

    public async Task<ServiceSparePostResultDto> ReturnServiceSpareAsync(ServiceSpareMovementRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSpareMovement(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureWarehouseAccess(request.WarehouseId);
        var ticket = await EnsureServiceTicketAsync(request.ServiceTicketId, cancellationToken);
        var movement = ServiceSpareMovement.Create(ToDraft(request, "Return"), GetUserId());
        DbContext.ServiceSpareMovements.Add(movement);
        await DbContext.SaveChangesAsync(cancellationToken);

        var transactions = await _inventoryService.ReturnStockAsync(new StockReturnRequest(
            request.CompanyId,
            request.BranchId ?? 0,
            $"SSR-{movement.Id.ToString(CultureInfo.InvariantCulture)}",
            request.PostingDate,
            "ServiceSpareReturn",
            movement.Id,
            request.Remarks,
            new[]
            {
                new StockReturnLineRequest(
                    1,
                    request.ItemId,
                    null,
                    request.WarehouseId,
                    request.BinId,
                    request.LotId,
                    request.SerialId,
                    request.Quantity,
                    null,
                    request.InventoryState,
                    null,
                    null,
                    null,
                    request.SerialNo,
                    request.PcidId,
                    null,
                    request.SourceDocumentNo ?? ticket.TicketNo,
                    movement.Id,
                    null,
                    null,
                    request.ItemRevisionId,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null)
            }),
            cancellationToken);

        movement.MarkPosted(transactions.FirstOrDefault()?.Id, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapSpareMovement(movement);
        await WriteAuditAsync("service", nameof(ServiceSpareMovement), "service.spare.return", movement.Id, null, dto, cancellationToken);
        return new ServiceSparePostResultDto(dto, transactions);
    }

    public async Task<PagedResult<WarrantyClaimDto>> ListWarrantyClaimsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.WarrantyClaims.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyCommonFilters(query, filter);
        if (filter.ServiceTicketId.HasValue)
        {
            query = query.Where(record => record.ServiceTicketId == filter.ServiceTicketId.Value);
        }

        var page = await query.OrderByDescending(record => record.CreatedOn).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapWarrantyClaim);
    }

    public async Task<WarrantyClaimDto> CreateWarrantyClaimAsync(WarrantyClaimUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWarrantyClaim(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        if (request.EntitlementType is not ("Warranty" or "AMC") && string.IsNullOrWhiteSpace(request.OverrideReason))
        {
            throw Validation("Warranty claim requires active entitlement or override reason.", nameof(request.OverrideReason), "service.claim_entitlement_required");
        }

        var entity = WarrantyClaim.Create(ToDraft(request), GetUserId());
        DbContext.WarrantyClaims.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapWarrantyClaim(entity);
        await WriteAuditAsync("service", nameof(WarrantyClaim), "service.warranty_claim.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<WarrantyClaimDto> DecideWarrantyClaimAsync(long id, WarrantyClaimDecisionRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(Required(request.ApprovalStatus, nameof(request.ApprovalStatus), "Claim decision is required."));
        if (string.Equals(request.ApprovalStatus, "Rejected", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(request.RejectionReason))
        {
            throw Validation("Rejected warranty claims require a reason.", nameof(request.RejectionReason), "service.claim_rejection_reason_required");
        }

        var entity = await DbContext.WarrantyClaims.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Warranty claim was not found in the active scope.", "service.claim_not_found");
        var before = MapWarrantyClaim(entity);
        entity.Decide(request.ApprovalStatus, request.Disposition, request.RejectionReason, request.OverrideReason, request.ReplacementAssetId, GetUserId());
        if (request.ReplacementAssetId.HasValue && entity.InstalledAssetId.HasValue)
        {
            var oldAsset = await DbContext.InstalledAssets.FirstOrDefaultAsync(record => record.Id == entity.InstalledAssetId.Value, cancellationToken);
            oldAsset?.MarkReplaced(GetUserId());
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapWarrantyClaim(entity);
        await WriteAuditAsync("service", nameof(WarrantyClaim), "service.warranty_claim.decide", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ServiceChargeDto>> ListServiceChargesAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.ServiceCharges.AsNoTracking().ApplyActiveOrganizationScope(GetScope());
        query = ApplyCommonFilters(query, filter);
        if (filter.ServiceTicketId.HasValue)
        {
            query = query.Where(record => record.ServiceTicketId == filter.ServiceTicketId.Value);
        }

        var page = await query.OrderByDescending(record => record.CreatedOn).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapCharge);
    }

    public async Task<ServiceChargeDto> CreateServiceChargeAsync(ServiceChargeUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCharge(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        var entity = ServiceCharge.Create(ToDraft(request), GetUserId());
        DbContext.ServiceCharges.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);
        var dto = MapCharge(entity);
        await WriteAuditAsync("service", nameof(ServiceCharge), "service.charge.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ServiceChargeDto> MarkServiceChargeInvoiceReadyAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.ServiceCharges.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Service charge was not found in the active scope.", "service.charge_not_found");
        if (!string.Equals(entity.BillableStatus, "Billable", StringComparison.OrdinalIgnoreCase))
        {
            throw Validation("Only billable service charges can be marked invoice-ready.", nameof(entity.BillableStatus), "service.charge_not_billable");
        }

        var before = MapCharge(entity);
        entity.MarkInvoiceReady(GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        var after = MapCharge(entity);
        await WriteAuditAsync("service", nameof(ServiceCharge), "service.charge.invoice_ready", entity.Id, before, after, cancellationToken);
        return after;
    }

    private async Task<EntitlementSnapshot> ResolveEntitlementSnapshotAsync(long? installedAssetId, long? customerId, long? itemId, DateOnly asOfDate, CancellationToken cancellationToken)
    {
        InstalledAsset? asset = null;
        if (installedAssetId.HasValue)
        {
            asset = await DbContext.InstalledAssets.AsNoTracking().ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == installedAssetId.Value, cancellationToken);
            asset = EnsureFound(asset, "Installed asset was not found for entitlement.", "service.asset_not_found");
            customerId ??= asset.CustomerId;
            itemId ??= asset.ItemId;
        }

        var contract = await DbContext.ServiceContracts.AsNoTracking()
            .ApplyActiveOrganizationScope(GetScope())
            .Where(record => record.Status == "Active"
                && record.CustomerId == customerId
                && (!record.InstalledAssetId.HasValue || record.InstalledAssetId == installedAssetId)
                && record.StartDate <= asOfDate
                && record.EndDate >= asOfDate)
            .OrderBy(record => record.InstalledAssetId == installedAssetId ? 0 : 1)
            .ThenByDescending(record => record.StartDate)
            .FirstOrDefaultAsync(cancellationToken);
        if (contract is not null)
        {
            return Snapshot("AMC", "Active service contract", null, contract.Id, contract.StartDate, contract.EndDate, asOfDate, new
            {
                contract.ContractNo,
                contract.CoverageSummary,
                contract.SlaResponseHours,
                contract.VersionNo
            });
        }

        var policy = await DbContext.WarrantyPolicies.AsNoTracking()
            .ApplyCompanyScope(GetScope())
            .Where(record => record.Status == "Active" && (!record.ItemId.HasValue || record.ItemId == itemId))
            .OrderBy(record => record.ItemId == itemId ? 0 : 1)
            .ThenBy(record => record.PolicyCode)
            .FirstOrDefaultAsync(cancellationToken);
        if (policy is not null)
        {
            var start = asset?.WarrantyStartDate ?? asset?.InstallationDate ?? asOfDate;
            var end = asset?.WarrantyEndDate ?? start.AddDays(policy.DurationDays);
            var type = start <= asOfDate && end >= asOfDate ? "Warranty" : "Paid";
            var source = type == "Warranty" ? "Active warranty policy" : "Expired warranty policy";
            return Snapshot(type, source, policy.Id, null, start, end, asOfDate, new
            {
                policy.PolicyCode,
                policy.DurationDays,
                policy.StartTrigger,
                policy.CoversParts,
                policy.CoversLabor,
                policy.CoversOnsite,
                policy.CoversReplacement
            });
        }

        return Snapshot("Unknown", "No configured warranty policy or AMC contract", null, null, null, null, asOfDate, new
        {
            installedAssetId,
            customerId,
            itemId
        });
    }

    private static EntitlementSnapshot Snapshot(string type, string source, long? policyId, long? contractId, DateOnly? start, DateOnly? end, DateOnly checkedOn, object payload) =>
        new(type, source, policyId, contractId, start, end, checkedOn, JsonSerializer.Serialize(payload, JsonOptions));

    private async Task<string?> BuildAssetSnapshotAsync(long? assetId, CancellationToken cancellationToken)
    {
        if (!assetId.HasValue)
        {
            return null;
        }

        var asset = await DbContext.InstalledAssets.AsNoTracking().FirstOrDefaultAsync(record => record.Id == assetId.Value, cancellationToken);
        return asset is null
            ? null
            : JsonSerializer.Serialize(new
            {
                asset.AssetNo,
                asset.CustomerId,
                asset.ItemId,
                asset.ItemRevisionId,
                asset.SerialNo,
                asset.SourceDocumentType,
                asset.SourceDocumentNo,
                asset.SourceDocumentRevisionNo,
                asset.InstallationDate,
                asset.WarrantyStartDate,
                asset.WarrantyEndDate
            }, JsonOptions);
    }

    private async Task EnsureCustomerItemAndSourceAsync(long customerId, long itemId, long? salesOrderId, long? dispatchId, long? invoiceId, CancellationToken cancellationToken)
    {
        _ = await DbContext.Customers.AsNoTracking().FirstOrDefaultAsync(record => record.Id == customerId, cancellationToken)
            ?? throw Validation("Customer was not found for installed asset.", nameof(customerId), "service.customer_not_found");
        _ = await DbContext.Items.AsNoTracking().FirstOrDefaultAsync(record => record.Id == itemId, cancellationToken)
            ?? throw Validation("Item was not found for installed asset.", nameof(itemId), "service.item_not_found");

        if (salesOrderId.HasValue)
        {
            _ = await DbContext.SalesOrders.AsNoTracking().FirstOrDefaultAsync(record => record.Id == salesOrderId.Value, cancellationToken)
                ?? throw Validation("Source sales order was not found.", nameof(salesOrderId), "service.sales_order_not_found");
        }

        if (dispatchId.HasValue)
        {
            _ = await DbContext.Shipments.AsNoTracking().FirstOrDefaultAsync(record => record.Id == dispatchId.Value, cancellationToken)
                ?? throw Validation("Source dispatch shipment was not found.", nameof(dispatchId), "service.dispatch_not_found");
        }

        if (invoiceId.HasValue)
        {
            _ = await DbContext.AccountsReceivableInvoices.AsNoTracking().FirstOrDefaultAsync(record => record.Id == invoiceId.Value, cancellationToken)
                ?? throw Validation("Source AR invoice was not found.", nameof(invoiceId), "service.invoice_not_found");
        }
    }

    private async Task<ServiceTicket> EnsureServiceTicketAsync(long id, CancellationToken cancellationToken)
    {
        var ticket = await DbContext.ServiceTickets.ApplyActiveOrganizationScope(GetScope()).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        ticket = EnsureFound(ticket, "Service ticket was not found in the active scope.", "service.ticket_not_found");
        if (ticket.Status is "Closed" or "Cancelled")
        {
            throw Validation("Closed or cancelled tickets cannot consume service spares.", nameof(ticket.Status), "service.ticket_closed");
        }

        return ticket;
    }

    private async Task EnsureTicketAllowsVisitAsync(long ticketId, CancellationToken cancellationToken)
    {
        var ticket = await EnsureServiceTicketAsync(ticketId, cancellationToken);
        if (ticket.Status == "Draft")
        {
            throw Validation("Service visit cannot be created before ticket registration or assignment.", nameof(ticket.Status), "service.ticket_not_ready");
        }
    }

    private static IQueryable<T> ApplyCommonFilters<T>(IQueryable<T> query, ServiceManagementFilter filter)
        where T : class
    {
        if (typeof(T).GetProperty("CompanyId") is not null && filter.CompanyId.HasValue)
        {
            query = query.Where(record => EF.Property<long?>(record, "CompanyId") == filter.CompanyId.Value);
        }

        if (typeof(T).GetProperty("BranchId") is not null && filter.BranchId.HasValue)
        {
            query = query.Where(record => EF.Property<long?>(record, "BranchId") == filter.BranchId.Value);
        }

        if (typeof(T).GetProperty("Status") is not null && !string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(record => EF.Property<string>(record, "Status") == status);
        }

        return query;
    }

    private static DateOnly Today() => DateOnly.FromDateTime(DateTime.UtcNow.Date);

    private static ValidationFailureException Validation(string message, string? field, string code) =>
        new(new[] { new ApiError(code, field, message) });

    private static InstalledAssetDraft ToDraft(InstalledAssetUpsertRequest request) =>
        new(request.CompanyId, request.BranchId, request.AssetNo, request.CustomerId, request.CustomerSiteId, request.CustomerContactId, request.ItemId, request.ItemRevisionId, request.SerialId, request.SerialNo, request.LotId, request.PcidId, request.SourceSalesOrderId, request.SourceSalesOrderLineId, request.SourceDispatchId, request.SourceDispatchLineId, request.SourceInvoiceId, request.SourceDocumentType, request.SourceDocumentNo, request.SourceDocumentRevisionNo, request.InstallationDate, request.CommissioningDate, request.WarrantyStartDate, request.WarrantyEndDate, request.ServiceContractId, request.Status, request.LocationSnapshot, request.Remarks, request.LegacySourceIncomplete);

    private static WarrantyPolicyDraft ToDraft(WarrantyPolicyUpsertRequest request) =>
        new(request.CompanyId, request.PolicyCode, request.PolicyName, request.ItemId, request.ItemGroupId, request.CustomerGroupId, request.DurationDays, request.StartTrigger, request.CoversParts, request.CoversLabor, request.CoversOnsite, request.CoversReplacement, request.Exclusions, request.ClaimLimitAmount, request.Status);

    private static ServiceContractDraft ToDraft(ServiceContractUpsertRequest request) =>
        new(request.CompanyId, request.BranchId, request.ContractNo, request.CustomerId, request.InstalledAssetId, request.StartDate, request.EndDate, request.RenewalDate, request.CoverageSummary, request.VisitFrequencyDays, request.PreventiveScheduleJson, request.SlaResponseHours, request.BillingTermsId, request.ContractValueAmount, request.TaxCodeId, request.TaxRateSnapshot, request.Status, request.VersionNo, request.PriorContractId);

    private static ServiceTicketDraft ToDraft(ServiceTicketUpsertRequest request) =>
        new(request.CompanyId, request.BranchId, request.TicketNo, request.CustomerId, request.ContactId, request.InstalledAssetId, request.ItemId, request.SerialNo, request.IssueCategory, request.IssueDescription, request.Priority, request.Severity, request.Channel, request.SourceIntegrationMessageId, request.AssignedOwnerUserId, request.AssignedTeamId, request.TargetResponseOn, request.TargetResolutionOn, request.Status, request.InternalRemarks, request.CustomerFacingRemarks, request.SourceSalesOrderId, request.SourceDispatchId, request.SourceInvoiceId);

    private static ServiceVisitDraft ToDraft(ServiceVisitUpsertRequest request) =>
        new(request.CompanyId, request.BranchId, request.ServiceTicketId, request.TechnicianUserId, request.TeamId, request.ScheduledStartOn, request.ScheduledEndOn, request.VisitAddressSnapshot, request.TravelStartedOn, request.WorkStartedOn, request.WorkEndedOn, request.WorkPerformed, request.Diagnosis, request.Resolution, request.CustomerSignoffName, request.CustomerSignoffOn, request.EvidenceAttachmentId, request.PhotoEvidenceId, request.Status, request.Remarks);

    private static ServiceSpareMovementDraft ToDraft(ServiceSpareMovementRequest request, string movementType) =>
        new(request.CompanyId, request.BranchId, request.MovementNo, movementType, request.ServiceTicketId, request.ServiceVisitId, request.ItemId, request.ItemRevisionId, request.WarehouseId, request.BinId, request.LotId, request.SerialId, request.SerialNo, request.PcidId, request.Quantity, request.InventoryState, request.ReplacementInstalledAssetId, request.DefectiveInstalledAssetId, request.ReasonCode, request.Remarks);

    private static WarrantyClaimDraft ToDraft(WarrantyClaimUpsertRequest request) =>
        new(request.CompanyId, request.BranchId, request.ClaimNo, request.ServiceTicketId, request.InstalledAssetId, request.CustomerId, request.ItemId, request.SerialNo, request.ClaimType, request.EntitlementType, request.EntitlementSnapshotJson, request.ApprovalStatus, request.Disposition, request.ReplacementAssetId, request.CostDecision, request.RejectionReason, request.OverrideReason, request.Status);

    private static ServiceChargeDraft ToDraft(ServiceChargeUpsertRequest request) =>
        new(request.CompanyId, request.BranchId, request.ChargeNo, request.ServiceTicketId, request.CustomerId, request.CurrencyId, request.LaborAmount, request.PartsAmount, request.TravelAmount, request.OtherAmount, request.DiscountAmount, request.TaxCodeId, request.TaxRateSnapshot, request.TaxAmount, request.TotalAmount, request.BillableStatus, request.NonBillableReason, request.ArInvoiceId, request.Status, request.SnapshotJson);

    private static void ValidateAsset(InstalledAssetUpsertRequest request) => ThrowIfInvalid(
        Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
        Required(request.AssetNo, nameof(request.AssetNo), "Asset number is required."),
        Positive(request.CustomerId, nameof(request.CustomerId), "Customer is required."),
        Positive(request.ItemId, nameof(request.ItemId), "Item is required."),
        Required(request.Status, nameof(request.Status), "Asset status is required."));

    private static void ValidatePolicy(WarrantyPolicyUpsertRequest request) => ThrowIfInvalid(
        Required(request.PolicyCode, nameof(request.PolicyCode), "Policy code is required."),
        Required(request.PolicyName, nameof(request.PolicyName), "Policy name is required."),
        request.DurationDays <= 0 ? new ApiError("validation.out_of_range", nameof(request.DurationDays), "Warranty duration must be positive.") : null,
        Required(request.StartTrigger, nameof(request.StartTrigger), "Warranty start trigger is required."),
        Required(request.Status, nameof(request.Status), "Policy status is required."));

    private static void ValidateContract(ServiceContractUpsertRequest request) => ThrowIfInvalid(
        Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
        Required(request.ContractNo, nameof(request.ContractNo), "Contract number is required."),
        Positive(request.CustomerId, nameof(request.CustomerId), "Customer is required."),
        request.EndDate < request.StartDate ? new ApiError("validation.date_range", nameof(request.EndDate), "Contract end date must be on or after start date.") : null,
        Required(request.CoverageSummary, nameof(request.CoverageSummary), "Coverage summary is required."),
        Required(request.Status, nameof(request.Status), "Contract status is required."));

    private static void ValidateTicket(ServiceTicketUpsertRequest request) => ThrowIfInvalid(
        Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
        Required(request.TicketNo, nameof(request.TicketNo), "Ticket number is required."),
        Positive(request.CustomerId, nameof(request.CustomerId), "Customer is required."),
        Required(request.IssueCategory, nameof(request.IssueCategory), "Issue category is required."),
        Required(request.IssueDescription, nameof(request.IssueDescription), "Issue description is required."),
        Required(request.Priority, nameof(request.Priority), "Priority is required."),
        Required(request.Status, nameof(request.Status), "Ticket status is required."));

    private static void ValidateVisit(ServiceVisitUpsertRequest request) => ThrowIfInvalid(
        Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
        Positive(request.ServiceTicketId, nameof(request.ServiceTicketId), "Service ticket is required."),
        Required(request.Status, nameof(request.Status), "Visit status is required."),
        string.Equals(request.Status, "Completed", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(request.Resolution)
            ? new ApiError("validation.required", nameof(request.Resolution), "Completed visits require resolution.")
            : null);

    private static void ValidateSpareMovement(ServiceSpareMovementRequest request) => ThrowIfInvalid(
        Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
        Required(request.MovementNo, nameof(request.MovementNo), "Movement number is required."),
        Positive(request.ServiceTicketId, nameof(request.ServiceTicketId), "Service ticket is required."),
        Positive(request.ItemId, nameof(request.ItemId), "Spare item is required."),
        Positive(request.WarehouseId, nameof(request.WarehouseId), "Warehouse is required."),
        Positive(request.Quantity, nameof(request.Quantity), "Quantity must be positive."),
        Required(request.InventoryState, nameof(request.InventoryState), "Inventory state is required."));

    private static void ValidateWarrantyClaim(WarrantyClaimUpsertRequest request) => ThrowIfInvalid(
        Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
        Required(request.ClaimNo, nameof(request.ClaimNo), "Claim number is required."),
        Positive(request.ServiceTicketId, nameof(request.ServiceTicketId), "Service ticket is required."),
        Positive(request.CustomerId, nameof(request.CustomerId), "Customer is required."),
        Required(request.ClaimType, nameof(request.ClaimType), "Claim type is required."),
        Required(request.EntitlementType, nameof(request.EntitlementType), "Entitlement type is required."));

    private static void ValidateCharge(ServiceChargeUpsertRequest request) => ThrowIfInvalid(
        Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
        Required(request.ChargeNo, nameof(request.ChargeNo), "Charge number is required."),
        Positive(request.ServiceTicketId, nameof(request.ServiceTicketId), "Service ticket is required."),
        Positive(request.CustomerId, nameof(request.CustomerId), "Customer is required."),
        NonNegative(request.LaborAmount, nameof(request.LaborAmount), "Labor amount cannot be negative."),
        NonNegative(request.PartsAmount, nameof(request.PartsAmount), "Parts amount cannot be negative."),
        NonNegative(request.TravelAmount, nameof(request.TravelAmount), "Travel amount cannot be negative."),
        NonNegative(request.OtherAmount, nameof(request.OtherAmount), "Other amount cannot be negative."),
        NonNegative(request.DiscountAmount, nameof(request.DiscountAmount), "Discount amount cannot be negative."),
        NonNegative(request.TaxAmount, nameof(request.TaxAmount), "Tax amount cannot be negative."),
        NonNegative(request.TotalAmount, nameof(request.TotalAmount), "Total amount cannot be negative."),
        Required(request.BillableStatus, nameof(request.BillableStatus), "Billable status is required."),
        Required(request.Status, nameof(request.Status), "Charge status is required."));

    private static InstalledAssetDto MapAsset(InstalledAsset entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.AssetNo, entity.CustomerId, entity.CustomerSiteId, entity.CustomerContactId, entity.ItemId, entity.ItemRevisionId, entity.SerialId, entity.SerialNo, entity.LotId, entity.PcidId, entity.SourceSalesOrderId, entity.SourceSalesOrderLineId, entity.SourceDispatchId, entity.SourceDispatchLineId, entity.SourceInvoiceId, entity.SourceDocumentType, entity.SourceDocumentNo, entity.SourceDocumentRevisionNo, entity.InstallationDate, entity.CommissioningDate, entity.WarrantyStartDate, entity.WarrantyEndDate, entity.ServiceContractId, entity.Status, entity.LocationSnapshot, entity.Remarks, entity.LegacySourceIncomplete);

    private static WarrantyPolicyDto MapPolicy(WarrantyPolicy entity) =>
        new(entity.Id, entity.CompanyId, entity.PolicyCode, entity.PolicyName, entity.ItemId, entity.ItemGroupId, entity.CustomerGroupId, entity.DurationDays, entity.StartTrigger, entity.CoversParts, entity.CoversLabor, entity.CoversOnsite, entity.CoversReplacement, entity.Exclusions, entity.ClaimLimitAmount, entity.Status);

    private static ServiceContractDto MapContract(ServiceContract entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.ContractNo, entity.CustomerId, entity.InstalledAssetId, entity.StartDate, entity.EndDate, entity.RenewalDate, entity.CoverageSummary, entity.VisitFrequencyDays, entity.PreventiveScheduleJson, entity.SlaResponseHours, entity.BillingTermsId, entity.ContractValueAmount, entity.TaxCodeId, entity.TaxRateSnapshot, entity.Status, entity.VersionNo, entity.PriorContractId);

    private static ServiceTicketDto MapTicket(ServiceTicket entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.TicketNo, entity.CustomerId, entity.ContactId, entity.InstalledAssetId, entity.ItemId, entity.SerialNo, entity.IssueCategory, entity.IssueDescription, entity.Priority, entity.Severity, entity.Channel, entity.SourceIntegrationMessageId, entity.EntitlementType, entity.EntitlementSource, entity.EntitlementPolicyId, entity.EntitlementContractId, entity.EntitlementSnapshotJson, entity.EntitlementCheckedOn, entity.AssignedOwnerUserId, entity.AssignedTeamId, entity.TargetResponseOn, entity.TargetResolutionOn, entity.Status, entity.InternalRemarks, entity.CustomerFacingRemarks, entity.SourceSalesOrderId, entity.SourceDispatchId, entity.SourceInvoiceId, entity.AssetSnapshotJson, entity.ReopenReason, entity.ClosedOn, entity.ClosedByUserId, entity.ClosureReason);

    private static ServiceVisitDto MapVisit(ServiceVisit entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.ServiceTicketId, entity.TechnicianUserId, entity.TeamId, entity.ScheduledStartOn, entity.ScheduledEndOn, entity.VisitAddressSnapshot, entity.TravelStartedOn, entity.WorkStartedOn, entity.WorkEndedOn, entity.WorkPerformed, entity.Diagnosis, entity.Resolution, entity.CustomerSignoffName, entity.CustomerSignoffOn, entity.EvidenceAttachmentId, entity.PhotoEvidenceId, entity.Status, entity.Remarks);

    private static ServiceSpareMovementDto MapSpareMovement(ServiceSpareMovement entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.MovementNo, entity.MovementType, entity.ServiceTicketId, entity.ServiceVisitId, entity.ItemId, entity.ItemRevisionId, entity.WarehouseId ?? 0, entity.BinId, entity.LotId, entity.SerialId, entity.SerialNo, entity.PcidId, entity.Quantity, entity.InventoryState, entity.StockTransactionId, entity.ReplacementInstalledAssetId, entity.DefectiveInstalledAssetId, entity.Status, entity.ReasonCode, entity.Remarks);

    private static WarrantyClaimDto MapWarrantyClaim(WarrantyClaim entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.ClaimNo, entity.ServiceTicketId, entity.InstalledAssetId, entity.CustomerId, entity.ItemId, entity.SerialNo, entity.ClaimType, entity.EntitlementType, entity.EntitlementSnapshotJson, entity.ApprovalStatus, entity.Disposition, entity.ReplacementAssetId, entity.CostDecision, entity.RejectionReason, entity.OverrideReason, entity.Status);

    private static ServiceChargeDto MapCharge(ServiceCharge entity) =>
        new(entity.Id, entity.CompanyId, entity.BranchId, entity.ChargeNo, entity.ServiceTicketId, entity.CustomerId, entity.CurrencyId, entity.LaborAmount, entity.PartsAmount, entity.TravelAmount, entity.OtherAmount, entity.DiscountAmount, entity.TaxCodeId, entity.TaxRateSnapshot, entity.TaxAmount, entity.TotalAmount, entity.BillableStatus, entity.NonBillableReason, entity.ArInvoiceId, entity.Status, entity.SnapshotJson);
}
