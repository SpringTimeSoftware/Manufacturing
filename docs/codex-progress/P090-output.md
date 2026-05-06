# P090 Output - Supplier Lead-Time Matrix and Attachment Viewer

Date: 2026-04-20

## Scope Completed

- Implemented `P090_supplier-lead-time-matrix-and-attachment-viewer.md`.
- Added supplier lead-time matrix screen for W048.
- Added attachment/document viewer screen for W049.
- Registered routes:
  - `/partners/supplier-lead-times`
  - `/platform/attachments`

## Runtime Wiring

- Supplier lead-time matrix uses the completed `/api/supplier-lead-times` backend read path for non-demo sessions.
- Attachment viewer is an explicit typed deferred adapter because no completed attachment listing controller exists yet.
- Demo/degraded fallback remains typed and visible.

## Files Changed

- `src/web/src/api/hooks.ts`
- `src/web/src/commercial/commercialPlanningAdapters.ts`
- `src/web/src/pages/CommercialPlanningPages.tsx`
- `src/web/src/pages/PromptP090P095Pages.test.tsx`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/dist/index.html`
- `src/web/dist/assets/index-Ccrjuaw-.css`
- `src/web/dist/assets/index-C7lbaHE4.js`
- `src/server/STS.Mfg.Host/wwwroot/index.html`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-Ccrjuaw-.css`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-C7lbaHE4.js`

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 12 files, 43 tests.
- `npm run build` passed.
- `npm run build:host` passed.
- Backend validation was not run because this prompt changed web client/runtime assets only.
- Vite emitted the existing chunk-size warning for the main JS bundle; this is non-blocking.

## Next Prompt

`/02-prompts/P091_quote-estimate-list-and-detail-screens.md`
