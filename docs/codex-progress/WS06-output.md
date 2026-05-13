# WS06 Inventory / Quality / Dispatch / Documents Output

Date: 2026-05-13

## Status

COMPLETE for the WS06 touched scope. Critical touched-scope blockers are 0. Cycle-count, quality decision, NCR closeout, shipment proof, and document/proof workflows now have truthful visible actions: working in live authenticated sessions where APIs exist, or disabled with clear business-safe reasons where workflow depth remains future work.

## Files Changed

- Web contracts/client: cycle-count upsert/post, inspection hold/release, NCR close, and shipment proof request types plus API client methods.
- Web adapters: cycle-count company, branch, warehouse, item, bin, lot, serial, and variant IDs mapped into governed save payloads.
- Web inventory/quality/dispatch pages: live-source truth cleanup, centered WS06 workspaces, governed lookup/date/decimal controls, and live action wiring.
- Tests: WS06 coverage for cycle-count save/post, inspection release, NCR close, shipment proof save, and proof upload state.
- Governance/docs: WS06 workstream matrices plus action, field, schema, and issue registry updates.
- Host publish assets: refreshed IIS publish-folder web assets through `npm run build:host` and `dotnet publish`.

## Screens Completed

- Inventory Balance by Warehouse / Bin
- Lot / Serial / Catch Weight Traceability
- Material Issue to WO
- Material Return from WO
- Stock Transfer / Putaway
- Cycle Count
- QC Plan Setup
- Incoming Inspection
- In-Process Inspection
- Final Inspection
- NCR / Deviation
- Pack List
- Dispatch Planning
- Shipment / Delivery
- Attachment / Document Viewer
- Engineering Attachment / Document Viewer
- Print Pack / Traveler / Labels
- IIS Host Publish Output

## Actions Wired / Disabled / Hidden

- Wired: `Save count sheet` updates live `/api/cycle-counts/{id}` with governed count header and line quantities.
- Wired: `Post count` posts to live `/api/cycle-counts/{id}/post`.
- Wired: `Apply hold` posts to live `/api/quality/inspections/{id}/hold`.
- Wired: `Release hold` posts to live `/api/quality/inspections/{id}/release`.
- Wired: `Close NCR` posts to live `/api/quality/ncrs/{id}/close`.
- Wired: `Save proof status` posts to live `/api/dispatch/shipments/{id}/proof`.
- Verified: `Load proof` remains tied to shared attachment upload for live shipment records.
- Disabled with reason: new count generation, new inspection, new NCR, pack-list creation/save, shipment preparation/close, print/export/reporting actions where downstream workflow approval is not yet enabled.
- Hidden: no WS06 touched visible action needed to be hidden.

## Field / Governance Results

- Lookup violations fixed: cycle-count warehouse/type/status, inspection source/trace, NCR disposition/rework link, pack/shipment status, and shipment pack-list context use governed controls.
- Numeric violations fixed: cycle-count counted/system quantities, pack quantity, and shipment quantity use numeric/decimal controls.
- Date violations fixed: cycle-count date uses date input; shipment loaded/delivered timestamps use datetime controls.
- Upload truth fixed: shipment proof upload uses shared attachment storage and remains disabled with reason outside live shipment records.
- Live data truth fixed: touched inventory, quality, and dispatch pages no longer silently label failed live operational loads as seeded data in authenticated mode.

## Backend / DB Changes

- No backend schema change was required.
- Existing live endpoints were reused through new web contracts and client methods.
- NCR web client routes were corrected to `/api/quality/ncrs`.
- No destructive database operation was performed.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 44 files / 175 tests
- `npm run build`: PASS with Vite chunk-size warning only
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence

Folder: `docs/codex-review-screens/WS06/`

Captured 22 entries: inventory balances, traceability, material issue, material return, stock transfer, cycle count, QC plan setup, incoming/in-process/final inspections, NCR, pack lists, dispatch planning, shipment delivery, attachment viewer, engineering documents, print pack, and WS06 modal workspaces for cycle count, inspection, NCR, shipment proof, and pack list.

## Remaining Blockers

- None for WS06 touched critical gates.
- Non-blocking future depth: new cycle-count generation rules, inventory material posting, inspection result entry, NCR disposition release, pack-list authoring, shipment close approval, carrier integration, and final print/export delivery remain future workflow extensions with visible disabled reasons.

## Review Pack

`artifacts/review-packs/WS06-review-pack.zip`
