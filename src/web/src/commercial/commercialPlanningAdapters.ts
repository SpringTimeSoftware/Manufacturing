import type {
  AttachmentDto,
  AuthSessionResponse,
  BlanketOrderDto,
  DemandForecastDto,
  MasterProductionScheduleDto,
  QueryFilter,
  QuoteDto,
  QuoteUpsertRequest,
  SalesOrderDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import { hasLiveSession, liveDataUnavailable } from "../api/liveData";
import type { MasterDataSource } from "../masters/masterDataAdapters";

export interface AttachmentViewerItem {
  id: string;
  documentNo: string;
  linkedDocument: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  uploadedOn: string;
  status: string;
  source: MasterDataSource;
}

export interface QuoteSetupItem {
  id: string;
  quoteId: number;
  quoteNo: string;
  customerLabel: string;
  quoteDate: string;
  expiryDate: string;
  priorityCode: string;
  status: string;
  lineCount: number;
  totalQuantity: number;
  specRef: string;
  source: MasterDataSource;
}

export interface SalesOrderSetupItem {
  id: string;
  salesOrderId: number;
  salesOrderNo: string;
  customerLabel: string;
  orderDate: string;
  promisedDate: string;
  priorityCode: string;
  status: string;
  lineCount: number;
  totalQuantity: number;
  sourceQuoteLabel: string;
  source: MasterDataSource;
}

export interface BlanketOrderSetupItem {
  id: string;
  blanketOrderId: number;
  blanketOrderNo: string;
  customerLabel: string;
  horizon: string;
  status: string;
  scheduleCount: number;
  totalQuantity: number;
  nextRelease: string;
  source: MasterDataSource;
}

export interface DemandForecastSetupItem {
  id: string;
  forecastId: number;
  forecastCode: string;
  forecastName: string;
  periodType: string;
  status: string;
  bucketCount: number;
  totalQuantity: number;
  horizon: string;
  source: MasterDataSource;
}

export interface MpsPlannerItem {
  id: string;
  mpsId: number;
  mpsCode: string;
  horizon: string;
  status: string;
  lineCount: number;
  plannedQuantity: number;
  firstBucket: string;
  source: MasterDataSource;
}

export interface AvailablePromiseItem {
  id: string;
  orderRef: string;
  customerLabel: string;
  itemLabel: string;
  requestedDate: string;
  promisedDate: string;
  materialSignal: string;
  capacitySignal: string;
  promiseStatus: string;
  status: string;
  source: MasterDataSource;
}

const seededAttachments: AttachmentViewerItem[] = [
  {
    id: "attachment-drawing-oz50",
    documentNo: "DOC-BOM-OZ50-R3",
    linkedDocument: "BOM FG-OZ-50 R3",
    fileName: "oz50-tank-assembly-r3.pdf",
    fileType: "PDF drawing",
    fileSize: "1.8 MB",
    uploadedBy: "Engineering",
    uploadedOn: "2026-01-10",
    status: "Approved",
    source: "Deferred"
  },
  {
    id: "attachment-customer-spec",
    documentNo: "DOC-SO-0189-SPEC",
    linkedDocument: "SO-2026-0189",
    fileName: "enkay-customer-specification.pdf",
    fileType: "Customer spec",
    fileSize: "740 KB",
    uploadedBy: "Sales",
    uploadedOn: "2026-02-24",
    status: "Linked",
    source: "Deferred"
  },
  {
    id: "attachment-qc-photo",
    documentNo: "DOC-QC-HOLD-104",
    linkedDocument: "QC Hold Cage",
    fileName: "incoming-sheet-surface-photo.jpg",
    fileType: "Photo",
    fileSize: "3.4 MB",
    uploadedBy: "QC",
    uploadedOn: "2026-02-28",
    status: "Review",
    source: "Deferred"
  }
];

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapAttachment(item: AttachmentDto): AttachmentViewerItem {
  return {
    id: String(item.id),
    documentNo: `${item.relatedDocumentType}-${item.relatedDocumentId}`,
    linkedDocument: `${item.relatedDocumentType} #${item.relatedDocumentId}`,
    fileName: item.fileName,
    fileType: item.contentType,
    fileSize: formatFileSize(item.fileSizeBytes),
    uploadedBy: item.uploadedByUserId ? `User ${item.uploadedByUserId}` : "System",
    uploadedOn: item.createdOn.slice(0, 10),
    status: item.status,
    source: "Live"
  };
}

const seededQuotes: QuoteSetupItem[] = [
  {
    id: "quote-1001",
    quoteId: 1001,
    quoteNo: "QT-2026-0042",
    customerLabel: "Enkay Ozone",
    quoteDate: "2026-02-20",
    expiryDate: "2026-03-15",
    priorityCode: "High",
    status: "Submitted",
    lineCount: 2,
    totalQuantity: 18,
    specRef: "OZ50-MTO-SPEC",
    source: "Seeded"
  },
  {
    id: "quote-1002",
    quoteId: 1002,
    quoteNo: "QT-2026-0047",
    customerLabel: "BlueSky Industries",
    quoteDate: "2026-02-26",
    expiryDate: "2026-03-22",
    priorityCode: "Medium",
    status: "Draft",
    lineCount: 1,
    totalQuantity: 6,
    specRef: "Pressure-regulator option",
    source: "Seeded"
  }
];

const seededSalesOrders: SalesOrderSetupItem[] = [
  {
    id: "sales-order-189",
    salesOrderId: 189,
    salesOrderNo: "SO-2026-0189",
    customerLabel: "Enkay Ozone",
    orderDate: "2026-02-24",
    promisedDate: "2026-03-05",
    priorityCode: "High",
    status: "At Risk",
    lineCount: 2,
    totalQuantity: 10,
    sourceQuoteLabel: "QT-2026-0042",
    source: "Seeded"
  },
  {
    id: "sales-order-194",
    salesOrderId: 194,
    salesOrderNo: "SO-2026-0194",
    customerLabel: "BlueSky Industries",
    orderDate: "2026-02-27",
    promisedDate: "2026-03-12",
    priorityCode: "Medium",
    status: "Released",
    lineCount: 1,
    totalQuantity: 4,
    sourceQuoteLabel: "Direct order",
    source: "Seeded"
  }
];

const seededBlanketOrders: BlanketOrderSetupItem[] = [
  {
    id: "blanket-enkay-2026",
    blanketOrderId: 3001,
    blanketOrderNo: "BLK-ENKAY-2026",
    customerLabel: "Enkay Ozone",
    horizon: "2026-01-01 to 2026-06-30",
    status: "Active",
    scheduleCount: 6,
    totalQuantity: 72,
    nextRelease: "2026-03-15 / 12 units",
    source: "Seeded"
  },
  {
    id: "blanket-bluesky-q2",
    blanketOrderId: 3002,
    blanketOrderNo: "BLK-BLUESKY-Q2",
    customerLabel: "BlueSky Industries",
    horizon: "2026-04-01 to 2026-06-30",
    status: "Draft",
    scheduleCount: 3,
    totalQuantity: 24,
    nextRelease: "2026-04-05 / 8 units",
    source: "Seeded"
  }
];

const seededForecasts: DemandForecastSetupItem[] = [
  {
    id: "forecast-march",
    forecastId: 4001,
    forecastCode: "FCST-2026-M03",
    forecastName: "March fabrication forecast",
    periodType: "Monthly",
    status: "Approved",
    bucketCount: 4,
    totalQuantity: 96,
    horizon: "2026-03-01 to 2026-03-31",
    source: "Seeded"
  },
  {
    id: "forecast-q2",
    forecastId: 4002,
    forecastCode: "FCST-2026-Q2",
    forecastName: "Q2 demand intake",
    periodType: "Weekly",
    status: "Draft",
    bucketCount: 12,
    totalQuantity: 240,
    horizon: "2026-04-01 to 2026-06-30",
    source: "Seeded"
  }
];

const seededMps: MpsPlannerItem[] = [
  {
    id: "mps-march",
    mpsId: 5001,
    mpsCode: "MPS-2026-M03",
    horizon: "2026-03-01 to 2026-03-31",
    status: "Firm",
    lineCount: 6,
    plannedQuantity: 118,
    firstBucket: "FG-OZ-50 / 20",
    source: "Seeded"
  },
  {
    id: "mps-april",
    mpsId: 5002,
    mpsCode: "MPS-2026-M04",
    horizon: "2026-04-01 to 2026-04-30",
    status: "Draft",
    lineCount: 5,
    plannedQuantity: 94,
    firstBucket: "WIP-OZG-MOD / 30",
    source: "Seeded"
  }
];

const seededPromiseItems: AvailablePromiseItem[] = [
  {
    id: "promise-so-0189",
    orderRef: "SO-2026-0189",
    customerLabel: "Enkay Ozone",
    itemLabel: "FG-OZ-50 Tank Assembly",
    requestedDate: "2026-03-05",
    promisedDate: "2026-03-09",
    materialSignal: "Supplier delay on RM-SS-SHEET",
    capacitySignal: "Welding slot constrained",
    promiseStatus: "At Risk",
    status: "At Risk",
    source: "Deferred"
  },
  {
    id: "promise-so-0194",
    orderRef: "SO-2026-0194",
    customerLabel: "BlueSky Industries",
    itemLabel: "FG-OZ-30 Tank Assembly",
    requestedDate: "2026-03-12",
    promisedDate: "2026-03-12",
    materialSignal: "Materials available",
    capacitySignal: "Capacity reserved",
    promiseStatus: "Promiseable",
    status: "Promiseable",
    source: "Deferred"
  }
];

function matchesFilter(value: string, search?: string, status?: string) {
  const searchText = search?.trim().toLowerCase();
  const statusText = status?.trim().toLowerCase();
  const matchesSearch = !searchText || value.toLowerCase().includes(searchText);
  const matchesStatus = !statusText || statusText === "all" || value.toLowerCase().includes(statusText);

  return matchesSearch && matchesStatus;
}

function filterSeeded<T extends { status: string }>(items: T[], filter: QueryFilter, label: (item: T) => string) {
  return items.filter((item) => matchesFilter(`${label(item)} ${item.status}`, filter.search, filter.status));
}

function sumQuantities(lines: Array<{ quantity?: number; plannedQuantity?: number }>) {
  return lines.reduce((total, line) => total + (line.quantity ?? line.plannedQuantity ?? 0), 0);
}

function formatHorizon(start: string | null | undefined, end: string | null | undefined) {
  return `${start ?? "Open"} to ${end ?? "Open"}`;
}

function mapQuote(dto: QuoteDto, source: MasterDataSource): QuoteSetupItem {
  return {
    id: `quote-${dto.id}`,
    quoteId: dto.id,
    quoteNo: dto.quoteNo,
    customerLabel: `Customer ${dto.customerId}`,
    quoteDate: dto.quoteDate,
    expiryDate: dto.expiryDate ?? "Open",
    priorityCode: dto.priorityCode,
    status: dto.status,
    lineCount: dto.lines.length,
    totalQuantity: sumQuantities(dto.lines),
    specRef: dto.customerSpecRef ?? "No spec reference",
    source
  };
}

function mapSalesOrder(dto: SalesOrderDto, source: MasterDataSource): SalesOrderSetupItem {
  return {
    id: `sales-order-${dto.id}`,
    salesOrderId: dto.id,
    salesOrderNo: dto.salesOrderNo,
    customerLabel: `Customer ${dto.customerId}`,
    orderDate: dto.orderDate,
    promisedDate: dto.promisedDate ?? "Unpromised",
    priorityCode: dto.priorityCode,
    status: dto.status,
    lineCount: dto.lines.length,
    totalQuantity: sumQuantities(dto.lines),
    sourceQuoteLabel: dto.sourceQuoteId ? `Quote ${dto.sourceQuoteId}` : "Direct order",
    source
  };
}

function mapBlanketOrder(dto: BlanketOrderDto, source: MasterDataSource): BlanketOrderSetupItem {
  const firstSchedule = dto.schedules[0];

  return {
    id: `blanket-order-${dto.id}`,
    blanketOrderId: dto.id,
    blanketOrderNo: dto.blanketOrderNo,
    customerLabel: `Customer ${dto.customerId}`,
    horizon: formatHorizon(dto.startDate, dto.endDate),
    status: dto.status,
    scheduleCount: dto.schedules.length,
    totalQuantity: sumQuantities(dto.schedules),
    nextRelease: firstSchedule ? `${firstSchedule.scheduleDate} / ${firstSchedule.quantity}` : "No schedule",
    source
  };
}

function mapForecast(dto: DemandForecastDto, source: MasterDataSource): DemandForecastSetupItem {
  const starts = dto.lines.map((line) => line.forecastPeriodStart).sort();
  const ends = dto.lines.map((line) => line.forecastPeriodEnd).sort();

  return {
    id: `forecast-${dto.id}`,
    forecastId: dto.id,
    forecastCode: dto.forecastCode,
    forecastName: dto.forecastName,
    periodType: dto.periodType,
    status: dto.status,
    bucketCount: dto.lines.length,
    totalQuantity: sumQuantities(dto.lines),
    horizon: starts.length > 0 ? formatHorizon(starts[0], ends[ends.length - 1]) : "No buckets",
    source
  };
}

function mapMps(dto: MasterProductionScheduleDto, source: MasterDataSource): MpsPlannerItem {
  const firstLine = dto.lines[0];

  return {
    id: `mps-${dto.id}`,
    mpsId: dto.id,
    mpsCode: dto.mpsCode,
    horizon: formatHorizon(dto.planningHorizonStart, dto.planningHorizonEnd),
    status: dto.status,
    lineCount: dto.lines.length,
    plannedQuantity: sumQuantities(dto.lines),
    firstBucket: firstLine ? `Item ${firstLine.itemId} / ${firstLine.plannedQuantity}` : "No lines",
    source
  };
}

export async function listAttachmentViewerSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<AttachmentViewerItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededAttachments, filter, (item) => `${item.documentNo} ${item.linkedDocument} ${item.fileName}`);
  }

  try {
    const response = await apiClient.platform.attachments(filter);
    return response.items.map(mapAttachment);
  } catch {
    throw liveDataUnavailable("Attachment viewer");
  }
}

export async function listQuoteSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<QuoteSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededQuotes, filter, (item) => `${item.quoteNo} ${item.customerLabel} ${item.specRef}`);
  }

  try {
    const response = await apiClient.salesPlanning.quotes(filter);
    return response.items.map((item) => mapQuote(item, "Live"));
  } catch {
    throw liveDataUnavailable("Quote");
  }
}

function requireLiveSession(session: AuthSessionResponse | null | undefined, label: string) {
  if (!hasLiveSession(session)) {
    throw new Error(`Live workspace sign-in is required before saving ${label}.`);
  }
}

export async function saveQuoteDraft(
  session: AuthSessionResponse | null | undefined,
  quoteId: number | null,
  request: QuoteUpsertRequest
) {
  requireLiveSession(session, "quote drafts");
  return quoteId ? apiClient.salesPlanning.updateQuote(quoteId, request) : apiClient.salesPlanning.createQuote(request);
}

export async function listSalesOrderSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<SalesOrderSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededSalesOrders, filter, (item) => `${item.salesOrderNo} ${item.customerLabel} ${item.sourceQuoteLabel}`);
  }

  try {
    const response = await apiClient.salesPlanning.salesOrders(filter);
    return response.items.map((item) => mapSalesOrder(item, "Live"));
  } catch {
    throw liveDataUnavailable("Sales order");
  }
}

export async function listBlanketOrderSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<BlanketOrderSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededBlanketOrders, filter, (item) => `${item.blanketOrderNo} ${item.customerLabel} ${item.nextRelease}`);
  }

  try {
    const response = await apiClient.salesPlanning.blanketOrders(filter);
    return response.items.map((item) => mapBlanketOrder(item, "Live"));
  } catch {
    throw liveDataUnavailable("Blanket order");
  }
}

export async function listDemandForecastSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<DemandForecastSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededForecasts, filter, (item) => `${item.forecastCode} ${item.forecastName} ${item.periodType}`);
  }

  try {
    const response = await apiClient.salesPlanning.forecasts(filter);
    return response.items.map((item) => mapForecast(item, "Live"));
  } catch {
    throw liveDataUnavailable("Demand forecast");
  }
}

export async function listMpsPlannerSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<MpsPlannerItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededMps, filter, (item) => `${item.mpsCode} ${item.horizon} ${item.firstBucket}`);
  }

  try {
    const response = await apiClient.salesPlanning.mps(filter);
    return response.items.map((item) => mapMps(item, "Live"));
  } catch {
    throw liveDataUnavailable("MPS");
  }
}

export async function listAvailablePromiseSetup(filter: QueryFilter): Promise<AvailablePromiseItem[]> {
  return filterSeeded(seededPromiseItems, filter, (item) => `${item.orderRef} ${item.customerLabel} ${item.itemLabel} ${item.materialSignal}`);
}
