import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type { QueryFilter } from "../api/contracts";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  listBranchSetup,
  listBinSetup,
  listCompanySetup,
  listDepartmentSetup,
  listShiftSetup,
  listWarehouseSetup,
  type BinSetupItem,
  type BranchSetupItem,
  type CompanySetupItem,
  type DepartmentSetupItem,
  type ShiftSetupItem,
  type WarehouseSetupItem,
  type SetupDataSource
} from "../organization/organizationAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpFilterBar, ErpGrid, ErpLookupField, ErpModalWorkspace, ErpStatusChip } from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: SetupDataSource }) {
  return <Badge tone={source === "Live" ? "success" : "neutral"}>{source === "Live" ? "Live records" : "Review mode"}</Badge>;
}

function buildOrganizationFilter(
  companyId?: number | null,
  branchId?: number | null,
  search?: string,
  status?: string
): QueryFilter {
  return {
    branchId: branchId ?? undefined,
    companyId: companyId ?? undefined,
    page: 1,
    pageSize: 25,
    search: search?.trim() ? search.trim() : undefined,
    status: status && status !== "all" ? status : undefined
  };
}

const companyColumns: DataGridColumn<CompanySetupItem>[] = [
  { key: "code", header: "Company", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Legal entity",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.legalName}</div>
      </div>
    )
  },
  { key: "tax", header: "Tax / Currency", width: "18%", render: (record) => `${record.taxRegistrationNo} / ${record.baseCurrencyCode}` },
  { key: "calendar", header: "Calendar", width: "16%", render: (record) => record.calendarCode },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const branchColumns: DataGridColumn<BranchSetupItem>[] = [
  { key: "code", header: "Branch", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Plant / site",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.branchType}</div>
      </div>
    )
  },
  { key: "defaultWarehouse", header: "Default warehouse", width: "18%", render: (record) => record.defaultWarehouse },
  { key: "contact", header: "Contact", width: "20%", render: (record) => record.contactEmail },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge>
  }
];

const departmentColumns: DataGridColumn<DepartmentSetupItem>[] = [
  { key: "code", header: "Department", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Name",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.departmentType}</div>
      </div>
    )
  },
  { key: "parent", header: "Parent", width: "16%", render: (record) => record.parentDepartment },
  { key: "manager", header: "Manager", width: "18%", render: (record) => record.manager },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge>
  }
];

const warehouseColumns: DataGridColumn<WarehouseSetupItem>[] = [
  { key: "code", header: "Warehouse", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Store",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.warehouseType}</div>
      </div>
    )
  },
  {
    key: "defaults",
    header: "Defaults",
    width: "18%",
    render: (record) => (
      <div className="context-chip-row">
        {record.defaultReceiving ? <Badge tone="info">Receiving</Badge> : null}
        {record.defaultIssue ? <Badge tone="warn">Issue</Badge> : null}
        {record.dispatchEnabled ? <Badge tone="success">Dispatch</Badge> : null}
      </div>
    )
  },
  {
    key: "rules",
    header: "Rules",
    width: "18%",
    render: (record) => (record.allowsMixedLots ? "Mixed lots allowed" : "Single lot discipline")
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge>
  }
];

const binColumns: DataGridColumn<BinSetupItem>[] = [
  { key: "code", header: "Bin", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Location",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.binType}</div>
      </div>
    )
  },
  { key: "capacity", header: "Capacity", width: "14%", render: (record) => record.capacityLabel },
  { key: "cycle", header: "Cycle count", width: "16%", render: (record) => record.cycleCountLabel },
  {
    key: "block",
    header: "Stock status",
    width: "16%",
    render: (record) => (
      <Badge tone={record.isBlocked ? "danger" : "success"}>{record.isBlocked ? record.blockReason : "Available"}</Badge>
    )
  }
];

const shiftColumns: DataGridColumn<ShiftSetupItem>[] = [
  { key: "code", header: "Shift", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Calendar slot",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.calendarProfileCode}</div>
      </div>
    )
  },
  { key: "window", header: "Time", width: "20%", render: (record) => `${record.startTime} - ${record.endTime}` },
  { key: "break", header: "Break", width: "12%", render: (record) => `${record.breakMinutes} min` },
  {
    key: "status",
    header: "Status",
    width: "14%",
    render: (record) => (
      <Badge tone={record.crossesMidnight ? "warn" : record.status === "Active" ? "success" : "neutral"}>
        {record.crossesMidnight ? "Cross-midnight" : record.status}
      </Badge>
    )
  }
];

function SetupAside({
  description,
  source
}: {
  description: string;
  endpoint: string;
  source: SetupDataSource;
}) {
  return (
    <Card title="Organization guidance" description={description}>
      <div className="notification-item">
        <strong>Organization records</strong>
        <p>Organization records stay scoped to the active company and branch context.</p>
        <div className="context-chip-row">
          <SourceBadge source={source} />
          <Badge tone="info">Organization foundation</Badge>
        </div>
      </div>
    </Card>
  );
}

export function CompanyMasterPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildOrganizationFilter(undefined, undefined, deferredSearch, status), [deferredSearch, status]);
  const query = useApiQuery(queryKeys.organization.companies(deferredSearch, status), () => listCompanySetup(session, filter), {
    staleTime: 60_000
  });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[
                {
                  disabled: true,
                  label: "New company draft",
                  reason: "Company draft creation is controlled through organization rollout."
                }
              ]}
              secondary={[
                {
                  disabled: true,
                  label: "Export companies",
                  reason: "Company export is pending rollout."
                }
              ]}
              testId="company-master-action-bar"
            />
          </>
        }
        aside={
          <SetupAside
            description="Company setup preserves the existing scoping backbone and verifies legal, currency, calendar, and localization readiness."
            endpoint="/api/companies"
            source={source}
          />
        }
        description="Legal entities, tax basics, base currency, timezone, and calendar setup for deployment-safe organization scoping."
        filters={
          <ErpFilterBar
            ariaLabel="Company master filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="company-master-filter-bar"
          >
            <input
              aria-label="Search companies"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search company, legal name, tax no"
              value={search}
            />
            <select aria-label="Company status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </ErpFilterBar>
        }
        title="Company Master"
      >
        <KpiStrip
          items={[
            { label: "Companies", value: String(records.length) },
            { label: "Active", value: String(records.filter((record) => record.status === "Active").length) },
            { label: "Currencies", value: String(new Set(records.map((record) => record.baseCurrencyCode)).size) },
            { label: "Calendars", value: String(new Set(records.map((record) => record.calendarCode)).size) }
          ]}
        />
        <Card title="Company registry" description="Legal-entity setup remains the top-level scope anchor for every later branch and warehouse screen.">
          <ErpGrid
            ariaLabel="Company master registry"
            columns={companyColumns}
            emptyState={{
              title: "No companies match the current filters",
              description: "Adjust search or status to restore the legal-entity registry."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} company master`}
            testId="company-master-grid"
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Company details stay in-context so setup review does not leave administration."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save company draft", reason: "Company save workflow is not enabled for company setup." }]} secondary={[{ disabled: true, label: "Review audit", reason: "Company audit workflow is not enabled for company setup." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Company detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Company setup">
            <label>
              <span>Company code</span>
              <input defaultValue={selected.code} />
            </label>
            <label>
              <span>Legal name</span>
              <input defaultValue={selected.legalName} />
            </label>
            <label>
              <span>Tax registration</span>
              <input defaultValue={selected.taxRegistrationNo} />
            </label>
            <ErpLookupField disabled disabledReason="Base currency is controlled by commercial currency setup." label="Base currency" onChange={() => undefined} options={[{ label: selected.baseCurrencyCode, value: selected.baseCurrencyCode }]} value={selected.baseCurrencyCode} />
            <ErpLookupField disabled disabledReason="Calendar profile is controlled by organization calendar setup." label="Calendar profile" onChange={() => undefined} options={[{ label: selected.calendarCode, value: selected.calendarCode }]} value={selected.calendarCode} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function BranchMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, undefined, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.branches(user?.activeContext.companyId, deferredSearch, status),
    () => listBranchSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: true, label: "New branch draft", reason: "Branch creation requires organization approval workflow." }]} secondary={[{ disabled: true, label: "Export branches", reason: "Branch export is pending the approved reporting workflow." }]} testId="branch-master-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Branch setup keeps plants, warehouses, timezones, shifts, and contact defaults visible for operations."
            endpoint="/api/branches"
            source={source}
          />
        }
        description="Plant, site, timezone, default warehouse, contact, and shift context for branch-scoped operations."
        filters={
          <FilterBar>
            <input
              aria-label="Search branches"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search branch, plant, warehouse"
              value={search}
            />
            <select aria-label="Branch status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Branch Master"
      >
        <KpiStrip
          items={[
            { label: "Branches", value: String(records.length) },
            { label: "Manufacturing", value: String(records.filter((record) => record.branchType === "Manufacturing").length) },
            { label: "Warehouses", value: String(records.filter((record) => record.branchType === "Warehouse").length) },
            { label: "Timezone", value: records[0]?.timeZoneId ?? "Pending" }
          ]}
        />
        <Card title="Branch registry" description="Branch setup makes plant context explicit before warehouse, shift, and execution screens consume it.">
          <DataGrid
            ariaLabel="Branch master registry"
            columns={branchColumns}
            emptyState={{
              title: "No branches match the current filters",
              description: "Adjust search or status to restore the branch registry."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} branch master`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Branch detail links timezone, default warehouse, shift, and admin contact context."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save branch draft", reason: "Branch save requires organization approval workflow." }]} secondary={[{ disabled: true, label: "Review context users", reason: "Context-user review requires organization approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Branch detail"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Type", value: selected.branchType },
                { label: "Shift", value: selected.defaultShift },
                { label: "Warehouse", value: selected.defaultWarehouse },
                { label: "Status", value: selected.status }
              ]}
            />
            <FormShell initialFingerprint={selected.id} title="Branch setup">
              <label>
                <span>Branch code</span>
                <input defaultValue={selected.code} />
              </label>
              <label>
                <span>Branch name</span>
                <input defaultValue={selected.name} />
              </label>
              <label>
                <span>Contact email</span>
                <input defaultValue={selected.contactEmail} />
              </label>
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function DepartmentMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.departments(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listDepartmentSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: true, label: "New department draft", reason: "Department creation requires organization approval workflow." }]} secondary={[{ disabled: true, label: "Export departments", reason: "Department export is pending the approved reporting workflow." }]} testId="department-master-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Department setup keeps planning, production, quality, stores, and dispatch ownership explicit for scope and workflow rules."
            endpoint="/api/departments"
            source={source}
          />
        }
        description="Sales, planning, production, QC, stores, dispatch, and admin departments for workflow ownership and data scope."
        filters={
          <FilterBar>
            <input
              aria-label="Search departments"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search department, manager, type"
              value={search}
            />
            <select aria-label="Department status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Department Master"
      >
        <KpiStrip
          items={[
            { label: "Departments", value: String(records.length) },
            { label: "Production-facing", value: String(records.filter((record) => ["Production", "Quality", "Stores"].includes(record.departmentType)).length) },
            { label: "Managers assigned", value: String(records.filter((record) => record.manager !== "Unassigned").length) },
            { label: "Status", value: records.every((record) => record.status === "Active") ? "Ready" : "Review" }
          ]}
        />
        <Card title="Department registry" description="Department ownership connects setup, workflows, notifications, and branch-scoped administration.">
          <DataGrid
            ariaLabel="Department master registry"
            columns={departmentColumns}
            emptyState={{
              title: "No departments match the current filters",
              description: "Adjust search or status to restore the department registry."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} department master`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Department detail keeps ownership and scope context available for admin review."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save department draft", reason: "Department save requires organization approval workflow." }]} secondary={[{ disabled: true, label: "Review workflow usage", reason: "Workflow usage review requires organization approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Department detail"}
      >
        {selected ? (
          <>
            <div className="utility-grid">
              <Tile eyebrow={selected.parentDepartment} label="Manager" meta={selected.status}>
                {selected.manager}
              </Tile>
              <Tile eyebrow="Department type" label={selected.departmentType} meta={`Branch ${selected.branchId ?? "All"}`}>
                {selected.code}
              </Tile>
            </div>
            <FormShell initialFingerprint={selected.id} title="Department setup">
              <label>
                <span>Department code</span>
                <input defaultValue={selected.code} />
              </label>
              <label>
                <span>Department name</span>
                <input defaultValue={selected.name} />
              </label>
              <ErpLookupField disabled disabledReason="Department type is controlled by organization setup." label="Department type" onChange={() => undefined} options={[{ label: selected.departmentType, value: selected.departmentType }]} value={selected.departmentType} />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function WarehouseMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.warehouses(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listWarehouseSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: true, label: "New warehouse draft", reason: "Warehouse creation requires organization approval workflow." }]} secondary={[{ disabled: true, label: "Export warehouses", reason: "Warehouse export is pending the approved reporting workflow." }]} testId="warehouse-master-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Warehouse setup preserves branch mapping and WIP/RM/FG semantics without changing inventory posting behavior."
            endpoint="/api/warehouses"
            source={source}
          />
        }
        description="Warehouse type, branch mapping, receiving/issue defaults, dispatch enablement, and stock discipline."
        filters={
          <FilterBar>
            <input
              aria-label="Search warehouses"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search warehouse, type, branch"
              value={search}
            />
            <select aria-label="Warehouse status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Warehouse Master"
      >
        <KpiStrip
          items={[
            { label: "Warehouses", value: String(records.length) },
            { label: "Dispatch enabled", value: String(records.filter((record) => record.dispatchEnabled).length) },
            { label: "Default issue", value: String(records.filter((record) => record.defaultIssue).length) },
            { label: "Mixed-lot stores", value: String(records.filter((record) => record.allowsMixedLots).length) }
          ]}
        />
        <Card title="Warehouse registry" description="Branch-scoped stores for RM, WIP, FG, dispatch, and inventory control.">
          <DataGrid
            ariaLabel="Warehouse master registry"
            columns={warehouseColumns}
            emptyState={{
              title: "No warehouses match the current filters",
              description: "Adjust search or status to restore warehouse setup."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} warehouse master`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Warehouse detail keeps default receiving, issue, dispatch, and stock behavior visible."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save warehouse draft", reason: "Warehouse save requires organization approval workflow." }]} secondary={[{ disabled: true, label: "Review bins", reason: "Bin review requires warehouse setup workflow enablement." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Warehouse detail"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Type", value: selected.warehouseType },
                { label: "Dispatch", value: selected.dispatchEnabled ? "Enabled" : "No" },
                { label: "Mixed lots", value: selected.allowsMixedLots ? "Allowed" : "Blocked" },
                { label: "Negative stock", value: selected.allowsNegativeStock ? "Allowed" : "Blocked" }
              ]}
            />
            <FormShell initialFingerprint={selected.id} title="Warehouse setup">
              <label>
                <span>Warehouse code</span>
                <input defaultValue={selected.code} />
              </label>
              <label>
                <span>Warehouse name</span>
                <input defaultValue={selected.name} />
              </label>
              <ErpLookupField disabled disabledReason="Warehouse type is controlled by warehouse master setup." label="Warehouse type" onChange={() => undefined} options={[{ label: selected.warehouseType, value: selected.warehouseType }]} value={selected.warehouseType} />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function BinMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.bins(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listBinSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: true, label: "New bin draft", reason: "Bin creation requires warehouse setup workflow enablement." }]} secondary={[{ disabled: true, label: "Export bins", reason: "Bin export is pending the approved reporting workflow." }]} testId="bin-master-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Bin setup keeps row/rack/bin capacity, quarantine, and cycle-count rules visible without inventing stock movements."
            endpoint="/api/bins"
            source={source}
          />
        }
        description="Row, rack, staging, quarantine, capacity, default receive/issue, and cycle-count setup."
        filters={
          <FilterBar>
            <input
              aria-label="Search bins"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search bin, warehouse, type, block reason"
              value={search}
            />
            <select aria-label="Bin status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Bin Master"
      >
        <KpiStrip
          items={[
            { label: "Bins", value: String(records.length) },
            { label: "Blocked", value: String(records.filter((record) => record.isBlocked).length) },
            { label: "Cycle count", value: String(records.filter((record) => record.cycleCountLabel !== "Not required").length) },
            { label: "Default issue", value: String(records.filter((record) => record.defaultIssue).length) }
          ]}
        />
        <Card title="Bin registry" description="Warehouse locations and quarantine controls for inventory operations.">
          <DataGrid
            ariaLabel="Bin master registry"
            columns={binColumns}
            emptyState={{
              title: "No bins match the current filters",
              description: "Adjust search or status to restore bin setup."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} bin master`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Bin detail keeps capacity and stock-status controls auditable for warehouse admins."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save bin draft", reason: "Bin save requires warehouse setup workflow enablement." }]} secondary={[{ disabled: true, label: "Review stock usage", reason: "Stock usage review requires warehouse setup workflow enablement." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Bin detail"}
      >
        {selected ? (
          <>
            <div className="utility-grid">
              <Tile eyebrow={selected.binType} label="Capacity" meta={selected.status}>
                {selected.capacityLabel}
              </Tile>
              <Tile eyebrow="Cycle count" label={selected.cycleCountLabel} meta={selected.isBlocked ? selected.blockReason : "Available"}>
                {selected.code}
              </Tile>
            </div>
            <FormShell initialFingerprint={selected.id} title="Bin setup">
              <label>
                <span>Bin code</span>
                <input defaultValue={selected.code} />
              </label>
              <label>
                <span>Bin name</span>
                <input defaultValue={selected.name} />
              </label>
              <label>
                <span>Block reason</span>
                <input defaultValue={selected.blockReason} />
              </label>
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function ShiftCalendarPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.shifts(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listShiftSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: true, label: "New shift draft", reason: "Shift creation requires organization approval workflow." }]} secondary={[{ disabled: true, label: "Export shift calendar", reason: "Shift calendar export is pending the approved reporting workflow." }]} testId="shift-calendar-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Shift setup exposes working windows, breaks, and cross-midnight rules without touching job-card execution."
            endpoint="/api/shifts"
            source={source}
          />
        }
        description="Shift patterns, holiday calendar profile, break minutes, overtime readiness, and cross-midnight controls."
        filters={
          <FilterBar>
            <input
              aria-label="Search shifts"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search shift, time, calendar profile"
              value={search}
            />
            <select aria-label="Shift status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Shift Calendar"
      >
        <KpiStrip
          items={[
            { label: "Shifts", value: String(records.length) },
            { label: "Cross-midnight", value: String(records.filter((record) => record.crossesMidnight).length) },
            { label: "Break minutes", value: String(records.reduce((sum, record) => sum + record.breakMinutes, 0)) },
            { label: "Calendars", value: String(new Set(records.map((record) => record.calendarProfileCode)).size) }
          ]}
        />
        <Card title="Shift calendar registry" description="Working windows and break rules for production and warehouse planning.">
          <DataGrid
            ariaLabel="Shift calendar registry"
            columns={shiftColumns}
            emptyState={{
              title: "No shifts match the current filters",
              description: "Adjust search or status to restore shift setup."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} shift calendar`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Shift detail keeps working window and break rules available for setup review."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save shift draft", reason: "Shift save requires organization approval workflow." }]} secondary={[{ disabled: true, label: "Review machine calendar", reason: "Machine calendar review requires organization approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Shift detail"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Start", value: selected.startTime },
                { label: "End", value: selected.endTime },
                { label: "Break", value: `${selected.breakMinutes} min` },
                { label: "Sequence", value: String(selected.sequenceNo) }
              ]}
            />
            <FormShell initialFingerprint={selected.id} title="Shift setup">
              <label>
                <span>Shift code</span>
                <input defaultValue={selected.code} />
              </label>
              <label>
                <span>Shift name</span>
                <input defaultValue={selected.name} />
              </label>
              <ErpLookupField disabled disabledReason="Calendar profile is controlled by organization calendar setup." label="Calendar profile" onChange={() => undefined} options={[{ label: selected.calendarProfileCode, value: selected.calendarProfileCode }]} value={selected.calendarProfileCode} />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
