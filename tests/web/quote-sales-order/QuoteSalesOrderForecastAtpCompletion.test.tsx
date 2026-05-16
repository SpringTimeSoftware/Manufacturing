import React from "react";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import type { AuthSessionResponse, QuoteDto, QuoteUpsertRequest, SalesOrderDto } from "../../../src/web/src/api/contracts";
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
  const subtotalAmount = request.lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
  const discountTotalAmount = request.lines.reduce((total, line) => total + line.quantity * line.unitPrice * (line.discountPercent / 100), 0);
  const taxableAmount = Math.max(subtotalAmount - discountTotalAmount, 0) +
    (request.freightAmount ?? 0) +
    (request.packingAmount ?? 0) +
    (request.insuranceAmount ?? 0) +
    (request.otherChargesAmount ?? 0);
  const taxTotalAmount = request.lines.reduce((total, line) => {
    const gross = line.quantity * line.unitPrice;
    const discountAmount = gross * (line.discountPercent / 100);
    return total + Math.max(gross - discountAmount, 0) * (line.taxPercent / 100);
  }, 0);

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
    salesOwnerUserId: request.salesOwnerUserId,
    salesOwnerName: request.salesOwnerName,
    internalRemarks: request.internalRemarks,
    customerFacingRemarks: request.customerFacingRemarks,
    printRemarks: request.printRemarks,
    paymentTermsId: request.paymentTermsId,
    priceListId: request.priceListId,
    discountSchemeId: request.discountSchemeId,
    taxCategoryId: request.taxCategoryId,
    taxTreatment: request.taxTreatment,
    currencyId: request.currencyId,
    exchangeRateId: request.exchangeRateId,
    exchangeRateSnapshot: request.exchangeRateSnapshot,
    tradeTermsId: request.tradeTermsId,
    freightAmount: request.freightAmount ?? 0,
    packingAmount: request.packingAmount ?? 0,
    insuranceAmount: request.insuranceAmount ?? 0,
    otherChargesAmount: request.otherChargesAmount ?? 0,
    addLessAmount: request.addLessAmount ?? 0,
    roundOffAmount: request.roundOffAmount ?? 0,
    subtotalAmount,
    discountTotalAmount,
    taxableAmount,
    taxTotalAmount,
    grandTotalAmount: taxableAmount + taxTotalAmount + (request.addLessAmount ?? 0) + (request.roundOffAmount ?? 0),
    commercialStatus: request.commercialStatus ?? request.status,
    revisionNo: 1,
    legacyCommercialIncomplete: false,
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
        taxCodeId: line.taxCodeId,
        taxRateSnapshot: line.taxRateSnapshot ?? line.taxPercent,
        taxAmount,
        lineSubtotal: gross,
        lineTaxableAmount: taxable,
        lineTotalAmount: taxable + taxAmount,
        lineAmount: taxable + taxAmount,
        priceSourceType: line.priceSourceType ?? "Manual",
        priceListLineId: line.priceListLineId,
        discountSchemeId: line.discountSchemeId,
        discountRuleId: line.discountRuleId,
        lineInternalRemarks: line.lineInternalRemarks,
        lineCustomerFacingRemarks: line.lineCustomerFacingRemarks,
        overrideReason: line.overrideReason,
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
  vi.spyOn(apiClient.platform, "users").mockResolvedValue([
    {
      id: "user-77",
      userName: "sales.owner",
      displayName: "Sales Owner",
      email: "sales.owner@example.test",
      roles: ["SalesCoordinator"],
      branchAccess: ["Main"],
      status: "Active",
      loginPolicy: "Standard",
      lastLogin: "Today",
      deviceBinding: "No device bound"
    }
  ]);
  vi.spyOn(apiClient.commercial, "priceLists").mockResolvedValue(paged([
    {
      id: 21,
      companyId: 1,
      priceListCode: "PL-STD",
      priceListName: "Standard price list",
      currencyId: 31,
      currencyCode: "INR",
      priceListType: "Customer",
      effectiveFrom: "2026-01-01",
      effectiveTo: null,
      customerSegment: null,
      approvalStatus: "Approved",
      status: "Active",
      lines: [],
      assignments: []
    }
  ]));
  vi.spyOn(apiClient.commercial, "discountSchemes").mockResolvedValue(paged([
    {
      id: 22,
      companyId: 1,
      schemeCode: "DISC-STD",
      schemeName: "Standard discounts",
      discountType: "Line",
      currencyId: 31,
      currencyCode: "INR",
      effectiveFrom: "2026-01-01",
      effectiveTo: null,
      requiresApproval: false,
      approvalStatus: "Approved",
      status: "Active",
      rules: []
    }
  ]));
  vi.spyOn(apiClient.commercial, "taxCategories").mockResolvedValue(paged([
    {
      id: 23,
      companyId: 1,
      taxCategoryCode: "GST18",
      taxCategoryName: "GST 18",
      taxScope: "Domestic",
      defaultRatePercent: 18,
      isRecoverable: false,
      status: "Active",
      taxCodes: [{ id: 2301, taxCategoryId: 23, taxCode: "GST18", taxCodeName: "GST 18", ratePercent: 18, effectiveFrom: "2026-01-01", effectiveTo: null, status: "Active" }]
    }
  ]));
  vi.spyOn(apiClient.commercial, "currencies").mockResolvedValue(paged([{ id: 31, companyId: 1, currencyCode: "INR", currencyName: "Indian Rupee", symbol: "INR", decimalPrecision: 2, roundingMode: "RoundHalfUp", isBaseCurrency: true, status: "Active" }]));
  vi.spyOn(apiClient.commercial, "exchangeRates").mockResolvedValue(paged([{ id: 32, companyId: 1, currencyId: 31, currencyCode: "INR", rateType: "Manual", rateSource: "Finance", manualRate: 1, effectiveFrom: "2026-01-01", effectiveTo: null, status: "Active" }]));
  vi.spyOn(apiClient.commercial, "paymentTerms").mockResolvedValue(paged([{ id: 33, companyId: 1, paymentTermsCode: "NET30", paymentTermsName: "Net 30", netDays: 30, discountDays: null, discountPercent: null, dueCalculationMode: "InvoiceDate", status: "Active" }]));
  vi.spyOn(apiClient.commercial, "tradeTerms").mockResolvedValue(paged([{ id: 34, companyId: 1, tradeTermsCode: "EXW", tradeTermsName: "Ex Works", tradeMode: "Domestic", responsibilitySummary: "Buyer pickup", status: "Active" }]));
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
  const releaseQuote = vi.spyOn(apiClient.salesPlanning, "releaseQuote").mockImplementation(async (quoteId) => {
    const released = {
      ...quotes.find((quote) => quote.id === quoteId)!,
      status: "Released",
      commercialStatus: "Released",
      releasedAt: "2026-05-16T12:00:00Z",
      releasedByUserId: 77
    };
    quotes = [released];
    return released;
  });
  const convertQuoteToSalesOrder = vi.spyOn(apiClient.salesPlanning, "convertQuoteToSalesOrder").mockImplementation(async (quoteId) => {
    const quote = quotes.find((record) => record.id === quoteId)!;
    const order: SalesOrderDto = {
      id: 9201,
      companyId: quote.companyId,
      branchId: quote.branchId,
      salesOrderNo: "SO-FROM-QT-001",
      customerId: quote.customerId,
      billToAddressId: quote.customerAddressId,
      shipToAddressId: quote.customerAddressId,
      orderDate: quote.quoteDate,
      promisedDate: quote.lines[0]?.promisedDate ?? null,
      priorityCode: quote.priorityCode,
      status: "Draft",
      sourceQuoteId: quote.id,
      sourceQuoteRevisionNo: quote.revisionNo,
      sourceQuoteVersionNo: quote.revisionNo,
      salesOwnerUserId: quote.salesOwnerUserId,
      salesOwnerName: quote.salesOwnerName,
      internalRemarks: quote.internalRemarks,
      customerFacingRemarks: quote.customerFacingRemarks,
      printRemarks: quote.printRemarks,
      paymentTermsId: quote.paymentTermsId,
      priceListId: quote.priceListId,
      discountSchemeId: quote.discountSchemeId,
      taxCategoryId: quote.taxCategoryId,
      taxTreatment: quote.taxTreatment,
      currencyId: quote.currencyId,
      exchangeRateId: quote.exchangeRateId,
      exchangeRateSnapshot: quote.exchangeRateSnapshot,
      tradeTermsId: quote.tradeTermsId,
      freightAmount: quote.freightAmount,
      packingAmount: quote.packingAmount,
      insuranceAmount: quote.insuranceAmount,
      otherChargesAmount: quote.otherChargesAmount,
      addLessAmount: quote.addLessAmount,
      roundOffAmount: quote.roundOffAmount,
      subtotalAmount: quote.subtotalAmount,
      discountTotalAmount: quote.discountTotalAmount,
      taxableAmount: quote.taxableAmount,
      taxTotalAmount: quote.taxTotalAmount,
      grandTotalAmount: quote.grandTotalAmount,
      commercialStatus: "Draft",
      legacyCommercialIncomplete: false,
      lines: quote.lines.map((line) => ({
        id: line.id,
        lineNo: line.lineNo,
        itemId: line.itemId,
        itemVariantId: line.itemVariantId,
        orderUomId: line.orderUomId,
        quantity: line.quantity,
        makeType: line.makeType,
        promisedDate: line.promisedDate,
        priorityCode: line.priorityCode,
        customerSpecRef: line.customerSpecRef,
        requestedShipDate: line.promisedDate,
        status: "Draft",
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent,
        discountAmount: line.discountAmount,
        taxCodeId: line.taxCodeId,
        taxRateSnapshot: line.taxRateSnapshot,
        taxAmount: line.taxAmount,
        lineSubtotal: line.lineSubtotal,
        lineTaxableAmount: line.lineTaxableAmount,
        lineTotalAmount: line.lineTotalAmount,
        lineInternalRemarks: line.lineInternalRemarks,
        lineCustomerFacingRemarks: line.lineCustomerFacingRemarks,
        overrideReason: line.overrideReason
      }))
    };
    quotes = quotes.map((record) => record.id === quoteId ? { ...record, status: "Converted", commercialStatus: "Converted", convertedAt: "2026-05-16T12:05:00Z", convertedByUserId: 77 } : record);
    return order;
  });

  return { convertQuoteToSalesOrder, createQuote, releaseQuote, updateQuote };
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
    fireEvent.change(within(dialog).getByLabelText("Sales owner"), { target: { value: "77" } });
    fireEvent.change(within(dialog).getByLabelText("Price list"), { target: { value: "21" } });
    fireEvent.change(within(dialog).getByLabelText("Discount scheme"), { target: { value: "22" } });
    fireEvent.change(within(dialog).getByLabelText("Payment terms"), { target: { value: "33" } });
    fireEvent.change(within(dialog).getByLabelText("Currency"), { target: { value: "31" } });
    fireEvent.change(within(dialog).getByLabelText("Internal remarks"), { target: { value: "Margin review note" } });
    fireEvent.change(within(dialog).getByLabelText("Customer-facing remarks"), { target: { value: "Customer print note" } });
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
    fireEvent.change(within(dialog).getAllByLabelText("Customer-facing line remarks")[0], { target: { value: "First print line" } });

    fireEvent.change(itemFields[1], { target: { value: "302" } });
    fireEvent.change(uomFields[1], { target: { value: "41" } });
    fireEvent.change(quantityFields[1], { target: { value: "3" } });
    fireEvent.change(priceFields[1], { target: { value: "200" } });
    fireEvent.change(discountFields[1], { target: { value: "10" } });
    fireEvent.change(taxFields[1], { target: { value: "12" } });
    fireEvent.change(within(dialog).getAllByLabelText("Customer-facing line remarks")[1], { target: { value: "Second print line" } });
    fireEvent.change(within(dialog).getByLabelText("Freight amount"), { target: { value: "50" } });

    expect(within(dialog).getByText("Quote value")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Freight amount")).toBeEnabled();
    expect(within(dialog).getByRole("button", { name: "Convert to order" })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Save quote draft" }));

    await waitFor(() => expect(api.createQuote).toHaveBeenCalledTimes(1));
    expect(api.createQuote.mock.calls[0][0]).toMatchObject({
      salesOwnerUserId: 77,
      internalRemarks: "Margin review note",
      customerFacingRemarks: "Customer print note",
      paymentTermsId: 33,
      priceListId: 21,
      discountSchemeId: 22,
      currencyId: 31,
      freightAmount: 50
    });
    expect(api.createQuote.mock.calls[0][0].lines).toHaveLength(2);
    expect(api.createQuote.mock.calls[0][0].lines[1]).toMatchObject({ itemId: 302, orderUomId: 41, quantity: 3, unitPrice: 200, lineCustomerFacingRemarks: "Second print line" });

    fireEvent.click(within(dialog).getAllByRole("button", { name: "Close" })[0]);
    const savedRow = await screen.findByRole("row", { name: "QT-PACK-001 quote" });
    fireEvent.click(savedRow);
    const reopened = await screen.findByRole("dialog", { name: "Quote QT-PACK-001" });
    expect(within(reopened).getByRole("grid", { name: "Quote line grid" })).toBeInTheDocument();
    expect(within(reopened).getAllByLabelText("Line no")).toHaveLength(2);

    fireEvent.click(within(reopened).getAllByRole("button", { name: "Remove Line" })[1]);
    fireEvent.click(within(reopened).getByRole("button", { name: "Save quote draft" }));
    await waitFor(() => expect(api.updateQuote).toHaveBeenCalledTimes(1));
    expect(api.updateQuote.mock.calls[0][1].lines).toHaveLength(1);
  });

  it("releases a quote snapshot before exact quote-to-sales-order conversion", async () => {
    const api = mockQuoteApis();

    renderWithApp(
      <Routes>
        <Route path="/sales/quotes" element={<QuoteEstimateListPage />} />
      </Routes>,
      { route: "/sales/quotes", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New quote draft" }));
    const dialog = await screen.findByRole("dialog", { name: "New quote draft" });

    fireEvent.change(within(dialog).getByLabelText("Quote number"), { target: { value: "QT-REL-001" } });
    fireEvent.change(within(dialog).getByLabelText("Customer"), { target: { value: "501" } });
    fireEvent.change(within(dialog).getByLabelText("Sales owner"), { target: { value: "77" } });
    fireEvent.change(within(dialog).getByLabelText("Payment terms"), { target: { value: "33" } });
    fireEvent.change(within(dialog).getByLabelText("Item"), { target: { value: "301" } });
    fireEvent.change(within(dialog).getByLabelText("Order UOM"), { target: { value: "41" } });
    fireEvent.change(within(dialog).getByLabelText("Unit price"), { target: { value: "100" } });

    expect(within(dialog).getByRole("button", { name: "Convert to order" })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Save quote draft" }));
    await waitFor(() => expect(api.createQuote).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Release quote" })).toBeEnabled());
    fireEvent.click(within(dialog).getByRole("button", { name: "Release quote" }));
    await waitFor(() => expect(api.releaseQuote).toHaveBeenCalledWith(9101));
    await waitFor(() => expect(within(dialog).getByLabelText("Unit price")).toBeDisabled());
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Convert to order" })).toBeEnabled());
    fireEvent.click(within(dialog).getByRole("button", { name: "Convert to order" }));
    await waitFor(() => expect(api.convertQuoteToSalesOrder).toHaveBeenCalledWith(9101, {}));
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
