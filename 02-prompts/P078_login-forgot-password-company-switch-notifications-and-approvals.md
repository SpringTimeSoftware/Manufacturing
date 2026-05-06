# P078 — Login, forgot password, company switch, notifications, and approvals

## Phase
Phase 5 - Web Screens

## Objective
Build the login, forgot password, company switch, notifications, and approvals in the React web application.

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
- Implement the following related web screens: W001 Login, W002 Forgot Password / Reset, W003 Company / Branch / Warehouse Switch, W006 Notification Center, W007 Approval Workbench.
- Use the shared page shell, filter bar, grid/drawer/form framework, and KPI components rather than inventing new patterns.
- Wire the screen(s) to real or mocked API contracts from the backend phase; if an endpoint is pending, create a typed adapter stub and document the dependency.
- Respect translation keys, RBAC visibility, loading/empty/error states, and audit-friendly action labels.
- Follow the documented design language and stay visually consistent with the reference manufacturing screens.
## User-value notes

- W001 — Secure sign-in with company/branch context and device registration
- W002 — Password reset and MFA recovery
- W003 — Switch operating context without re-login
- W006 — System alerts, approvals, and reminder inbox
- W007 — Approve BOMs, releases, PO, holds, dispatch, AI drafts

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| W001 | Login | All users | Secure sign-in with company/branch context and device registration |  |
| W002 | Forgot Password / Reset | All users | Password reset and MFA recovery |  |
| W003 | Company / Branch / Warehouse Switch | All users | Switch operating context without re-login |  |
| W006 | Notification Center | All roles | System alerts, approvals, and reminder inbox |  |
| W007 | Approval Workbench | Managers | Approve BOMs, releases, PO, holds, dispatch, AI drafts |  |

## Deliverables for this prompt
- `/docs/codex-progress/P078-output.md`

## Definition of done
- The screen(s) render cleanly in the shared shell with realistic demo data.
- Primary actions, filters, drawers/forms, and status badges work.
- The layout is visually consistent with the design language and does not regress into generic admin templates.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P079_home-dashboard-and-executive-cockpit.md`
