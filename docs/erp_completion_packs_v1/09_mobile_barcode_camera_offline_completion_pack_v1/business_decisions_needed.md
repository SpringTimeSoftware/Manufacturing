# Business Decisions Needed — Mobile / Barcode / Camera / Offline Completion Pack v1

    The implementation can start with the conservative defaults below, but the final report must record any assumption used.

    ## Decisions

    - Target devices: Android phones, tablets, Zebra/Honeywell scanners, iOS, browser-only?
- Offline tolerance: minutes, full shift, multi-day?
- Scanner mode: keyboard wedge, camera scanner, native scanner SDK, all?
- What transactions are allowed offline: inquiry only, draft capture, or posting?

    ## Default Assumptions for Codex

    - Support browser/PWA plus keyboard-wedge scanner first; device-specific SDK hooks can be adapter-based.
- Offline can capture drafts/queues; final posting requires sync validation unless explicitly safe.
- Use idempotency keys for all mobile-posted transactions.
- Every scan must validate item/bin/lot/serial/context before accepting or queueing.

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