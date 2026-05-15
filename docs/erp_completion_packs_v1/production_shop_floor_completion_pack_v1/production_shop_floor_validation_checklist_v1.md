# Production Shop Floor Validation Checklist v1

Use this checklist after Codex implementation.

## Workbook

- [ ] `Current_Mapping` completed from repo scan.
- [ ] `Gap_Template` populated with observed gaps.
- [ ] P0 field/action/workflow/test rows have status/evidence.
- [ ] Review pack references are added.
- [ ] No P0 rows remain unknown without explicit owner/rationale.

## Production order lifecycle

- [ ] Create manual production order.
- [ ] Convert/source-link from planned order or demand where available.
- [ ] Save/reopen header fields.
- [ ] Copy/persist BOM/component and routing/operation lines.
- [ ] Run material readiness check.
- [ ] Run capacity/document/QC readiness checks or disable with reason.
- [ ] Release with gates.
- [ ] Hold/resume/cancel with reason and audit.
- [ ] Start operation.
- [ ] Confirm operation.
- [ ] Receive output.
- [ ] Close only after close gates pass.
- [ ] Reverse/correct controlled transactions with reason.

## Field truth

- [ ] Item, BOM, routing, work center, machine, UOM, warehouse, bin, lot, serial, operator, reason code and status are not free text.
- [ ] Quantity, time, duration, cost and percentages are numeric fields.
- [ ] Dates/times are date/time fields with ordering/timezone/period validation.
- [ ] API rejects invalid lookup/numeric/date payloads.
- [ ] DB schema uses FKs/checks/typed columns where applicable.

## Transaction-line truth

- [ ] Component issue/backflush/return supports multiple lines.
- [ ] Add Line works.
- [ ] Remove Line works.
- [ ] Validate All validates every row.
- [ ] Post Issue posts every row.
- [ ] Reopen/API shows every row.
- [ ] No `lines[0]`, `firstLine`, first-row-only save, first-row-only totals or card-per-line desktop transaction entry.

## Shop floor

- [ ] Dispatch board uses real released operations.
- [ ] Work area/work center/machine filters are governed lookups.
- [ ] Operator terminal starts real registrations.
- [ ] Completion posts confirmation, quantities and time.
- [ ] Scrap/rework/reject require reason.
- [ ] Downtime machine status persists if visible.
- [ ] Traveler/label/document actions are real or disabled with reason.
- [ ] Barcode/QR opens exact entity/action or feature disabled.

## Traceability and quality handoff

- [ ] Tracked components require lot/serial.
- [ ] Finished goods require lot/serial according to item policy.
- [ ] Parent-child genealogy handoff exists.
- [ ] QC inspection/hold/NCR actions are real or disabled with reason.

## Evidence

- [ ] Backend tests passed.
- [ ] Frontend tests passed.
- [ ] Build/lint/typecheck passed.
- [ ] Anti-pattern scans passed.
- [ ] Screenshot gates captured.
- [ ] API/DB evidence captured.
- [ ] RBAC evidence captured.
- [ ] Review pack created.
- [ ] Commit hash recorded.
