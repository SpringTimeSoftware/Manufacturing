import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../src/web/src/api/http";
import { buildDemoSession } from "../../../src/web/src/auth/AuthContext";
import { MaterialIssuePage, TraceabilityPage } from "../../../src/web/src/pages/InventoryPages";
import { CycleCountPage } from "../../../src/web/src/pages/OperationsPages";
import { renderWithApp } from "../../../src/web/src/test/render";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-inventory-pack-token",
    refreshToken: "live-inventory-pack-refresh"
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
const warehouse = { id: 301, companyId: 1, branchId: 10, warehouseCode: "MAIN", warehouseName: "Main stores", warehouseType: "Stores", isDefaultReceivingWarehouse: true, isDefaultIssueWarehouse: true, isDispatchEnabled: true, allowsMixedLots: false, allowsNegativeStock: false, status: "Active" };
const binA = { id: 401, companyId: 1, branchId: 10, warehouseId: 301, binCode: "A-01", binName: "Aisle A bin", binType: "Storage", isDefaultReceiveBin: true, isDefaultIssueBin: true, isBlocked: false, capacityQty: 100, countCycleDays: 30, status: "Active" };
const binB = { ...binA, id: 402, binCode: "B-02", binName: "Aisle B bin" };

const stockBalances = [
  {
    id: 501,
    companyId: 1,
    branchId: 10,
    itemId: 101,
    itemVariantId: null,
    warehouseId: 301,
    binId: 401,
    lotId: 9001,
    serialId: null,
    pcidId: 9201,
    onHandQty: 20,
    reservedQty: 0,
    qcHoldQty: 0,
    blockedQty: 0,
    inTransitQty: 0,
    catchWeightQty: null
  },
  {
    id: 502,
    companyId: 1,
    branchId: 10,
    itemId: 102,
    itemVariantId: null,
    warehouseId: 301,
    binId: 402,
    lotId: null,
    serialId: 9102,
    pcidId: 9202,
    onHandQty: 6,
    reservedQty: 0,
    qcHoldQty: 0,
    blockedQty: 0,
    inTransitQty: 0,
    catchWeightQty: null
  }
];

const cycleCount = {
  id: 701,
  companyId: 1,
  branchId: 10,
  warehouseId: 301,
  countNo: "CC-LIVE-0101",
  countDate: "2026-05-15",
  countType: "Cycle",
  status: "Draft",
  remarks: "Rack A count",
  postedOn: null,
  lines: [
    {
      id: 711,
      lineNo: 10,
      itemId: 101,
      itemVariantId: null,
      binId: 401,
      lotId: 9001,
      serialId: null,
      systemQuantity: 20,
      countedQuantity: 19,
      varianceQuantity: -1,
      status: "Variance",
      remarks: "Short one"
    },
    {
      id: 712,
      lineNo: 20,
      itemId: 102,
      itemVariantId: null,
      binId: 402,
      lotId: null,
      serialId: 9102,
      systemQuantity: 6,
      countedQuantity: 6,
      varianceQuantity: 0,
      status: "Matched",
      remarks: "Matched"
    }
  ]
};

function mockInventoryLookups() {
  vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([itemA, itemB] as never);
  vi.spyOn(apiClient.organization, "warehouses").mockResolvedValue(paged([warehouse]) as never);
  vi.spyOn(apiClient.organization, "bins").mockResolvedValue(paged([binA, binB]) as never);
  vi.spyOn(apiClient.inventory, "balances").mockResolvedValue(paged(stockBalances) as never);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Inventory / Warehouse / Traceability completion pack", () => {
  it("opens live stock posting with governed lot, serial, license plate, and multiline controls", async () => {
    mockInventoryLookups();
    vi.spyOn(apiClient.inventory, "transactions").mockResolvedValue(paged([]) as never);
    const issueStock = vi.spyOn(apiClient.inventory, "issueStock").mockResolvedValue([] as never);

    renderWithApp(
      <Routes>
        <Route path="/inventory/material-issue" element={<MaterialIssuePage />} />
      </Routes>,
      { route: "/inventory/material-issue?sourceType=WorkOrder&sourceId=401", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Prepare issue draft" }));
    const grid = await screen.findByTestId("stock-posting-line-grid");
    expect(within(grid).getByLabelText("Lot")).toBeInTheDocument();
    expect(within(grid).getByLabelText("Serial")).toBeInTheDocument();
    expect(within(grid).getByLabelText("License plate / PCID")).not.toBeDisabled();

    fireEvent.click(within(grid).getByRole("button", { name: "Add Line" }));
    fireEvent.click(within(grid).getByRole("button", { name: "Add Line" }));
    expect(within(grid).getByText("3 lines")).toBeInTheDocument();
    fireEvent.click(within(grid).getAllByRole("button", { name: "Remove Line" })[1]);
    expect(within(grid).getByText("2 lines")).toBeInTheDocument();

    const items = within(grid).getAllByLabelText("Item");
    fireEvent.change(items[0], { target: { value: "101" } });
    fireEvent.change(items[1], { target: { value: "102" } });
    within(grid).getAllByLabelText("Source warehouse").forEach((control) => fireEvent.change(control, { target: { value: "301" } }));
    const bins = within(grid).getAllByLabelText("Source bin");
    fireEvent.change(bins[0], { target: { value: "401" } });
    fireEvent.change(bins[1], { target: { value: "402" } });
    fireEvent.change(within(grid).getAllByLabelText("Quantity")[0], { target: { value: "2" } });
    fireEvent.change(within(grid).getAllByLabelText("Quantity")[1], { target: { value: "3" } });
    fireEvent.change(within(grid).getAllByLabelText("Lot")[0], { target: { value: "9001" } });
    fireEvent.change(within(grid).getAllByLabelText("Serial")[1], { target: { value: "9102" } });
    fireEvent.change(within(grid).getAllByLabelText("License plate / PCID")[0], { target: { value: "9201" } });
    fireEvent.change(within(grid).getAllByLabelText("License plate / PCID")[1], { target: { value: "9202" } });

    fireEvent.click(screen.getByRole("button", { name: "Post issue" }));

    await waitFor(() => expect(issueStock).toHaveBeenCalled());
    const [firstIssueLine, secondIssueLine] = issueStock.mock.calls[0][0].lines;
    expect(issueStock.mock.calls[0][0].lines).toHaveLength(2);
    expect(firstIssueLine).toMatchObject({ itemId: 101, fromWarehouseId: 301, fromBinId: 401, lotId: 9001, pcidId: 9201, quantity: 2 });
    expect(secondIssueLine).toMatchObject({ itemId: 102, fromWarehouseId: 301, fromBinId: 402, serialId: 9102, pcidId: 9202, quantity: 3 });
  });

  it("loads traceability from route context instead of ignoring the linked lot or serial", async () => {
    vi.spyOn(apiClient.inventory, "lotTraceability").mockResolvedValue({
      id: 9001,
      companyId: 1,
      itemId: 101,
      lotNo: "LOT-LIVE-9001",
      manufacturedOn: "2026-05-01",
      expiryOn: "2027-05-01",
      lotStatus: "Released",
      catchWeightQty: null,
      balances: [stockBalances[0]],
      transactions: [
        {
          id: 8001,
          companyId: 1,
          branchId: 10,
          transactionNo: "RCPT-8001",
          transactionType: "Receipt",
          postingDate: "2026-05-02",
          itemId: 101,
          itemVariantId: null,
          fromWarehouseId: null,
          fromBinId: null,
          toWarehouseId: 301,
          toBinId: 401,
          lotId: 9001,
          serialId: null,
          quantity: 20,
          catchWeightQty: null,
          inventoryState: "Available",
          sourceDocumentType: "GRN",
          sourceDocumentId: 777,
          remarks: null
        }
      ]
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/inventory/traceability" element={<TraceabilityPage />} />
      </Routes>,
      { route: "/inventory/traceability?trace=LOT-LIVE-9001", session: buildLiveSession() }
    );

    expect(await screen.findByText("LOT-LIVE-9001")).toBeInTheDocument();
    await waitFor(() => expect(apiClient.inventory.lotTraceability).toHaveBeenCalledWith("LOT-LIVE-9001", expect.objectContaining({ search: "LOT-LIVE-9001" })));
  });

  it("edits cycle-count lines in a compact grid with Add Line and Remove Line instead of card-per-line forms", async () => {
    mockInventoryLookups();
    vi.spyOn(apiClient.inventory, "cycleCounts").mockResolvedValue(paged([cycleCount]) as never);
    const updateCycleCount = vi.spyOn(apiClient.inventory, "updateCycleCount").mockResolvedValue(cycleCount as never);

    renderWithApp(
      <Routes>
        <Route path="/inventory/cycle-counts" element={<CycleCountPage />} />
      </Routes>,
      { route: "/inventory/cycle-counts", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByText("CC-LIVE-0101"));
    const grid = await screen.findByTestId("cycle-count-line-grid");
    expect(within(grid).getByText("2 lines")).toBeInTheDocument();
    expect(screen.queryByText("Count line 10")).not.toBeInTheDocument();

    fireEvent.click(within(grid).getByRole("button", { name: "Add Line" }));
    expect(within(grid).getByText("3 lines")).toBeInTheDocument();
    fireEvent.click(within(grid).getAllByRole("button", { name: "Remove Line" })[1]);
    expect(within(grid).getByText("2 lines")).toBeInTheDocument();
    fireEvent.change(within(grid).getAllByLabelText("Counted quantity")[1], { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save count sheet" }));

    await waitFor(() => expect(updateCycleCount).toHaveBeenCalledWith(701, expect.objectContaining({ countNo: "CC-LIVE-0101" })));
    expect(updateCycleCount.mock.calls[0][1].lines).toHaveLength(2);
    expect(updateCycleCount.mock.calls[0][1].lines[1]).toMatchObject({ countedQuantity: 5 });
  });

  it("keeps inventory source free of first-line and desktop card-line anti-patterns", () => {
    const inventorySource = readFileSync(path.join(repoRoot, "src/web/src/pages/InventoryPages.tsx"), "utf8");
    const operationsSource = readFileSync(path.join(repoRoot, "src/web/src/pages/OperationsPages.tsx"), "utf8");
    const combined = `${inventorySource}\n${operationsSource}`;

    expect(combined).not.toMatch(new RegExp("lines\\s*\\[\\s*0\\s*\\]"));
    expect(combined).not.toMatch(new RegExp("\\bfirst" + "Line\\b"));
    expect(combined).not.toMatch(/first stock line/i);
    expect(combined).not.toMatch(/MovementLineCard|TransferLineCard|CountLineCard/);
    expect(combined).not.toMatch(/<FormShell[^>]*title=\{`Count line/);
  });
});
