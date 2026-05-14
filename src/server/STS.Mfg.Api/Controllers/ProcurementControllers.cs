using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Procurement;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Procurement;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/purchase-requisitions")]
public sealed class PurchaseRequisitionsController(IProcurementService procurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<PurchaseRequisitionDto>>>> List(
        [FromQuery] ProcurementFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await procurementService.ListPurchaseRequisitionsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PurchaseRequisitionDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await procurementService.GetPurchaseRequisitionAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<PurchaseRequisitionDto>>> Create(
        [FromBody] PurchaseRequisitionUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await procurementService.CreatePurchaseRequisitionAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Purchase requisition created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PurchaseRequisitionDto>>> Update(
        long id,
        [FromBody] PurchaseRequisitionUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await procurementService.UpdatePurchaseRequisitionAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Purchase requisition updated.");
    }

    [HttpPost("{id:long}/approve")]
    public async Task<ActionResult<ApiEnvelope<PurchaseRequisitionDto>>> Approve(long id, CancellationToken cancellationToken)
    {
        var response = await procurementService.ApprovePurchaseRequisitionAsync(id, cancellationToken);
        return OkEnvelope(response, "Purchase requisition approved.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/purchase-orders")]
public sealed class PurchaseOrdersController(IProcurementService procurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<PurchaseOrderDto>>>> List(
        [FromQuery] ProcurementFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await procurementService.ListPurchaseOrdersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PurchaseOrderDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await procurementService.GetPurchaseOrderAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<PurchaseOrderDto>>> Create(
        [FromBody] PurchaseOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await procurementService.CreatePurchaseOrderAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Purchase order created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PurchaseOrderDto>>> Update(
        long id,
        [FromBody] PurchaseOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await procurementService.UpdatePurchaseOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Purchase order updated.");
    }

    [HttpPost("{id:long}/approve")]
    public async Task<ActionResult<ApiEnvelope<PurchaseOrderDto>>> Approve(long id, CancellationToken cancellationToken)
    {
        var response = await procurementService.ApprovePurchaseOrderAsync(id, cancellationToken);
        return OkEnvelope(response, "Purchase order approved.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/subcontract-orders")]
public sealed class SubcontractOrdersController(IProcurementService procurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<SubcontractOrderDto>>>> List(
        [FromQuery] ProcurementFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await procurementService.ListSubcontractOrdersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<SubcontractOrderDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await procurementService.GetSubcontractOrderAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<SubcontractOrderDto>>> Create(
        [FromBody] SubcontractOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await procurementService.CreateSubcontractOrderAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Subcontract order created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<SubcontractOrderDto>>> Update(
        long id,
        [FromBody] SubcontractOrderUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await procurementService.UpdateSubcontractOrderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Subcontract order updated.");
    }

    [HttpPost("{id:long}/approve")]
    public async Task<ActionResult<ApiEnvelope<SubcontractOrderDto>>> Approve(long id, CancellationToken cancellationToken)
    {
        var response = await procurementService.ApproveSubcontractOrderAsync(id, cancellationToken);
        return OkEnvelope(response, "Subcontract order approved.");
    }
}

[Route("api/subcontract-receipts")]
public sealed class SubcontractReceiptsController(IProcurementService procurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<SubcontractReceiptDto>>>> List([FromQuery] ProcurementFilter filter, CancellationToken cancellationToken)
    {
        var response = await procurementService.ListSubcontractReceiptsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    [Authorize(Policy = AppPolicies.BranchOperations)]
    public async Task<ActionResult<ApiEnvelope<SubcontractReceiptDto>>> Create([FromBody] SubcontractReceiptUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await procurementService.CreateSubcontractReceiptAsync(request, cancellationToken);
        return OkEnvelope(response, "Subcontract receipt created.");
    }
}

[Route("api/goods-receipts")]
public sealed class GoodsReceiptsController(IProcurementService procurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<GoodsReceiptDto>>>> List([FromQuery] ProcurementFilter filter, CancellationToken cancellationToken)
    {
        var response = await procurementService.ListGoodsReceiptsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    [Authorize(Policy = AppPolicies.BranchOperations)]
    public async Task<ActionResult<ApiEnvelope<GoodsReceiptDto>>> Create([FromBody] GoodsReceiptUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await procurementService.CreateGoodsReceiptAsync(request, cancellationToken);
        return OkEnvelope(response, "Goods receipt created.");
    }
}

[Route("api/supplier-invoices")]
public sealed class SupplierInvoicesController(IProcurementService procurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<SupplierInvoiceDto>>>> List([FromQuery] ProcurementFilter filter, CancellationToken cancellationToken)
    {
        var response = await procurementService.ListSupplierInvoicesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    [Authorize(Policy = AppPolicies.BranchOperations)]
    public async Task<ActionResult<ApiEnvelope<SupplierInvoiceDto>>> Create([FromBody] SupplierInvoiceUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await procurementService.CreateSupplierInvoiceAsync(request, cancellationToken);
        return OkEnvelope(response, "Supplier invoice created.");
    }

    [HttpPost("{id:long}/match")]
    [Authorize(Policy = AppPolicies.BranchOperations)]
    public async Task<ActionResult<ApiEnvelope<SupplierInvoiceDto>>> Match(long id, CancellationToken cancellationToken)
    {
        var response = await procurementService.MatchSupplierInvoiceAsync(id, cancellationToken);
        return OkEnvelope(response, "Supplier invoice matched.");
    }

    [HttpPost("{id:long}/post")]
    [Authorize(Policy = AppPolicies.BranchOperations)]
    public async Task<ActionResult<ApiEnvelope<SupplierInvoicePostingResultDto>>> Post(long id, CancellationToken cancellationToken)
    {
        var response = await procurementService.PostSupplierInvoiceAsync(id, cancellationToken);
        return OkEnvelope(response, "Supplier invoice posted to AP.");
    }
}
