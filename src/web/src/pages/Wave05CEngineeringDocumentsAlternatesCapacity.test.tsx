import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { buildDemoSession } from "../auth/AuthContext";
import { apiClient } from "../api/http";
import { renderWithApp } from "../test/render";
import { BomLibraryPage } from "./EngineeringPages";
import {
  AlternateItemRulesPage,
  EngineeringAttachmentViewerPage,
  OperationStandardPage
} from "./EngineeringContinuationPages";
import { CapacityPlanningBoardPage } from "./PlanningContinuationPages";
import { BoqRequirementsPage, MrpRunConsolePage } from "./PlanningPages";

const internalTerms = /Workspace data|Setup planned|governed setup|internal only|source status|fallback|adapter|mock|seeded fallback/i;

function buildLiveSession() {
  const session = buildDemoSession();
  return {
    ...session,
    accessToken: "live-access-token",
    refreshToken: "live-refresh-token"
  };
}

function paged<TItem>(items: TItem[]) {
  return {
    items,
    page: 1,
    pageSize: items.length || 1,
    totalCount: items.length,
    totalPages: 1
  };
}

const itemLookup = [
  { id: 101, itemCode: "FG-100", itemName: "Pump Housing", itemType: "FG", status: "Active" },
  { id: 202, itemCode: "RM-202", itemName: "Valve Body", itemType: "RM", status: "Active" },
  { id: 303, itemCode: "RM-303", itemName: "Seal Kit", itemType: "RM", status: "Active" }
];

const workCenters = paged([
  {
    id: 301,
    companyId: 1,
    branchId: 10,
    workCenterCode: "WC-ASM",
    workCenterName: "Assembly Cell",
    departmentId: null,
    capacityUomId: null,
    defaultShiftPatternCode: null,
    parallelCapacityUnits: 1,
    status: "Active"
  }
]);

const alternateDtos = paged([
  {
    id: 81,
    companyId: 1,
    primaryItemId: 101,
    alternateItemId: 202,
    contextType: "BOM",
    bomId: 100,
    priorityRank: 1,
    effectiveFrom: "2026-04-24",
    effectiveTo: null,
    approvalStatus: "Approved",
    reasonCode: "SUPPLY-RISK"
  }
]);

const bomDtos = paged([
  {
    id: 100,
    companyId: 1,
    itemId: 101,
    bomCode: "BOM-100",
    bomName: "Pump Housing",
    currentReleasedRevisionId: null,
    status: "Draft",
    revisions: []
  }
]);

const mrpRuns = paged([
  {
    id: 700,
    companyId: 1,
    branchId: 10,
    runCode: "MRP-100",
    runType: "Net Change",
    triggeredFromMpsId: null,
    planningHorizonStart: "2026-04-24",
    planningHorizonEnd: "2026-05-01",
    status: "Completed",
    runStartedOn: "2026-04-24T08:00:00Z",
    runCompletedOn: "2026-04-24T08:05:00Z",
    items: []
  }
]);

const boqDtos = paged([
  {
    id: 500,
    companyId: 1,
    branchId: 10,
    mrpRunId: 700,
    sourceDocumentType: "Sales Order",
    sourceDocumentId: 1001,
    status: "Draft",
    lines: [
      {
        id: 901,
        lineNo: 10,
        itemId: 101,
        requiredQuantity: 8,
        requirementUomId: 1,
        needByDate: "2026-04-28",
        recommendedAction: "MAKE",
        approvedAction: "MAKE",
        overrideReasonCode: null,
        status: "Reviewed",
        itemCode: "FG-100"
      },
      {
        id: 902,
        lineNo: 20,
        itemId: 202,
        requiredQuantity: 5,
        requirementUomId: 1,
        needByDate: "2026-04-29",
        recommendedAction: "BUY",
        approvedAction: null,
        overrideReasonCode: null,
        status: "Draft",
        itemCode: "RM-202"
      }
    ]
  }
]);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Wave 5C engineering documents, alternates, and planning capacity completion", () => {
  it("keeps BOM blocked actions visibly disabled with business-safe reasons", async () => {
    renderWithApp(
      <Routes>
        <Route path="/engineering/boms" element={<BomLibraryPage />} />
      </Routes>,
      { route: "/engineering/boms" }
    );

    expect((await screen.findAllByRole("heading", { name: "BOM Library" })).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Import CSV" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Print" })).toBeDisabled();
    expect(screen.getByText("BOM import requires the approved import workflow.")).toBeInTheDocument();
    expect(screen.getByText("BOM printing is pending document workflow enablement.")).toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toMatch(internalTerms);
  });

  it("creates alternate-item rules and queues governed exports", async () => {
    vi.spyOn(apiClient.engineering, "alternateItems")
      .mockResolvedValueOnce(alternateDtos as never)
      .mockResolvedValue(paged([
        ...alternateDtos.items,
        {
          id: 82,
          companyId: 1,
          primaryItemId: 101,
          alternateItemId: 303,
          contextType: "Global",
          bomId: null,
          priorityRank: 2,
          effectiveFrom: "2026-04-24",
          effectiveTo: null,
          approvalStatus: "Draft",
          reasonCode: "SHORTAGE"
        }
      ]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue(itemLookup as never);
    vi.spyOn(apiClient.engineering, "boms").mockResolvedValue(bomDtos as never);
    const createAlternateItem = vi.spyOn(apiClient.engineering, "createAlternateItem").mockResolvedValue({
      id: 82,
      companyId: 1,
      primaryItemId: 101,
      alternateItemId: 303,
      contextType: "Global",
      bomId: null,
      priorityRank: 2,
      effectiveFrom: "2026-04-24",
      effectiveTo: null,
      approvalStatus: "Draft",
      reasonCode: "SHORTAGE"
    } as never);
    const createExportJob = vi.spyOn(apiClient.platform, "createExportJob").mockResolvedValue({
      id: 1,
      companyId: 1,
      branchId: 10,
      jobNo: "EXP-ALT-01",
      module: "engineering.alternate-items",
      outputFormat: "CSV",
      filterJson: "{}",
      storagePath: "exports/engineering/alternate-items/EXP-ALT-01.csv",
      status: "Queued",
      requestedOn: "2026-04-24T08:00:00Z",
      processedOn: null,
      lastError: null
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/engineering/alternate-items" element={<AlternateItemRulesPage />} />
      </Routes>,
      { route: "/engineering/alternate-items", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New rule" }));
    expect(await screen.findByText("Rule context")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Primary item"), { target: { value: "101" } });
    fireEvent.change(screen.getByLabelText("Alternate item"), { target: { value: "303" } });
    fireEvent.change(screen.getByLabelText("Context"), { target: { value: "Global" } });
    fireEvent.change(screen.getByLabelText("Priority rank"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Reason code"), { target: { value: "SHORTAGE" } });
    fireEvent.click(screen.getByRole("button", { name: "Save rule" }));

    await waitFor(() => expect(createAlternateItem).toHaveBeenCalledTimes(1));
    expect(createAlternateItem.mock.calls[0][0]).toMatchObject({
      primaryItemId: 101,
      alternateItemId: 303,
      priorityRank: 2,
      reasonCode: "SHORTAGE"
    });

    fireEvent.click(screen.getByRole("button", { name: "Export alternates" }));
    await waitFor(() => expect(createExportJob).toHaveBeenCalledTimes(1));
    expect(document.body.textContent ?? "").not.toMatch(internalTerms);
  });

  it("queues operation standard exports through the governed export endpoint", async () => {
    vi.spyOn(apiClient.resources, "operations").mockResolvedValue(paged([
      {
        id: 501,
        companyId: 1,
        operationCode: "OP-ASM",
        operationName: "Assembly",
        operationType: "Assembly",
        defaultWorkCenterId: 301,
        defaultSetupMinutes: 10,
        defaultRunMinutesPerUnit: 5,
        defaultTeardownMinutes: 2,
        allowsOverlap: false,
        isOutsideProcessing: false,
        requiresQcCheckpoint: true,
        status: "Active"
      }
    ]) as never);
    vi.spyOn(apiClient.resources, "workCenters").mockResolvedValue(workCenters as never);
    const createExportJob = vi.spyOn(apiClient.platform, "createExportJob").mockResolvedValue({
      id: 2,
      companyId: 1,
      branchId: 10,
      jobNo: "EXP-OPS-01",
      module: "engineering.operations",
      outputFormat: "CSV",
      filterJson: "{}",
      storagePath: "exports/engineering/operations/EXP-OPS-01.csv",
      status: "Queued",
      requestedOn: "2026-04-24T08:05:00Z",
      processedOn: null,
      lastError: null
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/engineering/operations" element={<OperationStandardPage />} />
      </Routes>,
      { route: "/engineering/operations", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Export standards" }));
    await waitFor(() => expect(createExportJob).toHaveBeenCalledTimes(1));
  });

  it("links engineering documents through the attachment endpoint and keeps audit truthful", async () => {
    vi.spyOn(apiClient.platform, "attachments")
      .mockResolvedValueOnce(paged([]) as never)
      .mockResolvedValue(paged([
        {
          id: 7001,
          companyId: 1,
          branchId: 10,
          relatedDocumentType: "Routing",
          relatedDocumentId: 900,
          fileName: "routing-r1.pdf",
          contentType: "application/pdf",
          fileSizeBytes: 2048,
          uploadedByUserId: 1,
          createdOn: "2026-04-24T08:10:00Z",
          status: "Linked"
        }
      ]) as never);
    const uploadAttachment = vi.spyOn(apiClient.platform, "uploadAttachment").mockResolvedValue({
      id: 7001,
      companyId: 1,
      branchId: 10,
      relatedDocumentType: "Routing",
      relatedDocumentId: 900,
      fileName: "routing-r1.pdf",
      contentType: "application/pdf",
      fileSizeBytes: 2048,
      uploadedByUserId: 1,
      createdOn: "2026-04-24T08:10:00Z",
      status: "Linked"
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/engineering/documents" element={<EngineeringAttachmentViewerPage />} />
      </Routes>,
      { route: "/engineering/documents", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Link document" }));
    expect(await screen.findByText("Document link")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Related document type"), { target: { value: "Routing" } });
    fireEvent.change(screen.getByLabelText("Related document ID"), { target: { value: "900" } });
    fireEvent.change(screen.getByLabelText("Linked file"), {
      target: { files: [new File(["routing-pdf"], "routing-r1.pdf", { type: "application/pdf" })] }
    });
    const documentDialog = screen.getByRole("dialog");
    fireEvent.click(within(documentDialog).getByRole("button", { name: "Link document" }));

    await waitFor(() => expect(uploadAttachment).toHaveBeenCalledTimes(1));
    expect(await within(screen.getByRole("dialog")).findByRole("button", { name: "Open audit trail" })).toBeDisabled();
    expect(screen.getAllByText("Audit history opens after document-control review is enabled.").length).toBeGreaterThan(0);
    expect(document.body.textContent ?? "").not.toMatch(internalTerms);
  });

  it("queues MRP snapshots and keeps save-only parameter actions disabled with reason", async () => {
    vi.spyOn(apiClient.planning, "mrpRuns").mockResolvedValue(mrpRuns as never);
    vi.spyOn(apiClient.salesPlanning, "mps").mockResolvedValue(paged([]) as never);
    const createExportJob = vi.spyOn(apiClient.platform, "createExportJob").mockResolvedValue({
      id: 3,
      companyId: 1,
      branchId: 10,
      jobNo: "EXP-MRP-01",
      module: "planning.mrp.snapshot",
      outputFormat: "CSV",
      filterJson: "{}",
      storagePath: "exports/planning/mrp/snapshot/EXP-MRP-01.csv",
      status: "Queued",
      requestedOn: "2026-04-24T08:15:00Z",
      processedOn: null,
      lastError: null
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/planning/mrp" element={<MrpRunConsolePage />} />
      </Routes>,
      { route: "/planning/mrp", session: buildLiveSession() }
    );

    await screen.findByRole("row", { name: "MRP-100 mrp run" });
    const mrpActionBar = screen.getByTestId("mrp-run-action-bar");
    const snapshotButton = within(mrpActionBar).getByRole("button", { name: "Version snapshot" });
    await waitFor(() => expect(snapshotButton).not.toBeDisabled());
    fireEvent.click(snapshotButton);
    await waitFor(() => expect(createExportJob).toHaveBeenCalledTimes(1));

    fireEvent.click(await screen.findByRole("row", { name: "MRP-100 mrp run" }));
    expect(await screen.findByText("MRP run parameters")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Save run parameters" })[0]).toBeDisabled();
    expect(screen.getAllByText("Run parameters are saved only when starting a new MRP run.").length).toBeGreaterThan(0);
  });

  it("enforces BOQ selection state and wires bulk conversion when a reviewed batch is selected", async () => {
    vi.spyOn(apiClient.planning, "boqRequirements").mockResolvedValue(boqDtos as never);
    const convertReviewed = vi.spyOn(apiClient.planning, "convertReviewedBoqLines").mockResolvedValue([
      {
        id: 901,
        lineNo: 10,
        itemId: 101,
        requiredQuantity: 8,
        requirementUomId: 1,
        needByDate: "2026-04-28",
        recommendedAction: "MAKE",
        approvedAction: "MAKE",
        overrideReasonCode: null,
        status: "Converted",
        itemCode: "FG-100"
      }
    ] as never);

    renderWithApp(
      <Routes>
        <Route path="/planning/boq-requirements" element={<BoqRequirementsPage />} />
      </Routes>,
      { route: "/planning/boq-requirements", session: buildLiveSession() }
    );

    const boqActionBar = screen.getByTestId("boq-action-bar");
    expect(await screen.findByText("BOQ / Requirements")).toBeInTheDocument();
    expect(within(boqActionBar).getByRole("button", { name: "Convert selected line" })).toBeDisabled();
    expect(screen.getByText("Select a BOQ line before conversion.")).toBeInTheDocument();
    expect(within(boqActionBar).getByRole("button", { name: "Convert reviewed lines" })).toBeDisabled();
    expect(screen.getByText("Select a BOQ before converting reviewed lines.")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("row", { name: "Sales Order 1001 boq requirement" }));
    await waitFor(() => expect(within(boqActionBar).getByRole("button", { name: "Convert reviewed lines" })).not.toBeDisabled());

    fireEvent.click(within(boqActionBar).getByRole("button", { name: "Convert reviewed lines" }));
    await waitFor(() => expect(convertReviewed).toHaveBeenCalledWith(500));
  });

  it("keeps capacity actions truthful by opening overload review and disabling missing workflows", async () => {
    renderWithApp(
      <Routes>
        <Route path="/planning/capacity" element={<CapacityPlanningBoardPage />} />
      </Routes>,
      { route: "/planning/capacity" }
    );

    await screen.findByText("CNC Cell A");
    const capacityActionBar = screen.getByTestId("capacity-action-bar");
    const reviewButton = within(capacityActionBar).getByRole("button", { name: "Review overloads" });
    expect(reviewButton).not.toBeDisabled();
    expect(within(capacityActionBar).getByRole("button", { name: "Rebuild capacity draft" })).toBeDisabled();
    expect(screen.getByText("Capacity rebuild requires planning workflow enablement.")).toBeInTheDocument();

    fireEvent.click(reviewButton);
    expect(await screen.findByText("Capacity review controls")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save capacity review" })).toBeDisabled();
    expect(screen.getByText("Capacity save requires planning workflow enablement.")).toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toMatch(internalTerms);
  });
});
