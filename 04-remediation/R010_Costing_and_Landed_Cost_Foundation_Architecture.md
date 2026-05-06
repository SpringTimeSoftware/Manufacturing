# R010 Costing and Landed-Cost Foundation Architecture

## Objective

Define the cost and landed-cost foundation, its extension points, and the exact runtime touch boundaries that later remediation may use without breaking the preserved execution backbone.

## Canonical Foundations

| Aggregate | Purpose | Disposition |
| --- | --- | --- |
| `cost.CostElements` | Material, labor, machine, overhead, freight, and burden cost classification | `ADDITIVE` |
| `cost.ItemCosts` | Canonical item cost sets and effective periods | `ADDITIVE` |
| `cost.WorkOrderCostRollups` | Planned versus actual cost rollup envelope | `ADDITIVE` |
| `cost.JobCostEntries` | Job-card and execution-derived cost events | `ADDITIVE` |
| `procurement.LandedCostHeaders` | Landed-cost document root and status | `DEFER` |
| `procurement.LandedCostCharges` | Charge lines and charge source ownership | `DEFER` |
| `procurement.LandedCostApportionments` | Allocation rules and target valuation distribution | `DEFER` |

## Existing Repo Surface Classification

| Surface | Current files | Class | Rationale |
| --- | --- | --- | --- |
| Quote and demand costing placeholders | `SalesPlanningEntities.cs`, `SalesPlanningContracts.cs`, `SalesPlanningService.cs` | `PATCH` | Preserve placeholders and formalize the foundation behind them. |
| Inventory valuation hooks | `InventoryEntities.cs`, `InventoryContracts.cs`, `InventoryService.cs` | `PATCH` | Preserve ledger behavior and add cost-hook extension points only. |
| Procurement charge hooks | `ProcurementEntities.cs`, `ProcurementContracts.cs`, `ProcurementService.cs` | `PATCH` | Procurement may surface landed-cost hooks later, but execution remains deferred. |
| Work-order and job-card execution | `WorkOrderEntities.cs`, `JobCardEntities.cs`, `WorkOrderService.cs`, `JobCardService.cs` | `KEEP` plus `PATCH` | Preserve execution behavior and add only non-breaking cost extension points. |
| SQL delivery posture | `database/README.md`, persistence and procedure surfaces | `REPLACE` | Costing depends on the ordered SQL strategy defined next. |

## Compatibility Strategy

- Preserve current work-order and job-card quantity, status, and readiness behavior; cost structures remain observational hooks until a later execution wave.
- Keep quote and inventory costing placeholders as non-authoritative bridge fields until canonical cost sets and rollups are wired through `R013` and later post-foundation prompts.
- Defer landed-cost execution and receipt valuation posting until after the pre-`P064` remediation sequence is complete.
- Do not use cost foundations to reopen production-receipt, scrap, rework, or return logic on shallow V1 master assumptions.

## R013 Allowed Runtime Surfaces

- `src/server/STS.Mfg.Domain/SalesPlanning/SalesPlanningEntities.cs`
- `src/server/STS.Mfg.Domain/Inventory/InventoryEntities.cs`
- `src/server/STS.Mfg.Domain/Procurement/ProcurementEntities.cs`
- `src/server/STS.Mfg.Domain/Production/WorkOrderEntities.cs`
- `src/server/STS.Mfg.Domain/Production/JobCardEntities.cs`
- `src/server/STS.Mfg.Application/Contracts/SalesPlanning/SalesPlanningContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/Inventory/InventoryContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/Procurement/ProcurementContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/Production/WorkOrderContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/Production/JobCardContracts.cs`
- Matching infrastructure services and EF configuration files for additive, non-final cost hooks only.

## Next Prompt

- `/04-remediation/prompts/R011_sql-migration-pack-and-cutover-strategy.md`
