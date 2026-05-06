# P006 — Role matrix and data access model

## Phase
Phase 0 - Security

## Objective
Define who can see and do what by company, branch, warehouse, department, and document state.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/status-catalog.md`

## Work to do
- Map each role to screens, API actions, and mobile actions.
- Define data scopes: deployment, company, branch, warehouse, department, own-record, team-record.
- Define approval rights and override rights.
- Document row-level access strategy for SQL and API.
## Deliverables for this prompt
- `/docs/security/role-matrix.md`
- `/docs/security/data-scope-model.md`

## Definition of done
- Role matrix covers web, mobile, and API actions.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P007_demo-scenarios-and-seed-storylines.md`
