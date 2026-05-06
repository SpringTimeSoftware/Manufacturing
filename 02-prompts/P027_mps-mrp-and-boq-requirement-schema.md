# P027 — MPS, MRP, and BOQ requirement schema

## Phase
Phase 1 - Database

## Objective
Model planning run structures.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P026-sales-demand.md`
- `/docs/database/P024-bom.md`

## Work to do
- Design MasterProductionSchedules, MpsLines, MrpRuns, MrpRunItems, BoqRequirements, and BoqRequirementLines.
- Support action recommendation BUY/MAKE/TRANSFER/SUBCONTRACT/NONE and override tracking.
## Deliverables for this prompt
- `/docs/database/P027-planning.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P028_purchase-requisition-purchase-order-and-subcontract-schema.md`
