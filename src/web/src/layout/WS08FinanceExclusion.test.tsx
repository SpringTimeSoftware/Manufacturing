import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "../pages/NotFoundPage";
import { renderWithApp } from "../test/render";
import { navigationItems } from "./navigation";

const blockedFinancePatterns = [
  /\bFinance\b/i,
  /\bAccounting\b/i,
  /\bGeneral Ledger\b/i,
  /\bGL\b/,
  /\bAP\b/,
  /\bAR\b/,
  /\bAccounts Payable\b/i,
  /\bAccounts Receivable\b/i,
  /\bBank Reconciliation\b/i,
  /\bFinancial Close\b/i
];

describe("WS08 finance/accounting exclusion guard", () => {
  it("does not introduce Finance, Accounting, GL, AP, or AR navigation routes in V1", () => {
    const labelsAndSections = navigationItems.map((item) => `${item.section} ${item.label}`).join(" ");
    const paths = navigationItems.map((item) => item.path).join(" ");

    for (const pattern of blockedFinancePatterns) {
      expect(labelsAndSections).not.toMatch(pattern);
    }

    expect(paths).not.toMatch(/\/(finance|accounting|gl|ap|ar)(\/|$)/i);
  });

  it("keeps finance routes unavailable instead of showing a partial scaffold", async () => {
    renderWithApp(
      <Routes>
        <Route path="/finance" element={<NotFoundPage />} />
      </Routes>,
      { route: "/finance" }
    );

    expect(await screen.findByText("Route not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to login" })).toHaveAttribute("href", "/login");
  });
});
