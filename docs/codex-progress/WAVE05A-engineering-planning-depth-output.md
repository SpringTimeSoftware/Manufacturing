# Wave 05A - Engineering And Planning Depth

Date: 2026-04-23

## Scope

Implemented Wave 5A only. This pass deepened the existing Engineering and Planning screens with governed ERP UI patterns, controlled lookup treatment for master-linked fields, and honest action states. No sidebar/menu, commercial master-data, customer/supplier, production execution, database, or backend feature expansion was performed.

## Backend / DB Changes

- No backend code changed.
- No database schema or seed scripts changed.
- Existing backend endpoints were reused from the current API surface:
  - BOM revision clone/approve endpoints.
  - ECO submit/approve/implement endpoints.
  - BOQ line approve/convert endpoints.
- Web API contracts/client methods were expanded so the existing endpoints can be called safely from the UI when live records are loaded.

## Engineering Screen Improvements

- BOM Library now uses governed filter/grid patterns and keeps parent-item selection as a controlled lookup field.
- BOM Library revision actions now classify correctly:
  - live BOM revisions can call real clone/approve API endpoints;
  - reference/offline rows remain disabled with business-safe reasons.
- BOM Detail / Editor now uses governed filter/grid patterns and a controlled parent-item lookup in the modal editor.
- BOM revision clone is wired to the existing live API endpoint when a live revision is selected; line save remains disabled because line-level ECO save workflow is not enabled in the UI.
- ECO / Revision Control now exposes lifecycle actions through governed action bars:
  - submit draft ECO;
  - approve submitted ECO;
  - implement approved ECO;
  - all call existing live API endpoints only when the selected record is live and in the correct status.
- Routing Library now opens a centered `ErpModalWorkspace` for routing detail instead of staying list-only, with controlled output item/status fields and operation sequence visibility.
- Engineering lists were moved toward `ErpFilterBar` / `ErpGrid` where touched in this pass.

## Planning Screen Improvements

- MRP Run Console keeps run actions disabled with clear business-safe wording because a complete MRP launch parameter workflow is not exposed in the current UI.
- MRP run detail now uses a controlled lookup for the triggering MPS source.
- MRP Results / Exceptions now uses governed filter/grid patterns.
- BOQ / Requirements now uses governed filter/grid patterns and row-level action reliability:
  - live BOQ lines can call the existing approve endpoint;
  - live reviewed BOQ lines can call the existing convert endpoint;
  - reference/offline lines remain disabled with clear reasons.
- BOQ modal now uses controlled lookups for source document, MRP run, conversion status, selected item, and approved action.
- Capacity Planning Board now uses governed filter/grid patterns, keeps machine and planned order as controlled lookup fields, and leaves capacity save/review actions disabled with business-safe reasons.
- MPS Planner now uses governed filter/grid patterns and controlled lookup display for the first bucket item/UOM context.

## Lookup Enforcement Summary

Controlled lookup/select treatment was applied or preserved for:

- BOM parent item
- BOM issue method/summary
- ECO lifecycle status actions
- Routing output item and status
- MRP run type and triggering MPS source
- BOQ source document, MRP run, conversion status, selected item, and approved action
- Capacity machine and planned order
- MPS first bucket item/UOM context

Free text remains only for business-entered names/descriptions/signals such as BOM name, routing name, revision text, planning horizon display, and capacity constraint signal.

## Remaining Engineering / Planning Gaps

- BOM line-level create/edit/save remains disabled; existing backend supports BOM upsert, but the UI still needs a full line-level ECO editor before enabling save.
- Routing create/clone/save remains disabled; existing routing APIs are present, but a governed route authoring workflow is still required.
- Operation standard create/edit remains disabled because this wave did not add resource setup mutation UI.
- Engineering document upload/link remains disabled until document-control storage/workflow is enabled.
- MRP start remains disabled until the UI exposes full run parameter validation and launch review.
- BOQ bulk conversion to purchase requisitions/work orders remains outside this pass; only existing line review/convert endpoints were wired.
- Capacity rebuild/save remains disabled because capacity planning APIs remain deferred.
- ATP what-if simulation remains deferred.

## Tests Added / Updated

- Added `src/web/src/pages/Wave05AEngineeringPlanningDepth.test.tsx` covering:
  - governed BOM library filter/grid/action behavior;
  - disabled non-live BOM revision actions;
  - BOM detail and ECO controlled lifecycle workspaces;
  - routing and capacity centered modal workspaces;
  - MRP/BOQ lookup-controlled planning details;
  - MPS governed filter/grid and lookup controls;
  - internal/scaffold wording guard for touched surfaces.
- Updated existing engineering/commercial-planning regression tests to assert the business-safe `Readiness view` label after removing `Reference view` from touched production-facing screens.

## Validation Results

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 31 files / 121 tests
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: PASS
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: PASS, 12 tests
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: PASS

Notes:
- Web production build reports the existing Vite chunk-size warning for the main bundled JavaScript asset.
- Backend publish initially failed because the running local web dev server held `node_modules\@esbuild\win32-x64\esbuild.exe`; the web dev process was stopped, publish was rerun successfully, and the web project was restarted for local testing.

## Local Run Status

- Web dev server: running on `http://127.0.0.1:5173`
- Backend host: running on `https://localhost:7042` and `http://localhost:5102`
- Mobile Metro: running on `http://127.0.0.1:8081`

## Exact Next Recommended Wave

Wave 5B: Engineering authoring and planning execution workflow completion, focused on BOM line/ECO editing, routing authoring, MRP launch parameters, BOQ bulk conversion, and capacity API foundation.
