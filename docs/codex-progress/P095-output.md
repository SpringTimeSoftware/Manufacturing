# P095 Output - BOM Library Screen

Date: 2026-04-20

## Scope Completed

- Implemented `P095_bom-library-screen.md`.
- Replaced the earlier generic BOM library route with a reference-anchored BOM library page for W060.
- Preserved route `/engineering/boms`.
- Used `/reference-ui/W060_BOM_Management.html` as the visual anchor for page composition: library grid, selected revision context, status badges, structure preview, and detail drawer.

## Runtime Wiring

- Uses completed `/api/boms` backend read path for non-demo sessions.
- Demo/degraded fallback maps existing seeded BOM records.
- No BOM detail/editor scope from P096 was executed.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/engineering/engineeringAdapters.ts`
- `src/web/src/pages/EngineeringPages.tsx`
- `src/web/src/pages/PromptP090P095Pages.test.tsx`
- `src/web/src/app/router.tsx`
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

`/02-prompts/P096_bom-detail-and-editor-screen.md`
