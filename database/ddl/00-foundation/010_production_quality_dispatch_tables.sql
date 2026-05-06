IF OBJECT_ID(N'production.ProductionReceipts', N'U') IS NULL
BEGIN
    CREATE TABLE production.ProductionReceipts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        ReceiptNo NVARCHAR(32) NOT NULL,
        PostingDate DATE NOT NULL,
        WorkOrderId BIGINT NULL,
        JobCardId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        CorrelationId NVARCHAR(64) NULL,
        Remarks NVARCHAR(512) NULL,
        PostedOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ProductionReceipts_CompanyId_ReceiptNo' AND object_id = OBJECT_ID(N'production.ProductionReceipts'))
    CREATE UNIQUE INDEX UX_ProductionReceipts_CompanyId_ReceiptNo ON production.ProductionReceipts(CompanyId, ReceiptNo);

IF OBJECT_ID(N'production.ProductionReceiptLines', N'U') IS NULL
BEGIN
    CREATE TABLE production.ProductionReceiptLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ProductionReceiptId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        LineType NVARCHAR(24) NOT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        OutputUomId BIGINT NOT NULL,
        WarehouseId BIGINT NOT NULL,
        BinId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        CatchWeightQty DECIMAL(18,6) NULL,
        InventoryState NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ProductionReceiptLines_ProductionReceiptId_LineNo' AND object_id = OBJECT_ID(N'production.ProductionReceiptLines'))
    CREATE UNIQUE INDEX UX_ProductionReceiptLines_ProductionReceiptId_LineNo ON production.ProductionReceiptLines(ProductionReceiptId, [LineNo]);

IF OBJECT_ID(N'production.ScrapEntries', N'U') IS NULL
BEGIN
    CREATE TABLE production.ScrapEntries
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        ScrapNo NVARCHAR(32) NOT NULL,
        PostingDate DATE NOT NULL,
        WorkOrderId BIGINT NULL,
        JobCardId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        WarehouseId BIGINT NOT NULL,
        BinId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        CatchWeightQty DECIMAL(18,6) NULL,
        ReasonCode NVARCHAR(32) NOT NULL,
        InventoryState NVARCHAR(24) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ScrapEntries_CompanyId_ScrapNo' AND object_id = OBJECT_ID(N'production.ScrapEntries'))
    CREATE UNIQUE INDEX UX_ScrapEntries_CompanyId_ScrapNo ON production.ScrapEntries(CompanyId, ScrapNo);

IF OBJECT_ID(N'production.ReworkOrders', N'U') IS NULL
BEGIN
    CREATE TABLE production.ReworkOrders
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        ReworkNo NVARCHAR(32) NOT NULL,
        SourceDocumentType NVARCHAR(64) NULL,
        SourceDocumentId BIGINT NULL,
        WorkOrderId BIGINT NULL,
        JobCardId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        SourceWarehouseId BIGINT NULL,
        SourceBinId BIGINT NULL,
        TargetWarehouseId BIGINT NULL,
        TargetBinId BIGINT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        CatchWeightQty DECIMAL(18,6) NULL,
        ReasonCode NVARCHAR(32) NULL,
        Instructions NVARCHAR(512) NULL,
        Status NVARCHAR(24) NOT NULL,
        ReleasedOn DATETIMEOFFSET(7) NULL,
        ClosedOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ReworkOrders_CompanyId_ReworkNo' AND object_id = OBJECT_ID(N'production.ReworkOrders'))
    CREATE UNIQUE INDEX UX_ReworkOrders_CompanyId_ReworkNo ON production.ReworkOrders(CompanyId, ReworkNo);

IF OBJECT_ID(N'quality.InspectionPlans', N'U') IS NULL
BEGIN
    CREATE TABLE quality.InspectionPlans
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        PlanCode NVARCHAR(32) NOT NULL,
        PlanName NVARCHAR(128) NOT NULL,
        InspectionType NVARCHAR(24) NOT NULL,
        ItemId BIGINT NULL,
        OperationId BIGINT NULL,
        AutoHoldOnFail BIT NOT NULL,
        AutoCreateNcrOnFail BIT NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_InspectionPlans_CompanyId_PlanCode' AND object_id = OBJECT_ID(N'quality.InspectionPlans'))
    CREATE UNIQUE INDEX UX_InspectionPlans_CompanyId_PlanCode ON quality.InspectionPlans(CompanyId, PlanCode);

IF OBJECT_ID(N'quality.InspectionRecords', N'U') IS NULL
BEGIN
    CREATE TABLE quality.InspectionRecords
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        InspectionNo NVARCHAR(32) NOT NULL,
        InspectionPlanId BIGINT NULL,
        InspectionType NVARCHAR(24) NOT NULL,
        SourceDocumentType NVARCHAR(64) NOT NULL,
        SourceDocumentId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        OverallResult NVARCHAR(24) NOT NULL,
        RequestToken NVARCHAR(64) NULL,
        Notes NVARCHAR(512) NULL,
        HeldOn DATETIMEOFFSET(7) NULL,
        ReleasedOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_InspectionRecords_CompanyId_InspectionNo' AND object_id = OBJECT_ID(N'quality.InspectionRecords'))
    CREATE UNIQUE INDEX UX_InspectionRecords_CompanyId_InspectionNo ON quality.InspectionRecords(CompanyId, InspectionNo);

IF OBJECT_ID(N'quality.InspectionResults', N'U') IS NULL
BEGIN
    CREATE TABLE quality.InspectionResults
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        InspectionRecordId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ParameterCode NVARCHAR(64) NOT NULL,
        ExpectedValue NVARCHAR(256) NULL,
        ActualValue NVARCHAR(256) NULL,
        ResultStatus NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_InspectionResults_InspectionRecordId_LineNo' AND object_id = OBJECT_ID(N'quality.InspectionResults'))
    CREATE UNIQUE INDEX UX_InspectionResults_InspectionRecordId_LineNo ON quality.InspectionResults(InspectionRecordId, [LineNo]);

IF OBJECT_ID(N'quality.NonConformances', N'U') IS NULL
BEGIN
    CREATE TABLE quality.NonConformances
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        NcrNo NVARCHAR(32) NOT NULL,
        SourceDocumentType NVARCHAR(64) NOT NULL,
        SourceDocumentId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        Disposition NVARCHAR(32) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        RootCause NVARCHAR(512) NULL,
        ReworkOrderId BIGINT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_NonConformances_CompanyId_NcrNo' AND object_id = OBJECT_ID(N'quality.NonConformances'))
    CREATE UNIQUE INDEX UX_NonConformances_CompanyId_NcrNo ON quality.NonConformances(CompanyId, NcrNo);

IF OBJECT_ID(N'dispatch.PackLists', N'U') IS NULL
BEGIN
    CREATE TABLE dispatch.PackLists
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        PackListNo NVARCHAR(32) NOT NULL,
        SalesOrderId BIGINT NULL,
        PlannedShipDate DATE NULL,
        Status NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PackLists_CompanyId_PackListNo' AND object_id = OBJECT_ID(N'dispatch.PackLists'))
    CREATE UNIQUE INDEX UX_PackLists_CompanyId_PackListNo ON dispatch.PackLists(CompanyId, PackListNo);

IF OBJECT_ID(N'dispatch.PackListLines', N'U') IS NULL
BEGIN
    CREATE TABLE dispatch.PackListLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PackListId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        SalesOrderLineId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        WarehouseId BIGINT NOT NULL,
        BinId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        PackedQuantity DECIMAL(18,6) NOT NULL,
        PackUomId BIGINT NOT NULL,
        PackageRef NVARCHAR(64) NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PackListLines_PackListId_LineNo' AND object_id = OBJECT_ID(N'dispatch.PackListLines'))
    CREATE UNIQUE INDEX UX_PackListLines_PackListId_LineNo ON dispatch.PackListLines(PackListId, [LineNo]);

IF OBJECT_ID(N'dispatch.Shipments', N'U') IS NULL
BEGIN
    CREATE TABLE dispatch.Shipments
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        ShipmentNo NVARCHAR(32) NOT NULL,
        PackListId BIGINT NULL,
        CustomerId BIGINT NOT NULL,
        DispatchDate DATE NOT NULL,
        VehicleRef NVARCHAR(64) NULL,
        TrackingRef NVARCHAR(64) NULL,
        SealNo NVARCHAR(64) NULL,
        ProofNotes NVARCHAR(512) NULL,
        Status NVARCHAR(24) NOT NULL,
        LoadedOn DATETIMEOFFSET(7) NULL,
        DeliveredOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Shipments_CompanyId_ShipmentNo' AND object_id = OBJECT_ID(N'dispatch.Shipments'))
    CREATE UNIQUE INDEX UX_Shipments_CompanyId_ShipmentNo ON dispatch.Shipments(CompanyId, ShipmentNo);

IF OBJECT_ID(N'dispatch.ShipmentLines', N'U') IS NULL
BEGIN
    CREATE TABLE dispatch.ShipmentLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ShipmentId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        PackListLineId BIGINT NULL,
        SalesOrderLineId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        WarehouseId BIGINT NOT NULL,
        BinId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        ShippedQuantity DECIMAL(18,6) NOT NULL,
        ShipUomId BIGINT NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ShipmentLines_ShipmentId_LineNo' AND object_id = OBJECT_ID(N'dispatch.ShipmentLines'))
    CREATE UNIQUE INDEX UX_ShipmentLines_ShipmentId_LineNo ON dispatch.ShipmentLines(ShipmentId, [LineNo]);
