using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Mobile;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Mobile;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/mobile")]
public sealed class MobileController(IMobileRuntimeService mobileRuntimeService) : ApiControllerBase
{
    [HttpPost("devices")]
    public async Task<ActionResult<ApiEnvelope<MobileDeviceRegistrationDto>>> RegisterDevice(
        [FromBody] MobileDeviceRegistrationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.RegisterDeviceAsync(request, cancellationToken);
        return OkEnvelope(response, "Mobile device registered.");
    }

    [HttpPost("devices/heartbeat")]
    public async Task<ActionResult<ApiEnvelope<MobileDeviceRegistrationDto>>> Heartbeat(
        [FromBody] MobileDeviceHeartbeatRequest request,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.HeartbeatAsync(request, cancellationToken);
        return OkEnvelope(response, "Mobile device heartbeat recorded.");
    }

    [HttpGet("runtime")]
    public async Task<ActionResult<ApiEnvelope<MobileRuntimeContextDto>>> GetRuntime(
        [FromQuery] string deviceCode,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.GetRuntimeContextAsync(deviceCode, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("tasks")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<MobileTaskDto>>>> ListTasks(
        [FromQuery] string deviceCode,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.ListTasksAsync(deviceCode, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("scans/resolve")]
    public async Task<ActionResult<ApiEnvelope<MobileScanResultDto>>> ResolveScan(
        [FromBody] MobileScanResolveRequest request,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.ResolveScanAsync(request, cancellationToken);
        return OkEnvelope(response, "Mobile scan resolved.");
    }

    [HttpGet("offline-operations")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<MobileOfflineOperationDto>>>> ListOfflineOperations(
        [FromQuery] string deviceCode,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.ListOfflineOperationsAsync(deviceCode, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("offline-operations")]
    public async Task<ActionResult<ApiEnvelope<MobileOfflineOperationDto>>> QueueOfflineOperation(
        [FromBody] MobileOfflineOperationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.QueueOfflineOperationAsync(request, cancellationToken);
        return OkEnvelope(response, "Mobile offline operation queued.");
    }

    [HttpPost("offline-operations/sync")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<MobileOfflineOperationDto>>>> SyncOfflineOperations(
        [FromBody] MobileOfflineSyncRequest request,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.SyncOfflineOperationsAsync(request, cancellationToken);
        return OkEnvelope(response, "Mobile offline sync completed.");
    }

    [HttpGet("sync-conflicts")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<MobileSyncConflictDto>>>> ListSyncConflicts(
        [FromQuery] string deviceCode,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.ListSyncConflictsAsync(deviceCode, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("photo-evidence")]
    public async Task<ActionResult<ApiEnvelope<MobilePhotoEvidenceDto>>> CapturePhotoEvidence(
        [FromBody] MobilePhotoEvidenceRequest request,
        CancellationToken cancellationToken)
    {
        var response = await mobileRuntimeService.CapturePhotoEvidenceAsync(request, cancellationToken);
        return OkEnvelope(response, "Mobile evidence metadata recorded.");
    }
}
