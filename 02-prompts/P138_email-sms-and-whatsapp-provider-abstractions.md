# P138 — Email, SMS, and WhatsApp provider abstractions

## Phase
Phase 7 - Integrations / QA / Deploy

## Objective
Implement outbound messaging provider model without hard-wiring to a single vendor.

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
- Create provider interfaces for email, SMS, and WhatsApp.
- Support template rendering, retries, provider health, and delivery status persistence.
- Do not hard-code secrets or vendor-specific business rules into domain logic.
## Deliverables for this prompt
- `/docs/codex-progress/P138-output.md`

## Definition of done
- Artifacts are created and documented.
- Risk and follow-up items are explicit.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P139_webhooks-import-and-export-pipelines.md`
