# P016 UOM Class, Unit, and Conversion Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `measure.UomClasses`

Purpose: group units by physical measure family.

| Column | Notes |
| --- | --- |
| `ClassCode` | `COUNT`, `WEIGHT`, `LENGTH`, `AREA`, `VOLUME`, `TIME` |
| `ClassName` | display name |
| `BaseUomId` | optional FK to `measure.Uoms` after units exist |
| `SupportsFormulaConversion` | bit |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_UomClasses_ClassCode`

### `measure.Uoms`

Purpose: master list of allowed units.

| Column | Notes |
| --- | --- |
| `UomCode` | `PCS`, `KG`, `MT`, `M`, `SQM`, `L` |
| `UomName` | display name |
| `Symbol` | printable symbol |
| `UomClassId` | FK to `measure.UomClasses` |
| `DecimalPrecision` | storage precision |
| `IsSystemBase` | bit |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_Uoms_UomCode`

### `measure.UomConversions`

Purpose: fixed or metadata-assisted conversions between units.

| Column | Notes |
| --- | --- |
| `FromUomId` | FK to `measure.Uoms` |
| `ToUomId` | FK to `measure.Uoms` |
| `ConversionMode` | `Fixed`, `Formula`, `ReferenceOnly` |
| `FactorNumerator` | decimal |
| `FactorDenominator` | decimal |
| `FormulaTokenSet` | nullable token group name for formula-based conversion |
| `RoundMode` | `Nearest`, `Up`, `Down` |
| `PrecisionScale` | result precision |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_UomConversions_FromUomId_ToUomId`

## Rules

- `FromUomId` and `ToUomId` must belong to the same `UomClassId` for fixed conversions.
- Cross-class relationships, such as sheet-to-weight, use measurement profiles and formulas, not generic global conversion factors.
- `FactorNumerator / FactorDenominator` avoids floating-point precision issues.

## Relationship Summary

- `UomClasses` 1:n `Uoms`
- `Uoms` 1:n `UomConversions` as source
- `Uoms` 1:n `UomConversions` as target

## Assumption Note

- The prompt references `/docs/architecture/STS_Manufacturing_ERP_Blueprint.md`; the authoritative blueprint source used here is `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`.
