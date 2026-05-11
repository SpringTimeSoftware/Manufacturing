import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { apiClient } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import {
  listDispatchPlanning,
  listPackLists,
  listShipments,
  type DispatchPlanningItem,
  type PackListItem,
  type PackListLineItem,
  type ShipmentItem,
  type ShipmentLineItem
} from "../dispatch/dispatchAdapters";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpFileActionState, ErpLookupField, ErpModalWorkspace, ErpNumberField } from "../ui/ErpComponents";
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
  const tone = normalized.includes("ready") || normalized.includes("complete") || normalized.includes("delivered")
    ? "success"
    : normalized.includes("risk") || normalized.includes("open") || normalized.includes("packing")
      ? "warn"
      : normalized.includes("blocked")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function useDispatchFilter(search: string, status: string) {
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

const packColumns: DataGridColumn<PackListItem>[] = [
  {
    key: "pack",
    header: "Pack list",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{record.packListNo}</strong>
        <div className="muted">{record.plannedShipDate}</div>
      </div>
    )
  },
  { key: "order", header: "Sales order", width: "16%", render: (record) => record.salesOrderLabel },
  { key: "lines", header: "Lines / Qty", width: "14%", render: (record) => `${record.lineCount} / ${record.packedQuantity}` },
  { key: "complete", header: "Completeness", render: (record) => record.completenessSignal },
  { key: "remarks", header: "Remarks", render: (record) => record.remarks },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const packLineColumns: DataGridColumn<PackListLineItem>[] = [
  { key: "line", header: "Line", width: "8%", render: (record) => record.lineNo },
  { key: "item", header: "Item", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "location", header: "Location", width: "20%", render: (record) => record.locationLabel },
  { key: "trace", header: "Trace", width: "18%", render: (record) => record.traceLabel },
  { key: "package", header: "Package", width: "14%", render: (record) => record.packageRef },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function PackListPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useDispatchFilter(search, status);
  const query = useApiQuery(
    queryKeys.dispatch.packLists(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listPackLists(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Create pack list", reason: "Pack-list creation requires dispatch workflow enablement." }]} secondary={[{ disabled: true, label: "Print labels", reason: "Label printing is pending document workflow enablement." }]} testId="pack-list-action-bar" /></>}
        description="Packing structure, labels, staged quantity, and completeness review before shipment."
        filters={<FilterBar><input aria-label="Search pack lists" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search pack, sales order, package" value={search} /><select aria-label="Pack list status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="Packing">Packing</option><option value="Packed">Packed</option></select></FilterBar>}
        title="Pack List"
      >
        <KpiStrip items={[{ label: "Pack lists", value: String(records.length) }, { label: "Packed qty", value: String(records.reduce((total, record) => total + record.packedQuantity, 0)) }, { label: "Complete", value: String(records.filter((record) => record.completenessSignal.toLowerCase().includes("complete")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Packing register" description="Open a pack list to review carton, traceability, and label readiness.">
          <DataGrid ariaLabel="Pack list table" columns={packColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.packListNo} pack list`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Pack list detail is review-only until packing workflow is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save pack list", reason: "Pack-list save requires dispatch workflow enablement." }]} secondary={[{ disabled: true, label: "Print labels", reason: "Label printing is pending document workflow enablement." }, { label: "Open shipment", onClick: () => navigate(`/dispatch/shipments?packList=${encodeURIComponent(selected?.packListNo ?? "")}`) }, { label: "Open print pack", onClick: () => navigate(`/reports/print-pack?packList=${encodeURIComponent(selected?.packListNo ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.packListNo ?? "Pack list"}
      >
        {selected ? (
          <>
            <KpiStrip items={[{ label: "Lines", value: String(selected.lineCount) }, { label: "Packed qty", value: String(selected.packedQuantity) }, { label: "Completeness", value: selected.completenessSignal }]} />
            <FormShell initialFingerprint={`${selected.id}-controls`} title="Pack controls">
              <ErpNumberField disabled disabledReason="Packed quantity is controlled by pack-line posting." label="Packed quantity" onChange={() => undefined} value={selected.packedQuantity} />
              <ErpLookupField disabled disabledReason="Pack status is controlled by the dispatch workflow." label="Status" onChange={() => undefined} options={[{ label: selected.status, value: selected.status }]} value={selected.status} />
            </FormShell>
            <Card title="Pack lines" description={selected.remarks}>
              <DataGrid ariaLabel="Pack list lines" columns={packLineColumns} getRowId={(record) => record.id} records={selected.lines} rowLabel={(record) => `${record.itemLabel} pack line`} />
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const planningColumns: DataGridColumn<DispatchPlanningItem>[] = [
  { key: "order", header: "Sales order", width: "16%", render: (record) => <strong>{record.salesOrderLabel}</strong> },
  { key: "customer", header: "Customer", render: (record) => record.customerLabel },
  { key: "promise", header: "Promise", width: "14%", render: (record) => record.promisedDate },
  { key: "qty", header: "Ordered / Packed / Shipped", width: "20%", render: (record) => `${record.orderedQuantity} / ${record.packedQuantity} / ${record.shippedQuantity}` },
  { key: "readiness", header: "Readiness", width: "12%", render: (record) => `${record.readinessPercent}%` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function DispatchPlanningPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { deferredSearch, filter } = useDispatchFilter(search, status);
  const query = useApiQuery(
    queryKeys.dispatch.planning(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listDispatchPlanning(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = records[0]?.source ?? "Seeded";

  return (
    <ListPageShell
      actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Plan dispatch wave", reason: "Dispatch-wave planning requires dispatch workflow enablement." }]} secondary={[{ disabled: true, label: "Export queue", reason: "Dispatch export is pending the approved reporting workflow." }]} testId="dispatch-planning-action-bar" /></>}
      description="Dispatch queue by customer promise date, pack completeness, and shipment readiness."
      filters={<FilterBar><input aria-label="Search dispatch planning" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search SO, customer, next action" value={search} /><select aria-label="Dispatch planning status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Ready">Ready</option><option value="At Risk">At risk</option><option value="Blocked">Blocked</option></select></FilterBar>}
      title="Dispatch Planning"
    >
      <KpiStrip items={[{ label: "Orders", value: String(records.length) }, { label: "Ready", value: String(records.filter((record) => record.status.toLowerCase().includes("ready")).length) }, { label: "At risk", value: String(records.filter((record) => record.status.toLowerCase().includes("risk")).length) }, { label: "Avg ready", value: `${Math.round(records.reduce((total, record) => total + record.readinessPercent, 0) / Math.max(records.length, 1))}%` }]} />
      <Card title="Readiness queue" description="Loading proof remains visible as dispatch readiness context.">
        <DataGrid ariaLabel="Dispatch planning table" columns={planningColumns} getRowId={(record) => record.id} isLoading={query.isLoading} records={records} rowLabel={(record) => `${record.salesOrderLabel} dispatch plan`} />
      </Card>
    </ListPageShell>
  );
}

const shipmentColumns: DataGridColumn<ShipmentItem>[] = [
  {
    key: "shipment",
    header: "Shipment",
    width: "18%",
    render: (record) => (
      <div>
        <strong>{record.shipmentNo}</strong>
        <div className="muted">{record.dispatchDate}</div>
      </div>
    )
  },
  { key: "customer", header: "Customer", render: (record) => record.customerLabel },
  { key: "pack", header: "Pack list", width: "14%", render: (record) => record.packListLabel },
  { key: "vehicle", header: "Vehicle / tracking", width: "22%", render: (record) => `${record.vehicleRef} / ${record.trackingRef}` },
  { key: "proof", header: "Proof", render: (record) => record.proofNotes },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const shipmentLineColumns: DataGridColumn<ShipmentLineItem>[] = [
  { key: "line", header: "Line", width: "8%", render: (record) => record.lineNo },
  { key: "item", header: "Item", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "location", header: "Location", width: "20%", render: (record) => record.locationLabel },
  { key: "trace", header: "Trace", width: "18%", render: (record) => record.traceLabel },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.shippedQuantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function ShipmentDeliveryPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [proofFiles, setProofFiles] = useState<Record<string, string>>({});
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useDispatchFilter(search, status);
  const query = useApiQuery(
    queryKeys.dispatch.shipments(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listShipments(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";
  const proofUpload = useApiMutation(
    (payload: { file: File; shipment: ShipmentItem }) =>
      apiClient.platform.uploadAttachment({
        branchId: user?.activeContext.branchId,
        companyId: user?.activeContext.companyId,
        file: payload.file,
        relatedDocumentId: payload.shipment.shipmentId,
        relatedDocumentType: "ShipmentProof"
      }),
    {
      onError: (error) => setProofMessage(error.message),
      onSuccess: (attachment, variables) => {
        setProofFiles((current) => ({ ...current, [variables.shipment.id]: attachment.fileName }));
        setProofMessage(`${attachment.fileName} linked as shipment proof.`);
      }
    }
  );
  const proofDisabledReason = !selected
    ? "Select a shipment before loading proof."
    : selected.source !== "Live"
      ? "Proof upload requires a live shipment record."
      : proofUpload.isPending
        ? "Shipment proof upload is in progress."
        : undefined;
  const handleProofSelect = (file: File | null) => {
    if (!file || !selected || proofDisabledReason) {
      return;
    }

    setProofMessage(null);
    proofUpload.mutate({ file, shipment: selected });
  };

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Prepare shipment", reason: "Shipment preparation requires dispatch workflow enablement." }]} secondary={[{ disabled: true, label: "Export documents", reason: "Shipment document export is pending the approved reporting workflow." }]} testId="shipment-action-bar" /></>}
        description="Vehicle, LR/tracking, loading proof, seal, and delivery status review."
        filters={<FilterBar><input aria-label="Search shipments" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search shipment, customer, vehicle" value={search} /><select aria-label="Shipment status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Loading">Loading</option><option value="Dispatched">Dispatched</option><option value="Delivered">Delivered</option></select></FilterBar>}
        title="Shipment / Delivery"
      >
      <KpiStrip items={[{ label: "Shipments", value: String(records.length) }, { label: "Shipped qty", value: String(records.reduce((total, record) => total + record.shippedQuantity, 0)) }, { label: "Open proof", value: String(records.filter((record) => record.proofNotes.toLowerCase().includes("pending")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Shipment register" description="Loading proof is shown as review state alongside shipment status.">
          <DataGrid ariaLabel="Shipment table" columns={shipmentColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.shipmentNo} shipment`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Shipment detail is review-only until shipment preparation is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save shipment", reason: "Shipment save requires dispatch workflow enablement." }]} secondary={[{ disabled: true, label: "Close shipment", reason: "Shipment close requires dispatch proof approval." }, { disabled: true, label: "Export documents", reason: "Shipment document export is pending the approved reporting workflow." }, { label: "Open pack list", onClick: () => navigate(`/dispatch/pack-lists?shipment=${encodeURIComponent(selected?.shipmentNo ?? "")}`) }, { label: "Open print pack", onClick: () => navigate(`/reports/print-pack?shipment=${encodeURIComponent(selected?.shipmentNo ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.shipmentNo ?? "Shipment"}
      >
        {selected ? (
          <>
            <KpiStrip items={[{ label: "Seal", value: selected.sealNo }, { label: "Loaded", value: selected.loadedLabel }, { label: "Delivered", value: selected.deliveredLabel }]} />
            <Card title="Shipment lines" description={selected.proofNotes}>
              <DataGrid ariaLabel="Shipment lines" columns={shipmentLineColumns} getRowId={(record) => record.id} records={selected.lines} rowLabel={(record) => `${record.itemLabel} shipment line`} />
            </Card>
            <FormShell initialFingerprint={selected.id} title="Shipment controls"><ErpLookupField disabled disabledReason="Vehicle assignment is controlled by dispatch workflow." label="Vehicle" onChange={() => undefined} options={[{ label: selected.vehicleRef, value: selected.vehicleRef }]} value={selected.vehicleRef} /><ErpLookupField disabled disabledReason="Pack list is controlled by dispatch planning." label="Pack list" onChange={() => undefined} options={[{ label: selected.packListLabel, value: selected.packListLabel }]} value={selected.packListLabel} /><ErpNumberField disabled disabledReason="Shipped quantity is controlled by shipment line posting." label="Shipped quantity" onChange={() => undefined} value={selected.shippedQuantity} /><label><span>Tracking</span><input disabled defaultValue={selected.trackingRef} /></label></FormShell>
            <Card title="Proof documents" description="Loading and delivery proof files are linked to the shipment audit record.">
              <ErpFileActionState
                accept=".pdf,.png,.jpg,.jpeg"
                disabledReason={proofDisabledReason}
                enabled={!proofDisabledReason}
                fileName={proofFiles[selected.id]}
                label="Load proof"
                onFileSelect={handleProofSelect}
              />
              {proofMessage ? <p className="muted">{proofMessage}</p> : null}
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
