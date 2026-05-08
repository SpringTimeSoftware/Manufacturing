# Completion Roadmap

Date: 2026-05-08
Branch audited: `main`

## Roadmap Principles

- Finish runtime reliability before adding workflow breadth.
- Finish master/resource foundations before irreversible production, inventory, quality, and dispatch posting.
- Finish web transaction truth before mobile pilot.
- Keep actions honest: every visible action is working, hidden, or disabled with a business-safe reason.
- Merge small, auditable waves into `main` only after validation and screenshot/proof evidence.

## Branch / Lane Recommendation

Wave 1 has been executed directly on `main` for LONG-RUN-01 after the Engineering/Planning and Production/Execution lane merges. Use short-lived branches from `main` for the remaining waves, one branch per wave:

- `audit/platform-security-admin`
- `audit/master-resource-foundation`
- `audit/engineering-planning-closeout`
- `audit/prod-exec-transaction-depth`
- `audit/inventory-quality-dispatch-depth`
- `audit/mobile-execution-hardening`
- `audit/integrations-ai-reporting`
- `audit/final-release-gates`

Avoid parallel lanes until `main` has the latest accepted lane work. Parallel branches make action-truth and screenshot evidence stale unless merged frequently.

## Wave 1: Runtime UAT And Seed Repair

Status: Completed in LONG-RUN-01 for the highest-value blockers found by FINAL-AUDIT-02.

Priority: Completed baseline / continue only for newly discovered runtime blockers

Why first:

- UAT had 0 full role passes before LONG-RUN-01.
- Several representative APIs failed or lacked proof data.
- Without role seeds and scenario data, later workflow claims cannot be verified.

Scope:

- Added/repaired live bootstrap identities for SalesCoordinator, PurchaseManager, and PlantHead.
- Repaired documented HTTP 500 endpoints: warehouses, customers, suppliers, job cards, machine board, downtime.
- Repaired PlatformAdmin read authorization for integration/AI provider endpoints.
- Added guarded UAT runtime seed data for the highest-value smoke/UAT paths, including production job card/downtime, traceability lot, stock balance/transaction, dispatch shipment, and pack-list print proof.
- Added a machine-board stored procedure for the runtime board read model.
- Remaining scenario seed depth still needs expansion in later waves for mixed UOM, outside processing, and overdue supplier/machine blockage.

Stop gates:

- No role-critical endpoint returns HTTP 500 in the LONG-RUN-01 probe.
- All web UAT roles authenticate in the LONG-RUN-01 probe.
- Seeds are idempotent and documented in `database/README.md`.

Merge criteria:

- `dotnet build`
- `dotnet test`
- web typecheck/test/build/build:host
- host publish
- localhost smoke report updated
- role-wise UAT rerun updated

## Wave 2: Platform, Security, Audit, And Admin Completion

Priority: Critical

Why second:

- Approval, audit, authorization, rate limiting, and admin controls are prerequisites for all lifecycle actions.

Scope:

- Complete audit trail viewer API/UI.
- Add rate limiting for login, AI, import/export, and integration endpoints.
- Add attachment download/preview authorization tests.
- Finish user, role, permission, workflow, numbering, tenant settings, language, notification, and approval lifecycle depth.
- Add provider secret rotation/runbook documentation and UI-safe masked references.

Stop gates:

- No unaudited status transition.
- No attachment preview/download without scope authorization.
- No admin action without role policy.

Merge criteria:

- All platform/admin action-truth rows working or disabled with reason.
- Security hardening review updated.
- Admin screenshots and tests updated.

## Wave 3: Master, Resource, And Commercial Foundation

Priority: Critical

Why third:

- Production, inventory, QC, dispatch, and planning cannot be pilot-safe on shallow item/customer/supplier/resource data.

Scope:

- Complete Item V2 tabs: core, classification, media, catalog, UOM, packaging, physical specs, barcode/labels, variants, manufacturing, planning, inventory, quality, sales, purchase, customer refs, supplier refs, documents, audit.
- Complete customer/supplier legal/site/contact/terms/compliance/document/profile depth.
- Complete work center, machine, tool/resource setup screens.
- Complete price list, discount, tax/currency/trade terms workflows.
- Enforce lookup/select controls for controlled master fields.

Stop gates:

- Manufactured item cannot activate without required BOM/routing/resource/QC policies.
- Sellable/purchased items cannot activate with missing commercial/vendor basics.
- No controlled master-linked free text in touched screens.

Merge criteria:

- Master screens screenshot pack.
- Updated V2 traceability/action truth.
- Tests for activation blockers and controlled lookup behavior.

## Wave 4: Engineering And Planning Closeout

Priority: High

Why fourth:

- Engineering/planning is the current strongest functional area; close it before deeper execution waves depend on it.

Scope:

- Complete BOM release/approval/effectivity validation.
- Complete routing release and resource dependency validation.
- Complete ECO impact checklist and implementation closure.
- Complete engineering document control.
- Complete MPS/MRP versioning, run snapshots, exception ownership, BOQ conversion, capacity overload and reschedule request workflows.
- Complete ATP/order promise or keep it hidden until implemented.

Stop gates:

- No released BOM/routing with missing item, UOM, route, resource, or document dependencies.
- BOQ conversion creates real PR/WO records or remains hidden/disabled.

Merge criteria:

- Planner scenario passes from demand to MRP/BOQ to PR/WO recommendation.
- Screenshot evidence for BOM, routing, ECO, MRP, BOQ, capacity.

## Wave 5: Production Execution Transaction Depth

Priority: Critical

Why fifth:

- This is the shop-floor core. It must wait until master/resource/planning foundations are trustworthy.

Scope:

- Complete work order release/re-release/hold/close validation.
- Complete job-card assignment/start/pause/resume/complete and append-only timeline.
- Complete shift production reconciliation.
- Complete material issue/return source linkage from WO/JC.
- Complete downtime overlap/escalation and machine status effects.
- Complete production receipt, scrap/by-product, and rework with item tracking, QC, source status, and audit.

Stop gates:

- No irreversible production or stock posting without server validation, idempotency, and audit.
- Quantity good/reject/scrap cannot exceed allowed source quantities without approval.

Merge criteria:

- End-to-end WO-to-JC-to-output test.
- Production screenshot pack.
- Updated action truth and UAT evidence.

## Wave 6: Inventory, Quality, Dispatch, And Documents

Priority: Critical

Why sixth:

- Inventory, QC, and dispatch close the order-to-delivery loop and enforce traceability.

Scope:

- Complete inventory movement ledger, stock balance, reservations, transfers, putaway, issue/return, cycle count, lot/serial/catch-weight, hold/blocked stock, and trace packs.
- Complete QC plans, inspections, parameter results, holds/releases, NCR/deviation lifecycle, root cause, disposition, rework/scrap linkage, and evidence.
- Complete pack list, dispatch planning, shipment/delivery, loading/delivery proof, customer references, labels, traveler, print packs, and document templates.
- Complete cross-module document/media governance.

Stop gates:

- Held/unreleased stock cannot dispatch.
- Traceability can show source-to-customer chain for seeded scenarios.
- Print/label/proof outputs are template-governed and audited.

Merge criteria:

- Inventory/QC/dispatch end-to-end UAT pass.
- Screenshot and document evidence.
- Action truth updated for all touched actions.

## Wave 7: Mobile Execution Hardening

Priority: Critical

Why seventh:

- Mobile must follow server workflow truth; otherwise it can double-post or create unaudited transactions.

Scope:

- Live login/context/device trust.
- Live assigned job cards and role-specific tasks.
- Scan validation for job card, item, bin, lot/serial, pack, shipment.
- Offline queue with idempotency keys, retry, conflict handling, and visible failed-action state.
- Media upload for QC, dispatch proof, downtime, handover, NCR, and production evidence.
- RN component/device test harness or documented supported alternative.

Stop gates:

- Duplicate taps cannot double-post.
- Offline final actions cannot silently fail.
- User cannot execute in stale context without warning.

Merge criteria:

- Mobile coverage plan and runnable validation.
- Device/sync UAT evidence.
- Mobile screenshots for each execution flow.

## Wave 8: Integrations, AI, Reporting, And Import/Export

Priority: High

Why eighth:

- Integrations and AI must be safe overlays on reliable core data.

Scope:

- Integration provider UI, webhooks, event logs, retry/replay, notification templates.
- Real provider adapter binding behind secret references.
- AI provider setup, prompt templates, operations assistant, daily summary review, delay-risk digest, translation workflow.
- Report catalog, parameters, saved views, export governance.
- Import preview, row-level validation, failed-row repair, and export audit.

Stop gates:

- AI remains draft-only unless an approved workflow explicitly commits an action.
- Secrets never display in UI or logs.
- Import cannot silently partially apply without row-level evidence.

Merge criteria:

- Integration/AI/reporting screenshots.
- Provider health and redacted delivery tests.
- Import/export repair tests.

## Wave 9: Final Release, Security, UAT, Performance, And Recovery Gates

Priority: Critical

Why last:

- Release signoff must evaluate the full merged product, not individual branches.

Scope:

- Full build/test/publish validation.
- Full role-wise UAT.
- Security hardening review rerun.
- Performance smoke for dashboard/list/report endpoints.
- Backup/restore and deployment runbooks.
- Accessibility and responsive layout checks for critical screens.
- Final screenshot pack and release notes.

Stop gates:

- No critical auth, authorization, data integrity, audit, mobile sync, deployment, or endpoint reliability blockers.
- No visible dead actions.
- No internal/scaffold wording in production UI.

Merge criteria:

- All gates in `06_merge_readiness_and_release_gates.md` pass.
- Customer pilot release notes and known backlog are approved.
