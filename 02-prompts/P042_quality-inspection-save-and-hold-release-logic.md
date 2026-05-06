# P042 — Quality inspection save and hold/release logic

## Phase
Phase 2 - SQL Logic

## Objective
Design inspection transaction procedures.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P031-quality-dispatch-ai.md`
- `/docs/database/P038-jobcard-state-2.md`

## Work to do
- Define sp_QC_SaveInspection and related hold/release logic.
- Support incoming, in-process, and final inspection, with linkage to lot/serial and WO/JC.
## Deliverables for this prompt
- `/docs/database/P042-quality.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P043_order-risk-stage-wise-and-executive-dashboard-views.md`
