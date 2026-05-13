import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { ShipmentDeliveryPage } from "./DispatchPages";
import { CycleCountPage } from "./OperationsPages";
import { InProcessInspectionPage, NcrDeviationPage } from "./QualityPages";

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

const cycleCount = {
  id: 701,
  companyId: 1,
  branchId: 12,
  warehouseId: 201,
  countNo: "CC-LIVE-0001",
  countDate: "2026-05-13",
  countType: "Cycle",
  status: "Draft",
  remarks: "Rack A count",
  postedOn: null,
  lines: [
    {
      id: 702,
      lineNo: 10,
      itemId: 10002,
      itemVariantId: null,
      binId: 2001,
      lotId: 70001,
      serialId: null,
      systemQuantity: 25,
      countedQuantity: 24,
      varianceQuantity: -1,
      status: "Variance",
      remarks: "One short"
    }
  ]
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WS06 inventory, quality, dispatch, and documents", () => {
  it("saves and posts a live cycle-count sheet through governed controls", async () => {
    vi.spyOn(apiClient.inventory, "cycleCounts").mockResolvedValue(paged([cycleCount]) as never);
    const updateCycleCount = vi.spyOn(apiClient.inventory, "updateCycleCount").mockResolvedValue(cycleCount as never);
    const postCycleCount = vi.spyOn(apiClient.inventory, "postCycleCount").mockResolvedValue({
      ...cycleCount,
      status: "Posted",
      postedOn: "2026-05-13T09:30:00Z"
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/inventory/cycle-counts" element={<CycleCountPage />} />
      </Routes>,
      { route: "/inventory/cycle-counts", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByText("CC-LIVE-0001"));
    expect(await screen.findByText("Count sheet controls")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save count sheet" }));
    await waitFor(() => expect(updateCycleCount).toHaveBeenCalledWith(701, expect.objectContaining({ countNo: "CC-LIVE-0001" })));

    fireEvent.click(screen.getByRole("button", { name: "Post count" }));
    await waitFor(() => expect(postCycleCount).toHaveBeenCalledWith(701));
  });

  it("posts live inspection release and NCR close decisions without dead quality actions", async () => {
    vi.spyOn(apiClient.quality, "inspections").mockResolvedValue(paged([
      {
        id: 801,
        companyId: 1,
        branchId: 12,
        inspectionNo: "INSP-LIVE-0001",
        inspectionPlanId: 7101,
        inspectionType: "InProcess",
        sourceDocumentType: "JobCard",
        sourceDocumentId: 501,
        lotId: 70001,
        serialId: null,
        status: "Hold",
        overallResult: "Fail",
        requestToken: null,
        notes: "Dimensional failure",
        heldOn: "2026-05-13T08:00:00Z",
        releasedOn: null,
        results: []
      }
    ]) as never);
    const releaseInspection = vi.spyOn(apiClient.quality, "releaseInspection").mockResolvedValue({ status: "Released" } as never);

    renderWithApp(
      <Routes>
        <Route path="/quality/in-process-inspections" element={<InProcessInspectionPage />} />
      </Routes>,
      { route: "/quality/in-process-inspections", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByText("INSP-LIVE-0001"));
    fireEvent.click(await screen.findByRole("button", { name: "Release hold" }));
    await waitFor(() => expect(releaseInspection).toHaveBeenCalledWith(801, { notes: null }));

    vi.restoreAllMocks();
    vi.spyOn(apiClient.quality, "nonConformances").mockResolvedValue(paged([
      {
        id: 901,
        companyId: 1,
        branchId: 12,
        ncrNo: "NCR-LIVE-0001",
        sourceDocumentType: "Inspection",
        sourceDocumentId: 801,
        lotId: 70001,
        serialId: null,
        disposition: "Rework",
        status: "Open",
        rootCause: "Seal leak",
        reworkOrderId: null,
        remarks: "Disposition approved"
      }
    ]) as never);
    const closeNonConformance = vi.spyOn(apiClient.quality, "closeNonConformance").mockResolvedValue({ status: "Closed" } as never);

    renderWithApp(
      <Routes>
        <Route path="/quality/ncr" element={<NcrDeviationPage />} />
      </Routes>,
      { route: "/quality/ncr", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByText("NCR-LIVE-0001"));
    fireEvent.click(await screen.findByRole("button", { name: "Close NCR" }));
    await waitFor(() => expect(closeNonConformance).toHaveBeenCalledWith(901, { remarks: null }));
  });

  it("saves live shipment proof status and keeps proof upload tied to shipment documents", async () => {
    vi.spyOn(apiClient.dispatch, "shipments").mockResolvedValue(paged([
      {
        id: 1001,
        companyId: 1,
        branchId: 12,
        shipmentNo: "SHP-LIVE-0001",
        packListId: 95001,
        customerId: 3001,
        dispatchDate: "2026-05-13",
        vehicleRef: "GJ-01-AB-2244",
        trackingRef: "LR-77391",
        sealNo: "SEAL-5531",
        proofNotes: "Loading proof pending",
        status: "Loading",
        loadedOn: null,
        deliveredOn: null,
        lines: [
          {
            id: 1002,
            lineNo: 10,
            packListLineId: 95002,
            salesOrderLineId: 80002,
            itemId: 10002,
            itemVariantId: null,
            warehouseId: 201,
            binId: 2001,
            lotId: 70001,
            serialId: null,
            shippedQuantity: 20,
            shipUomId: 1,
            status: "Loaded"
          }
        ],
        stockTransactions: []
      }
    ]) as never);
    const updateShipmentProof = vi.spyOn(apiClient.dispatch, "updateShipmentProof").mockResolvedValue({} as never);

    renderWithApp(
      <Routes>
        <Route path="/dispatch/shipments" element={<ShipmentDeliveryPage />} />
      </Routes>,
      { route: "/dispatch/shipments?shipment=SHP-LIVE-0001", session: buildLiveSession() }
    );

    expect(await screen.findByText("Shipment controls")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Tracking / LR"), { target: { value: "LR-UPDATED-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Save proof status" }));

    await waitFor(() => expect(updateShipmentProof).toHaveBeenCalledWith(1001, expect.objectContaining({ trackingRef: "LR-UPDATED-1", status: "Loading" })));
    expect(screen.getByLabelText("Load proof")).toBeInTheDocument();
  });
});
