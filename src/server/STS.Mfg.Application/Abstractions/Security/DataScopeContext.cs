using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Application.Abstractions.Security;

public sealed record DataScopeContext(
    long UserId,
    long? ActiveCompanyId,
    long? ActiveBranchId,
    bool HasDeploymentAccess,
    RecordVisibilityMode VisibilityMode,
    IReadOnlyCollection<long> AllowedCompanyIds,
    IReadOnlyCollection<long> AllowedBranchIds,
    IReadOnlyCollection<long> AllowedWarehouseIds,
    IReadOnlyCollection<long> AllowedDepartmentIds,
    IReadOnlyCollection<long> TeamUserIds,
    IReadOnlyCollection<string> Roles)
{
    public bool AllowsContext(long? companyId, long? branchId)
    {
        if (HasDeploymentAccess)
        {
            return true;
        }

        var companyAllowed = !companyId.HasValue || AllowedCompanyIds.Contains(companyId.Value);
        var branchAllowed = !branchId.HasValue || AllowedBranchIds.Contains(branchId.Value);

        return companyAllowed && branchAllowed;
    }

    public bool MatchesActiveContext(long? companyId, long? branchId)
    {
        var companyMatches = !ActiveCompanyId.HasValue || !companyId.HasValue || companyId.Value == ActiveCompanyId.Value;
        var branchMatches = !ActiveBranchId.HasValue || !branchId.HasValue || branchId.Value == ActiveBranchId.Value;

        return companyMatches && branchMatches;
    }

    public bool AllowsWarehouse(long? warehouseId)
    {
        return !warehouseId.HasValue || AllowedWarehouseIds.Count == 0 || AllowedWarehouseIds.Contains(warehouseId.Value);
    }

    public bool AllowsDepartment(long? departmentId)
    {
        return !departmentId.HasValue || AllowedDepartmentIds.Count == 0 || AllowedDepartmentIds.Contains(departmentId.Value);
    }

    public bool AllowsOwner(long? ownerUserId)
    {
        if (!ownerUserId.HasValue || VisibilityMode == RecordVisibilityMode.AllInScope)
        {
            return true;
        }

        if (VisibilityMode == RecordVisibilityMode.Own)
        {
            return ownerUserId.Value == UserId;
        }

        return ownerUserId.Value == UserId || TeamUserIds.Contains(ownerUserId.Value);
    }
}
