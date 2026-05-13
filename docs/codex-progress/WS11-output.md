# WS11 Final Release / Performance / Hardening Output

Date: 2026-05-13

Status: PARTIAL / NOT PILOT-READY

WS11 completed the final release validation pass that can be executed safely inside the repo: release-critical navigation guard, V1 scope exclusion guard, browser performance smoke, screenshot evidence, validation, and review-pack generation. It does not mark the product pilot-ready because role-wise UAT, irreversible transaction proof, mobile live execution, provider rotation, and backup/restore rehearsal remain open.

## Files Changed

- `src/web/src/layout/WS11ReleaseHardening.test.tsx`
- `scripts/ws11-release-smoke.mjs`
- `docs/workstream-progress/WS11/WS11_scope_matrix.csv`
- `docs/workstream-progress/WS11/WS11_action_matrix.csv`
- `docs/workstream-progress/WS11/WS11_field_matrix.csv`
- `docs/workstream-progress/WS11/WS11_api_db_matrix.csv`
- `docs/workstream-progress/WS11/performance-smoke-results.json`
- `docs/codex-review-screens/WS11/`
- `07-ux-governance/action_truth_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `07-governance/entity_field_schema_matrix.csv`
- `docs/final-audit/07_screen_issue_register.csv`
- `docs/codex-progress/README.md`
- `artifacts/review-packs/WS11-review-pack.zip`

## Screens Completed / Revalidated

- Home dashboard
- Order Delivery Dashboard
- Stage Wise Dashboard
- MRP Run Console
- Machine Schedule Board
- Lot / Serial / Catch Weight Traceability
- Report Catalog
- Runtime UAT
- Provider Health
- Audit Trail

## Fields Corrected

- No new editable ERP fields were introduced.
- Release-critical field truth was revalidated through existing tests and WS11 route smoke.
- Touched governed-field violations remaining: 0.
- Touched numeric/date-field violations remaining: 0.

## Actions Wired / Disabled / Hidden

- Wired/revalidated: 4
  - Runtime UAT run checks
  - Runtime UAT evidence export
  - Provider Health refresh
  - WS11 release smoke route-open workflow
- Disabled with reason/revalidated: 2
  - Report Catalog export in non-live/review context
  - Audit export when events/export workflow are unavailable
- Hidden/not introduced: excluded V1 route families remain absent from navigation.

## Backend / DB Changes

- No backend or DB schema changes were required.
- Health/readiness endpoints, publish path, security controls, and backup/restore runbooks were inventoried in WS11 matrices.

## Performance Smoke

Script: `scripts/ws11-release-smoke.mjs`

Output: `docs/workstream-progress/WS11/performance-smoke-results.json`

Result: PASS for 10 release-critical routes at `http://127.0.0.1:5173`, each below the 8000 ms smoke threshold and with no internal/scaffold wording detected by the smoke script.

## UAT Scenarios Passed / Blocked

- Role-wise runtime evidence console: PASS for screen availability and existing tests.
- Final role-wise UAT signoff: PARTIAL, because acceptance still requires complete workflow proof.
- Security hardening: PARTIAL, because provider secret rotation and mobile device-trust procedures remain environment work.
- Performance smoke: PASS for local browser smoke; production-like IIS/SQL volume test remains required before pilot.
- Backup/restore: PARTIAL, because runbooks exist but a restore rehearsal was not executed in this repo run.
- Accessibility/responsive: PARTIAL, because desktop screenshots were captured but formal device/accessibility tooling was not installed.

## Top Remaining Blockers

- Role-wise UAT remains partial for all roles until workflow acceptance is completed.
- Full irreversible transaction proof remains incomplete across sales, planning, procurement, production, inventory, quality, and dispatch.
- Mobile live execution remains incomplete for device trust, scan validation, media upload, idempotent offline replay, and conflict handling.
- Provider secret rotation and real outbound adapters require production environment configuration.
- Backup/restore rehearsal must be executed against the target SQL Server/IIS environment.
- Performance smoke must be repeated against a production-like IIS host and representative SQL data volume.
- Product owner signoff is required for pilot backlog and V1 exclusions.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 49 test files / 192 tests
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence

Folder: `docs/codex-review-screens/WS11/`

- `release-dashboard-home.png`
- `release-order-delivery-dashboard.png`
- `release-stage-wise-dashboard.png`
- `release-mrp-run-console.png`
- `release-machine-board.png`
- `release-traceability.png`
- `release-report-catalog.png`
- `release-runtime-uat.png`
- `release-provider-health.png`
- `release-audit-trail.png`
- `capture-summary.json`

## Review Pack

Path: `artifacts/review-packs/WS11-review-pack.zip`
