# BOM-ROUTING-ECO-ENGINEERING-DOCUMENTS-COMPLETION-01 Output

## Pack Status

COMPLETE for the touched engineering pack scope.

## Files Changed

- `src/web/src/pages/EngineeringContinuationPages.tsx`
- `src/web/src/engineering/engineeringContinuationAdapters.ts`
- `src/web/src/pages/Wave05AEngineeringPlanningDepth.test.tsx`
- `src/web/src/pages/Wave05BEngineeringPlanningWorkflowCompletion.test.tsx`
- `src/web/src/pages/BomRoutingEcoEngineeringDocumentsCompletion.test.tsx`
- `scripts/audit-transaction-line-grid.mjs`
- `docs/final-audit/11_bom_routing_eco_engineering_gap_matrix.csv`
- `07-ux-governance/action_truth_matrix.csv`
- `07-governance/entity_field_schema_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `docs/final-audit/07_screen_issue_register.csv`
- `docs/codex-progress/README.md`
- `docs/codex-review-screens/BOM-ROUTING-ECO-ENGINEERING-DOCUMENTS-COMPLETION-01/`
- `docs/erp_completion_packs_v1/bom_routing_eco_engineering_documents_completion_pack_v1/`

## Screens Fixed

- BOM Detail / Editor
- Routing Library / Editor
- ECO / Revision Control
- Operation Standards reviewed for governed/numeric/action truth
- Alternate Items reviewed for governed/numeric/action truth
- Engineering Documents reviewed for upload/action truth
- BOM Comparison reviewed for disabled export truth

## Fields, Actions, And Workflows Corrected

- BOM component rows now use compact editable grid/table line entry.
- BOM component item and UOM use governed lookup controls.
- BOM component quantity and scrap percent use decimal/numeric controls.
- BOM component Add Line, Duplicate Line, Remove Line, and Save draft lines are truthful.
- BOM operation rows now use compact editable grid/table line entry.
- BOM operation standard uses governed lookup controls.
- BOM operation setup/run/teardown values use decimal controls.
- Routing operation rows now use compact editable grid/table line entry.
- Routing operation standard and work center use governed lookup controls.
- Routing setup/run/teardown/overlap values use decimal controls.
- Released/active routing direct edit is blocked with a business reason; routing changes require a cloned draft.
- ECO now has a centered New ECO draft workspace with affected-object line grid.
- ECO affected-object impact/action fields use governed selectors; target ID is numeric; effective date uses date input.
- Save ECO draft calls the engineering-change API with all affected-object lines.
- ECO submit requires affected objects and impact summaries.
- ECO Open linked record is disabled with reason until exact target routes are supported.
- Engineering document upload/link flow remains real through platform attachment upload; audit trail remains disabled with reason.

## Line-Grid Anti-Patterns Removed

- Removed BOM component repeated desktop row form editor.
- Removed BOM operation repeated desktop row form editor.
- Removed routing operation repeated desktop row form editor.
- Removed `components[0]` adapter access.
- Extended `audit:transaction-line-grid` to inspect engineering grids and engineering first-line/card-line anti-patterns.

## Tests Added/Updated

- Added `src/web/src/pages/BomRoutingEcoEngineeringDocumentsCompletion.test.tsx`.
- Updated `src/web/src/pages/Wave05AEngineeringPlanningDepth.test.tsx`.
- Updated `src/web/src/pages/Wave05BEngineeringPlanningWorkflowCompletion.test.tsx`.
- Extended `scripts/audit-transaction-line-grid.mjs`.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 65 test files and 231 tests passed.
- `npm run audit:erp-completion`: PASS
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests passed.
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS
- Non-blocking validation notes: React test warning for NotificationProvider state updates in an existing Procure-to-Pay test, and Vite chunk size warning.

## Screenshot Folder

- `docs/codex-review-screens/BOM-ROUTING-ECO-ENGINEERING-DOCUMENTS-COMPLETION-01/`

## Review Pack

- `artifacts/review-packs/BOM-ROUTING-ECO-ENGINEERING-DOCUMENTS-COMPLETION-01-review-pack.zip`

## Remaining Blockers

- Operation-specific component issue link is disabled until BOM lines support operation-linked issue timing.
- Routing machine assignment remains disabled until routing-machine assignment is enabled.
- ECO exact linked-record navigation remains disabled until affected object routes are confirmed for BOM/routing/document/item target types.
- Report export for BOM comparison remains disabled pending approved reporting workflow.
