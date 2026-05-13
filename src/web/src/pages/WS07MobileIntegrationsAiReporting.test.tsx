import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { navigationItems } from "../layout/navigation";
import { renderWithApp } from "../test/render";
import {
  AiAssistantPage,
  ExportJobsPage,
  ImportJobsPage,
  IntegrationProviderAdminPage,
  ReportCatalogPage,
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

  it("keeps AI draft-only and queues report exports through governed actions", async () => {
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
    vi.spyOn(apiClient.ai, "runs").mockResolvedValue(paged([]) as never);
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

    cleanup();
    vi.restoreAllMocks();
    const createExport = vi.spyOn(apiClient.integrations, "createExport").mockResolvedValue({ id: 9201 } as never);

    renderWithApp(
      <Routes>
        <Route path="/reports/catalog" element={<ReportCatalogPage />} />
      </Routes>,
      { route: "/reports/catalog", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Queue report export" }));
    await waitFor(() => expect(createExport).toHaveBeenCalledWith(expect.objectContaining({ module: "report.production", outputFormat: "PDF" })));
    expect(screen.getByLabelText("Minimum risk %")).toHaveAttribute("type", "number");
  });
});
