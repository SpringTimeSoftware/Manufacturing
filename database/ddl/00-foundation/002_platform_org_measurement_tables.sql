IF OBJECT_ID(N'platform.AuditLogs', N'U') IS NULL
BEGIN
    CREATE TABLE platform.AuditLogs
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        Module NVARCHAR(64) NOT NULL,
        EntityType NVARCHAR(64) NOT NULL,
        ActionCode NVARCHAR(64) NOT NULL,
        EntityId NVARCHAR(64) NULL,
        BeforeSnapshot NVARCHAR(MAX) NULL,
        AfterSnapshot NVARCHAR(MAX) NULL,
        ReasonCode NVARCHAR(64) NULL,
        CorrelationId NVARCHAR(64) NOT NULL,
        ClientType NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AuditLogs_CompanyId_BranchId_CreatedOn' AND object_id = OBJECT_ID(N'platform.AuditLogs'))
    CREATE INDEX IX_AuditLogs_CompanyId_BranchId_CreatedOn ON platform.AuditLogs(CompanyId, BranchId, CreatedOn);

IF OBJECT_ID(N'platform.Attachments', N'U') IS NULL
BEGIN
    CREATE TABLE platform.Attachments
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        RelatedDocumentType NVARCHAR(64) NOT NULL,
        RelatedDocumentId BIGINT NOT NULL,
        FileName NVARCHAR(256) NOT NULL,
        ContentType NVARCHAR(128) NOT NULL,
        FileSizeBytes BIGINT NOT NULL,
        StoragePath NVARCHAR(512) NOT NULL,
        UploadedByUserId BIGINT NULL,
        UploadedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Attachments_RelatedDocumentType_RelatedDocumentId' AND object_id = OBJECT_ID(N'platform.Attachments'))
    CREATE INDEX IX_Attachments_RelatedDocumentType_RelatedDocumentId ON platform.Attachments(RelatedDocumentType, RelatedDocumentId);

IF OBJECT_ID(N'platform.NotificationTemplates', N'U') IS NULL
BEGIN
    CREATE TABLE platform.NotificationTemplates
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        TemplateCode NVARCHAR(64) NOT NULL,
        ChannelType NVARCHAR(32) NOT NULL,
        TemplateBody NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_NotificationTemplates_TemplateCode_ChannelType_CompanyId_BranchId' AND object_id = OBJECT_ID(N'platform.NotificationTemplates'))
    CREATE UNIQUE INDEX UX_NotificationTemplates_TemplateCode_ChannelType_CompanyId_BranchId ON platform.NotificationTemplates(TemplateCode, ChannelType, CompanyId, BranchId);

IF OBJECT_ID(N'platform.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE platform.Notifications
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ChannelType NVARCHAR(32) NOT NULL,
        RecipientRef NVARCHAR(128) NOT NULL,
        TemplateCode NVARCHAR(64) NOT NULL,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        RelatedDocumentType NVARCHAR(64) NULL,
        RelatedDocumentId BIGINT NULL,
        DeliveryStatus NVARCHAR(32) NOT NULL,
        AttemptCount INT NOT NULL,
        LastError NVARCHAR(512) NULL,
        ProcessedOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Notifications_DeliveryStatus_CreatedOn' AND object_id = OBJECT_ID(N'platform.Notifications'))
    CREATE INDEX IX_Notifications_DeliveryStatus_CreatedOn ON platform.Notifications(DeliveryStatus, CreatedOn);

IF OBJECT_ID(N'platform.Translations', N'U') IS NULL
BEGIN
    CREATE TABLE platform.Translations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        LanguageCode NVARCHAR(16) NOT NULL,
        TranslationKey NVARCHAR(128) NOT NULL,
        TranslationValue NVARCHAR(MAX) NOT NULL,
        Module NVARCHAR(64) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Translations_LanguageCode_CompanyId_BranchId_TranslationKey' AND object_id = OBJECT_ID(N'platform.Translations'))
    CREATE UNIQUE INDEX UX_Translations_LanguageCode_CompanyId_BranchId_TranslationKey ON platform.Translations(LanguageCode, CompanyId, BranchId, TranslationKey);

IF OBJECT_ID(N'org.Companies', N'U') IS NULL
BEGIN
    CREATE TABLE org.Companies
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyCode NVARCHAR(32) NOT NULL,
        CompanyName NVARCHAR(128) NOT NULL,
        LegalName NVARCHAR(160) NOT NULL,
        TaxRegistrationNo NVARCHAR(64) NULL,
        TimeZoneId NVARCHAR(64) NOT NULL,
        DefaultLanguageId BIGINT NULL,
        BaseCurrencyCode NVARCHAR(16) NULL,
        DefaultCalendarCode NVARCHAR(32) NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Companies_CompanyCode' AND object_id = OBJECT_ID(N'org.Companies'))
    CREATE UNIQUE INDEX UX_Companies_CompanyCode ON org.Companies(CompanyCode);

IF OBJECT_ID(N'org.Branches', N'U') IS NULL
BEGIN
    CREATE TABLE org.Branches
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchCode NVARCHAR(32) NOT NULL,
        BranchName NVARCHAR(128) NOT NULL,
        BranchType NVARCHAR(32) NOT NULL,
        TimeZoneId NVARCHAR(64) NOT NULL,
        DefaultLanguageId BIGINT NULL,
        DefaultCalendarCode NVARCHAR(32) NULL,
        DefaultShiftId BIGINT NULL,
        DefaultWarehouseId BIGINT NULL,
        ContactEmail NVARCHAR(128) NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Branches_CompanyId_BranchCode' AND object_id = OBJECT_ID(N'org.Branches'))
    CREATE UNIQUE INDEX UX_Branches_CompanyId_BranchCode ON org.Branches(CompanyId, BranchCode);

IF OBJECT_ID(N'org.Departments', N'U') IS NULL
BEGIN
    CREATE TABLE org.Departments
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        DepartmentCode NVARCHAR(32) NOT NULL,
        DepartmentName NVARCHAR(128) NOT NULL,
        ParentDepartmentId BIGINT NULL,
        ManagerUserId BIGINT NULL,
        DepartmentType NVARCHAR(32) NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Departments_CompanyId_BranchId_DepartmentCode' AND object_id = OBJECT_ID(N'org.Departments'))
    CREATE UNIQUE INDEX UX_Departments_CompanyId_BranchId_DepartmentCode ON org.Departments(CompanyId, BranchId, DepartmentCode);

IF OBJECT_ID(N'org.Shifts', N'U') IS NULL
BEGIN
    CREATE TABLE org.Shifts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ShiftCode NVARCHAR(32) NOT NULL,
        ShiftName NVARCHAR(128) NOT NULL,
        StartTime TIME NOT NULL,
        EndTime TIME NOT NULL,
        CrossesMidnight BIT NOT NULL,
        BreakMinutes INT NOT NULL,
        SequenceNo INT NOT NULL,
        CalendarProfileCode NVARCHAR(32) NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Shifts_CompanyId_BranchId_ShiftCode' AND object_id = OBJECT_ID(N'org.Shifts'))
    CREATE UNIQUE INDEX UX_Shifts_CompanyId_BranchId_ShiftCode ON org.Shifts(CompanyId, BranchId, ShiftCode);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Shifts_CompanyId_BranchId_SequenceNo' AND object_id = OBJECT_ID(N'org.Shifts'))
    CREATE UNIQUE INDEX UX_Shifts_CompanyId_BranchId_SequenceNo ON org.Shifts(CompanyId, BranchId, SequenceNo);

IF OBJECT_ID(N'org.Warehouses', N'U') IS NULL
BEGIN
    CREATE TABLE org.Warehouses
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WarehouseCode NVARCHAR(32) NOT NULL,
        WarehouseName NVARCHAR(128) NOT NULL,
        WarehouseType NVARCHAR(32) NOT NULL,
        IsDefaultReceivingWarehouse BIT NOT NULL,
        IsDefaultIssueWarehouse BIT NOT NULL,
        IsDispatchEnabled BIT NOT NULL,
        AllowsMixedLots BIT NOT NULL,
        AllowsNegativeStock BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Warehouses_CompanyId_WarehouseCode' AND object_id = OBJECT_ID(N'org.Warehouses'))
    CREATE UNIQUE INDEX UX_Warehouses_CompanyId_WarehouseCode ON org.Warehouses(CompanyId, WarehouseCode);

IF OBJECT_ID(N'org.Bins', N'U') IS NULL
BEGIN
    CREATE TABLE org.Bins
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WarehouseId BIGINT NULL,
        ParentBinId BIGINT NULL,
        BinCode NVARCHAR(32) NOT NULL,
        BinName NVARCHAR(128) NOT NULL,
        BinType NVARCHAR(32) NOT NULL,
        CapacityValue DECIMAL(18,4) NULL,
        CapacityUomId BIGINT NULL,
        IsDefaultReceiveBin BIT NOT NULL,
        IsDefaultIssueBin BIT NOT NULL,
        IsCountCycleRequired BIT NOT NULL,
        CountCycleDays INT NULL,
        IsBlocked BIT NOT NULL,
        BlockReasonCode NVARCHAR(64) NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Bins_WarehouseId_BinCode' AND object_id = OBJECT_ID(N'org.Bins'))
    CREATE UNIQUE INDEX UX_Bins_WarehouseId_BinCode ON org.Bins(WarehouseId, BinCode);

IF OBJECT_ID(N'measure.UomClasses', N'U') IS NULL
BEGIN
    CREATE TABLE measure.UomClasses
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ClassCode NVARCHAR(32) NOT NULL,
        ClassName NVARCHAR(128) NOT NULL,
        BaseUomId BIGINT NULL,
        SupportsFormulaConversion BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UomClasses_ClassCode' AND object_id = OBJECT_ID(N'measure.UomClasses'))
    CREATE UNIQUE INDEX UX_UomClasses_ClassCode ON measure.UomClasses(ClassCode);

IF OBJECT_ID(N'measure.Uoms', N'U') IS NULL
BEGIN
    CREATE TABLE measure.Uoms
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UomCode NVARCHAR(24) NOT NULL,
        UomName NVARCHAR(64) NOT NULL,
        Symbol NVARCHAR(16) NULL,
        UomClassId BIGINT NOT NULL,
        DecimalPrecision INT NOT NULL,
        IsSystemBase BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Uoms_UomCode' AND object_id = OBJECT_ID(N'measure.Uoms'))
    CREATE UNIQUE INDEX UX_Uoms_UomCode ON measure.Uoms(UomCode);

IF OBJECT_ID(N'measure.UomConversions', N'U') IS NULL
BEGIN
    CREATE TABLE measure.UomConversions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        FromUomId BIGINT NOT NULL,
        ToUomId BIGINT NOT NULL,
        ConversionMode NVARCHAR(24) NOT NULL,
        FactorNumerator DECIMAL(18,6) NOT NULL,
        FactorDenominator DECIMAL(18,6) NOT NULL,
        FormulaTokenSet NVARCHAR(64) NULL,
        RoundMode NVARCHAR(24) NOT NULL,
        PrecisionScale INT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UomConversions_FromUomId_ToUomId' AND object_id = OBJECT_ID(N'measure.UomConversions'))
    CREATE UNIQUE INDEX UX_UomConversions_FromUomId_ToUomId ON measure.UomConversions(FromUomId, ToUomId);

IF OBJECT_ID(N'measure.MeasurementProfiles', N'U') IS NULL
BEGIN
    CREATE TABLE measure.MeasurementProfiles
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ProfileCode NVARCHAR(32) NOT NULL,
        ProfileName NVARCHAR(128) NOT NULL,
        ProfileType NVARCHAR(24) NOT NULL,
        StockUomClassId BIGINT NOT NULL,
        AllowsCatchWeight BIT NOT NULL,
        RequiresDimensions BIT NOT NULL,
        RequiresDensity BIT NOT NULL,
        RequiresThickness BIT NOT NULL,
        RequiresPackSize BIT NOT NULL,
        SupportsCommercialProductionSplit BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_MeasurementProfiles_ProfileCode' AND object_id = OBJECT_ID(N'measure.MeasurementProfiles'))
    CREATE UNIQUE INDEX UX_MeasurementProfiles_ProfileCode ON measure.MeasurementProfiles(ProfileCode);

IF OBJECT_ID(N'measure.MeasurementFormulas', N'U') IS NULL
BEGIN
    CREATE TABLE measure.MeasurementFormulas
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        MeasurementProfileId BIGINT NOT NULL,
        FormulaCode NVARCHAR(32) NOT NULL,
        FormulaName NVARCHAR(128) NOT NULL,
        FormulaPurpose NVARCHAR(48) NOT NULL,
        ExpressionTemplate NVARCHAR(MAX) NOT NULL,
        OutputUomId BIGINT NOT NULL,
        PrecisionScale INT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_MeasurementFormulas_MeasurementProfileId_FormulaCode' AND object_id = OBJECT_ID(N'measure.MeasurementFormulas'))
    CREATE UNIQUE INDEX UX_MeasurementFormulas_MeasurementProfileId_FormulaCode ON measure.MeasurementFormulas(MeasurementProfileId, FormulaCode);
