import { readFileSync } from "node:fs";
import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  BomDetailEditorPage,
  EcoRevisionControlPage,
  RoutingLibraryPage
} from "./EngineeringContinuationPages";
import { renderWithApp } from "../test/render";

describe("BOM routing ECO engineering completion", () => {
  it("renders BOM and routing desktop line entry as compact grids", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/bom-editor" element={<BomDetailEditorPage />} />
      </Routes>,
      { route: "/engineering/bom-editor" }
    );

    fireEvent.click(await screen.findByRole("row", { name: "FG-OZ-50 bom editor" }));

    expect(await screen.findByText("BOM edit controls")).toBeInTheDocument();
    expect(screen.getByTestId("bom-component-line-grid")).toHaveAttribute("data-line-entry-pattern", "compact-grid");
    expect(screen.getByTestId("bom-operation-line-grid")).toHaveAttribute("data-line-entry-pattern", "compact-grid");
    expect(screen.getAllByRole("button", { name: "Add Line" }).some((button) => button.hasAttribute("disabled"))).toBe(true);
    expect(screen.getAllByRole("button", { name: "Save draft lines" }).every((button) => button.hasAttribute("disabled"))).toBe(true);
    expect(screen.getAllByText("BOM authoring requires a live signed-in engineering session.").length).toBeGreaterThan(0);

    renderWithApp(
      <Routes>
        <Route path="/engineering/routings" element={<RoutingLibraryPage />} />
      </Routes>,
      { route: "/engineering/routings" }
    );

    fireEvent.click(await screen.findByRole("row", { name: "RT-OZ50-R3 routing" }));

    expect(await screen.findByText("Routing release controls")).toBeInTheDocument();
    expect(screen.getByTestId("routing-operation-line-grid")).toHaveAttribute("data-line-entry-pattern", "compact-grid");
    expect(screen.getByRole("button", { name: "Save routing" })).toBeDisabled();
  });

  it("keeps ECO create and linked-record actions truthful when live workflow is unavailable", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/eco-revisions" element={<EcoRevisionControlPage />} />
      </Routes>,
      { route: "/engineering/eco-revisions" }
    );

    expect(await screen.findByText("ECO / Revision Control")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New ECO" })).toBeDisabled();
    expect(screen.getByText("ECO drafting requires a live signed-in engineering session.")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("row", { name: "ECO-2026-0007 engineering change" }));

    expect(await screen.findByRole("table", { name: "ECO impact lines" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Open linked record" }).every((button) => button.hasAttribute("disabled"))).toBe(true);
    expect(screen.getAllByText("Exact linked-record navigation is enabled after the affected object route is confirmed for this ECO line.").length).toBeGreaterThan(0);
  });

  it("does not contain engineering first-line or card-line editor anti-patterns", () => {
    const pageSource = readFileSync("src/pages/EngineeringContinuationPages.tsx", "utf8");
    const adapterSource = readFileSync("src/engineering/engineeringContinuationAdapters.ts", "utf8");
    const combined = `${pageSource}\n${adapterSource}`;

    expect(combined).toContain("BOM component line grid");
    expect(combined).toContain("BOM operation line grid");
    expect(combined).toContain("Routing operation line grid");
    expect(combined).toContain("ECO affected object line grid");
    expect(combined).not.toMatch(/components\s*\[\s*0\s*\]/);
    expect(combined).not.toMatch(/operations\s*\[\s*0\s*\]/);
    expect(combined).not.toMatch(/\bfirstLine\b/);
    expect(combined).not.toMatch(/bom-component-editor|bom-operation-editor|routing-step-editor/);
    expect(combined).not.toMatch(/<FormShell[^>]*title=\{`?(?:Component|Operation|Affected object)/);
  });
});
