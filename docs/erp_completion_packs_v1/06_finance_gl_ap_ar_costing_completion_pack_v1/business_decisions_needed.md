# Business Decisions Needed — Finance / GL / AP / AR / Costing Completion Pack v1

    The implementation can start with the conservative defaults below, but the final report must record any assumption used.

    ## Decisions

    - Valuation method: weighted average, FIFO, standard cost, batch actual, or hybrid?
- GL posting depth: full ledger now or subledger/accounting bridge with export?
- GST/tax scope: Indian GST only, export/SEZ rules, TDS/TCS, multi-country later?
- Are quote/SO price overrides allowed, and who approves them?

    ## Default Assumptions for Codex

    - Use accounting bridge/subledger with COA mapping first; full GL posting where repo already supports it.
- Use weighted average for inventory unless item explicitly has standard cost.
- Use effective-dated price lists, discount schemes, tax codes, and charge rules with locked document snapshots.
- Use maker/checker for manual journals, credit notes, debit notes, tax override, and period reopening.

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