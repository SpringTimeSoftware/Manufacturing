using STS.Mfg.Domain.Abstractions;
using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Application.Abstractions.Security;

public static class DataScopeQueryableExtensions
{
    public static IQueryable<T> ApplyCompanyScope<T>(this IQueryable<T> query, DataScopeContext scope)
        where T : class, ICompanyScoped
    {
        if (scope.ActiveCompanyId.HasValue)
        {
            query = query.Where(record => !record.CompanyId.HasValue || record.CompanyId.Value == scope.ActiveCompanyId.Value);
        }

        return query;
    }

    public static IQueryable<T> ApplyBranchScope<T>(this IQueryable<T> query, DataScopeContext scope)
        where T : class, IBranchScoped
    {
        if (scope.ActiveBranchId.HasValue)
        {
            query = query.Where(record => !record.BranchId.HasValue || record.BranchId.Value == scope.ActiveBranchId.Value);
        }

        return query;
    }

    public static IQueryable<T> ApplyActiveOrganizationScope<T>(this IQueryable<T> query, DataScopeContext scope)
        where T : class, ICompanyScoped, IBranchScoped
    {
        if (scope.ActiveCompanyId.HasValue)
        {
            query = query.Where(record => !record.CompanyId.HasValue || record.CompanyId.Value == scope.ActiveCompanyId.Value);
        }

        if (scope.ActiveBranchId.HasValue)
        {
            query = query.Where(record => !record.BranchId.HasValue || record.BranchId.Value == scope.ActiveBranchId.Value);
        }

        return query;
    }

    public static IQueryable<T> ApplyWarehouseScope<T>(this IQueryable<T> query, DataScopeContext scope)
        where T : class, IWarehouseScoped
    {
        if (scope.AllowedWarehouseIds.Count == 0)
        {
            return query;
        }

        return query.Where(record => !record.WarehouseId.HasValue || scope.AllowedWarehouseIds.Contains(record.WarehouseId.Value));
    }

    public static IQueryable<T> ApplyDepartmentScope<T>(this IQueryable<T> query, DataScopeContext scope)
        where T : class, IDepartmentScoped
    {
        if (scope.AllowedDepartmentIds.Count == 0)
        {
            return query;
        }

        return query.Where(record => !record.DepartmentId.HasValue || scope.AllowedDepartmentIds.Contains(record.DepartmentId.Value));
    }

    public static IQueryable<T> ApplyRecordVisibility<T>(this IQueryable<T> query, DataScopeContext scope)
        where T : class, IUserOwnedRecord
    {
        return scope.VisibilityMode switch
        {
            RecordVisibilityMode.AllInScope => query,
            RecordVisibilityMode.Own => query.Where(record => !record.OwnerUserId.HasValue || record.OwnerUserId.Value == scope.UserId),
            _ => query.Where(record =>
                !record.OwnerUserId.HasValue ||
                record.OwnerUserId.Value == scope.UserId ||
                scope.TeamUserIds.Contains(record.OwnerUserId.Value))
        };
    }
}
