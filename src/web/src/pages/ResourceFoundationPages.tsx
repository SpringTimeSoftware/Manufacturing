import { useMemo, useState } from "react";
import type {
  MachineDto,
  MachineUpsertRequest,
  ToolDto,
  ToolUpsertRequest,
  WorkCenterDto,
  WorkCenterUpsertRequest
} from "../api/contracts";
import { apiClient } from "../api/http";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter } from "../masters/masterDataAdapters";
import { Card } from "../ui/Card";
import type { DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpEmptyState,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpStatusChip,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

type StatusTone = "info" | "success" | "warn" | "danger" | "neutral";
type WorkCenterDraft = { id: number | null; values: WorkCenterUpsertRequest };
type MachineDraft = { id: number | null; values: MachineUpsertRequest };
type ToolDraft = { id: number | null; values: ToolUpsertRequest };

const statusOptions = ["Active", "Draft", "Inactive"].map(toOption);
const machineStatusOptions = ["Running", "Idle", "Down", "Maintenance"].map(toOption);
const toolTypeOptions = ["Tool", "Die", "Mould", "Fixture", "Gauge"].map(toOption);
const saveAccessReason = "Sign in with company administration access to save resource setup.";
const departmentLookupReason = "Department lookup is required before assigning this resource.";
const capacityUomLookupReason = "Capacity UOM lookup is required before assigning this resource.";
const shiftLookupReason = "Shift setup is required before assigning this resource.";
const machineGroupLookupReason = "Machine-group setup is required before assigning compatibility.";

function toOption(value: string) {
  return { label: value, value };
}

function statusTone(status: string): StatusTone {
  if (status === "Active" || status === "Running") {
    return "success";
  }

  if (status === "Draft" || status === "Idle") {
    return "info";
  }

  if (status === "Down" || status === "Maintenance") {
    return "warn";
  }

  return "neutral";
}

function hasLiveWrite(session: ReturnType<typeof useAuth>["session"]) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

function numericValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function ResourceMessage({ message, tone }: { message: string | null; tone: StatusTone }) {
  return message ? <ErpStatusChip tone={tone}>{message}</ErpStatusChip> : null;
}

function useResourceFilters() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const companyId = user?.activeContext.companyId ?? 1;
  const branchId = user?.activeContext.branchId ?? 10;
  const filter = useMemo(() => buildMasterFilter(companyId, branchId, search, status), [branchId, companyId, search, status]);

  return { branchId, companyId, filter, search, session, setSearch, setStatus, status };
}

function ResourceFilters({
  label,
  placeholder,
  search,
  setSearch,
  setStatus,
  status
}: {
  label: string;
  placeholder: string;
  search: string;
  setSearch: (value: string) => void;
  setStatus: (value: string) => void;
  status: string;
}) {
  return (
    <ErpFilterBar
      ariaLabel={`${label} filters`}
      onClear={() => {
        setSearch("");
        setStatus("all");
      }}
    >
      <input aria-label={`Search ${label}`} onChange={(event) => setSearch(event.target.value)} placeholder={placeholder} value={search} />
      <select aria-label={`${label} status`} onChange={(event) => setStatus(event.target.value)} value={status}>
        <option value="all">Status: Any</option>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </ErpFilterBar>
  );
}

function readonlyLookup(label: string, value: number | string | null | undefined, reason: string) {
  const stringValue = value === null || value === undefined ? "" : String(value);
  return (
    <ErpLookupField
      disabled
      disabledReason={reason}
      label={label}
      onChange={() => undefined}
      options={stringValue ? [{ label: stringValue, value: stringValue }] : []}
      value={stringValue}
    />
  );
}

export function WorkCenterMasterPage() {
  const { branchId, companyId, filter, search, session, setSearch, setStatus, status } = useResourceFilters();
  const canSave = hasLiveWrite(session);
  const [draft, setDraft] = useState<WorkCenterDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<StatusTone>("info");
  const query = useApiQuery(queryKeys.resources.workCenters(companyId, branchId, search, status), () => apiClient.resources.workCenters(filter), {
    staleTime: 60_000
  });
  const rows = query.data?.items ?? [];
  const validation = draft
    ? [
        !draft.values.workCenterCode ? "Work center code is required." : "",
        !draft.values.workCenterName ? "Work center name is required." : "",
        draft.values.parallelCapacityUnits < 1 ? "Parallel capacity must be at least 1." : ""
      ].filter(Boolean)
    : [];

  const columns: DataGridColumn<WorkCenterDto>[] = [
    { key: "code", header: "Work center", render: (row) => <strong>{row.workCenterCode}</strong> },
    { key: "name", header: "Name", render: (row) => row.workCenterName },
    { key: "branch", header: "Branch", render: (row) => row.branchId },
    { key: "parallel", header: "Parallel units", render: (row) => row.parallelCapacityUnits },
    { key: "shift", header: "Shift pattern", render: (row) => row.defaultShiftPatternCode ?? "Not assigned" },
    { key: "status", header: "Status", render: (row) => <ErpStatusChip tone={statusTone(row.status)}>{row.status}</ErpStatusChip> }
  ];

  const openNew = () => {
    setDraft({
      id: null,
      values: {
        branchId,
        capacityUomId: null,
        companyId,
        defaultShiftPatternCode: null,
        departmentId: null,
        parallelCapacityUnits: 1,
        status: "Draft",
        workCenterCode: "WC-NEW",
        workCenterName: "New work center"
      }
    });
    setMessage(null);
  };

  const openEdit = (row: WorkCenterDto) => {
    setDraft({
      id: row.id,
      values: {
        branchId: row.branchId,
        capacityUomId: row.capacityUomId,
        companyId: row.companyId,
        defaultShiftPatternCode: row.defaultShiftPatternCode,
        departmentId: row.departmentId,
        parallelCapacityUnits: row.parallelCapacityUnits,
        status: row.status,
        workCenterCode: row.workCenterCode,
        workCenterName: row.workCenterName
      }
    });
    setMessage(null);
  };

  const updateDraft = (patch: Partial<WorkCenterUpsertRequest>) =>
    setDraft((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));

  const save = async () => {
    if (!draft || validation.length > 0 || !canSave) {
      return;
    }

    try {
      const saved = draft.id
        ? await apiClient.resources.updateWorkCenter(draft.id, draft.values)
        : await apiClient.resources.createWorkCenter(draft.values);
      await query.refetch();
      setDraft({ id: saved.id, values: { ...draft.values, status: saved.status, workCenterCode: saved.workCenterCode, workCenterName: saved.workCenterName } });
      setMessageTone("success");
      setMessage(`Saved ${saved.workCenterCode}.`);
    } catch (error) {
      setMessageTone("danger");
      setMessage(error instanceof Error ? error.message : "Unable to save work center.");
    }
  };

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: !canSave, label: "New work center", onClick: openNew, reason: !canSave ? saveAccessReason : undefined }]} testId="work-center-action-bar" />}
      aside={
        <Card title="Resource control" description="Work centers provide the controlled capacity source for routing, planning, and shop-floor execution.">
          <div className="compact-stack">
            <ErpStatusChip tone="success">API-backed setup</ErpStatusChip>
            <ErpStatusChip tone="info">Capacity controlled</ErpStatusChip>
          </div>
        </Card>
      }
      description="Maintain work centers, branch capacity ownership, and scheduling readiness."
      filters={<ResourceFilters label="work centers" placeholder="Search work center, branch, or status" search={search} setSearch={setSearch} setStatus={setStatus} status={status} />}
      title="Work Centers"
    >
      <KpiStrip
        items={[
          { label: "Work centers", value: String(rows.length) },
          { label: "Active", value: String(rows.filter((row) => row.status === "Active").length) },
          { label: "Parallel units", value: String(rows.reduce((sum, row) => sum + row.parallelCapacityUnits, 0)) }
        ]}
      />
      {query.isError ? (
        <ErpEmptyState
          description={query.error instanceof Error ? query.error.message : "Work center setup could not be loaded."}
          title="Work center setup unavailable"
        />
      ) : null}
      <ErpGrid
        ariaLabel="Work centers"
        columns={columns}
        emptyState={{ description: "No work centers match the current filters.", title: "No work centers" }}
        getRowId={(row) => String(row.id)}
        isLoading={query.isLoading}
        onRowSelect={openEdit}
        records={rows}
        rowLabel={(row) => row.workCenterCode}
        testId="work-center-grid"
      />
      <ErpModalWorkspace
        footer={
          <ErpActionBar
            primary={[{ disabled: !canSave || validation.length > 0, label: "Save work center", onClick: save, reason: !canSave ? saveAccessReason : validation[0] }]}
            secondary={[
              { disabled: true, label: "Inactivate / activate", reason: "Lifecycle changes require resource dependency checks." },
              { disabled: true, label: "View audit", reason: "Resource audit view requires audit trail workflow enablement." }
            ]}
            utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<ResourceMessage message={message} tone={messageTone} />}
        title={draft?.id ? `Work center ${draft.values.workCenterCode}` : "New work center draft"}
        validation={<ErpValidationSummary errors={validation} title="Work center checks" />}
      >
        {draft ? (
          <div className="modal-form-grid" data-testid="work-center-modal">
            <Card title="Work center setup" description="Core resource identity and capacity controls.">
              <div className="form-grid form-grid--three">
                <label className="erp-lookup-field">
                  <span>Work center code</span>
                  <input aria-label="Work center code" onChange={(event) => updateDraft({ workCenterCode: event.target.value })} value={draft.values.workCenterCode} />
                </label>
                <label className="erp-lookup-field">
                  <span>Work center name</span>
                  <input aria-label="Work center name" onChange={(event) => updateDraft({ workCenterName: event.target.value })} value={draft.values.workCenterName} />
                </label>
                {readonlyLookup("Company", draft.values.companyId, "Company is controlled by the active session.")}
                {readonlyLookup("Branch", draft.values.branchId, "Branch is controlled by the active session.")}
                {readonlyLookup("Department", draft.values.departmentId, departmentLookupReason)}
                {readonlyLookup("Capacity UOM", draft.values.capacityUomId, capacityUomLookupReason)}
                {readonlyLookup("Default shift pattern", draft.values.defaultShiftPatternCode, shiftLookupReason)}
                <ErpNumberField label="Parallel capacity units" min={1} onChange={(value) => updateDraft({ parallelCapacityUnits: value ?? 1 })} value={draft.values.parallelCapacityUnits} />
                <ErpLookupField label="Status" onChange={(value) => updateDraft({ status: value })} options={statusOptions} value={draft.values.status} />
              </div>
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

export function MachineMasterPage() {
  const { branchId, companyId, filter, search, session, setSearch, setStatus, status } = useResourceFilters();
  const canSave = hasLiveWrite(session);
  const [draft, setDraft] = useState<MachineDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<StatusTone>("info");
  const machinesQuery = useApiQuery(queryKeys.resources.machines(companyId, branchId, search, status), () => apiClient.resources.machines(filter), {
    staleTime: 60_000
  });
  const workCentersQuery = useApiQuery(queryKeys.resources.workCenters(companyId, branchId, "", "all"), () => apiClient.resources.workCenters(buildMasterFilter(companyId, branchId, "", "all")), {
    staleTime: 60_000
  });
  const rows = machinesQuery.data?.items ?? [];
  const workCenters = workCentersQuery.data?.items ?? [];
  const workCenterOptions = workCenters.map((row) => ({ label: `${row.workCenterCode} - ${row.workCenterName}`, value: String(row.id) }));
  const newDisabledReason = !canSave ? saveAccessReason : workCenterOptions.length === 0 ? "Create a work center before creating a machine." : undefined;
  const validation = draft
    ? [
        !draft.values.machineCode ? "Machine code is required." : "",
        !draft.values.machineName ? "Machine name is required." : "",
        !draft.values.workCenterId ? "Work center is required." : "",
        draft.values.capacityPerHour < 0 ? "Capacity per hour cannot be negative." : ""
      ].filter(Boolean)
    : [];

  const columns: DataGridColumn<MachineDto>[] = [
    { key: "code", header: "Machine", render: (row) => <strong>{row.machineCode}</strong> },
    { key: "name", header: "Name", render: (row) => row.machineName },
    { key: "workCenter", header: "Work center", render: (row) => workCenters.find((center) => center.id === row.workCenterId)?.workCenterCode ?? row.workCenterId },
    { key: "capacity", header: "Capacity / hour", render: (row) => row.capacityPerHour },
    { key: "current", header: "Current", render: (row) => <ErpStatusChip tone={statusTone(row.currentStatus)}>{row.currentStatus}</ErpStatusChip> },
    { key: "status", header: "Status", render: (row) => <ErpStatusChip tone={statusTone(row.status)}>{row.status}</ErpStatusChip> }
  ];

  const openNew = () => {
    const workCenter = workCenters[0];
    if (!workCenter) {
      return;
    }

    setDraft({
      id: null,
      values: {
        branchId,
        capacityPerHour: 0,
        companyId,
        currentStatus: "Idle",
        defaultShiftId: null,
        isSchedulingEnabled: true,
        isUnderMaintenance: false,
        machineCode: "MC-NEW",
        machineName: "New machine",
        status: "Draft",
        workCenterId: workCenter.id
      }
    });
    setMessage(null);
  };

  const openEdit = (row: MachineDto) => {
    setDraft({
      id: row.id,
      values: {
        branchId: row.branchId,
        capacityPerHour: row.capacityPerHour,
        companyId: row.companyId,
        currentStatus: row.currentStatus,
        defaultShiftId: row.defaultShiftId,
        isSchedulingEnabled: row.isSchedulingEnabled,
        isUnderMaintenance: row.isUnderMaintenance,
        machineCode: row.machineCode,
        machineName: row.machineName,
        status: row.status,
        workCenterId: row.workCenterId
      }
    });
    setMessage(null);
  };

  const updateDraft = (patch: Partial<MachineUpsertRequest>) =>
    setDraft((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));

  const save = async () => {
    if (!draft || validation.length > 0 || !canSave) {
      return;
    }

    try {
      const saved = draft.id ? await apiClient.resources.updateMachine(draft.id, draft.values) : await apiClient.resources.createMachine(draft.values);
      await machinesQuery.refetch();
      setDraft({ id: saved.id, values: { ...draft.values, machineCode: saved.machineCode, machineName: saved.machineName, status: saved.status } });
      setMessageTone("success");
      setMessage(`Saved ${saved.machineCode}.`);
    } catch (error) {
      setMessageTone("danger");
      setMessage(error instanceof Error ? error.message : "Unable to save machine.");
    }
  };

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: Boolean(newDisabledReason), label: "New machine", onClick: openNew, reason: newDisabledReason }]} testId="machine-action-bar" />}
      aside={
        <Card title="Machine control" description="Machines use controlled work center assignment for scheduling, occupancy, and execution proof.">
          <div className="compact-stack">
            <ErpStatusChip tone="success">Work center controlled</ErpStatusChip>
            <ErpStatusChip tone="info">Capacity numeric</ErpStatusChip>
          </div>
        </Card>
      }
      description="Maintain machine resources, scheduling flags, and per-hour capacity."
      filters={<ResourceFilters label="machines" placeholder="Search machine, work center, or status" search={search} setSearch={setSearch} setStatus={setStatus} status={status} />}
      title="Machines"
    >
      <KpiStrip
        items={[
          { label: "Machines", value: String(rows.length) },
          { label: "Scheduled", value: String(rows.filter((row) => row.isSchedulingEnabled).length) },
          { label: "Maintenance", value: String(rows.filter((row) => row.isUnderMaintenance).length) }
        ]}
      />
      {machinesQuery.isError ? (
        <ErpEmptyState
          description={machinesQuery.error instanceof Error ? machinesQuery.error.message : "Machine setup could not be loaded."}
          title="Machine setup unavailable"
        />
      ) : null}
      {workCentersQuery.isError ? (
        <ErpEmptyState
          description={workCentersQuery.error instanceof Error ? workCentersQuery.error.message : "Work center lookup could not be loaded."}
          title="Work center lookup unavailable"
        />
      ) : null}
      <ErpGrid
        ariaLabel="Machines"
        columns={columns}
        emptyState={{ description: "No machines match the current filters.", title: "No machines" }}
        getRowId={(row) => String(row.id)}
        isLoading={machinesQuery.isLoading}
        onRowSelect={openEdit}
        records={rows}
        rowLabel={(row) => row.machineCode}
        testId="machine-grid"
      />
      <ErpModalWorkspace
        footer={
          <ErpActionBar
            primary={[{ disabled: !canSave || validation.length > 0, label: "Save machine", onClick: save, reason: !canSave ? saveAccessReason : validation[0] }]}
            secondary={[
              { disabled: true, label: "Inactivate / activate", reason: "Lifecycle changes require resource dependency checks." },
              { disabled: true, label: "View audit", reason: "Resource audit view requires audit trail workflow enablement." }
            ]}
            utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<ResourceMessage message={message} tone={messageTone} />}
        title={draft?.id ? `Machine ${draft.values.machineCode}` : "New machine draft"}
        validation={<ErpValidationSummary errors={validation} title="Machine checks" />}
      >
        {draft ? (
          <div className="modal-form-grid" data-testid="machine-modal">
            <Card title="Machine setup" description="Core machine identity and controlled resource assignment.">
              <div className="form-grid form-grid--three">
                <label className="erp-lookup-field">
                  <span>Machine code</span>
                  <input aria-label="Machine code" onChange={(event) => updateDraft({ machineCode: event.target.value })} value={draft.values.machineCode} />
                </label>
                <label className="erp-lookup-field">
                  <span>Machine name</span>
                  <input aria-label="Machine name" onChange={(event) => updateDraft({ machineName: event.target.value })} value={draft.values.machineName} />
                </label>
                {readonlyLookup("Company", draft.values.companyId, "Company is controlled by the active session.")}
                {readonlyLookup("Branch", draft.values.branchId, "Branch is controlled by the active session.")}
                <ErpLookupField label="Work center" onChange={(value) => updateDraft({ workCenterId: Number(value) })} options={workCenterOptions} required value={String(draft.values.workCenterId || "")} />
                <ErpLookupField
                  disabled
                  disabledReason="Machine type setup is required before this value can be selected."
                  label="Machine type"
                  onChange={() => undefined}
                  options={[]}
                  value=""
                />
                <ErpDecimalField label="Capacity per hour" min={0} onChange={(value) => updateDraft({ capacityPerHour: value ?? 0 })} scale={3} value={numericValue(draft.values.capacityPerHour)} />
                <ErpLookupField label="Current status" onChange={(value) => updateDraft({ currentStatus: value })} options={machineStatusOptions} value={draft.values.currentStatus} />
                {readonlyLookup("Default shift", draft.values.defaultShiftId, shiftLookupReason)}
                <ErpLookupField label="Lifecycle status" onChange={(value) => updateDraft({ status: value })} options={statusOptions} value={draft.values.status} />
                <label className="form-checkbox">
                  <input checked={draft.values.isSchedulingEnabled} onChange={(event) => updateDraft({ isSchedulingEnabled: event.target.checked })} type="checkbox" />
                  <span>Scheduling enabled</span>
                </label>
                <label className="form-checkbox">
                  <input checked={draft.values.isUnderMaintenance} onChange={(event) => updateDraft({ isUnderMaintenance: event.target.checked })} type="checkbox" />
                  <span>Under maintenance</span>
                </label>
              </div>
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

export function ToolResourceMasterPage() {
  const { branchId, companyId, filter, search, session, setSearch, setStatus, status } = useResourceFilters();
  const canSave = hasLiveWrite(session);
  const [draft, setDraft] = useState<ToolDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<StatusTone>("info");
  const query = useApiQuery(queryKeys.resources.tools(companyId, branchId, search, status), () => apiClient.resources.tools(filter), {
    staleTime: 60_000
  });
  const rows = query.data?.items ?? [];
  const validation = draft
    ? [
        !draft.values.toolCode ? "Tool code is required." : "",
        !draft.values.toolName ? "Tool name is required." : "",
        !draft.values.toolType ? "Tool type is required." : ""
      ].filter(Boolean)
    : [];

  const columns: DataGridColumn<ToolDto>[] = [
    { key: "code", header: "Tool/resource", render: (row) => <strong>{row.toolCode}</strong> },
    { key: "name", header: "Name", render: (row) => row.toolName },
    { key: "type", header: "Type", render: (row) => row.toolType },
    { key: "group", header: "Machine group", render: (row) => row.compatibleMachineGroup ?? "Not assigned" },
    { key: "status", header: "Status", render: (row) => <ErpStatusChip tone={statusTone(row.status)}>{row.status}</ErpStatusChip> }
  ];

  const openNew = () => {
    setDraft({
      id: null,
      values: {
        branchId,
        companyId,
        compatibleMachineGroup: null,
        status: "Draft",
        toolCode: "TOOL-NEW",
        toolName: "New tool",
        toolType: "Tool"
      }
    });
    setMessage(null);
  };

  const openEdit = (row: ToolDto) => {
    setDraft({
      id: row.id,
      values: {
        branchId: row.branchId,
        companyId: row.companyId,
        compatibleMachineGroup: row.compatibleMachineGroup,
        status: row.status,
        toolCode: row.toolCode,
        toolName: row.toolName,
        toolType: row.toolType
      }
    });
    setMessage(null);
  };

  const updateDraft = (patch: Partial<ToolUpsertRequest>) =>
    setDraft((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));

  const save = async () => {
    if (!draft || validation.length > 0 || !canSave) {
      return;
    }

    try {
      const saved = draft.id ? await apiClient.resources.updateTool(draft.id, draft.values) : await apiClient.resources.createTool(draft.values);
      await query.refetch();
      setDraft({ id: saved.id, values: { ...draft.values, status: saved.status, toolCode: saved.toolCode, toolName: saved.toolName, toolType: saved.toolType } });
      setMessageTone("success");
      setMessage(`Saved ${saved.toolCode}.`);
    } catch (error) {
      setMessageTone("danger");
      setMessage(error instanceof Error ? error.message : "Unable to save tool.");
    }
  };

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: !canSave, label: "New tool/resource", onClick: openNew, reason: !canSave ? saveAccessReason : undefined }]} testId="tool-action-bar" />}
      aside={
        <Card title="Tool control" description="Tools, dies, moulds, fixtures, and gauges stay controlled before routing or machine assignment.">
          <div className="compact-stack">
            <ErpStatusChip tone="success">Tool type controlled</ErpStatusChip>
            <ErpStatusChip tone="info">Machine compatibility controlled</ErpStatusChip>
          </div>
        </Card>
      }
      description="Maintain tool and resource setup used by routing, maintenance, and operation standards."
      filters={<ResourceFilters label="tools" placeholder="Search tool, type, machine group, or status" search={search} setSearch={setSearch} setStatus={setStatus} status={status} />}
      title="Tools / Resources"
    >
      <KpiStrip
        items={[
          { label: "Tools/resources", value: String(rows.length) },
          { label: "Active", value: String(rows.filter((row) => row.status === "Active").length) },
          { label: "Types", value: String(new Set(rows.map((row) => row.toolType)).size) }
        ]}
      />
      {query.isError ? (
        <ErpEmptyState description={query.error instanceof Error ? query.error.message : "Tool setup could not be loaded."} title="Tool setup unavailable" />
      ) : null}
      <ErpGrid
        ariaLabel="Tools and resources"
        columns={columns}
        emptyState={{ description: "No tools or resources match the current filters.", title: "No tools or resources" }}
        getRowId={(row) => String(row.id)}
        isLoading={query.isLoading}
        onRowSelect={openEdit}
        records={rows}
        rowLabel={(row) => row.toolCode}
        testId="tool-grid"
      />
      <ErpModalWorkspace
        footer={
          <ErpActionBar
            primary={[{ disabled: !canSave || validation.length > 0, label: "Save tool/resource", onClick: save, reason: !canSave ? saveAccessReason : validation[0] }]}
            secondary={[
              { disabled: true, label: "Inactivate / activate", reason: "Lifecycle changes require resource dependency checks." },
              { disabled: true, label: "View audit", reason: "Resource audit view requires audit trail workflow enablement." }
            ]}
            utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<ResourceMessage message={message} tone={messageTone} />}
        title={draft?.id ? `Tool ${draft.values.toolCode}` : "New tool/resource draft"}
        validation={<ErpValidationSummary errors={validation} title="Tool checks" />}
      >
        {draft ? (
          <div className="modal-form-grid" data-testid="tool-modal">
            <Card title="Tool/resource setup" description="Core tool identity, type, and compatibility controls.">
              <div className="form-grid form-grid--three">
                <label className="erp-lookup-field">
                  <span>Tool code</span>
                  <input aria-label="Tool code" onChange={(event) => updateDraft({ toolCode: event.target.value })} value={draft.values.toolCode} />
                </label>
                <label className="erp-lookup-field">
                  <span>Tool name</span>
                  <input aria-label="Tool name" onChange={(event) => updateDraft({ toolName: event.target.value })} value={draft.values.toolName} />
                </label>
                {readonlyLookup("Company", draft.values.companyId, "Company is controlled by the active session.")}
                {readonlyLookup("Branch", draft.values.branchId, "Branch is controlled by the active session.")}
                <ErpLookupField label="Tool type" onChange={(value) => updateDraft({ toolType: value })} options={toolTypeOptions} value={draft.values.toolType} />
                {readonlyLookup("Compatible machine group", draft.values.compatibleMachineGroup, machineGroupLookupReason)}
                <ErpLookupField label="Status" onChange={(value) => updateDraft({ status: value })} options={statusOptions} value={draft.values.status} />
              </div>
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}
