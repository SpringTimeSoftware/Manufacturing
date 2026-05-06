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

public sealed record WorkflowNumberingItem(
    string Id,
    string DocumentType,
    string SeriesPattern,
    string WorkflowOwner,
    string ApprovalChain,
    int TransitionCount,
    string Status,
    string Notes);

public sealed record TenantSettingItem(
    string Id,
    string Group,
    string Key,
    string Label,
    string Value,
    string Status,
    string Description);
