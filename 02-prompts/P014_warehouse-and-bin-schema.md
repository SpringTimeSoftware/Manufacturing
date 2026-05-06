# P014 — Warehouse and bin schema

## Phase
Phase 1 - Database

## Objective
Model multi-warehouse and multi-bin storage with branch mapping.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/conventions.md`
- `/docs/demo/demo-master-data.md`

## Work to do
- Design Warehouses and Bins tables with warehouse type flags (RM/WIP/FG/QC/Quarantine/Dispatch).
- Support branch ownership and default receiving/issue bins.
- Add bin capacity, blocking, and count-cycle metadata.
## Deliverables for this prompt
- `/docs/database/P014-warehouse-bin.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P015_language-translation-settings-numbering-and-workflow-schema.md`
