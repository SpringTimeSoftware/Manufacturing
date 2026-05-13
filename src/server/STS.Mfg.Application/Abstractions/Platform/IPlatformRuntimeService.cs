using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Platform;

namespace STS.Mfg.Application.Abstractions.Platform;

public interface IPlatformRuntimeService
{
    Task<ForgotPasswordResponse> RequestForgotPasswordAsync(
        ForgotPasswordRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<NotificationItem>> ListNotificationsAsync(CancellationToken cancellationToken = default);

    Task<ActionResponse> MarkNotificationReadAsync(string id, CancellationToken cancellationToken = default);

    Task<ActionResponse> MarkAllNotificationsReadAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<ApprovalWorkItem>> ListApprovalsAsync(CancellationToken cancellationToken = default);

    Task<ApprovalDetailDto> GetApprovalDetailAsync(string id, CancellationToken cancellationToken = default);

    Task<ActionResponse> SubmitApprovalDecisionAsync(
        string id,
        ApprovalDecisionRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<UserDirectoryItem>> ListUsersAsync(CancellationToken cancellationToken = default);

    Task<UserDirectoryItem> UpdateUserAccessPolicyAsync(
        string id,
        UserAccessPolicyUpdateRequest request,
        CancellationToken cancellationToken = default);

    Task<ActionResponse> RequestUserAccessResetAsync(string id, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<RoleMatrixItem>> ListRolesAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<PermissionCatalogItemDto>> ListPermissionsAsync(CancellationToken cancellationToken = default);

    Task<RoleMatrixItem> CreateRoleAsync(RoleUpsertRequest request, CancellationToken cancellationToken = default);

    Task<RoleMatrixItem> UpdateRoleAsync(
        string id,
        RoleUpsertRequest request,
        CancellationToken cancellationToken = default);

    Task<RoleMatrixItem> CloneRoleAsync(
        string id,
        RoleUpsertRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<WorkflowNumberingItem>> ListWorkflowRulesAsync(CancellationToken cancellationToken = default);

    Task<WorkflowNumberingItem> UpsertWorkflowRuleAsync(
        string? id,
        WorkflowRuleUpsertRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<TenantSettingItem>> ListTenantSettingsAsync(CancellationToken cancellationToken = default);

    Task<TenantSettingItem> UpdateTenantSettingAsync(
        string id,
        TenantSettingUpdateRequest request,
        CancellationToken cancellationToken = default);

    Task<ActionResponse> UpsertTranslationResourceAsync(
        TranslationResourceUpsertRequest request,
        CancellationToken cancellationToken = default);

    Task<PagedResult<AuditTrailItem>> ListAuditTrailAsync(
        AuditTrailFilter filter,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<UdfDefinitionDto>> ListUdfDefinitionsAsync(
        UdfDefinitionFilter filter,
        CancellationToken cancellationToken = default);

    Task<UdfDefinitionDto> CreateUdfDefinitionAsync(
        UdfDefinitionUpsertRequest request,
        CancellationToken cancellationToken = default);

    Task<UdfDefinitionDto> UpdateUdfDefinitionAsync(
        long id,
        UdfDefinitionUpsertRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<UdfValueDto>> ListUdfValuesAsync(
        string entityType,
        long entityId,
        CancellationToken cancellationToken = default);

    Task<UdfValueDto> UpsertUdfValueAsync(
        string entityType,
        long entityId,
        UdfValueUpsertRequest request,
        CancellationToken cancellationToken = default);
}
