import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { InventoryDimensionOptionDto, PackListUpsertRequest, ShipmentProofRequest, ShipmentUpsertRequest } from "../api/contracts";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { apiClient } from "../api/http";
import { hasLiveSession } from "../api/liveData";
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
import { UdfRuntimePanel } from "../platform/UdfRuntimePanel";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpFileActionState, ErpLookupField, ErpModalWorkspace, ErpNumberField, ErpTransactionLineGrid, ErpValidationSummary } from "../ui/ErpComponents";
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

interface DispatchLineDraft {
  lineNo: number;
  itemId: number | null;
  warehouseId: number | null;
  binId: number | null;
  lotId: number | null;
  serialId: number | null;
  pcidId: number | null;
  quantity: number;
  uomId: number | null;
  packageRef: string;
  status: string;
  salesOrderLineId: number | null;
  packListLineId: number | null;
}

interface PackDraft {
  packListNo: string;
  salesOrderId: number | null;
  plannedShipDate: string;
  status: string;
  remarks: string;
  lines: DispatchLineDraft[];
}

interface ShipmentDraft {
  shipmentNo: string;
  packListId: number | null;
  customerId: number | null;
  dispatchDate: string;
  vehicleRef: string;
  trackingRef: string;
  sealNo: string;
  proofNotes: string;
  transporterName: string;
  driverName: string;
  driverContact: string;
  deliveryAddressSnapshot: string;
  status: string;
  lines: DispatchLineDraft[];
}

const packStatusOptions = ["Draft", "Packing", "Packed", "Closed"].map(toOption);
const shipmentStatusOptions = ["Loading", "Dispatched", "Delivered", "Closed"].map(toOption);
const lineStatusOptions = ["Draft", "Packed", "Loaded", "Shipped", "Closed"].map(toOption);

function toOption(value: string) {
  return { label: value, value };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function nextDispatchNo(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function numberValue(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function entityOptions<T>(items: T[] | undefined, getValue: (item: T) => number, getLabel: (item: T) => string) {
  return (items ?? []).map((item) => ({ label: getLabel(item), value: String(getValue(item)) }));
}

function dimensionOptions(items: InventoryDimensionOptionDto[] | undefined) {
  return (items ?? []).map((item) => ({
    disabled: Boolean(item.disabledReason),
    label: `${item.label}${item.availableQuantity !== null ? ` (${item.availableQuantity} available)` : ""}${item.disabledReason ? ` - ${item.disabledReason}` : ""}`,
    value: String(item.id)
  }));
}

function buildDispatchLine(lineNo: number, status = "Draft"): DispatchLineDraft {
  return {
    lineNo,
    itemId: null,
    warehouseId: null,
    binId: null,
    lotId: null,
    serialId: null,
    pcidId: null,
    quantity: 1,
    uomId: null,
    packageRef: "",
    status,
    salesOrderLineId: null,
    packListLineId: null
  };
}

function buildPackDraft(): PackDraft {
  return {
    packListNo: nextDispatchNo("PACK-DRAFT"),
    salesOrderId: null,
    plannedShipDate: todayIsoDate(),
    status: "Packing",
    remarks: "",
    lines: [buildDispatchLine(10, "Packed")]
  };
}

function buildShipmentDraft(): ShipmentDraft {
  return {
    shipmentNo: nextDispatchNo("SHP-DRAFT"),
    packListId: null,
    customerId: null,
    dispatchDate: todayIsoDate(),
    vehicleRef: "",
    trackingRef: "",
    sealNo: "",
    proofNotes: "",
    transporterName: "",
    driverName: "",
    driverContact: "",
    deliveryAddressSnapshot: "",
    status: "Loading",
    lines: [buildDispatchLine(10, "Loaded")]
  };
}

function renumberDispatchLines(lines: DispatchLineDraft[]) {
  return lines.map((line, index) => ({ ...line, lineNo: (index + 1) * 10 }));
}

function packDraftErrors(draft: PackDraft | null) {
  if (!draft) {
    return [];
  }

  const errors: string[] = [];
  if (!draft.packListNo.trim()) {
    errors.push("Pack-list number is required.");
  }
  if (!draft.plannedShipDate) {
    errors.push("Planned ship date is required.");
  }
  if (draft.lines.length === 0) {
    errors.push("At least one pack line is required.");
  }

  draft.lines.forEach((line, index) => {
    if (!line.itemId) {
      errors.push(`Line ${index + 1} item is required.`);
    }
    if (!line.warehouseId) {
      errors.push(`Line ${index + 1} warehouse is required.`);
    }
    if (!line.uomId) {
      errors.push(`Line ${index + 1} pack UOM is required.`);
    }
    if (!line.quantity || line.quantity <= 0) {
      errors.push(`Line ${index + 1} packed quantity must be greater than zero.`);
    }
  });

  return errors;
}

function shipmentDraftErrors(draft: ShipmentDraft | null) {
  if (!draft) {
    return [];
  }

  const errors: string[] = [];
  if (!draft.shipmentNo.trim()) {
    errors.push("Shipment number is required.");
  }
  if (!draft.customerId) {
    errors.push("Customer is required.");
  }
  if (!draft.dispatchDate) {
    errors.push("Dispatch date is required.");
  }
  if (draft.lines.length === 0) {
    errors.push("At least one shipment line is required.");
  }

  draft.lines.forEach((line, index) => {
    if (!line.itemId) {
      errors.push(`Line ${index + 1} item is required.`);
    }
    if (!line.warehouseId) {
      errors.push(`Line ${index + 1} warehouse is required.`);
    }
    if (!line.uomId) {
      errors.push(`Line ${index + 1} ship UOM is required.`);
    }
    if (!line.quantity || line.quantity <= 0) {
      errors.push(`Line ${index + 1} shipped quantity must be greater than zero.`);
    }
  });

  return errors;
}

function buildPackRequest(draft: PackDraft, companyId: number, branchId: number): PackListUpsertRequest {
  return {
    companyId,
    branchId,
    packListNo: draft.packListNo,
    salesOrderId: draft.salesOrderId,
    plannedShipDate: draft.plannedShipDate || null,
    status: draft.status,
    remarks: draft.remarks || null,
    lines: renumberDispatchLines(draft.lines).map((line) => ({
      lineNo: line.lineNo,
      salesOrderLineId: line.salesOrderLineId,
      itemId: line.itemId ?? 0,
      itemVariantId: null,
      warehouseId: line.warehouseId ?? 0,
      binId: line.binId,
      lotId: line.lotId,
      serialId: line.serialId,
      pcidId: line.pcidId,
      packedQuantity: line.quantity,
      packUomId: line.uomId ?? 0,
      packageRef: line.packageRef || null,
      status: line.status
    }))
  };
}

function buildShipmentRequest(draft: ShipmentDraft, companyId: number, branchId: number): ShipmentUpsertRequest {
  return {
    companyId,
    branchId,
    shipmentNo: draft.shipmentNo,
    packListId: draft.packListId,
    customerId: draft.customerId ?? 0,
    dispatchDate: draft.dispatchDate,
    vehicleRef: draft.vehicleRef || null,
    trackingRef: draft.trackingRef || null,
    sealNo: draft.sealNo || null,
    proofNotes: draft.proofNotes || null,
    transporterName: draft.transporterName || null,
    driverName: draft.driverName || null,
    driverContact: draft.driverContact || null,
    deliveryAddressSnapshot: draft.deliveryAddressSnapshot || null,
    status: draft.status,
    lines: renumberDispatchLines(draft.lines).map((line) => ({
      lineNo: line.lineNo,
      packListLineId: line.packListLineId,
      salesOrderLineId: line.salesOrderLineId,
      itemId: line.itemId ?? 0,
      itemVariantId: null,
      warehouseId: line.warehouseId ?? 0,
      binId: line.binId,
      lotId: line.lotId,
      serialId: line.serialId,
      pcidId: line.pcidId,
      shippedQuantity: line.quantity,
      shipUomId: line.uomId ?? 0,
      status: line.status
    }))
  };
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
  const [searchParams] = useSearchParams();
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [packDraft, setPackDraft] = useState<PackDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { deferredSearch, filter } = useDispatchFilter(search, status);
  const query = useApiQuery(
    queryKeys.dispatch.packLists(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listPackLists(session, filter),
    { staleTime: 60_000 }
  );
  const salesOrders = useApiQuery(queryKeys.salesPlanning.salesOrders(companyId, branchId, "", "Confirmed"), () => apiClient.salesPlanning.salesOrders({ companyId, branchId, status: "Confirmed" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const warehouses = useApiQuery(queryKeys.organization.warehouses(companyId, branchId, "", "Active"), () => apiClient.organization.warehouses({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const uoms = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => apiClient.measurements.uoms({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const bins = useApiQuery(["inventory", "dispatch", "valid-bins", companyId, branchId], () => apiClient.inventory.validBins({ companyId, branchId }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const lots = useApiQuery(["inventory", "dispatch", "valid-lots", companyId, branchId], () => apiClient.inventory.validLots({ companyId, branchId }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const serials = useApiQuery(["inventory", "dispatch", "valid-serials", companyId, branchId], () => apiClient.inventory.validSerials({ companyId, branchId }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const pcids = useApiQuery(["inventory", "dispatch", "valid-pcids", companyId, branchId], () => apiClient.inventory.validPcids({ companyId, branchId }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const requestedPackList = searchParams.get("packList");
  const salesOrderOptions = entityOptions(salesOrders.data?.items, (order) => order.id, (order) => order.salesOrderNo);
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const warehouseOptions = entityOptions(warehouses.data?.items, (warehouse) => warehouse.id, (warehouse) => `${warehouse.warehouseCode} / ${warehouse.warehouseName}`);
  const uomOptions = entityOptions(uoms.data?.items, (uom) => uom.id, (uom) => `${uom.uomCode} / ${uom.uomName}`);
  const binOptions = dimensionOptions(bins.data);
  const lotOptions = dimensionOptions(lots.data);
  const serialOptions = dimensionOptions(serials.data);
  const pcidOptions = dimensionOptions(pcids.data);
  const packErrors = packDraftErrors(packDraft);
  const savePackReason = !packDraft
    ? "Open a pack-list draft before saving."
    : !live
      ? "Live dispatch sign-in is required before saving pack lists."
      : packErrors.length > 0
        ? "Resolve pack-list validation issues before saving."
        : undefined;
  const savePack = useApiMutation((request: PackListUpsertRequest) => apiClient.dispatch.createPackList(request), {
    onSuccess: async (record) => {
      setMessage(`Saved pack list ${record.packListNo}.`);
      setPackDraft(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });

  useEffect(() => {
    if (!requestedPackList || records.length === 0) {
      return;
    }

    const normalized = requestedPackList.toLowerCase();
    const match = records.find(
      (record) =>
        record.packListNo.toLowerCase() === normalized ||
        record.packListNo.toLowerCase().includes(normalized)
    );

    if (match) {
      setSelectedId(match.id);
    }
  }, [records, requestedPackList]);

  const patchPackLine = (index: number, patch: Partial<DispatchLineDraft>) => {
    setPackDraft((current) =>
      current ? { ...current, lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)) } : current
    );
  };

  const addPackLine = () => {
    setPackDraft((current) => current ? { ...current, lines: [...current.lines, buildDispatchLine((current.lines.length + 1) * 10, "Packed")] } : current);
  };

  const removePackLine = (index: number) => {
    setPackDraft((current) => current ? { ...current, lines: renumberDispatchLines(current.lines.filter((_, lineIndex) => lineIndex !== index)) } : current);
  };

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "Create pack list", onClick: () => { setMessage(null); setPackDraft(buildPackDraft()); } }]} secondary={[{ disabled: true, label: "Print labels", reason: "Label printing is pending document workflow enablement." }]} testId="pack-list-action-bar" /></>}
        description="Packing structure, labels, staged quantity, and completeness review before shipment."
        filters={<FilterBar><input aria-label="Search pack lists" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search pack, sales order, package" value={search} /><select aria-label="Pack list status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Open">Open</option><option value="Packing">Packing</option><option value="Packed">Packed</option></select></FilterBar>}
        title="Pack List"
      >
        {query.error ? <Card title="Live pack-list data unavailable" description={query.error.message} /> : null}
        {message ? <Badge tone={message.toLowerCase().includes("saved") ? "success" : "danger"}>{message}</Badge> : null}
        <KpiStrip items={[{ label: "Pack lists", value: String(records.length) }, { label: "Packed qty", value: String(records.reduce((total, record) => total + record.packedQuantity, 0)) }, { label: "Complete", value: String(records.filter((record) => record.completenessSignal.toLowerCase().includes("complete")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Packing register" description="Open a pack list to review carton, traceability, and label readiness.">
          <DataGrid ariaLabel="Pack list table" columns={packColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.packListNo} pack list`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Create a pack list with governed sales order, item, warehouse, UOM, package, and traceability fields."
        footer={<ErpActionBar primary={[{ disabled: Boolean(savePackReason) || savePack.isPending, label: savePack.isPending ? "Saving pack list" : "Save pack list", onClick: packDraft && !savePackReason ? () => savePack.mutate(buildPackRequest(packDraft, companyId, branchId)) : undefined, reason: savePackReason }]} secondary={[{ disabled: !live, label: "Add Line", onClick: live ? addPackLine : undefined, reason: live ? undefined : "Live dispatch sign-in is required before adding pack lines." }]} utility={[{ label: "Close", onClick: () => setPackDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(packDraft)}
        onClose={() => setPackDraft(null)}
        title={packDraft?.packListNo ?? "Pack list draft"}
        validation={<ErpValidationSummary errors={packErrors} />}
      >
        {packDraft ? (
          <div className="modal-form-grid">
            <FormShell initialFingerprint={`${packDraft.packListNo}-header`} title="Pack-list controls">
              <label><span>Pack-list number</span><input aria-label="Pack-list number" disabled={!live} onChange={(event) => setPackDraft({ ...packDraft, packListNo: event.target.value })} value={packDraft.packListNo} /></label>
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before selecting a sales order."} label="Sales order" onChange={(value) => setPackDraft({ ...packDraft, salesOrderId: numberValue(value) })} options={[{ label: "Manual pack", value: "" }, ...salesOrderOptions]} value={packDraft.salesOrderId ? String(packDraft.salesOrderId) : ""} />
              <label><span>Planned ship date</span><input aria-label="Planned ship date" disabled={!live} onChange={(event) => setPackDraft({ ...packDraft, plannedShipDate: event.target.value })} type="date" value={packDraft.plannedShipDate} /></label>
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before changing pack status."} label="Pack status" onChange={(value) => setPackDraft({ ...packDraft, status: value })} options={packStatusOptions} value={packDraft.status} />
              <label className="form-span-2"><span>Remarks</span><input aria-label="Pack-list remarks" disabled={!live} onChange={(event) => setPackDraft({ ...packDraft, remarks: event.target.value })} value={packDraft.remarks} /></label>
            </FormShell>
            <Card title="Pack lines" description="Add all cartons, trace references, and packed quantities before shipment creation.">
              <ErpTransactionLineGrid
                addDisabled={!live}
                addDisabledReason="Live dispatch sign-in is required before adding pack lines."
                addLabel="Add Line"
                ariaLabel="Pack line grid"
                columns={[
                  { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                  { key: "item", header: "Item", width: "180px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before selecting an item."} label={`Item ${index + 1}`} onChange={(value) => patchPackLine(index, { itemId: numberValue(value) })} options={itemOptions} required value={line.itemId ? String(line.itemId) : ""} /> },
                  { key: "warehouse", header: "Warehouse", width: "160px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before selecting a warehouse."} label={`Warehouse ${index + 1}`} onChange={(value) => patchPackLine(index, { warehouseId: numberValue(value) })} options={warehouseOptions} required value={line.warehouseId ? String(line.warehouseId) : ""} /> },
                  { key: "uom", header: "UOM", width: "140px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before selecting a UOM."} label={`Pack UOM ${index + 1}`} onChange={(value) => patchPackLine(index, { uomId: numberValue(value) })} options={uomOptions} required value={line.uomId ? String(line.uomId) : ""} /> },
                  { key: "qty", header: "Packed qty", width: "125px", render: (line, index) => <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before changing packed quantity."} label={`Packed quantity ${index + 1}`} min={0.001} onChange={(value) => patchPackLine(index, { quantity: value ?? 0 })} value={line.quantity} /> },
                  { key: "bin", header: "Bin", width: "145px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before assigning a bin."} label={`Bin ${index + 1}`} onChange={(value) => patchPackLine(index, { binId: numberValue(value) })} options={binOptions} value={line.binId ? String(line.binId) : ""} /> },
                  { key: "lot", header: "Lot", width: "145px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before assigning a lot."} label={`Lot ${index + 1}`} onChange={(value) => patchPackLine(index, { lotId: numberValue(value) })} options={lotOptions} value={line.lotId ? String(line.lotId) : ""} /> },
                  { key: "serial", header: "Serial", width: "145px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before assigning a serial."} label={`Serial ${index + 1}`} onChange={(value) => patchPackLine(index, { serialId: numberValue(value) })} options={serialOptions} value={line.serialId ? String(line.serialId) : ""} /> },
                  { key: "pcid", header: "PCID", width: "145px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before assigning a PCID."} label={`PCID ${index + 1}`} onChange={(value) => patchPackLine(index, { pcidId: numberValue(value) })} options={pcidOptions} value={line.pcidId ? String(line.pcidId) : ""} /> },
                  { key: "package", header: "Package", width: "150px", render: (line, index) => <label><span>Package reference</span><input aria-label={`Package reference ${index + 1}`} disabled={!live} onChange={(event) => patchPackLine(index, { packageRef: event.target.value })} value={line.packageRef} /></label> },
                  { key: "status", header: "Status", width: "130px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before changing line status."} label={`Line status ${index + 1}`} onChange={(value) => patchPackLine(index, { status: value })} options={lineStatusOptions} value={line.status} /> },
                  { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: !live || packDraft.lines.length <= 1, label: "Remove Line", onClick: live && packDraft.lines.length > 1 ? () => removePackLine(index) : undefined, reason: !live ? "Live dispatch sign-in is required before removing lines." : packDraft.lines.length <= 1 ? "At least one pack line is required." : undefined }]} /> }
                ]}
                getRowId={(line, index) => `${line.lineNo}-${index}`}
                lines={packDraft.lines}
                onAddLine={addPackLine}
                testId="pack-line-grid"
              />
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Review saved pack-line structure, carton references, traceability, and shipment handoff."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Edit pack list", reason: "Pack-list correction requires shipment dependency checks before editing saved pack lines." }]} secondary={[{ disabled: true, label: "Print labels", reason: "Label printing is pending document workflow enablement." }, { label: "Open shipment", onClick: () => navigate(`/dispatch/shipments?packList=${encodeURIComponent(selected?.packListNo ?? "")}`) }, { label: "Open print pack", onClick: () => navigate(`/reports/print-pack?packList=${encodeURIComponent(selected?.packListNo ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
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
  const source = records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");

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
  { key: "qty", header: "Ship / Delivered / Short / Damage", width: "18%", render: (record) => `${record.shippedQuantity} / ${record.deliveredQuantity} / ${record.shortQuantity} / ${record.damagedQuantity}` },
  { key: "source", header: "Source", width: "18%", render: (record) => <div><strong>{record.salesOrderLabel}</strong><div className="muted">{record.sourceReferenceLabel}</div></div> },
  { key: "commercial", header: "Commercial snapshot", width: "18%", render: (record) => <div>{record.commercialSnapshotLabel}<div className="muted">{record.revisionLabel}</div></div> },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

interface ShipmentProofLineDraft {
  shipmentLineId: number;
  lineNo: number;
  itemLabel: string;
  shippedQuantity: number;
  deliveredQuantity: number;
  shortQuantity: number;
  damagedQuantity: number;
}

interface ShipmentProofDraft {
  vehicleRef: string;
  trackingRef: string;
  sealNo: string;
  proofNotes: string;
  podReceivedBy: string;
  podReceiverContact: string;
  podReceivedOn: string;
  podEvidenceAttachmentId: number | null;
  podRemarks: string;
  status: string;
  loadedOn: string;
  deliveredOn: string;
  lines: ShipmentProofLineDraft[];
}

function toDateTimeLocalValue(value: string | null | undefined) {
  return value?.trim() ? value.slice(0, 16) : "";
}

function buildShipmentProofDraft(record: ShipmentItem): ShipmentProofDraft {
  return {
    vehicleRef: record.vehicleRef === "Vehicle pending" ? "" : record.vehicleRef,
    trackingRef: record.trackingRef === "Tracking pending" ? "" : record.trackingRef,
    sealNo: record.sealNo === "Seal pending" ? "" : record.sealNo,
    proofNotes: record.proofNotes === "Proof pending" ? "" : record.proofNotes,
    podReceivedBy: record.podReceivedBy,
    podReceiverContact: record.podReceiverContact,
    podReceivedOn: record.podReceivedLabel === "Open" ? "" : record.podReceivedLabel.replace(" ", "T"),
    podEvidenceAttachmentId: record.podEvidenceAttachmentId,
    podRemarks: record.podRemarks,
    status: record.status,
    loadedOn: record.loadedLabel === "Open" ? "" : record.loadedLabel.replace(" ", "T"),
    deliveredOn: record.deliveredLabel === "Open" ? "" : record.deliveredLabel.replace(" ", "T"),
    lines: record.lines.map((line) => ({
      shipmentLineId: line.shipmentLineId,
      lineNo: line.lineNo,
      itemLabel: line.itemLabel,
      shippedQuantity: line.shippedQuantity,
      deliveredQuantity: line.deliveredQuantity || line.shippedQuantity,
      shortQuantity: line.shortQuantity,
      damagedQuantity: line.damagedQuantity
    }))
  };
}

function buildShipmentProofRequest(proofDraft: ShipmentProofDraft, status?: string): ShipmentProofRequest {
  return {
    vehicleRef: proofDraft.vehicleRef || null,
    trackingRef: proofDraft.trackingRef || null,
    sealNo: proofDraft.sealNo || null,
    proofNotes: proofDraft.proofNotes || null,
    status: status ?? proofDraft.status,
    podReceivedBy: proofDraft.podReceivedBy || null,
    podReceiverContact: proofDraft.podReceiverContact || null,
    podReceivedOn: proofDraft.podReceivedOn || proofDraft.deliveredOn || null,
    podEvidenceAttachmentId: proofDraft.podEvidenceAttachmentId,
    podRemarks: proofDraft.podRemarks || null,
    loadedOn: proofDraft.loadedOn || null,
    deliveredOn: proofDraft.deliveredOn || null,
    lines: proofDraft.lines.map((line) => ({
      shipmentLineId: line.shipmentLineId,
      deliveredQuantity: line.deliveredQuantity,
      shortQuantity: line.shortQuantity,
      damagedQuantity: line.damagedQuantity
    }))
  };
}

export function ShipmentDeliveryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shipmentDraft, setShipmentDraft] = useState<ShipmentDraft | null>(null);
  const [proofFiles, setProofFiles] = useState<Record<string, string>>({});
  const [proofDraft, setProofDraft] = useState<ShipmentProofDraft | null>(null);
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const [proofTone, setProofTone] = useState<"success" | "warn" | "danger" | "info">("info");
  const { deferredSearch, filter } = useDispatchFilter(search, status);
  const query = useApiQuery(
    queryKeys.dispatch.shipments(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listShipments(session, filter),
    { staleTime: 60_000 }
  );
  const packListQuery = useApiQuery(queryKeys.dispatch.packLists(companyId, branchId, "", "Packed"), () => apiClient.dispatch.packLists({ companyId, branchId, status: "Packed" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const customers = useApiQuery(queryKeys.partners.customers(companyId, branchId, "", "Active"), () => apiClient.partners.customers({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const warehouses = useApiQuery(queryKeys.organization.warehouses(companyId, branchId, "", "Active"), () => apiClient.organization.warehouses({ companyId, branchId, status: "Active" }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const uoms = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => apiClient.measurements.uoms({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const bins = useApiQuery(["inventory", "shipment", "valid-bins", companyId, branchId], () => apiClient.inventory.validBins({ companyId, branchId }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const lots = useApiQuery(["inventory", "shipment", "valid-lots", companyId, branchId], () => apiClient.inventory.validLots({ companyId, branchId }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const serials = useApiQuery(["inventory", "shipment", "valid-serials", companyId, branchId], () => apiClient.inventory.validSerials({ companyId, branchId }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const pcids = useApiQuery(["inventory", "shipment", "valid-pcids", companyId, branchId], () => apiClient.inventory.validPcids({ companyId, branchId }), { enabled: live && companyId > 0 && branchId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const requestedShipment = searchParams.get("shipment") ?? searchParams.get("packList");
  const packListOptions = entityOptions(packListQuery.data?.items, (pack) => pack.id, (pack) => pack.packListNo);
  const customerOptions = entityOptions(customers.data?.items, (customer) => customer.id, (customer) => `${customer.customerCode} / ${customer.customerName}`);
  const itemOptions = entityOptions(itemLookup.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const warehouseOptions = entityOptions(warehouses.data?.items, (warehouse) => warehouse.id, (warehouse) => `${warehouse.warehouseCode} / ${warehouse.warehouseName}`);
  const uomOptions = entityOptions(uoms.data?.items, (uom) => uom.id, (uom) => `${uom.uomCode} / ${uom.uomName}`);
  const binOptions = dimensionOptions(bins.data);
  const lotOptions = dimensionOptions(lots.data);
  const serialOptions = dimensionOptions(serials.data);
  const pcidOptions = dimensionOptions(pcids.data);
  const shipmentErrors = shipmentDraftErrors(shipmentDraft);

  useEffect(() => {
    if (!requestedShipment || records.length === 0) {
      return;
    }

    const normalized = requestedShipment.toLowerCase();
    const match = records.find(
      (record) =>
        record.shipmentNo.toLowerCase() === normalized ||
        record.shipmentNo.toLowerCase().includes(normalized) ||
        record.packListLabel.toLowerCase() === normalized ||
        record.packListLabel.toLowerCase().includes(normalized)
    );

    if (match) {
      setSelectedId(match.id);
    }
  }, [records, requestedShipment]);

  useEffect(() => {
    setProofDraft(selected ? buildShipmentProofDraft(selected) : null);
    setProofMessage(null);
  }, [selected?.id]);

  const proofSave = useApiMutation(
    async (_: void) => {
      if (!selected || !proofDraft) {
        throw new Error("Select a shipment before saving proof status.");
      }

      return apiClient.dispatch.updateShipmentProof(selected.shipmentId, buildShipmentProofRequest(proofDraft));
    },
    {
      onSuccess: async () => {
        setProofTone("success");
        setProofMessage("Shipment proof status saved.");
        await query.refetch();
      },
      onError: (error) => {
        setProofTone("danger");
        setProofMessage(error.message);
      }
    }
  );
  const saveShipment = useApiMutation((request: ShipmentUpsertRequest) => apiClient.dispatch.createShipment(request), {
    onSuccess: async (record) => {
      setProofTone("success");
      setProofMessage(`Saved shipment ${record.shipmentNo}.`);
      setShipmentDraft(null);
      await query.refetch();
    },
    onError: (error) => {
      setProofTone("danger");
      setProofMessage(error.message);
    }
  });
  const closeShipment = useApiMutation(
    async (_: void) => {
      if (!selected || !proofDraft) {
        throw new Error("Select a shipment before closing it.");
      }

      const closedDraft = {
        ...proofDraft,
        deliveredOn: proofDraft.deliveredOn || new Date().toISOString(),
        podReceivedOn: proofDraft.podReceivedOn || proofDraft.deliveredOn || new Date().toISOString()
      };
      return apiClient.dispatch.updateShipmentProof(selected.shipmentId, buildShipmentProofRequest(closedDraft, "Closed"));
    },
    {
      onSuccess: async () => {
        setProofTone("success");
        setProofMessage("Shipment closed with delivery proof.");
        await query.refetch();
      },
      onError: (error) => {
        setProofTone("danger");
        setProofMessage(error.message);
      }
    }
  );

  const proofSaveReason = !selected
    ? "Select a shipment before saving proof status."
    : selected.source !== "Live"
      ? "Proof status save requires a live shipment record."
      : !proofDraft?.status
        ? "Select a shipment status before saving proof."
        : proofSave.isPending
          ? "Shipment proof save is in progress."
          : undefined;
  const saveShipmentReason = !shipmentDraft
    ? "Open a shipment draft before saving."
    : !live
      ? "Live dispatch sign-in is required before saving shipments."
      : shipmentErrors.length > 0
        ? "Resolve shipment validation issues before saving."
        : saveShipment.isPending
          ? "Shipment save is in progress."
          : undefined;
  const closeShipmentReason = !selected
    ? "Select a shipment before closing it."
    : selected.source !== "Live"
      ? "Shipment close requires a live shipment record."
      : selected.status.toLowerCase().includes("closed")
        ? "Shipment is already closed."
        : !proofDraft?.vehicleRef || !proofDraft.trackingRef || !proofDraft.sealNo || !proofDraft.proofNotes || !proofDraft.podReceivedBy || !proofDraft.podReceiverContact
          ? "Vehicle, tracking, seal, proof notes, receiver, and receiver contact are required before closing."
          : closeShipment.isPending
            ? "Shipment close is in progress."
            : undefined;

  const updateProofDraft = (patch: Partial<ShipmentProofDraft>) => {
    setProofDraft((current) => current ? { ...current, ...patch } : current);
  };

  const patchProofLine = (index: number, patch: Partial<ShipmentProofLineDraft>) => {
    setProofDraft((current) =>
      current ? { ...current, lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)) } : current
    );
  };

  const patchShipmentLine = (index: number, patch: Partial<DispatchLineDraft>) => {
    setShipmentDraft((current) =>
      current ? { ...current, lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)) } : current
    );
  };

  const addShipmentLine = () => {
    setShipmentDraft((current) => current ? { ...current, lines: [...current.lines, buildDispatchLine((current.lines.length + 1) * 10, "Loaded")] } : current);
  };

  const removeShipmentLine = (index: number) => {
    setShipmentDraft((current) => current ? { ...current, lines: renumberDispatchLines(current.lines.filter((_, lineIndex) => lineIndex !== index)) } : current);
  };

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
      onError: (error) => {
        setProofTone("danger");
        setProofMessage(error.message);
      },
      onSuccess: (attachment, variables) => {
        setProofTone("success");
        setProofFiles((current) => ({ ...current, [variables.shipment.id]: attachment.fileName }));
        setProofDraft((current) => current ? { ...current, podEvidenceAttachmentId: attachment.id } : current);
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
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "Prepare shipment", onClick: () => { setProofMessage(null); setShipmentDraft(buildShipmentDraft()); } }]} secondary={[{ disabled: true, label: "Export documents", reason: "Shipment document export is pending the approved reporting workflow." }]} testId="shipment-action-bar" /></>}
        description="Vehicle, LR/tracking, loading proof, seal, and delivery status review."
        filters={<FilterBar><input aria-label="Search shipments" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search shipment, customer, vehicle" value={search} /><select aria-label="Shipment status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Loading">Loading</option><option value="Dispatched">Dispatched</option><option value="Delivered">Delivered</option></select></FilterBar>}
        title="Shipment / Delivery"
      >
      {query.error ? <Card title="Live shipment data unavailable" description={query.error.message} /> : null}
      {proofMessage && !selected ? <Badge tone={proofTone}>{proofMessage}</Badge> : null}
      <KpiStrip items={[{ label: "Shipments", value: String(records.length) }, { label: "Shipped qty", value: String(records.reduce((total, record) => total + record.shippedQuantity, 0)) }, { label: "Open proof", value: String(records.filter((record) => record.proofNotes.toLowerCase().includes("pending")).length) }, { label: "Readiness", value: source === "Live" ? "Current" : source === "Deferred" ? "Planned" : "Reference" }]} />
        <Card title="Shipment register" description="Loading proof is shown as review state alongside shipment status.">
          <DataGrid ariaLabel="Shipment table" columns={shipmentColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.shipmentNo} shipment`} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Prepare a shipment with customer, pack-list, vehicle, tracking, seal, proof, line, and traceability fields."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveShipmentReason), label: saveShipment.isPending ? "Saving shipment" : "Save shipment", onClick: shipmentDraft && !saveShipmentReason ? () => saveShipment.mutate(buildShipmentRequest(shipmentDraft, companyId, branchId)) : undefined, reason: saveShipmentReason }]} secondary={[{ disabled: !live, label: "Add Line", onClick: live ? addShipmentLine : undefined, reason: live ? undefined : "Live dispatch sign-in is required before adding shipment lines." }]} utility={[{ label: "Close", onClick: () => setShipmentDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(shipmentDraft)}
        onClose={() => setShipmentDraft(null)}
        title={shipmentDraft?.shipmentNo ?? "Shipment draft"}
        validation={<ErpValidationSummary errors={shipmentErrors} />}
      >
        {shipmentDraft ? (
          <div className="modal-form-grid">
            <FormShell initialFingerprint={`${shipmentDraft.shipmentNo}-header`} title="Shipment controls">
              <label><span>Shipment number</span><input aria-label="Shipment number" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, shipmentNo: event.target.value })} value={shipmentDraft.shipmentNo} /></label>
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before selecting a customer."} label="Customer" onChange={(value) => setShipmentDraft({ ...shipmentDraft, customerId: numberValue(value) })} options={customerOptions} required value={shipmentDraft.customerId ? String(shipmentDraft.customerId) : ""} />
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before selecting a pack list."} label="Pack list" onChange={(value) => setShipmentDraft({ ...shipmentDraft, packListId: numberValue(value) })} options={[{ label: "Direct shipment", value: "" }, ...packListOptions]} value={shipmentDraft.packListId ? String(shipmentDraft.packListId) : ""} />
              <label><span>Dispatch date</span><input aria-label="Dispatch date" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, dispatchDate: event.target.value })} type="date" value={shipmentDraft.dispatchDate} /></label>
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before changing shipment status."} label="Shipment status" onChange={(value) => setShipmentDraft({ ...shipmentDraft, status: value })} options={shipmentStatusOptions} value={shipmentDraft.status} />
              <label><span>Vehicle</span><input aria-label="Draft vehicle" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, vehicleRef: event.target.value })} value={shipmentDraft.vehicleRef} /></label>
              <label><span>Tracking / LR</span><input aria-label="Draft tracking LR" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, trackingRef: event.target.value })} value={shipmentDraft.trackingRef} /></label>
              <label><span>Seal number</span><input aria-label="Draft seal number" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, sealNo: event.target.value })} value={shipmentDraft.sealNo} /></label>
              <label><span>Transporter / carrier</span><input aria-label="Transporter carrier" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, transporterName: event.target.value })} value={shipmentDraft.transporterName} /></label>
              <label><span>Driver</span><input aria-label="Driver name" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, driverName: event.target.value })} value={shipmentDraft.driverName} /></label>
              <label><span>Driver contact</span><input aria-label="Driver contact" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, driverContact: event.target.value })} value={shipmentDraft.driverContact} /></label>
              <label className="form-span-2"><span>Delivery address snapshot</span><input aria-label="Delivery address snapshot" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, deliveryAddressSnapshot: event.target.value })} value={shipmentDraft.deliveryAddressSnapshot} /></label>
              <label className="form-span-2"><span>Proof notes</span><input aria-label="Draft proof notes" disabled={!live} onChange={(event) => setShipmentDraft({ ...shipmentDraft, proofNotes: event.target.value })} value={shipmentDraft.proofNotes} /></label>
            </FormShell>
            <Card title="Shipment lines" description="Add every shipped item and trace reference. Saving posts inventory issue transactions for the shipment lines.">
              <ErpTransactionLineGrid
                addDisabled={!live}
                addDisabledReason="Live dispatch sign-in is required before adding shipment lines."
                addLabel="Add Line"
                ariaLabel="Shipment line grid"
                columns={[
                  { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                  { key: "item", header: "Item", width: "180px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before selecting an item."} label={`Item ${index + 1}`} onChange={(value) => patchShipmentLine(index, { itemId: numberValue(value) })} options={itemOptions} required value={line.itemId ? String(line.itemId) : ""} /> },
                  { key: "warehouse", header: "Warehouse", width: "160px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before selecting a warehouse."} label={`Warehouse ${index + 1}`} onChange={(value) => patchShipmentLine(index, { warehouseId: numberValue(value) })} options={warehouseOptions} required value={line.warehouseId ? String(line.warehouseId) : ""} /> },
                  { key: "uom", header: "UOM", width: "140px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before selecting a UOM."} label={`Ship UOM ${index + 1}`} onChange={(value) => patchShipmentLine(index, { uomId: numberValue(value) })} options={uomOptions} required value={line.uomId ? String(line.uomId) : ""} /> },
                  { key: "qty", header: "Shipped qty", width: "125px", render: (line, index) => <ErpNumberField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before changing shipped quantity."} label={`Shipped quantity ${index + 1}`} min={0.001} onChange={(value) => patchShipmentLine(index, { quantity: value ?? 0 })} value={line.quantity} /> },
                  { key: "bin", header: "Bin", width: "145px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before assigning a bin."} label={`Bin ${index + 1}`} onChange={(value) => patchShipmentLine(index, { binId: numberValue(value) })} options={binOptions} value={line.binId ? String(line.binId) : ""} /> },
                  { key: "lot", header: "Lot", width: "145px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before assigning a lot."} label={`Lot ${index + 1}`} onChange={(value) => patchShipmentLine(index, { lotId: numberValue(value) })} options={lotOptions} value={line.lotId ? String(line.lotId) : ""} /> },
                  { key: "serial", header: "Serial", width: "145px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before assigning a serial."} label={`Serial ${index + 1}`} onChange={(value) => patchShipmentLine(index, { serialId: numberValue(value) })} options={serialOptions} value={line.serialId ? String(line.serialId) : ""} /> },
                  { key: "pcid", header: "PCID", width: "145px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before assigning a PCID."} label={`PCID ${index + 1}`} onChange={(value) => patchShipmentLine(index, { pcidId: numberValue(value) })} options={pcidOptions} value={line.pcidId ? String(line.pcidId) : ""} /> },
                  { key: "status", header: "Status", width: "130px", render: (line, index) => <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live dispatch sign-in is required before changing line status."} label={`Line status ${index + 1}`} onChange={(value) => patchShipmentLine(index, { status: value })} options={lineStatusOptions} value={line.status} /> },
                  { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: !live || shipmentDraft.lines.length <= 1, label: "Remove Line", onClick: live && shipmentDraft.lines.length > 1 ? () => removeShipmentLine(index) : undefined, reason: !live ? "Live dispatch sign-in is required before removing lines." : shipmentDraft.lines.length <= 1 ? "At least one shipment line is required." : undefined }]} /> }
                ]}
                getRowId={(line, index) => `${line.lineNo}-${index}`}
                lines={shipmentDraft.lines}
                onAddLine={addShipmentLine}
                testId="shipment-line-grid"
              />
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Shipment detail supports live proof status updates, document upload, shipment closeout, and dispatch record review."
        footer={<ErpActionBar primary={[{ disabled: Boolean(proofSaveReason), label: proofSave.isPending ? "Saving proof status" : "Save proof status", onClick: proofSaveReason ? undefined : () => proofSave.mutate(undefined), reason: proofSaveReason }, { disabled: Boolean(closeShipmentReason), label: closeShipment.isPending ? "Closing shipment" : "Close shipment", onClick: closeShipmentReason ? undefined : () => closeShipment.mutate(undefined), reason: closeShipmentReason }]} secondary={[{ disabled: true, label: "Export documents", reason: "Shipment document export is pending the approved reporting workflow." }, { label: "Open pack list", onClick: () => navigate(`/dispatch/pack-lists?packList=${encodeURIComponent(selected?.packListLabel ?? "")}`) }, { label: "Open print pack", onClick: () => navigate(`/reports/print-pack?shipment=${encodeURIComponent(selected?.shipmentNo ?? "")}`) }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        statusMeta={proofMessage ? <Badge tone={proofTone}>{proofMessage}</Badge> : null}
        title={selected?.shipmentNo ?? "Shipment"}
      >
        {selected ? (
          <>
            <KpiStrip items={[{ label: "Seal", value: selected.sealNo }, { label: "Carrier", value: selected.transporterName }, { label: "Loaded", value: selected.loadedLabel }, { label: "POD", value: selected.podReceivedLabel }]} />
            <Card title="Shipment lines" description={selected.proofNotes}>
              <DataGrid ariaLabel="Shipment lines" columns={shipmentLineColumns} getRowId={(record) => record.id} records={selected.lines} rowLabel={(record) => `${record.itemLabel} shipment line`} />
            </Card>
            <FormShell initialFingerprint={selected.id} title="Shipment controls">
              <label><span>Vehicle</span><input disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ vehicleRef: event.target.value })} value={proofDraft?.vehicleRef ?? ""} /></label>
              <ErpLookupField disabled disabledReason="Pack list is controlled by dispatch planning." label="Pack list" onChange={() => undefined} options={[{ label: selected.packListLabel, value: selected.packListLabel }]} value={selected.packListLabel} />
              <ErpNumberField disabled disabledReason="Shipped quantity is controlled by shipment line posting." label="Shipped quantity" onChange={() => undefined} value={selected.shippedQuantity} />
              <label><span>Transporter / carrier</span><input disabled value={selected.transporterName} /></label>
              <label><span>Driver</span><input disabled value={selected.driverName} /></label>
              <label><span>Driver contact</span><input disabled value={selected.driverContact} /></label>
              <label className="form-span-2"><span>Delivery address snapshot</span><input disabled value={selected.deliveryAddressSnapshot} /></label>
              <label><span>Tracking / LR</span><input disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ trackingRef: event.target.value })} value={proofDraft?.trackingRef ?? ""} /></label>
              <label><span>Seal number</span><input disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ sealNo: event.target.value })} value={proofDraft?.sealNo ?? ""} /></label>
              <ErpLookupField disabled={!proofDraft || selected.source !== "Live"} disabledReason={selected.source !== "Live" ? "Live shipment record is required before changing shipment status." : undefined} label="Shipment status" onChange={(value) => updateProofDraft({ status: value })} options={[{ label: "Loading", value: "Loading" }, { label: "Dispatched", value: "Dispatched" }, { label: "Delivered", value: "Delivered" }, { label: "Closed", value: "Closed" }]} value={proofDraft?.status ?? selected.status} />
              <label><span>Loaded on</span><input disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ loadedOn: event.target.value })} type="datetime-local" value={toDateTimeLocalValue(proofDraft?.loadedOn)} /></label>
              <label><span>Delivered on</span><input disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ deliveredOn: event.target.value })} type="datetime-local" value={toDateTimeLocalValue(proofDraft?.deliveredOn)} /></label>
              <label><span>Received by</span><input aria-label="POD received by" disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ podReceivedBy: event.target.value })} value={proofDraft?.podReceivedBy ?? ""} /></label>
              <label><span>Receiver contact</span><input aria-label="POD receiver contact" disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ podReceiverContact: event.target.value })} value={proofDraft?.podReceiverContact ?? ""} /></label>
              <label><span>POD received on</span><input aria-label="POD received on" disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ podReceivedOn: event.target.value })} type="datetime-local" value={toDateTimeLocalValue(proofDraft?.podReceivedOn)} /></label>
              <ErpNumberField disabled={!proofDraft || selected.source !== "Live"} disabledReason={selected.source !== "Live" ? "Live shipment record is required before updating POD evidence." : undefined} label="POD evidence attachment id" min={1} onChange={(value) => updateProofDraft({ podEvidenceAttachmentId: value })} value={proofDraft?.podEvidenceAttachmentId ?? null} />
              <label className="form-span-2"><span>Proof notes</span><input disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ proofNotes: event.target.value })} value={proofDraft?.proofNotes ?? ""} /></label>
              <label className="form-span-2"><span>POD remarks</span><input aria-label="POD remarks" disabled={!proofDraft || selected.source !== "Live"} onChange={(event) => updateProofDraft({ podRemarks: event.target.value })} value={proofDraft?.podRemarks ?? ""} /></label>
            </FormShell>
            <UdfRuntimePanel
              disabledReason={selected.source !== "Live" ? "Live shipment record is required before entering governed custom fields." : undefined}
              entityId={selected.shipmentId}
              entityType="Shipment"
              readOnly={selected.status === "Closed"}
              screenKey="dispatch.shipments"
              title="Shipment custom fields"
            />
            <Card title="POD line confirmation" description="Confirm delivered, short, and damaged quantities without changing SO commercial values.">
              <ErpTransactionLineGrid
                ariaLabel="POD line confirmation grid"
                columns={[
                  { key: "line", header: "Line", width: "72px", render: (line) => line.lineNo },
                  { key: "item", header: "Item", width: "220px", render: (line) => <strong>{line.itemLabel}</strong> },
                  { key: "shipped", header: "Shipped", width: "110px", render: (line) => line.shippedQuantity },
                  { key: "delivered", header: "Delivered", width: "140px", render: (line, index) => <ErpNumberField disabled={!proofDraft || selected.source !== "Live"} disabledReason={selected.source !== "Live" ? "Live shipment record is required before confirming POD lines." : undefined} label={`Delivered quantity ${index + 1}`} min={0} onChange={(value) => patchProofLine(index, { deliveredQuantity: value ?? 0 })} value={line.deliveredQuantity} /> },
                  { key: "short", header: "Short", width: "140px", render: (line, index) => <ErpNumberField disabled={!proofDraft || selected.source !== "Live"} disabledReason={selected.source !== "Live" ? "Live shipment record is required before confirming POD shortages." : undefined} label={`Short quantity ${index + 1}`} min={0} onChange={(value) => patchProofLine(index, { shortQuantity: value ?? 0 })} value={line.shortQuantity} /> },
                  { key: "damaged", header: "Damaged", width: "140px", render: (line, index) => <ErpNumberField disabled={!proofDraft || selected.source !== "Live"} disabledReason={selected.source !== "Live" ? "Live shipment record is required before confirming POD damage." : undefined} label={`Damaged quantity ${index + 1}`} min={0} onChange={(value) => patchProofLine(index, { damagedQuantity: value ?? 0 })} value={line.damagedQuantity} /> }
                ]}
                getRowId={(line) => `pod-${line.shipmentLineId}`}
                lines={proofDraft?.lines ?? []}
                testId="pod-line-confirmation-grid"
              />
            </Card>
            <Card title="Proof documents" description="Loading and delivery proof files are linked to the shipment audit record.">
              <ErpFileActionState
                accept=".pdf,.png,.jpg,.jpeg"
                disabledReason={proofDisabledReason}
                enabled={!proofDisabledReason}
                fileName={proofFiles[selected.id]}
                label="Load proof"
                onFileSelect={handleProofSelect}
              />
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
