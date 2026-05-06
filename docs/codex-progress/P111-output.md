# P111 Output - Job Cards List Screen

Date: 2026-04-20

## Scope Completed

- Implemented `P111_job-cards-list-screen.md`.
- Upgraded W082 Job Cards List at `/production/job-cards`.
- Added API-backed job-card list adapter, execution KPIs, filters, status badges, and source badge.

## Runtime Wiring

- Uses completed `/api/job-cards` reads for non-demo sessions.
- Demo and degraded API states use typed seeded job-card rows.
- Web remains review/supervisor scope; mobile execution ownership is preserved.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/operations/operationsAdapters.ts`
- `src/web/src/pages/OperationsPages.tsx`
- `src/web/src/pages/PromptP108P115Pages.test.tsx`

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 15 files, 61 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run build:host` passed and kept host publish integration valid.
- Backend validation was not run because this prompt changed web client/runtime assets only.

## Next Prompt

`/02-prompts/P112_job-card-detail-timeline-drawer.md`
