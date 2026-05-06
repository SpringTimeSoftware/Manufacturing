using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Dispatch;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Dispatch;
using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/dispatch")]
public sealed class DispatchController(IDispatchService dispatchService) : ApiControllerBase
{
    [HttpGet("pack-lists")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<PackListDto>>>> ListPackLists([FromQuery] DispatchFilter filter, CancellationToken cancellationToken)
    {
        var response = await dispatchService.ListPackListsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("pack-lists/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PackListDto>>> GetPackList(long id, CancellationToken cancellationToken)
    {
        var response = await dispatchService.GetPackListAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("pack-lists")]
    public async Task<ActionResult<ApiEnvelope<PackListDto>>> CreatePackList([FromBody] PackListUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await dispatchService.CreatePackListAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetPackList), new { id = response.Id }, response, "Pack list created.");
    }

    [HttpPut("pack-lists/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PackListDto>>> UpdatePackList(long id, [FromBody] PackListUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await dispatchService.UpdatePackListAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Pack list updated.");
    }

    [HttpGet("shipments")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ShipmentDto>>>> ListShipments([FromQuery] DispatchFilter filter, CancellationToken cancellationToken)
    {
        var response = await dispatchService.ListShipmentsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("shipments/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ShipmentDto>>> GetShipment(long id, CancellationToken cancellationToken)
    {
        var response = await dispatchService.GetShipmentAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("shipments")]
    public async Task<ActionResult<ApiEnvelope<ShipmentDto>>> CreateShipment([FromBody] ShipmentUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await dispatchService.CreateShipmentAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetShipment), new { id = response.Id }, response, "Shipment created.");
    }

    [HttpPost("shipments/{id:long}/proof")]
    public async Task<ActionResult<ApiEnvelope<ShipmentDto>>> UpdateProof(long id, [FromBody] ShipmentProofRequest request, CancellationToken cancellationToken)
    {
        var response = await dispatchService.UpdateShipmentProofAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Shipment proof updated.");
    }

    [HttpGet("planning")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<DispatchPlanningItemDto>>>> GetPlanning([FromQuery] DispatchFilter filter, CancellationToken cancellationToken)
    {
        var response = await dispatchService.GetDispatchPlanningAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/dashboards")]
public sealed class DashboardsController(IDispatchService dispatchService, IMachineBoardReadService machineBoardReadService) : ApiControllerBase
{
    [HttpGet("stage-wise")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<StageWiseDashboardItemDto>>>> GetStageWise([FromQuery] DispatchFilter filter, CancellationToken cancellationToken)
    {
        var response = await dispatchService.GetStageWiseDashboardAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("order-delivery")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<OrderRiskItemDto>>>> GetOrderDelivery([FromQuery] DispatchFilter filter, CancellationToken cancellationToken)
    {
        var response = await dispatchService.GetOrderRiskDashboardAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("executive-cockpit")]
    public async Task<ActionResult<ApiEnvelope<ExecutiveCockpitDto>>> GetExecutiveCockpit([FromQuery] DispatchFilter filter, CancellationToken cancellationToken)
    {
        var response = await dispatchService.GetExecutiveCockpitAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("/api/machine-board")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<MachineBoardItem>>>> GetMachineBoard([FromQuery] MachineBoardQuery query, CancellationToken cancellationToken)
    {
        var response = await machineBoardReadService.GetBoardAsync(query, cancellationToken);
        return OkEnvelope(response);
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/reports")]
public sealed class ReportsController(IDispatchService dispatchService) : ApiControllerBase
{
    [HttpGet("pack-lists/{id:long}/print")]
    public async Task<ActionResult<ApiEnvelope<PackListPrintDto>>> GetPackListPrint(long id, CancellationToken cancellationToken)
    {
        var response = await dispatchService.GetPackListPrintAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("work-orders/{workOrderId:long}/traveler")]
    public async Task<ActionResult<ApiEnvelope<WorkOrderTravelerDto>>> GetWorkOrderTraveler(long workOrderId, CancellationToken cancellationToken)
    {
        var response = await dispatchService.GetWorkOrderTravelerAsync(workOrderId, cancellationToken);
        return OkEnvelope(response);
    }
}
