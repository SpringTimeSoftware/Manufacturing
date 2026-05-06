using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Route("api/system")]
public sealed class SystemController(
    ICurrentUserContextAccessor currentUserContextAccessor,
    IDataScopeService dataScopeService) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpGet("info")]
    public ActionResult<ApiEnvelope<SystemInfoResponse>> GetInfo()
    {
        var response = new SystemInfoResponse("STS Manufacturing ERP", "bootstrap", "Backend skeleton online.");

        return OkEnvelope(response);
    }

    [Authorize(Policy = AppPolicies.AuthenticatedUser)]
    [HttpGet("context")]
    public ActionResult<ApiEnvelope<SystemContextResponse>> GetContext()
    {
        var current = currentUserContextAccessor.GetRequired();
        var scope = dataScopeService.GetCurrentScope();
        var response = new SystemContextResponse(
            current.UserId,
            current.UserName,
            current.ActiveCompanyId,
            current.ActiveBranchId,
            scope.AllowedWarehouseIds,
            scope.AllowedDepartmentIds,
            scope.VisibilityMode.ToString(),
            scope.TeamUserIds);

        return OkEnvelope(response);
    }
}

public sealed record SystemInfoResponse(string Product, string Phase, string Message);

public sealed record SystemContextResponse(
    long? UserId,
    string? UserName,
    long? CompanyId,
    long? BranchId,
    IReadOnlyCollection<long> WarehouseIds,
    IReadOnlyCollection<long> DepartmentIds,
    string VisibilityMode,
    IReadOnlyCollection<long> TeamUserIds);
