# P127 Output - Material Issue and Return Scan Flows

Date: 2026-04-20

## Scope Completed

- Implemented `P127_material-issue-and-return-scan-flows.md`.
- Added M010 Material Issue Scan with barcode/bin entry, target document, and queue action.
- Added M011 Material Return Scan with return barcode, source bin, target document, quantity, and queue action.

## Runtime Wiring

- Uses typed local material scan task data.
- Scan fields are text-entry placeholders until native barcode utilities are introduced by the later barcode/device prompt.
- No backend inventory mutation contract was invented.

## Files Changed

- `src/mobile/src/mobileTypes.ts`
- `src/mobile/src/mobileSeedData.ts`
- `src/mobile/src/MobileShell.tsx`
- `src/mobile/src/screens/MaterialScanScreen.tsx`

## Validation

- Mobile runnable validation was not available because `src/mobile/node_modules` and a mobile lockfile are absent at this checkpoint.
- `npm run typecheck` was not run in `src/mobile` to avoid reporting missing dependencies as a product failure.
- No web or backend validation was required because only mobile source files were changed.

## Next Prompt

`/02-prompts/P128_bin-transfer-putaway-and-cycle-count-flows.md`
