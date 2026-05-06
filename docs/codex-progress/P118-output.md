# P118 Output - QC Plan and Incoming Inspection Screens

Date: 2026-04-20

## Scope Completed

- Implemented `P118_qc-plan-and-incoming-inspection-screens.md`.
- Added W100 QC Plan Setup at `/quality/plans`.
- Added W101 Incoming Inspection at `/quality/incoming-inspections`.
- Added typed quality DTO usage, quality API reads, seeded fallback rows, QC plan filters, inspection drawers, parameter result grids, source badges, navigation, routing, and regression coverage.

## Runtime Wiring

- QC Plan Setup uses completed `/api/quality/plans` reads for non-demo sessions.
- Incoming Inspection uses completed `/api/quality/inspections` reads with an incoming inspection filter for non-demo sessions.
- Demo and degraded API states use typed seeded fallback rows.
- Hold/release and NCR creation remain backend-owned; no mutation contract was invented.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/quality/qualityAdapters.ts`
- `src/web/src/pages/QualityPages.tsx`
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

`/02-prompts/P119_in-process-final-inspection-and-ncr-screens.md`
