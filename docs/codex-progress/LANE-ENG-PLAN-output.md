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
