import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { bomRecords } from "../api/mockData";
import { queryKeys, useApiQuery } from "../api/hooks";
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
import { ErpActionBar, ErpLookupField, ErpModalWorkspace, ErpNumberField } from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { Timeline } from "../ui/Timeline";
import { KpiStrip, LaneBoard, OccupancyCalendar } from "../ui/boards";
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
        footer={<ErpActionBar primary={[{ disabled: true, label: "Review release", reason: "Release review requires planning release workflow enablement." }]} secondary={[{ disabled: true, label: "Print traveler", reason: "Traveler printing is pending document workflow enablement." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
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

export function JobCardsPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
        footer={<ErpActionBar primary={[{ disabled: true, label: "Complete", reason: "Completion requires production execution workflow enablement." }]} secondary={[{ disabled: true, label: "Pause", reason: "Pause requires production execution workflow enablement." }, { disabled: true, label: "Add reject", reason: "Reject entry requires quality workflow enablement." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(detail)}
        onClose={() => setSelectedId(null)}
        title={detail?.jobCardNo ?? "Selected job card"}
      >
        {detail ? (
          <>
            <KpiStrip items={[{ label: "Machine", value: detail.machineLabel }, { label: "Operator", value: detail.operatorLabel }, { label: "Qty", value: detail.quantitySummary }, { label: "Downtime", value: String(detail.downtimeMinutes) }]} />
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

export function MachineBoardPage() {
  const { dateFrom, dateTo, setDateFrom, setDateTo, query } = useMachineBoardData();
  const board = query.data;
  const source = board?.source ?? "Seeded";

  return (
    <ListPageShell
      actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Auto-assign review", reason: "Auto-assignment review requires machine-scheduling workflow enablement." }]} secondary={[{ disabled: true, label: "Today", reason: "Quick date reset is pending scheduling toolbar enablement." }]} testId="machine-board-action-bar" /></>}
      description="Lane view of what each machine is running next, preserving the production board visual language."
      filters={<FilterBar><input aria-label="Machine board from" onChange={(event) => setDateFrom(event.target.value)} type="date" value={dateFrom} /><input aria-label="Machine board to" onChange={(event) => setDateTo(event.target.value)} type="date" value={dateTo} /></FilterBar>}
      title="Machine Schedule Board"
    >
      <KpiStrip items={[{ label: "Machines", value: String(board?.lanes.length ?? 0) }, { label: "Running", value: String(board?.lanes.filter((lane) => lane.status === "Running").length ?? 0) }, { label: "Down", value: String(board?.lanes.filter((lane) => lane.status === "Down").length ?? 0) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
      <Card title="Machine lanes" description="Current and queued work stays visible as lane cards rather than a generic grid.">
        <LaneBoard lanes={board?.lanes ?? []} />
      </Card>
    </ListPageShell>
  );
}

export function OccupancyCalendarPage() {
  const { dateFrom, dateTo, setDateFrom, setDateTo, query } = useMachineBoardData();
  const board = query.data;
  const source = board?.source ?? "Seeded";

  return (
    <ListPageShell
      actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Review assignment", reason: "Assignment review requires machine-scheduling workflow enablement." }]} secondary={[{ disabled: true, label: "Next 7 days", reason: "Quick range selection is pending scheduling toolbar enablement." }]} testId="occupancy-action-bar" /></>}
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
      <ErpModalWorkspace description="Shift production detail is review-only until summary submission is enabled." footer={<ErpActionBar primary={[{ disabled: true, label: "Submit summary", reason: "Shift summary submission requires production execution workflow enablement." }]} secondary={[{ disabled: true, label: "Save shift draft", reason: "Shift draft save requires production execution workflow enablement." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.jobCardLabel ?? "Shift production"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Shift production controls" description={selected.issueSummary}><ErpNumberField disabled disabledReason="Shift quantities are posted through the controlled production workflow." label="Good quantity" onChange={() => undefined} value={selected.goodQuantity} /><ErpNumberField disabled disabledReason="Shift quantities are posted through the controlled production workflow." label="Reject quantity" onChange={() => undefined} value={selected.rejectQuantity} /><ErpNumberField disabled disabledReason="Shift quantities are posted through the controlled production workflow." label="Scrap quantity" onChange={() => undefined} value={selected.scrapQuantity} /></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

export function DowntimeRegisterPage() {
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
      <ErpModalWorkspace description="Downtime detail is review-only until RCA workflow is enabled." footer={<ErpActionBar primary={[{ disabled: true, label: "Save downtime review", reason: "Downtime review save requires RCA workflow enablement." }]} secondary={[{ disabled: true, label: "Open RCA queue", reason: "RCA workflow is pending quality action enablement." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.reasonCode ?? "Downtime event"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Downtime review controls" description={selected.remarks}><ErpLookupField disabled disabledReason="Machine selection is controlled by machine master." label="Machine" onChange={() => undefined} options={[{ label: selected.machineLabel, value: selected.machineLabel }]} value={selected.machineLabel} /><label><span>Start</span><input disabled defaultValue={selected.startOn} /></label><label><span>End</span><input disabled defaultValue={selected.endOn} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}
