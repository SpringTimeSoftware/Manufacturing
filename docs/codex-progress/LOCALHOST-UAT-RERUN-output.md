# Localhost UAT Rerun Output

Date: 2026-05-08

## Scope Completed

- Reran role-wise UAT probes against the published localhost host at `http://127.0.0.1:5088`.
- Used `docs/uat/role-wise-uat-and-acceptance-matrix.md` as the acceptance source.
- Covered completed web/runtime scope after the LONG-RUN-01 runtime seed and endpoint repair pass.

## UAT Result

Overall result: PARTIAL.

| Status | Count |
| --- | ---: |
| PASS | 0 |
| PARTIAL | 10 |
| FAIL | 0 |
| NOT-IN-SCOPE | 0 |

The rerun had 10 of 10 role logins pass and 55 of 55 representative live API probes pass. Roles remain `PARTIAL` because acceptance requires full workflow execution, write validation, mobile execution proof, audit, and pilot-grade controls.

## Runtime Blockers Fixed

- `SalesCoordinator`, `PurchaseManager`, and `PlantHead` role identities now authenticate.
- `/api/warehouses`, `/api/customers`, `/api/suppliers`, `/api/job-cards`, `/api/machine-board`, and `/api/downtime` now return HTTP `200` in representative probes.
- PlatformAdmin integration and AI provider read endpoints now return HTTP `200`.
- `/api/traceability/lots/DEMO-LOT-001` returns HTTP `200`.
- `/api/reports/pack-lists/95001/print` returns HTTP `200`.

## Files Updated

- `docs/uat/LOCALHOST_ROLE_WISE_UAT_RESULTS.md`
- `docs/codex-progress/LOCALHOST-UAT-RERUN-output.md`

## Remaining Gaps

- Workflow write depth and irreversible transaction validation.
- Mobile live execution, scan/media/offline/idempotency proof.
- Full audit/security hardening, including audit viewer, rate limiting, attachment authorization tests, and provider secret governance.
