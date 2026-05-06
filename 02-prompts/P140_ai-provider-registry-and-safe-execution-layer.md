# P140 — AI provider registry and safe execution layer

## Phase
Phase 7 - Integrations / QA / Deploy

## Objective
Implement the AI abstraction before user-facing features.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/scope-guardrails.md`
- `/docs/database/P031-quality-dispatch-ai.md`

## Work to do
- Create provider config, model config, prompt template loading, audit of every prompt run, and PII masking hooks.
- Block autonomous write-back to operational documents.
## Deliverables for this prompt
- `/docs/codex-progress/P140-output.md`

## Definition of done
- Artifacts are created and documented.
- Risk and follow-up items are explicit.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P141_ai-daily-summary-and-delay-risk-digest.md`
