using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Masters;
using STS.Mfg.Application.Contracts.Resources;

namespace STS.Mfg.Application.Abstractions.Resources;

public interface IResourceService
{
    Task<PagedResult<CustomerDto>> ListCustomersAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<CustomerDto> CreateCustomerAsync(CustomerUpsertRequest request, CancellationToken cancellationToken = default);
    Task<CustomerDto> UpdateCustomerAsync(long id, CustomerUpsertRequest request, CancellationToken cancellationToken = default);
    Task<CustomerPartnerWorkspaceDto> GetCustomerPartnerWorkspaceAsync(long customerId, CancellationToken cancellationToken = default);
    Task<CustomerPartnerWorkspaceDto> UpdateCustomerPartnerWorkspaceAsync(long customerId, CustomerPartnerProfileUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<CustomerAddressDto>> ListCustomerAddressesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<CustomerAddressDto> CreateCustomerAddressAsync(CustomerAddressUpsertRequest request, CancellationToken cancellationToken = default);
    Task<CustomerAddressDto> UpdateCustomerAddressAsync(long id, CustomerAddressUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<SupplierDto>> ListSuppliersAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<SupplierDto> CreateSupplierAsync(SupplierUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SupplierDto> UpdateSupplierAsync(long id, SupplierUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SupplierPartnerWorkspaceDto> GetSupplierPartnerWorkspaceAsync(long supplierId, CancellationToken cancellationToken = default);
    Task<SupplierPartnerWorkspaceDto> UpdateSupplierPartnerWorkspaceAsync(long supplierId, SupplierPartnerProfileUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<SupplierAddressDto>> ListSupplierAddressesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<SupplierAddressDto> CreateSupplierAddressAsync(SupplierAddressUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SupplierAddressDto> UpdateSupplierAddressAsync(long id, SupplierAddressUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<SupplierLeadTimeDto>> ListSupplierLeadTimesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<SupplierLeadTimeDto> CreateSupplierLeadTimeAsync(SupplierLeadTimeUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SupplierLeadTimeDto> UpdateSupplierLeadTimeAsync(long id, SupplierLeadTimeUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<OperationDto>> ListOperationsAsync(ResourceFilter filter, CancellationToken cancellationToken = default);
    Task<OperationDto> CreateOperationAsync(OperationUpsertRequest request, CancellationToken cancellationToken = default);
    Task<OperationDto> UpdateOperationAsync(long id, OperationUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<WorkCenterDto>> ListWorkCentersAsync(ResourceFilter filter, CancellationToken cancellationToken = default);
    Task<WorkCenterDto> CreateWorkCenterAsync(WorkCenterUpsertRequest request, CancellationToken cancellationToken = default);
    Task<WorkCenterDto> UpdateWorkCenterAsync(long id, WorkCenterUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<MachineDto>> ListMachinesAsync(ResourceFilter filter, CancellationToken cancellationToken = default);
    Task<MachineDto> CreateMachineAsync(MachineUpsertRequest request, CancellationToken cancellationToken = default);
    Task<MachineDto> UpdateMachineAsync(long id, MachineUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<ToolDto>> ListToolsAsync(ResourceFilter filter, CancellationToken cancellationToken = default);
    Task<ToolDto> CreateToolAsync(ToolUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ToolDto> UpdateToolAsync(long id, ToolUpsertRequest request, CancellationToken cancellationToken = default);
}
