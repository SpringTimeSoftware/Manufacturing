# Initial Scan Findings

Pack: `planning_mrp_boq_capacity_completion_pack_v1`  
Date: 2026-05-14

## Pack Preflight

- The requested `START_HERE_CODEX_PROMPT.txt` file is not present in the pack folder.
- The pack's actual execution prompt is `planning_mrp_boq_capacity_codex_execution_prompt_v1.md`; this run uses that file with the workbook as the binding contract.
- Workbook, completion spec, validation checklist, invalid-output rules, manifest, and review template are present.

## Current Implementation Surface

- MPS and demand forecast screens exist in `src/web/src/pages/CommercialPlanningPages.tsx`.
- MRP run console, MRP exception results, and BOQ/net requirement screens exist in `src/web/src/pages/PlanningPages.tsx`.
- Capacity planning board exists in `src/web/src/pages/PlanningContinuationPages.tsx`.
- Machine board and stage-wise dashboards exist in operations/dashboard pages.
- Backend contracts and APIs exist for forecasts, MPS, MRP runs, BOQ requirements, BOQ approve/convert, procurement PR/PO, work orders, and stock transfer.

## Baseline Gaps

- No explicit planning plan/scenario workspace is mapped as a persisted planning object.
- MRP runs persist run items, but snapshot IDs, hashes, deltas, and compare evidence are not surfaced as first-class planner evidence.
- Planned orders are not surfaced as a type-specific planning lifecycle grid.
- BOQ conversion currently marks planning lines converted; full target-document preview/result evidence is incomplete.
- Exception and shortage action lifecycle is visible but not yet a persistent action-message workflow.
- Capacity planning is review-oriented; override/rebuild/resequence actions remain disabled with reason.
- Forecast import is disabled with reason; manual forecast grid save/reopen exists.

## Workbook Baseline Update

- `Current_Mapping` was populated for all rows with current UI/API/DB mapping or current gap classification.
- `Gap_Template` was populated for all rows with current finding, gap type, owner, target date, and baseline status.

