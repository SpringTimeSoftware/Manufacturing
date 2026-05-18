import { describe, expect, it } from "vitest";
import { navigationItems } from "./navigation";

const requiredFinanceRoutes = [
  "/finance/chart-of-accounts",
  "/finance/fiscal-periods",
  "/finance/posting-profiles",
  "/finance/gl-journals",
  "/finance/ap-invoices",
  "/finance/ar-invoices",
  "/finance/inventory-valuation",
  "/finance/tax-ledger"
];

describe("Pack 06 finance/accounting navigation guard", () => {
  it("exposes governed Finance, GL, AP, AR, valuation, and tax ledger routes", () => {
    const paths = new Set(navigationItems.map((item) => item.path));
    for (const route of requiredFinanceRoutes) {
      expect(paths.has(route), `${route} must remain discoverable after Pack 06`).toBe(true);
    }
  });

  it("keeps unrelated excluded route families out of V1 navigation", () => {
    const paths = navigationItems.map((item) => item.path).join(" ");

    expect(paths).not.toMatch(/\/(hr|payroll)(\/|$)/i);
  });
});
