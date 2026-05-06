# P014 Warehouse and Bin Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `org.Warehouses`

Purpose: physical or logical stock-holding locations scoped to company and branch.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `WarehouseCode` | unique within company |
| `WarehouseName` | display name |
| `WarehouseType` | `RM`, `WIP`, `FG`, `QC`, `Quarantine`, `Dispatch`, `Subcontract` |
| `IsDefaultReceivingWarehouse` | bit |
| `IsDefaultIssueWarehouse` | bit |
| `IsDispatchEnabled` | bit |
| `AllowsMixedLots` | bit |
| `AllowsNegativeStock` | bit, default false |
| `Status` | `Active`, `Inactive`, `Blocked` |

Unique constraints:

- `UX_Warehouses_CompanyId_WarehouseCode`
- only one default receiving warehouse per branch by filtered unique index if required
- only one default issue warehouse per branch by filtered unique index if required

### `org.Bins`

Purpose: row/rack/bin level stock locations inside a warehouse.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `WarehouseId` | FK to `org.Warehouses` |
| `ParentBinId` | nullable self-reference for hierarchy |
| `BinCode` | unique within warehouse |
| `BinName` | display name |
| `BinType` | `Storage`, `Staging`, `QC`, `Quarantine`, `Dispatch`, `Virtual` |
| `CapacityValue` | decimal capacity figure |
| `CapacityUomId` | optional FK to `measure.Uoms` |
| `IsDefaultReceiveBin` | bit |
| `IsDefaultIssueBin` | bit |
| `IsCountCycleRequired` | bit |
| `CountCycleDays` | cycle frequency |
| `IsBlocked` | bit |
| `BlockReasonCode` | nullable |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_Bins_WarehouseId_BinCode`
- one default receive bin per warehouse where desired
- one default issue bin per warehouse where desired

## Relationship Summary

- `Branches` 1:n `Warehouses`
- `Warehouses` 1:n `Bins`
- `Bins` self-hierarchy through `ParentBinId`

## Operational Rules

- Every stock balance row will eventually resolve to `WarehouseId` and optionally `BinId`.
- Warehouse type should drive UI defaults and validation, not replace workflow logic.
- Quarantine and QC segregation can be modeled either by warehouse or by bin type, depending on branch practice.

## Counting and Blocking

- `IsCountCycleRequired` plus `CountCycleDays` supports cyclic counting schedules.
- `IsBlocked` prevents issue, transfer, or receipt into the bin unless an override action is explicitly allowed.

## Demo Alignment

This design supports demo locations such as `RM-MAIN`, `WIP-FAB`, `FG-MAIN`, `SUBCON`, and `QC-HOLD`.
