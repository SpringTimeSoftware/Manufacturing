# LONG-RUN-01 Output

Date: 2026-05-08
Branch: `main`

## Phases Completed

| Phase | Result |
| --- | --- |
| Phase A - FINAL-AUDIT-02 | COMPLETE |
| Phase B - Runtime UAT and seed repair | COMPLETE |
| Phase C - Validation | COMPLETE |
| Phase D - Localhost smoke rerun | COMPLETE |
| Phase E - Role-wise UAT rerun | COMPLETE |
| Phase F - Screenshot evidence | COMPLETE |
| Phase G - Final review pack | COMPLETE |

## Merge-State Gate

- Verified `main` contains `origin/lane/eng-plan` and `origin/lane/prod-exec`.
- Verified lane output files and screenshot folders are present on `main`.

## Blockers Fixed

- Added live UAT bootstrap identities for `SalesCoordinator`, `PurchaseManager`, and `PlantHead`.
- Added SQL mirror seed permissions and role mappings for the new UAT roles.
- Repaired warehouse scope query translation for `/api/warehouses`.
- Repaired customer/supplier organization scope queries for `/api/customers` and `/api/suppliers`.
- Repaired job-card and downtime list projections for `/api/job-cards` and `/api/downtime`.
- Added `production.sp_Machine_Board` for `/api/machine-board`.
- Added guarded UAT runtime seed data for MPS/MRP/BOQ, work order, job card, downtime, lot traceability, stock, dispatch, shipment, and pack-list print proof.
- Fixed seed SQL keyword collisions in the master seed.

## Runtime Evidence

- 10 of 10 UAT role logins passed.
- 55 of 55 role-wise API probes returned HTTP `200`.
- Published localhost smoke passed from `artifacts\iis-publish`.
- Health live and ready endpoints returned HTTP `200`.

## Smoke Summary

Published localhost smoke: PASS.

- App starts from `artifacts\iis-publish`.
- Login works.
- Home/dashboard, company, branch, department, customer, supplier, commercial setup, engineering/planning, production/execution, and dispatch print proof routes responded successfully.

## UAT Summary

Role-wise UAT rerun: PARTIAL.

- PASS: 0 roles
- PARTIAL: 10 roles
- FAIL: 0 roles
- NOT-IN-SCOPE: 0 roles
- Supporting probes: 10 of 10 role logins and 55 of 55 representative APIs passed.

## Validation Results

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS - 34 test files, 136 tests |
| `npm run build` | PASS - non-blocking Vite chunk-size warning |
| `npm run build:host` | PASS |
| `dotnet build src/server/STS.Mfg.sln` | PASS |
| `dotnet test src/server/STS.Mfg.sln --no-build` | PASS - 12 tests |
| `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` | PASS |
| `deploy/iis/publish-iis.ps1 -Configuration Release` | PASS |

## Screenshot Evidence

Screenshot folder: `docs/codex-review-screens/LONG-RUN-01/`

Files:

- `01-login.png`
- `02-home-dashboard.png`
- `03-company-master.png`
- `04-branch-master.png`
- `05-department-master.png`
- `06-warehouse-master.png`
- `07-customer-list.png`
- `08-supplier-list.png`
- `09-commercial-price-lists.png`
- `10-bom-library.png`
- `11-mrp-run-console.png`
- `12-machine-board.png`
- `13-job-cards.png`
- `14-downtime-register.png`
- `15-traceability.png`
- `16-dispatch-pack-lists.png`

## Files Changed

- `database/README.md`
- `database/procedures/production/001_machine_board.sql`
- `database/seed/001_minimum_platform_seed.sql`
- `database/seed/003_minimum_masters_seed.sql`
- `database/seed/005_uat_runtime_seed.sql`
- `docs/codex-progress/FINAL-AUDIT-02-output.md`
- `docs/codex-progress/LOCALHOST-SMOKE-RERUN-output.md`
- `docs/codex-progress/LOCALHOST-UAT-RERUN-output.md`
- `docs/codex-progress/LONG-RUN-01-output.md`
- `docs/codex-review-screens/LONG-RUN-01/*`
- `docs/final-audit/*`
- `docs/uat/LOCALHOST_ROLE_WISE_UAT_RESULTS.md`
- `docs/uat/LOCALHOST_SMOKE_TEST_REPORT.md`
- `src/server/STS.Mfg.Infrastructure/Organization/OrganizationService.cs`
- `src/server/STS.Mfg.Infrastructure/Platform/Security/BootstrapIdentityDirectory.cs`
- `src/server/STS.Mfg.Infrastructure/Production/JobCardService.cs`
- `src/server/STS.Mfg.Infrastructure/Resources/ResourceService.cs`
- `artifacts/review-packs/LONG-RUN-01-review-pack.zip`

## Final Readiness Judgment

Controlled web demo-ready. Not UAT-ready or pilot-ready.

The highest-value runtime blockers are fixed and the published localhost smoke is clean. Remaining gaps are workflow write depth, mobile live execution, irreversible transaction proof, audit/security hardening, integration/AI operations, and pilot-grade UAT signoff.

## Review Pack

`artifacts/review-packs/LONG-RUN-01-review-pack.zip`
