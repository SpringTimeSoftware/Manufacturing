# P078 Output

## Objective Status

- Implemented the `P078` web wave for login, forgot-password recovery, company/branch/warehouse switching, notification center, and approval workbench.
- Preserved the IIS publish-folder deployment model and the existing light manufacturing shell language.
- Kept live compatibility with the current backend by continuing to use the preserved auth login and switch-context endpoints, while placing missing flows behind typed demo-safe adapters.

## Deliverables Completed

- Expanded `W001 Login` with device-registration cues and a direct recovery handoff.
- Added `W002 Forgot Password / Reset` as a dedicated recovery page using a typed adapter stub pending `/api/auth/forgot-password`.
- Added `W003 Company / Branch / Warehouse Switch` with live company/branch switching and local warehouse preference pinning.
- Upgraded `W006 Notification Center` into a filterable grid-and-drawer inbox with approval-safe action labels.
- Added `W007 Approval Workbench` with seeded manager review items, drawer detail, remarks capture, and demo approval decisions tied back to notification acknowledgments.

## Live vs Stubbed Backend Usage

- Live backend surfaces used:
  - `/api/auth/login`
  - `/api/auth/me`
  - `/api/auth/refresh`
  - `/api/auth/switch-context`
  - `/api/auth/logout`
- Typed adapter stubs used because live endpoints are still pending:
  - `/api/auth/forgot-password`
  - `/api/notifications`
  - `/api/approvals`
  - preferred warehouse persistence endpoint for operating context

## Files Created or Changed

- `/src/web/src/api/contracts.ts`
- `/src/web/src/app/AppProviders.tsx`
- `/src/web/src/app/router.tsx`
- `/src/web/src/auth/AuthContext.tsx`
- `/src/web/src/i18n/I18nProvider.tsx`
- `/src/web/src/layout/AppShell.tsx`
- `/src/web/src/layout/navigation.ts`
- `/src/web/src/notifications/NotificationProvider.tsx`
- `/src/web/src/pages/LoginPage.tsx`
- `/src/web/src/pages/PlatformPages.tsx`
- `/src/web/src/pages/PlatformPages.test.tsx`
- `/src/web/src/platform/platformAdapters.ts`
- `/src/web/src/platform/WorkspacePreferenceContext.tsx`
- `/src/web/src/styles/base.css`
- `/src/web/src/test/render.tsx`
- `/src/server/STS.Mfg.Host/wwwroot/index.html`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index-Ccrjuaw-.css`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index-BgG6t4yF.js`

## Assumptions Captured

- Warehouse selection remains a web preference until the backend exposes a preferred-warehouse context surface.
- Forgot-password and approval submission stay demo-safe in this wave so the current auth and execution backbone are not broken by speculative endpoints.
- Notification and approval wording stays audit-friendly and explicit even when the underlying action is still driven by a stub adapter.

## Open Issues / Blockers

- No blocker for `P078`.
- Follow-on backend work is still required before forgot-password, inbox synchronization, and approval posting can be moved off their typed adapters.

## Build / Test / Lint

- `npm run typecheck` passed.
- `npm test` passed with `12/12` frontend tests.
- `npm run build` passed.
- `npm run build:host` passed and updated `STS.Mfg.Host/wwwroot`.
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln` passed.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build` passed with `7/7` tests.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release` passed.

## Next Prompt

- `/02-prompts/P079_home-dashboard-and-executive-cockpit.md`
