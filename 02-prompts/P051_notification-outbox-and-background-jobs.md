# P051 — Notification outbox and background jobs

## Phase
Phase 3 - Backend

## Objective
Implement asynchronous delivery plumbing.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/ops/observability.md`
- `/docs/database/P031-quality-dispatch-ai.md`

## Work to do
- Create outbox tables/services, background worker, retry policy, and templates lookup.
- Support in-app notifications first; design provider abstraction for email/WhatsApp/SMS to come later.
## Deliverables for this prompt
- `/docs/codex-progress/P051-output.md`

## Definition of done
- Compile/build passes.
- Module boundaries remain clean.
- API shape matches the shared envelope and security model.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P052_localization-and-translation-service.md`
