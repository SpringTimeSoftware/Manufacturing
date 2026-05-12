# WS08 — Finance / Accounting / GL / AP / AR

## Purpose

Accounting, GL, AP/AR, bank, cost/profit center, COGS.

## Scope keywords

chart of accounts, journals, periods, trial balance, P&L, balance sheet, AP, AR, bank reconciliation, COGS.

## Functional completion contract

This workstream must cover all relevant screens and backend/API/DB flows in its scope. It must not stop at visual screen existence. It must prove business usability.

## Required checks

### Screens
- Every route in scope must be discoverable for the correct role.
- Every list page must support search/filter/find where applicable.
- Every deep editor must use centered modal or full-page workspace.
- Every screen must have useful empty states.
- Every screen must avoid internal/scaffold wording.

### Fields
- Controlled references must be governed lookup/select/search controls.
- Numeric values must use numeric/decimal/money controls.
- Dates must use date/date-range controls.
- Files/media must use real upload/metadata flow or be disabled/hidden.

### Actions
- Add/New/Create/Edit/Save/Delete/Inactivate/Activate/Print/Export/Upload/Approve/Release/Run/Convert must be working, disabled with reason, or hidden.
- No dead action may remain.

### Workflow
- status transitions must be explicit.
- approval rules must be explicit.
- audit must be written for state-changing events.
- save/load/reopen must work for editable records.

## Domain-specific depth

- Complete chart of accounts, fiscal periods, journal entry create/post/reverse.
- Complete trial balance, P&L, balance sheet basics.
- Complete AR/AP aging and outstanding reports.
- Complete bank reconciliation basics.
- Complete cost center/profit center allocation.
- Complete accounting posting hooks from sales, purchase, inventory, production, and COGS where in scope.

## Mandatory execution method

Codex must execute this workstream as a real implementation wave, not a documentation-only pass.

### Phase A — Baseline scan
- enumerate all screens, APIs, DB objects, actions, fields, workflows, reports, dashboards, and integrations in scope.
- create/update the workstream matrix under `docs/workstream-progress/WS08/`.
- classify each item as COMPLETE, PARTIAL, BLOCKED, DEMO-ONLY, or MISSING.

### Phase B — Functional implementation
- implement or repair all critical items in scope.
- add additive backend/API/DB support if required.
- add/update seed data where UAT proof needs it.
- do not do destructive schema resets.

### Phase C — Field/action/data/layout truth
- fix governed lookup fields.
- fix numeric fields.
- fix dead actions.
- fix upload/media truth.
- fix live/demo data truth.
- fix right-drawer deep editors.
- fix scroll/overflow.

### Phase D — Business rules
- implement required status/lifecycle rules.
- implement approval rules.
- implement dependency validation.
- implement role restrictions.
- implement audit entries for state-changing workflows.

### Phase E — Proof
Run:
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run build:host`
- `dotnet build src/server/STS.Mfg.sln`
- `dotnet test src/server/STS.Mfg.sln --no-build`
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`

Capture screenshots under `docs/codex-review-screens/WS08/`.
If a screen scrolls, capture max top/middle/bottom.

### Phase F — Final output
Create:
- `docs/codex-progress/WS08-output.md`
- `artifacts/review-packs/WS08-review-pack.zip`

The output must include:
- files changed
- screens completed
- fields corrected
- actions wired/disabled/hidden
- backend/DB changes
- UAT scenarios passed/blocked
- top remaining blockers
- validation results
- screenshot folder path

## Completion gate

This workstream is COMPLETE only when:
- critical blockers in scope = 0
- visible dead actions in touched scope = 0
- governed field violations in touched scope = 0
- numeric field violations in touched scope = 0
- required UAT scenarios are PASS or explicitly NOT-IN-SCOPE
- validation passes
- screenshots and review pack exist

If any critical item remains, mark the workstream PARTIAL or BLOCKED and do not move to the next workstream.
