# Planning / MPS / MRP / BOQ / Capacity Completion Summary

Run ID: Planning MRP BOQ Capacity completion pack
Date: 2026-05-14

## Pack Source

The requested `START_HERE_CODEX_PROMPT.txt` was not present in the pack folder. The pack was executed from the actual included execution prompt:

- `planning_mrp_boq_capacity_codex_execution_prompt_v1.md`
- `planning_mrp_boq_capacity_completion_spec_v1.md`
- `planning_mrp_boq_capacity_benchmark_workbook_v1.xlsx`

## Implemented

- Updated workbook `Current_Mapping` and `Gap_Template` evidence columns.
- Updated workbook screenshot/completion evidence.
- Added a planning workspace route at `/planning/workspace`.
- Added compact-grid planning workspace sections for MRP snapshots, planned orders, pegging, shortage actions, capacity buckets, and document evidence state.
- Added additive backend/API/DB foundation for:
  - planning plans
  - planning snapshots
  - planned orders
  - planned order conversion to purchase requisition and work order
  - shortage actions
- Wired live plan save, manual planned order save, purchase planned-order conversion, work planned-order conversion with BOM prerequisite gating, and shortage action save.
- Changed live capacity board data loading to use the live machine-board API instead of throwing unavailable by default.
- Preserved explicit demo mode behavior while preventing silent live seeded fallback.
- Added/updated tests for planning workspace evidence, conversion action truth, compact forecast grid, and multiline MPS save.
- Captured screenshot evidence for planning workspace, create/edit modals, MPS, forecast, MRP, BOQ, capacity, machine board, stage board, audit trail, conversion, shortage and document-evidence states.

## Validation Results

- `cmd /c npm run typecheck`: PASS
- `cmd /c npm test`: PASS, 66 files / 235 tests
- `cmd /c npm run audit:erp-completion`: PASS
- `cmd /c npm run build`: PASS
- `cmd /c npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Gated With Reason

- Recurring MRP schedule remains disabled because the scheduler service is not implemented in this repo.
- Transfer-order conversion remains disabled because source/destination warehouse and transfer order posting are not implemented in the current planning contract.
- Planning evidence upload remains disabled because planning document metadata authorization is not available yet.
- Work order conversion is disabled unless the planned order is persisted and has a released BOM revision.

## Evidence

- Test: `src/web/src/pages/PlanningMrpBoqCapacityCompletion.test.tsx`
- UI: `src/web/src/pages/PlanningCompletionPages.tsx`
- API: `src/server/STS.Mfg.Api/Controllers/SalesPlanningControllers.cs`
- Service: `src/server/STS.Mfg.Infrastructure/SalesPlanning/SalesPlanningService.cs`
- DB: `database/ddl/20-commercial/050_planning_mrp_boq_capacity_completion_tables.sql`
- Screenshots: `docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/screenshots/`
