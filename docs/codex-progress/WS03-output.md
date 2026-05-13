# WS03 Master / Resource / Commercial Foundation Output

Date: 2026-05-13

## Status

COMPLETE for the WS03 touched scope. Critical touched-scope blockers are 0. The prior item attribute allowed-value maintenance blocker is closed with live API persistence, additive DB support, governed controls, tests, screenshot evidence, and review packaging.

## Files Changed

- Backend/API: item attribute and allowed-value contracts, entities, EF mapping, service methods, and `/api/item-attributes` controller actions.
- Database: additive item attribute/value-set DDL, minimum master seed updates, database README execution order.
- Web: item attribute allowed-value workspace, API client contracts, master-data adapter, validation and UI test coverage.
- Governance/docs: WS03 workstream matrices, action/field/issue matrix updates, help action registry updates, screenshot evidence.
- Host publish assets: refreshed IIS publish-folder web assets through `npm run build:host` and `dotnet publish`.

## Screens Completed

- Item Groups / Categories
- Item Attributes
- Item Master
- Item Variants
- Barcodes
- Customers
- Suppliers
- UOM Classes
- UOM Conversions
- Measurement Profiles
- Work Centers
- Machines
- Tools / Resources
- Price Lists
- Discount Schemes
- Tax / Currency / Terms

## Actions Wired / Disabled / Hidden

- Wired: Item Attribute New attribute draft, Add allowed value, Remove allowed value, Save attribute draft in live authenticated sessions.
- Wired: item attribute edit workspace can load existing value rows and persist ordered allowed values.
- Preserved truthful working create workspaces for Item Master, Price Lists, Discount Schemes, Resource setup, Measurement setup, Customers, and Suppliers.
- Disabled with reason: item attribute Save remains disabled in demo/no-live sessions because persistence requires a live authenticated API session.
- No visible WS03 touched action remains handlerless and enabled.

## Field / Governance Results

- Lookup violations fixed: item attribute data type/status/allowed-value status are governed selectors.
- Numeric violations fixed: item attribute allowed-value sort order uses `ErpNumberField`; allowed-value count remains calculated and numeric.
- Dependent master/commercial/resource screens remain governed with lookup/select controls where sources exist.
- Money, rate, quantity, precision, weight, capacity, and date fields on touched screens remain non-free-text controlled fields.

## Backend / DB Changes

- Added `master.ItemAttributes` and `master.ItemAttributeValues` with forward-only SQL DDL.
- Added idempotent seed data for THICKNESS and FINISH attributes and allowed values.
- Added item attribute list/get/create/update APIs with validation and audit metadata.
- Updated database documentation so the additive DDL is part of the ordered master-data foundation.

## Validation Results

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 41 files / 170 tests
- `npm.cmd run build`: PASS with Vite chunk-size warning only
- `npm.cmd run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence

Folder: `docs/codex-review-screens/WS03/`

Captured item groups/categories, item attributes, item attribute create workspace, item master list and create workspace, customers, suppliers, UOM classes, UOM conversions, measurement profiles, work centers, machines, tools/resources, price lists and modal, discount schemes and modal, and tax/currency/terms.

## Remaining Blockers

- None for WS03 touched critical gates.
- Non-blocking future depth: standalone reason-code/classification persistence and deeper commercial approval/versioning workflows remain later-domain work, not a WS03 blocker.

## Review Pack

`artifacts/review-packs/WS03-review-pack.zip`
