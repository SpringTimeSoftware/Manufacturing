using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Measurements;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Masters;
using STS.Mfg.Application.Contracts.Measurements;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/uom/classes")]
public sealed class UomClassesController(IMeasurementService measurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<UomClassDto>>>> List(
        [FromQuery] MeasurementFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ListUomClassesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<UomClassDto>>> Create(
        [FromBody] UomClassUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.CreateUomClassAsync(request, cancellationToken);
        return OkEnvelope(response, "UOM class created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<UomClassDto>>> Update(
        long id,
        [FromBody] UomClassUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateUomClassAsync(id, request, cancellationToken);
        return OkEnvelope(response, "UOM class updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/uom")]
public sealed class UomController(IMeasurementService measurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<UomDto>>>> List(
        [FromQuery] MeasurementFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ListUomsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<UomDto>>> Create(
        [FromBody] UomUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.CreateUomAsync(request, cancellationToken);
        return OkEnvelope(response, "UOM created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<UomDto>>> Update(
        long id,
        [FromBody] UomUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateUomAsync(id, request, cancellationToken);
        return OkEnvelope(response, "UOM updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/uom/conversions")]
public sealed class UomConversionsController(IMeasurementService measurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<UomConversionDto>>>> List(
        [FromQuery] MeasurementFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ListUomConversionsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<UomConversionDto>>> Create(
        [FromBody] UomConversionUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.CreateUomConversionAsync(request, cancellationToken);
        return OkEnvelope(response, "UOM conversion created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<UomConversionDto>>> Update(
        long id,
        [FromBody] UomConversionUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateUomConversionAsync(id, request, cancellationToken);
        return OkEnvelope(response, "UOM conversion updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/measurement-profiles")]
public sealed class MeasurementProfilesController(IMeasurementService measurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<MeasurementProfileDto>>>> List(
        [FromQuery] MeasurementFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ListMeasurementProfilesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<MeasurementProfileDto>>> Create(
        [FromBody] MeasurementProfileUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.CreateMeasurementProfileAsync(request, cancellationToken);
        return OkEnvelope(response, "Measurement profile created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<MeasurementProfileDto>>> Update(
        long id,
        [FromBody] MeasurementProfileUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateMeasurementProfileAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Measurement profile updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/measurement-formulas")]
public sealed class MeasurementFormulasController(IMeasurementService measurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<MeasurementFormulaDto>>>> List(
        [FromQuery] MeasurementFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ListMeasurementFormulasAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<MeasurementFormulaDto>>> Create(
        [FromBody] MeasurementFormulaUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.CreateMeasurementFormulaAsync(request, cancellationToken);
        return OkEnvelope(response, "Measurement formula created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<MeasurementFormulaDto>>> Update(
        long id,
        [FromBody] MeasurementFormulaUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateMeasurementFormulaAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Measurement formula updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/items")]
public sealed class ItemsController(IMeasurementService measurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ItemDto>>>> List(
        [FromQuery] CompanyScopedFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ListItemsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ItemDto>>> GetItem(long id, CancellationToken cancellationToken)
    {
        var response = await measurementService.GetItemAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}/profile")]
    public async Task<ActionResult<ApiEnvelope<ItemMasterProfileDto>>> GetItemProfile(long id, CancellationToken cancellationToken)
    {
        var response = await measurementService.GetItemMasterProfileAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}/profile")]
    public async Task<ActionResult<ApiEnvelope<ItemMasterProfileDto>>> UpdateItemProfile(
        long id,
        [FromBody] ItemMasterProfileUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateItemMasterProfileAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Item profile updated.");
    }

    [HttpGet("lookup")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<ItemLookupDto>>>> Lookup(
        [FromQuery] long? companyId,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.LookupItemsAsync(companyId, search, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ItemDto>>> Create(
        [FromBody] ItemUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.CreateItemAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetItem), new { id = response.Id }, response, "Item created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ItemDto>>> Update(
        long id,
        [FromBody] ItemUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateItemAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Item updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/item-variants")]
public sealed class ItemVariantsController(IMeasurementService measurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ItemVariantDto>>>> List(
        [FromQuery] CompanyScopedFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ListItemVariantsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ItemVariantDto>>> Create(
        [FromBody] ItemVariantUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.CreateItemVariantAsync(request, cancellationToken);
        return OkEnvelope(response, "Item variant created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ItemVariantDto>>> Update(
        long id,
        [FromBody] ItemVariantUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateItemVariantAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Item variant updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/item-uoms")]
public sealed class ItemUomsController(IMeasurementService measurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ItemUomDto>>>> List(
        [FromQuery] CompanyScopedFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ListItemUomsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ItemUomDto>>> Create(
        [FromBody] ItemUomUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.CreateItemUomAsync(request, cancellationToken);
        return OkEnvelope(response, "Item UOM created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ItemUomDto>>> Update(
        long id,
        [FromBody] ItemUomUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateItemUomAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Item UOM updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/item-barcodes")]
public sealed class ItemBarcodesController(IMeasurementService measurementService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ItemBarcodeDto>>>> List(
        [FromQuery] CompanyScopedFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ListItemBarcodesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("resolve/{barcodeValue}")]
    public async Task<ActionResult<ApiEnvelope<BarcodeResolutionDto>>> Resolve(
        string barcodeValue,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.ResolveBarcodeAsync(barcodeValue, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ItemBarcodeDto>>> Create(
        [FromBody] ItemBarcodeUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.CreateItemBarcodeAsync(request, cancellationToken);
        return OkEnvelope(response, "Item barcode created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ItemBarcodeDto>>> Update(
        long id,
        [FromBody] ItemBarcodeUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await measurementService.UpdateItemBarcodeAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Item barcode updated.");
    }
}
