# STS Manufacturing ERP / Production Visibility Blueprint

## 1. What this product should be

This should **not** become a generic ERP clone.

It should become a **manufacturing operating system for discrete and mixed-unit manufacturers** that need:

- real-time production visibility
- better planning and shortage control
- clean execution tracking on web + mobile
- strong warehouse / bin / lot traceability
- quality and dispatch closure
- management dashboards that show blockers before delivery slips

The strongest first-market fit is:

- fabricated metal
- industrial assembly
- ozone / equipment assembly
- packaging / printing-like job-work environments
- any SME manufacturer with a mix of make-to-order and make-to-stock demand

This blueprint assumes:

- **backend**: ASP.NET Core
- **database**: SQL Server
- **web**: React + TypeScript
- **mobile**: React Native + TypeScript
- **deployment**: IIS using only compiled/published output for web + API
- **v1 exclusions**: HR, payroll, full accounting

## 2. Why this scope is correct

Your attached HTML previews point clearly toward a product centered on **BOM -> BOQ/MRP -> Work Order -> Job Card -> Machine Board -> Stage / Delivery Dashboards**, not a generic horizontal ERP. The screens you attached already define the visual and process center of gravity for the product: BOM Management, BOQ / Requirements, Work Orders, Job Cards, Machine Schedule Board, PPS Machine Occupancy Calendar, Stage Wise Dashboard, and Order Delivery Dashboard. The product should preserve that direction and expand it into a full but disciplined manufacturing suite.

The attached manufacturing PDFs reinforce the same core planning stack: MRP depends on a master production schedule, BOM, inventory records, production cycle times/material needs, and supplier lead times; MRP II expands this into inventories, purchasing, resource data, work release, and capacity planning. The ERPNext manufacturing paper also highlights the operational pain points that match your market: handwritten job cards, lack of planning, missing production tracking, under-utilized resources, and delayed deliveries. The Acumatica handbook adds the need to support different production methodologies, mixed measurement behavior, outside processing, traceability, and open integration readiness.

## 3. Source anchors used for this blueprint

### 3.1 UI / UX anchor screens
Copied into `/reference-ui` inside the pack:

- `W057_Order_Delivery_Dashboard.html`
- `W060_BOM_Management.html`
- `W066_BOQ_Requirements.html`
- `W080_Work_Orders.html`
- `W082_Job_Cards.html`
- `W084_Machine_Schedule_Board.html`
- `W085_PPS_Machine_Occupancy_Calendar.html`
- `W108_Stage_Wise_Dashboard.html`

### 3.2 Planning / manufacturing scope anchors
Based on the uploaded PDFs:

- `mrp.pdf`
- `Manufacturing with ERPNext.pdf`
- `Manufacturing-ERP-Handbook-CA.pdf`

## 4. Product principles

- Do not build a generic ERP first. Build a discrete / mixed-unit manufacturing operating system that solves visibility, execution, shortages, and dispatch control.
- One customer deployment should be deployable as a single IIS publish folder containing ASP.NET compiled output plus compiled React assets. No web source code is required on the production server.
- Use modular monolith boundaries, not a premature microservice split. Keep domain modules separate in code and database naming, but deploy as one product.
- Prefer configuration over customization for company, branch, warehouse, item measurement, routing, approval, and notification differences.
- Mobile is for action. Web is for setup, planning, dense grids, analytics, and administration.
- AI should explain, summarize, classify, translate, and draft. It should not post inventory, release work orders, or change master data without explicit human confirmation.
- Use SQL Server as system of record. Use stored procedures for heavy transactional actions and read-model dashboards, aligned with the reference UI notes.
- Support make-to-stock, make-to-order, engineer-to-order, and mixed mode from the same core without cloning the product.

## 5. Business pain map the product must solve

| Area | Pain to solve |
| --- | --- |
| Sales / Customer Commitments | Promised dates are set without true material or capacity visibility; customer follow-up becomes reactive. |
| Planning | MRP is done in Excel, BOM versions are unclear, shortages are discovered late, and capacity overload is invisible until work slips. |
| Stores / Warehouse | Actual stock differs from ledger; wrong bin issues, lot confusion, and manual issue/return processes delay production. |
| Production | Handwritten or WhatsApp job updates, no machine-level live status, no clean record of good/reject/scrap, and no accountability trail. |
| Quality | QC checkpoints are missed, evidence is scattered, and release/hold decisions are not tied tightly to operation completion. |
| Purchase | Supplier follow-up is manual, late PO deliveries are discovered too late, and outside processing is tracked loosely. |
| Dispatch | Ready-to-dispatch status is unclear, packing/loading proof is missing, and delivery commitments are not connected to production progress. |
| Management | Owner/plant head need one-screen truth: what is late, what is blocked, what needs intervention now. |

## 6. Supported manufacturing modes

| Mode | How this product supports it |
| --- | --- |
| Make to stock (MTS) | Forecast or reorder-point driven production; maintain stock levels; use MPS/MRP to replenish and protect service level. |
| Make to order (MTO) | Manufacturing starts after sales order confirmation; material and capacity are planned against actual customer demand. |
| Engineer to order (ETO) | Per-order BOM/revision/spec attachment and controlled change history; order-specific route or BOM revision allowed. |
| Mixed mode | Some items are produced to stock, others to order; same tenant/company supports both. |

## 7. Recommended product shape

### 7.1 It is a modular manufacturing suite, not just a “tracking app”
The product should cover the full operational loop from demand to dispatch, but remain disciplined by v1 scope.

| Module | What it includes | Primary platform |
| --- | --- | --- |
| Platform & Security | Deployment settings, company/branch model, users, roles, workflows, numbering, audit, attachments, localization, feature flags | Web only except login/approvals/notifications on mobile |
| Measurement & Master Data | UOM classes, conversion matrix, measurement profiles, item master, attributes/variants, customers, suppliers, work centers, machines, shifts, reasons | Web setup + mobile read-only lookup |
| Sales & Demand | Estimates/quotes, sales orders, blanket orders, forecasts, ATP / order promise, delivery risk | Web primary + mobile management snapshot |
| Engineering | BOM library, revisions, ECO, routings, operation standards, alternate items, attached drawings/specs | Web primary |
| Planning | MPS, MRP, BOQ/requirements, shortage actions, capacity planning, purchase/work order recommendations | Web primary |
| Procurement | PR, RFQ, PO, supplier lead time, subcontract/outside processing handoff | Web primary + mobile approvals |
| Inventory & Stores | Warehouse/bin, stock ledger, lots/serials, catch weight, reservations, transfers, cycle counts, WIP movement | Web + mobile action screens |
| Production Execution | Work orders, job cards, machine board, occupancy calendar, material issue, production receipt, scrap/rework, downtime, shift log | Web + strong mobile execution |
| Quality | Inspection plans, incoming/in-process/final inspection, holds, NCR, attachment evidence | Web + mobile execution |
| Dispatch | Pack lists, dispatch planning, shipment, loading proof, delivery notes | Web + mobile execution |
| Dashboards & Alerts | Role dashboards, KPI strips, risk tiles, stage-wise board, order delivery board, notifications | Web + selective mobile |
| Integrations & AI | Email/WhatsApp/SMS, import/export, webhooks, AI providers, AI summaries, AI operational assistant, translation | Web config + mobile notification consumption |

### 7.2 What stays out of v1

- General ledger, accounts payable/receivable, taxation, full accounting close
- Payroll, attendance payroll integration, HRM
- Advanced PLM/CAD bi-directional sync
- Full CMMS / preventive maintenance suite
- Full MES / PLC data acquisition / OEE beyond downtime and machine state
- Full customer support / warranty / field service suite
- Process manufacturing recipe engine with potency, specific gravity, and full batch genealogy (keep architecture extensible but do not build now)

## 8. Core architecture

| Layer | Responsibility |
| --- | --- |
| SQL Server | System of record; transactional tables, views, and stored procedures for heavy actions and dashboards. |
| ASP.NET Core Host | Single publishable server application for API, background jobs, file endpoints, and static web hosting. |
| Application Modules | Platform, Masters, Sales, Engineering, Planning, Procurement, Inventory, Production, Quality, Dispatch, Integrations, AI. |
| React Web | Planning, dense operational screens, dashboards, setup, reporting, administration. |
| React Native Mobile | Execution, scanning, proofs, approvals, compact dashboards, offline queue. |
| Background Jobs | Notification outbox, imports/exports, AI draft generation, dashboard refresh tasks. |

### 8.1 Recommended solution structure

| Path | Purpose |
| --- | --- |
| /src/server/STS.Mfg.Host | ASP.NET host project, static web hosting, background job startup |
| /src/server/STS.Mfg.Api | Controllers/endpoints if separated from host |
| /src/server/STS.Mfg.Application | Use cases, handlers, validators, DTOs |
| /src/server/STS.Mfg.Domain | Entities, value objects, status enums, domain rules |
| /src/server/STS.Mfg.Infrastructure | DB access, Dapper/EF, file storage, providers |
| /src/server/STS.Mfg.Tests | Unit/integration tests |
| /src/web | React web application |
| /src/mobile | React Native mobile application |
| /database/migrations | DDL migrations |
| /database/procedures | Stored procedures |
| /database/views | Dashboard/read-model views |
| /database/seeds | Seed data and demo resets |
| /docs | Blueprint, ADRs, release notes, UAT, progress |
| /reference-ui | Copied HTML anchor files from the user |

### 8.2 Deployment model for IIS
Use a **single publishable server host** for customer deployments:

1. Build the React web app into static assets.
2. Copy the compiled assets into `wwwroot` of the ASP.NET host during publish.
3. Publish the ASP.NET host to an IIS-ready folder.
4. Deploy only the compiled/published folder to IIS.
5. Serve the SPA and API from the same host, with SPA fallback routing.
6. Keep mobile builds separate as APK/IPA artifacts.

This satisfies your requirement that the live server should receive **published output**, not raw React source.

### 8.3 Data access strategy
Use a **hybrid SQL access model**:

- **EF Core** (or equivalent ORM approach) for CRUD-heavy masters and predictable transactional flows.
- **Dapper / direct SQL** for dashboard reads, board views, and procedure-heavy operations.
- **Stored procedures** for critical multi-step actions that need atomicity, audit, and predictable performance.

Recommended stored procedures already listed in the pack include:

| Procedure | Purpose |
| --- | --- |
| sp_WO_Release | Release a work order after material/routing readiness checks |
| sp_WO_ReRelease | Recalculate and re-release WO after change |
| sp_JobCard_CreateForWO | Create job cards from WO operations |
| sp_JobCard_Assign | Assign machine/operator/shift to job card |
| sp_JobCard_Start | Start active job card with uniqueness checks |
| sp_JobCard_Pause | Pause job card with reason |
| sp_JobCard_Resume | Resume paused job card |
| sp_JobCard_LogQty | Post good/reject/scrap against job card |
| sp_JobCard_LogDowntime | Capture downtime against job card/machine |
| sp_JobCard_Complete | Complete operation and push next-stage readiness |
| sp_Stock_IssueToWO | Issue material to work order or job card |
| sp_Stock_ReturnFromWO | Return unused issue quantity |
| sp_ProdReceipt_Create | Create production receipt and ledger movements |
| sp_BOQ_ConvertToPRandWO | Convert approved net requirements to PR and WO |
| sp_MRP_Run | Execute MRP explosion and write result tables |
| sp_Capacity_Rebuild | Recompute capacity buckets by work center/machine |
| sp_Machine_Board | Return lane-style machine schedule board |
| sp_Machine_Calendar | Return occupancy calendar buckets |
| sp_Order_RiskSnapshot | Compute order delivery risk and completion metrics |
| sp_StageWise_Dashboard | Return stage-wise cross-functional status tiles |
| sp_QC_SaveInspection | Write inspection result and hold/release logic |
| sp_Traceability_LotGenealogy | Forward/backward lot genealogy |

## 9. Measurement model — critical for weight, size, and mixed-unit manufacturing

This is one of the most important design decisions in the entire product. Do **not** force every manufacturer into “pieces only”.

### 9.1 Supported measurement profiles

| Profile | Use case |
| --- | --- |
| Count Only | Units like pcs, nos, boxes, sets; stock and production tracked in count UOM. |
| Weight Only | KG/MT-based items such as powder, granules, chemicals, or scrap stock. |
| Length / Area / Volume | Meters, sq.ft., liters, cubic units; required for cable, sheet, roll, laminate, piping, and cut-to-size businesses. |
| Dual UOM / Catch Weight | Planned in pieces or rolls, actual in kg or meters; both commercial and physical quantities are stored. |
| Dimensional Formula | Quantity can be derived from L x W x T x density or similar formula; used for sheet metal, stone, boards, films, coils. |
| Mixed Commercial + Production UOM | Purchased in kg, stocked in sheets, issued by sqm, sold by piece; all supported through conversion rules and profile logic. |

### 9.2 Mandatory item master quantity fields
Each item should support, where applicable:

- stock UOM
- purchase UOM
- sales UOM
- production UOM
- QC UOM
- base measurement profile
- dimensional attributes (length, width, thickness, density, GSM, diameter, etc.)
- catch-weight behavior
- serial / lot traceability flags
- expiry flag
- barcode behavior
- bin management requirement
- QC requirement
- default issue method (manual / backflush / hybrid)

### 9.3 Example business cases this model must support
- buy in kg, stock in kg, issue in kg, sell in kg
- buy in sheet, stock in sheet, issue in sq.ft., sell in piece
- buy in roll, stock in roll, issue in meter, invoice in kg
- plan in piece, actual receipt in piece + kg
- fabricated part where dimensional formula derives theoretical weight
- packaging or paper style item where size variants change area and weight behavior

## 10. Roles and access model

| Role | Responsibility |
| --- | --- |
| PlatformAdmin | Global configuration across deployment, environment settings, integrations, AI provider registry |
| CompanyAdmin | Company/branch setup, workflows, masters, users, numbering, approvals |
| SalesCoordinator | Quotes, sales orders, promised dates, customer attachments, order follow-up |
| PlanningManager | Forecasts, MPS, MRP, BOQ requirements, capacity view, shortage actioning |
| PurchaseManager | PR conversion, RFQ, PO, supplier follow-up, outside processing |
| StoreKeeper | Receipts, bin transfers, issue/return to work order, cycle count, lot/serial traceability |
| ProductionSupervisor | Release WOs, assign job cards, monitor machine board, downtime, shift output |
| MachineOperator | Start/pause/resume/complete job cards, quantity reporting, reason codes, photo/note capture |
| QCInspector | Incoming, in-process, final inspection, holds, release, NCR |
| DispatchManager | Pack lists, dispatch staging, loading, shipping proof, delivery tracking |
| PlantHead | Cross-department action dashboard, bottlenecks, exceptions, load balancing |
| ManagementViewer | Owner/CEO dashboards, customer/order risk view, daily summaries |

### 10.1 Dashboard expectation by role

| Role | Dashboard focus |
| --- | --- |
| ManagementViewer | Open orders, overdue orders, critical shortages, machine downtime today, dispatch ready today, supplier delays, top risk customers |
| PlantHead | Orders at risk, WOs released/not released, machine occupancy, delayed job cards, pending QC, pending material issues |
| PlanningManager | Forecast coverage, MRP exceptions, BOQ shortages, unapproved BOMs, overloaded work centers, due-date risk list |
| PurchaseManager | PR aging, PO follow-up, late supplier commits, outside processing due list, supplier fill-rate |
| StoreKeeper | Pending issues to WO, pending returns, low stock bins, cycle counts due, quarantined lots |
| ProductionSupervisor | Today’s plan vs actual, active job cards, paused jobs, downtime reasons, rework queue, shift handovers |
| MachineOperator | My assigned job cards, active machine, next operation, QC checkpoint required, alerts |
| QCInspector | Inspections due, holds pending decision, rejected qty trend, NCR open count |
| DispatchManager | Packing pending, dispatch-ready orders, vehicle/loading tasks, proof capture pending |

## 11. Module-by-module scope

### 11.1 Platform & Security
Must include:

- users
- roles
- permission matrix
- branch/company/warehouse scoping
- workflow designer
- numbering series
- audit trail
- attachments
- feature flags
- language/translation setup
- notification inbox
- approval workbench

### 11.2 Measurement & Master Data
Must include:

- UOM classes
- fixed and formula-based conversions
- measurement profiles
- item group/category
- item attributes and variant matrix
- item master
- barcodes
- customers
- suppliers
- supplier lead times
- work centers
- machines
- tools/moulds/dies
- departments
- shifts
- reason codes

### 11.3 Sales & Demand
Must include:

- quote / estimate
- sales order
- blanket order
- demand forecast
- order priority
- make type per line (MTS / MTO / ETO)
- promised date
- ATP / order promise
- order attachments/specs

### 11.4 Engineering
Must include:

- BOM library
- BOM revisions
- BOM comparison
- routing library
- operation standard times
- ECO / revision approval
- alternate items
- drawings/spec attachment linkage

### 11.5 Planning
Must include:

- MPS
- MRP run console
- MRP exceptions
- BOQ / requirements
- action recommendation BUY / MAKE / TRANSFER / SUBCONTRACT
- conversion to PR and WO
- capacity planning (RCCP / CRP style)
- shortage dashboard

### 11.6 Procurement
Must include:

- purchase requisition
- RFQ-ready data structure
- purchase order
- supplier lead time matrix
- outside processing / subcontract plan
- due follow-up status

### 11.7 Inventory & Stores
Must include:

- warehouse + bin
- stock balance
- stock transfer
- issue to WO / JC
- return from WO / JC
- reservations
- cycle count
- lots / serials
- catch weight
- quarantine / QC hold / blocked stock
- traceability views

### 11.8 Production Execution
Must include:

- work orders
- job cards
- timeline/event log
- machine board
- occupancy calendar
- downtime log
- shift handover
- production receipt
- scrap / by-product
- rework
- machine status

### 11.9 Quality
Must include:

- QC plan setup
- incoming inspection
- in-process inspection
- final inspection
- hold/release
- NCR / deviation
- photo/document evidence

### 11.10 Dispatch
Must include:

- pack list
- dispatch queue
- shipment record
- loading proof
- delivery document linkage

### 11.11 Dashboards & Reports
Must include at least:

| Report / Dashboard | Purpose |
| --- | --- |
| Order Delivery Dashboard | Customer-order risk, due windows, completion %, blockers |
| Stage Wise Dashboard | Cross-functional status from SO to dispatch |
| BOQ / Requirements | Net requirements, shortages, BUY/MAKE/TRANSFER decisions |
| MRP Exceptions | Missing data, shortages, late receipts, overloads |
| Machine Schedule Board | Current and next job cards by machine |
| PPS Occupancy Calendar | Date-bucket machine occupancy |
| WO Traveler / Job Card Print | Printed shop-floor execution pack |
| Lot / Serial Genealogy | Forward/backward traceability |
| QC Pending / Holds | Inspection work queue and release blockers |
| Dispatch Readiness | What can ship today and what is blocked |

### 11.12 Integrations & AI
Must include:

| Integration | Purpose |
| --- | --- |
| Email | Alerts, approvals, daily summaries, supplier/customer follow-up |
| WhatsApp | Operational alerts, supplier follow-up drafts, customer dispatch updates |
| SMS | Fallback alerts and approvals where applicable |
| Webhooks | Outbound event push to external systems |
| Import/Export | CSV/Excel imports and report exports |
| Barcode/QR | Item, bin, lot, serial, pack, and job-card scanning |
| File attachments | Drawings, PDFs, photos, inspection evidence |
| Future machine integration | Use open APIs and ingestion endpoints rather than tightly coupling PLC logic in v1 |

and the AI features below:

| AI capability | Guardrailed use |
| --- | --- |
| AI daily production summary | Summarize shift/day events, completed job cards, downtime, rejects, and pending issues into reviewable draft notes. |
| Delay and shortage risk digest | Explain which orders are at risk and why, using structured BOQ, WO, downtime, and QC data. |
| Safe operations assistant | Natural language questions map to approved stored procedures or parameterized queries; no arbitrary SQL execution. |
| Supplier/customer message drafting | Draft follow-up or delay messages for email/WhatsApp/SMS after a human reviews the text. |
| Translation support | Translate notes, alerts, and user-facing messages across supported languages. |

## 12. Database inventory

The pack includes `db_entities.csv` with **109 entities**. At a minimum, the database should cover:

- organization hierarchy
- workflow settings
- measurement/UOM model
- item and partner masters
- engineering
- planning
- procurement
- inventory
- production execution
- quality
- dispatch
- integrations
- AI
- audit

Use the CSV as the starting point for Codex and refine columns through the prompt flow.

## 13. API inventory

The pack includes `api_inventory.csv` with **63 API groups**. The API must be designed around:

- typed DTO contracts
- paging/filter envelopes
- status-safe transitions
- audit-friendly action endpoints
- mobile-friendly lightweight execution endpoints
- provider abstractions for integrations and AI

A web client, a native mobile client, background jobs, and reporting utilities should all be able to consume the same backend contracts.

## 14. Screen inventory

The pack includes `screen_inventory.csv` with:

- **95 web screens**
- **24 mobile screens**

This is intentionally broader than a first release. It gives Codex a complete target surface and avoids rediscovering screens later.

### 14.1 Web screens that must look closest to your attached UI
These are the highest-fidelity anchor screens:

- Order Delivery Dashboard
- BOM Management
- BOQ / Requirements
- Work Orders
- Job Cards
- Machine Schedule Board
- PPS Machine Occupancy Calendar
- Stage Wise Dashboard

### 14.2 Web vs mobile split

#### Web should own
- heavy setup
- dense data grids
- BOM editing
- planning consoles
- MRP/BOQ
- capacity views
- long-form detail pages
- reporting and print packs
- admin and AI configuration

#### Mobile should own
- job card execution
- quantity entry
- downtime logging
- QC checkpoint entry
- issue/return scans
- transfer/putaway/count
- dispatch proof
- approvals
- compact dashboards

## 15. Key workflows

| Workflow | Flow |
| --- | --- |
| Order-to-plan | Quote/SO/blanket/forecast -> MPS/MRP -> BOQ requirements -> PR/PO and WO recommendations |
| Engineering-to-execution | BOM + routing + ECO -> approved revision -> WO release -> job card generation |
| Stores-to-production | Reservation -> issue to WO/JC -> consume/return -> production receipt |
| Execution-to-quality | JC start/pause/qty/downtime -> in-process QC -> final QC -> hold/release |
| Production-to-dispatch | FG ready -> pack list -> dispatch planning -> loading proof -> shipment |
| Management visibility | Order risk + stage-wise + machine board + shift summaries |

### 15.1 Order-to-delivery risk formula
For the Order Delivery Dashboard, compute risk from structured inputs such as:

- due date window
- work order completion %
- pending operation count
- BOQ shortage count
- supplier late items
- machine downtime dependency
- QC pending count
- dispatch readiness

Do not use opaque AI scoring as the primary risk signal. AI can explain the risk, but the core status should come from deterministic business rules.

### 15.2 Job card state model
Recommended states:

- Created
- Assigned
- Started
- Paused
- QC Hold
- Completed
- Closed
- Cancelled

Recommended event log:

- assigned
- started
- paused
- resumed
- downtime logged
- quantity logged
- QC hold
- QC released
- completed
- closed

Important rule: one machine should not have multiple conflicting active job cards at the same time unless a future explicit parallel-capacity model is introduced.

## 16. Dashboards and KPIs

| Role | Key KPIs |
| --- | --- |
| ManagementViewer | Open orders, overdue orders, critical shortages, delayed suppliers, machine downtime today, dispatch ready today |
| PlantHead | WO released, active JC count, paused jobs, downtime by reason, QC pending, stage blockers |
| PlanningManager | MRP exception count, shortage lines, overloaded machines, unapproved BOMs, past-due PR/PO |
| PurchaseManager | PO overdue count, supplier commitment slippage, outside-processing due list |
| StoreKeeper | Pending issues, pending returns, cycle count due, low-stock alert lines |
| ProductionSupervisor | Today plan vs actual, active machines, paused jobs, scrap qty, rework count |
| QCInspector | Incoming due, in-process due, final due, hold items, open NCR |
| DispatchManager | Pack pending, dispatch-ready, loading pending proof, overdue deliveries |

## 17. AI design guardrails

The AI layer is useful only if it is **safe, explainable, and optional**.

### 17.1 Allowed AI behaviors
- summarize structured data
- classify notes / issues
- translate content
- draft messages
- explain blockers and risks
- help users find the right screen or record

### 17.2 Blocked AI behaviors unless later approved
- arbitrary SQL execution
- inventory posting
- work order release
- BOM changes
- approvals submitted without user confirmation
- supplier/customer communication sent automatically

### 17.3 Preferred AI execution pattern
Use this chain:

1. user intent
2. allowed intent classifier
3. approved query template or stored procedure
4. deterministic result set
5. AI explanation or draft text
6. human review if action leaves the system

## 18. Integrations

### 18.1 Email / WhatsApp / SMS
Create a provider abstraction, not a provider lock-in.

Each outbound message should support:

- template
- rendered payload preview
- queue status
- retry state
- related document link
- approval requirement where relevant

### 18.2 Future machine / IoT integration
The product should be **integration-ready**, but not depend on deep PLC/MES scope in v1.

Expose:

- inbound machine event endpoint
- machine status update API
- webhook/event bus model
- idempotent event processing
- support for future OEE-lite extension

This is especially relevant because fabricated metal and similar industries often need open APIs and machine data capture readiness.

## 19. Design language guidance for Codex

The attached HTML screens already solved an important problem: the product should feel like a **high-quality manufacturing product**, not a bootstrapped line-of-business portal.

Design rules:

- white cards over soft gradient background
- strong but subtle hierarchy
- rounded corners
- compact filters
- status pills and risk badges
- KPI strips
- right drawers
- lane boards
- calendar occupancy
- timeline logs
- minimal color noise
- dense data, but breathing room

Codex should **reuse the same visual grammar** across new screens.

## 20. Suggested implementation technologies

Without pinning to an exact package version, the recommended stack is:

### Backend
- ASP.NET Core Web API / host
- SQL Server
- EF Core for standard CRUD
- Dapper or equivalent for stored proc/read models
- background job runner
- provider abstractions for AI, email, SMS, WhatsApp, file storage

### Web
- React + TypeScript
- modern bundler producing static build output
- router
- query cache/data fetching layer
- form validation layer
- CSS tokens / component primitives aligned to the reference UI

### Mobile
- React Native + TypeScript
- secure auth storage
- local queue / offline cache
- barcode / camera / file upload utilities
- sync status surface

## 21. Release roadmap

| Release | Scope | Why it matters |
| --- | --- | --- |
| Release 0 — foundation | Platform, security, company/branch/warehouse/bin, UOM/measurement profiles, item master, customers/suppliers, design system, deploy-to-IIS pipeline | This is the mandatory base for every later module. |
| Release 1 — engineering + planning | BOMs, revisions, routings, sales orders, forecasts, MPS, MRP, BOQ requirements, purchase requisitions, capacity planning | This makes the system credible for planners and management. |
| Release 2 — production execution | Work orders, job cards, material issue/return, machine board, occupancy calendar, production receipt, scrap, downtime, shift handover | This is the core shop-floor value and strongest mobile footprint. |
| Release 3 — quality + dispatch | QC plans, incoming/in-process/final inspection, NCR, pack lists, dispatch planning, shipment, order-risk dashboards | This closes the loop from order promise to dispatch. |
| Release 4 — AI + integrations | Email/SMS/WhatsApp, webhooks, import/export, AI summaries, AI operations assistant, translation, stronger analytics | Only after the core transaction flows are trustworthy. |

## 22. What Codex must produce, not just code

Codex should not only generate code. It should also maintain:

- module-level ADRs / notes
- progress notes per prompt
- migration scripts
- seed scripts
- SQL procedure docs
- screen QA notes
- UAT checklist
- deployment scripts
- demo reset scripts

## 23. Prompt pack included

This pack includes **150 connected prompts** in `/02-prompts`.

Prompt design rules:

- every prompt says what to read first
- every prompt says what to build
- every prompt says what files/notes to produce
- every prompt says what “done” means
- every prompt points to the **next prompt**
- major screens point back to the reference HTML when applicable

## 24. Final recommendation

Build this as a **modular manufacturing execution + planning suite** with strong discrete/mixed-unit support.

Do **not** dilute the first version with HR, payroll, or finance.

Win the market on these 6 things first:

1. BOM / revision discipline
2. MRP / BOQ shortage clarity
3. Work order + job card execution
4. machine-level visibility
5. quality and dispatch closure
6. role dashboards that explain risk before delivery fails

That combination is concrete, sellable, demo-friendly, and aligned with both your attached design direction and the manufacturing pain points in the uploaded material.
