using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Abstractions.ServiceManagement;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.ServiceManagement;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/service")]
public sealed class ServiceManagementController(IServiceManagementService serviceManagementService) : ApiControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiEnvelope<ServiceDashboardDto>>> Dashboard([FromQuery] ServiceManagementFilter filter, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.GetDashboardAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("installed-assets")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<InstalledAssetDto>>>> ListInstalledAssets([FromQuery] ServiceManagementFilter filter, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ListInstalledAssetsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("installed-assets/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<InstalledAssetDto>>> GetInstalledAsset(long id, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.GetInstalledAssetAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("installed-assets")]
    public async Task<ActionResult<ApiEnvelope<InstalledAssetDto>>> CreateInstalledAsset([FromBody] InstalledAssetUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.CreateInstalledAssetAsync(request, cancellationToken);
        return OkEnvelope(response, "Installed asset saved.");
    }

    [HttpPut("installed-assets/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<InstalledAssetDto>>> UpdateInstalledAsset(long id, [FromBody] InstalledAssetUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.UpdateInstalledAssetAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Installed asset updated.");
    }

    [HttpGet("warranty-policies")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<WarrantyPolicyDto>>>> ListWarrantyPolicies([FromQuery] ServiceManagementFilter filter, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ListWarrantyPoliciesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("warranty-policies")]
    public async Task<ActionResult<ApiEnvelope<WarrantyPolicyDto>>> CreateWarrantyPolicy([FromBody] WarrantyPolicyUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.CreateWarrantyPolicyAsync(request, cancellationToken);
        return OkEnvelope(response, "Warranty policy saved.");
    }

    [HttpPut("warranty-policies/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<WarrantyPolicyDto>>> UpdateWarrantyPolicy(long id, [FromBody] WarrantyPolicyUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.UpdateWarrantyPolicyAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Warranty policy updated.");
    }

    [HttpGet("contracts")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ServiceContractDto>>>> ListContracts([FromQuery] ServiceManagementFilter filter, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ListServiceContractsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("contracts")]
    public async Task<ActionResult<ApiEnvelope<ServiceContractDto>>> CreateContract([FromBody] ServiceContractUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.CreateServiceContractAsync(request, cancellationToken);
        return OkEnvelope(response, "Service contract saved.");
    }

    [HttpPut("contracts/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ServiceContractDto>>> UpdateContract(long id, [FromBody] ServiceContractUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.UpdateServiceContractAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Service contract updated.");
    }

    [HttpGet("entitlement")]
    public async Task<ActionResult<ApiEnvelope<ServiceEntitlementDto>>> ResolveEntitlement([FromQuery] long? installedAssetId, [FromQuery] long? customerId, [FromQuery] long? itemId, [FromQuery] DateOnly? asOfDate, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ResolveEntitlementAsync(installedAssetId, customerId, itemId, asOfDate, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("tickets")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ServiceTicketDto>>>> ListTickets([FromQuery] ServiceManagementFilter filter, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ListServiceTicketsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("tickets/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ServiceTicketDto>>> GetTicket(long id, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.GetServiceTicketAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("tickets")]
    public async Task<ActionResult<ApiEnvelope<ServiceTicketDto>>> CreateTicket([FromBody] ServiceTicketUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.CreateServiceTicketAsync(request, cancellationToken);
        return OkEnvelope(response, "Service ticket saved.");
    }

    [HttpPut("tickets/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ServiceTicketDto>>> UpdateTicket(long id, [FromBody] ServiceTicketUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.UpdateServiceTicketAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Service ticket updated.");
    }

    [HttpPost("tickets/{id:long}/assign")]
    public async Task<ActionResult<ApiEnvelope<ServiceTicketDto>>> AssignTicket(long id, [FromBody] ServiceTicketAssignmentRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.AssignServiceTicketAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Service ticket assigned.");
    }

    [HttpPost("tickets/{id:long}/status")]
    public async Task<ActionResult<ApiEnvelope<ServiceTicketDto>>> ChangeTicketStatus(long id, [FromBody] ServiceTicketStatusRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ChangeServiceTicketStatusAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Service ticket status updated.");
    }

    [HttpGet("visits")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ServiceVisitDto>>>> ListVisits([FromQuery] ServiceManagementFilter filter, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ListServiceVisitsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("visits")]
    public async Task<ActionResult<ApiEnvelope<ServiceVisitDto>>> CreateVisit([FromBody] ServiceVisitUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.CreateServiceVisitAsync(request, cancellationToken);
        return OkEnvelope(response, "Service visit saved.");
    }

    [HttpPut("visits/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ServiceVisitDto>>> UpdateVisit(long id, [FromBody] ServiceVisitUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.UpdateServiceVisitAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Service visit updated.");
    }

    [HttpGet("spares")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ServiceSpareMovementDto>>>> ListSpares([FromQuery] ServiceManagementFilter filter, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ListServiceSpareMovementsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("spares/issue")]
    public async Task<ActionResult<ApiEnvelope<ServiceSparePostResultDto>>> IssueSpare([FromBody] ServiceSpareMovementRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.IssueServiceSpareAsync(request, cancellationToken);
        return OkEnvelope(response, "Service spare issued.");
    }

    [HttpPost("spares/return")]
    public async Task<ActionResult<ApiEnvelope<ServiceSparePostResultDto>>> ReturnSpare([FromBody] ServiceSpareMovementRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ReturnServiceSpareAsync(request, cancellationToken);
        return OkEnvelope(response, "Service spare returned.");
    }

    [HttpGet("warranty-claims")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<WarrantyClaimDto>>>> ListWarrantyClaims([FromQuery] ServiceManagementFilter filter, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ListWarrantyClaimsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("warranty-claims")]
    public async Task<ActionResult<ApiEnvelope<WarrantyClaimDto>>> CreateWarrantyClaim([FromBody] WarrantyClaimUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.CreateWarrantyClaimAsync(request, cancellationToken);
        return OkEnvelope(response, "Warranty claim saved.");
    }

    [HttpPost("warranty-claims/{id:long}/decision")]
    public async Task<ActionResult<ApiEnvelope<WarrantyClaimDto>>> DecideWarrantyClaim(long id, [FromBody] WarrantyClaimDecisionRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.DecideWarrantyClaimAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Warranty claim decision saved.");
    }

    [HttpGet("charges")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ServiceChargeDto>>>> ListCharges([FromQuery] ServiceManagementFilter filter, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.ListServiceChargesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("charges")]
    public async Task<ActionResult<ApiEnvelope<ServiceChargeDto>>> CreateCharge([FromBody] ServiceChargeUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.CreateServiceChargeAsync(request, cancellationToken);
        return OkEnvelope(response, "Service charge saved.");
    }

    [HttpPost("charges/{id:long}/invoice-ready")]
    public async Task<ActionResult<ApiEnvelope<ServiceChargeDto>>> MarkInvoiceReady(long id, CancellationToken cancellationToken)
    {
        var response = await serviceManagementService.MarkServiceChargeInvoiceReadyAsync(id, cancellationToken);
        return OkEnvelope(response, "Service charge marked invoice-ready.");
    }
}
