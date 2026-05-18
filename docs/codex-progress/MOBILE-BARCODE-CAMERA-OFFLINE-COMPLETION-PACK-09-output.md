# MOBILE-BARCODE-CAMERA-OFFLINE-COMPLETION-PACK-09 Output

Status: COMPLETE for stated foundation scope.

## Preflight

- Branch: `main`
- Starting commit: `d6e525f`
- Starting worktree: clean
- Dirty-diff classification: all new/modified files are Pack 09 mobile runtime, backend contract, DDL, governance, tests, screenshot evidence, and output/review artifacts.

## Audit Findings Before Coding

- Native/mobile app exists under `src/mobile`; it is a React Native/PWA shell, not a verified native device build.
- Mobile authenticated path used `seededMobileContexts`, `seededOfflineQueue`, and `demo-mobile-*` tokens from `src/mobile/App.tsx` and `src/mobile/src/mobileAuth.ts`.
- Mobile screens for material, inventory, quality, dispatch/POD, device utilities, and sync showed seeded operational rows and local-only queue/success messages.
- No persisted mobile device registration/trust model was found.
- No mobile scan event ledger was found.
- No durable mobile offline operation queue/sync conflict model was found.
- No mobile photo/evidence metadata model was found.
- Backend inventory policy/posting, dispatch, quality, reporting, and integration foundations existed and were reused.

## Files Inspected

- `src/mobile/App.tsx`
- `src/mobile/src/MobileShell.tsx`
- `src/mobile/src/mobileAuth.ts`
- `src/mobile/src/mobileSeedData.ts`
- `src/mobile/src/offlineQueue.ts`
- `src/mobile/src/screens/*`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Application/Contracts/Inventory/InventoryContracts.cs`
- `src/server/STS.Mfg.Application/Abstractions/Inventory/IInventoryService.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryPolicyService.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryService.cs`
- `src/server/STS.Mfg.Api/Controllers/InventoryControllers.cs`
- `src/server/STS.Mfg.Api/Controllers/DispatchControllers.cs`
- `src/server/STS.Mfg.Api/Controllers/QualityControllers.cs`
- `database/README.md`

## Files Changed / Created

- Added mobile backend domain/contracts/service/controller/EF mapping.
- Added `database/ddl/20-commercial/150_mobile_barcode_camera_offline_completion.sql`.
- Rewired `src/mobile` authenticated runtime from seeded rows to live auth/mobile APIs.
- Updated mobile material, inventory, quality, dispatch/POD, device, sync, home, and login screens.
- Added backend tests: `tests/server/STS.Mfg.Tests/MobileBarcodeCameraOfflineServiceTests.cs`.
- Added frontend/static tests: `tests/web/mobile-runtime/MobileBarcodeCameraOfflineCompletion.test.tsx`.
- Updated governance matrices and screen issue register.
- Added screenshot evidence under `docs/codex-review-screens/MOBILE-BARCODE-CAMERA-OFFLINE-COMPLETION-PACK-09/`.

## Tables / Columns Added

- `mobile.DeviceRegistrations`
- `mobile.OfflineOperations`
- `mobile.SyncConflicts`
- `mobile.ScanEvents`
- `mobile.PhotoEvidence`

No fake bins, lots, serials, PCIDs, devices, tasks, or mobile operational rows were backfilled.

## APIs / Services Added

- `IMobileRuntimeService`
- `MobileRuntimeService`
- `MobileController`
- `POST /api/mobile/devices`
- `POST /api/mobile/devices/heartbeat`
- `GET /api/mobile/runtime`
- `GET /api/mobile/tasks`
- `POST /api/mobile/scans/resolve`
- `GET /api/mobile/offline-operations`
- `POST /api/mobile/offline-operations`
- `POST /api/mobile/offline-operations/sync`
- `GET /api/mobile/sync-conflicts`
- `POST /api/mobile/photo-evidence`

## Implemented Behavior

- Device trust is persisted and visible.
- Revoked devices cannot sync, queue new work, scan, or capture evidence.
- Untrusted devices cannot sync stock/quality/dispatch/POD posting operations without conflict.
- Barcode scan source is recorded as `Camera`, `Hardware`, or `Manual`.
- Manual entry is labelled as fallback and is not disguised as camera scan.
- Scan resolution reads live item barcode, bin, lot, serial, PCID, shipment, job card, and inspection records where present.
- Offline operations persist idempotency keys and status.
- Offline sync re-runs inventory movement validation and can post stock issue/return/transfer through `IInventoryService`.
- Quality-held/blocked stock remains blocked through shared inventory validation.
- Duplicate synced offline operation does not duplicate stock movement.
- POD sync before shipped/dispatched state is rejected as durable conflict.
- Evidence metadata persists as `Uploaded` only with an attachment id; otherwise it is `PendingUpload` with reason.
- Authenticated mobile shell no longer imports seeded operational data.

## Live / Offline / Disabled Actions

- Live actions: sign-in, device registration, runtime load, task feed load, scan resolution, offline operation queue, sync, evidence metadata.
- Offline queued actions: stock issue draft, stock return draft, stock transfer draft, cycle count draft, quality inspection draft, NCR draft, mobile POD.
- Disabled with reason: camera scan when runtime camera adapter is unavailable; revoked-device sync/post; evidence binary upload until attachment/native capture is supplied.

## Tests Added

- Backend:
  - device registration/trust/revoked sync blocking
  - live barcode resolution and scan event persistence
  - invalid barcode clear failure
  - offline sync inventory validation conflict for quality-held stock
  - offline stock issue posts through inventory service with idempotency protection
  - photo evidence metadata pending upload
  - POD cannot sync before shipment
- Frontend/static:
  - authenticated mobile runtime no longer imports seeded mobile operational rows
  - live mobile API endpoint wiring
  - manual/hardware/camera scan truth
  - durable offline sync/conflict UI
  - POD/evidence metadata truth

## Validation Results

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 70 files / 264 tests
- `npm.cmd run audit:erp-completion`: PASS
- `npm.cmd run build`: PASS
- `npm.cmd run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 89 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS
- `npm.cmd --prefix src/mobile run typecheck`: PASS
- `npm.cmd --prefix src/mobile run test:coverage-plan`: PASS, 7 mobile action-flow coverage entries

## Screenshot / Review Evidence

- Screenshot folder: `docs/codex-review-screens/MOBILE-BARCODE-CAMERA-OFFLINE-COMPLETION-PACK-09/`
- Screenshots:
  - `mobile-runtime-evidence.png`
  - `mobile-runtime-evidence-mobile.png`

## Classification

Closed in this phase:
- mobile runtime contract
- device registration/trust
- barcode scanner contract and source truth
- camera/photo evidence metadata truth
- offline operation queue
- sync/idempotency/conflict foundation
- mobile inventory validation/posting foundation
- mobile quality draft/evidence foundation
- mobile dispatch/POD queue/conflict foundation
- mobile report/document readiness through live task/runtime contract
- seeded mobile data removal from authenticated shell path

Partially closed / foundation only:
- mobile production native execution, limited to live job task feed and queued draft pattern
- binary camera upload, metadata persists but native capture/upload adapter still needed
- offline cache depth, current foundation uses live task feed plus durable queue
- mobile report/document viewer, safe access extension point only

Still open for later packs/runtime verification:
- native app build/device-store verification
- hardware scanner verification on actual scanner device
- live camera permission and binary upload adapter
- offline sync under real network loss
- full production operator terminal mobile workflows
- service/warranty mobile readiness

## Runtime Inputs Still Needed

- Device enrollment/trust approval operating rule.
- Native camera/capture adapter and attachment binary upload wiring for actual photo capture.
- Hardware scanner test devices for keyboard-wedge/camera scan verification.
- Network-loss test environment for offline conflict and retry drills.

## Regression Result

- Pack 04/05/06/07/08 web and backend regression suites still pass through full `npm test`, `dotnet test`, and `audit:erp-completion`.
- Phase 01/02/03 commercial/customer/inventory regressions still pass through existing web/backend tests.

## Safe To Proceed

Safe to proceed to Pack 10 UDF after Pack 09 review acceptance.

Review pack path: `artifacts/review-packs/MOBILE-BARCODE-CAMERA-OFFLINE-COMPLETION-PACK-09-review-pack.zip`
