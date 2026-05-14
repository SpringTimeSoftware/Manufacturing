IF OBJECT_ID(N'sales.Quotes', N'U') IS NULL
BEGIN
    CREATE TABLE sales.Quotes
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        QuoteNo NVARCHAR(32) NOT NULL,
        CustomerId BIGINT NOT NULL,
        CustomerAddressId BIGINT NULL,
        QuoteDate DATE NOT NULL,
        ExpiryDate DATE NULL,
        PriorityCode NVARCHAR(16) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CustomerSpecRef NVARCHAR(128) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Quotes_CompanyId_QuoteNo' AND object_id = OBJECT_ID(N'sales.Quotes'))
    CREATE UNIQUE INDEX UX_Quotes_CompanyId_QuoteNo ON sales.Quotes(CompanyId, QuoteNo);

IF OBJECT_ID(N'sales.QuoteLines', N'U') IS NULL
BEGIN
    CREATE TABLE sales.QuoteLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        QuoteId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        OrderUomId BIGINT NOT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        UnitPrice DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_UnitPrice DEFAULT(0),
        DiscountPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_QuoteLines_DiscountPercent DEFAULT(0),
        DiscountAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_DiscountAmount DEFAULT(0),
        TaxPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_QuoteLines_TaxPercent DEFAULT(0),
        TaxAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_TaxAmount DEFAULT(0),
        LineAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_LineAmount DEFAULT(0),
        MakeType NVARCHAR(16) NOT NULL,
        PromisedDate DATE NULL,
        PriorityCode NVARCHAR(16) NOT NULL,
        CustomerSpecRef NVARCHAR(128) NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF COL_LENGTH(N'sales.QuoteLines', N'UnitPrice') IS NULL
    ALTER TABLE sales.QuoteLines ADD UnitPrice DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_UnitPrice DEFAULT(0);
IF COL_LENGTH(N'sales.QuoteLines', N'DiscountPercent') IS NULL
    ALTER TABLE sales.QuoteLines ADD DiscountPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_QuoteLines_DiscountPercent DEFAULT(0);
IF COL_LENGTH(N'sales.QuoteLines', N'DiscountAmount') IS NULL
    ALTER TABLE sales.QuoteLines ADD DiscountAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_DiscountAmount DEFAULT(0);
IF COL_LENGTH(N'sales.QuoteLines', N'TaxPercent') IS NULL
    ALTER TABLE sales.QuoteLines ADD TaxPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_QuoteLines_TaxPercent DEFAULT(0);
IF COL_LENGTH(N'sales.QuoteLines', N'TaxAmount') IS NULL
    ALTER TABLE sales.QuoteLines ADD TaxAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_TaxAmount DEFAULT(0);
IF COL_LENGTH(N'sales.QuoteLines', N'LineAmount') IS NULL
    ALTER TABLE sales.QuoteLines ADD LineAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_LineAmount DEFAULT(0);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_QuoteLines_QuoteId_LineNo' AND object_id = OBJECT_ID(N'sales.QuoteLines'))
    CREATE UNIQUE INDEX UX_QuoteLines_QuoteId_LineNo ON sales.QuoteLines(QuoteId, [LineNo]);

IF OBJECT_ID(N'sales.SalesOrders', N'U') IS NULL
BEGIN
    CREATE TABLE sales.SalesOrders
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        SalesOrderNo NVARCHAR(32) NOT NULL,
        CustomerId BIGINT NOT NULL,
        BillToAddressId BIGINT NULL,
        ShipToAddressId BIGINT NULL,
        OrderDate DATE NOT NULL,
        PromisedDate DATE NULL,
        PriorityCode NVARCHAR(16) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        SourceQuoteId BIGINT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SalesOrders_CompanyId_SalesOrderNo' AND object_id = OBJECT_ID(N'sales.SalesOrders'))
    CREATE UNIQUE INDEX UX_SalesOrders_CompanyId_SalesOrderNo ON sales.SalesOrders(CompanyId, SalesOrderNo);

IF OBJECT_ID(N'sales.SalesOrderLines', N'U') IS NULL
BEGIN
    CREATE TABLE sales.SalesOrderLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        SalesOrderId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        OrderUomId BIGINT NOT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        MakeType NVARCHAR(16) NOT NULL,
        PromisedDate DATE NULL,
        PriorityCode NVARCHAR(16) NOT NULL,
        CustomerSpecRef NVARCHAR(128) NULL,
        RequestedShipDate DATE NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SalesOrderLines_SalesOrderId_LineNo' AND object_id = OBJECT_ID(N'sales.SalesOrderLines'))
    CREATE UNIQUE INDEX UX_SalesOrderLines_SalesOrderId_LineNo ON sales.SalesOrderLines(SalesOrderId, [LineNo]);

IF OBJECT_ID(N'sales.BlanketOrders', N'U') IS NULL
BEGIN
    CREATE TABLE sales.BlanketOrders
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        BlanketOrderNo NVARCHAR(32) NOT NULL,
        CustomerId BIGINT NOT NULL,
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_BlanketOrders_CompanyId_BlanketOrderNo' AND object_id = OBJECT_ID(N'sales.BlanketOrders'))
    CREATE UNIQUE INDEX UX_BlanketOrders_CompanyId_BlanketOrderNo ON sales.BlanketOrders(CompanyId, BlanketOrderNo);

IF OBJECT_ID(N'sales.BlanketOrderSchedules', N'U') IS NULL
BEGIN
    CREATE TABLE sales.BlanketOrderSchedules
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        BlanketOrderId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NOT NULL,
        ScheduleDate DATE NOT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        OrderUomId BIGINT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_BlanketOrderSchedules_BlanketOrderId_LineNo' AND object_id = OBJECT_ID(N'sales.BlanketOrderSchedules'))
    CREATE UNIQUE INDEX UX_BlanketOrderSchedules_BlanketOrderId_LineNo ON sales.BlanketOrderSchedules(BlanketOrderId, [LineNo]);

IF OBJECT_ID(N'sales.DemandForecasts', N'U') IS NULL
BEGIN
    CREATE TABLE sales.DemandForecasts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ForecastCode NVARCHAR(32) NOT NULL,
        ForecastName NVARCHAR(128) NOT NULL,
        PeriodType NVARCHAR(16) NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_DemandForecasts_CompanyId_ForecastCode' AND object_id = OBJECT_ID(N'sales.DemandForecasts'))
    CREATE UNIQUE INDEX UX_DemandForecasts_CompanyId_ForecastCode ON sales.DemandForecasts(CompanyId, ForecastCode);

IF OBJECT_ID(N'sales.DemandForecastLines', N'U') IS NULL
BEGIN
    CREATE TABLE sales.DemandForecastLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        DemandForecastId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NOT NULL,
        ForecastPeriodStart DATE NOT NULL,
        ForecastPeriodEnd DATE NOT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        ForecastUomId BIGINT NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_DemandForecastLines_DemandForecastId_LineNo' AND object_id = OBJECT_ID(N'sales.DemandForecastLines'))
    CREATE UNIQUE INDEX UX_DemandForecastLines_DemandForecastId_LineNo ON sales.DemandForecastLines(DemandForecastId, [LineNo]);

IF OBJECT_ID(N'planning.MasterProductionSchedules', N'U') IS NULL
BEGIN
    CREATE TABLE planning.MasterProductionSchedules
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        MpsCode NVARCHAR(32) NOT NULL,
        PlanningHorizonStart DATE NOT NULL,
        PlanningHorizonEnd DATE NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_MasterProductionSchedules_CompanyId_MpsCode' AND object_id = OBJECT_ID(N'planning.MasterProductionSchedules'))
    CREATE UNIQUE INDEX UX_MasterProductionSchedules_CompanyId_MpsCode ON planning.MasterProductionSchedules(CompanyId, MpsCode);

IF OBJECT_ID(N'planning.MpsLines', N'U') IS NULL
BEGIN
    CREATE TABLE planning.MpsLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        MasterProductionScheduleId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NOT NULL,
        PeriodStart DATE NOT NULL,
        PeriodEnd DATE NOT NULL,
        PlannedQuantity DECIMAL(18,6) NOT NULL,
        PlanningUomId BIGINT NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_MpsLines_MasterProductionScheduleId_LineNo' AND object_id = OBJECT_ID(N'planning.MpsLines'))
    CREATE UNIQUE INDEX UX_MpsLines_MasterProductionScheduleId_LineNo ON planning.MpsLines(MasterProductionScheduleId, [LineNo]);

IF OBJECT_ID(N'planning.MrpRuns', N'U') IS NULL
BEGIN
    CREATE TABLE planning.MrpRuns
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        RunCode NVARCHAR(32) NOT NULL,
        RunType NVARCHAR(16) NOT NULL,
        TriggeredFromMpsId BIGINT NULL,
        PlanningHorizonStart DATE NOT NULL,
        PlanningHorizonEnd DATE NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        RunStartedOn DATETIMEOFFSET(7) NOT NULL,
        RunCompletedOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_MrpRuns_CompanyId_RunCode' AND object_id = OBJECT_ID(N'planning.MrpRuns'))
    CREATE UNIQUE INDEX UX_MrpRuns_CompanyId_RunCode ON planning.MrpRuns(CompanyId, RunCode);

IF OBJECT_ID(N'planning.MrpRunItems', N'U') IS NULL
BEGIN
    CREATE TABLE planning.MrpRunItems
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        MrpRunId BIGINT NOT NULL,
        ItemId BIGINT NOT NULL,
        DemandSourceType NVARCHAR(24) NOT NULL,
        GrossRequirementQty DECIMAL(18,6) NOT NULL,
        NetRequirementQty DECIMAL(18,6) NOT NULL,
        AvailableQtyAtRun DECIMAL(18,6) NOT NULL,
        RecommendedAction NVARCHAR(16) NOT NULL,
        ExceptionCode NVARCHAR(64) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_MrpRunItems_MrpRunId_ItemId_DemandSourceType' AND object_id = OBJECT_ID(N'planning.MrpRunItems'))
    CREATE UNIQUE INDEX UX_MrpRunItems_MrpRunId_ItemId_DemandSourceType ON planning.MrpRunItems(MrpRunId, ItemId, DemandSourceType);

IF OBJECT_ID(N'planning.BoqRequirements', N'U') IS NULL
BEGIN
    CREATE TABLE planning.BoqRequirements
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        MrpRunId BIGINT NULL,
        SourceDocumentType NVARCHAR(24) NOT NULL,
        SourceDocumentId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF OBJECT_ID(N'planning.BoqRequirementLines', N'U') IS NULL
BEGIN
    CREATE TABLE planning.BoqRequirementLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        BoqRequirementId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NOT NULL,
        RequiredQuantity DECIMAL(18,6) NOT NULL,
        RequirementUomId BIGINT NOT NULL,
        NeedByDate DATE NOT NULL,
        RecommendedAction NVARCHAR(16) NOT NULL,
        ApprovedAction NVARCHAR(16) NULL,
        OverrideReasonCode NVARCHAR(64) NULL,
        OverriddenByUserId BIGINT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_BoqRequirementLines_BoqRequirementId_LineNo' AND object_id = OBJECT_ID(N'planning.BoqRequirementLines'))
    CREATE UNIQUE INDEX UX_BoqRequirementLines_BoqRequirementId_LineNo ON planning.BoqRequirementLines(BoqRequirementId, [LineNo]);

IF OBJECT_ID(N'procurement.PurchaseRequisitions', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.PurchaseRequisitions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        PurchaseRequisitionNo NVARCHAR(32) NOT NULL,
        SourceDocumentType NVARCHAR(24) NOT NULL,
        SourceDocumentId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PurchaseRequisitions_CompanyId_PurchaseRequisitionNo' AND object_id = OBJECT_ID(N'procurement.PurchaseRequisitions'))
    CREATE UNIQUE INDEX UX_PurchaseRequisitions_CompanyId_PurchaseRequisitionNo ON procurement.PurchaseRequisitions(CompanyId, PurchaseRequisitionNo);

IF OBJECT_ID(N'procurement.PurchaseRequisitionLines', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.PurchaseRequisitionLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PurchaseRequisitionId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NOT NULL,
        RequiredQuantity DECIMAL(18,6) NOT NULL,
        OrderUomId BIGINT NOT NULL,
        NeedByDate DATE NOT NULL,
        SourceBoqRequirementLineId BIGINT NULL,
        LinkedWorkOrderId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PurchaseRequisitionLines_PurchaseRequisitionId_LineNo' AND object_id = OBJECT_ID(N'procurement.PurchaseRequisitionLines'))
    CREATE UNIQUE INDEX UX_PurchaseRequisitionLines_PurchaseRequisitionId_LineNo ON procurement.PurchaseRequisitionLines(PurchaseRequisitionId, [LineNo]);

IF OBJECT_ID(N'procurement.PurchaseOrders', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.PurchaseOrders
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        PurchaseOrderNo NVARCHAR(32) NOT NULL,
        SupplierId BIGINT NOT NULL,
        OrderAddressId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        ExpectedReceiptDate DATE NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PurchaseOrders_CompanyId_PurchaseOrderNo' AND object_id = OBJECT_ID(N'procurement.PurchaseOrders'))
    CREATE UNIQUE INDEX UX_PurchaseOrders_CompanyId_PurchaseOrderNo ON procurement.PurchaseOrders(CompanyId, PurchaseOrderNo);

IF OBJECT_ID(N'procurement.PurchaseOrderLines', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.PurchaseOrderLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PurchaseOrderId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NOT NULL,
        PurchaseRequisitionLineId BIGINT NULL,
        OrderedQuantity DECIMAL(18,6) NOT NULL,
        UnitPrice DECIMAL(18,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_UnitPrice DEFAULT(0),
        DiscountPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_DiscountPercent DEFAULT(0),
        DiscountAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_DiscountAmount DEFAULT(0),
        TaxPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_TaxPercent DEFAULT(0),
        TaxAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_TaxAmount DEFAULT(0),
        LineAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_LineAmount DEFAULT(0),
        OrderUomId BIGINT NOT NULL,
        ExpectedDate DATE NOT NULL,
        LinkedWorkOrderId BIGINT NULL,
        SourceBoqRequirementLineId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF COL_LENGTH(N'procurement.PurchaseOrderLines', N'UnitPrice') IS NULL
    ALTER TABLE procurement.PurchaseOrderLines ADD UnitPrice DECIMAL(18,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_UnitPrice DEFAULT(0);
IF COL_LENGTH(N'procurement.PurchaseOrderLines', N'DiscountPercent') IS NULL
    ALTER TABLE procurement.PurchaseOrderLines ADD DiscountPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_DiscountPercent DEFAULT(0);
IF COL_LENGTH(N'procurement.PurchaseOrderLines', N'DiscountAmount') IS NULL
    ALTER TABLE procurement.PurchaseOrderLines ADD DiscountAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_DiscountAmount DEFAULT(0);
IF COL_LENGTH(N'procurement.PurchaseOrderLines', N'TaxPercent') IS NULL
    ALTER TABLE procurement.PurchaseOrderLines ADD TaxPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_TaxPercent DEFAULT(0);
IF COL_LENGTH(N'procurement.PurchaseOrderLines', N'TaxAmount') IS NULL
    ALTER TABLE procurement.PurchaseOrderLines ADD TaxAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_TaxAmount DEFAULT(0);
IF COL_LENGTH(N'procurement.PurchaseOrderLines', N'LineAmount') IS NULL
    ALTER TABLE procurement.PurchaseOrderLines ADD LineAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_PurchaseOrderLines_LineAmount DEFAULT(0);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PurchaseOrderLines_PurchaseOrderId_LineNo' AND object_id = OBJECT_ID(N'procurement.PurchaseOrderLines'))
    CREATE UNIQUE INDEX UX_PurchaseOrderLines_PurchaseOrderId_LineNo ON procurement.PurchaseOrderLines(PurchaseOrderId, [LineNo]);

IF OBJECT_ID(N'procurement.SubcontractOrders', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.SubcontractOrders
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        SubcontractOrderNo NVARCHAR(32) NOT NULL,
        SupplierId BIGINT NOT NULL,
        WorkOrderId BIGINT NULL,
        OperationId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        ExpectedReturnDate DATE NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SubcontractOrders_CompanyId_SubcontractOrderNo' AND object_id = OBJECT_ID(N'procurement.SubcontractOrders'))
    CREATE UNIQUE INDEX UX_SubcontractOrders_CompanyId_SubcontractOrderNo ON procurement.SubcontractOrders(CompanyId, SubcontractOrderNo);

IF OBJECT_ID(N'procurement.SubcontractReceipts', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.SubcontractReceipts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ReceiptNo NVARCHAR(32) NOT NULL,
        SubcontractOrderId BIGINT NOT NULL,
        ReceiptDate DATE NOT NULL,
        ReceivedQuantity DECIMAL(18,6) NOT NULL,
        AcceptedQuantity DECIMAL(18,6) NOT NULL,
        RejectedQuantity DECIMAL(18,6) NOT NULL,
        QcStatus NVARCHAR(24) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SubcontractReceipts_CompanyId_ReceiptNo' AND object_id = OBJECT_ID(N'procurement.SubcontractReceipts'))
    CREATE UNIQUE INDEX UX_SubcontractReceipts_CompanyId_ReceiptNo ON procurement.SubcontractReceipts(CompanyId, ReceiptNo);

IF OBJECT_ID(N'procurement.GoodsReceipts', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.GoodsReceipts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        GoodsReceiptNo NVARCHAR(32) NOT NULL,
        PurchaseOrderId BIGINT NOT NULL,
        SupplierId BIGINT NOT NULL,
        ReceiptDate DATE NOT NULL,
        WarehouseId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_GoodsReceipts_CompanyId_GoodsReceiptNo' AND object_id = OBJECT_ID(N'procurement.GoodsReceipts'))
    CREATE UNIQUE INDEX UX_GoodsReceipts_CompanyId_GoodsReceiptNo ON procurement.GoodsReceipts(CompanyId, GoodsReceiptNo);

IF OBJECT_ID(N'procurement.GoodsReceiptLines', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.GoodsReceiptLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        GoodsReceiptId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        PurchaseOrderLineId BIGINT NOT NULL,
        ItemId BIGINT NOT NULL,
        OrderUomId BIGINT NOT NULL,
        ReceivedQuantity DECIMAL(18,6) NOT NULL,
        AcceptedQuantity DECIMAL(18,6) NOT NULL,
        RejectedQuantity DECIMAL(18,6) NOT NULL,
        UnitPrice DECIMAL(18,4) NOT NULL,
        TaxPercent DECIMAL(9,4) NOT NULL,
        LineAmount DECIMAL(18,4) NOT NULL,
        QcStatus NVARCHAR(24) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_GoodsReceiptLines_GoodsReceiptId_LineNo' AND object_id = OBJECT_ID(N'procurement.GoodsReceiptLines'))
    CREATE UNIQUE INDEX UX_GoodsReceiptLines_GoodsReceiptId_LineNo ON procurement.GoodsReceiptLines(GoodsReceiptId, [LineNo]);

IF OBJECT_ID(N'procurement.SupplierInvoices', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.SupplierInvoices
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        SupplierInvoiceNo NVARCHAR(64) NOT NULL,
        SupplierId BIGINT NOT NULL,
        PurchaseOrderId BIGINT NOT NULL,
        GoodsReceiptId BIGINT NOT NULL,
        InvoiceDate DATE NOT NULL,
        DueDate DATE NULL,
        CurrencyCode NVARCHAR(16) NOT NULL,
        SubtotalAmount DECIMAL(18,4) NOT NULL,
        TaxAmount DECIMAL(18,4) NOT NULL,
        TotalAmount DECIMAL(18,4) NOT NULL,
        MatchStatus NVARCHAR(32) NOT NULL,
        ApStatus NVARCHAR(32) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SupplierInvoices_CompanyId_SupplierInvoiceNo' AND object_id = OBJECT_ID(N'procurement.SupplierInvoices'))
    CREATE UNIQUE INDEX UX_SupplierInvoices_CompanyId_SupplierInvoiceNo ON procurement.SupplierInvoices(CompanyId, SupplierInvoiceNo);

IF OBJECT_ID(N'procurement.SupplierInvoiceLines', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.SupplierInvoiceLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        SupplierInvoiceId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        PurchaseOrderLineId BIGINT NOT NULL,
        GoodsReceiptLineId BIGINT NOT NULL,
        ItemId BIGINT NOT NULL,
        InvoiceQuantity DECIMAL(18,6) NOT NULL,
        UnitPrice DECIMAL(18,4) NOT NULL,
        TaxPercent DECIMAL(9,4) NOT NULL,
        TaxAmount DECIMAL(18,4) NOT NULL,
        LineAmount DECIMAL(18,4) NOT NULL,
        MatchStatus NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SupplierInvoiceLines_SupplierInvoiceId_LineNo' AND object_id = OBJECT_ID(N'procurement.SupplierInvoiceLines'))
    CREATE UNIQUE INDEX UX_SupplierInvoiceLines_SupplierInvoiceId_LineNo ON procurement.SupplierInvoiceLines(SupplierInvoiceId, [LineNo]);

IF OBJECT_ID(N'finance.AccountsPayableLiabilities', N'U') IS NULL
BEGIN
    CREATE TABLE finance.AccountsPayableLiabilities
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        LiabilityNo NVARCHAR(48) NOT NULL,
        SupplierInvoiceId BIGINT NOT NULL,
        SupplierId BIGINT NOT NULL,
        PostingDate DATE NOT NULL,
        DueDate DATE NOT NULL,
        PayableAmount DECIMAL(18,4) NOT NULL,
        PaidAmount DECIMAL(18,4) NOT NULL,
        BalanceAmount DECIMAL(18,4) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_AccountsPayableLiabilities_CompanyId_LiabilityNo' AND object_id = OBJECT_ID(N'finance.AccountsPayableLiabilities'))
    CREATE UNIQUE INDEX UX_AccountsPayableLiabilities_CompanyId_LiabilityNo ON finance.AccountsPayableLiabilities(CompanyId, LiabilityNo);

IF OBJECT_ID(N'finance.AccountingPostings', N'U') IS NULL
BEGIN
    CREATE TABLE finance.AccountingPostings
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        PostingNo NVARCHAR(48) NOT NULL,
        SourceDocumentType NVARCHAR(32) NOT NULL,
        SourceDocumentId BIGINT NOT NULL,
        PostingDate DATE NOT NULL,
        DebitAccountCode NVARCHAR(64) NOT NULL,
        CreditAccountCode NVARCHAR(64) NOT NULL,
        Amount DECIMAL(18,4) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_AccountingPostings_CompanyId_PostingNo' AND object_id = OBJECT_ID(N'finance.AccountingPostings'))
    CREATE UNIQUE INDEX UX_AccountingPostings_CompanyId_PostingNo ON finance.AccountingPostings(CompanyId, PostingNo);

IF OBJECT_ID(N'inventory.StockBalances', N'U') IS NULL
BEGIN
    CREATE TABLE inventory.StockBalances
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WarehouseId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        BinId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        OnHandQty DECIMAL(18,6) NOT NULL,
        ReservedQty DECIMAL(18,6) NOT NULL,
        QcHoldQty DECIMAL(18,6) NOT NULL,
        BlockedQty DECIMAL(18,6) NOT NULL,
        InTransitQty DECIMAL(18,6) NOT NULL,
        CatchWeightQty DECIMAL(18,6) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_StockBalances_Scope_Item_Location' AND object_id = OBJECT_ID(N'inventory.StockBalances'))
    CREATE UNIQUE INDEX UX_StockBalances_Scope_Item_Location ON inventory.StockBalances(CompanyId, BranchId, ItemId, ItemVariantId, WarehouseId, BinId, LotId, SerialId);

IF OBJECT_ID(N'inventory.StockTransactions', N'U') IS NULL
BEGIN
    CREATE TABLE inventory.StockTransactions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        TransactionNo NVARCHAR(48) NOT NULL,
        TransactionType NVARCHAR(32) NOT NULL,
        PostingDate DATE NOT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        FromWarehouseId BIGINT NULL,
        FromBinId BIGINT NULL,
        ToWarehouseId BIGINT NULL,
        ToBinId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        CatchWeightQty DECIMAL(18,6) NULL,
        InventoryState NVARCHAR(24) NOT NULL,
        SourceDocumentType NVARCHAR(32) NULL,
        SourceDocumentId BIGINT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_StockTransactions_CompanyId_TransactionNo' AND object_id = OBJECT_ID(N'inventory.StockTransactions'))
    CREATE UNIQUE INDEX UX_StockTransactions_CompanyId_TransactionNo ON inventory.StockTransactions(CompanyId, TransactionNo);

IF OBJECT_ID(N'inventory.StockReservations', N'U') IS NULL
BEGIN
    CREATE TABLE inventory.StockReservations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WarehouseId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        BinId BIGINT NULL,
        LotId BIGINT NULL,
        ReservedQuantity DECIMAL(18,6) NOT NULL,
        SourceDocumentType NVARCHAR(32) NOT NULL,
        SourceDocumentId BIGINT NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StockReservations_CompanyId_ItemId_SourceDocumentType_SourceDocumentId' AND object_id = OBJECT_ID(N'inventory.StockReservations'))
    CREATE INDEX IX_StockReservations_CompanyId_ItemId_SourceDocumentType_SourceDocumentId ON inventory.StockReservations(CompanyId, ItemId, SourceDocumentType, SourceDocumentId);

IF OBJECT_ID(N'inventory.Lots', N'U') IS NULL
BEGIN
    CREATE TABLE inventory.Lots
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        LotNo NVARCHAR(48) NOT NULL,
        ManufacturedOn DATE NULL,
        ExpiryOn DATE NULL,
        LotStatus NVARCHAR(24) NOT NULL,
        CatchWeightQty DECIMAL(18,6) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Lots_CompanyId_ItemId_LotNo' AND object_id = OBJECT_ID(N'inventory.Lots'))
    CREATE UNIQUE INDEX UX_Lots_CompanyId_ItemId_LotNo ON inventory.Lots(CompanyId, ItemId, LotNo);

IF OBJECT_ID(N'inventory.Serials', N'U') IS NULL
BEGIN
    CREATE TABLE inventory.Serials
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        SerialNo NVARCHAR(64) NOT NULL,
        LotId BIGINT NULL,
        CurrentWarehouseId BIGINT NULL,
        CurrentBinId BIGINT NULL,
        SerialStatus NVARCHAR(24) NOT NULL,
        ManufacturedOn DATE NULL,
        ExpiryOn DATE NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Serials_CompanyId_SerialNo' AND object_id = OBJECT_ID(N'inventory.Serials'))
    CREATE UNIQUE INDEX UX_Serials_CompanyId_SerialNo ON inventory.Serials(CompanyId, SerialNo);

IF OBJECT_ID(N'inventory.CycleCounts', N'U') IS NULL
BEGIN
    CREATE TABLE inventory.CycleCounts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WarehouseId BIGINT NULL,
        CountNo NVARCHAR(32) NOT NULL,
        CountDate DATE NOT NULL,
        CountType NVARCHAR(24) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        PostedOn DATETIMEOFFSET(7) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CycleCounts_CompanyId_CountNo' AND object_id = OBJECT_ID(N'inventory.CycleCounts'))
    CREATE UNIQUE INDEX UX_CycleCounts_CompanyId_CountNo ON inventory.CycleCounts(CompanyId, CountNo);

IF OBJECT_ID(N'inventory.CycleCountLines', N'U') IS NULL
BEGIN
    CREATE TABLE inventory.CycleCountLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CycleCountId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        BinId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        SystemQuantity DECIMAL(18,6) NOT NULL,
        CountedQuantity DECIMAL(18,6) NOT NULL,
        VarianceQuantity DECIMAL(18,6) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CycleCountLines_CycleCountId_LineNo' AND object_id = OBJECT_ID(N'inventory.CycleCountLines'))
    CREATE UNIQUE INDEX UX_CycleCountLines_CycleCountId_LineNo ON inventory.CycleCountLines(CycleCountId, [LineNo]);
