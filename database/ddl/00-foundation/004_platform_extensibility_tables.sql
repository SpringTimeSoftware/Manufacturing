SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

IF OBJECT_ID(N'platform.UdfDefinitions', N'U') IS NULL
BEGIN
    CREATE TABLE platform.UdfDefinitions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        EntityType NVARCHAR(64) NOT NULL,
        FieldKey NVARCHAR(64) NOT NULL,
        Label NVARCHAR(128) NOT NULL,
        DataType NVARCHAR(32) NOT NULL,
        ControlType NVARCHAR(32) NOT NULL,
        LookupSource NVARCHAR(128) NULL,
        IsRequired BIT NOT NULL,
        MinNumber DECIMAL(18,6) NULL,
        MaxNumber DECIMAL(18,6) NULL,
        MaxLength INT NULL,
        DecimalScale INT NULL,
        RoleVisibility NVARCHAR(512) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UdfDefinitions_Company_Entity_FieldKey' AND object_id = OBJECT_ID(N'platform.UdfDefinitions'))
    CREATE UNIQUE INDEX UX_UdfDefinitions_Company_Entity_FieldKey ON platform.UdfDefinitions(CompanyId, EntityType, FieldKey);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UdfDefinitions_Entity_Status' AND object_id = OBJECT_ID(N'platform.UdfDefinitions'))
    CREATE INDEX IX_UdfDefinitions_Entity_Status ON platform.UdfDefinitions(EntityType, Status);

IF OBJECT_ID(N'platform.UdfValues', N'U') IS NULL
BEGIN
    CREATE TABLE platform.UdfValues
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        DefinitionId BIGINT NOT NULL,
        EntityId BIGINT NOT NULL,
        ValueText NVARCHAR(MAX) NULL,
        ValueNumber DECIMAL(18,6) NULL,
        ValueDate DATETIMEOFFSET(7) NULL,
        ValueBoolean BIT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_UdfValues_Definition_Entity' AND object_id = OBJECT_ID(N'platform.UdfValues'))
    CREATE UNIQUE INDEX UX_UdfValues_Definition_Entity ON platform.UdfValues(DefinitionId, EntityId);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_UdfValues_Entity' AND object_id = OBJECT_ID(N'platform.UdfValues'))
    CREATE INDEX IX_UdfValues_Entity ON platform.UdfValues(EntityId);

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = N'FK_UdfValues_UdfDefinitions'
      AND parent_object_id = OBJECT_ID(N'platform.UdfValues')
)
BEGIN
    ALTER TABLE platform.UdfValues
        ADD CONSTRAINT FK_UdfValues_UdfDefinitions
        FOREIGN KEY (DefinitionId) REFERENCES platform.UdfDefinitions(Id);
END;
