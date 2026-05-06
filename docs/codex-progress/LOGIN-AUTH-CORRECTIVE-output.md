# LOGIN-AUTH-CORRECTIVE Output

Date: 2026-04-21

## Scope Completed

- Stopped normal feature expansion and completed a corrective login/auth entry pass only.
- Redesigned the login page as a full-height enterprise split layout with a compact sign-in card.
- Removed visible prompt, framework, deployment, demo-shell, and implementation-note copy from the login page.
- Cleaned forgot-password entry copy that still exposed adapter/pending-endpoint language.
- Preserved the forgot-password route and existing frontend auth adapter behavior.

## Auth/Session Fix

- Updated session restore so a stale stored session does not keep the user authenticated after restore failure.
- Updated invalid refresh-token handling to clear browser storage and return to anonymous sign-in state without showing the raw `Refresh token is invalid or expired.` message.
- Added a frontend regression test proving invalid stored refresh tokens are cleared silently.

## Files Changed

- `/src/web/src/pages/LoginPage.tsx`
- `/src/web/src/auth/AuthContext.tsx`
- `/src/web/src/auth/AuthContext.test.tsx`
- `/src/web/src/pages/PlatformPages.tsx`
- `/src/web/src/pages/PromptP144CriticalFlows.test.tsx`
- `/src/web/src/i18n/I18nProvider.tsx`
- `/src/web/src/styles/base.css`
- `/docs/codex-progress/LOGIN-AUTH-CORRECTIVE-output.md`
- `/docs/codex-progress/README.md`
- Validation regenerated `/src/web/dist/`, `/src/server/STS.Mfg.Host/wwwroot/`, `/src/web/tsconfig.app.tsbuildinfo`, and `/src/web/node_modules/.vite/vitest/results.json`.

## Validation Results

- `npm run typecheck`: passed
- `npm test`: passed, 18 test files and 71 tests
- `npm run build`: passed, Vite emitted the existing large-chunk warning
- `npm run build:host`: passed, Vite emitted the existing large-chunk warning and copied the web build to the host wwwroot
- Backend validation was not run because no backend auth/session/runtime code changed.

## Next Recommended Step

- Perform a manual localhost login smoke test after clearing existing browser storage, then resume only the next approved corrective or release-readiness task.
