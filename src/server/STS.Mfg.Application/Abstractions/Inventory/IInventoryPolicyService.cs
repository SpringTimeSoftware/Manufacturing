using STS.Mfg.Application.Contracts.Inventory;

namespace STS.Mfg.Application.Abstractions.Inventory;

public interface IInventoryPolicyService
{
    Task<InventoryTrackingPolicyDto> ResolveRequiredTrackingAsync(InventoryTrackingPolicyRequest request, CancellationToken cancellationToken = default);

    Task<InventoryAvailableStockDto> GetAvailableQuantityAsync(InventoryAvailableStockRequest request, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<InventoryDimensionOptionDto>> ListValidBinsAsync(InventoryDimensionQuery query, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<InventoryDimensionOptionDto>> ListValidLotsAsync(InventoryDimensionQuery query, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<InventoryDimensionOptionDto>> ListValidSerialsAsync(InventoryDimensionQuery query, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<InventoryDimensionOptionDto>> ListValidPcidsAsync(InventoryDimensionQuery query, CancellationToken cancellationToken = default);

    Task<StockMovementValidationResultDto> ValidateMovementAsync(StockMovementValidationRequest request, CancellationToken cancellationToken = default);
}
