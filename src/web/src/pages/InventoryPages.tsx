import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { queryKeys, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import {
  listMaterialIssueSetup,
  listMaterialReturnSetup,
  listStockBalanceSetup,
  listStockTransferPutawaySetup,
  listTraceabilitySetup,
  type MaterialIssueItem,
  type MaterialReturnItem,
  type StockBalanceItem,
  type StockTransferPutawayItem,
  type TraceabilityEventItem,
  type TraceabilityItem
} from "../inventory/inventoryAdapters";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpLookupField, ErpModalWorkspace, ErpNumberField } from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Live records" : "Review mode"}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("hold") || normalized.includes("reserved") || normalized.includes("issued")
    ? "warn"
    : normalized.includes("available") || normalized.includes("released") || normalized.includes("returned")
      ? "success"
      : normalized.includes("blocked")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function useInventoryFilter(search: string, status: string) {
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

const balanceColumns: DataGridColumn<StockBalanceItem>[] = [
  {
    key: "item",
    header: "Item",
    render: (record) => (
      <div>
        <strong>{record.itemLabel}</strong>
        <div className="muted">{record.lotSerialLabel}</div>
      </div>
    )
  },
  { key: "location", header: "Warehouse / bin", width: "18%", render: (record) => `${record.warehouseLabel} / ${record.binLabel}` },
  { key: "onHand", header: "On hand", width: "10%", render: (record) => record.onHandQty },
  { key: "reserved", header: "Reserved", width: "10%", render: (record) => record.reservedQty },
  { key: "hold", header: "QC/Blocked", width: "12%", render: (record) => `${record.qcHoldQty}/${record.blockedQty}` },
  { key: "available", header: "Available", width: "10%", render: (record) => <Badge tone={record.availableQty > 0 ? "success" : "warn"}>{record.availableQty}</Badge> },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function InventoryBalancePage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useInventoryFilter(search, status);
  const query = useApiQuery(queryKeys.inventory.balances(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listStockBalanceSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Open traceability", reason: "Traceability navigation requires a selected lot or serial context." }]} secondary={[{ disabled: true, label: "Export balances", reason: "Inventory export is pending the approved reporting workflow." }]} testId="inventory-balance-action-bar" /></>} description="Real-time stock, reserved, QC-hold, blocked, in-transit, and catch-weight quantities by warehouse/bin." filters={<FilterBar><input aria-label="Search inventory balances" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search item, warehouse, bin, lot" value={search} /><select aria-label="Inventory balance status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Available">Available</option><option value="Reserved">Reserved</option><option value="QC Hold">QC Hold</option><option value="Blocked">Blocked</option></select></FilterBar>} title="Inventory Balance by Warehouse / Bin">
        <KpiStrip items={[{ label: "Balance rows", value: String(records.length) }, { label: "On hand", value: String(records.reduce((total, record) => total + record.onHandQty, 0)) }, { label: "Reserved", value: String(records.reduce((total, record) => total + record.reservedQty, 0)) }, { label: "QC hold", value: String(records.reduce((total, record) => total + record.qcHoldQty, 0)) }]} />
        <Card title="Stock by warehouse/bin" description="Available quantity is net of reservations, QC hold, and blocked stock.">
          <DataGrid ariaLabel="Inventory balance list" columns={balanceColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.itemLabel} inventory balance`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Inventory balance detail is review-only; stock changes remain controlled by inventory transactions." footer={<ErpActionBar primary={[{ disabled: true, label: "Save balance", reason: "Balance quantities are controlled by inventory postings." }]} secondary={[{ label: "Open traceability", onClick: () => navigate(`/inventory/traceability?trace=${encodeURIComponent(selected?.lotSerialLabel ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.itemLabel ?? "Inventory balance"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Balance review"><ErpLookupField disabled disabledReason="Warehouse and bin are controlled by inventory location master." label="Location" onChange={() => undefined} options={[{ label: `${selected.warehouseLabel} / ${selected.binLabel}`, value: `${selected.warehouseLabel} / ${selected.binLabel}` }]} value={`${selected.warehouseLabel} / ${selected.binLabel}`} /><ErpLookupField disabled disabledReason="Lot and serial values are controlled by inventory postings." label="Lot / serial" onChange={() => undefined} options={[{ label: selected.lotSerialLabel, value: selected.lotSerialLabel }]} value={selected.lotSerialLabel} /><ErpNumberField disabled disabledReason="On-hand quantity is controlled by inventory postings." label="On hand" onChange={() => undefined} value={selected.onHandQty} /><ErpNumberField disabled disabledReason="Reserved quantity is controlled by reservations." label="Reserved" onChange={() => undefined} value={selected.reservedQty} /><ErpNumberField disabled disabledReason="Available quantity is calculated from inventory postings." label="Available" onChange={() => undefined} value={selected.availableQty} /><ErpLookupField disabled disabledReason="Catch-weight basis is controlled by item and inventory posting rules." label="Catch-weight basis" onChange={() => undefined} options={[{ label: selected.catchWeightLabel, value: selected.catchWeightLabel }]} value={selected.catchWeightLabel} /></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

const traceColumns: DataGridColumn<TraceabilityItem>[] = [
  { key: "trace", header: "Lot / serial", width: "20%", render: (record) => <strong>{record.traceRef}</strong> },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "location", header: "Current location", width: "20%", render: (record) => record.currentLocation },
  { key: "cw", header: "Catch weight", width: "14%", render: (record) => record.catchWeightLabel },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.status} /> }
];

const traceEventColumns: DataGridColumn<TraceabilityEventItem>[] = [
  { key: "tx", header: "Transaction", width: "18%", render: (record) => <strong>{record.transactionNo}</strong> },
  { key: "type", header: "Type", width: "16%", render: (record) => record.transactionType },
  { key: "date", header: "Date", width: "12%", render: (record) => record.postingDate },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "movement", header: "Movement", render: (record) => `${record.fromLocation} -> ${record.toLocation}` },
  { key: "state", header: "State", width: "12%", render: (record) => <StatusBadge status={record.state} /> }
];

export function TraceabilityPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, "all"), [deferredSearch, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.inventory.traceability(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch), () => listTraceabilitySetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? records[0] ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");

  return (
    <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar secondary={[{ disabled: true, label: "Export genealogy", reason: "Traceability export is pending the approved reporting workflow." }]} testId="traceability-action-bar" /></>} description="Forward/backward traceability by lot, serial, order, and stock movement." filters={<FilterBar><input aria-label="Search traceability" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search lot, serial, item, order" value={search} /></FilterBar>} title="Lot / Serial / Catch Weight Traceability">
        <KpiStrip items={[{ label: "Trace refs", value: String(records.length) }, { label: "Events", value: String(records.reduce((total, record) => total + record.events.length, 0)) }, { label: "Held/reserved", value: String(records.filter((record) => record.status.includes("Hold") || record.status.includes("Reserved")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
      <div className="split-panels">
        <Card title="Traceability register" description="Search shows lot and serial traceability when a concrete reference is supplied.">
          <DataGrid ariaLabel="Traceability list" columns={traceColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.traceRef} traceability`} />
        </Card>
        <Card title="Movement genealogy" description={selected ? selected.currentLocation : "Select a lot or serial to view movement genealogy."}>
          <DataGrid ariaLabel="Traceability events" columns={traceEventColumns} getRowId={(record) => record.id} records={selected?.events ?? []} rowLabel={(record) => `${record.transactionNo} traceability event`} />
        </Card>
      </div>
    </ListPageShell>
  );
}

const issueColumns: DataGridColumn<MaterialIssueItem>[] = [
  { key: "issue", header: "Issue", width: "18%", render: (record) => <strong>{record.transactionNo}</strong> },
  { key: "source", header: "WO / JC", width: "16%", render: (record) => record.sourceDocument },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "from", header: "From", width: "18%", render: (record) => record.fromLocation },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function MaterialIssuePage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useInventoryFilter(search, status);
  const query = useApiQuery(queryKeys.inventory.materialIssues(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listMaterialIssueSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Prepare issue draft", reason: "Material issue drafting requires inventory posting workflow enablement." }]} secondary={[{ disabled: true, label: "Print pick slip", reason: "Pick-slip printing is pending document workflow enablement." }]} testId="material-issue-action-bar" /></>} description="Issue reserved or actual material to a work order or job card with audit-friendly review controls." filters={<FilterBar><input aria-label="Search material issues" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search issue, work order, item, bin" value={search} /><select aria-label="Material issue status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Issued">Issued</option><option value="Reserved">Reserved</option><option value="Draft">Draft</option></select></FilterBar>} title="Material Issue to WO">
      <KpiStrip items={[{ label: "Issues", value: String(records.length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "WO-linked", value: String(records.filter((record) => record.sourceDocument.includes("WO")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Material issue workbench" description="Issue records stay review-only until controlled stock posting is enabled.">
          <DataGrid ariaLabel="Material issue list" columns={issueColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.transactionNo} material issue`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Material issue detail is review-only until issue posting is enabled." footer={<ErpActionBar primary={[{ disabled: true, label: "Save issue draft", reason: "Material issue save requires inventory posting workflow enablement." }]} secondary={[{ disabled: true, label: "Post issue", reason: "Posting requires controlled inventory workflow." }, { label: "Open source", onClick: () => navigate(`/production/work-orders?source=${encodeURIComponent(selected?.sourceDocument ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.transactionNo ?? "Material issue"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Material issue controls"><ErpLookupField disabled disabledReason="Source document is controlled by work-order and job-card release." label="Source" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} /><ErpLookupField disabled disabledReason="Source location is controlled by warehouse and bin master." label="From location" onChange={() => undefined} options={[{ label: selected.fromLocation, value: selected.fromLocation }]} value={selected.fromLocation} /><ErpNumberField disabled disabledReason="Issued quantity is controlled by inventory posting." label="Issue quantity" onChange={() => undefined} value={selected.quantity} /><ErpLookupField disabled disabledReason="Issue mode is controlled by inventory posting policy." label="Issue mode" onChange={() => undefined} options={[{ label: selected.issueMode, value: selected.issueMode }]} value={selected.issueMode} /></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

const returnColumns: DataGridColumn<MaterialReturnItem>[] = [
  { key: "return", header: "Return", width: "18%", render: (record) => <strong>{record.transactionNo}</strong> },
  { key: "source", header: "WO / JC", width: "16%", render: (record) => record.sourceDocument },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "to", header: "Return to", width: "18%", render: (record) => record.toLocation },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function MaterialReturnPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useInventoryFilter(search, status);
  const query = useApiQuery(queryKeys.inventory.materialReturns(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listMaterialReturnSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Prepare return draft", reason: "Material return drafting requires inventory posting workflow enablement." }]} secondary={[{ disabled: true, label: "Print return note", reason: "Return-note printing is pending document workflow enablement." }]} testId="material-return-action-bar" /></>} description="Return unused production material to stock or bin with lot and catch-weight context retained." filters={<FilterBar><input aria-label="Search material returns" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search return, work order, item, bin" value={search} /><select aria-label="Material return status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Returned">Returned</option><option value="Draft">Draft</option></select></FilterBar>} title="Material Return from WO">
      <KpiStrip items={[{ label: "Returns", value: String(records.length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "WO-linked", value: String(records.filter((record) => record.sourceDocument.includes("WO")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Material return workbench" description="Return records stay review-only until controlled stock posting is enabled.">
          <DataGrid ariaLabel="Material return list" columns={returnColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.transactionNo} material return`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Material return detail is review-only until return posting is enabled." footer={<ErpActionBar primary={[{ disabled: true, label: "Save return draft", reason: "Material return save requires inventory posting workflow enablement." }]} secondary={[{ disabled: true, label: "Post return", reason: "Posting requires controlled inventory workflow." }, { label: "Open source", onClick: () => navigate(`/production/work-orders?source=${encodeURIComponent(selected?.sourceDocument ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.transactionNo ?? "Material return"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Material return controls"><ErpLookupField disabled disabledReason="Source document is controlled by work-order and job-card release." label="Source" onChange={() => undefined} options={[{ label: selected.sourceDocument, value: selected.sourceDocument }]} value={selected.sourceDocument} /><ErpLookupField disabled disabledReason="Return location is controlled by warehouse and bin master." label="Return location" onChange={() => undefined} options={[{ label: selected.toLocation, value: selected.toLocation }]} value={selected.toLocation} /><ErpNumberField disabled disabledReason="Returned quantity is controlled by inventory posting." label="Return quantity" onChange={() => undefined} value={selected.quantity} /><ErpLookupField disabled disabledReason="Return reason is controlled by reason-code master." label="Return reason" onChange={() => undefined} options={[{ label: selected.returnReason, value: selected.returnReason }]} value={selected.returnReason} /></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

const transferColumns: DataGridColumn<StockTransferPutawayItem>[] = [
  { key: "transfer", header: "Movement", width: "18%", render: (record) => <strong>{record.transactionNo}</strong> },
  { key: "type", header: "Type", width: "12%", render: (record) => record.movementType },
  { key: "item", header: "Item", render: (record) => record.itemLabel },
  { key: "route", header: "From -> to", width: "24%", render: (record) => `${record.fromLocation} -> ${record.toLocation}` },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.quantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function StockTransferPutawayPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useInventoryFilter(search, status);
  const query = useApiQuery(queryKeys.inventory.stockTransfers(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listStockTransferPutawaySetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Prepare transfer draft", reason: "Stock transfer drafting requires inventory posting workflow enablement." }]} secondary={[{ disabled: true, label: "Print movement slip", reason: "Movement-slip printing is pending document workflow enablement." }]} testId="stock-transfer-action-bar" /></>} description="Inter-warehouse/bin movement and putaway review for stores users." filters={<FilterBar><input aria-label="Search stock transfers" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search transfer, item, bin, warehouse" value={search} /><select aria-label="Stock transfer status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Released">Released</option><option value="QC Hold">QC Hold</option><option value="Draft">Draft</option></select></FilterBar>} title="Stock Transfer / Putaway">
      <KpiStrip items={[{ label: "Movements", value: String(records.length) }, { label: "Putaway", value: String(records.filter((record) => record.movementType === "Putaway").length) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.quantity, 0)) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Transfer and putaway queue" description="Movement records stay review-only until controlled stock transfer posting is enabled.">
          <DataGrid ariaLabel="Stock transfer putaway list" columns={transferColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.transactionNo} stock transfer`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Stock movement detail is review-only until transfer posting is enabled." footer={<ErpActionBar primary={[{ disabled: true, label: "Save transfer draft", reason: "Stock transfer save requires inventory posting workflow enablement." }]} secondary={[{ disabled: true, label: "Post transfer", reason: "Posting requires controlled inventory workflow." }, { label: "Open balances", onClick: () => navigate(`/inventory/balances?item=${encodeURIComponent(selected?.itemLabel ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.transactionNo ?? "Stock movement"}>
        {selected ? <FormShell initialFingerprint={selected.id} title="Stock transfer controls"><ErpLookupField disabled disabledReason="Source location is controlled by warehouse and bin master." label="From" onChange={() => undefined} options={[{ label: selected.fromLocation, value: selected.fromLocation }]} value={selected.fromLocation} /><ErpLookupField disabled disabledReason="Destination location is controlled by warehouse and bin master." label="To" onChange={() => undefined} options={[{ label: selected.toLocation, value: selected.toLocation }]} value={selected.toLocation} /><ErpNumberField disabled disabledReason="Movement quantity is controlled by inventory posting." label="Movement quantity" onChange={() => undefined} value={selected.quantity} /><ErpLookupField disabled disabledReason="Movement type is controlled by inventory posting policy." label="Movement type" onChange={() => undefined} options={[{ label: selected.movementType, value: selected.movementType }]} value={selected.movementType} /></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}
