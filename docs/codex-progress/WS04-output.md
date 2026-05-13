# WS04 Engineering / Planning Output

Date: 2026-05-13

## Status

COMPLETE for the WS04 touched scope. Critical touched-scope blockers are 0. The remaining MPS draft/create gap was closed by wiring a centered governed create/edit workspace to the existing live `/api/mps` create/update endpoints, while demo/no-live sessions keep Save disabled with a clear sign-in reason.

## Files Changed

- Web contracts/client: MPS upsert request types and `/api/mps` create/update client methods.
- Web planning adapter: MPS line mapping, draft save adapter, and demo/no-live read-only guard.
- Web planning UI: MPS centered draft/edit workspace, governed item/UOM/status selectors, date controls, decimal quantity controls, and live Save action.
- Tests: MPS live create/save coverage and updated Wave 5A expectations.
- Governance/docs: WS04 workstream matrices plus action, field, and issue registry updates.
- Host publish assets: refreshed IIS publish-folder web assets through `npm run build:host` and `dotnet publish`.

## Screens Completed

- BOM Library
- BOM Detail / Editor
- BOM Comparison
- ECO / Revision Control
- Routing Library
- Operation Standard / Cycle Times
- Alternate Item / Replacement Rules
- Engineering Attachment / Document Viewer
- MPS Planner
- MRP Run Console
- MRP Results / Exceptions
- BOQ / Requirements
- Capacity Planning Board
- Available to Promise / Order Promise
- Machine Schedule Board
- PPS Machine Occupancy Calendar

## Actions Wired / Disabled / Hidden

- Wired: `New MPS draft` now opens a centered governed MPS workspace.
- Wired: `Save MPS draft` now persists through live `/api/mps` create/update in authenticated live sessions.
- Wired: MPS line add/remove inside the draft workspace.
- Disabled with reason: `Save MPS draft` remains disabled in demo/no-live sessions because live planning sign-in is required.
- Disabled with reason: `Export MPS`, ATP what-if/export, MRP shortage conversion/export, and capacity writeback/rebuild remain guarded by explicit business reasons where full downstream workflow is outside WS04.
- Preserved truthful working or disabled states for BOM, routing, ECO, MRP, BOQ, capacity, machine board, and engineering document actions.
- No visible WS04 touched action remains handlerless and enabled.

## Field / Governance Results

- Lookup violations fixed: MPS status, schedule item, and planning UOM use governed selectors.
- Numeric violations fixed: MPS line number uses `ErpNumberField`; planned quantity uses `ErpDecimalField`.
- Date truth fixed: MPS planning horizon and schedule periods use date controls.
- Existing engineering/planning screens remain governed for item, UOM, work center, machine/resource, routing, operation, effectivity, capacity, and date fields.

## Backend / DB Changes

- No backend schema change was required.
- Existing MPS live create/update endpoints were reused through new web contracts and adapter methods.
- No destructive database operation was performed.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 42 files / 171 tests
- `npm run build`: PASS with Vite chunk-size warning only
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence

Folder: `docs/codex-review-screens/WS04/`

Captured BOM library/editor/comparison, ECO, routing, operation standards, alternate items, engineering documents, MPS list and draft modal, MRP console and run modal, MRP results, BOQ/requirements, capacity board, ATP, machine board, and occupancy calendar.

## Remaining Blockers

- None for WS04 touched critical gates.
- Non-blocking future depth: MRP archive/compare, broader capacity writeback/rebuild, BOM import/print/reporting exports, ATP simulation, and document-control audit workflows remain future enhancements outside the WS04 closure slice.

## Review Pack

`artifacts/review-packs/WS04-review-pack.zip`
