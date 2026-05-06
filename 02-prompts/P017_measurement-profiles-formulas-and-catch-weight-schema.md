# P017 — Measurement profiles, formulas, and catch-weight schema

## Phase
Phase 1 - Database

## Objective
Model weight-based, size-based, and mixed measurement logic.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/STS_Manufacturing_ERP_Blueprint.md`
- `/docs/database/P016-uom.md`

## Work to do
- Design MeasurementProfiles and MeasurementFormulas.
- Support count-only, weight-only, dimensional, dual-UOM, and mixed commercial/production profiles.
- Define how a formula references item dimensions, density, thickness, or pack size.
## Deliverables for this prompt
- `/docs/database/P017-measurements.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P018_item-group-attribute-and-item-master-schema.md`
