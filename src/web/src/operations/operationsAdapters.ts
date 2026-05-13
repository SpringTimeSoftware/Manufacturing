import type {
  AuthSessionResponse,
  CycleCountDto,
  CycleCountLineDto,
  DowntimeEventDto,
  JobCardDto,
  JobCardEventDto,
  JobCardSummaryDto,
  MachineBoardItem,
  QueryFilter,
  WorkOrderDto,
  WorkOrderMaterialReadinessDto,
  WorkOrderOperationDto,
  WorkOrderOperationReadinessDto,
  WorkOrderReadinessBlockerDto,
  WorkOrderReadinessDto,
  WorkOrderSummaryDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import { hasLiveSession, liveDataUnavailable } from "../api/liveData";
import type { MasterDataSource } from "../masters/masterDataAdapters";
import type { Lane, OccupancyRow } from "../ui/boards";

export interface CycleCountLineItem {
  id: string;
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  itemLabel: string;
  trackingLabel: string;
  binLabel: string;
  systemQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  status: string;
  remarks: string;
}

export interface CycleCountSetupItem {
  id: string;
  cycleCountId: number;
  companyId: number;
  branchId: number;
  warehouseId: number;
  countNo: string;
  warehouseLabel: string;
  countDate: string;
  countType: string;
  status: string;
  remarks: string;
  postedLabel: string;
  lineCount: number;
  varianceCount: number;
  absoluteVariance: number;
  source: MasterDataSource;
  lines: CycleCountLineItem[];
}

export interface WorkOrderMaterialLineItem {
  id: string;
  componentLabel: string;
  requiredQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
  holdQuantity: number;
}

export interface WorkOrderOperationLineItem {
  id: string;
  sequenceNo: number;
  operationLabel: string;
  workCenterLabel: string;
  plannedQuantity: number;
  completedQuantity: number;
  status: string;
  qcSignal: string;
  capacitySignal: string;
}

export interface WorkOrderSetupItem {
  id: string;
  workOrderId: number;
  workOrderNo: string;
  salesOrderLabel: string;
  itemLabel: string;
  plannedQuantity: number;
  completedQuantity: number;
  progressLabel: string;
  planWindow: string;
  status: string;
  releasedLabel: string;
  materialSummary: string;
  operationSummary: string;
  readinessSignal: string;
  source: MasterDataSource;
  primaryActions: string[];
  blockers: string[];
  materials: WorkOrderMaterialLineItem[];
  operations: WorkOrderOperationLineItem[];
}

export interface JobCardTimelineItem {
  id: string;
  title: string;
  meta: string;
}

export interface JobCardSetupItem {
  id: string;
  jobCardId: number;
  jobCardNo: string;
  workOrderLabel: string;
  operationLabel: string;
  assignedMachineId: number | null;
  assignedOperatorUserId: number | null;
  shiftId: number | null;
  machineLabel: string;
  operatorLabel: string;
  shiftLabel: string;
  quantitySummary: string;
  plannedQuantity: number;
  goodQuantity: number;
  rejectQuantity: number;
  scrapQuantity: number;
  downtimeMinutes: number;
  status: string;
  source: MasterDataSource;
  events: JobCardTimelineItem[];
  downtimes: DowntimeRegisterItem[];
}

export interface MachineBoardSetup {
  source: MasterDataSource;
  lanes: Lane[];
  occupancyColumns: string[];
  occupancyRows: OccupancyRow[];
}

export interface ShiftProductionItem {
  id: string;
  shiftLabel: string;
  productionDate: string;
  workOrderLabel: string;
  jobCardLabel: string;
  machineLabel: string;
  goodQuantity: number;
  rejectQuantity: number;
  scrapQuantity: number;
  downtimeMinutes: number;
  issueSummary: string;
  status: string;
  source: MasterDataSource;
}

export interface DowntimeRegisterItem {
  id: string;
  downtimeId: number;
  jobCardLabel: string;
  machineLabel: string;
  reasonCode: string;
  startOn: string;
  endOn: string;
  durationMinutes: number;
  status: string;
  remarks: string;
  source: MasterDataSource;
}

function matchesFilter(value: string, filter: QueryFilter) {
  const search = filter.search?.trim().toLowerCase();
  const status = filter.status?.trim().toLowerCase();
  const normalized = value.toLowerCase();
  const matchesSearch = !search || normalized.includes(search);
  const matchesStatus = !status || status === "all" || normalized.includes(status);

  return matchesSearch && matchesStatus;
}

function filterSeeded<TItem>(items: TItem[], filter: QueryFilter, project: (item: TItem) => string) {
  return items.filter((item) => matchesFilter(project(item), filter));
}

function dateLabel(value: string | null | undefined) {
  return value?.trim() ? value.slice(0, 10) : "Open";
}

function dateTimeLabel(value: string | null | undefined) {
  if (!value?.trim()) {
    return "Open";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)} UTC`;
}

function quantityLabel(done: number, planned: number) {
  return `${done} / ${planned}`;
}

function sourceDocumentLabel(id: number | null | undefined, fallback: string) {
  return id ? `${fallback} ${id}` : "Unlinked";
}

function itemLabel(itemId: number) {
  return `Item ${itemId}`;
}

function operationLabel(operationId: number) {
  return `Operation ${operationId}`;
}

function machineLabel(machineId: number | null | undefined) {
  return machineId ? `Machine ${machineId}` : "Unassigned";
}

function operatorLabel(userId: number | null | undefined) {
  return userId ? `Operator ${userId}` : "Unassigned";
}

function shiftLabel(shiftId: number | null | undefined) {
  return shiftId ? `Shift ${shiftId}` : "Unassigned";
}

function trackingLabel(lotId: number | null | undefined, serialId: number | null | undefined) {
  if (lotId && serialId) {
    return `Lot ${lotId} / Serial ${serialId}`;
  }

  if (lotId) {
    return `Lot ${lotId}`;
  }

  if (serialId) {
    return `Serial ${serialId}`;
  }

  return "Non-tracked";
}

function mapCycleCountLine(line: CycleCountLineDto): CycleCountLineItem {
  return {
    id: `cycle-count-line-${line.id}`,
    lineNo: line.lineNo,
    itemId: line.itemId,
    itemVariantId: line.itemVariantId,
    binId: line.binId,
    lotId: line.lotId,
    serialId: line.serialId,
    itemLabel: itemLabel(line.itemId),
    trackingLabel: trackingLabel(line.lotId, line.serialId),
    binLabel: line.binId ? `Bin ${line.binId}` : "No bin",
    systemQuantity: line.systemQuantity,
    countedQuantity: line.countedQuantity,
    varianceQuantity: line.varianceQuantity,
    status: line.status,
    remarks: line.remarks ?? "No remarks"
  };
}

function mapCycleCount(dto: CycleCountDto, source: MasterDataSource): CycleCountSetupItem {
  const lines = dto.lines.map(mapCycleCountLine);
  return {
    id: `cycle-count-${dto.id}`,
    cycleCountId: dto.id,
    companyId: dto.companyId,
    branchId: dto.branchId,
    warehouseId: dto.warehouseId,
    countNo: dto.countNo,
    warehouseLabel: `Warehouse ${dto.warehouseId}`,
    countDate: dateLabel(dto.countDate),
    countType: dto.countType,
    status: dto.status,
    remarks: dto.remarks ?? "No remarks",
    postedLabel: dto.postedOn ? dateTimeLabel(dto.postedOn) : "Not posted",
    lineCount: lines.length,
    varianceCount: lines.filter((line) => line.varianceQuantity !== 0).length,
    absoluteVariance: lines.reduce((total, line) => total + Math.abs(line.varianceQuantity), 0),
    source,
    lines
  };
}

function mapOperation(operation: WorkOrderOperationDto): WorkOrderOperationLineItem {
  return {
    id: `work-order-operation-${operation.id}`,
    sequenceNo: operation.sequenceNo,
    operationLabel: operationLabel(operation.operationId),
    workCenterLabel: operation.workCenterId ? `Work center ${operation.workCenterId}` : "Unassigned",
    plannedQuantity: operation.plannedQuantity,
    completedQuantity: operation.completedQuantity,
    status: operation.status,
    qcSignal: operation.requiresQcCheckpoint ? "QC checkpoint" : "No QC checkpoint",
    capacitySignal: "Readiness not loaded"
  };
}

function mapMaterialReadiness(line: WorkOrderMaterialReadinessDto): WorkOrderMaterialLineItem {
  return {
    id: `work-order-material-${line.componentItemId}`,
    componentLabel: itemLabel(line.componentItemId),
    requiredQuantity: line.requiredQuantity,
    reservedQuantity: line.reservedQuantity,
    availableQuantity: line.availableQuantity,
    shortageQuantity: line.shortageQuantity,
    holdQuantity: line.blockedQuantity + line.qcHoldQuantity
  };
}

function mapReadinessOperation(line: WorkOrderOperationReadinessDto): WorkOrderOperationLineItem {
  return {
    id: `work-order-readiness-operation-${line.sequenceNo}-${line.operationId}`,
    sequenceNo: line.sequenceNo,
    operationLabel: operationLabel(line.operationId),
    workCenterLabel: line.workCenterId ? `Work center ${line.workCenterId}` : "Unassigned",
    plannedQuantity: 0,
    completedQuantity: 0,
    status: line.status,
    qcSignal: line.routingOperationId ? `Routing op ${line.routingOperationId}` : "No routing link",
    capacitySignal: line.capacityReady ? "Capacity ready" : line.capacityMessage ?? "Capacity review"
  };
}

function mapWorkOrderSummary(dto: WorkOrderSummaryDto, source: MasterDataSource): WorkOrderSetupItem {
  const completedQuantity = dto.operationCount > 0 ? Math.round((dto.plannedQuantity * dto.completedOperationCount) / dto.operationCount) : 0;
  const operationsReady = `${dto.completedOperationCount} / ${dto.operationCount}`;

  return {
    id: `work-order-${dto.id}`,
    workOrderId: dto.id,
    workOrderNo: dto.workOrderNo,
    salesOrderLabel: sourceDocumentLabel(dto.salesOrderLineId, "SO line"),
    itemLabel: itemLabel(dto.itemId),
    plannedQuantity: dto.plannedQuantity,
    completedQuantity,
    progressLabel: quantityLabel(completedQuantity, dto.plannedQuantity),
    planWindow: `${dateLabel(dto.plannedStartDate)} to ${dateLabel(dto.plannedEndDate)}`,
    status: dto.status,
    releasedLabel: dto.releasedOn ? dateTimeLabel(dto.releasedOn) : "Not released",
    materialSummary: "Open readiness",
    operationSummary: operationsReady,
    readinessSignal: dto.status === "Released" || dto.status === "InProcess" ? "Ready for shop review" : "Readiness review",
    source,
    primaryActions: ["Open readiness", "Print traveler", "Review job cards"],
    blockers: [],
    materials: [],
    operations: [
      {
        id: `work-order-${dto.id}-summary-operations`,
        sequenceNo: 10,
        operationLabel: `${dto.completedOperationCount} of ${dto.operationCount} operations complete`,
        workCenterLabel: "See detail drawer",
        plannedQuantity: dto.plannedQuantity,
        completedQuantity,
        status: dto.status,
        qcSignal: "Detail pending",
        capacitySignal: "Detail pending"
      }
    ]
  };
}

function mapWorkOrderDetail(
  dto: WorkOrderDto,
  source: MasterDataSource,
  readiness?: WorkOrderReadinessDto
): WorkOrderSetupItem {
  const operations = readiness?.operationReadiness.map(mapReadinessOperation) ?? dto.operations.map(mapOperation);
  const materials = readiness?.materialReadiness.map(mapMaterialReadiness) ?? [];
  const blockers = readiness?.blockingReasons.map((blocker: WorkOrderReadinessBlockerDto) => `${blocker.code}: ${blocker.message}`) ?? [];
  const completedQuantity = dto.operations.length > 0
    ? Math.max(...dto.operations.map((operation) => operation.completedQuantity), 0)
    : 0;
  const readyChecks = [
    readiness?.engineeringReady ? "Engineering" : null,
    readiness?.materialReady ? "Materials" : null,
    readiness?.capacityReady ? "Capacity" : null,
    readiness?.workflowReady ? "Workflow" : null
  ].filter(Boolean).length;

  return {
    id: `work-order-${dto.id}`,
    workOrderId: dto.id,
    workOrderNo: dto.workOrderNo,
    salesOrderLabel: sourceDocumentLabel(dto.salesOrderLineId, "SO line"),
    itemLabel: itemLabel(dto.itemId),
    plannedQuantity: dto.plannedQuantity,
    completedQuantity,
    progressLabel: quantityLabel(completedQuantity, dto.plannedQuantity),
    planWindow: `${dateLabel(dto.plannedStartDate)} to ${dateLabel(dto.plannedEndDate)}`,
    status: dto.status,
    releasedLabel: dto.releasedOn ? dateTimeLabel(dto.releasedOn) : "Not released",
    materialSummary: materials.length > 0 ? `${materials.filter((line) => line.shortageQuantity === 0).length} / ${materials.length}` : "No material rows",
    operationSummary: `${dto.operations.filter((operation) => operation.status.toLowerCase().includes("complete")).length} / ${dto.operations.length}`,
    readinessSignal: readiness ? `${readyChecks} / 4 readiness checks` : "Readiness not loaded",
    source,
    primaryActions: readiness?.canRelease ? ["Release", "Print traveler", "Generate job cards"] : ["Review blockers", "Print traveler", "Open job cards"],
    blockers,
    materials,
    operations
  };
}

function mapJobCardSummary(dto: JobCardSummaryDto, source: MasterDataSource): JobCardSetupItem {
  return {
    id: `job-card-${dto.id}`,
    jobCardId: dto.id,
    jobCardNo: dto.jobCardNo,
    workOrderLabel: dto.workOrderNo ?? `WO ${dto.workOrderId}`,
    operationLabel: operationLabel(dto.operationId),
    assignedMachineId: dto.assignedMachineId,
    assignedOperatorUserId: dto.assignedOperatorUserId,
    shiftId: dto.shiftId,
    machineLabel: machineLabel(dto.assignedMachineId),
    operatorLabel: operatorLabel(dto.assignedOperatorUserId),
    shiftLabel: shiftLabel(dto.shiftId),
    quantitySummary: `Good ${dto.completedGoodQty} / Reject ${dto.completedRejectQty} / Scrap ${dto.completedScrapQty}`,
    plannedQuantity: dto.plannedQuantity,
    goodQuantity: dto.completedGoodQty,
    rejectQuantity: dto.completedRejectQty,
    scrapQuantity: dto.completedScrapQty,
    downtimeMinutes: 0,
    status: dto.status,
    source,
    events: [
      {
        id: `job-card-${dto.id}-summary-event`,
        title: dto.status,
        meta: `${dto.jobCardNo} current list status`
      }
    ],
    downtimes: []
  };
}

function mapJobCardEvent(event: JobCardEventDto): JobCardTimelineItem {
  const quantity = event.quantity !== null && event.quantity !== undefined ? ` Qty ${event.quantity}.` : "";
  const reason = event.reasonCode ? ` Reason ${event.reasonCode}.` : "";
  const remarks = event.remarks ? ` ${event.remarks}` : "";

  return {
    id: `job-card-event-${event.id}`,
    title: event.eventType,
    meta: `${dateTimeLabel(event.eventOn)}.${quantity}${reason}${remarks}`
  };
}

function mapDowntime(dto: DowntimeEventDto, source: MasterDataSource): DowntimeRegisterItem {
  return {
    id: `downtime-${dto.id}`,
    downtimeId: dto.id,
    jobCardLabel: `Job card ${dto.jobCardId}`,
    machineLabel: machineLabel(dto.machineId),
    reasonCode: dto.reasonCode,
    startOn: dateTimeLabel(dto.startOn),
    endOn: dateTimeLabel(dto.endOn),
    durationMinutes: dto.durationMinutes,
    status: dto.durationMinutes > 60 ? "Major" : "Logged",
    remarks: dto.remarks ?? "No remarks",
    source
  };
}

function mapJobCardDetail(dto: JobCardDto, source: MasterDataSource): JobCardSetupItem {
  const downtimes = dto.downtimes.map((event) => mapDowntime(event, source));
  return {
    id: `job-card-${dto.id}`,
    jobCardId: dto.id,
    jobCardNo: dto.jobCardNo,
    workOrderLabel: dto.workOrderNo ?? `WO ${dto.workOrderId}`,
    operationLabel: operationLabel(dto.operationId),
    assignedMachineId: dto.assignedMachineId,
    assignedOperatorUserId: dto.assignedOperatorUserId,
    shiftId: dto.shiftId,
    machineLabel: machineLabel(dto.assignedMachineId),
    operatorLabel: operatorLabel(dto.assignedOperatorUserId),
    shiftLabel: shiftLabel(dto.shiftId),
    quantitySummary: `Good ${dto.completedGoodQty} / Reject ${dto.completedRejectQty} / Scrap ${dto.completedScrapQty}`,
    plannedQuantity: dto.plannedQuantity,
    goodQuantity: dto.completedGoodQty,
    rejectQuantity: dto.completedRejectQty,
    scrapQuantity: dto.completedScrapQty,
    downtimeMinutes: downtimes.reduce((total, event) => total + event.durationMinutes, 0),
    status: dto.status,
    source,
    events: dto.events.map(mapJobCardEvent),
    downtimes
  };
}

function parseQueuedJobCards(value: string): Array<Record<string, unknown>> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null) : [];
  } catch {
    return [];
  }
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function mapMachineBoardItem(item: MachineBoardItem): Lane {
  const queued = parseQueuedJobCards(item.queuedJobCardsJson);
  const slots = [];

  if (item.activeJobCardNo) {
    slots.push({
      id: `machine-${item.machineId}-active`,
      title: `${item.activeJobCardNo} / Active`,
      meta: `${item.activeWorkOrderNo ?? "WO pending"} / ${item.itemCode ?? "Item pending"}`,
      start: item.plannedStartOn ? dateTimeLabel(item.plannedStartOn) : "Started",
      end: item.plannedEndOn ? dateTimeLabel(item.plannedEndOn) : "ETA open",
      emphasis: item.riskStatus?.toLowerCase().includes("risk") ? "blocked" as const : "current" as const,
      tags: [{ label: item.riskStatus ?? "Current", tone: item.riskStatus?.toLowerCase().includes("risk") ? "warn" as const : "success" as const }]
    });
  }

  for (const [index, entry] of queued.entries()) {
    slots.push({
      id: `machine-${item.machineId}-queue-${index}`,
      title: stringValue(entry.JobCardNo ?? entry.jobCardNo, `Queued job ${index + 1}`),
      meta: `${stringValue(entry.WorkOrderNo ?? entry.workOrderNo, "WO pending")} / ${stringValue(entry.ItemCode ?? entry.itemCode, "Item pending")}`,
      start: stringValue(entry.PlannedStartOn ?? entry.plannedStartOn, "Queued"),
      end: stringValue(entry.PlannedEndOn ?? entry.plannedEndOn, "ETA open"),
      emphasis: "queued" as const,
      tags: [{ label: stringValue(entry.RiskStatus ?? entry.riskStatus, "Queued"), tone: "info" as const }]
    });
  }

  if (slots.length === 0) {
    slots.push({
      id: `machine-${item.machineId}-free`,
      title: "No active job",
      meta: "Machine available for scheduling",
      start: "Free",
      end: "Open",
      emphasis: "queued" as const,
      tags: [{ label: "Available", tone: "success" as const }]
    });
  }

  const status = item.currentStatus.toLowerCase().includes("down")
    ? "Down"
    : item.activeJobCardNo
      ? "Running"
      : "Idle";

  return {
    id: `machine-lane-${item.machineId}`,
    machine: `${item.machineCode} ${item.machineName}`,
    detail: item.workCenterId ? `Work center ${item.workCenterId}` : "No work center",
    status,
    slots
  };
}

function buildCalendarColumns(dateFrom: string, days: number) {
  const start = new Date(`${dateFrom}T00:00:00Z`);
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    return day.toISOString().slice(5, 10);
  });
}

function buildOccupancyRows(lanes: Lane[], dateFrom: string, days: number): OccupancyRow[] {
  const start = new Date(`${dateFrom}T00:00:00Z`);
  return lanes.map((lane) => ({
    id: `occupancy-${lane.id}`,
    label: lane.machine,
    detail: lane.detail,
    cells: Array.from({ length: days }, (_, index) => {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + index);
      const hasBlocked = lane.slots.some((slot) => slot.emphasis === "blocked");
      const hasOccupied = lane.slots.some((slot) => slot.emphasis === "current" || slot.emphasis === "queued");
      const state = lane.status === "Down" || hasBlocked ? "down" : hasOccupied ? "occupied" : "free";
      return {
        date: day.toISOString().slice(0, 10),
        state,
        title: state === "free" ? undefined : lane.slots[0]?.title,
        subtitle: state === "free" ? undefined : lane.slots[0]?.meta
      };
    })
  }));
}

const seededCycleCounts: CycleCountSetupItem[] = [
  {
    id: "cycle-count-rm-main",
    cycleCountId: 6101,
    companyId: 1,
    branchId: 12,
    warehouseId: 201,
    countNo: "CC-2026-0031",
    warehouseLabel: "RM-MAIN",
    countDate: "2026-03-05",
    countType: "Cycle",
    status: "Draft",
    remarks: "Aisle A count sheet in progress",
    postedLabel: "Not posted",
    lineCount: 3,
    varianceCount: 2,
    absoluteVariance: 5,
    source: "Seeded",
    lines: [
      {
        id: "cycle-count-rm-main-line-1",
        lineNo: 10,
        itemId: 10002,
        itemVariantId: null,
        binId: 2001,
        lotId: 70001,
        serialId: null,
        itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
        trackingLabel: "LOT-SS-2026-03A",
        binLabel: "RM-A-01",
        systemQuantity: 48,
        countedQuantity: 46,
        varianceQuantity: -2,
        status: "Variance",
        remarks: "One sheet moved to cutting staging"
      },
      {
        id: "cycle-count-rm-main-line-2",
        lineNo: 20,
        itemId: 10003,
        itemVariantId: null,
        binId: 2004,
        lotId: null,
        serialId: null,
        itemLabel: "RM-GASKET-SET / Gasket Set",
        trackingLabel: "Non-tracked",
        binLabel: "RM-C-04",
        systemQuantity: 20,
        countedQuantity: 20,
        varianceQuantity: 0,
        status: "Matched",
        remarks: "Matched"
      },
      {
        id: "cycle-count-rm-main-line-3",
        lineNo: 30,
        itemId: 10004,
        itemVariantId: null,
        binId: 2005,
        lotId: 70002,
        serialId: null,
        itemLabel: "RM-VALVE-SET / Valve Set",
        trackingLabel: "LOT-VALVE-2026-02B",
        binLabel: "QC-CAGE-01",
        systemQuantity: 8,
        countedQuantity: 11,
        varianceQuantity: 3,
        status: "Variance",
        remarks: "QC hold tags duplicated"
      }
    ]
  }
];

const seededWorkOrders: WorkOrderSetupItem[] = [
  {
    id: "work-order-wo-2026-044",
    workOrderId: 4401,
    workOrderNo: "WO-2026-044",
    salesOrderLabel: "SO-2026-0189",
    itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
    plannedQuantity: 10,
    completedQuantity: 6,
    progressLabel: "6 / 10",
    planWindow: "2026-03-04 to 2026-03-12",
    status: "Released",
    releasedLabel: "2026-03-04 09:20 UTC",
    materialSummary: "2 / 3 ready",
    operationSummary: "2 / 4 complete",
    readinessSignal: "3 / 4 readiness checks",
    source: "Seeded",
    primaryActions: ["Review readiness", "Print traveler", "Generate job cards"],
    blockers: ["MAT_SHORTAGE: Stainless sheet shortage for final assembly"],
    materials: [
      {
        id: "wo-44-material-1",
        componentLabel: "RM-SS-SHEET / Stainless Steel Sheet",
        requiredQuantity: 25,
        reservedQuantity: 21,
        availableQuantity: 17,
        shortageQuantity: 4,
        holdQuantity: 0
      },
      {
        id: "wo-44-material-2",
        componentLabel: "RM-GASKET-SET / Gasket Set",
        requiredQuantity: 10,
        reservedQuantity: 10,
        availableQuantity: 20,
        shortageQuantity: 0,
        holdQuantity: 0
      }
    ],
    operations: [
      {
        id: "wo-44-op-10",
        sequenceNo: 10,
        operationLabel: "Cutting and forming",
        workCenterLabel: "Laser cell",
        plannedQuantity: 10,
        completedQuantity: 10,
        status: "Completed",
        qcSignal: "No QC checkpoint",
        capacitySignal: "Capacity ready"
      },
      {
        id: "wo-44-op-20",
        sequenceNo: 20,
        operationLabel: "Welding",
        workCenterLabel: "Welding bay",
        plannedQuantity: 10,
        completedQuantity: 6,
        status: "InProcess",
        qcSignal: "QC checkpoint",
        capacitySignal: "Operator pending"
      }
    ]
  },
  {
    id: "work-order-wo-2026-047",
    workOrderId: 4701,
    workOrderNo: "WO-2026-047",
    salesOrderLabel: "SO-2026-0194",
    itemLabel: "WIP-OZG-MOD / Ozone Generator Module",
    plannedQuantity: 8,
    completedQuantity: 2,
    progressLabel: "2 / 8",
    planWindow: "2026-03-06 to 2026-03-14",
    status: "Planned",
    releasedLabel: "Not released",
    materialSummary: "1 / 2 ready",
    operationSummary: "0 / 3 complete",
    readinessSignal: "Release blockers",
    source: "Seeded",
    primaryActions: ["Review blockers", "Print draft traveler", "Open materials"],
    blockers: ["CAPACITY_REVIEW: Test bench slot not confirmed"],
    materials: [],
    operations: []
  }
];

const seededDowntime: DowntimeRegisterItem[] = [
  {
    id: "downtime-jc-90441-power",
    downtimeId: 9101,
    jobCardLabel: "JC-90441",
    machineLabel: "MC-01 Laser Cutter",
    reasonCode: "POWER_FLUCTUATION",
    startOn: "2026-03-05 10:47 UTC",
    endOn: "2026-03-05 10:59 UTC",
    durationMinutes: 12,
    status: "Logged",
    remarks: "Recovered after maintenance reset",
    source: "Seeded"
  },
  {
    id: "downtime-jc-90391-calibration",
    downtimeId: 9102,
    jobCardLabel: "JC-90391",
    machineLabel: "MC-03 Test Bench",
    reasonCode: "CALIBRATION_HOLD",
    startOn: "2026-03-05 10:15 UTC",
    endOn: "2026-03-05 11:45 UTC",
    durationMinutes: 90,
    status: "Major",
    remarks: "QC calibration evidence pending",
    source: "Seeded"
  }
];

const seededJobCards: JobCardSetupItem[] = [
  {
    id: "job-card-jc-90441",
    jobCardId: 90441,
    jobCardNo: "JC-90441",
    workOrderLabel: "WO-2026-044",
    operationLabel: "Cutting and forming",
    assignedMachineId: 1,
    assignedOperatorUserId: 101,
    shiftId: 1,
    machineLabel: "MC-01 Laser Cutter",
    operatorLabel: "Ajay",
    shiftLabel: "Shift A",
    quantitySummary: "Good 6 / Reject 1 / Scrap 0",
    plannedQuantity: 10,
    goodQuantity: 6,
    rejectQuantity: 1,
    scrapQuantity: 0,
    downtimeMinutes: 12,
    status: "Started",
    source: "Seeded",
    events: [
      { id: "jc-90441-event-1", title: "Started", meta: "2026-03-05 10:12 UTC. Supervisor start." },
      { id: "jc-90441-event-2", title: "Downtime logged", meta: "2026-03-05 10:47 UTC. Reason POWER_FLUCTUATION." },
      { id: "jc-90441-event-3", title: "Quantity logged", meta: "2026-03-05 11:20 UTC. Good 6, reject 1." }
    ],
    downtimes: [seededDowntime[0]]
  },
  {
    id: "job-card-jc-90391",
    jobCardId: 90391,
    jobCardNo: "JC-90391",
    workOrderLabel: "WO-2026-044",
    operationLabel: "Testing",
    assignedMachineId: 3,
    assignedOperatorUserId: 102,
    shiftId: 1,
    machineLabel: "MC-03 Test Bench",
    operatorLabel: "Kiran",
    shiftLabel: "Shift A",
    quantitySummary: "Good 2 / Reject 0 / Scrap 1",
    plannedQuantity: 8,
    goodQuantity: 2,
    rejectQuantity: 0,
    scrapQuantity: 1,
    downtimeMinutes: 90,
    status: "Paused",
    source: "Seeded",
    events: [
      { id: "jc-90391-event-1", title: "Started", meta: "2026-03-05 08:20 UTC. Test bench started." },
      { id: "jc-90391-event-2", title: "Paused", meta: "2026-03-05 10:15 UTC. Calibration hold." }
    ],
    downtimes: [seededDowntime[1]]
  }
];

const seededLanes: Lane[] = [
  {
    id: "lane-mc-01",
    machine: "MC-01 Laser Cutter",
    detail: "Laser cell / Shift A",
    status: "Running",
    slots: [
      {
        id: "slot-jc-90441",
        title: "JC-90441 / Cutting and forming",
        meta: "WO-2026-044 / FG-OZ-50 / Qty 10",
        start: "10:12",
        end: "ETA 12:10",
        emphasis: "current",
        tags: [{ label: "Current", tone: "success" }]
      },
      {
        id: "slot-jc-90458",
        title: "JC-90458 / Drilling",
        meta: "WO-2026-044 / FG-OZ-50 / Qty 10",
        start: "12:15",
        end: "13:05",
        emphasis: "queued",
        tags: [{ label: "Queued", tone: "info" }]
      }
    ]
  },
  {
    id: "lane-mc-03",
    machine: "MC-03 Test Bench",
    detail: "Final test / Calibration required",
    status: "Down",
    slots: [
      {
        id: "slot-jc-90391",
        title: "JC-90391 / Testing",
        meta: "WO-2026-044 / WIP-OZG-MOD / Qty 8",
        start: "Blocked",
        end: "Calibration",
        emphasis: "blocked",
        tags: [{ label: "Downtime", tone: "danger" }]
      }
    ]
  }
];

const seededOccupancyColumns = ["03-05", "03-06", "03-07", "03-08", "03-09", "03-10", "03-11"];

const seededOccupancyRows: OccupancyRow[] = [
  {
    id: "occupancy-mc-01",
    label: "MC-01 Laser Cutter",
    detail: "Laser cell / Shift A",
    cells: [
      { date: "2026-03-05", state: "occupied", title: "JC-90441", subtitle: "WO-2026-044 / Cutting" },
      { date: "2026-03-06", state: "occupied", title: "JC-90458", subtitle: "WO-2026-044 / Drilling" },
      { date: "2026-03-07", state: "free" },
      { date: "2026-03-08", state: "free" },
      { date: "2026-03-09", state: "occupied", title: "JC-90460", subtitle: "WO-2026-047 / Finish" },
      { date: "2026-03-10", state: "occupied", title: "JC-90460", subtitle: "WO-2026-047 / Finish" },
      { date: "2026-03-11", state: "free" }
    ]
  },
  {
    id: "occupancy-mc-03",
    label: "MC-03 Test Bench",
    detail: "Final test / Calibration required",
    cells: [
      { date: "2026-03-05", state: "down", title: "DOWN", subtitle: "Calibration" },
      { date: "2026-03-06", state: "down", title: "DOWN", subtitle: "Calibration" },
      { date: "2026-03-07", state: "free" },
      { date: "2026-03-08", state: "free" },
      { date: "2026-03-09", state: "occupied", title: "JC-90391", subtitle: "WO-2026-044 / Testing" },
      { date: "2026-03-10", state: "occupied", title: "JC-90391", subtitle: "WO-2026-044 / Testing" },
      { date: "2026-03-11", state: "free" }
    ]
  }
];

const seededShiftProduction: ShiftProductionItem[] = [
  {
    id: "shift-prod-a-2026-03-05",
    shiftLabel: "Shift A",
    productionDate: "2026-03-05",
    workOrderLabel: "WO-2026-044",
    jobCardLabel: "JC-90441",
    machineLabel: "MC-01 Laser Cutter",
    goodQuantity: 6,
    rejectQuantity: 1,
    scrapQuantity: 0,
    downtimeMinutes: 12,
    issueSummary: "Power fluctuation recovered; reject pending QC review",
    status: "Submitted",
    source: "Deferred"
  },
  {
    id: "shift-prod-a-2026-03-05-test",
    shiftLabel: "Shift A",
    productionDate: "2026-03-05",
    workOrderLabel: "WO-2026-044",
    jobCardLabel: "JC-90391",
    machineLabel: "MC-03 Test Bench",
    goodQuantity: 2,
    rejectQuantity: 0,
    scrapQuantity: 1,
    downtimeMinutes: 90,
    issueSummary: "Calibration hold blocks completion",
    status: "Open",
    source: "Deferred"
  }
];

export async function listCycleCountSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<CycleCountSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededCycleCounts, filter, (item) => `${item.countNo} ${item.warehouseLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.inventory.cycleCounts(filter);
    return response.items.map((item) => mapCycleCount(item, "Live"));
  } catch {
    throw liveDataUnavailable("Cycle count");
  }
}

export async function listWorkOrderSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<WorkOrderSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededWorkOrders, filter, (item) => `${item.workOrderNo} ${item.salesOrderLabel} ${item.itemLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.production.workOrders(filter);
    return response.items.map((item) => mapWorkOrderSummary(item, "Live"));
  } catch {
    throw liveDataUnavailable("Work order");
  }
}

export async function getWorkOrderDetailSetup(
  session: AuthSessionResponse | null | undefined,
  fallback: WorkOrderSetupItem
): Promise<WorkOrderSetupItem> {
  if (!hasLiveSession(session)) {
    return seededWorkOrders.find((item) => item.workOrderId === fallback.workOrderId) ?? fallback;
  }

  try {
    const [detail, readiness] = await Promise.all([
      apiClient.production.workOrder(fallback.workOrderId),
      apiClient.production.workOrderReadiness(fallback.workOrderId).catch(() => undefined)
    ]);
    return mapWorkOrderDetail(detail, "Live", readiness);
  } catch {
    throw liveDataUnavailable("Work order detail");
  }
}

export async function listJobCardSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<JobCardSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededJobCards, filter, (item) => `${item.jobCardNo} ${item.workOrderLabel} ${item.machineLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.production.jobCards(filter);
    return response.items.map((item) => mapJobCardSummary(item, "Live"));
  } catch {
    throw liveDataUnavailable("Job card");
  }
}

export async function getJobCardDetailSetup(
  session: AuthSessionResponse | null | undefined,
  fallback: JobCardSetupItem
): Promise<JobCardSetupItem> {
  if (!hasLiveSession(session)) {
    return seededJobCards.find((item) => item.jobCardId === fallback.jobCardId) ?? fallback;
  }

  try {
    const response = await apiClient.production.jobCard(fallback.jobCardId);
    return mapJobCardDetail(response, "Live");
  } catch {
    throw liveDataUnavailable("Job card detail");
  }
}

export async function getMachineBoardSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<MachineBoardSetup> {
  const dateFrom = typeof filter.dateFrom === "string" ? filter.dateFrom.slice(0, 10) : "2026-03-05";
  const dateTo = typeof filter.dateTo === "string" ? filter.dateTo.slice(0, 10) : "2026-03-11";

  if (!hasLiveSession(session)) {
    return {
      source: "Seeded",
      lanes: seededLanes,
      occupancyColumns: seededOccupancyColumns,
      occupancyRows: seededOccupancyRows
    };
  }

  try {
    const items = await apiClient.production.machineBoard({ ...filter, dateFrom, dateTo });
    const lanes = items.map(mapMachineBoardItem);
    return {
      source: "Live",
      lanes,
      occupancyColumns: buildCalendarColumns(dateFrom, 7),
      occupancyRows: buildOccupancyRows(lanes, dateFrom, 7)
    };
  } catch {
    throw liveDataUnavailable("Machine board");
  }
}

export async function listShiftProductionSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<ShiftProductionItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededShiftProduction, filter, (item) => `${item.shiftLabel} ${item.workOrderLabel} ${item.jobCardLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.production.jobCards(filter);
    return response.items.map((item) => ({
      id: `shift-production-${item.id}`,
      shiftLabel: shiftLabel(item.shiftId),
      productionDate: dateLabel(filter.dateFrom as string | undefined) === "Open" ? "Current shift" : dateLabel(filter.dateFrom as string | undefined),
      workOrderLabel: item.workOrderNo ?? `WO ${item.workOrderId}`,
      jobCardLabel: item.jobCardNo,
      machineLabel: machineLabel(item.assignedMachineId),
      goodQuantity: item.completedGoodQty,
      rejectQuantity: item.completedRejectQty,
      scrapQuantity: item.completedScrapQty,
      downtimeMinutes: 0,
      issueSummary: "Job-card-backed shift summary pending supervisor confirmation.",
      status: item.status,
      source: "Live" as MasterDataSource
    }));
  } catch {
    throw liveDataUnavailable("Shift production");
  }
}

export async function listDowntimeSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<DowntimeRegisterItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededDowntime, filter, (item) => `${item.jobCardLabel} ${item.machineLabel} ${item.reasonCode} ${item.status}`);
  }

  try {
    const response = await apiClient.production.downtime(filter);
    return response.items.map((item) => mapDowntime(item, "Live"));
  } catch {
    throw liveDataUnavailable("Downtime");
  }
}
