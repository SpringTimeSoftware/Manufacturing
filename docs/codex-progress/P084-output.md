# P084 Output - UOM Class and Conversion Screens

Date: 2026-04-20

## Scope Completed

- Implemented web setup screens for `P084_uom-class-and-conversion-screens.md`.
- Added UOM class and UOM conversion pages using the existing reference UI shell, cards, drawers, KPI strip, filter bar, and grid patterns.
- Wired live-read adapters to completed backend endpoints:
  - `/api/uom/classes`
  - `/api/uom`
  - `/api/uom/conversions`
- Preserved typed seeded fallback for demo mode and degraded API states.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/masters/masterDataAdapters.ts`
- `src/web/src/pages/MeasurementPages.tsx`
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

- No runtime backend, schema, EF entity, migration, or SQL object was changed.
- Existing measurement APIs remain the source of truth when a non-demo session is active.
- Fallback is explicit and typed; it is not a replacement for completed SQL-backed APIs.
- IIS publish-folder deployment was preserved through `npm run build:host`.

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 11 files, 34 tests.
- `npm run build` passed.
- `npm run build:host` passed.
- Backend validation was not run because P084 touched web client/runtime assets only.
- Vite emitted the existing chunk-size warning for the main JS bundle; this is non-blocking.

## Next Prompt

`/02-prompts/P085_measurement-profile-and-dimensional-formula-screens.md`
