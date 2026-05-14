using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;

namespace STS.Mfg.Application.Abstractions.Inventory;

public interface IInventoryService
{
    Task<PagedResult<StockBalanceDto>> ListStockBalancesAsync(InventoryFilter filter, CancellationToken cancellationToken = default);
    Task<PagedResult<StockTransactionDto>> ListStockTransactionsAsync(InventoryFilter filter, CancellationToken cancellationToken = default);
    Task<PagedResult<StockReservationDto>> ListStockReservationsAsync(InventoryFilter filter, CancellationToken cancellationToken = default);
    Task<StockReservationDto> ReserveStockAsync(StockReservationRequest request, CancellationToken cancellationToken = default);
    Task<ActionResponse> ReleaseStockReservationAsync(long id, StockReservationReleaseRequest? request, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<StockTransactionDto>> IssueStockAsync(StockIssueRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<StockTransactionDto>> ReturnStockAsync(StockReturnRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<StockTransactionDto>> TransferStockAsync(StockTransferRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<CycleCountDto>> ListCycleCountsAsync(CycleCountFilter filter, CancellationToken cancellationToken = default);
    Task<CycleCountDto> GetCycleCountAsync(long id, CancellationToken cancellationToken = default);
    Task<CycleCountDto> CreateCycleCountAsync(CycleCountUpsertRequest request, CancellationToken cancellationToken = default);
    Task<CycleCountDto> UpdateCycleCountAsync(long id, CycleCountUpsertRequest request, CancellationToken cancellationToken = default);
    Task<CycleCountDto> PostCycleCountAsync(long id, CancellationToken cancellationToken = default);

    Task<LotTraceabilityDto> GetLotTraceabilityAsync(string lotNo, TraceabilityFilter filter, CancellationToken cancellationToken = default);
    Task<SerialTraceabilityDto> GetSerialTraceabilityAsync(string serialNo, TraceabilityFilter filter, CancellationToken cancellationToken = default);
}
