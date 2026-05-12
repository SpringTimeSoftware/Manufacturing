import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type { MeasurementProfileUpsertRequest, UomClassUpsertRequest, UomConversionUpsertRequest } from "../api/contracts";
import { ApiError, apiClient } from "../api/http";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  buildMasterFilter,
  canPersistMasterData,
  listMeasurementFormulaSetup,
  listMeasurementProfileSetup,
  listUomClassSetup,
  listUomConversionSetup,
  type MasterDataSource,
  type MeasurementFormulaSetupItem,
  type MeasurementProfileSetupItem,
  type UomClassSetupItem,
  type UomConversionSetupItem
} from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpStatusChip
} from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <ErpStatusChip tone={tone}>{source === "Live" ? "Setup complete" : "Review mode"}</ErpStatusChip>;
}

type SaveTone = "success" | "danger" | "info";

interface UomClassDraft extends UomClassUpsertRequest {
  id: number | null;
}

interface UomConversionDraft extends UomConversionUpsertRequest {
  id: number | null;
}

interface MeasurementProfileDraft extends MeasurementProfileUpsertRequest {
  id: number | null;
}

function measurementErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const details = error.details.filter((detail) => detail !== error.message);
    return [error.message, ...details].join(" ");
  }

  return error instanceof Error ? error.message : fallback;
}

function SaveMessage({ message, tone }: { message: string | null; tone: SaveTone }) {
  return message ? <ErpStatusChip tone={tone}>{message}</ErpStatusChip> : null;
}

function LoadError({ message }: { message: string | null }) {
  return message ? (
    <Card title="Live data unavailable" description={message}>
      <ErpStatusChip tone="danger">Live source required</ErpStatusChip>
    </Card>
  ) : null;
}

function MeasurementAside({
  description,
  source
}: {
  description: string;
  endpoint: string;
  source: MasterDataSource;
}) {
  return (
    <Card title="Measurement guidance" description={description}>
      <div className="notification-item">
        <strong>Measurement records</strong>
        <p>Measurement setup stays aligned with the active master-data rules.</p>
        <div className="context-chip-row">
          <SourceBadge source={source} />
          <Badge tone="info">Master-data safe</Badge>
        </div>
      </div>
    </Card>
  );
}

const uomClassColumns: DataGridColumn<UomClassSetupItem>[] = [
  { key: "code", header: "Class", width: "18%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Purpose",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">Base UOM: {record.baseUom}</div>
      </div>
    )
  },
  {
    key: "formula",
    header: "Formula support",
    width: "18%",
    render: (record) => (
      <ErpStatusChip tone={record.supportsFormulaConversion ? "info" : "neutral"}>
        {record.supportsFormulaConversion ? "Formula enabled" : "Fixed only"}
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

const conversionColumns: DataGridColumn<UomConversionSetupItem>[] = [
  {
    key: "pair",
    header: "Conversion",
    width: "26%",
    render: (record) => (
      <div>
        <strong>
          {record.fromUom} -&gt; {record.toUom}
        </strong>
        <div className="muted">{record.conversionMode}</div>
      </div>
    )
  },
  { key: "factor", header: "Factor / formula", render: (record) => record.factorLabel },
  { key: "tokens", header: "Formula tokens", width: "22%", render: (record) => <span className="code-chip">{record.formulaTokenSet}</span> },
  { key: "round", header: "Rounding", width: "16%", render: (record) => `${record.roundMode} / ${record.precisionScale}` },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const profileColumns: DataGridColumn<MeasurementProfileSetupItem>[] = [
  { key: "code", header: "Profile", width: "18%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Behavior",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.profileType}</div>
      </div>
    )
  },
  { key: "class", header: "Stock class", width: "14%", render: (record) => record.stockUomClass },
  {
    key: "flags",
    header: "Controls",
    width: "26%",
    render: (record) => (
      <div className="context-chip-row">
        {record.allowsCatchWeight ? <ErpStatusChip tone="info">Catch weight</ErpStatusChip> : null}
        {record.requiresDimensions ? <ErpStatusChip tone="warn">Dimensions</ErpStatusChip> : null}
        {record.requiresDensity ? <ErpStatusChip tone="neutral">Density</ErpStatusChip> : null}
      </div>
    )
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const formulaColumns: DataGridColumn<MeasurementFormulaSetupItem>[] = [
  { key: "code", header: "Formula", width: "18%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "expression",
    header: "Expression",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.expression}</div>
      </div>
    )
  },
  { key: "purpose", header: "Purpose", width: "18%", render: (record) => record.purpose },
  { key: "output", header: "Output", width: "12%", render: (record) => record.outputUom },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

function MeasurementActionBar({
  canCreate,
  exportLabel,
  onCreate,
  primaryLabel,
  testId
}: {
  canCreate: boolean;
  exportLabel: string;
  onCreate: () => void;
  primaryLabel: string;
  testId: string;
}) {
  return (
    <ErpActionBar
      primary={[
        {
          disabled: !canCreate,
          label: primaryLabel,
          onClick: canCreate ? onCreate : undefined,
          reason: canCreate ? undefined : "Sign in with measurement setup write access to create this draft."
        }
      ]}
      secondary={[{ disabled: true, label: exportLabel, reason: "Export requires the governed measurement export workflow." }]}
      testId={testId}
    />
  );
}

function MeasurementModalFooter({
  canSave,
  isSaving,
  onClose,
  onSave,
  saveLabel
}: {
  canSave: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  saveLabel: string;
}) {
  return (
    <ErpActionBar
      primary={[
        {
          disabled: !canSave || isSaving,
          label: isSaving ? "Saving..." : saveLabel,
          onClick: canSave && !isSaving ? onSave : undefined,
          reason: canSave ? undefined : "Sign in with measurement setup write access to save this record."
        }
      ]}
      secondary={[
        { disabled: true, label: "Inactivate / activate", reason: "Lifecycle changes require measurement dependency checks." },
        { disabled: true, label: "Review audit", reason: "Measurement audit history requires recorded live changes." }
      ]}
      utility={[{ label: "Close", onClick: onClose, variant: "quiet" }]}
    />
  );
}

export function UomClassMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<UomClassDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveTone, setSaveTone] = useState<SaveTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, undefined, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.measurements.uomClasses(user?.activeContext.companyId, deferredSearch, status),
    () => listUomClassSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = query.isError ? "Deferred" : records[0]?.source ?? "Seeded";
  const canSave = canPersistMasterData(session);
  const baseUomOptions = Array.from(new Map(records.map((record) => [record.baseUomId ?? 0, record.baseUom])).entries())
    .filter(([value]) => value > 0)
    .map(([value, label]) => ({ label, value: String(value) }));
  const loadError = query.isError ? "UOM classes could not be loaded. Reference records are not shown when the setup service is unavailable." : null;
  const openDraft = (record: UomClassSetupItem) => {
    setDraft({
      id: record.uomClassId,
      classCode: record.code,
      className: record.name,
      baseUomId: record.baseUomId,
      supportsFormulaConversion: record.supportsFormulaConversion,
      status: record.status
    });
    setSaveMessage(null);
  };
  const openCreate = () => {
    setDraft({
      id: null,
      classCode: "",
      className: "",
      baseUomId: baseUomOptions[0] ? Number(baseUomOptions[0].value) : null,
      supportsFormulaConversion: false,
      status: "Draft"
    });
    setSaveMessage(null);
  };
  const closeDraft = () => {
    setDraft(null);
    setSaveMessage(null);
  };
  const updateDraft = (changes: Partial<UomClassDraft>) => setDraft((current) => (current ? { ...current, ...changes } : current));
  const saveDraft = async () => {
    if (!draft || !canSave || isSaving) {
      return;
    }

    if (!draft.classCode.trim() || !draft.className.trim()) {
      setSaveTone("danger");
      setSaveMessage("Class code and class name are required.");
      return;
    }

    try {
      setIsSaving(true);
      const request: UomClassUpsertRequest = {
        classCode: draft.classCode.trim(),
        className: draft.className.trim(),
        baseUomId: draft.baseUomId,
        supportsFormulaConversion: draft.supportsFormulaConversion,
        status: draft.status
      };
      const saved = draft.id
        ? await apiClient.measurements.updateUomClass(draft.id, request)
        : await apiClient.measurements.createUomClass(request);
      setDraft((current) => current ? { ...current, id: saved.id } : current);
      await query.refetch();
      setSaveTone("success");
      setSaveMessage("UOM class draft saved.");
    } catch (error) {
      setSaveTone("danger");
      setSaveMessage(measurementErrorMessage(error, "UOM class draft could not be saved."));
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
            <MeasurementActionBar canCreate={canSave} exportLabel="Export classes" onCreate={openCreate} primaryLabel="New UOM class draft" testId="uom-class-action-bar" />
          </>
        }
        aside={
          <MeasurementAside
            description="UOM class setup preserves count, weight, length, area, volume, and time semantics before item masters consume them."
            endpoint="/api/uom/classes"
            source={source}
          />
        }
        description="Count, weight, length, area, volume, and time classes with formula-conversion readiness."
        filters={
          <ErpFilterBar
            ariaLabel="UOM class filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="uom-class-filter-bar"
          >
            <input
              aria-label="Search UOM classes"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search class, name, or base UOM"
              value={search}
            />
            <select aria-label="UOM class status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </ErpFilterBar>
        }
        title="UOM Class Master"
      >
        <LoadError message={loadError} />
        <KpiStrip
          items={[
            { label: "Classes", value: String(records.length) },
            { label: "Formula-ready", value: String(records.filter((record) => record.supportsFormulaConversion).length) },
            { label: "Active", value: String(records.filter((record) => record.status === "Active").length) },
            { label: "Base UOMs", value: String(new Set(records.map((record) => record.baseUom)).size) }
          ]}
        />
        <Card title="UOM class registry" description="System-safe quantity classes for mixed-unit manufacturing setup.">
          <ErpGrid
            ariaLabel="UOM class registry"
            columns={uomClassColumns}
            emptyState={{
              title: "No UOM classes match the current filters",
              description: "Adjust search or status to restore measurement setup."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={openDraft}
            records={records}
            rowLabel={(record) => `${record.code} UOM class`}
            testId="uom-class-grid"
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Class detail stays in a controlled setup workspace without changing runtime conversion behavior."
        footer={<MeasurementModalFooter canSave={canSave} isSaving={isSaving} onClose={closeDraft} onSave={saveDraft} saveLabel="Save class draft" />}
        isOpen={Boolean(draft)}
        onClose={closeDraft}
        title={draft?.className || "UOM class detail"}
      >
        {draft ? (
          <FormShell initialFingerprint={`${draft.id ?? "new"}-${saveMessage ?? ""}`} title="UOM class setup">
            <SaveMessage message={saveMessage} tone={saveTone} />
            <label>
              <span>Class code</span>
              <input onChange={(event) => updateDraft({ classCode: event.target.value })} value={draft.classCode} />
            </label>
            <label>
              <span>Class name</span>
              <input onChange={(event) => updateDraft({ className: event.target.value })} value={draft.className} />
            </label>
            <ErpLookupField
              label="Base UOM"
              onChange={(value) => updateDraft({ baseUomId: value ? Number(value) : null })}
              options={baseUomOptions}
              value={draft.baseUomId ? String(draft.baseUomId) : ""}
            />
            <ErpLookupField
              label="Status"
              onChange={(value) => updateDraft({ status: value })}
              options={["Active", "Draft", "Inactive"].map((value) => ({ label: value, value }))}
              value={draft.status}
            />
            <label className="form-checkbox">
              <input checked={draft.supportsFormulaConversion} onChange={(event) => updateDraft({ supportsFormulaConversion: event.target.checked })} type="checkbox" />
              <span>Formula conversion allowed</span>
            </label>
            <ErpActionBar secondary={[{ disabled: true, label: "Add unit", reason: "Unit maintenance requires UOM setup workflow enablement." }]} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function UomConversionMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<UomConversionDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveTone, setSaveTone] = useState<SaveTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, undefined, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.measurements.uomConversions(user?.activeContext.companyId, deferredSearch, status),
    () => listUomConversionSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = query.isError ? "Deferred" : records[0]?.source ?? "Seeded";
  const canSave = canPersistMasterData(session);
  const uomOptions = Array.from(
    new Map(records.flatMap((record) => [[record.fromUomId, record.fromUom], [record.toUomId, record.toUom]] as Array<[number, string]>)).entries()
  ).map(([value, label]) => ({ label, value: String(value) }));
  const loadError = query.isError ? "UOM conversions could not be loaded. Reference records are not shown when the setup service is unavailable." : null;
  const openDraft = (record: UomConversionSetupItem) => {
    setDraft({
      id: record.conversionId,
      fromUomId: record.fromUomId,
      toUomId: record.toUomId,
      conversionMode: record.conversionMode,
      factorNumerator: record.factorNumerator,
      factorDenominator: record.factorDenominator,
      formulaTokenSet: record.formulaTokenSet === "None" ? null : record.formulaTokenSet,
      roundMode: record.roundMode,
      precisionScale: record.precisionScale,
      status: record.status
    });
    setSaveMessage(null);
  };
  const openCreate = () => {
    const first = records[0];
    setDraft({
      id: null,
      fromUomId: first?.fromUomId ?? (uomOptions[0] ? Number(uomOptions[0].value) : 0),
      toUomId: first?.toUomId ?? (uomOptions[1] ? Number(uomOptions[1].value) : 0),
      conversionMode: "Fixed",
      factorNumerator: 1,
      factorDenominator: 1,
      formulaTokenSet: null,
      roundMode: "Standard",
      precisionScale: 3,
      status: "Draft"
    });
    setSaveMessage(null);
  };
  const closeDraft = () => {
    setDraft(null);
    setSaveMessage(null);
  };
  const updateDraft = (changes: Partial<UomConversionDraft>) => setDraft((current) => (current ? { ...current, ...changes } : current));
  const saveDraft = async () => {
    if (!draft || !canSave || isSaving) {
      return;
    }

    if (!draft.fromUomId || !draft.toUomId || draft.factorNumerator <= 0 || draft.factorDenominator <= 0) {
      setSaveTone("danger");
      setSaveMessage("From UOM, To UOM, and positive conversion factors are required.");
      return;
    }

    try {
      setIsSaving(true);
      const request: UomConversionUpsertRequest = {
        fromUomId: draft.fromUomId,
        toUomId: draft.toUomId,
        conversionMode: draft.conversionMode,
        factorNumerator: draft.factorNumerator,
        factorDenominator: draft.factorDenominator,
        formulaTokenSet: draft.formulaTokenSet?.trim() || null,
        roundMode: draft.roundMode,
        precisionScale: draft.precisionScale,
        status: draft.status
      };
      const saved = draft.id
        ? await apiClient.measurements.updateUomConversion(draft.id, request)
        : await apiClient.measurements.createUomConversion(request);
      setDraft((current) => current ? { ...current, id: saved.id } : current);
      await query.refetch();
      setSaveTone("success");
      setSaveMessage("UOM conversion draft saved.");
    } catch (error) {
      setSaveTone("danger");
      setSaveMessage(measurementErrorMessage(error, "UOM conversion draft could not be saved."));
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
            <MeasurementActionBar canCreate={canSave} exportLabel="Export conversions" onCreate={openCreate} primaryLabel="New conversion draft" testId="uom-conversion-action-bar" />
          </>
        }
        aside={
          <MeasurementAside
            description="Conversion setup supports fixed and formula-based rules without posting stock or production quantities."
            endpoint="/api/uom/conversions"
            source={source}
          />
        }
        description="Fixed and formula-based conversion rules for mixed commercial, stock, production, and QC units."
        filters={
          <ErpFilterBar
            ariaLabel="UOM conversion filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="uom-conversion-filter-bar"
          >
            <input
              aria-label="Search UOM conversions"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search UOM pair, mode, token"
              value={search}
            />
            <select aria-label="UOM conversion status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </ErpFilterBar>
        }
        title="UOM Conversion Master"
      >
        <LoadError message={loadError} />
        <KpiStrip
          items={[
            { label: "Conversions", value: String(records.length) },
            { label: "Formula based", value: String(records.filter((record) => record.conversionMode === "Formula").length) },
            { label: "Fixed", value: String(records.filter((record) => record.conversionMode === "Fixed").length) },
            { label: "Active", value: String(records.filter((record) => record.status === "Active").length) }
          ]}
        />
        <Card title="Conversion registry" description="Rounding, precision, and formula tokens remain visible for audit-friendly setup.">
          <ErpGrid
            ariaLabel="UOM conversion registry"
            columns={conversionColumns}
            emptyState={{
              title: "No conversions match the current filters",
              description: "Adjust search or status to restore conversion setup."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={openDraft}
            records={records}
            rowLabel={(record) => `${record.fromUom} to ${record.toUom} conversion`}
            testId="uom-conversion-grid"
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Conversion detail highlights the calculation rule without executing quantity posting."
        footer={<MeasurementModalFooter canSave={canSave} isSaving={isSaving} onClose={closeDraft} onSave={saveDraft} saveLabel="Save conversion draft" />}
        isOpen={Boolean(draft)}
        onClose={closeDraft}
        title={draft ? `${uomOptions.find((option) => option.value === String(draft.fromUomId))?.label ?? "From"} -> ${uomOptions.find((option) => option.value === String(draft.toUomId))?.label ?? "To"}` : "Conversion detail"}
      >
        {draft ? (
          <FormShell initialFingerprint={`${draft.id ?? "new"}-${saveMessage ?? ""}`} title="Conversion setup">
            <SaveMessage message={saveMessage} tone={saveTone} />
            <ErpLookupField
              label="From UOM"
              onChange={(value) => updateDraft({ fromUomId: Number(value) })}
              options={uomOptions}
              value={String(draft.fromUomId)}
            />
            <ErpLookupField
              label="To UOM"
              onChange={(value) => updateDraft({ toUomId: Number(value) })}
              options={uomOptions}
              value={String(draft.toUomId)}
            />
            <ErpLookupField
              label="Conversion mode"
              onChange={(value) => updateDraft({ conversionMode: value })}
              options={["Fixed", "Formula"].map((value) => ({ label: value, value }))}
              value={draft.conversionMode}
            />
            <ErpDecimalField
              label="Factor numerator"
              min={0}
              onChange={(value) => updateDraft({ factorNumerator: value ?? 0 })}
              scale={6}
              value={draft.factorNumerator}
            />
            <ErpDecimalField
              label="Factor denominator"
              min={0}
              onChange={(value) => updateDraft({ factorDenominator: value ?? 0 })}
              scale={6}
              value={draft.factorDenominator}
            />
            <ErpLookupField
              label="Rounding rule"
              onChange={(value) => updateDraft({ roundMode: value })}
              options={["Standard", "Commercial", "HalfUp", "Bankers", "Floor", "Ceiling"].map((value) => ({ label: value, value }))}
              value={draft.roundMode}
            />
            <ErpNumberField
              label="Decimal places"
              min={0}
              onChange={(value) => updateDraft({ precisionScale: value ?? 0 })}
              value={draft.precisionScale}
            />
            <ErpLookupField
              label="Status"
              onChange={(value) => updateDraft({ status: value })}
              options={["Active", "Draft", "Inactive"].map((value) => ({ label: value, value }))}
              value={draft.status}
            />
            <label>
              <span>Formula tokens</span>
              <textarea onChange={(event) => updateDraft({ formulaTokenSet: event.target.value })} rows={3} value={draft.formulaTokenSet ?? ""} />
            </label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function MeasurementProfileMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<MeasurementProfileDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveTone, setSaveTone] = useState<SaveTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, undefined, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.companyId]
  );
  const profileQuery = useApiQuery(
    queryKeys.measurements.profiles(user?.activeContext.companyId, deferredSearch, status),
    () => listMeasurementProfileSetup(session, filter),
    { staleTime: 60_000 }
  );
  const formulaQuery = useApiQuery(
    ["measurements", "formulas", user?.activeContext.companyId ?? 0, deferredSearch, status],
    () => listMeasurementFormulaSetup(session, filter),
    { staleTime: 60_000 }
  );
  const profiles = profileQuery.data ?? [];
  const formulas = formulaQuery.data ?? [];
  const selectedFormulas = draft?.id ? formulas.filter((formula) => formula.profileId === draft.id) : formulas;
  const source = profileQuery.isError || formulaQuery.isError ? "Deferred" : profiles[0]?.source ?? formulas[0]?.source ?? "Seeded";
  const canSave = canPersistMasterData(session);
  const classOptions = Array.from(new Map(profiles.map((record) => [record.stockUomClassId, record.stockUomClass])).entries())
    .filter(([value]) => value > 0)
    .map(([value, label]) => ({ label, value: String(value) }));
  const profileTypeOptions = Array.from(new Set([...profiles.map((record) => record.profileType), "CountOnly", "DimensionalFormula", "CatchWeight"]))
    .filter(Boolean)
    .map((value) => ({ label: value, value }));
  const loadError = profileQuery.isError || formulaQuery.isError
    ? "Measurement profiles could not be loaded. Reference records are not shown when the setup service is unavailable."
    : null;
  const openDraft = (record: MeasurementProfileSetupItem) => {
    setDraft({
      id: record.profileId,
      profileCode: record.code,
      profileName: record.name,
      profileType: record.profileType,
      stockUomClassId: record.stockUomClassId,
      allowsCatchWeight: record.allowsCatchWeight,
      requiresDimensions: record.requiresDimensions,
      requiresDensity: record.requiresDensity,
      requiresThickness: record.requiresThickness,
      requiresPackSize: record.requiresPackSize,
      supportsCommercialProductionSplit: record.supportsCommercialProductionSplit,
      status: record.status
    });
    setSaveMessage(null);
  };
  const openCreate = () => {
    setDraft({
      id: null,
      profileCode: "",
      profileName: "",
      profileType: "CountOnly",
      stockUomClassId: classOptions[0] ? Number(classOptions[0].value) : 1,
      allowsCatchWeight: false,
      requiresDimensions: false,
      requiresDensity: false,
      requiresThickness: false,
      requiresPackSize: false,
      supportsCommercialProductionSplit: false,
      status: "Draft"
    });
    setSaveMessage(null);
  };
  const closeDraft = () => {
    setDraft(null);
    setSaveMessage(null);
  };
  const updateDraft = (changes: Partial<MeasurementProfileDraft>) => setDraft((current) => (current ? { ...current, ...changes } : current));
  const saveDraft = async () => {
    if (!draft || !canSave || isSaving) {
      return;
    }

    if (!draft.profileCode.trim() || !draft.profileName.trim() || !draft.stockUomClassId) {
      setSaveTone("danger");
      setSaveMessage("Profile code, profile name, and stock UOM class are required.");
      return;
    }

    try {
      setIsSaving(true);
      const request: MeasurementProfileUpsertRequest = {
        profileCode: draft.profileCode.trim(),
        profileName: draft.profileName.trim(),
        profileType: draft.profileType,
        stockUomClassId: draft.stockUomClassId,
        allowsCatchWeight: draft.allowsCatchWeight,
        requiresDimensions: draft.requiresDimensions,
        requiresDensity: draft.requiresDensity,
        requiresThickness: draft.requiresThickness,
        requiresPackSize: draft.requiresPackSize,
        supportsCommercialProductionSplit: draft.supportsCommercialProductionSplit,
        status: draft.status
      };
      const saved = draft.id
        ? await apiClient.measurements.updateProfile(draft.id, request)
        : await apiClient.measurements.createProfile(request);
      setDraft((current) => current ? { ...current, id: saved.id } : current);
      await profileQuery.refetch();
      setSaveTone("success");
      setSaveMessage("Measurement profile draft saved.");
    } catch (error) {
      setSaveTone("danger");
      setSaveMessage(measurementErrorMessage(error, "Measurement profile draft could not be saved."));
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
            <MeasurementActionBar canCreate={canSave} exportLabel="Export profiles" onCreate={openCreate} primaryLabel="New measurement profile" testId="measurement-profile-action-bar" />
          </>
        }
        aside={
          <MeasurementAside
            description="Measurement profiles control catch-weight and dimensional behavior while preserving existing item compatibility records."
            endpoint="/api/measurement-profiles + /api/measurement-formulas"
            source={source}
          />
        }
        description="Profiles for count-only, catch-weight, dimensional, and commercial/production split behavior."
        filters={
          <ErpFilterBar
            ariaLabel="Measurement profile filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="measurement-profile-filter-bar"
          >
            <input
              aria-label="Search measurement profiles"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search profile, type, formula"
              value={search}
            />
            <select aria-label="Measurement profile status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </ErpFilterBar>
        }
        title="Measurement Profile Master"
      >
        <LoadError message={loadError} />
        <KpiStrip
          items={[
            { label: "Profiles", value: String(profiles.length) },
            { label: "Catch weight", value: String(profiles.filter((record) => record.allowsCatchWeight).length) },
            { label: "Dimensional", value: String(profiles.filter((record) => record.requiresDimensions).length) },
            { label: "Formulas", value: String(formulas.length) }
          ]}
        />
        <div className="split-panels">
          <Card title="Profile registry" description="Measurement behavior attached later to item masters and variants.">
            <ErpGrid
              ariaLabel="Measurement profile registry"
              columns={profileColumns}
              emptyState={{
                title: "No measurement profiles match the current filters",
                description: "Adjust search or status to restore measurement profiles."
              }}
              getRowId={(record) => record.id}
              isLoading={profileQuery.isLoading}
              onRowSelect={openDraft}
              records={profiles}
              rowLabel={(record) => `${record.code} measurement profile`}
              testId="measurement-profile-grid"
              virtualization={{ enabled: true }}
            />
          </Card>
          <Card title="Formula registry" description="Dimensional and catch-weight expressions remain reviewable beside profile setup.">
            <ErpGrid
              ariaLabel="Measurement formula registry"
              columns={formulaColumns}
              emptyState={{
                title: "No formulas match the current filters",
                description: "Adjust search or status to restore formula setup."
              }}
              getRowId={(record) => record.id}
              isLoading={formulaQuery.isLoading}
              records={formulas}
              rowLabel={(record) => `${record.code} measurement formula`}
              virtualization={{ enabled: true }}
            />
          </Card>
        </div>
      </ListPageShell>

      <ErpModalWorkspace
        description="Profile detail keeps catch-weight and formula behavior explicit for audit review."
        footer={<MeasurementModalFooter canSave={canSave} isSaving={isSaving} onClose={closeDraft} onSave={saveDraft} saveLabel="Save profile draft" />}
        isOpen={Boolean(draft)}
        onClose={closeDraft}
        title={draft?.profileName || "Measurement profile detail"}
      >
        {draft ? (
          <>
            <div className="utility-grid">
              <Tile eyebrow={draft.profileType} label="Catch weight" meta={draft.status}>
                {draft.allowsCatchWeight ? "Allowed" : "Not allowed"}
              </Tile>
              <Tile eyebrow="Formula count" label="Dimensional logic" meta={classOptions.find((option) => option.value === String(draft.stockUomClassId))?.label ?? "UOM class"}>
                {selectedFormulas.length}
              </Tile>
            </div>
            <FormShell initialFingerprint={`${draft.id ?? "new"}-${saveMessage ?? ""}`} title="Measurement profile setup">
              <SaveMessage message={saveMessage} tone={saveTone} />
              <label>
                <span>Profile code</span>
                <input onChange={(event) => updateDraft({ profileCode: event.target.value })} value={draft.profileCode} />
              </label>
              <label>
                <span>Profile name</span>
                <input onChange={(event) => updateDraft({ profileName: event.target.value })} value={draft.profileName} />
              </label>
              <ErpLookupField
                label="Stock UOM class"
                onChange={(value) => updateDraft({ stockUomClassId: Number(value) })}
                options={classOptions}
                value={String(draft.stockUomClassId)}
              />
              <ErpLookupField
                label="Profile type"
                onChange={(value) => updateDraft({ profileType: value })}
                options={profileTypeOptions}
                value={draft.profileType}
              />
              <ErpLookupField
                label="Dimension UOM class"
                onChange={(value) => updateDraft({ stockUomClassId: Number(value) })}
                options={classOptions}
                value={String(draft.stockUomClassId)}
              />
              <ErpLookupField
                label="Weight UOM class"
                onChange={(value) => updateDraft({ stockUomClassId: Number(value) })}
                options={classOptions}
                value={String(draft.stockUomClassId)}
              />
              <ErpNumberField disabled disabledReason="Precision is controlled by formula rules." label="Precision" min={0} onChange={() => undefined} value={draft.requiresDimensions ? 3 : 0} />
              <ErpLookupField
                label="Status"
                onChange={(value) => updateDraft({ status: value })}
                options={["Active", "Draft", "Inactive"].map((value) => ({ label: value, value }))}
                value={draft.status}
              />
              <label className="form-checkbox">
                <input checked={draft.allowsCatchWeight} onChange={(event) => updateDraft({ allowsCatchWeight: event.target.checked })} type="checkbox" />
                <span>Catch weight enabled</span>
              </label>
              <label className="form-checkbox">
                <input checked={draft.requiresDimensions} onChange={(event) => updateDraft({ requiresDimensions: event.target.checked })} type="checkbox" />
                <span>Dimensions required</span>
              </label>
              <label className="form-checkbox">
                <input checked={draft.requiresDensity} onChange={(event) => updateDraft({ requiresDensity: event.target.checked })} type="checkbox" />
                <span>Density required</span>
              </label>
              <label className="form-checkbox">
                <input checked={draft.requiresThickness} onChange={(event) => updateDraft({ requiresThickness: event.target.checked })} type="checkbox" />
                <span>Thickness required</span>
              </label>
              <label className="form-checkbox">
                <input checked={draft.requiresPackSize} onChange={(event) => updateDraft({ requiresPackSize: event.target.checked })} type="checkbox" />
                <span>Pack size required</span>
              </label>
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
