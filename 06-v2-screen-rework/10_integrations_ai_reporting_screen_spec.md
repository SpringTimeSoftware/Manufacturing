# Integrations, AI, And Reporting Screen Specification

## Safety Principles

Integrations and AI must be admin-controlled, auditable, and draft-safe. AI must not auto-post operational changes, approve documents, create inventory transactions, or send external communications without explicit human approval and a recorded source.

## Screen Specifications

| Screen | Required Sections | Required Actions | Safety And Validation | API/DB Dependencies | Current Gaps | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| AI Assistant | Query composer, approved scope selector, source citations, draft action preview, confidence/safety warnings. | Ask, refine, save draft, route for approval, open source records. | Read-only by default. No autonomous write. Redact restricted data by role. | `/api/ai/assistant/*`, AI run registry, approved data contracts. | Backend concepts exist; first-class UI is missing. | Assistant always shows sources and never posts without approval. |
| Translation Assistant | Source text, target language, draft translation, reviewer, publish controls. | Generate draft, edit, approve, publish. | AI output is draft-only until reviewer approval. | `/api/ai/translations/draft`, localization tables. | Missing UI workflow. | Translation changes are reviewed and audited. |
| Integration Providers | Provider list, connection health, credentials status, enabled modules, scopes. | Add provider, test, disable, rotate credential placeholder. | Secrets are masked; no plain secret display. | `/api/integrations/providers`, connection tables. | Backend exists; admin UI missing. | Admin can see provider health without exposing secrets. |
| Webhooks | Webhook endpoints, subscribed events, signing key status, retry policy, delivery log. | Create, test, pause, replay, rotate signing key. | Signing required; replay is permissioned and audited. | `/api/webhooks`, integration event tables. | UI missing. | Webhook failures are visible and retryable. |
| Import/Export | File type, mapping, validation, preview, row-level errors, history. | Upload/import, validate, export, download error file. | Row-level validation and no silent partial import. | `/api/imports`, `/api/exports`, staging tables. | Basic endpoints exist; UI and row repair remain gaps. | Users can repair import errors without database access. |
| Reports | Report catalog, parameters, saved views, exports, schedule placeholder. | Run, filter, export PDF/Excel, save view. | Report access is role-scoped. | `/api/reports/*`, source domain tables. | Reports exist mostly as specific print outputs, not a catalog. | Reports are discoverable and parameterized. |
| Notification Provider Settings | Email/SMS/WhatsApp provider config, sender IDs, templates, health, retry policy. | Configure, test, enable/disable, view delivery. | Credentials masked; production sending requires approval. | Notification provider tables; external adapters deferred. | Missing production provider setup. | Notification delivery health is visible. |
| Email/SMS/WhatsApp Setup | Channel templates, language, placeholders, approval status. | Edit template, preview, approve, publish. | Placeholder validation and role approval. | Template/localization tables. | Template/localization foundation incomplete. | Messages use approved templates only. |
| Provider Health | Status dashboard for integrations, AI providers, notification channels, last success/failure. | Refresh, open incident, disable provider. | Health data must not leak secrets. | Provider health APIs/tables. | Backend has provider health concepts; UI missing. | Ops can identify provider failures quickly. |
| Audit/Report Viewer | Entity/document audit trail with filters, actor, action, before/after summary, export. | Search, filter, open source, export. | Sensitive fields masked by role. | Audit/event tables. | Required W115 screen missing. | Admin can trace changes without database access. |

## Production Readiness Gaps

- Real provider adapters and secrets governance need completion.
- AI prompts, data scopes, and output approval must be managed through UI, not code constants.
- Import/export needs row-level repair and validation UX.
- Audit viewer must exist before production pilot for master-data and transaction changes.
- Reports need a catalog, parameter model, and document-template governance.
