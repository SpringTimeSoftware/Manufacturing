# P002 — Repository and folder structure

## Phase
Phase 0 - Repository

## Objective
Create the top-level repository structure for server, web, mobile, database, docs, and automation.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/scope-guardrails.md`

## Work to do
- Define the mono-repo folder structure.
- Reserve folders for SQL migrations, stored procedures, static web assets, mobile app, shared contracts, test projects, and deployment scripts.
- Document naming conventions for modules and file paths.
## Deliverables for this prompt
- `/docs/architecture/repository-layout.md`

## Definition of done
- The layout supports modular monolith boundaries and clear deployment separation.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P003_server-web-mobile-build-chain-and-publish-to-iis-model.md`
