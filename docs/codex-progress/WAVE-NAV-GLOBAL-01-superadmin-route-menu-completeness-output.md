# Wave NAV-GLOBAL-01 Super Admin Route/Menu Completeness Output

Date: 2026-04-23

## Scope

This pass reconciled implemented web routes with role-aware navigation so Super Admin can discover every implemented protected screen without adding backend behavior or new ERP modules.

## Files Changed

- `/07-ux-governance/superadmin_route_menu_matrix.csv`
- `/docs/codex-progress/README.md`
- `/docs/codex-progress/WAVE-NAV-GLOBAL-01-superadmin-route-menu-completeness-output.md`
- `/src/web/src/layout/AppShell.tsx`
- `/src/web/src/layout/AppShell.test.tsx`
- `/src/web/src/layout/NavigationCompleteness.test.tsx`
- `/src/web/src/layout/navigation.ts`
- `/src/web/dist/index.html`
- `/src/web/dist/assets/index--NO69m11.js`
- `/src/web/dist/assets/index-BxetQJJ_.css`
- `/src/server/STS.Mfg.Host/wwwroot/index.html`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index--NO69m11.js`
- `/src/server/STS.Mfg.Host/wwwroot/assets/index-BxetQJJ_.css`

## Route/Menu Audit

- Created `/07-ux-governance/superadmin_route_menu_matrix.csv`.
- Audited 87 matrix rows total.
- Audited 83 implemented routes:
  - 81 protected app routes are visible for Super Admin.
  - 2 anonymous routes, `/login` and `/forgot-password`, are intentionally hidden from authenticated app navigation.
- Recorded 4 audit-only missing screens as not exposed:
  - `/search`
  - `/resources/work-centers`
  - `/resources/machines`
  - `/resources/tools`

## Navigation Fixes

- Added the missing Super Admin menu entry for `/platform/settings` as `Platform Settings`.
- Added a dedicated `COMMERCIAL SETUP` navigation group.
- Moved implemented commercial setup screens into `COMMERCIAL SETUP`:
  - Price Lists
  - Discount Schemes
  - Tax, Currency & Terms
- Kept Customers, Suppliers, and Supplier Lead Times under `MASTER DATA`.
- Preserved role-aware filtering for non-admin users.
- No backend, database, or business logic changes were made.

## Tests Added / Updated

- Updated shell tests to assert Super Admin can see:
  - `COMMERCIAL SETUP`
  - Price Lists
  - Discount Schemes
  - Tax, Currency & Terms
  - Customers
  - Suppliers
  - Platform Settings
- Added `NavigationCompleteness.test.tsx` to verify:
  - every implemented protected route has a navigation item
  - no extra navigation item points at a missing route
  - Super Admin sees major commercial/master/platform menu entries
  - non-admin role filtering still hides commercial setup and platform settings
  - menu labels do not expose internal/scaffold terms

## Validation

- `npm run typecheck -- --pretty false`: PASS.
- `npm test -- --run`: PASS, 30 test files and 116 tests.
- `npm run build`: PASS. Vite reported the existing large chunk warning.
- `npm run build:host`: PASS. Vite reported the existing large chunk warning.
- Backend validation was not required because no backend/database code was changed.

## Local Run Status

- Backend running at `http://localhost:5102`; `/api/health/ready` returned HTTP 200 Healthy.
- Web dev server running at `http://127.0.0.1:5173`; root returned HTTP 200.
- Mobile Metro running at `http://127.0.0.1:8081`; `/status` returned `packager-status:running`.

## Remaining Hidden / Blocked Screens

- Intentional hidden app-menu routes:
  - `/login`
  - `/forgot-password`
- Missing audit-only routes not exposed:
  - `/search`
  - `/resources/work-centers`
  - `/resources/machines`
  - `/resources/tools`

## Exact Next Recommended Wave

Wave 5: Engineering And Planning Depth.
