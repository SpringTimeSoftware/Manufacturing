import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import type {
  AlternateItemUpsertRequest,
  AttachmentUploadRequest,
  BomUpsertRequest,
  ExportJobCreateRequest,
  OperationUpsertRequest,
  RoutingUpsertRequest
} from "../api/contracts";
import { apiClient } from "../api/http";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  approveEngineeringChange,
  cloneBomEditorRevision,
  implementEngineeringChange,
  isLiveEngineeringRecord,
  listAlternateItemRuleSetup,
  listBomComparisonSetup,
  listBomEditorSetup,
  listEcoRevisionSetup,
  listEngineeringAttachmentSetup,
  listOperationStandardSetup,
  listRoutingLibrarySetup,
  mapAlternateRecord,
  mapEngineeringAttachmentRecord,
  mapOperationRecord,
  mapRoutingRecord,
  submitEngineeringChange,
  type AlternateItemRuleItem,
  type BomComparisonDifferenceItem,
  type BomComparisonItem,
  type BomEditorComponentItem,
  type BomEditorItem,
  type BomEditorOperationItem,
  type EcoRevisionItem,
  type EcoRevisionLineItem,
  type EngineeringAttachmentItem,
  type OperationStandardItem,
  type RoutingLibraryItem,
  type RoutingOperationStepItem
} from "../engineering/engineeringContinuationAdapters";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { type DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpFileActionState,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Setup complete" : "Readiness view"}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("approved") || normalized.includes("active") || normalized.includes("implemented")
    ? "success"
    : normalized.includes("draft") || normalized.includes("submitted") || normalized.includes("review")
      ? "warn"
      : normalized.includes("obsolete") || normalized.includes("blocked")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function hasLiveWrite(session: ReturnType<typeof useAuth>["session"]) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

function nextSequence(values: number[]) {
  return (Math.max(0, ...values) || 0) + 10;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function GovernedInlineAction({
  disabled,
  label,
  onClick,
  reason,
  variant = "secondary"
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  reason?: string;
  variant?: "primary" | "secondary" | "ghost" | "quiet";
}) {
  const disabledReason = disabled ? reason ?? "Action requires an enabled engineering workflow." : undefined;

  return (
    <span className="erp-action-bar__action">
      <Button disabled={disabled} onClick={disabled ? undefined : onClick} title={disabledReason} variant={variant}>
        {label}
      </Button>
      {disabledReason ? <small className="erp-action-bar__reason">{disabledReason}</small> : null}
    </span>
  );
}

function NumericEditField({
  disabled,
  label,
  min = 0,
  onChange,
  step = 1,
  value
}: {
  disabled?: boolean;
  label: string;
  min?: number;
  onChange: (value: number | null) => void;
  step?: number;
  value: number | null;
}) {
  return <ErpNumberField disabled={disabled} label={label} min={min} onChange={onChange} step={step} value={value} />;
}

function DecimalEditField({
  disabled,
  label,
  onChange,
  scale = 3,
  step,
  value
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: number | null) => void;
  scale?: number;
  step?: number;
  value: number | null;
}) {
  return <ErpDecimalField disabled={disabled} label={label} min={0} onChange={onChange} scale={scale} step={step} value={value} />;
}

function createExportJobRequest(
  companyId: number,
  branchId: number,
  module: string,
  filter: Record<string, unknown>,
  outputFormat = "CSV"): ExportJobCreateRequest {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return {
    companyId,
    branchId,
    jobNo: `EXP-${token}`,
    module,
    outputFormat,
    filterJson: JSON.stringify(filter),
    storagePath: `exports/${module.replace(/\./g, "/")}/${token}.${outputFormat.toLowerCase()}`
  };
}

interface BomDraftState {
  bomName: string;
  changeSummary: string;
  components: BomEditorComponentItem[];
  effectiveFrom: string;
  operations: BomEditorOperationItem[];
  revisionCode: string;
}

interface RoutingDraftState {
  companyId: number;
  outputItemId: number | null;
  revisionCode: string;
  routingCode: string;
  routingId: number | null;
  routingName: string;
  source: MasterDataSource | "Draft";
  status: string;
  steps: RoutingOperationStepItem[];
}

interface OperationDraftState {
  companyId: number;
  defaultWorkCenterId: number | null;
  allowsOverlap: boolean;
  isOutsideProcessing: boolean;
  operationCode: string;
  operationId: number | null;
  operationName: string;
  operationType: string;
  requiresQcCheckpoint: boolean;
  runMinutesPerUnit: number;
  setupMinutes: number;
  source: MasterDataSource | "Draft";
  status: string;
  teardownMinutes: number;
}

interface AlternateRuleDraftState {
  alternateItemId: number | null;
  alternateRuleId: number | null;
  approvalStatus: string;
  bomId: number | null;
  companyId: number;
  contextType: string;
  effectiveFrom: string;
  effectiveTo: string;
  primaryItemId: number | null;
  priorityRank: number;
  reasonCode: string;
  source: MasterDataSource | "Draft";
}

interface EngineeringDocumentDraftState {
  attachmentId: number | null;
  branchId: number | null;
  companyId: number | null;
  file: File | null;
  fileName: string;
  linkedRecordLabel: string;
  mode: "create" | "view";
  relatedDocumentId: number;
  relatedDocumentType: string;
}

function useEngineeringFilter(search: string, status: string) {
  const { user } = useAuth();
  const deferredSearch = useDeferredValue(search);

  return useMemo(
    () => ({
      deferredSearch,
      filter: buildMasterFilter(user?.activeContext.companyId, undefined, deferredSearch, status)
    }),
    [deferredSearch, status, user?.activeContext.companyId]
  );
}

function createEmptyBomComponent(defaultUomId: number | null): BomEditorComponentItem {
  return {
    id: `draft-bom-line-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sequenceNo: 10,
    componentItemId: 0,
    componentLabel: "",
    issueUomId: defaultUomId ?? 0,
    quantityPer: "1",
    scrapPercent: 0,
    issueMethod: "Manual",
    recommendation: "BUY",
    effectiveWindow: `${todayIso()} to Open`,
    alternateItemId: null,
    effectiveFrom: todayIso(),
    effectiveTo: null
  };
}

function createEmptyBomOperation(): BomEditorOperationItem {
  return {
    id: `draft-bom-operation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sequenceNo: 10,
    routingOperationId: null,
    operationId: null,
    operationLabel: "",
    setupMinutes: 0,
    runMinutesPerUnit: 0,
    teardownMinutes: 0,
    requiresQcCheckpoint: false,
    isOptional: false
  };
}

function toBomDraft(record: BomEditorItem): BomDraftState {
  return {
    bomName: record.bomName,
    changeSummary: record.changeSummary ?? "",
    components: record.components.map((component) => ({ ...component })),
    effectiveFrom: record.effectiveFrom === "Open" ? todayIso() : record.effectiveFrom,
    operations: record.operations.map((operation) => ({ ...operation })),
    revisionCode: record.revisionCode
  };
}

function createEmptyRoutingStep(): RoutingOperationStepItem {
  return {
    id: `draft-routing-step-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sequenceNo: 10,
    operationId: 0,
    workCenterId: null,
    toolId: null,
    operationLabel: "",
    workCenterLabel: "",
    setupMinutes: 0,
    runMinutesPerUnit: 0,
    teardownMinutes: 0,
    overlapPercent: "0%",
    overlapPercentValue: 0,
    requiresQcCheckpoint: false,
    isOutsideProcessing: false,
    status: "Draft"
  };
}

function toRoutingDraft(record: RoutingLibraryItem): RoutingDraftState {
  return {
    companyId: record.companyId,
    outputItemId: record.outputItemId,
    revisionCode: record.revisionCode,
    routingCode: record.routingCode,
    routingId: record.routingId,
    routingName: record.routingName,
    source: record.source,
    status: record.status,
    steps: record.operations.map((step) => ({ ...step }))
  };
}

function createRoutingDraft(companyId: number): RoutingDraftState {
  return {
    companyId,
    outputItemId: null,
    revisionCode: "R1",
    routingCode: "",
    routingId: null,
    routingName: "",
    source: "Draft",
    status: "Draft",
    steps: [createEmptyRoutingStep()]
  };
}

function createOperationDraft(companyId: number): OperationDraftState {
  return {
    companyId,
    defaultWorkCenterId: null,
    allowsOverlap: false,
    isOutsideProcessing: false,
    operationCode: "",
    operationId: null,
    operationName: "",
    operationType: "Fabrication",
    requiresQcCheckpoint: false,
    runMinutesPerUnit: 0,
    setupMinutes: 0,
    source: "Draft",
    status: "Draft",
    teardownMinutes: 0
  };
}

function toOperationDraft(record: OperationStandardItem): OperationDraftState {
  return {
    companyId: record.companyId,
    defaultWorkCenterId: record.defaultWorkCenterId,
    allowsOverlap: record.allowsOverlap,
    isOutsideProcessing: record.isOutsideProcessing,
    operationCode: record.operationCode,
    operationId: record.operationId,
    operationName: record.operationName,
    operationType: record.operationType,
    requiresQcCheckpoint: record.requiresQcCheckpoint,
    runMinutesPerUnit: record.runMinutesPerUnit,
    setupMinutes: record.setupMinutes,
    source: record.source,
    status: record.status,
    teardownMinutes: record.teardownMinutes
  };
}

function createAlternateRuleDraft(companyId: number): AlternateRuleDraftState {
  return {
    alternateItemId: null,
    alternateRuleId: null,
    approvalStatus: "Draft",
    bomId: null,
    companyId,
    contextType: "Global",
    effectiveFrom: todayIso(),
    effectiveTo: "",
    primaryItemId: null,
    priorityRank: 1,
    reasonCode: "",
    source: "Draft"
  };
}

function toAlternateRuleDraft(record: AlternateItemRuleItem): AlternateRuleDraftState {
  return {
    alternateItemId: record.alternateItemId,
    alternateRuleId: record.alternateRuleId,
    approvalStatus: record.approvalStatus,
    bomId: record.bomId,
    companyId: record.companyId,
    contextType: record.contextType,
    effectiveFrom: record.effectiveFrom ?? todayIso(),
    effectiveTo: record.effectiveTo ?? "",
    primaryItemId: record.primaryItemId,
    priorityRank: record.priorityRank,
    reasonCode: record.reasonCode === "Not specified" ? "" : record.reasonCode,
    source: record.source
  };
}

function createEngineeringDocumentDraft(companyId: number | null, branchId: number | null): EngineeringDocumentDraftState {
  return {
    attachmentId: null,
    branchId,
    companyId,
    file: null,
    fileName: "",
    linkedRecordLabel: "",
    mode: "create",
    relatedDocumentId: 0,
    relatedDocumentType: "BOM"
  };
}

function toEngineeringDocumentDraft(record: EngineeringAttachmentItem): EngineeringDocumentDraftState {
  return {
    attachmentId: record.attachmentId,
    branchId: record.branchId,
    companyId: record.companyId,
    file: null,
    fileName: record.fileName,
    linkedRecordLabel: record.linkedRecord,
    mode: "view",
    relatedDocumentId: record.relatedDocumentId ?? 0,
    relatedDocumentType: record.relatedDocumentType
  };
}

const bomEditorColumns: DataGridColumn<BomEditorItem>[] = [
  {
    key: "bom",
    header: "BOM",
    render: (record) => (
      <div>
        <strong>{record.bomName}</strong>
        <div className="muted">{record.bomCode} / {record.itemLabel}</div>
      </div>
    )
  },
  { key: "revision", header: "Revision", width: "12%", render: (record) => record.revisionCode },
  { key: "structure", header: "Structure", width: "18%", render: (record) => `${record.lineCount} lines / ${record.operationCount} ops` },
  { key: "issue", header: "Issue", width: "16%", render: (record) => record.defaultIssueMethod },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const bomComponentColumns: DataGridColumn<BomEditorComponentItem>[] = [
  { key: "seq", header: "Seq", width: "10%", render: (record) => record.sequenceNo },
  { key: "component", header: "Component", render: (record) => <strong>{record.componentLabel}</strong> },
  { key: "qty", header: "Qty per", width: "12%", render: (record) => record.quantityPer },
  { key: "scrap", header: "Scrap %", width: "12%", render: (record) => `${record.scrapPercent}%` },
  { key: "issue", header: "Issue method", width: "16%", render: (record) => record.issueMethod },
  { key: "recommendation", header: "Action", width: "12%", render: (record) => <Badge tone={record.recommendation === "MAKE" ? "info" : "success"}>{record.recommendation}</Badge> }
];

const bomOperationColumns: DataGridColumn<BomEditorOperationItem>[] = [
  { key: "seq", header: "Seq", width: "10%", render: (record) => record.sequenceNo },
  { key: "operation", header: "Operation", render: (record) => <strong>{record.operationLabel}</strong> },
  { key: "setup", header: "Setup", width: "12%", render: (record) => `${record.setupMinutes}m` },
  { key: "run", header: "Run", width: "12%", render: (record) => `${record.runMinutesPerUnit}m/u` },
  { key: "qc", header: "QC", width: "12%", render: (record) => <Badge tone={record.requiresQcCheckpoint ? "warn" : "neutral"}>{record.requiresQcCheckpoint ? "Required" : "No"}</Badge> }
];

export function BomDetailEditorPage() {
  const { session, user } = useAuth();
  const canWrite = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BomDraftState | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useEngineeringFilter(search, status);
  const query = useApiQuery(
    queryKeys.engineering.bomDetails(user?.activeContext.companyId, deferredSearch, status),
    () => listBomEditorSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const preview = selected ?? records[0] ?? null;
  const source = records[0]?.source ?? "Seeded";
  const itemsQuery = useApiQuery(
    ["engineering", "bom-editor-items", user?.activeContext.companyId ?? 0],
    () => (canWrite ? apiClient.masters.itemLookup(user?.activeContext.companyId) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const uomQuery = useApiQuery(
    queryKeys.measurements.uoms(user?.activeContext.companyId, "", "all"),
    () => (canWrite ? apiClient.measurements.uoms({ companyId: user?.activeContext.companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const operationQuery = useApiQuery(
    queryKeys.resources.operations(user?.activeContext.companyId, "", "all"),
    () => (canWrite ? apiClient.resources.operations({ companyId: user?.activeContext.companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const itemOptions = (itemsQuery.data ?? []).map((item) => ({ label: `${item.itemCode} / ${item.itemName}`, value: String(item.id) }));
  const uomOptions = (uomQuery.data ?? []).map((uom) => ({ label: `${uom.uomCode} / ${uom.uomName}`, value: String(uom.id) }));
  const operationOptions = (operationQuery.data ?? []).map((operation) => ({ label: `${operation.operationCode} / ${operation.operationName}`, value: String(operation.id) }));
  const cloneMutation = useApiMutation((item: BomEditorItem) => cloneBomEditorRevision(item));
  const saveMutation = useApiMutation(
    (request: { bomId: number; body: BomUpsertRequest }) => apiClient.engineering.updateBom(request.bomId, request.body),
    {
      onError: (error) => setSaveMessage(error.message),
      onSuccess: () => setSaveMessage("Draft BOM lines were saved.")
    }
  );
  const selectedCanClone = Boolean(selected && isLiveEngineeringRecord(selected) && selected.revisionId && !cloneMutation.isPending);
  const cloneReason = selected
    ? selectedCanClone
      ? undefined
      : "Revision cloning is available after a live BOM revision is selected."
    : "Select a BOM revision before cloning.";
  const canSaveDraft = Boolean(selected && draft && canWrite && isLiveEngineeringRecord(selected) && selected.status === "Draft" && !saveMutation.isPending);
  const canEditDraft = Boolean(selected && draft && canWrite && isLiveEngineeringRecord(selected) && selected.status === "Draft");
  const draftValidation = selected && draft
    ? [
        !draft.bomName.trim() ? "BOM name is required." : "",
        !draft.revisionCode.trim() ? "Revision code is required." : "",
        draft.components.some((component) => component.sequenceNo <= 0) ? "Each BOM line needs a valid sequence number." : "",
        draft.components.some((component) => !component.componentItemId) ? "Each BOM line needs a component item." : "",
        draft.components.some((component) => !component.issueUomId) ? "Each BOM line needs an issue UOM." : "",
        draft.components.some((component) => Number(component.quantityPer) <= 0) ? "Each BOM line quantity must be greater than zero." : "",
        draft.operations.some((operation) => operation.sequenceNo <= 0) ? "Each BOM operation needs a valid sequence number." : "",
        draft.operations.some((operation) => operation.operationId === null) ? "Each BOM operation needs an operation standard." : "",
        selected.status !== "Draft" ? "Clone an approved revision before saving line changes." : ""
      ].filter(Boolean)
    : [];
  const saveReason = !selected
    ? "Open a BOM draft before saving line changes."
    : !canWrite
      ? "BOM authoring requires a live signed-in engineering session."
      : !isLiveEngineeringRecord(selected)
        ? "Seeded BOM structures are read-only. Sign in to the live engineering register to edit lines."
        : selected.status !== "Draft"
          ? "Clone an approved revision before saving line changes."
          : draftValidation[0];

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }

    setDraft(toBomDraft(selected));
    setSaveMessage(null);
  }, [selected?.bomId, selected?.revisionCode, selected?.status]);

  const addComponentLine = () => {
    setDraft((current) =>
      current
        ? {
            ...current,
            components: [
              ...current.components,
              { ...createEmptyBomComponent(Number(uomOptions[0]?.value ?? 0)), sequenceNo: nextSequence(current.components.map((component) => component.sequenceNo)) }
            ]
          }
        : current
    );
  };

  const addOperationLine = () => {
    setDraft((current) =>
      current
        ? {
            ...current,
            operations: [
              ...current.operations,
              { ...createEmptyBomOperation(), sequenceNo: nextSequence(current.operations.map((operation) => operation.sequenceNo)) }
            ]
          }
        : current
    );
  };

  const saveDraftLines = () => {
    if (!selected || !draft || draftValidation.length > 0) {
      return;
    }

    saveMutation.mutate({
      bomId: selected.bomId,
      body: {
        companyId: selected.companyId,
        itemId: selected.itemId,
        bomCode: selected.bomCode,
        bomName: draft.bomName,
        status: "Draft",
        revisions: [
          {
            revisionCode: draft.revisionCode,
            effectiveFrom: draft.effectiveFrom || null,
            effectiveTo: selected.effectiveTo,
            approvalStatus: "Draft",
            routingId: selected.routingId,
            changeSummary: draft.changeSummary || null,
            isPhantomParentAllowed: selected.isPhantomParentAllowed,
            lines: draft.components.map((component) => ({
              sequenceNo: component.sequenceNo,
              componentItemId: component.componentItemId,
              quantityPer: Number(component.quantityPer),
              issueUomId: component.issueUomId,
              scrapPercent: component.scrapPercent,
              issueMethod: component.issueMethod,
              isPhantom: component.recommendation === "MAKE",
              alternateItemId: component.alternateItemId,
              effectiveFrom: component.effectiveFrom,
              effectiveTo: component.effectiveTo
            })),
            operations: draft.operations.map((operation) => ({
              sequenceNo: operation.sequenceNo,
              routingOperationId: operation.routingOperationId,
              operationId: operation.operationId,
              setupMinutes: operation.setupMinutes,
              runMinutesPerUnit: operation.runMinutesPerUnit,
              teardownMinutes: operation.teardownMinutes,
              requiresQcCheckpoint: operation.requiresQcCheckpoint,
              isOptional: operation.isOptional
            }))
          }
        ]
      }
    });
  };

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Save draft lines", reason: "Open a draft BOM inside the editor workspace before saving line changes." }]} secondary={[{ disabled: !selectedCanClone, label: cloneMutation.isPending ? "Cloning revision" : "Clone revision", onClick: selectedCanClone && selected ? () => cloneMutation.mutate(selected) : undefined, reason: cloneReason }]} testId="bom-editor-action-bar" /></>}
        aside={
          <Card title="Editor guardrail" description="Approved structures stay locked; draft edits use the shared governed workspace pattern.">
            {preview ? (
              <div className="utility-grid">
                <Tile eyebrow={preview.status} label="Revision" meta={preview.effectiveFrom}>{preview.revisionCode}</Tile>
                <Tile eyebrow={preview.defaultIssueMethod} label="Lines" meta={`${preview.operationCount} ops`}>{preview.lineCount}</Tile>
              </div>
            ) : null}
          </Card>
        }
        description="Tree view editor for components, scrap percent, issue method, and operation links."
        filters={
          <ErpFilterBar
            ariaLabel="BOM editor filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="bom-editor-filter-bar"
          >
            <input aria-label="Search BOM editor" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search item, BOM, revision" value={search} />
            <select aria-label="BOM editor status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Approved">Approved</option>
              <option value="Draft">Draft</option>
            </select>
          </ErpFilterBar>
        }
        title="BOM Detail / Editor"
      >
        <KpiStrip items={[{ label: "BOMs", value: String(records.length) }, { label: "Components", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Operations", value: String(records.reduce((total, record) => total + record.operationCount, 0)) }, { label: "Draft locks", value: String(records.filter((record) => record.status === "Draft").length) }]} />
        <div className="split-panels">
          <Card title="BOM selector" description="Select a structure before editing component and operation rows.">
            <ErpGrid ariaLabel="BOM editor list" columns={bomEditorColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.bomCode} bom editor`} testId="bom-editor-grid" virtualization={{ enabled: true }} />
          </Card>
          <Card title="Component tree editor" description={preview ? preview.itemLabel : "Select a BOM to view its editable tree."}>
            <ErpGrid ariaLabel="BOM component tree editor" columns={bomComponentColumns} getRowId={(record) => record.id} records={preview?.components ?? []} rowLabel={(record) => `${record.componentLabel} bom component`} />
          </Card>
        </div>
        <Card title="Operation links" description="Operation standards are visible in context without releasing production changes.">
          <ErpGrid ariaLabel="BOM operation editor" columns={bomOperationColumns} getRowId={(record) => record.id} records={preview?.operations ?? []} rowLabel={(record) => `${record.operationLabel} bom operation`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="BOM edit controls keep approved structures locked; live revisions can be cloned before line changes."
        footer={<ErpActionBar primary={[{ disabled: !canSaveDraft, label: saveMutation.isPending ? "Saving draft lines" : "Save draft lines", onClick: canSaveDraft ? saveDraftLines : undefined, reason: saveReason }]} secondary={[{ disabled: !selectedCanClone, label: cloneMutation.isPending ? "Cloning revision" : "Clone revision", onClick: selectedCanClone && selected ? () => cloneMutation.mutate(selected) : undefined, reason: cloneReason }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        panelClassName="ui-modal__panel--item-master"
        title={selected ? `${selected.bomCode} ${selected.revisionCode}` : "BOM editor"}
        validation={<ErpValidationSummary errors={draftValidation} title="BOM draft checks" />}
      >
        {selected && draft ? (
          <>
            <FormShell initialFingerprint={`${selected.id}-${selected.revisionCode}`} title="BOM edit controls" validationErrors={selected.validationNotes}>
              <ErpLookupField disabled disabledReason="Parent item is controlled by Item Master." label="Parent item" onChange={() => undefined} options={[{ label: selected.itemLabel, value: selected.itemLabel }]} value={selected.itemLabel} />
              <label><span>BOM name</span><input disabled={!canEditDraft} onChange={(event) => setDraft({ ...draft, bomName: event.target.value })} value={draft.bomName} /></label>
              <label><span>Revision</span><input disabled value={draft.revisionCode} /></label>
              <label><span>Effective from</span><input disabled={!canEditDraft} onChange={(event) => setDraft({ ...draft, effectiveFrom: event.target.value })} type="date" value={draft.effectiveFrom} /></label>
              <label><span>Change summary</span><input disabled={!canEditDraft} onChange={(event) => setDraft({ ...draft, changeSummary: event.target.value })} value={draft.changeSummary} /></label>
              <ErpLookupField disabled disabledReason="Issue method is maintained on each BOM line." label="Default issue method" onChange={() => undefined} options={[{ label: selected.defaultIssueMethod, value: selected.defaultIssueMethod }]} value={selected.defaultIssueMethod} />
            </FormShell>
            <Card title="Component lines" description="Add, edit, and remove BOM component lines with controlled item and UOM lookups.">
              <div className="compact-stack" data-testid="bom-component-editor">
                {draft.components.map((component) => (
                  <div className="form-grid form-grid--three" key={component.id}>
                    <NumericEditField disabled={!canEditDraft} label="Sequence" min={10} onChange={(value) => setDraft({ ...draft, components: draft.components.map((entry) => entry.id === component.id ? { ...entry, sequenceNo: value ?? 0 } : entry) })} value={component.sequenceNo} />
                    <ErpLookupField disabled={!canEditDraft} disabledReason={!canEditDraft ? saveReason : undefined} label="Component item" onChange={(value) => setDraft({ ...draft, components: draft.components.map((entry) => entry.id === component.id ? { ...entry, componentItemId: Number(value) || 0 } : entry) })} options={itemOptions} required value={String(component.componentItemId || "")} />
                    <ErpLookupField disabled={!canEditDraft} disabledReason={!canEditDraft ? saveReason : undefined} label="Issue UOM" onChange={(value) => setDraft({ ...draft, components: draft.components.map((entry) => entry.id === component.id ? { ...entry, issueUomId: Number(value) || 0 } : entry) })} options={uomOptions} required value={String(component.issueUomId || "")} />
                    <DecimalEditField disabled={!canEditDraft} label="Quantity per" onChange={(value) => setDraft({ ...draft, components: draft.components.map((entry) => entry.id === component.id ? { ...entry, quantityPer: value === null ? "" : String(value) } : entry) })} scale={3} value={component.quantityPer ? Number(component.quantityPer) : null} />
                    <DecimalEditField disabled={!canEditDraft} label="Scrap %" onChange={(value) => setDraft({ ...draft, components: draft.components.map((entry) => entry.id === component.id ? { ...entry, scrapPercent: value ?? 0 } : entry) })} scale={2} step={0.1} value={component.scrapPercent} />
                    <ErpLookupField disabled={!canEditDraft} disabledReason={!canEditDraft ? saveReason : undefined} label="Issue method" onChange={(value) => setDraft({ ...draft, components: draft.components.map((entry) => entry.id === component.id ? { ...entry, issueMethod: value } : entry) })} options={[{ label: "Manual", value: "Manual" }, { label: "Backflush", value: "Backflush" }]} value={component.issueMethod} />
                    <label><span>Effective from</span><input disabled={!canEditDraft} onChange={(event) => setDraft({ ...draft, components: draft.components.map((entry) => entry.id === component.id ? { ...entry, effectiveFrom: event.target.value || null } : entry) })} type="date" value={component.effectiveFrom ?? ""} /></label>
                    <label><span>Effective to</span><input disabled={!canEditDraft} onChange={(event) => setDraft({ ...draft, components: draft.components.map((entry) => entry.id === component.id ? { ...entry, effectiveTo: event.target.value || null } : entry) })} type="date" value={component.effectiveTo ?? ""} /></label>
                    <div className="compact-stack">
                      <ErpLookupField disabled={!canEditDraft} disabledReason={!canEditDraft ? saveReason : undefined} label="Line mode" onChange={(value) => setDraft({ ...draft, components: draft.components.map((entry) => entry.id === component.id ? { ...entry, recommendation: value } : entry) })} options={[{ label: "Stock", value: "BUY" }, { label: "Phantom", value: "MAKE" }]} value={component.recommendation} />
                      <GovernedInlineAction disabled={!canEditDraft} label="Remove line" onClick={() => setDraft({ ...draft, components: draft.components.filter((entry) => entry.id !== component.id) })} reason={!canEditDraft ? saveReason : undefined} variant="quiet" />
                    </div>
                  </div>
                ))}
                <GovernedInlineAction disabled={!canEditDraft} label="Add component line" onClick={addComponentLine} reason={!canEditDraft ? saveReason : undefined} variant="secondary" />
              </div>
            </Card>
            <Card title="Operation links" description="Maintain BOM operation references with controlled operation lookups and cycle values.">
              <div className="compact-stack" data-testid="bom-operation-editor">
                {draft.operations.map((operation) => (
                  <div className="form-grid form-grid--three" key={operation.id}>
                    <NumericEditField disabled={!canEditDraft} label="Sequence" min={10} onChange={(value) => setDraft({ ...draft, operations: draft.operations.map((entry) => entry.id === operation.id ? { ...entry, sequenceNo: value ?? 0 } : entry) })} value={operation.sequenceNo} />
                    <ErpLookupField disabled={!canEditDraft} disabledReason={!canEditDraft ? saveReason : undefined} label="Operation standard" onChange={(value) => setDraft({ ...draft, operations: draft.operations.map((entry) => entry.id === operation.id ? { ...entry, operationId: Number(value) || null } : entry) })} options={operationOptions} required value={String(operation.operationId ?? "")} />
                    <DecimalEditField disabled={!canEditDraft} label="Setup minutes" onChange={(value) => setDraft({ ...draft, operations: draft.operations.map((entry) => entry.id === operation.id ? { ...entry, setupMinutes: value ?? 0 } : entry) })} scale={2} step={0.1} value={operation.setupMinutes} />
                    <DecimalEditField disabled={!canEditDraft} label="Run minutes / unit" onChange={(value) => setDraft({ ...draft, operations: draft.operations.map((entry) => entry.id === operation.id ? { ...entry, runMinutesPerUnit: value ?? 0 } : entry) })} scale={2} step={0.1} value={operation.runMinutesPerUnit} />
                    <DecimalEditField disabled={!canEditDraft} label="Teardown minutes" onChange={(value) => setDraft({ ...draft, operations: draft.operations.map((entry) => entry.id === operation.id ? { ...entry, teardownMinutes: value ?? 0 } : entry) })} scale={2} step={0.1} value={operation.teardownMinutes} />
                    <div className="compact-stack">
                      <label><span>QC checkpoint</span><input checked={operation.requiresQcCheckpoint} disabled={!canEditDraft} onChange={(event) => setDraft({ ...draft, operations: draft.operations.map((entry) => entry.id === operation.id ? { ...entry, requiresQcCheckpoint: event.target.checked } : entry) })} type="checkbox" /></label>
                      <label><span>Optional</span><input checked={operation.isOptional} disabled={!canEditDraft} onChange={(event) => setDraft({ ...draft, operations: draft.operations.map((entry) => entry.id === operation.id ? { ...entry, isOptional: event.target.checked } : entry) })} type="checkbox" /></label>
                      <GovernedInlineAction disabled={!canEditDraft} label="Remove operation" onClick={() => setDraft({ ...draft, operations: draft.operations.filter((entry) => entry.id !== operation.id) })} reason={!canEditDraft ? saveReason : undefined} variant="quiet" />
                    </div>
                  </div>
                ))}
                <GovernedInlineAction disabled={!canEditDraft} label="Add operation line" onClick={addOperationLine} reason={!canEditDraft ? saveReason : undefined} variant="secondary" />
              </div>
            </Card>
            {saveMessage ? <Card title="Save status" description={saveMessage}><StatusBadge status={saveMessage.includes("saved") ? "Saved" : "Review"} /></Card> : null}
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const comparisonColumns: DataGridColumn<BomComparisonItem>[] = [
  { key: "bom", header: "BOM", render: (record) => <strong>{record.bomCode}</strong> },
  { key: "revision", header: "Compare", width: "22%", render: (record) => `${record.fromRevision} -> ${record.toRevision}` },
  { key: "qty", header: "Qty deltas", width: "14%", render: (record) => record.quantityDeltaCount },
  { key: "ops", header: "Op deltas", width: "14%", render: (record) => record.operationDeltaCount },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const differenceColumns: DataGridColumn<BomComparisonDifferenceItem>[] = [
  { key: "field", header: "Field", render: (record) => <strong>{record.field}</strong> },
  { key: "before", header: "Before", width: "18%", render: (record) => record.before },
  { key: "after", header: "After", width: "18%", render: (record) => record.after },
  { key: "impact", header: "Impact", width: "26%", render: (record) => record.impact }
];

export function BomComparisonPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useEngineeringFilter(search, "all");
  const query = useApiQuery(queryKeys.engineering.bomComparison(user?.activeContext.companyId, deferredSearch, "all"), () => listBomComparisonSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? records[0] ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar secondary={[{ disabled: true, label: "Export comparison", reason: "BOM comparison export is pending the approved reporting workflow." }]} testId="bom-comparison-action-bar" /></>} description="Compare revision and variant deltas before ECO approval or work-order use." filters={<ErpFilterBar ariaLabel="BOM comparison filters" onClear={() => setSearch("")} testId="bom-comparison-filter-bar"><input aria-label="Search BOM comparisons" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search BOM, item, revision" value={search} /></ErpFilterBar>} title="BOM Comparison">
      <KpiStrip items={[{ label: "Comparisons", value: String(records.length) }, { label: "Qty deltas", value: String(records.reduce((total, record) => total + record.quantityDeltaCount, 0)) }, { label: "Operation deltas", value: String(records.reduce((total, record) => total + record.operationDeltaCount, 0)) }, { label: "Approved", value: String(records.filter((record) => record.status === "Approved").length) }]} />
      <div className="split-panels">
        <Card title="Revision pairs" description="Revision-aware view keeps comparison separate from release actions.">
          <ErpGrid ariaLabel="BOM comparison list" columns={comparisonColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.bomCode} comparison`} />
        </Card>
        <Card title="Difference detail" description={selected ? selected.costSignal : "Select a comparison to inspect deltas."}>
          <ErpGrid ariaLabel="BOM comparison differences" columns={differenceColumns} getRowId={(record) => record.id} records={selected?.differences ?? []} rowLabel={(record) => `${record.field} difference`} />
        </Card>
      </div>
    </ListPageShell>
  );
}

const ecoColumns: DataGridColumn<EcoRevisionItem>[] = [
  { key: "eco", header: "ECO", width: "18%", render: (record) => <strong>{record.ecoCode}</strong> },
  { key: "title", header: "Title", render: (record) => record.ecoTitle },
  { key: "type", header: "Type", width: "16%", render: (record) => record.changeType },
  { key: "lines", header: "Lines", width: "10%", render: (record) => record.impactedLineCount },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.approvalStatus} /> }
];

const ecoLineColumns: DataGridColumn<EcoRevisionLineItem>[] = [
  { key: "line", header: "Line", width: "10%", render: (record) => record.lineNo },
  { key: "target", header: "Target", render: (record) => <strong>{record.targetLabel}</strong> },
  { key: "impact", header: "Impact", width: "18%", render: (record) => record.impactType },
  { key: "action", header: "Action", width: "18%", render: (record) => record.actionType },
  { key: "after", header: "After", width: "18%", render: (record) => record.after }
];

export function EcoRevisionControlPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useEngineeringFilter(search, status);
  const query = useApiQuery(queryKeys.engineering.engineeringChanges(user?.activeContext.companyId, deferredSearch, status), () => listEcoRevisionSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";
  const submitMutation = useApiMutation((item: EcoRevisionItem) => submitEngineeringChange(item));
  const approveMutation = useApiMutation((item: EcoRevisionItem) => approveEngineeringChange(item));
  const implementMutation = useApiMutation((item: EcoRevisionItem) => implementEngineeringChange(item));
  const isLiveSelected = isLiveEngineeringRecord(selected);
  const canSubmit = Boolean(selected && isLiveSelected && selected.ecoId && selected.approvalStatus === "Draft" && !submitMutation.isPending);
  const canApprove = Boolean(selected && isLiveSelected && selected.ecoId && selected.approvalStatus === "Submitted" && !approveMutation.isPending);
  const canImplement = Boolean(selected && isLiveSelected && selected.ecoId && selected.approvalStatus === "Approved" && !implementMutation.isPending);
  const submitReason = selected
    ? canSubmit
      ? undefined
      : "Submission is available for live draft ECOs."
    : "Select an ECO before submission.";
  const approveReason = selected
    ? canApprove
      ? undefined
      : "Approval is available for live submitted ECOs."
    : "Select an ECO before approval.";
  const implementReason = selected
    ? canImplement
      ? undefined
      : "Implementation is available after a live ECO is approved."
    : "Select an ECO before implementation.";

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !canApprove, label: approveMutation.isPending ? "Approving ECO" : "Approve selected", onClick: selected && canApprove ? () => approveMutation.mutate(selected) : undefined, reason: approveReason }]} secondary={[{ disabled: !canSubmit, label: submitMutation.isPending ? "Submitting ECO" : "Submit ECO", onClick: selected && canSubmit ? () => submitMutation.mutate(selected) : undefined, reason: submitReason }]} utility={[{ disabled: !canImplement, label: implementMutation.isPending ? "Implementing ECO" : "Implement ECO", onClick: selected && canImplement ? () => implementMutation.mutate(selected) : undefined, reason: implementReason }]} testId="eco-action-bar" /></>} description="Approve and release revision changes with audit-friendly action labels." filters={<ErpFilterBar ariaLabel="ECO filters" onClear={() => { setSearch(""); setStatus("all"); }} testId="eco-filter-bar"><input aria-label="Search ECO" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search ECO, title, reason" value={search} /><select aria-label="ECO status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Submitted">Submitted</option><option value="Approved">Approved</option><option value="Implemented">Implemented</option></select></ErpFilterBar>} title="ECO / Revision Control">
        <KpiStrip items={[{ label: "ECOs", value: String(records.length) }, { label: "Submitted", value: String(records.filter((record) => record.approvalStatus === "Submitted").length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.impactedLineCount, 0)) }, { label: "Approved", value: String(records.filter((record) => record.approvalStatus === "Approved").length) }]} />
        <Card title="Engineering change register" description="Status changes stay explicit and do not auto-release production.">
          <ErpGrid ariaLabel="ECO revision list" columns={ecoColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.ecoCode} engineering change`} testId="eco-grid" />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="ECO detail uses controlled lifecycle actions; unavailable transitions stay disabled."
        footer={<ErpActionBar primary={[{ disabled: !canApprove, label: approveMutation.isPending ? "Approving ECO" : "Approve ECO", onClick: selected && canApprove ? () => approveMutation.mutate(selected) : undefined, reason: approveReason }]} secondary={[{ disabled: !canSubmit, label: submitMutation.isPending ? "Submitting ECO" : "Submit ECO", onClick: selected && canSubmit ? () => submitMutation.mutate(selected) : undefined, reason: submitReason }, { disabled: !canImplement, label: implementMutation.isPending ? "Implementing ECO" : "Implement ECO", onClick: selected && canImplement ? () => implementMutation.mutate(selected) : undefined, reason: implementReason }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.ecoCode ?? "ECO detail"}
      >
        {selected ? (
          <>
            <KpiStrip items={[{ label: "Status", value: selected.approvalStatus }, { label: "Effective", value: selected.effectiveFrom }, { label: "Reason", value: selected.reasonCode }]} />
            <ErpGrid ariaLabel="ECO impact lines" columns={ecoLineColumns} getRowId={(record) => record.id} records={selected.lines} rowLabel={(record) => `${record.targetLabel} eco line`} />
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const routingColumns: DataGridColumn<RoutingLibraryItem>[] = [
  { key: "routing", header: "Routing", render: (record) => <strong>{record.routingCode}</strong> },
  { key: "name", header: "Name", render: (record) => record.routingName },
  { key: "output", header: "Output", width: "18%", render: (record) => record.outputItemLabel },
  { key: "cycle", header: "Cycle", width: "12%", render: (record) => `${record.totalCycleMinutes}m` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const routingOperationColumns: DataGridColumn<RoutingOperationStepItem>[] = [
  { key: "seq", header: "Seq", width: "10%", render: (record) => record.sequenceNo },
  { key: "operation", header: "Operation", render: (record) => <strong>{record.operationLabel}</strong> },
  { key: "workCenter", header: "Work center", width: "16%", render: (record) => record.workCenterLabel },
  { key: "cycle", header: "Cycle", width: "16%", render: (record) => `${record.setupMinutes}/${record.runMinutesPerUnit}/${record.teardownMinutes}` },
  { key: "qc", header: "QC", width: "12%", render: (record) => <Badge tone={record.requiresQcCheckpoint ? "warn" : "neutral"}>{record.requiresQcCheckpoint ? "QC" : "None"}</Badge> }
];

export function RoutingLibraryPage() {
  const { session, user } = useAuth();
  const canWrite = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RoutingDraftState | null>(null);
  const [mode, setMode] = useState<"create" | "edit" | "clone">("edit");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useEngineeringFilter(search, status);
  const query = useApiQuery(queryKeys.engineering.routings(user?.activeContext.companyId, deferredSearch, status), () => listRoutingLibrarySetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const preview = selected ?? records[0] ?? null;
  const source = records[0]?.source ?? "Seeded";
  const itemsQuery = useApiQuery(
    ["engineering", "routing-items", user?.activeContext.companyId ?? 0],
    () => (canWrite ? apiClient.masters.itemLookup(user?.activeContext.companyId) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const operationsQuery = useApiQuery(
    queryKeys.resources.operations(user?.activeContext.companyId, "", "all"),
    () => (canWrite ? apiClient.resources.operations({ companyId: user?.activeContext.companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const workCentersQuery = useApiQuery(
    queryKeys.resources.workCenters(user?.activeContext.companyId, user?.activeContext.branchId, "", "all"),
    () => (canWrite ? apiClient.resources.workCenters({ companyId: user?.activeContext.companyId ?? undefined, branchId: user?.activeContext.branchId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const machinesQuery = useApiQuery(
    queryKeys.resources.machines(user?.activeContext.companyId, user?.activeContext.branchId, "", "all"),
    () => (canWrite ? apiClient.resources.machines({ companyId: user?.activeContext.companyId ?? undefined, branchId: user?.activeContext.branchId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const itemOptions = (itemsQuery.data ?? []).map((item) => ({ label: `${item.itemCode} / ${item.itemName}`, value: String(item.id) }));
  const operationOptions = (operationsQuery.data ?? []).map((operation) => ({ label: `${operation.operationCode} / ${operation.operationName}`, value: String(operation.id) }));
  const workCenterOptions = (workCentersQuery.data ?? []).map((center) => ({ label: `${center.workCenterCode} / ${center.workCenterName}`, value: String(center.id) }));
  const machineOptions = (machinesQuery.data ?? []).map((machine) => ({ label: `${machine.machineCode} / ${machine.machineName}`, value: String(machine.id) }));
  const saveMutation = useApiMutation(
    (request: { routingId: number | null; body: RoutingUpsertRequest }) =>
      request.routingId ? apiClient.engineering.updateRouting(request.routingId, request.body) : apiClient.engineering.createRouting(request.body),
    {
      onError: (error) => setSaveMessage(error.message),
      onSuccess: (saved) => {
        const savedRecord = mapRoutingRecord(saved, "Live");
        setDraft(toRoutingDraft(savedRecord));
        setMode("edit");
        setSelectedId(savedRecord.id);
        setSaveMessage(`Routing ${saved.routingCode} was saved.`);
      }
    }
  );
  const cloneListReason = !selected
    ? "Select a routing before cloning."
    : !canWrite
      ? "Routing authoring requires a live signed-in engineering session."
      : !isLiveEngineeringRecord(selected)
        ? "Seeded routing references are read-only. Sign in to the live engineering register to clone a routing."
        : undefined;
  const saveReason = !draft
    ? "Open a routing workspace before saving."
    : !canWrite
      ? "Routing authoring requires a live signed-in engineering session."
      : mode === "edit" && draft.source !== "Live"
        ? "Seeded routing references are read-only. Create a new routing draft instead."
        : undefined;
  const canEditRouting = Boolean(draft && canWrite && (mode !== "edit" || draft.source === "Live"));
  const validation = draft
    ? [
        !draft.routingCode.trim() ? "Routing code is required." : "",
        !draft.routingName.trim() ? "Routing name is required." : "",
        draft.steps.length === 0 ? "At least one routing step is required." : "",
        draft.steps.some((step) => step.sequenceNo <= 0) ? "Each routing step needs a valid sequence number." : "",
        draft.steps.some((step) => !step.operationId) ? "Each routing step needs an operation standard." : "",
        draft.steps.some((step) => step.setupMinutes < 0 || step.runMinutesPerUnit < 0 || step.teardownMinutes < 0) ? "Routing cycle values cannot be negative." : ""
      ].filter(Boolean)
    : [];

  useEffect(() => {
    if (!selected) {
      return;
    }

    setDraft(toRoutingDraft(selected));
    setMode("edit");
    setSaveMessage(null);
  }, [selected?.routingId, selected?.routingCode]);

  const openNewRouting = () => {
    if (!user?.activeContext.companyId) {
      return;
    }

    setDraft(createRoutingDraft(user.activeContext.companyId));
    setMode("create");
    setSaveMessage(null);
  };

  const openCloneRouting = () => {
    if (!selected) {
      return;
    }

    const cloned = toRoutingDraft(selected);
    setDraft({
      ...cloned,
      routingId: null,
      routingCode: `${cloned.routingCode}-COPY`,
      routingName: `${cloned.routingName} Copy`,
      status: "Draft",
      source: "Draft"
    });
    setMode("clone");
    setSaveMessage(null);
  };

  const updateStep = (stepId: string, patch: Partial<RoutingOperationStepItem>) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            steps: current.steps.map((step) => (step.id === stepId ? { ...step, ...patch } : step))
          }
        : current
    );
  };

  const addStep = () => {
    setDraft((current) =>
      current
        ? {
            ...current,
            steps: [...current.steps, { ...createEmptyRoutingStep(), sequenceNo: nextSequence(current.steps.map((step) => step.sequenceNo)) }]
          }
        : current
    );
  };

  const handleSave = () => {
    if (!draft || validation.length > 0 || !user?.activeContext.companyId) {
      return;
    }

    saveMutation.mutate({
      routingId: mode === "edit" ? draft.routingId : null,
      body: {
        companyId: user.activeContext.companyId,
        routingCode: draft.routingCode,
        routingName: draft.routingName,
        outputItemId: draft.outputItemId,
        revisionCode: draft.revisionCode || null,
        status: draft.status,
        operations: draft.steps.map((step) => ({
          sequenceNo: step.sequenceNo,
          operationId: step.operationId,
          workCenterId: step.workCenterId,
          toolId: step.toolId,
          setupMinutes: step.setupMinutes,
          runMinutesPerUnit: step.runMinutesPerUnit,
          teardownMinutes: step.teardownMinutes,
          overlapPercent: step.overlapPercentValue,
          isOutsideProcessing: step.isOutsideProcessing,
          requiresQcCheckpoint: step.requiresQcCheckpoint,
          status: step.status
        }))
      }
    });
  };

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !canWrite, label: "New routing", onClick: canWrite ? openNewRouting : undefined, reason: !canWrite ? "Routing authoring requires a live signed-in engineering session." : undefined }]} secondary={[{ disabled: Boolean(cloneListReason), label: "Clone routing", onClick: cloneListReason ? undefined : openCloneRouting, reason: cloneListReason }]} testId="routing-action-bar" /></>} description="Reusable routings and operation sequences for engineering and planning." filters={<ErpFilterBar ariaLabel="Routing filters" onClear={() => { setSearch(""); setStatus("all"); }} testId="routing-filter-bar"><input aria-label="Search routings" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search routing, output item, revision" value={search} /><select aria-label="Routing status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Active">Active</option><option value="Draft">Draft</option></select></ErpFilterBar>} title="Routing Library">
        <KpiStrip items={[{ label: "Routings", value: String(records.length) }, { label: "Operations", value: String(records.reduce((total, record) => total + record.operationCount, 0)) }, { label: "Cycle min", value: String(records.reduce((total, record) => total + record.totalCycleMinutes, 0)) }, { label: "Active", value: String(records.filter((record) => record.status === "Active").length) }]} />
        <div className="split-panels">
          <Card title="Routing registry" description="Routing headers remain reusable and revision-aware.">
            <ErpGrid ariaLabel="Routing library" columns={routingColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.routingCode} routing`} testId="routing-grid" />
          </Card>
          <Card title="Operation sequence" description={preview ? preview.routingName : "Select a routing to inspect operations."}>
            <ErpGrid ariaLabel="Routing operation sequence" columns={routingOperationColumns} getRowId={(record) => record.id} records={preview?.operations ?? []} rowLabel={(record) => `${record.operationLabel} routing step`} />
          </Card>
        </div>
      </ListPageShell>
      <ErpModalWorkspace
        description="Routing detail keeps output item, work centers, and machine sequence visible before engineering release."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || validation.length > 0 || saveMutation.isPending, label: saveMutation.isPending ? "Saving routing" : "Save routing", onClick: saveReason || validation.length > 0 ? undefined : handleSave, reason: saveReason ?? validation[0] }]} secondary={mode === "edit" ? [{ disabled: Boolean(cloneListReason), label: "Clone routing", onClick: cloneListReason ? undefined : openCloneRouting, reason: cloneListReason }] : undefined} utility={[{ label: "Close", onClick: () => { setSelectedId(null); setDraft(null); }, variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => { setSelectedId(null); setDraft(null); }}
        panelClassName="ui-modal__panel--item-master"
        title={draft?.routingCode ? `Routing ${draft.routingCode}` : "Routing draft"}
        validation={<ErpValidationSummary errors={validation} title="Routing checks" />}
      >
        {draft ? (
          <>
            <FormShell initialFingerprint={`${draft.routingCode}-${mode}`} title="Routing release controls">
              <ErpLookupField disabled={!canEditRouting || mode === "edit"} disabledReason={!canEditRouting ? saveReason : mode === "edit" ? "Output item is fixed after routing creation." : undefined} label="Output item" onChange={(value) => setDraft({ ...draft, outputItemId: value ? Number(value) : null })} options={itemOptions} value={String(draft.outputItemId ?? "")} />
              <ErpLookupField disabled={!canEditRouting} disabledReason={!canEditRouting ? saveReason : undefined} label="Routing status" onChange={(value) => setDraft({ ...draft, status: value })} options={[{ label: "Draft", value: "Draft" }, { label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]} value={draft.status} />
              <label><span>Routing code</span><input disabled={!canEditRouting} onChange={(event) => setDraft({ ...draft, routingCode: event.target.value })} value={draft.routingCode} /></label>
              <label><span>Routing name</span><input disabled={!canEditRouting} onChange={(event) => setDraft({ ...draft, routingName: event.target.value })} value={draft.routingName} /></label>
              <label><span>Revision</span><input disabled={!canEditRouting} onChange={(event) => setDraft({ ...draft, revisionCode: event.target.value })} value={draft.revisionCode} /></label>
            </FormShell>
            <Card title="Operation sequence" description="Work center, machine, and QC controls stay visible for planning review.">
              <div className="compact-stack" data-testid="routing-step-editor">
                {draft.steps.map((step) => (
                  <div className="form-grid form-grid--three" key={step.id}>
                    <NumericEditField disabled={!canEditRouting} label="Sequence" min={10} onChange={(value) => updateStep(step.id, { sequenceNo: value ?? 0 })} value={step.sequenceNo} />
                    <ErpLookupField disabled={!canEditRouting} disabledReason={!canEditRouting ? saveReason : undefined} label="Operation standard" onChange={(value) => updateStep(step.id, { operationId: Number(value) || 0 })} options={operationOptions} required value={String(step.operationId || "")} />
                    <ErpLookupField disabled={!canEditRouting} disabledReason={!canEditRouting ? saveReason : undefined} label="Work center" onChange={(value) => updateStep(step.id, { workCenterId: value ? Number(value) : null })} options={workCenterOptions} value={String(step.workCenterId ?? "")} />
                    <DecimalEditField disabled={!canEditRouting} label="Setup minutes" onChange={(value) => updateStep(step.id, { setupMinutes: value ?? 0 })} scale={2} step={0.1} value={step.setupMinutes} />
                    <DecimalEditField disabled={!canEditRouting} label="Run minutes / unit" onChange={(value) => updateStep(step.id, { runMinutesPerUnit: value ?? 0 })} scale={2} step={0.1} value={step.runMinutesPerUnit} />
                    <DecimalEditField disabled={!canEditRouting} label="Teardown minutes" onChange={(value) => updateStep(step.id, { teardownMinutes: value ?? 0 })} scale={2} step={0.1} value={step.teardownMinutes} />
                    <DecimalEditField disabled={!canEditRouting} label="Overlap %" onChange={(value) => updateStep(step.id, { overlapPercentValue: value, overlapPercent: `${value ?? 0}%` })} scale={2} step={0.1} value={step.overlapPercentValue ?? 0} />
                    <ErpLookupField disabled={!canEditRouting} disabledReason={!canEditRouting ? saveReason : undefined} label="Step status" onChange={(value) => updateStep(step.id, { status: value })} options={[{ label: "Draft", value: "Draft" }, { label: "Active", value: "Active" }]} value={step.status} />
                    <ErpLookupField disabled disabledReason="Machine assignment stays in capacity planning until routing-machine control is enabled." label="Machine assignment" onChange={() => undefined} options={machineOptions} value="" />
                    <div className="compact-stack">
                      <label><span>QC checkpoint</span><input checked={step.requiresQcCheckpoint} disabled={!canEditRouting} onChange={(event) => updateStep(step.id, { requiresQcCheckpoint: event.target.checked })} type="checkbox" /></label>
                      <label><span>Outside processing</span><input checked={step.isOutsideProcessing} disabled={!canEditRouting} onChange={(event) => updateStep(step.id, { isOutsideProcessing: event.target.checked })} type="checkbox" /></label>
                      <GovernedInlineAction disabled={!canEditRouting} label="Remove step" onClick={() => setDraft({ ...draft, steps: draft.steps.filter((entry) => entry.id !== step.id) })} reason={!canEditRouting ? saveReason : undefined} variant="quiet" />
                    </div>
                  </div>
                ))}
                <GovernedInlineAction disabled={!canEditRouting} label="Add routing step" onClick={addStep} reason={!canEditRouting ? saveReason : undefined} variant="secondary" />
              </div>
            </Card>
            {saveMessage ? <Card title="Save status" description={saveMessage}><StatusBadge status={saveMessage.includes("saved") ? "Saved" : "Review"} /></Card> : null}
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const operationColumns: DataGridColumn<OperationStandardItem>[] = [
  { key: "code", header: "Operation", width: "18%", render: (record) => <strong>{record.operationCode}</strong> },
  { key: "name", header: "Name", render: (record) => record.operationName },
  { key: "type", header: "Type", width: "16%", render: (record) => record.operationType },
  { key: "cycle", header: "Setup/run/teardown", width: "20%", render: (record) => `${record.setupMinutes}/${record.runMinutesPerUnit}/${record.teardownMinutes}` },
  { key: "qc", header: "QC", width: "10%", render: (record) => <Badge tone={record.requiresQcCheckpoint ? "warn" : "neutral"}>{record.requiresQcCheckpoint ? "Yes" : "No"}</Badge> },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function OperationStandardPage() {
  const { session, user } = useAuth();
  const canWrite = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OperationDraftState | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useEngineeringFilter(search, status);
  const query = useApiQuery(queryKeys.resources.operations(user?.activeContext.companyId, deferredSearch, status), () => listOperationStandardSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";
  const workCentersQuery = useApiQuery(
    queryKeys.resources.workCenters(user?.activeContext.companyId, user?.activeContext.branchId, "", "all"),
    () => (canWrite ? apiClient.resources.workCenters({ companyId: user?.activeContext.companyId ?? undefined, branchId: user?.activeContext.branchId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const workCenterOptions = (workCentersQuery.data ?? []).map((center) => ({ label: `${center.workCenterCode} / ${center.workCenterName}`, value: String(center.id) }));
  const saveMutation = useApiMutation(
    (request: { operationId: number | null; body: OperationUpsertRequest }) =>
      request.operationId ? apiClient.resources.updateOperation(request.operationId, request.body) : apiClient.resources.createOperation(request.body),
    {
      onError: (error) => setSaveMessage(error.message),
      onSuccess: (saved) => {
        const savedRecord = mapOperationRecord(saved, "Live");
        setDraft(toOperationDraft(savedRecord));
        setMode("edit");
        setSelectedId(savedRecord.id);
        setSaveMessage(`Operation ${saved.operationCode} was saved.`);
      }
    }
  );
  const exportMutation = useApiMutation(
    (request: ExportJobCreateRequest) => apiClient.platform.createExportJob(request),
    {
      onError: (error) => setSaveMessage(error.message),
      onSuccess: (job) => setSaveMessage(`Operation standard export ${job.jobNo} was queued.`)
    }
  );
  const newOperationReason = !canWrite
    ? "Operation authoring requires a live signed-in engineering session."
    : !user?.activeContext.companyId
      ? "Select an operating company before creating an operation."
      : undefined;
  const exportReason = !canWrite
    ? "Operation export requires a live signed-in engineering session."
    : !user?.activeContext.companyId || !user?.activeContext.branchId
      ? "Select a company and branch before exporting operation standards."
      : undefined;
  const saveReason = !draft
    ? "Open an operation workspace before saving."
    : !canWrite
      ? "Operation authoring requires a live signed-in engineering session."
      : mode === "edit" && draft.source !== "Live"
        ? "Seeded operation standards are read-only. Create a new operation draft to continue."
        : undefined;
  const canEditOperation = Boolean(draft && canWrite && (mode !== "edit" || draft.source === "Live"));
  const validation = draft
    ? [
        !draft.operationCode.trim() ? "Operation code is required." : "",
        !draft.operationName.trim() ? "Operation name is required." : "",
        !draft.operationType.trim() ? "Operation type is required." : "",
        draft.setupMinutes < 0 || draft.runMinutesPerUnit < 0 || draft.teardownMinutes < 0 ? "Cycle values cannot be negative." : ""
      ].filter(Boolean)
    : [];

  useEffect(() => {
    if (!selected) {
      return;
    }

    setDraft(toOperationDraft(selected));
    setMode("edit");
    setSaveMessage(null);
  }, [selected?.operationId, selected?.operationCode]);

  const openNewOperation = () => {
    if (!user?.activeContext.companyId) {
      return;
    }

    setDraft(createOperationDraft(user.activeContext.companyId));
    setMode("create");
    setSaveMessage(null);
  };

  const handleSave = () => {
    if (!draft || validation.length > 0) {
      return;
    }

    saveMutation.mutate({
      operationId: mode === "edit" ? draft.operationId : null,
      body: {
        companyId: draft.companyId,
        operationCode: draft.operationCode,
        operationName: draft.operationName,
        operationType: draft.operationType,
        defaultWorkCenterId: draft.defaultWorkCenterId,
        defaultSetupMinutes: draft.setupMinutes,
        defaultRunMinutesPerUnit: draft.runMinutesPerUnit,
        defaultTeardownMinutes: draft.teardownMinutes,
        allowsOverlap: draft.allowsOverlap,
        isOutsideProcessing: draft.isOutsideProcessing,
        requiresQcCheckpoint: draft.requiresQcCheckpoint,
        status: draft.status
      }
    });
  };

  const queueExport = () => {
    if (!user?.activeContext.companyId || !user?.activeContext.branchId) {
      return;
    }

    exportMutation.mutate(
      createExportJobRequest(
        user.activeContext.companyId,
        user.activeContext.branchId,
        "engineering.operations",
        { search: deferredSearch, status }
      )
    );
  };

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: Boolean(newOperationReason), label: "New operation", onClick: newOperationReason ? undefined : openNewOperation, reason: newOperationReason }]} secondary={[{ disabled: Boolean(exportReason) || exportMutation.isPending, label: exportMutation.isPending ? "Queueing export" : "Export standards", onClick: exportReason ? undefined : queueExport, reason: exportReason }]} testId="operation-standard-action-bar" /></>} description="Setup, run, teardown, overlap, outside-processing, skill, and QC flags." filters={<ErpFilterBar ariaLabel="Operation filters" onClear={() => { setSearch(""); setStatus("all"); }} testId="operation-filter-bar"><input aria-label="Search operation standards" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search operation, type, work center" value={search} /><select aria-label="Operation status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Active">Active</option><option value="Draft">Draft</option></select></ErpFilterBar>} title="Operation Standard / Cycle Times">
        <KpiStrip items={[{ label: "Operations", value: String(records.length) }, { label: "QC flagged", value: String(records.filter((record) => record.requiresQcCheckpoint).length) }, { label: "Overlap allowed", value: String(records.filter((record) => record.allowsOverlap).length) }, { label: "Outside process", value: String(records.filter((record) => record.isOutsideProcessing).length) }]} />
        <Card title="Operation standards" description="Cycle-time values feed routing and planning without posting execution events.">
          <ErpGrid ariaLabel="Operation standards" columns={operationColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.operationCode} operation standard`} testId="operation-grid" />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Operation standards stay compact and save cycle values through the governed engineering workspace."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || validation.length > 0 || saveMutation.isPending, label: saveMutation.isPending ? "Saving operation" : "Save operation", onClick: saveReason || validation.length > 0 ? undefined : handleSave, reason: saveReason ?? validation[0] }]} utility={[{ label: "Close", onClick: () => { setSelectedId(null); setDraft(null); }, variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => { setSelectedId(null); setDraft(null); }}
        panelClassName="ui-modal__panel--item-master"
        title={draft?.operationCode ? `Operation ${draft.operationCode}` : "Operation draft"}
        validation={<ErpValidationSummary errors={validation} title="Operation checks" />}
      >
        {draft ? (
          <>
            <FormShell initialFingerprint={`${draft.operationCode}-${mode}`} title="Operation setup">
              <label><span>Operation code</span><input disabled={!canEditOperation} onChange={(event) => setDraft({ ...draft, operationCode: event.target.value })} value={draft.operationCode} /></label>
              <label><span>Operation name</span><input disabled={!canEditOperation} onChange={(event) => setDraft({ ...draft, operationName: event.target.value })} value={draft.operationName} /></label>
              <ErpLookupField disabled={!canEditOperation} disabledReason={!canEditOperation ? saveReason : undefined} label="Operation type" onChange={(value) => setDraft({ ...draft, operationType: value })} options={[{ label: "Fabrication", value: "Fabrication" }, { label: "Assembly", value: "Assembly" }, { label: "Inspection", value: "Inspection" }, { label: "Packaging", value: "Packaging" }, { label: "Outside process", value: "Outside process" }]} required value={draft.operationType} />
              <ErpLookupField disabled={!canEditOperation} disabledReason={!canEditOperation ? saveReason : undefined} label="Default work center" onChange={(value) => setDraft({ ...draft, defaultWorkCenterId: value ? Number(value) : null })} options={workCenterOptions} value={String(draft.defaultWorkCenterId ?? "")} />
              <ErpLookupField disabled disabledReason="Machine assignment remains controlled in capacity planning until resource-machine mapping is enabled." label="Default machine" onChange={() => undefined} options={[]} value="" />
              <ErpLookupField disabled disabledReason="Operator qualification is maintained in the resource register before operation assignment is enabled." label="Operator qualification" onChange={() => undefined} options={[]} value="" />
              <ErpLookupField disabled={!canEditOperation} disabledReason={!canEditOperation ? saveReason : undefined} label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={[{ label: "Draft", value: "Draft" }, { label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]} value={draft.status} />
              <DecimalEditField disabled={!canEditOperation} label="Setup minutes" onChange={(value) => setDraft({ ...draft, setupMinutes: value ?? 0 })} scale={2} step={0.1} value={draft.setupMinutes} />
              <DecimalEditField disabled={!canEditOperation} label="Run minutes / unit" onChange={(value) => setDraft({ ...draft, runMinutesPerUnit: value ?? 0 })} scale={2} step={0.1} value={draft.runMinutesPerUnit} />
              <DecimalEditField disabled={!canEditOperation} label="Teardown minutes" onChange={(value) => setDraft({ ...draft, teardownMinutes: value ?? 0 })} scale={2} step={0.1} value={draft.teardownMinutes} />
            </FormShell>
            <Card title="Execution controls" description="Overlap, QC, and outside-processing flags stay explicit before the standard is released into routings.">
              <div className="form-grid form-grid--three">
                <label><span>Requires QC checkpoint</span><input checked={draft.requiresQcCheckpoint} disabled={!canEditOperation} onChange={(event) => setDraft({ ...draft, requiresQcCheckpoint: event.target.checked })} type="checkbox" /></label>
                <label><span>Allows overlap</span><input checked={draft.allowsOverlap} disabled={!canEditOperation} onChange={(event) => setDraft({ ...draft, allowsOverlap: event.target.checked })} type="checkbox" /></label>
                <label><span>Outside processing</span><input checked={draft.isOutsideProcessing} disabled={!canEditOperation} onChange={(event) => setDraft({ ...draft, isOutsideProcessing: event.target.checked })} type="checkbox" /></label>
              </div>
            </Card>
            {saveMessage ? <Card title="Save status" description={saveMessage}><StatusBadge status={saveMessage.includes("saved") ? "Saved" : "Review"} /></Card> : null}
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const alternateColumns: DataGridColumn<AlternateItemRuleItem>[] = [
  { key: "primary", header: "Primary item", render: (record) => <strong>{record.primaryItemLabel}</strong> },
  { key: "alternate", header: "Alternate", render: (record) => record.alternateItemLabel },
  { key: "context", header: "Context", width: "14%", render: (record) => record.contextType },
  { key: "priority", header: "Priority", width: "10%", render: (record) => record.priorityRank },
  { key: "reason", header: "Reason", width: "16%", render: (record) => record.reasonCode },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.approvalStatus} /> }
];

export function AlternateItemRulesPage() {
  const { session, user } = useAuth();
  const canWrite = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AlternateRuleDraftState | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useEngineeringFilter(search, status);
  const query = useApiQuery(queryKeys.engineering.alternateItems(user?.activeContext.companyId, deferredSearch, status), () => listAlternateItemRuleSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const source = records[0]?.source ?? "Seeded";
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const itemsQuery = useApiQuery(
    ["engineering", "alternate-items-lookup", user?.activeContext.companyId ?? 0],
    () => (canWrite ? apiClient.masters.itemLookup(user?.activeContext.companyId) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const bomQuery = useApiQuery(
    queryKeys.engineering.boms(user?.activeContext.companyId, "", "all"),
    () => (canWrite ? apiClient.engineering.boms({ companyId: user?.activeContext.companyId ?? undefined, pageSize: 100, status: "all" }).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const itemOptions = (itemsQuery.data ?? []).map((item) => ({ label: `${item.itemCode} / ${item.itemName}`, value: String(item.id) }));
  const bomOptions = (bomQuery.data ?? []).map((bom) => ({ label: `${bom.bomCode} / ${bom.bomName}`, value: String(bom.id) }));
  const reasonCodeOptions = useMemo(() => {
    const knownCodes = new Set(
      ["SHORTAGE", "PROCUREMENT", "QUALITY", "COST"].concat(
        records.map((record) => record.reasonCode).filter((reasonCode) => reasonCode && reasonCode !== "Not specified")
      )
    );

    return Array.from(knownCodes).map((reasonCode) => ({ label: reasonCode, value: reasonCode }));
  }, [records]);
  const saveMutation = useApiMutation(
    (request: { alternateRuleId: number | null; body: AlternateItemUpsertRequest }) =>
      request.alternateRuleId
        ? apiClient.engineering.updateAlternateItem(request.alternateRuleId, request.body)
        : apiClient.engineering.createAlternateItem(request.body),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: (saved) => {
        const savedRecord = mapAlternateRecord(saved);
        setDraft(toAlternateRuleDraft(savedRecord));
        setMode("edit");
        setSelectedId(savedRecord.id);
        setActionMessage(`Alternate-item rule ${saved.id} was saved.`);
      }
    }
  );
  const exportMutation = useApiMutation(
    (request: ExportJobCreateRequest) => apiClient.platform.createExportJob(request),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: (job) => setActionMessage(`Alternate export ${job.jobNo} was queued.`)
    }
  );
  const newRuleReason = !canWrite
    ? "Alternate-item authoring requires a live signed-in engineering session."
    : !user?.activeContext.companyId
      ? "Select an operating company before creating an alternate-item rule."
      : undefined;
  const exportReason = !canWrite
    ? "Alternate-item export requires a live signed-in engineering session."
    : !user?.activeContext.companyId || !user?.activeContext.branchId
      ? "Select a company and branch before exporting alternate-item rules."
      : undefined;
  const validation = draft
    ? [
        !draft.primaryItemId ? "Primary item is required." : "",
        !draft.alternateItemId ? "Alternate item is required." : "",
        draft.primaryItemId && draft.alternateItemId && draft.primaryItemId === draft.alternateItemId ? "Primary item and alternate item must be different." : "",
        !draft.contextType.trim() ? "Context is required." : "",
        draft.contextType === "BOM" && !draft.bomId ? "Select a BOM when the rule context is BOM." : "",
        draft.priorityRank <= 0 ? "Priority rank must be greater than zero." : ""
      ].filter(Boolean)
    : [];
  const saveReason = !draft
    ? "Open an alternate-item rule workspace before saving."
    : !canWrite
      ? "Alternate-item authoring requires a live signed-in engineering session."
      : mode === "edit" && draft.source !== "Live"
        ? "Seeded alternate-item rules are read-only. Create a new live rule to continue."
        : undefined;
  const canEditRule = Boolean(draft && canWrite && (draft.source === "Live" || draft.source === "Draft"));

  useEffect(() => {
    if (!selected) {
      return;
    }

    setDraft(toAlternateRuleDraft(selected));
    setMode("edit");
    setActionMessage(null);
  }, [selected?.id]);

  const openNewRule = () => {
    if (!user?.activeContext.companyId) {
      return;
    }

    setDraft(createAlternateRuleDraft(user.activeContext.companyId));
    setMode("create");
    setActionMessage(null);
  };

  const handleSave = () => {
    if (!draft || validation.length > 0) {
      return;
    }

    saveMutation.mutate({
      alternateRuleId: mode === "edit" ? draft.alternateRuleId : null,
      body: {
        companyId: draft.companyId,
        primaryItemId: draft.primaryItemId ?? 0,
        alternateItemId: draft.alternateItemId ?? 0,
        contextType: draft.contextType,
        bomId: draft.contextType === "BOM" ? draft.bomId : null,
        priorityRank: draft.priorityRank,
        effectiveFrom: draft.effectiveFrom || null,
        effectiveTo: draft.effectiveTo || null,
        approvalStatus: draft.approvalStatus,
        reasonCode: draft.reasonCode.trim() || null
      }
    });
  };

  const queueExport = () => {
    if (!user?.activeContext.companyId || !user?.activeContext.branchId) {
      return;
    }

    exportMutation.mutate(
      createExportJobRequest(
        user.activeContext.companyId,
        user.activeContext.branchId,
        "engineering.alternate-items",
        { search: deferredSearch, status }
      )
    );
  };

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: Boolean(newRuleReason), label: "New rule", onClick: newRuleReason ? undefined : openNewRule, reason: newRuleReason }]} secondary={[{ disabled: Boolean(exportReason) || exportMutation.isPending, label: exportMutation.isPending ? "Queueing export" : "Export alternates", onClick: exportReason ? undefined : queueExport, reason: exportReason }]} testId="alternate-rule-action-bar" /></>} description="Approved substitutions and precedence for BOM, purchasing, and shortage response." filters={<ErpFilterBar ariaLabel="Alternate item filters" onClear={() => { setSearch(""); setStatus("all"); }} testId="alternate-rule-filter-bar"><input aria-label="Search alternate items" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search primary, alternate, reason" value={search} /><select aria-label="Alternate item status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Approved">Approved</option><option value="Draft">Draft</option></select></ErpFilterBar>} title="Alternate Item / Replacement Rules">
        <KpiStrip items={[{ label: "Rules", value: String(records.length) }, { label: "Approved", value: String(records.filter((record) => record.approvalStatus === "Approved").length) }, { label: "BOM scoped", value: String(records.filter((record) => record.contextType === "BOM").length) }, { label: "Priority one", value: String(records.filter((record) => record.priorityRank === 1).length) }]} />
        <Card title="Substitution rulebook" description="Replacement rules remain explicit and priority-ranked.">
          <ErpGrid ariaLabel="Alternate item rules" columns={alternateColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.primaryItemLabel} alternate item`} testId="alternate-rule-grid" />
        </Card>
        {actionMessage ? <Card title="Alternate action status" description={actionMessage}><StatusBadge status={actionMessage.includes("queued") || actionMessage.includes("saved") ? "Completed" : "Review"} /></Card> : null}
      </ListPageShell>
      <ErpModalWorkspace
        description="Alternate-item rules stay governed by item, BOM, and approval context before release."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || validation.length > 0 || saveMutation.isPending, label: saveMutation.isPending ? "Saving rule" : "Save rule", onClick: saveReason || validation.length > 0 ? undefined : handleSave, reason: saveReason ?? validation[0] }]} utility={[{ label: "Close", onClick: () => { setSelectedId(null); setDraft(null); }, variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => { setSelectedId(null); setDraft(null); }}
        panelClassName="ui-modal__panel--item-master"
        title={draft?.primaryItemId ? "Alternate-item rule" : "Alternate-item rule draft"}
        validation={<ErpValidationSummary errors={validation} title="Alternate-item checks" />}
      >
        {draft ? (
          <>
            <FormShell initialFingerprint={`${draft.alternateRuleId ?? "draft"}-${mode}`} title="Rule context">
              <ErpLookupField disabled={!canEditRule} disabledReason={!canEditRule ? saveReason : undefined} label="Primary item" onChange={(value) => setDraft({ ...draft, primaryItemId: value ? Number(value) : null })} options={itemOptions} required value={String(draft.primaryItemId ?? "")} />
              <ErpLookupField disabled={!canEditRule} disabledReason={!canEditRule ? saveReason : undefined} label="Alternate item" onChange={(value) => setDraft({ ...draft, alternateItemId: value ? Number(value) : null })} options={itemOptions} required value={String(draft.alternateItemId ?? "")} />
              <ErpLookupField disabled={!canEditRule} disabledReason={!canEditRule ? saveReason : undefined} label="Context" onChange={(value) => setDraft({ ...draft, contextType: value, bomId: value === "BOM" ? draft.bomId : null })} options={[{ label: "Global", value: "Global" }, { label: "BOM", value: "BOM" }, { label: "Shortage", value: "Shortage" }, { label: "Procurement", value: "Procurement" }]} required value={draft.contextType} />
              <ErpLookupField disabled={!canEditRule || draft.contextType !== "BOM"} disabledReason={draft.contextType !== "BOM" ? "BOM context is required before selecting a BOM." : !canEditRule ? saveReason : undefined} label="BOM context" onChange={(value) => setDraft({ ...draft, bomId: value ? Number(value) : null })} options={bomOptions} value={String(draft.bomId ?? "")} />
              <ErpLookupField disabled={!canEditRule} disabledReason={!canEditRule ? saveReason : undefined} label="Approval status" onChange={(value) => setDraft({ ...draft, approvalStatus: value })} options={[{ label: "Draft", value: "Draft" }, { label: "Approved", value: "Approved" }, { label: "Obsolete", value: "Obsolete" }]} value={draft.approvalStatus} />
              <NumericEditField disabled={!canEditRule} label="Priority rank" min={1} onChange={(value) => setDraft({ ...draft, priorityRank: value ?? 0 })} value={draft.priorityRank} />
              <label><span>Effective from</span><input disabled={!canEditRule} onChange={(event) => setDraft({ ...draft, effectiveFrom: event.target.value })} type="date" value={draft.effectiveFrom} /></label>
              <label><span>Effective to</span><input disabled={!canEditRule} onChange={(event) => setDraft({ ...draft, effectiveTo: event.target.value })} type="date" value={draft.effectiveTo} /></label>
              <ErpLookupField
                disabled={!canEditRule}
                disabledReason={!canEditRule ? saveReason : undefined}
                label="Reason code"
                onChange={(value) => setDraft({ ...draft, reasonCode: value })}
                options={reasonCodeOptions}
                value={draft.reasonCode}
              />
            </FormShell>
            <Card title="Rule release guardrails" description="Alternate-item approval remains explicit so planners and buyers see the same rule context.">
              <div className="utility-grid">
                <Tile eyebrow={draft.contextType} label="Priority" meta={draft.approvalStatus}>{draft.priorityRank}</Tile>
                <Tile eyebrow={draft.effectiveFrom || "Open"} label="Effective to" meta={draft.reasonCode || "Reason not set"}>{draft.effectiveTo || "Open"}</Tile>
              </div>
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const documentColumns: DataGridColumn<EngineeringAttachmentItem>[] = [
  { key: "doc", header: "Document", width: "20%", render: (record) => <strong>{record.documentNo}</strong> },
  { key: "file", header: "File", render: (record) => record.fileName },
  { key: "linked", header: "Linked record", width: "22%", render: (record) => record.linkedRecord },
  { key: "revision", header: "Revision", width: "12%", render: (record) => record.revisionCode },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function EngineeringAttachmentViewerPage() {
  const { session, user } = useAuth();
  const canWrite = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EngineeringDocumentDraftState | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useEngineeringFilter(search, status);
  const query = useApiQuery(queryKeys.engineering.documents(user?.activeContext.companyId, deferredSearch, status), () => listEngineeringAttachmentSetup(session, { ...filter, branchId: user?.activeContext.branchId ?? undefined }), { staleTime: 60_000 });
  const records = query.data ?? [];
  const source = records[0]?.source ?? (canWrite ? "Live" : "Deferred");
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const uploadMutation = useApiMutation(
    (request: AttachmentUploadRequest) => apiClient.platform.uploadAttachment(request),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: (saved) => {
        const savedRecord = mapEngineeringAttachmentRecord(saved);
        setDraft(toEngineeringDocumentDraft(savedRecord));
        setSelectedId(savedRecord.id);
        setActionMessage(`Engineering document ${saved.fileName} was linked.`);
      }
    }
  );
  const linkReason = !canWrite
    ? "Document linking requires a live signed-in engineering session."
    : !user?.activeContext.companyId || !user?.activeContext.branchId
      ? "Select a company and branch before linking an engineering document."
      : undefined;
  const auditReason = "Audit history opens after document-control review is enabled.";
  const validation = draft?.mode === "create"
    ? [
        !draft.relatedDocumentType.trim() ? "Related document type is required." : "",
        draft.relatedDocumentId <= 0 ? "Related document ID must be greater than zero." : "",
        !draft.file ? "Choose a file before linking the document." : ""
      ].filter(Boolean)
    : [];

  useEffect(() => {
    if (!selected) {
      return;
    }

    setDraft(toEngineeringDocumentDraft(selected));
    setActionMessage(null);
  }, [selected?.id]);

  const openLinkWorkspace = () => {
    setDraft(createEngineeringDocumentDraft(user?.activeContext.companyId ?? null, user?.activeContext.branchId ?? null));
    setActionMessage(null);
  };

  const handleUpload = () => {
    if (!draft || draft.mode !== "create" || !draft.file) {
      return;
    }

    uploadMutation.mutate({
      companyId: draft.companyId,
      branchId: draft.branchId,
      relatedDocumentType: draft.relatedDocumentType,
      relatedDocumentId: draft.relatedDocumentId,
      file: draft.file
    });
  };

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: Boolean(linkReason), label: "Link document", onClick: linkReason ? undefined : openLinkWorkspace, reason: linkReason }]} secondary={[{ disabled: true, label: "Open audit trail", reason: auditReason }]} testId="engineering-document-action-bar" /></>} aside={<Card title="Document guidance" description="Review drawings, specifications, photos, and ECO files linked to BOM and routing records."><Badge tone="info">Engineering documents</Badge></Card>} description="Drawings, specifications, photos, and ECO files linked to BOM, routing, and engineering-change records." filters={<ErpFilterBar ariaLabel="Engineering document filters" onClear={() => { setSearch(""); setStatus("all"); }} testId="engineering-document-filter-bar"><input aria-label="Search engineering documents" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search document, file, linked record" value={search} /><select aria-label="Engineering document status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Linked">Linked</option><option value="Review">Review</option></select></ErpFilterBar>} title="Engineering Attachment / Document Viewer">
        <KpiStrip items={[{ label: "Documents", value: String(records.length) }, { label: "Linked", value: String(records.filter((record) => record.status === "Linked").length) }, { label: "Review", value: String(records.filter((record) => record.status === "Review").length) }, { label: "Reference rows", value: String(records.filter((record) => record.source === "Deferred").length) }]} />
        <Card title="Engineering documents" description="Linked records stay visible by engineering context so BOM, routing, ECO, and alternate-item references stay traceable.">
          <ErpGrid ariaLabel="Engineering attachment documents" columns={documentColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.documentNo} engineering document`} testId="engineering-document-grid" />
        </Card>
        {actionMessage ? <Card title="Document action status" description={actionMessage}><StatusBadge status={actionMessage.includes("linked") ? "Completed" : "Review"} /></Card> : null}
      </ListPageShell>
      <ErpModalWorkspace
        description={draft?.mode === "create" ? "Link a file to a BOM, routing, ECO, or alternate-item record." : "Engineering document metadata stays visible and linked to its source record."}
        footer={<ErpActionBar primary={draft?.mode === "create" ? [{ disabled: validation.length > 0 || uploadMutation.isPending, label: uploadMutation.isPending ? "Linking document" : "Link document", onClick: validation.length > 0 ? undefined : handleUpload, reason: validation[0] }] : undefined} secondary={draft?.mode === "view" ? [{ disabled: true, label: "Open audit trail", reason: auditReason }] : undefined} utility={[{ label: "Close", onClick: () => { setSelectedId(null); setDraft(null); }, variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => { setSelectedId(null); setDraft(null); }}
        panelClassName="ui-modal__panel--item-master"
        title={draft?.mode === "create" ? "Engineering document link" : draft?.fileName ?? "Engineering document"}
        validation={draft?.mode === "create" ? <ErpValidationSummary errors={validation} title="Document checks" /> : undefined}
      >
        {draft ? (
          <>
            <FormShell initialFingerprint={`${draft.mode}-${draft.attachmentId ?? "draft"}`} title="Document link">
              <ErpLookupField disabled={draft.mode === "view"} disabledReason={draft.mode === "view" ? "Existing document links are reviewed here and changed through a new document link." : undefined} label="Related document type" onChange={(value) => setDraft({ ...draft, relatedDocumentType: value })} options={[{ label: "BOM", value: "BOM" }, { label: "Routing", value: "Routing" }, { label: "ECO", value: "ECO" }, { label: "Alternate item", value: "AlternateItem" }]} required value={draft.relatedDocumentType} />
              <NumericEditField disabled={draft.mode === "view"} label="Related document ID" min={1} onChange={(value) => setDraft({ ...draft, relatedDocumentId: value ?? 0 })} value={draft.relatedDocumentId || null} />
              <ErpFileActionState enabled={draft.mode !== "view"} fileName={draft.file?.name ?? draft.fileName} label="Linked file" onFileSelect={(file) => setDraft({ ...draft, file, fileName: file?.name ?? draft.fileName })} />
              <label><span>File name</span><input disabled value={draft.file?.name ?? draft.fileName} /></label>
            </FormShell>
            <Card title="Link summary" description="Linked engineering documents remain searchable by source record and file name.">
              <div className="utility-grid">
                <Tile eyebrow={draft.relatedDocumentType || "Document"} label="Related record" meta={draft.fileName || "File pending"}>{draft.relatedDocumentId || "Pending"}</Tile>
                <Tile eyebrow={draft.mode === "create" ? "Draft" : "Linked"} label="Linked record" meta={draft.file ? `${Math.round(draft.file.size / 1024)} KB` : "Stored"}>{draft.linkedRecordLabel || "Will be created from the selected record."}</Tile>
              </div>
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
