# Transaction Line Grid Standard Addendum

This addendum must be applied to every existing and future transaction-related ERP completion pack.

## Superseded behavior

Any prior pack language that allows or implies the following is superseded:

- each transaction line as a full card,
- one form block per line,
- line editor that only edits the first line,
- transaction editor without Add Line / Remove Line,
- transaction save that only saves one line,
- transaction totals based on one line.

## New required behavior

Every desktop transaction entry screen must use a compact editable line grid.

## Packs affected

- quote_sales_order_completion_pack_v1
- procure_to_pay_completion_pack_v1
- production_shop_floor_completion_pack_v1
- inventory_warehouse_traceability_pack
- quality_ncr_inspection_pack
- dispatch_logistics_pod_pack
- finance_gl_ap_ar_pack

## Required audit

All transaction packs must run a line-grid audit that fails on:

- `lines[0]`
- `firstLine`
- `First quote line`
- `index === 0`
- card-style repeated line blocks
- no Add Line
- no Remove Line
- no save/reopen proof
