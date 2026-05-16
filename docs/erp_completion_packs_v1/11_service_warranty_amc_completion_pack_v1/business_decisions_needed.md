# Business Decisions Needed — Service / Warranty / AMC Completion Pack v1

    The implementation can start with the conservative defaults below, but the final report must record any assumption used.

    ## Decisions

    - Is Service/AMC in immediate pilot scope or only later?
- Warranty source: sales invoice, dispatch, serial registration, manual registration, or all?
- Do field technicians consume spare inventory from van stock/bin stock?
- Should service generate AR invoice or only billing request?

    ## Default Assumptions for Codex

    - If later scope, create truthful navigation, data model skeleton, and disabled reasons without fake actions.
- Warranty derives from item/customer/serial/invoice/dispatch date rules and stores snapshot.
- AMC has contract period, coverage, preventive visits, exclusions, SLA, billing schedule.
- Spare part issues must reduce inventory and link to service ticket/equipment/technician.

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