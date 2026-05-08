import type {
  AuthSessionResponse,
  MachineBoardItem,
  ProductionReceiptSummaryDto,
  QueryFilter,
  ReworkOrderDto,
  ScrapEntryDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import { hasLiveSession, liveDataUnavailable } from "../api/liveData";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface ProductionReceiptItem {
  id: string;
  receiptId: number;
  receiptNo: string;
  postingDate: string;
  workOrderLabel: string;
  jobCardLabel: string;
  outputSummary: string;
  lotSerialSignal: string;
  catchWeightSignal: string;
  status: string;
  postedLabel: string;
  source: MasterDataSource;
}

export interface ScrapByProductItem {
  id: string;
  scrapId: number;
  scrapNo: string;
  postingDate: string;
  workOrderLabel: string;
  jobCardLabel: string;
  itemLabel: string;
  quantity: number;
  catchWeightSignal: string;
  reasonCode: string;
  inventoryState: string;
  valuationSignal: string;
  status: string;
  source: MasterDataSource;
}

export interface ReworkOrderItem {
  id: string;
  reworkId: number;
  reworkNo: string;
  sourceDocument: string;
  workOrderLabel: string;
  jobCardLabel: string;
  itemLabel: string;
  routeLabel: string;
  quantity: number;
  reasonCode: string;
  instructions: string;
  status: string;
  releasedLabel: string;
  closedLabel: string;
  source: MasterDataSource;
}

export interface MachineStatusItem {
  id: string;
  machineLabel: string;
  workCenterLabel: string;
  currentStatus: string;
  activeJobCardLabel: string;
  activeWorkOrderLabel: string;
  itemLabel: string;
  plannedWindow: string;
  riskStatus: string;
  availabilityPercent: number;
  source: MasterDataSource;
}

function matchesFilter(value: string, filter: QueryFilter) {
  const search = filter.search?.trim().toLowerCase();
  const status = filter.status?.trim().toLowerCase();
  const normalized = value.toLowerCase();

  return (!search || normalized.includes(search)) && (!status || status === "all" || normalized.includes(status));
}

function filterSeeded<TItem>(items: TItem[], filter: QueryFilter, project: (item: TItem) => string) {
  return items.filter((item) => matchesFilter(project(item), filter));
}

function dateLabel(value: string | null | undefined) {
  return value?.trim() ? value.slice(0, 10) : "Open";
}

function dateTimeLabel(value: string | null | undefined) {
  return value?.trim() ? value.slice(0, 16).replace("T", " ") : "Open";
}

function documentLabel(prefix: string, id: number | null | undefined) {
  return id ? `${prefix} ${id}` : "Unlinked";
}

function itemLabel(itemId: number) {
  return `Item ${itemId}`;
}

function locationLabel(warehouseId: number | null | undefined, binId: number | null | undefined) {
  const warehouse = warehouseId ? `WH ${warehouseId}` : "No warehouse";
  const bin = binId ? `BIN ${binId}` : "No bin";
  return `${warehouse} / ${bin}`;
}

function mapReceipt(dto: ProductionReceiptSummaryDto, source: MasterDataSource): ProductionReceiptItem {
  return {
    id: `production-receipt-${dto.id}`,
    receiptId: dto.id,
    receiptNo: dto.receiptNo,
    postingDate: dateLabel(dto.postingDate),
    workOrderLabel: documentLabel("WO", dto.workOrderId),
    jobCardLabel: documentLabel("JC", dto.jobCardId),
    outputSummary: "Open receipt detail",
    lotSerialSignal: "Detail required",
    catchWeightSignal: "Detail required",
    status: dto.status,
    postedLabel: dto.postedOn ? dateTimeLabel(dto.postedOn) : "Not posted",
    source
  };
}

function mapScrap(dto: ScrapEntryDto, source: MasterDataSource): ScrapByProductItem {
  return {
    id: `scrap-entry-${dto.id}`,
    scrapId: dto.id,
    scrapNo: dto.scrapNo,
    postingDate: dateLabel(dto.postingDate),
    workOrderLabel: documentLabel("WO", dto.workOrderId),
    jobCardLabel: documentLabel("JC", dto.jobCardId),
    itemLabel: itemLabel(dto.itemId),
    quantity: dto.quantity,
    catchWeightSignal: dto.catchWeightQty ? `${dto.catchWeightQty} actual` : "Standard quantity",
    reasonCode: dto.reasonCode,
    inventoryState: dto.inventoryState,
    valuationSignal: "Valuation pending",
    status: dto.status,
    source
  };
}

function mapRework(dto: ReworkOrderDto, source: MasterDataSource): ReworkOrderItem {
  return {
    id: `rework-order-${dto.id}`,
    reworkId: dto.id,
    reworkNo: dto.reworkNo,
    sourceDocument: dto.sourceDocumentType ? `${dto.sourceDocumentType} ${dto.sourceDocumentId ?? "Open"}` : "Manual",
    workOrderLabel: documentLabel("WO", dto.workOrderId),
    jobCardLabel: documentLabel("JC", dto.jobCardId),
    itemLabel: itemLabel(dto.itemId),
    routeLabel: `${locationLabel(dto.sourceWarehouseId, dto.sourceBinId)} -> ${locationLabel(dto.targetWarehouseId, dto.targetBinId)}`,
    quantity: dto.quantity,
    reasonCode: dto.reasonCode ?? "REWORK",
    instructions: dto.instructions ?? "No instructions recorded",
    status: dto.status,
    releasedLabel: dateTimeLabel(dto.releasedOn),
    closedLabel: dateTimeLabel(dto.closedOn),
    source
  };
}

function mapMachineStatus(dto: MachineBoardItem, source: MasterDataSource): MachineStatusItem {
  const down = dto.currentStatus.toLowerCase().includes("down");
  const running = Boolean(dto.activeJobCardNo);

  return {
    id: `machine-status-${dto.machineId}`,
    machineLabel: `${dto.machineCode} ${dto.machineName}`,
    workCenterLabel: dto.workCenterId ? `Work center ${dto.workCenterId}` : "No work center",
    currentStatus: dto.currentStatus,
    activeJobCardLabel: dto.activeJobCardNo ?? "No active job",
    activeWorkOrderLabel: dto.activeWorkOrderNo ?? "No active WO",
    itemLabel: dto.itemCode ?? "No active item",
    plannedWindow: `${dateTimeLabel(dto.plannedStartOn)} to ${dateTimeLabel(dto.plannedEndOn)}`,
    riskStatus: dto.riskStatus ?? (down ? "Down" : running ? "Running" : "Idle"),
    availabilityPercent: down ? 0 : running ? 86 : 100,
    source
  };
}

const seededReceipts: ProductionReceiptItem[] = [
  {
    id: "receipt-prd-0062",
    receiptId: 6201,
    receiptNo: "PRD-RCPT-2026-0062",
    postingDate: "2026-03-05",
    workOrderLabel: "WO-2026-044",
    jobCardLabel: "JC-90441",
    outputSummary: "FG-OZ-50 / 6 received",
    lotSerialSignal: "SN-OZ50-0189-01 to 06",
    catchWeightSignal: "Standard quantity",
    status: "Posted",
    postedLabel: "2026-03-05 12:20",
    source: "Seeded"
  },
  {
    id: "receipt-wip-0018",
    receiptId: 6202,
    receiptNo: "PRD-RCPT-2026-0063",
    postingDate: "2026-03-05",
    workOrderLabel: "WO-2026-047",
    jobCardLabel: "JC-90452",
    outputSummary: "WIP-OZG-MOD / 2 received",
    lotSerialSignal: "LOT-WIP-2026-03A",
    catchWeightSignal: "42.5 kg actual",
    status: "Draft",
    postedLabel: "Not posted",
    source: "Seeded"
  }
];

const seededScrap: ScrapByProductItem[] = [
  {
    id: "scrap-2026-0012",
    scrapId: 6301,
    scrapNo: "SCRAP-2026-0012",
    postingDate: "2026-03-05",
    workOrderLabel: "WO-2026-044",
    jobCardLabel: "JC-90441",
    itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
    quantity: 1.5,
    catchWeightSignal: "71 kg actual",
    reasonCode: "EDGE_TRIM",
    inventoryState: "Scrap",
    valuationSignal: "Valuation posted",
    status: "Posted",
    source: "Seeded"
  },
  {
    id: "byproduct-2026-0004",
    scrapId: 6302,
    scrapNo: "BYP-2026-0004",
    postingDate: "2026-03-05",
    workOrderLabel: "WO-2026-044",
    jobCardLabel: "JC-90441",
    itemLabel: "SS-OFFCUT / Stainless Offcut",
    quantity: 0.8,
    catchWeightSignal: "38 kg actual",
    reasonCode: "BY_PRODUCT",
    inventoryState: "ByProduct",
    valuationSignal: "Valuation pending",
    status: "Draft",
    source: "Seeded"
  }
];

const seededRework: ReworkOrderItem[] = [
  {
    id: "rework-rw-0009",
    reworkId: 6401,
    reworkNo: "RW-2026-0009",
    sourceDocument: "NCR NCR-2026-0018",
    workOrderLabel: "WO-2026-044",
    jobCardLabel: "JC-90391",
    itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
    routeLabel: "QC-HOLD / QC-CAGE-01 -> WIP-REWORK / RW-01",
    quantity: 1,
    reasonCode: "LEAK_TEST_FAIL",
    instructions: "Retest gasket seating and pressure hold after rework.",
    status: "Released",
    releasedLabel: "2026-03-05 13:10",
    closedLabel: "Open",
    source: "Seeded"
  }
];

const seededMachineStatus: MachineStatusItem[] = [
  {
    id: "machine-status-mc-01",
    machineLabel: "MC-01 Laser Cutter",
    workCenterLabel: "Laser cell",
    currentStatus: "Running",
    activeJobCardLabel: "JC-90441",
    activeWorkOrderLabel: "WO-2026-044",
    itemLabel: "FG-OZ-50",
    plannedWindow: "2026-03-05 10:12 to 2026-03-05 12:10",
    riskStatus: "Current",
    availabilityPercent: 86,
    source: "Seeded"
  },
  {
    id: "machine-status-mc-03",
    machineLabel: "MC-03 Test Bench",
    workCenterLabel: "Final test",
    currentStatus: "Down",
    activeJobCardLabel: "JC-90391",
    activeWorkOrderLabel: "WO-2026-044",
    itemLabel: "WIP-OZG-MOD",
    plannedWindow: "Blocked by calibration",
    riskStatus: "Calibration hold",
    availabilityPercent: 0,
    source: "Seeded"
  }
];

export async function listProductionReceipts(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededReceipts, filter, (item) => `${item.receiptNo} ${item.workOrderLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.production.productionReceipts(filter);
    return response.items.map((item) => mapReceipt(item, "Live"));
  } catch {
    throw liveDataUnavailable("Production receipt");
  }
}

export async function listScrapByProducts(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededScrap, filter, (item) => `${item.scrapNo} ${item.itemLabel} ${item.reasonCode} ${item.status}`);
  }

  try {
    const response = await apiClient.production.scrapEntries(filter);
    return response.items.map((item) => mapScrap(item, "Live"));
  } catch {
    throw liveDataUnavailable("Scrap and by-product");
  }
}

export async function listReworkOrders(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededRework, filter, (item) => `${item.reworkNo} ${item.sourceDocument} ${item.status}`);
  }

  try {
    const response = await apiClient.production.reworkOrders(filter);
    return response.items.map((item) => mapRework(item, "Live"));
  } catch {
    throw liveDataUnavailable("Rework order");
  }
}

export async function listMachineStatus(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededMachineStatus, filter, (item) => `${item.machineLabel} ${item.currentStatus} ${item.riskStatus}`);
  }

  try {
    const response = await apiClient.production.machineBoard({
      ...filter,
      dateFrom: filter.dateFrom ?? "2026-03-05",
      dateTo: filter.dateTo ?? "2026-03-11"
    });
    return response.map((item) => mapMachineStatus(item, "Live"));
  } catch {
    throw liveDataUnavailable("Machine status");
  }
}
