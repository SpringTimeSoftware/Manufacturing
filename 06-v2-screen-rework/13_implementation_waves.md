# V2 Screen Rework Implementation Waves

## Wave 1: Critical Login, Auth, Shell, And Content Fixes

- Included screens: Login, forgot password, global shell, sidebar, top context controls, role home dashboard, notifications/approvals entry points.
- Backend required: super admin seed or `SuperAdmin` role policy; stale-token cleanup support if frontend-only cleanup is insufficient.
- DB required: minimum seeded super admin user/role/scope if not already present.
- Tests required: auth/session restoration, stale-token cleanup, login copy regression, sidebar collapse, header layout, forgot-password route, role menu visibility.
- Smoke/UAT acceptance: user can log in as Super Admin, see all menus, switch context, open platform/admin/home screens, and no internal copy appears.
- Estimated risk: HIGH because it affects first impression and auth/session flow.
- Stop gates: no internal/dev text, no overlapping header, no stale token blocking login, no accidental all-menu bypass without audit.
- Exact next recommended prompt: `/06-v2-screen-rework/prompts/WAVE01_critical-login-auth-shell-content-hardening.md`.

## Wave 2: Platform And Admin Depth

- Included screens: Users, roles, permissions, notifications, approvals, tenant settings, workflow setup, numbering setup, language/translation setup, audit viewer.
- Backend required: write endpoints for users/roles/settings/workflow where missing; audit read model; approval history depth.
- DB required: permission/action scope tables, workflow versioning, numbering concurrency, audit event tables if incomplete.
- Tests required: role menu/action restrictions, no admin lockout, approval decisions, numbering uniqueness, settings audit.
- Smoke/UAT acceptance: PlatformAdmin can configure admin data without fallback and changes are auditable.
- Estimated risk: HIGH.
- Stop gates: no hidden fallback for admin writes, no unscoped permission grants, no unaudited status changes.

## Wave 3: Organization And Setup Depth

- Included screens: Company, branch, department, warehouse, bin, shift, work center, machine, tool/resource, plant calendar/capacity setup.
- Backend required: resource setup APIs already exist for some records; missing UI routes need live reads/writes.
- DB required: calendar/capacity/resource constraints and indexes where incomplete.
- Tests required: org CRUD, activation/deactivation blockers, context switch, warehouse/bin policy, shift cross-midnight.
- Smoke/UAT acceptance: setup records can be created, activated, used in context and downstream screens.
- Estimated risk: MEDIUM.
- Stop gates: cannot deactivate records with active dependencies; no broken company/branch APIs.

## Wave 4: Master Data Deep Rework

- Included screens: item master, item groups, item attributes, variants, aliases, barcodes, packaging, media, catalog, customer, supplier, pricing, discounts, tax, currency, terms.
- Backend required: additive V2 master APIs and compatibility adapters.
- DB required: item media/documents/catalog/packaging/specs/replenishment, customer/supplier sites/contacts/terms/compliance, pricing/discount/tax/currency.
- Tests required: item activation blockers, customer/supplier validations, barcode uniqueness, catalog publish, price/discount effective dates.
- Smoke/UAT acceptance: item/customer/supplier records can support sales, planning, procurement, inventory, QC, dispatch, and catalog scenarios.
- Estimated risk: CRITICAL.
- Stop gates: do not proceed to cost-sensitive receipt/scrap/rework expansion until this wave passes.

## Wave 5: Engineering And Planning Depth

- Included screens: BOM list/detail/revision/tree/comparison, routing, operations, ECO, alternate items, engineering documents, MPS, MRP, BOQ, capacity, machine board, occupancy, order delivery, stage wise, ATP.
- Backend required: deeper release/status/approval actions and planning conversion endpoints where missing.
- DB required: effectivity, approval, document, capacity, planning versioning, exception ownership.
- Tests required: BOM release blockers, MRP run/version, BOQ conversion, capacity overload, dashboard drilldown.
- Smoke/UAT acceptance: planner can move from demand to requirements to WO/PR decisions with auditable exceptions.
- Estimated risk: HIGH.
- Stop gates: no released BOM/routing with missing item/UOM/resource dependencies.

## Wave 6: Production And Execution Depth

- Included screens: work orders, job cards, execution timeline, shift entry, material issue/return, downtime, production receipt, scrap/by-product, rework, machine queue.
- Backend required: stronger status transitions, idempotent mobile action replay, production transaction validation.
- DB required: production event ledger, receipt/scrap/rework linkage, media proof, audit.
- Tests required: state transitions, duplicate action protection, quantity reconciliation, lot/serial rules.
- Smoke/UAT acceptance: supervisor/operator can execute a controlled manufacturing flow end to end with audit.
- Estimated risk: CRITICAL.
- Stop gates: no irreversible stock/production posting without server validation and audit.

## Wave 7: Inventory, Quality, And Dispatch Depth

- Included screens: stock view, movement, transfers, cycle count, traceability, QC plans, inspections, NCR, hold/release, pack list, shipment, dispatch proof, print pack, traveler, labels.
- Backend required: traceability, hold/release, document/template and proof endpoints where incomplete.
- DB required: movement ledger, count variance, QC parameter results, NCR lifecycle, label/template metadata.
- Tests required: movement reconciliation, hold/release restrictions, QC pass/fail, dispatch proof, label scan.
- Smoke/UAT acceptance: inventory and QC state changes are traceable from source to dispatch.
- Estimated risk: HIGH.
- Stop gates: no dispatch of held/unreleased stock.

## Wave 8: Reports, Integrations, And AI

- Included screens: AI assistant, translation assistant, provider setup, webhooks, import/export, reports, notification providers, provider health, audit/report viewer.
- Backend required: provider management, draft-only AI review, report catalog, row-level import repair.
- DB required: provider credentials metadata, prompt templates, AI run registry, integration event logs, report catalog.
- Tests required: AI draft gating, secret masking, webhook retry, import error repair, report permissions.
- Smoke/UAT acceptance: admins can configure providers safely and users can run approved reports.
- Estimated risk: HIGH.
- Stop gates: AI must not auto-write or expose restricted data.

## Wave 9: Mobile Hardening

- Included screens: all mobile screens M001-M024.
- Backend required: mobile session/device trust, assignment APIs, offline sync/replay, media upload, idempotency.
- DB required: mobile queue/event IDs, device registry, media metadata, sync conflict logs.
- Tests required: supported mobile validation, offline queue, sync retry, duplicate prevention, scan validation.
- Smoke/UAT acceptance: operator can complete assigned job, scan material, capture QC/proof, and sync reliably.
- Estimated risk: CRITICAL.
- Stop gates: no pilot if mobile can double-post or silently lose actions.

## Wave 10: Final Smoke, UAT, Security, And Performance

- Included screens: all completed production screens and reports.
- Backend required: performance tuning, audit review, security controls, provider health, readiness checks.
- DB required: indexes, constraints, retention, backup/restore runbook.
- Tests required: full build/test/publish, smoke, role-wise UAT, accessibility, performance, security hardening.
- Smoke/UAT acceptance: all in-scope roles pass acceptance matrix with no critical blockers.
- Estimated risk: MEDIUM.
- Stop gates: no critical security, auth, data integrity, or deployment failures.
