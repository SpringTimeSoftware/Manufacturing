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
