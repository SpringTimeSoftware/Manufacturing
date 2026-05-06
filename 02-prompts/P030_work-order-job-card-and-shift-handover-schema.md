# P030 — Work order, job card, and shift handover schema

## Phase
Phase 1 - Database

## Objective
Model core execution documents.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P024-bom.md`
- `/docs/database/P023-operations-routings.md`
- `/docs/database/P029-inventory.md`

## Work to do
- Design WorkOrders, WorkOrderOperations, JobCards, JobCardEvents, and ShiftHandovers.
- Support split job cards, operator/machine assignment, timeline events, and active-job uniqueness.
## Deliverables for this prompt
- `/docs/database/P030-production-execution.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P031_quality-dispatch-notification-ai-and-audit-schema.md`
