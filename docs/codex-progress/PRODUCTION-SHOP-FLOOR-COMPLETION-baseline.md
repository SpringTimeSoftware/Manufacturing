# Production Shop Floor Completion Baseline

Run: `PRODUCTION-SHOP-FLOOR-COMPLETION-01`

Pack: `docs/erp_completion_packs_v1/production_shop_floor_completion_pack_v1/`

## Current Mapping

- Workbook `Current_Mapping` was populated before implementation with observed production UI, API, and DB paths.
- Workbook `Gap_Template` was updated with observed gaps for work-order headers, operation lines, component issue/backflush, machine board, operator terminal, traceability, scrap/rework, traveler truth, deep-link handoffs, and live-data truth.
- Scan logs are under `artifacts/scan-logs/PRODUCTION-SHOP-FLOOR-COMPLETION-01/`.

## Screens In Scope

- `/production/work-orders`
- `/production/job-cards`
- `/production/machine-board`
- `/production/occupancy`
- `/production/shift-production`
- `/production/downtime`
- `/production/receipts`
- `/production/scrap-by-products`
- `/production/rework-orders`
- `/production/machine-status`
- `/inventory/material-issue`
- `/inventory/material-return`
- `/inventory/traceability`

## Baseline Counts

- Production/shop-floor routes mapped: 13
- Backend controller/service families mapped: 5
- Production DB table groups mapped: 8
- First-line transaction anti-patterns in production scoped source: 0
- P0 action/deep-link gaps observed: 3
- P0 source handoff gaps observed: 2
- P0 evidence gaps observed: 10

## Main Observed Gaps Before Implementation

- Work-order material issue and receipt actions open related screens but do not consistently pass exact source document id/type into the target workspace.
- Work-order traveler print action is visible from detail as a generic route, not a real traveler/print-log workflow.
- Material issue/return source links use ambiguous query context.
- Receipt draft page does not prefill work-order/job-card context from query parameters.
- Workbook evidence, screenshot gates, validation logs, and review pack are not yet populated for this pack.

## Existing Implemented Foundations

- Work-order create/save/reopen, release readiness, release, re-release, cancel, and close APIs exist.
- Work-order operations are generated from routing/BOM operations and saved as multi-operation rows.
- Job-card generation from work-order operations exists.
- Job-card start, pause, resume, quantity, complete, downtime, and event history APIs exist.
- Machine board uses a live read model and throws unavailable state rather than silently falling back in live mode.
- Production receipt, scrap, and rework posting APIs exist and write inventory/audit effects.
- Inventory material issue and return support multi-line posting grids.
