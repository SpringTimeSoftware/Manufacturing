# Database Folder

This folder contains ordered SQL Server packs for STS Manufacturing ERP.

## Structure

- `ddl/00-foundation/`: shared schemas, platform, organization, measurement, production execution, production output, quality, dispatch, integration, and AI tables
- `ddl/10-master-data/`: canonical master-data, resource, routing, BOM, and ECO packs
- `ddl/20-commercial/`: sales, planning, procurement, GRN/supplier-invoice/AP bridge, inventory, pricing, discount, tax, currency, and replenishment packs
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
4. `ddl/00-foundation/004_platform_extensibility_tables.sql`
5. `ddl/10-master-data/010_master_resource_engineering_tables.sql`
6. `ddl/10-master-data/020_item_master_v2_extension_tables.sql`
7. `ddl/10-master-data/030_partner_master_v2_extension_tables.sql`
8. `ddl/10-master-data/040_item_attribute_value_set_tables.sql`
9. `ddl/20-commercial/010_sales_planning_procurement_inventory_tables.sql`
10. `ddl/20-commercial/020_commercial_master_v2_tables.sql`
11. `ddl/20-commercial/040_procure_to_pay_sourcing_tables.sql`
12. `ddl/20-commercial/050_planning_mrp_boq_capacity_completion_tables.sql`
13. `ddl/20-commercial/060_sales_commercial_contract_hardening.sql`
14. `ddl/20-commercial/070_customer_commercial_assignment_sales_owner.sql`
15. `ddl/20-commercial/080_inventory_tracking_policy_snapshot_hardening.sql`
16. `ddl/00-foundation/009_production_execution_tables.sql`
17. `ddl/00-foundation/010_production_quality_dispatch_tables.sql`
18. `ddl/20-commercial/090_quality_ncr_coa_completion.sql`
19. `ddl/20-commercial/100_dispatch_logistics_pod_completion.sql`
20. `ddl/20-commercial/110_finance_gl_ap_ar_costing_completion.sql`
21. `ddl/20-commercial/130_reports_dashboard_builder_completion.sql`
22. `ddl/00-foundation/020_integration_ai_tables.sql`
23. `ddl/20-commercial/140_integrations_email_whatsapp_crm_ai_completion.sql`
24. `procedures/production/001_machine_board.sql`
25. `seed/001_minimum_platform_seed.sql`
26. `seed/002_minimum_org_seed.sql`
27. `seed/003_minimum_masters_seed.sql`
28. `seed/005_uat_runtime_seed.sql`
29. future backfill, seed, and procedure packs in numeric order

## Minimum Runnable Foundation

After the ordered packs and seeds above run, the completed backend/runtime scope through `P083` has a SQL-backed foundation for completed backend APIs through `P067` and completed web setup screens through `P083`:

- platform audit/localization/notification outbox;
- platform user, role, permission, notification inbox, approval workbench, workflow, numbering, password recovery request, and tenant setting foundations;
- platform extensibility UDF definitions and values with audit-ready company scoping;
- organization, warehouse, bin, and shift setup;
- measurement/UOM setup;
- item/customer/supplier compatibility records and item attribute value-set maintenance;
- item master media, document, catalog, packaging, physical spec, alias, customer reference, vendor reference, manufacturing policy, planning policy, inventory policy, and quality policy extension tables;
- customer/supplier partner profiles, controlled contact points, item/vendor references, document metadata, and audit-linked partner master extension tables;
- commercial master setup for currencies, exchange-rate setup, tax categories/codes, payment terms, trade terms, price lists, price list lines, price assignments, discount schemes, and discount rules;
- customer commercial assignment foundation for governed sales owner, sales team, territory, price-list, discount, payment-term, tax, currency, and trade-term defaults without backfilling fake values into existing customers;
- shared inventory tracking hardening for item/warehouse bin, lot/batch, serial, and PCID/license-plate policy enforcement, append-oriented movement snapshots, and nullable source/revision snapshot columns without inventing historical tracking values;
- quality/NCR/COA completion tables for QC plan characteristics, NCR affected lines, disposition release metadata, CAPA fields, and versioned COA certificate/evidence snapshots without inventing historical inspection or disposition data;
- Pack 06 finance foundation for governed chart of accounts, fiscal periods, posting profiles, GL journals, AR invoices/subledger, tax ledger, inventory valuation entries, and mapped AP postings without assigning fake accounting data to existing operational documents;
- Pack 07 reporting foundation for governed report definitions, durable report runs, generated-output metadata/download audit, persisted dashboards, and dashboard widgets over accepted sales, procurement, inventory, quality, dispatch, production, and finance datasets;
- Pack 08 integration foundation for governed provider registry metadata, credential references without raw secret storage, durable outbound message/delivery ledgers, webhook event records, CRM external-id mapping/sync conflict records, and AI draft review metadata;
- resources, routings, BOM, and ECO;
- sales, quote/SO commercial snapshots, quote release/reopen/quote-to-SO conversion, planning, MPS/MRP/BOQ plans, snapshots, planned orders, shortage actions, procurement, RFQ/supplier quotation/quote-comparison sourcing, subcontract receive-back receipts, GRN, supplier invoice matching, AP liability/accounting posting bridge, inventory, work orders, job cards, production output, quality, dispatch, integration, and AI draft registry;
- machine-board stored procedure coverage for the production occupancy read model;
- UAT runtime seed proof for SalesCoordinator, PurchaseManager, PlantHead, MPS/MRP/BOQ, work order/job card/downtime, lot traceability, and dispatch pack-list/print flows.

Authentication still validates against the bootstrap identity directory, but user/role administration now has a SQL-backed visibility mirror aligned to those bootstrap users. The minimum platform seed includes the deliberate `super.admin` / `SuperAdmin` visibility mirror for controlled full-menu administration and UAT support, plus live UAT role identities for SalesCoordinator, PurchaseManager, and PlantHead. Web adapters for screens beyond `P083` remain intentionally demo-backed or blocked until their backend contracts or normal prompt-chain work exist.

WS01 Runtime/UAT/Seed Truth did not require destructive database changes. It reuses the ordered apply path through `seed/005_uat_runtime_seed.sql` and exposes runtime seed proof through `/platform/runtime-uat`.

## Rules

- Packs are forward-only and idempotent.
- Use additive tables, bridge mappings, and staged cutover rather than destructive replacement.
- SQL Server remains the system of record.
- The design stays multi-company, branch, warehouse, and bin aware.
- Stored procedures remain the preferred path for machine-board and other heavier read models where already established.

See `/docs/database/conventions.md` and `/04-remediation/R011_SQL_Migration_Pack_and_Cutover_Strategy.md` for the governing conventions.
