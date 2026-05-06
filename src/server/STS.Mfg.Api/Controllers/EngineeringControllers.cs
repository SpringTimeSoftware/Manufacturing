using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Engineering;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Engineering;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/routings")]
public sealed class RoutingsController(IEngineeringService engineeringService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<RoutingDto>>>> List(
        [FromQuery] EngineeringFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.ListRoutingsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<RoutingDto>>> GetRouting(long id, CancellationToken cancellationToken)
    {
        var response = await engineeringService.GetRoutingAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<RoutingDto>>> Create(
        [FromBody] RoutingUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.CreateRoutingAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetRouting), new { id = response.Id }, response, "Routing created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<RoutingDto>>> Update(
        long id,
        [FromBody] RoutingUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.UpdateRoutingAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Routing updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/boms")]
public sealed class BomsController(IEngineeringService engineeringService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<BomDto>>>> List(
        [FromQuery] EngineeringFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.ListBomsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BomDto>>> GetBom(long id, CancellationToken cancellationToken)
    {
        var response = await engineeringService.GetBomAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<BomDto>>> Create(
        [FromBody] BomUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.CreateBomAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetBom), new { id = response.Id }, response, "BOM created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BomDto>>> Update(
        long id,
        [FromBody] BomUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.UpdateBomAsync(id, request, cancellationToken);
        return OkEnvelope(response, "BOM updated.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost("{bomId:long}/revisions/{revisionId:long}/clone")]
    public async Task<ActionResult<ApiEnvelope<BomRevisionDto>>> CloneRevision(
        long bomId,
        long revisionId,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.CloneBomRevisionAsync(bomId, revisionId, cancellationToken);
        return OkEnvelope(response, "BOM revision cloned.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost("{bomId:long}/revisions/{revisionId:long}/approve")]
    public async Task<ActionResult<ApiEnvelope<BomRevisionDto>>> ApproveRevision(
        long bomId,
        long revisionId,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.ApproveBomRevisionAsync(bomId, revisionId, cancellationToken);
        return OkEnvelope(response, "BOM revision approved.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost("{bomId:long}/revisions/{revisionId:long}/obsolete")]
    public async Task<ActionResult<ApiEnvelope<BomRevisionDto>>> ObsoleteRevision(
        long bomId,
        long revisionId,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.ObsoleteBomRevisionAsync(bomId, revisionId, cancellationToken);
        return OkEnvelope(response, "BOM revision marked obsolete.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/alternate-items")]
public sealed class AlternateItemsController(IEngineeringService engineeringService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<AlternateItemDto>>>> List(
        [FromQuery] EngineeringFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.ListAlternateItemsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<AlternateItemDto>>> Create(
        [FromBody] AlternateItemUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.CreateAlternateItemAsync(request, cancellationToken);
        return OkEnvelope(response, "Alternate item created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<AlternateItemDto>>> Update(
        long id,
        [FromBody] AlternateItemUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.UpdateAlternateItemAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Alternate item updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/engineering-changes")]
public sealed class EngineeringChangesController(IEngineeringService engineeringService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<EngineeringChangeDto>>>> List(
        [FromQuery] EngineeringFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.ListEngineeringChangesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<EngineeringChangeDto>>> GetEngineeringChange(long id, CancellationToken cancellationToken)
    {
        var response = await engineeringService.GetEngineeringChangeAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<EngineeringChangeDto>>> Create(
        [FromBody] EngineeringChangeUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.CreateEngineeringChangeAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetEngineeringChange), new { id = response.Id }, response, "Engineering change created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<EngineeringChangeDto>>> Update(
        long id,
        [FromBody] EngineeringChangeUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await engineeringService.UpdateEngineeringChangeAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Engineering change updated.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost("{id:long}/submit")]
    public async Task<ActionResult<ApiEnvelope<EngineeringChangeDto>>> Submit(long id, CancellationToken cancellationToken)
    {
        var response = await engineeringService.SubmitEngineeringChangeAsync(id, cancellationToken);
        return OkEnvelope(response, "Engineering change submitted.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost("{id:long}/approve")]
    public async Task<ActionResult<ApiEnvelope<EngineeringChangeDto>>> Approve(long id, CancellationToken cancellationToken)
    {
        var response = await engineeringService.ApproveEngineeringChangeAsync(id, cancellationToken);
        return OkEnvelope(response, "Engineering change approved.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost("{id:long}/implement")]
    public async Task<ActionResult<ApiEnvelope<EngineeringChangeDto>>> Implement(long id, CancellationToken cancellationToken)
    {
        var response = await engineeringService.ImplementEngineeringChangeAsync(id, cancellationToken);
        return OkEnvelope(response, "Engineering change implemented.");
    }
}
