# P112 Output - Job Card Detail Timeline Drawer

Date: 2026-04-20

## Scope Completed

- Implemented `P112_job-card-detail-timeline-drawer.md`.
- Added W083 Job Card Detail / Timeline Drawer inside the existing `/production/job-cards` screen.
- Added timeline rendering, quantity KPIs, downtime event grid, and pause/reject/complete action labels.

## Runtime Wiring

- Uses `/api/job-cards/{id}` for live detail, events, and downtime lines when available.
- Falls back to typed seeded detail rows in demo or degraded API states.
- No job-card mutation flow was added from the web.

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

`/02-prompts/P113_machine-schedule-board.md`
