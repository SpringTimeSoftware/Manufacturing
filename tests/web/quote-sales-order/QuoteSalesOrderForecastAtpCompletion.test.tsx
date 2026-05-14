import React from "react";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import type { AuthSessionResponse, QuoteDto, QuoteUpsertRequest } from "../../../src/web/src/api/contracts";
import { apiClient } from "../../../src/web/src/api/http";
import { buildDemoSession } from "../../../src/web/src/auth/AuthContext";
import { QuoteEstimateListPage, SalesOrderListPage } from "../../../src/web/src/pages/CommercialPlanningPages";
import { renderWithApp } from "../../../src/web/src/test/render";

function paged<TItem>(items: TItem[]) {
  return {
    items,
    page: 1,
    pageSize: Math.max(items.length, 1),
    totalCount: items.length,
    totalPages: items.length > 0 ? 1 : 0
  };
}

function buildLiveSession(): AuthSessionResponse {
  return {
    ...buildDemoSession(),
    accessToken: "live-quote-pack-token",
    refreshToken: "live-quote-pack-refresh"
  };
}

function quoteFromRequest(id: number, request: QuoteUpsertRequest): QuoteDto {
  return {
    id,
    companyId: request.companyId,
    branchId: request.branchId,
    quoteNo: request.quoteNo,
    customerId: request.customerId,
    customerAddressId: request.customerAddressId,
    quoteDate: request.quoteDate,
    expiryDate: request.expiryDate,
    priorityCode: request.priorityCode,
    status: request.status,
    customerSpecRef: request.customerSpecRef,
    lines: request.lines.map((line, index) => {
      const gross = line.quantity * line.unitPrice;
      const discountAmount = gross * (line.discountPercent / 100);
      const taxable = gross - discountAmount;
      const taxAmount = taxable * (line.taxPercent / 100);
      return {
        id: index + 1,
        lineNo: line.lineNo,
        itemId: line.itemId,
        itemVariantId: line.itemVariantId,
        orderUomId: line.orderUomId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent,
        discountAmount,
        taxPercent: line.taxPercent,
        taxAmount,
        lineAmount: taxable + taxAmount,
        makeType: line.makeType,
        promisedDate: line.promisedDate,
        priorityCode: line.priorityCode,
        customerSpecRef: line.customerSpecRef,
        status: line.status
      };
    })
  };
}

function mockQuoteApis() {
  const emptyPage = paged([]);
  let quotes: QuoteDto[] = [];
  vi.spyOn(apiClient.salesPlanning, "quotes").mockImplementation(async () => paged(quotes));
  vi.spyOn(apiClient.partners, "customers").mockResolvedValue({
    ...emptyPage,
    items: [
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
        paymentTermsCode: "NET30",
        creditDays: 30,
        status: "Active"
      }
    ]
  });
  vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([
    { id: 301, itemCode: "FG-301", itemName: "Finished Item", itemType: "FinishedGood", status: "Active" },
    { id: 302, itemCode: "FG-302", itemName: "Second Finished Item", itemType: "FinishedGood", status: "Active" }
  ]);
  vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue({
    ...emptyPage,
    items: [
      { id: 41, uomCode: "PCS", uomName: "Pieces", symbol: "pcs", uomClassId: 4, decimalPrecision: 0, isSystemBase: false, status: "Active" }
    ]
  });
  const createQuote = vi.spyOn(apiClient.salesPlanning, "createQuote").mockImplementation(async (request) => {
    const saved = quoteFromRequest(9101, request);
    quotes = [saved];
    return saved;
  });
  const updateQuote = vi.spyOn(apiClient.salesPlanning, "updateQuote").mockImplementation(async (quoteId, request) => {
    const saved = quoteFromRequest(quoteId, request);
    quotes = [saved];
    return saved;
  });

  return { createQuote, updateQuote };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("QUOTE-SALES-ORDER-FORECAST-ATP completion pack", () => {
  it("saves, reopens, and edits multiline quote drafts without first-line-only behavior", async () => {
    const api = mockQuoteApis();

    renderWithApp(
      <Routes>
        <Route path="/sales/quotes" element={<QuoteEstimateListPage />} />
      </Routes>,
      { route: "/sales/quotes", session: buildLiveSession() }
    );

    expect(await screen.findByText("Estimate / Quote List")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New quote draft" }));
    const dialog = await screen.findByRole("dialog", { name: "New quote draft" });

    fireEvent.change(within(dialog).getByLabelText("Quote number"), { target: { value: "QT-PACK-001" } });
    fireEvent.change(within(dialog).getByLabelText("Customer"), { target: { value: "501" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add Line" }));

    const itemFields = within(dialog).getAllByLabelText("Item");
    const uomFields = within(dialog).getAllByLabelText("Order UOM");
    const quantityFields = within(dialog).getAllByLabelText("Quantity");
    const priceFields = within(dialog).getAllByLabelText("Unit price");
    const discountFields = within(dialog).getAllByLabelText("Discount %");
    const taxFields = within(dialog).getAllByLabelText("Tax %");

    fireEvent.change(itemFields[0], { target: { value: "301" } });
    fireEvent.change(uomFields[0], { target: { value: "41" } });
    fireEvent.change(quantityFields[0], { target: { value: "2" } });
    fireEvent.change(priceFields[0], { target: { value: "100" } });
    fireEvent.change(discountFields[0], { target: { value: "5" } });
    fireEvent.change(taxFields[0], { target: { value: "18" } });

    fireEvent.change(itemFields[1], { target: { value: "302" } });
    fireEvent.change(uomFields[1], { target: { value: "41" } });
    fireEvent.change(quantityFields[1], { target: { value: "3" } });
    fireEvent.change(priceFields[1], { target: { value: "200" } });
    fireEvent.change(discountFields[1], { target: { value: "10" } });
    fireEvent.change(taxFields[1], { target: { value: "12" } });

    expect(within(dialog).getByText("Quote value")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Freight / charges")).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Convert to order" })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Save quote draft" }));

    await waitFor(() => expect(api.createQuote).toHaveBeenCalledTimes(1));
    expect(api.createQuote.mock.calls[0][0].lines).toHaveLength(2);
    expect(api.createQuote.mock.calls[0][0].lines[1]).toMatchObject({ itemId: 302, orderUomId: 41, quantity: 3, unitPrice: 200 });

    fireEvent.click(within(dialog).getAllByRole("button", { name: "Close" })[0]);
    const savedRow = await screen.findByRole("row", { name: "QT-PACK-001 quote" });
    fireEvent.click(savedRow);
    const reopened = await screen.findByRole("dialog", { name: "Quote QT-PACK-001" });
    expect(within(reopened).getByText("Line 1")).toBeInTheDocument();
    expect(within(reopened).getByText("Line 2")).toBeInTheDocument();

    fireEvent.click(within(reopened).getAllByRole("button", { name: "Remove Line" })[1]);
    fireEvent.click(within(reopened).getByRole("button", { name: "Save quote draft" }));
    await waitFor(() => expect(api.updateQuote).toHaveBeenCalledTimes(1));
    expect(api.updateQuote.mock.calls[0][1].lines).toHaveLength(1);
  });

  it("keeps sales order drafting truthful when no live sales session is present", async () => {
    renderWithApp(
      <Routes>
        <Route path="/sales/orders" element={<SalesOrderListPage />} />
      </Routes>,
      { route: "/sales/orders" }
    );

    expect(await screen.findByText("Sales Order List")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New order draft" })).toBeDisabled();
    expect(screen.getByText("Sales order drafting requires a live sales session.")).toBeInTheDocument();
  });
});
