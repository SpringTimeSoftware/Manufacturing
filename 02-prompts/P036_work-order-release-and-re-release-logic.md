# P036 — Work order release and re-release logic

## Phase
Phase 2 - SQL Logic

## Objective
Design work order readiness checks.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P030-production-execution.md`
- `/docs/database/P029-inventory.md`
- `/docs/database/P024-bom.md`

## Work to do
- Define sp_WO_Release and sp_WO_ReRelease.
- Check approved BOM/routing, material readiness, capacity readiness, and workflow status.
## Deliverables for this prompt
- `/docs/database/P036-wo-release.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P037_job-card-create-assign-start-pause-and-resume-logic.md`
