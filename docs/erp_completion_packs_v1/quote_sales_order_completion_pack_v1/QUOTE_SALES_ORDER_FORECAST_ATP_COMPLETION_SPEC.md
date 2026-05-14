# QUOTE / SALES ORDER / FORECAST / ATP COMPLETION SPEC

## Purpose
Complete commercial transactional authoring and order-promise flows to ERP-grade depth.

## Completion definition
Quote/Sales Order domain is complete only if:
- Quote has header + multiline line grid + add/remove line + save/reopen all lines.
- Sales Order has header + multiline line grid + add/remove line + save/reopen all lines or is honestly blocked with clear reason.
- Price list, discount, tax, freight/add-less, currency, payment terms, round-off and totals are calculated or truthfully blocked.
- Quote to Sales Order conversion is working or disabled with reason.
- Blanket order schedules, forecast grids, and ATP are working or truthfully disabled.
- No transaction editor is `lines[0]` or `firstLine` only.

## Critical invalid states
- Quote editor has a label like "First quote line".
- Transaction DTO has `lines[]` but UI edits only `lines[0]`.
- Add Line / Remove Line missing.
- Save only saves first line.
- Totals are based on only one line.
- New Order opens no workspace.
- Tax, discount, round-off, freight/charges are fake.
- Print/export button active without real output.
