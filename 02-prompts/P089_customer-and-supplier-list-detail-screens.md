# P089 — Customer and supplier list/detail screens

## Phase
Phase 5 - Web Screens

## Objective
Build the customer and supplier list/detail screens in the React web application.

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
- Implement the following related web screens: W044 Customer List, W045 Customer Detail, W046 Supplier List, W047 Supplier Detail.
- Use the shared page shell, filter bar, grid/drawer/form framework, and KPI components rather than inventing new patterns.
- Wire the screen(s) to real or mocked API contracts from the backend phase; if an endpoint is pending, create a typed adapter stub and document the dependency.
- Respect translation keys, RBAC visibility, loading/empty/error states, and audit-friendly action labels.
- Follow the documented design language and stay visually consistent with the reference manufacturing screens.
## User-value notes

- W044 — Browse customers with delivery and order exposure
- W045 — Contacts, addresses, communication log, customer-specific notes
- W046 — Browse suppliers with lead-time and delay score
- W047 — Contacts, supply categories, terms, performance placeholders

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| W044 | Customer List | SalesCoordinator, ManagementViewer | Browse customers with delivery and order exposure |  |
| W045 | Customer Detail | SalesCoordinator | Contacts, addresses, communication log, customer-specific notes |  |
| W046 | Supplier List | PurchaseManager | Browse suppliers with lead-time and delay score |  |
| W047 | Supplier Detail | PurchaseManager | Contacts, supply categories, terms, performance placeholders |  |

## Deliverables for this prompt
- `/docs/codex-progress/P089-output.md`

## Definition of done
- The screen(s) render cleanly in the shared shell with realistic demo data.
- Primary actions, filters, drawers/forms, and status badges work.
- The layout is visually consistent with the design language and does not regress into generic admin templates.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P090_supplier-lead-time-matrix-and-attachment-viewer.md`
