SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[master].[CustomerPartnerProfiles]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[CustomerPartnerProfiles] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_CustomerPartnerProfiles] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [CustomerId] BIGINT NOT NULL,
        [LegalName] NVARCHAR(180) NULL,
        [TaxCategory] NVARCHAR(60) NULL,
        [CurrencyCode] NVARCHAR(8) NULL,
        [CreditStatus] NVARCHAR(40) NULL,
        [CreditLimitAmount] DECIMAL(18,2) NULL,
        [CreditHoldRule] NVARCHAR(80) NULL,
        [PaymentTermsCode] NVARCHAR(32) NULL,
        [CommercialSegment] NVARCHAR(80) NULL,
        [OrderReleaseControl] NVARCHAR(80) NULL,
        [DispatchPreference] NVARCHAR(80) NULL,
        [DispatchInstruction] NVARCHAR(500) NULL,
        [CatalogVisible] BIT NOT NULL CONSTRAINT [DF_CustomerPartnerProfiles_CatalogVisible] DEFAULT (0),
        [CatalogSegment] NVARCHAR(80) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_CustomerPartnerProfiles_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_CustomerPartnerProfiles_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_CustomerPartnerProfiles_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_CustomerPartnerProfiles_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [master].[Customers] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UX_CustomerPartnerProfiles_CustomerId' AND [object_id] = OBJECT_ID(N'[master].[CustomerPartnerProfiles]'))
BEGIN
    CREATE UNIQUE INDEX [UX_CustomerPartnerProfiles_CustomerId] ON [master].[CustomerPartnerProfiles] ([CustomerId]);
END;
GO

IF OBJECT_ID(N'[master].[CustomerContactPoints]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[CustomerContactPoints] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_CustomerContactPoints] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [CustomerId] BIGINT NOT NULL,
        [CustomerAddressId] BIGINT NULL,
        [ContactName] NVARCHAR(128) NOT NULL,
        [ContactRole] NVARCHAR(60) NOT NULL,
        [Channel] NVARCHAR(32) NOT NULL,
        [ContactValue] NVARCHAR(160) NOT NULL,
        [IsPrimary] BIT NOT NULL CONSTRAINT [DF_CustomerContactPoints_IsPrimary] DEFAULT (0),
        [ConsentStatus] NVARCHAR(40) NULL,
        [EscalationLevel] NVARCHAR(40) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_CustomerContactPoints_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_CustomerContactPoints_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_CustomerContactPoints_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_CustomerContactPoints_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [master].[Customers] ([Id]),
        CONSTRAINT [FK_CustomerContactPoints_CustomerAddresses] FOREIGN KEY ([CustomerAddressId]) REFERENCES [master].[CustomerAddresses] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_CustomerContactPoints_CustomerId' AND [object_id] = OBJECT_ID(N'[master].[CustomerContactPoints]'))
BEGIN
    CREATE INDEX [IX_CustomerContactPoints_CustomerId] ON [master].[CustomerContactPoints] ([CustomerId], [ContactRole], [Channel], [Status]);
END;
GO

IF OBJECT_ID(N'[master].[CustomerItemReferenceProfiles]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[CustomerItemReferenceProfiles] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_CustomerItemReferenceProfiles] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [CustomerId] BIGINT NOT NULL,
        [ItemId] BIGINT NULL,
        [CustomerItemCode] NVARCHAR(80) NOT NULL,
        [DrawingNo] NVARCHAR(100) NULL,
        [RevisionCode] NVARCHAR(40) NULL,
        [PackagingOverride] NVARCHAR(500) NULL,
        [SpecificationOverride] NVARCHAR(500) NULL,
        [ApprovalStatus] NVARCHAR(40) NOT NULL CONSTRAINT [DF_CustomerItemReferenceProfiles_ApprovalStatus] DEFAULT (N'Draft'),
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_CustomerItemReferenceProfiles_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_CustomerItemReferenceProfiles_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_CustomerItemReferenceProfiles_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_CustomerItemReferenceProfiles_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [master].[Customers] ([Id]),
        CONSTRAINT [FK_CustomerItemReferenceProfiles_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_CustomerItemReferenceProfiles_CustomerId' AND [object_id] = OBJECT_ID(N'[master].[CustomerItemReferenceProfiles]'))
BEGIN
    CREATE INDEX [IX_CustomerItemReferenceProfiles_CustomerId] ON [master].[CustomerItemReferenceProfiles] ([CustomerId], [ItemId], [Status]);
END;
GO

IF OBJECT_ID(N'[master].[CustomerDocuments]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[CustomerDocuments] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_CustomerDocuments] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [CustomerId] BIGINT NOT NULL,
        [DocumentType] NVARCHAR(60) NOT NULL,
        [Title] NVARCHAR(180) NOT NULL,
        [DocumentNo] NVARCHAR(80) NULL,
        [RevisionCode] NVARCHAR(40) NULL,
        [FileName] NVARCHAR(260) NULL,
        [StorageUri] NVARCHAR(500) NULL,
        [ApprovalStatus] NVARCHAR(40) NOT NULL CONSTRAINT [DF_CustomerDocuments_ApprovalStatus] DEFAULT (N'Draft'),
        [VisibilityScope] NVARCHAR(40) NOT NULL CONSTRAINT [DF_CustomerDocuments_VisibilityScope] DEFAULT (N'Internal'),
        [EffectiveFrom] DATE NULL,
        [EffectiveTo] DATE NULL,
        [ExpiresOn] DATE NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_CustomerDocuments_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_CustomerDocuments_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_CustomerDocuments_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_CustomerDocuments_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [master].[Customers] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_CustomerDocuments_CustomerId' AND [object_id] = OBJECT_ID(N'[master].[CustomerDocuments]'))
BEGIN
    CREATE INDEX [IX_CustomerDocuments_CustomerId] ON [master].[CustomerDocuments] ([CustomerId], [DocumentType], [Status]);
END;
GO

IF OBJECT_ID(N'[master].[SupplierPartnerProfiles]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[SupplierPartnerProfiles] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_SupplierPartnerProfiles] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [SupplierId] BIGINT NOT NULL,
        [LegalName] NVARCHAR(180) NULL,
        [TaxCategory] NVARCHAR(60) NULL,
        [CurrencyCode] NVARCHAR(8) NULL,
        [PaymentTermsCode] NVARCHAR(32) NULL,
        [PreferredStatus] NVARCHAR(40) NULL,
        [ComplianceStatus] NVARCHAR(40) NULL,
        [CapabilitySummary] NVARCHAR(500) NULL,
        [QualityRating] DECIMAL(5,2) NULL,
        [ProcurementReleaseControl] NVARCHAR(80) NULL,
        [LeadTimeReviewDays] INT NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_SupplierPartnerProfiles_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_SupplierPartnerProfiles_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_SupplierPartnerProfiles_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_SupplierPartnerProfiles_Suppliers] FOREIGN KEY ([SupplierId]) REFERENCES [master].[Suppliers] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'UX_SupplierPartnerProfiles_SupplierId' AND [object_id] = OBJECT_ID(N'[master].[SupplierPartnerProfiles]'))
BEGIN
    CREATE UNIQUE INDEX [UX_SupplierPartnerProfiles_SupplierId] ON [master].[SupplierPartnerProfiles] ([SupplierId]);
END;
GO

IF OBJECT_ID(N'[master].[SupplierContactPoints]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[SupplierContactPoints] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_SupplierContactPoints] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [SupplierId] BIGINT NOT NULL,
        [SupplierAddressId] BIGINT NULL,
        [ContactName] NVARCHAR(128) NOT NULL,
        [ContactRole] NVARCHAR(60) NOT NULL,
        [Channel] NVARCHAR(32) NOT NULL,
        [ContactValue] NVARCHAR(160) NOT NULL,
        [IsPrimary] BIT NOT NULL CONSTRAINT [DF_SupplierContactPoints_IsPrimary] DEFAULT (0),
        [ConsentStatus] NVARCHAR(40) NULL,
        [EscalationLevel] NVARCHAR(40) NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_SupplierContactPoints_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_SupplierContactPoints_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_SupplierContactPoints_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_SupplierContactPoints_Suppliers] FOREIGN KEY ([SupplierId]) REFERENCES [master].[Suppliers] ([Id]),
        CONSTRAINT [FK_SupplierContactPoints_SupplierAddresses] FOREIGN KEY ([SupplierAddressId]) REFERENCES [master].[SupplierAddresses] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_SupplierContactPoints_SupplierId' AND [object_id] = OBJECT_ID(N'[master].[SupplierContactPoints]'))
BEGIN
    CREATE INDEX [IX_SupplierContactPoints_SupplierId] ON [master].[SupplierContactPoints] ([SupplierId], [ContactRole], [Channel], [Status]);
END;
GO

IF OBJECT_ID(N'[master].[SupplierVendorReferenceProfiles]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[SupplierVendorReferenceProfiles] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_SupplierVendorReferenceProfiles] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [SupplierId] BIGINT NOT NULL,
        [ItemId] BIGINT NULL,
        [VendorItemCode] NVARCHAR(80) NOT NULL,
        [MinimumOrderQty] DECIMAL(18,6) NULL,
        [LeadTimeDays] INT NULL,
        [PurchaseUomId] BIGINT NULL,
        [ComplianceStatus] NVARCHAR(40) NULL,
        [DocumentStatus] NVARCHAR(40) NULL,
        [ApprovalStatus] NVARCHAR(40) NOT NULL CONSTRAINT [DF_SupplierVendorReferenceProfiles_ApprovalStatus] DEFAULT (N'Draft'),
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_SupplierVendorReferenceProfiles_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_SupplierVendorReferenceProfiles_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_SupplierVendorReferenceProfiles_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_SupplierVendorReferenceProfiles_Suppliers] FOREIGN KEY ([SupplierId]) REFERENCES [master].[Suppliers] ([Id]),
        CONSTRAINT [FK_SupplierVendorReferenceProfiles_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items] ([Id]),
        CONSTRAINT [FK_SupplierVendorReferenceProfiles_Uoms] FOREIGN KEY ([PurchaseUomId]) REFERENCES [measure].[Uoms] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_SupplierVendorReferenceProfiles_SupplierId' AND [object_id] = OBJECT_ID(N'[master].[SupplierVendorReferenceProfiles]'))
BEGIN
    CREATE INDEX [IX_SupplierVendorReferenceProfiles_SupplierId] ON [master].[SupplierVendorReferenceProfiles] ([SupplierId], [ItemId], [Status]);
END;
GO

IF OBJECT_ID(N'[master].[SupplierDocuments]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[SupplierDocuments] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_SupplierDocuments] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [SupplierId] BIGINT NOT NULL,
        [DocumentType] NVARCHAR(60) NOT NULL,
        [Title] NVARCHAR(180) NOT NULL,
        [DocumentNo] NVARCHAR(80) NULL,
        [RevisionCode] NVARCHAR(40) NULL,
        [FileName] NVARCHAR(260) NULL,
        [StorageUri] NVARCHAR(500) NULL,
        [ApprovalStatus] NVARCHAR(40) NOT NULL CONSTRAINT [DF_SupplierDocuments_ApprovalStatus] DEFAULT (N'Draft'),
        [VisibilityScope] NVARCHAR(40) NOT NULL CONSTRAINT [DF_SupplierDocuments_VisibilityScope] DEFAULT (N'Internal'),
        [EffectiveFrom] DATE NULL,
        [EffectiveTo] DATE NULL,
        [ExpiresOn] DATE NULL,
        [Status] NVARCHAR(30) NOT NULL CONSTRAINT [DF_SupplierDocuments_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_SupplierDocuments_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET(7) NOT NULL CONSTRAINT [DF_SupplierDocuments_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_SupplierDocuments_Suppliers] FOREIGN KEY ([SupplierId]) REFERENCES [master].[Suppliers] ([Id])
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = N'IX_SupplierDocuments_SupplierId' AND [object_id] = OBJECT_ID(N'[master].[SupplierDocuments]'))
BEGIN
    CREATE INDEX [IX_SupplierDocuments_SupplierId] ON [master].[SupplierDocuments] ([SupplierId], [DocumentType], [Status]);
END;
GO
