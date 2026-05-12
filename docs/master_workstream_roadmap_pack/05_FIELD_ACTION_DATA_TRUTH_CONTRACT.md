# Field, Action, Data, and Layout Truth Contract

## Field truth

Every field must be classified as one of:
- narrative text
- lookup/reference
- integer
- decimal
- money
- date/date-time
- boolean
- enum/status
- file/media
- read-only computed

Governed reference values must use lookup/select/search/grid controls.

## Lookup fields

Lookup fields include but are not limited to:
- item, item group, item subgroup, item attribute, item variant
- UOM and UOM class
- warehouse, bin, branch, company, department, shift
- customer, customer site, customer contact
- supplier, supplier site, supplier contact
- price list, discount scheme, tax category, tax code, currency, payment term, trade term
- BOM, routing, ECO, operation, work center, machine, tool, operator
- QC plan, inspection template, reason code
- transporter, carrier, service, document type
- chart of account, cost center, profit center

## Numeric fields

Use numeric controls for:
- quantities, factors, conversion rates, prices, taxes, discounts, charges, weights, dimensions, minutes, days, rates, percentages, line numbers.

## Action truth

Every action must be:
- WORKING
- DISABLED WITH REASON
- HIDDEN

The UI must not show clickable dead actions.

## Data truth

Live authenticated mode cannot silently show seeded/demo operational rows. Seed/demo mode must be explicit.

## Layout truth

Deep editors use centered modal workspace or full-page workspace. Right drawers are for lightweight read-only previews only.

## Evidence truth

Every workstream must produce screenshots for all touched primary screens and modals.
