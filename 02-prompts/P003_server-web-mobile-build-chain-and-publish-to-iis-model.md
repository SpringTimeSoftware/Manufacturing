# P003 — Server/web/mobile build chain and publish-to-IIS model

## Phase
Phase 0 - Deployment

## Objective
Design the build chain so only compiled/published artifacts go to IIS.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/repository-layout.md`

## Work to do
- Define how the React web app builds to static assets.
- Define how the ASP.NET host copies the compiled web build into wwwroot during publish.
- Define IIS hosting model, SPA fallback, environment configs, and build outputs.
- Document how mobile APK/IPA builds stay separate from IIS deployment.
## Deliverables for this prompt
- `/docs/architecture/deployment-model.md`

## Definition of done
- Deployment model proves that no raw React source is required on the production server.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P004_design-language-extraction-from-reference-ui.md`
