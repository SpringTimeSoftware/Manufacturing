# P068 — React web bootstrap with IIS-friendly build

## Phase
Phase 4 - Web Foundation

## Objective
Create the React + TypeScript + Vite (or equivalent) web app with build output suitable for IIS-hosted publish flow.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/deployment-model.md`
- `/docs/design/design-language.md`

## Work to do
- Bootstrap the web app with TypeScript, routing, API client, and environment handling.
- Set build output to a static dist folder that the ASP.NET host can copy into wwwroot.
- Document local dev proxy to the API.
## Deliverables for this prompt
- `/docs/codex-progress/P068-output.md`

## Definition of done
- The shared UI patterns are reusable, not one-off screen hacks.
- Build output remains compatible with IIS publish workflow.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P069_web-shell-auth-flow-and-operating-context.md`
