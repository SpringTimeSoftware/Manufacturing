# START HERE — Codex Execution Prompt

You are working in:

C:\StsPackages\Manufacturing_ERP

Pack path:

C:\StsPackages\Manufacturing_ERP\docs\erp_completion_packs_v1\production_shop_floor_completion_pack_v1

Execute the **Production / Shop Floor / Work Order / Job Card Completion Pack** exactly.

## Binding files

Read these files before changing code:

1. `production_shop_floor_benchmark_workbook_v1.xlsx`
2. `production_shop_floor_completion_spec_v1.md`
3. `production_shop_floor_validation_checklist_v1.md`
4. `production_shop_floor_invalid_output_rules_v1.md`
5. `anti_pattern_scan_queries.txt`

The workbook is the binding implementation contract. Do not treat it as sample data.

## Required module scope

Implement or retrofit:

- Production order / work order list, create, edit, detail and lifecycle.
- Planned order / demand source conversion or source-link handoff.
- Production order header with governed item/BOM/routing/plant/warehouse/work center/cost/status/date/quantity fields.
- Multi-operation route execution lines.
- Multi-component material requirement and issue/backflush/return lines.
- Release readiness: material, capacity, document, quality and source checks.
- Job card / traveler print/export, print logs and barcode/QR scan truth.
- Shop-floor dispatch board by plant, work area, work center and machine.
- Operator terminal / production floor execution interface.
- Start, pause, resume, complete, progress, scrap, rework and reject actions.
- Labor, machine, setup, run, indirect and downtime registrations.
- Material issue, backflush, return, shortage and substitute actions.
- Lot/serial/bin/warehouse traceability handoff.
- Production receipt, partial receipt, WIP/cost status and close gates.
- Quality inspection/NCR/hold-release handoff.
- Audit timeline and RBAC.
- No fake seeded operational data in live authenticated mode.
- Tests, screenshots, scan logs and review-pack evidence.

## Mandatory execution order

1. Scan the repository.
   - Identify current pages/routes/components.
   - Identify API controllers/services/DTOs/models.
   - Identify DB entities/migrations/seeds.
   - Identify current fake data/demo data paths.
   - Identify current buttons/actions and whether they work.

2. Update `Current_Mapping` in the workbook.
   - Map every found screen/API/DB area.
   - Mark unknown/missing areas explicitly.
   - Do not implement before mapping.

3. Populate `Gap_Template`.
   - Use observed repo gaps, not guesses.
   - Prioritize P0 gaps first.

4. Write failing tests first.
   - P0 field validation.
   - P0 lookup truth.
   - P0 numeric/date truth.
   - Work order lifecycle.
   - Multi-operation save/reopen.
   - Multi-component issue/backflush save/reopen.
   - Dispatch board from real data.
   - Operator terminal start/complete.
   - Production confirmation yield/scrap/rework/time.
   - Receipt and close gates.
   - Lot/serial traceability handoff.
   - RBAC.
   - No seeded live data.
   - No dead visible actions.
   - Anti-pattern scans.

5. Implement.
   - Use full-page or centered modal workspace for deep create/edit/detail.
   - Use compact editable grids/tables for desktop operation/component transaction lines.
   - Enforce lookup fields via governed selects/autocomplete, not free text.
   - Enforce numeric/date/time fields via typed controls and API/DB validation.
   - Persist every action to API/DB.
   - Reopen/refresh/API round trip must preserve all P0 fields and transaction lines.
   - Make every visible action working, disabled with reason, or hidden.

6. Validate.
   - Run backend tests.
   - Run frontend tests.
   - Run build/typecheck/lint.
   - Run static anti-pattern scans.
   - Run manual/e2e flows where required.

7. Capture screenshots.
   - Use `Screenshot_Gates` sheet.
   - Store evidence in review pack.

8. Update workbook.
   - Update `Current_Mapping`, `Gap_Template`, test status and evidence references.
   - Do not leave P0 rows as unknown.

9. Create review pack.
   - Include updated workbook.
   - Include screenshots.
   - Include test logs.
   - Include anti-pattern scan logs.
   - Include API/DB evidence.
   - Include changed files manifest.
   - Include commit hash after commit.

10. Commit and push only after P0 completion gates pass.

## Hard rejection patterns

Reject and fix any of the following:

- `lines[0]`
- `firstLine`
- `First line`
- only first component/operation saved
- no Add Line / Remove Line where transaction lines exist
- totals or postings from first row only
- desktop card-per-line transaction entry
- fake upload/view/print/export buttons
- buttons with only toast and no real action
- status changes that only mutate local UI state
- unrestricted text for governed fields
- text input for numeric/date/time fields
- seeded/demo operational data shown in live authenticated mode
- production receipt without inventory movement
- issue/backflush without inventory/WIP/cost/audit effect
- close without close gates
- completion claim without screenshots/tests/scan logs/review pack

## Minimum acceptable outcome

The module may be called complete only when every P0 completion gate in `Completion_Gates` is complete and evidenced.

Do not summarize the pack instead of executing it.
Do not infer missing ERP depth.
Do not implement sample-only fields.
Do not claim completion without updated matrices, tests, screenshots, scan logs and review pack.
