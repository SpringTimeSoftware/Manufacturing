# R004 Item Packaging, Barcode, Variant, and Reference V2 Schema

## Objective

Extend the V2 item foundation with packaging hierarchy, advanced barcode resolution, richer variant semantics, templates, aliases, and partner item references.

## Canonical V2 Aggregates

| Aggregate | Purpose | Disposition |
| --- | --- | --- |
| `master.ItemVariants` | Canonical operational variants and attribute combinations | `PATCH` |
| `master.ItemTemplates` | Reusable item setup templates and attribute defaults | `ADDITIVE` |
| `master.ItemAliases` | Internal and customer-facing alias codes and search keys | `ADDITIVE` |
| `master.ItemPackagingSpecs` | Packaging policy root per item | `ADDITIVE` |
| `master.PackagingLevels` | Inner, outer, case, pallet, roll, coil, and bundle hierarchy | `ADDITIVE` |
| `master.PackagingBarcodes` | Packaging-level barcode mapping and scan precedence | `ADDITIVE` |
| `master.ItemBarcodes` | Canonical barcode registry with scope and template metadata | `PATCH` |
| `master.CustomerItemReferences` | Customer part numbers, drawings, and ordering aliases | `ADDITIVE` |
| `master.VendorItemReferences` | Supplier part numbers and sourcing references | `ADDITIVE` |
| `eng.AlternateItems` | Engineering substitution and compatibility rules | `PATCH` |

## Existing Repo Surface Classification

| Surface | Current files | Class | Rationale |
| --- | --- | --- | --- |
| Variant and barcode shell | `MasterEntities.cs`, `MasterContracts.cs`, `MeasurementItemControllers.cs` | `PATCH` plus `REPLACE` | Keep the basic identity shell, replace the shallow behavior and ownership model. |
| Measurement and packaging inputs | `MeasurementEntities.cs`, `MeasurementContracts.cs`, `MeasurementService.cs` | `PATCH` | Packaging and scan rules build on the existing UOM base. |
| Inventory scan consumers | `InventoryEntities.cs`, `InventoryContracts.cs`, `InventoryControllers.cs`, `InventoryService.cs` | `PATCH` | Preserve stock-ledger behavior while upgrading barcode and package resolution. |
| Procurement and sales reference fields | `ProcurementEntities.cs`, `ProcurementContracts.cs`, `SalesPlanningEntities.cs`, `SalesPlanningContracts.cs` | `PATCH` | Preserve documents but replace shallow customer-spec and vendor-pointer assumptions. |
| Engineering alternates | `EngineeringEntities.cs`, `EngineeringContracts.cs`, `EngineeringControllers.cs`, `EngineeringService.cs` | `PATCH` | Alternate-item logic survives and gets richer canonical references. |

## Compatibility Strategy

- Treat the current `ItemVariant` and `ItemBarcode` rows as bridge projections into richer V2 variant and barcode ownership.
- Preserve current scan flows by resolving legacy item barcodes first, then layering packaging-level resolution behind a canonical precedence model.
- Keep `CustomerSpecRef` and equivalent shallow partner-reference fields as temporary projections until `R013` introduces canonical request and response contracts.
- Preserve alternate-item engineering behavior and map it to canonical item, variant, template, and alias identities through adapters.

## Cutover Approach

1. Define packaging, barcode, alias, template, and partner-reference aggregates beside the V1 item shell.
2. Patch inventory, sales, procurement, and engineering consumers to read through bridge resolvers instead of direct shallow assumptions.
3. Preserve current item and variant identities until the canonical DTO cutover in `R013`.
4. Keep execution and traceability behavior stable; only enrich lookup and planning inputs.

## Next Prompt

- `/04-remediation/prompts/R005_customer-contact-credit-terms-v2-schema.md`
