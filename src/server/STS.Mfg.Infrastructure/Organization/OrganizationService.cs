using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Organization;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Organization;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Organization;

internal sealed class OrganizationService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IOrganizationService
{
    public async Task<PagedResult<CompanyDto>> ListCompaniesAsync(OrganizationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = ApplyCompanyRootScope(DbContext.Companies.AsNoTracking(), scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(company => company.Id == filter.CompanyId.Value);
        }

        query = ApplyCompanyFilters(query, filter);

        var page = await query.OrderBy(company => company.CompanyCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapCompany);
    }

    public async Task<CompanyDto> GetCompanyAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.Companies.AsNoTracking()
            .Where(company => !scope.ActiveCompanyId.HasValue || company.Id == scope.ActiveCompanyId.Value)
            .FirstOrDefaultAsync(company => company.Id == id, cancellationToken);

        return MapCompany(EnsureFound(entity, "Company was not found in the active scope.", "organization.company_not_found"));
    }

    public async Task<CompanyDto> CreateCompanyAsync(CompanyUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCompany(request);

        var entity = Company.Create(
            request.CompanyCode,
            request.CompanyName,
            request.LegalName,
            Normalize(request.TaxRegistrationNo),
            request.TimeZoneId,
            request.DefaultLanguageId,
            Normalize(request.BaseCurrencyCode),
            Normalize(request.DefaultCalendarCode),
            request.Status,
            GetUserId());

        DbContext.Companies.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapCompany(entity);
        await WriteAuditAsync("organization", nameof(Company), "company.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<CompanyDto> UpdateCompanyAsync(long id, CompanyUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCompany(request);

        var scope = GetScope();
        var entity = await ApplyCompanyRootScope(DbContext.Companies, scope)
            .FirstOrDefaultAsync(company => company.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Company was not found in the active scope.", "organization.company_not_found");
        var before = MapCompany(entity);

        entity.Update(
            request.CompanyCode,
            request.CompanyName,
            request.LegalName,
            Normalize(request.TaxRegistrationNo),
            request.TimeZoneId,
            request.DefaultLanguageId,
            Normalize(request.BaseCurrencyCode),
            Normalize(request.DefaultCalendarCode),
            request.Status,
            GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapCompany(entity);
        await WriteAuditAsync("organization", nameof(Company), "company.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<BranchDto>> ListBranchesAsync(OrganizationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = ApplyBranchRootScope(DbContext.Branches.AsNoTracking(), scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(branch => branch.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(branch => branch.Id == filter.BranchId.Value);
        }

        query = ApplyBranchFilters(query, filter);

        var page = await query.OrderBy(branch => branch.BranchCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapBranch);
    }

    public async Task<BranchDto> GetBranchAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.Branches.AsNoTracking()
            .Where(branch =>
                (!scope.ActiveCompanyId.HasValue || !branch.CompanyId.HasValue || branch.CompanyId.Value == scope.ActiveCompanyId.Value) &&
                (!scope.ActiveBranchId.HasValue || branch.Id == scope.ActiveBranchId.Value))
            .FirstOrDefaultAsync(branch => branch.Id == id, cancellationToken);

        return MapBranch(EnsureFound(entity, "Branch was not found in the active scope.", "organization.branch_not_found"));
    }

    public async Task<BranchDto> CreateBranchAsync(BranchUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBranch(request);
        EnsureContextAccess(request.CompanyId, null);

        var entity = Branch.Create(
            request.CompanyId,
            request.BranchCode,
            request.BranchName,
            request.BranchType,
            request.TimeZoneId,
            request.DefaultLanguageId,
            Normalize(request.DefaultCalendarCode),
            request.DefaultShiftId,
            request.DefaultWarehouseId,
            Normalize(request.ContactEmail),
            request.Status,
            GetUserId());

        DbContext.Branches.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapBranch(entity);
        await WriteAuditAsync("organization", nameof(Branch), "branch.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<BranchDto> UpdateBranchAsync(long id, BranchUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBranch(request);

        var scope = GetScope();
        var entity = await ApplyBranchRootScope(DbContext.Branches, scope)
            .FirstOrDefaultAsync(branch => branch.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Branch was not found in the active scope.", "organization.branch_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Branch company cannot be changed."));

        var before = MapBranch(entity);
        entity.Update(
            request.BranchCode,
            request.BranchName,
            request.BranchType,
            request.TimeZoneId,
            request.DefaultLanguageId,
            Normalize(request.DefaultCalendarCode),
            request.DefaultShiftId,
            request.DefaultWarehouseId,
            Normalize(request.ContactEmail),
            request.Status,
            GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapBranch(entity);
        await WriteAuditAsync("organization", nameof(Branch), "branch.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<DepartmentDto>> ListDepartmentsAsync(OrganizationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Departments.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyRecordVisibility(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(department => department.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(department => department.BranchId == filter.BranchId.Value);
        }

        query = ApplyDepartmentFilters(query, filter);

        var page = await query.OrderBy(department => department.DepartmentCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapDepartment);
    }

    public async Task<DepartmentDto> GetDepartmentAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.Departments.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyRecordVisibility(scope)
            .FirstOrDefaultAsync(department => department.Id == id, cancellationToken);

        return MapDepartment(EnsureFound(entity, "Department was not found in the active scope.", "organization.department_not_found"));
    }

    public async Task<DepartmentDto> CreateDepartmentAsync(DepartmentUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDepartment(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureRecordAccess(request.ManagerUserId);

        var entity = Department.Create(
            request.CompanyId,
            request.BranchId,
            request.DepartmentCode,
            request.DepartmentName,
            request.ParentDepartmentId,
            request.ManagerUserId,
            request.DepartmentType,
            request.Status,
            GetUserId());

        DbContext.Departments.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapDepartment(entity);
        await WriteAuditAsync("organization", nameof(Department), "department.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<DepartmentDto> UpdateDepartmentAsync(long id, DepartmentUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDepartment(request);

        var scope = GetScope();
        var entity = await DbContext.Departments.ApplyActiveOrganizationScope(scope)
            .ApplyRecordVisibility(scope)
            .FirstOrDefaultAsync(department => department.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Department was not found in the active scope.", "organization.department_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Department company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Department branch cannot be changed."));

        EnsureRecordAccess(request.ManagerUserId);

        var before = MapDepartment(entity);
        entity.Update(
            request.DepartmentCode,
            request.DepartmentName,
            request.ParentDepartmentId,
            request.ManagerUserId,
            request.DepartmentType,
            request.Status,
            GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapDepartment(entity);
        await WriteAuditAsync("organization", nameof(Department), "department.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ShiftDto>> ListShiftsAsync(OrganizationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Shifts.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(shift => shift.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(shift => shift.BranchId == filter.BranchId.Value);
        }

        query = ApplyShiftFilters(query, filter);

        var page = await query.OrderBy(shift => shift.SequenceNo).ThenBy(shift => shift.ShiftCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapShift);
    }

    public async Task<ShiftDto> GetShiftAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.Shifts.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(shift => shift.Id == id, cancellationToken);

        return MapShift(EnsureFound(entity, "Shift was not found in the active scope.", "organization.shift_not_found"));
    }

    public async Task<ShiftDto> CreateShiftAsync(ShiftUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateShift(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = Shift.Create(
            request.CompanyId,
            request.BranchId,
            request.ShiftCode,
            request.ShiftName,
            request.StartTime,
            request.EndTime,
            request.CrossesMidnight,
            request.BreakMinutes,
            request.SequenceNo,
            Normalize(request.CalendarProfileCode),
            request.Status,
            GetUserId());

        DbContext.Shifts.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapShift(entity);
        await WriteAuditAsync("organization", nameof(Shift), "shift.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ShiftDto> UpdateShiftAsync(long id, ShiftUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateShift(request);

        var scope = GetScope();
        var entity = await DbContext.Shifts.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(shift => shift.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Shift was not found in the active scope.", "organization.shift_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Shift company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Shift branch cannot be changed."));

        var before = MapShift(entity);
        entity.Update(
            request.ShiftCode,
            request.ShiftName,
            request.StartTime,
            request.EndTime,
            request.CrossesMidnight,
            request.BreakMinutes,
            request.SequenceNo,
            Normalize(request.CalendarProfileCode),
            request.Status,
            GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapShift(entity);
        await WriteAuditAsync("organization", nameof(Shift), "shift.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<WarehouseDto>> ListWarehousesAsync(OrganizationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Warehouses.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(warehouse => warehouse.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(warehouse => warehouse.BranchId == filter.BranchId.Value);
        }

        query = ApplyWarehouseFilters(query, filter);

        var page = await query.OrderBy(warehouse => warehouse.WarehouseCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapWarehouse);
    }

    public async Task<WarehouseDto> GetWarehouseAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.Warehouses.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope)
            .FirstOrDefaultAsync(warehouse => warehouse.Id == id, cancellationToken);

        return MapWarehouse(EnsureFound(entity, "Warehouse was not found in the active scope.", "organization.warehouse_not_found"));
    }

    public async Task<WarehouseDto> CreateWarehouseAsync(WarehouseUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWarehouse(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = Warehouse.Create(
            request.CompanyId,
            request.BranchId,
            request.WarehouseCode,
            request.WarehouseName,
            request.WarehouseType,
            request.IsDefaultReceivingWarehouse,
            request.IsDefaultIssueWarehouse,
            request.IsDispatchEnabled,
            request.AllowsMixedLots,
            request.AllowsNegativeStock,
            request.Status,
            GetUserId());

        DbContext.Warehouses.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapWarehouse(entity);
        await WriteAuditAsync("organization", nameof(Warehouse), "warehouse.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<WarehouseDto> UpdateWarehouseAsync(long id, WarehouseUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWarehouse(request);

        var scope = GetScope();
        var entity = await DbContext.Warehouses.ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope)
            .FirstOrDefaultAsync(warehouse => warehouse.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Warehouse was not found in the active scope.", "organization.warehouse_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Warehouse company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Warehouse branch cannot be changed."));

        var before = MapWarehouse(entity);
        entity.Update(
            request.WarehouseCode,
            request.WarehouseName,
            request.WarehouseType,
            request.IsDefaultReceivingWarehouse,
            request.IsDefaultIssueWarehouse,
            request.IsDispatchEnabled,
            request.AllowsMixedLots,
            request.AllowsNegativeStock,
            request.Status,
            GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapWarehouse(entity);
        await WriteAuditAsync("organization", nameof(Warehouse), "warehouse.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<BinDto>> ListBinsAsync(OrganizationFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Bins.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(bin => bin.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(bin => bin.BranchId == filter.BranchId.Value);
        }

        query = ApplyBinFilters(query, filter);

        var page = await query.OrderBy(bin => bin.BinCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapBin);
    }

    public async Task<BinDto> GetBinAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.Bins.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope)
            .FirstOrDefaultAsync(bin => bin.Id == id, cancellationToken);

        return MapBin(EnsureFound(entity, "Bin was not found in the active scope.", "organization.bin_not_found"));
    }

    public async Task<BinDto> CreateBinAsync(BinUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBin(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureWarehouseAccess(request.WarehouseId);

        var entity = Bin.Create(
            request.CompanyId,
            request.BranchId,
            request.WarehouseId,
            request.ParentBinId,
            request.BinCode,
            request.BinName,
            request.BinType,
            request.CapacityValue,
            request.CapacityUomId,
            request.IsDefaultReceiveBin,
            request.IsDefaultIssueBin,
            request.IsCountCycleRequired,
            request.CountCycleDays,
            request.IsBlocked,
            Normalize(request.BlockReasonCode),
            request.Status,
            GetUserId());

        DbContext.Bins.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapBin(entity);
        await WriteAuditAsync("organization", nameof(Bin), "bin.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<BinDto> UpdateBinAsync(long id, BinUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateBin(request);

        var scope = GetScope();
        var entity = await DbContext.Bins.ApplyActiveOrganizationScope(scope)
            .ApplyWarehouseScope(scope)
            .FirstOrDefaultAsync(bin => bin.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Bin was not found in the active scope.", "organization.bin_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Bin company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Bin branch cannot be changed."),
            Immutable(entity.WarehouseId ?? 0, request.WarehouseId, nameof(request.WarehouseId), "Bin warehouse cannot be changed."));

        var before = MapBin(entity);
        entity.Update(
            request.ParentBinId,
            request.BinCode,
            request.BinName,
            request.BinType,
            request.CapacityValue,
            request.CapacityUomId,
            request.IsDefaultReceiveBin,
            request.IsDefaultIssueBin,
            request.IsCountCycleRequired,
            request.CountCycleDays,
            request.IsBlocked,
            Normalize(request.BlockReasonCode),
            request.Status,
            GetUserId());

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapBin(entity);
        await WriteAuditAsync("organization", nameof(Bin), "bin.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    private static IQueryable<Company> ApplyCompanyRootScope(IQueryable<Company> query, DataScopeContext scope)
    {
        if (scope.ActiveCompanyId.HasValue)
        {
            query = query.Where(company => company.Id == scope.ActiveCompanyId.Value);
        }

        return query;
    }

    private static IQueryable<Branch> ApplyBranchRootScope(IQueryable<Branch> query, DataScopeContext scope)
    {
        if (scope.ActiveCompanyId.HasValue)
        {
            query = query.Where(branch => !branch.CompanyId.HasValue || branch.CompanyId.Value == scope.ActiveCompanyId.Value);
        }

        if (scope.ActiveBranchId.HasValue)
        {
            query = query.Where(branch => branch.Id == scope.ActiveBranchId.Value);
        }

        return query;
    }

    private static IQueryable<Company> ApplyCompanyFilters(IQueryable<Company> query, OrganizationFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(company => company.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(company =>
                company.CompanyCode.Contains(search) ||
                company.CompanyName.Contains(search) ||
                company.LegalName.Contains(search));
        }

        return query;
    }

    private static IQueryable<Branch> ApplyBranchFilters(IQueryable<Branch> query, OrganizationFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(branch => branch.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(branch =>
                branch.BranchCode.Contains(search) ||
                branch.BranchName.Contains(search) ||
                branch.BranchType.Contains(search));
        }

        return query;
    }

    private static IQueryable<Department> ApplyDepartmentFilters(IQueryable<Department> query, OrganizationFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(department => department.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(department =>
                department.DepartmentCode.Contains(search) ||
                department.DepartmentName.Contains(search) ||
                department.DepartmentType.Contains(search));
        }

        return query;
    }

    private static IQueryable<Shift> ApplyShiftFilters(IQueryable<Shift> query, OrganizationFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(shift => shift.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(shift =>
                shift.ShiftCode.Contains(search) ||
                shift.ShiftName.Contains(search));
        }

        return query;
    }

    private static IQueryable<Warehouse> ApplyWarehouseFilters(IQueryable<Warehouse> query, OrganizationFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(warehouse => warehouse.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(warehouse =>
                warehouse.WarehouseCode.Contains(search) ||
                warehouse.WarehouseName.Contains(search) ||
                warehouse.WarehouseType.Contains(search));
        }

        return query;
    }

    private static IQueryable<Bin> ApplyBinFilters(IQueryable<Bin> query, OrganizationFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(bin => bin.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(bin =>
                bin.BinCode.Contains(search) ||
                bin.BinName.Contains(search) ||
                bin.BinType.Contains(search));
        }

        return query;
    }

    private static void ValidateCompany(CompanyUpsertRequest request) =>
        ThrowIfInvalid(
            Required(request.CompanyCode, nameof(request.CompanyCode), "Company code is required."),
            Required(request.CompanyName, nameof(request.CompanyName), "Company name is required."),
            Required(request.LegalName, nameof(request.LegalName), "Legal name is required."),
            Required(request.TimeZoneId, nameof(request.TimeZoneId), "Time zone is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateBranch(BranchUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.BranchCode, nameof(request.BranchCode), "Branch code is required."),
            Required(request.BranchName, nameof(request.BranchName), "Branch name is required."),
            Required(request.BranchType, nameof(request.BranchType), "Branch type is required."),
            Required(request.TimeZoneId, nameof(request.TimeZoneId), "Time zone is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateDepartment(DepartmentUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.DepartmentCode, nameof(request.DepartmentCode), "Department code is required."),
            Required(request.DepartmentName, nameof(request.DepartmentName), "Department name is required."),
            Required(request.DepartmentType, nameof(request.DepartmentType), "Department type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateShift(ShiftUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.ShiftCode, nameof(request.ShiftCode), "Shift code is required."),
            Required(request.ShiftName, nameof(request.ShiftName), "Shift name is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.BreakMinutes, nameof(request.BreakMinutes), "Break minutes cannot be negative."),
            NonNegative(request.SequenceNo, nameof(request.SequenceNo), "Sequence number cannot be negative.")
        };

        if (!request.CrossesMidnight && request.EndTime <= request.StartTime)
        {
            errors.Add(new ApiError("validation.invalid", nameof(request.EndTime), "End time must be after start time for the same-day shift."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateWarehouse(WarehouseUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.WarehouseCode, nameof(request.WarehouseCode), "Warehouse code is required."),
            Required(request.WarehouseName, nameof(request.WarehouseName), "Warehouse name is required."),
            Required(request.WarehouseType, nameof(request.WarehouseType), "Warehouse type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateBin(BinUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Positive(request.WarehouseId, nameof(request.WarehouseId), "Warehouse is required."),
            Required(request.BinCode, nameof(request.BinCode), "Bin code is required."),
            Required(request.BinName, nameof(request.BinName), "Bin name is required."),
            Required(request.BinType, nameof(request.BinType), "Bin type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.CapacityValue, nameof(request.CapacityValue), "Capacity cannot be negative.")
        };

        if (request.IsCountCycleRequired && (!request.CountCycleDays.HasValue || request.CountCycleDays.Value <= 0))
        {
            errors.Add(new ApiError("validation.invalid", nameof(request.CountCycleDays), "Count cycle days are required when cycle counting is enabled."));
        }

        if (request.IsBlocked && string.IsNullOrWhiteSpace(request.BlockReasonCode))
        {
            errors.Add(new ApiError("validation.required", nameof(request.BlockReasonCode), "Blocked bins require a block reason."));
        }

        ThrowIfInvalid(errors);
    }

    private static CompanyDto MapCompany(Company entity) =>
        new(
            entity.Id,
            entity.CompanyCode,
            entity.CompanyName,
            entity.LegalName,
            entity.TaxRegistrationNo,
            entity.TimeZoneId,
            entity.DefaultLanguageId,
            entity.BaseCurrencyCode,
            entity.DefaultCalendarCode,
            entity.Status);

    private static BranchDto MapBranch(Branch entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchCode,
            entity.BranchName,
            entity.BranchType,
            entity.TimeZoneId,
            entity.DefaultLanguageId,
            entity.DefaultCalendarCode,
            entity.DefaultShiftId,
            entity.DefaultWarehouseId,
            entity.ContactEmail,
            entity.Status);

    private static DepartmentDto MapDepartment(Department entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId,
            entity.DepartmentCode,
            entity.DepartmentName,
            entity.ParentDepartmentId,
            entity.ManagerUserId,
            entity.DepartmentType,
            entity.Status);

    private static ShiftDto MapShift(Shift entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId,
            entity.ShiftCode,
            entity.ShiftName,
            entity.StartTime,
            entity.EndTime,
            entity.CrossesMidnight,
            entity.BreakMinutes,
            entity.SequenceNo,
            entity.CalendarProfileCode,
            entity.Status);

    private static WarehouseDto MapWarehouse(Warehouse entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.WarehouseCode,
            entity.WarehouseName,
            entity.WarehouseType,
            entity.IsDefaultReceivingWarehouse,
            entity.IsDefaultIssueWarehouse,
            entity.IsDispatchEnabled,
            entity.AllowsMixedLots,
            entity.AllowsNegativeStock,
            entity.Status);

    private static BinDto MapBin(Bin entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.WarehouseId ?? 0,
            entity.ParentBinId,
            entity.BinCode,
            entity.BinName,
            entity.BinType,
            entity.CapacityValue,
            entity.CapacityUomId,
            entity.IsDefaultReceiveBin,
            entity.IsDefaultIssueBin,
            entity.IsCountCycleRequired,
            entity.CountCycleDays,
            entity.IsBlocked,
            entity.BlockReasonCode,
            entity.Status);
}
