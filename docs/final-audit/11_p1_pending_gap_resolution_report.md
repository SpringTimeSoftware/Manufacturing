# P1 Pending Gap Resolution Report

Date: 2026-05-14

Scope: explanation and resolution plan for the remaining P1 items named after the Market V2 and workstream completion passes:

- MRP / capacity depth
- Report / dashboard builder depth
- Live provider credential verification
- Native mobile barcode / camera / offline / device trust

This report does not mark those items as complete. It explains why they remain pending, what is needed from the product owner or deployment environment, and the best implementation path to close them without shallow placeholders.

## Executive Summary

The remaining P1 items are not simple missing buttons. The repo already contains broad UI/API coverage for planning, reports, integrations, and mobile shells. They are pending because completion requires durable engines, persisted workflow state, real runtime verification, or native device behavior:

| Gap | Current State | Why Still Pending | What Is Needed From You | Best Path |
| --- | --- | --- | --- | --- |
| MRP / capacity depth | MPS save, MRP console/results, BOQ, capacity board, ATP and machine board exist | MRP/capacity is not yet a full planning engine with snapshots, exception ownership, conversion actions, archive/compare, finite-capacity writeback, and planner audit | Planning policies and operating assumptions | Build a deterministic planning-engine closure workstream |
| Report / dashboard builder depth | Report catalog, parameters, export queue, saved views and print pack surfaces exist | Builder authoring, dashboard layout persistence, sharing/publishing, signed downloads, report audit and reusable dataset contracts remain incomplete | Priority report/KPI list and export/template expectations | Build dataset registry first, then report builder, then dashboard builder |
| Live provider credential verification | Provider admin, connection reference, health/config check, webhook, preview and queued delivery flows exist | Real send/sync cannot be verified without live or sandbox credentials and provider-specific rules | Provider choices, sandbox credentials, sender IDs, webhook callback URLs | Implement provider adapters behind config, then run credential verification |
| Native mobile barcode/camera/offline/device trust | Mobile shell/typecheck/action-flow coverage exists | Native capture, scanning, proof media, offline replay, conflict handling, idempotency and device enrollment/revoke need device/runtime work | Pilot device list, platform targets, scanner/camera expectations, offline rules | Build mobile runtime closure after web operational flows stabilize |

## Evidence Used

Primary evidence reviewed:

- `docs/market-benchmark/MARKET_V2_P0_P1_CLOSURE_REPORT.md`
- `docs/market-benchmark/MARKET_V2_REMAINING_BLOCKERS.csv`
- `docs/codex-progress/WS04-output.md`
- `docs/codex-progress/WS07-output.md`
- `docs/codex-progress/WS11-output.md`
- `docs/final-audit/03_modern_manufacturing_erp_gap_scan.md`
- `docs/final-audit/06_merge_readiness_and_release_gates.md`

The latest Market V2 blocker file records these P1 items as `PARTIAL`, not missing. That means there is existing product surface, but it does not yet meet pilot-grade depth.

## 1. MRP / Capacity Depth

### Current State

The WS04 engineering/planning pass completed the touched scope:

- MPS planner can open a centered governed draft workspace.
- MPS save persists through live `/api/mps` create/update in authenticated live sessions.
- MRP run console, MRP results/exceptions, BOQ/requirements, capacity board, ATP, machine board and occupancy calendar are present.
- Governed fields and numeric/date controls were corrected for touched planning screens.

### Why It Is Pending

This is pending because a real planning system must be able to explain and preserve planning decisions. The current implementation has planning surfaces and selected writes, but the remaining depth is the planning engine behavior:

- MRP run input snapshots need to be persisted so a planner can prove what demand, stock, BOM, routing, lead time and calendar data produced the result.
- MRP run archive and compare are not complete, so planners cannot compare two runs and explain changed recommendations.
- Exception ownership is not complete, so shortages, late supply, capacity overloads and substitutions do not yet have assigned owners, due dates, comments and resolution status.
- MRP recommendations need conversion actions into purchase requisitions, work orders, transfer orders or reschedule actions.
- Capacity writeback is not complete: overload resolution, machine/work-center reschedule, alternate resource selection and calendar rebuild must update the plan, not just display it.
- Finite vs infinite capacity behavior must be chosen and made predictable.

### What Is Needed From You

Decisions needed:

- Planning mode: make-to-stock, make-to-order, or mixed by item/customer/order type.
- MRP run horizon: for example 30/60/90/180 days.
- Lot sizing rules: lot-for-lot, MOQ, fixed lot, economic batch, rounding multiples.
- Safety stock and reorder policy source: item master, warehouse-item profile, or planning parameter table.
- Capacity mode for V1 pilot: finite capacity required now, or infinite-capacity MRP with overload warnings.
- Exception ownership rules: planner by item group, work center, buyer, production supervisor, or branch.
- Conversion approval rules: whether MRP can directly create PR/WO/transfer drafts or must require approval.
- Calendar rules: shifts, holidays, overtime, machine downtime and alternate work centers.

### Best Way To Achieve

Do this as `PLANNING-DEPTH-CLOSURE-01`, not as scattered screen edits.

Recommended implementation order:

1. Add planning persistence tables for run snapshots, run versions, exception ownership, exception comments, recommendation actions and capacity plan versions.
2. Extend backend contracts for MRP run archive, compare, exception assignment, exception resolution and recommendation conversion.
3. Add deterministic MRP calculation rules using existing item, BOM, stock, PO, SO, forecast and work-order data.
4. Add capacity load calculation using routing operations, work centers, machine calendars and shift capacity.
5. Implement planner UI actions: assign exception, resolve exception, compare runs, convert recommendation, rebuild capacity plan, accept/reject reschedule.
6. Add audit records for every run, conversion and override.
7. Add tests for snapshot preservation, run comparison, conversion payloads, capacity overload detection and action truth.

No external credentials are required for this item.

## 2. Report / Dashboard Builder Depth

### Current State

The WS07 pass completed the touched reporting scope:

- Report catalog route exists.
- Report parameters route exists.
- Export jobs route exists.
- Saved views route exists.
- Print pack / traveler / labels were reverified.
- Queue report export is wired where supported.
- Report filters and numeric/date controls are governed.

### Why It Is Pending

This is pending because a world-class reporting module is more than a report list. The missing depth is authoring, publishing and governed delivery:

- Report builder layout editing is still not fully available.
- Dashboard builder persistence is not complete.
- Saved-view publishing/sharing remains incomplete.
- Signed export download/open-storage flow is not complete.
- Dataset contracts are not yet centralized enough for safe user-built reports.
- Role-based report visibility, parameter validation, scheduled delivery and export audit need stronger proof.
- KPI cards and dashboard layouts need persisted configuration, not hardcoded examples.

### What Is Needed From You

Inputs needed:

- Top priority standard reports for pilot, grouped by role.
- Must-have dashboards and KPIs: sales, production, QC, dispatch, purchase, inventory, finance.
- Export formats required: Excel, PDF, CSV, print layout.
- Whether users can build custom reports in V1 or only admins can.
- Whether dashboards can be shared company-wide, branch-wide, role-wide or private only.
- PDF branding/template rules: logo, header/footer, legal text, signature blocks.
- Retention rules for generated exports.

### Best Way To Achieve

Do this as `REPORTING-DASHBOARD-BUILDER-CLOSURE-01`.

Recommended implementation order:

1. Create a governed dataset registry for reportable entities and allowed columns.
2. Build backend query execution with parameter validation, role/data-scope enforcement and row limits.
3. Add report definition persistence: columns, filters, grouping, sorting, charts, owner, status and visibility.
4. Add dashboard definition persistence: widgets, layouts, KPI formulas, refresh cadence and drilldown target.
5. Add export job output storage with signed download URLs and audit.
6. Add report builder UI: dataset select, fields, filters, grouping, preview, save, publish.
7. Add dashboard builder UI: widget add/edit/remove, layout save, role sharing, drilldown.
8. Add tests for permission boundaries, parameter validation, export download authorization and dashboard persistence.

This item does not require external credentials unless scheduled email/WhatsApp delivery is included in the same pass.

## 3. Live Provider Credential Verification

### Current State

The WS07 and Market V2 continuation passes implemented substantial provider foundation:

- Provider admin exists.
- Provider connection and credential-reference maintenance exists.
- Provider health/configuration check exists.
- Webhook subscriptions and dispatch test event exist.
- Message preview and queue message flows exist.
- Missing config now surfaces as visible health/status feedback instead of pretending success.

### Why It Is Pending

This is pending because real provider delivery cannot be proven from code alone. The app can maintain configuration and queue/test flows, but live verification requires provider-specific credentials and sandbox/live endpoints:

- Email SMTP/API provider needs host/API key/sender/domain details.
- WhatsApp needs a provider account, phone number or sender, approved template behavior and callback URLs.
- SMS needs sender ID, API key, template rules and delivery callbacks.
- CRM sync needs target CRM choice, OAuth/API credentials, object mapping and dedupe rules.
- Webhook delivery needs target endpoint and signing/retry rules.
- Secret handling and rotation can be built, but production verification requires real secrets.

### What Is Needed From You

For each provider, provide either sandbox or live configuration:

- Provider name/vendor.
- Base URL/API endpoint.
- API key/client secret/token or secure way to load it into environment variables.
- Sender email/from domain, WhatsApp number, SMS sender ID, CRM tenant/client ID as applicable.
- Callback/webhook URL requirements.
- Approved message templates if WhatsApp/SMS template enforcement applies.
- Expected delivery rules: retry count, retry interval, failure escalation.
- Whether credentials should be per tenant, per company, or global.

Security preference:

- Do not paste secrets into documentation or source files.
- Store them in environment variables, IIS app settings, SQL encrypted secret store, or a deployment secret manager.
- The UI should show masked references and health, not raw secrets.

### Best Way To Achieve

Do this as `INTEGRATION-PROVIDER-LIVE-VERIFICATION-01`.

Recommended implementation order:

1. Finalize provider choice and config model for Email, WhatsApp, SMS, CRM and webhooks.
2. Add adapter implementations behind a common interface per channel.
3. Add secret resolution from environment/secure store with masked UI references.
4. Implement provider health probes and config validation per provider.
5. Implement test-send/test-sync flows that show missing config as an actionable alert.
6. Add delivery logs with provider request ID, response, retry status and final state.
7. Run sandbox verification and store evidence screenshots/log summaries.

Given your direction, actions should not be disabled just because config is missing. The correct behavior is: allow configuration/test flow, then show clear missing-config or provider-error feedback if required values are absent.

## 4. Native Mobile Barcode / Camera / Offline / Device Trust

### Current State

WS07 revalidated mobile at shell/typecheck/action-flow level:

- Mobile app source exists.
- Mobile typecheck passed.
- Mobile action-flow coverage plan passed.
- Mobile is positioned for execution actions, while web is setup/planning/admin.

### Why It Is Pending

This is pending because native mobile completion requires real device/runtime behavior, not only React Native screens:

- Barcode scanning must use camera/scanner APIs and validate scanned item/lot/bin/order values against live assignments.
- Camera/photo proof must capture media, store it, upload it, associate metadata and handle retry.
- Offline mode needs a local queue, idempotency keys, replay ordering, conflict detection and conflict resolution.
- Device trust needs enrollment, binding, revoke, lost-device behavior and audit.
- Mobile sync must prevent duplicate postings after retries or poor network.
- Live assignments must be pulled from backend work queues, not static demo lists.

### What Is Needed From You

Decisions and environment needed:

- Pilot device types: Android only, iOS only, or both.
- Scanner approach: phone camera, hardware scanner, Bluetooth scanner, or all.
- Required mobile workflows for pilot: job card, material issue, transfer, QC, dispatch proof, cycle count, downtime, handover.
- Offline tolerance: minutes/hours/days offline, and which actions can be done offline.
- Conflict policy: block conflicting replay, supervisor approval, or last-write rejection.
- Device trust policy: who enrolls devices, how revoke works, whether OTP/MFA is required.
- Media retention and compression requirements.
- Test devices or emulator target details.

### Best Way To Achieve

Do this as `MOBILE-RUNTIME-CLOSURE-01`, after the web operational workflows are stable.

Recommended implementation order:

1. Define mobile action contracts per workflow, including idempotency keys and offline-safe payloads.
2. Add backend device enrollment, trust, revoke and mobile session audit endpoints.
3. Add local mobile queue storage with replay state and conflict metadata.
4. Implement barcode/camera capture using native libraries and device permission handling.
5. Validate scans against live assignments and governed master data.
6. Implement upload/retry for photo proof and document metadata.
7. Add conflict-safe sync with server-side duplicate detection.
8. Run tests on actual target devices and capture evidence.

This should not be treated as a cosmetic mobile pass. It is a runtime engineering workstream.

## Recommended Sequence

Recommended order to close these P1 gaps:

1. `PLANNING-DEPTH-CLOSURE-01`
   - Reason: planning decisions drive production, purchase, inventory and delivery commitments.
   - Needs product policy decisions, but no external credentials.

2. `REPORTING-DASHBOARD-BUILDER-CLOSURE-01`
   - Reason: once workflows are stable, reports/dashboards should read from stable datasets.
   - Needs priority report/KPI list.

3. `INTEGRATION-PROVIDER-LIVE-VERIFICATION-01`
   - Reason: code foundation exists; closure depends on provider config and sandbox/live credentials.
   - Can proceed with adapters and health checks first, then complete verification when credentials arrive.

4. `MOBILE-RUNTIME-CLOSURE-01`
   - Reason: mobile must execute against stable backend work queues and live operational contracts.
   - Needs pilot device/platform decisions and real device validation.

## What I Need From You

Minimum decisions to start serious implementation:

### Planning

- Finite capacity required in V1 pilot: yes/no.
- MRP conversion actions allowed: create PR, WO, transfer, reschedule, all/some.
- Exception ownership model: planner, buyer, supervisor, item group, work center, or branch.
- Planning horizon and lot-sizing defaults.

### Reporting

- Top 20 reports and top 10 dashboards/KPIs for pilot.
- Who can create/publish reports: admins only or business users too.
- Export requirements: Excel/PDF/CSV and branded print templates.

### Integrations

- Selected providers for email, WhatsApp, SMS and CRM.
- Sandbox or live credentials through a secure channel.
- Sender/template/callback rules.

### Mobile

- Pilot device OS and scanner model.
- Mobile workflows included in pilot.
- Offline policy and conflict handling preference.
- Device enrollment/revoke policy.

## Product Judgment

The best route is not to mark these as complete by enabling more UI actions. These four areas need real engines and runtime proof:

- Planning needs a deterministic planning and capacity engine.
- Reports need a governed dataset and layout-builder foundation.
- Integrations need provider-specific adapters and live credential verification.
- Mobile needs native runtime, offline queue, scan/media validation and device trust.

Trying to close all four in one broad pass would risk shallow output again. The correct approach is four focused closure workstreams with validation, screenshots, and review packs, starting with planning depth.
