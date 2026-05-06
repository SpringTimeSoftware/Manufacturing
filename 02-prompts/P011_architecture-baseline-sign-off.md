# P011 — Architecture baseline sign-off

## Phase
Phase 0 - Baseline

## Objective
Create a single architecture baseline document that points to all phase-zero decisions.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/mobile/offline-sync-strategy.md`

## Work to do
- Summarize scope, repo layout, deployment, design language, security, demo scenarios, standards, observability, and offline rules.
- Capture open questions that are intentionally deferred.
## Deliverables for this prompt
- `/docs/architecture/architecture-baseline.md`

## Definition of done
- A new engineer can start from one baseline document and understand the whole product direction.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P012_database-naming-migration-and-partitioning-conventions.md`
