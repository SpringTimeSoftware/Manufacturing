-- Pack 11: Service / Warranty / AMC completion foundation.
-- Additive only: no historical customer, dispatch, invoice, or inventory rows are mutated.

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'service')
BEGIN
    EXEC(N'CREATE SCHEMA [service]');
END;
GO

IF OBJECT_ID(N'service.InstalledAssets', N'U') IS NULL
BEGIN
    CREATE TABLE service.InstalledAssets
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Service_InstalledAssets PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        AssetNo NVARCHAR(48) NOT NULL,
        CustomerId BIGINT NOT NULL,
        CustomerSiteId BIGINT NULL,
        CustomerContactId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemRevisionId BIGINT NULL,
        SerialId BIGINT NULL,
        SerialNo NVARCHAR(80) NULL,
        LotId BIGINT NULL,
        PcidId BIGINT NULL,
        SourceSalesOrderId BIGINT NULL,
        SourceSalesOrderLineId BIGINT NULL,
        SourceDispatchId BIGINT NULL,
        SourceDispatchLineId BIGINT NULL,
        SourceInvoiceId BIGINT NULL,
        SourceDocumentType NVARCHAR(40) NULL,
        SourceDocumentNo NVARCHAR(80) NULL,
        SourceDocumentRevisionNo INT NULL,
        InstallationDate DATE NOT NULL,
        CommissioningDate DATE NULL,
        WarrantyStartDate DATE NULL,
        WarrantyEndDate DATE NULL,
        ServiceContractId BIGINT NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_InstalledAssets_Status DEFAULT N'Installed',
        LocationSnapshot NVARCHAR(1000) NULL,
        Remarks NVARCHAR(1000) NULL,
        LegacySourceIncomplete BIT NOT NULL CONSTRAINT DF_Service_InstalledAssets_LegacySourceIncomplete DEFAULT 0,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_InstalledAssets_CreatedOn DEFAULT SYSDATETIMEOFFSET(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_InstalledAssets_ModifiedOn DEFAULT SYSDATETIMEOFFSET(),
        ModifiedByUserId BIGINT NULL
    );

    CREATE UNIQUE INDEX UX_Service_InstalledAssets_Company_AssetNo ON service.InstalledAssets(CompanyId, AssetNo);
    CREATE INDEX IX_Service_InstalledAssets_Customer_Item_Serial ON service.InstalledAssets(CustomerId, ItemId, SerialNo);
    CREATE INDEX IX_Service_InstalledAssets_SourceDispatch ON service.InstalledAssets(SourceDispatchId);
    CREATE INDEX IX_Service_InstalledAssets_SourceInvoice ON service.InstalledAssets(SourceInvoiceId);
END;
GO

IF OBJECT_ID(N'service.WarrantyPolicies', N'U') IS NULL
BEGIN
    CREATE TABLE service.WarrantyPolicies
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Service_WarrantyPolicies PRIMARY KEY,
        CompanyId BIGINT NULL,
        PolicyCode NVARCHAR(48) NOT NULL,
        PolicyName NVARCHAR(160) NOT NULL,
        ItemId BIGINT NULL,
        ItemGroupId BIGINT NULL,
        CustomerGroupId BIGINT NULL,
        DurationDays INT NOT NULL,
        StartTrigger NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_WarrantyPolicies_StartTrigger DEFAULT N'InstallationDate',
        CoversParts BIT NOT NULL CONSTRAINT DF_Service_WarrantyPolicies_CoversParts DEFAULT 1,
        CoversLabor BIT NOT NULL CONSTRAINT DF_Service_WarrantyPolicies_CoversLabor DEFAULT 1,
        CoversOnsite BIT NOT NULL CONSTRAINT DF_Service_WarrantyPolicies_CoversOnsite DEFAULT 0,
        CoversReplacement BIT NOT NULL CONSTRAINT DF_Service_WarrantyPolicies_CoversReplacement DEFAULT 0,
        Exclusions NVARCHAR(2000) NULL,
        ClaimLimitAmount DECIMAL(18,4) NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_WarrantyPolicies_Status DEFAULT N'Draft',
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_WarrantyPolicies_CreatedOn DEFAULT SYSDATETIMEOFFSET(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_WarrantyPolicies_ModifiedOn DEFAULT SYSDATETIMEOFFSET(),
        ModifiedByUserId BIGINT NULL
    );

    CREATE UNIQUE INDEX UX_Service_WarrantyPolicies_Company_Code ON service.WarrantyPolicies(CompanyId, PolicyCode);
    CREATE INDEX IX_Service_WarrantyPolicies_Applicability ON service.WarrantyPolicies(ItemId, ItemGroupId, CustomerGroupId, Status);
END;
GO

IF OBJECT_ID(N'service.ServiceContracts', N'U') IS NULL
BEGIN
    CREATE TABLE service.ServiceContracts
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Service_ServiceContracts PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ContractNo NVARCHAR(48) NOT NULL,
        CustomerId BIGINT NOT NULL,
        InstalledAssetId BIGINT NULL,
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        RenewalDate DATE NULL,
        CoverageSummary NVARCHAR(2000) NOT NULL,
        VisitFrequencyDays INT NULL,
        PreventiveScheduleJson NVARCHAR(4000) NULL,
        SlaResponseHours INT NULL,
        BillingTermsId BIGINT NULL,
        ContractValueAmount DECIMAL(18,4) NULL,
        TaxCodeId BIGINT NULL,
        TaxRateSnapshot DECIMAL(9,4) NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_ServiceContracts_Status DEFAULT N'Draft',
        VersionNo INT NOT NULL CONSTRAINT DF_Service_ServiceContracts_VersionNo DEFAULT 1,
        PriorContractId BIGINT NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceContracts_CreatedOn DEFAULT SYSDATETIMEOFFSET(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceContracts_ModifiedOn DEFAULT SYSDATETIMEOFFSET(),
        ModifiedByUserId BIGINT NULL
    );

    CREATE UNIQUE INDEX UX_Service_ServiceContracts_Company_No ON service.ServiceContracts(CompanyId, ContractNo);
    CREATE INDEX IX_Service_ServiceContracts_CustomerAssetStatus ON service.ServiceContracts(CustomerId, InstalledAssetId, Status);
END;
GO

IF OBJECT_ID(N'service.ServiceTickets', N'U') IS NULL
BEGIN
    CREATE TABLE service.ServiceTickets
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Service_ServiceTickets PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        TicketNo NVARCHAR(48) NOT NULL,
        CustomerId BIGINT NOT NULL,
        ContactId BIGINT NULL,
        InstalledAssetId BIGINT NULL,
        ItemId BIGINT NULL,
        SerialNo NVARCHAR(80) NULL,
        IssueCategory NVARCHAR(80) NOT NULL,
        IssueDescription NVARCHAR(2000) NOT NULL,
        Priority NVARCHAR(24) NOT NULL CONSTRAINT DF_Service_ServiceTickets_Priority DEFAULT N'Medium',
        Severity NVARCHAR(24) NOT NULL CONSTRAINT DF_Service_ServiceTickets_Severity DEFAULT N'Normal',
        Channel NVARCHAR(24) NOT NULL CONSTRAINT DF_Service_ServiceTickets_Channel DEFAULT N'Internal',
        SourceIntegrationMessageId BIGINT NULL,
        EntitlementType NVARCHAR(24) NOT NULL CONSTRAINT DF_Service_ServiceTickets_EntitlementType DEFAULT N'Unknown',
        EntitlementSource NVARCHAR(80) NULL,
        EntitlementPolicyId BIGINT NULL,
        EntitlementContractId BIGINT NULL,
        EntitlementSnapshotJson NVARCHAR(4000) NULL,
        EntitlementCheckedOn DATE NULL,
        AssignedOwnerUserId BIGINT NULL,
        AssignedTeamId BIGINT NULL,
        TargetResponseOn DATETIMEOFFSET NULL,
        TargetResolutionOn DATETIMEOFFSET NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_ServiceTickets_Status DEFAULT N'Registered',
        InternalRemarks NVARCHAR(1000) NULL,
        CustomerFacingRemarks NVARCHAR(1000) NULL,
        SourceSalesOrderId BIGINT NULL,
        SourceDispatchId BIGINT NULL,
        SourceInvoiceId BIGINT NULL,
        AssetSnapshotJson NVARCHAR(4000) NULL,
        ReopenReason NVARCHAR(1000) NULL,
        ClosedOn DATETIMEOFFSET NULL,
        ClosedByUserId BIGINT NULL,
        ClosureReason NVARCHAR(1000) NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceTickets_CreatedOn DEFAULT SYSDATETIMEOFFSET(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceTickets_ModifiedOn DEFAULT SYSDATETIMEOFFSET(),
        ModifiedByUserId BIGINT NULL
    );

    CREATE UNIQUE INDEX UX_Service_ServiceTickets_Company_No ON service.ServiceTickets(CompanyId, TicketNo);
    CREATE INDEX IX_Service_ServiceTickets_Customer_Status ON service.ServiceTickets(CustomerId, Status);
    CREATE INDEX IX_Service_ServiceTickets_InstalledAsset ON service.ServiceTickets(InstalledAssetId);
END;
GO

IF OBJECT_ID(N'service.ServiceVisits', N'U') IS NULL
BEGIN
    CREATE TABLE service.ServiceVisits
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Service_ServiceVisits PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ServiceTicketId BIGINT NOT NULL,
        TechnicianUserId BIGINT NULL,
        TeamId BIGINT NULL,
        ScheduledStartOn DATETIMEOFFSET NULL,
        ScheduledEndOn DATETIMEOFFSET NULL,
        VisitAddressSnapshot NVARCHAR(1000) NULL,
        TravelStartedOn DATETIMEOFFSET NULL,
        WorkStartedOn DATETIMEOFFSET NULL,
        WorkEndedOn DATETIMEOFFSET NULL,
        WorkPerformed NVARCHAR(2000) NULL,
        Diagnosis NVARCHAR(2000) NULL,
        Resolution NVARCHAR(2000) NULL,
        CustomerSignoffName NVARCHAR(160) NULL,
        CustomerSignoffOn DATETIMEOFFSET NULL,
        EvidenceAttachmentId BIGINT NULL,
        PhotoEvidenceId BIGINT NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_ServiceVisits_Status DEFAULT N'Planned',
        Remarks NVARCHAR(1000) NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceVisits_CreatedOn DEFAULT SYSDATETIMEOFFSET(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceVisits_ModifiedOn DEFAULT SYSDATETIMEOFFSET(),
        ModifiedByUserId BIGINT NULL
    );

    CREATE INDEX IX_Service_ServiceVisits_TicketStatus ON service.ServiceVisits(CompanyId, ServiceTicketId, Status);
END;
GO

IF OBJECT_ID(N'service.ServiceSpareMovements', N'U') IS NULL
BEGIN
    CREATE TABLE service.ServiceSpareMovements
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Service_ServiceSpareMovements PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        WarehouseId BIGINT NULL,
        MovementNo NVARCHAR(48) NOT NULL,
        MovementType NVARCHAR(24) NOT NULL,
        ServiceTicketId BIGINT NOT NULL,
        ServiceVisitId BIGINT NULL,
        ItemId BIGINT NOT NULL,
        ItemRevisionId BIGINT NULL,
        BinId BIGINT NULL,
        LotId BIGINT NULL,
        SerialId BIGINT NULL,
        SerialNo NVARCHAR(80) NULL,
        PcidId BIGINT NULL,
        Quantity DECIMAL(18,6) NOT NULL,
        InventoryState NVARCHAR(24) NOT NULL CONSTRAINT DF_Service_ServiceSpareMovements_InventoryState DEFAULT N'Available',
        StockTransactionId BIGINT NULL,
        ReplacementInstalledAssetId BIGINT NULL,
        DefectiveInstalledAssetId BIGINT NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_ServiceSpareMovements_Status DEFAULT N'Draft',
        ReasonCode NVARCHAR(64) NULL,
        Remarks NVARCHAR(1000) NULL,
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceSpareMovements_CreatedOn DEFAULT SYSDATETIMEOFFSET(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceSpareMovements_ModifiedOn DEFAULT SYSDATETIMEOFFSET(),
        ModifiedByUserId BIGINT NULL
    );

    CREATE UNIQUE INDEX UX_Service_ServiceSpareMovements_Company_No ON service.ServiceSpareMovements(CompanyId, MovementNo);
    CREATE INDEX IX_Service_ServiceSpareMovements_TicketType ON service.ServiceSpareMovements(ServiceTicketId, MovementType);
    CREATE INDEX IX_Service_ServiceSpareMovements_StockTxn ON service.ServiceSpareMovements(StockTransactionId);
END;
GO

IF OBJECT_ID(N'service.WarrantyClaims', N'U') IS NULL
BEGIN
    CREATE TABLE service.WarrantyClaims
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Service_WarrantyClaims PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ClaimNo NVARCHAR(48) NOT NULL,
        ServiceTicketId BIGINT NOT NULL,
        InstalledAssetId BIGINT NULL,
        CustomerId BIGINT NOT NULL,
        ItemId BIGINT NULL,
        SerialNo NVARCHAR(80) NULL,
        ClaimType NVARCHAR(32) NOT NULL,
        EntitlementType NVARCHAR(24) NOT NULL,
        EntitlementSnapshotJson NVARCHAR(4000) NULL,
        ApprovalStatus NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_WarrantyClaims_ApprovalStatus DEFAULT N'Draft',
        Disposition NVARCHAR(1000) NULL,
        ReplacementAssetId BIGINT NULL,
        CostDecision NVARCHAR(128) NULL,
        RejectionReason NVARCHAR(1000) NULL,
        OverrideReason NVARCHAR(1000) NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_WarrantyClaims_Status DEFAULT N'Draft',
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_WarrantyClaims_CreatedOn DEFAULT SYSDATETIMEOFFSET(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_WarrantyClaims_ModifiedOn DEFAULT SYSDATETIMEOFFSET(),
        ModifiedByUserId BIGINT NULL
    );

    CREATE UNIQUE INDEX UX_Service_WarrantyClaims_Company_No ON service.WarrantyClaims(CompanyId, ClaimNo);
    CREATE INDEX IX_Service_WarrantyClaims_TicketStatus ON service.WarrantyClaims(ServiceTicketId, ApprovalStatus);
END;
GO

IF OBJECT_ID(N'service.ServiceCharges', N'U') IS NULL
BEGIN
    CREATE TABLE service.ServiceCharges
    (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Service_ServiceCharges PRIMARY KEY,
        CompanyId BIGINT NULL,
        BranchId BIGINT NULL,
        ChargeNo NVARCHAR(48) NOT NULL,
        ServiceTicketId BIGINT NOT NULL,
        CustomerId BIGINT NOT NULL,
        CurrencyId BIGINT NULL,
        LaborAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Service_ServiceCharges_LaborAmount DEFAULT 0,
        PartsAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Service_ServiceCharges_PartsAmount DEFAULT 0,
        TravelAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Service_ServiceCharges_TravelAmount DEFAULT 0,
        OtherAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Service_ServiceCharges_OtherAmount DEFAULT 0,
        DiscountAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Service_ServiceCharges_DiscountAmount DEFAULT 0,
        TaxCodeId BIGINT NULL,
        TaxRateSnapshot DECIMAL(9,4) NULL,
        TaxAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Service_ServiceCharges_TaxAmount DEFAULT 0,
        TotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Service_ServiceCharges_TotalAmount DEFAULT 0,
        BillableStatus NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_ServiceCharges_BillableStatus DEFAULT N'Billable',
        NonBillableReason NVARCHAR(1000) NULL,
        ArInvoiceId BIGINT NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_Service_ServiceCharges_Status DEFAULT N'Draft',
        SnapshotJson NVARCHAR(4000) NOT NULL CONSTRAINT DF_Service_ServiceCharges_SnapshotJson DEFAULT N'{}',
        CreatedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceCharges_CreatedOn DEFAULT SYSDATETIMEOFFSET(),
        CreatedByUserId BIGINT NULL,
        ModifiedOn DATETIMEOFFSET NOT NULL CONSTRAINT DF_Service_ServiceCharges_ModifiedOn DEFAULT SYSDATETIMEOFFSET(),
        ModifiedByUserId BIGINT NULL
    );

    CREATE UNIQUE INDEX UX_Service_ServiceCharges_Company_No ON service.ServiceCharges(CompanyId, ChargeNo);
    CREATE INDEX IX_Service_ServiceCharges_TicketStatus ON service.ServiceCharges(ServiceTicketId, Status);
END;
GO
