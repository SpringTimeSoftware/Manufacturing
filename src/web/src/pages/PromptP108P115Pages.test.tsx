import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  CycleCountPage,
  DowntimeRegisterPage,
  JobCardsPage,
  MachineBoardPage,
  OccupancyCalendarPage,
  ShiftProductionEntryPage,
  WorkOrdersPage
} from "./OperationsPages";
import { renderWithApp } from "../test/render";

describe("Prompt P108-P115 production and inventory execution pages", () => {
  it("renders P108 cycle count with variance drawer", async () => {
    renderWithApp(
      <Routes>
        <Route path="/inventory/cycle-counts" element={<CycleCountPage />} />
      </Routes>,
      { route: "/inventory/cycle-counts" }
    );

    expect(await screen.findByText("Cycle Count")).toBeInTheDocument();
    expect(await screen.findByText("CC-2026-0031")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "CC-2026-0031 cycle count" }));
    expect(await screen.findByText("Count lines")).toBeInTheDocument();
  });

  it("renders P109-P110 work order list and detail drawer", async () => {
    renderWithApp(
      <Routes>
        <Route path="/production/work-orders" element={<WorkOrdersPage />} />
      </Routes>,
      { route: "/production/work-orders" }
    );

    expect(await screen.findByText("Work Orders")).toBeInTheDocument();
    expect(await screen.findByText("WO-2026-044")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "WO-2026-044 work order" }));
    expect(await screen.findByText("Material readiness")).toBeInTheDocument();
    expect(await screen.findByText("Operation readiness")).toBeInTheDocument();
  });

  it("renders P111-P112 job card list and timeline drawer", async () => {
    renderWithApp(
      <Routes>
        <Route path="/production/job-cards" element={<JobCardsPage />} />
      </Routes>,
      { route: "/production/job-cards" }
    );

    expect(await screen.findByText("Job Cards")).toBeInTheDocument();
    expect(await screen.findByText("JC-90441")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "JC-90441 job card" }));
    expect(await screen.findByText("Execution timeline")).toBeInTheDocument();
    expect(await screen.findByText("Downtime events")).toBeInTheDocument();
  });

  it("renders P113 machine schedule board", async () => {
    renderWithApp(
      <Routes>
        <Route path="/production/machine-board" element={<MachineBoardPage />} />
      </Routes>,
      { route: "/production/machine-board" }
    );

    expect(await screen.findByText("Machine Schedule Board")).toBeInTheDocument();
    expect(await screen.findByText("MC-01 Laser Cutter")).toBeInTheDocument();
    expect(await screen.findByText("JC-90441 / Cutting and forming")).toBeInTheDocument();
  });

  it("renders P114 PPS machine occupancy calendar", async () => {
    renderWithApp(
      <Routes>
        <Route path="/production/occupancy" element={<OccupancyCalendarPage />} />
      </Routes>,
      { route: "/production/occupancy" }
    );

    expect(await screen.findByText("PPS Machine Occupancy Calendar")).toBeInTheDocument();
    expect(await screen.findByText("Occupancy calendar")).toBeInTheDocument();
    expect(await screen.findAllByText("JC-90441")).toHaveLength(1);
  });

  it("renders P115 shift production entry and downtime register", async () => {
    renderWithApp(
      <Routes>
        <Route path="/production/shift-production" element={<ShiftProductionEntryPage />} />
      </Routes>,
      { route: "/production/shift-production" }
    );

    expect(await screen.findByText("Shift Production Entry")).toBeInTheDocument();
    expect(await screen.findByText("WO-2026-044 / JC-90441")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/production/downtime" element={<DowntimeRegisterPage />} />
      </Routes>,
      { route: "/production/downtime" }
    );

    expect(await screen.findByText("Downtime Register")).toBeInTheDocument();
    expect(await screen.findByText("POWER_FLUCTUATION")).toBeInTheDocument();
  });
});
