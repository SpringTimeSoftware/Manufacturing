export type MobileRole =
  | "ProductionSupervisor"
  | "MachineOperator"
  | "StoreKeeper"
  | "QCInspector"
  | "DispatchManager"
  | "ServiceTechnician"
  | "PlantHead";

export type MobileTone = "info" | "success" | "warn" | "danger" | "neutral";

export type MobileTab =
  | "home"
  | "inbox"
  | "jobs"
  | "execute"
  | "materials"
  | "stock"
  | "machine"
  | "quality"
  | "output"
  | "handover"
  | "dispatch"
  | "service"
  | "orders"
  | "device"
  | "sync"
  | "context";

export interface MobileContext {
  companyId: number;
  companyName: string;
  branchId: number;
  branchName: string;
  warehouseId?: number | null;
  warehouseLabel: string;
}

export interface MobileSession {
  accessToken: string;
  refreshToken?: string;
  userId?: number;
  displayName: string;
  deviceBindingStatus: "Bound" | "Pending";
  deviceCode?: string;
  deviceTrustStatus?: "Trusted" | "Pending" | "Revoked" | string;
  languageCode: string;
  roles: MobileRole[];
  activeContext: MobileContext;
  availableContexts?: MobileContext[];
}

export interface MobileCredentials {
  userName: string;
  password: string;
  deviceName: string;
}

export interface OfflineQueueEntry {
  id: string;
  module: string;
  actionLabel: string;
  documentRef: string;
  queuedOnLabel: string;
  status: "Draft" | "Pending" | "Queued" | "Syncing" | "Synced" | "Failed" | "Conflict" | "Rejected" | "RetryScheduled" | "Cancelled";
  auditLabel: string;
  failureReason?: string | null;
  conflictReason?: string | null;
  idempotencyKey?: string;
  serverReferenceNo?: string | null;
  udfValues?: MobileUdfValue[];
}

export interface SyncSummary {
  lastSyncLabel: string;
  pendingCount: number;
  failedCount: number;
  conflictCount?: number;
}

export interface MobileDeviceRegistration {
  id: number;
  companyId: number;
  branchId: number;
  warehouseId?: number | null;
  deviceCode: string;
  deviceName: string;
  scannerCapability: "HardwareCameraManual" | "HardwareManual" | "ManualOnly" | string;
  cameraCapability: "Available" | "Unavailable" | string;
  offlineCapability: boolean;
  trustStatus: "Trusted" | "Pending" | "Revoked" | string;
  isTrusted: boolean;
  isRevoked: boolean;
  lastSeenOn?: string | null;
  status: string;
  disabledReason?: string | null;
}

export interface MobileRuntimeContext {
  device: MobileDeviceRegistration;
  canPostStock: boolean;
  canWorkOffline: boolean;
  onlineMode: "LiveApi" | string;
  lastSyncAt?: string | null;
  queuedCount: number;
  failedCount: number;
  conflictCount: number;
  disabledReasons: string[];
}

export interface MobileTask {
  id: string;
  module: string;
  taskType: string;
  documentNo: string;
  sourceDocumentId?: number | null;
  title: string;
  subtitle: string;
  status: string;
  disabledReason?: string | null;
  udfValues?: MobileUdfValue[];
}

export interface MobileUdfValue {
  fieldCode: string;
  fieldName: string;
  dataType: string;
  displayValue: string | null;
  entityLevel: "Header" | "Line" | "Evidence" | string;
  isRequired: boolean;
  isReadOnly: boolean;
  sourceVersion: number;
  syncStatus: "Live" | "Queued" | "Conflict" | "Unsupported";
  disabledReason?: string | null;
}

export type MobileScanSource = "Camera" | "Hardware" | "Manual";

export interface MobileScanResult {
  scanEventId: number;
  scanValue: string;
  scanSource: MobileScanSource | string;
  scanContext: string;
  resolutionStatus: "Resolved" | "NotFound" | "Blocked" | string;
  validationMessage?: string | null;
  resolvedEntityType?: string | null;
  resolvedEntityId?: number | null;
  resolvedEntityCode?: string | null;
  scanTimestamp: string;
}

export interface MobilePhotoEvidence {
  id: number;
  sourceModule: string;
  sourceDocumentType: string;
  sourceDocumentId?: number | null;
  sourceDocumentNo?: string | null;
  evidenceType: string;
  fileName?: string | null;
  contentType?: string | null;
  attachmentId?: number | null;
  capturedOn: string;
  uploadStatus: "Uploaded" | "PendingUpload" | "Failed" | string;
  failureReason?: string | null;
}

export interface QueueOfflineOperationInput {
  operationType: string;
  sourceModule: string;
  documentRef: string;
  actionLabel: string;
  payloadSnapshotJson: string;
  idempotencyKey: string;
  udfValues?: MobileUdfValue[];
}

export interface MobileSummaryTile {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone: MobileTone;
}

export interface MobileActionCard {
  id: string;
  title: string;
  subtitle: string;
  targetTab: MobileTab;
  roleHint: string;
  tone: MobileTone;
}

export interface MobileNotification {
  id: string;
  title: string;
  body: string;
  category: "Alert" | "Approval" | "Reminder" | "Escalation";
  documentRef: string;
  createdLabel: string;
  severity: MobileTone;
  actionLabel: string;
}

export interface MobileApproval {
  id: string;
  referenceNo: string;
  title: string;
  summary: string;
  submittedBy: string;
  dueLabel: string;
  status: "Pending" | "Escalated";
  priority: "High" | "Medium" | "Low";
  auditActionLabel: string;
}

export interface MobileJobCard {
  id: string;
  jobCardNo: string;
  workOrderNo: string;
  operationName: string;
  machineLabel: string;
  itemLabel: string;
  plannedQty: number;
  completedGoodQty: number;
  completedRejectQty: number;
  completedScrapQty: number;
  status: "Ready" | "Running" | "Paused" | "QC Hold";
  dueLabel: string;
  specSummary: string;
  attachmentCount: number;
}

export interface MobileTimelineEvent {
  id: string;
  title: string;
  detail: string;
  timeLabel: string;
  tone: MobileTone;
}

export interface QuantityCapturePreset {
  id: string;
  label: string;
  quantity: string;
  reasonCode: string;
  evidenceLabel: string;
}

export interface MaterialScanTask {
  id: string;
  mode: "Issue" | "Return";
  barcodeValue: string;
  itemLabel: string;
  sourceBin: string;
  targetDocument: string;
  quantity: string;
  status: "Ready" | "Queued";
}

export interface InventoryMovementTask {
  id: string;
  mode: "Transfer" | "Putaway" | "CycleCount";
  itemLabel: string;
  fromLocation: string;
  toLocation: string;
  scanValue: string;
  quantity: string;
  status: "Ready" | "Recount" | "Queued";
}

export interface MachineTask {
  id: string;
  machineLabel: string;
  status: "Running" | "Idle" | "Down";
  activeJobCard: string;
  reasonCode: string;
  escalationLabel: string;
}

export interface QualityTask {
  id: string;
  inspectionNo: string;
  checkpointLabel: string;
  sourceDocument: string;
  expectedValue: string;
  actualValue: string;
  result: "Pass" | "Fail" | "Pending";
  photoLabel: string;
}

export interface NcrTask {
  id: string;
  ncrNo: string;
  sourceDocument: string;
  disposition: "Hold" | "Rework" | "UseAsIs";
  instruction: string;
  status: "Open" | "Queued";
}

export interface ProductionOutputTask {
  id: string;
  receiptNo: string;
  workOrderNo: string;
  jobCardNo: string;
  itemLabel: string;
  outputQty: string;
  catchWeightQty: string;
  lotSerialLabel: string;
  status: "Draft" | "Queued";
}

export interface ShiftHandoverTask {
  id: string;
  shiftLabel: string;
  supervisorName: string;
  summary: string;
  pendingIssueLabel: string;
  mediaCount: number;
  nextOwner: string;
  status: "Draft" | "Queued" | "Synced" | "Conflict";
}

export interface MediaUploadTask {
  id: string;
  sourceDocument: string;
  captureType: "Photo" | "Voice" | "Attachment" | "Barcode";
  fileLabel: string;
  noteLabel: string;
  status: "Ready" | "Queued" | "Synced" | "Failed" | "Conflict";
  requiresNetwork: boolean;
}

export interface DispatchProofTask {
  id: string;
  shipmentNo: string;
  customerName: string;
  vehicleRef: string;
  sealNo: string;
  packedItems: number;
  scannedItems: number;
  proofLabel: string;
  status: "Ready" | "Loading" | "ProofQueued" | "Synced";
}

export interface OrderSnapshotTask {
  id: string;
  orderNo: string;
  customerName: string;
  promisedLabel: string;
  completionPercent: number;
  dispatchReadinessPercent: number;
  riskStatus: "OnTrack" | "AtRisk" | "Late";
  blockerLabel: string;
}

export interface StageBoardCard {
  id: string;
  documentNo: string;
  customerName: string;
  blockerLabel: string;
  daysInStage: number;
  ownerRole: string;
  statusLabel: string;
}

export interface StageBoardColumn {
  id: string;
  stageLabel: string;
  countLabel: string;
  tone: MobileTone;
  cards: StageBoardCard[];
}

export interface DeviceUtilityTask {
  id: string;
  utilityName: string;
  capabilityStatus: "Available" | "NeedsPermission" | "OfflineQueued" | "Unavailable";
  actionLabel: string;
  lastUsedLabel: string;
  tone: MobileTone;
}

export interface ConflictResolutionTask {
  id: string;
  documentRef: string;
  localChangeLabel: string;
  serverChangeLabel: string;
  recommendedAction: string;
  status: "Conflict" | "RetryScheduled" | "Rejected";
}

export interface LocalizationOption {
  code: string;
  label: string;
  status: "Active" | "Available";
}

export interface RoleNavigationRule {
  role: MobileRole;
  defaultTab: MobileTab;
  primaryTabs: MobileTab[];
  hiddenReason?: string;
}
