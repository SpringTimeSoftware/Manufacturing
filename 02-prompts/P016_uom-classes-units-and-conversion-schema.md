# P016 — UOM classes, units, and conversion schema

## Phase
Phase 1 - Database

## Objective
Persist base units and conversions.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/STS_Manufacturing_ERP_Blueprint.md`

## Work to do
- Design UomClasses, Uoms, and UomConversions.
- Support fixed factor conversions and metadata required for formula-based conversions.
## Deliverables for this prompt
- `/docs/database/P016-uom.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P017_measurement-profiles-formulas-and-catch-weight-schema.md`
