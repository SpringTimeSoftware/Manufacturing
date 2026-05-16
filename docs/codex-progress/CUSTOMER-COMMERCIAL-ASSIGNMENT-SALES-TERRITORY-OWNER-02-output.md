# CUSTOMER COMMERCIAL ASSIGNMENT / SALES TERRITORY OWNER FOUNDATION - 02

Status: COMPLETE for the stated foundation gate.

## Pre-Implementation Audit Findings

- Customer master persistence existed in `master.Customers`, `master.CustomerAddresses`, and `master.CustomerPartnerProfiles`.
- `CustomerPartnerProfile` previously stored legacy text/code fields for tax category, currency, and payment terms, but did not store governed default IDs for sales owner, price list, discount scheme, payment terms, tax category, currency, or trade terms.
- Customer UI had disabled price-list, discount-scheme, and salesperson controls with reasons. Sales owner assignment was not maintainable from Customer Master.
- No sales territory, sales team, sales team member, or customer sales assignment tables were found.
- Customer address model exists for bill-to/ship-to flags, but no address-level tax override model was found. Address-level overrides remain a later operational gap.
- Quote/SO commercial hardening fields existed and persisted, but new Quote and direct SO creation accepted commercial values from the request instead of resolving missing values from customer profile defaults.
- Quote-to-SO conversion already exact-copied released quote commercial values and was preserved.

## Files Inspected

- `database/ddl/10-master-data/030_partner_master_v2_extension_tables.sql`
- `database/ddl/20-commercial/060_sales_commercial_contract_hardening.sql`
- `src/server/STS.Mfg.Domain/Masters/MasterEntities.cs`
- `src/server/STS.Mfg.Domain/SalesPlanning/SalesPlanningEntities.cs`
- `src/server/STS.Mfg.Application/Contracts/Masters/MasterContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/SalesPlanning/SalesPlanningContracts.cs`
- `src/server/STS.Mfg.Infrastructure/Resources/ResourceService.cs`
- `src/server/STS.Mfg.Infrastructure/SalesPlanning/SalesPlanningService.cs`
- `src/web/src/pages/PartnerPages.tsx`
- `src/web/src/pages/CommercialPlanningPages.tsx`
- `tests/server/STS.Mfg.Tests/SalesPlanningCommercialContractTests.cs`
- `tests/web/partner-master/CustomerDealerDistributorCompletion.test.tsx`

## Files Changed

- Added `database/ddl/20-commercial/070_customer_commercial_assignment_sales_owner.sql`
- Added `src/server/STS.Mfg.Application/Abstractions/SalesPlanning/ICustomerCommercialDefaultsService.cs`
- Added `src/server/STS.Mfg.Application/Contracts/SalesPlanning/CustomerCommercialDefaultsContracts.cs`
- Added `src/server/STS.Mfg.Infrastructure/SalesPlanning/CustomerCommercialDefaultsService.cs`
- Updated customer partner profile contracts/entities/configuration/service mapping.
- Updated Quote/SO create/update paths to resolve customer defaults server-side before commercial calculation.
- Updated Customer Master UI to maintain governed sales owner, sales team, territory, price list, discount scheme, payment terms, tax category/treatment, currency, and trade terms defaults.
- Updated Quote/SO UI with customer-default refresh actions and default/snapshot indicators.
- Updated server and web tests for customer commercial defaulting and regression coverage.
- Updated `database/README.md`.

## Migrations / Tables / Columns

- Added nullable columns to `master.CustomerPartnerProfiles`:
  `DefaultSalesOwnerUserId`, `DefaultSalesOwnerName`, `DefaultSalesTeamId`, `DefaultTerritoryId`, `DefaultPriceListId`, `DefaultDiscountSchemeId`, `DefaultPaymentTermsId`, `DefaultTaxCategoryId`, `DefaultTaxTreatment`, `DefaultCurrencyId`, `DefaultTradeTermsId`.
- Added tables:
  `sales.SalesTerritories`, `sales.SalesTeams`, `sales.SalesTeamMembers`, `sales.CustomerSalesAssignments`.
- Migration is additive only. No existing customer or Quote/SO document is backfilled with fake owner, tax, price list, discount, currency, or territory data.

## APIs / Services

- Added `ICustomerCommercialDefaultsService.ResolveAsync`.
- Added `GET /api/customers/{id}/commercial-defaults`.
- Added `GET /api/customers/sales-territories`.
- Added `GET /api/customers/sales-teams`.
- Default precedence implemented:
  document override, active customer sales assignment, customer partner profile, otherwise null/no configured default.
- New Quote and direct Sales Order server paths call the default resolver before commercial calculation.
- Quote-to-SO conversion does not call customer defaulting and continues to copy the released quote snapshot exactly.

## Tests Added / Updated

- Backend:
  - `NewQuote_ShouldDefaultCommercialValuesFromCustomerProfileServerSide`
  - `DirectSalesOrder_ShouldDefaultCommercialValuesFromCustomerProfileServerSide`
  - `QuoteConversion_ShouldNotRedefaultFromChangedCustomerProfile`
- Web:
  - Customer master commercial controls now assert governed selectors instead of disabled placeholders.
  - Quote/SO regression tests continue to verify multiline quote/SO and exact release/conversion behavior.

## Validation Results

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 67 files / 243 tests
- `npm.cmd run build`: PASS, Vite built `index-CXL2ljba.js`; chunk-size warning only
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 47 tests
- Targeted backend regression:
  `CommercialCalculationServiceTests|SalesPlanningCommercialContractTests`: PASS, 10 tests
- Targeted web regression:
  `QuoteMultilineFlow`, `SalesOrderMultilineFlow`, `QuoteSalesOrderForecastAtpCompletion`, `CustomerDealerDistributorCompletion`: PASS, 4 files / 7 tests

## Previous Commercial Hardening Regression Status

- Quote save/release/conversion commercial snapshot tests still pass.
- Released quote direct mutation guard still passes.
- Quote-to-SO exact copy still passes.
- Manual override reason validation from the commercial calculation service still passes.

## Gap Classification

A. Closed in this phase:
- Governed customer-level sales owner default.
- Governed customer-level price list, discount scheme, payment term, tax category/treatment, currency, and trade-term defaults.
- Minimal sales territory/team/assignment schema foundation.
- Server-side customer default resolution for new Quote and direct SO.
- Quote-to-SO conversion remains exact snapshot copy and does not re-default.

B. Partially closed / foundation only:
- Sales territory/team maintenance screens are not a full standalone admin module yet; tables and read endpoints exist.
- Address-level tax/default overrides remain foundation-only because the current address model has no tax override fields.
- Header-level manual override audit metadata is not separately persisted beyond existing document audit; line-level commercial override audit remains covered.

C. Still open for later packs:
- Full CRM territory hierarchy and sales team planning.
- AR invoice, GL/accounting posting from sales order/dispatch.
- Dispatch/POD and bin/lot/serial/PCID consumption.
- Address-level GST/place-of-supply override depth.

## Screenshots / Manual Verification

No browser screenshots were required by this phase. Manual verification targets:
- Customer Master -> New customer draft -> Terms & Commercial shows governed customer default selectors.
- Quote -> New quote draft -> Refresh customer defaults applies blank customer defaults only.
- Sales Order -> New order draft -> Refresh customer defaults applies blank customer defaults only.
- Sales Order converted from Quote shows quote snapshot source and disables customer re-defaulting.

## Recommended Next Pack

Continue with the next cross-pack foundation before module packs: inventory/bin/lot/serial/PCID shared validation and revision-source snapshot usage where exposed outside Quote/SO.
