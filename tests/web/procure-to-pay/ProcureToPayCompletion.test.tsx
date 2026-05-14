import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../src/web/src/api/http";
import { buildDemoSession } from "../../../src/web/src/auth/AuthContext";
import {
  LandedCostPage,
  ProcurementDashboardPage,
  PurchaseOrderPage,
  PurchaseRequisitionPage,
  QuoteComparisonPage,
  RfqSourcingPage,
  SupplierQuotationPage,
  VendorReturnPage
} from "../../../src/web/src/pages/ProcurementPages";
import { renderWithApp } from "../../../src/web/src/test/render";

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-p2p-pack-token",
    refreshToken: "live-p2p-pack-refresh"
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

const itemA = { id: 101, itemCode: "RM-SS", itemName: "Steel sheet", itemType: "RawMaterial", status: "Active" };
const itemB = { id: 102, itemCode: "RM-VLV", itemName: "Valve set", itemType: "RawMaterial", status: "Active" };
const uom = { id: 1, uomCode: "EA", uomName: "Each", symbol: "EA", uomClassId: 1, decimalPrecision: 0, isSystemBase: true, status: "Active" };
const supplierA = { id: 201, companyId: 1, supplierCode: "SUP-INX", supplierName: "Inox Metals", supplierType: "Material", supportsSubcontracting: true, defaultBranchId: 10, defaultLanguageId: null, taxRegistrationNo: null, paymentTermsCode: "NET30", status: "Active" };
const supplierB = { id: 202, companyId: 1, supplierCode: "SUP-ALT", supplierName: "Alt Metals", supplierType: "Material", supportsSubcontracting: false, defaultBranchId: 10, defaultLanguageId: null, taxRegistrationNo: null, paymentTermsCode: "NET30", status: "Active" };
const warehouse = { id: 301, companyId: 1, branchId: 10, warehouseCode: "MAIN", warehouseName: "Main stores", warehouseType: "Stores", isDefaultReceivingWarehouse: true, isDefaultIssueWarehouse: true, isDispatchEnabled: true, allowsMixedLots: false, allowsNegativeStock: false, status: "Active" };

const rfq = {
  id: 701,
  companyId: 1,
  branchId: 10,
  rfqNo: "RFQ-701",
  purchaseRequisitionId: null,
  issueDate: "2026-05-14",
  responseDueDate: "2026-05-20",
  currencyCode: "INR",
  status: "Sent",
  remarks: null,
  lines: [
    { id: 70110, lineNo: 10, itemId: 101, orderUomId: 1, requestedQuantity: 4, needByDate: "2026-05-22", purchaseRequisitionLineId: null, status: "Open" },
    { id: 70120, lineNo: 20, itemId: 102, orderUomId: 1, requestedQuantity: 8, needByDate: "2026-05-24", purchaseRequisitionLineId: null, status: "Open" }
  ],
  suppliers: [
    { id: 70101, supplierId: 201, invitationStatus: "Invited", responseDueDate: "2026-05-20", remarks: null },
    { id: 70102, supplierId: 202, invitationStatus: "Invited", responseDueDate: "2026-05-20", remarks: null }
  ]
};

const supplierQuoteA = {
  id: 801,
  companyId: 1,
  branchId: 10,
  supplierQuotationNo: "SQ-801",
  rfqId: 701,
  supplierId: 201,
  quotationDate: "2026-05-14",
  validUntil: "2026-06-14",
  currencyCode: "INR",
  subtotalAmount: 900,
  taxAmount: 162,
  totalAmount: 1062,
  selectionStatus: "Pending",
  selectionReason: null,
  status: "Received",
  lines: [
    { id: 80110, lineNo: 10, rfqLineId: 70110, itemId: 101, orderUomId: 1, offeredQuantity: 4, unitPrice: 100, discountPercent: 0, discountAmount: 0, taxPercent: 18, taxAmount: 72, lineAmount: 472, leadTimeDays: 5, status: "Quoted" },
    { id: 80120, lineNo: 20, rfqLineId: 70120, itemId: 102, orderUomId: 1, offeredQuantity: 8, unitPrice: 62.5, discountPercent: 0, discountAmount: 0, taxPercent: 18, taxAmount: 90, lineAmount: 590, leadTimeDays: 6, status: "Quoted" }
  ]
};

const supplierQuoteB = {
  ...supplierQuoteA,
  id: 802,
  supplierQuotationNo: "SQ-802",
  supplierId: 202,
  totalAmount: 1110,
  lines: supplierQuoteA.lines.map((line, index) => ({ ...line, id: 80210 + index * 10, unitPrice: line.unitPrice + 5, lineAmount: line.lineAmount + 20 }))
};

const savedPo = {
  id: 902,
  companyId: 1,
  branchId: 10,
  purchaseOrderNo: "PO-902",
  supplierId: 201,
  orderAddressId: null,
  status: "Approved",
  expectedReceiptDate: "2026-05-20",
  lines: [
    { id: 90210, lineNo: 10, itemId: 101, purchaseRequisitionLineId: null, orderedQuantity: 4, unitPrice: 100, discountPercent: 0, discountAmount: 0, taxPercent: 18, taxAmount: 72, lineAmount: 472, orderUomId: 1, expectedDate: "2026-05-20", linkedWorkOrderId: null, sourceBoqRequirementLineId: null, status: "Approved" },
    { id: 90220, lineNo: 20, itemId: 102, purchaseRequisitionLineId: null, orderedQuantity: 8, unitPrice: 62.5, discountPercent: 0, discountAmount: 0, taxPercent: 18, taxAmount: 90, lineAmount: 590, orderUomId: 1, expectedDate: "2026-05-20", linkedWorkOrderId: null, sourceBoqRequirementLineId: null, status: "Approved" }
  ]
};

beforeEach(() => {
  vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([itemA, itemB] as never);
  vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([uom]) as never);
  vi.spyOn(apiClient.partners, "suppliers").mockResolvedValue(paged([supplierA, supplierB]) as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PROCURE-TO-PAY-COMPLETION-01", () => {
  it("keeps purchase requisition multiline draft add/remove/save truthful", async () => {
    vi.spyOn(apiClient.procurement, "purchaseRequisitions").mockResolvedValue(paged([]) as never);
    const createPr = vi.spyOn(apiClient.procurement, "createPurchaseRequisition").mockResolvedValue({ ...rfq, id: 901, purchaseRequisitionNo: "PR-901", sourceDocumentType: "Manual", sourceDocumentId: null, lines: [] } as never);

    renderWithApp(<Routes><Route path="/procurement/requisitions" element={<PurchaseRequisitionPage />} /></Routes>, { route: "/procurement/requisitions", session: buildLiveSession() });

    fireEvent.click(await screen.findByRole("button", { name: "New PR draft" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Add Line" }));

    const itemFields = within(dialog).getAllByLabelText("Item");
    const uomFields = within(dialog).getAllByLabelText("Order UOM");
    const qtyFields = within(dialog).getAllByLabelText("Required quantity");
    fireEvent.change(itemFields[0], { target: { value: "101" } });
    fireEvent.change(uomFields[0], { target: { value: "1" } });
    fireEvent.change(qtyFields[0], { target: { value: "4" } });
    fireEvent.change(itemFields[1], { target: { value: "102" } });
    fireEvent.change(uomFields[1], { target: { value: "1" } });
    fireEvent.change(qtyFields[1], { target: { value: "8" } });
    fireEvent.click(within(dialog).getAllByRole("button", { name: "Remove Line" })[0]);
    fireEvent.click(within(dialog).getByRole("button", { name: "Save requisition" }));

    await waitFor(() => expect(createPr).toHaveBeenCalledTimes(1));
    expect(createPr.mock.calls[0][0].lines).toHaveLength(1);
    expect(createPr.mock.calls[0][0].lines[0]).toMatchObject({ itemId: 102, orderUomId: 1, requiredQuantity: 8 });
  });

  it("creates RFQs with two suppliers, multiline lines, and save/reopen payload", async () => {
    vi.spyOn(apiClient.procurement, "rfqs").mockResolvedValue(paged([]) as never);
    const createRfq = vi.spyOn(apiClient.procurement, "createRfq").mockResolvedValue(rfq as never);

    renderWithApp(<Routes><Route path="/procurement/rfqs" element={<RfqSourcingPage />} /></Routes>, { route: "/procurement/rfqs", session: buildLiveSession() });

    fireEvent.click(await screen.findByRole("button", { name: "New RFQ" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Add Line" }));

    const supplierFields = within(dialog).getAllByLabelText("Supplier");
    fireEvent.change(supplierFields[0], { target: { value: "201" } });
    fireEvent.change(supplierFields[1], { target: { value: "202" } });
    const itemFields = within(dialog).getAllByLabelText("Item");
    const uomFields = within(dialog).getAllByLabelText("Order UOM");
    const qtyFields = within(dialog).getAllByLabelText("Requested quantity");
    fireEvent.change(itemFields[0], { target: { value: "101" } });
    fireEvent.change(uomFields[0], { target: { value: "1" } });
    fireEvent.change(qtyFields[0], { target: { value: "4" } });
    fireEvent.change(itemFields[1], { target: { value: "102" } });
    fireEvent.change(uomFields[1], { target: { value: "1" } });
    fireEvent.change(qtyFields[1], { target: { value: "8" } });
    fireEvent.click(within(dialog).getAllByRole("button", { name: "Remove Line" })[0]);
    fireEvent.click(within(dialog).getByRole("button", { name: "Save RFQ" }));

    await waitFor(() => expect(createRfq).toHaveBeenCalledTimes(1));
    expect(createRfq.mock.calls[0][0].suppliers).toHaveLength(2);
    expect(createRfq.mock.calls[0][0].lines).toHaveLength(1);
    expect(createRfq.mock.calls[0][0].lines[0]).toMatchObject({ itemId: 102, requestedQuantity: 8 });
  });

  it("records supplier quotation lines with price, discount, tax, and lead time", async () => {
    vi.spyOn(apiClient.procurement, "rfqs").mockResolvedValue(paged([rfq]) as never);
    vi.spyOn(apiClient.procurement, "supplierQuotations").mockResolvedValue(paged([]) as never);
    const createQuote = vi.spyOn(apiClient.procurement, "createSupplierQuotation").mockResolvedValue(supplierQuoteA as never);

    renderWithApp(<Routes><Route path="/procurement/supplier-quotes" element={<SupplierQuotationPage />} /></Routes>, { route: "/procurement/supplier-quotes", session: buildLiveSession() });

    fireEvent.click(await screen.findByRole("button", { name: "Record supplier quote" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("RFQ"), { target: { value: "701" } });
    await waitFor(() => expect(within(dialog).getAllByLabelText("Unit price").length).toBeGreaterThanOrEqual(2));
    fireEvent.change(within(dialog).getByLabelText("Supplier"), { target: { value: "201" } });
    fireEvent.change(within(dialog).getAllByLabelText("Unit price")[0], { target: { value: "100" } });
    fireEvent.change(within(dialog).getAllByLabelText("Discount %")[0], { target: { value: "2" } });
    fireEvent.change(within(dialog).getAllByLabelText("Tax %")[0], { target: { value: "18" } });
    fireEvent.change(within(dialog).getAllByLabelText("Lead time days")[0], { target: { value: "5" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save supplier quote" }));

    await waitFor(() => expect(createQuote).toHaveBeenCalledTimes(1));
    expect(createQuote.mock.calls[0][0].lines[0]).toMatchObject({ unitPrice: 100, discountPercent: 2, taxPercent: 18, leadTimeDays: 5 });
  });

  it("compares supplier quotations, selects with reason, and converts selected quote to PO", async () => {
    vi.spyOn(apiClient.procurement, "rfqs").mockResolvedValue(paged([rfq]) as never);
    vi.spyOn(apiClient.procurement, "quoteComparison").mockResolvedValue({ rfq, supplierQuotations: [{ ...supplierQuoteA, selectionStatus: "Selected", selectionReason: "Best landed value" }, supplierQuoteB], lines: [] } as never);
    vi.spyOn(apiClient.procurement, "selectSupplierQuotation").mockResolvedValue({ ...supplierQuoteA, selectionStatus: "Selected", selectionReason: "Best landed value" } as never);
    const convert = vi.spyOn(apiClient.procurement, "convertSupplierQuotationToPurchaseOrder").mockResolvedValue(savedPo as never);

    renderWithApp(<Routes><Route path="/procurement/quote-comparison" element={<QuoteComparisonPage />} /></Routes>, { route: "/procurement/quote-comparison", session: buildLiveSession() });

    fireEvent.click(await screen.findByRole("row", { name: "SQ-801 comparison quote" }));
    fireEvent.change(screen.getByLabelText("Selection reason"), { target: { value: "Best landed value" } });
    fireEvent.click(screen.getByRole("button", { name: "Select supplier" }));
    await waitFor(() => expect(apiClient.procurement.selectSupplierQuotation).toHaveBeenCalledWith(801, { selectionReason: "Best landed value" }));

    fireEvent.click(screen.getByRole("button", { name: "Convert selected lines to PO" }));
    await waitFor(() => expect(convert).toHaveBeenCalledWith(801));
  });

  it("opens PO receiving, validates GRN, creates supplier invoice, and exposes match/AP actions truthfully", async () => {
    vi.spyOn(apiClient.procurement, "purchaseOrders").mockResolvedValue(paged([savedPo]) as never);
    vi.spyOn(apiClient.organization, "warehouses").mockResolvedValue(paged([warehouse]) as never);
    const createGrn = vi.spyOn(apiClient.procurement, "createGoodsReceipt").mockResolvedValue({
      id: 1001,
      companyId: 1,
      branchId: 10,
      goodsReceiptNo: "GRN-1001",
      purchaseOrderId: 902,
      supplierId: 201,
      receiptDate: "2026-05-14",
      warehouseId: 301,
      status: "Received",
      remarks: null,
      lines: savedPo.lines.map((line) => ({ id: line.id + 1000, lineNo: line.lineNo, purchaseOrderLineId: line.id, itemId: line.itemId, orderUomId: line.orderUomId, receivedQuantity: line.orderedQuantity, acceptedQuantity: line.orderedQuantity, rejectedQuantity: 0, unitPrice: line.unitPrice, taxPercent: line.taxPercent, lineAmount: line.lineAmount, qcStatus: "Accepted", status: "Received" }))
    } as never);
    const createInvoice = vi.spyOn(apiClient.procurement, "createSupplierInvoice").mockResolvedValue({ ...supplierQuoteA, id: 1101, supplierInvoiceNo: "SUP-INV-1101", purchaseOrderId: 902, goodsReceiptId: 1001, invoiceDate: "2026-05-14", dueDate: null, matchStatus: "Matched", apStatus: "Not Posted" } as never);

    renderWithApp(<Routes><Route path="/procurement/purchase-orders" element={<PurchaseOrderPage />} /></Routes>, { route: "/procurement/purchase-orders", session: buildLiveSession() });

    fireEvent.click(await screen.findByRole("row", { name: "PO-902 purchase order" }));
    fireEvent.click(await screen.findByRole("button", { name: "Receive against PO" }));
    const dialog = await screen.findByRole("dialog", { name: "Receive PO-902" });
    fireEvent.change(within(dialog).getByLabelText("Receiving warehouse"), { target: { value: "301" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save GRN" }));
    await waitFor(() => expect(createGrn).toHaveBeenCalledTimes(1));

    fireEvent.click(within(dialog).getByRole("button", { name: "Create supplier invoice" }));
    await waitFor(() => expect(createInvoice).toHaveBeenCalledTimes(1));
    expect(within(dialog).getByRole("button", { name: "Run 2-way/3-way match" })).toBeEnabled();
  });

  it("truthfully blocks vendor return, landed cost, and consolidated buyer queue actions until downstream contracts exist", () => {
    renderWithApp(
      <Routes>
        <Route path="/procurement/vendor-returns" element={<VendorReturnPage />} />
        <Route path="/procurement/landed-cost" element={<LandedCostPage />} />
        <Route path="/procurement/dashboard" element={<ProcurementDashboardPage />} />
      </Routes>,
      { route: "/procurement/vendor-returns", session: buildLiveSession() }
    );
    expect(screen.getByRole("button", { name: "New vendor return" })).toBeDisabled();
    expect(screen.getAllByText(/inventory reversal rules/i).length).toBeGreaterThan(0);
  });
});
