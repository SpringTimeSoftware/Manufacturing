# Cluster 4 - Engineering / Planning

Date: 2026-05-11  
Runner: MASTER-COMPLETION-CLUSTER-RUNNER-01  
Status: COMPLETE

## Scope

Screens scanned: 17

Manifest prompt screens: W055 MPS Planner; W057 Order Delivery Dashboard; W060 BOM Library; W061 BOM Detail / Editor; W062 BOM Comparison; W063 ECO / Revision Control; W064 Routing Library; W065 Operation Standard & Cycle Times; W066 BOQ / Requirements; W067 MRP Run Console; W068 MRP Results / Exceptions; W069 Capacity Planning Board; W070 Alternate Item / Replacement Rules; W084 Machine Schedule Board; W085 PPS Machine Occupancy Calendar; W108 Stage Wise Dashboard.

Cluster enforcement screens also touched: Engineering Attachment / Document Viewer.

Baseline counts for this cluster:

| Gate area | Baseline count |
| --- | ---: |
| Screens in scope | 17 |
| Deep editors / modal workspaces in scope | 14 |
| Governed lookup violations | 6 |
| Numeric field violations | 3 |
| Dead / untruthful touched actions | 15 |
| Upload / media / document truth violations | 0 |
| Seeded/live-data truth violations | 1 |
| Layout/modal violations | 2 |
| Scroll/overflow violations | 1 |
| Production wording violations | 0 |

## Completion Result

Screens fully compliant with cluster non-negotiable gates: 17

Screens still partial for non-critical product depth: MPS frozen horizon and conversion workflow, BOM effectivity/document release lifecycle, ECO approval implementation lifecycle, routing resource versioning, BOQ conversion audit, MRP archive/compare flow, capacity writeback/rebuild, machine auto-assignment, occupancy assignment review, dashboard exports.

Critical blockers: none.

## Fix Counts

| Fix area | Count |
| --- | ---: |
| Lookup violations fixed | 6 |
| Numeric field violations fixed | 3 |
| Dead actions removed / disabled / wired | 15 |
| Upload/media/document truth issues fixed | 0 |
| Seeded/live truth issues fixed | 1 |
| Layout/scroll issues fixed | 3 |

## Implemented

- Updated capacity board loading so live authenticated sessions stop with a business-safe unavailable state instead of silently rendering seeded capacity data when the live API fails.
- Added centered MRP exception detail workspace with governed exception type, severity, recommended action, item context, and numeric gross/available/net quantity controls.
- Wired Order Delivery Dashboard drill actions for executive cockpit, sales order, BOQ, and machine board; kept export disabled with an explicit reporting-workflow reason.
- Wired Stage Wise Dashboard refresh and machine-board navigation; kept export disabled with an explicit reporting-workflow reason.
- Made Machine Schedule Board slots selectable by mouse and keyboard, added centered machine-card detail, wired Today range reset, and wired selected-slot job-card navigation.
- Wired PPS Occupancy Calendar Next 7 days quick range while keeping assignment review disabled with reason.
- Kept unsupported engineering/planning lifecycle actions disabled with business-safe reasons where persistence or workflow support is not present.
- Updated governance matrices and final issue register for the Cluster 4 fixes.

## Validation

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed via `npm.cmd run typecheck` from `src/web` |
| `npm test` | Passed via `npm.cmd test` from `src/web` - 37 files, 153 tests |
| `npm run build` | Passed via `npm.cmd run build` from `src/web` |
| `npm run build:host` | Passed via `npm.cmd run build:host` from `src/web` |
| `dotnet build src/server/STS.Mfg.sln` | Passed, 0 warnings/errors |
| `dotnet test src/server/STS.Mfg.sln --no-build` | Passed, 20 tests |
| `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` | Passed |

## Screenshot Evidence

Folder: `docs/codex-review-screens/MASTER-COMPLETION-CLUSTER-RUNNER-01/cluster-4-engineering-planning/`

Captured 31 screenshots covering primary Cluster 4 screens, centered modal workspaces, machine-card slot detail, and the stage-wise dashboard viewport.

## Remaining Non-Blocking Dependencies

- Planning lifecycle writes for MPS freeze/convert, MRP archive/compare, BOQ conversion audit, and capacity writeback remain disabled until those approved workflows are implemented.
- Engineering release, approval, versioning, effectivity, and document-control lifecycle depth remains partial where backend workflow support is not present.
- Machine auto-assignment and occupancy assignment review remain disabled until the machine-scheduling rule workflow is implemented.
- Export/reporting actions remain disabled with reasons where the approved reporting workflow is not yet present.
