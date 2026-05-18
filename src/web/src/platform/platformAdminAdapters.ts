import type {
  AuditTrailItemDto,
  AuthSessionResponse,
  PermissionCatalogItemDto,
  RoleUpsertRequest,
  TenantSettingUpdateRequest,
  TranslationResourceUpsertRequest,
  CustomObjectDto,
  CustomObjectRecordDto,
  CustomObjectRecordUpsertRequest,
  CustomObjectUpsertRequest,
  CustomScreenDto,
  CustomScreenUpsertRequest,
  UdfDefinitionDto,
  UdfDefinitionFilter,
  UdfDefinitionUpsertRequest,
  UdfPlacementDto,
  UdfPlacementUpsertRequest,
  UdfRuntimeFieldDto,
  UdfRuntimeValueSetRequest,
  UserAccessPolicyUpdateRequest,
  WorkflowRuleUpsertRequest
} from "../api/contracts";
import { apiClient } from "../api/http";
import { liveDataUnavailable } from "../api/liveData";
import { translationRecords } from "../api/mockData";
import type { FeatureFlags } from "../featureFlags/FeatureFlagProvider";

export interface UserDirectoryItem {
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

export interface RoleMatrixItem {
  id: string;
  roleCode: string;
  label: string;
  audience: string;
  scopeMode: string;
  activeUsers: number;
  mobileSurface: string;
  status: string;
  permissions: Array<{
    module: string;
    access: "Read" | "Manage" | "Approve";
    dataScope: string;
  }>;
}

export interface TranslationRegistryItem {
  id: string;
  module: string;
  key: string;
  enIn: string;
  hiIn: string;
  status: "Live Preview" | "Synced" | "Pending Review";
  source: "Live" | "Seeded";
}

export interface WorkflowNumberingItem {
  id: string;
  documentType: string;
  seriesPattern: string;
  workflowOwner: string;
  approvalChain: string;
  transitionCount: number;
  status: "Active" | "Draft";
  notes: string;
}

export interface TenantSettingItem {
  id: string;
  group: string;
  key: keyof FeatureFlags | "iisPublishMode" | "defaultLanguage" | "attachmentPolicy";
  label: string;
  value: string;
  status: "Applied" | "Pending";
  description: string;
}

export type AuditTrailItem = AuditTrailItemDto;
export type PermissionCatalogItem = PermissionCatalogItemDto;
export type UdfDefinitionItem = UdfDefinitionDto;
export type UdfPlacementItem = UdfPlacementDto;
export type CustomObjectItem = CustomObjectDto;
export type CustomObjectRecordItem = CustomObjectRecordDto;
export type CustomScreenItem = CustomScreenDto;

export interface AuditTrailQuery {
  search?: string;
  module?: string;
  actionCode?: string;
  page?: number;
  pageSize?: number;
}

const seededUsers: UserDirectoryItem[] = [
  {
    id: "user-super-admin",
    userName: "super.admin",
    displayName: "Super Admin",
    email: "super.admin@sts.local",
    roles: ["SuperAdmin"],
    branchAccess: ["PLANT-1", "PLANT-2"],
    status: "Active",
    loginPolicy: "MFA required",
    lastLogin: "Bootstrap identity",
    deviceBinding: "2 registered devices"
  },
  {
    id: "user-ritika",
    userName: "planning.manager",
    displayName: "Ritika Sharma",
    email: "ritika.sharma@sts-precision.local",
    roles: ["PlanningManager", "PlantHead"],
    branchAccess: ["PLANT-1", "WAREHOUSE-HUB"],
    status: "Active",
    loginPolicy: "MFA required",
    lastLogin: "2026-04-18 08:20",
    deviceBinding: "2 registered devices"
  },
  {
    id: "user-kavya",
    userName: "company.admin",
    displayName: "Kavya Menon",
    email: "kavya.menon@sts-precision.local",
    roles: ["CompanyAdmin"],
    branchAccess: ["PLANT-1"],
    status: "Active",
    loginPolicy: "Password + OTP",
    lastLogin: "2026-04-18 07:55",
    deviceBinding: "1 registered device"
  },
  {
    id: "user-ashok",
    userName: "plant.head",
    displayName: "Ashok Verma",
    email: "ashok.verma@sts-precision.local",
    roles: ["PlantHead", "ManagementViewer"],
    branchAccess: ["PLANT-1", "PLANT-2"],
    status: "Locked",
    loginPolicy: "Admin reset required",
    lastLogin: "2026-04-16 19:10",
    deviceBinding: "Recovery pending"
  },
  {
    id: "user-neha",
    userName: "dispatch.manager",
    displayName: "Neha Kulkarni",
    email: "neha.kulkarni@sts-precision.local",
    roles: ["DispatchManager"],
    branchAccess: ["WAREHOUSE-HUB"],
    status: "Pending Invite",
    loginPolicy: "Invite not accepted",
    lastLogin: "Not yet signed in",
    deviceBinding: "No device bound"
  }
];

const seededRoles: RoleMatrixItem[] = [
  {
    id: "role-super-admin",
    roleCode: "SuperAdmin",
    label: "Super Administrator",
    audience: "Tenant administration and controlled support",
    scopeMode: "Tenant wide",
    activeUsers: 1,
    mobileSurface: "None",
    status: "Standard",
    permissions: [
      { module: "Platform", access: "Manage", dataScope: "Tenant" },
      { module: "Localization", access: "Manage", dataScope: "Tenant" },
      { module: "Audit", access: "Read", dataScope: "Tenant" },
      { module: "Masters", access: "Manage", dataScope: "Company" },
      { module: "Commercial", access: "Manage", dataScope: "Company" },
      { module: "Planning", access: "Manage", dataScope: "Branch" },
      { module: "Production", access: "Approve", dataScope: "Branch" },
      { module: "Inventory", access: "Manage", dataScope: "Warehouse" },
      { module: "Quality", access: "Manage", dataScope: "Department" },
      { module: "Dispatch", access: "Manage", dataScope: "Warehouse" },
      { module: "Dashboards", access: "Read", dataScope: "Company" }
    ]
  },
  {
    id: "role-planning",
    roleCode: "PlanningManager",
    label: "Planning Manager",
    audience: "Planning and release supervisors",
    scopeMode: "Company + assigned branch",
    activeUsers: 5,
    mobileSurface: "Read-only approvals",
    status: "Standard",
    permissions: [
      { module: "Planning", access: "Manage", dataScope: "Branch" },
      { module: "Production", access: "Approve", dataScope: "Branch" },
      { module: "Dashboards", access: "Read", dataScope: "Company" }
    ]
  },
  {
    id: "role-company-admin",
    roleCode: "CompanyAdmin",
    label: "Company Administrator",
    audience: "Master data and branch configuration owners",
    scopeMode: "Company wide",
    activeUsers: 2,
    mobileSurface: "Approvals only",
    status: "Standard",
    permissions: [
      { module: "Platform", access: "Manage", dataScope: "Company" },
      { module: "Masters", access: "Manage", dataScope: "Company" },
      { module: "Commercial", access: "Manage", dataScope: "Company" }
    ]
  },
  {
    id: "role-platform-admin",
    roleCode: "PlatformAdmin",
    label: "Platform Administrator",
    audience: "Deployment-level support and template owners",
    scopeMode: "Tenant wide",
    activeUsers: 1,
    mobileSurface: "None",
    status: "Custom",
    permissions: [
      { module: "Platform", access: "Manage", dataScope: "Tenant" },
      { module: "Localization", access: "Manage", dataScope: "Tenant" },
      { module: "Audit", access: "Read", dataScope: "Tenant" }
    ]
  }
];

const seededWorkflowRules: WorkflowNumberingItem[] = [
  {
    id: "wf-sales-order",
    documentType: "Sales Order",
    seriesPattern: "SO-{YY}-{BR}",
    workflowOwner: "SalesCoordinator",
    approvalChain: "SalesCoordinator → PlanningManager",
    transitionCount: 5,
    status: "Active",
    notes: "Planner review is required before manufacturing demand is committed."
  },
  {
    id: "wf-work-order",
    documentType: "Work Order",
    seriesPattern: "WO-{YY}-{BR}",
    workflowOwner: "PlanningManager",
    approvalChain: "PlanningManager → PlantHead",
    transitionCount: 6,
    status: "Active",
    notes: "Release can proceed only after routing and reservation checks pass."
  },
  {
    id: "wf-dispatch",
    documentType: "Dispatch Release",
    seriesPattern: "DC-{YY}-{BR}",
    workflowOwner: "DispatchManager",
    approvalChain: "DispatchManager -> PlantHead",
    transitionCount: 4,
    status: "Draft",
    notes: "Pending branch-specific prefix finalization."
  }
];

const seededUdfDefinitions: UdfDefinitionItem[] = [
  {
    id: 1,
    companyId: 1,
    entityType: "Item",
    fieldKey: "customerDrawingNo",
    label: "Customer drawing number",
    dataType: "Text",
    controlType: "Text",
    lookupSource: null,
    isRequired: false,
    minNumber: null,
    maxNumber: null,
    maxLength: 64,
    decimalScale: null,
    roleVisibility: "CompanyAdmin,EngineeringManager,SalesCoordinator",
    status: "Active",
    createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    module: "Master",
    entitySubType: null,
    entityLevel: "Header",
    description: "Customer-supplied drawing number shown on item, quote, and quality outputs when configured.",
    isUnique: false,
    isReadOnly: false,
    defaultValue: null,
    placeholderText: "DRW-...",
    helpText: "Controlled text, not a document attachment.",
    displayOrder: 20,
    sectionName: "Customer-visible specs",
    effectiveFrom: null,
    effectiveTo: null,
    versionNo: 1,
    validationRulesJson: "{\"maxLength\":64}",
    optionSetCode: null,
    lookupSourceType: null,
    isReportable: true,
    allowIntegration: true,
    allowMobile: false,
    isSensitive: false,
    lifecycleGate: "DraftSave",
    valueLockPolicy: "LockOnRelease"
  },
  {
    id: 2,
    companyId: 1,
    entityType: "Customer",
    fieldKey: "preferredDispatchWindow",
    label: "Preferred dispatch window",
    dataType: "Lookup",
    controlType: "Select",
    lookupSource: "DispatchWindow",
    isRequired: false,
    minNumber: null,
    maxNumber: null,
    maxLength: 48,
    decimalScale: null,
    roleVisibility: "CompanyAdmin,SalesCoordinator,DispatchManager",
    status: "Active",
    createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    module: "Master",
    entitySubType: null,
    entityLevel: "Header",
    description: "Governed customer dispatch preference used by dispatch planning screens.",
    isUnique: false,
    isReadOnly: false,
    defaultValue: null,
    placeholderText: null,
    helpText: "Values must come from the configured dispatch window option source.",
    displayOrder: 30,
    sectionName: "Dispatch preferences",
    effectiveFrom: null,
    effectiveTo: null,
    versionNo: 1,
    validationRulesJson: "{\"allowedSource\":\"DispatchWindow\"}",
    optionSetCode: "DISPATCH_WINDOW",
    lookupSourceType: "OptionSet",
    isReportable: true,
    allowIntegration: true,
    allowMobile: true,
    isSensitive: false,
    lifecycleGate: "DraftSave",
    valueLockPolicy: "EditableUntilPosted"
  },
  {
    id: 3,
    companyId: 1,
    entityType: "Supplier",
    fieldKey: "complianceClass",
    label: "Compliance class",
    dataType: "SingleSelect",
    controlType: "Select",
    lookupSource: "SupplierComplianceClass",
    isRequired: false,
    minNumber: null,
    maxNumber: null,
    maxLength: 32,
    decimalScale: null,
    roleVisibility: "CompanyAdmin,PurchaseManager,QCInspector",
    status: "Active",
    createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    module: "Master",
    entitySubType: null,
    entityLevel: "Header",
    description: "Governed supplier compliance category used by procurement and quality reports.",
    isUnique: false,
    isReadOnly: false,
    defaultValue: null,
    placeholderText: null,
    helpText: "Select from the approved compliance class option set.",
    displayOrder: 35,
    sectionName: "Compliance",
    effectiveFrom: null,
    effectiveTo: null,
    versionNo: 1,
    validationRulesJson: "{\"optionSet\":\"SUPPLIER_COMPLIANCE_CLASS\"}",
    optionSetCode: "SUPPLIER_COMPLIANCE_CLASS",
    lookupSourceType: "OptionSet",
    isReportable: true,
    allowIntegration: false,
    allowMobile: false,
    isSensitive: false,
    lifecycleGate: "DraftSave",
    valueLockPolicy: "EditableUntilPosted"
  },
  {
    id: 4,
    companyId: 1,
    entityType: "Quote",
    fieldKey: "customerApprovalRef",
    label: "Customer approval reference",
    dataType: "Text",
    controlType: "Text",
    lookupSource: null,
    isRequired: false,
    minNumber: null,
    maxNumber: null,
    maxLength: 80,
    decimalScale: null,
    roleVisibility: "CompanyAdmin,SalesCoordinator",
    status: "Active",
    createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    module: "Commercial",
    entitySubType: null,
    entityLevel: "Header",
    description: "External approval reference locked with the released quote snapshot.",
    isUnique: false,
    isReadOnly: false,
    defaultValue: null,
    placeholderText: "APR-...",
    helpText: null,
    displayOrder: 40,
    sectionName: "Commercial evidence",
    effectiveFrom: null,
    effectiveTo: null,
    versionNo: 1,
    validationRulesJson: "{\"maxLength\":80}",
    optionSetCode: null,
    lookupSourceType: null,
    isReportable: true,
    allowIntegration: true,
    allowMobile: false,
    isSensitive: false,
    lifecycleGate: "Release",
    valueLockPolicy: "LockOnRelease"
  },
  {
    id: 5,
    companyId: 1,
    entityType: "Shipment",
    fieldKey: "temperatureBand",
    label: "Temperature band",
    dataType: "SingleSelect",
    controlType: "Select",
    lookupSource: "ShipmentTemperatureBand",
    isRequired: false,
    minNumber: null,
    maxNumber: null,
    maxLength: 32,
    decimalScale: null,
    roleVisibility: "CompanyAdmin,DispatchManager",
    status: "Active",
    createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    module: "Dispatch",
    entitySubType: null,
    entityLevel: "Header",
    description: "Shipment-specific temperature handling band for POD and dispatch reporting.",
    isUnique: false,
    isReadOnly: false,
    defaultValue: null,
    placeholderText: null,
    helpText: null,
    displayOrder: 45,
    sectionName: "Logistics handling",
    effectiveFrom: null,
    effectiveTo: null,
    versionNo: 1,
    validationRulesJson: "{\"optionSet\":\"SHIPMENT_TEMPERATURE_BAND\"}",
    optionSetCode: "SHIPMENT_TEMPERATURE_BAND",
    lookupSourceType: "OptionSet",
    isReportable: true,
    allowIntegration: true,
    allowMobile: true,
    isSensitive: false,
    lifecycleGate: "Ship",
    valueLockPolicy: "EditableUntilPosted"
  },
  {
    id: 6,
    companyId: 1,
    entityType: "SalesOrder",
    fieldKey: "customerProjectCode",
    label: "Customer project code",
    dataType: "Text",
    controlType: "Text",
    lookupSource: null,
    isRequired: false,
    minNumber: null,
    maxNumber: null,
    maxLength: 64,
    decimalScale: null,
    roleVisibility: "CompanyAdmin,SalesCoordinator",
    status: "Active",
    createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    module: "Commercial",
    entitySubType: null,
    entityLevel: "Header",
    description: "Customer project reference carried on direct sales orders and reports.",
    isUnique: false,
    isReadOnly: false,
    defaultValue: null,
    placeholderText: "PRJ-...",
    helpText: null,
    displayOrder: 42,
    sectionName: "Commercial evidence",
    effectiveFrom: null,
    effectiveTo: null,
    versionNo: 1,
    validationRulesJson: "{\"maxLength\":64}",
    optionSetCode: null,
    lookupSourceType: null,
    isReportable: true,
    allowIntegration: true,
    allowMobile: false,
    isSensitive: false,
    lifecycleGate: "Release",
    valueLockPolicy: "LockOnRelease"
  }
];

const seededUdfPlacements: UdfPlacementItem[] = [
  {
    id: 101,
    udfDefinitionId: 1,
    companyId: 1,
    module: "Master",
    screenKey: "masters.items",
    routePath: "/masters/items",
    entityType: "Item",
    entityLevel: "Header",
    sectionName: "Customer-visible specs",
    tabName: "Customer References",
    groupName: "Drawings",
    displayOrder: 20,
    columnSpan: 6,
    visibleConditionJson: null,
    editableConditionJson: null,
    requiredConditionJson: null,
    permissionKey: "udf.value.edit",
    status: "Active",
    fieldKey: "customerDrawingNo",
    label: "Customer drawing number",
    dataType: "Text",
    controlType: "Text",
    lookupSource: null,
    isRequired: false,
    isReadOnly: false,
    isSensitive: false,
    isReportable: true,
    allowIntegration: true,
    allowMobile: false
  },
  {
    id: 102,
    udfDefinitionId: 2,
    companyId: 1,
    module: "Master",
    screenKey: "partners.customers",
    routePath: "/partners/customers",
    entityType: "Customer",
    entityLevel: "Header",
    sectionName: "Dispatch preferences",
    tabName: "Commercial",
    groupName: "Delivery",
    displayOrder: 30,
    columnSpan: 6,
    visibleConditionJson: null,
    editableConditionJson: null,
    requiredConditionJson: null,
    permissionKey: "udf.value.edit",
    status: "Active",
    fieldKey: "preferredDispatchWindow",
    label: "Preferred dispatch window",
    dataType: "Lookup",
    controlType: "Select",
    lookupSource: "DispatchWindow",
    isRequired: false,
    isReadOnly: false,
    isSensitive: false,
    isReportable: true,
    allowIntegration: true,
    allowMobile: true
  },
  {
    id: 103,
    udfDefinitionId: 3,
    companyId: 1,
    module: "Master",
    screenKey: "partners.suppliers",
    routePath: "/partners/suppliers",
    entityType: "Supplier",
    entityLevel: "Header",
    sectionName: "Compliance",
    tabName: "Commercial",
    groupName: "Quality",
    displayOrder: 35,
    columnSpan: 6,
    visibleConditionJson: null,
    editableConditionJson: null,
    requiredConditionJson: null,
    permissionKey: "udf.value.edit",
    status: "Active",
    fieldKey: "complianceClass",
    label: "Compliance class",
    dataType: "SingleSelect",
    controlType: "Select",
    lookupSource: "SupplierComplianceClass",
    isRequired: false,
    isReadOnly: false,
    isSensitive: false,
    isReportable: true,
    allowIntegration: false,
    allowMobile: false
  },
  {
    id: 104,
    udfDefinitionId: 4,
    companyId: 1,
    module: "Commercial",
    screenKey: "commercial.quotes",
    routePath: "/sales/quotes",
    entityType: "Quote",
    entityLevel: "Header",
    sectionName: "Commercial evidence",
    tabName: "Header",
    groupName: "Approval",
    displayOrder: 40,
    columnSpan: 6,
    visibleConditionJson: null,
    editableConditionJson: null,
    requiredConditionJson: null,
    permissionKey: "udf.value.edit",
    status: "Active",
    fieldKey: "customerApprovalRef",
    label: "Customer approval reference",
    dataType: "Text",
    controlType: "Text",
    lookupSource: null,
    isRequired: false,
    isReadOnly: false,
    isSensitive: false,
    isReportable: true,
    allowIntegration: true,
    allowMobile: false
  },
  {
    id: 105,
    udfDefinitionId: 5,
    companyId: 1,
    module: "Dispatch",
    screenKey: "dispatch.shipments",
    routePath: "/dispatch/shipments",
    entityType: "Shipment",
    entityLevel: "Header",
    sectionName: "Logistics handling",
    tabName: "POD",
    groupName: "Handling",
    displayOrder: 45,
    columnSpan: 6,
    visibleConditionJson: null,
    editableConditionJson: null,
    requiredConditionJson: null,
    permissionKey: "udf.value.edit",
    status: "Active",
    fieldKey: "temperatureBand",
    label: "Temperature band",
    dataType: "SingleSelect",
    controlType: "Select",
    lookupSource: "ShipmentTemperatureBand",
    isRequired: false,
    isReadOnly: false,
    isSensitive: false,
    isReportable: true,
    allowIntegration: true,
    allowMobile: true
  },
  {
    id: 106,
    udfDefinitionId: 6,
    companyId: 1,
    module: "Commercial",
    screenKey: "commercial.sales-orders",
    routePath: "/sales/orders",
    entityType: "SalesOrder",
    entityLevel: "Header",
    sectionName: "Commercial evidence",
    tabName: "Header",
    groupName: "Customer references",
    displayOrder: 42,
    columnSpan: 6,
    visibleConditionJson: null,
    editableConditionJson: null,
    requiredConditionJson: null,
    permissionKey: "udf.value.edit",
    status: "Active",
    fieldKey: "customerProjectCode",
    label: "Customer project code",
    dataType: "Text",
    controlType: "Text",
    lookupSource: null,
    isRequired: false,
    isReadOnly: false,
    isSensitive: false,
    isReportable: true,
    allowIntegration: true,
    allowMobile: false
  }
];

const seededCustomObjects: CustomObjectItem[] = [
  {
    id: 201,
    companyId: 1,
    objectCode: "CUSTOMER_SCORECARD",
    objectName: "Customer scorecard",
    module: "Commercial",
    category: "Customer",
    primaryDisplayFieldCode: "scorecardName",
    description: "Metadata-driven customer scorecard records linked to customer master.",
    status: "Active",
    createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString()
  }
];

const seededCustomObjectRecords: CustomObjectRecordItem[] = [
  {
    id: 301,
    customObjectId: 201,
    companyId: 1,
    recordNo: "CS-0001",
    displayValue: "Strategic customer scorecard",
    linkedEntityType: "Customer",
    linkedEntityId: 501,
    status: "Active",
    createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString()
  }
];

const seededCustomScreens: CustomScreenItem[] = [
  {
    id: 401,
    companyId: 1,
    screenCode: "customer-scorecards",
    screenName: "Customer Scorecards",
    module: "Commercial",
    navigationGroup: "Customers",
    boundEntityType: "CustomObject",
    customObjectId: 201,
    routePath: "/custom/customer-scorecards",
    layoutJson: "{\"sections\":[{\"title\":\"Scorecard\",\"fields\":[\"scorecardName\",\"riskClass\"]}]}",
    listViewJson: "{\"columns\":[\"recordNo\",\"displayValue\",\"status\"]}",
    permissionKey: "custom.object.record.edit",
    status: "Active",
    createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
    modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString()
  }
];

const seededTenantSettingsBase: TenantSettingItem[] = [
  {
    id: "setting-iis",
    group: "Deployment",
    key: "iisPublishMode",
    label: "Approved publish mode",
    value: "Release package only",
    status: "Applied",
    description: "Production rollout uses the approved release package and hosted web assets."
  },
  {
    id: "setting-language",
    group: "Localization",
    key: "defaultLanguage",
    label: "Default web language",
    value: "en-IN",
    status: "Applied",
    description: "Base language used when user-specific localization resources are missing."
  },
  {
    id: "setting-attachments",
    group: "Attachments",
    key: "attachmentPolicy",
    label: "Attachment retention policy",
    value: "Audit-safe / company scoped",
    status: "Applied",
    description: "Keep linked files auditable while avoiding tenant cross-over."
  }
];

const seededAuditTrail: AuditTrailItem[] = [
  {
    id: 9001,
    companyId: 1,
    branchId: 11,
    createdOn: "2026-05-08T08:30:00Z",
    createdByUserId: 1000,
    module: "platform",
    entityType: "ApprovalWorkItem",
    actionCode: "platform.approval.decision",
    entityId: "approval-bom-r4",
    reasonCode: null,
    correlationId: "seed-audit-approval",
    clientType: "web",
    beforeSnapshot: null,
    afterSnapshot: "{\"status\":\"Approved\",\"referenceNo\":\"BOM-FG-OZ-50 / R4\"}"
  },
  {
    id: 9002,
    companyId: 1,
    branchId: 11,
    createdOn: "2026-05-08T08:35:00Z",
    createdByUserId: 1001,
    module: "platform",
    entityType: "Notification",
    actionCode: "platform.notification.read",
    entityId: "notif-wo-risk",
    reasonCode: null,
    correlationId: "seed-audit-notification",
    clientType: "web",
    beforeSnapshot: null,
    afterSnapshot: "{\"status\":\"Read\"}"
  },
  {
    id: 9003,
    companyId: 1,
    branchId: 11,
    createdOn: "2026-05-08T08:40:00Z",
    createdByUserId: 999,
    module: "integration",
    entityType: "IntegrationConnection",
    actionCode: "integration.connection.update",
    entityId: "3",
    reasonCode: null,
    correlationId: "seed-audit-integration",
    clientType: "web",
    beforeSnapshot: "{\"credentialReference\":\"vault...1234\"}",
    afterSnapshot: "{\"credentialReference\":\"vault...5678\"}"
  }
];

function isDemoSession(session: AuthSessionResponse | null | undefined) {
  return !session || session.accessToken.startsWith("demo-");
}

export async function listUserDirectory(_session: AuthSessionResponse | null | undefined) {
  if (!isDemoSession(_session)) {
    try {
      return await apiClient.platform.users();
    } catch {
      throw liveDataUnavailable("User directory");
    }
  }

  return seededUsers;
}

export async function listRoleMatrix(_session: AuthSessionResponse | null | undefined) {
  if (!isDemoSession(_session)) {
    try {
      return await apiClient.platform.roles();
    } catch {
      throw liveDataUnavailable("Role matrix");
    }
  }

  return seededRoles;
}

export async function listPermissionCatalog(session: AuthSessionResponse | null | undefined) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.permissions();
    } catch {
      throw liveDataUnavailable("Permission catalog");
    }
  }

  return seededRoles.flatMap((role) =>
    role.permissions.map((permission, index) => ({
      id: `${role.id}-permission-${index}`,
      permissionCode: `${permission.module}.${permission.access}.${permission.dataScope}`.replace(/\s+/g, ""),
      module: permission.module,
      access: permission.access,
      dataScope: permission.dataScope,
      status: "Active"
    }))
  );
}

export async function saveUserAccessPolicy(
  session: AuthSessionResponse | null | undefined,
  id: string,
  request: UserAccessPolicyUpdateRequest
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.updateUserAccessPolicy(id, request);
    } catch {
      throw liveDataUnavailable("User access policy save");
    }
  }

  return {
    id,
    userName: request.displayName.toLowerCase().replace(/\s+/g, "."),
    displayName: request.displayName,
    email: request.email ?? "",
    roles: request.roles.map((role) => role.roleCode),
    branchAccess: request.roles.map((role) => role.branchId?.toString() ?? role.companyId?.toString() ?? "Tenant"),
    status: request.status as UserDirectoryItem["status"],
    loginPolicy: request.loginPolicy,
    lastLogin: "Demo review",
    deviceBinding: request.deviceBinding
  };
}

export async function requestUserAccessReset(session: AuthSessionResponse | null | undefined, id: string) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.requestUserAccessReset(id);
    } catch {
      throw liveDataUnavailable("User access reset");
    }
  }

  return { id, status: "ResetRequested", referenceNo: id, warnings: [] };
}

export async function saveRole(
  session: AuthSessionResponse | null | undefined,
  id: string | null,
  request: RoleUpsertRequest
) {
  if (!isDemoSession(session)) {
    try {
      return id ? await apiClient.platform.updateRole(id, request) : await apiClient.platform.createRole(request);
    } catch {
      throw liveDataUnavailable("Role save");
    }
  }

  return {
    id: id ?? `role-${request.roleCode}`,
    roleCode: request.roleCode,
    label: request.label,
    audience: request.audience,
    scopeMode: request.scopeMode,
    activeUsers: 0,
    mobileSurface: "None",
    status: request.status,
    permissions: []
  };
}

export async function cloneRole(
  session: AuthSessionResponse | null | undefined,
  id: string,
  request: RoleUpsertRequest
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.cloneRole(id, request);
    } catch {
      throw liveDataUnavailable("Role clone");
    }
  }

  return saveRole(session, null, request);
}

export async function listWorkflowRules(_session: AuthSessionResponse | null | undefined) {
  if (!isDemoSession(_session)) {
    try {
      return await apiClient.platform.workflowRules();
    } catch {
      throw liveDataUnavailable("Workflow rules");
    }
  }

  return seededWorkflowRules;
}

export async function saveWorkflowRule(
  session: AuthSessionResponse | null | undefined,
  id: string | null,
  request: WorkflowRuleUpsertRequest
) {
  if (!isDemoSession(session)) {
    try {
      return id
        ? await apiClient.platform.updateWorkflowRule(id, request)
        : await apiClient.platform.createWorkflowRule(request);
    } catch {
      throw liveDataUnavailable("Workflow rule save");
    }
  }

  return {
    id: id ?? `wf-${request.workflowCode}`,
    documentType: request.documentType,
    seriesPattern: request.seriesPattern,
    workflowOwner: request.workflowOwner,
    approvalChain: request.approvalChain,
    transitionCount: 0,
    status: request.status as WorkflowNumberingItem["status"],
    notes: request.notes ?? ""
  };
}

export async function listTenantSettings(
  _session: AuthSessionResponse | null | undefined,
  flags: FeatureFlags
): Promise<TenantSettingItem[]> {
  if (!isDemoSession(_session)) {
    try {
      const liveSettings = await apiClient.platform.tenantSettings();
      return liveSettings.map((setting) => ({
        ...setting,
        key: setting.key as TenantSettingItem["key"]
      }));
    } catch {
      throw liveDataUnavailable("Tenant settings");
    }
  }

  return [
    ...seededTenantSettingsBase,
    {
      id: "setting-flag-notifications",
      group: "Feature Flags",
      key: "enableNotificationCenter",
      label: "Notification center",
      value: flags.enableNotificationCenter ? "Enabled" : "Disabled",
      status: "Applied",
      description: "Controls whether the shared inbox is visible to workspace users."
    },
    {
      id: "setting-flag-export",
      group: "Feature Flags",
      key: "enablePrintAndExport",
      label: "Print and export",
      value: flags.enablePrintAndExport ? "Enabled" : "Disabled",
      status: "Applied",
      description: "Keeps print-pack and export actions available in planner-owned screens."
    },
    {
      id: "setting-flag-demo",
      group: "Feature Flags",
      key: "showSeededNavigation",
      label: "Guided workflows",
      value: flags.showSeededNavigation ? "Enabled" : "Disabled",
      status: "Applied",
      description: "Shows curated workflow shortcuts for common manufacturing reviews."
    }
  ];
}

export async function saveTenantSetting(
  session: AuthSessionResponse | null | undefined,
  id: string,
  request: TenantSettingUpdateRequest
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.updateTenantSetting(id, request);
    } catch {
      throw liveDataUnavailable("Tenant setting save");
    }
  }

  return {
    id,
    group: "Demo",
    key: "showSeededNavigation" as TenantSettingItem["key"],
    label: id,
    value: request.value,
    status: request.status as TenantSettingItem["status"],
    description: request.description ?? ""
  };
}

export async function listAuditTrail(
  session: AuthSessionResponse | null | undefined,
  filter: AuditTrailQuery
): Promise<AuditTrailItem[]> {
  if (!isDemoSession(session)) {
    try {
      const page = await apiClient.platform.auditTrail({
        page: filter.page ?? 1,
        pageSize: filter.pageSize ?? 50,
        search: filter.search,
        module: filter.module === "all" ? undefined : filter.module,
        actionCode: filter.actionCode === "all" ? undefined : filter.actionCode
      });
      return page.items;
    } catch {
      throw liveDataUnavailable("Audit trail");
    }
  }

  const search = filter.search?.trim().toLowerCase() ?? "";
  return seededAuditTrail.filter((entry) => {
    const matchesSearch =
      search.length === 0 ||
      `${entry.module} ${entry.entityType} ${entry.actionCode} ${entry.entityId ?? ""} ${entry.correlationId}`
        .toLowerCase()
        .includes(search);
    const matchesModule = !filter.module || filter.module === "all" || entry.module === filter.module;
    const matchesAction = !filter.actionCode || filter.actionCode === "all" || entry.actionCode === filter.actionCode;

    return matchesSearch && matchesModule && matchesAction;
  });
}

export async function listTranslationRegistry(
  session: AuthSessionResponse | null | undefined,
  module: string,
  search: string
) {
  const matchesFilter = (value: string) => value.toLowerCase().includes(search.toLowerCase());
  const filterSeed = () =>
    translationRecords.filter((record) => {
      const matchesModule = module === "all" || record.module.toLowerCase() === module.toLowerCase();
      const matchesSearch =
        search.trim().length === 0 ||
        matchesFilter(record.key) ||
        matchesFilter(record.enIn) ||
        matchesFilter(record.hiIn);

      return matchesModule && matchesSearch;
    });

  if (isDemoSession(session)) {
    return filterSeed().map((record) => ({
      ...record,
      status: (record.status === "Synced" ? "Synced" : "Pending Review") as "Synced" | "Pending Review",
      source: "Seeded" as const
    }));
  }

  try {
    const normalizedModule = module === "all" ? undefined : module;
    const [enIn, hiIn] = await Promise.all([
      apiClient.localization.resources("en-IN", normalizedModule),
      apiClient.localization.resources("hi-IN", normalizedModule)
    ]);

    const keys = Array.from(new Set([...Object.keys(enIn.resources), ...Object.keys(hiIn.resources)]));

    return keys
      .filter((key) => {
        const moduleName = normalizedModule ?? key.split(".")[0] ?? "Platform";
        const matchesModule = module === "all" || moduleName.toLowerCase() === module.toLowerCase();
        const combinedText = [key, enIn.resources[key], hiIn.resources[key], moduleName].filter(Boolean).join(" ");
        const matchesSearch = search.trim().length === 0 || combinedText.toLowerCase().includes(search.toLowerCase());
        return matchesModule && matchesSearch;
      })
      .map((key, index) => {
        return {
          id: `translation-live-${index}`,
          module: normalizedModule ? normalizedModule[0].toUpperCase() + normalizedModule.slice(1) : key.split(".")[0] ?? "Platform",
          key,
          enIn: enIn.resources[key] ?? "",
          hiIn: hiIn.resources[key] ?? "",
          status: "Live Preview" as const,
          source: "Live" as const
        };
      });
  } catch {
    throw liveDataUnavailable("Translation registry");
  }
}

export async function saveTranslationResource(
  session: AuthSessionResponse | null | undefined,
  request: TranslationResourceUpsertRequest
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.localization.upsertResource(request);
    } catch {
      throw liveDataUnavailable("Translation resource save");
    }
  }

  return {
    id: request.translationKey,
    status: "Saved",
    referenceNo: request.translationKey,
    warnings: []
  };
}

export async function listUdfDefinitions(
  session: AuthSessionResponse | null | undefined,
  filter: UdfDefinitionFilter
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.udfDefinitions(filter);
    } catch {
      throw liveDataUnavailable("Extensibility field definitions");
    }
  }

  const search = filter.search?.trim().toLowerCase() ?? "";
  return seededUdfDefinitions.filter((definition) => {
    const matchesEntity =
      !filter.entityType || filter.entityType === "all" || definition.entityType === filter.entityType;
    const matchesStatus = !filter.status || filter.status === "all" || definition.status === filter.status;
    const matchesSearch =
      search.length === 0 ||
      `${definition.entityType} ${definition.fieldKey} ${definition.label} ${definition.roleVisibility}`
        .toLowerCase()
        .includes(search);

    return matchesEntity && matchesStatus && matchesSearch;
  });
}

export async function saveUdfDefinition(
  session: AuthSessionResponse | null | undefined,
  id: number | null,
  request: UdfDefinitionUpsertRequest
) {
  if (!isDemoSession(session)) {
    try {
      return id
        ? await apiClient.platform.updateUdfDefinition(id, request)
        : await apiClient.platform.createUdfDefinition(request);
    } catch {
      throw liveDataUnavailable("Extensibility field definition save");
    }
  }

  return {
    id: id ?? Date.now(),
    ...request,
    module: request.module ?? "Platform",
    entityLevel: request.entityLevel ?? "Header",
    isUnique: request.isUnique ?? false,
    isReadOnly: request.isReadOnly ?? false,
    displayOrder: request.displayOrder ?? 100,
    versionNo: 1,
    isReportable: request.isReportable ?? false,
    allowIntegration: request.allowIntegration ?? false,
    allowMobile: request.allowMobile ?? false,
    isSensitive: request.isSensitive ?? false,
    lifecycleGate: request.lifecycleGate ?? "DraftSave",
    valueLockPolicy: request.valueLockPolicy ?? "LockOnRelease",
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString()
  };
}

export async function listUdfPlacements(
  session: AuthSessionResponse | null | undefined,
  filter: { screenKey?: string; entityType?: string; entityLevel?: string } = {}
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.udfPlacements(filter);
    } catch {
      throw liveDataUnavailable("Extensibility field placements");
    }
  }

  return seededUdfPlacements.filter((placement) => {
    const matchesScreen = !filter.screenKey || placement.screenKey === filter.screenKey;
    const matchesEntity = !filter.entityType || placement.entityType === filter.entityType;
    const matchesLevel = !filter.entityLevel || placement.entityLevel === filter.entityLevel;
    return matchesScreen && matchesEntity && matchesLevel;
  });
}

export async function saveUdfPlacement(
  session: AuthSessionResponse | null | undefined,
  id: number | null,
  request: UdfPlacementUpsertRequest
) {
  if (!isDemoSession(session)) {
    try {
      return id
        ? await apiClient.platform.updateUdfPlacement(id, request)
        : await apiClient.platform.createUdfPlacement(request);
    } catch {
      throw liveDataUnavailable("Extensibility field placement save");
    }
  }

  const definition = seededUdfDefinitions.find((item) => item.id === request.udfDefinitionId);
  return {
    id: id ?? Date.now(),
    ...request,
    fieldKey: definition?.fieldKey ?? "customField",
    label: definition?.label ?? "Custom field",
    dataType: definition?.dataType ?? "Text",
    controlType: definition?.controlType ?? "Text",
    lookupSource: definition?.lookupSource ?? null,
    isRequired: definition?.isRequired ?? false,
    isReadOnly: definition?.isReadOnly ?? false,
    isSensitive: definition?.isSensitive ?? false,
    isReportable: definition?.isReportable ?? false,
    allowIntegration: definition?.allowIntegration ?? false,
    allowMobile: definition?.allowMobile ?? false
  };
}

export async function listUdfRuntimeFields(
  session: AuthSessionResponse | null | undefined,
  screenKey: string,
  entityType: string,
  entityLevel: string,
  entityId: number,
  entityLineId?: number | null
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.udfRuntimeFields(screenKey, entityType, entityLevel, entityId, entityLineId);
    } catch {
      throw liveDataUnavailable("Runtime extension fields");
    }
  }

  const placements = await listUdfPlacements(session, { screenKey, entityType, entityLevel });
  return placements.map<UdfRuntimeFieldDto>((placement) => ({
    placement,
    value: {
      id: placement.id + 1000,
      definitionId: placement.udfDefinitionId,
      companyId: placement.companyId ?? 1,
      entityType,
      entityId,
      entityLineId: entityLineId ?? null,
      fieldKey: placement.fieldKey,
      label: placement.label,
      dataType: placement.dataType,
      valueText: placement.dataType === "Text" ? "Configured value" : null,
      valueNumber: null,
      valueDate: null,
      valueBoolean: null,
      valueOptionCode: placement.dataType === "Lookup" ? "MORNING" : null,
      displayValue: placement.dataType === "Lookup" ? "Morning dispatch window" : "Configured value",
      status: "Active",
      createdOn: new Date("2026-05-01T00:00:00Z").toISOString(),
      modifiedOn: new Date("2026-05-01T00:00:00Z").toISOString()
    }
  }));
}

export async function saveUdfRuntimeValues(
  session: AuthSessionResponse | null | undefined,
  entityType: string,
  entityId: number,
  request: UdfRuntimeValueSetRequest
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.upsertUdfRuntimeValues(entityType, entityId, request);
    } catch {
      throw liveDataUnavailable("Runtime extension field save");
    }
  }

  return request.values.map((value, index) => ({
    id: Date.now() + index,
    ...value,
    companyId: value.companyId ?? 1,
    entityType,
    entityId,
    displayValue:
      value.displayValue ??
      value.valueText ??
      value.valueLongText ??
      value.valueOptionCode ??
      (value.valueNumber ?? value.valueDecimal ?? value.valueMoneyAmount ?? value.valueInteger ?? value.valueBoolean ?? value.valueDate ?? value.valueDateTime ?? "").toString(),
    status: value.status ?? "Active",
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString()
  }));
}

export async function listCustomObjects(
  session: AuthSessionResponse | null | undefined,
  filter: { module?: string; status?: string } = {}
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.customObjects(filter);
    } catch {
      throw liveDataUnavailable("Custom object definitions");
    }
  }

  return seededCustomObjects.filter((item) => {
    const matchesModule = !filter.module || filter.module === "all" || item.module === filter.module;
    const matchesStatus = !filter.status || filter.status === "all" || item.status === filter.status;
    return matchesModule && matchesStatus;
  });
}

export async function saveCustomObject(
  session: AuthSessionResponse | null | undefined,
  id: number | null,
  request: CustomObjectUpsertRequest
) {
  if (!isDemoSession(session)) {
    try {
      return id
        ? await apiClient.platform.updateCustomObject(id, request)
        : await apiClient.platform.createCustomObject(request);
    } catch {
      throw liveDataUnavailable("Custom object save");
    }
  }

  return {
    id: id ?? Date.now(),
    ...request,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString()
  };
}

export async function listCustomObjectRecords(
  session: AuthSessionResponse | null | undefined,
  customObjectId: number
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.customObjectRecords(customObjectId);
    } catch {
      throw liveDataUnavailable("Custom object records");
    }
  }

  return seededCustomObjectRecords.filter((record) => record.customObjectId === customObjectId);
}

export async function saveCustomObjectRecord(
  session: AuthSessionResponse | null | undefined,
  id: number | null,
  request: CustomObjectRecordUpsertRequest
) {
  if (!isDemoSession(session)) {
    try {
      return id
        ? await apiClient.platform.updateCustomObjectRecord(id, request)
        : await apiClient.platform.createCustomObjectRecord(request);
    } catch {
      throw liveDataUnavailable("Custom object record save");
    }
  }

  return {
    id: id ?? Date.now(),
    customObjectId: request.customObjectId,
    companyId: request.companyId ?? 1,
    recordNo: request.recordNo,
    displayValue: request.displayValue ?? request.recordNo,
    linkedEntityType: request.linkedEntityType ?? null,
    linkedEntityId: request.linkedEntityId ?? null,
    status: request.status,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString()
  };
}

export async function listCustomScreens(
  session: AuthSessionResponse | null | undefined,
  filter: { module?: string; status?: string } = {}
) {
  if (!isDemoSession(session)) {
    try {
      return await apiClient.platform.customScreens(filter);
    } catch {
      throw liveDataUnavailable("Custom screen definitions");
    }
  }

  return seededCustomScreens.filter((item) => {
    const matchesModule = !filter.module || filter.module === "all" || item.module === filter.module;
    const matchesStatus = !filter.status || filter.status === "all" || item.status === filter.status;
    return matchesModule && matchesStatus;
  });
}

export async function saveCustomScreen(
  session: AuthSessionResponse | null | undefined,
  id: number | null,
  request: CustomScreenUpsertRequest
) {
  if (!isDemoSession(session)) {
    try {
      return id
        ? await apiClient.platform.updateCustomScreen(id, request)
        : await apiClient.platform.createCustomScreen(request);
    } catch {
      throw liveDataUnavailable("Custom screen save");
    }
  }

  return {
    id: id ?? Date.now(),
    ...request,
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString()
  };
}
