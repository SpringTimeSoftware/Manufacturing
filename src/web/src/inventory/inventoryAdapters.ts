import type {
  AuthSessionResponse,
  LotTraceabilityDto,
  QueryFilter,
  SerialTraceabilityDto,
  StockBalanceDto,
  StockTransactionDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface StockBalanceItem {
  id: string;
  balanceId: number;
  itemLabel: string;
  warehouseLabel: string;
  binLabel: string;
  lotSerialLabel: string;
  onHandQty: number;
  reservedQty: number;
  qcHoldQty: number;
  blockedQty: number;
  inTransitQty: number;
  availableQty: number;
  catchWeightLabel: string;
  status: string;
  source: MasterDataSource;
}

export interface TraceabilityEventItem {
  id: string;
  transactionNo: string;
  transactionType: string;
  postingDate: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  sourceDocument: string;
  state: string;
}

export interface TraceabilityItem {
  id: string;
  traceRef: string;
  itemLabel: string;
  currentLocation: string;
  manufacturedOn: string;
  expiryOn: string;
  catchWeightLabel: string;
  status: string;
  source: MasterDataSource;
  events: TraceabilityEventItem[];
}

export interface MaterialIssueItem {
  id: string;
  transactionId: number;
  transactionNo: string;
  sourceDocument: string;
  itemLabel: string;
  fromLocation: string;
  quantity: number;
  catchWeightLabel: string;
  postingDate: string;
  issueMode: string;
  status: string;
  source: MasterDataSource;
}

export interface MaterialReturnItem {
  id: string;
  transactionId: number;
  transactionNo: string;
  sourceDocument: string;
  itemLabel: string;
  toLocation: string;
  quantity: number;
  catchWeightLabel: string;
  postingDate: string;
  returnReason: string;
  status: string;
  source: MasterDataSource;
}

export interface StockTransferPutawayItem {
  id: string;
  transactionId: number;
  transactionNo: string;
  itemLabel: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  catchWeightLabel: string;
  postingDate: string;
  movementType: string;
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

function locationLabel(warehouseId: number | null | undefined, binId: number | null | undefined) {
  const warehouse = warehouseId ? `WH ${warehouseId}` : "No warehouse";
  const bin = binId ? `BIN ${binId}` : "No bin";
  return `${warehouse} / ${bin}`;
}

function lotSerialLabel(lotId: number | null | undefined, serialId: number | null | undefined) {
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

function sourceDocument(type: string | null | undefined, id: number | null | undefined) {
  if (!type && !id) {
    return "Manual";
  }

  return `${type ?? "Document"} ${id ?? "Open"}`;
}

function mapStockBalance(dto: StockBalanceDto, source: MasterDataSource): StockBalanceItem {
  const availableQty = Math.max(dto.onHandQty - dto.reservedQty - dto.qcHoldQty - dto.blockedQty, 0);

  return {
    id: `stock-balance-${dto.id}`,
    balanceId: dto.id,
    itemLabel: `Item ${dto.itemId}`,
    warehouseLabel: `Warehouse ${dto.warehouseId}`,
    binLabel: dto.binId ? `Bin ${dto.binId}` : "No bin",
    lotSerialLabel: lotSerialLabel(dto.lotId, dto.serialId),
    onHandQty: dto.onHandQty,
    reservedQty: dto.reservedQty,
    qcHoldQty: dto.qcHoldQty,
    blockedQty: dto.blockedQty,
    inTransitQty: dto.inTransitQty,
    availableQty,
    catchWeightLabel: dto.catchWeightQty ? `${dto.catchWeightQty} actual` : "Not catch-weight",
    status: dto.blockedQty > 0 ? "Blocked" : dto.qcHoldQty > 0 ? "QC Hold" : availableQty > 0 ? "Available" : "Reserved",
    source
  };
}

function mapTransactionEvent(dto: StockTransactionDto): TraceabilityEventItem {
  return {
    id: `trace-event-${dto.id}`,
    transactionNo: dto.transactionNo,
    transactionType: dto.transactionType,
    postingDate: dateLabel(dto.postingDate),
    quantity: dto.quantity,
    fromLocation: locationLabel(dto.fromWarehouseId, dto.fromBinId),
    toLocation: locationLabel(dto.toWarehouseId, dto.toBinId),
    sourceDocument: sourceDocument(dto.sourceDocumentType, dto.sourceDocumentId),
    state: dto.inventoryState
  };
}

function mapLotTraceability(dto: LotTraceabilityDto, source: MasterDataSource): TraceabilityItem {
  const firstBalance = dto.balances[0];

  return {
    id: `trace-lot-${dto.id}`,
    traceRef: dto.lotNo,
    itemLabel: `Item ${dto.itemId}`,
    currentLocation: firstBalance ? locationLabel(firstBalance.warehouseId, firstBalance.binId) : "No current balance",
    manufacturedOn: dateLabel(dto.manufacturedOn),
    expiryOn: dateLabel(dto.expiryOn),
    catchWeightLabel: dto.catchWeightQty ? `${dto.catchWeightQty} actual` : "Not catch-weight",
    status: dto.lotStatus,
    source,
    events: dto.transactions.map(mapTransactionEvent)
  };
}

function mapSerialTraceability(dto: SerialTraceabilityDto, source: MasterDataSource): TraceabilityItem {
  return {
    id: `trace-serial-${dto.id}`,
    traceRef: dto.serialNo,
    itemLabel: `Item ${dto.itemId}`,
    currentLocation: locationLabel(dto.currentWarehouseId, dto.currentBinId),
    manufacturedOn: dateLabel(dto.manufacturedOn),
    expiryOn: dateLabel(dto.expiryOn),
    catchWeightLabel: dto.lotId ? `Lot ${dto.lotId}` : "Serial tracked",
    status: dto.serialStatus,
    source,
    events: dto.transactions.map(mapTransactionEvent)
  };
}

function mapMaterialIssue(dto: StockTransactionDto, source: MasterDataSource): MaterialIssueItem {
  return {
    id: `material-issue-${dto.id}`,
    transactionId: dto.id,
    transactionNo: dto.transactionNo,
    sourceDocument: sourceDocument(dto.sourceDocumentType, dto.sourceDocumentId),
    itemLabel: `Item ${dto.itemId}`,
    fromLocation: locationLabel(dto.fromWarehouseId, dto.fromBinId),
    quantity: dto.quantity,
    catchWeightLabel: dto.catchWeightQty ? `${dto.catchWeightQty} actual` : "Standard qty",
    postingDate: dateLabel(dto.postingDate),
    issueMode: dto.remarks ?? "Reserved/actual issue",
    status: dto.inventoryState,
    source
  };
}

function mapMaterialReturn(dto: StockTransactionDto, source: MasterDataSource): MaterialReturnItem {
  return {
    id: `material-return-${dto.id}`,
    transactionId: dto.id,
    transactionNo: dto.transactionNo,
    sourceDocument: sourceDocument(dto.sourceDocumentType, dto.sourceDocumentId),
    itemLabel: `Item ${dto.itemId}`,
    toLocation: locationLabel(dto.toWarehouseId, dto.toBinId),
    quantity: dto.quantity,
    catchWeightLabel: dto.catchWeightQty ? `${dto.catchWeightQty} actual` : "Standard qty",
    postingDate: dateLabel(dto.postingDate),
    returnReason: dto.remarks ?? "Unused production material",
    status: dto.inventoryState,
    source
  };
}

function mapStockTransfer(dto: StockTransactionDto, source: MasterDataSource): StockTransferPutawayItem {
  return {
    id: `stock-transfer-${dto.id}`,
    transactionId: dto.id,
    transactionNo: dto.transactionNo,
    itemLabel: `Item ${dto.itemId}`,
    fromLocation: locationLabel(dto.fromWarehouseId, dto.fromBinId),
    toLocation: locationLabel(dto.toWarehouseId, dto.toBinId),
    quantity: dto.quantity,
    catchWeightLabel: dto.catchWeightQty ? `${dto.catchWeightQty} actual` : "Standard qty",
    postingDate: dateLabel(dto.postingDate),
    movementType: dto.transactionType.includes("Putaway") ? "Putaway" : "Transfer",
    status: dto.inventoryState,
    source
  };
}

const seededBalances: StockBalanceItem[] = [
  {
    id: "balance-rm-ss-main",
    balanceId: 9401,
    itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
    warehouseLabel: "RM-MAIN",
    binLabel: "RM-A-01",
    lotSerialLabel: "LOT-SS-2026-03A",
    onHandQty: 48,
    reservedQty: 25,
    qcHoldQty: 6,
    blockedQty: 0,
    inTransitQty: 12,
    availableQty: 17,
    catchWeightLabel: "2260 kg actual",
    status: "Available",
    source: "Seeded"
  },
  {
    id: "balance-fg-oz50",
    balanceId: 9402,
    itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
    warehouseLabel: "FG-DISPATCH",
    binLabel: "FG-STAGE-02",
    lotSerialLabel: "SN-OZ50-0189-01",
    onHandQty: 2,
    reservedQty: 2,
    qcHoldQty: 0,
    blockedQty: 0,
    inTransitQty: 0,
    availableQty: 0,
    catchWeightLabel: "Standard qty",
    status: "Reserved",
    source: "Seeded"
  },
  {
    id: "balance-qc-hold-valve",
    balanceId: 9403,
    itemLabel: "RM-VALVE-SET / Valve Set",
    warehouseLabel: "QC-HOLD",
    binLabel: "QC-CAGE-01",
    lotSerialLabel: "LOT-VALVE-2026-02B",
    onHandQty: 8,
    reservedQty: 0,
    qcHoldQty: 8,
    blockedQty: 0,
    inTransitQty: 0,
    availableQty: 0,
    catchWeightLabel: "Standard qty",
    status: "QC Hold",
    source: "Seeded"
  }
];

const seededTraceability: TraceabilityItem[] = [
  {
    id: "trace-lot-ss",
    traceRef: "LOT-SS-2026-03A",
    itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
    currentLocation: "RM-MAIN / RM-A-01",
    manufacturedOn: "2026-02-20",
    expiryOn: "Open",
    catchWeightLabel: "2260 kg actual",
    status: "Released",
    source: "Seeded",
    events: [
      {
        id: "trace-lot-ss-event-1",
        transactionNo: "RCPT-2026-0029",
        transactionType: "Receipt",
        postingDate: "2026-02-27",
        quantity: 48,
        fromLocation: "Supplier",
        toLocation: "RM-MAIN / RM-A-01",
        sourceDocument: "PO-2026-0114",
        state: "Released"
      },
      {
        id: "trace-lot-ss-event-2",
        transactionNo: "ISS-WO-2026-044",
        transactionType: "IssueToWO",
        postingDate: "2026-03-01",
        quantity: 25,
        fromLocation: "RM-MAIN / RM-A-01",
        toLocation: "WO-2026-044",
        sourceDocument: "WO-2026-044",
        state: "Issued"
      }
    ]
  },
  {
    id: "trace-serial-oz50",
    traceRef: "SN-OZ50-0189-01",
    itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
    currentLocation: "FG-DISPATCH / FG-STAGE-02",
    manufacturedOn: "2026-03-03",
    expiryOn: "Open",
    catchWeightLabel: "Serial tracked",
    status: "Dispatch Reserved",
    source: "Seeded",
    events: [
      {
        id: "trace-serial-oz50-event-1",
        transactionNo: "PRD-RCPT-2026-0062",
        transactionType: "ProductionReceipt",
        postingDate: "2026-03-03",
        quantity: 1,
        fromLocation: "WO-2026-044",
        toLocation: "FG-DISPATCH / FG-STAGE-02",
        sourceDocument: "WO-2026-044",
        state: "Released"
      }
    ]
  }
];

const seededIssues: MaterialIssueItem[] = [
  {
    id: "issue-wo-44",
    transactionId: 8601,
    transactionNo: "ISS-WO-2026-044",
    sourceDocument: "WO-2026-044",
    itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
    fromLocation: "RM-MAIN / RM-A-01",
    quantity: 25,
    catchWeightLabel: "1180 kg actual",
    postingDate: "2026-03-01",
    issueMode: "Reserved material issue",
    status: "Issued",
    source: "Seeded"
  },
  {
    id: "issue-wo-47",
    transactionId: 8602,
    transactionNo: "ISS-WO-2026-047",
    sourceDocument: "JC-2026-081",
    itemLabel: "RM-GASKET-SET / Gasket Set",
    fromLocation: "RM-MAIN / RM-C-04",
    quantity: 8,
    catchWeightLabel: "Standard qty",
    postingDate: "2026-03-02",
    issueMode: "Actual pick issue",
    status: "Issued",
    source: "Seeded"
  }
];

const seededReturns: MaterialReturnItem[] = [
  {
    id: "return-wo-44",
    transactionId: 8701,
    transactionNo: "RET-WO-2026-044",
    sourceDocument: "WO-2026-044",
    itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
    toLocation: "RM-MAIN / RM-A-RETURN",
    quantity: 3,
    catchWeightLabel: "142 kg actual",
    postingDate: "2026-03-04",
    returnReason: "Unused nested sheet balance",
    status: "Returned",
    source: "Seeded"
  }
];

const seededTransfers: StockTransferPutawayItem[] = [
  {
    id: "transfer-putaway-95",
    transactionId: 9501,
    transactionNo: "TRF-2026-0095",
    itemLabel: "RM-VALVE-SET / Valve Set",
    fromLocation: "RECEIVING / DOCK-01",
    toLocation: "QC-HOLD / QC-CAGE-01",
    quantity: 8,
    catchWeightLabel: "Standard qty",
    postingDate: "2026-03-02",
    movementType: "Putaway",
    status: "QC Hold",
    source: "Seeded"
  },
  {
    id: "transfer-bin-96",
    transactionId: 9502,
    transactionNo: "TRF-2026-0096",
    itemLabel: "RM-GASKET-SET / Gasket Set",
    fromLocation: "RM-MAIN / RM-C-01",
    toLocation: "RM-MAIN / RM-C-04",
    quantity: 20,
    catchWeightLabel: "Standard qty",
    postingDate: "2026-03-03",
    movementType: "Transfer",
    status: "Released",
    source: "Seeded"
  }
];

export async function listStockBalanceSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<StockBalanceItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededBalances, filter, (item) => `${item.itemLabel} ${item.warehouseLabel} ${item.binLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.inventory.balances(filter);
    return response.items.map((item) => mapStockBalance(item, "Live"));
  } catch {
    return filterSeeded(seededBalances, filter, (item) => `${item.itemLabel} ${item.warehouseLabel} ${item.binLabel} ${item.status}`);
  }
}

export async function listTraceabilitySetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<TraceabilityItem[]> {
  const search = filter.search?.trim();

  if (hasLiveSession(session) && search) {
    try {
      const lot = await apiClient.inventory.lotTraceability(search, filter);
      return [mapLotTraceability(lot, "Live")];
    } catch {
      try {
        const serial = await apiClient.inventory.serialTraceability(search, filter);
        return [mapSerialTraceability(serial, "Live")];
      } catch {
        return filterSeeded(seededTraceability, filter, (item) => `${item.traceRef} ${item.itemLabel} ${item.status}`);
      }
    }
  }

  return filterSeeded(seededTraceability, filter, (item) => `${item.traceRef} ${item.itemLabel} ${item.status}`);
}

export async function listMaterialIssueSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<MaterialIssueItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededIssues, filter, (item) => `${item.transactionNo} ${item.sourceDocument} ${item.itemLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.inventory.transactions({ ...filter, transactionType: "IssueToWO" });
    return response.items.map((item) => mapMaterialIssue(item, "Live"));
  } catch {
    return filterSeeded(seededIssues, filter, (item) => `${item.transactionNo} ${item.sourceDocument} ${item.itemLabel} ${item.status}`);
  }
}

export async function listMaterialReturnSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<MaterialReturnItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededReturns, filter, (item) => `${item.transactionNo} ${item.sourceDocument} ${item.itemLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.inventory.transactions({ ...filter, transactionType: "ReturnFromWO" });
    return response.items.map((item) => mapMaterialReturn(item, "Live"));
  } catch {
    return filterSeeded(seededReturns, filter, (item) => `${item.transactionNo} ${item.sourceDocument} ${item.itemLabel} ${item.status}`);
  }
}

export async function listStockTransferPutawaySetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<StockTransferPutawayItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededTransfers, filter, (item) => `${item.transactionNo} ${item.itemLabel} ${item.fromLocation} ${item.toLocation} ${item.status}`);
  }

  try {
    const response = await apiClient.inventory.transactions({ ...filter, transactionType: "Transfer" });
    return response.items.map((item) => mapStockTransfer(item, "Live"));
  } catch {
    return filterSeeded(seededTransfers, filter, (item) => `${item.transactionNo} ${item.itemLabel} ${item.fromLocation} ${item.toLocation} ${item.status}`);
  }
}
