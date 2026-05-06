# R011 SQL Migration Pack and Cutover Strategy

## Objective

Replace the ad hoc SQL posture with an ordered DDL, migration, backfill, seed, and procedure pack strategy that can support `R013` without destabilizing preserved execution paths.

## Planned Pack Layout

| Planned path | Purpose | Disposition |
| --- | --- | --- |
| `/database/README.md` | Pack index and execution order manifest | `PATCH` |
| `/database/ddl/00-foundation/` | Shared schemas, base reference data, and platform prerequisites | `ADDITIVE` |
| `/database/ddl/10-master-data/` | Item, partner, packaging, and platform DDL by wave | `ADDITIVE` |
| `/database/ddl/20-commercial/` | Pricing, discount, tax, currency, and replenishment DDL | `ADDITIVE` |
| `/database/ddl/30-cost-foundation/` | Cost and landed-cost foundation DDL | `ADDITIVE` |
| `/database/backfill/` | Ordered bridge and data backfill scripts | `ADDITIVE` |
| `/database/seed/` | Canonical reference seed packs | `ADDITIVE` |
| `/database/procedures/production/` | Preserved production procedure inventory and wrappers | `PATCH` |
| `/database/procedures/planning/` | MRP, BOQ, and planning procedure realignment | `ADDITIVE` |

## Ordered Migration Waves

1. Platform and reference foundations required by `R003-R009`.
2. Master-data replacements and bridge tables required by `R003-R006`.
3. Commercial and replenishment foundations required by `R007-R008`.
4. Cost and landed-cost foundations defined in `R010`.
5. Stored-procedure and backfill alignment needed before reopening `P064`.

## Existing Repo Surface Classification

| Surface | Current files | Class | Rationale |
| --- | --- | --- | --- |
| Database folder | `database/README.md` only | `REPLACE` | Current SQL posture is not sufficient for ordered remediation. |
| EF persistence shell | `MfgDbContext.cs`, EF configuration files | `PATCH` | Persistence stays, but must align to ordered pack delivery. |
| Stored procedure execution shell | `IStoredProcedureExecutor`, `StoredProcedureExecutor.cs`, `MachineBoardStoredProcedure.cs` | `PATCH` | Preserve the execution pattern and expand it under ordered pack governance. |
| Production wrapper | `MachineBoardStoredProcedure.cs`, mapper, read service | `KEEP` | Existing machine-board behavior stays intact and remains a regression boundary. |

## Compatibility and Cutover Rules

- Use additive DDL, bridge tables, views, backfill scripts, and idempotent packs before any destructive replacement.
- Keep machine-board procedure behavior and naming stable unless an additive wrapper is required.
- Order packs by dependency and require backfill verification before switching runtime reads or writes.
- Do not create receipt, scrap, rework, landed-cost, or return execution SQL in this planning wave.

## R013 Allowed Runtime and SQL Surfaces

- Planned files under `/database/ddl/`, `/database/backfill/`, `/database/seed/`, and `/database/procedures/` aligned to the ordered pack layout.
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/*.cs`
- `src/server/STS.Mfg.Application/Abstractions/Persistence/IStoredProcedureExecutor.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/StoredProcedureExecutor.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Procedures/Production/MachineBoardStoredProcedure.cs` only if backward-compatible.

## Next Prompt

- `/04-remediation/prompts/R012_ef-domain-contract-refactor-plan.md`
