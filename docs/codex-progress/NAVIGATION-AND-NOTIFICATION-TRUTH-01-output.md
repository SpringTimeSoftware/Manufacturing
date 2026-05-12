# NAVIGATION-AND-NOTIFICATION-TRUTH-01 Output

Date: 2026-05-12

Run: NAVIGATION-AND-NOTIFICATION-TRUTH-01 - Navigation and notification truth pattern fix.

## Scope

- Shared web app navigation hierarchy and icon mapping.
- Shared shell header/context duplication.
- Notification center and approval workbench data truth.
- Linked-record action truth for notification and approval open actions.

## Pattern Classes Fixed

- Flat submenu grouping in shared navigation.
- Repeated generic navigation icons for object-level screens.
- Duplicate role identity in the workspace header.
- Duplicate company/branch context in the workspace header.
- Duplicate unread notification summary under page titles.
- Seeded/demo notification and approval truth confusion in live sessions.
- Generic linked-record routing from notifications and approvals.
- Blank/generic landing after approval linked-record open actions.
- Notification/action badge clutter in the shell topbar.

## Navigation Hierarchy Changes

- Added explicit nested parent groups inside the affected navigation sections:
  - Master Data: Organization, Units and Measurement, Resources, Business Partners, Item Foundation.
  - Engineering & Production: Engineering, Production Execution.
  - Planning: Demand and Sales, Planning Control.
  - Commercial Setup: Pricing and Discounts, Tax, Currency, and Terms.
  - Platform: Alerts and Decisions, Access Control, Governance, Workspace Settings, Utilities.
- Rendered child entries with parent labels and child-link treatment so expanded sections no longer appear as one ambiguous bucket.

## Icon Mapping Changes

- Added object-specific icon names and SVG mappings for UOM Classes, UOM Conversions, Measurement Profiles, Item Groups, Item Attributes, Classifications, Reason Codes, Items, Item Variants, Barcodes, Customers, Suppliers, Supplier Lead Times, Resources, Planning, Commercial Setup, Platform, and related execution objects.
- Navigation tests now assert differentiated master-data icons rather than repeated broad-section icons.

## Header Duplication Removed

- Removed the redundant role/user summary chip from the page-title area because the sidebar user card already presents identity and role scope.
- Removed redundant company/branch text lines because the company and branch selectors are the authoritative context controls.
- Removed the duplicate unread notification summary chip because the top-right notification button already carries the unread count.
- Preserved the useful warehouse context chip where present.

## Notification And Approval Truth

- Live authenticated notification loading now hides non-live operating rows if the API returns seeded-shaped alerts and shows a verified-live empty state instead.
- Live approval loading now hides non-live approval rows if the API returns seeded-shaped approvals and shows a verified-live empty state instead.
- Notification and approval linked-record actions now use a shared linked-action resolver:
  - record-specific paths are enabled,
  - unsupported generic paths are disabled with business-safe reasons,
  - hidden remains available for records without a meaningful action.
- Approval deep links can select approval detail by `approval` or `reference` query parameter.
- Work Order linked approval now opens `/production/work-orders?workOrder=WO-2026-044` and selects the matching Work Order modal.

## Registries Updated

- Created `docs/final-audit/08_navigation_notification_issue_register.csv`.
- Updated `07-ux-governance/action_truth_matrix.csv` with notification and approval linked-record action outcomes.

## Screenshot Evidence

Screenshot folder:

- `docs/codex-review-screens/NAVIGATION-AND-NOTIFICATION-TRUTH-01/`

Captured evidence:

- Home/dashboard cleaned header.
- Master Data menu collapsed.
- Master Data menu expanded.
- Engineering & Production menu expanded.
- Notification Center.
- Approval Workbench.
- Approval detail modal with linked record action.
- Working linked-record Work Order modal.
- Disabled linked-record reason.

## Remaining Blockers

- No completion blockers remain for this pattern pass.
- Some non-work-order approval targets remain disabled with business-safe reasons until those target workspaces support record-specific deep links.

## Validation

- `npm run typecheck` from `src/web`: PASS
- `npm test` from `src/web`: PASS, 39 files / 165 tests
- `npm run build` from `src/web`: PASS, Vite chunk-size warning only
- `npm run build:host` from `src/web`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS, 0 warnings / 0 errors
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS, Vite chunk-size warning only
