# Cluster 2 - Organization / Setup / Resource Basics

Date: 2026-05-11  
Runner: MASTER-COMPLETION-CLUSTER-RUNNER-01  
Status: COMPLETE

## Scope

Screens scanned: 9

Screens touched: W020 Company Master; W021 Branch Master; W022 Department Master; W023 Warehouse Master; W024 Bin Master; W025 Shift Calendar; W026 Work Center Master; W027 Machine Master; W028 Tool / Die / Mould Master.

Baseline counts for this cluster:

| Gate area | Baseline count |
| --- | ---: |
| Screens in scope | 9 |
| Deep editors / modal workspaces in scope | 9 |
| Governed lookup violations | 9 |
| Numeric field violations | 6 |
| Dead / untruthful touched actions | 42 |
| Upload / media / document truth violations | 0 |
| Seeded/live-data truth violations | 6 |
| Layout/modal violations | 9 |
| Scroll/overflow violations | 0 |
| Production wording violations | 2 |

## Completion Result

Screens fully compliant with cluster non-negotiable gates: 9

Screens still partial for non-critical product depth: W020 legal/tax extension depth, W021 contacts/policies, W022 manager/user assignment workflow, W023 warehouse policy/zones, W024 parent-bin and capacity-UOM source linkage, W025 calendar versioning/exceptions, W026 costing/audit depth, W027 maintenance/operator skill depth, W028 compatibility/maintenance assignment depth.

Critical blockers: none.

## Fix Counts

| Fix area | Count |
| --- | ---: |
| Lookup violations fixed | 9 |
| Numeric field violations fixed | 6 |
| Dead actions removed / disabled / wired | 42 |
| Upload/media/document truth issues fixed | 0 |
| Seeded/live truth issues fixed | 6 |
| Layout/scroll issues fixed | 9 |

## Implemented

- Wired organization setup draft creation/edit save flows to live company, branch, department, warehouse, bin, and shift create/update APIs.
- Converted touched organization fields to governed lookup controls, including timezone, currency, calendar, branch type, department type, warehouse type, bin type, block reason, and status fields.
- Converted touched numeric organization fields to numeric/decimal controls, including bin capacity, bin cycle-count interval, shift break minutes, and shift sequence.
- Kept unavailable governed sources such as default warehouse, manager, parent department, capacity UOM, and machine-group compatibility disabled with explicit business-safe reasons.
- Verified work center, machine, and tool/resource setup use centered modal workspaces with live API-backed create/update actions.
- Added or verified live unavailable states across organization and resource setup screens so live API failure does not silently show seeded operational fallback.
- Replaced remaining resource setup wording that implied healthy live data when the API source is unavailable.
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

Folder: `docs/codex-review-screens/MASTER-COMPLETION-CLUSTER-RUNNER-01/cluster-2-organization-setup-resource-basics/`

Captured primary screens and modal workspaces for company, branch, department, warehouse, bin, shift calendar, work center, machine, and tool/resource setup.

## Remaining Non-Blocking Dependencies

- Organization legal/tax/contact/policy extension sections remain partial and are gated outside the critical completion path.
- Manager/user assignment, branch default warehouse approval, parent-bin hierarchy, and capacity-UOM setup sources remain disabled with reasons where source governance is not available.
- Resource lifecycle, audit, maintenance, costing, operator-skill, and compatibility workflows remain disabled with business-safe reasons until those governed workflows are enabled.
