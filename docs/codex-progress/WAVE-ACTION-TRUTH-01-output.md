# Wave ACTION-TRUTH-01 - No Dead Create/Edit/Save Actions

Date: 2026-04-23

## Scope

Completed a global action reliability enforcement pass across currently implemented web screens. This pass did not add a business domain wave, did not redesign navigation/sidebar, and did not change backend or database code.

## Files Changed

- `/07-ux-governance/action_truth_matrix.csv`
- `/docs/codex-progress/README.md`
- `/docs/codex-progress/WAVE-ACTION-TRUTH-01-output.md`
- `/src/web/src/pages/DashboardPages.tsx`
- `/src/web/src/pages/WaveActionTruth01.test.tsx`
- `/src/web/src/ui/ErpComponents.test.tsx`
- `/src/web/src/ui/ErpComponents.tsx`
- `/src/web/src/ui/Tile.tsx`

## Action Truth Matrix

- Audited 203 visible action labels across web page files.
- Final classification:
  - 16 working actions.
  - 187 actions disabled with reasons.
- Matrix output: `/07-ux-governance/action_truth_matrix.csv`.

## Fixes Completed

- `ErpActionBar` now prevents handlerless actions from rendering as enabled buttons.
- Handlerless governed actions now receive the business-safe default reason: `Action requires an enabled workflow.`
- Disabled governed actions without a supplied reason now receive the business-safe default reason: `Action is temporarily unavailable.`
- Passive `Tile` surfaces without `onClick` now render as non-button display tiles, removing 41 dead clickable KPI/detail tiles.
- Dashboard export actions that had no export handler are now always disabled with business-safe reasons.
- No backend/API action was newly wired in this pass.

## Tests Added / Updated

- Added `src/web/src/pages/WaveActionTruth01.test.tsx` covering:
  - handlerless governed actions are disabled with reason;
  - dashboard export remains disabled with reason even when print/export flags are enabled;
  - action labels do not expose internal implementation wording.
- Updated `ErpComponents.test.tsx` to cover default disabled action reasons and passive tile behavior.

## Remaining Top 20 Action Gaps

1. Quote draft create/save remains disabled until commercial workflow enablement.
2. Sales order create/save/release remains disabled until order-entry workflow enablement.
3. Blanket order create/save remains disabled until contract workflow enablement.
4. Forecast create/import remains disabled until planning import workflow enablement.
5. ATP what-if run/export remains disabled until ATP workflow enablement.
6. Supplier lead-time row save/review remains disabled until supplier lead-time workflow enablement.
7. Attachment/document upload remains disabled until approved storage configuration.
8. BOM line save remains disabled until line-level engineering change workflow enablement.
9. Routing create/save/release remains disabled until routing authoring workflow enablement.
10. Operation standard save/review remains disabled until engineering workflow enablement.
11. MRP run/review remains disabled until full planning launch workflow enablement.
12. BOQ bulk conversion remains outside this pass; only eligible live row actions are wired from Wave 5A.
13. Capacity rebuild/save remains disabled until capacity planning service enablement.
14. Procurement PR/PO/subcontract approve/save actions remain disabled until procurement workflows are enabled.
15. Inventory issue/transfer/return/post/export actions remain disabled until inventory posting/export workflows are enabled.
16. Production receipt/scrap/rework post/save actions remain disabled until posting workflows are enabled.
17. Quality plan/inspection/NCR create/save/release actions remain disabled until quality workflows are enabled.
18. Dispatch pack/wave/shipment prepare/save/print/export actions remain disabled until dispatch workflows are enabled.
19. Organization master create/save actions remain disabled until organization approval workflows are enabled.
20. Platform admin invitation/role/settings mutation actions remain disabled until platform governance workflows are enabled.

## Validation Results

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 32 files / 125 tests
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- Backend validation was not required because no backend code changed.

Notes:
- Web production build reports the existing Vite chunk-size warning for the main bundled JavaScript asset.

## Local Run Status

- Web dev server: running on `http://127.0.0.1:5173`
- Backend host: running on `https://localhost:7042`
- Mobile Metro: running on `http://127.0.0.1:8081`

## Exact Next Recommended Wave

Wave 5B: Engineering authoring and planning execution workflow completion.
