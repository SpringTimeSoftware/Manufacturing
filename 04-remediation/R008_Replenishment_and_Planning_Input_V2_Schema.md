# R008 Replenishment and Planning-Input V2 Schema

## Objective

Replace shallow reorder assumptions with canonical replenishment and planning-input ownership while preserving the current MPS, MRP, BOQ, WO, and JC backbone.

## Canonical V2 Aggregates

| Aggregate | Purpose | Disposition |
| --- | --- | --- |
| `planning.ReplenishmentPolicies` | Safety stock, reorder point, min-max, EOQ, and strategy ownership | `REPLACE` |
| `planning.ItemInventoryPolicies` | Site, warehouse, and item-specific planning defaults | `ADDITIVE` |
| `planning.PlanningLeadTimeProfiles` | Canonical lead-time and sourcing assumptions | `ADDITIVE` |
| `planning.SourcingRules` | Preferred supplier and site sourcing priority | `ADDITIVE` |
| `planning.PlanningPackConversions` | Packaging-aware planning and procurement conversion rules | `ADDITIVE` |
| `planning.RequirementBufferPolicies` | Buffer and horizon rules used by MRP and BOQ | `ADDITIVE` |

## Existing Repo Surface Classification

| Surface | Current files | Class | Rationale |
| --- | --- | --- | --- |
| MPS, MRP, BOQ shell | `SalesPlanningEntities.cs`, `SalesPlanningContracts.cs`, `SalesPlanningControllers.cs`, `SalesPlanningService.cs` | `PATCH` plus `REPLACE` | Preserve planning algorithms and replace shallow upstream policy inputs. |
| Inventory policy placeholders | `InventoryEntities.cs`, `InventoryContracts.cs`, `InventoryControllers.cs`, `InventoryService.cs` | `PATCH` | Stock-ledger and reservation behavior stays intact while planning policies deepen. |
| Procurement planning dependencies | `ProcurementEntities.cs`, `ProcurementContracts.cs`, `ProcurementService.cs` | `PATCH` | Procurement consumes canonical sourcing and lead-time inputs later. |
| Item and packaging inputs | `MasterEntities.cs`, `MeasurementEntities.cs`, `MeasurementService.cs` | `PATCH` | Replenishment depends on canonical item, package, and partner inputs from earlier steps. |
| Engineering and execution | Engineering and production runtime surfaces | `KEEP` | Routing, BOM, WO, and JC logic remain preserved. |

## Compatibility Strategy

- Preserve current MPS, MRP, and BOQ processing behavior and change only the upstream policy inputs through bridge projections.
- Treat existing item reorder fields and supplier lead-time data as bridge inputs into canonical replenishment and planning profiles.
- Preserve current work-order release and job-card execution behavior by isolating replenishment changes to planning and inventory input resolution.
- Do not finalize low-stock execution, cost propagation, or receipt logic in this step.

## Cutover Approach

1. Define canonical replenishment and planning-input aggregates beside the current item and planning shells.
2. Bridge current item, supplier, and package data into the new policies.
3. Patch planning read services and document contracts only after canonical policies are accepted.
4. Keep preserved execution and dashboard behavior stable throughout the cutover.

## Next Prompt

- `/04-remediation/prompts/R009_platform-extensibility-template-and-localization-v2-schema.md`
