import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function readSource(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("large work modal and transaction density retrofit", () => {
  it("keeps heavy workspaces wide, viewport-contained, and internally scrollable", () => {
    const css = readSource("src/web/src/styles/base.css");
    const component = readSource("src/web/src/ui/ErpComponents.tsx");

    expect(component).toContain("erp-modal-workspace--work");
    expect(css).toContain("width: min(96vw, 1720px)");
    expect(css).toContain("height: min(94vh, 980px)");
    expect(css).toMatch(/\.erp-modal-workspace \.ui-modal__body\s*\{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/\.erp-modal-workspace__body\s*\{[^}]*overflow:\s*auto/s);
    expect(css).toContain("position: sticky");
  });

  it("uses dense transaction header grids instead of long single-column forms", () => {
    const css = readSource("src/web/src/styles/base.css");
    const commercial = readSource("src/web/src/pages/CommercialPlanningPages.tsx");

    expect(css).toContain(".ui-form-shell__body--transaction-header");
    expect(css).toContain("grid-template-columns: repeat(12, minmax(0, 1fr))");
    expect(commercial).toMatch(/bodyClassName="ui-form-shell__body--transaction-header"/);
    expect(commercial).toMatch(/className="ui-form-shell--dense"/);
  });

  it("keeps desktop line entry as compact grids with one header label per column", () => {
    const css = readSource("src/web/src/styles/base.css");
    const component = readSource("src/web/src/ui/ErpComponents.tsx");
    const commercial = readSource("src/web/src/pages/CommercialPlanningPages.tsx");

    expect(component).toContain("data-line-entry-pattern=\"compact-grid\"");
    expect(component).toContain("column.required");
    expect(css).toMatch(/@media \(min-width:\s*768px\)[\s\S]*\.erp-transaction-line-grid td \.erp-governed-field > span/);
    expect(commercial).toContain("header: \"Item\", required: true");
    expect(commercial).toContain("header: \"Qty\", required: true");
    expect(commercial).not.toMatch(/lines\s*\[\s*0\s*\]/);
    expect(commercial).not.toMatch(/\bfirstLine\b/);
  });
});
