# planning_mrp_boq_capacity_completion_pack_v1

This pack defines the completion standard for the Planning / MPS / MRP / BOQ / Capacity module of the Manufacturing ERP.

It is designed to be placed at:

```text
C:\StsPackages\Manufacturing_ERP\docs\erp_completion_packs_v1\planning_mrp_boq_capacity_completion_pack_v1
```

## Included artifacts

| Artifact | Purpose |
|---|---|
| `planning_mrp_boq_capacity_benchmark_workbook_v1.xlsx` | Source-backed benchmark workbook, target field catalog, mapping template, gap template, action contract, workflow contract, tests, anti-patterns, screenshot gates, completion gates, invalid-output rules |
| `planning_mrp_boq_capacity_completion_spec_v1.md` | Binding module completion specification |
| `planning_mrp_boq_capacity_codex_execution_prompt_v1.md` | Execution prompt for Codex implementation/review |
| `planning_mrp_boq_capacity_validation_checklist_v1.md` | Manual and automated validation checklist |
| `planning_mrp_boq_capacity_invalid_output_rules_v1.md` | Explicit rejection rules |
| `planning_mrp_boq_capacity_pack_manifest.json` | Pack inventory and row counts |

## Workbook depth

The workbook contains:

- Vendor benchmark rows: **178**
- Target field rules: **547**
- Action contract rows: **105**
- Workflow contract rows: **42**
- Test rows: **312**
- Anti-pattern rows: **30**
- Screenshot gates: **22**
- Completion gates: **20**

## Binding rule

The workbook is not a sample. It is the binding field/action/workflow/test matrix for this module. Codex must not infer missing ERP depth. If a field/action/workflow is not implemented, it must be recorded in `Current_Mapping` and `Gap_Template` with owner, severity, and evidence.

## Scope covered

- MPS and forecast/demand inputs
- MRP plan/run parameters
- MRP run history, immutable snapshots, output deltas
- BOQ / gross and net requirements / BOM explosion
- Planned purchase/work/transfer orders
- Planned order firming, release, conversion to PR/PO/WO/transfer
- Capacity planning by work center, machine, stage, operation and bucket
- Machine board and stage board
- Forecast impact, exception handling, action messages
- Shortage actions, expedite/reschedule/cancel/increase/decrease actions
- Lookup truth, numeric truth, no dead actions, upload/document truth
- Test, screenshot and review pack gates

## Non-negotiable pass/fail policy

Do not call the module complete unless all P0 completion gates pass and review evidence is produced.

