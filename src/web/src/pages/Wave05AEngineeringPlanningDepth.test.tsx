import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { BomLibraryPage } from "./EngineeringPages";
import { BomDetailEditorPage, EcoRevisionControlPage, RoutingLibraryPage } from "./EngineeringContinuationPages";
import { BoqRequirementsPage, MrpRunConsolePage } from "./PlanningPages";
import { CapacityPlanningBoardPage } from "./PlanningContinuationPages";
import { MpsPlannerPage } from "./CommercialPlanningPages";
import { renderWithApp } from "../test/render";

const internalTerms = /Workspace data|Setup planned|governed setup|internal only|source status|fallback|adapter|mock|seeded fallback/i;

describe("Wave 5A engineering and planning depth", () => {
  it("keeps BOM library governed and blocks non-live revision actions with business wording", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/boms" element={<BomLibraryPage />} />
      </Routes>,
      { route: "/engineering/boms" }
    );

    expect((await screen.findAllByText("BOM Library")).length).toBeGreaterThan(0);
    expect(screen.getByTestId("bom-library-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("bom-library-grid")).toHaveClass("erp-grid");

    fireEvent.click(await screen.findByRole("row", { name: "FG-OZ-50 bom" }));

    expect(await screen.findByText("BOM metadata editor")).toBeInTheDocument();
    expect(screen.getByLabelText("Parent item")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Approve revision" })).toBeDisabled();
    expect(screen.getByText("Approval is available after the BOM is loaded from the live engineering register.")).toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toMatch(internalTerms);
  });

  it("renders BOM detail and ECO lifecycle workspaces with controlled actions", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/bom-editor" element={<BomDetailEditorPage />} />
      </Routes>,
      { route: "/engineering/bom-editor" }
    );

    expect(await screen.findByText("BOM Detail / Editor")).toBeInTheDocument();
    expect(screen.getByTestId("bom-editor-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("bom-editor-grid")).toHaveClass("erp-grid");

    fireEvent.click(await screen.findByRole("row", { name: "FG-OZ-50 bom editor" }));

    expect(await screen.findByText("BOM edit controls")).toBeInTheDocument();
    expect(screen.getByLabelText("Parent item")).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Clone revision" }).every((button) => button.hasAttribute("disabled"))).toBe(true);

    renderWithApp(
      <Routes>
        <Route path="/engineering/eco-revisions" element={<EcoRevisionControlPage />} />
      </Routes>,
      { route: "/engineering/eco-revisions" }
    );

    expect(await screen.findByText("ECO / Revision Control")).toBeInTheDocument();
    expect(screen.getByTestId("eco-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("eco-grid")).toHaveClass("erp-grid");

    fireEvent.click(await screen.findByRole("row", { name: "ECO-2026-0007 engineering change" }));

    expect(screen.getByRole("table", { name: "ECO impact lines" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve ECO" })).toBeDisabled();
    expect(screen.getAllByText("Approval is available for live submitted ECOs.").length).toBeGreaterThan(0);
    expect(document.body.textContent ?? "").not.toMatch(internalTerms);
  });

  it("opens routing and capacity centered workspaces with lookup-backed controlled fields", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/routings" element={<RoutingLibraryPage />} />
      </Routes>,
      { route: "/engineering/routings" }
    );

    expect(await screen.findByText("Routing Library")).toBeInTheDocument();
    expect(screen.getByTestId("routing-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("routing-grid")).toHaveClass("erp-grid");

    fireEvent.click(await screen.findByRole("row", { name: "RT-OZ50-R3 routing" }));

    expect(await screen.findByText("Routing release controls")).toBeInTheDocument();
    expect(screen.getByLabelText("Output item")).toBeDisabled();
    expect(screen.getByTestId("routing-step-editor")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/planning/capacity" element={<CapacityPlanningBoardPage />} />
      </Routes>,
      { route: "/planning/capacity" }
    );

    expect(await screen.findByText("Capacity Planning Board")).toBeInTheDocument();
    expect(screen.getByTestId("capacity-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("capacity-grid")).toHaveClass("erp-grid");

    fireEvent.click(await screen.findByRole("row", { name: "CNC Cell A 2026-03-04 capacity bucket" }));

    expect(await screen.findByText("Capacity review controls")).toBeInTheDocument();
    expect(screen.getByLabelText("Machine")).toBeDisabled();
    expect(screen.getByLabelText("Planned order")).toBeDisabled();
    const reviewButtons = screen.getAllByRole("button", { name: "Review overloads" });
    expect(reviewButtons.some((button) => !button.hasAttribute("disabled"))).toBe(true);
    expect(reviewButtons.some((button) => button.getAttribute("title") === "Current bucket is already the active overload review.")).toBe(true);
  });

  it("keeps planning conversion actions honest and lookup-controlled", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/mrp" element={<MrpRunConsolePage />} />
      </Routes>,
      { route: "/planning/mrp" }
    );

    expect(await screen.findByText("MRP Run Console")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run MRP draft" })).toHaveAttribute("title", "MRP launch requires a live signed-in planning session.");
    fireEvent.click(await screen.findByRole("row", { name: "MRP-2026-03-01 mrp run" }));
    expect(await screen.findByText("MRP run parameters")).toBeInTheDocument();
    expect(screen.getByLabelText("Triggered from")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save run parameters" })).toBeDisabled();

    renderWithApp(
      <Routes>
        <Route path="/planning/boq-requirements" element={<BoqRequirementsPage />} />
      </Routes>,
      { route: "/planning/boq-requirements" }
    );

    expect(await screen.findByText("BOQ / Requirements")).toBeInTheDocument();
    expect(screen.getByTestId("boq-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("boq-header-grid")).toHaveClass("erp-grid");
    expect(screen.getByRole("button", { name: "Convert selected line" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Convert reviewed lines" })).toHaveAttribute("title", "Select a BOQ before converting reviewed lines.");

    fireEvent.click(await screen.findByRole("row", { name: "SO-2026-0189 boq requirement" }));
    expect(await screen.findByText("Action override controls")).toBeInTheDocument();
    expect(screen.getByLabelText("MRP run")).toBeDisabled();
    fireEvent.click(await screen.findByRole("row", { name: "RM-SS-SHEET / Stainless Steel Sheet boq requirement line" }));
    expect(screen.getByLabelText("Selected item")).toBeDisabled();
    expect(screen.getAllByText("Line approval is available for live BOQ lines that are not converted.").length).toBeGreaterThan(0);
  });

  it("uses governed MPS planning controls without internal copy", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/mps" element={<MpsPlannerPage />} />
      </Routes>,
      { route: "/planning/mps" }
    );

    expect(await screen.findByText("MPS Planner")).toBeInTheDocument();
    expect(screen.getByTestId("mps-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("mps-grid")).toHaveClass("erp-grid");

    fireEvent.click(await screen.findByRole("row", { name: "MPS-2026-M03 mps" }));
    expect(await screen.findByText("MPS setup")).toBeInTheDocument();
    expect(screen.getByLabelText("Horizon")).toBeDisabled();
    expect(screen.getByText("MPS drafting is disabled until planning workflow enablement.")).toBeInTheDocument();
    expect(screen.getByLabelText("First bucket")).toBeDisabled();
    expect(document.body.textContent ?? "").not.toMatch(internalTerms);
  });
});
