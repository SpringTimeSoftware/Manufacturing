export type RoleCode =
  | "SuperAdmin"
  | "PlatformAdmin"
  | "CompanyAdmin"
  | "SalesCoordinator"
  | "PlanningManager"
  | "PurchaseManager"
  | "StoreKeeper"
  | "ProductionSupervisor"
  | "MachineOperator"
  | "QCInspector"
  | "DispatchManager"
  | "PlantHead"
  | "ManagementViewer";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: ApiEnvelopeError[];
  meta: {
    correlationId: string;
    timestampUtc: string;
  };
}

export interface ApiEnvelopeError {
  code: string;
  field: string | null;
  message: string;
}

export interface QueryFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  companyId?: number;
  branchId?: number;
  [key: string]: string | number | boolean | Array<string | number> | undefined;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AvailableContext {
  companyId: number;
  companyCode: string;
  companyName: string;
  branchId: number;
  branchCode: string;
  branchName: string;
}

export interface DataScopeSnapshot {
  hasDeploymentAccess: boolean;
  visibilityMode: string;
  allowedWarehouseIds: number[];
  allowedDepartmentIds: number[];
  teamUserIds: number[];
}

export interface ActiveContextResponse {
  companyId: number | null;
  branchId: number | null;
  companyCode: string | null;
  companyName: string | null;
  branchCode: string | null;
  branchName: string | null;
}

export interface CurrentUserResponse {
  userId: number;
  userName: string;
  displayName: string;
  email: string | null;
  languageCode: string;
  activeContext: ActiveContextResponse;
  availableContexts: AvailableContext[];
  roles: RoleCode[];
  scope: DataScopeSnapshot;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresOnUtc: string;
  user: CurrentUserResponse;
}

export interface LoginRequest {
  userName: string;
  password: string;
  companyId?: number;
  branchId?: number;
  clientType: "Web";
}

export interface RefreshTokenRequest {
  refreshToken: string;
  clientType: "Web";
}

export interface SwitchOperatingContextRequest {
  companyId: number;
  branchId: number;
  refreshToken?: string;
}

export interface LogoutRequest {
  refreshToken?: string;
  revokeAll?: boolean;
}

export interface TranslationBundleResponse {
  languageCode: string;
  resources: Record<string, string>;
}

export interface ActionResponse {
  id?: string | null;
  status?: string | null;
  referenceNo?: string | null;
  warnings?: string[];
}

export interface AttachmentFilter extends QueryFilter {
  relatedDocumentType?: string;
  relatedDocumentId?: number;
}

export interface AttachmentDto {
  id: number;
  companyId: number | null;
  branchId: number | null;
  relatedDocumentType: string;
  relatedDocumentId: number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedByUserId: number | null;
  createdOn: string;
  status: string;
}

export interface AttachmentUploadRequest {
  companyId?: number | null;
  branchId?: number | null;
  relatedDocumentType: string;
  relatedDocumentId: number;
  file: File;
}

export interface ExportJobDto {
  id: number;
  companyId: number;
  branchId: number;
  jobNo: string;
  module: string;
  outputFormat: string;
  filterJson: string | null;
  storagePath: string;
  status: string;
  requestedOn: string;
  processedOn: string | null;
  lastError: string | null;
}

export interface ExportJobCreateRequest {
  companyId: number;
  branchId: number;
  jobNo: string;
  module: string;
  outputFormat: string;
  filterJson: string | null;
  storagePath: string;
}

export interface IntegrationProviderDto {
  id: number;
  providerCode: string;
  providerName: string;
  providerType: string;
  baseUrl: string | null;
  status: string;
  isSystemBase: boolean;
}

export interface IntegrationProviderUpsertRequest {
  providerCode: string;
  providerName: string;
  providerType: string;
  baseUrl: string | null;
  status: string;
  isSystemBase?: boolean;
}

export interface IntegrationConnectionDto {
  id: number;
  companyId: number;
  branchId: number | null;
  integrationProviderId: number;
  connectionCode: string;
  connectionName: string;
  endpointUrl: string | null;
  credentialReference: string | null;
  status: string;
  lastHealthCheckedOn: string | null;
  lastHealthStatus: string | null;
}

export interface IntegrationConnectionUpsertRequest {
  companyId: number;
  branchId: number | null;
  integrationProviderId: number;
  connectionCode: string;
  connectionName: string;
  endpointUrl: string | null;
  credentialReference: string | null;
  status: string;
}

export interface WebhookSubscriptionDto {
  id: number;
  companyId: number;
  branchId: number | null;
  subscriptionCode: string;
  eventType: string;
  targetUrl: string;
  secretReference: string | null;
  headersJson: string | null;
  status: string;
  lastDeliveredOn: string | null;
  retryQueuedOn: string | null;
}

export interface WebhookSubscriptionUpsertRequest {
  companyId: number;
  branchId: number | null;
  subscriptionCode: string;
  eventType: string;
  targetUrl: string;
  secretReference: string | null;
  headersJson: string | null;
  status: string;
}

export interface ImportJobDto {
  id: number;
  companyId: number;
  branchId: number;
  jobNo: string;
  module: string;
  sourceFormat: string;
  storagePath: string;
  requestToken: string | null;
  status: string;
  requestedOn: string;
  processedOn: string | null;
  lastError: string | null;
}

export interface ImportJobCreateRequest {
  companyId: number;
  branchId: number;
  jobNo: string;
  module: string;
  sourceFormat: string;
  storagePath: string;
  requestToken?: string | null;
}

export interface IntegrationJobStatusUpdateRequest {
  status: string;
  lastError?: string | null;
  failedRowCount?: number | null;
  failureSummary?: string | null;
}

export interface OutboundProviderHealthDto {
  channelType: string;
  providerCode: string | null;
  status: string;
  activeConnectionCount: number;
  notes: string;
}

export interface OutboundDeliveryStatusDto {
  id: number;
  channelType: string;
  redactedRecipientRef: string;
  templateCode: string;
  deliveryStatus: string;
  attemptCount: number;
  createdOn: string;
  processedOn: string | null;
  lastError: string | null;
}

export interface OutboundMessagePreviewRequest {
  companyId: number | null;
  branchId: number | null;
  channelType: string;
  recipientRef: string;
  templateCode: string;
  tokens: Record<string, string>;
}

export interface OutboundMessageRequest extends OutboundMessagePreviewRequest {
  relatedDocumentType?: string | null;
  relatedDocumentId?: number | null;
}

export interface OutboundMessagePreviewDto {
  channelType: string;
  templateCode: string;
  redactedRecipientRef: string;
  renderedMessage: string;
}

export interface WebhookDispatchRequest {
  companyId: number;
  branchId: number | null;
  eventType: string;
  payloadReference: string;
  simulateFailure?: boolean;
}

export interface WebhookDispatchResultDto {
  eventType: string;
  matchedSubscriptions: number;
  deliveredCount: number;
  retryQueuedCount: number;
  operatorMessages: string[];
}

export interface AiProviderDto {
  id: number;
  providerCode: string;
  providerName: string;
  providerType: string;
  status: string;
}

export interface AiModelDto {
  id: number;
  aiProviderId: number;
  modelCode: string;
  modelName: string;
  capabilityFlagsJson: string | null;
  status: string;
}

export interface AiRunDto {
  id: number;
  companyId: number | null;
  branchId: number | null;
  aiProviderId: number;
  aiModelId: number;
  aiPromptTemplateId: number | null;
  draftPurpose: string;
  relatedDocumentType: string | null;
  relatedDocumentId: number | null;
  inputText: string;
  outputText: string | null;
  runStatus: string;
  tokenUsageJson: string | null;
  requiresReview: boolean;
  requestedOn: string;
  completedOn: string | null;
}

export interface AiExecutionPolicyDto {
  draftOnly: boolean;
  allowsOperationalWriteBack: boolean;
  masksPii: boolean;
  reviewRequirement: string;
}

export interface AiProviderHealthDto {
  providerId: number;
  providerCode: string;
  status: string;
  activeModelCount: number;
  notes: string | null;
}

export interface AiAssistantIntentDefinitionDto {
  intentCode: string;
  displayName: string;
  description: string;
  executionKind: string;
  commandName: string;
  allowedParameters: string[];
}

export interface AiAssistantPlanRequest {
  companyId: number | null;
  branchId: number | null;
  intentCode: string;
  parameters: Record<string, string>;
  userQuestion?: string | null;
}

export interface AiAssistantQueryPlanDto {
  intentCode: string;
  displayName: string;
  executionKind: string;
  commandName: string;
  parameters: Array<{ name: string; value: string; source: string }>;
  usesArbitrarySql: boolean;
  requiresReview: boolean;
  safetyNote: string;
}

export interface AiDraftRequest {
  companyId: number | null;
  branchId: number | null;
  aiProviderId: number;
  aiModelId: number;
  aiPromptTemplateId: number | null;
  draftPurpose: string;
  inputText: string;
  relatedDocumentType?: string | null;
  relatedDocumentId?: number | null;
}

export interface TranslationDraftRequest {
  companyId: number | null;
  branchId: number | null;
  aiProviderId: number;
  aiModelId: number;
  aiPromptTemplateId: number | null;
  sourceText: string;
  targetLanguageCode: string;
  sourceLanguageCode?: string | null;
  relatedDocumentType?: string | null;
  relatedDocumentId?: number | null;
}

export interface TranslationDraftDto {
  run: AiRunDto;
  sourceLanguageCode: string | null;
  targetLanguageCode: string;
  draftText: string;
}

export interface SystemContextResponse {
  userId: number | null;
  userName: string | null;
  companyId: number | null;
  branchId: number | null;
  warehouseIds: number[];
  departmentIds: number[];
  visibilityMode: string;
  teamUserIds: number[];
}

export interface SystemInfoResponse {
  product: string;
  phase: string;
  message: string;
}

export interface HealthCheckEntryResponse {
  status: string;
  description: string | null;
  durationMs: number;
}

export interface HealthCheckResponse {
  status: string;
  entries: Record<string, HealthCheckEntryResponse>;
}

export interface DashboardFilter extends QueryFilter {
  salesOrderId?: number;
  customerId?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  module: string;
  category?: "Alert" | "Approval" | "Reminder" | "System";
  severity: "info" | "success" | "warn" | "danger";
  createdAt: string;
  isRead: boolean;
  requiresAction?: boolean;
  documentRef?: string;
  auditActionLabel?: string;
  statusLabel?: string;
  actionLabel?: string;
  actionPath?: string;
  actionDisabledReason?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface WarehouseOption {
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  branchId: number;
  zoneLabel?: string;
}

export interface ForgotPasswordRequest {
  userNameOrEmail: string;
  companyCode?: string;
  channel: "Email" | "SMS" | "Authenticator";
  recoveryMode: "PasswordReset" | "MfaRecovery";
}

export interface ForgotPasswordResponse {
  requestToken: string;
  message: string;
  deliverySummary: string;
  availableChallenges: string[];
  expiresOnUtc: string;
  pendingEndpoint: string;
}

export interface ApprovalWorkItem {
  id: string;
  module: string;
  documentType: string;
  referenceNo: string;
  title: string;
  summary: string;
  submittedBy: string;
  submittedOn: string;
  dueOn: string;
  status: "Pending" | "Escalated" | "Approved" | "Rejected" | "Changes Requested";
  priority: "High" | "Medium" | "Low";
  stepName: string;
  auditActionLabel: string;
  relatedNotificationId?: string;
  actionPath?: string;
  actionDisabledReason?: string;
  tags: string[];
}

export interface ApprovalDecisionRequest {
  decision: "Approve" | "Reject" | "RequestChanges";
  remarks?: string;
}

export interface ApprovalDecisionDto {
  id: number;
  decision: string;
  remarks?: string | null;
  decidedOn: string;
  decidedByUserId?: number | null;
}

export interface ApprovalDetailDto {
  workItem: ApprovalWorkItem;
  decisions: ApprovalDecisionDto[];
}

export interface UserDirectoryItemDto {
  id: string;
  userName: string;
  displayName: string;
  email: string;
  roles: string[];
  branchAccess: string[];
  status: "Active" | "Pending Invite" | "Locked" | "Suspended";
  loginPolicy: string;
  lastLogin: string;
  deviceBinding: string;
}

export interface UserRoleAssignmentRequest {
  roleCode: string;
  companyId?: number | null;
  branchId?: number | null;
}

export interface UserAccessPolicyUpdateRequest {
  displayName: string;
  email?: string | null;
  languageCode: string;
  defaultCompanyId?: number | null;
  defaultBranchId?: number | null;
  status: string;
  loginPolicy: string;
  deviceBinding: string;
  roles: UserRoleAssignmentRequest[];
}

export interface RolePermissionDto {
  module: string;
  access: "Read" | "Manage" | "Approve";
  dataScope: string;
}

export interface PermissionCatalogItemDto {
  id: string;
  permissionCode: string;
  module: string;
  access: string;
  dataScope: string;
  status: string;
}

export interface RoleMatrixItemDto {
  id: string;
  roleCode: string;
  label: string;
  audience: string;
  scopeMode: string;
  activeUsers: number;
  mobileSurface: string;
  status: string;
  permissions: RolePermissionDto[];
}

export interface RolePermissionAssignmentRequest {
  permissionCode: string;
}

export interface RoleUpsertRequest {
  roleCode: string;
  label: string;
  audience: string;
  scopeMode: string;
  status: string;
  permissions: RolePermissionAssignmentRequest[];
}

export interface WorkflowNumberingItemDto {
  id: string;
  documentType: string;
  seriesPattern: string;
  workflowOwner: string;
  approvalChain: string;
  transitionCount: number;
  status: "Active" | "Draft";
  notes: string;
}

export interface WorkflowRuleUpsertRequest {
  companyId?: number | null;
  branchId?: number | null;
  workflowCode: string;
  documentType: string;
  seriesPattern: string;
  currentNumber: number;
  resetPolicy: string;
  workflowOwner: string;
  approvalChain: string;
  status: string;
  notes?: string | null;
}

export interface TenantSettingItemDto {
  id: string;
  group: string;
  key: string;
  label: string;
  value: string;
  status: "Applied" | "Pending";
  description: string;
}

export interface TenantSettingUpdateRequest {
  value: string;
  status: string;
  description?: string | null;
}

export interface TranslationResourceUpsertRequest {
  languageCode: string;
  module?: string | null;
  translationKey: string;
  translationValue: string;
  companyId?: number | null;
  branchId?: number | null;
}

export interface UdfDefinitionFilter extends QueryFilter {
  entityType?: string;
}

export interface UdfDefinitionDto {
  id: number;
  companyId?: number | null;
  entityType: string;
  fieldKey: string;
  label: string;
  dataType: string;
  controlType: string;
  lookupSource?: string | null;
  isRequired: boolean;
  minNumber?: number | null;
  maxNumber?: number | null;
  maxLength?: number | null;
  decimalScale?: number | null;
  roleVisibility: string;
  status: string;
  createdOn: string;
  modifiedOn?: string | null;
}

export interface UdfDefinitionUpsertRequest {
  companyId?: number | null;
  entityType: string;
  fieldKey: string;
  label: string;
  dataType: string;
  controlType: string;
  lookupSource?: string | null;
  isRequired: boolean;
  minNumber?: number | null;
  maxNumber?: number | null;
  maxLength?: number | null;
  decimalScale?: number | null;
  roleVisibility: string;
  status: string;
}

export interface UdfValueDto {
  id: number;
  definitionId: number;
  entityType: string;
  entityId: number;
  valueText?: string | null;
  valueNumber?: number | null;
  valueDate?: string | null;
  valueBoolean?: boolean | null;
  createdOn: string;
  modifiedOn?: string | null;
}

export interface UdfValueUpsertRequest {
  definitionId: number;
  entityId: number;
  valueText?: string | null;
  valueNumber?: number | null;
  valueDate?: string | null;
  valueBoolean?: boolean | null;
}

export interface AuditTrailItemDto {
  id: number;
  companyId: number | null;
  branchId: number | null;
  createdOn: string;
  createdByUserId: number | null;
  module: string;
  entityType: string;
  actionCode: string;
  entityId: string | null;
  reasonCode: string | null;
  correlationId: string;
  clientType: string;
  beforeSnapshot: string | null;
  afterSnapshot: string | null;
}

export interface StageWiseDashboardItem {
  salesOrderId: number;
  salesOrderNo: string;
  customerName: string | null;
  stageCode: string;
  stageStatus: string;
  blockerCode: string | null;
  ownerRole: string;
  daysInStage: number;
  nextRequiredAction: string;
}

export interface OrderRiskItem {
  salesOrderId: number;
  salesOrderNo: string;
  customerName: string | null;
  promisedDate: string | null;
  completionPercent: number;
  pendingOperationCount: number;
  shortageCount: number;
  supplierLateCount: number;
  qcPendingCount: number;
  dispatchReadinessPercent: number;
  riskStatus: string;
  primaryBlockerCode: string | null;
}

export interface ExecutiveCockpitSummary {
  openOrders: number;
  overdueOrders: number;
  criticalShortages: number;
  delayedSuppliers: number;
  machineDowntimeMinutesToday: number;
  dispatchReadyToday: number;
  qcPending: number;
}

export interface CompanyDto {
  id: number;
  companyCode: string;
  companyName: string;
  legalName: string;
  taxRegistrationNo: string | null;
  timeZoneId: string;
  defaultLanguageId: number | null;
  baseCurrencyCode: string | null;
  defaultCalendarCode: string | null;
  status: string;
}

export interface CompanyUpsertRequest {
  companyCode: string;
  companyName: string;
  legalName: string;
  taxRegistrationNo: string | null;
  timeZoneId: string;
  defaultLanguageId: number | null;
  baseCurrencyCode: string | null;
  defaultCalendarCode: string | null;
  status: string;
}

export interface BranchDto {
  id: number;
  companyId: number;
  branchCode: string;
  branchName: string;
  branchType: string;
  timeZoneId: string;
  defaultLanguageId: number | null;
  defaultCalendarCode: string | null;
  defaultShiftId: number | null;
  defaultWarehouseId: number | null;
  contactEmail: string | null;
  status: string;
}

export interface BranchUpsertRequest {
  companyId: number;
  branchCode: string;
  branchName: string;
  branchType: string;
  timeZoneId: string;
  defaultLanguageId: number | null;
  defaultCalendarCode: string | null;
  defaultShiftId: number | null;
  defaultWarehouseId: number | null;
  contactEmail: string | null;
  status: string;
}

export interface DepartmentDto {
  id: number;
  companyId: number;
  branchId: number | null;
  departmentCode: string;
  departmentName: string;
  parentDepartmentId: number | null;
  managerUserId: number | null;
  departmentType: string;
  status: string;
}

export interface DepartmentUpsertRequest {
  companyId: number;
  branchId: number | null;
  departmentCode: string;
  departmentName: string;
  parentDepartmentId: number | null;
  managerUserId: number | null;
  departmentType: string;
  status: string;
}

export interface WarehouseDto {
  id: number;
  companyId: number;
  branchId: number;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: string;
  isDefaultReceivingWarehouse: boolean;
  isDefaultIssueWarehouse: boolean;
  isDispatchEnabled: boolean;
  allowsMixedLots: boolean;
  allowsNegativeStock: boolean;
  status: string;
}

export interface WarehouseUpsertRequest {
  companyId: number;
  branchId: number;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: string;
  isDefaultReceivingWarehouse: boolean;
  isDefaultIssueWarehouse: boolean;
  isDispatchEnabled: boolean;
  allowsMixedLots: boolean;
  allowsNegativeStock: boolean;
  status: string;
}

export interface BinDto {
  id: number;
  companyId: number;
  branchId: number;
  warehouseId: number;
  parentBinId: number | null;
  binCode: string;
  binName: string;
  binType: string;
  capacityValue: number | null;
  capacityUomId: number | null;
  isDefaultReceiveBin: boolean;
  isDefaultIssueBin: boolean;
  isCountCycleRequired: boolean;
  countCycleDays: number | null;
  isBlocked: boolean;
  blockReasonCode: string | null;
  status: string;
}

export interface BinUpsertRequest {
  companyId: number;
  branchId: number;
  warehouseId: number;
  parentBinId: number | null;
  binCode: string;
  binName: string;
  binType: string;
  capacityValue: number | null;
  capacityUomId: number | null;
  isDefaultReceiveBin: boolean;
  isDefaultIssueBin: boolean;
  isCountCycleRequired: boolean;
  countCycleDays: number | null;
  isBlocked: boolean;
  blockReasonCode: string | null;
  status: string;
}

export interface ShiftDto {
  id: number;
  companyId: number;
  branchId: number | null;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
  breakMinutes: number;
  sequenceNo: number;
  calendarProfileCode: string | null;
  status: string;
}

export interface ShiftUpsertRequest {
  companyId: number;
  branchId: number | null;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
  breakMinutes: number;
  sequenceNo: number;
  calendarProfileCode: string | null;
  status: string;
}

export interface UomClassDto {
  id: number;
  classCode: string;
  className: string;
  baseUomId: number | null;
  supportsFormulaConversion: boolean;
  status: string;
}

export interface UomClassUpsertRequest {
  classCode: string;
  className: string;
  baseUomId: number | null;
  supportsFormulaConversion: boolean;
  status: string;
}

export interface UomDto {
  id: number;
  uomCode: string;
  uomName: string;
  symbol: string | null;
  uomClassId: number;
  decimalPrecision: number;
  isSystemBase: boolean;
  status: string;
}

export interface UomConversionDto {
  id: number;
  fromUomId: number;
  toUomId: number;
  conversionMode: string;
  factorNumerator: number;
  factorDenominator: number;
  formulaTokenSet: string | null;
  roundMode: string;
  precisionScale: number;
  status: string;
}

export interface UomConversionUpsertRequest {
  fromUomId: number;
  toUomId: number;
  conversionMode: string;
  factorNumerator: number;
  factorDenominator: number;
  formulaTokenSet: string | null;
  roundMode: string;
  precisionScale: number;
  status: string;
}

export interface MeasurementProfileDto {
  id: number;
  profileCode: string;
  profileName: string;
  profileType: string;
  stockUomClassId: number;
  allowsCatchWeight: boolean;
  requiresDimensions: boolean;
  requiresDensity: boolean;
  requiresThickness: boolean;
  requiresPackSize: boolean;
  supportsCommercialProductionSplit: boolean;
  status: string;
}

export interface MeasurementProfileUpsertRequest {
  profileCode: string;
  profileName: string;
  profileType: string;
  stockUomClassId: number;
  allowsCatchWeight: boolean;
  requiresDimensions: boolean;
  requiresDensity: boolean;
  requiresThickness: boolean;
  requiresPackSize: boolean;
  supportsCommercialProductionSplit: boolean;
  status: string;
}

export interface MeasurementFormulaDto {
  id: number;
  measurementProfileId: number;
  formulaCode: string;
  formulaName: string;
  formulaPurpose: string;
  expressionTemplate: string;
  outputUomId: number;
  precisionScale: number;
  status: string;
}

export interface ItemDto {
  id: number;
  companyId: number;
  itemCode: string;
  itemName: string;
  shortName: string | null;
  itemType: string;
  itemGroupId: number;
  measurementProfileId: number;
  stockUomId: number;
  purchaseUomId: number | null;
  salesUomId: number | null;
  productionUomId: number | null;
  qcUomId: number | null;
  traceabilityMode: string;
  isCatchWeightItem: boolean;
  isQcRequired: boolean;
  isBatchExpiryTracked: boolean;
  defaultIssueMethod: string;
  defaultMakeType: string;
  defaultWarehouseId: number | null;
  defaultBinId: number | null;
  leadTimeDays: number;
  reorderPolicy: string;
  status: string;
}

export interface ItemUpsertRequest {
  companyId: number;
  itemCode: string;
  itemName: string;
  shortName: string | null;
  itemType: string;
  itemGroupId: number;
  measurementProfileId: number;
  stockUomId: number;
  purchaseUomId: number | null;
  salesUomId: number | null;
  productionUomId: number | null;
  qcUomId: number | null;
  traceabilityMode: string;
  isCatchWeightItem: boolean;
  isQcRequired: boolean;
  isBatchExpiryTracked: boolean;
  defaultIssueMethod: string;
  defaultMakeType: string;
  defaultWarehouseId: number | null;
  defaultBinId: number | null;
  leadTimeDays: number;
  reorderPolicy: string;
  status: string;
}

export interface ItemLookupDto {
  id: number;
  itemCode: string;
  itemName: string;
  itemType: string;
  status: string;
}

export interface ItemAttributeValueDto {
  id: number;
  itemAttributeId: number;
  attributeValueCode: string;
  attributeValueName: string;
  sortOrder: number;
  status: string;
}

export interface ItemAttributeDto {
  id: number;
  companyId: number | null;
  attributeCode: string;
  attributeName: string;
  dataType: string;
  isVariantAxis: boolean;
  unitUomId: number | null;
  status: string;
  values: ItemAttributeValueDto[];
}

export interface ItemAttributeValueUpsertRequest {
  id?: number | null;
  attributeValueCode: string;
  attributeValueName: string;
  sortOrder: number;
  status: string;
}

export interface ItemAttributeUpsertRequest {
  companyId?: number | null;
  attributeCode: string;
  attributeName: string;
  dataType: string;
  isVariantAxis: boolean;
  unitUomId?: number | null;
  status: string;
  values: ItemAttributeValueUpsertRequest[];
}

export interface ItemVariantDto {
  id: number;
  companyId: number;
  itemId: number;
  variantCode: string;
  variantName: string;
  variantKey: string;
  variantAttributeSummary: string | null;
  variantAttributeMapJson: string;
  overrideMeasurementProfileId: number | null;
  overrideStockUomId: number | null;
  overrideWeightPerUnit: number | null;
  status: string;
}

export interface ItemVariantUpsertRequest {
  companyId: number;
  itemId: number;
  variantCode: string;
  variantName: string;
  variantKey: string;
  variantAttributeSummary: string | null;
  variantAttributeMapJson: string;
  overrideMeasurementProfileId: number | null;
  overrideStockUomId: number | null;
  overrideWeightPerUnit: number | null;
  status: string;
}

export interface ItemUomDto {
  id: number;
  companyId: number;
  itemId: number;
  itemVariantId: number | null;
  uomRole: string;
  uomId: number;
  baseToThisNumerator: number;
  baseToThisDenominator: number;
  measurementFormulaId: number | null;
  isDefault: boolean;
  isCatchWeightActualUom: boolean;
  minOrderQty: number | null;
  roundingScale: number;
  status: string;
}

export interface ItemBarcodeDto {
  id: number;
  companyId: number;
  itemId: number;
  itemVariantId: number | null;
  uomId: number | null;
  barcodeValue: string;
  barcodeType: string;
  scanPurpose: string;
  preferenceRank: number;
  isPrimary: boolean;
  status: string;
}

export interface ItemBarcodeUpsertRequest {
  companyId: number;
  itemId: number;
  itemVariantId: number | null;
  uomId: number | null;
  barcodeValue: string;
  barcodeType: string;
  scanPurpose: string;
  preferenceRank: number;
  isPrimary: boolean;
  status: string;
}

export interface ItemAliasDto {
  id: number;
  companyId: number;
  itemId: number;
  aliasType: string;
  aliasValue: string;
  languageCode: string | null;
  isPrimary: boolean;
  status: string;
}

export interface ItemMediaDto {
  id: number;
  companyId: number;
  itemId: number;
  itemVariantId: number | null;
  mediaType: string;
  title: string;
  fileName: string | null;
  mimeType: string | null;
  storageUri: string | null;
  thumbnailUri: string | null;
  isPrimary: boolean;
  sortOrder: number;
  approvalStatus: string;
  visibilityScope: string;
  retiredOnUtc: string | null;
  status: string;
}

export interface ItemDocumentDto {
  id: number;
  companyId: number;
  itemId: number;
  itemVariantId: number | null;
  documentType: string;
  title: string;
  documentNo: string | null;
  revisionCode: string | null;
  fileName: string | null;
  storageUri: string | null;
  approvalStatus: string;
  visibilityScope: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  expiresOn: string | null;
  status: string;
}

export interface ItemCatalogDto {
  id: number;
  companyId: number;
  itemId: number;
  catalogTitle: string;
  catalogSection: string | null;
  marketingDescription: string | null;
  customerVisibleSpecsJson: string | null;
  publishStatus: string;
  isCatalogVisible: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  previewSlug: string | null;
  status: string;
}

export interface ItemPackagingDto {
  id: number;
  companyId: number;
  itemId: number;
  packagingUomId: number | null;
  innerPackQty: number | null;
  cartonQty: number | null;
  palletQty: number | null;
  netWeight: number | null;
  grossWeight: number | null;
  weightUomId: number | null;
  lengthValue: number | null;
  widthValue: number | null;
  heightValue: number | null;
  dimensionUomId: number | null;
  labelCount: number | null;
  packingInstructions: string | null;
  status: string;
}

export interface ItemPhysicalSpecsDto {
  id: number;
  companyId: number;
  itemId: number;
  lengthValue: number | null;
  widthValue: number | null;
  heightValue: number | null;
  thicknessValue: number | null;
  dimensionUomId: number | null;
  grade: string | null;
  material: string | null;
  colorFinish: string | null;
  shelfLifeDays: number | null;
  storageCondition: string | null;
  toleranceNote: string | null;
  status: string;
}

export interface ItemCustomerReferenceDto {
  id: number;
  companyId: number;
  itemId: number;
  customerId: number;
  customerCode: string | null;
  customerName: string | null;
  customerItemCode: string;
  drawingNo: string | null;
  revisionCode: string | null;
  packagingOverride: string | null;
  specificationOverride: string | null;
  approvalStatus: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: string;
}

export interface ItemVendorReferenceDto {
  id: number;
  companyId: number;
  itemId: number;
  supplierId: number;
  supplierCode: string | null;
  supplierName: string | null;
  vendorItemCode: string;
  minimumOrderQty: number | null;
  leadTimeDays: number | null;
  purchaseUomId: number | null;
  complianceStatus: string | null;
  documentStatus: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: string;
}

export interface ItemManufacturingPolicyDto {
  id: number;
  companyId: number;
  itemId: number;
  bomPolicy: string;
  routingPolicy: string;
  issueMethod: string;
  scrapAllowancePercent: number | null;
  operationLinkage: string | null;
  status: string;
}

export interface ItemPlanningPolicyDto {
  id: number;
  companyId: number;
  itemId: number;
  mrpEnabled: boolean;
  safetyStockQty: number | null;
  reorderPointQty: number | null;
  minimumQty: number | null;
  maximumQty: number | null;
  leadTimeDays: number | null;
  lotSizeQty: number | null;
  abcClass: string | null;
  status: string;
}

export interface ItemInventoryPolicyDto {
  id: number;
  companyId: number;
  itemId: number;
  defaultWarehouseId: number | null;
  defaultBinId: number | null;
  serialTrackingMode: string;
  lotTrackingMode: string;
  isCatchWeightItem: boolean;
  negativeStockPolicy: string;
  expiryPolicy: string | null;
  shelfLifeDays: number | null;
  status: string;
}

export interface ItemQualityPolicyDto {
  id: number;
  companyId: number;
  itemId: number;
  qcRequired: boolean;
  inspectionPlanId: number | null;
  inspectionPlanCode: string | null;
  certificateRequirement: string | null;
  holdRule: string | null;
  traceabilityDepth: string | null;
  status: string;
}

export interface ItemMasterProfileDto {
  itemId: number;
  aliases: ItemAliasDto[];
  media: ItemMediaDto[];
  documents: ItemDocumentDto[];
  catalog: ItemCatalogDto | null;
  packaging: ItemPackagingDto | null;
  physicalSpecs: ItemPhysicalSpecsDto | null;
  customerReferences: ItemCustomerReferenceDto[];
  vendorReferences: ItemVendorReferenceDto[];
  manufacturingPolicy: ItemManufacturingPolicyDto | null;
  planningPolicy: ItemPlanningPolicyDto | null;
  inventoryPolicy: ItemInventoryPolicyDto | null;
  qualityPolicy: ItemQualityPolicyDto | null;
}

export interface ItemAliasUpsertRequest {
  aliasType: string;
  aliasValue: string;
  languageCode: string | null;
  isPrimary: boolean;
  status: string;
}

export interface ItemCatalogUpsertRequest {
  catalogTitle: string;
  catalogSection: string | null;
  marketingDescription: string | null;
  customerVisibleSpecsJson: string | null;
  publishStatus: string;
  isCatalogVisible: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  previewSlug: string | null;
  status: string;
}

export interface ItemPackagingUpsertRequest {
  packagingUomId: number | null;
  innerPackQty: number | null;
  cartonQty: number | null;
  palletQty: number | null;
  netWeight: number | null;
  grossWeight: number | null;
  weightUomId: number | null;
  lengthValue: number | null;
  widthValue: number | null;
  heightValue: number | null;
  dimensionUomId: number | null;
  labelCount: number | null;
  packingInstructions: string | null;
  status: string;
}

export interface ItemPhysicalSpecsUpsertRequest {
  lengthValue: number | null;
  widthValue: number | null;
  heightValue: number | null;
  thicknessValue: number | null;
  dimensionUomId: number | null;
  grade: string | null;
  material: string | null;
  colorFinish: string | null;
  shelfLifeDays: number | null;
  storageCondition: string | null;
  toleranceNote: string | null;
  status: string;
}

export interface ItemCustomerReferenceUpsertRequest {
  customerId: number;
  customerItemCode: string;
  drawingNo: string | null;
  revisionCode: string | null;
  packagingOverride: string | null;
  specificationOverride: string | null;
  approvalStatus: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: string;
}

export interface ItemVendorReferenceUpsertRequest {
  supplierId: number;
  vendorItemCode: string;
  minimumOrderQty: number | null;
  leadTimeDays: number | null;
  purchaseUomId: number | null;
  complianceStatus: string | null;
  documentStatus: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: string;
}

export interface ItemManufacturingPolicyUpsertRequest {
  bomPolicy: string;
  routingPolicy: string;
  issueMethod: string;
  scrapAllowancePercent: number | null;
  operationLinkage: string | null;
  status: string;
}

export interface ItemPlanningPolicyUpsertRequest {
  mrpEnabled: boolean;
  safetyStockQty: number | null;
  reorderPointQty: number | null;
  minimumQty: number | null;
  maximumQty: number | null;
  leadTimeDays: number | null;
  lotSizeQty: number | null;
  abcClass: string | null;
  status: string;
}

export interface ItemInventoryPolicyUpsertRequest {
  defaultWarehouseId: number | null;
  defaultBinId: number | null;
  serialTrackingMode: string;
  lotTrackingMode: string;
  isCatchWeightItem: boolean;
  negativeStockPolicy: string;
  expiryPolicy: string | null;
  shelfLifeDays: number | null;
  status: string;
}

export interface ItemQualityPolicyUpsertRequest {
  qcRequired: boolean;
  inspectionPlanId: number | null;
  inspectionPlanCode: string | null;
  certificateRequirement: string | null;
  holdRule: string | null;
  traceabilityDepth: string | null;
  status: string;
}

export interface ItemMasterProfileUpsertRequest {
  aliases: ItemAliasUpsertRequest[];
  catalog: ItemCatalogUpsertRequest;
  packaging: ItemPackagingUpsertRequest;
  physicalSpecs: ItemPhysicalSpecsUpsertRequest;
  manufacturingPolicy: ItemManufacturingPolicyUpsertRequest;
  planningPolicy: ItemPlanningPolicyUpsertRequest;
  inventoryPolicy: ItemInventoryPolicyUpsertRequest;
  qualityPolicy: ItemQualityPolicyUpsertRequest;
  customerReferences: ItemCustomerReferenceUpsertRequest[];
  vendorReferences: ItemVendorReferenceUpsertRequest[];
}

export interface CustomerDto {
  id: number;
  companyId: number;
  customerCode: string;
  customerName: string;
  shortName: string | null;
  customerType: string;
  defaultBranchId: number | null;
  defaultLanguageId: number | null;
  taxRegistrationNo: string | null;
  paymentTermsCode: string | null;
  creditDays: number | null;
  status: string;
}

export interface CustomerUpsertRequest {
  companyId: number;
  customerCode: string;
  customerName: string;
  shortName: string | null;
  customerType: string;
  defaultBranchId: number | null;
  defaultLanguageId: number | null;
  taxRegistrationNo: string | null;
  paymentTermsCode: string | null;
  creditDays: number | null;
  status: string;
}

export interface CustomerAddressDto {
  id: number;
  companyId: number;
  customerId: number;
  addressCode: string;
  addressType: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
  status: string;
}

export interface CustomerAddressUpsertRequest {
  companyId: number;
  customerId: number;
  addressCode: string;
  addressType: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
  status: string;
}

export interface SupplierDto {
  id: number;
  companyId: number;
  supplierCode: string;
  supplierName: string;
  supplierType: string;
  supportsSubcontracting: boolean;
  defaultBranchId: number | null;
  defaultLanguageId: number | null;
  taxRegistrationNo: string | null;
  paymentTermsCode: string | null;
  status: string;
}

export interface SupplierUpsertRequest {
  companyId: number;
  supplierCode: string;
  supplierName: string;
  supplierType: string;
  supportsSubcontracting: boolean;
  defaultBranchId: number | null;
  defaultLanguageId: number | null;
  taxRegistrationNo: string | null;
  paymentTermsCode: string | null;
  status: string;
}

export interface SupplierAddressDto {
  id: number;
  companyId: number;
  supplierId: number;
  addressCode: string;
  addressType: string;
  addressLine1: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isDefaultOrderAddress: boolean;
  status: string;
}

export interface SupplierAddressUpsertRequest {
  companyId: number;
  supplierId: number;
  addressCode: string;
  addressType: string;
  addressLine1: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isDefaultOrderAddress: boolean;
  status: string;
}

export interface SupplierLeadTimeDto {
  id: number;
  companyId: number;
  supplierId: number;
  branchId: number | null;
  itemId: number | null;
  itemGroupId: number | null;
  leadTimeDays: number;
  minOrderQty: number | null;
  orderMultipleQty: number | null;
  isSubcontractLeadTime: boolean;
  priorityRank: number;
  status: string;
}

export interface SupplierLeadTimeUpsertRequest {
  companyId: number;
  supplierId: number;
  branchId: number | null;
  itemId: number | null;
  itemGroupId: number | null;
  leadTimeDays: number;
  minOrderQty: number | null;
  orderMultipleQty: number | null;
  isSubcontractLeadTime: boolean;
  priorityRank: number;
  status: string;
}

export interface PartnerAuditEventDto {
  id: number;
  entityType: string;
  actionCode: string;
  actor: string;
  occurredOn: string;
  outcome: string;
}

export interface CustomerPartnerProfileDto {
  id: number;
  companyId: number;
  customerId: number;
  legalName: string | null;
  taxCategory: string | null;
  currencyCode: string | null;
  creditStatus: string | null;
  creditLimitAmount: number | null;
  creditHoldRule: string | null;
  paymentTermsCode: string | null;
  defaultSalesOwnerUserId: number | null;
  defaultSalesOwnerName: string | null;
  defaultSalesTeamId: number | null;
  defaultTerritoryId: number | null;
  defaultPriceListId: number | null;
  defaultDiscountSchemeId: number | null;
  defaultPaymentTermsId: number | null;
  defaultTaxCategoryId: number | null;
  defaultTaxTreatment: string | null;
  defaultCurrencyId: number | null;
  defaultTradeTermsId: number | null;
  commercialSegment: string | null;
  orderReleaseControl: string | null;
  dispatchPreference: string | null;
  dispatchInstruction: string | null;
  catalogVisible: boolean;
  catalogSegment: string | null;
  status: string;
}

export interface CustomerContactPointDto {
  id: number;
  companyId: number;
  customerId: number;
  customerAddressId: number | null;
  contactName: string;
  contactRole: string;
  channel: string;
  contactValue: string;
  isPrimary: boolean;
  consentStatus: string | null;
  escalationLevel: string | null;
  status: string;
}

export interface CustomerItemReferenceProfileDto {
  id: number;
  companyId: number;
  customerId: number;
  itemId: number | null;
  customerItemCode: string;
  drawingNo: string | null;
  revisionCode: string | null;
  packagingOverride: string | null;
  specificationOverride: string | null;
  approvalStatus: string;
  status: string;
}

export interface CustomerDocumentDto {
  id: number;
  companyId: number;
  customerId: number;
  documentType: string;
  title: string;
  documentNo: string | null;
  revisionCode: string | null;
  fileName: string | null;
  storageUri: string | null;
  approvalStatus: string;
  visibilityScope: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  expiresOn: string | null;
  status: string;
}

export interface CustomerPartnerWorkspaceDto {
  profile: CustomerPartnerProfileDto;
  contactPoints: CustomerContactPointDto[];
  itemReferences: CustomerItemReferenceProfileDto[];
  documents: CustomerDocumentDto[];
  auditEvents: PartnerAuditEventDto[];
}

export interface CustomerPartnerProfileUpsertRequest {
  profile: Omit<CustomerPartnerProfileDto, "id" | "companyId" | "customerId">;
  contactPoints: Array<Omit<CustomerContactPointDto, "id" | "companyId" | "customerId"> & { id: number | null }>;
  itemReferences: Array<Omit<CustomerItemReferenceProfileDto, "id" | "companyId" | "customerId"> & { id: number | null }>;
  documents: Array<Omit<CustomerDocumentDto, "id" | "companyId" | "customerId"> & { id: number | null }>;
}

export interface CommercialDefaultValueDto<T> {
  value: T | null;
  display: string | null;
  source: string;
  isDefaulted: boolean;
  isOverridden: boolean;
}

export interface CustomerCommercialDefaultsDto {
  customerId: number;
  salesTeamId: number | null;
  salesTeamName: string | null;
  territoryId: number | null;
  territoryName: string | null;
  salesOwner: CommercialDefaultValueDto<number>;
  priceList: CommercialDefaultValueDto<number>;
  discountScheme: CommercialDefaultValueDto<number>;
  paymentTerms: CommercialDefaultValueDto<number>;
  taxCategory: CommercialDefaultValueDto<number>;
  taxTreatment: CommercialDefaultValueDto<string>;
  currency: CommercialDefaultValueDto<number>;
  tradeTerms: CommercialDefaultValueDto<number>;
  validationMessages: string[];
}

export interface SalesTerritoryDto {
  id: number;
  companyId: number;
  territoryCode: string;
  territoryName: string;
  parentTerritoryId: number | null;
  status: string;
}

export interface SalesTeamDto {
  id: number;
  companyId: number;
  teamCode: string;
  teamName: string;
  defaultTerritoryId: number | null;
  status: string;
}

export interface SupplierPartnerProfileDto {
  id: number;
  companyId: number;
  supplierId: number;
  legalName: string | null;
  taxCategory: string | null;
  currencyCode: string | null;
  paymentTermsCode: string | null;
  preferredStatus: string | null;
  complianceStatus: string | null;
  capabilitySummary: string | null;
  qualityRating: number | null;
  procurementReleaseControl: string | null;
  leadTimeReviewDays: number | null;
  status: string;
}

export interface SupplierContactPointDto {
  id: number;
  companyId: number;
  supplierId: number;
  supplierAddressId: number | null;
  contactName: string;
  contactRole: string;
  channel: string;
  contactValue: string;
  isPrimary: boolean;
  consentStatus: string | null;
  escalationLevel: string | null;
  status: string;
}

export interface SupplierVendorReferenceProfileDto {
  id: number;
  companyId: number;
  supplierId: number;
  itemId: number | null;
  vendorItemCode: string;
  minimumOrderQty: number | null;
  leadTimeDays: number | null;
  purchaseUomId: number | null;
  complianceStatus: string | null;
  documentStatus: string | null;
  approvalStatus: string;
  status: string;
}

export interface SupplierDocumentDto {
  id: number;
  companyId: number;
  supplierId: number;
  documentType: string;
  title: string;
  documentNo: string | null;
  revisionCode: string | null;
  fileName: string | null;
  storageUri: string | null;
  approvalStatus: string;
  visibilityScope: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  expiresOn: string | null;
  status: string;
}

export interface SupplierPartnerWorkspaceDto {
  profile: SupplierPartnerProfileDto;
  contactPoints: SupplierContactPointDto[];
  vendorReferences: SupplierVendorReferenceProfileDto[];
  documents: SupplierDocumentDto[];
  auditEvents: PartnerAuditEventDto[];
}

export interface SupplierPartnerProfileUpsertRequest {
  profile: Omit<SupplierPartnerProfileDto, "id" | "companyId" | "supplierId">;
  contactPoints: Array<Omit<SupplierContactPointDto, "id" | "companyId" | "supplierId"> & { id: number | null }>;
  vendorReferences: Array<Omit<SupplierVendorReferenceProfileDto, "id" | "companyId" | "supplierId"> & { id: number | null }>;
  documents: Array<Omit<SupplierDocumentDto, "id" | "companyId" | "supplierId"> & { id: number | null }>;
}

export interface QuoteLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  orderUomId: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineAmount: number;
  makeType: string;
  promisedDate: string | null;
  priorityCode: string;
  customerSpecRef: string | null;
  status: string;
  itemRevisionId?: number | null;
  engineeringDocumentRevisionId?: number | null;
  bomRevisionId?: number | null;
  routingId?: number | null;
  priceSourceType?: string;
  priceListLineId?: number | null;
  discountSchemeId?: number | null;
  discountRuleId?: number | null;
  taxCodeId?: number | null;
  taxRateSnapshot?: number;
  lineSubtotal?: number;
  lineTaxableAmount?: number;
  lineTotalAmount?: number;
  lineInternalRemarks?: string | null;
  lineCustomerFacingRemarks?: string | null;
  overrideReason?: string | null;
  overrideByUserId?: number | null;
  overrideAt?: string | null;
}

export interface QuoteLineUpsertRequest {
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  orderUomId: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  makeType: string;
  promisedDate: string | null;
  priorityCode: string;
  customerSpecRef: string | null;
  status: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  itemRevisionId?: number | null;
  engineeringDocumentRevisionId?: number | null;
  bomRevisionId?: number | null;
  routingId?: number | null;
  priceSourceType?: string | null;
  priceListLineId?: number | null;
  discountSchemeId?: number | null;
  discountRuleId?: number | null;
  discountAmount?: number;
  taxCodeId?: number | null;
  taxRateSnapshot?: number | null;
  lineInternalRemarks?: string | null;
  lineCustomerFacingRemarks?: string | null;
  overrideReason?: string | null;
}

export interface QuoteDto {
  id: number;
  companyId: number;
  branchId: number;
  quoteNo: string;
  customerId: number;
  customerAddressId: number | null;
  quoteDate: string;
  expiryDate: string | null;
  priorityCode: string;
  status: string;
  customerSpecRef: string | null;
  salesOwnerUserId?: number | null;
  salesOwnerName?: string | null;
  internalRemarks?: string | null;
  customerFacingRemarks?: string | null;
  printRemarks?: string | null;
  paymentTermsId?: number | null;
  priceListId?: number | null;
  discountSchemeId?: number | null;
  taxCategoryId?: number | null;
  taxTreatment?: string | null;
  currencyId?: number | null;
  exchangeRateId?: number | null;
  exchangeRateSnapshot?: number | null;
  tradeTermsId?: number | null;
  freightAmount?: number;
  packingAmount?: number;
  insuranceAmount?: number;
  otherChargesAmount?: number;
  addLessAmount?: number;
  roundOffAmount?: number;
  subtotalAmount?: number;
  discountTotalAmount?: number;
  taxableAmount?: number;
  taxTotalAmount?: number;
  grandTotalAmount?: number;
  commercialStatus?: string;
  revisionNo?: number;
  releasedAt?: string | null;
  releasedByUserId?: number | null;
  convertedAt?: string | null;
  convertedByUserId?: number | null;
  reopenedAt?: string | null;
  reopenedByUserId?: number | null;
  legacyCommercialIncomplete?: boolean;
  lines: QuoteLineDto[];
}

export interface QuoteUpsertRequest {
  companyId: number;
  branchId: number;
  quoteNo: string;
  customerId: number;
  customerAddressId: number | null;
  quoteDate: string;
  expiryDate: string | null;
  priorityCode: string;
  status: string;
  customerSpecRef: string | null;
  lines: QuoteLineUpsertRequest[];
  customerCode?: string | null;
  customerAddressCode?: string | null;
  salesOwnerUserId?: number | null;
  salesOwnerName?: string | null;
  internalRemarks?: string | null;
  customerFacingRemarks?: string | null;
  printRemarks?: string | null;
  paymentTermsId?: number | null;
  priceListId?: number | null;
  discountSchemeId?: number | null;
  taxCategoryId?: number | null;
  taxTreatment?: string | null;
  currencyId?: number | null;
  exchangeRateId?: number | null;
  exchangeRateSnapshot?: number | null;
  tradeTermsId?: number | null;
  freightAmount?: number;
  packingAmount?: number;
  insuranceAmount?: number;
  otherChargesAmount?: number;
  addLessAmount?: number;
  roundOffAmount?: number;
  commercialStatus?: string | null;
}

export interface QuoteReopenRequest {
  reason: string;
}

export interface QuoteConvertRequest {
  salesOrderNo?: string | null;
  orderDate?: string | null;
  promisedDate?: string | null;
  billToAddressId?: number | null;
  shipToAddressId?: number | null;
}

export interface SalesOrderLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  orderUomId: number;
  quantity: number;
  makeType: string;
  promisedDate: string | null;
  priorityCode: string;
  customerSpecRef: string | null;
  requestedShipDate: string | null;
  status: string;
  itemRevisionId?: number | null;
  engineeringDocumentRevisionId?: number | null;
  bomRevisionId?: number | null;
  routingId?: number | null;
  unitPrice?: number;
  priceSourceType?: string;
  priceListLineId?: number | null;
  discountSchemeId?: number | null;
  discountRuleId?: number | null;
  discountPercent?: number;
  discountAmount?: number;
  taxCodeId?: number | null;
  taxRateSnapshot?: number;
  taxAmount?: number;
  lineSubtotal?: number;
  lineTaxableAmount?: number;
  lineTotalAmount?: number;
  lineInternalRemarks?: string | null;
  lineCustomerFacingRemarks?: string | null;
  overrideReason?: string | null;
  overrideByUserId?: number | null;
  overrideAt?: string | null;
}

export interface SalesOrderLineUpsertRequest {
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  orderUomId: number;
  quantity: number;
  makeType: string;
  promisedDate: string | null;
  priorityCode: string;
  customerSpecRef: string | null;
  requestedShipDate: string | null;
  status: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  itemRevisionId?: number | null;
  engineeringDocumentRevisionId?: number | null;
  bomRevisionId?: number | null;
  routingId?: number | null;
  unitPrice?: number;
  priceSourceType?: string | null;
  priceListLineId?: number | null;
  discountSchemeId?: number | null;
  discountRuleId?: number | null;
  discountPercent?: number;
  discountAmount?: number;
  taxCodeId?: number | null;
  taxRateSnapshot?: number | null;
  lineInternalRemarks?: string | null;
  lineCustomerFacingRemarks?: string | null;
  overrideReason?: string | null;
}

export interface SalesOrderDto {
  id: number;
  companyId: number;
  branchId: number;
  salesOrderNo: string;
  customerId: number;
  billToAddressId: number | null;
  shipToAddressId: number | null;
  orderDate: string;
  promisedDate: string | null;
  priorityCode: string;
  status: string;
  sourceQuoteId: number | null;
  sourceQuoteRevisionNo?: number | null;
  sourceQuoteVersionNo?: number | null;
  salesOwnerUserId?: number | null;
  salesOwnerName?: string | null;
  internalRemarks?: string | null;
  customerFacingRemarks?: string | null;
  printRemarks?: string | null;
  paymentTermsId?: number | null;
  priceListId?: number | null;
  discountSchemeId?: number | null;
  taxCategoryId?: number | null;
  taxTreatment?: string | null;
  currencyId?: number | null;
  exchangeRateId?: number | null;
  exchangeRateSnapshot?: number | null;
  tradeTermsId?: number | null;
  freightAmount?: number;
  packingAmount?: number;
  insuranceAmount?: number;
  otherChargesAmount?: number;
  addLessAmount?: number;
  roundOffAmount?: number;
  subtotalAmount?: number;
  discountTotalAmount?: number;
  taxableAmount?: number;
  taxTotalAmount?: number;
  grandTotalAmount?: number;
  commercialStatus?: string;
  releasedAt?: string | null;
  releasedByUserId?: number | null;
  legacyCommercialIncomplete?: boolean;
  lines: SalesOrderLineDto[];
}

export interface SalesOrderUpsertRequest {
  companyId: number;
  branchId: number;
  salesOrderNo: string;
  customerId: number;
  billToAddressId: number | null;
  shipToAddressId: number | null;
  orderDate: string;
  promisedDate: string | null;
  priorityCode: string;
  status: string;
  sourceQuoteId: number | null;
  lines: SalesOrderLineUpsertRequest[];
  customerCode?: string | null;
  billToAddressCode?: string | null;
  shipToAddressCode?: string | null;
  sourceQuoteRevisionNo?: number | null;
  sourceQuoteVersionNo?: number | null;
  salesOwnerUserId?: number | null;
  salesOwnerName?: string | null;
  internalRemarks?: string | null;
  customerFacingRemarks?: string | null;
  printRemarks?: string | null;
  paymentTermsId?: number | null;
  priceListId?: number | null;
  discountSchemeId?: number | null;
  taxCategoryId?: number | null;
  taxTreatment?: string | null;
  currencyId?: number | null;
  exchangeRateId?: number | null;
  exchangeRateSnapshot?: number | null;
  tradeTermsId?: number | null;
  freightAmount?: number;
  packingAmount?: number;
  insuranceAmount?: number;
  otherChargesAmount?: number;
  addLessAmount?: number;
  roundOffAmount?: number;
  commercialStatus?: string | null;
}

export interface BlanketOrderScheduleDto {
  id: number;
  lineNo: number;
  itemId: number;
  scheduleDate: string;
  quantity: number;
  orderUomId: number;
  status: string;
}

export interface BlanketOrderScheduleUpsertRequest {
  lineNo: number;
  itemId: number;
  scheduleDate: string;
  quantity: number;
  orderUomId: number;
  status: string;
  itemCode?: string | null;
}

export interface BlanketOrderDto {
  id: number;
  companyId: number;
  branchId: number | null;
  blanketOrderNo: string;
  customerId: number;
  startDate: string;
  endDate: string;
  status: string;
  schedules: BlanketOrderScheduleDto[];
}

export interface BlanketOrderUpsertRequest {
  companyId: number;
  branchId?: number | null;
  blanketOrderNo: string;
  customerId: number;
  startDate: string;
  endDate: string;
  status: string;
  schedules: BlanketOrderScheduleUpsertRequest[];
  customerCode?: string | null;
}

export interface DemandForecastLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  forecastPeriodStart: string;
  forecastPeriodEnd: string;
  quantity: number;
  forecastUomId: number;
}

export interface DemandForecastLineUpsertRequest {
  lineNo: number;
  itemId: number;
  forecastPeriodStart: string;
  forecastPeriodEnd: string;
  quantity: number;
  forecastUomId: number;
  itemCode?: string | null;
}

export interface DemandForecastDto {
  id: number;
  companyId: number;
  branchId: number | null;
  forecastCode: string;
  forecastName: string;
  periodType: string;
  status: string;
  lines: DemandForecastLineDto[];
}

export interface DemandForecastUpsertRequest {
  companyId: number;
  branchId?: number | null;
  forecastCode: string;
  forecastName: string;
  periodType: string;
  status: string;
  lines: DemandForecastLineUpsertRequest[];
}

export interface MpsLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  periodStart: string;
  periodEnd: string;
  plannedQuantity: number;
  planningUomId: number;
}

export interface MpsLineUpsertRequest {
  lineNo: number;
  itemId: number;
  periodStart: string;
  periodEnd: string;
  plannedQuantity: number;
  planningUomId: number;
  itemCode?: string | null;
}

export interface MasterProductionScheduleDto {
  id: number;
  companyId: number;
  branchId: number;
  mpsCode: string;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  status: string;
  lines: MpsLineDto[];
}

export interface MasterProductionScheduleUpsertRequest {
  companyId: number;
  branchId: number;
  mpsCode: string;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  status: string;
  lines: MpsLineUpsertRequest[];
}

export interface BomLineDto {
  id: number;
  sequenceNo: number;
  componentItemId: number;
  quantityPer: number;
  issueUomId: number;
  scrapPercent: number;
  issueMethod: string;
  isPhantom: boolean;
  alternateItemId: number | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

export interface BomOperationDto {
  id: number;
  sequenceNo: number;
  routingOperationId: number | null;
  operationId: number | null;
  setupMinutes: number;
  runMinutesPerUnit: number;
  teardownMinutes: number;
  requiresQcCheckpoint: boolean;
  isOptional: boolean;
}

export interface BomRevisionDto {
  id: number;
  revisionCode: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  approvalStatus: string;
  routingId: number | null;
  changeSummary: string | null;
  isPhantomParentAllowed: boolean;
  lines: BomLineDto[];
  operations: BomOperationDto[];
}

export interface BomLineUpsertRequest {
  sequenceNo: number;
  componentItemId: number;
  quantityPer: number;
  issueUomId: number;
  scrapPercent: number;
  issueMethod: string;
  isPhantom: boolean;
  alternateItemId: number | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

export interface BomOperationUpsertRequest {
  sequenceNo: number;
  routingOperationId: number | null;
  operationId: number | null;
  setupMinutes: number;
  runMinutesPerUnit: number;
  teardownMinutes: number;
  requiresQcCheckpoint: boolean;
  isOptional: boolean;
}

export interface BomRevisionUpsertRequest {
  revisionCode: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  approvalStatus: string;
  routingId: number | null;
  changeSummary: string | null;
  isPhantomParentAllowed: boolean;
  lines: BomLineUpsertRequest[];
  operations: BomOperationUpsertRequest[];
}

export interface BomDto {
  id: number;
  companyId: number;
  itemId: number;
  bomCode: string;
  bomName: string;
  currentReleasedRevisionId: number | null;
  status: string;
  revisions: BomRevisionDto[];
}

export interface BomUpsertRequest {
  companyId: number;
  itemId: number;
  bomCode: string;
  bomName: string;
  status: string;
  revisions: BomRevisionUpsertRequest[];
}

export interface OperationDto {
  id: number;
  companyId: number;
  operationCode: string;
  operationName: string;
  operationType: string;
  defaultWorkCenterId: number | null;
  defaultSetupMinutes: number;
  defaultRunMinutesPerUnit: number;
  defaultTeardownMinutes: number;
  allowsOverlap: boolean;
  isOutsideProcessing: boolean;
  requiresQcCheckpoint: boolean;
  status: string;
}

export interface OperationUpsertRequest {
  companyId: number;
  operationCode: string;
  operationName: string;
  operationType: string;
  defaultWorkCenterId: number | null;
  defaultSetupMinutes: number;
  defaultRunMinutesPerUnit: number;
  defaultTeardownMinutes: number;
  allowsOverlap: boolean;
  isOutsideProcessing: boolean;
  requiresQcCheckpoint: boolean;
  status: string;
}

export interface WorkCenterDto {
  id: number;
  companyId: number;
  branchId: number;
  workCenterCode: string;
  workCenterName: string;
  departmentId: number | null;
  capacityUomId: number | null;
  defaultShiftPatternCode: string | null;
  parallelCapacityUnits: number;
  status: string;
}

export interface WorkCenterUpsertRequest {
  companyId: number;
  branchId: number;
  workCenterCode: string;
  workCenterName: string;
  departmentId: number | null;
  capacityUomId: number | null;
  defaultShiftPatternCode: string | null;
  parallelCapacityUnits: number;
  status: string;
}

export interface MachineDto {
  id: number;
  companyId: number;
  branchId: number;
  workCenterId: number;
  machineCode: string;
  machineName: string;
  capacityPerHour: number;
  currentStatus: string;
  defaultShiftId: number | null;
  isUnderMaintenance: boolean;
  isSchedulingEnabled: boolean;
  status: string;
}

export interface MachineUpsertRequest {
  companyId: number;
  branchId: number;
  workCenterId: number;
  machineCode: string;
  machineName: string;
  capacityPerHour: number;
  currentStatus: string;
  defaultShiftId: number | null;
  isUnderMaintenance: boolean;
  isSchedulingEnabled: boolean;
  status: string;
}

export interface ToolDto {
  id: number;
  companyId: number;
  branchId: number | null;
  toolCode: string;
  toolName: string;
  toolType: string;
  compatibleMachineGroup: string | null;
  status: string;
}

export interface ToolUpsertRequest {
  companyId: number;
  branchId: number | null;
  toolCode: string;
  toolName: string;
  toolType: string;
  compatibleMachineGroup: string | null;
  status: string;
}

export interface RoutingOperationDto {
  id: number;
  sequenceNo: number;
  operationId: number;
  workCenterId: number | null;
  toolId: number | null;
  setupMinutes: number;
  runMinutesPerUnit: number;
  teardownMinutes: number;
  overlapPercent: number | null;
  isOutsideProcessing: boolean;
  requiresQcCheckpoint: boolean;
  status: string;
}

export interface RoutingDto {
  id: number;
  companyId: number;
  routingCode: string;
  routingName: string;
  outputItemId: number | null;
  revisionCode: string | null;
  status: string;
  operations: RoutingOperationDto[];
}

export interface RoutingOperationUpsertRequest {
  sequenceNo: number;
  operationId: number;
  workCenterId: number | null;
  toolId: number | null;
  setupMinutes: number;
  runMinutesPerUnit: number;
  teardownMinutes: number;
  overlapPercent: number | null;
  isOutsideProcessing: boolean;
  requiresQcCheckpoint: boolean;
  status: string;
}

export interface RoutingUpsertRequest {
  companyId: number;
  routingCode: string;
  routingName: string;
  outputItemId: number | null;
  revisionCode: string | null;
  status: string;
  operations: RoutingOperationUpsertRequest[];
}

export interface AlternateItemDto {
  id: number;
  companyId: number;
  primaryItemId: number;
  alternateItemId: number;
  contextType: string;
  bomId: number | null;
  priorityRank: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  approvalStatus: string;
  reasonCode: string | null;
}

export interface AlternateItemUpsertRequest {
  companyId: number;
  primaryItemId: number;
  alternateItemId: number;
  contextType: string;
  bomId: number | null;
  priorityRank: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  approvalStatus: string;
  reasonCode: string | null;
}

export interface EngineeringChangeLineDto {
  id: number;
  lineNo: number;
  impactType: string;
  targetEntityId: number;
  actionType: string;
  fromValueSummary: string | null;
  toValueSummary: string | null;
  effectiveFrom: string | null;
}

export interface EngineeringChangeLineUpsertRequest {
  lineNo: number;
  impactType: string;
  targetEntityId: number;
  actionType: string;
  fromValueSummary: string | null;
  toValueSummary: string | null;
  effectiveFrom: string | null;
}

export interface EngineeringChangeDto {
  id: number;
  companyId: number;
  ecoCode: string;
  ecoTitle: string;
  changeType: string;
  requestedByUserId: number;
  requestedOn: string;
  effectiveFrom: string | null;
  approvalStatus: string;
  reasonCode: string | null;
  lines: EngineeringChangeLineDto[];
}

export interface EngineeringChangeUpsertRequest {
  companyId: number;
  ecoCode: string;
  ecoTitle: string;
  changeType: string;
  requestedByUserId: number;
  requestedOn: string;
  effectiveFrom: string | null;
  approvalStatus: string;
  reasonCode: string | null;
  lines: EngineeringChangeLineUpsertRequest[];
}

export interface MrpRunItemDto {
  id: number;
  itemId: number;
  demandSourceType: string;
  grossRequirementQty: number;
  netRequirementQty: number;
  availableQtyAtRun: number;
  recommendedAction: string;
  exceptionCode: string | null;
}

export interface MrpRunDto {
  id: number;
  companyId: number;
  branchId: number;
  runCode: string;
  runType: string;
  triggeredFromMpsId: number | null;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  status: string;
  runStartedOn: string;
  runCompletedOn: string | null;
  items: MrpRunItemDto[];
}

export interface MrpRunStartRequest {
  companyId: number;
  branchId: number;
  runCode: string;
  runType: string;
  triggeredFromMpsId: number | null;
  planningHorizonStart: string;
  planningHorizonEnd: string;
}

export interface BoqRequirementLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  requiredQuantity: number;
  requirementUomId: number;
  needByDate: string;
  recommendedAction: string;
  approvedAction: string | null;
  overrideReasonCode: string | null;
  overriddenByUserId: number | null;
  status: string;
}

export interface BoqRequirementDto {
  id: number;
  companyId: number;
  branchId: number;
  mrpRunId: number | null;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  status: string;
  lines: BoqRequirementLineDto[];
}

export interface BoqRequirementLineUpsertRequest {
  lineNo: number;
  itemId: number;
  requiredQuantity: number;
  requirementUomId: number;
  needByDate: string;
  recommendedAction: string;
  approvedAction: string | null;
  overrideReasonCode: string | null;
  itemCode?: string | null;
}

export interface BoqRequirementUpsertRequest {
  companyId: number;
  branchId: number;
  mrpRunId: number | null;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  status: string;
  lines: BoqRequirementLineUpsertRequest[];
}

export interface BoqLineActionRequest {
  approvedAction: string;
  overrideReasonCode: string | null;
}

export interface PlanningPlanDto {
  id: number;
  companyId: number;
  branchId: number;
  planCode: string;
  planName: string;
  planType: string;
  horizonStart: string;
  horizonEnd: string;
  firmFenceDays: number;
  forecastFenceDays: number;
  includeForecast: boolean;
  includeCapacity: boolean;
  status: string;
}

export interface PlanningPlanUpsertRequest {
  companyId: number;
  branchId: number;
  planCode: string;
  planName: string;
  planType: string;
  horizonStart: string;
  horizonEnd: string;
  firmFenceDays: number;
  forecastFenceDays: number;
  includeForecast: boolean;
  includeCapacity: boolean;
  status: string;
}

export interface PlanningSnapshotDto {
  id: number;
  companyId: number;
  branchId: number;
  planningPlanId: number | null;
  mrpRunId: number | null;
  snapshotCode: string;
  snapshotType: string;
  inputHash: string;
  outputHash: string;
  demandLineCount: number;
  supplyLineCount: number;
  exceptionCount: number;
  plannedQuantity: number;
  capturedOn: string;
  status: string;
}

export interface PlanningSnapshotCreateRequest {
  companyId: number;
  branchId: number;
  planningPlanId: number | null;
  mrpRunId: number | null;
  snapshotCode: string;
  snapshotType: string;
  inputHash: string;
  outputHash: string;
  demandLineCount: number;
  supplyLineCount: number;
  exceptionCount: number;
  plannedQuantity: number;
  status: string;
}

export interface PlannedOrderDto {
  id: number;
  companyId: number;
  branchId: number;
  planningPlanId: number | null;
  mrpRunId: number | null;
  boqRequirementLineId: number | null;
  plannedOrderNo: string;
  orderType: string;
  itemId: number;
  quantity: number;
  uomId: number;
  plannedStartDate: string;
  plannedDueDate: string;
  sourceWarehouseId: number | null;
  targetWarehouseId: number | null;
  bomRevisionId: number | null;
  routingId: number | null;
  isFirm: boolean;
  isReleased: boolean;
  isExpedite: boolean;
  peggingSourceType: string;
  peggingSourceId: number | null;
  status: string;
  targetDocumentId: number | null;
  targetDocumentType: string | null;
}

export interface PlannedOrderUpsertRequest {
  companyId: number;
  branchId: number;
  planningPlanId: number | null;
  mrpRunId: number | null;
  boqRequirementLineId: number | null;
  plannedOrderNo: string;
  orderType: string;
  itemId: number;
  quantity: number;
  uomId: number;
  plannedStartDate: string;
  plannedDueDate: string;
  sourceWarehouseId: number | null;
  targetWarehouseId: number | null;
  bomRevisionId: number | null;
  routingId: number | null;
  isFirm: boolean;
  isExpedite: boolean;
  peggingSourceType: string;
  peggingSourceId: number | null;
  status: string;
  itemCode?: string | null;
}

export interface PlannedOrderConversionResultDto {
  plannedOrderId: number;
  targetDocumentType: string;
  targetDocumentId: number;
  targetDocumentNo: string;
  status: string;
}

export interface ShortageActionDto {
  id: number;
  companyId: number;
  branchId: number;
  plannedOrderId: number | null;
  mrpRunItemId: number | null;
  itemId: number;
  shortageQuantity: number;
  actionType: string;
  ownerUserId: number | null;
  dueDate: string;
  reasonCode: string;
  status: string;
  resolutionNote: string;
}

export interface ShortageActionUpsertRequest {
  companyId: number;
  branchId: number;
  plannedOrderId: number | null;
  mrpRunItemId: number | null;
  itemId: number;
  shortageQuantity: number;
  actionType: string;
  ownerUserId: number | null;
  dueDate: string;
  reasonCode: string;
  status: string;
  resolutionNote: string;
  itemCode?: string | null;
}

export interface PurchaseRequisitionLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  requiredQuantity: number;
  orderUomId: number;
  needByDate: string;
  sourceBoqRequirementLineId: number | null;
  linkedWorkOrderId: number | null;
  status: string;
}

export interface PurchaseRequisitionLineUpsertRequest {
  lineNo: number;
  itemId: number;
  requiredQuantity: number;
  orderUomId: number;
  needByDate: string;
  sourceBoqRequirementLineId: number | null;
  linkedWorkOrderId: number | null;
  status: string;
  itemCode?: string | null;
}

export interface PurchaseRequisitionDto {
  id: number;
  companyId: number;
  branchId: number;
  purchaseRequisitionNo: string;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  status: string;
  lines: PurchaseRequisitionLineDto[];
}

export interface PurchaseRequisitionUpsertRequest {
  companyId: number;
  branchId: number;
  purchaseRequisitionNo: string;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  status: string;
  lines: PurchaseRequisitionLineUpsertRequest[];
}

export interface PurchaseOrderLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  purchaseRequisitionLineId: number | null;
  orderedQuantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineAmount: number;
  orderUomId: number;
  expectedDate: string;
  linkedWorkOrderId: number | null;
  sourceBoqRequirementLineId: number | null;
  status: string;
}

export interface PurchaseOrderLineUpsertRequest {
  lineNo: number;
  itemId: number;
  purchaseRequisitionLineId: number | null;
  orderedQuantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  orderUomId: number;
  expectedDate: string;
  linkedWorkOrderId: number | null;
  sourceBoqRequirementLineId: number | null;
  status: string;
  itemCode?: string | null;
}

export interface PurchaseOrderDto {
  id: number;
  companyId: number;
  branchId: number;
  purchaseOrderNo: string;
  supplierId: number;
  orderAddressId: number | null;
  status: string;
  expectedReceiptDate: string | null;
  lines: PurchaseOrderLineDto[];
}

export interface PurchaseOrderUpsertRequest {
  companyId: number;
  branchId: number;
  purchaseOrderNo: string;
  supplierId: number;
  orderAddressId: number | null;
  status: string;
  expectedReceiptDate: string | null;
  lines: PurchaseOrderLineUpsertRequest[];
  supplierCode?: string | null;
  orderAddressCode?: string | null;
}

export interface SubcontractOrderDto {
  id: number;
  companyId: number;
  branchId: number;
  subcontractOrderNo: string;
  supplierId: number;
  workOrderId: number | null;
  operationId: number | null;
  status: string;
  expectedReturnDate: string | null;
}

export interface SubcontractOrderUpsertRequest {
  companyId: number;
  branchId: number;
  subcontractOrderNo: string;
  supplierId: number;
  workOrderId: number | null;
  operationId: number | null;
  status: string;
  expectedReturnDate: string | null;
  supplierCode?: string | null;
}

export interface SubcontractReceiptDto {
  id: number;
  companyId: number;
  branchId: number;
  receiptNo: string;
  subcontractOrderId: number;
  receiptDate: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  qcStatus: string;
  status: string;
  remarks: string | null;
}

export interface SubcontractReceiptUpsertRequest {
  companyId: number;
  branchId: number;
  receiptNo: string;
  subcontractOrderId: number;
  receiptDate: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  qcStatus: string;
  status: string;
  remarks: string | null;
}

export interface GoodsReceiptLineDto {
  id: number;
  lineNo: number;
  purchaseOrderLineId: number;
  itemId: number;
  orderUomId: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitPrice: number;
  taxPercent: number;
  lineAmount: number;
  qcStatus: string;
  status: string;
}

export interface GoodsReceiptLineUpsertRequest {
  lineNo: number;
  purchaseOrderLineId: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  qcStatus: string;
  status: string;
}

export interface GoodsReceiptDto {
  id: number;
  companyId: number;
  branchId: number;
  goodsReceiptNo: string;
  purchaseOrderId: number;
  supplierId: number;
  receiptDate: string;
  warehouseId: number | null;
  status: string;
  remarks: string | null;
  lines: GoodsReceiptLineDto[];
}

export interface GoodsReceiptUpsertRequest {
  companyId: number;
  branchId: number;
  goodsReceiptNo: string;
  purchaseOrderId: number;
  receiptDate: string;
  warehouseId: number | null;
  status: string;
  remarks: string | null;
  lines: GoodsReceiptLineUpsertRequest[];
}

export interface SupplierInvoiceLineUpsertRequest {
  lineNo: number;
  purchaseOrderLineId: number;
  goodsReceiptLineId: number;
  invoiceQuantity: number;
  unitPrice: number;
  taxPercent: number;
}

export interface SupplierInvoiceLineDto {
  id: number;
  lineNo: number;
  purchaseOrderLineId: number;
  goodsReceiptLineId: number;
  itemId: number;
  invoiceQuantity: number;
  unitPrice: number;
  taxPercent: number;
  taxAmount: number;
  lineAmount: number;
  matchStatus: string;
}

export interface SupplierInvoiceUpsertRequest {
  companyId: number;
  branchId: number;
  supplierInvoiceNo: string;
  supplierId: number;
  purchaseOrderId: number;
  goodsReceiptId: number;
  invoiceDate: string;
  dueDate: string | null;
  currencyCode: string;
  status: string;
  lines: SupplierInvoiceLineUpsertRequest[];
}

export interface SupplierInvoiceDto {
  id: number;
  companyId: number;
  branchId: number;
  supplierInvoiceNo: string;
  supplierId: number;
  purchaseOrderId: number;
  goodsReceiptId: number;
  invoiceDate: string;
  dueDate: string | null;
  currencyCode: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  matchStatus: string;
  apStatus: string;
  status: string;
  lines: SupplierInvoiceLineDto[];
}

export interface AccountsPayableLiabilityDto {
  id: number;
  companyId: number;
  branchId: number;
  liabilityNo: string;
  supplierInvoiceId: number;
  supplierId: number;
  postingDate: string;
  dueDate: string;
  payableAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
}

export interface AccountingPostingDto {
  id: number;
  companyId: number;
  branchId: number;
  postingNo: string;
  sourceDocumentType: string;
  sourceDocumentId: number;
  postingDate: string;
  debitAccountCode: string;
  creditAccountCode: string;
  amount: number;
  status: string;
}

export interface SupplierInvoicePostingResultDto {
  invoice: SupplierInvoiceDto;
  liability: AccountsPayableLiabilityDto;
  postings: AccountingPostingDto[];
}

export interface RfqLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  orderUomId: number;
  requestedQuantity: number;
  needByDate: string;
  purchaseRequisitionLineId: number | null;
  status: string;
}

export interface RfqLineUpsertRequest {
  lineNo: number;
  itemId: number;
  orderUomId: number;
  requestedQuantity: number;
  needByDate: string;
  purchaseRequisitionLineId: number | null;
  status: string;
  itemCode?: string | null;
}

export interface RfqSupplierDto {
  id: number;
  supplierId: number;
  invitationStatus: string;
  responseDueDate: string;
  remarks: string | null;
}

export interface RfqSupplierUpsertRequest {
  supplierId: number;
  invitationStatus: string;
  responseDueDate: string;
  remarks: string | null;
  supplierCode?: string | null;
}

export interface RfqDto {
  id: number;
  companyId: number;
  branchId: number;
  rfqNo: string;
  purchaseRequisitionId: number | null;
  issueDate: string;
  responseDueDate: string;
  currencyCode: string;
  status: string;
  remarks: string | null;
  lines: RfqLineDto[];
  suppliers: RfqSupplierDto[];
}

export interface RfqUpsertRequest {
  companyId: number;
  branchId: number;
  rfqNo: string;
  purchaseRequisitionId: number | null;
  issueDate: string;
  responseDueDate: string;
  currencyCode: string;
  status: string;
  remarks: string | null;
  lines: RfqLineUpsertRequest[];
  suppliers: RfqSupplierUpsertRequest[];
}

export interface SupplierQuotationLineDto {
  id: number;
  lineNo: number;
  rfqLineId: number;
  itemId: number;
  orderUomId: number;
  offeredQuantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineAmount: number;
  leadTimeDays: number;
  status: string;
}

export interface SupplierQuotationLineUpsertRequest {
  lineNo: number;
  rfqLineId: number;
  itemId: number;
  orderUomId: number;
  offeredQuantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  leadTimeDays: number;
  status: string;
  itemCode?: string | null;
}

export interface SupplierQuotationDto {
  id: number;
  companyId: number;
  branchId: number;
  supplierQuotationNo: string;
  rfqId: number;
  supplierId: number;
  quotationDate: string;
  validUntil: string;
  currencyCode: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  selectionStatus: string;
  selectionReason: string | null;
  status: string;
  lines: SupplierQuotationLineDto[];
}

export interface SupplierQuotationUpsertRequest {
  companyId: number;
  branchId: number;
  supplierQuotationNo: string;
  rfqId: number;
  supplierId: number;
  quotationDate: string;
  validUntil: string;
  currencyCode: string;
  status: string;
  lines: SupplierQuotationLineUpsertRequest[];
  supplierCode?: string | null;
}

export interface SupplierQuotationSelectionRequest {
  selectionReason: string;
}

export interface QuoteComparisonLineDto {
  rfqLineId: number;
  lineNo: number;
  itemId: number;
  orderUomId: number;
  requestedQuantity: number;
  supplierLines: SupplierQuotationLineDto[];
}

export interface QuoteComparisonDto {
  rfq: RfqDto;
  supplierQuotations: SupplierQuotationDto[];
  lines: QuoteComparisonLineDto[];
}

export interface StockBalanceDto {
  id: number;
  companyId: number;
  branchId: number;
  itemId: number;
  itemVariantId: number | null;
  warehouseId: number;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  pcidId?: number | null;
  onHandQty: number;
  reservedQty: number;
  qcHoldQty: number;
  blockedQty: number;
  inTransitQty: number;
  catchWeightQty: number | null;
}

export interface StockTransactionDto {
  id: number;
  companyId: number;
  branchId: number;
  transactionNo: string;
  transactionType: string;
  postingDate: string;
  itemId: number;
  itemVariantId: number | null;
  fromWarehouseId: number | null;
  fromBinId: number | null;
  toWarehouseId: number | null;
  toBinId: number | null;
  lotId: number | null;
  serialId: number | null;
  pcidId?: number | null;
  quantity: number;
  catchWeightQty: number | null;
  inventoryState: string;
  sourceDocumentType: string | null;
  sourceDocumentId: number | null;
  remarks: string | null;
  sourceDocumentNo?: string | null;
  sourceDocumentLineId?: number | null;
  sourceDocumentRevisionNo?: number | null;
  sourceDocumentVersionNo?: number | null;
  itemRevisionId?: number | null;
  engineeringDocumentRevisionId?: number | null;
  bomRevisionId?: number | null;
  routingId?: number | null;
  routingRevisionId?: number | null;
  workOrderId?: number | null;
  productionOrderId?: number | null;
  salesOrderId?: number | null;
  salesOrderLineId?: number | null;
  purchaseOrderId?: number | null;
  purchaseOrderLineId?: number | null;
  qualityDocumentId?: number | null;
  legacyTrackingIncomplete?: boolean;
}

export interface StockReservationDto {
  id: number;
  companyId: number;
  branchId: number;
  itemId: number;
  itemVariantId: number | null;
  warehouseId: number | null;
  binId: number | null;
  lotId: number | null;
  reservedQuantity: number;
  sourceDocumentType: string;
  sourceDocumentId: number;
  status: string;
}

export interface StockReservationRequest {
  companyId: number;
  branchId: number;
  itemId: number;
  itemVariantId?: number | null;
  warehouseId: number;
  binId?: number | null;
  lotId?: number | null;
  reservedQuantity: number;
  sourceDocumentType: string;
  sourceDocumentId: number;
  status: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  lotNo?: string | null;
}

export interface StockReservationReleaseRequest {
  remarks?: string | null;
}

export interface InventoryTrackingPolicyRequest {
  companyId: number;
  branchId: number;
  itemId: number;
  warehouseId?: number | null;
  movementType?: string;
}

export interface InventoryTrackingPolicyDto {
  companyId: number;
  branchId: number;
  itemId: number;
  warehouseId: number | null;
  isStockControlled: boolean;
  requiresBin: boolean;
  requiresLot: boolean;
  requiresSerial: boolean;
  requiresPcid: boolean;
  allowsNegativeStock: boolean;
  policySource: string;
  requiredDimensions: string[];
}

export interface InventoryAvailableStockRequest {
  companyId: number;
  branchId: number;
  itemId: number;
  itemVariantId?: number | null;
  warehouseId: number;
  binId?: number | null;
  lotId?: number | null;
  serialId?: number | null;
  pcidId?: number | null;
  inventoryState?: string;
}

export interface InventoryAvailableStockDto {
  companyId: number;
  branchId: number;
  itemId: number;
  itemVariantId: number | null;
  warehouseId: number;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  pcidId: number | null;
  inventoryState: string;
  availableQuantity: number;
  blockedReason: string | null;
}

export interface InventoryDimensionQuery {
  companyId: number;
  branchId: number;
  itemId?: number | null;
  warehouseId?: number | null;
  binId?: number | null;
  lotId?: number | null;
  serialId?: number | null;
  pcidId?: number | null;
  inventoryState?: string | null;
}

export interface InventoryDimensionOptionDto {
  id: number;
  code: string;
  label: string;
  status: string;
  availableQuantity: number | null;
  disabledReason: string | null;
}

export interface StockIssueLineRequest {
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  fromWarehouseId: number;
  fromBinId: number | null;
  lotId: number | null;
  serialId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  inventoryState: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  lotNo?: string | null;
  serialNo?: string | null;
  pcidId?: number | null;
  pcidNo?: string | null;
  sourceDocumentNo?: string | null;
  sourceDocumentLineId?: number | null;
  sourceDocumentRevisionNo?: number | null;
  sourceDocumentVersionNo?: number | null;
  itemRevisionId?: number | null;
  engineeringDocumentRevisionId?: number | null;
  bomRevisionId?: number | null;
  routingId?: number | null;
  routingRevisionId?: number | null;
  workOrderId?: number | null;
  productionOrderId?: number | null;
  salesOrderId?: number | null;
  salesOrderLineId?: number | null;
  purchaseOrderId?: number | null;
  purchaseOrderLineId?: number | null;
  qualityDocumentId?: number | null;
}

export interface StockIssueRequest {
  companyId: number;
  branchId: number;
  transactionNo: string;
  postingDate: string;
  sourceDocumentType: string | null;
  sourceDocumentId: number | null;
  remarks: string | null;
  lines: StockIssueLineRequest[];
}

export interface StockReturnLineRequest {
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  toWarehouseId: number;
  toBinId: number | null;
  lotId: number | null;
  serialId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  inventoryState: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  lotNo?: string | null;
  serialNo?: string | null;
  pcidId?: number | null;
  pcidNo?: string | null;
  sourceDocumentNo?: string | null;
  sourceDocumentLineId?: number | null;
  sourceDocumentRevisionNo?: number | null;
  sourceDocumentVersionNo?: number | null;
  itemRevisionId?: number | null;
  engineeringDocumentRevisionId?: number | null;
  bomRevisionId?: number | null;
  routingId?: number | null;
  routingRevisionId?: number | null;
  workOrderId?: number | null;
  productionOrderId?: number | null;
  salesOrderId?: number | null;
  salesOrderLineId?: number | null;
  purchaseOrderId?: number | null;
  purchaseOrderLineId?: number | null;
  qualityDocumentId?: number | null;
}

export interface StockReturnRequest {
  companyId: number;
  branchId: number;
  transactionNo: string;
  postingDate: string;
  sourceDocumentType: string | null;
  sourceDocumentId: number | null;
  remarks: string | null;
  lines: StockReturnLineRequest[];
}

export interface StockTransferLineRequest {
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  fromWarehouseId: number;
  fromBinId: number | null;
  toWarehouseId: number;
  toBinId: number | null;
  lotId: number | null;
  serialId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  inventoryState: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  lotNo?: string | null;
  serialNo?: string | null;
  pcidId?: number | null;
  pcidNo?: string | null;
  sourceDocumentNo?: string | null;
  sourceDocumentLineId?: number | null;
  sourceDocumentRevisionNo?: number | null;
  sourceDocumentVersionNo?: number | null;
  itemRevisionId?: number | null;
  engineeringDocumentRevisionId?: number | null;
  bomRevisionId?: number | null;
  routingId?: number | null;
  routingRevisionId?: number | null;
  workOrderId?: number | null;
  productionOrderId?: number | null;
  salesOrderId?: number | null;
  salesOrderLineId?: number | null;
  purchaseOrderId?: number | null;
  purchaseOrderLineId?: number | null;
  qualityDocumentId?: number | null;
}

export interface StockTransferRequest {
  companyId: number;
  branchId: number;
  transactionNo: string;
  postingDate: string;
  sourceDocumentType: string | null;
  sourceDocumentId: number | null;
  remarks: string | null;
  lines: StockTransferLineRequest[];
}

export interface LotTraceabilityDto {
  id: number;
  companyId: number;
  itemId: number;
  lotNo: string;
  manufacturedOn: string | null;
  expiryOn: string | null;
  lotStatus: string;
  catchWeightQty: number | null;
  balances: StockBalanceDto[];
  transactions: StockTransactionDto[];
}

export interface SerialTraceabilityDto {
  id: number;
  companyId: number;
  itemId: number;
  serialNo: string;
  lotId: number | null;
  currentWarehouseId: number | null;
  currentBinId: number | null;
  serialStatus: string;
  manufacturedOn: string | null;
  expiryOn: string | null;
  balances: StockBalanceDto[];
  transactions: StockTransactionDto[];
}

export interface CycleCountLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  systemQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  status: string;
  remarks: string | null;
}

export interface CycleCountDto {
  id: number;
  companyId: number;
  branchId: number;
  warehouseId: number;
  countNo: string;
  countDate: string;
  countType: string;
  status: string;
  remarks: string | null;
  postedOn: string | null;
  lines: CycleCountLineDto[];
}

export interface CycleCountLineUpsertRequest {
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  countedQuantity: number;
  status: string;
  remarks: string | null;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  lotNo?: string | null;
  serialNo?: string | null;
}

export interface CycleCountUpsertRequest {
  companyId: number;
  branchId: number;
  warehouseId: number;
  countNo: string;
  countDate: string;
  countType: string;
  status: string;
  remarks: string | null;
  lines: CycleCountLineUpsertRequest[];
}

export interface WorkOrderOperationDto {
  id: number;
  sequenceNo: number;
  operationId: number;
  routingOperationId: number | null;
  workCenterId: number | null;
  plannedQuantity: number;
  completedQuantity: number;
  requiresQcCheckpoint: boolean;
  status: string;
}

export interface WorkOrderSummaryDto {
  id: number;
  companyId: number;
  branchId: number;
  workOrderNo: string;
  salesOrderLineId: number | null;
  itemId: number;
  bomRevisionId: number;
  routingId: number | null;
  plannedQuantity: number;
  productionUomId: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  status: string;
  releasedOn: string | null;
  operationCount: number;
  completedOperationCount: number;
}

export interface WorkOrderDto {
  id: number;
  companyId: number;
  branchId: number;
  workOrderNo: string;
  salesOrderLineId: number | null;
  itemId: number;
  bomRevisionId: number;
  routingId: number | null;
  plannedQuantity: number;
  productionUomId: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  status: string;
  remarks: string | null;
  releasedOn: string | null;
  closedOn: string | null;
  cancelledOn: string | null;
  operations: WorkOrderOperationDto[];
}

export interface WorkOrderUpsertRequest {
  companyId: number;
  branchId: number;
  workOrderNo: string;
  salesOrderLineId?: number | null;
  itemId: number;
  bomRevisionId: number;
  routingId?: number | null;
  plannedQuantity: number;
  productionUomId: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  status: string;
  remarks?: string | null;
}

export interface WorkOrderActionRequest {
  remarks?: string | null;
}

export interface WorkOrderReadinessBlockerDto {
  code: string;
  message: string;
}

export interface WorkOrderMaterialReadinessDto {
  componentItemId: number;
  requiredQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
  blockedQuantity: number;
  qcHoldQuantity: number;
}

export interface WorkOrderOperationReadinessDto {
  sequenceNo: number;
  operationId: number;
  routingOperationId: number | null;
  workCenterId: number | null;
  status: string;
  capacityReady: boolean;
  capacityMessage: string | null;
}

export interface WorkOrderReadinessDto {
  workOrderId: number;
  workOrderNo: string;
  status: string;
  canRelease: boolean;
  engineeringReady: boolean;
  materialReady: boolean;
  capacityReady: boolean;
  workflowReady: boolean;
  blockingReasons: WorkOrderReadinessBlockerDto[];
  materialReadiness: WorkOrderMaterialReadinessDto[];
  operationReadiness: WorkOrderOperationReadinessDto[];
}

export interface JobCardEventDto {
  id: number;
  eventType: string;
  machineId: number | null;
  operatorUserId: number | null;
  eventOn: string;
  quantity: number | null;
  reasonCode: string | null;
  remarks: string | null;
}

export interface DowntimeEventDto {
  id: number;
  jobCardId: number;
  machineId: number;
  reasonCode: string;
  startOn: string;
  endOn: string;
  durationMinutes: number;
  remarks: string | null;
}

export interface JobCardSummaryDto {
  id: number;
  companyId: number;
  branchId: number;
  jobCardNo: string;
  workOrderId: number;
  workOrderNo: string | null;
  workOrderOperationId: number;
  operationId: number;
  splitSequenceNo: number | null;
  assignedMachineId: number | null;
  assignedOperatorUserId: number | null;
  shiftId: number | null;
  plannedQuantity: number;
  completedGoodQty: number;
  completedRejectQty: number;
  completedScrapQty: number;
  status: string;
}

export interface JobCardDto {
  id: number;
  companyId: number;
  branchId: number;
  jobCardNo: string;
  workOrderId: number;
  workOrderNo: string | null;
  workOrderOperationId: number;
  operationId: number;
  parentJobCardId: number | null;
  splitSequenceNo: number | null;
  assignedMachineId: number | null;
  assignedOperatorUserId: number | null;
  shiftId: number | null;
  plannedQuantity: number;
  completedGoodQty: number;
  completedRejectQty: number;
  completedScrapQty: number;
  status: string;
  events: JobCardEventDto[];
  downtimes: DowntimeEventDto[];
}

export interface CreateJobCardsRequest {
  workOrderId: number;
  regenerateIfExists?: boolean;
}

export interface JobCardStartRequest {
  machineId: number;
  operatorUserId: number;
  eventOn?: string | null;
  remarks?: string | null;
}

export interface JobCardPauseRequest {
  reasonCode: string;
  remarks?: string | null;
}

export interface JobCardResumeRequest {
  machineId?: number | null;
  operatorUserId?: number | null;
  remarks?: string | null;
}

export interface JobCardQuantityRequest {
  goodQty: number;
  rejectQty: number;
  scrapQty: number;
  catchWeightQty?: number | null;
  reasonCode?: string | null;
  remarks?: string | null;
}

export interface JobCardQuantityResultDto {
  jobCardId: number;
  jobCardNo: string;
  completedGoodQty: number;
  completedRejectQty: number;
  completedScrapQty: number;
  totalProcessedQty: number;
  remainingQuantity: number;
  status: string;
}

export interface JobCardCompleteRequest {
  remarks?: string | null;
}

export interface MachineBoardItem {
  machineId: number;
  machineCode: string;
  machineName: string;
  workCenterId: number | null;
  currentStatus: string;
  activeJobCardId: number | null;
  activeJobCardNo: string | null;
  activeWorkOrderNo: string | null;
  itemCode: string | null;
  plannedStartOn: string | null;
  plannedEndOn: string | null;
  riskStatus: string | null;
  queuedJobCardsJson: string;
}

export interface ProductionReceiptLineDto {
  id: number;
  lineNo: number;
  lineType: string;
  itemId: number;
  itemVariantId: number | null;
  outputUomId: number;
  warehouseId: number;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  inventoryState: string;
  remarks: string | null;
}

export interface ProductionReceiptSummaryDto {
  id: number;
  companyId: number;
  branchId: number;
  receiptNo: string;
  postingDate: string;
  workOrderId: number | null;
  jobCardId: number | null;
  status: string;
  postedOn: string | null;
}

export interface ProductionReceiptDto {
  id: number;
  companyId: number;
  branchId: number;
  receiptNo: string;
  postingDate: string;
  workOrderId: number | null;
  jobCardId: number | null;
  status: string;
  correlationId: string | null;
  remarks: string | null;
  postedOn: string | null;
  lines: ProductionReceiptLineDto[];
  stockTransactions: StockTransactionDto[];
}

export interface ProductionReceiptLineRequest {
  lineNo: number;
  lineType: string;
  itemId: number;
  itemVariantId: number | null;
  outputUomId: number;
  warehouseId: number;
  binId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  inventoryState: string;
  remarks: string | null;
  lotId?: number | null;
  lotNo?: string | null;
  manufacturedOn?: string | null;
  expiryOn?: string | null;
  serialId?: number | null;
  serialNo?: string | null;
  itemCode?: string | null;
  itemVariantCode?: string | null;
}

export interface ProductionReceiptCreateRequest {
  companyId: number;
  branchId: number;
  receiptNo: string;
  postingDate: string;
  workOrderId: number | null;
  jobCardId: number | null;
  correlationId: string | null;
  remarks: string | null;
  lines: ProductionReceiptLineRequest[];
}

export interface ScrapEntryDto {
  id: number;
  companyId: number;
  branchId: number;
  scrapNo: string;
  postingDate: string;
  workOrderId: number | null;
  jobCardId: number | null;
  itemId: number;
  itemVariantId: number | null;
  warehouseId: number;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  reasonCode: string;
  inventoryState: string;
  status: string;
  remarks: string | null;
  stockTransactions: StockTransactionDto[];
}

export interface ScrapEntryCreateRequest {
  companyId: number;
  branchId: number;
  scrapNo: string;
  postingDate: string;
  workOrderId: number | null;
  jobCardId: number | null;
  itemId: number;
  itemVariantId: number | null;
  warehouseId: number;
  binId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  reasonCode: string;
  inventoryState: string;
  remarks: string | null;
  lotId?: number | null;
  lotNo?: string | null;
  serialId?: number | null;
  serialNo?: string | null;
  itemCode?: string | null;
  itemVariantCode?: string | null;
}

export interface ReworkOrderDto {
  id: number;
  companyId: number;
  branchId: number;
  reworkNo: string;
  sourceDocumentType: string | null;
  sourceDocumentId: number | null;
  workOrderId: number | null;
  jobCardId: number | null;
  itemId: number;
  itemVariantId: number | null;
  sourceWarehouseId: number | null;
  sourceBinId: number | null;
  targetWarehouseId: number | null;
  targetBinId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  reasonCode: string | null;
  instructions: string | null;
  status: string;
  releasedOn: string | null;
  closedOn: string | null;
  stockTransactions: StockTransactionDto[];
}

export interface ReworkOrderCreateRequest {
  companyId: number;
  branchId: number;
  reworkNo: string;
  sourceDocumentType: string | null;
  sourceDocumentId: number | null;
  workOrderId: number | null;
  jobCardId: number | null;
  itemId: number;
  itemVariantId: number | null;
  sourceWarehouseId: number | null;
  sourceBinId: number | null;
  targetWarehouseId: number | null;
  targetBinId: number | null;
  quantity: number;
  catchWeightQty: number | null;
  reasonCode: string | null;
  instructions: string | null;
  inventoryState: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  lotId?: number | null;
  lotNo?: string | null;
  serialId?: number | null;
  serialNo?: string | null;
}

export interface ReworkOrderActionRequest {
  instructions?: string | null;
}

export interface InspectionPlanDto {
  id: number;
  companyId: number;
  planCode: string;
  planName: string;
  inspectionType: string;
  itemId: number | null;
  operationId: number | null;
  autoHoldOnFail: boolean;
  autoCreateNcrOnFail: boolean;
  status: string;
  characteristics: InspectionPlanCharacteristicDto[];
}

export interface InspectionPlanCharacteristicDto {
  id: number;
  lineNo: number;
  parameterCode: string;
  parameterName: string;
  characteristicType: string;
  expectedValue: string | null;
  lowerLimit: number | null;
  upperLimit: number | null;
  uomId: number | null;
  sampleSize: number;
  isMandatory: boolean;
  status: string;
  remarks: string | null;
}

export interface InspectionPlanCharacteristicRequest {
  id?: number | null;
  lineNo: number;
  parameterCode: string;
  parameterName: string;
  characteristicType: string;
  expectedValue?: string | null;
  lowerLimit?: number | null;
  upperLimit?: number | null;
  uomId?: number | null;
  sampleSize: number;
  isMandatory: boolean;
  status: string;
  remarks?: string | null;
}

export interface InspectionPlanUpsertRequest {
  companyId: number;
  planCode: string;
  planName: string;
  inspectionType: string;
  itemId?: number | null;
  operationId?: number | null;
  autoHoldOnFail: boolean;
  autoCreateNcrOnFail: boolean;
  status: string;
  itemCode?: string | null;
  characteristics: InspectionPlanCharacteristicRequest[];
}

export interface InspectionResultDto {
  id: number;
  lineNo: number;
  parameterCode: string;
  expectedValue: string | null;
  actualValue: string | null;
  resultStatus: string;
  remarks: string | null;
}

export interface InspectionDto {
  id: number;
  companyId: number;
  branchId: number;
  inspectionNo: string;
  inspectionPlanId: number | null;
  inspectionType: string;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  lotId: number | null;
  serialId: number | null;
  status: string;
  overallResult: string;
  requestToken: string | null;
  notes: string | null;
  heldOn: string | null;
  releasedOn: string | null;
  results: InspectionResultDto[];
}

export interface InspectionResultRequest {
  lineNo: number;
  parameterCode: string;
  expectedValue?: string | null;
  actualValue?: string | null;
  resultStatus: string;
  remarks?: string | null;
}

export interface InspectionSaveRequest {
  companyId: number;
  branchId: number;
  inspectionNo: string;
  inspectionPlanId?: number | null;
  inspectionType: string;
  sourceDocumentType: string;
  sourceDocumentId?: number | null;
  lotId?: number | null;
  serialId?: number | null;
  requestToken?: string | null;
  notes?: string | null;
  overallResult?: string | null;
  autoCreateNcr: boolean;
  ncrNo?: string | null;
  ncrDisposition?: string | null;
  ncrRootCause?: string | null;
  results: InspectionResultRequest[];
}

export interface InspectionHoldReleaseRequest {
  notes?: string | null;
}

export interface NonConformanceDto {
  id: number;
  companyId: number;
  branchId: number;
  ncrNo: string;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  lotId: number | null;
  serialId: number | null;
  disposition: string;
  status: string;
  defectCategory: string | null;
  containmentAction: string | null;
  rootCause: string | null;
  correctiveAction: string | null;
  preventiveAction: string | null;
  dispositionReleasedOn: string | null;
  dispositionReleasedByUserId: number | null;
  closedOn: string | null;
  closedByUserId: number | null;
  reworkOrderId: number | null;
  remarks: string | null;
  lines: NonConformanceLineDto[];
}

export interface NonConformanceLineDto {
  id: number;
  lineNo: number;
  itemId: number | null;
  itemRevisionId: number | null;
  lotId: number | null;
  serialId: number | null;
  affectedQuantity: number | null;
  uomId: number | null;
  defectCode: string;
  defectDescription: string;
  disposition: string;
  remarks: string | null;
}

export interface NonConformanceActionRequest {
  remarks?: string | null;
}

export interface NonConformanceDispositionRequest {
  disposition: string;
  containmentAction?: string | null;
  rootCause?: string | null;
  correctiveAction?: string | null;
  preventiveAction?: string | null;
  remarks?: string | null;
}

export interface NonConformanceLineRequest {
  id?: number | null;
  lineNo: number;
  itemId?: number | null;
  itemRevisionId?: number | null;
  lotId?: number | null;
  serialId?: number | null;
  affectedQuantity?: number | null;
  uomId?: number | null;
  defectCode: string;
  defectDescription: string;
  disposition: string;
  remarks?: string | null;
}

export interface NonConformanceUpsertRequest {
  companyId: number;
  branchId: number;
  ncrNo: string;
  sourceDocumentType: string;
  sourceDocumentId?: number | null;
  lotId?: number | null;
  serialId?: number | null;
  disposition: string;
  status: string;
  defectCategory?: string | null;
  containmentAction?: string | null;
  rootCause?: string | null;
  correctiveAction?: string | null;
  preventiveAction?: string | null;
  reworkOrderId?: number | null;
  remarks?: string | null;
  lines: NonConformanceLineRequest[];
}

export interface CoaCertificateLineDto {
  id: number;
  lineNo: number;
  parameterCode: string;
  expectedValue: string | null;
  actualValue: string | null;
  resultStatus: string;
  remarks: string | null;
}

export interface CoaCertificateDto {
  id: number;
  companyId: number;
  branchId: number;
  coaNo: string;
  inspectionRecordId: number;
  sourceDocumentType: string;
  sourceDocumentId: number | null;
  lotId: number | null;
  serialId: number | null;
  templateCode: string;
  versionNo: number;
  storagePath: string;
  status: string;
  generatedOn: string;
  generatedByUserId: number | null;
  issuedOn: string | null;
  issuedByUserId: number | null;
  reissueReason: string | null;
  lines: CoaCertificateLineDto[];
}

export interface CoaGenerateRequest {
  companyId: number;
  branchId: number;
  inspectionRecordId: number;
  coaNo: string;
  templateCode: string;
  issueImmediately: boolean;
  reissueReason?: string | null;
}

export interface CoaReissueRequest {
  reissueReason: string;
  templateCode?: string | null;
  issueImmediately?: boolean;
}

export interface PackListLineDto {
  id: number;
  lineNo: number;
  salesOrderLineId: number | null;
  itemId: number;
  itemVariantId: number | null;
  warehouseId: number;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  pcidId?: number | null;
  packedQuantity: number;
  packUomId: number;
  packageRef: string | null;
  status: string;
}

export interface PackListDto {
  id: number;
  companyId: number;
  branchId: number;
  packListNo: string;
  salesOrderId: number | null;
  plannedShipDate: string | null;
  status: string;
  remarks: string | null;
  lines: PackListLineDto[];
}

export interface PackListLineRequest {
  lineNo: number;
  salesOrderLineId?: number | null;
  itemId: number;
  itemVariantId?: number | null;
  warehouseId: number;
  binId?: number | null;
  lotId?: number | null;
  serialId?: number | null;
  pcidId?: number | null;
  packedQuantity: number;
  packUomId: number;
  packageRef?: string | null;
  status: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  lotNo?: string | null;
  serialNo?: string | null;
  pcidNo?: string | null;
}

export interface PackListUpsertRequest {
  companyId: number;
  branchId: number;
  packListNo: string;
  salesOrderId?: number | null;
  plannedShipDate?: string | null;
  status: string;
  remarks?: string | null;
  lines: PackListLineRequest[];
}

export interface ShipmentLineDto {
  id: number;
  lineNo: number;
  packListLineId: number | null;
  salesOrderLineId: number | null;
  itemId: number;
  itemVariantId: number | null;
  warehouseId: number;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  pcidId?: number | null;
  shippedQuantity: number;
  deliveredQuantity?: number;
  shortQuantity?: number;
  damagedQuantity?: number;
  shipUomId: number;
  status: string;
  salesOrderId?: number | null;
  sourceDocumentNo?: string | null;
  sourceDocumentLineId?: number | null;
  sourceDocumentRevisionNo?: number | null;
  sourceDocumentVersionNo?: number | null;
  itemRevisionId?: number | null;
  engineeringDocumentRevisionId?: number | null;
  bomRevisionId?: number | null;
  routingId?: number | null;
  unitPrice?: number;
  priceSourceType?: string | null;
  priceListLineId?: number | null;
  discountSchemeId?: number | null;
  discountRuleId?: number | null;
  discountPercent?: number;
  discountAmount?: number;
  taxCodeId?: number | null;
  taxRateSnapshot?: number;
  taxAmount?: number;
  lineSubtotal?: number;
  lineTaxableAmount?: number;
  lineTotalAmount?: number;
  lineInternalRemarks?: string | null;
  lineCustomerFacingRemarks?: string | null;
}

export interface ShipmentDto {
  id: number;
  companyId: number;
  branchId: number;
  shipmentNo: string;
  packListId: number | null;
  customerId: number;
  dispatchDate: string;
  vehicleRef: string | null;
  trackingRef: string | null;
  sealNo: string | null;
  proofNotes: string | null;
  transporterName?: string | null;
  driverName?: string | null;
  driverContact?: string | null;
  deliveryAddressSnapshot?: string | null;
  podReceivedBy?: string | null;
  podReceiverContact?: string | null;
  podReceivedOn?: string | null;
  podEvidenceAttachmentId?: number | null;
  podRemarks?: string | null;
  status: string;
  loadedOn: string | null;
  deliveredOn: string | null;
  lines: ShipmentLineDto[];
  stockTransactions: StockTransactionDto[];
}

export interface ShipmentLineRequest {
  lineNo: number;
  packListLineId?: number | null;
  salesOrderLineId?: number | null;
  itemId: number;
  itemVariantId?: number | null;
  warehouseId: number;
  binId?: number | null;
  lotId?: number | null;
  serialId?: number | null;
  pcidId?: number | null;
  shippedQuantity: number;
  shipUomId: number;
  status: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
  lotNo?: string | null;
  serialNo?: string | null;
  pcidNo?: string | null;
}

export interface ShipmentUpsertRequest {
  companyId: number;
  branchId: number;
  shipmentNo: string;
  packListId?: number | null;
  customerId: number;
  dispatchDate: string;
  vehicleRef?: string | null;
  trackingRef?: string | null;
  sealNo?: string | null;
  proofNotes?: string | null;
  transporterName?: string | null;
  driverName?: string | null;
  driverContact?: string | null;
  deliveryAddressSnapshot?: string | null;
  status: string;
  lines: ShipmentLineRequest[];
}

export interface ShipmentProofLineRequest {
  shipmentLineId: number;
  deliveredQuantity: number;
  shortQuantity: number;
  damagedQuantity: number;
}

export interface ShipmentProofRequest {
  vehicleRef: string | null;
  trackingRef: string | null;
  sealNo: string | null;
  proofNotes: string | null;
  status: string;
  podReceivedBy?: string | null;
  podReceiverContact?: string | null;
  podReceivedOn?: string | null;
  podEvidenceAttachmentId?: number | null;
  podRemarks?: string | null;
  lines?: ShipmentProofLineRequest[] | null;
  loadedOn?: string | null;
  deliveredOn?: string | null;
}

export interface DispatchPlanningItemDto {
  salesOrderId: number;
  salesOrderNo: string;
  customerId: number;
  customerName: string | null;
  promisedDate: string | null;
  orderedQuantity: number;
  packedQuantity: number;
  shippedQuantity: number;
  dispatchReadinessPercent: number;
  status: string;
  nextAction: string | null;
}

export interface PackListPrintDto {
  packList: PackListDto;
  salesOrderNo: string | null;
  customerName: string | null;
  shipments: ShipmentDto[];
}

export interface CurrencyDto {
  id: number;
  companyId: number;
  currencyCode: string;
  currencyName: string;
  symbol: string | null;
  decimalPrecision: number;
  roundingMode: string;
  isBaseCurrency: boolean;
  status: string;
}

export type CurrencyUpsertRequest = Omit<CurrencyDto, "id">;

export interface ExchangeRateSetupDto {
  id: number;
  companyId: number;
  currencyId: number;
  currencyCode: string;
  rateType: string;
  rateSource: string;
  manualRate: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
}

export type ExchangeRateSetupUpsertRequest = Omit<ExchangeRateSetupDto, "id" | "currencyCode">;

export interface TaxCodeDto {
  id: number;
  taxCategoryId: number;
  taxCode: string;
  taxCodeName: string;
  ratePercent: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
}

export type TaxCodeUpsertRequest = Omit<TaxCodeDto, "id" | "taxCategoryId">;

export interface TaxCategoryDto {
  id: number;
  companyId: number;
  taxCategoryCode: string;
  taxCategoryName: string;
  taxScope: string;
  defaultRatePercent: number;
  isRecoverable: boolean;
  status: string;
  taxCodes: TaxCodeDto[];
}

export type TaxCategoryUpsertRequest = Omit<TaxCategoryDto, "id" | "taxCodes"> & {
  taxCodes: TaxCodeUpsertRequest[];
};

export interface PaymentTermDto {
  id: number;
  companyId: number;
  paymentTermsCode: string;
  paymentTermsName: string;
  netDays: number;
  discountDays: number | null;
  discountPercent: number | null;
  dueCalculationMode: string;
  status: string;
}

export type PaymentTermUpsertRequest = Omit<PaymentTermDto, "id">;

export interface TradeTermDto {
  id: number;
  companyId: number;
  tradeTermsCode: string;
  tradeTermsName: string;
  tradeMode: string;
  responsibilitySummary: string | null;
  status: string;
}

export type TradeTermUpsertRequest = Omit<TradeTermDto, "id">;

export interface PriceListLineDto {
  id: number;
  priceListId: number;
  lineNo: number;
  itemId: number | null;
  itemCode: string | null;
  itemName: string | null;
  itemGroupId: number | null;
  itemGroupName: string | null;
  uomId: number;
  uomCode: string;
  minQuantity: number;
  unitPrice: number;
  discountEligible: boolean;
  taxCategoryId: number | null;
  taxCategoryCode: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
}

export type PriceListLineUpsertRequest = Omit<
  PriceListLineDto,
  "id" | "priceListId" | "itemCode" | "itemName" | "itemGroupName" | "uomCode" | "taxCategoryCode"
>;

export interface PriceAssignmentDto {
  id: number;
  priceListId: number;
  customerId: number | null;
  customerName: string | null;
  customerGroupCode: string | null;
  itemGroupId: number | null;
  itemGroupName: string | null;
  branchId: number | null;
  branchName: string | null;
  priorityRank: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
}

export type PriceAssignmentUpsertRequest = Omit<
  PriceAssignmentDto,
  "id" | "priceListId" | "customerName" | "itemGroupName" | "branchName"
>;

export interface PriceListDto {
  id: number;
  companyId: number;
  priceListCode: string;
  priceListName: string;
  currencyId: number;
  currencyCode: string;
  priceListType: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  customerSegment: string | null;
  approvalStatus: string;
  status: string;
  lines: PriceListLineDto[];
  assignments: PriceAssignmentDto[];
}

export type PriceListUpsertRequest = Omit<PriceListDto, "id" | "currencyCode" | "lines" | "assignments"> & {
  lines: PriceListLineUpsertRequest[];
  assignments: PriceAssignmentUpsertRequest[];
};

export interface DiscountRuleDto {
  id: number;
  discountSchemeId: number;
  ruleNo: number;
  ruleName: string;
  applicabilityType: string;
  customerId: number | null;
  customerName: string | null;
  customerGroupCode: string | null;
  itemId: number | null;
  itemCode: string | null;
  itemName: string | null;
  itemGroupId: number | null;
  itemGroupName: string | null;
  minQuantity: number;
  discountPercent: number | null;
  discountAmount: number | null;
  priceListId: number | null;
  priceListCode: string | null;
  status: string;
}

export type DiscountRuleUpsertRequest = Omit<
  DiscountRuleDto,
  | "id"
  | "discountSchemeId"
  | "customerName"
  | "itemCode"
  | "itemName"
  | "itemGroupName"
  | "priceListCode"
>;

export interface DiscountSchemeDto {
  id: number;
  companyId: number;
  schemeCode: string;
  schemeName: string;
  discountType: string;
  currencyId: number | null;
  currencyCode: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  requiresApproval: boolean;
  approvalStatus: string;
  status: string;
  rules: DiscountRuleDto[];
}

export type DiscountSchemeUpsertRequest = Omit<DiscountSchemeDto, "id" | "currencyCode" | "rules"> & {
  rules: DiscountRuleUpsertRequest[];
};
