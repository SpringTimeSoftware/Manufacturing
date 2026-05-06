SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'[sales].[Currencies]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[Currencies] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_Currencies] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [CurrencyCode] NVARCHAR(8) NOT NULL,
        [CurrencyName] NVARCHAR(80) NOT NULL,
        [Symbol] NVARCHAR(8) NULL,
        [DecimalPrecision] INT NOT NULL CONSTRAINT [DF_Currencies_DecimalPrecision] DEFAULT (2),
        [RoundingMode] NVARCHAR(24) NOT NULL CONSTRAINT [DF_Currencies_RoundingMode] DEFAULT (N'HalfUp'),
        [IsBaseCurrency] BIT NOT NULL CONSTRAINT [DF_Currencies_IsBaseCurrency] DEFAULT (0),
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_Currencies_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_Currencies_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_Currencies_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_Currencies_Companies] FOREIGN KEY ([CompanyId]) REFERENCES [org].[Companies]([Id])
    );
    CREATE UNIQUE INDEX [UX_Currencies_Company_Code] ON [sales].[Currencies]([CompanyId], [CurrencyCode]);
END
GO

IF OBJECT_ID(N'[sales].[ExchangeRateSetups]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[ExchangeRateSetups] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_ExchangeRateSetups] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [CurrencyId] BIGINT NOT NULL,
        [RateType] NVARCHAR(32) NOT NULL,
        [RateSource] NVARCHAR(48) NOT NULL,
        [ManualRate] DECIMAL(18,8) NULL,
        [EffectiveFrom] DATE NOT NULL,
        [EffectiveTo] DATE NULL,
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_ExchangeRateSetups_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_ExchangeRateSetups_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_ExchangeRateSetups_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_ExchangeRateSetups_Companies] FOREIGN KEY ([CompanyId]) REFERENCES [org].[Companies]([Id]),
        CONSTRAINT [FK_ExchangeRateSetups_Currencies] FOREIGN KEY ([CurrencyId]) REFERENCES [sales].[Currencies]([Id])
    );
    CREATE UNIQUE INDEX [UX_ExchangeRateSetups_Key] ON [sales].[ExchangeRateSetups]([CompanyId], [CurrencyId], [RateType], [EffectiveFrom]);
END
GO

IF OBJECT_ID(N'[sales].[TaxCategories]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[TaxCategories] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_TaxCategories] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [TaxCategoryCode] NVARCHAR(32) NOT NULL,
        [TaxCategoryName] NVARCHAR(128) NOT NULL,
        [TaxScope] NVARCHAR(32) NOT NULL,
        [DefaultRatePercent] DECIMAL(9,4) NOT NULL CONSTRAINT [DF_TaxCategories_DefaultRate] DEFAULT (0),
        [IsRecoverable] BIT NOT NULL CONSTRAINT [DF_TaxCategories_IsRecoverable] DEFAULT (0),
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_TaxCategories_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_TaxCategories_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_TaxCategories_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_TaxCategories_Companies] FOREIGN KEY ([CompanyId]) REFERENCES [org].[Companies]([Id])
    );
    CREATE UNIQUE INDEX [UX_TaxCategories_Company_Code] ON [sales].[TaxCategories]([CompanyId], [TaxCategoryCode]);
END
GO

IF OBJECT_ID(N'[sales].[TaxCodes]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[TaxCodes] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_TaxCodes] PRIMARY KEY,
        [TaxCategoryId] BIGINT NOT NULL,
        [TaxCodeValue] NVARCHAR(32) NOT NULL,
        [TaxCodeName] NVARCHAR(128) NOT NULL,
        [RatePercent] DECIMAL(9,4) NOT NULL,
        [EffectiveFrom] DATE NOT NULL,
        [EffectiveTo] DATE NULL,
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_TaxCodes_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_TaxCodes_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_TaxCodes_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_TaxCodes_TaxCategories] FOREIGN KEY ([TaxCategoryId]) REFERENCES [sales].[TaxCategories]([Id])
    );
    CREATE UNIQUE INDEX [UX_TaxCodes_Category_Code] ON [sales].[TaxCodes]([TaxCategoryId], [TaxCodeValue]);
END
GO

IF OBJECT_ID(N'[sales].[PaymentTerms]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[PaymentTerms] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_PaymentTerms] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [PaymentTermsCode] NVARCHAR(32) NOT NULL,
        [PaymentTermsName] NVARCHAR(128) NOT NULL,
        [NetDays] INT NOT NULL CONSTRAINT [DF_PaymentTerms_NetDays] DEFAULT (0),
        [DiscountDays] INT NULL,
        [DiscountPercent] DECIMAL(9,4) NULL,
        [DueCalculationMode] NVARCHAR(32) NOT NULL CONSTRAINT [DF_PaymentTerms_DueMode] DEFAULT (N'InvoiceDate'),
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_PaymentTerms_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_PaymentTerms_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_PaymentTerms_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_PaymentTerms_Companies] FOREIGN KEY ([CompanyId]) REFERENCES [org].[Companies]([Id])
    );
    CREATE UNIQUE INDEX [UX_PaymentTerms_Company_Code] ON [sales].[PaymentTerms]([CompanyId], [PaymentTermsCode]);
END
GO

IF OBJECT_ID(N'[sales].[TradeTerms]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[TradeTerms] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_TradeTerms] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [TradeTermsCode] NVARCHAR(32) NOT NULL,
        [TradeTermsName] NVARCHAR(128) NOT NULL,
        [TradeMode] NVARCHAR(32) NOT NULL,
        [ResponsibilitySummary] NVARCHAR(512) NULL,
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_TradeTerms_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_TradeTerms_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_TradeTerms_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_TradeTerms_Companies] FOREIGN KEY ([CompanyId]) REFERENCES [org].[Companies]([Id])
    );
    CREATE UNIQUE INDEX [UX_TradeTerms_Company_Code] ON [sales].[TradeTerms]([CompanyId], [TradeTermsCode]);
END
GO

IF OBJECT_ID(N'[sales].[PriceLists]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[PriceLists] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_PriceLists] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [PriceListCode] NVARCHAR(32) NOT NULL,
        [PriceListName] NVARCHAR(128) NOT NULL,
        [CurrencyId] BIGINT NOT NULL,
        [PriceListType] NVARCHAR(32) NOT NULL,
        [EffectiveFrom] DATE NOT NULL,
        [EffectiveTo] DATE NULL,
        [CustomerSegment] NVARCHAR(64) NULL,
        [ApprovalStatus] NVARCHAR(24) NOT NULL CONSTRAINT [DF_PriceLists_ApprovalStatus] DEFAULT (N'Draft'),
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_PriceLists_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_PriceLists_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_PriceLists_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_PriceLists_Companies] FOREIGN KEY ([CompanyId]) REFERENCES [org].[Companies]([Id]),
        CONSTRAINT [FK_PriceLists_Currencies] FOREIGN KEY ([CurrencyId]) REFERENCES [sales].[Currencies]([Id])
    );
    CREATE UNIQUE INDEX [UX_PriceLists_Company_Code] ON [sales].[PriceLists]([CompanyId], [PriceListCode]);
END
GO

IF OBJECT_ID(N'[sales].[PriceListLines]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[PriceListLines] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_PriceListLines] PRIMARY KEY,
        [PriceListId] BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        [ItemId] BIGINT NULL,
        [ItemGroupId] BIGINT NULL,
        [UomId] BIGINT NOT NULL,
        [MinQuantity] DECIMAL(18,6) NOT NULL CONSTRAINT [DF_PriceListLines_MinQuantity] DEFAULT (0),
        [UnitPrice] DECIMAL(18,6) NOT NULL,
        [DiscountEligible] BIT NOT NULL CONSTRAINT [DF_PriceListLines_DiscountEligible] DEFAULT (1),
        [TaxCategoryId] BIGINT NULL,
        [EffectiveFrom] DATE NOT NULL,
        [EffectiveTo] DATE NULL,
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_PriceListLines_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_PriceListLines_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_PriceListLines_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_PriceListLines_PriceLists] FOREIGN KEY ([PriceListId]) REFERENCES [sales].[PriceLists]([Id]),
        CONSTRAINT [FK_PriceListLines_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items]([Id]),
        CONSTRAINT [FK_PriceListLines_ItemGroups] FOREIGN KEY ([ItemGroupId]) REFERENCES [master].[ItemGroups]([Id]),
        CONSTRAINT [FK_PriceListLines_Uoms] FOREIGN KEY ([UomId]) REFERENCES [measure].[Uoms]([Id]),
        CONSTRAINT [FK_PriceListLines_TaxCategories] FOREIGN KEY ([TaxCategoryId]) REFERENCES [sales].[TaxCategories]([Id])
    );
    CREATE INDEX [IX_PriceListLines_PriceList_Item] ON [sales].[PriceListLines]([PriceListId], [ItemId], [ItemGroupId], [UomId]);
END
GO

IF OBJECT_ID(N'[sales].[PriceAssignments]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[PriceAssignments] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_PriceAssignments] PRIMARY KEY,
        [PriceListId] BIGINT NOT NULL,
        [CustomerId] BIGINT NULL,
        [CustomerGroupCode] NVARCHAR(64) NULL,
        [ItemGroupId] BIGINT NULL,
        [BranchId] BIGINT NULL,
        [PriorityRank] INT NOT NULL CONSTRAINT [DF_PriceAssignments_PriorityRank] DEFAULT (10),
        [EffectiveFrom] DATE NOT NULL,
        [EffectiveTo] DATE NULL,
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_PriceAssignments_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_PriceAssignments_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_PriceAssignments_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_PriceAssignments_PriceLists] FOREIGN KEY ([PriceListId]) REFERENCES [sales].[PriceLists]([Id]),
        CONSTRAINT [FK_PriceAssignments_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [master].[Customers]([Id]),
        CONSTRAINT [FK_PriceAssignments_ItemGroups] FOREIGN KEY ([ItemGroupId]) REFERENCES [master].[ItemGroups]([Id]),
        CONSTRAINT [FK_PriceAssignments_Branches] FOREIGN KEY ([BranchId]) REFERENCES [org].[Branches]([Id])
    );
    CREATE INDEX [IX_PriceAssignments_PriceList_Priority] ON [sales].[PriceAssignments]([PriceListId], [PriorityRank], [CustomerId], [ItemGroupId]);
END
GO

IF OBJECT_ID(N'[sales].[DiscountSchemes]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[DiscountSchemes] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_DiscountSchemes] PRIMARY KEY,
        [CompanyId] BIGINT NOT NULL,
        [SchemeCode] NVARCHAR(32) NOT NULL,
        [SchemeName] NVARCHAR(128) NOT NULL,
        [DiscountType] NVARCHAR(32) NOT NULL,
        [CurrencyId] BIGINT NULL,
        [EffectiveFrom] DATE NOT NULL,
        [EffectiveTo] DATE NULL,
        [RequiresApproval] BIT NOT NULL CONSTRAINT [DF_DiscountSchemes_RequiresApproval] DEFAULT (1),
        [ApprovalStatus] NVARCHAR(24) NOT NULL CONSTRAINT [DF_DiscountSchemes_ApprovalStatus] DEFAULT (N'Draft'),
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_DiscountSchemes_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_DiscountSchemes_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_DiscountSchemes_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_DiscountSchemes_Companies] FOREIGN KEY ([CompanyId]) REFERENCES [org].[Companies]([Id]),
        CONSTRAINT [FK_DiscountSchemes_Currencies] FOREIGN KEY ([CurrencyId]) REFERENCES [sales].[Currencies]([Id])
    );
    CREATE UNIQUE INDEX [UX_DiscountSchemes_Company_Code] ON [sales].[DiscountSchemes]([CompanyId], [SchemeCode]);
END
GO

IF OBJECT_ID(N'[sales].[DiscountRules]', N'U') IS NULL
BEGIN
    CREATE TABLE [sales].[DiscountRules] (
        [Id] BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_DiscountRules] PRIMARY KEY,
        [DiscountSchemeId] BIGINT NOT NULL,
        [RuleNo] INT NOT NULL,
        [RuleName] NVARCHAR(128) NOT NULL,
        [ApplicabilityType] NVARCHAR(32) NOT NULL,
        [CustomerId] BIGINT NULL,
        [CustomerGroupCode] NVARCHAR(64) NULL,
        [ItemId] BIGINT NULL,
        [ItemGroupId] BIGINT NULL,
        [MinQuantity] DECIMAL(18,6) NOT NULL CONSTRAINT [DF_DiscountRules_MinQuantity] DEFAULT (0),
        [DiscountPercent] DECIMAL(9,4) NULL,
        [DiscountAmount] DECIMAL(18,6) NULL,
        [PriceListId] BIGINT NULL,
        [Status] NVARCHAR(16) NOT NULL CONSTRAINT [DF_DiscountRules_Status] DEFAULT (N'Active'),
        [CreatedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_DiscountRules_CreatedOn] DEFAULT (SYSUTCDATETIME()),
        [CreatedByUserId] BIGINT NULL,
        [ModifiedOn] DATETIMEOFFSET NOT NULL CONSTRAINT [DF_DiscountRules_ModifiedOn] DEFAULT (SYSUTCDATETIME()),
        [ModifiedByUserId] BIGINT NULL,
        CONSTRAINT [FK_DiscountRules_DiscountSchemes] FOREIGN KEY ([DiscountSchemeId]) REFERENCES [sales].[DiscountSchemes]([Id]),
        CONSTRAINT [FK_DiscountRules_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [master].[Customers]([Id]),
        CONSTRAINT [FK_DiscountRules_Items] FOREIGN KEY ([ItemId]) REFERENCES [master].[Items]([Id]),
        CONSTRAINT [FK_DiscountRules_ItemGroups] FOREIGN KEY ([ItemGroupId]) REFERENCES [master].[ItemGroups]([Id]),
        CONSTRAINT [FK_DiscountRules_PriceLists] FOREIGN KEY ([PriceListId]) REFERENCES [sales].[PriceLists]([Id])
    );
    CREATE UNIQUE INDEX [UX_DiscountRules_Scheme_RuleNo] ON [sales].[DiscountRules]([DiscountSchemeId], [RuleNo]);
END
GO
