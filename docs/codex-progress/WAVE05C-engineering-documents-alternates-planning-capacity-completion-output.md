# Wave 5C Engineering Documents, Alternate-Item Authoring, And Planning/Capacity Workflow Completion

Completed on 2026-04-24.

## Scope handled

- Finished live engineering document linking with governed attachment metadata save.
- Finished alternate-item authoring create and save inside the centered governed workspace.
- Closed the remaining visible engineering and planning action-truth gaps on the touched Wave 5C screens.
- Kept every touched visible action in one of these states only:
  - WORKING
  - DISABLED WITH BUSINESS-SAFE REASON
  - HIDDEN
- Captured local screenshot evidence for every touched primary screen and modal under `/docs/codex-review-screens/WAVE05C/`.

## Backend and host-build changes

- Added a live attachment list and save service layer so engineering documents can read and create linked document records through `/api/attachments`.
- Added the attachments API controller for governed engineering document linking.
- Extended the sales-planning service contract and controller surface for BOQ reviewed-line conversion, then used the live endpoint from the web layer.
- Fixed the host publish pipeline so:
  - `npm run build` remains the compile step,
  - `npm run build:host` copies the built web artifacts into `STS.Mfg.Host/wwwroot`,
  - publish runs the build and host-copy steps in order, and
  - `npm ci` only runs when the web dependencies are missing.

## Frontend changes

- `AlternateItemRulesPage` now supports live create and update through governed `New rule` and `Save rule` actions.
- `AlternateItemRulesPage` export now queues a governed export job.
- `EngineeringAttachmentViewerPage` now loads live engineering attachments and supports live `Link document` through the attachments API.
- `EngineeringAttachmentViewerPage` keeps `Open audit trail` visibly disabled with a business-safe reason until the document-control review workflow exists.
- `OperationStandardPage` export now queues a governed export job instead of staying blocked.
- `MrpRunConsolePage` now queues version snapshots through the export-job workflow and keeps save-only parameter persistence explicitly disabled.
- `BoqRequirementsPage` now uses the live reviewed-line conversion endpoint and keeps disabled reasons explicit when no BOQ header or eligible lines are selected.
- `CapacityPlanningBoardPage` now uses `Review overloads` as a real review action that opens the governed overload workspace.
- `CapacityPlanningBoardPage` keeps `Rebuild capacity draft` and `Save capacity review` explicitly disabled because no planning workflow exists yet.

## Action truth enforcement

- Updated `/07-ux-governance/action_truth_matrix.csv` for all Wave 5C touched actions.
- No touched action remains `UNKNOWN`.
- Touched actions finalized as:
  - WORKING:
    - `Export alternates`
    - `New rule`
    - `Save rule`
    - `Link document`
    - `Export standards`
    - `Version snapshot`
    - `Convert reviewed lines`
    - `Review overloads`
  - DISABLED WITH BUSINESS-SAFE REASON:
    - `Open audit trail`
    - `Import CSV`
    - `Print`
    - `Export comparison`
    - `Save run parameters`
    - `Rebuild capacity draft`
    - `Save capacity review`

## Tests added or updated

- Added `Wave05CEngineeringDocumentsAlternatesCapacity.test.tsx` for:
  - BOM blocked-action disabled reasons
  - alternate-item create/save/export
  - engineering document linking truthfulness
  - MRP snapshot export and save-only parameter truth
  - BOQ reviewed-line conversion truth
  - capacity review truthfulness
- Updated `Wave05AEngineeringPlanningDepth.test.tsx` to align with the final Wave 5C BOQ and capacity behavior.

## Validation

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS (`34` files, `136` tests)
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: PASS
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: PASS (`12` tests)
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot evidence

Captured under `/docs/codex-review-screens/WAVE05C/`:

- `bom-library-top.png`
- `bom-library-draft-modal-top.png`
- `bom-editor-top.png`
- `routing-list-top.png`
- `routing-draft-modal-top.png`
- `boq-requirements-top.png`
- `mrp-run-console-top.png`
- `mrp-run-workspace-top.png`
- `capacity-planning-top.png`
- `capacity-planning-review-top.png`
- `alternate-items-top.png`
- `alternate-items-draft-modal-top.png`
- `engineering-documents-top.png`
- `engineering-documents-link-modal-top.png`

## Notes

- No database, EF model, DDL, seed, or `database/README.md` changes were required.
- The first host publish attempt failed on a stale static-web-assets cache after refreshed hashed frontend files. Cleaning the host release output and republishing resolved it.
- Build output still reports the existing large Vite chunk warning.
- Publish still reports the existing `5 moderate` npm audit findings during `npm ci`.
- Local projects were restarted after validation:
  - web: `http://127.0.0.1:5173`
  - backend: `https://127.0.0.1:7042` and `http://127.0.0.1:5102`
  - mobile Metro: `http://127.0.0.1:8081`

## Remaining top 10 blocked actions

1. BOM import through the approved bulk import workflow
2. BOM print package generation
3. BOM comparison export/report generation
4. Engineering document audit trail viewer
5. MRP save-only parameter persistence
6. Capacity rebuild workflow
7. Capacity review persistence
8. Capacity overload resolution posting workflow
9. Alternate-item approval and release lifecycle workflow
10. Document-control review and retention workflow

## Next recommended wave

- Wave 6A: Production execution hardening and inventory-quality posting workflow completion.
