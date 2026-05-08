# WAVE02 Platform Security Audit Admin Output

Date: 2026-05-08

## Scope

Wave 2 completed scoped platform, security, audit, and admin hardening on `main`. No unrelated business domains were started and no SQL changes were made.

## Fixed

- Added a scoped audit trail read API at `/api/audit-trail` with role/company/branch scoping and a new Platform Admin audit viewer at `/platform/audit-trail`.
- Wired audit viewer row detail to a centered modal workspace and added visible CSV export for scoped audit events.
- Replaced notification and approval detail drawers with centered modal workspaces.
- Added audit writes for notification acknowledgement and approval decisions.
- Hardened platform read endpoints with explicit authorization policies for users, roles, tenant settings, and workflow rules.
- Scoped notification, approval, and user listing data to the active company/branch unless the user has deployment-level access.
- Added ASP.NET Core rate limiting buckets for authentication, AI, integration/webhook, import/export, and default API traffic.
- Strengthened attachment visibility by applying active organization and record visibility scope in attachment listing.
- Added attachment authorization regression tests for organization and own-record visibility.
- Added rate limiting regression tests for auth, AI, integration, export, and default buckets.
- Masked provider credential references, webhook secret references, and webhook header secrets in integration API mapping.
- Wired User Management and Role Matrix CSV exports so touched visible export actions are no longer dead.

## Action Truth

Updated `07-ux-governance/action_truth_matrix.csv` for the touched platform/admin actions:

- User Management export: `WORKING`
- Role Matrix export: `WORKING`
- Audit Trail export: `WORKING`
- Audit Trail open event: `WORKING`
- Notification mark all/read/open linked record: `WORKING` or hidden/disabled with reason where appropriate
- Approval approve/reject/request changes/open linked record: `WORKING` or hidden where no linked record exists
- Existing governed user/role lifecycle actions remain `DISABLED WITH REASON`

## Remaining Blocked Actions

- User invite, access reset, and access-policy save remain disabled pending governed identity lifecycle workflow.
- Custom role creation, role cloning, and role template save remain disabled pending role governance approval.
- Provider secret rotation remains a production governance blocker until an approved secret-store rotation runbook and provider disable process are implemented.
- Device trust and lost-device procedures remain pilot blockers.

## Screenshot Evidence

Screenshots are stored under `docs/codex-review-screens/WAVE02/`:

- `audit-trail-top.png`
- `audit-trail-modal.png`
- `users-top.png`
- `users-modal.png`
- `roles-top.png`
- `roles-modal.png`
- `notifications-top.png`
- `notifications-modal.png`
- `approvals-top.png`
- `approvals-modal.png`

## Validation

- `npm run typecheck`: PASS
- `npm test`: PASS
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 passed
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS
