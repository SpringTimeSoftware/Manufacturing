# PRIORITY-STABILIZATION-01 Output

Date: 2026-05-08
Branch: main

## Scope

- Removed silent seeded notification and approval fallback from live authenticated sessions.
- Kept seeded notification and approval data available only for demo/anonymous demo-mode behavior.
- Rechecked high-visibility draft/create/save flows for quotes, sales orders, blanket orders, demand forecast, ATP, commercial setup, MRP, BOQ, and capacity.
- Added scroll containment for the capacity lane board and tightened large modal workspace overflow behavior.
- Clarified sidebar child entries and differentiated high-use platform menu icons.

## Action Truth

- Actions wired this pass: 0 new business actions.
- Actions disabled with reason this pass: 1 visible read-all action now disables while live notifications are loading or unavailable, with a business-safe title reason.
- Existing quote/order/blanket/forecast/ATP and planning controls remain disabled with explicit business reasons where backend workflow is not available.
- Live approval decisions remain wired to the backend decision endpoint; failed live service calls now surface an error instead of recording a local success.

## Tests Added

- `src/web/src/pages/PriorityStabilization01.test.tsx`
  - Live notification API failure does not render seeded notifications.
  - Live approval API failure does not render seeded approvals.
  - High-visibility quote and price-list actions remain truthful.
  - Capacity board and modal CSS include scroll constraints.
  - Sidebar submenu child styling and differentiated platform icons render.

## Screenshot Evidence

- Folder: `docs/codex-review-screens/PRIORITY-STABILIZATION-01/`

## Validation

- `npm run typecheck`: PASS
- `npm test`: PASS, 35 test files / 142 tests
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS after stopping a stale local `STS.Mfg.Host` process that locked Debug DLLs
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS
