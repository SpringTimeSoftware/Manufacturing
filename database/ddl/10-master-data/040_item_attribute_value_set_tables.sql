IF OBJECT_ID(N'[master].[ItemAttributes]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemAttributes]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        AttributeCode NVARCHAR(32) NOT NULL,
        AttributeName NVARCHAR(128) NOT NULL,
        DataType NVARCHAR(24) NOT NULL,
        IsVariantAxis BIT NOT NULL,
        UnitUomId BIGINT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ItemAttributes_CompanyId_AttributeCode' AND object_id = OBJECT_ID(N'[master].[ItemAttributes]'))
    CREATE UNIQUE INDEX UX_ItemAttributes_CompanyId_AttributeCode ON [master].[ItemAttributes](CompanyId, AttributeCode);

IF OBJECT_ID(N'[master].[ItemAttributeValues]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemAttributeValues]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ItemAttributeId BIGINT NOT NULL,
        AttributeValueCode NVARCHAR(64) NOT NULL,
        AttributeValueName NVARCHAR(128) NOT NULL,
        SortOrder INT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT FK_ItemAttributeValues_ItemAttributes FOREIGN KEY (ItemAttributeId) REFERENCES [master].[ItemAttributes](Id)
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ItemAttributeValues_ItemAttributeId_AttributeValueCode' AND object_id = OBJECT_ID(N'[master].[ItemAttributeValues]'))
    CREATE UNIQUE INDEX UX_ItemAttributeValues_ItemAttributeId_AttributeValueCode ON [master].[ItemAttributeValues](ItemAttributeId, AttributeValueCode);
