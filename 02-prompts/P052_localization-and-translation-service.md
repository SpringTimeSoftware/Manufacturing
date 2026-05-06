# P052 — Localization and translation service

## Phase
Phase 3 - Backend

## Objective
Enable multilingual UI and messages.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P015-settings-workflow.md`
- `/docs/design/design-language.md`

## Work to do
- Implement translation lookup, company/branch/user language fallback, and API endpoints for keys.
- Make sure web and mobile can request translation resources.
## Deliverables for this prompt
- `/docs/codex-progress/P052-output.md`

## Definition of done
- Compile/build passes.
- Module boundaries remain clean.
- API shape matches the shared envelope and security model.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P053_health-checks-configuration-and-secrets.md`
