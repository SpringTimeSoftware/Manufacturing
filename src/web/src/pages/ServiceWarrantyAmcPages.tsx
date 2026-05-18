import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type {
  InstalledAssetDto,
  InstalledAssetUpsertRequest,
  ServiceChargeDto,
  ServiceChargeUpsertRequest,
  ServiceContractDto,
  ServiceContractUpsertRequest,
  ServiceSpareMovementDto,
  ServiceSpareMovementRequest,
  ServiceTicketDto,
  ServiceTicketUpsertRequest,
  ServiceVisitDto,
  ServiceVisitUpsertRequest,
  WarrantyClaimDto,
  WarrantyClaimUpsertRequest,
  WarrantyPolicyDto,
  WarrantyPolicyUpsertRequest
} from "../api/contracts";
import { apiClient } from "../api/http";
import { useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import { UdfRuntimePanel } from "../platform/UdfRuntimePanel";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpLookupField,
  ErpMoneyField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpTransactionLineGrid,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";

const assetStatuses = ["Installed", "Active", "Under Service", "Replaced", "Retired", "Scrapped"].map(toOption);
const policyStatuses = ["Draft", "Active", "Inactive", "Retired"].map(toOption);
const contractStatuses = ["Draft", "Active", "Expired", "Suspended", "Cancelled", "Renewed"].map(toOption);
const ticketStatuses = ["Registered", "Assigned", "Scheduled", "In Progress", "Waiting for Customer", "Waiting for Parts", "Resolved", "Closed", "Cancelled", "Reopened"].map(toOption);
const priorities = ["Low", "Medium", "High", "Critical"].map(toOption);
const channels = ["Phone", "Email", "WhatsApp", "Portal", "Internal"].map(toOption);
const visitStatuses = ["Planned", "Assigned", "In Progress", "Completed", "Cancelled"].map(toOption);
const claimStatuses = ["Draft", "Pending", "Approved", "Rejected"].map(toOption);
const chargeStatuses = ["Draft", "Approved", "InvoiceReady", "Invoiced", "Waived", "Cancelled"].map(toOption);
const spareReasonCodes = ["Replace", "Warranty", "AMC", "Paid service", "Return", "Damaged", "Adjustment"].map(toOption);

function toOption(value: string) {
  return { label: value, value };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowLocal() {
  return new Date().toISOString().slice(0, 16);
}

function nextNo(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function money(value: number | null | undefined) {
  return `INR ${(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function useServiceFilter(search: string, status: string) {
  const { user } = useAuth();
  const deferredSearch = useDeferredValue(search);
  return useMemo(
    () => ({
      companyId: user?.activeContext.companyId ?? 0,
      branchId: user?.activeContext.branchId ?? 0,
      filter: {
        companyId: user?.activeContext.companyId ?? undefined,
        branchId: user?.activeContext.branchId ?? undefined,
        search: deferredSearch,
        status: status === "all" ? undefined : status
      }
    }),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
}

function useLiveServiceReason() {
  const { session } = useAuth();
  return hasLiveSession(session) ? undefined : "Live company sign-in is required for service actions.";
}

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const tone = lower.includes("active") || lower.includes("posted") || lower.includes("completed") || lower.includes("approved") || lower.includes("invoice")
    ? "success"
    : lower.includes("closed") || lower.includes("cancelled") || lower.includes("rejected") || lower.includes("expired")
      ? "danger"
      : lower.includes("waiting") || lower.includes("pending") || lower.includes("draft")
        ? "warn"
        : "info";
  return <Badge tone={tone}>{status}</Badge>;
}

function ServiceFilters({ search, setSearch, status, setStatus }: { search: string; setSearch: (value: string) => void; status: string; setStatus: (value: string) => void }) {
  return (
    <FilterBar
      actions={<Button onClick={() => { setSearch(""); setStatus("all"); }} variant="quiet">Clear filters</Button>}
    >
      <input aria-label="Search service records" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search number, serial, customer, source" value={search} />
      <select aria-label="Service status" onChange={(event) => setStatus(event.target.value)} value={status}>
        <option value="all">Status: Any</option>
        {["Active", "Registered", "Assigned", "In Progress", "Waiting for Parts", "Closed", "Draft", "InvoiceReady"].map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </FilterBar>
  );
}

export function ServiceDashboardPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { filter } = useServiceFilter(search, status);
  const query = useApiQuery(["service", "dashboard", filter], () => apiClient.service.dashboard(filter));
  const cards = [
    ["Open tickets", query.data?.openTickets ?? 0],
    ["Waiting for parts", query.data?.waitingForParts ?? 0],
    ["Active AMC", query.data?.activeContracts ?? 0],
    ["Pending claims", query.data?.warrantyClaimsPending ?? 0],
    ["Invoice-ready charges", query.data?.invoiceReadyCharges ?? 0]
  ] as const;
  return (
    <ListPageShell
      description="Service ticket, warranty, AMC, spare, billing, and reporting cockpit sourced from persisted service records."
      filters={<ServiceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />}
      title="Service Dashboard"
    >
      <div className="erp-kpi-grid">
        {cards.map(([label, value]) => <Card key={label} title={label}><strong>{value}</strong></Card>)}
      </div>
      <Card title="Disabled boundaries">
        {(query.data?.disabledActionReasons ?? []).map((reason) => <p key={reason}>{reason}</p>)}
      </Card>
    </ListPageShell>
  );
}

const assetColumns: DataGridColumn<InstalledAssetDto>[] = [
  { key: "asset", header: "Asset", render: (record) => <strong>{record.assetNo}</strong> },
  { key: "customer", header: "Customer", render: (record) => `Customer ${record.customerId}` },
  { key: "item", header: "Item / serial", render: (record) => `Item ${record.itemId}${record.serialNo ? ` / ${record.serialNo}` : ""}` },
  { key: "source", header: "Source", render: (record) => record.sourceDocumentNo ?? record.sourceDocumentType ?? "Manual registration" },
  { key: "warranty", header: "Warranty", render: (record) => record.warrantyEndDate ?? "Not configured" },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function InstalledAssetsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<InstalledAssetUpsertRequest | null>(null);
  const { companyId, branchId, filter } = useServiceFilter(search, status);
  const liveReason = useLiveServiceReason();
  const query = useApiQuery(["service", "assets", filter], () => apiClient.service.installedAssets(filter));
  const create = useApiMutation(apiClient.service.createInstalledAsset, { onSuccess: () => setDraft(null) });

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New Asset", onClick: () => setDraft(emptyAsset(companyId, branchId)), reason: liveReason }]} testId="service-assets-actions" />}
      description="Installed base preserves customer, serial, item revision, source SO/dispatch/invoice, warranty, and lifecycle state."
      filters={<ServiceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />}
      title="Installed Assets"
    >
      <DataGrid ariaLabel="Installed assets" columns={assetColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => record.assetNo} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: create.isPending ? "Saving asset" : "Save Asset", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Installed asset">
        {draft ? <InstalledAssetForm draft={draft} onChange={setDraft} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function InstalledAssetForm({ draft, onChange }: { draft: InstalledAssetUpsertRequest; onChange: (draft: InstalledAssetUpsertRequest) => void }) {
  return (
    <FormShell initialFingerprint={draft.assetNo} title="Asset source and warranty">
      <label><span>Asset no</span><input aria-label="Asset no" onChange={(event) => onChange({ ...draft, assetNo: event.target.value })} value={draft.assetNo} /></label>
      <ErpNumberField label="Customer" min={1} onChange={(value) => onChange({ ...draft, customerId: value ?? 0 })} required value={draft.customerId} />
      <ErpNumberField label="Item" min={1} onChange={(value) => onChange({ ...draft, itemId: value ?? 0 })} required value={draft.itemId} />
      <ErpNumberField label="Item revision snapshot" min={1} onChange={(value) => onChange({ ...draft, itemRevisionId: value })} value={draft.itemRevisionId} />
      <label><span>Serial no</span><input aria-label="Serial no" onChange={(event) => onChange({ ...draft, serialNo: event.target.value || null })} value={draft.serialNo ?? ""} /></label>
      <label><span>Source document no</span><input aria-label="Source document no" onChange={(event) => onChange({ ...draft, sourceDocumentNo: event.target.value || null })} value={draft.sourceDocumentNo ?? ""} /></label>
      <ErpLookupField label="Status" onChange={(value) => onChange({ ...draft, status: value })} options={assetStatuses} value={draft.status} />
      <label><span>Installation date</span><input aria-label="Installation date" onChange={(event) => onChange({ ...draft, installationDate: event.target.value })} type="date" value={draft.installationDate} /></label>
      <label><span>Warranty end</span><input aria-label="Warranty end" onChange={(event) => onChange({ ...draft, warrantyEndDate: event.target.value || null })} type="date" value={draft.warrantyEndDate ?? ""} /></label>
      <label><span>Location snapshot</span><textarea aria-label="Location snapshot" onChange={(event) => onChange({ ...draft, locationSnapshot: event.target.value || null })} value={draft.locationSnapshot ?? ""} /></label>
    </FormShell>
  );
}

function emptyAsset(companyId: number, branchId: number): InstalledAssetUpsertRequest {
  return { companyId, branchId, assetNo: nextNo("AST"), customerId: 0, customerSiteId: null, customerContactId: null, itemId: 0, itemRevisionId: null, serialId: null, serialNo: null, lotId: null, pcidId: null, sourceSalesOrderId: null, sourceSalesOrderLineId: null, sourceDispatchId: null, sourceDispatchLineId: null, sourceInvoiceId: null, sourceDocumentType: "ManualRegistration", sourceDocumentNo: null, sourceDocumentRevisionNo: null, installationDate: today(), commissioningDate: null, warrantyStartDate: today(), warrantyEndDate: null, serviceContractId: null, status: "Installed", locationSnapshot: null, remarks: null, legacySourceIncomplete: false };
}

const policyColumns: DataGridColumn<WarrantyPolicyDto>[] = [
  { key: "policy", header: "Policy", render: (record) => <strong>{record.policyCode}</strong> },
  { key: "name", header: "Name", render: (record) => record.policyName },
  { key: "duration", header: "Duration", render: (record) => `${record.durationDays} days from ${record.startTrigger}` },
  { key: "coverage", header: "Coverage", render: (record) => [record.coversParts ? "Parts" : null, record.coversLabor ? "Labor" : null, record.coversOnsite ? "Onsite" : null, record.coversReplacement ? "Replacement" : null].filter(Boolean).join(", ") },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function WarrantyPoliciesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<WarrantyPolicyUpsertRequest | null>(null);
  const { companyId, filter } = useServiceFilter(search, status);
  const liveReason = useLiveServiceReason();
  const query = useApiQuery(["service", "policies", filter], () => apiClient.service.warrantyPolicies(filter));
  const create = useApiMutation(apiClient.service.createWarrantyPolicy, { onSuccess: () => setDraft(null) });
  return (
    <ListPageShell actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New Policy", onClick: () => setDraft({ companyId, policyCode: nextNo("WAR"), policyName: "", itemId: null, itemGroupId: null, customerGroupId: null, durationDays: 365, startTrigger: "InstallationDate", coversParts: true, coversLabor: true, coversOnsite: false, coversReplacement: false, exclusions: null, claimLimitAmount: null, status: "Draft" }), reason: liveReason }]} testId="service-warranty-actions" />} description="Warranty entitlement policies are governed and effective for service ticket coverage snapshots." filters={<ServiceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />} title="Warranty Policies">
      <DataGrid ariaLabel="Warranty policies" columns={policyColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => record.policyCode} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: "Save Policy", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Warranty policy">
        {draft ? <WarrantyPolicyForm draft={draft} onChange={setDraft} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function WarrantyPolicyForm({ draft, onChange }: { draft: WarrantyPolicyUpsertRequest; onChange: (draft: WarrantyPolicyUpsertRequest) => void }) {
  return (
    <FormShell initialFingerprint={draft.policyCode} title="Coverage rules">
      <label><span>Policy code</span><input aria-label="Policy code" onChange={(event) => onChange({ ...draft, policyCode: event.target.value })} value={draft.policyCode} /></label>
      <label><span>Policy name</span><input aria-label="Policy name" onChange={(event) => onChange({ ...draft, policyName: event.target.value })} value={draft.policyName} /></label>
      <ErpNumberField label="Duration days" min={1} onChange={(value) => onChange({ ...draft, durationDays: value ?? 365 })} value={draft.durationDays} />
      <ErpLookupField label="Status" onChange={(value) => onChange({ ...draft, status: value })} options={policyStatuses} value={draft.status} />
      {(["coversParts", "coversLabor", "coversOnsite", "coversReplacement"] as const).map((field) => <label key={field}><span>{field.replace("covers", "Covers ")}</span><input checked={draft[field]} onChange={(event) => onChange({ ...draft, [field]: event.target.checked })} type="checkbox" /></label>)}
    </FormShell>
  );
}

const contractColumns: DataGridColumn<ServiceContractDto>[] = [
  { key: "contract", header: "Contract", render: (record) => <strong>{record.contractNo}</strong> },
  { key: "customer", header: "Customer / asset", render: (record) => `Customer ${record.customerId}${record.installedAssetId ? ` / Asset ${record.installedAssetId}` : ""}` },
  { key: "dates", header: "Coverage", render: (record) => `${record.startDate} to ${record.endDate}` },
  { key: "sla", header: "SLA", render: (record) => record.slaResponseHours ? `${record.slaResponseHours}h` : "Not set" },
  { key: "value", header: "Value", render: (record) => money(record.contractValueAmount) },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function ServiceContractsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<ServiceContractUpsertRequest | null>(null);
  const { companyId, branchId, filter } = useServiceFilter(search, status);
  const liveReason = useLiveServiceReason();
  const query = useApiQuery(["service", "contracts", filter], () => apiClient.service.contracts(filter));
  const create = useApiMutation(apiClient.service.createContract, { onSuccess: () => setDraft(null) });
  return (
    <ListPageShell actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New AMC", onClick: () => setDraft(emptyContract(companyId, branchId)), reason: liveReason }]} testId="service-contract-actions" />} description="AMC and service contracts persist asset coverage, SLA, visit cadence, billing, tax snapshot, and renewal state." filters={<ServiceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />} title="AMC / Service Contracts">
      <DataGrid ariaLabel="Service contracts" columns={contractColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => record.contractNo} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: "Save Contract", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="AMC / service contract">
        {draft ? <ServiceContractForm draft={draft} onChange={setDraft} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function ServiceContractForm({ draft, onChange }: { draft: ServiceContractUpsertRequest; onChange: (draft: ServiceContractUpsertRequest) => void }) {
  return (
    <FormShell initialFingerprint={draft.contractNo} title="Contract commercial coverage">
      <label><span>Contract no</span><input aria-label="Contract no" onChange={(event) => onChange({ ...draft, contractNo: event.target.value })} value={draft.contractNo} /></label>
      <ErpNumberField label="Customer" min={1} onChange={(value) => onChange({ ...draft, customerId: value ?? 0 })} value={draft.customerId} />
      <ErpNumberField label="Installed asset" min={1} onChange={(value) => onChange({ ...draft, installedAssetId: value })} value={draft.installedAssetId} />
      <label><span>Start date</span><input aria-label="Start date" onChange={(event) => onChange({ ...draft, startDate: event.target.value })} type="date" value={draft.startDate} /></label>
      <label><span>End date</span><input aria-label="End date" onChange={(event) => onChange({ ...draft, endDate: event.target.value })} type="date" value={draft.endDate} /></label>
      <label><span>Coverage summary</span><textarea aria-label="Coverage summary" onChange={(event) => onChange({ ...draft, coverageSummary: event.target.value })} value={draft.coverageSummary} /></label>
      <ErpNumberField label="Visit frequency days" min={1} onChange={(value) => onChange({ ...draft, visitFrequencyDays: value })} value={draft.visitFrequencyDays} />
      <ErpNumberField label="SLA response hours" min={1} onChange={(value) => onChange({ ...draft, slaResponseHours: value })} value={draft.slaResponseHours} />
      <ErpMoneyField label="Contract value" min={0} onChange={(value) => onChange({ ...draft, contractValueAmount: value })} value={draft.contractValueAmount} />
      <ErpLookupField label="Status" onChange={(value) => onChange({ ...draft, status: value })} options={contractStatuses} value={draft.status} />
    </FormShell>
  );
}

function emptyContract(companyId: number, branchId: number): ServiceContractUpsertRequest {
  return { companyId, branchId, contractNo: nextNo("AMC"), customerId: 0, installedAssetId: null, startDate: today(), endDate: today(), renewalDate: null, coverageSummary: "", visitFrequencyDays: 90, preventiveScheduleJson: null, slaResponseHours: 24, billingTermsId: null, contractValueAmount: null, taxCodeId: null, taxRateSnapshot: null, status: "Draft", versionNo: 1, priorContractId: null };
}

const ticketColumns: DataGridColumn<ServiceTicketDto>[] = [
  { key: "ticket", header: "Ticket", render: (record) => <strong>{record.ticketNo}</strong> },
  { key: "customer", header: "Customer / asset", render: (record) => `Customer ${record.customerId}${record.installedAssetId ? ` / Asset ${record.installedAssetId}` : ""}` },
  { key: "issue", header: "Issue", render: (record) => `${record.issueCategory}: ${record.issueDescription}` },
  { key: "entitlement", header: "Entitlement", render: (record) => <Badge tone={record.entitlementType === "Warranty" || record.entitlementType === "AMC" ? "success" : "warn"}>{record.entitlementType}</Badge> },
  { key: "owner", header: "Owner", render: (record) => record.assignedOwnerUserId ? `User ${record.assignedOwnerUserId}` : "Unassigned" },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function ServiceTicketsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<ServiceTicketUpsertRequest | null>(null);
  const { companyId, branchId, filter } = useServiceFilter(search, status);
  const liveReason = useLiveServiceReason();
  const query = useApiQuery(["service", "tickets", filter], () => apiClient.service.tickets(filter));
  const create = useApiMutation(apiClient.service.createTicket, { onSuccess: () => setDraft(null) });
  const closeTicket = useApiMutation((id: number) => apiClient.service.changeTicketStatus(id, { status: "Closed", reason: "Resolved and customer accepted." }));
  const reopenTicket = useApiMutation((id: number) => apiClient.service.changeTicketStatus(id, { status: "Reopened", reason: "Customer requested reopen." }));
  return (
    <ListPageShell actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New Ticket", onClick: () => setDraft(emptyTicket(companyId, branchId)), reason: liveReason }]} testId="service-ticket-actions" />} description="Service tickets snapshot customer, asset, entitlement, SLA, assignment, remarks, source references, and closure/reopen audit." filters={<ServiceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />} title="Service Tickets">
      <DataGrid
        ariaLabel="Service tickets"
        columns={[
          ...ticketColumns,
          { key: "actions", header: "Actions", render: (record) => <ErpActionBar primary={[{ disabled: Boolean(liveReason) || record.status === "Closed", label: "Close", onClick: () => closeTicket.mutate(record.id), reason: liveReason ?? (record.status === "Closed" ? "Ticket is already closed." : undefined) }, { disabled: Boolean(liveReason) || record.status !== "Closed", label: "Reopen", onClick: () => reopenTicket.mutate(record.id), reason: liveReason ?? (record.status !== "Closed" ? "Only closed tickets can be reopened." : undefined) }]} /> }
        ]}
        getRowId={(record) => String(record.id)}
        isLoading={query.isLoading}
        records={query.data?.items ?? []}
        rowLabel={(record) => record.ticketNo}
      />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: "Save Ticket", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Service ticket">
        {draft ? <ServiceTicketForm draft={draft} onChange={setDraft} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function ServiceTicketForm({ draft, onChange }: { draft: ServiceTicketUpsertRequest; onChange: (draft: ServiceTicketUpsertRequest) => void }) {
  return (
    <FormShell initialFingerprint={draft.ticketNo} title="Ticket details">
      <label><span>Ticket no</span><input aria-label="Ticket no" onChange={(event) => onChange({ ...draft, ticketNo: event.target.value })} value={draft.ticketNo} /></label>
      <ErpNumberField label="Customer" min={1} onChange={(value) => onChange({ ...draft, customerId: value ?? 0 })} value={draft.customerId} />
      <ErpNumberField label="Installed asset" min={1} onChange={(value) => onChange({ ...draft, installedAssetId: value })} value={draft.installedAssetId} />
      <ErpNumberField label="Item" min={1} onChange={(value) => onChange({ ...draft, itemId: value })} value={draft.itemId} />
      <label><span>Issue category</span><input aria-label="Issue category" onChange={(event) => onChange({ ...draft, issueCategory: event.target.value })} value={draft.issueCategory} /></label>
      <label><span>Issue description</span><textarea aria-label="Issue description" onChange={(event) => onChange({ ...draft, issueDescription: event.target.value })} value={draft.issueDescription} /></label>
      <ErpLookupField label="Priority" onChange={(value) => onChange({ ...draft, priority: value })} options={priorities} value={draft.priority} />
      <ErpLookupField label="Channel" onChange={(value) => onChange({ ...draft, channel: value })} options={channels} value={draft.channel} />
      <ErpLookupField label="Status" onChange={(value) => onChange({ ...draft, status: value })} options={ticketStatuses} value={draft.status} />
      <label><span>Internal remarks</span><textarea aria-label="Internal remarks" onChange={(event) => onChange({ ...draft, internalRemarks: event.target.value || null })} value={draft.internalRemarks ?? ""} /></label>
      <label><span>Customer-facing remarks</span><textarea aria-label="Customer-facing remarks" onChange={(event) => onChange({ ...draft, customerFacingRemarks: event.target.value || null })} value={draft.customerFacingRemarks ?? ""} /></label>
    </FormShell>
  );
}

function emptyTicket(companyId: number, branchId: number): ServiceTicketUpsertRequest {
  return { companyId, branchId, ticketNo: nextNo("SVC"), customerId: 0, contactId: null, installedAssetId: null, itemId: null, serialNo: null, issueCategory: "", issueDescription: "", priority: "Medium", severity: "Normal", channel: "Internal", sourceIntegrationMessageId: null, assignedOwnerUserId: null, assignedTeamId: null, targetResponseOn: null, targetResolutionOn: null, status: "Registered", internalRemarks: null, customerFacingRemarks: null, sourceSalesOrderId: null, sourceDispatchId: null, sourceInvoiceId: null };
}

const visitColumns: DataGridColumn<ServiceVisitDto>[] = [
  { key: "ticket", header: "Ticket", render: (record) => `Ticket ${record.serviceTicketId}` },
  { key: "tech", header: "Technician", render: (record) => record.technicianUserId ? `User ${record.technicianUserId}` : "Unassigned" },
  { key: "time", header: "Schedule", render: (record) => record.scheduledStartOn ?? "Not scheduled" },
  { key: "work", header: "Diagnosis / resolution", render: (record) => record.diagnosis ?? record.resolution ?? "Pending" },
  { key: "evidence", header: "Evidence", render: (record) => record.evidenceAttachmentId || record.photoEvidenceId ? "Metadata linked" : "No evidence" },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function ServiceVisitsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<ServiceVisitUpsertRequest | null>(null);
  const { companyId, branchId, filter } = useServiceFilter(search, status);
  const liveReason = useLiveServiceReason();
  const query = useApiQuery(["service", "visits", filter], () => apiClient.service.visits(filter));
  const create = useApiMutation(apiClient.service.createVisit, { onSuccess: () => setDraft(null) });
  return (
    <ListPageShell actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New Visit", onClick: () => setDraft(emptyVisit(companyId, branchId)), reason: liveReason }]} testId="service-visit-actions" />} description="Field-service visit/job card persists schedule, technician, diagnosis, resolution, customer signoff metadata, and evidence references." filters={<ServiceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />} title="Service Job Cards / Visits">
      <DataGrid ariaLabel="Service visits" columns={visitColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => String(record.id)} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: "Save Visit", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Service visit">
        {draft ? <ServiceVisitForm draft={draft} onChange={setDraft} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function ServiceVisitForm({ draft, onChange }: { draft: ServiceVisitUpsertRequest; onChange: (draft: ServiceVisitUpsertRequest) => void }) {
  return (
    <FormShell initialFingerprint={`${draft.serviceTicketId}-${draft.status}`} title="Visit work log">
      <ErpNumberField label="Service ticket" min={1} onChange={(value) => onChange({ ...draft, serviceTicketId: value ?? 0 })} value={draft.serviceTicketId} />
      <ErpNumberField label="Technician user" min={1} onChange={(value) => onChange({ ...draft, technicianUserId: value })} value={draft.technicianUserId} />
      <label><span>Scheduled start</span><input aria-label="Scheduled start" onChange={(event) => onChange({ ...draft, scheduledStartOn: event.target.value || null })} type="datetime-local" value={draft.scheduledStartOn ?? ""} /></label>
      <label><span>Diagnosis</span><textarea aria-label="Diagnosis" onChange={(event) => onChange({ ...draft, diagnosis: event.target.value || null })} value={draft.diagnosis ?? ""} /></label>
      <label><span>Resolution</span><textarea aria-label="Resolution" onChange={(event) => onChange({ ...draft, resolution: event.target.value || null })} value={draft.resolution ?? ""} /></label>
      <label><span>Customer signoff name</span><input aria-label="Customer signoff name" onChange={(event) => onChange({ ...draft, customerSignoffName: event.target.value || null })} value={draft.customerSignoffName ?? ""} /></label>
      <ErpLookupField label="Status" onChange={(value) => onChange({ ...draft, status: value })} options={visitStatuses} value={draft.status} />
    </FormShell>
  );
}

function emptyVisit(companyId: number, branchId: number): ServiceVisitUpsertRequest {
  return { companyId, branchId, serviceTicketId: 0, technicianUserId: null, teamId: null, scheduledStartOn: nowLocal(), scheduledEndOn: null, visitAddressSnapshot: null, travelStartedOn: null, workStartedOn: null, workEndedOn: null, workPerformed: null, diagnosis: null, resolution: null, customerSignoffName: null, customerSignoffOn: null, evidenceAttachmentId: null, photoEvidenceId: null, status: "Planned", remarks: null };
}

const spareColumns: DataGridColumn<ServiceSpareMovementDto>[] = [
  { key: "move", header: "Movement", render: (record) => <strong>{record.movementNo}</strong> },
  { key: "ticket", header: "Ticket", render: (record) => `Ticket ${record.serviceTicketId}` },
  { key: "item", header: "Item / qty", render: (record) => `Item ${record.itemId} / ${record.quantity}` },
  { key: "dims", header: "Tracking", render: (record) => `Wh ${record.warehouseId}, Bin ${record.binId ?? "-"}, Lot ${record.lotId ?? "-"}, Serial ${record.serialId ?? record.serialNo ?? "-"}, PCID ${record.pcidId ?? "-"}` },
  { key: "stock", header: "Inventory post", render: (record) => record.stockTransactionId ? `Txn ${record.stockTransactionId}` : "Not posted" },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function ServiceSpareMovementsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<ServiceSpareMovementRequest | null>(null);
  const [mode, setMode] = useState<"issue" | "return">("issue");
  const { companyId, branchId, filter } = useServiceFilter(search, status);
  const liveReason = useLiveServiceReason();
  const query = useApiQuery(["service", "spares", filter], () => apiClient.service.spares(filter));
  const issue = useApiMutation(apiClient.service.issueSpare, { onSuccess: () => setDraft(null) });
  const ret = useApiMutation(apiClient.service.returnSpare, { onSuccess: () => setDraft(null) });
  const save = () => draft && (mode === "issue" ? issue.mutate(draft) : ret.mutate(draft));
  return (
    <ListPageShell actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "Issue Spare", onClick: () => { setMode("issue"); setDraft(emptySpare(companyId, branchId, "SSI")); }, reason: liveReason }, { disabled: Boolean(liveReason), label: "Return Spare", onClick: () => { setMode("return"); setDraft(emptySpare(companyId, branchId, "SSR")); }, reason: liveReason }]} testId="service-spare-actions" />} description="Service spare issue/return posts through shared inventory validation with bin, lot, serial, PCID, stock status, and source snapshots." filters={<ServiceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />} title="Spare Issue / Return">
      <DataGrid ariaLabel="Service spare movements" columns={spareColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => record.movementNo} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || issue.isPending || ret.isPending, label: mode === "issue" ? "Post Issue" : "Post Return", onClick: !liveReason ? save : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title={mode === "issue" ? "Issue service spare" : "Return service spare"}>
        {draft ? <ServiceSpareForm draft={draft} onChange={setDraft} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function ServiceSpareForm({ draft, onChange }: { draft: ServiceSpareMovementRequest; onChange: (draft: ServiceSpareMovementRequest) => void }) {
  return (
    <FormShell initialFingerprint={draft.movementNo} title="Inventory tracking dimensions">
      <ErpValidationSummary errors={["Bin, lot, serial, and PCID rules are revalidated server-side by the shared inventory posting service."]} />
      <ErpTransactionLineGrid
        ariaLabel="Service spare line grid"
        columns={[
          { key: "ticket", header: "Ticket", render: () => <ErpNumberField label="Ticket" min={1} onChange={(value) => onChange({ ...draft, serviceTicketId: value ?? 0 })} value={draft.serviceTicketId} /> },
          { key: "item", header: "Item", render: () => <ErpNumberField label="Item" min={1} onChange={(value) => onChange({ ...draft, itemId: value ?? 0 })} value={draft.itemId} /> },
          { key: "warehouse", header: "Warehouse", render: () => <ErpNumberField label="Warehouse" min={1} onChange={(value) => onChange({ ...draft, warehouseId: value ?? 0 })} value={draft.warehouseId} /> },
          { key: "bin", header: "Bin", render: () => <ErpNumberField label="Bin" min={1} onChange={(value) => onChange({ ...draft, binId: value })} value={draft.binId} /> },
          { key: "lot", header: "Lot", render: () => <ErpNumberField label="Lot" min={1} onChange={(value) => onChange({ ...draft, lotId: value })} value={draft.lotId} /> },
          { key: "serial", header: "Serial", render: () => <ErpNumberField label="Serial" min={1} onChange={(value) => onChange({ ...draft, serialId: value })} value={draft.serialId} /> },
          { key: "pcid", header: "PCID", render: () => <ErpNumberField label="PCID" min={1} onChange={(value) => onChange({ ...draft, pcidId: value })} value={draft.pcidId} /> },
          { key: "qty", header: "Qty", render: () => <ErpDecimalField label="Quantity" min={0.000001} onChange={(value) => onChange({ ...draft, quantity: value ?? 0 })} value={draft.quantity} /> }
        ]}
        getRowId={() => draft.movementNo}
        lines={[draft]}
      />
      <ErpLookupField label="Reason code" onChange={(value) => onChange({ ...draft, reasonCode: value || null })} options={spareReasonCodes} value={draft.reasonCode ?? ""} />
      <label><span>Remarks</span><textarea aria-label="Remarks" onChange={(event) => onChange({ ...draft, remarks: event.target.value || null })} value={draft.remarks ?? ""} /></label>
    </FormShell>
  );
}

function emptySpare(companyId: number, branchId: number, prefix: string): ServiceSpareMovementRequest {
  return { companyId, branchId, movementNo: nextNo(prefix), serviceTicketId: 0, serviceVisitId: null, itemId: 0, itemRevisionId: null, warehouseId: 0, binId: null, lotId: null, serialId: null, serialNo: null, pcidId: null, quantity: 1, inventoryState: "Available", reasonCode: null, remarks: null, replacementInstalledAssetId: null, defectiveInstalledAssetId: null, postingDate: today(), sourceDocumentNo: null };
}

const claimColumns: DataGridColumn<WarrantyClaimDto>[] = [
  { key: "claim", header: "Claim", render: (record) => <strong>{record.claimNo}</strong> },
  { key: "ticket", header: "Ticket / asset", render: (record) => `Ticket ${record.serviceTicketId}${record.installedAssetId ? ` / Asset ${record.installedAssetId}` : ""}` },
  { key: "entitlement", header: "Entitlement", render: (record) => record.entitlementType },
  { key: "approval", header: "Approval", render: (record) => <StatusBadge status={record.approvalStatus} /> },
  { key: "reason", header: "Reason", render: (record) => record.rejectionReason ?? record.overrideReason ?? record.disposition ?? "" },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function WarrantyClaimsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<WarrantyClaimUpsertRequest | null>(null);
  const { companyId, branchId, filter } = useServiceFilter(search, status);
  const liveReason = useLiveServiceReason();
  const query = useApiQuery(["service", "claims", filter], () => apiClient.service.warrantyClaims(filter));
  const create = useApiMutation(apiClient.service.createWarrantyClaim, { onSuccess: () => setDraft(null) });
  const approve = useApiMutation((id: number) => apiClient.service.decideWarrantyClaim(id, { approvalStatus: "Approved", disposition: "Repair approved", rejectionReason: null, overrideReason: null, replacementAssetId: null }));
  const reject = useApiMutation((id: number) => apiClient.service.decideWarrantyClaim(id, { approvalStatus: "Rejected", disposition: null, rejectionReason: "Entitlement not valid.", overrideReason: null, replacementAssetId: null }));
  return (
    <ListPageShell actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New Claim", onClick: () => setDraft(emptyClaim(companyId, branchId)), reason: liveReason }]} testId="service-claim-actions" />} description="Warranty claims require entitlement or audited override, record disposition, and link replacements to installed assets." filters={<ServiceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />} title="Warranty Claims">
      <DataGrid ariaLabel="Warranty claims" columns={[...claimColumns, { key: "actions", header: "Actions", render: (record) => <ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "Approve", onClick: () => approve.mutate(record.id), reason: liveReason }, { disabled: Boolean(liveReason), label: "Reject", onClick: () => reject.mutate(record.id), reason: liveReason }]} /> }]} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => record.claimNo} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: "Save Claim", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Warranty claim">
        {draft ? <WarrantyClaimForm draft={draft} onChange={setDraft} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function WarrantyClaimForm({ draft, onChange }: { draft: WarrantyClaimUpsertRequest; onChange: (draft: WarrantyClaimUpsertRequest) => void }) {
  return (
    <FormShell initialFingerprint={draft.claimNo} title="Claim decision basis">
      <label><span>Claim no</span><input aria-label="Claim no" onChange={(event) => onChange({ ...draft, claimNo: event.target.value })} value={draft.claimNo} /></label>
      <ErpNumberField label="Service ticket" min={1} onChange={(value) => onChange({ ...draft, serviceTicketId: value ?? 0 })} value={draft.serviceTicketId} />
      <ErpNumberField label="Customer" min={1} onChange={(value) => onChange({ ...draft, customerId: value ?? 0 })} value={draft.customerId} />
      <ErpLookupField label="Approval" onChange={(value) => onChange({ ...draft, approvalStatus: value, status: value })} options={claimStatuses} value={draft.approvalStatus} />
      <label><span>Override reason</span><textarea aria-label="Override reason" onChange={(event) => onChange({ ...draft, overrideReason: event.target.value || null })} value={draft.overrideReason ?? ""} /></label>
    </FormShell>
  );
}

function emptyClaim(companyId: number, branchId: number): WarrantyClaimUpsertRequest {
  return { companyId, branchId, claimNo: nextNo("WCL"), serviceTicketId: 0, installedAssetId: null, customerId: 0, itemId: null, serialNo: null, claimType: "Repair", entitlementType: "Unknown", entitlementSnapshotJson: null, approvalStatus: "Draft", disposition: null, replacementAssetId: null, costDecision: null, rejectionReason: null, overrideReason: null, status: "Draft" };
}

const chargeColumns: DataGridColumn<ServiceChargeDto>[] = [
  { key: "charge", header: "Charge", render: (record) => <strong>{record.chargeNo}</strong> },
  { key: "ticket", header: "Ticket", render: (record) => `Ticket ${record.serviceTicketId}` },
  { key: "parts", header: "Parts", render: (record) => money(record.partsAmount) },
  { key: "tax", header: "Tax", render: (record) => money(record.taxAmount) },
  { key: "total", header: "Total", render: (record) => money(record.totalAmount) },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function ServiceChargesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<ServiceChargeUpsertRequest | null>(null);
  const { companyId, branchId, filter } = useServiceFilter(search, status);
  const liveReason = useLiveServiceReason();
  const query = useApiQuery(["service", "charges", filter], () => apiClient.service.charges(filter));
  const create = useApiMutation(apiClient.service.createCharge, { onSuccess: () => setDraft(null) });
  const ready = useApiMutation(apiClient.service.markChargeInvoiceReady);
  return (
    <ListPageShell actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New Charge", onClick: () => setDraft(emptyCharge(companyId, branchId)), reason: liveReason }]} testId="service-charge-actions" />} description="Service billing stores charge, discount, tax, and invoice-ready snapshots without mutating posted finance records." filters={<ServiceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />} title="Service Charges / Invoicing">
      <DataGrid ariaLabel="Service charges" columns={[...chargeColumns, { key: "actions", header: "Actions", render: (record) => <ErpActionBar primary={[{ disabled: Boolean(liveReason) || record.status === "Invoiced", label: "Invoice Ready", onClick: () => ready.mutate(record.id), reason: liveReason ?? (record.status === "Invoiced" ? "Posted service invoices cannot be changed." : undefined) }]} /> }]} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => record.chargeNo} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: "Save Charge", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Service charge">
        {draft ? <ServiceChargeForm draft={draft} onChange={setDraft} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function ServiceChargeForm({ draft, onChange }: { draft: ServiceChargeUpsertRequest; onChange: (draft: ServiceChargeUpsertRequest) => void }) {
  const total = draft.laborAmount + draft.partsAmount + draft.travelAmount + draft.otherAmount - draft.discountAmount + draft.taxAmount;
  return (
    <FormShell initialFingerprint={draft.chargeNo} title="Charge snapshot">
      <label><span>Charge no</span><input aria-label="Charge no" onChange={(event) => onChange({ ...draft, chargeNo: event.target.value })} value={draft.chargeNo} /></label>
      <ErpNumberField label="Service ticket" min={1} onChange={(value) => onChange({ ...draft, serviceTicketId: value ?? 0 })} value={draft.serviceTicketId} />
      <ErpNumberField label="Customer" min={1} onChange={(value) => onChange({ ...draft, customerId: value ?? 0 })} value={draft.customerId} />
      <ErpMoneyField label="Labor" min={0} onChange={(value) => onChange({ ...draft, laborAmount: value ?? 0, totalAmount: total })} value={draft.laborAmount} />
      <ErpMoneyField label="Parts" min={0} onChange={(value) => onChange({ ...draft, partsAmount: value ?? 0, totalAmount: total })} value={draft.partsAmount} />
      <ErpMoneyField label="Travel" min={0} onChange={(value) => onChange({ ...draft, travelAmount: value ?? 0, totalAmount: total })} value={draft.travelAmount} />
      <ErpMoneyField label="Tax" min={0} onChange={(value) => onChange({ ...draft, taxAmount: value ?? 0, totalAmount: total })} value={draft.taxAmount} />
      <ErpLookupField label="Status" onChange={(value) => onChange({ ...draft, status: value })} options={chargeStatuses} value={draft.status} />
      <p>Total snapshot: <strong>{money(total)}</strong></p>
    </FormShell>
  );
}

function emptyCharge(companyId: number, branchId: number): ServiceChargeUpsertRequest {
  return { companyId, branchId, chargeNo: nextNo("SCH"), serviceTicketId: 0, customerId: 0, currencyId: null, laborAmount: 0, partsAmount: 0, travelAmount: 0, otherAmount: 0, discountAmount: 0, taxCodeId: null, taxRateSnapshot: null, taxAmount: 0, totalAmount: 0, billableStatus: "Billable", nonBillableReason: null, arInvoiceId: null, status: "Draft", snapshotJson: "{}" };
}

export function ServiceReportsPage() {
  const serviceReports = [
    "SERVICE-TICKET-REGISTER",
    "SERVICE-ASSET-HISTORY",
    "SERVICE-WARRANTY-CLAIM-REGISTER",
    "SERVICE-AMC-CONTRACT-REGISTER",
    "SERVICE-SPARE-CONSUMPTION",
    "SERVICE-CHARGE-REGISTER"
  ];
  return (
    <ListPageShell description="Service report links are backed by Pack 07 report registry and generated output audit." title="Service Reports">
      <DataGrid
        ariaLabel="Service reports"
        columns={[
          { key: "code", header: "Report", render: (code) => <strong>{code}</strong> },
          { key: "source", header: "Dataset", render: (code) => code.toLowerCase().replaceAll("-", ".") },
          { key: "action", header: "Action", render: (code) => <a href={`/reports/catalog?reportCode=${encodeURIComponent(code)}`}>Open report catalog</a> }
        ]}
        getRowId={(code) => code}
        records={serviceReports}
        rowLabel={(code) => code}
      />
    </ListPageShell>
  );
}

export function ServiceUdfPlacementPanel({ entityType, entityId }: { entityType: string; entityId?: number | null }) {
  return (
    <UdfRuntimePanel
      disabledReason={entityId ? undefined : "Save the service record before entering UDF values."}
      entityId={entityId}
      entityType={entityType}
      screenKey={`service.${entityType.toLowerCase()}`}
    />
  );
}
