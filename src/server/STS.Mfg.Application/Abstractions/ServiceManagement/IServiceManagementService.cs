using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.ServiceManagement;

namespace STS.Mfg.Application.Abstractions.ServiceManagement;

public interface IServiceManagementService
{
    Task<ServiceDashboardDto> GetDashboardAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default);

    Task<PagedResult<InstalledAssetDto>> ListInstalledAssetsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default);

    Task<InstalledAssetDto> GetInstalledAssetAsync(long id, CancellationToken cancellationToken = default);

    Task<InstalledAssetDto> CreateInstalledAssetAsync(InstalledAssetUpsertRequest request, CancellationToken cancellationToken = default);

    Task<InstalledAssetDto> UpdateInstalledAssetAsync(long id, InstalledAssetUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<WarrantyPolicyDto>> ListWarrantyPoliciesAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default);

    Task<WarrantyPolicyDto> CreateWarrantyPolicyAsync(WarrantyPolicyUpsertRequest request, CancellationToken cancellationToken = default);

    Task<WarrantyPolicyDto> UpdateWarrantyPolicyAsync(long id, WarrantyPolicyUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ServiceContractDto>> ListServiceContractsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default);

    Task<ServiceContractDto> CreateServiceContractAsync(ServiceContractUpsertRequest request, CancellationToken cancellationToken = default);

    Task<ServiceContractDto> UpdateServiceContractAsync(long id, ServiceContractUpsertRequest request, CancellationToken cancellationToken = default);

    Task<ServiceEntitlementDto> ResolveEntitlementAsync(long? installedAssetId, long? customerId, long? itemId, DateOnly? asOfDate, CancellationToken cancellationToken = default);

    Task<PagedResult<ServiceTicketDto>> ListServiceTicketsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default);

    Task<ServiceTicketDto> GetServiceTicketAsync(long id, CancellationToken cancellationToken = default);

    Task<ServiceTicketDto> CreateServiceTicketAsync(ServiceTicketUpsertRequest request, CancellationToken cancellationToken = default);

    Task<ServiceTicketDto> UpdateServiceTicketAsync(long id, ServiceTicketUpsertRequest request, CancellationToken cancellationToken = default);

    Task<ServiceTicketDto> AssignServiceTicketAsync(long id, ServiceTicketAssignmentRequest request, CancellationToken cancellationToken = default);

    Task<ServiceTicketDto> ChangeServiceTicketStatusAsync(long id, ServiceTicketStatusRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ServiceVisitDto>> ListServiceVisitsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default);

    Task<ServiceVisitDto> CreateServiceVisitAsync(ServiceVisitUpsertRequest request, CancellationToken cancellationToken = default);

    Task<ServiceVisitDto> UpdateServiceVisitAsync(long id, ServiceVisitUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ServiceSpareMovementDto>> ListServiceSpareMovementsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default);

    Task<ServiceSparePostResultDto> IssueServiceSpareAsync(ServiceSpareMovementRequest request, CancellationToken cancellationToken = default);

    Task<ServiceSparePostResultDto> ReturnServiceSpareAsync(ServiceSpareMovementRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<WarrantyClaimDto>> ListWarrantyClaimsAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default);

    Task<WarrantyClaimDto> CreateWarrantyClaimAsync(WarrantyClaimUpsertRequest request, CancellationToken cancellationToken = default);

    Task<WarrantyClaimDto> DecideWarrantyClaimAsync(long id, WarrantyClaimDecisionRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ServiceChargeDto>> ListServiceChargesAsync(ServiceManagementFilter filter, CancellationToken cancellationToken = default);

    Task<ServiceChargeDto> CreateServiceChargeAsync(ServiceChargeUpsertRequest request, CancellationToken cancellationToken = default);

    Task<ServiceChargeDto> MarkServiceChargeInvoiceReadyAsync(long id, CancellationToken cancellationToken = default);
}
