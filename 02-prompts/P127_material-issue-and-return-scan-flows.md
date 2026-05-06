# P127 — Material issue and return scan flows

## Phase
Phase 6 - Mobile

## Objective
Build the material issue and return scan flows in the React Native mobile app.

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
- Implement the following mobile surfaces: M010 Material Issue Scan, M011 Material Return Scan.
- Keep interactions thumb-friendly and focused on action, not dense administration.
- Support offline-first state where the blueprint requires it.
- Use the same status vocabulary, badge language, and audit-friendly phrasing as the web product.
## User-value notes

- M010 — Scan bin/barcode and issue to WO/job card
- M011 — Scan and return unused material

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| M010 | Material Issue Scan | StoreKeeper, ProductionSupervisor | Scan bin/barcode and issue to WO/job card |  |
| M011 | Material Return Scan | StoreKeeper, ProductionSupervisor | Scan and return unused material |  |

## Deliverables for this prompt
- `/docs/codex-progress/P127-output.md`

## Definition of done
- The flow works on small screens and supports loading/empty/error/offline states.
- The flow is fast to operate for a supervisor, operator, storekeeper, or inspector.
- Media capture/scanning/offline queue behavior is documented where device capabilities are used.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P128_bin-transfer-putaway-and-cycle-count-flows.md`
