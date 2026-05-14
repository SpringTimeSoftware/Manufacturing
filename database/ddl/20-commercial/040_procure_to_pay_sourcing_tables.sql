SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF SCHEMA_ID(N'procurement') IS NULL
    EXEC(N'CREATE SCHEMA procurement');
GO

IF OBJECT_ID(N'procurement.RequestForQuotations', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.RequestForQuotations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_RequestForQuotations PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        RfqNo NVARCHAR(48) NOT NULL,
        PurchaseRequisitionId BIGINT NULL,
        IssueDate DATE NOT NULL,
        ResponseDueDate DATE NOT NULL,
        CurrencyCode NVARCHAR(16) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_RequestForQuotations_CreatedOn DEFAULT SYSUTCDATETIME(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT UX_RequestForQuotations_Company_RfqNo UNIQUE (CompanyId, RfqNo)
    );
END;
GO

IF OBJECT_ID(N'procurement.RequestForQuotationLines', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.RequestForQuotationLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_RequestForQuotationLines PRIMARY KEY,
        RfqId BIGINT NOT NULL,
        LineNo INT NOT NULL,
        ItemId BIGINT NOT NULL,
        OrderUomId BIGINT NOT NULL,
        RequestedQuantity DECIMAL(18,6) NOT NULL,
        NeedByDate DATE NOT NULL,
        PurchaseRequisitionLineId BIGINT NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_RequestForQuotationLines_CreatedOn DEFAULT SYSUTCDATETIME(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT UX_RequestForQuotationLines_Rfq_LineNo UNIQUE (RfqId, LineNo)
    );
END;
GO

IF OBJECT_ID(N'procurement.RequestForQuotationSuppliers', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.RequestForQuotationSuppliers
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_RequestForQuotationSuppliers PRIMARY KEY,
        RfqId BIGINT NOT NULL,
        SupplierId BIGINT NOT NULL,
        InvitationStatus NVARCHAR(32) NOT NULL,
        ResponseDueDate DATE NOT NULL,
        Remarks NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_RequestForQuotationSuppliers_CreatedOn DEFAULT SYSUTCDATETIME(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT UX_RequestForQuotationSuppliers_Rfq_Supplier UNIQUE (RfqId, SupplierId)
    );
END;
GO

IF OBJECT_ID(N'procurement.SupplierQuotations', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.SupplierQuotations
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SupplierQuotations PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NOT NULL,
        SupplierQuotationNo NVARCHAR(64) NOT NULL,
        RfqId BIGINT NOT NULL,
        SupplierId BIGINT NOT NULL,
        QuotationDate DATE NOT NULL,
        ValidUntil DATE NOT NULL,
        CurrencyCode NVARCHAR(16) NOT NULL,
        SubtotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SupplierQuotations_Subtotal DEFAULT 0,
        TaxAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SupplierQuotations_Tax DEFAULT 0,
        TotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SupplierQuotations_Total DEFAULT 0,
        SelectionStatus NVARCHAR(32) NOT NULL,
        SelectionReason NVARCHAR(512) NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_SupplierQuotations_CreatedOn DEFAULT SYSUTCDATETIME(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT UX_SupplierQuotations_Company_No UNIQUE (CompanyId, SupplierQuotationNo)
    );
END;
GO

IF OBJECT_ID(N'procurement.SupplierQuotationLines', N'U') IS NULL
BEGIN
    CREATE TABLE procurement.SupplierQuotationLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SupplierQuotationLines PRIMARY KEY,
        SupplierQuotationId BIGINT NOT NULL,
        LineNo INT NOT NULL,
        RfqLineId BIGINT NOT NULL,
        ItemId BIGINT NOT NULL,
        OrderUomId BIGINT NOT NULL,
        OfferedQuantity DECIMAL(18,6) NOT NULL,
        UnitPrice DECIMAL(18,4) NOT NULL,
        DiscountPercent DECIMAL(9,4) NOT NULL,
        DiscountAmount DECIMAL(18,4) NOT NULL,
        TaxPercent DECIMAL(9,4) NOT NULL,
        TaxAmount DECIMAL(18,4) NOT NULL,
        LineAmount DECIMAL(18,4) NOT NULL,
        LeadTimeDays INT NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_SupplierQuotationLines_CreatedOn DEFAULT SYSUTCDATETIME(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL,
        CONSTRAINT UX_SupplierQuotationLines_Quote_LineNo UNIQUE (SupplierQuotationId, LineNo)
    );
END;
GO
