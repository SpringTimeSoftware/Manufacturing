# P087 Output - Item List and Item Detail Editor

Date: 2026-04-20

## Scope Completed

- Implemented web screens for `P087_item-list-and-item-detail-editor.md`.
- Replaced the generic item directory route with a V2-compatible item list/detail editor shell.
- Wired live-read adapter to the completed `/api/items` endpoint and supporting measurement reads.
- Preserved costing, landed-cost, and inventory posting hooks as display/setup context only.

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

- Existing `/api/items` behavior is preserved.
- The page prefers live reads for non-demo sessions and falls back to typed seeded records for demo/degraded states.
- No destructive master-data reset or backend refactor was performed.
- IIS publish-folder deployment was preserved through `npm run build:host`.

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 11 files, 34 tests.
- `npm run build` passed.
- `npm run build:host` passed.
- Backend validation was not run because P087 touched web client/runtime assets only.
- Vite emitted the existing chunk-size warning for the main JS bundle; this is non-blocking.

## Next Prompt

`/02-prompts/P088_item-variants-and-barcode-screens.md`
