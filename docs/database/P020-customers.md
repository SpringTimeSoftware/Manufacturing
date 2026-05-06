# P020 Customer and Address Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `master.Customers`

Purpose: customer master for quotes, sales orders, dashboards, and dispatch.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `CustomerCode` | unique within company |
| `CustomerName` | display name |
| `ShortName` | compact label |
| `CustomerType` | `Direct`, `Dealer`, `OEM`, `Project`, `JobWork` |
| `DefaultBranchId` | nullable preferred servicing branch |
| `DefaultLanguageId` | nullable FK to `platform.Languages` |
| `TaxRegistrationNo` | optional |
| `PaymentTermsCode` | optional |
| `CreditDays` | optional |
| `Status` | `Active`, `Inactive`, `Blocked` |

Unique constraints:

- `UX_Customers_CompanyId_CustomerCode`

### `master.CustomerAddresses`

Purpose: multiple ship-to and bill-to addresses plus primary contacts.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `CustomerId` | FK to `master.Customers` |
| `AddressCode` | unique within customer |
| `AddressType` | `BillTo`, `ShipTo`, `Office`, `Plant` |
| `AddressLine1` | required |
| `AddressLine2` | optional |
| `City` | required |
| `StateOrProvince` | required |
| `PostalCode` | required |
| `CountryCode` | required |
| `ContactName` | optional primary contact |
| `ContactEmail` | optional |
| `ContactPhone` | optional |
| `IsDefaultBilling` | bit |
| `IsDefaultShipping` | bit |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_CustomerAddresses_CustomerId_AddressCode`
- one default billing address per customer
- one default shipping address per customer

## Relationship Summary

- `Customers` 1:n `CustomerAddresses`

## Scope Notes

- Customers are company-scoped masters.
- A customer may transact with multiple branches, but the master record remains company-owned.
