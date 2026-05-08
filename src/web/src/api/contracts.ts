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
  tags: string[];
}

export interface ApprovalDecisionRequest {
  decision: "Approve" | "Reject" | "RequestChanges";
  remarks?: string;
}

export interface UserDirectoryItemDto {
  id: string;
  userName: string;
  displayName: string;
  email: string;
  roles: RoleCode[];
  branchAccess: string[];
  status: "Active" | "Pending Invite" | "Locked" | "Suspended";
  loginPolicy: string;
  lastLogin: string;
  deviceBinding: string;
}

export interface RolePermissionDto {
  module: string;
  access: "Read" | "Manage" | "Approve";
  dataScope: string;
}

export interface RoleMatrixItemDto {
  id: string;
  roleCode: RoleCode;
  label: string;
  audience: string;
  scopeMode: string;
  activeUsers: number;
  mobileSurface: string;
  status: "Standard" | "Custom";
  permissions: RolePermissionDto[];
}

export interface WorkflowNumberingItemDto {
  id: string;
  documentType: string;
  seriesPattern: string;
  workflowOwner: RoleCode;
  approvalChain: string;
  transitionCount: number;
  status: "Active" | "Draft";
  notes: string;
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

export interface UomClassDto {
  id: number;
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
  makeType: string;
  promisedDate: string | null;
  priorityCode: string;
  customerSpecRef: string | null;
  status: string;
}

export interface QuoteLineUpsertRequest {
  lineNo: number;
  itemId: number;
  itemVariantId: number | null;
  orderUomId: number;
  quantity: number;
  makeType: string;
  promisedDate: string | null;
  priorityCode: string;
  customerSpecRef: string | null;
  status: string;
  itemCode?: string | null;
  itemVariantCode?: string | null;
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
  lines: SalesOrderLineDto[];
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

export interface DemandForecastLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  forecastPeriodStart: string;
  forecastPeriodEnd: string;
  quantity: number;
  forecastUomId: number;
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

export interface MpsLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  periodStart: string;
  periodEnd: string;
  plannedQuantity: number;
  planningUomId: number;
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

export interface PurchaseOrderLineDto {
  id: number;
  lineNo: number;
  itemId: number;
  purchaseRequisitionLineId: number | null;
  orderedQuantity: number;
  orderUomId: number;
  expectedDate: string;
  linkedWorkOrderId: number | null;
  sourceBoqRequirementLineId: number | null;
  status: string;
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
  quantity: number;
  catchWeightQty: number | null;
  inventoryState: string;
  sourceDocumentType: string | null;
  sourceDocumentId: number | null;
  remarks: string | null;
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
  rootCause: string | null;
  reworkOrderId: number | null;
  remarks: string | null;
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
  shippedQuantity: number;
  shipUomId: number;
  status: string;
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
  status: string;
  loadedOn: string | null;
  deliveredOn: string | null;
  lines: ShipmentLineDto[];
  stockTransactions: StockTransactionDto[];
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
