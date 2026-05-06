import type {
  AuthSessionResponse,
  PurchaseOrderDto,
  PurchaseOrderLineDto,
  PurchaseRequisitionDto,
  PurchaseRequisitionLineDto,
  QueryFilter,
  SubcontractOrderDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface PurchaseRequisitionLineItem {
  id: string;
  lineNo: number;
  itemLabel: string;
  requiredQuantity: number;
  needByDate: string;
  sourceBoqLine: string;
  linkedWorkOrder: string;
  status: string;
}

export interface PurchaseRequisitionItem {
  id: string;
  requisitionId: number;
  purchaseRequisitionNo: string;
  sourceDocument: string;
  status: string;
  lineCount: number;
  totalQuantity: number;
  nextNeedBy: string;
  convertedLines: number;
  source: MasterDataSource;
  lines: PurchaseRequisitionLineItem[];
}

export interface PurchaseOrderLineItem {
  id: string;
  lineNo: number;
  itemLabel: string;
  orderedQuantity: number;
  expectedDate: string;
  linkedPrLine: string;
  linkedWorkOrder: string;
  status: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: number;
  purchaseOrderNo: string;
  supplierLabel: string;
  expectedReceiptDate: string;
  status: string;
  lineCount: number;
  totalQuantity: number;
  overdueSignal: string;
  source: MasterDataSource;
  lines: PurchaseOrderLineItem[];
}

export interface SubcontractPlanItem {
  id: string;
  subcontractOrderId: number;
  subcontractOrderNo: string;
  supplierLabel: string;
  workOrderLabel: string;
  operationLabel: string;
  expectedReturnDate: string;
  sendOutSignal: string;
  receiveBackSignal: string;
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

function sourceDocument(type: string, id: number | null | undefined) {
  return id ? `${type} ${id}` : type;
}

function mapPrLine(line: PurchaseRequisitionLineDto): PurchaseRequisitionLineItem {
  return {
    id: `pr-line-${line.id}`,
    lineNo: line.lineNo,
    itemLabel: `Item ${line.itemId}`,
    requiredQuantity: line.requiredQuantity,
    needByDate: dateLabel(line.needByDate),
    sourceBoqLine: line.sourceBoqRequirementLineId ? `BOQ line ${line.sourceBoqRequirementLineId}` : "Manual demand",
    linkedWorkOrder: line.linkedWorkOrderId ? `WO ${line.linkedWorkOrderId}` : "Not linked",
    status: line.status
  };
}

function mapPr(dto: PurchaseRequisitionDto, source: MasterDataSource): PurchaseRequisitionItem {
  const lines = dto.lines.map(mapPrLine);
  const dueDates = lines.map((line) => line.needByDate).sort();

  return {
    id: `purchase-requisition-${dto.id}`,
    requisitionId: dto.id,
    purchaseRequisitionNo: dto.purchaseRequisitionNo,
    sourceDocument: sourceDocument(dto.sourceDocumentType, dto.sourceDocumentId),
    status: dto.status,
    lineCount: lines.length,
    totalQuantity: lines.reduce((total, line) => total + line.requiredQuantity, 0),
    nextNeedBy: dueDates[0] ?? "Open",
    convertedLines: lines.filter((line) => line.status.toLowerCase().includes("converted")).length,
    source,
    lines
  };
}

function mapPoLine(line: PurchaseOrderLineDto): PurchaseOrderLineItem {
  return {
    id: `po-line-${line.id}`,
    lineNo: line.lineNo,
    itemLabel: `Item ${line.itemId}`,
    orderedQuantity: line.orderedQuantity,
    expectedDate: dateLabel(line.expectedDate),
    linkedPrLine: line.purchaseRequisitionLineId ? `PR line ${line.purchaseRequisitionLineId}` : "Direct",
    linkedWorkOrder: line.linkedWorkOrderId ? `WO ${line.linkedWorkOrderId}` : "Not linked",
    status: line.status
  };
}

function mapPo(dto: PurchaseOrderDto, source: MasterDataSource): PurchaseOrderItem {
  const lines = dto.lines.map(mapPoLine);
  const expectedDates = lines.map((line) => line.expectedDate).sort();

  return {
    id: `purchase-order-${dto.id}`,
    purchaseOrderId: dto.id,
    purchaseOrderNo: dto.purchaseOrderNo,
    supplierLabel: `Supplier ${dto.supplierId}`,
    expectedReceiptDate: dateLabel(dto.expectedReceiptDate) || expectedDates[0] || "Open",
    status: dto.status,
    lineCount: lines.length,
    totalQuantity: lines.reduce((total, line) => total + line.orderedQuantity, 0),
    overdueSignal: dto.status.toLowerCase().includes("late") ? "Late supplier follow-up" : "On watch",
    source,
    lines
  };
}

function mapSubcontract(dto: SubcontractOrderDto, source: MasterDataSource): SubcontractPlanItem {
  return {
    id: `subcontract-order-${dto.id}`,
    subcontractOrderId: dto.id,
    subcontractOrderNo: dto.subcontractOrderNo,
    supplierLabel: `Supplier ${dto.supplierId}`,
    workOrderLabel: dto.workOrderId ? `WO ${dto.workOrderId}` : "Unassigned WO",
    operationLabel: dto.operationId ? `Operation ${dto.operationId}` : "Operation pending",
    expectedReturnDate: dateLabel(dto.expectedReturnDate),
    sendOutSignal: dto.workOrderId ? "Ready for send-out review" : "WO link required",
    receiveBackSignal: dto.expectedReturnDate ? `Receive back by ${dateLabel(dto.expectedReturnDate)}` : "Return date pending",
    status: dto.status,
    source
  };
}

const seededPurchaseRequisitions: PurchaseRequisitionItem[] = [
  {
    id: "pr-seeded-31",
    requisitionId: 31,
    purchaseRequisitionNo: "PR-2026-0031",
    sourceDocument: "BOQ SO-2026-0189",
    status: "Pending Approval",
    lineCount: 2,
    totalQuantity: 42,
    nextNeedBy: "2026-03-06",
    convertedLines: 0,
    source: "Seeded",
    lines: [
      {
        id: "pr-seeded-31-line-10",
        lineNo: 10,
        itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
        requiredQuantity: 25,
        needByDate: "2026-03-06",
        sourceBoqLine: "BOQ line 10",
        linkedWorkOrder: "WO-2026-044",
        status: "Pending"
      },
      {
        id: "pr-seeded-31-line-20",
        lineNo: 20,
        itemLabel: "RM-VALVE-SET / Valve Set",
        requiredQuantity: 17,
        needByDate: "2026-03-07",
        sourceBoqLine: "BOQ line 30",
        linkedWorkOrder: "WO-2026-044",
        status: "Pending"
      }
    ]
  },
  {
    id: "pr-seeded-32",
    requisitionId: 32,
    purchaseRequisitionNo: "PR-2026-0032",
    sourceDocument: "Manual stores demand",
    status: "Approved",
    lineCount: 1,
    totalQuantity: 12,
    nextNeedBy: "2026-03-10",
    convertedLines: 1,
    source: "Seeded",
    lines: [
      {
        id: "pr-seeded-32-line-10",
        lineNo: 10,
        itemLabel: "RM-GASKET-SET / Gasket Set",
        requiredQuantity: 12,
        needByDate: "2026-03-10",
        sourceBoqLine: "Manual demand",
        linkedWorkOrder: "Not linked",
        status: "Converted"
      }
    ]
  }
];

const seededPurchaseOrders: PurchaseOrderItem[] = [
  {
    id: "po-seeded-114",
    purchaseOrderId: 114,
    purchaseOrderNo: "PO-2026-0114",
    supplierLabel: "Inox Metals",
    expectedReceiptDate: "2026-03-04",
    status: "Late Follow-up",
    lineCount: 2,
    totalQuantity: 42,
    overdueSignal: "Supplier commit slipped by 2 days",
    source: "Seeded",
    lines: [
      {
        id: "po-seeded-114-line-10",
        lineNo: 10,
        itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
        orderedQuantity: 25,
        expectedDate: "2026-03-04",
        linkedPrLine: "PR-2026-0031 line 10",
        linkedWorkOrder: "WO-2026-044",
        status: "Open"
      },
      {
        id: "po-seeded-114-line-20",
        lineNo: 20,
        itemLabel: "RM-VALVE-SET / Valve Set",
        orderedQuantity: 17,
        expectedDate: "2026-03-05",
        linkedPrLine: "PR-2026-0031 line 20",
        linkedWorkOrder: "WO-2026-044",
        status: "Open"
      }
    ]
  }
];

const seededSubcontractOrders: SubcontractPlanItem[] = [
  {
    id: "subcontract-seeded-8",
    subcontractOrderId: 8,
    subcontractOrderNo: "SUB-OUT-2026-0008",
    supplierLabel: "Bright Finish Coaters",
    workOrderLabel: "WO-2026-047",
    operationLabel: "OP-POWDER-COAT",
    expectedReturnDate: "2026-03-08",
    sendOutSignal: "Send 4 frames after weld QC",
    receiveBackSignal: "Receive back before final assembly",
    status: "Send-out Planned",
    source: "Seeded"
  },
  {
    id: "subcontract-seeded-9",
    subcontractOrderId: 9,
    subcontractOrderNo: "SUB-OUT-2026-0009",
    supplierLabel: "Precision Heat Treat",
    workOrderLabel: "WO-2026-052",
    operationLabel: "OP-HEAT-TREAT",
    expectedReturnDate: "2026-03-11",
    sendOutSignal: "Batch split awaiting stores pick",
    receiveBackSignal: "Return requires incoming QC",
    status: "Awaiting Material",
    source: "Seeded"
  }
];

export async function listPurchaseRequisitionSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<PurchaseRequisitionItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededPurchaseRequisitions, filter, (item) => `${item.purchaseRequisitionNo} ${item.sourceDocument} ${item.status}`);
  }

  try {
    const response = await apiClient.procurement.purchaseRequisitions(filter);
    return response.items.map((item) => mapPr(item, "Live"));
  } catch {
    return filterSeeded(seededPurchaseRequisitions, filter, (item) => `${item.purchaseRequisitionNo} ${item.sourceDocument} ${item.status}`);
  }
}

export async function listPurchaseOrderSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<PurchaseOrderItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededPurchaseOrders, filter, (item) => `${item.purchaseOrderNo} ${item.supplierLabel} ${item.status} ${item.overdueSignal}`);
  }

  try {
    const response = await apiClient.procurement.purchaseOrders(filter);
    return response.items.map((item) => mapPo(item, "Live"));
  } catch {
    return filterSeeded(seededPurchaseOrders, filter, (item) => `${item.purchaseOrderNo} ${item.supplierLabel} ${item.status} ${item.overdueSignal}`);
  }
}

export async function listSubcontractPlanSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<SubcontractPlanItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededSubcontractOrders, filter, (item) => `${item.subcontractOrderNo} ${item.supplierLabel} ${item.workOrderLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.procurement.subcontractOrders(filter);
    return response.items.map((item) => mapSubcontract(item, "Live"));
  } catch {
    return filterSeeded(seededSubcontractOrders, filter, (item) => `${item.subcontractOrderNo} ${item.supplierLabel} ${item.workOrderLabel} ${item.status}`);
  }
}
