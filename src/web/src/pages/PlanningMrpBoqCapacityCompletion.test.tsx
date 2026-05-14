import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { DemandForecastPage, MpsPlannerPage } from "./CommercialPlanningPages";
import { PlanningWorkspacePage } from "./PlanningCompletionPages";

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-planning-token",
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

describe("Planning / MPS / MRP / BOQ / Capacity completion pack", () => {
  it("renders the planning workspace with snapshot, planned-order, pegging, shortage, and document evidence", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/workspace" element={<PlanningWorkspacePage />} />
      </Routes>,
      { route: "/planning/workspace" }
    );

    expect(await screen.findByText("Planning Workspace")).toBeInTheDocument();
    expect(screen.getByTestId("planning-workspace-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByTestId("planning-planned-order-grid")).toHaveAttribute("data-line-entry-pattern", "compact-grid");
    expect(screen.getByTestId("planning-snapshot-grid")).toHaveAttribute("data-line-entry-pattern", "compact-grid");
    expect(screen.getByTestId("planning-pegging-grid")).toHaveAttribute("data-line-entry-pattern", "compact-grid");
    expect(screen.getByText("Planning documents / evidence")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Create Plan" }));
    expect(await screen.findByText("Plan definition controls")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save plan" })).toBeDisabled();
    expect(screen.getByText(/Live planning sign-in is required before saving planning plans/i)).toBeInTheDocument();
  });

  it("opens a planned-order conversion preview and gates unsupported target documents with reasons", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/workspace" element={<PlanningWorkspacePage />} />
      </Routes>,
      { route: "/planning/workspace" }
    );

    expect(await screen.findByText("Planning Workspace")).toBeInTheDocument();
    const conversionButtons = await screen.findAllByRole("button", { name: "Preview conversion" });
    fireEvent.click(conversionButtons[0]);

    expect(await screen.findByText("Planned order conversion preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Convert to PR" })).toBeDisabled();
    expect(screen.getAllByText(/Live planning sign-in is required/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Convert to WO" })).toBeDisabled();
  });

  it("keeps demand forecast line entry as a compact editable grid with truthful import gating", async () => {
    vi.spyOn(apiClient.salesPlanning, "forecasts").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([
      { id: 101, itemCode: "FG-100", itemName: "Pump Housing", itemType: "FG", status: "Active" }
    ] as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([
      { id: 1, uomCode: "EA", uomName: "Each", symbol: "EA", uomClassId: 1, decimalPrecision: 0, isSystemBase: true, status: "Active" }
    ]) as never);

    renderWithApp(
      <Routes>
        <Route path="/sales/forecasts" element={<DemandForecastPage />} />
      </Routes>,
      { route: "/sales/forecasts", session: buildLiveSession() }
    );

    expect(await screen.findByText("Demand Forecast")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import forecast" })).toBeDisabled();
    expect(screen.getByText(/Forecast import requires the approved import workflow/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "New forecast" }));
    expect(await screen.findByTestId("forecast-line-grid")).toHaveAttribute("data-line-entry-pattern", "compact-grid");
  });

  it("saves an MPS draft with multiple governed schedule lines instead of first-line-only payloads", async () => {
    vi.spyOn(apiClient.salesPlanning, "mps").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([
      { id: 101, itemCode: "FG-100", itemName: "Pump Housing", itemType: "FG", status: "Active" },
      { id: 102, itemCode: "FG-200", itemName: "Valve Kit", itemType: "FG", status: "Active" }
    ] as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([
      { id: 1, uomCode: "EA", uomName: "Each", symbol: "EA", uomClassId: 1, decimalPrecision: 0, isSystemBase: true, status: "Active" }
    ]) as never);
    const createMps = vi.spyOn(apiClient.salesPlanning, "createMps").mockResolvedValue({
      id: 900,
      companyId: 1,
      branchId: 10,
      mpsCode: "MPS-DRAFT-SAVED",
      planningHorizonStart: "2026-05-13",
      planningHorizonEnd: "2026-06-12",
      status: "Draft",
      lines: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/planning/mps" element={<MpsPlannerPage />} />
      </Routes>,
      { route: "/planning/mps", session: buildLiveSession() }
    );

    expect(await screen.findByText("MPS Planner")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New MPS draft" }));
    const grid = await screen.findByTestId("mps-line-grid");
    fireEvent.click(within(grid).getByRole("button", { name: "Add schedule line" }));
    fireEvent.click(within(grid).getByRole("button", { name: "Add schedule line" }));

    const itemFields = screen.getAllByLabelText("Item");
    const uomFields = screen.getAllByLabelText("Planning UOM");
    const qtyFields = screen.getAllByLabelText("Planned quantity");
    itemFields.forEach((field, index) => fireEvent.change(field, { target: { value: index === 1 ? "102" : "101" } }));
    uomFields.forEach((field) => fireEvent.change(field, { target: { value: "1" } }));
    qtyFields.forEach((field, index) => fireEvent.change(field, { target: { value: String(index + 2) } }));

    fireEvent.click(screen.getAllByRole("button", { name: "Remove Line" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Save MPS draft" }));

    await waitFor(() => expect(createMps).toHaveBeenCalledTimes(1));
    expect(createMps.mock.calls[0][0].lines).toHaveLength(2);
    expect(createMps.mock.calls[0][0].lines.map((line) => line.itemId)).toEqual([101, 101]);
  });
});
