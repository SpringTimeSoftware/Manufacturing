using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Application.Abstractions.Production;

public interface IProductionOutputService
{
    Task<PagedResult<ProductionReceiptSummaryDto>> ListProductionReceiptsAsync(ProductionReceiptFilter filter, CancellationToken cancellationToken = default);
    Task<ProductionReceiptDto> GetProductionReceiptAsync(long id, CancellationToken cancellationToken = default);
    Task<ProductionReceiptDto> CreateProductionReceiptAsync(ProductionReceiptCreateRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ScrapEntryDto>> ListScrapEntriesAsync(ScrapEntryFilter filter, CancellationToken cancellationToken = default);
    Task<ScrapEntryDto> CreateScrapEntryAsync(ScrapEntryCreateRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ReworkOrderDto>> ListReworkOrdersAsync(ReworkOrderFilter filter, CancellationToken cancellationToken = default);
    Task<ReworkOrderDto> GetReworkOrderAsync(long id, CancellationToken cancellationToken = default);
    Task<ReworkOrderDto> CreateReworkOrderAsync(ReworkOrderCreateRequest request, CancellationToken cancellationToken = default);
    Task<ActionResponse> ReleaseReworkOrderAsync(long id, ReworkOrderActionRequest? request, CancellationToken cancellationToken = default);
    Task<ActionResponse> CompleteReworkOrderAsync(long id, ReworkOrderActionRequest? request, CancellationToken cancellationToken = default);
}
