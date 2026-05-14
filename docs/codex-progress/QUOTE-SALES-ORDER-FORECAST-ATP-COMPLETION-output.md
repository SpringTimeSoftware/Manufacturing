# QUOTE-SALES-ORDER-FORECAST-ATP-COMPLETION

Pack status: COMPLETE

## Files Changed
- `src/web/src/commercial/commercialPlanningAdapters.ts`
- `src/web/src/pages/CommercialPlanningPages.tsx`
- `tests/web/quote-sales-order/QuoteSalesOrderForecastAtpCompletion.test.tsx`

## Screens Touched
- Quote list
- New quote draft modal
- Saved quote edit/reopen modal
- Sales order list/draft truth state
- Forecast draft
- Available-to-promise workbench

## Fields Corrected
- Quote line item, UOM, make type, priority, and status are governed selectors.
- Quote quantity, unit price, discount percent, and tax percent use numeric/decimal/money controls.
- Quote totals now calculate gross, discount, taxable, tax, and quote value from all lines.
- Freight/add-less and round-off controls are disabled with visible reasons until the approved charges workflow is available.

## Actions Corrected
- New quote draft opens a centered workspace.
- Add Line and Remove Line work for multiline quote drafts.
- Save quote draft persists all lines in live mode.
- Saved live quotes reopen into the edit workspace with all saved lines.
- Convert to order is disabled with a visible quote-release reason.
- Sales order draft is disabled with reason in demo/review mode, and live order workspaces retain multiline controls.

## Tests Added/Updated
- `QuoteSalesOrderForecastAtpCompletion.test.tsx`

## Validation Results
- `npm run typecheck`: passed
- `npm test`: passed
- `npm run audit:erp-completion`: passed
- `npm run build`: passed
- `npm run build:host`: passed
- `dotnet build src/server/STS.Mfg.sln`: passed
- `dotnet test src/server/STS.Mfg.sln --no-build`: passed
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: passed

## Screenshot Folder
- `docs/codex-review-screens/ERP-COMPLETION-PACKS-V1/quote-sales-order-forecast-atp/`

## Remaining Blockers
- None for touched pack scope.
