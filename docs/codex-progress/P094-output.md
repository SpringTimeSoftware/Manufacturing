# P094 Output - MPS Planner and Available-to-Promise Screen

Date: 2026-04-20

## Scope Completed

- Implemented `P094_mps-planner-and-available-to-promise-screen.md`.
- Added MPS planner screen for W055.
- Added available-to-promise/order-promise screen for W056.
- Registered routes:
  - `/planning/mps`
  - `/sales/available-to-promise`

## Runtime Wiring

- MPS planner uses completed `/api/mps` backend read path for non-demo sessions.
- Available-to-promise is an explicit typed deferred adapter because no completed ATP/order-promise endpoint exists yet.
- No material, capacity, inventory, or production promise logic was invented.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
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

`/02-prompts/P095_bom-library-screen.md`
