# Production Shop Floor Invalid Output Rules v1

The implementation must be rejected if any P0 condition below is present.

## Structural invalid outputs

- Representative-only fields.
- Dashboard-only production module.
- No production order lifecycle.
- No operation lines.
- No component/material line grid.
- No job card/traveler truth.
- No dispatch board or dispatch board based on fake data.
- No operator terminal action persistence.
- No production receipt/inventory movement.
- No WIP/cost effect where visible.
- No close gates.

## Action invalid outputs

- Dead button.
- Button only displays toast.
- Fake upload/view/download/print/export.
- Status changes only local React state.
- No audit trail for release, hold, confirmation, issue, receipt, close or reversal.
- Visible action without handler/API path/disabled reason.
- Operator can perform supervisor/cost actions without RBAC.

## Field invalid outputs

- Item/BOM/routing/work center/machine/UOM/warehouse/bin/operator/reason/lot/serial as unrestricted text.
- Quantity/time/duration/cost/percent as unrestricted text.
- Dates as text.
- Status editable as arbitrary text.
- Lot/serial not validated by item tracking policy.
- Warehouse/bin not filtered by plant/stock/permission.

## Transaction invalid outputs

- `lines[0]`
- `firstLine`
- first component only
- first operation only
- first row totals
- no Add Line
- no Remove Line
- no Validate All
- desktop card-per-line transaction entry
- issue/backflush without movement document
- receipt without inventory/WIP/cost effect
- close with open operation/material/QC/cost blockers

## Evidence invalid outputs

- No test logs.
- No screenshot gates.
- No anti-pattern scan logs.
- No updated workbook mapping.
- No review pack.
- Completion claim without P0 gates passing.
