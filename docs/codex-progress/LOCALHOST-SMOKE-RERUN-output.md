# Localhost Smoke Rerun Output

Date: 2026-05-08

## Scope Completed

- Reran the LONG-RUN-01 localhost smoke test against the IIS publish-folder host.
- Used LocalDB `STS_Mfg_Bootstrap` after applying the documented SQL order through `seed/005_uat_runtime_seed.sql`.
- Kept the run bounded to smoke verification and runtime/UAT repair evidence.

## Smoke Result

Overall result: PASS for the requested smoke checklist.

| Area | Result |
| --- | --- |
| Published localhost root page | PASS |
| Login page | PASS |
| Seeded login | PASS |
| Home/dashboard shell | PASS |
| Health live/ready | PASS |
| Company/branch/department | PASS |
| Customer/supplier | PASS |
| Commercial setup screen | PASS |
| Engineering/planning representative screen | PASS |
| Production/execution representative screen | PASS |
| Dispatch print proof | PASS |

## Key Evidence

- `/api/health/live` and `/api/health/ready` returned HTTP `200`.
- Root, `/login`, organization, partner, commercial, engineering, planning, and production routes returned HTTP `200`.
- `/api/customers`, `/api/suppliers`, `/api/warehouses`, `/api/boms`, `/api/mrp`, `/api/boq-requirements`, `/api/work-orders`, `/api/job-cards`, `/api/downtime`, and `/api/reports/pack-lists/95001/print` returned HTTP `200`.

## Files Updated

- `docs/uat/LOCALHOST_SMOKE_TEST_REPORT.md`
- `docs/codex-progress/LOCALHOST-SMOKE-RERUN-output.md`

## Remaining Non-Smoke Gaps

- Role-wise UAT remains PARTIAL overall because lifecycle writes, mobile live execution, irreversible transaction validation, and pilot controls are not complete.
