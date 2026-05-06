# Missing SQL Objects Matrix

## Added In This Wave

| Pack | Objects covered | Previous state | New state |
| --- | --- | --- | --- |
| `database/ddl/00-foundation/001_create_extension_schemas.sql` | `platform`, `org`, `measure`, `master`, `resource`, `engineering`, `sales`, `planning`, `procurement`, `inventory` schemas | Missing from schema bootstrap | `RUNNABLE` schema bootstrap |
| `database/ddl/00-foundation/002_platform_org_measurement_tables.sql` | platform audit/attachment/notification/translation tables, organization tables, measurement/UOM tables | EF-backed but no ordered DDL | `RUNNABLE` |
| `database/ddl/00-foundation/003_platform_admin_runtime_tables.sql` | app users, roles, permissions, role/user mappings, document series, workflow definitions/steps/transitions, tenant settings, password recovery requests, approval work items/decisions, and notification inbox metadata | Audited gap after P078-P081 | `RUNNABLE` read/action foundation |
| `database/ddl/10-master-data/010_master_resource_engineering_tables.sql` | item/customer/supplier compatibility tables, resource/routing tables, BOM/ECO tables | EF-backed but no ordered DDL | `RUNNABLE` backend foundation |
| `database/ddl/20-commercial/010_sales_planning_procurement_inventory_tables.sql` | sales, planning, procurement, stock, lot/serial, cycle count tables | EF-backed but no ordered DDL | `RUNNABLE` backend foundation |
| `database/ddl/00-foundation/009_production_execution_tables.sql` | work orders, work-order operations, job cards, job-card events, downtime | EF-backed but no ordered DDL | `RUNNABLE` backend foundation |

## Already Present Before This Wave

| Pack | Objects covered | State |
| --- | --- | --- |
| `database/ddl/00-foundation/010_production_quality_dispatch_tables.sql` | production receipts, receipt lines, scrap entries, rework orders, quality plans/records/results/NCRs, pack lists, shipment tables | Preserved and ordered after base production execution tables |
| `database/ddl/00-foundation/020_integration_ai_tables.sql` | integration providers/connections/webhooks/import/export and AI provider/model/template/run tables | Preserved |

## Still Missing Or Deferred

| Area | Missing object class | Reason |
| --- | --- | --- |
| Costing and landed cost finalization | valuation/cost layers and landed-cost documents | Guardrails block new landed cost or costing-finalization logic in this wave. |
| Heavy reporting procedures | dedicated dashboard/report stored procedures beyond preserved machine-board procedure path | EF dashboard reads are already completed; procedure optimization remains future work. |

## Non-Destructive Principle Applied

- Existing DDL packs were preserved.
- New SQL objects are additive and idempotent.
- No table is dropped, renamed, or destructively reset.
- Foreign keys are intentionally not forced in this alignment wave because the EF model did not define relational constraints and because the cutover objective is runnable foundation, not destructive referential cleanup.
