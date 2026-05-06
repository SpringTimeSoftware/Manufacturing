# R009 Platform Extensibility, Template, and Localization V2 Schema

## Objective

Define the shared platform model for metadata extensibility, document templates, localization, consent, and setup verification without replacing the existing infrastructure scaffolding.

## Canonical V2 Aggregates

| Aggregate | Purpose | Disposition |
| --- | --- | --- |
| `platform.MetadataDefinitions` | Canonical custom-field schema by entity and tenant scope | `ADDITIVE` |
| `platform.MetadataValues` | Typed metadata values for master and transaction records | `ADDITIVE` |
| `platform.FieldLayouts` | Admin-defined field layouts and editor groupings | `ADDITIVE` |
| `platform.DocumentTemplates` | Print, label, traveler, and form template ownership | `ADDITIVE` |
| `platform.TemplateAssignments` | Entity and workflow-level template routing | `ADDITIVE` |
| `platform.RenderJobs` | Controlled render-job queue and output audit | `ADDITIVE` |
| `platform.ContactPreferences` | Preferred language, channel, and do-not-contact settings | `ADDITIVE` |
| `platform.ConsentRecords` | Communication consent and audit evidence | `ADDITIVE` |
| `platform.SetupVerificationRuns` | Company, branch, warehouse, bin, language, and localization integrity checks | `ADDITIVE` |
| `platform.Translations` | Shared translation store and fallback behavior | `PATCH` |

## Existing Repo Surface Classification

| Surface | Current files | Class | Rationale |
| --- | --- | --- | --- |
| Localization shell | `LocalizationController.cs`, `TranslationContracts.cs`, `TranslationEntry.cs`, `TranslationService.cs` | `PATCH` | Preserve translation fallback while adding richer entity-owned text and verification layers. |
| Attachment and document-link scaffolding | `AttachmentRecord.cs`, `DocumentLink.cs`, `AttachmentService.cs`, `LocalAttachmentStorage.cs` | `PATCH` | Preserve binary storage and linking, add template and controlled-document semantics above it. |
| Notification scaffolding | Notification contracts, outbox services, template lookup, outbox message entity | `PATCH` | Preserve the outbox and add preference and consent gating. |
| Organization and system setup | `OrganizationControllers.cs`, `SystemController.cs`, organization contracts and services | `PATCH` | Preserve current setup surfaces and add verification actions instead of rewrites. |
| Authorization and scope | `AppPolicies.cs`, auth and scope infrastructure | `PATCH` | Extend permissions for metadata, templates, consent, and setup verification. |

## Compatibility Strategy

- Preserve current attachment, localization, and notification infrastructure as shared scaffolding and move business ownership into new metadata, template, and consent aggregates.
- Keep existing translation fallback and attachment download behavior stable while V2 text, template, and controlled-document semantics are layered in.
- Treat setup verification as additive admin behavior that audits current organization and localization surfaces without rewriting them.
- Keep consent and contact preference ownership in the platform layer and reference it from customer and supplier models introduced in `R005` and `R006`.

## Cutover Approach

1. Add metadata, template, consent, and setup-verification aggregates beside the existing platform shell.
2. Patch platform services to resolve richer semantics through adapters rather than replacing storage or delivery primitives.
3. Allow `R013` to introduce platform-aware DTO and controller patches only where the refactor plan explicitly permits them.
4. Keep rendering, messaging, and localization rollout incremental and non-destructive.

## Next Prompt

- `/04-remediation/prompts/R010_costing-and-landed-cost-foundation-architecture.md`
