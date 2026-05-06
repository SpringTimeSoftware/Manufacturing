# P048 — EF Core, Dapper, and stored procedure access pattern

## Phase
Phase 3 - Backend

## Objective
Wire data access the way this product needs it.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/conventions.md`
- `/docs/database/P041-machine-board.md`

## Work to do
- Use EF Core for CRUD-heavy masters and transactional orchestration where appropriate.
- Use Dapper for dashboards, board views, and procedure-heavy reads/writes.
- Create a clear folder pattern for SQL calls and result mappers.
## Deliverables for this prompt
- `/docs/codex-progress/P048-output.md`

## Definition of done
- Compile/build passes.
- Module boundaries remain clean.
- API shape matches the shared envelope and security model.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P049_validation-error-handling-and-api-response-envelope.md`
