import { reportTemplates, workOrderRecords } from "../api/mockData";
import { demoScenarios } from "../demo/demoScenarios";
import { useFeatureFlags } from "../featureFlags/FeatureFlagProvider";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ListPageShell } from "../ui/ListPageShell";
import {
  createCsvAction,
  createExcelAction,
  createLabelAction,
  createPrintAction,
  type ReportAction
} from "../reporting/exportRegistry";

const exportColumns = [
  { header: "WO", value: (record: (typeof workOrderRecords)[number]) => record.workOrderNo },
  { header: "Item", value: (record: (typeof workOrderRecords)[number]) => record.itemCode },
  { header: "Status", value: (record: (typeof workOrderRecords)[number]) => record.status },
  { header: "Plan", value: (record: (typeof workOrderRecords)[number]) => record.planWindow }
];

function buildActions(): ReportAction[] {
  return [
    createCsvAction("work-order-snapshot.csv", exportColumns, workOrderRecords),
    createExcelAction("work-order-snapshot.xls", exportColumns, workOrderRecords),
    createPrintAction(
      "Work order traveler",
      `
        <h1>Work Order Traveler</h1>
        <div class="meta">WO-02642 - FG-OZ-50 - Planner print pack</div>
        <table>
          <thead><tr><th>Operation</th><th>Machine</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Cutting & Forming</td><td>MC-01 Laser</td><td>Started</td></tr>
            <tr><td>Welding</td><td>MC-02 Weld</td><td>Created</td></tr>
            <tr><td>Testing</td><td>MC-03 Test Bench</td><td>QC Hold</td></tr>
          </tbody>
        </table>
      `
    ),
    createLabelAction("Dispatch carton label", ["FG-OZ-50 / Carton 1", "FG-OZ-50 / Carton 2"])
  ];
}

export function PrintPackPage() {
  const { flags } = useFeatureFlags();
  const actions = buildActions();
  const riskScenario = demoScenarios.find((scenario) => scenario.id === "mto-assembly");

  return (
    <ListPageShell
      description="Shared print/export abstraction for travelers, labels, CSV snapshots, and Excel-compatible handoff files."
      title="Print Pack / Traveler / Labels"
    >
      <div className="split-panels">
        <Card title="Available templates" description="Modules can register report actions without writing custom export code on every screen.">
          {reportTemplates.map((template) => (
            <div className="notification-item" key={template.id}>
              <strong>{template.label}</strong>
              <p>{template.description}</p>
              <div className="context-chip-row">
                <span className="code-chip">{template.format}</span>
              </div>
            </div>
          ))}
        </Card>
        <Card title="Run sample actions" description="Foundation actions cover PDF/print, CSV, Excel-compatible, and label layouts.">
          {flags.enablePrintAndExport ? (
            <div className="utility-grid">
              {actions.map((action) => (
                <Button key={action.id} onClick={action.run} variant={action.id === "print" ? "primary" : "secondary"}>
                  {action.label}
                </Button>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Print and export actions are paused by the current feature setting."
              hint={riskScenario ? `Re-enable the feature to continue the ${riskScenario.title.toLowerCase()} guided workflow.` : undefined}
              title="Print and export actions are turned off"
            />
          )}
        </Card>
      </div>
    </ListPageShell>
  );
}
