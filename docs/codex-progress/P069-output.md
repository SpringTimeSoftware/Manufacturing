# P069 Output

## Objective Status

- Implemented the web shell: login page, session restore, top bar, company/branch switch, side navigation, protected routes, and sign-out flow.
- Made company/branch context visible on every protected page through the shell hero bar and context switch controls.
- Preserved compatibility with the backend auth contract while adding a guarded demo-session fallback for isolated UI work when auth services are unavailable.

## Deliverables Completed

- Added auth storage, auth/session provider, route guard, router, shell layout, and navigation registry.
- Added login UX and notification drawer entry point.
- Wired the shell to `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`, `/api/auth/switch-context`, and `/api/auth/logout`.

## Files Created or Changed

- `/src/web/src/auth/authStorage.ts`
- `/src/web/src/auth/AuthContext.tsx`
- `/src/web/src/layout/navigation.ts`
- `/src/web/src/layout/RouteGuard.tsx`
- `/src/web/src/layout/AppShell.tsx`
- `/src/web/src/app/AppProviders.tsx`
- `/src/web/src/app/router.tsx`
- `/src/web/src/pages/LoginPage.tsx`
- `/src/web/src/notifications/NotificationCenter.tsx`

## Assumptions Captured

- The backend auth surface is the primary runtime path.
- Demo sign-in is a development/bootstrap fallback only and does not replace live authentication.

## Open Issues / Blockers

- No blocker for `P069`.
- Notification reads are currently client-side because no dedicated `/api/notifications` controller exists yet.

## Build / Test / Lint

- `npm run build` passed in batch validation.
- `npm test` passed in batch validation.

## Next Prompt

- `/02-prompts/P070_design-tokens-theme-and-reusable-surface-components.md`
