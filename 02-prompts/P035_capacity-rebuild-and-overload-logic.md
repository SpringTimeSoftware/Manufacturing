# P035 — Capacity rebuild and overload logic

## Phase
Phase 2 - SQL Logic

## Objective
Design RCCP/CRP calculation flow.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P022-resources.md`
- `/docs/database/P030-production-execution.md`

## Work to do
- Define sp_Capacity_Rebuild or equivalent pipeline.
- Calculate required load, available load, overload %, and alternative slots by work center/machine/shift/date bucket.
## Deliverables for this prompt
- `/docs/database/P035-capacity.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P036_work-order-release-and-re-release-logic.md`
