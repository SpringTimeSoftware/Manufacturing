SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

IF SCHEMA_ID(N'platform') IS NULL
    EXEC(N'CREATE SCHEMA platform');

IF OBJECT_ID(N'platform.UdfDefinitions', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'platform.UdfDefinitions', N'Module') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD Module NVARCHAR(64) NOT NULL CONSTRAINT DF_UdfDefinitions_Module DEFAULT N'Platform';
    IF COL_LENGTH(N'platform.UdfDefinitions', N'EntitySubType') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD EntitySubType NVARCHAR(64) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'EntityLevel') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD EntityLevel NVARCHAR(32) NOT NULL CONSTRAINT DF_UdfDefinitions_EntityLevel DEFAULT N'Header';
    IF COL_LENGTH(N'platform.UdfDefinitions', N'Description') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD Description NVARCHAR(512) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'IsUnique') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD IsUnique BIT NOT NULL CONSTRAINT DF_UdfDefinitions_IsUnique DEFAULT 0;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'IsReadOnly') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD IsReadOnly BIT NOT NULL CONSTRAINT DF_UdfDefinitions_IsReadOnly DEFAULT 0;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'DefaultValue') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD DefaultValue NVARCHAR(512) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'PlaceholderText') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD PlaceholderText NVARCHAR(160) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'HelpText') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD HelpText NVARCHAR(512) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'DisplayOrder') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD DisplayOrder INT NOT NULL CONSTRAINT DF_UdfDefinitions_DisplayOrder DEFAULT 100;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'SectionName') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD SectionName NVARCHAR(96) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'EffectiveFrom') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD EffectiveFrom DATETIMEOFFSET(7) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'EffectiveTo') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD EffectiveTo DATETIMEOFFSET(7) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'VersionNo') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD VersionNo INT NOT NULL CONSTRAINT DF_UdfDefinitions_VersionNo DEFAULT 1;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'ValidationRulesJson') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD ValidationRulesJson NVARCHAR(MAX) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'OptionSetCode') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD OptionSetCode NVARCHAR(96) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'LookupSourceType') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD LookupSourceType NVARCHAR(32) NULL;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'IsReportable') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD IsReportable BIT NOT NULL CONSTRAINT DF_UdfDefinitions_IsReportable DEFAULT 0;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'AllowIntegration') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD AllowIntegration BIT NOT NULL CONSTRAINT DF_UdfDefinitions_AllowIntegration DEFAULT 0;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'AllowMobile') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD AllowMobile BIT NOT NULL CONSTRAINT DF_UdfDefinitions_AllowMobile DEFAULT 0;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'IsSensitive') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD IsSensitive BIT NOT NULL CONSTRAINT DF_UdfDefinitions_IsSensitive DEFAULT 0;
    IF COL_LENGTH(N'platform.UdfDefinitions', N'LifecycleGate') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD LifecycleGate NVARCHAR(32) NOT NULL CONSTRAINT DF_UdfDefinitions_LifecycleGate DEFAULT N'DraftSave';
    IF COL_LENGTH(N'platform.UdfDefinitions', N'ValueLockPolicy') IS NULL
        ALTER TABLE platform.UdfDefinitions ADD ValueLockPolicy NVARCHAR(32) NOT NULL CONSTRAINT DF_UdfDefinitions_ValueLockPolicy DEFAULT N'LockOnRelease';
END;

IF OBJECT_ID(N'platform.UdfValues', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH(N'platform.UdfValues', N'CompanyId') IS NULL
        ALTER TABLE platform.UdfValues ADD CompanyId BIGINT NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'EntityType') IS NULL
        ALTER TABLE platform.UdfValues ADD EntityType NVARCHAR(64) NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'EntityLineId') IS NULL
        ALTER TABLE platform.UdfValues ADD EntityLineId BIGINT NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'EntityVersionNo') IS NULL
        ALTER TABLE platform.UdfValues ADD EntityVersionNo INT NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'ValueLongText') IS NULL
        ALTER TABLE platform.UdfValues ADD ValueLongText NVARCHAR(MAX) NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'ValueInteger') IS NULL
        ALTER TABLE platform.UdfValues ADD ValueInteger BIGINT NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'ValueDecimal') IS NULL
        ALTER TABLE platform.UdfValues ADD ValueDecimal DECIMAL(18,6) NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'ValueMoneyAmount') IS NULL
        ALTER TABLE platform.UdfValues ADD ValueMoneyAmount DECIMAL(19,4) NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'ValueCurrencyId') IS NULL
        ALTER TABLE platform.UdfValues ADD ValueCurrencyId BIGINT NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'ValueDateTime') IS NULL
        ALTER TABLE platform.UdfValues ADD ValueDateTime DATETIMEOFFSET(7) NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'ValueOptionId') IS NULL
        ALTER TABLE platform.UdfValues ADD ValueOptionId BIGINT NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'ValueOptionCode') IS NULL
        ALTER TABLE platform.UdfValues ADD ValueOptionCode NVARCHAR(96) NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'ValueJson') IS NULL
        ALTER TABLE platform.UdfValues ADD ValueJson NVARCHAR(MAX) NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'AttachmentReferenceId') IS NULL
        ALTER TABLE platform.UdfValues ADD AttachmentReferenceId BIGINT NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'DisplayValue') IS NULL
        ALTER TABLE platform.UdfValues ADD DisplayValue NVARCHAR(512) NULL;
    IF COL_LENGTH(N'platform.UdfValues', N'Status') IS NULL
        ALTER TABLE platform.UdfValues ADD Status NVARCHAR(32) NOT NULL CONSTRAINT DF_UdfValues_Status DEFAULT N'Active';
END;

IF OBJECT_ID(N'platform.UdfOptionSets', N'U') IS NULL
BEGIN
    CREATE TABLE platform.UdfOptionSets
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        OptionSetCode NVARCHAR(96) NOT NULL,
        OptionSetName NVARCHAR(160) NOT NULL,
        Description NVARCHAR(512) NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UdfOptionSets_Company_Code' AND object_id = OBJECT_ID(N'platform.UdfOptionSets'))
    CREATE UNIQUE INDEX UX_UdfOptionSets_Company_Code ON platform.UdfOptionSets(CompanyId, OptionSetCode);

IF OBJECT_ID(N'platform.UdfOptions', N'U') IS NULL
BEGIN
    CREATE TABLE platform.UdfOptions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        OptionSetId BIGINT NOT NULL,
        OptionCode NVARCHAR(96) NOT NULL,
        OptionName NVARCHAR(160) NOT NULL,
        DisplayOrder INT NOT NULL,
        ColorToken NVARCHAR(32) NULL,
        EffectiveFrom DATETIMEOFFSET(7) NULL,
        EffectiveTo DATETIMEOFFSET(7) NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT FK_UdfOptions_UdfOptionSets FOREIGN KEY (OptionSetId) REFERENCES platform.UdfOptionSets(Id)
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UdfOptions_Set_Code' AND object_id = OBJECT_ID(N'platform.UdfOptions'))
    CREATE UNIQUE INDEX UX_UdfOptions_Set_Code ON platform.UdfOptions(OptionSetId, OptionCode);

IF OBJECT_ID(N'platform.UdfPlacements', N'U') IS NULL
BEGIN
    CREATE TABLE platform.UdfPlacements
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UdfDefinitionId BIGINT NOT NULL,
        CompanyId BIGINT NULL,
        Module NVARCHAR(64) NOT NULL,
        ScreenKey NVARCHAR(128) NOT NULL,
        RoutePath NVARCHAR(256) NULL,
        EntityType NVARCHAR(64) NOT NULL,
        EntityLevel NVARCHAR(32) NOT NULL,
        SectionName NVARCHAR(96) NOT NULL,
        TabName NVARCHAR(96) NULL,
        GroupName NVARCHAR(96) NULL,
        DisplayOrder INT NOT NULL,
        ColumnSpan INT NULL,
        VisibleConditionJson NVARCHAR(MAX) NULL,
        EditableConditionJson NVARCHAR(MAX) NULL,
        RequiredConditionJson NVARCHAR(MAX) NULL,
        PermissionKey NVARCHAR(128) NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT FK_UdfPlacements_UdfDefinitions FOREIGN KEY (UdfDefinitionId) REFERENCES platform.UdfDefinitions(Id)
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UdfPlacements_Screen_Entity_Status' AND object_id = OBJECT_ID(N'platform.UdfPlacements'))
    CREATE INDEX IX_UdfPlacements_Screen_Entity_Status ON platform.UdfPlacements(ScreenKey, EntityType, EntityLevel, Status);

IF OBJECT_ID(N'platform.UdfValueHistory', N'U') IS NULL
BEGIN
    CREATE TABLE platform.UdfValueHistory
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UdfValueId BIGINT NOT NULL,
        DefinitionId BIGINT NOT NULL,
        EntityType NVARCHAR(64) NOT NULL,
        EntityId BIGINT NOT NULL,
        EntityLineId BIGINT NULL,
        PriorDisplayValue NVARCHAR(512) NULL,
        NextDisplayValue NVARCHAR(512) NULL,
        ChangeReason NVARCHAR(256) NULL,
        ChangedOn DATETIMEOFFSET(7) NOT NULL,
        ChangedByUserId BIGINT NULL
    );
END;

IF OBJECT_ID(N'platform.CustomObjects', N'U') IS NULL
BEGIN
    CREATE TABLE platform.CustomObjects
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ObjectCode NVARCHAR(96) NOT NULL,
        ObjectName NVARCHAR(160) NOT NULL,
        Module NVARCHAR(64) NOT NULL,
        Category NVARCHAR(64) NULL,
        PrimaryDisplayFieldCode NVARCHAR(96) NULL,
        Description NVARCHAR(512) NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CustomObjects_Company_Code' AND object_id = OBJECT_ID(N'platform.CustomObjects'))
    CREATE UNIQUE INDEX UX_CustomObjects_Company_Code ON platform.CustomObjects(CompanyId, ObjectCode);

IF OBJECT_ID(N'platform.CustomObjectRecords', N'U') IS NULL
BEGIN
    CREATE TABLE platform.CustomObjectRecords
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CustomObjectId BIGINT NOT NULL,
        CompanyId BIGINT NULL,
        RecordNo NVARCHAR(96) NOT NULL,
        DisplayValue NVARCHAR(256) NULL,
        LinkedEntityType NVARCHAR(64) NULL,
        LinkedEntityId BIGINT NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT FK_CustomObjectRecords_CustomObjects FOREIGN KEY (CustomObjectId) REFERENCES platform.CustomObjects(Id)
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CustomObjectRecords_Object_RecordNo' AND object_id = OBJECT_ID(N'platform.CustomObjectRecords'))
    CREATE UNIQUE INDEX UX_CustomObjectRecords_Object_RecordNo ON platform.CustomObjectRecords(CustomObjectId, RecordNo);

IF OBJECT_ID(N'platform.CustomScreens', N'U') IS NULL
BEGIN
    CREATE TABLE platform.CustomScreens
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ScreenCode NVARCHAR(96) NOT NULL,
        ScreenName NVARCHAR(160) NOT NULL,
        Module NVARCHAR(64) NOT NULL,
        NavigationGroup NVARCHAR(64) NULL,
        BoundEntityType NVARCHAR(64) NULL,
        CustomObjectId BIGINT NULL,
        RoutePath NVARCHAR(256) NOT NULL,
        LayoutJson NVARCHAR(MAX) NOT NULL,
        ListViewJson NVARCHAR(MAX) NULL,
        PermissionKey NVARCHAR(128) NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT FK_CustomScreens_CustomObjects FOREIGN KEY (CustomObjectId) REFERENCES platform.CustomObjects(Id)
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CustomScreens_Company_Code' AND object_id = OBJECT_ID(N'platform.CustomScreens'))
    CREATE UNIQUE INDEX UX_CustomScreens_Company_Code ON platform.CustomScreens(CompanyId, ScreenCode);
