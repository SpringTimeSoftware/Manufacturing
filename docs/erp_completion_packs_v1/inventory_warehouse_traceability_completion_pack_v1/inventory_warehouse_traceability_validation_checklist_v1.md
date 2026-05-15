# Inventory / Warehouse / Traceability Validation Checklist v1

Use this checklist after Codex implementation.

## Workbook and evidence

- [ ] `Current_Mapping` is filled with repo paths, screens, APIs, DB tables, existing tests, and screenshots.
- [ ] `Gap_Template` is filled and all P0 gaps are closed or explicitly justified.
- [ ] Workbook evidence columns are updated.
- [ ] Review pack exists with screenshots, logs, scans, and commit SHA.

## Lookup truth

- [ ] Item/Product fields are governed lookups.
- [ ] UOM fields are governed lookups.
- [ ] Site/Warehouse/Bin fields are governed lookups.
- [ ] Lot/Serial/License Plate fields are governed lookups.
- [ ] Inventory status and quality status fields are governed lists.
- [ ] Reason codes are governed lookups.
- [ ] Source documents are linked records, not free text.
- [ ] API/server rejects invalid IDs.

## Numeric/date truth

- [ ] Quantities are numeric with precision/scale.
- [ ] UOM conversions are numeric and server validated.
- [ ] Counts, variances, tolerance, unit costs, values, weights, volumes, and capacities are not text.
- [ ] Expiry/manufacture/retest/posting dates are date/time values.
- [ ] Save/reopen preserves numeric/date values.

## Stock ledger and on-hand

- [ ] On-hand derives from ledger/status/reservation dimensions.
- [ ] Movement ledger entries are immutable.
- [ ] Reversal/void is used instead of deleting posted movement history.
- [ ] Source document references exist.
- [ ] Pending/error movements remain visible.
- [ ] Valuation/costing handoff status is visible where relevant.

## Movement and transaction grids

- [ ] Material issue uses header + compact editable grid.
- [ ] Material return uses header + compact editable grid.
- [ ] Stock transfer uses header + compact editable grid.
- [ ] Bin movement uses header + compact editable grid.
- [ ] Adjustment uses header + compact editable grid.
- [ ] Cycle count/PI entry supports multiple lines.
- [ ] Add Line and Remove Line exist.
- [ ] Save/reopen all lines works.
- [ ] Totals/variance from all lines.
- [ ] No `lines[0]` / `firstLine` implementation survives scan.

## Traceability

- [ ] Lot balances reconcile.
- [ ] Serial count equals base quantity for serialized items.
- [ ] LP/PCID containment reconciles.
- [ ] Forward trace works.
- [ ] Backward trace works.
- [ ] Recall impact report works.
- [ ] Trace graph/list has source document links and quantities.

## Warehouse/bin

- [ ] Warehouse hierarchy is validated.
- [ ] Bin belongs to selected warehouse/site.
- [ ] Bin status controls movement.
- [ ] Capacity and mixing policies validate.
- [ ] Barcode labels are real or disabled with reason.

## Count and physical inventory

- [ ] Cycle count plan creates work.
- [ ] Mobile/blind count works where visible.
- [ ] Variance calculations are correct.
- [ ] Recount works.
- [ ] Approval is required over tolerance.
- [ ] Adjustment posts ledger and on-hand.
- [ ] PI freeze/control behavior is enforced.

## Quality hold/release

- [ ] Hold links to QC/NCR/CoA/reason.
- [ ] Blocked/hold stock cannot be issued/picked/dispatched/consumed.
- [ ] Release requires approval where configured.
- [ ] Status transition creates audit/ledger.

## Actions and UI truth

- [ ] Every visible action works, is disabled with reason, or hidden.
- [ ] No fake upload/photo/barcode/export/print.
- [ ] Deep create/edit uses full page or centered modal workspace.
- [ ] Desktop movement lines are not card-per-line.

## Live data and reports

- [ ] Authenticated mode does not silently show seeded stock/lots/serials/ledger.
- [ ] Dashboard KPIs compute from real data.
- [ ] Reports/exports use current filters and persisted data.
- [ ] Exception workbench shows negative stock, expired lots, orphan serial/LP, unposted movement, and capacity breaches.

## Required logs

- [ ] Backend tests passed.
- [ ] Frontend tests passed.
- [ ] UI/E2E tests passed or documented.
- [ ] Build/typecheck/lint passed or documented.
- [ ] Anti-pattern scans passed.
- [ ] Screenshot gates captured.
