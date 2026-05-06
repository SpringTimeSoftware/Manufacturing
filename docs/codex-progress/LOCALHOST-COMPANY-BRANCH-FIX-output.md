# Localhost Company And Branch API Fix Output

## Scope

- Corrected the localhost smoke blocker where `/api/companies` and `/api/branches` returned HTTP `500`.
- Did not execute any P-series prompt.
- Did not add product features or redesign architecture.
- Kept the fix bounded to the organization service query path for company and branch list/detail/update reads.

## Root Cause

- `OrganizationService` applied generic scope helpers to root `Company` and `Branch` queries.
- Those helpers referenced compatibility properties `Company.CompanyId` and `Branch.BranchId`.
- EF Core could not translate those compatibility properties because they are computed/unmapped aliases over the mapped `Id` columns.

## Fix Completed

- Replaced the generic company root scoping with explicit mapped-key predicates against `Company.Id`.
- Replaced the generic branch root scoping with explicit mapped-key predicates against `Branch.CompanyId` and `Branch.Id`.
- Preserved the existing compatibility properties and did not change schema, DTO contracts, controllers, migrations, or SQL objects.

## Runtime Verification

Validated against the current localhost host at `http://127.0.0.1:5088` after republishing and restarting the published host.

| Check | Result |
| --- | --- |
| `/api/auth/login` with seeded platform admin context | PASS |
| `/api/auth/me` | HTTP `200` |
| `/api/companies?page=1&pageSize=20` | HTTP `200`; returned `ACME` |
| `/api/branches?page=1&pageSize=20` | HTTP `200`; returned `ACME-N` |
| `/api/health/live` | `Healthy` |
| `/api/health/ready` | `Healthy` |

## Validation

- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: passed.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: passed; `12/12` backend tests.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: passed.
- Web validation was not required because no web/UI code was changed in this fix.

## Files Changed

- `/src/server/STS.Mfg.Infrastructure/Organization/OrganizationService.cs`
- `/docs/codex-progress/LOCALHOST-COMPANY-BRANCH-FIX-output.md`

## Remaining Known Gaps

- The role-wise UAT pass still finds unrelated runtime gaps in customer, supplier, warehouse, job-card, machine-board, and downtime endpoints.
- Missing UAT role seeds remain for `SalesCoordinator`, `PurchaseManager`, and `PlantHead`.

