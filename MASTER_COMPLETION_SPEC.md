# MASTER_COMPLETION_SPEC

## What this pack is
This pack is the exhaustive completion contract for the current Manufacturing ERP project. It is built from the live feature inventory, V2 SRS traceability matrix, page-by-page gaps, field governance, action truth, and issue register.

It is designed to prevent the project from drifting into screen-by-screen patching.

## Current baseline
- Feature inventory rows: 117
- V2 traceability requirements: 81
- Page-by-page rows: 119
- Action registry rows: 263
- Governed field registry rows: 111

## Non-negotiable truths
1. No visible action may remain dead.
2. Governed master-linked values must use governed lookup/select/search controls where source exists.
3. Numeric/decimal/money/quantity/time/weight/dimension values must use governed numeric controls.
4. Live authenticated mode must not silently show fake seeded operational data.
5. Deep editors must use centered modal or full-page workspace; no right-drawer deep editors.
6. Upload/media/document actions may only be active when the workflow really exists.
7. Every wave must produce screenshot evidence and a review-pack zip.

## Completion state definitions
- COMPLETE: UI, backend, DB, action-truth, field-truth, and proof all exist.
- PARTIAL: surface exists but one or more truth dimensions are incomplete.
- BLOCKED: route exists but backend/data/workflow truth is absent.
- DEMO-ONLY: seeded or static behavior only; not trustworthy live behavior.
- MISSING: route/screen/workflow not present.

## How to use this spec
- Use `SCREEN_COMPLETION_MATRIX.csv` to decide which screens enter the next wave.
- Use `MASTER_FIELD_REGISTRY.csv` to enforce the correct field control types.
- Use `MASTER_ACTION_REGISTRY.csv` to enforce action truth.
- Use `DOMAIN_WAVE_EXECUTION_PLAN.md` for execution order.

## Detailed domain completion contract

### Platform

Current screens/features: 15

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Login | /login; /api/auth/login | PARTIAL | Web route exists; production copy improved; mobile still demo-like | Partial API backed | Partial bootstrap identity and role mirror | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Forgot Password / Reset | /forgot-password; /api/auth/forgot-password | PARTIAL | Route exists but reset depth shallow | Partial API backed | Partial reset/provider tables | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Context Switch | /platform/context-switch; /api/auth/switch-context | PARTIAL | Route exists | Live API backed except warehouse preference depth | Exists/partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Notification Center | /platform/notifications; /api/notifications | PARTIAL | Route exists | Live API backed | Exists | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Approval Workbench | /platform/approvals; /api/approvals | PARTIAL | Route exists | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| User Management | /platform/users; /api/users | PARTIAL | Route exists; many actions disabled | Partial API backed | Partial | Many disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Role And Permission Matrix | /platform/roles; /api/roles | PARTIAL | Route exists; many actions disabled | Partial API backed | Partial | Many disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Language And Translation Setup | /platform/translations; /api/localization/resources | PARTIAL | Route exists | Partial API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Workflow And Numbering Setup | /platform/workflow-numbering; /api/settings/workflow-rules | PARTIAL | Route exists; write actions shallow | Partial API backed | Partial | Disabled where not safe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Tenant Settings | /platform/tenant-settings; /api/settings/tenant-settings | PARTIAL | Route exists | Partial API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Platform Settings | /platform/settings | PARTIAL | Route exists | Partial API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Attachment Viewer | /platform/attachments; /api/attachments | DEMO-ONLY | Route exists but document lifecycle is demo-like | Partial/fallback backed | Partial/missing document-control depth | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Global Search | /search; /api/search | MISSING | No route | No API | Missing search index/read model | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Audit Trail Viewer | /platform/audit; /api/audit | MISSING | No route | No first-class API | Audit write exists but read model incomplete | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Health Checks | /api/health/live; /api/health/ready | COMPLETE | No dedicated screen required | Live endpoints exist | nan | nan | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Login/reset/context switch
- Notifications/approvals/audit viewer
- Users/roles/permissions
- Language/workflow/numbering/tenant
- Attachment authorization and admin exports

### Organization

Current screens/features: 6

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Company Master | /organization/companies; /api/companies | PARTIAL | Route exists; shallow setup page | Live API backed | Partial | Large action set disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Branch Master | /organization/branches; /api/branches | PARTIAL | Route exists; shallow setup page | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Department Master | /organization/departments; /api/departments | PARTIAL | Route exists | Live API backed | Exists | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Warehouse Master | /organization/warehouses; /api/warehouses | BLOCKED | Route exists | UAT recorded HTTP 500 despite audit listing live API | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Bin Master | /organization/bins; /api/bins | PARTIAL | Route exists | Live API backed | Exists/partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Shift Calendar | /organization/shifts; /api/shifts | PARTIAL | Route exists | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Company/branch/department
- Warehouse/bin/shift calendars
- Lookup-source truth and tax/legal metadata

### Resources

Current screens/features: 3

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Work Center Master | /resources/work-centers; /api/work-centers | MISSING | No web route | API exists | Partial | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Machine Master | /resources/machines; /api/machines | MISSING | No web route | API exists | Partial | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Tool / Die / Mould Master | /resources/tools; /api/tools | MISSING | No web route | API exists | Partial | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Work centers
- Machines
- Tools/resources
- Operator assignment rules

### Measurements

Current screens/features: 3

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UOM Class Master | /measurements/uom-classes; /api/uom/classes | PARTIAL | Route exists | Live API backed | Exists | One action disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| UOM Conversion Master | /measurements/uom-conversions; /api/uom/conversions | PARTIAL | Route exists | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Measurement Profile Master | /measurements/profiles; /api/measurement-profiles | PARTIAL | Route exists | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- UOM classes
- UOM conversions
- Measurement profiles
- Decimal precision and formula truth

### Master Data

Current screens/features: 7

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Item Group / Category Master | /masters/item-groups | PARTIAL | Route exists; shallow/fallback | Partial API backed | Partial | Several disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Item Attribute Master | /masters/item-attributes | PARTIAL | Route exists; shallow/fallback | Partial API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Reason Codes & Status Rules | /masters/reason-codes | PARTIAL | Route exists; shallow/fallback | Partial API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Item List | /masters/items; /api/items | DEMO-ONLY | Route exists; demo-like depth | Live/partial API backed | Partial V2 extensions | Many disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Item Detail / Editor | /masters/items; /api/items | DEMO-ONLY | Deepened but still not full V2 ERP editor | Partial API backed | Partial V2 extensions | Many disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Item Variant Matrix | /masters/item-variants; /api/item-variants | PARTIAL | Route exists | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Barcode / Label Setup | /masters/barcodes; /api/item-barcodes | PARTIAL | Route exists | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Items, variants, barcodes
- Item categories/attributes/reason codes
- Upload/media truth
- Category/UOM/warehouse lookup truth

### Partners

Current screens/features: 5

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Customer List | /partners/customers; /api/customers | BLOCKED | Route exists; demo-like | UAT recorded HTTP 500 for customers | Partial V2 partner tables | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Customer Detail | /partners/customers; /api/customers | BLOCKED | Route exists; demo-like | Partial API backed; UAT failure recorded | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Supplier List | /partners/suppliers; /api/suppliers | BLOCKED | Route exists; demo-like | UAT recorded HTTP 500 for suppliers | Partial V2 partner tables | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Supplier Detail | /partners/suppliers; /api/suppliers | BLOCKED | Route exists; demo-like | Partial API backed; UAT failure recorded | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Supplier Lead Time Matrix | /partners/supplier-lead-times; /api/supplier-lead-times | PARTIAL | Route exists; many actions disabled | Live API backed | Partial | Many disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Customers
- Suppliers
- Supplier lead times
- Sites/contacts/documents/audit

### Commercial

Current screens/features: 3

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Price Lists | /commercial/price-lists; commercial APIs | PARTIAL | Route exists; action-limited | API exists | Commercial tables exist/partial | Many disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Discount Schemes | /commercial/discount-schemes; commercial APIs | PARTIAL | Route exists | API exists | Commercial tables exist/partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Tax, Currency, Terms | /commercial/tax-currency-terms; commercial APIs | PARTIAL | Route exists | API exists | Commercial tables exist/partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Price lists
- Discount schemes
- Tax/currency/terms
- Commercial linkage into item/customer/supplier

### Sales

Current screens/features: 5

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Quote / Estimate | /sales/quotes; /api/quotes | PARTIAL | Route exists; shallow | Live API backed | Partial | Many quote actions disabled via related matrix | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Sales Orders | /sales/orders; /api/sales-orders | PARTIAL | Route exists; shallow | Live API backed | Partial | Many order actions disabled via related matrix | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Blanket Orders | /sales/blanket-orders; /api/blanket-orders | PARTIAL | Route exists; shallow | Live API backed | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Demand Forecast | /sales/forecasts; /api/forecasts | PARTIAL | Route exists; shallow | Live API backed | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Available To Promise | /sales/available-to-promise | DEMO-ONLY | Route exists but shallow/fallback | Partial API backed | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Quotes/orders/contracts/forecast/ATP
- Draft/create/save/convert/release truth

### Engineering

Current screens/features: 8

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BOM Library | /engineering/boms; /api/boms | PARTIAL | Route exists; strengthened but still partial | Live API backed | Exists | Many unsupported actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| BOM Detail / Editor | /engineering/bom-editor; /api/boms | PARTIAL | Route exists; editor exists | Live API backed | Exists/partial | Working save paths plus disabled unsafe actions | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| BOM Comparison | /engineering/bom-comparison | PARTIAL | Route exists | Partial API backed | Partial | Export disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| ECO / Revision Control | /engineering/eco-revisions; /api/engineering-changes | PARTIAL | Route exists | Live API backed | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Routing Library | /engineering/routings; /api/routings | PARTIAL | Route exists | Live API backed | Partial | Working save paths plus disabled unsafe actions | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Operation Standards | /engineering/operations; /api/operations | PARTIAL | Route exists | Live API backed | Partial | Working save paths plus disabled unsafe actions | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Alternate Items | /engineering/alternate-items; /api/alternate-items | PARTIAL | Route exists | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Engineering Documents | /engineering/documents; /api/attachments | PARTIAL | Route exists; document viewer still partial | Partial/fallback backed | Partial | Audit/open actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- BOM
- Routing
- ECO
- Alternate items
- Engineering documents

### Planning

Current screens/features: 8

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MPS Planner | /planning/mps; /api/mps | PARTIAL | Route exists; shallow | Live API backed | Partial | Many MPS actions disabled via related matrix | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| MRP Run Console | /planning/mrp; /api/mrp | PARTIAL | Route exists; strengthened but partial | Live API backed | Partial | Several run/archive/save actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| MRP Results / Exceptions | /planning/mrp-results; /api/mrp | PARTIAL | Route exists | Live API backed | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| BOQ / Requirements | /planning/boq-requirements; /api/boq-requirements | PARTIAL | Route exists; reference-aligned but partial | Live API backed | Exists | Conversion actions disabled unless real | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Capacity Planning | /planning/capacity; /api/capacity | PARTIAL | Route exists; shallow | Partial API backed | Partial | Several actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Order Delivery Dashboard | /dashboards/order-delivery; /api/dashboards/order-delivery | PARTIAL | Route exists; reference backbone | Live API backed | Partial | Some drill actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Stage Wise Dashboard | /dashboards/stage-wise; /api/dashboards/stage-wise | PARTIAL | Route exists; reference backbone | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Executive Cockpit | /dashboards/executive-cockpit; /api/dashboards/executive-cockpit | PARTIAL | Route exists; shallow | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- MPS
- MRP
- BOQ
- Capacity
- Order delivery / stage dashboards

### Procurement

Current screens/features: 3

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Purchase Requisitions | /procurement/requisitions; /api/purchase-requisitions | PARTIAL | Route exists; shallow | Live API backed | Partial | Many actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Purchase Orders | /procurement/purchase-orders; /api/purchase-orders | PARTIAL | Route exists; shallow | Live API backed | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Subcontract Plan | /procurement/subcontract-plan; /api/subcontract-orders | PARTIAL | Route exists; shallow | Live API backed | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- PR/PO/Subcontract
- Lead-time and outside-processing truth

### Inventory

Current screens/features: 6

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Inventory Balance | /inventory/balances; /api/inventory | PARTIAL | Route exists; shallow | Live API backed | Exists | Many stock actions disabled with reason | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Traceability | /inventory/traceability; /api/traceability | PARTIAL | Route exists; shallow | Live API backed | Partial | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Material Issue | /inventory/material-issue; /api/stock-issues | PARTIAL | Route exists; shallow | Live API backed | Partial | Posting disabled/partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Material Return | /inventory/material-return; /api/stock-returns | PARTIAL | Route exists; shallow | Live API backed | Partial | Posting disabled/partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Stock Transfer / Putaway | /inventory/stock-transfer; /api/stock-transfers | PARTIAL | Route exists; shallow | Live API backed | Exists/partial | Posting/print/save actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Cycle Count | /inventory/cycle-counts; /api/cycle-counts | PARTIAL | Route exists; shallow | Live API backed | Partial | Partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Balances
- Material issue/return/transfer
- Cycle count
- Traceability

### Production

Current screens/features: 10

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Work Orders | /production/work-orders; /api/work-orders | PARTIAL | Route exists; shallow | Live API backed | Exists | Print/export/release review actions often disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Job Cards | /production/job-cards; /api/job-cards | BLOCKED | Route exists; shallow | UAT recorded HTTP 500 | Exists/partial | Many execution actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Machine Board | /production/machine-board; /api/machine-board | BLOCKED | Route exists; shallow | UAT recorded HTTP 500 | Exists/partial | Actions disabled/partial | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Occupancy Calendar | /production/occupancy; capacity APIs | PARTIAL | Route exists; shallow | Partial API backed | Partial | Quick actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Shift Production | /production/shift-production | PARTIAL | Route exists; shallow | Partial/live API backed | Partial | Submit/save disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Downtime Register | /production/downtime; /api/downtime | BLOCKED | Route exists; shallow | UAT recorded HTTP 500 | Exists/partial | Export/RCA/save disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Production Receipt | /production/receipts; /api/production-receipts | DEMO-ONLY | Route exists; demo-like | Live API backed but validation incomplete | Partial | Post/save/print actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Scrap / By-product | /production/scrap-by-products; /api/scrap-rework | DEMO-ONLY | Route exists; demo-like | Live API backed but validation incomplete | Partial | Post/save/export disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Rework Orders | /production/rework-orders; /api/scrap-rework | DEMO-ONLY | Route exists; demo-like | Live API backed but validation incomplete | Partial | Create/release/save disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Machine Status / OEE-lite | /production/machine-status | PARTIAL | Route exists; shallow | Partial API backed | Partial | Export disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Work orders
- Job cards
- Shift production
- Production receipts
- Scrap/rework/downtime

### Quality

Current screens/features: 5

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| QC Plan Setup | /quality/plans; /api/quality/plans | PARTIAL | Route exists; shallow | Live API backed | Partial | Many actions disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Incoming Inspection | /quality/incoming-inspections; /api/quality/inspections | PARTIAL | Route exists; shallow | Live API backed | Partial | Save/release/export disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| In-Process Inspection | /quality/in-process-inspections; /api/quality/inspections | PARTIAL | Route exists; shallow | Live API backed | Partial | Save/release/export disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Final Inspection | /quality/final-inspections; /api/quality/inspections | PARTIAL | Route exists; shallow | Live API backed | Partial | Save/release/export disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| NCR / Deviation | /quality/ncr; /api/quality/ncrs | PARTIAL | Route exists; shallow | Live API backed | Partial | Create/save/release/export disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- QC plans
- Inspections
- NCR/hold/release

### Dispatch

Current screens/features: 3

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pack Lists | /dispatch/pack-lists; /api/dispatch/pack-lists | PARTIAL | Route exists; shallow | Live API backed | Partial | Create/save/print disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Dispatch Planning | /dispatch/planning; /api/dispatch/planning | PARTIAL | Route exists; shallow | Live API backed | Partial | Plan/export disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Shipment / Delivery | /dispatch/shipments; /api/dispatch/shipments | PARTIAL | Route exists; shallow | Live API backed | Partial | Prepare/save/export disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Pack lists
- Dispatch planning
- Shipment/delivery
- Proof and print pack

### Reports

Current screens/features: 1

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Print Pack / Traveler / Labels | /reports/print-pack; /api/reports/* | PARTIAL | Route exists; shallow | Partial API backed | Partial/missing template governance | Disabled where unsafe | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Print pack/travelers/labels
- Report catalog / exports

### Integrations

Current screens/features: 3

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Integration Providers | /api/integrations/providers | BLOCKED | No complete admin UI | API exists but UAT 403 for PlatformAdmin | Partial | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Webhooks | /api/webhooks | PARTIAL | No complete UI | API exists | Partial | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Import/Export | /api/imports; /api/exports | PARTIAL | No complete repair UI | API exists/partial | Partial staging tables | Exports often disabled | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Email/SMS/WhatsApp
- Import/export
- Webhook/provider health

### AI

Current screens/features: 4

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AI Provider Setup | /ai/providers; /api/ai/providers | MISSING | No route | API exists but UAT 403 related | Partial | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| AI Prompt Templates | /ai/prompt-templates; /api/ai/prompt-templates | MISSING | No route | API exists | Partial | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| AI Operations Assistant | /ai/operations-assistant; /api/ai/assistant/* | MISSING | No route | API concepts exist | Partial | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| AI Daily Summary Review | /ai/daily-summary; /api/ai/daily-summaries/draft | MISSING | No route | API concepts exist | Partial | Not mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Provider setup
- Prompt templates
- Operational assistant
- Review workflows

### Mobile

Current screens/features: 15

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile Login | mobile:login | DEMO-ONLY | Screen exists | Partial auth API use | Partial device/session tables | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Context | mobile:context | PARTIAL | Screen exists | Partial API use | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Dashboard | mobile:home | DEMO-ONLY | Screen exists using seed data | Fallback/partial | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Notifications / Approvals | mobile:inbox; mobile:approvals | PARTIAL | Screens exist | Partial API concepts | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Job Cards | mobile:jobs | DEMO-ONLY | Screen exists using seed data | Partial job-card API concepts | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Execution Capture | mobile:execute; mobile:output | DEMO-ONLY | Screen exists using local/seed data | Partial production APIs | Partial queue/idempotency | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Material Scan | mobile:materials | DEMO-ONLY | Screen exists using seed data | Partial inventory APIs | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Inventory Movement | mobile:stock | DEMO-ONLY | Screen exists using seed data | Partial inventory APIs | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Downtime / Machine Status | mobile:machine | DEMO-ONLY | Screen exists using seed data | Partial downtime/machine APIs | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile QC Capture | mobile:quality | DEMO-ONLY | Screen exists using seed data | Partial quality APIs | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Receipt / Rework | mobile:output; mobile:quality | DEMO-ONLY | Screen exists using seed data | Partial production/quality APIs | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Dispatch Proof | mobile:dispatch | DEMO-ONLY | Screen exists using seed data | Partial dispatch APIs | Partial proof/media | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Stage Board | mobile:orders | DEMO-ONLY | Screen exists using seed data | Partial dashboard APIs | Partial | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Handover / Media | mobile:handover; mobile:device | DEMO-ONLY | Screen exists using seed data | No clear live handover/media subsystem | Partial/missing | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Sync Status | mobile:sync | DEMO-ONLY | Screen exists using local queue concepts | No production sync status contract | Partial/missing | Not fully mapped | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Live login/context
- Assignments
- Execution actions
- Offline queue/media/upload truth

### Release

Current screens/features: 1

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IIS Publish Folder | dotnet publish; npm run build:host | COMPLETE | nan | Host publish path exists | Published wwwroot output generated | nan | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Smoke/UAT/security/release readiness
- review-pack automation

### Tests

Current screens/features: 3

| Screen / Feature | Route or API | Current state | UI state | Backend state | DB state | Action truth | Required completion contract |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Web Automated Tests | src/web/src/**/*.test.* | PARTIAL | 34 web test files | nan | nan | nan | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Server Automated Tests | tests/server/STS.Mfg.Tests | PARTIAL | 5 server test source files | nan | nan | nan | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |
| Mobile Coverage Plan | src/mobile scripts | PARTIAL | Coverage-plan validation exists | nan | nan | nan | Governed fields, truthful actions, persistence or honest disabled state, screenshots, validation, review-pack evidence. |

Required completion requirements:
- Domain-specific governed completion

## Appendix A — Top recurring unresolved issue classes
- Controlled master-linked fields still using free text
- Numeric values still rendered as generic text
- Visible actions still disabled or blocked in important workflows
- Upload/media/document workflow not yet complete across domains
- Live-mode data truth still incomplete in some runtime-heavy workflows
- Modal/workspace and scroll behavior still inconsistent in some screens
- Evidence pack and review-pack automation still needs to be relied upon for every wave

## Appendix B — Completion evidence required per touched screen
- List screen screenshot
- Create/edit modal or full-page workspace screenshot
- Top/middle/bottom only when scrolling exists (max 3)
- Validation results
- Updated action registry for touched actions
- Updated screen completion matrix rows if status changes

## Appendix C — Do not accept a screen as complete if
- any visible action is dead
- any governed master-linked field is free text where source exists
- any numeric/decimal/money field is generic text
- live mode silently falls back to seeded operational data
- upload is shown as active but workflow/storage does not exist
- deep editing is trapped in a right drawer
- validation or screenshots are missing