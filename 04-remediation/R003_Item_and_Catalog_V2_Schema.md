# R003 Item and Catalog V2 Schema

## Objective

Define the V2 operational item master and its separate commercial catalog model before any further commercial or receipt-related expansion.

## Canonical V2 Aggregates

| Aggregate | Purpose | Disposition |
| --- | --- | --- |
| `master.Items` | Operational make/buy item used by engineering, planning, inventory, procurement, and execution | `REPLACE` |
| `master.ItemTexts` | Language-specific operational descriptions and print labels | `ADDITIVE` |
| `master.ItemMedia` | Product images with role, effective period, and visibility metadata | `ADDITIVE` |
| `master.ItemDocuments` | Controlled manuals, drawings, certificates, and product-document links | `ADDITIVE` |
| `master.ItemPhysicalSpecs` | Dimensions, weight, volume, storage, and handling data | `ADDITIVE` |
| `sales.Catalogs` | Commercial catalog header and publication scope | `ADDITIVE` |
| `sales.CatalogItems` | Catalog-specific item visibility, ordering rules, and status | `ADDITIVE` |
| `sales.CatalogMedia` | Catalog-specific image sets, brochures, and hero assets | `ADDITIVE` |
| `sales.CatalogVisibility` | Channel, customer-group, and effective-date visibility rules | `ADDITIVE` |
| `sales.CatalogTexts` | Commercial copy, language variants, and brochure text | `ADDITIVE` |

## Existing Repo Surface Classification

| Surface | Current files | Class | Rationale |
| --- | --- | --- | --- |
| Operational item shell | `MasterEntities.cs`, `MasterContracts.cs`, `MeasurementItemControllers.cs`, `MeasurementService.cs` | `REPLACE` | Current item shape is too shallow for ERP-grade product depth. |
| UOM and measurement base | `MeasurementEntities.cs`, `MeasurementContracts.cs`, `MeasurementService.cs` | `PATCH` | Preserve the measurement base and attach richer product metadata around it. |
| Attachment storage and document links | `AttachmentRecord.cs`, `DocumentLink.cs`, `AttachmentService.cs`, `LocalAttachmentStorage.cs` | `PATCH` | Keep binary storage and link scaffolding, add item-media and document semantics above it. |
| Localization and translation scaffolding | `TranslationEntry.cs`, `TranslationContracts.cs`, `LocalizationController.cs`, `TranslationService.cs` | `PATCH` | Reuse translation fallback while introducing item and catalog text ownership. |
| Sales and execution item references | `SalesPlanningEntities.cs`, `ProcurementEntities.cs`, `EngineeringEntities.cs`, `WorkOrderEntities.cs`, `JobCardEntities.cs` | `PATCH` | Preserve current item ids and retrofit canonical item projections through adapters. |

## Compatibility Strategy

- Preserve the current `ItemId` as the bridge identity so engineering, inventory, planning, work-order, and job-card links do not break during cutover.
- Reuse `AttachmentRecord` and `DocumentLink` as the physical storage and linking substrate behind `ItemMedia` and `ItemDocuments`.
- Keep existing quote, sales-order, purchase, BOM, WO, and JC item references on the bridge identity until `R013` introduces canonical DTO and mapping layers.
- Preserve current status, numbering, audit, and company-scope patterns where they exist, but move business ownership to the new item and catalog aggregates.

## Cutover Approach

1. Add the V2 item and catalog aggregates beside the shallow V1 item model.
2. Expose bridge projections so current APIs can keep returning the current item identity while richer V2 fields appear through adapters.
3. Patch sales, procurement, engineering, planning, and execution consumers to read canonical item projections without changing preserved flow semantics.
4. Keep pricing, partner references, packaging hierarchy, and replenishment policy out of `R003`; those land in later remediation steps.

## Deferred Out of R003

- Packaging hierarchy, advanced barcodes, aliases, templates, and partner-specific references move to `R004`.
- Credit, pricing, discount, tax, currency, and replenishment policy stay out of scope until `R005-R008`.

## Next Prompt

- `/04-remediation/prompts/R004_item-packaging-barcode-variant-reference-v2-schema.md`
