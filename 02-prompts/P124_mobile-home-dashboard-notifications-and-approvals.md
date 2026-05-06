# P124 — Mobile home dashboard, notifications, and approvals

## Phase
Phase 6 - Mobile

## Objective
Build the mobile home dashboard, notifications, and approvals in the React Native mobile app.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/mobile/offline-sync-strategy.md`
- `/docs/design/design-language.md`
- `/00-blueprint/screen_inventory.csv`

## Work to do
- Implement the following mobile surfaces: M003 My Dashboard, M004 Notifications / Inbox, M005 My Approvals.
- Keep interactions thumb-friendly and focused on action, not dense administration.
- Support offline-first state where the blueprint requires it.
- Use the same status vocabulary, badge language, and audit-friendly phrasing as the web product.
## User-value notes

- M003 — Role-specific action cards and summary tiles
- M004 — Alerts, reminders, approvals, escalation messages
- M005 — Approve/reject quick actions

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| M003 | My Dashboard | All users | Role-specific action cards and summary tiles |  |
| M004 | Notifications / Inbox | All users | Alerts, reminders, approvals, escalation messages |  |
| M005 | My Approvals | Managers | Approve/reject quick actions |  |

## Deliverables for this prompt
- `/docs/codex-progress/P124-output.md`

## Definition of done
- The flow works on small screens and supports loading/empty/error/offline states.
- The flow is fast to operate for a supervisor, operator, storekeeper, or inspector.
- Media capture/scanning/offline queue behavior is documented where device capabilities are used.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P125_my-job-cards-queue-and-job-card-detail.md`
