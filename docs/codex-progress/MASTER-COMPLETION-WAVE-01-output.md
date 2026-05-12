# MASTER-COMPLETION-WAVE-01 Output

Date: 2026-05-12

Run: STRICT-DOMAIN-COMPLETION-01 - Master / Resource / Commercial Foundation.

## Scope

Screens in scope: 16

- Item Groups / Categories / Subcategories
- Item Attributes
- Product Family / Business Segment / Reporting Bucket
- Reason Codes & Status Rules
- UOM Classes
- UOM Conversions
- Measurement Profiles
- Work Centers
- Machines
- Tools / Resources
- Price Lists
- Discount Schemes
- Tax / Currency / Terms
- Item Master dependent classification, UOM, weight, dimension, MOQ, and lead-time fields
- Customer Master dependent tax, currency, payment, credit, and commercial fields
- Supplier Master dependent tax, currency, payment, preferred-status, and procurement fields

## Baseline And Recount

- Screens in scope: 16
- Modals/editors in scope: 16
- Fields scanned in scope: 176
- Governed lookup violations at strict-pass start: 0 critical
- Numeric/currency truth violations at strict-pass start: 3
- Dead visible actions at strict-pass start: 0 in UI; 1 stale matrix state corrected
- Disabled-without-reason actions: 0
- Upload truth issues at strict-pass start: 0
- CRUD truth issues at strict-pass start: 0 critical
- Layout/modal violations at strict-pass start: 0
- Production-facing wording violations at strict-pass start: 4

## Implemented

- Bound price-list Unit price and discount-scheme Discount amount money controls to the selected commercial currency instead of hard-coded INR.
- Stopped exchange-rate manual-rate display from rendering as INR money; it now renders as a rate value.
- Removed production-facing live API / seeded-data wording from UOM class, UOM conversion, and measurement profile unavailable states.
- Replaced resource status wording that exposed API-backed implementation language with business-facing setup wording.
- Reverified item, customer, and supplier dependent fields: governed selectors remain in place for classification, UOM, tax, currency, payment terms, commercial terms, resource references, and status fields; numeric controls remain in place for quantities, weights, dimensions, MOQ, lead time, credit days, rates, and precision.
- Updated governance trackers for action truth, screen-field violations, and issue register.

## Domain Gate

- Screens fully compliant in this strict domain scope: 16
- Screens still partial in this strict domain scope: 0 critical
- Critical domain violations remaining: 0
- Touched governed-field violations remaining: 0
- Touched numeric-field violations remaining: 0
- Touched visible dead actions remaining: 0
- Touched upload truth issues remaining: 0
- Seeded/live-data truth violations remaining on touched screens: 0
- Layout/modal violations remaining on touched screens: 0
- Wording violations remaining on touched screens: 0

The remaining dependencies below are not critical gate failures because visible actions are working, hidden, or disabled with business-safe reasons.

## Remaining Non-Critical Dependencies

1. Taxonomy setup create/save workflow remains disabled until dedicated backend write workflow is enabled.
2. Item attribute allowed-value row maintenance remains disabled until value-set workflow is enabled.
3. Unit-in-class maintenance remains disabled until UOM membership workflow is enabled.
4. Resource department, capacity UOM, shift, machine type, and compatible machine-group sources remain disabled with reasons until those setup sources are added.
5. Price-list multi-line add/remove and clone workflows remain disabled with reasons.
6. Discount multi-break add/remove workflow remains disabled with reasons.
7. Commercial lifecycle/audit actions remain disabled until dependency and audit workflows are implemented.
8. Item/customer/supplier document lifecycle depth remains limited to the current attachment/storage workflow.

## Evidence

Screenshot folder:

- `docs/codex-review-screens/MASTER-COMPLETION-WAVE-01/`

Captured strict-pass evidence includes item group/category, item attributes, classifications, reason codes, UOM class, UOM conversion, measurement profile, work centers, machines, tools/resources, price list list and modal, discount scheme list and modal, tax/currency/terms, item list with edit classification and numeric packaging tabs, customer master, and supplier master.

Review pack:

- `artifacts/review-packs/MASTER-COMPLETION-WAVE-01-review-pack.zip`

## Validation

- `npm run typecheck` from `src/web`: PASS
- `npm test` from `src/web`: PASS, 37 files / 153 tests
- `npm run build` from `src/web`: PASS, Vite chunk-size warning only
- `npm run build:host` from `src/web`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS, Vite chunk-size warning only
