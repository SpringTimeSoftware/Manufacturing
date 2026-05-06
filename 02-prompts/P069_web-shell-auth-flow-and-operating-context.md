# P069 — Web shell, auth flow, and operating context

## Phase
Phase 4 - Web Foundation

## Objective
Implement the application shell.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/security/role-matrix.md`
- `/docs/design/design-language.md`

## Work to do
- Create login, session restore, company/branch switch, page chrome, top bar, side navigation, and route guards.
- Make branch/company context visible on every transactional page.
## Deliverables for this prompt
- `/docs/codex-progress/P069-output.md`

## Definition of done
- The shared UI patterns are reusable, not one-off screen hacks.
- Build output remains compatible with IIS publish workflow.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P070_design-tokens-theme-and-reusable-surface-components.md`
