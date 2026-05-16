import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { PackListPage, ShipmentDeliveryPage } from "./DispatchPages";
import { InventoryBalancePage } from "./InventoryPages";
import { CycleCountPage } from "./OperationsPages";
import { CoaCertificatePage, InProcessInspectionPage, NcrDeviationPage, QcPlanSetupPage } from "./QualityPages";

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

const dispatchItem = {
  id: 10002,
  itemCode: "FG-OZ-50",
  itemName: "Ozone Generator 50 LPH",
  itemType: "FinishedGoods",
  status: "Active"
};

const dispatchUom = {
  id: 1,
  uomCode: "EA",
  uomName: "Each",
  symbol: "EA",
  uomClassId: 1,
  decimalPrecision: 0,
  isSystemBase: true,
  status: "Active"
};

const dispatchWarehouse = {
  id: 201,
  companyId: 1,
  branchId: 12,
  warehouseCode: "FG",
  warehouseName: "Finished Goods",
  warehouseType: "Stores",
  isDefaultReceivingWarehouse: false,
  isDefaultIssueWarehouse: true,
  isDispatchEnabled: true,
  allowsMixedLots: false,
  allowsNegativeStock: false,
  status: "Active"
};

const dispatchCustomer = {
  id: 3001,
  companyId: 1,
  branchId: 12,
  customerCode: "CUST-ACME",
  customerName: "ACME Hospital",
  customerType: "OEM",
  status: "Active"
};

const dispatchSalesOrder = {
  id: 8001,
  companyId: 1,
  branchId: 12,
  salesOrderNo: "SO-LIVE-0001",
  customerId: 3001,
  sourceQuoteId: null,
  orderDate: "2026-05-13",
  promisedDate: "2026-05-20",
  status: "Confirmed",
  lines: []
};

const savedPackList = {
  id: 95001,
  companyId: 1,
  branchId: 12,
  packListNo: "PACK-LIVE-0001",
  salesOrderId: 8001,
  plannedShipDate: "2026-05-13",
  status: "Packed",
  remarks: "Ready",
  lines: []
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WS06 inventory, quality, dispatch, and documents", () => {
  it("reserves live available stock from the inventory balance workspace", async () => {
    vi.spyOn(apiClient.inventory, "balances").mockResolvedValue(paged([
      {
        id: 501,
        companyId: 1,
        branchId: 12,
        itemId: 10002,
        itemVariantId: null,
        warehouseId: 201,
        binId: 2001,
        lotId: 70001,
        serialId: null,
        onHandQty: 20,
        reservedQty: 4,
        qcHoldQty: 0,
        blockedQty: 0,
        inTransitQty: 0,
        catchWeightQty: null
      }
    ]) as never);
    const reserveStock = vi.spyOn(apiClient.inventory, "reserveStock").mockResolvedValue({
      id: 601,
      companyId: 1,
      branchId: 12,
      itemId: 10002,
      itemVariantId: null,
      warehouseId: 201,
      binId: 2001,
      lotId: 70001,
      reservedQuantity: 5,
      sourceDocumentType: "SalesOrder",
      sourceDocumentId: 8001,
      status: "Reserved"
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/inventory/balances" element={<InventoryBalancePage />} />
      </Routes>,
      { route: "/inventory/balances", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("row", { name: "Item 10002 inventory balance" }));
    fireEvent.click(await screen.findByRole("button", { name: "Reserve stock" }));
    expect(await screen.findByText("Reservation controls")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Source document id"), { target: { value: "8001" } });
    fireEvent.change(screen.getByLabelText("Reserved quantity"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save reservation" }));

    await waitFor(() => expect(reserveStock).toHaveBeenCalledWith(expect.objectContaining({
      itemId: 10002,
      warehouseId: 201,
      binId: 2001,
      lotId: 70001,
      reservedQuantity: 5,
      sourceDocumentType: "SalesOrder",
      sourceDocumentId: 8001
    })));
  });

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
        defectCategory: "Functional",
        containmentAction: "Hold affected serial",
        rootCause: "Seal leak",
        correctiveAction: "Re-seat gasket",
        preventiveAction: "Update fixture checklist",
        dispositionReleasedOn: null,
        dispositionReleasedByUserId: null,
        closedOn: null,
        closedByUserId: null,
        reworkOrderId: null,
        remarks: "Disposition approved",
        lines: [
          {
            id: 902,
            lineNo: 10,
            itemId: 10002,
            itemRevisionId: null,
            lotId: 70001,
            serialId: null,
            affectedQuantity: 1,
            uomId: 1,
            defectCode: "LEAK",
            defectDescription: "Leak test failed",
            disposition: "Rework",
            remarks: "Retest required"
          }
        ]
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

  it("saves a live in-process inspection with parameter lines and optional NCR creation", async () => {
    vi.spyOn(apiClient.quality, "inspections").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.quality, "inspectionPlans").mockResolvedValue(paged([
      {
        id: 7101,
        companyId: 1,
        planCode: "QC-IP-DIM",
        planName: "In-process dimensional check",
        inspectionType: "InProcess",
        itemId: 10002,
        operationId: 401,
        autoHoldOnFail: true,
        autoCreateNcrOnFail: true,
        status: "Active",
        characteristics: [
          {
            id: 71011,
            lineNo: 10,
            parameterCode: "VISUAL",
            parameterName: "Visual check",
            characteristicType: "Attribute",
            expectedValue: "No defects",
            lowerLimit: null,
            upperLimit: null,
            uomId: null,
            sampleSize: 1,
            isMandatory: true,
            status: "Active",
            remarks: null
          }
        ]
      }
    ]) as never);
    const saveInspection = vi.spyOn(apiClient.quality, "saveInspection").mockResolvedValue({
      id: 802,
      companyId: 1,
      branchId: 12,
      inspectionNo: "INSP-IP-SAVED",
      inspectionPlanId: 7101,
      inspectionType: "InProcess",
      sourceDocumentType: "JobCard",
      sourceDocumentId: 501,
      lotId: null,
      serialId: null,
      status: "Held",
      overallResult: "Fail",
      requestToken: "quality-test",
      notes: "Dimensional fail",
      heldOn: "2026-05-13T08:00:00Z",
      releasedOn: null,
      results: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/quality/in-process-inspections" element={<InProcessInspectionPage />} />
      </Routes>,
      { route: "/quality/in-process-inspections", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New inspection" }));
    expect(await screen.findByText("Inspection controls")).toBeInTheDocument();
    await screen.findByRole("option", { name: "QC-IP-DIM / In-process dimensional check" });
    fireEvent.change(screen.getByLabelText("QC plan"), { target: { value: "7101" } });
    fireEvent.change(screen.getByLabelText("Source document id"), { target: { value: "501" } });
    fireEvent.change(screen.getByLabelText("Overall result"), { target: { value: "Fail" } });
    fireEvent.change(screen.getByLabelText("Actual value 1"), { target: { value: "Out of tolerance" } });
    fireEvent.change(screen.getByLabelText("Result status 1"), { target: { value: "Fail" } });
    fireEvent.click(screen.getByLabelText("Create NCR on failed or held result"));
    fireEvent.click(screen.getByRole("button", { name: "Save inspection" }));

    await waitFor(() => expect(saveInspection).toHaveBeenCalledWith(expect.objectContaining({
      inspectionPlanId: 7101,
      sourceDocumentId: 501,
      overallResult: "Fail",
      autoCreateNcr: true
    })));
    expect(saveInspection.mock.calls[0][0].results[0]).toMatchObject({ parameterCode: "VISUAL", actualValue: "Out of tolerance", resultStatus: "Fail" });
  });

  it("saves QC plan characteristic rows through the live plan API", async () => {
    vi.spyOn(apiClient.quality, "inspectionPlans").mockResolvedValue(paged([]) as never);
    const createInspectionPlan = vi.spyOn(apiClient.quality, "createInspectionPlan").mockResolvedValue({
      id: 7102,
      companyId: 1,
      planCode: "QC-IN-SAVED",
      planName: "Incoming saved plan",
      inspectionType: "Incoming",
      itemId: null,
      operationId: null,
      autoHoldOnFail: true,
      autoCreateNcrOnFail: true,
      status: "Active",
      characteristics: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/quality/plans" element={<QcPlanSetupPage />} />
      </Routes>,
      { route: "/quality/plans", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New QC plan" }));
    expect(await screen.findByText("Characteristic grid")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save QC plan" }));

    await waitFor(() => expect(createInspectionPlan).toHaveBeenCalledWith(expect.objectContaining({
      inspectionType: "Incoming",
      characteristics: [expect.objectContaining({ parameterCode: "VISUAL", parameterName: "Visual check" })]
    })));
  });

  it("releases NCR disposition through the live NCR API with affected line evidence", async () => {
    vi.spyOn(apiClient.quality, "nonConformances").mockResolvedValue(paged([
      {
        id: 901,
        companyId: 1,
        branchId: 12,
        ncrNo: "NCR-LIVE-0002",
        sourceDocumentType: "Inspection",
        sourceDocumentId: 801,
        lotId: 70001,
        serialId: null,
        disposition: "Rework",
        status: "Open",
        defectCategory: "Functional",
        containmentAction: "Hold affected serial",
        rootCause: "Seal leak",
        correctiveAction: "Re-seat gasket",
        preventiveAction: "Update fixture checklist",
        dispositionReleasedOn: null,
        dispositionReleasedByUserId: null,
        closedOn: null,
        closedByUserId: null,
        reworkOrderId: null,
        remarks: "Disposition approved",
        lines: [
          {
            id: 902,
            lineNo: 10,
            itemId: 10002,
            itemRevisionId: null,
            lotId: 70001,
            serialId: null,
            affectedQuantity: 1,
            uomId: 1,
            defectCode: "LEAK",
            defectDescription: "Leak test failed",
            disposition: "Rework",
            remarks: "Retest required"
          }
        ]
      }
    ]) as never);
    const releaseDisposition = vi.spyOn(apiClient.quality, "releaseNonConformanceDisposition").mockResolvedValue({ status: "DispositionReleased" } as never);

    renderWithApp(
      <Routes>
        <Route path="/quality/ncr" element={<NcrDeviationPage />} />
      </Routes>,
      { route: "/quality/ncr", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByText("NCR-LIVE-0002"));
    fireEvent.click(await screen.findByRole("button", { name: "Release disposition" }));

    await waitFor(() => expect(releaseDisposition).toHaveBeenCalledWith(901, expect.objectContaining({
      disposition: "Rework",
      rootCause: "Seal leak"
    })));
  });

  it("generates COA certificates from final inspection evidence through the live API", async () => {
    vi.spyOn(apiClient.quality, "coas").mockResolvedValue(paged([]) as never);
    const generateCoa = vi.spyOn(apiClient.quality, "generateCoa").mockResolvedValue({
      id: 7401,
      companyId: 1,
      branchId: 12,
      coaNo: "COA-SAVED",
      inspectionRecordId: 802,
      sourceDocumentType: "ProductionReceipt",
      sourceDocumentId: 501,
      lotId: null,
      serialId: null,
      templateCode: "COA-FINAL-STD",
      versionNo: 1,
      storagePath: "quality/coa/company-1/branch-12/COA-SAVED-v1.json",
      status: "Generated",
      generatedOn: "2026-05-13T09:30:00Z",
      generatedByUserId: 1,
      issuedOn: null,
      issuedByUserId: null,
      reissueReason: null,
      lines: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/quality/coas" element={<CoaCertificatePage />} />
      </Routes>,
      { route: "/quality/coas", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Generate COA" }));
    expect(await screen.findByText("COA generation")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Final inspection record id"), { target: { value: "802" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Generate COA" }).at(-1)!);

    await waitFor(() => expect(generateCoa).toHaveBeenCalledWith(expect.objectContaining({
      inspectionRecordId: 802,
      templateCode: "COA-FINAL-STD"
    })));
  });

  it("creates a live pack list with governed item, warehouse, UOM, and quantity controls", async () => {
    vi.spyOn(apiClient.dispatch, "packLists").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.salesPlanning, "salesOrders").mockResolvedValue(paged([dispatchSalesOrder]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([dispatchItem] as never);
    vi.spyOn(apiClient.organization, "warehouses").mockResolvedValue(paged([dispatchWarehouse]) as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([dispatchUom]) as never);
    const createPackList = vi.spyOn(apiClient.dispatch, "createPackList").mockResolvedValue(savedPackList as never);

    renderWithApp(
      <Routes>
        <Route path="/dispatch/pack-lists" element={<PackListPage />} />
      </Routes>,
      { route: "/dispatch/pack-lists", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Create pack list" }));
    expect(await screen.findByText("Pack-list controls")).toBeInTheDocument();
    await screen.findByRole("option", { name: "SO-LIVE-0001" });
    fireEvent.change(screen.getByLabelText("Sales order"), { target: { value: "8001" } });
    fireEvent.change(screen.getByLabelText("Item 1"), { target: { value: "10002" } });
    fireEvent.change(screen.getByLabelText("Warehouse 1"), { target: { value: "201" } });
    fireEvent.change(screen.getByLabelText("Pack UOM 1"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Packed quantity 1"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Save pack list" }));

    await waitFor(() => expect(createPackList).toHaveBeenCalledWith(expect.objectContaining({ salesOrderId: 8001 })));
    expect(createPackList.mock.calls[0][0].lines[0]).toMatchObject({ itemId: 10002, warehouseId: 201, packUomId: 1, packedQuantity: 3 });
  });

  it("prepares a live shipment that posts dispatch line issue context", async () => {
    vi.spyOn(apiClient.dispatch, "shipments").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.dispatch, "packLists").mockResolvedValue(paged([savedPackList]) as never);
    vi.spyOn(apiClient.partners, "customers").mockResolvedValue(paged([dispatchCustomer]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([dispatchItem] as never);
    vi.spyOn(apiClient.organization, "warehouses").mockResolvedValue(paged([dispatchWarehouse]) as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([dispatchUom]) as never);
    const createShipment = vi.spyOn(apiClient.dispatch, "createShipment").mockResolvedValue({
      id: 1001,
      companyId: 1,
      branchId: 12,
      shipmentNo: "SHP-SAVED",
      packListId: 95001,
      customerId: 3001,
      dispatchDate: "2026-05-13",
      vehicleRef: "GJ-01-AB-2244",
      trackingRef: "LR-77391",
      sealNo: "SEAL-5531",
      proofNotes: "Loaded",
      status: "Loading",
      loadedOn: null,
      deliveredOn: null,
      lines: [],
      stockTransactions: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/dispatch/shipments" element={<ShipmentDeliveryPage />} />
      </Routes>,
      { route: "/dispatch/shipments", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Prepare shipment" }));
    expect(await screen.findByText("Shipment controls")).toBeInTheDocument();
    await screen.findByRole("option", { name: "CUST-ACME / ACME Hospital" });
    fireEvent.change(screen.getByLabelText("Customer"), { target: { value: "3001" } });
    fireEvent.change(screen.getByLabelText("Pack list"), { target: { value: "95001" } });
    fireEvent.change(screen.getByLabelText("Item 1"), { target: { value: "10002" } });
    fireEvent.change(screen.getByLabelText("Warehouse 1"), { target: { value: "201" } });
    fireEvent.change(screen.getByLabelText("Ship UOM 1"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Shipped quantity 1"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Save shipment" }));

    await waitFor(() => expect(createShipment).toHaveBeenCalledWith(expect.objectContaining({ customerId: 3001, packListId: 95001 })));
    expect(createShipment.mock.calls[0][0].lines[0]).toMatchObject({ itemId: 10002, warehouseId: 201, shipUomId: 1, shippedQuantity: 2 });
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
    fireEvent.click(screen.getByRole("button", { name: "Close shipment" }));
    await waitFor(() => expect(updateShipmentProof).toHaveBeenCalledWith(1001, expect.objectContaining({ trackingRef: "LR-UPDATED-1", status: "Closed" })));
    expect(screen.getByLabelText("Load proof")).toBeInTheDocument();
  });
});
