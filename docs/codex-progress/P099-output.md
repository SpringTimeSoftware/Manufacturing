# P099 Output - Alternate Item Rules and Engineering Attachment Surfaces

Date: 2026-04-20

## Scope Completed

- Implemented `P099_alternate-item-rules-and-engineering-attachment-surfaces.md`.
- Added W070 Alternate Item / Replacement Rules as `/engineering/alternate-items`.
- Added an engineering-scoped W049 Attachment / Document Viewer as `/engineering/documents`.
- Kept attachment listing dependency explicit instead of pretending deferred document rows are live data.

## Runtime Wiring

- Alternate item rules use completed `/api/alternate-items` reads for non-demo sessions.
- Engineering document viewer remains a typed deferred adapter because no completed attachment listing API is exposed yet.
- Demo and degraded API states use typed seeded adapters.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/engineering/engineeringContinuationAdapters.ts`
- `src/web/src/pages/EngineeringContinuationPages.tsx`
- `src/web/src/pages/PromptP096P101Pages.test.tsx`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 13 files, 49 tests.
- `npm run build` passed.
- `npm run build:host` passed.
- Backend validation was not run because this prompt changed web client/runtime assets only.
- Vite emitted the existing chunk-size warning for the main JS bundle; this is non-blocking.

## Next Prompt

`/02-prompts/P100_mrp-run-console-and-result-screen.md`
