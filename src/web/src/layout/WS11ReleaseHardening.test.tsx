import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { navigationItems } from "./navigation";

const releaseCriticalRoutes = [
  "/dashboards/order-delivery",
  "/dashboards/stage-wise",
  "/planning/mrp",
  "/production/machine-board",
  "/inventory/traceability",
  "/finance/chart-of-accounts",
  "/finance/gl-journals",
  "/finance/ar-invoices",
  "/platform/runtime-uat",
  "/platform/audit-trail",
  "/integrations/health",
  "/reports/catalog",
  "/reports/print-pack"
];

const excludedRouteFamilies = /\/(hr|payroll|rma|repair|cmms)(\/|$)/i;

function repoFile(path: string) {
  return readFileSync(resolve(process.cwd(), "../..", path), "utf-8");
}

describe("WS11 final release hardening guard", () => {
  it("keeps release-critical UAT, audit, health, dashboard, list, and report routes discoverable", () => {
    const navPaths = new Set(navigationItems.map((item) => item.path));

    for (const route of releaseCriticalRoutes) {
      expect(navPaths.has(route), `${route} must remain in navigation for final release evidence`).toBe(true);
    }
  });

  it("does not expose excluded V1 route families through final-release navigation", () => {
    const paths = navigationItems.map((item) => item.path).join(" ");

    expect(paths).not.toMatch(excludedRouteFamilies);
  });

  it("keeps deployment, health, and release gate runbooks explicit", () => {
    const iisReadme = repoFile("deploy/iis/README.md");
    const releaseGates = repoFile("docs/final-audit/06_merge_readiness_and_release_gates.md");
    const securityReview = repoFile("docs/security/production-security-hardening-review.md");

    expect(iisReadme).toContain("IIS-ready folder");
    expect(iisReadme).toContain("/api/health/live");
    expect(iisReadme).toContain("/api/health/ready");
    expect(releaseGates).toContain("Before Customer Pilot");
    expect(releaseGates).toContain("Performance smoke");
    expect(securityReview).toContain("Rate limiting");
    expect(securityReview).toContain("Audit trail");
  });
});
