# Cross-Pack Residual Gap Closure Audit

Run this audit before the remaining packs start, then repeat it after Pack 06 Finance and Pack 09 Mobile.

The uploaded residual report shows that many gaps are shared engines rather than isolated defects. This audit targets the specific gaps that must not be buried inside later packs.

## A. Quote and Sales Order Commercial Repair

### Required fields

Quote header and Sales Order header must have:

- salesperson / sales owner selector;
- sales team or territory where repository supports it;
- internal remark;
- customer-facing remark / print remark;
- price list snapshot;
- discount scheme snapshot;
- tax category/place-of-supply/tax treatment where applicable;
- payment terms and freight terms;
- revision/version number;
- approval/release status.

Quote/SO lines must have, as applicable:

- line remark;
- item revision;
- UOM conversion evidence;
- price source;
- discount source;
- tax code/rate source;
- override reason and approval status;
- promised date/ATP reference;
- warehouse/bin/lot/serial reservation reference where allocation occurs.

### Acceptance

- Save/reopen must preserve all fields.
- Conversion/copy must snapshot commercial values rather than silently recalculate.
- Repricing must be an explicit action with audit.
- Tax must be calculated from source rules and rounded consistently.
- Print/export/report must show the same totals as the document.

## B. Bin Selection and Warehouse Control

### Required behavior

- If an item/warehouse is bin-managed, every inventory issue/return/transfer/pick/pack/dispatch/mobile movement must require bin selection.
- If lot/serial/PCID is required, bin alone is insufficient.
- Quality-held stock cannot be selected unless an authorised override exists.
- Bin balance must update atomically with stock movement.

### Acceptance

- Attempt movement without bin for bin-managed item: blocked.
- Attempt movement from wrong bin/lot/serial: blocked.
- Mobile scan and desktop selector use same validation service.
- Reports show on-hand by branch/warehouse/location/bin/lot/serial/PCID.

## C. Revision Application in Related Transactions

### Required behavior

- Transaction documents store the exact revision used: item revision, BOM revision, routing revision, engineering document revision, quote revision, order revision where applicable.
- Linked transactions display and filter by revision.
- Releasing a new revision never mutates old transactions.
- Converting quote to SO, planned order to WO, PO to GRN, SO to dispatch/invoice must carry source document revision.

### Acceptance

- Create transaction using revision A.
- Release revision B.
- Reopen old transaction; it still shows revision A.
- New transaction uses B only when selected or defaulted by effective date.

## D. Price, Discount, Tax, Charges

### Required behavior

- Price lists are effective-dated and customer/item/UOM/currency-aware where data exists.
- Discount schemes are effective-dated and eligibility-driven.
- Tax is effective-dated and item/customer/location/charge-aware.
- Freight/add-less/round-off are captured in shared commercial-charge contract.
- Overrides require reason and role/approval where configured.

### Acceptance

- Unit price × qty − discount + taxable charges + tax + non-taxable charges + round-off equals document total.
- Totals recalculate across all lines, not only first line.
- Commercial values appear consistently in quote, SO, dispatch, invoice, reports, and exports.

## E. Suggested Codex Emergency Prompt

```text
You are working in the ERP repository. Before continuing new completion packs, perform a cross-pack residual gap audit and repair for quote/order commercial truth, bin-selection truth, revision-reference truth, and price/discount/tax truth.

Do not introduce fake fields or local-only UI state. Inspect existing models, migrations, services, routes, components, and tests first. Use existing conventions.

Required repair scope:
1. Quote and Sales Order must have persisted salesperson/sales owner, internal remarks, customer/print remarks, price-list snapshot, discount snapshot, tax treatment, freight/add-less/round-off where supported, and revision/status audit.
2. Quote/SO lines must preserve line remarks, item revision, UOM conversion, price source, discount source, tax source, override reason, and ATP/reservation references where applicable.
3. Inventory-touching transactions must require bin selection for bin-managed stock and use the same validation in desktop and mobile/barcode paths.
4. Revision-controlled masters/documents must be referenced explicitly in related transactions; old transactions must not mutate when a new revision is released.
5. Price/discount/tax calculations must be rule-based, effective-dated, rounded consistently, and snapshotted on released/posted documents.
6. Add/adjust tests and audit scripts proving save/reopen, conversion/copy, recalculation, release/revision, and report/export consistency.

End with a residual-gap report listing what was fixed, what remains, why it remains, exact files changed, tests run, and manual verification steps.
```