import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { MpsPlannerPage } from "./CommercialPlanningPages";

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

describe("WS04 engineering and planning completion", () => {
  it("opens and saves a live MPS draft through governed line controls", async () => {
    vi.spyOn(apiClient.salesPlanning, "mps").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([
      { id: 101, itemCode: "FG-100", itemName: "Pump Housing", itemType: "FG", status: "Active" }
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
      lines: [
        {
          id: 901,
          lineNo: 10,
          itemId: 101,
          periodStart: "2026-05-13",
          periodEnd: "2026-06-12",
          plannedQuantity: 1,
          planningUomId: 1
        }
      ]
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/planning/mps" element={<MpsPlannerPage />} />
      </Routes>,
      { route: "/planning/mps", session: buildLiveSession() }
    );

    expect(await screen.findByText("MPS Planner")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New MPS draft" }));
    expect(await screen.findByText("MPS setup")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Item"), { target: { value: "101" } });
    fireEvent.change(screen.getByLabelText("Planning UOM"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Save MPS draft" }));

    await waitFor(() => expect(createMps).toHaveBeenCalledTimes(1));
    const request = createMps.mock.calls[0][0];
    expect(request.lines[0]).toMatchObject({ itemId: 101, planningUomId: 1, plannedQuantity: 1 });
  });
});
