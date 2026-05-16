# Business Decisions Needed — Quality / NCR / COA Completion Pack v1

    The implementation can start with the conservative defaults below, but the final report must record any assumption used.

    ## Decisions

    - How are sample sizes determined: fixed, percentage, AQL, skip-lot, or item/customer-specific?
- Who can approve MRB dispositions: quality manager, production manager, purchase head, or maker/checker?
- Can COA be generated from inspection results only, or can authorised users enter supplemental certificate values?
- Do NCR dispositions affect inventory valuation immediately or only after finance approval?

    ## Default Assumptions for Codex

    - Use item/customer/supplier effective-dated inspection plan priority: customer-specific > item-revision-specific > item-category default.
- Use status flow Draft → In Review → Approved/Released → Closed, with Cancelled/Reopened only by authorised role.
- Quarantine inventory must be non-allocatable and non-dispatchable until released.
- COA must be generated from approved inspection evidence, with manual overrides audited field-by-field.

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