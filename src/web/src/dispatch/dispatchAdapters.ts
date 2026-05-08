import type {
  AuthSessionResponse,
  DispatchPlanningItemDto,
  PackListDto,
  PackListLineDto,
  QueryFilter,
  ShipmentDto,
  ShipmentLineDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import { hasLiveSession, liveDataUnavailable } from "../api/liveData";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface PackListLineItem {
  id: string;
  lineNo: number;
  itemLabel: string;
  locationLabel: string;
  traceLabel: string;
  packageRef: string;
  packedQuantity: number;
  status: string;
}

export interface PackListItem {
  id: string;
  packListId: number;
  packListNo: string;
  salesOrderLabel: string;
  plannedShipDate: string;
  status: string;
  remarks: string;
  lineCount: number;
  packedQuantity: number;
  completenessSignal: string;
  source: MasterDataSource;
  lines: PackListLineItem[];
}

export interface DispatchPlanningItem {
  id: string;
  salesOrderLabel: string;
  customerLabel: string;
  promisedDate: string;
  orderedQuantity: number;
  packedQuantity: number;
  shippedQuantity: number;
  readinessPercent: number;
  nextAction: string;
  status: string;
  source: MasterDataSource;
}

export interface ShipmentLineItem {
  id: string;
  lineNo: number;
  itemLabel: string;
  locationLabel: string;
  traceLabel: string;
  shippedQuantity: number;
  status: string;
}

export interface ShipmentItem {
  id: string;
  shipmentId: number;
  shipmentNo: string;
  packListLabel: string;
  customerLabel: string;
  dispatchDate: string;
  vehicleRef: string;
  trackingRef: string;
  sealNo: string;
  proofNotes: string;
  status: string;
  loadedLabel: string;
  deliveredLabel: string;
  lineCount: number;
  shippedQuantity: number;
  source: MasterDataSource;
  lines: ShipmentLineItem[];
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

function itemLabel(itemId: number) {
  return `Item ${itemId}`;
}

function locationLabel(warehouseId: number | null | undefined, binId: number | null | undefined) {
  return `${warehouseId ? `WH ${warehouseId}` : "No warehouse"} / ${binId ? `BIN ${binId}` : "No bin"}`;
}

function traceLabel(lotId: number | null | undefined, serialId: number | null | undefined) {
  if (lotId && serialId) {
    return `Lot ${lotId} / Serial ${serialId}`;
  }

  if (lotId) {
    return `Lot ${lotId}`;
  }

  if (serialId) {
    return `Serial ${serialId}`;
  }

  return "No trace";
}

function mapPackLine(line: PackListLineDto): PackListLineItem {
  return {
    id: `pack-line-${line.id}`,
    lineNo: line.lineNo,
    itemLabel: itemLabel(line.itemId),
    locationLabel: locationLabel(line.warehouseId, line.binId),
    traceLabel: traceLabel(line.lotId, line.serialId),
    packageRef: line.packageRef ?? "Unpacked",
    packedQuantity: line.packedQuantity,
    status: line.status
  };
}

function mapPackList(dto: PackListDto, source: MasterDataSource): PackListItem {
  const lines = dto.lines.map(mapPackLine);
  const packedQuantity = lines.reduce((total, line) => total + line.packedQuantity, 0);

  return {
    id: `pack-list-${dto.id}`,
    packListId: dto.id,
    packListNo: dto.packListNo,
    salesOrderLabel: dto.salesOrderId ? `SO ${dto.salesOrderId}` : "Manual pack",
    plannedShipDate: dateLabel(dto.plannedShipDate),
    status: dto.status,
    remarks: dto.remarks ?? "No remarks",
    lineCount: lines.length,
    packedQuantity,
    completenessSignal: lines.length > 0 && lines.every((line) => line.status.toLowerCase().includes("packed")) ? "Complete" : "Review pack",
    source,
    lines
  };
}

function mapPlanning(dto: DispatchPlanningItemDto, source: MasterDataSource): DispatchPlanningItem {
  return {
    id: `dispatch-plan-${dto.salesOrderId}`,
    salesOrderLabel: dto.salesOrderNo,
    customerLabel: dto.customerName ?? `Customer ${dto.customerId}`,
    promisedDate: dateLabel(dto.promisedDate),
    orderedQuantity: dto.orderedQuantity,
    packedQuantity: dto.packedQuantity,
    shippedQuantity: dto.shippedQuantity,
    readinessPercent: dto.dispatchReadinessPercent,
    nextAction: dto.nextAction ?? "Review dispatch readiness",
    status: dto.status,
    source
  };
}

function mapShipmentLine(line: ShipmentLineDto): ShipmentLineItem {
  return {
    id: `shipment-line-${line.id}`,
    lineNo: line.lineNo,
    itemLabel: itemLabel(line.itemId),
    locationLabel: locationLabel(line.warehouseId, line.binId),
    traceLabel: traceLabel(line.lotId, line.serialId),
    shippedQuantity: line.shippedQuantity,
    status: line.status
  };
}

function mapShipment(dto: ShipmentDto, source: MasterDataSource): ShipmentItem {
  const lines = dto.lines.map(mapShipmentLine);

  return {
    id: `shipment-${dto.id}`,
    shipmentId: dto.id,
    shipmentNo: dto.shipmentNo,
    packListLabel: dto.packListId ? `Pack ${dto.packListId}` : "Direct shipment",
    customerLabel: `Customer ${dto.customerId}`,
    dispatchDate: dateLabel(dto.dispatchDate),
    vehicleRef: dto.vehicleRef ?? "Vehicle pending",
    trackingRef: dto.trackingRef ?? "Tracking pending",
    sealNo: dto.sealNo ?? "Seal pending",
    proofNotes: dto.proofNotes ?? "Proof pending",
    status: dto.status,
    loadedLabel: dateTimeLabel(dto.loadedOn),
    deliveredLabel: dateTimeLabel(dto.deliveredOn),
    lineCount: lines.length,
    shippedQuantity: lines.reduce((total, line) => total + line.shippedQuantity, 0),
    source,
    lines
  };
}

const seededPackLists: PackListItem[] = [
  {
    id: "pack-pl-0042",
    packListId: 8101,
    packListNo: "PACK-2026-0042",
    salesOrderLabel: "SO-2026-0189",
    plannedShipDate: "2026-03-07",
    status: "Packing",
    remarks: "Two cartons and accessory crate.",
    lineCount: 2,
    packedQuantity: 6,
    completenessSignal: "Review pack",
    source: "Seeded",
    lines: [
      {
        id: "pack-pl-0042-line-1",
        lineNo: 10,
        itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
        locationLabel: "FG-DISPATCH / FG-STAGE-02",
        traceLabel: "SN-OZ50-0189-01",
        packageRef: "Carton 1",
        packedQuantity: 1,
        status: "Packed"
      },
      {
        id: "pack-pl-0042-line-2",
        lineNo: 20,
        itemLabel: "ACC-INSTALL-KIT / Install Kit",
        locationLabel: "FG-DISPATCH / FG-STAGE-02",
        traceLabel: "No trace",
        packageRef: "Accessory crate",
        packedQuantity: 5,
        status: "Open"
      }
    ]
  }
];

const seededPlanning: DispatchPlanningItem[] = [
  {
    id: "dispatch-plan-so-0189",
    salesOrderLabel: "SO-2026-0189",
    customerLabel: "Enkay Ozone",
    promisedDate: "2026-03-08",
    orderedQuantity: 10,
    packedQuantity: 6,
    shippedQuantity: 0,
    readinessPercent: 62,
    nextAction: "Complete accessory crate and confirm vehicle.",
    status: "At Risk",
    source: "Seeded"
  },
  {
    id: "dispatch-plan-so-0194",
    salesOrderLabel: "SO-2026-0194",
    customerLabel: "BlueSky Industries",
    promisedDate: "2026-03-12",
    orderedQuantity: 2,
    packedQuantity: 2,
    shippedQuantity: 0,
    readinessPercent: 92,
    nextAction: "Generate shipment proof and labels.",
    status: "Ready",
    source: "Seeded"
  }
];

const seededShipments: ShipmentItem[] = [
  {
    id: "shipment-dc-0029",
    shipmentId: 8201,
    shipmentNo: "SHIP-2026-0029",
    packListLabel: "PACK-2026-0042",
    customerLabel: "Enkay Ozone",
    dispatchDate: "2026-03-07",
    vehicleRef: "GJ-01-AB-2244",
    trackingRef: "LR-77391",
    sealNo: "SEAL-5531",
    proofNotes: "Loading photos pending from mobile.",
    status: "Loading",
    loadedLabel: "Open",
    deliveredLabel: "Open",
    lineCount: 1,
    shippedQuantity: 1,
    source: "Seeded",
    lines: [
      {
        id: "shipment-dc-0029-line-1",
        lineNo: 10,
        itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
        locationLabel: "FG-DISPATCH / FG-STAGE-02",
        traceLabel: "SN-OZ50-0189-01",
        shippedQuantity: 1,
        status: "Loaded"
      }
    ]
  }
];

export async function listPackLists(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededPackLists, filter, (item) => `${item.packListNo} ${item.salesOrderLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.dispatch.packLists(filter);
    return response.items.map((item) => mapPackList(item, "Live"));
  } catch {
    throw liveDataUnavailable("Pack list");
  }
}

export async function listDispatchPlanning(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededPlanning, filter, (item) => `${item.salesOrderLabel} ${item.customerLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.dispatch.planning(filter);
    return response.map((item) => mapPlanning(item, "Live"));
  } catch {
    throw liveDataUnavailable("Dispatch planning");
  }
}

export async function listShipments(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededShipments, filter, (item) => `${item.shipmentNo} ${item.customerLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.dispatch.shipments(filter);
    return response.items.map((item) => mapShipment(item, "Live"));
  } catch {
    throw liveDataUnavailable("Shipment");
  }
}
