# P021 Supplier, Address, and Lead-Time Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `master.Suppliers`

Purpose: supplier master for buy items, subcontract vendors, and vendor performance visibility.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `SupplierCode` | unique within company |
| `SupplierName` | display name |
| `SupplierType` | `Material`, `Service`, `Subcontract`, `Mixed` |
| `SupportsSubcontracting` | bit |
| `DefaultBranchId` | nullable |
| `DefaultLanguageId` | nullable |
| `TaxRegistrationNo` | optional |
| `PaymentTermsCode` | optional |
| `Status` | `Active`, `Inactive`, `Blocked` |

Unique constraints:

- `UX_Suppliers_CompanyId_SupplierCode`

### `master.SupplierAddresses`

Purpose: vendor remittance, pickup, and service addresses.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `SupplierId` | FK to `master.Suppliers` |
| `AddressCode` | unique within supplier |
| `AddressType` | `RemitTo`, `Pickup`, `Service`, `Office`, `Plant` |
| `AddressLine1` | required |
| `City` | required |
| `StateOrProvince` | required |
| `PostalCode` | required |
| `CountryCode` | required |
| `ContactName` | optional |
| `ContactEmail` | optional |
| `ContactPhone` | optional |
| `IsDefaultOrderAddress` | bit |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_SupplierAddresses_SupplierId_AddressCode`

### `master.SupplierLeadTimes`

Purpose: procurement planning lead times with precedence from item-specific to generic.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `SupplierId` | FK to `master.Suppliers` |
| `BranchId` | nullable FK to `org.Branches` |
| `ItemId` | nullable FK to `master.Items` |
| `ItemGroupId` | nullable FK to `master.ItemGroups` |
| `LeadTimeDays` | required |
| `MinOrderQty` | optional |
| `OrderMultipleQty` | optional |
| `IsSubcontractLeadTime` | bit |
| `PriorityRank` | lower rank wins when multiple rows match |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_SupplierLeadTimes_SupplierId_BranchId_ItemId_ItemGroupId`

## Precedence Rules

1. supplier + branch + item
2. supplier + item
3. supplier + branch + item group
4. supplier + item group
5. supplier generic

## Relationship Summary

- `Suppliers` 1:n `SupplierAddresses`
- `Suppliers` 1:n `SupplierLeadTimes`
