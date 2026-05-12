import { startTransition, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Ws01ProbeRecord, Ws01ProbeStatus } from "../runtime/ws01RuntimeProbe";
import { runWs01RuntimeProbe, summarizeWs01ProbeRows } from "../runtime/ws01RuntimeProbe";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { ErpActionBar, ErpFilterBar, ErpLookupField, ErpModalWorkspace } from "../ui/ErpComponents";
import { EmptyState } from "../ui/EmptyState";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

const statusOptions: Array<{ label: string; value: string }> = [
  { label: "All statuses", value: "all" },
  { label: "PASS", value: "PASS" },
  { label: "PARTIAL", value: "PARTIAL" },
  { label: "FAIL", value: "FAIL" },
  { label: "NOT-IN-SCOPE", value: "NOT-IN-SCOPE" }
];

function statusTone(status: Ws01ProbeStatus) {
  if (status === "PASS") {
    return "success";
  }

  if (status === "FAIL") {
    return "danger";
  }

  if (status === "PARTIAL") {
    return "warn";
  }

  return "neutral";
}

function downloadCsv(filename: string, rows: Ws01ProbeRecord[]) {
  const headers = ["Area", "Role", "Check", "Status", "Target", "Evidence", "Action"];
  const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [
    headers,
    ...rows.map((row) => [
      row.area,
      row.role,
      row.check,
      row.status,
      row.target,
      row.evidence,
      row.action
    ])
  ].map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const columns: DataGridColumn<Ws01ProbeRecord>[] = [
  {
    header: "Check",
    key: "check",
    width: "27%",
    render: (record) => (
      <div>
        <strong>{record.check}</strong>
        <div className="muted">{record.area}</div>
      </div>
    )
  },
  {
    header: "Role",
    key: "role",
    width: "16%",
    render: (record) => record.role
  },
  {
    header: "Status",
    key: "status",
    width: "13%",
    render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge>
  },
  {
    header: "Target",
    key: "target",
    width: "20%",
    render: (record) => record.target
  },
  {
    header: "Evidence",
    key: "evidence",
    width: "24%",
    render: (record) => record.evidence
  }
];

export function RuntimeUatPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Ws01ProbeRecord[]>([]);
  const [selected, setSelected] = useState<Ws01ProbeRecord | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRunning, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const roleOptions = useMemo(() => {
    const roles = Array.from(new Set(rows.map((row) => row.role))).sort();

    return [
      { label: "All roles", value: "all" },
      ...roles.map((role) => ({ label: role, value: role }))
    ];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesRole = roleFilter === "all" || row.role === roleFilter;
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${row.area} ${row.role} ${row.check} ${row.target} ${row.evidence} ${row.action}`.toLowerCase().includes(normalizedSearch);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [roleFilter, rows, search, statusFilter]);

  const summary = useMemo(() => summarizeWs01ProbeRows(rows), [rows]);

  const runChecks = async () => {
    setRunning(true);
    startTransition(() => {
      setRunError(null);
    });

    try {
      const result = await runWs01RuntimeProbe(session);

      startTransition(() => {
        setRows(result);
        setLastRun(new Date().toLocaleString("en-IN"));
      });
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Runtime UAT checks could not be completed.");
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    void runChecks();
  }, [session]);

  return (
    <>
      <ListPageShell
        actions={
          <ErpActionBar
            primary={[
              {
                disabled: isRunning,
                label: isRunning ? "Running checks" : "Run checks",
                onClick: runChecks,
                reason: isRunning ? "Runtime UAT checks are already running." : undefined
              }
            ]}
            secondary={[
              {
                disabled: filteredRows.length === 0,
                label: "Export evidence",
                onClick: () => downloadCsv("ws01-runtime-uat-evidence.csv", filteredRows),
                reason: filteredRows.length === 0 ? "Run checks or clear filters before exporting evidence." : undefined
              }
            ]}
          />
        }
        aside={
          <div className="dashboard-home__stack">
            <Card title="Data Truth" description="Live sessions use verified API responses or clear unavailable states. Baseline operational rows are not shown silently when live calls fail." />
            <Card title="UAT Baseline" description="Order-to-cash and plan-to-produce baseline records are tracked through documented database apply order and runtime probes." />
            <Card title="Publish Path" description="The IIS deployment path uses the published ASP.NET Core host folder with compiled web assets only." />
          </div>
        }
        description="Run role-aware runtime, smoke, baseline data, and deployment readiness checks for the current authenticated environment."
        filters={
          <ErpFilterBar
            actions={
              <Button
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                variant="quiet"
              >
                Clear filters
              </Button>
            }
            ariaLabel="Runtime UAT filters"
          >
            <label>
              <span>Find</span>
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search check, role, endpoint, or evidence"
                value={search}
              />
            </label>
            <ErpLookupField
              label="Role focus"
              onChange={setRoleFilter}
              options={roleOptions}
              value={roleFilter}
            />
            <ErpLookupField
              label="Status"
              onChange={setStatusFilter}
              options={statusOptions}
              value={statusFilter}
            />
          </ErpFilterBar>
        }
        title="Runtime UAT"
      >
        {runError ? (
          <EmptyState
            description="The runtime UAT checks could not be completed for the current session."
            hint={runError}
            title="Runtime checks unavailable"
          />
        ) : null}

        <KpiStrip
          items={[
            { label: "Checks", value: String(summary.total), hint: lastRun ? `Last run ${lastRun}` : "Run pending" },
            { label: "Passed", value: String(summary.PASS), hint: "Runtime checks that returned successfully." },
            { label: "Partial", value: String(summary.PARTIAL), hint: "Role UAT identities that exist but still require workflow-depth proof." },
            { label: "Failed", value: String(summary.FAIL), hint: "Checks that need investigation before UAT." }
          ]}
        />

        <Card title="Runtime evidence" description="Select a row to inspect the exact target, result, and next action.">
          <DataGrid
            ariaLabel="Runtime UAT evidence"
            columns={columns}
            emptyState={{
              description: "Run checks or clear filters to see runtime UAT evidence.",
              title: "No runtime UAT evidence"
            }}
            getRowId={(record) => record.id}
            isLoading={isRunning && rows.length === 0}
            onRowSelect={setSelected}
            records={filteredRows}
            rowLabel={(record) => `${record.check} ${record.status}`}
          />
        </Card>
      </ListPageShell>

      <ErpModalWorkspace
        description={selected?.evidence ?? "Runtime UAT detail"}
        footer={
          <ErpActionBar
            secondary={[
              selected?.route
                ? { label: "Open screen", onClick: () => navigate(selected.route ?? "/") }
                : {
                    disabled: true,
                    label: "Open screen",
                    reason: "This runtime check does not open an application workspace."
                  }
            ]}
            utility={[{ label: "Close", onClick: () => setSelected(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.check ?? "Runtime UAT detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Runtime UAT evidence">
            <label>
              <span>Area</span>
              <input readOnly value={selected.area} />
            </label>
            <label>
              <span>Role</span>
              <input readOnly value={selected.role} />
            </label>
            <label>
              <span>Status</span>
              <input readOnly value={selected.status} />
            </label>
            <label>
              <span>Target</span>
              <input readOnly value={selected.target} />
            </label>
            <label className="form-span-2">
              <span>Action</span>
              <textarea readOnly rows={3} value={selected.action} />
            </label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
