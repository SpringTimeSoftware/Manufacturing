using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Infrastructure.Platform.Security;

internal sealed class DataScopeService(
    ICurrentUserContextAccessor currentUserContextAccessor,
    IBootstrapIdentityDirectory identityDirectory) : IDataScopeService
{
    public DataScopeContext GetCurrentScope()
    {
        var currentUser = currentUserContextAccessor.GetRequired();
        var user = identityDirectory.FindById(currentUser.UserId!.Value)
            ?? throw new AuthenticationFailureException("Authenticated user is not provisioned in the bootstrap directory.");

        var activeContext = user.Contexts.FirstOrDefault(context =>
            context.CompanyId == currentUser.ActiveCompanyId &&
            context.BranchId == currentUser.ActiveBranchId);

        return new DataScopeContext(
            currentUser.UserId.Value,
            currentUser.ActiveCompanyId,
            currentUser.ActiveBranchId,
            user.Roles.Contains(AppRoles.SuperAdmin, StringComparer.OrdinalIgnoreCase)
                || user.Roles.Contains(AppRoles.PlatformAdmin, StringComparer.OrdinalIgnoreCase),
            activeContext?.VisibilityMode ?? RecordVisibilityMode.AllInScope,
            user.Contexts.Select(context => context.CompanyId).Distinct().ToArray(),
            user.Contexts.Select(context => context.BranchId).Distinct().ToArray(),
            activeContext?.AllowedWarehouseIds?.ToArray() ?? Array.Empty<long>(),
            activeContext?.AllowedDepartmentIds?.ToArray() ?? Array.Empty<long>(),
            activeContext?.TeamUserIds?.ToArray() ?? Array.Empty<long>(),
            user.Roles.ToArray());
    }

    public void EnsureContextAccess(long? companyId, long? branchId)
    {
        var scope = GetCurrentScope();

        if (!scope.MatchesActiveContext(companyId, branchId))
        {
            throw new ScopeViolationException("The requested company or branch is outside the active operating context.");
        }
    }

    public void EnsureWarehouseAccess(long? warehouseId)
    {
        var scope = GetCurrentScope();

        if (!scope.AllowsWarehouse(warehouseId))
        {
            throw new ScopeViolationException("The requested warehouse is outside the allowed scope.");
        }
    }

    public void EnsureDepartmentAccess(long? departmentId)
    {
        var scope = GetCurrentScope();

        if (!scope.AllowsDepartment(departmentId))
        {
            throw new ScopeViolationException("The requested department is outside the allowed scope.");
        }
    }

    public void EnsureRecordAccess(long? ownerUserId)
    {
        var scope = GetCurrentScope();

        if (!scope.AllowsOwner(ownerUserId))
        {
            throw new ScopeViolationException("The requested record is outside the allowed visibility.");
        }
    }

    public IReadOnlyDictionary<string, object?> CreateStoredProcedureScope(long? warehouseId = null, long? departmentId = null, long? ownerUserId = null)
    {
        EnsureContextAccess(GetCurrentScope().ActiveCompanyId, GetCurrentScope().ActiveBranchId);
        EnsureWarehouseAccess(warehouseId);
        EnsureDepartmentAccess(departmentId);
        EnsureRecordAccess(ownerUserId);

        var scope = GetCurrentScope();

        return new Dictionary<string, object?>
        {
            ["CompanyId"] = scope.ActiveCompanyId,
            ["BranchId"] = scope.ActiveBranchId,
            ["WarehouseId"] = warehouseId,
            ["DepartmentId"] = departmentId,
            ["UserId"] = ownerUserId ?? scope.UserId
        };
    }
}
