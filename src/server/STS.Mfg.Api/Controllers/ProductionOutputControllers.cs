using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/production-receipts")]
public sealed class ProductionReceiptsController(IProductionOutputService productionOutputService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ProductionReceiptSummaryDto>>>> List(
        [FromQuery] ProductionReceiptFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await productionOutputService.ListProductionReceiptsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ProductionReceiptDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await productionOutputService.GetProductionReceiptAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ProductionReceiptDto>>> Create(
        [FromBody] ProductionReceiptCreateRequest request,
        CancellationToken cancellationToken)
    {
        var response = await productionOutputService.CreateProductionReceiptAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Production receipt posted.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/scrap-rework")]
public sealed class ScrapReworkController(IProductionOutputService productionOutputService) : ApiControllerBase
{
    [HttpGet("scrap")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ScrapEntryDto>>>> ListScrap(
        [FromQuery] ScrapEntryFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await productionOutputService.ListScrapEntriesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("scrap")]
    public async Task<ActionResult<ApiEnvelope<ScrapEntryDto>>> CreateScrap(
        [FromBody] ScrapEntryCreateRequest request,
        CancellationToken cancellationToken)
    {
        var response = await productionOutputService.CreateScrapEntryAsync(request, cancellationToken);
        return OkEnvelope(response, "Scrap entry posted.");
    }

    [HttpGet("rework-orders")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ReworkOrderDto>>>> ListRework(
        [FromQuery] ReworkOrderFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await productionOutputService.ListReworkOrdersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("rework-orders/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ReworkOrderDto>>> GetRework(long id, CancellationToken cancellationToken)
    {
        var response = await productionOutputService.GetReworkOrderAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("rework-orders")]
    public async Task<ActionResult<ApiEnvelope<ReworkOrderDto>>> CreateRework(
        [FromBody] ReworkOrderCreateRequest request,
        CancellationToken cancellationToken)
    {
        var response = await productionOutputService.CreateReworkOrderAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetRework), new { id = response.Id }, response, "Rework order created.");
    }

    [HttpPost("rework-orders/{id:long}/release")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> ReleaseRework(
        long id,
        [FromBody] ReworkOrderActionRequest? request,
        CancellationToken cancellationToken)
    {
        var response = await productionOutputService.ReleaseReworkOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Rework order released.");
    }

    [HttpPost("rework-orders/{id:long}/complete")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> CompleteRework(
        long id,
        [FromBody] ReworkOrderActionRequest? request,
        CancellationToken cancellationToken)
    {
        var response = await productionOutputService.CompleteReworkOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Rework order completed.");
    }
}
