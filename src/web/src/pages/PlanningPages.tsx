import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { apiClient } from "../api/http";
import type { ExportJobCreateRequest, MrpRunStartRequest } from "../api/contracts";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import {
  listBoqRequirementSetup,
  listMrpRunConsoleSetup,
  approveBoqRequirementLine,
  convertBoqRequirementLine,
  convertReviewedBoqRequirementLines,
  isLivePlanningRecord,
  type BoqRequirementItem,
  type BoqRequirementLineItem,
  type MrpExceptionItem,
  type MrpRunConsoleItem
} from "../planning/planningAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpFilterBar, ErpGrid, ErpLookupField, ErpModalWorkspace, ErpStatusChip, ErpValidationSummary } from "../ui/ErpComponents";
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
  const tone = normalized.includes("completed") || normalized.includes("approved") || normalized.includes("converted")
    ? "success"
    : normalized.includes("shortage") || normalized.includes("draft") || normalized.includes("review")
      ? "warn"
      : normalized.includes("failed") || normalized.includes("blocked")
        ? "danger"
        : "info";

  return <ErpStatusChip tone={tone}>{status}</ErpStatusChip>;
}

function ActionBadge({ action }: { action: string }) {
  const tone = action === "MAKE" ? "info" : action === "BUY" ? "success" : action === "TRANSFER" ? "warn" : "neutral";
  return <ErpStatusChip tone={tone}>{action}</ErpStatusChip>;
}

function hasLiveWrite(session: ReturnType<typeof useAuth>["session"]) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
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

interface MrpRunDraftState extends MrpRunStartRequest {}

function usePlanningFilter(search: string, status: string) {
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

const mrpRunColumns: DataGridColumn<MrpRunConsoleItem>[] = [
  { key: "run", header: "Run", width: "18%", render: (record) => <strong>{record.runCode}</strong> },
  { key: "type", header: "Type", width: "14%", render: (record) => record.runType },
  { key: "horizon", header: "Horizon", render: (record) => record.horizon },
  { key: "lines", header: "Lines", width: "10%", render: (record) => record.lineCount },
  { key: "exceptions", header: "Exceptions", width: "12%", render: (record) => <ErpStatusChip tone={record.exceptionCount > 0 ? "warn" : "success"}>{record.exceptionCount}</ErpStatusChip> },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const mrpExceptionColumns: DataGridColumn<MrpExceptionItem>[] = [
  { key: "item", header: "Item", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "source", header: "Demand source", width: "16%", render: (record) => record.demandSourceType },
  { key: "gross", header: "Gross", width: "10%", render: (record) => record.grossRequirementQty },
  { key: "avail", header: "Available", width: "10%", render: (record) => record.availableQtyAtRun },
  { key: "net", header: "Net", width: "10%", render: (record) => record.netRequirementQty },
  { key: "action", header: "Action", width: "12%", render: (record) => <ActionBadge action={record.recommendedAction} /> },
  { key: "exception", header: "Exception", width: "16%", render: (record) => <StatusBadge status={record.exceptionCode} /> }
];

export function MrpRunConsolePage() {
  const { session, user } = useAuth();
  const canWrite = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MrpRunDraftState | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = usePlanningFilter(search, status);
  const query = useApiQuery(queryKeys.planning.mrpRuns(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listMrpRunConsoleSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const preview = selected ?? records[0] ?? null;
  const source = records[0]?.source ?? "Seeded";
  const mpsQuery = useApiQuery(
    queryKeys.salesPlanning.mps(user?.activeContext.companyId, user?.activeContext.branchId, "", "all"),
    () => (canWrite ? apiClient.salesPlanning.mps({ companyId: user?.activeContext.companyId ?? undefined, branchId: user?.activeContext.branchId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const mpsOptions = (mpsQuery.data ?? []).map((mps) => ({
    label: `${mps.mpsCode} / ${mps.planningHorizonStart} to ${mps.planningHorizonEnd}`,
    value: String(mps.id)
  }));
  const newRunReason = !canWrite
    ? "MRP launch requires a live signed-in planning session."
    : !user?.activeContext.companyId || !user?.activeContext.branchId
      ? "Select a company and branch before starting MRP."
      : undefined;
  const draftValidation = draft
    ? [
        !draft.runCode.trim() ? "Run code is required." : "",
        !draft.runType.trim() ? "Run type is required." : "",
        !draft.planningHorizonStart ? "Planning horizon start is required." : "",
        !draft.planningHorizonEnd ? "Planning horizon end is required." : "",
        draft.planningHorizonStart && draft.planningHorizonEnd && draft.planningHorizonEnd < draft.planningHorizonStart ? "Planning horizon end must be on or after the start date." : ""
      ].filter(Boolean)
    : [];
  const startRunMutation = useApiMutation(
    (request: MrpRunStartRequest) => apiClient.planning.startMrpRun(request),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: (saved) => {
        setDraft(null);
        setSelectedId(`mrp-run-${saved.id}`);
        setActionMessage(`MRP run ${saved.runCode} was started.`);
      }
    }
  );
  const exportMutation = useApiMutation(
    (request: ExportJobCreateRequest) => apiClient.platform.createExportJob(request),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: (job) => setActionMessage(`Version snapshot ${job.jobNo} was queued.`)
    }
  );
  const canExportSnapshot = Boolean(preview && canWrite && user?.activeContext.companyId && user?.activeContext.branchId && isLivePlanningRecord(preview) && !exportMutation.isPending);
  const exportReason = preview
    ? canExportSnapshot
      ? undefined
      : !canWrite
        ? "MRP snapshot export requires a live signed-in planning session."
        : !isLivePlanningRecord(preview)
          ? "Select a live MRP run before queueing a snapshot export."
          : "Select a company and branch before exporting an MRP snapshot."
    : "Select an MRP run before queueing a snapshot export.";

  const openRunDraft = () => {
    if (!user?.activeContext.companyId || !user?.activeContext.branchId) {
      return;
    }

    setDraft({
      companyId: user.activeContext.companyId,
      branchId: user.activeContext.branchId,
      runCode: `MRP-${todayIso()}`,
      runType: "Net Change",
      triggeredFromMpsId: null,
      planningHorizonStart: todayIso(),
      planningHorizonEnd: todayIso()
    });
    setActionMessage(null);
  };

  const queueSnapshotExport = () => {
    if (!preview || !user?.activeContext.companyId || !user?.activeContext.branchId) {
      return;
    }

    exportMutation.mutate(
      createExportJobRequest(
        user.activeContext.companyId,
        user.activeContext.branchId,
        "planning.mrp.snapshot",
        { mrpRunId: preview.mrpRunId, search: deferredSearch, status }
      )
    );
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ disabled: Boolean(newRunReason), label: "Run MRP draft", onClick: newRunReason ? undefined : openRunDraft, reason: newRunReason }]}
              secondary={[{ disabled: !canExportSnapshot, label: exportMutation.isPending ? "Queueing snapshot" : "Version snapshot", onClick: canExportSnapshot ? queueSnapshotExport : undefined, reason: exportReason }]}
              testId="mrp-run-action-bar"
            />
          </>
        }
        aside={
          <Card title="Run discipline" description="MRP launch remains a controlled planning action with review before execution.">
            {preview ? (
              <div className="utility-grid">
                <Tile eyebrow={preview.status} label="Exceptions" meta={preview.triggeredFrom}>{preview.exceptionCount}</Tile>
                <Tile eyebrow={preview.runType} label="Horizon" meta={preview.startedOn}>{preview.lineCount}</Tile>
              </div>
            ) : null}
          </Card>
        }
        description="Run, review, and version MRP calculations with explicit exception counts."
        filters={
          <ErpFilterBar
            ariaLabel="MRP run filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="mrp-run-filter-bar"
          >
            <input aria-label="Search MRP runs" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search run, type, horizon" value={search} />
            <select aria-label="MRP run status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Completed">Completed</option>
              <option value="Running">Running</option>
              <option value="Failed">Failed</option>
            </select>
          </ErpFilterBar>
        }
        title="MRP Run Console"
      >
        <KpiStrip items={[{ label: "Runs", value: String(records.length) }, { label: "Exceptions", value: String(records.reduce((total, record) => total + record.exceptionCount, 0)) }, { label: "BUY", value: String(records.reduce((total, record) => total + record.buyCount, 0)) }, { label: "MAKE", value: String(records.reduce((total, record) => total + record.makeCount, 0)) }]} />
        <div className="split-panels">
          <Card title="Run registry" description="MRP runs are versioned and selectable before recommendation review.">
            <ErpGrid ariaLabel="MRP run registry" columns={mrpRunColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.runCode} mrp run`} testId="mrp-run-grid" />
          </Card>
          <Card title="Current result preview" description={preview ? preview.horizon : "Select an MRP run to review results."}>
            <ErpGrid ariaLabel="MRP run result preview" columns={mrpExceptionColumns} getRowId={(record) => record.id} records={preview?.items ?? []} rowLabel={(record) => `${record.itemLabel} mrp result`} />
          </Card>
        </div>
        {actionMessage ? <Card title="Planning action status" description={actionMessage}><StatusBadge status={actionMessage.includes("started") || actionMessage.includes("queued") ? "Completed" : "Review"} /></Card> : null}
      </ListPageShell>
      <ErpModalWorkspace
        description="MRP run detail is review-only until run parameter save is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save run parameters", reason: "Run parameters are saved only when starting a new MRP run." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.runCode ?? "MRP run"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="MRP run parameters">
            <ErpLookupField disabled disabledReason="Run type is controlled by planning policy." label="Run type" onChange={() => undefined} options={[{ label: selected.runType, value: selected.runType }]} value={selected.runType} />
            <ErpLookupField disabled disabledReason="Planning horizon is controlled by the stored MRP run." label="Planning horizon" onChange={() => undefined} options={[{ label: selected.horizon, value: selected.horizon }]} value={selected.horizon} />
            <ErpLookupField disabled disabledReason="MPS source is selected from the planning schedule register." label="Triggered from" onChange={() => undefined} options={[{ label: selected.triggeredFrom, value: selected.triggeredFrom }]} value={selected.triggeredFrom} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Start an MRP run with governed parameters and a controlled planning horizon."
        footer={<ErpActionBar primary={[{ disabled: Boolean(newRunReason) || draftValidation.length > 0 || startRunMutation.isPending, label: startRunMutation.isPending ? "Starting MRP run" : "Start MRP run", onClick: draft && !newRunReason && draftValidation.length === 0 ? () => startRunMutation.mutate(draft) : undefined, reason: newRunReason ?? draftValidation[0] }]} secondary={[{ disabled: true, label: "Save run parameters", reason: "Run parameters are saved only when starting a new MRP run." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        panelClassName="ui-modal__panel--item-master"
        title="MRP run draft"
        validation={<ErpValidationSummary errors={draftValidation} title="MRP run checks" />}
      >
        {draft ? (
          <FormShell initialFingerprint={draft.runCode} title="MRP run parameters">
            <label><span>Run code</span><input onChange={(event) => setDraft({ ...draft, runCode: event.target.value })} value={draft.runCode} /></label>
            <ErpLookupField label="Run type" onChange={(value) => setDraft({ ...draft, runType: value })} options={[{ label: "Net Change", value: "Net Change" }, { label: "Regenerative", value: "Regenerative" }]} required value={draft.runType} />
            <ErpLookupField label="Triggered from MPS" onChange={(value) => setDraft({ ...draft, triggeredFromMpsId: value ? Number(value) : null })} options={[{ label: "Manual", value: "" }, ...mpsOptions]} value={draft.triggeredFromMpsId ? String(draft.triggeredFromMpsId) : ""} />
            <label><span>Planning horizon start</span><input onChange={(event) => setDraft({ ...draft, planningHorizonStart: event.target.value })} type="date" value={draft.planningHorizonStart} /></label>
            <label><span>Planning horizon end</span><input onChange={(event) => setDraft({ ...draft, planningHorizonEnd: event.target.value })} type="date" value={draft.planningHorizonEnd} /></label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function MrpResultsExceptionsPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { deferredSearch, filter } = usePlanningFilter(search, status);
  const query = useApiQuery(queryKeys.planning.mrpResults(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listMrpRunConsoleSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const source = records[0]?.source ?? "Seeded";
  const exceptions = records.flatMap((record) => record.items.map((item) => ({ ...item, id: `${record.id}-${item.id}`, runCode: record.runCode })));

  return (
    <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Create shortage actions", reason: "Shortage conversion requires BOQ approval workflow enablement." }]} secondary={[{ disabled: true, label: "Export exceptions", reason: "MRP exception export is pending the approved reporting workflow." }]} testId="mrp-exception-action-bar" /></>} description="Shortages, late items, missing data, and recommendations after MRP execution." filters={<ErpFilterBar ariaLabel="MRP exception filters" onClear={() => { setSearch(""); setStatus("all"); }} testId="mrp-exception-filter-bar"><input aria-label="Search MRP exceptions" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search item, exception, action" value={search} /><select aria-label="MRP exception status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Completed">Completed</option><option value="Running">Running</option></select></ErpFilterBar>} title="MRP Results / Exceptions">
      <KpiStrip items={[{ label: "Result lines", value: String(exceptions.length) }, { label: "Shortages", value: String(exceptions.filter((item) => item.exceptionCode.includes("SHORTAGE")).length) }, { label: "Late supply", value: String(exceptions.filter((item) => item.exceptionCode.includes("LATE")).length) }, { label: "Make actions", value: String(exceptions.filter((item) => item.recommendedAction === "MAKE").length) }]} />
      <Card title="Exception workbench" description="Recommendations are reviewable; conversion remains a downstream BOQ action.">
        <ErpGrid ariaLabel="MRP exception results" columns={mrpExceptionColumns} getRowId={(record) => record.id} isLoading={query.isLoading} records={exceptions} rowLabel={(record) => `${record.itemLabel} mrp exception`} virtualization={{ enabled: true }} />
      </Card>
    </ListPageShell>
  );
}

const boqHeaderColumns: DataGridColumn<BoqRequirementItem>[] = [
  { key: "source", header: "Source", render: (record) => <strong>{record.sourceDocument}</strong> },
  { key: "mrp", header: "MRP", width: "18%", render: (record) => record.mrpRunLabel },
  { key: "lines", header: "Lines", width: "10%", render: (record) => record.lineCount },
  { key: "shortage", header: "Shortage", width: "12%", render: (record) => <Badge tone={record.shortageCount > 0 ? "warn" : "success"}>{record.shortageCount}</Badge> },
  { key: "actions", header: "BUY/MAKE/TRANSFER", width: "22%", render: (record) => `${record.buyCount}/${record.makeCount}/${record.transferCount}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const boqLineColumns: DataGridColumn<BoqRequirementLineItem>[] = [
  { key: "item", header: "Component", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "gross", header: "Gross", width: "10%", render: (record) => record.requiredQuantity },
  { key: "avail", header: "Avail", width: "10%", render: (record) => record.availableQuantity },
  { key: "incoming", header: "Incoming", width: "10%", render: (record) => record.incomingQuantity },
  { key: "wip", header: "WIP", width: "10%", render: (record) => record.wipQuantity },
  { key: "shortage", header: "Shortage", width: "12%", render: (record) => <Badge tone={record.shortageQuantity > 0 ? "danger" : "success"}>{record.shortageQuantity}</Badge> },
  { key: "action", header: "Action", width: "12%", render: (record) => <ActionBadge action={record.approvedAction} /> }
];

export function BoqRequirementsPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = usePlanningFilter(search, status);
  const query = useApiQuery(queryKeys.planning.boqRequirements(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listBoqRequirementSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const preview = selected ?? records[0] ?? null;
  const activeRequirement = selected;
  const source = records[0]?.source ?? "Seeded";
  const selectedLine = preview?.lines.find((line) => line.id === selectedLineId) ?? null;
  const approveLineMutation = useApiMutation(
    ({ requirement, line }: { requirement: BoqRequirementItem; line: BoqRequirementLineItem }) => approveBoqRequirementLine(requirement, line),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: () => setActionMessage("Selected BOQ line was approved.")
    }
  );
  const convertLineMutation = useApiMutation(
    ({ requirement, line }: { requirement: BoqRequirementItem; line: BoqRequirementLineItem }) => convertBoqRequirementLine(requirement, line),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: () => setActionMessage("Selected BOQ line was converted.")
    }
  );
  const bulkConvertMutation = useApiMutation(
    (requirement: BoqRequirementItem) => convertReviewedBoqRequirementLines(requirement),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: (lines) => setActionMessage(`${lines.length} reviewed BOQ line${lines.length === 1 ? "" : "s"} were converted.`)
    }
  );
  const reviewedLineCount = activeRequirement?.lines.filter((line) => line.status === "Reviewed").length ?? 0;
  const canApproveLine = Boolean(preview && selectedLine && isLivePlanningRecord(preview) && selectedLine.lineId && selectedLine.status !== "Converted" && !approveLineMutation.isPending);
  const canConvertLine = Boolean(preview && selectedLine && isLivePlanningRecord(preview) && selectedLine.lineId && selectedLine.status === "Reviewed" && !convertLineMutation.isPending);
  const canBulkConvert = Boolean(activeRequirement && isLivePlanningRecord(activeRequirement) && reviewedLineCount > 0 && !bulkConvertMutation.isPending);
  const approveLineReason = preview && selectedLine
    ? canApproveLine
      ? undefined
      : "Line approval is available for live BOQ lines that are not converted."
    : "Select a BOQ line before approval.";
  const convertLineReason = preview && selectedLine
    ? canConvertLine
      ? undefined
      : "Conversion is available after a live BOQ line is reviewed."
    : "Select a BOQ line before conversion.";
  const bulkConvertReason = !activeRequirement
    ? "Select a BOQ before converting reviewed lines."
    : !isLivePlanningRecord(activeRequirement)
      ? "Bulk conversion is available for live BOQ batches only."
      : reviewedLineCount === 0
        ? "No reviewed BOQ lines are ready for bulk conversion."
        : undefined;

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !canConvertLine, label: convertLineMutation.isPending ? "Converting line" : "Convert selected line", onClick: preview && selectedLine && canConvertLine ? () => convertLineMutation.mutate({ requirement: preview, line: selectedLine }) : undefined, reason: convertLineReason }]} secondary={[{ disabled: !canApproveLine, label: approveLineMutation.isPending ? "Approving line" : "Approve selected line", onClick: preview && selectedLine && canApproveLine ? () => approveLineMutation.mutate({ requirement: preview, line: selectedLine }) : undefined, reason: approveLineReason }]} utility={[{ disabled: !canBulkConvert, label: bulkConvertMutation.isPending ? "Converting reviewed lines" : "Convert reviewed lines", onClick: activeRequirement && canBulkConvert ? () => bulkConvertMutation.mutate(activeRequirement) : undefined, reason: bulkConvertReason }]} testId="boq-action-bar" /></>}
        aside={
          <Card title="BOQ cutline" description="Overrides are explicit; conversion remains tied to approved BOQ requirement lines.">
            {preview ? (
              <div className="utility-grid">
                <Tile eyebrow={preview.status} label="Shortage lines" meta={preview.mrpRunLabel}>{preview.shortageCount}</Tile>
                <Tile eyebrow="Actions" label="BUY/MAKE/TRANSFER" meta={preview.sourceDocument}>{`${preview.buyCount}/${preview.makeCount}/${preview.transferCount}`}</Tile>
              </div>
            ) : null}
          </Card>
        }
        description="Net requirements after explosion and stock netting with action overrides."
        filters={
          <ErpFilterBar
            ariaLabel="BOQ filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="boq-filter-bar"
          >
            <input aria-label="Search BOQ requirements" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search component, order, MRP run" value={search} />
            <select aria-label="BOQ status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Converted">Converted</option>
            </select>
          </ErpFilterBar>
        }
        title="BOQ / Requirements"
      >
        <KpiStrip items={[{ label: "BOQs", value: String(records.length) }, { label: "Shortage lines", value: String(records.reduce((total, record) => total + record.shortageCount, 0)) }, { label: "BUY", value: String(records.reduce((total, record) => total + record.buyCount, 0)) }, { label: "MAKE", value: String(records.reduce((total, record) => total + record.makeCount, 0)) }, { label: "TRANSFER", value: String(records.reduce((total, record) => total + record.transferCount, 0)) }]} />
        <Card title="Requirement headers" description="Planner selects a BOQ before reviewing netted component lines.">
          <ErpGrid ariaLabel="BOQ requirement headers" columns={boqHeaderColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => { setSelectedId(record.id); setSelectedLineId(null); }} records={records} rowLabel={(record) => `${record.sourceDocument} boq requirement`} testId="boq-header-grid" />
        </Card>
        <Card title="Net requirement lines" description={preview ? `${preview.sourceDocument} - ${preview.status}` : "Select a BOQ to inspect line actions."}>
          <ErpGrid ariaLabel="BOQ requirement lines" columns={boqLineColumns} getRowId={(record) => record.id} onRowSelect={(record) => setSelectedLineId(record.id)} records={preview?.lines ?? []} rowLabel={(record) => `${record.itemLabel} boq requirement line`} testId="boq-line-grid" />
        </Card>
        {actionMessage ? <Card title="BOQ action status" description={actionMessage}><StatusBadge status={actionMessage.includes("approved") || actionMessage.includes("converted") ? "Completed" : "Review"} /></Card> : null}
      </ListPageShell>
      <ErpModalWorkspace
        description="BOQ requirement detail is review-only until override and conversion workflows are enabled."
        footer={<ErpActionBar primary={[{ disabled: !canApproveLine, label: approveLineMutation.isPending ? "Approving line" : "Approve selected line", onClick: preview && selectedLine && canApproveLine ? () => approveLineMutation.mutate({ requirement: preview, line: selectedLine }) : undefined, reason: approveLineReason }]} secondary={[{ disabled: !canConvertLine, label: convertLineMutation.isPending ? "Converting line" : "Convert selected line", onClick: preview && selectedLine && canConvertLine ? () => convertLineMutation.mutate({ requirement: preview, line: selectedLine }) : undefined, reason: convertLineReason }, { disabled: !canBulkConvert, label: bulkConvertMutation.isPending ? "Converting reviewed lines" : "Convert reviewed lines", onClick: activeRequirement && canBulkConvert ? () => bulkConvertMutation.mutate(activeRequirement) : undefined, reason: bulkConvertReason }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.sourceDocument ?? "BOQ requirement"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Action override controls">
            <ErpLookupField disabled disabledReason="Source document is controlled by demand planning." label="Source document" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} />
            <ErpLookupField disabled disabledReason="MRP run is selected from the planning run register." label="MRP run" onChange={() => undefined} options={[{ label: selected.mrpRunLabel, value: selected.mrpRunLabel }]} value={selected.mrpRunLabel} />
            <ErpLookupField disabled disabledReason="Conversion status is controlled by planning approval workflow." label="Conversion status" onChange={() => undefined} options={[{ label: selected.status, value: selected.status }]} value={selected.status} />
            {selectedLine ? (
              <>
                <ErpLookupField disabled disabledReason="Item selection is controlled by Item Master." label="Selected item" onChange={() => undefined} options={[{ label: selectedLine.itemLabel, value: selectedLine.itemLabel }]} value={selectedLine.itemLabel} />
                <ErpLookupField disabled disabledReason="Approved action is controlled by BOQ review." label="Approved action" onChange={() => undefined} options={[{ label: selectedLine.approvedAction, value: selectedLine.approvedAction }]} value={selectedLine.approvedAction} />
              </>
            ) : null}
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
