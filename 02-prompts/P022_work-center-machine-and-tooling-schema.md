# P022 — Work center, machine, and tooling schema

## Phase
Phase 1 - Database

## Objective
Model production resources.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/demo/demo-master-data.md`
- `/docs/security/role-matrix.md`

## Work to do
- Design WorkCenters, Machines, MachineCalendars, and Tools.
- Support machine status, capacity, shift utilization, and maintenance-lite flags.
## Deliverables for this prompt
- `/docs/database/P022-resources.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P023_operation-and-routing-schema.md`
