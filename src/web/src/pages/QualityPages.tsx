import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import {
  listInspections,
  listNonConformances,
  listQualityPlans,
  type InspectionItem,
  type InspectionResultItem,
  type NonConformanceItem,
  type QualityPlanItem
} from "../quality/qualityAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpLookupField, ErpModalWorkspace } from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Live records" : "Reference view"}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("pass") || normalized.includes("release") || normalized.includes("active")
    ? "success"
    : normalized.includes("fail") || normalized.includes("hold") || normalized.includes("open")
      ? "warn"
      : normalized.includes("reject")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function useQualityFilter(search: string, status: string, inspectionType = "all") {
  const { user } = useAuth();
  const deferredSearch = useDeferredValue(search);

  return useMemo(
    () => ({
      deferredSearch,
      filter: {
        ...buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
        inspectionType: inspectionType === "all" ? undefined : inspectionType
      }
    }),
    [deferredSearch, inspectionType, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
}

const planColumns: DataGridColumn<QualityPlanItem>[] = [
  {
    key: "plan",
    header: "Plan",
    width: "22%",
    render: (record) => (
      <div>
        <strong>{record.planCode}</strong>
        <div className="muted">{record.planName}</div>
      </div>
    )
  },
  { key: "type", header: "Type", width: "12%", render: (record) => record.inspectionType },
  { key: "item", header: "Item / operation", render: (record) => `${record.itemLabel} / ${record.operationLabel}` },
  { key: "auto", header: "Fail handling", width: "20%", render: (record) => `${record.autoHoldSignal} / ${record.autoNcrSignal}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function QcPlanSetupPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [inspectionType, setInspectionType] = useState("all");
  const { deferredSearch, filter } = useQualityFilter(search, status, inspectionType);
  const query = useApiQuery(
    queryKeys.quality.inspectionPlans(user?.activeContext.companyId, deferredSearch, status, inspectionType),
    () => listQualityPlans(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = records[0]?.source ?? "Seeded";

  return (
    <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New QC plan", reason: "QC plan creation requires quality master workflow enablement." }]} secondary={[{ disabled: true, label: "Export plans", reason: "QC plan export is pending the approved reporting workflow." }]} testId="qc-plan-action-bar" /></>} description="Inspection checkpoints, parameter libraries, and auto-hold/NCR behavior." filters={<FilterBar><input aria-label="Search QC plans" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search plan, item, parameter" value={search} /><select aria-label="QC plan status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Active">Active</option><option value="Draft">Draft</option></select><select aria-label="QC plan type" onChange={(event) => setInspectionType(event.target.value)} value={inspectionType}><option value="all">Type: Any</option><option value="Incoming">Incoming</option><option value="InProcess">In process</option><option value="Final">Final</option></select></FilterBar>} title="QC Plan Setup">
      <KpiStrip items={[{ label: "Plans", value: String(records.length) }, { label: "Auto hold", value: String(records.filter((record) => record.autoHoldSignal.includes("Auto")).length) }, { label: "Auto NCR", value: String(records.filter((record) => record.autoNcrSignal.includes("Auto")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
      <Card title="Inspection plan library" description="QC plan setup remains administrative and web-owned.">
        <DataGrid ariaLabel="QC plan list" columns={planColumns} getRowId={(record) => record.id} isLoading={query.isLoading} records={records} rowLabel={(record) => `${record.planCode} qc plan`} />
      </Card>
    </ListPageShell>
  );
}

const inspectionColumns: DataGridColumn<InspectionItem>[] = [
  { key: "inspection", header: "Inspection", width: "18%", render: (record) => <strong>{record.inspectionNo}</strong> },
  { key: "type", header: "Type", width: "12%", render: (record) => record.inspectionType },
  { key: "source", header: "Source", width: "18%", render: (record) => record.sourceDocument },
  { key: "trace", header: "Trace", width: "16%", render: (record) => record.traceLabel },
  { key: "result", header: "Result", width: "12%", render: (record) => <StatusBadge status={record.overallResult} /> },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const resultColumns: DataGridColumn<InspectionResultItem>[] = [
  { key: "line", header: "Line", width: "8%", render: (record) => record.lineNo },
  { key: "parameter", header: "Parameter", render: (record) => <strong>{record.parameterCode}</strong> },
  { key: "expected", header: "Expected", width: "20%", render: (record) => record.expectedValue },
  { key: "actual", header: "Actual", width: "18%", render: (record) => record.actualValue },
  { key: "result", header: "Result", width: "12%", render: (record) => <StatusBadge status={record.resultStatus} /> }
];

function InspectionPage({ title, description, defaultType }: { title: string; description: string; defaultType: string }) {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useQualityFilter(search, status, defaultType);
  const query = useApiQuery(
    queryKeys.quality.inspections(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status, defaultType),
    () => listInspections(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New inspection", reason: "Inspection creation requires quality execution workflow enablement." }]} secondary={[{ disabled: true, label: "Export inspections", reason: "Inspection export is pending the approved reporting workflow." }]} testId="inspection-action-bar" /></>} description={description} filters={<FilterBar><input aria-label={`Search ${title}`} onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search inspection, source, trace" value={search} /><select aria-label={`${title} status`} onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="Hold">Hold</option><option value="Released">Released</option></select></FilterBar>} title={title}>
      <KpiStrip items={[{ label: "Inspections", value: String(records.length) }, { label: "Fail/Hold", value: String(records.filter((record) => record.overallResult.toLowerCase().includes("fail") || record.status.toLowerCase().includes("hold")).length) }, { label: "Released", value: String(records.filter((record) => record.status.toLowerCase().includes("release")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Inspection queue" description="Open an inspection to review parameter results and hold/release context.">
          <DataGrid ariaLabel={`${title} list`} columns={inspectionColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.inspectionNo} inspection`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Inspection detail is review-only until inspection entry is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save inspection", reason: "Inspection save requires quality execution workflow enablement." }]} secondary={[{ disabled: true, label: "Release hold", reason: "Hold release requires quality approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.inspectionNo ?? title}
      >
        {selected ? (
          <>
            <KpiStrip items={[{ label: "Type", value: selected.inspectionType }, { label: "Result", value: selected.overallResult }, { label: "Hold/release", value: selected.heldReleasedSignal }]} />
            <Card title="Parameter results" description={selected.notes}>
              <DataGrid ariaLabel="Inspection result lines" columns={resultColumns} getRowId={(record) => record.id} records={selected.results} rowLabel={(record) => `${record.parameterCode} result`} />
            </Card>
            <FormShell initialFingerprint={selected.id} title="Inspection controls"><label><span>Source</span><input defaultValue={selected.sourceDocument} /></label><ErpLookupField disabled disabledReason="Trace selection is controlled by inventory and production traceability." label="Trace" onChange={() => undefined} options={[{ label: selected.traceLabel, value: selected.traceLabel }]} value={selected.traceLabel} /></FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function IncomingInspectionPage() {
  return <InspectionPage defaultType="Incoming" description="Supplier receipt inspection with hold/release and NCR signals." title="Incoming Inspection" />;
}

export function InProcessInspectionPage() {
  return <InspectionPage defaultType="InProcess" description="Checkpoint results against operation or job-card execution." title="In-Process Inspection" />;
}

export function FinalInspectionPage() {
  return <InspectionPage defaultType="Final" description="Final quality release before dispatch or finished-goods transfer." title="Final Inspection" />;
}

const ncrColumns: DataGridColumn<NonConformanceItem>[] = [
  { key: "ncr", header: "NCR", width: "16%", render: (record) => <strong>{record.ncrNo}</strong> },
  { key: "source", header: "Source", width: "18%", render: (record) => record.sourceDocument },
  { key: "trace", header: "Trace", width: "16%", render: (record) => record.traceLabel },
  { key: "disposition", header: "Disposition", width: "14%", render: (record) => record.disposition },
  { key: "rework", header: "Rework", width: "14%", render: (record) => record.reworkLink },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function NcrDeviationPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useQualityFilter(search, status);
  const query = useApiQuery(
    queryKeys.quality.nonConformances(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listNonConformances(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New NCR", reason: "NCR creation requires quality workflow enablement." }]} secondary={[{ disabled: true, label: "Export NCR", reason: "NCR export is pending the approved reporting workflow." }]} testId="ncr-action-bar" /></>} description="Non-conformance, hold, decision, and rework linkage for quality and plant review." filters={<FilterBar><input aria-label="Search NCR deviations" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search NCR, source, trace, disposition" value={search} /><select aria-label="NCR status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="Closed">Closed</option><option value="Rework">Rework</option></select></FilterBar>} title="NCR / Deviation">
      <KpiStrip items={[{ label: "NCRs", value: String(records.length) }, { label: "Open", value: String(records.filter((record) => record.status.toLowerCase().includes("open")).length) }, { label: "Rework linked", value: String(records.filter((record) => !record.reworkLink.includes("No")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="NCR register" description="Rework links are references; no destructive quality reset occurs from this page.">
          <DataGrid ariaLabel="NCR deviation list" columns={ncrColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.ncrNo} ncr`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="NCR detail is review-only until quality disposition workflow is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save NCR", reason: "NCR save requires quality workflow enablement." }]} secondary={[{ disabled: true, label: "Release disposition", reason: "Disposition release requires quality approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.ncrNo ?? "NCR"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="NCR controls" description={selected.remarks}><label><span>Root cause</span><input defaultValue={selected.rootCause} /></label><ErpLookupField disabled disabledReason="Disposition is controlled by quality disposition rules." label="Disposition" onChange={() => undefined} options={[{ label: selected.disposition, value: selected.disposition }]} value={selected.disposition} /><label><span>Rework link</span><input defaultValue={selected.reworkLink} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}
