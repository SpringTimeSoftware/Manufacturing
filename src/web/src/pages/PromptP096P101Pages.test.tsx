import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  AlternateItemRulesPage,
  BomComparisonPage,
  BomDetailEditorPage,
  EcoRevisionControlPage,
  EngineeringAttachmentViewerPage,
  OperationStandardPage,
  RoutingLibraryPage
} from "./EngineeringContinuationPages";
import { BoqRequirementsPage, MrpResultsExceptionsPage, MrpRunConsolePage } from "./PlanningPages";
import { renderWithApp } from "../test/render";

describe("Prompt P096-P101 engineering and planning pages", () => {
  it("renders P096 BOM detail editor with component scrap and operation grids", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/bom-editor" element={<BomDetailEditorPage />} />
      </Routes>,
      { route: "/engineering/bom-editor" }
    );

    expect(await screen.findByText("BOM Detail / Editor")).toBeInTheDocument();
    expect(await screen.findByText("Component tree editor")).toBeInTheDocument();
    expect(await screen.findByText("Scrap %")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "FG-OZ-50 bom editor" }));
    expect(await screen.findByText("BOM edit controls")).toBeInTheDocument();
  });

  it("renders P097 BOM comparison and ECO revision control surfaces", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/bom-comparison" element={<BomComparisonPage />} />
      </Routes>,
      { route: "/engineering/bom-comparison" }
    );

    expect(await screen.findByText("BOM Comparison")).toBeInTheDocument();
    expect(await screen.findByText("R2 -> R3")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/engineering/eco-revisions" element={<EcoRevisionControlPage />} />
      </Routes>,
      { route: "/engineering/eco-revisions" }
    );

    expect(await screen.findByText("ECO / Revision Control")).toBeInTheDocument();
    expect(await screen.findByText("ECO-2026-0007")).toBeInTheDocument();
  });

  it("renders P098 routing library and operation standard screens", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/routings" element={<RoutingLibraryPage />} />
      </Routes>,
      { route: "/engineering/routings" }
    );

    expect(await screen.findByText("Routing Library")).toBeInTheDocument();
    expect(await screen.findByText("RT-OZ50-R3")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/engineering/operations" element={<OperationStandardPage />} />
      </Routes>,
      { route: "/engineering/operations" }
    );

    expect(await screen.findByText("Operation Standard / Cycle Times")).toBeInTheDocument();
    expect(await screen.findByText("OP-CUT-FORM")).toBeInTheDocument();
  });

  it("renders P099 alternate-item rules and deferred engineering attachment surface", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/alternate-items" element={<AlternateItemRulesPage />} />
      </Routes>,
      { route: "/engineering/alternate-items" }
    );

    expect(await screen.findByText("Alternate Item / Replacement Rules")).toBeInTheDocument();
    expect(await screen.findByText("RM-SS-SHEET / Stainless Steel Sheet")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/engineering/documents" element={<EngineeringAttachmentViewerPage />} />
      </Routes>,
      { route: "/engineering/documents" }
    );

    expect(await screen.findByText("Engineering Attachment / Document Viewer")).toBeInTheDocument();
    expect(await screen.findByText("oz50-tank-assembly-r3.pdf")).toBeInTheDocument();
    expect(screen.getAllByText("Readiness view").length).toBeGreaterThan(0);
  });

  it("renders P100 MRP run console and result exception screens", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/mrp" element={<MrpRunConsolePage />} />
      </Routes>,
      { route: "/planning/mrp" }
    );

    expect(await screen.findByText("MRP Run Console")).toBeInTheDocument();
    expect(await screen.findByText("MRP-2026-03-01")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "MRP-2026-03-01 mrp run" }));
    expect(await screen.findByText("MRP run parameters")).toBeInTheDocument();

    renderWithApp(
      <Routes>
        <Route path="/planning/mrp-results" element={<MrpResultsExceptionsPage />} />
      </Routes>,
      { route: "/planning/mrp-results" }
    );

    expect(await screen.findByText("MRP Results / Exceptions")).toBeInTheDocument();
    expect(await screen.findByText("SHORTAGE")).toBeInTheDocument();
  });

  it("renders P101 BOQ requirements with shortage-first action lines", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/boq-requirements" element={<BoqRequirementsPage />} />
      </Routes>,
      { route: "/planning/boq-requirements" }
    );

    expect(await screen.findByText("BOQ / Requirements")).toBeInTheDocument();
    expect((await screen.findAllByText("SO-2026-0189")).length).toBeGreaterThan(0);
    expect(await screen.findByText("Net requirement lines")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "SO-2026-0189 boq requirement" }));
    expect(await screen.findByText("Action override controls")).toBeInTheDocument();
  });
});
