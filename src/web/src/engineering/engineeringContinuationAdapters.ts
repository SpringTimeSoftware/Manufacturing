import type {
  AttachmentDto,
  AttachmentFilter,
  AlternateItemDto,
  AuthSessionResponse,
  BomDto,
  BomLineDto,
  BomOperationDto,
  EngineeringChangeDto,
  EngineeringChangeLineDto,
  OperationDto,
  QueryFilter,
  RoutingDto,
  RoutingOperationDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import { liveDataUnavailable } from "../api/liveData";
import { bomRecords } from "../api/mockData";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface BomEditorComponentItem {
  id: string;
  sequenceNo: number;
  componentItemId: number;
  componentLabel: string;
  issueUomId: number;
  quantityPer: string;
  scrapPercent: number;
  issueMethod: string;
  recommendation: string;
  effectiveWindow: string;
  alternateItemId: number | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

export interface BomEditorOperationItem {
  id: string;
  sequenceNo: number;
  routingOperationId: number | null;
  operationId: number | null;
  operationLabel: string;
  setupMinutes: number;
  runMinutesPerUnit: number;
  teardownMinutes: number;
  requiresQcCheckpoint: boolean;
  isOptional: boolean;
}

export interface BomEditorItem {
  id: string;
  companyId: number;
  bomId: number;
  itemId: number;
  revisionId: number | null;
  bomCode: string;
  bomName: string;
  itemLabel: string;
  revisionCode: string;
  status: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  defaultIssueMethod: string;
  routingId: number | null;
  changeSummary: string | null;
  isPhantomParentAllowed: boolean;
  lineCount: number;
  operationCount: number;
  source: MasterDataSource;
  validationNotes: string[];
  components: BomEditorComponentItem[];
  operations: BomEditorOperationItem[];
}

export interface BomComparisonDifferenceItem {
  id: string;
  field: string;
  before: string;
  after: string;
  impact: string;
}

export interface BomComparisonItem {
  id: string;
  bomCode: string;
  itemLabel: string;
  fromRevision: string;
  toRevision: string;
  quantityDeltaCount: number;
  operationDeltaCount: number;
  costSignal: string;
  status: string;
  source: MasterDataSource;
  differences: BomComparisonDifferenceItem[];
}

export interface EcoRevisionLineItem {
  id: string;
  lineNo: number;
  impactType: string;
  actionType: string;
  targetLabel: string;
  before: string;
  after: string;
}

export interface EcoRevisionItem {
  id: string;
  ecoId: number | null;
  ecoCode: string;
  ecoTitle: string;
  changeType: string;
  requestedOn: string;
  effectiveFrom: string;
  approvalStatus: string;
  reasonCode: string;
  impactedLineCount: number;
  source: MasterDataSource;
  lines: EcoRevisionLineItem[];
}

export interface RoutingOperationStepItem {
  id: string;
  sequenceNo: number;
  operationId: number;
  workCenterId: number | null;
  toolId: number | null;
  operationLabel: string;
  workCenterLabel: string;
  setupMinutes: number;
  runMinutesPerUnit: number;
  teardownMinutes: number;
  overlapPercent: string;
  overlapPercentValue: number | null;
  requiresQcCheckpoint: boolean;
  isOutsideProcessing: boolean;
  status: string;
}

export interface RoutingLibraryItem {
  id: string;
  routingId: number | null;
  companyId: number;
  routingCode: string;
  routingName: string;
  outputItemId: number | null;
  outputItemLabel: string;
  revisionCode: string;
  status: string;
  operationCount: number;
  totalCycleMinutes: number;
  source: MasterDataSource;
  operations: RoutingOperationStepItem[];
}

export interface OperationStandardItem {
  id: string;
  operationId: number | null;
  companyId: number;
  operationCode: string;
  operationName: string;
  operationType: string;
  defaultWorkCenterId: number | null;
  defaultWorkCenterLabel: string;
  setupMinutes: number;
  runMinutesPerUnit: number;
  teardownMinutes: number;
  allowsOverlap: boolean;
  isOutsideProcessing: boolean;
  requiresQcCheckpoint: boolean;
  status: string;
  source: MasterDataSource;
}

export interface AlternateItemRuleItem {
  id: string;
  alternateItemId: number;
  alternateRuleId: number | null;
  bomId: number | null;
  companyId: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  primaryItemId: number;
  primaryItemLabel: string;
  alternateItemLabel: string;
  contextType: string;
  bomLabel: string;
  priorityRank: number;
  effectiveWindow: string;
  approvalStatus: string;
  reasonCode: string;
  source: MasterDataSource;
}

export interface EngineeringAttachmentItem {
  id: string;
  attachmentId: number | null;
  branchId: number | null;
  companyId: number | null;
  contentType: string;
  documentNo: string;
  fileName: string;
  fileSizeBytes: number;
  linkedRecord: string;
  relatedDocumentId: number | null;
  relatedDocumentType: string;
  documentType: string;
  revisionCode: string;
  uploadedOn: string;
  uploadedByUserId: number | null;
  status: string;
  source: MasterDataSource;
}

function hasLiveSession(session: AuthSessionResponse | null | undefined) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

function dateLabel(value: string | null | undefined) {
  return value?.trim() ? value : "Open";
}

function numberLabel(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function matchesFilter(value: string, filter: QueryFilter) {
  const search = filter.search?.trim().toLowerCase();
  const status = filter.status?.trim().toLowerCase();
  const normalized = value.toLowerCase();
  const matchesSearch = !search || normalized.includes(search);
  const matchesStatus = !status || status === "all" || normalized.includes(status);

  return matchesSearch && matchesStatus;
}

function filterSeeded<TItem>(items: TItem[], filter: QueryFilter, project: (item: TItem) => string) {
  return items.filter((item) => matchesFilter(project(item), filter));
}

function getReleasedRevision(dto: BomDto) {
  return dto.revisions.find((revision) => revision.id === dto.currentReleasedRevisionId) ?? dto.revisions[0] ?? null;
}

function mapBomLine(line: BomLineDto): BomEditorComponentItem {
  return {
    id: `bom-line-${line.id}`,
    sequenceNo: line.sequenceNo,
    componentItemId: line.componentItemId,
    componentLabel: `Item ${line.componentItemId}`,
    issueUomId: line.issueUomId,
    quantityPer: numberLabel(line.quantityPer),
    scrapPercent: line.scrapPercent,
    issueMethod: line.issueMethod,
    recommendation: line.isPhantom ? "MAKE" : "BUY",
    effectiveWindow: `${dateLabel(line.effectiveFrom)} to ${dateLabel(line.effectiveTo)}`,
    alternateItemId: line.alternateItemId,
    effectiveFrom: line.effectiveFrom,
    effectiveTo: line.effectiveTo
  };
}

function mapBomOperation(operation: BomOperationDto): BomEditorOperationItem {
  return {
    id: `bom-operation-${operation.id}`,
    sequenceNo: operation.sequenceNo,
    routingOperationId: operation.routingOperationId,
    operationId: operation.operationId,
    operationLabel: operation.operationId ? `Operation ${operation.operationId}` : `Routing step ${operation.routingOperationId ?? operation.sequenceNo}`,
    setupMinutes: operation.setupMinutes,
    runMinutesPerUnit: operation.runMinutesPerUnit,
    teardownMinutes: operation.teardownMinutes,
    requiresQcCheckpoint: operation.requiresQcCheckpoint,
    isOptional: operation.isOptional
  };
}

function mapBomEditor(dto: BomDto, source: MasterDataSource): BomEditorItem {
  const draftRevision = [...dto.revisions].reverse().find((candidate) => candidate.approvalStatus === "Draft") ?? null;
  const revision = draftRevision ?? getReleasedRevision(dto) ?? dto.revisions.at(-1) ?? null;
  const components = revision?.lines.map(mapBomLine) ?? [];
  const operations = revision?.operations.map(mapBomOperation) ?? [];

  return {
    id: `bom-editor-${dto.id}`,
    companyId: dto.companyId,
    bomId: dto.id,
    itemId: dto.itemId,
    revisionId: revision?.id ?? null,
    bomCode: dto.bomCode,
    bomName: dto.bomName,
    itemLabel: `Item ${dto.itemId}`,
    revisionCode: revision?.revisionCode ?? "No revision",
    status: revision?.approvalStatus ?? dto.status,
    effectiveFrom: dateLabel(revision?.effectiveFrom),
    effectiveTo: revision?.effectiveTo ?? null,
    defaultIssueMethod: components.at(0)?.issueMethod ?? "Manual",
    routingId: revision?.routingId ?? null,
    changeSummary: revision?.changeSummary ?? null,
    isPhantomParentAllowed: revision?.isPhantomParentAllowed ?? false,
    lineCount: components.length,
    operationCount: operations.length,
    source,
    validationNotes: revision?.approvalStatus === "Approved" ? ["Approved revisions are locked; clone before editing."] : ["Draft revision can be edited before approval."],
    components,
    operations
  };
}

const seededBomEditors: BomEditorItem[] = bomRecords.map((record, index) => {
  const operations: BomEditorOperationItem[] = [
    {
      id: `${record.id}-op-cut`,
      sequenceNo: 10,
      routingOperationId: null,
      operationId: null,
      operationLabel: "Cutting and forming",
      setupMinutes: 35,
      runMinutesPerUnit: 18,
      teardownMinutes: 10,
      requiresQcCheckpoint: false,
      isOptional: false
    },
    {
      id: `${record.id}-op-assembly`,
      sequenceNo: 20,
      routingOperationId: null,
      operationId: null,
      operationLabel: "Assembly and pressure test",
      setupMinutes: 20,
      runMinutesPerUnit: 24,
      teardownMinutes: 8,
      requiresQcCheckpoint: true,
      isOptional: false
    }
  ];

  return {
    id: `${record.id}-editor`,
    companyId: 1,
    bomId: index + 1,
    itemId: index + 101,
    revisionId: null,
    bomCode: record.itemCode,
    bomName: record.parentItem,
    itemLabel: `${record.itemCode} / ${record.parentItem}`,
    revisionCode: record.revision,
    status: record.status,
    effectiveFrom: record.effectiveFrom,
    effectiveTo: null,
    defaultIssueMethod: record.issueMethod,
    routingId: null,
    changeSummary: record.status === "Approved" ? "Released revision remains locked for production." : "Draft revision can be adjusted before approval.",
    isPhantomParentAllowed: false,
    lineCount: record.components.length,
    operationCount: operations.length,
    source: "Seeded",
    validationNotes: record.status === "Approved" ? ["Approved revisions are locked; clone before editing."] : ["Draft revision can be edited before approval."],
    components: record.components.map((component, componentIndex) => ({
      id: `${record.id}-editor-component-${component.code}`,
      sequenceNo: (componentIndex + 1) * 10,
      componentItemId: componentIndex + 201,
      componentLabel: `${component.code} / ${component.name}`,
      issueUomId: 1,
      quantityPer: component.qtyPer,
      scrapPercent: component.recommendation === "MAKE" ? 1.5 : 3,
      issueMethod: record.issueMethod,
      recommendation: component.recommendation,
      effectiveWindow: `${record.effectiveFrom} to Open`,
      alternateItemId: null,
      effectiveFrom: record.effectiveFrom,
      effectiveTo: null
    })),
    operations
  };
});

const seededBomComparisons: BomComparisonItem[] = seededBomEditors.map((bom) => ({
  id: `${bom.id}-comparison`,
  bomCode: bom.bomCode,
  itemLabel: bom.itemLabel,
  fromRevision: bom.revisionCode === "R3" ? "R2" : "Previous",
  toRevision: bom.revisionCode,
  quantityDeltaCount: Math.max(bom.lineCount - 1, 1),
  operationDeltaCount: bom.operationCount > 1 ? 1 : 0,
  costSignal: bom.status === "Approved" ? "Material cost +2.8%" : "Cost pending review",
  status: bom.status,
  source: bom.source,
  differences: [
    {
      id: `${bom.id}-diff-qty`,
      field: "RM-SS-SHEET quantity",
      before: "2.250",
      after: "2.500",
      impact: "Material requirement increased"
    },
    {
      id: `${bom.id}-diff-qc`,
      field: "Pressure test QC",
      before: "Optional",
      after: "Required",
      impact: "Inspection checkpoint added"
    }
  ]
}));

const seededEcoRevisions: EcoRevisionItem[] = [
  {
    id: "eco-seeded-1",
    ecoId: null,
    ecoCode: "ECO-2026-0007",
    ecoTitle: "OZ-50 nozzle update and QC hold release",
    changeType: "BOM Revision",
    requestedOn: "2026-02-18",
    effectiveFrom: "2026-03-01",
    approvalStatus: "Submitted",
    reasonCode: "CUSTOMER-SPEC",
    impactedLineCount: 2,
    source: "Seeded",
    lines: [
      {
        id: "eco-seeded-1-line-1",
        lineNo: 10,
        impactType: "BOM_LINE",
        actionType: "Update",
        targetLabel: "RM-SS-SHEET",
        before: "2.250",
        after: "2.500"
      },
      {
        id: "eco-seeded-1-line-2",
        lineNo: 20,
        impactType: "BOM_OPERATION",
        actionType: "Add QC",
        targetLabel: "Assembly and pressure test",
        before: "Optional",
        after: "Required"
      }
    ]
  }
];

const seededRoutings: RoutingLibraryItem[] = [
  {
    id: "routing-seeded-1",
    routingId: null,
    companyId: 1,
    routingCode: "RT-OZ50-R3",
    routingName: "OZ-50 tank assembly routing",
    outputItemId: null,
    outputItemLabel: "FG-OZ-50 / OZ-50 Tank Assembly",
    revisionCode: "R3",
    status: "Active",
    operationCount: 4,
    totalCycleMinutes: 145,
    source: "Seeded",
    operations: [
      {
        id: "routing-seeded-1-op-10",
        sequenceNo: 10,
        operationId: 1,
        workCenterId: 1,
        toolId: null,
        operationLabel: "Cutting and forming",
        workCenterLabel: "WC-FAB",
        setupMinutes: 35,
        runMinutesPerUnit: 18,
        teardownMinutes: 10,
        overlapPercent: "0%",
        overlapPercentValue: 0,
        requiresQcCheckpoint: false,
        isOutsideProcessing: false,
        status: "Active"
      },
      {
        id: "routing-seeded-1-op-20",
        sequenceNo: 20,
        operationId: 2,
        workCenterId: 2,
        toolId: null,
        operationLabel: "Welding",
        workCenterLabel: "WC-WELD",
        setupMinutes: 25,
        runMinutesPerUnit: 28,
        teardownMinutes: 12,
        overlapPercent: "10%",
        overlapPercentValue: 10,
        requiresQcCheckpoint: true,
        isOutsideProcessing: false,
        status: "Active"
      }
    ]
  }
];

const seededOperations: OperationStandardItem[] = [
  {
    id: "operation-seeded-1",
    operationId: null,
    companyId: 1,
    operationCode: "OP-CUT-FORM",
    operationName: "Cutting and forming",
    operationType: "Fabrication",
    defaultWorkCenterId: null,
    defaultWorkCenterLabel: "WC-FAB",
    setupMinutes: 35,
    runMinutesPerUnit: 18,
    teardownMinutes: 10,
    allowsOverlap: true,
    isOutsideProcessing: false,
    requiresQcCheckpoint: false,
    status: "Active",
    source: "Seeded"
  },
  {
    id: "operation-seeded-2",
    operationId: null,
    companyId: 1,
    operationCode: "OP-PRESSURE-QC",
    operationName: "Pressure test checkpoint",
    operationType: "Quality",
    defaultWorkCenterId: null,
    defaultWorkCenterLabel: "WC-QC",
    setupMinutes: 15,
    runMinutesPerUnit: 12,
    teardownMinutes: 8,
    allowsOverlap: false,
    isOutsideProcessing: false,
    requiresQcCheckpoint: true,
    status: "Active",
    source: "Seeded"
  }
];

const seededAlternateItems: AlternateItemRuleItem[] = [
  {
    id: "alternate-seeded-1",
    alternateItemId: 302,
    alternateRuleId: null,
    bomId: 1,
    companyId: 1,
    effectiveFrom: "2026-03-01",
    effectiveTo: null,
    primaryItemId: 301,
    primaryItemLabel: "RM-SS-SHEET / Stainless Steel Sheet",
    alternateItemLabel: "RM-SS-SHEET-ALT / Alternate SS sheet",
    contextType: "BOM",
    bomLabel: "FG-OZ-50",
    priorityRank: 1,
    effectiveWindow: "2026-03-01 to Open",
    approvalStatus: "Approved",
    reasonCode: "SUPPLY-RISK",
    source: "Seeded"
  }
];

const seededEngineeringAttachments: EngineeringAttachmentItem[] = [
  {
    id: "eng-doc-seeded-1",
    attachmentId: null,
    branchId: 1,
    companyId: 1,
    contentType: "application/pdf",
    documentNo: "BOM-FG-OZ-50-R3",
    fileName: "oz50-tank-assembly-r3.pdf",
    fileSizeBytes: 1887437,
    linkedRecord: "FG-OZ-50 / BOM R3",
    relatedDocumentId: 1,
    relatedDocumentType: "BOM",
    documentType: "Drawing",
    revisionCode: "R3",
    uploadedOn: "2026-02-15",
    uploadedByUserId: null,
    status: "Linked",
    source: "Deferred"
  },
  {
    id: "eng-doc-seeded-2",
    attachmentId: null,
    branchId: 1,
    companyId: 1,
    contentType: "application/pdf",
    documentNo: "ECO-2026-0007",
    fileName: "nozzle-update-customer-spec.pdf",
    fileSizeBytes: 757760,
    linkedRecord: "ECO-2026-0007",
    relatedDocumentId: 7,
    relatedDocumentType: "ECO",
    documentType: "Spec",
    revisionCode: "Draft",
    uploadedOn: "2026-02-18",
    uploadedByUserId: null,
    status: "Review",
    source: "Deferred"
  }
];

function mapComparison(dto: BomDto, source: MasterDataSource): BomComparisonItem {
  const revisions = [...dto.revisions].sort((a, b) => a.revisionCode.localeCompare(b.revisionCode));
  const from = revisions.at(-2) ?? revisions[0] ?? null;
  const to = getReleasedRevision(dto) ?? revisions.at(-1) ?? null;
  const fromLines = from?.lines.length ?? 0;
  const toLines = to?.lines.length ?? 0;
  const fromOps = from?.operations.length ?? 0;
  const toOps = to?.operations.length ?? 0;

  return {
    id: `bom-comparison-${dto.id}`,
    bomCode: dto.bomCode,
    itemLabel: `Item ${dto.itemId}`,
    fromRevision: from?.revisionCode ?? "None",
    toRevision: to?.revisionCode ?? "None",
    quantityDeltaCount: Math.abs(toLines - fromLines),
    operationDeltaCount: Math.abs(toOps - fromOps),
    costSignal: toLines > fromLines ? "Material cost likely increased" : "No material cost delta",
    status: to?.approvalStatus ?? dto.status,
    source,
    differences: [
      {
        id: `bom-comparison-${dto.id}-lines`,
        field: "Component line count",
        before: String(fromLines),
        after: String(toLines),
        impact: toLines === fromLines ? "No line count change" : "Planner review required"
      },
      {
        id: `bom-comparison-${dto.id}-ops`,
        field: "Operation count",
        before: String(fromOps),
        after: String(toOps),
        impact: toOps === fromOps ? "No routing impact" : "Capacity review required"
      }
    ]
  };
}

function mapEcoLine(line: EngineeringChangeLineDto): EcoRevisionLineItem {
  return {
    id: `eco-line-${line.id}`,
    lineNo: line.lineNo,
    impactType: line.impactType,
    actionType: line.actionType,
    targetLabel: `Target ${line.targetEntityId}`,
    before: line.fromValueSummary ?? "None",
    after: line.toValueSummary ?? "None"
  };
}

function mapEco(dto: EngineeringChangeDto, source: MasterDataSource): EcoRevisionItem {
  return {
    id: `eco-${dto.id}`,
    ecoId: dto.id,
    ecoCode: dto.ecoCode,
    ecoTitle: dto.ecoTitle,
    changeType: dto.changeType,
    requestedOn: dto.requestedOn.slice(0, 10),
    effectiveFrom: dateLabel(dto.effectiveFrom),
    approvalStatus: dto.approvalStatus,
    reasonCode: dto.reasonCode ?? "Not specified",
    impactedLineCount: dto.lines.length,
    source,
    lines: dto.lines.map(mapEcoLine)
  };
}

function mapRoutingOperation(operation: RoutingOperationDto): RoutingOperationStepItem {
  return {
    id: `routing-operation-${operation.id}`,
    sequenceNo: operation.sequenceNo,
    operationId: operation.operationId,
    workCenterId: operation.workCenterId,
    toolId: operation.toolId,
    operationLabel: `Operation ${operation.operationId}`,
    workCenterLabel: operation.workCenterId ? `Work center ${operation.workCenterId}` : "Unassigned",
    setupMinutes: operation.setupMinutes,
    runMinutesPerUnit: operation.runMinutesPerUnit,
    teardownMinutes: operation.teardownMinutes,
    overlapPercent: operation.overlapPercent === null ? "None" : `${operation.overlapPercent}%`,
    overlapPercentValue: operation.overlapPercent,
    requiresQcCheckpoint: operation.requiresQcCheckpoint,
    isOutsideProcessing: operation.isOutsideProcessing,
    status: operation.status
  };
}

function mapRouting(dto: RoutingDto, source: MasterDataSource): RoutingLibraryItem {
  const operations = dto.operations.map(mapRoutingOperation);
  return {
    id: `routing-${dto.id}`,
    routingId: dto.id,
    companyId: dto.companyId,
    routingCode: dto.routingCode,
    routingName: dto.routingName,
    outputItemId: dto.outputItemId,
    outputItemLabel: dto.outputItemId ? `Item ${dto.outputItemId}` : "Reusable routing",
    revisionCode: dto.revisionCode ?? "Standard",
    status: dto.status,
    operationCount: operations.length,
    totalCycleMinutes: operations.reduce((total, operation) => total + operation.setupMinutes + operation.runMinutesPerUnit + operation.teardownMinutes, 0),
    source,
    operations
  };
}

export function mapRoutingRecord(dto: RoutingDto, source: MasterDataSource = "Live") {
  return mapRouting(dto, source);
}

function mapOperation(dto: OperationDto, source: MasterDataSource): OperationStandardItem {
  return {
    id: `operation-${dto.id}`,
    operationId: dto.id,
    companyId: dto.companyId,
    operationCode: dto.operationCode,
    operationName: dto.operationName,
    operationType: dto.operationType,
    defaultWorkCenterId: dto.defaultWorkCenterId,
    defaultWorkCenterLabel: dto.defaultWorkCenterId ? `Work center ${dto.defaultWorkCenterId}` : "Unassigned",
    setupMinutes: dto.defaultSetupMinutes,
    runMinutesPerUnit: dto.defaultRunMinutesPerUnit,
    teardownMinutes: dto.defaultTeardownMinutes,
    allowsOverlap: dto.allowsOverlap,
    isOutsideProcessing: dto.isOutsideProcessing,
    requiresQcCheckpoint: dto.requiresQcCheckpoint,
    status: dto.status,
    source
  };
}

export function mapOperationRecord(dto: OperationDto, source: MasterDataSource = "Live") {
  return mapOperation(dto, source);
}

function mapAlternate(dto: AlternateItemDto, source: MasterDataSource): AlternateItemRuleItem {
  return {
    id: `alternate-${dto.id}`,
    alternateItemId: dto.alternateItemId,
    alternateRuleId: dto.id,
    bomId: dto.bomId,
    companyId: dto.companyId,
    effectiveFrom: dto.effectiveFrom,
    effectiveTo: dto.effectiveTo,
    primaryItemId: dto.primaryItemId,
    primaryItemLabel: `Item ${dto.primaryItemId}`,
    alternateItemLabel: `Item ${dto.alternateItemId}`,
    contextType: dto.contextType,
    bomLabel: dto.bomId ? `BOM ${dto.bomId}` : "Global",
    priorityRank: dto.priorityRank,
    effectiveWindow: `${dateLabel(dto.effectiveFrom)} to ${dateLabel(dto.effectiveTo)}`,
    approvalStatus: dto.approvalStatus,
    reasonCode: dto.reasonCode ?? "Not specified",
    source
  };
}

export function mapAlternateRecord(dto: AlternateItemDto, source: MasterDataSource = "Live") {
  return mapAlternate(dto, source);
}

function mapAttachment(dto: AttachmentDto, source: MasterDataSource): EngineeringAttachmentItem {
  return {
    id: `engineering-attachment-${dto.id}`,
    attachmentId: dto.id,
    branchId: dto.branchId,
    companyId: dto.companyId,
    contentType: dto.contentType,
    documentNo: `${dto.relatedDocumentType.toUpperCase()}-${dto.relatedDocumentId}`,
    fileName: dto.fileName,
    fileSizeBytes: dto.fileSizeBytes,
    linkedRecord: `${dto.relatedDocumentType} ${dto.relatedDocumentId}`,
    relatedDocumentId: dto.relatedDocumentId,
    relatedDocumentType: dto.relatedDocumentType,
    documentType: dto.contentType,
    revisionCode: "Linked",
    uploadedOn: dateLabel(dto.createdOn),
    uploadedByUserId: dto.uploadedByUserId,
    status: dto.status,
    source
  };
}

export function mapEngineeringAttachmentRecord(dto: AttachmentDto, source: MasterDataSource = "Live") {
  return mapAttachment(dto, source);
}

export async function listBomEditorSetup(session: AuthSessionResponse | null | undefined, filter: QueryFilter): Promise<BomEditorItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededBomEditors, filter, (item) => `${item.bomCode} ${item.bomName} ${item.status}`);
  }

  try {
    const response = await apiClient.engineering.boms(filter);
    return response.items.map((item) => mapBomEditor(item, "Live"));
  } catch {
    throw liveDataUnavailable("BOM editor");
  }
}

export async function listBomComparisonSetup(session: AuthSessionResponse | null | undefined, filter: QueryFilter): Promise<BomComparisonItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededBomComparisons, filter, (item) => `${item.bomCode} ${item.itemLabel} ${item.status}`);
  }

  try {
    const response = await apiClient.engineering.boms(filter);
    return response.items.map((item) => mapComparison(item, "Live"));
  } catch {
    throw liveDataUnavailable("BOM comparison");
  }
}

export async function listEcoRevisionSetup(session: AuthSessionResponse | null | undefined, filter: QueryFilter): Promise<EcoRevisionItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededEcoRevisions, filter, (item) => `${item.ecoCode} ${item.ecoTitle} ${item.approvalStatus}`);
  }

  try {
    const response = await apiClient.engineering.engineeringChanges(filter);
    return response.items.map((item) => mapEco(item, "Live"));
  } catch {
    throw liveDataUnavailable("ECO");
  }
}

export async function listRoutingLibrarySetup(session: AuthSessionResponse | null | undefined, filter: QueryFilter): Promise<RoutingLibraryItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededRoutings, filter, (item) => `${item.routingCode} ${item.routingName} ${item.status}`);
  }

  try {
    const response = await apiClient.engineering.routings(filter);
    return response.items.map((item) => mapRouting(item, "Live"));
  } catch {
    throw liveDataUnavailable("Routing");
  }
}

export async function listOperationStandardSetup(session: AuthSessionResponse | null | undefined, filter: QueryFilter): Promise<OperationStandardItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededOperations, filter, (item) => `${item.operationCode} ${item.operationName} ${item.status}`);
  }

  try {
    const response = await apiClient.resources.operations(filter);
    return response.items.map((item) => mapOperation(item, "Live"));
  } catch {
    throw liveDataUnavailable("Operation standard");
  }
}

export async function listAlternateItemRuleSetup(session: AuthSessionResponse | null | undefined, filter: QueryFilter): Promise<AlternateItemRuleItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededAlternateItems, filter, (item) => `${item.primaryItemLabel} ${item.alternateItemLabel} ${item.approvalStatus}`);
  }

  try {
    const response = await apiClient.engineering.alternateItems(filter);
    return response.items.map((item) => mapAlternate(item, "Live"));
  } catch {
    throw liveDataUnavailable("Alternate item");
  }
}

export async function listEngineeringAttachmentSetup(
  session: AuthSessionResponse | null | undefined,
  filter: AttachmentFilter): Promise<EngineeringAttachmentItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededEngineeringAttachments, filter, (item) => `${item.documentNo} ${item.fileName} ${item.linkedRecord} ${item.status}`);
  }

  try {
    const response = await apiClient.platform.attachments(filter);
    return response.items.map((item) => mapAttachment(item, "Live"));
  } catch {
    throw liveDataUnavailable("Engineering document");
  }
}

export function isLiveEngineeringRecord(item: { source: MasterDataSource } | null | undefined) {
  return Boolean(item && item.source === "Live");
}

export async function cloneBomEditorRevision(item: BomEditorItem) {
  if (!item.revisionId) {
    throw new Error("A live BOM revision is required before cloning.");
  }

  return apiClient.engineering.cloneBomRevision(item.bomId, item.revisionId);
}

export async function submitEngineeringChange(item: EcoRevisionItem) {
  if (!item.ecoId) {
    throw new Error("A live engineering change is required before submission.");
  }

  return apiClient.engineering.submitEngineeringChange(item.ecoId);
}

export async function approveEngineeringChange(item: EcoRevisionItem) {
  if (!item.ecoId) {
    throw new Error("A live engineering change is required before approval.");
  }

  return apiClient.engineering.approveEngineeringChange(item.ecoId);
}

export async function implementEngineeringChange(item: EcoRevisionItem) {
  if (!item.ecoId) {
    throw new Error("A live engineering change is required before implementation.");
  }

  return apiClient.engineering.implementEngineeringChange(item.ecoId);
}
