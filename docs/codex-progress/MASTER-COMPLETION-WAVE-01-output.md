# MASTER-COMPLETION-WAVE-01 Output

Date: 2026-05-11

## Scope

Master / Resource / Commercial Foundation Completion.

Screens in scope: 13

- Item Groups / Categories / Subcategories
- Item Attributes
- Product Family / Business Segment / Reporting Bucket
- UOM Classes
- UOM Conversions
- Measurement Profiles
- Work Centers
- Machines
- Tools / Resources
- Price Lists
- Discount Schemes
- Tax / Currency / Terms
- Item Master dependent classification fields

## Baseline Counts

- Screens in scope: 13
- Modals/editors in scope: 13
- Governed lookup violations found: 41
- Numeric field violations found: 24
- Dead or misleading visible actions found: 42
- Upload truth issues found: 1
- Layout/modal violations found: 0 critical
- Production-facing internal wording violations found in touched files: 5

## Fixes Applied

- Added the Product Family / Segment / Reporting classification route and navigation entry.
- Converted item classification fields to governed selectors: category, subcategory, product family, business segment, reporting bucket.
- Added controlled selectors to item group, item attribute, UOM class, UOM conversion, measurement profile, work center, machine, tool/resource, and commercial setup workspaces.
- Added governed numeric controls for conversion factor, decimal places, measurement precision, resource capacity, pricing, discount, tax, currency precision, rate, and payment-day fields.
- Kept live resource setup create/update actions wired through the resource APIs for work centers, machines, and tools/resources.
- Disabled unsupported export, line/break add/remove, clone, lifecycle, audit, and upload/media actions with concise business-safe reasons.
- Removed production-facing "governed" / source-style internal wording from touched user-facing copy.
- Updated stale tests to reflect the new implemented routes and enabled controlled classification selectors.

## Domain Gate

- Screens fully compliant in this wave scope: 13
- Screens still partial in this wave scope: 0
- Critical touched lookup violations remaining: 0
- Critical touched numeric violations remaining: 0
- Touched visible dead actions remaining: 0

The remaining dependencies below are non-dead because the visible actions are disabled with reasons.

## Remaining Non-Critical Dependencies

1. Taxonomy setup create/save workflow remains disabled until backend write workflow is enabled.
2. Item attribute allowed-value row maintenance remains disabled until value-set workflow is enabled.
3. UOM unit-in-class and conversion/profile write workflows remain disabled.
4. Machine type and compatible machine group setup sources remain partial.
5. Price-list multi-line add/remove and clone workflows remain partial.
6. Discount multi-break add/remove workflow remains partial.
7. Commercial lifecycle/audit actions remain disabled until dependency/audit workflows are implemented.
8. Item binary media upload remains disabled until storage/authorization workflow is enabled.

## Evidence

Screenshot folder:

- `docs/codex-review-screens/MASTER-COMPLETION-WAVE-01/`

Review pack:

- `artifacts/review-packs/MASTER-COMPLETION-WAVE-01-review-pack.zip`

## Validation

- `npm run typecheck`: PASS
- `npm test`: PASS, 36 files / 152 tests
- `npm run build`: PASS, Vite chunk-size warning only
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS, Vite chunk-size warning only
