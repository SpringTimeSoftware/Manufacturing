# P000 — START HERE — operating rules, artifact map, and Codex workflow

## Phase
Phase 0 - Start

## Objective
Establish how Codex should use this pack, where to write progress notes, and the order of execution.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`

## Work to do
- Read the full blueprint before touching code.
- Create /docs/codex-progress/ and a running progress file.
- Confirm the execution order and that prompts must be completed sequentially unless a prompt explicitly allows parallel work.
- Record assumptions that are NOT allowed to drift later: ASP.NET backend, SQL Server, React web, React Native mobile, IIS publish-folder deployment, no HR/payroll/accounting in v1.
## Deliverables for this prompt
- `/docs/codex-progress/README.md`
- `/docs/codex-progress/P000-output.md`

## Definition of done
- Execution rules are written down.
- Progress location exists.
- Key non-negotiable constraints are captured verbatim in project docs.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P001_product-guardrails-and-scope-freeze.md`
