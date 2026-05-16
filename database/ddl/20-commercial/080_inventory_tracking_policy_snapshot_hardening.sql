/*
  Phase 03 - Inventory / Bin / Lot / Serial / PCID shared validation and source snapshot hardening.
  Additive only. Historical rows stay nullable and are not assigned fake bins, lots, serials,
  PCIDs, source revisions, or stock statuses.
*/

IF COL_LENGTH('master.ItemInventoryPolicies', 'IsStockControlled') IS NULL
BEGIN
    ALTER TABLE master.ItemInventoryPolicies ADD IsStockControlled bit NOT NULL CONSTRAINT DF_ItemInventoryPolicies_IsStockControlled DEFAULT (1);
END;

IF COL_LENGTH('master.ItemInventoryPolicies', 'RequiresBin') IS NULL
BEGIN
    ALTER TABLE master.ItemInventoryPolicies ADD RequiresBin bit NOT NULL CONSTRAINT DF_ItemInventoryPolicies_RequiresBin DEFAULT (0);
END;

IF COL_LENGTH('master.ItemInventoryPolicies', 'IsPcidTracked') IS NULL
BEGIN
    ALTER TABLE master.ItemInventoryPolicies ADD IsPcidTracked bit NOT NULL CONSTRAINT DF_ItemInventoryPolicies_IsPcidTracked DEFAULT (0);
END;

IF OBJECT_ID('inventory.LicensePlates', 'U') IS NULL
BEGIN
    CREATE TABLE inventory.LicensePlates
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_LicensePlates PRIMARY KEY,
        CompanyId bigint NOT NULL,
        BranchId bigint NOT NULL,
        WarehouseId bigint NULL,
        BinId bigint NULL,
        PcidNo nvarchar(80) NOT NULL,
        LicensePlateType nvarchar(40) NOT NULL,
        Status nvarchar(24) NOT NULL,
        CreatedOn datetimeoffset NOT NULL CONSTRAINT DF_LicensePlates_CreatedOn DEFAULT (sysdatetimeoffset()),
        CreatedByUserId bigint NULL,
        ModifiedOn datetimeoffset NULL,
        ModifiedByUserId bigint NULL,
        CONSTRAINT UX_LicensePlates_Company_PcidNo UNIQUE (CompanyId, PcidNo)
    );
END;

IF OBJECT_ID('inventory.LicensePlateContents', 'U') IS NULL
BEGIN
    CREATE TABLE inventory.LicensePlateContents
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_LicensePlateContents PRIMARY KEY,
        CompanyId bigint NOT NULL,
        LicensePlateId bigint NOT NULL,
        ItemId bigint NOT NULL,
        ItemVariantId bigint NULL,
        LotId bigint NULL,
        SerialId bigint NULL,
        Quantity decimal(18,6) NOT NULL,
        InventoryState nvarchar(24) NOT NULL,
        Status nvarchar(24) NOT NULL,
        CreatedOn datetimeoffset NOT NULL CONSTRAINT DF_LicensePlateContents_CreatedOn DEFAULT (sysdatetimeoffset()),
        CreatedByUserId bigint NULL,
        ModifiedOn datetimeoffset NULL,
        ModifiedByUserId bigint NULL,
        CONSTRAINT FK_LicensePlateContents_LicensePlate FOREIGN KEY (LicensePlateId) REFERENCES inventory.LicensePlates(Id)
    );

    CREATE INDEX IX_LicensePlateContents_Grain ON inventory.LicensePlateContents(CompanyId, LicensePlateId, ItemId, LotId, SerialId);
END;

IF COL_LENGTH('inventory.StockBalances', 'PcidId') IS NULL
BEGIN
    ALTER TABLE inventory.StockBalances ADD PcidId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'PcidId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD PcidId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'SourceDocumentNo') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD SourceDocumentNo nvarchar(80) NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'SourceDocumentLineId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD SourceDocumentLineId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'SourceDocumentRevisionNo') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD SourceDocumentRevisionNo int NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'SourceDocumentVersionNo') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD SourceDocumentVersionNo int NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'ItemRevisionId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD ItemRevisionId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'EngineeringDocumentRevisionId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD EngineeringDocumentRevisionId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'BomRevisionId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD BomRevisionId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'RoutingId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD RoutingId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'RoutingRevisionId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD RoutingRevisionId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'WorkOrderId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD WorkOrderId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'ProductionOrderId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD ProductionOrderId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'SalesOrderId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD SalesOrderId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'SalesOrderLineId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD SalesOrderLineId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'PurchaseOrderId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD PurchaseOrderId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'PurchaseOrderLineId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD PurchaseOrderLineId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'QualityDocumentId') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD QualityDocumentId bigint NULL;
END;

IF COL_LENGTH('inventory.StockTransactions', 'LegacyTrackingIncomplete') IS NULL
BEGIN
    ALTER TABLE inventory.StockTransactions ADD LegacyTrackingIncomplete bit NOT NULL CONSTRAINT DF_StockTransactions_LegacyTrackingIncomplete DEFAULT (0);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_StockTransactions_SourceDocumentLine' AND object_id = OBJECT_ID('inventory.StockTransactions'))
BEGIN
    CREATE INDEX IX_StockTransactions_SourceDocumentLine
        ON inventory.StockTransactions(SourceDocumentType, SourceDocumentId, SourceDocumentLineId);
END;
