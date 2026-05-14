import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { InspectionSaveRequest } from "../api/contracts";
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
import { ErpActionBar, ErpLookupField, ErpModalWorkspace, ErpNumberField, ErpTransactionLineGrid, ErpValidationSummary } from "../ui/ErpComponents";
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

interface InspectionResultDraft {
  lineNo: number;
  parameterCode: string;
  expectedValue: string;
  actualValue: string;
  resultStatus: string;
  remarks: string;
}

interface InspectionDraft {
  inspectionNo: string;
  inspectionPlanId: number | null;
  inspectionType: string;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  lotId: number | null;
  serialId: number | null;
  overallResult: string;
  requestToken: string;
  notes: string;
  autoCreateNcr: boolean;
  ncrNo: string;
  ncrDisposition: string;
  ncrRootCause: string;
  results: InspectionResultDraft[];
}

const inspectionTypeOptions = ["Incoming", "InProcess", "Final"].map(toOption);
const sourceDocumentOptions = ["GoodsReceipt", "JobCard", "ProductionReceipt", "Shipment", "Manual"].map(toOption);
const resultStatusOptions = ["Pass", "Fail", "Hold", "NotApplicable"].map(toOption);
const overallResultOptions = ["Pass", "Fail", "Hold"].map(toOption);
const ncrDispositionOptions = ["Hold", "Reject", "Rework", "UseAsIs", "ReturnToSupplier"].map(toOption);

function toOption(value: string) {
  return { label: value, value };
}

function todayStamp() {
  return Date.now().toString().slice(-6);
}

function numberValue(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function buildInspectionResultDraft(lineNo: number): InspectionResultDraft {
  return {
    lineNo,
    parameterCode: lineNo === 10 ? "VISUAL" : "",
    expectedValue: "",
    actualValue: "",
    resultStatus: "Pass",
    remarks: ""
  };
}

function buildInspectionDraft(defaultType: string): InspectionDraft {
  const suffix = todayStamp();
  return {
    inspectionNo: `INSP-${defaultType.toUpperCase().slice(0, 2)}-${suffix}`,
    inspectionPlanId: null,
    inspectionType: defaultType,
    sourceDocumentType: defaultType === "Incoming" ? "GoodsReceipt" : defaultType === "Final" ? "ProductionReceipt" : "JobCard",
    sourceDocumentId: null,
    lotId: null,
    serialId: null,
    overallResult: "Pass",
    requestToken: `quality-${defaultType.toLowerCase()}-${suffix}`,
    notes: "",
    autoCreateNcr: false,
    ncrNo: `NCR-${suffix}`,
    ncrDisposition: "Hold",
    ncrRootCause: "",
    results: [buildInspectionResultDraft(10)]
  };
}

function renumberInspectionResults(results: InspectionResultDraft[]) {
  return results.map((result, index) => ({ ...result, lineNo: (index + 1) * 10 }));
}

function inspectionDraftErrors(draft: InspectionDraft | null) {
  if (!draft) {
    return [];
  }

  const errors: string[] = [];
  if (!draft.inspectionNo.trim()) {
    errors.push("Inspection number is required.");
  }
  if (!draft.inspectionType.trim()) {
    errors.push("Inspection type is required.");
  }
  if (!draft.sourceDocumentType.trim()) {
    errors.push("Source document type is required.");
  }
  if (draft.results.length === 0) {
    errors.push("At least one inspection parameter line is required.");
  }

  draft.results.forEach((result, index) => {
    if (!result.parameterCode.trim()) {
      errors.push(`Line ${index + 1} parameter code is required.`);
    }
    if (!result.resultStatus.trim()) {
      errors.push(`Line ${index + 1} result status is required.`);
    }
  });

  if (draft.autoCreateNcr && !draft.ncrNo.trim()) {
    errors.push("NCR number is required when auto-create NCR is selected.");
  }

  return errors;
}

function buildInspectionSaveRequest(draft: InspectionDraft, companyId: number, branchId: number): InspectionSaveRequest {
  return {
    companyId,
    branchId,
    inspectionNo: draft.inspectionNo,
    inspectionPlanId: draft.inspectionPlanId,
    inspectionType: draft.inspectionType,
    sourceDocumentType: draft.sourceDocumentType,
    sourceDocumentId: draft.sourceDocumentId,
    lotId: draft.lotId,
    serialId: draft.serialId,
    requestToken: draft.requestToken || null,
    notes: draft.notes || null,
    overallResult: draft.overallResult,
    autoCreateNcr: draft.autoCreateNcr,
    ncrNo: draft.autoCreateNcr ? draft.ncrNo : null,
    ncrDisposition: draft.autoCreateNcr ? draft.ncrDisposition : null,
    ncrRootCause: draft.autoCreateNcr ? draft.ncrRootCause || null : null,
    results: renumberInspectionResults(draft.results).map((result) => ({
      lineNo: result.lineNo,
      parameterCode: result.parameterCode,
      expectedValue: result.expectedValue || null,
      actualValue: result.actualValue || null,
      resultStatus: result.resultStatus,
      remarks: result.remarks || null
    }))
  };
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
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectionDraft, setInspectionDraft] = useState<InspectionDraft | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionTone, setActionTone] = useState<"success" | "warn" | "danger" | "info">("info");
  const { deferredSearch, filter } = useQualityFilter(search, status, defaultType);
  const query = useApiQuery(
    queryKeys.quality.inspections(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status, defaultType),
    () => listInspections(session, filter),
    { staleTime: 60_000 }
  );
  const plansQuery = useApiQuery(
    queryKeys.quality.inspectionPlans(companyId, "", "Active", defaultType),
    () => apiClient.quality.inspectionPlans({ companyId, inspectionType: defaultType, status: "Active" }),
    { enabled: live && companyId > 0, staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const planOptions = (plansQuery.data?.items ?? []).map((plan) => ({ label: `${plan.planCode} / ${plan.planName}`, value: String(plan.id) }));
  const draftErrors = inspectionDraftErrors(inspectionDraft);
  const canRelease = selected?.status.toLowerCase().includes("hold") || selected?.overallResult.toLowerCase().includes("fail");
  const canHold = selected ? !selected.status.toLowerCase().includes("hold") && !selected.status.toLowerCase().includes("release") : false;
  const liveDecisionReason = !selected
    ? "Open an inspection before posting a quality decision."
    : !live
      ? "Live quality sign-in is required before posting inspection hold or release."
      : undefined;
  const saveInspectionReason = !inspectionDraft
    ? "Open an inspection draft before saving."
    : !live
      ? "Live quality sign-in is required before saving inspections."
      : draftErrors.length > 0
        ? "Resolve inspection validation issues before saving."
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
  const saveInspection = useApiMutation(
    (request: InspectionSaveRequest) => apiClient.quality.saveInspection(request),
    {
      onSuccess: async (record) => {
        setActionTone("success");
        setActionMessage(`Saved inspection ${record.inspectionNo}.`);
        setInspectionDraft(null);
        await query.refetch();
      },
      onError: (error) => {
        setActionTone("danger");
        setActionMessage(error.message);
      }
    }
  );

  const updateDraftLine = (index: number, patch: Partial<InspectionResultDraft>) => {
    setInspectionDraft((current) =>
      current
        ? {
            ...current,
            results: current.results.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line))
          }
        : current
    );
  };

  const addDraftLine = () => {
    setInspectionDraft((current) =>
      current ? { ...current, results: [...current.results, buildInspectionResultDraft((current.results.length + 1) * 10)] } : current
    );
  };

  const removeDraftLine = (index: number) => {
    setInspectionDraft((current) =>
      current
        ? {
            ...current,
            results: renumberInspectionResults(current.results.filter((_, lineIndex) => lineIndex !== index))
          }
        : current
    );
  };

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "New inspection", onClick: () => { setActionMessage(null); setInspectionDraft(buildInspectionDraft(defaultType)); } }]} secondary={[{ disabled: true, label: "Export inspections", reason: "Inspection export is pending the approved reporting workflow." }]} testId="inspection-action-bar" /></>} description={description} filters={<FilterBar><input aria-label={`Search ${title}`} onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search inspection, source, trace" value={search} /><select aria-label={`${title} status`} onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="Hold">Hold</option><option value="Released">Released</option></select></FilterBar>} title={title}>
      <KpiStrip items={[{ label: "Inspections", value: String(records.length) }, { label: "Fail/Hold", value: String(records.filter((record) => record.overallResult.toLowerCase().includes("fail") || record.status.toLowerCase().includes("hold")).length) }, { label: "Released", value: String(records.filter((record) => record.status.toLowerCase().includes("release")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {query.error ? <Card title="Live quality data unavailable" description={query.error.message} /> : null}
        {actionMessage ? <Badge tone={actionTone}>{actionMessage}</Badge> : null}
        <Card title="Inspection queue" description="Open an inspection to review parameter results and hold/release context.">
          <DataGrid ariaLabel={`${title} list`} columns={inspectionColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.inspectionNo} inspection`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Capture inspection parameters, result status, source trace context, and optional NCR creation."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveInspectionReason) || saveInspection.isPending, label: saveInspection.isPending ? "Saving inspection" : "Save inspection", onClick: inspectionDraft && !saveInspectionReason ? () => saveInspection.mutate(buildInspectionSaveRequest(inspectionDraft, companyId, branchId)) : undefined, reason: saveInspectionReason }]} secondary={[{ disabled: !live, label: "Add Line", onClick: live ? addDraftLine : undefined, reason: live ? undefined : "Live quality sign-in is required before adding inspection lines." }]} utility={[{ label: "Close", onClick: () => setInspectionDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(inspectionDraft)}
        onClose={() => setInspectionDraft(null)}
        title={inspectionDraft?.inspectionNo ?? "Inspection draft"}
        validation={<ErpValidationSummary errors={draftErrors} />}
      >
        {inspectionDraft ? (
          <div className="modal-form-grid">
            <FormShell initialFingerprint={`${inspectionDraft.inspectionNo}-header`} title="Inspection controls">
              <label><span>Inspection number</span><input aria-label="Inspection number" disabled={!live} onChange={(event) => setInspectionDraft({ ...inspectionDraft, inspectionNo: event.target.value })} value={inspectionDraft.inspectionNo} /></label>
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before changing inspection type."} label="Inspection type" onChange={(value) => setInspectionDraft({ ...inspectionDraft, inspectionType: value })} options={inspectionTypeOptions} required value={inspectionDraft.inspectionType} />
              <ErpLookupField disabled={!live || plansQuery.isLoading} disabledReason={!live ? "Live quality sign-in is required before selecting a QC plan." : plansQuery.isLoading ? "QC plan list is loading." : undefined} label="QC plan" onChange={(value) => setInspectionDraft({ ...inspectionDraft, inspectionPlanId: numberValue(value) })} options={[{ label: "No plan selected", value: "" }, ...planOptions]} value={inspectionDraft.inspectionPlanId ? String(inspectionDraft.inspectionPlanId) : ""} />
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before changing source type."} label="Source type" onChange={(value) => setInspectionDraft({ ...inspectionDraft, sourceDocumentType: value })} options={sourceDocumentOptions} required value={inspectionDraft.sourceDocumentType} />
              <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before assigning source id."} label="Source document id" min={1} onChange={(value) => setInspectionDraft({ ...inspectionDraft, sourceDocumentId: value })} value={inspectionDraft.sourceDocumentId} />
              <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before assigning lot id."} label="Lot id" min={1} onChange={(value) => setInspectionDraft({ ...inspectionDraft, lotId: value })} value={inspectionDraft.lotId} />
              <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before assigning serial id."} label="Serial id" min={1} onChange={(value) => setInspectionDraft({ ...inspectionDraft, serialId: value })} value={inspectionDraft.serialId} />
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before changing overall result."} label="Overall result" onChange={(value) => setInspectionDraft({ ...inspectionDraft, overallResult: value })} options={overallResultOptions} required value={inspectionDraft.overallResult} />
              <label className="form-span-2"><span>Notes</span><input aria-label="Inspection notes" disabled={!live} onChange={(event) => setInspectionDraft({ ...inspectionDraft, notes: event.target.value })} value={inspectionDraft.notes} /></label>
            </FormShell>
            <FormShell initialFingerprint={`${inspectionDraft.inspectionNo}-ncr`} title="NCR and disposition">
              <label className="form-checkbox"><input checked={inspectionDraft.autoCreateNcr} disabled={!live} onChange={(event) => setInspectionDraft({ ...inspectionDraft, autoCreateNcr: event.target.checked })} type="checkbox" /><span>Create NCR on failed or held result</span></label>
              <label><span>NCR number</span><input aria-label="NCR number" disabled={!live || !inspectionDraft.autoCreateNcr} onChange={(event) => setInspectionDraft({ ...inspectionDraft, ncrNo: event.target.value })} value={inspectionDraft.ncrNo} /></label>
              <ErpLookupField disabled={!live || !inspectionDraft.autoCreateNcr} disabledReason={!inspectionDraft.autoCreateNcr ? "NCR disposition is only used when NCR creation is selected." : live ? undefined : "Live quality sign-in is required before changing NCR disposition."} label="NCR disposition" onChange={(value) => setInspectionDraft({ ...inspectionDraft, ncrDisposition: value })} options={ncrDispositionOptions} value={inspectionDraft.ncrDisposition} />
              <label className="form-span-2"><span>Root cause</span><input aria-label="NCR root cause" disabled={!live || !inspectionDraft.autoCreateNcr} onChange={(event) => setInspectionDraft({ ...inspectionDraft, ncrRootCause: event.target.value })} value={inspectionDraft.ncrRootCause} /></label>
            </FormShell>
            <Card title="Parameter results" description="Add one row per inspection parameter. Failed or held rows can automatically create an NCR.">
              <ErpTransactionLineGrid
                addDisabled={!live}
                addDisabledReason="Live quality sign-in is required before adding inspection lines."
                addLabel="Add Line"
                ariaLabel="Inspection result line grid"
                columns={[
                  { key: "line", header: "Line", width: "72px", render: (result) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={result.lineNo} /> },
                  { key: "parameter", header: "Parameter", width: "160px", render: (result, index) => <label><span>Parameter code</span><input aria-label={`Parameter code ${index + 1}`} disabled={!live} onChange={(event) => updateDraftLine(index, { parameterCode: event.target.value })} value={result.parameterCode} /></label> },
                  { key: "expected", header: "Expected", width: "150px", render: (result, index) => <label><span>Expected value</span><input aria-label={`Expected value ${index + 1}`} disabled={!live} onChange={(event) => updateDraftLine(index, { expectedValue: event.target.value })} value={result.expectedValue} /></label> },
                  { key: "actual", header: "Actual", width: "150px", render: (result, index) => <label><span>Actual value</span><input aria-label={`Actual value ${index + 1}`} disabled={!live} onChange={(event) => updateDraftLine(index, { actualValue: event.target.value })} value={result.actualValue} /></label> },
                  { key: "status", header: "Status", width: "150px", render: (result, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before changing result status."} label={`Result status ${index + 1}`} onChange={(value) => updateDraftLine(index, { resultStatus: value })} options={resultStatusOptions} required value={result.resultStatus} /> },
                  { key: "remarks", header: "Remarks", width: "180px", render: (result, index) => <label><span>Remarks</span><input aria-label={`Inspection remarks ${index + 1}`} disabled={!live} onChange={(event) => updateDraftLine(index, { remarks: event.target.value })} value={result.remarks} /></label> },
                  { key: "actions", header: "Actions", width: "150px", render: (_result, index) => <ErpActionBar danger={[{ disabled: !live || inspectionDraft.results.length <= 1, label: "Remove Line", onClick: live && inspectionDraft.results.length > 1 ? () => removeDraftLine(index) : undefined, reason: !live ? "Live quality sign-in is required before removing lines." : inspectionDraft.results.length <= 1 ? "At least one inspection line is required." : undefined }]} /> }
                ]}
                getRowId={(result, index) => `${result.lineNo}-${index}`}
                lines={inspectionDraft.results}
                onAddLine={addDraftLine}
                testId="inspection-result-line-grid"
              />
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Review saved inspection results, hold/release decisions, trace context, and related NCR handoff."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Edit inspection", reason: "Saved inspection correction requires an approved quality change-control reason." }]} secondary={[
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
            <FormShell initialFingerprint={selected.id} title="Inspection controls"><ErpLookupField disabled disabledReason="Source document is controlled by receipt, job-card, or dispatch context." label="Source" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} /><ErpLookupField disabled disabledReason="Trace selection is controlled by inventory and production traceability." label="Trace" onChange={() => undefined} options={[{ label: selected.traceLabel, value: selected.traceLabel }]} value={selected.traceLabel} /><label className="form-span-2"><span>Decision notes</span><input disabled={!live} onChange={(event) => setDecisionNotes(event.target.value)} value={decisionNotes} /></label></FormShell>
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
