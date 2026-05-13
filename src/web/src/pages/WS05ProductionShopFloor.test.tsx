import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { JobCardsPage } from "./OperationsPages";

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

describe("WS05 production shop-floor execution", () => {
  it("opens a job card from a deep link and posts a live completion action", async () => {
    const summary = {
      id: 501,
      companyId: 1,
      branchId: 10,
      jobCardNo: "JC-LIVE-501",
      workOrderId: 401,
      workOrderNo: "WO-LIVE-401",
      workOrderOperationId: 301,
      operationId: 201,
      splitSequenceNo: null,
      assignedMachineId: 11,
      assignedOperatorUserId: 22,
      shiftId: 1,
      plannedQuantity: 5,
      completedGoodQty: 5,
      completedRejectQty: 0,
      completedScrapQty: 0,
      status: "Started"
    };

    vi.spyOn(apiClient.production, "jobCards").mockResolvedValue(paged([summary]) as never);
    vi.spyOn(apiClient.production, "jobCard").mockResolvedValue({
      ...summary,
      parentJobCardId: null,
      events: [],
      downtimes: []
    } as never);
    const completeJobCard = vi.spyOn(apiClient.production, "completeJobCard").mockResolvedValue({
      id: "501",
      referenceNo: "JC-LIVE-501",
      status: "Completed",
      warnings: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/production/job-cards" element={<JobCardsPage />} />
      </Routes>,
      { route: "/production/job-cards?jobCard=JC-LIVE-501", session: buildLiveSession() }
    );

    expect(await screen.findByText("Job Cards")).toBeInTheDocument();
    expect(await screen.findByText("Execution posting controls")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Complete" }));

    await waitFor(() => expect(completeJobCard).toHaveBeenCalledWith(501, { remarks: null }));
    expect(await screen.findByText(/Current status: Completed/)).toBeInTheDocument();
  });
});
