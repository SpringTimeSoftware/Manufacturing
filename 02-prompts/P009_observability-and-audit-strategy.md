# P009 — Observability and audit strategy

## Phase
Phase 0 - Observability

## Objective
Design logging, audit, metrics, and support diagnostics before implementation begins.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/engineering/coding-standards.md`

## Work to do
- Define structured logs for API, SQL proc execution, mobile sync, and integration calls.
- Define audit log rules for master-data changes and transactional actions.
- Define health checks and correlation IDs.
- Define support diagnostics pages and safe redaction.
## Deliverables for this prompt
- `/docs/ops/observability.md`
- `/docs/security/audit-strategy.md`

## Definition of done
- Every critical business action has a logging and audit path.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P010_offline-mobile-sync-strategy.md`
