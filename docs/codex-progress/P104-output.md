# P104 Output

## Objective Status

- Completed W074 Purchase Order List, W075 Purchase Order Detail, and W071 Subcontract / Outside Processing Plan.
- Added live/seeded adapters for `/api/purchase-orders` and `/api/subcontract-orders`.
- Added PO follow-up, PO line detail, subcontract send-out/receive-back planning, and drawer controls.

## Files Created or Changed

- `/src/web/src/api/contracts.ts`
- `/src/web/src/api/http.ts`
- `/src/web/src/api/hooks.ts`
- `/src/web/src/procurement/procurementAdapters.ts`
- `/src/web/src/pages/ProcurementPages.tsx`
- `/src/web/src/app/router.tsx`
- `/src/web/src/layout/navigation.ts`
- `/src/web/src/pages/PromptP102P107Pages.test.tsx`
- `/docs/codex-progress/P104-output.md`
- `/docs/codex-progress/README.md`

## Compatibility Notes

- PO and subcontract screens are read/review setup surfaces; they do not add accounting, landed-cost, or receive-back posting behavior.
- Subcontract receive-back remains backend-owned.

## Validation

- `npm run typecheck` passed.
- `npm test` passed with `14/14` files and `55/55` tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run build:host` passed and copied compiled assets into the ASP.NET host `wwwroot`.
- Backend validation was not applicable; no backend/runtime/schema files were changed for P104.

## Next Prompt

- `/02-prompts/P105_inventory-balance-and-traceability-screens.md`
