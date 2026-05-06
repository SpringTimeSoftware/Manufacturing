import type {
  ConflictResolutionTask,
  DeviceUtilityTask,
  DispatchProofTask,
  InventoryMovementTask,
  LocalizationOption,
  MachineTask,
  MaterialScanTask,
  MobileActionCard,
  MobileApproval,
  MobileContext,
  MobileJobCard,
  MobileNotification,
  OrderSnapshotTask,
  MobileSummaryTile,
  MobileTimelineEvent,
  NcrTask,
  OfflineQueueEntry,
  ProductionOutputTask,
  QualityTask,
  QuantityCapturePreset,
  RoleNavigationRule,
  ShiftHandoverTask,
  StageBoardColumn,
  MediaUploadTask
} from "./mobileTypes";

export const seededMobileContexts: MobileContext[] = [
  {
    companyId: 1,
    companyName: "STS Manufacturing",
    branchId: 10,
    branchName: "Ahmedabad Plant",
    warehouseLabel: "Main Stores / FG Dispatch"
  },
  {
    companyId: 1,
    companyName: "STS Manufacturing",
    branchId: 11,
    branchName: "Odhav Fabrication",
    warehouseLabel: "WIP Floor / QC Hold"
  }
];

export const seededOfflineQueue: OfflineQueueEntry[] = [
  {
    id: "queue-job-90441",
    module: "Job card",
    actionLabel: "Quantity capture",
    documentRef: "JC-90441",
    queuedOnLabel: "Today 09:21",
    status: "Pending",
    auditLabel: "Awaiting network sync"
  },
  {
    id: "queue-qc-0014",
    module: "Quality",
    actionLabel: "Checkpoint result",
    documentRef: "INSP-IP-2026-0014",
    queuedOnLabel: "Today 09:02",
    status: "Synced",
    auditLabel: "Synced with server"
  },
  {
    id: "queue-dispatch-photo",
    module: "Dispatch",
    actionLabel: "Loading proof",
    documentRef: "SHIP-2026-0029",
    queuedOnLabel: "Yesterday 18:40",
    status: "Failed",
    auditLabel: "Retry required"
  },
  {
    id: "queue-handover-photo",
    module: "Shift handover",
    actionLabel: "Photo evidence",
    documentRef: "SHIFT-A-2026-04-20",
    queuedOnLabel: "Today 13:55",
    status: "Queued",
    auditLabel: "Will sync after network returns"
  },
  {
    id: "queue-barcode-conflict",
    module: "Device utility",
    actionLabel: "Barcode scan replay",
    documentRef: "PKG-SHIP-0029-07",
    queuedOnLabel: "Today 14:08",
    status: "Conflict",
    auditLabel: "Server already scanned package"
  }
];

export const seededDashboardTiles: MobileSummaryTile[] = [
  { id: "tile-jobs", label: "Ready jobs", value: "4", hint: "2 due this shift", tone: "info" },
  { id: "tile-qc", label: "QC holds", value: "2", hint: "One needs NCR", tone: "warn" },
  { id: "tile-sync", label: "Offline queue", value: "3", hint: "1 retry required", tone: "danger" },
  { id: "tile-dispatch", label: "Proof pending", value: "1", hint: "SHIP-2026-0029", tone: "neutral" }
];

export const seededActionCards: MobileActionCard[] = [
  {
    id: "action-job",
    title: "Open my job cards",
    subtitle: "Start, pause, resume, or complete assigned work.",
    targetTab: "jobs",
    roleHint: "Operator / supervisor",
    tone: "info"
  },
  {
    id: "action-material",
    title: "Scan material",
    subtitle: "Issue to job card or return unused material.",
    targetTab: "materials",
    roleHint: "Storekeeper",
    tone: "success"
  },
  {
    id: "action-quality",
    title: "Capture QC",
    subtitle: "Record checkpoint results and NCR evidence.",
    targetTab: "quality",
    roleHint: "QC inspector",
    tone: "warn"
  },
  {
    id: "action-output",
    title: "Receive output",
    subtitle: "Queue production receipt, scrap, and rework updates.",
    targetTab: "output",
    roleHint: "Supervisor",
    tone: "neutral"
  },
  {
    id: "action-handover",
    title: "Prepare handover",
    subtitle: "Capture shift notes, unresolved issues, and proof media.",
    targetTab: "handover",
    roleHint: "Supervisor",
    tone: "warn"
  },
  {
    id: "action-dispatch",
    title: "Dispatch proof",
    subtitle: "Scan packed items and queue vehicle, seal, and loading proof.",
    targetTab: "dispatch",
    roleHint: "Dispatch",
    tone: "success"
  }
];

export const seededNotifications: MobileNotification[] = [
  {
    id: "notif-qc-hold",
    title: "QC hold applied",
    body: "Final inspection is waiting for leak-test evidence.",
    category: "Alert",
    documentRef: "INSP-FIN-2026-0019",
    createdLabel: "10 min ago",
    severity: "warn",
    actionLabel: "Open QC"
  },
  {
    id: "notif-machine-down",
    title: "Machine status escalated",
    body: "MC-03 Test Bench is down for calibration.",
    category: "Escalation",
    documentRef: "MC-03",
    createdLabel: "22 min ago",
    severity: "danger",
    actionLabel: "Open machine"
  },
  {
    id: "notif-sync",
    title: "Offline retry required",
    body: "Loading proof for SHIP-2026-0029 needs retry.",
    category: "Reminder",
    documentRef: "SHIP-2026-0029",
    createdLabel: "Yesterday",
    severity: "info",
    actionLabel: "Open sync"
  }
];

export const seededApprovals: MobileApproval[] = [
  {
    id: "approval-rework",
    referenceNo: "RW-2026-0009",
    title: "Approve rework release",
    summary: "NCR-2026-0018 requires rework loop release for FG-OZ-50.",
    submittedBy: "QC Inspector",
    dueLabel: "Due today",
    status: "Pending",
    priority: "High",
    auditActionLabel: "Approve / reject with remarks"
  },
  {
    id: "approval-material",
    referenceNo: "MI-2026-0044",
    title: "Approve extra material issue",
    summary: "Additional gasket kit requested against JC-90441.",
    submittedBy: "Storekeeper",
    dueLabel: "Due in 2h",
    status: "Escalated",
    priority: "Medium",
    auditActionLabel: "Supervisor decision required"
  }
];

export const seededJobCards: MobileJobCard[] = [
  {
    id: "job-90441",
    jobCardNo: "JC-90441",
    workOrderNo: "WO-2026-044",
    operationName: "Cutting and forming",
    machineLabel: "MC-01 Laser Cutter",
    itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
    plannedQty: 10,
    completedGoodQty: 6,
    completedRejectQty: 0,
    completedScrapQty: 1,
    status: "Running",
    dueLabel: "This shift",
    specSummary: "Use drawing OZ-50-ASM-A, first-piece dimensions already passed.",
    attachmentCount: 3
  },
  {
    id: "job-90391",
    jobCardNo: "JC-90391",
    workOrderNo: "WO-2026-044",
    operationName: "Leak test",
    machineLabel: "MC-03 Test Bench",
    itemLabel: "WIP-OZG-MOD / Generator module",
    plannedQty: 4,
    completedGoodQty: 0,
    completedRejectQty: 0,
    completedScrapQty: 0,
    status: "QC Hold",
    dueLabel: "Blocked",
    specSummary: "Hold until test bench calibration evidence is attached.",
    attachmentCount: 1
  }
];

export const seededTimeline: MobileTimelineEvent[] = [
  { id: "event-start", title: "Started", detail: "Machine MC-01 assigned", timeLabel: "08:55", tone: "success" },
  { id: "event-qc", title: "First piece passed", detail: "INSP-IP-2026-0014", timeLabel: "09:02", tone: "info" },
  { id: "event-qty", title: "Quantity queued", detail: "6 good / 1 scrap", timeLabel: "09:21", tone: "warn" }
];

export const seededQuantityPresets: QuantityCapturePreset[] = [
  { id: "qty-good", label: "Good quantity", quantity: "2", reasonCode: "OK", evidenceLabel: "No photo required" },
  { id: "qty-reject", label: "Reject quantity", quantity: "1", reasonCode: "DIM_FAIL", evidenceLabel: "Photo required" },
  { id: "qty-scrap", label: "Scrap quantity", quantity: "1", reasonCode: "CUTTING_SCRAP", evidenceLabel: "Photo optional" }
];

export const seededMaterialTasks: MaterialScanTask[] = [
  {
    id: "mat-issue-gasket",
    mode: "Issue",
    barcodeValue: "BC-GASKET-50-001",
    itemLabel: "RM-GASKET-50 / Seal gasket",
    sourceBin: "MAIN-STORES / A-01-04",
    targetDocument: "JC-90441",
    quantity: "2 EA",
    status: "Ready"
  },
  {
    id: "mat-return-kit",
    mode: "Return",
    barcodeValue: "BC-INSTALL-KIT-RET",
    itemLabel: "ACC-INSTALL-KIT / Install kit",
    sourceBin: "LINE-01 / RETURN-CAGE",
    targetDocument: "WO-2026-044",
    quantity: "1 KIT",
    status: "Queued"
  }
];

export const seededInventoryTasks: InventoryMovementTask[] = [
  {
    id: "inv-transfer-01",
    mode: "Transfer",
    itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
    fromLocation: "WIP-FLOOR / READY-01",
    toLocation: "FG-DISPATCH / FG-STAGE-02",
    scanValue: "SN-OZ50-0189-01",
    quantity: "1 EA",
    status: "Ready"
  },
  {
    id: "inv-putaway-01",
    mode: "Putaway",
    itemLabel: "RM-SS-SHEET / Stainless sheet",
    fromLocation: "RECEIVING / INWARD-01",
    toLocation: "MAIN-STORES / A-02-03",
    scanValue: "LOT-SS-2026-03A",
    quantity: "25 SHEET",
    status: "Queued"
  },
  {
    id: "inv-count-01",
    mode: "CycleCount",
    itemLabel: "RM-GASKET-50 / Seal gasket",
    fromLocation: "MAIN-STORES / A-01-04",
    toLocation: "Count sheet CC-2026-0031",
    scanValue: "BC-GASKET-50-001",
    quantity: "48 EA counted",
    status: "Recount"
  }
];

export const seededMachineTasks: MachineTask[] = [
  {
    id: "machine-mc01",
    machineLabel: "MC-01 Laser Cutter",
    status: "Running",
    activeJobCard: "JC-90441",
    reasonCode: "RUNNING",
    escalationLabel: "No escalation"
  },
  {
    id: "machine-mc03",
    machineLabel: "MC-03 Test Bench",
    status: "Down",
    activeJobCard: "JC-90391",
    reasonCode: "CALIBRATION_HOLD",
    escalationLabel: "Escalate to maintenance"
  }
];

export const seededQualityTasks: QualityTask[] = [
  {
    id: "qc-ip-0014",
    inspectionNo: "INSP-IP-2026-0014",
    checkpointLabel: "First-piece dimension",
    sourceDocument: "JC-90441",
    expectedValue: "As drawing",
    actualValue: "Within tolerance",
    result: "Pass",
    photoLabel: "Photo optional"
  },
  {
    id: "qc-fin-0019",
    inspectionNo: "INSP-FIN-2026-0019",
    checkpointLabel: "Leak test",
    sourceDocument: "JC-90391",
    expectedValue: "No pressure drop",
    actualValue: "Pending",
    result: "Pending",
    photoLabel: "Evidence required"
  }
];

export const seededNcrTasks: NcrTask[] = [
  {
    id: "ncr-0018",
    ncrNo: "NCR-2026-0018",
    sourceDocument: "INSP-FIN-2026-0019",
    disposition: "Rework",
    instruction: "Hold unit, replace gasket, retest leak path.",
    status: "Open"
  }
];

export const seededProductionOutputs: ProductionOutputTask[] = [
  {
    id: "receipt-0062",
    receiptNo: "PRD-RCPT-2026-0062",
    workOrderNo: "WO-2026-044",
    jobCardNo: "JC-90441",
    itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
    outputQty: "2 EA",
    catchWeightQty: "N/A",
    lotSerialLabel: "SN-OZ50-0189-01 to 02",
    status: "Draft"
  },
  {
    id: "receipt-scrap-0012",
    receiptNo: "SCRAP-2026-0012",
    workOrderNo: "WO-2026-044",
    jobCardNo: "JC-90441",
    itemLabel: "SCRAP-SS-CUT / Stainless offcut",
    outputQty: "3 KG",
    catchWeightQty: "3.2 KG",
    lotSerialLabel: "LOT-SCRAP-2026-03",
    status: "Queued"
  }
];

export const seededShiftHandovers: ShiftHandoverTask[] = [
  {
    id: "handover-shift-a",
    shiftLabel: "Shift A / Ahmedabad Plant",
    supervisorName: "Amit Supervisor",
    summary: "Cutting is ahead by 2 units; leak-test remains blocked on MC-03 calibration.",
    pendingIssueLabel: "1 QC hold, 1 machine downtime, 1 material retry",
    mediaCount: 4,
    nextOwner: "Shift B supervisor",
    status: "Queued"
  },
  {
    id: "handover-shift-b",
    shiftLabel: "Shift B / Odhav Fabrication",
    supervisorName: "Priya Supervisor",
    summary: "Welding lane has one fixture issue and two dispatch-ready cartons staged.",
    pendingIssueLabel: "2 open follow-ups",
    mediaCount: 2,
    nextOwner: "Plant head",
    status: "Draft"
  }
];

export const seededMediaUploads: MediaUploadTask[] = [
  {
    id: "media-handover-photo",
    sourceDocument: "SHIFT-A-2026-04-20",
    captureType: "Photo",
    fileLabel: "MC-03 calibration tag photo",
    noteLabel: "Attach before handover submit",
    status: "Queued",
    requiresNetwork: false
  },
  {
    id: "media-voice-note",
    sourceDocument: "JC-90441",
    captureType: "Voice",
    fileLabel: "Operator note, 00:42",
    noteLabel: "Transcription deferred to server",
    status: "Ready",
    requiresNetwork: false
  },
  {
    id: "media-dispatch-proof",
    sourceDocument: "SHIP-2026-0029",
    captureType: "Attachment",
    fileLabel: "Vehicle loading proof",
    noteLabel: "Retry required from failed queue item",
    status: "Failed",
    requiresNetwork: true
  }
];

export const seededDispatchProofTasks: DispatchProofTask[] = [
  {
    id: "dispatch-ship-0029",
    shipmentNo: "SHIP-2026-0029",
    customerName: "Apex Process Systems",
    vehicleRef: "GJ-01-TX-7734",
    sealNo: "SEAL-18422",
    packedItems: 8,
    scannedItems: 7,
    proofLabel: "Loading photo pending retry",
    status: "ProofQueued"
  },
  {
    id: "dispatch-ship-0031",
    shipmentNo: "SHIP-2026-0031",
    customerName: "Blue River Utilities",
    vehicleRef: "Dock assignment pending",
    sealNo: "Not sealed",
    packedItems: 4,
    scannedItems: 4,
    proofLabel: "Ready for final photo",
    status: "Ready"
  }
];

export const seededOrderSnapshots: OrderSnapshotTask[] = [
  {
    id: "order-so-2026-0108",
    orderNo: "SO-2026-0108",
    customerName: "Apex Process Systems",
    promisedLabel: "Promised Apr 24",
    completionPercent: 68,
    dispatchReadinessPercent: 45,
    riskStatus: "AtRisk",
    blockerLabel: "SupplierDelay + MachineDowntime"
  },
  {
    id: "order-so-2026-0112",
    orderNo: "SO-2026-0112",
    customerName: "Blue River Utilities",
    promisedLabel: "Promised Apr 27",
    completionPercent: 91,
    dispatchReadinessPercent: 82,
    riskStatus: "OnTrack",
    blockerLabel: "DispatchPending"
  }
];

export const seededStageBoardColumns: StageBoardColumn[] = [
  {
    id: "stage-planning",
    stageLabel: "Planning",
    countLabel: "2 active",
    tone: "info",
    cards: [
      {
        id: "stage-so-0109",
        documentNo: "SO-2026-0109",
        customerName: "Narmada Pumps",
        blockerLabel: "BOQ shortage review",
        daysInStage: 1,
        ownerRole: "Planning",
        statusLabel: "Needs action"
      }
    ]
  },
  {
    id: "stage-production",
    stageLabel: "Production",
    countLabel: "3 active",
    tone: "warn",
    cards: [
      {
        id: "stage-so-0108",
        documentNo: "SO-2026-0108",
        customerName: "Apex Process Systems",
        blockerLabel: "MC-03 downtime",
        daysInStage: 3,
        ownerRole: "Production",
        statusLabel: "Blocked"
      }
    ]
  },
  {
    id: "stage-dispatch",
    stageLabel: "Dispatch",
    countLabel: "1 ready",
    tone: "success",
    cards: [
      {
        id: "stage-so-0112",
        documentNo: "SO-2026-0112",
        customerName: "Blue River Utilities",
        blockerLabel: "Proof photo pending",
        daysInStage: 0,
        ownerRole: "Dispatch",
        statusLabel: "Ready"
      }
    ]
  }
];

export const seededDeviceUtilities: DeviceUtilityTask[] = [
  {
    id: "device-barcode",
    utilityName: "Barcode / QR scanner",
    capabilityStatus: "Available",
    actionLabel: "Scan package or material",
    lastUsedLabel: "Last scan 14:08",
    tone: "success"
  },
  {
    id: "device-camera",
    utilityName: "Camera proof capture",
    capabilityStatus: "NeedsPermission",
    actionLabel: "Request camera permission",
    lastUsedLabel: "Permission checked today",
    tone: "warn"
  },
  {
    id: "device-voice",
    utilityName: "Voice note attachment",
    capabilityStatus: "OfflineQueued",
    actionLabel: "Queue recording for upload",
    lastUsedLabel: "Voice note ready",
    tone: "info"
  }
];

export const seededConflictTasks: ConflictResolutionTask[] = [
  {
    id: "conflict-pkg-0029",
    documentRef: "PKG-SHIP-0029-07",
    localChangeLabel: "Device scan replay at 14:08",
    serverChangeLabel: "Package already scanned by dock tablet at 14:06",
    recommendedAction: "Keep server scan and add device note",
    status: "Conflict"
  },
  {
    id: "conflict-handover-90441",
    documentRef: "JC-90441",
    localChangeLabel: "6 good / 1 scrap queued",
    serverChangeLabel: "Supervisor adjusted scrap reason",
    recommendedAction: "Review before force-resync",
    status: "RetryScheduled"
  }
];

export const seededLocalizationOptions: LocalizationOption[] = [
  { code: "en-IN", label: "English (India)", status: "Active" },
  { code: "hi-IN", label: "Hindi", status: "Available" },
  { code: "gu-IN", label: "Gujarati", status: "Available" }
];

export const seededRoleNavigationRules: RoleNavigationRule[] = [
  {
    role: "ProductionSupervisor",
    defaultTab: "handover",
    primaryTabs: ["home", "jobs", "execute", "machine", "handover", "orders", "sync"]
  },
  {
    role: "MachineOperator",
    defaultTab: "jobs",
    primaryTabs: ["home", "jobs", "execute", "materials", "quality", "device", "sync"]
  },
  {
    role: "DispatchManager",
    defaultTab: "dispatch",
    primaryTabs: ["home", "dispatch", "orders", "device", "sync"]
  },
  {
    role: "PlantHead",
    defaultTab: "orders",
    primaryTabs: ["home", "orders", "machine", "quality", "handover", "sync"],
    hiddenReason: "Dense setup/admin screens remain web-only."
  }
];
