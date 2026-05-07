import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  OrderDeliveryDashboardPage,
  StageWiseDashboardPage
} from "./DashboardPages";
import {
  DispatchPlanningPage,
  PackListPage,
  ShipmentDeliveryPage
} from "./DispatchPages";
import { PrintPackPage } from "./PrintPackPage";
import {
  MachineStatusPage,
  ProductionReceiptPage,
  ReworkOrderPage,
  ScrapByProductPage
} from "./ProductionOutputPages";
import {
  FinalInspectionPage,
  IncomingInspectionPage,
  InProcessInspectionPage,
  NcrDeviationPage,
  QcPlanSetupPage
} from "./QualityPages";
import { renderWithApp } from "../test/render";

describe("Prompt P116-P123 execution surfaces", () => {
  it("renders P116 production receipt and scrap/by-product pages", async () => {
    renderWithApp(
      <Routes>
        <Route path="/production/receipts" element={<ProductionReceiptPage />} />
      </Routes>,
      { route: "/production/receipts" }
    );

    expect(await screen.findByText("Production Receipt")).toBeInTheDocument();
    expect(await screen.findByText("PRD-RCPT-2026-0062")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/production/scrap-by-products" element={<ScrapByProductPage />} />
      </Routes>,
      { route: "/production/scrap-by-products" }
    );

    expect(await screen.findByText("Scrap / By-product Entry")).toBeInTheDocument();
    expect(await screen.findByText("SCRAP-2026-0012")).toBeInTheDocument();
  });

  it("renders P117 rework order and machine status pages", async () => {
    renderWithApp(
      <Routes>
        <Route path="/production/rework-orders" element={<ReworkOrderPage />} />
      </Routes>,
      { route: "/production/rework-orders" }
    );

    expect(await screen.findByText("Rework Order")).toBeInTheDocument();
    expect(await screen.findByText("RW-2026-0009")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/production/machine-status" element={<MachineStatusPage />} />
      </Routes>,
      { route: "/production/machine-status" }
    );

    expect(await screen.findByText("Machine Status / OEE-lite")).toBeInTheDocument();
    expect(await screen.findByText("MC-01 Laser Cutter")).toBeInTheDocument();
  });

  it("renders P118 QC plan and incoming inspection pages", async () => {
    renderWithApp(
      <Routes>
        <Route path="/quality/plans" element={<QcPlanSetupPage />} />
      </Routes>,
      { route: "/quality/plans" }
    );

    expect(await screen.findByText("QC Plan Setup")).toBeInTheDocument();
    expect(await screen.findByText("QC-IN-SS-SHEET")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/quality/incoming-inspections" element={<IncomingInspectionPage />} />
      </Routes>,
      { route: "/quality/incoming-inspections" }
    );

    expect(await screen.findByText("Incoming Inspection")).toBeInTheDocument();
    expect(await screen.findByText("INSP-IN-2026-0008")).toBeInTheDocument();
  });

  it("renders P119 in-process, final inspection, and NCR pages", async () => {
    renderWithApp(
      <Routes>
        <Route path="/quality/in-process-inspections" element={<InProcessInspectionPage />} />
      </Routes>,
      { route: "/quality/in-process-inspections" }
    );

    expect(await screen.findByText("In-Process Inspection")).toBeInTheDocument();
    expect(await screen.findByText("INSP-IP-2026-0014")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/quality/final-inspections" element={<FinalInspectionPage />} />
      </Routes>,
      { route: "/quality/final-inspections" }
    );

    expect(await screen.findByText("Final Inspection")).toBeInTheDocument();
    expect(await screen.findByText("INSP-FIN-2026-0019")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/quality/ncr" element={<NcrDeviationPage />} />
      </Routes>,
      { route: "/quality/ncr" }
    );

    expect(await screen.findByText("NCR / Deviation")).toBeInTheDocument();
    expect(await screen.findByText("NCR-2026-0018")).toBeInTheDocument();
  });

  it("renders P120 dispatch pages with modal detail workspaces", async () => {
    renderWithApp(
      <Routes>
        <Route path="/dispatch/pack-lists" element={<PackListPage />} />
      </Routes>,
      { route: "/dispatch/pack-lists" }
    );

    expect(await screen.findByText("Pack List")).toBeInTheDocument();
    expect(await screen.findByText("PACK-2026-0042")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "PACK-2026-0042 pack list" }));
    expect(await screen.findByTestId("erp-modal-workspace")).toBeInTheDocument();
    expect(await screen.findByText("Pack lines")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/dispatch/planning" element={<DispatchPlanningPage />} />
      </Routes>,
      { route: "/dispatch/planning" }
    );

    expect(await screen.findByText("Dispatch Planning")).toBeInTheDocument();
    expect(await screen.findByText("SO-2026-0189")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/dispatch/shipments" element={<ShipmentDeliveryPage />} />
      </Routes>,
      { route: "/dispatch/shipments" }
    );

    expect(await screen.findByText("Shipment / Delivery")).toBeInTheDocument();
    expect(await screen.findByText("SHIP-2026-0029")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "SHIP-2026-0029 shipment" }));
    expect(await screen.findByText("Shipment lines")).toBeInTheDocument();
  });

  it("preserves P121 dashboard and print pack surfaces", async () => {
    renderWithApp(
      <Routes>
        <Route path="/dashboards/stage-wise" element={<StageWiseDashboardPage />} />
      </Routes>,
      { route: "/dashboards/stage-wise" }
    );

    expect(await screen.findByText("Stage Wise Dashboard")).toBeInTheDocument();
    expect((await screen.findAllByText("SO-2026-0191")).length).toBeGreaterThan(0);

    renderWithApp(
      <Routes>
        <Route path="/dashboards/order-delivery" element={<OrderDeliveryDashboardPage />} />
      </Routes>,
      { route: "/dashboards/order-delivery" }
    );

    expect(await screen.findByText("Order Delivery Dashboard")).toBeInTheDocument();
    expect((await screen.findAllByText("SO-2026-0189")).length).toBeGreaterThan(0);

    renderWithApp(
      <Routes>
        <Route path="/reports/print-pack" element={<PrintPackPage />} />
      </Routes>,
      { route: "/reports/print-pack" }
    );

    expect(await screen.findByText("Print Pack / Traveler / Labels")).toBeInTheDocument();
    expect(await screen.findByText("Dispatch carton label")).toBeInTheDocument();
  });
});
