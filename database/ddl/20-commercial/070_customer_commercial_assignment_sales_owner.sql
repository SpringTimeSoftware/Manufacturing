SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

IF COL_LENGTH(N'master.CustomerPartnerProfiles', N'DefaultSalesOwnerUserId') IS NULL
BEGIN
    ALTER TABLE master.CustomerPartnerProfiles ADD
        DefaultSalesOwnerUserId BIGINT NULL,
        DefaultSalesOwnerName NVARCHAR(160) NULL,
        DefaultSalesTeamId BIGINT NULL,
        DefaultTerritoryId BIGINT NULL,
        DefaultPriceListId BIGINT NULL,
        DefaultDiscountSchemeId BIGINT NULL,
        DefaultPaymentTermsId BIGINT NULL,
        DefaultTaxCategoryId BIGINT NULL,
        DefaultTaxTreatment NVARCHAR(32) NULL,
        DefaultCurrencyId BIGINT NULL,
        DefaultTradeTermsId BIGINT NULL;
END;

IF OBJECT_ID(N'sales.SalesTerritories', N'U') IS NULL
BEGIN
    CREATE TABLE sales.SalesTerritories
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        TerritoryCode NVARCHAR(32) NOT NULL,
        TerritoryName NVARCHAR(128) NOT NULL,
        ParentTerritoryId BIGINT NULL,
        Status NVARCHAR(30) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'sales.SalesTerritories') AND name = N'UX_SalesTerritories_Company_Code')
    CREATE UNIQUE INDEX UX_SalesTerritories_Company_Code ON sales.SalesTerritories(CompanyId, TerritoryCode);

IF OBJECT_ID(N'sales.SalesTeams', N'U') IS NULL
BEGIN
    CREATE TABLE sales.SalesTeams
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        TeamCode NVARCHAR(32) NOT NULL,
        TeamName NVARCHAR(128) NOT NULL,
        DefaultTerritoryId BIGINT NULL,
        Status NVARCHAR(30) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'sales.SalesTeams') AND name = N'UX_SalesTeams_Company_Code')
    CREATE UNIQUE INDEX UX_SalesTeams_Company_Code ON sales.SalesTeams(CompanyId, TeamCode);

IF OBJECT_ID(N'sales.SalesTeamMembers', N'U') IS NULL
BEGIN
    CREATE TABLE sales.SalesTeamMembers
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        SalesTeamId BIGINT NOT NULL,
        UserId BIGINT NOT NULL,
        RoleCode NVARCHAR(64) NOT NULL,
        EffectiveFrom DATE NOT NULL,
        EffectiveTo DATE NULL,
        Status NVARCHAR(30) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'sales.SalesTeamMembers') AND name = N'UX_SalesTeamMembers_Team_User_Effective')
    CREATE UNIQUE INDEX UX_SalesTeamMembers_Team_User_Effective ON sales.SalesTeamMembers(CompanyId, SalesTeamId, UserId, EffectiveFrom);

IF OBJECT_ID(N'sales.CustomerSalesAssignments', N'U') IS NULL
BEGIN
    CREATE TABLE sales.CustomerSalesAssignments
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        CustomerId BIGINT NOT NULL,
        SalesOwnerUserId BIGINT NULL,
        SalesTeamId BIGINT NULL,
        TerritoryId BIGINT NULL,
        EffectiveFrom DATE NOT NULL,
        EffectiveTo DATE NULL,
        Status NVARCHAR(30) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'sales.CustomerSalesAssignments') AND name = N'IX_CustomerSalesAssignments_Customer_Effective')
    CREATE INDEX IX_CustomerSalesAssignments_Customer_Effective ON sales.CustomerSalesAssignments(CompanyId, CustomerId, EffectiveFrom, Status);

