import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type {
  GoodsReceiptDto,
  GoodsReceiptUpsertRequest,
  PurchaseOrderUpsertRequest,
  PurchaseRequisitionUpsertRequest,
  SupplierInvoiceDto,
  SupplierInvoicePostingResultDto,
  SupplierInvoiceUpsertRequest,
  SubcontractOrderUpsertRequest,
  SubcontractReceiptUpsertRequest
} from "../api/contracts";
import { apiClient } from "../api/http";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import {
  listPurchaseOrderSetup,
  listPurchaseRequisitionSetup,
  listSubcontractPlanSetup,
  type PurchaseOrderItem,
  type PurchaseOrderLineItem,
  type PurchaseRequisitionItem,
  type PurchaseRequisitionLineItem,
  type SubcontractPlanItem
} from "../procurement/procurementAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpLookupField,
  ErpMoneyField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Live records" : "Review mode"}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("late") || normalized.includes("awaiting")
    ? "warn"
    : normalized.includes("approved") || normalized.includes("converted") || normalized.includes("planned")
      ? "success"
      : normalized.includes("blocked")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function dateControlValue(value: string | null | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function useProcurementFilter(search: string, status: string) {
  const { user } = useAuth();
  const deferredSearch = useDeferredValue(search);

  return useMemo(
    () => ({
      deferredSearch,
      filter: buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status)
    }),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
}

type WorkspaceMode = "create" | "edit";

interface PrWorkspace {
  mode: WorkspaceMode;
  record: PurchaseRequisitionItem | null;
  purchaseRequisitionNo: string;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  status: string;
  lines: PurchaseRequisitionUpsertRequest["lines"];
}

interface PoWorkspace {
  mode: WorkspaceMode;
  record: PurchaseOrderItem | null;
  purchaseOrderNo: string;
  supplierId: number | null;
  orderAddressId: number | null;
  status: string;
  expectedReceiptDate: string;
  lines: PurchaseOrderUpsertRequest["lines"];
}

interface PoReceiptWorkspace {
  purchaseOrder: PurchaseOrderItem;
  goodsReceiptNo: string;
  receiptDate: string;
  warehouseId: number | null;
  status: string;
  remarks: string | null;
  lines: GoodsReceiptUpsertRequest["lines"];
  savedReceipt: GoodsReceiptDto | null;
  supplierInvoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  currencyCode: string;
  invoiceLines: SupplierInvoiceUpsertRequest["lines"];
  savedInvoice: SupplierInvoiceDto | null;
  postingResult: SupplierInvoicePostingResultDto | null;
}

interface SubcontractWorkspace {
  mode: WorkspaceMode;
  record: SubcontractPlanItem | null;
  subcontractOrderNo: string;
  supplierId: number | null;
  workOrderId: number | null;
  operationId: number | null;
  status: string;
  expectedReturnDate: string;
}

interface SubcontractReceiptWorkspace {
  order: SubcontractPlanItem;
  receiptNo: string;
  receiptDate: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  qcStatus: string;
  status: string;
  remarks: string | null;
}

const prStatusOptions = ["Draft", "Pending", "Pending Approval", "Approved", "Converted"].map(toOption);
const poStatusOptions = ["Draft", "Open", "Approved", "Released", "Late Follow-up", "Closed"].map(toOption);
const subcontractStatusOptions = ["Draft", "Send-out Planned", "Awaiting Material", "Approved", "Closed"].map(toOption);
const sourceDocumentOptions = ["Manual", "BOQ", "MRP", "Work Order"].map(toOption);

function toOption(value: string) {
  return { label: value, value };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function nextDocumentNo(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function numberValue(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function buildPrLine(lineNo: number): PurchaseRequisitionUpsertRequest["lines"][number] {
  return {
    lineNo,
    itemId: 0,
    requiredQuantity: 1,
    orderUomId: 0,
    needByDate: todayIsoDate(),
    sourceBoqRequirementLineId: null,
    linkedWorkOrderId: null,
    status: "Pending"
  };
}

function buildPoLine(lineNo: number): PurchaseOrderUpsertRequest["lines"][number] {
  return {
    lineNo,
    itemId: 0,
    purchaseRequisitionLineId: null,
    orderedQuantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    taxPercent: 0,
    orderUomId: 0,
    expectedDate: todayIsoDate(),
    linkedWorkOrderId: null,
    sourceBoqRequirementLineId: null,
    status: "Open"
  };
}

function renumberPrLines(lines: PurchaseRequisitionUpsertRequest["lines"]) {
  return lines.map((line, index) => ({ ...line, lineNo: (index + 1) * 10 }));
}

function renumberPoLines(lines: PurchaseOrderUpsertRequest["lines"]) {
  return lines.map((line, index) => ({ ...line, lineNo: (index + 1) * 10 }));
}

function entityOptions<T>(items: T[] | undefined, getValue: (item: T) => number, getLabel: (item: T) => string) {
  return (items ?? []).map((item) => ({ label: getLabel(item), value: String(getValue(item)) }));
}

function buildPrWorkspace(record: PurchaseRequisitionItem | null): PrWorkspace {
  return {
    mode: record ? "edit" : "create",
    record,
    purchaseRequisitionNo: record?.purchaseRequisitionNo ?? nextDocumentNo("PR-DRAFT"),
    sourceDocumentType: record?.sourceDocumentType ?? "Manual",
    sourceDocumentId: record?.sourceDocumentId ?? null,
    status: record?.status ?? "Draft",
    lines: record?.lines.length
      ? record.lines.map((line) => ({
          lineNo: line.lineNo,
          itemId: line.itemId,
          requiredQuantity: line.requiredQuantity,
          orderUomId: line.orderUomId,
          needByDate: line.needByDate && line.needByDate !== "Open" ? line.needByDate : todayIsoDate(),
          sourceBoqRequirementLineId: line.sourceBoqRequirementLineId,
          linkedWorkOrderId: line.linkedWorkOrderId,
          status: line.status
        }))
      : [buildPrLine(10)]
  };
}

function buildPoWorkspace(record: PurchaseOrderItem | null): PoWorkspace {
  return {
    mode: record ? "edit" : "create",
    record,
    purchaseOrderNo: record?.purchaseOrderNo ?? nextDocumentNo("PO-DRAFT"),
    supplierId: record?.supplierId ?? null,
    orderAddressId: record?.orderAddressId ?? null,
    status: record?.status ?? "Draft",
    expectedReceiptDate: record?.expectedReceiptDate && record.expectedReceiptDate !== "Open" ? record.expectedReceiptDate : todayIsoDate(),
    lines: record?.lines.length
      ? record.lines.map((line) => ({
          lineNo: line.lineNo,
          itemId: line.itemId,
          purchaseRequisitionLineId: line.purchaseRequisitionLineId,
          orderedQuantity: line.orderedQuantity,
          unitPrice: line.unitPrice,
          discountPercent: line.discountPercent,
          taxPercent: line.taxPercent,
          orderUomId: line.orderUomId,
          expectedDate: line.expectedDate && line.expectedDate !== "Open" ? line.expectedDate : todayIsoDate(),
          linkedWorkOrderId: line.linkedWorkOrderId,
          sourceBoqRequirementLineId: line.sourceBoqRequirementLineId,
          status: line.status
        }))
      : [buildPoLine(10)]
  };
}

function buildPoReceiptWorkspace(record: PurchaseOrderItem): PoReceiptWorkspace {
  return {
    purchaseOrder: record,
    goodsReceiptNo: nextDocumentNo("GRN"),
    receiptDate: todayIsoDate(),
    warehouseId: null,
    status: "Received",
    remarks: `Receipt against ${record.purchaseOrderNo}`,
    lines: record.lines.map((line) => ({
      lineNo: line.lineNo,
      purchaseOrderLineId: line.lineId,
      receivedQuantity: line.orderedQuantity,
      acceptedQuantity: line.orderedQuantity,
      rejectedQuantity: 0,
      qcStatus: "Accepted",
      status: "Received"
    })),
    savedReceipt: null,
    supplierInvoiceNo: nextDocumentNo("SUP-INV"),
    invoiceDate: todayIsoDate(),
    dueDate: "",
    currencyCode: "INR",
    invoiceLines: [],
    savedInvoice: null,
    postingResult: null
  };
}

function buildInvoiceLinesFromReceipt(receipt: GoodsReceiptDto): SupplierInvoiceUpsertRequest["lines"] {
  return receipt.lines
    .filter((line) => line.acceptedQuantity > 0)
    .map((line) => ({
      lineNo: line.lineNo,
      purchaseOrderLineId: line.purchaseOrderLineId,
      goodsReceiptLineId: line.id,
      invoiceQuantity: line.acceptedQuantity,
      unitPrice: line.unitPrice,
      taxPercent: line.taxPercent
    }));
}

function buildSubcontractWorkspace(record: SubcontractPlanItem | null): SubcontractWorkspace {
  return {
    mode: record ? "edit" : "create",
    record,
    subcontractOrderNo: record?.subcontractOrderNo ?? nextDocumentNo("SUB-DRAFT"),
    supplierId: record?.supplierId ?? null,
    workOrderId: record?.workOrderId ?? null,
    operationId: record?.operationId ?? null,
    status: record?.status ?? "Draft",
    expectedReturnDate: record?.expectedReturnDate && record.expectedReturnDate !== "Open" ? record.expectedReturnDate : todayIsoDate()
  };
}

function buildSubcontractReceiptWorkspace(order: SubcontractPlanItem): SubcontractReceiptWorkspace {
  return {
    order,
    receiptNo: nextDocumentNo("SUB-RCV"),
    receiptDate: todayIsoDate(),
    receivedQuantity: 1,
    acceptedQuantity: 1,
    rejectedQuantity: 0,
    qcStatus: "Accepted",
    status: "Received",
    remarks: `Receive-back against ${order.subcontractOrderNo}`
  };
}

function buildPurchaseRequisitionRequest(workspace: PrWorkspace, companyId: number, branchId: number): PurchaseRequisitionUpsertRequest {
  return {
    companyId: workspace.record?.companyId ?? companyId,
    branchId: workspace.record?.branchId ?? branchId,
    purchaseRequisitionNo: workspace.purchaseRequisitionNo,
    sourceDocumentType: workspace.sourceDocumentType,
    sourceDocumentId: workspace.sourceDocumentId,
    status: workspace.status,
    lines: renumberPrLines(workspace.lines)
  };
}

function buildPurchaseOrderRequest(workspace: PoWorkspace, companyId: number, branchId: number): PurchaseOrderUpsertRequest {
  return {
    companyId: workspace.record?.companyId ?? companyId,
    branchId: workspace.record?.branchId ?? branchId,
    purchaseOrderNo: workspace.purchaseOrderNo,
    supplierId: workspace.supplierId ?? 0,
    orderAddressId: workspace.orderAddressId,
    status: workspace.status,
    expectedReceiptDate: workspace.expectedReceiptDate || null,
    lines: renumberPoLines(workspace.lines)
  };
}

function buildGoodsReceiptRequest(workspace: PoReceiptWorkspace, companyId: number, branchId: number): GoodsReceiptUpsertRequest {
  return {
    companyId: workspace.purchaseOrder.companyId || companyId,
    branchId: workspace.purchaseOrder.branchId || branchId,
    goodsReceiptNo: workspace.goodsReceiptNo,
    purchaseOrderId: workspace.purchaseOrder.purchaseOrderId,
    receiptDate: workspace.receiptDate,
    warehouseId: workspace.warehouseId,
    status: workspace.status,
    remarks: workspace.remarks,
    lines: workspace.lines.map((line, index) => ({
      ...line,
      lineNo: (index + 1) * 10
    }))
  };
}

function buildSupplierInvoiceRequest(workspace: PoReceiptWorkspace, companyId: number, branchId: number): SupplierInvoiceUpsertRequest {
  if (!workspace.savedReceipt) {
    throw new Error("Save the goods receipt before creating the supplier invoice.");
  }

  return {
    companyId: workspace.purchaseOrder.companyId || companyId,
    branchId: workspace.purchaseOrder.branchId || branchId,
    supplierInvoiceNo: workspace.supplierInvoiceNo,
    supplierId: workspace.purchaseOrder.supplierId,
    purchaseOrderId: workspace.purchaseOrder.purchaseOrderId,
    goodsReceiptId: workspace.savedReceipt.id,
    invoiceDate: workspace.invoiceDate,
    dueDate: workspace.dueDate || null,
    currencyCode: workspace.currencyCode,
    status: "Draft",
    lines: workspace.invoiceLines
  };
}

function buildSubcontractRequest(workspace: SubcontractWorkspace, companyId: number, branchId: number): SubcontractOrderUpsertRequest {
  return {
    companyId: workspace.record?.companyId ?? companyId,
    branchId: workspace.record?.branchId ?? branchId,
    subcontractOrderNo: workspace.subcontractOrderNo,
    supplierId: workspace.supplierId ?? 0,
    workOrderId: workspace.workOrderId,
    operationId: workspace.operationId,
    status: workspace.status,
    expectedReturnDate: workspace.expectedReturnDate || null
  };
}

function buildSubcontractReceiptRequest(workspace: SubcontractReceiptWorkspace, companyId: number, branchId: number): SubcontractReceiptUpsertRequest {
  return {
    companyId: workspace.order.companyId || companyId,
    branchId: workspace.order.branchId || branchId,
    receiptNo: workspace.receiptNo,
    subcontractOrderId: workspace.order.subcontractOrderId,
    receiptDate: workspace.receiptDate,
    receivedQuantity: workspace.receivedQuantity,
    acceptedQuantity: workspace.acceptedQuantity,
    rejectedQuantity: workspace.rejectedQuantity,
    qcStatus: workspace.qcStatus,
    status: workspace.status,
    remarks: workspace.remarks
  };
}

function procurementValidationErrors(workspace: PrWorkspace | PoWorkspace | SubcontractWorkspace | null) {
  if (!workspace) {
    return [];
  }

  const errors: string[] = [];

  if ("purchaseRequisitionNo" in workspace && !workspace.purchaseRequisitionNo.trim()) {
    errors.push("Purchase requisition number is required.");
  }

  if ("purchaseOrderNo" in workspace && !workspace.purchaseOrderNo.trim()) {
    errors.push("Purchase order number is required.");
  }

  if ("subcontractOrderNo" in workspace && !workspace.subcontractOrderNo.trim()) {
    errors.push("Subcontract order number is required.");
  }

  if ("supplierId" in workspace && !workspace.supplierId) {
    errors.push("Supplier is required.");
  }

  if ("lines" in workspace) {
    if (workspace.lines.length === 0) {
      errors.push("At least one line is required.");
    }

    workspace.lines.forEach((line, index) => {
      if (!line.itemId) {
        errors.push(`Line ${index + 1} item is required.`);
      }
      if (!line.orderUomId) {
        errors.push(`Line ${index + 1} order UOM is required.`);
      }
      if ("requiredQuantity" in line && (!line.requiredQuantity || line.requiredQuantity <= 0)) {
        errors.push(`Line ${index + 1} required quantity must be greater than zero.`);
      }
      if ("orderedQuantity" in line && (!line.orderedQuantity || line.orderedQuantity <= 0)) {
        errors.push(`Line ${index + 1} ordered quantity must be greater than zero.`);
      }
      if ("needByDate" in line && !line.needByDate) {
        errors.push(`Line ${index + 1} need-by date is required.`);
      }
      if ("expectedDate" in line && !line.expectedDate) {
        errors.push(`Line ${index + 1} expected line date is required.`);
      }
    });
  }

  return errors;
}

function receiptValidationErrors(workspace: PoReceiptWorkspace | null) {
  if (!workspace) {
    return [];
  }

  const errors: string[] = [];

  if (!workspace.goodsReceiptNo.trim()) {
    errors.push("GRN number is required.");
  }

  if (!workspace.receiptDate) {
    errors.push("Receipt date is required.");
  }

  if (!workspace.warehouseId) {
    errors.push("Receiving warehouse is required.");
  }

  if (workspace.lines.length === 0) {
    errors.push("At least one receipt line is required.");
  }

  workspace.lines.forEach((line, index) => {
    if (!line.purchaseOrderLineId) {
      errors.push(`Receipt line ${index + 1} must reference a purchase order line.`);
    }
    if (!line.receivedQuantity || line.receivedQuantity <= 0) {
      errors.push(`Receipt line ${index + 1} received quantity must be greater than zero.`);
    }
    if (line.acceptedQuantity < 0 || line.rejectedQuantity < 0) {
      errors.push(`Receipt line ${index + 1} accepted and rejected quantities cannot be negative.`);
    }
    if (line.acceptedQuantity + line.rejectedQuantity !== line.receivedQuantity) {
      errors.push(`Receipt line ${index + 1} accepted plus rejected quantity must equal received quantity before posting.`);
    }
  });

  return errors;
}

function invoiceValidationErrors(workspace: PoReceiptWorkspace | null) {
  if (!workspace) {
    return [];
  }

  const errors: string[] = [];

  if (!workspace.savedReceipt) {
    errors.push("Save the GRN before creating a supplier invoice.");
  }

  if (!workspace.supplierInvoiceNo.trim()) {
    errors.push("Supplier invoice number is required.");
  }

  if (!workspace.invoiceDate) {
    errors.push("Supplier invoice date is required.");
  }

  if (!workspace.currencyCode.trim()) {
    errors.push("Currency is required.");
  }

  if (workspace.invoiceLines.length === 0) {
    errors.push("At least one accepted receipt line is required for invoice matching.");
  }

  workspace.invoiceLines.forEach((line, index) => {
    if (!line.goodsReceiptLineId || !line.purchaseOrderLineId) {
      errors.push(`Invoice line ${index + 1} must reference GRN and PO lines.`);
    }
    if (!line.invoiceQuantity || line.invoiceQuantity <= 0) {
      errors.push(`Invoice line ${index + 1} invoice quantity must be greater than zero.`);
    }
    if (line.unitPrice < 0) {
      errors.push(`Invoice line ${index + 1} unit price cannot be negative.`);
    }
    if (line.taxPercent < 0 || line.taxPercent > 100) {
      errors.push(`Invoice line ${index + 1} tax percent must be between 0 and 100.`);
    }
  });

  return errors;
}

function subcontractReceiptValidationErrors(workspace: SubcontractReceiptWorkspace | null) {
  if (!workspace) {
    return [];
  }

  const errors: string[] = [];

  if (!workspace.receiptNo.trim()) {
    errors.push("Subcontract receipt number is required.");
  }

  if (!workspace.receiptDate) {
    errors.push("Receipt date is required.");
  }

  if (!workspace.receivedQuantity || workspace.receivedQuantity <= 0) {
    errors.push("Received quantity must be greater than zero.");
  }

  if (workspace.acceptedQuantity < 0 || workspace.rejectedQuantity < 0) {
    errors.push("Accepted and rejected quantities cannot be negative.");
  }

  if (workspace.acceptedQuantity + workspace.rejectedQuantity !== workspace.receivedQuantity) {
    errors.push("Accepted plus rejected quantity must equal received quantity.");
  }

  if (!workspace.qcStatus.trim()) {
    errors.push("QC status is required.");
  }

  if (!workspace.status.trim()) {
    errors.push("Receipt status is required.");
  }

  return errors;
}

const prColumns: DataGridColumn<PurchaseRequisitionItem>[] = [
  { key: "pr", header: "PR", width: "18%", render: (record) => <strong>{record.purchaseRequisitionNo}</strong> },
  { key: "source", header: "Source", render: (record) => record.sourceDocument },
  { key: "need", header: "Need by", width: "14%", render: (record) => record.nextNeedBy },
  { key: "qty", header: "Lines / qty", width: "14%", render: (record) => `${record.lineCount} / ${record.totalQuantity}` },
  { key: "converted", header: "Converted", width: "12%", render: (record) => record.convertedLines },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.status} /> }
];

const prLineColumns: DataGridColumn<PurchaseRequisitionLineItem>[] = [
  { key: "line", header: "Line", width: "10%", render: (record) => record.lineNo },
  { key: "item", header: "Item", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.requiredQuantity },
  { key: "need", header: "Need by", width: "14%", render: (record) => record.needByDate },
  { key: "source", header: "BOQ / WO", width: "22%", render: (record) => `${record.sourceBoqLine} / ${record.linkedWorkOrder}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function PurchaseRequisitionPage() {
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [workspace, setWorkspace] = useState<PrWorkspace | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useProcurementFilter(search, status);
  const query = useApiQuery(queryKeys.procurement.purchaseRequisitions(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listPurchaseRequisitionSetup(session, filter), { staleTime: 60_000 });
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const uoms = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => apiClient.measurements.uoms({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const preview = workspace?.record ?? records[0] ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const validationErrors = procurementValidationErrors(workspace);
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const uomOptions = entityOptions(uoms.data?.items, (uom) => uom.id, (uom) => `${uom.uomCode} / ${uom.uomName}`);
  const saveRequisition = useApiMutation(
    (request: PurchaseRequisitionUpsertRequest) =>
      workspace?.record
        ? apiClient.procurement.updatePurchaseRequisition(workspace.record.requisitionId, request)
        : apiClient.procurement.createPurchaseRequisition(request),
    {
      onSuccess: async (record) => {
        setMessage(`Saved ${record.purchaseRequisitionNo}.`);
        setWorkspace(null);
        await query.refetch();
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const approveRequisition = useApiMutation((id: number) => apiClient.procurement.approvePurchaseRequisition(id), {
    onSuccess: async (record) => {
      setMessage(`Approved ${record.purchaseRequisitionNo}.`);
      setWorkspace(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const saveReason = !live
    ? "Purchase requisition save requires a live procurement session."
    : validationErrors.length > 0
      ? "Resolve validation issues before saving."
      : saveRequisition.isPending
        ? "Purchase requisition save is in progress."
        : undefined;
  const approveReason = !live
    ? "Purchase requisition approval requires a live procurement session."
    : !workspace?.record
      ? "Open a saved requisition before approval."
      : workspace.record.status.toLowerCase().includes("approved")
        ? "This requisition is already approved."
        : approveRequisition.isPending
          ? "Purchase requisition approval is in progress."
          : undefined;

  const updateLine = (lineIndex: number, patch: Partial<PurchaseRequisitionUpsertRequest["lines"][number]>) => {
    if (!workspace) {
      return;
    }

    setWorkspace({
      ...workspace,
      lines: workspace.lines.map((line, index) => (index === lineIndex ? { ...line, ...patch } : line))
    });
  };

  const addLine = () => {
    if (!workspace) {
      return;
    }

    setWorkspace({ ...workspace, lines: [...workspace.lines, buildPrLine((workspace.lines.length + 1) * 10)] });
  };

  const removeLine = (lineIndex: number) => {
    if (!workspace) {
      return;
    }

    setWorkspace({
      ...workspace,
      lines: renumberPrLines(workspace.lines.filter((_, index) => index !== lineIndex))
    });
  };

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "New PR draft", onClick: () => { setMessage(null); setWorkspace(buildPrWorkspace(null)); } }, { disabled: Boolean(approveReason), label: approveRequisition.isPending ? "Approving requisition" : "Approve selected", onClick: approveReason || !workspace?.record ? undefined : () => approveRequisition.mutate(workspace.record!.requisitionId), reason: approveReason }]} secondary={[{ disabled: true, label: "Export PR queue", reason: "PR export is pending the approved reporting workflow." }]} testId="purchase-requisition-action-bar" /></>}
        aside={
          <Card title="PR conversion guardrail" description="PR approval and conversion remain explicit; this page does not invent RFQ or accounting scope.">
            {preview ? <div className="utility-grid"><Tile eyebrow={preview.status} label="Need by" meta={preview.sourceDocument}>{preview.nextNeedBy}</Tile><Tile eyebrow="Lines" label="Total quantity" meta={`${preview.convertedLines} converted`}>{preview.totalQuantity}</Tile></div> : null}
          </Card>
        }
        description="List and approve purchase requisitions created from planning or manual demand."
        filters={<FilterBar><input aria-label="Search purchase requisitions" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search PR, source, item" value={search} /><select aria-label="Purchase requisition status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Converted">Converted</option></select></FilterBar>}
        title="Purchase Requisition List / Detail"
      >
        {query.error ? <Card title="Live procurement data unavailable" description={query.error.message} /> : null}
        {message ? <Badge tone={message.toLowerCase().includes("saved") || message.toLowerCase().includes("approved") ? "success" : "danger"}>{message}</Badge> : null}
        <KpiStrip items={[{ label: "PRs", value: String(records.length) }, { label: "Pending", value: String(records.filter((record) => record.status.includes("Pending")).length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }]} />
        <Card title="Purchase requisition queue" description="Planning-created and manual demand lines stay visible before approval.">
          <DataGrid ariaLabel="Purchase requisition list" columns={prColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => { setMessage(null); setWorkspace(buildPrWorkspace(record)); }} records={records} rowLabel={(record) => `${record.purchaseRequisitionNo} purchase requisition`} virtualization={{ enabled: true }} />
        </Card>
        <Card title="Purchase requisition detail" description={preview ? preview.sourceDocument : "Select a PR to inspect lines."}>
          <DataGrid ariaLabel="Purchase requisition lines" columns={prLineColumns} getRowId={(record) => record.id} records={preview?.lines ?? []} rowLabel={(record) => `${record.itemLabel} purchase requisition line`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description={workspace?.mode === "create" ? "Create a purchase requisition draft from manual or planning demand." : "Edit and approve a purchase requisition with governed item, UOM, quantity, and date controls."}
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason), label: saveRequisition.isPending ? "Saving requisition" : "Save requisition", onClick: workspace && !saveReason ? () => saveRequisition.mutate(buildPurchaseRequisitionRequest(workspace, companyId, branchId)) : undefined, reason: saveReason }]} secondary={[{ disabled: Boolean(approveReason), label: approveRequisition.isPending ? "Approving requisition" : "Approve requisition", onClick: approveReason || !workspace?.record ? undefined : () => approveRequisition.mutate(workspace.record!.requisitionId), reason: approveReason }]} utility={[{ label: "Close", onClick: () => setWorkspace(null), variant: "quiet" }]} />}
        isOpen={Boolean(workspace)}
        onClose={() => setWorkspace(null)}
        title={workspace?.purchaseRequisitionNo ?? "Purchase requisition"}
        validation={<ErpValidationSummary errors={validationErrors} />}
      >
        {workspace ? (
          <div className="modal-form-grid">
            <FormShell initialFingerprint={`${workspace.mode}-${workspace.record?.id ?? "new"}-${workspace.purchaseRequisitionNo}`} title="Purchase requisition controls">
              <label><span>Purchase requisition number</span><input aria-label="Purchase requisition number" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, purchaseRequisitionNo: event.target.value })} value={workspace.purchaseRequisitionNo} /></label>
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing source type."} label="Source type" onChange={(value) => setWorkspace({ ...workspace, sourceDocumentType: value })} options={sourceDocumentOptions} required value={workspace.sourceDocumentType} />
              <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before assigning a source id."} label="Source document id" min={1} onChange={(value) => setWorkspace({ ...workspace, sourceDocumentId: value })} value={workspace.sourceDocumentId} />
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing status."} label="Status" onChange={(value) => setWorkspace({ ...workspace, status: value })} options={prStatusOptions} required value={workspace.status} />
            </FormShell>
            <Card title="Purchase requisition lines" description="Add every required material or service line before approval.">
              <ErpActionBar secondary={[{ disabled: !live, label: "Add Line", onClick: live ? addLine : undefined, reason: live ? undefined : "Live procurement sign-in is required before adding lines." }]} />
              {workspace.lines.map((line, index) => (
                <FormShell initialFingerprint={`${workspace.mode}-${workspace.record?.id ?? "new"}-line-${line.lineNo}`} key={`${line.lineNo}-${index}`} title={`Line ${index + 1}`}>
                  <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before selecting an item."} label="Item" onChange={(value) => updateLine(index, { itemId: numberValue(value) ?? 0 })} options={itemOptions} required value={line.itemId ? String(line.itemId) : ""} />
                  <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before selecting a UOM."} label="Order UOM" onChange={(value) => updateLine(index, { orderUomId: numberValue(value) ?? 0 })} options={uomOptions} required value={line.orderUomId ? String(line.orderUomId) : ""} />
                  <ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing quantity."} label="Required quantity" min={0.001} onChange={(value) => updateLine(index, { requiredQuantity: value ?? 0 })} required value={line.requiredQuantity} />
                  <label><span>Need by</span><input aria-label="Need by" disabled={!live} onChange={(event) => updateLine(index, { needByDate: event.target.value })} required type="date" value={dateControlValue(line.needByDate)} /></label>
                  <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing line status."} label="Line status" onChange={(value) => updateLine(index, { status: value })} options={prStatusOptions} value={line.status} />
                  <ErpActionBar danger={[{ disabled: !live || workspace.lines.length <= 1, label: "Remove Line", onClick: live && workspace.lines.length > 1 ? () => removeLine(index) : undefined, reason: !live ? "Live procurement sign-in is required before removing lines." : workspace.lines.length <= 1 ? "At least one requisition line is required." : undefined }]} />
                </FormShell>
              ))}
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const poColumns: DataGridColumn<PurchaseOrderItem>[] = [
  { key: "po", header: "PO", width: "18%", render: (record) => <strong>{record.purchaseOrderNo}</strong> },
  { key: "supplier", header: "Supplier", render: (record) => record.supplierLabel },
  { key: "expected", header: "Expected", width: "14%", render: (record) => record.expectedReceiptDate },
  { key: "qty", header: "Lines / qty", width: "14%", render: (record) => `${record.lineCount} / ${record.totalQuantity}` },
  { key: "followup", header: "Follow-up", width: "22%", render: (record) => record.overdueSignal },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.status} /> }
];

const poLineColumns: DataGridColumn<PurchaseOrderLineItem>[] = [
  { key: "line", header: "Line", width: "10%", render: (record) => record.lineNo },
  { key: "item", header: "Item", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.orderedQuantity },
  { key: "date", header: "Expected", width: "14%", render: (record) => record.expectedDate },
  { key: "links", header: "PR / WO", width: "22%", render: (record) => `${record.linkedPrLine} / ${record.linkedWorkOrder}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function PurchaseOrderPage() {
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [workspace, setWorkspace] = useState<PoWorkspace | null>(null);
  const [receiptWorkspace, setReceiptWorkspace] = useState<PoReceiptWorkspace | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useProcurementFilter(search, status);
  const query = useApiQuery(queryKeys.procurement.purchaseOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listPurchaseOrderSetup(session, filter), { staleTime: 60_000 });
  const suppliers = useApiQuery(queryKeys.partners.suppliers(companyId, branchId, "", "Active"), () => apiClient.partners.suppliers({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const uoms = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => apiClient.measurements.uoms({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const warehouses = useApiQuery(queryKeys.organization.warehouses(companyId, branchId, "", "Active"), () => apiClient.organization.warehouses({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const preview = workspace?.record ?? records[0] ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const supplierOptions = entityOptions(suppliers.data?.items, (supplier) => supplier.id, (supplier) => `${supplier.supplierCode} / ${supplier.supplierName}`);
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const uomOptions = entityOptions(uoms.data?.items, (uom) => uom.id, (uom) => `${uom.uomCode} / ${uom.uomName}`);
  const warehouseOptions = entityOptions(warehouses.data?.items, (warehouse) => warehouse.id, (warehouse) => `${warehouse.warehouseCode} / ${warehouse.warehouseName}`);
  const validationErrors = procurementValidationErrors(workspace);
  const grnErrors = receiptValidationErrors(receiptWorkspace);
  const invoiceErrors = invoiceValidationErrors(receiptWorkspace);
  const savePurchaseOrder = useApiMutation(
    (request: PurchaseOrderUpsertRequest) =>
      workspace?.record
        ? apiClient.procurement.updatePurchaseOrder(workspace.record.purchaseOrderId, request)
        : apiClient.procurement.createPurchaseOrder(request),
    {
      onSuccess: async (record) => {
        setMessage(`Saved ${record.purchaseOrderNo}.`);
        setWorkspace(null);
        await query.refetch();
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const approvePurchaseOrder = useApiMutation((id: number) => apiClient.procurement.approvePurchaseOrder(id), {
    onSuccess: async (record) => {
      setMessage(`Approved ${record.purchaseOrderNo}.`);
      setWorkspace(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const saveReceipt = useApiMutation((request: GoodsReceiptUpsertRequest) => apiClient.procurement.createGoodsReceipt(request), {
    onSuccess: (record) => {
      setMessage(`Saved ${record.goodsReceiptNo} and posted accepted/rejected quantities to inventory.`);
      setReceiptWorkspace((current) =>
        current
          ? {
              ...current,
              savedReceipt: record,
              invoiceLines: buildInvoiceLinesFromReceipt(record),
              savedInvoice: null,
              postingResult: null
            }
          : current
      );
    },
    onError: (error) => setMessage(error.message)
  });
  const createSupplierInvoice = useApiMutation((request: SupplierInvoiceUpsertRequest) => apiClient.procurement.createSupplierInvoice(request), {
    onSuccess: (record) => {
      setMessage(`Created supplier invoice ${record.supplierInvoiceNo} with ${record.matchStatus.toLowerCase()} match status.`);
      setReceiptWorkspace((current) => (current ? { ...current, savedInvoice: record, postingResult: null } : current));
    },
    onError: (error) => setMessage(error.message)
  });
  const matchSupplierInvoice = useApiMutation((id: number) => apiClient.procurement.matchSupplierInvoice(id), {
    onSuccess: (record) => {
      setMessage(`Matched supplier invoice ${record.supplierInvoiceNo}.`);
      setReceiptWorkspace((current) => (current ? { ...current, savedInvoice: record } : current));
    },
    onError: (error) => setMessage(error.message)
  });
  const postSupplierInvoice = useApiMutation((id: number) => apiClient.procurement.postSupplierInvoice(id), {
    onSuccess: async (record) => {
      setMessage(`Posted ${record.invoice.supplierInvoiceNo} to AP liability ${record.liability.liabilityNo}.`);
      setReceiptWorkspace((current) => (current ? { ...current, savedInvoice: record.invoice, postingResult: record } : current));
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const saveReason = !live
    ? "Purchase order save requires a live procurement session."
    : validationErrors.length > 0
      ? "Resolve validation issues before saving."
      : savePurchaseOrder.isPending
        ? "Purchase order save is in progress."
        : undefined;
  const approveReason = !live
    ? "Purchase order approval requires a live procurement session."
    : !workspace?.record
      ? "Open a saved purchase order before approval."
      : workspace.record.status.toLowerCase().includes("approved")
        ? "This purchase order is already approved."
        : approvePurchaseOrder.isPending
          ? "Purchase order approval is in progress."
          : undefined;
  const receiveReason = !live
    ? "PO receiving requires a live procurement session."
    : !workspace?.record
      ? "Open a saved purchase order before receiving."
      : workspace.record.lines.length === 0
        ? "Purchase order must have at least one saved line before receiving."
        : undefined;
  const saveReceiptReason = !live
    ? "GRN save requires a live procurement session."
    : grnErrors.length > 0
      ? "Resolve GRN validation issues before saving."
      : receiptWorkspace?.savedReceipt
        ? "This GRN is already saved. Create or post the supplier invoice next."
        : saveReceipt.isPending
          ? "GRN save is in progress."
          : undefined;
  const createInvoiceReason = !live
    ? "Supplier invoice creation requires a live procurement session."
    : invoiceErrors.length > 0
      ? "Resolve supplier invoice validation issues before creating the invoice."
      : receiptWorkspace?.savedInvoice
        ? "Supplier invoice is already created for this receipt workspace."
        : createSupplierInvoice.isPending
          ? "Supplier invoice creation is in progress."
          : undefined;
  const matchInvoiceReason = !live
    ? "Supplier invoice match requires a live procurement session."
    : !receiptWorkspace?.savedInvoice
      ? "Create the supplier invoice before matching."
      : matchSupplierInvoice.isPending
        ? "Supplier invoice match is in progress."
        : undefined;
  const postInvoiceReason = !live
    ? "AP posting requires a live procurement session."
    : !receiptWorkspace?.savedInvoice
      ? "Create and match the supplier invoice before AP posting."
      : receiptWorkspace.savedInvoice.matchStatus !== "Matched"
        ? "Only matched supplier invoices can be posted to AP."
        : receiptWorkspace.savedInvoice.apStatus === "Posted" || receiptWorkspace.postingResult
          ? "Supplier invoice is already posted to AP."
          : postSupplierInvoice.isPending
            ? "AP posting is in progress."
            : undefined;

  const updateLine = (lineIndex: number, patch: Partial<PurchaseOrderUpsertRequest["lines"][number]>) => {
    if (!workspace) {
      return;
    }

    setWorkspace({
      ...workspace,
      lines: workspace.lines.map((line, index) => (index === lineIndex ? { ...line, ...patch } : line))
    });
  };

  const addLine = () => {
    if (!workspace) {
      return;
    }

    setWorkspace({ ...workspace, lines: [...workspace.lines, buildPoLine((workspace.lines.length + 1) * 10)] });
  };

  const removeLine = (lineIndex: number) => {
    if (!workspace) {
      return;
    }

    setWorkspace({
      ...workspace,
      lines: renumberPoLines(workspace.lines.filter((_, index) => index !== lineIndex))
    });
  };

  const updateReceiptLine = (lineIndex: number, patch: Partial<GoodsReceiptUpsertRequest["lines"][number]>) => {
    if (!receiptWorkspace || receiptWorkspace.savedReceipt) {
      return;
    }

    setReceiptWorkspace({
      ...receiptWorkspace,
      lines: receiptWorkspace.lines.map((line, index) => (index === lineIndex ? { ...line, ...patch } : line))
    });
  };

  const updateInvoiceLine = (lineIndex: number, patch: Partial<SupplierInvoiceUpsertRequest["lines"][number]>) => {
    if (!receiptWorkspace || receiptWorkspace.savedInvoice) {
      return;
    }

    setReceiptWorkspace({
      ...receiptWorkspace,
      invoiceLines: receiptWorkspace.invoiceLines.map((line, index) => (index === lineIndex ? { ...line, ...patch } : line))
    });
  };

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "New PO draft", onClick: () => { setMessage(null); setWorkspace(buildPoWorkspace(null)); } }, { disabled: Boolean(approveReason), label: approvePurchaseOrder.isPending ? "Approving PO" : "Approve PO", onClick: approveReason || !workspace?.record ? undefined : () => approvePurchaseOrder.mutate(workspace.record!.purchaseOrderId), reason: approveReason }]} secondary={[{ disabled: true, label: "Export PO follow-up", reason: "PO export is pending the approved reporting workflow." }]} testId="purchase-order-action-bar" /></>} description="PO list with status, overdue follow-up, receipts context, and source linkage." filters={<FilterBar><input aria-label="Search purchase orders" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search PO, supplier, item, follow-up" value={search} /><select aria-label="Purchase order status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="Late">Late</option><option value="Approved">Approved</option></select></FilterBar>} title="Purchase Order List / Detail">
        {query.error ? <Card title="Live purchase-order data unavailable" description={query.error.message} /> : null}
        {message ? <Badge tone={message.toLowerCase().includes("saved") || message.toLowerCase().includes("approved") ? "success" : "danger"}>{message}</Badge> : null}
        <KpiStrip items={[{ label: "POs", value: String(records.length) }, { label: "Late", value: String(records.filter((record) => record.status.includes("Late")).length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }]} />
        <div className="split-panels">
          <Card title="Purchase order queue" description="Supplier commitments are visible without entering landed-cost or accounting scope.">
            <DataGrid ariaLabel="Purchase order list" columns={poColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => { setMessage(null); setWorkspace(buildPoWorkspace(record)); }} records={records} rowLabel={(record) => `${record.purchaseOrderNo} purchase order`} />
          </Card>
          <Card title="Purchase order detail" description={preview ? preview.supplierLabel : "Select a PO to inspect lines."}>
            <DataGrid ariaLabel="Purchase order lines" columns={poLineColumns} getRowId={(record) => record.id} records={preview?.lines ?? []} rowLabel={(record) => `${record.itemLabel} purchase order line`} />
          </Card>
        </div>
      </ListPageShell>
      <ErpModalWorkspace
        description={workspace?.mode === "create" ? "Create a purchase order draft for an approved supplier." : "Edit and approve purchase-order follow-up fields with governed controls."}
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason), label: savePurchaseOrder.isPending ? "Saving purchase order" : "Save purchase order", onClick: workspace && !saveReason ? () => savePurchaseOrder.mutate(buildPurchaseOrderRequest(workspace, companyId, branchId)) : undefined, reason: saveReason }]} secondary={[{ disabled: Boolean(approveReason), label: approvePurchaseOrder.isPending ? "Approving PO" : "Approve PO", onClick: approveReason || !workspace?.record ? undefined : () => approvePurchaseOrder.mutate(workspace.record!.purchaseOrderId), reason: approveReason }, { disabled: Boolean(receiveReason), label: "Receive against PO", onClick: !receiveReason && workspace?.record ? () => { setReceiptWorkspace(buildPoReceiptWorkspace(workspace.record!)); setWorkspace(null); setMessage(null); } : undefined, reason: receiveReason }]} utility={[{ label: "Close", onClick: () => setWorkspace(null), variant: "quiet" }]} />}
        isOpen={Boolean(workspace)}
        onClose={() => setWorkspace(null)}
        title={workspace?.purchaseOrderNo ?? "Purchase order"}
        validation={<ErpValidationSummary errors={validationErrors} />}
      >
        {workspace ? (
          <div className="modal-form-grid">
            <FormShell initialFingerprint={`${workspace.mode}-${workspace.record?.id ?? "new"}-${workspace.purchaseOrderNo}`} title="Purchase order follow-up">
              <label><span>Purchase order number</span><input aria-label="Purchase order number" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, purchaseOrderNo: event.target.value })} value={workspace.purchaseOrderNo} /></label>
              <ErpLookupField disabled={!live || workspace.mode === "edit"} disabledReason={workspace.mode === "edit" ? "Supplier cannot be changed after the purchase order is saved." : live ? undefined : "Live procurement sign-in is required before selecting a supplier."} label="Supplier" onChange={(value) => setWorkspace({ ...workspace, supplierId: numberValue(value) })} options={supplierOptions} required value={workspace.supplierId ? String(workspace.supplierId) : ""} />
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing status."} label="Status" onChange={(value) => setWorkspace({ ...workspace, status: value })} options={poStatusOptions} required value={workspace.status} />
              <label><span>Expected receipt</span><input aria-label="Expected receipt" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, expectedReceiptDate: event.target.value })} type="date" value={dateControlValue(workspace.expectedReceiptDate)} /></label>
            </FormShell>
            <Card title="Purchase order lines" description="Add every supplier commitment line before saving the purchase order.">
              <ErpActionBar secondary={[{ disabled: !live, label: "Add Line", onClick: live ? addLine : undefined, reason: live ? undefined : "Live procurement sign-in is required before adding lines." }]} />
              {workspace.lines.map((line, index) => (
                <FormShell initialFingerprint={`${workspace.mode}-${workspace.record?.id ?? "new"}-line-${line.lineNo}`} key={`${line.lineNo}-${index}`} title={`Line ${index + 1}`}>
                  <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before selecting an item."} label="Item" onChange={(value) => updateLine(index, { itemId: numberValue(value) ?? 0 })} options={itemOptions} required value={line.itemId ? String(line.itemId) : ""} />
                  <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before selecting a UOM."} label="Order UOM" onChange={(value) => updateLine(index, { orderUomId: numberValue(value) ?? 0 })} options={uomOptions} required value={line.orderUomId ? String(line.orderUomId) : ""} />
                  <ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing quantity."} label="Ordered quantity" min={0.001} onChange={(value) => updateLine(index, { orderedQuantity: value ?? 0 })} required value={line.orderedQuantity} />
                  <ErpMoneyField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing unit price."} label="Unit price" min={0} onChange={(value) => updateLine(index, { unitPrice: value ?? 0 })} value={line.unitPrice} />
                  <ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing discount."} label="Discount %" max={100} min={0} onChange={(value) => updateLine(index, { discountPercent: value ?? 0 })} scale={2} unit="%" value={line.discountPercent} />
                  <ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing tax."} label="Tax %" max={100} min={0} onChange={(value) => updateLine(index, { taxPercent: value ?? 0 })} scale={2} unit="%" value={line.taxPercent} />
                  <label><span>Expected line date</span><input aria-label="Expected line date" disabled={!live} onChange={(event) => updateLine(index, { expectedDate: event.target.value })} required type="date" value={dateControlValue(line.expectedDate)} /></label>
                  <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing line status."} label="Line status" onChange={(value) => updateLine(index, { status: value })} options={poStatusOptions} value={line.status} />
                  <ErpActionBar danger={[{ disabled: !live || workspace.lines.length <= 1, label: "Remove Line", onClick: live && workspace.lines.length > 1 ? () => removeLine(index) : undefined, reason: !live ? "Live procurement sign-in is required before removing lines." : workspace.lines.length <= 1 ? "At least one purchase order line is required." : undefined }]} />
                </FormShell>
              ))}
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Receive accepted and rejected PO quantities into inventory, then create, match, and post the supplier invoice to AP."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReceiptReason), label: saveReceipt.isPending ? "Saving GRN" : "Save GRN", onClick: receiptWorkspace && !saveReceiptReason ? () => saveReceipt.mutate(buildGoodsReceiptRequest(receiptWorkspace, companyId, branchId)) : undefined, reason: saveReceiptReason }, { disabled: Boolean(createInvoiceReason), label: createSupplierInvoice.isPending ? "Creating invoice" : "Create supplier invoice", onClick: receiptWorkspace && !createInvoiceReason ? () => createSupplierInvoice.mutate(buildSupplierInvoiceRequest(receiptWorkspace, companyId, branchId)) : undefined, reason: createInvoiceReason }, { disabled: Boolean(postInvoiceReason), label: postSupplierInvoice.isPending ? "Posting AP" : "Post AP liability", onClick: receiptWorkspace?.savedInvoice && !postInvoiceReason ? () => postSupplierInvoice.mutate(receiptWorkspace.savedInvoice!.id) : undefined, reason: postInvoiceReason }]} secondary={[{ disabled: Boolean(matchInvoiceReason), label: matchSupplierInvoice.isPending ? "Matching invoice" : "Run 2-way/3-way match", onClick: receiptWorkspace?.savedInvoice && !matchInvoiceReason ? () => matchSupplierInvoice.mutate(receiptWorkspace.savedInvoice!.id) : undefined, reason: matchInvoiceReason }]} utility={[{ label: "Close", onClick: () => setReceiptWorkspace(null), variant: "quiet" }]} />}
        isOpen={Boolean(receiptWorkspace)}
        onClose={() => setReceiptWorkspace(null)}
        title={receiptWorkspace ? `Receive ${receiptWorkspace.purchaseOrder.purchaseOrderNo}` : "Receive purchase order"}
        validation={<ErpValidationSummary errors={receiptWorkspace?.savedReceipt ? invoiceErrors : [...grnErrors, ...invoiceErrors.filter((error) => !error.includes("Save the GRN"))]} />}
      >
        {receiptWorkspace ? (
          <div className="modal-form-grid">
            <FormShell initialFingerprint={`${receiptWorkspace.purchaseOrder.id}-${receiptWorkspace.goodsReceiptNo}`} title="Goods receipt">
              <label><span>GRN number</span><input aria-label="GRN number" disabled={!live || Boolean(receiptWorkspace.savedReceipt)} onChange={(event) => setReceiptWorkspace({ ...receiptWorkspace, goodsReceiptNo: event.target.value })} value={receiptWorkspace.goodsReceiptNo} /></label>
              <label><span>Receipt date</span><input aria-label="Receipt date" disabled={!live || Boolean(receiptWorkspace.savedReceipt)} onChange={(event) => setReceiptWorkspace({ ...receiptWorkspace, receiptDate: event.target.value })} required type="date" value={dateControlValue(receiptWorkspace.receiptDate)} /></label>
              <ErpLookupField disabled={!live || Boolean(receiptWorkspace.savedReceipt)} disabledReason={receiptWorkspace.savedReceipt ? "Receiving warehouse cannot be changed after the GRN is saved." : live ? undefined : "Live procurement sign-in is required before selecting a receiving warehouse."} label="Receiving warehouse" onChange={(value) => setReceiptWorkspace({ ...receiptWorkspace, warehouseId: numberValue(value) })} options={warehouseOptions} required value={receiptWorkspace.warehouseId ? String(receiptWorkspace.warehouseId) : ""} />
              <ErpLookupField disabled={!live || Boolean(receiptWorkspace.savedReceipt)} disabledReason={receiptWorkspace.savedReceipt ? "GRN status cannot be changed after posting inventory." : live ? undefined : "Live procurement sign-in is required before changing status."} label="GRN status" onChange={(value) => setReceiptWorkspace({ ...receiptWorkspace, status: value })} options={["Received", "QC Hold", "Closed"].map(toOption)} required value={receiptWorkspace.status} />
              <label><span>Receipt remarks</span><input aria-label="Receipt remarks" disabled={!live || Boolean(receiptWorkspace.savedReceipt)} onChange={(event) => setReceiptWorkspace({ ...receiptWorkspace, remarks: event.target.value })} value={receiptWorkspace.remarks ?? ""} /></label>
            </FormShell>
            <Card title="Receipt lines" description="Accepted quantity posts to available stock; rejected quantity posts to QC hold.">
              {receiptWorkspace.lines.map((line, index) => (
                <FormShell initialFingerprint={`${receiptWorkspace.purchaseOrder.id}-receipt-line-${line.lineNo}`} key={`${line.lineNo}-${index}`} title={`Receipt line ${index + 1}`}>
                  <ErpNumberField disabled label="PO line id" onChange={() => undefined} value={line.purchaseOrderLineId} />
                  <ErpDecimalField disabled={!live || Boolean(receiptWorkspace.savedReceipt)} disabledReason={receiptWorkspace.savedReceipt ? "Receipt quantities cannot be changed after inventory posting." : live ? undefined : "Live procurement sign-in is required before changing received quantity."} label="Received quantity" min={0.001} onChange={(value) => updateReceiptLine(index, { receivedQuantity: value ?? 0 })} required value={line.receivedQuantity} />
                  <ErpDecimalField disabled={!live || Boolean(receiptWorkspace.savedReceipt)} disabledReason={receiptWorkspace.savedReceipt ? "Accepted quantity cannot be changed after inventory posting." : live ? undefined : "Live procurement sign-in is required before changing accepted quantity."} label="Accepted quantity" min={0} onChange={(value) => updateReceiptLine(index, { acceptedQuantity: value ?? 0 })} required value={line.acceptedQuantity} />
                  <ErpDecimalField disabled={!live || Boolean(receiptWorkspace.savedReceipt)} disabledReason={receiptWorkspace.savedReceipt ? "Rejected quantity cannot be changed after inventory posting." : live ? undefined : "Live procurement sign-in is required before changing rejected quantity."} label="Rejected quantity" min={0} onChange={(value) => updateReceiptLine(index, { rejectedQuantity: value ?? 0 })} required value={line.rejectedQuantity} />
                  <ErpLookupField disabled={!live || Boolean(receiptWorkspace.savedReceipt)} disabledReason={receiptWorkspace.savedReceipt ? "QC status cannot be changed after inventory posting." : live ? undefined : "Live procurement sign-in is required before changing QC status."} label="QC status" onChange={(value) => updateReceiptLine(index, { qcStatus: value })} options={["Accepted", "Rejected", "Partial"].map(toOption)} value={line.qcStatus} />
                </FormShell>
              ))}
            </Card>
            <FormShell initialFingerprint={`${receiptWorkspace.purchaseOrder.id}-${receiptWorkspace.supplierInvoiceNo}`} title="Supplier invoice and AP">
              <label><span>Supplier invoice number</span><input aria-label="Supplier invoice number" disabled={!live || !receiptWorkspace.savedReceipt || Boolean(receiptWorkspace.savedInvoice)} onChange={(event) => setReceiptWorkspace({ ...receiptWorkspace, supplierInvoiceNo: event.target.value })} value={receiptWorkspace.supplierInvoiceNo} /></label>
              <label><span>Invoice date</span><input aria-label="Supplier invoice date" disabled={!live || !receiptWorkspace.savedReceipt || Boolean(receiptWorkspace.savedInvoice)} onChange={(event) => setReceiptWorkspace({ ...receiptWorkspace, invoiceDate: event.target.value })} required type="date" value={dateControlValue(receiptWorkspace.invoiceDate)} /></label>
              <label><span>Due date</span><input aria-label="Supplier invoice due date" disabled={!live || !receiptWorkspace.savedReceipt || Boolean(receiptWorkspace.savedInvoice)} onChange={(event) => setReceiptWorkspace({ ...receiptWorkspace, dueDate: event.target.value })} type="date" value={dateControlValue(receiptWorkspace.dueDate)} /></label>
              <ErpLookupField disabled={!live || !receiptWorkspace.savedReceipt || Boolean(receiptWorkspace.savedInvoice)} disabledReason={!receiptWorkspace.savedReceipt ? "Save the GRN before selecting invoice currency." : receiptWorkspace.savedInvoice ? "Currency cannot be changed after invoice creation." : live ? undefined : "Live procurement sign-in is required before selecting currency."} label="Currency" onChange={(value) => setReceiptWorkspace({ ...receiptWorkspace, currencyCode: value })} options={["INR", "USD", "EUR"].map(toOption)} required value={receiptWorkspace.currencyCode} />
              {receiptWorkspace.savedInvoice ? <Badge tone={receiptWorkspace.savedInvoice.matchStatus === "Matched" ? "success" : "warn"}>{`${receiptWorkspace.savedInvoice.matchStatus} / ${receiptWorkspace.savedInvoice.apStatus}`}</Badge> : null}
              {receiptWorkspace.postingResult ? <Badge tone="success">{`AP liability ${receiptWorkspace.postingResult.liability.liabilityNo}: ${receiptWorkspace.postingResult.liability.balanceAmount}`}</Badge> : null}
            </FormShell>
            {receiptWorkspace.savedReceipt ? (
              <Card title="Invoice match lines" description="Invoice quantity, price, and tax are compared against the saved GRN and PO line contract.">
                {receiptWorkspace.invoiceLines.map((line, index) => (
                  <FormShell initialFingerprint={`${receiptWorkspace.savedReceipt?.id}-invoice-line-${line.lineNo}`} key={`${line.lineNo}-${index}`} title={`Invoice line ${index + 1}`}>
                    <ErpNumberField disabled label="GRN line id" onChange={() => undefined} value={line.goodsReceiptLineId} />
                    <ErpDecimalField disabled={!live || Boolean(receiptWorkspace.savedInvoice)} disabledReason={receiptWorkspace.savedInvoice ? "Invoice quantity cannot be changed after invoice creation." : live ? undefined : "Live procurement sign-in is required before changing invoice quantity."} label="Invoice quantity" min={0.001} onChange={(value) => updateInvoiceLine(index, { invoiceQuantity: value ?? 0 })} value={line.invoiceQuantity} />
                    <ErpMoneyField disabled={!live || Boolean(receiptWorkspace.savedInvoice)} disabledReason={receiptWorkspace.savedInvoice ? "Invoice price cannot be changed after invoice creation." : live ? undefined : "Live procurement sign-in is required before changing invoice price."} label="Unit price" min={0} onChange={(value) => updateInvoiceLine(index, { unitPrice: value ?? 0 })} value={line.unitPrice} />
                    <ErpDecimalField disabled={!live || Boolean(receiptWorkspace.savedInvoice)} disabledReason={receiptWorkspace.savedInvoice ? "Invoice tax cannot be changed after invoice creation." : live ? undefined : "Live procurement sign-in is required before changing tax."} label="Tax %" max={100} min={0} onChange={(value) => updateInvoiceLine(index, { taxPercent: value ?? 0 })} scale={2} unit="%" value={line.taxPercent} />
                  </FormShell>
                ))}
              </Card>
            ) : null}
          </div>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const subcontractColumns: DataGridColumn<SubcontractPlanItem>[] = [
  { key: "sub", header: "Subcontract order", width: "20%", render: (record) => <strong>{record.subcontractOrderNo}</strong> },
  { key: "supplier", header: "Supplier", render: (record) => record.supplierLabel },
  { key: "workOrder", header: "WO / operation", width: "22%", render: (record) => `${record.workOrderLabel} / ${record.operationLabel}` },
  { key: "return", header: "Return", width: "14%", render: (record) => record.expectedReturnDate },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.status} /> }
];

export function SubcontractPlanPage() {
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [workspace, setWorkspace] = useState<SubcontractWorkspace | null>(null);
  const [receiptWorkspace, setReceiptWorkspace] = useState<SubcontractReceiptWorkspace | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useProcurementFilter(search, status);
  const query = useApiQuery(queryKeys.procurement.subcontractOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listSubcontractPlanSetup(session, filter), { staleTime: 60_000 });
  const suppliers = useApiQuery(queryKeys.partners.suppliers(companyId, branchId, "", "Active"), () => apiClient.partners.suppliers({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const workOrders = useApiQuery(queryKeys.production.workOrders(companyId, branchId, "", "Released"), () => apiClient.production.workOrders({ companyId, branchId, status: "Released" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const operations = useApiQuery(queryKeys.resources.operations(companyId, "", "Active"), () => apiClient.resources.operations({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const preview = workspace?.record ?? records[0] ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const supplierOptions = entityOptions(suppliers.data?.items, (supplier) => supplier.id, (supplier) => `${supplier.supplierCode} / ${supplier.supplierName}`);
  const workOrderOptions = entityOptions(workOrders.data?.items, (workOrder) => workOrder.id, (workOrder) => workOrder.workOrderNo);
  const operationOptions = entityOptions(operations.data?.items, (operation) => operation.id, (operation) => `${operation.operationCode} / ${operation.operationName}`);
  const validationErrors = procurementValidationErrors(workspace);
  const receiptErrors = subcontractReceiptValidationErrors(receiptWorkspace);
  const saveSubcontract = useApiMutation(
    (request: SubcontractOrderUpsertRequest) =>
      workspace?.record
        ? apiClient.procurement.updateSubcontractOrder(workspace.record.subcontractOrderId, request)
        : apiClient.procurement.createSubcontractOrder(request),
    {
      onSuccess: async (record) => {
        setMessage(`Saved ${record.subcontractOrderNo}.`);
        setWorkspace(null);
        await query.refetch();
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const approveSubcontract = useApiMutation((id: number) => apiClient.procurement.approveSubcontractOrder(id), {
    onSuccess: async (record) => {
      setMessage(`Approved ${record.subcontractOrderNo}.`);
      setWorkspace(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const saveSubcontractReceipt = useApiMutation((request: SubcontractReceiptUpsertRequest) => apiClient.procurement.createSubcontractReceipt(request), {
    onSuccess: async (record) => {
      setMessage(`Received subcontract return ${record.receiptNo}.`);
      setReceiptWorkspace(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const saveReason = !live
    ? "Outside-processing save requires a live procurement session."
    : validationErrors.length > 0
      ? "Resolve validation issues before saving."
      : saveSubcontract.isPending
        ? "Outside-processing save is in progress."
        : undefined;
  const approveReason = !live
    ? "Outside-processing approval requires a live procurement session."
    : !workspace?.record
      ? "Open a saved outside-processing plan before approval."
      : workspace.record.status.toLowerCase().includes("approved")
        ? "This outside-processing plan is already approved."
        : approveSubcontract.isPending
          ? "Outside-processing approval is in progress."
          : undefined;
  const receiveReason = !live
    ? "Receive-back posting requires a live procurement session."
    : !workspace?.record
      ? "Open a saved outside-processing plan before receive-back."
      : workspace.record.status.toLowerCase().includes("closed")
        ? "This outside-processing plan is already closed."
        : undefined;
  const saveReceiptReason = !live
    ? "Subcontract receive-back requires a live procurement session."
    : receiptErrors.length > 0
      ? "Resolve receive-back validation issues before saving."
      : saveSubcontractReceipt.isPending
        ? "Subcontract receive-back save is in progress."
        : undefined;

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "New outside plan", onClick: () => { setMessage(null); setWorkspace(buildSubcontractWorkspace(null)); } }, { disabled: Boolean(approveReason), label: approveSubcontract.isPending ? "Approving plan" : "Approve outside plan", onClick: approveReason || !workspace?.record ? undefined : () => approveSubcontract.mutate(workspace.record!.subcontractOrderId), reason: approveReason }]} secondary={[{ disabled: true, label: "Print send-out note", reason: "Send-out printing is pending document workflow enablement." }]} testId="subcontract-plan-action-bar" /></>}
        aside={<Card title="Outside processing guidance" description="Subcontract planning stays a procurement handoff; receive-back posting remains controlled by the receiving process.">{preview ? <div className="notification-item"><strong>{preview.subcontractOrderNo}</strong><p>{preview.sendOutSignal}</p><div className="context-chip-row"><StatusBadge status={preview.status} /><Badge tone="info">{preview.expectedReturnDate}</Badge></div></div> : null}</Card>}
        description="Send-out and receive-back planning for external operations."
        filters={<FilterBar><input aria-label="Search subcontract plans" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search subcontract, supplier, work order" value={search} /><select aria-label="Subcontract status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Planned">Planned</option><option value="Awaiting">Awaiting</option><option value="Approved">Approved</option></select></FilterBar>}
        title="Subcontract / Outside Processing Plan"
      >
        {query.error ? <Card title="Live outside-processing data unavailable" description={query.error.message} /> : null}
        {message ? <Badge tone={message.toLowerCase().includes("saved") || message.toLowerCase().includes("approved") ? "success" : "danger"}>{message}</Badge> : null}
        <KpiStrip items={[{ label: "Plans", value: String(records.length) }, { label: "Awaiting", value: String(records.filter((record) => record.status.includes("Awaiting")).length) }, { label: "Planned", value: String(records.filter((record) => record.status.includes("Planned")).length) }, { label: "Ready", value: String(records.filter((record) => record.status.includes("Planned") || record.status.includes("Awaiting")).length) }]} />
        <Card title="Outside processing schedule" description="Send-out and receive-back signals remain explicit by WO operation.">
          <DataGrid ariaLabel="Subcontract outside processing list" columns={subcontractColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => { setMessage(null); setWorkspace(buildSubcontractWorkspace(record)); }} records={records} rowLabel={(record) => `${record.subcontractOrderNo} subcontract plan`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description={workspace?.mode === "create" ? "Create an outside-processing plan for a supplier operation." : "Edit and approve outside-processing send-out planning."}
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason), label: saveSubcontract.isPending ? "Saving outside plan" : "Save outside plan", onClick: workspace && !saveReason ? () => saveSubcontract.mutate(buildSubcontractRequest(workspace, companyId, branchId)) : undefined, reason: saveReason }]} secondary={[{ disabled: Boolean(approveReason), label: approveSubcontract.isPending ? "Approving plan" : "Approve outside plan", onClick: approveReason || !workspace?.record ? undefined : () => approveSubcontract.mutate(workspace.record!.subcontractOrderId), reason: approveReason }, { disabled: Boolean(receiveReason), label: "Receive back", onClick: !receiveReason && workspace?.record ? () => { setReceiptWorkspace(buildSubcontractReceiptWorkspace(workspace.record!)); setWorkspace(null); setMessage(null); } : undefined, reason: receiveReason }]} utility={[{ label: "Close", onClick: () => setWorkspace(null), variant: "quiet" }]} />}
        isOpen={Boolean(workspace)}
        onClose={() => setWorkspace(null)}
        title={workspace?.subcontractOrderNo ?? "Subcontract plan"}
        validation={<ErpValidationSummary errors={validationErrors} />}
      >
        {workspace ? <FormShell initialFingerprint={`${workspace.mode}-${workspace.record?.id ?? "new"}-${workspace.subcontractOrderNo}`} title="Subcontract planning controls"><label><span>Subcontract order number</span><input aria-label="Subcontract order number" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, subcontractOrderNo: event.target.value })} value={workspace.subcontractOrderNo} /></label><ErpLookupField disabled={!live || workspace.mode === "edit"} disabledReason={workspace.mode === "edit" ? "Supplier cannot be changed after the outside-processing plan is saved." : live ? undefined : "Live procurement sign-in is required before selecting a supplier."} label="Supplier" onChange={(value) => setWorkspace({ ...workspace, supplierId: numberValue(value) })} options={supplierOptions} required value={workspace.supplierId ? String(workspace.supplierId) : ""} /><ErpLookupField disabled={!live || workspace.mode === "edit"} disabledReason={workspace.mode === "edit" ? "Work-order link cannot be changed after the outside-processing plan is saved." : live ? undefined : "Live procurement sign-in is required before selecting a work order."} label="Work order" onChange={(value) => setWorkspace({ ...workspace, workOrderId: numberValue(value) })} options={workOrderOptions} value={workspace.workOrderId ? String(workspace.workOrderId) : ""} /><ErpLookupField disabled={!live || workspace.mode === "edit"} disabledReason={workspace.mode === "edit" ? "Operation link cannot be changed after the outside-processing plan is saved." : live ? undefined : "Live procurement sign-in is required before selecting an operation."} label="Operation" onChange={(value) => setWorkspace({ ...workspace, operationId: numberValue(value) })} options={operationOptions} value={workspace.operationId ? String(workspace.operationId) : ""} /><ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing status."} label="Status" onChange={(value) => setWorkspace({ ...workspace, status: value })} options={subcontractStatusOptions} required value={workspace.status} /><label><span>Expected return</span><input aria-label="Expected return" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, expectedReturnDate: event.target.value })} type="date" value={dateControlValue(workspace.expectedReturnDate)} /></label></FormShell> : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Post receive-back quantity and QC result for an outside-processing order."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReceiptReason), label: saveSubcontractReceipt.isPending ? "Saving receive-back" : "Save receive-back", onClick: receiptWorkspace && !saveReceiptReason ? () => saveSubcontractReceipt.mutate(buildSubcontractReceiptRequest(receiptWorkspace, companyId, branchId)) : undefined, reason: saveReceiptReason }]} utility={[{ label: "Close", onClick: () => setReceiptWorkspace(null), variant: "quiet" }]} />}
        isOpen={Boolean(receiptWorkspace)}
        onClose={() => setReceiptWorkspace(null)}
        title={receiptWorkspace ? `Receive ${receiptWorkspace.order.subcontractOrderNo}` : "Receive subcontract"}
        validation={<ErpValidationSummary errors={receiptErrors} />}
      >
        {receiptWorkspace ? (
          <FormShell initialFingerprint={`${receiptWorkspace.order.id}-${receiptWorkspace.receiptNo}`} title="Subcontract receive-back">
            <label><span>Receipt number</span><input aria-label="Subcontract receipt number" disabled={!live} onChange={(event) => setReceiptWorkspace({ ...receiptWorkspace, receiptNo: event.target.value })} value={receiptWorkspace.receiptNo} /></label>
            <label><span>Receipt date</span><input aria-label="Subcontract receipt date" disabled={!live} onChange={(event) => setReceiptWorkspace({ ...receiptWorkspace, receiptDate: event.target.value })} required type="date" value={dateControlValue(receiptWorkspace.receiptDate)} /></label>
            <ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing received quantity."} label="Received quantity" min={0.001} onChange={(value) => setReceiptWorkspace({ ...receiptWorkspace, receivedQuantity: value ?? 0 })} required value={receiptWorkspace.receivedQuantity} />
            <ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing accepted quantity."} label="Accepted quantity" min={0} onChange={(value) => setReceiptWorkspace({ ...receiptWorkspace, acceptedQuantity: value ?? 0 })} required value={receiptWorkspace.acceptedQuantity} />
            <ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing rejected quantity."} label="Rejected quantity" min={0} onChange={(value) => setReceiptWorkspace({ ...receiptWorkspace, rejectedQuantity: value ?? 0 })} required value={receiptWorkspace.rejectedQuantity} />
            <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before selecting QC status."} label="QC status" onChange={(value) => setReceiptWorkspace({ ...receiptWorkspace, qcStatus: value })} options={["Accepted", "Rejected", "Partial"].map(toOption)} required value={receiptWorkspace.qcStatus} />
            <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing receipt status."} label="Receipt status" onChange={(value) => setReceiptWorkspace({ ...receiptWorkspace, status: value })} options={["Received", "Posted"].map(toOption)} required value={receiptWorkspace.status} />
            <label><span>Receipt remarks</span><input aria-label="Subcontract receipt remarks" disabled={!live} onChange={(event) => setReceiptWorkspace({ ...receiptWorkspace, remarks: event.target.value })} value={receiptWorkspace.remarks ?? ""} /></label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
