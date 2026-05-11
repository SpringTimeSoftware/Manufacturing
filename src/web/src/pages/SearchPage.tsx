import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthSessionResponse, CurrentUserResponse, QueryFilter, RoleCode } from "../api/contracts";
import { ApiError, apiClient } from "../api/http";
import { useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import { navigationItems, type NavigationItem } from "../layout/navigation";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpModalWorkspace } from "../ui/ErpComponents";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

type GlobalSearchScope =
  | "all"
  | "screens"
  | "items"
  | "customers"
  | "suppliers"
  | "boms"
  | "orders"
  | "work-orders"
  | "job-cards"
  | "lots";

interface GlobalSearchResult {
  id: string;
  module: string;
  resultType: string;
  title: string;
  subtitle: string;
  status: string;
  route: string;
  sourceLabel: string;
}

interface GlobalSearchData {
  results: GlobalSearchResult[];
  source: "Live" | "Navigation";
  unavailableSources: string[];
}

interface SourceRequest {
  label: string;
  load: () => Promise<GlobalSearchResult[]>;
}

const searchScopes: Array<{ label: string; value: GlobalSearchScope }> = [
  { label: "All searchable areas", value: "all" },
  { label: "Screens", value: "screens" },
  { label: "Items", value: "items" },
  { label: "Customers", value: "customers" },
  { label: "Suppliers", value: "suppliers" },
  { label: "BOMs", value: "boms" },
  { label: "Sales orders", value: "orders" },
  { label: "Work orders", value: "work-orders" },
  { label: "Job cards", value: "job-cards" },
  { label: "Lots / serials", value: "lots" }
];

const columns: DataGridColumn<GlobalSearchResult>[] = [
  {
    key: "result",
    header: "Result",
    render: (record) => (
      <div>
        <strong>{record.title}</strong>
        <div className="muted">{record.subtitle}</div>
      </div>
    )
  },
  {
    key: "module",
    header: "Area",
    width: "18%",
    render: (record) => (
      <div>
        <Badge tone="info">{record.module}</Badge>
        <div className="muted">{record.resultType}</div>
      </div>
    )
  },
  {
    key: "status",
    header: "Status",
    width: "16%",
    render: (record) => <Badge tone={record.status.toLowerCase().includes("active") ? "success" : "neutral"}>{record.status}</Badge>
  },
  {
    key: "source",
    header: "Source",
    width: "18%",
    render: (record) => record.sourceLabel
  }
];

function canUseNavigationItem(item: NavigationItem, roles: RoleCode[]) {
  if (!item.roles || item.roles.length === 0 || roles.includes("SuperAdmin")) {
    return true;
  }

  return item.roles.some((role) => roles.includes(role));
}

function matchesScope(scope: GlobalSearchScope, ...accepted: GlobalSearchScope[]) {
  return scope === "all" || accepted.includes(scope);
}

function buildBaseFilter(user: CurrentUserResponse | null, search: string): QueryFilter {
  return {
    branchId: user?.activeContext.branchId ?? undefined,
    companyId: user?.activeContext.companyId ?? undefined,
    page: 1,
    pageSize: 5,
    search
  };
}

function routeWithSearch(route: string, search: string) {
  return `${route}?search=${encodeURIComponent(search)}`;
}

function mapScreenResults(search: string, scope: GlobalSearchScope, roles: RoleCode[]): GlobalSearchResult[] {
  if (!matchesScope(scope, "screens")) {
    return [];
  }

  const normalized = search.toLowerCase();

  return navigationItems
    .filter((item) => canUseNavigationItem(item, roles))
    .filter((item) => `${item.label} ${item.section} ${item.path}`.toLowerCase().includes(normalized))
    .slice(0, 8)
    .map((item) => ({
      id: `screen-${item.path}`,
      module: item.section,
      resultType: "Screen",
      route: item.path,
      sourceLabel: "Navigation catalog",
      status: "Available",
      subtitle: item.path,
      title: item.label
    }));
}

async function ignoreNotFound<T>(load: () => Promise<T>) {
  try {
    return await load();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

function buildLiveRequests(user: CurrentUserResponse | null, search: string, scope: GlobalSearchScope): SourceRequest[] {
  const filter = buildBaseFilter(user, search);
  const requests: SourceRequest[] = [];

  if (matchesScope(scope, "items")) {
    requests.push({
      label: "Items",
      load: async () => {
        const response = await apiClient.masters.items(filter);
        return response.items.map((item) => ({
          id: `item-${item.id}`,
          module: "Masters",
          resultType: "Item",
          route: routeWithSearch("/masters/items", item.itemCode),
          sourceLabel: "Item master",
          status: item.status,
          subtitle: `${item.itemType} / item ${item.id}`,
          title: `${item.itemCode} - ${item.itemName}`
        }));
      }
    });
  }

  if (matchesScope(scope, "customers")) {
    requests.push({
      label: "Customers",
      load: async () => {
        const response = await apiClient.partners.customers(filter);
        return response.items.map((customer) => ({
          id: `customer-${customer.id}`,
          module: "Masters",
          resultType: "Customer",
          route: routeWithSearch("/partners/customers", customer.customerCode),
          sourceLabel: "Customer master",
          status: customer.status,
          subtitle: `${customer.customerType} / customer ${customer.id}`,
          title: `${customer.customerCode} - ${customer.customerName}`
        }));
      }
    });
  }

  if (matchesScope(scope, "suppliers")) {
    requests.push({
      label: "Suppliers",
      load: async () => {
        const response = await apiClient.partners.suppliers(filter);
        return response.items.map((supplier) => ({
          id: `supplier-${supplier.id}`,
          module: "Masters",
          resultType: "Supplier",
          route: routeWithSearch("/partners/suppliers", supplier.supplierCode),
          sourceLabel: "Supplier master",
          status: supplier.status,
          subtitle: `${supplier.supplierType} / supplier ${supplier.id}`,
          title: `${supplier.supplierCode} - ${supplier.supplierName}`
        }));
      }
    });
  }

  if (matchesScope(scope, "boms")) {
    requests.push({
      label: "BOMs",
      load: async () => {
        const response = await apiClient.engineering.boms(filter);
        return response.items.map((bom) => ({
          id: `bom-${bom.id}`,
          module: "Engineering",
          resultType: "BOM",
          route: routeWithSearch("/engineering/boms", bom.bomCode),
          sourceLabel: "BOM library",
          status: bom.status,
          subtitle: `Item ${bom.itemId} / released revision ${bom.currentReleasedRevisionId ?? "not set"}`,
          title: `${bom.bomCode} - ${bom.bomName}`
        }));
      }
    });
  }

  if (matchesScope(scope, "orders")) {
    requests.push({
      label: "Sales orders",
      load: async () => {
        const response = await apiClient.salesPlanning.salesOrders(filter);
        return response.items.map((order) => ({
          id: `sales-order-${order.id}`,
          module: "Sales",
          resultType: "Sales order",
          route: routeWithSearch("/sales/orders", order.salesOrderNo),
          sourceLabel: "Sales orders",
          status: order.status,
          subtitle: `Customer ${order.customerId} / ${order.lines.length} lines`,
          title: order.salesOrderNo
        }));
      }
    });
  }

  if (matchesScope(scope, "work-orders")) {
    requests.push({
      label: "Work orders",
      load: async () => {
        const response = await apiClient.production.workOrders(filter);
        return response.items.map((workOrder) => ({
          id: `work-order-${workOrder.id}`,
          module: "Production",
          resultType: "Work order",
          route: routeWithSearch("/production/work-orders", workOrder.workOrderNo),
          sourceLabel: "Work orders",
          status: workOrder.status,
          subtitle: `Item ${workOrder.itemId} / planned ${workOrder.plannedQuantity}`,
          title: workOrder.workOrderNo
        }));
      }
    });
  }

  if (matchesScope(scope, "job-cards")) {
    requests.push({
      label: "Job cards",
      load: async () => {
        const response = await apiClient.production.jobCards(filter);
        return response.items.map((jobCard) => ({
          id: `job-card-${jobCard.id}`,
          module: "Production",
          resultType: "Job card",
          route: routeWithSearch("/production/job-cards", jobCard.jobCardNo),
          sourceLabel: "Job cards",
          status: jobCard.status,
          subtitle: `${jobCard.workOrderNo ?? `Work order ${jobCard.workOrderId}`} / planned ${jobCard.plannedQuantity}`,
          title: jobCard.jobCardNo
        }));
      }
    });
  }

  if (matchesScope(scope, "lots")) {
    requests.push({
      label: "Lots and serials",
      load: async () => {
        const [lot, serial] = await Promise.all([
          ignoreNotFound(() => apiClient.inventory.lotTraceability(search, filter)),
          ignoreNotFound(() => apiClient.inventory.serialTraceability(search, filter))
        ]);

        return [
          lot
            ? {
                id: `lot-${lot.id}`,
                module: "Inventory",
                resultType: "Lot",
                route: routeWithSearch("/inventory/traceability", lot.lotNo),
                sourceLabel: "Lot traceability",
                status: lot.lotStatus,
                subtitle: `Item ${lot.itemId} / balances ${lot.balances.length}`,
                title: lot.lotNo
              }
            : null,
          serial
            ? {
                id: `serial-${serial.id}`,
                module: "Inventory",
                resultType: "Serial",
                route: routeWithSearch("/inventory/traceability", serial.serialNo),
                sourceLabel: "Serial traceability",
                status: serial.serialStatus,
                subtitle: `Item ${serial.itemId} / warehouse ${serial.currentWarehouseId ?? "not assigned"}`,
                title: serial.serialNo
              }
            : null
        ].filter((result): result is GlobalSearchResult => Boolean(result));
      }
    });
  }

  return requests;
}

async function loadGlobalSearch(
  session: AuthSessionResponse | null,
  user: CurrentUserResponse | null,
  search: string,
  scope: GlobalSearchScope
): Promise<GlobalSearchData> {
  const trimmed = search.trim();
  const screenResults = mapScreenResults(trimmed, scope, user?.roles ?? []);

  if (!hasLiveSession(session)) {
    return {
      results: screenResults,
      source: "Navigation",
      unavailableSources: []
    };
  }

  const requests = buildLiveRequests(user, trimmed, scope);
  const loaded = await Promise.all(
    requests.map(async (request) => {
      try {
        return {
          label: request.label,
          results: await request.load(),
          unavailable: false
        };
      } catch {
        return {
          label: request.label,
          results: [] as GlobalSearchResult[],
          unavailable: true
        };
      }
    })
  );

  return {
    results: [...screenResults, ...loaded.flatMap((source) => source.results)],
    source: "Live",
    unavailableSources: loaded.filter((source) => source.unavailable).map((source) => source.label)
  };
}

export function GlobalSearchPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<GlobalSearchScope>("all");
  const [selected, setSelected] = useState<GlobalSearchResult | null>(null);
  const deferredSearch = useDeferredValue(search);
  const canSearch = deferredSearch.trim().length >= 2;
  const query = useApiQuery(
    ["platform", "global-search", user?.activeContext.companyId ?? 0, user?.activeContext.branchId ?? 0, deferredSearch, scope],
    () => loadGlobalSearch(session, user, deferredSearch, scope),
    {
      enabled: canSearch,
      staleTime: 30_000
    }
  );
  const records = query.data?.results ?? [];
  const unavailableSources = query.data?.unavailableSources ?? [];
  const source = query.data?.source ?? (hasLiveSession(session) ? "Live" : "Navigation");
  const activeModules = useMemo(() => new Set(records.map((record) => record.module)).size, [records]);

  return (
    <>
      <ListPageShell
        actions={
          <ErpActionBar
            primary={[
              {
                disabled: !canSearch || query.isFetching,
                label: query.isFetching ? "Searching" : "Search",
                onClick: () => {
                  void query.refetch();
                },
                reason: !canSearch ? "Enter at least two characters before searching." : "Search is already running."
              }
            ]}
            utility={[
              {
                label: "Clear",
                onClick: () => {
                  setSearch("");
                  setSelected(null);
                },
                variant: "quiet"
              }
            ]}
            testId="global-search-action-bar"
          />
        }
        aside={
          <Card title="Search coverage" description="Search uses the current role scope and only opens records the user can access.">
            <div className="utility-grid">
              <Tile label="Search source" meta="Current session">
                {source === "Live" ? "Live records" : "Navigation catalog"}
              </Tile>
              <Tile label="Result areas" meta="Visible modules">
                {String(activeModules)}
              </Tile>
              <Tile label="Unavailable sources" meta="Live search">
                {String(unavailableSources.length)}
              </Tile>
            </div>
            {unavailableSources.length > 0 ? (
              <div className="notification-item">
                <strong>Some record sources are unavailable</strong>
                <p>{unavailableSources.join(", ")}</p>
              </div>
            ) : null}
          </Card>
        }
        description="Search accessible screens and live manufacturing records from the current operating context."
        filters={
          <FilterBar>
            <input
              aria-label="Search manufacturing records"
              onChange={(event) => {
                startTransition(() => setSearch(event.target.value));
              }}
              placeholder="Search item, order, job card, lot, customer, supplier"
              value={search}
            />
            <select aria-label="Search area" onChange={(event) => setScope(event.target.value as GlobalSearchScope)} value={scope}>
              {searchScopes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterBar>
        }
        title="Global Search"
      >
        <KpiStrip
          items={[
            { label: "Results", value: String(records.length) },
            { label: "Areas", value: String(activeModules) },
            { label: "Unavailable", value: String(unavailableSources.length) }
          ]}
        />

        {!canSearch ? (
          <EmptyState
            description="Enter at least two characters to search screens and accessible business records."
            title="Search term required"
          />
        ) : query.isError ? (
          <EmptyState
            description="Live search could not be completed for the current operating context."
            hint={query.error instanceof Error ? query.error.message : undefined}
            title="Search unavailable"
          />
        ) : (
          <Card title="Search results" description="Open a result to continue in the source screen.">
            <DataGrid
              ariaLabel="Global search results"
              columns={columns}
              emptyState={{
                title: "No records match the current search",
                description: "Adjust the search term or area filter to continue."
              }}
              getRowId={(record) => record.id}
              isLoading={query.isLoading || query.isFetching}
              onRowSelect={setSelected}
              records={records}
              rowLabel={(record) => `${record.resultType} ${record.title}`}
              virtualization={{ enabled: true }}
            />
          </Card>
        )}
      </ListPageShell>

      <ErpModalWorkspace
        description="Review the selected result before opening the source screen."
        footer={
          selected ? (
            <ErpActionBar
              primary={[
                {
                  label: "Open source screen",
                  onClick: () => navigate(selected.route)
                }
              ]}
              utility={[{ label: "Close", onClick: () => setSelected(null), variant: "quiet" }]}
            />
          ) : null
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? "Search result"}
      >
        {selected ? (
          <Card title={selected.resultType} description={selected.subtitle}>
            <div className="utility-grid">
              <Tile label="Area" meta="Module">
                {selected.module}
              </Tile>
              <Tile label="Status" meta="Current record state">
                {selected.status}
              </Tile>
              <Tile label="Source" meta="Search source">
                {selected.sourceLabel}
              </Tile>
            </div>
          </Card>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
