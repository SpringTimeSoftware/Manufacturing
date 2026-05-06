# P115 Output - Shift Production Entry and Downtime Register

Date: 2026-04-20

## Scope Completed

- Implemented `P115_shift-production-entry-and-downtime-register.md`.
- Added W091 Shift Production Entry at `/production/shift-production`.
- Added W092 Downtime Register at `/production/downtime`.
- Added navigation entries, route wiring, filters, KPIs, grids, drawers, source badges, and regression coverage.

## Runtime Wiring

- Downtime Register uses completed `/api/downtime` reads for non-demo sessions.
- Shift Production Entry derives live rows from `/api/job-cards` when available, because a direct shift production entry endpoint is not yet completed.
- Demo and degraded API states use typed seeded/deferred rows.
- No production receipt, scrap, by-product, or P116 work was executed.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/operations/operationsAdapters.ts`
- `src/web/src/pages/OperationsPages.tsx`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/src/pages/PromptP108P115Pages.test.tsx`
- `docs/codex-progress/P108-output.md`
- `docs/codex-progress/P109-output.md`
- `docs/codex-progress/P110-output.md`
- `docs/codex-progress/P111-output.md`
- `docs/codex-progress/P112-output.md`
- `docs/codex-progress/P113-output.md`
- `docs/codex-progress/P114-output.md`
- `docs/codex-progress/P115-output.md`
- `docs/codex-progress/README.md`

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 15 files, 61 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run build:host` passed and kept host publish integration valid.
- Backend validation was not run because this prompt changed web client/runtime assets only.

## Next Prompt

`/02-prompts/P116_production-receipt-and-scrap-by-product-screens.md`
