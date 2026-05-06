# P023 — Operation and routing schema

## Phase
Phase 1 - Database

## Objective
Model reusable execution logic.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P022-resources.md`

## Work to do
- Design Operations, Routings, and RoutingOperations.
- Support setup/run/teardown time, overlap flag, outside-processing flag, and default QC checkpoints.
## Deliverables for this prompt
- `/docs/database/P023-operations-routings.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P024_bom-and-revision-schema.md`
