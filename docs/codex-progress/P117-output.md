# P117 Output - Rework Order and Machine Status Screen

Date: 2026-04-20

## Scope Completed

- Implemented `P117_rework-order-and-machine-status-screen.md`.
- Added W090 Rework Order at `/production/rework-orders`.
- Added W093 Machine Status / OEE-lite at `/production/machine-status`.
- Added typed rework DTO usage, machine-board status adapter projection, seeded fallback rows, filters, KPIs, grids, drawers, navigation, routing, and regression coverage.

## Runtime Wiring

- Rework Order uses completed `/api/scrap-rework/rework-orders` reads for non-demo sessions.
- Machine Status / OEE-lite uses completed `/api/machine-board` reads for non-demo sessions and projects the existing board payload into an availability snapshot.
- Demo and degraded API states use typed seeded fallback rows.
- Full OEE costing/performance modeling was not invented; the page stays OEE-lite as requested.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/production/productionOutputAdapters.ts`
- `src/web/src/pages/ProductionOutputPages.tsx`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/src/pages/PromptP116P123Pages.test.tsx`

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 16 files, 67 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run build:host` passed and kept host publish integration valid.
- Backend validation was not run because this prompt changed web client assets only.

## Next Prompt

`/02-prompts/P118_qc-plan-and-incoming-inspection-screens.md`
