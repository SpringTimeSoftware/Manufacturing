import type {
  AuthSessionResponse,
  DashboardFilter,
  ExecutiveCockpitSummary,
  NotificationItem,
  OrderRiskItem,
  RoleCode,
  StageWiseDashboardItem
} from "../api/contracts";
import { apiClient } from "../api/http";
import { liveDataUnavailable } from "../api/liveData";
import {
  homeColumns,
  homeKpis,
  homeTiles,
  orderDeliveryKpis,
  orderDeliveryRecords,
  stageWiseColumns,
  stageWiseKpis,
  type OrderDeliveryRecord
} from "../api/mockData";
import { getLinkedRecordActionState } from "../notifications/linkedRecordActions";
import type { KanbanColumn } from "../ui/boards";

export interface HomeActionTile {
  id: string;
  label: string;
  eyebrow: string;
  summary: string;
  path: string;
  roles?: RoleCode[];
}

export interface HomeAttentionItem {
  actionDisabledReason?: string;
  actionLabel?: string;
  id: string;
  title: string;
  owner: string;
  status: string;
  nextAction: string;
  path?: string;
  tone: "info" | "success" | "warn" | "danger" | "neutral";
}

export interface HomeDashboardData {
  kpis: Array<{ label: string; value: string; hint?: string }>;
  actionTiles: HomeActionTile[];
  attentionItems: HomeAttentionItem[];
  source: "Live" | "Seeded";
}

export interface OrderDeliveryDashboardData {
  kpis: Array<{ label: string; value: string; hint?: string }>;
  records: OrderDeliveryRecord[];
  source: "Live" | "Seeded";
}

export interface StageWiseDashboardData {
  columns: KanbanColumn[];
  kpis: Array<{ label: string; value: string; hint?: string }>;
  source: "Live" | "Seeded";
}

export interface ExecutiveCockpitView {
  summary: ExecutiveCockpitSummary;
  topRisks: OrderDeliveryRecord[];
  stageColumns: KanbanColumn[];
  interventionItems: HomeAttentionItem[];
  source: "Live" | "Seeded";
}

function isDemoSession(session: AuthSessionResponse | null | undefined) {
  return !session || session.accessToken.startsWith("demo-");
}

function normalizeStageLabel(stageCode: string) {
  const compact = stageCode.replace(/[_-]+/g, " ").trim();
  return compact.length > 0
    ? compact.replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Unknown";
}

function deriveRiskStatus(item: OrderRiskItem) {
  if (item.dispatchReadinessPercent >= 90 && item.completionPercent >= 80) {
    return "Ready to Dispatch";
  }

  const risk = item.riskStatus.trim().toLowerCase();
  return risk === "healthy" || risk === "on track" || risk === "ontrack" ? "On Track" : "At Risk";
}

function derivePriority(item: OrderRiskItem): "High" | "Medium" | "Low" {
  const risk = deriveRiskStatus(item);
  if (risk === "Ready to Dispatch") {
    return "Medium";
  }

  const pressure = item.shortageCount + item.supplierLateCount + item.qcPendingCount;
  if (risk === "At Risk" && pressure >= 2) {
    return "High";
  }

  return pressure > 0 ? "Medium" : "Low";
}

function buildRiskBlocker(item: OrderRiskItem) {
  if (item.primaryBlockerCode) {
    return item.primaryBlockerCode;
  }

  if (item.shortageCount > 0) {
    return `${item.shortageCount} shortage flags open`;
  }

  if (item.supplierLateCount > 0) {
    return `${item.supplierLateCount} supplier delays open`;
  }

  if (item.qcPendingCount > 0) {
    return `${item.qcPendingCount} QC reviews still pending`;
  }

  return `${item.pendingOperationCount} operations remain open`;
}

function buildRiskNextAction(item: OrderRiskItem) {
  if (item.shortageCount > 0) {
    return "Review shortage actions before release windows slip.";
  }

  if (item.supplierLateCount > 0) {
    return "Escalate supplier recovery and resequence the dependent order.";
  }

  if (item.qcPendingCount > 0) {
    return "Clear quality hold and restore dispatch readiness.";
  }

  return "Review the next open operation and confirm dispatch readiness.";
}

function mapOrderRiskToRecord(item: OrderRiskItem): OrderDeliveryRecord {
  return {
    id: `order-${item.salesOrderId}`,
    salesOrder: item.salesOrderNo,
    customer: item.customerName ?? "Unassigned customer",
    item: `Pending ops ${item.pendingOperationCount} | Dispatch ${Math.round(item.dispatchReadinessPercent)}%`,
    dueDate: item.promisedDate ?? "No promise date",
    dueHint: `${Math.round(item.dispatchReadinessPercent)}% dispatch ready`,
    priority: derivePriority(item),
    completion: Math.round(item.completionPercent),
    status: deriveRiskStatus(item),
    blocker: buildRiskBlocker(item),
    nextAction: buildRiskNextAction(item)
  };
}

function buildOrderDeliveryKpis(items: OrderRiskItem[]) {
  const overdue = items.filter((item) => item.promisedDate && new Date(item.promisedDate) < new Date()).length;
  const ready = items.filter((item) => deriveRiskStatus(item) === "Ready to Dispatch").length;
  const critical = items.filter((item) => derivePriority(item) === "High").length;
  const averageCompletion =
    items.length > 0
      ? `${Math.round(items.reduce((sum, item) => sum + item.completionPercent, 0) / items.length)}%`
      : "0%";

  return [
    { label: "Open Orders", value: String(items.length) },
    { label: "Overdue", value: String(overdue) },
    { label: "Ready to Dispatch", value: String(ready) },
    { label: "Average Completion", value: averageCompletion },
    { label: "Critical Risks", value: String(critical) }
  ];
}

function buildStageWiseColumns(items: StageWiseDashboardItem[]): KanbanColumn[] {
  const groups = new Map<string, StageWiseDashboardItem[]>();

  for (const item of items) {
    const key = item.stageCode;
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return Array.from(groups.entries()).map(([stageCode, stageItems]) => ({
    id: stageCode.toLowerCase(),
    label: normalizeStageLabel(stageCode),
    count: stageItems.length,
    tickets: stageItems.slice(0, 4).map((item) => ({
      id: `${item.salesOrderId}-${stageCode}`,
      title: item.salesOrderNo,
      meta: `${item.customerName ?? "Customer pending"} • ${item.ownerRole}`,
      progress: `${item.daysInStage} days`,
      badges: [
        { label: item.stageStatus, tone: item.stageStatus.toLowerCase().includes("ready") ? "success" : "info" },
        ...(item.blockerCode ? [{ label: item.blockerCode, tone: "warn" as const }] : [])
      ]
    }))
  }));
}

function buildStageWiseKpis(items: StageWiseDashboardItem[]) {
  const readyToDispatch = items.filter((item) => item.stageCode.toLowerCase().includes("dispatch")).length;
  const qcPending = items.filter((item) => item.stageCode.toLowerCase().includes("qc")).length;
  const overdue = items.filter((item) => item.daysInStage >= 5).length;
  const inProduction = items.filter((item) =>
    ["production", "wo", "job", "jobcard"].some((token) => item.stageCode.toLowerCase().includes(token))
  ).length;

  return [
    { label: "Open Orders", value: String(new Set(items.map((item) => item.salesOrderNo)).size) },
    { label: "Overdue Stages", value: String(overdue) },
    { label: "In Production", value: String(inProduction) },
    { label: "QC Pending", value: String(qcPending) },
    { label: "Ready to Dispatch", value: String(readyToDispatch) }
  ];
}

function buildHomeActions(roles: RoleCode[]): HomeActionTile[] {
  const seeded: HomeActionTile[] = [
    {
      id: "order-risk",
      label: "Review order risk",
      eyebrow: "Dashboards",
      summary: "Open the delivery dashboard and clear the highest-risk customer commitments first.",
      path: "/dashboards/order-delivery"
    },
    {
      id: "stage-board",
      label: "Open stage board",
      eyebrow: "Production",
      summary: "Check cross-functional blockers from confirmation through dispatch.",
      path: "/dashboards/stage-wise"
    },
    {
      id: "print-pack",
      label: "Prepare print pack",
      eyebrow: "Reports",
      summary: "Generate traveler, checklist, and label exports for the current release wave.",
      path: "/reports/print-pack"
    },
    {
      id: "approvals",
      label: "Clear approvals",
      eyebrow: "Platform",
      summary: "Review pending approval decisions without leaving the planner shell.",
      path: "/platform/approvals"
    },
    {
      id: "executive-cockpit",
      label: "Open executive cockpit",
      eyebrow: "Management",
      summary: "Use the one-screen management view for demand, quality, dispatch, and downtime.",
      path: "/dashboards/executive-cockpit",
      roles: ["ManagementViewer"]
    },
    {
      id: "user-access",
      label: "Review user access",
      eyebrow: "Platform",
      summary: "Inspect role scope, login policy, and branch access for platform administrators.",
      path: "/platform/users",
      roles: ["PlatformAdmin", "CompanyAdmin"]
    }
  ];

  return seeded.filter((tile) => !tile.roles || tile.roles.some((role) => roles.includes(role))).slice(0, 4);
}

function buildAttentionItems(records: OrderDeliveryRecord[], notifications: NotificationItem[]): HomeAttentionItem[] {
  const riskItems: HomeAttentionItem[] = records.slice(0, 2).map((record) => {
    const tone: HomeAttentionItem["tone"] =
      record.priority === "High" ? "danger" : record.priority === "Medium" ? "warn" : "info";

    return {
      id: record.id,
      title: `${record.salesOrder} • ${record.customer}`,
      owner: "Cross-functional review",
      status: record.status,
      nextAction: record.nextAction,
      path: `/dashboards/order-delivery?order=${encodeURIComponent(record.salesOrder)}`,
      tone
    };
  });

  const notificationItems = notifications.slice(0, 2).map((item) => {
    const linkedAction = getLinkedRecordActionState(item, item.actionLabel ?? "Open linked record");

    return {
      actionDisabledReason: linkedAction.hidden
        ? "This notification does not have a record workspace."
        : linkedAction.reason,
      actionLabel: linkedAction.hidden ? "Open workspace" : linkedAction.label,
      id: item.id,
      title: item.title,
      owner: item.module,
      status: item.statusLabel ?? (item.isRead ? "Read" : "Unread"),
      nextAction: item.auditActionLabel ?? item.actionLabel ?? item.body,
      path: linkedAction.disabled || linkedAction.hidden ? undefined : linkedAction.path,
      tone: item.severity
    };
  });

  return [...riskItems, ...notificationItems];
}

async function fetchOrderRiskItems(filter: DashboardFilter) {
  const items = await apiClient.dashboards.orderDelivery(filter);
  return {
    kpis: buildOrderDeliveryKpis(items),
    records: items.map(mapOrderRiskToRecord),
    source: "Live" as const
  };
}

async function fetchStageWiseItems(filter: DashboardFilter) {
  const items = await apiClient.dashboards.stageWise(filter);
  return {
    columns: buildStageWiseColumns(items),
    kpis: buildStageWiseKpis(items),
    source: "Live" as const
  };
}

export async function loadOrderDeliveryDashboard(
  session: AuthSessionResponse | null | undefined,
  filter: DashboardFilter
): Promise<OrderDeliveryDashboardData> {
  if (isDemoSession(session)) {
    return {
      kpis: orderDeliveryKpis,
      records: orderDeliveryRecords,
      source: "Seeded"
    };
  }

  try {
    return await fetchOrderRiskItems(filter);
  } catch {
    throw liveDataUnavailable("Order delivery dashboard");
  }
}

export async function loadStageWiseDashboard(
  session: AuthSessionResponse | null | undefined,
  filter: DashboardFilter
): Promise<StageWiseDashboardData> {
  if (isDemoSession(session)) {
    return {
      columns: stageWiseColumns,
      kpis: stageWiseKpis,
      source: "Seeded"
    };
  }

  try {
    return await fetchStageWiseItems(filter);
  } catch {
    throw liveDataUnavailable("Stage-wise dashboard");
  }
}

export async function loadExecutiveCockpit(
  session: AuthSessionResponse | null | undefined,
  filter: DashboardFilter,
  notifications: NotificationItem[]
): Promise<ExecutiveCockpitView> {
  if (isDemoSession(session)) {
    return {
      summary: {
        openOrders: 28,
        overdueOrders: 6,
        criticalShortages: 11,
        delayedSuppliers: 4,
        machineDowntimeMinutesToday: 92,
        dispatchReadyToday: 3,
        qcPending: 5
      },
      topRisks: orderDeliveryRecords.slice(0, 3),
      stageColumns: stageWiseColumns,
      interventionItems: buildAttentionItems(orderDeliveryRecords, notifications),
      source: "Seeded"
    };
  }

  try {
    const [summary, orderRisk, stageWise] = await Promise.all([
      apiClient.dashboards.executiveCockpit(filter),
      fetchOrderRiskItems(filter),
      fetchStageWiseItems(filter)
    ]);

    return {
      summary,
      topRisks: orderRisk.records.slice(0, 4),
      stageColumns: stageWise.columns,
      interventionItems: buildAttentionItems(orderRisk.records, notifications),
      source: "Live"
    };
  } catch {
    throw liveDataUnavailable("Executive cockpit");
  }
}

export function buildHomeDashboardData(
  roles: RoleCode[],
  orderData: OrderDeliveryDashboardData,
  stageData: StageWiseDashboardData,
  notifications: NotificationItem[]
): HomeDashboardData {
  const approvals = notifications.filter((item) => item.category === "Approval" && !item.isRead).length;
  const attention = buildAttentionItems(orderData.records, notifications);

  return {
    kpis: [
      { label: "Open Orders", value: orderData.kpis[0]?.value ?? homeKpis[0].value, hint: "Customer due view" },
      { label: "Risk Reviews", value: orderData.kpis[4]?.value ?? homeKpis[1].value, hint: "Orders needing intervention" },
      { label: "Stage Columns", value: String(stageData.columns.length), hint: "Cross-functional handoff stages" },
      { label: "Pending Approvals", value: String(approvals), hint: "Actionable inbox items" }
    ],
    actionTiles: buildHomeActions(roles),
    attentionItems: attention,
    source: orderData.source === "Live" || stageData.source === "Live" ? "Live" : "Seeded"
  };
}

export function buildFallbackHomeColumns() {
  return homeColumns;
}

export function buildFallbackHomeTiles() {
  return homeTiles;
}
