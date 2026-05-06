import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import {
  BranchMasterPage,
  BinMasterPage,
  CompanyMasterPage,
  DepartmentMasterPage,
  ShiftCalendarPage,
  WarehouseMasterPage
} from "./OrganizationPages";

describe("OrganizationPages", () => {
  it("renders company master and opens legal entity detail", async () => {
    renderWithApp(
      <Routes>
        <Route path="/organization/companies" element={<CompanyMasterPage />} />
      </Routes>,
      { route: "/organization/companies" }
    );

    expect(await screen.findByText("Company Master")).toBeInTheDocument();
    expect(await screen.findByText("STS Precision Fabricators")).toBeInTheDocument();
    expect(screen.getByTestId("company-master-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByTestId("company-master-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("company-master-grid")).toHaveClass("erp-grid");

    fireEvent.click(screen.getByRole("row", { name: "STS company master" }));

    expect(await screen.findByText("Company setup")).toBeInTheDocument();
  });

  it("renders branch master with default warehouse context", async () => {
    renderWithApp(
      <Routes>
        <Route path="/organization/branches" element={<BranchMasterPage />} />
      </Routes>,
      { route: "/organization/branches" }
    );

    expect(await screen.findByText("Branch Master")).toBeInTheDocument();
    expect(await screen.findByText("Main Fabrication Plant")).toBeInTheDocument();
    expect(screen.getByText("RM-MAIN")).toBeInTheDocument();
  });

  it("renders department master and opens ownership detail", async () => {
    renderWithApp(
      <Routes>
        <Route path="/organization/departments" element={<DepartmentMasterPage />} />
      </Routes>,
      { route: "/organization/departments" }
    );

    expect(await screen.findByText("Department Master")).toBeInTheDocument();
    expect(await screen.findByText("Quality Control")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("row", { name: "QC department master" }));

    expect(await screen.findByText("Department setup")).toBeInTheDocument();
  });

  it("renders warehouse master with dispatch and WIP store context", async () => {
    renderWithApp(
      <Routes>
        <Route path="/organization/warehouses" element={<WarehouseMasterPage />} />
      </Routes>,
      { route: "/organization/warehouses" }
    );

    expect(await screen.findByText("Warehouse Master")).toBeInTheDocument();
    expect(await screen.findByText("Raw Material Main Store")).toBeInTheDocument();
    expect(screen.getByText("FG-DISPATCH")).toBeInTheDocument();
  });

  it("renders bin master with quarantine bin status", async () => {
    renderWithApp(
      <Routes>
        <Route path="/organization/bins" element={<BinMasterPage />} />
      </Routes>,
      { route: "/organization/bins" }
    );

    expect(await screen.findByText("Bin Master")).toBeInTheDocument();
    expect(await screen.findByText("QC Hold Cage")).toBeInTheDocument();
    expect(screen.getByText("QC_HOLD")).toBeInTheDocument();
  });

  it("renders shift calendar with cross-midnight shift detail", async () => {
    renderWithApp(
      <Routes>
        <Route path="/organization/shifts" element={<ShiftCalendarPage />} />
      </Routes>,
      { route: "/organization/shifts" }
    );

    expect(await screen.findByText("Shift Calendar")).toBeInTheDocument();
    expect(await screen.findByText("Evening Shift")).toBeInTheDocument();
    expect(screen.getAllByText("Cross-midnight").length).toBeGreaterThan(0);
  });
});
