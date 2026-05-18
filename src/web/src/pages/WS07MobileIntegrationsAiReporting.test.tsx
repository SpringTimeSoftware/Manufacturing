import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { navigationItems } from "../layout/navigation";
import { renderWithApp } from "../test/render";
import {
  AiAssistantPage,
  CrmSyncMappingPage,
  DeliveryLogsPage,
  ExportJobsPage,
  ImportJobsPage,
  IntegrationProviderAdminPage,
  ProviderHealthPage,
  ReportCatalogPage,
  SavedViewsPage,
  WebhookAdminPage
} from "./WS07Pages";

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-access-token",
    refreshToken: "live-refresh-token"
  };
}

function paged<TItem>(items: TItem[]) {
  return {
    items,
    page: 1,
    pageSize: items.length || 1,
    totalCount: items.length,
    totalPages: 1
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WS07 mobile, integrations, AI, and reporting", () => {
  it("exposes WS07 web routes in role-aware navigation", () => {
    expect(navigationItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "/integrations/providers", section: "Integrations" }),
        expect.objectContaining({ path: "/integrations/health", section: "Integrations" }),
        expect.objectContaining({ path: "/integrations/delivery-logs", section: "Integrations" }),
        expect.objectContaining({ path: "/integrations/crm-mapping", section: "Integrations" }),
        expect.objectContaining({ path: "/integrations/imports", section: "Integrations" }),
        expect.objectContaining({ path: "/integrations/exports", section: "Integrations" }),
        expect.objectContaining({ path: "/ai/assistant", section: "AI" }),
        expect.objectContaining({ path: "/reports/catalog", section: "Reports" }),
        expect.objectContaining({ path: "/reports/saved-views", section: "Reports" })
      ])
    );
  });

  it("opens provider create workspace and disables save with a reason in review mode", async () => {
    renderWithApp(
      <Routes>
        <Route path="/integrations/providers" element={<IntegrationProviderAdminPage />} />
      </Routes>,
      { route: "/integrations/providers" }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New provider" }));

    expect(await screen.findByText("Provider controls")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save provider" })).toBeDisabled();
    expect(screen.getAllByText("Provider setup changes require a live platform administration session.").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Provider type").closest("[data-control-type='lookup']")).toBeTruthy();
  });

  it("saves live provider setup and webhook dispatch through real API clients", async () => {
    vi.spyOn(apiClient.integrations, "providers").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.integrations, "connections").mockResolvedValue(paged([]) as never);
    const createProvider = vi.spyOn(apiClient.integrations, "createProvider").mockResolvedValue({
      id: 9001,
      providerCode: "SMTP-LIVE",
      providerName: "Live SMTP",
      providerType: "Email",
      baseUrl: "smtp://live.local",
      status: "Active",
      isSystemBase: false
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/integrations/providers" element={<IntegrationProviderAdminPage />} />
      </Routes>,
      { route: "/integrations/providers", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New provider" }));
    fireEvent.change(await screen.findByLabelText("Provider code"), { target: { value: "SMTP-LIVE" } });
    fireEvent.change(screen.getByLabelText("Provider name"), { target: { value: "Live SMTP" } });
    fireEvent.click(screen.getByRole("button", { name: "Save provider" }));

    await waitFor(() => expect(createProvider).toHaveBeenCalledWith(expect.objectContaining({ providerCode: "SMTP-LIVE", providerName: "Live SMTP" })));

    cleanup();
    vi.restoreAllMocks();
    vi.spyOn(apiClient.integrations, "webhooks").mockResolvedValue(paged([
      {
        id: 9002,
        companyId: 1,
        branchId: 10,
        subscriptionCode: "WH-LIVE",
        eventType: "Dispatch.ShipmentClosed",
        targetUrl: "https://customer.example.local/hook",
        secretReference: "secret://webhook/live",
        headersJson: null,
        status: "Active",
        lastDeliveredOn: null,
        retryQueuedOn: null
      }
    ]) as never);
    const dispatchWebhook = vi.spyOn(apiClient.integrations, "dispatchWebhook").mockResolvedValue({
      deliveredCount: 1,
      retryQueuedCount: 0,
      matchedSubscriptionCount: 1
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/integrations/webhooks" element={<WebhookAdminPage />} />
      </Routes>,
      { route: "/integrations/webhooks", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByText("WH-LIVE"));
    fireEvent.click(await screen.findByRole("button", { name: "Dispatch test event" }));

    await waitFor(() => expect(dispatchWebhook).toHaveBeenCalledWith(expect.objectContaining({ eventType: "Dispatch.ShipmentClosed", payloadReference: "WH-LIVE" })));
  });

  it("maintains integration credential references and checks provider configuration without disabling the flow", async () => {
    vi.spyOn(apiClient.integrations, "providers").mockResolvedValue(paged([
      {
        id: 701,
        providerCode: "SMTP-LIVE",
        providerName: "Live SMTP",
        providerType: "Email",
        baseUrl: "smtp://live.local",
        status: "Active",
        isSystemBase: false
      }
    ]) as never);
    vi.spyOn(apiClient.integrations, "connections").mockResolvedValue(paged([]) as never);
    const createConnection = vi.spyOn(apiClient.integrations, "createConnection").mockResolvedValue({
      id: 801,
      companyId: 1,
      branchId: 10,
      integrationProviderId: 701,
      connectionCode: "MAIL-LIVE",
      connectionName: "Live mail channel",
      endpointUrl: "smtp://live.local",
      credentialReference: "secret://mail/live",
      status: "Active",
      lastHealthCheckedOn: null,
      lastHealthStatus: "PendingValidation"
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/integrations/providers" element={<IntegrationProviderAdminPage />} />
      </Routes>,
      { route: "/integrations/providers", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New connection" }));
    expect(await screen.findByText("Connection controls")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Connection code"), { target: { value: "MAIL-LIVE" } });
    fireEvent.change(screen.getByLabelText("Connection name"), { target: { value: "Live mail channel" } });
    fireEvent.change(screen.getByLabelText("Endpoint URL"), { target: { value: "smtp://live.local" } });
    fireEvent.change(screen.getByLabelText("Credential / secret reference"), { target: { value: "secret://mail/live" } });
    fireEvent.change(screen.getByLabelText("Connection status"), { target: { value: "Active" } });
    fireEvent.click(screen.getByRole("button", { name: "Save connection" }));

    await waitFor(() => expect(createConnection).toHaveBeenCalledWith(expect.objectContaining({ connectionCode: "MAIL-LIVE", credentialReference: "secret://mail/live" })));

    cleanup();
    vi.restoreAllMocks();
    const providerHealth = vi.spyOn(apiClient.integrations, "providerHealth").mockResolvedValue([
      { channelType: "Email", providerCode: "SMTP-LIVE", status: "Healthy", activeConnectionCount: 1, notes: "Ready." },
      { channelType: "WhatsApp", providerCode: null, status: "MissingConfig", activeConnectionCount: 0, notes: "Configure provider credentials before live delivery." }
    ] as never);
    vi.spyOn(apiClient.ai, "providerHealth").mockResolvedValue([] as never);

    renderWithApp(
      <Routes>
        <Route path="/integrations/provider-health" element={<ProviderHealthPage />} />
      </Routes>,
      { route: "/integrations/provider-health", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Check provider configuration" }));

    await waitFor(() => expect(providerHealth).toHaveBeenCalled());
    expect(await screen.findByText("MissingConfig")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check provider configuration" })).not.toBeDisabled();
  });

  it("queues live import and export jobs with governed module and format selectors", async () => {
    vi.spyOn(apiClient.integrations, "imports").mockResolvedValue(paged([]) as never);
    const createImport = vi.spyOn(apiClient.integrations, "createImport").mockResolvedValue({ id: 9101 } as never);

    renderWithApp(
      <Routes>
        <Route path="/integrations/imports" element={<ImportJobsPage />} />
      </Routes>,
      { route: "/integrations/imports", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New import" }));
    expect(await screen.findByText("Import request")).toBeInTheDocument();
    expect(screen.getByLabelText("Module").closest("[data-control-type='lookup']")).toBeTruthy();
    expect(screen.getByText("Import file upload requires the approved scanner and staging workflow.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Queue import" }));

    await waitFor(() => expect(createImport).toHaveBeenCalledWith(expect.objectContaining({ module: "master.items", sourceFormat: "CSV" })));

    cleanup();
    vi.restoreAllMocks();
    vi.spyOn(apiClient.integrations, "exports").mockResolvedValue(paged([]) as never);
    const createExport = vi.spyOn(apiClient.integrations, "createExport").mockResolvedValue({ id: 9102 } as never);

    renderWithApp(
      <Routes>
        <Route path="/integrations/exports" element={<ExportJobsPage />} />
      </Routes>,
      { route: "/integrations/exports", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Queue export" }));
    expect(await screen.findByText("Export request")).toBeInTheDocument();
    expect(screen.getByLabelText("Output format").closest("[data-control-type='lookup']")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Queue export" }).at(-1)!);

    await waitFor(() => expect(createExport).toHaveBeenCalledWith(expect.objectContaining({ module: "planning.mrp", outputFormat: "CSV" })));
  });

  it("previews, queues, and retries outbound deliveries through durable integration APIs", async () => {
    vi.spyOn(apiClient.integrations, "deliveries").mockResolvedValue(paged([
      {
        id: 1202,
        channelType: "Email",
        redactedRecipientRef: "c***@example.test",
        templateCode: "SHIPMENT_NOTICE",
        deliveryStatus: "Failed",
        attemptCount: 1,
        createdOn: "2026-05-18T10:00:00Z",
        processedOn: null,
        lastError: "Missing credential reference",
        providerId: 701,
        providerCode: "SMTP-LIVE",
        sourceModule: "Dispatch",
        sourceDocumentType: "Shipment",
        sourceDocumentId: 1001,
        sourceDocumentNo: "SHIP-2026-0029",
        reportOutputId: 9300,
        deliveryReceiptStatus: "Failed"
      }
    ]) as never);
    vi.spyOn(apiClient.integrations, "templates").mockResolvedValue(paged([
      {
        id: 1211,
        companyId: 1,
        integrationProviderId: 701,
        channelType: "Email",
        templateCode: "SHIPMENT_NOTICE",
        templateName: "Shipment notice",
        templateVersion: "v1",
        approvalStatus: "Approved",
        bodyTemplate: "Shipment {{document}} is ready.",
        status: "Active"
      }
    ]) as never);
    const previewMessage = vi.spyOn(apiClient.integrations, "previewMessage").mockResolvedValue({
      channelType: "Email",
      redactedRecipientRef: "d***@customer.local",
      renderedMessage: "Shipment SHIP-2026-0029 is ready.",
      disabledReason: null
    } as never);
    const queueMessage = vi.spyOn(apiClient.integrations, "queueMessage").mockResolvedValue({
      id: 1203,
      channelType: "Email",
      redactedRecipientRef: "d***@customer.local",
      templateCode: "SHIPMENT_NOTICE",
      deliveryStatus: "Queued",
      attemptCount: 0,
      createdOn: "2026-05-18T10:01:00Z",
      processedOn: null,
      lastError: null,
      providerId: 701,
      providerCode: "SMTP-LIVE",
      sourceModule: "Dispatch",
      sourceDocumentType: "Shipment",
      sourceDocumentId: 1001,
      sourceDocumentNo: "SHIP-2026-0029",
      reportOutputId: null,
      deliveryReceiptStatus: "Queued"
    } as never);
    const retryMessage = vi.spyOn(apiClient.integrations, "retryMessage").mockResolvedValue({ id: 1202, deliveryStatus: "Retrying" } as never);

    renderWithApp(
      <Routes>
        <Route path="/integrations/delivery-logs" element={<DeliveryLogsPage />} />
      </Routes>,
      { route: "/integrations/delivery-logs", session: buildLiveSession() }
    );

    expect(await screen.findByText("Missing credential reference")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Preview message" }));
    await waitFor(() => expect(previewMessage).toHaveBeenCalledWith(expect.objectContaining({ templateCode: "SHIPMENT_NOTICE" })));
    expect(await screen.findByText("Shipment SHIP-2026-0029 is ready.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Queue message" }));
    await waitFor(() => expect(queueMessage).toHaveBeenCalledWith(expect.objectContaining({ sourceModule: "Dispatch", sourceDocumentNo: "SHIP-2026-0029" })));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(retryMessage).toHaveBeenCalledWith(1202, expect.objectContaining({ reason: "Operator retry from delivery log." })));
  });

  it("persists CRM external-id mappings and records sync through live APIs", async () => {
    vi.spyOn(apiClient.integrations, "crmMappings").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.integrations, "crmConflicts").mockResolvedValue(paged([
      {
        id: 1241,
        companyId: 1,
        crmSyncJobId: 1251,
        objectType: "Customer",
        erpObjectId: 501,
        externalId: null,
        conflictType: "MissingExternalMapping",
        resolutionStatus: "Open",
        detailsJson: "{\"customer\":\"CUST-501\"}"
      }
    ]) as never);
    vi.spyOn(apiClient.integrations, "providers").mockResolvedValue(paged([
      {
        id: 703,
        providerCode: "CRM-LIVE",
        providerName: "CRM Live",
        providerType: "CRM",
        channel: "CRM",
        vendorType: "GenericCRM",
        environmentName: "Production",
        baseUrl: "https://crm.example.test",
        credentialReference: "secret://crm/live",
        senderIdentity: null,
        whatsAppBusinessNumber: null,
        templateNamespace: null,
        crmTenantReference: "tenant-live",
        callbackUrl: null,
        rateLimitPerMinute: 30,
        status: "Active",
        healthStatus: "Ready",
        lastVerifiedAt: null,
        failureReason: null,
        isSystemBase: false
      }
    ]) as never);
    const saveCrmMapping = vi.spyOn(apiClient.integrations, "saveCrmMapping").mockResolvedValue({
      id: 1231,
      companyId: 1,
      integrationProviderId: 703,
      erpObjectType: "Customer",
      erpObjectId: 501,
      externalObjectType: "Account",
      externalId: "CRM-ACC-501",
      syncDirection: "Outbound",
      conflictStatus: "None",
      lastSyncedAt: null,
      status: "Active"
    } as never);
    const runCrmSync = vi.spyOn(apiClient.integrations, "runCrmSync").mockResolvedValue({ id: 1252, status: "Queued" } as never);

    renderWithApp(
      <Routes>
        <Route path="/integrations/crm-mapping" element={<CrmSyncMappingPage />} />
      </Routes>,
      { route: "/integrations/crm-mapping", session: buildLiveSession() }
    );

    expect(await screen.findByText("MissingExternalMapping")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("ERP object ID"), { target: { value: "501" } });
    fireEvent.change(screen.getByLabelText("External ID"), { target: { value: "CRM-ACC-501" } });
    fireEvent.click(screen.getByRole("button", { name: "Save CRM mapping" }));
    await waitFor(() => expect(saveCrmMapping).toHaveBeenCalledWith(expect.objectContaining({ erpObjectType: "Customer", erpObjectId: 501, externalId: "CRM-ACC-501" })));
    fireEvent.click(screen.getByRole("button", { name: "Run CRM sync" }));
    await waitFor(() => expect(runCrmSync).toHaveBeenCalledWith(expect.objectContaining({ objectType: "Customer", syncDirection: "Outbound" })));
  });

  it("keeps AI draft-only and runs reports through persisted generated outputs", async () => {
    vi.spyOn(apiClient.ai, "assistantIntents").mockResolvedValue([
      {
        intentCode: "order_risk_digest",
        displayName: "Order risk digest",
        description: "Review order risk.",
        executionKind: "ReadOnlyPlan",
        commandName: "BuildOrderRiskDigest",
        allowedParameters: ["dateFrom", "dateTo"]
      }
    ] as never);
    vi.spyOn(apiClient.ai, "providers").mockResolvedValue(paged([{ id: 1301, providerCode: "OPENAI", providerName: "OpenAI", providerType: "DraftAssistant", status: "Active" }]) as never);
    vi.spyOn(apiClient.ai, "models").mockResolvedValue(paged([{ id: 1401, aiProviderId: 1301, modelCode: "draft-model", modelName: "Draft model", capabilityFlagsJson: "{}", status: "Active" }]) as never);
    vi.spyOn(apiClient.ai, "runs").mockResolvedValue(paged([
      {
        id: 1501,
        companyId: 1,
        branchId: 10,
        aiProviderId: 1301,
        aiModelId: 1401,
        aiPromptTemplateId: null,
        draftPurpose: "RiskDigest",
        relatedDocumentType: "DailyReview",
        relatedDocumentId: null,
        inputText: "Summarize risk.",
        outputText: "Draft follow-up text.",
        runStatus: "Completed",
        tokenUsageJson: "{}",
        requiresReview: true,
        requestedOn: "2026-05-18T10:00:00Z",
        completedOn: "2026-05-18T10:01:00Z",
        reviewStatus: "Drafted",
        reviewedByUserId: null,
        reviewedOn: null,
        reviewNote: null,
        appliedTargetType: null,
        appliedTargetId: null
      }
    ]) as never);
    vi.spyOn(apiClient.ai, "executionPolicy").mockResolvedValue({
      draftOnly: true,
      allowsOperationalWriteBack: false,
      masksPii: true,
      reviewRequirement: "Review required."
    } as never);
    const createAssistantPlan = vi.spyOn(apiClient.ai, "createAssistantPlan").mockResolvedValue({
      intentCode: "order_risk_digest",
      commandName: "BuildOrderRiskDigest",
      allowedParameters: { dateFrom: "2026-05-13" },
      usesArbitrarySql: false,
      requiresReview: true,
      safetyNote: "Grounded query only."
    } as never);
    const createDraft = vi.spyOn(apiClient.ai, "createDraft").mockResolvedValue({ id: 1501 } as never);
    const reviewRun = vi.spyOn(apiClient.ai, "reviewRun").mockResolvedValue({ id: 1501, reviewStatus: "Reviewed" } as never);

    renderWithApp(
      <Routes>
        <Route path="/ai/assistant" element={<AiAssistantPage />} />
      </Routes>,
      { route: "/ai/assistant", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Prepare governed plan" }));
    await waitFor(() => expect(createAssistantPlan).toHaveBeenCalledWith(expect.objectContaining({ intentCode: "order_risk_digest" })));
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    await waitFor(() => expect(createDraft).toHaveBeenCalledWith(expect.objectContaining({ draftPurpose: "RiskDigest" })));
    expect(screen.getByRole("button", { name: "Apply recommendation" })).toBeDisabled();
    fireEvent.click(await screen.findByRole("button", { name: "Mark reviewed" }));
    await waitFor(() => expect(reviewRun).toHaveBeenCalledWith(1501, expect.objectContaining({ reviewStatus: "Reviewed" })));

    cleanup();
    vi.restoreAllMocks();
    const reportDefinition = {
      id: 9200,
      companyId: 1,
      reportCode: "FINANCE-GL-JOURNAL-REGISTER",
      reportName: "GL journal register",
      module: "Finance",
      category: "Ledger",
      description: "GL journals from Pack 06.",
      datasetSource: "finance.gl-journal-register",
      reportType: "Ledger",
      outputFormats: ["CSV", "PDF"],
      permissionKey: "reports.finance.run",
      parameterSchemaJson: "{}",
      defaultFiltersJson: "{}",
      ownerUserName: "Finance Admin",
      versionNo: 1,
      status: "Active",
      isActive: true
    };
    const reportOutput = {
      id: 9300,
      companyId: 1,
      branchId: 10,
      reportRunId: 9400,
      fileName: "FINANCE-GL-JOURNAL-REGISTER-9400.csv",
      outputFormat: "CSV",
      contentType: "text/csv",
      storagePath: "reporting/generated/FINANCE-GL-JOURNAL-REGISTER-9400.csv",
      checksum: "abc123",
      sizeBytes: 42,
      status: "Completed",
      generatedOn: "2026-05-18T10:00:00Z",
      downloadCount: 0,
      lastDownloadedOn: null,
      lastDownloadedByUserId: null
    };
    vi.spyOn(apiClient.reporting, "definitions").mockResolvedValue(paged([reportDefinition]) as never);
    vi.spyOn(apiClient.reporting, "runs").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.reporting, "outputs").mockResolvedValue(paged([reportOutput]) as never);
    const runReport = vi.spyOn(apiClient.reporting, "runReport").mockResolvedValue({
      id: 9400,
      companyId: 1,
      branchId: 10,
      reportDefinitionId: 9200,
      runNo: "RUN-9400",
      parametersJson: "{}",
      outputFormat: "CSV",
      status: "Completed",
      rowCount: 2,
      failureReason: null,
      startedOn: "2026-05-18T10:00:00Z",
      completedOn: "2026-05-18T10:00:01Z",
      generatedByUserId: 1,
      sourceReportVersion: 1,
      sourceEntityType: null,
      sourceEntityId: null,
      definition: reportDefinition,
      columns: ["Journal", "Status"],
      rows: [],
      outputs: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/reports/catalog" element={<ReportCatalogPage />} />
      </Routes>,
      { route: "/reports/catalog", session: buildLiveSession() }
    );

    expect(await screen.findByText("GL journal register")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Run report" }));
    await waitFor(() => expect(runReport).toHaveBeenCalledWith(9200, expect.objectContaining({ outputFormat: "CSV" })));
    expect(await screen.findByText("FINANCE-GL-JOURNAL-REGISTER-9400.csv")).toBeInTheDocument();
  });

  it("persists dashboard builder layout and loads widget data from reporting APIs", async () => {
    const dashboard = {
      id: 9500,
      companyId: 1,
      branchId: 10,
      dashboardCode: "EXECUTIVE-OVERVIEW",
      dashboardName: "Executive Overview",
      module: "Executive",
      description: "Live dashboard.",
      visibilityRole: "ManagementViewer",
      ownerUserId: 1,
      status: "Active",
      widgets: [
        {
          id: 9501,
          dashboardDefinitionId: 9500,
          widgetCode: "FINANCE",
          title: "Finance ledger",
          widgetType: "Table",
          reportDefinitionId: 9200,
          datasetSource: "finance.gl-journal-register",
          filtersJson: "{}",
          drilldownRoute: "/finance/gl-journals",
          drilldownFilterJson: "{}",
          layoutX: 0,
          layoutY: 0,
          layoutW: 2,
          layoutH: 1,
          refreshMinutes: 15,
          status: "Active"
        }
      ]
    };
    vi.spyOn(apiClient.reporting, "dashboards").mockResolvedValue(paged([dashboard]) as never);
    vi.spyOn(apiClient.reporting, "dashboardData").mockResolvedValue({
      dashboard,
      widgets: [
        {
          widget: dashboard.widgets[0],
          columns: ["Journal", "Status"],
          rows: [{ values: { Journal: "GL-2026-0001", Status: "Posted" } }],
          loadedOn: "2026-05-18T10:00:00Z",
          disabledReason: null
        }
      ]
    } as never);
    const saveDashboard = vi.spyOn(apiClient.reporting, "saveDashboard").mockResolvedValue(dashboard as never);

    renderWithApp(
      <Routes>
        <Route path="/reports/saved-views" element={<SavedViewsPage />} />
      </Routes>,
      { route: "/reports/saved-views", session: buildLiveSession() }
    );

    expect(await screen.findByText("Executive Overview")).toBeInTheDocument();
    expect(await screen.findByText("Finance ledger")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Save dashboard" }));
    await waitFor(() => expect(saveDashboard).toHaveBeenCalledWith(expect.objectContaining({ dashboardCode: "OPS-DASHBOARD" })));
  });
});
