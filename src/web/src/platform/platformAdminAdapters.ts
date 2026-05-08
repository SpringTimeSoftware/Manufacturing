import type { AuditTrailItemDto, AuthSessionResponse, RoleCode } from "../api/contracts";
import { apiClient } from "../api/http";
import { translationRecords } from "../api/mockData";
import type { FeatureFlags } from "../featureFlags/FeatureFlagProvider";

export interface UserDirectoryItem {
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

export interface RoleMatrixItem {
  id: string;
  roleCode: RoleCode;
  label: string;
  audience: string;
  scopeMode: string;
  activeUsers: number;
  mobileSurface: string;
  status: "Standard" | "Custom";
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
  workflowOwner: RoleCode;
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
      // Preserve seeded administration records when the SQL runtime pack is not deployed yet.
    }
  }

  return seededUsers;
}

export async function listRoleMatrix(_session: AuthSessionResponse | null | undefined) {
  if (!isDemoSession(_session)) {
    try {
      return await apiClient.platform.roles();
    } catch {
      // Preserve seeded role matrix when the SQL runtime pack is not deployed yet.
    }
  }

  return seededRoles;
}

export async function listWorkflowRules(_session: AuthSessionResponse | null | undefined) {
  if (!isDemoSession(_session)) {
    try {
      return await apiClient.platform.workflowRules();
    } catch {
      // Preserve seeded workflow rules when the SQL runtime pack is not deployed yet.
    }
  }

  return seededWorkflowRules;
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
      // Preserve seeded tenant settings when the SQL runtime pack is not deployed yet.
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
      // Keep the audit viewer available when the runtime audit table is not deployed yet.
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

    const keys = Array.from(
      new Set([...Object.keys(enIn.resources), ...Object.keys(hiIn.resources), ...translationRecords.map((record) => record.key)])
    );

    return keys
      .filter((key) => {
        const record = translationRecords.find((entry) => entry.key === key);
        const moduleName = record?.module ?? normalizedModule ?? "Platform";
        const matchesModule = module === "all" || moduleName.toLowerCase() === module.toLowerCase();
        const combinedText = [key, enIn.resources[key], hiIn.resources[key], moduleName].filter(Boolean).join(" ");
        const matchesSearch = search.trim().length === 0 || combinedText.toLowerCase().includes(search.toLowerCase());
        return matchesModule && matchesSearch;
      })
      .map((key, index) => {
        const record = translationRecords.find((entry) => entry.key === key);
        return {
          id: record?.id ?? `translation-live-${index}`,
          module: record?.module ?? (normalizedModule ? normalizedModule[0].toUpperCase() + normalizedModule.slice(1) : "Platform"),
          key,
          enIn: enIn.resources[key] ?? record?.enIn ?? "",
          hiIn: hiIn.resources[key] ?? record?.hiIn ?? "",
          status: "Live Preview" as const,
          source: "Live" as const
        };
      });
  } catch {
    return filterSeed().map((record) => ({
      ...record,
      status: (record.status === "Synced" ? "Synced" : "Pending Review") as "Synced" | "Pending Review",
      source: "Seeded" as const
    }));
  }
}
