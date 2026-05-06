using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Organization;

namespace STS.Mfg.Application.Abstractions.Organization;

public interface IOrganizationService
{
    Task<PagedResult<CompanyDto>> ListCompaniesAsync(OrganizationFilter filter, CancellationToken cancellationToken = default);
    Task<CompanyDto> GetCompanyAsync(long id, CancellationToken cancellationToken = default);
    Task<CompanyDto> CreateCompanyAsync(CompanyUpsertRequest request, CancellationToken cancellationToken = default);
    Task<CompanyDto> UpdateCompanyAsync(long id, CompanyUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<BranchDto>> ListBranchesAsync(OrganizationFilter filter, CancellationToken cancellationToken = default);
    Task<BranchDto> GetBranchAsync(long id, CancellationToken cancellationToken = default);
    Task<BranchDto> CreateBranchAsync(BranchUpsertRequest request, CancellationToken cancellationToken = default);
    Task<BranchDto> UpdateBranchAsync(long id, BranchUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<DepartmentDto>> ListDepartmentsAsync(OrganizationFilter filter, CancellationToken cancellationToken = default);
    Task<DepartmentDto> GetDepartmentAsync(long id, CancellationToken cancellationToken = default);
    Task<DepartmentDto> CreateDepartmentAsync(DepartmentUpsertRequest request, CancellationToken cancellationToken = default);
    Task<DepartmentDto> UpdateDepartmentAsync(long id, DepartmentUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ShiftDto>> ListShiftsAsync(OrganizationFilter filter, CancellationToken cancellationToken = default);
    Task<ShiftDto> GetShiftAsync(long id, CancellationToken cancellationToken = default);
    Task<ShiftDto> CreateShiftAsync(ShiftUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ShiftDto> UpdateShiftAsync(long id, ShiftUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<WarehouseDto>> ListWarehousesAsync(OrganizationFilter filter, CancellationToken cancellationToken = default);
    Task<WarehouseDto> GetWarehouseAsync(long id, CancellationToken cancellationToken = default);
    Task<WarehouseDto> CreateWarehouseAsync(WarehouseUpsertRequest request, CancellationToken cancellationToken = default);
    Task<WarehouseDto> UpdateWarehouseAsync(long id, WarehouseUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<BinDto>> ListBinsAsync(OrganizationFilter filter, CancellationToken cancellationToken = default);
    Task<BinDto> GetBinAsync(long id, CancellationToken cancellationToken = default);
    Task<BinDto> CreateBinAsync(BinUpsertRequest request, CancellationToken cancellationToken = default);
    Task<BinDto> UpdateBinAsync(long id, BinUpsertRequest request, CancellationToken cancellationToken = default);
}
