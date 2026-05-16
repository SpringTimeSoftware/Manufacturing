# Completion Pack Residual Gap Report

Date: 2026-05-15

Scope: the first 10 ERP completion packs executed so far:

1. Item / Product Master
2. Customer / Dealer / Distributor Master
3. Supplier / Vendor Master
4. Quote / Sales Order / Forecast / ATP
5. Procure-to-Pay
6. Transaction Line Grid Standardization Retrofit
7. BOM / Routing / ECO / Engineering Documents
8. Planning / MPS / MRP / BOQ / Capacity
9. Production / Shop Floor / Work Order / Job Card
10. Inventory / Warehouse / Traceability

This report explains why residual gaps remain after packs that otherwise passed their P0 or touched-scope gates. It is intentionally direct: most remaining items are not dead buttons anymore, but they are still product gaps because they need deeper business rules, cross-module contracts, external runtime evidence, or a larger workflow slice.

## Executive Summary

The main reason gaps remain is that the packs were executed with a strict truth rule: if a workflow could not be made real inside the repo during the pack, it had to be disabled with a business-safe reason instead of left fake. That improved trust, but it also surfaced the real unfinished product depth.

The repeated pattern is:

- P0 field truth, numeric truth, modal truth, line-grid truth, and action truth were fixed for the touched screens.
- Many residual items are P1/P2 workflows, not simple UI defects.
- The disabled-with-reason actions are safer than fake actions, but they are still work to close before a world-class pilot.
- Several gaps are cross-module by nature: print/export, document lifecycle, reporting, valuation/costing, physical inventory freeze, LP/PCID containment, linked-record routing, and provider/device runtime behavior.

## Why Gaps Were Left

| Reason class | What it means | Examples | Need help from you? |
| --- | --- | --- | --- |
| P0 scope was completed, P1/P2 left | Pack gates were satisfied for critical touched scope, but later-depth workflows remain | Item media lifecycle, quote conversion, BOM comparison export, planning scheduler | Sometimes |
| Business rules not defined | Implementation changes accounting, approval, ownership, costing, or warehouse policy | Landed cost allocation, vendor return authorization, physical inventory freeze, cycle-count approval thresholds | Yes |
| Cross-module contract missing | Screen needs another module to be real first | Quote to SO release, BOM line to operation issue timing, routing machine assignment, exact ECO linked-record route | Sometimes |
| External provider/runtime missing | Code can be built, but proof requires live/sandbox provider, device, or infrastructure | Email/WhatsApp/SMS/CRM, native barcode/camera/offline/device trust, scheduled MRP service | Yes |
| Document/reporting engine missing | Printing/export is not a button; it needs templates, generated files, storage, authorization, logs | Traveler print, pack labels, BOM comparison export, inventory export, RFQ attachment PDF | Yes for templates/policy |
| V1 scope conflict | Earlier scope excluded full accounting/finance; user later expanded P2P/AP expectations | AP liability, payment schedule, landed cost valuation, GL/COGS/WIP | Yes, but direction is now clearer |

## Pack-by-Pack Residual Gap Detail

### 1. Item / Product Master

Pack status: COMPLETE for touched pack scope.

What was completed:

- Governed classification and UOM selectors were corrected.
- Numeric specs, planning quantities, packaging values, and save/reopen behavior were tested.
- Saved live item media upload uses the shared attachment workflow.
- Set-primary and retire media actions are not dead; they are disabled with reasons.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| Media set-primary lifecycle | Disabled with reason | Requires media lifecycle approval/audit rules, not just file upload | Decide whether primary image can be changed freely or needs approval/version audit | Add item media lifecycle endpoint and audit trail |
| Media retire lifecycle | Disabled with reason | Retirement should check item usage, document-control policy, and active references | Decide retain/delete/archive policy | Add retire/restore/status workflow on attachment metadata |
| Import/export item data exchange | Disabled with reason in related item actions | A real import/export engine needs templates, validation, row repair, and signed download | Confirm item import/export formats and approval flow | Use integration import/export queue foundation to add item-specific templates |
| Label printing for barcodes | Disabled with reason | Needs print-template service and generated file/log storage | Label formats, printer/PDF target, barcode standards | Implement print-template registry and barcode label output |

Help needed from you:

- Choose whether item media primary/retire changes need approval.
- Provide barcode label formats and whether output is PDF, printer queue, or both.

Codex can proceed without help by using conservative defaults: approval-required for retire, audit-only for set-primary, PDF-first labels.

### 2. Customer / Dealer / Distributor Master

Pack status: COMPLETE for touched pack scope.

What was completed:

- Customer create workspace opens.
- Sites, contacts, credit, terms, commercial sections are inspectable/editable where supported.
- Commercial fields use governed selectors or disabled governed selectors.
- Credit limit and credit days are numeric.
- Upload actions are truthful.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| Price list assignment | Disabled governed selector where not editable | Assignment source may belong to commercial setup, customer pricing policy, or sales admin workflow | Decide owner: Customer Master vs Commercial Setup vs approval workflow | Add customer commercial-assignment endpoint and history |
| Discount scheme assignment | Disabled governed selector where not editable | Needs pricing eligibility and effective-date rules | Discount applicability rules and override approval rules | Add customer discount assignment table with effective dates |
| Salesperson assignment | Disabled governed selector where source missing | Needs employee/user/sales territory source master | Sales owner source: users, sales teams, territories, or CRM owner | Add sales ownership lookup source and assignment API |
| Customer document upload before saved record | Disabled until saved live customer exists | Upload must attach to a persisted entity for authorization and metadata | No decision required | Add staged upload only if unsaved-record upload is required |

Help needed from you:

- Define whether commercial assignments live in Customer Master or Price/Discount setup.
- Define salesperson source: user directory, CRM owner, territory, or sales team.

Codex can proceed by implementing customer-commercial assignment as a separate effective-dated subtable.

### 3. Supplier / Vendor Master

Pack status: COMPLETE for touched pack scope.

What was completed:

- Supplier create/edit workspace opens.
- Sites, contacts, terms, capability, lead time, compliance document metadata, and audit sections are present.
- Supplier classification, tax, currency, payment terms, preferred status, capability, compliance status, roles, and channels are governed.
- Upload actions are truthful.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| Default branch editing | Disabled with context reason | Branch assignment can affect scope, procurement permissions, and supplier availability | Decide if supplier is global, company-level, or branch-level | Add supplier-branch assignment matrix |
| Supplier compliance document upload before saved record | Disabled until saved live supplier exists | Upload requires persisted supplier id and authorization | No decision required unless staging uploads are required | Keep saved-record upload; add staged upload later only if needed |
| Supplier performance feedback | Partial through lead-time views | Requires GRN, NCR, delivery delay, quality rejection, and scorecard aggregation | Scorecard KPI rules | Add supplier performance read model after P2P and QC depth |
| Supplier item/reference governance | Improved but not full supplier catalog | Needs supplier-item catalog, approved manufacturer, MOQ/lead-time/effective dates | Supplier catalog requirements | Add supplier item catalog table/API and sourcing rules |

Help needed from you:

- Decide supplier scope: company-wide vs branch-specific.
- Define supplier performance KPIs and thresholds.

Codex can proceed by adding branch assignment and supplier item catalog using conservative effective-dated records.

### 4. Quote / Sales Order / Forecast / ATP

Pack status: COMPLETE for touched pack scope.

What was completed:

- Quote draft opens and supports multiline add/remove/edit/save/reopen.
- Quote totals calculate from all lines.
- Governed item/UOM/status/priority fields and numeric price/discount/tax controls are in place.
- Forecast and ATP surfaces were strengthened.
- Sales order draft state is truthful.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| Quote-to-order conversion | Disabled with release reason | Real conversion requires quote release/approval, customer credit validation, price lock, line status, and sales order numbering | Quote release policy and conversion approval rules | Add quote release state machine and conversion service |
| Freight/add-less/round-off | Disabled with reason | Charges affect tax base, margin, accounting, and document print totals | Charge types, tax applicability, rounding rules | Add commercial charge contract reused by quote, SO, PO, invoice |
| Sales order pricing edit depth | Controlled by quote/price-list workflow | Avoids ungoverned direct price override | Decide allowed SO override roles and approval rules | Add sales order price override workflow if needed |
| Forecast import | Disabled with reason | Needs import template, validation, row repair, and source versioning | Forecast import format and ownership | Add forecast import job type to import queue |
| ATP finite-capacity commitment | Working as selected promise commit, but not full ATP/CTP engine | Needs allocation/reservation, capacity, pegging, and exception ownership | Promise policy: stock-only ATP vs capacity-aware CTP | Extend planning engine with ATP allocation and promise audit |

Help needed from you:

- Quote approval/release rules.
- Standard charge and rounding rules.
- Whether V1 needs stock ATP only or capacity-aware CTP.

Codex can proceed by implementing quote release and a shared charge engine with default Indian tax rounding assumptions, but final tax/accounting behavior should be reviewed.

### 5. Procure-to-Pay

Pack status: PARTIAL.

What was completed:

- PR, RFQ, supplier quotation, quote comparison, PO, GRN/supplier invoice/match workspace, and subcontract screens were completed for the implemented V1 procurement flow.
- RFQ and supplier quote line depth, governed fields, numeric values, supplier selection, and selected quote to PO conversion were implemented.
- Vendor Return, Landed Cost, and Buyer Queue are visible only as truthful blocked surfaces.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| Vendor return posting | Blocked with reason | Requires approved GRN/QC return authorization, inventory reversal, financial effect, supplier debit handling | Return authorization rules and inventory reversal rules | Build vendor return document with GRN/QC references and ledger reversal |
| Landed cost allocation | Blocked with reason | Requires valuation/cost posting, charge allocation, customs/freight mapping, and inventory value adjustment | Allocation methods and valuation policy | Build landed cost document and allocation engine |
| Buyer queue dashboard | Blocked with reason | Needs cross-document persisted read model over PR/RFQ/PO/GRN/invoice exceptions | Buyer ownership and priority rules | Add procurement work queue read model and refresh job |
| RFQ document upload | Disabled with reason | Saved procurement sourcing records need attachment metadata authorization | Attachment category rules | Link central attachment workflow to RFQ entity |
| Supplier quotation PDF upload | Disabled with reason | Same saved-record attachment dependency | Attachment category rules | Link central attachment workflow to supplier quote entity |
| External supplier portal/email delivery | Outside in-repo flow | Needs provider templates, credentials, supplier email/channel rules | Provider/channel choices | Add outbound RFQ delivery after provider verification |
| Live payment execution | Not in current P2P closure | Requires bank/payment provider or accounting workflow | Payment process scope | Keep AP handoff/payment schedule first; bank execution later |

Help needed from you:

- Vendor return rules: return against GRN, QC rejection, invoice, or all three.
- Landed cost allocation rules: quantity, value, weight, manual split, or all.
- Freight/customs/provider fields needed for your industry.
- Buyer queue priority rules.

Codex can proceed on vendor return and landed cost now with standard ERP defaults, but valuation/accounting rules should be confirmed quickly.

### 6. Transaction Line Grid Standardization Retrofit

Pack status: COMPLETE.

What was completed:

- 24 transaction surfaces scanned.
- 16 editable desktop transaction line editors use compact `ErpTransactionLineGrid`.
- Repeated card-style line entry and first-line-only anti-patterns were removed.
- New audit gate `audit:transaction-line-grid` was added.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| Vendor Return line editor | Not active; workflow disabled | Vendor return posting contract is not enabled | Vendor return rules from P2P | Close under Vendor Return pack |
| Landed Cost allocation line editor | Not active; workflow disabled | Valuation allocation contract is not enabled | Landed cost rules from P2P | Close under Landed Cost pack |
| Scrap/Rework multiline depth | Current implementation is a single governed posting form | May be acceptable for simple postings, but complex rework may need multiline components/operations | Decide whether rework needs multiline material/labor/output grid | Add rework/scrap detail grid if pilot needs it |
| ATP line grid | No editable line grid by design | ATP acts on selected promise rows, not transaction lines | No help unless ATP batch simulation is required | Add batch ATP grid only if needed |

Help needed from you:

- Confirm whether scrap/rework must handle multiple material/output/labor lines in V1.

Codex can proceed by standardizing scrap/rework into compact grids if you want full shop-floor depth.

### 7. BOM / Routing / ECO / Engineering Documents

Pack status: COMPLETE for touched engineering scope.

What was completed:

- BOM component and operation editors were converted to compact grids.
- Routing operations were converted to compact grids.
- BOM/routing released direct edit locks were added.
- ECO draft workspace with affected-object grid was added.
- Engineering document upload/link uses platform attachment API.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| Operation-specific component issue link | Disabled with reason | BOM lines do not yet support operation-linked issue timing contract | Decide issue timing: at release, at operation start, backflush, manual | Add BOM line operation link and production issue timing rules |
| Routing machine assignment | Disabled with reason | Needs machine/resource assignment by operation, effective dates, alternates, and capacity impact | Machine assignment policy | Add routing-machine assignment table/API and capacity integration |
| ECO exact linked-record navigation | Disabled with reason | Affected object types need exact route/param mapping and permission checks | Confirm target route behavior for item/BOM/routing/document | Add affected-object route resolver |
| BOM comparison export | Disabled with reason | Requires approved reporting/export workflow | Export format/template | Add reporting export contract for BOM comparison |
| Engineering document audit history | Disabled/partial with reason | Requires document-control review/version workflow | Document approval/versioning policy | Add document version/revision audit timeline |
| Separate alternate-item approval | Outside current API | Alternate item setup has status but not a separate approval flow | Approval requirement | Add approval workflow if alternate substitutions need formal release |

Help needed from you:

- Operation issue timing rules.
- Whether routing must assign exact machine, machine class, or work center only.
- ECO linked target priority: item, BOM, routing, document.
- Engineering document versioning policy.

Codex can proceed with conservative defaults: operation-linked issue optional, machine assignment effective-dated, ECO route resolver for known object types.

### 8. Planning / MPS / MRP / BOQ / Capacity

Pack status: COMPLETE for in-repo P0 scope.

What was completed:

- `/planning/workspace` was added.
- Planning plans, snapshots, planned orders, planned-order conversion, shortage actions, pegging/shortage/capacity evidence grids were added.
- Live plan save, manual planned-order save, PR conversion, WO conversion with prerequisites, and shortage action save are wired.
- Demo/live data truth was preserved.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| Recurring MRP scheduler | Disabled with reason | Requires approved background scheduler/service infrastructure | Scheduler choice and run cadence | Add hosted background scheduler and run history |
| Transfer planned-order conversion | Disabled with reason | Transfer-order posting workflow is not complete | Transfer order rules | Add transfer order document and inventory handoff |
| Planning evidence upload | Disabled with reason | Saved planning document metadata authorization does not exist yet | Document categories and retention rules | Link attachment workflow to planning plan/snapshot |
| Work-order conversion restrictions | Requires persisted planned order with released BOM/routing | Prevents fake WO creation from derived/unsupported planning rows | No help unless override desired | Keep prerequisite; add guided error/help |
| Finite-capacity writeback depth | Partial | Capacity buckets display evidence, but reschedule/alternate machine/writeback needs deeper planning engine | Capacity policy | Add capacity plan versioning and reschedule actions |
| Run compare/archive depth | Partial | Needs durable snapshots and compare UI beyond current evidence tables | Planner review process | Add run archive/compare workstream |

Help needed from you:

- MRP run cadence and planning horizon.
- Transfer order business rules.
- Capacity mode: infinite with warnings vs finite scheduling.
- Whether planner can auto-create PR/WO/transfer or must submit for approval.

Codex can proceed on scheduler and transfer order foundation using default batch rules, but finite scheduling should be agreed before deep implementation.

### 9. Production / Shop Floor / Work Order / Job Card

Pack status: COMPLETE for P0 touched scope.

What was completed:

- Work-order detail handoff actions now pass exact source context into material issue, return, and production receipt workspaces.
- Production receipt, scrap, and rework draft workspaces prefill work-order/job-card context from deep links.
- Print traveler is disabled with a clear reason instead of fake navigation.
- Production action/field/entity matrices were updated.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| Traveler / job card print log | Disabled with reason | Needs print-template, generated document, barcode/QR, log, reprint authorization | Traveler template and barcode/QR requirements | Build production print-log and traveler template service |
| Label printing | Disabled with reason where exposed | Needs template registry, output storage, and print logs | Label templates and printer/PDF target | Reuse print-template foundation |
| Full costing ledger / GL integration | Outside V1 accounting scope | Material/output movements post inventory/audit evidence, but not full accounting/GL | User has now approved P2P accounting depth; production costing still needs scope confirmation | Add WIP/cost ledger without full GL first, then bridge to finance |
| Scrap/rework costing depth | Partial | Requires cost treatment, reason codes, QC linkage, and inventory valuation impact | Scrap/rework valuation rules | Add scrap/rework posting rules and cost audit |
| Operator terminal native/device scan proof | Partial | Needs mobile/runtime scanner and device trust for real shop-floor execution | Device/scanner targets | Close under mobile runtime pack |
| Close gates | Present in concept but not full proof for all scenarios | Needs material, quality, WIP, costing, document, and approval gates | Close checklist policy | Add work-order close gate table/API |

Help needed from you:

- Traveler and label formats.
- Whether production costing must be WIP/COGS integrated now.
- Scrap/rework valuation and approval rules.
- Work-order close gate checklist.

Codex can build print logs and close gates with reasonable defaults; costing should be reviewed before finalizing.

### 10. Inventory / Warehouse / Traceability

Pack status: COMPLETE for P0 gates; P1/P2 deferred with reasons.

What was completed:

- Stock issue/return/transfer drafts use compact grids with governed item/location/lot/serial controls.
- Cycle-count line editor uses compact grid.
- Traceability deep-link works from `?trace=`.
- Live seeded fallback scans are clean.

Residual gaps:

| Gap | Current state | Why left | What is needed | Best path |
| --- | --- | --- | --- | --- |
| License plate / PCID containment ledger | Disabled governed selector | No table/API exists for handling unit hierarchy, pack/unpack, split/merge/move, reconciliation | Whether LP/PCID is required for V1 pilot; PCID format; nesting rules | Add LP/handling-unit model and movement integration |
| Dedicated stock adjustment workbench | Deferred | Cycle count can post adjustment lines, but no standalone approval-threshold adjustment document exists | Adjustment reason/approval thresholds | Add stock adjustment document with approval workflow |
| Physical inventory freeze/count/close | Deferred | Requires warehouse freeze policy and separate document lifecycle | Freeze rules, count teams, recount policy | Add physical inventory document lifecycle |
| Native barcode/offline validation | Deferred | Requires device scanner/offline sync/provider behavior | Device list, scanner mode, offline rules | Close in mobile runtime pack |
| Inventory export/reporting | Disabled with reason | Needs reporting/export workflow | Export formats | Add inventory reports through reporting engine |
| LP/barcode label print | Not complete | Needs print template and LP model | Label format | Build after LP model |

Help needed from you:

- Whether license plate / handling unit is mandatory for pilot.
- PCID format and whether nested handling units are required.
- Physical inventory freeze rules.
- Stock adjustment approval thresholds.
- Barcode device/runtime rules.

Codex can proceed on LP/PCID and physical inventory using standard warehouse assumptions if you confirm they are in scope.

## Cross-Pack Residual Gap Themes

### A. Print, Export, And Report Output

Affected packs:

- Item barcode labels
- Quote/ATP exports
- RFQ/quote comparison export
- BOM comparison export
- Production traveler and labels
- Inventory balance/traceability export
- Dispatch labels and documents from earlier workstreams

Why left:

- A print/export button without generated file storage, template/version, authorization, and audit would be fake.
- The repo has export queues and print-pack surfaces, but not a unified output engine for all domains.

What is needed:

- Template formats for traveler, barcode labels, pack labels, BOM comparison, inventory exports.
- PDF/Excel/CSV decision per document.
- Whether generated documents need approval before issue.

Best next pack:

- `DOCUMENT-PRINT-EXPORT-ENGINE-COMPLETION-01`

### B. Attachment Workflow Per Entity

Affected packs:

- RFQ documents
- Supplier quotation PDFs
- Customer/supplier pre-save uploads
- Planning evidence uploads
- Engineering document audit/versioning

Why left:

- Shared attachment upload exists, but every entity needs authorization category, metadata, saved-record id, preview/download policy, and audit.

What is needed:

- Document categories by entity.
- Which documents are version-controlled.
- Retention and deletion rules.

Best next pack:

- `DOCUMENT-CONTROL-AND-ATTACHMENT-AUTHORIZATION-01`

### C. Accounting / Valuation / Costing

Affected packs:

- Landed cost
- Vendor return debit/valuation
- Supplier invoice/AP bridge
- Production WIP/costing
- Scrap/rework costing
- Inventory valuation

Why left:

- Earlier project scope excluded full accounting. You have now clarified that GRN, supplier invoice, 2-way/3-way match, AP liability, payment schedule, and accounting posting are required.
- That scope change should be implemented intentionally, not hidden inside individual screen fixes.

What is needed:

- Valuation method: standard, weighted average, FIFO, batch actual, or hybrid.
- GL posting granularity: full GL now or accounting bridge first.
- Landed cost allocation rules.
- AP liability/payment schedule rules.

Best next pack:

- `P2P-VALUATION-AP-ACCOUNTING-COMPLETION-01`

### D. Workflow / Approval / Release State Machines

Affected packs:

- Quote release / convert to order
- Vendor return authorization
- Landed cost approval
- BOM/routing release/revision/ECO
- Work-order close gates
- Stock adjustment approval
- Physical inventory freeze/close

Why left:

- These workflows require durable statuses, role permissions, audit, dependency checks, and blocked-state explanations.

What is needed:

- Approval thresholds and owner rules.
- Status transitions per document.
- Whether maker/checker is mandatory per workflow.

Best next pack:

- `ERP-WORKFLOW-STATE-MACHINE-COMPLETION-01`

### E. Native Runtime / External Systems

Affected packs:

- Mobile barcode/camera/offline/device trust
- Email/WhatsApp/SMS/CRM
- Provider health and delivery verification
- Scheduler service for recurring MRP

Why left:

- These need real devices, providers, credentials, callback URLs, or hosted background processes.

What is needed:

- Device model/OS/scanner details.
- Provider choices and sandbox credentials.
- Deployment callback URLs.
- Scheduler hosting decision.

Best next packs:

- `MOBILE-RUNTIME-CAPTURE-SYNC-COMPLETION-01`
- `INTEGRATION-PROVIDER-LIVE-VERIFICATION-01`
- `BACKGROUND-SCHEDULER-JOBS-COMPLETION-01`

## Do I Need Help From You?

Yes, but not for everything.

### I Need Product Decisions From You

These should not be guessed because the wrong default can damage business correctness:

- Quote release and quote-to-order approval rules.
- Freight/add-less/round-off and tax applicability rules.
- Vendor return authorization rules.
- Landed cost allocation and inventory valuation method.
- Physical inventory freeze/recount/approval rules.
- Stock adjustment approval thresholds.
- Production costing/WIP/COGS depth.
- Work-order close gate checklist.
- BOM operation issue timing and routing machine assignment policy.
- Whether LP/PCID handling units are mandatory in V1 pilot.
- Report/export templates and dashboard priorities.

### I Need Environment Inputs From You

These can be coded without secrets, but cannot be verified live without inputs:

- Email provider sandbox/live credentials.
- WhatsApp provider details and approved templates.
- SMS provider details and sender ID.
- CRM provider and object mapping.
- Webhook callback target URL for delivery tests.
- Pilot device list for barcode/camera/offline sync.
- IIS/live server callback/public URLs for providers.

### I Do Not Need Help To Start These

Codex can implement these with conservative ERP defaults:

- Print-log/document-output foundation.
- Entity attachment authorization matrix.
- Customer/supplier assignment subrecords.
- Quote release state machine.
- Vendor return document skeleton.
- Landed cost document skeleton.
- Buyer queue read model.
- ECO linked-record resolver for known routes.
- Planning scheduler table and hosted-job shell.
- LP/PCID model if you confirm it is in scope.

## Recommended Next Execution Strategy

Do not wait for all eight future packs to arrive before closing these recurring foundations. Several residual gaps will repeat in every future pack unless the shared engines exist.

Recommended order:

1. `DOCUMENT-PRINT-EXPORT-ENGINE-COMPLETION-01`
   - Closes print/export blockers across item, quote, procurement, engineering, production, inventory, dispatch.

2. `ERP-WORKFLOW-STATE-MACHINE-COMPLETION-01`
   - Closes quote release, approvals, lifecycle gates, stock adjustment approval, physical inventory close, work-order close.

3. `P2P-VALUATION-AP-ACCOUNTING-COMPLETION-01`
   - Closes landed cost, vendor returns, AP liability/payment schedules/accounting bridge after your scope clarification.

4. `WAREHOUSE-LP-PHYSICAL-INVENTORY-COMPLETION-01`
   - Closes LP/PCID, handling units, stock adjustment, physical inventory freeze/count/close.

5. `REPORTING-DASHBOARD-BUILDER-COMPLETION-01`
   - Closes recurring export/report builder/dashboard builder blockers.

6. `INTEGRATION-PROVIDER-LIVE-VERIFICATION-01`
   - Builds adapters and config validation, then verifies with credentials when you provide them.

7. `MOBILE-RUNTIME-CAPTURE-SYNC-COMPLETION-01`
   - Closes barcode/camera/offline/device trust with real runtime evidence.

8. `FINAL-PILOT-READINESS-CLOSURE-01`
   - Role-wise UAT, backup/restore rehearsal, production-like smoke/performance, final blocker register.

## Practical Guidance For The Next 8 Packs

Each new pack should include a "shared dependency closure" phase. If a pack touches print/export, attachments, lifecycle, workflow, reporting, accounting, LP/PCID, provider delivery, or mobile runtime, it should either close the shared engine or explicitly reuse a previously closed engine. Otherwise the same disabled-with-reason gaps will keep appearing.

The stronger completion rule should be:

- A screen can be P0 complete with disabled P1/P2 workflows only if the disabled workflow is outside the pack's declared P0 gate.
- A product module is not pilot complete until the disabled workflows that users naturally expect for that module are implemented, not merely truthfully blocked.

## Bottom Line

The work so far removed many dangerous shallow states: dead buttons, first-line-only editors, free-text governed fields, numeric-as-text fields, fake uploads, and silent seeded live fallbacks. The remaining gaps are mostly legitimate ERP depth gaps.

The fastest way to reach a serious product is not to repeat screen-by-screen patching. The next work should build the shared engines that future packs need:

- print/export/document output,
- attachment authorization/versioning,
- workflow state machines,
- valuation/accounting bridge,
- warehouse LP/physical inventory,
- reporting/dashboard builder,
- integration provider runtime,
- mobile native runtime.

Once those exist, later packs can close screens instead of repeatedly disabling expected actions.
