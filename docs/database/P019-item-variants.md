# P019 Item Variants, Barcodes, and Item-UOM Behavior Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `master.ItemVariants`

Purpose: concrete sellable or manufacturable variant records derived from a base item and attribute matrix.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `ItemId` | FK to `master.Items` |
| `VariantCode` | unique within company |
| `VariantName` | display name |
| `VariantKey` | deterministic matrix key such as `SIZE:LARGE|THK:2MM|COLOR:BLACK` |
| `VariantAttributeSummary` | human-readable summary |
| `VariantAttributeMapJson` | tokenized selected attribute/value map |
| `OverrideMeasurementProfileId` | nullable FK when variant behavior differs from base item |
| `OverrideStockUomId` | nullable |
| `OverrideWeightPerUnit` | nullable |
| `Status` | `Active`, `Inactive`, `Blocked` |

Unique constraints:

- `UX_ItemVariants_CompanyId_VariantCode`
- `UX_ItemVariants_ItemId_VariantKey`

### `master.ItemUoms`

Purpose: per-item or per-variant UOM behavior and conversion metadata.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `ItemId` | FK to `master.Items` |
| `ItemVariantId` | nullable FK to `master.ItemVariants` |
| `UomRole` | `Stock`, `Purchase`, `Sales`, `Production`, `QC`, `Reference` |
| `UomId` | FK to `measure.Uoms` |
| `BaseToThisNumerator` | conversion numerator |
| `BaseToThisDenominator` | conversion denominator |
| `MeasurementFormulaId` | nullable FK to `measure.MeasurementFormulas` |
| `IsDefault` | bit |
| `IsCatchWeightActualUom` | bit |
| `MinOrderQty` | nullable |
| `RoundingScale` | precision |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_ItemUoms_ItemId_ItemVariantId_UomRole_UomId`
- one default row per `ItemId` + `ItemVariantId` + `UomRole`

### `master.ItemBarcodes`

Purpose: barcode definitions and scan preferences for item and variant identification.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `ItemId` | FK to `master.Items` |
| `ItemVariantId` | nullable FK to `master.ItemVariants` |
| `UomId` | nullable FK to `measure.Uoms` |
| `BarcodeValue` | globally unique scan value |
| `BarcodeType` | `EAN13`, `Code128`, `QR`, `Internal` |
| `ScanPurpose` | `ItemLookup`, `Issue`, `Receipt`, `LabelPrint` |
| `PreferenceRank` | lower is more preferred |
| `IsPrimary` | bit |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_ItemBarcodes_BarcodeValue`
- one primary barcode per item/variant/scan-purpose scope

## Rules

- `VariantKey` is the canonical uniqueness signature for attribute combinations.
- Barcodes are globally unique across all active item and variant assignments.
- Variant-specific barcode overrides beat base-item barcode matches during scan resolution.
- `ItemUoms` may override conversion behavior for a specific variant when size or dimensional factors differ.

## Design Note

- The selected attribute/value matrix is stored as a canonical key plus tokenized JSON in `ItemVariants` to stay compatible with the current entity inventory while still supporting matrix generation.
