# Wave 01B Sidebar/Menu Reference Visual Correction Output

Date: 2026-04-22

## Scope

- Completed Wave 01B only: visual shell, sidebar/menu, header, dashboard density, login visual check, and production-facing content cleanup.
- Used `reference-ui/desired-sidebar-dashboard-9001.png` as the sidebar/dashboard visual target.
- Did not change backend, database, seed, policy, or auth behavior.
- Preserved IIS publish-folder deployment by running the existing web `build:host` command.

## Sidebar/Menu Visual Changes

- Reworked the desktop sidebar toward the 9001 reference style: 272px light rail, compact white brand card, subtle STS mark, and production-safe subtitle.
- Replaced placeholder/initial icons with consistent inline SVG navigation icons.
- Kept grouped role-aware navigation sections visible with clean uppercase labels: OVERVIEW, PLANNING, ENGINEERING & PRODUCTION, MASTER DATA, PROCUREMENT, INVENTORY, QUALITY, DISPATCH, PLATFORM, and REPORTS.
- Replaced heavy accordion treatment with subtle chevrons and neutral counts; no visible `LESS` or `+N` treatment remains in the sidebar.
- Updated the home navigation label to `Home Dashboard` for a clearer business-facing active entry.
- Kept role filtering through existing navigation role rules only; no bypasses were added.

## Header/Dashboard/Login Changes

- Tightened the top workspace toolbar spacing and selector sizing so company and branch labels have more usable width.
- Refined the home dashboard density through shared CSS: denser KPI strip, tighter card/table spacing, compact empty states, balanced main/side layout, and two-column quick access on desktop.
- Login page was checked and left on the existing Wave 1/Wave 1A production layout; no technical, framework, scaffold, or backend reachability copy was reintroduced.

## Content Cleanup

- Replaced production-facing implementation-flavored copy that referenced scaffolding, preserved dashboard surfaces, later prompts, or placeholders.
- Follow-up sweep leaves restricted terms only in tests, imports, code symbols, or adapter module names, not normal user-facing copy.

## Tests Added/Updated

- Updated `AppShell` tests to assert grouped section labels, active `Home Dashboard`, SVG menu icons, company/branch selector rendering, absence of `LESS`, and absence of internal/scaffold terms.
- Updated `DashboardPages` tests to assert home operational sections and absence of internal/source-status copy.
- Existing login and route-guard coverage remained intact.

## Validation

- `npm run typecheck` - passed.
- `npm test` - passed, 19 test files and 76 tests.
- `npm run build` - passed. Vite emitted the existing large chunk warning for the main bundle.
- `npm run build:host` - passed. Vite emitted the same large chunk warning and copied the web build through the host workflow.
- Backend validation was not run because no backend code was touched in this Wave 01B pass.

## Remaining Gaps

- No Wave 01B code/test validation gap remains.
- Browser MCP screenshot capture could not be used because the tool attempted to create `C:\Windows\System32\.playwright-mcp` and failed with `EPERM`; this did not block the required repository validation commands.
