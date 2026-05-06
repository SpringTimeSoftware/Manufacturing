# R005 Customer, Contact, Credit, and Terms V2 Schema

## Objective

Replace the shallow customer and address model with a canonical account, site, contact, credit, and commercial-default structure that can support quotes, sales orders, dispatch, and notifications.

## Canonical V2 Aggregates

| Aggregate | Purpose | Disposition |
| --- | --- | --- |
| `master.CustomerAccounts` | Legal commercial entity and account-level controls | `REPLACE` |
| `master.CustomerSites` | Ship-to, bill-to, plant, and service locations | `ADDITIVE` |
| `master.CustomerAddresses` | Canonical addresses decoupled from the shallow customer row | `PATCH` |
| `master.Contacts` | Named customer contacts with role and language metadata | `ADDITIVE` |
| `master.ContactRoles` | Canonical contact role dictionary | `ADDITIVE` |
| `master.ContactPoints` | Email, phone, WhatsApp, and channel endpoint ownership | `ADDITIVE` |
| `sales.CustomerCommercialProfiles` | Default currency, tax, payment, trade, and dispatch profile assignment | `ADDITIVE` |
| `sales.CustomerCreditProfiles` | Credit class, limits, days, and hold policy | `ADDITIVE` |
| `sales.CreditOverrides` | Temporary commercial overrides with approval metadata | `ADDITIVE` |
| `sales.CreditExposureSnapshots` | Exposure projection used by sales and dashboards | `ADDITIVE` |
| `sales.CustomerDispatchPreferences` | Preferred carrier, service, pack, and document rules | `ADDITIVE` |

## Existing Repo Surface Classification

| Surface | Current files | Class | Rationale |
| --- | --- | --- | --- |
| Customer master shell | `MasterEntities.cs`, `MasterContracts.cs`, `PartnerResourceControllers.cs` | `REPLACE` | The current customer plus address split is too shallow for ERP responsibilities. |
| Quote and sales-order customer references | `SalesPlanningEntities.cs`, `SalesPlanningContracts.cs`, `SalesPlanningControllers.cs`, `SalesPlanningService.cs` | `PATCH` | Preserve document flow while replacing upstream customer assumptions. |
| Organization scoping | `OrganizationEntities.cs`, `OrganizationControllers.cs`, scope policies | `KEEP` | Existing company and branch scope remains authoritative. |
| Notification and localization consumers | Platform notification and localization services | `PATCH` | Contact points, preference, and language routing extend existing platform scaffolding. |

## Compatibility Strategy

- Map the current `Customer` row to `CustomerAccount` plus a default `CustomerSite` during the bridge period.
- Reuse existing `CustomerAddress` rows as canonical address records and attach them to sites through staged assignments.
- Preserve existing `CustomerId`, `BillToAddressId`, and `ShipToAddressId` references in quote and sales-order documents until `R013` introduces bridge DTOs and canonical lookups.
- Introduce credit and dispatch controls as additive structures first; enforcement rules turn on only after sales contracts are patched in `R013`.

## Cutover Approach

1. Introduce customer account, site, contact, and commercial-profile aggregates beside the shallow V1 customer shell.
2. Bridge current customer ids and address ids into the new account and site structure.
3. Patch quote and sales-order surfaces to resolve canonical customer context through adapters rather than direct shallow fields.
4. Keep notification preference, consent, and shared template concerns aligned with `R009` platform ownership.

## Next Prompt

- `/04-remediation/prompts/R006_supplier-compliance-and-reference-v2-schema.md`
