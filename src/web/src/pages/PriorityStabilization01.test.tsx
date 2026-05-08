import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { storeSession } from "../auth/authStorage";
import { AppShell } from "../layout/AppShell";
import { renderWithApp } from "../test/render";
import { PriceListMasterPage } from "./CommercialMasterPages";
import { QuoteEstimateListPage } from "./CommercialPlanningPages";
import { CapacityPlanningBoardPage } from "./PlanningContinuationPages";
import { ApprovalWorkbenchPage, NotificationInboxPage } from "./PlatformPages";

function buildLiveSession() {
  const session = buildDemoSession();

  return {
    ...session,
    accessToken: "live-access-token",
    refreshToken: "live-refresh-token",
    user: {
      ...session.user,
      roles: ["PlatformAdmin", "CompanyAdmin", "PlanningManager", "PlantHead"] as typeof session.user.roles
    }
  };
}

describe("PRIORITY-STABILIZATION-01 live data and usability gates", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not show seeded notifications when the live notification load fails", async () => {
    const liveSession = buildLiveSession();
    storeSession(liveSession);

    renderWithApp(
      <Routes>
        <Route path="/platform/notifications" element={<NotificationInboxPage />} />
      </Routes>,
      { route: "/platform/notifications", session: liveSession }
    );

    expect(await screen.findByText("Notification inbox unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Work order release still blocked")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark all as read" })).toBeDisabled();
    expect(document.body.textContent ?? "").not.toMatch(/seeded|fallback|mock|scaffold/i);
  });

  it("does not show seeded approvals when the live approval load fails", async () => {
    const liveSession = buildLiveSession();
    storeSession(liveSession);

    renderWithApp(
      <Routes>
        <Route path="/platform/approvals" element={<ApprovalWorkbenchPage />} />
      </Routes>,
      { route: "/platform/approvals", session: liveSession }
    );

    expect(await screen.findByText("Approval queue unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Approve revised ozone tank BOM")).not.toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toMatch(/seeded|fallback|mock|scaffold/i);
  });

  it("keeps high-visibility draft and save actions truthful", async () => {
    renderWithApp(
      <Routes>
        <Route path="/sales/quotes" element={<QuoteEstimateListPage />} />
      </Routes>,
      { route: "/sales/quotes" }
    );

    expect(await screen.findByText("Estimate / Quote List")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New quote draft" })).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "New quote draft" }));
    const quoteDialog = await screen.findByRole("dialog", { name: "New quote draft" });
    expect(within(quoteDialog).getByRole("button", { name: "Save quote draft" })).toBeDisabled();
    expect(within(quoteDialog).getByText("Live workspace sign-in is required before saving quote drafts.")).toBeInTheDocument();

    renderWithApp(<PriceListMasterPage />);
    expect(await screen.findByRole("heading", { name: "Price Lists" })).toBeInTheDocument();
    await screen.findByTestId("price-list-grid");
    expect(screen.getByRole("button", { name: "New price list" })).not.toBeDisabled();
  });

  it("saves a live quote draft through the quote API", async () => {
    const liveSession = buildLiveSession();
    const emptyPage = { items: [], page: 1, pageSize: 25, totalCount: 0, totalPages: 0 };
    vi.spyOn(apiClient.salesPlanning, "quotes").mockResolvedValue(emptyPage);
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
          paymentTermsCode: null,
          creditDays: 30,
          status: "Active"
        }
      ]
    });
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue([
      { id: 301, itemCode: "FG-301", itemName: "Finished Item", itemType: "FinishedGood", status: "Active" }
    ]);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue({
      ...emptyPage,
      items: [
        {
          id: 41,
          uomCode: "PCS",
          uomName: "Pieces",
          symbol: "pcs",
          uomClassId: 4,
          decimalPrecision: 0,
          isSystemBase: false,
          status: "Active"
        }
      ]
    });
    const createQuote = vi.spyOn(apiClient.salesPlanning, "createQuote").mockResolvedValue({
      id: 9001,
      companyId: 1,
      branchId: 10,
      quoteNo: "QT-DRAFT-TEST",
      customerId: 501,
      customerAddressId: null,
      quoteDate: "2026-05-08",
      expiryDate: "2026-06-07",
      priorityCode: "Medium",
      status: "Draft",
      customerSpecRef: "",
      lines: [
        {
          id: 1,
          lineNo: 10,
          itemId: 301,
          itemVariantId: null,
          orderUomId: 41,
          quantity: 2,
          makeType: "Make",
          promisedDate: "2026-05-22",
          priorityCode: "Medium",
          customerSpecRef: "",
          status: "Draft"
        }
      ]
    });

    renderWithApp(
      <Routes>
        <Route path="/sales/quotes" element={<QuoteEstimateListPage />} />
      </Routes>,
      { route: "/sales/quotes", session: liveSession }
    );

    expect(await screen.findByText("Estimate / Quote List")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New quote draft" }));
    const quoteDialog = await screen.findByRole("dialog", { name: "New quote draft" });
    await waitFor(() => expect(within(quoteDialog).getByLabelText("Customer")).not.toBeDisabled());

    fireEvent.change(within(quoteDialog).getByLabelText("Customer"), { target: { value: "501" } });
    fireEvent.change(within(quoteDialog).getByLabelText("Item"), { target: { value: "301" } });
    fireEvent.change(within(quoteDialog).getByLabelText("Order UOM"), { target: { value: "41" } });
    fireEvent.change(within(quoteDialog).getByLabelText("Quantity"), { target: { value: "2" } });
    fireEvent.click(within(quoteDialog).getByRole("button", { name: "Save quote draft" }));

    await waitFor(() => expect(createQuote).toHaveBeenCalledTimes(1));
    expect(createQuote.mock.calls[0][0]).toMatchObject({
      companyId: 1,
      branchId: 10,
      customerId: 501,
      status: "Draft",
      lines: [
        expect.objectContaining({
          itemId: 301,
          orderUomId: 41,
          quantity: 2
        })
      ]
    });
  });

  it("renders capacity and modal scroll containers for large workspaces", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/capacity" element={<CapacityPlanningBoardPage />} />
      </Routes>,
      { route: "/planning/capacity" }
    );

    expect(await screen.findByTestId("capacity-board-scroll")).toBeInTheDocument();

    const css = readFileSync(join(process.cwd(), "src", "styles", "base.css"), "utf8");
    expect(css).toMatch(/\.capacity-board-scroll\s*{[^}]*overflow:\s*auto/s);
    expect(css).toMatch(/\.erp-modal-workspace\s*{[^}]*max-height:/s);
  });

  it("renders sidebar submenu entries as child links with differentiated platform icons", async () => {
    const session = buildDemoSession();
    session.user.roles = ["PlatformAdmin", "CompanyAdmin", "PlanningManager", "PlantHead"] as typeof session.user.roles;

    renderWithApp(
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div>Home content</div>} />
        </Route>
      </Routes>,
      { route: "/", session }
    );

    const notificationsLink = screen.getByRole("link", { name: /Notifications/i });
    expect(notificationsLink).toHaveClass("app-shell__nav-link--child");
    expect(within(notificationsLink).getByText("Notifications")).toBeInTheDocument();
    expect(notificationsLink.querySelector('[data-nav-icon="bell"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Approvals/i }).querySelector('[data-nav-icon="approval"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Users/i }).querySelector('[data-nav-icon="users"]')).toBeInTheDocument();
  });
});
