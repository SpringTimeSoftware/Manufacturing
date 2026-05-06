# P021 — Supplier, address, and lead-time schema

## Phase
Phase 1 - Database

## Objective
Model suppliers and procurement planning inputs.

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
- Design Suppliers, SupplierAddresses, and SupplierLeadTimes.
- Support item-specific, category-specific, and generic lead times plus outside-processing vendors.
## Deliverables for this prompt
- `/docs/database/P021-suppliers.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P022_work-center-machine-and-tooling-schema.md`
