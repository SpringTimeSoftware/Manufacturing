import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  buildMasterFilter,
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
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
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
  exportLabel,
  primaryLabel,
  testId
}: {
  exportLabel: string;
  primaryLabel: string;
  testId: string;
}) {
  return (
    <ErpActionBar
      primary={[{ disabled: true, label: primaryLabel, reason: "Draft creation is controlled by the measurement setup workflow." }]}
      secondary={[{ disabled: true, label: exportLabel, reason: "Export is pending the governed export workflow." }]}
      testId={testId}
    />
  );
}

function MeasurementModalFooter({ onClose, saveLabel }: { onClose: () => void; saveLabel: string }) {
  return (
    <ErpActionBar
      primary={[{ disabled: true, label: saveLabel, reason: "Save is disabled until the measurement setup workflow is enabled." }]}
      secondary={[{ disabled: true, label: "Review audit", reason: "Audit review is pending rollout." }]}
      utility={[{ label: "Close", onClick: onClose, variant: "quiet" }]}
    />
  );
}

export function UomClassMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <MeasurementActionBar exportLabel="Export classes" primaryLabel="New UOM class draft" testId="uom-class-action-bar" />
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
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.code} UOM class`}
            testId="uom-class-grid"
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Class detail stays in a controlled setup workspace without changing runtime conversion behavior."
        footer={<MeasurementModalFooter onClose={() => setSelectedId(null)} saveLabel="Save class draft" />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "UOM class detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="UOM class setup">
            <label>
              <span>Class code</span>
              <input defaultValue={selected.code} />
            </label>
            <label>
              <span>Class name</span>
              <input defaultValue={selected.name} />
            </label>
            <ErpLookupField
              label="Base UOM"
              onChange={() => undefined}
              options={Array.from(new Set(records.map((record) => record.baseUom))).map((option) => ({ label: option, value: option }))}
              value={selected.baseUom}
            />
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <MeasurementActionBar exportLabel="Export conversions" primaryLabel="New conversion draft" testId="uom-conversion-action-bar" />
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
            onRowSelect={(record) => setSelectedId(record.id)}
            records={records}
            rowLabel={(record) => `${record.fromUom} to ${record.toUom} conversion`}
            testId="uom-conversion-grid"
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description="Conversion detail highlights the calculation rule without executing quantity posting."
        footer={<MeasurementModalFooter onClose={() => setSelectedId(null)} saveLabel="Save conversion draft" />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.fromUom} -> ${selected.toUom}` : "Conversion detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Conversion setup">
            <ErpLookupField
              label="From UOM"
              onChange={() => undefined}
              options={Array.from(new Set(records.flatMap((record) => [record.fromUom, record.toUom]))).map((option) => ({ label: option, value: option }))}
              value={selected.fromUom}
            />
            <ErpLookupField
              label="To UOM"
              onChange={() => undefined}
              options={Array.from(new Set(records.flatMap((record) => [record.fromUom, record.toUom]))).map((option) => ({ label: option, value: option }))}
              value={selected.toUom}
            />
            <label>
              <span>Factor or formula</span>
              <input defaultValue={selected.factorLabel} />
            </label>
            <label>
              <span>Formula tokens</span>
              <textarea defaultValue={selected.formulaTokenSet} rows={3} />
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const selected = profiles.find((record) => record.id === selectedId) ?? null;
  const selectedFormulas = selected ? formulas.filter((formula) => formula.profileId === selected.profileId) : formulas;
  const source = profiles[0]?.source ?? formulas[0]?.source ?? "Seeded";

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <MeasurementActionBar exportLabel="Export profiles" primaryLabel="New measurement profile" testId="measurement-profile-action-bar" />
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
              onRowSelect={(record) => setSelectedId(record.id)}
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
        footer={<MeasurementModalFooter onClose={() => setSelectedId(null)} saveLabel="Save profile draft" />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name ?? "Measurement profile detail"}
      >
        {selected ? (
          <>
            <div className="utility-grid">
              <Tile eyebrow={selected.profileType} label="Catch weight" meta={selected.status}>
                {selected.allowsCatchWeight ? "Allowed" : "Not allowed"}
              </Tile>
              <Tile eyebrow="Formula count" label="Dimensional logic" meta={selected.stockUomClass}>
                {selectedFormulas.length}
              </Tile>
            </div>
            <FormShell initialFingerprint={selected.id} title="Measurement profile setup">
              <label>
                <span>Profile code</span>
                <input defaultValue={selected.code} />
              </label>
              <label>
                <span>Profile name</span>
                <input defaultValue={selected.name} />
              </label>
              <ErpLookupField
                label="Stock UOM class"
                onChange={() => undefined}
                options={Array.from(new Set(profiles.map((record) => record.stockUomClass))).map((option) => ({ label: option, value: option }))}
                value={selected.stockUomClass}
              />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
