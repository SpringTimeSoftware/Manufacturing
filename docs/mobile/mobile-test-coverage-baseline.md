# Mobile Test Coverage Baseline

## Scope

This baseline records the P145 mobile test coverage target without inventing a React Native component test harness that is not yet installed in the repository.

## Executable Coverage Check

- Script: `/src/mobile/scripts/validate-mobile-test-coverage.mjs`
- Data: `/src/mobile/test/mobile-action-flow-coverage.json`
- Command: `npm run test:coverage-plan` from `/src/mobile`

The script validates that the required P145 flows are represented with screen IDs and business assertions:

- login and context
- queue sync
- job-card start/pause/complete
- quantity posting
- downtime
- quality checkpoint
- dispatch proof

## Not Yet Supported

- React Native component rendering tests are not supported at this checkpoint because no mobile test runner or installed mobile dependency tree exists.
- Device-level camera, barcode, file, and offline-storage tests require a real React Native test stack before they can be automated honestly.

## Future Harness Target

When mobile dependencies are installed, extend this baseline with:

- React Native Testing Library component tests for M001-M024 critical screens.
- Queue reducer/state tests for `Queued`, `Syncing`, `Synced`, `Conflict`, `Rejected`, and `RetryScheduled`.
- Device abstraction tests for barcode, camera, attachment, and voice-note adapters.
