# P089 Output - Customer and Supplier List/Detail Screens

Date: 2026-04-20

## Scope Completed

- Implemented web screens for `P089_customer-and-supplier-list-detail-screens.md`.
- Replaced the generic customer and supplier directory routes with V2-compatible customer and supplier list/detail pages.
- Wired live-read adapters to completed endpoints:
  - `/api/customers`
  - `/api/customer-addresses`
  - `/api/suppliers`
  - `/api/supplier-addresses`
  - `/api/supplier-lead-times`
- Included supplier lead-time preview only; deeper lead-time maintenance remains owned by P090.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/masters/masterDataAdapters.ts`
- `src/web/src/pages/PartnerPages.tsx`
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

- Existing customer, supplier, address, and supplier lead-time APIs are used as read sources where available.
- Typed fallback remains for demo mode and degraded API states.
- No pricing, discount, tax, credit-control posting, procurement posting, or future commercial workflow was invented.
- IIS publish-folder deployment was preserved through `npm run build:host`.

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 11 files, 34 tests.
- `npm run build` passed.
- `npm run build:host` passed.
- Backend validation was not run because P089 touched web client/runtime assets only.
- Vite emitted the existing chunk-size warning for the main JS bundle; this is non-blocking.

## Next Prompt

`/02-prompts/P090_supplier-lead-time-matrix-and-attachment-viewer.md`
