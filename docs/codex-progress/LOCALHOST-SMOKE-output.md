# LOCALHOST-SMOKE Output

## Scope Completed

Performed a focused localhost smoke test against the published ASP.NET Core host at `http://127.0.0.1:5088`. This was not a full UAT run and did not execute any P-series prompt.

## Result

Overall result: PASS for published-host startup, login, authenticated shell navigation, and required page-open checkpoints, with non-blocking backend API findings on company and branch live list endpoints.

## Smoke Method

- Confirmed `STS.Mfg.Host.exe` was running from `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish`.
- Confirmed root URL returned HTTP `200` and title `STS Manufacturing ERP`.
- Confirmed `/api/health/live` and `/api/health/ready` returned `Healthy`.
- Used headless Chrome through Chrome DevTools Protocol to exercise the published app.
- Logged in through the UI with seeded bootstrap credentials: `platform.admin`, company `1`, branch `11`.
- Navigated authenticated routes for dashboard, organization context, notifications, approvals, admin, settings, planning, and production.
- Performed direct API verification for representative completed-scope endpoints after login.
- Checked host stdout and stderr for startup or fatal runtime blockers.

## Confirmed Working

- Localhost app opens at `http://127.0.0.1:5088`.
- Login page loads.
- Backend login succeeds with seeded bootstrap credentials.
- Dashboard shell loads after login.
- Company, branch, and department pages open.
- Notification and approval pages open.
- User, role, language, workflow/numbering, and tenant settings pages open.
- BOQ requirements and production work-order screens open.
- Direct API verification returned HTTP `200` for `/api/departments`, `/api/work-orders`, `/api/boq-requirements`, `/api/notifications`, and `/api/approvals`.
- Host process stayed responsive and ready health remained healthy.

## Failures And Findings

- `/api/companies` returned HTTP `500`; host log shows an EF translation failure involving unmapped `Company.CompanyId` in a scoped query.
- `/api/branches` returned HTTP `500`; host log shows an EF translation failure involving unmapped `Branch.BranchId` in a scoped query.
- Host stdout includes a non-fatal `TaskCanceledException` during a work-order operation-count read after route smoke. Direct `/api/work-orders` verification returned HTTP `200`, so this is recorded as a follow-up log finding rather than a navigation blocker.
- Host stderr was empty.

## Fixes Applied

No runtime, database, deployment, UI, or configuration changes were applied. Documentation-only smoke evidence was added.

## Files Created

- `/docs/uat/LOCALHOST_SMOKE_TEST_REPORT.md`
- `/docs/codex-progress/LOCALHOST-SMOKE-output.md`

## Next Recommended Step

Run a small runtime-alignment repair for the company and branch list APIs, then rerun the localhost smoke before starting full role-wise UAT.
