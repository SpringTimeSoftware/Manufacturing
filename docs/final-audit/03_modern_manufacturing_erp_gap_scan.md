# Modern Manufacturing ERP Gap Scan

Date: 2026-05-08
Branch audited: `main`

## Summary Verdict

The current product has the shape of a modern manufacturing ERP, but not the operating depth. It has modules, routes, API contracts, database packs, and clear governance artifacts. It still lacks transaction completeness, live workflow proof, mobile execution hardening, document/media governance, reporting depth, integration operations, and production-grade UAT evidence.

The right comparison is not against a generic CRUD ERP. The blueprint target is a manufacturing operating system for discrete and mixed-unit manufacturers. Against that target, the project is now controlled-demo ready on web after the lane merges and LONG-RUN-01 runtime repairs, but still not UAT-ready or pilot-ready.

## Master Data Depth

Current state: **PARTIAL / DEMO-ONLY in critical areas**.

Strengths:

- Item, customer, supplier, UOM, measurement, barcode, item variants, supplier lead time, pricing, discount, tax/currency/terms screens exist.
- V2 extension database packs exist for item media, documents, catalog, packaging, physical specs, aliases, customer references, vendor references, manufacturing policy, planning policy, inventory policy, and quality policy.
- Customer/supplier partner profile extension work exists in docs and tests.

Gaps:

- Item master is not yet V2-complete across media, catalog, UOM/conversions, packaging, physical specs, barcodes, variants, manufacturing, planning, inventory, quality, sales, purchase, customer refs, attachments, and audit.
- Customer and supplier masters are still not pilot-depth for legal identity, sites, contacts, credit/terms, compliance, documents, preferences, and transaction linkage.
- Resource setup screens for work centers, machines, and tools are missing in web routes even though backend/resource concepts exist.
- Controlled master-linked fields are governed by rules, but many screens still need stronger lookup/select wiring and source validation.

Modern ERP expectation:

- Every controlled field uses an owned master with lifecycle state, dependencies, audit, and activation blockers.
- Item, partner, resource, UOM, commercial, QC, and warehouse policies drive transactions without spreadsheet workarounds.

Required closure:

- Finish master/resource depth before claiming production, inventory, QC, dispatch, costing, or pilot readiness.

## Commercial Setup

Current state: **PARTIAL**.

Strengths:

- Price lists, discount schemes, tax/currency/terms screens and backend contracts exist.
- Sales order, quote, blanket order, forecast, MPS, and ATP routes exist.

Gaps:

- Pricing, discount, tax, currency, trade terms, customer terms, and approvals are not fully proven as live transaction drivers.
- Quote/order flows are not end-to-end complete with pricing, customer references, credit warning, attachments, demand conversion, and downstream order promise.
- ATP/order promise is still shallow/deferred.

Modern ERP expectation:

- Demand records use approved commercial setup and drive MPS/MRP/ATP without manual re-entry.
- Customer-specific pricing, UOM, references, packaging, delivery terms, and tax treatment are auditable.

Required closure:

- Complete commercial setup before final sales-order and dispatch proof workflows.

## BOM / Routing / ECO Depth

Current state: **PARTIAL, strongest functional area after recent waves**.

Strengths:

- BOM library, BOM editor, comparison, ECO, routing, operation standards, alternate items, and engineering documents screens exist.
- API and DB foundations exist for BOM/routing/ECO/alternate items.
- Recent engineering/planning progress improved action truth and modal workspace behavior.

Gaps:

- Release/approval/effectivity governance is not fully end-to-end.
- Engineering documents are not yet production-grade document control with versioning, preview/download authorization, expiry, and audit.
- Work center/machine/tool setup gaps weaken released routing reliability.
- Impact analysis across SO, MPS, MRP, WO, job cards, QC, and dispatch is not complete.

Modern ERP expectation:

- Released BOM/routing/ECO records are immutable, audited, effectivity-bound, dependency-checked, and visible downstream.

Required closure:

- Finish document control, approval gates, resource dependencies, effectivity, and impact trace before pilot.

## Planning And MRP

Current state: **PARTIAL**.

Strengths:

- MPS, MRP run console, MRP results, BOQ/requirements, capacity planning, machine board, occupancy calendar, stage-wise, order delivery, and ATP routes exist.
- `/api/mps`, `/api/mrp`, `/api/boq-requirements`, dashboards, and related planning APIs exist.

Gaps:

- MRP versioning, run input snapshots, exception ownership, conversion actions, and audit are incomplete.
- BOQ conversion to PR/WO is not proven end-to-end with realistic seed data.
- Capacity planning is weakened by resource setup gaps.
- Order promise/ATP remains shallow.

Modern ERP expectation:

- Planner can run MRP, explain every exception, convert BUY/MAKE/TRANSFER actions, and audit overrides.
- Capacity constraints, released routings, shift calendars, and machine downtime are visible in planning.

Required closure:

- Finish planning run versioning, exception workflow, conversion actions, capacity/reschedule workflows, and realistic seed data.

## Production Execution

Current state: **PARTIAL after runtime read repairs**.

Strengths:

- Work orders, job cards, machine board, occupancy, shift production, downtime, receipts, scrap/by-product, rework, and machine status screens exist.
- Work order, job card, downtime, production output, and machine board API concepts exist.

Gaps:

- LONG-RUN-01 repaired the prior UAT HTTP 500 failures for `/api/job-cards`, `/api/machine-board`, and `/api/downtime`; each returned HTTP 200 in the local host probe.
- Work order release validation, readiness panels, job-card assignment, timeline, transition rules, quantity reconciliation, and audit are incomplete.
- Production receipt, scrap, and rework are high-risk and not safe for pilot without item tracking, QC, inventory, source validation, and cost-hook clarity.
- Mobile production execution is seeded/local and not live.

Modern ERP expectation:

- Server owns state transitions, quantities, duplicate protection, source linkage, audit, and inventory effects.
- Web supervises; mobile executes with scan/media/offline safeguards.

Required closure:

- Finish state machines, add idempotent action replay, complete receipt/scrap/rework validation, and prove full WO-to-JC-to-output flow.

## Inventory / Traceability

Current state: **PARTIAL / BLOCKED by transaction depth**.

Strengths:

- Inventory balance, traceability, material issue, material return, stock transfer/putaway, and cycle count screens exist.
- Inventory, stock issue/return/transfer, cycle count, and traceability API groups exist.

Gaps:

- LONG-RUN-01 repaired the prior `/api/warehouses` failure; inventory still has limited transactional proof data.
- Lot/serial/catch-weight, reservation, QC hold, blocked stock, unified movement viewer, source linkage, and movement reconciliation are incomplete.
- Mobile material scan and stock movement are not live validated.

Modern ERP expectation:

- Every stock movement is tied to source, item tracking policy, warehouse/bin, lot/serial/catch-weight, audit, and availability calculation.
- Traceability can answer where-used and where-sent questions with document proof.

Required closure:

- Finish ledger/source linkage, tracking enforcement, trace packs, cycle count lifecycle, and mobile scan validation.

## Quality / NCR

Current state: **PARTIAL**.

Strengths:

- QC plans, incoming/in-process/final inspections, NCR/deviation screens and quality APIs exist.
- UAT showed quality APIs responding with HTTP 200.

Gaps:

- QC plan parameter library, versioning, sampling, measurement results, photo proof, hold/release authority, NCR disposition/root-cause lifecycle, and rework/scrap linkage remain incomplete.
- LONG-RUN-01 seeded `DEMO-LOT-001`; the traceability lot route returned HTTP 200 in the local host probe.

Modern ERP expectation:

- Quality state changes gate inventory, production, and dispatch.
- NCR links source, defect, containment, disposition, root cause, rework/scrap, attachments, approval, and audit.

Required closure:

- Build first-class hold/release queue, parameterized inspection execution, NCR lifecycle, and source proof.

## Dispatch / Proof

Current state: **PARTIAL**.

Strengths:

- Pack list, dispatch planning, shipment/delivery, print pack, stage/order dashboards, and dispatch APIs exist.
- UAT showed dispatch APIs responding with HTTP 200.

Gaps:

- Pack hierarchy, labels, lot traceability, customer references, packing instructions, shipment proof, loading proof, delivery proof, customer-site selection, and document templates are incomplete.
- LONG-RUN-01 seeded a pack-list print proof path; `/api/reports/pack-lists/95001/print` returned HTTP 200 in the local host probe.
- Mobile dispatch proof is seeded and not live task driven.

Modern ERP expectation:

- Dispatch cannot ship held/unreleased/unpacked stock.
- Proof media, scans, labels, vehicle/seal data, customer signature, and documents are tied to shipment audit.

Required closure:

- Finish pack/label/template/proof workflows and mobile proof sync.

## Documents / Media

Current state: **DEMO-ONLY / PARTIAL**.

Strengths:

- Attachment storage abstraction and metadata concepts exist.
- Document/media fields appear in item, engineering, mobile, QC, dispatch, and production specs.

Gaps:

- No production-grade cross-module document register with versioning, expiry, approval, preview/download authorization, media proof upload, or template governance.
- Security review calls out attachment authorization tests as a pilot blocker.

Modern ERP expectation:

- Documents and media are first-class audited objects with scope, lifecycle, access, and source transaction linkage.

Required closure:

- Complete document control, media proof upload, template registry, authorization tests, and audit viewer integration.

## Approvals / Audit

Current state: **PARTIAL**.

Strengths:

- Approval workbench, notification center, audit write concepts, and role/security docs exist.
- Action truth matrix improves visible action honesty.

Gaps:

- Audit trail viewer is missing.
- Workflow versioning, approval comments/history, status transition governance, and least-privilege audit access need completion.
- Many workflow actions are disabled because real transitions are not finished.

Modern ERP expectation:

- Every lifecycle transition is role-scoped, reasoned, audited, and reviewable by authorized users.

Required closure:

- Build audit viewer, finalize workflow/approval status transitions, and add authorization tests.

## Mobile

Current state: **DEMO-ONLY**.

Strengths:

- Mobile app shell and screens exist for login, context, home, notifications/approvals, job cards, execution, material scan, inventory movement, downtime, QC, receipt/rework, handover/media, dispatch proof, stage board, device utilities, and sync status.
- Offline queue concepts and seeded screens exist.

Gaps:

- Mobile relies heavily on `mobileSeedData`.
- Live task assignment, secure session/device trust, scan validation, proof media, offline replay, idempotency, conflict handling, and RN component/device tests are not production-ready.

Modern ERP expectation:

- Operators can complete assigned tasks with live validation, scan guardrails, media proof, queue visibility, and no duplicate/lost posts.

Required closure:

- Mobile hardening is a critical separate wave and should remain blocked from pilot until duplicate prevention and sync integrity are proven.

## Integrations / AI

Current state: **PARTIAL / MISSING UI**.

Strengths:

- Integration and AI controller files, provider abstractions, draft-only AI safety concepts, and health checks exist.
- Security review says AI blocks arbitrary SQL and auto-write behavior.

Gaps:

- AI provider setup, prompt templates, operations assistant, daily summary review, provider health UI, webhook UI, import repair UI, notification provider UI, and report catalog are missing or partial.
- LONG-RUN-01 repaired PlatformAdmin read access for integration and AI provider endpoints; provider UI, secret workflows, and adapter operations remain incomplete.
- Real Email/SMS/WhatsApp/AI providers are placeholders until production secrets and adapters are bound.

Modern ERP expectation:

- Providers are configured through masked UI, health is visible, retries are auditable, imports are repairable, reports are role-scoped, and AI remains draft-safe with citations.

Required closure:

- Build admin UIs, fix authorization, bind real providers behind secrets, and add audit/health/reporting tests.

## Release / Security / UAT Readiness

Current state: **DEMO-READY for controlled web demo; not UAT-ready or pilot-ready**.

Strengths:

- Production readiness and security hardening reviews exist.
- Build/test/publish gates are defined.
- UAT matrix and localhost smoke/UAT reports exist.

Gaps:

- UAT has 0 full role passes.
- Rate limiting, attachment authorization, secret rotation, provider outbound delivery, audit viewer access, mobile device trust, and real seed data are unresolved.
- The prior role-critical read-route runtime failures were repaired in LONG-RUN-01; UAT evidence still remains partial because workflow depth and mobile live execution are incomplete.

Modern ERP expectation:

- Customer pilot requires all role-critical flows to pass with live data, audit, security controls, performance thresholds, backup/restore runbooks, and no critical endpoint failures.

Required closure:

- Complete the roadmap in `05_completion_roadmap.md`, then rerun smoke, UAT, security, publish, performance, and recovery gates.
