# P134 — Order snapshot and stage-wise mobile board

## Phase
Phase 6 - Mobile

## Objective
Build the order snapshot and stage-wise mobile board in the React Native mobile app.

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
- `/reference-ui/W057_Order_Delivery_Dashboard.html`
- `/reference-ui/W108_Stage_Wise_Dashboard.html`

## Work to do
- Implement the following mobile surfaces: M020 Order Snapshot, M021 Stage Wise Mobile Board.
- Keep interactions thumb-friendly and focused on action, not dense administration.
- Support offline-first state where the blueprint requires it.
- Use the same status vocabulary, badge language, and audit-friendly phrasing as the web product.
- Use /reference-ui/W057_Order_Delivery_Dashboard.html, /reference-ui/W108_Stage_Wise_Dashboard.html as visual/interaction reference for layout and data hierarchy, simplified for mobile.
## User-value notes

- M020 — Mobile order health summary
- M021 — Compact board of blocked/overdue stages

## Related screens

| ScreenId | Name | Roles | Purpose | ReferenceUI |
| --- | --- | --- | --- | --- |
| M020 | Order Snapshot | ManagementViewer, SalesCoordinator | Mobile order health summary | W057_Order_Delivery_Dashboard.html |
| M021 | Stage Wise Mobile Board | PlantHead, ManagementViewer | Compact board of blocked/overdue stages | W108_Stage_Wise_Dashboard.html |

## Deliverables for this prompt
- `/docs/codex-progress/P134-output.md`

## Definition of done
- The flow works on small screens and supports loading/empty/error/offline states.
- The flow is fast to operate for a supervisor, operator, storekeeper, or inspector.
- Media capture/scanning/offline queue behavior is documented where device capabilities are used.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P135_barcode-qr-scan-camera-attachment-and-device-utilities.md`
