# Cluster 5 Output - Production / Inventory / Quality / Dispatch

Status: COMPLETE

Date: 2026-05-11

## Screens Touched

W080, W081, W082, W083, W086, W087, W088, W089, W090, W091, W092, W093, W094, W095, W096, W097, W100, W101, W102, W103, W104, W105, W106, W107, W109.

## Compliance Summary

- Screens fully compliant: 25
- Screens still partial: 0
- Lookup violations fixed: 15
- Numeric field violations fixed: 10
- Dead actions removed/disabled/wired: 44
- Upload/media/document truth issues fixed: 1
- Seeded/live-data issues fixed: 0 new code changes; 5 Cluster 5 adapter families verified to avoid silent seeded fallback in live mode
- Layout/scroll issues fixed: 17 centered modal/detail workspaces verified

## Key Fixes

- Wired production, inventory, quality, dispatch, and print-pack drilldown actions where a safe in-repo destination exists.
- Disabled unsafe save/post/release/close/export/print-label workflow actions with visible business-safe reasons.
- Replaced touched quantity fields with `ErpNumberField` controls and touched governed source/state/status fields with `ErpLookupField` controls.
- Added shipment proof upload through the existing `/api/attachments` workflow for live shipment records.
- Preserved centered modal workspaces for deep detail experiences and avoided right-drawer deep editors.

## Validation Results

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 37 files / 153 tests
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence

`docs/codex-review-screens/MASTER-COMPLETION-CLUSTER-RUNNER-01/cluster-5-production-inventory-quality-dispatch/`

41 PNGs captured for touched primary screens and modal workspaces.

## Remaining Blockers

None for Cluster 5. Remaining posting, release, close, label-generation, and approval workflows are intentionally disabled with business-safe reasons until their workflow services are in scope.
