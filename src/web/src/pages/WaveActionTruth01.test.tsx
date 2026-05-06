import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { renderWithApp } from "../test/render";
import { ErpActionBar } from "../ui/ErpComponents";
import { OrderDeliveryDashboardPage } from "./DashboardPages";

describe("Wave ACTION-TRUTH-01 global action reliability", () => {
  it("disables governed action-bar buttons when no real handler is registered", () => {
    const runHandler = vi.fn();

    renderWithApp(
      <ErpActionBar
        primary={[{ label: "Run planning review", onClick: runHandler }]}
        secondary={[{ label: "Export queue" }]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Run planning review" }));

    expect(runHandler).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Export queue" })).toBeDisabled();
    expect(screen.getByText("Action requires an enabled workflow.")).toBeInTheDocument();
  });

  it("keeps dashboard export actions disabled with business-safe reasons", async () => {
    renderWithApp(
      <Routes>
        <Route path="/dashboards/order-delivery" element={<OrderDeliveryDashboardPage />} />
      </Routes>,
      {
        flags: { enablePrintAndExport: true },
        route: "/dashboards/order-delivery"
      }
    );

    expect(await screen.findByText("Order Delivery Dashboard")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "SO-2026-0189 for Enkay Ozone" }));

    const exportButton = await screen.findByRole("button", { name: "Export" });
    expect(exportButton).toBeDisabled();
    expect(exportButton).toHaveAttribute("title", "Dashboard export is pending the approved reporting workflow.");
  });

  it("keeps action labels free of internal implementation wording", () => {
    const pagesRoot = join(process.cwd(), "src", "pages");
    const internalTerms = /(adapter|fallback|mock|source status|React|TypeScript|prompt|Reference view)/i;
    const actionLabelPattern = /(?:label:\s*"([^"]+)"|<Button[^>]*>([^<>{}]+)<\/Button>)/g;
    const violations: string[] = [];

    for (const fileName of readdirSync(pagesRoot).filter((name) => name.endsWith(".tsx"))) {
      const source = readFileSync(join(pagesRoot, fileName), "utf8");
      for (const match of source.matchAll(actionLabelPattern)) {
        const label = (match[1] ?? match[2] ?? "").trim();
        if (internalTerms.test(label)) {
          violations.push(`${fileName}: ${label}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
