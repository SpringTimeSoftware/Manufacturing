# INTEGRATIONS-EMAIL-WHATSAPP-CRM-AI-COMPLETION-PACK-08 Output

Status: COMPLETE for the stated Pack 08 foundation scope.

## Preflight

- Branch: `main`.
- Starting state: clean against `origin/main` at Pack 07 closeout.
- Dirty diff classification before coding: none.
- Scope control: Pack 08 only. Mobile, UDF, and Service packs were not started.

## Audit Findings Before Coding

- Provider configuration existed as basic provider/connection records, but provider channel, environment, vendor, credential reference, sender identity, callback URL, template namespace, CRM tenant, rate limit, health, and failure metadata were incomplete.
- Credential handling existed only on connection records. Provider-level credential truth and redacted provider DTO output were missing.
- Outbound messages used notification-style records and external channels could log fake success. A durable integration outbound message ledger with provider response/failure state was missing.
- Webhook subscriptions existed, but durable outbound/inbound webhook event records with payload hash and signature state were missing.
- CRM provider setup and external-ID mapping/sync conflict workflow were not found.
- AI draft runs existed, but review status/reviewer metadata and review API were missing.
- Integration UI had provider, health, webhooks, import/export, delivery logs, and AI assistant surfaces; CRM mapping was missing.

## Files Changed

- `database/ddl/20-commercial/140_integrations_email_whatsapp_crm_ai_completion.sql`
- `database/README.md`
- `src/server/STS.Mfg.Domain/Integration/IntegrationEntities.cs`
- `src/server/STS.Mfg.Domain/AI/AiEntities.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/IntegrationEntityConfigurations.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/AiEntityConfigurations.cs`
- `src/server/STS.Mfg.Application/Contracts/Integration/IntegrationContracts.cs`
- `src/server/STS.Mfg.Application/Abstractions/Integration/IIntegrationService.cs`
- `src/server/STS.Mfg.Infrastructure/Integration/IntegrationService.cs`
- `src/server/STS.Mfg.Infrastructure/Integration/OutboundMessageService.cs`
- `src/server/STS.Mfg.Infrastructure/Integration/OutboundNotificationChannels.cs`
- `src/server/STS.Mfg.Api/Controllers/IntegrationControllers.cs`
- `src/server/STS.Mfg.Application/Contracts/AI/AiContracts.cs`
- `src/server/STS.Mfg.Application/Abstractions/AI/IAiService.cs`
- `src/server/STS.Mfg.Infrastructure/AI/AiService.cs`
- `src/server/STS.Mfg.Api/Controllers/AiControllers.cs`
- `tests/server/STS.Mfg.Tests/IntegrationsEmailWhatsappCrmAiServiceTests.cs`
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/pages/WS07Pages.tsx`
- `src/web/src/pages/WS07MobileIntegrationsAiReporting.test.tsx`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/src/layout/NavigationCompleteness.test.tsx`
- `src/server/STS.Mfg.Host/wwwroot/index.html`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-nzCIBRZ6.js`
- `src/server/STS.Mfg.Host/wwwroot/assets/index-C91bw2oO.js` removed by host asset rebuild
- `07-ux-governance/action_truth_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `07-governance/entity_field_schema_matrix.csv`
- `docs/final-audit/07_screen_issue_register.csv`
- `docs/codex-progress/README.md`

## Migrations / Tables / Columns

Added additive SQL pack:

- `integration.Providers`: channel, vendor type, environment, credential reference, sender identity, WhatsApp business number, template namespace, CRM tenant reference, callback URL, rate limit, health, verification, and failure metadata.
- `integration.MessageTemplates`
- `integration.OutboundMessages`
- `integration.DeliveryEvents`
- `integration.WebhookEvents`
- `integration.CrmObjectMappings`
- `integration.CrmSyncJobs`
- `integration.CrmSyncConflicts`
- `ai.AiRuns`: review status, reviewer, review note, applied target metadata.

No raw provider secrets are stored. Existing rows are not backfilled with fake provider credentials, CRM mappings, templates, or AI review decisions.

## APIs / Services Added or Hardened

- Provider registry now saves channel/environment/vendor/credential-reference metadata and returns credential references redacted.
- Outbound message preview, queue, delivery list, retry, and provider health use durable `integration.OutboundMessages` and `integration.DeliveryEvents`.
- Missing provider, disabled provider, missing connection, missing credential reference, invalid recipient, inactive template, and unapproved WhatsApp template create failed durable records with explicit reason.
- Existing email/SMS/WhatsApp notification channels no longer log fake external success; they fail with configuration-required reasons.
- Webhook dispatch and inbound callback APIs persist `WebhookEvents` with payload hash, response status, signature state, and failure reason.
- CRM mapping and sync APIs require governed external IDs and record visible conflicts instead of silent overwrite.
- AI review API updates review status and keeps AI output draft/review gated.

## UI Screens Changed

- `/integrations/providers`: provider registry now includes channel, environment, vendor, sender, credential reference, rate limit, template namespace, CRM tenant, callback URL, and connection credential references.
- `/integrations/health`: provider health shows missing configuration/credential status without disabling the check flow.
- `/integrations/delivery-logs`: preview, queue, retry, source document, report output, attempt count, and failure reason are visible and API-backed.
- `/integrations/webhooks`: durable webhook events are visible alongside subscriptions.
- `/integrations/crm-mapping`: new CRM external-ID mapping, sync, and conflict queue surface.
- `/ai/assistant`: AI run register now exposes review status and live `Mark reviewed`; operational apply remains disabled with reason.

## Tests Added / Updated

- Added backend `IntegrationsEmailWhatsappCrmAiServiceTests`.
- Updated web `WS07MobileIntegrationsAiReporting.test.tsx`.
- Updated navigation completeness route inventory for `/integrations/crm-mapping`.

Covered:

- Provider config redacts credential reference.
- Missing credentials block send with durable failed message.
- WhatsApp send requires approved template.
- Report output can be attached to queued delivery.
- Inbound webhook rejects missing signature when a signing credential reference exists.
- CRM sync requires mapping and records conflicts.
- AI draft requires review before applied use.
- Delivery preview/queue/retry call live APIs.
- CRM mapping/save/sync call live APIs.
- AI draft review calls live API.

## Validation Results

- `npm.cmd run typecheck`: PASS.
- `npm.cmd test`: PASS, 69 test files, 259 tests.
- `npm.cmd run audit:erp-completion`: PASS, all ERP audit scripts passed.
- `npm.cmd run build`: PASS, Vite chunk-size warning only.
- `npm.cmd run build:host`: PASS.
- `dotnet build src/server/STS.Mfg.sln`: PASS, 0 warnings, 0 errors.
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 82 tests.
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS.

Targeted regression coverage passed:

- `IntegrationsEmailWhatsappCrmAiServiceTests`: PASS, 7 tests.
- `WS07MobileIntegrationsAiReporting.test.tsx`: PASS, 9 tests.
- Existing Pack 04/05/06/07 and Phase 01/02/03 regression suites were included in `npm.cmd test` and `dotnet test`.

## Evidence

- Screenshots: `docs/codex-review-screens/INTEGRATIONS-EMAIL-WHATSAPP-CRM-AI-COMPLETION-PACK-08/`
- Review pack: `artifacts/review-packs/INTEGRATIONS-EMAIL-WHATSAPP-CRM-AI-COMPLETION-PACK-08-review-pack.zip`

## Action Classification

Live:

- Save provider / connection metadata.
- Preview outbound message.
- Queue outbound message.
- Retry failed outbound message.
- Dispatch webhook event.
- Record inbound webhook event.
- Save CRM mapping.
- Run CRM sync.
- Mark AI draft reviewed.

Dry-run / queued only:

- Sandbox provider queueing records durable queued messages, but does not claim external delivery without a configured delivery worker/provider credential.

Disabled with reason:

- Credential rotation: requires approved secret store.
- Upload source file: requires approved scanner/staging workflow.
- Storage file open/download: requires completed output and signed URL.
- AI apply recommendation: AI outputs are draft-only and cannot write operational data.

## Credentials / Callback Inputs Still Needed

- Email: SMTP/API endpoint, secret-store credential reference, sender identity, delivery callback if provider supports one.
- WhatsApp: BSP provider credential reference, business number, template namespace, approved template codes, callback URL/signing reference.
- SMS: gateway credential reference, sender ID, template codes, delivery callback/signing reference.
- CRM: CRM tenant/org reference, credential reference, object mapping rules, external IDs for existing ERP customers/contacts/quotes/orders.
- Webhooks: endpoint URLs, signing secret references, callback URLs.
- AI: live provider/model credential references for model execution beyond draft registry policy.

## Explicit Classification

Closed in this phase:

- provider registry;
- credential reference / secret handling;
- outbound message ledger;
- report/document delivery linkage to generated output records;
- retry ledger state;
- webhook outbound event durability;
- inbound webhook signature-state recording;
- CRM external ID mapping;
- CRM sync conflict visibility;
- AI draft/review gating;
- provider health configuration truth;
- fake external notification success removal.

Partially closed / foundation only:

- email send: durable queue/failure truth exists; real external delivery waits on provider credentials/worker.
- WhatsApp send: approved-template and config gates exist; live BSP credentials/templates still required.
- SMS send: config and validation gates exist; live gateway credentials still required.
- scheduled/background delivery: durable records exist; processor/provider execution remains follow-on runtime work.
- live credential verification: health reports missing config/credentials; actual secret-store verification requires supplied secrets.

Still open for later packs:

- mobile integration readiness;
- provider-specific CRM adapter transforms;
- provider-specific delivery receipt callbacks;
- scheduled campaign/bulk delivery;
- native mobile offline sync provider flows.

## Safe To Proceed

Pack 08 regressions and accepted Pack 04/05/06/07 plus Phase 01/02/03 regressions passed. It is safe to proceed to Pack 09 Mobile after Pack 08 is accepted.
