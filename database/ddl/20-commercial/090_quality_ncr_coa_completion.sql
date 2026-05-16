IF OBJECT_ID(N'quality.InspectionPlanCharacteristics', N'U') IS NULL
BEGIN
    CREATE TABLE quality.InspectionPlanCharacteristics
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        InspectionPlanId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ParameterCode NVARCHAR(64) NOT NULL,
        ParameterName NVARCHAR(160) NOT NULL,
        CharacteristicType NVARCHAR(24) NOT NULL,
        ExpectedValue NVARCHAR(256) NULL,
        LowerLimit DECIMAL(18,6) NULL,
        UpperLimit DECIMAL(18,6) NULL,
        UomId BIGINT NULL,
        SampleSize INT NOT NULL CONSTRAINT DF_InspectionPlanCharacteristics_SampleSize DEFAULT (1),
        IsMandatory BIT NOT NULL CONSTRAINT DF_InspectionPlanCharacteristics_IsMandatory DEFAULT (1),
        Status NVARCHAR(24) NOT NULL CONSTRAINT DF_InspectionPlanCharacteristics_Status DEFAULT (N'Active'),
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_InspectionPlanCharacteristics_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_InspectionPlanCharacteristics_ModifiedOn DEFAULT (SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_InspectionPlanCharacteristics_Plan_LineNo' AND object_id = OBJECT_ID(N'quality.InspectionPlanCharacteristics'))
    CREATE UNIQUE INDEX UX_InspectionPlanCharacteristics_Plan_LineNo ON quality.InspectionPlanCharacteristics(InspectionPlanId, [LineNo]);

IF COL_LENGTH(N'quality.NonConformances', N'DefectCategory') IS NULL
    ALTER TABLE quality.NonConformances ADD DefectCategory NVARCHAR(80) NULL;
IF COL_LENGTH(N'quality.NonConformances', N'ContainmentAction') IS NULL
    ALTER TABLE quality.NonConformances ADD ContainmentAction NVARCHAR(512) NULL;
IF COL_LENGTH(N'quality.NonConformances', N'CorrectiveAction') IS NULL
    ALTER TABLE quality.NonConformances ADD CorrectiveAction NVARCHAR(512) NULL;
IF COL_LENGTH(N'quality.NonConformances', N'PreventiveAction') IS NULL
    ALTER TABLE quality.NonConformances ADD PreventiveAction NVARCHAR(512) NULL;
IF COL_LENGTH(N'quality.NonConformances', N'DispositionReleasedOn') IS NULL
    ALTER TABLE quality.NonConformances ADD DispositionReleasedOn DATETIMEOFFSET(7) NULL;
IF COL_LENGTH(N'quality.NonConformances', N'DispositionReleasedByUserId') IS NULL
    ALTER TABLE quality.NonConformances ADD DispositionReleasedByUserId BIGINT NULL;
IF COL_LENGTH(N'quality.NonConformances', N'ClosedOn') IS NULL
    ALTER TABLE quality.NonConformances ADD ClosedOn DATETIMEOFFSET(7) NULL;
IF COL_LENGTH(N'quality.NonConformances', N'ClosedByUserId') IS NULL
    ALTER TABLE quality.NonConformances ADD ClosedByUserId BIGINT NULL;

IF OBJECT_ID(N'quality.NonConformanceLines', N'U') IS NULL
BEGIN
    CREATE TABLE quality.NonConformanceLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        NonConformanceId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NULL,
        ItemRevisionId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        AffectedQuantity DECIMAL(18,6) NULL,
        UomId BIGINT NULL,
        DefectCode NVARCHAR(64) NOT NULL,
        DefectDescription NVARCHAR(256) NOT NULL,
        Disposition NVARCHAR(32) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_NonConformanceLines_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_NonConformanceLines_ModifiedOn DEFAULT (SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_NonConformanceLines_Ncr_LineNo' AND object_id = OBJECT_ID(N'quality.NonConformanceLines'))
    CREATE UNIQUE INDEX UX_NonConformanceLines_Ncr_LineNo ON quality.NonConformanceLines(NonConformanceId, [LineNo]);

IF OBJECT_ID(N'quality.CoaCertificates', N'U') IS NULL
BEGIN
    CREATE TABLE quality.CoaCertificates
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        CoaNo NVARCHAR(40) NOT NULL,
        InspectionRecordId BIGINT NOT NULL,
        SourceDocumentType NVARCHAR(64) NOT NULL,
        SourceDocumentId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        TemplateCode NVARCHAR(80) NOT NULL,
        VersionNo INT NOT NULL,
        StoragePath NVARCHAR(512) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        GeneratedOn DATETIMEOFFSET(7) NOT NULL,
        GeneratedByUserId BIGINT NULL,
        IssuedOn DATETIMEOFFSET(7) NULL,
        IssuedByUserId BIGINT NULL,
        ReissueReason NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_CoaCertificates_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_CoaCertificates_ModifiedOn DEFAULT (SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CoaCertificates_Company_Coa_Version' AND object_id = OBJECT_ID(N'quality.CoaCertificates'))
    CREATE UNIQUE INDEX UX_CoaCertificates_Company_Coa_Version ON quality.CoaCertificates(CompanyId, CoaNo, VersionNo);

IF OBJECT_ID(N'quality.CoaCertificateLines', N'U') IS NULL
BEGIN
    CREATE TABLE quality.CoaCertificateLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CoaCertificateId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ParameterCode NVARCHAR(64) NOT NULL,
        ExpectedValue NVARCHAR(256) NULL,
        ActualValue NVARCHAR(256) NULL,
        ResultStatus NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_CoaCertificateLines_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_CoaCertificateLines_ModifiedOn DEFAULT (SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CoaCertificateLines_Coa_LineNo' AND object_id = OBJECT_ID(N'quality.CoaCertificateLines'))
    CREATE UNIQUE INDEX UX_CoaCertificateLines_Coa_LineNo ON quality.CoaCertificateLines(CoaCertificateId, [LineNo]);
