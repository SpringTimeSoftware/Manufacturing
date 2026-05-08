import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import {
  listMachineStatus,
  listProductionReceipts,
  listReworkOrders,
  listScrapByProducts,
  type MachineStatusItem,
  type ProductionReceiptItem,
  type ReworkOrderItem,
  type ScrapByProductItem
} from "../production/productionOutputAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpLookupField, ErpModalWorkspace } from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Live records" : "Reference view"}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("post") || normalized.includes("release") || normalized.includes("running")
    ? "success"
    : normalized.includes("draft") || normalized.includes("review") || normalized.includes("idle")
      ? "warn"
      : normalized.includes("down") || normalized.includes("hold")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function usePageFilter(search: string, status: string) {
  const { user } = useAuth();
  const deferredSearch = useDeferredValue(search);

  return useMemo(
    () => ({
      deferredSearch,
      filter: buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status)
    }),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
}

const receiptColumns: DataGridColumn<ProductionReceiptItem>[] = [
  {
    key: "receipt",
    header: "Receipt",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{record.receiptNo}</strong>
        <div className="muted">{record.postingDate}</div>
      </div>
    )
  },
  { key: "document", header: "WO / JC", width: "18%", render: (record) => `${record.workOrderLabel} / ${record.jobCardLabel}` },
  { key: "output", header: "Output", render: (record) => record.outputSummary },
  { key: "trace", header: "Lot / serial", width: "18%", render: (record) => record.lotSerialSignal },
  { key: "cw", header: "Catch weight", width: "14%", render: (record) => record.catchWeightSignal },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function ProductionReceiptPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = usePageFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.productionReceipts(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listProductionReceipts(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Prepare receipt draft", reason: "Production receipt drafting requires posting workflow enablement." }]} secondary={[{ disabled: true, label: "Print receipt", reason: "Receipt printing is pending document workflow enablement." }]} testId="production-receipt-action-bar" /></>}
        description="Receive WIP/FG output with lot, serial, catch-weight, warehouse, and posting context."
        filters={<FilterBar><input aria-label="Search production receipts" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search receipt, WO, job card, item" value={search} /><select aria-label="Production receipt status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Posted">Posted</option><option value="Draft">Draft</option></select></FilterBar>}
        title="Production Receipt"
      >
      <KpiStrip items={[{ label: "Receipts", value: String(records.length) }, { label: "Posted", value: String(records.filter((record) => record.status.toLowerCase().includes("post")).length) }, { label: "Draft", value: String(records.filter((record) => record.status.toLowerCase().includes("draft")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Output receipt register" description="Review production receipts before final posting.">
          <DataGrid ariaLabel="Production receipt list" columns={receiptColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.receiptNo} production receipt`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Production receipt detail is review-only until posting workflow is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save receipt draft", reason: "Production receipt save requires posting workflow enablement." }]} secondary={[{ disabled: true, label: "Post receipt", reason: "Posting requires the controlled production posting workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.receiptNo ?? "Production receipt"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="Receipt controls"><ErpLookupField disabled disabledReason="Work order and job card selection is controlled by production release." label="WO / JC" onChange={() => undefined} options={[{ label: `${selected.workOrderLabel} / ${selected.jobCardLabel}`, value: `${selected.workOrderLabel} / ${selected.jobCardLabel}` }]} value={`${selected.workOrderLabel} / ${selected.jobCardLabel}`} /><label><span>Output</span><input defaultValue={selected.outputSummary} /></label><label><span>Posted</span><input defaultValue={selected.postedLabel} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

const scrapColumns: DataGridColumn<ScrapByProductItem>[] = [
  { key: "scrap", header: "Entry", width: "18%", render: (record) => <strong>{record.scrapNo}</strong> },
  { key: "document", header: "WO / JC", width: "18%", render: (record) => `${record.workOrderLabel} / ${record.jobCardLabel}` },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "reason", header: "Reason", width: "16%", render: (record) => record.reasonCode },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function ScrapByProductPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = usePageFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.scrapEntries(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listScrapByProducts(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Prepare scrap draft", reason: "Scrap draft creation requires production posting workflow enablement." }]} secondary={[{ disabled: true, label: "Export scrap", reason: "Scrap export is pending the approved reporting workflow." }]} testId="scrap-action-bar" /></>} description="Capture scrap, by-product, reason, and valuation status for production review." filters={<FilterBar><input aria-label="Search scrap by-products" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search scrap, by-product, reason, item" value={search} /><select aria-label="Scrap status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Posted">Posted</option><option value="Draft">Draft</option><option value="ByProduct">By-product</option></select></FilterBar>} title="Scrap / By-product Entry">
      <KpiStrip items={[{ label: "Entries", value: String(records.length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "By-product", value: String(records.filter((record) => record.inventoryState.toLowerCase().includes("byproduct")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Scrap and by-product register" description="Valuation status is shown for production review without opening costing workflows.">
          <DataGrid ariaLabel="Scrap by-product list" columns={scrapColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.scrapNo} scrap by-product`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Scrap detail is review-only until scrap posting is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save scrap draft", reason: "Scrap save requires production posting workflow enablement." }]} secondary={[{ disabled: true, label: "Post scrap", reason: "Posting requires the controlled production posting workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.scrapNo ?? "Scrap entry"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="Scrap / by-product controls"><ErpLookupField disabled disabledReason="Reason code is controlled by reason-code master." label="Reason" onChange={() => undefined} options={[{ label: selected.reasonCode, value: selected.reasonCode }]} value={selected.reasonCode} /><ErpLookupField disabled disabledReason="Inventory state is controlled by production posting rules." label="Inventory state" onChange={() => undefined} options={[{ label: selected.inventoryState, value: selected.inventoryState }]} value={selected.inventoryState} /><label><span>Valuation</span><input defaultValue={selected.valuationSignal} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

const reworkColumns: DataGridColumn<ReworkOrderItem>[] = [
  { key: "rework", header: "Rework", width: "18%", render: (record) => <strong>{record.reworkNo}</strong> },
  { key: "source", header: "Source", width: "18%", render: (record) => record.sourceDocument },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "route", header: "Route", width: "24%", render: (record) => record.routeLabel },
  { key: "qty", header: "Qty", width: "8%", render: (record) => record.quantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function ReworkOrderPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = usePageFilter(search, status);
  const query = useApiQuery(
    queryKeys.production.reworkOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listReworkOrders(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New rework order", reason: "Rework order creation requires quality and production workflow enablement." }]} secondary={[{ disabled: true, label: "Export rework", reason: "Rework export is pending the approved reporting workflow." }]} testId="rework-action-bar" /></>} description="Review rework loops linked to NCR, job card, and inventory hold context." filters={<FilterBar><input aria-label="Search rework orders" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search rework, NCR, WO, item" value={search} /><select aria-label="Rework status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Released">Released</option><option value="Open">Open</option><option value="Closed">Closed</option></select></FilterBar>} title="Rework Order">
      <KpiStrip items={[{ label: "Rework orders", value: String(records.length) }, { label: "Released", value: String(records.filter((record) => record.status.toLowerCase().includes("release")).length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Rework loop register" description="Rework links remain tied to the NCR, job card, and hold context for review.">
          <DataGrid ariaLabel="Rework order list" columns={reworkColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.reworkNo} rework order`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Rework detail is review-only until rework order save is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save rework order", reason: "Rework save requires quality and production workflow enablement." }]} secondary={[{ disabled: true, label: "Release rework", reason: "Release requires controlled rework workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.reworkNo ?? "Rework order"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="Rework controls" description={selected.instructions}><ErpLookupField disabled disabledReason="Source document is controlled by NCR and production release context." label="Source" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} /><ErpLookupField disabled disabledReason="Route selection is controlled by routing master." label="Route" onChange={() => undefined} options={[{ label: selected.routeLabel, value: selected.routeLabel }]} value={selected.routeLabel} /><label><span>Released / closed</span><input defaultValue={`${selected.releasedLabel} / ${selected.closedLabel}`} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

const machineColumns: DataGridColumn<MachineStatusItem>[] = [
  { key: "machine", header: "Machine", render: (record) => <strong>{record.machineLabel}</strong> },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.currentStatus} /> },
  { key: "job", header: "Active JC / WO", width: "22%", render: (record) => `${record.activeJobCardLabel} / ${record.activeWorkOrderLabel}` },
  { key: "item", header: "Item", width: "14%", render: (record) => record.itemLabel },
  { key: "availability", header: "Avail.", width: "10%", render: (record) => `${record.availabilityPercent}%` },
  { key: "risk", header: "Risk", width: "16%", render: (record) => record.riskStatus }
];

export function MachineStatusPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => ({ page: 1, pageSize: 25, search: deferredSearch || undefined, status: status === "all" ? undefined : status, dateFrom: "2026-03-05", dateTo: "2026-03-11" }), [deferredSearch, status]);
  const query = useApiQuery(
    queryKeys.production.machineBoard("2026-03-05", "2026-03-11", deferredSearch, status),
    () => listMachineStatus(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = records[0]?.source ?? "Seeded";

  return (
    <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar secondary={[{ disabled: true, label: "Export OEE-lite", reason: "Machine-status export is pending the approved reporting workflow." }]} testId="machine-status-action-bar" /></>} description="Run, idle, down trends and availability snapshot derived from machine-board status." filters={<FilterBar><input aria-label="Search machine status" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search machine, job card, risk" value={search} /><select aria-label="Machine status filter" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Running">Running</option><option value="Idle">Idle</option><option value="Down">Down</option></select></FilterBar>} title="Machine Status / OEE-lite">
      <KpiStrip items={[{ label: "Machines", value: String(records.length) }, { label: "Running", value: String(records.filter((record) => record.currentStatus.toLowerCase().includes("running")).length) }, { label: "Down", value: String(records.filter((record) => record.currentStatus.toLowerCase().includes("down")).length) }, { label: "Avg avail.", value: `${Math.round(records.reduce((total, record) => total + record.availabilityPercent, 0) / Math.max(records.length, 1))}%` }]} />
      <Card title="Availability snapshot" description="OEE-lite avoids inventing full OEE costing or performance models.">
        <DataGrid ariaLabel="Machine status list" columns={machineColumns} getRowId={(record) => record.id} isLoading={query.isLoading} records={records} rowLabel={(record) => `${record.machineLabel} machine status`} />
      </Card>
    </ListPageShell>
  );
}
