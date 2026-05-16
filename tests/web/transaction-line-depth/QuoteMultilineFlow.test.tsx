import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../src/web/src/api/http";
import { buildDemoSession } from "../../../src/web/src/auth/AuthContext";
import { renderWithApp } from "../../../src/web/src/test/render";
import { QuoteEstimateListPage } from "../../../src/web/src/pages/CommercialPlanningPages";

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-quality-gate-token",
    refreshToken: "live-quality-gate-refresh"
  };
}

function paged<TItem>(items: TItem[]) {
  return {
    items,
    page: 1,
    pageSize: Math.max(items.length, 1),
    totalCount: items.length,
    totalPages: items.length > 0 ? 1 : 0
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QUALITY-GATES-01 quote multiline flow", () => {
  it("requires quote drafts to support multiple editable lines before saving", async () => {
    vi.spyOn(apiClient.salesPlanning, "quotes").mockResolvedValue(paged([]));
    vi.spyOn(apiClient.partners, "customers").mockResolvedValue(paged([
      {
        id: 501,
        companyId: 1,
        customerCode: "CUST-501",
        customerName: "Live Customer",
        shortName: null,
        customerType: "Industrial",
        defaultBranchId: 10,
        defaultLanguageId: null,
        taxRegistrationNo: null,
        paymentTermsCode: null,
        creditDays: 30,
        status: "Active"
      }
    ]));
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([
      { id: 301, itemCode: "FG-301", itemName: "Finished Item", itemType: "FinishedGood", status: "Active" },
      { id: 302, itemCode: "FG-302", itemName: "Second Item", itemType: "FinishedGood", status: "Active" }
    ]);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([
      { id: 41, uomCode: "PCS", uomName: "Pieces", symbol: "pcs", uomClassId: 4, decimalPrecision: 0, isSystemBase: false, status: "Active" }
    ]));
    vi.spyOn(apiClient.platform, "users").mockResolvedValue([]);
    vi.spyOn(apiClient.commercial, "priceLists").mockResolvedValue(paged([]));
    vi.spyOn(apiClient.commercial, "discountSchemes").mockResolvedValue(paged([]));
    vi.spyOn(apiClient.commercial, "taxCategories").mockResolvedValue(paged([]));
    vi.spyOn(apiClient.commercial, "currencies").mockResolvedValue(paged([]));
    vi.spyOn(apiClient.commercial, "exchangeRates").mockResolvedValue(paged([]));
    vi.spyOn(apiClient.commercial, "paymentTerms").mockResolvedValue(paged([]));
    vi.spyOn(apiClient.commercial, "tradeTerms").mockResolvedValue(paged([]));
    const createQuote = vi.spyOn(apiClient.salesPlanning, "createQuote").mockResolvedValue({
      id: 9001,
      companyId: 1,
      branchId: 10,
      quoteNo: "QT-DRAFT-TEST",
      customerId: 501,
      customerAddressId: null,
      quoteDate: "2026-05-13",
      expiryDate: "2026-06-13",
      priorityCode: "Medium",
      status: "Draft",
      customerSpecRef: "",
      lines: []
    });

    renderWithApp(
      <Routes>
        <Route path="/sales/quotes" element={<QuoteEstimateListPage />} />
      </Routes>,
      { route: "/sales/quotes", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: /New quote draft/i }));
    const dialog = await screen.findByRole("dialog", { name: /New quote draft/i });
    await waitFor(() => expect(within(dialog).getByLabelText("Customer")).not.toBeDisabled());

    fireEvent.change(within(dialog).getByLabelText("Customer"), { target: { value: "501" } });
    expect(within(dialog).getByRole("button", { name: /Add Line/i })).toBeEnabled();
    fireEvent.click(within(dialog).getByRole("button", { name: /Add Line/i }));

    const itemControls = within(dialog).getAllByLabelText("Item");
    const uomControls = within(dialog).getAllByLabelText("Order UOM");
    const quantityControls = within(dialog).getAllByLabelText("Quantity");
    const rateControls = within(dialog).getAllByLabelText("Unit price");
    const discountControls = within(dialog).getAllByLabelText("Discount %");
    const taxControls = within(dialog).getAllByLabelText("Tax %");

    expect(itemControls.length).toBeGreaterThanOrEqual(2);
    expect(uomControls.length).toBeGreaterThanOrEqual(2);
    expect(quantityControls.length).toBeGreaterThanOrEqual(2);
    expect(rateControls.length).toBeGreaterThanOrEqual(2);
    expect(discountControls.length).toBeGreaterThanOrEqual(2);
    expect(taxControls.length).toBeGreaterThanOrEqual(2);

    fireEvent.change(itemControls[0], { target: { value: "301" } });
    fireEvent.change(uomControls[0], { target: { value: "41" } });
    fireEvent.change(quantityControls[0], { target: { value: "2" } });
    fireEvent.change(rateControls[0], { target: { value: "25" } });
    fireEvent.change(discountControls[0], { target: { value: "5" } });
    fireEvent.change(taxControls[0], { target: { value: "18" } });
    fireEvent.change(itemControls[1], { target: { value: "302" } });
    fireEvent.change(uomControls[1], { target: { value: "41" } });
    fireEvent.change(quantityControls[1], { target: { value: "4" } });
    fireEvent.change(rateControls[1], { target: { value: "32.5" } });
    fireEvent.change(discountControls[1], { target: { value: "2" } });
    fireEvent.change(taxControls[1], { target: { value: "12" } });

    expect(within(dialog).getAllByRole("button", { name: /Remove Line/i }).length).toBeGreaterThanOrEqual(2);
    fireEvent.click(within(dialog).getAllByRole("button", { name: /Remove Line/i })[0]);
    fireEvent.click(within(dialog).getByRole("button", { name: /Save quote draft/i }));

    await waitFor(() => expect(createQuote).toHaveBeenCalledTimes(1));
    expect(createQuote.mock.calls[0][0].lines).toHaveLength(1);
    expect(createQuote.mock.calls[0][0].lines[0]).toMatchObject({
      itemId: 302,
      orderUomId: 41,
      quantity: 4,
      unitPrice: 32.5,
      discountPercent: 2,
      taxPercent: 12
    });
  });
});
