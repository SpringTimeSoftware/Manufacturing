# Planning / MPS / MRP / BOQ / Capacity Completion Specification v1

Pack: `planning_mrp_boq_capacity_completion_pack_v1`  
Repo: `https://github.com/SpringTimeSoftware/Manufacturing`  
Target local path: `C:\StsPackages\Manufacturing_ERP\docs\erp_completion_packs_v1\planning_mrp_boq_capacity_completion_pack_v1`  
Workbook: `planning_mrp_boq_capacity_benchmark_workbook_v1.xlsx`

## 1. Completion definition

This module is complete only when a planner can move from demand/MPS through MRP, BOQ/net requirements, planned order decisions, capacity review, exception resolution, and conversion into execution documents with field-level, workflow-level, test-backed evidence.

The implementation must support a commercially credible manufacturing ERP planning workflow:

1. Define a planning plan/scenario with plant/site, horizon, time fences, netting rules, scope and planner ownership.
2. Enter or import MPS/forecast/demand lines in compact editable grids.
3. Validate forecast and demand inputs with lookup/numeric truth.
4. Run MRP using explicit parameters and persist run history.
5. Create immutable input/output snapshots with counts, hashes and comparison/delta.
6. Explode BOM/BOQ requirements across levels, show gross/net demand, stock, firm supply, on-order supply, projected available balance and shortages.
7. Generate planned purchase, work and transfer orders with type-specific fields.
8. Firm, release and convert planned orders into real PR/PO/WO/transfer documents where applicable.
9. Analyze capacity by work center, machine, stage, operation and time bucket.
10. Use machine/stage boards for scheduling visibility; drag/drop/resequence/dispatch actions must either work or be disabled with a reason.
11. Generate and resolve exceptions, action messages, reschedule suggestions and shortage actions.
12. Produce screenshots, scan logs, test output, mapping updates and review pack evidence.

## 2. Binding workbook sheets

The workbook is the binding source for field/action/workflow/test depth.

| Sheet | Binding role |
|---|---|
| `Source_References` | Official source URLs and expectations |
| `Vendor_Benchmark` | 178 source-backed ERP benchmark rows |
| `Target_Field_Catalog` | 547 target field rules |
| `MPS_Rules` | MPS/forecast/demand rules |
| `MRP_Run_Rules` | Plan header and MRP run parameter rules |
| `Snapshot_PlannedOrders` | Snapshot, planned order and conversion rules |
| `BOQ_Requirements` | BOQ/net requirements rules |
| `Capacity_Boards` | Capacity, machine board and stage board rules |
| `Forecast_Exceptions` | Forecast impact, exceptions and shortage rules |
| `Action_Contract` | 105 visible action rules |
| `Workflow_Contract` | 42 workflow rules |
| `Lookup_Numeric_Truth` | 320 lookup/numeric/date truth rules |
| `Current_Mapping` | Repo mapping template to be updated by Codex |
| `Gap_Template` | Gaps, severity, owner and resolution template |
| `Test_Cases` | 312 required validation/action/workflow/anti-pattern tests |
| `Anti_Patterns` | Anti-pattern scans and rejection rules |
| `Screenshot_Gates` | Required screenshots/evidence |
| `Completion_Gates` | Pass/fail completion gates |
| `Invalid_Output_Rules` | Conditions that invalidate implementation |
| `Review_Pack_Template` | Required review pack outputs |

## 3. Field rules

All fields in `Target_Field_Catalog` are binding. Required behavior:

- Governed master-linked fields must be ID-backed lookup/select controls.
- Numeric/decimal/date/quantity/capacity/lead-time fields must not be unrestricted text.
- Each field must exist across UI, DTO/API, DB model/migration and detail/reopen flow.
- Each field must have field-level validation and a save/reopen test.
- Current implementation must be mapped in `Current_Mapping`.
- Missing or partial fields must be logged in `Gap_Template`.

High-priority governed lookups include:

- Item/product, item group, product family
- UOM and conversion factor
- Company, plant/site, warehouse, bin, MRP area
- Customer, supplier, supplier site
- BOM, BOM revision, routing, operation, stage
- Work center, machine/resource, resource group, operator/skill, calendar/shift
- Planner/MRP controller, reason code, status, priority, severity
- Planning rule group, coverage group, assignment set, netting rule, procurement type, order type

High-priority numeric/date fields include:

- Forecast quantity, demand quantity, consumed quantity, residual forecast quantity
- Gross/net requirement, safety stock, reserved, on-hand, on-order, firm planned, shortage, projected available
- Planned order quantity, firm/released/remaining quantity
- UOM conversion factor, MOQ, lot multiple, lead time, scrap, yield
- Setup/run/queue/move minutes, capacity available/required/reserved/slack/overload
- Horizon days, time fences, bucket size, date/time fields and run durations

## 4. MPS / forecast / demand

Required screens and behavior:

- MPS/forecast demand grid must be a compact desktop editable grid/table.
- It must support Add Line, Remove Line, edit all lines, validate all lines, save all lines and reopen all lines.
- It must support imported forecast files with real upload/storage or a disabled action with reason.
- It must show forecast version, forecast model/source, period/date, quantity, UOM, planning strategy, consumption mode, consumed quantity and residual forecast.
- Forecast consumption/reduction must show before/after impact, not just a KPI.
- Frozen forecast periods must be locked and auditable.
- Invalid item, UOM, date, quantity, source, period or conversion values must fail before save/run.

Invalid patterns:

- `lines[0]`, `firstLine`, first-line-only save
- one editable MPS line only
- card-per-line desktop MPS entry
- forecast upload button without real upload API/storage
- forecast impact shown as static cards only

## 5. MRP plan and run

Required screens and behavior:

- Plan definition workspace with plan code/name/type/version/scenario/status, plant/site, horizon, scope, time fences and planner ownership.
- MRP run dialog with refresh mode, run mode, planning mode, scope filters, demand/supply inputs, forecast flag, safety stock, lot sizing, lead time, calendar, capacity, pegging, exception and action-message flags.
- MRP runs must be observable: run status, requested by, started/completed, duration, parameters, input counts, output counts, error details.
- MRP run must produce input and output snapshots with immutable hashes.
- Scheduled runs must persist recurrence, next run date/time and cancellation state.
- Simulation must not overwrite approved/live plan output unless explicitly promoted.
- Live authenticated mode must not silently show seeded/demo operational data.

Invalid patterns:

- black-box MRP with only success/fail toast
- current-only result with no snapshot
- plan/run fields not persisted
- fake schedule recurrence
- seeded operational data shown as real live data

## 6. BOQ / net requirements

Required screens and behavior:

- Multi-level BOM/BOQ explosion with BOM level, BOM path, parent item/component item and source demand.
- Gross requirement, scrap, yield-adjusted quantity, safety stock, reservations, on-hand, QC hold, blocked, on-order, firm planned, available, net requirement and shortage quantity must be visible.
- Projected available balance, coverage days, source supply and pegging must be visible.
- Requirement rows must support drilldown to parent demand, child component, source supply and snapshot line.
- BOQ grid must show transaction-type breakdown and period buckets.
- Shortage actions must be created from shortage rows with type, owner, target date, target document and status.

Invalid patterns:

- aggregate-only requirement totals
- no BOM level/path
- fake pegging link
- shortage row without actionable workflow

## 7. Planned orders and conversion

Required screens and behavior:

- Planned orders must be type-specific: planned purchase, planned work/production, planned transfer.
- Planned order grid must show order type, item, plant, warehouse/source/destination, supplier/site where applicable, BOM/routing/work center/machine where applicable, dates, quantities, UOM, lead time, firm/release/expedite/freeze flags, status, pegging and validation.
- Manual planned order creation must require item, location, source location where applicable, transaction/order type, start/end/due dates and quantity.
- Firmed planned orders must survive MRP reruns and participate in netting.
- Conversion to PR/PO/WO/transfer must create real target documents or be disabled with a reason.
- Work order conversion must include materials and operations, not just a header.
- Bulk conversion must validate every selected row and show per-row result.

Invalid patterns:

- generic planned order shell
- conversion toast without target document
- converting only first selected row
- firm order deleted by MRP rerun
- PO/WO/transfer links opening fake records

## 8. Capacity, machine board and stage board

Required screens and behavior:

- Capacity view must show work center, machine/resource, date bucket, calendar/shift, available capacity, required capacity, reserved capacity, downtime, efficiency, utilization, overload, slack and source operations.
- Overload detail must show source planned/work orders causing overload and suggested resolution actions.
- Capacity recalculation must be tied to routings, operations, planned/work orders and calendars.
- Temporary capacity overrides require reason, owner, due date, approval and audit.
- Machine board must show operations by machine/time with conflicts, material shortage/QC hold markers and dispatch status.
- Stage board must show stage queues, operation sequence, bottlenecks and dispatch/hold/release actions.
- Drag/drop/resequence must persist via API and recalculate conflicts, or be disabled with a clear reason.

Invalid patterns:

- capacity badge only
- no available/required numeric basis
- drag/drop visual only
- machine/work center as free text
- no source operation drilldown

## 9. Exceptions, action messages and shortage actions

Required screens and behavior:

- Exception workbench must show exception ID/type/code/message/severity/priority, source object, root cause, bucket date, required/available/shortage/capacity values, owner, due date and status.
- Action messages must support reschedule in/out, cancel, increase/decrease quantity, expedite and source changes where applicable.
- Suggestions must store before/after date, quantity, source order and reason.
- Accept/reject actions must have audit, reason and downstream target action/document.
- Shortage actions must support purchase, make, transfer, expedite, substitute, reserve, reschedule and cancel flows.
- Exception close/reopen must require resolution/reopen reason and audit.

Invalid patterns:

- generic warning list
- suggestion disappears with no target action
- close without resolution evidence
- note-only shortage action

## 10. Upload/media/document truth

Upload and document buttons must be real or unavailable:

- Forecast import must use real file input, upload API/storage and validation report.
- Planning documents/evidence must persist attachment metadata and download URL.
- Screenshot evidence must be generated and linked in review pack.
- If backend storage/integration is absent, action must be disabled with reason or hidden.
- No fake upload, print, export, email or send buttons.

## 11. Save/reopen rules

Every create/edit/detail screen must have save/reopen tests.

Minimum save/reopen coverage:

- Plan definition
- MPS/forecast demand grid with 3+ lines
- MRP run draft parameters
- Snapshot detail and snapshot compare
- BOQ requirements and pegging drilldown state
- Planned order manual creation/edit/firm/release
- Planned order conversion preview/result
- Exception assignment/accept/reject/close/reopen
- Shortage action create/edit/resolve
- Capacity override
- Machine board move or disabled state
- Stage sequence/dispatch/hold/release

## 12. Testing standard

Codex must write failing tests first. Required layers:

- Backend unit tests for calculations, validations, netting, forecast consumption, capacity, planned order conversion.
- API integration tests for plan/run/snapshot/requirements/planned order/conversion/exception/capacity endpoints.
- React/component tests for lookup/numeric controls and grid behavior.
- Playwright/E2E tests for full workflows and screenshots.
- Static anti-pattern scans.

The workbook `Test_Cases` sheet defines 312 tests and is binding.

## 13. Screenshot/evidence standard

Screenshot gates in the workbook are binding. Required evidence must be placed under:

```text
docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/screenshots/
```

Required evidence also includes:

- test output logs
- anti-pattern scan logs
- API contract summary
- DB migration summary
- mapping/gap workbook updates
- implementation summary
- commit hash

## 14. Completion gates

All P0 gates in `Completion_Gates` must pass. Failure of any P0 gate blocks completion.

The module is not complete if:

- it only looks visually complete
- MRP is black-box
- fields are free text where lookups are required
- numeric planning values are strings/text boxes
- buttons are dead/fake
- no snapshots exist
- planned order conversion does not create real target documents
- capacity board is only a badge/KPI screen
- screenshots/tests/scans/review pack are missing

