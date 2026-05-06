# P041 — Machine board and occupancy queries

## Phase
Phase 2 - SQL Logic

## Objective
Design the read-model queries behind the scheduling views.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/reference-ui/W084_Machine_Schedule_Board.html`
- `/reference-ui/W085_PPS_Machine_Occupancy_Calendar.html`

## Work to do
- Define sp_Machine_Board and sp_Machine_Calendar outputs.
- Support filters by date range, machine type, status, branch, work center, item, WO, and JC.
## Deliverables for this prompt
- `/docs/database/P041-machine-board.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P042_quality-inspection-save-and-hold-release-logic.md`
