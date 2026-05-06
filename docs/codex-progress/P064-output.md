# P064 Output

## Objective Status

- Implemented production receipt, scrap, and rework APIs as additive production-output surfaces.
- Preserved `P057`, `P062`, and `P063` behavior by leaving engineering, work-order, and job-card execution flows intact and posting inventory through compatibility-aware helpers.
- Fixed the item-code compatibility gap for scrap and rework so persisted documents now retain resolved item, variant, lot, and serial ids instead of only the stock movement doing so.

## Deliverables Completed

- Added production-output entities, EF configuration, service abstraction, infrastructure service, and API controllers for `api/production-receipts` and `api/scrap-rework`
- Added inventory posting orchestration to receive finished goods, issue scrap, move rework stock, and stamp job-card events without reopening preserved execution modules
- Added additive SQL pack coverage for production and quality tables under `/database/ddl/00-foundation/010_production_quality_dispatch_tables.sql`

## Files Created or Changed

- `/src/server/STS.Mfg.Domain/Production/ProductionOutputEntities.cs`
- `/src/server/STS.Mfg.Application/Contracts/Production/ProductionReceiptContracts.cs`
- `/src/server/STS.Mfg.Application/Abstractions/Production/IProductionOutputService.cs`
- `/src/server/STS.Mfg.Infrastructure/Inventory/InventoryPostingService.cs`
- `/src/server/STS.Mfg.Infrastructure/Production/ProductionOutputService.cs`
- `/src/server/STS.Mfg.Infrastructure/Persistence/Configurations/ProductionOutputEntityConfigurations.cs`
- `/src/server/STS.Mfg.Api/Controllers/ProductionOutputControllers.cs`
- `/src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `/src/server/STS.Mfg.Infrastructure/DependencyInjection.cs`
- `/database/ddl/00-foundation/001_create_extension_schemas.sql`
- `/database/ddl/00-foundation/010_production_quality_dispatch_tables.sql`

## Assumptions Captured

- Production receipts post immediately in this prompt; reversal/correction mechanics remain future work.
- Scrap remains a posted stock-issue flow, not a later NCR disposition engine.
- Rework orders stay staged and additive, with optional stock transfer when both source and target warehouses are supplied.
- Inventory posting continues through the EF-backed ledger shell rather than reopening the deferred SQL procedure path.

## Open Issues / Blockers

- No blocker for `P064`.
- Batch and serial auto-generation rules remain caller-driven; this prompt resolves provided references and creates missing receipt-side lot/serial records only where the current inventory helper already allowed it.

## Build / Test / Lint

- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln` passed during the prompt run and again in the batch validation.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build` passed with `7/7` tests.
- No lint target is configured in the repository yet.

## Next Prompt

- `/02-prompts/P065_quality-apis.md`
