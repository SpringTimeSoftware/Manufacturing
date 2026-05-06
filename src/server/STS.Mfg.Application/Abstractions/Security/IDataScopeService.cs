namespace STS.Mfg.Application.Abstractions.Security;

public interface IDataScopeService
{
    DataScopeContext GetCurrentScope();

    void EnsureContextAccess(long? companyId, long? branchId);

    void EnsureWarehouseAccess(long? warehouseId);

    void EnsureDepartmentAccess(long? departmentId);

    void EnsureRecordAccess(long? ownerUserId);

    IReadOnlyDictionary<string, object?> CreateStoredProcedureScope(long? warehouseId = null, long? departmentId = null, long? ownerUserId = null);
}
