# LOCAL-DB-SETUP Output

## Scope Completed

- Prepared and executed the local SQL Server database setup for the completed STS Manufacturing ERP scope through `P149`.
- Applied scripts only to `Manufacturing_ERP` on `120.138.10.194`.
- Did not execute any P-series prompt, publish step, app run, or UAT flow.

## Connection And Safety Checks

- Confirmed the repo appsettings do not store the remote SQL credential.
- Confirmed host user-secrets are not configured.
- Used the locally available, previously tested SQL credential without recording the password in repo docs.
- Every apply and verification command used `-d Manufacturing_ERP`.
- Target guard used `DB_NAME() = N'Manufacturing_ERP'`.

## Scripts Applied In Order

1. `database/ddl/00-foundation/001_create_extension_schemas.sql`
2. `database/ddl/00-foundation/002_platform_org_measurement_tables.sql`
3. `database/ddl/00-foundation/003_platform_admin_runtime_tables.sql`
4. `database/ddl/10-master-data/010_master_resource_engineering_tables.sql`
5. `database/ddl/20-commercial/010_sales_planning_procurement_inventory_tables.sql`
6. `database/ddl/00-foundation/009_production_execution_tables.sql`
7. `database/ddl/00-foundation/010_production_quality_dispatch_tables.sql`
8. `database/ddl/00-foundation/020_integration_ai_tables.sql`
9. `database/seed/001_minimum_platform_seed.sql`
10. `database/seed/002_minimum_org_seed.sql`
11. `database/seed/003_minimum_masters_seed.sql`

## Script Repairs Made Before Successful Apply

- Added SQL Server SET options and dynamic filtered-index creation for `platform.Notifications.NotificationKey`.
- Escaped `[LineNo]` where SQL Server treated `LineNo` as a reserved keyword.
- Bracketed the `[master]` schema references to keep master-data objects inside `Manufacturing_ERP`.
- Replaced invalid `NVARCHAR(8000)` AI text columns with `NVARCHAR(MAX)`.
- Added SQL Server SET options to the minimum platform seed for inserts against the filtered notification index.

## Verification Results

- `104/104` expected current-scope tables exist.
- Missing expected tables: `0`.
- Schema table counts:
  - `ai`: 4
  - `dispatch`: 4
  - `engineering`: 7
  - `integration`: 5
  - `inventory`: 7
  - `master`: 10
  - `measure`: 5
  - `org`: 6
  - `planning`: 6
  - `platform`: 18
  - `procurement`: 5
  - `production`: 9
  - `quality`: 4
  - `resource`: 6
  - `sales`: 8
- Key seed rows verified:
  - `platform.AppUsers`: 8
  - `platform.Roles`: 12
  - `platform.Notifications`: 5
  - `platform.ApprovalWorkItems`: 4
  - `org.Companies`: 1
  - `org.Warehouses`: 3
  - `measure.Uoms`: 2
  - `master.Items`: 2
  - `master.Customers`: 1
  - `master.Suppliers`: 1

## Not Applied

- `database/seed/004_uat_demo_reset.sql` was not applied because it is a guarded UAT/demo reset script with deletes, not part of the minimum base setup.

## Files Created Or Changed

- `/database/LOCAL_DB_APPLY_RUNBOOK.md`
- `/database/ddl/00-foundation/003_platform_admin_runtime_tables.sql`
- `/database/ddl/00-foundation/010_production_quality_dispatch_tables.sql`
- `/database/ddl/00-foundation/020_integration_ai_tables.sql`
- `/database/ddl/10-master-data/010_master_resource_engineering_tables.sql`
- `/database/ddl/20-commercial/010_sales_planning_procurement_inventory_tables.sql`
- `/database/seed/001_minimum_platform_seed.sql`
- `/database/seed/003_minimum_masters_seed.sql`
- `/docs/codex-progress/LOCAL-DB-SETUP-output.md`
- `/docs/codex-progress/README.md`

## Next Recommended Step

- Configure the application runtime connection string for `Manufacturing_ERP` on `120.138.10.194`, then run an app-level smoke test against the SQL-backed foundation.
