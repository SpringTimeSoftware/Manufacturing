import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { RuntimeUatPage } from "./RuntimeUatPage";

function paged<T>(items: T[]) {
  return {
    items,
    page: 1,
    pageSize: 10,
    totalCount: items.length,
    totalPages: 1
  };
}

function mockRuntimeProbeApis() {
  vi.spyOn(apiClient.system, "healthLive").mockResolvedValue({ entries: {}, status: "Healthy" });
  vi.spyOn(apiClient.system, "healthReady").mockResolvedValue({
    entries: {
      sql: { description: "SQL Server ready.", durationMs: 2, status: "Healthy" }
    },
    status: "Healthy"
  });
  vi.spyOn(apiClient.system, "context").mockResolvedValue({
    branchId: 10,
    companyId: 1,
    departmentIds: [12],
    teamUserIds: [],
    userId: 1,
    userName: "planning.manager",
    visibilityMode: "Company",
    warehouseIds: [101]
  });
  vi.spyOn(apiClient.notifications, "list").mockResolvedValue([]);
  vi.spyOn(apiClient.approvals, "list").mockResolvedValue([]);
  vi.spyOn(apiClient.dashboards, "orderDelivery").mockResolvedValue([]);
  vi.spyOn(apiClient.dashboards, "stageWise").mockResolvedValue([]);
  vi.spyOn(apiClient.planning, "mrpRuns").mockResolvedValue(paged([]) as never);
  vi.spyOn(apiClient.procurement, "purchaseOrders").mockResolvedValue(paged([]) as never);
  vi.spyOn(apiClient.inventory, "balances").mockResolvedValue(paged([]) as never);
  vi.spyOn(apiClient.inventory, "lotTraceability").mockResolvedValue({
    balances: [],
    catchWeightQty: null,
    companyId: 1,
    expiryOn: null,
    id: 70001,
    itemId: 10002,
    lotNo: "DEMO-LOT-001",
    lotStatus: "Available",
    manufacturedOn: "2026-05-12",
    transactions: [{}]
  } as never);
  vi.spyOn(apiClient.production, "jobCards").mockResolvedValue(paged([]) as never);
  vi.spyOn(apiClient.quality, "inspections").mockResolvedValue(paged([]) as never);
  vi.spyOn(apiClient.dispatch, "packLists").mockResolvedValue(paged([]) as never);
  vi.spyOn(apiClient.dispatch, "packListPrint").mockResolvedValue({
    packList: {
      lines: [{}],
      packListNo: "PK-UAT-0001"
    }
  } as never);
  vi.spyOn(apiClient.platform, "users").mockResolvedValue([]);
}

describe("RuntimeUatPage", () => {
  it("runs WS01 runtime checks with governed filters, truthful actions, and modal detail", async () => {
    mockRuntimeProbeApis();
    const createObjectUrl = vi.fn(() => "blob:ws01");
    const revokeObjectUrl = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const session = buildDemoSession();
    session.user.roles = ["SuperAdmin"] as typeof session.user.roles;

    renderWithApp(
      <Routes>
        <Route path="/platform/runtime-uat" element={<RuntimeUatPage />} />
        <Route path="/dashboards/order-delivery" element={<div>Order delivery target</div>} />
      </Routes>,
      {
        route: "/platform/runtime-uat",
        session
      }
    );

    expect(await screen.findByText("Runtime UAT")).toBeInTheDocument();
    expect(await screen.findByText("Ready health endpoint")).toBeInTheDocument();
    expect(screen.getByLabelText("Role focus").closest("label")).toHaveAttribute("data-control-type", "lookup");
    expect(screen.getByLabelText("Status").closest("label")).toHaveAttribute("data-control-type", "lookup");

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "PASS" } });
    expect(screen.getByText("Live health endpoint")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export evidence" }));
    expect(createObjectUrl).toHaveBeenCalled();

    fireEvent.click(screen.getByText("Order delivery dashboard").closest("tr") as HTMLTableRowElement);
    expect(await screen.findByRole("dialog", { name: "Order delivery dashboard" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open screen" }));
    expect(await screen.findByText("Order delivery target")).toBeInTheDocument();

    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/workspace data|adapter|fallback|mock|seeded|source status|React|TypeScript|prompt/i);
  });

  it("marks runtime API failure as FAIL instead of showing baseline operational rows", async () => {
    mockRuntimeProbeApis();
    vi.spyOn(apiClient.notifications, "list").mockRejectedValueOnce(new Error("notification service unavailable"));

    renderWithApp(
      <Routes>
        <Route path="/platform/runtime-uat" element={<RuntimeUatPage />} />
      </Routes>,
      {
        route: "/platform/runtime-uat"
      }
    );

    expect(await screen.findByText("Notification queue data truth")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("notification service unavailable")).toBeInTheDocument();
    });
    expect(screen.getAllByText("FAIL").length).toBeGreaterThan(0);
  });
});
