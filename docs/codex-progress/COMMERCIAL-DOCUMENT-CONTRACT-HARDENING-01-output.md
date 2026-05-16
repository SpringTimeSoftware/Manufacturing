# COMMERCIAL-DOCUMENT-CONTRACT-HARDENING-01 Output

Date: 2026-05-16

Scope executed:
- Commercial document contract hardening for Quote and Sales Order.
- Price / discount / tax calculation engine foundation.
- Quote release snapshot and exact Quote-to-Sales-Order conversion.
- Revision snapshot validation foundation for Quote and Sales Order lines.

Out of scope for this run, per instruction:
- Quality, dispatch, mobile, integrations, UDF, service, reports, and full finance modules.
- Full AR/AP/GL posting. Only quote/SO commercial correctness was touched.

## Files Inspected

Primary source areas inspected:
- `src/server/STS.Mfg.Application/Contracts/SalesPlanning/SalesPlanningContracts.cs`
- `src/server/STS.Mfg.Application/Abstractions/SalesPlanning/ISalesPlanningService.cs`
- `src/server/STS.Mfg.Domain/SalesPlanning/SalesPlanningEntities.cs`
- `src/server/STS.Mfg.Infrastructure/SalesPlanning/SalesPlanningService.cs`
- `src/server/STS.Mfg.Infrastructure/Commercial/CommercialMasterService.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/ManufacturingDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/DomainEntityConfigurations.cs`
- `src/server/STS.Mfg.Api/Controllers/SalesPlanningControllers.cs`
- `src/web/src/pages/CommercialPlanningPages.tsx`
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/commercial/commercialPlanningAdapters.ts`
- `tests/web/quote-sales-order/QuoteSalesOrderForecastAtpCompletion.test.tsx`
- `tests/web/transaction-line-depth/QuoteMultilineFlow.test.tsx`
- `tests/server/STS.Mfg.Tests/STS.Mfg.Tests.csproj`
- `database/README.md`
- `database/ddl/20-commercial/`

## Files Changed

Backend contracts and services:
- `src/server/STS.Mfg.Application/Contracts/Commercial/CommercialCalculationContracts.cs`
- `src/server/STS.Mfg.Application/Abstractions/Commercial/ICommercialCalculationService.cs`
- `src/server/STS.Mfg.Application/Contracts/SalesPlanning/SalesPlanningContracts.cs`
- `src/server/STS.Mfg.Application/Abstractions/SalesPlanning/ISalesPlanningService.cs`
- `src/server/STS.Mfg.Domain/SalesPlanning/SalesPlanningEntities.cs`
- `src/server/STS.Mfg.Infrastructure/Commercial/CommercialCalculationService.cs`
- `src/server/STS.Mfg.Infrastructure/DependencyInjection.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/DomainEntityConfigurations.cs`
- `src/server/STS.Mfg.Infrastructure/SalesPlanning/SalesPlanningService.cs`
- `src/server/STS.Mfg.Infrastructure/Properties/AssemblyInfo.cs`
- `src/server/STS.Mfg.Api/Controllers/SalesPlanningControllers.cs`

Database and deployment artifacts:
- `database/ddl/20-commercial/060_sales_commercial_contract_hardening.sql`
- `database/README.md`
- `src/server/STS.Mfg.Host/wwwroot/index.html`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-BaXvAVKg.js`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-BT_rSqnj.js` removed by `build:host` replacement.

Web UI and API client:
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/commercial/commercialPlanningAdapters.ts`
- `src/web/src/pages/CommercialPlanningPages.tsx`

Tests:
- `tests/server/STS.Mfg.Tests/CommercialCalculationServiceTests.cs`
- `tests/server/STS.Mfg.Tests/SalesPlanningCommercialContractTests.cs`
- `tests/web/quote-sales-order/QuoteSalesOrderForecastAtpCompletion.test.tsx`
- `tests/web/transaction-line-depth/QuoteMultilineFlow.test.tsx`
- `src/web/src/pages/Wave05BEngineeringPlanningWorkflowCompletion.test.tsx`

Progress:
- `docs/codex-progress/COMMERCIAL-DOCUMENT-CONTRACT-HARDENING-01-output.md`
- `docs/codex-progress/README.md`

## Database / Migration Details

Added ordered additive DDL:
- `database/ddl/20-commercial/060_sales_commercial_contract_hardening.sql`

Tables altered:
- `sales.Quotes`
- `sales.QuoteLines`
- `sales.SalesOrders`
- `sales.SalesOrderLines`

Quote header columns added:
- `SalesOwnerId`
- `SalesOwnerName`
- `InternalRemarks`
- `CustomerFacingRemarks`
- `PrintRemarks`
- `PaymentTermsId`
- `PriceListId`
- `DiscountSchemeId`
- `TaxCategoryId`
- `TaxTreatment`
- `CurrencyId`
- `ExchangeRateId`
- `ExchangeRateSnapshot`
- `TradeTermsId`
- `FreightAmount`
- `PackingAmount`
- `InsuranceAmount`
- `OtherChargesAmount`
- `AddLessAmount`
- `RoundOffAmount`
- `SubtotalAmount`
- `DiscountTotalAmount`
- `TaxableAmount`
- `TaxTotalAmount`
- `GrandTotalAmount`
- `CommercialStatus`
- `RevisionNo`
- `ReleasedAt`
- `ReleasedByUserId`
- `ConvertedAt`
- `ConvertedByUserId`
- `ReopenedAt`
- `ReopenedByUserId`
- `LegacyCommercialIncomplete`

Quote line columns added:
- `ItemRevisionId`
- `EngineeringDocumentRevisionId`
- `BomRevisionId`
- `RoutingId`
- `VariantId`
- `PriceSourceType`
- `PriceListLineId`
- `DiscountSchemeId`
- `DiscountRuleId`
- `DiscountPercent`
- `DiscountAmount`
- `TaxCodeId`
- `TaxRateSnapshot`
- `TaxAmount`
- `LineSubtotal`
- `LineTaxableAmount`
- `LineTotalAmount`
- `LineInternalRemarks`
- `LineCustomerFacingRemarks`
- `OverrideReason`
- `OverrideByUserId`
- `OverrideAt`

Sales order header columns added:
- Same commercial header/totals fields as Quote.
- `SourceQuoteId`
- `SourceQuoteRevisionNo`
- `SourceQuoteVersionNo`
- `LegacyCommercialIncomplete`

Sales order line columns added:
- Same revision, pricing, discount, tax, line total, line remarks, and override fields as Quote lines.

Indexes added:
- `IX_Quotes_CommercialStatus`
- `IX_SalesOrders_SourceQuote`

Backward compatibility:
- New fields are nullable or defaulted where historical documents may not have complete commercial metadata.
- Existing quote and SO rows get default `CommercialStatus = Status` when possible, otherwise `Draft`.
- Legacy rows are marked `LegacyCommercialIncomplete = 1` unless deterministic totals already exist.
- The DDL does not invent sales owner, tax, price list, discount, currency, exchange-rate, or revision references.

## APIs / Services Added Or Modified

New contracts:
- `CommercialChargeInput`
- `CommercialLineCalculationRequest`
- `CommercialDocumentCalculationRequest`
- `CommercialLineCalculationResult`
- `CommercialDocumentCalculationResult`

New service:
- `ICommercialCalculationService`
- `CommercialCalculationService`

Service behavior:
- Resolves price-list and price-list-line by document date, customer, item, variant, UOM, currency, and quantity where current master data supports those dimensions.
- Resolves discount scheme/rule by document date and applicability data where current master data supports it.
- Resolves tax code/category/rate by document date.
- Applies freight, packing, insurance, and other charge taxability to totals.
- Requires an override reason when unit price, discount, or tax is manually overridden.
- Returns server-side subtotal, discount total, taxable amount, tax amount, round-off, and grand total.

Modified sales planning service:
- Quote create/update now calculates server-side commercial totals and persists commercial header/line snapshots.
- Sales order create/update now calculates server-side commercial totals and persists commercial header/line snapshots.
- Released and converted quotes cannot be directly edited.
- Quote reopen requires an explicit reason and audit timestamp/user metadata.
- Quote release stores immutable commercial snapshot fields on the quote and its lines.
- Quote conversion is transactional and exact-copies the released commercial snapshot into a new sales order.
- Conversion stores `SourceQuoteId`, `SourceQuoteRevisionNo`, and `SourceQuoteVersionNo` on the SO.
- Converted quotes cannot be converted again.

Controller endpoints added:
- `POST /api/quotes/{id}/release`
- `POST /api/quotes/{id}/reopen`
- `POST /api/quotes/{id}/convert-to-sales-order`

## Quote / Sales Order Contract Closure

Closed for Quote:
- Persisted sales owner id/name.
- Persisted internal, customer-facing, and print remarks.
- Persisted payment terms, price list, discount scheme, tax category/treatment, currency, exchange rate, trade terms.
- Persisted freight, packing, insurance, other charges, add/less, round-off, subtotal, discount total, taxable amount, tax total, and grand total.
- Persisted commercial status, revision number, release audit, conversion audit, and reopen audit.
- Persisted line remarks, price/discount/tax sources, overrides, tax snapshots, and line totals.
- Draft can be edited.
- Released and converted states lock direct commercial edit.
- Released quote can be reopened only with explicit reason.
- Released quote can be converted to SO.
- Converted quote cannot be converted again.

Closed for Sales Order:
- Persisted sales owner id/name.
- Persisted internal, customer-facing, and print remarks.
- Persisted payment terms, price list, discount scheme, tax category/treatment, currency, exchange rate, trade terms.
- Persisted freight, packing, insurance, other charges, add/less, round-off, subtotal, discount total, taxable amount, tax total, and grand total.
- Persisted source quote id and source quote revision/version when created from a quote.
- Persisted line remarks, price/discount/tax sources, overrides, tax snapshots, and line totals.
- Direct SO create/update continues to calculate server-side.
- SO created from quote copies the released quote snapshot exactly instead of recalculating from current commercial masters.

## Revision Snapshot Foundation

Implemented on Quote and SO lines:
- `ItemRevisionId`
- `EngineeringDocumentRevisionId`
- `BomRevisionId`
- `RoutingId`

Validation behavior:
- BOM revision references must point to an approved BOM.
- Routing references must point to an active routing.
- `ItemRevisionId` and `EngineeringDocumentRevisionId` are rejected with clear validation messages until source revision tables/contracts exist in this repo.
- The service does not silently use latest/current/first/last revision fallback.

Known deliberate limitation:
- The repository does not currently expose first-class item-revision or engineering-document-revision source tables. This phase stores the fields and blocks unresolved references instead of guessing.

## UI Screens Changed

Quote UI:
- Sales owner selector added using active platform users as the governed owner source.
- Internal, customer-facing, and print remarks added.
- Payment terms, price list, discount scheme, tax category, currency, exchange-rate, and trade-term selectors/controls added.
- Freight, packing, insurance, other charges, add/less, round-off controls added.
- Line remarks and override reason controls added.
- Commercial status, release metadata, and revision metadata shown.
- Release, reopen, and convert-to-SO actions wired to live API endpoints.
- Save is disabled with reason when the quote is released or converted.

Sales order UI:
- Sales owner selector added using active platform users.
- Internal, customer-facing, and print remarks added.
- Payment terms, price list, discount scheme, tax category, currency, exchange-rate, and trade-term selectors/controls added.
- Freight, packing, insurance, other charges, add/less, round-off controls added.
- Line remarks and override reason controls added.
- Source quote reference and quote revision shown for converted orders.
- Snapshot totals are shown for quote-derived SOs.

## Tests Added Or Updated

Backend:
- `tests/server/STS.Mfg.Tests/CommercialCalculationServiceTests.cs`
  - Effective-date price and tax selection by document date.
  - Charge taxability affects totals.
  - Older effective commercial master rows are used for older document dates.
  - Manual price override requires reason.
  - Manual override with reason is accepted and carried into the commercial snapshot.
- `tests/server/STS.Mfg.Tests/SalesPlanningCommercialContractTests.cs`
  - Quote release stores a commercial snapshot through the real sales planning service.
  - Commercial master changes after release do not alter the converted SO.
  - Quote-to-SO conversion copies released quote line values, header totals, line remarks, tax snapshot, discount snapshot, and source quote revision.
  - Converted quote cannot be converted again.
  - Released quote cannot mutate commercial values until it is reopened with a reason.
  - Item revision references fail with validation instead of silently using latest/current revision fallback.

Web:
- `tests/web/quote-sales-order/QuoteSalesOrderForecastAtpCompletion.test.tsx`
  - Quote saves sales owner and remarks.
  - Quote line remarks persist in create payload.
  - Quote commercial selectors and charges persist in create payload.
  - Quote release endpoint is called.
  - Quote-to-SO conversion endpoint is called and exact snapshot values are surfaced.
- `tests/web/transaction-line-depth/QuoteMultilineFlow.test.tsx`
  - Retained multiline quote add/remove/save behavior with new commercial header controls present.
- `src/web/src/pages/Wave05BEngineeringPlanningWorkflowCompletion.test.tsx`
  - Corrected planning test date setup so it is stable relative to current 2026-05-16 validation.

## Validation Results

Passed:
- `npm.cmd run typecheck`
  - Result: passed.
- `npm.cmd test`
  - Result: passed.
  - Summary: 67 test files passed, 243 tests passed.
  - Note: Existing non-fatal React `act(...)` warnings remain in `tests/web/procure-to-pay/ProcureToPayCompletion.test.tsx`.
- `npm.cmd run build`
  - Result: passed.
  - Note: Existing Vite chunk-size warning for the main JS bundle remains.
- `npm.cmd run build:host`
  - Result: passed.
- `dotnet build src/server/STS.Mfg.sln`
  - Result: passed, 0 warnings, 0 errors.
- `dotnet test src/server/STS.Mfg.sln --no-build`
  - Result: passed.
  - Summary: 44 passed, 0 failed, 0 skipped.
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`
  - Result: passed.
  - The publish command also rebuilt the React web app and copied host assets.

Targeted checks also passed during implementation:
- `npm.cmd test -- --run tests/web/quote-sales-order/QuoteSalesOrderForecastAtpCompletion.test.tsx tests/web/transaction-line-depth/QuoteMultilineFlow.test.tsx tests/web/transaction-line-depth/SalesOrderMultilineFlow.test.tsx`
  - Result: passed, 3 files, 5 tests.
- `dotnet test tests\server\STS.Mfg.Tests\STS.Mfg.Tests.csproj --filter CommercialCalculationServiceTests`
  - Result: passed, 4 tests.
- `dotnet test tests/server/STS.Mfg.Tests/STS.Mfg.Tests.csproj --filter SalesPlanningCommercialContractTests`
  - Result: passed, 3 tests.

## Screenshots / Manual Verification

Browser screenshots were not captured in this phase because the acceptance gate requested implementation, tests, and a detailed report, not a screenshot pack.

Manual verification steps for a live UI check:
1. Open the Quote list.
2. Create a new quote draft.
3. Select customer, sales owner, price list, discount scheme, currency, payment terms, and tax category.
4. Enter internal, customer-facing, and print remarks.
5. Add at least two quote lines with price, discount, tax, and line remarks.
6. Add freight, packing, insurance, other charges, add/less, and round-off.
7. Save and reopen the quote.
8. Release the quote.
9. Confirm save fields are locked after release.
10. Convert the released quote to SO.
11. Open the SO and verify source quote reference, quote revision, lines, remarks, and totals match the released quote snapshot.

## Known Remaining Blockers / Decisions

No blocker remains for this phase acceptance gate.

Business/product decisions still needed for later packs:
- Whether quote `Submitted / Pending Approval` should be wired to the platform approval workbench before release. This phase implements release directly as the minimum V1 lifecycle.
- Whether quote `Cancelled` and `Closed` need dedicated API actions, reason capture, and approval rules. The status values are supported as locked commercial states, but dedicated cancellation/closure workflow was not part of this run.
- First-class item revision and engineering document revision source contracts are still absent. The new Quote/SO fields exist, and the service blocks unresolved references instead of silently selecting latest.
- Full accounting/subledger posting from quote/SO remains out of scope for this phase.

## Acceptance Gate Status

Complete for this phase:
- Quote/SO persisted salesperson: done.
- Quote/SO persisted remarks: done.
- Server-side commercial calculation: done.
- Released commercial snapshot: done.
- Exact quote-to-SO copy: done.
- Revision snapshot foundation with no silent latest fallback: done.
- Validation: passed.
