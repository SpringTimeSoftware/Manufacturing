# P144 - Automated Web Tests

## Scope Completed

- Added a critical web-flow regression baseline for login, item detail, BOM library, BOQ planning, work orders, job cards, machine board, dashboards, and QC screens.
- Preserved the existing web shell, reference UI language, and demo/live adapter boundaries.
- Corrected the BOM assertion to target the actual rendered `OZ-50 Tank Assembly` record rather than a non-existent label.

## Files Changed

- `/src/web/src/pages/PromptP144CriticalFlows.test.tsx`
- `/docs/codex-progress/README.md`

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 17 files and 70 tests.
- `npm run build`: passed; Vite reported the existing chunk-size warning.
- `npm run build:host`: passed; Vite reported the existing chunk-size warning.

## Risks And Follow-Ups

- Web coverage is regression-oriented and uses current page surfaces; backend contract mocking remains intentionally limited to the repo's existing render helpers and adapters.

## Next Prompt

- `/02-prompts/P145_automated-mobile-tests.md`
