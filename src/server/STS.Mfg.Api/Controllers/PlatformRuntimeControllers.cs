using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Platform;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Platform;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/notifications")]
public sealed class NotificationsController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<NotificationItem>>>> List(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListNotificationsAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> MarkRead(string id, CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.MarkNotificationReadAsync(id, cancellationToken);
        return OkEnvelope(response, "Notification acknowledged.");
    }

    [HttpPost("read-all")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> MarkAllRead(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.MarkAllNotificationsReadAsync(cancellationToken);
        return OkEnvelope(response, "Notifications acknowledged.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/approvals")]
public sealed class ApprovalsController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<ApprovalWorkItem>>>> List(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListApprovalsAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("{id}/decision")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> SubmitDecision(
        string id,
        [FromBody] ApprovalDecisionRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.SubmitApprovalDecisionAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Approval decision captured.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/users")]
public sealed class UsersController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<UserDirectoryItem>>>> List(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListUsersAsync(cancellationToken);
        return OkEnvelope(response);
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/roles")]
public sealed class RolesController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<RoleMatrixItem>>>> List(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListRolesAsync(cancellationToken);
        return OkEnvelope(response);
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/settings")]
public sealed class SettingsController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet("workflow-rules")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<WorkflowNumberingItem>>>> ListWorkflowRules(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListWorkflowRulesAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("tenant-settings")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<TenantSettingItem>>>> ListTenantSettings(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListTenantSettingsAsync(cancellationToken);
        return OkEnvelope(response);
    }
}
