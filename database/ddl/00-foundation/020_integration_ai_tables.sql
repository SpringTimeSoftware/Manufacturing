IF OBJECT_ID(N'integration.IntegrationProviders', N'U') IS NULL
BEGIN
    CREATE TABLE integration.IntegrationProviders
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ProviderCode NVARCHAR(32) NOT NULL,
        ProviderName NVARCHAR(128) NOT NULL,
        ProviderType NVARCHAR(32) NOT NULL,
        BaseUrl NVARCHAR(256) NULL,
        Status NVARCHAR(24) NOT NULL,
        IsSystemBase BIT NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_IntegrationProviders_ProviderCode' AND object_id = OBJECT_ID(N'integration.IntegrationProviders'))
    CREATE UNIQUE INDEX UX_IntegrationProviders_ProviderCode ON integration.IntegrationProviders(ProviderCode);

IF OBJECT_ID(N'integration.IntegrationConnections', N'U') IS NULL
BEGIN
    CREATE TABLE integration.IntegrationConnections
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NULL,
        IntegrationProviderId BIGINT NOT NULL,
        ConnectionCode NVARCHAR(32) NOT NULL,
        ConnectionName NVARCHAR(128) NOT NULL,
        EndpointUrl NVARCHAR(256) NULL,
        CredentialReference NVARCHAR(128) NULL,
        Status NVARCHAR(24) NOT NULL,
        LastHealthCheckedOn DATETIMEOFFSET(7) NULL,
        LastHealthStatus NVARCHAR(64) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_IntegrationConnections_CompanyId_ConnectionCode' AND object_id = OBJECT_ID(N'integration.IntegrationConnections'))
    CREATE UNIQUE INDEX UX_IntegrationConnections_CompanyId_ConnectionCode ON integration.IntegrationConnections(CompanyId, ConnectionCode);

IF OBJECT_ID(N'integration.WebhookSubscriptions', N'U') IS NULL
BEGIN
    CREATE TABLE integration.WebhookSubscriptions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NULL,
        SubscriptionCode NVARCHAR(32) NOT NULL,
        EventType NVARCHAR(64) NOT NULL,
        TargetUrl NVARCHAR(256) NOT NULL,
        SecretReference NVARCHAR(128) NULL,
        HeadersJson NVARCHAR(4000) NULL,
        Status NVARCHAR(24) NOT NULL,
        LastDeliveredOn DATETIMEOFFSET(7) NULL,
        RetryQueuedOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_WebhookSubscriptions_CompanyId_SubscriptionCode' AND object_id = OBJECT_ID(N'integration.WebhookSubscriptions'))
    CREATE UNIQUE INDEX UX_WebhookSubscriptions_CompanyId_SubscriptionCode ON integration.WebhookSubscriptions(CompanyId, SubscriptionCode);

IF OBJECT_ID(N'integration.ImportJobs', N'U') IS NULL
BEGIN
    CREATE TABLE integration.ImportJobs
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        JobNo NVARCHAR(32) NOT NULL,
        Module NVARCHAR(64) NOT NULL,
        SourceFormat NVARCHAR(24) NOT NULL,
        StoragePath NVARCHAR(256) NOT NULL,
        RequestToken NVARCHAR(64) NULL,
        Status NVARCHAR(24) NOT NULL,
        RequestedOn DATETIMEOFFSET(7) NOT NULL,
        ProcessedOn DATETIMEOFFSET(7) NULL,
        LastError NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ImportJobs_CompanyId_JobNo' AND object_id = OBJECT_ID(N'integration.ImportJobs'))
    CREATE UNIQUE INDEX UX_ImportJobs_CompanyId_JobNo ON integration.ImportJobs(CompanyId, JobNo);

IF OBJECT_ID(N'integration.ExportJobs', N'U') IS NULL
BEGIN
    CREATE TABLE integration.ExportJobs
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        JobNo NVARCHAR(32) NOT NULL,
        Module NVARCHAR(64) NOT NULL,
        OutputFormat NVARCHAR(24) NOT NULL,
        FilterJson NVARCHAR(4000) NULL,
        StoragePath NVARCHAR(256) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        RequestedOn DATETIMEOFFSET(7) NOT NULL,
        ProcessedOn DATETIMEOFFSET(7) NULL,
        LastError NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ExportJobs_CompanyId_JobNo' AND object_id = OBJECT_ID(N'integration.ExportJobs'))
    CREATE UNIQUE INDEX UX_ExportJobs_CompanyId_JobNo ON integration.ExportJobs(CompanyId, JobNo);

IF OBJECT_ID(N'ai.AiProviders', N'U') IS NULL
BEGIN
    CREATE TABLE ai.AiProviders
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ProviderCode NVARCHAR(32) NOT NULL,
        ProviderName NVARCHAR(128) NOT NULL,
        ProviderType NVARCHAR(32) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_AiProviders_ProviderCode' AND object_id = OBJECT_ID(N'ai.AiProviders'))
    CREATE UNIQUE INDEX UX_AiProviders_ProviderCode ON ai.AiProviders(ProviderCode);

IF OBJECT_ID(N'ai.AiModels', N'U') IS NULL
BEGIN
    CREATE TABLE ai.AiModels
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        AiProviderId BIGINT NOT NULL,
        ModelCode NVARCHAR(64) NOT NULL,
        ModelName NVARCHAR(128) NOT NULL,
        CapabilityFlagsJson NVARCHAR(4000) NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_AiModels_AiProviderId_ModelCode' AND object_id = OBJECT_ID(N'ai.AiModels'))
    CREATE UNIQUE INDEX UX_AiModels_AiProviderId_ModelCode ON ai.AiModels(AiProviderId, ModelCode);

IF OBJECT_ID(N'ai.AiPromptTemplates', N'U') IS NULL
BEGIN
    CREATE TABLE ai.AiPromptTemplates
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        TemplateCode NVARCHAR(32) NOT NULL,
        TemplateName NVARCHAR(128) NOT NULL,
        PromptPurpose NVARCHAR(32) NOT NULL,
        TemplateBody NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_AiPromptTemplates_CompanyId_TemplateCode' AND object_id = OBJECT_ID(N'ai.AiPromptTemplates'))
    CREATE UNIQUE INDEX UX_AiPromptTemplates_CompanyId_TemplateCode ON ai.AiPromptTemplates(CompanyId, TemplateCode);

IF OBJECT_ID(N'ai.AiRuns', N'U') IS NULL
BEGIN
    CREATE TABLE ai.AiRuns
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        AiProviderId BIGINT NOT NULL,
        AiModelId BIGINT NOT NULL,
        AiPromptTemplateId BIGINT NULL,
        DraftPurpose NVARCHAR(32) NOT NULL,
        RelatedDocumentType NVARCHAR(64) NULL,
        RelatedDocumentId BIGINT NULL,
        InputText NVARCHAR(MAX) NOT NULL,
        OutputText NVARCHAR(MAX) NULL,
        RunStatus NVARCHAR(24) NOT NULL,
        TokenUsageJson NVARCHAR(512) NULL,
        RequiresReview BIT NOT NULL,
        RequestedOn DATETIMEOFFSET(7) NOT NULL,
        CompletedOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AiRuns_CompanyId_RequestedOn' AND object_id = OBJECT_ID(N'ai.AiRuns'))
    CREATE INDEX IX_AiRuns_CompanyId_RequestedOn ON ai.AiRuns(CompanyId, RequestedOn);
