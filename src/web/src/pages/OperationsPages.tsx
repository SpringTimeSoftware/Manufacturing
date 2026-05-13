import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../api/http";
import { bomRecords } from "../api/mockData";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
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
import { ErpActionBar, ErpDecimalField, ErpLookupField, ErpModalWorkspace, ErpNumberField } from "../ui/ErpComponents";
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

export function CycleCountPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useProductionFilter(search, status);
  const query = useApiQuery(
    queryKeys.inventory.cycleCounts(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listCycleCountSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New count sheet", reason: "Cycle-count creation requires inventory count workflow enablement." }]} secondary={[{ disabled: true, label: "Export variances", reason: "Variance export is pending the approved reporting workflow." }]} testId="cycle-count-action-bar" /></>}
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
        description="Cycle-count detail is review-only until count adjustment workflow is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save count sheet", reason: "Cycle-count save requires inventory count workflow enablement." }]} secondary={[{ disabled: true, label: "Post count", reason: "Posting requires inventory count approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.countNo ?? "Cycle count"}
      >
        {selected ? (
          <>
            <KpiStrip items={[{ label: "Warehouse", value: selected.warehouseLabel }, { label: "Posted", value: selected.postedLabel }, { label: "Variance", value: String(selected.absoluteVariance) }]} />
            <Card title="Count lines" description={selected.remarks}>
              <DataGrid ariaLabel="Cycle count lines" columns={cycleLineColumns} getRowId={(record) => record.id} records={selected.lines} rowLabel={(record) => `${record.itemLabel} count line`} />
            </Card>
            <FormShell initialFingerprint={selected.id} title="Approval controls">
              <ErpLookupField disabled disabledReason="Count status is controlled by count approval workflow." label="Status" onChange={() => undefined} options={[{ label: selected.status, value: selected.status }]} value={selected.status} />
              <label><span>Remarks</span><input disabled defaultValue={selected.remarks} /></label>
            </FormShell>
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

export function WorkOrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useProductionFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.workOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listWorkOrderSetup(session, filter),
    { staleTime: 60_000 }
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
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New work order", reason: "Work-order creation requires planning release workflow enablement." }]} secondary={[{ disabled: true, label: "Export", reason: "Work-order export is pending the approved reporting workflow." }, { disabled: true, label: "Print pack", reason: "Work-order print pack is pending document workflow enablement." }]} testId="work-order-action-bar" /></>}
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
        footer={<ErpActionBar primary={[{ disabled: true, label: "Review release", reason: "Release review requires planning release workflow enablement." }, { disabled: true, label: "Generate job cards", reason: "Job-card generation requires production release workflow enablement." }]} secondary={[{ label: "Issue materials", onClick: () => navigate(`/inventory/material-issue?workOrder=${encodeURIComponent(detail?.workOrderNo ?? "")}`) }, { label: "Receive production", onClick: () => navigate(`/production/receipts?workOrder=${encodeURIComponent(detail?.workOrderNo ?? "")}`) }, { label: "Print traveler", onClick: () => navigate(`/reports/print-pack?workOrder=${encodeURIComponent(detail?.workOrderNo ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(detail)}
        onClose={() => setSelectedId(null)}
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
