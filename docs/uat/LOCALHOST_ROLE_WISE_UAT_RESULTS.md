# Localhost Role-Wise UAT Results

Date: 2026-05-08

## Scope

This report records the LONG-RUN-01 role-wise UAT rerun against the published localhost host at `http://127.0.0.1:5088`. It uses `docs/uat/role-wise-uat-and-acceptance-matrix.md` as the acceptance source and covers completed web/runtime scope only.

This is not a full production UAT signoff. It confirms that the previous runtime blockers no longer block role probing, while keeping acceptance honest where workflow depth, mobile live execution, irreversible transaction posting, audit, and pilot controls remain incomplete.

## Method

- Confirmed the published host was running from `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish`.
- Confirmed `/api/health/live` and `/api/health/ready` returned HTTP `200`.
- Verified live backend login for every UAT role identity listed below.
- Used authenticated direct API probes for representative role-specific completed-scope endpoints.
- Classified each role as `PASS`, `PARTIAL`, `FAIL`, or `NOT-IN-SCOPE`.

## Seeded Role Coverage

| UAT role | Live bootstrap identity available | Verification impact |
| --- | --- | --- |
| SalesCoordinator | Yes | Login passed; sales-order, customer, and order-delivery APIs returned HTTP `200`. |
| PlanningManager | Yes | Login passed; engineering/planning APIs returned HTTP `200`. |
| PurchaseManager | Yes | Login passed; procurement APIs returned HTTP `200`. |
| StoreKeeper | Yes | Login passed; inventory, warehouse, traceability, bin, cycle-count, and receipt APIs returned HTTP `200`. |
| ProductionSupervisor | Yes | Login passed; work-order, job-card, downtime, machine-board, receipt, scrap, and rework APIs returned HTTP `200`. |
| MachineOperator | Yes | Login passed; job-card and downtime APIs returned HTTP `200`. |
| QCInspector | Yes | Login passed; quality and traceability APIs returned HTTP `200`. |
| DispatchManager | Yes | Login passed; dispatch, dashboard, shipment, and pack-list print APIs returned HTTP `200`. |
| PlantHead | Yes | Login passed; stage-wise and order-delivery dashboards returned HTTP `200`. |
| PlatformAdmin | Yes | Login passed; admin, integration, and AI provider read APIs returned HTTP `200`. |

## Role-Wise Results

| Role | Result | Evidence | Remaining gap classification |
| --- | --- | --- | --- |
| SalesCoordinator | PARTIAL | Login passed. `/api/sales-orders`, `/api/customers`, and `/api/dashboards/order-delivery` returned HTTP `200`. | Sales order create/review, pricing/credit linkage, and downstream demand conversion are not fully UAT-proven. |
| PlanningManager | PARTIAL | Login passed. `/api/boms`, `/api/routings`, `/api/engineering-changes`, `/api/mps`, `/api/mrp`, `/api/boq-requirements`, and machine board returned HTTP `200`. | MRP versioning, exception ownership, BOQ conversion, capacity reschedule, and approval/audit depth remain incomplete. |
| PurchaseManager | PARTIAL | Login passed. `/api/purchase-requisitions`, `/api/purchase-orders`, `/api/subcontract-orders`, and `/api/supplier-lead-times` returned HTTP `200`. | PR/PO approval, outside-processing execution, supplier commitment, and commercial enforcement are not fully UAT-proven. |
| StoreKeeper | PARTIAL | Login passed. `/api/warehouses`, `/api/inventory/balances`, `/api/traceability/lots/DEMO-LOT-001`, `/api/bins`, `/api/cycle-counts`, and `/api/production-receipts` returned HTTP `200`. | Ledger reconciliation, reservation, lot/serial/catch-weight, transfer/putaway, and mobile scan validation remain incomplete. |
| ProductionSupervisor | PARTIAL | Login passed. `/api/work-orders`, `/api/job-cards`, `/api/downtime`, machine board, receipts, scrap, and rework APIs returned HTTP `200`. | Work-order release, job-card state transitions, quantity reconciliation, downtime escalation, and output posting are not fully UAT-proven. |
| MachineOperator | PARTIAL | Login passed. `/api/auth/me`, `/api/job-cards`, and `/api/downtime` returned HTTP `200`. | Mobile start/pause/resume, scan validation, offline replay, and duplicate-post protection are not executable in this localhost web UAT. |
| QCInspector | PARTIAL | Login passed. `/api/quality/plans`, `/api/quality/inspections`, `/api/quality/ncrs`, and `/api/traceability/lots/DEMO-LOT-001` returned HTTP `200`. | QC parameter capture, hold/release, NCR disposition/root cause, evidence, and rework/scrap linkage remain incomplete. |
| DispatchManager | PARTIAL | Login passed. `/api/dispatch/pack-lists`, `/api/dispatch/shipments`, `/api/dispatch/planning`, `/api/reports/pack-lists/95001/print`, and `/api/dashboards/order-delivery` returned HTTP `200`. | Pack hierarchy, labels, loading/delivery proof, held-stock blocking, customer proof, and document templates remain incomplete. |
| PlantHead | PARTIAL | Login passed. `/api/dashboards/stage-wise` and `/api/dashboards/order-delivery` returned HTTP `200`. | Executive summaries, AI daily summary review, escalation actions, and real KPI drilldown remain incomplete. |
| PlatformAdmin | PARTIAL | Login passed. `/api/auth/me`, org APIs, users, roles, tenant settings, integration providers, AI providers, AI provider health, and AI execution policy returned HTTP `200`. Wave 2 adds scoped audit viewer coverage, baseline API rate limiting, masked provider references, and attachment visibility tests. | Provider secret rotation, device trust procedures, and full user/role/admin lifecycle proof remain incomplete. |

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
| Live bootstrap role login checks | 10 | 0 |
| Published smoke route checks | 11 | 0 |
| Representative live API probes | 55 | 0 |

## Screen And Module Summary

| Module | Result | Notes |
| --- | --- | --- |
| Published host and health | PASS | Host stayed running from `artifacts\iis-publish`; live and ready health returned HTTP `200`. |
| Auth/session/context | PARTIAL | All UAT role identities now log in; stale-session, MFA/device trust, and mobile device binding remain incomplete. |
| Organization/company/branch/warehouse | PARTIAL | Company, branch, department, warehouse, bin, and shift reads pass; policy and lifecycle depth remain incomplete. |
| Commercial demand | PARTIAL | Sales-order, customer, and order-delivery reads pass; transactional demand/pricing/credit proof remains incomplete. |
| Planning and engineering | PARTIAL | Engineering, planning, BOQ, MRP, and machine-board reads pass; conversion and approval depth remain incomplete. |
| Procurement and outside processing | PARTIAL | PR, PO, subcontract, and supplier lead-time reads pass; outside-processing transaction proof remains incomplete. |
| Inventory and stores | PARTIAL | Warehouse, balances, traceability, bin, cycle-count, and receipt reads pass; ledger and scan validation depth remain incomplete. |
| Production execution | PARTIAL | Work orders, job cards, downtime, machine board, receipts, scrap, and rework reads pass; transition/posting proof remains incomplete. |
| Quality | PARTIAL | Quality and traceability proof reads pass; hold/release and NCR lifecycle remain incomplete. |
| Dispatch and print pack | PARTIAL | Dispatch and print proof reads pass; proof, labels, templates, and held-stock blocking remain incomplete. |
| Platform admin | PARTIAL | Users, roles, tenant settings, integration, AI provider reads, audit viewer, baseline rate limiting, and attachment visibility tests now pass at the implementation level; full lifecycle proof remains incomplete. |
| Mobile execution | PARTIAL | Role identity and supporting APIs pass; mobile live execution is not UAT-proven in the localhost web deployment. |

## Demo Scenario Coverage

| Scenario | Result | Reason |
| --- | --- | --- |
| Make-to-order fabricated assembly | PARTIAL | Seeded demand, planning, work-order, job-card, traceability, QC, and dispatch proof reads now exist, but full write lifecycle is incomplete. |
| Mixed UOM sheet / weight item | PARTIAL | Measurement and inventory surfaces exist; item tracking, catch-weight, and posting validation remain incomplete. |
| Outside-processing flow | PARTIAL | Purchase/subcontract APIs respond under `PurchaseManager`; full supplier commitment, issue/receipt, and QC loop remain incomplete. |
| Overdue order from supplier and machine blockage | PARTIAL | Dashboards, supplier lead times, machine board, and downtime reads respond; escalation and reschedule actions remain incomplete. |

## Blockers Fixed In LONG-RUN-01

- Added live bootstrap identities for `SalesCoordinator`, `PurchaseManager`, and `PlantHead`.
- Repaired `/api/warehouses`, `/api/customers`, `/api/suppliers`, `/api/job-cards`, `/api/machine-board`, and `/api/downtime` runtime failures.
- Repaired PlatformAdmin provider-read access for integration and AI provider endpoints.
- Added `DEMO-LOT-001` traceability proof data.
- Added seeded pack-list print proof at `/api/reports/pack-lists/95001/print`.

## Remaining Major Gaps

- Full role-wise UAT still has 10 `PARTIAL` roles because acceptance criteria require workflow completion, not only route/API availability.
- Transactional write flows are not end-to-end UAT-proven for sales demand, MRP/BOQ conversion, PR/PO/subcontract, work-order release, job-card execution, inventory movement, QC hold/release, NCR, dispatch proof, and print/template governance.
- Mobile execution is not live UAT-proven for device trust, scan validation, media upload, offline replay, idempotency, and conflict handling.
- Provider secret rotation, device trust, and pilot-grade admin lifecycle controls remain incomplete.

## Readiness Recommendation

Recommendation: controlled web demo-ready, not role-wise UAT-ready or pilot-ready.

The product is no longer blocked by the highest-value runtime read failures from the previous UAT report. It still needs workflow-depth waves before any role can receive full UAT acceptance.
