import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes, useLocation } from "react-router-dom";
import { apiClient } from "../api/http";
import { buildDemoSession } from "../auth/AuthContext";
import { storeSession } from "../auth/authStorage";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { seededNotifications } from "../notifications/NotificationProvider";
import { DashboardHomePage } from "../pages/DashboardPages";
import { seededApprovalItems } from "../platform/platformAdapters";
import { renderWithApp } from "../test/render";
import { AppShell } from "./AppShell";
import { ApprovalWorkbenchPage, NotificationInboxPage } from "../pages/PlatformPages";

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

function LocationProbe({ label }: { label: string }) {
  const location = useLocation();

  return <div>{`${label} ${location.pathname}${location.search}`}</div>;
}

describe("NAVIGATION-AND-NOTIFICATION-TRUTH-01", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("renders nested navigation parents and differentiated master-data icons", async () => {
    const session = buildDemoSession();
    session.user.roles = ["SuperAdmin"] as typeof session.user.roles;

    renderWithApp(
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div>Dashboard content</div>} />
        </Route>
      </Routes>,
      { session }
    );

    expect(await screen.findByText("Dashboard content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Organization/i }));
    const organizationSection = screen.getByRole("button", { name: /Organization/i }).closest("section");
    expect(organizationSection).not.toBeNull();
    const organizationNav = within(organizationSection as HTMLElement);
    expect(organizationNav.getByText("Company Structure")).toBeInTheDocument();
    expect(organizationNav.getByText("Resource Setup")).toBeInTheDocument();
    ["Companies", "Branches", "Departments", "Warehouses", "Bins", "Shift Calendar", "Work Centers", "Machines", "Tools / Resources"].forEach((label) => {
      expect(organizationNav.getByRole("link", { name: label })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Master Data/i }));
    const masterDataSection = screen.getByRole("button", { name: /Master Data/i }).closest("section");
    expect(masterDataSection).not.toBeNull();
    const masterDataNav = within(masterDataSection as HTMLElement);

    ["Units and Measurement", "Item Foundation", "Business Partners"].forEach((parent) => {
      expect(masterDataNav.getByText(parent)).toBeInTheDocument();
    });
    expect(masterDataNav.queryByText("Company Structure")).not.toBeInTheDocument();
    expect(masterDataNav.queryByRole("link", { name: "Companies" })).not.toBeInTheDocument();

    const expectedIcons = [
      ["UOM Classes", "uomClass"],
      ["UOM Conversions", "uomConversion"],
      ["Measurement Profiles", "measurementProfile"],
      ["Item Groups", "itemGroup"],
      ["Item Attributes", "itemAttribute"],
      ["Classifications", "classification"],
      ["Reason Codes", "reasonCode"],
      ["Items", "item"],
      ["Item Variants", "itemVariant"],
      ["Barcodes", "barcode"],
      ["Customers", "customer"],
      ["Suppliers", "supplier"],
      ["Supplier Lead Times", "leadTime"]
    ] as const;

    const iconNames = expectedIcons.map(([label, icon]) => {
      const link = masterDataNav.getByRole("link", { name: label });
      expect(link).toHaveAttribute("data-nav-parent");
      expect(link.querySelector(`[data-nav-icon="${icon}"]`)).toBeInTheDocument();
      return icon;
    });

    expect(new Set(iconNames).size).toBe(iconNames.length);

    fireEvent.click(screen.getByRole("button", { name: /Engineering & Production/i }));
    expect(screen.getByRole("link", { name: "Production Receipt" }).querySelector('[data-nav-icon="receipt"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scrap / By-product" }).querySelector('[data-nav-icon="scrap"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Platform/i }));
    expect(screen.getByRole("link", { name: "Platform Settings" }).querySelector('[data-nav-icon="platform"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tenant Settings" }).querySelector('[data-nav-icon="tenant"]')).toBeInTheDocument();
  });

  it("removes duplicate role, company-branch, and unread summary clutter from the shared header", async () => {
    renderWithApp(
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div>Dashboard content</div>} />
        </Route>
      </Routes>
    );

    expect(await screen.findByText("Dashboard content")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toHaveDisplayValue("STS Precision Fabricators");
    expect(screen.getByLabelText("Branch")).toHaveDisplayValue("Main Fabrication Plant");
    expect(screen.getByRole("button", { name: /Notifications/i })).toBeInTheDocument();
    expect(screen.queryByText(/Unread notifications/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PlanningManager/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/STS Precision Fabricators - Main Fabrication Plant/i)).not.toBeInTheDocument();
  });

  it("hides seeded-shaped notification rows returned to a live session", async () => {
    const liveSession = buildLiveSession();
    vi.spyOn(apiClient.notifications, "list").mockResolvedValue(seededNotifications);

    renderWithApp(
      <Routes>
        <Route path="/platform/notifications" element={<NotificationInboxPage />} />
      </Routes>,
      { route: "/platform/notifications", session: liveSession }
    );

    expect(await screen.findByText("Notification inbox unavailable")).toBeInTheDocument();
    expect(screen.getByText(/non-live operating alerts/i)).toBeInTheDocument();
    expect(screen.queryByText("Work order release still blocked")).not.toBeInTheDocument();
  });

  it("hides seeded-shaped approval rows returned to a live session", async () => {
    const liveSession = buildLiveSession();
    storeSession(liveSession);
    vi.spyOn(apiClient.approvals, "list").mockResolvedValue(seededApprovalItems);

    renderWithApp(
      <Routes>
        <Route path="/platform/approvals" element={<ApprovalWorkbenchPage />} />
      </Routes>,
      { route: "/platform/approvals", session: liveSession }
    );

    expect(await screen.findByText("Approval queue unavailable")).toBeInTheDocument();
    expect(screen.getByText(/non-live operating rows/i)).toBeInTheDocument();
    expect(screen.queryByText("Approve revised ozone tank BOM")).not.toBeInTheDocument();
  });

  it("uses record-specific notification links and disables unsupported notification links with a visible reason", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/notifications" element={<NotificationInboxPage />} />
        <Route path="/platform/approvals" element={<LocationProbe label="approval target" />} />
      </Routes>,
      { route: "/platform/notifications" }
    );

    expect((await screen.findAllByText("Work order release still blocked")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Open approval" }));
    expect(await screen.findByText("approval target /platform/approvals?approval=approval-wo-release")).toBeInTheDocument();

    renderWithApp(<NotificationCenter />, { notifications: [seededNotifications[2]] });
    const stageButton = screen.getByRole("button", { name: "Open stage board" });
    expect(stageButton).toBeDisabled();
    expect(screen.getByText(/Stage-board deep links for this sales order are not enabled/i)).toBeInTheDocument();
  });

  it("selects approval deep links and disables unsupported approval target records with reasons", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/approvals" element={<ApprovalWorkbenchPage />} />
        <Route path="/production/work-orders" element={<LocationProbe label="work order target" />} />
      </Routes>,
      { route: "/platform/approvals?approval=approval-wo-release" }
    );

    expect(await screen.findByRole("dialog", { name: "WO-2026-044" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open linked record" }));
    expect(await screen.findByText("work order target /production/work-orders?workOrder=WO-2026-044")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/platform/approvals" element={<ApprovalWorkbenchPage />} />
      </Routes>,
      { route: "/platform/approvals?approval=approval-bom-r4" }
    );

    const bomDialog = await screen.findByRole("dialog", { name: "BOM-FG-OZ-50 / R4" });
    const disabledLink = within(bomDialog).getByRole("button", { name: "Open linked record" });
    expect(disabledLink).toBeDisabled();
    expect(within(bomDialog).getByText(/BOM revision deep links are not enabled/i)).toBeInTheDocument();
  });

  it("routes dashboard blockers and dispatch approvals with record-specific context", async () => {
    renderWithApp(
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<DashboardHomePage />} />
        </Route>
        <Route path="/dashboards/order-delivery" element={<LocationProbe label="order target" />} />
      </Routes>
    );

    expect(await screen.findByText("Delivery risk")).toBeInTheDocument();
    fireEvent.click((await screen.findAllByRole("button", { name: "Open workspace" }))[0]);
    expect(await screen.findByText("order target /dashboards/order-delivery?order=SO-2026-0189")).toBeInTheDocument();

    cleanup();

    renderWithApp(
      <Routes>
        <Route path="/platform/approvals" element={<ApprovalWorkbenchPage />} />
        <Route path="/dispatch/pack-lists" element={<LocationProbe label="pack target" />} />
      </Routes>,
      { route: "/platform/approvals?approval=approval-dispatch-release" }
    );

    expect(await screen.findByRole("dialog", { name: "PACK-2026-0042 / SO-2026-0189" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open linked record" }));
    expect(await screen.findByText("pack target /dispatch/pack-lists?packList=PACK-2026-0042")).toBeInTheDocument();
  });
});
