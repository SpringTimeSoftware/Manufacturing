import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import {
  listPurchaseOrderSetup,
  listPurchaseRequisitionSetup,
  listSubcontractPlanSetup,
  type PurchaseOrderItem,
  type PurchaseOrderLineItem,
  type PurchaseRequisitionItem,
  type PurchaseRequisitionLineItem,
  type SubcontractPlanItem
} from "../procurement/procurementAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpLookupField, ErpModalWorkspace } from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Live records" : "Review mode"}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("late") || normalized.includes("awaiting")
    ? "warn"
    : normalized.includes("approved") || normalized.includes("converted") || normalized.includes("planned")
      ? "success"
      : normalized.includes("blocked")
        ? "danger"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function useProcurementFilter(search: string, status: string) {
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

const prColumns: DataGridColumn<PurchaseRequisitionItem>[] = [
  { key: "pr", header: "PR", width: "18%", render: (record) => <strong>{record.purchaseRequisitionNo}</strong> },
  { key: "source", header: "Source", render: (record) => record.sourceDocument },
  { key: "need", header: "Need by", width: "14%", render: (record) => record.nextNeedBy },
  { key: "qty", header: "Lines / qty", width: "14%", render: (record) => `${record.lineCount} / ${record.totalQuantity}` },
  { key: "converted", header: "Converted", width: "12%", render: (record) => record.convertedLines },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.status} /> }
];

const prLineColumns: DataGridColumn<PurchaseRequisitionLineItem>[] = [
  { key: "line", header: "Line", width: "10%", render: (record) => record.lineNo },
  { key: "item", header: "Item", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.requiredQuantity },
  { key: "need", header: "Need by", width: "14%", render: (record) => record.needByDate },
  { key: "source", header: "BOQ / WO", width: "22%", render: (record) => `${record.sourceBoqLine} / ${record.linkedWorkOrder}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function PurchaseRequisitionPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useProcurementFilter(search, status);
  const query = useApiQuery(queryKeys.procurement.purchaseRequisitions(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listPurchaseRequisitionSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const preview = selected ?? records[0] ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Approve selected", reason: "PR approval requires the procurement approval workflow." }]} secondary={[{ disabled: true, label: "Export PR queue", reason: "PR export is pending the approved reporting workflow." }]} testId="purchase-requisition-action-bar" /></>}
        aside={
          <Card title="PR conversion guardrail" description="PR approval and conversion remain explicit; this page does not invent RFQ or accounting scope.">
            {preview ? <div className="utility-grid"><Tile eyebrow={preview.status} label="Need by" meta={preview.sourceDocument}>{preview.nextNeedBy}</Tile><Tile eyebrow="Lines" label="Total quantity" meta={`${preview.convertedLines} converted`}>{preview.totalQuantity}</Tile></div> : null}
          </Card>
        }
        description="List and approve purchase requisitions created from planning or manual demand."
        filters={<FilterBar><input aria-label="Search purchase requisitions" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search PR, source, item" value={search} /><select aria-label="Purchase requisition status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Converted">Converted</option></select></FilterBar>}
        title="Purchase Requisition List / Detail"
      >
        <KpiStrip items={[{ label: "PRs", value: String(records.length) }, { label: "Pending", value: String(records.filter((record) => record.status.includes("Pending")).length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }]} />
        <Card title="Purchase requisition queue" description="Planning-created and manual demand lines stay visible before approval.">
          <DataGrid ariaLabel="Purchase requisition list" columns={prColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.purchaseRequisitionNo} purchase requisition`} virtualization={{ enabled: true }} />
        </Card>
        <Card title="Purchase requisition detail" description={preview ? preview.sourceDocument : "Select a PR to inspect lines."}>
          <DataGrid ariaLabel="Purchase requisition lines" columns={prLineColumns} getRowId={(record) => record.id} records={preview?.lines ?? []} rowLabel={(record) => `${record.itemLabel} purchase requisition line`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Purchase requisition detail is review-only until procurement approvals are enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save requisition", reason: "PR save requires procurement workflow enablement." }]} secondary={[{ disabled: true, label: "Approve requisition", reason: "PR approval requires procurement approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.purchaseRequisitionNo ?? "Purchase requisition"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="Purchase requisition controls"><label><span>Source document</span><input defaultValue={selected.sourceDocument} /></label><ErpLookupField disabled disabledReason="Status changes require procurement approval workflow." label="Status" onChange={() => undefined} options={[{ label: selected.status, value: selected.status }]} value={selected.status} /><label><span>Next need by</span><input defaultValue={selected.nextNeedBy} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

const poColumns: DataGridColumn<PurchaseOrderItem>[] = [
  { key: "po", header: "PO", width: "18%", render: (record) => <strong>{record.purchaseOrderNo}</strong> },
  { key: "supplier", header: "Supplier", render: (record) => record.supplierLabel },
  { key: "expected", header: "Expected", width: "14%", render: (record) => record.expectedReceiptDate },
  { key: "qty", header: "Lines / qty", width: "14%", render: (record) => `${record.lineCount} / ${record.totalQuantity}` },
  { key: "followup", header: "Follow-up", width: "22%", render: (record) => record.overdueSignal },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.status} /> }
];

const poLineColumns: DataGridColumn<PurchaseOrderLineItem>[] = [
  { key: "line", header: "Line", width: "10%", render: (record) => record.lineNo },
  { key: "item", header: "Item", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "qty", header: "Qty", width: "10%", render: (record) => record.orderedQuantity },
  { key: "date", header: "Expected", width: "14%", render: (record) => record.expectedDate },
  { key: "links", header: "PR / WO", width: "22%", render: (record) => `${record.linkedPrLine} / ${record.linkedWorkOrder}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function PurchaseOrderPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useProcurementFilter(search, status);
  const query = useApiQuery(queryKeys.procurement.purchaseOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listPurchaseOrderSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const preview = selected ?? records[0] ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Approve PO", reason: "PO approval requires the procurement approval workflow." }]} secondary={[{ disabled: true, label: "Export PO follow-up", reason: "PO export is pending the approved reporting workflow." }]} testId="purchase-order-action-bar" /></>} description="PO list with status, overdue follow-up, receipts context, and source linkage." filters={<FilterBar><input aria-label="Search purchase orders" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search PO, supplier, item, follow-up" value={search} /><select aria-label="Purchase order status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="Late">Late</option><option value="Approved">Approved</option></select></FilterBar>} title="Purchase Order List / Detail">
        <KpiStrip items={[{ label: "POs", value: String(records.length) }, { label: "Late", value: String(records.filter((record) => record.status.includes("Late")).length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Quantity", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }]} />
        <div className="split-panels">
          <Card title="Purchase order queue" description="Supplier commitments are visible without entering landed-cost or accounting scope.">
            <DataGrid ariaLabel="Purchase order list" columns={poColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.purchaseOrderNo} purchase order`} />
          </Card>
          <Card title="Purchase order detail" description={preview ? preview.supplierLabel : "Select a PO to inspect lines."}>
            <DataGrid ariaLabel="Purchase order lines" columns={poLineColumns} getRowId={(record) => record.id} records={preview?.lines ?? []} rowLabel={(record) => `${record.itemLabel} purchase order line`} />
          </Card>
        </div>
      </ListPageShell>
      <ErpModalWorkspace
        description="Purchase order detail is review-only until purchase-order save and approval are enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save purchase order", reason: "PO save requires procurement workflow enablement." }]} secondary={[{ disabled: true, label: "Approve PO", reason: "PO approval requires procurement approval workflow." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.purchaseOrderNo ?? "Purchase order"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="Purchase order follow-up"><ErpLookupField disabled disabledReason="Supplier selection is controlled from Supplier Master." label="Supplier" onChange={() => undefined} options={[{ label: selected.supplierLabel, value: selected.supplierLabel }]} value={selected.supplierLabel} /><label><span>Expected receipt</span><input defaultValue={selected.expectedReceiptDate} /></label><label><span>Follow-up signal</span><input defaultValue={selected.overdueSignal} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}

const subcontractColumns: DataGridColumn<SubcontractPlanItem>[] = [
  { key: "sub", header: "Subcontract order", width: "20%", render: (record) => <strong>{record.subcontractOrderNo}</strong> },
  { key: "supplier", header: "Supplier", render: (record) => record.supplierLabel },
  { key: "workOrder", header: "WO / operation", width: "22%", render: (record) => `${record.workOrderLabel} / ${record.operationLabel}` },
  { key: "return", header: "Return", width: "14%", render: (record) => record.expectedReturnDate },
  { key: "status", header: "Status", width: "14%", render: (record) => <StatusBadge status={record.status} /> }
];

export function SubcontractPlanPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useProcurementFilter(search, status);
  const query = useApiQuery(queryKeys.procurement.subcontractOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listSubcontractPlanSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const preview = selected ?? records[0] ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "Approve outside plan", reason: "Outside-processing approval requires procurement workflow enablement." }]} secondary={[{ disabled: true, label: "Print send-out note", reason: "Send-out printing is pending document workflow enablement." }]} testId="subcontract-plan-action-bar" /></>}
        aside={<Card title="Outside processing guidance" description="Subcontract planning stays a procurement handoff; receive-back posting remains controlled by the receiving process.">{preview ? <div className="notification-item"><strong>{preview.subcontractOrderNo}</strong><p>{preview.sendOutSignal}</p><div className="context-chip-row"><StatusBadge status={preview.status} /><Badge tone="info">{preview.expectedReturnDate}</Badge></div></div> : null}</Card>}
        description="Send-out and receive-back planning for external operations."
        filters={<FilterBar><input aria-label="Search subcontract plans" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search subcontract, supplier, work order" value={search} /><select aria-label="Subcontract status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Planned">Planned</option><option value="Awaiting">Awaiting</option><option value="Approved">Approved</option></select></FilterBar>}
        title="Subcontract / Outside Processing Plan"
      >
        <KpiStrip items={[{ label: "Plans", value: String(records.length) }, { label: "Awaiting", value: String(records.filter((record) => record.status.includes("Awaiting")).length) }, { label: "Planned", value: String(records.filter((record) => record.status.includes("Planned")).length) }, { label: "Ready", value: String(records.filter((record) => record.status.includes("Planned") || record.status.includes("Awaiting")).length) }]} />
        <Card title="Outside processing schedule" description="Send-out and receive-back signals remain explicit by WO operation.">
          <DataGrid ariaLabel="Subcontract outside processing list" columns={subcontractColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.subcontractOrderNo} subcontract plan`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Subcontract plan detail is review-only until outside-processing workflow is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save outside plan", reason: "Outside-processing save requires procurement workflow enablement." }]} secondary={[{ disabled: true, label: "Approve outside plan", reason: "Approval requires procurement workflow enablement." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.subcontractOrderNo ?? "Subcontract plan"}
      >
        {selected ? <FormShell initialFingerprint={selected.id} title="Subcontract planning controls"><label><span>Send-out signal</span><input defaultValue={selected.sendOutSignal} /></label><label><span>Receive-back signal</span><input defaultValue={selected.receiveBackSignal} /></label><label><span>Expected return</span><input defaultValue={selected.expectedReturnDate} /></label></FormShell> : null}
      </ErpModalWorkspace>
    </>
  );
}
