import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type { ItemMasterProfileUpsertRequest, ItemUpsertRequest } from "../api/contracts";
import { ApiError } from "../api/http";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  buildMasterFilter,
  canPersistMasterData,
  createItemMasterDraft,
  listBarcodeSetup,
  listItemAttributeSetup,
  listItemGroupSetup,
  listItemMasterSetup,
  listItemVariantSetup,
  listReasonCodeSetup,
  updateItemMasterCore,
  updateItemMasterProfile,
  type BarcodeSetupItem,
  type ItemAttributeSetupItem,
  type ItemGroupSetupItem,
  type ItemMasterSetupItem,
  type ItemVariantSetupItem,
  type MasterDataSource,
  type ReasonCodeSetupItem
} from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import type { DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpFileActionState,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpStatusChip
} from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <ErpStatusChip tone={tone}>{source === "Live" ? "Setup complete" : "Review mode"}</ErpStatusChip>;
}

function MasterAside({
  description,
  source
}: {
  description: string;
  endpoint: string;
  source: MasterDataSource;
}) {
  return (
    <Card title="Master-data guidance" description={description}>
      <div className="notification-item">
        <strong>Master records</strong>
        <p>Item setup remains aligned with the approved master-data structure.</p>
        <div className="context-chip-row">
          <SourceBadge source={source} />
          <Badge tone="info">Setup controls</Badge>
        </div>
      </div>
    </Card>
  );
}

const itemGroupColumns: DataGridColumn<ItemGroupSetupItem>[] = [
  { key: "code", header: "Group", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Category",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.reportingBucket}</div>
      </div>
    )
  },
  { key: "profile", header: "Defaults", width: "20%", render: (record) => `${record.defaultProfile} / ${record.defaultTraceability}` },
  {
    key: "qc",
    header: "QC",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.defaultQcRequired ? "warn" : "neutral"}>{record.defaultQcRequired ? "Required" : "Optional"}</ErpStatusChip>
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const attributeColumns: DataGridColumn<ItemAttributeSetupItem>[] = [
  { key: "code", header: "Attribute", width: "18%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Allowed values",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.sampleValues}</div>
      </div>
    )
  },
  { key: "count", header: "Values", width: "12%", render: (record) => record.valueCount },
  {
    key: "variant",
    header: "Variant use",
    width: "16%",
    render: (record) => <ErpStatusChip tone={record.usedForVariants ? "info" : "neutral"}>{record.usedForVariants ? "Variant matrix" : "Reference"}</ErpStatusChip>
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const reasonColumns: DataGridColumn<ReasonCodeSetupItem>[] = [
  { key: "code", header: "Reason", width: "18%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "usage",
    header: "Usage",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.usage}</div>
      </div>
    )
  },
  { key: "module", header: "Module", width: "14%", render: (record) => record.module },
  {
    key: "severity",
    header: "Severity",
    width: "14%",
    render: (record) => (
      <ErpStatusChip tone={record.severity === "Critical" ? "danger" : record.severity === "Warning" ? "warn" : "info"}>
        {record.severity}
      </ErpStatusChip>
    )
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const itemColumns: DataGridColumn<ItemMasterSetupItem>[] = [
  {
    key: "code",
    header: "Item code",
    width: "17%",
    render: (record) => (
      <div>
        <strong>{record.code}</strong>
        <div className="muted">{record.shortName}</div>
      </div>
    )
  },
  {
    key: "name",
    header: "Item name",
    width: "22%",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.attributeSummary}</div>
      </div>
    )
  },
  { key: "type", header: "Type", width: "10%", render: (record) => record.itemType },
  { key: "group", header: "Group / category", width: "14%", render: (record) => `${record.groupLabel} / ${record.subCategory}` },
  { key: "uom", header: "UOM", width: "9%", render: (record) => record.stockUom },
  { key: "make", header: "Make / buy", width: "10%", render: (record) => record.defaultMakeType },
  {
    key: "qc",
    header: "QC",
    width: "8%",
    render: (record) => (
      <ErpStatusChip tone={record.isQcRequired ? "warn" : "neutral"}>{record.isQcRequired ? "Required" : "Optional"}</ErpStatusChip>
    )
  },
  {
    key: "catalog",
    header: "Catalog",
    width: "9%",
    render: (record) => <ErpStatusChip tone={record.catalogVisible ? "info" : "neutral"}>{record.catalogVisible ? "Visible" : "Internal"}</ErpStatusChip>
  },
  {
    key: "media",
    header: "Media / documents",
    width: "12%",
    render: (record) => (
      <div className="context-chip-row">
        <ErpStatusChip tone={record.media.length > 0 ? "info" : "neutral"}>{record.media.length} media</ErpStatusChip>
        <ErpStatusChip tone={record.documents.length > 0 ? "success" : "neutral"}>{record.documents.length} docs</ErpStatusChip>
      </div>
    )
  },
  {
    key: "status",
    header: "Active/status",
    width: "10%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const variantColumns: DataGridColumn<ItemVariantSetupItem>[] = [
  {
    key: "variant",
    header: "Variant",
    width: "28%",
    render: (record) => (
      <div>
        <strong>{record.code}</strong>
        <div className="muted">{record.name}</div>
      </div>
    )
  },
  { key: "item", header: "Item", width: "16%", render: (record) => record.itemLabel },
  { key: "attributes", header: "Attributes", render: (record) => record.attributeSummary },
  { key: "uom", header: "Overrides", width: "18%", render: (record) => `${record.overrideStockUom} / ${record.overrideWeightPerUnit}` },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const barcodeColumns: DataGridColumn<BarcodeSetupItem>[] = [
  { key: "barcode", header: "Barcode", width: "24%", render: (record) => <strong>{record.barcodeValue}</strong> },
  { key: "item", header: "Item / Variant", render: (record) => `${record.itemLabel} / ${record.variantLabel}` },
  { key: "type", header: "Type", width: "14%", render: (record) => record.barcodeType },
  { key: "purpose", header: "Scan purpose", width: "16%", render: (record) => record.scanPurpose },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

function useCommonFilter() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, undefined, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.companyId]
  );

  return { deferredSearch, filter, search, setSearch, setStatus, status, user };
}

function CommonFilters({
  ariaLabel,
  placeholder,
  onClear,
  search,
  setSearch,
  setStatus,
  status
}: {
  ariaLabel: string;
  placeholder: string;
  onClear?: () => void;
  search: string;
  setSearch: (value: string) => void;
  setStatus: (value: string) => void;
  status: string;
}) {
  return (
    <ErpFilterBar ariaLabel={`${ariaLabel} filters`} onClear={onClear}>
      <input
        aria-label={ariaLabel}
        onChange={(event) => startTransition(() => setSearch(event.target.value))}
        placeholder={placeholder}
        value={search}
      />
      <select aria-label={`${ariaLabel} status`} onChange={(event) => setStatus(event.target.value)} value={status}>
        <option value="all">Status: Any</option>
        <option value="Active">Active</option>
        <option value="Draft">Draft</option>
      </select>
    </ErpFilterBar>
  );
}

function MasterPageActionBar({
  exportLabel,
  primaryLabel,
  testId
}: {
  exportLabel: string;
  primaryLabel: string;
  testId?: string;
}) {
  return (
    <ErpActionBar
      primary={[{ disabled: true, label: primaryLabel, reason: "Draft creation is controlled by the master-data rollout." }]}
      secondary={[{ disabled: true, label: exportLabel, reason: "Export is pending the governed export workflow." }]}
      testId={testId}
    />
  );
}

function MasterModalFooter({
  closeLabel = "Close",
  onClose,
  reviewLabel = "Review audit",
  saveLabel
}: {
  closeLabel?: string;
  onClose: () => void;
  reviewLabel?: string;
  saveLabel: string;
}) {
  return (
    <ErpActionBar
      primary={[{ disabled: true, label: saveLabel, reason: "Save is not enabled for this setup workflow yet." }]}
      secondary={[{ disabled: true, label: reviewLabel, reason: "Review workflow is pending rollout." }]}
      utility={[{ label: closeLabel, onClick: onClose, variant: "quiet" }]}
    />
  );
}

export function ItemGroupMasterPage() {
  const { deferredSearch, filter, search, setSearch, setStatus, status, user } = useCommonFilter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useApiQuery(
    queryKeys.masters.itemGroups(user?.activeContext.companyId, deferredSearch, status),
    () => listItemGroupSetup(filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source="Deferred" />
            <MasterPageActionBar exportLabel="Export groups" primaryLabel="New item group draft" testId="item-group-action-bar" />
          </>
        }
        aside={
          <MasterAside
            description="Use item groups to review catalogue structure before activating item records."
            endpoint="Deferred: item group API"
            source="Deferred"
          />
        }
        description="Category taxonomy, default measurement behavior, traceability defaults, and reporting buckets."
        filters={
          <CommonFilters
            ariaLabel="Search item groups"
            placeholder="Search group, defaults, reporting bucket"
            search={search}
            setSearch={setSearch}
            setStatus={setStatus}
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            status={status}
          />
        }
        title="Item Group / Category Master"
      >
        <KpiStrip
          items={[
            { label: "Groups", value: String(records.length) },
            { label: "QC defaults", value: String(records.filter((record) => record.defaultQcRequired).length) },
            { label: "Trace modes", value: String(new Set(records.map((record) => record.defaultTraceability)).size) },
            { label: "Readiness", value: "Planned" }
          ]}
        />
        <Card title="Category registry" description="Taxonomy and defaults for item master cutover review.">
          <ErpGrid
            ariaLabel="Item group registry"
            columns={itemGroupColumns}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} item group`}
            testId="item-group-grid"
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Item group detail keeps classification defaults visible without changing item activation behavior."
        footer={<MasterModalFooter onClose={() => setSelectedId(null)} saveLabel="Save item group draft" />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Item group detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Item group setup">
            <label>
              <span>Group code</span>
              <input defaultValue={selected.code} />
            </label>
            <label>
              <span>Default profile</span>
              <input defaultValue={selected.defaultProfile} />
            </label>
            <label>
              <span>Reporting bucket</span>
              <input defaultValue={selected.reportingBucket} />
            </label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function ItemAttributeMasterPage() {
  const { deferredSearch, filter, search, setSearch, setStatus, status, user } = useCommonFilter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useApiQuery(
    queryKeys.masters.itemAttributes(user?.activeContext.companyId, deferredSearch, status),
    () => listItemAttributeSetup(filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source="Deferred" />
            <MasterPageActionBar exportLabel="Export attributes" primaryLabel="New attribute draft" testId="item-attribute-action-bar" />
          </>
        }
        aside={
          <MasterAside
            description="Use attributes to organize item specifications and comparison filters."
            endpoint="Deferred: item attribute API"
            source="Deferred"
          />
        }
        description="Variant-driving item attributes such as size, grade, color, thickness, GSM, and finish."
        filters={
          <CommonFilters
            ariaLabel="Search item attributes"
            placeholder="Search attribute, values, variant use"
            search={search}
            setSearch={setSearch}
            setStatus={setStatus}
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            status={status}
          />
        }
        title="Item Attribute Master"
      >
        <KpiStrip
          items={[
            { label: "Attributes", value: String(records.length) },
            { label: "Variant drivers", value: String(records.filter((record) => record.usedForVariants).length) },
            { label: "Values", value: String(records.reduce((sum, record) => sum + record.valueCount, 0)) },
            { label: "Readiness", value: "Planned" }
          ]}
        />
        <Card title="Attribute registry" description="Allowed values and variant-matrix readiness.">
          <ErpGrid
            ariaLabel="Item attribute registry"
            columns={attributeColumns}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} item attribute`}
            testId="item-attribute-grid"
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Attribute detail keeps variant-driving values governed by the master-data process."
        footer={<MasterModalFooter onClose={() => setSelectedId(null)} saveLabel="Save attribute draft" />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Attribute detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Attribute setup">
            <label>
              <span>Attribute code</span>
              <input defaultValue={selected.code} />
            </label>
            <label>
              <span>Sample values</span>
              <textarea defaultValue={selected.sampleValues} rows={3} />
            </label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function ReasonCodeRulesPage() {
  const { deferredSearch, filter, search, setSearch, setStatus, status, user } = useCommonFilter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useApiQuery(
    queryKeys.masters.reasonCodes(user?.activeContext.companyId, deferredSearch, status),
    () => listReasonCodeSetup(filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source="Deferred" />
            <MasterPageActionBar exportLabel="Export reasons" primaryLabel="New reason draft" testId="reason-code-action-bar" />
          </>
        }
        aside={
          <MasterAside
            description="Reason-code references support production, quality, and escalation review."
            endpoint="Deferred: reason-code API"
            source="Deferred"
          />
        }
        description="Pause, downtime, scrap, hold, reject, and escalation reason rules."
        filters={
          <CommonFilters
            ariaLabel="Search reason codes"
            placeholder="Search reason, module, usage"
            search={search}
            setSearch={setSearch}
            setStatus={setStatus}
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            status={status}
          />
        }
        title="Reason Codes & Status Rules"
      >
        <KpiStrip
          items={[
            { label: "Reasons", value: String(records.length) },
            { label: "Critical", value: String(records.filter((record) => record.severity === "Critical").length) },
            { label: "Require remarks", value: String(records.filter((record) => record.requiresRemarks).length) },
            { label: "Modules", value: String(new Set(records.map((record) => record.module)).size) }
          ]}
        />
        <Card title="Reason-code registry" description="Status and reason controls for production, QC, and escalation flows.">
          <ErpGrid
            ariaLabel="Reason-code registry"
            columns={reasonColumns}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} reason code`}
            testId="reason-code-grid"
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Reason-code detail keeps controlled usage and severity visible for production, QC, and escalation flows."
        footer={<MasterModalFooter onClose={() => setSelectedId(null)} saveLabel="Save reason draft" />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Reason detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Reason-code setup">
            <label>
              <span>Reason code</span>
              <input defaultValue={selected.code} />
            </label>
            <label>
              <span>Usage</span>
              <textarea defaultValue={selected.usage} rows={3} />
            </label>
            <ErpLookupField
              label="Reason code category/type"
              onChange={() => undefined}
              options={uniqueOptions(records, (record) => record.module).map((option) => ({ label: option, value: option }))}
              value={selected.module}
            />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

const itemDetailTabs = [
  "Core Info",
  "Classification",
  "Images & Media",
  "Catalog",
  "UOM & Conversions",
  "Packaging",
  "Physical Specs",
  "Barcode & Labels",
  "Variants/Templates",
  "Manufacturing",
  "Planning/Replenishment",
  "Inventory/Warehouse Policy",
  "Quality/Traceability",
  "Sales/Commercial",
  "Purchase/Vendor",
  "Customer References",
  "Attachments/Documents",
  "Audit/History"
] as const;

type ItemDetailTab = (typeof itemDetailTabs)[number];

const itemDetailGroups: Array<{ label: string; tabs: ItemDetailTab[] }> = [
  { label: "Identity", tabs: ["Core Info", "Classification"] },
  { label: "Media & Catalog", tabs: ["Images & Media", "Catalog"] },
  {
    label: "Measurement & Packaging",
    tabs: ["UOM & Conversions", "Packaging", "Physical Specs", "Barcode & Labels", "Variants/Templates"]
  },
  {
    label: "Operations",
    tabs: ["Manufacturing", "Planning/Replenishment", "Inventory/Warehouse Policy", "Quality/Traceability"]
  },
  { label: "Commercial", tabs: ["Sales/Commercial", "Purchase/Vendor"] },
  { label: "References", tabs: ["Customer References", "Attachments/Documents"] },
  { label: "Governance", tabs: ["Audit/History"] }
];

function cleanString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function numericValue(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) {
    return null;
  }

  const normalized = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function integerValue(value: string | number | null | undefined) {
  const parsed = numericValue(value);
  return parsed === null ? null : Math.round(parsed);
}

function splitDrawingRevision(value: string) {
  const [drawingNo, revisionCode] = value.split("/").map((entry) => entry.trim());
  return {
    drawingNo: cleanString(drawingNo ?? ""),
    revisionCode: cleanString(revisionCode ?? "")
  };
}

function splitEffectiveDates(value: string) {
  const [effectiveFrom, effectiveTo] = value.split(" to ").map((entry) => entry.trim());
  return {
    effectiveFrom: /^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom ?? "") ? effectiveFrom : null,
    effectiveTo: /^\d{4}-\d{2}-\d{2}$/.test(effectiveTo ?? "") ? effectiveTo : null
  };
}

function validationBlockers(item: ItemMasterSetupItem) {
  const blockers = [
    [item.code, "Item code is required."],
    [item.name, "Item name is required."],
    [item.shortName, "Short name is required."],
    [item.itemType, "Item type is required."],
    [item.groupLabel, "Item group/category is required."],
    [item.stockUom, "Stock UOM is required."],
    [item.defaultMakeType, "Make/buy/subcontract is required."],
    [item.lifecycleStatus, "Lifecycle status is required."]
  ]
    .filter(([value]) => typeof value === "string" && value.trim().length === 0)
    .map(([, message]) => String(message));

  if (item.leadTimeDays < 0) {
    blockers.push("Lead time cannot be negative.");
  }

  return Array.from(new Set([...blockers, ...item.activationBlockers]));
}

function buildItemDraft(records: ItemMasterSetupItem[], companyId?: number | null): ItemMasterSetupItem {
  const reference = records[0];
  const now = new Date().toISOString().slice(0, 10);

  return {
    id: "item-draft-new",
    itemId: 0,
    companyId: companyId ?? reference?.companyId ?? 1,
    code: "",
    name: "",
    shortName: "",
    itemType: "",
    itemGroupId: reference?.itemGroupId ?? 1,
    groupLabel: "",
    measurementProfileId: reference?.measurementProfileId ?? 1,
    measurementProfile: reference?.measurementProfile ?? "",
    stockUomId: reference?.stockUomId ?? 1,
    stockUom: "",
    purchaseUomId: reference?.purchaseUomId ?? null,
    salesUomId: reference?.salesUomId ?? null,
    productionUomId: reference?.productionUomId ?? null,
    qcUomId: reference?.qcUomId ?? null,
    traceabilityMode: "None",
    isCatchWeightItem: false,
    isQcRequired: false,
    isBatchExpiryTracked: false,
    defaultIssueMethod: "Manual",
    defaultMakeType: "",
    defaultWarehouseId: reference?.defaultWarehouseId ?? null,
    defaultBinId: reference?.defaultBinId ?? null,
    defaultWarehouse: reference?.defaultWarehouse ?? "",
    leadTimeDays: 0,
    reorderPolicy: "Manual",
    lifecycleStatus: "Draft",
    category: "",
    subCategory: "",
    productFamily: "",
    businessSegment: "",
    reportingBucket: "",
    attributeSummary: "",
    aliases: [],
    baseUom: "",
    purchaseUom: "",
    salesUom: "",
    productionUom: "",
    catalogVisible: false,
    media: [],
    documents: [],
    catalog: {
      isVisible: false,
      title: "",
      section: "",
      marketingDescription: "",
      customerVisibleSpecs: "",
      publishStatus: "Draft",
      effectiveDates: "Not scheduled",
      previewSlug: ""
    },
    packaging: {
      innerPack: "",
      carton: "",
      pallet: "",
      packagingUom: "",
      netWeight: "",
      grossWeight: "",
      dimensions: "",
      labelCount: "",
      packingInstructions: ""
    },
    physicalSpecs: {
      length: "",
      width: "",
      height: "",
      thickness: "",
      grade: "",
      material: "",
      colorFinish: "",
      shelfLife: "",
      storageCondition: ""
    },
    customerReferences: [],
    vendorReferences: [],
    barcodeRules: [],
    variantTemplates: [],
    manufacturing: {
      "BOM policy": "",
      "Routing policy": "",
      "Issue method": "Manual",
      "Scrap allowance": "",
      "Operation linkage": ""
    },
    planning: {
      "MRP enabled": "No",
      "Safety stock": "",
      "Reorder point": "",
      "Min / max": "",
      "Lead time": "0 days",
      "Lot size": "",
      "ABC class": ""
    },
    inventory: {
      "Default warehouse": reference?.defaultWarehouse ?? "",
      "Default bin": "",
      "Serial tracking": "No",
      "Lot tracking": "No",
      "Catch weight": "No",
      "Negative stock": "Blocked",
      "Expiry policy": ""
    },
    quality: {
      "QC required": "No",
      "Inspection plan": "",
      "Certificate requirement": "",
      "Hold rules": "",
      "Traceability depth": "Item level"
    },
    sales: {
      "Sales enabled": "No",
      "Sales UOM": "",
      "Tax category": "",
      "Price group": "",
      "Discount eligible": "No",
      "Catalog eligibility": "Not reviewed"
    },
    purchase: {
      "Buy enabled": "No",
      "Preferred supplier": "",
      "Approved supplier list": "",
      "Purchase lead time": "0 days",
      "MOQ": "",
      "Supplier compliance requirement": ""
    },
    activationBlockers: ["Complete required identity, measurement, and policy fields before activation."],
    auditTrail: [
      {
        id: "draft-audit-opened",
        event: "Draft editor opened",
        actor: "Master data",
        occurredOn: now,
        outcome: "Draft"
      }
    ],
    status: "Draft",
    source: "Live"
  };
}

function cloneItem(item: ItemMasterSetupItem) {
  return JSON.parse(JSON.stringify(item)) as ItemMasterSetupItem;
}

function buildCoreRequest(item: ItemMasterSetupItem): ItemUpsertRequest {
  return {
    companyId: item.companyId,
    itemCode: item.code.trim(),
    itemName: item.name.trim(),
    shortName: cleanString(item.shortName),
    itemType: item.itemType.trim(),
    itemGroupId: item.itemGroupId,
    measurementProfileId: item.measurementProfileId,
    stockUomId: item.stockUomId,
    purchaseUomId: item.purchaseUomId,
    salesUomId: item.salesUomId,
    productionUomId: item.productionUomId,
    qcUomId: item.qcUomId,
    traceabilityMode: item.traceabilityMode,
    isCatchWeightItem: item.isCatchWeightItem,
    isQcRequired: item.isQcRequired,
    isBatchExpiryTracked: item.isBatchExpiryTracked,
    defaultIssueMethod: item.defaultIssueMethod,
    defaultMakeType: item.defaultMakeType,
    defaultWarehouseId: item.defaultWarehouseId,
    defaultBinId: item.defaultBinId,
    leadTimeDays: item.leadTimeDays,
    reorderPolicy: item.reorderPolicy,
    status: item.lifecycleStatus === "Active" ? "Active" : "Draft"
  };
}

function buildProfileRequest(item: ItemMasterSetupItem): ItemMasterProfileUpsertRequest {
  const catalogDates = splitEffectiveDates(item.catalog.effectiveDates);
  const [minimumQty, maximumQty] = item.planning["Min / max"].split("/").map((entry) => numericValue(entry));
  const packagingDimensions = item.packaging.dimensions.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];

  return {
    aliases: item.aliases
      .map((alias, index) => ({
        aliasType: index === 0 ? "ShortName" : "Search",
        aliasValue: alias.trim(),
        languageCode: null,
        isPrimary: index === 0,
        status: "Active"
      }))
      .filter((alias) => alias.aliasValue.length > 0),
    catalog: {
      catalogTitle: item.catalog.title.trim() || item.name.trim(),
      catalogSection: cleanString(item.catalog.section),
      marketingDescription: cleanString(item.catalog.marketingDescription),
      customerVisibleSpecsJson: cleanString(item.catalog.customerVisibleSpecs),
      publishStatus: item.catalog.publishStatus.trim() || "Draft",
      isCatalogVisible: item.catalog.isVisible,
      effectiveFrom: catalogDates.effectiveFrom,
      effectiveTo: catalogDates.effectiveTo,
      previewSlug: cleanString(item.catalog.previewSlug),
      status: item.catalog.publishStatus === "Published" ? "Active" : "Draft"
    },
    packaging: {
      packagingUomId: item.stockUomId,
      innerPackQty: numericValue(item.packaging.innerPack),
      cartonQty: numericValue(item.packaging.carton),
      palletQty: numericValue(item.packaging.pallet),
      netWeight: numericValue(item.packaging.netWeight),
      grossWeight: numericValue(item.packaging.grossWeight),
      weightUomId: item.purchaseUomId ?? item.stockUomId,
      lengthValue: packagingDimensions[0] ?? numericValue(item.physicalSpecs.length),
      widthValue: packagingDimensions[1] ?? numericValue(item.physicalSpecs.width),
      heightValue: packagingDimensions[2] ?? numericValue(item.physicalSpecs.height),
      dimensionUomId: null,
      labelCount: numericValue(item.packaging.labelCount),
      packingInstructions: cleanString(item.packaging.packingInstructions),
      status: "Active"
    },
    physicalSpecs: {
      lengthValue: numericValue(item.physicalSpecs.length),
      widthValue: numericValue(item.physicalSpecs.width),
      heightValue: numericValue(item.physicalSpecs.height),
      thicknessValue: numericValue(item.physicalSpecs.thickness),
      dimensionUomId: null,
      grade: cleanString(item.physicalSpecs.grade),
      material: cleanString(item.physicalSpecs.material),
      colorFinish: cleanString(item.physicalSpecs.colorFinish),
      shelfLifeDays: integerValue(item.physicalSpecs.shelfLife),
      storageCondition: cleanString(item.physicalSpecs.storageCondition),
      toleranceNote: null,
      status: "Active"
    },
    manufacturingPolicy: {
      bomPolicy: item.manufacturing["BOM policy"] || "Not applicable",
      routingPolicy: item.manufacturing["Routing policy"] || "Not applicable",
      issueMethod: item.manufacturing["Issue method"] || item.defaultIssueMethod,
      scrapAllowancePercent: numericValue(item.manufacturing["Scrap allowance"]),
      operationLinkage: cleanString(item.manufacturing["Operation linkage"]),
      status: "Active"
    },
    planningPolicy: {
      mrpEnabled: /^yes$/i.test(item.planning["MRP enabled"]),
      safetyStockQty: numericValue(item.planning["Safety stock"]),
      reorderPointQty: numericValue(item.planning["Reorder point"]),
      minimumQty,
      maximumQty,
      leadTimeDays: integerValue(item.planning["Lead time"]) ?? item.leadTimeDays,
      lotSizeQty: numericValue(item.planning["Lot size"]),
      abcClass: cleanString(item.planning["ABC class"]),
      status: "Active"
    },
    inventoryPolicy: {
      defaultWarehouseId: item.defaultWarehouseId,
      defaultBinId: item.defaultBinId,
      serialTrackingMode: item.inventory["Serial tracking"] || "No",
      lotTrackingMode: item.inventory["Lot tracking"] || item.traceabilityMode,
      isCatchWeightItem: item.isCatchWeightItem,
      negativeStockPolicy: item.inventory["Negative stock"] || "Blocked",
      expiryPolicy: cleanString(item.inventory["Expiry policy"]),
      shelfLifeDays: integerValue(item.physicalSpecs.shelfLife),
      status: "Active"
    },
    qualityPolicy: {
      qcRequired: item.isQcRequired,
      inspectionPlanId: null,
      inspectionPlanCode: cleanString(item.quality["Inspection plan"]),
      certificateRequirement: cleanString(item.quality["Certificate requirement"]),
      holdRule: cleanString(item.quality["Hold rules"]),
      traceabilityDepth: cleanString(item.quality["Traceability depth"]),
      status: "Active"
    },
    customerReferences: item.customerReferences
      .filter((reference) => reference.customerItemCode.trim().length > 0)
      .map((reference) => {
        const drawing = splitDrawingRevision(reference.drawingRevision);
        return {
          customerId: reference.customerId ?? 0,
          customerItemCode: reference.customerItemCode.trim(),
          drawingNo: drawing.drawingNo,
          revisionCode: drawing.revisionCode,
          packagingOverride: cleanString(reference.packagingOverride),
          specificationOverride: cleanString(reference.specificationOverride),
          approvalStatus: reference.approvalStatus || "Draft",
          effectiveFrom: null,
          effectiveTo: null,
          status: reference.approvalStatus === "Approved" ? "Active" : "Draft"
        };
      })
      .filter((reference) => reference.customerId > 0),
    vendorReferences: item.vendorReferences
      .filter((reference) => reference.vendorItemCode.trim().length > 0)
      .map((reference) => ({
        supplierId: reference.supplierId ?? 0,
        vendorItemCode: reference.vendorItemCode.trim(),
        minimumOrderQty: numericValue(reference.minimumOrderQty),
        leadTimeDays: integerValue(reference.leadTime),
        purchaseUomId: reference.purchaseUomId ?? item.purchaseUomId ?? item.stockUomId,
        complianceStatus: cleanString(reference.complianceStatus),
        documentStatus: cleanString(reference.documentStatus),
        effectiveFrom: null,
        effectiveTo: null,
        status: reference.complianceStatus === "Approved" ? "Active" : "Draft"
      }))
      .filter((reference) => reference.supplierId > 0)
  };
}

function uniqueOptions<TRecord>(records: TRecord[], selector: (record: TRecord) => string | null | undefined) {
  return Array.from(new Set(records.map(selector).filter((option): option is string => Boolean(option)))).sort();
}

function applyItemFilters(
  records: ItemMasterSetupItem[],
  filters: {
    itemType: string;
    lifecycleStatus: string;
    group: string;
    makeType: string;
    qcRequired: string;
    catalogVisible: string;
    hasMedia: string;
    warehouse: string;
  }
) {
  return records.filter((record) => {
    const matchesType = filters.itemType === "all" || record.itemType === filters.itemType;
    const matchesStatus = filters.lifecycleStatus === "all" || record.lifecycleStatus === filters.lifecycleStatus;
    const matchesGroup = filters.group === "all" || record.groupLabel === filters.group;
    const matchesMake = filters.makeType === "all" || record.defaultMakeType === filters.makeType;
    const matchesQc =
      filters.qcRequired === "all" ||
      (filters.qcRequired === "yes" && record.isQcRequired) ||
      (filters.qcRequired === "no" && !record.isQcRequired);
    const matchesCatalog =
      filters.catalogVisible === "all" ||
      (filters.catalogVisible === "yes" && record.catalogVisible) ||
      (filters.catalogVisible === "no" && !record.catalogVisible);
    const matchesMedia =
      filters.hasMedia === "all" ||
      (filters.hasMedia === "yes" && record.media.length > 0) ||
      (filters.hasMedia === "no" && record.media.length === 0);
    const matchesWarehouse = filters.warehouse === "all" || record.defaultWarehouse === filters.warehouse;

    return (
      matchesType &&
      matchesStatus &&
      matchesGroup &&
      matchesMake &&
      matchesQc &&
      matchesCatalog &&
      matchesMedia &&
      matchesWarehouse
    );
  });
}

function FieldGrid({ fields }: { fields: Array<[string, string | number | boolean]> }) {
  return (
    <div className="item-master__field-grid">
      {fields.map(([label, value]) => (
        <div className="item-master__field" key={label}>
          <span>{label}</span>
          <strong>{String(value)}</strong>
        </div>
      ))}
    </div>
  );
}

function TextField({
  label,
  onChange,
  value,
  type = "text"
}: {
  label: string;
  onChange: (value: string) => void;
  value: string | number;
  type?: "text" | "number";
}) {
  if (type === "number") {
    const numericValue = typeof value === "number" ? value : value ? Number(value) : null;

    return (
      <ErpNumberField
        label={label}
        min={0}
        onChange={(nextValue) => onChange(nextValue === null ? "" : String(nextValue))}
        value={numericValue}
      />
    );
  }

  return (
    <label className="item-master__editor-field">
      <span>{label}</span>
      <input onChange={(event) => onChange(event.target.value)} type={type} value={value} />
    </label>
  );
}

function TextAreaField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="item-master__editor-field item-master__editor-field--wide">
      <span>{label}</span>
      <textarea onChange={(event) => onChange(event.target.value)} rows={3} value={value} />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <ErpLookupField
      label={label}
      onChange={onChange}
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
    />
  );
}

function CheckField({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <label className="item-master__check-field">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

function PolicyEditorGrid({
  fields,
  onChange
}: {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="item-master__editor-grid">
      {Object.entries(fields).map(([key, value]) => (
        <TextField key={key} label={key} onChange={(nextValue) => onChange(key, nextValue)} value={value} />
      ))}
    </div>
  );
}

function PolicyGrid({ fields }: { fields: Record<string, string> }) {
  return <FieldGrid fields={Object.entries(fields)} />;
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="ui-empty-state item-master__empty">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function ReferenceTable({
  columns,
  emptyDescription,
  records,
  title
}: {
  columns: string[];
  emptyDescription: string;
  records: Array<Record<string, string>>;
  title: string;
}) {
  if (records.length === 0) {
    return <EmptyPanel title={title} description={emptyDescription} />;
  }

  return (
    <div className="item-master__table-wrap">
      <table className="item-master__mini-table">
        <caption>{title}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {columns.map((column) => (
                <td key={column}>{record[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ItemMediaPanel({ item }: { item: ItemMasterSetupItem }) {
  const primary = item.media.find((media) => media.isPrimary);
  const drawing = item.media.find((media) => /drawing|specification/i.test(media.mediaType));
  const photo = item.media.find((media) => /photo|image/i.test(media.mediaType));

  return (
    <div className="item-master__panel-grid">
      <Card title="Primary image" description="Main visual used for catalog, receiving, and dispatch checks.">
        {primary ? (
          <div className="item-master__image-card">
            <div aria-hidden="true" className="item-master__image-mark">
              {item.code.slice(0, 2)}
            </div>
            <div>
              <strong>{primary.title}</strong>
              <p className="muted">{primary.fileName}</p>
              <div className="context-chip-row">
                <Badge tone="success">{primary.approvalStatus}</Badge>
                <Badge tone="info">{primary.visibilityScope}</Badge>
              </div>
            </div>
          </div>
        ) : (
          <EmptyPanel title="No primary image uploaded" description="Add an approved item image before catalog release or receiving visual checks." />
        )}
      </Card>
      <Card title="Gallery and media" description="Photos, drawings, receiving references, and product visuals.">
        {item.media.length > 0 ? (
          <div className="item-master__list">
            {item.media.map((media) => (
              <div className="item-master__list-row" key={media.id}>
                <div>
                  <strong>{media.title}</strong>
                  <p className="muted">{media.mediaType} / {media.fileName}</p>
                </div>
                <Badge tone={media.isPrimary ? "info" : "neutral"}>{media.isPrimary ? "Primary" : media.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel title="No media uploaded" description="Media upload support is prepared by the Item Master data model." />
        )}
      </Card>
      <Card title="Drawing, spec, and photo slots" description="Required media categories for catalog release and receiving checks.">
        <FieldGrid
          fields={[
            ["Product photo", photo?.title ?? "Not uploaded"],
            ["Drawing / spec", drawing?.title ?? "Not uploaded"],
            ["Receiving reference", item.media.find((media) => /receiving/i.test(media.mediaType))?.title ?? "Not uploaded"]
          ]}
        />
      </Card>
      <Card title="Media actions" description="Administrative media controls remain disabled until file storage is enabled.">
        <p className="muted" id="item-media-action-reason">
          Media storage is not enabled for item records, so upload actions are unavailable.
        </p>
        <div className="context-chip-row">
          <ErpFileActionState disabledReason="Media storage is not enabled for item records." enabled={false} label="Upload media" />
          <Button disabled title="Select a stored media record before changing the primary image." variant="secondary">Set primary</Button>
          <Button disabled title="Select a stored media record before retiring media." variant="secondary">Retire media</Button>
        </div>
      </Card>
    </div>
  );
}

function ItemDetailEditor({
  activeTab,
  item,
  records,
  saveMessage,
  saveTone,
  setActiveTab,
  updateItem
}: {
  activeTab: ItemDetailTab;
  item: ItemMasterSetupItem;
  records: ItemMasterSetupItem[];
  saveMessage: string | null;
  saveTone: "success" | "error" | "info";
  setActiveTab: (tab: ItemDetailTab) => void;
  updateItem: (updater: (item: ItemMasterSetupItem) => ItemMasterSetupItem) => void;
}) {
  const groupOptions = useMemo(
    () =>
      records
        .map((record) => ({ id: record.itemGroupId, label: record.groupLabel }))
        .filter((entry, index, source) => entry.label && source.findIndex((candidate) => candidate.label === entry.label) === index),
    [records]
  );
  const categoryOptions = useMemo(() => groupOptions.map((option) => ({ label: option.label, value: option.label })), [groupOptions]);
  const uomOptions = useMemo(
    () =>
      records
        .map((record) => ({ id: record.stockUomId, label: record.stockUom }))
        .filter((entry, index, source) => entry.label && source.findIndex((candidate) => candidate.label === entry.label) === index),
    [records]
  );
  const profileOptions = useMemo(
    () =>
      records
        .map((record) => ({ id: record.measurementProfileId, label: record.measurementProfile }))
        .filter((entry, index, source) => entry.label && source.findIndex((candidate) => candidate.label === entry.label) === index),
    [records]
  );
  const warehouseOptions = useMemo(
    () =>
      records
        .map((record) => ({ label: record.defaultWarehouse, value: record.defaultWarehouse }))
        .filter((entry, index, source) => entry.label && source.findIndex((candidate) => candidate.value === entry.value) === index),
    [records]
  );
  const blockers = validationBlockers(item);
  const taxonomyUnavailableReason = "Dedicated item taxonomy setup is required before this value can be selected.";

  const patch = (changes: Partial<ItemMasterSetupItem>) => updateItem((current) => ({ ...current, ...changes }));
  const patchCatalog = (changes: Partial<ItemMasterSetupItem["catalog"]>) =>
    updateItem((current) => ({ ...current, catalog: { ...current.catalog, ...changes }, catalogVisible: changes.isVisible ?? current.catalogVisible }));
  const patchPackaging = (changes: Partial<ItemMasterSetupItem["packaging"]>) =>
    updateItem((current) => ({ ...current, packaging: { ...current.packaging, ...changes } }));
  const patchPhysicalSpecs = (changes: Partial<ItemMasterSetupItem["physicalSpecs"]>) =>
    updateItem((current) => ({ ...current, physicalSpecs: { ...current.physicalSpecs, ...changes } }));
  const patchPolicy = (
    section: "manufacturing" | "planning" | "inventory" | "quality" | "sales" | "purchase",
    key: string,
    value: string
  ) => updateItem((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
  const patchCustomerReference = (index: number, changes: Partial<ItemMasterSetupItem["customerReferences"][number]>) =>
    updateItem((current) => ({
      ...current,
      customerReferences: current.customerReferences.map((reference, referenceIndex) =>
        referenceIndex === index ? { ...reference, ...changes } : reference
      )
    }));
  const patchVendorReference = (index: number, changes: Partial<ItemMasterSetupItem["vendorReferences"][number]>) =>
    updateItem((current) => ({
      ...current,
      vendorReferences: current.vendorReferences.map((reference, referenceIndex) =>
        referenceIndex === index ? { ...reference, ...changes } : reference
      )
    }));
  const removeCustomerReference = (index: number) =>
    updateItem((current) => ({
      ...current,
      customerReferences: current.customerReferences.filter((_, referenceIndex) => referenceIndex !== index)
    }));
  const removeVendorReference = (index: number) =>
    updateItem((current) => ({
      ...current,
      vendorReferences: current.vendorReferences.filter((_, referenceIndex) => referenceIndex !== index)
    }));

  const documentRows = item.documents.map((document) => ({
    id: document.id,
    Type: document.documentType,
    Title: document.title,
    Number: document.documentNo,
    Revision: document.revisionCode,
    Approval: document.approvalStatus,
    Effective: document.effectiveDate,
    Status: document.status
  }));
  const barcodeRows = item.barcodeRules.map((barcode) => ({
    id: barcode.id,
    Barcode: barcode.barcodeValue,
    Type: barcode.barcodeType,
    Purpose: barcode.scanPurpose,
    UOM: barcode.uomLabel,
    Primary: barcode.isPrimary ? "Yes" : "No",
    Status: barcode.status
  }));
  const variantRows = item.variantTemplates.map((variant) => ({
    id: variant.id,
    Template: variant.templateCode,
    Attributes: variant.attributes,
    Options: variant.optionCount,
    Default: variant.defaultVariant,
    Status: variant.status
  }));

  return (
    <div className="item-master__detail">
      <aside aria-label="Item detail sections" className="item-master__section-nav" role="tablist">
        {itemDetailGroups.map((group) => (
          <div className="item-master__section-group" key={group.label}>
            <span className="item-master__section-label">{group.label}</span>
            {group.tabs.map((tab) => (
              <button
                aria-selected={activeTab === tab}
                className={`item-master__section-tab ${activeTab === tab ? "item-master__section-tab--active" : ""}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <section className="item-master__tab-panel" role="tabpanel">
        {saveMessage ? <div className={`item-master__save-message item-master__save-message--${saveTone}`}>{saveMessage}</div> : null}
        {activeTab === "Core Info" ? (
          <FormShell
            description="Required commercial, stock, and control fields for item activation."
            initialFingerprint={item.id}
            title="Item detail editor"
            validationErrors={blockers}
          >
            <div className="item-master__editor-grid">
              <TextField label="Item code" onChange={(value) => patch({ code: value })} value={item.code} />
              <TextField label="Item name" onChange={(value) => patch({ name: value, catalog: { ...item.catalog, title: item.catalog.title || value } })} value={item.name} />
              <TextField label="Short name" onChange={(value) => patch({ shortName: value })} value={item.shortName} />
              <SelectField
                label="Item type"
                onChange={(value) => patch({ itemType: value })}
                options={["RawMaterial", "SemiFinished", "FinishedGood", "Consumable", "Service"]}
                value={item.itemType}
              />
              <ErpLookupField
                label="Item group/category"
                onChange={(value) => {
                  const selectedGroup = groupOptions.find((option) => option.label === value);
                  patch({
                    category: item.category || value,
                    groupLabel: value,
                    itemGroupId: selectedGroup?.id ?? item.itemGroupId
                  });
                }}
                options={groupOptions.map((option) => ({ label: option.label, value: option.label }))}
                required
                value={item.groupLabel}
              />
              <ErpLookupField
                label="Stock UOM"
                onChange={(value) => {
                  const selectedUom = uomOptions.find((option) => option.label === value);
                  patch({
                    baseUom: value,
                    stockUom: value,
                    stockUomId: selectedUom?.id ?? item.stockUomId
                  });
                }}
                options={uomOptions.map((option) => ({ label: option.label, value: option.label }))}
                required
                value={item.stockUom}
              />
              <SelectField
                label="Make/buy/subcontract"
                onChange={(value) => patch({ defaultMakeType: value })}
                options={["Make", "Buy", "Subcontract"]}
                value={item.defaultMakeType}
              />
              <SelectField
                label="Lifecycle status"
                onChange={(value) => patch({ lifecycleStatus: value, status: value === "Active" ? "Active" : "Draft" })}
                options={["Draft", "Active", "Inactive"]}
                value={item.lifecycleStatus}
              />
              <SelectField
                label="Traceability"
                onChange={(value) => patch({ traceabilityMode: value })}
                options={["None", "Lot", "Serial"]}
                value={item.traceabilityMode}
              />
              <ErpLookupField
                disabled={warehouseOptions.length === 0}
                disabledReason="Warehouse master records are required before this value can be selected."
                label="Default warehouse"
                onChange={(value) => patch({ defaultWarehouse: value, inventory: { ...item.inventory, "Default warehouse": value } })}
                options={warehouseOptions}
                value={item.defaultWarehouse}
              />
              <TextField label="Lead time days" onChange={(value) => patch({ leadTimeDays: Number(value) || 0 })} type="number" value={item.leadTimeDays} />
              <SelectField
                label="Reorder policy"
                onChange={(value) => patch({ reorderPolicy: value })}
                options={["Manual", "MRP", "ReorderPoint", "MinMax"]}
                value={item.reorderPolicy}
              />
              <CheckField checked={item.status === "Active"} label="Active item" onChange={(value) => patch({ lifecycleStatus: value ? "Active" : "Draft", status: value ? "Active" : "Draft" })} />
              <CheckField checked={item.isQcRequired} label="QC required" onChange={(value) => patch({ isQcRequired: value, quality: { ...item.quality, "QC required": value ? "Yes" : "No" } })} />
              <CheckField checked={item.isCatchWeightItem} label="Catch-weight item" onChange={(value) => patch({ isCatchWeightItem: value, inventory: { ...item.inventory, "Catch weight": value ? "Yes" : "No" } })} />
              <CheckField checked={item.isBatchExpiryTracked} label="Batch expiry tracked" onChange={(value) => patch({ isBatchExpiryTracked: value })} />
            </div>
          </FormShell>
        ) : null}

        {activeTab === "Classification" ? (
          <Card title="Classification" description="Grouping, product family, segment, and reporting controls.">
            <div className="item-master__editor-grid">
              <ErpLookupField
                label="Category"
                onChange={(value) => {
                  const selectedGroup = groupOptions.find((option) => option.label === value);
                  patch({
                    category: value,
                    groupLabel: value || item.groupLabel,
                    itemGroupId: selectedGroup?.id ?? item.itemGroupId
                  });
                }}
                options={categoryOptions}
                value={item.category || item.groupLabel}
              />
              <ErpLookupField
                disabled
                disabledReason={taxonomyUnavailableReason}
                label="Subcategory"
                onChange={() => undefined}
                options={[]}
                value={item.subCategory}
              />
              <ErpLookupField
                disabled
                disabledReason={taxonomyUnavailableReason}
                label="Product family"
                onChange={() => undefined}
                options={[]}
                value={item.productFamily}
              />
              <ErpLookupField
                disabled
                disabledReason={taxonomyUnavailableReason}
                label="Business segment"
                onChange={() => undefined}
                options={[]}
                value={item.businessSegment}
              />
              <TextField label="Reporting bucket" onChange={(value) => patch({ reportingBucket: value })} value={item.reportingBucket} />
              <TextAreaField label="Attributes" onChange={(value) => patch({ attributeSummary: value })} value={item.attributeSummary} />
              <TextAreaField
                label="Aliases"
                onChange={(value) => patch({ aliases: value.split(",").map((entry) => entry.trim()).filter(Boolean) })}
                value={item.aliases.join(", ")}
              />
            </div>
          </Card>
        ) : null}

        {activeTab === "Images & Media" ? <ItemMediaPanel item={item} /> : null}

        {activeTab === "Catalog" ? (
          <div className="item-master__panel-grid">
            <Card title="Catalog visibility" description="Customer-facing catalog setup and release controls.">
              <div className="item-master__editor-grid">
                <CheckField checked={item.catalog.isVisible} label="Catalog visible" onChange={(value) => patchCatalog({ isVisible: value })} />
                <TextField label="Catalog title" onChange={(value) => patchCatalog({ title: value })} value={item.catalog.title} />
                <TextField label="Section" onChange={(value) => patchCatalog({ section: value })} value={item.catalog.section} />
                <SelectField
                  label="Publish status"
                  onChange={(value) => patchCatalog({ publishStatus: value })}
          options={["Draft", "Ready for review", "Published", "Restricted", "Retired"]}
                  value={item.catalog.publishStatus}
                />
                <TextField label="Effective dates" onChange={(value) => patchCatalog({ effectiveDates: value })} value={item.catalog.effectiveDates} />
                <TextAreaField
                  label="Customer-visible specs"
                  onChange={(value) => patchCatalog({ customerVisibleSpecs: value })}
                  value={item.catalog.customerVisibleSpecs}
                />
                <TextField label="Preview slug" onChange={(value) => patchCatalog({ previewSlug: value })} value={item.catalog.previewSlug} />
              </div>
            </Card>
            <Card title="Catalog preview" description="Commercial description used outside internal item setup.">
              <TextAreaField
                label="Marketing description"
                onChange={(value) => patchCatalog({ marketingDescription: value })}
                value={item.catalog.marketingDescription}
              />
            </Card>
          </div>
        ) : null}

        {activeTab === "UOM & Conversions" ? (
          <Card title="UOM and conversion controls" description="Base, purchase, sales, production, and measurement profile setup.">
            <div className="item-master__editor-grid">
              <ErpLookupField
                label="Base UOM"
                onChange={(value) => patch({ baseUom: value })}
                options={uomOptions.map((option) => ({ label: option.label, value: option.label }))}
                value={item.baseUom}
              />
              <ErpLookupField
                label="Purchase UOM"
                onChange={(value) => patch({ purchaseUom: value })}
                options={uomOptions.map((option) => ({ label: option.label, value: option.label }))}
                value={item.purchaseUom}
              />
              <ErpLookupField
                label="Sales UOM"
                onChange={(value) => patch({ salesUom: value })}
                options={uomOptions.map((option) => ({ label: option.label, value: option.label }))}
                value={item.salesUom}
              />
              <ErpLookupField
                label="Production UOM"
                onChange={(value) => patch({ productionUom: value })}
                options={uomOptions.map((option) => ({ label: option.label, value: option.label }))}
                value={item.productionUom}
              />
              <ErpLookupField
                label="Measurement profile"
                onChange={(value) => {
                  const profile = profileOptions.find((option) => option.label === value);
                  patch({ measurementProfile: value, measurementProfileId: profile?.id ?? item.measurementProfileId });
                }}
                options={profileOptions.map((option) => ({ label: option.label, value: option.label }))}
                value={item.measurementProfile}
              />
              <CheckField checked={item.isCatchWeightItem} label="Catch weight" onChange={(value) => patch({ isCatchWeightItem: value })} />
            </div>
          </Card>
        ) : null}

        {activeTab === "Packaging" ? (
          <Card title="Packaging hierarchy" description="Pack quantities, carton and pallet rules, labels, and packing instructions.">
            <div className="item-master__editor-grid">
              <TextField label="Inner pack" onChange={(value) => patchPackaging({ innerPack: value })} value={item.packaging.innerPack} />
              <TextField label="Carton" onChange={(value) => patchPackaging({ carton: value })} value={item.packaging.carton} />
              <TextField label="Pallet" onChange={(value) => patchPackaging({ pallet: value })} value={item.packaging.pallet} />
              <ErpLookupField
                label="Packaging UOM"
                onChange={(value) => patchPackaging({ packagingUom: value })}
                options={uomOptions.map((option) => ({ label: option.label, value: option.label }))}
                value={item.packaging.packagingUom}
              />
              <TextField label="Net weight" onChange={(value) => patchPackaging({ netWeight: value })} value={item.packaging.netWeight} />
              <TextField label="Gross weight" onChange={(value) => patchPackaging({ grossWeight: value })} value={item.packaging.grossWeight} />
              <TextField label="Dimensions" onChange={(value) => patchPackaging({ dimensions: value })} value={item.packaging.dimensions} />
              <TextField label="Label count" onChange={(value) => patchPackaging({ labelCount: value })} value={item.packaging.labelCount} />
              <TextAreaField
                label="Packing instructions"
                onChange={(value) => patchPackaging({ packingInstructions: value })}
                value={item.packaging.packingInstructions}
              />
            </div>
          </Card>
        ) : null}

        {activeTab === "Physical Specs" ? (
          <Card title="Physical specs" description="Dimensional, material, finish, storage, and shelf-life fields.">
            <div className="item-master__editor-grid">
              <TextField label="Length" onChange={(value) => patchPhysicalSpecs({ length: value })} value={item.physicalSpecs.length} />
              <TextField label="Width" onChange={(value) => patchPhysicalSpecs({ width: value })} value={item.physicalSpecs.width} />
              <TextField label="Height" onChange={(value) => patchPhysicalSpecs({ height: value })} value={item.physicalSpecs.height} />
              <TextField label="Thickness" onChange={(value) => patchPhysicalSpecs({ thickness: value })} value={item.physicalSpecs.thickness} />
              <TextField label="Grade" onChange={(value) => patchPhysicalSpecs({ grade: value })} value={item.physicalSpecs.grade} />
              <TextField label="Material" onChange={(value) => patchPhysicalSpecs({ material: value })} value={item.physicalSpecs.material} />
              <TextField label="Color / finish" onChange={(value) => patchPhysicalSpecs({ colorFinish: value })} value={item.physicalSpecs.colorFinish} />
              <TextField label="Shelf life" onChange={(value) => patchPhysicalSpecs({ shelfLife: value })} value={item.physicalSpecs.shelfLife} />
              <TextAreaField
                label="Storage condition"
                onChange={(value) => patchPhysicalSpecs({ storageCondition: value })}
                value={item.physicalSpecs.storageCondition}
              />
            </div>
          </Card>
        ) : null}

        {activeTab === "Barcode & Labels" ? (
          <ReferenceTable
            columns={["Barcode", "Type", "Purpose", "UOM", "Primary", "Status"]}
            emptyDescription="No barcode or label rule is attached to this item yet."
            records={barcodeRows}
            title="Barcode and label rules"
          />
        ) : null}

        {activeTab === "Variants/Templates" ? (
          <ReferenceTable
            columns={["Template", "Attributes", "Options", "Default", "Status"]}
            emptyDescription="No variant template is attached to this item yet."
            records={variantRows}
            title="Variant and template controls"
          />
        ) : null}

        {activeTab === "Manufacturing" ? (
          <Card title="Manufacturing controls" description="BOM, routing, issue method, scrap, and operation linkage.">
            <PolicyEditorGrid fields={item.manufacturing} onChange={(key, value) => patchPolicy("manufacturing", key, value)} />
          </Card>
        ) : null}

        {activeTab === "Planning/Replenishment" ? (
          <Card title="Planning and replenishment" description="MRP, safety stock, min/max, lead time, and lot sizing.">
            <PolicyEditorGrid fields={item.planning} onChange={(key, value) => patchPolicy("planning", key, value)} />
          </Card>
        ) : null}

        {activeTab === "Inventory/Warehouse Policy" ? (
          <Card title="Inventory and warehouse policy" description="Warehouse, bin, lot, serial, catch-weight, stock, and expiry controls.">
            <PolicyEditorGrid fields={item.inventory} onChange={(key, value) => patchPolicy("inventory", key, value)} />
          </Card>
        ) : null}

        {activeTab === "Quality/Traceability" ? (
          <Card title="Quality and traceability" description="Inspection, certificate, hold, lot, and release policy.">
            <PolicyEditorGrid fields={item.quality} onChange={(key, value) => patchPolicy("quality", key, value)} />
          </Card>
        ) : null}

        {activeTab === "Sales/Commercial" ? (
          <Card title="Sales and commercial controls" description="Sales enablement, UOM, tax, price group, and discount eligibility.">
            <PolicyGrid fields={item.sales} />
          </Card>
        ) : null}

        {activeTab === "Purchase/Vendor" ? (
          <div className="item-master__panel-grid">
            <Card title="Purchase controls" description="Buy enablement, approved supplier policy, lead time, and MOQ.">
              <PolicyEditorGrid fields={item.purchase} onChange={(key, value) => patchPolicy("purchase", key, value)} />
            </Card>
            <Card
              actions={
                <Button
                  onClick={() =>
                    updateItem((current) => ({
                      ...current,
                      vendorReferences: [
                        ...current.vendorReferences,
                        {
                          id: `vendor-ref-${Date.now()}`,
                          supplierId: null,
                          supplier: "",
                          vendorItemCode: "",
                          minimumOrderQty: "",
                          leadTime: "",
                          purchaseUomId: current.purchaseUomId ?? current.stockUomId,
                          purchaseUom: current.purchaseUom || current.stockUom,
                          complianceStatus: "Draft",
                          documentStatus: ""
                        }
                      ]
                    }))
                  }
                  variant="secondary"
                >
                  Add vendor reference
                </Button>
              }
              title="Vendor item references"
              description="Supplier item codes, MOQ, lead time, purchase UOM, and document status."
            >
              {item.vendorReferences.length > 0 ? (
                <div className="item-master__table-wrap">
                  <table className="item-master__mini-table item-master__editable-table">
                    <thead>
                      <tr>
                        <th>Supplier ID</th>
                        <th>Supplier</th>
                        <th>Vendor item code</th>
                        <th>MOQ</th>
                        <th>Lead time</th>
                        <th>Purchase UOM</th>
                        <th>Compliance</th>
                        <th>Documents</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.vendorReferences.map((reference, index) => (
                        <tr key={reference.id}>
                          <td><ErpNumberField label={`Supplier ID ${index + 1}`} min={0} onChange={(value) => patchVendorReference(index, { supplierId: value })} value={reference.supplierId} /></td>
                          <td><ErpLookupField label={`Supplier ${index + 1}`} onChange={(value) => patchVendorReference(index, { supplier: value })} options={item.vendorReferences.map((entry) => ({ label: entry.supplier || "Supplier pending", value: entry.supplier })).filter((entry) => entry.value)} value={reference.supplier} /></td>
                          <td><input aria-label={`Vendor item code ${index + 1}`} onChange={(event) => patchVendorReference(index, { vendorItemCode: event.target.value })} value={reference.vendorItemCode} /></td>
                          <td><ErpDecimalField label={`Minimum order quantity ${index + 1}`} min={0} onChange={(value) => patchVendorReference(index, { minimumOrderQty: value === null ? "" : String(value) })} scale={3} value={reference.minimumOrderQty ? Number(reference.minimumOrderQty) : null} /></td>
                          <td><ErpNumberField label={`Lead time ${index + 1}`} min={0} onChange={(value) => patchVendorReference(index, { leadTime: value === null ? "" : `${value} days` })} unit="days" value={reference.leadTime ? Number.parseInt(reference.leadTime, 10) : null} /></td>
                          <td><ErpLookupField label={`Purchase UOM ${index + 1}`} onChange={(value) => patchVendorReference(index, { purchaseUom: value })} options={uomOptions.map((option) => ({ label: option.label, value: option.label }))} value={reference.purchaseUom} /></td>
                          <td><ErpLookupField label={`Compliance ${index + 1}`} onChange={(value) => patchVendorReference(index, { complianceStatus: value })} options={["Draft", "Approved", "Pending", "Blocked"].map((value) => ({ label: value, value }))} value={reference.complianceStatus} /></td>
                          <td><ErpLookupField label={`Document status ${index + 1}`} onChange={(value) => patchVendorReference(index, { documentStatus: value })} options={["Not attached", "Pending", "Approved", "Expired"].map((value) => ({ label: value, value }))} value={reference.documentStatus || "Not attached"} /></td>
                          <td><Button onClick={() => removeVendorReference(index)} variant="quiet">Remove</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyPanel title="No vendor reference" description="Add supplier item references before purchase release." />
              )}
            </Card>
          </div>
        ) : null}

        {activeTab === "Customer References" ? (
          <Card
            actions={
              <Button
                onClick={() =>
                  updateItem((current) => ({
                    ...current,
                    customerReferences: [
                      ...current.customerReferences,
                      {
                        id: `customer-ref-${Date.now()}`,
                        customerId: null,
                        customer: "",
                        customerItemCode: "",
                        drawingRevision: "",
                        packagingOverride: "",
                        specificationOverride: "",
                        approvalStatus: "Draft"
                      }
                    ]
                  }))
                }
                variant="secondary"
              >
                Add customer reference
              </Button>
            }
            title="Customer item references"
            description="Customer item codes, drawing revisions, packaging overrides, and approval status."
          >
            {item.customerReferences.length > 0 ? (
              <div className="item-master__table-wrap">
                <table className="item-master__mini-table item-master__editable-table">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Customer</th>
                      <th>Customer item code</th>
                      <th>Drawing / revision</th>
                      <th>Packaging override</th>
                      <th>Spec override</th>
                      <th>Approval</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.customerReferences.map((reference, index) => (
                      <tr key={reference.id}>
                        <td><ErpNumberField label={`Customer ID ${index + 1}`} min={0} onChange={(value) => patchCustomerReference(index, { customerId: value })} value={reference.customerId} /></td>
                        <td><ErpLookupField label={`Customer ${index + 1}`} onChange={(value) => patchCustomerReference(index, { customer: value })} options={item.customerReferences.map((entry) => ({ label: entry.customer || "Customer pending", value: entry.customer })).filter((entry) => entry.value)} value={reference.customer} /></td>
                        <td><input aria-label={`Customer item code ${index + 1}`} onChange={(event) => patchCustomerReference(index, { customerItemCode: event.target.value })} value={reference.customerItemCode} /></td>
                        <td><input aria-label={`Drawing revision ${index + 1}`} onChange={(event) => patchCustomerReference(index, { drawingRevision: event.target.value })} value={reference.drawingRevision} /></td>
                        <td><input aria-label={`Packaging override ${index + 1}`} onChange={(event) => patchCustomerReference(index, { packagingOverride: event.target.value })} value={reference.packagingOverride} /></td>
                        <td><input aria-label={`Specification override ${index + 1}`} onChange={(event) => patchCustomerReference(index, { specificationOverride: event.target.value })} value={reference.specificationOverride} /></td>
                        <td><ErpLookupField label={`Approval ${index + 1}`} onChange={(value) => patchCustomerReference(index, { approvalStatus: value })} options={["Draft", "Review", "Approved", "Rejected"].map((value) => ({ label: value, value }))} value={reference.approvalStatus} /></td>
                        <td><Button onClick={() => removeCustomerReference(index)} variant="quiet">Remove</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyPanel title="No customer reference" description="Add customer item codes and drawing references before customer release." />
            )}
          </Card>
        ) : null}

        {activeTab === "Attachments/Documents" ? (
          <ReferenceTable
            columns={["Type", "Title", "Number", "Revision", "Approval", "Effective", "Status"]}
            emptyDescription="No attachment or controlled document is attached to this item yet."
            records={documentRows}
            title="Attachments and controlled documents"
          />
        ) : null}

        {activeTab === "Audit/History" ? (
          <Card title="Audit and history" description="Recent governance events for this item record.">
            <ol className="item-master__audit">
              {item.auditTrail.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.event}</strong>
                  <span>{entry.actor} / {entry.occurredOn} / {entry.outcome}</span>
                </li>
              ))}
            </ol>
          </Card>
        ) : null}
      </section>
    </div>
  );
}

export function ItemListPage() {
  const { session } = useAuth();
  const { deferredSearch, filter, search, setSearch, setStatus, status, user } = useCommonFilter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"closed" | "create" | "edit">("closed");
  const [editorDraft, setEditorDraft] = useState<ItemMasterSetupItem | null>(null);
  const [activeTab, setActiveTab] = useState<ItemDetailTab>("Core Info");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveTone, setSaveTone] = useState<"success" | "error" | "info">("info");
  const [itemType, setItemType] = useState("all");
  const [lifecycleStatus, setLifecycleStatus] = useState("all");
  const [group, setGroup] = useState("all");
  const [makeType, setMakeType] = useState("all");
  const [qcRequired, setQcRequired] = useState("all");
  const [catalogVisible, setCatalogVisible] = useState("all");
  const [hasMedia, setHasMedia] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const query = useApiQuery(
    queryKeys.masters.items(user?.activeContext.companyId, deferredSearch, status),
    () => listItemMasterSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const filteredRecords = useMemo(
    () =>
      applyItemFilters(records, {
        catalogVisible,
        group,
        hasMedia,
        itemType,
        lifecycleStatus,
        makeType,
        qcRequired,
        warehouse
      }),
    [catalogVisible, group, hasMedia, itemType, lifecycleStatus, makeType, qcRequired, records, warehouse]
  );
  const selected = filteredRecords.find((record) => record.id === selectedId) ?? records.find((record) => record.id === selectedId) ?? null;
  const editorItem = editorDraft ?? (editorMode === "edit" && selected ? selected : null);
  const isEditorOpen = editorMode !== "closed" && Boolean(editorItem);
  const source = records[0]?.source ?? "Seeded";
  const makeCount = records.filter((record) => record.defaultMakeType === "Make").length;
  const buyCount = records.filter((record) => record.defaultMakeType === "Buy").length;
  const subcontractCount = records.filter((record) => record.defaultMakeType === "Subcontract").length;
  const persistenceReady = canPersistMasterData(session);

  const closeEditor = () => {
    setEditorMode("closed");
    setEditorDraft(null);
    setSelectedId(null);
    setSaveMessage(null);
    setActiveTab("Core Info");
  };

  const openCreateEditor = () => {
    setEditorMode("create");
    setSelectedId(null);
    setEditorDraft(buildItemDraft(records, user?.activeContext.companyId));
    setSaveMessage(null);
    setSaveTone("info");
    setActiveTab("Core Info");
  };

  const openEditEditor = (record: ItemMasterSetupItem) => {
    setEditorMode("edit");
    setSelectedId(record.id);
    setEditorDraft(cloneItem(record));
    setSaveMessage(null);
    setSaveTone("info");
    setActiveTab("Core Info");
  };

  const updateEditorItem = (updater: (item: ItemMasterSetupItem) => ItemMasterSetupItem) => {
    setEditorDraft((current) => (current ? updater(current) : current));
  };

  const saveEditor = async (mode: "draft" | "continue") => {
    if (!editorItem || isSaving) {
      return;
    }

    const blockers = validationBlockers(editorItem).filter((blocker) => !editorItem.activationBlockers.includes(blocker));
    if (blockers.length > 0) {
      setSaveTone("error");
      setSaveMessage(blockers.join(" "));
      setActiveTab("Core Info");
      return;
    }

    setIsSaving(true);
    setSaveTone("info");
    setSaveMessage("Saving item draft...");

    try {
      const coreRequest = buildCoreRequest(editorItem);
      const savedCore =
        editorMode === "create"
          ? await createItemMasterDraft(session, coreRequest)
          : await updateItemMasterCore(session, editorItem.itemId, coreRequest);

      await updateItemMasterProfile(session, savedCore.id, buildProfileRequest({ ...editorItem, itemId: savedCore.id }));
      await query.refetch();
      setEditorMode("edit");
      setEditorDraft((current) =>
        current
          ? {
              ...current,
              id: `item-${savedCore.id}`,
              itemId: savedCore.id,
              status: savedCore.status,
              source: "Live"
            }
          : current
      );
      setSelectedId(`item-${savedCore.id}`);
      setSaveTone("success");
      setSaveMessage(mode === "continue" ? "Draft saved. Continue editing the item record." : "Item draft saved.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? [error.message, ...error.details.filter((detail) => detail !== error.message)].join(" ")
          : error instanceof Error
            ? error.message
            : "Unable to save the item draft.";
      setSaveTone("error");
      setSaveMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ label: "New item draft", onClick: openCreateEditor }]}
              secondary={[
                {
                  disabled: true,
                  label: "Import / export",
                  reason: "Import and export workflow is pending rollout."
                },
                {
                  disabled: true,
                  label: "Open catalog preview",
                  reason: "Use the Catalog tab to review the current item presentation."
                },
                {
                  disabled: true,
                  label: "Upload media",
                  reason: "Media storage is not enabled for item records."
                }
              ]}
              testId="item-master-action-bar"
            />
          </>
        }
        aside={
          <MasterAside
            description="Review item readiness across catalog, packaging, media, references, and operational policies."
            endpoint="/api/items"
            source={source}
          />
        }
        description="Search and filter item masters with measurement, catalog, packaging, media, inventory, quality, and commercial controls."
        filters={
          <ErpFilterBar
            ariaLabel="Item master filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
              setItemType("all");
              setLifecycleStatus("all");
              setGroup("all");
              setMakeType("all");
              setQcRequired("all");
              setCatalogVisible("all");
              setHasMedia("all");
              setWarehouse("all");
            }}
            testId="item-master-filter-bar"
          >
            <input
              aria-label="Search items"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search item, type, group, category, make/buy"
              value={search}
            />
            <select aria-label="Item status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
            <select aria-label="Item type" onChange={(event) => setItemType(event.target.value)} value={itemType}>
              <option value="all">Type: Any</option>
              {uniqueOptions(records, (record) => record.itemType).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select aria-label="Lifecycle status" onChange={(event) => setLifecycleStatus(event.target.value)} value={lifecycleStatus}>
              <option value="all">Lifecycle: Any</option>
              {uniqueOptions(records, (record) => record.lifecycleStatus).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select aria-label="Item group" onChange={(event) => setGroup(event.target.value)} value={group}>
              <option value="all">Group: Any</option>
              {uniqueOptions(records, (record) => record.groupLabel).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select aria-label="Make buy subcontract" onChange={(event) => setMakeType(event.target.value)} value={makeType}>
              <option value="all">Make/buy: Any</option>
              {uniqueOptions(records, (record) => record.defaultMakeType).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select aria-label="QC required" onChange={(event) => setQcRequired(event.target.value)} value={qcRequired}>
              <option value="all">QC: Any</option>
              <option value="yes">QC required</option>
              <option value="no">QC optional</option>
            </select>
            <select aria-label="Catalog visible" onChange={(event) => setCatalogVisible(event.target.value)} value={catalogVisible}>
              <option value="all">Catalog: Any</option>
              <option value="yes">Catalog visible</option>
                      <option value="no">Restricted</option>
            </select>
            <select aria-label="Has media" onChange={(event) => setHasMedia(event.target.value)} value={hasMedia}>
              <option value="all">Media: Any</option>
              <option value="yes">Has media</option>
              <option value="no">No media</option>
            </select>
            <select aria-label="Default warehouse" onChange={(event) => setWarehouse(event.target.value)} value={warehouse}>
              <option value="all">Warehouse: Any</option>
              {uniqueOptions(records, (record) => record.defaultWarehouse).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </ErpFilterBar>
        }
        title="Item List"
      >
        <KpiStrip
          items={[
            { label: "Total items", value: String(records.length) },
            { label: "Active items", value: String(records.filter((record) => record.status === "Active").length) },
            { label: "Incomplete items", value: String(records.filter((record) => record.activationBlockers.length > 0).length) },
            { label: "QC required", value: String(records.filter((record) => record.isQcRequired).length) },
            { label: "Catalog visible", value: String(records.filter((record) => record.catalogVisible).length) },
            { label: "Make / buy / subcontract", value: `${makeCount} / ${buyCount} / ${subcontractCount}` }
          ]}
        />
        <Card title="Item registry" description="ERP item master with operational, catalog, media, packaging, and reference readiness.">
          <ErpGrid
            ariaLabel="Item master registry"
            columns={itemColumns}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => {
              openEditEditor(record);
            }}
            records={filteredRecords}
            rowLabel={(record) => `${record.code} item master`}
            testId="item-master-grid"
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Deep item master record for manufacturing, planning, inventory, quality, commercial, media, catalog, and reference governance."
        footer={
          <div className="item-master__modal-footer">
            <div className="context-chip-row">
              <ErpStatusChip tone={persistenceReady ? "success" : "info"}>{persistenceReady ? "Live save ready" : "Sign in to save"}</ErpStatusChip>
              <ErpStatusChip tone={editorItem?.status === "Active" ? "success" : "warn"}>{editorItem?.status ?? "Draft"}</ErpStatusChip>
            </div>
            <ErpActionBar
              primary={[{ disabled: isSaving, label: "Save & Continue", onClick: () => void saveEditor("continue") }]}
              secondary={[
                { label: "Review audit", onClick: () => setActiveTab("Audit/History") },
                { disabled: isSaving, label: isSaving ? "Saving..." : "Save Draft", onClick: () => void saveEditor("draft") }
              ]}
              utility={[{ label: "Close", onClick: closeEditor, variant: "quiet" }]}
            />
          </div>
        }
        isOpen={isEditorOpen}
        onClose={closeEditor}
        panelClassName="ui-modal__panel--item-master"
        statusMeta={
          editorItem ? (
            <div className="item-master__modal-titlebar">
              <div>
                <strong>{editorMode === "create" ? "Draft Item" : editorItem.name || "Item detail"}</strong>
                <p>{editorItem.code || "New item code pending"}</p>
              </div>
              <div className="context-chip-row">
                <ErpStatusChip tone={editorItem.status === "Active" ? "success" : "warn"}>{editorItem.lifecycleStatus || "Draft"}</ErpStatusChip>
                <ErpStatusChip tone={editorItem.defaultMakeType ? "info" : "neutral"}>{editorItem.defaultMakeType || "Make/buy pending"}</ErpStatusChip>
                <ErpStatusChip tone={editorItem.isQcRequired ? "warn" : "neutral"}>{editorItem.isQcRequired ? "QC required" : "QC optional"}</ErpStatusChip>
              </div>
            </div>
          ) : null
        }
        title={editorMode === "create" ? "Draft Item" : editorItem?.name || "Item detail"}
      >
        {editorItem ? (
          <div className="item-master__modal-shell">
            <ItemDetailEditor
              activeTab={activeTab}
              item={editorItem}
              records={records}
              saveMessage={saveMessage}
              saveTone={saveTone}
              setActiveTab={setActiveTab}
              updateItem={updateEditorItem}
            />
          </div>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function ItemVariantMatrixPage() {
  const { session } = useAuth();
  const { deferredSearch, filter, search, setSearch, setStatus, status, user } = useCommonFilter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useApiQuery(
    queryKeys.masters.itemVariants(user?.activeContext.companyId, deferredSearch, status),
    () => listItemVariantSetup(session, filter),
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
            <MasterPageActionBar exportLabel="Export variants" primaryLabel="New variant draft" testId="item-variant-action-bar" />
          </>
        }
        aside={
          <MasterAside
            description="Review variant combinations while keeping attribute setup controlled by the master-data process."
            endpoint="/api/item-variants"
            source={source}
          />
        }
        description="Create and review variant combinations, attributes, UOM overrides, and weight overrides."
        filters={
          <CommonFilters
            ariaLabel="Search item variants"
            placeholder="Search variant, item, attribute"
            search={search}
            setSearch={setSearch}
            setStatus={setStatus}
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            status={status}
          />
        }
        title="Item Variant Matrix"
      >
        <KpiStrip
          items={[
            { label: "Variants", value: String(records.length) },
            { label: "Override UOM", value: String(records.filter((record) => record.overrideStockUom !== "Pending").length) },
            { label: "Weight override", value: String(records.filter((record) => record.overrideWeightPerUnit !== "Base item").length) },
            { label: "Active", value: String(records.filter((record) => record.status === "Active").length) }
          ]}
        />
        <Card title="Variant registry" description="Variant key and attribute summary remain visible for sales, planning, and stores.">
          <ErpGrid
            ariaLabel="Item variant registry"
            columns={variantColumns}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} item variant`}
            testId="item-variant-grid"
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Variant detail keeps item linkage and attribute key visible without introducing a separate variant workflow."
        footer={<MasterModalFooter onClose={() => setSelectedId(null)} saveLabel="Save variant draft" />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Variant detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Variant setup">
            <ErpLookupField
              label="Variant item/template selector"
              onChange={() => undefined}
              options={uniqueOptions(records, (record) => record.itemLabel).map((option) => ({ label: option, value: option }))}
              value={selected.itemLabel}
            />
            <label>
              <span>Variant code</span>
              <input defaultValue={selected.code} />
            </label>
            <label>
              <span>Variant key</span>
              <textarea defaultValue={selected.variantKey} rows={3} />
            </label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function BarcodeLabelSetupPage() {
  const { session } = useAuth();
  const { deferredSearch, filter, search, setSearch, setStatus, status, user } = useCommonFilter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useApiQuery(
    queryKeys.masters.barcodes(user?.activeContext.companyId, deferredSearch, status),
    () => listBarcodeSetup(session, filter),
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
            <MasterPageActionBar exportLabel="Export barcode rules" primaryLabel="New barcode draft" testId="barcode-action-bar" />
          </>
        }
        aside={
          <MasterAside
            description="Review barcode assignments while label-template printing remains controlled by the approved rollout."
            endpoint="/api/item-barcodes"
            source={source}
          />
        }
        description="Barcode types, label setup rules, scan purposes, and primary barcode controls."
        filters={
          <CommonFilters
            ariaLabel="Search barcodes"
            placeholder="Search barcode, item, purpose"
            search={search}
            setSearch={setSearch}
            setStatus={setStatus}
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            status={status}
          />
        }
        title="Barcode / Label Setup"
      >
        <KpiStrip
          items={[
            { label: "Barcodes", value: String(records.length) },
            { label: "Primary", value: String(records.filter((record) => record.isPrimary).length) },
            { label: "QR rules", value: String(records.filter((record) => record.barcodeType === "QR").length) },
            { label: "Scan purposes", value: String(new Set(records.map((record) => record.scanPurpose)).size) }
          ]}
        />
        <Card title="Barcode registry" description="Scan-ready item and variant barcode setup.">
          <ErpGrid
            ariaLabel="Barcode registry"
            columns={barcodeColumns}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.barcodeValue} barcode`}
            testId="barcode-grid"
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Barcode detail keeps item and scan-purpose linkage governed by item master setup."
        footer={<MasterModalFooter onClose={() => setSelectedId(null)} saveLabel="Save barcode draft" />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.barcodeValue ?? "Barcode detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Barcode setup">
            <ErpLookupField
              label="Barcode item selector"
              onChange={() => undefined}
              options={uniqueOptions(records, (record) => record.itemLabel).map((option) => ({ label: option, value: option }))}
              value={selected.itemLabel}
            />
            <label>
              <span>Barcode value</span>
              <input defaultValue={selected.barcodeValue} />
            </label>
            <label>
              <span>Scan purpose</span>
              <input defaultValue={selected.scanPurpose} />
            </label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
