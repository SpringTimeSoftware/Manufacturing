import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
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
    expect(await screen.findByText("Sales order detail")).toBeInTheDocument();
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
