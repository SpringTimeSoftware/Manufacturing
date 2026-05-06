# P075 — Print, export, and report framework

## Phase
Phase 4 - Web Foundation

## Objective
Create the basis for travelers, labels, and exports.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/scope-guardrails.md`

## Work to do
- Implement a print/export abstraction so modules can add PDF/CSV/Excel/label outputs without custom hacks on every screen.
## Deliverables for this prompt
- `/docs/codex-progress/P075-output.md`

## Definition of done
- The shared UI patterns are reusable, not one-off screen hacks.
- Build output remains compatible with IIS publish workflow.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P076_accessibility-and-performance-patterns.md`
