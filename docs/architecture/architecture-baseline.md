# Architecture Baseline

## Objective

This baseline gives a new engineer one place to understand the product direction established in Phase 0.

## Product Shape

- Manufacturing operating system for discrete and mixed-unit manufacturers
- Focused on planning, execution, quality, dispatch, and management visibility
- Explicitly not a generic ERP, HR suite, or accounting suite

Reference: `/docs/architecture/scope-guardrails.md`

## Repository Layout

- Mono-repo with separate roots for server, web, mobile, database, contracts, tests, deployment, and automation
- Backend organized as a modular monolith with host, API, application, domain, and infrastructure projects

Reference: `/docs/architecture/repository-layout.md`

## Deployment Model

- React web builds into static assets
- Built web assets are copied into `STS.Mfg.Host/wwwroot`
- ASP.NET Core host is the only IIS deployment unit
- Mobile builds stay separate from IIS packaging

Reference: `/docs/architecture/deployment-model.md`

## Design Language

- Light, modern, manufacturing-focused UI
- Sky-blue and white palette, soft gradients, rounded cards, compact filters, KPI strips, drawers, lane boards, occupancy calendars, and timelines

Reference: `/docs/design/design-language.md`

## Domain Vocabulary

- Shared document names, quantity terms, measurement terms, and status codes established for all layers

References:

- `/docs/architecture/domain-glossary.md`
- `/docs/architecture/status-catalog.md`

## Security and Access

- Role-based access across web, mobile, and API
- Scope hierarchy from deployment down to own-record
- Row-level access enforced in both application and SQL design

References:

- `/docs/security/role-matrix.md`
- `/docs/security/data-scope-model.md`

## Demo and Seed Storylines

- One on-time MTO assembly flow
- One mixed-UOM manufacturing flow
- One outside-processing flow
- One delayed order for risk dashboards

References:

- `/docs/demo/demo-scenarios.md`
- `/docs/demo/demo-master-data.md`

## Engineering Standards

- Naming, folder, DTO, SQL, and review guardrails established before implementation
- Shared API response envelope, validation, and paging contract defined

References:

- `/docs/engineering/coding-standards.md`
- `/docs/engineering/api-envelope.md`

## Observability and Audit

- Structured logs, correlation IDs, health checks, and support diagnostics planned up front
- Sensitive business transitions require immutable audit records

References:

- `/docs/ops/observability.md`
- `/docs/security/audit-strategy.md`

## Mobile Offline Rules

- Defined offline-capable actions, queue model, idempotency, retries, and conflict resolution rules

Reference: `/docs/mobile/offline-sync-strategy.md`

## Deferred Questions

- Exact package and tool versions for backend, web, mobile, and CI
- Final authentication provider and token lifetime policy
- Final attachment storage provider
- Final hosting environment topology beyond IIS site layout
- Migration tooling specifics and release orchestration details

These are intentionally deferred to later prompts and implementation steps.
