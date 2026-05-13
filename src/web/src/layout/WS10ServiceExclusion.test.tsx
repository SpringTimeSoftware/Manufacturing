import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "../pages/NotFoundPage";
import { renderWithApp } from "../test/render";
import { navigationItems } from "./navigation";

const blockedServicePatterns = [
  /\bService\b/i,
  /\bWarranty\b/i,
  /\bAMC\b/,
  /\bRMA\b/,
  /\bRepair\b/i,
  /\bCustomer Support\b/i
];

describe("WS10 service/warranty/AMC exclusion guard", () => {
  it("does not introduce service, warranty, AMC, RMA, or repair navigation routes in V1", () => {
    const labelsAndSections = navigationItems.map((item) => `${item.section} ${item.label}`).join(" ");
    const paths = navigationItems.map((item) => item.path).join(" ");

    for (const pattern of blockedServicePatterns) {
      expect(labelsAndSections).not.toMatch(pattern);
    }

    expect(paths).not.toMatch(/\/(service|warranty|amc|rma|repair)(\/|$)/i);
  });

  it("keeps service routes unavailable instead of showing a partial scaffold", async () => {
    renderWithApp(
      <Routes>
        <Route path="/service" element={<NotFoundPage />} />
      </Routes>,
      { route: "/service" }
    );

    expect(await screen.findByText("Route not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to login" })).toHaveAttribute("href", "/login");
  });
});
