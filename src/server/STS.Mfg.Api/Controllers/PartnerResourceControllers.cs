using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Resources;
using STS.Mfg.Application.Abstractions.SalesPlanning;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Masters;
using STS.Mfg.Application.Contracts.Resources;
using STS.Mfg.Application.Contracts.SalesPlanning;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/customers")]
public sealed class CustomersController(
    IResourceService resourceService,
    ICustomerCommercialDefaultsService customerCommercialDefaultsService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<CustomerDto>>>> List(
        [FromQuery] CompanyScopedFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.ListCustomersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<CustomerDto>>> Create(
        [FromBody] CustomerUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.CreateCustomerAsync(request, cancellationToken);
        return OkEnvelope(response, "Customer created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CustomerDto>>> Update(
        long id,
        [FromBody] CustomerUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateCustomerAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Customer updated.");
    }

    [HttpGet("{id:long}/profile")]
    public async Task<ActionResult<ApiEnvelope<CustomerPartnerWorkspaceDto>>> GetProfile(
        long id,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.GetCustomerPartnerWorkspaceAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}/commercial-defaults")]
    public async Task<ActionResult<ApiEnvelope<CustomerCommercialDefaultsDto>>> GetCommercialDefaults(
        long id,
        [FromQuery] long companyId,
        [FromQuery] long branchId,
        [FromQuery] long? customerAddressId,
        [FromQuery] DateOnly documentDate,
        CancellationToken cancellationToken)
    {
        var response = await customerCommercialDefaultsService.ResolveAsync(
            new CustomerCommercialDefaultsRequest(companyId, branchId, id, customerAddressId, documentDate),
            cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("sales-territories")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<SalesTerritoryDto>>>> ListSalesTerritories(
        [FromQuery] long companyId,
        CancellationToken cancellationToken)
    {
        var response = await customerCommercialDefaultsService.ListSalesTerritoriesAsync(companyId, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("sales-teams")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<SalesTeamDto>>>> ListSalesTeams(
        [FromQuery] long companyId,
        CancellationToken cancellationToken)
    {
        var response = await customerCommercialDefaultsService.ListSalesTeamsAsync(companyId, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}/profile")]
    public async Task<ActionResult<ApiEnvelope<CustomerPartnerWorkspaceDto>>> UpdateProfile(
        long id,
        [FromBody] CustomerPartnerProfileUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateCustomerPartnerWorkspaceAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Customer profile updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/customer-addresses")]
public sealed class CustomerAddressesController(IResourceService resourceService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<CustomerAddressDto>>>> List(
        [FromQuery] CompanyScopedFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.ListCustomerAddressesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<CustomerAddressDto>>> Create(
        [FromBody] CustomerAddressUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.CreateCustomerAddressAsync(request, cancellationToken);
        return OkEnvelope(response, "Customer address created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CustomerAddressDto>>> Update(
        long id,
        [FromBody] CustomerAddressUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateCustomerAddressAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Customer address updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/suppliers")]
public sealed class SuppliersController(IResourceService resourceService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<SupplierDto>>>> List(
        [FromQuery] CompanyScopedFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.ListSuppliersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<SupplierDto>>> Create(
        [FromBody] SupplierUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.CreateSupplierAsync(request, cancellationToken);
        return OkEnvelope(response, "Supplier created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<SupplierDto>>> Update(
        long id,
        [FromBody] SupplierUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateSupplierAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Supplier updated.");
    }

    [HttpGet("{id:long}/profile")]
    public async Task<ActionResult<ApiEnvelope<SupplierPartnerWorkspaceDto>>> GetProfile(
        long id,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.GetSupplierPartnerWorkspaceAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}/profile")]
    public async Task<ActionResult<ApiEnvelope<SupplierPartnerWorkspaceDto>>> UpdateProfile(
        long id,
        [FromBody] SupplierPartnerProfileUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateSupplierPartnerWorkspaceAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Supplier profile updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/supplier-addresses")]
public sealed class SupplierAddressesController(IResourceService resourceService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<SupplierAddressDto>>>> List(
        [FromQuery] CompanyScopedFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.ListSupplierAddressesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<SupplierAddressDto>>> Create(
        [FromBody] SupplierAddressUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.CreateSupplierAddressAsync(request, cancellationToken);
        return OkEnvelope(response, "Supplier address created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<SupplierAddressDto>>> Update(
        long id,
        [FromBody] SupplierAddressUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateSupplierAddressAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Supplier address updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/supplier-lead-times")]
public sealed class SupplierLeadTimesController(IResourceService resourceService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<SupplierLeadTimeDto>>>> List(
        [FromQuery] CompanyScopedFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.ListSupplierLeadTimesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<SupplierLeadTimeDto>>> Create(
        [FromBody] SupplierLeadTimeUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.CreateSupplierLeadTimeAsync(request, cancellationToken);
        return OkEnvelope(response, "Supplier lead time created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<SupplierLeadTimeDto>>> Update(
        long id,
        [FromBody] SupplierLeadTimeUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateSupplierLeadTimeAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Supplier lead time updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/operations")]
public sealed class OperationsController(IResourceService resourceService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<OperationDto>>>> List(
        [FromQuery] ResourceFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.ListOperationsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<OperationDto>>> Create(
        [FromBody] OperationUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.CreateOperationAsync(request, cancellationToken);
        return OkEnvelope(response, "Operation created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<OperationDto>>> Update(
        long id,
        [FromBody] OperationUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateOperationAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Operation updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/work-centers")]
public sealed class WorkCentersController(IResourceService resourceService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<WorkCenterDto>>>> List(
        [FromQuery] ResourceFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.ListWorkCentersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<WorkCenterDto>>> Create(
        [FromBody] WorkCenterUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.CreateWorkCenterAsync(request, cancellationToken);
        return OkEnvelope(response, "Work center created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<WorkCenterDto>>> Update(
        long id,
        [FromBody] WorkCenterUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateWorkCenterAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Work center updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/machines")]
public sealed class MachinesController(IResourceService resourceService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<MachineDto>>>> List(
        [FromQuery] ResourceFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.ListMachinesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<MachineDto>>> Create(
        [FromBody] MachineUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.CreateMachineAsync(request, cancellationToken);
        return OkEnvelope(response, "Machine created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<MachineDto>>> Update(
        long id,
        [FromBody] MachineUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateMachineAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Machine updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/tools")]
public sealed class ToolsController(IResourceService resourceService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ToolDto>>>> List(
        [FromQuery] ResourceFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.ListToolsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ToolDto>>> Create(
        [FromBody] ToolUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.CreateToolAsync(request, cancellationToken);
        return OkEnvelope(response, "Tool created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ToolDto>>> Update(
        long id,
        [FromBody] ToolUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await resourceService.UpdateToolAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Tool updated.");
    }
}
