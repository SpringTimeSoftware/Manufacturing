# STS Manufacturing ERP — Revised Master Workstream Roadmap

## Current product reality

The application has a broad manufacturing ERP foundation, but breadth is not completion. A commercially credible ERP needs deep transaction behavior, correct field/control semantics, server-side validation, audit, role control, traceability, documentation, reporting, integrations, and guided user help.

The current project direction must change from "many screens exist" to **domain completion with proof**.

## Roadmap philosophy

1. **Complete one workstream at a time.**
2. **No workstream is complete with critical violations remaining.**
3. **Every visible action must be working, disabled with reason, or hidden.**
4. **Every controlled master value must use lookup/select/search, not free text.**
5. **Every numeric/money/quantity/date field must use the correct control and validation.**
6. **Every transaction with lines must support multiline entry if the business process requires it.**
7. **Every workflow must have status, approval, audit, validation, save/reopen, and screenshot proof.**
8. **Every disabled item must either be intentionally out of scope or converted into working behavior.**
9. **No silent demo/seeded data in live authenticated mode.**
10. **No next workstream until current workstream gate is passed or formally blocked.**

## Workstreams

### WS01 — Runtime / UAT / Seed Truth
Purpose: ensure the running product has reliable live API behavior, role identities, seed data, smoke tests, role-wise UAT, and no fake seeded operational data.

### WS02 — Platform / Security / Admin / Extensibility
Purpose: complete user, role, permission, audit, approval, workflow, numbering, language, notification, tenant settings, UDF/extensibility, attachment authorization, rate limiting, and admin lifecycle controls.

### WS03 — Master / Resource / Commercial Foundation
Purpose: complete item, customer, supplier, taxonomy, UOM, packaging, media/document truth, resources, work centers, machines, price lists, discounts, tax, currency, terms, and related dashboards.

### WS04 — Engineering / Planning
Purpose: complete BOM, routing, operations, ECO, revisions, effectivity, alternates, engineering docs, MPS, MRP, BOQ, ATP, capacity, machine board, planning release flows, and planning dashboards.

### WS05 — Production / Shop Floor Execution
Purpose: complete work orders, job cards, material issue/return, labor/machine booking, shift production, downtime, production completion, FG receipt, scrap/rework, WIP valuation truth, and shop-floor dashboards.

### WS06 — Inventory / Quality / Dispatch / Documents
Purpose: complete inventory ledger, bin/warehouse movements, reservations, traceability, QC plans, inspections, NCR, holds/releases, CoA, packing list, dispatch, gate pass, e-way-bill fields, POD, returns, document/media proof.

### WS07 — Mobile / Integrations / AI / Reporting
Purpose: complete mobile live execution, device trust, offline sync, barcode/camera/media, email/SMS/WhatsApp, CRM integrations, AI assistant, report builder, dashboard builder, import/export repair, provider logs.

### WS08 — Finance / Accounting / GL / AP / AR
Purpose: complete chart of accounts, journal entries, fiscal periods, GL posting, AP/AR aging, trial balance, P&L, balance sheet, bank reconciliation, cost/profit centers, COGS, and accounting integrations.

### WS09 — Procure-to-Pay Deepening
Purpose: complete RFQ, quotation comparison, PO, approvals, GRN, inspection, 3-way match, purchase invoice, vendor payment scheduling, subcontract procurement, and landed cost.

### WS10 — Service / Warranty / AMC
Purpose: complete service call/complaint registration, warranty by serial/lot, AMC contracts, service dispatch, spares, RMA, repair, customer portal support status, service dashboards.

### WS11 — Final Release / Performance / Hardening
Purpose: complete final security, performance, accessibility, backup/restore, deployment, release notes, role-wise UAT, demo scripts, help system, documentation, and pilot gates.

## Completion strategy

The product must move through these workstreams sequentially. Some screens span multiple workstreams; when touched, their field/action truth must be updated but the workstream owner must avoid unrelated domain expansion.

## Why this roadmap is broader than the current repo roadmap

The current repo roadmap covers many manufacturing foundations, but it is thin in these areas:

- full accounting / GL / AP / AR
- full procure-to-pay
- service / warranty / AMC
- dashboard/report builder
- UDF/screen customization
- CRM integration
- WhatsApp/email/SMS operational provider workflows
- mobile live camera/barcode/media execution

Those are now first-class workstreams or explicit sub-scopes in this roadmap.
