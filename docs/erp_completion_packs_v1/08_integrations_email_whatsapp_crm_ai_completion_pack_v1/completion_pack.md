# Integrations / Email / WhatsApp / CRM / AI Completion Pack v1

    ## Mission

    Create real integration foundations for email, WhatsApp/SMS, CRM sync, webhooks, import/export jobs, provider health, delivery logs, and safe AI assistance without fake provider success.

    ## Pack Classification

    - Pack number: 08
    - Folder: `integrations_email_whatsapp_crm_ai_completion_pack_v1`
    - Wave: Wave 2
    - Completion level expected: P0 real implementation for touched scope, P1/P2 only if explicitly marked out of scope with reason.

    ## Modules in Scope

    - Provider configuration
- Email outbound
- WhatsApp/SMS outbound
- CRM object mapping
- Webhook inbound/outbound
- Integration job queue
- Delivery logs
- Template management
- Import/export jobs
- AI assistant/audit

    ## Business Decisions to Confirm

    Codex can start with conservative defaults, but these decisions must be captured in the final report.

    - Which providers will be used: SMTP/SendGrid/M365/Gmail, WhatsApp BSP, SMS gateway, CRM platform?
- Do you need two-way CRM sync or ERP-to-CRM only for V1?
- What data can AI read, summarize, or draft, and what must be excluded?
- Should user approval be required before AI-generated messages are sent?

    ## Conservative Defaults if No Decision Is Provided

    - Implement provider abstraction and sandbox/test mode; never mark live delivery successful without provider response/callback.
- Keep secrets in environment/config vault; never in source code or docs.
- Use approved templates for WhatsApp/SMS where required.
- AI may draft/summarize but cannot post business transactions or send external messages without user approval.

    ## Core Data Entities / Tables to Inspect or Add

    The exact names should follow repository conventions. Do not blindly create duplicate tables if equivalent entities already exist.

    - integration_provider
- integration_channel
- message_template
- outbound_message
- delivery_event
- webhook_subscription
- webhook_event
- crm_mapping
- sync_job
- sync_conflict
- ai_prompt_policy
- ai_audit_log
- import_export_job

    ## Transaction Workflows to Implement or Complete

    - Send email/WhatsApp/SMS
- Track delivery callback
- Sync customer/contact/lead/opportunity
- Inbound webhook processing
- Import/export execution
- AI draft/summarize with approval
- Provider health check

    ## Required Screens / UI Surfaces

    - Integration admin center
- Provider setup and health
- Template manager
- Message composer/preview
- Delivery log viewer
- CRM mapping screen
- Sync conflict queue
- Import/export queue
- AI policy/admin screen

    ## Cross-Module Contracts

    - Customer/supplier/sales: contacts and CRM ownership/salesperson mapping.
- Procurement: RFQ outbound email/portal invitation.
- Reports: scheduled report delivery.
- Dispatch/service: POD/service notifications.
- Documents: attachment links in outbound communication with permission-safe signed URLs.
- Finance: do not expose financial details through AI/integration unless role and policy allow it.

    ## Non-Negotiable Fixes for This Pack

    - Provider actions must be either verified by provider response/callback or clearly marked queued/pending/failed; no green fake success.
- Every outbound message must store template version, recipient, entity reference, payload preview/hash, provider response, delivery status, and retries.
- CRM sync must include conflict handling and ownership mapping; do not silently overwrite customer/dealer data.
- AI features must be bounded by role, data-scope, audit, and human approval for external send or transaction mutation.

    ## Implementation Requirements

    ### Backend

    - Add or update migrations/schema/entities following current repo conventions.
    - Implement service-layer methods rather than hiding business rules in UI components.
    - Add validation for lifecycle status, role, numeric ranges, required fields, cross-entity references, and effective dates.
    - Add audit trail for state-changing actions.
    - Add idempotency where external/mobile/offline or retryable operations are involved.
    - Ensure failure paths return actionable error messages.

    ### Frontend

    - Use existing ERP layout, form, selector, modal, toast, and transaction-grid components.
    - Use governed selectors for governed fields.
    - Use numeric controls for numeric fields.
    - Keep save/reopen behavior reliable after refresh.
    - Show blocked actions with exact prerequisite, not vague text.
    - Preserve existing responsive/mobile behavior.

    ### Documents / Attachments / Reports

    - Use the shared attachment/document-output engine if available.
    - If not available and the feature is P0, implement the minimum real metadata/output path required for this pack.
    - Generated outputs must record template/version, requester, filters/entity, file metadata, and reissue/export log.

    ### Security and Audit

    - Enforce role-based access for create/edit/approve/post/cancel/reopen/export/send actions.
    - Store actor, timestamp, reason, prior state, next state, and related entity references for state transitions.
    - Do not leak restricted finance/customer/supplier/service data in reports, integrations, AI, or exports.

    ## Acceptance Tests Required

    - Configure mock/sandbox provider; send test email; verify queued/sent/failed states and logs.
- Receive simulated delivery callback and verify status transition.
- Map CRM customer/contact fields and run sync with conflict; verify conflict queue.
- Generate AI draft for quote follow-up and require user approval before send.
- Run import/export job with invalid rows; verify validation, row repair, downloadable error file.

    ## P0 Completion Gate

    This pack is not P0-complete until:

    - all P0 screens open without runtime errors;
    - every P0 action is real or explicitly outside P0;
    - all added fields persist and reopen;
    - all line grids calculate and save all lines;
    - linked transactions carry correct source references and revisions;
    - attachments/documents/reports are not fake;
    - tests/audits are run and reported;
    - a residual gap report is produced.