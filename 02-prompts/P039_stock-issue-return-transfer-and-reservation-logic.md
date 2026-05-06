# P039 — Stock issue, return, transfer, and reservation logic

## Phase
Phase 2 - SQL Logic

## Objective
Design inventory movement procedures.

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
- Define sp_Stock_IssueToWO, sp_Stock_ReturnFromWO, transfer procedures, and reservation recalculation rules.
- Handle lot/serial/bin/catch-weight and blocked/QC-hold stock restrictions.
## Deliverables for this prompt
- `/docs/database/P039-stock-movements.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P040_production-receipt-scrap-and-rework-logic.md`
