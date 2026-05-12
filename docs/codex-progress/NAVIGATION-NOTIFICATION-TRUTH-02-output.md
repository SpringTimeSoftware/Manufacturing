# NAVIGATION-NOTIFICATION-TRUTH-02 Output

Date: 2026-05-12
Status: COMPLETE

## Pattern Classes Fixed

- flat submenu grouping
- repeated generic icons
- duplicate role/user context
- duplicate company/branch display
- duplicate unread count display
- seeded/demo notification confusion
- generic linked-record routing
- blank target after linked-record action
- notification/action badge clutter

## Navigation Hierarchy Changes

- Split Organization and Resource Setup out of Master Data into a dedicated Organization navigation group.
- Kept Master Data focused on Units and Measurement, Item Foundation, and Business Partners.
- Preserved grouped child rendering for Planning, Engineering & Production, Commercial Setup, and Platform.
- Verified Super Admin role-aware route visibility through navigation tests.

## Icon Mapping Changes

- Added distinct route icons for Production Receipt, Rework, Scrap / By-product, and Tenant Settings.
- Kept object-level icon mapping for measurement, item foundation, partner, resource, commercial, planning, platform, approval, and notification entries.

## Header Duplication Removed

- Shared shell remains free of duplicate user/role chips near the page title.
- Company and branch selectors remain the single visible company/branch context.
- Notification count remains in the top-right notification control instead of a duplicate page-title chip.

## Notification And Approval Truth

- Live authenticated notification and approval flows continue to avoid silent seeded fallback when API calls fail.
- Dashboard blocker actions now require record-specific paths or render disabled with a visible business reason.
- Notification-derived dashboard entries now use the same linked-record truth helper as notification and approval actions.

## Linked-Record Routing

- Dashboard delivery blockers open `/dashboards/order-delivery` with the sales-order query context.
- Dispatch release approval now opens `/dispatch/pack-lists?packList=PACK-2026-0042`.
- Pack List and Shipment pages now select records from supported query context.
- Unsupported approval targets remain disabled with business-safe reasons.

## Remaining Blockers

- None for this strict pattern wave.
- Future work can add exact deep links for BOM revision, purchase order, AI summary, and stage-board records when those target workspaces expose record-specific route context.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 39 files, 166 tests
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence

Folder: `docs/codex-review-screens/NAVIGATION-NOTIFICATION-TRUTH-02/`

- `01-home-dashboard-clean-header.png`
- `02-master-data-menu-collapsed.png`
- `03-master-data-menu-expanded.png`
- `04-planning-menu-expanded.png`
- `05-engineering-production-menu-expanded.png`
- `06-notification-center.png`
- `07-approval-workbench.png`
- `08-approval-detail-modal-dispatch.png`
- `09-true-linked-record-pack-list.png`
- `10-disabled-linked-record-reason.png`
