# P100 — MRP run console and result screen

## Phase
Phase 5 - Web Screens

## Objective
Build the mrp run console and result screen in the React web application.

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

## Work to do
- Implement the following related web screens: W067 MRP Run Console, W068 MRP Results / Exceptions.
- Use the shared page shell, filter bar, grid/drawer/form framework, and KPI components rather than inventing new patterns.
- Wire the screen(s) to real or mocked API contracts from the backend phase; if an endpoint is pending, create a typed adapter stub and document the dependency.
- Respect translation keys, RBAC visibility, loading/empty/error states, and audit-friendly action labels.
- Follow the documented design language and stay visually consistent with the reference manufacturing screens.
## User-value notes

- W067 — Run, review, and version MRP calculations
- W068 — Shortages, late items, missing data, recommended actions

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| W067 | MRP Run Console | PlanningManager | Run, review, and version MRP calculations |  |
| W068 | MRP Results / Exceptions | PlanningManager | Shortages, late items, missing data, recommended actions |  |

## Deliverables for this prompt
- `/docs/codex-progress/P100-output.md`

## Definition of done
- The screen(s) render cleanly in the shared shell with realistic demo data.
- Primary actions, filters, drawers/forms, and status badges work.
- The layout is visually consistent with the design language and does not regress into generic admin templates.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P101_boq-requirements-screen.md`
