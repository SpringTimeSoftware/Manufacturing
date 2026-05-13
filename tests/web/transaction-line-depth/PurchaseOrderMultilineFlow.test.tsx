import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../src/web/src/api/http";
import { buildDemoSession } from "../../../src/web/src/auth/AuthContext";
import { PurchaseOrderPage } from "../../../src/web/src/pages/ProcurementPages";
import { renderWithApp } from "../../../src/web/src/test/render";

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-po-quality-gate-token",
    refreshToken: "live-po-quality-gate-refresh"
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

describe("QUALITY-GATES-01 purchase order multiline flow", () => {
  it("requires purchase orders to support add/remove lines or keep drafting disabled with a reason", async () => {
    vi.spyOn(apiClient.procurement, "purchaseOrders").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.partners, "suppliers").mockResolvedValue(paged([
      {
        id: 201,
        companyId: 1,
        supplierCode: "SUP-INX",
        supplierName: "Inox Metals",
        supplierType: "Material",
        supportsSubcontracting: true,
        defaultBranchId: 10,
        defaultLanguageId: null,
        taxRegistrationNo: null,
        paymentTermsCode: "NET30",
        status: "Active"
      }
    ]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([
      { id: 101, itemCode: "RM-SS", itemName: "Steel sheet", itemType: "RawMaterial", status: "Active" },
      { id: 102, itemCode: "RM-MS", itemName: "Mild steel", itemType: "RawMaterial", status: "Active" }
    ] as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([
      { id: 1, uomCode: "EA", uomName: "Each", symbol: "EA", uomClassId: 1, decimalPrecision: 0, isSystemBase: true, status: "Active" }
    ]) as never);
    const createPurchaseOrder = vi.spyOn(apiClient.procurement, "createPurchaseOrder").mockResolvedValue({
      id: 902,
      companyId: 1,
      branchId: 10,
      purchaseOrderNo: "PO-DRAFT-SAVED",
      supplierId: 201,
      orderAddressId: null,
      status: "Draft",
      expectedReceiptDate: "2026-05-13",
      lines: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/procurement/purchase-orders" element={<PurchaseOrderPage />} />
      </Routes>,
      { route: "/procurement/purchase-orders", session: buildLiveSession() }
    );

    const newPo = await screen.findByRole("button", { name: /New PO draft/i });
    if (newPo.hasAttribute("disabled")) {
      expect(newPo.getAttribute("title")).toMatch(/requires|pending|not enabled|workflow/i);
      return;
    }

    fireEvent.click(newPo);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByLabelText("Supplier")).not.toBeDisabled());

    fireEvent.change(within(dialog).getByLabelText("Supplier"), { target: { value: "201" } });
    expect(within(dialog).getByRole("button", { name: /Add Line/i })).toBeEnabled();
    fireEvent.click(within(dialog).getByRole("button", { name: /Add Line/i }));

    const itemControls = within(dialog).getAllByLabelText("Item");
    const uomControls = within(dialog).getAllByLabelText("Order UOM");
    const quantityControls = within(dialog).getAllByLabelText(/Ordered quantity|Quantity/i);
    const rateControls = within(dialog).getAllByLabelText(/Rate|Unit price/i);
    const taxControls = within(dialog).getAllByLabelText(/Tax/i);

    expect(itemControls.length).toBeGreaterThanOrEqual(2);
    expect(uomControls.length).toBeGreaterThanOrEqual(2);
    expect(quantityControls.length).toBeGreaterThanOrEqual(2);
    expect(rateControls.length).toBeGreaterThanOrEqual(2);
    expect(taxControls.length).toBeGreaterThanOrEqual(2);

    fireEvent.change(itemControls[0], { target: { value: "101" } });
    fireEvent.change(uomControls[0], { target: { value: "1" } });
    fireEvent.change(quantityControls[0], { target: { value: "3" } });
    fireEvent.change(itemControls[1], { target: { value: "102" } });
    fireEvent.change(uomControls[1], { target: { value: "1" } });
    fireEvent.change(quantityControls[1], { target: { value: "5" } });

    fireEvent.click(within(dialog).getAllByRole("button", { name: /Remove Line/i })[0]);
    fireEvent.click(within(dialog).getByRole("button", { name: /Save purchase order/i }));

    await waitFor(() => expect(createPurchaseOrder).toHaveBeenCalledTimes(1));
    expect(createPurchaseOrder.mock.calls[0][0].lines).toHaveLength(1);
    expect(createPurchaseOrder.mock.calls[0][0].lines[0]).toMatchObject({
      itemId: 102,
      orderUomId: 1,
      orderedQuantity: 5
    });
  });
});
