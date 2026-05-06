# P093 Output - Blanket Order and Demand Forecast Screens

Date: 2026-04-20

## Scope Completed

- Implemented `P093_blanket-order-and-demand-forecast-screens.md`.
- Added blanket order/contract screen for W053.
- Added demand forecast screen for W054.
- Registered routes:
  - `/sales/blanket-orders`
  - `/sales/forecasts`

## Runtime Wiring

- Uses completed `/api/blanket-orders` and `/api/forecasts` backend read paths for non-demo sessions.
- Demo/degraded fallback remains typed and visible.
- Forecasts remain planning inputs and do not auto-create sales orders or MPS records.

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

`/02-prompts/P094_mps-planner-and-available-to-promise-screen.md`
