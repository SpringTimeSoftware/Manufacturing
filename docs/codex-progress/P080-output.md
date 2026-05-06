# P080 Output

## Objective Status

- Implemented the `P080` web wave for user, role, and permission management screens.
- Preserved the existing web shell, reference admin visual language, and IIS publish-folder deployment flow.
- Kept compatibility-safe behavior by leaving user and role administration behind typed seeded adapters until dedicated backend endpoints exist.

## Deliverables Completed

- Added a user-management surface with KPI summary, filterable access grid, status badges, and access-policy drawer details.
- Added a role-and-permission matrix with module coverage, branch scope cues, workflow approval cues, and permission-lane drawer details.
- Extended platform routing and navigation so the new admin screens sit inside the preserved platform shell instead of branching to a separate experience.
- Added focused regression coverage for both admin pages.

## Live vs Stubbed Backend Usage

- Live backend surfaces used:
  - none in this prompt wave
- Typed adapter stubs kept intentionally:
  - user directory listing
  - role matrix listing
  - permission-lane and branch-scope detail composition

## Files Created or Changed

- `/src/web/src/platform/platformAdminAdapters.ts`
- `/src/web/src/pages/AdminPages.tsx`
- `/src/web/src/pages/AdminPages.test.tsx`
- `/src/web/src/app/router.tsx`
- `/src/web/src/layout/navigation.ts`
- `/src/server/STS.Mfg.Host/wwwroot/index.html`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index-Ccrjuaw-.css`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index-BIijzwrO.js`

## Assumptions Captured

- User provisioning, role maintenance, and permission mutation remain non-destructive visual administration flows until backend contracts are explicitly introduced later in the prompt chain.
- The remediation-era company and branch model remains visible in the admin views as read-oriented scope metadata only.
- Demo-safe seeded records remain necessary so the admin surfaces can be exercised without inventing unsupported auth-management APIs.

## Open Issues / Blockers

- No blocker for `P080`.

## Build / Test / Lint

- `npm run typecheck` passed.
- `npm test` passed with `19/19` frontend tests.
- `npm run build` passed.
- `npm run build:host` passed and refreshed `STS.Mfg.Host/wwwroot`.

## Next Prompt

- `/02-prompts/P081_language-workflow-numbering-and-tenant-settings-screens.md`
