SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[master].[ItemMedia]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemMedia] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemMedia] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [ItemVariantId] BIGINT NULL,
        [MediaType] NVARCHAR(40) NOT NULL,
        [Title] NVARCHAR(160) NOT NULL,
        [FileName] NVARCHAR(260) NULL,
        [MimeType] NVARCHAR(120) NULL,
        [StorageUri] NVARCHAR(600) NULL,
        [ThumbnailUri] NVARCHAR(600) NULL,
        [IsPrimary] BIT NOT NULL CONSTRAINT [DF_ItemMedia_IsPrimary] DEFAULT (0),
        [SortOrder] INT NOT NULL CONSTRAINT [DF_ItemMedia_SortOrder] DEFAULT (100),
        [ApprovalStatus] NVARCHAR(40) NOT NULL CONSTRAINT [DF_ItemMedia_ApprovalStatus] DEFAULT (N'Draft'),
        [VisibilityScope] NVARCHAR(40) NOT NULL CONSTRAINT [DF_ItemMedia_VisibilityScope] DEFAULT (N'Internal'),
        [RetiredOnUtc] DATETIMEOFFSET(7) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemMedia_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemMedia_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemMedia_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemMedia_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_ItemMedia_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemMedia]'))
BEGIN
    CREATE INDEX [IX_ItemMedia_ItemId] ON [master].[ItemMedia] ([ItemId], [Status], [IsPrimary]);
END;
GO

IF OBJECT_ID(N'[master].[ItemDocuments]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemDocuments] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemDocuments] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [ItemVariantId] BIGINT NULL,
        [DocumentType] NVARCHAR(50) NOT NULL,
        [Title] NVARCHAR(180) NOT NULL,
        [DocumentNo] NVARCHAR(80) NULL,
        [RevisionCode] NVARCHAR(40) NULL,
        [FileName] NVARCHAR(260) NULL,
        [StorageUri] NVARCHAR(600) NULL,
        [ApprovalStatus] NVARCHAR(40) NOT NULL CONSTRAINT [DF_ItemDocuments_ApprovalStatus] DEFAULT (N'Draft'),
        [VisibilityScope] NVARCHAR(40) NOT NULL CONSTRAINT [DF_ItemDocuments_VisibilityScope] DEFAULT (N'Internal'),
        [EffectiveFrom] DATE NULL,
        [EffectiveTo] DATE NULL,
        [ExpiresOn] DATE NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemDocuments_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemDocuments_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemDocuments_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemDocuments_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_ItemDocuments_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemDocuments]'))
BEGIN
    CREATE INDEX [IX_ItemDocuments_ItemId] ON [master].[ItemDocuments] ([ItemId], [DocumentType], [Status]);
END;
GO

IF OBJECT_ID(N'[master].[ItemCatalog]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemCatalog] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemCatalog] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [CatalogTitle] NVARCHAR(180) NOT NULL,
        [CatalogSection] NVARCHAR(120) NULL,
        [MarketingDescription] NVARCHAR(1000) NULL,
        [CustomerVisibleSpecsJson] NVARCHAR(MAX) NULL,
        [PublishStatus] NVARCHAR(40) NOT NULL CONSTRAINT [DF_ItemCatalog_PublishStatus] DEFAULT (N'Draft'),
        [IsCatalogVisible] BIT NOT NULL CONSTRAINT [DF_ItemCatalog_IsCatalogVisible] DEFAULT (0),
        [EffectiveFrom] DATE NULL,
        [EffectiveTo] DATE NULL,
        [PreviewSlug] NVARCHAR(180) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemCatalog_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemCatalog_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemCatalog_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemCatalog_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UX_ItemCatalog_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemCatalog]'))
BEGIN
    CREATE UNIQUE INDEX [UX_ItemCatalog_ItemId] ON [master].[ItemCatalog] ([ItemId]);
END;
GO

IF OBJECT_ID(N'[master].[ItemPackaging]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemPackaging] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemPackaging] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [PackagingUomId] BIGINT NULL,
        [InnerPackQty] DECIMAL(18,4) NULL,
        [CartonQty] DECIMAL(18,4) NULL,
        [PalletQty] DECIMAL(18,4) NULL,
        [NetWeight] DECIMAL(18,4) NULL,
        [GrossWeight] DECIMAL(18,4) NULL,
        [WeightUomId] BIGINT NULL,
        [LengthValue] DECIMAL(18,4) NULL,
        [WidthValue] DECIMAL(18,4) NULL,
        [HeightValue] DECIMAL(18,4) NULL,
        [DimensionUomId] BIGINT NULL,
        [LabelCount] INT NULL,
        [PackingInstructions] NVARCHAR(1000) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemPackaging_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemPackaging_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemPackaging_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemPackaging_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UX_ItemPackaging_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemPackaging]'))
BEGIN
    CREATE UNIQUE INDEX [UX_ItemPackaging_ItemId] ON [master].[ItemPackaging] ([ItemId]);
END;
GO

IF OBJECT_ID(N'[master].[ItemPhysicalSpecs]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemPhysicalSpecs] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemPhysicalSpecs] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [LengthValue] DECIMAL(18,4) NULL,
        [WidthValue] DECIMAL(18,4) NULL,
        [HeightValue] DECIMAL(18,4) NULL,
        [ThicknessValue] DECIMAL(18,4) NULL,
        [DimensionUomId] BIGINT NULL,
        [Grade] NVARCHAR(80) NULL,
        [Material] NVARCHAR(120) NULL,
        [ColorFinish] NVARCHAR(120) NULL,
        [ShelfLifeDays] INT NULL,
        [StorageCondition] NVARCHAR(240) NULL,
        [ToleranceNote] NVARCHAR(500) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemPhysicalSpecs_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemPhysicalSpecs_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemPhysicalSpecs_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemPhysicalSpecs_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UX_ItemPhysicalSpecs_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemPhysicalSpecs]'))
BEGIN
    CREATE UNIQUE INDEX [UX_ItemPhysicalSpecs_ItemId] ON [master].[ItemPhysicalSpecs] ([ItemId]);
END;
GO

IF OBJECT_ID(N'[master].[ItemCustomerReferences]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemCustomerReferences] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemCustomerReferences] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [CustomerId] BIGINT NOT NULL,
        [CustomerItemCode] NVARCHAR(80) NOT NULL,
        [DrawingNo] NVARCHAR(100) NULL,
        [RevisionCode] NVARCHAR(40) NULL,
        [PackagingOverride] NVARCHAR(500) NULL,
        [SpecificationOverride] NVARCHAR(500) NULL,
        [ApprovalStatus] NVARCHAR(40) NOT NULL CONSTRAINT [DF_ItemCustomerReferences_ApprovalStatus] DEFAULT (N'Draft'),
        [EffectiveFrom] DATE NULL,
        [EffectiveTo] DATE NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemCustomerReferences_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemCustomerReferences_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemCustomerReferences_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemCustomerReferences_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_ItemCustomerReferences_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemCustomerReferences]'))
BEGIN
    CREATE INDEX [IX_ItemCustomerReferences_ItemId] ON [master].[ItemCustomerReferences] ([ItemId], [CustomerId], [Status]);
END;
GO

IF OBJECT_ID(N'[master].[ItemVendorReferences]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemVendorReferences] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemVendorReferences] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [SupplierId] BIGINT NOT NULL,
        [VendorItemCode] NVARCHAR(80) NOT NULL,
        [MinimumOrderQty] DECIMAL(18,4) NULL,
        [LeadTimeDays] INT NULL,
        [PurchaseUomId] BIGINT NULL,
        [ComplianceStatus] NVARCHAR(80) NULL,
        [DocumentStatus] NVARCHAR(80) NULL,
        [EffectiveFrom] DATE NULL,
        [EffectiveTo] DATE NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemVendorReferences_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemVendorReferences_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemVendorReferences_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemVendorReferences_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_ItemVendorReferences_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemVendorReferences]'))
BEGIN
    CREATE INDEX [IX_ItemVendorReferences_ItemId] ON [master].[ItemVendorReferences] ([ItemId], [SupplierId], [Status]);
END;
GO

IF OBJECT_ID(N'[master].[ItemAliases]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemAliases] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemAliases] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [AliasType] NVARCHAR(50) NOT NULL,
        [AliasValue] NVARCHAR(160) NOT NULL,
        [LanguageCode] NVARCHAR(16) NULL,
        [IsPrimary] BIT NOT NULL CONSTRAINT [DF_ItemAliases_IsPrimary] DEFAULT (0),
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemAliases_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemAliases_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemAliases_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemAliases_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_ItemAliases_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemAliases]'))
BEGIN
    CREATE INDEX [IX_ItemAliases_ItemId] ON [master].[ItemAliases] ([ItemId], [AliasType], [Status]);
END;
GO

IF OBJECT_ID(N'[master].[ItemManufacturingPolicies]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemManufacturingPolicies] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemManufacturingPolicies] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [BomPolicy] NVARCHAR(80) NOT NULL,
        [RoutingPolicy] NVARCHAR(80) NOT NULL,
        [IssueMethod] NVARCHAR(40) NOT NULL,
        [ScrapAllowancePercent] DECIMAL(9,4) NULL,
        [OperationLinkage] NVARCHAR(240) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemManufacturingPolicies_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemManufacturingPolicies_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemManufacturingPolicies_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemManufacturingPolicies_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UX_ItemManufacturingPolicies_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemManufacturingPolicies]'))
BEGIN
    CREATE UNIQUE INDEX [UX_ItemManufacturingPolicies_ItemId] ON [master].[ItemManufacturingPolicies] ([ItemId]);
END;
GO

IF OBJECT_ID(N'[master].[ItemPlanningPolicies]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemPlanningPolicies] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemPlanningPolicies] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [MrpEnabled] BIT NOT NULL CONSTRAINT [DF_ItemPlanningPolicies_MrpEnabled] DEFAULT (1),
        [SafetyStockQty] DECIMAL(18,4) NULL,
        [ReorderPointQty] DECIMAL(18,4) NULL,
        [MinimumQty] DECIMAL(18,4) NULL,
        [MaximumQty] DECIMAL(18,4) NULL,
        [LeadTimeDays] INT NULL,
        [LotSizeQty] DECIMAL(18,4) NULL,
        [AbcClass] NVARCHAR(12) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemPlanningPolicies_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemPlanningPolicies_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemPlanningPolicies_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemPlanningPolicies_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UX_ItemPlanningPolicies_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemPlanningPolicies]'))
BEGIN
    CREATE UNIQUE INDEX [UX_ItemPlanningPolicies_ItemId] ON [master].[ItemPlanningPolicies] ([ItemId]);
END;
GO

IF OBJECT_ID(N'[master].[ItemInventoryPolicies]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemInventoryPolicies] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemInventoryPolicies] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [DefaultWarehouseId] BIGINT NULL,
        [DefaultBinId] BIGINT NULL,
        [SerialTrackingMode] NVARCHAR(40) NOT NULL,
        [LotTrackingMode] NVARCHAR(40) NOT NULL,
        [IsCatchWeightItem] BIT NOT NULL CONSTRAINT [DF_ItemInventoryPolicies_IsCatchWeightItem] DEFAULT (0),
        [NegativeStockPolicy] NVARCHAR(40) NOT NULL,
        [ExpiryPolicy] NVARCHAR(80) NULL,
        [ShelfLifeDays] INT NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemInventoryPolicies_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemInventoryPolicies_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemInventoryPolicies_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemInventoryPolicies_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UX_ItemInventoryPolicies_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemInventoryPolicies]'))
BEGIN
    CREATE UNIQUE INDEX [UX_ItemInventoryPolicies_ItemId] ON [master].[ItemInventoryPolicies] ([ItemId]);
END;
GO

IF OBJECT_ID(N'[master].[ItemQualityPolicies]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemQualityPolicies] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ItemQualityPolicies] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [ItemId] BIGINT NOT NULL,
        [QcRequired] BIT NOT NULL CONSTRAINT [DF_ItemQualityPolicies_QcRequired] DEFAULT (0),
        [InspectionPlanId] BIGINT NULL,
        [InspectionPlanCode] NVARCHAR(80) NULL,
        [CertificateRequirement] NVARCHAR(160) NULL,
        [HoldRule] NVARCHAR(160) NULL,
        [TraceabilityDepth] NVARCHAR(80) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_ItemQualityPolicies_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemQualityPolicies_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_ItemQualityPolicies_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ItemQualityPolicies_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UX_ItemQualityPolicies_ItemId' AND [object_id] = OBJECT_ID(N'[master].[ItemQualityPolicies]'))
BEGIN
    CREATE UNIQUE INDEX [UX_ItemQualityPolicies_ItemId] ON [master].[ItemQualityPolicies] ([ItemId]);
END;
GO
