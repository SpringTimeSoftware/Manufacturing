# P114 Output - PPS Machine Occupancy Calendar

Date: 2026-04-20

## Scope Completed

- Implemented `P114_pps-machine-occupancy-calendar.md`.
- Upgraded W085 PPS Machine Occupancy Calendar at `/production/occupancy`.
- Added occupancy KPIs, date filters, source badge, and machine/day calendar rows derived from the machine-board adapter.

## Runtime Wiring

- Uses completed `/api/machine-board` reads to derive live occupancy rows for non-demo sessions.
- Demo and degraded API states use typed seeded occupancy data.
- No scheduling mutation or backend contract was invented.

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

`/02-prompts/P115_shift-production-entry-and-downtime-register.md`
