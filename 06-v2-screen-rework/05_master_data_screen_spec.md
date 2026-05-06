# Master Data Screen Specification

## Master Data Rework Verdict

Master data is the most critical V2 rework area. A 4-field item form is unacceptable. Item, customer, supplier, pricing, discount, tax, currency, packaging, catalog, contact, compliance, and replenishment depth must be corrected before expanding production receipt, scrap, rework, landed cost, returns, or inventory-cost flows.

## Item Master Required Structure

The Item Detail / Editor must be rebuilt as a deep tabbed ERP record with the following minimum tabs.

| Tab | Required Content | Required Actions And Validation |
| --- | --- | --- |
| Core Info | Item code, item name, short name, description, lifecycle status, item type, make/buy/subcontract flag, stock/non-stock flag, company/branch scope, owner, active dates. | Validate unique code, required name/type, status transition rules, and activation blockers. |
| Classification | Item group, subgroup, category, attributes, tags, product family, reporting bucket, material grade, business segment. | Require valid category hierarchy before activation. |
| Images & Media | Primary image, gallery, thumbnails, drawing preview, production photo examples. | Upload, reorder, set primary, retire media; validate file type/size and permission. |
| Catalog | Catalog visibility, catalog title, section, marketing description, customer-visible specs, publish status, effective dates. | Publish/unpublish, preview catalog, validate required media/specs for visible catalog items. |
| UOM & Conversions | Base UOM, purchase UOM, sales UOM, production UOM, stock UOM, conversion rules, catch-weight profile. | Prevent conflicting conversions and require measurement profile compatibility. |
| Packaging | Pack size, inner/outer/carton/pallet, packaging UOM, net/gross weight, dimensions, label count, packing instructions. | Validate dimensions, weight UOM, and dispatch label dependencies. |
| Physical Specs | Length, width, height, thickness, GSM, density, color, finish, grade, tolerance, shelf life, storage condition. | Validate spec ranges and required specs by item category. |
| Barcode & Labels | GTIN/internal barcode, customer barcode, supplier barcode, label templates, scan rules, lot/serial requirement. | Unique barcode, scan rule compatibility, label preview. |
| Variants/Templates | Variant dimensions, option values, generated SKUs, template inheritance, alias codes. | Generate variants, lock inherited fields, validate duplicate variant combinations. |
| Manufacturing | BOM policy, routing policy, issue method, scrap allowance, operation linkage, tooling/resource requirements. | Cannot release manufactured item without approved BOM/routing where required. |
| Planning/Replenishment | MRP enabled, planning method, safety stock, reorder point, min/max, lead time, lot size, ABC class, forecast consumption. | Validate planning settings by make/buy type and warehouse policy. |
| Inventory/Warehouse Policy | Default warehouse/bin, QC hold required, serial/lot/catch-weight tracking, negative stock policy, expiry policy. | Tracking rules must be immutable after stock exists unless migrated. |
| Quality/Traceability | QC plan, inspection required flags, certificate requirements, traceability depth, sample size, hold rules. | Require QC plan for regulated categories before activation. |
| Sales/Commercial | Sale enabled, price group, minimum order quantity, sales UOM, tax category, discount eligibility, customer catalog flag. | Block sale if commercial setup missing for sellable items. |
| Purchase/Vendor | Buy enabled, preferred supplier, approved supplier list, purchase lead time, purchase UOM, MOQ, supplier compliance requirements. | Block purchase from non-approved supplier when policy is enforced. |
| Customer References | Customer item numbers, drawings, revision, packaging/spec overrides, approved customer status. | Validate customer references are scoped and revision-controlled. |
| Attachments/Documents | Drawings, spec sheets, certificates, manuals, inspection instructions, photos, customer/supplier docs. | Version, approve, expire, and audit documents. |
| Audit/History | Change history, status history, approval trail, linked transactions, last used info. | Show actor, timestamp, changed fields, and source action. |

## Master Screen Specifications

| Screen | Required Depth | Current Gap | Rework Level | Acceptance Criteria |
| --- | --- | --- | --- | --- |
| Item List | Saved views, filters by status/group/type/make-buy/warehouse/QC/commercial flag, KPI strip, bulk actions, export, active blockers. | Current list is useful but not dense enough for full item governance. | DEEP | Planner can find blocked, incomplete, unapproved, stocked, purchased, and manufactured items quickly. |
| Item Detail / Editor | Full tabbed structure listed above. | Current editor is far below V2 depth. | REBUILD | Item can drive BOM, route, MRP, inventory, QC, sales, purchase, catalog, labels, and traceability without side spreadsheets. |
| Item Group/Subgroup | Hierarchical taxonomy, defaults, required attributes, planning/QC/commercial defaults, reporting codes. | Basic category setup only. | MEDIUM | Activating a group can enforce field requirements and defaults on item records. |
| Item Attributes | Attribute library with data type, units, allowed values, required-by-category rules, variant dimension flag. | Basic attributes only. | MEDIUM | Attributes power variant generation and item spec validation. |
| Item Variants/Templates | Matrix generator, inherited template fields, variant overrides, status, generated SKU review. | Basic matrix concept exists. | DEEP | Generated variants are unique, reviewable, and linked to parent template. |
| Item Aliases | Internal aliases, legacy codes, customer codes, supplier codes, barcode aliases, effective dates. | Not first-class. | DEEP | Search and transactions can resolve approved aliases without ambiguity. |
| Item Barcodes | Barcode types, label templates, scan behavior, print preview, customer/supplier barcodes, uniqueness rules. | Barcode screen exists but needs label and scan depth. | DEEP | Store/production/mobile scans validate item, UOM, lot/serial, and transaction context. |
| Item Packaging | Pack hierarchy, dimensions, weight, dispatch instructions, label count, palletization. | Missing or shallow. | DEEP | Dispatch and catalog can use packaging without manual notes. |
| Item Physical Specs | Dimensional/material properties with validation by item group. | Missing or scattered. | DEEP | Specs are searchable, printable, and validated against category rules. |
| Item Images/Media/Gallery | Primary image, gallery, drawings, preview, thumbnails, media status. | Missing production-grade media management. | DEEP | Item record has approved media for catalog, QC, production, and dispatch. |
| Item Documents/Spec Sheets/Certificates/Manuals | Versioned documents, expiry, approval, customer/supplier visibility. | Attachment concept exists but not deep item document lifecycle. | DEEP | Documents can be linked, versioned, expired, and audited. |
| Product Catalog | Catalog sections, customer visibility, media, specs, publish workflow. | Missing. | REBUILD | Catalog-ready items can be published without exposing internal fields. |
| Catalog Sections | Hierarchy, ordering, visibility, SEO/display name where applicable. | Missing. | MEDIUM | Catalog navigation is controlled by admin, not item free text. |
| Catalog Visibility | Internal/external/customer-specific visibility and effective dates. | Missing. | MEDIUM | Users can control what appears for sales/customer contexts. |
| Catalog Media | Gallery rules, hero image, spec downloads, document visibility. | Missing. | MEDIUM | Catalog views use approved item media and docs. |
| Customer Item References | Customer SKU, drawing, revision, packaging/spec overrides, approval state. | Missing/deferred from V2 gaps. | DEEP | Sales orders and dispatch labels can show customer-specific references. |
| Vendor Item References | Vendor SKU, lead time, MOQ, supplier specs, compliance docs, approved status. | Partial supplier lead-time matrix only. | DEEP | Procurement can use supplier-specific item codes and constraints. |
| Customer Master | Legal identity, GST/tax, segments, status, credit profile, contacts, bill-to/ship-to, terms, preferences, documents. | Current customer detail is shallow. | REBUILD | Customer can drive orders, credit warnings, delivery addresses, contact workflows, and catalog visibility. |
| Customer Sites/Bill-to/Ship-to | Site type, address, tax region, contact, dispatch restrictions, default warehouse/route. | Needs first-class site model in UI. | DEEP | Sales and dispatch can pick validated addresses without free text. |
| Customer Contacts/Contact Points | People, roles, email/phone/WhatsApp, consent, escalation rules, active status. | Contact model insufficient. | DEEP | Notifications and approvals use valid contact points. |
| Customer Credit Profile | Credit limit, hold rules, overdue flags, payment terms, approval override. | Full accounting excluded, but credit controls needed. | DEEP | Sales/order promises show credit warning without implementing accounting ledger. |
| Customer Terms/Preferences | Incoterms/trade terms, delivery windows, document requirements, labels, packaging preferences. | Missing/shallow. | DEEP | Dispatch and sales use customer preferences without manual notes. |
| Supplier Master | Legal identity, categories, status, approved branches, terms, compliance, performance, contacts, addresses. | Current supplier detail is shallow. | REBUILD | Supplier can drive PR/PO, lead time, compliance checks, and sourcing. |
| Supplier Addresses/Sites | Site type, branch/service region, dispatch/return address, tax region. | Needs deeper site handling. | DEEP | Procurement can select valid supplier site by item/category/branch. |
| Supplier Contacts/Contact Points | Contact roles, communication channels, escalation, consent/status. | Missing depth. | DEEP | PO follow-up and compliance reminders use approved contact points. |
| Supplier Lead Times | Lead time by supplier/item/category/branch, MOQ, reliability, effective dates. | Matrix exists; needs richer governance and versioning. | MEDIUM | MRP/procurement can select lead time by active rule. |
| Supplier Compliance Docs | Certifications, expiry, audit status, category requirements, attachments. | Missing production-grade compliance. | DEEP | Supplier cannot be approved for restricted categories without valid docs. |
| Price Lists | Price list header/lines, currency, UOM, customer segment, effective dates, approval. | Missing/deferred. | REBUILD | Quotes/orders use approved price lists rather than manual entry. |
| Discount Rules/Schemes | Discount type, quantity breaks, customer/item applicability, approval limits. | Missing/deferred. | REBUILD | Discounts are validated and auditable. |
| Tax/Currency/Trade Terms | Tax category, currency, exchange-rate source placeholder, trade term, taxable flags. | Missing/deferred. | DEEP | Commercial screens do not finalize without approved tax/currency/trade term setup. |

## API And DB Implications

- Existing item/customer/supplier compatibility APIs are not enough for V2 master depth.
- Required additions include item media, item documents, item catalog, item aliases, packaging, physical specs, customer sites, contact points, credit profile, terms/preferences, supplier compliance, supplier references, price lists, discount rules, tax/currency, and trade-term tables.
- All additions must be additive and compatibility-safe, preserving current manufacturing execution dependencies.
