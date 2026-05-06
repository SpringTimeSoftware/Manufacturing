# P045 — Domain, application, and infrastructure base wiring

## Phase
Phase 3 - Backend

## Objective
Implement the modular monolith base without business modules yet.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/architecture-baseline.md`
- `/docs/engineering/api-envelope.md`

## Work to do
- Add common abstractions for entities, value objects, repositories, unit of work if used, and request handlers.
- Create module folders for Platform, Masters, Sales, Engineering, Planning, Inventory, Production, Quality, Dispatch, Integrations, and AI.
## Deliverables for this prompt
- `/docs/codex-progress/P045-output.md`

## Definition of done
- Compile/build passes.
- Module boundaries remain clean.
- API shape matches the shared envelope and security model.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P046_authentication-jwt-and-context-switching.md`
