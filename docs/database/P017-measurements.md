# P017 Measurement Profiles, Formulas, and Catch-Weight Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `measure.MeasurementProfiles`

Purpose: define how an item behaves across stock, planning, production, purchase, sales, and QC quantities.

| Column | Notes |
| --- | --- |
| `ProfileCode` | unique code |
| `ProfileName` | display name |
| `ProfileType` | `CountOnly`, `WeightOnly`, `Dimensional`, `DualUom`, `MixedMode` |
| `StockUomClassId` | FK to `measure.UomClasses` |
| `AllowsCatchWeight` | bit |
| `RequiresDimensions` | bit |
| `RequiresDensity` | bit |
| `RequiresThickness` | bit |
| `RequiresPackSize` | bit |
| `SupportsCommercialProductionSplit` | bit |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_MeasurementProfiles_ProfileCode`

### `measure.MeasurementFormulas`

Purpose: tokenized formulas used by measurement profiles to derive conversion or theoretical quantity.

| Column | Notes |
| --- | --- |
| `MeasurementProfileId` | FK to `measure.MeasurementProfiles` |
| `FormulaCode` | unique within profile |
| `FormulaName` | display name |
| `FormulaPurpose` | `StockToWeight`, `PieceToArea`, `ReceiptTheoreticalWeight`, `PackExpansion` |
| `ExpressionTemplate` | tokenized formula string such as `(Length * Width * Thickness * Density)` |
| `OutputUomId` | FK to `measure.Uoms` |
| `PrecisionScale` | result precision |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_MeasurementFormulas_ProfileId_FormulaCode`

## Supported Token References

Formulas may reference tokens such as:

- `Length`
- `Width`
- `Height`
- `Thickness`
- `Diameter`
- `Density`
- `Gsm`
- `PackSize`
- `PieceCount`
- `NetWeight`
- `GrossWeight`

These tokens are resolved from item master, item-UOM behavior, or transaction entry context.

## Behavior Rules

- `CountOnly` profiles do not require formula rows.
- `WeightOnly` profiles may use formulas for theoretical or derived quantities but do not require dual-UOM logic.
- `DualUom` profiles allow planned and actual units to coexist, for example pieces and kilograms.
- `MixedMode` profiles support different purchase, stock, production, and sales behavior when valid mapping exists.

## Relationship Summary

- `MeasurementProfiles` 1:n `MeasurementFormulas`

## Assumption Note

- The prompt references `/docs/architecture/STS_Manufacturing_ERP_Blueprint.md`; the authoritative blueprint source used here is `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`.
