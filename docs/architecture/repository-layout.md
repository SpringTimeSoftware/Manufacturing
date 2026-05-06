# Repository Layout

## Objective

This repository uses a single mono-repo for server, web, mobile, database, contracts, tests, deployment, and automation assets while preserving a modular monolith backend and IIS publish-folder deployment.

## Top-Level Layout

```text
/
|-- 00-blueprint/
|-- 02-prompts/
|-- 03-manifests/
|-- automation/
|   |-- ci/
|   |-- dev/
|   `-- scripts/
|-- contracts/
|   |-- events/
|   `-- http/
|-- database/
|   |-- migrations/
|   |-- procedures/
|   |-- seeds/
|   `-- views/
|-- deploy/
|   |-- iis/
|   `-- mobile/
|-- docs/
|   |-- adr/
|   |-- architecture/
|   |-- codex-progress/
|   |-- qa/
|   |-- releases/
|   |-- sql/
|   `-- uat/
|-- reference-ui/
|-- src/
|   |-- mobile/
|   |   |-- assets/
|   |   `-- src/
|   |-- server/
|   |   |-- STS.Mfg.Api/
|   |   |-- STS.Mfg.Application/
|   |   |-- STS.Mfg.Domain/
|   |   |-- STS.Mfg.Host/
|   |   |   `-- wwwroot/
|   |   `-- STS.Mfg.Infrastructure/
|   `-- web/
|       |-- public/
|       `-- src/
`-- tests/
    |-- mobile/
    |-- server/
    `-- web/
```

## Folder Responsibilities

| Path | Responsibility |
| --- | --- |
| `/src/server/STS.Mfg.Host` | Single publishable ASP.NET Core host for API hosting, background jobs, file endpoints, SPA hosting, and deployment entry point. |
| `/src/server/STS.Mfg.Api` | HTTP endpoints, controllers, request/response wiring, and API composition if kept separate from host startup. |
| `/src/server/STS.Mfg.Application` | Use cases, command/query handlers, validation, DTO mapping, orchestration, and transaction boundaries. |
| `/src/server/STS.Mfg.Domain` | Entities, value objects, status enums, business rules, and domain invariants. |
| `/src/server/STS.Mfg.Infrastructure` | EF Core, Dapper, stored procedure access, file storage, provider adapters, and external integrations. |
| `/src/web` | React + TypeScript web source for setup, planning, dashboards, dense operational screens, and admin surfaces. |
| `/src/mobile` | React Native + TypeScript mobile source for execution, scanning, approvals, proof capture, and offline-aware workflows. |
| `/src/server/STS.Mfg.Host/wwwroot` | Host-side static asset destination. Compiled web output is copied here during publish; this is not the authoritative source for web UI code. |
| `/contracts/http` | OpenAPI snapshots, response-envelope examples, generated-client inputs, and shared HTTP contract artifacts across backend, web, and mobile. |
| `/contracts/events` | Webhook payload definitions, notification payload examples, and future machine/event integration contracts. |
| `/database/migrations` | DDL migrations and schema evolution scripts. |
| `/database/procedures` | Stored procedures for heavy transactional actions and dashboard/read-model logic. |
| `/database/views` | SQL views and read-model query surfaces used by dashboards and reports. |
| `/database/seeds` | Demo reset scripts, seed data, and setup helpers for tenant bootstrapping. |
| `/tests/server` | Automated backend tests, including unit and integration test projects. |
| `/tests/web` | Web UI test harnesses, component tests, and end-to-end coverage when introduced. |
| `/tests/mobile` | Mobile test harnesses and execution-flow coverage when introduced. |
| `/deploy/iis` | IIS packaging, publish, and deployment scripts. Only compiled output is deployed to live servers. |
| `/deploy/mobile` | Mobile release packaging notes and platform-specific delivery scripts. |
| `/automation/ci` | CI pipeline definitions and reusable automation entry points. |
| `/automation/dev` | Local developer bootstrap and convenience scripts. |
| `/automation/scripts` | Shared utility scripts for repeatable repository tasks. |
| `/docs/architecture` | Architecture notes, baselines, and structural decisions. |
| `/docs/adr` | Architecture decision records. |
| `/docs/sql` | SQL procedure notes, query documentation, and schema references. |
| `/docs/qa` | Screen QA notes and verification artifacts. |
| `/docs/uat` | UAT scripts and acceptance checklists. |
| `/docs/releases` | Release notes and deployment-ready summaries. |
| `/docs/codex-progress` | Prompt-by-prompt implementation log and handoff notes. |

## Layout Rules

- The repository remains a mono-repo. Server, web, mobile, database, and deployment assets stay together so prompt-by-prompt implementation remains coordinated.
- The backend remains a modular monolith. Domain separation happens through modules and project boundaries, not microservices.
- `/src/web` and `/src/mobile` contain source code only. They are never copied raw to production.
- `/src/server/STS.Mfg.Host/wwwroot` is reserved for built web assets during publish or local host testing.
- The live IIS server receives published output from the ASP.NET Core host only.
- Database logic remains first-class in the repository under `/database`, not scattered across application folders.

## Module Naming Conventions

- Root and infrastructure folders use lower-case names: `src`, `database`, `deploy`, `automation`, `docs`, `tests`, `contracts`.
- C# project folders use the `STS.Mfg.*` prefix.
- Functional module names align to the blueprint domains: `Platform`, `Organization`, `Measurements`, `Masters`, `Sales`, `Engineering`, `Planning`, `Procurement`, `Inventory`, `Production`, `Quality`, `Dispatch`, `Integrations`, and `AI`.
- Future server code should prefer namespaces and folders like `STS.Mfg.Application.Planning` or `STS.Mfg.Domain.Inventory` rather than generic `Common` dumping grounds.
- Web and mobile source folders use platform-standard lower-case paths inside `src/`.
- Contracts are grouped by transport surface first, then by business area inside that surface.

## File Path Conventions

- Prompt outputs go to `/docs/codex-progress/P###-output.md`.
- Architecture notes go to `/docs/architecture/*.md`.
- ADRs go to `/docs/adr/ADR-####-short-title.md`.
- SQL scripts stay under `/database/<artifact-type>/` and later prompts may add module subfolders beneath that root.
- Deployment scripts stay target-specific under `/deploy/iis` and `/deploy/mobile`.
- Reusable automation should live under `/automation`, not inside application source trees.

## Physical Reservation Status

The folders listed in this document have been created in the repository as reserved locations for upcoming prompts.
