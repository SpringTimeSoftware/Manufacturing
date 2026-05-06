# P126 — Execution action sheet and quantity capture

## Phase
Phase 6 - Mobile

## Objective
Build the execution action sheet and quantity capture in the React Native mobile app.

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
- Implement the following mobile surfaces: M008 Execution Action Sheet, M009 Good / Reject / Scrap Entry.
- Keep interactions thumb-friendly and focused on action, not dense administration.
- Support offline-first state where the blueprint requires it.
- Use the same status vocabulary, badge language, and audit-friendly phrasing as the web product.
## User-value notes

- M008 — Start/pause/resume/complete with reason
- M009 — Quantity posting with photos and notes

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| M008 | Execution Action Sheet | MachineOperator | Start/pause/resume/complete with reason |  |
| M009 | Good / Reject / Scrap Entry | MachineOperator, QCInspector | Quantity posting with photos and notes |  |

## Deliverables for this prompt
- `/docs/codex-progress/P126-output.md`

## Definition of done
- The flow works on small screens and supports loading/empty/error/offline states.
- The flow is fast to operate for a supervisor, operator, storekeeper, or inspector.
- Media capture/scanning/offline queue behavior is documented where device capabilities are used.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P127_material-issue-and-return-scan-flows.md`
