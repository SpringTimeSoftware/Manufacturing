# P086 Output - Item Group, Attribute, and Reason Code Master Screens

Date: 2026-04-20

## Scope Completed

- Implemented web setup screens for `P086_item-group-attribute-and-reason-code-master-screens.md`.
- Added item group/category, item attribute, and reason-code/status-rule pages.
- Marked these screens as deferred-data surfaces because the completed backend does not expose dedicated item group, item attribute, or centralized reason-code APIs.
- Preserved item master compatibility rules by not inventing new backend contracts.

## Files Changed

- `src/web/src/api/hooks.ts`
- `src/web/src/masters/masterDataAdapters.ts`
- `src/web/src/pages/ItemMasterPages.tsx`
- `src/web/src/pages/PromptP084P089Pages.test.tsx`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/dist/index.html`
- `src/web/dist/assets/index-Ccrjuaw-.css`
- `src/web/dist/assets/index-Jog8fh05.js`
- `src/server/STS.Mfg.Host/wwwroot/index.html`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-Ccrjuaw-.css`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-Jog8fh05.js`

## Compatibility Notes

- Deferred typed adapters are explicit and compatibility-safe.
- No schema, API, controller, service, EF, or SQL additions were made for P086.
- Reason-code setup remains a UI setup scaffold only; production receipt, scrap, rework, and quality posting logic were not changed.
- IIS publish-folder deployment was preserved through `npm run build:host`.

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 11 files, 34 tests.
- `npm run build` passed.
- `npm run build:host` passed.
- Backend validation was not run because P086 touched web client/runtime assets only.
- Vite emitted the existing chunk-size warning for the main JS bundle; this is non-blocking.

## Next Prompt

`/02-prompts/P087_item-list-and-item-detail-editor.md`
