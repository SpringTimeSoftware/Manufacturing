import { navigationItems } from "../layout/navigation";

export interface FieldHelpRecord {
  controlType: string;
  examples: string[];
  fieldId: string;
  label: string;
  lookupSource?: string;
  meaning: string;
  screenOrTab: string;
  validation: string;
}

export interface ActionHelpRecord {
  action: string;
  allowedWhen: string;
  dependencies: string[];
  disabledReason: string;
  purpose: string;
}

export interface TabHelpRecord {
  actions: string[];
  commonMistakes: string[];
  purpose: string;
  tab: string;
}

export interface HelpScreenRecord {
  actions: ActionHelpRecord[];
  commonMistakes: string[];
  domain: string;
  fields: FieldHelpRecord[];
  id: string;
  keyActions: string[];
  prerequisites: string[];
  purpose: string;
  relatedScreens: string[];
  route: string;
  statuses: string[];
  tabs: TabHelpRecord[];
  targetRoles: string[];
  title: string;
}

export interface ProcessGuideRecord {
  id: string;
  title: string;
  purpose: string;
  steps: string[];
  relatedScreens: string[];
}

export interface GlossaryRecord {
  term: string;
  definition: string;
  relatedScreens: string[];
}

export interface QuickHelpAnswer {
  answer: string;
  citations: string[];
}

const statusHelp = ["Draft", "Active", "Pending approval", "On hold", "Released", "Closed"];

const genericActions: ActionHelpRecord[] = [
  {
    action: "Search and filter",
    allowedWhen: "Always available when the screen loads.",
    dependencies: ["Current company and branch context"],
    disabledReason: "Search is unavailable only when the screen cannot load records.",
    purpose: "Find records inside the current company, branch, and role scope."
  },
  {
    action: "Open detail",
    allowedWhen: "A row is visible and the user has access to the screen.",
    dependencies: ["Selected row"],
    disabledReason: "Detail opens only from a record row.",
    purpose: "Review the record workspace, validation state, and available next actions."
  }
];

const sharedSaveAction: ActionHelpRecord = {
  action: "Save",
  allowedWhen: "The record is editable, validation passes, and the signed-in role has write access.",
  dependencies: ["Write permission", "Required fields", "Record lifecycle state"],
  disabledReason: "Save stays disabled when the current record is review-only or the write workflow is not enabled for that business record.",
  purpose: "Persist the current draft or setup change."
};

const sharedCreateAction: ActionHelpRecord = {
  action: "New / Create",
  allowedWhen: "The screen supports authoring for the signed-in role.",
  dependencies: ["Write permission", "Current company and branch context", "Required master data"],
  disabledReason: "Create stays disabled when the record needs an approved setup workflow before users can author it.",
  purpose: "Open the intended create workspace so the user can inspect required fields and validation."
};

const sharedUploadAction: ActionHelpRecord = {
  action: "Upload",
  allowedWhen: "The record has been saved and document storage is enabled for the business object.",
  dependencies: ["Saved record", "Attachment storage", "Document access policy"],
  disabledReason: "Upload is disabled until the record exists and document storage is enabled for that object.",
  purpose: "Attach controlled files, media, or proof documents to a saved business record."
};

const itemTabs: TabHelpRecord[] = [
  {
    tab: "Core Info",
    purpose: "Captures the item code, name, type, UOM, measurement profile, and lifecycle state.",
    actions: ["Select controlled UOM and item type", "Review activation blockers", "Save a valid item draft"],
    commonMistakes: ["Leaving item code or stock UOM empty", "Using a purchased item type for manufactured items"]
  },
  {
    tab: "Classification",
    purpose: "Connects the item to group, category, subcategory, product family, business segment, and reporting bucket masters.",
    actions: ["Select controlled taxonomy values", "Review missing taxonomy dependencies"],
    commonMistakes: ["Typing a classification value outside the approved master", "Choosing a reporting bucket that does not match commercial reporting"]
  },
  {
    tab: "Images & Media",
    purpose: "Shows item media and the primary image state after the item exists as a saved record.",
    actions: ["Review linked media", "Upload media when storage and record state allow it"],
    commonMistakes: ["Trying to upload media before saving the item", "Adding uncontrolled images without approval"]
  },
  {
    tab: "UOM & Conversions",
    purpose: "Shows stock, purchase, sales, production, and QC UOM relationships used by planning and inventory.",
    actions: ["Review controlled UOMs", "Confirm conversion readiness"],
    commonMistakes: ["Mixing sales UOM and stock UOM without a conversion", "Leaving production UOM empty on manufactured items"]
  },
  {
    tab: "Packaging",
    purpose: "Captures pack quantities, weights, dimensions, and packing instructions used by dispatch and labels.",
    actions: ["Enter numeric pack quantities", "Review net and gross weights"],
    commonMistakes: ["Entering dimensions as notes", "Leaving carton quantity blank for sellable items"]
  },
  {
    tab: "Manufacturing",
    purpose: "Connects manufactured items to BOM, routing, issue method, scrap allowance, and resource policy.",
    actions: ["Review BOM and routing readiness", "Confirm make/buy policy"],
    commonMistakes: ["Activating a manufactured item without BOM/routing readiness", "Using purchase lead time for production planning"]
  },
  {
    tab: "Planning/Replenishment",
    purpose: "Controls MRP behavior, lead time, safety stock, reorder point, and lot size.",
    actions: ["Set numeric planning quantities", "Review reorder policy"],
    commonMistakes: ["Leaving MRP off for planned items", "Using zero lead time where supplier or production time exists"]
  },
  {
    tab: "Quality/Traceability",
    purpose: "Defines inspection, lot/serial, expiry, and traceability expectations used by production and dispatch.",
    actions: ["Select QC and traceability policy", "Review inspection readiness"],
    commonMistakes: ["Disabling QC for customer-controlled items", "Mixing lot and serial policy after stock exists"]
  },
  {
    tab: "Sales/Commercial",
    purpose: "Shows sellable item settings that connect to price lists, taxes, discounts, and customer references.",
    actions: ["Review sales UOM", "Confirm commercial readiness"],
    commonMistakes: ["Adding the item to a price list before sales UOM is correct", "Leaving tax category review incomplete"]
  },
  {
    tab: "Purchase/Vendor",
    purpose: "Shows supplier references, purchase UOM, MOQ, and lead time used by procurement and MRP.",
    actions: ["Review preferred supplier", "Confirm purchase UOM and MOQ"],
    commonMistakes: ["Using a supplier reference before supplier compliance is approved", "Leaving MOQ as text instead of a numeric quantity"]
  },
  {
    tab: "Attachments/Documents",
    purpose: "Shows controlled documents such as drawings, certificates, specifications, and approval evidence.",
    actions: ["Review document metadata", "Attach files when record and storage policy allow it"],
    commonMistakes: ["Expecting document upload before the item draft is saved", "Using an expired drawing revision"]
  },
  {
    tab: "Audit/History",
    purpose: "Shows recorded changes, lifecycle decisions, and who made them.",
    actions: ["Review change history", "Confirm activation decisions"],
    commonMistakes: ["Expecting audit rows before any saved change exists"]
  }
];

const customerTabs: TabHelpRecord[] = [
  {
    tab: "Core Info",
    purpose: "Captures customer identity, type, short name, and account lifecycle state.",
    actions: ["Create or review a customer draft", "Confirm customer type and status"],
    commonMistakes: ["Leaving customer short name empty", "Using hold status without a credit reason"]
  },
  {
    tab: "Legal/Tax",
    purpose: "Stores legal name, tax category, registration, and currency context.",
    actions: ["Select tax category", "Review currency and registration"],
    commonMistakes: ["Leaving tax registration pending for active customers"]
  },
  {
    tab: "Sites / Bill-to / Ship-to",
    purpose: "Maintains bill-to and ship-to addresses used by orders and dispatch.",
    actions: ["Add customer site rows", "Mark default ship-to"],
    commonMistakes: ["Activating a customer without a ship-to site"]
  },
  {
    tab: "Terms & Commercial",
    purpose: "Controls payment terms, credit status, dispatch preferences, and commercial release rules.",
    actions: ["Select payment terms", "Review credit control"],
    commonMistakes: ["Using pending payment terms on an active account"]
  },
  {
    tab: "Documents",
    purpose: "Tracks customer documents and uploaded attachments where enabled.",
    actions: ["Review metadata", "Upload after saving the customer"],
    commonMistakes: ["Uploading documents before saving a new account"]
  }
];

const supplierTabs: TabHelpRecord[] = [
  {
    tab: "Core Info",
    purpose: "Captures supplier identity, type, branch context, and lifecycle state.",
    actions: ["Create or review a supplier draft", "Confirm supplier type"],
    commonMistakes: ["Using a service supplier where material procurement needs lead-time rules"]
  },
  {
    tab: "Terms & Commercial",
    purpose: "Controls payment terms, currency, compliance, and procurement release behavior.",
    actions: ["Select payment terms", "Review compliance state"],
    commonMistakes: ["Using an unapproved supplier for planned purchase recommendations"]
  },
  {
    tab: "Lead-Time Rules",
    purpose: "Shows item-specific supplier lead-time coverage used by MRP and purchase planning.",
    actions: ["Review lead-time rows", "Confirm priority rank"],
    commonMistakes: ["Leaving critical purchased items without lead-time coverage"]
  },
  {
    tab: "Compliance Documents",
    purpose: "Tracks supplier certificates and compliance evidence.",
    actions: ["Review document status", "Upload after saving the supplier"],
    commonMistakes: ["Approving a supplier while compliance evidence is missing"]
  }
];

const bomTabs: TabHelpRecord[] = [
  {
    tab: "Header",
    purpose: "Defines the parent item, revision, status, and effectivity for a BOM.",
    actions: ["Create BOM draft", "Review release readiness"],
    commonMistakes: ["Releasing a BOM without an effective date or approved parent item"]
  },
  {
    tab: "Components",
    purpose: "Lists component items, quantities, UOMs, scrap, issue method, and operation linkage.",
    actions: ["Add component lines", "Validate quantities and UOMs"],
    commonMistakes: ["Entering component quantity as a note", "Using a component UOM without a conversion"]
  },
  {
    tab: "Operations",
    purpose: "Links BOM consumption to routing operations and resource steps.",
    actions: ["Add operation lines", "Review work center dependency"],
    commonMistakes: ["Leaving operation linkage blank for backflush items"]
  }
];

const routingTabs: TabHelpRecord[] = [
  {
    tab: "Steps",
    purpose: "Defines routing sequence, work center, machine policy, setup/run time, overlap, and transfer expectations.",
    actions: ["Add routing step", "Save routing draft"],
    commonMistakes: ["Leaving setup/run minutes blank", "Assigning a machine outside the work center"]
  },
  {
    tab: "Release",
    purpose: "Reviews the routing state before it can drive work orders and job cards.",
    actions: ["Review validation", "Clone routing when permitted"],
    commonMistakes: ["Releasing a route before resource setup is ready"]
  }
];

const commercialTabs: TabHelpRecord[] = [
  {
    tab: "Header",
    purpose: "Defines the controlled code, currency, status, and effective period for commercial setup.",
    actions: ["Create draft", "Save when validation passes"],
    commonMistakes: ["Changing currency after lines already exist"]
  },
  {
    tab: "Lines",
    purpose: "Maintains item, UOM, break quantity, price, discount, and tax values.",
    actions: ["Review numeric breaks", "Confirm governed item and UOM"],
    commonMistakes: ["Typing a UOM instead of selecting one", "Entering discount percent as text"]
  }
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function routeId(route: string) {
  return route === "/" ? "home-dashboard" : slugify(route.replace(/^\//, ""));
}

function roleNames(roles: readonly string[] | undefined) {
  return roles?.length ? [...roles] : ["Authorized user"];
}

function sectionDomain(section: string) {
  const domainMap: Record<string, string> = {
    Dashboards: "Platform",
    Engineering: "Engineering",
    Production: "Production",
    Measurement: "Master Data",
    Masters: "Master Data",
    "Commercial Setup": "Commercial",
    Sales: "Commercial",
    Planning: "Planning",
    Procurement: "Procurement",
    Inventory: "Inventory",
    Quality: "Quality",
    Dispatch: "Dispatch",
    Platform: "Platform",
    Organization: "Organization",
    Resources: "Resources",
    Reports: "Reporting"
  };

  return domainMap[section] ?? section;
}

function defaultPurpose(label: string, section: string) {
  const domain = sectionDomain(section).toLowerCase();
  return `Use ${label} to review and maintain ${domain} records within the current company, branch, and role scope.`;
}

function defaultPrerequisites(section: string) {
  const shared = ["Sign in with an authorized role", "Select the correct company and branch context"];
  const extra: Record<string, string[]> = {
    Engineering: ["Item master, measurement setup, and resources should be ready"],
    Production: ["Released engineering and planning records should exist"],
    Planning: ["Item, BOM, routing, warehouse, and demand records should be current"],
    Quality: ["QC plans, item traceability policy, and source records should be ready"],
    Dispatch: ["Released stock, pack context, and customer ship-to data should be ready"],
    Inventory: ["Warehouse, bin, item, and traceability setup should be ready"],
    "Commercial Setup": ["Currency, tax, payment terms, item, and partner data should be current"],
    Masters: ["Organization and measurement masters should be current"],
    Measurement: ["Base UOM and class ownership should be agreed"],
    Resources: ["Company, branch, department, and shift setup should be ready"]
  };

  return [...shared, ...(extra[section] ?? [])];
}

function defaultRelatedScreens(section: string) {
  const related: Record<string, string[]> = {
    Engineering: ["Items", "Work Centers", "MRP Run Console", "Work Orders"],
    Production: ["BOM Library", "Routings", "Job Cards", "Quality", "Dispatch"],
    Planning: ["Items", "BOM Library", "Routings", "Work Orders", "Purchase Requisitions"],
    Quality: ["Items", "Production Receipt", "Traceability", "Dispatch"],
    Dispatch: ["Customers", "Inventory Balances", "Quality", "Print Pack"],
    Inventory: ["Items", "Warehouses", "Quality", "Production Receipt"],
    "Commercial Setup": ["Customers", "Suppliers", "Items", "Sales Orders"],
    Sales: ["Customers", "Price Lists", "Discount Schemes", "MRP Run Console"],
    Masters: ["Items", "UOM Classes", "Price Lists", "Work Orders"],
    Measurement: ["Items", "Price Lists", "BOM Library", "Production Receipt"],
    Resources: ["Routings", "Operation Standards", "Capacity Planning", "Work Orders"],
    Platform: ["Users", "Roles & Permissions", "Workflow & Numbering", "Audit Trail"]
  };

  return related[section] ?? ["Home Dashboard"];
}

function defaultFields(label: string): FieldHelpRecord[] {
  return [
    {
      controlType: "Search field",
      examples: [label, "Active"],
      fieldId: `${slugify(label)}-search`,
      label: "Search",
      meaning: `Find ${label.toLowerCase()} records by business identifiers and names.`,
      screenOrTab: label,
      validation: "Search text may be blank."
    },
    {
      controlType: "Status selector",
      examples: ["Active", "Draft", "On hold"],
      fieldId: `${slugify(label)}-status`,
      label: "Status",
      lookupSource: "Lifecycle status list",
      meaning: "Limits the list to records in a selected lifecycle state.",
      screenOrTab: label,
      validation: "Select from the governed status values."
    }
  ];
}

function buildDefaultScreen(item: (typeof navigationItems)[number]): HelpScreenRecord {
  const actions = [...genericActions];

  if (/masters|commercial|engineering|production|quality|dispatch|organization|resources|platform/.test(item.path)) {
    actions.push(sharedCreateAction, sharedSaveAction);
  }

  return {
    actions,
    commonMistakes: [
      "Working in the wrong company or branch context",
      "Ignoring disabled action reasons before starting a workflow",
      "Expecting review-only records to accept changes"
    ],
    domain: sectionDomain(item.section),
    fields: defaultFields(item.label),
    id: routeId(item.path),
    keyActions: ["Search and filter records", "Open a record workspace", "Review action reasons before changing a record"],
    prerequisites: defaultPrerequisites(item.section),
    purpose: defaultPurpose(item.label, item.section),
    relatedScreens: defaultRelatedScreens(item.section),
    route: item.path,
    statuses: statusHelp,
    tabs: [],
    targetRoles: roleNames(item.roles),
    title: item.label
  };
}

const explicitScreens: Record<string, Partial<HelpScreenRecord>> = {
  "/": {
    purpose: "Use the Home Dashboard to review current operational health, role work queues, and linked areas that need attention.",
    keyActions: ["Review KPI cards", "Open related workspaces", "Refresh the dashboard"],
    relatedScreens: ["Order Delivery", "Stage Wise", "Notifications", "Approvals"]
  },
  "/masters/items": {
    actions: [sharedCreateAction, sharedSaveAction, sharedUploadAction, ...genericActions],
    commonMistakes: ["Saving before required UOM and classification values are selected", "Trying to upload media before the item draft exists", "Activating a manufactured item before BOM and routing readiness"],
    fields: [
      {
        controlType: "Lookup",
        examples: ["Raw material", "Finished good"],
        fieldId: "item-group",
        label: "Item group/category",
        lookupSource: "Item Group / Category Master",
        meaning: "Classifies the item for activation rules, planning, reporting, and commercial setup.",
        screenOrTab: "Classification",
        validation: "Required before item activation."
      },
      {
        controlType: "Lookup",
        examples: ["PCS", "KG", "SHEET"],
        fieldId: "stock-uom",
        label: "Stock UOM",
        lookupSource: "UOM Master",
        meaning: "Defines the inventory base unit used by stock balances, planning, production, and dispatch.",
        screenOrTab: "Core Info",
        validation: "Required before saving an item draft."
      },
      {
        controlType: "Decimal field",
        examples: ["12.500", "0.250"],
        fieldId: "net-weight",
        label: "Net weight",
        meaning: "The item or pack weight excluding external packaging.",
        screenOrTab: "Packaging",
        validation: "Must be a positive decimal when captured."
      }
    ],
    keyActions: ["Create a new item draft", "Save and continue editing when validation passes", "Review activation blockers", "Attach item media after the draft is saved"],
    prerequisites: ["Item groups, UOMs, measurement profiles, and relevant commercial/resource setup should exist", "Select the correct company and branch"],
    purpose: "Use Item Master to create and govern all sellable, purchasable, manufactured, and stocked items.",
    relatedScreens: ["Item Groups", "UOM Classes", "BOM Library", "Routings", "Price Lists", "Inventory Balances"],
    tabs: itemTabs,
    targetRoles: ["CompanyAdmin", "PlanningManager", "StoreKeeper"],
    title: "Item Master"
  },
  "/partners/customers": {
    actions: [sharedCreateAction, sharedSaveAction, sharedUploadAction, ...genericActions],
    keyActions: ["Create customer draft", "Save customer and site details", "Review credit and commercial controls", "Attach customer documents after save"],
    prerequisites: ["Payment terms, currency, tax categories, and dispatch preferences should be ready"],
    purpose: "Use Customer Master to maintain customer accounts, legal/tax data, sites, contacts, credit profile, dispatch preferences, and customer item references.",
    relatedScreens: ["Price Lists", "Discount Schemes", "Sales Orders", "Dispatch Planning"],
    tabs: customerTabs,
    title: "Customer Master"
  },
  "/partners/suppliers": {
    actions: [sharedCreateAction, sharedSaveAction, sharedUploadAction, ...genericActions],
    keyActions: ["Create supplier draft", "Save supplier and site details", "Review lead-time and compliance coverage", "Attach supplier documents after save"],
    prerequisites: ["Payment terms, compliance rules, item master, and procurement context should be ready"],
    purpose: "Use Supplier Master to maintain supplier accounts, addresses, compliance, capability, lead-time coverage, and vendor references.",
    relatedScreens: ["Supplier Lead Times", "Purchase Orders", "MRP Results", "Quality"],
    tabs: supplierTabs,
    title: "Supplier Master"
  },
  "/commercial/price-lists": {
    actions: [sharedCreateAction, sharedSaveAction, ...genericActions],
    fields: [
      {
        controlType: "Money field",
        examples: ["125.00", "540.50"],
        fieldId: "unit-price",
        label: "Unit price",
        lookupSource: "Selected price-list currency",
        meaning: "The selling or buying price per selected UOM for the line.",
        screenOrTab: "Lines",
        validation: "Must be a positive money value."
      }
    ],
    purpose: "Use Price Lists to maintain effective-dated item prices by currency, customer or supplier use, quantity breaks, and UOM.",
    relatedScreens: ["Items", "Customers", "Suppliers", "Discount Schemes", "Sales Orders"],
    tabs: commercialTabs,
    title: "Price Lists"
  },
  "/commercial/discount-schemes": {
    actions: [sharedCreateAction, sharedSaveAction, ...genericActions],
    purpose: "Use Discount Schemes to govern percent or amount discounts, applicability, breaks, and commercial approval state.",
    relatedScreens: ["Price Lists", "Customers", "Sales Orders"],
    tabs: commercialTabs,
    title: "Discount Schemes"
  },
  "/commercial/tax-currency-terms": {
    actions: [sharedCreateAction, sharedSaveAction, ...genericActions],
    purpose: "Use Tax, Currency & Terms to maintain currency precision, exchange-rate setup, tax categories, payment terms, and trade terms.",
    relatedScreens: ["Price Lists", "Customers", "Suppliers", "Sales Orders", "Purchase Orders"],
    tabs: commercialTabs,
    title: "Tax, Currency & Terms"
  },
  "/engineering/boms": {
    actions: [sharedCreateAction, sharedSaveAction, ...genericActions],
    purpose: "Use BOM Library to create and review parent-item revisions, component structure, status, and release readiness.",
    relatedScreens: ["BOM Editor", "Routings", "Items", "MRP Run Console"],
    tabs: bomTabs,
    title: "BOM Library"
  },
  "/engineering/bom-editor": {
    actions: [sharedCreateAction, sharedSaveAction, ...genericActions],
    purpose: "Use BOM Editor to maintain draft BOM component and operation lines before release.",
    relatedScreens: ["BOM Library", "Routings", "Operation Standards", "MRP Results"],
    tabs: bomTabs,
    title: "BOM Editor"
  },
  "/engineering/routings": {
    actions: [sharedCreateAction, sharedSaveAction, ...genericActions],
    purpose: "Use Routings to define operation sequence, work center, machine policy, setup/run time, transfer time, and release state.",
    relatedScreens: ["Work Centers", "Machines", "Operation Standards", "Capacity Planning", "Work Orders"],
    tabs: routingTabs,
    title: "Routings"
  },
  "/planning/mrp": {
    actions: [
      {
        action: "Run MRP",
        allowedWhen: "The planning horizon, branch, warehouse, and demand source are valid.",
        dependencies: ["Demand records", "Item planning policy", "BOM/routing readiness", "Warehouse context"],
        disabledReason: "Run stays disabled when the selected planning context cannot create a controlled planning run.",
        purpose: "Calculate material and production recommendations from approved demand and master data."
      },
      ...genericActions
    ],
    purpose: "Use MRP Run Console to review planning inputs and start controlled planning runs where enabled.",
    relatedScreens: ["MPS Planner", "MRP Results", "BOQ Requirements", "Purchase Requisitions", "Work Orders"],
    title: "MRP Run Console"
  },
  "/planning/mrp-results": {
    purpose: "Use MRP Results to inspect material and production exceptions, recommendations, and ownership state.",
    relatedScreens: ["MRP Run Console", "BOQ Requirements", "Purchase Requisitions", "Work Orders"],
    title: "MRP Results"
  },
  "/planning/boq-requirements": {
    purpose: "Use BOQ Requirements to review BUY, MAKE, and TRANSFER recommendations created from planning demand.",
    relatedScreens: ["MRP Results", "Purchase Requisitions", "Work Orders", "Inventory Balances"],
    title: "BOQ Requirements"
  },
  "/planning/capacity": {
    purpose: "Use Capacity Planning to compare released demand against work center, machine, and shift capacity.",
    relatedScreens: ["Routings", "Work Centers", "Machines", "Machine Board", "Work Orders"],
    title: "Capacity Planning"
  },
  "/production/work-orders": {
    purpose: "Use Work Orders to review production order readiness, release state, source demand, quantities, and downstream job cards.",
    relatedScreens: ["BOM Library", "Routings", "Job Cards", "Production Receipt", "Quality"],
    tabs: [
      {
        tab: "Readiness",
        purpose: "Shows material, routing, resource, and QC readiness before release.",
        actions: ["Review blockers", "Open related job cards"],
        commonMistakes: ["Expecting release before BOM/routing/material readiness is complete"]
      }
    ],
    title: "Work Orders"
  },
  "/production/job-cards": {
    purpose: "Use Job Cards to supervise released shop-floor tasks, assignments, machine state, and execution progress.",
    relatedScreens: ["Work Orders", "Machine Board", "Downtime Register", "Production Receipt"],
    tabs: [
      {
        tab: "Execution",
        purpose: "Reviews operation progress and quantity capture controlled by production execution.",
        actions: ["Open work order", "Open downtime"],
        commonMistakes: ["Trying to post quantities from a review-only web record"]
      }
    ],
    title: "Job Cards"
  },
  "/production/receipts": {
    purpose: "Use Production Receipt to review output receipt drafts, accepted/rejected quantities, source linkage, and QC handoff.",
    relatedScreens: ["Work Orders", "Job Cards", "Quality", "Inventory Balances"],
    title: "Production Receipt"
  },
  "/quality/plans": {
    purpose: "Use QC Plans to govern inspection plans, sampling rules, parameters, and status for incoming, in-process, and final checks.",
    relatedScreens: ["Incoming Inspection", "In-Process Inspection", "Final Inspection", "Items"],
    title: "QC Plans"
  },
  "/quality/ncr": {
    purpose: "Use NCR / Deviation to review nonconformance records, source linkage, containment, disposition, root cause, and rework context.",
    relatedScreens: ["Quality Inspections", "Production Receipt", "Rework Orders", "Traceability"],
    tabs: [
      {
        tab: "Disposition",
        purpose: "Tracks accepted, rejected, rework, scrap, and concession decisions where enabled.",
        actions: ["Review source record", "Open rework context"],
        commonMistakes: ["Closing an NCR before root cause and disposition are complete"]
      }
    ],
    title: "NCR / Deviation"
  },
  "/dispatch/pack-lists": {
    purpose: "Use Pack Lists to review package grouping, label readiness, item/lot context, and shipment linkage.",
    relatedScreens: ["Shipment / Delivery", "Print Pack", "Inventory Balances", "Quality"],
    title: "Pack Lists"
  },
  "/dispatch/planning": {
    purpose: "Use Dispatch Planning to review shipment waves, available stock, customer references, and dispatch constraints.",
    relatedScreens: ["Pack Lists", "Shipment / Delivery", "Order Delivery", "Print Pack"],
    title: "Dispatch Planning"
  },
  "/dispatch/shipments": {
    purpose: "Use Shipment / Delivery to review shipment preparation, vehicle context, delivery proof state, and dispatch documents.",
    relatedScreens: ["Pack Lists", "Dispatch Planning", "Print Pack", "Customers"],
    title: "Shipment / Delivery"
  },
  "/platform/notifications": {
    purpose: "Use Notifications to review role-aware alerts, reminders, and work items that need attention.",
    relatedScreens: ["Approvals", "Workflow & Numbering", "Audit Trail"],
    title: "Notifications"
  },
  "/platform/approvals": {
    purpose: "Use Approvals to review pending or escalated approval requests and understand why a decision action is available or disabled.",
    relatedScreens: ["Notifications", "Workflow & Numbering", "Audit Trail"],
    title: "Approvals"
  },
  "/platform/users": {
    purpose: "Use Users to review user identities, role assignment, scope, access policy, and status.",
    relatedScreens: ["Roles & Permissions", "Tenant Settings", "Audit Trail"],
    title: "Users"
  },
  "/platform/roles": {
    purpose: "Use Roles & Permissions to review role templates, permission coverage, scope, and role governance decisions.",
    relatedScreens: ["Users", "Workflow & Numbering", "Audit Trail"],
    title: "Roles & Permissions"
  },
  "/platform/workflow-numbering": {
    purpose: "Use Workflow & Numbering to review approval chains, document numbering policy, and workflow state controls.",
    relatedScreens: ["Approvals", "Roles & Permissions", "Audit Trail", "Tenant Settings"],
    title: "Workflow & Numbering"
  },
  "/platform/tenant-settings": {
    purpose: "Use Tenant Settings to review company-wide controls, localization, security, and operational policy.",
    relatedScreens: ["Users", "Roles & Permissions", "Workflow & Numbering"],
    title: "Tenant Settings"
  },
  "/help": {
    actions: genericActions,
    commonMistakes: ["Searching by internal team language instead of business terms"],
    domain: "Help",
    keyActions: ["Search help", "Open a topic", "Open a process guide", "Review glossary terms"],
    prerequisites: ["Sign in to the ERP web app"],
    purpose: "Use Help Center to find product guidance, screen help, process guides, glossary terms, and action reasons.",
    relatedScreens: ["All web workspaces"],
    statuses: ["Available"],
    targetRoles: ["All users"],
    title: "Help Center"
  }
};

function mergeScreen(base: HelpScreenRecord, override: Partial<HelpScreenRecord> | undefined): HelpScreenRecord {
  return {
    ...base,
    ...override,
    actions: override?.actions ?? base.actions,
    commonMistakes: override?.commonMistakes ?? base.commonMistakes,
    fields: override?.fields ? [...override.fields, ...base.fields] : base.fields,
    keyActions: override?.keyActions ?? base.keyActions,
    prerequisites: override?.prerequisites ?? base.prerequisites,
    relatedScreens: override?.relatedScreens ?? base.relatedScreens,
    statuses: override?.statuses ?? base.statuses,
    tabs: override?.tabs ?? base.tabs,
    targetRoles: override?.targetRoles ?? base.targetRoles
  };
}

export const authHelpScreens: HelpScreenRecord[] = [
  {
    actions: [
      {
        action: "Sign in",
        allowedWhen: "A valid user name, password, company, and branch are entered.",
        dependencies: ["Active user account", "Approved role", "Company and branch access"],
        disabledReason: "Sign in cannot proceed until credentials and context are complete.",
        purpose: "Start a role-scoped session."
      }
    ],
    commonMistakes: ["Choosing the wrong branch for a task", "Using an account that has not been assigned to the required role"],
    domain: "Platform",
    fields: [
      {
        controlType: "Text field",
        examples: ["planning.manager"],
        fieldId: "login-user-name",
        label: "User name",
        meaning: "Identifies the account requesting access.",
        screenOrTab: "Login",
        validation: "Required."
      }
    ],
    id: "login",
    keyActions: ["Sign in", "Choose company and branch", "Open password reset when needed"],
    prerequisites: ["An active ERP user account", "Approved company and branch assignment"],
    purpose: "Use Login to start an authenticated ERP session with a valid role and operating context.",
    relatedScreens: ["Home Dashboard", "Context Switch"],
    route: "/login",
    statuses: ["Authenticated", "Anonymous", "Session expired"],
    tabs: [],
    targetRoles: ["All users"],
    title: "Login"
  },
  {
    actions: [
      {
        action: "Request password reset",
        allowedWhen: "A valid account identifier is entered.",
        dependencies: ["Active user account", "Approved reset channel"],
        disabledReason: "Reset cannot proceed without a valid account identifier.",
        purpose: "Start the approved password recovery process."
      }
    ],
    commonMistakes: ["Submitting an account identifier that does not match the user directory"],
    domain: "Platform",
    fields: [],
    id: "forgot-password",
    keyActions: ["Submit reset request", "Return to login"],
    prerequisites: ["Known user account identifier"],
    purpose: "Use Forgot Password to request a controlled account recovery workflow.",
    relatedScreens: ["Login", "Users"],
    route: "/forgot-password",
    statuses: ["Requested", "Expired", "Completed"],
    tabs: [],
    targetRoles: ["All users"],
    title: "Forgot Password"
  }
];

export const helpScreens: HelpScreenRecord[] = [
  ...authHelpScreens,
  ...navigationItems.map((item) => mergeScreen(buildDefaultScreen(item), explicitScreens[item.path]))
];

export const processGuides: ProcessGuideRecord[] = [
  {
    id: "customer-order-to-planning",
    title: "Customer Order To Planning",
    purpose: "Shows how customer demand becomes planned material and production recommendations.",
    relatedScreens: ["Customers", "Price Lists", "Sales Orders", "MPS Planner", "MRP Run Console", "BOQ Requirements"],
    steps: [
      "Confirm the customer account, sites, payment terms, tax treatment, and commercial controls.",
      "Confirm item master, UOM, price list, discount, and tax setup for the ordered item.",
      "Review customer demand and delivery risk.",
      "Run or review MPS/MRP to create BUY, MAKE, and TRANSFER recommendations.",
      "Use BOQ Requirements and MRP Results to review shortages and planned actions."
    ]
  },
  {
    id: "planning-to-production",
    title: "Planning To Production",
    purpose: "Shows how planned MAKE recommendations move into work orders and job cards.",
    relatedScreens: ["BOM Library", "Routings", "Capacity Planning", "Work Orders", "Job Cards"],
    steps: [
      "Confirm item, BOM, routing, work center, machine, and capacity readiness.",
      "Review MRP recommendations and capacity conflicts.",
      "Create or review work orders only when engineering and material readiness allow it.",
      "Use job cards to supervise released operation tasks and execution progress."
    ]
  },
  {
    id: "production-to-quality",
    title: "Production To Quality",
    purpose: "Shows how production output is reviewed against QC requirements and exceptions.",
    relatedScreens: ["Job Cards", "Production Receipt", "QC Plans", "Inspections", "NCR / Deviation"],
    steps: [
      "Review job-card progress and output quantities.",
      "Open production receipt context for accepted, rejected, and pending quantities.",
      "Apply the item QC and traceability policy.",
      "Review inspection results and create or review NCR records where the source fails quality requirements."
    ]
  },
  {
    id: "quality-to-dispatch",
    title: "Quality To Dispatch",
    purpose: "Shows how only acceptable stock proceeds toward pack, shipment, and delivery proof.",
    relatedScreens: ["Quality", "Inventory Balances", "Pack Lists", "Dispatch Planning", "Shipment / Delivery", "Print Pack"],
    steps: [
      "Confirm inspection, hold, and NCR state before dispatch planning.",
      "Review available inventory and traceability context.",
      "Prepare pack list and label context where enabled.",
      "Review shipment, loading proof, dispatch documents, and customer references."
    ]
  },
  {
    id: "master-setup-flow",
    title: "Master Setup Flow",
    purpose: "Shows the order in which core setup should be completed before transactions use the records.",
    relatedScreens: ["Companies", "Branches", "UOM Classes", "Items", "Customers", "Suppliers", "Work Centers", "Machines"],
    steps: [
      "Set organization, branch, warehouse, bin, shift, and resource basics.",
      "Set UOM classes, conversions, and measurement profiles.",
      "Set item groups, attributes, classifications, items, variants, and barcodes.",
      "Set customers, suppliers, terms, and supplier lead-time coverage.",
      "Review activation blockers before using records in planning or execution."
    ]
  },
  {
    id: "commercial-setup-flow",
    title: "Commercial Setup Flow",
    purpose: "Shows how currency, tax, terms, price, and discount setup supports customer and supplier transactions.",
    relatedScreens: ["Tax, Currency & Terms", "Price Lists", "Discount Schemes", "Customers", "Suppliers"],
    steps: [
      "Confirm currencies, precision, tax categories, payment terms, and trade terms.",
      "Create price lists with governed currency, UOM, item, and quantity breaks.",
      "Create discount schemes with controlled applicability and numeric break values.",
      "Link customer and supplier records to the approved commercial setup.",
      "Review disabled action reasons before attempting lifecycle or approval changes."
    ]
  }
];

export const glossaryTerms: GlossaryRecord[] = [
  {
    term: "Draft",
    definition: "A record that is being prepared and is not yet approved for operational use.",
    relatedScreens: ["Items", "BOM Library", "Routings", "Price Lists"]
  },
  {
    term: "Released",
    definition: "A record version that can be used by downstream planning or execution according to its lifecycle rules.",
    relatedScreens: ["BOM Library", "Routings", "Work Orders"]
  },
  {
    term: "On hold",
    definition: "A controlled state that blocks or limits use until an authorized review clears the reason.",
    relatedScreens: ["Customers", "Suppliers", "Quality", "Inventory"]
  },
  {
    term: "Approval",
    definition: "A role-controlled decision that records who approved or rejected a business change.",
    relatedScreens: ["Approvals", "Workflow & Numbering", "Audit Trail"]
  },
  {
    term: "Audit",
    definition: "A recorded business event showing the actor, time, entity, action, and outcome.",
    relatedScreens: ["Audit Trail", "Users", "Roles & Permissions"]
  },
  {
    term: "Traceability",
    definition: "The ability to follow an item, lot, serial, source, and shipment through production, quality, inventory, and dispatch.",
    relatedScreens: ["Traceability", "Quality", "Dispatch", "Production Receipt"]
  },
  {
    term: "Price list",
    definition: "A governed set of item prices by currency, UOM, quantity break, and effective period.",
    relatedScreens: ["Price Lists", "Customers", "Sales Orders"]
  },
  {
    term: "Discount scheme",
    definition: "A governed set of discount rules that can apply by customer, item, quantity, or commercial segment.",
    relatedScreens: ["Discount Schemes", "Price Lists", "Sales Orders"]
  },
  {
    term: "Tax category",
    definition: "A controlled commercial value used to determine tax behavior on sales or purchase records.",
    relatedScreens: ["Tax, Currency & Terms", "Customers", "Suppliers", "Items"]
  },
  {
    term: "Payment terms",
    definition: "A controlled value that defines expected payment timing and discount behavior.",
    relatedScreens: ["Tax, Currency & Terms", "Customers", "Suppliers"]
  }
];

export function normalizeRoute(route: string) {
  const withoutQuery = route.split("?")[0] || "/";
  return withoutQuery === "" ? "/" : withoutQuery;
}

export function findHelpByRoute(route: string) {
  const normalized = normalizeRoute(route);
  return helpScreens.find((screen) => screen.route === normalized);
}

export function findHelpById(id: string | undefined) {
  if (!id) {
    return undefined;
  }

  return helpScreens.find((screen) => screen.id === id);
}

export function findProcessGuideById(id: string | undefined) {
  if (!id) {
    return undefined;
  }

  return processGuides.find((guide) => guide.id === id);
}

export function findTabHelp(screen: HelpScreenRecord | undefined, selectedTab: string | undefined) {
  if (!screen || !selectedTab) {
    return undefined;
  }

  const normalized = selectedTab.toLowerCase();
  return screen.tabs.find((tab) => tab.tab.toLowerCase() === normalized || normalized.includes(tab.tab.toLowerCase()) || tab.tab.toLowerCase().includes(normalized));
}

export function searchHelpContent(query: string) {
  const term = query.trim().toLowerCase();

  if (!term) {
    return {
      screens: helpScreens,
      processGuides,
      glossaryTerms
    };
  }

  const includes = (values: string[]) => values.join(" ").toLowerCase().includes(term);

  return {
    screens: helpScreens.filter((screen) =>
      includes([
        screen.title,
        screen.route,
        screen.domain,
        screen.purpose,
        ...screen.keyActions,
        ...screen.prerequisites,
        ...screen.relatedScreens,
        ...screen.statuses,
        ...screen.tabs.flatMap((tab) => [tab.tab, tab.purpose, ...tab.actions])
      ])
    ),
    processGuides: processGuides.filter((guide) => includes([guide.title, guide.purpose, ...guide.steps, ...guide.relatedScreens])),
    glossaryTerms: glossaryTerms.filter((entry) => includes([entry.term, entry.definition, ...entry.relatedScreens]))
  };
}

function firstSentence(values: string[]) {
  return values.filter(Boolean).join(" ");
}

function answerFromActions(screen: HelpScreenRecord | undefined, question: string): QuickHelpAnswer | undefined {
  if (!screen) {
    return undefined;
  }

  const normalized = question.toLowerCase();
  const action = screen.actions.find((item) => normalized.includes(item.action.toLowerCase()) || item.action.toLowerCase().split(" / ").some((part) => normalized.includes(part.toLowerCase())));
  const selected = action ?? screen.actions.find((item) => item.action.toLowerCase().includes("save")) ?? sharedSaveAction;

  return {
    answer: `${selected.action}: ${selected.purpose} It is allowed when ${selected.allowedWhen.toLowerCase()} If it is disabled, the reason is: ${selected.disabledReason}`,
    citations: [screen.title, `Action: ${selected.action}`]
  };
}

export function answerQuickHelp(question: string, route: string, selectedTab?: string): QuickHelpAnswer {
  const normalizedQuestion = question.trim().toLowerCase();
  const screen = findHelpByRoute(route);
  const tab = findTabHelp(screen, selectedTab);

  if (!normalizedQuestion) {
    return {
      answer: "Ask a question about the current screen, selected tab, action state, status, prerequisites, or where the record is used later.",
      citations: screen ? [screen.title] : ["Help Center"]
    };
  }

  if (normalizedQuestion.includes("disabled") || normalizedQuestion.includes("unavailable") || normalizedQuestion.includes("not enabled")) {
    const actionAnswer = answerFromActions(screen, normalizedQuestion);
    if (actionAnswer) {
      return actionAnswer;
    }
  }

  if (tab && (normalizedQuestion.includes("tab") || normalizedQuestion.includes(tab.tab.toLowerCase()))) {
    return {
      answer: `${tab.tab}: ${tab.purpose} Key actions are ${tab.actions.join(", ").toLowerCase()}. Common mistakes: ${tab.commonMistakes.join("; ")}.`,
      citations: [screen?.title ?? "Current screen", `Tab: ${tab.tab}`]
    };
  }

  if (screen && (normalizedQuestion.includes("what is this screen") || normalizedQuestion.includes("screen for") || normalizedQuestion.includes("purpose"))) {
    return {
      answer: `${screen.title}: ${screen.purpose} Main actions: ${screen.keyActions.join(", ")}.`,
      citations: [screen.title]
    };
  }

  if (screen && (normalizedQuestion.includes("set first") || normalizedQuestion.includes("prerequisite") || normalizedQuestion.includes("before"))) {
    return {
      answer: `Set these first for ${screen.title}: ${screen.prerequisites.join("; ")}.`,
      citations: [screen.title, "Prerequisites"]
    };
  }

  if (screen && (normalizedQuestion.includes("used later") || normalizedQuestion.includes("where is this used") || normalizedQuestion.includes("related"))) {
    return {
      answer: `${screen.title} connects to ${screen.relatedScreens.join(", ")}.`,
      citations: [screen.title, "Related screens"]
    };
  }

  if (screen && normalizedQuestion.includes("status")) {
    return {
      answer: `Common statuses here are ${screen.statuses.join(", ")}. ${glossaryTerms.filter((term) => screen.statuses.some((status) => status.toLowerCase().includes(term.term.toLowerCase()))).map((term) => `${term.term}: ${term.definition}`).join(" ")}`,
      citations: [screen.title, "Glossary"]
    };
  }

  const results = searchHelpContent(question);
  const matchedScreen = results.screens[0];
  if (matchedScreen) {
    return {
      answer: `${matchedScreen.title}: ${firstSentence([matchedScreen.purpose, `Key actions: ${matchedScreen.keyActions.join(", ")}.`])}`,
      citations: [matchedScreen.title]
    };
  }

  const matchedGuide = results.processGuides[0];
  if (matchedGuide) {
    return {
      answer: `${matchedGuide.title}: ${matchedGuide.purpose} First steps: ${matchedGuide.steps.slice(0, 2).join(" ")}`,
      citations: [matchedGuide.title]
    };
  }

  const matchedGlossary = results.glossaryTerms[0];
  if (matchedGlossary) {
    return {
      answer: `${matchedGlossary.term}: ${matchedGlossary.definition}`,
      citations: ["Glossary"]
    };
  }

  return {
    answer: "This topic is not available in product help yet.",
    citations: []
  };
}
