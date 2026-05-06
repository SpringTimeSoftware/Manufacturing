import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LoginPage } from "./LoginPage";
import { OrderDeliveryDashboardPage, StageWiseDashboardPage } from "./DashboardPages";
import { ItemListPage } from "./ItemMasterPages";
import { BomLibraryPage, JobCardsPage, MachineBoardPage, WorkOrdersPage } from "./OperationsPages";
import { BoqRequirementsPage } from "./PlanningPages";
import { FinalInspectionPage, InProcessInspectionPage, NcrDeviationPage } from "./QualityPages";
import { renderWithApp } from "../test/render";

describe("P144 critical web flow regression baseline", () => {
  it("covers the anonymous login flow shell without bypassing auth context", async () => {
    const { container } = renderWithApp(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { route: "/login", session: null, status: "anonymous" }
    );

    expect(await screen.findByText("Sign in to STS Manufacturing ERP")).toBeInTheDocument();
    expect(await screen.findByLabelText("User name")).toHaveValue("");
    expect(screen.queryByText("Open guarded demo session")).not.toBeInTheDocument();

    const pageText = container.textContent ?? "";
    [
      /P0\d/i,
      /React/i,
      /TypeScript/i,
      /reference UI/i,
      /guarded demo/i,
      /backend reachable/i,
      /fallback/i,
      /adapter/i,
      /mock/i,
      /source status/i
    ].forEach((pattern) => expect(pageText).not.toMatch(pattern));
  });

  it("covers item editor, BOM library, and BOQ planning drawer flows", async () => {
    renderWithApp(
      <Routes>
        <Route path="/masters/items" element={<ItemListPage />} />
      </Routes>,
      { route: "/masters/items" }
    );

    expect(await screen.findByText("Item List")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "RM-PLATE-001 item master" }));
    expect(await screen.findByText("Item detail editor")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/engineering/boms" element={<BomLibraryPage />} />
      </Routes>,
      { route: "/engineering/boms" }
    );

    expect(await screen.findByText("BOM Library")).toBeInTheDocument();
    expect((await screen.findAllByText("OZ-50 Tank Assembly")).length).toBeGreaterThan(0);

    renderWithApp(
      <Routes>
        <Route path="/planning/boq-requirements" element={<BoqRequirementsPage />} />
      </Routes>,
      { route: "/planning/boq-requirements" }
    );

    expect(await screen.findByText("BOQ / Requirements")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "SO-2026-0189 boq requirement" }));
    expect(await screen.findByText("Action override controls")).toBeInTheDocument();
  });

  it("covers work order, job card, machine board, dashboards, and QC flows", async () => {
    renderWithApp(
      <Routes>
        <Route path="/production/work-orders" element={<WorkOrdersPage />} />
      </Routes>,
      { route: "/production/work-orders" }
    );

    expect(await screen.findByText("Work Orders")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "WO-2026-044 work order" }));
    expect(await screen.findByText("Material readiness")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/production/job-cards" element={<JobCardsPage />} />
      </Routes>,
      { route: "/production/job-cards" }
    );

    expect(await screen.findByText("Job Cards")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "JC-90441 job card" }));
    expect(await screen.findByText("Execution timeline")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/production/machine-board" element={<MachineBoardPage />} />
      </Routes>,
      { route: "/production/machine-board" }
    );

    expect(await screen.findByText("Machine Schedule Board")).toBeInTheDocument();
    expect(await screen.findByText("JC-90441 / Cutting and forming")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/dashboards/stage-wise" element={<StageWiseDashboardPage />} />
        <Route path="/dashboards/order-delivery" element={<OrderDeliveryDashboardPage />} />
      </Routes>,
      { route: "/dashboards/stage-wise" }
    );

    expect(await screen.findByText("Stage Wise Dashboard")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/quality/in-process-inspections" element={<InProcessInspectionPage />} />
        <Route path="/quality/final-inspections" element={<FinalInspectionPage />} />
        <Route path="/quality/ncr" element={<NcrDeviationPage />} />
      </Routes>,
      { route: "/quality/in-process-inspections" }
    );

    expect(await screen.findByText("In-Process Inspection")).toBeInTheDocument();
    expect(await screen.findByText("INSP-IP-2026-0014")).toBeInTheDocument();
  });
});
