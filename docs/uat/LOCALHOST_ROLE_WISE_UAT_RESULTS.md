# Localhost Role-Wise UAT Results

## Scope

This report records a practical role-wise UAT pass against the current localhost deployment at `http://127.0.0.1:5088`. It uses `/docs/uat/role-wise-uat-and-acceptance-matrix.md` as the acceptance source and covers only the completed scope through P149.

This was not a full production UAT pass. No new product features, schema changes, or data reset scripts were applied.

## Method

- Confirmed the published host was running from `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish`.
- Confirmed `/api/health/live` and `/api/health/ready` returned healthy responses.
- Verified live backend login for available bootstrap identities.
- Used authenticated browser route checks from the smoke rerun for completed web surfaces.
- Used direct authenticated API probes for representative role-specific completed-scope endpoints.
- Classified each role against the repo UAT acceptance matrix as `PASS`, `PARTIAL`, `FAIL`, or `NOT-IN-SCOPE`.

## Seeded Role Coverage

| UAT role | Live bootstrap identity available | Verification impact |
| --- | --- | --- |
| SalesCoordinator | No | Role-level live login could not be executed; sales-order and order-delivery APIs were checked through available seeded roles only. |
| PlanningManager | Yes | Role login and planning/engineering APIs were executed. |
| PurchaseManager | No | Role-level live login could not be executed; procurement APIs were checked through available seeded roles only. |
| StoreKeeper | Yes | Role login and inventory/store APIs were executed. |
| ProductionSupervisor | Yes | Role login and production APIs were executed. |
| MachineOperator | Yes | Role login and limited execution API checks were executed; mobile action UAT was not executable through localhost web deployment. |
| QCInspector | Yes | Role login and quality APIs were executed. |
| DispatchManager | Yes | Role login and dispatch APIs were executed. |
| PlantHead | No | Role-level live login could not be executed; dashboard proof was checked through available seeded roles only. |
| PlatformAdmin | Yes | Role login, admin APIs, health, users, roles, and settings APIs were executed. |

## Role-Wise Results

| Role | Result | Evidence | Gap classification |
| --- | --- | --- | --- |
| SalesCoordinator | PARTIAL | `/api/sales-orders` and `/api/dashboards/order-delivery` returned HTTP `200`, but no live SalesCoordinator bootstrap identity exists. | Missing role seed; limited transactional UAT data. |
| PlanningManager | PARTIAL | Login passed. `/api/boms`, `/api/routings`, `/api/engineering-changes`, `/api/mps`, `/api/mrp`, `/api/boq-requirements`, `/api/work-orders`, `/api/dashboards/order-delivery`, and `/api/dashboards/stage-wise` returned HTTP `200`. End-to-end conversion proof remains limited by seed depth. | Data/seed issue. |
| PurchaseManager | PARTIAL | `/api/purchase-requisitions`, `/api/purchase-orders`, `/api/subcontract-orders`, and `/api/supplier-lead-times` returned HTTP `200`, but no live PurchaseManager bootstrap identity exists. | Missing role seed; limited transactional UAT data. |
| StoreKeeper | PARTIAL | Login passed. `/api/inventory`, `/api/inventory/transactions`, `/api/cycle-counts`, `/api/bins`, and `/api/production-receipts` returned HTTP `200`; `/api/warehouses` returned HTTP `500`. | Backend endpoint issue; limited transactional UAT data. |
| ProductionSupervisor | PARTIAL | Login passed. `/api/work-orders`, `/api/production-receipts`, `/api/scrap-rework/scrap`, and `/api/scrap-rework/rework-orders` returned HTTP `200`; `/api/job-cards`, `/api/machine-board`, and `/api/downtime` returned HTTP `500`. | Backend endpoint issue; limited transactional UAT data. |
| MachineOperator | PARTIAL | Login passed and `/api/auth/me` returned HTTP `200`; `/api/job-cards`, `/api/machine-board`, and `/api/downtime` returned HTTP `500`. Mobile start/pause/resume quantity-capture flow was not executable through localhost web deployment. | Backend endpoint issue; mobile deployment not in this localhost web UAT. |
| QCInspector | PARTIAL | Login passed. `/api/quality/plans`, `/api/quality/inspections`, and `/api/quality/ncrs` returned HTTP `200`; `/api/traceability/lots/DEMO-LOT-001` returned HTTP `404`. | Missing traceability proof data. |
| DispatchManager | PARTIAL | Login passed. `/api/dispatch/pack-lists`, `/api/dispatch/shipments`, `/api/dispatch/planning`, and `/api/dashboards/order-delivery` returned HTTP `200`; `/api/reports/pack-lists/1/print` returned HTTP `404`. | Missing dispatch/print proof data. |
| PlantHead | PARTIAL | Stage-wise and order-delivery dashboard APIs returned HTTP `200`, but no live PlantHead bootstrap identity exists. AI daily-summary draft was not posted because this UAT pass avoided write actions. | Missing role seed; AI write proof not executed. |
| PlatformAdmin | PARTIAL | Login passed. `/api/auth/me`, `/api/companies`, `/api/branches`, `/api/users`, `/api/roles`, and `/api/settings/tenant-settings` returned HTTP `200`; `/api/integrations/providers`, `/api/ai/providers`, `/api/ai/provider-health`, and `/api/ai/execution-policy` returned HTTP `403`. | Backend authorization issue for integration/AI provider administration. |

## Pass Counts

Role-level count:

| Status | Count |
| --- | ---: |
| PASS | 0 |
| PARTIAL | 10 |
| FAIL | 0 |
| NOT-IN-SCOPE | 0 |

Supporting verification count:

| Verification type | Pass | Gap |
| --- | ---: | ---: |
| Live bootstrap role login checks | 7 | 3 missing role identities |
| Smoke browser route checks | 13 | 0 |
| Representative live API probes | 47 | 13 |

## Screen And Module Summary

| Module | Result | Notes |
| --- | --- | --- |
| Published host and health | PASS | Host stayed running and ready health remained healthy. |
| Auth/session/context | PARTIAL | Available bootstrap users can log in; SalesCoordinator, PurchaseManager, and PlantHead are missing live role identities. |
| Organization/company/branch | PASS | Company and branch APIs now return HTTP `200`; department API also returns HTTP `200`. |
| Organization/warehouse/bin/shift | PARTIAL | Bin and shift APIs return HTTP `200`; warehouse API returns HTTP `500`. |
| Commercial demand | PARTIAL | Sales-order and order-delivery APIs respond; customer API returns HTTP `500`; UAT proof data remains shallow. |
| Planning and engineering | PARTIAL | Engineering and planning APIs respond; end-to-end recommendation conversion proof remains limited by seed depth. |
| Procurement and outside processing | PARTIAL | PR, PO, subcontract, and supplier lead-time APIs respond; PurchaseManager identity is missing. |
| Inventory and stores | PARTIAL | Storekeeper login and core inventory reads work; warehouse API still fails and transactional proof data is limited. |
| Production execution | PARTIAL | Work orders and production output APIs respond; job-card, machine-board, and downtime APIs fail. |
| Quality | PARTIAL | Quality APIs respond; traceability proof lot is missing. |
| Dispatch and print pack | PARTIAL | Dispatch APIs respond; direct print-pack proof record is missing. |
| Platform admin | PARTIAL | Users, roles, tenant settings, health, company, and branch pass; integration and AI provider APIs return HTTP `403`. |
| Mobile execution | PARTIAL | MachineOperator role exists, but mobile action UAT is outside this localhost web deployment. |

## Demo Scenario Coverage

| Scenario | Result | Reason |
| --- | --- | --- |
| Make-to-order fabricated assembly | PARTIAL | Web proof surfaces open and major APIs respond, but live role seeds and transactional data are not sufficient for a full order-to-dispatch proof. |
| Mixed UOM sheet / weight item | PARTIAL | Measurement and inventory surfaces exist; live inventory/traceability proof rows are limited. |
| Outside-processing flow | PARTIAL | Procurement/subcontract APIs respond, but PurchaseManager identity and full transactional proof are missing. |
| Overdue order from supplier and machine blockage | PARTIAL | Dashboard APIs respond, but downtime API fails and live blocker data is shallow. |

## Major Remaining Gaps

- Missing live bootstrap identities for `SalesCoordinator`, `PurchaseManager`, and `PlantHead`.
- `/api/warehouses`, `/api/customers`, `/api/suppliers`, `/api/job-cards`, `/api/machine-board`, and `/api/downtime` return HTTP `500`.
- Integration and AI provider administration endpoints return HTTP `403` for `platform.admin`.
- Minimum SQL seed is structurally runnable but does not contain enough transactional data to prove sales order, BOQ, WO, job card, QC, dispatch, outside-processing, or overdue-risk flows end-to-end.
- Mobile operator flows cannot be validated from the localhost IIS web deployment.

## Demo Readiness Recommendation

Recommendation: internal-only until the runtime and seed gaps above are closed.

Demo-ready for internal walkthroughs:

- Published localhost host, health, login shell, and web navigation.
- Company, branch, department, user, role, tenant-setting, planning, engineering, production-output, quality, and dispatch read surfaces that return HTTP `200`.
- Reference UI pages for planning, engineering, inventory, production, quality, dispatch, dashboards, and platform admin.

Not ready for customer-facing role-wise UAT:

- Full live role-by-role acceptance with all matrix roles.
- End-to-end make-to-order, mixed-UOM, outside-processing, and overdue-risk proof from SQL data.
- Warehouse, customer, supplier, job-card, machine-board, downtime, integration/AI provider administration, and mobile execution UAT.

## Next Recommended Step

Run a targeted runtime repair and UAT seed-depth wave for the remaining endpoint failures, missing role identities, PlatformAdministration authorization, and transactional proof data; then rerun localhost smoke and role-wise UAT.

