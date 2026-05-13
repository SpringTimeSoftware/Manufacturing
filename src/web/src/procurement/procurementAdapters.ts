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
import { liveDataUnavailable } from "../api/liveData";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface PurchaseRequisitionLineItem {
  id: string;
  lineId: number;
  lineNo: number;
  itemId: number;
  itemLabel: string;
  requiredQuantity: number;
  orderUomId: number;
  needByDate: string;
  sourceBoqRequirementLineId: number | null;
  linkedWorkOrderId: number | null;
  sourceBoqLine: string;
  linkedWorkOrder: string;
  status: string;
}

export interface PurchaseRequisitionItem {
  id: string;
  requisitionId: number;
  companyId: number;
  branchId: number;
  purchaseRequisitionNo: string;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
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
  lineId: number;
  lineNo: number;
  itemId: number;
  itemLabel: string;
  purchaseRequisitionLineId: number | null;
  orderedQuantity: number;
  orderUomId: number;
  expectedDate: string;
  linkedWorkOrderId: number | null;
  sourceBoqRequirementLineId: number | null;
  linkedPrLine: string;
  linkedWorkOrder: string;
  status: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: number;
  companyId: number;
  branchId: number;
  purchaseOrderNo: string;
  supplierId: number;
  orderAddressId: number | null;
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
  companyId: number;
  branchId: number;
  subcontractOrderNo: string;
  supplierId: number;
  supplierLabel: string;
  workOrderId: number | null;
  workOrderLabel: string;
  operationId: number | null;
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
    lineId: line.id,
    lineNo: line.lineNo,
    itemId: line.itemId,
    itemLabel: `Item ${line.itemId}`,
    requiredQuantity: line.requiredQuantity,
    orderUomId: line.orderUomId,
    needByDate: dateLabel(line.needByDate),
    sourceBoqRequirementLineId: line.sourceBoqRequirementLineId,
    linkedWorkOrderId: line.linkedWorkOrderId,
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
    companyId: dto.companyId,
    branchId: dto.branchId,
    purchaseRequisitionNo: dto.purchaseRequisitionNo,
    sourceDocumentType: dto.sourceDocumentType,
    sourceDocumentId: dto.sourceDocumentId,
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
    lineId: line.id,
    lineNo: line.lineNo,
    itemId: line.itemId,
    itemLabel: `Item ${line.itemId}`,
    purchaseRequisitionLineId: line.purchaseRequisitionLineId,
    orderedQuantity: line.orderedQuantity,
    orderUomId: line.orderUomId,
    expectedDate: dateLabel(line.expectedDate),
    linkedWorkOrderId: line.linkedWorkOrderId,
    sourceBoqRequirementLineId: line.sourceBoqRequirementLineId,
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
    companyId: dto.companyId,
    branchId: dto.branchId,
    purchaseOrderNo: dto.purchaseOrderNo,
    supplierId: dto.supplierId,
    orderAddressId: dto.orderAddressId,
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
    companyId: dto.companyId,
    branchId: dto.branchId,
    subcontractOrderNo: dto.subcontractOrderNo,
    supplierId: dto.supplierId,
    supplierLabel: `Supplier ${dto.supplierId}`,
    workOrderId: dto.workOrderId,
    workOrderLabel: dto.workOrderId ? `WO ${dto.workOrderId}` : "Unassigned WO",
    operationId: dto.operationId,
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
    companyId: 1,
    branchId: 10,
    purchaseRequisitionNo: "PR-2026-0031",
    sourceDocumentType: "BOQ",
    sourceDocumentId: 189,
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
        lineId: 31010,
        lineNo: 10,
        itemId: 10001,
        itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
        requiredQuantity: 25,
        orderUomId: 1,
        needByDate: "2026-03-06",
        sourceBoqRequirementLineId: 10,
        linkedWorkOrderId: 44,
        sourceBoqLine: "BOQ line 10",
        linkedWorkOrder: "WO-2026-044",
        status: "Pending"
      },
      {
        id: "pr-seeded-31-line-20",
        lineId: 31020,
        lineNo: 20,
        itemId: 10002,
        itemLabel: "RM-VALVE-SET / Valve Set",
        requiredQuantity: 17,
        orderUomId: 1,
        needByDate: "2026-03-07",
        sourceBoqRequirementLineId: 30,
        linkedWorkOrderId: 44,
        sourceBoqLine: "BOQ line 30",
        linkedWorkOrder: "WO-2026-044",
        status: "Pending"
      }
    ]
  },
  {
    id: "pr-seeded-32",
    requisitionId: 32,
    companyId: 1,
    branchId: 10,
    purchaseRequisitionNo: "PR-2026-0032",
    sourceDocumentType: "Manual",
    sourceDocumentId: null,
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
        lineId: 32010,
        lineNo: 10,
        itemId: 10003,
        itemLabel: "RM-GASKET-SET / Gasket Set",
        requiredQuantity: 12,
        orderUomId: 1,
        needByDate: "2026-03-10",
        sourceBoqRequirementLineId: null,
        linkedWorkOrderId: null,
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
    companyId: 1,
    branchId: 10,
    purchaseOrderNo: "PO-2026-0114",
    supplierId: 2001,
    orderAddressId: null,
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
        lineId: 11410,
        lineNo: 10,
        itemId: 10001,
        itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
        purchaseRequisitionLineId: 31010,
        orderedQuantity: 25,
        orderUomId: 1,
        expectedDate: "2026-03-04",
        linkedWorkOrderId: 44,
        sourceBoqRequirementLineId: 10,
        linkedPrLine: "PR-2026-0031 line 10",
        linkedWorkOrder: "WO-2026-044",
        status: "Open"
      },
      {
        id: "po-seeded-114-line-20",
        lineId: 11420,
        lineNo: 20,
        itemId: 10002,
        itemLabel: "RM-VALVE-SET / Valve Set",
        purchaseRequisitionLineId: 31020,
        orderedQuantity: 17,
        orderUomId: 1,
        expectedDate: "2026-03-05",
        linkedWorkOrderId: 44,
        sourceBoqRequirementLineId: 30,
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
    companyId: 1,
    branchId: 10,
    subcontractOrderNo: "SUB-OUT-2026-0008",
    supplierId: 2101,
    supplierLabel: "Bright Finish Coaters",
    workOrderId: 47,
    workOrderLabel: "WO-2026-047",
    operationId: 701,
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
    companyId: 1,
    branchId: 10,
    subcontractOrderNo: "SUB-OUT-2026-0009",
    supplierId: 2102,
    supplierLabel: "Precision Heat Treat",
    workOrderId: 52,
    workOrderLabel: "WO-2026-052",
    operationId: 702,
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
    throw liveDataUnavailable("Purchase requisition");
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
    throw liveDataUnavailable("Purchase order");
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
    throw liveDataUnavailable("Subcontract plan");
  }
}
