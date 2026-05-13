using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Platform;

public sealed record ForgotPasswordRequest(
    string UserNameOrEmail,
    string? CompanyCode,
    string Channel,
    string RecoveryMode);

public sealed record ForgotPasswordResponse(
    string RequestToken,
    string Message,
    string DeliverySummary,
    IReadOnlyCollection<string> AvailableChallenges,
    DateTimeOffset ExpiresOnUtc,
    string PendingEndpoint);

public sealed record NotificationItem(
    string Id,
    string Title,
    string Body,
    string Module,
    string? Category,
    string Severity,
    DateTimeOffset CreatedAt,
    bool IsRead,
    bool RequiresAction,
    string? DocumentRef,
    string? AuditActionLabel,
    string? StatusLabel,
    string? ActionLabel,
    string? ActionPath);

public sealed record ApprovalWorkItem(
    string Id,
    string Module,
    string DocumentType,
    string ReferenceNo,
    string Title,
    string Summary,
    string SubmittedBy,
    DateTimeOffset SubmittedOn,
    DateTimeOffset DueOn,
    string Status,
    string Priority,
    string StepName,
    string AuditActionLabel,
    string? RelatedNotificationId,
    string? ActionPath,
    IReadOnlyCollection<string> Tags);

public sealed record ApprovalDecisionRequest(string Decision, string? Remarks);

public sealed record ApprovalDecisionDto(
    long Id,
    string Decision,
    string? Remarks,
    DateTimeOffset DecidedOn,
    long? DecidedByUserId);

public sealed record ApprovalDetailDto(
    ApprovalWorkItem WorkItem,
    IReadOnlyCollection<ApprovalDecisionDto> Decisions);

public sealed record UserDirectoryItem(
    string Id,
    string UserName,
    string DisplayName,
    string Email,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> BranchAccess,
    string Status,
    string LoginPolicy,
    string LastLogin,
    string DeviceBinding);

public sealed record RolePermissionItem(string Module, string Access, string DataScope);

public sealed record PermissionCatalogItemDto(
    string Id,
    string PermissionCode,
    string Module,
    string Access,
    string DataScope,
    string Status);

public sealed record RoleMatrixItem(
    string Id,
    string RoleCode,
    string Label,
    string Audience,
    string ScopeMode,
    int ActiveUsers,
    string MobileSurface,
    string Status,
    IReadOnlyCollection<RolePermissionItem> Permissions);

public sealed record RolePermissionAssignmentRequest(string PermissionCode);

public sealed record RoleUpsertRequest(
    string RoleCode,
    string Label,
    string Audience,
    string ScopeMode,
    string Status,
    IReadOnlyCollection<RolePermissionAssignmentRequest> Permissions);

public sealed record UserRoleAssignmentRequest(
    string RoleCode,
    long? CompanyId,
    long? BranchId);

public sealed record UserAccessPolicyUpdateRequest(
    string DisplayName,
    string? Email,
    string LanguageCode,
    long? DefaultCompanyId,
    long? DefaultBranchId,
    string Status,
    string LoginPolicy,
    string DeviceBinding,
    IReadOnlyCollection<UserRoleAssignmentRequest> Roles);

public sealed record WorkflowNumberingItem(
    string Id,
    string DocumentType,
    string SeriesPattern,
    string WorkflowOwner,
    string ApprovalChain,
    int TransitionCount,
    string Status,
    string Notes);

public sealed record WorkflowRuleUpsertRequest(
    long? CompanyId,
    long? BranchId,
    string WorkflowCode,
    string DocumentType,
    string SeriesPattern,
    long CurrentNumber,
    string ResetPolicy,
    string WorkflowOwner,
    string ApprovalChain,
    string Status,
    string? Notes);

public sealed record TenantSettingItem(
    string Id,
    string Group,
    string Key,
    string Label,
    string Value,
    string Status,
    string Description);

public sealed record TenantSettingUpdateRequest(
    string Value,
    string Status,
    string? Description);

public sealed record TranslationResourceUpsertRequest(
    string LanguageCode,
    string? Module,
    string TranslationKey,
    string TranslationValue,
    long? CompanyId,
    long? BranchId);

public sealed record UdfDefinitionFilter(
    int Page = 1,
    int PageSize = 100,
    string? Search = null,
    string? Status = null,
    string? EntityType = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record UdfDefinitionDto(
    long Id,
    long? CompanyId,
    string EntityType,
    string FieldKey,
    string Label,
    string DataType,
    string ControlType,
    string? LookupSource,
    bool IsRequired,
    decimal? MinNumber,
    decimal? MaxNumber,
    int? MaxLength,
    int? DecimalScale,
    string RoleVisibility,
    string Status,
    DateTimeOffset CreatedOn,
    DateTimeOffset? ModifiedOn);

public sealed record UdfDefinitionUpsertRequest(
    long? CompanyId,
    string EntityType,
    string FieldKey,
    string Label,
    string DataType,
    string ControlType,
    string? LookupSource,
    bool IsRequired,
    decimal? MinNumber,
    decimal? MaxNumber,
    int? MaxLength,
    int? DecimalScale,
    string RoleVisibility,
    string Status);

public sealed record UdfValueDto(
    long Id,
    long DefinitionId,
    string EntityType,
    long EntityId,
    string? ValueText,
    decimal? ValueNumber,
    DateTimeOffset? ValueDate,
    bool? ValueBoolean,
    DateTimeOffset CreatedOn,
    DateTimeOffset? ModifiedOn);

public sealed record UdfValueUpsertRequest(
    long DefinitionId,
    long EntityId,
    string? ValueText,
    decimal? ValueNumber,
    DateTimeOffset? ValueDate,
    bool? ValueBoolean);

public sealed record AuditTrailFilter(
    int Page = 1,
    int PageSize = 50,
    string? Search = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    string? Module = null,
    string? EntityType = null,
    string? ActionCode = null) : QueryFilter(Page, PageSize, Search, null, DateFrom, DateTo);

public sealed record AuditTrailItem(
    long Id,
    long? CompanyId,
    long? BranchId,
    DateTimeOffset CreatedOn,
    long? CreatedByUserId,
    string Module,
    string EntityType,
    string ActionCode,
    string? EntityId,
    string? ReasonCode,
    string CorrelationId,
    string ClientType,
    string? BeforeSnapshot,
    string? AfterSnapshot);
