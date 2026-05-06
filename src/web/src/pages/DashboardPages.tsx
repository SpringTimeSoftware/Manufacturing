import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DashboardFilter } from "../api/contracts";
import { useApiQuery, queryKeys } from "../api/hooks";
import {
  orderDeliveryRecords,
  stageWiseColumns,
  type OrderDeliveryRecord
} from "../api/mockData";
import { useAuth } from "../auth/AuthContext";
import { demoScenarios } from "../demo/demoScenarios";
import {
  buildHomeDashboardData,
  loadExecutiveCockpit,
  loadOrderDeliveryDashboard,
  loadStageWiseDashboard
} from "../dashboards/dashboardAdapters";
import { useFeatureFlags } from "../featureFlags/FeatureFlagProvider";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { useNotifications } from "../notifications/NotificationProvider";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { Drawer } from "../ui/Drawer";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KanbanBoard, KpiStrip } from "../ui/boards";

function buildDashboardFilter(
  companyId?: number | null,
  branchId?: number | null,
  search?: string
): DashboardFilter {
  return {
    branchId: branchId ?? undefined,
    companyId: companyId ?? undefined,
    page: 1,
    pageSize: 25,
    search: search?.trim() ? search.trim() : undefined
  };
}

function matchesDueWindow(record: OrderDeliveryRecord, window: string) {
  if (window === "all" || record.dueDate === "No promise date") {
    return true;
  }

  const dueDate = new Date(record.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return window === "all";
  }

  const now = new Date();
  const daysAway = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (window === "overdue") {
    return daysAway < 0;
  }

  if (window === "next3") {
    return daysAway >= 0 && daysAway <= 3;
  }

  if (window === "next7") {
    return daysAway >= 4 && daysAway <= 7;
  }

  return true;
}

function SourceBadge({ source }: { source: "Live" | "Seeded" }) {
  return <Badge tone={source === "Live" ? "success" : "neutral"}>{source === "Live" ? "Live operations" : "Operational snapshot"}</Badge>;
}

const orderColumns: DataGridColumn<OrderDeliveryRecord>[] = [
  {
    key: "salesOrder",
    header: "Sales Order",
    width: "16%",
    render: (record) => (
      <div>
        <strong>{record.salesOrder}</strong>
        <div className="muted">{record.item}</div>
      </div>
    )
  },
  {
    key: "customer",
    header: "Customer / Item",
    render: (record) => (
      <div>
        <strong>{record.customer}</strong>
        <div className="muted">{record.item}</div>
      </div>
    )
  },
  {
    key: "dueDate",
    header: "Due",
    width: "16%",
    render: (record) => (
      <div>
        <strong>{record.dueDate}</strong>
        <div className="muted">{record.dueHint}</div>
      </div>
    )
  },
  {
    key: "priority",
    header: "Priority",
    width: "12%",
    render: (record) => (
      <Badge tone={record.priority === "High" ? "danger" : record.priority === "Medium" ? "warn" : "info"}>
        {record.priority}
      </Badge>
    )
  },
  {
    key: "completion",
    header: "Completion",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{`${record.completion}%`}</strong>
        <div className="muted">{record.blocker}</div>
      </div>
    )
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => (
      <Badge tone={record.status === "On Track" ? "success" : record.status === "Ready to Dispatch" ? "info" : "danger"}>
        {record.status}
      </Badge>
    )
  }
];

export function DashboardHomePage() {
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();
  const { session, user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const dashboardFilter = useMemo(
    () => buildDashboardFilter(user?.activeContext.companyId, user?.activeContext.branchId),
    [user?.activeContext.branchId, user?.activeContext.companyId]
  );

  const orderQuery = useApiQuery(
    queryKeys.dashboards.orderDelivery(user?.activeContext.companyId, user?.activeContext.branchId),
    () => loadOrderDeliveryDashboard(session, dashboardFilter),
    { staleTime: 60_000 }
  );
  const stageQuery = useApiQuery(
    queryKeys.dashboards.stageWise(user?.activeContext.companyId, user?.activeContext.branchId),
    () => loadStageWiseDashboard(session, dashboardFilter),
    { staleTime: 60_000 }
  );

  const homeData = useMemo(
    () =>
      buildHomeDashboardData(
        user?.roles ?? [],
        orderQuery.data ?? {
          kpis: [
            { label: "Open Orders", value: String(orderDeliveryRecords.length) },
            { label: "Critical Risks", value: "3" }
          ],
          records: orderDeliveryRecords,
          source: "Seeded"
        },
        stageQuery.data ?? {
          columns: stageWiseColumns,
          kpis: [],
          source: "Seeded"
        },
        notifications
      ),
    [notifications, orderQuery.data, stageQuery.data, user?.roles]
  );
  const riskRecords = useMemo(
    () =>
      (orderQuery.data?.records ?? orderDeliveryRecords)
        .filter((record) => record.priority === "High" || record.status !== "On Track")
        .slice(0, 5),
    [orderQuery.data?.records]
  );
  const stageColumns = useMemo(
    () => (stageQuery.data?.columns ?? stageWiseColumns).slice(0, 4),
    [stageQuery.data?.columns]
  );
  const bottleneckItems = homeData.attentionItems.slice(0, 4);
  const quickActions = homeData.actionTiles.slice(0, 6);

  return (
    <div className="page-shell dashboard-home">
      <KpiStrip items={homeData.kpis} />

      <div className="dashboard-home__layout">
        <div className="dashboard-home__main">
          <Card
            title="Delivery risk"
            description="Customer commitments that need planning, quality, material, or dispatch attention first."
            actions={<Badge tone={riskRecords.length > 0 ? "warn" : "success"}>{`${riskRecords.length} at risk`}</Badge>}
          >
            <DataGrid
              ariaLabel="Home delivery risk table"
              columns={orderColumns}
              emptyState={{
                title: "No delivery risks need attention",
                description: "Open orders are currently tracking without a high-priority blocker."
              }}
              getRowId={(record) => record.id}
              isLoading={orderQuery.isLoading}
              onRowSelect={(record) => navigate(`/dashboards/order-delivery?order=${record.salesOrder}`)}
              records={riskRecords}
              rowLabel={(record) => `${record.salesOrder} delivery risk`}
              virtualization={{ enabled: flags.enableDenseGridVirtualization }}
            />
          </Card>

          <Card
            title="Production progress"
            description="Stage pressure from order confirmation through production, quality, and dispatch."
          >
            <KanbanBoard columns={stageColumns} />
          </Card>
        </div>

        <aside className="dashboard-home__side">
          <Card
            title="Bottlenecks and approvals"
            description="Actionable blockers for the next planning, quality, or dispatch window."
            actions={<Badge tone={unreadCount > 0 ? "warn" : "success"}>{`${unreadCount} unread`}</Badge>}
          >
            {bottleneckItems.length > 0 ? (
              <div className="dashboard-home__stack">
                {bottleneckItems.map((item) => (
                  <div className="notification-item" key={item.id}>
                    <strong>{item.title}</strong>
                    <p>{item.nextAction}</p>
                    <div className="notification-item__meta">
                      <span>{item.owner}</span>
                      <Badge tone={item.tone}>{item.status}</Badge>
                    </div>
                    <Button variant="quiet" onClick={() => navigate(item.path)}>
                      Open workspace
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="No immediate blocker surfaced from the current workspace dashboard."
                title="Bottleneck queue is clear"
              />
            )}
          </Card>

          <Card title="Quick access" description="Role-aware shortcuts for the next operational move.">
            <div className="dashboard-home__quick-actions">
              {quickActions.map((tile) => (
                <Tile
                  eyebrow={tile.eyebrow}
                  key={tile.id}
                  label={tile.label}
                  meta={tile.summary}
                  onClick={() => navigate(tile.path)}
                >
                  {tile.summary}
                </Tile>
              ))}
            </div>
          </Card>

          {flags.enableNotificationCenter ? (
            <Card
              title="Operational inbox"
              description="Alerts, approvals, and reminders assigned to the current role."
            >
              <NotificationCenter compact />
            </Card>
          ) : null}
        </aside>
      </div>

      {flags.showSeededNavigation ? (
        <Card
          title="Workflow shortcuts"
          description="Common manufacturing review paths for planning, production, quality, and dispatch."
        >
          <div className="dashboard-home__workflow-grid">
            {demoScenarios.map((scenario) => (
              <Tile
                eyebrow="Manufacturing review"
                key={scenario.id}
                label={scenario.title}
                meta="Open workflow"
                onClick={() => navigate(scenario.route)}
              >
                {scenario.narrative}
              </Tile>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export function OrderDeliveryDashboardPage() {
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [dueWindow, setDueWindow] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const dashboardFilter = useMemo(
    () => buildDashboardFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch),
    [deferredSearch, user?.activeContext.branchId, user?.activeContext.companyId]
  );

  const orderQuery = useApiQuery(
    queryKeys.dashboards.orderDelivery(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch),
    () => loadOrderDeliveryDashboard(session, dashboardFilter),
    { staleTime: 60_000 }
  );

  const records = orderQuery.data?.records ?? orderDeliveryRecords;
  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch =
          `${record.salesOrder} ${record.customer} ${record.item} ${record.blocker}`
            .toLowerCase()
            .includes(deferredSearch.toLowerCase());
        const matchesPriority = priorityFilter === "all" || record.priority.toLowerCase() === priorityFilter;
        return matchesSearch && matchesPriority && matchesDueWindow(record, dueWindow);
      }),
    [deferredSearch, dueWindow, priorityFilter, records]
  );
  const selected = filtered.find((record) => record.id === selectedId) ?? null;

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={orderQuery.data?.source ?? "Seeded"} />
            <Button disabled={!flags.enablePrintAndExport} variant="secondary" onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="primary" onClick={() => navigate("/dashboards/executive-cockpit")}>
              Open executive cockpit
            </Button>
          </>
        }
        description="Due dates, priorities, and work completion for customer commitments."
        filters={
          <FilterBar>
            <input
              aria-label="Search sales orders"
              onChange={(event) => {
                startTransition(() => setSearch(event.target.value));
              }}
              placeholder="Search SO / customer / blocker"
              value={search}
            />
            <select onChange={(event) => setDueWindow(event.target.value)} value={dueWindow}>
              <option value="all">Due window: All</option>
              <option value="overdue">Overdue</option>
              <option value="next3">Due in 0-3 days</option>
              <option value="next7">Due in 4-7 days</option>
            </select>
            <select onChange={(event) => setPriorityFilter(event.target.value)} value={priorityFilter}>
              <option value="all">Priority: Any</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </FilterBar>
        }
        title="Order Delivery Dashboard"
      >
        <KpiStrip items={orderQuery.data?.kpis ?? [{ label: "Open Orders", value: String(filtered.length) }]} />
        <Card title="Order risk table" description="Sort and filter customer commitments before delays escape into dispatch.">
          <DataGrid
            ariaLabel="Order delivery risk table"
            columns={orderColumns}
            emptyState={{
              title: "No customer orders match the current filter",
              description: "Adjust the search or risk filters to restore the customer-order view.",
              hint: flags.showEmptyStateHints ? "The overdue and dispatch-ready orders return when filters are reset." : undefined
            }}
            getRowId={(record) => record.id}
            isLoading={orderQuery.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={filtered}
            rowLabel={(record) => `${record.salesOrder} for ${record.customer}`}
            virtualization={{ enabled: flags.enableDenseGridVirtualization }}
          />
        </Card>
      </ListPageShell>

      <Drawer
        description="Customer-order centric preview aligned to the dashboard pattern."
        footer={
          <div className="context-chip-row">
            <Button disabled title="Dashboard export is pending the approved reporting workflow." variant="secondary">
              Export
            </Button>
            <Button disabled title="Open a work order from the Work Orders screen after selecting a concrete order context." variant="primary">Open related work orders</Button>
          </div>
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.salesOrder ?? "Order detail"}
      >
        {selected ? (
          <Card title={selected.customer} description={selected.item}>
            <div className="utility-grid">
              <Tile label="Due status" meta={selected.dueHint}>
                {selected.dueDate}
              </Tile>
              <Tile label="Current blocker" meta={selected.nextAction}>
                {selected.blocker}
              </Tile>
              <Tile label="Completion" meta={selected.status}>
                {`${selected.completion}%`}
              </Tile>
            </div>
          </Card>
        ) : null}
      </Drawer>
    </>
  );
}

export function StageWiseDashboardPage() {
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const dashboardFilter = useMemo(
    () => buildDashboardFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch),
    [deferredSearch, user?.activeContext.branchId, user?.activeContext.companyId]
  );

  const stageQuery = useApiQuery(
    queryKeys.dashboards.stageWise(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch),
    () => loadStageWiseDashboard(session, dashboardFilter),
    { staleTime: 60_000 }
  );

  const columns = useMemo(() => {
    const sourceColumns = stageQuery.data?.columns ?? stageWiseColumns;
    if (!deferredSearch.trim()) {
      return sourceColumns;
    }

    return sourceColumns
      .map((column) => ({
        ...column,
        count: column.tickets.filter((ticket) =>
          `${ticket.title} ${ticket.meta} ${ticket.badges?.map((badge) => badge.label).join(" ")}`
            .toLowerCase()
            .includes(deferredSearch.toLowerCase())
        ).length,
        tickets: column.tickets.filter((ticket) =>
          `${ticket.title} ${ticket.meta} ${ticket.badges?.map((badge) => badge.label).join(" ")}`
            .toLowerCase()
            .includes(deferredSearch.toLowerCase())
        )
      }))
      .filter((column) => column.count > 0);
  }, [deferredSearch, stageQuery.data?.columns]);

  return (
    <div className="page-shell">
      <KpiStrip items={stageQuery.data?.kpis ?? []} />
      <Card
        actions={
          <>
            <SourceBadge source={stageQuery.data?.source ?? "Seeded"} />
            <Button disabled title="Dashboard data refresh follows the configured query refresh interval." variant="secondary">Refresh</Button>
            <Button disabled title="Stage dashboard export is pending the approved reporting workflow." variant="secondary">
              Export
            </Button>
            <Button variant="primary" onClick={() => navigate("/production/machine-board")}>
              Open machine board
            </Button>
          </>
        }
        description="Order, machine, and customer progression across deterministic business stages."
        title="Stage Wise Dashboard"
      >
        <FilterBar>
          <input
            onChange={(event) => {
              startTransition(() => setSearch(event.target.value));
            }}
            placeholder="Search stage, order, customer, or blocker"
            value={search}
          />
        </FilterBar>
        {columns.length > 0 ? (
          <KanbanBoard columns={columns} />
        ) : (
          <EmptyState
            description="No stage tickets match the current search."
            hint={flags.showEmptyStateHints ? "Reset the search field to restore the full stage board." : undefined}
            title="No stage tickets to show"
          />
        )}
      </Card>
    </div>
  );
}

export function ExecutiveCockpitPage() {
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();
  const { session, user } = useAuth();
  const { notifications } = useNotifications();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const dashboardFilter = useMemo(
    () => buildDashboardFilter(user?.activeContext.companyId, user?.activeContext.branchId),
    [user?.activeContext.branchId, user?.activeContext.companyId]
  );

  const executiveQuery = useApiQuery(
    queryKeys.dashboards.executiveCockpit(user?.activeContext.companyId, user?.activeContext.branchId),
    () => loadExecutiveCockpit(session, dashboardFilter, notifications),
    { staleTime: 60_000 }
  );

  const topRisks = useMemo(() => {
    const items = executiveQuery.data?.topRisks ?? orderDeliveryRecords.slice(0, 3);
    return items.filter((record) => {
      const matchesSearch =
        `${record.salesOrder} ${record.customer} ${record.blocker} ${record.nextAction}`
          .toLowerCase()
          .includes(deferredSearch.toLowerCase());
      const matchesRisk = riskFilter === "all" || record.status.toLowerCase().replace(/\s+/g, "-") === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [deferredSearch, executiveQuery.data?.topRisks, riskFilter]);

  const selected = topRisks.find((record) => record.id === selectedId) ?? null;
  const summary = executiveQuery.data?.summary ?? {
    openOrders: 28,
    overdueOrders: 6,
    criticalShortages: 11,
    delayedSuppliers: 4,
    machineDowntimeMinutesToday: 92,
    dispatchReadyToday: 3,
    qcPending: 5
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={executiveQuery.data?.source ?? "Seeded"} />
            <Button variant="secondary" onClick={() => navigate("/dashboards/order-delivery")}>
              Open delivery dashboard
            </Button>
            <Button disabled title="Executive briefing export is pending the approved reporting workflow." variant="secondary">
              Export briefing
            </Button>
          </>
        }
        description="Single-screen management truth across demand, shortages, quality, downtime, and dispatch readiness."
        filters={
          <FilterBar>
            <input
              onChange={(event) => {
                startTransition(() => setSearch(event.target.value));
              }}
              placeholder="Search order, customer, blocker, or action"
              value={search}
            />
            <select onChange={(event) => setRiskFilter(event.target.value)} value={riskFilter}>
              <option value="all">Risk: Any</option>
              <option value="at-risk">At risk</option>
              <option value="on-track">On track</option>
              <option value="ready-to-dispatch">Ready to dispatch</option>
            </select>
          </FilterBar>
        }
        title="Executive Cockpit"
      >
        <KpiStrip
          items={[
            { label: "Open Orders", value: String(summary.openOrders) },
            { label: "Overdue Orders", value: String(summary.overdueOrders) },
            { label: "Critical Shortages", value: String(summary.criticalShortages) },
            { label: "Supplier Delays", value: String(summary.delayedSuppliers) },
            { label: "QC Pending", value: String(summary.qcPending) },
            { label: "Dispatch Ready", value: String(summary.dispatchReadyToday), hint: "Today" }
          ]}
        />

        <div className="split-panels">
          <Card title="Priority interventions" description="Highest-risk orders surfaced for immediate owner escalation.">
            <DataGrid
              ariaLabel="Executive intervention table"
              columns={orderColumns}
              emptyState={{
                title: "No intervention items match the current filter",
                description: "Adjust the risk filter or search to restore the executive queue."
              }}
              getRowId={(record) => record.id}
              isLoading={executiveQuery.isLoading}
              onRowSelect={(record) => setSelectedId(record.id)}
              records={topRisks}
              rowLabel={(record) => `${record.salesOrder} executive intervention`}
              virtualization={{ enabled: flags.enableDenseGridVirtualization }}
            />
          </Card>

          <Card title="Stage pressure map" description="Cross-functional stage pressure summarized on the same management surface.">
            <KanbanBoard columns={executiveQuery.data?.stageColumns ?? stageWiseColumns} />
          </Card>
        </div>

        <Card title="Intervention queue" description="Manager-readable action labels tied to approval and inbox activity.">
          <div className="utility-grid">
            {(executiveQuery.data?.interventionItems ?? []).map((item) => (
              <Tile
                eyebrow={item.owner}
                key={item.id}
                label={item.title}
                meta={item.status}
                onClick={() => navigate(item.path)}
              >
                {item.nextAction}
              </Tile>
            ))}
          </div>
        </Card>
      </ListPageShell>

      <Drawer
        description="Open the intervention detail while preserving the same management dashboard context."
        footer={
          <div className="context-chip-row">
            <Button variant="secondary" onClick={() => navigate("/platform/approvals")}>
              Open approvals
            </Button>
            <Button variant="primary" onClick={() => navigate("/dashboards/order-delivery")}>
              Open order detail
            </Button>
          </div>
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.salesOrder ?? "Executive detail"}
      >
        {selected ? (
          <Card title={selected.customer} description={selected.item}>
            <div className="utility-grid">
              <Tile label="Risk status" meta={selected.blocker}>
                {selected.status}
              </Tile>
              <Tile label="Completion" meta={selected.nextAction}>
                {`${selected.completion}%`}
              </Tile>
              <Tile label="Promise" meta={selected.dueHint}>
                {selected.dueDate}
              </Tile>
            </div>
          </Card>
        ) : null}
      </Drawer>
    </>
  );
}
