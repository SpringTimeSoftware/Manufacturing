SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

DECLARE @now DATETIMEOFFSET(7) = SYSUTCDATETIME();

IF NOT EXISTS (SELECT 1 FROM platform.Translations WHERE LanguageCode = N'en-IN' AND TranslationKey = N'app.shell.title')
BEGIN
    INSERT INTO platform.Translations
        (LanguageCode, TranslationKey, TranslationValue, Module, CompanyId, BranchId, CreatedOn)
    VALUES
        (N'en-IN', N'app.shell.title', N'STS Manufacturing ERP', N'Platform', NULL, NULL, @now);
END;

IF NOT EXISTS (SELECT 1 FROM platform.NotificationTemplates WHERE TemplateCode = N'GENERIC_INFO' AND ChannelType = N'InApp')
BEGIN
    INSERT INTO platform.NotificationTemplates
        (CompanyId, BranchId, TemplateCode, ChannelType, TemplateBody, Status, CreatedOn)
    VALUES
        (NULL, NULL, N'GENERIC_INFO', N'InApp', N'{{title}} - {{message}}', N'Active', @now);
END;

IF NOT EXISTS (SELECT 1 FROM integration.IntegrationProviders WHERE ProviderCode = N'EMAIL-SMTP')
BEGIN
    INSERT INTO integration.IntegrationProviders
        (ProviderCode, ProviderName, ProviderType, BaseUrl, Status, IsSystemBase, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (N'EMAIL-SMTP', N'SMTP Email Provider', N'Email', NULL, N'Inactive', 1, @now, NULL, @now, NULL);
END;

IF NOT EXISTS (SELECT 1 FROM integration.IntegrationProviders WHERE ProviderCode = N'WEBHOOK-GENERIC')
BEGIN
    INSERT INTO integration.IntegrationProviders
        (ProviderCode, ProviderName, ProviderType, BaseUrl, Status, IsSystemBase, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (N'WEBHOOK-GENERIC', N'Generic Webhook Provider', N'Webhook', NULL, N'Inactive', 1, @now, NULL, @now, NULL);
END;

IF NOT EXISTS (SELECT 1 FROM ai.AiProviders WHERE ProviderCode = N'DRAFT-STUB')
BEGIN
    INSERT INTO ai.AiProviders
        (ProviderCode, ProviderName, ProviderType, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (N'DRAFT-STUB', N'Draft-only Stub Provider', N'DraftOnly', N'Active', @now, NULL, @now, NULL);
END;

DECLARE @draftProviderId BIGINT = (SELECT TOP (1) Id FROM ai.AiProviders WHERE ProviderCode = N'DRAFT-STUB');

IF @draftProviderId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ai.AiModels WHERE AiProviderId = @draftProviderId AND ModelCode = N'DRAFT-SAFE')
BEGIN
    INSERT INTO ai.AiModels
        (AiProviderId, ModelCode, ModelName, CapabilityFlagsJson, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (@draftProviderId, N'DRAFT-SAFE', N'Draft Safe Model', N'{"draftOnly":true,"autopost":false}', N'Active', @now, NULL, @now, NULL);
END;

IF NOT EXISTS (SELECT 1 FROM ai.AiPromptTemplates WHERE CompanyId IS NULL AND TemplateCode = N'DAILY-SUMMARY-DRAFT')
BEGIN
    INSERT INTO ai.AiPromptTemplates
        (CompanyId, TemplateCode, TemplateName, PromptPurpose, TemplateBody, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (NULL, N'DAILY-SUMMARY-DRAFT', N'Daily Summary Draft', N'OperationsSummary', N'Summarize approved operational data for human review only.', N'Active', @now, NULL, @now, NULL);
END;

DECLARE @roles TABLE
(
    RoleCode NVARCHAR(64) NOT NULL,
    RoleName NVARCHAR(128) NOT NULL,
    Audience NVARCHAR(256) NULL,
    ScopeMode NVARCHAR(64) NOT NULL,
    MobileSurface NVARCHAR(128) NULL,
    Status NVARCHAR(32) NOT NULL
);

INSERT INTO @roles (RoleCode, RoleName, Audience, ScopeMode, MobileSurface, Status)
VALUES
    (N'SuperAdmin', N'Super Administrator', N'Tenant administration and controlled support', N'Tenant wide', N'None', N'Standard'),
    (N'PlatformAdmin', N'Platform Administrator', N'Deployment-level support and template owners', N'Tenant wide', N'None', N'Standard'),
    (N'CompanyAdmin', N'Company Administrator', N'Master data and branch configuration owners', N'Company wide', N'Approvals only', N'Standard'),
    (N'SalesCoordinator', N'Sales Coordinator', N'Commercial demand and customer-order users', N'Company + assigned branch', N'Read-only approvals', N'Standard'),
    (N'PlanningManager', N'Planning Manager', N'Planning and release supervisors', N'Company + assigned branch', N'Read-only approvals', N'Standard'),
    (N'PurchaseManager', N'Purchase Manager', N'Procurement owners and supplier follow-up users', N'Company + assigned branch', N'Approvals only', N'Standard'),
    (N'StoreKeeper', N'Store Keeper', N'Inventory and material issue users', N'Assigned warehouse', N'Inventory execution', N'Standard'),
    (N'ProductionSupervisor', N'Production Supervisor', N'Shop-floor supervisors and shift owners', N'Assigned branch and team', N'Execution supervision', N'Standard'),
    (N'MachineOperator', N'Machine Operator', N'Assigned operator execution users', N'Own assigned job cards', N'Execution only', N'Standard'),
    (N'QCInspector', N'QC Inspector', N'Incoming and in-process quality users', N'Assigned quality department', N'QC execution', N'Standard'),
    (N'DispatchManager', N'Dispatch Manager', N'Packing and shipment owners', N'Assigned dispatch warehouse', N'Dispatch proof', N'Standard'),
    (N'PlantHead', N'Plant Head', N'Plant leadership and escalation owners', N'Company + assigned branch', N'Approvals and dashboards', N'Standard'),
    (N'ManagementViewer', N'Management Viewer', N'Read-only management and owner dashboard users', N'Company wide', N'Dashboards only', N'Standard');

INSERT INTO platform.Roles
    (RoleCode, RoleName, Audience, ScopeMode, MobileSurface, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
SELECT r.RoleCode, r.RoleName, r.Audience, r.ScopeMode, r.MobileSurface, r.Status, @now, NULL, @now, NULL
FROM @roles r
WHERE NOT EXISTS (SELECT 1 FROM platform.Roles existing WHERE existing.RoleCode = r.RoleCode);

DECLARE @permissions TABLE
(
    PermissionCode NVARCHAR(128) NOT NULL,
    Module NVARCHAR(64) NOT NULL,
    AccessLevel NVARCHAR(32) NOT NULL,
    DataScope NVARCHAR(64) NOT NULL
);

INSERT INTO @permissions (PermissionCode, Module, AccessLevel, DataScope)
VALUES
    (N'Platform.Manage.Tenant', N'Platform', N'Manage', N'Tenant'),
    (N'Platform.Manage.Company', N'Platform', N'Manage', N'Company'),
    (N'Localization.Manage.Tenant', N'Localization', N'Manage', N'Tenant'),
    (N'Audit.Read.Tenant', N'Audit', N'Read', N'Tenant'),
    (N'Masters.Manage.Company', N'Masters', N'Manage', N'Company'),
    (N'Commercial.Manage.Company', N'Commercial', N'Manage', N'Company'),
    (N'Planning.Manage.Branch', N'Planning', N'Manage', N'Branch'),
    (N'Production.Approve.Branch', N'Production', N'Approve', N'Branch'),
    (N'Dashboards.Read.Company', N'Dashboards', N'Read', N'Company'),
    (N'Inventory.Manage.Warehouse', N'Inventory', N'Manage', N'Warehouse'),
    (N'Quality.Manage.Department', N'Quality', N'Manage', N'Department'),
    (N'Dispatch.Manage.Warehouse', N'Dispatch', N'Manage', N'Warehouse');

INSERT INTO platform.Permissions
    (PermissionCode, Module, AccessLevel, DataScope, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
SELECT p.PermissionCode, p.Module, p.AccessLevel, p.DataScope, N'Active', @now, NULL, @now, NULL
FROM @permissions p
WHERE NOT EXISTS (SELECT 1 FROM platform.Permissions existing WHERE existing.PermissionCode = p.PermissionCode);

DECLARE @rolePermissions TABLE (RoleCode NVARCHAR(64) NOT NULL, PermissionCode NVARCHAR(128) NOT NULL);
INSERT INTO @rolePermissions (RoleCode, PermissionCode)
VALUES
    (N'PlatformAdmin', N'Platform.Manage.Tenant'),
    (N'PlatformAdmin', N'Localization.Manage.Tenant'),
    (N'PlatformAdmin', N'Audit.Read.Tenant'),
    (N'CompanyAdmin', N'Platform.Manage.Company'),
    (N'CompanyAdmin', N'Masters.Manage.Company'),
    (N'CompanyAdmin', N'Commercial.Manage.Company'),
    (N'PlanningManager', N'Planning.Manage.Branch'),
    (N'PlanningManager', N'Production.Approve.Branch'),
    (N'PlanningManager', N'Dashboards.Read.Company'),
    (N'PlantHead', N'Production.Approve.Branch'),
    (N'PlantHead', N'Dashboards.Read.Company'),
    (N'ManagementViewer', N'Dashboards.Read.Company'),
    (N'StoreKeeper', N'Inventory.Manage.Warehouse'),
    (N'QCInspector', N'Quality.Manage.Department'),
    (N'DispatchManager', N'Dispatch.Manage.Warehouse');

INSERT INTO @rolePermissions (RoleCode, PermissionCode)
SELECT N'SuperAdmin', PermissionCode
FROM @permissions;

INSERT INTO platform.RolePermissions (RoleId, PermissionId, CreatedOn, CreatedByUserId)
SELECT r.Id, p.Id, @now, NULL
FROM @rolePermissions rp
JOIN platform.Roles r ON r.RoleCode = rp.RoleCode
JOIN platform.Permissions p ON p.PermissionCode = rp.PermissionCode
WHERE NOT EXISTS
(
    SELECT 1
    FROM platform.RolePermissions existing
    WHERE existing.RoleId = r.Id AND existing.PermissionId = p.Id
);

DECLARE @users TABLE
(
    Id BIGINT NOT NULL,
    UserName NVARCHAR(128) NOT NULL,
    DisplayName NVARCHAR(160) NOT NULL,
    Email NVARCHAR(256) NULL,
    LanguageCode NVARCHAR(16) NOT NULL,
    DefaultCompanyId BIGINT NULL,
    DefaultBranchId BIGINT NULL,
    Status NVARCHAR(32) NOT NULL,
    LoginPolicy NVARCHAR(128) NULL,
    LastLoginText NVARCHAR(64) NULL,
    DeviceBinding NVARCHAR(128) NULL
);

INSERT INTO @users (Id, UserName, DisplayName, Email, LanguageCode, DefaultCompanyId, DefaultBranchId, Status, LoginPolicy, LastLoginText, DeviceBinding)
VALUES
    (999, N'super.admin', N'Super Admin', N'super.admin@sts.local', N'en-IN', 1, 11, N'Active', N'MFA required', N'Bootstrap identity', N'2 registered devices'),
    (1000, N'platform.admin', N'Platform Admin', N'platform.admin@sts.local', N'en-IN', 1, 11, N'Active', N'MFA required', N'Bootstrap identity', N'2 registered devices'),
    (1001, N'company.admin', N'Company Admin', N'company.admin@sts.local', N'en-IN', 1, 11, N'Active', N'Password + OTP', N'Bootstrap identity', N'1 registered device'),
    (1002, N'planning.manager', N'Planning Manager', N'planning.manager@sts.local', N'en-IN', 1, 11, N'Active', N'MFA required', N'Bootstrap identity', N'2 registered devices'),
    (1003, N'stores.keeper', N'Stores Keeper', N'stores.keeper@sts.local', N'en-IN', 1, 11, N'Active', N'Password + OTP', N'Bootstrap identity', N'1 registered device'),
    (1004, N'prod.supervisor', N'Production Supervisor', N'prod.supervisor@sts.local', N'en-IN', 1, 11, N'Active', N'MFA required', N'Bootstrap identity', N'1 registered device'),
    (1005, N'machine.operator', N'Machine Operator', N'machine.operator@sts.local', N'en-IN', 1, 11, N'Active', N'Device binding required', N'Bootstrap identity', N'Assigned mobile device'),
    (1006, N'qc.inspector', N'QC Inspector', N'qc.inspector@sts.local', N'en-IN', 1, 12, N'Active', N'MFA required', N'Bootstrap identity', N'1 registered device'),
    (1007, N'dispatch.manager', N'Dispatch Manager', N'dispatch.manager@sts.local', N'en-IN', 1, 12, N'Active', N'Password + OTP', N'Bootstrap identity', N'1 registered device');

SET IDENTITY_INSERT platform.AppUsers ON;
INSERT INTO platform.AppUsers
    (Id, UserName, DisplayName, Email, LanguageCode, DefaultCompanyId, DefaultBranchId, Status, LoginPolicy, LastLoginText, DeviceBinding, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
SELECT u.Id, u.UserName, u.DisplayName, u.Email, u.LanguageCode, u.DefaultCompanyId, u.DefaultBranchId, u.Status, u.LoginPolicy, u.LastLoginText, u.DeviceBinding, @now, NULL, @now, NULL
FROM @users u
WHERE NOT EXISTS (SELECT 1 FROM platform.AppUsers existing WHERE existing.Id = u.Id OR existing.UserName = u.UserName);
SET IDENTITY_INSERT platform.AppUsers OFF;

DECLARE @userRoles TABLE (UserId BIGINT NOT NULL, RoleCode NVARCHAR(64) NOT NULL, CompanyId BIGINT NULL, BranchId BIGINT NULL);
INSERT INTO @userRoles (UserId, RoleCode, CompanyId, BranchId)
VALUES
    (999, N'SuperAdmin', 1, 11),
    (999, N'SuperAdmin', 1, 12),
    (1000, N'PlatformAdmin', 1, 11),
    (1000, N'PlatformAdmin', 1, 12),
    (1001, N'CompanyAdmin', 1, 11),
    (1001, N'CompanyAdmin', 1, 12),
    (1002, N'PlanningManager', 1, 11),
    (1002, N'PlanningManager', 1, 12),
    (1003, N'StoreKeeper', 1, 11),
    (1004, N'ProductionSupervisor', 1, 11),
    (1005, N'MachineOperator', 1, 11),
    (1006, N'QCInspector', 1, 12),
    (1007, N'DispatchManager', 1, 12);

INSERT INTO platform.UserRoles (UserId, RoleId, CompanyId, BranchId, CreatedOn, CreatedByUserId)
SELECT ur.UserId, r.Id, ur.CompanyId, ur.BranchId, @now, NULL
FROM @userRoles ur
JOIN platform.Roles r ON r.RoleCode = ur.RoleCode
WHERE NOT EXISTS
(
    SELECT 1
    FROM platform.UserRoles existing
    WHERE existing.UserId = ur.UserId
      AND existing.RoleId = r.Id
      AND ISNULL(existing.CompanyId, 0) = ISNULL(ur.CompanyId, 0)
      AND ISNULL(existing.BranchId, 0) = ISNULL(ur.BranchId, 0)
);

DECLARE @series TABLE (DocumentType NVARCHAR(64), SeriesPattern NVARCHAR(64), CurrentNumber BIGINT, ResetPolicy NVARCHAR(32), Status NVARCHAR(32));
INSERT INTO @series (DocumentType, SeriesPattern, CurrentNumber, ResetPolicy, Status)
VALUES
    (N'Sales Order', N'SO-{YY}-{BR}', 0, N'Yearly', N'Active'),
    (N'Work Order', N'WO-{YY}-{BR}', 0, N'Yearly', N'Active'),
    (N'Dispatch Release', N'DC-{YY}-{BR}', 0, N'Yearly', N'Draft');

INSERT INTO platform.DocumentSeries
    (CompanyId, BranchId, DocumentType, SeriesPattern, CurrentNumber, ResetPolicy, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
SELECT 1, NULL, s.DocumentType, s.SeriesPattern, s.CurrentNumber, s.ResetPolicy, s.Status, @now, NULL, @now, NULL
FROM @series s
WHERE NOT EXISTS (SELECT 1 FROM platform.DocumentSeries existing WHERE existing.CompanyId = 1 AND existing.BranchId IS NULL AND existing.DocumentType = s.DocumentType);

DECLARE @workflow TABLE
(
    WorkflowCode NVARCHAR(64),
    DocumentType NVARCHAR(64),
    OwnerRoleCode NVARCHAR(64),
    ApprovalChain NVARCHAR(256),
    Status NVARCHAR(32),
    Notes NVARCHAR(512)
);

INSERT INTO @workflow (WorkflowCode, DocumentType, OwnerRoleCode, ApprovalChain, Status, Notes)
VALUES
    (N'WF-SALES-ORDER', N'Sales Order', N'SalesCoordinator', N'SalesCoordinator -> PlanningManager', N'Active', N'Planner review is required before manufacturing demand is committed.'),
    (N'WF-WORK-ORDER', N'Work Order', N'PlanningManager', N'PlanningManager -> PlantHead', N'Active', N'Release can proceed only after routing and reservation checks pass.'),
    (N'WF-DISPATCH', N'Dispatch Release', N'DispatchManager', N'DispatchManager -> PlantHead', N'Draft', N'Pending branch-specific prefix finalization.');

INSERT INTO platform.WorkflowDefinitions
    (CompanyId, BranchId, WorkflowCode, DocumentType, OwnerRoleCode, ApprovalChain, Status, Notes, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
SELECT 1, NULL, w.WorkflowCode, w.DocumentType, w.OwnerRoleCode, w.ApprovalChain, w.Status, w.Notes, @now, NULL, @now, NULL
FROM @workflow w
WHERE NOT EXISTS (SELECT 1 FROM platform.WorkflowDefinitions existing WHERE existing.CompanyId = 1 AND existing.BranchId IS NULL AND existing.WorkflowCode = w.WorkflowCode);

DECLARE @workflowSteps TABLE (WorkflowCode NVARCHAR(64), StepCode NVARCHAR(64), StepName NVARCHAR(128), SequenceNo INT, OwnerRoleCode NVARCHAR(64), IsApprovalStep BIT, Status NVARCHAR(32));
INSERT INTO @workflowSteps (WorkflowCode, StepCode, StepName, SequenceNo, OwnerRoleCode, IsApprovalStep, Status)
VALUES
    (N'WF-SALES-ORDER', N'DRAFT', N'Draft order', 10, N'SalesCoordinator', 0, N'Active'),
    (N'WF-SALES-ORDER', N'PLANNER-REVIEW', N'Planner review', 20, N'PlanningManager', 1, N'Active'),
    (N'WF-WORK-ORDER', N'PLAN', N'Plan work order', 10, N'PlanningManager', 0, N'Active'),
    (N'WF-WORK-ORDER', N'RELEASE-GATE', N'Plant head release gate', 20, N'PlantHead', 1, N'Active'),
    (N'WF-DISPATCH', N'PACKED', N'Packed review', 10, N'DispatchManager', 0, N'Draft'),
    (N'WF-DISPATCH', N'DISPATCH-GATE', N'Dispatch approval', 20, N'PlantHead', 1, N'Draft');

INSERT INTO platform.WorkflowSteps
    (WorkflowDefinitionId, StepCode, StepName, SequenceNo, OwnerRoleCode, IsApprovalStep, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
SELECT wf.Id, s.StepCode, s.StepName, s.SequenceNo, s.OwnerRoleCode, s.IsApprovalStep, s.Status, @now, NULL, @now, NULL
FROM @workflowSteps s
JOIN platform.WorkflowDefinitions wf ON wf.WorkflowCode = s.WorkflowCode
WHERE NOT EXISTS (SELECT 1 FROM platform.WorkflowSteps existing WHERE existing.WorkflowDefinitionId = wf.Id AND existing.SequenceNo = s.SequenceNo);

DECLARE @workflowTransitions TABLE (WorkflowCode NVARCHAR(64), FromStatus NVARCHAR(64), ToStatus NVARCHAR(64), ActionCode NVARCHAR(64), SequenceNo INT);
INSERT INTO @workflowTransitions (WorkflowCode, FromStatus, ToStatus, ActionCode, SequenceNo)
VALUES
    (N'WF-SALES-ORDER', N'Draft', N'Planner Review', N'SUBMIT', 10),
    (N'WF-SALES-ORDER', N'Planner Review', N'Committed', N'APPROVE', 20),
    (N'WF-SALES-ORDER', N'Planner Review', N'Draft', N'REJECT', 30),
    (N'WF-WORK-ORDER', N'Planned', N'Release Review', N'SUBMIT', 10),
    (N'WF-WORK-ORDER', N'Release Review', N'Released', N'APPROVE', 20),
    (N'WF-WORK-ORDER', N'Release Review', N'Planned', N'REJECT', 30),
    (N'WF-DISPATCH', N'Packed', N'Dispatch Review', N'SUBMIT', 10),
    (N'WF-DISPATCH', N'Dispatch Review', N'Released', N'APPROVE', 20);

INSERT INTO platform.WorkflowTransitions
    (WorkflowDefinitionId, FromStatus, ToStatus, ActionCode, SequenceNo, CreatedOn, CreatedByUserId)
SELECT wf.Id, t.FromStatus, t.ToStatus, t.ActionCode, t.SequenceNo, @now, NULL
FROM @workflowTransitions t
JOIN platform.WorkflowDefinitions wf ON wf.WorkflowCode = t.WorkflowCode
WHERE NOT EXISTS (SELECT 1 FROM platform.WorkflowTransitions existing WHERE existing.WorkflowDefinitionId = wf.Id AND existing.ActionCode = t.ActionCode);

DECLARE @settings TABLE (SettingGroup NVARCHAR(64), SettingKey NVARCHAR(128), SettingLabel NVARCHAR(160), SettingValue NVARCHAR(256), Status NVARCHAR(32), Description NVARCHAR(512));
INSERT INTO @settings (SettingGroup, SettingKey, SettingLabel, SettingValue, Status, Description)
VALUES
    (N'Deployment', N'iisPublishMode', N'Approved publish mode', N'Release package only', N'Applied', N'Production rollout uses the approved release package and hosted web assets.'),
    (N'Localization', N'defaultLanguage', N'Default web language', N'en-IN', N'Applied', N'Base language used when user-specific localization resources are missing.'),
    (N'Attachments', N'attachmentPolicy', N'Attachment retention policy', N'Audit-safe / company scoped', N'Applied', N'Keep linked files auditable while avoiding tenant cross-over.'),
    (N'Feature Flags', N'enableNotificationCenter', N'Notification center', N'Enabled', N'Applied', N'Controls whether the shared inbox surfaces stay visible in the web shell.'),
    (N'Feature Flags', N'enablePrintAndExport', N'Print and export', N'Enabled', N'Applied', N'Keeps print-pack and export actions available in planner-owned screens.'),
    (N'Feature Flags', N'showSeededNavigation', N'Guided workflows', N'Enabled', N'Applied', N'Shows curated workflow shortcuts for common manufacturing reviews.');

INSERT INTO platform.PlatformSettings
    (CompanyId, BranchId, SettingGroup, SettingKey, SettingLabel, SettingValue, Status, Description, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
SELECT 1, NULL, s.SettingGroup, s.SettingKey, s.SettingLabel, s.SettingValue, s.Status, s.Description, @now, NULL, @now, NULL
FROM @settings s
WHERE NOT EXISTS (SELECT 1 FROM platform.PlatformSettings existing WHERE existing.CompanyId = 1 AND existing.BranchId IS NULL AND existing.SettingKey = s.SettingKey);

DECLARE @notifications TABLE
(
    NotificationKey NVARCHAR(128),
    Title NVARCHAR(256),
    Body NVARCHAR(MAX),
    Module NVARCHAR(64),
    Category NVARCHAR(32),
    Severity NVARCHAR(16),
    CreatedOn DATETIMEOFFSET(7),
    IsRead BIT,
    RequiresAction BIT,
    DocumentRef NVARCHAR(128),
    AuditActionLabel NVARCHAR(160),
    StatusLabel NVARCHAR(64),
    ActionLabel NVARCHAR(96),
    ActionPath NVARCHAR(256)
);

INSERT INTO @notifications (NotificationKey, Title, Body, Module, Category, Severity, CreatedOn, IsRead, RequiresAction, DocumentRef, AuditActionLabel, StatusLabel, ActionLabel, ActionPath)
VALUES
    (N'notif-wo-risk', N'Work order release still blocked', N'WO-02642 is waiting on RM-SS-SHEET and routing step approval.', N'Planning', N'Approval', N'warn', DATEADD(minute, -75, @now), 0, 1, N'WO-02642', N'Review re-release approval', N'Escalated', N'Open approvals', N'/platform/approvals'),
    (N'notif-bom-approval', N'BOM revision R4 needs engineering approval', N'FG-OZ-50 revision R4 is ready for release after QA note updates.', N'Engineering', N'Approval', N'info', DATEADD(minute, -110, @now), 0, 1, N'BOM-FG-OZ-50 / R4', N'Approve BOM revision', N'Pending', N'Open approvals', N'/platform/approvals'),
    (N'notif-qc', N'QC hold requires supervisor review', N'Final inspection for SO-2026-0189 is waiting on leak-test evidence.', N'Quality', N'Alert', N'danger', DATEADD(hour, -3, @now), 0, 1, N'SO-2026-0189', N'Review QC hold', NULL, N'Open stage board', N'/dashboards/stage-wise'),
    (N'notif-translation', N'Translation bundle synced', N'Updated production.receipt.received for en-IN and hi-IN.', N'Platform', N'System', N'info', DATEADD(hour, -14, @now), 1, 0, N'Language bundle / production', N'Review localization sync', NULL, NULL, NULL),
    (N'notif-dispatch-approval', N'Dispatch release approval is due before loading', N'SO-2026-0194 is packed and waiting for dispatch approval before the vehicle gate closes.', N'Dispatch', N'Approval', N'warn', DATEADD(hour, -4, @now), 0, 1, N'PK-00419 / SO-2026-0194', N'Approve dispatch release', N'Pending', N'Open approvals', N'/platform/approvals');

INSERT INTO platform.Notifications
    (CompanyId, BranchId, ChannelType, RecipientRef, TemplateCode, PayloadJson, RelatedDocumentType, RelatedDocumentId, DeliveryStatus, AttemptCount, LastError, ProcessedOn, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId, NotificationKey, Title, Body, Module, Category, Severity, IsRead, RequiresAction, DocumentRef, AuditActionLabel, StatusLabel, ActionLabel, ActionPath, ReadOn)
SELECT 1, NULL, N'InApp', N'role:PlantHead', N'GENERIC_INFO', N'{}', n.Module, NULL, N'Delivered', 0, NULL, n.CreatedOn, n.CreatedOn, NULL, @now, NULL, n.NotificationKey, n.Title, n.Body, n.Module, n.Category, n.Severity, n.IsRead, n.RequiresAction, n.DocumentRef, n.AuditActionLabel, n.StatusLabel, n.ActionLabel, n.ActionPath, CASE WHEN n.IsRead = 1 THEN n.CreatedOn ELSE NULL END
FROM @notifications n
WHERE NOT EXISTS (SELECT 1 FROM platform.Notifications existing WHERE existing.NotificationKey = n.NotificationKey);

DECLARE @approvals TABLE
(
    WorkItemKey NVARCHAR(128),
    Module NVARCHAR(64),
    DocumentType NVARCHAR(64),
    ReferenceNo NVARCHAR(128),
    Title NVARCHAR(256),
    Summary NVARCHAR(MAX),
    SubmittedBy NVARCHAR(160),
    SubmittedOn DATETIMEOFFSET(7),
    DueOn DATETIMEOFFSET(7),
    Status NVARCHAR(32),
    Priority NVARCHAR(16),
    StepName NVARCHAR(128),
    AuditActionLabel NVARCHAR(160),
    RelatedNotificationKey NVARCHAR(128),
    ActionPath NVARCHAR(256),
    TagsJson NVARCHAR(MAX)
);

INSERT INTO @approvals (WorkItemKey, Module, DocumentType, ReferenceNo, Title, Summary, SubmittedBy, SubmittedOn, DueOn, Status, Priority, StepName, AuditActionLabel, RelatedNotificationKey, ActionPath, TagsJson)
VALUES
    (N'approval-bom-r4', N'Engineering', N'BOM Revision', N'BOM-FG-OZ-50 / R4', N'Approve revised ozone tank BOM', N'Revision R4 adds the calibrated leak-test clamp and updates the welding checkpoint notes before release.', N'Neha Patel', DATEADD(hour, -5, @now), DATEADD(hour, 2, @now), N'Pending', N'High', N'Engineering release', N'Approve BOM revision', N'notif-bom-approval', N'/engineering/boms', N'["ECO","QC checkpoint","Release"]'),
    (N'approval-wo-release', N'Production', N'Work order', N'WO-02642', N'Approve work-order re-release after supplier slip', N'Planning has rerouted welding and requested a controlled re-release because RM-SS-SHEET arrived one shift late.', N'Ritika Sharma', DATEADD(hour, -4, @now), DATEADD(hour, 1, @now), N'Escalated', N'High', N'Plant head release gate', N'Approve re-release', N'notif-wo-risk', N'/production/work-orders', N'["Capacity","Shortage","Reschedule"]'),
    (N'approval-po-2204', N'Procurement', N'Purchase order', N'PO-02204', N'Approve outside-processing PO for powder coat run', N'The outside-processing lot needs approval before semi-finished stock is dispatched tomorrow morning.', N'Amit Desai', DATEADD(hour, -7, @now), DATEADD(hour, 18, @now), N'Pending', N'Medium', N'Purchase manager approval', N'Approve outside-processing PO', NULL, N'/partners/suppliers', N'["Subcontract","Vendor","Lead time"]'),
    (N'approval-ai-summary', N'AI', N'Daily summary draft', N'AI-SUM-2026-04-18-A', N'Approve plant-head daily summary draft', N'The generated summary explains stage-wise blockers, dispatch risk, and downtime trends before it is shared externally.', N'AI Draft Assistant', DATEADD(hour, -3, @now), DATEADD(hour, 5, @now), N'Pending', N'Low', N'Management review', N'Approve AI summary', NULL, N'/dashboards/stage-wise', N'["AI","Summary","Management"]');

INSERT INTO platform.ApprovalWorkItems
    (WorkItemKey, CompanyId, BranchId, Module, DocumentType, ReferenceNo, Title, Summary, SubmittedBy, SubmittedOn, DueOn, Status, Priority, StepName, AuditActionLabel, RelatedNotificationKey, ActionPath, TagsJson, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
SELECT a.WorkItemKey, 1, NULL, a.Module, a.DocumentType, a.ReferenceNo, a.Title, a.Summary, a.SubmittedBy, a.SubmittedOn, a.DueOn, a.Status, a.Priority, a.StepName, a.AuditActionLabel, a.RelatedNotificationKey, a.ActionPath, a.TagsJson, @now, NULL, @now, NULL
FROM @approvals a
WHERE NOT EXISTS (SELECT 1 FROM platform.ApprovalWorkItems existing WHERE existing.WorkItemKey = a.WorkItemKey);
