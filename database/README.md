# Database Folder

This folder contains ordered SQL Server packs for STS Manufacturing ERP.

## Structure

- `ddl/00-foundation/`: shared schemas, platform, organization, measurement, production execution, production output, quality, dispatch, integration, and AI tables
- `ddl/10-master-data/`: canonical master-data, resource, routing, BOM, and ECO packs
- `ddl/20-commercial/`: sales, planning, procurement, inventory, pricing, discount, tax, currency, and replenishment packs
- `ddl/30-cost-foundation/`: reserved for cost and landed-cost foundation packs
- `backfill/`: reserved for bridge and cutover backfills
- `seed/`: rerunnable minimum platform, organization, and master-data seeds
- `seeds/`: legacy placeholder retained for compatibility; use `seed/` for ordered runtime-alignment seeds
- `procedures/production/`: preserved production procedure wrappers and follow-on reporting procedures
- `procedures/planning/`: reserved for planning/MRP/BOQ procedures

## Execution Order

1. `ddl/00-foundation/001_create_extension_schemas.sql`
2. `ddl/00-foundation/002_platform_org_measurement_tables.sql`
3. `ddl/00-foundation/003_platform_admin_runtime_tables.sql`
4. `ddl/10-master-data/010_master_resource_engineering_tables.sql`
5. `ddl/10-master-data/020_item_master_v2_extension_tables.sql`
6. `ddl/10-master-data/030_partner_master_v2_extension_tables.sql`
7. `ddl/20-commercial/010_sales_planning_procurement_inventory_tables.sql`
8. `ddl/20-commercial/020_commercial_master_v2_tables.sql`
9. `ddl/00-foundation/009_production_execution_tables.sql`
10. `ddl/00-foundation/010_production_quality_dispatch_tables.sql`
11. `ddl/00-foundation/020_integration_ai_tables.sql`
12. `seed/001_minimum_platform_seed.sql`
13. `seed/002_minimum_org_seed.sql`
14. `seed/003_minimum_masters_seed.sql`
15. future backfill, seed, and procedure packs in numeric order

## Minimum Runnable Foundation

After the ordered packs and seeds above run, the completed backend/runtime scope through `P083` has a SQL-backed foundation for completed backend APIs through `P067` and completed web setup screens through `P083`:

- platform audit/localization/notification outbox;
- platform user, role, permission, notification inbox, approval workbench, workflow, numbering, password recovery request, and tenant setting foundations;
- organization, warehouse, bin, and shift setup;
- measurement/UOM setup;
- item/customer/supplier compatibility records;
- item master media, document, catalog, packaging, physical spec, alias, customer reference, vendor reference, manufacturing policy, planning policy, inventory policy, and quality policy extension tables;
- customer/supplier partner profiles, controlled contact points, item/vendor references, document metadata, and audit-linked partner master extension tables;
- commercial master setup for currencies, exchange-rate setup, tax categories/codes, payment terms, trade terms, price lists, price list lines, price assignments, discount schemes, and discount rules;
- resources, routings, BOM, and ECO;
- sales, planning, procurement, inventory, work orders, job cards, production output, quality, dispatch, integration, and AI draft registry.

Authentication still validates against the bootstrap identity directory, but user/role administration now has a SQL-backed visibility mirror aligned to those bootstrap users. The minimum platform seed includes the deliberate `super.admin` / `SuperAdmin` visibility mirror for controlled full-menu administration and UAT support. Web adapters for screens beyond `P083` remain intentionally demo-backed or blocked until their backend contracts or normal prompt-chain work exist.

## Rules

- Packs are forward-only and idempotent.
- Use additive tables, bridge mappings, and staged cutover rather than destructive replacement.
- SQL Server remains the system of record.
- The design stays multi-company, branch, warehouse, and bin aware.
- Stored procedures remain the preferred path for machine-board and other heavier read models where already established.

See `/docs/database/conventions.md` and `/04-remediation/R011_SQL_Migration_Pack_and_Cutover_Strategy.md` for the governing conventions.
