# P109 — Work orders list screen

## Phase
Phase 5 - Web Screens

## Objective
Build the work orders list screen in the React web application.

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
- `/reference-ui/W080_Work_Orders.html`

## Work to do
- Implement the following related web screens: W080 Work Orders List.
- Use the shared page shell, filter bar, grid/drawer/form framework, and KPI components rather than inventing new patterns.
- Wire the screen(s) to real or mocked API contracts from the backend phase; if an endpoint is pending, create a typed adapter stub and document the dependency.
- Respect translation keys, RBAC visibility, loading/empty/error states, and audit-friendly action labels.
- Use /reference-ui/W080_Work_Orders.html as the visual anchor for layout, spacing, card style, badges, and screen composition.
## User-value notes

- W080 — List, release, re-release, and monitor WOs

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| W080 | Work Orders List | PlanningManager, ProductionSupervisor | List, release, re-release, and monitor WOs | W080_Work_Orders.html |

## Deliverables for this prompt
- `/docs/codex-progress/P109-output.md`

## Definition of done
- The screen(s) render cleanly in the shared shell with realistic demo data.
- Primary actions, filters, drawers/forms, and status badges work.
- The layout is visually consistent with the design language and does not regress into generic admin templates.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P110_work-order-detail-drawer.md`
