# P067 Output

## Objective Status

- Implemented additive integration, webhook, import, export, AI registry, AI prompt, AI run, and translation-draft APIs.
- Kept AI strictly draft-only in this prompt: no autonomous posting, release, or master-data mutation paths were introduced.
- Preserved the existing localization resource path by adding translation-support drafts alongside it rather than replacing `api/localization`.

## Deliverables Completed

- Added integration entities, EF configuration, service abstraction, infrastructure service, and API controllers for:
  - `api/integrations/providers`
  - `api/integrations/connections`
  - `api/webhooks`
  - `api/imports`
  - `api/exports`
- Added AI entities, EF configuration, service abstraction, infrastructure service, and API controllers for:
  - `api/ai/providers`
  - `api/ai/models`
  - `api/ai/prompt-templates`
  - `api/ai/provider-health`
  - `api/ai/runs`
  - `api/ai/runs/draft`
  - `api/ai/translations/draft`
- Added ordered SQL pack coverage for integration and AI tables under `/database/ddl/00-foundation/020_integration_ai_tables.sql`
- Updated `/database/README.md` so the runtime wave follows the remediation-era ordered pack layout

## Files Created or Changed

- `/src/server/STS.Mfg.Domain/Integration/IntegrationEntities.cs`
- `/src/server/STS.Mfg.Domain/AI/AiEntities.cs`
- `/src/server/STS.Mfg.Application/Contracts/Integration/IntegrationContracts.cs`
- `/src/server/STS.Mfg.Application/Contracts/AI/AiContracts.cs`
- `/src/server/STS.Mfg.Application/Abstractions/Integration/IIntegrationService.cs`
- `/src/server/STS.Mfg.Application/Abstractions/AI/IAiService.cs`
- `/src/server/STS.Mfg.Infrastructure/Integration/IntegrationService.cs`
- `/src/server/STS.Mfg.Infrastructure/AI/AiService.cs`
- `/src/server/STS.Mfg.Infrastructure/Persistence/Configurations/IntegrationEntityConfigurations.cs`
- `/src/server/STS.Mfg.Infrastructure/Persistence/Configurations/AiEntityConfigurations.cs`
- `/src/server/STS.Mfg.Api/Controllers/IntegrationControllers.cs`
- `/src/server/STS.Mfg.Api/Controllers/AiControllers.cs`
- `/src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `/src/server/STS.Mfg.Infrastructure/DependencyInjection.cs`
- `/database/README.md`
- `/database/ddl/00-foundation/001_create_extension_schemas.sql`
- `/database/ddl/00-foundation/020_integration_ai_tables.sql`

## Assumptions Captured

- Provider health is configuration health, not a live external ping.
- Import/export jobs are queued metadata contracts in this prompt; background execution and file parsing remain later work.
- AI draft output is deterministic scaffolding for human review until an approved provider-execution path is opened in a later prompt.
- Translation support remains dual-track:
  - runtime resource lookup continues through `api/localization/resources`
  - user-content translation drafts now flow through `api/ai/translations/draft`

## Open Issues / Blockers

- No blocker for `P067`.
- Secrets remain reference-based (`CredentialReference`, `SecretReference`) and are intentionally not stored in plain text in this prompt.

## Build / Test / Lint

- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln` passed in the batch validation.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build` passed with `7/7` tests.
- No lint target is configured in the repository yet.

## Next Prompt

- `/02-prompts/P068_react-web-bootstrap-with-iis-friendly-build.md`
