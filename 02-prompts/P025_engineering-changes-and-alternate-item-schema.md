# P025 — Engineering changes and alternate item schema

## Phase
Phase 1 - Database

## Objective
Model revision-driven change and substitution control.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P024-bom.md`

## Work to do
- Design EngineeringChanges, EngineeringChangeLines, and AlternateItems.
- Support item and BOM impact, approval, and effective date control.
## Deliverables for this prompt
- `/docs/database/P025-eco-alternates.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P026_quote-sales-order-blanket-order-and-forecast-schema.md`
