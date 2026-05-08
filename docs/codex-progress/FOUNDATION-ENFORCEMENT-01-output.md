# FOUNDATION-ENFORCEMENT-01 Output

Date: 2026-05-08
Branch: main

## Scope Completed

- Added global field governance standards for lookup, numeric, money, file action, modal workspace, action-truth, and live-vs-demo data behavior.
- Added an entity field schema matrix with 91 governed field rules across item, partner, commercial, engineering, production, quality, and dispatch entities.
- Added a screen field violation matrix with 84 tracked findings and 73 fixes applied in this pass.
- Added reusable governed web controls:
  - `ErpLookupField`
  - `ErpNumberField`
  - `ErpDecimalField`
  - `ErpMoneyField`
  - `ErpFileActionState`
  - updated `ErpActionBar`
  - updated `ErpValidationSummary`
  - existing `ErpModalWorkspace` retained as the deep-workspace standard
- Added live-data governance helper so live authenticated sessions no longer silently fall back to seeded operational rows on API failure.

## Main Fix Areas

- Commercial numeric fields now route number, quantity, percent, rate, price, and amount values through governed numeric/decimal/money controls.
- Item Master supplier/customer references, UOM, compliance status, document status, lead time, IDs, MOQ, and upload action were moved to governed controls.
- Customer and supplier document upload actions now use disabled file-action states with visible business reasons.
- BOM, routing, operation standards, alternate items, and engineering document workspaces now use governed numeric, lookup, and file-action controls.
- Production receipt, scrap, rework, quality NCR, dispatch shipment, work order, job card, downtime, and shift production review fields no longer look editable when no write workflow exists.
- Live adapter fallback was hardened across commercial planning/setup, operations, inventory, production output, quality, and dispatch adapters.

## Action Truth

- Action-truth rows added for 8 FOUNDATION-ENFORCEMENT-01 touched actions.
- 14 dead or misleading visible action/control states were removed, disabled with reason, or routed through truthful governed controls.
- Upload actions without storage workflow are disabled with business-safe reasons rather than appearing active.

## Screenshot Evidence

Folder: `docs/codex-review-screens/FOUNDATION-ENFORCEMENT-01/`

- `item-master.png`
- `customer.png`
- `supplier.png`
- `price-lists.png`
- `discount-schemes.png`
- `tax-currency-terms.png`
- `bom-editor.png`
- `routing.png`
- `production-receipts.png`
- `quality-ncr.png`
- `dispatch-shipments.png`

Screenshot note: captured through a demo-authenticated browser context with auth/system endpoints mocked for route access. The dev server logged localization proxy errors because the local backend was not running for screenshot capture; the target screens rendered and evidence files were saved.

## Validation Results

- `npm run typecheck` - PASS
- `npm test` - PASS, 36 files / 148 tests
- `npm run build` - PASS, with existing Vite large chunk warning
- `npm run build:host` - PASS
- `dotnet build src/server/STS.Mfg.sln` - PASS, 0 warnings / 0 errors
- `dotnet test src/server/STS.Mfg.sln --no-build` - PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` - PASS, with existing Vite large chunk warning during publish web build

## Remaining Violations

- Organization setup fields still need deeper lookup binding for country, tax, calendar, branch, warehouse, contact, manager, bin, work-center, and crew sources.
- Measurement conversion and measurement profile numeric fields still need full governed decimal migration.
- Item group, item attribute, and reason-code setup screens still need centralized controlled lookup sources.
- Binary document/media storage and authorization remain unavailable for Item, Customer, Supplier, and Engineering document uploads.
- Some governed lookup sources are still local/current-row derived and should be replaced by API-backed master sources.
- Commercial approval/versioning depth remains partial for price lists, discounts, tax, exchange rates, payment terms, and currencies.
- Engineering alternate-item reason codes use known local codes plus live row values until a central reason-code API is wired.
- Production posting, costing, rework lifecycle, QC inspection/NCR disposition, and dispatch preparation workflows remain disabled where backend workflow is not complete.

## Next Recommended Wave

MASTER-LOOKUP-SOURCE-01: wire central API-backed lookup sources for organization, measurement, item taxonomy, reason codes, UOM/profile defaults, partner references, and attachment/document source governance.
