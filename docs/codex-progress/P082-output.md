# P082 Output

## Objective Status

- Implemented the `P082` web wave for company, branch, and department setup screens.
- Preserved the IIS publish-folder deployment model and the shared reference UI language.
- Used the existing organization API read surfaces where available and kept typed seeded fallback adapters for demo or degraded reads.

## Deliverables Completed

- Added `W020 Company Master` with legal entity, tax, currency, timezone, calendar, KPI, grid, and drawer review.
- Added `W021 Branch Master` with plant/site type, timezone, default warehouse, contact, KPI, grid, and drawer review.
- Added `W022 Department Master` with department type, parent, manager, KPI, grid, and ownership drawer review.
- Added route and navigation entries for organization setup screens.
- Added focused regression coverage for company, branch, and department screen rendering and drawer behavior.

## Live vs Stubbed Backend Usage

- Live backend surfaces used when not in demo mode:
  - `/api/companies`
  - `/api/branches`
  - `/api/departments`
- Typed seeded fallback remains active for demo sessions or unavailable organization endpoints.

## Files Created or Changed

- `/src/web/src/api/contracts.ts`
- `/src/web/src/api/http.ts`
- `/src/web/src/api/hooks.ts`
- `/src/web/src/organization/organizationAdapters.ts`
- `/src/web/src/pages/OrganizationPages.tsx`
- `/src/web/src/pages/OrganizationPages.test.tsx`
- `/src/web/src/app/router.tsx`
- `/src/web/src/layout/navigation.ts`
- `/src/server/STS.Mfg.Host/wwwroot/index.html`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index-Ccrjuaw-.css`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index-Bq2ZvHDp.js`

## Assumptions Captured

- Organization and scope remain `KEEP` surfaces under the V2 remediation guardrails, so this prompt verifies and exposes setup state rather than replacing the backbone.
- Write actions remain admin-draft labels in the web shell; this prompt did not invent additional save semantics beyond existing API contracts.
- Demo/mock paths remain available as required by the web foundation guardrails.

## Open Issues / Blockers

- No blocker for `P082`.

## Build / Test / Lint

- `npm run typecheck` passed.
- `npm test` passed with `22/22` frontend tests.
- `npm run build` passed.
- `npm run build:host` passed and refreshed `STS.Mfg.Host/wwwroot`.
- Backend validation was not run for `P082` because this prompt only changed web runtime and progress documentation.

## Next Prompt

- `/02-prompts/P083_warehouse-bin-and-shift-screens.md`
