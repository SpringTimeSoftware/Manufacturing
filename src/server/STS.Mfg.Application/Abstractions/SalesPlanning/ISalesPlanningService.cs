using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.SalesPlanning;

namespace STS.Mfg.Application.Abstractions.SalesPlanning;

public interface ISalesPlanningService
{
    Task<PagedResult<QuoteDto>> ListQuotesAsync(SalesFilter filter, CancellationToken cancellationToken = default);
    Task<QuoteDto> GetQuoteAsync(long id, CancellationToken cancellationToken = default);
    Task<QuoteDto> CreateQuoteAsync(QuoteUpsertRequest request, CancellationToken cancellationToken = default);
    Task<QuoteDto> UpdateQuoteAsync(long id, QuoteUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<SalesOrderDto>> ListSalesOrdersAsync(SalesFilter filter, CancellationToken cancellationToken = default);
    Task<SalesOrderDto> GetSalesOrderAsync(long id, CancellationToken cancellationToken = default);
    Task<SalesOrderDto> CreateSalesOrderAsync(SalesOrderUpsertRequest request, CancellationToken cancellationToken = default);
    Task<SalesOrderDto> UpdateSalesOrderAsync(long id, SalesOrderUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<BlanketOrderDto>> ListBlanketOrdersAsync(SalesFilter filter, CancellationToken cancellationToken = default);
    Task<BlanketOrderDto> GetBlanketOrderAsync(long id, CancellationToken cancellationToken = default);
    Task<BlanketOrderDto> CreateBlanketOrderAsync(BlanketOrderUpsertRequest request, CancellationToken cancellationToken = default);
    Task<BlanketOrderDto> UpdateBlanketOrderAsync(long id, BlanketOrderUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<DemandForecastDto>> ListDemandForecastsAsync(SalesFilter filter, CancellationToken cancellationToken = default);
    Task<DemandForecastDto> GetDemandForecastAsync(long id, CancellationToken cancellationToken = default);
    Task<DemandForecastDto> CreateDemandForecastAsync(DemandForecastUpsertRequest request, CancellationToken cancellationToken = default);
    Task<DemandForecastDto> UpdateDemandForecastAsync(long id, DemandForecastUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<MasterProductionScheduleDto>> ListMpsAsync(SalesFilter filter, CancellationToken cancellationToken = default);
    Task<MasterProductionScheduleDto> GetMpsAsync(long id, CancellationToken cancellationToken = default);
    Task<MasterProductionScheduleDto> CreateMpsAsync(MasterProductionScheduleUpsertRequest request, CancellationToken cancellationToken = default);
    Task<MasterProductionScheduleDto> UpdateMpsAsync(long id, MasterProductionScheduleUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<MrpRunDto>> ListMrpRunsAsync(SalesFilter filter, CancellationToken cancellationToken = default);
    Task<MrpRunDto> GetMrpRunAsync(long id, CancellationToken cancellationToken = default);
    Task<MrpRunDto> StartMrpRunAsync(MrpRunStartRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<BoqRequirementDto>> ListBoqRequirementsAsync(SalesFilter filter, CancellationToken cancellationToken = default);
    Task<BoqRequirementDto> GetBoqRequirementAsync(long id, CancellationToken cancellationToken = default);
    Task<BoqRequirementDto> CreateBoqRequirementAsync(BoqRequirementUpsertRequest request, CancellationToken cancellationToken = default);
    Task<BoqRequirementDto> UpdateBoqRequirementAsync(long id, BoqRequirementUpsertRequest request, CancellationToken cancellationToken = default);
    Task<BoqRequirementLineDto> ApproveBoqLineAsync(long boqRequirementId, long lineId, BoqLineActionRequest request, CancellationToken cancellationToken = default);
    Task<BoqRequirementLineDto> ConvertBoqLineAsync(long boqRequirementId, long lineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<BoqRequirementLineDto>> ConvertReviewedBoqLinesAsync(long boqRequirementId, CancellationToken cancellationToken = default);
}
