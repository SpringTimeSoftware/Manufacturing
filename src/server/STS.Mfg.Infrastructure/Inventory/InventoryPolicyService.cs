using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Inventory;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Inventory;

internal sealed class InventoryPolicyService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IInventoryPolicyService
{
    public async Task<InventoryTrackingPolicyDto> ResolveRequiredTrackingAsync(
        InventoryTrackingPolicyRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureContextAccess(request.CompanyId, request.BranchId);
        if (request.WarehouseId.HasValue)
        {
            EnsureWarehouseAccess(request.WarehouseId.Value);
        }

        var scope = GetScope();
        var item = await DbContext.Items.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == request.ItemId && record.CompanyId == request.CompanyId, cancellationToken);

        item = EnsureFound(item, "Item was not found in the active scope.", "master.item_not_found");

        Warehouse? warehouse = null;
        if (request.WarehouseId.HasValue)
        {
            warehouse = await DbContext.Warehouses.AsNoTracking()
                .FirstOrDefaultAsync(record =>
                    record.Id == request.WarehouseId.Value &&
                    record.CompanyId == request.CompanyId &&
                    record.BranchId == request.BranchId,
                    cancellationToken);

            warehouse = EnsureFound(warehouse, "Warehouse was not found in the active scope.", "inventory.warehouse_not_found");
        }

        var policy = await DbContext.ItemInventoryPolicies.AsNoTracking()
            .FirstOrDefaultAsync(record =>
                record.CompanyId == request.CompanyId &&
                record.ItemId == request.ItemId &&
                record.Status == "Active",
                cancellationToken);

        var hasActiveBins = request.WarehouseId.HasValue && await DbContext.Bins.AsNoTracking().AnyAsync(
            record =>
                record.CompanyId == request.CompanyId &&
                record.BranchId == request.BranchId &&
                record.WarehouseId == request.WarehouseId.Value &&
                record.Status == "Active",
            cancellationToken);

        var isStockControlled = policy?.IsStockControlled ?? true;
        var requiresBin = isStockControlled && (policy?.RequiresBin == true || policy?.DefaultBinId.HasValue == true || hasActiveBins);
        var requiresLot = isStockControlled && (IsTrackingEnabled(policy?.LotTrackingMode) || item.IsBatchExpiryTracked || ContainsAny(item.TraceabilityMode, "lot", "batch"));
        var requiresSerial = isStockControlled && (IsTrackingEnabled(policy?.SerialTrackingMode) || ContainsAny(item.TraceabilityMode, "serial"));
        var requiresPcid = isStockControlled && (policy?.IsPcidTracked == true || ContainsAny(item.TraceabilityMode, "pcid", "license", "plate"));
        var allowsNegativeStock = string.Equals(policy?.NegativeStockPolicy, "Allow", StringComparison.OrdinalIgnoreCase) &&
                                  warehouse?.AllowsNegativeStock == true;

        var required = new List<string>();
        if (requiresBin) required.Add("Bin");
        if (requiresLot) required.Add("Lot");
        if (requiresSerial) required.Add("Serial");
        if (requiresPcid) required.Add("PCID");

        var source = policy is not null
            ? "Item inventory policy"
            : hasActiveBins
                ? "Warehouse active-bin policy"
                : "Item defaults";

        return new InventoryTrackingPolicyDto(
            request.CompanyId,
            request.BranchId,
            request.ItemId,
            request.WarehouseId,
            isStockControlled,
            requiresBin,
            requiresLot,
            requiresSerial,
            requiresPcid,
            allowsNegativeStock,
            source,
            required);
    }

    public async Task<InventoryAvailableStockDto> GetAvailableQuantityAsync(
        InventoryAvailableStockRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureWarehouseAccess(request.WarehouseId);

        var balance = await LoadBalanceAsync(
            request.CompanyId,
            request.BranchId,
            request.ItemId,
            request.ItemVariantId,
            request.WarehouseId,
            request.BinId,
            request.LotId,
            request.SerialId,
            request.PcidId,
            cancellationToken);

        var blockedReason = balance is null
            ? "No balance exists for the requested tracking grain."
            : BuildBlockedReason(balance);

        return new InventoryAvailableStockDto(
            request.CompanyId,
            request.BranchId,
            request.ItemId,
            request.ItemVariantId,
            request.WarehouseId,
            request.BinId,
            request.LotId,
            request.SerialId,
            request.PcidId,
            NormalizeInventoryState(request.InventoryState),
            balance is null ? 0m : GetStateAvailableQuantity(balance, request.InventoryState),
            blockedReason);
    }

    public async Task<IReadOnlyCollection<InventoryDimensionOptionDto>> ListValidBinsAsync(InventoryDimensionQuery query, CancellationToken cancellationToken = default)
    {
        EnsureContextAccess(query.CompanyId, query.BranchId);
        if (query.WarehouseId.HasValue)
        {
            EnsureWarehouseAccess(query.WarehouseId.Value);
        }

        var bins = await DbContext.Bins.AsNoTracking()
            .Where(record =>
                record.CompanyId == query.CompanyId &&
                record.BranchId == query.BranchId &&
                (!query.WarehouseId.HasValue || record.WarehouseId == query.WarehouseId.Value))
            .OrderBy(record => record.BinCode)
            .Take(100)
            .ToListAsync(cancellationToken);

        return bins.Select(bin => new InventoryDimensionOptionDto(
            bin.Id,
            bin.BinCode,
            $"{bin.BinCode} - {bin.BinName}",
            bin.Status,
            null,
            BuildBinDisabledReason(bin))).ToArray();
    }

    public async Task<IReadOnlyCollection<InventoryDimensionOptionDto>> ListValidLotsAsync(InventoryDimensionQuery query, CancellationToken cancellationToken = default)
    {
        EnsureContextAccess(query.CompanyId, query.BranchId);
        var lots = await DbContext.Lots.AsNoTracking()
            .Where(record =>
                record.CompanyId == query.CompanyId &&
                (!query.ItemId.HasValue || record.ItemId == query.ItemId.Value))
            .OrderBy(record => record.LotNo)
            .Take(100)
            .ToListAsync(cancellationToken);

        return lots.Select(lot => new InventoryDimensionOptionDto(
            lot.Id,
            lot.LotNo,
            lot.LotNo,
            lot.LotStatus,
            null,
            IsBlockedStatus(lot.LotStatus) ? $"Lot status is {lot.LotStatus}." : null)).ToArray();
    }

    public async Task<IReadOnlyCollection<InventoryDimensionOptionDto>> ListValidSerialsAsync(InventoryDimensionQuery query, CancellationToken cancellationToken = default)
    {
        EnsureContextAccess(query.CompanyId, query.BranchId);
        var serials = await DbContext.Serials.AsNoTracking()
            .Where(record =>
                record.CompanyId == query.CompanyId &&
                (!query.ItemId.HasValue || record.ItemId == query.ItemId.Value) &&
                (!query.WarehouseId.HasValue || record.CurrentWarehouseId == query.WarehouseId.Value) &&
                (!query.BinId.HasValue || record.CurrentBinId == query.BinId.Value) &&
                (!query.LotId.HasValue || record.LotId == query.LotId.Value))
            .OrderBy(record => record.SerialNo)
            .Take(100)
            .ToListAsync(cancellationToken);

        return serials.Select(serial => new InventoryDimensionOptionDto(
            serial.Id,
            serial.SerialNo,
            serial.SerialNo,
            serial.SerialStatus,
            null,
            IsBlockedStatus(serial.SerialStatus) ? $"Serial status is {serial.SerialStatus}." : null)).ToArray();
    }

    public async Task<IReadOnlyCollection<InventoryDimensionOptionDto>> ListValidPcidsAsync(InventoryDimensionQuery query, CancellationToken cancellationToken = default)
    {
        EnsureContextAccess(query.CompanyId, query.BranchId);
        var pcids = await DbContext.InventoryLicensePlates.AsNoTracking()
            .Where(record =>
                record.CompanyId == query.CompanyId &&
                record.BranchId == query.BranchId &&
                (!query.WarehouseId.HasValue || record.WarehouseId == query.WarehouseId.Value) &&
                (!query.BinId.HasValue || record.BinId == query.BinId.Value))
            .OrderBy(record => record.PcidNo)
            .Take(100)
            .ToListAsync(cancellationToken);

        return pcids.Select(pcid => new InventoryDimensionOptionDto(
            pcid.Id,
            pcid.PcidNo,
            $"{pcid.PcidNo} ({pcid.LicensePlateType})",
            pcid.Status,
            null,
            IsBlockedStatus(pcid.Status) ? $"PCID status is {pcid.Status}." : null)).ToArray();
    }

    public async Task<StockMovementValidationResultDto> ValidateMovementAsync(
        StockMovementValidationRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var lineResults = new List<StockMovementValidationLineResultDto>();
        var allErrors = new List<ApiError>();

        foreach (var line in request.Lines.OrderBy(record => record.LineNo))
        {
            var errors = new List<ApiError>();
            var policyWarehouseId = ResolvePolicyWarehouseId(line);
            var policy = await ResolveRequiredTrackingAsync(
                new InventoryTrackingPolicyRequest(request.CompanyId, request.BranchId, line.ItemId, policyWarehouseId, line.MovementType),
                cancellationToken);

            if (line.Quantity <= 0)
            {
                errors.Add(new ApiError("validation.out_of_range", $"lines[{line.LineNo}].quantity", "Movement quantity must be greater than zero."));
            }

            await ValidateBinAsync(request, line, policy, errors, cancellationToken);
            await ValidateLotAsync(request, line, policy, errors, cancellationToken);
            await ValidateSerialAsync(request, line, policy, errors, cancellationToken);
            await ValidatePcidAsync(request, line, policy, errors, cancellationToken);
            ValidateStockState(line, errors);
            await ValidateRevisionSnapshotReferencesAsync(line, errors, cancellationToken);

            decimal? availableQuantity = null;
            if (IsOutgoingMovement(line.MovementType) && line.FromWarehouseId.HasValue)
            {
                var available = await GetAvailableQuantityAsync(
                    new InventoryAvailableStockRequest(
                        request.CompanyId,
                        request.BranchId,
                        line.ItemId,
                        line.ItemVariantId,
                        line.FromWarehouseId.Value,
                        line.FromBinId,
                        line.LotId,
                        line.SerialId,
                        line.PcidId,
                        line.InventoryState),
                    cancellationToken);

                availableQuantity = available.AvailableQuantity;
                if (!policy.AllowsNegativeStock && available.AvailableQuantity < line.Quantity)
                {
                    errors.Add(new ApiError("inventory.insufficient_qty", $"lines[{line.LineNo}].quantity", "Insufficient available quantity exists at the requested tracking grain."));
                }
            }

            allErrors.AddRange(errors);
            lineResults.Add(new StockMovementValidationLineResultDto(line.LineNo, errors.Count == 0, policy, availableQuantity, errors));
        }

        return new StockMovementValidationResultDto(allErrors.Count == 0, lineResults, allErrors);
    }

    private async Task ValidateBinAsync(
        StockMovementValidationRequest request,
        StockMovementValidationLineRequest line,
        InventoryTrackingPolicyDto policy,
        List<ApiError> errors,
        CancellationToken cancellationToken)
    {
        if (policy.RequiresBin && IsOutgoingMovement(line.MovementType) && !line.FromBinId.HasValue)
        {
            errors.Add(new ApiError("inventory.bin_required", $"lines[{line.LineNo}].fromBinId", "A source bin is required by item or warehouse policy."));
        }

        if (policy.RequiresBin && IsInboundMovement(line.MovementType) && !line.ToBinId.HasValue)
        {
            errors.Add(new ApiError("inventory.bin_required", $"lines[{line.LineNo}].toBinId", "A destination bin is required by item or warehouse policy."));
        }

        if (line.FromBinId.HasValue && line.FromWarehouseId.HasValue)
        {
            await ValidateSingleBinAsync(request.CompanyId, request.BranchId, line.FromWarehouseId.Value, line.FromBinId.Value, $"lines[{line.LineNo}].fromBinId", errors, cancellationToken);
        }

        if (line.ToBinId.HasValue && line.ToWarehouseId.HasValue)
        {
            await ValidateSingleBinAsync(request.CompanyId, request.BranchId, line.ToWarehouseId.Value, line.ToBinId.Value, $"lines[{line.LineNo}].toBinId", errors, cancellationToken);
        }
    }

    private async Task ValidateSingleBinAsync(
        long companyId,
        long branchId,
        long warehouseId,
        long binId,
        string field,
        List<ApiError> errors,
        CancellationToken cancellationToken)
    {
        var bin = await DbContext.Bins.AsNoTracking().FirstOrDefaultAsync(
            record =>
                record.Id == binId &&
                record.CompanyId == companyId &&
                record.BranchId == branchId &&
                record.WarehouseId == warehouseId,
            cancellationToken);

        if (bin is null)
        {
            errors.Add(new ApiError("inventory.bin_not_found", field, "Bin was not found for the selected warehouse."));
            return;
        }

        var disabledReason = BuildBinDisabledReason(bin);
        if (disabledReason is not null)
        {
            errors.Add(new ApiError("inventory.bin_unavailable", field, disabledReason));
        }
    }

    private async Task ValidateLotAsync(
        StockMovementValidationRequest request,
        StockMovementValidationLineRequest line,
        InventoryTrackingPolicyDto policy,
        List<ApiError> errors,
        CancellationToken cancellationToken)
    {
        if (policy.RequiresLot && !line.LotId.HasValue)
        {
            errors.Add(new ApiError("inventory.lot_required", $"lines[{line.LineNo}].lotId", "Lot or batch is required by item policy."));
            return;
        }

        if (!line.LotId.HasValue)
        {
            return;
        }

        var lot = await DbContext.Lots.AsNoTracking().FirstOrDefaultAsync(
            record => record.Id == line.LotId.Value && record.CompanyId == request.CompanyId,
            cancellationToken);

        if (lot is null || lot.ItemId != line.ItemId)
        {
            errors.Add(new ApiError("inventory.lot_not_found", $"lines[{line.LineNo}].lotId", "Lot was not found for the selected item."));
            return;
        }

        if (IsBlockedStatus(lot.LotStatus) || (lot.ExpiryOn.HasValue && lot.ExpiryOn.Value < request.PostingDate))
        {
            errors.Add(new ApiError("inventory.lot_unavailable", $"lines[{line.LineNo}].lotId", "Expired, blocked, rejected, or quality-held lots cannot be used for this stock movement."));
        }
    }

    private async Task ValidateSerialAsync(
        StockMovementValidationRequest request,
        StockMovementValidationLineRequest line,
        InventoryTrackingPolicyDto policy,
        List<ApiError> errors,
        CancellationToken cancellationToken)
    {
        if (policy.RequiresSerial && !line.SerialId.HasValue)
        {
            errors.Add(new ApiError("inventory.serial_required", $"lines[{line.LineNo}].serialId", "Serial number is required by item policy."));
            return;
        }

        if (policy.RequiresSerial && line.Quantity != 1m)
        {
            errors.Add(new ApiError("inventory.serial_qty_mismatch", $"lines[{line.LineNo}].quantity", "Serial-tracked movements must post one serial per movement line."));
        }

        if (!line.SerialId.HasValue)
        {
            return;
        }

        var serial = await DbContext.Serials.AsNoTracking().FirstOrDefaultAsync(
            record => record.Id == line.SerialId.Value && record.CompanyId == request.CompanyId,
            cancellationToken);

        if (serial is null || serial.ItemId != line.ItemId)
        {
            errors.Add(new ApiError("inventory.serial_not_found", $"lines[{line.LineNo}].serialId", "Serial was not found for the selected item."));
            return;
        }

        if (line.LotId.HasValue && serial.LotId.HasValue && serial.LotId != line.LotId)
        {
            errors.Add(new ApiError("validation.mismatch", $"lines[{line.LineNo}].serialId", "Serial does not belong to the selected lot."));
        }

        if (IsBlockedStatus(serial.SerialStatus))
        {
            errors.Add(new ApiError("inventory.serial_unavailable", $"lines[{line.LineNo}].serialId", "Blocked, quality-held, shipped, or closed serials cannot be used for this stock movement."));
        }

        if (IsOutgoingMovement(line.MovementType) &&
            (serial.CurrentWarehouseId != line.FromWarehouseId || serial.CurrentBinId != line.FromBinId))
        {
            errors.Add(new ApiError("inventory.serial_location_mismatch", $"lines[{line.LineNo}].serialId", "Serial is not available in the selected source warehouse/bin."));
        }
    }

    private async Task ValidatePcidAsync(
        StockMovementValidationRequest request,
        StockMovementValidationLineRequest line,
        InventoryTrackingPolicyDto policy,
        List<ApiError> errors,
        CancellationToken cancellationToken)
    {
        if (policy.RequiresPcid && !line.PcidId.HasValue)
        {
            errors.Add(new ApiError("inventory.pcid_required", $"lines[{line.LineNo}].pcidId", "PCID or license plate is required by item policy."));
            return;
        }

        if (!line.PcidId.HasValue)
        {
            return;
        }

        var pcid = await DbContext.InventoryLicensePlates.AsNoTracking().FirstOrDefaultAsync(
            record => record.Id == line.PcidId.Value && record.CompanyId == request.CompanyId && record.BranchId == request.BranchId,
            cancellationToken);

        if (pcid is null)
        {
            errors.Add(new ApiError("inventory.pcid_not_found", $"lines[{line.LineNo}].pcidId", "PCID was not found in the active scope."));
            return;
        }

        if (IsBlockedStatus(pcid.Status))
        {
            errors.Add(new ApiError("inventory.pcid_unavailable", $"lines[{line.LineNo}].pcidId", "Inactive, blocked, shipped, or closed PCIDs cannot be moved."));
        }

        if (IsOutgoingMovement(line.MovementType) &&
            (pcid.WarehouseId != line.FromWarehouseId || pcid.BinId != line.FromBinId))
        {
            errors.Add(new ApiError("inventory.pcid_location_mismatch", $"lines[{line.LineNo}].pcidId", "PCID is not available in the selected source warehouse/bin."));
        }

        var requiresExistingContent = IsOutgoingMovement(line.MovementType) || line.FromWarehouseId.HasValue;
        var content = await DbContext.InventoryLicensePlateContents.AsNoTracking().FirstOrDefaultAsync(
            record =>
                record.CompanyId == request.CompanyId &&
                record.LicensePlateId == pcid.Id &&
                record.ItemId == line.ItemId &&
                record.ItemVariantId == line.ItemVariantId &&
                record.LotId == line.LotId &&
                record.SerialId == line.SerialId &&
                record.Status == "Active",
            cancellationToken);

        if (content is null && requiresExistingContent)
        {
            errors.Add(new ApiError("inventory.pcid_content_mismatch", $"lines[{line.LineNo}].pcidId", "PCID contents do not match the selected item, lot, serial, and variant."));
        }
        else if (content is not null && IsOutgoingMovement(line.MovementType) && content.Quantity < line.Quantity)
        {
            errors.Add(new ApiError("inventory.pcid_insufficient_qty", $"lines[{line.LineNo}].quantity", "PCID content quantity is below the requested movement quantity."));
        }
    }

    private async Task ValidateRevisionSnapshotReferencesAsync(
        StockMovementValidationLineRequest line,
        List<ApiError> errors,
        CancellationToken cancellationToken)
    {
        if (line.BomRevisionId.HasValue && !await DbContext.BomRevisions.AsNoTracking().AnyAsync(record => record.Id == line.BomRevisionId.Value, cancellationToken))
        {
            errors.Add(new ApiError("inventory.bom_revision_not_found", $"lines[{line.LineNo}].bomRevisionId", "BOM revision snapshot was not found."));
        }

        if (line.RoutingId.HasValue && !await DbContext.Routings.AsNoTracking().AnyAsync(record => record.Id == line.RoutingId.Value, cancellationToken))
        {
            errors.Add(new ApiError("inventory.routing_not_found", $"lines[{line.LineNo}].routingId", "Routing snapshot was not found."));
        }

        if (line.WorkOrderId.HasValue && !await DbContext.WorkOrders.AsNoTracking().AnyAsync(record => record.Id == line.WorkOrderId.Value, cancellationToken))
        {
            errors.Add(new ApiError("inventory.work_order_not_found", $"lines[{line.LineNo}].workOrderId", "Work order source snapshot was not found."));
        }

        if (line.SalesOrderId.HasValue && !await DbContext.SalesOrders.AsNoTracking().AnyAsync(record => record.Id == line.SalesOrderId.Value, cancellationToken))
        {
            errors.Add(new ApiError("inventory.sales_order_not_found", $"lines[{line.LineNo}].salesOrderId", "Sales order source snapshot was not found."));
        }

        if (line.PurchaseOrderId.HasValue && !await DbContext.PurchaseOrders.AsNoTracking().AnyAsync(record => record.Id == line.PurchaseOrderId.Value, cancellationToken))
        {
            errors.Add(new ApiError("inventory.purchase_order_not_found", $"lines[{line.LineNo}].purchaseOrderId", "Purchase order source snapshot was not found."));
        }
    }

    private static void ValidateStockState(StockMovementValidationLineRequest line, List<ApiError> errors)
    {
        if (IsOutgoingMovement(line.MovementType) && !string.Equals(NormalizeInventoryState(line.InventoryState), "Available", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add(new ApiError("inventory.blocked_state", $"lines[{line.LineNo}].inventoryState", "Only available stock can be issued, consumed, dispatched, or transferred out."));
        }
    }

    private async Task<StockBalance?> LoadBalanceAsync(
        long companyId,
        long branchId,
        long itemId,
        long? itemVariantId,
        long warehouseId,
        long? binId,
        long? lotId,
        long? serialId,
        long? pcidId,
        CancellationToken cancellationToken) =>
        await DbContext.StockBalances.AsNoTracking().FirstOrDefaultAsync(record =>
            record.CompanyId == companyId &&
            record.BranchId == branchId &&
            record.ItemId == itemId &&
            record.ItemVariantId == itemVariantId &&
            record.WarehouseId == warehouseId &&
            record.BinId == binId &&
            record.LotId == lotId &&
            record.SerialId == serialId &&
            record.PcidId == pcidId,
            cancellationToken);

    private static long? ResolvePolicyWarehouseId(StockMovementValidationLineRequest line) =>
        line.FromWarehouseId ?? line.ToWarehouseId;

    private static bool IsInboundMovement(string movementType)
    {
        var normalized = movementType.Trim();
        return normalized.Contains("Receipt", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Return", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Receive", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Adjustment", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Transfer", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Qc", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsOutgoingMovement(string movementType)
    {
        var normalized = movementType.Trim();
        return normalized.Contains("Issue", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Reserve", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Allocate", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Shipment", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Dispatch", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Scrap", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Transfer", StringComparison.OrdinalIgnoreCase) ||
               normalized.Contains("Consume", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsTrackingEnabled(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        !string.Equals(value.Trim(), "None", StringComparison.OrdinalIgnoreCase) &&
        !string.Equals(value.Trim(), "No", StringComparison.OrdinalIgnoreCase) &&
        !string.Equals(value.Trim(), "NotTracked", StringComparison.OrdinalIgnoreCase);

    private static bool ContainsAny(string? value, params string[] needles) =>
        !string.IsNullOrWhiteSpace(value) && needles.Any(needle => value.Contains(needle, StringComparison.OrdinalIgnoreCase));

    private static string? BuildBinDisabledReason(Bin bin) =>
        !string.Equals(bin.Status, "Active", StringComparison.OrdinalIgnoreCase)
            ? "Bin must be active."
            : bin.IsBlocked
                ? string.IsNullOrWhiteSpace(bin.BlockReasonCode) ? "Bin is blocked." : $"Bin is blocked: {bin.BlockReasonCode}."
                : null;

    private static string? BuildBlockedReason(StockBalance balance) =>
        balance.QcHoldQty > 0 || balance.BlockedQty > 0
            ? "Balance includes quality-held or blocked stock that is excluded from available quantity."
            : null;

    private static decimal GetStateAvailableQuantity(StockBalance balance, string? state) =>
        NormalizeInventoryState(state) switch
        {
            "QC_Hold" => balance.QcHoldQty,
            "Blocked" => balance.BlockedQty,
            "InTransit" => balance.InTransitQty,
            _ => balance.OnHandQty - balance.ReservedQty - balance.QcHoldQty - balance.BlockedQty
        };

    private static bool IsBlockedStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return false;
        }

        var normalized = status.Trim();
        return normalized.Equals("Blocked", StringComparison.OrdinalIgnoreCase) ||
               normalized.Equals("QC_Hold", StringComparison.OrdinalIgnoreCase) ||
               normalized.Equals("Hold", StringComparison.OrdinalIgnoreCase) ||
               normalized.Equals("Rejected", StringComparison.OrdinalIgnoreCase) ||
               normalized.Equals("Damaged", StringComparison.OrdinalIgnoreCase) ||
               normalized.Equals("Expired", StringComparison.OrdinalIgnoreCase) ||
               normalized.Equals("Inactive", StringComparison.OrdinalIgnoreCase) ||
               normalized.Equals("Shipped", StringComparison.OrdinalIgnoreCase) ||
               normalized.Equals("Closed", StringComparison.OrdinalIgnoreCase) ||
               normalized.Equals("Issued", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeInventoryState(string? state) =>
        string.IsNullOrWhiteSpace(state) ? "Available" : state.Trim();
}
