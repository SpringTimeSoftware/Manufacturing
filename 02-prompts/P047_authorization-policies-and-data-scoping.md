# P047 — Authorization policies and data scoping

## Phase
Phase 3 - Backend

## Objective
Enforce role rights and document/branch scopes.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/security/data-scope-model.md`
- `/docs/security/role-matrix.md`

## Work to do
- Implement policy-based authorization.
- Create data-scope helpers for company, branch, warehouse, and own/team visibility.
- Document how query filters and service checks work together.
## Deliverables for this prompt
- `/docs/codex-progress/P047-output.md`

## Definition of done
- Compile/build passes.
- Module boundaries remain clean.
- API shape matches the shared envelope and security model.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P048_ef-core-dapper-and-stored-procedure-access-pattern.md`
