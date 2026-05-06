# Local Database Apply Runbook

## Target

- Server: `120.138.10.194`
- Database: `Manufacturing_ERP`
- Tool: `sqlcmd`
- Scope: completed STS Manufacturing ERP database foundation through `P149`

Do not run these scripts against any database other than `Manufacturing_ERP`.

## Connection Source

The repo does not store the remote SQL Server credential:

- `src/server/STS.Mfg.Host/appsettings.json` points to LocalDB bootstrap/default values.
- `src/server/STS.Mfg.Host/appsettings.Development.json` points to LocalDB.
- `src/server/STS.Mfg.Host/appsettings.Production.json` has an empty `ConnectionStrings:SqlServer` value.
- `dotnet user-secrets` for the host project has no configured secrets.

For reruns, provide credentials through the current PowerShell session:

```powershell
$env:STS_MFG_SQL_SERVER = "120.138.10.194"
$env:STS_MFG_SQL_DATABASE = "Manufacturing_ERP"
$env:STS_MFG_SQL_USER = "<sql-user>"
$env:STS_MFG_SQL_PASSWORD = "<sql-password>"
```

## Execution Order

Run the minimum ordered chain below:

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

`database/seed/004_uat_demo_reset.sql` is not part of the minimum base setup. It contains guarded deletes for UAT/demo reset only and was not applied in this local setup run.

## Rerun Command

From `C:\StsPackages\Manufacturing_ERP`:

```powershell
$repo = "C:\StsPackages\Manufacturing_ERP"
$scripts = @(
  "database\ddl\00-foundation\001_create_extension_schemas.sql",
  "database\ddl\00-foundation\002_platform_org_measurement_tables.sql",
  "database\ddl\00-foundation\003_platform_admin_runtime_tables.sql",
  "database\ddl\10-master-data\010_master_resource_engineering_tables.sql",
  "database\ddl\20-commercial\010_sales_planning_procurement_inventory_tables.sql",
  "database\ddl\00-foundation\009_production_execution_tables.sql",
  "database\ddl\00-foundation\010_production_quality_dispatch_tables.sql",
  "database\ddl\00-foundation\020_integration_ai_tables.sql",
  "database\seed\001_minimum_platform_seed.sql",
  "database\seed\002_minimum_org_seed.sql",
  "database\seed\003_minimum_masters_seed.sql"
)

foreach ($script in $scripts) {
  $path = Join-Path $repo $script
  $log = Join-Path $env:TEMP ("sts_mfg_apply_" + ($script -replace "[\\/:]", "_") + ".log")

  sqlcmd `
    -S $env:STS_MFG_SQL_SERVER `
    -U $env:STS_MFG_SQL_USER `
    -P $env:STS_MFG_SQL_PASSWORD `
    -d $env:STS_MFG_SQL_DATABASE `
    -b -V 16 -l 60 `
    -i $path `
    -o $log

  $raw = if (Test-Path $log) { Get-Content $log -Raw } else { "" }
  if ($LASTEXITCODE -ne 0 -or $raw -match "(?m)^Msg\s+\d+,") {
    Write-Host "FAILED: $script"
    if ($raw) { Write-Host $raw }
    throw "SQL script failed: $script"
  }

  Remove-Item $log -ErrorAction SilentlyContinue
  Write-Host "APPLIED: $script"
}
```

## Verification Commands

Confirm the target database before any apply or verification:

```powershell
sqlcmd -S $env:STS_MFG_SQL_SERVER -U $env:STS_MFG_SQL_USER -P $env:STS_MFG_SQL_PASSWORD -d $env:STS_MFG_SQL_DATABASE -b -Q "SET NOCOUNT ON; IF DB_NAME() <> N'Manufacturing_ERP' THROW 51000, 'Wrong database target', 1; SELECT @@SERVERNAME AS ServerName, DB_NAME() AS DatabaseName;"
```

Confirm table coverage by schema:

```powershell
sqlcmd -S $env:STS_MFG_SQL_SERVER -U $env:STS_MFG_SQL_USER -P $env:STS_MFG_SQL_PASSWORD -d $env:STS_MFG_SQL_DATABASE -b -Q "SET NOCOUNT ON; SELECT s.name AS SchemaName, COUNT(*) AS TableCount FROM sys.tables t JOIN sys.schemas s ON s.schema_id = t.schema_id WHERE s.name IN (N'platform',N'org',N'measure',N'master',N'resource',N'engineering',N'sales',N'planning',N'procurement',N'inventory',N'production',N'quality',N'dispatch',N'integration',N'ai') GROUP BY s.name ORDER BY s.name;"
```

Confirm key seed rows:

```powershell
sqlcmd -S $env:STS_MFG_SQL_SERVER -U $env:STS_MFG_SQL_USER -P $env:STS_MFG_SQL_PASSWORD -d $env:STS_MFG_SQL_DATABASE -b -Q "SET NOCOUNT ON; SELECT N'platform.AppUsers' AS ObjectName, COUNT(*) AS [Rows] FROM platform.AppUsers UNION ALL SELECT N'platform.Roles', COUNT(*) FROM platform.Roles UNION ALL SELECT N'platform.Notifications', COUNT(*) FROM platform.Notifications UNION ALL SELECT N'platform.ApprovalWorkItems', COUNT(*) FROM platform.ApprovalWorkItems UNION ALL SELECT N'org.Companies', COUNT(*) FROM org.Companies UNION ALL SELECT N'org.Warehouses', COUNT(*) FROM org.Warehouses UNION ALL SELECT N'measure.Uoms', COUNT(*) FROM measure.Uoms UNION ALL SELECT N'master.Items', COUNT(*) FROM [master].[Items] UNION ALL SELECT N'master.Customers', COUNT(*) FROM [master].[Customers] UNION ALL SELECT N'master.Suppliers', COUNT(*) FROM [master].[Suppliers];"
```

## Apply Result On 2026-04-21

- Scripts applied: all 11 minimum DDL/seed scripts in the order above.
- Target confirmed: `DB_NAME() = Manufacturing_ERP`.
- Expected current-scope tables verified: `104/104`.
- Missing expected tables: `0`.
- Optional UAT reset script: not applied.

## Chain Repairs Required

The following compatibility repairs were made so the existing ordered scripts execute cleanly on SQL Server:

- `003_platform_admin_runtime_tables.sql`: added required SET options and made the filtered notification-key index dynamic to avoid same-batch add-column compilation failure.
- `010_master_resource_engineering_tables.sql` and `003_minimum_masters_seed.sql`: bracketed the `[master]` schema and object names to avoid ambiguity with the SQL Server `master` database.
- `010_production_quality_dispatch_tables.sql`, `010_master_resource_engineering_tables.sql`, and `010_sales_planning_procurement_inventory_tables.sql`: escaped `[LineNo]`.
- `020_integration_ai_tables.sql`: changed invalid `NVARCHAR(8000)` declarations to `NVARCHAR(MAX)`.
- `001_minimum_platform_seed.sql`: added required SET options for DML against the filtered notification-key index.
