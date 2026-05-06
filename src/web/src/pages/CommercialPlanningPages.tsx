import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  listAttachmentViewerSetup,
  listAvailablePromiseSetup,
  listBlanketOrderSetup,
  listDemandForecastSetup,
  listMpsPlannerSetup,
  listQuoteSetup,
  listSalesOrderSetup,
  type AttachmentViewerItem,
  type AvailablePromiseItem,
  type BlanketOrderSetupItem,
  type DemandForecastSetupItem,
  type MpsPlannerItem,
  type QuoteSetupItem,
  type SalesOrderSetupItem
} from "../commercial/commercialPlanningAdapters";
import {
  buildMasterFilter,
  listSupplierLeadTimeSetup,
  type MasterDataSource,
  type SupplierLeadTimeSetupItem
} from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
  ErpStatusChip
} from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <ErpStatusChip tone={tone}>{source === "Live" ? "Setup complete" : "Readiness view"}</ErpStatusChip>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("risk") || normalized.includes("review")
    ? "danger"
    : normalized.includes("draft")
      ? "warn"
      : normalized.includes("approved") || normalized.includes("active") || normalized.includes("firm") || normalized.includes("promise")
        ? "success"
        : "info";

  return <ErpStatusChip tone={tone}>{status}</ErpStatusChip>;
}

function WorkbenchAside({
  description,
  source
}: {
  description: string;
  endpoint: string;
  source: MasterDataSource;
}) {
  return (
    <Card title="Workspace guidance" description={description}>
      <div className="notification-item">
        <strong>Workspace records</strong>
        <p>Review the records available for this workspace before taking the next planning action.</p>
        <div className="context-chip-row">
          <SourceBadge source={source} />
          <Badge tone="info">Workspace ready</Badge>
        </div>
      </div>
    </Card>
  );
}

const leadTimeColumns: DataGridColumn<SupplierLeadTimeSetupItem>[] = [
  { key: "item", header: "Item / group", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "supplier", header: "Supplier", width: "16%", render: (record) => `Supplier ${record.supplierId}` },
  { key: "days", header: "Lead time", width: "14%", render: (record) => `${record.leadTimeDays} days` },
  { key: "policy", header: "Order policy", width: "22%", render: (record) => record.orderPolicy },
  {
    key: "route",
    header: "Route",
    width: "14%",
    render: (record) => <ErpStatusChip tone={record.isSubcontractLeadTime ? "info" : "neutral"}>{record.isSubcontractLeadTime ? "Subcontract" : "Purchase"}</ErpStatusChip>
  },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const attachmentColumns: DataGridColumn<AttachmentViewerItem>[] = [
  { key: "document", header: "Document", width: "22%", render: (record) => <strong>{record.documentNo}</strong> },
  {
    key: "file",
    header: "Attachment",
    render: (record) => (
      <div>
        <strong>{record.fileName}</strong>
        <div className="muted">{record.fileType} / {record.fileSize}</div>
      </div>
    )
  },
  { key: "linked", header: "Linked to", width: "20%", render: (record) => record.linkedDocument },
  { key: "uploaded", header: "Uploaded", width: "16%", render: (record) => record.uploadedOn },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const quoteColumns: DataGridColumn<QuoteSetupItem>[] = [
  { key: "quote", header: "Quote", width: "18%", render: (record) => <strong>{record.quoteNo}</strong> },
  {
    key: "customer",
    header: "Customer / spec",
    render: (record) => (
      <div>
        <strong>{record.customerLabel}</strong>
        <div className="muted">{record.specRef}</div>
      </div>
    )
  },
  { key: "date", header: "Dates", width: "20%", render: (record) => `${record.quoteDate} / ${record.expiryDate}` },
  { key: "qty", header: "Lines / qty", width: "14%", render: (record) => `${record.lineCount} / ${record.totalQuantity}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const salesOrderColumns: DataGridColumn<SalesOrderSetupItem>[] = [
  { key: "order", header: "Order", width: "18%", render: (record) => <strong>{record.salesOrderNo}</strong> },
  {
    key: "customer",
    header: "Demand",
    render: (record) => (
      <div>
        <strong>{record.customerLabel}</strong>
        <div className="muted">Source: {record.sourceQuoteLabel}</div>
      </div>
    )
  },
  { key: "promise", header: "Promise", width: "18%", render: (record) => record.promisedDate },
  { key: "qty", header: "Lines / qty", width: "14%", render: (record) => `${record.lineCount} / ${record.totalQuantity}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const blanketOrderColumns: DataGridColumn<BlanketOrderSetupItem>[] = [
  { key: "blanket", header: "Contract", width: "20%", render: (record) => <strong>{record.blanketOrderNo}</strong> },
  { key: "customer", header: "Customer", render: (record) => record.customerLabel },
  { key: "horizon", header: "Horizon", width: "24%", render: (record) => record.horizon },
  { key: "release", header: "Next release", width: "20%", render: (record) => record.nextRelease },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const forecastColumns: DataGridColumn<DemandForecastSetupItem>[] = [
  { key: "forecast", header: "Forecast", width: "20%", render: (record) => <strong>{record.forecastCode}</strong> },
  {
    key: "name",
    header: "Demand plan",
    render: (record) => (
      <div>
        <strong>{record.forecastName}</strong>
        <div className="muted">{record.periodType} / {record.horizon}</div>
      </div>
    )
  },
  { key: "buckets", header: "Buckets", width: "14%", render: (record) => record.bucketCount },
  { key: "qty", header: "Qty", width: "12%", render: (record) => record.totalQuantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const mpsColumns: DataGridColumn<MpsPlannerItem>[] = [
  { key: "mps", header: "MPS", width: "18%", render: (record) => <strong>{record.mpsCode}</strong> },
  { key: "horizon", header: "Horizon", render: (record) => record.horizon },
  { key: "bucket", header: "First bucket", width: "20%", render: (record) => record.firstBucket },
  { key: "qty", header: "Planned qty", width: "14%", render: (record) => record.plannedQuantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const promiseColumns: DataGridColumn<AvailablePromiseItem>[] = [
  { key: "order", header: "Order", width: "18%", render: (record) => <strong>{record.orderRef}</strong> },
  {
    key: "item",
    header: "Demand",
    render: (record) => (
      <div>
        <strong>{record.itemLabel}</strong>
        <div className="muted">{record.customerLabel}</div>
      </div>
    )
  },
  { key: "dates", header: "Requested / promised", width: "22%", render: (record) => `${record.requestedDate} / ${record.promisedDate}` },
  { key: "material", header: "Material", width: "20%", render: (record) => record.materialSignal },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.promiseStatus} /> }
];

export function SupplierLeadTimeMatrixPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.partners.supplierLeadTimes(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listSupplierLeadTimeSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ disabled: true, label: "New lead-time row", reason: "Lead-time row creation is controlled by the supplier master workflow." }]}
              secondary={[{ disabled: true, label: "Export matrix", reason: "Export is pending the governed export workflow." }]}
              testId="supplier-lead-time-action-bar"
            />
          </>
        }
        aside={<WorkbenchAside description="Supplier lead-time setup feeds planning without changing procurement posting behavior." endpoint="/api/supplier-lead-times" source={source} />}
        description="Lead-time by supplier, item/category, branch, order policy, and subcontract route."
        filters={
          <ErpFilterBar
            ariaLabel="Supplier lead-time filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="supplier-lead-time-filter-bar"
          >
            <input aria-label="Search supplier lead times" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search item, supplier, branch, policy" value={search} />
            <select aria-label="Supplier lead-time status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </ErpFilterBar>
        }
        title="Supplier Lead Time Matrix"
      >
        <KpiStrip
          items={[
            { label: "Matrix rows", value: String(records.length) },
            { label: "Subcontract", value: String(records.filter((record) => record.isSubcontractLeadTime).length) },
            { label: "Avg days", value: records.length ? String(Math.round(records.reduce((total, record) => total + record.leadTimeDays, 0) / records.length)) : "0" },
            { label: "Priority 1", value: String(records.filter((record) => record.priorityRank === 1).length) }
          ]}
        />
        <Card title="Lead-time matrix" description="Planning-safe supplier promises grouped by item, policy, and route.">
          <ErpGrid
            ariaLabel="Supplier lead time matrix"
            columns={leadTimeColumns}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.itemLabel} supplier lead-time matrix`}
            testId="supplier-lead-time-grid"
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Supplier lead-time detail keeps item, supplier, and policy selection controlled by existing matrix values."
        footer={
          <ErpActionBar
            primary={[{ disabled: true, label: "Save lead-time row", reason: "Save is disabled until the supplier lead-time workflow is enabled." }]}
            secondary={[{ disabled: true, label: "Review audit", reason: "Audit review is pending rollout." }]}
            utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.itemLabel ?? "Lead-time detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Lead-time setup">
            <ErpLookupField
              label="Supplier lead-time item selector"
              onChange={() => undefined}
              options={Array.from(new Set(records.map((record) => record.itemLabel))).map((option) => ({ label: option, value: option }))}
              value={selected.itemLabel}
            />
            <ErpLookupField
              label="Supplier"
              onChange={() => undefined}
              options={Array.from(new Set(records.map((record) => String(record.supplierId)))).map((option) => ({ label: `Supplier ${option}`, value: option }))}
              value={String(selected.supplierId)}
            />
            <label><span>Lead time days</span><input defaultValue={selected.leadTimeDays} /></label>
            <ErpLookupField
              label="Order policy"
              onChange={() => undefined}
              options={Array.from(new Set(records.map((record) => record.orderPolicy))).map((option) => ({ label: option, value: option }))}
              value={selected.orderPolicy}
            />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function AttachmentViewerPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, undefined, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.platform.attachments(user?.activeContext.companyId, deferredSearch, status),
    () => listAttachmentViewerSetup(filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? records[0] ?? null;

  return (
    <ListPageShell
      actions={
        <>
          <SourceBadge source="Deferred" />
          <ErpActionBar
            primary={[{ disabled: true, label: "Upload document", reason: "Document upload requires approved storage configuration." }]}
            secondary={[{ disabled: true, label: "Open download audit", reason: "Download audit is pending document-control enablement." }]}
            testId="attachment-viewer-action-bar"
          />
        </>
      }
      aside={<WorkbenchAside description="Review commercial documents and attachment references for the selected company." endpoint="/api/attachments pending controller" source="Deferred" />}
      description="Drawings, PDFs, photos, and customer documents linked to manufacturing records."
      filters={
        <FilterBar>
          <input aria-label="Search attachments" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search document, filename, linked record" value={search} />
          <select aria-label="Attachment status" onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="all">Status: Any</option>
            <option value="Approved">Approved</option>
            <option value="Linked">Linked</option>
            <option value="Review">Review</option>
          </select>
        </FilterBar>
      }
      title="Attachment / Document Viewer"
    >
      <div className="split-panels">
        <Card title="Document list" description="Document references prepared for commercial review and release tracking.">
          <DataGrid
            ariaLabel="Attachment document list"
            columns={attachmentColumns}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.documentNo} attachment`}
            virtualization={{ enabled: true }}
          />
        </Card>
        <Card title="Attachment preview" description={selected ? selected.linkedDocument : "Select an attachment to preview metadata."}>
          {selected ? (
            <div className="notification-item">
              <strong>{selected.fileName}</strong>
              <p>{selected.fileType} / {selected.fileSize} / uploaded by {selected.uploadedBy}</p>
              <div className="context-chip-row"><StatusBadge status={selected.status} /><Badge tone="info">{selected.uploadedOn}</Badge></div>
            </div>
          ) : null}
        </Card>
      </div>
    </ListPageShell>
  );
}

export function QuoteEstimateListPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(queryKeys.salesPlanning.quotes(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listQuoteSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ disabled: true, label: "New quote draft", reason: "Quote draft creation requires the commercial workflow to be enabled." }]}
              secondary={[{ disabled: true, label: "Export quotes", reason: "Quote export is pending the approved reporting workflow." }]}
              testId="quote-action-bar"
            />
          </>
        }
        aside={<WorkbenchAside description="Quote review stays focused on estimate, customer, and release readiness." endpoint="/api/quotes" source={source} />}
        description="Quote and cost-estimate control for MTO/fabrication demand intake."
        filters={<FilterBar><input aria-label="Search quotes" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search quote, customer, spec" value={search} /><select aria-label="Quote status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Submitted">Submitted</option><option value="Draft">Draft</option></select></FilterBar>}
        title="Estimate / Quote List"
      >
        <KpiStrip items={[{ label: "Quotes", value: String(records.length) }, { label: "Submitted", value: String(records.filter((record) => record.status === "Submitted").length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Qty", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }]} />
        <Card title="Quote queue" description="Estimate records stay tied to customer specification and priority.">
          <DataGrid ariaLabel="Quote list" columns={quoteColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.quoteNo} quote`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Quote detail is review-only until quote drafting is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save quote draft", reason: "Quote save requires the commercial workflow to be enabled." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.quoteNo ?? "Quote detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Quote detail">
            <ErpLookupField disabled disabledReason="Customer selection is controlled from Customer Master." label="Customer" onChange={() => undefined} options={[{ label: selected.customerLabel, value: selected.customerLabel }]} value={selected.customerLabel} />
            <label><span>Spec reference</span><input defaultValue={selected.specRef} /></label>
            <ErpLookupField disabled disabledReason="Priority changes require quote workflow enablement." label="Priority" onChange={() => undefined} options={[{ label: selected.priorityCode, value: selected.priorityCode }]} value={selected.priorityCode} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function SalesOrderListPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.salesOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listSalesOrderSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ disabled: true, label: "New order draft", reason: "Sales order drafting requires the order-entry workflow to be enabled." }]}
              secondary={[{ disabled: true, label: "Export orders", reason: "Sales order export is pending the approved reporting workflow." }]}
              testId="sales-order-action-bar"
            />
          </>
        }
        aside={<WorkbenchAside description="Sales order screens remain demand-entry surfaces and do not alter production release logic." endpoint="/api/sales-orders" source={source} />}
        description="Sales order list and detail entry point to manufacturing demand."
        filters={<FilterBar><input aria-label="Search sales orders" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search order, customer, quote" value={search} /><select aria-label="Sales order status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Released">Released</option><option value="At Risk">At Risk</option></select></FilterBar>}
        title="Sales Order List"
      >
        <KpiStrip items={[{ label: "Orders", value: String(records.length) }, { label: "At risk", value: String(records.filter((record) => record.status.includes("Risk")).length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Qty", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }]} />
        <Card title="Manufacturing demand" description="Order lines, promise dates, attachments, and make type stay visible from the list.">
          <DataGrid ariaLabel="Sales order list" columns={salesOrderColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.salesOrderNo} sales order`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Sales order detail is review-only until order-entry save is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save order draft", reason: "Sales order save requires the order-entry workflow to be enabled." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.salesOrderNo ?? "Sales order detail"}
      >
        {selected ? <><div className="utility-grid"><Tile eyebrow={selected.priorityCode} label="Promise" meta={selected.status}>{selected.promisedDate}</Tile><Tile eyebrow={selected.sourceQuoteLabel} label="Total quantity" meta={`${selected.lineCount} lines`}>{selected.totalQuantity}</Tile></div><FormShell initialFingerprint={selected.id} title="Sales order detail"><ErpLookupField disabled disabledReason="Customer selection is controlled from Customer Master." label="Customer" onChange={() => undefined} options={[{ label: selected.customerLabel, value: selected.customerLabel }]} value={selected.customerLabel} /><label><span>Promise date</span><input defaultValue={selected.promisedDate} /></label></FormShell></> : null}
      </ErpModalWorkspace>
    </>
  );
}

export function BlanketOrderContractPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.blanketOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listBlanketOrderSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New blanket draft", reason: "Blanket order drafting requires the contract workflow to be enabled." }]} secondary={[{ disabled: true, label: "Export contracts", reason: "Contract export is pending the approved reporting workflow." }]} testId="blanket-order-action-bar" /></>} aside={<WorkbenchAside description="Blanket orders expose recurring demand schedules without releasing production." endpoint="/api/blanket-orders" source={source} />} description="Recurring demand and schedule releases by customer and period." filters={<FilterBar><input aria-label="Search blanket orders" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search contract, customer, release" value={search} /><select aria-label="Blanket order status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Active">Active</option><option value="Draft">Draft</option></select></FilterBar>} title="Blanket Order / Contract">
        <KpiStrip items={[{ label: "Contracts", value: String(records.length) }, { label: "Schedules", value: String(records.reduce((total, record) => total + record.scheduleCount, 0)) }, { label: "Qty", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }, { label: "Active", value: String(records.filter((record) => record.status === "Active").length) }]} />
        <Card title="Blanket contract registry" description="Schedule releases remain reviewable before demand enters planning.">
          <DataGrid ariaLabel="Blanket order list" columns={blanketOrderColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.blanketOrderNo} blanket order`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Blanket order detail is review-only until contract drafting is enabled." footer={<ErpActionBar primary={[{ disabled: true, label: "Save blanket draft", reason: "Blanket order save requires the contract workflow to be enabled." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.blanketOrderNo ?? "Blanket order detail"}>{selected ? <FormShell initialFingerprint={selected.id} title="Blanket order setup"><ErpLookupField disabled disabledReason="Customer selection is controlled from Customer Master." label="Customer" onChange={() => undefined} options={[{ label: selected.customerLabel, value: selected.customerLabel }]} value={selected.customerLabel} /><label><span>Horizon</span><input defaultValue={selected.horizon} /></label><label><span>Next release</span><input defaultValue={selected.nextRelease} /></label></FormShell> : null}</ErpModalWorkspace>
    </>
  );
}

export function DemandForecastPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.forecasts(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listDemandForecastSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const source = records[0]?.source ?? "Seeded";

  return (
    <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New forecast", reason: "Forecast creation requires planning workflow enablement." }]} secondary={[{ disabled: true, label: "Import forecast", reason: "Forecast import requires the approved import workflow." }]} testId="forecast-action-bar" /></>} aside={<WorkbenchAside description="Demand forecast stays a planning input and does not create sales orders automatically." endpoint="/api/forecasts" source={source} />} description="Manual or imported forecast by period, item, and planning horizon." filters={<FilterBar><input aria-label="Search forecasts" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search forecast, period, horizon" value={search} /><select aria-label="Forecast status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Approved">Approved</option><option value="Draft">Draft</option></select></FilterBar>} title="Demand Forecast">
      <KpiStrip items={[{ label: "Forecasts", value: String(records.length) }, { label: "Buckets", value: String(records.reduce((total, record) => total + record.bucketCount, 0)) }, { label: "Qty", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }, { label: "Approved", value: String(records.filter((record) => record.status === "Approved").length) }]} />
      <Card title="Forecast registry" description="Forecast buckets are reviewable before MPS or MRP consumption.">
        <DataGrid ariaLabel="Demand forecast list" columns={forecastColumns} getRowId={(record) => record.id} isLoading={query.isLoading} records={records} rowLabel={(record) => `${record.forecastCode} forecast`} virtualization={{ enabled: true }} />
      </Card>
    </ListPageShell>
  );
}

export function MpsPlannerPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.mps(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listMpsPlannerSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: true, label: "New MPS draft", reason: "MPS drafting requires planning workflow enablement." }]} secondary={[{ disabled: true, label: "Export MPS", reason: "MPS export is pending the approved reporting workflow." }]} testId="mps-action-bar" /></>} aside={<WorkbenchAside description="MPS planning is web setup/planning scope and does not execute shop-floor actions." endpoint="/api/mps" source={source} />} description="Master production schedule by item, period, and planning horizon." filters={<ErpFilterBar ariaLabel="MPS filters" onClear={() => { setSearch(""); setStatus("all"); }} testId="mps-filter-bar"><input aria-label="Search MPS" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search MPS, horizon, item" value={search} /><select aria-label="MPS status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Firm">Firm</option><option value="Draft">Draft</option></select></ErpFilterBar>} title="MPS Planner">
        <KpiStrip items={[{ label: "Plans", value: String(records.length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Planned qty", value: String(records.reduce((total, record) => total + record.plannedQuantity, 0)) }, { label: "Firm", value: String(records.filter((record) => record.status === "Firm").length) }]} />
        <Card title="MPS planning board" description="Schedule buckets remain visible without entering MRP console scope.">
          <ErpGrid ariaLabel="MPS planner list" columns={mpsColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.mpsCode} mps`} testId="mps-grid" virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="MPS detail is review-only until MPS drafting is enabled." footer={<ErpActionBar primary={[{ disabled: true, label: "Save MPS draft", reason: "MPS save requires planning workflow enablement." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.mpsCode ?? "MPS detail"}>{selected ? <FormShell initialFingerprint={selected.id} title="MPS setup"><label><span>Horizon</span><input defaultValue={selected.horizon} /></label><ErpLookupField disabled disabledReason="MPS bucket item is controlled by Item Master and planning UOM setup." label="First bucket" onChange={() => undefined} options={[{ label: selected.firstBucket, value: selected.firstBucket }]} value={selected.firstBucket} /></FormShell> : null}</ErpModalWorkspace>
    </>
  );
}

export function AvailableToPromisePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, "all"), [deferredSearch, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.availableToPromise(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch), () => listAvailablePromiseSetup(filter), { staleTime: 60_000 });
  const records = query.data ?? [];

  return (
    <ListPageShell actions={<><SourceBadge source="Deferred" /><ErpActionBar primary={[{ disabled: true, label: "Run what-if", reason: "Promise simulation requires ATP workflow enablement." }]} secondary={[{ disabled: true, label: "Export promise check", reason: "Promise export is pending the approved reporting workflow." }]} testId="available-promise-action-bar" /></>} aside={<WorkbenchAside description="Promise rows show material and capacity readiness for planning review." endpoint="ATP endpoint deferred" source="Deferred" />} description="Committed date review using material and capacity signals." filters={<FilterBar><input aria-label="Search available to promise" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search order, customer, item, signal" value={search} /></FilterBar>} title="Available to Promise / Order Promise">
      <KpiStrip items={[{ label: "Checks", value: String(records.length) }, { label: "At risk", value: String(records.filter((record) => record.promiseStatus.includes("Risk")).length) }, { label: "Promiseable", value: String(records.filter((record) => record.promiseStatus === "Promiseable").length) }, { label: "Planned", value: String(records.filter((record) => record.source === "Deferred").length) }]} />
      <Card title="Promise workbench" description="Material and capacity signals are visible for order-promise review.">
        <DataGrid ariaLabel="Available to promise list" columns={promiseColumns} getRowId={(record) => record.id} isLoading={query.isLoading} records={records} rowLabel={(record) => `${record.orderRef} promise`} virtualization={{ enabled: true }} />
      </Card>
    </ListPageShell>
  );
}
