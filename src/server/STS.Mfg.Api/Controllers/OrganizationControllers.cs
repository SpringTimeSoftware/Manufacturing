using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Organization;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Organization;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/companies")]
public sealed class CompaniesController(IOrganizationService organizationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<CompanyDto>>>> List(
        [FromQuery] OrganizationFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.ListCompaniesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CompanyDto>>> GetCompany(long id, CancellationToken cancellationToken)
    {
        var response = await organizationService.GetCompanyAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.PlatformAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<CompanyDto>>> CreateCompany(
        [FromBody] CompanyUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.CreateCompanyAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetCompany), new { id = response.Id }, response, "Company created.");
    }

    [Authorize(Policy = AppPolicies.PlatformAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CompanyDto>>> UpdateCompany(
        long id,
        [FromBody] CompanyUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.UpdateCompanyAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Company updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/branches")]
public sealed class BranchesController(IOrganizationService organizationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<BranchDto>>>> List(
        [FromQuery] OrganizationFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.ListBranchesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BranchDto>>> GetBranch(long id, CancellationToken cancellationToken)
    {
        var response = await organizationService.GetBranchAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<BranchDto>>> CreateBranch(
        [FromBody] BranchUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.CreateBranchAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetBranch), new { id = response.Id }, response, "Branch created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BranchDto>>> UpdateBranch(
        long id,
        [FromBody] BranchUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.UpdateBranchAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Branch updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/departments")]
public sealed class DepartmentsController(IOrganizationService organizationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<DepartmentDto>>>> List(
        [FromQuery] OrganizationFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.ListDepartmentsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<DepartmentDto>>> GetDepartment(long id, CancellationToken cancellationToken)
    {
        var response = await organizationService.GetDepartmentAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<DepartmentDto>>> CreateDepartment(
        [FromBody] DepartmentUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.CreateDepartmentAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetDepartment), new { id = response.Id }, response, "Department created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<DepartmentDto>>> UpdateDepartment(
        long id,
        [FromBody] DepartmentUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.UpdateDepartmentAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Department updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/shifts")]
public sealed class ShiftsController(IOrganizationService organizationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ShiftDto>>>> List(
        [FromQuery] OrganizationFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.ListShiftsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ShiftDto>>> GetShift(long id, CancellationToken cancellationToken)
    {
        var response = await organizationService.GetShiftAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ShiftDto>>> CreateShift(
        [FromBody] ShiftUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.CreateShiftAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetShift), new { id = response.Id }, response, "Shift created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ShiftDto>>> UpdateShift(
        long id,
        [FromBody] ShiftUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.UpdateShiftAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Shift updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/warehouses")]
public sealed class WarehousesController(IOrganizationService organizationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<WarehouseDto>>>> List(
        [FromQuery] OrganizationFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.ListWarehousesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<WarehouseDto>>> GetWarehouse(long id, CancellationToken cancellationToken)
    {
        var response = await organizationService.GetWarehouseAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<WarehouseDto>>> CreateWarehouse(
        [FromBody] WarehouseUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.CreateWarehouseAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetWarehouse), new { id = response.Id }, response, "Warehouse created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<WarehouseDto>>> UpdateWarehouse(
        long id,
        [FromBody] WarehouseUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.UpdateWarehouseAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Warehouse updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/bins")]
public sealed class BinsController(IOrganizationService organizationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<BinDto>>>> List(
        [FromQuery] OrganizationFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.ListBinsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BinDto>>> GetBin(long id, CancellationToken cancellationToken)
    {
        var response = await organizationService.GetBinAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<BinDto>>> CreateBin(
        [FromBody] BinUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.CreateBinAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetBin), new { id = response.Id }, response, "Bin created.");
    }

    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<BinDto>>> UpdateBin(
        long id,
        [FromBody] BinUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await organizationService.UpdateBinAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Bin updated.");
    }
}
