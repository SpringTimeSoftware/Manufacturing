import type { RoleCode } from "../api/contracts";

export interface NavigationItem {
  label: string;
  path: string;
  section: string;
  roles?: RoleCode[];
}

export const navigationItems: NavigationItem[] = [
  { label: "Home Dashboard", path: "/", section: "Dashboards" },
  {
    label: "Order Delivery",
    path: "/dashboards/order-delivery",
    section: "Dashboards",
    roles: ["SalesCoordinator", "ManagementViewer", "PlantHead", "PlanningManager"]
  },
  {
    label: "Stage Wise",
    path: "/dashboards/stage-wise",
    section: "Dashboards",
    roles: ["PlantHead", "ManagementViewer", "PlanningManager", "ProductionSupervisor"]
  },
  {
    label: "Executive Cockpit",
    path: "/dashboards/executive-cockpit",
    section: "Dashboards",
    roles: ["ManagementViewer"]
  },
  {
    label: "BOM Library",
    path: "/engineering/boms",
    section: "Engineering",
    roles: ["PlanningManager", "CompanyAdmin"]
  },
  {
    label: "BOM Editor",
    path: "/engineering/bom-editor",
    section: "Engineering",
    roles: ["PlanningManager", "CompanyAdmin"]
  },
  {
    label: "BOM Comparison",
    path: "/engineering/bom-comparison",
    section: "Engineering",
    roles: ["PlanningManager", "CompanyAdmin"]
  },
  {
    label: "ECO Control",
    path: "/engineering/eco-revisions",
    section: "Engineering",
    roles: ["PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Routings",
    path: "/engineering/routings",
    section: "Engineering",
    roles: ["PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Operation Standards",
    path: "/engineering/operations",
    section: "Engineering",
    roles: ["PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Alternate Items",
    path: "/engineering/alternate-items",
    section: "Engineering",
    roles: ["PlanningManager", "PurchaseManager", "CompanyAdmin"]
  },
  {
    label: "Engineering Documents",
    path: "/engineering/documents",
    section: "Engineering",
    roles: ["PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Work Orders",
    path: "/production/work-orders",
    section: "Production",
    roles: ["PlanningManager", "ProductionSupervisor", "PlantHead"]
  },
  {
    label: "Job Cards",
    path: "/production/job-cards",
    section: "Production",
    roles: ["ProductionSupervisor", "PlantHead"]
  },
  {
    label: "Machine Board",
    path: "/production/machine-board",
    section: "Production",
    roles: ["PlanningManager", "ProductionSupervisor", "PlantHead"]
  },
  {
    label: "Occupancy Calendar",
    path: "/production/occupancy",
    section: "Production",
    roles: ["PlanningManager", "PlantHead"]
  },
  {
    label: "Shift Production",
    path: "/production/shift-production",
    section: "Production",
    roles: ["ProductionSupervisor", "PlantHead"]
  },
  {
    label: "Downtime Register",
    path: "/production/downtime",
    section: "Production",
    roles: ["ProductionSupervisor", "PlantHead"]
  },
  {
    label: "Production Receipt",
    path: "/production/receipts",
    section: "Production",
    roles: ["ProductionSupervisor", "StoreKeeper", "PlantHead"]
  },
  {
    label: "Scrap / By-product",
    path: "/production/scrap-by-products",
    section: "Production",
    roles: ["ProductionSupervisor", "PlantHead"]
  },
  {
    label: "Rework Orders",
    path: "/production/rework-orders",
    section: "Production",
    roles: ["ProductionSupervisor", "QCInspector", "PlantHead"]
  },
  {
    label: "Machine Status",
    path: "/production/machine-status",
    section: "Production",
    roles: ["ProductionSupervisor", "PlantHead"]
  },
  {
    label: "UOM Classes",
    path: "/measurements/uom-classes",
    section: "Measurement",
    roles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "UOM Conversions",
    path: "/measurements/uom-conversions",
    section: "Measurement",
    roles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "Measurement Profiles",
    path: "/measurements/profiles",
    section: "Measurement",
    roles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "Item Groups",
    path: "/masters/item-groups",
    section: "Masters",
    roles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "Item Attributes",
    path: "/masters/item-attributes",
    section: "Masters",
    roles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "Classifications",
    path: "/masters/classifications",
    section: "Masters",
    roles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "Reason Codes",
    path: "/masters/reason-codes",
    section: "Masters",
    roles: ["CompanyAdmin", "PlanningManager", "ProductionSupervisor", "StoreKeeper"]
  },
  {
    label: "Items",
    path: "/masters/items",
    section: "Masters",
    roles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "Item Variants",
    path: "/masters/item-variants",
    section: "Masters",
    roles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "Barcodes",
    path: "/masters/barcodes",
    section: "Masters",
    roles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "Customers",
    path: "/partners/customers",
    section: "Masters",
    roles: ["SalesCoordinator", "ManagementViewer", "CompanyAdmin"]
  },
  {
    label: "Suppliers",
    path: "/partners/suppliers",
    section: "Masters",
    roles: ["PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Supplier Lead Times",
    path: "/partners/supplier-lead-times",
    section: "Masters",
    roles: ["PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Price Lists",
    path: "/commercial/price-lists",
    section: "Commercial Setup",
    roles: ["SalesCoordinator", "PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Discount Schemes",
    path: "/commercial/discount-schemes",
    section: "Commercial Setup",
    roles: ["SalesCoordinator", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Tax, Currency & Terms",
    path: "/commercial/tax-currency-terms",
    section: "Commercial Setup",
    roles: ["SalesCoordinator", "PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Quotes",
    path: "/sales/quotes",
    section: "Sales",
    roles: ["SalesCoordinator", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Sales Orders",
    path: "/sales/orders",
    section: "Sales",
    roles: ["SalesCoordinator", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Blanket Orders",
    path: "/sales/blanket-orders",
    section: "Sales",
    roles: ["SalesCoordinator", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Demand Forecast",
    path: "/sales/forecasts",
    section: "Sales",
    roles: ["SalesCoordinator", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Available to Promise",
    path: "/sales/available-to-promise",
    section: "Sales",
    roles: ["SalesCoordinator", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Planning Workspace",
    path: "/planning/workspace",
    section: "Planning",
    roles: ["PlanningManager", "PlantHead", "CompanyAdmin"]
  },
  {
    label: "MPS Planner",
    path: "/planning/mps",
    section: "Planning",
    roles: ["PlanningManager", "PlantHead", "CompanyAdmin"]
  },
  {
    label: "MRP Run Console",
    path: "/planning/mrp",
    section: "Planning",
    roles: ["PlanningManager", "PlantHead", "CompanyAdmin"]
  },
  {
    label: "MRP Results",
    path: "/planning/mrp-results",
    section: "Planning",
    roles: ["PlanningManager", "PlantHead", "CompanyAdmin"]
  },
  {
    label: "BOQ Requirements",
    path: "/planning/boq-requirements",
    section: "Planning",
    roles: ["PlanningManager", "PurchaseManager", "CompanyAdmin"]
  },
  {
    label: "Capacity Planning",
    path: "/planning/capacity",
    section: "Planning",
    roles: ["PlanningManager", "PlantHead", "CompanyAdmin"]
  },
  {
    label: "Purchase Requisitions",
    path: "/procurement/requisitions",
    section: "Procurement",
    roles: ["PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "RFQs",
    path: "/procurement/rfqs",
    section: "Procurement",
    roles: ["PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Supplier Quotations",
    path: "/procurement/supplier-quotes",
    section: "Procurement",
    roles: ["PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Quote Comparison",
    path: "/procurement/quote-comparison",
    section: "Procurement",
    roles: ["PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Purchase Orders",
    path: "/procurement/purchase-orders",
    section: "Procurement",
    roles: ["PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Subcontract Plans",
    path: "/procurement/subcontract-plan",
    section: "Procurement",
    roles: ["PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Vendor Returns",
    path: "/procurement/vendor-returns",
    section: "Procurement",
    roles: ["PurchaseManager", "StoreKeeper", "CompanyAdmin"]
  },
  {
    label: "Landed Cost",
    path: "/procurement/landed-cost",
    section: "Procurement",
    roles: ["PurchaseManager", "CompanyAdmin"]
  },
  {
    label: "Buyer Queue",
    path: "/procurement/dashboard",
    section: "Procurement",
    roles: ["PurchaseManager", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Inventory Balances",
    path: "/inventory/balances",
    section: "Inventory",
    roles: ["StoreKeeper", "PlanningManager", "CompanyAdmin"]
  },
  {
    label: "Traceability",
    path: "/inventory/traceability",
    section: "Inventory",
    roles: ["StoreKeeper", "QCInspector", "ManagementViewer", "CompanyAdmin"]
  },
  {
    label: "Material Issue",
    path: "/inventory/material-issue",
    section: "Inventory",
    roles: ["StoreKeeper", "ProductionSupervisor", "CompanyAdmin"]
  },
  {
    label: "Material Return",
    path: "/inventory/material-return",
    section: "Inventory",
    roles: ["StoreKeeper", "ProductionSupervisor", "CompanyAdmin"]
  },
  {
    label: "Stock Transfer / Putaway",
    path: "/inventory/stock-transfer",
    section: "Inventory",
    roles: ["StoreKeeper", "CompanyAdmin"]
  },
  {
    label: "Cycle Count",
    path: "/inventory/cycle-counts",
    section: "Inventory",
    roles: ["StoreKeeper", "CompanyAdmin"]
  },
  {
    label: "QC Plans",
    path: "/quality/plans",
    section: "Quality",
    roles: ["QCInspector", "CompanyAdmin", "PlantHead"]
  },
  {
    label: "Incoming Inspection",
    path: "/quality/incoming-inspections",
    section: "Quality",
    roles: ["QCInspector", "StoreKeeper", "PlantHead"]
  },
  {
    label: "In-Process Inspection",
    path: "/quality/in-process-inspections",
    section: "Quality",
    roles: ["QCInspector", "ProductionSupervisor", "PlantHead"]
  },
  {
    label: "Final Inspection",
    path: "/quality/final-inspections",
    section: "Quality",
    roles: ["QCInspector", "DispatchManager", "PlantHead"]
  },
  {
    label: "NCR / Deviation",
    path: "/quality/ncr",
    section: "Quality",
    roles: ["QCInspector", "ProductionSupervisor", "PlantHead"]
  },
  {
    label: "COA Certificates",
    path: "/quality/coas",
    section: "Quality",
    roles: ["QCInspector", "DispatchManager", "PlantHead"]
  },
  {
    label: "Pack Lists",
    path: "/dispatch/pack-lists",
    section: "Dispatch",
    roles: ["DispatchManager", "StoreKeeper"]
  },
  {
    label: "Dispatch Planning",
    path: "/dispatch/planning",
    section: "Dispatch",
    roles: ["DispatchManager", "SalesCoordinator", "PlantHead"]
  },
  {
    label: "Shipment / Delivery",
    path: "/dispatch/shipments",
    section: "Dispatch",
    roles: ["DispatchManager", "SalesCoordinator"]
  },
  {
    label: "Chart of Accounts",
    path: "/finance/chart-of-accounts",
    section: "Finance",
    roles: ["CompanyAdmin", "ManagementViewer"]
  },
  {
    label: "Fiscal Periods",
    path: "/finance/fiscal-periods",
    section: "Finance",
    roles: ["CompanyAdmin", "ManagementViewer"]
  },
  {
    label: "Posting Profiles",
    path: "/finance/posting-profiles",
    section: "Finance",
    roles: ["CompanyAdmin"]
  },
  {
    label: "GL Journals",
    path: "/finance/gl-journals",
    section: "Finance",
    roles: ["CompanyAdmin", "ManagementViewer"]
  },
  {
    label: "AP Invoices",
    path: "/finance/ap-invoices",
    section: "Finance",
    roles: ["CompanyAdmin", "PurchaseManager", "ManagementViewer"]
  },
  {
    label: "AR Invoices",
    path: "/finance/ar-invoices",
    section: "Finance",
    roles: ["CompanyAdmin", "SalesCoordinator", "ManagementViewer"]
  },
  {
    label: "Inventory Valuation",
    path: "/finance/inventory-valuation",
    section: "Finance",
    roles: ["CompanyAdmin", "StoreKeeper", "ManagementViewer"]
  },
  {
    label: "Tax Ledger",
    path: "/finance/tax-ledger",
    section: "Finance",
    roles: ["CompanyAdmin", "ManagementViewer"]
  },
  {
    label: "Finance Boundaries",
    path: "/finance/boundaries",
    section: "Finance",
    roles: ["CompanyAdmin"]
  },
  {
    label: "Service Dashboard",
    path: "/service/dashboard",
    section: "Service",
    roles: ["SalesCoordinator", "DispatchManager", "StoreKeeper", "ManagementViewer", "CompanyAdmin"]
  },
  {
    label: "Installed Assets",
    path: "/service/installed-assets",
    section: "Service",
    roles: ["SalesCoordinator", "DispatchManager", "ManagementViewer", "CompanyAdmin"]
  },
  {
    label: "Warranty Policies",
    path: "/service/warranty-policies",
    section: "Service",
    roles: ["CompanyAdmin", "ManagementViewer"]
  },
  {
    label: "AMC Contracts",
    path: "/service/contracts",
    section: "Service",
    roles: ["CompanyAdmin", "ManagementViewer", "SalesCoordinator"]
  },
  {
    label: "Service Tickets",
    path: "/service/tickets",
    section: "Service",
    roles: ["SalesCoordinator", "DispatchManager", "StoreKeeper", "ManagementViewer", "CompanyAdmin"]
  },
  {
    label: "Service Visits",
    path: "/service/visits",
    section: "Service",
    roles: ["DispatchManager", "StoreKeeper", "ManagementViewer", "CompanyAdmin"]
  },
  {
    label: "Spare Issue / Return",
    path: "/service/spares",
    section: "Service",
    roles: ["StoreKeeper", "DispatchManager", "CompanyAdmin"]
  },
  {
    label: "Warranty Claims",
    path: "/service/warranty-claims",
    section: "Service",
    roles: ["CompanyAdmin", "ManagementViewer", "SalesCoordinator"]
  },
  {
    label: "Service Charges",
    path: "/service/charges",
    section: "Service",
    roles: ["CompanyAdmin", "SalesCoordinator", "ManagementViewer"]
  },
  {
    label: "Service Reports",
    path: "/service/reports",
    section: "Service",
    roles: ["CompanyAdmin", "ManagementViewer"]
  },
  {
    label: "Context Switch",
    path: "/platform/context-switch",
    section: "Platform"
  },
  {
    label: "Notifications",
    path: "/platform/notifications",
    section: "Platform"
  },
  {
    label: "Approvals",
    path: "/platform/approvals",
    section: "Platform",
    roles: ["CompanyAdmin", "PlanningManager", "PurchaseManager", "ProductionSupervisor", "DispatchManager", "PlantHead", "ManagementViewer"]
  },
  {
    label: "Attachments",
    path: "/platform/attachments",
    section: "Platform"
  },
  {
    label: "Users",
    path: "/platform/users",
    section: "Platform",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Roles & Permissions",
    path: "/platform/roles",
    section: "Platform",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Audit Trail",
    path: "/platform/audit-trail",
    section: "Platform",
    roles: ["PlatformAdmin", "CompanyAdmin", "PlantHead"]
  },
  {
    label: "Language Setup",
    path: "/platform/translations",
    section: "Platform",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Workflow & Numbering",
    path: "/platform/workflow-numbering",
    section: "Platform",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Extensibility",
    path: "/platform/extensibility",
    section: "Platform",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Platform Settings",
    path: "/platform/settings",
    section: "Platform",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Tenant Settings",
    path: "/platform/tenant-settings",
    section: "Platform",
    roles: ["PlatformAdmin"]
  },
  {
    label: "Runtime UAT",
    path: "/platform/runtime-uat",
    section: "Platform",
    roles: ["PlatformAdmin", "CompanyAdmin", "PlantHead"]
  },
  {
    label: "Global Search",
    path: "/search",
    section: "Platform"
  },
  {
    label: "Help Center",
    path: "/help",
    section: "Platform"
  },
  {
    label: "Provider Admin",
    path: "/integrations/providers",
    section: "Integrations",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Provider Health",
    path: "/integrations/health",
    section: "Integrations",
    roles: ["PlatformAdmin", "CompanyAdmin", "PlantHead"]
  },
  {
    label: "Webhooks",
    path: "/integrations/webhooks",
    section: "Integrations",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Imports",
    path: "/integrations/imports",
    section: "Integrations",
    roles: ["PlatformAdmin", "CompanyAdmin", "PlanningManager", "StoreKeeper"]
  },
  {
    label: "Exports",
    path: "/integrations/exports",
    section: "Integrations",
    roles: ["PlatformAdmin", "CompanyAdmin", "PlanningManager", "DispatchManager", "ManagementViewer"]
  },
  {
    label: "Delivery Logs",
    path: "/integrations/delivery-logs",
    section: "Integrations",
    roles: ["PlatformAdmin", "CompanyAdmin", "SalesCoordinator", "DispatchManager"]
  },
  {
    label: "CRM Mapping",
    path: "/integrations/crm-mapping",
    section: "Integrations",
    roles: ["PlatformAdmin", "CompanyAdmin", "SalesCoordinator"]
  },
  {
    label: "AI Assistant",
    path: "/ai/assistant",
    section: "AI",
    roles: ["PlatformAdmin", "CompanyAdmin", "PlanningManager", "PlantHead"]
  },
  {
    label: "Translation Assistant",
    path: "/ai/translations",
    section: "AI",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Companies",
    path: "/organization/companies",
    section: "Organization",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Branches",
    path: "/organization/branches",
    section: "Organization",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Departments",
    path: "/organization/departments",
    section: "Organization",
    roles: ["PlatformAdmin", "CompanyAdmin"]
  },
  {
    label: "Warehouses",
    path: "/organization/warehouses",
    section: "Organization",
    roles: ["PlatformAdmin", "CompanyAdmin", "StoreKeeper"]
  },
  {
    label: "Bins",
    path: "/organization/bins",
    section: "Organization",
    roles: ["PlatformAdmin", "CompanyAdmin", "StoreKeeper"]
  },
  {
    label: "Shift Calendar",
    path: "/organization/shifts",
    section: "Organization",
    roles: ["PlatformAdmin", "CompanyAdmin", "ProductionSupervisor"]
  },
  {
    label: "Work Centers",
    path: "/resources/work-centers",
    section: "Resources",
    roles: ["PlatformAdmin", "CompanyAdmin", "PlanningManager", "ProductionSupervisor"]
  },
  {
    label: "Machines",
    path: "/resources/machines",
    section: "Resources",
    roles: ["PlatformAdmin", "CompanyAdmin", "PlanningManager", "ProductionSupervisor"]
  },
  {
    label: "Tools / Resources",
    path: "/resources/tools",
    section: "Resources",
    roles: ["PlatformAdmin", "CompanyAdmin", "PlanningManager"]
  },
  {
    label: "Report Catalog",
    path: "/reports/catalog",
    section: "Reports",
    roles: ["CompanyAdmin", "PlanningManager", "ProductionSupervisor", "DispatchManager", "ManagementViewer"]
  },
  {
    label: "Report Parameters",
    path: "/reports/parameters",
    section: "Reports",
    roles: ["CompanyAdmin", "PlanningManager", "ProductionSupervisor", "DispatchManager", "ManagementViewer"]
  },
  {
    label: "Saved Views",
    path: "/reports/saved-views",
    section: "Reports",
    roles: ["CompanyAdmin", "PlanningManager", "ProductionSupervisor", "DispatchManager", "ManagementViewer"]
  },
  {
    label: "Print Pack",
    path: "/reports/print-pack",
    section: "Reports",
    roles: ["PlanningManager", "ProductionSupervisor", "DispatchManager"]
  }
];
