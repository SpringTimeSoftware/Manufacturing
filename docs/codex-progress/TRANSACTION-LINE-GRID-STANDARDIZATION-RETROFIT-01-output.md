# TRANSACTION-LINE-GRID-STANDARDIZATION-RETROFIT-01 Output

Date: 2026-05-14

## Status

COMPLETE for the implemented desktop transaction screens in scope.

## Screens Scanned

24 transaction surfaces were scanned:

- Quote
- Sales Order
- Blanket Order
- Demand Forecast
- ATP / Order Promise
- MPS
- Purchase Requisition
- RFQ
- Supplier Quotation
- Quote Comparison
- Purchase Order
- GRN / Goods Receipt
- Purchase Invoice / Match
- Vendor Return
- Landed Cost
- Material Issue
- Material Return
- Stock Transfer
- Production Receipt
- Scrap / Rework
- QC Inspection lines
- Packing List
- Delivery Challan / Shipment
- Shipment detail

## Screens Converted To Compact Grid

16 editable desktop transaction line editors now use `ErpTransactionLineGrid`:

- Quote line grid
- Sales order line grid
- Blanket schedule line grid
- Demand forecast line grid
- MPS schedule line grid
- Purchase requisition line grid
- RFQ line grid
- Supplier quotation line grid
- Purchase order line grid
- GRN receipt line grid
- Supplier invoice match line grid
- Stock posting line grid for issue/return/transfer
- Production receipt line grid
- Inspection result line grid
- Pack line grid
- Shipment line grid

## Anti-Patterns Removed

- Repeated desktop line cards for quote, sales order, blanket schedule, forecast, PR, PO, RFQ, supplier quote, GRN, invoice match, inventory posting, production receipt, QC inspection, pack list, and shipment editors.
- `firstLine` and direct `lines[0]` transaction handling in sales planning adapter summaries.
- Desktop line-entry FormShell repetition for the targeted transaction screens.

## Remaining Card-Style Desktop Transaction Screens

0 active desktop transaction line-entry screens in the scanned scope.

Allowed non-grid cases:

- Supplier invite rows remain form/card controls because they are invitation participants, not transaction line items.
- ATP / Order Promise has no editable line grid in current scope; it commits a selected promise date to the linked sales order.
- Vendor Return and Landed Cost remain disabled with business-safe reasons until their posting/allocation contracts are enabled.
- Scrap / Rework current implementation is a single governed posting form, not a repeated multiline card editor.

## Tests Added/Updated

- Added `tests/web/transaction-line-grid/TransactionLineGridRetrofit.test.tsx`
- Updated `tests/web/quote-sales-order/QuoteSalesOrderForecastAtpCompletion.test.tsx`

## Audit Updates

- Added `scripts/audit-transaction-line-grid.mjs`
- Added package script `audit:transaction-line-grid`
- Added `audit:transaction-line-grid` into `audit:erp-completion`
- Updated `docs/governance/QUALITY_GATES.md`
- Created `docs/final-audit/10_transaction_line_grid_retrofit_matrix.csv`
- Updated `07-ux-governance/action_truth_matrix.csv`

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS
- `npm run audit:erp-completion`: PASS
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Folder

`docs/codex-review-screens/TRANSACTION-LINE-GRID-STANDARDIZATION-RETROFIT-01/`

## Remaining Blockers

No blockers for the transaction line-grid retrofit gate.
