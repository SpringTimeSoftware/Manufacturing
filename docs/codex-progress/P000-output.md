# P000 Output

## Objective Status

- Read the blueprint, inventories, reference UI notes, prompt index, and P000 instructions before making changes.
- Created the progress note location at `/docs/codex-progress/`.
- Captured the non-negotiable execution rules and platform constraints in project docs.

## Product Scope

- Build a manufacturing operating system for discrete and mixed-unit manufacturers focused on BOM discipline, BOQ/MRP, work orders, job cards, machine visibility, quality, dispatch, and management risk dashboards.
- Do not reposition the product as a generic ERP.

## Non-Negotiable Stack Constraints

- Backend: ASP.NET Core
- Database: SQL Server
- Web: React + TypeScript
- Mobile: React Native + TypeScript
- Deployment: IIS publish-folder only; no raw web source on live server
- V1 exclusions: HR, payroll, full accounting

## Deployment Model

- Customer deployments use a single IIS-ready publish folder containing compiled ASP.NET host output and compiled web assets.
- The live server receives published output only, not raw React source.
- Mobile is distributed separately as app build artifacts.

## Mobile vs Web Split

- Web owns setup, planning, dense grids, long-form detail pages, dashboards, reporting, AI configuration, and administration.
- Mobile owns action and execution flows such as job card actions, quantity entry, downtime logging, QC checkpoints, scans, proofs, approvals, and compact dashboards.

## Reference UI Rules

- Preserve the light manufacturing visual language from `/reference-ui`.
- Use a sky-blue and white palette with soft gradients, rounded cards, subtle borders, and clean shadows.
- Keep screens dense but breathable with KPI strips, compact filters, badges, and clean grids.
- Prefer right-side drawers, lane boards, occupancy calendars, and execution timelines where they improve operational visibility.

## Artifact Map Used

- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/03-manifests/prompt_index.csv`
- `/02-prompts/P000_start-here-operating-rules-artifact-map-and-codex-workflow.md`

## Execution Order

1. Read each prompt's required artifacts first.
2. Complete prompts sequentially from `/02-prompts`, using `/03-manifests/prompt_index.csv` as the execution map.
3. Do not skip prompts unless a prompt explicitly allows it.
4. After every prompt, update `/docs/codex-progress/`.

## Assumptions Captured

- The blueprint and inventory files are the authoritative scope source for product direction and constraints.
- The prompt index is the authoritative execution order unless a prompt states otherwise.
- P000 requires documentation setup only; no product code or build steps are needed at this stage.

## Open Issues / Blockers

- None for P000.

## Deliverables Created

- `/AGENTS.md`
- `/docs/codex-progress/README.md`
- `/docs/codex-progress/P000-output.md`

## Next Prompt

- `/02-prompts/P001_product-guardrails-and-scope-freeze.md`
