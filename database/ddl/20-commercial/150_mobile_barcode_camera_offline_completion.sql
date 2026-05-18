-- Pack 09 - Mobile / barcode / camera / offline / device trust completion.
-- Additive only: no legacy mobile or operational rows are invented/backfilled.

IF SCHEMA_ID(N'mobile') IS NULL
    EXEC(N'CREATE SCHEMA mobile');
GO

IF OBJECT_ID(N'mobile.DeviceRegistrations', N'U') IS NULL
BEGIN
    CREATE TABLE mobile.DeviceRegistrations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_mobile_DeviceRegistrations PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        WarehouseId BIGINT NULL,
        DeviceCode NVARCHAR(80) NOT NULL,
        DeviceName NVARCHAR(160) NOT NULL,
        UserId BIGINT NULL,
        AssignedUserName NVARCHAR(160) NULL,
        Platform NVARCHAR(40) NOT NULL,
        RuntimeName NVARCHAR(80) NOT NULL,
        AppVersion NVARCHAR(40) NULL,
        OperatingSystem NVARCHAR(120) NULL,
        BrowserInfo NVARCHAR(240) NULL,
        ScannerCapability NVARCHAR(40) NOT NULL,
        CameraCapability NVARCHAR(40) NOT NULL,
        OfflineCapability BIT NOT NULL CONSTRAINT DF_mobile_DeviceRegistrations_OfflineCapability DEFAULT (0),
        TrustStatus NVARCHAR(24) NOT NULL,
        IsTrusted BIT NOT NULL CONSTRAINT DF_mobile_DeviceRegistrations_IsTrusted DEFAULT (0),
        IsRevoked BIT NOT NULL CONSTRAINT DF_mobile_DeviceRegistrations_IsRevoked DEFAULT (0),
        ApprovedByUserId BIGINT NULL,
        ApprovedOn DATETIMEOFFSET NULL,
        RevokedByUserId BIGINT NULL,
        RevokedOn DATETIMEOFFSET NULL,
        LastSeenOn DATETIMEOFFSET NULL,
        CredentialReference NVARCHAR(200) NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_DeviceRegistrations_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_DeviceRegistrations_ModifiedOn DEFAULT (SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );

    CREATE UNIQUE INDEX UX_mobile_DeviceRegistrations_Company_DeviceCode
        ON mobile.DeviceRegistrations(CompanyId, DeviceCode);
    CREATE INDEX IX_mobile_DeviceRegistrations_Scope_Trust
        ON mobile.DeviceRegistrations(CompanyId, BranchId, WarehouseId, TrustStatus);
END;
GO

IF OBJECT_ID(N'mobile.OfflineOperations', N'U') IS NULL
BEGIN
    CREATE TABLE mobile.OfflineOperations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_mobile_OfflineOperations PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        WarehouseId BIGINT NULL,
        DeviceRegistrationId BIGINT NOT NULL,
        OperationType NVARCHAR(80) NOT NULL,
        SourceModule NVARCHAR(80) NOT NULL,
        PayloadSnapshotJson NVARCHAR(MAX) NOT NULL,
        IdempotencyKey NVARCHAR(120) NOT NULL,
        CreatedOfflineOn DATETIMEOFFSET NOT NULL,
        QueuedOn DATETIMEOFFSET NOT NULL,
        SyncAttemptedOn DATETIMEOFFSET NULL,
        SyncedOn DATETIMEOFFSET NULL,
        Status NVARCHAR(24) NOT NULL,
        AttemptCount INT NOT NULL CONSTRAINT DF_mobile_OfflineOperations_AttemptCount DEFAULT (0),
        FailureReason NVARCHAR(1000) NULL,
        ConflictReason NVARCHAR(1000) NULL,
        ServerReferenceType NVARCHAR(80) NULL,
        ServerReferenceId BIGINT NULL,
        ServerReferenceNo NVARCHAR(120) NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_OfflineOperations_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_OfflineOperations_ModifiedOn DEFAULT (SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );

    CREATE UNIQUE INDEX UX_mobile_OfflineOperations_Company_Idempotency
        ON mobile.OfflineOperations(CompanyId, IdempotencyKey);
    CREATE INDEX IX_mobile_OfflineOperations_Device_Status_Queued
        ON mobile.OfflineOperations(DeviceRegistrationId, Status, QueuedOn);
END;
GO

IF OBJECT_ID(N'mobile.SyncConflicts', N'U') IS NULL
BEGIN
    CREATE TABLE mobile.SyncConflicts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_mobile_SyncConflicts PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        MobileOfflineOperationId BIGINT NOT NULL,
        ConflictType NVARCHAR(80) NOT NULL,
        ConflictReason NVARCHAR(1000) NOT NULL,
        LocalPayloadJson NVARCHAR(MAX) NULL,
        ServerPayloadJson NVARCHAR(MAX) NULL,
        ResolutionStatus NVARCHAR(24) NOT NULL,
        ResolvedByUserId BIGINT NULL,
        ResolvedOn DATETIMEOFFSET NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_SyncConflicts_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_SyncConflicts_ModifiedOn DEFAULT (SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );

    CREATE INDEX IX_mobile_SyncConflicts_Operation_Status
        ON mobile.SyncConflicts(MobileOfflineOperationId, ResolutionStatus);
END;
GO

IF OBJECT_ID(N'mobile.ScanEvents', N'U') IS NULL
BEGIN
    CREATE TABLE mobile.ScanEvents
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_mobile_ScanEvents PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        WarehouseId BIGINT NULL,
        DeviceRegistrationId BIGINT NOT NULL,
        ScanValue NVARCHAR(240) NOT NULL,
        ScanSource NVARCHAR(24) NOT NULL,
        ScanContext NVARCHAR(80) NOT NULL,
        ScanTimestamp DATETIMEOFFSET NOT NULL,
        ResolvedEntityType NVARCHAR(80) NULL,
        ResolvedEntityId BIGINT NULL,
        ResolvedEntityCode NVARCHAR(160) NULL,
        ResolutionStatus NVARCHAR(24) NOT NULL,
        ValidationMessage NVARCHAR(1000) NULL,
        PayloadSnapshotJson NVARCHAR(MAX) NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_ScanEvents_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_ScanEvents_ModifiedOn DEFAULT (SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );

    CREATE INDEX IX_mobile_ScanEvents_Company_Value_Time
        ON mobile.ScanEvents(CompanyId, ScanValue, ScanTimestamp);
    CREATE INDEX IX_mobile_ScanEvents_Device_Time
        ON mobile.ScanEvents(DeviceRegistrationId, ScanTimestamp);
END;
GO

IF OBJECT_ID(N'mobile.PhotoEvidence', N'U') IS NULL
BEGIN
    CREATE TABLE mobile.PhotoEvidence
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_mobile_PhotoEvidence PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        WarehouseId BIGINT NULL,
        DeviceRegistrationId BIGINT NOT NULL,
        SourceModule NVARCHAR(80) NOT NULL,
        SourceDocumentType NVARCHAR(80) NOT NULL,
        SourceDocumentId BIGINT NULL,
        SourceDocumentNo NVARCHAR(120) NULL,
        EvidenceType NVARCHAR(80) NOT NULL,
        FileName NVARCHAR(260) NULL,
        ContentType NVARCHAR(120) NULL,
        AttachmentId BIGINT NULL,
        CapturedOn DATETIMEOFFSET NOT NULL,
        UploadStatus NVARCHAR(32) NOT NULL,
        FailureReason NVARCHAR(1000) NULL,
        MetadataJson NVARCHAR(MAX) NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_PhotoEvidence_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_mobile_PhotoEvidence_ModifiedOn DEFAULT (SYSUTCDATETIME()),
        ModifiedByUserId BIGINT NULL
    );

    CREATE INDEX IX_mobile_PhotoEvidence_Source
        ON mobile.PhotoEvidence(SourceModule, SourceDocumentType, SourceDocumentId);
    CREATE INDEX IX_mobile_PhotoEvidence_Device_Captured
        ON mobile.PhotoEvidence(DeviceRegistrationId, CapturedOn);
END;
GO
