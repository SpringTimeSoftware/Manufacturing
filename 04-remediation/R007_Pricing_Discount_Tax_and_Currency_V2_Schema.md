# R007 Pricing, Discount, Tax, and Currency V2 Schema

## Objective

Define the commercial calculation foundation that later remediates quotes, sales orders, blanket orders, forecasts, and procurement without rebuilding preserved document shells.

## Canonical V2 Aggregates

| Aggregate | Purpose | Disposition |
| --- | --- | --- |
| `platform.Currencies` | Currency master and display rules | `ADDITIVE` |
| `platform.ExchangeRates` | Effective-date exchange rates and source metadata | `ADDITIVE` |
| `platform.TaxClasses` | Item and partner tax classification anchors | `ADDITIVE` |
| `platform.TaxCodes` | Transaction tax resolution rules | `ADDITIVE` |
| `sales.PriceLists` | Price-list header and status | `ADDITIVE` |
| `sales.PriceListLines` | Item, item-group, customer, and UOM-aware pricing rows | `ADDITIVE` |
| `sales.PriceAssignments` | Price-list applicability and precedence | `ADDITIVE` |
| `sales.PriceConditions` | Conditional price modifiers and calculation rules | `ADDITIVE` |
| `sales.DiscountSchemes` | Discount program root and lifecycle | `ADDITIVE` |
| `sales.DiscountRules` | Scope, precedence, and stacking rules | `ADDITIVE` |
| `sales.DiscountBreaks` | Slab and threshold-based discount steps | `ADDITIVE` |
| `sales.DiscountAssignments` | Customer, channel, and item-group assignments | `ADDITIVE` |

## Existing Repo Surface Classification

| Surface | Current files | Class | Rationale |
| --- | --- | --- | --- |
| Sales commercial shell | `SalesPlanningEntities.cs`, `SalesPlanningContracts.cs`, `SalesPlanningControllers.cs`, `SalesPlanningService.cs` | `REPLACE` plus `PATCH` | Preserve document shells while replacing embedded pricing assumptions. |
| Procurement commercial dependencies | `ProcurementEntities.cs`, `ProcurementContracts.cs`, `ProcurementControllers.cs`, `ProcurementService.cs` | `PATCH` | Procurement must consume the new currency, tax, and term foundations without losing document continuity. |
| Organization currency placeholders | `OrganizationEntities.cs`, `OrganizationContracts.cs`, `OrganizationControllers.cs` | `PATCH` | Existing company currency placeholders become references into canonical currency ownership. |
| Work-order and job-card execution | Production contracts, entities, controllers, and services | `KEEP` | Manufacturing execution stays isolated from commercial engine changes. |

## Compatibility Strategy

- Preserve the current quote, sales-order, blanket-order, and demand-flow shell and introduce pricing resolution behind compatibility adapters.
- Treat existing manual line-price behavior as a bridge override until the pricing engine becomes authoritative in `R013`.
- Keep sales and procurement numbering, status, scope, and audit behavior intact while replacing pricing, discount, tax, and currency derivation.
- Do not introduce accounting-ledger behavior in this wave; tax and currency remain commercial calculation and document concerns only.

## Cutover Approach

1. Add canonical price, discount, tax, and currency aggregates beside the shallow document shell.
2. Introduce bridge lookups that calculate effective commercial values without breaking current document ids or flow semantics.
3. Patch quote, sales-order, blanket-order, and PO contracts only in `R013`, after the canonical model is accepted.
4. Keep returns, landed cost, and cost rollup execution out of scope for this schema step.

## Next Prompt

- `/04-remediation/prompts/R008_replenishment-and-planning-input-v2-schema.md`
