import { createBrowserRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { RouteGuard } from "../layout/RouteGuard";
import { AppShell } from "../layout/AppShell";
import { navigationItems } from "../layout/navigation";
import { LoginPage } from "../pages/LoginPage";
import {
  AuditTrailPage,
  RolePermissionMatrixPage,
  UserManagementPage
} from "../pages/AdminPages";
import {
  DashboardHomePage,
  ExecutiveCockpitPage,
  OrderDeliveryDashboardPage,
  StageWiseDashboardPage
} from "../pages/DashboardPages";
import {
  DispatchPlanningPage,
  PackListPage,
  ShipmentDeliveryPage
} from "../pages/DispatchPages";
import {
  ApInvoicesPage,
  ArInvoicesPage,
  ChartOfAccountsPage,
  FinanceDeferredActionsPage,
  FiscalPeriodsPage,
  GlJournalsPage,
  InventoryValuationPage,
  PostingProfilesPage,
  TaxLedgerPage
} from "../pages/FinancePages";
import {
  AttachmentViewerPage,
  AvailableToPromisePage,
  BlanketOrderContractPage,
  DemandForecastPage,
  MpsPlannerPage,
  QuoteEstimateListPage,
  SalesOrderListPage,
  SupplierLeadTimeMatrixPage
} from "../pages/CommercialPlanningPages";
import {
  DiscountSchemeMasterPage,
  PriceListMasterPage,
  TaxCurrencyTermsPage
} from "../pages/CommercialMasterPages";
import { BomLibraryPage } from "../pages/EngineeringPages";
import {
  AlternateItemRulesPage,
  BomComparisonPage,
  BomDetailEditorPage,
  EcoRevisionControlPage,
  EngineeringAttachmentViewerPage,
  OperationStandardPage,
  RoutingLibraryPage
} from "../pages/EngineeringContinuationPages";
import {
  PlatformSettingsPage,
  TenantSettingsPage,
  TranslationSetupPage,
  WorkflowNumberingPage
} from "../pages/MasterPages";
import { PlatformExtensibilityPage } from "../pages/PlatformExtensibilityPage";
import {
  BarcodeLabelSetupPage,
  ClassificationSetupPage,
  ItemAttributeMasterPage,
  ItemGroupMasterPage,
  ItemListPage,
  ItemVariantMatrixPage,
  ReasonCodeRulesPage
} from "../pages/ItemMasterPages";
import {
  MeasurementProfileMasterPage,
  UomClassMasterPage,
  UomConversionMasterPage
} from "../pages/MeasurementPages";
import {
  InventoryBalancePage,
  MaterialIssuePage,
  MaterialReturnPage,
  StockTransferPutawayPage,
  TraceabilityPage
} from "../pages/InventoryPages";
import { NotFoundPage } from "../pages/NotFoundPage";
import {
  BranchMasterPage,
  BinMasterPage,
  CompanyMasterPage,
  DepartmentMasterPage,
  ShiftCalendarPage,
  WarehouseMasterPage
} from "../pages/OrganizationPages";
import { CustomerListDetailPage, SupplierListDetailPage } from "../pages/PartnerPages";
import { MachineMasterPage, ToolResourceMasterPage, WorkCenterMasterPage } from "../pages/ResourceFoundationPages";
import {
  CycleCountPage,
  DowntimeRegisterPage,
  JobCardsPage,
  MachineBoardPage,
  OccupancyCalendarPage,
  ShiftProductionEntryPage,
  WorkOrdersPage
} from "../pages/OperationsPages";
import {
  ApprovalWorkbenchPage,
  ContextSwitchPage,
  ForgotPasswordPage,
  NotificationInboxPage
} from "../pages/PlatformPages";
import { CapacityPlanningBoardPage } from "../pages/PlanningContinuationPages";
import { PlanningWorkspacePage } from "../pages/PlanningCompletionPages";
import { BoqRequirementsPage, MrpResultsExceptionsPage, MrpRunConsolePage } from "../pages/PlanningPages";
import {
  LandedCostPage,
  ProcurementDashboardPage,
  PurchaseOrderPage,
  PurchaseRequisitionPage,
  QuoteComparisonPage,
  RfqSourcingPage,
  SupplierQuotationPage,
  SubcontractPlanPage,
  VendorReturnPage
} from "../pages/ProcurementPages";
import {
  MachineStatusPage,
  ProductionReceiptPage,
  ReworkOrderPage,
  ScrapByProductPage
} from "../pages/ProductionOutputPages";
import {
  CoaCertificatePage,
  FinalInspectionPage,
  IncomingInspectionPage,
  InProcessInspectionPage,
  NcrDeviationPage,
  QcPlanSetupPage
} from "../pages/QualityPages";
import { PrintPackPage } from "../pages/PrintPackPage";
import { RuntimeUatPage } from "../pages/RuntimeUatPage";
import { GlobalSearchPage } from "../pages/SearchPage";
import {
  HelpCenterPage,
  HelpGlossaryPage,
  HelpTopicPage,
  ProcessGuidePage
} from "../pages/HelpPages";
import {
  AiAssistantPage,
  CrmSyncMappingPage,
  DeliveryLogsPage,
  ExportJobsPage,
  ImportJobsPage,
  IntegrationProviderAdminPage,
  ProviderHealthPage,
  ReportCatalogPage,
  ReportParametersPage,
  SavedViewsPage,
  TranslationAssistantPage,
  WebhookAdminPage
} from "../pages/WS07Pages";
import {
  InstalledAssetsPage,
  ServiceChargesPage,
  ServiceContractsPage,
  ServiceDashboardPage,
  ServiceReportsPage,
  ServiceSpareMovementsPage,
  ServiceTicketsPage,
  ServiceVisitsPage,
  WarrantyClaimsPage,
  WarrantyPoliciesPage
} from "../pages/ServiceWarrantyAmcPages";

function guardedRoute(path: string, element: ReactElement) {
  const roles = navigationItems.find((item) => item.path === `/${path}`)?.roles;
  return {
    path,
    element: <RouteGuard roles={roles}>{element}</RouteGuard>
  };
}

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />
  },
  {
    path: "/",
    element: (
      <RouteGuard>
        <AppShell />
      </RouteGuard>
    ),
    children: [
      { index: true, element: <DashboardHomePage /> },
      guardedRoute("dashboards/order-delivery", <OrderDeliveryDashboardPage />),
      guardedRoute("dashboards/stage-wise", <StageWiseDashboardPage />),
      guardedRoute("dashboards/executive-cockpit", <ExecutiveCockpitPage />),
      guardedRoute("engineering/boms", <BomLibraryPage />),
      guardedRoute("engineering/bom-editor", <BomDetailEditorPage />),
      guardedRoute("engineering/bom-comparison", <BomComparisonPage />),
      guardedRoute("engineering/eco-revisions", <EcoRevisionControlPage />),
      guardedRoute("engineering/routings", <RoutingLibraryPage />),
      guardedRoute("engineering/operations", <OperationStandardPage />),
      guardedRoute("engineering/alternate-items", <AlternateItemRulesPage />),
      guardedRoute("engineering/documents", <EngineeringAttachmentViewerPage />),
      guardedRoute("production/work-orders", <WorkOrdersPage />),
      guardedRoute("production/job-cards", <JobCardsPage />),
      guardedRoute("production/machine-board", <MachineBoardPage />),
      guardedRoute("production/occupancy", <OccupancyCalendarPage />),
      guardedRoute("production/shift-production", <ShiftProductionEntryPage />),
      guardedRoute("production/downtime", <DowntimeRegisterPage />),
      guardedRoute("production/receipts", <ProductionReceiptPage />),
      guardedRoute("production/scrap-by-products", <ScrapByProductPage />),
      guardedRoute("production/rework-orders", <ReworkOrderPage />),
      guardedRoute("production/machine-status", <MachineStatusPage />),
      guardedRoute("measurements/uom-classes", <UomClassMasterPage />),
      guardedRoute("measurements/uom-conversions", <UomConversionMasterPage />),
      guardedRoute("measurements/profiles", <MeasurementProfileMasterPage />),
      guardedRoute("masters/item-groups", <ItemGroupMasterPage />),
      guardedRoute("masters/item-attributes", <ItemAttributeMasterPage />),
      guardedRoute("masters/classifications", <ClassificationSetupPage />),
      guardedRoute("masters/reason-codes", <ReasonCodeRulesPage />),
      guardedRoute("masters/items", <ItemListPage />),
      guardedRoute("masters/item-variants", <ItemVariantMatrixPage />),
      guardedRoute("masters/barcodes", <BarcodeLabelSetupPage />),
      guardedRoute("partners/customers", <CustomerListDetailPage />),
      guardedRoute("partners/suppliers", <SupplierListDetailPage />),
      guardedRoute("partners/supplier-lead-times", <SupplierLeadTimeMatrixPage />),
      guardedRoute("commercial/price-lists", <PriceListMasterPage />),
      guardedRoute("commercial/discount-schemes", <DiscountSchemeMasterPage />),
      guardedRoute("commercial/tax-currency-terms", <TaxCurrencyTermsPage />),
      guardedRoute("platform/attachments", <AttachmentViewerPage />),
      guardedRoute("sales/quotes", <QuoteEstimateListPage />),
      guardedRoute("sales/orders", <SalesOrderListPage />),
      guardedRoute("sales/blanket-orders", <BlanketOrderContractPage />),
      guardedRoute("sales/forecasts", <DemandForecastPage />),
      guardedRoute("planning/workspace", <PlanningWorkspacePage />),
      guardedRoute("planning/mps", <MpsPlannerPage />),
      guardedRoute("planning/mrp", <MrpRunConsolePage />),
      guardedRoute("planning/mrp-results", <MrpResultsExceptionsPage />),
      guardedRoute("planning/boq-requirements", <BoqRequirementsPage />),
      guardedRoute("planning/capacity", <CapacityPlanningBoardPage />),
      guardedRoute("procurement/requisitions", <PurchaseRequisitionPage />),
      guardedRoute("procurement/rfqs", <RfqSourcingPage />),
      guardedRoute("procurement/supplier-quotes", <SupplierQuotationPage />),
      guardedRoute("procurement/quote-comparison", <QuoteComparisonPage />),
      guardedRoute("procurement/purchase-orders", <PurchaseOrderPage />),
      guardedRoute("procurement/subcontract-plan", <SubcontractPlanPage />),
      guardedRoute("procurement/vendor-returns", <VendorReturnPage />),
      guardedRoute("procurement/landed-cost", <LandedCostPage />),
      guardedRoute("procurement/dashboard", <ProcurementDashboardPage />),
      guardedRoute("inventory/balances", <InventoryBalancePage />),
      guardedRoute("inventory/traceability", <TraceabilityPage />),
      guardedRoute("inventory/material-issue", <MaterialIssuePage />),
      guardedRoute("inventory/material-return", <MaterialReturnPage />),
      guardedRoute("inventory/stock-transfer", <StockTransferPutawayPage />),
      guardedRoute("inventory/cycle-counts", <CycleCountPage />),
      guardedRoute("quality/plans", <QcPlanSetupPage />),
      guardedRoute("quality/incoming-inspections", <IncomingInspectionPage />),
      guardedRoute("quality/in-process-inspections", <InProcessInspectionPage />),
      guardedRoute("quality/final-inspections", <FinalInspectionPage />),
      guardedRoute("quality/ncr", <NcrDeviationPage />),
      guardedRoute("quality/coas", <CoaCertificatePage />),
      guardedRoute("dispatch/pack-lists", <PackListPage />),
      guardedRoute("dispatch/planning", <DispatchPlanningPage />),
      guardedRoute("dispatch/shipments", <ShipmentDeliveryPage />),
      guardedRoute("finance/chart-of-accounts", <ChartOfAccountsPage />),
      guardedRoute("finance/fiscal-periods", <FiscalPeriodsPage />),
      guardedRoute("finance/posting-profiles", <PostingProfilesPage />),
      guardedRoute("finance/gl-journals", <GlJournalsPage />),
      guardedRoute("finance/ap-invoices", <ApInvoicesPage />),
      guardedRoute("finance/ar-invoices", <ArInvoicesPage />),
      guardedRoute("finance/inventory-valuation", <InventoryValuationPage />),
      guardedRoute("finance/tax-ledger", <TaxLedgerPage />),
      guardedRoute("finance/boundaries", <FinanceDeferredActionsPage />),
      guardedRoute("service/dashboard", <ServiceDashboardPage />),
      guardedRoute("service/installed-assets", <InstalledAssetsPage />),
      guardedRoute("service/warranty-policies", <WarrantyPoliciesPage />),
      guardedRoute("service/contracts", <ServiceContractsPage />),
      guardedRoute("service/tickets", <ServiceTicketsPage />),
      guardedRoute("service/visits", <ServiceVisitsPage />),
      guardedRoute("service/spares", <ServiceSpareMovementsPage />),
      guardedRoute("service/warranty-claims", <WarrantyClaimsPage />),
      guardedRoute("service/charges", <ServiceChargesPage />),
      guardedRoute("service/reports", <ServiceReportsPage />),
      guardedRoute("sales/available-to-promise", <AvailableToPromisePage />),
      guardedRoute("platform/users", <UserManagementPage />),
      guardedRoute("platform/roles", <RolePermissionMatrixPage />),
      guardedRoute("platform/audit", <AuditTrailPage />),
      guardedRoute("platform/audit-trail", <AuditTrailPage />),
      guardedRoute("platform/translations", <TranslationSetupPage />),
      guardedRoute("platform/workflow-numbering", <WorkflowNumberingPage />),
      guardedRoute("platform/extensibility", <PlatformExtensibilityPage />),
      guardedRoute("platform/tenant-settings", <TenantSettingsPage />),
      guardedRoute("platform/settings", <PlatformSettingsPage />),
      guardedRoute("platform/runtime-uat", <RuntimeUatPage />),
      guardedRoute("integrations/providers", <IntegrationProviderAdminPage />),
      guardedRoute("integrations/health", <ProviderHealthPage />),
      guardedRoute("integrations/webhooks", <WebhookAdminPage />),
      guardedRoute("integrations/imports", <ImportJobsPage />),
      guardedRoute("integrations/exports", <ExportJobsPage />),
      guardedRoute("integrations/delivery-logs", <DeliveryLogsPage />),
      guardedRoute("integrations/crm-mapping", <CrmSyncMappingPage />),
      guardedRoute("ai/assistant", <AiAssistantPage />),
      guardedRoute("ai/translations", <TranslationAssistantPage />),
      guardedRoute("organization/companies", <CompanyMasterPage />),
      guardedRoute("organization/branches", <BranchMasterPage />),
      guardedRoute("organization/departments", <DepartmentMasterPage />),
      guardedRoute("organization/warehouses", <WarehouseMasterPage />),
      guardedRoute("organization/bins", <BinMasterPage />),
      guardedRoute("organization/shifts", <ShiftCalendarPage />),
      guardedRoute("resources/work-centers", <WorkCenterMasterPage />),
      guardedRoute("resources/machines", <MachineMasterPage />),
      guardedRoute("resources/tools", <ToolResourceMasterPage />),
      guardedRoute("platform/context-switch", <ContextSwitchPage />),
      guardedRoute("platform/notifications", <NotificationInboxPage />),
      guardedRoute("platform/approvals", <ApprovalWorkbenchPage />),
      guardedRoute("search", <GlobalSearchPage />),
      guardedRoute("help", <HelpCenterPage />),
      guardedRoute("help/topics/:topicId", <HelpTopicPage />),
      guardedRoute("help/process/:guideId", <ProcessGuidePage />),
      guardedRoute("help/glossary", <HelpGlossaryPage />),
      guardedRoute("reports/catalog", <ReportCatalogPage />),
      guardedRoute("reports/parameters", <ReportParametersPage />),
      guardedRoute("reports/saved-views", <SavedViewsPage />),
      guardedRoute("reports/print-pack", <PrintPackPage />)
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
