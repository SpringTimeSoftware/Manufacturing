# Business Decisions Needed — UDF / Customization Completion Pack v1

    The implementation can start with the conservative defaults below, but the final report must record any assumption used.

    ## Decisions

    - Which objects need UDF in V1: item, customer, supplier, quote/SO, PO, GRN, WO, QC, dispatch, service?
- Are UDFs tenant/company-specific or global?
- Can admin-created UDFs affect posting validation, or only capture extra info?
- Do UDFs need formulas referencing totals, quantities, tax, or dates?

    ## Default Assumptions for Codex

    - Use metadata-driven fields with typed storage and validation; avoid runtime DDL per user change unless repository already supports it safely.
- Allow UDF on header and line separately.
- Require admin permission and versioned publish for UDF changes.
- Expose UDFs to reports only when marked reportable and permissioned.

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