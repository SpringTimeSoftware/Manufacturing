import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { apiClient } from "../api/http";
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
  return <Badge tone={tone}>{source === "Live" ? "Live records" : "Review mode"}</Badge>;
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
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");

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
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionTone, setActionTone] = useState<"success" | "warn" | "danger" | "info">("info");
  const { deferredSearch, filter } = useQualityFilter(search, status, defaultType);
  const query = useApiQuery(
    queryKeys.quality.inspections(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status, defaultType),
    () => listInspections(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");
  const canRelease = selected?.status.toLowerCase().includes("hold") || selected?.overallResult.toLowerCase().includes("fail");
  const canHold = selected ? !selected.status.toLowerCase().includes("hold") && !selected.status.toLowerCase().includes("release") : false;
  const liveDecisionReason = !selected
    ? "Open an inspection before posting a quality decision."
    : !hasLiveSession(session)
      ? "Live quality sign-in is required before posting inspection hold or release."
      : undefined;
  const decisionMutation = useApiMutation(
    async (action: "hold" | "release") => {
      if (!selected) {
        throw new Error("Open an inspection before posting a quality decision.");
      }

      const body = { notes: decisionNotes || null };
      return action === "hold"
        ? apiClient.quality.holdInspection(selected.inspectionId, body)
        : apiClient.quality.releaseInspection(selected.inspectionId, body);
    },
    {
      onSuccess: async (result, action) => {
        setActionTone("success");
        setActionMessage(action === "hold" ? "Inspection hold applied." : `Inspection released.${result.status ? ` Current status: ${result.status}.` : ""}`);
        await query.refetch();
      },
      onError: (error) => {
        setActionTone("danger");
        setActionMessage(error.message);
      }
    }
  );

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
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save inspection", reason: "Inspection result entry requires mobile execution workflow enablement; hold and release decisions are available here." }]} secondary={[
          { disabled: Boolean(liveDecisionReason) || !canHold || decisionMutation.isPending, label: decisionMutation.isPending ? "Applying hold" : "Apply hold", onClick: liveDecisionReason || !canHold ? undefined : () => decisionMutation.mutate("hold"), reason: canHold ? liveDecisionReason : "Only open inspections can be placed on hold." },
          { disabled: Boolean(liveDecisionReason) || !canRelease || decisionMutation.isPending, label: decisionMutation.isPending ? "Releasing hold" : "Release hold", onClick: liveDecisionReason || !canRelease ? undefined : () => decisionMutation.mutate("release"), reason: canRelease ? liveDecisionReason : "Only held or failed inspections can be released from this action." },
          { label: "Open NCR", onClick: () => navigate(`/quality/ncr?inspection=${encodeURIComponent(selected?.inspectionNo ?? "")}`) },
          { label: "Open source", onClick: () => navigate(`/production/job-cards?source=${encodeURIComponent(selected?.sourceDocument ?? "")}`) }
        ]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        statusMeta={actionMessage ? <Badge tone={actionTone}>{actionMessage}</Badge> : null}
        title={selected?.inspectionNo ?? title}
      >
        {selected ? (
          <>
            <KpiStrip items={[{ label: "Type", value: selected.inspectionType }, { label: "Result", value: selected.overallResult }, { label: "Hold/release", value: selected.heldReleasedSignal }]} />
            <Card title="Parameter results" description={selected.notes}>
              <DataGrid ariaLabel="Inspection result lines" columns={resultColumns} getRowId={(record) => record.id} records={selected.results} rowLabel={(record) => `${record.parameterCode} result`} />
            </Card>
            <FormShell initialFingerprint={selected.id} title="Inspection controls"><ErpLookupField disabled disabledReason="Source document is controlled by receipt, job-card, or dispatch context." label="Source" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} /><ErpLookupField disabled disabledReason="Trace selection is controlled by inventory and production traceability." label="Trace" onChange={() => undefined} options={[{ label: selected.traceLabel, value: selected.traceLabel }]} value={selected.traceLabel} /><label className="form-span-2"><span>Decision notes</span><input disabled={!hasLiveSession(session)} onChange={(event) => setDecisionNotes(event.target.value)} value={decisionNotes} /></label></FormShell>
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
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [closeRemarks, setCloseRemarks] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionTone, setActionTone] = useState<"success" | "warn" | "danger" | "info">("info");
  const { deferredSearch, filter } = useQualityFilter(search, status);
  const query = useApiQuery(
    queryKeys.quality.nonConformances(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listNonConformances(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");
  const closeReason = !selected
    ? "Open an NCR before closing it."
    : !hasLiveSession(session)
      ? "Live quality sign-in is required before closing NCR records."
      : selected.status.toLowerCase().includes("closed")
        ? "Closed NCR records cannot be closed again."
        : undefined;
  const closeMutation = useApiMutation(
    async (_: void) => {
      if (!selected) {
        throw new Error("Open an NCR before closing it.");
      }

      return apiClient.quality.closeNonConformance(selected.ncrId, { remarks: closeRemarks || null });
    },
    {
      onSuccess: async (result) => {
        setActionTone("success");
        setActionMessage(`NCR closed.${result.status ? ` Current status: ${result.status}.` : ""}`);
        await query.refetch();
      },
      onError: (error) => {
        setActionTone("danger");
        setActionMessage(error.message);
      }
    }
  );

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New NCR", reason: "NCR creation requires quality workflow enablement." }]} secondary={[{ disabled: true, label: "Export NCR", reason: "NCR export is pending the approved reporting workflow." }]} testId="ncr-action-bar" /></>} description="Non-conformance, hold, decision, and rework linkage for quality and plant review." filters={<FilterBar><input aria-label="Search NCR deviations" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search NCR, source, trace, disposition" value={search} /><select aria-label="NCR status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="Closed">Closed</option><option value="Rework">Rework</option></select></FilterBar>} title="NCR / Deviation">
      <KpiStrip items={[{ label: "NCRs", value: String(records.length) }, { label: "Open", value: String(records.filter((record) => record.status.toLowerCase().includes("open")).length) }, { label: "Rework linked", value: String(records.filter((record) => !record.reworkLink.includes("No")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="NCR register" description="Disposition and rework links remain visible for quality review.">
          <DataGrid ariaLabel="NCR deviation list" columns={ncrColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.ncrNo} ncr`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="NCR detail is review-only until quality disposition workflow is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save NCR", reason: "NCR field editing requires quality disposition workflow enablement; close is available for live open NCRs." }]} secondary={[
          { disabled: Boolean(closeReason) || closeMutation.isPending, label: closeMutation.isPending ? "Closing NCR" : "Close NCR", onClick: closeReason ? undefined : () => closeMutation.mutate(undefined), reason: closeReason },
          { disabled: true, label: "Release disposition", reason: "Disposition release requires quality approval workflow." },
          { label: "Open rework", onClick: () => navigate(`/production/rework-orders?ncr=${encodeURIComponent(selected?.ncrNo ?? "")}`) },
          { label: "Open source", onClick: () => navigate(`/quality/in-process-inspections?source=${encodeURIComponent(selected?.sourceDocument ?? "")}`) }
        ]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        statusMeta={actionMessage ? <Badge tone={actionTone}>{actionMessage}</Badge> : null}
        title={selected?.ncrNo ?? "NCR"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="NCR controls" description={selected.remarks}><label><span>Root cause</span><input disabled defaultValue={selected.rootCause} /></label><ErpLookupField disabled disabledReason="Disposition is controlled by quality disposition rules." label="Disposition" onChange={() => undefined} options={[{ label: selected.disposition, value: selected.disposition }]} value={selected.disposition} /><ErpLookupField disabled disabledReason="Rework link is controlled by the rework order workflow." label="Rework link" onChange={() => undefined} options={[{ label: selected.reworkLink, value: selected.reworkLink }]} value={selected.reworkLink} /><label className="form-span-2"><span>Close remarks</span><input disabled={!hasLiveSession(session)} onChange={(event) => setCloseRemarks(event.target.value)} value={closeRemarks} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}
