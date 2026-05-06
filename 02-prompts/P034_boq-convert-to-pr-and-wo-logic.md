# P034 — BOQ convert-to-PR-and-WO logic

## Phase
Phase 2 - SQL Logic

## Objective
Design conversion from requirement lines to action documents.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P033-mrp-run.md`
- `/docs/database/P028-procurement.md`
- `/docs/database/P030-production-execution.md`

## Work to do
- Define sp_BOQ_ConvertToPRandWO.
- Support override actions, partial conversion, read-only lock after conversion, and traceability to source lines.
## Deliverables for this prompt
- `/docs/database/P034-boq-convert.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P035_capacity-rebuild-and-overload-logic.md`
