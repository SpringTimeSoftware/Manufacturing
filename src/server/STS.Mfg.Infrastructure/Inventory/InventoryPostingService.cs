using System.Globalization;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Inventory;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Inventory;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Finance;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Inventory;

internal sealed class InventoryPostingService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail,
    IInventoryPolicyService inventoryPolicyService)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail)
{
    public async Task<InventoryReferenceResolution> ResolveReferenceAsync(
        long companyId,
        long itemId,
        string? itemCode,
        long? itemVariantId,
        string? itemVariantCode,
        long? lotId,
        string? lotNo,
        long? serialId,
        string? serialNo,
        CancellationToken cancellationToken = default)
    {
        var resolvedItemId = await ResolveItemIdAsync(companyId, itemId, itemCode, cancellationToken);
        var resolvedItemVariantId = await ResolveItemVariantIdAsync(companyId, resolvedItemId, itemVariantId, itemVariantCode, cancellationToken);
        var resolvedLotId = await ResolveLotIdAsync(companyId, resolvedItemId, lotId, lotNo, cancellationToken);
        var resolvedSerialId = await ResolveSerialIdAsync(companyId, resolvedItemId, resolvedLotId, serialId, serialNo, cancellationToken);

        return new InventoryReferenceResolution(resolvedItemId, resolvedItemVariantId, resolvedLotId, resolvedSerialId);
    }

    public async Task<IReadOnlyCollection<StockTransactionDto>> ReceiveAsync(InventoryReceiptCommand command, CancellationToken cancellationToken = default)
    {
        ValidateDocument(command.CompanyId, command.BranchId, command.TransactionNo, command.Lines.Count);
        EnsureContextAccess(command.CompanyId, command.BranchId);

        var ownsTransaction = DbContext.Database.IsRelational() && DbContext.Database.CurrentTransaction is null;
        await using var dbTransaction = ownsTransaction
            ? await DbContext.Database.BeginTransactionAsync(cancellationToken)
            : null;
        var transactions = new List<StockTransaction>();
        var userId = GetUserId();
        var lineCount = command.Lines.Count;

        try
        {
            foreach (var line in command.Lines.OrderBy(record => record.LineNo))
            {
                var itemId = await ResolveItemIdAsync(command.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
                var itemVariantId = await ResolveItemVariantIdAsync(command.CompanyId, itemId, line.ItemVariantId, line.ItemVariantCode, cancellationToken);
                EnsureWarehouseAccess(line.WarehouseId);
                await EnsureWarehouseAndBinAreUsableAsync(command.CompanyId, command.BranchId, line.WarehouseId, line.BinId, cancellationToken);

                var lot = await ResolveLotAsync(command.CompanyId, itemId, line, cancellationToken);
                var serial = await ResolveSerialAsync(command.CompanyId, itemId, lot?.Id, line, line.WarehouseId, line.BinId, cancellationToken);
                var pcidId = await ResolvePcidIdAsync(command.CompanyId, command.BranchId, line.PcidId, line.PcidNo, line.WarehouseId, line.BinId, cancellationToken);
                await ValidateTrackedLineAsync(command.CompanyId, command.BranchId, command.PostingDate, command.SourceDocumentType, command.SourceDocumentId, line, line.TransactionType, null, null, line.WarehouseId, line.BinId, itemId, itemVariantId, lot?.Id, serial?.Id, pcidId, cancellationToken);
                var balance = await GetOrCreateStockBalanceAsync(
                    command.CompanyId,
                    command.BranchId,
                    itemId,
                    itemVariantId,
                    line.WarehouseId,
                    line.BinId,
                    lot?.Id,
                    serial?.Id,
                    pcidId,
                    cancellationToken);

                UpdateBalanceForState(balance, line.InventoryState, line.Quantity, line.CatchWeightQty, userId);
                UpdateLotAfterReceipt(lot, line.InventoryState, line.CatchWeightQty, userId);
                UpdateSerialAfterReceipt(serial, line.WarehouseId, line.BinId, line.InventoryState, userId);
                await UpdatePcidAfterReceiptAsync(command.CompanyId, pcidId, line.WarehouseId, line.BinId, itemId, itemVariantId, lot?.Id, serial?.Id, line.Quantity, line.InventoryState, userId, cancellationToken);

                var transaction = StockTransaction.Create(
                    command.CompanyId,
                    command.BranchId,
                    BuildTransactionNo(command.TransactionNo, line.LineNo, lineCount),
                    line.TransactionType,
                    command.PostingDate,
                    itemId,
                    itemVariantId,
                    null,
                    null,
                    line.WarehouseId,
                    line.BinId,
                    lot?.Id,
                    serial?.Id,
                    line.Quantity,
                    line.CatchWeightQty,
                    line.InventoryState,
                    command.SourceDocumentType,
                    command.SourceDocumentId,
                    command.Remarks,
                    userId);
                ApplyTrackingSnapshot(transaction, line, pcidId, userId);
                transactions.Add(transaction);
            }

            DbContext.StockTransactions.AddRange(transactions);
            await DbContext.SaveChangesAsync(cancellationToken);
            AddValuationPendingEntries(transactions, userId);
            await DbContext.SaveChangesAsync(cancellationToken);

            if (dbTransaction is not null)
            {
                await dbTransaction.CommitAsync(cancellationToken);
            }

            var dto = transactions.Select(MapStockTransaction).ToArray();
            await WriteAuditAsync("inventory", nameof(StockTransaction), command.AuditActionCode, transactions[0].Id, null, dto, cancellationToken);
            return dto;
        }
        catch
        {
            if (dbTransaction is not null)
            {
                await dbTransaction.RollbackAsync(cancellationToken);
            }

            throw;
        }
    }

    public async Task<IReadOnlyCollection<StockTransactionDto>> IssueAsync(InventoryIssueCommand command, CancellationToken cancellationToken = default)
    {
        ValidateDocument(command.CompanyId, command.BranchId, command.TransactionNo, command.Lines.Count);
        EnsureContextAccess(command.CompanyId, command.BranchId);

        var transactions = new List<StockTransaction>();
        var userId = GetUserId();
        var lineCount = command.Lines.Count;

        foreach (var line in command.Lines.OrderBy(record => record.LineNo))
        {
            var itemId = await ResolveItemIdAsync(command.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
            var itemVariantId = await ResolveItemVariantIdAsync(command.CompanyId, itemId, line.ItemVariantId, line.ItemVariantCode, cancellationToken);
            var lotId = await ResolveLotIdAsync(command.CompanyId, itemId, line.LotId, line.LotNo, cancellationToken);
            var serialId = await ResolveSerialIdAsync(command.CompanyId, itemId, lotId, line.SerialId, line.SerialNo, cancellationToken);
            var pcidId = await ResolvePcidIdAsync(command.CompanyId, command.BranchId, line.PcidId, line.PcidNo, line.WarehouseId, line.BinId, cancellationToken);
            EnsureWarehouseAccess(line.WarehouseId);
            await EnsureWarehouseAndBinAreUsableAsync(command.CompanyId, command.BranchId, line.WarehouseId, line.BinId, cancellationToken);
            await ValidateTrackedLineAsync(command.CompanyId, command.BranchId, command.PostingDate, command.SourceDocumentType, command.SourceDocumentId, line, line.TransactionType, line.WarehouseId, line.BinId, null, null, itemId, itemVariantId, lotId, serialId, pcidId, cancellationToken);

            var balance = await FindStockBalanceAsync(
                command.CompanyId,
                command.BranchId,
                itemId,
                itemVariantId,
                line.WarehouseId,
                line.BinId,
                lotId,
                serialId,
                pcidId,
                cancellationToken);

            balance = EnsureFound(balance, "Stock balance was not found for the requested issue.", "inventory.balance_not_found");
            var availableQuantity = GetStateQuantity(balance, line.InventoryState);
            ThrowIfInvalid(
                availableQuantity < line.Quantity
                    ? new ApiError("inventory.insufficient_qty", nameof(line.Quantity), "Insufficient quantity exists in the requested inventory state.")
                    : null);

            UpdateBalanceForState(balance, line.InventoryState, -line.Quantity, Negate(line.CatchWeightQty), userId);
            var lot = lotId.HasValue ? await DbContext.Lots.FirstOrDefaultAsync(record => record.Id == lotId.Value, cancellationToken) : null;
            var serial = serialId.HasValue ? await DbContext.Serials.FirstOrDefaultAsync(record => record.Id == serialId.Value, cancellationToken) : null;
            UpdateLotAfterIssue(lot, line.InventoryState, userId);
            UpdateSerialAfterIssue(serial, balance, line.InventoryState, userId);
            await UpdatePcidAfterIssueAsync(command.CompanyId, pcidId, itemId, itemVariantId, lotId, serialId, line.Quantity, userId, cancellationToken);

            var transaction = StockTransaction.Create(
                command.CompanyId,
                command.BranchId,
                BuildTransactionNo(command.TransactionNo, line.LineNo, lineCount),
                line.TransactionType,
                command.PostingDate,
                itemId,
                itemVariantId,
                line.WarehouseId,
                line.BinId,
                null,
                null,
                lotId,
                serialId,
                -line.Quantity,
                Negate(line.CatchWeightQty),
                line.InventoryState,
                command.SourceDocumentType,
                command.SourceDocumentId,
                command.Remarks,
                userId);
            ApplyTrackingSnapshot(transaction, line, pcidId, userId);
            transactions.Add(transaction);
        }

        DbContext.StockTransactions.AddRange(transactions);
        await DbContext.SaveChangesAsync(cancellationToken);
        AddValuationPendingEntries(transactions, userId);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = transactions.Select(MapStockTransaction).ToArray();
        await WriteAuditAsync("inventory", nameof(StockTransaction), command.AuditActionCode, transactions[0].Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<IReadOnlyCollection<StockTransactionDto>> TransferAsync(InventoryTransferCommand command, CancellationToken cancellationToken = default)
    {
        ValidateDocument(command.CompanyId, command.BranchId, command.TransactionNo, command.Lines.Count);
        EnsureContextAccess(command.CompanyId, command.BranchId);

        var transactions = new List<StockTransaction>();
        var userId = GetUserId();
        var lineCount = command.Lines.Count;

        foreach (var line in command.Lines.OrderBy(record => record.LineNo))
        {
            var itemId = await ResolveItemIdAsync(command.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
            var itemVariantId = await ResolveItemVariantIdAsync(command.CompanyId, itemId, line.ItemVariantId, line.ItemVariantCode, cancellationToken);
            var lotId = await ResolveLotIdAsync(command.CompanyId, itemId, line.LotId, line.LotNo, cancellationToken);
            var serialId = await ResolveSerialIdAsync(command.CompanyId, itemId, lotId, line.SerialId, line.SerialNo, cancellationToken);
            var pcidId = await ResolvePcidIdAsync(command.CompanyId, command.BranchId, line.PcidId, line.PcidNo, line.FromWarehouseId, line.FromBinId, cancellationToken);
            EnsureWarehouseAccess(line.FromWarehouseId);
            EnsureWarehouseAccess(line.ToWarehouseId);
            await EnsureWarehouseAndBinAreUsableAsync(command.CompanyId, command.BranchId, line.FromWarehouseId, line.FromBinId, cancellationToken);
            await EnsureWarehouseAndBinAreUsableAsync(command.CompanyId, command.BranchId, line.ToWarehouseId, line.ToBinId, cancellationToken);
            await ValidateTrackedLineAsync(command.CompanyId, command.BranchId, command.PostingDate, command.SourceDocumentType, command.SourceDocumentId, line, line.TransactionType, line.FromWarehouseId, line.FromBinId, line.ToWarehouseId, line.ToBinId, itemId, itemVariantId, lotId, serialId, pcidId, cancellationToken);

            var sourceBalance = await FindStockBalanceAsync(
                command.CompanyId,
                command.BranchId,
                itemId,
                itemVariantId,
                line.FromWarehouseId,
                line.FromBinId,
                lotId,
                serialId,
                pcidId,
                cancellationToken);

            sourceBalance = EnsureFound(sourceBalance, "Stock balance was not found for the requested transfer source.", "inventory.balance_not_found");
            var availableQuantity = GetStateQuantity(sourceBalance, line.FromInventoryState);
            ThrowIfInvalid(
                availableQuantity < line.Quantity
                    ? new ApiError("inventory.insufficient_qty", nameof(line.Quantity), "Insufficient quantity exists in the requested source inventory state.")
                    : null);

            var targetBalance = await GetOrCreateStockBalanceAsync(
                command.CompanyId,
                command.BranchId,
                itemId,
                itemVariantId,
                line.ToWarehouseId,
                line.ToBinId,
                lotId,
                serialId,
                pcidId,
                cancellationToken);

            UpdateBalanceForState(sourceBalance, line.FromInventoryState, -line.Quantity, Negate(line.CatchWeightQty), userId);
            UpdateBalanceForState(targetBalance, line.ToInventoryState, line.Quantity, line.CatchWeightQty, userId);

            var lot = lotId.HasValue ? await DbContext.Lots.FirstOrDefaultAsync(record => record.Id == lotId.Value, cancellationToken) : null;
            var serial = serialId.HasValue ? await DbContext.Serials.FirstOrDefaultAsync(record => record.Id == serialId.Value, cancellationToken) : null;
            UpdateLotAfterTransfer(lot, line.ToInventoryState, userId);
            UpdateSerialAfterReceipt(serial, line.ToWarehouseId, line.ToBinId, line.ToInventoryState, userId);
            await UpdatePcidAfterTransferAsync(command.CompanyId, pcidId, line.ToWarehouseId, line.ToBinId, itemId, itemVariantId, lotId, serialId, line.ToInventoryState, userId, cancellationToken);

            var transaction = StockTransaction.Create(
                command.CompanyId,
                command.BranchId,
                BuildTransactionNo(command.TransactionNo, line.LineNo, lineCount),
                line.TransactionType,
                command.PostingDate,
                itemId,
                itemVariantId,
                line.FromWarehouseId,
                line.FromBinId,
                line.ToWarehouseId,
                line.ToBinId,
                lotId,
                serialId,
                line.Quantity,
                line.CatchWeightQty,
                line.ToInventoryState,
                command.SourceDocumentType,
                command.SourceDocumentId,
                command.Remarks,
                userId);
            ApplyTrackingSnapshot(transaction, line, pcidId, userId);
            transactions.Add(transaction);
        }

        DbContext.StockTransactions.AddRange(transactions);
        await DbContext.SaveChangesAsync(cancellationToken);
        AddValuationPendingEntries(transactions, userId);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = transactions.Select(MapStockTransaction).ToArray();
        await WriteAuditAsync("inventory", nameof(StockTransaction), command.AuditActionCode, transactions[0].Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<IReadOnlyCollection<StockTransactionDto>> ChangeStateAsync(InventoryStateChangeCommand command, CancellationToken cancellationToken = default)
    {
        ValidateDocument(command.CompanyId, command.BranchId, command.TransactionNo, command.Lines.Count);
        EnsureContextAccess(command.CompanyId, command.BranchId);

        var transactions = new List<StockTransaction>();
        var userId = GetUserId();
        var lineCount = command.Lines.Count;

        foreach (var line in command.Lines.OrderBy(record => record.LineNo))
        {
            var itemId = await ResolveItemIdAsync(command.CompanyId, line.ItemId, line.ItemCode, cancellationToken);
            var itemVariantId = await ResolveItemVariantIdAsync(command.CompanyId, itemId, line.ItemVariantId, line.ItemVariantCode, cancellationToken);
            var lotId = await ResolveLotIdAsync(command.CompanyId, itemId, line.LotId, line.LotNo, cancellationToken);
            var serialId = await ResolveSerialIdAsync(command.CompanyId, itemId, lotId, line.SerialId, line.SerialNo, cancellationToken);
            var pcidId = await ResolvePcidIdAsync(command.CompanyId, command.BranchId, line.PcidId, line.PcidNo, line.WarehouseId, line.BinId, cancellationToken);
            EnsureWarehouseAccess(line.WarehouseId);
            await EnsureWarehouseAndBinAreUsableAsync(command.CompanyId, command.BranchId, line.WarehouseId, line.BinId, cancellationToken);
            await ValidateTrackedLineAsync(command.CompanyId, command.BranchId, command.PostingDate, command.SourceDocumentType, command.SourceDocumentId, line, line.TransactionType, line.WarehouseId, line.BinId, line.WarehouseId, line.BinId, itemId, itemVariantId, lotId, serialId, pcidId, cancellationToken);

            var balance = await FindStockBalanceAsync(
                command.CompanyId,
                command.BranchId,
                itemId,
                itemVariantId,
                line.WarehouseId,
                line.BinId,
                lotId,
                serialId,
                pcidId,
                cancellationToken);

            balance = EnsureFound(balance, "Stock balance was not found for the requested state change.", "inventory.balance_not_found");
            var availableQuantity = GetStateQuantity(balance, line.FromInventoryState);
            ThrowIfInvalid(
                availableQuantity < line.Quantity
                    ? new ApiError("inventory.insufficient_qty", nameof(line.Quantity), "Insufficient quantity exists in the source state for the requested move.")
                    : null);

            UpdateBalanceForState(balance, line.FromInventoryState, -line.Quantity, Negate(line.CatchWeightQty), userId);
            UpdateBalanceForState(balance, line.ToInventoryState, line.Quantity, line.CatchWeightQty, userId);

            var lot = lotId.HasValue ? await DbContext.Lots.FirstOrDefaultAsync(record => record.Id == lotId.Value, cancellationToken) : null;
            var serial = serialId.HasValue ? await DbContext.Serials.FirstOrDefaultAsync(record => record.Id == serialId.Value, cancellationToken) : null;
            UpdateLotAfterTransfer(lot, line.ToInventoryState, userId);
            UpdateSerialAfterReceipt(serial, line.WarehouseId, line.BinId, line.ToInventoryState, userId);
            await UpdatePcidAfterTransferAsync(command.CompanyId, pcidId, line.WarehouseId, line.BinId, itemId, itemVariantId, lotId, serialId, line.ToInventoryState, userId, cancellationToken);

            var transaction = StockTransaction.Create(
                command.CompanyId,
                command.BranchId,
                BuildTransactionNo(command.TransactionNo, line.LineNo, lineCount),
                line.TransactionType,
                command.PostingDate,
                itemId,
                itemVariantId,
                line.WarehouseId,
                line.BinId,
                line.WarehouseId,
                line.BinId,
                lotId,
                serialId,
                line.Quantity,
                line.CatchWeightQty,
                line.ToInventoryState,
                command.SourceDocumentType,
                command.SourceDocumentId,
                command.Remarks,
                userId);
            ApplyTrackingSnapshot(transaction, line, pcidId, userId);
            transactions.Add(transaction);
        }

        DbContext.StockTransactions.AddRange(transactions);
        await DbContext.SaveChangesAsync(cancellationToken);
        AddValuationPendingEntries(transactions, userId);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = transactions.Select(MapStockTransaction).ToArray();
        await WriteAuditAsync("inventory", nameof(StockTransaction), command.AuditActionCode, transactions[0].Id, null, dto, cancellationToken);
        return dto;
    }

    private static void ValidateDocument(long companyId, long branchId, string transactionNo, int lineCount)
    {
        ThrowIfInvalid(
            Positive(companyId, nameof(companyId), "Company is required."),
            Positive(branchId, nameof(branchId), "Branch is required."),
            Required(transactionNo, nameof(transactionNo), "Transaction number is required."),
            lineCount <= 0 ? new ApiError("validation.required", nameof(lineCount), "At least one movement line is required.") : null);
    }

    private async Task<long> ResolveItemIdAsync(long companyId, long itemId, string? itemCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        if (itemId > 0)
        {
            var item = await DbContext.Items.AsNoTracking()
                .ApplyCompanyScope(scope)
                .FirstOrDefaultAsync(record => record.Id == itemId, cancellationToken);

            item = EnsureFound(item, "Item was not found in the active scope.", "master.item_not_found");
            ThrowIfInvalid(
                item.CompanyId != companyId
                    ? new ApiError("validation.mismatch", nameof(companyId), "Item does not belong to the requested company.")
                    : null,
                !string.IsNullOrWhiteSpace(itemCode) && !string.Equals(item.ItemCode, itemCode.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(itemCode), "Item id and item code do not match.")
                    : null);

            return item.Id;
        }

        ThrowIfInvalid(Required(itemCode, nameof(itemCode), "Item code is required when item id is not supplied."));
        var resolved = await DbContext.Items.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.CompanyId == companyId && record.ItemCode == itemCode!.Trim(), cancellationToken);

        resolved = EnsureFound(resolved, "Item code was not found in the active scope.", "master.item_not_found");
        return resolved.Id;
    }

    private async Task<long?> ResolveItemVariantIdAsync(long companyId, long itemId, long? itemVariantId, string? itemVariantCode, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        if (itemVariantId.HasValue && itemVariantId.Value > 0)
        {
            var variant = await DbContext.ItemVariants.AsNoTracking()
                .ApplyCompanyScope(scope)
                .FirstOrDefaultAsync(record => record.Id == itemVariantId.Value, cancellationToken);

            variant = EnsureFound(variant, "Item variant was not found in the active scope.", "master.item_variant_not_found");
            ThrowIfInvalid(
                variant.CompanyId != companyId
                    ? new ApiError("validation.mismatch", nameof(companyId), "Item variant does not belong to the requested company.")
                    : null,
                variant.ItemId != itemId
                    ? new ApiError("validation.mismatch", nameof(itemVariantId), "Item variant does not belong to the resolved item.")
                    : null,
                !string.IsNullOrWhiteSpace(itemVariantCode) && !string.Equals(variant.VariantCode, itemVariantCode.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(itemVariantCode), "Item variant id and item variant code do not match.")
                    : null);

            return variant.Id;
        }

        if (string.IsNullOrWhiteSpace(itemVariantCode))
        {
            return null;
        }

        var resolved = await DbContext.ItemVariants.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.CompanyId == companyId && record.ItemId == itemId && record.VariantCode == itemVariantCode.Trim(), cancellationToken);

        resolved = EnsureFound(resolved, "Item variant code was not found in the active scope.", "master.item_variant_not_found");
        return resolved.Id;
    }

    private async Task<long?> ResolveLotIdAsync(long companyId, long itemId, long? lotId, string? lotNo, CancellationToken cancellationToken)
    {
        if (lotId.HasValue && lotId.Value > 0)
        {
            var lot = await DbContext.Lots.AsNoTracking().FirstOrDefaultAsync(record => record.Id == lotId.Value && record.CompanyId == companyId, cancellationToken);
            lot = EnsureFound(lot, "Lot was not found in the active scope.", "inventory.lot_not_found");
            ThrowIfInvalid(
                lot.ItemId != itemId
                    ? new ApiError("validation.mismatch", nameof(lotId), "Lot does not belong to the resolved item.")
                    : null,
                !string.IsNullOrWhiteSpace(lotNo) && !string.Equals(lot.LotNo, lotNo.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(lotNo), "Lot id and lot number do not match.")
                    : null);

            return lot.Id;
        }

        if (string.IsNullOrWhiteSpace(lotNo))
        {
            return null;
        }

        var resolved = await DbContext.Lots.AsNoTracking()
            .Where(record => record.CompanyId == companyId && record.ItemId == itemId && record.LotNo == lotNo.Trim())
            .FirstOrDefaultAsync(cancellationToken);

        return resolved?.Id;
    }

    private async Task<long?> ResolveSerialIdAsync(long companyId, long itemId, long? lotId, long? serialId, string? serialNo, CancellationToken cancellationToken)
    {
        if (serialId.HasValue && serialId.Value > 0)
        {
            var serial = await DbContext.Serials.AsNoTracking().FirstOrDefaultAsync(record => record.Id == serialId.Value && record.CompanyId == companyId, cancellationToken);
            serial = EnsureFound(serial, "Serial was not found in the active scope.", "inventory.serial_not_found");
            ThrowIfInvalid(
                serial.ItemId != itemId
                    ? new ApiError("validation.mismatch", nameof(serialId), "Serial does not belong to the resolved item.")
                    : null,
                lotId.HasValue && serial.LotId.HasValue && serial.LotId != lotId
                    ? new ApiError("validation.mismatch", nameof(lotId), "Serial does not belong to the resolved lot.")
                    : null,
                !string.IsNullOrWhiteSpace(serialNo) && !string.Equals(serial.SerialNo, serialNo.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(serialNo), "Serial id and serial number do not match.")
                    : null);

            return serial.Id;
        }

        if (string.IsNullOrWhiteSpace(serialNo))
        {
            return null;
        }

        var resolved = await DbContext.Serials.AsNoTracking()
            .Where(record => record.CompanyId == companyId && record.ItemId == itemId && record.SerialNo == serialNo.Trim())
            .FirstOrDefaultAsync(cancellationToken);

        return resolved?.Id;
    }

    private async Task EnsureWarehouseAndBinAreUsableAsync(long companyId, long branchId, long warehouseId, long? binId, CancellationToken cancellationToken)
    {
        var warehouse = await DbContext.Warehouses.AsNoTracking()
            .FirstOrDefaultAsync(record => record.Id == warehouseId && record.CompanyId == companyId, cancellationToken);

        warehouse = EnsureFound(warehouse, "Warehouse was not found in the active scope.", "inventory.warehouse_not_found");
        ThrowIfInvalid(
            warehouse.BranchId != branchId
                ? new ApiError("validation.mismatch", nameof(branchId), "Warehouse does not belong to the requested branch.")
                : null,
            !string.Equals(warehouse.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(warehouseId), "Warehouse must be active.")
                : null);

        if (!binId.HasValue)
        {
            return;
        }

        var bin = await DbContext.Bins.AsNoTracking()
            .FirstOrDefaultAsync(record => record.Id == binId.Value && record.WarehouseId == warehouseId, cancellationToken);

        bin = EnsureFound(bin, "Bin was not found in the active scope.", "inventory.bin_not_found");
        ThrowIfInvalid(
            !string.Equals(bin.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? new ApiError("validation.invalid_state", nameof(binId), "Bin must be active.")
                : null,
            bin.IsBlocked
                ? new ApiError("validation.invalid_state", nameof(binId), "Blocked bins cannot receive or issue inventory.")
                : null);
    }

    private async Task<Lot?> ResolveLotAsync(long companyId, long itemId, InventoryTrackedLine line, CancellationToken cancellationToken)
    {
        var lotId = await ResolveLotIdAsync(companyId, itemId, line.LotId, line.LotNo, cancellationToken);
        if (lotId.HasValue)
        {
            return await DbContext.Lots.FirstOrDefaultAsync(record => record.Id == lotId.Value, cancellationToken);
        }

        if (string.IsNullOrWhiteSpace(line.LotNo))
        {
            return null;
        }

        var lot = Lot.Create(
            companyId,
            itemId,
            line.LotNo,
            line.ManufacturedOn,
            line.ExpiryOn,
            NormalizeInventoryState(line.InventoryState),
            line.CatchWeightQty,
            GetUserId());

        DbContext.Lots.Add(lot);
        await DbContext.SaveChangesAsync(cancellationToken);
        return lot;
    }

    private async Task<Serial?> ResolveSerialAsync(long companyId, long itemId, long? lotId, InventoryTrackedLine line, long warehouseId, long? binId, CancellationToken cancellationToken)
    {
        var serialId = await ResolveSerialIdAsync(companyId, itemId, lotId, line.SerialId, line.SerialNo, cancellationToken);
        if (serialId.HasValue)
        {
            return await DbContext.Serials.FirstOrDefaultAsync(record => record.Id == serialId.Value, cancellationToken);
        }

        if (string.IsNullOrWhiteSpace(line.SerialNo))
        {
            return null;
        }

        var serial = Serial.Create(
            companyId,
            itemId,
            line.SerialNo,
            lotId,
            warehouseId,
            binId,
            NormalizeInventoryState(line.InventoryState),
            line.ManufacturedOn,
            line.ExpiryOn,
            GetUserId());

        DbContext.Serials.Add(serial);
        await DbContext.SaveChangesAsync(cancellationToken);
        return serial;
    }

    private async Task<long?> ResolvePcidIdAsync(
        long companyId,
        long branchId,
        long? pcidId,
        string? pcidNo,
        long warehouseId,
        long? binId,
        CancellationToken cancellationToken)
    {
        if (pcidId.HasValue && pcidId.Value > 0)
        {
            var pcid = await DbContext.InventoryLicensePlates.AsNoTracking()
                .FirstOrDefaultAsync(record => record.Id == pcidId.Value && record.CompanyId == companyId && record.BranchId == branchId, cancellationToken);

            pcid = EnsureFound(pcid, "PCID was not found in the active scope.", "inventory.pcid_not_found");
            ThrowIfInvalid(
                pcid.WarehouseId.HasValue && pcid.WarehouseId != warehouseId
                    ? new ApiError("validation.mismatch", nameof(pcidId), "PCID is not assigned to the selected warehouse.")
                    : null,
                binId.HasValue && pcid.BinId.HasValue && pcid.BinId != binId
                    ? new ApiError("validation.mismatch", nameof(pcidId), "PCID is not assigned to the selected bin.")
                    : null,
                !string.IsNullOrWhiteSpace(pcidNo) && !string.Equals(pcid.PcidNo, pcidNo.Trim(), StringComparison.OrdinalIgnoreCase)
                    ? new ApiError("validation.mismatch", nameof(pcidNo), "PCID id and PCID number do not match.")
                    : null);

            return pcid.Id;
        }

        if (string.IsNullOrWhiteSpace(pcidNo))
        {
            return null;
        }

        var resolved = await DbContext.InventoryLicensePlates.AsNoTracking()
            .FirstOrDefaultAsync(record => record.CompanyId == companyId && record.BranchId == branchId && record.PcidNo == pcidNo.Trim(), cancellationToken);

        return resolved?.Id;
    }

    private async Task<StockBalance?> FindStockBalanceAsync(
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
        await DbContext.StockBalances
            .FirstOrDefaultAsync(
                record => record.CompanyId == companyId &&
                          record.BranchId == branchId &&
                          record.ItemId == itemId &&
                          record.ItemVariantId == itemVariantId &&
                          record.WarehouseId == warehouseId &&
                          record.BinId == binId &&
                          record.LotId == lotId &&
                          record.SerialId == serialId &&
                          record.PcidId == pcidId,
                cancellationToken);

    private async Task<StockBalance> GetOrCreateStockBalanceAsync(
        long companyId,
        long branchId,
        long itemId,
        long? itemVariantId,
        long warehouseId,
        long? binId,
        long? lotId,
        long? serialId,
        long? pcidId,
        CancellationToken cancellationToken)
    {
        var existing = await FindStockBalanceAsync(companyId, branchId, itemId, itemVariantId, warehouseId, binId, lotId, serialId, pcidId, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var balance = StockBalance.Create(companyId, branchId, itemId, itemVariantId, warehouseId, binId, lotId, serialId, 0m, 0m, 0m, 0m, 0m, null, GetUserId(), pcidId);
        DbContext.StockBalances.Add(balance);
        return balance;
    }

    private static void UpdateBalanceForState(StockBalance balance, string inventoryState, decimal quantity, decimal? catchWeightQty, long? userId)
    {
        var normalizedState = NormalizeInventoryState(inventoryState);
        var onHand = balance.OnHandQty;
        var qcHold = balance.QcHoldQty;
        var blocked = balance.BlockedQty;
        var inTransit = balance.InTransitQty;

        switch (normalizedState)
        {
            case "QC_Hold":
                qcHold += quantity;
                break;
            case "Blocked":
                blocked += quantity;
                break;
            case "InTransit":
                inTransit += quantity;
                break;
            default:
                onHand += quantity;
                break;
        }

        balance.UpdateQuantities(onHand, balance.ReservedQty, qcHold, blocked, inTransit, Add(balance.CatchWeightQty, catchWeightQty), userId);
    }

    private static decimal GetStateQuantity(StockBalance balance, string inventoryState) =>
        NormalizeInventoryState(inventoryState) switch
        {
            "QC_Hold" => balance.QcHoldQty,
            "Blocked" => balance.BlockedQty,
            "InTransit" => balance.InTransitQty,
            _ => balance.OnHandQty
        };

    private static void UpdateLotAfterReceipt(Lot? lot, string inventoryState, decimal? catchWeightQty, long? userId)
    {
        if (lot is null)
        {
            return;
        }

        lot.Update(lot.LotNo, lot.ManufacturedOn, lot.ExpiryOn, NormalizeInventoryState(inventoryState), Add(lot.CatchWeightQty, catchWeightQty), userId);
    }

    private static void UpdateLotAfterIssue(Lot? lot, string inventoryState, long? userId)
    {
        if (lot is null)
        {
            return;
        }

        lot.Update(lot.LotNo, lot.ManufacturedOn, lot.ExpiryOn, NormalizeInventoryState(inventoryState), lot.CatchWeightQty, userId);
    }

    private static void UpdateLotAfterTransfer(Lot? lot, string inventoryState, long? userId)
    {
        if (lot is null)
        {
            return;
        }

        lot.Update(lot.LotNo, lot.ManufacturedOn, lot.ExpiryOn, NormalizeInventoryState(inventoryState), lot.CatchWeightQty, userId);
    }

    private static void UpdateSerialAfterReceipt(Serial? serial, long warehouseId, long? binId, string inventoryState, long? userId)
    {
        if (serial is null)
        {
            return;
        }

        serial.Update(serial.SerialNo, serial.LotId, warehouseId, binId, NormalizeInventoryState(inventoryState), serial.ManufacturedOn, serial.ExpiryOn, userId);
    }

    private static void UpdateSerialAfterIssue(Serial? serial, StockBalance sourceBalance, string inventoryState, long? userId)
    {
        if (serial is null)
        {
            return;
        }

        var remaining = GetStateQuantity(sourceBalance, inventoryState);
        serial.Update(
            serial.SerialNo,
            serial.LotId,
            remaining > 0 ? serial.CurrentWarehouseId : null,
            remaining > 0 ? serial.CurrentBinId : null,
            remaining > 0 ? NormalizeInventoryState(inventoryState) : "Issued",
            serial.ManufacturedOn,
            serial.ExpiryOn,
            userId);
    }

    private async Task UpdatePcidAfterReceiptAsync(
        long companyId,
        long? pcidId,
        long warehouseId,
        long? binId,
        long itemId,
        long? itemVariantId,
        long? lotId,
        long? serialId,
        decimal quantity,
        string inventoryState,
        long? userId,
        CancellationToken cancellationToken)
    {
        if (!pcidId.HasValue)
        {
            return;
        }

        var pcid = await DbContext.InventoryLicensePlates.FirstOrDefaultAsync(record => record.Id == pcidId.Value, cancellationToken);
        pcid?.Update(pcid.PcidNo, pcid.LicensePlateType, warehouseId, binId, NormalizeInventoryState(inventoryState), userId);

        var content = await DbContext.InventoryLicensePlateContents.FirstOrDefaultAsync(record =>
            record.CompanyId == companyId &&
            record.LicensePlateId == pcidId.Value &&
            record.ItemId == itemId &&
            record.ItemVariantId == itemVariantId &&
            record.LotId == lotId &&
            record.SerialId == serialId,
            cancellationToken);

        if (content is null)
        {
            DbContext.InventoryLicensePlateContents.Add(InventoryLicensePlateContent.Create(companyId, pcidId.Value, itemId, itemVariantId, lotId, serialId, quantity, NormalizeInventoryState(inventoryState), "Active", userId));
        }
        else
        {
            content.Update(content.Quantity + quantity, NormalizeInventoryState(inventoryState), "Active", userId);
        }
    }

    private async Task UpdatePcidAfterIssueAsync(
        long companyId,
        long? pcidId,
        long itemId,
        long? itemVariantId,
        long? lotId,
        long? serialId,
        decimal quantity,
        long? userId,
        CancellationToken cancellationToken)
    {
        if (!pcidId.HasValue)
        {
            return;
        }

        var content = await DbContext.InventoryLicensePlateContents.FirstOrDefaultAsync(record =>
            record.CompanyId == companyId &&
            record.LicensePlateId == pcidId.Value &&
            record.ItemId == itemId &&
            record.ItemVariantId == itemVariantId &&
            record.LotId == lotId &&
            record.SerialId == serialId,
            cancellationToken);

        if (content is null)
        {
            return;
        }

        var remaining = Math.Max(content.Quantity - quantity, 0m);
        content.Update(remaining, content.InventoryState, remaining > 0 ? "Active" : "Consumed", userId);
    }

    private async Task UpdatePcidAfterTransferAsync(
        long companyId,
        long? pcidId,
        long warehouseId,
        long? binId,
        long itemId,
        long? itemVariantId,
        long? lotId,
        long? serialId,
        string inventoryState,
        long? userId,
        CancellationToken cancellationToken)
    {
        if (!pcidId.HasValue)
        {
            return;
        }

        var pcid = await DbContext.InventoryLicensePlates.FirstOrDefaultAsync(record => record.Id == pcidId.Value, cancellationToken);
        pcid?.Update(pcid.PcidNo, pcid.LicensePlateType, warehouseId, binId, NormalizeInventoryState(inventoryState), userId);

        var content = await DbContext.InventoryLicensePlateContents.FirstOrDefaultAsync(record =>
            record.CompanyId == companyId &&
            record.LicensePlateId == pcidId.Value &&
            record.ItemId == itemId &&
            record.ItemVariantId == itemVariantId &&
            record.LotId == lotId &&
            record.SerialId == serialId,
            cancellationToken);

        content?.Update(content.Quantity, NormalizeInventoryState(inventoryState), content.Status, userId);
    }

    private static string NormalizeInventoryState(string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            return "Available";
        }

        return state.Trim() switch
        {
            "Available" => "Available",
            "QC_Hold" => "QC_Hold",
            "Blocked" => "Blocked",
            "InTransit" => "InTransit",
            _ => state.Trim()
        };
    }

    private async Task ValidateTrackedLineAsync(
        long companyId,
        long branchId,
        DateOnly postingDate,
        string? sourceDocumentType,
        long? sourceDocumentId,
        InventoryTrackedLine line,
        string movementType,
        long? fromWarehouseId,
        long? fromBinId,
        long? toWarehouseId,
        long? toBinId,
        long itemId,
        long? itemVariantId,
        long? lotId,
        long? serialId,
        long? pcidId,
        CancellationToken cancellationToken)
    {
        var result = await inventoryPolicyService.ValidateMovementAsync(
            new StockMovementValidationRequest(
                companyId,
                branchId,
                postingDate,
                sourceDocumentType,
                sourceDocumentId,
                new[]
                {
                    new StockMovementValidationLineRequest(
                        line.LineNo,
                        movementType,
                        itemId,
                        itemVariantId,
                        fromWarehouseId,
                        fromBinId,
                        toWarehouseId,
                        toBinId,
                        lotId,
                        serialId,
                        pcidId,
                        line.Quantity,
                        line.InventoryState,
                        sourceDocumentType,
                        sourceDocumentId,
                        line.SourceDocumentNo,
                        line.SourceDocumentLineId,
                        line.SourceDocumentRevisionNo,
                        line.SourceDocumentVersionNo,
                        line.ItemRevisionId,
                        line.EngineeringDocumentRevisionId,
                        line.BomRevisionId,
                        line.RoutingId,
                        line.RoutingRevisionId,
                        line.WorkOrderId,
                        line.ProductionOrderId,
                        line.SalesOrderId,
                        line.SalesOrderLineId,
                        line.PurchaseOrderId,
                        line.PurchaseOrderLineId,
                        line.QualityDocumentId)
                }),
            cancellationToken);

        ThrowIfInvalid(result.Errors);
    }

    private static void ApplyTrackingSnapshot(StockTransaction transaction, InventoryTrackedLine line, long? pcidId, long? userId)
    {
        var requiresSourceSnapshot = RequiresSourceSnapshot(line);
        var legacyTrackingIncomplete = requiresSourceSnapshot &&
            ((string.IsNullOrWhiteSpace(line.SourceDocumentNo) && !line.SourceDocumentLineId.HasValue) ||
             (!line.ItemRevisionId.HasValue && !line.BomRevisionId.HasValue && !line.RoutingId.HasValue && !line.EngineeringDocumentRevisionId.HasValue));

        transaction.ApplyTrackingSnapshot(
            pcidId,
            line.SourceDocumentNo,
            line.SourceDocumentLineId,
            line.SourceDocumentRevisionNo,
            line.SourceDocumentVersionNo,
            line.ItemRevisionId,
            line.EngineeringDocumentRevisionId,
            line.BomRevisionId,
            line.RoutingId,
            line.RoutingRevisionId,
            line.WorkOrderId,
            line.ProductionOrderId,
            line.SalesOrderId,
            line.SalesOrderLineId,
            line.PurchaseOrderId,
            line.PurchaseOrderLineId,
            line.QualityDocumentId,
            legacyTrackingIncomplete,
            userId);
    }

    private static bool RequiresSourceSnapshot(InventoryTrackedLine line) =>
        line.WorkOrderId.HasValue ||
        line.ProductionOrderId.HasValue ||
        line.SalesOrderId.HasValue ||
        line.PurchaseOrderId.HasValue ||
        line.QualityDocumentId.HasValue;

    private static decimal? Add(decimal? current, decimal? delta) => current.HasValue || delta.HasValue ? (current ?? 0m) + (delta ?? 0m) : null;

    private static decimal? Negate(decimal? value) => value.HasValue ? -value.Value : null;

    private static string BuildTransactionNo(string transactionNo, int lineNo, int lineCount)
    {
        var normalized = transactionNo.Trim();
        if (lineCount <= 1)
        {
            return normalized;
        }

        var suffix = $"-{lineNo:D3}";
        return normalized.Length + suffix.Length <= 48
            ? normalized + suffix
            : normalized[..(48 - suffix.Length)] + suffix;
    }

    private static StockTransactionDto MapStockTransaction(StockTransaction entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.TransactionNo,
            entity.TransactionType,
            entity.PostingDate,
            entity.ItemId,
            entity.ItemVariantId,
            entity.FromWarehouseId,
            entity.FromBinId,
            entity.ToWarehouseId,
            entity.ToBinId,
            entity.LotId,
            entity.SerialId,
            entity.PcidId,
            entity.Quantity,
            entity.CatchWeightQty,
            entity.InventoryState,
            entity.SourceDocumentType,
            entity.SourceDocumentId,
            entity.Remarks,
            entity.SourceDocumentNo,
            entity.SourceDocumentLineId,
            entity.SourceDocumentRevisionNo,
            entity.SourceDocumentVersionNo,
            entity.ItemRevisionId,
            entity.EngineeringDocumentRevisionId,
            entity.BomRevisionId,
            entity.RoutingId,
            entity.RoutingRevisionId,
            entity.WorkOrderId,
            entity.ProductionOrderId,
            entity.SalesOrderId,
            entity.SalesOrderLineId,
            entity.PurchaseOrderId,
            entity.PurchaseOrderLineId,
            entity.QualityDocumentId,
            entity.LegacyTrackingIncomplete);

    private void AddValuationPendingEntries(IReadOnlyCollection<StockTransaction> transactions, long? userId)
    {
        foreach (var transaction in transactions)
        {
            DbContext.InventoryValuationEntries.Add(InventoryValuationEntry.Create(
                transaction.CompanyId ?? 0,
                transaction.BranchId,
                transaction.Id,
                transaction.SourceDocumentType ?? transaction.TransactionType,
                transaction.SourceDocumentId,
                transaction.SourceDocumentNo,
                transaction.ItemId,
                transaction.ToWarehouseId ?? transaction.FromWarehouseId,
                transaction.ToBinId ?? transaction.FromBinId,
                transaction.LotId,
                transaction.SerialId,
                transaction.PcidId,
                transaction.PostingDate,
                transaction.Quantity,
                0m,
                "WeightedAverage",
                "Valuation Pending",
                userId));
        }
    }
}

internal sealed record InventoryReceiptCommand(
    long CompanyId,
    long BranchId,
    string TransactionNo,
    DateOnly PostingDate,
    string? SourceDocumentType,
    long? SourceDocumentId,
    string? Remarks,
    string AuditActionCode,
    IReadOnlyCollection<InventoryReceiptLine> Lines);

internal sealed record InventoryIssueCommand(
    long CompanyId,
    long BranchId,
    string TransactionNo,
    DateOnly PostingDate,
    string? SourceDocumentType,
    long? SourceDocumentId,
    string? Remarks,
    string AuditActionCode,
    IReadOnlyCollection<InventoryIssueLine> Lines);

internal sealed record InventoryTransferCommand(
    long CompanyId,
    long BranchId,
    string TransactionNo,
    DateOnly PostingDate,
    string? SourceDocumentType,
    long? SourceDocumentId,
    string? Remarks,
    string AuditActionCode,
    IReadOnlyCollection<InventoryTransferLine> Lines);

internal sealed record InventoryStateChangeCommand(
    long CompanyId,
    long BranchId,
    string TransactionNo,
    DateOnly PostingDate,
    string? SourceDocumentType,
    long? SourceDocumentId,
    string? Remarks,
    string AuditActionCode,
    IReadOnlyCollection<InventoryStateChangeLine> Lines);

internal abstract record InventoryTrackedLine(
    int LineNo,
    long ItemId,
    long? ItemVariantId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string InventoryState,
    long? LotId,
    string? LotNo,
    DateOnly? ManufacturedOn,
    DateOnly? ExpiryOn,
    long? SerialId,
    string? SerialNo,
    string? ItemCode,
    string? ItemVariantCode,
    long? PcidId,
    string? PcidNo,
    string? SourceDocumentNo,
    long? SourceDocumentLineId,
    int? SourceDocumentRevisionNo,
    int? SourceDocumentVersionNo,
    long? ItemRevisionId,
    long? EngineeringDocumentRevisionId,
    long? BomRevisionId,
    long? RoutingId,
    long? RoutingRevisionId,
    long? WorkOrderId,
    long? ProductionOrderId,
    long? SalesOrderId,
    long? SalesOrderLineId,
    long? PurchaseOrderId,
    long? PurchaseOrderLineId,
    long? QualityDocumentId);

internal sealed record InventoryReceiptLine(
    int LineNo,
    string TransactionType,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string InventoryState,
    long? LotId = null,
    string? LotNo = null,
    DateOnly? ManufacturedOn = null,
    DateOnly? ExpiryOn = null,
    long? SerialId = null,
    string? SerialNo = null,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    long? PcidId = null,
    string? PcidNo = null,
    string? SourceDocumentNo = null,
    long? SourceDocumentLineId = null,
    int? SourceDocumentRevisionNo = null,
    int? SourceDocumentVersionNo = null,
    long? ItemRevisionId = null,
    long? EngineeringDocumentRevisionId = null,
    long? BomRevisionId = null,
    long? RoutingId = null,
    long? RoutingRevisionId = null,
    long? WorkOrderId = null,
    long? ProductionOrderId = null,
    long? SalesOrderId = null,
    long? SalesOrderLineId = null,
    long? PurchaseOrderId = null,
    long? PurchaseOrderLineId = null,
    long? QualityDocumentId = null)
    : InventoryTrackedLine(LineNo, ItemId, ItemVariantId, Quantity, CatchWeightQty, InventoryState, LotId, LotNo, ManufacturedOn, ExpiryOn, SerialId, SerialNo, ItemCode, ItemVariantCode, PcidId, PcidNo, SourceDocumentNo, SourceDocumentLineId, SourceDocumentRevisionNo, SourceDocumentVersionNo, ItemRevisionId, EngineeringDocumentRevisionId, BomRevisionId, RoutingId, RoutingRevisionId, WorkOrderId, ProductionOrderId, SalesOrderId, SalesOrderLineId, PurchaseOrderId, PurchaseOrderLineId, QualityDocumentId);

internal sealed record InventoryIssueLine(
    int LineNo,
    string TransactionType,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string InventoryState,
    long? LotId = null,
    string? LotNo = null,
    long? SerialId = null,
    string? SerialNo = null,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    long? PcidId = null,
    string? PcidNo = null,
    string? SourceDocumentNo = null,
    long? SourceDocumentLineId = null,
    int? SourceDocumentRevisionNo = null,
    int? SourceDocumentVersionNo = null,
    long? ItemRevisionId = null,
    long? EngineeringDocumentRevisionId = null,
    long? BomRevisionId = null,
    long? RoutingId = null,
    long? RoutingRevisionId = null,
    long? WorkOrderId = null,
    long? ProductionOrderId = null,
    long? SalesOrderId = null,
    long? SalesOrderLineId = null,
    long? PurchaseOrderId = null,
    long? PurchaseOrderLineId = null,
    long? QualityDocumentId = null)
    : InventoryTrackedLine(LineNo, ItemId, ItemVariantId, Quantity, CatchWeightQty, InventoryState, LotId, LotNo, null, null, SerialId, SerialNo, ItemCode, ItemVariantCode, PcidId, PcidNo, SourceDocumentNo, SourceDocumentLineId, SourceDocumentRevisionNo, SourceDocumentVersionNo, ItemRevisionId, EngineeringDocumentRevisionId, BomRevisionId, RoutingId, RoutingRevisionId, WorkOrderId, ProductionOrderId, SalesOrderId, SalesOrderLineId, PurchaseOrderId, PurchaseOrderLineId, QualityDocumentId);

internal sealed record InventoryTransferLine(
    int LineNo,
    string TransactionType,
    long ItemId,
    long? ItemVariantId,
    long FromWarehouseId,
    long? FromBinId,
    long ToWarehouseId,
    long? ToBinId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string FromInventoryState,
    string ToInventoryState,
    long? LotId = null,
    string? LotNo = null,
    long? SerialId = null,
    string? SerialNo = null,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    long? PcidId = null,
    string? PcidNo = null,
    string? SourceDocumentNo = null,
    long? SourceDocumentLineId = null,
    int? SourceDocumentRevisionNo = null,
    int? SourceDocumentVersionNo = null,
    long? ItemRevisionId = null,
    long? EngineeringDocumentRevisionId = null,
    long? BomRevisionId = null,
    long? RoutingId = null,
    long? RoutingRevisionId = null,
    long? WorkOrderId = null,
    long? ProductionOrderId = null,
    long? SalesOrderId = null,
    long? SalesOrderLineId = null,
    long? PurchaseOrderId = null,
    long? PurchaseOrderLineId = null,
    long? QualityDocumentId = null)
    : InventoryTrackedLine(LineNo, ItemId, ItemVariantId, Quantity, CatchWeightQty, ToInventoryState, LotId, LotNo, null, null, SerialId, SerialNo, ItemCode, ItemVariantCode, PcidId, PcidNo, SourceDocumentNo, SourceDocumentLineId, SourceDocumentRevisionNo, SourceDocumentVersionNo, ItemRevisionId, EngineeringDocumentRevisionId, BomRevisionId, RoutingId, RoutingRevisionId, WorkOrderId, ProductionOrderId, SalesOrderId, SalesOrderLineId, PurchaseOrderId, PurchaseOrderLineId, QualityDocumentId);

internal sealed record InventoryStateChangeLine(
    int LineNo,
    string TransactionType,
    long ItemId,
    long? ItemVariantId,
    long WarehouseId,
    long? BinId,
    decimal Quantity,
    decimal? CatchWeightQty,
    string FromInventoryState,
    string ToInventoryState,
    long? LotId = null,
    string? LotNo = null,
    long? SerialId = null,
    string? SerialNo = null,
    string? ItemCode = null,
    string? ItemVariantCode = null,
    long? PcidId = null,
    string? PcidNo = null,
    string? SourceDocumentNo = null,
    long? SourceDocumentLineId = null,
    int? SourceDocumentRevisionNo = null,
    int? SourceDocumentVersionNo = null,
    long? ItemRevisionId = null,
    long? EngineeringDocumentRevisionId = null,
    long? BomRevisionId = null,
    long? RoutingId = null,
    long? RoutingRevisionId = null,
    long? WorkOrderId = null,
    long? ProductionOrderId = null,
    long? SalesOrderId = null,
    long? SalesOrderLineId = null,
    long? PurchaseOrderId = null,
    long? PurchaseOrderLineId = null,
    long? QualityDocumentId = null)
    : InventoryTrackedLine(LineNo, ItemId, ItemVariantId, Quantity, CatchWeightQty, ToInventoryState, LotId, LotNo, null, null, SerialId, SerialNo, ItemCode, ItemVariantCode, PcidId, PcidNo, SourceDocumentNo, SourceDocumentLineId, SourceDocumentRevisionNo, SourceDocumentVersionNo, ItemRevisionId, EngineeringDocumentRevisionId, BomRevisionId, RoutingId, RoutingRevisionId, WorkOrderId, ProductionOrderId, SalesOrderId, SalesOrderLineId, PurchaseOrderId, PurchaseOrderLineId, QualityDocumentId);

internal sealed record InventoryReferenceResolution(
    long ItemId,
    long? ItemVariantId,
    long? LotId,
    long? SerialId);
