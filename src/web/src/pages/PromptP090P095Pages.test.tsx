import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import {
  AttachmentViewerPage,
  AvailableToPromisePage,
  BlanketOrderContractPage,
  DemandForecastPage,
  MpsPlannerPage,
  QuoteEstimateListPage,
  SalesOrderListPage,
  SupplierLeadTimeMatrixPage
} from "./CommercialPlanningPages";
import { BomLibraryPage } from "./EngineeringPages";
import { renderWithApp } from "../test/render";

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-sales-planning-token",
    refreshToken: "live-sales-planning-refresh"
  };
}

function paged<TItem>(items: TItem[]) {
  return {
    items,
    page: 1,
    pageSize: Math.max(items.length, 1),
    totalCount: items.length,
    totalPages: 1
  };
}

const customer = {
  id: 201,
  companyId: 1,
  customerCode: "CUST-ALPHA",
  customerName: "Alpha Components",
  customerType: "OEM",
  defaultBranchId: 10,
  defaultCurrencyCode: "INR",
  defaultPaymentTermsCode: "NET30",
  creditLimit: 500000,
  status: "Active"
};

const item = {
  id: 101,
  itemCode: "FG-OZ-50",
  itemName: "Ozone tank",
  itemType: "FinishedGood",
  status: "Active"
};

const uom = {
  id: 1,
  uomCode: "EA",
  uomName: "Each",
  symbol: "EA",
  uomClassId: 1,
  decimalPrecision: 0,
  isSystemBase: true,
  status: "Active"
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Prompt P090-P095 commercial and engineering pages", () => {
  it("renders P090 supplier lead-time matrix and opens a matrix row", async () => {
    renderWithApp(
      <Routes>
        <Route path="/partners/supplier-lead-times" element={<SupplierLeadTimeMatrixPage />} />
      </Routes>,
      { route: "/partners/supplier-lead-times" }
    );

    expect(await screen.findByText("Supplier Lead Time Matrix")).toBeInTheDocument();
    expect(await screen.findByText("RM-PLATE-001")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "RM-PLATE-001 supplier lead-time matrix" }));
    expect(await screen.findByText("Lead-time setup")).toBeInTheDocument();
  });

  it("renders P090 attachment viewer as an explicit deferred surface", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/attachments" element={<AttachmentViewerPage />} />
      </Routes>,
      { route: "/platform/attachments" }
    );

    expect(await screen.findByText("Attachment / Document Viewer")).toBeInTheDocument();
    expect((await screen.findAllByText("oz50-tank-assembly-r3.pdf")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Readiness view").length).toBeGreaterThan(0);
  });

  it("renders P091 quote list and centered detail workspace", async () => {
    renderWithApp(
      <Routes>
        <Route path="/sales/quotes" element={<QuoteEstimateListPage />} />
      </Routes>,
      { route: "/sales/quotes" }
    );

    expect(await screen.findByText("Estimate / Quote List")).toBeInTheDocument();
    expect(await screen.findByText("QT-2026-0042")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "QT-2026-0042 quote" }));
    expect(await screen.findByText("Quote detail")).toBeInTheDocument();
  });

  it("renders P092 sales order list and centered detail workspace", async () => {
    renderWithApp(
      <Routes>
        <Route path="/sales/orders" element={<SalesOrderListPage />} />
      </Routes>,
      { route: "/sales/orders" }
    );

    expect(await screen.findByText("Sales Order List")).toBeInTheDocument();
    expect(await screen.findByText("SO-2026-0189")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "SO-2026-0189 sales order" }));
    expect(await screen.findByTestId("sales-order-draft-modal")).toBeInTheDocument();
    expect(await screen.findByText("Sales order header")).toBeInTheDocument();
  });

  it("renders P093 blanket order and demand forecast screens", async () => {
    renderWithApp(
      <Routes>
        <Route path="/sales/blanket-orders" element={<BlanketOrderContractPage />} />
      </Routes>,
      { route: "/sales/blanket-orders" }
    );

    expect(await screen.findByText("Blanket Order / Contract")).toBeInTheDocument();
    expect(await screen.findByText("BLK-ENKAY-2026")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "BLK-ENKAY-2026 blanket order" }));
    expect(await screen.findByText("Blanket order setup")).toBeInTheDocument();
  });

  it("creates live blanket-order schedule lines through governed controls", async () => {
    vi.spyOn(apiClient.salesPlanning, "blanketOrders").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.partners, "customers").mockResolvedValue(paged([customer]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([item] as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([uom]) as never);
    const createBlanketOrder = vi.spyOn(apiClient.salesPlanning, "createBlanketOrder").mockResolvedValue({
      id: 501,
      companyId: 1,
      branchId: 10,
      blanketOrderNo: "BLK-DRAFT-SAVED",
      customerId: 201,
      startDate: "2026-05-14",
      endDate: "2026-08-12",
      status: "Draft",
      schedules: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/sales/blanket-orders" element={<BlanketOrderContractPage />} />
      </Routes>,
      { route: "/sales/blanket-orders", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New blanket draft" }));
    expect(await screen.findByText("Blanket order controls")).toBeInTheDocument();

    await screen.findByRole("option", { name: "CUST-ALPHA / Alpha Components" });
    fireEvent.change(screen.getByLabelText("Customer"), { target: { value: "201" } });
    fireEvent.change(screen.getByLabelText("Item"), { target: { value: "101" } });
    fireEvent.change(screen.getByLabelText("Order UOM"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "24" } });
    fireEvent.click(screen.getByRole("button", { name: "Save blanket draft" }));

    await waitFor(() => expect(createBlanketOrder).toHaveBeenCalledTimes(1));
    expect(createBlanketOrder.mock.calls[0][0]).toMatchObject({
      customerId: 201,
      schedules: [expect.objectContaining({ itemId: 101, orderUomId: 1, quantity: 24 })]
    });
  });

  it("renders P093 demand forecast screen", async () => {
    renderWithApp(
      <Routes>
        <Route path="/sales/forecasts" element={<DemandForecastPage />} />
      </Routes>,
      { route: "/sales/forecasts" }
    );

    expect(await screen.findByText("Demand Forecast")).toBeInTheDocument();
    expect(await screen.findByText("FCST-2026-M03")).toBeInTheDocument();
  });

  it("creates live demand forecast lines through governed controls", async () => {
    vi.spyOn(apiClient.salesPlanning, "forecasts").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([item] as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([uom]) as never);
    const createForecast = vi.spyOn(apiClient.salesPlanning, "createForecast").mockResolvedValue({
      id: 601,
      companyId: 1,
      branchId: 10,
      forecastCode: "FC-DRAFT-SAVED",
      forecastName: "Demand forecast",
      periodType: "Monthly",
      status: "Draft",
      lines: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/sales/forecasts" element={<DemandForecastPage />} />
      </Routes>,
      { route: "/sales/forecasts", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New forecast" }));
    expect(await screen.findByText("Forecast controls")).toBeInTheDocument();

    await screen.findByRole("option", { name: "FG-OZ-50 / Ozone tank" });
    fireEvent.change(screen.getByLabelText("Item"), { target: { value: "101" } });
    fireEvent.change(screen.getByLabelText("Forecast UOM"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "42" } });
    fireEvent.click(screen.getByRole("button", { name: "Save forecast" }));

    await waitFor(() => expect(createForecast).toHaveBeenCalledTimes(1));
    expect(createForecast.mock.calls[0][0].lines[0]).toMatchObject({
      itemId: 101,
      forecastUomId: 1,
      quantity: 42
    });
  });

  it("renders P094 MPS planner and ATP deferred promise screen", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/mps" element={<MpsPlannerPage />} />
      </Routes>,
      { route: "/planning/mps" }
    );

    expect(await screen.findByText("MPS Planner")).toBeInTheDocument();
    expect(await screen.findByText("MPS-2026-M03")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "MPS-2026-M03 mps" }));
    expect(await screen.findByText("MPS setup")).toBeInTheDocument();
  });

  it("renders P094 available-to-promise deferred screen", async () => {
    renderWithApp(
      <Routes>
        <Route path="/sales/available-to-promise" element={<AvailableToPromisePage />} />
      </Routes>,
      { route: "/sales/available-to-promise" }
    );

    expect(await screen.findByText("Available to Promise / Order Promise")).toBeInTheDocument();
    expect(await screen.findByText("SO-2026-0189")).toBeInTheDocument();
    expect(screen.getAllByText("Readiness view").length).toBeGreaterThan(0);
  });

  it("runs live ATP what-if and commits the promised date to the sales order", async () => {
    const salesOrder = {
      id: 701,
      companyId: 1,
      branchId: 10,
      salesOrderNo: "SO-LIVE-1",
      customerId: 201,
      billToAddressId: null,
      shipToAddressId: null,
      orderDate: "2026-05-14",
      promisedDate: "2026-05-20",
      priorityCode: "High",
      status: "Released",
      sourceQuoteId: null,
      lines: [
        {
          id: 70110,
          lineNo: 10,
          itemId: 101,
          itemVariantId: null,
          orderUomId: 1,
          quantity: 5,
          makeType: "Make",
          promisedDate: "2026-05-20",
          priorityCode: "High",
          customerSpecRef: null,
          requestedShipDate: "2026-05-20",
          status: "Released"
        }
      ]
    };
    vi.spyOn(apiClient.salesPlanning, "salesOrders").mockResolvedValue(paged([salesOrder]) as never);
    vi.spyOn(apiClient.inventory, "balances").mockResolvedValue(paged([
      {
        id: 81,
        companyId: 1,
        branchId: 10,
        itemId: 101,
        itemVariantId: null,
        warehouseId: 301,
        binId: null,
        lotId: null,
        serialId: null,
        onHandQty: 8,
        reservedQty: 1,
        qcHoldQty: 0,
        blockedQty: 0,
        inTransitQty: 0,
        catchWeightQty: null
      }
    ]) as never);
    const updateSalesOrder = vi.spyOn(apiClient.salesPlanning, "updateSalesOrder").mockResolvedValue({
      ...salesOrder,
      promisedDate: "2026-05-20"
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/sales/available-to-promise" element={<AvailableToPromisePage />} />
      </Routes>,
      { route: "/sales/available-to-promise", session: buildLiveSession() }
    );

    expect(await screen.findByText("SO-LIVE-1 / line 10")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Run what-if" }));
    expect(await screen.findByText("What-if controls")).toBeInTheDocument();
    expect(screen.getAllByText("Available 7 against required 5.").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Commit promise" }));

    await waitFor(() => expect(updateSalesOrder).toHaveBeenCalledTimes(1));
    expect(updateSalesOrder.mock.calls[0][1]).toMatchObject({
      promisedDate: "2026-05-20",
      lines: [expect.objectContaining({ itemId: 101, promisedDate: "2026-05-20" })]
    });
  });

  it("renders P095 BOM library and opens the metadata workspace", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/boms" element={<BomLibraryPage />} />
      </Routes>,
      { route: "/engineering/boms" }
    );

    expect((await screen.findAllByText("BOM Library")).length).toBeGreaterThan(0);
    expect(await screen.findByText("OZ-50 Tank Assembly")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "FG-OZ-50 bom" }));
    expect(await screen.findByText("BOM metadata editor")).toBeInTheDocument();
  });
});
