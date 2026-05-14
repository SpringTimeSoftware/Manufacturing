using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.SalesPlanning;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.SalesPlanning;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/quotes")]
public sealed class QuotesController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<QuoteDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListQuotesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<QuoteDto>>> GetQuote(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.GetQuoteAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<QuoteDto>>> Create(
        [FromBody] QuoteUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreateQuoteAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetQuote), new { id = response.Id }, response, "Quote created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<QuoteDto>>> Update(
        long id,
        [FromBody] QuoteUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.UpdateQuoteAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Quote updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/sales-orders")]
public sealed class SalesOrdersController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<SalesOrderDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListSalesOrdersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<SalesOrderDto>>> GetSalesOrder(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.GetSalesOrderAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<SalesOrderDto>>> Create(
        [FromBody] SalesOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreateSalesOrderAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetSalesOrder), new { id = response.Id }, response, "Sales order created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<SalesOrderDto>>> Update(
        long id,
        [FromBody] SalesOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.UpdateSalesOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Sales order updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/blanket-orders")]
public sealed class BlanketOrdersController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<BlanketOrderDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListBlanketOrdersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BlanketOrderDto>>> GetBlanketOrder(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.GetBlanketOrderAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<BlanketOrderDto>>> Create(
        [FromBody] BlanketOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreateBlanketOrderAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetBlanketOrder), new { id = response.Id }, response, "Blanket order created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BlanketOrderDto>>> Update(
        long id,
        [FromBody] BlanketOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.UpdateBlanketOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Blanket order updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/forecasts")]
public sealed class ForecastsController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<DemandForecastDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListDemandForecastsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<DemandForecastDto>>> GetForecast(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.GetDemandForecastAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<DemandForecastDto>>> Create(
        [FromBody] DemandForecastUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreateDemandForecastAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetForecast), new { id = response.Id }, response, "Forecast created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<DemandForecastDto>>> Update(
        long id,
        [FromBody] DemandForecastUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.UpdateDemandForecastAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Forecast updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/mps")]
public sealed class MpsController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<MasterProductionScheduleDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListMpsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<MasterProductionScheduleDto>>> GetMps(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.GetMpsAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<MasterProductionScheduleDto>>> Create(
        [FromBody] MasterProductionScheduleUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreateMpsAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetMps), new { id = response.Id }, response, "MPS created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<MasterProductionScheduleDto>>> Update(
        long id,
        [FromBody] MasterProductionScheduleUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.UpdateMpsAsync(id, request, cancellationToken);
        return OkEnvelope(response, "MPS updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/mrp")]
public sealed class MrpController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<MrpRunDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListMrpRunsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<MrpRunDto>>> GetMrp(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.GetMrpRunAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<MrpRunDto>>> Start(
        [FromBody] MrpRunStartRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.StartMrpRunAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetMrp), new { id = response.Id }, response, "MRP run started.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/boq-requirements")]
public sealed class BoqRequirementsController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<BoqRequirementDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListBoqRequirementsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BoqRequirementDto>>> GetBoqRequirement(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.GetBoqRequirementAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<BoqRequirementDto>>> Create(
        [FromBody] BoqRequirementUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreateBoqRequirementAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetBoqRequirement), new { id = response.Id }, response, "BOQ requirement created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BoqRequirementDto>>> Update(
        long id,
        [FromBody] BoqRequirementUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.UpdateBoqRequirementAsync(id, request, cancellationToken);
        return OkEnvelope(response, "BOQ requirement updated.");
    }

    [HttpPost("{boqRequirementId:long}/lines/{lineId:long}/approve")]
    public async Task<ActionResult<ApiEnvelope<BoqRequirementLineDto>>> ApproveLine(
        long boqRequirementId,
        long lineId,
        [FromBody] BoqLineActionRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ApproveBoqLineAsync(boqRequirementId, lineId, request, cancellationToken);
        return OkEnvelope(response, "BOQ line approved.");
    }

    [HttpPost("{boqRequirementId:long}/lines/{lineId:long}/convert")]
    public async Task<ActionResult<ApiEnvelope<BoqRequirementLineDto>>> ConvertLine(
        long boqRequirementId,
        long lineId,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ConvertBoqLineAsync(boqRequirementId, lineId, cancellationToken);
        return OkEnvelope(response, "BOQ line converted.");
    }

    [HttpPost("{boqRequirementId:long}/lines/convert-reviewed")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<BoqRequirementLineDto>>>> ConvertReviewed(
        long boqRequirementId,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ConvertReviewedBoqLinesAsync(boqRequirementId, cancellationToken);
        return OkEnvelope(response, "Reviewed BOQ lines converted.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/planning/plans")]
public sealed class PlanningPlansController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<PlanningPlanDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListPlanningPlansAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PlanningPlanDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.GetPlanningPlanAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<PlanningPlanDto>>> Create(
        [FromBody] PlanningPlanUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreatePlanningPlanAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Planning plan created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PlanningPlanDto>>> Update(
        long id,
        [FromBody] PlanningPlanUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.UpdatePlanningPlanAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Planning plan updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/planning/snapshots")]
public sealed class PlanningSnapshotsController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<PlanningSnapshotDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListPlanningSnapshotsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<PlanningSnapshotDto>>> Create(
        [FromBody] PlanningSnapshotCreateRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreatePlanningSnapshotAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(List), new { id = response.Id }, response, "Planning snapshot created.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/planning/planned-orders")]
public sealed class PlannedOrdersController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<PlannedOrderDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListPlannedOrdersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PlannedOrderDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.GetPlannedOrderAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<PlannedOrderDto>>> Create(
        [FromBody] PlannedOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreatePlannedOrderAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Planned order created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PlannedOrderDto>>> Update(
        long id,
        [FromBody] PlannedOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.UpdatePlannedOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Planned order updated.");
    }

    [HttpPost("{id:long}/firm")]
    public async Task<ActionResult<ApiEnvelope<PlannedOrderDto>>> Firm(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.FirmPlannedOrderAsync(id, cancellationToken);
        return OkEnvelope(response, "Planned order firmed.");
    }

    [HttpPost("{id:long}/convert/purchase-requisition")]
    public async Task<ActionResult<ApiEnvelope<PlannedOrderConversionResultDto>>> ConvertToPurchaseRequisition(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ConvertPlannedOrderToPurchaseRequisitionAsync(id, cancellationToken);
        return OkEnvelope(response, "Planned order converted to purchase requisition.");
    }

    [HttpPost("{id:long}/convert/work-order")]
    public async Task<ActionResult<ApiEnvelope<PlannedOrderConversionResultDto>>> ConvertToWorkOrder(long id, CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ConvertPlannedOrderToWorkOrderAsync(id, cancellationToken);
        return OkEnvelope(response, "Planned order converted to work order.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/planning/shortage-actions")]
public sealed class ShortageActionsController(ISalesPlanningService salesPlanningService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ShortageActionDto>>>> List(
        [FromQuery] SalesFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.ListShortageActionsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ShortageActionDto>>> Create(
        [FromBody] ShortageActionUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.CreateShortageActionAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(List), new { id = response.Id }, response, "Shortage action created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ShortageActionDto>>> Update(
        long id,
        [FromBody] ShortageActionUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await salesPlanningService.UpdateShortageActionAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Shortage action updated.");
    }
}
