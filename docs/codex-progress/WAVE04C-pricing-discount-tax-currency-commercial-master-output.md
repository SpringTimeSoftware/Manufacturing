# Wave 04C - Pricing, Discount, Tax, Currency, And Commercial Master Data

Date: 2026-04-23

## Scope

Implemented Wave 4C only: additive commercial master-data persistence, API contracts, governed web screens, lookup-controlled editors, tests, SQL deployment order, and seed data for a meaningful local/UAT view.

## Backend / DB Changes

- Added commercial domain entities for currencies, exchange-rate setup, tax categories/codes, payment terms, trade terms, price lists, price list lines, price assignments, discount schemes, and discount rules.
- Added EF DbSets and configurations mapped to the existing `sales` schema.
- Added commercial application contracts, service abstraction, service implementation, and authenticated company-admin API controllers under `/api/commercial/*`.
- Added ordered SQL pack:
  - `database/ddl/20-commercial/020_commercial_master_v2_tables.sql`
- Updated minimum master seed with guarded sample commercial setup:
  - INR currency
  - GST18 tax category/code
  - NET30 payment term
  - EXW trade term
  - standard INR price list with line and customer assignment
  - standard volume discount scheme/rule

## Web Screens

Added governed screens:

- Price Lists
  - KPI strip, compact filters, governed action bar, dense grid, centered modal editor.
  - Header, effective dates, currency lookup, UOM-aware price line, tax category lookup, item/item-group lookup, customer applicability.

- Discount Schemes
  - KPI strip, compact filters, governed action bar, dense grid, centered modal editor.
  - Scheme header, approval status, controlled applicability type, customer/item/item-group/price-list lookup fields, break quantities, percent/amount discount controls.

- Tax, Currency & Terms
  - Currency setup, exchange-rate setup, tax category/code setup, payment terms, and trade terms on one governed setup page.
  - Controlled lookups for currency, tax scope, due calculation, rate source/type, trade mode, and status.

## Lookup Enforcement

Controlled select/lookup behavior was added for:

- currency
- tax category
- UOM
- item
- item group
- customer
- price list
- discount applicability type
- payment terms / due calculation
- trade mode
- exchange-rate source and rate type

Save actions remain disabled with business-safe reason in demo/offline sessions and call real API methods only in a live authenticated session.

## Tests Added

- `src/web/src/commercial/commercialMasterAdapters.test.ts`
  - price list create/update API routing
  - discount scheme create API routing
  - non-live save blocking
- `src/web/src/pages/Wave04CCommercialMaster.test.tsx`
  - price list governed grid/action/filter and lookup editor
  - discount scheme governed editor and lookup controls
  - tax/currency/terms page rendering and internal-copy guard

## Validation Results

- `npm.cmd run typecheck -- --pretty false`: PASS
- `npm.cmd test`: PASS, 28 files / 107 tests
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: PASS
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: PASS, 12 tests
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: PASS

Notes:

- The first backend build attempt failed because the previously running `STS.Mfg.Host` process locked output DLLs. After stopping that host, build/test/publish completed successfully.
- Publish reran the web host build and reported the existing Vite large chunk warning plus npm audit warnings from dependency install. No Wave 4C validation failed.

## Local Run Status

Started and verified for local testing after validation:

- Backend: `http://localhost:5102/api/health/ready` returned 200. HTTPS listener is active on 7042.
- Web: `http://127.0.0.1:5173/` returned 200.
- Web API proxy: `http://127.0.0.1:5173/api/health/ready` returned 200.
- Mobile Metro: `http://127.0.0.1:8081/status` returned `packager-status:running`.

## Remaining Commercial / Master Gaps

- Approval workflow transitions are not implemented in this wave; approval-aware statuses are persisted but approval decisions remain workbench-governed.
- Binary document/upload handling is out of scope for commercial master setup.
- Full commercial calculations in quotes/orders/purchase documents are not wired in this wave.
- Exchange-rate setup supports manual/source governance foundation; automated bank/provider ingestion is not implemented.

## Next Recommended Wave

Wave 5A - Engineering / BOM / Routing Deep Rework.
