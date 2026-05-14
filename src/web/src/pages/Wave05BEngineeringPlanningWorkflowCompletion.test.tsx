import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { buildDemoSession } from "../auth/AuthContext";
import { apiClient } from "../api/http";
import { renderWithApp } from "../test/render";
import { BomDetailEditorPage, OperationStandardPage, RoutingLibraryPage } from "./EngineeringContinuationPages";
import { MrpRunConsolePage } from "./PlanningPages";

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
  { id: 202, itemCode: "RM-202", itemName: "Valve Body", itemType: "RM", status: "Active" }
];

const uoms = paged([
  { id: 1, uomCode: "EA", uomName: "Each", symbol: "EA", uomClassId: 1, decimalPrecision: 0, isSystemBase: true, status: "Active" }
]);

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

const machines = paged([
  {
    id: 401,
    companyId: 1,
    branchId: 10,
    workCenterId: 301,
    machineCode: "MC-01",
    machineName: "Assembly Machine",
    capacityPerHour: 12,
    currentStatus: "Available",
    defaultShiftId: null,
    isUnderMaintenance: false,
    isSchedulingEnabled: true,
    status: "Active"
  }
]);

const operations = paged([
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
]);

const liveBom = {
  id: 100,
  companyId: 1,
  itemId: 101,
  bomCode: "BOM-100",
  bomName: "Pump Housing",
  currentReleasedRevisionId: null,
  status: "Draft",
  revisions: [
    {
      id: 1001,
      revisionCode: "R1",
      effectiveFrom: "2026-04-24",
      effectiveTo: null,
      approvalStatus: "Draft",
      routingId: null,
      changeSummary: "Initial draft",
      isPhantomParentAllowed: false,
      lines: [
        {
          id: 1,
          sequenceNo: 10,
          componentItemId: 101,
          quantityPer: 1,
          issueUomId: 1,
          scrapPercent: 0,
          issueMethod: "Manual",
          isPhantom: false,
          alternateItemId: null,
          effectiveFrom: "2026-04-24",
          effectiveTo: null
        }
      ],
      operations: [
        {
          id: 1,
          sequenceNo: 10,
          routingOperationId: null,
          operationId: 501,
          setupMinutes: 10,
          runMinutesPerUnit: 5,
          teardownMinutes: 2,
          requiresQcCheckpoint: true,
          isOptional: false
        }
      ]
    }
  ]
};

const liveRouting = {
  id: 900,
  companyId: 1,
  routingCode: "RT-100",
  routingName: "Pump Housing Route",
  outputItemId: 101,
  revisionCode: "R1",
  status: "Active",
  operations: [
    {
      id: 910,
      sequenceNo: 10,
      operationId: 501,
      workCenterId: 301,
      toolId: null,
      setupMinutes: 10,
      runMinutesPerUnit: 5,
      teardownMinutes: 2,
      overlapPercent: 0,
      isOutsideProcessing: false,
      requiresQcCheckpoint: true,
      status: "Active"
    }
  ]
};

const liveMrpRuns = paged([
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

const activeMps = paged([
  {
    id: 600,
    companyId: 1,
    branchId: 10,
    mpsCode: "MPS-APR",
    planningHorizonStart: "2026-04-24",
    planningHorizonEnd: "2026-05-15",
    status: "Active",
    lines: []
  }
]);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Wave 5B engineering authoring and planning workflow completion", () => {
  it("saves live BOM line changes through the BOM update endpoint", async () => {
    vi.spyOn(apiClient.engineering, "boms").mockResolvedValue(paged([liveBom]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue(itemLookup as never);
    vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(uoms as never);
    vi.spyOn(apiClient.resources, "operations").mockResolvedValue(operations as never);
    const updateBom = vi.spyOn(apiClient.engineering, "updateBom").mockResolvedValue(liveBom as never);

    renderWithApp(
      <Routes>
        <Route path="/engineering/bom-editor" element={<BomDetailEditorPage />} />
      </Routes>,
      { route: "/engineering/bom-editor", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("row", { name: "BOM-100 bom editor" }));
    expect(await screen.findByText("BOM edit controls")).toBeInTheDocument();

    const addLineButton = screen.getAllByRole("button", { name: "Add Line" }).find((button) => !button.hasAttribute("disabled"));
    expect(addLineButton).toBeDefined();
    fireEvent.click(addLineButton!);

    fireEvent.change(screen.getAllByLabelText("Component item")[1], { target: { value: "202" } });
    fireEvent.change(screen.getAllByLabelText("Issue UOM")[1], { target: { value: "1" } });
    fireEvent.change(screen.getAllByLabelText("Quantity per")[1], { target: { value: "2.5" } });

    const saveButton = screen.getAllByRole("button", { name: "Save draft lines" }).find((button) => !button.hasAttribute("disabled"));
    expect(saveButton).toBeDefined();

    fireEvent.click(saveButton!);

    await waitFor(() => expect(updateBom).toHaveBeenCalledTimes(1));
    const [, request] = updateBom.mock.calls[0];
    expect(request.revisions[0].lines).toHaveLength(2);
    expect(request.revisions[0].lines[1]).toMatchObject({ componentItemId: 202, issueUomId: 1, quantityPer: 2.5 });
    expect(document.body.textContent ?? "").not.toMatch(internalTerms);
  });

  it("locks released routing edits and saves cloned routing drafts through truthful endpoints", async () => {
    vi.spyOn(apiClient.engineering, "routings").mockResolvedValue(paged([liveRouting]) as never);
    vi.spyOn(apiClient.masters, "itemLookup").mockResolvedValue(itemLookup as never);
    vi.spyOn(apiClient.resources, "operations").mockResolvedValue(operations as never);
    vi.spyOn(apiClient.resources, "workCenters").mockResolvedValue(workCenters as never);
    vi.spyOn(apiClient.resources, "machines").mockResolvedValue(machines as never);
    const updateRouting = vi.spyOn(apiClient.engineering, "updateRouting").mockResolvedValue({
      ...liveRouting,
      routingName: "Pump Housing Route Updated"
    } as never);
    const createRouting = vi.spyOn(apiClient.engineering, "createRouting").mockResolvedValue({
      ...liveRouting,
      id: 901,
      routingCode: "RT-100-COPY",
      routingName: "Pump Housing Route Copy",
      status: "Draft"
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/engineering/routings" element={<RoutingLibraryPage />} />
      </Routes>,
      { route: "/engineering/routings", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("row", { name: "RT-100 routing" }));
    expect(await screen.findByText("Routing release controls")).toBeInTheDocument();
    expect(screen.getByLabelText("Machine assignment")).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Routing name"), { target: { value: "Pump Housing Route Updated" } });
    expect(screen.getByRole("button", { name: "Save routing" })).toBeDisabled();
    expect(screen.getAllByText("Create a cloned routing draft before changing a released routing.").length).toBeGreaterThan(0);
    expect(updateRouting).not.toHaveBeenCalled();

    const cloneButton = screen.getAllByRole("button", { name: "Clone routing" }).find((button) => !button.hasAttribute("disabled"));
    expect(cloneButton).toBeDefined();

    fireEvent.click(cloneButton!);
    fireEvent.change(screen.getByLabelText("Routing name"), { target: { value: "Pump Housing Route Copy" } });
    fireEvent.click(screen.getByRole("button", { name: "Save routing" }));

    await waitFor(() => expect(createRouting).toHaveBeenCalledTimes(1));
    expect(createRouting.mock.calls[0][0]).toMatchObject({ routingCode: "RT-100-COPY", status: "Draft" });
  });

  it("creates and updates operation standards through governed save actions", async () => {
    vi.spyOn(apiClient.resources, "operations").mockResolvedValue(operations as never);
    vi.spyOn(apiClient.resources, "workCenters").mockResolvedValue(workCenters as never);
    const createOperation = vi.spyOn(apiClient.resources, "createOperation").mockResolvedValue({
      id: 777,
      companyId: 1,
      operationCode: "OP-NEW",
      operationName: "Final Test",
      operationType: "Inspection",
      defaultWorkCenterId: 301,
      defaultSetupMinutes: 6,
      defaultRunMinutesPerUnit: 3,
      defaultTeardownMinutes: 1,
      allowsOverlap: false,
      isOutsideProcessing: false,
      requiresQcCheckpoint: true,
      status: "Draft"
    } as never);
    const updateOperation = vi.spyOn(apiClient.resources, "updateOperation").mockResolvedValue({
      id: 777,
      companyId: 1,
      operationCode: "OP-NEW",
      operationName: "Final Test Updated",
      operationType: "Inspection",
      defaultWorkCenterId: 301,
      defaultSetupMinutes: 6,
      defaultRunMinutesPerUnit: 3,
      defaultTeardownMinutes: 1,
      allowsOverlap: false,
      isOutsideProcessing: false,
      requiresQcCheckpoint: true,
      status: "Active"
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/engineering/operations" element={<OperationStandardPage />} />
      </Routes>,
      { route: "/engineering/operations", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New operation" }));
    expect(await screen.findByText("Operation setup")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Operation code"), { target: { value: "OP-NEW" } });
    fireEvent.change(screen.getByLabelText("Operation name"), { target: { value: "Final Test" } });
    fireEvent.change(screen.getByLabelText("Operation type"), { target: { value: "Inspection" } });
    fireEvent.change(screen.getByLabelText("Default work center"), { target: { value: "301" } });
    fireEvent.change(screen.getByLabelText("Setup minutes"), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText("Run minutes / unit"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Teardown minutes"), { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: "Save operation" }));

    await waitFor(() => expect(createOperation).toHaveBeenCalledTimes(1));
    expect(createOperation.mock.calls[0][0]).toMatchObject({ operationCode: "OP-NEW", defaultWorkCenterId: 301 });

    fireEvent.change(screen.getByLabelText("Operation name"), { target: { value: "Final Test Updated" } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "Active" } });
    fireEvent.click(screen.getByRole("button", { name: "Save operation" }));

    await waitFor(() => expect(updateOperation).toHaveBeenCalledTimes(1));
    expect(updateOperation.mock.calls[0][1]).toMatchObject({ operationName: "Final Test Updated", status: "Active" });
  });

  it("starts an MRP run from the governed draft workspace", async () => {
    vi.spyOn(apiClient.planning, "mrpRuns").mockResolvedValue(liveMrpRuns as never);
    vi.spyOn(apiClient.salesPlanning, "mps").mockResolvedValue(activeMps as never);
    const startMrpRun = vi.spyOn(apiClient.planning, "startMrpRun").mockResolvedValue({
      id: 701,
      companyId: 1,
      branchId: 10,
      runCode: "MRP-APR-01",
      runType: "Net Change",
      triggeredFromMpsId: 600,
      planningHorizonStart: "2026-04-24",
      planningHorizonEnd: "2026-05-15",
      status: "Completed",
      runStartedOn: "2026-04-24T08:00:00Z",
      runCompletedOn: "2026-04-24T08:05:00Z",
      items: []
    } as never);

    renderWithApp(
      <Routes>
        <Route path="/planning/mrp" element={<MrpRunConsolePage />} />
      </Routes>,
      { route: "/planning/mrp", session: buildLiveSession() }
    );

    fireEvent.click(await screen.findByRole("button", { name: "Run MRP draft" }));
    expect(await screen.findByText("MRP run draft")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Run code"), { target: { value: "MRP-APR-01" } });
    fireEvent.change(screen.getByLabelText("Triggered from MPS"), { target: { value: "600" } });
    fireEvent.change(screen.getByLabelText("Planning horizon end"), { target: { value: "2026-05-15" } });

    fireEvent.click(screen.getByRole("button", { name: "Start MRP run" }));

    await waitFor(() => expect(startMrpRun).toHaveBeenCalledTimes(1));
    expect(startMrpRun.mock.calls[0][0]).toMatchObject({
      runCode: "MRP-APR-01",
      triggeredFromMpsId: 600,
      planningHorizonEnd: "2026-05-15"
    });
    expect(document.body.textContent ?? "").not.toMatch(internalTerms);
  });
});
