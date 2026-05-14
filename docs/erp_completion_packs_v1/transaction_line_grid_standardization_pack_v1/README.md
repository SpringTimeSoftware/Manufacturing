# Transaction Line Grid Standardization Pack V1

This pack defines a mandatory desktop transaction line-entry standard for every ERP transaction that can contain multiple item/service/material/account rows.

It supersedes all weaker or ambiguous line-entry language in prior completion packs for:

- Commercial transactions
- Procurement / Procure-to-Pay
- Production / Shop Floor
- Inventory / Warehouse / Transfers
- Quality / Inspection / NCR
- Dispatch / Logistics / POD
- Finance / Journals / Cost allocations where line grids are present

## Core rule

Desktop transaction line entry must use a compact editable grid/table.

Repeated large `Line 1`, `Line 2`, `Line 3` card-style blocks are not acceptable for desktop ERP transaction entry.

Card layout is allowed only for:

- mobile screens,
- read-only summaries,
- selected-line detail expansion,
- optional side/detail panel for the currently selected row.

## Files

- `TRANSACTION_LINE_GRID_STANDARD_BENCHMARK_V1.xlsx`
- `TRANSACTION_LINE_GRID_STANDARD_COMPLETION_SPEC.md`
- `TRANSACTION_LINE_GRID_STANDARD_ADDENDUM.md`
- `TRANSACTION_LINE_GRID_STANDARD_CODEX_PROMPT.txt`

## How to use

Place this folder under:

```text
docs/erp_completion_packs_v1/transaction_line_grid_standardization_pack_v1/
```

Then run the prompt:

```text
TRANSACTION_LINE_GRID_STANDARD_CODEX_PROMPT.txt
```

After this pack is applied, every future and existing transaction-related completion pack must follow this line-grid standard.

## Completion gate

A transaction screen is not complete unless it supports:

- header section,
- editable line grid,
- Add Line,
- Remove Line,
- edit all lines,
- validate all lines,
- save all lines,
- reopen all lines,
- totals/discount/tax/charges/round-off where applicable,
- screenshot proof,
- automated tests or audit scanner proof.

## Invalid patterns

The implementation is invalid if it contains:

- `lines[0]`-only transaction editing,
- `firstLine`-only editing,
- label such as `First quote line`,
- `index === 0` save/update logic for line arrays,
- no Add Line for multiline transactions,
- no Remove Line for multiline transactions,
- totals calculated only from the first line,
- desktop transaction lines rendered as full stacked cards.
