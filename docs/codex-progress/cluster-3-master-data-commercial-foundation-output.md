# Cluster 3 - Master Data / Commercial Foundation

Date: 2026-05-11  
Runner: MASTER-COMPLETION-CLUSTER-RUNNER-01  
Status: COMPLETE

## Scope

Screens scanned: 18

Manifest prompt screens: W029 UOM Class Master; W030 UOM Conversion Master; W031 Measurement Profile Master; W032 Item Group / Category Master; W033 Item Attribute Master; W034 Reason Codes & Status Rules; W040 Item List; W041 Item Detail / Editor; W042 Item Variant Matrix; W043 Barcode / Label Setup; W044 Customer List; W045 Customer Detail; W046 Supplier List; W047 Supplier Detail; W048 Supplier Lead Time Matrix.

Cluster enforcement screens also touched: Price Lists; Discount Schemes; Tax, Currency & Terms.

Baseline counts for this cluster:

| Gate area | Baseline count |
| --- | ---: |
| Screens in scope | 18 |
| Deep editors / modal workspaces in scope | 18 |
| Governed lookup violations | 24 |
| Numeric field violations | 8 |
| Dead / untruthful touched actions | 24 |
| Upload / media / document truth violations | 3 |
| Seeded/live-data truth violations | 7 |
| Layout/modal violations | 12 |
| Scroll/overflow violations | 1 |
| Production wording violations | 4 |

## Completion Result

Screens fully compliant with cluster non-negotiable gates: 18

Screens still partial for non-critical product depth: item group/category master, item attribute master, reason/status rules, price-list line lifecycle, discount approval lifecycle, commercial audit drilldown.

Critical blockers: none.

## Fix Counts

| Fix area | Count |
| --- | ---: |
| Lookup violations fixed | 24 |
| Numeric field violations fixed | 8 |
| Dead actions removed / disabled / wired | 24 |
| Upload/media/document truth issues fixed | 3 |
| Seeded/live truth issues fixed | 7 |
| Layout/scroll issues fixed | 13 |

## Implemented

- Wired UOM class, UOM conversion, and measurement profile create/update actions to live measurement APIs, with demo-mode save actions disabled using business-safe reasons.
- Converted touched measurement fields to governed lookup/select controls and decimal/number controls for conversion factors, precision, UOM classes, profile types, rounding, and statuses.
- Added API client/contracts for item variant and barcode create/update, then wired variant and barcode modals to truthful create/update flows.
- Replaced item media, customer document, and supplier document placeholders with the shared attachment upload/storage workflow added in Cluster 1, preserving attachment metadata and record linkage.
- Wired Supplier Lead Time Matrix create/update to the supplier lead-time API and restored a governed Order policy selector that drives persisted priority/minimum/multiple fields.
- Kept print/retire, export, audit, clone, and line-add actions disabled with explicit reasons where the governed workflow is not present.
- Removed remaining internal/scaffold wording in touched commercial foundation actions.
- Updated `SCREEN_COMPLETION_MATRIX.csv`, `07-ux-governance/action_truth_matrix.csv`, `07-governance/entity_field_schema_matrix.csv`, `07-governance/screen_field_violation_matrix.csv`, and `docs/final-audit/07_screen_issue_register.csv`.

## Validation

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed via `npm.cmd run typecheck` |
| `npm test` | Passed via `npm.cmd test` - 37 files, 153 tests |
| `npm run build` | Passed via `npm.cmd run build` |
| `npm run build:host` | Passed via `npm.cmd run build:host` |
| `dotnet build src/server/STS.Mfg.sln` | Passed, 0 warnings/errors |
| `dotnet test src/server/STS.Mfg.sln --no-build` | Passed, 20 tests |
| `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` | Passed |

## Screenshot Evidence

Folder: `docs/codex-review-screens/MASTER-COMPLETION-CLUSTER-RUNNER-01/cluster-3-master-data-commercial-foundation/`

Captured 32 screenshots covering primary screens, modal workspaces, and the long item editor at top/middle/bottom.

## Remaining Non-Blocking Dependencies

- Item group/category, item attribute, and reason/status rules remain deferred setup surfaces until their governed persistence endpoints are added.
- Commercial price-line, discount approval, and tax/currency audit workflows remain disabled with explicit reasons where the full governed workflow is not yet present.
- Supplier lead-time order policy is represented through the persisted priority/minimum/multiple fields because the backend contract does not expose a separate policy column.
