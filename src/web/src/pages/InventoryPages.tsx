import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StockIssueRequest, StockReservationRequest, StockReturnRequest, StockTransferRequest } from "../api/contracts";
import { apiClient } from "../api/http";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import {
  listMaterialIssueSetup,
  listMaterialReturnSetup,
  listStockBalanceSetup,
  listStockTransferPutawaySetup,
  listTraceabilitySetup,
  type MaterialIssueItem,
  type MaterialReturnItem,
  type StockBalanceItem,
  type StockTransferPutawayItem,
  type TraceabilityEventItem,
  type TraceabilityItem
} from "../inventory/inventoryAdapters";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpDecimalField, ErpLookupField, ErpModalWorkspace, ErpNumberField, ErpTransactionLineGrid, ErpValidationSummary } from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Live records" : "Review mode"}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("hold") || normalized.includes("reserved") || normalized.includes("issued")
    ? "warn"
    : normalized.includes("available") || normalized.includes("released") || normalized.includes("returned")
      ? "success"
      : normalized.includes("blocked")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function useInventoryFilter(search: string, status: string) {
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

type StockPostingMode = "issue" | "return" | "transfer";

interface StockPostingLineDraft {
  lineNo: number;
  itemId: number | null;
  fromWarehouseId: number | null;
  fromBinId: number | null;
  toWarehouseId: number | null;
  toBinId: number | null;
  lotId: number | null;
  serialId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  inventoryState: string;
}

interface StockPostingWorkspace {
  mode: StockPostingMode;
  transactionNo: string;
  postingDate: string;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  remarks: string | null;
  lines: StockPostingLineDraft[];
}

interface ReservationDraft {
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  reservedQuantity: number;
  status: string;
}

const inventoryStateOptions = ["Available", "QC_Hold", "Blocked", "InTransit"].map(toOption);
const sourceDocumentOptions = ["Manual", "WorkOrder", "JobCard", "ProductionReceipt", "Dispatch"].map(toOption);
const reservationStatusOptions = ["Reserved", "Allocated"].map(toOption);

function toOption(value: string) {
  return { label: value, value };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function nextStockTransactionNo(prefix: string) {
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

function buildStockPostingLine(lineNo: number): StockPostingLineDraft {
  return {
    lineNo,
    itemId: null,
    fromWarehouseId: null,
    fromBinId: null,
    toWarehouseId: null,
    toBinId: null,
    lotId: null,
    serialId: null,
    quantity: 1,
    catchWeightQty: null,
    inventoryState: "Available"
  };
}

function buildStockPostingWorkspace(mode: StockPostingMode): StockPostingWorkspace {
  const prefix = mode === "issue" ? "MI-DRAFT" : mode === "return" ? "MR-DRAFT" : "ST-DRAFT";

  return {
    mode,
    transactionNo: nextStockTransactionNo(prefix),
    postingDate: todayIsoDate(),
    sourceDocumentType: mode === "transfer" ? "Manual" : "WorkOrder",
    sourceDocumentId: null,
    remarks: null,
    lines: [buildStockPostingLine(10)]
  };
}

function buildReservationDraft(selected: StockBalanceItem): ReservationDraft {
  return {
    sourceDocumentType: "SalesOrder",
    sourceDocumentId: null,
    reservedQuantity: Math.max(selected.availableQty, 0),
    status: "Reserved"
  };
}

function renumberStockLines(lines: StockPostingLineDraft[]) {
  return lines.map((line, index) => ({ ...line, lineNo: (index + 1) * 10 }));
}

function stockPostingValidationErrors(workspace: StockPostingWorkspace | null) {
  if (!workspace) {
    return [];
  }

  const errors: string[] = [];
  if (!workspace.transactionNo.trim()) {
    errors.push("Transaction number is required.");
  }
  if (!workspace.postingDate) {
    errors.push("Posting date is required.");
  }
  if (workspace.lines.length === 0) {
    errors.push("At least one stock posting line is required.");
  }

  workspace.lines.forEach((line, index) => {
    if (!line.itemId) {
      errors.push(`Line ${index + 1} item is required.`);
    }
    if (workspace.mode !== "return" && !line.fromWarehouseId) {
      errors.push(`Line ${index + 1} source warehouse is required.`);
    }
    if (workspace.mode !== "issue" && !line.toWarehouseId) {
      errors.push(`Line ${index + 1} destination warehouse is required.`);
    }
    if (!line.quantity || line.quantity <= 0) {
      errors.push(`Line ${index + 1} quantity must be greater than zero.`);
    }
    if (!line.inventoryState.trim()) {
      errors.push(`Line ${index + 1} inventory state is required.`);
    }
  });

  return errors;
}

function reservationValidationErrors(draft: ReservationDraft | null, selected: StockBalanceItem | null) {
  if (!draft || !selected) {
    return [];
  }

  const errors: string[] = [];
  if (!draft.sourceDocumentType.trim()) {
    errors.push("Reservation source type is required.");
  }
  if (!draft.sourceDocumentId || draft.sourceDocumentId <= 0) {
    errors.push("Reservation source id is required.");
  }
  if (!draft.reservedQuantity || draft.reservedQuantity <= 0) {
    errors.push("Reserved quantity must be greater than zero.");
  }
  if (draft.reservedQuantity > selected.availableQty) {
    errors.push("Reserved quantity cannot exceed available quantity.");
  }

  return errors;
}

function buildReservationRequest(draft: ReservationDraft, selected: StockBalanceItem, companyId: number, branchId: number): StockReservationRequest {
  return {
    companyId,
    branchId,
    itemId: selected.itemId,
    itemVariantId: selected.itemVariantId,
    warehouseId: selected.warehouseId,
    binId: selected.binId,
    lotId: selected.lotId,
    reservedQuantity: draft.reservedQuantity,
    sourceDocumentType: draft.sourceDocumentType,
    sourceDocumentId: draft.sourceDocumentId ?? 0,
    status: draft.status
  };
}

function buildIssueRequest(workspace: StockPostingWorkspace, companyId: number, branchId: number): StockIssueRequest {
  return {
    companyId,
    branchId,
    transactionNo: workspace.transactionNo,
    postingDate: workspace.postingDate,
    sourceDocumentType: workspace.sourceDocumentType || null,
    sourceDocumentId: workspace.sourceDocumentId,
    remarks: workspace.remarks,
    lines: renumberStockLines(workspace.lines).map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId ?? 0,
      itemVariantId: null,
      fromWarehouseId: line.fromWarehouseId ?? 0,
      fromBinId: line.fromBinId,
      lotId: line.lotId,
      serialId: line.serialId,
      quantity: line.quantity,
      catchWeightQty: line.catchWeightQty,
      inventoryState: line.inventoryState
    }))
  };
}

function buildReturnRequest(workspace: StockPostingWorkspace, companyId: number, branchId: number): StockReturnRequest {
  return {
    companyId,
    branchId,
    transactionNo: workspace.transactionNo,
    postingDate: workspace.postingDate,
    sourceDocumentType: workspace.sourceDocumentType || null,
    sourceDocumentId: workspace.sourceDocumentId,
    remarks: workspace.remarks,
    lines: renumberStockLines(workspace.lines).map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId ?? 0,
      itemVariantId: null,
      toWarehouseId: line.toWarehouseId ?? 0,
      toBinId: line.toBinId,
      lotId: line.lotId,
      serialId: line.serialId,
      quantity: line.quantity,
      catchWeightQty: line.catchWeightQty,
      inventoryState: line.inventoryState
    }))
  };
}

function buildTransferRequest(workspace: StockPostingWorkspace, companyId: number, branchId: number): StockTransferRequest {
  return {
    companyId,
    branchId,
    transactionNo: workspace.transactionNo,
    postingDate: workspace.postingDate,
    sourceDocumentType: workspace.sourceDocumentType || null,
    sourceDocumentId: workspace.sourceDocumentId,
    remarks: workspace.remarks,
    lines: renumberStockLines(workspace.lines).map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId ?? 0,
      itemVariantId: null,
      fromWarehouseId: line.fromWarehouseId ?? 0,
      fromBinId: line.fromBinId,
      toWarehouseId: line.toWarehouseId ?? 0,
      toBinId: line.toBinId,
      lotId: line.lotId,
      serialId: line.serialId,
      quantity: line.quantity,
      catchWeightQty: line.catchWeightQty,
      inventoryState: line.inventoryState
    }))
  };
}

function StockPostingModal({
  binOptions,
  isLive,
  isPosting,
  itemOptions,
  onPost,
  postLabel,
  postReason,
  setWorkspace,
  validationErrors,
  warehouseOptions,
  workspace
}: {
  binOptions: { label: string; value: string }[];
  isLive: boolean;
  isPosting: boolean;
  itemOptions: { label: string; value: string }[];
  onPost: () => void;
  postLabel: string;
  postReason?: string;
  setWorkspace: (workspace: StockPostingWorkspace | null) => void;
  validationErrors: string[];
  warehouseOptions: { label: string; value: string }[];
  workspace: StockPostingWorkspace | null;
}) {
  const updateLine = (lineIndex: number, patch: Partial<StockPostingLineDraft>) => {
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

    setWorkspace({ ...workspace, lines: [...workspace.lines, buildStockPostingLine((workspace.lines.length + 1) * 10)] });
  };

  const removeLine = (lineIndex: number) => {
    if (!workspace) {
      return;
    }

    setWorkspace({ ...workspace, lines: renumberStockLines(workspace.lines.filter((_, index) => index !== lineIndex)) });
  };

  const title = workspace?.mode === "issue" ? "Material issue posting" : workspace?.mode === "return" ? "Material return posting" : "Stock transfer posting";

  return (
    <ErpModalWorkspace
      description="Post stock movements through the controlled inventory ledger with governed item, location, quantity, and state fields."
      footer={<ErpActionBar primary={[{ disabled: Boolean(postReason), label: isPosting ? "Posting stock" : postLabel, onClick: !postReason ? onPost : undefined, reason: postReason }]} secondary={[{ disabled: !isLive, label: "Add Line", onClick: isLive ? addLine : undefined, reason: isLive ? undefined : "Live inventory sign-in is required before adding stock lines." }]} utility={[{ label: "Close", onClick: () => setWorkspace(null), variant: "quiet" }]} />}
      isOpen={Boolean(workspace)}
      onClose={() => setWorkspace(null)}
      title={workspace?.transactionNo ?? title}
      validation={<ErpValidationSummary errors={validationErrors} />}
    >
      {workspace ? (
        <div className="modal-form-grid">
          <FormShell initialFingerprint={`${workspace.mode}-${workspace.transactionNo}`} title={title}>
            <label><span>Transaction number</span><input aria-label="Stock transaction number" disabled={!isLive} onChange={(event) => setWorkspace({ ...workspace, transactionNo: event.target.value })} value={workspace.transactionNo} /></label>
            <label><span>Posting date</span><input aria-label="Stock posting date" disabled={!isLive} onChange={(event) => setWorkspace({ ...workspace, postingDate: event.target.value })} required type="date" value={workspace.postingDate} /></label>
            <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before selecting source document type."} label="Source document type" onChange={(value) => setWorkspace({ ...workspace, sourceDocumentType: value })} options={sourceDocumentOptions} value={workspace.sourceDocumentType} />
            <ErpNumberField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before assigning source document id."} label="Source document id" min={1} onChange={(value) => setWorkspace({ ...workspace, sourceDocumentId: value })} value={workspace.sourceDocumentId} />
            <label className="form-span-2"><span>Remarks</span><input aria-label="Stock posting remarks" disabled={!isLive} onChange={(event) => setWorkspace({ ...workspace, remarks: event.target.value || null })} value={workspace.remarks ?? ""} /></label>
          </FormShell>
          <Card title="Stock posting lines" description="Every line posts as its own audited inventory movement.">
            <ErpTransactionLineGrid
              addDisabled={!isLive}
              addDisabledReason="Live inventory sign-in is required before adding stock lines."
              addLabel="Add Line"
              ariaLabel="Stock posting line grid"
              columns={[
                { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                { key: "item", header: "Item", width: "190px", render: (line, index) => <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before selecting an item."} label="Item" onChange={(value) => updateLine(index, { itemId: numberValue(value) })} options={itemOptions} required value={line.itemId ? String(line.itemId) : ""} /> },
                { key: "fromWarehouse", header: "Source wh", width: "160px", render: (line, index) => workspace.mode !== "return" ? <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before selecting source warehouse."} label="Source warehouse" onChange={(value) => updateLine(index, { fromWarehouseId: numberValue(value), fromBinId: null })} options={warehouseOptions} required value={line.fromWarehouseId ? String(line.fromWarehouseId) : ""} /> : <span className="muted">Return receipt</span> },
                { key: "fromBin", header: "Source bin", width: "140px", render: (line, index) => workspace.mode !== "return" ? <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before selecting source bin."} label="Source bin" onChange={(value) => updateLine(index, { fromBinId: numberValue(value) })} options={binOptions} value={line.fromBinId ? String(line.fromBinId) : ""} /> : <span className="muted">N/A</span> },
                { key: "toWarehouse", header: "Dest wh", width: "160px", render: (line, index) => workspace.mode !== "issue" ? <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before selecting destination warehouse."} label="Destination warehouse" onChange={(value) => updateLine(index, { toWarehouseId: numberValue(value), toBinId: null })} options={warehouseOptions} required value={line.toWarehouseId ? String(line.toWarehouseId) : ""} /> : <span className="muted">Issue out</span> },
                { key: "toBin", header: "Dest bin", width: "140px", render: (line, index) => workspace.mode !== "issue" ? <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before selecting destination bin."} label="Destination bin" onChange={(value) => updateLine(index, { toBinId: numberValue(value) })} options={binOptions} value={line.toBinId ? String(line.toBinId) : ""} /> : <span className="muted">N/A</span> },
                { key: "qty", header: "Qty", width: "120px", render: (line, index) => <ErpDecimalField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before changing quantity."} label="Quantity" min={0.001} onChange={(value) => updateLine(index, { quantity: value ?? 0 })} required value={line.quantity} /> },
                { key: "cw", header: "Catch wt", width: "120px", render: (line, index) => <ErpDecimalField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before changing catch weight."} label="Catch weight" min={0} onChange={(value) => updateLine(index, { catchWeightQty: value })} value={line.catchWeightQty} /> },
                { key: "state", header: "State", width: "150px", render: (line, index) => <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live inventory sign-in is required before changing inventory state."} label="Inventory state" onChange={(value) => updateLine(index, { inventoryState: value })} options={inventoryStateOptions} required value={line.inventoryState} /> },
                { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: !isLive || workspace.lines.length <= 1, label: "Remove Line", onClick: isLive && workspace.lines.length > 1 ? () => removeLine(index) : undefined, reason: !isLive ? "Live inventory sign-in is required before removing lines." : workspace.lines.length <= 1 ? "At least one stock posting line is required." : undefined }]} /> }
              ]}
              getRowId={(line, index) => `${line.lineNo}-${index}`}
              lines={workspace.lines}
              onAddLine={addLine}
              testId="stock-posting-line-grid"
            />
          </Card>
        </div>
      ) : null}
    </ErpModalWorkspace>
  );
}

const balanceColumns: DataGridColumn<StockBalanceItem>[] = [
  {
    key: "item",
    header: "Item",
    render: (record) => (
      <div>
        <strong>{record.itemLabel}</strong>
        <div className="muted">{record.lotSerialLabel}</div>
      </div>
    )
  },
  { key: "location", header: "Warehouse / bin", width: "18%", render: (record) => `${record.warehouseLabel} / ${record.binLabel}` },
  { key: "onHand", header: "On hand", width: "10%", render: (record) => record.onHandQty },
  { key: "reserved", header: "Reserved", width: "10%", render: (record) => record.reservedQty },
  { key: "hold", header: "QC/Blocked", width: "12%", render: (record) => `${record.qcHoldQty}/${record.blockedQty}` },
  { key: "available", header: "Available", width: "10%", render: (record) => <Badge tone={record.availableQty > 0 ? "success" : "warn"}>{record.availableQty}</Badge> },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function InventoryBalancePage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reservationDraft, setReservationDraft] = useState<ReservationDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useInventoryFilter(search, status);
  const query = useApiQuery(queryKeys.inventory.balances(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listStockBalanceSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const reservationErrors = reservationValidationErrors(reservationDraft, selected);
  const reserveReason = !selected
    ? "Select a balance before reserving stock."
    : !live || selected.source !== "Live"
      ? "Live inventory sign-in is required before reserving stock."
      : selected.availableQty <= 0
        ? "No available quantity remains for this balance."
        : reservationErrors.length > 0
          ? "Resolve reservation validation issues before saving."
          : undefined;
  const reserveStock = useApiMutation((request: StockReservationRequest) => apiClient.inventory.reserveStock(request), {
    onSuccess: async (record) => {
      setMessage(`Reserved ${record.reservedQuantity} for ${record.sourceDocumentType} ${record.sourceDocumentId}.`);
      setReservationDraft(null);
      setSelectedId(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !selected, label: "Open traceability", onClick: selected ? () => navigate(`/inventory/traceability?trace=${encodeURIComponent(selected.lotSerialLabel)}`) : undefined, reason: selected ? undefined : "Select a lot or serial balance before opening traceability." }]} secondary={[{ disabled: true, label: "Export balances", reason: "Inventory export is pending the approved reporting workflow." }]} testId="inventory-balance-action-bar" /></>} description="Real-time stock, reserved, QC-hold, blocked, in-transit, and catch-weight quantities by warehouse/bin." filters={<FilterBar><input aria-label="Search inventory balances" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search item, warehouse, bin, lot" value={search} /><select aria-label="Inventory balance status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Available">Available</option><option value="Reserved">Reserved</option><option value="QC Hold">QC Hold</option><option value="Blocked">Blocked</option></select></FilterBar>} title="Inventory Balance by Warehouse / Bin">
        {query.error ? <Card title="Live inventory balance data unavailable" description={query.error.message} /> : null}
        {message ? <Badge tone={message.toLowerCase().includes("reserved") ? "success" : "danger"}>{message}</Badge> : null}
        <KpiStrip items={[{ label: "Balance rows", value: String(records.length) }, { label: "On hand", value: String(records.reduce((total, record) => total + record.onHandQty, 0)) }, { label: "Reserved", value: String(records.reduce((total, record) => total + record.reservedQty, 0)) }, { label: "QC hold", value: String(records.reduce((total, record) => total + record.qcHoldQty, 0)) }]} />
        <Card title="Stock by warehouse/bin" description="Available quantity is net of reservations, QC hold, and blocked stock.">
          <DataGrid ariaLabel="Inventory balance list" columns={balanceColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.itemLabel} inventory balance`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Inventory balance detail supports trace review and controlled reservation against live available quantity." footer={<ErpActionBar primary={[{ disabled: Boolean(reserveReason), label: "Reserve stock", onClick: selected && !reserveReason ? () => setReservationDraft(buildReservationDraft(selected)) : undefined, reason: reserveReason }]} secondary={[{ label: "Open traceability", onClick: () => navigate(`/inventory/traceability?trace=${encodeURIComponent(selected?.lotSerialLabel ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.itemLabel ?? "Inventory balance"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Balance review"><ErpLookupField disabled disabledReason="Warehouse and bin are controlled by inventory location master." label="Location" onChange={() => undefined} options={[{ label: `${selected.warehouseLabel} / ${selected.binLabel}`, value: `${selected.warehouseLabel} / ${selected.binLabel}` }]} value={`${selected.warehouseLabel} / ${selected.binLabel}`} /><ErpLookupField disabled disabledReason="Lot and serial values are controlled by inventory postings." label="Lot / serial" onChange={() => undefined} options={[{ label: selected.lotSerialLabel, value: selected.lotSerialLabel }]} value={selected.lotSerialLabel} /><ErpNumberField disabled disabledReason="On-hand quantity is controlled by inventory postings." label="On hand" onChange={() => undefined} value={selected.onHandQty} /><ErpNumberField disabled disabledReason="Reserved quantity is controlled by reservations." label="Reserved" onChange={() => undefined} value={selected.reservedQty} /><ErpNumberField disabled disabledReason="Available quantity is calculated from inventory postings." label="Available" onChange={() => undefined} value={selected.availableQty} /><ErpLookupField disabled disabledReason="Catch-weight basis is controlled by item and inventory posting rules." label="Catch-weight basis" onChange={() => undefined} options={[{ label: selected.catchWeightLabel, value: selected.catchWeightLabel }]} value={selected.catchWeightLabel} /></FormShell> : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Reserve available stock against a source document without changing on-hand quantity."
        footer={<ErpActionBar primary={[{ disabled: Boolean(reserveReason) || reserveStock.isPending, label: reserveStock.isPending ? "Reserving stock" : "Save reservation", onClick: reservationDraft && selected && !reserveReason ? () => reserveStock.mutate(buildReservationRequest(reservationDraft, selected, companyId, branchId)) : undefined, reason: reserveReason }]} utility={[{ label: "Close", onClick: () => setReservationDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(reservationDraft && selected)}
        onClose={() => setReservationDraft(null)}
        title="Stock reservation"
        validation={<ErpValidationSummary errors={reservationErrors} />}
      >
        {reservationDraft && selected ? (
          <FormShell initialFingerprint={`${selected.id}-reservation`} title="Reservation controls">
            <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live inventory sign-in is required before changing source type."} label="Source document type" onChange={(value) => setReservationDraft({ ...reservationDraft, sourceDocumentType: value })} options={["SalesOrder", "WorkOrder", "Dispatch", "Manual"].map(toOption)} value={reservationDraft.sourceDocumentType} />
            <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live inventory sign-in is required before assigning source id."} label="Source document id" min={1} onChange={(value) => setReservationDraft({ ...reservationDraft, sourceDocumentId: value })} value={reservationDraft.sourceDocumentId} />
            <ErpDecimalField disabled={!live} disabledReason={live ? undefined : "Live inventory sign-in is required before changing reserved quantity."} label="Reserved quantity" max={selected.availableQty} min={0.001} onChange={(value) => setReservationDraft({ ...reservationDraft, reservedQuantity: value ?? 0 })} value={reservationDraft.reservedQuantity} />
            <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live inventory sign-in is required before changing reservation status."} label="Reservation status" onChange={(value) => setReservationDraft({ ...reservationDraft, status: value })} options={reservationStatusOptions} value={reservationDraft.status} />
            <ErpNumberField disabled disabledReason="Available quantity is calculated from the selected balance." label="Available quantity" onChange={() => undefined} value={selected.availableQty} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const traceColumns: DataGridColumn<TraceabilityItem>[] = [
  { key: "trace", header: "Lot / serial", width: "20%", render: (record) => <strong>{record.traceRef}</strong> },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "location", header: "Current location", width: "20%", render: (record) => record.currentLocation },
  { key: "cw", header: "Catch weight", width: "14%", render: (record) => record.catchWeightLabel },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.status} /> }
];

const traceEventColumns: DataGridColumn<TraceabilityEventItem>[] = [
  { key: "tx", header: "Transaction", width: "18%", render: (record) => <strong>{record.transactionNo}</strong> },
  { key: "type", header: "Type", width: "16%", render: (record) => record.transactionType },
  { key: "date", header: "Date", width: "12%", render: (record) => record.postingDate },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "movement", header: "Movement", render: (record) => `${record.fromLocation} -> ${record.toLocation}` },
  { key: "state", header: "State", width: "12%", render: (record) => <StatusBadge status={record.state} /> }
];

export function TraceabilityPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, "all"), [deferredSearch, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.inventory.traceability(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch), () => listTraceabilitySetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? records[0] ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");

  return (
    <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar secondary={[{ disabled: true, label: "Export genealogy", reason: "Traceability export is pending the approved reporting workflow." }]} testId="traceability-action-bar" /></>} description="Forward/backward traceability by lot, serial, order, and stock movement." filters={<FilterBar><input aria-label="Search traceability" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search lot, serial, item, order" value={search} /></FilterBar>} title="Lot / Serial / Catch Weight Traceability">
        <KpiStrip items={[{ label: "Trace refs", value: String(records.length) }, { label: "Events", value: String(records.reduce((total, record) => total + record.events.length, 0)) }, { label: "Held/reserved", value: String(records.filter((record) => record.status.includes("Hold") || record.status.includes("Reserved")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
      <div className="split-panels">
        <Card title="Traceability register" description="Search shows lot and serial traceability when a concrete reference is supplied.">
          <DataGrid ariaLabel="Traceability list" columns={traceColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.traceRef} traceability`} />
        </Card>
        <Card title="Movement genealogy" description={selected ? selected.currentLocation : "Select a lot or serial to view movement genealogy."}>
          <DataGrid ariaLabel="Traceability events" columns={traceEventColumns} getRowId={(record) => record.id} records={selected?.events ?? []} rowLabel={(record) => `${record.transactionNo} traceability event`} />
        </Card>
      </div>
    </ListPageShell>
  );
}

const issueColumns: DataGridColumn<MaterialIssueItem>[] = [
  { key: "issue", header: "Issue", width: "18%", render: (record) => <strong>{record.transactionNo}</strong> },
  { key: "source", header: "WO / JC", width: "16%", render: (record) => record.sourceDocument },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "from", header: "From", width: "18%", render: (record) => record.fromLocation },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function MaterialIssuePage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StockPostingWorkspace | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useInventoryFilter(search, status);
  const query = useApiQuery(queryKeys.inventory.materialIssues(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listMaterialIssueSetup(session, filter), { staleTime: 60_000 });
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const warehouses = useApiQuery(queryKeys.organization.warehouses(companyId, branchId, "", "Active"), () => apiClient.organization.warehouses({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const bins = useApiQuery(queryKeys.organization.bins(companyId, branchId, "", "Active"), () => apiClient.organization.bins({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const warehouseOptions = entityOptions(warehouses.data?.items, (warehouse) => warehouse.id, (warehouse) => `${warehouse.warehouseCode} / ${warehouse.warehouseName}`);
  const binOptions = entityOptions(bins.data?.items, (bin) => bin.id, (bin) => `${bin.binCode} / ${bin.binName}`);
  const validationErrors = stockPostingValidationErrors(draft);
  const postIssue = useApiMutation((request: StockIssueRequest) => apiClient.inventory.issueStock(request), {
    onSuccess: async (movements) => {
      setMessage(`Posted ${movements.length} material issue movement${movements.length === 1 ? "" : "s"}.`);
      setDraft(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const postReason = !live
    ? "Material issue posting requires a live inventory session."
    : validationErrors.length > 0
      ? "Resolve stock posting validation issues before posting."
      : postIssue.isPending
        ? "Material issue posting is in progress."
        : undefined;

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !live, label: "Prepare issue draft", onClick: live ? () => { setMessage(null); setDraft(buildStockPostingWorkspace("issue")); } : undefined, reason: live ? undefined : "Material issue drafting requires a live inventory session." }]} secondary={[{ disabled: true, label: "Print pick slip", reason: "Pick-slip printing is pending document workflow enablement." }]} testId="material-issue-action-bar" /></>} description="Issue reserved or actual material to a work order or job card with audit-friendly review controls." filters={<FilterBar><input aria-label="Search material issues" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search issue, work order, item, bin" value={search} /><select aria-label="Material issue status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Issued">Issued</option><option value="Reserved">Reserved</option><option value="Draft">Draft</option></select></FilterBar>} title="Material Issue to WO">
      <KpiStrip items={[{ label: "Issues", value: String(records.length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "WO-linked", value: String(records.filter((record) => record.sourceDocument.includes("WO")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {message ? <Badge tone={message.startsWith("Posted") ? "success" : "danger"}>{message}</Badge> : null}
        <Card title="Material issue workbench" description="Existing issue records are review-only; new issue drafts post through the controlled stock ledger.">
          <DataGrid ariaLabel="Material issue list" columns={issueColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.transactionNo} material issue`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Posted material issue detail is review-only; use Prepare issue draft for new ledger postings." footer={<ErpActionBar primary={[{ disabled: true, label: "Save issue draft", reason: "Posted issue records cannot be changed; create a new issue draft for additional movement." }]} secondary={[{ disabled: true, label: "Post issue", reason: "This issue is already posted or loaded as a read-only ledger movement." }, { label: "Open source", onClick: () => navigate(`/production/work-orders?source=${encodeURIComponent(selected?.sourceDocument ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.transactionNo ?? "Material issue"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Material issue controls"><ErpLookupField disabled disabledReason="Source document is controlled by work-order and job-card release." label="Source" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} /><ErpLookupField disabled disabledReason="Source location is controlled by warehouse and bin master." label="From location" onChange={() => undefined} options={[{ label: selected.fromLocation, value: selected.fromLocation }]} value={selected.fromLocation} /><ErpNumberField disabled disabledReason="Issued quantity is controlled by inventory posting." label="Issue quantity" onChange={() => undefined} value={selected.quantity} /><ErpLookupField disabled disabledReason="Issue mode is controlled by inventory posting policy." label="Issue mode" onChange={() => undefined} options={[{ label: selected.issueMode, value: selected.issueMode }]} value={selected.issueMode} /></FormShell> : null}
      </ErpModalWorkspace>
      <StockPostingModal binOptions={binOptions} isLive={live} isPosting={postIssue.isPending} itemOptions={itemOptions} onPost={() => draft && postIssue.mutate(buildIssueRequest(draft, companyId, branchId))} postLabel="Post issue" postReason={postReason} setWorkspace={setDraft} validationErrors={validationErrors} warehouseOptions={warehouseOptions} workspace={draft} />
    </>
  );
}

const returnColumns: DataGridColumn<MaterialReturnItem>[] = [
  { key: "return", header: "Return", width: "18%", render: (record) => <strong>{record.transactionNo}</strong> },
  { key: "source", header: "WO / JC", width: "16%", render: (record) => record.sourceDocument },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "to", header: "Return to", width: "18%", render: (record) => record.toLocation },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function MaterialReturnPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StockPostingWorkspace | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useInventoryFilter(search, status);
  const query = useApiQuery(queryKeys.inventory.materialReturns(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listMaterialReturnSetup(session, filter), { staleTime: 60_000 });
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const warehouses = useApiQuery(queryKeys.organization.warehouses(companyId, branchId, "", "Active"), () => apiClient.organization.warehouses({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const bins = useApiQuery(queryKeys.organization.bins(companyId, branchId, "", "Active"), () => apiClient.organization.bins({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const warehouseOptions = entityOptions(warehouses.data?.items, (warehouse) => warehouse.id, (warehouse) => `${warehouse.warehouseCode} / ${warehouse.warehouseName}`);
  const binOptions = entityOptions(bins.data?.items, (bin) => bin.id, (bin) => `${bin.binCode} / ${bin.binName}`);
  const validationErrors = stockPostingValidationErrors(draft);
  const postReturn = useApiMutation((request: StockReturnRequest) => apiClient.inventory.returnStock(request), {
    onSuccess: async (movements) => {
      setMessage(`Posted ${movements.length} material return movement${movements.length === 1 ? "" : "s"}.`);
      setDraft(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const postReason = !live
    ? "Material return posting requires a live inventory session."
    : validationErrors.length > 0
      ? "Resolve stock posting validation issues before posting."
      : postReturn.isPending
        ? "Material return posting is in progress."
        : undefined;

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !live, label: "Prepare return draft", onClick: live ? () => { setMessage(null); setDraft(buildStockPostingWorkspace("return")); } : undefined, reason: live ? undefined : "Material return drafting requires a live inventory session." }]} secondary={[{ disabled: true, label: "Print return note", reason: "Return-note printing is pending document workflow enablement." }]} testId="material-return-action-bar" /></>} description="Return unused production material to stock or bin with lot and catch-weight context retained." filters={<FilterBar><input aria-label="Search material returns" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search return, work order, item, bin" value={search} /><select aria-label="Material return status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Returned">Returned</option><option value="Draft">Draft</option></select></FilterBar>} title="Material Return from WO">
      <KpiStrip items={[{ label: "Returns", value: String(records.length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "WO-linked", value: String(records.filter((record) => record.sourceDocument.includes("WO")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {message ? <Badge tone={message.startsWith("Posted") ? "success" : "danger"}>{message}</Badge> : null}
        <Card title="Material return workbench" description="Existing return records are review-only; new return drafts post through the controlled stock ledger.">
          <DataGrid ariaLabel="Material return list" columns={returnColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.transactionNo} material return`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Posted material return detail is review-only; use Prepare return draft for new ledger postings." footer={<ErpActionBar primary={[{ disabled: true, label: "Save return draft", reason: "Posted return records cannot be changed; create a new return draft for additional movement." }]} secondary={[{ disabled: true, label: "Post return", reason: "This return is already posted or loaded as a read-only ledger movement." }, { label: "Open source", onClick: () => navigate(`/production/work-orders?source=${encodeURIComponent(selected?.sourceDocument ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.transactionNo ?? "Material return"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Material return controls"><ErpLookupField disabled disabledReason="Source document is controlled by work-order and job-card release." label="Source" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} /><ErpLookupField disabled disabledReason="Return location is controlled by warehouse and bin master." label="Return location" onChange={() => undefined} options={[{ label: selected.toLocation, value: selected.toLocation }]} value={selected.toLocation} /><ErpNumberField disabled disabledReason="Returned quantity is controlled by inventory posting." label="Return quantity" onChange={() => undefined} value={selected.quantity} /><ErpLookupField disabled disabledReason="Return reason is controlled by reason-code master." label="Return reason" onChange={() => undefined} options={[{ label: selected.returnReason, value: selected.returnReason }]} value={selected.returnReason} /></FormShell> : null}
      </ErpModalWorkspace>
      <StockPostingModal binOptions={binOptions} isLive={live} isPosting={postReturn.isPending} itemOptions={itemOptions} onPost={() => draft && postReturn.mutate(buildReturnRequest(draft, companyId, branchId))} postLabel="Post return" postReason={postReason} setWorkspace={setDraft} validationErrors={validationErrors} warehouseOptions={warehouseOptions} workspace={draft} />
    </>
  );
}

const transferColumns: DataGridColumn<StockTransferPutawayItem>[] = [
  { key: "transfer", header: "Movement", width: "18%", render: (record) => <strong>{record.transactionNo}</strong> },
  { key: "type", header: "Type", width: "12%", render: (record) => record.movementType },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "route", header: "From -> to", width: "24%", render: (record) => `${record.fromLocation} -> ${record.toLocation}` },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function StockTransferPutawayPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StockPostingWorkspace | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useInventoryFilter(search, status);
  const query = useApiQuery(queryKeys.inventory.stockTransfers(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listStockTransferPutawaySetup(session, filter), { staleTime: 60_000 });
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const warehouses = useApiQuery(queryKeys.organization.warehouses(companyId, branchId, "", "Active"), () => apiClient.organization.warehouses({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const bins = useApiQuery(queryKeys.organization.bins(companyId, branchId, "", "Active"), () => apiClient.organization.bins({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const warehouseOptions = entityOptions(warehouses.data?.items, (warehouse) => warehouse.id, (warehouse) => `${warehouse.warehouseCode} / ${warehouse.warehouseName}`);
  const binOptions = entityOptions(bins.data?.items, (bin) => bin.id, (bin) => `${bin.binCode} / ${bin.binName}`);
  const validationErrors = stockPostingValidationErrors(draft);
  const postTransfer = useApiMutation((request: StockTransferRequest) => apiClient.inventory.transferStock(request), {
    onSuccess: async (movements) => {
      setMessage(`Posted ${movements.length} stock transfer movement${movements.length === 1 ? "" : "s"}.`);
      setDraft(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const postReason = !live
    ? "Stock transfer posting requires a live inventory session."
    : validationErrors.length > 0
      ? "Resolve stock posting validation issues before posting."
      : postTransfer.isPending
        ? "Stock transfer posting is in progress."
        : undefined;

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !live, label: "Prepare transfer draft", onClick: live ? () => { setMessage(null); setDraft(buildStockPostingWorkspace("transfer")); } : undefined, reason: live ? undefined : "Stock transfer drafting requires a live inventory session." }]} secondary={[{ disabled: true, label: "Print movement slip", reason: "Movement-slip printing is pending document workflow enablement." }]} testId="stock-transfer-action-bar" /></>} description="Inter-warehouse/bin movement and putaway review for stores users." filters={<FilterBar><input aria-label="Search stock transfers" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search transfer, item, bin, warehouse" value={search} /><select aria-label="Stock transfer status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Released">Released</option><option value="QC Hold">QC Hold</option><option value="Draft">Draft</option></select></FilterBar>} title="Stock Transfer / Putaway">
      <KpiStrip items={[{ label: "Movements", value: String(records.length) }, { label: "Putaway", value: String(records.filter((record) => record.movementType === "Putaway").length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {message ? <Badge tone={message.startsWith("Posted") ? "success" : "danger"}>{message}</Badge> : null}
        <Card title="Transfer and putaway queue" description="Existing movement records are review-only; new transfer drafts post through the controlled stock ledger.">
          <DataGrid ariaLabel="Stock transfer putaway list" columns={transferColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.transactionNo} stock transfer`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Posted stock movement detail is review-only; use Prepare transfer draft for new ledger postings." footer={<ErpActionBar primary={[{ disabled: true, label: "Save transfer draft", reason: "Posted transfer records cannot be changed; create a new transfer draft for additional movement." }]} secondary={[{ disabled: true, label: "Post transfer", reason: "This transfer is already posted or loaded as a read-only ledger movement." }, { label: "Open balances", onClick: () => navigate(`/inventory/balances?item=${encodeURIComponent(selected?.itemLabel ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.transactionNo ?? "Stock movement"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Stock transfer controls"><ErpLookupField disabled disabledReason="Source location is controlled by warehouse and bin master." label="From" onChange={() => undefined} options={[{ label: selected.fromLocation, value: selected.fromLocation }]} value={selected.fromLocation} /><ErpLookupField disabled disabledReason="Destination location is controlled by warehouse and bin master." label="To" onChange={() => undefined} options={[{ label: selected.toLocation, value: selected.toLocation }]} value={selected.toLocation} /><ErpNumberField disabled disabledReason="Movement quantity is controlled by inventory posting." label="Movement quantity" onChange={() => undefined} value={selected.quantity} /><ErpLookupField disabled disabledReason="Movement type is controlled by inventory posting policy." label="Movement type" onChange={() => undefined} options={[{ label: selected.movementType, value: selected.movementType }]} value={selected.movementType} /></FormShell> : null}
      </ErpModalWorkspace>
      <StockPostingModal binOptions={binOptions} isLive={live} isPosting={postTransfer.isPending} itemOptions={itemOptions} onPost={() => draft && postTransfer.mutate(buildTransferRequest(draft, companyId, branchId))} postLabel="Post transfer" postReason={postReason} setWorkspace={setDraft} validationErrors={validationErrors} warehouseOptions={warehouseOptions} workspace={draft} />
    </>
  );
}
