# P032 — Master data validation views and helper functions

## Phase
Phase 2 - SQL Logic

## Objective
Create supporting SQL views/functions for common validation and lookup patterns.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P018-items-core.md`
- `/docs/database/P024-bom.md`

## Work to do
- Design helper views/functions for active item, valid BOM revision, branch/warehouse defaults, and permission-friendly lookups.
- Document where read models should prefer views instead of raw table joins.
## Deliverables for this prompt
- `/docs/database/P032-helper-views.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P033_mrp-run-logic-and-exception-generation.md`
