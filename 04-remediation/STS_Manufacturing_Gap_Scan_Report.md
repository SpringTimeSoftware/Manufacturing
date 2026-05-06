# STS Manufacturing ERP — Gap Scan Report

## Summary

I scanned the current design pack, especially these artifacts:

- `00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `00-blueprint/db_entities.csv`
- `00-blueprint/api_inventory.csv`
- `00-blueprint/screen_inventory.csv`
- prompts `P018`, `P019`, `P020`, `P021`, `P026`, `P087`, `P089`

### Count

Using a **manufacturing-ERP v1 baseline** (excluding HR/payroll/full accounting), the current pack has:

- **14 hard omissions**
- **11 serious under-modeled areas**
- **25 critical gaps total**

This means the current pack is a **strong manufacturing execution foundation**, but **not yet a complete ERP foundation**.

## What is already strong

The current pack is strong in these areas:

- multi-company / branch / warehouse / bin structure
- measurement profiles, UOM classes, conversions, mixed-unit manufacturing
- item variants and barcode basics
- BOM, revisions, ECO, routings, alternate items
- MPS / MRP / BOQ requirements / capacity planning
- work orders, job cards, machine board, occupancy calendar
- production receipt, scrap, rework, downtime, shift handover
- inspections, holds, NCR, dispatch, role dashboards
- email / WhatsApp / SMS / AI provider wiring

## Hard omissions (must be added before architecture freeze)

| # | Gap | Why it is critical | Current evidence |
|---|---|---|---|
| 1 | **Item media / image / product document model** | ERP item master today needs images, spec sheets, certificates, manuals, drawings, and controlled document linking. Generic attachments are not enough. | `db_entities.csv` has `Attachments` only; no `ItemMedia`, `ItemDocument`, `MediaAsset`. |
| 2 | **Product catalog domain** | Operational item master and commercial catalog must be separate. Same item may appear in multiple catalogs/channels/languages with different images, copy, pack sizes, and visibility. | No `Catalog`, `CatalogItem`, `CatalogMedia`, or catalog screen/API. |
| 3 | **Pricing engine / price lists** | Quotes, sales orders, and customer-specific pricing cannot scale without a pricing layer. | No `PriceList`, `PriceRule`, pricing API, or pricing screens. |
| 4 | **Discount / scheme engine** | Customer, item-group, slab, promotional, and validity-based discounts are basic ERP needs. | No `DiscountRule`, `DiscountBreak`, scheme/promo model. |
| 5 | **Customer commercial control** | Credit limit, credit days, temporary override, exposure, and order hold rules are core ERP controls even without full accounting. | No customer credit entity; `P020` models only `Customers` and `CustomerAddresses`. |
| 6 | **Partner contact & contact-point model** | Customers and suppliers need multiple contacts by role with phones, emails, WhatsApp, designation, default flags. | No `Contact`, `ContactPoint`, `CustomerContactRole`, `SupplierContactRole`. |
| 7 | **Communication preference / consent model** | Required for email/WhatsApp/SMS to work correctly per contact and language/channel. | No communication preference or consent entity despite integration scope. |
| 8 | **Commercial tax / currency / trade-term model** | Even if full accounting is deferred, quotes, SO, PO, and shipment documents still need tax classes, currencies, and trade terms. | No tax/currency/commercial-term entities or APIs. |
| 9 | **Packaging / pack hierarchy domain** | Manufacturing and dispatch often need inner/outer/case/pallet/roll/coil/box configuration and barcode mapping. | No dedicated packaging entities; only light mentions in blueprint. |
|10 | **Replenishment policy model** | MTS and mixed-mode operations need reorder point, safety stock, min-max, EOQ, lead-time based replenishment policies. | MTS is mentioned in blueprint, but no replenishment entities/screens/APIs are modeled. |
|11 | **Landed cost / purchase charge model** | Real purchase cost needs freight, duty, loading, clearing, and other landed charges. | No landed-cost entity/API/screen. |
|12 | **Purchase return / vendor claim flow** | Supplier rejections and returns are basic procurement control. | No vendor-return entity/screen/API. |
|13 | **Sales return / exchange / backorder / drop-ship flow** | Commercial order control is incomplete without these. | No sales-return, backorder, exchange, or drop-ship domain. |
|14 | **Custom-field / UDF / metadata extensibility** | ERP without extensibility breaks on real customer rollout because every plant wants a few extra fields/workflows. | No UDF/custom-field schema or prompt. |

## Serious under-modeled areas (must be redesigned in Architecture v2)

| # | Area | Why it is weak now | Current evidence |
|---|---|---|---|
| 1 | **Customer master split** | Customer should separate legal entity, customer site, bill-to, ship-to, and possibly branch/location. | Current model only shows `Customers` + `CustomerAddresses`. |
| 2 | **Supplier master depth** | Supplier needs terms, categories, compliance, contacts, scorecards, approvals, and preferred-item mapping. | Current model is `Suppliers`, `SupplierAddresses`, `SupplierLeadTimes`; `W047` says “performance placeholders.” |
| 3 | **Item master depth** | Item editor is not yet ERP-grade; it lacks explicit product-data structure, compliance fields, storage/handling, and commercial attributes. | `W041` says “costing placeholders”; item schema prompts cover only core master, variants, UOM, barcodes. |
| 4 | **Customer-specific item references / aliases** | Many manufacturers sell the same item under customer part numbers and customer drawings. | No entity for customer item codes/aliases. |
| 5 | **Inventory valuation and costing** | ERP needs valuation/costing strategy clarity, not only placeholders. | Inventory API/screen mention valuation placeholders only; no costing model or methods. |
| 6 | **Job costing / work-order cost rollup** | Quote-vs-actual and profitability need labor/material/overhead rollups. | Estimate exists, but no explicit job-costing/work-order-cost structure. |
| 7 | **CRM-lite / lead-opportunity-thread model** | Even a manufacturing ERP usually needs lead/opportunity/contact-thread continuity before quote/order. | No lead/opportunity/email-thread domain despite reference docs and quote screens. |
| 8 | **Dispatch commercial detail** | Carrier preference, service level, labeling rules, pack instructions, customer dispatch preferences are thin. | Shipment exists, but commercial shipping preference model is missing. |
| 9 | **Quality CAPA / deviation / root-cause depth** | NCR alone is not enough for a real quality loop. | Quality covers inspection + NCR, but no CAPA/deviation/root-cause structure. |
|10 | **Document / print template management** | ERP needs configurable print/document layouts beyond a generic attachment viewer. | Print/export exists, but no document-template model is defined. |
|11 | **CTO / configurator / rules-based order engineering** | Variants exist, but rules-based configuration for CTO/ETO is not modeled. | Current pack supports variants and estimates, but no configurator domain. |

## Gaps explicitly visible from prompts

### Item prompts
- `P018` only asks for `ItemGroups`, `ItemAttributes`, `ItemAttributeValues`, and `Items`.
- `P019` only adds `ItemVariants`, `ItemUoms`, and `ItemBarcodes`.
- `P087` calls W041 a “Full item master including measurement, stock, QC, costing placeholders”.

### Customer / supplier prompts
- `P020` only designs `Customers` and `CustomerAddresses`.
- `P021` only designs `Suppliers`, `SupplierAddresses`, and `SupplierLeadTimes`.
- `P089` describes customer and supplier screens with “contacts, addresses, communication log” and supplier “performance placeholders”, which confirms the model is still shallow.

### Commercial scope
- `P026` covers quotes, sales orders, blanket orders, and forecasts, but does **not** introduce price lists, discount structures, tax/currency blocks, credit checks, or payment terms.

## Conclusion

The current pack is **good enough to build a production-demo system**.

It is **not yet good enough to freeze as ERP architecture**.

The safest next move is:

1. stop further implementation on item/customer/commercial areas,
2. redesign **Master Data v2 + Commercial v2 + Setup v2**, and
3. regenerate DB/API/screen prompts from that corrected base.
