IF SCHEMA_ID(N'reporting') IS NULL
    EXEC(N'CREATE SCHEMA reporting');
GO

IF OBJECT_ID(N'reporting.ReportDefinitions', N'U') IS NULL
BEGIN
    CREATE TABLE reporting.ReportDefinitions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ReportDefinitions PRIMARY KEY,
        CompanyId BIGINT NULL,
        ReportCode NVARCHAR(96) NOT NULL,
        ReportName NVARCHAR(160) NOT NULL,
        Module NVARCHAR(64) NOT NULL,
        Category NVARCHAR(64) NOT NULL,
        Description NVARCHAR(512) NULL,
        DatasetSource NVARCHAR(128) NOT NULL,
        ReportType NVARCHAR(32) NOT NULL,
        OutputFormatsJson NVARCHAR(MAX) NOT NULL,
        PermissionKey NVARCHAR(128) NOT NULL,
        ParameterSchemaJson NVARCHAR(MAX) NOT NULL,
        DefaultFiltersJson NVARCHAR(MAX) NULL,
        OwnerUserName NVARCHAR(160) NULL,
        VersionNo INT NOT NULL CONSTRAINT DF_ReportDefinitions_VersionNo DEFAULT(1),
        Status NVARCHAR(24) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_ReportDefinitions_IsActive DEFAULT(1),
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ReportDefinitions_CreatedOn DEFAULT(SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ReportDefinitions_ModifiedOn DEFAULT(SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );
    CREATE UNIQUE INDEX UX_ReportDefinitions_Company_Code ON reporting.ReportDefinitions(CompanyId, ReportCode);
END;
GO

IF OBJECT_ID(N'reporting.ReportRuns', N'U') IS NULL
BEGIN
    CREATE TABLE reporting.ReportRuns
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ReportRuns PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ReportDefinitionId BIGINT NOT NULL,
        RunNo NVARCHAR(96) NOT NULL,
        ParametersJson NVARCHAR(MAX) NOT NULL,
        OutputFormat NVARCHAR(16) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        RowCount INT NOT NULL CONSTRAINT DF_ReportRuns_RowCount DEFAULT(0),
        FailureReason NVARCHAR(1024) NULL,
        StartedOn DATETIMEOFFSET NOT NULL,
        CompletedOn DATETIMEOFFSET NULL,
        GeneratedByUserId BIGINT NULL,
        SourceReportVersion INT NOT NULL,
        SourceEntityType NVARCHAR(96) NULL,
        SourceEntityId BIGINT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ReportRuns_CreatedOn DEFAULT(SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ReportRuns_ModifiedOn DEFAULT(SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );
    CREATE UNIQUE INDEX UX_ReportRuns_Company_Branch_RunNo ON reporting.ReportRuns(CompanyId, BranchId, RunNo);
    CREATE INDEX IX_ReportRuns_ReportDefinitionId ON reporting.ReportRuns(ReportDefinitionId);
END;
GO

IF OBJECT_ID(N'reporting.ReportOutputs', N'U') IS NULL
BEGIN
    CREATE TABLE reporting.ReportOutputs
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ReportOutputs PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ReportRunId BIGINT NOT NULL,
        FileName NVARCHAR(180) NOT NULL,
        OutputFormat NVARCHAR(16) NOT NULL,
        ContentType NVARCHAR(128) NOT NULL,
        StoragePath NVARCHAR(512) NOT NULL,
        Checksum NVARCHAR(128) NOT NULL,
        SizeBytes BIGINT NOT NULL,
        ContentText NVARCHAR(MAX) NULL,
        Status NVARCHAR(24) NOT NULL,
        GeneratedOn DATETIMEOFFSET NOT NULL,
        DownloadCount INT NOT NULL CONSTRAINT DF_ReportOutputs_DownloadCount DEFAULT(0),
        LastDownloadedOn DATETIMEOFFSET NULL,
        LastDownloadedByUserId BIGINT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ReportOutputs_CreatedOn DEFAULT(SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ReportOutputs_ModifiedOn DEFAULT(SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );
    CREATE INDEX IX_ReportOutputs_ReportRunId ON reporting.ReportOutputs(ReportRunId);
END;
GO

IF OBJECT_ID(N'reporting.DashboardDefinitions', N'U') IS NULL
BEGIN
    CREATE TABLE reporting.DashboardDefinitions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DashboardDefinitions PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        DashboardCode NVARCHAR(96) NOT NULL,
        DashboardName NVARCHAR(160) NOT NULL,
        Module NVARCHAR(64) NOT NULL,
        Description NVARCHAR(512) NULL,
        VisibilityRole NVARCHAR(64) NULL,
        OwnerUserId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_DashboardDefinitions_CreatedOn DEFAULT(SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_DashboardDefinitions_ModifiedOn DEFAULT(SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );
    CREATE UNIQUE INDEX UX_DashboardDefinitions_Company_Branch_Code ON reporting.DashboardDefinitions(CompanyId, BranchId, DashboardCode);
END;
GO

IF OBJECT_ID(N'reporting.DashboardWidgets', N'U') IS NULL
BEGIN
    CREATE TABLE reporting.DashboardWidgets
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DashboardWidgets PRIMARY KEY,
        DashboardDefinitionId BIGINT NOT NULL,
        WidgetCode NVARCHAR(96) NOT NULL,
        Title NVARCHAR(160) NOT NULL,
        WidgetType NVARCHAR(32) NOT NULL,
        ReportDefinitionId BIGINT NULL,
        DatasetSource NVARCHAR(128) NULL,
        FiltersJson NVARCHAR(MAX) NOT NULL,
        DrilldownRoute NVARCHAR(256) NULL,
        DrilldownFilterJson NVARCHAR(MAX) NULL,
        LayoutX INT NOT NULL,
        LayoutY INT NOT NULL,
        LayoutW INT NOT NULL,
        LayoutH INT NOT NULL,
        RefreshMinutes INT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_DashboardWidgets_CreatedOn DEFAULT(SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_DashboardWidgets_ModifiedOn DEFAULT(SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );
    CREATE UNIQUE INDEX UX_DashboardWidgets_Dashboard_Code ON reporting.DashboardWidgets(DashboardDefinitionId, WidgetCode);
    CREATE INDEX IX_DashboardWidgets_ReportDefinitionId ON reporting.DashboardWidgets(ReportDefinitionId);
END;
GO
