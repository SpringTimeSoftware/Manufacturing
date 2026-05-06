# P085 Output - Measurement Profile and Dimensional Formula Screens

Date: 2026-04-20

## Scope Completed

- Implemented web setup screens for `P085_measurement-profile-and-dimensional-formula-screens.md`.
- Added measurement profile and formula registry UX with list/detail drawer behavior.
- Wired live-read adapters to completed backend endpoints:
  - `/api/measurement-profiles`
  - `/api/measurement-formulas`
  - `/api/uom/classes`
  - `/api/uom`
- Preserved catch-weight and dimensional-formula visibility without adding inventory, costing, or production posting behavior.

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

- No backend contracts were invented.
- Existing measurement endpoints are used where available; seeded fallback remains for demo mode.
- The screen remains setup/admin-focused and does not alter mobile execution scope.
- IIS publish-folder deployment was preserved through `npm run build:host`.

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 11 files, 34 tests.
- `npm run build` passed.
- `npm run build:host` passed.
- Backend validation was not run because P085 touched web client/runtime assets only.
- Vite emitted the existing chunk-size warning for the main JS bundle; this is non-blocking.

## Next Prompt

`/02-prompts/P086_item-group-attribute-and-reason-code-master-screens.md`
