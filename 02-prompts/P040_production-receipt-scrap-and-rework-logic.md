# P040 — Production receipt, scrap, and rework logic

## Phase
Phase 2 - SQL Logic

## Objective
Design output posting procedures.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P029-inventory.md`
- `/docs/database/P030-production-execution.md`

## Work to do
- Define sp_ProdReceipt_Create plus supporting scrap/rework posting rules.
- Ensure stock ledger, job card progress, WO completion %, and traceability all update consistently.
## Deliverables for this prompt
- `/docs/database/P040-prod-receipt.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P041_machine-board-and-occupancy-queries.md`
