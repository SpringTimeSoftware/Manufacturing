import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { PurchaseOrderPage, PurchaseRequisitionPage, SubcontractPlanPage } from "./ProcurementPages";

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-procurement-token",
    refreshToken: "live-procurement-refresh"
  };
}

function paged<TItem>(items: TItem[]) {
  return {
    items,
    page: 1,
    pageSize: Math.max(items.length, 1),
    totalCount: items.length,
    totalPages: 1
  };
}

const uom = {
  id: 1,
  uomCode: "EA",
  uomName: "Each",
  symbol: "EA",
  uomClassId: 1,
  decimalPrecision: 0,
  isSystemBase: true,
  status: "Active"
};

const item = {
  id: 101,
  itemCode: "RM-SS",
  itemName: "Steel sheet",
  itemType: "RawMaterial",
  status: "Active"
};

const supplier = {
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
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WS09 procure-to-pay deepening", () => {
  it("creates a live purchase requisition draft through governed item, UOM, quantity, and date controls", async () => {
    vi.spyOn(apiClient.procurement, "purchaseRequisitions").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([item] as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([uom]) as never);
    const createPurchaseRequisition = vi.spyOn(apiClient.procurement, "createPurchaseRequisition").mockResolvedValue({
      id: 901,
      companyId: 1,
      branchId: 10,
      purchaseRequisitionNo: "PR-DRAFT-SAVED",
      sourceDocumentType: "Manual",
      sourceDocumentId: null,
      status: "Draft",
      lines: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/procurement/requisitions" element={<PurchaseRequisitionPage />} />
      </Routes>,
      { route: "/procurement/requisitions", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New PR draft" }));
    expect(await screen.findByText("Purchase requisition controls")).toBeInTheDocument();

    await screen.findByRole("option", { name: "RM-SS / Steel sheet" });
    fireEvent.change(screen.getByLabelText("Item"), { target: { value: "101" } });
    fireEvent.change(screen.getByLabelText("Order UOM"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Required quantity"), { target: { value: "12.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save requisition" }));

    await waitFor(() => expect(createPurchaseRequisition).toHaveBeenCalledTimes(1));
    expect(createPurchaseRequisition.mock.calls[0][0].lines[0]).toMatchObject({
      itemId: 101,
      orderUomId: 1,
      requiredQuantity: 12.5
    });
  });

  it("creates and approves purchase orders with truthful disabled receiving action", async () => {
    vi.spyOn(apiClient.procurement, "purchaseOrders").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.partners, "suppliers").mockResolvedValue(paged([supplier]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([item] as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([uom]) as never);
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

    fireEvent.click(await screen.findByRole("button", { name: "New PO draft" }));
    expect(await screen.findByText("Purchase order follow-up")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Receive against PO" })).toBeDisabled();
    expect(screen.getByText("PO receiving requires the GRN/receipt workflow, which is not implemented in this V1 procurement slice.")).toBeInTheDocument();

    await screen.findByRole("option", { name: "SUP-INX / Inox Metals" });
    fireEvent.change(screen.getByLabelText("Supplier"), { target: { value: "201" } });
    fireEvent.change(screen.getByLabelText("Item"), { target: { value: "101" } });
    fireEvent.change(screen.getByLabelText("Order UOM"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Ordered quantity"), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "Save purchase order" }));

    await waitFor(() => expect(createPurchaseOrder).toHaveBeenCalledTimes(1));
    expect(createPurchaseOrder.mock.calls[0][0]).toMatchObject({ supplierId: 201 });
  });

  it("creates subcontract outside-processing plans with governed supplier, work-order, and operation selectors", async () => {
    vi.spyOn(apiClient.procurement, "subcontractOrders").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.partners, "suppliers").mockResolvedValue(paged([supplier]) as never);
    vi.spyOn(apiClient.production, "workOrders").mockResolvedValue(paged([
      {
        id: 301,
        companyId: 1,
        branchId: 10,
        workOrderNo: "WO-301",
        salesOrderLineId: null,
        itemId: 101,
        bomRevisionId: 1,
        routingId: 1,
        plannedQuantity: 5,
        productionUomId: 1,
        plannedStartDate: "2026-05-13",
        plannedEndDate: "2026-05-14",
        status: "Released",
        releasedOn: "2026-05-13T08:00:00Z",
        operationCount: 1,
        completedOperationCount: 0
      }
    ]) as never);
    vi.spyOn(apiClient.resources, "operations").mockResolvedValue(paged([
      {
        id: 401,
        companyId: 1,
        operationCode: "OP-COAT",
        operationName: "Powder coating",
        operationType: "Outside",
        defaultWorkCenterId: null,
        defaultSetupMinutes: 0,
        defaultRunMinutesPerUnit: 0,
        defaultTeardownMinutes: 0,
        allowsOverlap: false,
        isOutsideProcessing: true,
        requiresQcCheckpoint: true,
        status: "Active"
      }
    ]) as never);
    const createSubcontractOrder = vi.spyOn(apiClient.procurement, "createSubcontractOrder").mockResolvedValue({
      id: 903,
      companyId: 1,
      branchId: 10,
      subcontractOrderNo: "SUB-DRAFT-SAVED",
      supplierId: 201,
      workOrderId: 301,
      operationId: 401,
      status: "Draft",
      expectedReturnDate: "2026-05-13"
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/procurement/subcontract-plan" element={<SubcontractPlanPage />} />
      </Routes>,
      { route: "/procurement/subcontract-plan", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New outside plan" }));
    expect(await screen.findByText("Subcontract planning controls")).toBeInTheDocument();

    await screen.findByRole("option", { name: "SUP-INX / Inox Metals" });
    fireEvent.change(screen.getByLabelText("Supplier"), { target: { value: "201" } });
    fireEvent.change(screen.getByLabelText("Work order"), { target: { value: "301" } });
    fireEvent.change(screen.getByLabelText("Operation"), { target: { value: "401" } });
    fireEvent.click(screen.getByRole("button", { name: "Save outside plan" }));

    await waitFor(() => expect(createSubcontractOrder).toHaveBeenCalledWith(expect.objectContaining({
      supplierId: 201,
      workOrderId: 301,
      operationId: 401
    })));
  });

  it("does not silently show seeded purchase orders when live procurement data fails", async () => {
    vi.spyOn(apiClient.procurement, "purchaseOrders").mockRejectedValue(new Error("Live purchase order data could not be loaded."));

    renderWithApp(
      <Routes>
        <Route path="/procurement/purchase-orders" element={<PurchaseOrderPage />} />
      </Routes>,
      { route: "/procurement/purchase-orders", session: buildLiveSession() }
    );

    expect(await screen.findByText("Live purchase-order data unavailable")).toBeInTheDocument();
    expect(screen.queryByText("PO-2026-0114")).not.toBeInTheDocument();
  });

  it("opens create workspaces in review mode but keeps save disabled with a reason", async () => {
    renderWithApp(
      <Routes>
        <Route path="/procurement/requisitions" element={<PurchaseRequisitionPage />} />
      </Routes>,
      { route: "/procurement/requisitions" }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New PR draft" }));
    expect(await screen.findByText("Purchase requisition controls")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save requisition" })).toBeDisabled();
    expect(screen.getByText("Purchase requisition save requires a live procurement session.")).toBeInTheDocument();
  });
});
