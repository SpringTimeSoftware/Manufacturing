IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'planning')
BEGIN
    EXEC(N'CREATE SCHEMA planning');
END;
GO

IF OBJECT_ID(N'planning.PlanningPlans', N'U') IS NULL
BEGIN
    CREATE TABLE planning.PlanningPlans
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_PlanningPlans PRIMARY KEY,
        CompanyId bigint NOT NULL,
        BranchId bigint NOT NULL,
        PlanCode nvarchar(32) NOT NULL,
        PlanName nvarchar(128) NOT NULL,
        PlanType nvarchar(32) NOT NULL,
        HorizonStart date NOT NULL,
        HorizonEnd date NOT NULL,
        FirmFenceDays int NOT NULL,
        ForecastFenceDays int NOT NULL,
        IncludeForecast bit NOT NULL,
        IncludeCapacity bit NOT NULL,
        Status nvarchar(24) NOT NULL,
        CreatedOn datetimeoffset NOT NULL,
        CreatedByUserId bigint NULL,
        ModifiedOn datetimeoffset NOT NULL,
        ModifiedByUserId bigint NULL,
        CONSTRAINT UX_PlanningPlans_Company_Code UNIQUE (CompanyId, PlanCode)
    );
END;
GO

IF OBJECT_ID(N'planning.PlanningSnapshots', N'U') IS NULL
BEGIN
    CREATE TABLE planning.PlanningSnapshots
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_PlanningSnapshots PRIMARY KEY,
        CompanyId bigint NOT NULL,
        BranchId bigint NOT NULL,
        PlanningPlanId bigint NULL,
        MrpRunId bigint NULL,
        SnapshotCode nvarchar(40) NOT NULL,
        SnapshotType nvarchar(32) NOT NULL,
        InputHash nvarchar(128) NOT NULL,
        OutputHash nvarchar(128) NOT NULL,
        DemandLineCount int NOT NULL,
        SupplyLineCount int NOT NULL,
        ExceptionCount int NOT NULL,
        PlannedQuantity decimal(18,6) NOT NULL,
        CapturedOn datetimeoffset NOT NULL,
        Status nvarchar(24) NOT NULL,
        CreatedOn datetimeoffset NOT NULL,
        CreatedByUserId bigint NULL,
        ModifiedOn datetimeoffset NOT NULL,
        ModifiedByUserId bigint NULL,
        CONSTRAINT UX_PlanningSnapshots_Company_Code UNIQUE (CompanyId, SnapshotCode)
    );
END;
GO

IF OBJECT_ID(N'planning.PlannedOrders', N'U') IS NULL
BEGIN
    CREATE TABLE planning.PlannedOrders
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_PlannedOrders PRIMARY KEY,
        CompanyId bigint NOT NULL,
        BranchId bigint NOT NULL,
        PlanningPlanId bigint NULL,
        MrpRunId bigint NULL,
        BoqRequirementLineId bigint NULL,
        PlannedOrderNo nvarchar(40) NOT NULL,
        OrderType nvarchar(24) NOT NULL,
        ItemId bigint NOT NULL,
        Quantity decimal(18,6) NOT NULL,
        UomId bigint NOT NULL,
        PlannedStartDate date NOT NULL,
        PlannedDueDate date NOT NULL,
        SourceWarehouseId bigint NULL,
        TargetWarehouseId bigint NULL,
        BomRevisionId bigint NULL,
        RoutingId bigint NULL,
        IsFirm bit NOT NULL,
        IsReleased bit NOT NULL,
        IsExpedite bit NOT NULL,
        PeggingSourceType nvarchar(32) NOT NULL,
        PeggingSourceId bigint NULL,
        Status nvarchar(24) NOT NULL,
        TargetDocumentId bigint NULL,
        TargetDocumentType nvarchar(32) NULL,
        CreatedOn datetimeoffset NOT NULL,
        CreatedByUserId bigint NULL,
        ModifiedOn datetimeoffset NOT NULL,
        ModifiedByUserId bigint NULL,
        CONSTRAINT UX_PlannedOrders_Company_No UNIQUE (CompanyId, PlannedOrderNo)
    );
END;
GO

IF OBJECT_ID(N'planning.ShortageActions', N'U') IS NULL
BEGIN
    CREATE TABLE planning.ShortageActions
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_ShortageActions PRIMARY KEY,
        CompanyId bigint NOT NULL,
        BranchId bigint NOT NULL,
        PlannedOrderId bigint NULL,
        MrpRunItemId bigint NULL,
        ItemId bigint NOT NULL,
        ShortageQuantity decimal(18,6) NOT NULL,
        ActionType nvarchar(32) NOT NULL,
        OwnerUserId bigint NULL,
        DueDate date NOT NULL,
        ReasonCode nvarchar(64) NOT NULL,
        Status nvarchar(24) NOT NULL,
        ResolutionNote nvarchar(512) NOT NULL,
        CreatedOn datetimeoffset NOT NULL,
        CreatedByUserId bigint NULL,
        ModifiedOn datetimeoffset NOT NULL,
        ModifiedByUserId bigint NULL
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'planning.PlannedOrders') AND name = N'IX_PlannedOrders_Branch_Status_Due')
BEGIN
    CREATE INDEX IX_PlannedOrders_Branch_Status_Due ON planning.PlannedOrders (CompanyId, BranchId, Status, PlannedDueDate);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'planning.ShortageActions') AND name = N'IX_ShortageActions_Branch_Status_Due')
BEGIN
    CREATE INDEX IX_ShortageActions_Branch_Status_Due ON planning.ShortageActions (CompanyId, BranchId, Status, DueDate);
END;
GO
