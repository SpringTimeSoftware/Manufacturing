# RUNTIME-ALIGNMENT-02 Output

## Implementation Status

- Completed a forced implementation wave for the already completed scope through `P083`.
- Did not execute `P084` or any normal prompt-chain feature work.
- Added the missing SQL-backed platform/admin foundation identified by the runtime audit: users, roles, permissions, workflow/numbering, tenant settings, notification inbox, approval workbench, and password-recovery request capture.
- Preserved manufacturing execution, master/commercial compatibility adapters, IIS publish-folder deployment, and demo fallback paths.

## SQL Files Created Or Changed

- Added `database/ddl/00-foundation/003_platform_admin_runtime_tables.sql`.
- Updated `database/README.md` to include the new DDL pack in the execution order.

## Seed Files Created Or Changed

- Updated `database/seed/001_minimum_platform_seed.sql` with bootstrap-aligned app users, roles, permissions, role mappings, workflow/numbering records, tenant settings, notification inbox rows, and approval work items.
- Preserved `database/seed/002_minimum_org_seed.sql`.
- Preserved `database/seed/003_minimum_masters_seed.sql`.

## Backend Files Patched

- Added `src/server/STS.Mfg.Application/Contracts/Platform/PlatformRuntimeContracts.cs`.
- Added `src/server/STS.Mfg.Application/Abstractions/Platform/IPlatformRuntimeService.cs`.
- Added `src/server/STS.Mfg.Infrastructure/Platform/PlatformRuntimeService.cs`.
- Added `src/server/STS.Mfg.Api/Controllers/PlatformRuntimeControllers.cs`.
- Patched `src/server/STS.Mfg.Api/Controllers/AuthController.cs` to expose `/api/auth/forgot-password`.
- Patched `src/server/STS.Mfg.Infrastructure/DependencyInjection.cs` to register the platform runtime service.

## Web Runtime Adapter Reduction

- Added API client methods for `/api/auth/forgot-password`, `/api/notifications`, `/api/approvals`, `/api/users`, `/api/roles`, and `/api/settings/*`.
- Changed platform adapters to use live SQL-backed endpoints for non-demo sessions and keep deterministic fallback for demo, offline, or un-applied database packs.
- Changed notification provider to hydrate live inbox rows for non-demo sessions and post mark-read actions.

## Remaining Demo Or Fallback Areas

- Auth credential validation still uses the bootstrap identity directory; SQL app-user rows are a visibility mirror for completed admin screens.
- Password reset completion, token signing, and external channel delivery remain future work.
- Full user/role/permission write administration remains future prompt-chain work.
- Full workflow/numbering/tenant-setting write flows remain future prompt-chain work.
- Approval decision capture is SQL-backed; full workflow routing remains future work.
- Warehouse preference persistence still uses local web storage.
- Screens beyond `P083` remain blocked because `P084` was not executed.

## Validation Results

- `npm run typecheck` passed.
- `npm test` passed with `25/25` frontend tests.
- `npm run build` passed.
- `npm run build:host` passed and refreshed IIS host publish-folder assets.
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln` passed.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build` passed with `7/7` backend tests.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release` passed.
- Non-failing warnings remain: Vite chunk-size warning for the single web bundle and existing npm audit output with `5 moderate severity vulnerabilities`.

## Exact Next Recommended Path

- Resume the normal prompt chain at `/02-prompts/P084_uom-class-and-conversion-screens.md` only when explicitly instructed.
- Do not execute `P084` as part of this runtime-alignment wave.
