# Codex Execution Prompt — planning_mrp_boq_capacity_completion_pack_v1

You are working in the Manufacturing ERP repo.

Repo:
```text
https://github.com/SpringTimeSoftware/Manufacturing
```

Local path:
```text
C:\StsPackages\Manufacturing_ERP
```

Pack path:
```text
C:\StsPackages\Manufacturing_ERP\docs\erp_completion_packs_v1\planning_mrp_boq_capacity_completion_pack_v1
```

Use these artifacts:

```text
planning_mrp_boq_capacity_benchmark_workbook_v1.xlsx
planning_mrp_boq_capacity_completion_spec_v1.md
planning_mrp_boq_capacity_validation_checklist_v1.md
planning_mrp_boq_capacity_invalid_output_rules_v1.md
```

## Non-negotiable objective

Complete or retrofit the Planning / MPS / MRP / BOQ / Capacity module to match the workbook/spec. Do not infer ERP depth. Use the workbook as the binding contract.

You must scan current repo, write failing tests first, implement, validate, capture screenshots, update matrices, create review pack, commit and push.

## Step 1 — Repo scan

Run from:

```powershell
cd C:\StsPackages\Manufacturing_ERP
git status
```

Search for current planning/MRP/capacity-related implementation:

```powershell
rg -n "MPS|MRP|Material Requirements|planned order|plannedOrder|PlanDefinition|SupplyPlan|forecast|BOQ|bill of quantities|net requirements|capacity|work center|machine board|stage board|shortage|action message|reschedule|pegging" .
```

Search for known invalid patterns:

```powershell
rg -n "lines\[0\]|firstLine|First line|first line|only one line|card-per-line|toast\(|TODO|stub|fake|placeholder|type=\"text\"|input type=\"text\"" .
```

Search for fake upload/export/send/print actions:

```powershell
rg -n "upload|Upload|export|Export|print|Print|send|Send|email|Email|whatsapp|WhatsApp" .
```

Create initial findings:

```text
docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/initial_scan_findings.md
```

## Step 2 — Update mapping before implementation

Open the workbook and update:

- `Current_Mapping`
- `Gap_Template`

For every relevant current file/component/API/model/table found, map it to the target field/action/workflow rows. Do not skip fields because the current implementation is shallow. Mark unknown/missing as gaps.

## Step 3 — Write failing tests first

Create tests before implementation. Required test groups:

### Backend / API

- Plan definition create/edit/save/reopen validation
- MPS grid multi-line save/reopen
- Forecast import validation
- Forecast reduction/consumption calculation
- MRP run parameter validation
- MRP execution creates run history and snapshots
- Snapshot compare/delta
- BOQ/BOM multi-level explosion
- Net requirements calculation
- Pegging creation/drilldown
- Planned purchase/work/transfer order generation
- Firmed planned orders survive rerun and participate in netting
- Planned order conversion to PR/PO/WO/transfer with target document link
- Capacity calculation by work center/machine/bucket
- Overload exception generation
- Reschedule/cancel/increase/decrease action messages
- Shortage action lifecycle
- Lookup/numeric/date validations

### Web / UI

- Desktop MPS/forecast grid with Add Line, Remove Line, multi-row save/reopen
- MRP run dialog fields and disabled states
- Run history/snapshot screens
- BOQ/net requirements grid
- Planned order grid/manual form/conversion preview
- Exception/shortage workbench
- Capacity board
- Machine board
- Stage board
- No fake upload/export/print/send buttons
- No demo/seeded operational data in live mode

### Static scans

Add automated scan tests or CI scripts that fail on:

```text
lines[0]
firstLine
First quote line
only one editable line
card-per-line desktop entry
numeric planning fields as unrestricted text
governed planning fields as free text
fake upload/export/send/print buttons
```

## Step 4 — Implement module depth

Implement or retrofit the following areas.

### Data model / database

Add or retrofit tables/entities for:

- planning plans/scenarios
- MPS/forecast demand lines
- MRP runs and schedules
- input/output snapshots and snapshot detail
- BOQ/net requirement lines
- pegging links
- planned orders
- planned order conversion batches/lines
- capacity buckets
- board operations
- planning exceptions
- action messages / suggestions
- shortage actions
- planning documents/evidence
- audit events

Add indexes for:

- plan/run/snapshot
- item/plant/warehouse/MRP area
- work center/machine/date bucket
- planned order type/status
- exception severity/status/owner
- pegging demand/supply IDs

### API

Implement REST endpoints or equivalent service routes for:

- plan CRUD/approve/archive/clone
- MPS/forecast line CRUD/import/validate/reduce/freeze
- MRP run draft/execute/simulate/schedule/cancel/abort/status
- snapshot detail/compare
- BOQ/net requirements/explode/replan/pegging
- planned order CRUD/firm/unfirm/release/cancel/split/merge/expedite
- conversion preview/convert/bulk convert/rollback/open target
- capacity board/recalculate/overload drilldown/override/alternate resource
- machine board/stage board operations
- exceptions/suggestions/shortage actions
- documents/evidence
- audit trail

### Web

Implement full-page or centered modal workspaces for deep create/edit:

- Planning workspace
- Plan definition
- MPS/forecast/demand grid
- MRP run dialog/scheduler
- Run history and snapshot compare
- BOQ/net requirements grid
- Planned orders grid/detail
- Planned order conversion workspace
- Exception/shortage workbench
- Capacity planning board
- Machine board
- Stage board
- Evidence/documents

Do not use right drawers for deep edit. Right drawers are allowed only for preview/read-only detail.

### Grid standard

All desktop transaction/planning lines must be compact editable grids/tables:

- MPS/forecast lines
- BOQ/requirements if editable actions exist
- planned orders
- conversion batch lines
- shortage action lines
- exception/action message lists
- capacity board details where row edits exist

The grid must support Add Line, Remove Line where applicable, edit all rows, validate all rows, save all rows and reopen all rows.

## Step 5 — Required calculations

Implement deterministic calculation services with tests:

- Forecast consumption/reduction
- MPS build schedule
- BOM/BOQ explosion
- Gross requirement
- Net requirement
- Projected available balance
- Safety stock and reservation handling
- Lot sizing, MOQ, lot multiple
- Lead-time offset
- Planned order date and quantity
- Firm order preservation
- Capacity available/required/utilization/overload/slack
- Reschedule/cancel/increase/decrease suggestions
- Delay days and feasible date
- Snapshot delta counts

## Step 6 — Lookup and numeric truth

All governed master-linked fields must be lookup/select:

```text
item, UOM, company, plant, warehouse, bin, MRP area, customer, supplier, supplier site, BOM, routing, operation, stage, work center, machine, resource, operator/skill, calendar, shift, planner, reason code, status, priority, severity, planning rule group, coverage group, procurement type, order type
```

All numeric/date fields must use typed controls and server validation:

```text
forecast qty, demand qty, gross/net requirements, stock, shortage, projected balance, conversion factor, MOQ, lot multiple, lead time, setup/run/queue/move minutes, capacity hours, utilization %, overload %, dates/times, run duration
```

## Step 7 — Visible action rule

Every visible action must be one of:

```text
WORKING
DISABLED WITH REASON
HIDDEN
```

No dead buttons. No toast-only fake success.

## Step 8 — Screenshot capture

Capture all screenshots in workbook `Screenshot_Gates`.

Place them under:

```text
docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/screenshots/
```

Minimum required screenshots include:

- planning workspace
- plan create/edit
- MPS grid
- forecast import validation
- MRP run dialog
- run history
- snapshot compare
- BOQ/net requirements
- pegging
- planned orders
- manual planned order
- conversion preview
- bulk conversion result
- exception workbench
- shortage action
- capacity overview
- machine board
- stage board
- audit trail
- documents/evidence
- review pack contents

## Step 9 — Validation

Run all relevant commands discovered from the repo. At minimum:

```powershell
dotnet test
npm test
npm run lint
npm run build
```

If exact npm scripts differ, use the repo's actual scripts and record them.

Run anti-pattern scans again and save logs:

```powershell
mkdir -Force docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/scan_logs

rg -n "lines\[0\]|firstLine|First line|only one editable line|card-per-line" . > docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/scan_logs/transaction_line_antipatterns.txt
rg -n "type=\"text\"|input type=\"text\"" . > docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/scan_logs/text_input_scan.txt
rg -n "TODO|stub|fake|placeholder" . > docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/scan_logs/stub_fake_placeholder_scan.txt
```

A scan hit is not automatically fatal only if it is proven unrelated or intentionally disabled. Explain every retained hit in the review pack.

## Step 10 — Update workbook after implementation

Update:

- `Current_Mapping`
- `Gap_Template`
- any relevant status/evidence columns

Every in-scope-now row must have one of:

- Implemented + evidence
- Product Owner Decision + reason
- Blocked + reason/owner/date

## Step 11 — Review pack

Create:

```text
docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/
```

With:

```text
implementation_summary.md
test_output/
scan_logs/
screenshots/
api_contract.md
db_migrations.md
manual_qa_checklist.md
commit.txt
```

`implementation_summary.md` must include:

- changed files
- new/changed endpoints
- new/changed DB tables/columns
- tests added
- screenshots captured
- gaps remaining
- product owner decisions required
- completion gate status

## Step 12 — Commit and push

After validation passes:

```powershell
git status
git add .
git commit -m "Complete planning MPS MRP BOQ capacity pack implementation"
git push
git rev-parse HEAD > docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/commit.txt
```

Do not claim completion unless P0 gates pass and evidence exists.

