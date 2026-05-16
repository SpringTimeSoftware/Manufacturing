# Codex Prompt — Integrations / Email / WhatsApp / CRM / AI Completion Pack v1

    ```text
    You are working in the ERP repository. Execute Integrations / Email / WhatsApp / CRM / AI Completion Pack v1 from this folder.

    First inspect the actual repo. Do not assume paths, table names, services, or components. Reuse existing conventions.

    Mission:
    Create real integration foundations for email, WhatsApp/SMS, CRM sync, webhooks, import/export jobs, provider health, delivery logs, and safe AI assistance without fake provider success.

    Read these files before changing code:
    - README.md
    - completion_pack.md
    - acceptance_gates_and_tests.md
    - business_decisions_needed.md
    - ../../01_SHARED_NON_NEGOTIABLES.md
    - ../../02_CROSS_PACK_RESIDUAL_GAP_CLOSURE_AUDIT.md

    Non-negotiable rules:
    - No fake buttons, dead links, dummy success toasts, static sample data, or local-only state.
    - Every P0 field must persist, reopen, validate, and audit where business-critical.
    - Every P0 action must be implemented end-to-end or be explicitly outside P0 with precise reason.
    - Preserve quote/SO salesperson, remarks, price/discount/tax, charges, and revision truth wherever this pack touches sales/commercial flow.
    - Preserve warehouse/bin/lot/serial/PCID truth wherever this pack touches inventory.
    - Preserve exact revision references in related transactions.
    - Add migrations/services/APIs/UI/tests/audit updates as required.
    - Do not hardcode secrets or provider credentials.
    - Do not silently change old released/posted transactions.

    Required scope:
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

    Critical workflows:
    - Send email/WhatsApp/SMS
- Track delivery callback
- Sync customer/contact/lead/opportunity
- Inbound webhook processing
- Import/export execution
- AI draft/summarize with approval
- Provider health check

    Non-negotiable pack-specific fixes:
    - Provider actions must be either verified by provider response/callback or clearly marked queued/pending/failed; no green fake success.
- Every outbound message must store template version, recipient, entity reference, payload preview/hash, provider response, delivery status, and retries.
- CRM sync must include conflict handling and ownership mapping; do not silently overwrite customer/dealer data.
- AI features must be bounded by role, data-scope, audit, and human approval for external send or transaction mutation.

    Implementation sequence:
    1. Inspect current repo surfaces for this module and list existing gaps.
    2. Implement schema/model/service/API changes.
    3. Implement UI and workflow changes.
    4. Add tests/audit gates.
    5. Run available tests/audits.
    6. Produce final report using codex_output_report_template.md.

    Final report must explicitly answer:
    - What was completed?
    - Which files changed?
    - Which migrations/schema changes were made?
    - Which APIs/routes/services/jobs were added or changed?
    - Which screens changed?
    - Which tests/audits were run, with result?
    - Are any actions still disabled? If yes, why exactly and what next?
    - Did this pack preserve or fix salesperson/remarks, bin selection, revisions, price/discount/tax where touched?
    ```