import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type {
  PurchaseOrderUpsertRequest,
  PurchaseRequisitionUpsertRequest,
  SubcontractOrderUpsertRequest
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
  itemId: number | null;
  requiredQuantity: number | null;
  orderUomId: number | null;
  needByDate: string;
}

interface PoWorkspace {
  mode: WorkspaceMode;
  record: PurchaseOrderItem | null;
  purchaseOrderNo: string;
  supplierId: number | null;
  orderAddressId: number | null;
  status: string;
  expectedReceiptDate: string;
  itemId: number | null;
  orderedQuantity: number | null;
  orderUomId: number | null;
  expectedDate: string;
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

function entityOptions<T>(items: T[] | undefined, getValue: (item: T) => number, getLabel: (item: T) => string) {
  return (items ?? []).map((item) => ({ label: getLabel(item), value: String(getValue(item)) }));
}

function buildPrWorkspace(record: PurchaseRequisitionItem | null): PrWorkspace {
  const firstLine = record?.lines[0];

  return {
    mode: record ? "edit" : "create",
    record,
    purchaseRequisitionNo: record?.purchaseRequisitionNo ?? nextDocumentNo("PR-DRAFT"),
    sourceDocumentType: record?.sourceDocumentType ?? "Manual",
    sourceDocumentId: record?.sourceDocumentId ?? null,
    status: record?.status ?? "Draft",
    itemId: firstLine?.itemId ?? null,
    requiredQuantity: firstLine?.requiredQuantity ?? 1,
    orderUomId: firstLine?.orderUomId ?? null,
    needByDate: firstLine?.needByDate && firstLine.needByDate !== "Open" ? firstLine.needByDate : todayIsoDate()
  };
}

function buildPoWorkspace(record: PurchaseOrderItem | null): PoWorkspace {
  const firstLine = record?.lines[0];

  return {
    mode: record ? "edit" : "create",
    record,
    purchaseOrderNo: record?.purchaseOrderNo ?? nextDocumentNo("PO-DRAFT"),
    supplierId: record?.supplierId ?? null,
    orderAddressId: record?.orderAddressId ?? null,
    status: record?.status ?? "Draft",
    expectedReceiptDate: record?.expectedReceiptDate && record.expectedReceiptDate !== "Open" ? record.expectedReceiptDate : todayIsoDate(),
    itemId: firstLine?.itemId ?? null,
    orderedQuantity: firstLine?.orderedQuantity ?? 1,
    orderUomId: firstLine?.orderUomId ?? null,
    expectedDate: firstLine?.expectedDate && firstLine.expectedDate !== "Open" ? firstLine.expectedDate : todayIsoDate()
  };
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

function buildPurchaseRequisitionRequest(workspace: PrWorkspace, companyId: number, branchId: number): PurchaseRequisitionUpsertRequest {
  const existingLines = workspace.record?.lines ?? [];
  const firstExisting = existingLines[0];
  const firstLine = {
    lineNo: firstExisting?.lineNo ?? 10,
    itemId: workspace.itemId ?? 0,
    requiredQuantity: workspace.requiredQuantity ?? 0,
    orderUomId: workspace.orderUomId ?? 0,
    needByDate: workspace.needByDate,
    sourceBoqRequirementLineId: firstExisting?.sourceBoqRequirementLineId ?? null,
    linkedWorkOrderId: firstExisting?.linkedWorkOrderId ?? null,
    status: firstExisting?.status ?? "Pending"
  };

  return {
    companyId: workspace.record?.companyId ?? companyId,
    branchId: workspace.record?.branchId ?? branchId,
    purchaseRequisitionNo: workspace.purchaseRequisitionNo,
    sourceDocumentType: workspace.sourceDocumentType,
    sourceDocumentId: workspace.sourceDocumentId,
    status: workspace.status,
    lines: [firstLine, ...existingLines.slice(1).map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId,
      requiredQuantity: line.requiredQuantity,
      orderUomId: line.orderUomId,
      needByDate: line.needByDate,
      sourceBoqRequirementLineId: line.sourceBoqRequirementLineId,
      linkedWorkOrderId: line.linkedWorkOrderId,
      status: line.status
    }))]
  };
}

function buildPurchaseOrderRequest(workspace: PoWorkspace, companyId: number, branchId: number): PurchaseOrderUpsertRequest {
  const existingLines = workspace.record?.lines ?? [];
  const firstExisting = existingLines[0];
  const firstLine = {
    lineNo: firstExisting?.lineNo ?? 10,
    itemId: workspace.itemId ?? 0,
    purchaseRequisitionLineId: firstExisting?.purchaseRequisitionLineId ?? null,
    orderedQuantity: workspace.orderedQuantity ?? 0,
    orderUomId: workspace.orderUomId ?? 0,
    expectedDate: workspace.expectedDate,
    linkedWorkOrderId: firstExisting?.linkedWorkOrderId ?? null,
    sourceBoqRequirementLineId: firstExisting?.sourceBoqRequirementLineId ?? null,
    status: firstExisting?.status ?? "Open"
  };

  return {
    companyId: workspace.record?.companyId ?? companyId,
    branchId: workspace.record?.branchId ?? branchId,
    purchaseOrderNo: workspace.purchaseOrderNo,
    supplierId: workspace.supplierId ?? 0,
    orderAddressId: workspace.orderAddressId,
    status: workspace.status,
    expectedReceiptDate: workspace.expectedReceiptDate || null,
    lines: [firstLine, ...existingLines.slice(1).map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId,
      purchaseRequisitionLineId: line.purchaseRequisitionLineId,
      orderedQuantity: line.orderedQuantity,
      orderUomId: line.orderUomId,
      expectedDate: line.expectedDate,
      linkedWorkOrderId: line.linkedWorkOrderId,
      sourceBoqRequirementLineId: line.sourceBoqRequirementLineId,
      status: line.status
    }))]
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

  if ("itemId" in workspace && !workspace.itemId) {
    errors.push("Item is required.");
  }

  if ("orderUomId" in workspace && !workspace.orderUomId) {
    errors.push("Order UOM is required.");
  }

  if ("requiredQuantity" in workspace && (!workspace.requiredQuantity || workspace.requiredQuantity <= 0)) {
    errors.push("Required quantity must be greater than zero.");
  }

  if ("orderedQuantity" in workspace && (!workspace.orderedQuantity || workspace.orderedQuantity <= 0)) {
    errors.push("Ordered quantity must be greater than zero.");
  }

  if ("needByDate" in workspace && !workspace.needByDate) {
    errors.push("Need-by date is required.");
  }

  if ("expectedDate" in workspace && !workspace.expectedDate) {
    errors.push("Expected line date is required.");
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
        {workspace ? <FormShell initialFingerprint={`${workspace.mode}-${workspace.record?.id ?? "new"}-${workspace.purchaseRequisitionNo}`} title="Purchase requisition controls"><label><span>Purchase requisition number</span><input aria-label="Purchase requisition number" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, purchaseRequisitionNo: event.target.value })} value={workspace.purchaseRequisitionNo} /></label><ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing source type."} label="Source type" onChange={(value) => setWorkspace({ ...workspace, sourceDocumentType: value })} options={sourceDocumentOptions} required value={workspace.sourceDocumentType} /><ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before assigning a source id."} label="Source document id" min={1} onChange={(value) => setWorkspace({ ...workspace, sourceDocumentId: value })} value={workspace.sourceDocumentId} /><ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing status."} label="Status" onChange={(value) => setWorkspace({ ...workspace, status: value })} options={prStatusOptions} required value={workspace.status} /><ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before selecting an item."} label="Item" onChange={(value) => setWorkspace({ ...workspace, itemId: numberValue(value) })} options={itemOptions} required value={workspace.itemId ? String(workspace.itemId) : ""} /><ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before selecting a UOM."} label="Order UOM" onChange={(value) => setWorkspace({ ...workspace, orderUomId: numberValue(value) })} options={uomOptions} required value={workspace.orderUomId ? String(workspace.orderUomId) : ""} /><ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing quantity."} label="Required quantity" min={0.001} onChange={(value) => setWorkspace({ ...workspace, requiredQuantity: value })} required value={workspace.requiredQuantity} /><label><span>Need by</span><input aria-label="Need by" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, needByDate: event.target.value })} required type="date" value={dateControlValue(workspace.needByDate)} /></label></FormShell> : null}
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
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useProcurementFilter(search, status);
  const query = useApiQuery(queryKeys.procurement.purchaseOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listPurchaseOrderSetup(session, filter), { staleTime: 60_000 });
  const suppliers = useApiQuery(queryKeys.partners.suppliers(companyId, branchId, "", "Active"), () => apiClient.partners.suppliers({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const uoms = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => apiClient.measurements.uoms({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const preview = workspace?.record ?? records[0] ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const supplierOptions = entityOptions(suppliers.data?.items, (supplier) => supplier.id, (supplier) => `${supplier.supplierCode} / ${supplier.supplierName}`);
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const uomOptions = entityOptions(uoms.data?.items, (uom) => uom.id, (uom) => `${uom.uomCode} / ${uom.uomName}`);
  const validationErrors = procurementValidationErrors(workspace);
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
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason), label: savePurchaseOrder.isPending ? "Saving purchase order" : "Save purchase order", onClick: workspace && !saveReason ? () => savePurchaseOrder.mutate(buildPurchaseOrderRequest(workspace, companyId, branchId)) : undefined, reason: saveReason }]} secondary={[{ disabled: Boolean(approveReason), label: approvePurchaseOrder.isPending ? "Approving PO" : "Approve PO", onClick: approveReason || !workspace?.record ? undefined : () => approvePurchaseOrder.mutate(workspace.record!.purchaseOrderId), reason: approveReason }, { disabled: true, label: "Receive against PO", reason: "PO receiving requires the GRN/receipt workflow, which is not implemented in this V1 procurement slice." }]} utility={[{ label: "Close", onClick: () => setWorkspace(null), variant: "quiet" }]} />}
        isOpen={Boolean(workspace)}
        onClose={() => setWorkspace(null)}
        title={workspace?.purchaseOrderNo ?? "Purchase order"}
        validation={<ErpValidationSummary errors={validationErrors} />}
      >
        {workspace ? <FormShell initialFingerprint={`${workspace.mode}-${workspace.record?.id ?? "new"}-${workspace.purchaseOrderNo}`} title="Purchase order follow-up"><label><span>Purchase order number</span><input aria-label="Purchase order number" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, purchaseOrderNo: event.target.value })} value={workspace.purchaseOrderNo} /></label><ErpLookupField disabled={!live || workspace.mode === "edit"} disabledReason={workspace.mode === "edit" ? "Supplier cannot be changed after the purchase order is saved." : live ? undefined : "Live procurement sign-in is required before selecting a supplier."} label="Supplier" onChange={(value) => setWorkspace({ ...workspace, supplierId: numberValue(value) })} options={supplierOptions} required value={workspace.supplierId ? String(workspace.supplierId) : ""} /><ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing status."} label="Status" onChange={(value) => setWorkspace({ ...workspace, status: value })} options={poStatusOptions} required value={workspace.status} /><label><span>Expected receipt</span><input aria-label="Expected receipt" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, expectedReceiptDate: event.target.value })} type="date" value={dateControlValue(workspace.expectedReceiptDate)} /></label><ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before selecting an item."} label="Item" onChange={(value) => setWorkspace({ ...workspace, itemId: numberValue(value) })} options={itemOptions} required value={workspace.itemId ? String(workspace.itemId) : ""} /><ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before selecting a UOM."} label="Order UOM" onChange={(value) => setWorkspace({ ...workspace, orderUomId: numberValue(value) })} options={uomOptions} required value={workspace.orderUomId ? String(workspace.orderUomId) : ""} /><ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing quantity."} label="Ordered quantity" min={0.001} onChange={(value) => setWorkspace({ ...workspace, orderedQuantity: value })} required value={workspace.orderedQuantity} /><label><span>Expected line date</span><input aria-label="Expected line date" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, expectedDate: event.target.value })} required type="date" value={dateControlValue(workspace.expectedDate)} /></label></FormShell> : null}
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
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason), label: saveSubcontract.isPending ? "Saving outside plan" : "Save outside plan", onClick: workspace && !saveReason ? () => saveSubcontract.mutate(buildSubcontractRequest(workspace, companyId, branchId)) : undefined, reason: saveReason }]} secondary={[{ disabled: Boolean(approveReason), label: approveSubcontract.isPending ? "Approving plan" : "Approve outside plan", onClick: approveReason || !workspace?.record ? undefined : () => approveSubcontract.mutate(workspace.record!.subcontractOrderId), reason: approveReason }, { disabled: true, label: "Receive back", reason: "Receive-back posting requires the receiving/GRN workflow and incoming QC handoff." }]} utility={[{ label: "Close", onClick: () => setWorkspace(null), variant: "quiet" }]} />}
        isOpen={Boolean(workspace)}
        onClose={() => setWorkspace(null)}
        title={workspace?.subcontractOrderNo ?? "Subcontract plan"}
        validation={<ErpValidationSummary errors={validationErrors} />}
      >
        {workspace ? <FormShell initialFingerprint={`${workspace.mode}-${workspace.record?.id ?? "new"}-${workspace.subcontractOrderNo}`} title="Subcontract planning controls"><label><span>Subcontract order number</span><input aria-label="Subcontract order number" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, subcontractOrderNo: event.target.value })} value={workspace.subcontractOrderNo} /></label><ErpLookupField disabled={!live || workspace.mode === "edit"} disabledReason={workspace.mode === "edit" ? "Supplier cannot be changed after the outside-processing plan is saved." : live ? undefined : "Live procurement sign-in is required before selecting a supplier."} label="Supplier" onChange={(value) => setWorkspace({ ...workspace, supplierId: numberValue(value) })} options={supplierOptions} required value={workspace.supplierId ? String(workspace.supplierId) : ""} /><ErpLookupField disabled={!live || workspace.mode === "edit"} disabledReason={workspace.mode === "edit" ? "Work-order link cannot be changed after the outside-processing plan is saved." : live ? undefined : "Live procurement sign-in is required before selecting a work order."} label="Work order" onChange={(value) => setWorkspace({ ...workspace, workOrderId: numberValue(value) })} options={workOrderOptions} value={workspace.workOrderId ? String(workspace.workOrderId) : ""} /><ErpLookupField disabled={!live || workspace.mode === "edit"} disabledReason={workspace.mode === "edit" ? "Operation link cannot be changed after the outside-processing plan is saved." : live ? undefined : "Live procurement sign-in is required before selecting an operation."} label="Operation" onChange={(value) => setWorkspace({ ...workspace, operationId: numberValue(value) })} options={operationOptions} value={workspace.operationId ? String(workspace.operationId) : ""} /><ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live procurement sign-in is required before changing status."} label="Status" onChange={(value) => setWorkspace({ ...workspace, status: value })} options={subcontractStatusOptions} required value={workspace.status} /><label><span>Expected return</span><input aria-label="Expected return" disabled={!live} onChange={(event) => setWorkspace({ ...workspace, expectedReturnDate: event.target.value })} type="date" value={dateControlValue(workspace.expectedReturnDate)} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}
