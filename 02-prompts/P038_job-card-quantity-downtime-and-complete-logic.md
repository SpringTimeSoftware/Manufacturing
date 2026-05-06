# P038 — Job card quantity, downtime, and complete logic

## Phase
Phase 2 - SQL Logic

## Objective
Design execution state machine part 2.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P037-jobcard-state-1.md`
- `/docs/database/P031-quality-dispatch-ai.md`

## Work to do
- Define sp_JobCard_LogQty, sp_JobCard_LogDowntime, and sp_JobCard_Complete.
- Support good/reject/scrap, QC checkpoint gating, downstream operation readiness, and timeline logging.
## Deliverables for this prompt
- `/docs/database/P038-jobcard-state-2.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P039_stock-issue-return-transfer-and-reservation-logic.md`
