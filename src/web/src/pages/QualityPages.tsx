import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  CoaGenerateRequest,
  InspectionPlanUpsertRequest,
  InspectionSaveRequest,
  NonConformanceDispositionRequest,
  NonConformanceUpsertRequest
} from "../api/contracts";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { apiClient } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import {
  listInspections,
  listCoaCertificates,
  listNonConformances,
  type CoaCertificateItem,
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

interface PlanCharacteristicDraft {
  lineNo: number;
  parameterCode: string;
  parameterName: string;
  characteristicType: string;
  expectedValue: string;
  lowerLimit: number | null;
  upperLimit: number | null;
  uomId: number | null;
  sampleSize: number;
  isMandatory: boolean;
  status: string;
  remarks: string;
}

interface PlanDraft {
  planId: number | null;
  planCode: string;
  planName: string;
  inspectionType: string;
  itemId: number | null;
  operationId: number | null;
  autoHoldOnFail: boolean;
  autoCreateNcrOnFail: boolean;
  status: string;
  characteristics: PlanCharacteristicDraft[];
}

interface NcrLineDraft {
  lineNo: number;
  itemId: number | null;
  itemRevisionId: number | null;
  lotId: number | null;
  serialId: number | null;
  affectedQuantity: number | null;
  uomId: number | null;
  defectCode: string;
  defectDescription: string;
  disposition: string;
  remarks: string;
}

interface NcrDraft {
  ncrId: number | null;
  ncrNo: string;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  lotId: number | null;
  serialId: number | null;
  disposition: string;
  status: string;
  defectCategory: string;
  containmentAction: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  reworkOrderId: number | null;
  remarks: string;
  lines: NcrLineDraft[];
}

interface CoaDraft {
  inspectionRecordId: number | null;
  coaNo: string;
  templateCode: string;
  issueImmediately: boolean;
}

const inspectionTypeOptions = ["Incoming", "InProcess", "Final"].map(toOption);
const sourceDocumentOptions = ["GoodsReceipt", "JobCard", "ProductionReceipt", "Shipment", "Manual"].map(toOption);
const resultStatusOptions = ["Pass", "Fail", "Hold", "NotApplicable"].map(toOption);
const overallResultOptions = ["Pass", "Fail", "Hold"].map(toOption);
const characteristicTypeOptions = ["Numeric", "Text", "Attribute", "Boolean"].map(toOption);
const ncrDispositionOptions = ["Hold", "Release", "Reject", "Rework", "UseAsIs", "ReturnToSupplier", "Scrap"].map(toOption);
const ncrStatusOptions = ["Open", "InReview", "DispositionReleased", "Closed"].map(toOption);
const coaTemplateOptions = ["COA-FINAL-STD", "COA-CUSTOMER", "COA-EXPORT"].map(toOption);

function toOption(value: string) {
  return { label: value, value };
}

function todayStamp() {
  return Date.now().toString().slice(-6);
}

function downloadGeneratedOutput(output: { blob: Blob; contentDisposition: string | null }, fallbackName: string) {
  const dispositionName = output.contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];
  const fileName = dispositionName ?? fallbackName;
  const href = URL.createObjectURL(output.blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(href);
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

function buildPlanCharacteristicDraft(lineNo: number): PlanCharacteristicDraft {
  return {
    lineNo,
    parameterCode: lineNo === 10 ? "VISUAL" : "",
    parameterName: lineNo === 10 ? "Visual check" : "",
    characteristicType: "Attribute",
    expectedValue: "",
    lowerLimit: null,
    upperLimit: null,
    uomId: null,
    sampleSize: 1,
    isMandatory: true,
    status: "Active",
    remarks: ""
  };
}

function buildPlanDraft(defaultType = "Incoming", record?: QualityPlanItem): PlanDraft {
  if (record) {
    return {
      planId: record.planId,
      planCode: record.planCode,
      planName: record.planName,
      inspectionType: record.inspectionType,
      itemId: record.itemId,
      operationId: record.operationId,
      autoHoldOnFail: record.autoHoldSignal.includes("Auto"),
      autoCreateNcrOnFail: record.autoNcrSignal.includes("Auto"),
      status: record.status,
      characteristics: record.characteristics.map((line) => ({
        lineNo: line.lineNo,
        parameterCode: line.parameterCode,
        parameterName: line.parameterName,
        characteristicType: line.characteristicType,
        expectedValue: line.expectedValue,
        lowerLimit: line.lowerLimit,
        upperLimit: line.upperLimit,
        uomId: line.uomId,
        sampleSize: line.sampleSize,
        isMandatory: line.isMandatory,
        status: line.status,
        remarks: line.remarks
      }))
    };
  }

  return {
    planId: null,
    planCode: `QC-${defaultType.toUpperCase().slice(0, 2)}-${todayStamp()}`,
    planName: `${defaultType} inspection plan`,
    inspectionType: defaultType,
    itemId: null,
    operationId: null,
    autoHoldOnFail: true,
    autoCreateNcrOnFail: true,
    status: "Active",
    characteristics: [buildPlanCharacteristicDraft(10)]
  };
}

function buildPlanRequest(draft: PlanDraft, companyId: number): InspectionPlanUpsertRequest {
  return {
    companyId,
    planCode: draft.planCode,
    planName: draft.planName,
    inspectionType: draft.inspectionType,
    itemId: draft.itemId,
    operationId: draft.operationId,
    autoHoldOnFail: draft.autoHoldOnFail,
    autoCreateNcrOnFail: draft.autoCreateNcrOnFail,
    status: draft.status,
    itemCode: null,
    characteristics: draft.characteristics.map((line, index) => ({
      lineNo: (index + 1) * 10,
      parameterCode: line.parameterCode,
      parameterName: line.parameterName,
      characteristicType: line.characteristicType,
      expectedValue: line.expectedValue || null,
      lowerLimit: line.lowerLimit,
      upperLimit: line.upperLimit,
      uomId: line.uomId,
      sampleSize: line.sampleSize,
      isMandatory: line.isMandatory,
      status: line.status,
      remarks: line.remarks || null
    }))
  };
}

function planDraftErrors(draft: PlanDraft | null) {
  if (!draft) {
    return [];
  }

  const errors: string[] = [];
  if (!draft.planCode.trim()) errors.push("Plan code is required.");
  if (!draft.planName.trim()) errors.push("Plan name is required.");
  if (!draft.inspectionType.trim()) errors.push("Inspection type is required.");
  if (draft.characteristics.length === 0) errors.push("At least one plan characteristic is required.");
  draft.characteristics.forEach((line, index) => {
    if (!line.parameterCode.trim()) errors.push(`Characteristic ${index + 1} parameter code is required.`);
    if (!line.parameterName.trim()) errors.push(`Characteristic ${index + 1} parameter name is required.`);
    if (line.sampleSize <= 0) errors.push(`Characteristic ${index + 1} sample size must be positive.`);
  });
  return errors;
}

function buildNcrLineDraft(lineNo: number): NcrLineDraft {
  return {
    lineNo,
    itemId: null,
    itemRevisionId: null,
    lotId: null,
    serialId: null,
    affectedQuantity: 1,
    uomId: null,
    defectCode: lineNo === 10 ? "DEFECT" : "",
    defectDescription: "",
    disposition: "Hold",
    remarks: ""
  };
}

function buildNcrDraft(record?: NonConformanceItem): NcrDraft {
  if (record) {
    return {
      ncrId: record.ncrId,
      ncrNo: record.ncrNo,
      sourceDocumentType: record.sourceDocument.split(" ")[0] || "Inspection",
      sourceDocumentId: numberValue(record.sourceDocument.split(" ").at(-1) ?? ""),
      lotId: null,
      serialId: null,
      disposition: record.disposition,
      status: record.status,
      defectCategory: record.defectCategory,
      containmentAction: record.containmentAction,
      rootCause: record.rootCause === "Pending RCA" ? "" : record.rootCause,
      correctiveAction: record.correctiveAction === "Pending corrective action" ? "" : record.correctiveAction,
      preventiveAction: record.preventiveAction === "Pending preventive action" ? "" : record.preventiveAction,
      reworkOrderId: null,
      remarks: record.remarks === "No remarks" ? "" : record.remarks,
      lines: record.lines.map((line) => ({
        lineNo: line.lineNo,
        itemId: line.itemId,
        itemRevisionId: line.itemRevisionId,
        lotId: line.lotId,
        serialId: line.serialId,
        affectedQuantity: line.affectedQuantity,
        uomId: line.uomId,
        defectCode: line.defectCode,
        defectDescription: line.defectDescription,
        disposition: line.disposition,
        remarks: line.remarks
      }))
    };
  }

  return {
    ncrId: null,
    ncrNo: `NCR-${todayStamp()}`,
    sourceDocumentType: "Inspection",
    sourceDocumentId: null,
    lotId: null,
    serialId: null,
    disposition: "Hold",
    status: "Open",
    defectCategory: "Inspection failure",
    containmentAction: "",
    rootCause: "",
    correctiveAction: "",
    preventiveAction: "",
    reworkOrderId: null,
    remarks: "",
    lines: [buildNcrLineDraft(10)]
  };
}

function buildNcrRequest(draft: NcrDraft, companyId: number, branchId: number): NonConformanceUpsertRequest {
  return {
    companyId,
    branchId,
    ncrNo: draft.ncrNo,
    sourceDocumentType: draft.sourceDocumentType,
    sourceDocumentId: draft.sourceDocumentId,
    lotId: draft.lotId,
    serialId: draft.serialId,
    disposition: draft.disposition,
    status: draft.status,
    defectCategory: draft.defectCategory || null,
    containmentAction: draft.containmentAction || null,
    rootCause: draft.rootCause || null,
    correctiveAction: draft.correctiveAction || null,
    preventiveAction: draft.preventiveAction || null,
    reworkOrderId: draft.reworkOrderId,
    remarks: draft.remarks || null,
    lines: draft.lines.map((line, index) => ({
      lineNo: (index + 1) * 10,
      itemId: line.itemId,
      itemRevisionId: line.itemRevisionId,
      lotId: line.lotId,
      serialId: line.serialId,
      affectedQuantity: line.affectedQuantity,
      uomId: line.uomId,
      defectCode: line.defectCode,
      defectDescription: line.defectDescription,
      disposition: line.disposition,
      remarks: line.remarks || null
    }))
  };
}

function ncrDraftErrors(draft: NcrDraft | null) {
  if (!draft) {
    return [];
  }

  const errors: string[] = [];
  if (!draft.ncrNo.trim()) errors.push("NCR number is required.");
  if (!draft.sourceDocumentType.trim()) errors.push("Source document type is required.");
  if (!draft.disposition.trim()) errors.push("Disposition is required.");
  if (draft.lines.length === 0) errors.push("At least one NCR affected line is required.");
  draft.lines.forEach((line, index) => {
    if (!line.defectCode.trim()) errors.push(`NCR line ${index + 1} defect code is required.`);
    if (!line.defectDescription.trim()) errors.push(`NCR line ${index + 1} defect description is required.`);
    if (!line.disposition.trim()) errors.push(`NCR line ${index + 1} disposition is required.`);
    if (line.affectedQuantity !== null && line.affectedQuantity <= 0) errors.push(`NCR line ${index + 1} affected quantity must be positive.`);
  });
  return errors;
}

function buildDispositionRequest(draft: NcrDraft): NonConformanceDispositionRequest {
  return {
    disposition: draft.disposition,
    containmentAction: draft.containmentAction || null,
    rootCause: draft.rootCause || null,
    correctiveAction: draft.correctiveAction || null,
    preventiveAction: draft.preventiveAction || null,
    remarks: draft.remarks || null
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
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [inspectionType, setInspectionType] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useQualityFilter(search, status, inspectionType);
  const query = useApiQuery(
    queryKeys.quality.inspectionPlans(user?.activeContext.companyId, deferredSearch, status, inspectionType),
    () => listQualityPlans(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");
  const errors = planDraftErrors(draft);
  const saveReason = !draft
    ? "Open a QC plan workspace before saving."
    : !live
      ? "Live quality sign-in is required before saving QC plans."
      : errors.length > 0
        ? "Resolve QC plan validation issues before saving."
        : undefined;
  const saveMutation = useApiMutation(
    async (request: InspectionPlanUpsertRequest) => draft?.planId
      ? apiClient.quality.updateInspectionPlan(draft.planId, request)
      : apiClient.quality.createInspectionPlan(request),
    {
      onSuccess: async (record) => {
        setMessage(`Saved QC plan ${record.planCode}.`);
        setDraft(null);
        await query.refetch();
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const updateLine = (index: number, patch: Partial<PlanCharacteristicDraft>) => {
    setDraft((current) => current ? { ...current, characteristics: current.characteristics.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line) } : current);
  };
  const addLine = () => setDraft((current) => current ? { ...current, characteristics: [...current.characteristics, buildPlanCharacteristicDraft((current.characteristics.length + 1) * 10)] } : current);
  const removeLine = (index: number) => setDraft((current) => current ? { ...current, characteristics: current.characteristics.filter((_, lineIndex) => lineIndex !== index).map((line, lineIndex) => ({ ...line, lineNo: (lineIndex + 1) * 10 })) } : current);

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !live, label: "New QC plan", onClick: live ? () => setDraft(buildPlanDraft(inspectionType === "all" ? "Incoming" : inspectionType)) : undefined, reason: live ? undefined : "Live quality sign-in is required before creating QC plans." }]} secondary={[{ disabled: true, label: "Export plans", reason: "QC plan export is pending the approved reporting workflow." }]} testId="qc-plan-action-bar" /></>} description="Inspection checkpoints, parameter libraries, and auto-hold/NCR behavior." filters={<FilterBar><input aria-label="Search QC plans" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search plan, item, parameter" value={search} /><select aria-label="QC plan status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Active">Active</option><option value="Draft">Draft</option></select><select aria-label="QC plan type" onChange={(event) => setInspectionType(event.target.value)} value={inspectionType}><option value="all">Type: Any</option><option value="Incoming">Incoming</option><option value="InProcess">In process</option><option value="Final">Final</option></select></FilterBar>} title="QC Plan Setup">
        <KpiStrip items={[{ label: "Plans", value: String(records.length) }, { label: "Auto hold", value: String(records.filter((record) => record.autoHoldSignal.includes("Auto")).length) }, { label: "Auto NCR", value: String(records.filter((record) => record.autoNcrSignal.includes("Auto")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {message ? <Badge tone={message.startsWith("Saved") ? "success" : "danger"}>{message}</Badge> : null}
        <Card title="Inspection plan library" description="QC plan setup is persisted with editable characteristic lines.">
          <DataGrid ariaLabel="QC plan list" columns={planColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => { setSelectedId(record.id); setDraft(buildPlanDraft(record.inspectionType, record)); }} records={records} rowLabel={(record) => `${record.planCode} qc plan`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Maintain plan header and parameter characteristics used by incoming, in-process, and final inspections."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || saveMutation.isPending, label: saveMutation.isPending ? "Saving QC plan" : "Save QC plan", onClick: draft && !saveReason ? () => saveMutation.mutate(buildPlanRequest(draft, companyId)) : undefined, reason: saveReason }]} secondary={[{ disabled: !live, label: "Add Line", onClick: live ? addLine : undefined, reason: live ? undefined : "Live quality sign-in is required before adding characteristics." }]} utility={[{ label: "Close", onClick: () => { setDraft(null); setSelectedId(null); }, variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => { setDraft(null); setSelectedId(null); }}
        title={draft?.planCode ?? selected?.planCode ?? "QC plan"}
        validation={<ErpValidationSummary errors={errors} />}
      >
        {draft ? <div className="modal-form-grid">
          <FormShell initialFingerprint={`${draft.planCode}-header`} title="Plan controls">
            <label><span>Plan code</span><input aria-label="Plan code" disabled={!live} onChange={(event) => setDraft({ ...draft, planCode: event.target.value })} value={draft.planCode} /></label>
            <label><span>Plan name</span><input aria-label="Plan name" disabled={!live} onChange={(event) => setDraft({ ...draft, planName: event.target.value })} value={draft.planName} /></label>
            <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before changing inspection type."} label="Inspection type" onChange={(value) => setDraft({ ...draft, inspectionType: value })} options={inspectionTypeOptions} value={draft.inspectionType} />
            <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before changing status."} label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={["Active", "Draft", "Inactive"].map(toOption)} value={draft.status} />
            <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before assigning item."} label="Item id" min={1} onChange={(value) => setDraft({ ...draft, itemId: value })} value={draft.itemId} />
            <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before assigning operation."} label="Operation id" min={1} onChange={(value) => setDraft({ ...draft, operationId: value })} value={draft.operationId} />
            <label className="form-checkbox"><input checked={draft.autoHoldOnFail} disabled={!live} onChange={(event) => setDraft({ ...draft, autoHoldOnFail: event.target.checked })} type="checkbox" /><span>Auto hold on fail</span></label>
            <label className="form-checkbox"><input checked={draft.autoCreateNcrOnFail} disabled={!live} onChange={(event) => setDraft({ ...draft, autoCreateNcrOnFail: event.target.checked })} type="checkbox" /><span>Auto NCR on fail</span></label>
          </FormShell>
          <Card title="Characteristic grid" description="Each characteristic becomes an inspection result line when users record evidence.">
            <ErpTransactionLineGrid
              addDisabled={!live}
              addDisabledReason="Live quality sign-in is required before adding characteristics."
              addLabel="Add Line"
              ariaLabel="QC plan characteristic grid"
              columns={[
                { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                { key: "code", header: "Code", width: "140px", render: (line, index) => <label><span>Parameter code</span><input aria-label={`Plan parameter code ${index + 1}`} disabled={!live} onChange={(event) => updateLine(index, { parameterCode: event.target.value })} value={line.parameterCode} /></label> },
                { key: "name", header: "Name", width: "180px", render: (line, index) => <label><span>Parameter name</span><input aria-label={`Plan parameter name ${index + 1}`} disabled={!live} onChange={(event) => updateLine(index, { parameterName: event.target.value })} value={line.parameterName} /></label> },
                { key: "type", header: "Type", width: "140px", render: (line, index) => <ErpLookupField disabled={!live} label={`Characteristic type ${index + 1}`} onChange={(value) => updateLine(index, { characteristicType: value })} options={characteristicTypeOptions} value={line.characteristicType} /> },
                { key: "expected", header: "Expected", width: "160px", render: (line, index) => <label><span>Expected</span><input aria-label={`Plan expected ${index + 1}`} disabled={!live} onChange={(event) => updateLine(index, { expectedValue: event.target.value })} value={line.expectedValue} /></label> },
                { key: "limits", header: "Limits", width: "220px", render: (line, index) => <div className="grid-two"><ErpNumberField disabled={!live} label={`Lower limit ${index + 1}`} onChange={(value) => updateLine(index, { lowerLimit: value })} value={line.lowerLimit} /><ErpNumberField disabled={!live} label={`Upper limit ${index + 1}`} onChange={(value) => updateLine(index, { upperLimit: value })} value={line.upperLimit} /></div> },
                { key: "sample", header: "Sample", width: "120px", render: (line, index) => <ErpNumberField disabled={!live} label={`Sample size ${index + 1}`} min={1} onChange={(value) => updateLine(index, { sampleSize: value ?? 1 })} value={line.sampleSize} /> },
                { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: !live || draft.characteristics.length <= 1, label: "Remove Line", onClick: live && draft.characteristics.length > 1 ? () => removeLine(index) : undefined, reason: !live ? "Live quality sign-in is required before removing characteristics." : draft.characteristics.length <= 1 ? "At least one characteristic is required." : undefined }]} /> }
              ]}
              getRowId={(line, index) => `${line.lineNo}-${index}`}
              lines={draft.characteristics}
              onAddLine={addLine}
              testId="qc-plan-characteristic-grid"
            />
          </Card>
        </div> : null}
      </ErpModalWorkspace>
    </>
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
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NcrDraft | null>(null);
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
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const draftErrors = ncrDraftErrors(draft);
  const saveReason = !draft
    ? "Open an NCR workspace before saving."
    : !live
      ? "Live quality sign-in is required before saving NCR records."
      : draftErrors.length > 0
        ? "Resolve NCR validation issues before saving."
        : undefined;
  const releaseReason = !draft?.ncrId
    ? "Save the NCR before releasing the disposition."
    : !live
      ? "Live quality sign-in is required before releasing dispositions."
      : draftErrors.length > 0
        ? "Resolve NCR validation issues before releasing the disposition."
        : draft.status.toLowerCase().includes("closed")
          ? "Closed NCR records cannot release a new disposition."
          : undefined;
  const closeReason = !selected
    ? "Open an NCR before closing it."
    : !live
      ? "Live quality sign-in is required before closing NCR records."
      : selected.status.toLowerCase().includes("closed")
        ? "Closed NCR records cannot be closed again."
        : undefined;
  const saveMutation = useApiMutation(
    async (request: NonConformanceUpsertRequest) => draft?.ncrId
      ? apiClient.quality.updateNonConformance(draft.ncrId, request)
      : apiClient.quality.createNonConformance(request),
    {
      onSuccess: async (record) => {
        setActionTone("success");
        setActionMessage(`Saved NCR ${record.ncrNo}.`);
        setDraft(null);
        await query.refetch();
      },
      onError: (error) => {
        setActionTone("danger");
        setActionMessage(error.message);
      }
    }
  );
  const releaseMutation = useApiMutation(
    async (request: NonConformanceDispositionRequest) => {
      if (!draft?.ncrId) {
        throw new Error("Save the NCR before releasing the disposition.");
      }

      return apiClient.quality.releaseNonConformanceDisposition(draft.ncrId, request);
    },
    {
      onSuccess: async (result) => {
        setActionTone("success");
        setActionMessage(`Disposition released.${result.status ? ` Current status: ${result.status}.` : ""}`);
        setDraft(null);
        await query.refetch();
      },
      onError: (error) => {
        setActionTone("danger");
        setActionMessage(error.message);
      }
    }
  );
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
  const updateLine = (index: number, patch: Partial<NcrLineDraft>) => {
    setDraft((current) => current ? { ...current, lines: current.lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line) } : current);
  };
  const addLine = () => setDraft((current) => current ? { ...current, lines: [...current.lines, buildNcrLineDraft((current.lines.length + 1) * 10)] } : current);
  const removeLine = (index: number) => setDraft((current) => current ? { ...current, lines: current.lines.filter((_, lineIndex) => lineIndex !== index).map((line, lineIndex) => ({ ...line, lineNo: (lineIndex + 1) * 10 })) } : current);

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !live, label: "New NCR", onClick: live ? () => { setSelectedId(null); setDraft(buildNcrDraft()); } : undefined, reason: live ? undefined : "Live quality sign-in is required before creating NCR records." }]} secondary={[{ disabled: true, label: "Export NCR", reason: "NCR export is pending the approved reporting workflow." }]} testId="ncr-action-bar" /></>} description="Non-conformance, hold, decision, and rework linkage for quality and plant review." filters={<FilterBar><input aria-label="Search NCR deviations" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search NCR, source, trace, disposition" value={search} /><select aria-label="NCR status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="InReview">In review</option><option value="DispositionReleased">Disposition released</option><option value="Closed">Closed</option></select></FilterBar>} title="NCR / Deviation">
      <KpiStrip items={[{ label: "NCRs", value: String(records.length) }, { label: "Open", value: String(records.filter((record) => record.status.toLowerCase().includes("open")).length) }, { label: "Rework linked", value: String(records.filter((record) => !record.reworkLink.includes("No")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {query.error ? <Card title="Live NCR data unavailable" description={query.error.message} /> : null}
        {actionMessage ? <Badge tone={actionTone}>{actionMessage}</Badge> : null}
        <Card title="NCR register" description="Disposition and rework links remain visible for quality review.">
          <DataGrid ariaLabel="NCR deviation list" columns={ncrColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => { setSelectedId(record.id); setDraft(buildNcrDraft(record)); }} records={records} rowLabel={(record) => `${record.ncrNo} ncr`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Maintain NCR header, containment/RCA/CAPA details, affected lines, and disposition release."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || saveMutation.isPending, label: saveMutation.isPending ? "Saving NCR" : "Save NCR", onClick: draft && !saveReason ? () => saveMutation.mutate(buildNcrRequest(draft, companyId, branchId)) : undefined, reason: saveReason }]} secondary={[
          { disabled: Boolean(closeReason) || closeMutation.isPending, label: closeMutation.isPending ? "Closing NCR" : "Close NCR", onClick: closeReason ? undefined : () => closeMutation.mutate(undefined), reason: closeReason },
          { disabled: Boolean(releaseReason) || releaseMutation.isPending, label: releaseMutation.isPending ? "Releasing disposition" : "Release disposition", onClick: draft && !releaseReason ? () => releaseMutation.mutate(buildDispositionRequest(draft)) : undefined, reason: releaseReason },
          { disabled: true, label: "Open rework", reason: "Exact rework order deep-link requires a created rework order reference." },
          { disabled: true, label: "Open source", reason: "Exact source document deep-link will be enabled by the owning source workflow." }
        ]} utility={[{ label: "Close", onClick: () => { setSelectedId(null); setDraft(null); }, variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => { setSelectedId(null); setDraft(null); }}
        statusMeta={actionMessage ? <Badge tone={actionTone}>{actionMessage}</Badge> : null}
        title={draft?.ncrNo ?? selected?.ncrNo ?? "NCR"}
        validation={<ErpValidationSummary errors={draftErrors} />}
      >
        {draft ? <div className="modal-form-grid">
          <FormShell initialFingerprint={`${draft.ncrNo}-header`} title="NCR controls">
            <label><span>NCR number</span><input aria-label="NCR number" disabled={!live} onChange={(event) => setDraft({ ...draft, ncrNo: event.target.value })} value={draft.ncrNo} /></label>
            <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before changing source type."} label="Source type" onChange={(value) => setDraft({ ...draft, sourceDocumentType: value })} options={sourceDocumentOptions} required value={draft.sourceDocumentType} />
            <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before assigning source id."} label="Source document id" min={1} onChange={(value) => setDraft({ ...draft, sourceDocumentId: value })} value={draft.sourceDocumentId} />
            <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before changing disposition."} label="Disposition" onChange={(value) => setDraft({ ...draft, disposition: value })} options={ncrDispositionOptions} required value={draft.disposition} />
            <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before changing NCR status."} label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={ncrStatusOptions} required value={draft.status} />
            <label><span>Defect category</span><input aria-label="Defect category" disabled={!live} onChange={(event) => setDraft({ ...draft, defectCategory: event.target.value })} value={draft.defectCategory} /></label>
            <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before assigning lot id."} label="Lot id" min={1} onChange={(value) => setDraft({ ...draft, lotId: value })} value={draft.lotId} />
            <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before assigning serial id."} label="Serial id" min={1} onChange={(value) => setDraft({ ...draft, serialId: value })} value={draft.serialId} />
            <label className="form-span-2"><span>Containment action</span><input aria-label="Containment action" disabled={!live} onChange={(event) => setDraft({ ...draft, containmentAction: event.target.value })} value={draft.containmentAction} /></label>
            <label className="form-span-2"><span>Root cause</span><input aria-label="Root cause" disabled={!live} onChange={(event) => setDraft({ ...draft, rootCause: event.target.value })} value={draft.rootCause} /></label>
            <label className="form-span-2"><span>Corrective action</span><input aria-label="Corrective action" disabled={!live} onChange={(event) => setDraft({ ...draft, correctiveAction: event.target.value })} value={draft.correctiveAction} /></label>
            <label className="form-span-2"><span>Preventive action</span><input aria-label="Preventive action" disabled={!live} onChange={(event) => setDraft({ ...draft, preventiveAction: event.target.value })} value={draft.preventiveAction} /></label>
            <label className="form-span-2"><span>NCR remarks</span><input aria-label="NCR remarks" disabled={!live} onChange={(event) => setDraft({ ...draft, remarks: event.target.value })} value={draft.remarks} /></label>
            <label className="form-span-2"><span>Close remarks</span><input aria-label="Close remarks" disabled={!live || !draft.ncrId} onChange={(event) => setCloseRemarks(event.target.value)} value={closeRemarks} /></label>
          </FormShell>
          <Card title="Affected line grid" description="Capture affected item, trace, quantity, defect, and disposition per NCR line.">
            <ErpTransactionLineGrid
              addDisabled={!live}
              addDisabledReason="Live quality sign-in is required before adding NCR lines."
              addLabel="Add Line"
              ariaLabel="NCR affected line grid"
              columns={[
                { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                { key: "item", header: "Item", width: "120px", render: (line, index) => <ErpNumberField disabled={!live} label={`Item ${index + 1}`} min={1} onChange={(value) => updateLine(index, { itemId: value })} value={line.itemId} /> },
                { key: "revision", header: "Revision", width: "120px", render: (line, index) => <ErpNumberField disabled={!live} label={`Item revision ${index + 1}`} min={1} onChange={(value) => updateLine(index, { itemRevisionId: value })} value={line.itemRevisionId} /> },
                { key: "trace", header: "Trace", width: "220px", render: (line, index) => <div className="grid-two"><ErpNumberField disabled={!live} label={`Lot ${index + 1}`} min={1} onChange={(value) => updateLine(index, { lotId: value })} value={line.lotId} /><ErpNumberField disabled={!live} label={`Serial ${index + 1}`} min={1} onChange={(value) => updateLine(index, { serialId: value })} value={line.serialId} /></div> },
                { key: "quantity", header: "Qty / UOM", width: "220px", render: (line, index) => <div className="grid-two"><ErpNumberField disabled={!live} label={`Affected quantity ${index + 1}`} min={0.0001} onChange={(value) => updateLine(index, { affectedQuantity: value })} value={line.affectedQuantity} /><ErpNumberField disabled={!live} label={`UOM ${index + 1}`} min={1} onChange={(value) => updateLine(index, { uomId: value })} value={line.uomId} /></div> },
                { key: "defect", header: "Defect", width: "260px", render: (line, index) => <div className="grid-two"><label><span>Code</span><input aria-label={`Defect code ${index + 1}`} disabled={!live} onChange={(event) => updateLine(index, { defectCode: event.target.value })} value={line.defectCode} /></label><label><span>Description</span><input aria-label={`Defect description ${index + 1}`} disabled={!live} onChange={(event) => updateLine(index, { defectDescription: event.target.value })} value={line.defectDescription} /></label></div> },
                { key: "disposition", header: "Disposition", width: "150px", render: (line, index) => <ErpLookupField disabled={!live} label={`Line disposition ${index + 1}`} onChange={(value) => updateLine(index, { disposition: value })} options={ncrDispositionOptions} required value={line.disposition} /> },
                { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: !live || draft.lines.length <= 1, label: "Remove Line", onClick: live && draft.lines.length > 1 ? () => removeLine(index) : undefined, reason: !live ? "Live quality sign-in is required before removing NCR lines." : draft.lines.length <= 1 ? "At least one NCR line is required." : undefined }]} /> }
              ]}
              getRowId={(line, index) => `${line.lineNo}-${index}`}
              lines={draft.lines}
              onAddLine={addLine}
              testId="ncr-affected-line-grid"
            />
          </Card>
        </div> : null}
      </ErpModalWorkspace>
    </>
  );
}

const coaColumns: DataGridColumn<CoaCertificateItem>[] = [
  { key: "coa", header: "COA", width: "16%", render: (record) => <strong>{record.coaNo}</strong> },
  { key: "source", header: "Source", width: "18%", render: (record) => record.sourceDocument },
  { key: "trace", header: "Trace", width: "16%", render: (record) => record.traceLabel },
  { key: "template", header: "Template", width: "14%", render: (record) => record.templateCode },
  { key: "version", header: "Version", width: "10%", render: (record) => `v${record.versionNo}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

function buildCoaRequest(draft: CoaDraft, companyId: number, branchId: number): CoaGenerateRequest {
  return {
    companyId,
    branchId,
    inspectionRecordId: draft.inspectionRecordId ?? 0,
    coaNo: draft.coaNo,
    templateCode: draft.templateCode,
    issueImmediately: draft.issueImmediately,
    reissueReason: null
  };
}

function coaDraftErrors(draft: CoaDraft | null) {
  if (!draft) {
    return [];
  }

  const errors: string[] = [];
  if (!draft.coaNo.trim()) errors.push("COA number is required.");
  if (!draft.templateCode.trim()) errors.push("COA template is required.");
  if (!draft.inspectionRecordId || draft.inspectionRecordId <= 0) errors.push("Final inspection record id is required.");
  return errors;
}

export function CoaCertificatePage() {
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CoaDraft | null>(null);
  const [reissueReason, setReissueReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useQualityFilter(search, status);
  const query = useApiQuery(
    queryKeys.quality.coas(companyId, branchId, deferredSearch, status),
    () => listCoaCertificates(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const errors = coaDraftErrors(draft);
  const generateReason = !draft
    ? "Open a COA generation workspace before saving."
    : !live
      ? "Live quality sign-in is required before generating COA certificates."
      : errors.length > 0
        ? "Resolve COA validation issues before generating."
        : undefined;
  const reissueReasonText = !selected
    ? "Open a COA before reissuing it."
    : !live
      ? "Live quality sign-in is required before reissuing COA certificates."
      : !reissueReason.trim()
        ? "Reissue reason is required."
        : undefined;
  const issueReason = !selected
    ? "Open a COA before issuing it."
    : !live
      ? "Live quality sign-in is required before issuing COA certificates."
      : selected.status.toLowerCase().includes("issued")
        ? "This COA has already been issued."
        : undefined;
  const downloadReason = !selected
    ? "Open a COA before downloading certificate output."
    : !live
      ? "Live quality sign-in is required before downloading COA output."
      : undefined;
  const generateMutation = useApiMutation(
    (request: CoaGenerateRequest) => apiClient.quality.generateCoa(request),
    {
      onSuccess: async (record) => {
        setMessage(`Generated COA ${record.coaNo}.`);
        setDraft(null);
        await query.refetch();
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const reissueMutation = useApiMutation(
    async (_: void) => {
      if (!selected) {
        throw new Error("Open a COA before reissuing it.");
      }

      return apiClient.quality.reissueCoa(selected.coaId, { reissueReason, templateCode: selected.templateCode, issueImmediately: false });
    },
    {
      onSuccess: async (record) => {
        setMessage(`Reissued COA ${record.coaNo} v${record.versionNo}.`);
        setReissueReason("");
        await query.refetch();
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const issueMutation = useApiMutation(
    async (_: void) => {
      if (!selected) {
        throw new Error("Open a COA before issuing it.");
      }

      return apiClient.quality.issueCoa(selected.coaId);
    },
    {
      onSuccess: async (result) => {
        setMessage(`COA issued.${result.status ? ` Current status: ${result.status}.` : ""}`);
        await query.refetch();
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const downloadMutation = useApiMutation(
    async (_: void) => {
      if (!selected) {
        throw new Error("Open a COA before downloading certificate output.");
      }

      const definitions = await apiClient.reporting.definitions({ page: 1, pageSize: 10, module: "Quality", status: "Active", search: "QUALITY-COA-REGISTER" });
      const definition = definitions.items.find((record) => record.reportCode === "QUALITY-COA-REGISTER");
      if (!definition) {
        throw new Error("COA certificate output report is not registered.");
      }

      const run = await apiClient.reporting.runReport(definition.id, {
        outputFormat: "PDF",
        sourceEntityType: "COA",
        sourceEntityId: selected.coaId,
        parameters: {
          documentNo: selected.coaNo,
          status: selected.status
        }
      });
      const output = run.outputs[0];
      if (!output) {
        throw new Error("COA certificate output did not produce a generated file.");
      }

      return {
        coaNo: selected.coaNo,
        fileName: output.fileName,
        output: await apiClient.reporting.downloadOutput(output.id)
      };
    },
    {
      onSuccess: ({ coaNo, fileName, output }) => {
        downloadGeneratedOutput(output, fileName);
        setMessage(`Downloaded COA ${coaNo}.`);
      },
      onError: (error) => setMessage(error.message)
    }
  );

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !live, label: "Generate COA", onClick: live ? () => setDraft({ inspectionRecordId: null, coaNo: `COA-${todayStamp()}`, templateCode: "COA-FINAL-STD", issueImmediately: false }) : undefined, reason: live ? undefined : "Live quality sign-in is required before generating COA certificates." }]} secondary={[{ disabled: Boolean(downloadReason) || downloadMutation.isPending, label: downloadMutation.isPending ? "Downloading COA" : "Download COA", onClick: !downloadReason ? () => downloadMutation.mutate(undefined) : undefined, reason: downloadReason }]} testId="coa-action-bar" /></>} description="Certificates generated from released final inspection evidence with versioned issue and reissue history." filters={<FilterBar><input aria-label="Search COA certificates" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search COA, source, template" value={search} /><select aria-label="COA status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Generated">Generated</option><option value="Issued">Issued</option></select></FilterBar>} title="COA Certificates">
        <KpiStrip items={[{ label: "Certificates", value: String(records.length) }, { label: "Issued", value: String(records.filter((record) => record.status.toLowerCase().includes("issued")).length) }, { label: "Versions", value: String(records.reduce((sum, record) => sum + record.versionNo, 0)) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        {query.error ? <Card title="Live COA data unavailable" description={query.error.message} /> : null}
        {message ? <Badge tone={message.includes("Generated") || message.includes("issued") || message.includes("Reissued") || message.includes("Downloaded") ? "success" : "danger"}>{message}</Badge> : null}
        <Card title="COA register" description="Open a certificate to review generated evidence, issue state, and reissue controls.">
          <DataGrid ariaLabel="COA certificate list" columns={coaColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.coaNo} certificate`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Generate a versioned certificate from approved final inspection evidence."
        footer={<ErpActionBar primary={[{ disabled: Boolean(generateReason) || generateMutation.isPending, label: generateMutation.isPending ? "Generating COA" : "Generate COA", onClick: draft && !generateReason ? () => generateMutation.mutate(buildCoaRequest(draft, companyId, branchId)) : undefined, reason: generateReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.coaNo ?? "Generate COA"}
        validation={<ErpValidationSummary errors={errors} />}
      >
        {draft ? <FormShell initialFingerprint={`${draft.coaNo}-generate`} title="COA generation">
          <label><span>COA number</span><input aria-label="COA number" disabled={!live} onChange={(event) => setDraft({ ...draft, coaNo: event.target.value })} value={draft.coaNo} /></label>
          <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before selecting final inspection evidence."} label="Final inspection record id" min={1} onChange={(value) => setDraft({ ...draft, inspectionRecordId: value })} value={draft.inspectionRecordId} />
          <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live quality sign-in is required before selecting COA template."} label="COA template" onChange={(value) => setDraft({ ...draft, templateCode: value })} options={coaTemplateOptions} required value={draft.templateCode} />
          <label className="form-checkbox"><input checked={draft.issueImmediately} disabled={!live} onChange={(event) => setDraft({ ...draft, issueImmediately: event.target.checked })} type="checkbox" /><span>Issue immediately</span></label>
        </FormShell> : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Review generated certificate evidence, issue state, and reissue controls."
        footer={<ErpActionBar primary={[{ disabled: Boolean(issueReason) || issueMutation.isPending, label: issueMutation.isPending ? "Issuing COA" : "Issue COA", onClick: !issueReason ? () => issueMutation.mutate(undefined) : undefined, reason: issueReason }]} secondary={[
          { disabled: Boolean(reissueReasonText) || reissueMutation.isPending, label: reissueMutation.isPending ? "Reissuing COA" : "Reissue COA", onClick: !reissueReasonText ? () => reissueMutation.mutate(undefined) : undefined, reason: reissueReasonText },
          { disabled: Boolean(downloadReason) || downloadMutation.isPending, label: downloadMutation.isPending ? "Downloading COA" : "Download COA", onClick: !downloadReason ? () => downloadMutation.mutate(undefined) : undefined, reason: downloadReason }
        ]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.coaNo ?? "COA"}
      >
        {selected ? (
          <>
            <KpiStrip items={[{ label: "Status", value: selected.status }, { label: "Version", value: `v${selected.versionNo}` }, { label: "Issued", value: selected.issuedOn }]} />
            <FormShell initialFingerprint={selected.id} title="Certificate controls" description={selected.storagePath}>
              <ErpLookupField disabled disabledReason="Source inspection is locked after COA generation." label="Source" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} />
              <ErpLookupField disabled disabledReason="Trace is copied from the final inspection snapshot." label="Trace" onChange={() => undefined} options={[{ label: selected.traceLabel, value: selected.traceLabel }]} value={selected.traceLabel} />
              <ErpLookupField disabled disabledReason="Template is versioned with the generated certificate." label="Template" onChange={() => undefined} options={[{ label: selected.templateCode, value: selected.templateCode }]} value={selected.templateCode} />
              <label className="form-span-2"><span>Reissue reason</span><input aria-label="COA reissue reason" disabled={!live} onChange={(event) => setReissueReason(event.target.value)} value={reissueReason} /></label>
            </FormShell>
            <Card title="Certificate evidence" description={selected.reissueReason}>
              <DataGrid ariaLabel="COA evidence lines" columns={resultColumns} getRowId={(record) => record.id} records={selected.lines} rowLabel={(record) => `${record.parameterCode} coa evidence`} />
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
