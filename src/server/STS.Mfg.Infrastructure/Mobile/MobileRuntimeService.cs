using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Inventory;
using STS.Mfg.Application.Abstractions.Mobile;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Mobile;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Mobile;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Mobile;

internal sealed class MobileRuntimeService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail,
    IInventoryPolicyService inventoryPolicyService,
    IInventoryService inventoryService)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IMobileRuntimeService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<MobileDeviceRegistrationDto> RegisterDeviceAsync(MobileDeviceRegistrationRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDeviceRequest(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureWarehouseAccess(request.WarehouseId);

        var userId = GetUserId();
        var existing = await DbContext.MobileDeviceRegistrations
            .SingleOrDefaultAsync(device => device.CompanyId == request.CompanyId && device.DeviceCode == request.DeviceCode.Trim(), cancellationToken);

        if (existing is null)
        {
            var device = MobileDeviceRegistration.Create(
                request.CompanyId,
                request.BranchId,
                request.WarehouseId,
                request.DeviceCode,
                request.DeviceName,
                userId,
                null,
                request.Platform,
                request.RuntimeName,
                request.AppVersion,
                request.OperatingSystem,
                request.BrowserInfo,
                request.ScannerCapability,
                request.CameraCapability,
                request.OfflineCapability,
                request.CredentialReference,
                request.RequestTrust,
                userId);
            DbContext.MobileDeviceRegistrations.Add(device);
            await DbContext.SaveChangesAsync(cancellationToken);
            await WriteAuditAsync("Mobile", nameof(MobileDeviceRegistration), "mobile.device.registered", device.Id, null, MapDevice(device), cancellationToken);
            return MapDevice(device);
        }

        existing.UpdateProfile(
            request.DeviceName,
            userId,
            null,
            request.Platform,
            request.RuntimeName,
            request.AppVersion,
            request.OperatingSystem,
            request.BrowserInfo,
            request.ScannerCapability,
            request.CameraCapability,
            request.OfflineCapability,
            request.CredentialReference,
            userId);
        existing.MarkSeen(userId);
        await DbContext.SaveChangesAsync(cancellationToken);
        return MapDevice(existing);
    }

    public async Task<MobileDeviceRegistrationDto> HeartbeatAsync(MobileDeviceHeartbeatRequest request, CancellationToken cancellationToken = default)
    {
        var device = await GetDeviceByCodeAsync(request.DeviceCode, cancellationToken);
        if (device.IsRevoked)
        {
            throw new ValidationFailureException(new[]
            {
                new ApiError("mobile.device_revoked", "deviceCode", "Revoked mobile devices cannot sync or post.")
            });
        }

        device.UpdateProfile(
            device.DeviceName,
            device.UserId,
            device.AssignedUserName,
            device.Platform,
            device.RuntimeName,
            request.AppVersion,
            request.OperatingSystem,
            request.BrowserInfo,
            request.ScannerCapability,
            request.CameraCapability,
            request.OfflineCapability,
            device.CredentialReference,
            GetUserId());
        device.MarkSeen(GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);
        return MapDevice(device);
    }

    public async Task<MobileRuntimeContextDto> GetRuntimeContextAsync(string deviceCode, CancellationToken cancellationToken = default)
    {
        var device = await GetDeviceByCodeAsync(deviceCode, cancellationToken);
        var disabledReasons = GetDisabledReasons(device).ToArray();
        var queuedCount = await DbContext.MobileOfflineOperations.CountAsync(operation => operation.DeviceRegistrationId == device.Id && operation.Status == "Queued", cancellationToken);
        var failedCount = await DbContext.MobileOfflineOperations.CountAsync(operation => operation.DeviceRegistrationId == device.Id && operation.Status == "Failed", cancellationToken);
        var conflictCount = await DbContext.MobileOfflineOperations.CountAsync(operation => operation.DeviceRegistrationId == device.Id && operation.Status == "Conflict", cancellationToken);

        return new MobileRuntimeContextDto(
            MapDevice(device),
            device.IsTrusted && !device.IsRevoked,
            device.OfflineCapability && !device.IsRevoked,
            "LiveApi",
            await DbContext.MobileOfflineOperations
                .Where(operation => operation.DeviceRegistrationId == device.Id && operation.SyncedOn.HasValue)
                .MaxAsync(operation => (DateTimeOffset?)operation.SyncedOn, cancellationToken),
            queuedCount,
            failedCount,
            conflictCount,
            disabledReasons);
    }

    public async Task<IReadOnlyCollection<MobileTaskDto>> ListTasksAsync(string deviceCode, CancellationToken cancellationToken = default)
    {
        var device = await GetDeviceByCodeAsync(deviceCode, cancellationToken);
        EnsureContextAccess(device.CompanyId, device.BranchId);
        EnsureWarehouseAccess(device.WarehouseId);

        var shipmentTasks = await DbContext.Shipments.AsNoTracking()
            .Where(shipment => shipment.CompanyId == device.CompanyId && shipment.BranchId == device.BranchId)
            .Where(shipment => shipment.Status != "Delivered" && shipment.Status != "Closed" && shipment.Status != "Cancelled")
            .OrderByDescending(shipment => shipment.DispatchDate)
            .Take(10)
            .Select(shipment => new MobileTaskDto(
                $"shipment-{shipment.Id}",
                "Dispatch",
                "PickPackShipPod",
                shipment.ShipmentNo,
                shipment.Id,
                $"Shipment {shipment.ShipmentNo}",
                shipment.TrackingRef ?? shipment.VehicleRef ?? "Live dispatch task",
                shipment.Status,
                device.IsTrusted ? null : "Device approval is required before shipment/POD posting."))
            .ToListAsync(cancellationToken);

        var qualityTasks = await DbContext.InspectionRecords.AsNoTracking()
            .Where(record => record.CompanyId == device.CompanyId && record.BranchId == device.BranchId)
            .Where(record => record.Status != "Closed" && record.Status != "Released")
            .OrderByDescending(record => record.CreatedOn)
            .Take(10)
            .Select(record => new MobileTaskDto(
                $"inspection-{record.Id}",
                "Quality",
                "InspectionCapture",
                record.InspectionNo,
                record.Id,
                $"Inspection {record.InspectionNo}",
                record.SourceDocumentType,
                record.Status,
                device.IsTrusted ? null : "Device approval is required before inspection sync."))
            .ToListAsync(cancellationToken);

        var jobTasks = await DbContext.JobCards.AsNoTracking()
            .Where(job => job.CompanyId == device.CompanyId && job.BranchId == device.BranchId)
            .Where(job => job.Status != "Closed" && job.Status != "Completed")
            .OrderByDescending(job => job.CreatedOn)
            .Take(10)
            .Select(job => new MobileTaskDto(
                $"job-{job.Id}",
                "Production",
                "JobCardExecution",
                job.JobCardNo,
                job.Id,
                $"Job card {job.JobCardNo}",
                $"Planned {job.PlannedQuantity:0.###}, good {job.CompletedGoodQty:0.###}",
                job.Status,
                "Production mobile posting is queued and validated at sync; direct native execution adapters are not configured."))
            .ToListAsync(cancellationToken);

        var serviceTasks = await DbContext.ServiceTickets.AsNoTracking()
            .Where(ticket => ticket.CompanyId == device.CompanyId && ticket.BranchId == device.BranchId)
            .Where(ticket => ticket.Status != "Closed" && ticket.Status != "Cancelled")
            .OrderByDescending(ticket => ticket.CreatedOn)
            .Take(10)
            .Select(ticket => new MobileTaskDto(
                $"service-ticket-{ticket.Id}",
                "Service",
                "ServiceTicketJob",
                ticket.TicketNo,
                ticket.Id,
                $"Service ticket {ticket.TicketNo}",
                $"{ticket.Priority} / {ticket.EntitlementType} / {ticket.IssueCategory}",
                ticket.Status,
                device.IsTrusted ? null : "Device approval is required before service completion or spare posting."))
            .ToListAsync(cancellationToken);

        return shipmentTasks.Concat(qualityTasks).Concat(jobTasks).Concat(serviceTasks).ToArray();
    }

    public async Task<MobileScanResultDto> ResolveScanAsync(MobileScanResolveRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(
            Required(request.DeviceCode, nameof(request.DeviceCode), "Device code is required for scan audit."),
            Required(request.ScanValue, nameof(request.ScanValue), "Scan value is required."),
            Required(request.ScanSource, nameof(request.ScanSource), "Scan source must be Camera, Hardware, or Manual."),
            Required(request.ScanContext, nameof(request.ScanContext), "Scan context is required."));
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureWarehouseAccess(request.WarehouseId);

        var device = await GetDeviceByCodeAsync(request.DeviceCode, cancellationToken);
        if (device.IsRevoked)
        {
            throw new ValidationFailureException(new[]
            {
                new ApiError("mobile.device_revoked", nameof(request.DeviceCode), "Revoked devices cannot resolve scans.")
            });
        }

        var scanValue = request.ScanValue.Trim();
        var resolution = await ResolveEntityAsync(request.CompanyId, request.BranchId, request.WarehouseId, scanValue, cancellationToken);
        var timestamp = request.ScanTimestamp ?? DateTimeOffset.UtcNow;
        var scanEvent = MobileScanEvent.Create(
            request.CompanyId,
            request.BranchId,
            request.WarehouseId,
            device.Id,
            scanValue,
            request.ScanSource,
            request.ScanContext,
            timestamp,
            resolution.Status,
            resolution.Message,
            resolution.EntityType,
            resolution.EntityId,
            resolution.EntityCode,
            request.PayloadSnapshotJson,
            GetUserId());

        DbContext.MobileScanEvents.Add(scanEvent);
        await DbContext.SaveChangesAsync(cancellationToken);

        return new MobileScanResultDto(
            scanEvent.Id,
            scanEvent.ScanValue,
            scanEvent.ScanSource,
            scanEvent.ScanContext,
            scanEvent.ResolutionStatus,
            scanEvent.ValidationMessage,
            scanEvent.ResolvedEntityType,
            scanEvent.ResolvedEntityId,
            scanEvent.ResolvedEntityCode,
            scanEvent.ScanTimestamp);
    }

    public async Task<MobileOfflineOperationDto> QueueOfflineOperationAsync(MobileOfflineOperationRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(
            Required(request.DeviceCode, nameof(request.DeviceCode), "Device code is required."),
            Required(request.OperationType, nameof(request.OperationType), "Operation type is required."),
            Required(request.SourceModule, nameof(request.SourceModule), "Source module is required."),
            Required(request.PayloadSnapshotJson, nameof(request.PayloadSnapshotJson), "Payload snapshot is required."),
            Required(request.IdempotencyKey, nameof(request.IdempotencyKey), "Idempotency key is required."));
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureWarehouseAccess(request.WarehouseId);

        var device = await GetDeviceByCodeAsync(request.DeviceCode, cancellationToken);
        if (device.IsRevoked)
        {
            throw new ValidationFailureException(new[]
            {
                new ApiError("mobile.device_revoked", nameof(request.DeviceCode), "Revoked devices cannot queue offline work.")
            });
        }

        var existing = await DbContext.MobileOfflineOperations
            .SingleOrDefaultAsync(operation => operation.CompanyId == request.CompanyId && operation.IdempotencyKey == request.IdempotencyKey.Trim(), cancellationToken);
        if (existing is not null)
        {
            return MapOperation(existing);
        }

        var operation = MobileOfflineOperation.Create(
            request.CompanyId,
            request.BranchId,
            request.WarehouseId,
            device.Id,
            request.OperationType,
            request.SourceModule,
            request.PayloadSnapshotJson,
            request.IdempotencyKey,
            request.CreatedOfflineOn,
            GetUserId());
        DbContext.MobileOfflineOperations.Add(operation);
        await DbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditAsync("Mobile", nameof(MobileOfflineOperation), "mobile.offline.queued", operation.Id, null, MapOperation(operation), cancellationToken);
        return MapOperation(operation);
    }

    public async Task<IReadOnlyCollection<MobileOfflineOperationDto>> ListOfflineOperationsAsync(string deviceCode, CancellationToken cancellationToken = default)
    {
        var device = await GetDeviceByCodeAsync(deviceCode, cancellationToken);
        var operations = await DbContext.MobileOfflineOperations.AsNoTracking()
            .Where(operation => operation.DeviceRegistrationId == device.Id)
            .OrderByDescending(operation => operation.QueuedOn)
            .ToListAsync(cancellationToken);
        return operations.Select(MapOperation).ToArray();
    }

    public async Task<IReadOnlyCollection<MobileOfflineOperationDto>> SyncOfflineOperationsAsync(MobileOfflineSyncRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(Required(request.DeviceCode, nameof(request.DeviceCode), "Device code is required for sync."));
        var device = await GetDeviceByCodeAsync(request.DeviceCode, cancellationToken);
        var operationQuery = DbContext.MobileOfflineOperations
            .Where(operation => operation.DeviceRegistrationId == device.Id && operation.Status != "Synced" && operation.Status != "Cancelled");

        if (request.IdempotencyKeys.Count > 0)
        {
            operationQuery = operationQuery.Where(operation => request.IdempotencyKeys.Contains(operation.IdempotencyKey));
        }

        var operations = await operationQuery.OrderBy(operation => operation.QueuedOn).ToListAsync(cancellationToken);
        foreach (var operation in operations)
        {
            await SyncOperationAsync(device, operation, cancellationToken);
        }

        await DbContext.SaveChangesAsync(cancellationToken);
        return operations.Select(MapOperation).ToArray();
    }

    public async Task<IReadOnlyCollection<MobileSyncConflictDto>> ListSyncConflictsAsync(string deviceCode, CancellationToken cancellationToken = default)
    {
        var device = await GetDeviceByCodeAsync(deviceCode, cancellationToken);
        var operationIds = await DbContext.MobileOfflineOperations.AsNoTracking()
            .Where(operation => operation.DeviceRegistrationId == device.Id)
            .Select(operation => operation.Id)
            .ToArrayAsync(cancellationToken);

        var conflicts = await DbContext.MobileSyncConflicts.AsNoTracking()
            .Where(conflict => operationIds.Contains(conflict.MobileOfflineOperationId) && conflict.ResolutionStatus == "Open")
            .OrderByDescending(conflict => conflict.CreatedOn)
            .ToListAsync(cancellationToken);
        return conflicts.Select(MapConflict).ToArray();
    }

    public async Task<MobilePhotoEvidenceDto> CapturePhotoEvidenceAsync(MobilePhotoEvidenceRequest request, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(
            Required(request.DeviceCode, nameof(request.DeviceCode), "Device code is required for photo evidence."),
            Required(request.SourceModule, nameof(request.SourceModule), "Source module is required."),
            Required(request.SourceDocumentType, nameof(request.SourceDocumentType), "Source document type is required."),
            Required(request.EvidenceType, nameof(request.EvidenceType), "Evidence type is required."));
        EnsureContextAccess(request.CompanyId, request.BranchId);
        EnsureWarehouseAccess(request.WarehouseId);

        var device = await GetDeviceByCodeAsync(request.DeviceCode, cancellationToken);
        if (device.IsRevoked)
        {
            throw new ValidationFailureException(new[]
            {
                new ApiError("mobile.device_revoked", nameof(request.DeviceCode), "Revoked devices cannot capture or sync evidence.")
            });
        }

        var hasAttachment = request.AttachmentId.HasValue;
        var hasFileMetadata = !string.IsNullOrWhiteSpace(request.FileName) && !string.IsNullOrWhiteSpace(request.ContentType);
        if (!hasAttachment && !hasFileMetadata)
        {
            throw new ValidationFailureException(new[]
            {
                new ApiError("mobile.photo_missing_file", nameof(request.FileName), "Photo evidence must include an attachment reference or pending upload file metadata.")
            });
        }

        var status = hasAttachment ? "Uploaded" : "PendingUpload";
        var failureReason = hasAttachment ? null : "Binary upload is pending; evidence metadata is recorded but not treated as uploaded.";
        var evidence = MobilePhotoEvidence.Create(
            request.CompanyId,
            request.BranchId,
            request.WarehouseId,
            device.Id,
            request.SourceModule,
            request.SourceDocumentType,
            request.SourceDocumentId,
            request.SourceDocumentNo,
            request.EvidenceType,
            request.FileName,
            request.ContentType,
            request.AttachmentId,
            request.CapturedOn ?? DateTimeOffset.UtcNow,
            status,
            failureReason,
            request.MetadataJson,
            GetUserId());

        DbContext.MobilePhotoEvidence.Add(evidence);
        await DbContext.SaveChangesAsync(cancellationToken);
        return MapEvidence(evidence);
    }

    private async Task SyncOperationAsync(MobileDeviceRegistration device, MobileOfflineOperation operation, CancellationToken cancellationToken)
    {
        operation.MarkSyncing(GetUserId());
        if (device.IsRevoked)
        {
            await MarkConflictAsync(operation, "DeviceTrust", "Device was revoked before sync; operation was not posted.", cancellationToken);
            return;
        }

        if (RequiresTrustedDevice(operation.OperationType) && !device.IsTrusted)
        {
            await MarkConflictAsync(operation, "DeviceTrust", "Device approval is required before mobile stock, quality, dispatch, or POD posting.", cancellationToken);
            return;
        }

        MobileStockSyncPayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<MobileStockSyncPayload>(operation.PayloadSnapshotJson, JsonOptions);
        }
        catch (JsonException ex)
        {
            operation.MarkFailed($"Invalid offline payload JSON: {ex.Message}", GetUserId());
            return;
        }

        if (payload?.MovementValidation is not null)
        {
            var validation = await inventoryPolicyService.ValidateMovementAsync(payload.MovementValidation, cancellationToken);
            if (!validation.IsValid)
            {
                var reason = validation.Errors.FirstOrDefault()?.Message
                    ?? validation.Lines.SelectMany(line => line.Errors).FirstOrDefault()?.Message
                    ?? "Inventory tracking validation failed during mobile sync.";
                await MarkConflictAsync(operation, "InventoryValidation", reason, cancellationToken);
                return;
            }
        }

        if (IsStockOperation(operation.OperationType) && payload?.MovementValidation is null && payload?.StockIssueRequest is null && payload?.StockReturnRequest is null && payload?.StockTransferRequest is null)
        {
            await MarkConflictAsync(operation, "InventoryValidation", "Mobile stock operation must carry a movement validation payload or stock posting request.", cancellationToken);
            return;
        }

        if (IsPodOperation(operation.OperationType) && !IsShipmentStatusEligibleForPod(payload?.ShipmentStatus))
        {
            await MarkConflictAsync(operation, "DispatchPod", "POD cannot sync before the shipment is shipped or dispatched.", cancellationToken);
            return;
        }

        if (payload?.StockIssueRequest is not null)
        {
            var transactions = await inventoryService.IssueStockAsync(payload.StockIssueRequest, cancellationToken);
            var first = transactions.FirstOrDefault();
            operation.MarkSynced("StockIssue", first?.Id, first?.TransactionNo, GetUserId());
            return;
        }

        if (payload?.StockReturnRequest is not null)
        {
            var transactions = await inventoryService.ReturnStockAsync(payload.StockReturnRequest, cancellationToken);
            var first = transactions.FirstOrDefault();
            operation.MarkSynced("StockReturn", first?.Id, first?.TransactionNo, GetUserId());
            return;
        }

        if (payload?.StockTransferRequest is not null)
        {
            var transactions = await inventoryService.TransferStockAsync(payload.StockTransferRequest, cancellationToken);
            var first = transactions.FirstOrDefault();
            operation.MarkSynced("StockTransfer", first?.Id, first?.TransactionNo, GetUserId());
            return;
        }

        operation.MarkSynced("MobileOperation", null, operation.IdempotencyKey, GetUserId());
    }

    private async Task MarkConflictAsync(MobileOfflineOperation operation, string conflictType, string reason, CancellationToken cancellationToken)
    {
        operation.MarkConflict(reason, GetUserId());
        DbContext.MobileSyncConflicts.Add(MobileSyncConflict.Create(
            operation.CompanyId ?? 0,
            operation.BranchId ?? 0,
            operation.Id,
            conflictType,
            reason,
            operation.PayloadSnapshotJson,
            null,
            GetUserId()));
        await DbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<MobileDeviceRegistration> GetDeviceByCodeAsync(string deviceCode, CancellationToken cancellationToken)
    {
        var normalized = Normalize(deviceCode);
        if (normalized is null)
        {
            throw new ValidationFailureException(new[]
            {
                new ApiError("validation.required", nameof(deviceCode), "Device code is required.")
            });
        }

        var device = await DbContext.MobileDeviceRegistrations.SingleOrDefaultAsync(record => record.DeviceCode == normalized, cancellationToken);
        return EnsureFound(device, "Mobile device registration was not found.", "mobile.device_not_found");
    }

    private async Task<ScanResolution> ResolveEntityAsync(long companyId, long branchId, long? warehouseId, string scanValue, CancellationToken cancellationToken)
    {
        var barcode = await DbContext.ItemBarcodes.AsNoTracking()
            .Where(record => record.CompanyId == companyId && record.BarcodeValue == scanValue && record.Status == "Active")
            .Select(record => new { record.Id, record.ItemId, record.BarcodeValue })
            .SingleOrDefaultAsync(cancellationToken);
        if (barcode is not null)
        {
            return new ScanResolution("Resolved", null, "Item", barcode.ItemId, barcode.BarcodeValue);
        }

        var parsed = ParsePrefixedScan(scanValue);
        if (parsed is null)
        {
            return new ScanResolution("NotFound", "Barcode did not resolve to a unique live ERP record.", null, null, null);
        }

        var value = parsed.Value.Value;
        switch (parsed.Value.Type)
        {
            case "BIN":
            {
                var bin = await DbContext.Bins.AsNoTracking()
                    .Where(record => record.CompanyId == companyId && record.BranchId == branchId && record.BinCode == value)
                    .Where(record => !warehouseId.HasValue || record.WarehouseId == warehouseId.Value)
                    .Select(record => new { record.Id, record.BinCode, record.Status, record.IsBlocked })
                    .SingleOrDefaultAsync(cancellationToken);
                return bin is null
                    ? new ScanResolution("NotFound", "Bin barcode was not found in the selected warehouse scope.", null, null, null)
                    : bin.Status != "Active" || bin.IsBlocked
                        ? new ScanResolution("Blocked", "Bin is inactive or blocked and cannot be selected.", "Bin", bin.Id, bin.BinCode)
                        : new ScanResolution("Resolved", null, "Bin", bin.Id, bin.BinCode);
            }

            case "LOT":
            {
                var lot = await DbContext.Lots.AsNoTracking()
                    .Where(record => record.CompanyId == companyId && record.LotNo == value)
                    .Select(record => new { record.Id, record.LotNo, record.LotStatus })
                    .SingleOrDefaultAsync(cancellationToken);
                return lot is null
                    ? new ScanResolution("NotFound", "Lot barcode was not found.", null, null, null)
                    : lot.LotStatus is "Blocked" or "QC_Hold" or "Expired"
                        ? new ScanResolution("Blocked", $"Lot status {lot.LotStatus} cannot be used without release.", "Lot", lot.Id, lot.LotNo)
                        : new ScanResolution("Resolved", null, "Lot", lot.Id, lot.LotNo);
            }

            case "SERIAL":
            {
                var serial = await DbContext.Serials.AsNoTracking()
                    .Where(record => record.CompanyId == companyId && record.SerialNo == value)
                    .Select(record => new { record.Id, record.SerialNo, record.SerialStatus })
                    .SingleOrDefaultAsync(cancellationToken);
                return serial is null
                    ? new ScanResolution("NotFound", "Serial barcode was not found.", null, null, null)
                    : serial.SerialStatus is "Blocked" or "QC_Hold" or "Consumed" or "Shipped"
                        ? new ScanResolution("Blocked", $"Serial status {serial.SerialStatus} cannot be used for this mobile transaction.", "Serial", serial.Id, serial.SerialNo)
                        : new ScanResolution("Resolved", null, "Serial", serial.Id, serial.SerialNo);
            }

            case "PCID":
            case "LP":
            {
                var pcid = await DbContext.InventoryLicensePlates.AsNoTracking()
                    .Where(record => record.CompanyId == companyId && record.PcidNo == value)
                    .Select(record => new { record.Id, record.PcidNo, record.Status })
                    .SingleOrDefaultAsync(cancellationToken);
                return pcid is null
                    ? new ScanResolution("NotFound", "PCID/license plate was not found.", null, null, null)
                    : pcid.Status is "Blocked" or "QC_Hold" or "Closed" or "Shipped"
                        ? new ScanResolution("Blocked", $"PCID status {pcid.Status} cannot be moved or dispatched.", "PCID", pcid.Id, pcid.PcidNo)
                        : new ScanResolution("Resolved", null, "PCID", pcid.Id, pcid.PcidNo);
            }

            case "SHIP":
            {
                var shipment = await DbContext.Shipments.AsNoTracking()
                    .Where(record => record.CompanyId == companyId && record.BranchId == branchId && record.ShipmentNo == value)
                    .Select(record => new { record.Id, record.ShipmentNo, record.Status })
                    .SingleOrDefaultAsync(cancellationToken);
                return shipment is null
                    ? new ScanResolution("NotFound", "Shipment barcode was not found.", null, null, null)
                    : new ScanResolution("Resolved", $"Shipment status: {shipment.Status}.", "Shipment", shipment.Id, shipment.ShipmentNo);
            }

            case "JOB":
            {
                var job = await DbContext.JobCards.AsNoTracking()
                    .Where(record => record.CompanyId == companyId && record.BranchId == branchId && record.JobCardNo == value)
                    .Select(record => new { record.Id, record.JobCardNo, record.Status })
                    .SingleOrDefaultAsync(cancellationToken);
                return job is null
                    ? new ScanResolution("NotFound", "Job card barcode was not found.", null, null, null)
                    : new ScanResolution("Resolved", $"Job card status: {job.Status}.", "JobCard", job.Id, job.JobCardNo);
            }

            case "INSPECTION":
            {
                var inspection = await DbContext.InspectionRecords.AsNoTracking()
                    .Where(record => record.CompanyId == companyId && record.BranchId == branchId && record.InspectionNo == value)
                    .Select(record => new { record.Id, record.InspectionNo, record.Status })
                    .SingleOrDefaultAsync(cancellationToken);
                return inspection is null
                    ? new ScanResolution("NotFound", "Inspection barcode was not found.", null, null, null)
                    : new ScanResolution("Resolved", $"Inspection status: {inspection.Status}.", "Inspection", inspection.Id, inspection.InspectionNo);
            }

            case "SERVICE":
            case "TICKET":
            {
                var ticket = await DbContext.ServiceTickets.AsNoTracking()
                    .Where(record => record.CompanyId == companyId && record.BranchId == branchId && record.TicketNo == value)
                    .Select(record => new { record.Id, record.TicketNo, record.Status })
                    .SingleOrDefaultAsync(cancellationToken);
                return ticket is null
                    ? new ScanResolution("NotFound", "Service ticket barcode was not found.", null, null, null)
                    : new ScanResolution("Resolved", $"Service ticket status: {ticket.Status}.", "ServiceTicket", ticket.Id, ticket.TicketNo);
            }
        }

        return new ScanResolution("NotFound", "Barcode prefix is not supported by the mobile runtime.", null, null, null);
    }

    private static (string Type, string Value)? ParsePrefixedScan(string scanValue)
    {
        var separator = scanValue.IndexOf(':', StringComparison.Ordinal);
        if (separator <= 0 || separator >= scanValue.Length - 1)
        {
            return null;
        }

        return (scanValue[..separator].Trim().ToUpperInvariant(), scanValue[(separator + 1)..].Trim());
    }

    private static bool RequiresTrustedDevice(string operationType) =>
        operationType.Contains("Stock", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Inventory", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Issue", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Return", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Transfer", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Dispatch", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Pod", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Quality", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Inspection", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Ncr", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Service", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Warranty", StringComparison.OrdinalIgnoreCase);

    private static bool IsStockOperation(string operationType) =>
        operationType.Contains("Stock", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Inventory", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Issue", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Return", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Transfer", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Pick", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("Ship", StringComparison.OrdinalIgnoreCase);

    private static bool IsPodOperation(string operationType) =>
        operationType.Contains("Pod", StringComparison.OrdinalIgnoreCase)
        || operationType.Contains("ProofOfDelivery", StringComparison.OrdinalIgnoreCase);

    private static bool IsShipmentStatusEligibleForPod(string? status) =>
        status is not null
        && (status.Equals("Shipped", StringComparison.OrdinalIgnoreCase)
            || status.Equals("Dispatched", StringComparison.OrdinalIgnoreCase)
            || status.Equals("Delivered", StringComparison.OrdinalIgnoreCase));

    private static IEnumerable<string> GetDisabledReasons(MobileDeviceRegistration device)
    {
        if (device.IsRevoked)
        {
            yield return "Device is revoked; sync and posting are blocked.";
        }

        if (!device.IsTrusted)
        {
            yield return "Device is not trusted; stock, quality, dispatch, and POD posting require approval.";
        }

        if (device.ScannerCapability.Equals("ManualOnly", StringComparison.OrdinalIgnoreCase))
        {
            yield return "Camera barcode scanning is not available; manual entry is labelled as manual fallback.";
        }

        if (device.CameraCapability.Equals("Unavailable", StringComparison.OrdinalIgnoreCase))
        {
            yield return "Photo capture is unavailable; evidence can only be queued as pending upload metadata.";
        }
    }

    private static void ValidateDeviceRequest(MobileDeviceRegistrationRequest request)
    {
        ThrowIfInvalid(
            Required(request.DeviceCode, nameof(request.DeviceCode), "Device code is required."),
            Required(request.DeviceName, nameof(request.DeviceName), "Device name is required."),
            Required(request.Platform, nameof(request.Platform), "Platform is required."),
            Required(request.RuntimeName, nameof(request.RuntimeName), "Runtime name is required."),
            Required(request.ScannerCapability, nameof(request.ScannerCapability), "Scanner capability is required."),
            Required(request.CameraCapability, nameof(request.CameraCapability), "Camera capability is required."),
            string.IsNullOrWhiteSpace(request.CredentialReference) || request.CredentialReference.StartsWith("secret://", StringComparison.OrdinalIgnoreCase)
                ? null
                : new ApiError("mobile.raw_secret_rejected", nameof(request.CredentialReference), "Mobile credential fields must store only a credential reference such as secret://mobile/device-key."));
    }

    private static MobileDeviceRegistrationDto MapDevice(MobileDeviceRegistration entity)
    {
        var disabledReason = entity.IsRevoked
            ? "Device is revoked; sync and posting are blocked."
            : entity.IsTrusted
                ? null
                : "Device approval is required before stock, quality, dispatch, or POD posting.";

        return new MobileDeviceRegistrationDto(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.WarehouseId,
            entity.DeviceCode,
            entity.DeviceName,
            entity.UserId,
            entity.AssignedUserName,
            entity.Platform,
            entity.RuntimeName,
            entity.AppVersion,
            entity.ScannerCapability,
            entity.CameraCapability,
            entity.OfflineCapability,
            entity.TrustStatus,
            entity.IsTrusted,
            entity.IsRevoked,
            entity.LastSeenOn,
            entity.Status,
            disabledReason);
    }

    private static MobileOfflineOperationDto MapOperation(MobileOfflineOperation entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.WarehouseId,
            entity.DeviceRegistrationId,
            entity.OperationType,
            entity.SourceModule,
            entity.IdempotencyKey,
            entity.CreatedOfflineOn,
            entity.QueuedOn,
            entity.SyncAttemptedOn,
            entity.SyncedOn,
            entity.Status,
            entity.AttemptCount,
            entity.FailureReason,
            entity.ConflictReason,
            entity.ServerReferenceType,
            entity.ServerReferenceId,
            entity.ServerReferenceNo);

    private static MobileSyncConflictDto MapConflict(MobileSyncConflict entity) =>
        new(entity.Id, entity.MobileOfflineOperationId, entity.ConflictType, entity.ConflictReason, entity.ResolutionStatus, entity.CreatedOn);

    private static MobilePhotoEvidenceDto MapEvidence(MobilePhotoEvidence entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.BranchId ?? 0,
            entity.WarehouseId,
            entity.DeviceRegistrationId,
            entity.SourceModule,
            entity.SourceDocumentType,
            entity.SourceDocumentId,
            entity.SourceDocumentNo,
            entity.EvidenceType,
            entity.FileName,
            entity.ContentType,
            entity.AttachmentId,
            entity.CapturedOn,
            entity.UploadStatus,
            entity.FailureReason,
            entity.MetadataJson);

    private sealed record ScanResolution(string Status, string? Message, string? EntityType, long? EntityId, string? EntityCode);
}
