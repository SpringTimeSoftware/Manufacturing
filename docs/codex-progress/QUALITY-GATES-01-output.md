# QUALITY-GATES-01 Output

Date: 2026-05-13

## Scope

Created automated ERP completion gates. This pass did not change product screen behavior; it added static audit scripts, web test coverage, package scripts, validation documentation, and test-harness configuration for repo-level tests under `tests/web`.

## Audit Scripts Created

- `scripts/audit-transaction-line-depth.mjs`
- `scripts/audit-governed-fields.mjs`
- `scripts/audit-numeric-fields.mjs`
- `scripts/audit-action-truth.mjs`
- `scripts/audit-live-data-truth.mjs`

## Package Scripts Added

- `audit:transaction-lines`
- `audit:governed-fields`
- `audit:numeric-fields`
- `audit:action-truth`
- `audit:live-data-truth`
- `audit:erp-completion`

## Tests Created

- `tests/web/transaction-line-depth/QuoteMultilineFlow.test.tsx`
- `tests/web/transaction-line-depth/SalesOrderMultilineFlow.test.tsx`
- `tests/web/transaction-line-depth/PurchaseOrderMultilineFlow.test.tsx`
- `tests/web/field-governance/ItemMasterGovernedFields.test.tsx`
- `tests/web/action-truth/NewDraftActionTruth.test.tsx`

## Gate Results

Passing gates:

- `npm run typecheck`
- `npm run build`
- `npm run build:host`
- `node scripts/audit-action-truth.mjs`
- `node scripts/audit-live-data-truth.mjs`
- `dotnet build src/server/STS.Mfg.sln`
- `dotnet test src/server/STS.Mfg.sln --no-build`
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`

Failing gates by design because real current issues were detected:

- `npm test`
- `npm run audit:erp-completion`
- `node scripts/audit-transaction-line-depth.mjs`
- `node scripts/audit-governed-fields.mjs`
- `node scripts/audit-numeric-fields.mjs`

## Top Detected Violations

1. Quote DTO exposes line/schedule depth while the quote create workspace lacks Add Line.
2. Quote code still directly reads `lines[0]`.
3. Quote workspace still uses first-line-only copy and first-line-only update behavior.
4. Sales Order DTO exposes line/schedule depth while the sales order workflow lacks Add Line.
5. Blanket Order DTO exposes line/schedule depth while the workflow lacks Add Line.
6. Forecast DTO exposes line/schedule depth while the workflow lacks Add Line.
7. Purchase Requisition DTO exposes line/schedule depth while the page lacks Add Line and Remove Line.
8. Purchase Requisition code still reads and saves from `lines[0]` / `firstLine`.
9. Purchase Order DTO exposes line/schedule depth while the page lacks Add Line and Remove Line.
10. Purchase Order code still reads and saves from `lines[0]` / `firstLine`.
11. Item Master renders reason code as an unrestricted input instead of a governed lookup/select.
12. Commercial Planning renders subcontract lead time as text instead of numeric input.

## Validation Details

- `npm run typecheck`: passed.
- `npm test`: failed on the new quality-gate tests for Quote and Purchase Order multiline depth. This is expected for this pass because the tests are now catching known incomplete transaction behavior.
- `npm run audit:erp-completion`: failed at `audit:transaction-lines` with 159 transaction-line violations.
- `npm run build`: passed with existing Vite chunk-size warning.
- `npm run build:host`: passed.
- `dotnet build src/server/STS.Mfg.sln`: passed.
- `dotnet test src/server/STS.Mfg.sln --no-build`: passed, 37 tests.
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: passed.

## Next Implementation Wave Required

The next product implementation wave should fix transaction line depth before any quote, sales order, purchase order, or requisition workflow is marked complete. Minimum requirements are multiline Add Line / Remove Line support, per-line item/UOM/quantity/rate/discount/tax editing, and save-draft payloads that preserve all remaining lines. Secondary fixes are governed reason-code lookup on Item Master and numeric subcontract lead-time control in Commercial Planning.
