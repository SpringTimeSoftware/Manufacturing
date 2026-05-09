import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthSessionResponse, DashboardFilter, QueryFilter } from "./contracts";
import { buildDemoSession } from "../auth/AuthContext";
import { listPriceLists } from "../commercial/commercialMasterAdapters";
import { listAttachmentViewerSetup, listQuoteSetup } from "../commercial/commercialPlanningAdapters";
import { loadOrderDeliveryDashboard } from "../dashboards/dashboardAdapters";
import { listPackLists } from "../dispatch/dispatchAdapters";
import { listBomLibrarySetup } from "../engineering/engineeringAdapters";
import { listRoutingLibrarySetup } from "../engineering/engineeringContinuationAdapters";
import { listStockTransferPutawaySetup } from "../inventory/inventoryAdapters";
import { listUomClassSetup } from "../masters/masterDataAdapters";
import { listWorkOrderSetup } from "../operations/operationsAdapters";
import { listCompanySetup } from "../organization/organizationAdapters";
import { listMrpRunConsoleSetup } from "../planning/planningAdapters";
import { listUserDirectory } from "../platform/platformAdminAdapters";
import { listPurchaseOrderSetup } from "../procurement/procurementAdapters";
import { listProductionReceipts } from "../production/productionOutputAdapters";
import { listNonConformances } from "../quality/qualityAdapters";

const filter: QueryFilter = {
  page: 1,
  pageSize: 25,
  search: "",
  status: "all"
};

const dashboardFilter: DashboardFilter = {
  companyId: 1,
  branchId: 10,
  search: "",
  status: "all"
};

function liveSession(): AuthSessionResponse {
  return {
    ...buildDemoSession(),
    accessToken: "live-access-token",
    refreshToken: "live-refresh-token"
  };
}

describe("FOUNDATION-ENFORCEMENT-01 live data governance", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps seeded rows available for explicit demo sessions", async () => {
    const rows = await listProductionReceipts(buildDemoSession(), filter);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]?.source).toBe("Seeded");
  });

  it("does not silently fall back to seeded rows in live commercial and sales sessions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));

    await expect(listPriceLists(liveSession(), filter)).rejects.toThrow("Commercial setup live data could not be loaded");
    await expect(listAttachmentViewerSetup(liveSession(), filter)).rejects.toThrow("Attachment viewer live data could not be loaded");
    await expect(listQuoteSetup(liveSession(), filter)).rejects.toThrow("Quote live data could not be loaded");
  });

  it("does not silently fall back to seeded rows in live production, inventory, quality, or dispatch sessions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));

    await expect(listWorkOrderSetup(liveSession(), filter)).rejects.toThrow("Work order live data could not be loaded");
    await expect(listProductionReceipts(liveSession(), filter)).rejects.toThrow("Production receipt live data could not be loaded");
    await expect(listStockTransferPutawaySetup(liveSession(), filter)).rejects.toThrow("Stock transfer and putaway live data could not be loaded");
    await expect(listNonConformances(liveSession(), filter)).rejects.toThrow("NCR live data could not be loaded");
    await expect(listPackLists(liveSession(), filter)).rejects.toThrow("Pack list live data could not be loaded");
  });

  it("does not silently fall back to seeded rows in live master, engineering, planning, procurement, or admin sessions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));

    await expect(listUomClassSetup(liveSession(), filter)).rejects.toThrow("UOM class live data could not be loaded");
    await expect(listCompanySetup(liveSession(), filter)).rejects.toThrow("Company live data could not be loaded");
    await expect(listBomLibrarySetup(liveSession(), filter)).rejects.toThrow("BOM library live data could not be loaded");
    await expect(listRoutingLibrarySetup(liveSession(), filter)).rejects.toThrow("Routing live data could not be loaded");
    await expect(listMrpRunConsoleSetup(liveSession(), filter)).rejects.toThrow("MRP run live data could not be loaded");
    await expect(listPurchaseOrderSetup(liveSession(), filter)).rejects.toThrow("Purchase order live data could not be loaded");
    await expect(listUserDirectory(liveSession())).rejects.toThrow("User directory live data could not be loaded");
  });

  it("does not silently fall back to seeded dashboard data in live sessions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));

    await expect(loadOrderDeliveryDashboard(liveSession(), dashboardFilter)).rejects.toThrow("Order delivery dashboard live data could not be loaded");
  });
});
