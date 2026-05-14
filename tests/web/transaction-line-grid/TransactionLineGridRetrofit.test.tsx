import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function readSource(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("TRANSACTION-LINE-GRID-STANDARDIZATION-RETROFIT-01", () => {
  it("keeps desktop transaction entry on compact grids instead of repeated line cards", () => {
    const commercial = readSource("src/web/src/pages/CommercialPlanningPages.tsx");
    const procurement = readSource("src/web/src/pages/ProcurementPages.tsx");
    const inventory = readSource("src/web/src/pages/InventoryPages.tsx");
    const production = readSource("src/web/src/pages/ProductionOutputPages.tsx");
    const quality = readSource("src/web/src/pages/QualityPages.tsx");
    const dispatch = readSource("src/web/src/pages/DispatchPages.tsx");
    const combined = [commercial, procurement, inventory, production, quality, dispatch].join("\n");

    [
      "Quote line grid",
      "Sales order line grid",
      "Blanket schedule line grid",
      "Demand forecast line grid",
      "Purchase requisition line grid",
      "RFQ line grid",
      "Supplier quotation line grid",
      "Purchase order line grid",
      "GRN receipt line grid",
      "Supplier invoice match line grid",
      "Stock posting line grid",
      "Production receipt line grid",
      "Inspection result line grid",
      "Pack line grid",
      "Shipment line grid"
    ].forEach((gridLabel) => expect(combined).toContain(gridLabel));

    expect(combined).not.toMatch(/lines\s*\[\s*0\s*\]/);
    expect(combined).not.toMatch(/\bfirstLine\b/);
    expect(combined).not.toMatch(/First\s+quote\s+line/i);
    expect(combined).not.toMatch(/<FormShell[^>]*title=\{`?(?:Line|Schedule|Receipt line|Invoice line)/);
  });
});
