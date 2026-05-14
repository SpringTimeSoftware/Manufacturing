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

const warehouse = {
  id: 301,
  companyId: 1,
  branchId: 10,
  warehouseCode: "MAIN",
  warehouseName: "Main stores",
  warehouseType: "Stores",
  isDefaultReceivingWarehouse: true,
  isDefaultIssueWarehouse: true,
  isDispatchEnabled: true,
  allowsMixedLots: false,
  allowsNegativeStock: false,
  status: "Active"
};

const savedPurchaseOrder = {
  id: 902,
  companyId: 1,
  branchId: 10,
  purchaseOrderNo: "PO-DRAFT-SAVED",
  supplierId: 201,
  orderAddressId: null,
  status: "Approved",
  expectedReceiptDate: "2026-05-13",
  lines: [
    {
      id: 90210,
      lineNo: 10,
      itemId: 101,
      purchaseRequisitionLineId: null,
      orderedQuantity: 7,
      unitPrice: 125,
      discountPercent: 2,
      discountAmount: 17.5,
      taxPercent: 18,
      taxAmount: 151.2,
      lineAmount: 973.7,
      orderUomId: 1,
      expectedDate: "2026-05-13",
      linkedWorkOrderId: null,
      sourceBoqRequirementLineId: null,
      status: "Approved"
    }
  ]
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

  it("creates purchase orders with a truthful draft receiving guard", async () => {
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
    expect(screen.getByText("Open a saved purchase order before receiving.")).toBeInTheDocument();

    await screen.findByRole("option", { name: "SUP-INX / Inox Metals" });
    fireEvent.change(screen.getByLabelText("Supplier"), { target: { value: "201" } });
    fireEvent.change(screen.getByLabelText("Item"), { target: { value: "101" } });
    fireEvent.change(screen.getByLabelText("Order UOM"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Ordered quantity"), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "Save purchase order" }));

    await waitFor(() => expect(createPurchaseOrder).toHaveBeenCalledTimes(1));
    expect(createPurchaseOrder.mock.calls[0][0]).toMatchObject({ supplierId: 201 });
  });

  it("opens the GRN, supplier invoice, match, and AP workspace for a saved purchase order", async () => {
    vi.spyOn(apiClient.procurement, "purchaseOrders").mockResolvedValue(paged([savedPurchaseOrder]) as never);
    vi.spyOn(apiClient.partners, "suppliers").mockResolvedValue(paged([supplier]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([item] as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged([uom]) as never);
    vi.spyOn(apiClient.organization, "warehouses").mockResolvedValue(paged([warehouse]) as never);

    renderWithApp(
      <Routes>
        <Route path="/procurement/purchase-orders" element={<PurchaseOrderPage />} />
      </Routes>,
      { route: "/procurement/purchase-orders", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("row", { name: "PO-DRAFT-SAVED purchase order" }));
    fireEvent.click(await screen.findByRole("button", { name: "Receive against PO" }));

    expect(await screen.findByRole("dialog", { name: "Receive PO-DRAFT-SAVED" })).toBeInTheDocument();
    expect(screen.getByText("Goods receipt")).toBeInTheDocument();
    expect(screen.getByText("Supplier invoice and AP")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save GRN" })).toBeDisabled();
    expect(screen.getByText("Resolve GRN validation issues before saving.")).toBeInTheDocument();
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

  it("posts subcontract receive-back with quantity and QC result", async () => {
    vi.spyOn(apiClient.procurement, "subcontractOrders").mockResolvedValue(paged([
      {
        id: 904,
        companyId: 1,
        branchId: 10,
        subcontractOrderNo: "SUB-RECV-1",
        supplierId: 201,
        workOrderId: 301,
        operationId: 401,
        status: "Approved",
        expectedReturnDate: "2026-05-16"
      }
    ]) as never);
    vi.spyOn(apiClient.partners, "suppliers").mockResolvedValue(paged([supplier]) as never);
    vi.spyOn(apiClient.production, "workOrders").mockResolvedValue(paged([]) as never);
    vi.spyOn(apiClient.resources, "operations").mockResolvedValue(paged([]) as never);
    const createReceipt = vi.spyOn(apiClient.procurement, "createSubcontractReceipt").mockResolvedValue({
      id: 905,
      companyId: 1,
      branchId: 10,
      receiptNo: "SUB-RCV-SAVED",
      subcontractOrderId: 904,
      receiptDate: "2026-05-14",
      receivedQuantity: 3,
      acceptedQuantity: 2,
      rejectedQuantity: 1,
      qcStatus: "Partial",
      status: "Received",
      remarks: "Received with one rejection"
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/procurement/subcontract-plan" element={<SubcontractPlanPage />} />
      </Routes>,
      { route: "/procurement/subcontract-plan", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("row", { name: "SUB-RECV-1 subcontract plan" }));
    fireEvent.click(await screen.findByRole("button", { name: "Receive back" }));
    expect(await screen.findByText("Subcontract receive-back")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Received quantity"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Accepted quantity"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Rejected quantity"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("QC status"), { target: { value: "Partial" } });
    fireEvent.click(screen.getByRole("button", { name: "Save receive-back" }));

    await waitFor(() => expect(createReceipt).toHaveBeenCalledWith(expect.objectContaining({
      subcontractOrderId: 904,
      receivedQuantity: 3,
      acceptedQuantity: 2,
      rejectedQuantity: 1,
      qcStatus: "Partial"
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
