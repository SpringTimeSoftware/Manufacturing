import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type { UdfDefinitionUpsertRequest } from "../api/contracts";
import { useApiMutation, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  listUdfDefinitions,
  listUdfPlacements,
  listCustomObjects,
  listCustomScreens,
  saveUdfDefinition,
  type CustomObjectItem,
  type CustomScreenItem,
  type UdfDefinitionItem,
  type UdfPlacementItem
} from "../platform/platformAdminAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpLookupField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

const entityOptions = [
  { label: "Item", value: "Item" },
  { label: "Customer", value: "Customer" },
  { label: "Supplier", value: "Supplier" },
  { label: "Quote", value: "Quote" },
  { label: "Sales order", value: "SalesOrder" },
  { label: "Purchase order", value: "PurchaseOrder" },
  { label: "Shipment", value: "Shipment" },
  { label: "GL journal", value: "Journal" },
  { label: "Work order", value: "WorkOrder" },
  { label: "Job card", value: "JobCard" },
  { label: "Quality inspection", value: "Inspection" },
  { label: "Dispatch pack list", value: "PackList" }
];

const moduleOptions = ["Master", "Commercial", "Procurement", "Inventory", "Production", "Quality", "Dispatch", "Finance", "Reporting", "Integrations", "Mobile", "Platform"].map((value) => ({
  label: value,
  value
}));

const entityLevelOptions = ["Header", "Line", "Detail", "Evidence", "Address", "Contact"].map((value) => ({ label: value, value }));

const dataTypeOptions = [
  { label: "Text", value: "Text" },
  { label: "Long text", value: "LongText" },
  { label: "Integer", value: "Integer" },
  { label: "Decimal", value: "Decimal" },
  { label: "Money", value: "Money" },
  { label: "Date", value: "Date" },
  { label: "Date time", value: "DateTime" },
  { label: "Boolean", value: "Boolean" },
  { label: "Single select", value: "SingleSelect" },
  { label: "Multi select", value: "MultiSelect" },
  { label: "Lookup", value: "Lookup" },
  { label: "Attachment reference", value: "AttachmentReference" },
  { label: "URL", value: "Url" },
  { label: "Email", value: "Email" },
  { label: "Phone", value: "Phone" },
  { label: "Governed JSON", value: "Json" }
];

const controlTypeOptions = [
  { label: "Text", value: "Text" },
  { label: "Lookup", value: "Lookup" },
  { label: "Select", value: "Select" },
  { label: "Number", value: "Number" },
  { label: "Decimal", value: "Decimal" },
  { label: "Money", value: "Money" },
  { label: "Date", value: "Date" },
  { label: "Date time", value: "DateTime" },
  { label: "Checkbox", value: "Checkbox" }
];

const lookupSourceOptions = [
  { label: "No lookup source", value: "" },
  { label: "Reason codes", value: "ReasonCode" },
  { label: "Currency", value: "Currency" },
  { label: "Tax codes", value: "TaxCode" },
  { label: "UOM", value: "UOM" },
  { label: "Dispatch window", value: "DispatchWindow" }
];

const roleVisibilityOptions = [
  { label: "All company administrators", value: "CompanyAdmin" },
  { label: "Engineering and company administrators", value: "CompanyAdmin,EngineeringManager" },
  { label: "Commercial owners", value: "CompanyAdmin,SalesCoordinator,PurchaseManager" },
  { label: "Production and quality owners", value: "CompanyAdmin,PlanningManager,ProductionSupervisor,QualityManager" },
  { label: "Dispatch owners", value: "CompanyAdmin,DispatchManager" }
];

const emptyDraft: UdfDefinitionUpsertRequest = {
  companyId: 1,
  entityType: "Item",
  fieldKey: "",
  label: "",
  dataType: "Text",
  controlType: "Text",
  lookupSource: null,
  isRequired: false,
  minNumber: null,
  maxNumber: null,
  maxLength: 80,
  decimalScale: null,
  roleVisibility: "CompanyAdmin",
  status: "Active",
  module: "Master",
  entityLevel: "Header",
  entitySubType: null,
  description: null,
  isUnique: false,
  isReadOnly: false,
  defaultValue: null,
  placeholderText: null,
  helpText: null,
  displayOrder: 100,
  sectionName: "General",
  effectiveFrom: null,
  effectiveTo: null,
  validationRulesJson: null,
  optionSetCode: null,
  lookupSourceType: null,
  isReportable: true,
  allowIntegration: false,
  allowMobile: false,
  isSensitive: false,
  lifecycleGate: "DraftSave",
  valueLockPolicy: "LockOnRelease"
};

function toDraft(record: UdfDefinitionItem): UdfDefinitionUpsertRequest {
  return {
    companyId: record.companyId ?? 1,
    entityType: record.entityType,
    fieldKey: record.fieldKey,
    label: record.label,
    dataType: record.dataType,
    controlType: record.controlType,
    lookupSource: record.lookupSource ?? null,
    isRequired: record.isRequired,
    minNumber: record.minNumber ?? null,
    maxNumber: record.maxNumber ?? null,
    maxLength: record.maxLength ?? null,
    decimalScale: record.decimalScale ?? null,
    roleVisibility: record.roleVisibility,
    status: record.status,
    module: record.module,
    entityLevel: record.entityLevel,
    entitySubType: record.entitySubType ?? null,
    description: record.description ?? null,
    isUnique: record.isUnique,
    isReadOnly: record.isReadOnly,
    defaultValue: record.defaultValue ?? null,
    placeholderText: record.placeholderText ?? null,
    helpText: record.helpText ?? null,
    displayOrder: record.displayOrder,
    sectionName: record.sectionName ?? null,
    effectiveFrom: record.effectiveFrom ?? null,
    effectiveTo: record.effectiveTo ?? null,
    validationRulesJson: record.validationRulesJson ?? null,
    optionSetCode: record.optionSetCode ?? null,
    lookupSourceType: record.lookupSourceType ?? null,
    isReportable: record.isReportable,
    allowIntegration: record.allowIntegration,
    allowMobile: record.allowMobile,
    isSensitive: record.isSensitive,
    lifecycleGate: record.lifecycleGate,
    valueLockPolicy: record.valueLockPolicy
  };
}

function validateDraft(draft: UdfDefinitionUpsertRequest) {
  const errors: string[] = [];
  if (!draft.entityType) errors.push("Entity type is required.");
  if (!draft.module) errors.push("Module is required.");
  if (!draft.entityLevel) errors.push("Entity level is required.");
  if (!draft.fieldKey.trim()) errors.push("Field key is required.");
  if (!draft.label.trim()) errors.push("Field label is required.");
  if (!draft.dataType) errors.push("Data type is required.");
  if (!draft.controlType) errors.push("Control type is required.");
  if (!draft.roleVisibility) errors.push("Role visibility is required.");
  if (draft.maxLength !== null && draft.maxLength !== undefined && draft.maxLength <= 0) {
    errors.push("Maximum length must be greater than zero.");
  }
  if (draft.decimalScale !== null && draft.decimalScale !== undefined && (draft.decimalScale < 0 || draft.decimalScale > 6)) {
    errors.push("Decimal scale must be between 0 and 6.");
  }
  if (draft.minNumber !== null && draft.maxNumber !== null && draft.minNumber !== undefined && draft.maxNumber !== undefined && draft.minNumber > draft.maxNumber) {
    errors.push("Minimum value must be less than or equal to maximum value.");
  }
  if ((draft.dataType === "Lookup" || draft.controlType === "Lookup" || draft.controlType === "Select") && !draft.lookupSource) {
    errors.push("Lookup source is required for lookup or select fields.");
  }
  if (draft.effectiveFrom && draft.effectiveTo && draft.effectiveFrom > draft.effectiveTo) {
    errors.push("Effective from must be earlier than effective to.");
  }
  if (draft.validationRulesJson) {
    try {
      JSON.parse(draft.validationRulesJson);
    } catch {
      errors.push("Validation rules must be valid JSON.");
    }
  }
  return errors;
}

const columns: DataGridColumn<UdfDefinitionItem>[] = [
  {
    key: "field",
    header: "Field",
    width: "28%",
    render: (record) => (
      <div>
        <strong>{record.label}</strong>
        <div className="muted">{record.fieldKey}</div>
      </div>
    )
  },
  {
    key: "entity",
    header: "Entity",
    width: "16%",
    render: (record) => record.entityType
  },
  {
    key: "control",
    header: "Control",
    width: "18%",
    render: (record) => `${record.dataType} / ${record.controlType}`
  },
  {
    key: "roles",
    header: "Visible to",
    width: "24%",
    render: (record) => record.roleVisibility
  },
  {
    key: "status",
    header: "Status",
    width: "10%",
    render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge>
  }
];

const placementColumns: DataGridColumn<UdfPlacementItem>[] = [
  {
    key: "field",
    header: "Placed field",
    width: "26%",
    render: (record) => (
      <div>
        <strong>{record.label}</strong>
        <div className="muted">{record.fieldKey}</div>
      </div>
    )
  },
  { key: "screen", header: "Screen", width: "24%", render: (record) => record.screenKey },
  { key: "level", header: "Level", width: "14%", render: (record) => record.entityLevel },
  { key: "section", header: "Section", width: "18%", render: (record) => record.sectionName },
  { key: "status", header: "Status", width: "12%", render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge> }
];

const customObjectColumns: DataGridColumn<CustomObjectItem>[] = [
  {
    key: "object",
    header: "Custom object",
    width: "32%",
    render: (record) => (
      <div>
        <strong>{record.objectName}</strong>
        <div className="muted">{record.objectCode}</div>
      </div>
    )
  },
  { key: "module", header: "Module", width: "16%", render: (record) => record.module },
  { key: "primary", header: "Primary field", width: "20%", render: (record) => record.primaryDisplayFieldCode ?? "Not configured" },
  { key: "status", header: "Status", width: "12%", render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge> }
];

const customScreenColumns: DataGridColumn<CustomScreenItem>[] = [
  {
    key: "screen",
    header: "Custom screen",
    width: "32%",
    render: (record) => (
      <div>
        <strong>{record.screenName}</strong>
        <div className="muted">{record.screenCode}</div>
      </div>
    )
  },
  { key: "route", header: "Route", width: "24%", render: (record) => record.routePath },
  { key: "module", header: "Module", width: "16%", render: (record) => record.module },
  { key: "status", header: "Status", width: "12%", render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge> }
];

export function PlatformExtensibilityPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<UdfDefinitionItem | null>(null);
  const [draft, setDraft] = useState<UdfDefinitionUpsertRequest>({ ...emptyDraft });
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const query = useApiQuery(
    ["platform", "udf-definitions", deferredSearch, entityFilter, statusFilter],
    () =>
      listUdfDefinitions(session, {
        search: deferredSearch,
        entityType: entityFilter,
        status: statusFilter
      }),
    { staleTime: 60_000 }
  );
  const placementQuery = useApiQuery(
    ["platform", "udf-placements", entityFilter, statusFilter],
    () => listUdfPlacements(session, { entityType: entityFilter === "all" ? undefined : entityFilter }),
    { staleTime: 60_000 }
  );
  const customObjectQuery = useApiQuery(
    ["platform", "custom-objects", statusFilter],
    () => listCustomObjects(session, { status: statusFilter }),
    { staleTime: 60_000 }
  );
  const customScreenQuery = useApiQuery(
    ["platform", "custom-screens", statusFilter],
    () => listCustomScreens(session, { status: statusFilter }),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const placements = placementQuery.data ?? [];
  const customObjects = customObjectQuery.data ?? [];
  const customScreens = customScreenQuery.data ?? [];

  const mutation = useApiMutation(
    ({ id, request }: { id: number | null; request: UdfDefinitionUpsertRequest }) =>
      saveUdfDefinition(session, id, request),
    {
      onSuccess: () => {
        setSelected(null);
        setDraft({ ...emptyDraft });
        setEditorOpen(false);
        setSaveError(null);
      },
      onError: (error) => setSaveError(error.message)
    }
  );

  const validationErrors = useMemo(() => validateDraft(draft), [draft]);
  const activeCount = records.filter((record) => record.status === "Active").length;
  const lookupCount = records.filter((record) => record.dataType === "Lookup" || record.controlType === "Lookup" || record.controlType === "Select").length;
  const numericCount = records.filter((record) => ["Number", "Decimal", "Money", "Integer"].includes(record.dataType)).length;

  const openNew = () => {
    setSelected(null);
    setDraft({ ...emptyDraft });
    setEditorOpen(true);
    setSaveError(null);
  };

  const openExisting = (record: UdfDefinitionItem) => {
    setSelected(record);
    setDraft(toDraft(record));
    setEditorOpen(true);
    setSaveError(null);
  };

  return (
    <>
      <ListPageShell
        actions={
          <ErpActionBar
            primary={[{ label: "New field", onClick: openNew }]}
            secondary={[
              {
                disabled: true,
                label: "Import definitions",
                reason: "Bulk import requires approved import mapping before it can accept files."
              }
            ]}
            testId="platform-extensibility-action-bar"
          />
        }
        description="Define controlled extension fields for implemented business records without changing core schemas."
        filters={
          <FilterBar>
            <input
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search field, entity, or role"
              value={search}
            />
            <select onChange={(event) => setEntityFilter(event.target.value)} value={entityFilter}>
              <option value="all">Entity: All</option>
              {entityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>
          </FilterBar>
        }
        title="Extensibility"
      >
        <KpiStrip
          items={[
            { label: "Definitions", value: String(records.length) },
            { label: "Active", value: String(activeCount) },
            { label: "Lookup-backed", value: String(lookupCount) },
            { label: "Numeric", value: String(numericCount) },
            { label: "Placements", value: String(placements.length) },
            { label: "Custom screens", value: String(customScreens.length) }
          ]}
        />

        {query.isError ? (
          <EmptyState
            description="Field definitions could not be loaded for the current operating context."
            hint={query.error instanceof Error ? query.error.message : undefined}
            title="Extensibility unavailable"
          />
        ) : null}

        <Card title="Field definitions" description="Controlled extension metadata with role visibility and validation rules.">
          <DataGrid
            ariaLabel="Extensibility field definitions"
            columns={columns}
            emptyState={{
              title: "No field definitions match the current filter",
              description: "Adjust the search, entity, or status filters to review the configured extension fields."
            }}
            getRowId={(record) => String(record.id)}
            isLoading={query.isLoading}
            onRowSelect={openExisting}
            records={records}
            rowLabel={(record) => `${record.label} definition`}
            virtualization={{ enabled: true }}
          />
        </Card>

        <Card title="Domain placements" description="Active UDFs are rendered through placement metadata in real workspaces.">
          <DataGrid
            ariaLabel="Extensibility field placements"
            columns={placementColumns}
            emptyState={{
              title: "No placements match the current filter",
              description: "Place active fields onto a real screen before collecting custom values."
            }}
            getRowId={(record) => String(record.id)}
            isLoading={placementQuery.isLoading}
            records={placements}
            rowLabel={(record) => `${record.label} placement`}
            virtualization={{ enabled: true }}
          />
        </Card>

        <Card title="Custom objects" description="Metadata-driven custom records use governed object definitions and typed UDF values.">
          <DataGrid
            ariaLabel="Custom object definitions"
            columns={customObjectColumns}
            emptyState={{
              title: "No custom objects match the current filter",
              description: "Create governed custom objects when a business extension needs records, not new unsafe SQL tables."
            }}
            getRowId={(record) => String(record.id)}
            isLoading={customObjectQuery.isLoading}
            records={customObjects}
            rowLabel={(record) => `${record.objectName} custom object`}
            virtualization={{ enabled: true }}
          />
        </Card>

        <Card title="Custom screens" description="Dynamic screens are permissioned route definitions bound to core or custom objects.">
          <DataGrid
            ariaLabel="Custom screen definitions"
            columns={customScreenColumns}
            emptyState={{
              title: "No custom screens match the current filter",
              description: "Custom screens remain unavailable until a governed definition, layout, and permission key are saved."
            }}
            getRowId={(record) => String(record.id)}
            isLoading={customScreenQuery.isLoading}
            records={customScreens}
            rowLabel={(record) => `${record.screenName} custom screen`}
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Create or edit a controlled field definition with validation and role visibility."
        footer={
          <ErpActionBar
            primary={[
              {
                disabled: validationErrors.length > 0 || mutation.isPending,
                label: mutation.isPending ? "Saving..." : "Save definition",
                onClick: () => mutation.mutate({ id: selected?.id ?? null, request: draft }),
                reason: validationErrors[0]
              }
            ]}
            utility={[{ label: "Close", onClick: () => { setSelected(null); setDraft({ ...emptyDraft }); setEditorOpen(false); }, variant: "quiet" }]}
          />
        }
        isOpen={isEditorOpen}
        onClose={() => {
          setSelected(null);
          setDraft({ ...emptyDraft });
          setEditorOpen(false);
        }}
        title={selected ? `Edit ${selected.label}` : "New field definition"}
        validation={<ErpValidationSummary errors={saveError ? [saveError, ...validationErrors] : validationErrors} />}
      >
        <FormShell initialFingerprint={selected ? String(selected.id) : "new-udf"} title="Definition">
          <ErpLookupField
            label="Entity type"
            onChange={(value) => setDraft((current) => ({ ...current, entityType: value }))}
            options={entityOptions}
            required
            value={draft.entityType}
          />
          <ErpLookupField
            label="Module"
            onChange={(value) => setDraft((current) => ({ ...current, module: value }))}
            options={moduleOptions}
            required
            value={draft.module ?? "Master"}
          />
          <ErpLookupField
            label="Entity level"
            onChange={(value) => setDraft((current) => ({ ...current, entityLevel: value }))}
            options={entityLevelOptions}
            required
            value={draft.entityLevel ?? "Header"}
          />
          <label>
            <span>Field key</span>
            <input
              onChange={(event) => setDraft((current) => ({ ...current, fieldKey: event.target.value }))}
              required
              value={draft.fieldKey}
            />
          </label>
          <label>
            <span>Label</span>
            <input
              onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
              required
              value={draft.label}
            />
          </label>
          <label>
            <span>Section</span>
            <input
              onChange={(event) => setDraft((current) => ({ ...current, sectionName: event.target.value || null }))}
              value={draft.sectionName ?? ""}
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value || null }))}
              rows={3}
              value={draft.description ?? ""}
            />
          </label>
          <ErpLookupField
            label="Data type"
            onChange={(value) => setDraft((current) => ({ ...current, dataType: value }))}
            options={dataTypeOptions}
            required
            value={draft.dataType}
          />
          <ErpLookupField
            label="Control type"
            onChange={(value) => setDraft((current) => ({ ...current, controlType: value }))}
            options={controlTypeOptions}
            required
            value={draft.controlType}
          />
          <ErpLookupField
            label="Lookup source"
            onChange={(value) => setDraft((current) => ({ ...current, lookupSource: value || null }))}
            options={lookupSourceOptions}
            value={draft.lookupSource ?? ""}
          />
          <label>
            <span>Option set code</span>
            <input
              onChange={(event) => setDraft((current) => ({ ...current, optionSetCode: event.target.value || null }))}
              value={draft.optionSetCode ?? ""}
            />
          </label>
          <ErpLookupField
            label="Role visibility"
            onChange={(value) => setDraft((current) => ({ ...current, roleVisibility: value }))}
            options={roleVisibilityOptions}
            required
            value={draft.roleVisibility}
          />
          <ErpLookupField
            label="Status"
            onChange={(value) => setDraft((current) => ({ ...current, status: value }))}
            options={[
              { label: "Active", value: "Active" },
              { label: "Draft", value: "Draft" },
              { label: "Inactive", value: "Inactive" }
            ]}
            required
            value={draft.status}
          />
          <label className="login-form__toggle">
            <span>Required field</span>
            <input
              checked={draft.isRequired}
              onChange={(event) => setDraft((current) => ({ ...current, isRequired: event.target.checked }))}
              type="checkbox"
            />
          </label>
          <label className="login-form__toggle">
            <span>Read-only field</span>
            <input
              checked={draft.isReadOnly ?? false}
              onChange={(event) => setDraft((current) => ({ ...current, isReadOnly: event.target.checked }))}
              type="checkbox"
            />
          </label>
          <label className="login-form__toggle">
            <span>Expose to reports</span>
            <input
              checked={draft.isReportable ?? false}
              onChange={(event) => setDraft((current) => ({ ...current, isReportable: event.target.checked }))}
              type="checkbox"
            />
          </label>
          <label className="login-form__toggle">
            <span>Allow integration payload</span>
            <input
              checked={draft.allowIntegration ?? false}
              onChange={(event) => setDraft((current) => ({ ...current, allowIntegration: event.target.checked }))}
              type="checkbox"
            />
          </label>
          <label className="login-form__toggle">
            <span>Allow mobile capture</span>
            <input
              checked={draft.allowMobile ?? false}
              onChange={(event) => setDraft((current) => ({ ...current, allowMobile: event.target.checked }))}
              type="checkbox"
            />
          </label>
          <label className="login-form__toggle">
            <span>Sensitive field</span>
            <input
              checked={draft.isSensitive ?? false}
              onChange={(event) => setDraft((current) => ({ ...current, isSensitive: event.target.checked }))}
              type="checkbox"
            />
          </label>
        </FormShell>

        <FormShell initialFingerprint={`${selected?.id ?? "new"}-validation`} title="Validation">
          <ErpNumberField
            label="Maximum text length"
            min={1}
            onChange={(value) => setDraft((current) => ({ ...current, maxLength: value }))}
            value={draft.maxLength ?? null}
          />
          <ErpDecimalField
            label="Minimum numeric value"
            onChange={(value) => setDraft((current) => ({ ...current, minNumber: value }))}
            scale={3}
            value={draft.minNumber ?? null}
          />
          <ErpDecimalField
            label="Maximum numeric value"
            onChange={(value) => setDraft((current) => ({ ...current, maxNumber: value }))}
            scale={3}
            value={draft.maxNumber ?? null}
          />
          <ErpNumberField
            label="Decimal scale"
            max={6}
            min={0}
            onChange={(value) => setDraft((current) => ({ ...current, decimalScale: value }))}
            value={draft.decimalScale ?? null}
          />
          <label>
            <span>Default value</span>
            <input
              onChange={(event) => setDraft((current) => ({ ...current, defaultValue: event.target.value || null }))}
              value={draft.defaultValue ?? ""}
            />
          </label>
          <label>
            <span>Placeholder text</span>
            <input
              onChange={(event) => setDraft((current) => ({ ...current, placeholderText: event.target.value || null }))}
              value={draft.placeholderText ?? ""}
            />
          </label>
          <label>
            <span>Help text</span>
            <input
              onChange={(event) => setDraft((current) => ({ ...current, helpText: event.target.value || null }))}
              value={draft.helpText ?? ""}
            />
          </label>
          <ErpNumberField
            label="Display order"
            min={0}
            onChange={(value) => setDraft((current) => ({ ...current, displayOrder: value ?? 100 }))}
            value={draft.displayOrder ?? 100}
          />
          <label>
            <span>Validation rules JSON</span>
            <textarea
              onChange={(event) => setDraft((current) => ({ ...current, validationRulesJson: event.target.value || null }))}
              rows={4}
              value={draft.validationRulesJson ?? ""}
            />
          </label>
        </FormShell>
      </ErpModalWorkspace>
    </>
  );
}
