IF OBJECT_ID(N'production.WorkOrders', N'U') IS NULL
BEGIN
    CREATE TABLE production.WorkOrders
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WorkOrderNo NVARCHAR(32) NOT NULL,
        SalesOrderLineId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        BomRevisionId BIGINT NOT NULL,
        RoutingId BIGINT NULL,
        PlannedQuantity DECIMAL(18,6) NOT NULL,
        ProductionUomId BIGINT NOT NULL,
        PlannedStartDate DATE NULL,
        PlannedEndDate DATE NULL,
        Status NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        ReleasedOn DATETIMEOFFSET(7) NULL,
        ClosedOn DATETIMEOFFSET(7) NULL,
        CancelledOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_WorkOrders_CompanyId_WorkOrderNo' AND object_id = OBJECT_ID(N'production.WorkOrders'))
    CREATE UNIQUE INDEX UX_WorkOrders_CompanyId_WorkOrderNo ON production.WorkOrders(CompanyId, WorkOrderNo);

IF OBJECT_ID(N'production.WorkOrderOperations', N'U') IS NULL
BEGIN
    CREATE TABLE production.WorkOrderOperations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        WorkOrderId BIGINT NOT NULL,
        SequenceNo INT NOT NULL,
        OperationId BIGINT NOT NULL,
        RoutingOperationId BIGINT NULL,
        WorkCenterId BIGINT NULL,
        PlannedQuantity DECIMAL(18,6) NOT NULL,
        CompletedQuantity DECIMAL(18,6) NOT NULL,
        RequiresQcCheckpoint BIT NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_WorkOrderOperations_WorkOrderId_SequenceNo' AND object_id = OBJECT_ID(N'production.WorkOrderOperations'))
    CREATE UNIQUE INDEX UX_WorkOrderOperations_WorkOrderId_SequenceNo ON production.WorkOrderOperations(WorkOrderId, SequenceNo);

IF OBJECT_ID(N'production.JobCards', N'U') IS NULL
BEGIN
    CREATE TABLE production.JobCards
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        JobCardNo NVARCHAR(32) NOT NULL,
        WorkOrderId BIGINT NOT NULL,
        WorkOrderOperationId BIGINT NOT NULL,
        ParentJobCardId BIGINT NULL,
        SplitSequenceNo INT NULL,
        AssignedMachineId BIGINT NULL,
        AssignedOperatorUserId BIGINT NULL,
        ShiftId BIGINT NULL,
        PlannedQuantity DECIMAL(18,6) NOT NULL,
        CompletedGoodQty DECIMAL(18,6) NOT NULL,
        CompletedRejectQty DECIMAL(18,6) NOT NULL,
        CompletedScrapQty DECIMAL(18,6) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_JobCards_CompanyId_JobCardNo' AND object_id = OBJECT_ID(N'production.JobCards'))
    CREATE UNIQUE INDEX UX_JobCards_CompanyId_JobCardNo ON production.JobCards(CompanyId, JobCardNo);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_JobCards_WorkOrderOperationId_SplitSequenceNo' AND object_id = OBJECT_ID(N'production.JobCards'))
    CREATE UNIQUE INDEX UX_JobCards_WorkOrderOperationId_SplitSequenceNo ON production.JobCards(WorkOrderOperationId, SplitSequenceNo);

IF OBJECT_ID(N'production.JobCardEvents', N'U') IS NULL
BEGIN
    CREATE TABLE production.JobCardEvents
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        JobCardId BIGINT NOT NULL,
        EventType NVARCHAR(24) NOT NULL,
        MachineId BIGINT NULL,
        OperatorUserId BIGINT NULL,
        EventOn DATETIMEOFFSET(7) NOT NULL,
        Quantity DECIMAL(18,6) NULL,
        ReasonCode NVARCHAR(64) NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_JobCardEvents_JobCardId_EventOn' AND object_id = OBJECT_ID(N'production.JobCardEvents'))
    CREATE INDEX IX_JobCardEvents_JobCardId_EventOn ON production.JobCardEvents(JobCardId, EventOn);

IF OBJECT_ID(N'production.DowntimeEvents', N'U') IS NULL
BEGIN
    CREATE TABLE production.DowntimeEvents
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        JobCardId BIGINT NOT NULL,
        MachineId BIGINT NOT NULL,
        ReasonCode NVARCHAR(64) NOT NULL,
        StartOn DATETIMEOFFSET(7) NOT NULL,
        EndOn DATETIMEOFFSET(7) NOT NULL,
        DurationMinutes DECIMAL(18,2) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_DowntimeEvents_JobCardId_StartOn_EndOn' AND object_id = OBJECT_ID(N'production.DowntimeEvents'))
    CREATE INDEX IX_DowntimeEvents_JobCardId_StartOn_EndOn ON production.DowntimeEvents(JobCardId, StartOn, EndOn);
