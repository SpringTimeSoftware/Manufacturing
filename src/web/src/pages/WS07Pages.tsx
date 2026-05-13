import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type {
  AiAssistantIntentDefinitionDto,
  AiAssistantPlanRequest,
  AiAssistantQueryPlanDto,
  AiDraftRequest,
  AiExecutionPolicyDto,
  AiModelDto,
  AiProviderDto,
  AiProviderHealthDto,
  AiRunDto,
  ExportJobCreateRequest,
  ExportJobDto,
  ImportJobCreateRequest,
  ImportJobDto,
  IntegrationConnectionDto,
  IntegrationJobStatusUpdateRequest,
  IntegrationProviderDto,
  IntegrationProviderUpsertRequest,
  OutboundDeliveryStatusDto,
  OutboundMessagePreviewDto,
  OutboundMessagePreviewRequest,
  OutboundProviderHealthDto,
  PagedResult,
  QueryFilter,
  TranslationDraftDto,
  TranslationDraftRequest,
  WebhookDispatchRequest,
  WebhookDispatchResultDto,
  WebhookSubscriptionDto,
  WebhookSubscriptionUpsertRequest
} from "../api/contracts";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { apiClient } from "../api/http";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { type DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpEmptyState,
  ErpFileActionState,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
  ErpNumberField
} from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

type Ws07Source = "Live" | "Review";
type Tone = "success" | "warn" | "danger" | "info" | "neutral";

const statusOptions = ["Active", "Inactive", "Draft", "Paused", "Healthy", "Degraded", "Failed", "Queued", "Completed"].map(toOption);
const providerTypeOptions = ["Email", "SMS", "WhatsApp", "CRM", "Webhook", "Storage", "AI"].map(toOption);
const channelOptions = ["Email", "SMS", "WhatsApp"].map(toOption);
const moduleOptions = [
  "master.items",
  "master.customers",
  "master.suppliers",
  "sales.quotes",
  "planning.mrp",
  "quality.ncr",
  "dispatch.shipments"
].map(toOption);
const formatOptions = ["CSV", "XLSX", "JSON", "PDF"].map(toOption);
const languageOptions = [
  { label: "Hindi", value: "hi-IN" },
  { label: "Marathi", value: "mr-IN" },
  { label: "English", value: "en-IN" }
];

function toOption(value: string) {
  return { label: value, value };
}

function asPaged<T>(items: T[]): PagedResult<T> {
  return { items, page: 1, pageSize: items.length || 25, totalCount: items.length, totalPages: 1 };
}

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 16).replace("T", " ") : "Not recorded";
}

function sourceFor(session: unknown): Ws07Source {
  return hasLiveSession(session as never) ? "Live" : "Review";
}

function SourceBadge({ source }: { source: Ws07Source }) {
  return <Badge tone={source === "Live" ? "success" : "info"}>{source === "Live" ? "Live records" : "Review mode"}</Badge>;
}

function statusTone(status: string): Tone {
  const normalized = status.toLowerCase();
  if (normalized.includes("active") || normalized.includes("healthy") || normalized.includes("complete") || normalized.includes("delivered")) return "success";
  if (normalized.includes("fail") || normalized.includes("error") || normalized.includes("inactive")) return "danger";
  if (normalized.includes("queue") || normalized.includes("draft") || normalized.includes("pending") || normalized.includes("degraded")) return "warn";
  return "info";
}

function useWs07Filter(statusDefault = "all") {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(statusDefault);
  const deferredSearch = useDeferredValue(search);
  const filter: QueryFilter = useMemo(
    () => ({ page: 1, pageSize: 25, search: deferredSearch || undefined, status: status === "all" ? undefined : status }),
    [deferredSearch, status]
  );

  return { deferredSearch, filter, search, setSearch, setStatus, status };
}

const seededProviders: IntegrationProviderDto[] = [
  { id: 701, providerCode: "SMTP-IN", providerName: "Transactional Email", providerType: "Email", baseUrl: "smtp://mail.sts.local", status: "Active", isSystemBase: true },
  { id: 702, providerCode: "SMS-GW", providerName: "SMS Gateway", providerType: "SMS", baseUrl: "https://sms.example.local", status: "Paused", isSystemBase: false },
  { id: 703, providerCode: "CRM-SYNC", providerName: "CRM Connector", providerType: "CRM", baseUrl: "https://crm.example.local", status: "Draft", isSystemBase: false }
];

const seededConnections: IntegrationConnectionDto[] = [
  { id: 801, companyId: 1, branchId: 10, integrationProviderId: 701, connectionCode: "MAIL-PLANT1", connectionName: "Plant email channel", endpointUrl: "smtp://mail.sts.local", credentialReference: "secret://mail/plant1", status: "Active", lastHealthCheckedOn: "2026-05-13T08:30:00Z", lastHealthStatus: "Healthy" },
  { id: 802, companyId: 1, branchId: 10, integrationProviderId: 703, connectionCode: "CRM-QUOTE", connectionName: "Quote status sync", endpointUrl: "https://crm.example.local/quotes", credentialReference: "secret://crm/quote", status: "Draft", lastHealthCheckedOn: null, lastHealthStatus: "Not checked" }
];

const seededHealth: OutboundProviderHealthDto[] = [
  { channelType: "Email", providerCode: "SMTP-IN", status: "Healthy", activeConnectionCount: 1, notes: "Ready for transactional mail." },
  { channelType: "SMS", providerCode: "SMS-GW", status: "Degraded", activeConnectionCount: 0, notes: "Credentials require administrator review." },
  { channelType: "WhatsApp", providerCode: null, status: "Inactive", activeConnectionCount: 0, notes: "Provider has not been activated." }
];

const seededWebhooks: WebhookSubscriptionDto[] = [
  { id: 901, companyId: 1, branchId: 10, subscriptionCode: "WH-DISPATCH", eventType: "Dispatch.ShipmentClosed", targetUrl: "https://customer.example.local/hooks/dispatch", secretReference: "secret://webhooks/dispatch", headersJson: "{\"x-source\":\"sts\"}", status: "Active", lastDeliveredOn: "2026-05-13T07:55:00Z", retryQueuedOn: null },
  { id: 902, companyId: 1, branchId: null, subscriptionCode: "WH-NCR", eventType: "Quality.NcrClosed", targetUrl: "https://quality.example.local/hooks/ncr", secretReference: "secret://webhooks/ncr", headersJson: null, status: "Draft", lastDeliveredOn: null, retryQueuedOn: null }
];

const seededImports: ImportJobDto[] = [
  { id: 1001, companyId: 1, branchId: 10, jobNo: "IMP-ITEM-0041", module: "master.items", sourceFormat: "CSV", storagePath: "imports/master/items/IMP-ITEM-0041.csv", requestToken: "REQ-0041", status: "Queued", requestedOn: "2026-05-13T06:30:00Z", processedOn: null, lastError: null },
  { id: 1002, companyId: 1, branchId: 10, jobNo: "IMP-CUST-0039", module: "master.customers", sourceFormat: "XLSX", storagePath: "imports/master/customers/IMP-CUST-0039.xlsx", requestToken: "REQ-0039", status: "Failed", requestedOn: "2026-05-12T15:10:00Z", processedOn: "2026-05-12T15:15:00Z", lastError: "2 rows need repair before posting." }
];

const seededExports: ExportJobDto[] = [
  { id: 1101, companyId: 1, branchId: 10, jobNo: "EXP-MRP-0102", module: "planning.mrp", outputFormat: "CSV", filterJson: "{\"status\":\"Completed\"}", storagePath: "exports/planning/mrp/EXP-MRP-0102.csv", status: "Completed", requestedOn: "2026-05-13T05:40:00Z", processedOn: "2026-05-13T05:42:00Z", lastError: null },
  { id: 1102, companyId: 1, branchId: 10, jobNo: "EXP-DISP-0098", module: "dispatch.shipments", outputFormat: "PDF", filterJson: "{\"status\":\"Delivered\"}", storagePath: "exports/dispatch/shipments/EXP-DISP-0098.pdf", status: "Queued", requestedOn: "2026-05-13T08:05:00Z", processedOn: null, lastError: null }
];

const seededDeliveries: OutboundDeliveryStatusDto[] = [
  { id: 1201, channelType: "Email", redactedRecipientRef: "r***@customer.local", templateCode: "SHIPMENT_NOTICE", deliveryStatus: "Delivered", attemptCount: 1, createdOn: "2026-05-13T07:40:00Z", processedOn: "2026-05-13T07:41:00Z", lastError: null },
  { id: 1202, channelType: "SMS", redactedRecipientRef: "+91******0142", templateCode: "QC_HOLD", deliveryStatus: "RetryQueued", attemptCount: 2, createdOn: "2026-05-13T06:52:00Z", processedOn: null, lastError: "Provider credentials require review." }
];

const seededAiProviders: AiProviderDto[] = [
  { id: 1301, providerCode: "OPENAI-REVIEW", providerName: "OpenAI Review Provider", providerType: "DraftAssistant", status: "Active" }
];

const seededAiModels: AiModelDto[] = [
  { id: 1401, aiProviderId: 1301, modelCode: "draft-review", modelName: "Draft Review Model", capabilityFlagsJson: "{\"draftOnly\":true}", status: "Active" }
];

const seededAiRuns: AiRunDto[] = [
  { id: 1501, companyId: 1, branchId: 10, aiProviderId: 1301, aiModelId: 1401, aiPromptTemplateId: null, draftPurpose: "RiskDigest", relatedDocumentType: "MRP", relatedDocumentId: 102, inputText: "Summarize late purchase and dispatch risk.", outputText: "Draft notes require planner review before sharing.", runStatus: "Completed", tokenUsageJson: "{\"prompt\":120,\"completion\":44}", requiresReview: true, requestedOn: "2026-05-13T06:10:00Z", completedOn: "2026-05-13T06:11:00Z" }
];

const seededIntents: AiAssistantIntentDefinitionDto[] = [
  { intentCode: "order_risk_digest", displayName: "Order risk digest", description: "Prepare a governed summary of late, blocked, and dispatch-risk orders.", executionKind: "ReadOnlyPlan", commandName: "BuildOrderRiskDigest", allowedParameters: ["dateFrom", "dateTo", "customer"] },
  { intentCode: "quality_hold_summary", displayName: "Quality hold summary", description: "Summarize open holds and NCR risk for review.", executionKind: "ReadOnlyPlan", commandName: "BuildQualityHoldSummary", allowedParameters: ["status", "branch"] }
];

const seededPolicy: AiExecutionPolicyDto = {
  draftOnly: true,
  allowsOperationalWriteBack: false,
  masksPii: true,
  reviewRequirement: "All generated content must be reviewed by an authorized user before use."
};

const seededAiHealth: AiProviderHealthDto[] = [
  { providerId: 1301, providerCode: "OPENAI-REVIEW", status: "Healthy", activeModelCount: 1, notes: "Draft-only policy is enforced." }
];

function providerColumns(onSelect: (record: IntegrationProviderDto) => void): DataGridColumn<IntegrationProviderDto>[] {
  return [
    { key: "code", header: "Provider", render: (record) => <strong>{record.providerCode}</strong> },
    { key: "name", header: "Name", render: (record) => record.providerName },
    { key: "type", header: "Type", width: "14%", render: (record) => record.providerType },
    { key: "status", header: "Status", width: "12%", render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge> },
    { key: "open", header: "Action", width: "12%", render: (record) => <button className="link-button" onClick={() => onSelect(record)}>Open</button> }
  ];
}

export function IntegrationProviderAdminPage() {
  const { session, user } = useAuth();
  const isLive = hasLiveSession(session);
  const source = sourceFor(session);
  const { filter, search, setSearch, setStatus, status } = useWs07Filter();
  const [selected, setSelected] = useState<IntegrationProviderDto | null>(null);
  const [draft, setDraft] = useState<IntegrationProviderUpsertRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const query = useApiQuery(queryKeys.ws07.integrationProviders(user?.activeContext.companyId, filter.search as string, status), () =>
    isLive ? apiClient.integrations.providers(filter) : Promise.resolve(asPaged(seededProviders)), { staleTime: 60_000 });
  const connectionQuery = useApiQuery(["ws07", "connections", user?.activeContext.companyId ?? 0], () =>
    isLive ? apiClient.integrations.connections({ companyId: user?.activeContext.companyId ?? undefined, branchId: user?.activeContext.branchId ?? undefined }) : Promise.resolve(asPaged(seededConnections)), { staleTime: 60_000 });
  const records = query.data?.items ?? [];
  const connections = connectionQuery.data?.items ?? [];
  const save = useApiMutation(
    (request: IntegrationProviderUpsertRequest) => selected ? apiClient.integrations.updateProvider(selected.id, request) : apiClient.integrations.createProvider(request),
    { onSuccess: async () => { setMessage("Integration provider saved."); setDraft(null); setSelected(null); await query.refetch(); }, onError: (error) => setMessage(error.message) }
  );
  const saveReason = !isLive ? "Provider setup changes require a live platform administration session." : save.isPending ? "Provider save is in progress." : undefined;

  const openProvider = (record: IntegrationProviderDto) => {
    setSelected(record);
    setDraft({ providerCode: record.providerCode, providerName: record.providerName, providerType: record.providerType, baseUrl: record.baseUrl, status: record.status, isSystemBase: record.isSystemBase });
    setMessage(null);
  };

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "New provider", onClick: () => { setSelected(null); setDraft({ providerCode: "", providerName: "", providerType: "Email", baseUrl: null, status: "Draft", isSystemBase: false }); } }]} secondary={[{ disabled: true, label: "Rotate credentials", reason: "Credential rotation must be completed in the approved secret store." }]} testId="integration-provider-action-bar" /></>}
        description="Provider, channel, and connection readiness for email, SMS, WhatsApp, CRM, webhook, storage, and AI integrations."
        filters={<ErpFilterBar ariaLabel="Integration provider filters" onClear={() => { setSearch(""); setStatus("all"); }}><input aria-label="Search providers" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search provider or channel" value={search} /><select aria-label="Provider status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Active">Active</option><option value="Draft">Draft</option><option value="Paused">Paused</option></select></ErpFilterBar>}
        title="Integration Provider Admin"
      >
        <KpiStrip items={[{ label: "Providers", value: String(records.length) }, { label: "Connections", value: String(connections.length) }, { label: "Active", value: String(records.filter((record) => record.status === "Active").length) }, { label: "Mode", value: source }]} />
        <Card title="Provider registry" description="Open a provider to review connection metadata and save live setup changes.">
          <ErpGrid ariaLabel="Integration provider table" columns={providerColumns(openProvider)} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={records} rowLabel={(record) => `${record.providerCode} provider`} />
        </Card>
        <Card title="Connection health context" description="Credential references are redacted and stored by reference only.">
          <ErpGrid
            ariaLabel="Integration connection table"
            columns={[
              { key: "code", header: "Connection", render: (record: IntegrationConnectionDto) => <strong>{record.connectionCode}</strong> },
              { key: "name", header: "Name", render: (record) => record.connectionName },
              { key: "credential", header: "Credential reference", render: (record) => record.credentialReference ?? "Not assigned" },
              { key: "health", header: "Health", render: (record) => <Badge tone={statusTone(record.lastHealthStatus ?? record.status)}>{record.lastHealthStatus ?? record.status}</Badge> }
            ]}
            getRowId={(record) => String(record.id)}
            isLoading={connectionQuery.isLoading}
            records={connections}
            rowLabel={(record) => `${record.connectionCode} connection`}
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Provider setup changes are audited by the platform administration API."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason), label: save.isPending ? "Saving provider" : "Save provider", onClick: draft && !saveReason ? () => save.mutate(draft) : undefined, reason: saveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={message ? <Badge tone={message.includes("saved") ? "success" : "danger"}>{message}</Badge> : null}
        title={selected?.providerCode ?? "New provider"}
      >
        {draft ? (
          <FormShell initialFingerprint={`${selected?.id ?? "new"}-${draft.providerCode}-${draft.status}`} title="Provider controls">
            <label><span>Provider code</span><input disabled={!isLive || selected?.isSystemBase} onChange={(event) => setDraft({ ...draft, providerCode: event.target.value })} value={draft.providerCode} /></label>
            <label><span>Provider name</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, providerName: event.target.value })} value={draft.providerName} /></label>
            <ErpLookupField disabled={!isLive} disabledReason={!isLive ? "Live platform sign-in is required before changing provider type." : undefined} label="Provider type" onChange={(value) => setDraft({ ...draft, providerType: value })} options={providerTypeOptions} value={draft.providerType} />
            <ErpLookupField disabled={!isLive} disabledReason={!isLive ? "Live platform sign-in is required before changing status." : undefined} label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={statusOptions} value={draft.status} />
            <label className="form-span-2"><span>Endpoint / base URL</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, baseUrl: event.target.value || null })} value={draft.baseUrl ?? ""} /></label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function ProviderHealthPage() {
  const { session } = useAuth();
  const isLive = hasLiveSession(session);
  const query = useApiQuery(queryKeys.ws07.providerHealth(), async () => ({
    ai: isLive ? await apiClient.ai.providerHealth() : seededAiHealth,
    outbound: isLive ? await apiClient.integrations.providerHealth() : seededHealth
  }), { staleTime: 60_000 });
  const outbound = query.data?.outbound ?? [];
  const ai = query.data?.ai ?? [];
  return (
    <ListPageShell
      actions={<><SourceBadge source={sourceFor(session)} /><ErpActionBar primary={[{ label: "Refresh health", onClick: () => void query.refetch() }]} secondary={[{ disabled: true, label: "Run external probe", reason: "External provider probes must run from the server network allow-list." }]} testId="provider-health-action-bar" /></>}
      description="Live health for outbound channels and AI providers. Demo review mode uses explicit non-live rows."
      title="Provider Health"
    >
      <KpiStrip items={[{ label: "Outbound channels", value: String(outbound.length) }, { label: "AI providers", value: String(ai.length) }, { label: "Healthy", value: String([...outbound, ...ai].filter((record) => record.status === "Healthy").length) }]} />
      <Card title="Outbound channel health" description="Email, SMS, WhatsApp, and CRM message channels with redacted provider context.">
        <ErpGrid ariaLabel="Outbound provider health" columns={[
          { key: "channel", header: "Channel", render: (record: OutboundProviderHealthDto) => <strong>{record.channelType}</strong> },
          { key: "provider", header: "Provider", render: (record) => record.providerCode ?? "Not configured" },
          { key: "connections", header: "Connections", render: (record) => <ErpNumberField disabled disabledReason="Connection count is calculated from active setup." label={`${record.channelType} active connections`} onChange={() => undefined} value={record.activeConnectionCount} /> },
          { key: "status", header: "Status", render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge> },
          { key: "notes", header: "Notes", render: (record) => record.notes }
        ]} getRowId={(record) => record.channelType} isLoading={query.isLoading} records={outbound} />
      </Card>
      <Card title="AI provider health" description="AI providers are draft-only and permission-aware. Operational write-back is not allowed by this screen.">
        <ErpGrid ariaLabel="AI provider health" columns={[
          { key: "provider", header: "Provider", render: (record: AiProviderHealthDto) => <strong>{record.providerCode}</strong> },
          { key: "models", header: "Models", render: (record) => <ErpNumberField disabled disabledReason="Model count is calculated from active AI setup." label={`${record.providerCode} active models`} onChange={() => undefined} value={record.activeModelCount} /> },
          { key: "status", header: "Status", render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge> },
          { key: "notes", header: "Notes", render: (record) => record.notes ?? "No notes" }
        ]} getRowId={(record) => String(record.providerId)} records={ai} />
      </Card>
    </ListPageShell>
  );
}

export function WebhookAdminPage() {
  const { session, user } = useAuth();
  const isLive = hasLiveSession(session);
  const { filter, search, setSearch, setStatus, status } = useWs07Filter();
  const [selected, setSelected] = useState<WebhookSubscriptionDto | null>(null);
  const [draft, setDraft] = useState<WebhookSubscriptionUpsertRequest | null>(null);
  const [dispatchResult, setDispatchResult] = useState<WebhookDispatchResultDto | null>(null);
  const query = useApiQuery(queryKeys.ws07.webhooks(user?.activeContext.companyId, user?.activeContext.branchId, filter.search as string, status), () => isLive ? apiClient.integrations.webhooks({ ...filter, companyId: user?.activeContext.companyId ?? undefined, branchId: user?.activeContext.branchId ?? undefined }) : Promise.resolve(asPaged(seededWebhooks)), { staleTime: 60_000 });
  const records = query.data?.items ?? [];
  const save = useApiMutation((request: WebhookSubscriptionUpsertRequest) => selected ? apiClient.integrations.updateWebhook(selected.id, request) : apiClient.integrations.createWebhook(request), { onSuccess: async () => { setDraft(null); setSelected(null); await query.refetch(); } });
  const dispatch = useApiMutation((request: WebhookDispatchRequest) => apiClient.integrations.dispatchWebhook(request), { onSuccess: (result) => setDispatchResult(result) });
  const saveReason = !isLive ? "Webhook changes require a live company administration session." : save.isPending ? "Webhook save is in progress." : undefined;

  const open = (record: WebhookSubscriptionDto) => {
    setSelected(record);
    setDraft({ companyId: record.companyId, branchId: record.branchId, subscriptionCode: record.subscriptionCode, eventType: record.eventType, targetUrl: record.targetUrl, secretReference: record.secretReference, headersJson: record.headersJson, status: record.status });
  };

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={sourceFor(session)} /><ErpActionBar primary={[{ label: "New webhook", onClick: () => setDraft({ companyId: user?.activeContext.companyId ?? 0, branchId: user?.activeContext.branchId ?? null, subscriptionCode: "", eventType: "Dispatch.ShipmentClosed", targetUrl: "", secretReference: null, headersJson: null, status: "Draft" }) }]} secondary={[{ disabled: true, label: "Rotate webhook secret", reason: "Secret rotation must be completed in the approved secret store." }]} testId="webhook-action-bar" /></>} description="Webhook subscriptions, retry scheduling, and dispatch verification for governed integration events." filters={<ErpFilterBar ariaLabel="Webhook filters" onClear={() => { setSearch(""); setStatus("all"); }}><input aria-label="Search webhooks" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search subscription or event" value={search} /><select aria-label="Webhook status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Active">Active</option><option value="Draft">Draft</option><option value="Paused">Paused</option></select></ErpFilterBar>} title="Webhook Subscriptions">
        <KpiStrip items={[{ label: "Subscriptions", value: String(records.length) }, { label: "Active", value: String(records.filter((record) => record.status === "Active").length) }, { label: "Retry queued", value: String(records.filter((record) => record.retryQueuedOn).length) }]} />
        <Card title="Webhook register" description="Open a subscription to review target, secret reference, headers, and dispatch status.">
          <ErpGrid ariaLabel="Webhook table" columns={[
            { key: "code", header: "Subscription", render: (record: WebhookSubscriptionDto) => <strong>{record.subscriptionCode}</strong> },
            { key: "event", header: "Event", render: (record) => record.eventType },
            { key: "target", header: "Target", render: (record) => record.targetUrl },
            { key: "status", header: "Status", render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge> }
          ]} getRowId={(record) => String(record.id)} onRowSelect={open} records={records} rowLabel={(record) => `${record.subscriptionCode} webhook`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Webhook dispatch tests record matched subscriptions and retry counts without exposing secrets." footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason), label: save.isPending ? "Saving webhook" : "Save webhook", onClick: draft && !saveReason ? () => save.mutate(draft) : undefined, reason: saveReason }]} secondary={[{ disabled: !isLive || !draft || dispatch.isPending, label: dispatch.isPending ? "Dispatching test" : "Dispatch test event", onClick: isLive && draft ? () => dispatch.mutate({ companyId: draft.companyId, branchId: draft.branchId, eventType: draft.eventType, payloadReference: draft.subscriptionCode || "manual-test" }) : undefined, reason: !isLive ? "Dispatch test requires a live company administration session." : undefined }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} statusMeta={dispatchResult ? <Badge tone="success">{`${dispatchResult.deliveredCount} delivered / ${dispatchResult.retryQueuedCount} retry queued`}</Badge> : null} title={selected?.subscriptionCode ?? "New webhook"}>
        {draft ? <FormShell initialFingerprint={`${selected?.id ?? "new"}-${draft.subscriptionCode}-${draft.status}`} title="Webhook controls"><label><span>Subscription code</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, subscriptionCode: event.target.value })} value={draft.subscriptionCode} /></label><ErpLookupField disabled={!isLive} disabledReason={!isLive ? "Live company sign-in is required before changing event type." : undefined} label="Event type" onChange={(value) => setDraft({ ...draft, eventType: value })} options={["Dispatch.ShipmentClosed", "Quality.NcrClosed", "Sales.QuoteApproved", "Planning.MrpCompleted"].map(toOption)} value={draft.eventType} /><ErpLookupField disabled={!isLive} disabledReason={!isLive ? "Live company sign-in is required before changing status." : undefined} label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={statusOptions} value={draft.status} /><label><span>Secret reference</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, secretReference: event.target.value || null })} value={draft.secretReference ?? ""} /></label><label className="form-span-2"><span>Target URL</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, targetUrl: event.target.value })} value={draft.targetUrl} /></label><label className="form-span-2"><span>Headers JSON</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, headersJson: event.target.value || null })} value={draft.headersJson ?? ""} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

function integrationJobColumns<T extends ImportJobDto | ExportJobDto>(kind: "import" | "export", onSelect: (record: T) => void): DataGridColumn<T>[] {
  return [
    { key: "job", header: "Job", render: (record) => <strong>{record.jobNo}</strong> },
    { key: "module", header: "Module", render: (record) => record.module },
    { key: "format", header: "Format", width: "12%", render: (record) => kind === "import" ? (record as ImportJobDto).sourceFormat : (record as ExportJobDto).outputFormat },
    { key: "requested", header: "Requested", width: "16%", render: (record) => formatDate(record.requestedOn) },
    { key: "status", header: "Status", width: "12%", render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge> },
    { key: "open", header: "Action", width: "12%", render: (record) => <button className="link-button" onClick={() => onSelect(record)}>Open</button> }
  ];
}

export function ImportJobsPage() {
  const { session, user } = useAuth();
  const isLive = hasLiveSession(session);
  const { filter, search, setSearch, setStatus, status } = useWs07Filter();
  const [draft, setDraft] = useState<ImportJobCreateRequest | null>(null);
  const [selected, setSelected] = useState<ImportJobDto | null>(null);
  const [failedRows, setFailedRows] = useState<number | null>(0);
  const query = useApiQuery(queryKeys.ws07.imports(user?.activeContext.companyId, user?.activeContext.branchId, filter.search as string, status), () => isLive ? apiClient.integrations.imports({ ...filter, companyId: user?.activeContext.companyId ?? undefined, branchId: user?.activeContext.branchId ?? undefined }) : Promise.resolve(asPaged(seededImports)), { staleTime: 60_000 });
  const records = query.data?.items ?? [];
  const create = useApiMutation((request: ImportJobCreateRequest) => apiClient.integrations.createImport(request), { onSuccess: async () => { setDraft(null); await query.refetch(); } });
  const update = useApiMutation((request: IntegrationJobStatusUpdateRequest) => selected ? apiClient.integrations.updateImportStatus(selected.id, request) : Promise.reject(new Error("Select an import job first.")), { onSuccess: async () => { setSelected(null); await query.refetch(); } });
  const liveReason = !isLive ? "Import queue changes require a live branch operations session." : undefined;
  return (
    <>
      <ListPageShell actions={<><SourceBadge source={sourceFor(session)} /><ErpActionBar primary={[{ label: "New import", onClick: () => setDraft({ companyId: user?.activeContext.companyId ?? 0, branchId: user?.activeContext.branchId ?? 0, jobNo: `IMP-${Date.now().toString().slice(-5)}`, module: "master.items", sourceFormat: "CSV", storagePath: "imports/master/items/new-upload.csv", requestToken: null }) }]} secondary={[{ disabled: true, label: "Upload source file", reason: "Binary import file staging requires the approved upload scanner workflow." }]} testId="import-action-bar" /></>} description="Import preview, validation status, and row repair governance for master, commercial, planning, and dispatch data." filters={<ErpFilterBar ariaLabel="Import filters" onClear={() => { setSearch(""); setStatus("all"); }}><input aria-label="Search imports" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search job or module" value={search} /><select aria-label="Import status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Queued">Queued</option><option value="Failed">Failed</option><option value="Completed">Completed</option></select></ErpFilterBar>} title="Import Jobs">
        <KpiStrip items={[{ label: "Imports", value: String(records.length) }, { label: "Failed", value: String(records.filter((record) => record.status === "Failed").length) }, { label: "Queued", value: String(records.filter((record) => record.status === "Queued").length) }]} />
        <Card title="Import queue" description="Open a job to inspect validation status and update row repair status in live sessions."><ErpGrid ariaLabel="Import job table" columns={integrationJobColumns<ImportJobDto>("import", setSelected)} getRowId={(record) => String(record.id)} records={records} rowLabel={(record) => `${record.jobNo} import job`} /></Card>
      </ListPageShell>
      <ErpModalWorkspace description="Import jobs are queued only after file scanning and preview validation." footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: create.isPending ? "Queueing import" : "Queue import", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="New import">
        {draft ? <FormShell initialFingerprint={`${draft.jobNo}-${draft.module}`} title="Import request"><label><span>Job number</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, jobNo: event.target.value })} value={draft.jobNo} /></label><ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Module" onChange={(value) => setDraft({ ...draft, module: value })} options={moduleOptions} value={draft.module} /><ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Source format" onChange={(value) => setDraft({ ...draft, sourceFormat: value })} options={formatOptions.filter((option) => option.value !== "PDF")} value={draft.sourceFormat} /><label className="form-span-2"><span>Storage path</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, storagePath: event.target.value })} value={draft.storagePath} /></label><ErpFileActionState enabled={false} disabledReason="Import file upload requires the approved scanner and staging workflow." label="Attach import file" /></FormShell> : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace description="Update status only after preview validation or row repair review." footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || update.isPending, label: update.isPending ? "Saving import status" : "Save import status", onClick: selected && !liveReason ? () => update.mutate({ status: selected.status, failedRowCount: failedRows, failureSummary: selected.lastError }) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setSelected(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.jobNo ?? "Import job"}>
        {selected ? <FormShell initialFingerprint={`${selected.id}-${selected.status}`} title="Import validation status"><ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Status" onChange={(value) => setSelected({ ...selected, status: value })} options={statusOptions} value={selected.status} /><ErpNumberField disabled={!isLive} disabledReason={liveReason} label="Failed rows" min={0} onChange={setFailedRows} value={failedRows} /><label className="form-span-2"><span>Failure summary</span><input disabled={!isLive} onChange={(event) => setSelected({ ...selected, lastError: event.target.value || null })} value={selected.lastError ?? ""} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

export function ExportJobsPage() {
  const { session, user } = useAuth();
  const isLive = hasLiveSession(session);
  const { filter, search, setSearch, setStatus, status } = useWs07Filter();
  const [draft, setDraft] = useState<ExportJobCreateRequest | null>(null);
  const [selected, setSelected] = useState<ExportJobDto | null>(null);
  const query = useApiQuery(queryKeys.ws07.exports(user?.activeContext.companyId, user?.activeContext.branchId, filter.search as string, status), () => isLive ? apiClient.integrations.exports({ ...filter, companyId: user?.activeContext.companyId ?? undefined, branchId: user?.activeContext.branchId ?? undefined }) : Promise.resolve(asPaged(seededExports)), { staleTime: 60_000 });
  const records = query.data?.items ?? [];
  const create = useApiMutation((request: ExportJobCreateRequest) => apiClient.integrations.createExport(request), { onSuccess: async () => { setDraft(null); await query.refetch(); } });
  const update = useApiMutation((request: IntegrationJobStatusUpdateRequest) => selected ? apiClient.integrations.updateExportStatus(selected.id, request) : Promise.reject(new Error("Select an export job first.")), { onSuccess: async () => { setSelected(null); await query.refetch(); } });
  const liveReason = !isLive ? "Export queue changes require a live branch operations session." : undefined;
  return (
    <>
      <ListPageShell actions={<><SourceBadge source={sourceFor(session)} /><ErpActionBar primary={[{ label: "Queue export", onClick: () => setDraft({ companyId: user?.activeContext.companyId ?? 0, branchId: user?.activeContext.branchId ?? 0, jobNo: `EXP-${Date.now().toString().slice(-5)}`, module: "planning.mrp", outputFormat: "CSV", filterJson: "{\"status\":\"Completed\"}", storagePath: "exports/planning/mrp/new-export.csv" }) }]} secondary={[{ disabled: true, label: "Download file", reason: "Download requires a completed export and signed storage URL." }]} testId="export-action-bar" /></>} description="Governed export queue, output formats, storage paths, and audit status." filters={<ErpFilterBar ariaLabel="Export filters" onClear={() => { setSearch(""); setStatus("all"); }}><input aria-label="Search exports" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search job or module" value={search} /><select aria-label="Export status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Queued">Queued</option><option value="Completed">Completed</option><option value="Failed">Failed</option></select></ErpFilterBar>} title="Export Jobs">
        <KpiStrip items={[{ label: "Exports", value: String(records.length) }, { label: "Completed", value: String(records.filter((record) => record.status === "Completed").length) }, { label: "Queued", value: String(records.filter((record) => record.status === "Queued").length) }]} />
        <Card title="Export queue" description="Queue report and data extracts through the live export audit endpoint."><ErpGrid ariaLabel="Export job table" columns={integrationJobColumns<ExportJobDto>("export", setSelected)} getRowId={(record) => String(record.id)} records={records} rowLabel={(record) => `${record.jobNo} export job`} /></Card>
      </ListPageShell>
      <ErpModalWorkspace description="Export requests are audited and processed by module-specific report handlers." footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: create.isPending ? "Queueing export" : "Queue export", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Queue export">
        {draft ? <FormShell initialFingerprint={`${draft.jobNo}-${draft.module}`} title="Export request"><label><span>Job number</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, jobNo: event.target.value })} value={draft.jobNo} /></label><ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Module" onChange={(value) => setDraft({ ...draft, module: value })} options={moduleOptions} value={draft.module} /><ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Output format" onChange={(value) => setDraft({ ...draft, outputFormat: value })} options={formatOptions} value={draft.outputFormat} /><label><span>Filter JSON</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, filterJson: event.target.value || null })} value={draft.filterJson ?? ""} /></label><label className="form-span-2"><span>Storage path</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, storagePath: event.target.value })} value={draft.storagePath} /></label></FormShell> : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace description="Status updates are reserved for authorized export processors and support teams." footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || update.isPending, label: update.isPending ? "Saving export status" : "Save export status", onClick: selected && !liveReason ? () => update.mutate({ status: selected.status, lastError: selected.lastError }) : undefined, reason: liveReason }]} secondary={[{ disabled: true, label: "Open storage file", reason: "Storage file access requires a completed export and signed URL." }]} utility={[{ label: "Close", onClick: () => setSelected(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.jobNo ?? "Export job"}>
        {selected ? <FormShell initialFingerprint={`${selected.id}-${selected.status}`} title="Export status"><ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Status" onChange={(value) => setSelected({ ...selected, status: value })} options={statusOptions} value={selected.status} /><label><span>Last error</span><input disabled={!isLive} onChange={(event) => setSelected({ ...selected, lastError: event.target.value || null })} value={selected.lastError ?? ""} /></label><label className="form-span-2"><span>Storage path</span><input disabled value={selected.storagePath} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

export function DeliveryLogsPage() {
  const { session, user } = useAuth();
  const isLive = hasLiveSession(session);
  const { filter, search, setSearch, setStatus, status } = useWs07Filter();
  const [preview, setPreview] = useState<OutboundMessagePreviewDto | null>(null);
  const [draft, setDraft] = useState<OutboundMessagePreviewRequest>({ companyId: user?.activeContext.companyId ?? null, branchId: user?.activeContext.branchId ?? null, channelType: "Email", recipientRef: "dispatch@customer.local", templateCode: "SHIPMENT_NOTICE", tokens: { document: "SHIP-2026-0029" } });
  const query = useApiQuery(queryKeys.ws07.deliveries(user?.activeContext.companyId, user?.activeContext.branchId, filter.search as string, status), () => isLive ? apiClient.integrations.deliveries(filter) : Promise.resolve(asPaged(seededDeliveries)), { staleTime: 60_000 });
  const previewMutation = useApiMutation((request: OutboundMessagePreviewRequest) => apiClient.integrations.previewMessage(request), { onSuccess: setPreview });
  const queueMutation = useApiMutation(() => apiClient.integrations.queueMessage({ ...draft, relatedDocumentType: "Shipment", relatedDocumentId: 1001 }), { onSuccess: async () => { await query.refetch(); } });
  const liveReason = !isLive ? "Message preview and queue require a live branch operations session." : undefined;
  return (
    <ListPageShell actions={<><SourceBadge source={sourceFor(session)} /><ErpActionBar primary={[{ disabled: Boolean(liveReason) || previewMutation.isPending, label: previewMutation.isPending ? "Rendering preview" : "Preview message", onClick: !liveReason ? () => previewMutation.mutate(draft) : undefined, reason: liveReason }, { disabled: Boolean(liveReason) || !preview || queueMutation.isPending, label: queueMutation.isPending ? "Queueing message" : "Queue message", onClick: !liveReason && preview ? () => queueMutation.mutate(undefined) : undefined, reason: !preview ? "Preview the message before queueing delivery." : liveReason }]} testId="delivery-log-action-bar" /></>} description="Outbound email, SMS, WhatsApp, and CRM message deliveries with redacted recipients and retry state." filters={<ErpFilterBar ariaLabel="Delivery log filters" onClear={() => { setSearch(""); setStatus("all"); }}><input aria-label="Search delivery logs" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search template or recipient" value={search} /><select aria-label="Delivery status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Delivered">Delivered</option><option value="RetryQueued">Retry queued</option><option value="Failed">Failed</option></select></ErpFilterBar>} title="Delivery Logs">
      <KpiStrip items={[{ label: "Deliveries", value: String(query.data?.items.length ?? 0) }, { label: "Retry", value: String((query.data?.items ?? []).filter((record) => record.deliveryStatus.includes("Retry")).length) }, { label: "Mode", value: sourceFor(session) }]} />
      <div className="split-panels">
        <Card title="Message preview controls" description="Recipients are redacted after preview and deliveries are queued through provider policy.">
          <FormShell initialFingerprint={`${draft.channelType}-${draft.templateCode}`} title="Preview request">
            <ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Channel" onChange={(value) => setDraft({ ...draft, channelType: value })} options={channelOptions} value={draft.channelType} />
            <ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Template" onChange={(value) => setDraft({ ...draft, templateCode: value })} options={["SHIPMENT_NOTICE", "QC_HOLD", "QUOTE_FOLLOWUP"].map(toOption)} value={draft.templateCode} />
            <label><span>Recipient</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, recipientRef: event.target.value })} value={draft.recipientRef} /></label>
            <label><span>Document token</span><input disabled={!isLive} onChange={(event) => setDraft({ ...draft, tokens: { document: event.target.value } })} value={draft.tokens.document ?? ""} /></label>
          </FormShell>
          {preview ? <Card title="Rendered preview" description={preview.redactedRecipientRef}><p>{preview.renderedMessage}</p></Card> : null}
        </Card>
        <Card title="Delivery register" description="Attempt counts are numeric and delivery errors remain visible for support review.">
          <ErpGrid ariaLabel="Delivery log table" columns={[
            { key: "channel", header: "Channel", render: (record: OutboundDeliveryStatusDto) => <strong>{record.channelType}</strong> },
            { key: "recipient", header: "Recipient", render: (record) => record.redactedRecipientRef },
            { key: "template", header: "Template", render: (record) => record.templateCode },
            { key: "attempts", header: "Attempts", render: (record) => <ErpNumberField disabled disabledReason="Attempt count is generated by the delivery worker." label={`${record.templateCode} attempts`} onChange={() => undefined} value={record.attemptCount} /> },
            { key: "status", header: "Status", render: (record) => <Badge tone={statusTone(record.deliveryStatus)}>{record.deliveryStatus}</Badge> }
          ]} getRowId={(record) => String(record.id)} records={query.data?.items ?? []} />
        </Card>
      </div>
    </ListPageShell>
  );
}

export function AiAssistantPage() {
  const { session, user } = useAuth();
  const isLive = hasLiveSession(session);
  const [intentCode, setIntentCode] = useState("order_risk_digest");
  const [question, setQuestion] = useState("Which customer orders need attention today?");
  const [plan, setPlan] = useState<AiAssistantQueryPlanDto | null>(null);
  const [draftText, setDraftText] = useState("Summarize open order, quality, and dispatch risk for review.");
  const [providerId, setProviderId] = useState("1301");
  const [modelId, setModelId] = useState("1401");
  const query = useApiQuery(queryKeys.ws07.aiAssistant(user?.activeContext.companyId, user?.activeContext.branchId), async () => ({
    intents: isLive ? await apiClient.ai.assistantIntents() : seededIntents,
    models: isLive ? (await apiClient.ai.models()).items : seededAiModels,
    policy: isLive ? await apiClient.ai.executionPolicy() : seededPolicy,
    providers: isLive ? (await apiClient.ai.providers()).items : seededAiProviders,
    runs: isLive ? (await apiClient.ai.runs({ companyId: user?.activeContext.companyId ?? undefined, branchId: user?.activeContext.branchId ?? undefined })).items : seededAiRuns
  }), { staleTime: 60_000 });
  const planMutation = useApiMutation((request: AiAssistantPlanRequest) => apiClient.ai.createAssistantPlan(request), { onSuccess: setPlan });
  const draftMutation = useApiMutation((request: AiDraftRequest) => apiClient.ai.createDraft(request), { onSuccess: async () => { await query.refetch(); } });
  const liveReason = !isLive ? "AI assistant planning requires a live permission-aware session." : undefined;
  const providerOptions = (query.data?.providers ?? seededAiProviders).map((provider) => ({ label: provider.providerCode, value: String(provider.id) }));
  const modelOptions = (query.data?.models ?? seededAiModels).map((model) => ({ label: model.modelCode, value: String(model.id) }));
  const intentOptions = (query.data?.intents ?? seededIntents).map((intent) => ({ label: intent.displayName, value: intent.intentCode }));
  const policy = query.data?.policy ?? seededPolicy;
  return (
    <ListPageShell actions={<><SourceBadge source={sourceFor(session)} /><ErpActionBar primary={[{ disabled: Boolean(liveReason) || planMutation.isPending, label: planMutation.isPending ? "Preparing plan" : "Prepare governed plan", onClick: !liveReason ? () => planMutation.mutate({ companyId: user?.activeContext.companyId ?? null, branchId: user?.activeContext.branchId ?? null, intentCode, parameters: { dateFrom: "2026-05-13", dateTo: "2026-05-13" }, userQuestion: question }) : undefined, reason: liveReason }, { disabled: Boolean(liveReason) || draftMutation.isPending, label: draftMutation.isPending ? "Generating draft" : "Generate draft", onClick: !liveReason ? () => draftMutation.mutate({ companyId: user?.activeContext.companyId ?? null, branchId: user?.activeContext.branchId ?? null, aiProviderId: Number(providerId), aiModelId: Number(modelId), aiPromptTemplateId: null, draftPurpose: "RiskDigest", inputText: draftText, relatedDocumentType: "DailyReview", relatedDocumentId: null }) : undefined, reason: liveReason }]} secondary={[{ disabled: true, label: "Apply recommendation", reason: "AI outputs are draft-only and cannot write operational data." }]} testId="ai-assistant-action-bar" /></>} description="Grounded, permission-aware AI planning. The assistant prepares reviewed drafts and never applies operational writes from this screen." title="AI Assistant">
      <KpiStrip items={[{ label: "Draft only", value: policy.draftOnly ? "Yes" : "No" }, { label: "Write-back", value: policy.allowsOperationalWriteBack ? "Allowed" : "Blocked" }, { label: "PII masking", value: policy.masksPii ? "On" : "Off" }, { label: "Runs", value: String(query.data?.runs.length ?? 0) }]} />
      <div className="split-panels">
        <Card title="Assistant controls" description={policy.reviewRequirement}>
          <FormShell initialFingerprint={`${intentCode}-${providerId}-${modelId}`} title="Plan and draft setup">
            <ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Intent" onChange={setIntentCode} options={intentOptions} value={intentCode} />
            <ErpLookupField disabled={!isLive} disabledReason={liveReason} label="AI provider" onChange={setProviderId} options={providerOptions} value={providerId} />
            <ErpLookupField disabled={!isLive} disabledReason={liveReason} label="AI model" onChange={setModelId} options={modelOptions} value={modelId} />
            <label className="form-span-2"><span>User question</span><input disabled={!isLive} onChange={(event) => setQuestion(event.target.value)} value={question} /></label>
            <label className="form-span-2"><span>Draft input</span><input disabled={!isLive} onChange={(event) => setDraftText(event.target.value)} value={draftText} /></label>
          </FormShell>
          {plan ? <Card title="Governed query plan" description={plan.safetyNote}><p>{`${plan.commandName} / arbitrary SQL: ${plan.usesArbitrarySql ? "yes" : "no"} / review: ${plan.requiresReview ? "required" : "not required"}`}</p></Card> : null}
        </Card>
        <Card title="AI run register" description="Completed outputs remain draft content until reviewed.">
          <ErpGrid ariaLabel="AI run table" columns={[
            { key: "purpose", header: "Purpose", render: (record: AiRunDto) => <strong>{record.draftPurpose}</strong> },
            { key: "status", header: "Status", render: (record) => <Badge tone={statusTone(record.runStatus)}>{record.runStatus}</Badge> },
            { key: "review", header: "Review", render: (record) => record.requiresReview ? "Required" : "Not required" },
            { key: "requested", header: "Requested", render: (record) => formatDate(record.requestedOn) },
            { key: "output", header: "Output", render: (record) => record.outputText ?? "Draft pending" }
          ]} getRowId={(record) => String(record.id)} records={query.data?.runs ?? []} />
        </Card>
      </div>
    </ListPageShell>
  );
}

export function TranslationAssistantPage() {
  const { session, user } = useAuth();
  const isLive = hasLiveSession(session);
  const [providerId, setProviderId] = useState("1301");
  const [modelId, setModelId] = useState("1401");
  const [sourceText, setSourceText] = useState("Shipment proof is ready for customer review.");
  const [targetLanguageCode, setTargetLanguageCode] = useState("hi-IN");
  const [draft, setDraft] = useState<TranslationDraftDto | null>(null);
  const query = useApiQuery(queryKeys.ws07.translationAssistant(user?.activeContext.companyId, user?.activeContext.branchId), async () => ({
    models: isLive ? (await apiClient.ai.models()).items : seededAiModels,
    providers: isLive ? (await apiClient.ai.providers()).items : seededAiProviders
  }), { staleTime: 60_000 });
  const mutation = useApiMutation((request: TranslationDraftRequest) => apiClient.ai.createTranslationDraft(request), { onSuccess: setDraft });
  const liveReason = !isLive ? "Translation assistant requires a live permission-aware session." : undefined;
  return (
    <ListPageShell actions={<><SourceBadge source={sourceFor(session)} /><ErpActionBar primary={[{ disabled: Boolean(liveReason) || mutation.isPending, label: mutation.isPending ? "Generating translation" : "Generate translation draft", onClick: !liveReason ? () => mutation.mutate({ companyId: user?.activeContext.companyId ?? null, branchId: user?.activeContext.branchId ?? null, aiProviderId: Number(providerId), aiModelId: Number(modelId), aiPromptTemplateId: null, sourceText, targetLanguageCode, sourceLanguageCode: "en-IN", relatedDocumentType: "Shipment", relatedDocumentId: null }) : undefined, reason: liveReason }]} secondary={[{ disabled: true, label: "Publish translation", reason: "AI translation drafts require human review before publishing." }]} testId="translation-assistant-action-bar" /></>} description="Draft translation support for labels, notifications, and screen resources. Generated text is review-only." title="Translation Assistant">
      <div className="split-panels">
        <Card title="Translation controls" description="The assistant uses governed provider, model, and language selections.">
          <FormShell initialFingerprint={`${providerId}-${modelId}-${targetLanguageCode}`} title="Translation request">
            <ErpLookupField disabled={!isLive} disabledReason={liveReason} label="AI provider" onChange={setProviderId} options={(query.data?.providers ?? seededAiProviders).map((provider) => ({ label: provider.providerCode, value: String(provider.id) }))} value={providerId} />
            <ErpLookupField disabled={!isLive} disabledReason={liveReason} label="AI model" onChange={setModelId} options={(query.data?.models ?? seededAiModels).map((model) => ({ label: model.modelCode, value: String(model.id) }))} value={modelId} />
            <ErpLookupField disabled={!isLive} disabledReason={liveReason} label="Target language" onChange={setTargetLanguageCode} options={languageOptions} value={targetLanguageCode} />
            <label className="form-span-2"><span>Source text</span><input disabled={!isLive} onChange={(event) => setSourceText(event.target.value)} value={sourceText} /></label>
          </FormShell>
        </Card>
        <Card title="Draft result" description={draft ? `Run ${draft.run.id} / ${draft.targetLanguageCode}` : "Generate a draft to review translation output."}>
          {draft ? <p>{draft.draftText}</p> : <ErpEmptyState title="No draft generated" description="Use a live session to generate a reviewed translation draft." />}
        </Card>
      </div>
    </ListPageShell>
  );
}

const reportCatalog = [
  { id: "work-order-traveler", title: "Work Order Traveler", domain: "Production", format: "PDF", ownerRole: "ProductionSupervisor", status: "Active" },
  { id: "mrp-exceptions", title: "MRP Exception Snapshot", domain: "Planning", format: "CSV", ownerRole: "PlanningManager", status: "Active" },
  { id: "shipment-proof-pack", title: "Shipment Proof Pack", domain: "Dispatch", format: "PDF", ownerRole: "DispatchManager", status: "Draft" }
];

export function ReportCatalogPage({ title = "Report Catalog" }: { title?: string } = {}) {
  const { session, user } = useAuth();
  const isLive = hasLiveSession(session);
  const [dateFrom, setDateFrom] = useState("2026-05-13");
  const [dateTo, setDateTo] = useState("2026-05-13");
  const [domain, setDomain] = useState("Production");
  const [minRisk, setMinRisk] = useState<number | null>(50);
  const exportMutation = useApiMutation((request: ExportJobCreateRequest) => apiClient.integrations.createExport(request));
  const liveReason = !isLive ? "Report export queue requires a live branch operations session." : undefined;
  return (
    <ListPageShell actions={<><SourceBadge source={sourceFor(session)} /><ErpActionBar primary={[{ disabled: Boolean(liveReason) || exportMutation.isPending, label: exportMutation.isPending ? "Queueing report" : "Queue report export", onClick: !liveReason ? () => exportMutation.mutate({ companyId: user?.activeContext.companyId ?? 0, branchId: user?.activeContext.branchId ?? 0, jobNo: `RPT-${Date.now().toString().slice(-5)}`, module: `report.${domain.toLowerCase()}`, outputFormat: "PDF", filterJson: JSON.stringify({ dateFrom, dateTo, minRisk }), storagePath: `exports/reports/${domain.toLowerCase()}/report.pdf` }) : undefined, reason: liveReason }]} secondary={[{ disabled: true, label: "Edit report layout", reason: "Report layout authoring requires the approved report-builder workflow." }]} testId="report-catalog-action-bar" /></>} description="Approved report catalog with governed parameters and audited export queue." title={title}>
      <KpiStrip items={[{ label: "Reports", value: String(reportCatalog.length) }, { label: "Active", value: String(reportCatalog.filter((report) => report.status === "Active").length) }, { label: "Mode", value: sourceFor(session) }]} />
      <div className="split-panels">
        <Card title="Report parameters" description="Dates and numeric risk thresholds use governed controls.">
          <FormShell initialFingerprint={`${dateFrom}-${dateTo}-${domain}-${minRisk}`} title="Parameter set">
            <ErpLookupField label="Domain" onChange={setDomain} options={["Production", "Planning", "Dispatch", "Quality"].map(toOption)} value={domain} />
            <label><span>Date from</span><input aria-label="Report date from" onChange={(event) => setDateFrom(event.target.value)} type="date" value={dateFrom} /></label>
            <label><span>Date to</span><input aria-label="Report date to" onChange={(event) => setDateTo(event.target.value)} type="date" value={dateTo} /></label>
            <ErpDecimalField label="Minimum risk %" max={100} min={0} onChange={setMinRisk} scale={2} unit="%" value={minRisk} />
          </FormShell>
        </Card>
        <Card title="Catalog" description="Saved views and dashboards can consume the same parameter set.">
          <ErpGrid ariaLabel="Report catalog table" columns={[
            { key: "title", header: "Report", render: (record: (typeof reportCatalog)[number]) => <strong>{record.title}</strong> },
            { key: "domain", header: "Domain", render: (record) => record.domain },
            { key: "format", header: "Format", render: (record) => record.format },
            { key: "owner", header: "Owner role", render: (record) => record.ownerRole },
            { key: "status", header: "Status", render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge> }
          ]} getRowId={(record) => record.id} records={reportCatalog} />
        </Card>
      </div>
    </ListPageShell>
  );
}

export function ReportParametersPage() {
  return <ReportCatalogPage title="Report Parameters" />;
}

export function SavedViewsPage() {
  const views = [
    { id: "view-production-risk", name: "Production risk by shift", route: "/dashboards/stage-wise", owner: "PlantHead", refreshMinutes: 15, status: "Active" },
    { id: "view-dispatch-proof", name: "Dispatch proof queue", route: "/dispatch/shipments", owner: "DispatchManager", refreshMinutes: 30, status: "Active" },
    { id: "view-quality-holds", name: "Quality holds and NCRs", route: "/quality/ncr", owner: "QCInspector", refreshMinutes: 20, status: "Draft" }
  ];
  return (
    <ListPageShell actions={<ErpActionBar primary={[{ disabled: true, label: "Save current view", reason: "Saved-view persistence requires the approved personalization workflow." }]} secondary={[{ disabled: true, label: "Share view", reason: "View sharing requires role-based publication workflow." }]} testId="saved-view-action-bar" />} description="Saved dashboard/report views with route, owner, refresh cadence, and publication state." title="Saved Views">
      <KpiStrip items={[{ label: "Saved views", value: String(views.length) }, { label: "Published", value: String(views.filter((view) => view.status === "Active").length) }, { label: "Draft", value: String(views.filter((view) => view.status === "Draft").length) }]} />
      <Card title="View registry" description="Refresh cadence is numeric and publication actions remain controlled by role-based workflow.">
        <ErpGrid ariaLabel="Saved view table" columns={[
          { key: "name", header: "View", render: (record: (typeof views)[number]) => <strong>{record.name}</strong> },
          { key: "route", header: "Route", render: (record) => record.route },
          { key: "owner", header: "Owner", render: (record) => record.owner },
          { key: "refresh", header: "Refresh", render: (record) => <ErpNumberField disabled disabledReason="Refresh cadence is controlled by saved-view policy." label={`${record.name} refresh minutes`} onChange={() => undefined} value={record.refreshMinutes} /> },
          { key: "status", header: "Status", render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge> }
        ]} getRowId={(record) => record.id} records={views} />
      </Card>
    </ListPageShell>
  );
}
