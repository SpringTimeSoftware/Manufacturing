import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../api/http";
import { bomRecords } from "../api/mockData";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import type { BomDto, CycleCountUpsertRequest, WorkOrderUpsertRequest } from "../api/contracts";
import { useAuth } from "../auth/AuthContext";
import {
  getJobCardDetailSetup,
  getMachineBoardSetup,
  getWorkOrderDetailSetup,
  listCycleCountSetup,
  listDowntimeSetup,
  listJobCardSetup,
  listShiftProductionSetup,
  listWorkOrderSetup,
  type CycleCountLineItem,
  type CycleCountSetupItem,
  type DowntimeRegisterItem,
  type JobCardSetupItem,
  type ShiftProductionItem,
  type WorkOrderMaterialLineItem,
  type WorkOrderOperationLineItem,
  type WorkOrderSetupItem
} from "../operations/operationsAdapters";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ListPageShell } from "../ui/ListPageShell";
import { FilterBar } from "../ui/FilterBar";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ErpActionBar, ErpDecimalField, ErpLookupField, ErpModalWorkspace, ErpNumberField, ErpValidationSummary } from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { Timeline } from "../ui/Timeline";
import { KpiStrip, LaneBoard, OccupancyCalendar, type Lane, type LaneSlot } from "../ui/boards";
import type { BomRecord } from "../api/mockData";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Live records" : "Review mode"}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("complete") || normalized.includes("posted") || normalized.includes("submitted") || normalized.includes("matched")
    ? "success"
    : normalized.includes("hold") || normalized.includes("variance") || normalized.includes("paused") || normalized.includes("major")
      ? "warn"
      : normalized.includes("cancel") || normalized.includes("down")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function useProductionFilter(search: string, status: string) {
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

const bomColumns: DataGridColumn<BomRecord>[] = [
  {
    key: "parentItem",
    header: "Parent Item",
    width: "36%",
    render: (record) => (
      <div>
        <strong>{record.parentItem}</strong>
        <div className="muted">{record.itemCode}</div>
      </div>
    )
  },
  { key: "revision", header: "Revision", render: (record) => record.revision },
  { key: "effectiveFrom", header: "Effective", render: (record) => record.effectiveFrom },
  {
    key: "status",
    header: "Status",
    render: (record) => (
      <Badge tone={record.status === "Approved" ? "success" : record.status === "Draft" ? "warn" : "danger"}>
        {record.status}
      </Badge>
    )
  }
];

export function BomLibraryPage() {
  const [selected, setSelected] = useState<BomRecord | null>(bomRecords[0]);

  return (
    <>
      <ListPageShell
        actions={
          <ErpActionBar
            primary={[{ disabled: true, label: "New BOM", reason: "BOM creation requires engineering change workflow enablement." }]}
            secondary={[
              { disabled: true, label: "Import CSV", reason: "BOM import requires the approved import workflow." },
              { disabled: true, label: "Print", reason: "BOM printing is pending document workflow enablement." }
            ]}
            testId="bom-library-action-bar"
          />
        }
        description="Approved revisions, multi-level structures, and centered detail aligned to the engineering screen."
        filters={
          <FilterBar>
            <input placeholder="Search item / code / revision" />
            <select defaultValue="all">
              <option value="all">Status: Any</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
              <option value="obsolete">Obsolete</option>
            </select>
            <select defaultValue="all">
              <option value="all">Item type: Any</option>
              <option value="fg">FG</option>
              <option value="wip">WIP</option>
            </select>
          </FilterBar>
        }
        title="BOM Library"
      >
        <KpiStrip
          items={[
            { label: "Active BOMs", value: "24" },
            { label: "Draft revisions", value: "3" },
            { label: "Obsolete revisions", value: "2" }
          ]}
        />
        <Card title="BOM library" description="Search, filter, and open revision-aware detail without leaving planner context.">
          <DataGrid columns={bomColumns} getRowId={(record) => record.id} onRowSelect={setSelected} records={bomRecords} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Revision tree, component guidance, and controlled editing for production execution."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Approve", reason: "BOM approval requires engineering change workflow enablement." }]} secondary={[{ disabled: true, label: "Clone", reason: "BOM cloning requires engineering change workflow enablement." }]} utility={[{ label: "Close", onClick: () => setSelected(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.parentItem} (${selected.revision})` : "Selected BOM"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Revision", value: selected.revision },
                { label: "Status", value: selected.status },
                { label: "Default Issue", value: selected.issueMethod }
              ]}
            />
            <Card title="Structure preview" description="Multi-level engineering view kept inside the governed workspace pattern.">
              {selected.components.map((component) => (
                <div className="notification-item" key={component.code}>
                  <strong>{`${component.code} / ${component.name}`}</strong>
                  <p>{`Qty per ${component.qtyPer}`}</p>
                  <Badge tone={component.recommendation === "MAKE" ? "info" : "warn"}>{component.recommendation}</Badge>
                </div>
              ))}
            </Card>
            <FormShell
              description="Validation summary and unsaved-change handling are shared across administrative pages."
              initialFingerprint={`${selected.id}-${selected.revision}`}
              title="Metadata editor"
              validationErrors={selected.status === "Draft" ? ["Approval workflow is still incomplete."] : []}
            >
              <label>
                <span>Parent item</span>
                <input disabled defaultValue={selected.parentItem} />
              </label>
              <label>
                <span>Default issue method</span>
                <select defaultValue={selected.issueMethod}>
                  <option>Backflush</option>
                  <option>Manual</option>
                  <option>Hybrid</option>
                </select>
              </label>
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const cycleCountColumns: DataGridColumn<CycleCountSetupItem>[] = [
  {
    key: "count",
    header: "Count sheet",
    width: "22%",
    render: (record) => (
      <div>
        <strong>{record.countNo}</strong>
        <div className="muted">{record.warehouseLabel}</div>
      </div>
    )
  },
  { key: "date", header: "Date", width: "12%", render: (record) => record.countDate },
  { key: "type", header: "Type", width: "12%", render: (record) => record.countType },
  { key: "lines", header: "Lines", width: "10%", render: (record) => record.lineCount },
  { key: "variance", header: "Variance", width: "12%", render: (record) => record.absoluteVariance },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.status} /> }
];

const cycleLineColumns: DataGridColumn<CycleCountLineItem>[] = [
  { key: "line", header: "Line", width: "8%", render: (record) => record.lineNo },
  { key: "item", header: "Item", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "tracking", header: "Lot / serial", width: "16%", render: (record) => record.trackingLabel },
  { key: "bin", header: "Bin", width: "12%", render: (record) => record.binLabel },
  { key: "system", header: "System", width: "10%", render: (record) => record.systemQuantity },
  { key: "counted", header: "Counted", width: "10%", render: (record) => record.countedQuantity },
  { key: "variance", header: "Variance", width: "10%", render: (record) => <Badge tone={record.varianceQuantity === 0 ? "success" : "warn"}>{record.varianceQuantity}</Badge> }
];

interface CycleCountDraftLine extends CycleCountLineItem {
  countedQuantity: number;
  status: string;
  remarks: string;
}

interface CycleCountDraft {
  cycleCountId: number;
  companyId: number;
  branchId: number;
  warehouseId: number;
  countNo: string;
  warehouseLabel: string;
  countDate: string;
  countType: string;
  status: string;
  remarks: string;
  postedLabel: string;
  source: MasterDataSource;
  lines: CycleCountDraftLine[];
}

function dateControlValue(value: string | null | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function buildCycleDraft(record: CycleCountSetupItem): CycleCountDraft {
  return {
    cycleCountId: record.cycleCountId,
    companyId: record.companyId,
    branchId: record.branchId,
    warehouseId: record.warehouseId,
    countNo: record.countNo,
    warehouseLabel: record.warehouseLabel,
    countDate: dateControlValue(record.countDate),
    countType: record.countType,
    status: record.status,
    remarks: record.remarks,
    postedLabel: record.postedLabel,
    source: record.source,
    lines: record.lines.map((line) => ({ ...line }))
  };
}

function buildCycleRequest(draft: CycleCountDraft): CycleCountUpsertRequest {
  return {
    companyId: draft.companyId,
    branchId: draft.branchId,
    warehouseId: draft.warehouseId,
    countNo: draft.countNo,
    countDate: draft.countDate,
    countType: draft.countType,
    status: draft.status,
    remarks: draft.remarks || null,
    lines: draft.lines.map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId,
      itemVariantId: line.itemVariantId,
      binId: line.binId,
      lotId: line.lotId,
      serialId: line.serialId,
      countedQuantity: line.countedQuantity,
      status: line.status,
      remarks: line.remarks || null
    }))
  };
}

export function CycleCountPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CycleCountDraft | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionTone, setActionTone] = useState<"success" | "warn" | "danger" | "info">("info");
  const { deferredSearch, filter } = useProductionFilter(search, status);
  const query = useApiQuery(
    queryKeys.inventory.cycleCounts(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listCycleCountSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");
  const isLive = hasLiveSession(session);
  const validation = draft
    ? [
        draft.countNo.trim() ? "" : "Count number is required.",
        draft.countDate ? "" : "Count date is required.",
        draft.lines.length > 0 ? "" : "At least one count line is required.",
        draft.lines.some((line) => line.countedQuantity < 0) ? "Counted quantity cannot be negative." : ""
      ].filter(Boolean)
    : [];
  const saveReason = !draft
    ? "Open a count sheet before saving."
    : !isLive
      ? "Live inventory sign-in is required before saving count sheets."
      : validation[0];
  const postReason = !draft
    ? "Open a count sheet before posting."
    : !isLive
      ? "Live inventory sign-in is required before posting count sheets."
      : draft.status.toLowerCase().includes("posted")
        ? "Posted count sheets cannot be posted again."
        : undefined;
  const cycleMutation = useApiMutation(
    async (action: "save" | "post") => {
      if (!draft) {
        throw new Error("Open a count sheet before posting cycle-count actions.");
      }

      if (action === "post") {
        return apiClient.inventory.postCycleCount(draft.cycleCountId);
      }

      return apiClient.inventory.updateCycleCount(draft.cycleCountId, buildCycleRequest(draft));
    },
    {
      onSuccess: async (result, action) => {
        setActionTone("success");
        setActionMessage(action === "post" ? "Cycle count posted." : "Cycle count saved.");
        setDraft(buildCycleDraft({
          id: `cycle-count-${result.id}`,
          cycleCountId: result.id,
          companyId: result.companyId,
          branchId: result.branchId,
          warehouseId: result.warehouseId,
          countNo: result.countNo,
          warehouseLabel: `Warehouse ${result.warehouseId}`,
          countDate: result.countDate,
          countType: result.countType,
          status: result.status,
          remarks: result.remarks ?? "No remarks",
          postedLabel: result.postedOn ? result.postedOn.slice(0, 16).replace("T", " ") : "Not posted",
          lineCount: result.lines.length,
          varianceCount: result.lines.filter((line) => line.varianceQuantity !== 0).length,
          absoluteVariance: result.lines.reduce((total, line) => total + Math.abs(line.varianceQuantity), 0),
          source: "Live",
          lines: result.lines.map((line) => ({
            id: `cycle-count-line-${line.id}`,
            lineNo: line.lineNo,
            itemId: line.itemId,
            itemVariantId: line.itemVariantId,
            binId: line.binId,
            lotId: line.lotId,
            serialId: line.serialId,
            itemLabel: `Item ${line.itemId}`,
            trackingLabel: line.lotId ? `Lot ${line.lotId}` : line.serialId ? `Serial ${line.serialId}` : "Non-tracked",
            binLabel: line.binId ? `Bin ${line.binId}` : "No bin",
            systemQuantity: line.systemQuantity,
            countedQuantity: line.countedQuantity,
            varianceQuantity: line.varianceQuantity,
            status: line.status,
            remarks: line.remarks ?? "No remarks"
          }))
        }));
        await query.refetch();
      },
      onError: (error) => {
        setActionTone("danger");
        setActionMessage(error.message);
      }
    }
  );

  useEffect(() => {
    setDraft(selected ? buildCycleDraft(selected) : null);
    setActionMessage(null);
  }, [selected?.id]);

  const updateDraft = (patch: Partial<CycleCountDraft>) => {
    setDraft((current) => current ? { ...current, ...patch } : current);
  };

  const updateLine = (index: number, patch: Partial<CycleCountDraftLine>) => {
    setDraft((current) => current ? { ...current, lines: current.lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line) } : current);
  };

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New count sheet", reason: "New count generation requires approved warehouse count rules; existing live count sheets can be saved and posted." }]} secondary={[{ disabled: true, label: "Export variances", reason: "Variance export is pending the approved reporting workflow." }]} testId="cycle-count-action-bar" /></>}
        description="Count sheets, warehouse/bin variances, approvals, and posted audit status for stores users."
        filters={<FilterBar><input aria-label="Search cycle counts" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search count, warehouse, item" value={search} /><select aria-label="Cycle count status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Draft">Draft</option><option value="Posted">Posted</option><option value="Variance">Variance</option></select></FilterBar>}
        title="Cycle Count"
      >
      <KpiStrip items={[{ label: "Count sheets", value: String(records.length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Variances", value: String(records.reduce((total, record) => total + record.varianceCount, 0)) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Cycle count register" description="Web reviews count sheets and variances; posting remains owned by the completed cycle-count API.">
          <DataGrid ariaLabel="Cycle count list" columns={cycleCountColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.countNo} cycle count`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Review and post count-sheet quantities through the live cycle-count workflow."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || cycleMutation.isPending, label: cycleMutation.isPending ? "Saving count sheet" : "Save count sheet", onClick: saveReason ? undefined : () => cycleMutation.mutate("save"), reason: saveReason }]} secondary={[{ disabled: Boolean(postReason) || cycleMutation.isPending, label: cycleMutation.isPending ? "Posting count" : "Post count", onClick: postReason ? undefined : () => cycleMutation.mutate("post"), reason: postReason }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setSelectedId(null)}
        statusMeta={actionMessage ? <Badge tone={actionTone}>{actionMessage}</Badge> : null}
        title={draft?.countNo ?? "Cycle count"}
      >
        {draft ? (
          <>
            <KpiStrip items={[{ label: "Warehouse", value: draft.warehouseLabel }, { label: "Posted", value: draft.postedLabel }, { label: "Variance", value: String(draft.lines.reduce((total, line) => total + Math.abs(line.varianceQuantity), 0)) }]} />
            <FormShell initialFingerprint={`${draft.cycleCountId}-${draft.status}`} title="Count sheet controls" validationErrors={validation}>
              <label><span>Count number</span><input disabled={!isLive} onChange={(event) => updateDraft({ countNo: event.target.value })} value={draft.countNo} /></label>
              <ErpLookupField disabled disabledReason="Warehouse is controlled by the count-sheet generation rules." label="Warehouse" onChange={() => undefined} options={[{ label: draft.warehouseLabel, value: String(draft.warehouseId) }]} value={String(draft.warehouseId)} />
              <label><span>Count date</span><input disabled={!isLive} onChange={(event) => updateDraft({ countDate: event.target.value })} type="date" value={dateControlValue(draft.countDate)} /></label>
              <ErpLookupField disabled={!isLive} disabledReason={!isLive ? "Live inventory sign-in is required before changing count type." : undefined} label="Count type" onChange={(value) => updateDraft({ countType: value })} options={[{ label: "Cycle", value: "Cycle" }, { label: "Full", value: "Full" }, { label: "Spot", value: "Spot" }]} value={draft.countType} />
              <ErpLookupField disabled={!isLive} disabledReason={!isLive ? "Live inventory sign-in is required before changing count status." : undefined} label="Status" onChange={(value) => updateDraft({ status: value })} options={[{ label: "Draft", value: "Draft" }, { label: "Variance", value: "Variance" }, { label: "Matched", value: "Matched" }, { label: "Posted", value: "Posted" }]} value={draft.status} />
              <label className="form-span-2"><span>Remarks</span><input disabled={!isLive} onChange={(event) => updateDraft({ remarks: event.target.value })} value={draft.remarks} /></label>
            </FormShell>
            <Card title="Count lines" description={draft.remarks}>
              <DataGrid ariaLabel="Cycle count lines" columns={cycleLineColumns} getRowId={(record) => record.id} records={draft.lines} rowLabel={(record) => `${record.itemLabel} count line`} />
            </Card>
            {draft.lines.map((line, index) => (
              <FormShell initialFingerprint={`${line.id}-${line.countedQuantity}`} key={line.id} title={`Count line ${line.lineNo}`}>
                <ErpLookupField disabled disabledReason="Item is controlled by the count sheet." label="Item" onChange={() => undefined} options={[{ label: line.itemLabel, value: String(line.itemId) }]} value={String(line.itemId)} />
                <ErpLookupField disabled disabledReason="Bin is controlled by warehouse/bin master." label="Bin" onChange={() => undefined} options={[{ label: line.binLabel, value: String(line.binId ?? "") }]} value={String(line.binId ?? "")} />
                <ErpLookupField disabled disabledReason="Lot or serial is controlled by inventory traceability." label="Lot / serial" onChange={() => undefined} options={[{ label: line.trackingLabel, value: line.trackingLabel }]} value={line.trackingLabel} />
                <ErpDecimalField disabled disabledReason="System quantity is calculated from stock balances." label="System quantity" onChange={() => undefined} value={line.systemQuantity} />
                <ErpDecimalField disabled={!isLive} disabledReason={!isLive ? "Live inventory sign-in is required before updating counted quantity." : undefined} label="Counted quantity" min={0} onChange={(value) => updateLine(index, { countedQuantity: value ?? 0 })} value={line.countedQuantity} />
                <ErpLookupField disabled={!isLive} disabledReason={!isLive ? "Live inventory sign-in is required before changing line status." : undefined} label="Line status" onChange={(value) => updateLine(index, { status: value })} options={[{ label: "Matched", value: "Matched" }, { label: "Variance", value: "Variance" }, { label: "Review", value: "Review" }]} value={line.status} />
              </FormShell>
            ))}
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const workOrderColumns: DataGridColumn<WorkOrderSetupItem>[] = [
  {
    key: "wo",
    header: "WO",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{record.workOrderNo}</strong>
        <div className="muted">{record.salesOrderLabel}</div>
      </div>
    )
  },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "progress", header: "Progress", width: "12%", render: (record) => record.progressLabel },
  { key: "window", header: "Plan", width: "18%", render: (record) => record.planWindow },
  { key: "ready", header: "Readiness", width: "16%", render: (record) => record.readinessSignal },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const materialColumns: DataGridColumn<WorkOrderMaterialLineItem>[] = [
  { key: "item", header: "Component", render: (record) => <strong>{record.componentLabel}</strong> },
  { key: "required", header: "Required", width: "12%", render: (record) => record.requiredQuantity },
  { key: "reserved", header: "Reserved", width: "12%", render: (record) => record.reservedQuantity },
  { key: "available", header: "Available", width: "12%", render: (record) => record.availableQuantity },
  { key: "shortage", header: "Shortage", width: "12%", render: (record) => <Badge tone={record.shortageQuantity > 0 ? "warn" : "success"}>{record.shortageQuantity}</Badge> }
];

const operationColumns: DataGridColumn<WorkOrderOperationLineItem>[] = [
  { key: "seq", header: "Seq", width: "8%", render: (record) => record.sequenceNo },
  { key: "operation", header: "Operation", render: (record) => <strong>{record.operationLabel}</strong> },
  { key: "workCenter", header: "Work center", width: "16%", render: (record) => record.workCenterLabel },
  { key: "qty", header: "Qty", width: "12%", render: (record) => `${record.completedQuantity} / ${record.plannedQuantity}` },
  { key: "capacity", header: "Capacity", width: "18%", render: (record) => record.capacitySignal },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

type WorkOrderLifecycleAction = "release" | "re-release" | "generate-job-cards" | "cancel" | "close";

interface WorkOrderDraft {
  workOrderNo: string;
  salesOrderLineId: number | null;
  itemId: number;
  bomRevisionId: number;
  routingId: number | null;
  plannedQuantity: number;
  productionUomId: number;
  plannedStartDate: string;
  plannedEndDate: string;
  status: string;
  remarks: string;
}

function optionFrom(value: string) {
  return { label: value, value };
}

function entityOption<T>(items: T[] | undefined, getValue: (item: T) => number, getLabel: (item: T) => string) {
  return (items ?? []).map((item) => ({ label: getLabel(item), value: String(getValue(item)) }));
}

function buildWorkOrderNo() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
  return `WO-${stamp}`;
}

function buildInitialWorkOrderDraft(): WorkOrderDraft {
  return {
    workOrderNo: buildWorkOrderNo(),
    salesOrderLineId: null,
    itemId: 0,
    bomRevisionId: 0,
    routingId: null,
    plannedQuantity: 1,
    productionUomId: 0,
    plannedStartDate: new Date().toISOString().slice(0, 10),
    plannedEndDate: "",
    status: "PendingRelease",
    remarks: ""
  };
}

function workOrderValidationErrors(draft: WorkOrderDraft | null, isLive: boolean) {
  if (!draft) {
    return ["Open a work-order draft before saving."];
  }

  return [
    !isLive ? "Live production sign-in is required before saving work orders." : "",
    draft.workOrderNo.trim() ? "" : "Work-order number is required.",
    draft.itemId > 0 ? "" : "Item is required.",
    draft.bomRevisionId > 0 ? "" : "Released or approved BOM revision is required.",
    draft.productionUomId > 0 ? "" : "Production UOM is required.",
    draft.plannedQuantity > 0 ? "" : "Planned quantity must be greater than zero.",
    draft.plannedStartDate && draft.plannedEndDate && draft.plannedEndDate < draft.plannedStartDate
      ? "Planned end date cannot be earlier than planned start date."
      : ""
  ].filter(Boolean);
}

function buildWorkOrderRequest(draft: WorkOrderDraft, companyId: number, branchId: number): WorkOrderUpsertRequest {
  return {
    companyId,
    branchId,
    workOrderNo: draft.workOrderNo.trim(),
    salesOrderLineId: draft.salesOrderLineId,
    itemId: draft.itemId,
    bomRevisionId: draft.bomRevisionId,
    routingId: draft.routingId,
    plannedQuantity: draft.plannedQuantity,
    productionUomId: draft.productionUomId,
    plannedStartDate: draft.plannedStartDate || null,
    plannedEndDate: draft.plannedEndDate || null,
    status: draft.status,
    remarks: draft.remarks || null
  };
}

function releasedBomRevisionOptions(boms: BomDto[] | undefined) {
  return (boms ?? []).flatMap((bom) =>
    bom.revisions
      .filter((revision) => ["Approved", "Released"].includes(revision.approvalStatus))
      .map((revision) => ({
        label: `${bom.bomCode} / ${revision.revisionCode} / ${revision.approvalStatus}`,
        value: String(revision.id),
        itemId: bom.itemId,
        routingId: revision.routingId
      }))
  );
}

function workOrderActionReason(
  session: Parameters<typeof hasLiveSession>[0],
  detail: WorkOrderSetupItem | null | undefined,
  action: WorkOrderLifecycleAction,
  isPending: boolean
) {
  if (!detail) {
    return "Open a work order before running lifecycle actions.";
  }

  if (!hasLiveSession(session)) {
    return "Live production sign-in is required before updating work orders.";
  }

  if (isPending) {
    return "A work-order action is already running.";
  }

  const status = detail.status.toLowerCase();

  if (action === "release") {
    if (status === "released") {
      return "Work order is already released.";
    }

    if (status === "closed" || status === "cancelled") {
      return "Closed or cancelled work orders cannot be released.";
    }

    if (detail.blockers.length > 0) {
      return `Resolve release blockers before release: ${detail.blockers[0]}`;
    }
  }

  if (action === "re-release" && !["released", "pendingrelease", "pending release", "onhold", "on hold"].includes(status)) {
    return "Only released, pending-release, or on-hold work orders can be re-released.";
  }

  if (action === "generate-job-cards" && !["released", "inprogress", "in process", "partiallycompleted", "partially completed"].includes(status)) {
    return "Release the work order before generating job cards.";
  }

  if (action === "close") {
    if (detail.operations.length === 0) {
      return "Work-order operations must exist before closing the work order.";
    }

    if (!detail.operations.every((operation) => ["Completed", "Cancelled"].includes(operation.status))) {
      return "All operations must be completed or cancelled before closing the work order.";
    }
  }

  if (action === "cancel" && ["closed", "cancelled", "completed"].includes(status)) {
    return "Completed, closed, or already cancelled work orders cannot be cancelled here.";
  }

  return undefined;
}

export function WorkOrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WorkOrderDraft | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionTone, setActionTone] = useState<"success" | "warn" | "danger" | "info">("info");
  const { deferredSearch, filter } = useProductionFilter(search, status);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const isLive = hasLiveSession(session);
  const query = useApiQuery(
    queryKeys.production.workOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listWorkOrderSetup(session, filter),
    { staleTime: 60_000 }
  );
  const itemLookup = useApiQuery(
    queryKeys.masters.items(companyId, "", "Active"),
    () => isLive && companyId > 0 ? apiClient.masters.itemLookup(companyId) : Promise.resolve([]),
    { enabled: isLive && companyId > 0, staleTime: 60_000 }
  );
  const bomQuery = useApiQuery(
    queryKeys.engineering.boms(companyId, "", "all"),
    () => isLive && companyId > 0 ? apiClient.engineering.boms({ companyId, pageSize: 100, status: "all" }).then((response) => response.items) : Promise.resolve([]),
    { enabled: isLive && companyId > 0, staleTime: 60_000 }
  );
  const routingQuery = useApiQuery(
    queryKeys.engineering.routings(companyId, "", "all"),
    () => isLive && companyId > 0 ? apiClient.engineering.routings({ companyId, pageSize: 100, status: "all" }).then((response) => response.items) : Promise.resolve([]),
    { enabled: isLive && companyId > 0, staleTime: 60_000 }
  );
  const uomQuery = useApiQuery(
    queryKeys.measurements.uoms(companyId, "", "Active"),
    () => isLive && companyId > 0 ? apiClient.measurements.uoms({ companyId, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]),
    { enabled: isLive && companyId > 0, staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const detailQuery = useApiQuery<WorkOrderSetupItem | null>(
    queryKeys.production.workOrderDetail(selected?.workOrderId),
    () => selected ? getWorkOrderDetailSetup(session, selected) : Promise.resolve(null),
    { enabled: Boolean(selected), staleTime: 60_000 }
  );
  const detail = detailQuery.data ?? selected;
  const source = records[0]?.source ?? "Seeded";
  const requestedWorkOrder = searchParams.get("workOrder");
  const itemOptions = entityOption(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const bomOptions = releasedBomRevisionOptions(bomQuery.data);
  const routingOptions = entityOption(routingQuery.data, (routing) => routing.id, (routing) => `${routing.routingCode} / ${routing.routingName}`);
  const uomOptions = entityOption(uomQuery.data, (uom) => uom.id, (uom) => `${uom.uomCode} / ${uom.uomName}`);
  const validation = workOrderValidationErrors(draft, isLive);
  const saveReason = validation[0];

  const saveMutation = useApiMutation(
    async (value: WorkOrderDraft) => apiClient.production.createWorkOrder(buildWorkOrderRequest(value, companyId, branchId)),
    {
      onSuccess: async (result) => {
        setActionTone("success");
        setActionMessage(`Work order ${result.workOrderNo} saved.`);
        setDraft(null);
        setSelectedId(`work-order-${result.id}`);
        await query.refetch();
      },
      onError: (error) => {
        setActionTone("danger");
        setActionMessage(error.message);
      }
    }
  );

  const lifecycleMutation = useApiMutation(
    async (action: WorkOrderLifecycleAction) => {
      if (!detail) {
        throw new Error("Open a work order before running lifecycle actions.");
      }

      if (action === "release") {
        return apiClient.production.releaseWorkOrder(detail.workOrderId, { remarks: "Released from production work-order workspace." });
      }

      if (action === "re-release") {
        return apiClient.production.reReleaseWorkOrder(detail.workOrderId, { remarks: "Re-released from production work-order workspace." });
      }

      if (action === "generate-job-cards") {
        const cards = await apiClient.production.createJobCardsForWorkOrder({ workOrderId: detail.workOrderId, regenerateIfExists: false });
        return { id: String(detail.workOrderId), status: "Job cards ready", referenceNo: cards.map((card) => card.jobCardNo).join(", "), warnings: cards.length === 0 ? ["No job cards were returned by the generation endpoint."] : [] };
      }

      if (action === "close") {
        return apiClient.production.closeWorkOrder(detail.workOrderId, { remarks: "Closed from production work-order workspace." });
      }

      return apiClient.production.cancelWorkOrder(detail.workOrderId, { remarks: "Cancelled from production work-order workspace." });
    },
    {
      onSuccess: async (result, action) => {
        setActionTone("success");
        setActionMessage(action === "generate-job-cards" ? `Job cards generated: ${result.referenceNo || "ready"}.` : `Work-order action posted. Status: ${result.status}.`);
        await Promise.all([query.refetch(), detailQuery.refetch()]);
      },
      onError: (error) => {
        setActionTone("danger");
        setActionMessage(error.message);
      }
    }
  );

  const openCreateDraft = () => {
    const firstBom = bomOptions[0];
    const firstUom = uomOptions[0];
    setActionMessage(null);
    setDraft({
      ...buildInitialWorkOrderDraft(),
      itemId: firstBom?.itemId ?? (itemOptions[0] ? Number(itemOptions[0].value) : 0),
      bomRevisionId: firstBom ? Number(firstBom.value) : 0,
      routingId: firstBom?.routingId ?? (routingOptions[0] ? Number(routingOptions[0].value) : null),
      productionUomId: firstUom ? Number(firstUom.value) : 0
    });
  };

  const updateDraft = (patch: Partial<WorkOrderDraft>) => {
    setDraft((current) => current ? { ...current, ...patch } : current);
  };

  const updateBomRevision = (value: string) => {
    const selectedBom = bomOptions.find((option) => option.value === value);
    updateDraft({
      bomRevisionId: value ? Number(value) : 0,
      itemId: selectedBom?.itemId ?? draft?.itemId ?? 0,
      routingId: selectedBom?.routingId ?? draft?.routingId ?? null
    });
  };

  useEffect(() => {
    if (!requestedWorkOrder || records.length === 0) {
      return;
    }

    const normalized = requestedWorkOrder.toLowerCase();
    const match = records.find(
      (record) =>
        record.workOrderNo.toLowerCase() === normalized ||
        record.workOrderNo.toLowerCase().includes(normalized)
    );

    if (match) {
      setSelectedId(match.id);
    }
  }, [records, requestedWorkOrder]);

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !isLive || companyId <= 0 || branchId <= 0 || bomOptions.length === 0 || uomOptions.length === 0, label: "New work order", onClick: openCreateDraft, reason: !isLive ? "Live production sign-in is required before creating work orders." : companyId <= 0 || branchId <= 0 ? "Select an operating company and branch before creating a work order." : bomOptions.length === 0 ? "Create and approve a BOM revision before creating a work order." : uomOptions.length === 0 ? "Create an active production UOM before creating a work order." : undefined }]} secondary={[{ disabled: true, label: "Export", reason: "Work-order export is pending the approved reporting workflow." }, { disabled: true, label: "Print pack", reason: "Work-order print pack is pending document workflow enablement." }]} testId="work-order-action-bar" /></>}
        description="List, release-readiness review, re-release cues, and work-order monitoring for planning and supervision."
        filters={<FilterBar><input aria-label="Search work orders" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search WO, item, sales order" value={search} /><select aria-label="Work order status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Planned">Planned</option><option value="Released">Released</option><option value="InProcess">In process</option><option value="Completed">Completed</option></select></FilterBar>}
        title="Work Orders"
      >
      <KpiStrip items={[{ label: "Work orders", value: String(records.length) }, { label: "Released", value: String(records.filter((record) => record.status.toLowerCase().includes("released")).length) }, { label: "Planned qty", value: String(records.reduce((total, record) => total + record.plannedQuantity, 0)) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Planner queue" description="Open a work order to review materials, operations, readiness, reservations, and audit-friendly actions.">
          <DataGrid ariaLabel="Work order list" columns={workOrderColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.workOrderNo} work order`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Materials, operations, readiness, reservations, and release action labels."
        footer={<ErpActionBar primary={[{ disabled: Boolean(workOrderActionReason(session, detail, "release", lifecycleMutation.isPending)), label: lifecycleMutation.isPending ? "Releasing" : "Release work order", onClick: () => lifecycleMutation.mutate("release"), reason: workOrderActionReason(session, detail, "release", lifecycleMutation.isPending) }, { disabled: Boolean(workOrderActionReason(session, detail, "generate-job-cards", lifecycleMutation.isPending)), label: lifecycleMutation.isPending ? "Generating" : "Generate job cards", onClick: () => lifecycleMutation.mutate("generate-job-cards"), reason: workOrderActionReason(session, detail, "generate-job-cards", lifecycleMutation.isPending) }]} secondary={[{ disabled: Boolean(workOrderActionReason(session, detail, "re-release", lifecycleMutation.isPending)), label: "Re-release", onClick: () => lifecycleMutation.mutate("re-release"), reason: workOrderActionReason(session, detail, "re-release", lifecycleMutation.isPending) }, { disabled: Boolean(workOrderActionReason(session, detail, "close", lifecycleMutation.isPending)), label: "Close work order", onClick: () => lifecycleMutation.mutate("close"), reason: workOrderActionReason(session, detail, "close", lifecycleMutation.isPending) }, { label: "Issue materials", onClick: () => navigate(`/inventory/material-issue?workOrder=${encodeURIComponent(detail?.workOrderNo ?? "")}`) }, { label: "Receive production", onClick: () => navigate(`/production/receipts?workOrder=${encodeURIComponent(detail?.workOrderNo ?? "")}`) }, { label: "Print traveler", onClick: () => navigate(`/reports/print-pack?workOrder=${encodeURIComponent(detail?.workOrderNo ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(detail)}
        onClose={() => setSelectedId(null)}
        statusMeta={actionMessage ? <Badge tone={actionTone}>{actionMessage}</Badge> : null}
        title={detail?.workOrderNo ?? "Selected work order"}
      >
        {detail ? (
          <>
            <KpiStrip items={[{ label: "Status", value: detail.status }, { label: "Materials", value: detail.materialSummary }, { label: "Operations", value: detail.operationSummary }, { label: "Readiness", value: detail.readinessSignal }]} />
            <Card title="Primary actions" description="Release and traveler actions stay visible as controlled review states.">
              <div className="context-chip-row">
                {detail.primaryActions.map((action) => <Badge key={action} tone="info">{action}</Badge>)}
              </div>
            </Card>
            {detail.blockers.length > 0 ? (
              <Card title="Release blockers" description="Release blockers that must clear before the selected work order can move forward.">
                {detail.blockers.map((blocker) => <div className="notification-item" key={blocker}><strong>{blocker}</strong></div>)}
              </Card>
            ) : null}
            <Card title="Material readiness" description="Component requirements, reservations, availability, and shortage signals.">
              <DataGrid ariaLabel="Work order material readiness" columns={materialColumns} getRowId={(record) => record.id} records={detail.materials} rowLabel={(record) => `${record.componentLabel} material readiness`} />
            </Card>
            <Card title="Operation readiness" description="Operation and capacity status for the selected work order.">
              <DataGrid ariaLabel="Work order operations" columns={operationColumns} getRowId={(record) => record.id} isLoading={detailQuery.isLoading} records={detail.operations} rowLabel={(record) => `${record.operationLabel} work order operation`} />
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Create a live work order from approved engineering and planning sources."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || saveMutation.isPending, label: saveMutation.isPending ? "Saving work order" : "Save work order", onClick: () => draft ? saveMutation.mutate(draft) : undefined, reason: saveReason }]} secondary={[{ disabled: true, label: "Save and release", reason: "Release still requires the readiness check after the work order is saved." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={actionMessage ? <Badge tone={actionTone}>{actionMessage}</Badge> : null}
        title="New work order"
      >
        {draft ? (
          <>
            <ErpValidationSummary errors={validation} />
            <FormShell initialFingerprint={draft.workOrderNo} title="Work-order planning controls">
              <label>
                <span>Work-order number</span>
                <input aria-label="Work-order number" disabled={!isLive} onChange={(event) => updateDraft({ workOrderNo: event.target.value })} value={draft.workOrderNo} />
              </label>
              <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting an item."} label="Item" onChange={(value) => updateDraft({ itemId: value ? Number(value) : 0 })} options={itemOptions} required value={draft.itemId ? String(draft.itemId) : ""} />
              <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting a BOM revision."} label="BOM revision" onChange={updateBomRevision} options={bomOptions} required value={draft.bomRevisionId ? String(draft.bomRevisionId) : ""} />
              <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting routing."} label="Routing" onChange={(value) => updateDraft({ routingId: value ? Number(value) : null })} options={routingOptions} value={draft.routingId ? String(draft.routingId) : ""} />
              <ErpDecimalField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before entering planned quantity."} label="Planned quantity" min={0.000001} onChange={(value) => updateDraft({ plannedQuantity: value ?? 0 })} required value={draft.plannedQuantity} />
              <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before selecting production UOM."} label="Production UOM" onChange={(value) => updateDraft({ productionUomId: value ? Number(value) : 0 })} options={uomOptions} required value={draft.productionUomId ? String(draft.productionUomId) : ""} />
              <label>
                <span>Planned start</span>
                <input aria-label="Planned start" disabled={!isLive} onChange={(event) => updateDraft({ plannedStartDate: event.target.value })} type="date" value={draft.plannedStartDate} />
              </label>
              <label>
                <span>Planned end</span>
                <input aria-label="Planned end" disabled={!isLive} onChange={(event) => updateDraft({ plannedEndDate: event.target.value })} type="date" value={draft.plannedEndDate} />
              </label>
              <ErpLookupField disabled={!isLive} disabledReason={isLive ? undefined : "Live production sign-in is required before changing status."} label="Status" onChange={(value) => updateDraft({ status: value })} options={["Draft", "PendingRelease", "OnHold"].map(optionFrom)} value={draft.status} />
              <label className="form-span-2">
                <span>Remarks</span>
                <textarea aria-label="Work-order remarks" disabled={!isLive} onChange={(event) => updateDraft({ remarks: event.target.value })} rows={3} value={draft.remarks} />
              </label>
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const jobCardColumns: DataGridColumn<JobCardSetupItem>[] = [
  {
    key: "jc",
    header: "Job card",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{record.jobCardNo}</strong>
        <div className="muted">{record.workOrderLabel}</div>
      </div>
    )
  },
  { key: "operation", header: "Operation", render: (record) => record.operationLabel },
  { key: "machine", header: "Machine", width: "16%", render: (record) => record.machineLabel },
  { key: "shift", header: "Shift", width: "12%", render: (record) => record.shiftLabel },
  { key: "quantity", header: "Qty", width: "18%", render: (record) => record.quantitySummary },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const downtimeColumns: DataGridColumn<DowntimeRegisterItem>[] = [
  { key: "job", header: "Job card", width: "16%", render: (record) => <strong>{record.jobCardLabel}</strong> },
  { key: "machine", header: "Machine", width: "18%", render: (record) => record.machineLabel },
  { key: "reason", header: "Reason", render: (record) => record.reasonCode },
  { key: "duration", header: "Minutes", width: "10%", render: (record) => record.durationMinutes },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const executionReasonOptions = [
  { label: "Production hold", value: "PRODUCTION_HOLD" },
  { label: "Quality review", value: "QUALITY_REVIEW" },
  { label: "Material wait", value: "MATERIAL_WAIT" },
  { label: "Machine stop", value: "MACHINE_STOP" }
];

type JobCardExecutionAction = "start" | "pause" | "resume" | "quantity" | "complete";

interface JobCardQuantityDraft {
  goodQty: number;
  rejectQty: number;
  scrapQty: number;
  reasonCode: string;
  remarks: string;
}

function isJobStatus(detail: JobCardSetupItem | null | undefined, ...statuses: string[]) {
  const normalized = detail?.status.toLowerCase() ?? "";
  return statuses.some((status) => normalized === status.toLowerCase());
}

function jobExecutionReason(
  session: Parameters<typeof hasLiveSession>[0],
  detail: JobCardSetupItem | null | undefined,
  extraReason?: string | null
) {
  if (!detail) {
    return "Open a job card before posting execution actions.";
  }

  if (!hasLiveSession(session)) {
    return "Live production sign-in is required before updating job cards.";
  }

  return extraReason ?? undefined;
}

function actionStatusMessage(status: string | null | undefined, fallback: string) {
  return status ? `${fallback} Current status: ${status}.` : fallback;
}

export function JobCardsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pauseReasonCode, setPauseReasonCode] = useState("PRODUCTION_HOLD");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionTone, setActionTone] = useState<"success" | "warn" | "danger" | "info">("info");
  const [quantityDraft, setQuantityDraft] = useState<JobCardQuantityDraft>({
    goodQty: 1,
    rejectQty: 0,
    scrapQty: 0,
    reasonCode: "PRODUCTION_HOLD",
    remarks: ""
  });
  const { deferredSearch, filter } = useProductionFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.jobCards(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listJobCardSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const detailQuery = useApiQuery<JobCardSetupItem | null>(
    queryKeys.production.jobCardDetail(selected?.jobCardId),
    () => selected ? getJobCardDetailSetup(session, selected) : Promise.resolve(null),
    { enabled: Boolean(selected), staleTime: 60_000 }
  );
  const detail = detailQuery.data ?? selected;
  const source = records[0]?.source ?? "Seeded";
  const requestedJobCard = searchParams.get("jobCard");
  const startReason = detail && (!detail.assignedMachineId || !detail.assignedOperatorUserId)
    ? "Assign a machine and operator before starting the job card."
    : undefined;
  const quantityReason = quantityDraft.goodQty + quantityDraft.rejectQty + quantityDraft.scrapQty <= 0
    ? "Enter at least one good, reject, or scrap quantity before logging production."
    : quantityDraft.rejectQty + quantityDraft.scrapQty > 0 && !quantityDraft.reasonCode
      ? "Select a reason before logging reject or scrap quantity."
      : undefined;
  const pauseReason = !pauseReasonCode ? "Select a pause reason before pausing the job card." : undefined;
  const canStart = isJobStatus(detail, "Assigned");
  const canPause = isJobStatus(detail, "Started");
  const canResume = isJobStatus(detail, "Paused");
  const canComplete = detail ? !isJobStatus(detail, "Completed", "QC_Hold", "Cancelled") : false;
  const actionMutation = useApiMutation(
    async (action: JobCardExecutionAction) => {
      if (!detail) {
        throw new Error("Open a job card before posting execution actions.");
      }

      if (action === "start") {
        if (!detail.assignedMachineId || !detail.assignedOperatorUserId) {
          throw new Error("Assign a machine and operator before starting the job card.");
        }

        return apiClient.production.startJobCard(detail.jobCardId, {
          machineId: detail.assignedMachineId,
          operatorUserId: detail.assignedOperatorUserId,
          remarks: quantityDraft.remarks || null
        });
      }

      if (action === "pause") {
        return apiClient.production.pauseJobCard(detail.jobCardId, {
          reasonCode: pauseReasonCode,
          remarks: quantityDraft.remarks || null
        });
      }

      if (action === "resume") {
        return apiClient.production.resumeJobCard(detail.jobCardId, {
          machineId: detail.assignedMachineId,
          operatorUserId: detail.assignedOperatorUserId,
          remarks: quantityDraft.remarks || null
        });
      }

      if (action === "quantity") {
        return apiClient.production.logJobCardQuantity(detail.jobCardId, {
          goodQty: quantityDraft.goodQty,
          rejectQty: quantityDraft.rejectQty,
          scrapQty: quantityDraft.scrapQty,
          reasonCode: quantityDraft.reasonCode || null,
          remarks: quantityDraft.remarks || null
        });
      }

      return apiClient.production.completeJobCard(detail.jobCardId, { remarks: quantityDraft.remarks || null });
    },
    {
      onSuccess: async (result, action) => {
        setActionTone("success");
        setActionMessage(actionStatusMessage(result.status, `${action === "quantity" ? "Quantity logged." : "Job-card action posted."}`));
        await Promise.all([query.refetch(), detailQuery.refetch()]);
      },
      onError: (error) => {
        setActionTone("danger");
        setActionMessage(error.message);
      }
    }
  );

  useEffect(() => {
    if (!requestedJobCard || records.length === 0) {
      return;
    }

    const normalized = requestedJobCard.toLowerCase();
    const match = records.find((record) => record.jobCardNo.toLowerCase() === normalized || record.jobCardNo.toLowerCase().includes(normalized));
    if (match) {
      setSelectedId(match.id);
    }
  }, [records, requestedJobCard]);

  useEffect(() => {
    if (!detail) {
      return;
    }

    setQuantityDraft({
      goodQty: Math.max(Math.min(detail.plannedQuantity - detail.goodQuantity - detail.rejectQuantity - detail.scrapQuantity, 1), 0),
      rejectQty: 0,
      scrapQty: 0,
      reasonCode: "PRODUCTION_HOLD",
      remarks: ""
    });
    setActionMessage(null);
  }, [detail?.id, detail?.plannedQuantity, detail?.goodQuantity, detail?.rejectQuantity, detail?.scrapQuantity]);

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Manual job card", reason: "Manual job-card creation requires production control workflow enablement." }]} secondary={[{ disabled: true, label: "Print", reason: "Job-card printing is pending document workflow enablement." }]} testId="job-card-action-bar" /></>}
        description="Execution list for operations, lot splits, quantity status, and supervisor review."
        filters={<FilterBar><input aria-label="Search job cards" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search job card, WO, machine" value={search} /><select aria-label="Job card status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Created">Created</option><option value="Started">Started</option><option value="Paused">Paused</option><option value="Completed">Completed</option></select></FilterBar>}
        title="Job Cards"
      >
      <KpiStrip items={[{ label: "Job cards", value: String(records.length) }, { label: "Good qty", value: String(records.reduce((total, record) => total + record.goodQuantity, 0)) }, { label: "Downtime min", value: String(records.reduce((total, record) => total + record.downtimeMinutes, 0)) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Execution queue" description="Open a job card to review start/pause/complete state, quantities, downtime, and timeline.">
          <DataGrid ariaLabel="Job card list" columns={jobCardColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.jobCardNo} job card`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Timeline and quick action labels for pause, reject, downtime, and completion review."
        footer={<ErpActionBar primary={[
          canStart
            ? { disabled: Boolean(jobExecutionReason(session, detail, startReason)) || actionMutation.isPending, label: actionMutation.isPending ? "Starting" : "Start", onClick: () => actionMutation.mutate("start"), reason: jobExecutionReason(session, detail, startReason) }
            : canResume
              ? { disabled: Boolean(jobExecutionReason(session, detail)) || actionMutation.isPending, label: actionMutation.isPending ? "Resuming" : "Resume", onClick: () => actionMutation.mutate("resume"), reason: jobExecutionReason(session, detail) }
              : { disabled: Boolean(jobExecutionReason(session, detail)) || !canComplete || actionMutation.isPending, label: actionMutation.isPending ? "Completing" : "Complete", onClick: () => actionMutation.mutate("complete"), reason: canComplete ? jobExecutionReason(session, detail) : "Completed or cancelled job cards cannot be completed again." }
        ]} secondary={[
          { disabled: Boolean(jobExecutionReason(session, detail, quantityReason)) || !canPause || actionMutation.isPending, label: "Log quantity", onClick: () => actionMutation.mutate("quantity"), reason: canPause ? jobExecutionReason(session, detail, quantityReason) : "Start or resume the job card before logging production quantity." },
          { disabled: Boolean(jobExecutionReason(session, detail, pauseReason)) || !canPause || actionMutation.isPending, label: "Pause", onClick: () => actionMutation.mutate("pause"), reason: canPause ? jobExecutionReason(session, detail, pauseReason) : "Only started job cards can be paused." },
          { label: "Record downtime", onClick: () => navigate(`/production/downtime?jobCard=${encodeURIComponent(detail?.jobCardNo ?? "")}`) },
          { label: "Open QC", onClick: () => navigate(`/quality/in-process-inspections?jobCard=${encodeURIComponent(detail?.jobCardNo ?? "")}`) }
        ]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(detail)}
        onClose={() => setSelectedId(null)}
        statusMeta={actionMessage ? <Badge tone={actionTone}>{actionMessage}</Badge> : null}
        title={detail?.jobCardNo ?? "Selected job card"}
      >
        {detail ? (
          <>
            <KpiStrip items={[{ label: "Machine", value: detail.machineLabel }, { label: "Operator", value: detail.operatorLabel }, { label: "Qty", value: detail.quantitySummary }, { label: "Downtime", value: String(detail.downtimeMinutes) }]} />
            <FormShell initialFingerprint={`${detail.id}-${detail.status}`} title="Execution posting controls" description="Live supervisors can post supported job-card state and quantity updates from this workspace.">
              <ErpLookupField disabled disabledReason="Job-card assignment is controlled by production scheduling." label="Machine" onChange={() => undefined} options={[{ label: detail.machineLabel, value: String(detail.assignedMachineId ?? detail.machineLabel) }]} value={String(detail.assignedMachineId ?? detail.machineLabel)} />
              <ErpLookupField disabled disabledReason="Operator assignment is controlled by production scheduling." label="Operator" onChange={() => undefined} options={[{ label: detail.operatorLabel, value: String(detail.assignedOperatorUserId ?? detail.operatorLabel) }]} value={String(detail.assignedOperatorUserId ?? detail.operatorLabel)} />
              <ErpDecimalField disabled={!hasLiveSession(session)} disabledReason={!hasLiveSession(session) ? "Live production sign-in is required before logging quantities." : undefined} label="Good quantity to log" min={0} onChange={(value) => setQuantityDraft((current) => ({ ...current, goodQty: value ?? 0 }))} value={quantityDraft.goodQty} />
              <ErpDecimalField disabled={!hasLiveSession(session)} disabledReason={!hasLiveSession(session) ? "Live production sign-in is required before logging quantities." : undefined} label="Reject quantity to log" min={0} onChange={(value) => setQuantityDraft((current) => ({ ...current, rejectQty: value ?? 0 }))} value={quantityDraft.rejectQty} />
              <ErpDecimalField disabled={!hasLiveSession(session)} disabledReason={!hasLiveSession(session) ? "Live production sign-in is required before logging quantities." : undefined} label="Scrap quantity to log" min={0} onChange={(value) => setQuantityDraft((current) => ({ ...current, scrapQty: value ?? 0 }))} value={quantityDraft.scrapQty} />
              <ErpLookupField disabled={!hasLiveSession(session)} disabledReason={!hasLiveSession(session) ? "Live production sign-in is required before selecting execution reasons." : undefined} label="Execution reason" onChange={(value) => setQuantityDraft((current) => ({ ...current, reasonCode: value }))} options={executionReasonOptions} value={quantityDraft.reasonCode} />
              <ErpLookupField disabled={!hasLiveSession(session)} disabledReason={!hasLiveSession(session) ? "Live production sign-in is required before selecting pause reasons." : undefined} label="Pause reason" onChange={setPauseReasonCode} options={executionReasonOptions} value={pauseReasonCode} />
              <label>
                <span>Supervisor remarks</span>
                <input disabled={!hasLiveSession(session)} onChange={(event) => setQuantityDraft((current) => ({ ...current, remarks: event.target.value }))} value={quantityDraft.remarks} />
              </label>
            </FormShell>
            <Card title="Execution timeline" description="Activity history stays visible without leaving the queue screen.">
              <Timeline entries={detail.events} />
            </Card>
          <Card title="Downtime events" description="Downtime lines are shown from the current job-card detail when available.">
              <DataGrid ariaLabel="Job card downtime events" columns={downtimeColumns} getRowId={(record) => record.id} isLoading={detailQuery.isLoading} records={detail.downtimes} rowLabel={(record) => `${record.reasonCode} downtime`} />
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

function useMachineBoardData() {
  const { session } = useAuth();
  const [dateFrom, setDateFrom] = useState("2026-03-05");
  const [dateTo, setDateTo] = useState("2026-03-11");
  const filter = useMemo(() => ({ dateFrom, dateTo, page: 1, pageSize: 25 }), [dateFrom, dateTo]);
  const query = useApiQuery(queryKeys.production.machineBoard(dateFrom, dateTo), () => getMachineBoardSetup(session, filter), { staleTime: 60_000 });

  return { dateFrom, dateTo, setDateFrom, setDateTo, query };
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDaysIso(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return toIsoDate(next);
}

export function MachineBoardPage() {
  const navigate = useNavigate();
  const { dateFrom, dateTo, setDateFrom, setDateTo, query } = useMachineBoardData();
  const [selectedSlot, setSelectedSlot] = useState<{ lane: Lane; slot: LaneSlot } | null>(null);
  const board = query.data;
  const source = board?.source ?? "Seeded";
  const setToday = () => {
    const today = toIsoDate(new Date());
    setDateFrom(today);
    setDateTo(today);
  };

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Auto-assign review", reason: "Auto-assignment review requires machine-scheduling workflow enablement." }]} secondary={[{ label: "Today", onClick: setToday }]} testId="machine-board-action-bar" /></>}
        description="Lane view of what each machine is running next, preserving the production board visual language."
        filters={<FilterBar><input aria-label="Machine board from" onChange={(event) => setDateFrom(event.target.value)} type="date" value={dateFrom} /><input aria-label="Machine board to" onChange={(event) => setDateTo(event.target.value)} type="date" value={dateTo} /></FilterBar>}
        title="Machine Schedule Board"
      >
        <KpiStrip items={[{ label: "Machines", value: String(board?.lanes.length ?? 0) }, { label: "Running", value: String(board?.lanes.filter((lane) => lane.status === "Running").length ?? 0) }, { label: "Down", value: String(board?.lanes.filter((lane) => lane.status === "Down").length ?? 0) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Machine lanes" description="Current and queued work stays visible as lane cards rather than a generic grid.">
          <LaneBoard lanes={board?.lanes ?? []} onSlotSelect={(lane, slot) => setSelectedSlot({ lane, slot })} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Machine card detail keeps scheduling context visible without changing assignment state."
        footer={<ErpActionBar primary={[{ label: "Open job cards", onClick: () => navigate(`/production/job-cards?jobCard=${encodeURIComponent(selectedSlot?.slot.title.split(" / ")[0] ?? "")}`) }]} secondary={[{ disabled: true, label: "Auto-assign review", reason: "Auto-assignment review requires machine-scheduling workflow enablement." }]} utility={[{ label: "Close", onClick: () => setSelectedSlot(null), variant: "quiet" }]} />}
        isOpen={Boolean(selectedSlot)}
        onClose={() => setSelectedSlot(null)}
        title={selectedSlot?.slot.title ?? "Machine card"}
      >
        {selectedSlot ? (
          <FormShell initialFingerprint={`${selectedSlot.lane.id}-${selectedSlot.slot.id}`} title="Machine schedule card">
            <ErpLookupField disabled disabledReason="Machine is controlled by the machine schedule board." label="Machine" onChange={() => undefined} options={[{ label: selectedSlot.lane.machine, value: selectedSlot.lane.machine }]} value={selectedSlot.lane.machine} />
            <ErpLookupField disabled disabledReason="Job card is controlled by production scheduling." label="Job card" onChange={() => undefined} options={[{ label: selectedSlot.slot.title, value: selectedSlot.slot.title }]} value={selectedSlot.slot.title} />
            <ErpLookupField disabled disabledReason="Schedule window is calculated by machine scheduling." label="Schedule window" onChange={() => undefined} options={[{ label: `${selectedSlot.slot.start} - ${selectedSlot.slot.end}`, value: `${selectedSlot.slot.start} - ${selectedSlot.slot.end}` }]} value={`${selectedSlot.slot.start} - ${selectedSlot.slot.end}`} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function OccupancyCalendarPage() {
  const { dateFrom, dateTo, setDateFrom, setDateTo, query } = useMachineBoardData();
  const board = query.data;
  const source = board?.source ?? "Seeded";
  const setNextSevenDays = () => {
    const today = new Date();
    setDateFrom(toIsoDate(today));
    setDateTo(addDaysIso(today, 6));
  };

  return (
    <ListPageShell
      actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Review assignment", reason: "Assignment review requires machine-scheduling workflow enablement." }]} secondary={[{ label: "Next 7 days", onClick: setNextSevenDays }]} testId="occupancy-action-bar" /></>}
      description="Calendar occupancy across machines and days for PPS planning."
      filters={<FilterBar><input aria-label="Occupancy from" onChange={(event) => setDateFrom(event.target.value)} type="date" value={dateFrom} /><input aria-label="Occupancy to" onChange={(event) => setDateTo(event.target.value)} type="date" value={dateTo} /></FilterBar>}
      title="PPS Machine Occupancy Calendar"
    >
      <KpiStrip items={[{ label: "Machines", value: String(board?.occupancyRows.length ?? 0) }, { label: "Days", value: String(board?.occupancyColumns.length ?? 0) }, { label: "Occupied", value: String(board?.occupancyRows.reduce((total, row) => total + row.cells.filter((cell) => cell.state === "occupied").length, 0) ?? 0) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
      <Card title="Occupancy calendar" description="Machine availability and down states remain visible by day.">
        <OccupancyCalendar columns={board?.occupancyColumns ?? []} rows={board?.occupancyRows ?? []} />
      </Card>
    </ListPageShell>
  );
}

const shiftProductionColumns: DataGridColumn<ShiftProductionItem>[] = [
  {
    key: "shift",
    header: "Shift",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{record.shiftLabel}</strong>
        <div className="muted">{record.productionDate}</div>
      </div>
    )
  },
  { key: "wo", header: "WO / JC", width: "20%", render: (record) => `${record.workOrderLabel} / ${record.jobCardLabel}` },
  { key: "machine", header: "Machine", render: (record) => record.machineLabel },
  { key: "qty", header: "Good / reject / scrap", width: "18%", render: (record) => `${record.goodQuantity} / ${record.rejectQuantity} / ${record.scrapQuantity}` },
  { key: "downtime", header: "Down min", width: "10%", render: (record) => record.downtimeMinutes },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function ShiftProductionEntryPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useProductionFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.shiftProduction(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listShiftProductionSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Deferred";

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Submit summary", reason: "Shift summary submission requires production execution workflow enablement." }]} secondary={[{ disabled: true, label: "Export shift", reason: "Shift export is pending the approved reporting workflow." }]} testId="shift-production-action-bar" /></>}
        description="Summarize shift output and production issues from the available job-card data."
        filters={<FilterBar><input aria-label="Search shift production" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search shift, WO, job card, machine" value={search} /><select aria-label="Shift production status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="Submitted">Submitted</option><option value="Started">Started</option><option value="Paused">Paused</option></select></FilterBar>}
        title="Shift Production Entry"
      >
        <KpiStrip items={[{ label: "Rows", value: String(records.length) }, { label: "Good qty", value: String(records.reduce((total, record) => total + record.goodQuantity, 0)) }, { label: "Reject/scrap", value: String(records.reduce((total, record) => total + record.rejectQuantity + record.scrapQuantity, 0)) }, { label: "Down min", value: String(records.reduce((total, record) => total + record.downtimeMinutes, 0)) }]} />
        <Card title="Shift output register" description="Shift output remains review-only until production summary submission is enabled.">
          <DataGrid ariaLabel="Shift production list" columns={shiftProductionColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.shiftLabel} shift production`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Shift production detail is review-only until summary submission is enabled." footer={<ErpActionBar primary={[{ disabled: true, label: "Submit summary", reason: "Shift summary submission requires production execution workflow enablement." }]} secondary={[{ disabled: true, label: "Save shift draft", reason: "Shift draft save requires production execution workflow enablement." }, { label: "Open job card", onClick: () => navigate(`/production/job-cards?jobCard=${encodeURIComponent(selected?.jobCardLabel ?? "")}`) }, { label: "Open downtime", onClick: () => navigate(`/production/downtime?jobCard=${encodeURIComponent(selected?.jobCardLabel ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.jobCardLabel ?? "Shift production"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Shift production controls" description={selected.issueSummary}><ErpNumberField disabled disabledReason="Shift quantities are posted through the controlled production workflow." label="Good quantity" onChange={() => undefined} value={selected.goodQuantity} /><ErpNumberField disabled disabledReason="Shift quantities are posted through the controlled production workflow." label="Reject quantity" onChange={() => undefined} value={selected.rejectQuantity} /><ErpNumberField disabled disabledReason="Shift quantities are posted through the controlled production workflow." label="Scrap quantity" onChange={() => undefined} value={selected.scrapQuantity} /></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

export function DowntimeRegisterPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useProductionFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.downtime(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listDowntimeSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Open RCA queue", reason: "RCA workflow is pending quality action enablement." }]} secondary={[{ disabled: true, label: "Export downtime", reason: "Downtime export is pending the approved reporting workflow." }]} testId="downtime-action-bar" /></>}
        description="All downtime events with reason code, machine impact, duration, and audit notes."
        filters={<FilterBar><input aria-label="Search downtime" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search job card, machine, reason" value={search} /><select aria-label="Downtime status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Logged">Logged</option><option value="Major">Major</option></select></FilterBar>}
        title="Downtime Register"
      >
      <KpiStrip items={[{ label: "Events", value: String(records.length) }, { label: "Minutes", value: String(records.reduce((total, record) => total + record.durationMinutes, 0)) }, { label: "Major", value: String(records.filter((record) => record.status === "Major").length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Downtime event register" description="Read-only web review of job-card downtime events.">
          <DataGrid ariaLabel="Downtime register" columns={downtimeColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.reasonCode} downtime event`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Downtime detail is review-only until RCA workflow is enabled." footer={<ErpActionBar primary={[{ disabled: true, label: "Save downtime review", reason: "Downtime review save requires RCA workflow enablement." }]} secondary={[{ label: "Open job card", onClick: () => navigate(`/production/job-cards?jobCard=${encodeURIComponent(selected?.jobCardLabel ?? "")}`) }, { label: "Open RCA queue", onClick: () => navigate(`/quality/ncr?source=${encodeURIComponent(selected?.jobCardLabel ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.reasonCode ?? "Downtime event"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Downtime review controls" description={selected.remarks}><ErpLookupField disabled disabledReason="Machine selection is controlled by machine master." label="Machine" onChange={() => undefined} options={[{ label: selected.machineLabel, value: selected.machineLabel }]} value={selected.machineLabel} /><label><span>Start</span><input disabled defaultValue={selected.startOn} /></label><label><span>End</span><input disabled defaultValue={selected.endOn} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}
