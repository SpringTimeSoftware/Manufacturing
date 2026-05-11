import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  listAuditTrail,
  listRoleMatrix,
  listUserDirectory,
  type AuditTrailItem,
  type RoleMatrixItem,
  type UserDirectoryItem
} from "../platform/platformAdminAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpLookupField, ErpModalWorkspace } from "../ui/ErpComponents";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function AdapterBadge() {
  return <Badge tone="info">Admin review</Badge>;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatSnapshot(value: unknown, emptyText: string) {
  if (value === null || value === undefined || value === "") {
    return emptyText;
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

const userColumns: DataGridColumn<UserDirectoryItem>[] = [
  {
    key: "user",
    header: "User",
    width: "28%",
    render: (record) => (
      <div>
        <strong>{record.displayName}</strong>
        <div className="muted">{`${record.userName} - ${record.email}`}</div>
      </div>
    )
  },
  {
    key: "roles",
    header: "Roles",
    width: "18%",
    render: (record) => record.roles.join(", ")
  },
  {
    key: "branches",
    header: "Branch access",
    width: "18%",
    render: (record) => record.branchAccess.join(", ")
  },
  {
    key: "policy",
    header: "Login policy",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{record.loginPolicy}</strong>
        <div className="muted">{record.deviceBinding}</div>
      </div>
    )
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => (
      <Badge
        tone={
          record.status === "Active"
            ? "success"
            : record.status === "Pending Invite"
              ? "info"
              : record.status === "Locked"
                ? "danger"
                : "warn"
        }
      >
        {record.status}
      </Badge>
    )
  }
];

const roleColumns: DataGridColumn<RoleMatrixItem>[] = [
  {
    key: "role",
    header: "Role",
    width: "24%",
    render: (record) => (
      <div>
        <strong>{record.label}</strong>
        <div className="muted">{record.roleCode}</div>
      </div>
    )
  },
  {
    key: "audience",
    header: "Audience",
    width: "20%",
    render: (record) => record.audience
  },
  {
    key: "scope",
    header: "Scope mode",
    width: "18%",
    render: (record) => record.scopeMode
  },
  {
    key: "coverage",
    header: "Coverage",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{`${record.activeUsers} users`}</strong>
        <div className="muted">{record.mobileSurface}</div>
      </div>
    )
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <Badge tone={record.status === "Standard" ? "info" : "warn"}>{record.status}</Badge>
  }
];

export function UserManagementPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const query = useApiQuery(["platform", "users"], () => listUserDirectory(session), { staleTime: 60_000 });
  const records = query.data ?? [];
  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          `${record.displayName} ${record.userName} ${record.email} ${record.roles.join(" ")}`
            .toLowerCase()
            .includes(deferredSearch.toLowerCase());
        const matchesStatus = statusFilter === "all" || record.status === statusFilter;
        const matchesRole = roleFilter === "all" || record.roles.includes(roleFilter as UserDirectoryItem["roles"][number]);
        return matchesSearch && matchesStatus && matchesRole;
      }),
    [deferredSearch, records, roleFilter, statusFilter]
  );
  const selected = filtered.find((record) => record.id === selectedId) ?? null;
  const exportUsers = () =>
    downloadCsv(
      "user-directory.csv",
      ["User name", "Display name", "Email", "Roles", "Branch access", "Status", "Login policy", "Device binding"],
      filtered.map((record) => [
        record.userName,
        record.displayName,
        record.email,
        record.roles.join("; "),
        record.branchAccess.join("; "),
        record.status,
        record.loginPolicy,
        record.deviceBinding
      ])
    );

  return (
    <>
      <ListPageShell
        actions={
          <>
            <AdapterBadge />
            <ErpActionBar
              primary={[{ disabled: true, label: "Invite user", reason: "User invitations require the approved access workflow." }]}
              secondary={[
                {
                  disabled: query.isError || filtered.length === 0,
                  label: "Export",
                  onClick: exportUsers,
                  reason: query.isError ? "User directory must load before export." : "No users are available for export."
                }
              ]}
              testId="user-management-action-bar"
            />
          </>
        }
        aside={
          <Card title="Access setup note" description="Review users and role assignments before applying production access changes.">
            <div className="notification-item">
              <strong>Access governance</strong>
              <p>Access records stay reviewable while administrators finalize the approval and assignment process.</p>
            </div>
          </Card>
        }
        description="Manage web users, access status, login policy, and branch scope within approved admin controls."
        filters={
          <FilterBar>
            <input
              onChange={(event) => {
                startTransition(() => setSearch(event.target.value));
              }}
              placeholder="Search name, user, email, or role"
              value={search}
            />
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Pending Invite">Pending invite</option>
              <option value="Locked">Locked</option>
              <option value="Suspended">Suspended</option>
            </select>
            <select onChange={(event) => setRoleFilter(event.target.value)} value={roleFilter}>
              <option value="all">Role: Any</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="CompanyAdmin">CompanyAdmin</option>
              <option value="PlatformAdmin">PlatformAdmin</option>
              <option value="PlanningManager">PlanningManager</option>
              <option value="PlantHead">PlantHead</option>
              <option value="DispatchManager">DispatchManager</option>
            </select>
          </FilterBar>
        }
        title="User Management"
      >
        <KpiStrip
          items={[
            { label: "Users", value: String(records.length) },
            { label: "Active", value: String(records.filter((record) => record.status === "Active").length) },
            { label: "Locked", value: String(records.filter((record) => record.status === "Locked").length) },
            { label: "Pending Invite", value: String(records.filter((record) => record.status === "Pending Invite").length) }
          ]}
        />

        {query.isError ? (
          <EmptyState
            description="Live user directory could not be loaded for the current operating context."
            hint={query.error instanceof Error ? query.error.message : undefined}
            title="User directory unavailable"
          />
        ) : null}
        <Card title="User directory" description="Dense access review with branch, role, and login-policy context.">
          <DataGrid
            ariaLabel="User management directory"
            columns={userColumns}
            emptyState={{
              title: "No users match the current filter",
              description: "Adjust the search or filter values to restore the current admin view."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={filtered}
            rowLabel={(record) => `${record.displayName} user details`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Review user access, device policy, and branch scope before approved access changes."
        footer={
          <ErpActionBar
            primary={[{ disabled: true, label: "Save access policy", reason: "Access policy changes require the approved admin workflow." }]}
            secondary={[{ disabled: true, label: "Reset access", reason: "Access reset requires security approval." }]}
            utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.displayName ?? "User detail"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Status", value: selected.status },
                { label: "Last Login", value: selected.lastLogin },
                { label: "Roles", value: String(selected.roles.length) },
                { label: "Branches", value: String(selected.branchAccess.length) }
              ]}
            />
            <FormShell initialFingerprint={selected.id} title="Access policy">
              <label>
                <span>Display name</span>
                <input disabled readOnly title="Display name changes require the approved access workflow." value={selected.displayName} />
              </label>
              <ErpLookupField
                disabled
                disabledReason="Login policy changes require the approved access workflow."
                label="Login policy"
                onChange={() => undefined}
                options={[{ label: selected.loginPolicy, value: selected.loginPolicy }]}
                value={selected.loginPolicy}
              />
              <ErpLookupField
                disabled
                disabledReason="Branch access is controlled by company and branch authorization."
                label="Branch access"
                onChange={() => undefined}
                options={selected.branchAccess.map((branch) => ({ label: branch, value: branch }))}
                value={selected.branchAccess[0] ?? ""}
              />
              <ErpLookupField
                disabled
                disabledReason="Device binding changes require security approval."
                label="Device binding"
                onChange={() => undefined}
                options={[{ label: selected.deviceBinding, value: selected.deviceBinding }]}
                value={selected.deviceBinding}
              />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function RolePermissionMatrixPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const query = useApiQuery(["platform", "roles"], () => listRoleMatrix(session), { staleTime: 60_000 });
  const records = query.data ?? [];
  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          `${record.label} ${record.roleCode} ${record.audience} ${record.permissions.map((entry) => entry.module).join(" ")}`
            .toLowerCase()
            .includes(deferredSearch.toLowerCase());
        const matchesStatus = statusFilter === "all" || record.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [deferredSearch, records, statusFilter]
  );
  const selected = filtered.find((record) => record.id === selectedId) ?? null;
  const exportRoles = () =>
    downloadCsv(
      "role-permission-matrix.csv",
      ["Role code", "Role label", "Audience", "Scope mode", "Active users", "Mobile surface", "Status", "Permissions"],
      filtered.map((record) => [
        record.roleCode,
        record.label,
        record.audience,
        record.scopeMode,
        String(record.activeUsers),
        record.mobileSurface,
        record.status,
        record.permissions.map((permission) => `${permission.module}:${permission.access}:${permission.dataScope}`).join("; ")
      ])
    );

  return (
    <>
      <ListPageShell
        actions={
          <>
            <AdapterBadge />
            <ErpActionBar
              primary={[{ disabled: true, label: "Create custom role", reason: "Custom role creation requires the approved role governance workflow." }]}
              secondary={[
                {
                  disabled: query.isError || filtered.length === 0,
                  label: "Export matrix",
                  onClick: exportRoles,
                  reason: query.isError ? "Role matrix must load before export." : "No roles are available for export."
                }
              ]}
              testId="role-permission-action-bar"
            />
          </>
        }
        description="Role templates, action rights, and data-scope guardrails for administrative setup and approvals."
        filters={
          <FilterBar>
            <input
              onChange={(event) => {
                startTransition(() => setSearch(event.target.value));
              }}
              placeholder="Search role, audience, or module"
              value={search}
            />
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">Role type: Any</option>
              <option value="Standard">Standard</option>
              <option value="Custom">Custom</option>
            </select>
          </FilterBar>
        }
        title="Role & Permission Matrix"
      >
        <KpiStrip
          items={[
            { label: "Role templates", value: String(records.length) },
            { label: "Custom roles", value: String(records.filter((record) => record.status === "Custom").length) },
            { label: "Admin roles", value: String(records.filter((record) => record.roleCode.includes("Admin")).length) },
            { label: "Approval-capable", value: String(records.filter((record) => record.permissions.some((entry) => entry.access === "Approve")).length) }
          ]}
        />

        {query.isError ? (
          <EmptyState
            description="Live role matrix could not be loaded for the current operating context."
            hint={query.error instanceof Error ? query.error.message : undefined}
            title="Role matrix unavailable"
          />
        ) : null}
        <Card title="Role templates" description="Scope and permission review without leaving the matrix list context.">
          <DataGrid
            ariaLabel="Role permission matrix"
            columns={roleColumns}
            emptyState={{
              title: "No roles match the current filter",
              description: "Adjust the search or role-type filter to restore the permission templates."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={filtered}
            rowLabel={(record) => `${record.label} role detail`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Review permission modules, access type, and data scope for the selected role."
        footer={
          <ErpActionBar
            primary={[{ disabled: true, label: "Save template", reason: "Role template changes require the approved role governance workflow." }]}
            secondary={[{ disabled: true, label: "Clone role", reason: "Role cloning requires custom-role governance approval." }]}
            utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.label ?? "Role detail"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Users", value: String(selected.activeUsers) },
                { label: "Scope", value: selected.scopeMode },
                { label: "Mobile", value: selected.mobileSurface },
                { label: "Status", value: selected.status }
              ]}
            />

            <Card title="Permission lanes" description="Audit-friendly access summary for the selected role template.">
              <div className="utility-grid">
                {selected.permissions.map((permission) => (
                  <Tile
                    eyebrow={permission.access}
                    key={`${selected.id}-${permission.module}`}
                    label={permission.module}
                    meta={permission.dataScope}
                  >
                    {`${permission.access} access with ${permission.dataScope.toLowerCase()} scope.`}
                  </Tile>
                ))}
              </div>
            </Card>

            <FormShell initialFingerprint={selected.id} title="Role template editor">
              <label>
                <span>Role label</span>
                <input disabled readOnly title="Role label changes require the approved role governance workflow." value={selected.label} />
              </label>
              <ErpLookupField
                disabled
                disabledReason="Role audience is controlled by role governance."
                label="Audience"
                onChange={() => undefined}
                options={[{ label: selected.audience, value: selected.audience }]}
                value={selected.audience}
              />
              <ErpLookupField
                disabled
                disabledReason="Data scope changes require role governance approval."
                label="Scope mode"
                onChange={() => undefined}
                options={[{ label: selected.scopeMode, value: selected.scopeMode }]}
                value={selected.scopeMode}
              />
              <ErpLookupField
                disabled
                disabledReason="Mobile surface changes require role governance approval."
                label="Mobile surface"
                onChange={() => undefined}
                options={[{ label: selected.mobileSurface, value: selected.mobileSurface }]}
                value={selected.mobileSurface}
              />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const auditColumns: DataGridColumn<AuditTrailItem>[] = [
  {
    key: "created",
    header: "Created",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{new Date(record.createdOn).toLocaleString("en-IN")}</strong>
        <div className="muted">{record.clientType}</div>
      </div>
    )
  },
  {
    key: "module",
    header: "Module",
    width: "14%",
    render: (record) => <Badge tone={record.module === "platform" ? "info" : "neutral"}>{record.module}</Badge>
  },
  {
    key: "entity",
    header: "Entity",
    width: "22%",
    render: (record) => (
      <div>
        <strong>{record.entityType}</strong>
        <div className="muted">{record.entityId ?? "No entity id"}</div>
      </div>
    )
  },
  {
    key: "action",
    header: "Action",
    width: "24%",
    render: (record) => record.actionCode
  },
  {
    key: "scope",
    header: "Scope",
    width: "12%",
    render: (record) => `${record.companyId ?? "Tenant"} / ${record.branchId ?? "All"}`
  },
  {
    key: "actor",
    header: "Actor",
    width: "10%",
    render: (record) => record.createdByUserId ?? "System"
  }
];

export function AuditTrailPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const deferredSearch = useDeferredValue(search);

  const query = useApiQuery(
    ["platform", "audit-trail", moduleFilter, actionFilter, deferredSearch],
    () =>
      listAuditTrail(session, {
        search: deferredSearch,
        module: moduleFilter,
        actionCode: actionFilter,
        pageSize: 50
      }),
    { staleTime: 30_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const actionOptions = Array.from(new Set(records.map((record) => record.actionCode))).sort();

  return (
    <>
      <ListPageShell
        actions={
          <>
            <Badge tone="success">Live audit viewer</Badge>
            <ErpActionBar
              secondary={[
                {
                  disabled: query.isError || records.length === 0,
                  label: "Export audit",
                  onClick: () =>
                    downloadCsv(
                      "audit-trail.csv",
                      ["Created", "Module", "Entity type", "Action", "Entity id", "Actor", "Correlation"],
                      records.map((record) => [
                        record.createdOn,
                        record.module,
                        record.entityType,
                        record.actionCode,
                        record.entityId ?? "",
                        String(record.createdByUserId ?? "System"),
                        record.correlationId
                      ])
                    ),
                  reason: query.isError
                    ? "Audit events must load before export."
                    : "No audit events are available for export."
                }
              ]}
              testId="audit-trail-action-bar"
            />
          </>
        }
        description="Role-scoped audit review for approvals, notifications, attachments, integrations, and governed admin actions."
        filters={
          <FilterBar>
            <input
              onChange={(event) => {
                startTransition(() => setSearch(event.target.value));
              }}
              placeholder="Search action, entity, or correlation"
              value={search}
            />
            <select onChange={(event) => setModuleFilter(event.target.value)} value={moduleFilter}>
              <option value="all">Module: All</option>
              <option value="platform">Platform</option>
              <option value="integration">Integration</option>
              <option value="ai">AI</option>
              <option value="engineering">Engineering</option>
              <option value="planning">Planning</option>
              <option value="production">Production</option>
              <option value="inventory">Inventory</option>
              <option value="quality">Quality</option>
              <option value="dispatch">Dispatch</option>
            </select>
            <select onChange={(event) => setActionFilter(event.target.value)} value={actionFilter}>
              <option value="all">Action: All</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </FilterBar>
        }
        title="Audit Trail"
      >
        <KpiStrip
          items={[
            { label: "Events", value: String(records.length) },
            { label: "Platform", value: String(records.filter((record) => record.module === "platform").length) },
            { label: "Integration", value: String(records.filter((record) => record.module === "integration").length) },
            { label: "Actors", value: String(new Set(records.map((record) => record.createdByUserId ?? "System")).size) }
          ]}
        />

        {query.isError ? (
          <EmptyState
            description="Live audit events could not be loaded for the current operating context."
            hint={query.error instanceof Error ? query.error.message : undefined}
            title="Audit trail unavailable"
          />
        ) : null}
        <Card title="Audit events" description="Time-ordered, role-scoped actions with entity and correlation context.">
          <DataGrid
            ariaLabel="Audit trail events"
            columns={auditColumns}
            emptyState={{
              title: "No audit events match the current filter",
              description: "Adjust the search, module, or action filters to restore audit activity."
            }}
            getRowId={(record) => String(record.id)}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.actionCode} ${record.entityType}`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Review event scope, actor, correlation, and captured snapshots."
        footer={<ErpActionBar utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.actionCode ?? "Audit event"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Module", value: selected.module },
                { label: "Entity", value: selected.entityType },
                { label: "Actor", value: String(selected.createdByUserId ?? "System") },
                { label: "Client", value: selected.clientType }
              ]}
            />
            <FormShell initialFingerprint={String(selected.id)} title="Audit event detail">
              <label>
                <span>Correlation ID</span>
                <input disabled readOnly value={selected.correlationId} />
              </label>
              <label>
                <span>Entity ID</span>
                <input disabled readOnly value={selected.entityId ?? ""} />
              </label>
              <label>
                <span>Before snapshot</span>
                <textarea disabled readOnly rows={4} value={formatSnapshot(selected.beforeSnapshot, "No before snapshot captured.")} />
              </label>
              <label>
                <span>After snapshot</span>
                <textarea disabled readOnly rows={5} value={formatSnapshot(selected.afterSnapshot, "No after snapshot captured.")} />
              </label>
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
