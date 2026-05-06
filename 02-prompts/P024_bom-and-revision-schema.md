# P024 — BOM and revision schema

## Phase
Phase 1 - Database

## Objective
Model multilevel BOMs with revision control.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P018-items-core.md`
- `/docs/database/P023-operations-routings.md`

## Work to do
- Design Boms, BomRevisions, BomLines, and BomOperations.
- Support scrap %, issue method, phantom option, alternate item link, and effective dates.
- Document approval/obsolete behavior.
## Deliverables for this prompt
- `/docs/database/P024-bom.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P025_engineering-changes-and-alternate-item-schema.md`
