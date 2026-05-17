IF COL_LENGTH(N'dispatch.PackListLines', N'PcidId') IS NULL
    ALTER TABLE dispatch.PackListLines ADD PcidId BIGINT NULL;

IF COL_LENGTH(N'dispatch.Shipments', N'TransporterName') IS NULL
    ALTER TABLE dispatch.Shipments ADD TransporterName NVARCHAR(128) NULL;

IF COL_LENGTH(N'dispatch.Shipments', N'DriverName') IS NULL
    ALTER TABLE dispatch.Shipments ADD DriverName NVARCHAR(128) NULL;

IF COL_LENGTH(N'dispatch.Shipments', N'DriverContact') IS NULL
    ALTER TABLE dispatch.Shipments ADD DriverContact NVARCHAR(64) NULL;

IF COL_LENGTH(N'dispatch.Shipments', N'DeliveryAddressSnapshot') IS NULL
    ALTER TABLE dispatch.Shipments ADD DeliveryAddressSnapshot NVARCHAR(1000) NULL;

IF COL_LENGTH(N'dispatch.Shipments', N'PodReceivedBy') IS NULL
    ALTER TABLE dispatch.Shipments ADD PodReceivedBy NVARCHAR(128) NULL;

IF COL_LENGTH(N'dispatch.Shipments', N'PodReceiverContact') IS NULL
    ALTER TABLE dispatch.Shipments ADD PodReceiverContact NVARCHAR(64) NULL;

IF COL_LENGTH(N'dispatch.Shipments', N'PodReceivedOn') IS NULL
    ALTER TABLE dispatch.Shipments ADD PodReceivedOn DATETIMEOFFSET(7) NULL;

IF COL_LENGTH(N'dispatch.Shipments', N'PodEvidenceAttachmentId') IS NULL
    ALTER TABLE dispatch.Shipments ADD PodEvidenceAttachmentId BIGINT NULL;

IF COL_LENGTH(N'dispatch.Shipments', N'PodRemarks') IS NULL
    ALTER TABLE dispatch.Shipments ADD PodRemarks NVARCHAR(512) NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'PcidId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD PcidId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'DeliveredQuantity') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD DeliveredQuantity DECIMAL(18,6) NOT NULL CONSTRAINT DF_ShipmentLines_DeliveredQuantity DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'ShortQuantity') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD ShortQuantity DECIMAL(18,6) NOT NULL CONSTRAINT DF_ShipmentLines_ShortQuantity DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'DamagedQuantity') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD DamagedQuantity DECIMAL(18,6) NOT NULL CONSTRAINT DF_ShipmentLines_DamagedQuantity DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'SalesOrderId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD SalesOrderId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'SourceDocumentNo') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD SourceDocumentNo NVARCHAR(64) NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'SourceDocumentLineId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD SourceDocumentLineId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'SourceDocumentRevisionNo') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD SourceDocumentRevisionNo INT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'SourceDocumentVersionNo') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD SourceDocumentVersionNo INT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'ItemRevisionId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD ItemRevisionId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'EngineeringDocumentRevisionId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD EngineeringDocumentRevisionId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'BomRevisionId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD BomRevisionId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'RoutingId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD RoutingId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'UnitPrice') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD UnitPrice DECIMAL(18,6) NOT NULL CONSTRAINT DF_ShipmentLines_UnitPrice DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'PriceSourceType') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD PriceSourceType NVARCHAR(32) NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'PriceListLineId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD PriceListLineId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'DiscountSchemeId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD DiscountSchemeId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'DiscountRuleId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD DiscountRuleId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'DiscountPercent') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD DiscountPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_ShipmentLines_DiscountPercent DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'DiscountAmount') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD DiscountAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ShipmentLines_DiscountAmount DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'TaxCodeId') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD TaxCodeId BIGINT NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'TaxRateSnapshot') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD TaxRateSnapshot DECIMAL(9,4) NOT NULL CONSTRAINT DF_ShipmentLines_TaxRateSnapshot DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'TaxAmount') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD TaxAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ShipmentLines_TaxAmount DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'LineSubtotal') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD LineSubtotal DECIMAL(18,4) NOT NULL CONSTRAINT DF_ShipmentLines_LineSubtotal DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'LineTaxableAmount') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD LineTaxableAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ShipmentLines_LineTaxableAmount DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'LineTotalAmount') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD LineTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ShipmentLines_LineTotalAmount DEFAULT(0);

IF COL_LENGTH(N'dispatch.ShipmentLines', N'LineInternalRemarks') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD LineInternalRemarks NVARCHAR(512) NULL;

IF COL_LENGTH(N'dispatch.ShipmentLines', N'LineCustomerFacingRemarks') IS NULL
    ALTER TABLE dispatch.ShipmentLines ADD LineCustomerFacingRemarks NVARCHAR(512) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_PackListLines_PcidId' AND object_id = OBJECT_ID(N'dispatch.PackListLines'))
    CREATE INDEX IX_PackListLines_PcidId ON dispatch.PackListLines(PcidId);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ShipmentLines_SalesOrderLineId' AND object_id = OBJECT_ID(N'dispatch.ShipmentLines'))
    CREATE INDEX IX_ShipmentLines_SalesOrderLineId ON dispatch.ShipmentLines(SalesOrderLineId);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ShipmentLines_PcidId' AND object_id = OBJECT_ID(N'dispatch.ShipmentLines'))
    CREATE INDEX IX_ShipmentLines_PcidId ON dispatch.ShipmentLines(PcidId);
