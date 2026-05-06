# P018 Item Group, Attribute, and Item Master Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `master.ItemGroups`

Purpose: item category taxonomy and default behavior grouping.

| Column | Notes |
| --- | --- |
| `CompanyId` | nullable; null allows shared deployment seed categories |
| `ItemGroupCode` | unique within scope |
| `ItemGroupName` | display name |
| `ParentItemGroupId` | optional self-reference |
| `DefaultMeasurementProfileId` | optional FK |
| `DefaultQcRequired` | bit |
| `DefaultTraceabilityMode` | `None`, `Lot`, `Serial`, `LotAndSerial` |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_ItemGroups_CompanyId_ItemGroupCode`

### `master.ItemAttributes`

Purpose: configurable item characteristics such as size, grade, color, thickness, GSM, and finish.

| Column | Notes |
| --- | --- |
| `CompanyId` | nullable scope |
| `AttributeCode` | unique within scope |
| `AttributeName` | display name |
| `DataType` | `Text`, `Number`, `Decimal`, `Boolean`, `Date`, `List` |
| `IsVariantAxis` | bit |
| `UnitUomId` | nullable FK for dimensional attributes |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_ItemAttributes_CompanyId_AttributeCode`

### `master.ItemAttributeValues`

Purpose: allowed list values for list-based attributes.

| Column | Notes |
| --- | --- |
| `ItemAttributeId` | FK to `master.ItemAttributes` |
| `AttributeValueCode` | unique within attribute |
| `AttributeValueName` | display value |
| `SortOrder` | UI ordering |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_ItemAttributeValues_ItemAttributeId_AttributeValueCode`

### `master.Items`

Purpose: core item master for inventory, planning, procurement, production, quality, and dispatch.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `ItemCode` | unique within company |
| `ItemName` | display name |
| `ShortName` | compact label |
| `ItemType` | `RM`, `WIP`, `FG`, `Consumable`, `Service`, `Tool`, `Packaging`, `SubcontractService` |
| `ItemGroupId` | FK to `master.ItemGroups` |
| `MeasurementProfileId` | FK to `measure.MeasurementProfiles` |
| `StockUomId` | FK to `measure.Uoms` |
| `PurchaseUomId` | FK to `measure.Uoms` |
| `SalesUomId` | FK to `measure.Uoms` |
| `ProductionUomId` | FK to `measure.Uoms` |
| `QcUomId` | FK to `measure.Uoms` |
| `TraceabilityMode` | `None`, `Lot`, `Serial`, `LotAndSerial` |
| `IsCatchWeightItem` | bit |
| `IsQcRequired` | bit |
| `IsBatchExpiryTracked` | bit |
| `DefaultIssueMethod` | `Manual`, `Backflush`, `Hybrid` |
| `DefaultMakeType` | `MTS`, `MTO`, `ETO`, `Mixed` |
| `DefaultWarehouseId` | nullable FK to `org.Warehouses` |
| `DefaultBinId` | nullable FK to `org.Bins` |
| `LeadTimeDays` | planning default |
| `ReorderPolicy` | `None`, `MinMax`, `ReorderPoint`, `ForecastDriven` |
| `Status` | `Active`, `Inactive`, `Blocked` |

Unique constraints:

- `UX_Items_CompanyId_ItemCode`

## Relationship Summary

- `ItemGroups` 1:n `Items`
- `MeasurementProfiles` 1:n `Items`
- `ItemAttributes` 1:n `ItemAttributeValues`
- item variants, per-item UOM behavior, and barcodes are deferred to later prompts

## Design Notes

- Item dimensions and commercial/production split behavior are driven by `MeasurementProfileId` and later item-UOM behavior tables.
- `SubcontractService` item type allows routing and procurement logic to reference outside-processing operations without treating them as physical stock.
- `DefaultWarehouseId` and `DefaultBinId` are convenience defaults only; actual inventory location comes from transactions.
