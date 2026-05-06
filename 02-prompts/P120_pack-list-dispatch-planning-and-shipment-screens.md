# P120 — Pack list, dispatch planning, and shipment screens

## Phase
Phase 5 - Web Screens

## Objective
Build the pack list, dispatch planning, and shipment screens in the React web application.

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
- Implement the following related web screens: W105 Pack List, W106 Dispatch Planning, W107 Shipment / Delivery.
- Use the shared page shell, filter bar, grid/drawer/form framework, and KPI components rather than inventing new patterns.
- Wire the screen(s) to real or mocked API contracts from the backend phase; if an endpoint is pending, create a typed adapter stub and document the dependency.
- Respect translation keys, RBAC visibility, loading/empty/error states, and audit-friendly action labels.
- Follow the documented design language and stay visually consistent with the reference manufacturing screens.
## User-value notes

- W105 — Packing structure, labels, pack completeness
- W106 — Dispatch queue by due date and readiness
- W107 — Vehicle, LR/tracking, loading proof, documents

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| W105 | Pack List | DispatchManager | Packing structure, labels, pack completeness |  |
| W106 | Dispatch Planning | DispatchManager, SalesCoordinator | Dispatch queue by due date and readiness |  |
| W107 | Shipment / Delivery | DispatchManager | Vehicle, LR/tracking, loading proof, documents |  |

## Deliverables for this prompt
- `/docs/codex-progress/P120-output.md`

## Definition of done
- The screen(s) render cleanly in the shared shell with realistic demo data.
- Primary actions, filters, drawers/forms, and status badges work.
- The layout is visually consistent with the design language and does not regress into generic admin templates.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P121_stage-wise-dashboard-order-delivery-dashboard-and-print-pack.md`
