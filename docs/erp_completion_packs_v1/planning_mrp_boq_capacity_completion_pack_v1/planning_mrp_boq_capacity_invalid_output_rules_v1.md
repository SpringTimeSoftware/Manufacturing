# Planning / MPS / MRP / BOQ / Capacity Invalid Output Rules v1

Any of these conditions invalidates the implementation or pack output.

## INV-001 — Pack only provides a summary or representative fields

Reject immediately; replace with field-level workbook and contracts.

## INV-002 — Benchmark rows have vendor names but no official source URL

Reject; add Source_References and source URL columns.

## INV-003 — Codex prompt tells Codex to infer ERP depth

Reject; field/action/workflow contracts must be explicit.

## INV-004 — No action contract for visible buttons

Reject; every action must be working/disabled/hidden.

## INV-005 — No workflow contract from MPS to MRP to conversion/capacity

Reject; plan-to-execution flow must be tested.

## INV-006 — No save/reopen tests

Reject; UI-only persistence is not acceptable.

## INV-007 — No anti-pattern scans

Reject; include scan commands and logs.

## INV-008 — No screenshot/evidence gates

Reject; screenshots and review pack are mandatory.

## INV-009 — Uses card-per-line desktop editable planning rows

Reject; desktop transaction planning lines require compact grids.

## INV-010 — Allows item/UOM/warehouse/work center/machine/supplier as free text

Reject; governed master-linked fields must be lookup-backed.

## INV-011 — Allows quantity/capacity/lead time/date fields as unrestricted text

Reject; typed controls and server validation required.

## INV-012 — Implements fake upload/export/email/print buttons

Reject; real action or disabled/hidden with reason.

## INV-013 — Claims capacity complete with only badges or KPIs

Reject; work center/machine bucket detail and source operations required.

## INV-014 — Claims MRP complete without snapshots and run audit

Reject; run history, input/output snapshots, deltas and error details required.

## INV-015 — Claims planned order conversion complete without real target docs

Reject; target PO/WO/TO/PR document links and line details required.

## INV-016 — Shows demo operational data in live mode without banner/config

Reject; live mode data truth required.

