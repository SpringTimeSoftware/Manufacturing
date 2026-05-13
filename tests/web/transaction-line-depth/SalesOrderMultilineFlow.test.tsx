import { fireEvent, screen, within } from "@testing-library/react";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { buildDemoSession } from "../../../src/web/src/auth/AuthContext";
import { renderWithApp } from "../../../src/web/src/test/render";
import { SalesOrderListPage } from "../../../src/web/src/pages/CommercialPlanningPages";

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-sales-order-quality-gate-token",
    refreshToken: "live-sales-order-quality-gate-refresh"
  };
}

describe("QUALITY-GATES-01 sales order multiline flow", () => {
  it("requires sales order drafting to open a multiline workspace or be disabled with a reason", async () => {
    renderWithApp(
      <Routes>
        <Route path="/sales/orders" element={<SalesOrderListPage />} />
      </Routes>,
      { route: "/sales/orders", session: buildLiveSession() }
    );

    const newOrder = await screen.findByRole("button", { name: /New order draft/i });
    if (newOrder.hasAttribute("disabled")) {
      expect(newOrder).toHaveAttribute("title");
      expect(newOrder.getAttribute("title")).toMatch(/requires|pending|not enabled|workflow/i);
      return;
    }

    fireEvent.click(newOrder);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("button", { name: /Add Line/i })).toBeEnabled();
    fireEvent.click(within(dialog).getByRole("button", { name: /Add Line/i }));
    expect(within(dialog).getAllByLabelText(/Item/i).length).toBeGreaterThanOrEqual(2);
    expect(within(dialog).getAllByLabelText(/UOM/i).length).toBeGreaterThanOrEqual(2);
    expect(within(dialog).getAllByLabelText(/Quantity/i).length).toBeGreaterThanOrEqual(2);
    expect(within(dialog).getAllByRole("button", { name: /Remove Line/i }).length).toBeGreaterThanOrEqual(2);
    expect(within(dialog).getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });
});
