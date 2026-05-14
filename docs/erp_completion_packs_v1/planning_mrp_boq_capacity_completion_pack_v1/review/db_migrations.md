# Database Changes

Additive DDL:

- `database/ddl/20-commercial/050_planning_mrp_boq_capacity_completion_tables.sql`

Tables:

- `planning.PlanningPlans`
- `planning.PlanningSnapshots`
- `planning.PlannedOrders`
- `planning.ShortageActions`

The DDL is forward-only and idempotent. It does not reset or destructively alter existing planning, MPS, MRP, BOQ, procurement, work-order, or production tables.

`database/README.md` was updated to include the new ordered DDL file after the existing commercial/procurement packs.
