# Wave 5B Engineering Authoring And Planning Workflow Completion

Completed on 2026-04-24.

## Scope handled

- Finished live BOM authoring for draft line save in the governed modal workspace.
- Finished live routing authoring for new, edit, and clone save flows.
- Finished live operation-standard create and save flows.
- Finished governed MRP draft start workflow using the live planning start endpoint.
- Kept BOQ bulk conversion and capacity review actions honest with explicit disabled reasons where no backend workflow exists.
- Updated the global action-truth matrix for every touched engineering and planning action.

## Frontend changes

- `BomLibraryPage` now opens a real live BOM draft header modal and creates BOM drafts through the BOM create API.
- `BomDetailEditorPage` now saves draft BOM lines and operation links through the BOM update API.
- `RoutingLibraryPage` now supports new routing, live routing save, and clone-to-new routing save through the routing APIs.
- `OperationStandardPage` now supports new and existing operation save through the resource operation APIs.
- `MrpRunConsolePage` now opens a governed MRP draft modal and starts live MRP runs through the planning API.
- `BoqRequirementsPage` now shows an explicit disabled bulk-convert action because only line-level conversion exists.
- `CapacityPlanningBoardPage` remains review-only with disabled overload/rebuild/save actions and business-safe reasons.

## Action truth enforcement

- Locked edit controls on seeded/read-only engineering records so users cannot change fields that cannot be persisted.
- Kept touched visible actions in one of these states only:
  - WORKING
  - DISABLED WITH BUSINESS-SAFE REASON
  - HIDDEN
- Updated `/07-ux-governance/action_truth_matrix.csv` for:
  - New BOM draft
  - Save draft lines
  - Clone revision
  - New routing
  - Clone routing
  - Save routing
  - New operation
  - Save operation
  - Run MRP draft
  - Save run parameters
  - Version snapshot
  - Approve selected line
  - Convert selected line
  - Convert reviewed lines
  - Review overloads
  - Rebuild capacity draft
  - Save capacity review

## Tests added or updated

- Added `Wave05BEngineeringPlanningWorkflowCompletion.test.tsx` for:
  - live BOM line save
  - live routing save and clone
  - live operation create/update save
  - live MRP run start
- Updated `Wave05AEngineeringPlanningDepth.test.tsx` for current routing, MRP, BOQ, and capacity behavior.

## Validation

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS (`33` files, `129` tests)
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: PASS
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: PASS (`12` tests)
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot evidence

- Captured local review screens under `/docs/codex-review-screens/WAVE05B/`.
- Screenshots created:
  - `bom-editor-list-top.png`
  - `bom-editor-workspace-top.png`
  - `routing-list-top.png`
  - `routing-workspace-top.png`
  - `boq-requirements-top.png`
  - `mrp-run-console-top.png`
  - `mrp-run-workspace-top.png`
  - `capacity-planning-top.png`
  - `capacity-planning-modal-top.png`

## Notes

- No backend, EF, SQL, seed, or `database/README.md` changes were required.
- The first `dotnet publish` attempt failed because the local Vite dev process locked `src/web/node_modules/@esbuild/win32-x64/esbuild.exe`. After stopping the web dev process, publish completed successfully.
- Build output still reports the existing large Vite chunk warning.
- Publish still reports the existing npm audit result with `5 moderate` vulnerabilities during `npm ci`.

## Remaining blocked actions

1. BOM import CSV
2. BOM print
3. Operation standards export
4. MRP version snapshot export
5. MRP parameter save without run start
6. BOQ bulk conversion
7. Capacity overload review workflow
8. Capacity rebuild workflow
9. Capacity review save workflow
10. Engineering document-control linking/upload workflow

## Next recommended wave

- Wave 5C: Engineering documents, alternate-item authoring, and planning/capacity backend workflow completion.
