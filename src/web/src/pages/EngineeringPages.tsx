import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { apiClient } from "../api/http";
import type { BomUpsertRequest } from "../api/contracts";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  approveBomRevision,
  cloneBomRevision,
  isLiveBomRecord,
  listBomLibrarySetup,
  type BomComponentPreviewItem,
  type BomLibrarySetupItem,
  type BomRevisionPreviewItem
} from "../engineering/engineeringAdapters";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpFilterBar, ErpGrid, ErpLookupField, ErpModalWorkspace, ErpValidationSummary } from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Setup complete" : "Readiness view"}</Badge>;
}

function BomStatusBadge({ status }: { status: string }) {
  const tone = status === "Approved" || status === "Active" ? "success" : status === "Draft" ? "warn" : "danger";
  return <Badge tone={tone}>{status}</Badge>;
}

function hasLiveWrite(session: ReturnType<typeof useAuth>["session"]) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface BomDraftState extends BomUpsertRequest {}

const bomColumns: DataGridColumn<BomLibrarySetupItem>[] = [
  {
    key: "bom",
    header: "Parent item",
    width: "34%",
    render: (record) => (
      <div>
        <strong>{record.bomName}</strong>
        <div className="muted">{record.bomCode} / {record.itemLabel}</div>
      </div>
    )
  },
  { key: "revision", header: "Revision", width: "12%", render: (record) => record.currentRevision },
  { key: "effective", header: "Effective", width: "14%", render: (record) => record.effectiveFrom },
  { key: "structure", header: "Structure", width: "18%", render: (record) => `${record.lineCount} lines / ${record.operationCount} ops` },
  { key: "status", header: "Status", width: "12%", render: (record) => <BomStatusBadge status={record.status} /> }
];

const componentColumns: DataGridColumn<BomComponentPreviewItem>[] = [
  { key: "seq", header: "Seq", width: "10%", render: (record) => record.sequenceNo },
  { key: "component", header: "Component", render: (record) => <strong>{record.componentLabel}</strong> },
  { key: "qty", header: "Qty per", width: "14%", render: (record) => record.quantityPer },
  { key: "issue", header: "Issue", width: "16%", render: (record) => record.issueMethod },
  {
    key: "phantom",
    header: "Mode",
    width: "14%",
    render: (record) => <Badge tone={record.isPhantom ? "info" : "neutral"}>{record.isPhantom ? "Phantom" : "Stock"}</Badge>
  }
];

const revisionColumns: DataGridColumn<BomRevisionPreviewItem>[] = [
  { key: "revision", header: "Revision", render: (record) => <strong>{record.revisionCode}</strong> },
  { key: "effective", header: "Effective", width: "18%", render: (record) => record.effectiveFrom },
  { key: "structure", header: "Structure", width: "22%", render: (record) => `${record.lineCount} lines / ${record.operationCount} ops` },
  { key: "status", header: "Status", width: "16%", render: (record) => <BomStatusBadge status={record.approvalStatus} /> }
];

export function BomLibraryPage() {
  const { session, user } = useAuth();
  const canWrite = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BomDraftState | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, undefined, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.engineering.boms(user?.activeContext.companyId, deferredSearch, status),
    () => listBomLibrarySetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const itemLookupQuery = useApiQuery(
    ["masters", "item-lookup", user?.activeContext.companyId ?? 0],
    () => (canWrite ? apiClient.masters.itemLookup(user?.activeContext.companyId) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const itemOptions = (itemLookupQuery.data ?? []).map((item) => ({
    label: `${item.itemCode} / ${item.itemName}`,
    value: String(item.id)
  }));
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";
  const selectedRevision = selected?.revisions.find((revision) => revision.revisionCode === selected.currentRevision) ?? selected?.revisions[0] ?? null;
  const selectedRevisionId = selectedRevision?.revisionId ?? null;
  const isLiveSelected = isLiveBomRecord(selected);
  const approveMutation = useApiMutation(
    ({ item, revisionId }: { item: BomLibrarySetupItem; revisionId: number }) => approveBomRevision(item, revisionId),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: () => setActionMessage("BOM revision approval was saved.")
    }
  );
  const cloneMutation = useApiMutation(
    ({ item, revisionId }: { item: BomLibrarySetupItem; revisionId: number }) => cloneBomRevision(item, revisionId),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: () => setActionMessage("BOM revision clone was created.")
    }
  );
  const approveDisabledReason = !selected
    ? "Select a BOM revision before approval."
    : !isLiveSelected || !selectedRevisionId
      ? "Approval is available after the BOM is loaded from the live engineering register."
      : selected.status === "Approved" || selected.status === "Active"
        ? "Approved revisions are already released."
        : undefined;
  const cloneDisabledReason = !selected
    ? "Select a BOM revision before cloning."
    : !isLiveSelected || !selectedRevisionId
      ? "Cloning is available after the BOM is loaded from the live engineering register."
      : undefined;
  const newBomDisabledReason = !canWrite
    ? "BOM authoring requires a live signed-in engineering session."
    : user?.activeContext.companyId
      ? undefined
      : "Select an operating company before creating a BOM.";
  const draftValidation = draft
    ? [
        !draft.itemId ? "Parent item is required." : "",
        !draft.bomCode.trim() ? "BOM code is required." : "",
        !draft.bomName.trim() ? "BOM name is required." : "",
        !draft.revisions[0]?.revisionCode.trim() ? "Revision code is required." : ""
      ].filter(Boolean)
    : [];
  const createBomMutation = useApiMutation(
    (request: BomUpsertRequest) => apiClient.engineering.createBom(request),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: (saved) => {
        setDraft(null);
        setSelectedId(`bom-${saved.id}`);
        setActionMessage(`BOM ${saved.bomCode} was created.`);
      }
    }
  );

  const openNewDraft = () => {
    if (!user?.activeContext.companyId) {
      return;
    }

    setDraft({
      companyId: user.activeContext.companyId,
      itemId: 0,
      bomCode: "",
      bomName: "",
      status: "Draft",
      revisions: [
        {
          revisionCode: "R1",
          effectiveFrom: todayIso(),
          effectiveTo: null,
          approvalStatus: "Draft",
          routingId: null,
          changeSummary: "Initial authoring draft",
          isPhantomParentAllowed: false,
          lines: [],
          operations: []
        }
      ]
    });
    setActionMessage(null);
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ disabled: Boolean(newBomDisabledReason), label: "New BOM draft", onClick: newBomDisabledReason ? undefined : openNewDraft, reason: newBomDisabledReason }]}
              secondary={[
                { disabled: true, label: "Import CSV", reason: "BOM import requires the approved import workflow." },
                { disabled: true, label: "Print", reason: "BOM printing is pending document workflow enablement." }
              ]}
              testId="engineering-bom-action-bar"
            />
          </>
        }
        aside={
          <Card title="Selected BOM" description={selected ? selected.changeSummary : "Select a BOM revision to inspect structure."}>
            {selected ? (
              <>
                <div className="utility-grid">
                  <Tile eyebrow={selected.status} label="Revision" meta={selected.effectiveFrom}>{selected.currentRevision}</Tile>
                  <Tile eyebrow={selected.issueSummary} label="Structure" meta={`${selected.operationCount} ops`}>{selected.lineCount}</Tile>
                </div>
                <div className="notification-item">
                  <strong>{selected.bomName}</strong>
                  <p>{selected.itemLabel}</p>
                  <div className="context-chip-row"><BomStatusBadge status={selected.status} /><SourceBadge source={selected.source} /></div>
                </div>
              </>
            ) : null}
          </Card>
        }
        description="Search revisions, lifecycle state, and component coverage across released and draft BOMs."
        filters={
          <ErpFilterBar
            ariaLabel="BOM filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="bom-library-filter-bar"
          >
            <input
              aria-label="Search BOMs"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search item, code, revision"
              value={search}
            />
            <select aria-label="BOM status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Approved">Approved</option>
              <option value="Draft">Draft</option>
              <option value="Obsolete">Obsolete</option>
            </select>
            <select aria-label="BOM item type" defaultValue="all">
              <option value="all">Item type: Any</option>
              <option value="fg">FG</option>
              <option value="wip">WIP</option>
            </select>
          </ErpFilterBar>
        }
        title="BOM Library"
      >
        <KpiStrip
          items={[
            { label: "BOMs", value: String(records.length) },
            { label: "Approved", value: String(records.filter((record) => record.status === "Approved" || record.status === "Active").length) },
            { label: "Draft", value: String(records.filter((record) => record.status === "Draft").length) },
            { label: "Components", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }
          ]}
        />
        <div className="split-panels">
          <Card title="BOM Library" description="Search, filter, and open revision-aware detail without leaving planner context.">
            <ErpGrid
              ariaLabel="BOM library"
              columns={bomColumns}
              getRowId={(record) => record.id}
              isLoading={query.isLoading}
              onRowSelect={(record) => setSelectedId(record.id)}
              records={records}
              rowLabel={(record) => `${record.bomCode} bom`}
              testId="bom-library-grid"
              virtualization={{ enabled: true }}
            />
          </Card>
          <Card title="Revision structure preview" description="Revision tree information is presented in a compact engineering grid.">
            <ErpGrid
              ariaLabel="Selected BOM component preview"
              columns={componentColumns}
              getRowId={(record) => record.id}
              records={selected?.components ?? []}
              rowLabel={(record) => `${record.componentLabel} component`}
              virtualization={{ enabled: true }}
            />
          </Card>
        </div>
      </ListPageShell>
      <ErpModalWorkspace
        description="Revision tree, component guidance, and controlled editing for engineering changes."
        footer={
          <ErpActionBar
            primary={[
              {
                disabled: Boolean(approveDisabledReason) || approveMutation.isPending,
                label: approveMutation.isPending ? "Approving revision" : "Approve revision",
                onClick: selected && selectedRevisionId ? () => approveMutation.mutate({ item: selected, revisionId: selectedRevisionId }) : undefined,
                reason: approveDisabledReason
              }
            ]}
            secondary={[
              {
                disabled: Boolean(cloneDisabledReason) || cloneMutation.isPending,
                label: cloneMutation.isPending ? "Cloning revision" : "Clone revision",
                onClick: selected && selectedRevisionId ? () => cloneMutation.mutate({ item: selected, revisionId: selectedRevisionId }) : undefined,
                reason: cloneDisabledReason
              }
            ]}
            utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.bomName} (${selected.currentRevision})` : "Selected BOM"}
      >
        {selected ? (
          <>
            <KpiStrip
              items={[
                { label: "Revision", value: selected.currentRevision },
                { label: "Status", value: selected.status },
                { label: "Issue", value: selected.issueSummary }
              ]}
            />
            <Card title="Revision registry" description="Approvals lock edits and keep historical revisions visible.">
              <ErpGrid
                ariaLabel="BOM revision registry"
                columns={revisionColumns}
                getRowId={(record) => record.id}
                records={selected.revisions}
                rowLabel={(record) => `${record.revisionCode} revision`}
              />
            </Card>
            {actionMessage ? (
              <Card title="Engineering action status" description={actionMessage}>
                <BomStatusBadge status={actionMessage.includes("saved") || actionMessage.includes("created") ? "Approved" : "Draft"} />
              </Card>
            ) : null}
            <FormShell
              description="Required release checks stay visible before a revision is approved."
              initialFingerprint={`${selected.id}-${selected.currentRevision}`}
              title="BOM metadata editor"
              validationErrors={selected.status === "Draft" ? ["Approval workflow is still incomplete."] : []}
            >
              <ErpLookupField disabled disabledReason="Parent item is controlled by Item Master." label="Parent item" onChange={() => undefined} options={[{ label: selected.itemLabel, value: selected.itemLabel }]} value={selected.itemLabel} />
              <label>
                <span>BOM name</span>
                <input defaultValue={selected.bomName} disabled />
              </label>
              <ErpLookupField disabled disabledReason="Issue summary is controlled by BOM policy." label="Default issue summary" onChange={() => undefined} options={[{ label: selected.issueSummary, value: selected.issueSummary }]} value={selected.issueSummary} />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Create a BOM header and initial draft revision before authoring component lines."
        footer={
          <ErpActionBar
            primary={[
              {
                disabled: Boolean(newBomDisabledReason) || draftValidation.length > 0 || createBomMutation.isPending,
                label: createBomMutation.isPending ? "Saving BOM draft" : "Save draft",
                onClick: draft ? () => createBomMutation.mutate(draft) : undefined,
                reason: newBomDisabledReason ?? draftValidation[0]
              }
            ]}
            secondary={[{ label: "Close", onClick: () => setDraft(null), variant: "secondary" }]}
          />
        }
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        panelClassName="ui-modal__panel--item-master"
        title="New BOM draft"
        validation={<ErpValidationSummary errors={draftValidation} title="BOM draft checks" />}
      >
        {draft ? (
          <div className="modal-form-grid" data-testid="bom-draft-modal">
            <Card title="BOM header" description="Create the controlled header before revision lines are authored in the BOM editor.">
              <div className="form-grid form-grid--three">
                <ErpLookupField
                  label="Parent item"
                  onChange={(value) => setDraft({ ...draft, itemId: Number(value) || 0 })}
                  options={itemOptions}
                  required
                  value={String(draft.itemId || "")}
                />
                <label>
                  <span>BOM code</span>
                  <input onChange={(event) => setDraft({ ...draft, bomCode: event.target.value })} value={draft.bomCode} />
                </label>
                <label>
                  <span>BOM name</span>
                  <input onChange={(event) => setDraft({ ...draft, bomName: event.target.value })} value={draft.bomName} />
                </label>
                <label>
                  <span>Revision code</span>
                  <input
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        revisions: [{ ...draft.revisions[0], revisionCode: event.target.value }]
                      })
                    }
                    value={draft.revisions[0]?.revisionCode ?? ""}
                  />
                </label>
                <label>
                  <span>Effective from</span>
                  <input
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        revisions: [{ ...draft.revisions[0], effectiveFrom: event.target.value || null }]
                      })
                    }
                    type="date"
                    value={draft.revisions[0]?.effectiveFrom ?? ""}
                  />
                </label>
                <ErpLookupField
                  label="Lifecycle status"
                  onChange={(value) =>
                    setDraft({
                      ...draft,
                      status: value,
                      revisions: [{ ...draft.revisions[0], approvalStatus: value === "Active" ? "Approved" : "Draft" }]
                    })
                  }
                  options={[
                    { label: "Draft", value: "Draft" },
                    { label: "Active", value: "Active" }
                  ]}
                  value={draft.status}
                />
              </div>
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
