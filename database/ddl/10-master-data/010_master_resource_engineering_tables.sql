IF OBJECT_ID(N'[master].[ItemGroups]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemGroups]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ItemGroupCode NVARCHAR(32) NOT NULL,
        ItemGroupName NVARCHAR(128) NOT NULL,
        ParentItemGroupId BIGINT NULL,
        DefaultMeasurementProfileId BIGINT NULL,
        DefaultQcRequired BIT NOT NULL,
        DefaultTraceabilityMode NVARCHAR(24) NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ItemGroups_CompanyId_ItemGroupCode' AND object_id = OBJECT_ID(N'[master].[ItemGroups]'))
    CREATE UNIQUE INDEX UX_ItemGroups_CompanyId_ItemGroupCode ON [master].[ItemGroups](CompanyId, ItemGroupCode);

IF OBJECT_ID(N'[master].[Items]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[Items]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ItemCode NVARCHAR(64) NOT NULL,
        ItemName NVARCHAR(160) NOT NULL,
        ShortName NVARCHAR(80) NULL,
        ItemType NVARCHAR(32) NOT NULL,
        ItemGroupId BIGINT NOT NULL,
        MeasurementProfileId BIGINT NOT NULL,
        StockUomId BIGINT NOT NULL,
        PurchaseUomId BIGINT NULL,
        SalesUomId BIGINT NULL,
        ProductionUomId BIGINT NULL,
        QcUomId BIGINT NULL,
        TraceabilityMode NVARCHAR(24) NOT NULL,
        IsCatchWeightItem BIT NOT NULL,
        IsQcRequired BIT NOT NULL,
        IsBatchExpiryTracked BIT NOT NULL,
        DefaultIssueMethod NVARCHAR(24) NOT NULL,
        DefaultMakeType NVARCHAR(24) NOT NULL,
        DefaultWarehouseId BIGINT NULL,
        DefaultBinId BIGINT NULL,
        LeadTimeDays INT NOT NULL,
        ReorderPolicy NVARCHAR(24) NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Items_CompanyId_ItemCode' AND object_id = OBJECT_ID(N'[master].[Items]'))
    CREATE UNIQUE INDEX UX_Items_CompanyId_ItemCode ON [master].[Items](CompanyId, ItemCode);

IF OBJECT_ID(N'[master].[ItemVariants]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemVariants]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        VariantCode NVARCHAR(64) NOT NULL,
        VariantName NVARCHAR(160) NOT NULL,
        VariantKey NVARCHAR(256) NOT NULL,
        VariantAttributeSummary NVARCHAR(256) NULL,
        VariantAttributeMapJson NVARCHAR(MAX) NOT NULL,
        OverrideMeasurementProfileId BIGINT NULL,
        OverrideStockUomId BIGINT NULL,
        OverrideWeightPerUnit DECIMAL(18,6) NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ItemVariants_CompanyId_VariantCode' AND object_id = OBJECT_ID(N'[master].[ItemVariants]'))
    CREATE UNIQUE INDEX UX_ItemVariants_CompanyId_VariantCode ON [master].[ItemVariants](CompanyId, VariantCode);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ItemVariants_ItemId_VariantKey' AND object_id = OBJECT_ID(N'[master].[ItemVariants]'))
    CREATE UNIQUE INDEX UX_ItemVariants_ItemId_VariantKey ON [master].[ItemVariants](ItemId, VariantKey);

IF OBJECT_ID(N'[master].[ItemUoms]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemUoms]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        UomRole NVARCHAR(24) NOT NULL,
        UomId BIGINT NOT NULL,
        BaseToThisNumerator DECIMAL(18,6) NOT NULL,
        BaseToThisDenominator DECIMAL(18,6) NOT NULL,
        MeasurementFormulaId BIGINT NULL,
        IsDefault BIT NOT NULL,
        IsCatchWeightActualUom BIT NOT NULL,
        MinOrderQty DECIMAL(18,6) NULL,
        RoundingScale INT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ItemUoms_ItemId_ItemVariantId_UomRole_UomId' AND object_id = OBJECT_ID(N'[master].[ItemUoms]'))
    CREATE UNIQUE INDEX UX_ItemUoms_ItemId_ItemVariantId_UomRole_UomId ON [master].[ItemUoms](ItemId, ItemVariantId, UomRole, UomId);

IF OBJECT_ID(N'[master].[ItemBarcodes]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[ItemBarcodes]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemVariantId BIGINT NULL,
        UomId BIGINT NULL,
        BarcodeValue NVARCHAR(128) NOT NULL,
        BarcodeType NVARCHAR(24) NOT NULL,
        ScanPurpose NVARCHAR(24) NOT NULL,
        PreferenceRank INT NOT NULL,
        IsPrimary BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ItemBarcodes_BarcodeValue' AND object_id = OBJECT_ID(N'[master].[ItemBarcodes]'))
    CREATE UNIQUE INDEX UX_ItemBarcodes_BarcodeValue ON [master].[ItemBarcodes](BarcodeValue);

IF OBJECT_ID(N'[master].[Customers]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[Customers]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        CustomerCode NVARCHAR(32) NOT NULL,
        CustomerName NVARCHAR(160) NOT NULL,
        ShortName NVARCHAR(80) NULL,
        CustomerType NVARCHAR(32) NOT NULL,
        DefaultBranchId BIGINT NULL,
        DefaultLanguageId BIGINT NULL,
        TaxRegistrationNo NVARCHAR(64) NULL,
        PaymentTermsCode NVARCHAR(32) NULL,
        CreditDays INT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Customers_CompanyId_CustomerCode' AND object_id = OBJECT_ID(N'[master].[Customers]'))
    CREATE UNIQUE INDEX UX_Customers_CompanyId_CustomerCode ON [master].[Customers](CompanyId, CustomerCode);

IF OBJECT_ID(N'[master].[CustomerAddresses]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[CustomerAddresses]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        CustomerId BIGINT NOT NULL,
        AddressCode NVARCHAR(32) NOT NULL,
        AddressType NVARCHAR(24) NOT NULL,
        AddressLine1 NVARCHAR(160) NOT NULL,
        AddressLine2 NVARCHAR(160) NULL,
        City NVARCHAR(64) NOT NULL,
        StateOrProvince NVARCHAR(64) NOT NULL,
        PostalCode NVARCHAR(24) NOT NULL,
        CountryCode NVARCHAR(8) NOT NULL,
        ContactName NVARCHAR(128) NULL,
        ContactEmail NVARCHAR(128) NULL,
        ContactPhone NVARCHAR(32) NULL,
        IsDefaultBilling BIT NOT NULL,
        IsDefaultShipping BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CustomerAddresses_CustomerId_AddressCode' AND object_id = OBJECT_ID(N'[master].[CustomerAddresses]'))
    CREATE UNIQUE INDEX UX_CustomerAddresses_CustomerId_AddressCode ON [master].[CustomerAddresses](CustomerId, AddressCode);

IF OBJECT_ID(N'[master].[Suppliers]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[Suppliers]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        SupplierCode NVARCHAR(32) NOT NULL,
        SupplierName NVARCHAR(160) NOT NULL,
        SupplierType NVARCHAR(32) NOT NULL,
        SupportsSubcontracting BIT NOT NULL,
        DefaultBranchId BIGINT NULL,
        DefaultLanguageId BIGINT NULL,
        TaxRegistrationNo NVARCHAR(64) NULL,
        PaymentTermsCode NVARCHAR(32) NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Suppliers_CompanyId_SupplierCode' AND object_id = OBJECT_ID(N'[master].[Suppliers]'))
    CREATE UNIQUE INDEX UX_Suppliers_CompanyId_SupplierCode ON [master].[Suppliers](CompanyId, SupplierCode);

IF OBJECT_ID(N'[master].[SupplierAddresses]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[SupplierAddresses]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        SupplierId BIGINT NOT NULL,
        AddressCode NVARCHAR(32) NOT NULL,
        AddressType NVARCHAR(24) NOT NULL,
        AddressLine1 NVARCHAR(160) NOT NULL,
        City NVARCHAR(64) NOT NULL,
        StateOrProvince NVARCHAR(64) NOT NULL,
        PostalCode NVARCHAR(24) NOT NULL,
        CountryCode NVARCHAR(8) NOT NULL,
        ContactName NVARCHAR(128) NULL,
        ContactEmail NVARCHAR(128) NULL,
        ContactPhone NVARCHAR(32) NULL,
        IsDefaultOrderAddress BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SupplierAddresses_SupplierId_AddressCode' AND object_id = OBJECT_ID(N'[master].[SupplierAddresses]'))
    CREATE UNIQUE INDEX UX_SupplierAddresses_SupplierId_AddressCode ON [master].[SupplierAddresses](SupplierId, AddressCode);

IF OBJECT_ID(N'[master].[SupplierLeadTimes]', N'U') IS NULL
BEGIN
    CREATE TABLE [master].[SupplierLeadTimes]
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        SupplierId BIGINT NOT NULL,
        ItemId BIGINT NULL,
        ItemGroupId BIGINT NULL,
        LeadTimeDays INT NOT NULL,
        MinOrderQty DECIMAL(18,6) NULL,
        OrderMultipleQty DECIMAL(18,6) NULL,
        IsSubcontractLeadTime BIT NOT NULL,
        PriorityRank INT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SupplierLeadTimes_SupplierId_BranchId_ItemId_ItemGroupId' AND object_id = OBJECT_ID(N'[master].[SupplierLeadTimes]'))
    CREATE UNIQUE INDEX UX_SupplierLeadTimes_SupplierId_BranchId_ItemId_ItemGroupId ON [master].[SupplierLeadTimes](SupplierId, BranchId, ItemId, ItemGroupId);

IF OBJECT_ID(N'resource.Operations', N'U') IS NULL
BEGIN
    CREATE TABLE resource.Operations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        OperationCode NVARCHAR(32) NOT NULL,
        OperationName NVARCHAR(128) NOT NULL,
        OperationType NVARCHAR(24) NOT NULL,
        DefaultWorkCenterId BIGINT NULL,
        DefaultSetupMinutes DECIMAL(18,4) NOT NULL,
        DefaultRunMinutesPerUnit DECIMAL(18,4) NOT NULL,
        DefaultTeardownMinutes DECIMAL(18,4) NOT NULL,
        AllowsOverlap BIT NOT NULL,
        IsOutsideProcessing BIT NOT NULL,
        RequiresQcCheckpoint BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Operations_CompanyId_OperationCode' AND object_id = OBJECT_ID(N'resource.Operations'))
    CREATE UNIQUE INDEX UX_Operations_CompanyId_OperationCode ON resource.Operations(CompanyId, OperationCode);

IF OBJECT_ID(N'resource.WorkCenters', N'U') IS NULL
BEGIN
    CREATE TABLE resource.WorkCenters
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        DepartmentId BIGINT NULL,
        WorkCenterCode NVARCHAR(32) NOT NULL,
        WorkCenterName NVARCHAR(128) NOT NULL,
        CapacityUomId BIGINT NULL,
        DefaultShiftPatternCode NVARCHAR(32) NULL,
        ParallelCapacityUnits INT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_WorkCenters_CompanyId_WorkCenterCode' AND object_id = OBJECT_ID(N'resource.WorkCenters'))
    CREATE UNIQUE INDEX UX_WorkCenters_CompanyId_WorkCenterCode ON resource.WorkCenters(CompanyId, WorkCenterCode);

IF OBJECT_ID(N'resource.Machines', N'U') IS NULL
BEGIN
    CREATE TABLE resource.Machines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WorkCenterId BIGINT NOT NULL,
        MachineCode NVARCHAR(32) NOT NULL,
        MachineName NVARCHAR(128) NOT NULL,
        CapacityPerHour DECIMAL(18,4) NOT NULL,
        CurrentStatus NVARCHAR(24) NOT NULL,
        DefaultShiftId BIGINT NULL,
        IsUnderMaintenance BIT NOT NULL,
        IsSchedulingEnabled BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Machines_CompanyId_MachineCode' AND object_id = OBJECT_ID(N'resource.Machines'))
    CREATE UNIQUE INDEX UX_Machines_CompanyId_MachineCode ON resource.Machines(CompanyId, MachineCode);

IF OBJECT_ID(N'resource.Tools', N'U') IS NULL
BEGIN
    CREATE TABLE resource.Tools
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ToolCode NVARCHAR(32) NOT NULL,
        ToolName NVARCHAR(128) NOT NULL,
        ToolType NVARCHAR(24) NOT NULL,
        CompatibleMachineGroup NVARCHAR(64) NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Tools_CompanyId_ToolCode' AND object_id = OBJECT_ID(N'resource.Tools'))
    CREATE UNIQUE INDEX UX_Tools_CompanyId_ToolCode ON resource.Tools(CompanyId, ToolCode);

IF OBJECT_ID(N'resource.Routings', N'U') IS NULL
BEGIN
    CREATE TABLE resource.Routings
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        RoutingCode NVARCHAR(32) NOT NULL,
        RoutingName NVARCHAR(128) NOT NULL,
        OutputItemId BIGINT NULL,
        RevisionCode NVARCHAR(24) NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Routings_CompanyId_RoutingCode' AND object_id = OBJECT_ID(N'resource.Routings'))
    CREATE UNIQUE INDEX UX_Routings_CompanyId_RoutingCode ON resource.Routings(CompanyId, RoutingCode);

IF OBJECT_ID(N'resource.RoutingOperations', N'U') IS NULL
BEGIN
    CREATE TABLE resource.RoutingOperations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        RoutingId BIGINT NOT NULL,
        SequenceNo INT NOT NULL,
        OperationId BIGINT NOT NULL,
        WorkCenterId BIGINT NULL,
        ToolId BIGINT NULL,
        SetupMinutes DECIMAL(18,4) NOT NULL,
        RunMinutesPerUnit DECIMAL(18,4) NOT NULL,
        TeardownMinutes DECIMAL(18,4) NOT NULL,
        OverlapPercent DECIMAL(18,4) NULL,
        IsOutsideProcessing BIT NOT NULL,
        RequiresQcCheckpoint BIT NOT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_RoutingOperations_RoutingId_SequenceNo' AND object_id = OBJECT_ID(N'resource.RoutingOperations'))
    CREATE UNIQUE INDEX UX_RoutingOperations_RoutingId_SequenceNo ON resource.RoutingOperations(RoutingId, SequenceNo);

IF OBJECT_ID(N'engineering.Boms', N'U') IS NULL
BEGIN
    CREATE TABLE engineering.Boms
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        BomCode NVARCHAR(32) NOT NULL,
        BomName NVARCHAR(128) NOT NULL,
        CurrentReleasedRevisionId BIGINT NULL,
        Status NVARCHAR(16) NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Boms_CompanyId_BomCode' AND object_id = OBJECT_ID(N'engineering.Boms'))
    CREATE UNIQUE INDEX UX_Boms_CompanyId_BomCode ON engineering.Boms(CompanyId, BomCode);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Boms_CompanyId_ItemId' AND object_id = OBJECT_ID(N'engineering.Boms'))
    CREATE UNIQUE INDEX UX_Boms_CompanyId_ItemId ON engineering.Boms(CompanyId, ItemId);

IF OBJECT_ID(N'engineering.BomRevisions', N'U') IS NULL
BEGIN
    CREATE TABLE engineering.BomRevisions
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        BomId BIGINT NOT NULL,
        RevisionCode NVARCHAR(24) NOT NULL,
        EffectiveFrom DATE NULL,
        EffectiveTo DATE NULL,
        ApprovalStatus NVARCHAR(24) NOT NULL,
        RoutingId BIGINT NULL,
        ChangeSummary NVARCHAR(256) NULL,
        IsPhantomParentAllowed BIT NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_BomRevisions_BomId_RevisionCode' AND object_id = OBJECT_ID(N'engineering.BomRevisions'))
    CREATE UNIQUE INDEX UX_BomRevisions_BomId_RevisionCode ON engineering.BomRevisions(BomId, RevisionCode);

IF OBJECT_ID(N'engineering.BomLines', N'U') IS NULL
BEGIN
    CREATE TABLE engineering.BomLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        BomRevisionId BIGINT NOT NULL,
        SequenceNo INT NOT NULL,
        ComponentItemId BIGINT NOT NULL,
        QuantityPer DECIMAL(18,6) NOT NULL,
        IssueUomId BIGINT NOT NULL,
        ScrapPercent DECIMAL(18,4) NOT NULL,
        IssueMethod NVARCHAR(24) NOT NULL,
        IsPhantom BIT NOT NULL,
        AlternateItemId BIGINT NULL,
        EffectiveFrom DATE NULL,
        EffectiveTo DATE NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_BomLines_BomRevisionId_SequenceNo' AND object_id = OBJECT_ID(N'engineering.BomLines'))
    CREATE UNIQUE INDEX UX_BomLines_BomRevisionId_SequenceNo ON engineering.BomLines(BomRevisionId, SequenceNo);

IF OBJECT_ID(N'engineering.BomOperations', N'U') IS NULL
BEGIN
    CREATE TABLE engineering.BomOperations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        BomRevisionId BIGINT NOT NULL,
        SequenceNo INT NOT NULL,
        RoutingOperationId BIGINT NULL,
        OperationId BIGINT NULL,
        SetupMinutes DECIMAL(18,4) NOT NULL,
        RunMinutesPerUnit DECIMAL(18,4) NOT NULL,
        TeardownMinutes DECIMAL(18,4) NOT NULL,
        RequiresQcCheckpoint BIT NOT NULL,
        IsOptional BIT NOT NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_BomOperations_BomRevisionId_SequenceNo' AND object_id = OBJECT_ID(N'engineering.BomOperations'))
    CREATE UNIQUE INDEX UX_BomOperations_BomRevisionId_SequenceNo ON engineering.BomOperations(BomRevisionId, SequenceNo);

IF OBJECT_ID(N'engineering.AlternateItems', N'U') IS NULL
BEGIN
    CREATE TABLE engineering.AlternateItems
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        PrimaryItemId BIGINT NOT NULL,
        AlternateItemValueId BIGINT NOT NULL,
        ContextType NVARCHAR(24) NOT NULL,
        BomId BIGINT NULL,
        PriorityRank INT NOT NULL,
        EffectiveFrom DATE NULL,
        EffectiveTo DATE NULL,
        ApprovalStatus NVARCHAR(16) NOT NULL,
        ReasonCode NVARCHAR(64) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_AlternateItems_PrimaryItemId_AlternateItemValueId_ContextType_BomId' AND object_id = OBJECT_ID(N'engineering.AlternateItems'))
    CREATE UNIQUE INDEX UX_AlternateItems_PrimaryItemId_AlternateItemValueId_ContextType_BomId ON engineering.AlternateItems(PrimaryItemId, AlternateItemValueId, ContextType, BomId);

IF OBJECT_ID(N'engineering.EngineeringChanges', N'U') IS NULL
BEGIN
    CREATE TABLE engineering.EngineeringChanges
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CompanyId BIGINT NULL,
        EcoCode NVARCHAR(32) NOT NULL,
        EcoTitle NVARCHAR(160) NOT NULL,
        ChangeType NVARCHAR(24) NOT NULL,
        RequestedByUserId BIGINT NOT NULL,
        RequestedOn DATETIMEOFFSET(7) NOT NULL,
        EffectiveFrom DATE NULL,
        ApprovalStatus NVARCHAR(24) NOT NULL,
        ReasonCode NVARCHAR(64) NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_EngineeringChanges_CompanyId_EcoCode' AND object_id = OBJECT_ID(N'engineering.EngineeringChanges'))
    CREATE UNIQUE INDEX UX_EngineeringChanges_CompanyId_EcoCode ON engineering.EngineeringChanges(CompanyId, EcoCode);

IF OBJECT_ID(N'engineering.EngineeringChangeLines', N'U') IS NULL
BEGIN
    CREATE TABLE engineering.EngineeringChangeLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        EngineeringChangeId BIGINT NOT NULL,
        [LineNo] INT NOT NULL,
        ImpactType NVARCHAR(32) NOT NULL,
        TargetEntityId BIGINT NOT NULL,
        ActionType NVARCHAR(24) NOT NULL,
        FromValueSummary NVARCHAR(256) NULL,
        ToValueSummary NVARCHAR(256) NULL,
        EffectiveFrom DATE NULL,
        CreatedOn DATETIMEOFFSET(7) NOT NULL,
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET(7) NOT NULL,
        ModifiedByUserId BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_EngineeringChangeLines_EngineeringChangeId_LineNo' AND object_id = OBJECT_ID(N'engineering.EngineeringChangeLines'))
    CREATE UNIQUE INDEX UX_EngineeringChangeLines_EngineeringChangeId_LineNo ON engineering.EngineeringChangeLines(EngineeringChangeId, [LineNo]);
