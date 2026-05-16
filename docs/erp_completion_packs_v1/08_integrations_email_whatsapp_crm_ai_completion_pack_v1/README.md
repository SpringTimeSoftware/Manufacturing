# Integrations / Email / WhatsApp / CRM / AI Completion Pack v1

    Create real integration foundations for email, WhatsApp/SMS, CRM sync, webhooks, import/export jobs, provider health, delivery logs, and safe AI assistance without fake provider success.

    ## Files in This Folder

    - `completion_pack.md` — full implementation specification.
    - `codex_prompt.md` — copy/paste prompt for a single Codex run.
    - `acceptance_gates_and_tests.md` — completion gates and rejection criteria.
    - `business_decisions_needed.md` — decisions and conservative defaults.
    - `codex_output_report_template.md` — required final report format.

    ## Recommended Use

    Run this pack by itself. Do not combine implementation with other packs unless Codex is only doing a planning/readiness pass.

    ## Main Completion Target

    Create real integration foundations for email, WhatsApp/SMS, CRM sync, webhooks, import/export jobs, provider health, delivery logs, and safe AI assistance without fake provider success.

    ## High-Risk Areas

    - Provider actions must be either verified by provider response/callback or clearly marked queued/pending/failed; no green fake success.
- Every outbound message must store template version, recipient, entity reference, payload preview/hash, provider response, delivery status, and retries.
- CRM sync must include conflict handling and ownership mapping; do not silently overwrite customer/dealer data.
- AI features must be bounded by role, data-scope, audit, and human approval for external send or transaction mutation.