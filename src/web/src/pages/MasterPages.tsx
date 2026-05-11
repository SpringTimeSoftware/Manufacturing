import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  customerRecords,
  itemRecords,
  supplierRecords,
  type DirectoryRecord
} from "../api/mockData";
import { useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { demoScenarios } from "../demo/demoScenarios";
import { useFeatureFlags } from "../featureFlags/FeatureFlagProvider";
import {
  listTenantSettings,
  listTranslationRegistry,
  listWorkflowRules,
  type TenantSettingItem,
  type TranslationRegistryItem,
  type WorkflowNumberingItem
} from "../platform/platformAdminAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpFilterBar, ErpGrid, ErpLookupField, ErpModalWorkspace, ErpStatusChip } from "../ui/ErpComponents";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function AdapterBadge({ label = "Review mode" }: { label?: string }) {
  return <Badge tone="info">{label}</Badge>;
}

const platformReviewReason = "Changes require the approved platform workflow.";

function normalizeApprovalChain(value: string) {
  return value.replace("â†’", "→").replace(/\s*->\s*/g, " → ");
}

function buildDirectoryColumns(): DataGridColumn<DirectoryRecord>[] {
  return [
    { key: "code", header: "Code", width: "18%", render: (record) => <strong>{record.code}</strong> },
    {
      key: "name",
      header: "Name",
      render: (record) => (
        <div>
          <strong>{record.name}</strong>
          <div className="muted">{record.detail}</div>
        </div>
      )
    },
    { key: "owner", header: "Owner", width: "16%", render: (record) => record.owner },
    {
      key: "status",
      header: "Status",
      width: "14%",
      render: (record) => (
        <ErpStatusChip tone={record.status === "Active" || record.status === "Preferred" || record.status === "Approved" ? "success" : "warn"}>
          {record.status}
        </ErpStatusChip>
      )
    }
  ];
}

function DirectoryPage({
  description,
  records,
  seedScenarioId,
  title
}: {
  title: string;
  description: string;
  records: DirectoryRecord[];
  seedScenarioId: string;
}) {
  const { flags } = useFeatureFlags();
  const [selected, setSelected] = useState<DirectoryRecord | null>(records[0] ?? null);
  const scenario = demoScenarios.find((entry) => entry.id === seedScenarioId);

  return (
    <>
      <ListPageShell
        actions={
          <ErpActionBar
            primary={[{ disabled: true, label: "New record", reason: "Record creation is controlled by the dedicated master-data workflow." }]}
            secondary={[{ disabled: true, label: "Export", reason: "Export is pending the governed export workflow." }]}
          />
        }
        aside={
          flags.showDemoBadges && scenario ? (
            <Card title="Guided workflow coverage" description="These records support the curated workflow shortcuts used during operational review.">
              <div className="notification-item">
                <strong>{scenario.title}</strong>
                <p>{scenario.narrative}</p>
                <div className="context-chip-row">
                  <span className="code-chip">Workflow review</span>
                </div>
              </div>
            </Card>
          ) : null
        }
        description={description}
        filters={
          <ErpFilterBar ariaLabel={`${title} filters`}>
            <input placeholder="Search code / name" />
            <select defaultValue="all">
              <option value="all">Status: Any</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </ErpFilterBar>
        }
        title={title}
      >
        <Card title={`${title} registry`} description="Governed master-data list with compact filters and detail workspace.">
          <ErpGrid
            ariaLabel={`${title} directory`}
            columns={buildDirectoryColumns()}
            emptyState={{
              title: `No ${title.toLowerCase()} available`,
              description: "The current workspace did not return any records.",
              hint: flags.showEmptyStateHints ? "Adjust the filters or add a new record from this planning surface." : undefined
            }}
            getRowId={(record) => record.id}
            onRowSelect={setSelected}
            records={records}
            rowLabel={(record) => `${record.code} ${record.name}`}
            virtualization={{ enabled: flags.enableDenseGridVirtualization }}
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Master-data detail workspace with compact validation and governed actions."
        footer={
          <ErpActionBar
            primary={[{ disabled: true, label: "Save draft", reason: "Save is disabled until the dedicated master-data workflow is enabled." }]}
            utility={[{ label: "Close", onClick: () => setSelected(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? title}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title={`${title} editor`}>
            <label>
              <span>Code</span>
              <input disabled readOnly title={platformReviewReason} value={selected.code} />
            </label>
            <label>
              <span>Name</span>
              <input disabled readOnly title={platformReviewReason} value={selected.name} />
            </label>
            <label>
              <span>Owner</span>
              <input disabled readOnly title={platformReviewReason} value={selected.owner} />
            </label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const translationColumns: DataGridColumn<TranslationRegistryItem>[] = [
  { key: "module", header: "Module", width: "14%", render: (record) => record.module },
  {
    key: "key",
    header: "Key",
    width: "24%",
    render: (record) => <span className="code-chip">{record.key}</span>
  },
  { key: "enIn", header: "en-IN", render: (record) => record.enIn },
  { key: "hiIn", header: "hi-IN", render: (record) => record.hiIn },
  {
    key: "status",
    header: "Status",
    width: "14%",
    render: (record) => (
      <div>
        <Badge tone={record.status === "Live Preview" || record.status === "Synced" ? "success" : "warn"}>{record.status}</Badge>
      </div>
    )
  }
];

const workflowColumns: DataGridColumn<WorkflowNumberingItem>[] = [
  {
    key: "documentType",
    header: "Document",
    width: "24%",
    render: (record) => (
      <div>
        <strong>{record.documentType}</strong>
        <div className="muted">{record.seriesPattern}</div>
      </div>
    )
  },
  { key: "workflowOwner", header: "Owner", width: "16%", render: (record) => record.workflowOwner },
  { key: "approvalChain", header: "Approval chain", render: (record) => normalizeApprovalChain(record.approvalChain) },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge>
  }
];

const tenantColumns: DataGridColumn<TenantSettingItem>[] = [
  { key: "group", header: "Group", width: "16%", render: (record) => record.group },
  {
    key: "label",
    header: "Setting",
    width: "28%",
    render: (record) => (
      <div>
        <strong>{record.label}</strong>
        <div className="muted">{record.description}</div>
      </div>
    )
  },
  { key: "value", header: "Value", render: (record) => record.value },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <Badge tone={record.status === "Applied" ? "success" : "warn"}>{record.status}</Badge>
  }
];

export function ItemDirectoryPage() {
  return (
    <DirectoryPage
      description="Item, packaging, barcode, and reference setup remains planner/admin owned on the web."
      records={itemRecords}
      seedScenarioId="mixed-uom"
      title="Items"
    />
  );
}

export function CustomerDirectoryPage() {
  return (
    <DirectoryPage
      description="Customer legal, credit, and commercial context stays in web setup surfaces."
      records={customerRecords}
      seedScenarioId="mto-assembly"
      title="Customers"
    />
  );
}

export function SupplierDirectoryPage() {
  return (
    <DirectoryPage
      description="Supplier compliance and reference maintenance stays in web setup surfaces."
      records={supplierRecords}
      seedScenarioId="outside-processing"
      title="Suppliers"
    />
  );
}

export function TranslationSetupPage() {
  const { flags } = useFeatureFlags();
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const query = useApiQuery(
    ["platform", "translations", moduleFilter, deferredSearch],
    () => listTranslationRegistry(session, moduleFilter, deferredSearch),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;

  return (
    <>
      <ListPageShell
        actions={
          <>
            <Badge tone="success">Localization preview</Badge>
            <ErpActionBar primary={[{ disabled: true, label: "Sync bundle", reason: "Translation sync requires localization approval workflow." }]} secondary={[{ disabled: true, label: "Export bundle", reason: "Translation export is pending the approved reporting workflow." }]} testId="translation-action-bar" />
          </>
        }
        aside={
          <Card title="Localization source" description="This screen previews the active language resources for the current workspace.">
            <div className="notification-item">
              <strong>Active preview</strong>
              <p>Language bundles are shown using the current session and selected module.</p>
            </div>
            <div className="notification-item">
              <strong>Review workflow</strong>
              <p>Translation changes remain in a review flow before they are applied to production users.</p>
            </div>
          </Card>
        }
        description="Translation resource loading, override review, and localization preview for language-aware deployments."
        filters={
          <FilterBar>
            <input
              aria-label="Search translations"
              onChange={(event) => {
                startTransition(() => setSearch(event.target.value));
              }}
              placeholder="Search module, key, or phrase"
              value={search}
            />
            <select onChange={(event) => setModuleFilter(event.target.value)} value={moduleFilter}>
              <option value="all">Module: All</option>
              <option value="Platform">Platform</option>
              <option value="Planning">Planning</option>
              <option value="Production">Production</option>
            </select>
          </FilterBar>
        }
        title="Language & Translation Setup"
      >
        <KpiStrip
          items={[
            { label: "Keys", value: String(records.length) },
            { label: "Live preview", value: String(records.filter((record) => record.source === "Live").length) },
            { label: "Pending review", value: String(records.filter((record) => record.status === "Pending Review").length) },
            { label: "Synced", value: String(records.filter((record) => record.status === "Synced").length) }
          ]}
        />

        {query.isError ? (
          <EmptyState
            description="Live translation resources could not be loaded for the current language context."
            hint={query.error instanceof Error ? query.error.message : undefined}
            title="Translation resources unavailable"
          />
        ) : null}
        <Card title="Translation bundle" description="Platform and module keys with localization review controls.">
          <DataGrid
            ariaLabel="Translation bundle"
            columns={translationColumns}
            emptyState={{
              title: "No translation keys available",
              description: "The current filter did not return any localization resources.",
              hint: flags.showEmptyStateHints ? "Adjust the module or search filter to review available language entries." : undefined
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.module} translation ${record.key}`}
            virtualization={{ enabled: flags.enableDenseGridVirtualization }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Translation key detail, preview values, and override notes."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save translation draft", reason: "Translation save requires localization approval workflow." }]} secondary={[{ disabled: true, label: "Queue review", reason: "Review queue requires localization approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.key ?? "Translation detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Translation editor">
            <ErpLookupField
              disabled
              disabledReason="Module selection requires localization approval workflow."
              label="Module"
              onChange={() => undefined}
              options={[{ label: selected.module, value: selected.module }]}
              value={selected.module}
            />
            <label>
              <span>Key</span>
              <input disabled readOnly title={platformReviewReason} value={selected.key} />
            </label>
            <label>
              <span>English (India)</span>
              <textarea disabled readOnly rows={3} title={platformReviewReason} value={selected.enIn} />
            </label>
            <label>
              <span>Hindi</span>
              <textarea disabled readOnly rows={3} title={platformReviewReason} value={selected.hiIn} />
            </label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function WorkflowNumberingPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const query = useApiQuery(["platform", "workflow-rules"], () => listWorkflowRules(session), { staleTime: 60_000 });
  const records = useMemo(
    () =>
      (query.data ?? []).filter((record) => {
        const matchesSearch =
          `${record.documentType} ${record.seriesPattern} ${record.approvalChain} ${record.notes}`
            .toLowerCase()
            .includes(deferredSearch.toLowerCase());
        const matchesStatus = statusFilter === "all" || record.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [deferredSearch, query.data, statusFilter]
  );
  const selected = records.find((record) => record.id === selectedId) ?? null;

  return (
    <>
      <ListPageShell
        actions={
          <>
            <AdapterBadge />
            <ErpActionBar primary={[{ disabled: true, label: "Save numbering policy", reason: "Numbering policy save requires platform approval workflow." }]} secondary={[{ disabled: true, label: "Export rules", reason: "Workflow-rule export is pending the approved reporting workflow." }]} testId="workflow-numbering-action-bar" />
          </>
        }
        description="Document series, workflow ownership, and transition rules for company-admin controlled documents."
        filters={
          <FilterBar>
            <input
              aria-label="Search workflow rules"
              onChange={(event) => {
                startTransition(() => setSearch(event.target.value));
              }}
              placeholder="Search document, series, or approval chain"
              value={search}
            />
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Workflow & Numbering Setup"
      >
        <KpiStrip
          items={[
            { label: "Templates", value: String(records.length) },
            { label: "Active", value: String(records.filter((record) => record.status === "Active").length) },
            { label: "Draft", value: String(records.filter((record) => record.status === "Draft").length) },
            { label: "Transitions", value: String(records.reduce((sum, record) => sum + record.transitionCount, 0)) }
          ]}
        />

        {query.isError ? (
          <EmptyState
            description="Live workflow and numbering rules could not be loaded for the current operating context."
            hint={query.error instanceof Error ? query.error.message : undefined}
            title="Workflow rules unavailable"
          />
        ) : null}
        <Card title="Workflow templates" description="Series pattern, ownership, and approval chain review for document setup.">
          <DataGrid
            ariaLabel="Workflow numbering setup"
            columns={workflowColumns}
            emptyState={{
              title: "No workflow templates match the current filter",
              description: "Adjust the search or status filter to restore the numbering rules."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.documentType} workflow setup`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Document numbering and approval transitions for admin review."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save workflow draft", reason: "Workflow save requires platform approval workflow." }]} secondary={[{ disabled: true, label: "Clone template", reason: "Template cloning requires platform approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.documentType ?? "Workflow detail"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Series", value: selected.seriesPattern },
                { label: "Owner", value: selected.workflowOwner },
                { label: "Transitions", value: String(selected.transitionCount) },
                { label: "Status", value: selected.status }
              ]}
            />
            <FormShell initialFingerprint={selected.id} title="Workflow template">
              <label>
                <span>Document type</span>
                <input disabled readOnly title={platformReviewReason} value={selected.documentType} />
              </label>
              <label>
                <span>Series pattern</span>
                <input disabled readOnly title={platformReviewReason} value={selected.seriesPattern} />
              </label>
              <ErpLookupField
                disabled
                disabledReason="Approval-chain changes require platform approval workflow."
                label="Approval chain"
                onChange={() => undefined}
                options={[{ label: normalizeApprovalChain(selected.approvalChain), value: normalizeApprovalChain(selected.approvalChain) }]}
                value={normalizeApprovalChain(selected.approvalChain)}
              />
              <label>
                <span>Notes</span>
                <textarea disabled readOnly rows={4} title={platformReviewReason} value={selected.notes} />
              </label>
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function TenantSettingsPage() {
  const { session } = useAuth();
  const { flags, setFlag } = useFeatureFlags();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useApiQuery(
    [
      "platform",
      "tenant-settings",
      flags.enableNotificationCenter,
      flags.enablePrintAndExport,
      flags.showSeededNavigation,
      flags.enableDenseGridVirtualization
    ],
    () => listTenantSettings(session, flags),
    { staleTime: 1_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;

  return (
    <>
      <ListPageShell
        actions={
          <>
            <AdapterBadge />
            <ErpActionBar primary={[{ disabled: true, label: "Save tenant settings", reason: "Tenant setting save requires platform approval workflow." }]} secondary={[{ disabled: true, label: "Export tenant snapshot", reason: "Tenant export is pending the approved reporting workflow." }]} testId="tenant-settings-action-bar" />
          </>
        }
        description="Feature flags and tenant settings that keep production rollout behavior clear."
        title="Tenant Settings"
      >
        <KpiStrip
          items={[
            { label: "Setting groups", value: String(new Set(records.map((record) => record.group)).size) },
            { label: "Applied", value: String(records.filter((record) => record.status === "Applied").length) },
            { label: "Feature flags", value: String(records.filter((record) => record.group === "Feature Flags").length) },
            { label: "Deployment mode", value: "Approved release" }
          ]}
        />

        <div className="split-panels">
          <FormShell initialFingerprint="tenant-feature-flags" title="Feature flags">
            <label>
              <span>Enable notification center</span>
              <select
                onChange={(event) => setFlag("enableNotificationCenter", event.target.value === "enabled")}
                value={flags.enableNotificationCenter ? "enabled" : "disabled"}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
            <label>
              <span>Enable dense grid virtualization</span>
              <select
                onChange={(event) => setFlag("enableDenseGridVirtualization", event.target.value === "enabled")}
                value={flags.enableDenseGridVirtualization ? "enabled" : "disabled"}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
            <label>
              <span>Enable print and export</span>
              <select
                onChange={(event) => setFlag("enablePrintAndExport", event.target.value === "enabled")}
                value={flags.enablePrintAndExport ? "enabled" : "disabled"}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
            <label>
              <span>Show guided workflows</span>
              <select
                onChange={(event) => setFlag("showSeededNavigation", event.target.value === "enabled")}
                value={flags.showSeededNavigation ? "enabled" : "disabled"}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
          </FormShell>

          <Card title="Deployment notes" description="Tenant settings keep production rollout controls clear and auditable.">
            <div className="notification-item">
              <strong>Controlled publishing</strong>
              <p>Application assets are packaged through the approved release process before deployment.</p>
            </div>
            <div className="notification-item">
              <strong>Feature visibility</strong>
              <p>Module visibility is controlled by deployment settings so teams see only the workspaces assigned to them.</p>
            </div>
          </Card>
        </div>

        {query.isError ? (
          <EmptyState
            description="Live tenant settings could not be loaded for the current operating context."
            hint={query.error instanceof Error ? query.error.message : undefined}
            title="Tenant settings unavailable"
          />
        ) : null}
        <Card title="Tenant policy registry" description="Deployment, localization, attachment, and feature-flag settings in one auditable list.">
          <DataGrid
            ariaLabel="Tenant settings registry"
            columns={tenantColumns}
            emptyState={{
              title: "No tenant settings are available",
              description: "The current filters did not return any tenant policy records."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.label} tenant setting`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Selected tenant policy detail, intent, and current applied value."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save policy draft", reason: "Tenant policy save requires platform approval workflow." }]} secondary={[{ disabled: true, label: "Review dependency", reason: "Dependency review requires platform approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.label ?? "Tenant setting detail"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Group", value: selected.group },
                { label: "Value", value: selected.value },
                { label: "Status", value: selected.status },
                { label: "Key", value: String(selected.key) }
              ]}
            />
            <Card title={selected.label} description={selected.description}>
              <Tile eyebrow={selected.group} label="Applied value" meta={selected.status}>
                {selected.value}
              </Tile>
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function PlatformSettingsPage() {
  const navigate = useNavigate();
  const setupAreas = [
    {
      id: "tenant",
      label: "Tenant settings",
      route: "/platform/tenant-settings",
      summary: "Feature flags, deployment controls, localization defaults, and attachment policy."
    },
    {
      id: "workflow",
      label: "Workflow and numbering",
      route: "/platform/workflow-numbering",
      summary: "Document series, approval chain review, and transition setup."
    },
    {
      id: "translations",
      label: "Language setup",
      route: "/platform/translations",
      summary: "Language resource preview, translation review, and localization status."
    },
    {
      id: "access",
      label: "Users and roles",
      route: "/platform/users",
      summary: "User directory, role matrix, branch scope, and login policy review."
    },
    {
      id: "audit",
      label: "Audit trail",
      route: "/platform/audit-trail",
      summary: "Role-scoped action history, attachment events, and admin activity."
    },
    {
      id: "attachments",
      label: "Attachments",
      route: "/platform/attachments",
      summary: "Linked files, authorization, preview, download, and upload review."
    }
  ];

  return (
    <ListPageShell
      actions={
        <ErpActionBar
          primary={[{ label: "Open tenant settings", onClick: () => navigate("/platform/tenant-settings") }]}
          secondary={[
            { label: "Open workflow setup", onClick: () => navigate("/platform/workflow-numbering") },
            { label: "Open audit trail", onClick: () => navigate("/platform/audit-trail") }
          ]}
          testId="platform-settings-action-bar"
        />
      }
      description="Single entry point for platform administration, rollout controls, localization, audit, and document access."
      title="Platform Settings"
    >
      <KpiStrip
        items={[
          { label: "Setup areas", value: String(setupAreas.length) },
          { label: "Access controls", value: "Users & roles" },
          { label: "Audit", value: "Available" },
          { label: "Documents", value: "Scoped" }
        ]}
      />
      <Card title="Platform administration areas" description="Open the governed setup area needed for the current administration task.">
        <div className="utility-grid">
          {setupAreas.map((area) => (
            <Tile eyebrow="Platform" key={area.id} label={area.label} meta="Open setup" onClick={() => navigate(area.route)}>
              {area.summary}
            </Tile>
          ))}
        </div>
      </Card>
    </ListPageShell>
  );
}
