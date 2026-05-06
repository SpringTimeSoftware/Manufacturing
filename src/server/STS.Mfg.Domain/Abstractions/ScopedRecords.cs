namespace STS.Mfg.Domain.Abstractions;

public interface ICompanyScoped
{
    long? CompanyId { get; }
}

public interface IBranchScoped
{
    long? BranchId { get; }
}

public interface IWarehouseScoped
{
    long? WarehouseId { get; }
}

public interface IDepartmentScoped
{
    long? DepartmentId { get; }
}

public interface IUserOwnedRecord
{
    long? OwnerUserId { get; }
}
