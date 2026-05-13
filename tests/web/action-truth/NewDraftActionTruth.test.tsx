import { fireEvent, screen, within } from "@testing-library/react";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { QuoteEstimateListPage, SalesOrderListPage } from "../../../src/web/src/pages/CommercialPlanningPages";
import { PurchaseOrderPage } from "../../../src/web/src/pages/ProcurementPages";
import { ItemListPage } from "../../../src/web/src/pages/ItemMasterPages";
import { renderWithApp } from "../../../src/web/src/test/render";

function expectActionTruth(button: HTMLElement) {
  if (button.hasAttribute("disabled")) {
    expect(button.getAttribute("title") ?? button.closest(".erp-action-bar__action")?.textContent ?? "").toMatch(
      /requires|pending|not enabled|workflow|sign-in|validation|available/i
    );
  } else {
    expect(button).toBeEnabled();
  }
}

describe("QUALITY-GATES-01 New and New Draft action truth", () => {
  it("keeps high-risk New/New Draft actions working or disabled with a reason", async () => {
    renderWithApp(
      <Routes>
        <Route path="/sales/quotes" element={<QuoteEstimateListPage />} />
      </Routes>,
      { route: "/sales/quotes" }
    );

    const quoteDraft = await screen.findByRole("button", { name: /New quote draft/i });
    expectActionTruth(quoteDraft);
    fireEvent.click(quoteDraft);
    expect(await screen.findByRole("dialog", { name: /New quote draft/i })).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/sales/orders" element={<SalesOrderListPage />} />
      </Routes>,
      { route: "/sales/orders" }
    );
    expectActionTruth(await screen.findByRole("button", { name: /New order draft/i }));

    renderWithApp(
      <Routes>
        <Route path="/procurement/purchase-orders" element={<PurchaseOrderPage />} />
      </Routes>,
      { route: "/procurement/purchase-orders" }
    );
    const poDraft = await screen.findByRole("button", { name: /New PO draft/i });
    expectActionTruth(poDraft);
    fireEvent.click(poDraft);
    expect(await screen.findByText("Purchase order follow-up")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/masters/items" element={<ItemListPage />} />
      </Routes>,
      { route: "/masters/items" }
    );
    const itemDraft = await screen.findByRole("button", { name: /New item draft/i });
    expectActionTruth(itemDraft);
    fireEvent.click(itemDraft);
    const itemDialog = await screen.findByRole("dialog", { name: /Draft Item/i });
    expect(within(itemDialog).getByRole("button", { name: /Save Draft/i })).toBeDisabled();
    expect(within(itemDialog).getAllByText(/save this record/i).length).toBeGreaterThan(0);
  });
});
