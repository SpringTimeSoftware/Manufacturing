# P105 Output

## Objective Status

- Completed W094 Inventory Balance by Warehouse / Bin and W097 Lot / Serial / Catch Weight Traceability.
- Added live/seeded inventory adapters for `/api/inventory`, `/api/inventory/transactions`, and concrete lot/serial traceability lookups.
- Added balance KPIs, traceability event genealogy, filter states, and selected detail review behavior.

## Files Created or Changed

- `/src/web/src/api/contracts.ts`
- `/src/web/src/api/http.ts`
- `/src/web/src/api/hooks.ts`
- `/src/web/src/inventory/inventoryAdapters.ts`
- `/src/web/src/pages/InventoryPages.tsx`
- `/src/web/src/app/router.tsx`
- `/src/web/src/layout/navigation.ts`
- `/src/web/src/pages/PromptP102P107Pages.test.tsx`
- `/docs/codex-progress/P105-output.md`
- `/docs/codex-progress/README.md`

## Compatibility Notes

- Traceability uses live lot/serial endpoints only when a concrete lot or serial search value exists; otherwise it stays seeded for runnable demo behavior.
- No stock valuation or destructive inventory reset behavior was introduced.

## Validation

- `npm run typecheck` passed.
- `npm test` passed with `14/14` files and `55/55` tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run build:host` passed and copied compiled assets into the ASP.NET host `wwwroot`.
- Backend validation was not applicable; no backend/runtime/schema files were changed for P105.

## Next Prompt

- `/02-prompts/P106_material-issue-screen.md`
