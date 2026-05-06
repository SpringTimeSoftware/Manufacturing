# P125 — My job cards queue and job card detail

## Phase
Phase 6 - Mobile

## Objective
Build the my job cards queue and job card detail in the React Native mobile app.

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
- `/reference-ui/W082_Job_Cards.html`

## Work to do
- Implement the following mobile surfaces: M006 My Job Cards Queue, M007 Job Card Detail.
- Keep interactions thumb-friendly and focused on action, not dense administration.
- Support offline-first state where the blueprint requires it.
- Use the same status vocabulary, badge language, and audit-friendly phrasing as the web product.
- Use /reference-ui/W082_Job_Cards.html as visual/interaction reference for layout and data hierarchy, simplified for mobile.
## User-value notes

- M006 — Assigned and nearby job cards ready for action
- M007 — Operation context, specs, attachments, required qty

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| M006 | My Job Cards Queue | MachineOperator, ProductionSupervisor | Assigned and nearby job cards ready for action |  |
| M007 | Job Card Detail | MachineOperator, ProductionSupervisor | Operation context, specs, attachments, required qty | W082_Job_Cards.html |

## Deliverables for this prompt
- `/docs/codex-progress/P125-output.md`

## Definition of done
- The flow works on small screens and supports loading/empty/error/offline states.
- The flow is fast to operate for a supervisor, operator, storekeeper, or inspector.
- Media capture/scanning/offline queue behavior is documented where device capabilities are used.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P126_execution-action-sheet-and-quantity-capture.md`
