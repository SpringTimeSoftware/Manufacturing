# P002 Output

## Objective Status

- Created the top-level mono-repo folder skeleton for server, web, mobile, database, contracts, tests, deployment, automation, and docs.
- Documented the repository layout, folder responsibilities, naming rules, and deployment separation.
- Kept the structure aligned to the blueprint's modular monolith guidance and IIS publish-folder deployment model.

## Files Read

- `/AGENTS.md`
- `/docs/codex-progress/README.md`
- `/docs/codex-progress/P000-output.md`
- `/docs/codex-progress/P001-output.md`
- `/03-manifests/prompt_index.csv`
- `/02-prompts/P002_repository-and-folder-structure.md`
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/scope-guardrails.md`

## Deliverables Completed

- Created `/docs/architecture/repository-layout.md`
- Created `/docs/codex-progress/P002-output.md`
- Updated `/docs/codex-progress/README.md`

## Reserved Repository Structure Created

- `/src/server/STS.Mfg.Host`
- `/src/server/STS.Mfg.Host/wwwroot`
- `/src/server/STS.Mfg.Api`
- `/src/server/STS.Mfg.Application`
- `/src/server/STS.Mfg.Domain`
- `/src/server/STS.Mfg.Infrastructure`
- `/src/web/src`
- `/src/web/public`
- `/src/mobile/src`
- `/src/mobile/assets`
- `/contracts/http`
- `/contracts/events`
- `/database/migrations`
- `/database/procedures`
- `/database/views`
- `/database/seeds`
- `/tests/server`
- `/tests/web`
- `/tests/mobile`
- `/deploy/iis`
- `/deploy/mobile`
- `/automation/ci`
- `/automation/dev`
- `/automation/scripts`
- `/docs/adr`
- `/docs/qa`
- `/docs/releases`
- `/docs/sql`
- `/docs/uat`

## Structure Decisions Captured

- The backend stays a modular monolith with separate host, API, application, domain, and infrastructure projects.
- Web and mobile remain independent source trees under `/src`, while source-neutral contracts are reserved under `/contracts`.
- Database assets stay centralized under `/database` for migrations, procedures, views, and seeds.
- Tests are reserved by platform under `/tests`.
- Deployment scripts are split by target, with IIS deployment isolated under `/deploy/iis`.
- The IIS model remains publish-folder only: compiled web output is copied into host `wwwroot`, and only published host output reaches live servers.

## Assumptions Captured

- A top-level `contracts` folder is the clearest way to reserve shared API and event contracts across C# and TypeScript clients without forcing language-specific source sharing.
- A top-level `tests` folder is acceptable alongside the blueprint's server test guidance because it keeps backend, web, and mobile test surfaces explicit from the start.
- Detailed module-level subfolder conventions inside application source and database artifact folders can be refined by later prompts without changing the top-level structure.

## Work Log

- Re-read the operating rules, prior outputs, scope guardrails, prompt index, and `P002`.
- Pulled the repository-structure and deployment guidance back out of the blueprint.
- Created the reserved folder skeleton for source, database, contracts, tests, deployment, automation, and documentation.
- Wrote the repository layout architecture note and updated the prompt progress ledger.

## Open Issues / Blockers

- None for `P002`.

## Build / Test / Lint

- Not run. The repository still has no `.sln`, `.csproj`, or `package.json`, so there is no executable build, test, or lint entry point yet.

## Review Points

- None for `P002`.

## Next Prompt

- `/02-prompts/P003_server-web-mobile-build-chain-and-publish-to-iis-model.md`
