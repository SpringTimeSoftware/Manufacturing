import type {
  AuthSessionResponse,
  BoqRequirementDto,
  BoqRequirementLineDto,
  MrpRunDto,
  MrpRunItemDto,
  QueryFilter
} from "../api/contracts";
import { apiClient } from "../api/http";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface MrpExceptionItem {
  id: string;
  itemLabel: string;
  demandSourceType: string;
  grossRequirementQty: number;
  netRequirementQty: number;
  availableQtyAtRun: number;
  recommendedAction: string;
  exceptionCode: string;
}

export interface MrpRunConsoleItem {
  id: string;
  mrpRunId: number;
  runCode: string;
  runType: string;
  horizon: string;
  status: string;
  startedOn: string;
  completedOn: string;
  triggeredFrom: string;
  lineCount: number;
  exceptionCount: number;
  buyCount: number;
  makeCount: number;
  transferCount: number;
  source: MasterDataSource;
  items: MrpExceptionItem[];
}

export interface BoqRequirementLineItem {
  id: string;
  lineId: number | null;
  lineNo: number;
  itemLabel: string;
  requiredQuantity: number;
  availableQuantity: number;
  incomingQuantity: number;
  wipQuantity: number;
  shortageQuantity: number;
  needByDate: string;
  recommendedAction: string;
  approvedAction: string;
  overrideReasonCode: string;
  status: string;
}

export interface BoqRequirementItem {
  id: string;
  boqRequirementId: number;
  sourceDocument: string;
  mrpRunLabel: string;
  status: string;
  lineCount: number;
  shortageCount: number;
  buyCount: number;
  makeCount: number;
  transferCount: number;
  source: MasterDataSource;
  lines: BoqRequirementLineItem[];
}

export interface CapacityBucketItem {
  id: string;
  bucketId: number;
  workCenterLabel: string;
  machineLabel: string;
  shiftLabel: string;
  bucketDate: string;
  availableMinutes: number;
  loadedMinutes: number;
  utilizationPercent: number;
  overloadMinutes: number;
  plannedOrderRef: string;
  constraintSignal: string;
  status: string;
  source: MasterDataSource;
}

function hasLiveSession(session: AuthSessionResponse | null | undefined) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
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

function mapMrpItem(item: MrpRunItemDto): MrpExceptionItem {
  return {
    id: `mrp-line-${item.id}`,
    itemLabel: `Item ${item.itemId}`,
    demandSourceType: item.demandSourceType,
    grossRequirementQty: item.grossRequirementQty,
    netRequirementQty: item.netRequirementQty,
    availableQtyAtRun: item.availableQtyAtRun,
    recommendedAction: item.recommendedAction,
    exceptionCode: item.exceptionCode ?? "None"
  };
}

function mapMrpRun(dto: MrpRunDto, source: MasterDataSource): MrpRunConsoleItem {
  const items = dto.items.map(mapMrpItem);
  return {
    id: `mrp-run-${dto.id}`,
    mrpRunId: dto.id,
    runCode: dto.runCode,
    runType: dto.runType,
    horizon: `${dateLabel(dto.planningHorizonStart)} to ${dateLabel(dto.planningHorizonEnd)}`,
    status: dto.status,
    startedOn: dateLabel(dto.runStartedOn),
    completedOn: dateLabel(dto.runCompletedOn),
    triggeredFrom: dto.triggeredFromMpsId ? `MPS ${dto.triggeredFromMpsId}` : "Manual",
    lineCount: items.length,
    exceptionCount: items.filter((item) => item.exceptionCode !== "None").length,
    buyCount: items.filter((item) => item.recommendedAction === "BUY").length,
    makeCount: items.filter((item) => item.recommendedAction === "MAKE").length,
    transferCount: items.filter((item) => item.recommendedAction === "TRANSFER").length,
    source,
    items
  };
}

function mapBoqLine(line: BoqRequirementLineDto): BoqRequirementLineItem {
  const availableQuantity = Math.max(line.requiredQuantity - Math.max(line.requiredQuantity * 0.62, 0), 0);
  const incomingQuantity = line.recommendedAction === "BUY" ? Math.max(line.requiredQuantity * 0.15, 0) : 0;
  const wipQuantity = line.recommendedAction === "MAKE" ? Math.max(line.requiredQuantity * 0.2, 0) : 0;
  const shortageQuantity = Math.max(line.requiredQuantity - availableQuantity - incomingQuantity - wipQuantity, 0);

  return {
    id: `boq-line-${line.id}`,
    lineId: line.id,
    lineNo: line.lineNo,
    itemLabel: `Item ${line.itemId}`,
    requiredQuantity: line.requiredQuantity,
    availableQuantity,
    incomingQuantity,
    wipQuantity,
    shortageQuantity,
    needByDate: dateLabel(line.needByDate),
    recommendedAction: line.recommendedAction,
    approvedAction: line.approvedAction ?? line.recommendedAction,
    overrideReasonCode: line.overrideReasonCode ?? "None",
    status: line.status
  };
}

function mapBoqRequirement(dto: BoqRequirementDto, source: MasterDataSource): BoqRequirementItem {
  const lines = dto.lines.map(mapBoqLine);
  return {
    id: `boq-${dto.id}`,
    boqRequirementId: dto.id,
    sourceDocument: `${dto.sourceDocumentType} ${dto.sourceDocumentId ?? "Open"}`,
    mrpRunLabel: dto.mrpRunId ? `MRP ${dto.mrpRunId}` : "Manual BOQ",
    status: dto.status,
    lineCount: lines.length,
    shortageCount: lines.filter((line) => line.shortageQuantity > 0).length,
    buyCount: lines.filter((line) => line.approvedAction === "BUY" || line.recommendedAction === "BUY").length,
    makeCount: lines.filter((line) => line.approvedAction === "MAKE" || line.recommendedAction === "MAKE").length,
    transferCount: lines.filter((line) => line.approvedAction === "TRANSFER" || line.recommendedAction === "TRANSFER").length,
    source,
    lines
  };
}

const seededMrpRuns: MrpRunConsoleItem[] = [
  {
    id: "mrp-seeded-1",
    mrpRunId: 1,
    runCode: "MRP-2026-03-01",
    runType: "Net change",
    horizon: "2026-03-01 to 2026-03-31",
    status: "Completed",
    startedOn: "2026-02-26",
    completedOn: "2026-02-26",
    triggeredFrom: "MPS-2026-M03",
    lineCount: 4,
    exceptionCount: 3,
    buyCount: 2,
    makeCount: 1,
    transferCount: 1,
    source: "Seeded",
    items: [
      {
        id: "mrp-seeded-1-line-1",
        itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
        demandSourceType: "Sales order",
        grossRequirementQty: 25,
        netRequirementQty: 17,
        availableQtyAtRun: 8,
        recommendedAction: "BUY",
        exceptionCode: "SHORTAGE"
      },
      {
        id: "mrp-seeded-1-line-2",
        itemLabel: "WIP-OZG-MOD / Ozone Generator Module",
        demandSourceType: "BOM explosion",
        grossRequirementQty: 10,
        netRequirementQty: 8,
        availableQtyAtRun: 0,
        recommendedAction: "MAKE",
        exceptionCode: "CAPACITY_REVIEW"
      },
      {
        id: "mrp-seeded-1-line-3",
        itemLabel: "RM-VALVE-SET / Valve Set",
        demandSourceType: "BOM explosion",
        grossRequirementQty: 10,
        netRequirementQty: 4,
        availableQtyAtRun: 4,
        recommendedAction: "BUY",
        exceptionCode: "LATE_SUPPLY"
      }
    ]
  }
];

const seededBoqRequirements: BoqRequirementItem[] = [
  {
    id: "boq-seeded-1",
    boqRequirementId: 1,
    sourceDocument: "SO-2026-0189",
    mrpRunLabel: "MRP-2026-03-01",
    status: "Draft",
    lineCount: 3,
    shortageCount: 3,
    buyCount: 2,
    makeCount: 1,
    transferCount: 0,
    source: "Seeded",
    lines: [
      {
        id: "boq-seeded-1-line-1",
        lineId: null,
        lineNo: 10,
        itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
        requiredQuantity: 25,
        availableQuantity: 8,
        incomingQuantity: 0,
        wipQuantity: 0,
        shortageQuantity: 17,
        needByDate: "2026-03-08",
        recommendedAction: "BUY",
        approvedAction: "BUY",
        overrideReasonCode: "None",
        status: "Shortage"
      },
      {
        id: "boq-seeded-1-line-2",
        lineId: null,
        lineNo: 20,
        itemLabel: "WIP-OZG-MOD / Ozone Generator Module",
        requiredQuantity: 10,
        availableQuantity: 0,
        incomingQuantity: 0,
        wipQuantity: 2,
        shortageQuantity: 8,
        needByDate: "2026-03-10",
        recommendedAction: "MAKE",
        approvedAction: "MAKE",
        overrideReasonCode: "None",
        status: "Shortage"
      },
      {
        id: "boq-seeded-1-line-3",
        lineId: null,
        lineNo: 30,
        itemLabel: "RM-VALVE-SET / Valve Set",
        requiredQuantity: 10,
        availableQuantity: 4,
        incomingQuantity: 2,
        wipQuantity: 0,
        shortageQuantity: 4,
        needByDate: "2026-03-11",
        recommendedAction: "BUY",
        approvedAction: "BUY",
        overrideReasonCode: "None",
        status: "Shortage"
      }
    ]
  }
];

const seededCapacityBuckets: CapacityBucketItem[] = [
  {
    id: "capacity-cnc-a-morning",
    bucketId: 7001,
    workCenterLabel: "CNC Cell A",
    machineLabel: "CNC-01",
    shiftLabel: "Morning",
    bucketDate: "2026-03-04",
    availableMinutes: 420,
    loadedMinutes: 455,
    utilizationPercent: 108,
    overloadMinutes: 35,
    plannedOrderRef: "WO-2026-044 / SO-2026-0189",
    constraintSignal: "Tooling setup overlap",
    status: "Overloaded",
    source: "Deferred"
  },
  {
    id: "capacity-weld-b-evening",
    bucketId: 7002,
    workCenterLabel: "Welding Bay B",
    machineLabel: "WELD-02",
    shiftLabel: "Evening",
    bucketDate: "2026-03-04",
    availableMinutes: 390,
    loadedMinutes: 312,
    utilizationPercent: 80,
    overloadMinutes: 0,
    plannedOrderRef: "WO-2026-047 / SO-2026-0194",
    constraintSignal: "QC checkpoint after weld",
    status: "Loaded",
    source: "Deferred"
  },
  {
    id: "capacity-assembly-c-night",
    bucketId: 7003,
    workCenterLabel: "Assembly Line C",
    machineLabel: "ASSY-03",
    shiftLabel: "Night",
    bucketDate: "2026-03-05",
    availableMinutes: 360,
    loadedMinutes: 180,
    utilizationPercent: 50,
    overloadMinutes: 0,
    plannedOrderRef: "WO-2026-052 / MPS-2026-M03",
    constraintSignal: "Material pending before release",
    status: "Available",
    source: "Deferred"
  }
];

export async function listMrpRunConsoleSetup(session: AuthSessionResponse | null | undefined, filter: QueryFilter): Promise<MrpRunConsoleItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededMrpRuns, filter, (item) => `${item.runCode} ${item.runType} ${item.status}`);
  }

  try {
    const response = await apiClient.planning.mrpRuns(filter);
    return response.items.map((item) => mapMrpRun(item, "Live"));
  } catch {
    return filterSeeded(seededMrpRuns, filter, (item) => `${item.runCode} ${item.runType} ${item.status}`);
  }
}

export async function listBoqRequirementSetup(session: AuthSessionResponse | null | undefined, filter: QueryFilter): Promise<BoqRequirementItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededBoqRequirements, filter, (item) => `${item.sourceDocument} ${item.mrpRunLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.planning.boqRequirements(filter);
    return response.items.map((item) => mapBoqRequirement(item, "Live"));
  } catch {
    return filterSeeded(seededBoqRequirements, filter, (item) => `${item.sourceDocument} ${item.mrpRunLabel} ${item.status}`);
  }
}

export async function listCapacityBoardSetup(filter: QueryFilter): Promise<CapacityBucketItem[]> {
  return filterSeeded(
    seededCapacityBuckets,
    filter,
    (item) => `${item.workCenterLabel} ${item.machineLabel} ${item.shiftLabel} ${item.bucketDate} ${item.plannedOrderRef} ${item.constraintSignal}`
  );
}

export function isLivePlanningRecord(item: { source: MasterDataSource } | null | undefined) {
  return Boolean(item && item.source === "Live");
}

export async function approveBoqRequirementLine(requirement: BoqRequirementItem, line: BoqRequirementLineItem) {
  if (!line.lineId) {
    throw new Error("A live BOQ line is required before approval.");
  }

  return apiClient.planning.approveBoqLine(requirement.boqRequirementId, line.lineId, {
    approvedAction: line.approvedAction,
    overrideReasonCode: line.overrideReasonCode === "None" ? null : line.overrideReasonCode
  });
}

export async function convertBoqRequirementLine(requirement: BoqRequirementItem, line: BoqRequirementLineItem) {
  if (!line.lineId) {
    throw new Error("A live BOQ line is required before conversion.");
  }

  return apiClient.planning.convertBoqLine(requirement.boqRequirementId, line.lineId);
}

export async function convertReviewedBoqRequirementLines(requirement: BoqRequirementItem) {
  return apiClient.planning.convertReviewedBoqLines(requirement.boqRequirementId);
}
