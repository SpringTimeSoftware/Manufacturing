# P029 Inventory, Lots, Serials, and Stock Ledger Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `inventory.StockBalances`

Purpose: current stock snapshot by item, location, and traceability dimension.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `ItemId` | FK to `master.Items` |
| `ItemVariantId` | nullable FK |
| `WarehouseId` | FK to `org.Warehouses` |
| `BinId` | nullable FK to `org.Bins` |
| `LotId` | nullable FK to `inventory.Lots` |
| `SerialId` | nullable FK to `inventory.Serials` |
| `OnHandQty` | decimal |
| `ReservedQty` | decimal |
| `QcHoldQty` | decimal |
| `BlockedQty` | decimal |
| `InTransitQty` | decimal |
| `CatchWeightQty` | nullable |

Unique constraints:

- `UX_StockBalances_ItemVariantWarehouseBinLotSerial`

### `inventory.StockTransactions`

Purpose: immutable inventory movement ledger.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `TransactionNo` | unique within company |
| `TransactionType` | `Receipt`, `Issue`, `Return`, `Transfer`, `Adjustment`, `Reservation`, `Release`, `Shipment`, `ProductionReceipt`, `SubcontractIssue`, `SubcontractReceipt` |
| `PostingDate` | date |
| `ItemId` | FK to `master.Items` |
| `ItemVariantId` | nullable FK |
| `FromWarehouseId` | nullable FK |
| `FromBinId` | nullable FK |
| `ToWarehouseId` | nullable FK |
| `ToBinId` | nullable FK |
| `LotId` | nullable FK |
| `SerialId` | nullable FK |
| `Quantity` | signed movement quantity |
| `CatchWeightQty` | nullable |
| `InventoryState` | `Available`, `Reserved`, `QcHold`, `Blocked`, `InTransit` |
| `SourceDocumentType` | source linkage |
| `SourceDocumentId` | nullable |
| `Remarks` | optional |

Unique constraints:

- `UX_StockTransactions_CompanyId_TransactionNo`

### `inventory.StockReservations`

Purpose: reservation records tying inventory to downstream demand.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `ItemId` | FK to `master.Items` |
| `ItemVariantId` | nullable FK |
| `WarehouseId` | nullable FK |
| `BinId` | nullable FK |
| `LotId` | nullable FK |
| `ReservedQuantity` | decimal |
| `SourceDocumentType` | `SalesOrderLine`, `WorkOrder`, `JobCard`, `SubcontractOrder` |
| `SourceDocumentId` | referenced row |
| `Status` | `Active`, `Released`, `Consumed`, `Cancelled` |

### `inventory.Lots`

Purpose: lot-level traceability identity.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `ItemId` | FK to `master.Items` |
| `LotNo` | unique per company and item |
| `ManufacturedOn` | nullable |
| `ExpiryOn` | nullable |
| `LotStatus` | `Available`, `Reserved`, `Issued`, `QC_Hold`, `Blocked`, `Consumed`, `Shipped` |
| `CatchWeightQty` | nullable aggregate metadata |

Unique constraints:

- `UX_Lots_CompanyId_ItemId_LotNo`

### `inventory.Serials`

Purpose: serial-level traceability identity.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `ItemId` | FK to `master.Items` |
| `SerialNo` | unique per company |
| `LotId` | nullable FK to `inventory.Lots` |
| `CurrentWarehouseId` | nullable FK |
| `CurrentBinId` | nullable FK |
| `SerialStatus` | `Available`, `Reserved`, `Issued`, `QC_Hold`, `Blocked`, `Consumed`, `Shipped` |
| `ManufacturedOn` | nullable |
| `ExpiryOn` | nullable |

Unique constraints:

- `UX_Serials_CompanyId_SerialNo`

## Relationship Summary

- `Lots` 1:n `StockBalances`
- `Serials` 1:n `StockBalances`
- `StockTransactions` are the source of truth; `StockBalances` are derived/current snapshot records
