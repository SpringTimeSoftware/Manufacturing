# P147 — IIS packaging and deployment scripts

## Phase
Phase 7 - Integrations / QA / Deploy

## Objective
Automate build and publish for the target hosting model.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/deployment-model.md`

## Work to do
- Create build scripts/pipeline docs that compile the API, build the React web app, copy dist to wwwroot, and publish a single IIS-ready folder.
- Document environment variables, IIS rewrite/static file requirements, and health check endpoints.
## Deliverables for this prompt
- `/docs/codex-progress/P147-output.md`

## Definition of done
- Artifacts are created and documented.
- Risk and follow-up items are explicit.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P148_uat-scripts-demo-data-refresh-and-acceptance-matrix.md`
