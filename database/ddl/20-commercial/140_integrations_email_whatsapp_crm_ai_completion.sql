IF COL_LENGTH(N'integration.IntegrationProviders', N'Channel') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD Channel NVARCHAR(32) NOT NULL CONSTRAINT DF_IntegrationProviders_Channel DEFAULT (N'Email');
IF COL_LENGTH(N'integration.IntegrationProviders', N'VendorType') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD VendorType NVARCHAR(64) NOT NULL CONSTRAINT DF_IntegrationProviders_VendorType DEFAULT (N'Generic');
IF COL_LENGTH(N'integration.IntegrationProviders', N'EnvironmentName') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD EnvironmentName NVARCHAR(24) NOT NULL CONSTRAINT DF_IntegrationProviders_EnvironmentName DEFAULT (N'Production');
IF COL_LENGTH(N'integration.IntegrationProviders', N'CredentialReference') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD CredentialReference NVARCHAR(128) NULL;
IF COL_LENGTH(N'integration.IntegrationProviders', N'SenderIdentity') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD SenderIdentity NVARCHAR(128) NULL;
IF COL_LENGTH(N'integration.IntegrationProviders', N'WhatsAppBusinessNumber') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD WhatsAppBusinessNumber NVARCHAR(64) NULL;
IF COL_LENGTH(N'integration.IntegrationProviders', N'TemplateNamespace') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD TemplateNamespace NVARCHAR(128) NULL;
IF COL_LENGTH(N'integration.IntegrationProviders', N'CrmTenantReference') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD CrmTenantReference NVARCHAR(128) NULL;
IF COL_LENGTH(N'integration.IntegrationProviders', N'CallbackUrl') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD CallbackUrl NVARCHAR(256) NULL;
IF COL_LENGTH(N'integration.IntegrationProviders', N'RateLimitPerMinute') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD RateLimitPerMinute INT NULL;
IF COL_LENGTH(N'integration.IntegrationProviders', N'HealthStatus') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD HealthStatus NVARCHAR(32) NOT NULL CONSTRAINT DF_IntegrationProviders_HealthStatus DEFAULT (N'Unverified');
IF COL_LENGTH(N'integration.IntegrationProviders', N'LastVerifiedAt') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD LastVerifiedAt DATETIMEOFFSET(7) NULL;
IF COL_LENGTH(N'integration.IntegrationProviders', N'FailureReason') IS NULL
    ALTER TABLE integration.IntegrationProviders ADD FailureReason NVARCHAR(512) NULL;

IF OBJECT_ID(N'integration.MessageTemplates', N'U') IS NULL
BEGIN
    CREATE TABLE integration.MessageTemplates
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        IntegrationProviderId BIGINT NULL,
        ChannelType NVARCHAR(32) NOT NULL,
        TemplateCode NVARCHAR(64) NOT NULL,
        TemplateName NVARCHAR(128) NOT NULL,
        TemplateVersion NVARCHAR(32) NOT NULL,
        ApprovalStatus NVARCHAR(32) NOT NULL,
        BodyTemplate NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_MessageTemplates_Company_Channel_Code_Version' AND object_id = OBJECT_ID(N'integration.MessageTemplates'))
    CREATE UNIQUE INDEX UX_MessageTemplates_Company_Channel_Code_Version ON integration.MessageTemplates(CompanyId, ChannelType, TemplateCode, TemplateVersion);

IF OBJECT_ID(N'integration.OutboundMessages', N'U') IS NULL
BEGIN
    CREATE TABLE integration.OutboundMessages
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ChannelType NVARCHAR(32) NOT NULL,
        IntegrationProviderId BIGINT NULL,
        SourceModule NVARCHAR(64) NULL,
        SourceDocumentType NVARCHAR(64) NULL,
        SourceDocumentId BIGINT NULL,
        SourceDocumentNo NVARCHAR(64) NULL,
        Recipient NVARCHAR(256) NOT NULL,
        RecipientType NVARCHAR(32) NOT NULL,
        TemplateCode NVARCHAR(64) NOT NULL,
        Subject NVARCHAR(256) NULL,
        PayloadSnapshotJson NVARCHAR(MAX) NOT NULL,
        BodySnapshot NVARCHAR(MAX) NOT NULL,
        ReportOutputId BIGINT NULL,
        Status NVARCHAR(32) NOT NULL,
        ProviderMessageId NVARCHAR(128) NULL,
        AttemptCount INT NOT NULL CONSTRAINT DF_OutboundMessages_AttemptCount DEFAULT (0),
        LastAttemptedAt DATETIMEOFFSET(7) NULL,
        NextRetryAt DATETIMEOFFSET(7) NULL,
        FailureReason NVARCHAR(512) NULL,
        DeliveryReceiptStatus NVARCHAR(32) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_OutboundMessages_Company_Status_CreatedOn' AND object_id = OBJECT_ID(N'integration.OutboundMessages'))
    CREATE INDEX IX_OutboundMessages_Company_Status_CreatedOn ON integration.OutboundMessages(CompanyId, Status, CreatedOn);

IF OBJECT_ID(N'integration.DeliveryEvents', N'U') IS NULL
BEGIN
    CREATE TABLE integration.DeliveryEvents
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        IntegrationOutboundMessageId BIGINT NOT NULL,
        EventType NVARCHAR(32) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        ProviderMessageId NVARCHAR(128) NULL,
        ResponseCode INT NULL,
        ResponseSummary NVARCHAR(512) NULL,
        FailureReason NVARCHAR(512) NULL,
        EventOn DATETIMEOFFSET(7) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_DeliveryEvents_Message_EventOn' AND object_id = OBJECT_ID(N'integration.DeliveryEvents'))
    CREATE INDEX IX_DeliveryEvents_Message_EventOn ON integration.DeliveryEvents(IntegrationOutboundMessageId, EventOn);

IF OBJECT_ID(N'integration.WebhookEvents', N'U') IS NULL
BEGIN
    CREATE TABLE integration.WebhookEvents
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WebhookSubscriptionId BIGINT NULL,
        IntegrationProviderId BIGINT NULL,
        Direction NVARCHAR(16) NOT NULL,
        EventType NVARCHAR(64) NOT NULL,
        SourceDocumentType NVARCHAR(64) NULL,
        SourceDocumentId BIGINT NULL,
        PayloadReference NVARCHAR(128) NOT NULL,
        PayloadHash NVARCHAR(128) NOT NULL,
        SignatureVerified BIT NOT NULL,
        AttemptCount INT NOT NULL,
        ResponseCode INT NULL,
        ResponseSummary NVARCHAR(512) NULL,
        Status NVARCHAR(32) NOT NULL,
        FailureReason NVARCHAR(512) NULL,
        EventOn DATETIMEOFFSET(7) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF OBJECT_ID(N'integration.CrmObjectMappings', N'U') IS NULL
BEGIN
    CREATE TABLE integration.CrmObjectMappings
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        IntegrationProviderId BIGINT NOT NULL,
        ErpObjectType NVARCHAR(64) NOT NULL,
        ErpObjectId BIGINT NULL,
        ExternalObjectType NVARCHAR(64) NOT NULL,
        ExternalId NVARCHAR(128) NOT NULL,
        SyncDirection NVARCHAR(24) NOT NULL,
        ConflictStatus NVARCHAR(32) NOT NULL,
        LastSyncedAt DATETIMEOFFSET(7) NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CrmObjectMappings_External' AND object_id = OBJECT_ID(N'integration.CrmObjectMappings'))
    CREATE UNIQUE INDEX UX_CrmObjectMappings_External ON integration.CrmObjectMappings(CompanyId, IntegrationProviderId, ExternalObjectType, ExternalId);

IF OBJECT_ID(N'integration.CrmSyncJobs', N'U') IS NULL
BEGIN
    CREATE TABLE integration.CrmSyncJobs
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        IntegrationProviderId BIGINT NOT NULL,
        CrmObjectMappingId BIGINT NULL,
        ObjectType NVARCHAR(64) NOT NULL,
        SyncDirection NVARCHAR(24) NOT NULL,
        PayloadSnapshotJson NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        FailureReason NVARCHAR(512) NULL,
        RequestedOn DATETIMEOFFSET(7) NOT NULL,
        CompletedOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF OBJECT_ID(N'integration.CrmSyncConflicts', N'U') IS NULL
BEGIN
    CREATE TABLE integration.CrmSyncConflicts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        CrmSyncJobId BIGINT NOT NULL,
        ObjectType NVARCHAR(64) NOT NULL,
        ErpObjectId BIGINT NULL,
        ExternalId NVARCHAR(128) NULL,
        ConflictType NVARCHAR(64) NOT NULL,
        ResolutionStatus NVARCHAR(32) NOT NULL,
        DetailsJson NVARCHAR(MAX) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF COL_LENGTH(N'ai.AiRuns', N'ReviewStatus') IS NULL
    ALTER TABLE ai.AiRuns ADD ReviewStatus NVARCHAR(24) NOT NULL CONSTRAINT DF_AiRuns_ReviewStatus DEFAULT (N'Drafted');
IF COL_LENGTH(N'ai.AiRuns', N'ReviewedByUserId') IS NULL
    ALTER TABLE ai.AiRuns ADD ReviewedByUserId BIGINT NULL;
IF COL_LENGTH(N'ai.AiRuns', N'ReviewedOn') IS NULL
    ALTER TABLE ai.AiRuns ADD ReviewedOn DATETIMEOFFSET(7) NULL;
IF COL_LENGTH(N'ai.AiRuns', N'ReviewNote') IS NULL
    ALTER TABLE ai.AiRuns ADD ReviewNote NVARCHAR(512) NULL;
IF COL_LENGTH(N'ai.AiRuns', N'AppliedTargetType') IS NULL
    ALTER TABLE ai.AiRuns ADD AppliedTargetType NVARCHAR(64) NULL;
IF COL_LENGTH(N'ai.AiRuns', N'AppliedTargetId') IS NULL
    ALTER TABLE ai.AiRuns ADD AppliedTargetId BIGINT NULL;
