# DEMO-CLOSEOUT-01 Output

Date: 2026-05-12

## Scope

Web-only demo closeout for tonight's customer-facing data-entry and review build. Native mobile camera, voice, barcode, file capture, offline sync, and device utility completion remain out of scope for this pass.

## Implemented Tonight

- Hid optional workflow shortcut navigation by default in the web shell so the demo starts in the governed web workspace.
- Removed native mobile surface metadata from role matrix review and CSV export, replacing the visible detail with web role/module context.
- Relabeled the fallback operations navigation group to avoid exposing unfinished mobile workflow wording in web demo navigation.
- Fixed dashboard quick-access tiles so each shortcut description renders once while the action remains clickable.
- Tightened top workspace controls so company, branch, notification, switch, and sign-out actions wrap cleanly at the demo desktop viewport.
- Rebuilt and republished the host web assets with the current Vite hashes.
- Updated `07-ux-governance/action_truth_matrix.csv` with the DEMO-CLOSEOUT-01 hide/work decisions.

## Hidden For Demo

- Optional workflow shortcut panel in `AppShell` unless explicitly enabled through feature flags.
- Seeded scenario navigation from the default web shell.
- Native mobile surface metadata in `/platform/roles` role detail.
- Native mobile surface metadata in `/platform/roles` CSV export.

## Disabled With Reason For Demo

- No new demo-only disabled action was added.
- Existing live-only authoring/posting actions remain disabled with visible business reasons when the user is not in a live signed-in session, including engineering authoring, routing authoring, and other governed write flows that require live API authorization.

## Safe Live Demo Flows

- Login and account recovery shell.
- Home dashboard, order risk, notifications, and approvals review.
- Item master, customer master, supplier master, price lists, discount schemes, tax/currency/terms.
- BOM library, routing library, BOQ requirements, MRP, and capacity boards for governed review.
- Work orders, job cards, production receipt, quality inspection, and dispatch shipment review.

## Out Of Scope Tonight

- Native mobile execution workflows.
- Native camera, voice, barcode, and offline sync completion.
- New integration, AI, import/export, or reporting modules outside the already implemented web shell.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 37 files / 153 tests
- `npm run build`: PASS, Vite chunk-size warning only
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS, Vite chunk-size warning only

## Screenshot Evidence

Screenshot folder: `docs/codex-review-screens/DEMO-CLOSEOUT-01/`

Captured 20 web demo screenshots:

- Login
- Home dashboard
- Item master
- Customer master
- Supplier master
- Price lists
- Discount schemes
- Tax/currency/terms
- BOM library
- Routing library
- BOQ requirements
- MRP run console
- Capacity planning
- Work orders
- Job cards
- Production receipt
- Quality inspections
- Dispatch shipments
- Notifications
- Approvals

## Final Remaining Blockers For Tonight

- None for the focused web demo build.
- Do not present native mobile/device/sync workflows as part of tonight's demo; they remain outside the agreed web-only scope.
