# P081 Output

## Objective Status

- Implemented the `P081` web wave for language setup, workflow and numbering setup, and tenant settings.
- Preserved the current platform shell, feature-flag strategy, and IIS publish-folder deployment model.
- Kept compatibility with remediation-era master and commercial rules by using the preserved localization backend where available and seeded adapters for workflow and tenant administration where runtime contracts are not yet present.

## Deliverables Completed

- Upgraded the language and translation screen to consume live translation resources with seeded fallback, module filtering, and translation-detail drawer review.
- Added workflow-and-numbering setup with registry KPIs, document-sequence grid, approval cues, and template drawer details.
- Added tenant settings with feature-flag review, environment-safe toggles, policy registry, and tenant configuration detail drawer.
- Extended navigation and routing so these screens remain inside the preserved platform administration shell.

## Live vs Stubbed Backend Usage

- Live backend surfaces used:
  - `/api/localization/resources`
- Typed adapter stubs kept intentionally:
  - workflow rule registry
  - numbering template registry
  - tenant policy registry
  - tenant-level feature-flag defaults beyond the existing local shell state

## Files Created or Changed

- `/src/web/src/platform/platformAdminAdapters.ts`
- `/src/web/src/pages/MasterPages.tsx`
- `/src/web/src/pages/MasterPages.test.tsx`
- `/src/web/src/app/router.tsx`
- `/src/web/src/layout/navigation.ts`
- `/src/server/STS.Mfg.Host/wwwroot/index.html`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index-Ccrjuaw-.css`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index-BIijzwrO.js`

## Assumptions Captured

- Translation review is read-oriented in this wave; mutation flows remain deferred until later prompts introduce the required backend write contracts.
- Workflow numbering and tenant policy remain configuration-visibility screens with seeded demo-safe registries rather than speculative save endpoints.
- Feature-flag review continues to honor the preserved web shell toggles and does not remove seeded/demo paths prematurely.

## Open Issues / Blockers

- No blocker for `P081`.
- Workflow save, numbering save, and tenant-settings persistence remain future backend work and were intentionally not invented in this prompt.

## Build / Test / Lint

- `npm run typecheck` passed.
- `npm test` passed with `19/19` frontend tests.
- `npm run build` passed.
- `npm run build:host` passed and refreshed `STS.Mfg.Host/wwwroot`.
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln` passed.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build` passed with `7/7` tests.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release` passed.

## Next Prompt

- `/02-prompts/P082_company-branch-and-department-screens.md`
