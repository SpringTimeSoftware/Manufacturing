# Wave 01 Critical Login/Auth/Shell/Content Hardening Output

Date: 2026-04-21

## Scope

Implemented Wave 1 only from the V2 Deep Screen & Feature Rework Specification: login entry, auth/session cleanup, shell/header/sidebar cleanup, SuperAdmin visibility seed alignment, production-facing content cleanup, and focused regression tests.

## Login And Auth Fixes

- Reworked the login entry copy and controls into a cleaner enterprise sign-in surface with professional manufacturing ERP messaging.
- Added password visibility control and autocomplete/session-scope cleanup for the login form.
- Hardened stored-session restore so malformed sessions are cleared before they can affect auth.
- Ensured new login attempts clear stale stored sessions before calling login.
- Prevented stale Authorization headers from being attached to login, refresh, and forgot-password requests.
- Kept forgot-password behavior enumeration-safe and aligned with the existing backend response shape.

## Shell And Content Fixes

- Compacted the shell header/context controls and sidebar behavior.
- Renamed guided shell copy to business-facing workflow shortcut language.
- Removed visible implementation/source-status wording from login, shell, platform/admin, dashboard, notification, master-data, commercial, engineering, planning, operations, inventory, quality, dispatch, and partner surfaces touched by the Wave 1 sweep.
- Preserved role-aware navigation and route guards, including SuperAdmin full-menu access through the existing role/audit design.

## SuperAdmin Seed Alignment

- Added `SuperAdmin` role, permission visibility, user visibility, and branch role mappings to `database/seed/001_minimum_platform_seed.sql`.
- Mirrored `super.admin` in the platform admin fallback visibility data so UAT/admin screens present the same deliberate bootstrap identity.
- Updated tenant setting seed labels to production-safe deployment and workflow wording.

## Tests Added Or Updated

- Added stale stored-session and stale-login-storage coverage in `AuthContext.test.tsx`.
- Added route guard redirect and role-denial coverage in `RouteGuard.test.tsx`.
- Added login page internal-copy assertions in the critical flow test.
- Updated shell tests for workflow shortcut copy, full-access role menu rendering, and shell internal-copy assertions.
- Updated forgot-password test to fill required recovery fields before submit.
- Updated older source-status badge assertions to the new business-facing workspace label.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 19 files / 76 tests.
- `npm run build`: passed; existing Vite large chunk warning remains.
- `npm run build:host`: passed; existing Vite large chunk warning remains.
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: passed, 0 warnings / 0 errors.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: passed, 12 tests.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: passed; publish surfaced npm audit warnings for 5 moderate dependency vulnerabilities during web dependency install.

## Remaining Wave 1 Gaps

- No implementation/test gaps remain in the repository changes.
- Operational follow-up: apply the updated SQL seed to the target database and run live browser UAT for `super.admin` full-menu sign-in after deployment.

## Next Recommended Wave

Wave 2: Platform And Admin Depth.
