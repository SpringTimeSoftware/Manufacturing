# Business Decisions Needed — Integrations / Email / WhatsApp / CRM / AI Completion Pack v1

    The implementation can start with the conservative defaults below, but the final report must record any assumption used.

    ## Decisions

    - Which providers will be used: SMTP/SendGrid/M365/Gmail, WhatsApp BSP, SMS gateway, CRM platform?
- Do you need two-way CRM sync or ERP-to-CRM only for V1?
- What data can AI read, summarize, or draft, and what must be excluded?
- Should user approval be required before AI-generated messages are sent?

    ## Default Assumptions for Codex

    - Implement provider abstraction and sandbox/test mode; never mark live delivery successful without provider response/callback.
- Keep secrets in environment/config vault; never in source code or docs.
- Use approved templates for WhatsApp/SMS where required.
- AI may draft/summarize but cannot post business transactions or send external messages without user approval.

    ## Escalate Before Finalizing If

    - the choice changes accounting, valuation, tax, legal document output, warranty obligation, inventory ownership, or customer-facing commitment;
    - the repository has conflicting existing behavior;
    - a provider/device/secret is required to prove runtime behavior;
    - implementation would remove an existing workflow or break migration compatibility;
    - the pack discovers quote/SO missing salesperson/remarks/price/discount/tax in a touched flow;
    - bin/revision controls are absent in a touched stock or manufacturing flow.

    ## Safe Temporary Handling

    If a decision is not available:

    - implement a conservative, auditable default;
    - expose configuration where practical;
    - clearly document the assumption;
    - do not fake final posting/delivery/output;
    - keep risky external or financial action in pending/approval state instead of pretending completion.