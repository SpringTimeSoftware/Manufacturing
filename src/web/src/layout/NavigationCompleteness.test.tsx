import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { AuthSessionResponse } from "../api/contracts";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { AppShell } from "./AppShell";
import { navigationItems } from "./navigation";

const implementedProtectedRoutes = [
  "/",
  "/dashboards/order-delivery",
  "/dashboards/stage-wise",
  "/dashboards/executive-cockpit",
  "/engineering/boms",
  "/engineering/bom-editor",
  "/engineering/bom-comparison",
  "/engineering/eco-revisions",
  "/engineering/routings",
  "/engineering/operations",
  "/engineering/alternate-items",
  "/engineering/documents",
  "/production/work-orders",
  "/production/job-cards",
  "/production/machine-board",
  "/production/occupancy",
  "/production/shift-production",
  "/production/downtime",
  "/production/receipts",
  "/production/scrap-by-products",
  "/production/rework-orders",
  "/production/machine-status",
  "/measurements/uom-classes",
  "/measurements/uom-conversions",
  "/measurements/profiles",
  "/masters/item-groups",
  "/masters/item-attributes",
  "/masters/classifications",
  "/masters/reason-codes",
  "/masters/items",
  "/masters/item-variants",
  "/masters/barcodes",
  "/partners/customers",
  "/partners/suppliers",
  "/partners/supplier-lead-times",
  "/commercial/price-lists",
  "/commercial/discount-schemes",
  "/commercial/tax-currency-terms",
  "/platform/attachments",
  "/sales/quotes",
  "/sales/orders",
  "/sales/blanket-orders",
  "/sales/forecasts",
  "/sales/available-to-promise",
  "/planning/workspace",
  "/planning/mps",
  "/planning/mrp",
  "/planning/mrp-results",
  "/planning/boq-requirements",
  "/planning/capacity",
  "/procurement/requisitions",
  "/procurement/rfqs",
  "/procurement/supplier-quotes",
  "/procurement/quote-comparison",
  "/procurement/purchase-orders",
  "/procurement/subcontract-plan",
  "/procurement/vendor-returns",
  "/procurement/landed-cost",
  "/procurement/dashboard",
  "/inventory/balances",
  "/inventory/traceability",
  "/inventory/material-issue",
  "/inventory/material-return",
  "/inventory/stock-transfer",
  "/inventory/cycle-counts",
  "/quality/plans",
  "/quality/incoming-inspections",
  "/quality/in-process-inspections",
  "/quality/final-inspections",
  "/quality/ncr",
  "/quality/coas",
  "/dispatch/pack-lists",
  "/dispatch/planning",
  "/dispatch/shipments",
  "/finance/chart-of-accounts",
  "/finance/fiscal-periods",
  "/finance/posting-profiles",
  "/finance/gl-journals",
  "/finance/ap-invoices",
  "/finance/ar-invoices",
  "/finance/inventory-valuation",
  "/finance/tax-ledger",
  "/finance/boundaries",
  "/platform/users",
  "/platform/roles",
  "/platform/audit-trail",
  "/platform/translations",
  "/platform/workflow-numbering",
  "/platform/extensibility",
  "/platform/settings",
  "/platform/tenant-settings",
  "/platform/runtime-uat",
  "/integrations/providers",
  "/integrations/health",
  "/integrations/webhooks",
  "/integrations/imports",
  "/integrations/exports",
  "/integrations/delivery-logs",
  "/ai/assistant",
  "/ai/translations",
  "/search",
  "/help",
  "/organization/companies",
  "/organization/branches",
  "/organization/departments",
  "/organization/warehouses",
  "/organization/bins",
  "/organization/shifts",
  "/resources/work-centers",
  "/resources/machines",
  "/resources/tools",
  "/platform/context-switch",
  "/platform/notifications",
  "/platform/approvals",
  "/reports/catalog",
  "/reports/parameters",
  "/reports/saved-views",
  "/reports/print-pack"
];

function superAdminSession(): AuthSessionResponse {
  return {
    ...buildDemoSession(),
    user: {
      ...buildDemoSession().user,
      displayName: "Super Admin",
      email: "super.admin@sts.local",
      roles: ["SuperAdmin"]
    }
  };
}

function roleSession(role: AuthSessionResponse["user"]["roles"][number]): AuthSessionResponse {
  return {
    ...buildDemoSession(),
    user: {
      ...buildDemoSession().user,
      roles: [role]
    }
  };
}

function renderShell(session: AuthSessionResponse) {
  return renderWithApp(
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<div>Dashboard content</div>} />
      </Route>
    </Routes>,
    { session }
  );
}

describe("Super Admin navigation completeness", () => {
  it("keeps every implemented protected route discoverable through navigation metadata", () => {
    const navigationPaths = new Set(navigationItems.map((item) => item.path));

    expect(implementedProtectedRoutes.filter((route) => !navigationPaths.has(route))).toEqual([]);
    expect(navigationItems.filter((item) => !implementedProtectedRoutes.includes(item.path))).toEqual([]);
  });

  it("exposes commercial setup and major master/admin routes for Super Admin", async () => {
    renderShell(superAdminSession());

    expect(await screen.findByText("Dashboard content")).toBeInTheDocument();
    expect(screen.getByText("COMMERCIAL SETUP")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Commercial Setup/i }));
    expect(screen.getByRole("link", { name: "Price Lists" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Discount Schemes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tax, Currency & Terms" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Master Data/i }));
    expect(screen.getByRole("link", { name: "Customers" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Suppliers" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Supplier Lead Times" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Item Groups" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Item Attributes" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Platform/i }));
    expect(screen.getByRole("link", { name: "Extensibility" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Platform Settings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tenant Settings" })).toBeInTheDocument();
  });

  it("preserves non-admin menu filtering for commercial setup and platform settings", async () => {
    renderShell(roleSession("StoreKeeper"));

    expect(await screen.findByText("Dashboard content")).toBeInTheDocument();
    expect(screen.queryByText("COMMERCIAL SETUP")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Platform/i }));
    expect(screen.queryByRole("link", { name: "Platform Settings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Tenant Settings" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Inventory/i }));
    expect(screen.getByRole("link", { name: "Inventory Balances" })).toBeInTheDocument();
  });

  it("keeps menu labels business-facing", () => {
    const labels = navigationItems.map((item) => item.label).join(" ");

    expect(labels).not.toMatch(/\bP0\b|React|TypeScript|reference UI|guarded demo|backend reachable|fallback|adapter|mock|seeded fallback|source status|demo shell/i);
  });
});
