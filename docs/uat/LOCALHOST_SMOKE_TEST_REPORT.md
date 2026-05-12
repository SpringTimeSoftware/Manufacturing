# Localhost Smoke Test Report

Date: 2026-05-08

## Scope

This report records the LONG-RUN-01 localhost smoke rerun after the final audit and runtime UAT seed repair pass. It verifies the IIS publish-folder deployment model at `http://127.0.0.1:5088`; it is not a full production UAT signoff.

## Environment

| Item | Value |
| --- | --- |
| Host URL | `http://127.0.0.1:5088` |
| Publish folder | `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish` |
| Host executable | `STS.Mfg.Host.exe` |
| Database target | LocalDB `STS_Mfg_Bootstrap` |
| SQL apply order | `database/README.md` execution order through `seed/005_uat_runtime_seed.sql` |
| Login used | Seeded `platform.admin` context for company `1`, branch `11` |

## Smoke Checklist

| Checkpoint | Result | Evidence |
| --- | --- | --- |
| Application opens on localhost | PASS | Root page returned HTTP `200` from the published host. |
| Login page loads | PASS | `/login` returned HTTP `200`. |
| Login works | PASS | Seeded `platform.admin` login succeeded and `/api/auth/me` returned HTTP `200`. |
| Home/dashboard shell loads | PASS | `/` returned HTTP `200`. |
| `/api/health/live` | PASS | Returned `Healthy` with HTTP `200`. |
| `/api/health/ready` | PASS | Returned `Healthy` with HTTP `200`, including SQL Server and attachment storage checks. |
| Company page and `/api/companies` | PASS | Route and API returned HTTP `200`. |
| Branch page and `/api/branches` | PASS | Route and API returned HTTP `200`. |
| Department page and `/api/departments` | PASS | Route and API returned HTTP `200`. |
| Customer and supplier load | PASS | `/api/customers` and `/api/suppliers` returned HTTP `200`. |
| Commercial setup screen loads | PASS | `/commercial/price-lists` returned HTTP `200`. |
| Engineering/planning screen works | PASS | `/engineering/boms`, `/planning/mrp`, `/api/boms`, `/api/mrp`, and `/api/boq-requirements` returned HTTP `200`. |
| Production/execution screen works | PASS | `/production/job-cards`, `/api/work-orders`, `/api/job-cards`, and `/api/downtime` returned HTTP `200`. |
| Dispatch print proof works | PASS | `/api/reports/pack-lists/95001/print` returned HTTP `200`. |
| Fatal startup/runtime exception check | PASS | Published host stayed running; stdout showed application started and no blocking startup exception. |

## Direct API Results

| Endpoint | Result |
| --- | --- |
| `/api/health/live` | HTTP `200` |
| `/api/health/ready` | HTTP `200` |
| `/api/auth/login` | HTTP `200` |
| `/api/auth/me` | HTTP `200` |
| `/api/companies` | HTTP `200` |
| `/api/branches` | HTTP `200` |
| `/api/departments` | HTTP `200` |
| `/api/customers` | HTTP `200` |
| `/api/suppliers` | HTTP `200` |
| `/api/warehouses` | HTTP `200` |
| `/api/settings/tenant-settings` | HTTP `200` |
| `/api/boms` | HTTP `200` |
| `/api/mrp` | HTTP `200` |
| `/api/boq-requirements` | HTTP `200` |
| `/api/machine-board?dateFrom=2026-05-07T00:00:00&dateTo=2026-05-14T00:00:00` | HTTP `200` |
| `/api/work-orders` | HTTP `200` |
| `/api/job-cards` | HTTP `200` |
| `/api/downtime` | HTTP `200` |
| `/api/dispatch/pack-lists` | HTTP `200` |
| `/api/reports/pack-lists/95001/print` | HTTP `200` |

## Browser Route Results

| Route | Expected surface | Result |
| --- | --- | --- |
| `/` | Home | PASS |
| `/login` | Login | PASS |
| `/organization/companies` | Company Master | PASS |
| `/organization/branches` | Branch Master | PASS |
| `/organization/departments` | Department Master | PASS |
| `/partners/customers` | Customer List | PASS |
| `/partners/suppliers` | Supplier List | PASS |
| `/commercial/price-lists` | Price List Setup | PASS |
| `/engineering/boms` | BOM Library | PASS |
| `/planning/mrp` | MRP Run Console | PASS |
| `/production/job-cards` | Job Cards | PASS |

## Current Smoke Status

Smoke result: PASS for the LONG-RUN-01 localhost smoke checklist.

Remaining non-smoke gaps are workflow depth, mobile live execution, irreversible transaction proof, and pilot-grade controls. Those are tracked in `docs/uat/LOCALHOST_ROLE_WISE_UAT_RESULTS.md` and `docs/final-audit/*`.

## WS01 Rerun Addendum - 2026-05-12

WS01 added the `/platform/runtime-uat` evidence console and automated runtime probes for health, readiness, authenticated context, notification and approval data truth, role-aware representative APIs, traceability seed proof, and dispatch print proof.

The smoke checklist remains PASS at the runtime/read level. The console does not convert partial workflow acceptance into full UAT acceptance; it gives customer-facing, exportable evidence and explicit failure states when live data is unavailable.
