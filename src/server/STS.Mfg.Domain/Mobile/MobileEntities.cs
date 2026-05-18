using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Mobile;

public sealed class MobileDeviceRegistration : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private MobileDeviceRegistration()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId { get; private set; }
    public string DeviceCode { get; private set; } = string.Empty;
    public string DeviceName { get; private set; } = string.Empty;
    public long? UserId { get; private set; }
    public string? AssignedUserName { get; private set; }
    public string Platform { get; private set; } = string.Empty;
    public string RuntimeName { get; private set; } = string.Empty;
    public string? AppVersion { get; private set; }
    public string? OperatingSystem { get; private set; }
    public string? BrowserInfo { get; private set; }
    public string ScannerCapability { get; private set; } = string.Empty;
    public string CameraCapability { get; private set; } = string.Empty;
    public bool OfflineCapability { get; private set; }
    public string TrustStatus { get; private set; } = string.Empty;
    public bool IsTrusted { get; private set; }
    public bool IsRevoked { get; private set; }
    public long? ApprovedByUserId { get; private set; }
    public DateTimeOffset? ApprovedOn { get; private set; }
    public long? RevokedByUserId { get; private set; }
    public DateTimeOffset? RevokedOn { get; private set; }
    public DateTimeOffset? LastSeenOn { get; private set; }
    public string? CredentialReference { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static MobileDeviceRegistration Create(
        long companyId,
        long branchId,
        long? warehouseId,
        string deviceCode,
        string deviceName,
        long? userId,
        string? assignedUserName,
        string platform,
        string runtimeName,
        string? appVersion,
        string? operatingSystem,
        string? browserInfo,
        string scannerCapability,
        string cameraCapability,
        bool offlineCapability,
        string? credentialReference,
        bool requestTrust,
        long? actorUserId)
    {
        var entity = new MobileDeviceRegistration
        {
            CompanyId = companyId,
            BranchId = branchId,
            WarehouseId = warehouseId,
            DeviceCode = deviceCode.Trim(),
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = actorUserId
        };

        entity.UpdateProfile(
            deviceName,
            userId,
            assignedUserName,
            platform,
            runtimeName,
            appVersion,
            operatingSystem,
            browserInfo,
            scannerCapability,
            cameraCapability,
            offlineCapability,
            credentialReference,
            actorUserId);

        if (requestTrust)
        {
            entity.Approve(actorUserId);
        }
        else
        {
            entity.TrustStatus = "Pending";
            entity.IsTrusted = false;
            entity.Status = "Pending";
        }

        entity.MarkSeen(actorUserId);
        return entity;
    }

    public void UpdateProfile(
        string deviceName,
        long? userId,
        string? assignedUserName,
        string platform,
        string runtimeName,
        string? appVersion,
        string? operatingSystem,
        string? browserInfo,
        string scannerCapability,
        string cameraCapability,
        bool offlineCapability,
        string? credentialReference,
        long? actorUserId)
    {
        DeviceName = deviceName.Trim();
        UserId = userId;
        AssignedUserName = Normalize(assignedUserName);
        Platform = platform.Trim();
        RuntimeName = runtimeName.Trim();
        AppVersion = Normalize(appVersion);
        OperatingSystem = Normalize(operatingSystem);
        BrowserInfo = Normalize(browserInfo);
        ScannerCapability = scannerCapability.Trim();
        CameraCapability = cameraCapability.Trim();
        OfflineCapability = offlineCapability;
        CredentialReference = Normalize(credentialReference);
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = actorUserId;
    }

    public void Approve(long? actorUserId)
    {
        TrustStatus = "Trusted";
        IsTrusted = true;
        IsRevoked = false;
        ApprovedByUserId = actorUserId;
        ApprovedOn = DateTimeOffset.UtcNow;
        Status = "Active";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = actorUserId;
    }

    public void Revoke(long? actorUserId)
    {
        TrustStatus = "Revoked";
        IsTrusted = false;
        IsRevoked = true;
        RevokedByUserId = actorUserId;
        RevokedOn = DateTimeOffset.UtcNow;
        Status = "Revoked";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = actorUserId;
    }

    public void MarkSeen(long? actorUserId)
    {
        LastSeenOn = DateTimeOffset.UtcNow;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = actorUserId;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed class MobileOfflineOperation : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private MobileOfflineOperation()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId { get; private set; }
    public long DeviceRegistrationId { get; private set; }
    public string OperationType { get; private set; } = string.Empty;
    public string SourceModule { get; private set; } = string.Empty;
    public string PayloadSnapshotJson { get; private set; } = string.Empty;
    public string IdempotencyKey { get; private set; } = string.Empty;
    public DateTimeOffset CreatedOfflineOn { get; private set; }
    public DateTimeOffset QueuedOn { get; private set; }
    public DateTimeOffset? SyncAttemptedOn { get; private set; }
    public DateTimeOffset? SyncedOn { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public int AttemptCount { get; private set; }
    public string? FailureReason { get; private set; }
    public string? ConflictReason { get; private set; }
    public string? ServerReferenceType { get; private set; }
    public long? ServerReferenceId { get; private set; }
    public string? ServerReferenceNo { get; private set; }

    public static MobileOfflineOperation Create(
        long companyId,
        long branchId,
        long? warehouseId,
        long deviceRegistrationId,
        string operationType,
        string sourceModule,
        string payloadSnapshotJson,
        string idempotencyKey,
        DateTimeOffset createdOfflineOn,
        long? actorUserId)
    {
        var now = DateTimeOffset.UtcNow;
        return new MobileOfflineOperation
        {
            CompanyId = companyId,
            BranchId = branchId,
            WarehouseId = warehouseId,
            DeviceRegistrationId = deviceRegistrationId,
            OperationType = operationType.Trim(),
            SourceModule = sourceModule.Trim(),
            PayloadSnapshotJson = payloadSnapshotJson,
            IdempotencyKey = idempotencyKey.Trim(),
            CreatedOfflineOn = createdOfflineOn,
            QueuedOn = now,
            Status = "Queued",
            CreatedOn = now,
            CreatedByUserId = actorUserId,
            ModifiedOn = now,
            ModifiedByUserId = actorUserId
        };
    }

    public void MarkSyncing(long? actorUserId)
    {
        AttemptCount += 1;
        SyncAttemptedOn = DateTimeOffset.UtcNow;
        Status = "Syncing";
        FailureReason = null;
        ConflictReason = null;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = actorUserId;
    }

    public void MarkSynced(string serverReferenceType, long? serverReferenceId, string? serverReferenceNo, long? actorUserId)
    {
        Status = "Synced";
        SyncedOn = DateTimeOffset.UtcNow;
        ServerReferenceType = serverReferenceType.Trim();
        ServerReferenceId = serverReferenceId;
        ServerReferenceNo = string.IsNullOrWhiteSpace(serverReferenceNo) ? null : serverReferenceNo.Trim();
        FailureReason = null;
        ConflictReason = null;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = actorUserId;
    }

    public void MarkFailed(string failureReason, long? actorUserId)
    {
        Status = "Failed";
        FailureReason = failureReason.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = actorUserId;
    }

    public void MarkConflict(string conflictReason, long? actorUserId)
    {
        Status = "Conflict";
        ConflictReason = conflictReason.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = actorUserId;
    }
}

public sealed class MobileSyncConflict : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private MobileSyncConflict()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long MobileOfflineOperationId { get; private set; }
    public string ConflictType { get; private set; } = string.Empty;
    public string ConflictReason { get; private set; } = string.Empty;
    public string? LocalPayloadJson { get; private set; }
    public string? ServerPayloadJson { get; private set; }
    public string ResolutionStatus { get; private set; } = string.Empty;
    public long? ResolvedByUserId { get; private set; }
    public DateTimeOffset? ResolvedOn { get; private set; }

    public static MobileSyncConflict Create(
        long companyId,
        long branchId,
        long mobileOfflineOperationId,
        string conflictType,
        string conflictReason,
        string? localPayloadJson,
        string? serverPayloadJson,
        long? actorUserId)
    {
        var now = DateTimeOffset.UtcNow;
        return new MobileSyncConflict
        {
            CompanyId = companyId,
            BranchId = branchId,
            MobileOfflineOperationId = mobileOfflineOperationId,
            ConflictType = conflictType.Trim(),
            ConflictReason = conflictReason.Trim(),
            LocalPayloadJson = localPayloadJson,
            ServerPayloadJson = serverPayloadJson,
            ResolutionStatus = "Open",
            CreatedOn = now,
            CreatedByUserId = actorUserId,
            ModifiedOn = now,
            ModifiedByUserId = actorUserId
        };
    }
}

public sealed class MobileScanEvent : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private MobileScanEvent()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId { get; private set; }
    public long DeviceRegistrationId { get; private set; }
    public string ScanValue { get; private set; } = string.Empty;
    public string ScanSource { get; private set; } = string.Empty;
    public string ScanContext { get; private set; } = string.Empty;
    public DateTimeOffset ScanTimestamp { get; private set; }
    public string? ResolvedEntityType { get; private set; }
    public long? ResolvedEntityId { get; private set; }
    public string? ResolvedEntityCode { get; private set; }
    public string ResolutionStatus { get; private set; } = string.Empty;
    public string? ValidationMessage { get; private set; }
    public string? PayloadSnapshotJson { get; private set; }

    public static MobileScanEvent Create(
        long companyId,
        long branchId,
        long? warehouseId,
        long deviceRegistrationId,
        string scanValue,
        string scanSource,
        string scanContext,
        DateTimeOffset scanTimestamp,
        string resolutionStatus,
        string? validationMessage,
        string? resolvedEntityType,
        long? resolvedEntityId,
        string? resolvedEntityCode,
        string? payloadSnapshotJson,
        long? actorUserId)
    {
        var now = DateTimeOffset.UtcNow;
        return new MobileScanEvent
        {
            CompanyId = companyId,
            BranchId = branchId,
            WarehouseId = warehouseId,
            DeviceRegistrationId = deviceRegistrationId,
            ScanValue = scanValue.Trim(),
            ScanSource = scanSource.Trim(),
            ScanContext = scanContext.Trim(),
            ScanTimestamp = scanTimestamp,
            ResolutionStatus = resolutionStatus.Trim(),
            ValidationMessage = string.IsNullOrWhiteSpace(validationMessage) ? null : validationMessage.Trim(),
            ResolvedEntityType = string.IsNullOrWhiteSpace(resolvedEntityType) ? null : resolvedEntityType.Trim(),
            ResolvedEntityId = resolvedEntityId,
            ResolvedEntityCode = string.IsNullOrWhiteSpace(resolvedEntityCode) ? null : resolvedEntityCode.Trim(),
            PayloadSnapshotJson = payloadSnapshotJson,
            CreatedOn = now,
            CreatedByUserId = actorUserId,
            ModifiedOn = now,
            ModifiedByUserId = actorUserId
        };
    }
}

public sealed class MobilePhotoEvidence : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private MobilePhotoEvidence()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId { get; private set; }
    public long DeviceRegistrationId { get; private set; }
    public string SourceModule { get; private set; } = string.Empty;
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long? SourceDocumentId { get; private set; }
    public string? SourceDocumentNo { get; private set; }
    public string EvidenceType { get; private set; } = string.Empty;
    public string? FileName { get; private set; }
    public string? ContentType { get; private set; }
    public long? AttachmentId { get; private set; }
    public DateTimeOffset CapturedOn { get; private set; }
    public string UploadStatus { get; private set; } = string.Empty;
    public string? FailureReason { get; private set; }
    public string? MetadataJson { get; private set; }

    public static MobilePhotoEvidence Create(
        long companyId,
        long branchId,
        long? warehouseId,
        long deviceRegistrationId,
        string sourceModule,
        string sourceDocumentType,
        long? sourceDocumentId,
        string? sourceDocumentNo,
        string evidenceType,
        string? fileName,
        string? contentType,
        long? attachmentId,
        DateTimeOffset capturedOn,
        string uploadStatus,
        string? failureReason,
        string? metadataJson,
        long? actorUserId)
    {
        var now = DateTimeOffset.UtcNow;
        return new MobilePhotoEvidence
        {
            CompanyId = companyId,
            BranchId = branchId,
            WarehouseId = warehouseId,
            DeviceRegistrationId = deviceRegistrationId,
            SourceModule = sourceModule.Trim(),
            SourceDocumentType = sourceDocumentType.Trim(),
            SourceDocumentId = sourceDocumentId,
            SourceDocumentNo = string.IsNullOrWhiteSpace(sourceDocumentNo) ? null : sourceDocumentNo.Trim(),
            EvidenceType = evidenceType.Trim(),
            FileName = string.IsNullOrWhiteSpace(fileName) ? null : fileName.Trim(),
            ContentType = string.IsNullOrWhiteSpace(contentType) ? null : contentType.Trim(),
            AttachmentId = attachmentId,
            CapturedOn = capturedOn,
            UploadStatus = uploadStatus.Trim(),
            FailureReason = string.IsNullOrWhiteSpace(failureReason) ? null : failureReason.Trim(),
            MetadataJson = metadataJson,
            CreatedOn = now,
            CreatedByUserId = actorUserId,
            ModifiedOn = now,
            ModifiedByUserId = actorUserId
        };
    }
}
