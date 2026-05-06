# P049 — Validation, error handling, and API response envelope

## Phase
Phase 3 - Backend

## Objective
Make the API predictable for web and mobile clients.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/engineering/api-envelope.md`

## Work to do
- Add validation pipeline, standardized error responses, correlation IDs, and paging/filter result shapes.
- Ensure business rule failures are distinguishable from validation and auth failures.
## Deliverables for this prompt
- `/docs/codex-progress/P049-output.md`

## Definition of done
- Compile/build passes.
- Module boundaries remain clean.
- API shape matches the shared envelope and security model.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P050_audit-logging-and-attachment-service.md`
