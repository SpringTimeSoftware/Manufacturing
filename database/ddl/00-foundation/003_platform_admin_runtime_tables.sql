SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

IF OBJECT_ID(N'platform.AppUsers', N'U') IS NULL
BEGIN
    CREATE TABLE platform.AppUsers
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserName NVARCHAR(128) NOT NULL,
        DisplayName NVARCHAR(160) NOT NULL,
        Email NVARCHAR(256) NULL,
        LanguageCode NVARCHAR(16) NOT NULL,
        DefaultCompanyId BIGINT NULL,
        DefaultBranchId BIGINT NULL,
        Status NVARCHAR(32) NOT NULL,
        LoginPolicy NVARCHAR(128) NULL,
        LastLoginText NVARCHAR(64) NULL,
        DeviceBinding NVARCHAR(128) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_AppUsers_UserName' AND object_id = OBJECT_ID(N'platform.AppUsers'))
    CREATE UNIQUE INDEX UX_AppUsers_UserName ON platform.AppUsers(UserName);

IF OBJECT_ID(N'platform.Roles', N'U') IS NULL
BEGIN
    CREATE TABLE platform.Roles
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        RoleCode NVARCHAR(64) NOT NULL,
        RoleName NVARCHAR(128) NOT NULL,
        Audience NVARCHAR(256) NULL,
        ScopeMode NVARCHAR(64) NOT NULL,
        MobileSurface NVARCHAR(128) NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Roles_RoleCode' AND object_id = OBJECT_ID(N'platform.Roles'))
    CREATE UNIQUE INDEX UX_Roles_RoleCode ON platform.Roles(RoleCode);

IF OBJECT_ID(N'platform.Permissions', N'U') IS NULL
BEGIN
    CREATE TABLE platform.Permissions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PermissionCode NVARCHAR(128) NOT NULL,
        Module NVARCHAR(64) NOT NULL,
        AccessLevel NVARCHAR(32) NOT NULL,
        DataScope NVARCHAR(64) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Permissions_PermissionCode' AND object_id = OBJECT_ID(N'platform.Permissions'))
    CREATE UNIQUE INDEX UX_Permissions_PermissionCode ON platform.Permissions(PermissionCode);

IF OBJECT_ID(N'platform.RolePermissions', N'U') IS NULL
BEGIN
    CREATE TABLE platform.RolePermissions
    (
        RoleId BIGINT NOT NULL,
        PermissionId BIGINT NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleId, PermissionId)
    );
END;

IF OBJECT_ID(N'platform.UserRoles', N'U') IS NULL
BEGIN
    CREATE TABLE platform.UserRoles
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId BIGINT NOT NULL,
        RoleId BIGINT NOT NULL,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UserRoles_RoleId' AND object_id = OBJECT_ID(N'platform.UserRoles'))
    CREATE INDEX IX_UserRoles_RoleId ON platform.UserRoles(RoleId);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UserRoles_UserId_RoleId_CompanyId_BranchId' AND object_id = OBJECT_ID(N'platform.UserRoles'))
    CREATE UNIQUE INDEX UX_UserRoles_UserId_RoleId_CompanyId_BranchId ON platform.UserRoles(UserId, RoleId, CompanyId, BranchId);

IF OBJECT_ID(N'platform.DocumentSeries', N'U') IS NULL
BEGIN
    CREATE TABLE platform.DocumentSeries
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        DocumentType NVARCHAR(64) NOT NULL,
        SeriesPattern NVARCHAR(64) NOT NULL,
        CurrentNumber BIGINT NOT NULL,
        ResetPolicy NVARCHAR(32) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_DocumentSeries_CompanyId_BranchId_DocumentType' AND object_id = OBJECT_ID(N'platform.DocumentSeries'))
    CREATE UNIQUE INDEX UX_DocumentSeries_CompanyId_BranchId_DocumentType ON platform.DocumentSeries(CompanyId, BranchId, DocumentType);

IF OBJECT_ID(N'platform.WorkflowDefinitions', N'U') IS NULL
BEGIN
    CREATE TABLE platform.WorkflowDefinitions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WorkflowCode NVARCHAR(64) NOT NULL,
        DocumentType NVARCHAR(64) NOT NULL,
        OwnerRoleCode NVARCHAR(64) NOT NULL,
        ApprovalChain NVARCHAR(256) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        Notes NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_WorkflowDefinitions_CompanyId_BranchId_WorkflowCode' AND object_id = OBJECT_ID(N'platform.WorkflowDefinitions'))
    CREATE UNIQUE INDEX UX_WorkflowDefinitions_CompanyId_BranchId_WorkflowCode ON platform.WorkflowDefinitions(CompanyId, BranchId, WorkflowCode);

IF OBJECT_ID(N'platform.WorkflowSteps', N'U') IS NULL
BEGIN
    CREATE TABLE platform.WorkflowSteps
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        WorkflowDefinitionId BIGINT NOT NULL,
        StepCode NVARCHAR(64) NOT NULL,
        StepName NVARCHAR(128) NOT NULL,
        SequenceNo INT NOT NULL,
        OwnerRoleCode NVARCHAR(64) NOT NULL,
        IsApprovalStep BIT NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_WorkflowSteps_WorkflowDefinitionId_SequenceNo' AND object_id = OBJECT_ID(N'platform.WorkflowSteps'))
    CREATE UNIQUE INDEX UX_WorkflowSteps_WorkflowDefinitionId_SequenceNo ON platform.WorkflowSteps(WorkflowDefinitionId, SequenceNo);

IF OBJECT_ID(N'platform.WorkflowTransitions', N'U') IS NULL
BEGIN
    CREATE TABLE platform.WorkflowTransitions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        WorkflowDefinitionId BIGINT NOT NULL,
        FromStatus NVARCHAR(64) NOT NULL,
        ToStatus NVARCHAR(64) NOT NULL,
        ActionCode NVARCHAR(64) NOT NULL,
        SequenceNo INT NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_WorkflowTransitions_WorkflowDefinitionId_ActionCode' AND object_id = OBJECT_ID(N'platform.WorkflowTransitions'))
    CREATE UNIQUE INDEX UX_WorkflowTransitions_WorkflowDefinitionId_ActionCode ON platform.WorkflowTransitions(WorkflowDefinitionId, ActionCode);

IF OBJECT_ID(N'platform.PlatformSettings', N'U') IS NULL
BEGIN
    CREATE TABLE platform.PlatformSettings
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        SettingGroup NVARCHAR(64) NOT NULL,
        SettingKey NVARCHAR(128) NOT NULL,
        SettingLabel NVARCHAR(160) NOT NULL,
        SettingValue NVARCHAR(256) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        Description NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PlatformSettings_CompanyId_BranchId_SettingKey' AND object_id = OBJECT_ID(N'platform.PlatformSettings'))
    CREATE UNIQUE INDEX UX_PlatformSettings_CompanyId_BranchId_SettingKey ON platform.PlatformSettings(CompanyId, BranchId, SettingKey);

IF OBJECT_ID(N'platform.PasswordResetRequests', N'U') IS NULL
BEGIN
    CREATE TABLE platform.PasswordResetRequests
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        RequestToken NVARCHAR(96) NOT NULL,
        UserNameOrEmail NVARCHAR(256) NOT NULL,
        CompanyCode NVARCHAR(64) NULL,
        Channel NVARCHAR(32) NOT NULL,
        RecoveryMode NVARCHAR(32) NOT NULL,
        DeliverySummary NVARCHAR(512) NOT NULL,
        AvailableChallengesJson NVARCHAR(MAX) NOT NULL,
        ExpiresOnUtc DATETIMEOFFSET(7) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PasswordResetRequests_RequestToken' AND object_id = OBJECT_ID(N'platform.PasswordResetRequests'))
    CREATE UNIQUE INDEX UX_PasswordResetRequests_RequestToken ON platform.PasswordResetRequests(RequestToken);

IF OBJECT_ID(N'platform.ApprovalWorkItems', N'U') IS NULL
BEGIN
    CREATE TABLE platform.ApprovalWorkItems
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        WorkItemKey NVARCHAR(128) NOT NULL,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        Module NVARCHAR(64) NOT NULL,
        DocumentType NVARCHAR(64) NOT NULL,
        ReferenceNo NVARCHAR(128) NOT NULL,
        Title NVARCHAR(256) NOT NULL,
        Summary NVARCHAR(MAX) NOT NULL,
        SubmittedBy NVARCHAR(160) NOT NULL,
        SubmittedOn DATETIMEOFFSET(7) NOT NULL,
        DueOn DATETIMEOFFSET(7) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        Priority NVARCHAR(16) NOT NULL,
        StepName NVARCHAR(128) NOT NULL,
        AuditActionLabel NVARCHAR(160) NOT NULL,
        RelatedNotificationKey NVARCHAR(128) NULL,
        ActionPath NVARCHAR(256) NULL,
        TagsJson NVARCHAR(MAX) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ApprovalWorkItems_WorkItemKey' AND object_id = OBJECT_ID(N'platform.ApprovalWorkItems'))
    CREATE UNIQUE INDEX UX_ApprovalWorkItems_WorkItemKey ON platform.ApprovalWorkItems(WorkItemKey);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ApprovalWorkItems_Status_DueOn' AND object_id = OBJECT_ID(N'platform.ApprovalWorkItems'))
    CREATE INDEX IX_ApprovalWorkItems_Status_DueOn ON platform.ApprovalWorkItems(Status, DueOn);

IF OBJECT_ID(N'platform.ApprovalDecisions', N'U') IS NULL
BEGIN
    CREATE TABLE platform.ApprovalDecisions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ApprovalWorkItemId BIGINT NOT NULL,
        Decision NVARCHAR(32) NOT NULL,
        Remarks NVARCHAR(1024) NULL,
        DecidedOn DATETIMEOFFSET(7) NOT NULL,
        DecidedByUserId BIGINT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ApprovalDecisions_ApprovalWorkItemId_DecidedOn' AND object_id = OBJECT_ID(N'platform.ApprovalDecisions'))
    CREATE INDEX IX_ApprovalDecisions_ApprovalWorkItemId_DecidedOn ON platform.ApprovalDecisions(ApprovalWorkItemId, DecidedOn);

IF COL_LENGTH(N'platform.Notifications', N'NotificationKey') IS NULL
    ALTER TABLE platform.Notifications ADD NotificationKey NVARCHAR(128) NULL;
IF COL_LENGTH(N'platform.Notifications', N'Title') IS NULL
    ALTER TABLE platform.Notifications ADD Title NVARCHAR(256) NULL;
IF COL_LENGTH(N'platform.Notifications', N'Body') IS NULL
    ALTER TABLE platform.Notifications ADD Body NVARCHAR(MAX) NULL;
IF COL_LENGTH(N'platform.Notifications', N'Module') IS NULL
    ALTER TABLE platform.Notifications ADD Module NVARCHAR(64) NULL;
IF COL_LENGTH(N'platform.Notifications', N'Category') IS NULL
    ALTER TABLE platform.Notifications ADD Category NVARCHAR(32) NULL;
IF COL_LENGTH(N'platform.Notifications', N'Severity') IS NULL
    ALTER TABLE platform.Notifications ADD Severity NVARCHAR(16) NULL;
IF COL_LENGTH(N'platform.Notifications', N'IsRead') IS NULL
    ALTER TABLE platform.Notifications ADD IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0);
IF COL_LENGTH(N'platform.Notifications', N'RequiresAction') IS NULL
    ALTER TABLE platform.Notifications ADD RequiresAction BIT NOT NULL CONSTRAINT DF_Notifications_RequiresAction DEFAULT (0);
IF COL_LENGTH(N'platform.Notifications', N'DocumentRef') IS NULL
    ALTER TABLE platform.Notifications ADD DocumentRef NVARCHAR(128) NULL;
IF COL_LENGTH(N'platform.Notifications', N'AuditActionLabel') IS NULL
    ALTER TABLE platform.Notifications ADD AuditActionLabel NVARCHAR(160) NULL;
IF COL_LENGTH(N'platform.Notifications', N'StatusLabel') IS NULL
    ALTER TABLE platform.Notifications ADD StatusLabel NVARCHAR(64) NULL;
IF COL_LENGTH(N'platform.Notifications', N'ActionLabel') IS NULL
    ALTER TABLE platform.Notifications ADD ActionLabel NVARCHAR(96) NULL;
IF COL_LENGTH(N'platform.Notifications', N'ActionPath') IS NULL
    ALTER TABLE platform.Notifications ADD ActionPath NVARCHAR(256) NULL;
IF COL_LENGTH(N'platform.Notifications', N'ReadOn') IS NULL
    ALTER TABLE platform.Notifications ADD ReadOn DATETIMEOFFSET(7) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Notifications_NotificationKey' AND object_id = OBJECT_ID(N'platform.Notifications'))
    EXEC(N'CREATE UNIQUE INDEX UX_Notifications_NotificationKey ON platform.Notifications(NotificationKey) WHERE NotificationKey IS NOT NULL');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Notifications_Inbox_CompanyId_BranchId_CreatedOn' AND object_id = OBJECT_ID(N'platform.Notifications'))
    CREATE INDEX IX_Notifications_Inbox_CompanyId_BranchId_CreatedOn ON platform.Notifications(CompanyId, BranchId, CreatedOn);
