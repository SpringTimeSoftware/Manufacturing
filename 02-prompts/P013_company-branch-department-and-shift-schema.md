# P013 — Company, branch, department, and shift schema

## Phase
Phase 1 - Database

## Objective
Model legal entities and plant operating structure.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/conventions.md`
- `/docs/security/data-scope-model.md`

## Work to do
- Design Companies, Branches, Departments, and Shifts tables.
- Include default calendars, timezone, language, and numbering references where needed.
- Document keys, uniqueness rules, and relationships.
## Deliverables for this prompt
- `/docs/database/P013-company-branch-shift.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P014_warehouse-and-bin-schema.md`
