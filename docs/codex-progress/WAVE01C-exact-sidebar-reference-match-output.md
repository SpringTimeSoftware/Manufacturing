# Wave 01C Exact Sidebar Reference Match Output

Date: 2026-04-22

## Scope

- Completed Wave 01C only: sidebar/menu exact-reference correction, compact header spacing, tests, and deliverable documentation.
- Used `reference-ui/desired-sidebar-dashboard-9001.png` as the required visual target.
- Did not change backend, database, auth, item, customer, or master-data screen behavior.
- Did not start Wave 2 or add product features.

## Sidebar Changes Completed

- Removed visible numeric count chips from sidebar group headers.
- Kept group headers as plain small uppercase labels with only a subtle chevron for collapse state.
- Removed the boxed icon badge treatment and kept consistent inline SVG icons with shared sizing, stroke, spacing, and color.
- Kept the active `Home Dashboard` row soft and obvious with light blue background, subtle border, stronger text, and icon highlight.
- Simplified the brand card to a compact white card with a small blue accent dot, required product name, and required subtitle.
- Preserved existing role-aware navigation filtering and business grouping.

## Header Changes Completed

- Increased company and branch selector grid widths in the compact workspace toolbar.
- Kept action controls aligned and compact while avoiding aggressive clipping of company/branch values.
- Maintained responsive one-column toolbar behavior at narrower widths.

## Tests Updated

- Updated `AppShell` coverage to assert clean section labels, active `Home Dashboard`, SVG menu icons, no rendered section count chip element, no numeric group-header text, no `LESS`, no `+N`, company/branch controls, and absence of internal/scaffold terms.

## Validation

- `npm run typecheck` - passed.
- `npm test` - passed, 19 test files and 76 tests.
- `npm run build` - passed. Vite emitted the existing large chunk warning for the main bundle.
- `npm run build:host` - passed. Vite emitted the same large chunk warning and copied the web build through the host workflow.
- Backend validation not required because backend code was not touched.

## Checklist

- Created `/docs/design/sidebar-reference-match-checklist.md`.
- Checklist result: PASS for brand card, section headers, icons, active state, no generated-looking count badges, and header controls not clipped.

## Remaining Visual Gaps

- No checklist item is PARTIAL or FAIL.
- No automated pixel-diff exists for the 9001 reference image; future visual QA can add screenshot comparison if stricter image-level regression checks are required.
