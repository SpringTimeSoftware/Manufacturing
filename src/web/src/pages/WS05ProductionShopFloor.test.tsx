import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { JobCardsPage, WorkOrdersPage } from "./OperationsPages";

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
  it("opens a live work-order draft and saves it through the production API", async () => {
    vi.spyOn(apiClient.production, "workOrders").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([
      { id: 100, itemCode: "FG-100", itemName: "Finished item", itemType: "FG", status: "Active" }
    ] as never);
    vi.spyOn(apiClient.engineering, "boms").mockResolvedValue(paged([
      {
        id: 10,
        companyId: 1,
        itemId: 100,
        bomCode: "BOM-FG-100",
        bomName: "FG 100 BOM",
        currentReleasedRevisionId: 21,
        status: "Active",
        revisions: [
          {
            id: 21,
            revisionCode: "R1",
            effectiveFrom: null,
            effectiveTo: null,
            approvalStatus: "Released",
            routingId: 31,
            changeSummary: null,
            isPhantomParentAllowed: false,
            lines: [],
            operations: []
          }
        ]
      }
    ]) as never);
    vi.spyOn(apiClient.engineering, "routings").mockResolvedValue(paged([
      { id: 31, companyId: 1, routingCode: "RT-100", routingName: "FG route", outputItemId: 100, revisionCode: "R1", status: "Released", operations: [] }
    ]) as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([
      { id: 1, uomCode: "EA", uomName: "Each", symbol: "EA", uomClassId: 1, decimalPrecision: 0, isSystemBase: true, status: "Active" }
    ]) as never);
    const createWorkOrder = vi.spyOn(apiClient.production, "createWorkOrder").mockResolvedValue({
      id: 401,
      companyId: 1,
      branchId: 10,
      workOrderNo: "WO-LIVE-401",
      salesOrderLineId: null,
      itemId: 100,
      bomRevisionId: 21,
      routingId: 31,
      plannedQuantity: 1,
      productionUomId: 1,
      plannedStartDate: "2026-05-14",
      plannedEndDate: null,
      status: "PendingRelease",
      remarks: null,
      releasedOn: null,
      closedOn: null,
      cancelledOn: null,
      operations: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/production/work-orders" element={<WorkOrdersPage />} />
      </Routes>,
      { route: "/production/work-orders", session: buildLiveSession() }
    );

    const newWorkOrder = await screen.findByRole("button", { name: "New work order" });
    await waitFor(() => expect(newWorkOrder).not.toBeDisabled());
    fireEvent.click(newWorkOrder);
    expect(await screen.findByText("Work-order planning controls")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save work order" }));

    await waitFor(() => expect(createWorkOrder).toHaveBeenCalledWith(expect.objectContaining({
      companyId: 1,
      branchId: 10,
      itemId: 100,
      bomRevisionId: 21,
      routingId: 31,
      productionUomId: 1,
      plannedQuantity: 1,
      status: "PendingRelease"
    })));
  });

  it("runs work-order release and job-card generation through live APIs", async () => {
    const summary = {
      id: 401,
      companyId: 1,
      branchId: 10,
      workOrderNo: "WO-LIVE-401",
      salesOrderLineId: null,
      itemId: 100,
      bomRevisionId: 21,
      routingId: 31,
      plannedQuantity: 5,
      productionUomId: 1,
      plannedStartDate: "2026-05-14",
      plannedEndDate: "2026-05-16",
      status: "PendingRelease",
      releasedOn: null,
      operationCount: 1,
      completedOperationCount: 0
    };
    const detail = {
      ...summary,
      remarks: null,
      closedOn: null,
      cancelledOn: null,
      operations: [
        { id: 901, sequenceNo: 10, operationId: 77, routingOperationId: 31, workCenterId: 5, plannedQuantity: 5, completedQuantity: 0, requiresQcCheckpoint: false, status: "Ready" }
      ]
    };

    const releasedDetail = {
      ...detail,
      status: "Released",
      releasedOn: "2026-05-14T10:00:00Z"
    };
    const readiness = {
      workOrderId: 401,
      workOrderNo: "WO-LIVE-401",
      status: "PendingRelease",
      canRelease: true,
      engineeringReady: true,
      materialReady: true,
      capacityReady: true,
      workflowReady: true,
      blockingReasons: [],
      materialReadiness: [],
      operationReadiness: [
        { sequenceNo: 10, operationId: 77, routingOperationId: 31, workCenterId: 5, status: "Ready", capacityReady: true, capacityMessage: null }
      ]
    };

    vi.spyOn(apiClient.production, "workOrders").mockResolvedValue(paged([summary]) as never);
    vi.spyOn(apiClient.production, "workOrder").mockResolvedValueOnce(detail as never).mockResolvedValue(releasedDetail as never);
    vi.spyOn(apiClient.production, "workOrderReadiness").mockResolvedValueOnce(readiness as never).mockResolvedValue({ ...readiness, status: "Released" } as never);
    const releaseWorkOrder = vi.spyOn(apiClient.production, "releaseWorkOrder").mockResolvedValue({
      id: "401",
      referenceNo: "WO-LIVE-401",
      status: "Released",
      warnings: []
    } as never);
    const createJobCards = vi.spyOn(apiClient.production, "createJobCardsForWorkOrder").mockResolvedValue([
      {
        id: 701,
        companyId: 1,
        branchId: 10,
        jobCardNo: "WO-LIVE-401-010-S01",
        workOrderId: 401,
        workOrderNo: "WO-LIVE-401",
        workOrderOperationId: 901,
        operationId: 77,
        parentJobCardId: null,
        splitSequenceNo: 1,
        assignedMachineId: null,
        assignedOperatorUserId: null,
        shiftId: null,
        plannedQuantity: 5,
        completedGoodQty: 0,
        completedRejectQty: 0,
        completedScrapQty: 0,
        status: "Created",
        events: [],
        downtimes: []
      }
    ] as never);

    renderWithApp(
      <Routes>
        <Route path="/production/work-orders" element={<WorkOrdersPage />} />
      </Routes>,
      { route: "/production/work-orders", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByText("WO-LIVE-401"));
    fireEvent.click(await screen.findByRole("button", { name: "Release work order" }));

    await waitFor(() => expect(releaseWorkOrder).toHaveBeenCalledWith(401, { remarks: "Released from production work-order workspace." }));
    await screen.findByText(/Status: Released/);

    fireEvent.click(await screen.findByRole("button", { name: "Generate job cards" }));

    await waitFor(() => expect(createJobCards).toHaveBeenCalledWith({ workOrderId: 401, regenerateIfExists: false }));
  });

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
