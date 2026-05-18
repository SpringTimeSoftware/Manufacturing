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
    string? EntityType = null,
    string? Module = null,
    string? EntityLevel = null) : QueryFilter(Page, PageSize, Search, Status);

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
    DateTimeOffset? ModifiedOn,
    string Module = "Platform",
    string? EntitySubType = null,
    string EntityLevel = "Header",
    string? Description = null,
    bool IsUnique = false,
    bool IsReadOnly = false,
    string? DefaultValue = null,
    string? PlaceholderText = null,
    string? HelpText = null,
    int DisplayOrder = 100,
    string? SectionName = null,
    DateTimeOffset? EffectiveFrom = null,
    DateTimeOffset? EffectiveTo = null,
    int VersionNo = 1,
    string? ValidationRulesJson = null,
    string? OptionSetCode = null,
    string? LookupSourceType = null,
    bool IsReportable = false,
    bool AllowIntegration = false,
    bool AllowMobile = false,
    bool IsSensitive = false,
    string LifecycleGate = "DraftSave",
    string ValueLockPolicy = "LockOnRelease");

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
    string Status,
    string Module = "Platform",
    string? EntitySubType = null,
    string EntityLevel = "Header",
    string? Description = null,
    bool IsUnique = false,
    bool IsReadOnly = false,
    string? DefaultValue = null,
    string? PlaceholderText = null,
    string? HelpText = null,
    int DisplayOrder = 100,
    string? SectionName = null,
    DateTimeOffset? EffectiveFrom = null,
    DateTimeOffset? EffectiveTo = null,
    string? ValidationRulesJson = null,
    string? OptionSetCode = null,
    string? LookupSourceType = null,
    bool IsReportable = false,
    bool AllowIntegration = false,
    bool AllowMobile = false,
    bool IsSensitive = false,
    string LifecycleGate = "DraftSave",
    string ValueLockPolicy = "LockOnRelease");

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
    DateTimeOffset? ModifiedOn,
    long? CompanyId = null,
    long? EntityLineId = null,
    int? EntityVersionNo = null,
    string? FieldKey = null,
    string? Label = null,
    string? DataType = null,
    string? ValueLongText = null,
    long? ValueInteger = null,
    decimal? ValueDecimal = null,
    decimal? ValueMoneyAmount = null,
    long? ValueCurrencyId = null,
    DateTimeOffset? ValueDateTime = null,
    long? ValueOptionId = null,
    string? ValueOptionCode = null,
    string? ValueJson = null,
    long? AttachmentReferenceId = null,
    string? DisplayValue = null,
    string Status = "Active");

public sealed record UdfValueUpsertRequest(
    long DefinitionId,
    long EntityId,
    string? ValueText,
    decimal? ValueNumber,
    DateTimeOffset? ValueDate,
    bool? ValueBoolean,
    long? CompanyId = null,
    long? EntityLineId = null,
    int? EntityVersionNo = null,
    string? ValueLongText = null,
    long? ValueInteger = null,
    decimal? ValueDecimal = null,
    decimal? ValueMoneyAmount = null,
    long? ValueCurrencyId = null,
    DateTimeOffset? ValueDateTime = null,
    long? ValueOptionId = null,
    string? ValueOptionCode = null,
    string? ValueJson = null,
    long? AttachmentReferenceId = null,
    string? DisplayValue = null,
    string Status = "Active",
    string? ChangeReason = null);

public sealed record UdfPlacementDto(
    long Id,
    long UdfDefinitionId,
    long? CompanyId,
    string Module,
    string ScreenKey,
    string? RoutePath,
    string EntityType,
    string EntityLevel,
    string SectionName,
    string? TabName,
    string? GroupName,
    int DisplayOrder,
    int? ColumnSpan,
    string? VisibleConditionJson,
    string? EditableConditionJson,
    string? RequiredConditionJson,
    string? PermissionKey,
    string Status,
    string FieldKey,
    string Label,
    string DataType,
    string ControlType,
    string? LookupSource,
    bool IsRequired,
    bool IsReadOnly,
    bool IsSensitive,
    bool IsReportable,
    bool AllowIntegration,
    bool AllowMobile);

public sealed record UdfPlacementUpsertRequest(
    long UdfDefinitionId,
    long? CompanyId,
    string Module,
    string ScreenKey,
    string? RoutePath,
    string EntityType,
    string EntityLevel,
    string SectionName,
    string? TabName,
    string? GroupName,
    int DisplayOrder,
    int? ColumnSpan,
    string? VisibleConditionJson,
    string? EditableConditionJson,
    string? RequiredConditionJson,
    string? PermissionKey,
    string Status);

public sealed record UdfRuntimeFieldDto(
    UdfPlacementDto Placement,
    UdfValueDto? Value);

public sealed record UdfRuntimeValueSetRequest(
    IReadOnlyCollection<UdfValueUpsertRequest> Values);

public sealed record CustomObjectDto(
    long Id,
    long? CompanyId,
    string ObjectCode,
    string ObjectName,
    string Module,
    string? Category,
    string? PrimaryDisplayFieldCode,
    string? Description,
    string Status,
    DateTimeOffset CreatedOn,
    DateTimeOffset? ModifiedOn);

public sealed record CustomObjectUpsertRequest(
    long? CompanyId,
    string ObjectCode,
    string ObjectName,
    string Module,
    string? Category,
    string? PrimaryDisplayFieldCode,
    string? Description,
    string Status);

public sealed record CustomObjectRecordDto(
    long Id,
    long CustomObjectId,
    long? CompanyId,
    string RecordNo,
    string? DisplayValue,
    string? LinkedEntityType,
    long? LinkedEntityId,
    string Status,
    DateTimeOffset CreatedOn,
    DateTimeOffset? ModifiedOn);

public sealed record CustomObjectRecordUpsertRequest(
    long CustomObjectId,
    long? CompanyId,
    string RecordNo,
    string? DisplayValue,
    string? LinkedEntityType,
    long? LinkedEntityId,
    string Status,
    IReadOnlyCollection<UdfValueUpsertRequest> Values);

public sealed record CustomScreenDto(
    long Id,
    long? CompanyId,
    string ScreenCode,
    string ScreenName,
    string Module,
    string? NavigationGroup,
    string? BoundEntityType,
    long? CustomObjectId,
    string RoutePath,
    string LayoutJson,
    string? ListViewJson,
    string? PermissionKey,
    string Status,
    DateTimeOffset CreatedOn,
    DateTimeOffset? ModifiedOn);

public sealed record CustomScreenUpsertRequest(
    long? CompanyId,
    string ScreenCode,
    string ScreenName,
    string Module,
    string? NavigationGroup,
    string? BoundEntityType,
    long? CustomObjectId,
    string RoutePath,
    string LayoutJson,
    string? ListViewJson,
    string? PermissionKey,
    string Status);

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
