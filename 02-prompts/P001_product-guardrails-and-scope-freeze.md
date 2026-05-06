# P001 — Product guardrails and scope freeze

## Phase
Phase 0 - Scope

## Objective
Freeze the product shape so the repository does not turn into a generic ERP.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/02-prompts/P000_START_HERE.md`

## Work to do
- Create a scope statement for a discrete/mixed-unit manufacturing product focused on planning, execution, quality, and dispatch.
- Mark explicit out-of-scope modules for v1.
- Define supported manufacturing modes: MTS, MTO, ETO, mixed mode.
- Define target industries and the first demo tenant.
## Deliverables for this prompt
- `/docs/codex-progress/P001-output.md`
- `/docs/architecture/scope-guardrails.md`

## Definition of done
- The scope document clearly prevents uncontrolled module sprawl.
- Out-of-scope items are explicit, not implied.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P002_repository-and-folder-structure.md`
