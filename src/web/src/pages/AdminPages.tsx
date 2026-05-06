import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  listRoleMatrix,
  listUserDirectory,
  type RoleMatrixItem,
  type UserDirectoryItem
} from "../platform/platformAdminAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpLookupField, ErpModalWorkspace } from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function AdapterBadge() {
  return <Badge tone="info">Admin review</Badge>;
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

  return (
    <>
      <ListPageShell
        actions={
          <>
            <AdapterBadge />
            <ErpActionBar
              primary={[{ disabled: true, label: "Invite user", reason: "User invitations require the approved access workflow." }]}
              secondary={[{ disabled: true, label: "Export", reason: "User export is pending the approved reporting workflow." }]}
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
                <input defaultValue={selected.displayName} />
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

  return (
    <>
      <ListPageShell
        actions={
          <>
            <AdapterBadge />
            <ErpActionBar
              primary={[{ disabled: true, label: "Create custom role", reason: "Custom role creation requires the approved role governance workflow." }]}
              secondary={[{ disabled: true, label: "Export matrix", reason: "Role matrix export is pending the approved reporting workflow." }]}
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
                <input defaultValue={selected.label} />
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
