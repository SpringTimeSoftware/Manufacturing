using STS.Mfg.Domain.AI;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Domain.Integration;
using STS.Mfg.Domain.Commercial;
using STS.Mfg.Domain.Engineering;
using STS.Mfg.Domain.Dispatch;
using STS.Mfg.Domain.Finance;
using STS.Mfg.Domain.Inventory;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Measurements;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Domain.Platform.Attachments;
using STS.Mfg.Domain.Platform.Audit;
using STS.Mfg.Domain.Platform.Localization;
using STS.Mfg.Domain.Platform.Notifications;
using STS.Mfg.Domain.Production;
using STS.Mfg.Domain.Procurement;
using STS.Mfg.Domain.Quality;
using STS.Mfg.Domain.Reporting;
using STS.Mfg.Domain.Resources;
using STS.Mfg.Domain.SalesPlanning;

namespace STS.Mfg.Infrastructure.Persistence;

public sealed class MfgDbContext(DbContextOptions<MfgDbContext> options) : DbContext(options)
{
    public DbSet<AuditLogEntry> AuditLogs => Set<AuditLogEntry>();

    public DbSet<AttachmentRecord> Attachments => Set<AttachmentRecord>();

    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();

    public DbSet<NotificationOutboxMessage> Notifications => Set<NotificationOutboxMessage>();

    public DbSet<TranslationEntry> Translations => Set<TranslationEntry>();

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Shift> Shifts => Set<Shift>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Bin> Bins => Set<Bin>();

    public DbSet<UomClass> UomClasses => Set<UomClass>();
    public DbSet<Uom> Uoms => Set<Uom>();
    public DbSet<UomConversion> UomConversions => Set<UomConversion>();
    public DbSet<MeasurementProfile> MeasurementProfiles => Set<MeasurementProfile>();
    public DbSet<MeasurementFormula> MeasurementFormulas => Set<MeasurementFormula>();

    public DbSet<ItemGroup> ItemGroups => Set<ItemGroup>();
    public DbSet<ItemAttribute> ItemAttributes => Set<ItemAttribute>();
    public DbSet<ItemAttributeValue> ItemAttributeValues => Set<ItemAttributeValue>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<ItemVariant> ItemVariants => Set<ItemVariant>();
    public DbSet<ItemUom> ItemUoms => Set<ItemUom>();
    public DbSet<ItemBarcode> ItemBarcodes => Set<ItemBarcode>();
    public DbSet<ItemAlias> ItemAliases => Set<ItemAlias>();
    public DbSet<ItemMedia> ItemMedia => Set<ItemMedia>();
    public DbSet<ItemDocument> ItemDocuments => Set<ItemDocument>();
    public DbSet<ItemCatalog> ItemCatalog => Set<ItemCatalog>();
    public DbSet<ItemPackaging> ItemPackaging => Set<ItemPackaging>();
    public DbSet<ItemPhysicalSpecs> ItemPhysicalSpecs => Set<ItemPhysicalSpecs>();
    public DbSet<ItemCustomerReference> ItemCustomerReferences => Set<ItemCustomerReference>();
    public DbSet<ItemVendorReference> ItemVendorReferences => Set<ItemVendorReference>();
    public DbSet<ItemManufacturingPolicy> ItemManufacturingPolicies => Set<ItemManufacturingPolicy>();
    public DbSet<ItemPlanningPolicy> ItemPlanningPolicies => Set<ItemPlanningPolicy>();
    public DbSet<ItemInventoryPolicy> ItemInventoryPolicies => Set<ItemInventoryPolicy>();
    public DbSet<ItemQualityPolicy> ItemQualityPolicies => Set<ItemQualityPolicy>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();
    public DbSet<CustomerPartnerProfile> CustomerPartnerProfiles => Set<CustomerPartnerProfile>();
    public DbSet<CustomerContactPoint> CustomerContactPoints => Set<CustomerContactPoint>();
    public DbSet<CustomerItemReferenceProfile> CustomerItemReferenceProfiles => Set<CustomerItemReferenceProfile>();
    public DbSet<CustomerDocument> CustomerDocuments => Set<CustomerDocument>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<SupplierAddress> SupplierAddresses => Set<SupplierAddress>();
    public DbSet<SupplierLeadTime> SupplierLeadTimes => Set<SupplierLeadTime>();
    public DbSet<SupplierPartnerProfile> SupplierPartnerProfiles => Set<SupplierPartnerProfile>();
    public DbSet<SupplierContactPoint> SupplierContactPoints => Set<SupplierContactPoint>();
    public DbSet<SupplierVendorReferenceProfile> SupplierVendorReferenceProfiles => Set<SupplierVendorReferenceProfile>();
    public DbSet<SupplierDocument> SupplierDocuments => Set<SupplierDocument>();

    public DbSet<Operation> Operations => Set<Operation>();
    public DbSet<WorkCenter> WorkCenters => Set<WorkCenter>();
    public DbSet<Machine> Machines => Set<Machine>();
    public DbSet<Tool> Tools => Set<Tool>();
    public DbSet<Routing> Routings => Set<Routing>();
    public DbSet<RoutingOperation> RoutingOperations => Set<RoutingOperation>();

    public DbSet<Bom> Boms => Set<Bom>();
    public DbSet<BomRevision> BomRevisions => Set<BomRevision>();
    public DbSet<BomLine> BomLines => Set<BomLine>();
    public DbSet<BomOperation> BomOperations => Set<BomOperation>();
    public DbSet<AlternateItem> AlternateItems => Set<AlternateItem>();
    public DbSet<EngineeringChange> EngineeringChanges => Set<EngineeringChange>();
    public DbSet<EngineeringChangeLine> EngineeringChangeLines => Set<EngineeringChangeLine>();

    public DbSet<PurchaseRequisition> PurchaseRequisitions => Set<PurchaseRequisition>();
    public DbSet<PurchaseRequisitionLine> PurchaseRequisitionLines => Set<PurchaseRequisitionLine>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderLine> PurchaseOrderLines => Set<PurchaseOrderLine>();
    public DbSet<SubcontractOrder> SubcontractOrders => Set<SubcontractOrder>();
    public DbSet<SubcontractReceipt> SubcontractReceipts => Set<SubcontractReceipt>();
    public DbSet<GoodsReceipt> GoodsReceipts => Set<GoodsReceipt>();
    public DbSet<GoodsReceiptLine> GoodsReceiptLines => Set<GoodsReceiptLine>();
    public DbSet<SupplierInvoice> SupplierInvoices => Set<SupplierInvoice>();
    public DbSet<SupplierInvoiceLine> SupplierInvoiceLines => Set<SupplierInvoiceLine>();
    public DbSet<RequestForQuotation> RequestForQuotations => Set<RequestForQuotation>();
    public DbSet<RequestForQuotationLine> RequestForQuotationLines => Set<RequestForQuotationLine>();
    public DbSet<RequestForQuotationSupplier> RequestForQuotationSuppliers => Set<RequestForQuotationSupplier>();
    public DbSet<SupplierQuotation> SupplierQuotations => Set<SupplierQuotation>();
    public DbSet<SupplierQuotationLine> SupplierQuotationLines => Set<SupplierQuotationLine>();
    public DbSet<AccountsPayableLiability> AccountsPayableLiabilities => Set<AccountsPayableLiability>();
    public DbSet<AccountingPosting> AccountingPostings => Set<AccountingPosting>();
    public DbSet<ChartOfAccount> ChartOfAccounts => Set<ChartOfAccount>();
    public DbSet<FiscalPeriod> FiscalPeriods => Set<FiscalPeriod>();
    public DbSet<FinancePostingProfile> FinancePostingProfiles => Set<FinancePostingProfile>();
    public DbSet<GeneralLedgerJournal> GeneralLedgerJournals => Set<GeneralLedgerJournal>();
    public DbSet<GeneralLedgerJournalLine> GeneralLedgerJournalLines => Set<GeneralLedgerJournalLine>();
    public DbSet<AccountsReceivableInvoice> AccountsReceivableInvoices => Set<AccountsReceivableInvoice>();
    public DbSet<AccountsReceivableInvoiceLine> AccountsReceivableInvoiceLines => Set<AccountsReceivableInvoiceLine>();
    public DbSet<AccountsReceivableLedgerEntry> AccountsReceivableLedgerEntries => Set<AccountsReceivableLedgerEntry>();
    public DbSet<TaxLedgerEntry> TaxLedgerEntries => Set<TaxLedgerEntry>();
    public DbSet<InventoryValuationEntry> InventoryValuationEntries => Set<InventoryValuationEntry>();

    public DbSet<StockBalance> StockBalances => Set<StockBalance>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();
    public DbSet<StockReservation> StockReservations => Set<StockReservation>();
    public DbSet<Lot> Lots => Set<Lot>();
    public DbSet<Serial> Serials => Set<Serial>();
    public DbSet<InventoryLicensePlate> InventoryLicensePlates => Set<InventoryLicensePlate>();
    public DbSet<InventoryLicensePlateContent> InventoryLicensePlateContents => Set<InventoryLicensePlateContent>();
    public DbSet<CycleCount> CycleCounts => Set<CycleCount>();
    public DbSet<CycleCountLine> CycleCountLines => Set<CycleCountLine>();

    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<WorkOrderOperation> WorkOrderOperations => Set<WorkOrderOperation>();
    public DbSet<JobCard> JobCards => Set<JobCard>();
    public DbSet<JobCardEvent> JobCardEvents => Set<JobCardEvent>();
    public DbSet<DowntimeEvent> DowntimeEvents => Set<DowntimeEvent>();
    public DbSet<ProductionReceipt> ProductionReceipts => Set<ProductionReceipt>();
    public DbSet<ProductionReceiptLine> ProductionReceiptLines => Set<ProductionReceiptLine>();
    public DbSet<ScrapEntry> ScrapEntries => Set<ScrapEntry>();
    public DbSet<ReworkOrder> ReworkOrders => Set<ReworkOrder>();
    public DbSet<InspectionPlan> InspectionPlans => Set<InspectionPlan>();
    public DbSet<InspectionPlanCharacteristic> InspectionPlanCharacteristics => Set<InspectionPlanCharacteristic>();
    public DbSet<InspectionRecord> InspectionRecords => Set<InspectionRecord>();
    public DbSet<InspectionResult> InspectionResults => Set<InspectionResult>();
    public DbSet<NonConformance> NonConformances => Set<NonConformance>();
    public DbSet<NonConformanceLine> NonConformanceLines => Set<NonConformanceLine>();
    public DbSet<CoaCertificate> CoaCertificates => Set<CoaCertificate>();
    public DbSet<CoaCertificateLine> CoaCertificateLines => Set<CoaCertificateLine>();
    public DbSet<PackList> PackLists => Set<PackList>();
    public DbSet<PackListLine> PackListLines => Set<PackListLine>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<ShipmentLine> ShipmentLines => Set<ShipmentLine>();
    public DbSet<IntegrationProvider> IntegrationProviders => Set<IntegrationProvider>();
    public DbSet<IntegrationConnection> IntegrationConnections => Set<IntegrationConnection>();
    public DbSet<WebhookSubscription> WebhookSubscriptions => Set<WebhookSubscription>();
    public DbSet<ImportJob> ImportJobs => Set<ImportJob>();
    public DbSet<ExportJob> ExportJobs => Set<ExportJob>();
    public DbSet<AiProvider> AiProviders => Set<AiProvider>();
    public DbSet<AiModel> AiModels => Set<AiModel>();
    public DbSet<AiPromptTemplate> AiPromptTemplates => Set<AiPromptTemplate>();
    public DbSet<AiRun> AiRuns => Set<AiRun>();
    public DbSet<ReportDefinition> ReportDefinitions => Set<ReportDefinition>();
    public DbSet<ReportRun> ReportRuns => Set<ReportRun>();
    public DbSet<ReportOutput> ReportOutputs => Set<ReportOutput>();
    public DbSet<DashboardDefinition> DashboardDefinitions => Set<DashboardDefinition>();
    public DbSet<DashboardWidget> DashboardWidgets => Set<DashboardWidget>();

    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<QuoteLine> QuoteLines => Set<QuoteLine>();
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderLine> SalesOrderLines => Set<SalesOrderLine>();
    public DbSet<SalesTerritory> SalesTerritories => Set<SalesTerritory>();
    public DbSet<SalesTeam> SalesTeams => Set<SalesTeam>();
    public DbSet<SalesTeamMember> SalesTeamMembers => Set<SalesTeamMember>();
    public DbSet<CustomerSalesAssignment> CustomerSalesAssignments => Set<CustomerSalesAssignment>();
    public DbSet<BlanketOrder> BlanketOrders => Set<BlanketOrder>();
    public DbSet<BlanketOrderSchedule> BlanketOrderSchedules => Set<BlanketOrderSchedule>();
    public DbSet<DemandForecast> DemandForecasts => Set<DemandForecast>();
    public DbSet<DemandForecastLine> DemandForecastLines => Set<DemandForecastLine>();
    public DbSet<MasterProductionSchedule> MasterProductionSchedules => Set<MasterProductionSchedule>();
    public DbSet<MpsLine> MpsLines => Set<MpsLine>();
    public DbSet<MrpRun> MrpRuns => Set<MrpRun>();
    public DbSet<MrpRunItem> MrpRunItems => Set<MrpRunItem>();
    public DbSet<BoqRequirement> BoqRequirements => Set<BoqRequirement>();
    public DbSet<BoqRequirementLine> BoqRequirementLines => Set<BoqRequirementLine>();
    public DbSet<PlanningPlan> PlanningPlans => Set<PlanningPlan>();
    public DbSet<PlanningSnapshot> PlanningSnapshots => Set<PlanningSnapshot>();
    public DbSet<PlannedOrder> PlannedOrders => Set<PlannedOrder>();
    public DbSet<ShortageAction> ShortageActions => Set<ShortageAction>();
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<ExchangeRateSetup> ExchangeRateSetups => Set<ExchangeRateSetup>();
    public DbSet<TaxCategory> TaxCategories => Set<TaxCategory>();
    public DbSet<TaxCode> TaxCodes => Set<TaxCode>();
    public DbSet<PaymentTerm> PaymentTerms => Set<PaymentTerm>();
    public DbSet<TradeTerm> TradeTerms => Set<TradeTerm>();
    public DbSet<PriceList> PriceLists => Set<PriceList>();
    public DbSet<PriceListLine> PriceListLines => Set<PriceListLine>();
    public DbSet<PriceAssignment> PriceAssignments => Set<PriceAssignment>();
    public DbSet<DiscountScheme> DiscountSchemes => Set<DiscountScheme>();
    public DbSet<DiscountRule> DiscountRules => Set<DiscountRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MfgDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
