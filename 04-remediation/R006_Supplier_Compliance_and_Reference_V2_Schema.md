# R006 Supplier Compliance and Reference V2 Schema

## Objective

Deepen the supplier model into a canonical supplier account and compliance structure while preserving the current procurement document shell.

## Canonical V2 Aggregates

| Aggregate | Purpose | Disposition |
| --- | --- | --- |
| `master.SupplierAccounts` | Legal supplier identity and account-level controls | `REPLACE` |
| `master.SupplierSites` | Order-from, remit-to, and service locations | `ADDITIVE` |
| `master.SupplierAddresses` | Canonical addresses decoupled from the shallow supplier row | `PATCH` |
| `master.SupplierContacts` | Supplier contact assignment and commercial-routing ownership | `ADDITIVE` |
| `procurement.SupplierCommercialProfiles` | Payment, trade, currency, and sourcing defaults | `ADDITIVE` |
| `procurement.SupplierComplianceDocs` | Certifications, approvals, and controlled vendor documents | `ADDITIVE` |
| `procurement.SupplierScorecards` | Performance and quality scoring placeholders | `ADDITIVE` |
| `procurement.PreferredSuppliers` | Preferred sourcing and item-site ranking | `ADDITIVE` |
| `procurement.SupplierLeadTimeProfiles` | Canonical replenishment and purchasing lead-time ownership | `PATCH` |
| `master.VendorItemReferences` | Supplier part numbers and approved item mappings | `PATCH` |

## Existing Repo Surface Classification

| Surface | Current files | Class | Rationale |
| --- | --- | --- | --- |
| Supplier master shell | `MasterEntities.cs`, `MasterContracts.cs`, `PartnerResourceControllers.cs` | `REPLACE` | The current supplier model lacks depth for compliance, commercial defaults, and references. |
| Procurement document shell | `ProcurementEntities.cs`, `ProcurementContracts.cs`, `ProcurementControllers.cs`, `ProcurementService.cs` | `PATCH` | Preserve PR, PO, and subcontract skeletons while changing supplier ownership. |
| Supplier lead time | `MasterEntities.cs`, `ProcurementEntities.cs`, procurement services | `PATCH` | Retain the current lead-time behavior as a bridge into canonical sourcing profiles. |
| Platform document handling | Attachment and document-link scaffolding | `PATCH` | Compliance documents should reuse the existing storage substrate through richer metadata. |

## Compatibility Strategy

- Map the current `Supplier` row to `SupplierAccount` plus a default `SupplierSite` during the bridge period.
- Preserve existing `SupplierAddress` rows as canonical address records and attach them to sites through staged assignments.
- Treat the current supplier lead-time records as bridge inputs into `SupplierLeadTimeProfiles`.
- Preserve `PurchaseOrder` and `SubcontractOrder` supplier ids until `R013` adds canonical procurement DTOs and service adapters.

## Cutover Approach

1. Introduce canonical supplier account, site, compliance, and preferred-item ownership beside the shallow V1 supplier shell.
2. Bridge current supplier ids, addresses, and lead times into the new structure.
3. Patch procurement document resolution to consume canonical supplier context through adapters.
4. Keep landed-cost execution, return flows, and procurement commercial enforcement out of scope until later remediation steps.

## Next Prompt

- `/04-remediation/prompts/R007_pricing-discount-tax-currency-v2-schema.md`
