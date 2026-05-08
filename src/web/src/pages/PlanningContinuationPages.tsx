import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import { listCapacityBoardSetup, type CapacityBucketItem } from "../planning/planningAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpFilterBar, ErpGrid, ErpLookupField, ErpModalWorkspace } from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip, LaneBoard, type Lane } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <Badge tone={tone}>{source === "Live" ? "Setup complete" : "Readiness view"}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("overloaded") || normalized.includes("blocked")
    ? "danger"
    : normalized.includes("available")
      ? "success"
      : normalized.includes("loaded") || normalized.includes("review")
        ? "warn"
        : "info";

  return <Badge tone={tone}>{status}</Badge>;
}

function useCapacityFilter(search: string, status: string) {
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

function buildCapacityLanes(records: CapacityBucketItem[]): Lane[] {
  return records.map((record) => ({
    id: record.id,
    machine: record.machineLabel,
    detail: `${record.workCenterLabel} / ${record.shiftLabel} / ${record.bucketDate}`,
    status: record.status === "Overloaded" ? "Down" : record.status === "Available" ? "Idle" : "Running",
    slots: [
      {
        id: `${record.id}-slot`,
        title: record.plannedOrderRef,
        meta: `${record.loadedMinutes}/${record.availableMinutes} minutes loaded`,
        start: record.shiftLabel,
        end: `${record.utilizationPercent}%`,
        emphasis: record.status === "Overloaded" ? "blocked" : record.status === "Available" ? "queued" : "current",
        tags: [
          { label: record.status, tone: record.status === "Overloaded" ? "danger" : record.status === "Available" ? "success" : "warn" },
          { label: record.constraintSignal, tone: "info" }
        ]
      }
    ]
  }));
}

const capacityColumns: DataGridColumn<CapacityBucketItem>[] = [
  {
    key: "workCenter",
    header: "Work center / machine",
    render: (record) => (
      <div>
        <strong>{record.workCenterLabel}</strong>
        <div className="muted">{record.machineLabel}</div>
      </div>
    )
  },
  { key: "shift", header: "Shift", width: "14%", render: (record) => `${record.bucketDate} / ${record.shiftLabel}` },
  { key: "load", header: "Load", width: "16%", render: (record) => `${record.loadedMinutes}/${record.availableMinutes} min` },
  { key: "utilization", header: "Utilization", width: "12%", render: (record) => `${record.utilizationPercent}%` },
  { key: "overload", header: "Overload", width: "12%", render: (record) => <Badge tone={record.overloadMinutes > 0 ? "danger" : "success"}>{record.overloadMinutes}</Badge> },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

export function CapacityPlanningBoardPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { deferredSearch, filter } = useCapacityFilter(search, status);
  const query = useApiQuery(
    queryKeys.planning.capacityBoard(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listCapacityBoardSetup(filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const preview = selected ?? records[0] ?? null;
  const source = records[0]?.source ?? "Deferred";
  const avgUtilization = records.length ? Math.round(records.reduce((total, record) => total + record.utilizationPercent, 0) / records.length) : 0;
  const overloadedRecords = records.filter((record) => record.status === "Overloaded");
  const canReviewOverloads = overloadedRecords.length > 0;
  const nextOverloaded = selected ? overloadedRecords.find((record) => record.id !== selected.id) ?? null : overloadedRecords[0] ?? null;
  const reviewOverloadReason = !canReviewOverloads
    ? "No overloaded capacity buckets are available for review."
    : undefined;
  const reviewCurrentReason = !selected
    ? "Select a capacity bucket before reviewing overloads."
    : selected.status !== "Overloaded"
      ? undefined
      : nextOverloaded
        ? undefined
        : "Current bucket is already the active overload review.";

  const openOverloadReview = () => {
    const target = selected?.status === "Overloaded" ? selected : overloadedRecords[0];
    if (!target) {
      return;
    }

    setSelectedId(target.id);
  };

  const openNextOverload = () => {
    const target = selected?.status === "Overloaded"
      ? nextOverloaded
      : overloadedRecords[0];
    if (!target) {
      return;
    }

    setSelectedId(target.id);
  };

  return (
    <>
      <ListPageShell
        actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: !canReviewOverloads, label: "Review overloads", onClick: canReviewOverloads ? openOverloadReview : undefined, reason: reviewOverloadReason }]} secondary={[{ disabled: true, label: "Rebuild capacity draft", reason: "Capacity rebuild requires planning workflow enablement." }]} testId="capacity-action-bar" /></>}
        aside={
          <Card title="Capacity readiness" description="Capacity buckets show the current planning view for overload and utilization review.">
            {preview ? (
              <div className="utility-grid">
                <Tile eyebrow={preview.status} label="Utilization" meta={preview.machineLabel}>{`${preview.utilizationPercent}%`}</Tile>
                <Tile eyebrow={preview.shiftLabel} label="Overload minutes" meta={preview.plannedOrderRef}>{preview.overloadMinutes}</Tile>
              </div>
            ) : null}
          </Card>
        }
        description="RCCP/CRP board by work center, machine, and shift without bypassing capacity rebuild APIs."
        filters={
          <ErpFilterBar
            ariaLabel="Capacity filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="capacity-filter-bar"
          >
            <input aria-label="Search capacity buckets" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search work center, machine, order, constraint" value={search} />
            <select aria-label="Capacity status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Overloaded">Overloaded</option>
              <option value="Loaded">Loaded</option>
              <option value="Available">Available</option>
            </select>
          </ErpFilterBar>
        }
        title="Capacity Planning Board"
      >
        <KpiStrip items={[{ label: "Buckets", value: String(records.length) }, { label: "Overloaded", value: String(records.filter((record) => record.status === "Overloaded").length) }, { label: "Avg utilization", value: `${avgUtilization}%` }, { label: "Planned", value: String(records.filter((record) => record.source === "Deferred").length) }]} />
        <Card title="Machine load lanes" description="Lane view keeps the capacity screen aligned with the manufacturing board visual language.">
          <div className="capacity-board-scroll" data-testid="capacity-board-scroll">
            <LaneBoard lanes={buildCapacityLanes(records)} />
          </div>
        </Card>
        <Card title="Capacity buckets" description="Select a work center bucket to review load drivers and guardrails.">
          <ErpGrid ariaLabel="Capacity planning buckets" columns={capacityColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.workCenterLabel} ${record.bucketDate} capacity bucket`} testId="capacity-grid" />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Capacity bucket detail is review-only until capacity adjustment workflow is enabled."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save capacity review", reason: "Capacity save requires planning workflow enablement." }]} secondary={[{ disabled: !canReviewOverloads || Boolean(selected?.status === "Overloaded" && !nextOverloaded), label: "Review overloads", onClick: (!reviewCurrentReason && canReviewOverloads) ? openNextOverload : undefined, reason: reviewCurrentReason ?? reviewOverloadReason }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.workCenterLabel ?? "Capacity bucket"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Capacity review controls">
            <ErpLookupField disabled disabledReason="Machine selection is controlled by work-center capacity setup." label="Machine" onChange={() => undefined} options={[{ label: selected.machineLabel, value: selected.machineLabel }]} value={selected.machineLabel} />
            <ErpLookupField disabled disabledReason="Planned order is controlled by production planning." label="Planned order" onChange={() => undefined} options={[{ label: selected.plannedOrderRef, value: selected.plannedOrderRef }]} value={selected.plannedOrderRef} />
            <label><span>Constraint signal</span><input defaultValue={selected.constraintSignal} disabled /></label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
