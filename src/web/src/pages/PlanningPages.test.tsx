import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { MrpRunConsolePage } from "./PlanningPages";

describe("PlanningPages ERP governance", () => {
  it("renders MRP run console with governed action, filter, and grid patterns", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/mrp-runs" element={<MrpRunConsolePage />} />
      </Routes>,
      { route: "/planning/mrp-runs" }
    );

    expect(await screen.findByText("MRP Run Console")).toBeInTheDocument();
    expect(screen.getByTestId("mrp-run-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByTestId("mrp-run-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("mrp-run-grid")).toHaveClass("erp-grid");
    expect(screen.getByRole("button", { name: "Run MRP draft" })).toBeDisabled();
  });
});
