# P037 — Job card create, assign, start, pause, and resume logic

## Phase
Phase 2 - SQL Logic

## Objective
Design execution state machine part 1.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P030-production-execution.md`
- `/docs/database/P022-resources.md`

## Work to do
- Define sp_JobCard_CreateForWO, sp_JobCard_Assign, sp_JobCard_Start, sp_JobCard_Pause, and sp_JobCard_Resume.
- Enforce one active job card per machine where applicable and prevent illegal transitions.
## Deliverables for this prompt
- `/docs/database/P037-jobcard-state-1.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P038_job-card-quantity-downtime-and-complete-logic.md`
