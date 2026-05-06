# P146 — Security hardening and audit review

## Phase
Phase 7 - Integrations / QA / Deploy

## Objective
Review the system for production-safe behavior.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/security/audit-strategy.md`
- `/docs/security/role-matrix.md`

## Work to do
- Review auth, authorization leaks, attachment access, secret handling, provider configs, rate limiting, and audit completeness.
## Deliverables for this prompt
- `/docs/codex-progress/P146-output.md`

## Definition of done
- Artifacts are created and documented.
- Risk and follow-up items are explicit.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P147_iis-packaging-and-deployment-scripts.md`
