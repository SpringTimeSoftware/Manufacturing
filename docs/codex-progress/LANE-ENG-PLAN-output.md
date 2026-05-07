# Lane ENG-PLAN Output

## Prompt
- Branch: `lane/eng-plan`
- Lane: Engineering + Planning
- Scope: BOM, Routing, ECO, Operation Standards, Alternate Items, Engineering Documents, MPS, MRP, BOQ / Requirements, Capacity Planning, and related machine occupancy only if touched.

## Updates
- Added governed visible disabled reasons for BOM row-level editor actions:
  - Add component line
  - Remove line
  - Add operation line
  - Remove operation
- Added governed visible disabled reasons for Routing row-level editor actions:
  - Add routing step
  - Remove step
- Kept MPS draft actions disabled with visible reasons and locked the MPS detail horizon field to review-only while drafting remains unavailable.
- Updated `07-ux-governance/action_truth_matrix.csv` for the touched Engineering/Planning actions.

## Validation
- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 34 test files / 136 tests
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 12 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence
- `docs/codex-review-screens/LANE-ENG-PLAN/bom-editor.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/bom-editor-workspace.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/routing-library.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/routing-workspace.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/boq-requirements.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/boq-requirements-workspace.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/mrp-run-console.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/mrp-run-workspace.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/capacity-planning.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/capacity-planning-workspace.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/mps-planner.png`
- `docs/codex-review-screens/LANE-ENG-PLAN/mps-workspace.png`

## Final Single-Lane Review Pass - 2026-05-07
- Re-read the lane rules, progress rules, ERP interaction standards, action-truth matrix, latest engineering/planning wave outputs, and current engineering/planning UI/adapters/backend surfaces.
- Stayed on `lane/eng-plan` only and did not start a new domain wave.
- Rechecked touched Engineering/Planning action surfaces; page-level direct button scan found only the governed inline helper in `EngineeringContinuationPages.tsx`.
- Corrected action-truth ownership for `Create shortage actions` and `Export exceptions` from the MRP run console to `MrpResultsExceptionsPage` at `/planning/mrp-results`.
- Confirmed the MRP Results / Exceptions page renders both touched actions disabled with visible business reasons.
- Added screenshot evidence: `docs/codex-review-screens/LANE-ENG-PLAN/mrp-results-exceptions.png`.

## Final Review Validation - 2026-05-07
- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 34 test files / 136 tests
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS, 0 warnings / 0 errors
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 12 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Merge-Ready Cleanup Pass - 2026-05-07
- Kept work on `lane/eng-plan` and PR #1 only.
- Added a visible disabled reason and explicit accessible label to the locked `Horizon` field in the MPS modal workspace.
- Extended `Wave05AEngineeringPlanningDepth.test.tsx` to assert the locked MPS horizon field and visible reason.
- Updated `07-ux-governance/action_truth_matrix.csv` for the touched `Save MPS draft` workspace action notes.
- Refreshed screenshot evidence:
  - `docs/codex-review-screens/LANE-ENG-PLAN/mps-planner.png`
  - `docs/codex-review-screens/LANE-ENG-PLAN/mps-workspace.png`

## Merge-Ready Validation - 2026-05-07
- `npm.cmd run typecheck`: PASS
- `npm.cmd test -- Wave05AEngineeringPlanningDepth.test.tsx`: PASS, 5 tests
- `npm.cmd test`: PASS, 34 test files / 136 tests
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS, 0 warnings / 0 errors
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 12 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS
