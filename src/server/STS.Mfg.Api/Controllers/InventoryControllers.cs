using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Inventory;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/inventory")]
public sealed class InventoryController(IInventoryService inventoryService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<StockBalanceDto>>>> ListBalances(
        [FromQuery] InventoryFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.ListStockBalancesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("transactions")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<StockTransactionDto>>>> ListTransactions(
        [FromQuery] InventoryFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.ListStockTransactionsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/inventory/policy")]
public sealed class InventoryPolicyController(IInventoryPolicyService inventoryPolicyService) : ApiControllerBase
{
    [HttpGet("tracking")]
    public async Task<ActionResult<ApiEnvelope<InventoryTrackingPolicyDto>>> GetTrackingPolicy(
        [FromQuery] InventoryTrackingPolicyRequest request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryPolicyService.ResolveRequiredTrackingAsync(request, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("available")]
    public async Task<ActionResult<ApiEnvelope<InventoryAvailableStockDto>>> GetAvailableStock(
        [FromQuery] InventoryAvailableStockRequest request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryPolicyService.GetAvailableQuantityAsync(request, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("valid-bins")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<InventoryDimensionOptionDto>>>> ListValidBins(
        [FromQuery] InventoryDimensionQuery query,
        CancellationToken cancellationToken)
    {
        var response = await inventoryPolicyService.ListValidBinsAsync(query, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("valid-lots")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<InventoryDimensionOptionDto>>>> ListValidLots(
        [FromQuery] InventoryDimensionQuery query,
        CancellationToken cancellationToken)
    {
        var response = await inventoryPolicyService.ListValidLotsAsync(query, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("valid-serials")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<InventoryDimensionOptionDto>>>> ListValidSerials(
        [FromQuery] InventoryDimensionQuery query,
        CancellationToken cancellationToken)
    {
        var response = await inventoryPolicyService.ListValidSerialsAsync(query, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("valid-pcids")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<InventoryDimensionOptionDto>>>> ListValidPcids(
        [FromQuery] InventoryDimensionQuery query,
        CancellationToken cancellationToken)
    {
        var response = await inventoryPolicyService.ListValidPcidsAsync(query, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("validate-movement")]
    public async Task<ActionResult<ApiEnvelope<StockMovementValidationResultDto>>> ValidateMovement(
        [FromBody] StockMovementValidationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryPolicyService.ValidateMovementAsync(request, cancellationToken);
        return OkEnvelope(response);
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/stock-reservations")]
public sealed class StockReservationsController(IInventoryService inventoryService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<StockReservationDto>>>> List(
        [FromQuery] InventoryFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.ListStockReservationsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<StockReservationDto>>> Create(
        [FromBody] StockReservationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.ReserveStockAsync(request, cancellationToken);
        return OkEnvelope(response, "Stock reserved.");
    }

    [HttpPost("{id:long}/release")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Release(
        long id,
        [FromBody] StockReservationReleaseRequest? request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.ReleaseStockReservationAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Stock reservation released.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/stock-issues")]
public sealed class StockIssuesController(IInventoryService inventoryService) : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<StockTransactionDto>>>> Create(
        [FromBody] StockIssueRequest request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.IssueStockAsync(request, cancellationToken);
        return OkEnvelope(response, "Stock issue posted.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/stock-returns")]
public sealed class StockReturnsController(IInventoryService inventoryService) : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<StockTransactionDto>>>> Create(
        [FromBody] StockReturnRequest request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.ReturnStockAsync(request, cancellationToken);
        return OkEnvelope(response, "Stock return posted.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/stock-transfers")]
public sealed class StockTransfersController(IInventoryService inventoryService) : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<StockTransactionDto>>>> Create(
        [FromBody] StockTransferRequest request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.TransferStockAsync(request, cancellationToken);
        return OkEnvelope(response, "Stock transfer posted.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/cycle-counts")]
public sealed class CycleCountsController(IInventoryService inventoryService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<CycleCountDto>>>> List(
        [FromQuery] CycleCountFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.ListCycleCountsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CycleCountDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await inventoryService.GetCycleCountAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<CycleCountDto>>> Create(
        [FromBody] CycleCountUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.CreateCycleCountAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Cycle count created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CycleCountDto>>> Update(
        long id,
        [FromBody] CycleCountUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.UpdateCycleCountAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Cycle count updated.");
    }

    [HttpPost("{id:long}/post")]
    public async Task<ActionResult<ApiEnvelope<CycleCountDto>>> Post(long id, CancellationToken cancellationToken)
    {
        var response = await inventoryService.PostCycleCountAsync(id, cancellationToken);
        return OkEnvelope(response, "Cycle count posted.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/traceability")]
public sealed class TraceabilityController(IInventoryService inventoryService) : ApiControllerBase
{
    [HttpGet("lots/{lotNo}")]
    public async Task<ActionResult<ApiEnvelope<LotTraceabilityDto>>> GetLot(
        string lotNo,
        [FromQuery] TraceabilityFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.GetLotTraceabilityAsync(lotNo, filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("serials/{serialNo}")]
    public async Task<ActionResult<ApiEnvelope<SerialTraceabilityDto>>> GetSerial(
        string serialNo,
        [FromQuery] TraceabilityFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await inventoryService.GetSerialTraceabilityAsync(serialNo, filter, cancellationToken);
        return OkEnvelope(response);
    }
}
