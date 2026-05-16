using STS.Mfg.Application.Contracts.SalesPlanning;

namespace STS.Mfg.Application.Abstractions.SalesPlanning;

public interface ICustomerCommercialDefaultsService
{
    Task<CustomerCommercialDefaultsDto> ResolveAsync(
        CustomerCommercialDefaultsRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<SalesTerritoryDto>> ListSalesTerritoriesAsync(
        long companyId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<SalesTeamDto>> ListSalesTeamsAsync(
        long companyId,
        CancellationToken cancellationToken = default);
}
