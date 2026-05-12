import type { AuthSessionResponse, RoleCode } from "../api/contracts";
import { ApiError, apiClient } from "../api/http";

export type Ws01ProbeStatus = "PASS" | "PARTIAL" | "FAIL" | "NOT-IN-SCOPE";
export type Ws01ProbeArea = "Runtime" | "Role Access" | "API Probe" | "UAT Baseline" | "Deployment";

export interface Ws01ProbeRecord {
  action: string;
  area: Ws01ProbeArea;
  check: string;
  evidence: string;
  id: string;
  role: RoleCode | "All roles";
  route?: string;
  status: Ws01ProbeStatus;
  target: string;
}

interface ProbeDefinition {
  action: string;
  area: Ws01ProbeArea;
  check: string;
  id: string;
  role: RoleCode | "All roles";
  route?: string;
  target: string;
  run: (session: AuthSessionResponse) => Promise<string>;
}

export const ws01RoleContracts: Array<{
  role: RoleCode;
  userName: string;
  route: string;
  status: Ws01ProbeStatus;
  evidence: string;
}> = [
  { role: "SalesCoordinator", userName: "sales.coordinator", route: "/sales/orders", status: "PARTIAL", evidence: "Bootstrap login identity exists; sales order read probes are in runtime scope." },
  { role: "PlanningManager", userName: "planning.manager", route: "/planning/mrp", status: "PARTIAL", evidence: "Bootstrap login identity exists; planning and engineering read probes are in runtime scope." },
  { role: "PurchaseManager", userName: "purchase.manager", route: "/procurement/purchase-orders", status: "PARTIAL", evidence: "Bootstrap login identity exists; procurement read probes are in runtime scope." },
  { role: "StoreKeeper", userName: "stores.keeper", route: "/inventory/balances", status: "PARTIAL", evidence: "Bootstrap login identity exists; inventory and traceability read probes are in runtime scope." },
  { role: "ProductionSupervisor", userName: "prod.supervisor", route: "/production/job-cards", status: "PARTIAL", evidence: "Bootstrap login identity exists; production execution read probes are in runtime scope." },
  { role: "MachineOperator", userName: "machine.operator", route: "/production/job-cards", status: "PARTIAL", evidence: "Bootstrap login identity exists; web runtime probes are limited to read-access checks." },
  { role: "QCInspector", userName: "qc.inspector", route: "/quality/in-process-inspections", status: "PARTIAL", evidence: "Bootstrap login identity exists; quality and traceability read probes are in runtime scope." },
  { role: "DispatchManager", userName: "dispatch.manager", route: "/dispatch/pack-lists", status: "PARTIAL", evidence: "Bootstrap login identity exists; dispatch and print proof read probes are in runtime scope." },
  { role: "PlantHead", userName: "plant.head", route: "/dashboards/stage-wise", status: "PARTIAL", evidence: "Bootstrap login identity exists; dashboard read probes are in runtime scope." },
  { role: "PlatformAdmin", userName: "platform.admin", route: "/platform/users", status: "PARTIAL", evidence: "Bootstrap login identity exists; platform administration read probes are in runtime scope." }
];

function getScope(session: AuthSessionResponse) {
  const companyId = session.user.activeContext.companyId ?? undefined;
  const branchId = session.user.activeContext.branchId ?? undefined;

  return { branchId, companyId };
}

function summarizeCount(label: string, count: number) {
  return `${label}: ${count} row${count === 1 ? "" : "s"} returned.`;
}

function getErrorEvidence(error: unknown) {
  if (error instanceof ApiError) {
    return `HTTP ${error.status}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Runtime check could not be completed.";
}

function isAllowed(session: AuthSessionResponse, roles: RoleCode[]) {
  return roles.some((role) => session.user.roles.includes(role));
}

const runtimeProbeDefinitions: ProbeDefinition[] = [
  {
    action: "Keep live health monitored before UAT execution.",
    area: "Runtime",
    check: "Live health endpoint",
    id: "runtime-live-health",
    role: "All roles",
    target: "/api/health/live",
    run: async () => {
      const response = await apiClient.system.healthLive();
      return `Health status: ${response.status}.`;
    }
  },
  {
    action: "Keep SQL Server and attachment storage ready before UAT execution.",
    area: "Runtime",
    check: "Ready health endpoint",
    id: "runtime-ready-health",
    role: "All roles",
    target: "/api/health/ready",
    run: async () => {
      const response = await apiClient.system.healthReady();
      const entryCount = Object.keys(response.entries ?? {}).length;
      return `Readiness status: ${response.status}; checks: ${entryCount}.`;
    }
  },
  {
    action: "Use the current authenticated company and branch context.",
    area: "Runtime",
    check: "Authenticated context",
    id: "runtime-auth-context",
    role: "All roles",
    target: "/api/system/context",
    run: async () => {
      const response = await apiClient.system.context();
      return `Context resolved for ${response.userName ?? "current user"} in company ${response.companyId ?? "none"} / branch ${response.branchId ?? "none"}.`;
    }
  },
  {
    action: "Show unavailable state instead of baseline operational rows if live data fails.",
    area: "Runtime",
    check: "Notification queue data truth",
    id: "runtime-notification-truth",
    role: "All roles",
    route: "/platform/notifications",
    target: "/api/notifications",
    run: async () => {
      const rows = await apiClient.notifications.list();
      return summarizeCount("Notifications", rows.length);
    }
  },
  {
    action: "Show unavailable state instead of baseline approval rows if live data fails.",
    area: "Runtime",
    check: "Approval queue data truth",
    id: "runtime-approval-truth",
    role: "All roles",
    route: "/platform/approvals",
    target: "/api/approvals",
    run: async () => {
      const rows = await apiClient.approvals.list();
      return summarizeCount("Approvals", rows.length);
    }
  },
  {
    action: "Use role-aware dashboard access for UAT smoke.",
    area: "API Probe",
    check: "Order delivery dashboard",
    id: "api-order-delivery",
    role: "SalesCoordinator",
    route: "/dashboards/order-delivery",
    target: "/api/dashboards/order-delivery",
    run: async (session) => {
      const { branchId, companyId } = getScope(session);
      const rows = await apiClient.dashboards.orderDelivery({ branchId, companyId });
      return summarizeCount("Order delivery risks", rows.length);
    }
  },
  {
    action: "Verify planning read path before MRP and BOQ UAT.",
    area: "API Probe",
    check: "MRP run console",
    id: "api-mrp",
    role: "PlanningManager",
    route: "/planning/mrp",
    target: "/api/mrp",
    run: async (session) => {
      const { branchId, companyId } = getScope(session);
      const rows = await apiClient.planning.mrpRuns({ branchId, companyId, pageSize: 10 });
      return summarizeCount("MRP runs", rows.totalCount);
    }
  },
  {
    action: "Verify procurement read path before purchase UAT.",
    area: "API Probe",
    check: "Purchase order read path",
    id: "api-purchase-orders",
    role: "PurchaseManager",
    route: "/procurement/purchase-orders",
    target: "/api/purchase-orders",
    run: async (session) => {
      const { branchId, companyId } = getScope(session);
      const rows = await apiClient.procurement.purchaseOrders({ branchId, companyId, pageSize: 10 });
      return summarizeCount("Purchase orders", rows.totalCount);
    }
  },
  {
    action: "Verify inventory balance read path before stock UAT.",
    area: "API Probe",
    check: "Inventory balances",
    id: "api-inventory-balances",
    role: "StoreKeeper",
    route: "/inventory/balances",
    target: "/api/inventory",
    run: async (session) => {
      const { branchId, companyId } = getScope(session);
      const rows = await apiClient.inventory.balances({ branchId, companyId, pageSize: 10 });
      return summarizeCount("Inventory balances", rows.totalCount);
    }
  },
  {
    action: "Verify production execution read path before shop-floor UAT.",
    area: "API Probe",
    check: "Job card read path",
    id: "api-job-cards",
    role: "ProductionSupervisor",
    route: "/production/job-cards",
    target: "/api/job-cards",
    run: async (session) => {
      const { branchId, companyId } = getScope(session);
      const rows = await apiClient.production.jobCards({ branchId, companyId, pageSize: 10 });
      return summarizeCount("Job cards", rows.totalCount);
    }
  },
  {
    action: "Verify quality read path before inspection UAT.",
    area: "API Probe",
    check: "Inspection read path",
    id: "api-quality-inspections",
    role: "QCInspector",
    route: "/quality/in-process-inspections",
    target: "/api/quality/inspections",
    run: async (session) => {
      const { branchId, companyId } = getScope(session);
      const rows = await apiClient.quality.inspections({ branchId, companyId, pageSize: 10 });
      return summarizeCount("Inspections", rows.totalCount);
    }
  },
  {
    action: "Verify dispatch read path before shipment UAT.",
    area: "API Probe",
    check: "Pack-list read path",
    id: "api-pack-lists",
    role: "DispatchManager",
    route: "/dispatch/pack-lists",
    target: "/api/dispatch/pack-lists",
    run: async (session) => {
      const { branchId, companyId } = getScope(session);
      const rows = await apiClient.dispatch.packLists({ branchId, companyId, pageSize: 10 });
      return summarizeCount("Pack lists", rows.totalCount);
    }
  },
  {
    action: "Verify plant-level dashboards before management UAT.",
    area: "API Probe",
    check: "Stage-wise dashboard",
    id: "api-stage-wise",
    role: "PlantHead",
    route: "/dashboards/stage-wise",
    target: "/api/dashboards/stage-wise",
    run: async (session) => {
      const { branchId, companyId } = getScope(session);
      const rows = await apiClient.dashboards.stageWise({ branchId, companyId });
      return summarizeCount("Stage rows", rows.length);
    }
  },
  {
    action: "Verify platform admin reads before access-policy UAT.",
    area: "API Probe",
    check: "User directory read path",
    id: "api-users",
    role: "PlatformAdmin",
    route: "/platform/users",
    target: "/api/users",
    run: async () => {
      const rows = await apiClient.platform.users();
      return summarizeCount("Users", rows.length);
    }
  },
  {
    action: "Verify the UAT trace lot is available for inventory and quality proof.",
    area: "UAT Baseline",
    check: "Lot traceability proof",
    id: "uat-lot-traceability",
    role: "StoreKeeper",
    route: "/inventory/traceability?lot=DEMO-LOT-001",
    target: "/api/traceability/lots/DEMO-LOT-001",
    run: async (session) => {
      const { branchId, companyId } = getScope(session);
      const trace = await apiClient.inventory.lotTraceability("DEMO-LOT-001", { branchId, companyId });
      return `Lot ${trace.lotNo} resolved with ${trace.transactions.length} movement${trace.transactions.length === 1 ? "" : "s"}.`;
    }
  },
  {
    action: "Verify pack-list print proof for dispatch smoke.",
    area: "UAT Baseline",
    check: "Pack-list print proof",
    id: "uat-pack-print",
    role: "DispatchManager",
    route: "/reports/print-pack",
    target: "/api/reports/pack-lists/95001/print",
    run: async () => {
      const printPack = await apiClient.dispatch.packListPrint(95001);
      const lineCount = printPack.packList.lines.length;
      return `Print pack ${printPack.packList.packListNo} resolved with ${lineCount} line${lineCount === 1 ? "" : "s"}.`;
    }
  }
];

export function buildWs01RoleSeedRecords(): Ws01ProbeRecord[] {
  return ws01RoleContracts.map((contract) => ({
    action: "Use this identity for role-wise UAT login checks.",
    area: "Role Access",
    check: `${contract.role} login identity`,
    evidence: `${contract.userName}: ${contract.evidence}`,
    id: `role-${contract.role}`,
    role: contract.role,
    route: contract.route,
    status: contract.status,
    target: contract.route
  }));
}

export async function runWs01RuntimeProbe(session: AuthSessionResponse | null): Promise<Ws01ProbeRecord[]> {
  const roleRows = buildWs01RoleSeedRecords();

  if (!session) {
    return [
      {
        action: "Sign in with an approved UAT role before running runtime checks.",
        area: "Runtime",
        check: "Authenticated runtime session",
        evidence: "No authenticated session was available.",
        id: "runtime-no-session",
        role: "All roles",
        status: "FAIL",
        target: "/login"
      },
      ...roleRows
    ];
  }

  const visibleRuntimeProbes = runtimeProbeDefinitions.filter((probe) => {
    if (probe.role === "All roles") {
      return true;
    }

    if (probe.role === "PlatformAdmin") {
      return isAllowed(session, ["SuperAdmin", "PlatformAdmin", "CompanyAdmin"]);
    }

    return isAllowed(session, [probe.role, "SuperAdmin", "PlatformAdmin", "CompanyAdmin", "PlantHead"]);
  });

  const probeRows = await Promise.all(
    visibleRuntimeProbes.map(async (probe): Promise<Ws01ProbeRecord> => {
      try {
        const evidence = await probe.run(session);

        return {
          action: probe.action,
          area: probe.area,
          check: probe.check,
          evidence,
          id: probe.id,
          role: probe.role,
          route: probe.route,
          status: "PASS",
          target: probe.target
        };
      } catch (error) {
        return {
          action: "Investigate the endpoint or data prerequisite before using this flow for UAT.",
          area: probe.area,
          check: probe.check,
          evidence: getErrorEvidence(error),
          id: probe.id,
          role: probe.role,
          route: probe.route,
          status: "FAIL",
          target: probe.target
        };
      }
    })
  );

  const deploymentRows: Ws01ProbeRecord[] = [
    {
      action: "Apply SQL scripts in the documented order before live UAT.",
      area: "Deployment",
      check: "Database apply order",
      evidence: "database/README.md lists ordered DDL, procedure, and UAT baseline data scripts through seed/005_uat_runtime_seed.sql.",
      id: "deployment-db-order",
      role: "All roles",
      status: "PASS",
      target: "database/README.md"
    },
    {
      action: "Publish the ASP.NET Core host folder; do not deploy raw web source.",
      area: "Deployment",
      check: "IIS publish path",
      evidence: "deploy/iis/README.md and deploy/iis/LOCALHOST_PUBLISH_AND_RUN.md define the publish-folder deployment path.",
      id: "deployment-iis-publish",
      role: "All roles",
      status: "PASS",
      target: "deploy/iis"
    }
  ];

  return [...probeRows, ...roleRows, ...deploymentRows];
}

export function summarizeWs01ProbeRows(rows: Ws01ProbeRecord[]) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1;
      summary[row.status] += 1;
      return summary;
    },
    {
      FAIL: 0,
      "NOT-IN-SCOPE": 0,
      PARTIAL: 0,
      PASS: 0,
      total: 0
    } as Record<Ws01ProbeStatus | "total", number>
  );
}
