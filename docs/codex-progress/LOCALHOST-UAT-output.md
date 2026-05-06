# Localhost UAT Output

## Scope Completed

- Executed a practical role-wise localhost UAT pass against `http://127.0.0.1:5088`.
- Used `/docs/uat/role-wise-uat-and-acceptance-matrix.md` as the acceptance source.
- Covered only completed scope through P149.
- Did not execute any P-series prompt and did not add new product features.

## Role-Wise Summary

| Role | Result |
| --- | --- |
| SalesCoordinator | PARTIAL |
| PlanningManager | PARTIAL |
| PurchaseManager | PARTIAL |
| StoreKeeper | PARTIAL |
| ProductionSupervisor | PARTIAL |
| MachineOperator | PARTIAL |
| QCInspector | PARTIAL |
| DispatchManager | PARTIAL |
| PlantHead | PARTIAL |
| PlatformAdmin | PARTIAL |

## Counts

| Status | Count |
| --- | ---: |
| PASS | 0 |
| PARTIAL | 10 |
| FAIL | 0 |
| NOT-IN-SCOPE | 0 |

## Confirmed Working

- Localhost host and health endpoints.
- Seeded login for `platform.admin`, `company.admin`, `planning.manager`, `stores.keeper`, `prod.supervisor`, `machine.operator`, `qc.inspector`, and `dispatch.manager`.
- Company and branch APIs after the corrective fix.
- Department, bin, shift, UOM, item, sales order, procurement, engineering, planning, work-order, production-output, quality, dispatch, user, role, and tenant-setting read probes where they returned HTTP `200`.
- Browser smoke routes for company, branch, department, notifications, approvals, admin/settings, BOQ requirements, and work orders.

## Critical Remaining Blockers

- Missing seeded role identities for `SalesCoordinator`, `PurchaseManager`, and `PlantHead`.
- HTTP `500` remains on `/api/warehouses`, `/api/customers`, `/api/suppliers`, `/api/job-cards`, `/api/machine-board`, and `/api/downtime`.
- HTTP `403` remains on integration and AI provider administration endpoints for `platform.admin`.
- Transactional UAT seed depth is not sufficient for full end-to-end role acceptance.
- Mobile operator flows were not executable through the localhost web deployment.

## Files Updated

- `/docs/uat/LOCALHOST_ROLE_WISE_UAT_RESULTS.md`
- `/docs/codex-progress/LOCALHOST-UAT-output.md`

## Recommendation

Do not resume feature expansion yet. Run a targeted runtime repair and UAT seed-depth wave for the remaining endpoint failures, missing UAT identities, integration/AI authorization, and end-to-end transactional proof data.

