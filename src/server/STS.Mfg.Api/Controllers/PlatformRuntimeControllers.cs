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

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiEnvelope<ApprovalDetailDto>>> GetDetail(string id, CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.GetApprovalDetailAsync(id, cancellationToken);
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
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<UserDirectoryItem>>>> List(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListUsersAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPut("{id}/access-policy")]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<UserDirectoryItem>>> UpdateAccessPolicy(
        string id,
        [FromBody] UserAccessPolicyUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpdateUserAccessPolicyAsync(id, request, cancellationToken);
        return OkEnvelope(response, "User access policy saved.");
    }

    [HttpPost("{id}/reset-request")]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> RequestReset(string id, CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.RequestUserAccessResetAsync(id, cancellationToken);
        return OkEnvelope(response, "User access reset requested.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/roles")]
public sealed class RolesController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<RoleMatrixItem>>>> List(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListRolesAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<RoleMatrixItem>>> Create(
        [FromBody] RoleUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.CreateRoleAsync(request, cancellationToken);
        return OkEnvelope(response, "Role saved.");
    }

    [HttpPut("{id}")]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<RoleMatrixItem>>> Update(
        string id,
        [FromBody] RoleUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpdateRoleAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Role saved.");
    }

    [HttpPost("{id}/clone")]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<RoleMatrixItem>>> Clone(
        string id,
        [FromBody] RoleUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.CloneRoleAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Role cloned.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/permissions")]
public sealed class PermissionsController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<PermissionCatalogItemDto>>>> List(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListPermissionsAsync(cancellationToken);
        return OkEnvelope(response);
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
[Route("api/settings")]
public sealed class SettingsController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet("workflow-rules")]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<WorkflowNumberingItem>>>> ListWorkflowRules(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListWorkflowRulesAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("workflow-rules")]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<WorkflowNumberingItem>>> CreateWorkflowRule(
        [FromBody] WorkflowRuleUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertWorkflowRuleAsync(null, request, cancellationToken);
        return OkEnvelope(response, "Workflow and numbering rule saved.");
    }

    [HttpPut("workflow-rules/{id}")]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<WorkflowNumberingItem>>> UpdateWorkflowRule(
        string id,
        [FromBody] WorkflowRuleUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertWorkflowRuleAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Workflow and numbering rule saved.");
    }

    [HttpGet("tenant-settings")]
    [Authorize(Policy = AppPolicies.PlatformAdministration)]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<TenantSettingItem>>>> ListTenantSettings(CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListTenantSettingsAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPut("tenant-settings/{id}")]
    [Authorize(Policy = AppPolicies.PlatformAdministration)]
    public async Task<ActionResult<ApiEnvelope<TenantSettingItem>>> UpdateTenantSetting(
        string id,
        [FromBody] TenantSettingUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpdateTenantSettingAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Tenant setting saved.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/platform")]
public sealed class PlatformExtensibilityController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet("udf-definitions")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<UdfDefinitionDto>>>> ListDefinitions(
        [FromQuery] UdfDefinitionFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListUdfDefinitionsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("udf-definitions")]
    public async Task<ActionResult<ApiEnvelope<UdfDefinitionDto>>> CreateDefinition(
        [FromBody] UdfDefinitionUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.CreateUdfDefinitionAsync(request, cancellationToken);
        return OkEnvelope(response, "Field definition saved.");
    }

    [HttpPut("udf-definitions/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<UdfDefinitionDto>>> UpdateDefinition(
        long id,
        [FromBody] UdfDefinitionUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpdateUdfDefinitionAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Field definition saved.");
    }

    [HttpGet("udf-values/{entityType}/{entityId:long}")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<UdfValueDto>>>> ListValues(
        string entityType,
        long entityId,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListUdfValuesAsync(entityType, entityId, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPut("udf-values/{entityType}/{entityId:long}")]
    public async Task<ActionResult<ApiEnvelope<UdfValueDto>>> UpsertValue(
        string entityType,
        long entityId,
        [FromBody] UdfValueUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertUdfValueAsync(entityType, entityId, request, cancellationToken);
        return OkEnvelope(response, "Field value saved.");
    }

    [HttpGet("udf-placements")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<UdfPlacementDto>>>> ListPlacements(
        [FromQuery] string? screenKey,
        [FromQuery] string? entityType,
        [FromQuery] string? entityLevel,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListUdfPlacementsAsync(screenKey, entityType, entityLevel, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("udf-placements")]
    public async Task<ActionResult<ApiEnvelope<UdfPlacementDto>>> CreatePlacement(
        [FromBody] UdfPlacementUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertUdfPlacementAsync(null, request, cancellationToken);
        return OkEnvelope(response, "Field placement saved.");
    }

    [HttpPut("udf-placements/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<UdfPlacementDto>>> UpdatePlacement(
        long id,
        [FromBody] UdfPlacementUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertUdfPlacementAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Field placement saved.");
    }

    [HttpGet("udf-runtime/{screenKey}/{entityType}/{entityLevel}/{entityId:long}")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<UdfRuntimeFieldDto>>>> GetRuntimeFields(
        string screenKey,
        string entityType,
        string entityLevel,
        long entityId,
        [FromQuery] long? entityLineId,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.GetUdfRuntimeFieldsAsync(screenKey, entityType, entityLevel, entityId, entityLineId, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPut("udf-runtime/{entityType}/{entityId:long}")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<UdfValueDto>>>> UpsertRuntimeValues(
        string entityType,
        long entityId,
        [FromBody] UdfRuntimeValueSetRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertUdfRuntimeValuesAsync(entityType, entityId, request, cancellationToken);
        return OkEnvelope(response, "Field values saved.");
    }

    [HttpGet("custom-objects")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<CustomObjectDto>>>> ListCustomObjects(
        [FromQuery] string? module,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListCustomObjectsAsync(module, status, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("custom-objects")]
    public async Task<ActionResult<ApiEnvelope<CustomObjectDto>>> CreateCustomObject(
        [FromBody] CustomObjectUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertCustomObjectAsync(null, request, cancellationToken);
        return OkEnvelope(response, "Custom object saved.");
    }

    [HttpPut("custom-objects/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CustomObjectDto>>> UpdateCustomObject(
        long id,
        [FromBody] CustomObjectUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertCustomObjectAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Custom object saved.");
    }

    [HttpGet("custom-objects/{customObjectId:long}/records")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<CustomObjectRecordDto>>>> ListCustomObjectRecords(
        long customObjectId,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListCustomObjectRecordsAsync(customObjectId, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("custom-object-records")]
    public async Task<ActionResult<ApiEnvelope<CustomObjectRecordDto>>> CreateCustomObjectRecord(
        [FromBody] CustomObjectRecordUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertCustomObjectRecordAsync(null, request, cancellationToken);
        return OkEnvelope(response, "Custom record saved.");
    }

    [HttpPut("custom-object-records/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CustomObjectRecordDto>>> UpdateCustomObjectRecord(
        long id,
        [FromBody] CustomObjectRecordUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertCustomObjectRecordAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Custom record saved.");
    }

    [HttpGet("custom-screens")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<CustomScreenDto>>>> ListCustomScreens(
        [FromQuery] string? module,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListCustomScreensAsync(module, status, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("custom-screens")]
    public async Task<ActionResult<ApiEnvelope<CustomScreenDto>>> CreateCustomScreen(
        [FromBody] CustomScreenUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertCustomScreenAsync(null, request, cancellationToken);
        return OkEnvelope(response, "Custom screen saved.");
    }

    [HttpPut("custom-screens/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CustomScreenDto>>> UpdateCustomScreen(
        long id,
        [FromBody] CustomScreenUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertCustomScreenAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Custom screen saved.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.AuditRead)]
[Route("api/audit-trail")]
public sealed class AuditTrailController(IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<AuditTrailItem>>>> List(
        [FromQuery] AuditTrailFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.ListAuditTrailAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }
}
