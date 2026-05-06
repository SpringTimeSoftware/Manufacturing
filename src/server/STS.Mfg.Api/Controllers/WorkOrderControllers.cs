using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/work-orders")]
public sealed class WorkOrdersController(IWorkOrderService workOrderService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<WorkOrderSummaryDto>>>> List(
        [FromQuery] WorkOrderFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await workOrderService.ListWorkOrdersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<WorkOrderDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await workOrderService.GetWorkOrderAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}/readiness")]
    public async Task<ActionResult<ApiEnvelope<WorkOrderReadinessDto>>> GetReadiness(long id, CancellationToken cancellationToken)
    {
        var response = await workOrderService.GetReadinessAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<WorkOrderDto>>> Create(
        [FromBody] WorkOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await workOrderService.CreateWorkOrderAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Work order created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<WorkOrderDto>>> Update(
        long id,
        [FromBody] WorkOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await workOrderService.UpdateWorkOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Work order updated.");
    }

    [HttpPost("{id:long}/release")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Release(
        long id,
        [FromBody] WorkOrderActionRequest? request,
        CancellationToken cancellationToken)
    {
        var response = await workOrderService.ReleaseWorkOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Work order released.");
    }

    [HttpPost("{id:long}/re-release")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> ReRelease(
        long id,
        [FromBody] WorkOrderActionRequest? request,
        CancellationToken cancellationToken)
    {
        var response = await workOrderService.ReReleaseWorkOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Work order re-released.");
    }

    [HttpPost("{id:long}/cancel")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Cancel(
        long id,
        [FromBody] WorkOrderActionRequest? request,
        CancellationToken cancellationToken)
    {
        var response = await workOrderService.CancelWorkOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Work order cancelled.");
    }

    [HttpPost("{id:long}/close")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Close(
        long id,
        [FromBody] WorkOrderActionRequest? request,
        CancellationToken cancellationToken)
    {
        var response = await workOrderService.CloseWorkOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Work order closed.");
    }
}
