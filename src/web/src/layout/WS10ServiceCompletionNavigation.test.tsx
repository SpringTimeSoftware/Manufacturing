import { describe, expect, it } from "vitest";
import { navigationItems } from "./navigation";

describe("Pack 11 service/warranty/AMC navigation", () => {
  it("exposes real service foundation routes instead of the former V1 exclusion", () => {
    const servicePaths = navigationItems
      .filter((item) => item.section === "Service")
      .map((item) => item.path)
      .sort();

    expect(servicePaths).toEqual([
      "/service/charges",
      "/service/contracts",
      "/service/dashboard",
      "/service/installed-assets",
      "/service/reports",
      "/service/spares",
      "/service/tickets",
      "/service/visits",
      "/service/warranty-claims",
      "/service/warranty-policies"
    ]);
  });

  it("keeps RMA/repair-only paths out until a dedicated return/repair flow is implemented", () => {
    const paths = navigationItems.map((item) => item.path).join(" ");

    expect(paths).not.toMatch(/\/service\/(rma|repair)(\/|$)/i);
  });
});
