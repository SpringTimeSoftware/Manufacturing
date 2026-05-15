import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ProductionReceiptCreateRequest, ReworkOrderCreateRequest, ScrapEntryCreateRequest } from "../api/contracts";
import { apiClient } from "../api/http";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import {
  listMachineStatus,
  listProductionReceipts,
  listReworkOrders,
  listScrapByProducts,
  type MachineStatusItem,
  type ProductionReceiptItem,
  type ReworkOrderItem,
  type ScrapByProductItem
} from "../production/productionOutputAdapters";
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
  const tone = normalized.includes("post") || normalized.includes("release") || normalized.includes("running")
    ? "success"
    : normalized.includes("draft") || normalized.includes("review") || normalized.includes("idle")
      ? "warn"
      : normalized.includes("down") || normalized.includes("hold")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function usePageFilter(search: string, status: string) {
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

type OutputPostingMode = "receipt" | "scrap" | "rework";

interface OutputPostingDraft {
  mode: OutputPostingMode;
  documentNo: string;
  postingDate: string;
  workOrderId: number | null;
  jobCardId: number | null;
  receiptLines: ProductionReceiptCreateRequest["lines"];
  itemId: number | null;
  outputUomId: number | null;
  warehouseId: number | null;
  binId: number | null;
  targetWarehouseId: number | null;
  targetBinId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  lineType: string;
  reasonCode: string;
  inventoryState: string;
  instructions: string | null;
  remarks: string | null;
}

const outputInventoryStateOptions = ["Available", "QC_Hold", "Blocked"].map(toOption);
const receiptLineTypeOptions = ["Good", "ByProduct"].map(toOption);
const reasonOptions = ["PROCESS_SCRAP", "SETUP_SCRAP", "QUALITY_REWORK", "CUSTOMER_REWORK"].map(toOption);

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

function buildOutputDraft(mode: OutputPostingMode, sourceType?: string | null, sourceId?: number | null): OutputPostingDraft {
  const receiptLine = buildReceiptLine(10);
  const workOrderId = sourceType === "WorkOrder" ? sourceId ?? null : null;
  const jobCardId = sourceType === "JobCard" ? sourceId ?? null : null;

  return {
    mode,
    documentNo: nextDocumentNo(mode === "receipt" ? "PRC" : mode === "scrap" ? "SCR" : "RWK"),
    postingDate: todayIsoDate(),
    workOrderId,
    jobCardId,
    receiptLines: [receiptLine],
    itemId: null,
    outputUomId: null,
    warehouseId: null,
    binId: null,
    targetWarehouseId: null,
    targetBinId: null,
    quantity: 1,
    catchWeightQty: null,
    lineType: mode === "receipt" ? "Good" : "Scrap",
    reasonCode: mode === "rework" ? "QUALITY_REWORK" : "PROCESS_SCRAP",
    inventoryState: mode === "scrap" ? "Available" : "QC_Hold",
    instructions: null,
    remarks: null
  };
}

function getOutputSource(searchParams: URLSearchParams) {
  const sourceType = searchParams.get("sourceType");
  const parsedId = numberValue(searchParams.get("sourceId") ?? "");

  return {
    sourceType: sourceType === "JobCard" || sourceType === "WorkOrder" ? sourceType : undefined,
    sourceId: parsedId
  };
}

function buildReceiptLine(lineNo: number): ProductionReceiptCreateRequest["lines"][number] {
  return {
    lineNo,
    lineType: "Good",
    itemId: 0,
    itemVariantId: null,
    outputUomId: 0,
    warehouseId: 0,
    binId: null,
    quantity: 1,
    catchWeightQty: null,
    inventoryState: "QC_Hold",
    remarks: null
  };
}

function outputValidationErrors(draft: OutputPostingDraft | null) {
  if (!draft) {
    return [];
  }

  const errors: string[] = [];
  if (!draft.documentNo.trim()) {
    errors.push("Document number is required.");
  }
  if (!draft.postingDate) {
    errors.push("Posting date is required.");
  }
  if (draft.mode === "receipt") {
    if (draft.receiptLines.length === 0) {
      errors.push("At least one receipt line is required.");
    }

    draft.receiptLines.forEach((line, index) => {
      if (!line.itemId) {
        errors.push(`Receipt line ${index + 1} item is required.`);
      }
      if (!line.outputUomId) {
        errors.push(`Receipt line ${index + 1} output UOM is required.`);
      }
      if (!line.warehouseId) {
        errors.push(`Receipt line ${index + 1} warehouse is required.`);
      }
      if (!line.quantity || line.quantity <= 0) {
        errors.push(`Receipt line ${index + 1} quantity must be greater than zero.`);
      }
    });
  } else {
    if (!draft.itemId) {
      errors.push("Item is required.");
    }
    if (!draft.quantity || draft.quantity <= 0) {
      errors.push("Quantity must be greater than zero.");
    }
    if (draft.mode === "scrap" && !draft.warehouseId) {
      errors.push("Warehouse is required.");
    }
  }
  if (draft.mode === "scrap" && !draft.reasonCode.trim()) {
    errors.push("Scrap reason is required.");
  }
  if (draft.mode === "rework" && !draft.targetWarehouseId) {
    errors.push("Target warehouse is required for rework.");
  }

  return errors;
}

function buildReceiptRequest(draft: OutputPostingDraft, companyId: number, branchId: number): ProductionReceiptCreateRequest {
  return {
    companyId,
    branchId,
    receiptNo: draft.documentNo,
    postingDate: draft.postingDate,
    workOrderId: draft.workOrderId,
    jobCardId: draft.jobCardId,
    correlationId: null,
    remarks: draft.remarks,
    lines: draft.receiptLines.map((line, index) => ({ ...line, lineNo: (index + 1) * 10 }))
  };
}

function buildScrapRequest(draft: OutputPostingDraft, companyId: number, branchId: number): ScrapEntryCreateRequest {
  return {
    companyId,
    branchId,
    scrapNo: draft.documentNo,
    postingDate: draft.postingDate,
    workOrderId: draft.workOrderId,
    jobCardId: draft.jobCardId,
    itemId: draft.itemId ?? 0,
    itemVariantId: null,
    warehouseId: draft.warehouseId ?? 0,
    binId: draft.binId,
    quantity: draft.quantity,
    catchWeightQty: draft.catchWeightQty,
    reasonCode: draft.reasonCode,
    inventoryState: draft.inventoryState,
    remarks: draft.remarks
  };
}

function buildReworkRequest(draft: OutputPostingDraft, companyId: number, branchId: number): ReworkOrderCreateRequest {
  return {
    companyId,
    branchId,
    reworkNo: draft.documentNo,
    sourceDocumentType: draft.jobCardId ? "JobCard" : draft.workOrderId ? "WorkOrder" : "Manual",
    sourceDocumentId: draft.jobCardId ?? draft.workOrderId,
    workOrderId: draft.workOrderId,
    jobCardId: draft.jobCardId,
    itemId: draft.itemId ?? 0,
    itemVariantId: null,
    sourceWarehouseId: draft.warehouseId,
    sourceBinId: draft.binId,
    targetWarehouseId: draft.targetWarehouseId,
    targetBinId: draft.targetBinId,
    quantity: draft.quantity,
    catchWeightQty: draft.catchWeightQty,
    reasonCode: draft.reasonCode,
    instructions: draft.instructions,
    inventoryState: draft.inventoryState
  };
}

function OutputPostingModal({
  binOptions,
  draft,
  isLive,
  isPosting,
  itemOptions,
  onPost,
  postLabel,
  postReason,
  setDraft,
  uomOptions,
  validationErrors,
  warehouseOptions
}: {
  binOptions: { label: string; value: string }[];
  draft: OutputPostingDraft | null;
  isLive: boolean;
  isPosting: boolean;
  itemOptions: { label: string; value: string }[];
  onPost: () => void;
  postLabel: string;
  postReason?: string;
  setDraft: (draft: OutputPostingDraft | null) => void;
  uomOptions: { label: string; value: string }[];
  validationErrors: string[];
  warehouseOptions: { label: string; value: string }[];
}) {
  const title = draft?.mode === "receipt" ? "Production receipt posting" : draft?.mode === "scrap" ? "Scrap posting" : "Rework order creation";
  const updateReceiptLine = (lineIndex: number, patch: Partial<ProductionReceiptCreateRequest["lines"][number]>) => {
    if (!draft || draft.mode !== "receipt") {
      return;
    }

    setDraft({
      ...draft,
      receiptLines: draft.receiptLines.map((line, index) => index === lineIndex ? { ...line, ...patch } : line)
    });
  };
  const addReceiptLine = () => {
    if (!draft || draft.mode !== "receipt") {
      return;
    }

    setDraft({
      ...draft,
      receiptLines: [...draft.receiptLines, buildReceiptLine((draft.receiptLines.length + 1) * 10)]
    });
  };
  const removeReceiptLine = (lineIndex: number) => {
    if (!draft || draft.mode !== "receipt" || draft.receiptLines.length <= 1) {
      return;
    }

    setDraft({
      ...draft,
      receiptLines: draft.receiptLines
        .filter((_, index) => index !== lineIndex)
        .map((line, index) => ({ ...line, lineNo: (index + 1) * 10 }))
    });
  };

  return (
    <ErpModalWorkspace
      description="Create the controlled production output document with governed item, location, quantity, and reason fields."
      footer={<ErpActionBar primary={[{ disabled: Boolean(postReason), label: isPosting ? "Posting" : postLabel, onClick: !postReason ? onPost : undefined, reason: postReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
      isOpen={Boolean(draft)}
      onClose={() => setDraft(null)}
      title={draft?.documentNo ?? title}
      validation={<ErpValidationSummary errors={validationErrors} />}
    >
      {draft ? (
        <FormShell initialFingerprint={`${draft.mode}-${draft.documentNo}`} title={title}>
          <label><span>Document number</span><input aria-label="Production output document number" disabled={!isLive} onChange={(event) => setDraft({ ...draft, documentNo: event.target.value })} value={draft.documentNo} /></label>
          <label><span>Posting date</span><input aria-label="Production output posting date" disabled={!isLive} onChange={(event) => setDraft({ ...draft, postingDate: event.target.value })} required type="date" value={draft.postingDate} /></label>
          <ErpNumberField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before assigning a work order."} label="Work order id" min={1} onChange={(value) => setDraft({ ...draft, workOrderId: value })} value={draft.workOrderId} />
          <ErpNumberField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before assigning a job card."} label="Job card id" min={1} onChange={(value) => setDraft({ ...draft, jobCardId: value })} value={draft.jobCardId} />
          {draft.mode === "receipt" ? (
            <Card title="Receipt lines" description="Add every finished good or by-product line before posting inventory.">
              <ErpTransactionLineGrid
                addDisabled={!isLive}
                addDisabledReason="Live production sign-in is required before adding receipt lines."
                addLabel="Add Line"
                ariaLabel="Production receipt line grid"
                columns={[
                  { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                  { key: "item", header: "Item", width: "190px", render: (line, index) => <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting an item."} label="Item" onChange={(value) => updateReceiptLine(index, { itemId: value ? Number(value) : 0 })} options={itemOptions} required value={line.itemId ? String(line.itemId) : ""} /> },
                  { key: "uom", header: "UOM", width: "150px", render: (line, index) => <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting output UOM."} label="Output UOM" onChange={(value) => updateReceiptLine(index, { outputUomId: value ? Number(value) : 0 })} options={uomOptions} required value={line.outputUomId ? String(line.outputUomId) : ""} /> },
                  { key: "type", header: "Type", width: "140px", render: (line, index) => <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting line type."} label="Line type" onChange={(value) => updateReceiptLine(index, { lineType: value })} options={receiptLineTypeOptions} value={line.lineType} /> },
                  { key: "warehouse", header: "Warehouse", width: "160px", render: (line, index) => <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting warehouse."} label="Warehouse" onChange={(value) => updateReceiptLine(index, { warehouseId: value ? Number(value) : 0, binId: null })} options={warehouseOptions} required value={line.warehouseId ? String(line.warehouseId) : ""} /> },
                  { key: "bin", header: "Bin", width: "130px", render: (line, index) => <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting bin."} label="Bin" onChange={(value) => updateReceiptLine(index, { binId: numberValue(value) })} options={binOptions} value={line.binId ? String(line.binId) : ""} /> },
                  { key: "qty", header: "Qty", width: "120px", render: (line, index) => <ErpDecimalField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before changing quantity."} label="Quantity" min={0.001} onChange={(value) => updateReceiptLine(index, { quantity: value ?? 0 })} required value={line.quantity} /> },
                  { key: "cw", header: "Catch wt", width: "120px", render: (line, index) => <ErpDecimalField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before changing catch weight."} label="Catch weight" min={0} onChange={(value) => updateReceiptLine(index, { catchWeightQty: value })} value={line.catchWeightQty} /> },
                  { key: "state", header: "State", width: "140px", render: (line, index) => <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before changing inventory state."} label="Inventory state" onChange={(value) => updateReceiptLine(index, { inventoryState: value })} options={outputInventoryStateOptions} value={line.inventoryState} /> },
                  { key: "remarks", header: "Remarks", width: "170px", render: (line, index) => <label><span>Remarks</span><input aria-label={`Receipt line ${index + 1} remarks`} disabled={!isLive} onChange={(event) => updateReceiptLine(index, { remarks: event.target.value || null })} value={line.remarks ?? ""} /></label> },
                  { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: !isLive || draft.receiptLines.length <= 1, label: "Remove Line", onClick: isLive && draft.receiptLines.length > 1 ? () => removeReceiptLine(index) : undefined, reason: !isLive ? "Live production sign-in is required before removing receipt lines." : draft.receiptLines.length <= 1 ? "At least one receipt line is required." : undefined }]} /> }
                ]}
                getRowId={(line, index) => `${line.lineNo}-${index}`}
                lines={draft.receiptLines}
                onAddLine={addReceiptLine}
                testId="production-receipt-line-grid"
              />
            </Card>
          ) : (
            <>
          <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting an item."} label="Item" onChange={(value) => setDraft({ ...draft, itemId: numberValue(value) })} options={itemOptions} required value={draft.itemId ? String(draft.itemId) : ""} />
          {draft.mode !== "rework" ? <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting warehouse."} label="Warehouse" onChange={(value) => setDraft({ ...draft, warehouseId: numberValue(value), binId: null })} options={warehouseOptions} required value={draft.warehouseId ? String(draft.warehouseId) : ""} /> : <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting source warehouse."} label="Source warehouse" onChange={(value) => setDraft({ ...draft, warehouseId: numberValue(value), binId: null })} options={warehouseOptions} value={draft.warehouseId ? String(draft.warehouseId) : ""} />}
          <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting bin."} label={draft.mode === "rework" ? "Source bin" : "Bin"} onChange={(value) => setDraft({ ...draft, binId: numberValue(value) })} options={binOptions} value={draft.binId ? String(draft.binId) : ""} />
          {draft.mode === "rework" ? <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting target warehouse."} label="Target warehouse" onChange={(value) => setDraft({ ...draft, targetWarehouseId: numberValue(value), targetBinId: null })} options={warehouseOptions} required value={draft.targetWarehouseId ? String(draft.targetWarehouseId) : ""} /> : null}
          {draft.mode === "rework" ? <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting target bin."} label="Target bin" onChange={(value) => setDraft({ ...draft, targetBinId: numberValue(value) })} options={binOptions} value={draft.targetBinId ? String(draft.targetBinId) : ""} /> : null}
          <ErpDecimalField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before changing quantity."} label="Quantity" min={0.001} onChange={(value) => setDraft({ ...draft, quantity: value ?? 0 })} required value={draft.quantity} />
          <ErpDecimalField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before changing catch weight."} label="Catch weight" min={0} onChange={(value) => setDraft({ ...draft, catchWeightQty: value })} value={draft.catchWeightQty} />
          <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before changing inventory state."} label="Inventory state" onChange={(value) => setDraft({ ...draft, inventoryState: value })} options={outputInventoryStateOptions} value={draft.inventoryState} />
          <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting reason."} label="Reason" onChange={(value) => setDraft({ ...draft, reasonCode: value })} options={reasonOptions} required value={draft.reasonCode} />
          <label className="form-span-2"><span>{draft.mode === "rework" ? "Instructions" : "Remarks"}</span><input aria-label="Production output remarks" disabled={!isLive} onChange={(event) => draft.mode === "rework" ? setDraft({ ...draft, instructions: event.target.value || null }) : setDraft({ ...draft, remarks: event.target.value || null })} value={draft.mode === "rework" ? draft.instructions ?? "" : draft.remarks ?? ""} /></label>
            </>
          )}
        </FormShell>
      ) : null}
    </ErpModalWorkspace>
  );
}

const receiptColumns: DataGridColumn<ProductionReceiptItem>[] = [
  {
    key: "receipt",
    header: "Receipt",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{record.receiptNo}</strong>
        <div className="muted">{record.postingDate}</div>
      </div>
    )
  },
  { key: "document", header: "WO / JC", width: "18%", render: (record) => `${record.workOrderLabel} / ${record.jobCardLabel}` },
  { key: "output", header: "Output", render: (record) => record.outputSummary },
  { key: "trace", header: "Lot / serial", width: "18%", render: (record) => record.lotSerialSignal },
  { key: "cw", header: "Catch weight", width: "14%", render: (record) => record.catchWeightSignal },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function ProductionReceiptPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OutputPostingDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = usePageFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.productionReceipts(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listProductionReceipts(session, filter),
    { staleTime: 60_000 }
  );
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const uoms = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => apiClient.measurements.uoms({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const warehouses = useApiQuery(queryKeys.organization.warehouses(companyId, branchId, "", "Active"), () => apiClient.organization.warehouses({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const bins = useApiQuery(queryKeys.organization.bins(companyId, branchId, "", "Active"), () => apiClient.organization.bins({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const uomOptions = entityOptions(uoms.data?.items, (uom) => uom.id, (uom) => `${uom.uomCode} / ${uom.uomName}`);
  const warehouseOptions = entityOptions(warehouses.data?.items, (warehouse) => warehouse.id, (warehouse) => `${warehouse.warehouseCode} / ${warehouse.warehouseName}`);
  const binOptions = entityOptions(bins.data?.items, (bin) => bin.id, (bin) => `${bin.binCode} / ${bin.binName}`);
  const validationErrors = outputValidationErrors(draft);
  const linkedSource = getOutputSource(searchParams);
  const createReceipt = useApiMutation((request: ProductionReceiptCreateRequest) => apiClient.production.createProductionReceipt(request), {
    onSuccess: async (record) => {
      setMessage(`Posted production receipt ${record.receiptNo}.`);
      setDraft(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const postReason = !live
    ? "Production receipt posting requires a live production session."
    : validationErrors.length > 0
      ? "Resolve production receipt validation issues before posting."
      : createReceipt.isPending
        ? "Production receipt posting is in progress."
        : undefined;

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !live, label: "Prepare receipt draft", onClick: live ? () => { setMessage(null); setDraft(buildOutputDraft("receipt", linkedSource.sourceType, linkedSource.sourceId)); } : undefined, reason: live ? undefined : "Production receipt drafting requires a live production session." }]} secondary={[{ disabled: true, label: "Print receipt", reason: "Receipt printing is pending document workflow enablement." }]} testId="production-receipt-action-bar" /></>}
        description="Receive WIP/FG output with lot, serial, catch-weight, warehouse, and posting context."
        filters={<FilterBar><input aria-label="Search production receipts" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search receipt, WO, job card, item" value={search} /><select aria-label="Production receipt status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Posted">Posted</option><option value="Draft">Draft</option></select></FilterBar>}
        title="Production Receipt"
      >
      <KpiStrip items={[{ label: "Receipts", value: String(records.length) }, { label: "Posted", value: String(records.filter((record) => record.status.toLowerCase().includes("post")).length) }, { label: "Draft", value: String(records.filter((record) => record.status.toLowerCase().includes("draft")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {message ? <Badge tone={message.startsWith("Posted") ? "success" : "danger"}>{message}</Badge> : null}
        <Card title="Output receipt register" description="Existing receipts are review-only; new receipts post through the controlled production output workflow.">
          <DataGrid ariaLabel="Production receipt list" columns={receiptColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.receiptNo} production receipt`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Posted production receipt detail is review-only; use Prepare receipt draft for new output postings."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save receipt draft", reason: "Posted receipt records cannot be changed; create a new receipt draft for additional output." }]} secondary={[{ disabled: true, label: "Post receipt", reason: "This receipt is already posted or loaded as a read-only output movement." }, { label: "Open job card", onClick: () => navigate(`/production/job-cards?jobCard=${encodeURIComponent(selected?.jobCardLabel ?? "")}`) }, { label: "Open traceability", onClick: () => navigate(`/inventory/traceability?receipt=${encodeURIComponent(selected?.receiptNo ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.receiptNo ?? "Production receipt"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="Receipt controls"><ErpLookupField disabled disabledReason="Work order and job card selection is controlled by production release." label="WO / JC" onChange={() => undefined} options={[{ label: `${selected.workOrderLabel} / ${selected.jobCardLabel}`, value: `${selected.workOrderLabel} / ${selected.jobCardLabel}` }]} value={`${selected.workOrderLabel} / ${selected.jobCardLabel}`} /><label><span>Output</span><input disabled defaultValue={selected.outputSummary} /></label><label><span>Posted</span><input disabled defaultValue={selected.postedLabel} /></label></FormShell> : null}
      </ErpModalWorkspace>
      <OutputPostingModal binOptions={binOptions} draft={draft} isLive={live} isPosting={createReceipt.isPending} itemOptions={itemOptions} onPost={() => draft && createReceipt.mutate(buildReceiptRequest(draft, companyId, branchId))} postLabel="Post receipt" postReason={postReason} setDraft={setDraft} uomOptions={uomOptions} validationErrors={validationErrors} warehouseOptions={warehouseOptions} />
    </>
  );
}

const scrapColumns: DataGridColumn<ScrapByProductItem>[] = [
  { key: "scrap", header: "Entry", width: "18%", render: (record) => <strong>{record.scrapNo}</strong> },
  { key: "document", header: "WO / JC", width: "18%", render: (record) => `${record.workOrderLabel} / ${record.jobCardLabel}` },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "reason", header: "Reason", width: "16%", render: (record) => record.reasonCode },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function ScrapByProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OutputPostingDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = usePageFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.scrapEntries(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listScrapByProducts(session, filter),
    { staleTime: 60_000 }
  );
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const warehouses = useApiQuery(queryKeys.organization.warehouses(companyId, branchId, "", "Active"), () => apiClient.organization.warehouses({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const bins = useApiQuery(queryKeys.organization.bins(companyId, branchId, "", "Active"), () => apiClient.organization.bins({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const warehouseOptions = entityOptions(warehouses.data?.items, (warehouse) => warehouse.id, (warehouse) => `${warehouse.warehouseCode} / ${warehouse.warehouseName}`);
  const binOptions = entityOptions(bins.data?.items, (bin) => bin.id, (bin) => `${bin.binCode} / ${bin.binName}`);
  const validationErrors = outputValidationErrors(draft);
  const linkedSource = getOutputSource(searchParams);
  const createScrap = useApiMutation((request: ScrapEntryCreateRequest) => apiClient.production.createScrapEntry(request), {
    onSuccess: async (record) => {
      setMessage(`Posted scrap entry ${record.scrapNo}.`);
      setDraft(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const postReason = !live
    ? "Scrap posting requires a live production session."
    : validationErrors.length > 0
      ? "Resolve scrap validation issues before posting."
      : createScrap.isPending
        ? "Scrap posting is in progress."
        : undefined;

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !live, label: "Prepare scrap draft", onClick: live ? () => { setMessage(null); setDraft(buildOutputDraft("scrap", linkedSource.sourceType, linkedSource.sourceId)); } : undefined, reason: live ? undefined : "Scrap draft creation requires a live production session." }]} secondary={[{ disabled: true, label: "Export scrap", reason: "Scrap export is pending the approved reporting workflow." }]} testId="scrap-action-bar" /></>} description="Capture scrap, by-product, reason, and valuation status for production review." filters={<FilterBar><input aria-label="Search scrap by-products" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search scrap, by-product, reason, item" value={search} /><select aria-label="Scrap status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Posted">Posted</option><option value="Draft">Draft</option><option value="ByProduct">By-product</option></select></FilterBar>} title="Scrap / By-product Entry">
      <KpiStrip items={[{ label: "Entries", value: String(records.length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "By-product", value: String(records.filter((record) => record.inventoryState.toLowerCase().includes("byproduct")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {message ? <Badge tone={message.startsWith("Posted") ? "success" : "danger"}>{message}</Badge> : null}
        <Card title="Scrap and by-product register" description="Existing scrap entries are review-only; new scrap drafts post through the controlled production output workflow.">
          <DataGrid ariaLabel="Scrap by-product list" columns={scrapColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.scrapNo} scrap by-product`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Posted scrap detail is review-only; use Prepare scrap draft for new scrap postings."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save scrap draft", reason: "Posted scrap records cannot be changed; create a new scrap draft for additional movement." }]} secondary={[{ disabled: true, label: "Post scrap", reason: "This scrap entry is already posted or loaded as a read-only output movement." }, { label: "Open job card", onClick: () => navigate(`/production/job-cards?jobCard=${encodeURIComponent(selected?.jobCardLabel ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.scrapNo ?? "Scrap entry"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="Scrap / by-product controls"><ErpLookupField disabled disabledReason="Reason code is controlled by reason-code master." label="Reason" onChange={() => undefined} options={[{ label: selected.reasonCode, value: selected.reasonCode }]} value={selected.reasonCode} /><ErpNumberField disabled disabledReason="Scrap and by-product quantities are controlled by production posting." label="Quantity" onChange={() => undefined} value={selected.quantity} /><ErpLookupField disabled disabledReason="Inventory state is controlled by production posting rules." label="Inventory state" onChange={() => undefined} options={[{ label: selected.inventoryState, value: selected.inventoryState }]} value={selected.inventoryState} /><ErpLookupField disabled disabledReason="Valuation status is controlled by production posting and costing rules." label="Valuation" onChange={() => undefined} options={[{ label: selected.valuationSignal, value: selected.valuationSignal }]} value={selected.valuationSignal} /></FormShell> : null}
      </ErpModalWorkspace>
      <OutputPostingModal binOptions={binOptions} draft={draft} isLive={live} isPosting={createScrap.isPending} itemOptions={itemOptions} onPost={() => draft && createScrap.mutate(buildScrapRequest(draft, companyId, branchId))} postLabel="Post scrap" postReason={postReason} setDraft={setDraft} uomOptions={[]} validationErrors={validationErrors} warehouseOptions={warehouseOptions} />
    </>
  );
}

const reworkColumns: DataGridColumn<ReworkOrderItem>[] = [
  { key: "rework", header: "Rework", width: "18%", render: (record) => <strong>{record.reworkNo}</strong> },
  { key: "source", header: "Source", width: "18%", render: (record) => record.sourceDocument },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "route", header: "Route", width: "24%", render: (record) => record.routeLabel },
  { key: "qty", header: "Qty", width: "8%", render: (record) => record.quantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function ReworkOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OutputPostingDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = usePageFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.reworkOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listReworkOrders(session, filter),
    { staleTime: 60_000 }
  );
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const warehouses = useApiQuery(queryKeys.organization.warehouses(companyId, branchId, "", "Active"), () => apiClient.organization.warehouses({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const bins = useApiQuery(queryKeys.organization.bins(companyId, branchId, "", "Active"), () => apiClient.organization.bins({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const warehouseOptions = entityOptions(warehouses.data?.items, (warehouse) => warehouse.id, (warehouse) => `${warehouse.warehouseCode} / ${warehouse.warehouseName}`);
  const binOptions = entityOptions(bins.data?.items, (bin) => bin.id, (bin) => `${bin.binCode} / ${bin.binName}`);
  const validationErrors = outputValidationErrors(draft);
  const linkedSource = getOutputSource(searchParams);
  const createRework = useApiMutation((request: ReworkOrderCreateRequest) => apiClient.production.createReworkOrder(request), {
    onSuccess: async (record) => {
      setMessage(`Created rework order ${record.reworkNo}.`);
      setDraft(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const releaseRework = useApiMutation((id: number) => apiClient.production.releaseReworkOrder(id, { instructions: selected?.instructions ?? null }), {
    onSuccess: async () => {
      setMessage("Released rework order.");
      setSelectedId(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const createReason = !live
    ? "Rework order creation requires a live production session."
    : validationErrors.length > 0
      ? "Resolve rework validation issues before saving."
      : createRework.isPending
        ? "Rework order creation is in progress."
        : undefined;
  const releaseReason = !live
    ? "Rework release requires a live production session."
    : !selected
      ? "Open a saved rework order before release."
      : selected.status.toLowerCase().includes("release")
        ? "This rework order is already released."
        : releaseRework.isPending
          ? "Rework release is in progress."
          : undefined;

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !live, label: "New rework order", onClick: live ? () => { setMessage(null); setDraft(buildOutputDraft("rework", linkedSource.sourceType, linkedSource.sourceId)); } : undefined, reason: live ? undefined : "Rework order creation requires a live production session." }]} secondary={[{ disabled: true, label: "Export rework", reason: "Rework export is pending the approved reporting workflow." }]} testId="rework-action-bar" /></>} description="Review rework loops linked to NCR, job card, and inventory hold context." filters={<FilterBar><input aria-label="Search rework orders" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search rework, NCR, WO, item" value={search} /><select aria-label="Rework status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Released">Released</option><option value="Open">Open</option><option value="Closed">Closed</option></select></FilterBar>} title="Rework Order">
      <KpiStrip items={[{ label: "Rework orders", value: String(records.length) }, { label: "Released", value: String(records.filter((record) => record.status.toLowerCase().includes("release")).length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {message ? <Badge tone={message.startsWith("Created") || message.startsWith("Released") ? "success" : "danger"}>{message}</Badge> : null}
        <Card title="Rework loop register" description="Rework links remain tied to the NCR, job card, and hold context for review.">
          <DataGrid ariaLabel="Rework order list" columns={reworkColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.reworkNo} rework order`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Review saved rework details, release open rework orders, or open the linked NCR and job card."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save rework order", reason: "Open a new rework order workspace to create a new controlled rework record." }]} secondary={[{ disabled: Boolean(releaseReason), label: releaseRework.isPending ? "Releasing rework" : "Release rework", onClick: selected && !releaseReason ? () => releaseRework.mutate(selected.reworkId) : undefined, reason: releaseReason }, { label: "Open NCR", onClick: () => navigate(`/quality/ncr?source=${encodeURIComponent(selected?.sourceDocument ?? "")}`) }, { label: "Open job card", onClick: () => navigate(`/production/job-cards?jobCard=${encodeURIComponent(selected?.jobCardLabel ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.reworkNo ?? "Rework order"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="Rework controls" description={selected.instructions}><ErpLookupField disabled disabledReason="Source document is controlled by NCR and production release context." label="Source" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} /><ErpLookupField disabled disabledReason="Route selection is controlled by routing master." label="Route" onChange={() => undefined} options={[{ label: selected.routeLabel, value: selected.routeLabel }]} value={selected.routeLabel} /><ErpNumberField disabled disabledReason="Rework quantity is controlled by rework workflow." label="Quantity" onChange={() => undefined} value={selected.quantity} /><label><span>Released / closed</span><input disabled defaultValue={`${selected.releasedLabel} / ${selected.closedLabel}`} /></label></FormShell> : null}
      </ErpModalWorkspace>
      <OutputPostingModal binOptions={binOptions} draft={draft} isLive={live} isPosting={createRework.isPending} itemOptions={itemOptions} onPost={() => draft && createRework.mutate(buildReworkRequest(draft, companyId, branchId))} postLabel="Save rework order" postReason={createReason} setDraft={setDraft} uomOptions={[]} validationErrors={validationErrors} warehouseOptions={warehouseOptions} />
    </>
  );
}

const machineColumns: DataGridColumn<MachineStatusItem>[] = [
  { key: "machine", header: "Machine", render: (record) => <strong>{record.machineLabel}</strong> },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.currentStatus} /> },
  { key: "job", header: "Active JC / WO", width: "22%", render: (record) => `${record.activeJobCardLabel} / ${record.activeWorkOrderLabel}` },
  { key: "item", header: "Item", width: "14%", render: (record) => record.itemLabel },
  { key: "availability", header: "Avail.", width: "10%", render: (record) => `${record.availabilityPercent}%` },
  { key: "risk", header: "Risk", width: "16%", render: (record) => record.riskStatus }
];

export function MachineStatusPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => ({ page: 1, pageSize: 25, search: deferredSearch || undefined, status: status === "all" ? undefined : status, dateFrom: "2026-03-05", dateTo: "2026-03-11" }), [deferredSearch, status]);
  const query = useApiQuery(
    queryKeys.production.machineBoard("2026-03-05", "2026-03-11", deferredSearch, status),
    () => listMachineStatus(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = records[0]?.source ?? "Seeded";

  return (
    <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar secondary={[{ disabled: true, label: "Export OEE-lite", reason: "Machine-status export is pending the approved reporting workflow." }]} testId="machine-status-action-bar" /></>} description="Run, idle, down trends and availability snapshot derived from machine-board status." filters={<FilterBar><input aria-label="Search machine status" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search machine, job card, risk" value={search} /><select aria-label="Machine status filter" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Running">Running</option><option value="Idle">Idle</option><option value="Down">Down</option></select></FilterBar>} title="Machine Status / OEE-lite">
      <KpiStrip items={[{ label: "Machines", value: String(records.length) }, { label: "Running", value: String(records.filter((record) => record.currentStatus.toLowerCase().includes("running")).length) }, { label: "Down", value: String(records.filter((record) => record.currentStatus.toLowerCase().includes("down")).length) }, { label: "Avg avail.", value: `${Math.round(records.reduce((total, record) => total + record.availabilityPercent, 0) / Math.max(records.length, 1))}%` }]} />
      <Card title="Availability snapshot" description="OEE-lite avoids inventing full OEE costing or performance models.">
        <DataGrid ariaLabel="Machine status list" columns={machineColumns} getRowId={(record) => record.id} isLoading={query.isLoading} records={records} rowLabel={(record) => `${record.machineLabel} machine status`} />
      </Card>
    </ListPageShell>
  );
}
