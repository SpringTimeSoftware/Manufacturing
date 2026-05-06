using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Resources;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Masters;
using STS.Mfg.Application.Contracts.Resources;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Resources;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Resources;

internal sealed class ResourceService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IResourceService
{
    public async Task<PagedResult<CustomerDto>> ListCustomersAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Customers.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyCustomerFilters(query, filter);

        var page = await query.OrderBy(entity => entity.CustomerCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapCustomer);
    }

    public async Task<CustomerDto> CreateCustomerAsync(CustomerUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCustomer(request);
        EnsureContextAccess(request.CompanyId, request.DefaultBranchId);

        var entity = Customer.Create(
            request.CompanyId,
            request.CustomerCode,
            request.CustomerName,
            Normalize(request.ShortName),
            request.CustomerType,
            request.DefaultBranchId,
            request.DefaultLanguageId,
            Normalize(request.TaxRegistrationNo),
            Normalize(request.PaymentTermsCode),
            request.CreditDays,
            request.Status,
            GetUserId());

        DbContext.Customers.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapCustomer(entity);
        await WriteAuditAsync("partners", nameof(Customer), "customer.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<CustomerDto> UpdateCustomerAsync(long id, CustomerUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCustomer(request);

        var scope = GetScope();
        var entity = await DbContext.Customers.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Customer was not found in the active scope.", "partners.customer_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Customer company cannot be changed."),
            Immutable(entity.DefaultBranchId, request.DefaultBranchId, nameof(request.DefaultBranchId), "Customer default branch cannot be changed."));

        var before = MapCustomer(entity);
        entity.Update(
            request.CustomerCode,
            request.CustomerName,
            Normalize(request.ShortName),
            request.CustomerType,
            request.DefaultBranchId,
            request.DefaultLanguageId,
            Normalize(request.TaxRegistrationNo),
            Normalize(request.PaymentTermsCode),
            request.CreditDays,
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapCustomer(entity);
        await WriteAuditAsync("partners", nameof(Customer), "customer.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<CustomerPartnerWorkspaceDto> GetCustomerPartnerWorkspaceAsync(long customerId, CancellationToken cancellationToken = default)
    {
        var customer = await RequireCustomerAsync(customerId, cancellationToken);
        return await BuildCustomerPartnerWorkspaceAsync(customer, cancellationToken);
    }

    public async Task<CustomerPartnerWorkspaceDto> UpdateCustomerPartnerWorkspaceAsync(long customerId, CustomerPartnerProfileUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCustomerPartnerWorkspace(request);

        var customer = await RequireCustomerAsync(customerId, cancellationToken);
        EnsureContextAccess(customer.CompanyId, customer.DefaultBranchId);
        var before = await BuildCustomerPartnerWorkspaceAsync(customer, cancellationToken);
        var userId = GetUserId();
        var companyId = customer.CompanyId ?? 0;

        var profile = await DbContext.CustomerPartnerProfiles
            .FirstOrDefaultAsync(entity => entity.CustomerId == customerId, cancellationToken);

        if (profile is null)
        {
            profile = CustomerPartnerProfile.Create(
                companyId,
                customerId,
                request.Profile.LegalName,
                request.Profile.TaxCategory,
                request.Profile.CurrencyCode,
                request.Profile.CreditStatus,
                request.Profile.CreditLimitAmount,
                request.Profile.CreditHoldRule,
                request.Profile.PaymentTermsCode,
                request.Profile.CommercialSegment,
                request.Profile.OrderReleaseControl,
                request.Profile.DispatchPreference,
                request.Profile.DispatchInstruction,
                request.Profile.CatalogVisible,
                request.Profile.CatalogSegment,
                request.Profile.Status,
                userId);
            DbContext.CustomerPartnerProfiles.Add(profile);
        }
        else
        {
            profile.Update(
                request.Profile.LegalName,
                request.Profile.TaxCategory,
                request.Profile.CurrencyCode,
                request.Profile.CreditStatus,
                request.Profile.CreditLimitAmount,
                request.Profile.CreditHoldRule,
                request.Profile.PaymentTermsCode,
                request.Profile.CommercialSegment,
                request.Profile.OrderReleaseControl,
                request.Profile.DispatchPreference,
                request.Profile.DispatchInstruction,
                request.Profile.CatalogVisible,
                request.Profile.CatalogSegment,
                request.Profile.Status,
                userId);
        }

        await UpsertCustomerContactPointsAsync(customer, request.ContactPoints, userId, cancellationToken);
        await UpsertCustomerItemReferencesAsync(customer, request.ItemReferences, userId, cancellationToken);
        await UpsertCustomerDocumentsAsync(customer, request.Documents, userId, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await BuildCustomerPartnerWorkspaceAsync(customer, cancellationToken);
        await WriteAuditAsync("partners", nameof(CustomerPartnerProfile), "customerprofile.update", customerId, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<CustomerAddressDto>> ListCustomerAddressesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.CustomerAddresses.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyCustomerAddressFilters(query, filter);

        var page = await query.OrderBy(entity => entity.CustomerId).ThenBy(entity => entity.AddressCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapCustomerAddress);
    }

    public async Task<CustomerAddressDto> CreateCustomerAddressAsync(CustomerAddressUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCustomerAddress(request);
        EnsureContextAccess(request.CompanyId, null);

        var customer = await RequireCustomerAsync(request.CustomerId, cancellationToken);
        ThrowIfInvalid(Immutable(customer.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Address company must match the parent customer."));

        var entity = CustomerAddress.Create(
            request.CompanyId,
            request.CustomerId,
            request.AddressCode,
            request.AddressType,
            request.AddressLine1,
            Normalize(request.AddressLine2),
            request.City,
            request.StateOrProvince,
            request.PostalCode,
            request.CountryCode,
            Normalize(request.ContactName),
            Normalize(request.ContactEmail),
            Normalize(request.ContactPhone),
            request.IsDefaultBilling,
            request.IsDefaultShipping,
            request.Status,
            GetUserId());

        DbContext.CustomerAddresses.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapCustomerAddress(entity);
        await WriteAuditAsync("partners", nameof(CustomerAddress), "customeraddress.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<CustomerAddressDto> UpdateCustomerAddressAsync(long id, CustomerAddressUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCustomerAddress(request);

        var scope = GetScope();
        var entity = await DbContext.CustomerAddresses.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Customer address was not found in the active scope.", "partners.customer_address_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Address company cannot be changed."),
            Immutable(entity.CustomerId, request.CustomerId, nameof(request.CustomerId), "Parent customer cannot be changed."));

        var before = MapCustomerAddress(entity);
        entity.Update(
            request.AddressCode,
            request.AddressType,
            request.AddressLine1,
            Normalize(request.AddressLine2),
            request.City,
            request.StateOrProvince,
            request.PostalCode,
            request.CountryCode,
            Normalize(request.ContactName),
            Normalize(request.ContactEmail),
            Normalize(request.ContactPhone),
            request.IsDefaultBilling,
            request.IsDefaultShipping,
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapCustomerAddress(entity);
        await WriteAuditAsync("partners", nameof(CustomerAddress), "customeraddress.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<SupplierDto>> ListSuppliersAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Suppliers.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplySupplierFilters(query, filter);

        var page = await query.OrderBy(entity => entity.SupplierCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapSupplier);
    }

    public async Task<SupplierDto> CreateSupplierAsync(SupplierUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplier(request);
        EnsureContextAccess(request.CompanyId, request.DefaultBranchId);

        var entity = Supplier.Create(
            request.CompanyId,
            request.SupplierCode,
            request.SupplierName,
            request.SupplierType,
            request.SupportsSubcontracting,
            request.DefaultBranchId,
            request.DefaultLanguageId,
            Normalize(request.TaxRegistrationNo),
            Normalize(request.PaymentTermsCode),
            request.Status,
            GetUserId());

        DbContext.Suppliers.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapSupplier(entity);
        await WriteAuditAsync("partners", nameof(Supplier), "supplier.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<SupplierDto> UpdateSupplierAsync(long id, SupplierUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplier(request);

        var scope = GetScope();
        var entity = await DbContext.Suppliers.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Supplier was not found in the active scope.", "partners.supplier_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Supplier company cannot be changed."),
            Immutable(entity.DefaultBranchId, request.DefaultBranchId, nameof(request.DefaultBranchId), "Supplier default branch cannot be changed."));

        var before = MapSupplier(entity);
        entity.Update(
            request.SupplierCode,
            request.SupplierName,
            request.SupplierType,
            request.SupportsSubcontracting,
            request.DefaultBranchId,
            request.DefaultLanguageId,
            Normalize(request.TaxRegistrationNo),
            Normalize(request.PaymentTermsCode),
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapSupplier(entity);
        await WriteAuditAsync("partners", nameof(Supplier), "supplier.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<SupplierPartnerWorkspaceDto> GetSupplierPartnerWorkspaceAsync(long supplierId, CancellationToken cancellationToken = default)
    {
        var supplier = await RequireSupplierAsync(supplierId, cancellationToken);
        return await BuildSupplierPartnerWorkspaceAsync(supplier, cancellationToken);
    }

    public async Task<SupplierPartnerWorkspaceDto> UpdateSupplierPartnerWorkspaceAsync(long supplierId, SupplierPartnerProfileUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplierPartnerWorkspace(request);

        var supplier = await RequireSupplierAsync(supplierId, cancellationToken);
        EnsureContextAccess(supplier.CompanyId, supplier.DefaultBranchId);
        var before = await BuildSupplierPartnerWorkspaceAsync(supplier, cancellationToken);
        var userId = GetUserId();
        var companyId = supplier.CompanyId ?? 0;

        var profile = await DbContext.SupplierPartnerProfiles
            .FirstOrDefaultAsync(entity => entity.SupplierId == supplierId, cancellationToken);

        if (profile is null)
        {
            profile = SupplierPartnerProfile.Create(
                companyId,
                supplierId,
                request.Profile.LegalName,
                request.Profile.TaxCategory,
                request.Profile.CurrencyCode,
                request.Profile.PaymentTermsCode,
                request.Profile.PreferredStatus,
                request.Profile.ComplianceStatus,
                request.Profile.CapabilitySummary,
                request.Profile.QualityRating,
                request.Profile.ProcurementReleaseControl,
                request.Profile.LeadTimeReviewDays,
                request.Profile.Status,
                userId);
            DbContext.SupplierPartnerProfiles.Add(profile);
        }
        else
        {
            profile.Update(
                request.Profile.LegalName,
                request.Profile.TaxCategory,
                request.Profile.CurrencyCode,
                request.Profile.PaymentTermsCode,
                request.Profile.PreferredStatus,
                request.Profile.ComplianceStatus,
                request.Profile.CapabilitySummary,
                request.Profile.QualityRating,
                request.Profile.ProcurementReleaseControl,
                request.Profile.LeadTimeReviewDays,
                request.Profile.Status,
                userId);
        }

        await UpsertSupplierContactPointsAsync(supplier, request.ContactPoints, userId, cancellationToken);
        await UpsertSupplierVendorReferencesAsync(supplier, request.VendorReferences, userId, cancellationToken);
        await UpsertSupplierDocumentsAsync(supplier, request.Documents, userId, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await BuildSupplierPartnerWorkspaceAsync(supplier, cancellationToken);
        await WriteAuditAsync("partners", nameof(SupplierPartnerProfile), "supplierprofile.update", supplierId, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<SupplierAddressDto>> ListSupplierAddressesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.SupplierAddresses.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplySupplierAddressFilters(query, filter);

        var page = await query.OrderBy(entity => entity.SupplierId).ThenBy(entity => entity.AddressCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapSupplierAddress);
    }

    public async Task<SupplierAddressDto> CreateSupplierAddressAsync(SupplierAddressUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplierAddress(request);
        EnsureContextAccess(request.CompanyId, null);

        var supplier = await RequireSupplierAsync(request.SupplierId, cancellationToken);
        ThrowIfInvalid(Immutable(supplier.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Address company must match the parent supplier."));

        var entity = SupplierAddress.Create(
            request.CompanyId,
            request.SupplierId,
            request.AddressCode,
            request.AddressType,
            request.AddressLine1,
            request.City,
            request.StateOrProvince,
            request.PostalCode,
            request.CountryCode,
            Normalize(request.ContactName),
            Normalize(request.ContactEmail),
            Normalize(request.ContactPhone),
            request.IsDefaultOrderAddress,
            request.Status,
            GetUserId());

        DbContext.SupplierAddresses.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapSupplierAddress(entity);
        await WriteAuditAsync("partners", nameof(SupplierAddress), "supplieraddress.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<SupplierAddressDto> UpdateSupplierAddressAsync(long id, SupplierAddressUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplierAddress(request);

        var scope = GetScope();
        var entity = await DbContext.SupplierAddresses.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Supplier address was not found in the active scope.", "partners.supplier_address_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Address company cannot be changed."),
            Immutable(entity.SupplierId, request.SupplierId, nameof(request.SupplierId), "Parent supplier cannot be changed."));

        var before = MapSupplierAddress(entity);
        entity.Update(
            request.AddressCode,
            request.AddressType,
            request.AddressLine1,
            request.City,
            request.StateOrProvince,
            request.PostalCode,
            request.CountryCode,
            Normalize(request.ContactName),
            Normalize(request.ContactEmail),
            Normalize(request.ContactPhone),
            request.IsDefaultOrderAddress,
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapSupplierAddress(entity);
        await WriteAuditAsync("partners", nameof(SupplierAddress), "supplieraddress.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<SupplierLeadTimeDto>> ListSupplierLeadTimesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.SupplierLeadTimes.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplySupplierLeadTimeFilters(query, filter);

        var page = await query.OrderBy(entity => entity.SupplierId).ThenBy(entity => entity.PriorityRank).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapSupplierLeadTime);
    }

    public async Task<SupplierLeadTimeDto> CreateSupplierLeadTimeAsync(SupplierLeadTimeUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplierLeadTime(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var supplier = await RequireSupplierAsync(request.SupplierId, cancellationToken);
        ThrowIfInvalid(Immutable(supplier.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Lead-time company must match the parent supplier."));

        var entity = SupplierLeadTime.Create(
            request.CompanyId,
            request.SupplierId,
            request.BranchId,
            request.ItemId,
            request.ItemGroupId,
            request.LeadTimeDays,
            request.MinOrderQty,
            request.OrderMultipleQty,
            request.IsSubcontractLeadTime,
            request.PriorityRank,
            request.Status,
            GetUserId());

        DbContext.SupplierLeadTimes.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapSupplierLeadTime(entity);
        await WriteAuditAsync("partners", nameof(SupplierLeadTime), "supplierleadtime.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<SupplierLeadTimeDto> UpdateSupplierLeadTimeAsync(long id, SupplierLeadTimeUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateSupplierLeadTime(request);

        var scope = GetScope();
        var entity = await DbContext.SupplierLeadTimes.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Supplier lead time was not found in the active scope.", "partners.supplier_leadtime_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Lead-time company cannot be changed."),
            Immutable(entity.SupplierId, request.SupplierId, nameof(request.SupplierId), "Parent supplier cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Lead-time branch cannot be changed."),
            Immutable(entity.ItemId, request.ItemId, nameof(request.ItemId), "Lead-time item cannot be changed."),
            Immutable(entity.ItemGroupId, request.ItemGroupId, nameof(request.ItemGroupId), "Lead-time item group cannot be changed."));

        var before = MapSupplierLeadTime(entity);
        entity.Update(request.LeadTimeDays, request.MinOrderQty, request.OrderMultipleQty, request.IsSubcontractLeadTime, request.PriorityRank, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapSupplierLeadTime(entity);
        await WriteAuditAsync("partners", nameof(SupplierLeadTime), "supplierleadtime.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<OperationDto>> ListOperationsAsync(ResourceFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Operations.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyOperationFilters(query, filter);

        var page = await query.OrderBy(entity => entity.OperationCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapOperation);
    }

    public async Task<OperationDto> CreateOperationAsync(OperationUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateOperation(request);
        EnsureContextAccess(request.CompanyId, null);

        var entity = Operation.Create(
            request.CompanyId,
            request.OperationCode,
            request.OperationName,
            request.OperationType,
            request.DefaultWorkCenterId,
            request.DefaultSetupMinutes,
            request.DefaultRunMinutesPerUnit,
            request.DefaultTeardownMinutes,
            request.AllowsOverlap,
            request.IsOutsideProcessing,
            request.RequiresQcCheckpoint,
            request.Status,
            GetUserId());

        DbContext.Operations.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapOperation(entity);
        await WriteAuditAsync("resources", nameof(Operation), "operation.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<OperationDto> UpdateOperationAsync(long id, OperationUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateOperation(request);

        var scope = GetScope();
        var entity = await DbContext.Operations.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Operation was not found in the active scope.", "resources.operation_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Operation company cannot be changed."));

        var before = MapOperation(entity);
        entity.Update(
            request.OperationCode,
            request.OperationName,
            request.OperationType,
            request.DefaultWorkCenterId,
            request.DefaultSetupMinutes,
            request.DefaultRunMinutesPerUnit,
            request.DefaultTeardownMinutes,
            request.AllowsOverlap,
            request.IsOutsideProcessing,
            request.RequiresQcCheckpoint,
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapOperation(entity);
        await WriteAuditAsync("resources", nameof(Operation), "operation.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<WorkCenterDto>> ListWorkCentersAsync(ResourceFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.WorkCenters.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyDepartmentScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyWorkCenterFilters(query, filter);

        var page = await query.OrderBy(entity => entity.WorkCenterCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapWorkCenter);
    }

    public async Task<WorkCenterDto> CreateWorkCenterAsync(WorkCenterUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWorkCenter(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureDepartmentAccess(request.DepartmentId);

        var entity = WorkCenter.Create(
            request.CompanyId,
            request.BranchId,
            request.WorkCenterCode,
            request.WorkCenterName,
            request.DepartmentId,
            request.CapacityUomId,
            Normalize(request.DefaultShiftPatternCode),
            request.ParallelCapacityUnits,
            request.Status,
            GetUserId());

        DbContext.WorkCenters.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapWorkCenter(entity);
        await WriteAuditAsync("resources", nameof(WorkCenter), "workcenter.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<WorkCenterDto> UpdateWorkCenterAsync(long id, WorkCenterUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateWorkCenter(request);

        var scope = GetScope();
        var entity = await DbContext.WorkCenters
            .ApplyActiveOrganizationScope(scope)
            .ApplyDepartmentScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Work center was not found in the active scope.", "resources.workcenter_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Work center company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Work center branch cannot be changed."),
            Immutable(entity.DepartmentId, request.DepartmentId, nameof(request.DepartmentId), "Work center department cannot be changed."));

        var before = MapWorkCenter(entity);
        entity.Update(request.WorkCenterCode, request.WorkCenterName, request.CapacityUomId, Normalize(request.DefaultShiftPatternCode), request.ParallelCapacityUnits, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapWorkCenter(entity);
        await WriteAuditAsync("resources", nameof(WorkCenter), "workcenter.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<MachineDto>> ListMachinesAsync(ResourceFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Machines.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyMachineFilters(query, filter);

        var page = await query.OrderBy(entity => entity.MachineCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapMachine);
    }

    public async Task<MachineDto> CreateMachineAsync(MachineUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMachine(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = Machine.Create(
            request.CompanyId,
            request.BranchId,
            request.WorkCenterId,
            request.MachineCode,
            request.MachineName,
            request.CapacityPerHour,
            request.CurrentStatus,
            request.DefaultShiftId,
            request.IsUnderMaintenance,
            request.IsSchedulingEnabled,
            request.Status,
            GetUserId());

        DbContext.Machines.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapMachine(entity);
        await WriteAuditAsync("resources", nameof(Machine), "machine.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<MachineDto> UpdateMachineAsync(long id, MachineUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMachine(request);

        var scope = GetScope();
        var entity = await DbContext.Machines.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Machine was not found in the active scope.", "resources.machine_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Machine company cannot be changed."),
            Immutable(entity.BranchId ?? 0, request.BranchId, nameof(request.BranchId), "Machine branch cannot be changed."),
            Immutable(entity.WorkCenterId, request.WorkCenterId, nameof(request.WorkCenterId), "Machine work center cannot be changed."));

        var before = MapMachine(entity);
        entity.Update(
            request.MachineCode,
            request.MachineName,
            request.CapacityPerHour,
            request.CurrentStatus,
            request.DefaultShiftId,
            request.IsUnderMaintenance,
            request.IsSchedulingEnabled,
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapMachine(entity);
        await WriteAuditAsync("resources", nameof(Machine), "machine.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ToolDto>> ListToolsAsync(ResourceFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Tools.AsNoTracking().ApplyActiveOrganizationScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        query = ApplyToolFilters(query, filter);

        var page = await query.OrderBy(entity => entity.ToolCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapTool);
    }

    public async Task<ToolDto> CreateToolAsync(ToolUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTool(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var entity = Tool.Create(
            request.CompanyId,
            request.BranchId,
            request.ToolCode,
            request.ToolName,
            request.ToolType,
            Normalize(request.CompatibleMachineGroup),
            request.Status,
            GetUserId());

        DbContext.Tools.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapTool(entity);
        await WriteAuditAsync("resources", nameof(Tool), "tool.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ToolDto> UpdateToolAsync(long id, ToolUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTool(request);

        var scope = GetScope();
        var entity = await DbContext.Tools.ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Tool was not found in the active scope.", "resources.tool_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Tool company cannot be changed."),
            Immutable(entity.BranchId, request.BranchId, nameof(request.BranchId), "Tool branch cannot be changed."));

        var before = MapTool(entity);
        entity.Update(request.ToolCode, request.ToolName, request.ToolType, Normalize(request.CompatibleMachineGroup), request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapTool(entity);
        await WriteAuditAsync("resources", nameof(Tool), "tool.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    private async Task<Customer> RequireCustomerAsync(long customerId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.Customers.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == customerId, cancellationToken);

        return EnsureFound(entity, "Parent customer was not found in the active scope.", "partners.customer_not_found");
    }

    private async Task<Supplier> RequireSupplierAsync(long supplierId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.Suppliers.AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .FirstOrDefaultAsync(record => record.Id == supplierId, cancellationToken);

        return EnsureFound(entity, "Parent supplier was not found in the active scope.", "partners.supplier_not_found");
    }

    private static IQueryable<Customer> ApplyCustomerFilters(IQueryable<Customer> query, CompanyScopedFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.CustomerCode.Contains(search) || entity.CustomerName.Contains(search) || entity.CustomerType.Contains(search));
        }

        return query;
    }

    private static IQueryable<CustomerAddress> ApplyCustomerAddressFilters(IQueryable<CustomerAddress> query, CompanyScopedFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.AddressCode.Contains(search) || entity.City.Contains(search) || entity.CountryCode.Contains(search));
        }

        return query;
    }

    private static IQueryable<Supplier> ApplySupplierFilters(IQueryable<Supplier> query, CompanyScopedFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.SupplierCode.Contains(search) || entity.SupplierName.Contains(search) || entity.SupplierType.Contains(search));
        }

        return query;
    }

    private static IQueryable<SupplierAddress> ApplySupplierAddressFilters(IQueryable<SupplierAddress> query, CompanyScopedFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.AddressCode.Contains(search) || entity.City.Contains(search) || entity.CountryCode.Contains(search));
        }

        return query;
    }

    private static IQueryable<SupplierLeadTime> ApplySupplierLeadTimeFilters(IQueryable<SupplierLeadTime> query, CompanyScopedFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search) && long.TryParse(filter.Search.Trim(), out var supplierId))
        {
            query = query.Where(entity => entity.SupplierId == supplierId);
        }

        return query;
    }

    private static IQueryable<Operation> ApplyOperationFilters(IQueryable<Operation> query, ResourceFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.OperationCode.Contains(search) || entity.OperationName.Contains(search) || entity.OperationType.Contains(search));
        }

        return query;
    }

    private static IQueryable<WorkCenter> ApplyWorkCenterFilters(IQueryable<WorkCenter> query, ResourceFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.WorkCenterCode.Contains(search) || entity.WorkCenterName.Contains(search));
        }

        return query;
    }

    private static IQueryable<Machine> ApplyMachineFilters(IQueryable<Machine> query, ResourceFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.MachineCode.Contains(search) || entity.MachineName.Contains(search) || entity.CurrentStatus.Contains(search));
        }

        return query;
    }

    private static IQueryable<Tool> ApplyToolFilters(IQueryable<Tool> query, ResourceFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ToolCode.Contains(search) || entity.ToolName.Contains(search) || entity.ToolType.Contains(search));
        }

        return query;
    }

    private static void ValidateCustomer(CustomerUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.CustomerCode, nameof(request.CustomerCode), "Customer code is required."),
            Required(request.CustomerName, nameof(request.CustomerName), "Customer name is required."),
            Required(request.CustomerType, nameof(request.CustomerType), "Customer type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            request.CreditDays.HasValue && request.CreditDays.Value < 0 ? new ApiError("validation.out_of_range", nameof(request.CreditDays), "Credit days cannot be negative.") : null);

    private static void ValidateCustomerAddress(CustomerAddressUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.CustomerId, nameof(request.CustomerId), "Customer is required."),
            Required(request.AddressCode, nameof(request.AddressCode), "Address code is required."),
            Required(request.AddressType, nameof(request.AddressType), "Address type is required."),
            Required(request.AddressLine1, nameof(request.AddressLine1), "Address line 1 is required."),
            Required(request.City, nameof(request.City), "City is required."),
            Required(request.StateOrProvince, nameof(request.StateOrProvince), "State or province is required."),
            Required(request.PostalCode, nameof(request.PostalCode), "Postal code is required."),
            Required(request.CountryCode, nameof(request.CountryCode), "Country code is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateSupplier(SupplierUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.SupplierCode, nameof(request.SupplierCode), "Supplier code is required."),
            Required(request.SupplierName, nameof(request.SupplierName), "Supplier name is required."),
            Required(request.SupplierType, nameof(request.SupplierType), "Supplier type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateSupplierAddress(SupplierAddressUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.SupplierId, nameof(request.SupplierId), "Supplier is required."),
            Required(request.AddressCode, nameof(request.AddressCode), "Address code is required."),
            Required(request.AddressType, nameof(request.AddressType), "Address type is required."),
            Required(request.AddressLine1, nameof(request.AddressLine1), "Address line 1 is required."),
            Required(request.City, nameof(request.City), "City is required."),
            Required(request.StateOrProvince, nameof(request.StateOrProvince), "State or province is required."),
            Required(request.PostalCode, nameof(request.PostalCode), "Postal code is required."),
            Required(request.CountryCode, nameof(request.CountryCode), "Country code is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateSupplierLeadTime(SupplierLeadTimeUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.SupplierId, nameof(request.SupplierId), "Supplier is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            request.LeadTimeDays < 0 ? new ApiError("validation.out_of_range", nameof(request.LeadTimeDays), "Lead time cannot be negative.") : null,
            NonNegative(request.MinOrderQty, nameof(request.MinOrderQty), "Minimum order quantity cannot be negative."),
            NonNegative(request.OrderMultipleQty, nameof(request.OrderMultipleQty), "Order multiple cannot be negative."),
            request.PriorityRank < 0 ? new ApiError("validation.out_of_range", nameof(request.PriorityRank), "Priority rank cannot be negative.") : null);

    private async Task<CustomerPartnerWorkspaceDto> BuildCustomerPartnerWorkspaceAsync(Customer customer, CancellationToken cancellationToken)
    {
        var profile = await DbContext.CustomerPartnerProfiles.AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.CustomerId == customer.Id, cancellationToken);
        var contacts = await DbContext.CustomerContactPoints.AsNoTracking()
            .Where(entity => entity.CustomerId == customer.Id)
            .OrderByDescending(entity => entity.IsPrimary)
            .ThenBy(entity => entity.ContactName)
            .ToArrayAsync(cancellationToken);
        var references = await DbContext.CustomerItemReferenceProfiles.AsNoTracking()
            .Where(entity => entity.CustomerId == customer.Id)
            .OrderBy(entity => entity.CustomerItemCode)
            .ToArrayAsync(cancellationToken);
        var documents = await DbContext.CustomerDocuments.AsNoTracking()
            .Where(entity => entity.CustomerId == customer.Id)
            .OrderBy(entity => entity.DocumentType)
            .ThenBy(entity => entity.Title)
            .ToArrayAsync(cancellationToken);
        var addressIds = await DbContext.CustomerAddresses.AsNoTracking()
            .Where(entity => entity.CustomerId == customer.Id)
            .Select(entity => entity.Id.ToString())
            .ToArrayAsync(cancellationToken);
        var entityIds = new[] { customer.Id.ToString() }
            .Concat(addressIds)
            .Concat(contacts.Select(entity => entity.Id.ToString()))
            .Concat(references.Select(entity => entity.Id.ToString()))
            .Concat(documents.Select(entity => entity.Id.ToString()))
            .ToArray();
        var auditEvents = await ListPartnerAuditEventsAsync(
            customer.CompanyId,
            entityIds,
            new[]
            {
                nameof(Customer),
                nameof(CustomerAddress),
                nameof(CustomerPartnerProfile),
                nameof(CustomerContactPoint),
                nameof(CustomerItemReferenceProfile),
                nameof(CustomerDocument)
            },
            cancellationToken);

        return new CustomerPartnerWorkspaceDto(
            MapCustomerPartnerProfile(customer, profile),
            contacts.Select(MapCustomerContactPoint).ToArray(),
            references.Select(MapCustomerItemReferenceProfile).ToArray(),
            documents.Select(MapCustomerDocument).ToArray(),
            auditEvents);
    }

    private async Task<SupplierPartnerWorkspaceDto> BuildSupplierPartnerWorkspaceAsync(Supplier supplier, CancellationToken cancellationToken)
    {
        var profile = await DbContext.SupplierPartnerProfiles.AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.SupplierId == supplier.Id, cancellationToken);
        var contacts = await DbContext.SupplierContactPoints.AsNoTracking()
            .Where(entity => entity.SupplierId == supplier.Id)
            .OrderByDescending(entity => entity.IsPrimary)
            .ThenBy(entity => entity.ContactName)
            .ToArrayAsync(cancellationToken);
        var references = await DbContext.SupplierVendorReferenceProfiles.AsNoTracking()
            .Where(entity => entity.SupplierId == supplier.Id)
            .OrderBy(entity => entity.VendorItemCode)
            .ToArrayAsync(cancellationToken);
        var documents = await DbContext.SupplierDocuments.AsNoTracking()
            .Where(entity => entity.SupplierId == supplier.Id)
            .OrderBy(entity => entity.DocumentType)
            .ThenBy(entity => entity.Title)
            .ToArrayAsync(cancellationToken);
        var addressIds = await DbContext.SupplierAddresses.AsNoTracking()
            .Where(entity => entity.SupplierId == supplier.Id)
            .Select(entity => entity.Id.ToString())
            .ToArrayAsync(cancellationToken);
        var leadTimeIds = await DbContext.SupplierLeadTimes.AsNoTracking()
            .Where(entity => entity.SupplierId == supplier.Id)
            .Select(entity => entity.Id.ToString())
            .ToArrayAsync(cancellationToken);
        var entityIds = new[] { supplier.Id.ToString() }
            .Concat(addressIds)
            .Concat(leadTimeIds)
            .Concat(contacts.Select(entity => entity.Id.ToString()))
            .Concat(references.Select(entity => entity.Id.ToString()))
            .Concat(documents.Select(entity => entity.Id.ToString()))
            .ToArray();
        var auditEvents = await ListPartnerAuditEventsAsync(
            supplier.CompanyId,
            entityIds,
            new[]
            {
                nameof(Supplier),
                nameof(SupplierAddress),
                nameof(SupplierLeadTime),
                nameof(SupplierPartnerProfile),
                nameof(SupplierContactPoint),
                nameof(SupplierVendorReferenceProfile),
                nameof(SupplierDocument)
            },
            cancellationToken);

        return new SupplierPartnerWorkspaceDto(
            MapSupplierPartnerProfile(supplier, profile),
            contacts.Select(MapSupplierContactPoint).ToArray(),
            references.Select(MapSupplierVendorReferenceProfile).ToArray(),
            documents.Select(MapSupplierDocument).ToArray(),
            auditEvents);
    }

    private async Task<IReadOnlyCollection<PartnerAuditEventDto>> ListPartnerAuditEventsAsync(long? companyId, IReadOnlyCollection<string> entityIds, IReadOnlyCollection<string> entityTypes, CancellationToken cancellationToken)
    {
        if (!companyId.HasValue || entityIds.Count == 0)
        {
            return Array.Empty<PartnerAuditEventDto>();
        }

        return await DbContext.AuditLogs.AsNoTracking()
            .Where(entity => entity.CompanyId == companyId.Value && entity.EntityId != null && entityIds.Contains(entity.EntityId) && entityTypes.Contains(entity.EntityType))
            .OrderByDescending(entity => entity.CreatedOn)
            .Take(30)
            .Select(entity => new PartnerAuditEventDto(
                entity.Id,
                entity.EntityType,
                entity.ActionCode,
                entity.CreatedByUserId.HasValue ? "User " + entity.CreatedByUserId.Value : "System",
                entity.CreatedOn,
                "Recorded"))
            .ToArrayAsync(cancellationToken);
    }

    private async Task UpsertCustomerContactPointsAsync(Customer customer, IReadOnlyCollection<CustomerContactPointUpsertRequest>? requests, long? userId, CancellationToken cancellationToken)
    {
        var existing = await DbContext.CustomerContactPoints
            .Where(entity => entity.CustomerId == customer.Id)
            .ToDictionaryAsync(entity => entity.Id, cancellationToken);

        foreach (var request in requests ?? Array.Empty<CustomerContactPointUpsertRequest>())
        {
            if (request.CustomerAddressId.HasValue)
            {
                var addressExists = await DbContext.CustomerAddresses.AsNoTracking()
                    .AnyAsync(entity => entity.Id == request.CustomerAddressId.Value && entity.CustomerId == customer.Id, cancellationToken);
                ThrowIfInvalid(addressExists ? null : new ApiError("validation.invalid_reference", nameof(request.CustomerAddressId), "Customer contact site must belong to this customer."));
            }

            if (request.Id.HasValue && request.Id.Value > 0)
            {
                var entity = EnsureFound(existing.GetValueOrDefault(request.Id.Value), "Customer contact point was not found.", "partners.customer_contact_not_found");
                entity.Update(request.CustomerAddressId, request.ContactName, request.ContactRole, request.Channel, request.ContactValue, request.IsPrimary, request.ConsentStatus, request.EscalationLevel, request.Status, userId);
            }
            else
            {
                DbContext.CustomerContactPoints.Add(CustomerContactPoint.Create(customer.CompanyId ?? 0, customer.Id, request.CustomerAddressId, request.ContactName, request.ContactRole, request.Channel, request.ContactValue, request.IsPrimary, request.ConsentStatus, request.EscalationLevel, request.Status, userId));
            }
        }
    }

    private async Task UpsertCustomerItemReferencesAsync(Customer customer, IReadOnlyCollection<CustomerItemReferenceProfileUpsertRequest>? requests, long? userId, CancellationToken cancellationToken)
    {
        var existing = await DbContext.CustomerItemReferenceProfiles
            .Where(entity => entity.CustomerId == customer.Id)
            .ToDictionaryAsync(entity => entity.Id, cancellationToken);

        foreach (var request in requests ?? Array.Empty<CustomerItemReferenceProfileUpsertRequest>())
        {
            if (request.Id.HasValue && request.Id.Value > 0)
            {
                var entity = EnsureFound(existing.GetValueOrDefault(request.Id.Value), "Customer item reference was not found.", "partners.customer_item_reference_not_found");
                entity.Update(request.CustomerItemCode, request.DrawingNo, request.RevisionCode, request.PackagingOverride, request.SpecificationOverride, request.ApprovalStatus, request.Status, userId);
            }
            else
            {
                DbContext.CustomerItemReferenceProfiles.Add(CustomerItemReferenceProfile.Create(customer.CompanyId ?? 0, customer.Id, request.ItemId, request.CustomerItemCode, request.DrawingNo, request.RevisionCode, request.PackagingOverride, request.SpecificationOverride, request.ApprovalStatus, request.Status, userId));
            }
        }
    }

    private async Task UpsertCustomerDocumentsAsync(Customer customer, IReadOnlyCollection<CustomerDocumentUpsertRequest>? requests, long? userId, CancellationToken cancellationToken)
    {
        var existing = await DbContext.CustomerDocuments
            .Where(entity => entity.CustomerId == customer.Id)
            .ToDictionaryAsync(entity => entity.Id, cancellationToken);

        foreach (var request in requests ?? Array.Empty<CustomerDocumentUpsertRequest>())
        {
            if (request.Id.HasValue && request.Id.Value > 0)
            {
                var entity = EnsureFound(existing.GetValueOrDefault(request.Id.Value), "Customer document was not found.", "partners.customer_document_not_found");
                entity.Update(request.DocumentType, request.Title, request.DocumentNo, request.RevisionCode, request.FileName, request.StorageUri, request.ApprovalStatus, request.VisibilityScope, request.EffectiveFrom, request.EffectiveTo, request.ExpiresOn, request.Status, userId);
            }
            else
            {
                DbContext.CustomerDocuments.Add(CustomerDocument.Create(customer.CompanyId ?? 0, customer.Id, request.DocumentType, request.Title, request.DocumentNo, request.RevisionCode, request.FileName, request.StorageUri, request.ApprovalStatus, request.VisibilityScope, request.EffectiveFrom, request.EffectiveTo, request.ExpiresOn, request.Status, userId));
            }
        }
    }

    private async Task UpsertSupplierContactPointsAsync(Supplier supplier, IReadOnlyCollection<SupplierContactPointUpsertRequest>? requests, long? userId, CancellationToken cancellationToken)
    {
        var existing = await DbContext.SupplierContactPoints
            .Where(entity => entity.SupplierId == supplier.Id)
            .ToDictionaryAsync(entity => entity.Id, cancellationToken);

        foreach (var request in requests ?? Array.Empty<SupplierContactPointUpsertRequest>())
        {
            if (request.SupplierAddressId.HasValue)
            {
                var addressExists = await DbContext.SupplierAddresses.AsNoTracking()
                    .AnyAsync(entity => entity.Id == request.SupplierAddressId.Value && entity.SupplierId == supplier.Id, cancellationToken);
                ThrowIfInvalid(addressExists ? null : new ApiError("validation.invalid_reference", nameof(request.SupplierAddressId), "Supplier contact site must belong to this supplier."));
            }

            if (request.Id.HasValue && request.Id.Value > 0)
            {
                var entity = EnsureFound(existing.GetValueOrDefault(request.Id.Value), "Supplier contact point was not found.", "partners.supplier_contact_not_found");
                entity.Update(request.SupplierAddressId, request.ContactName, request.ContactRole, request.Channel, request.ContactValue, request.IsPrimary, request.ConsentStatus, request.EscalationLevel, request.Status, userId);
            }
            else
            {
                DbContext.SupplierContactPoints.Add(SupplierContactPoint.Create(supplier.CompanyId ?? 0, supplier.Id, request.SupplierAddressId, request.ContactName, request.ContactRole, request.Channel, request.ContactValue, request.IsPrimary, request.ConsentStatus, request.EscalationLevel, request.Status, userId));
            }
        }
    }

    private async Task UpsertSupplierVendorReferencesAsync(Supplier supplier, IReadOnlyCollection<SupplierVendorReferenceProfileUpsertRequest>? requests, long? userId, CancellationToken cancellationToken)
    {
        var existing = await DbContext.SupplierVendorReferenceProfiles
            .Where(entity => entity.SupplierId == supplier.Id)
            .ToDictionaryAsync(entity => entity.Id, cancellationToken);

        foreach (var request in requests ?? Array.Empty<SupplierVendorReferenceProfileUpsertRequest>())
        {
            if (request.Id.HasValue && request.Id.Value > 0)
            {
                var entity = EnsureFound(existing.GetValueOrDefault(request.Id.Value), "Supplier vendor reference was not found.", "partners.supplier_vendor_reference_not_found");
                entity.Update(request.VendorItemCode, request.MinimumOrderQty, request.LeadTimeDays, request.PurchaseUomId, request.ComplianceStatus, request.DocumentStatus, request.ApprovalStatus, request.Status, userId);
            }
            else
            {
                DbContext.SupplierVendorReferenceProfiles.Add(SupplierVendorReferenceProfile.Create(supplier.CompanyId ?? 0, supplier.Id, request.ItemId, request.VendorItemCode, request.MinimumOrderQty, request.LeadTimeDays, request.PurchaseUomId, request.ComplianceStatus, request.DocumentStatus, request.ApprovalStatus, request.Status, userId));
            }
        }
    }

    private async Task UpsertSupplierDocumentsAsync(Supplier supplier, IReadOnlyCollection<SupplierDocumentUpsertRequest>? requests, long? userId, CancellationToken cancellationToken)
    {
        var existing = await DbContext.SupplierDocuments
            .Where(entity => entity.SupplierId == supplier.Id)
            .ToDictionaryAsync(entity => entity.Id, cancellationToken);

        foreach (var request in requests ?? Array.Empty<SupplierDocumentUpsertRequest>())
        {
            if (request.Id.HasValue && request.Id.Value > 0)
            {
                var entity = EnsureFound(existing.GetValueOrDefault(request.Id.Value), "Supplier document was not found.", "partners.supplier_document_not_found");
                entity.Update(request.DocumentType, request.Title, request.DocumentNo, request.RevisionCode, request.FileName, request.StorageUri, request.ApprovalStatus, request.VisibilityScope, request.EffectiveFrom, request.EffectiveTo, request.ExpiresOn, request.Status, userId);
            }
            else
            {
                DbContext.SupplierDocuments.Add(SupplierDocument.Create(supplier.CompanyId ?? 0, supplier.Id, request.DocumentType, request.Title, request.DocumentNo, request.RevisionCode, request.FileName, request.StorageUri, request.ApprovalStatus, request.VisibilityScope, request.EffectiveFrom, request.EffectiveTo, request.ExpiresOn, request.Status, userId));
            }
        }
    }

    private static void ValidateCustomerPartnerWorkspace(CustomerPartnerProfileUpsertRequest request)
    {
        if (request.Profile is null)
        {
            ThrowIfInvalid(new ApiError("validation.required", nameof(request.Profile), "Customer profile is required."));
            return;
        }

        var errors = new List<ApiError?>
        {
            Required(request.Profile.Status, nameof(request.Profile.Status), "Profile status is required."),
            NonNegative(request.Profile.CreditLimitAmount, nameof(request.Profile.CreditLimitAmount), "Credit limit cannot be negative.")
        };

        foreach (var contact in request.ContactPoints ?? Array.Empty<CustomerContactPointUpsertRequest>())
        {
            errors.Add(Required(contact.ContactName, nameof(contact.ContactName), "Contact name is required."));
            errors.Add(Required(contact.ContactRole, nameof(contact.ContactRole), "Contact role is required."));
            errors.Add(Required(contact.Channel, nameof(contact.Channel), "Communication channel is required."));
            errors.Add(Required(contact.ContactValue, nameof(contact.ContactValue), "Contact value is required."));
            errors.Add(Required(contact.Status, nameof(contact.Status), "Contact status is required."));
        }

        foreach (var reference in request.ItemReferences ?? Array.Empty<CustomerItemReferenceProfileUpsertRequest>())
        {
            errors.Add(Required(reference.CustomerItemCode, nameof(reference.CustomerItemCode), "Customer item code is required."));
            errors.Add(Required(reference.ApprovalStatus, nameof(reference.ApprovalStatus), "Reference approval status is required."));
            errors.Add(Required(reference.Status, nameof(reference.Status), "Reference status is required."));
        }

        foreach (var document in request.Documents ?? Array.Empty<CustomerDocumentUpsertRequest>())
        {
            errors.Add(Required(document.DocumentType, nameof(document.DocumentType), "Document type is required."));
            errors.Add(Required(document.Title, nameof(document.Title), "Document title is required."));
            errors.Add(Required(document.ApprovalStatus, nameof(document.ApprovalStatus), "Document approval status is required."));
            errors.Add(Required(document.VisibilityScope, nameof(document.VisibilityScope), "Document visibility is required."));
            errors.Add(Required(document.Status, nameof(document.Status), "Document status is required."));
            errors.Add(document.EffectiveTo.HasValue && document.EffectiveFrom.HasValue && document.EffectiveTo.Value < document.EffectiveFrom.Value ? new ApiError("validation.invalid_range", nameof(document.EffectiveTo), "Document effective-to date cannot be before effective-from date.") : null);
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateSupplierPartnerWorkspace(SupplierPartnerProfileUpsertRequest request)
    {
        if (request.Profile is null)
        {
            ThrowIfInvalid(new ApiError("validation.required", nameof(request.Profile), "Supplier profile is required."));
            return;
        }

        var errors = new List<ApiError?>
        {
            Required(request.Profile.Status, nameof(request.Profile.Status), "Profile status is required."),
            NonNegative(request.Profile.QualityRating, nameof(request.Profile.QualityRating), "Quality rating cannot be negative."),
            request.Profile.LeadTimeReviewDays.HasValue && request.Profile.LeadTimeReviewDays.Value < 0 ? new ApiError("validation.out_of_range", nameof(request.Profile.LeadTimeReviewDays), "Lead-time review days cannot be negative.") : null
        };

        foreach (var contact in request.ContactPoints ?? Array.Empty<SupplierContactPointUpsertRequest>())
        {
            errors.Add(Required(contact.ContactName, nameof(contact.ContactName), "Contact name is required."));
            errors.Add(Required(contact.ContactRole, nameof(contact.ContactRole), "Contact role is required."));
            errors.Add(Required(contact.Channel, nameof(contact.Channel), "Communication channel is required."));
            errors.Add(Required(contact.ContactValue, nameof(contact.ContactValue), "Contact value is required."));
            errors.Add(Required(contact.Status, nameof(contact.Status), "Contact status is required."));
        }

        foreach (var reference in request.VendorReferences ?? Array.Empty<SupplierVendorReferenceProfileUpsertRequest>())
        {
            errors.Add(Required(reference.VendorItemCode, nameof(reference.VendorItemCode), "Vendor item code is required."));
            errors.Add(Required(reference.ApprovalStatus, nameof(reference.ApprovalStatus), "Vendor reference approval status is required."));
            errors.Add(Required(reference.Status, nameof(reference.Status), "Vendor reference status is required."));
            errors.Add(NonNegative(reference.MinimumOrderQty, nameof(reference.MinimumOrderQty), "Minimum order quantity cannot be negative."));
            errors.Add(reference.LeadTimeDays.HasValue && reference.LeadTimeDays.Value < 0 ? new ApiError("validation.out_of_range", nameof(reference.LeadTimeDays), "Lead time cannot be negative.") : null);
        }

        foreach (var document in request.Documents ?? Array.Empty<SupplierDocumentUpsertRequest>())
        {
            errors.Add(Required(document.DocumentType, nameof(document.DocumentType), "Document type is required."));
            errors.Add(Required(document.Title, nameof(document.Title), "Document title is required."));
            errors.Add(Required(document.ApprovalStatus, nameof(document.ApprovalStatus), "Document approval status is required."));
            errors.Add(Required(document.VisibilityScope, nameof(document.VisibilityScope), "Document visibility is required."));
            errors.Add(Required(document.Status, nameof(document.Status), "Document status is required."));
            errors.Add(document.EffectiveTo.HasValue && document.EffectiveFrom.HasValue && document.EffectiveTo.Value < document.EffectiveFrom.Value ? new ApiError("validation.invalid_range", nameof(document.EffectiveTo), "Document effective-to date cannot be before effective-from date.") : null);
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateOperation(OperationUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.OperationCode, nameof(request.OperationCode), "Operation code is required."),
            Required(request.OperationName, nameof(request.OperationName), "Operation name is required."),
            Required(request.OperationType, nameof(request.OperationType), "Operation type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.DefaultSetupMinutes, nameof(request.DefaultSetupMinutes), "Setup minutes cannot be negative."),
            NonNegative(request.DefaultRunMinutesPerUnit, nameof(request.DefaultRunMinutesPerUnit), "Run minutes cannot be negative."),
            NonNegative(request.DefaultTeardownMinutes, nameof(request.DefaultTeardownMinutes), "Teardown minutes cannot be negative."));

    private static void ValidateWorkCenter(WorkCenterUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Required(request.WorkCenterCode, nameof(request.WorkCenterCode), "Work-center code is required."),
            Required(request.WorkCenterName, nameof(request.WorkCenterName), "Work-center name is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            request.ParallelCapacityUnits < 0 ? new ApiError("validation.out_of_range", nameof(request.ParallelCapacityUnits), "Parallel capacity cannot be negative.") : null);

    private static void ValidateMachine(MachineUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.BranchId, nameof(request.BranchId), "Branch is required."),
            Positive(request.WorkCenterId, nameof(request.WorkCenterId), "Work center is required."),
            Required(request.MachineCode, nameof(request.MachineCode), "Machine code is required."),
            Required(request.MachineName, nameof(request.MachineName), "Machine name is required."),
            Required(request.CurrentStatus, nameof(request.CurrentStatus), "Current status is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.CapacityPerHour, nameof(request.CapacityPerHour), "Capacity per hour cannot be negative."));

    private static void ValidateTool(ToolUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Required(request.ToolCode, nameof(request.ToolCode), "Tool code is required."),
            Required(request.ToolName, nameof(request.ToolName), "Tool name is required."),
            Required(request.ToolType, nameof(request.ToolType), "Tool type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static CustomerDto MapCustomer(Customer entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.CustomerCode, entity.CustomerName, entity.ShortName, entity.CustomerType, entity.DefaultBranchId, entity.DefaultLanguageId, entity.TaxRegistrationNo, entity.PaymentTermsCode, entity.CreditDays, entity.Status);

    private static CustomerAddressDto MapCustomerAddress(CustomerAddress entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.CustomerId, entity.AddressCode, entity.AddressType, entity.AddressLine1, entity.AddressLine2, entity.City, entity.StateOrProvince, entity.PostalCode, entity.CountryCode, entity.ContactName, entity.ContactEmail, entity.ContactPhone, entity.IsDefaultBilling, entity.IsDefaultShipping, entity.Status);

    private static SupplierDto MapSupplier(Supplier entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.SupplierCode, entity.SupplierName, entity.SupplierType, entity.SupportsSubcontracting, entity.DefaultBranchId, entity.DefaultLanguageId, entity.TaxRegistrationNo, entity.PaymentTermsCode, entity.Status);

    private static SupplierAddressDto MapSupplierAddress(SupplierAddress entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.SupplierId, entity.AddressCode, entity.AddressType, entity.AddressLine1, entity.City, entity.StateOrProvince, entity.PostalCode, entity.CountryCode, entity.ContactName, entity.ContactEmail, entity.ContactPhone, entity.IsDefaultOrderAddress, entity.Status);

    private static SupplierLeadTimeDto MapSupplierLeadTime(SupplierLeadTime entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.SupplierId, entity.BranchId, entity.ItemId, entity.ItemGroupId, entity.LeadTimeDays, entity.MinOrderQty, entity.OrderMultipleQty, entity.IsSubcontractLeadTime, entity.PriorityRank, entity.Status);

    private static CustomerPartnerProfileDto MapCustomerPartnerProfile(Customer customer, CustomerPartnerProfile? profile) =>
        profile is null
            ? new CustomerPartnerProfileDto(
                0,
                customer.CompanyId ?? 0,
                customer.Id,
                customer.CustomerName,
                string.IsNullOrWhiteSpace(customer.TaxRegistrationNo) ? "Pending" : "Registered GST",
                "INR",
                customer.Status == "On Hold" ? "On hold" : "Clear",
                null,
                customer.Status == "On Hold" ? "Manager review" : "Standard release",
                customer.PaymentTermsCode,
                customer.CustomerType == "Export" ? "Strategic" : "Standard",
                "Standard",
                "Standard dispatch",
                null,
                customer.CustomerType == "Export",
                customer.CustomerType == "Export" ? "Export catalog" : "Standard catalog",
                customer.Status)
            : new CustomerPartnerProfileDto(profile.Id, profile.CompanyId ?? 0, profile.CustomerId, profile.LegalName, profile.TaxCategory, profile.CurrencyCode, profile.CreditStatus, profile.CreditLimitAmount, profile.CreditHoldRule, profile.PaymentTermsCode, profile.CommercialSegment, profile.OrderReleaseControl, profile.DispatchPreference, profile.DispatchInstruction, profile.CatalogVisible, profile.CatalogSegment, profile.Status);

    private static CustomerContactPointDto MapCustomerContactPoint(CustomerContactPoint entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.CustomerId, entity.CustomerAddressId, entity.ContactName, entity.ContactRole, entity.Channel, entity.ContactValue, entity.IsPrimary, entity.ConsentStatus, entity.EscalationLevel, entity.Status);

    private static CustomerItemReferenceProfileDto MapCustomerItemReferenceProfile(CustomerItemReferenceProfile entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.CustomerId, entity.ItemId, entity.CustomerItemCode, entity.DrawingNo, entity.RevisionCode, entity.PackagingOverride, entity.SpecificationOverride, entity.ApprovalStatus, entity.Status);

    private static CustomerDocumentDto MapCustomerDocument(CustomerDocument entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.CustomerId, entity.DocumentType, entity.Title, entity.DocumentNo, entity.RevisionCode, entity.FileName, entity.StorageUri, entity.ApprovalStatus, entity.VisibilityScope, entity.EffectiveFrom, entity.EffectiveTo, entity.ExpiresOn, entity.Status);

    private static SupplierPartnerProfileDto MapSupplierPartnerProfile(Supplier supplier, SupplierPartnerProfile? profile) =>
        profile is null
            ? new SupplierPartnerProfileDto(
                0,
                supplier.CompanyId ?? 0,
                supplier.Id,
                supplier.SupplierName,
                string.IsNullOrWhiteSpace(supplier.TaxRegistrationNo) ? "Pending" : "Registered GST",
                "INR",
                supplier.PaymentTermsCode,
                supplier.SupportsSubcontracting ? "Preferred" : "Standard",
                string.IsNullOrWhiteSpace(supplier.TaxRegistrationNo) ? "Pending" : "Approved",
                supplier.SupportsSubcontracting ? "Subcontract capable" : supplier.SupplierType,
                null,
                string.IsNullOrWhiteSpace(supplier.TaxRegistrationNo) ? "Compliance review" : "Standard",
                null,
                supplier.Status)
            : new SupplierPartnerProfileDto(profile.Id, profile.CompanyId ?? 0, profile.SupplierId, profile.LegalName, profile.TaxCategory, profile.CurrencyCode, profile.PaymentTermsCode, profile.PreferredStatus, profile.ComplianceStatus, profile.CapabilitySummary, profile.QualityRating, profile.ProcurementReleaseControl, profile.LeadTimeReviewDays, profile.Status);

    private static SupplierContactPointDto MapSupplierContactPoint(SupplierContactPoint entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.SupplierId, entity.SupplierAddressId, entity.ContactName, entity.ContactRole, entity.Channel, entity.ContactValue, entity.IsPrimary, entity.ConsentStatus, entity.EscalationLevel, entity.Status);

    private static SupplierVendorReferenceProfileDto MapSupplierVendorReferenceProfile(SupplierVendorReferenceProfile entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.SupplierId, entity.ItemId, entity.VendorItemCode, entity.MinimumOrderQty, entity.LeadTimeDays, entity.PurchaseUomId, entity.ComplianceStatus, entity.DocumentStatus, entity.ApprovalStatus, entity.Status);

    private static SupplierDocumentDto MapSupplierDocument(SupplierDocument entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.SupplierId, entity.DocumentType, entity.Title, entity.DocumentNo, entity.RevisionCode, entity.FileName, entity.StorageUri, entity.ApprovalStatus, entity.VisibilityScope, entity.EffectiveFrom, entity.EffectiveTo, entity.ExpiresOn, entity.Status);

    private static OperationDto MapOperation(Operation entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.OperationCode, entity.OperationName, entity.OperationType, entity.DefaultWorkCenterId, entity.DefaultSetupMinutes, entity.DefaultRunMinutesPerUnit, entity.DefaultTeardownMinutes, entity.AllowsOverlap, entity.IsOutsideProcessing, entity.RequiresQcCheckpoint, entity.Status);

    private static WorkCenterDto MapWorkCenter(WorkCenter entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.WorkCenterCode, entity.WorkCenterName, entity.DepartmentId, entity.CapacityUomId, entity.DefaultShiftPatternCode, entity.ParallelCapacityUnits, entity.Status);

    private static MachineDto MapMachine(Machine entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId ?? 0, entity.WorkCenterId, entity.MachineCode, entity.MachineName, entity.CapacityPerHour, entity.CurrentStatus, entity.DefaultShiftId, entity.IsUnderMaintenance, entity.IsSchedulingEnabled, entity.Status);

    private static ToolDto MapTool(Tool entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.BranchId, entity.ToolCode, entity.ToolName, entity.ToolType, entity.CompatibleMachineGroup, entity.Status);
}
