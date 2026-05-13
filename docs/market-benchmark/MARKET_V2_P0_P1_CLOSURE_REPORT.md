# MARKET V2 P0/P1 Closure Report

Run ID: MARKET-V2-MASTER-COMPLETION-RUNNER-01

## Closed This Run

- Added and passed expanded ERP completion gates, including upload truth and menu-route truth.
- Implemented Quote multiline add/remove/save-all-lines behavior.
- Implemented Purchase Requisition multiline add/remove/save-all-lines behavior.
- Implemented Purchase Order multiline add/remove/save-all-lines behavior.
- Closed governed-field and numeric-field audit failures.

## Remaining P0 Gaps

- Sales: Quote multiline draft entry - Add Line, Remove Line, per-line item/UOM/quantity/date, and save-all-lines are implemented. Unit price, discount, and tax are disabled because the backend line contract does not yet include pricing/tax fields.
- Procurement: Purchase order multiline draft - PO draft now maintains all lines with Add Line, Remove Line, governed item/UOM, quantity, date, validation, and save-all-lines payload. Unit price and tax remain disabled pending procurement pricing/tax contract.
- Production: Work Order lifecycle - Release/generation/posting lifecycle remains a P0 blocker requiring broader production transaction design.
- Production: Job Card lifecycle - Execution capture is wired for touched scope; generation, posting, and irreversible proof remain.
- Production / Inventory: Material issue / material return / stock transfer posting - Posting actions are honest but not complete; full stock effect and audit require dedicated inventory posting implementation.
- Production: Production receipt / scrap / by-product / rework - Receipt/scrap posting remains P0; rework creation remains controlled by disabled reasons.
- Inventory: Stock view / bin transfer / reservation / traceability / cycle count - Cycle-count save/post exists; ledger, reservation/allocation, and complete lot/bin posting remain.
- Quality: QC / incoming inspection / in-process inspection / final inspection / NCR / hold-release / CoA - Hold/release and NCR close are touched-scope complete; inspection parameter capture, disposition, root cause, and policy enforcement remain.
- Dispatch: Dispatch / logistics / pack list / shipment / proof / labels / e-way / carrier - Shipment proof status/upload exists; shipment close, label/e-way/carrier closeout, and proof approval remain.
- Release: Performance / backup / role UAT / production hardening - Repo validation passes; production-like performance, backup/restore rehearsal, irreversible workflow proof, and role-wise UAT remain P0.

## Remaining P1 Gaps

- Sales: Sales order drafting - New order draft remains disabled with reason until order-entry workflow is enabled.
- Sales: Blanket order schedules - Schedule authoring remains blocked pending sales order lifecycle.
- Sales / Planning: Demand forecast lines - Forecast import/create remains disabled until forecast lifecycle is implemented.
- Sales / Planning: Available to Promise - ATP visibility exists; simulation/commit writeback remains partial.
- Procurement: Subcontract order - Outside processing plan exists; receive-back, issue/return, and accounting-dependent closeout are incomplete.
- Procurement: GRN / PO receipt / invoice match / full Procure-to-Pay - Operational receiving is a P1 gap. Invoice/AP matching depends on V1 scope decision.
- Planning: MPS / MRP / BOQ / Capacity / forecasting depth - MPS save exists; MRP exception ownership/archive/compare and capacity writeback remain P1.
- Reports: Reports / dashboards / parameters / export / print / builder / saved views - Catalog exists; report builder, dashboard builder, publishing, and signed export depth remain.
- Integrations: Email / WhatsApp / SMS / CRM / provider integrations - Provider admin/health exists; external credentials, delivery, secret rotation, WhatsApp/email/SMS/CRM sync require product-owner/provider decisions.
- Mobile: Mobile execution / barcode / camera / offline sync / device trust - Native capture, barcode, offline replay, media, device trust, and live sync remain P1/P0 depending on pilot scope.

## Stop Rationale

After the dependency-first P0 line-depth and audit gates were closed, the next remaining P0 items require broad production/inventory/quality/dispatch posting and pilot hardening workstreams with backend, DB, audit, and irreversible transaction semantics. Those are not safe to invent as incidental changes inside the benchmark runner.
