import type {
  AuthSessionResponse,
  InspectionDto,
  InspectionPlanDto,
  InspectionResultDto,
  NonConformanceDto,
  QueryFilter
} from "../api/contracts";
import { apiClient } from "../api/http";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface QualityPlanItem {
  id: string;
  planId: number;
  planCode: string;
  planName: string;
  inspectionType: string;
  itemLabel: string;
  operationLabel: string;
  autoHoldSignal: string;
  autoNcrSignal: string;
  parameterSummary: string;
  status: string;
  source: MasterDataSource;
}

export interface InspectionResultItem {
  id: string;
  lineNo: number;
  parameterCode: string;
  expectedValue: string;
  actualValue: string;
  resultStatus: string;
  remarks: string;
}

export interface InspectionItem {
  id: string;
  inspectionId: number;
  inspectionNo: string;
  inspectionType: string;
  sourceDocument: string;
  traceLabel: string;
  status: string;
  overallResult: string;
  heldReleasedSignal: string;
  notes: string;
  source: MasterDataSource;
  results: InspectionResultItem[];
}

export interface NonConformanceItem {
  id: string;
  ncrId: number;
  ncrNo: string;
  sourceDocument: string;
  traceLabel: string;
  disposition: string;
  status: string;
  rootCause: string;
  reworkLink: string;
  remarks: string;
  source: MasterDataSource;
}

function hasLiveSession(session: AuthSessionResponse | null | undefined) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

function matchesFilter(value: string, filter: QueryFilter) {
  const search = filter.search?.trim().toLowerCase();
  const status = filter.status?.trim().toLowerCase();
  const normalized = value.toLowerCase();

  return (!search || normalized.includes(search)) && (!status || status === "all" || normalized.includes(status));
}

function filterSeeded<TItem>(items: TItem[], filter: QueryFilter, project: (item: TItem) => string) {
  return items.filter((item) => matchesFilter(project(item), filter));
}

function itemLabel(itemId: number | null | undefined) {
  return itemId ? `Item ${itemId}` : "Any item";
}

function operationLabel(operationId: number | null | undefined) {
  return operationId ? `Operation ${operationId}` : "Any operation";
}

function documentLabel(type: string, id: number | null | undefined) {
  return id ? `${type} ${id}` : type;
}

function traceLabel(lotId: number | null | undefined, serialId: number | null | undefined) {
  if (lotId && serialId) {
    return `Lot ${lotId} / Serial ${serialId}`;
  }

  if (lotId) {
    return `Lot ${lotId}`;
  }

  if (serialId) {
    return `Serial ${serialId}`;
  }

  return "No trace reference";
}

function mapPlan(dto: InspectionPlanDto, source: MasterDataSource): QualityPlanItem {
  return {
    id: `quality-plan-${dto.id}`,
    planId: dto.id,
    planCode: dto.planCode,
    planName: dto.planName,
    inspectionType: dto.inspectionType,
    itemLabel: itemLabel(dto.itemId),
    operationLabel: operationLabel(dto.operationId),
    autoHoldSignal: dto.autoHoldOnFail ? "Auto hold on fail" : "Manual hold",
    autoNcrSignal: dto.autoCreateNcrOnFail ? "Auto NCR on fail" : "Manual NCR",
    parameterSummary: "Parameter library detail deferred to plan editor",
    status: dto.status,
    source
  };
}

function mapResult(result: InspectionResultDto): InspectionResultItem {
  return {
    id: `inspection-result-${result.id}`,
    lineNo: result.lineNo,
    parameterCode: result.parameterCode,
    expectedValue: result.expectedValue ?? "Not specified",
    actualValue: result.actualValue ?? "Pending",
    resultStatus: result.resultStatus,
    remarks: result.remarks ?? "No remarks"
  };
}

function mapInspection(dto: InspectionDto, source: MasterDataSource): InspectionItem {
  const heldReleasedSignal = dto.heldOn
    ? `Held ${dto.heldOn.slice(0, 10)}`
    : dto.releasedOn
      ? `Released ${dto.releasedOn.slice(0, 10)}`
      : "Open";

  return {
    id: `inspection-${dto.id}`,
    inspectionId: dto.id,
    inspectionNo: dto.inspectionNo,
    inspectionType: dto.inspectionType,
    sourceDocument: documentLabel(dto.sourceDocumentType, dto.sourceDocumentId),
    traceLabel: traceLabel(dto.lotId, dto.serialId),
    status: dto.status,
    overallResult: dto.overallResult,
    heldReleasedSignal,
    notes: dto.notes ?? "No notes",
    source,
    results: dto.results.map(mapResult)
  };
}

function mapNcr(dto: NonConformanceDto, source: MasterDataSource): NonConformanceItem {
  return {
    id: `ncr-${dto.id}`,
    ncrId: dto.id,
    ncrNo: dto.ncrNo,
    sourceDocument: documentLabel(dto.sourceDocumentType, dto.sourceDocumentId),
    traceLabel: traceLabel(dto.lotId, dto.serialId),
    disposition: dto.disposition,
    status: dto.status,
    rootCause: dto.rootCause ?? "Pending RCA",
    reworkLink: dto.reworkOrderId ? `Rework ${dto.reworkOrderId}` : "No rework link",
    remarks: dto.remarks ?? "No remarks",
    source
  };
}

const seededPlans: QualityPlanItem[] = [
  {
    id: "plan-incoming-ss",
    planId: 7101,
    planCode: "QC-IN-SS-SHEET",
    planName: "Incoming stainless sheet inspection",
    inspectionType: "Incoming",
    itemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
    operationLabel: "Receiving",
    autoHoldSignal: "Auto hold on fail",
    autoNcrSignal: "Auto NCR on fail",
    parameterSummary: "Thickness, flatness, finish, heat number",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "plan-final-oz50",
    planId: 7102,
    planCode: "QC-FINAL-OZ50",
    planName: "Ozone generator final test",
    inspectionType: "Final",
    itemLabel: "FG-OZ-50 / Ozone Generator 50 LPH",
    operationLabel: "Final test",
    autoHoldSignal: "Auto hold on fail",
    autoNcrSignal: "Manual NCR",
    parameterSummary: "Leak test, output flow, safety checklist",
    status: "Active",
    source: "Seeded"
  }
];

const seededInspections: InspectionItem[] = [
  {
    id: "inspection-in-0008",
    inspectionId: 7201,
    inspectionNo: "INSP-IN-2026-0008",
    inspectionType: "Incoming",
    sourceDocument: "PO 114",
    traceLabel: "LOT-SS-2026-03A",
    status: "Hold",
    overallResult: "Fail",
    heldReleasedSignal: "Held 2026-03-05",
    notes: "Thickness below tolerance on two sheets.",
    source: "Seeded",
    results: [
      {
        id: "inspection-in-0008-line-1",
        lineNo: 10,
        parameterCode: "THICKNESS",
        expectedValue: "2.0 mm +/- 0.1",
        actualValue: "1.82 mm",
        resultStatus: "Fail",
        remarks: "Supplier deviation"
      },
      {
        id: "inspection-in-0008-line-2",
        lineNo: 20,
        parameterCode: "FINISH",
        expectedValue: "No visible scratches",
        actualValue: "Accepted",
        resultStatus: "Pass",
        remarks: "OK"
      }
    ]
  },
  {
    id: "inspection-ip-0014",
    inspectionId: 7203,
    inspectionNo: "INSP-IP-2026-0014",
    inspectionType: "InProcess",
    sourceDocument: "JC-90441",
    traceLabel: "WO-2026-044 / Operation 10",
    status: "Released",
    overallResult: "Pass",
    heldReleasedSignal: "Released 2026-03-06",
    notes: "Dimensional checkpoint passed after first-piece review.",
    source: "Seeded",
    results: [
      {
        id: "inspection-ip-0014-line-1",
        lineNo: 10,
        parameterCode: "DIMENSION",
        expectedValue: "As drawing",
        actualValue: "Within tolerance",
        resultStatus: "Pass",
        remarks: "First piece accepted"
      }
    ]
  },
  {
    id: "inspection-final-0019",
    inspectionId: 7202,
    inspectionNo: "INSP-FIN-2026-0019",
    inspectionType: "Final",
    sourceDocument: "JobCard 90391",
    traceLabel: "SN-OZ50-0189-01",
    status: "Open",
    overallResult: "Pending",
    heldReleasedSignal: "Open",
    notes: "Leak test evidence pending.",
    source: "Seeded",
    results: [
      {
        id: "inspection-final-0019-line-1",
        lineNo: 10,
        parameterCode: "LEAK_TEST",
        expectedValue: "No pressure drop",
        actualValue: "Pending",
        resultStatus: "Pending",
        remarks: "Awaiting calibrated bench"
      }
    ]
  }
];

const seededNcrs: NonConformanceItem[] = [
  {
    id: "ncr-0018",
    ncrId: 7301,
    ncrNo: "NCR-2026-0018",
    sourceDocument: "Inspection 7202",
    traceLabel: "SN-OZ50-0189-01",
    disposition: "Rework",
    status: "Open",
    rootCause: "Gasket seating",
    reworkLink: "RW-2026-0009",
    remarks: "Rework loop released for leak-test retake.",
    source: "Seeded"
  }
];

export async function listQualityPlans(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededPlans, filter, (item) => `${item.planCode} ${item.planName} ${item.inspectionType} ${item.status}`);
  }

  try {
    const response = await apiClient.quality.inspectionPlans(filter);
    return response.items.map((item) => mapPlan(item, "Live"));
  } catch {
    return filterSeeded(seededPlans, filter, (item) => `${item.planCode} ${item.planName} ${item.inspectionType} ${item.status}`);
  }
}

export async function listInspections(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededInspections, filter, (item) => `${item.inspectionNo} ${item.inspectionType} ${item.sourceDocument} ${item.status}`);
  }

  try {
    const response = await apiClient.quality.inspections(filter);
    return response.items.map((item) => mapInspection(item, "Live"));
  } catch {
    return filterSeeded(seededInspections, filter, (item) => `${item.inspectionNo} ${item.inspectionType} ${item.sourceDocument} ${item.status}`);
  }
}

export async function listNonConformances(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededNcrs, filter, (item) => `${item.ncrNo} ${item.sourceDocument} ${item.disposition} ${item.status}`);
  }

  try {
    const response = await apiClient.quality.nonConformances(filter);
    return response.items.map((item) => mapNcr(item, "Live"));
  } catch {
    return filterSeeded(seededNcrs, filter, (item) => `${item.ncrNo} ${item.sourceDocument} ${item.disposition} ${item.status}`);
  }
}
