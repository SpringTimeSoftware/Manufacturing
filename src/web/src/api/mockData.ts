import type { KanbanColumn, Lane, OccupancyRow } from "../ui/boards";
import type { TimelineEntry } from "../ui/Timeline";

export interface OrderDeliveryRecord {
  id: string;
  salesOrder: string;
  customer: string;
  item: string;
  dueDate: string;
  dueHint: string;
  priority: "High" | "Medium" | "Low";
  completion: number;
  status: "On Track" | "At Risk" | "Ready to Dispatch";
  blocker: string;
  nextAction: string;
}

export interface BomRecord {
  id: string;
  parentItem: string;
  itemCode: string;
  revision: string;
  effectiveFrom: string;
  status: "Approved" | "Draft" | "Obsolete";
  issueMethod: string;
  components: Array<{ code: string; name: string; qtyPer: string; recommendation: string }>;
}

export interface WorkOrderRecord {
  id: string;
  workOrderNo: string;
  salesOrder: string;
  itemCode: string;
  itemName: string;
  progress: string;
  planWindow: string;
  status: "Planned" | "Released" | "In Process" | "Completed";
  materialsReserved: string;
  opsReady: string;
  primaryActions: string[];
}

export interface JobCardRecord {
  id: string;
  jobCardNo: string;
  workOrderNo: string;
  operation: string;
  machine: string;
  quantitySummary: string;
  status: "Created" | "Started" | "Paused" | "Completed";
  operator: string;
  events: TimelineEntry[];
}

export interface DirectoryRecord {
  id: string;
  code: string;
  name: string;
  owner: string;
  status: string;
  detail: string;
}

export interface TranslationRecord {
  id: string;
  module: string;
  key: string;
  enIn: string;
  hiIn: string;
  status: string;
}

export interface ReportTemplate {
  id: string;
  label: string;
  format: "PDF" | "CSV" | "Excel" | "Label";
  description: string;
}

export const homeKpis = [
  { label: "Open Orders", value: "28", hint: "Customer due view" },
  { label: "MRP Exceptions", value: "11", hint: "Shortage or master gaps" },
  { label: "Released WO", value: "19", hint: "Planner-owned wave" },
  { label: "QC Pending", value: "5", hint: "Hold or release queues" }
];

export const homeTiles = [
  {
    label: "Run shortage-first review",
    eyebrow: "Planning",
    summary: "Review BUY / MAKE / TRANSFER exceptions before release windows slip."
  },
  {
    label: "Open traveler print pack",
    eyebrow: "Reports",
    summary: "Generate shop-floor packets, labels, and dispatch-ready exports."
  },
  {
    label: "Inspect translation drift",
    eyebrow: "Platform",
    summary: "Check whether English and Hindi resource keys diverged in the latest batch."
  },
  {
    label: "Review dispatch blockers",
    eyebrow: "Cross-functional",
    summary: "Surface QC, packing, and vehicle dependencies before order promises break."
  }
];

export const homeColumns: KanbanColumn[] = [
  {
    id: "confirmed",
    label: "SO Confirmed",
    count: 4,
    tickets: [
      {
        id: "confirmed-1",
        title: "SO-2026-0191",
        meta: "Shree Ozone • Due 2026-03-09",
        progress: "35%",
        badges: [{ label: "Material shortage", tone: "warn" }]
      }
    ]
  },
  {
    id: "procurement",
    label: "Procurement",
    count: 5,
    tickets: [
      {
        id: "proc-1",
        title: "SO-2026-0189",
        meta: "PO overdue for RM-SS-SHEET",
        progress: "Overdue",
        badges: [{ label: "Supplier delay", tone: "danger" }]
      }
    ]
  },
  {
    id: "production",
    label: "Production",
    count: 9,
    tickets: [
      {
        id: "prod-1",
        title: "WO-02642",
        meta: "Laser + welding + final assembly",
        progress: "62%",
        badges: [{ label: "MC-03 down", tone: "warn" }]
      }
    ]
  },
  {
    id: "dispatch",
    label: "Dispatch",
    count: 1,
    tickets: [
      {
        id: "dispatch-1",
        title: "SO-2026-0194",
        meta: "Packing + DC pending",
        progress: "Ready",
        badges: [{ label: "Vehicle assignment", tone: "info" }]
      }
    ]
  }
];

export const orderDeliveryKpis = [
  { label: "Open Orders", value: "28" },
  { label: "Overdue", value: "6" },
  { label: "Due in 7 days", value: "9" },
  { label: "Average Completion", value: "78%" },
  { label: "Critical Risks", value: "3" }
];

export const orderDeliveryRecords: OrderDeliveryRecord[] = [
  {
    id: "so-0189",
    salesOrder: "SO-2026-0189",
    customer: "Enkay Ozone",
    item: "FG-OZ-50 Tank Assembly",
    dueDate: "2026-03-05",
    dueHint: "Overdue by 2 days",
    priority: "High",
    completion: 62,
    status: "At Risk",
    blocker: "Supplier delay on RM-SS-SHEET",
    nextAction: "Escalate PO and reroute welding slot."
  },
  {
    id: "so-0194",
    salesOrder: "SO-2026-0194",
    customer: "BlueSky Industries",
    item: "FG-OZ-30 Tank Assembly",
    dueDate: "2026-03-12",
    dueHint: "7 days left",
    priority: "Medium",
    completion: 84,
    status: "Ready to Dispatch",
    blocker: "Dispatch pack and vehicle assignment pending",
    nextAction: "Print traveler + labels and confirm loading slot."
  },
  {
    id: "so-0191",
    salesOrder: "SO-2026-0191",
    customer: "Shree Ozone Systems",
    item: "WIP-OZG-MOD Module",
    dueDate: "2026-03-09",
    dueHint: "4 days left",
    priority: "Low",
    completion: 35,
    status: "At Risk",
    blocker: "BOQ approval and PR creation still pending",
    nextAction: "Approve BOQ recommendation and release procurement wave."
  }
];

export const stageWiseKpis = [
  { label: "Open Orders", value: "28" },
  { label: "Overdue", value: "6" },
  { label: "In Production", value: "14" },
  { label: "QC Pending", value: "5" },
  { label: "Ready to Dispatch", value: "3" }
];

export const stageWiseColumns: KanbanColumn[] = [
  {
    id: "so",
    label: "SO Confirmed",
    count: 4,
    tickets: [
      {
        id: "stage-so-1",
        title: "SO-2026-0191",
        meta: "Customer: Shree Ozone • Due 2026-03-09",
        progress: "35%",
        badges: [{ label: "BOQ approval", tone: "warn" }]
      }
    ]
  },
  {
    id: "boq",
    label: "BOQ Approved",
    count: 6,
    tickets: [
      {
        id: "stage-boq-1",
        title: "SO-2026-0194",
        meta: "Customer: BlueSky • Due 2026-03-12",
        progress: "84%",
        badges: [{ label: "On track", tone: "success" }]
      }
    ]
  },
  {
    id: "qc",
    label: "QC",
    count: 3,
    tickets: [
      {
        id: "stage-qc-1",
        title: "FG-OZ-50",
        meta: "Leak test queue • SO-2026-0189",
        progress: "Waiting",
        badges: [{ label: "Test bench queue", tone: "warn" }]
      }
    ]
  },
  {
    id: "dispatch",
    label: "Dispatch",
    count: 1,
    tickets: [
      {
        id: "stage-disp-1",
        title: "SO-2026-0194",
        meta: "Vehicle assignment pending",
        progress: "Ready",
        badges: [{ label: "DC pending", tone: "info" }]
      }
    ]
  }
];

export const bomRecords: BomRecord[] = [
  {
    id: "bom-1",
    parentItem: "OZ-50 Tank Assembly",
    itemCode: "FG-OZ-50",
    revision: "R3",
    effectiveFrom: "2026-01-10",
    status: "Approved",
    issueMethod: "Backflush",
    components: [
      { code: "WIP-OZG-MOD", name: "Ozone Generator Module", qtyPer: "1.000", recommendation: "MAKE" },
      { code: "RM-SS-SHEET", name: "Stainless Steel Sheet", qtyPer: "2.500", recommendation: "BUY" }
    ]
  },
  {
    id: "bom-2",
    parentItem: "Ozone Generator Module",
    itemCode: "WIP-OZG-MOD",
    revision: "R1",
    effectiveFrom: "2025-12-01",
    status: "Draft",
    issueMethod: "Manual",
    components: [
      { code: "RM-COP-COIL", name: "Copper Coil", qtyPer: "0.800", recommendation: "BUY" },
      { code: "RM-PL-STUD", name: "Stud Kit", qtyPer: "4.000", recommendation: "BUY" }
    ]
  },
  {
    id: "bom-3",
    parentItem: "Pressure Regulator Assembly",
    itemCode: "WIP-PR-ASM",
    revision: "R2",
    effectiveFrom: "2025-08-15",
    status: "Obsolete",
    issueMethod: "Manual",
    components: [{ code: "RM-BRASS-VALVE", name: "Valve Body", qtyPer: "1.000", recommendation: "BUY" }]
  }
];

export const workOrderRecords: WorkOrderRecord[] = [
  {
    id: "wo-2641",
    workOrderNo: "WO-02641",
    salesOrder: "SO-2026-0189",
    itemCode: "WIP-OZG-MOD",
    itemName: "Ozone Generator Module",
    progress: "8 / 10",
    planWindow: "Mar 01 → Mar 08",
    status: "In Process",
    materialsReserved: "72%",
    opsReady: "3 / 4",
    primaryActions: ["Open materials", "Review downtime", "Prepare receipt"]
  },
  {
    id: "wo-2642",
    workOrderNo: "WO-02642",
    salesOrder: "SO-2026-0189",
    itemCode: "FG-OZ-50",
    itemName: "OZ-50 Tank Assembly",
    progress: "0 / 10",
    planWindow: "Mar 05 → Mar 14",
    status: "Released",
    materialsReserved: "72%",
    opsReady: "3 / 4",
    primaryActions: ["Create job cards", "Issue material", "Print traveler"]
  },
  {
    id: "wo-2621",
    workOrderNo: "WO-02621",
    salesOrder: "SO-2026-0172",
    itemCode: "WIP-PR-ASM",
    itemName: "Pressure Regulator Assembly",
    progress: "12 / 12",
    planWindow: "Feb 10 → Feb 16",
    status: "Completed",
    materialsReserved: "100%",
    opsReady: "4 / 4",
    primaryActions: ["Review receipt", "Open audit trail"]
  }
];

export const jobCardRecords: JobCardRecord[] = [
  {
    id: "jc-90441",
    jobCardNo: "JC-90441",
    workOrderNo: "WO-02642",
    operation: "Cutting & Forming",
    machine: "MC-01 Laser",
    quantitySummary: "Planned 10",
    status: "Started",
    operator: "Ajay",
    events: [
      { id: "evt-1", title: "Started", meta: "10:12 AM • by Supervisor • sp_JobCard_Start" },
      { id: "evt-2", title: "Downtime logged", meta: "10:47 AM • 12 min • Reason: Power fluctuation" },
      { id: "evt-3", title: "Resume", meta: "11:02 AM • sp_JobCard_Resume" }
    ]
  },
  {
    id: "jc-90442",
    jobCardNo: "JC-90442",
    workOrderNo: "WO-02642",
    operation: "Welding",
    machine: "Unassigned",
    quantitySummary: "Planned 10",
    status: "Created",
    operator: "Pending",
    events: [{ id: "evt-4", title: "Created", meta: "Awaiting machine and operator assignment" }]
  },
  {
    id: "jc-90391",
    jobCardNo: "JC-90391",
    workOrderNo: "WO-02641",
    operation: "Testing",
    machine: "MC-03 Test Bench",
    quantitySummary: "Good 8 • Reject 1",
    status: "Paused",
    operator: "Kiran",
    events: [
      { id: "evt-5", title: "Started", meta: "08:20 AM • sp_JobCard_Start" },
      { id: "evt-6", title: "QC Hold", meta: "10:10 AM • Leak-test evidence missing" },
      { id: "evt-7", title: "Paused", meta: "10:15 AM • Waiting for calibration clearance" }
    ]
  }
];

export const machineLanes: Lane[] = [
  {
    id: "lane-1",
    machine: "MC-01 Laser Cutter",
    detail: "Type: Laser • Capacity: 1 shift",
    status: "Running",
    slots: [
      {
        id: "slot-1",
        title: "JC-90441 • Cutting & Forming",
        meta: "WO-02642 • FG-OZ-50 • Qty 10",
        start: "Start 10:12",
        end: "ETA 12:10",
        emphasis: "current",
        tags: [
          { label: "MAKE", tone: "info" },
          { label: "QC checkpoint", tone: "warn" }
        ]
      },
      {
        id: "slot-2",
        title: "JC-90458 • Drilling",
        meta: "WO-02642 • FG-OZ-50 • Qty 10",
        start: "Plan 12:15",
        end: "End 13:05",
        emphasis: "queued",
        tags: [{ label: "Queued", tone: "neutral" }]
      },
      {
        id: "slot-3",
        title: "JC-90460 • Edge finishing",
        meta: "WO-02645 • WIP-PR-ASM • Qty 12",
        start: "Plan 13:10",
        end: "End 14:05",
        emphasis: "blocked",
        tags: [{ label: "Material not issued", tone: "danger" }]
      }
    ]
  },
  {
    id: "lane-2",
    machine: "MC-02 Welding Station",
    detail: "Type: Weld • Capacity: 1 shift",
    status: "Idle",
    slots: [
      {
        id: "slot-4",
        title: "JC-90442 • Welding",
        meta: "WO-02642 • FG-OZ-50 • Qty 10",
        start: "Plan 14:15",
        end: "End 16:30",
        emphasis: "queued",
        tags: [
          { label: "Operator pending", tone: "warn" },
          { label: "Queued", tone: "neutral" }
        ]
      }
    ]
  },
  {
    id: "lane-3",
    machine: "MC-03 Test Bench",
    detail: "Type: Test Bench • Ozone output + leak test",
    status: "Down",
    slots: [
      {
        id: "slot-5",
        title: "JC-90391 • Testing",
        meta: "WO-02641 • WIP-OZG-MOD • Qty 10",
        start: "Blocked",
        end: "Reason: Calibration",
        emphasis: "blocked",
        tags: [{ label: "Downtime", tone: "danger" }]
      }
    ]
  }
];

export const occupancyColumns = [
  "Mar 05",
  "Mar 06",
  "Mar 07",
  "Mar 08",
  "Mar 09",
  "Mar 10",
  "Mar 11",
  "Mar 12",
  "Mar 13",
  "Mar 14",
  "Mar 15",
  "Mar 16",
  "Mar 17",
  "Mar 18"
];

export const occupancyRows: OccupancyRow[] = [
  {
    id: "occ-1",
    label: "MC-01 Laser Cutter",
    detail: "Type: Laser • Shift 1",
    cells: [
      { date: "2026-03-05", state: "occupied", title: "JC-90441", subtitle: "WO-02642 • Cutting" },
      { date: "2026-03-06", state: "occupied", title: "JC-90441", subtitle: "WO-02642 • Cutting" },
      { date: "2026-03-07", state: "occupied", title: "JC-90458", subtitle: "WO-02642 • Drilling" },
      { date: "2026-03-08", state: "free" },
      { date: "2026-03-09", state: "free" },
      { date: "2026-03-10", state: "occupied", title: "JC-90460", subtitle: "WO-02645 • Finish" },
      { date: "2026-03-11", state: "occupied", title: "JC-90460", subtitle: "WO-02645 • Finish" },
      { date: "2026-03-12", state: "free" },
      { date: "2026-03-13", state: "free" },
      { date: "2026-03-14", state: "free" },
      { date: "2026-03-15", state: "free" },
      { date: "2026-03-16", state: "free" },
      { date: "2026-03-17", state: "free" },
      { date: "2026-03-18", state: "free" }
    ]
  },
  {
    id: "occ-2",
    label: "MC-02 Welding Station",
    detail: "Type: Weld • Shift 1",
    cells: [
      { date: "2026-03-05", state: "free" },
      { date: "2026-03-06", state: "free" },
      { date: "2026-03-07", state: "occupied", title: "JC-90442", subtitle: "WO-02642 • Welding" },
      { date: "2026-03-08", state: "occupied", title: "JC-90442", subtitle: "WO-02642 • Welding" },
      { date: "2026-03-09", state: "occupied", title: "JC-90442", subtitle: "WO-02642 • Welding" },
      { date: "2026-03-10", state: "free" },
      { date: "2026-03-11", state: "free" },
      { date: "2026-03-12", state: "occupied", title: "JC-90411", subtitle: "WO-02610 • Repair" },
      { date: "2026-03-13", state: "free" },
      { date: "2026-03-14", state: "free" },
      { date: "2026-03-15", state: "free" },
      { date: "2026-03-16", state: "free" },
      { date: "2026-03-17", state: "free" },
      { date: "2026-03-18", state: "free" }
    ]
  },
  {
    id: "occ-3",
    label: "MC-03 Test Bench",
    detail: "Type: Test • Ozone output",
    cells: [
      { date: "2026-03-05", state: "down", title: "DOWN", subtitle: "Calibration" },
      { date: "2026-03-06", state: "down", title: "DOWN", subtitle: "Calibration" },
      { date: "2026-03-07", state: "down", title: "DOWN", subtitle: "Calibration" },
      { date: "2026-03-08", state: "free" },
      { date: "2026-03-09", state: "occupied", title: "JC-90391", subtitle: "WO-02641 • Testing" },
      { date: "2026-03-10", state: "occupied", title: "JC-90391", subtitle: "WO-02641 • Testing" },
      { date: "2026-03-11", state: "free" },
      { date: "2026-03-12", state: "free" },
      { date: "2026-03-13", state: "free" },
      { date: "2026-03-14", state: "free" },
      { date: "2026-03-15", state: "free" },
      { date: "2026-03-16", state: "free" },
      { date: "2026-03-17", state: "free" },
      { date: "2026-03-18", state: "free" }
    ]
  }
];

export const itemRecords: DirectoryRecord[] = [
  {
    id: "item-1",
    code: "FG-OZ-50",
    name: "OZ-50 Tank Assembly",
    owner: "Planning",
    status: "Active",
    detail: "Count + weight dual UOM, QC required, traveler print enabled."
  },
  {
    id: "item-2",
    code: "WIP-OZG-MOD",
    name: "Ozone Generator Module",
    owner: "Engineering",
    status: "Draft",
    detail: "Variant-aware module with routing dependency and manual issue method."
  },
  {
    id: "item-3",
    code: "RM-SS-SHEET",
    name: "Stainless Steel Sheet",
    owner: "Stores",
    status: "Active",
    detail: "Dimensional formula profile, barcode-ready, preferred supplier matrix maintained."
  }
];

export const customerRecords: DirectoryRecord[] = [
  {
    id: "cust-1",
    code: "CUST-ENKAY",
    name: "Enkay Ozone",
    owner: "Sales",
    status: "Active",
    detail: "Delivery risk tracked against SO commitments and dispatch readiness."
  },
  {
    id: "cust-2",
    code: "CUST-BLUESKY",
    name: "BlueSky Industries",
    owner: "Sales",
    status: "Active",
    detail: "Dispatch documentation and shipment proof required before release."
  }
];

export const supplierRecords: DirectoryRecord[] = [
  {
    id: "sup-1",
    code: "SUP-INOX",
    name: "Inox Metals",
    owner: "Purchase",
    status: "Preferred",
    detail: "Primary sheet supplier with lead-time and fill-rate tracking."
  },
  {
    id: "sup-2",
    code: "SUP-TESLAB",
    name: "TestLab Services",
    owner: "Purchase",
    status: "Approved",
    detail: "Outside processing vendor for calibration and leak-test fixtures."
  }
];

export const translationRecords: TranslationRecord[] = [
  {
    id: "tr-1",
    module: "Production",
    key: "production.receipt.create",
    enIn: "Create production receipt",
    hiIn: "उत्पादन रसीद बनाएँ",
    status: "Synced"
  },
  {
    id: "tr-2",
    module: "Planning",
    key: "planning.shortage.review",
    enIn: "Review shortage",
    hiIn: "कमी की समीक्षा करें",
    status: "Draft"
  },
  {
    id: "tr-3",
    module: "Platform",
    key: "platform.notification.markAll",
    enIn: "Mark all as read",
    hiIn: "सभी को पढ़ा हुआ चिह्नित करें",
    status: "Synced"
  }
];

export const reportTemplates: ReportTemplate[] = [
  {
    id: "traveler",
    label: "Work order traveler",
    format: "PDF",
    description: "Planner-friendly print pack for WO, routing, and material issue notes."
  },
  {
    id: "shortage",
    label: "Shortage export",
    format: "CSV",
    description: "CSV snapshot for BUY / MAKE / TRANSFER exception review."
  },
  {
    id: "dispatch-label",
    label: "Dispatch carton label",
    format: "Label",
    description: "Label layout for finished goods, shipment grouping, and customer references."
  },
  {
    id: "production-snapshot",
    label: "Production summary workbook",
    format: "Excel",
    description: "Excel-compatible handoff for management and dispatch reviews."
  }
];
