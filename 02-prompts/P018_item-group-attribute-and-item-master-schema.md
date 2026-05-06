# P018 — Item group, attribute, and item master schema

## Phase
Phase 1 - Database

## Objective
Create the core item master.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P017-measurements.md`
- `/docs/demo/demo-master-data.md`

## Work to do
- Design ItemGroups, ItemAttributes, ItemAttributeValues, and Items.
- Support item types: RM, WIP, FG, consumable, service, tool, packaging, subcontract service.
- Store stock UOM, purchase UOM, sales UOM, production UOM, traceability flags, QC flags, and planning defaults.
## Deliverables for this prompt
- `/docs/database/P018-items-core.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P019_item-variants-barcodes-and-item-uom-behavior-schema.md`
