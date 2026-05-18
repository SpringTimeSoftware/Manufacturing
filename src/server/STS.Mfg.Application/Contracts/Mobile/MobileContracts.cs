using STS.Mfg.Application.Contracts.Inventory;

namespace STS.Mfg.Application.Contracts.Mobile;

public sealed record MobileDeviceRegistrationRequest(
    long CompanyId,
    long BranchId,
    long? WarehouseId,
    string DeviceCode,
    string DeviceName,
    string Platform,
    string RuntimeName,
    string? AppVersion,
    string? OperatingSystem,
    string? BrowserInfo,
    string ScannerCapability,
    string CameraCapability,
    bool OfflineCapability,
    string? CredentialReference,
    bool RequestTrust);

public sealed record MobileDeviceHeartbeatRequest(
    string DeviceCode,
    string? AppVersion,
    string? OperatingSystem,
    string? BrowserInfo,
    string ScannerCapability,
    string CameraCapability,
    bool OfflineCapability);

public sealed record MobileDeviceRegistrationDto(
    long Id,
    long CompanyId,
    long BranchId,
    long? WarehouseId,
    string DeviceCode,
    string DeviceName,
    long? UserId,
    string? AssignedUserName,
    string Platform,
    string RuntimeName,
    string? AppVersion,
    string ScannerCapability,
    string CameraCapability,
    bool OfflineCapability,
    string TrustStatus,
    bool IsTrusted,
    bool IsRevoked,
    DateTimeOffset? LastSeenOn,
    string Status,
    string? DisabledReason);

public sealed record MobileRuntimeContextDto(
    MobileDeviceRegistrationDto Device,
    bool CanPostStock,
    bool CanWorkOffline,
    string OnlineMode,
    DateTimeOffset? LastSyncAt,
    int QueuedCount,
    int FailedCount,
    int ConflictCount,
    IReadOnlyCollection<string> DisabledReasons);

public sealed record MobileTaskDto(
    string Id,
    string Module,
    string TaskType,
    string DocumentNo,
    long? SourceDocumentId,
    string Title,
    string Subtitle,
    string Status,
    string? DisabledReason);

public sealed record MobileScanResolveRequest(
    long CompanyId,
    long BranchId,
    long? WarehouseId,
    string DeviceCode,
    string ScanValue,
    string ScanSource,
    string ScanContext,
    DateTimeOffset? ScanTimestamp,
    string? PayloadSnapshotJson = null);

public sealed record MobileScanResultDto(
    long ScanEventId,
    string ScanValue,
    string ScanSource,
    string ScanContext,
    string ResolutionStatus,
    string? ValidationMessage,
    string? ResolvedEntityType,
    long? ResolvedEntityId,
    string? ResolvedEntityCode,
    DateTimeOffset ScanTimestamp);

public sealed record MobileOfflineOperationRequest(
    long CompanyId,
    long BranchId,
    long? WarehouseId,
    string DeviceCode,
    string OperationType,
    string SourceModule,
    string PayloadSnapshotJson,
    string IdempotencyKey,
    DateTimeOffset CreatedOfflineOn);

public sealed record MobileOfflineSyncRequest(
    string DeviceCode,
    IReadOnlyCollection<string> IdempotencyKeys);

public sealed record MobileOfflineOperationDto(
    long Id,
    long CompanyId,
    long BranchId,
    long? WarehouseId,
    long DeviceRegistrationId,
    string OperationType,
    string SourceModule,
    string IdempotencyKey,
    DateTimeOffset CreatedOfflineOn,
    DateTimeOffset QueuedOn,
    DateTimeOffset? SyncAttemptedOn,
    DateTimeOffset? SyncedOn,
    string Status,
    int AttemptCount,
    string? FailureReason,
    string? ConflictReason,
    string? ServerReferenceType,
    long? ServerReferenceId,
    string? ServerReferenceNo);

public sealed record MobileSyncConflictDto(
    long Id,
    long MobileOfflineOperationId,
    string ConflictType,
    string ConflictReason,
    string ResolutionStatus,
    DateTimeOffset CreatedOn);

public sealed record MobilePhotoEvidenceRequest(
    long CompanyId,
    long BranchId,
    long? WarehouseId,
    string DeviceCode,
    string SourceModule,
    string SourceDocumentType,
    long? SourceDocumentId,
    string? SourceDocumentNo,
    string EvidenceType,
    string? FileName,
    string? ContentType,
    long? AttachmentId,
    DateTimeOffset? CapturedOn,
    string? MetadataJson);

public sealed record MobilePhotoEvidenceDto(
    long Id,
    long CompanyId,
    long BranchId,
    long? WarehouseId,
    long DeviceRegistrationId,
    string SourceModule,
    string SourceDocumentType,
    long? SourceDocumentId,
    string? SourceDocumentNo,
    string EvidenceType,
    string? FileName,
    string? ContentType,
    long? AttachmentId,
    DateTimeOffset CapturedOn,
    string UploadStatus,
    string? FailureReason,
    string? MetadataJson);

public sealed record MobileStockSyncPayload(
    StockMovementValidationRequest? MovementValidation,
    StockIssueRequest? StockIssueRequest,
    StockReturnRequest? StockReturnRequest,
    StockTransferRequest? StockTransferRequest,
    string? ShipmentStatus,
    string? PodReceivedBy,
    DateTimeOffset? PodReceivedOn,
    string? PodRemarks);
