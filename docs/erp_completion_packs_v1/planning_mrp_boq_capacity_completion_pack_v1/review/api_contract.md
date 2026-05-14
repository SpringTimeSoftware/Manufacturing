# Planning API Contract Added

## Endpoints

- `GET /api/planning/plans`
- `GET /api/planning/plans/{id}`
- `POST /api/planning/plans`
- `PUT /api/planning/plans/{id}`
- `GET /api/planning/snapshots`
- `POST /api/planning/snapshots`
- `GET /api/planning/planned-orders`
- `GET /api/planning/planned-orders/{id}`
- `POST /api/planning/planned-orders`
- `PUT /api/planning/planned-orders/{id}`
- `POST /api/planning/planned-orders/{id}/firm`
- `POST /api/planning/planned-orders/{id}/convert/purchase-requisition`
- `POST /api/planning/planned-orders/{id}/convert/work-order`
- `GET /api/planning/shortage-actions`
- `POST /api/planning/shortage-actions`
- `PUT /api/planning/shortage-actions/{id}`

## Contracts

- `PlanningPlanDto`
- `PlanningPlanUpsertRequest`
- `PlanningSnapshotDto`
- `PlanningSnapshotCreateRequest`
- `PlannedOrderDto`
- `PlannedOrderUpsertRequest`
- `PlannedOrderConversionResultDto`
- `ShortageActionDto`
- `ShortageActionUpsertRequest`

## Conversion Rules

- Purchase planned orders convert to a real purchase requisition and requisition line.
- Work planned orders convert to a real work order only when a released BOM revision is linked.
- Already converted planned orders are blocked.
- Transfer planned-order conversion is intentionally disabled in UI until transfer-order posting support exists.
