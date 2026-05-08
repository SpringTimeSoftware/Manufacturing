import type { AuthSessionResponse, BomDto, BomLineDto, BomRevisionDto, QueryFilter } from "../api/contracts";
import { apiClient } from "../api/http";
import { liveDataUnavailable } from "../api/liveData";
import { bomRecords } from "../api/mockData";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface BomComponentPreviewItem {
  id: string;
  sequenceNo: number;
  componentLabel: string;
  quantityPer: string;
  issueMethod: string;
  scrapPercent: number;
  isPhantom: boolean;
}

export interface BomRevisionPreviewItem {
  id: string;
  revisionId: number | null;
  revisionCode: string;
  effectiveFrom: string;
  approvalStatus: string;
  lineCount: number;
  operationCount: number;
}

export interface BomLibrarySetupItem {
  id: string;
  bomId: number;
  bomCode: string;
  bomName: string;
  itemLabel: string;
  currentRevision: string;
  effectiveFrom: string;
  status: string;
  lineCount: number;
  operationCount: number;
  issueSummary: string;
  changeSummary: string;
  source: MasterDataSource;
  components: BomComponentPreviewItem[];
  revisions: BomRevisionPreviewItem[];
}

const seededBoms: BomLibrarySetupItem[] = bomRecords.map((record, index) => ({
  id: record.id,
  bomId: index + 1,
  bomCode: record.itemCode,
  bomName: record.parentItem,
  itemLabel: `${record.itemCode} / ${record.parentItem}`,
  currentRevision: record.revision,
  effectiveFrom: record.effectiveFrom,
  status: record.status,
  lineCount: record.components.length,
  operationCount: record.components.length + 1,
  issueSummary: record.issueMethod,
  changeSummary: record.status === "Draft" ? "Approval workflow is still incomplete." : "Released revision is locked for production use.",
  source: "Seeded",
  components: record.components.map((component, componentIndex) => ({
    id: `${record.id}-component-${component.code}`,
    sequenceNo: (componentIndex + 1) * 10,
    componentLabel: `${component.code} / ${component.name}`,
    quantityPer: component.qtyPer,
    issueMethod: record.issueMethod,
    scrapPercent: component.recommendation === "MAKE" ? 1.5 : 0.5,
    isPhantom: component.recommendation === "MAKE"
  })),
  revisions: [
    {
      id: `${record.id}-revision-${record.revision}`,
      revisionId: null,
      revisionCode: record.revision,
      effectiveFrom: record.effectiveFrom,
      approvalStatus: record.status,
      lineCount: record.components.length,
      operationCount: record.components.length + 1
    }
  ]
}));

function hasLiveSession(session: AuthSessionResponse | null | undefined) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

function matchesFilter(value: string, search?: string, status?: string) {
  const searchText = search?.trim().toLowerCase();
  const statusText = status?.trim().toLowerCase();
  const matchesSearch = !searchText || value.toLowerCase().includes(searchText);
  const matchesStatus = !statusText || statusText === "all" || value.toLowerCase().includes(statusText);

  return matchesSearch && matchesStatus;
}

function filterSeeded(items: BomLibrarySetupItem[], filter: QueryFilter) {
  return items.filter((item) => matchesFilter(`${item.bomCode} ${item.bomName} ${item.itemLabel} ${item.status}`, filter.search, filter.status));
}

function getReleasedRevision(dto: BomDto) {
  return dto.revisions.find((revision) => revision.id === dto.currentReleasedRevisionId) ?? dto.revisions[0] ?? null;
}

function mapComponent(line: BomLineDto): BomComponentPreviewItem {
  return {
    id: `bom-line-${line.id}`,
    sequenceNo: line.sequenceNo,
    componentLabel: `Item ${line.componentItemId}`,
    quantityPer: `${line.quantityPer}`,
    issueMethod: line.issueMethod,
    scrapPercent: line.scrapPercent,
    isPhantom: line.isPhantom
  };
}

function mapRevision(revision: BomRevisionDto): BomRevisionPreviewItem {
  return {
    id: `bom-revision-${revision.id}`,
    revisionId: revision.id,
    revisionCode: revision.revisionCode,
    effectiveFrom: revision.effectiveFrom ?? "Open",
    approvalStatus: revision.approvalStatus,
    lineCount: revision.lines.length,
    operationCount: revision.operations.length
  };
}

function mapBom(dto: BomDto, source: MasterDataSource): BomLibrarySetupItem {
  const currentRevision = getReleasedRevision(dto);

  return {
    id: `bom-${dto.id}`,
    bomId: dto.id,
    bomCode: dto.bomCode,
    bomName: dto.bomName,
    itemLabel: `Item ${dto.itemId}`,
    currentRevision: currentRevision?.revisionCode ?? "No revision",
    effectiveFrom: currentRevision?.effectiveFrom ?? "Open",
    status: dto.status,
    lineCount: currentRevision?.lines.length ?? 0,
    operationCount: currentRevision?.operations.length ?? 0,
    issueSummary: currentRevision ? `${currentRevision.lines.length} components / ${currentRevision.operations.length} operations` : "No released structure",
    changeSummary: currentRevision?.changeSummary ?? "No change summary",
    source,
    components: currentRevision?.lines.map(mapComponent) ?? [],
    revisions: dto.revisions.map(mapRevision)
  };
}

export async function listBomLibrarySetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<BomLibrarySetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededBoms, filter);
  }

  try {
    const response = await apiClient.engineering.boms(filter);
    return response.items.map((item) => mapBom(item, "Live"));
  } catch {
    throw liveDataUnavailable("BOM library");
  }
}

export function isLiveBomRecord(item: BomLibrarySetupItem | null | undefined) {
  return Boolean(item && item.source === "Live");
}

export async function approveBomRevision(item: BomLibrarySetupItem, revisionId: number) {
  return apiClient.engineering.approveBomRevision(item.bomId, revisionId);
}

export async function cloneBomRevision(item: BomLibrarySetupItem, revisionId: number) {
  return apiClient.engineering.cloneBomRevision(item.bomId, revisionId);
}
