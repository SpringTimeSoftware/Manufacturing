IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'finance')
BEGIN
    EXEC(N'CREATE SCHEMA finance');
END;

IF OBJECT_ID(N'finance.ChartOfAccounts', N'U') IS NULL
BEGIN
    CREATE TABLE finance.ChartOfAccounts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ChartOfAccounts PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        AccountCode NVARCHAR(64) NOT NULL,
        AccountName NVARCHAR(160) NOT NULL,
        AccountClass NVARCHAR(32) NOT NULL,
        ParentAccountId BIGINT NULL,
        NormalBalance NVARCHAR(8) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_ChartOfAccounts_IsActive DEFAULT (1),
        IsPostingAllowed BIT NOT NULL CONSTRAINT DF_ChartOfAccounts_IsPostingAllowed DEFAULT (1),
        Status NVARCHAR(24) NOT NULL CONSTRAINT DF_ChartOfAccounts_Status DEFAULT (N'Active'),
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ChartOfAccounts_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ChartOfAccounts_CompanyId_AccountCode' AND object_id = OBJECT_ID(N'finance.ChartOfAccounts'))
    CREATE UNIQUE INDEX UX_ChartOfAccounts_CompanyId_AccountCode ON finance.ChartOfAccounts(CompanyId, AccountCode);

IF OBJECT_ID(N'finance.FiscalPeriods', N'U') IS NULL
BEGIN
    CREATE TABLE finance.FiscalPeriods
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_FiscalPeriods PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        FiscalYear INT NOT NULL,
        PeriodNo INT NOT NULL,
        PeriodName NVARCHAR(64) NOT NULL,
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        ApLocked BIT NOT NULL CONSTRAINT DF_FiscalPeriods_ApLocked DEFAULT (0),
        ArLocked BIT NOT NULL CONSTRAINT DF_FiscalPeriods_ArLocked DEFAULT (0),
        InventoryLocked BIT NOT NULL CONSTRAINT DF_FiscalPeriods_InventoryLocked DEFAULT (0),
        ProductionLocked BIT NOT NULL CONSTRAINT DF_FiscalPeriods_ProductionLocked DEFAULT (0),
        GlLocked BIT NOT NULL CONSTRAINT DF_FiscalPeriods_GlLocked DEFAULT (0),
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_FiscalPeriods_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_FiscalPeriods_CompanyId_Year_Period' AND object_id = OBJECT_ID(N'finance.FiscalPeriods'))
    CREATE UNIQUE INDEX UX_FiscalPeriods_CompanyId_Year_Period ON finance.FiscalPeriods(CompanyId, FiscalYear, PeriodNo);

IF OBJECT_ID(N'finance.PostingProfiles', N'U') IS NULL
BEGIN
    CREATE TABLE finance.PostingProfiles
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PostingProfiles PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        ProfileCode NVARCHAR(64) NOT NULL,
        PostingKey NVARCHAR(64) NOT NULL,
        DebitAccountId BIGINT NOT NULL,
        CreditAccountId BIGINT NOT NULL,
        MappingSource NVARCHAR(128) NOT NULL,
        EffectiveFrom DATE NOT NULL,
        EffectiveTo DATE NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_PostingProfiles_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PostingProfiles_CompanyId_PostingKey_ProfileCode' AND object_id = OBJECT_ID(N'finance.PostingProfiles'))
    CREATE UNIQUE INDEX UX_PostingProfiles_CompanyId_PostingKey_ProfileCode ON finance.PostingProfiles(CompanyId, PostingKey, ProfileCode);

IF OBJECT_ID(N'finance.GeneralLedgerJournals', N'U') IS NULL
BEGIN
    CREATE TABLE finance.GeneralLedgerJournals
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_GeneralLedgerJournals PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NULL,
        JournalNo NVARCHAR(64) NOT NULL,
        PostingDate DATE NOT NULL,
        DocumentDate DATE NOT NULL,
        SourceModule NVARCHAR(32) NOT NULL,
        SourceDocumentType NVARCHAR(64) NOT NULL,
        SourceDocumentId BIGINT NULL,
        SourceDocumentNo NVARCHAR(80) NULL,
        CurrencyCode NVARCHAR(16) NOT NULL,
        ExchangeRateSnapshot DECIMAL(18,8) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        Remarks NVARCHAR(512) NULL,
        PostedAt DATETIMEOFFSET NULL,
        PostedByUserId BIGINT NULL,
        ReversalJournalId BIGINT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_GeneralLedgerJournals_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_GeneralLedgerJournals_CompanyId_JournalNo' AND object_id = OBJECT_ID(N'finance.GeneralLedgerJournals'))
    CREATE UNIQUE INDEX UX_GeneralLedgerJournals_CompanyId_JournalNo ON finance.GeneralLedgerJournals(CompanyId, JournalNo);

IF OBJECT_ID(N'finance.GeneralLedgerJournalLines', N'U') IS NULL
BEGIN
    CREATE TABLE finance.GeneralLedgerJournalLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_GeneralLedgerJournalLines PRIMARY KEY,
        JournalId BIGINT NOT NULL,
        LineNo INT NOT NULL,
        AccountId BIGINT NOT NULL,
        DebitAmount DECIMAL(18,4) NOT NULL,
        CreditAmount DECIMAL(18,4) NOT NULL,
        BranchId BIGINT NULL,
        Narration NVARCHAR(512) NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_GeneralLedgerJournalLines_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_GeneralLedgerJournalLines_JournalId_LineNo' AND object_id = OBJECT_ID(N'finance.GeneralLedgerJournalLines'))
    CREATE UNIQUE INDEX UX_GeneralLedgerJournalLines_JournalId_LineNo ON finance.GeneralLedgerJournalLines(JournalId, LineNo);

IF OBJECT_ID(N'finance.AccountsReceivableInvoices', N'U') IS NULL
BEGIN
    CREATE TABLE finance.AccountsReceivableInvoices
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AccountsReceivableInvoices PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NULL,
        InvoiceNo NVARCHAR(64) NOT NULL,
        CustomerId BIGINT NOT NULL,
        SalesOrderId BIGINT NULL,
        ShipmentId BIGINT NULL,
        SourceDocumentNo NVARCHAR(80) NULL,
        InvoiceDate DATE NOT NULL,
        DueDate DATE NULL,
        CurrencyCode NVARCHAR(16) NOT NULL,
        ExchangeRateSnapshot DECIMAL(18,8) NOT NULL,
        SubtotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_Subtotal DEFAULT (0),
        DiscountTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_Discount DEFAULT (0),
        TaxableAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_Taxable DEFAULT (0),
        TaxTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_Tax DEFAULT (0),
        FreightAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_Freight DEFAULT (0),
        PackingAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_Packing DEFAULT (0),
        InsuranceAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_Insurance DEFAULT (0),
        OtherChargesAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_Other DEFAULT (0),
        AddLessAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_AddLess DEFAULT (0),
        RoundOffAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_RoundOff DEFAULT (0),
        GrandTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_ARInvoices_Grand DEFAULT (0),
        Status NVARCHAR(24) NOT NULL,
        ArStatus NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ARInvoices_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ARInvoices_CompanyId_InvoiceNo' AND object_id = OBJECT_ID(N'finance.AccountsReceivableInvoices'))
    CREATE UNIQUE INDEX UX_ARInvoices_CompanyId_InvoiceNo ON finance.AccountsReceivableInvoices(CompanyId, InvoiceNo);

IF OBJECT_ID(N'finance.AccountsReceivableInvoiceLines', N'U') IS NULL
BEGIN
    CREATE TABLE finance.AccountsReceivableInvoiceLines
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AccountsReceivableInvoiceLines PRIMARY KEY,
        ArInvoiceId BIGINT NOT NULL,
        LineNo INT NOT NULL,
        SalesOrderLineId BIGINT NULL,
        ShipmentLineId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemRevisionId BIGINT NULL,
        InvoiceQuantity DECIMAL(18,6) NOT NULL,
        UomId BIGINT NOT NULL,
        UnitPrice DECIMAL(18,4) NOT NULL,
        DiscountAmount DECIMAL(18,4) NOT NULL,
        TaxCodeId BIGINT NULL,
        TaxRateSnapshot DECIMAL(9,4) NOT NULL,
        TaxAmount DECIMAL(18,4) NOT NULL,
        LineSubtotal DECIMAL(18,4) NOT NULL,
        LineTaxableAmount DECIMAL(18,4) NOT NULL,
        LineTotalAmount DECIMAL(18,4) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ARInvoiceLines_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ARInvoiceLines_InvoiceId_LineNo' AND object_id = OBJECT_ID(N'finance.AccountsReceivableInvoiceLines'))
    CREATE UNIQUE INDEX UX_ARInvoiceLines_InvoiceId_LineNo ON finance.AccountsReceivableInvoiceLines(ArInvoiceId, LineNo);

IF OBJECT_ID(N'finance.AccountsReceivableLedgerEntries', N'U') IS NULL
BEGIN
    CREATE TABLE finance.AccountsReceivableLedgerEntries
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AccountsReceivableLedgerEntries PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NULL,
        EntryNo NVARCHAR(64) NOT NULL,
        ArInvoiceId BIGINT NOT NULL,
        CustomerId BIGINT NOT NULL,
        PostingDate DATE NOT NULL,
        DueDate DATE NOT NULL,
        ReceivableAmount DECIMAL(18,4) NOT NULL,
        ReceivedAmount DECIMAL(18,4) NOT NULL,
        BalanceAmount DECIMAL(18,4) NOT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_ARLedger_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ARLedger_CompanyId_EntryNo' AND object_id = OBJECT_ID(N'finance.AccountsReceivableLedgerEntries'))
    CREATE UNIQUE INDEX UX_ARLedger_CompanyId_EntryNo ON finance.AccountsReceivableLedgerEntries(CompanyId, EntryNo);

IF OBJECT_ID(N'finance.TaxLedgerEntries', N'U') IS NULL
BEGIN
    CREATE TABLE finance.TaxLedgerEntries
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TaxLedgerEntries PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NULL,
        TaxDirection NVARCHAR(16) NOT NULL,
        TaxCodeId BIGINT NULL,
        TaxRateSnapshot DECIMAL(9,4) NOT NULL,
        TaxableAmount DECIMAL(18,4) NOT NULL,
        TaxAmount DECIMAL(18,4) NOT NULL,
        SourceDocumentType NVARCHAR(64) NOT NULL,
        SourceDocumentId BIGINT NOT NULL,
        PostingDate DATE NOT NULL,
        FiscalPeriodId BIGINT NULL,
        Status NVARCHAR(24) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_TaxLedger_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_TaxLedger_Source' AND object_id = OBJECT_ID(N'finance.TaxLedgerEntries'))
    CREATE INDEX IX_TaxLedger_Source ON finance.TaxLedgerEntries(SourceDocumentType, SourceDocumentId);

IF OBJECT_ID(N'finance.InventoryValuationEntries', N'U') IS NULL
BEGIN
    CREATE TABLE finance.InventoryValuationEntries
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_InventoryValuationEntries PRIMARY KEY,
        CompanyId BIGINT NOT NULL,
        BranchId BIGINT NULL,
        StockTransactionId BIGINT NULL,
        SourceDocumentType NVARCHAR(64) NOT NULL,
        SourceDocumentId BIGINT NULL,
        SourceDocumentNo NVARCHAR(80) NULL,
        ItemId BIGINT NOT NULL,
        WarehouseId BIGINT NULL,
        BinId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        PcidId BIGINT NULL,
        ValuationDate DATE NOT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        UnitCost DECIMAL(18,4) NOT NULL,
        TotalCost DECIMAL(18,4) NOT NULL,
        ValuationMethod NVARCHAR(32) NOT NULL,
        Status NVARCHAR(32) NOT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_InventoryValuation_CreatedOn DEFAULT (SYSUTCDATETIME()),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NULL,
        ModifiedByUserId BIGINT NULL
    );
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_InventoryValuation_StockTransactionId' AND object_id = OBJECT_ID(N'finance.InventoryValuationEntries'))
    CREATE INDEX IX_InventoryValuation_StockTransactionId ON finance.InventoryValuationEntries(StockTransactionId);

IF COL_LENGTH('finance.AccountingPostings', 'DebitAccountId') IS NULL
    ALTER TABLE finance.AccountingPostings ADD DebitAccountId BIGINT NULL;
IF COL_LENGTH('finance.AccountingPostings', 'CreditAccountId') IS NULL
    ALTER TABLE finance.AccountingPostings ADD CreditAccountId BIGINT NULL;
IF COL_LENGTH('finance.AccountingPostings', 'PostingProfileId') IS NULL
    ALTER TABLE finance.AccountingPostings ADD PostingProfileId BIGINT NULL;
IF COL_LENGTH('finance.AccountingPostings', 'FiscalPeriodId') IS NULL
    ALTER TABLE finance.AccountingPostings ADD FiscalPeriodId BIGINT NULL;
IF COL_LENGTH('finance.AccountingPostings', 'JournalId') IS NULL
    ALTER TABLE finance.AccountingPostings ADD JournalId BIGINT NULL;
IF COL_LENGTH('finance.AccountingPostings', 'MappingSource') IS NULL
    ALTER TABLE finance.AccountingPostings ADD MappingSource NVARCHAR(128) NULL;

DECLARE @now DATETIMEOFFSET = SYSUTCDATETIME();

IF NOT EXISTS (SELECT 1 FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'1200-AR')
    INSERT INTO finance.ChartOfAccounts (CompanyId, AccountCode, AccountName, AccountClass, ParentAccountId, NormalBalance, IsActive, IsPostingAllowed, Status, CreatedOn)
    VALUES (1, N'1200-AR', N'Accounts Receivable', N'Asset', NULL, N'Debit', 1, 1, N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'1300-INVENTORY')
    INSERT INTO finance.ChartOfAccounts (CompanyId, AccountCode, AccountName, AccountClass, ParentAccountId, NormalBalance, IsActive, IsPostingAllowed, Status, CreatedOn)
    VALUES (1, N'1300-INVENTORY', N'Inventory Stock', N'Asset', NULL, N'Debit', 1, 1, N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'1350-GRIR')
    INSERT INTO finance.ChartOfAccounts (CompanyId, AccountCode, AccountName, AccountClass, ParentAccountId, NormalBalance, IsActive, IsPostingAllowed, Status, CreatedOn)
    VALUES (1, N'1350-GRIR', N'Goods Received Not Invoiced', N'Asset', NULL, N'Debit', 1, 1, N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'1450-INPUT-TAX')
    INSERT INTO finance.ChartOfAccounts (CompanyId, AccountCode, AccountName, AccountClass, ParentAccountId, NormalBalance, IsActive, IsPostingAllowed, Status, CreatedOn)
    VALUES (1, N'1450-INPUT-TAX', N'Input Tax Recoverable', N'Asset', NULL, N'Debit', 1, 1, N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'2100-AP')
    INSERT INTO finance.ChartOfAccounts (CompanyId, AccountCode, AccountName, AccountClass, ParentAccountId, NormalBalance, IsActive, IsPostingAllowed, Status, CreatedOn)
    VALUES (1, N'2100-AP', N'Accounts Payable', N'Liability', NULL, N'Credit', 1, 1, N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'2200-OUTPUT-TAX')
    INSERT INTO finance.ChartOfAccounts (CompanyId, AccountCode, AccountName, AccountClass, ParentAccountId, NormalBalance, IsActive, IsPostingAllowed, Status, CreatedOn)
    VALUES (1, N'2200-OUTPUT-TAX', N'Output Tax Payable', N'Liability', NULL, N'Credit', 1, 1, N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'4100-SALES')
    INSERT INTO finance.ChartOfAccounts (CompanyId, AccountCode, AccountName, AccountClass, ParentAccountId, NormalBalance, IsActive, IsPostingAllowed, Status, CreatedOn)
    VALUES (1, N'4100-SALES', N'Sales Revenue', N'Revenue', NULL, N'Credit', 1, 1, N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'5100-COGS')
    INSERT INTO finance.ChartOfAccounts (CompanyId, AccountCode, AccountName, AccountClass, ParentAccountId, NormalBalance, IsActive, IsPostingAllowed, Status, CreatedOn)
    VALUES (1, N'5100-COGS', N'Cost of Goods Sold', N'Expense', NULL, N'Debit', 1, 1, N'Active', @now);

IF NOT EXISTS (SELECT 1 FROM finance.FiscalPeriods WHERE CompanyId = 1 AND FiscalYear = 2026 AND PeriodNo = 5)
    INSERT INTO finance.FiscalPeriods (CompanyId, FiscalYear, PeriodNo, PeriodName, StartDate, EndDate, Status, CreatedOn)
    VALUES (1, 2026, 5, N'May 2026', '2026-05-01', '2026-05-31', N'Open', @now);

DECLARE @ar BIGINT = (SELECT Id FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'1200-AR');
DECLARE @grir BIGINT = (SELECT Id FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'1350-GRIR');
DECLARE @inputTax BIGINT = (SELECT Id FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'1450-INPUT-TAX');
DECLARE @ap BIGINT = (SELECT Id FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'2100-AP');
DECLARE @outputTax BIGINT = (SELECT Id FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'2200-OUTPUT-TAX');
DECLARE @sales BIGINT = (SELECT Id FROM finance.ChartOfAccounts WHERE CompanyId = 1 AND AccountCode = N'4100-SALES');

IF NOT EXISTS (SELECT 1 FROM finance.PostingProfiles WHERE CompanyId = 1 AND PostingKey = N'AP_INVOICE_INVENTORY')
    INSERT INTO finance.PostingProfiles (CompanyId, ProfileCode, PostingKey, DebitAccountId, CreditAccountId, MappingSource, EffectiveFrom, Status, CreatedOn)
    VALUES (1, N'COMPANY-DEFAULT', N'AP_INVOICE_INVENTORY', @grir, @ap, N'Company default AP inventory clearing profile', '2026-01-01', N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.PostingProfiles WHERE CompanyId = 1 AND PostingKey = N'AP_INVOICE_INPUT_TAX')
    INSERT INTO finance.PostingProfiles (CompanyId, ProfileCode, PostingKey, DebitAccountId, CreditAccountId, MappingSource, EffectiveFrom, Status, CreatedOn)
    VALUES (1, N'COMPANY-DEFAULT', N'AP_INVOICE_INPUT_TAX', @inputTax, @ap, N'Company default AP input tax profile', '2026-01-01', N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.PostingProfiles WHERE CompanyId = 1 AND PostingKey = N'AR_INVOICE_REVENUE')
    INSERT INTO finance.PostingProfiles (CompanyId, ProfileCode, PostingKey, DebitAccountId, CreditAccountId, MappingSource, EffectiveFrom, Status, CreatedOn)
    VALUES (1, N'COMPANY-DEFAULT', N'AR_INVOICE_REVENUE', @ar, @sales, N'Company default AR revenue profile', '2026-01-01', N'Active', @now);
IF NOT EXISTS (SELECT 1 FROM finance.PostingProfiles WHERE CompanyId = 1 AND PostingKey = N'AR_INVOICE_OUTPUT_TAX')
    INSERT INTO finance.PostingProfiles (CompanyId, ProfileCode, PostingKey, DebitAccountId, CreditAccountId, MappingSource, EffectiveFrom, Status, CreatedOn)
    VALUES (1, N'COMPANY-DEFAULT', N'AR_INVOICE_OUTPUT_TAX', @ar, @outputTax, N'Company default AR output tax profile', '2026-01-01', N'Active', @now);
