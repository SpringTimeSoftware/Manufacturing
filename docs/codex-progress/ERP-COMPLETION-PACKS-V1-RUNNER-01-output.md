# ERP-COMPLETION-PACKS-V1-RUNNER-01

Status: COMPLETE

## Packs Completed
- Item / Product Master
- Customer / Dealer / Distributor Master
- Supplier / Vendor Master
- Quote / Sales Order / Forecast / ATP

## Critical Gaps Fixed
- Item packaging and related UOM selectors now preserve governed IDs through save/reopen.
- Item media upload uses the shared attachment workflow and unsupported media lifecycle actions show disabled reasons.
- Live item profile API failures no longer silently fall back to generated operational profile data.
- Customer credit limit is numeric; customer price list, discount scheme, salesperson, and default branch are governed disabled selectors with visible reasons where not editable on the customer screen.
- Supplier default branch is no longer an active no-op selector.
- Quote saved live rows reopen into the draft workspace with all saved lines.
- Quote totals are calculated across all lines, and charges/round-off/convert-to-order actions are truthful.

## Validation Results
- `npm run typecheck`: passed
- `npm test`: passed
- `npm run audit:erp-completion`: passed
- `npm run build`: passed
- `npm run build:host`: passed
- `dotnet build src/server/STS.Mfg.sln`: passed
- `dotnet test src/server/STS.Mfg.sln --no-build`: passed
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: passed

## Screenshot Paths
- `docs/codex-review-screens/ERP-COMPLETION-PACKS-V1/item-product-master/`
- `docs/codex-review-screens/ERP-COMPLETION-PACKS-V1/customer-dealer-distributor/`
- `docs/codex-review-screens/ERP-COMPLETION-PACKS-V1/supplier-vendor/`
- `docs/codex-review-screens/ERP-COMPLETION-PACKS-V1/quote-sales-order-forecast-atp/`

## Remaining Blockers
- None for touched pack scope.

## Review Pack
- `artifacts/review-packs/ERP-COMPLETION-PACKS-V1-RUNNER-01-review-pack.zip`
