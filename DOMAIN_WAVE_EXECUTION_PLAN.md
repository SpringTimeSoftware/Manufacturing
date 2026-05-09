# DOMAIN_WAVE_EXECUTION_PLAN

## Purpose
This plan turns the current repo state into a finishable execution program. It is built from the current feature inventory, SRS traceability matrix, page-by-page gap matrix, issue register, action-truth matrix, and field-governance registry.

## Operating model
- Execute one wave at a time on `main` unless a short-lived lane branch is explicitly needed for conflict-heavy work.
- A wave is not complete if any touched visible action is dead.
- A wave is not complete if any touched governed master-linked field remains free text where a source exists.
- A wave is not complete if any touched numeric/decimal/money field remains a generic text box.
- A wave is not complete if screenshot evidence and review-pack zip are missing.

## Current domain status summary
| Domain | Screens | Complete | Partial | Blocked | Missing | Demo-only | Critical issues | Recommended wave |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| AI | 4 | 0 | 0 | 0 | 4 | 0 | 0 | Wave 8 Integrations/AI/Reporting |
| Commercial | 3 | 0 | 3 | 0 | 0 | 0 | 0 | Wave 4 Master/Partner/Commercial Completion |
| Dispatch | 3 | 0 | 3 | 0 | 0 | 0 | 0 | Wave 6 Production/Inventory/Quality/Dispatch |
| Engineering | 8 | 0 | 8 | 0 | 0 | 0 | 3 | Wave 5 Engineering/Planning Completion |
| Integrations | 3 | 0 | 2 | 1 | 0 | 0 | 0 | Wave 8 Integrations/AI/Reporting |
| Inventory | 7 | 0 | 7 | 0 | 0 | 0 | 0 | Wave 6 Production/Inventory/Quality/Dispatch |
| Master Data | 7 | 0 | 5 | 0 | 0 | 2 | 2 | Wave 4 Master/Partner/Commercial Completion |
| Measurements | 3 | 0 | 3 | 0 | 0 | 0 | 0 | Wave 3 Org/Resource/Measurement |
| Mobile | 15 | 0 | 2 | 0 | 0 | 13 | 0 | Wave 7 Mobile Live Execution Hardening |
| Organization | 6 | 0 | 5 | 1 | 0 | 0 | 6 | Wave 3 Org/Resource/Measurement |
| Partners | 5 | 0 | 1 | 4 | 0 | 0 | 5 | Wave 4 Master/Partner/Commercial Completion |
| Planning | 8 | 0 | 8 | 0 | 0 | 0 | 3 | Wave 5 Engineering/Planning Completion |
| Platform | 15 | 1 | 13 | 0 | 1 | 0 | 0 | Wave 2 Platform/Admin/Security completed; remaining depth stays backlog |
| Procurement | 3 | 0 | 3 | 0 | 0 | 0 | 2 | Wave 6 Production/Inventory/Quality/Dispatch |
| Production | 11 | 0 | 4 | 3 | 0 | 4 | 0 | Wave 6 Production/Inventory/Quality/Dispatch |
| Quality | 5 | 0 | 5 | 0 | 0 | 0 | 0 | Wave 6 Production/Inventory/Quality/Dispatch |
| Release | 1 | 1 | 0 | 0 | 0 | 0 | 0 | Wave 9 Final Release Gates |
| Reports | 1 | 0 | 1 | 0 | 0 | 0 | 0 | Wave 8 Integrations/AI/Reporting |
| Resources | 3 | 0 | 0 | 0 | 3 | 0 | 0 | Wave 3 Org/Resource/Measurement |
| Sales | 5 | 0 | 4 | 0 | 0 | 1 | 2 | Wave 4 Master/Partner/Commercial Completion |
| Tests | 3 | 0 | 3 | 0 | 0 | 0 | 0 | Wave 9 Final Release Gates |

## Wave 0 — Runtime proof and seed truth baseline

**Why now:** Repair role-critical endpoint failures, remove silent fake live fallbacks, and prove localhost/UAT runtime truth before deeper workflow claims.

### Required gates
- No dead visible actions on touched screens
- All touched governed fields use correct governed controls
- All touched numeric fields use numeric/decimal/money controls
- Live mode does not silently fall back to seeded operational data
- Validation passes
- Screenshot evidence captured (max 3 per scrollable screen)
- Review pack zip created


## Wave 1 — Platform/Admin/Security completion

**Why now:** Finish auth/session/device trust, audit viewer, approvals, notifications, workflow/numbering, tenant/language setup, rate limiting, and attachment authorization truth.

### Required gates
- No dead visible actions on touched screens
- All touched governed fields use correct governed controls
- All touched numeric fields use numeric/decimal/money controls
- Live mode does not silently fall back to seeded operational data
- Validation passes
- Screenshot evidence captured (max 3 per scrollable screen)
- Review pack zip created


## Wave 2 — Organization/Resource/Measurement completion

**Why now:** Complete company/branch/warehouse/bin/shift/work-center/machine/tool setup, measurement classes, UOM conversions, profiles, and all lookup-source truth.

### Required gates
- No dead visible actions on touched screens
- All touched governed fields use correct governed controls
- All touched numeric fields use numeric/decimal/money controls
- Live mode does not silently fall back to seeded operational data
- Validation passes
- Screenshot evidence captured (max 3 per scrollable screen)
- Review pack zip created


## Wave 3 — Master/Partner/Commercial completion

**Why now:** Complete item/customer/supplier, price lists, discount schemes, tax/currency/terms, partner references, document truth, and commercial persistence.

### Required gates
- No dead visible actions on touched screens
- All touched governed fields use correct governed controls
- All touched numeric fields use numeric/decimal/money controls
- Live mode does not silently fall back to seeded operational data
- Validation passes
- Screenshot evidence captured (max 3 per scrollable screen)
- Review pack zip created


## Wave 4 — Engineering/Planning completion

**Why now:** Finish BOM/routing/ECO/alternate-item authoring, engineering documents, MPS/MRP/BOQ/capacity actions, and planner workflow truth.

### Required gates
- No dead visible actions on touched screens
- All touched governed fields use correct governed controls
- All touched numeric fields use numeric/decimal/money controls
- Live mode does not silently fall back to seeded operational data
- Validation passes
- Screenshot evidence captured (max 3 per scrollable screen)
- Review pack zip created


## Wave 5 — Production/Inventory/Quality/Dispatch completion

**Why now:** Finish work orders/job cards/material issue/return/transfer/receipt/scrap/rework/QC/NCR/dispatch/pack/proof with truthful posting and evidence.

### Required gates
- No dead visible actions on touched screens
- All touched governed fields use correct governed controls
- All touched numeric fields use numeric/decimal/money controls
- Live mode does not silently fall back to seeded operational data
- Validation passes
- Screenshot evidence captured (max 3 per scrollable screen)
- Review pack zip created


## Wave 6 — Mobile live execution hardening

**Why now:** Replace seeded mobile behavior with live assignment, guarded offline replay, media upload truth, and conflict-safe sync.

### Required gates
- No dead visible actions on touched screens
- All touched governed fields use correct governed controls
- All touched numeric fields use numeric/decimal/money controls
- Live mode does not silently fall back to seeded operational data
- Validation passes
- Screenshot evidence captured (max 3 per scrollable screen)
- Review pack zip created


## Wave 7 — Integrations/AI/Reporting completion

**Why now:** Complete provider admin, import/export repair, AI safety review flows, report catalog, print/template governance, and delivery adapters.

### Required gates
- No dead visible actions on touched screens
- All touched governed fields use correct governed controls
- All touched numeric fields use numeric/decimal/money controls
- Live mode does not silently fall back to seeded operational data
- Validation passes
- Screenshot evidence captured (max 3 per scrollable screen)
- Review pack zip created


## Wave 8 — Release/UAT/pilot gates

**Why now:** Run full smoke/UAT/security/release pack, close remaining blockers, and classify demo/UAT/pilot readiness honestly.

### Required gates
- No dead visible actions on touched screens
- All touched governed fields use correct governed controls
- All touched numeric fields use numeric/decimal/money controls
- Live mode does not silently fall back to seeded operational data
- Validation passes
- Screenshot evidence captured (max 3 per scrollable screen)
- Review pack zip created


## Domain-by-domain completion checklist

### Platform
- Login/reset/context switch
- Notifications/approvals/audit viewer
- Users/roles/permissions
- Language/workflow/numbering/tenant
- Attachment authorization and admin exports

### Organization
- Company/branch/department
- Warehouse/bin/shift calendars
- Lookup-source truth and tax/legal metadata

### Resources
- Work centers
- Machines
- Tools/resources
- Operator assignment rules

### Measurements
- UOM classes
- UOM conversions
- Measurement profiles
- Decimal precision and formula truth

### Master Data
- Items, variants, barcodes
- Item categories/attributes/reason codes
- Upload/media truth
- Category/UOM/warehouse lookup truth

### Partners
- Customers
- Suppliers
- Supplier lead times
- Sites/contacts/documents/audit

### Commercial
- Price lists
- Discount schemes
- Tax/currency/terms
- Commercial linkage into item/customer/supplier

### Sales
- Quotes/orders/contracts/forecast/ATP
- Draft/create/save/convert/release truth

### Engineering
- BOM
- Routing
- ECO
- Alternate items
- Engineering documents

### Planning
- MPS
- MRP
- BOQ
- Capacity
- Order delivery / stage dashboards

### Production
- Work orders
- Job cards
- Shift production
- Production receipts
- Scrap/rework/downtime

### Inventory
- Balances
- Material issue/return/transfer
- Cycle count
- Traceability

### Quality
- QC plans
- Inspections
- NCR/hold/release

### Dispatch
- Pack lists
- Dispatch planning
- Shipment/delivery
- Proof and print pack

### Procurement
- PR/PO/Subcontract
- Lead-time and outside-processing truth

### Mobile
- Live login/context
- Assignments
- Execution actions
- Offline queue/media/upload truth

### AI
- Provider setup
- Prompt templates
- Operational assistant
- Review workflows

### Integrations
- Email/SMS/WhatsApp
- Import/export
- Webhook/provider health

### Reports
- Print pack/travelers/labels
- Report catalog / exports

### Release
- Smoke/UAT/security/release readiness
- review-pack automation
