# P121 — Stage-wise dashboard, order delivery dashboard, and print pack

## Phase
Phase 5 - Web Screens

## Objective
Build the stage-wise dashboard, order delivery dashboard, and print pack in the React web application.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/design/design-language.md`
- `/docs/codex-progress/P070-output.md`
- `/docs/codex-progress/P071-output.md`
- `/docs/codex-progress/P074-output.md`
- `/00-blueprint/screen_inventory.csv`
- `/reference-ui/W108_Stage_Wise_Dashboard.html`
- `/reference-ui/W057_Order_Delivery_Dashboard.html`

## Work to do
- Implement the following related web screens: W108 Stage Wise Dashboard, W057 Order Delivery Dashboard, W109 Print Pack / Traveler / Labels.
- Use the shared page shell, filter bar, grid/drawer/form framework, and KPI components rather than inventing new patterns.
- Wire the screen(s) to real or mocked API contracts from the backend phase; if an endpoint is pending, create a typed adapter stub and document the dependency.
- Respect translation keys, RBAC visibility, loading/empty/error states, and audit-friendly action labels.
- Use /reference-ui/W108_Stage_Wise_Dashboard.html, /reference-ui/W057_Order_Delivery_Dashboard.html as the visual anchor for layout, spacing, card style, badges, and screen composition.
## User-value notes

- W108 — Cross-department board from SO confirmed to dispatch
- W057 — Customer-order risk view with progress % and next actions
- W109 — Printable job travelers, labels, checklists, summaries

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| W108 | Stage Wise Dashboard | PlantHead, ManagementViewer | Cross-department board from SO confirmed to dispatch | W108_Stage_Wise_Dashboard.html |
| W057 | Order Delivery Dashboard | ManagementViewer, SalesCoordinator, PlantHead | Customer-order risk view with progress % and next actions | W057_Order_Delivery_Dashboard.html |
| W109 | Print Pack / Traveler / Labels | ProductionSupervisor, StoreKeeper, DispatchManager | Printable job travelers, labels, checklists, summaries |  |

## Deliverables for this prompt
- `/docs/codex-progress/P121-output.md`

## Definition of done
- The screen(s) render cleanly in the shared shell with realistic demo data.
- Primary actions, filters, drawers/forms, and status badges work.
- The layout is visually consistent with the design language and does not regress into generic admin templates.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P122_react-native-app-bootstrap-and-offline-shell.md`
