using STS.Mfg.Application.Contracts.Mobile;

namespace STS.Mfg.Application.Abstractions.Mobile;

public interface IMobileRuntimeService
{
    Task<MobileDeviceRegistrationDto> RegisterDeviceAsync(MobileDeviceRegistrationRequest request, CancellationToken cancellationToken = default);
    Task<MobileDeviceRegistrationDto> HeartbeatAsync(MobileDeviceHeartbeatRequest request, CancellationToken cancellationToken = default);
    Task<MobileRuntimeContextDto> GetRuntimeContextAsync(string deviceCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<MobileTaskDto>> ListTasksAsync(string deviceCode, CancellationToken cancellationToken = default);
    Task<MobileScanResultDto> ResolveScanAsync(MobileScanResolveRequest request, CancellationToken cancellationToken = default);
    Task<MobileOfflineOperationDto> QueueOfflineOperationAsync(MobileOfflineOperationRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<MobileOfflineOperationDto>> ListOfflineOperationsAsync(string deviceCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<MobileOfflineOperationDto>> SyncOfflineOperationsAsync(MobileOfflineSyncRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<MobileSyncConflictDto>> ListSyncConflictsAsync(string deviceCode, CancellationToken cancellationToken = default);
    Task<MobilePhotoEvidenceDto> CapturePhotoEvidenceAsync(MobilePhotoEvidenceRequest request, CancellationToken cancellationToken = default);
}
