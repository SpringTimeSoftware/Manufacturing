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
    label: "Print Pack",
    path: "/reports/print-pack",
    section: "Reports",
    roles: ["PlanningManager", "ProductionSupervisor", "DispatchManager"]
  }
];
