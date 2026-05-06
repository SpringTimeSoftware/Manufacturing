# P088 Output - Item Variants and Barcode Screens

Date: 2026-04-20

## Scope Completed

- Implemented web screens for `P088_item-variants-and-barcode-screens.md`.
- Added item variant matrix and barcode/label setup pages.
- Wired live-read adapters to completed endpoints:
  - `/api/item-variants`
  - `/api/item-barcodes`
  - `/api/items`
  - `/api/uom`
  - `/api/measurement-profiles`
- Preserved scan/label setup as web-admin scope without changing mobile execution flows.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/masters/masterDataAdapters.ts`
- `src/web/src/pages/ItemMasterPages.tsx`
- `src/web/src/pages/PromptP084P089Pages.test.tsx`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/dist/index.html`
- `src/web/dist/assets/index-Ccrjuaw-.css`
- `src/web/dist/assets/index-Jog8fh05.js`
- `src/server/STS.Mfg.Host/wwwroot/index.html`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-Ccrjuaw-.css`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-Jog8fh05.js`

## Compatibility Notes

- Existing item, variant, barcode, UOM, and measurement profile contracts are used as read sources.
- Typed seeded fallback remains for demo mode and degraded API states.
- No production receipt, inventory-cost, scrap, rework, landed-cost, or return logic was finalized here.
- IIS publish-folder deployment was preserved through `npm run build:host`.

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 11 files, 34 tests.
- `npm run build` passed.
- `npm run build:host` passed.
- Backend validation was not run because P088 touched web client/runtime assets only.
- Vite emitted the existing chunk-size warning for the main JS bundle; this is non-blocking.

## Next Prompt

`/02-prompts/P089_customer-and-supplier-list-detail-screens.md`
