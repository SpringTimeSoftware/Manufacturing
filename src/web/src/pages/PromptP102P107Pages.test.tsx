import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  InventoryBalancePage,
  MaterialIssuePage,
  MaterialReturnPage,
  StockTransferPutawayPage,
  TraceabilityPage
} from "./InventoryPages";
import { CapacityPlanningBoardPage } from "./PlanningContinuationPages";
import { PurchaseOrderPage, PurchaseRequisitionPage, SubcontractPlanPage } from "./ProcurementPages";
import { renderWithApp } from "../test/render";

describe("Prompt P102-P107 planning, procurement, and inventory pages", () => {
  it("renders P102 capacity planning board with lane and bucket detail", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/capacity" element={<CapacityPlanningBoardPage />} />
      </Routes>,
      { route: "/planning/capacity" }
    );

    expect(await screen.findByText("Capacity Planning Board")).toBeInTheDocument();
    expect(await screen.findByText("CNC Cell A")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "CNC Cell A 2026-03-04 capacity bucket" }));
    expect(await screen.findByText("Capacity review controls")).toBeInTheDocument();
  });

  it("renders P103 purchase requisition list/detail and opens controls", async () => {
    renderWithApp(
      <Routes>
        <Route path="/procurement/requisitions" element={<PurchaseRequisitionPage />} />
      </Routes>,
      { route: "/procurement/requisitions" }
    );

    expect(await screen.findByText("Purchase Requisition List / Detail")).toBeInTheDocument();
    expect(await screen.findByText("PR-2026-0031")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "PR-2026-0031 purchase requisition" }));
    expect(await screen.findByText("Purchase requisition controls")).toBeInTheDocument();
  });

  it("renders P104 purchase order and subcontract planning screens", async () => {
    renderWithApp(
      <Routes>
        <Route path="/procurement/purchase-orders" element={<PurchaseOrderPage />} />
      </Routes>,
      { route: "/procurement/purchase-orders" }
    );

    expect(await screen.findByText("Purchase Order List / Detail")).toBeInTheDocument();
    expect(await screen.findByText("PO-2026-0114")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/procurement/subcontract-plan" element={<SubcontractPlanPage />} />
      </Routes>,
      { route: "/procurement/subcontract-plan" }
    );

    expect(await screen.findByText("Subcontract / Outside Processing Plan")).toBeInTheDocument();
    expect((await screen.findAllByText("SUB-OUT-2026-0008")).length).toBeGreaterThan(0);
  });

  it("renders P105 inventory balance and traceability screens", async () => {
    renderWithApp(
      <Routes>
        <Route path="/inventory/balances" element={<InventoryBalancePage />} />
      </Routes>,
      { route: "/inventory/balances" }
    );

    expect(await screen.findByText("Inventory Balance by Warehouse / Bin")).toBeInTheDocument();
    expect(await screen.findByText("RM-SS-SHEET / Stainless Steel Sheet")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/inventory/traceability" element={<TraceabilityPage />} />
      </Routes>,
      { route: "/inventory/traceability" }
    );

    expect(await screen.findByText("Lot / Serial / Catch Weight Traceability")).toBeInTheDocument();
    expect(await screen.findByText("LOT-SS-2026-03A")).toBeInTheDocument();
  });

  it("renders P106 material issue and opens issue controls", async () => {
    renderWithApp(
      <Routes>
        <Route path="/inventory/material-issue" element={<MaterialIssuePage />} />
      </Routes>,
      { route: "/inventory/material-issue" }
    );

    expect(await screen.findByText("Material Issue to WO")).toBeInTheDocument();
    expect(await screen.findByText("ISS-WO-2026-044")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "ISS-WO-2026-044 material issue" }));
    expect(await screen.findByText("Material issue controls")).toBeInTheDocument();
  });

  it("renders P107 material return and stock transfer/putaway screens", async () => {
    renderWithApp(
      <Routes>
        <Route path="/inventory/material-return" element={<MaterialReturnPage />} />
      </Routes>,
      { route: "/inventory/material-return" }
    );

    expect(await screen.findByText("Material Return from WO")).toBeInTheDocument();
    expect(await screen.findByText("RET-WO-2026-044")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/inventory/stock-transfer" element={<StockTransferPutawayPage />} />
      </Routes>,
      { route: "/inventory/stock-transfer" }
    );

    expect(await screen.findByText("Stock Transfer / Putaway")).toBeInTheDocument();
    expect(await screen.findByText("TRF-2026-0095")).toBeInTheDocument();
  });
});
