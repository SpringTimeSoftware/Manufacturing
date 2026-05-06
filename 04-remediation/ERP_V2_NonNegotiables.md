# ERP V2 Non-Negotiables

## Product / Item / Catalog
- Item master must support media, drawings, documents, certificates, manuals, and multilingual descriptions.
- Operational item master must be separate from commercial catalog.
- Catalog must support channel/customer visibility, language, image sets, brochures, and effective dates.
- Support pack hierarchy, barcodes, UOM conversions, dimensions, weights, and variant/attribute modeling.
- Support customer item aliases and vendor item references.

## Customer / Supplier / Contact
- Customer must be split into legal entity, bill-to, ship-to, site/location, and branch where needed.
- Supplier must support compliance, scorecard, terms, preferred item mappings, and contacts.
- Contacts must support role, phone, email, WhatsApp, designation, default flags, preferred language, preferred channel, and consent.

## Commercial
- Separate pricing engine with price list, price rule, customer-specific pricing, item-group pricing, UOM-aware pricing, currency, validity periods.
- Separate discount engine with slabs, schemes, promos, stacking/precedence rules, and customer/channel scope.
- Customer commercial controls must include credit limit, temporary extra limit, credit days, hold-on-order rules, risk class, and override approvals.
- Include tax class, currency, incoterms/trade terms, payment terms, and dispatch preferences.

## Inventory / Purchasing / Logistics
- Packaging hierarchy must support inner, outer, case, pallet, bundle, roll, coil, and customer-specific pack instructions.
- Replenishment model must support safety stock, reorder point, min-max, EOQ, and lead-time based rules.
- Purchase flow must support landed cost and vendor returns/claims.
- Sales flow must support returns, exchanges, backorders, and drop-ship.

## Platform / Extensibility
- UDF/custom field framework is mandatory.
- Document/print-template framework is mandatory.
- Multi-company, branch, warehouse, bin, language, localization, and role-scoped access remain mandatory.
- IIS publish-folder deployment model remains mandatory.

## Manufacturing continuity
- Existing BOM / MRP / WO / Job Card / QC / Dispatch / Dashboard work must be preserved and retrofitted, not discarded.
