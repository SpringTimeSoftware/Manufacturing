# P008 — Coding standards and error/result contracts

## Phase
Phase 0 - Coding Standards

## Objective
Define shared engineering conventions across server, web, mobile, and SQL.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/demo/demo-scenarios.md`

## Work to do
- Define naming conventions, module boundaries, folder rules, test naming, and DTO naming.
- Define API response envelope, validation error shape, and paging/filter contract.
- Define SQL naming standards for tables, views, stored procedures, and seed scripts.
- Define non-negotiable code review guardrails to prevent Codex drift.
## Deliverables for this prompt
- `/docs/engineering/coding-standards.md`
- `/docs/engineering/api-envelope.md`

## Definition of done
- The standards are specific enough to automate consistency.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P009_observability-and-audit-strategy.md`
