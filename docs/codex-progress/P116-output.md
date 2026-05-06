# P116 Output - Production Receipt and Scrap/By-product Screens

Date: 2026-04-20

## Scope Completed

- Implemented `P116_production-receipt-and-scrap-by-product-screens.md`.
- Added W088 Production Receipt at `/production/receipts`.
- Added W089 Scrap / By-product Entry at `/production/scrap-by-products`.
- Added typed production receipt and scrap DTO contracts, API client reads, query keys, seeded fallback rows, KPI cards, grids, filters, drawers, and regression coverage.

## Runtime Wiring

- Production Receipt uses completed `/api/production-receipts` reads for non-demo sessions.
- Scrap / By-product Entry uses completed `/api/scrap-rework/scrap` reads for non-demo sessions.
- Demo and degraded API states use typed seeded fallback rows.
- Cost valuation remains a placeholder signal only; no landed-cost, accounting, or costing expansion was added.

## Files Changed

- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/production/productionOutputAdapters.ts`
- `src/web/src/pages/ProductionOutputPages.tsx`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/src/pages/PromptP116P123Pages.test.tsx`

## Validation

- `npm run typecheck` passed.
- `npm test` passed: 16 files, 67 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run build:host` passed and kept host publish integration valid.
- Backend validation was not run because this prompt changed web client assets only.

## Next Prompt

`/02-prompts/P117_rework-order-and-machine-status-screen.md`
