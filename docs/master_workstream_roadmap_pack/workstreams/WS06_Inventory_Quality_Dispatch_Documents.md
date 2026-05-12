# WS06 — Inventory / Quality / Dispatch / Documents

## Purpose

Stock ledger, traceability, QC/NCR, dispatch/logistics/document proof.

## Scope keywords

inventory ledger, warehouse/bin, transfers, reservations, QC plans, inspection, NCR, dispatch, packing, gate pass, POD, documents.

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

- Complete inventory ledger, stock balance, warehouse/bin movement, inter-warehouse/inter-bin transfer.
- Complete reservations/allocation for order/job.
- Complete lot/serial/catch-weight traceability and trace views.
- Complete quality: inspection plans, incoming/in-process/outgoing inspection, NCR, hold/release, disposition, CoA if applicable.
- Complete dispatch: packing list, delivery challan, gate pass, vehicle/transporter, LR/courier tracking, e-way bill fields, POD, returns.
- Complete document/media proof and print/label/traveler templates.

## Mandatory execution method

Codex must execute this workstream as a real implementation wave, not a documentation-only pass.

### Phase A — Baseline scan
- enumerate all screens, APIs, DB objects, actions, fields, workflows, reports, dashboards, and integrations in scope.
- create/update the workstream matrix under `docs/workstream-progress/WS06/`.
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

Capture screenshots under `docs/codex-review-screens/WS06/`.
If a screen scrolls, capture max top/middle/bottom.

### Phase F — Final output
Create:
- `docs/codex-progress/WS06-output.md`
- `artifacts/review-packs/WS06-review-pack.zip`

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
