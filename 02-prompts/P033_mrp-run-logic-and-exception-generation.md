# P033 — MRP run logic and exception generation

## Phase
Phase 2 - SQL Logic

## Objective
Design the heavy planning procedure.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P027-planning.md`
- `/docs/architecture/domain-glossary.md`

## Work to do
- Define sp_MRP_Run inputs, outputs, transaction boundaries, and result tables.
- Implement logic flow for demand collection, BOM explosion, stock netting, supplier lead time use, and exception creation.
## Deliverables for this prompt
- `/docs/database/P033-mrp-run.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P034_boq-convert-to-pr-and-wo-logic.md`
