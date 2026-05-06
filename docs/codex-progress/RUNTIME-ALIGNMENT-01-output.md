# RUNTIME-ALIGNMENT-01 Output

## Exact Scope Completed

- Reconciled the runtime-alignment wave after P083 completion without executing P084 or any later normal prompt-chain work.
- Audited completed backend/runtime scope through P067 and completed web scope through P083.
- Added repo-local runtime-alignment documentation under `/05-runtime-alignment/`.
- Verified the ordered, additive SQL DDL packs for completed EF-backed runtime tables that previously had no ordered SQL foundation.
- Verified the minimum platform, organization, and master-data seed scripts.
- Confirmed the organization setup adapter remains live-first while preserving seeded fallback.

## P083 Fix Summary

- Fixed the shift calendar regression in `OrganizationPages.test.tsx`.
- The test previously required `Cross-midnight` to be unique even though the page renders the label in more than one legitimate place.
- The assertion now checks that at least one `Cross-midnight` label is rendered.

## SQL Objects Added Or Updated

- Updated `database/ddl/00-foundation/001_create_extension_schemas.sql` to create completed-scope schemas: `platform`, `org`, `measure`, `master`, `resource`, `engineering`, `sales`, `planning`, `procurement`, and `inventory`.
- Added `database/ddl/00-foundation/002_platform_org_measurement_tables.sql`.
- Added `database/ddl/10-master-data/010_master_resource_engineering_tables.sql`.
- Added `database/ddl/20-commercial/010_sales_planning_procurement_inventory_tables.sql`.
- Added `database/ddl/00-foundation/009_production_execution_tables.sql`.
- Preserved existing P064-P067 DDL packs for production output, quality, dispatch, integration, and AI.

## Seed Scripts Added

- `database/seed/001_minimum_platform_seed.sql`
- `database/seed/002_minimum_org_seed.sql`
- `database/seed/003_minimum_masters_seed.sql`

## Backend Code Patched

- No backend C# runtime code was patched.
- No EF entities, controllers, services, DTOs, migrations, app configuration, or tests were changed.

## Web Adapters Reduced Vs Retained

- Reduced: organization company, branch, department, warehouse, bin, and shift adapters attempt live API reads for any session with an access token, then fall back to seeded data on failure.
- Retained: forgot-password, notifications inbox, approvals, user/role administration, workflow/numbering, tenant settings, dashboard degraded reads, workspace preference, and demo scenario fallbacks remain because backend contracts are still missing or intentionally deferred.

## Modules Now Truly Runnable

- Organization setup APIs and screens through completed P083 are SQL-backed with fallback.
- Measurement/UOM backend APIs are SQL-backed.
- Item/customer/supplier compatibility backend surfaces have SQL-backed tables and minimum seed data.
- BOM/routing/ECO backend surfaces have SQL-backed tables and minimum routing/BOM seed data.
- Sales/planning/procurement/inventory backend surfaces have SQL-backed tables.
- Work order, job card, downtime, production receipt, scrap, rework, quality, dispatch, integration, and AI draft registry backend surfaces have SQL-backed tables.

## Modules Still Partial Or Demo-Backed

- Bootstrap auth is runnable, but database-backed user/role administration remains incomplete.
- Forgot-password, notification inbox, approvals, workflow/numbering, and tenant settings remain demo-backed.
- Web screens P084 and later were not executed.
- Costing, landed-cost finalization, HR, payroll, and full accounting remain blocked or out of V1 scope.

## Validation Results

- Validation was rerun after reconciling the runtime-alignment cutline to completed P083.
- `npm run typecheck` passed.
- `npm test` passed with `25/25` frontend tests.
- `npm run build` passed.
- `npm run build:host` passed and refreshed the IIS host publish-folder assets.
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln` passed.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build` passed with `7/7` backend tests.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release` passed.
- `dotnet publish` reported existing npm audit output: `5 moderate severity vulnerabilities`; this did not fail the publish gate.

## Exact Next Recommended Path

- Resume the normal prompt chain at `/02-prompts/P084_uom-class-and-conversion-screens.md` only when explicitly instructed.
- Do not execute P084 or later inside this runtime-alignment wave.
