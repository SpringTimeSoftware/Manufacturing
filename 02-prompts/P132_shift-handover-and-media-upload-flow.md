# P132 — Shift handover and media upload flow

## Phase
Phase 6 - Mobile

## Objective
Build the shift handover and media upload flow in the React Native mobile app.

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
- Implement the following mobile surfaces: M022 Shift Handover / Notes / Photos, M023 Attachments / Photo / Voice Upload.
- Keep interactions thumb-friendly and focused on action, not dense administration.
- Support offline-first state where the blueprint requires it.
- Use the same status vocabulary, badge language, and audit-friendly phrasing as the web product.
## User-value notes

- M022 — Shift summary with media and pending issues
- M023 — Upload proof and notes from phone

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| M022 | Shift Handover / Notes / Photos | ProductionSupervisor | Shift summary with media and pending issues |  |
| M023 | Attachments / Photo / Voice Upload | All users | Upload proof and notes from phone |  |

## Deliverables for this prompt
- `/docs/codex-progress/P132-output.md`

## Definition of done
- The flow works on small screens and supports loading/empty/error/offline states.
- The flow is fast to operate for a supervisor, operator, storekeeper, or inspector.
- Media capture/scanning/offline queue behavior is documented where device capabilities are used.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P133_dispatch-loading-and-proof-flow.md`
