# Business Decisions Needed — Reports / Dashboard Builder Completion Pack v1

    The implementation can start with the conservative defaults below, but the final report must record any assumption used.

    ## Decisions

    - Which reports are mandatory for pilot: sales, purchase, inventory, production, finance, quality, dispatch, service?
- Export formats: PDF, Excel, CSV, all?
- Can users build reports from governed datasets only, or can admins write SQL?
- Do scheduled reports need email/WhatsApp delivery now?

    ## Default Assumptions for Codex

    - Use governed datasets/read models only; no arbitrary SQL for normal users.
- Support CSV/XLSX for tables and PDF for printable reports where print engine exists.
- Role-based permissions at dataset/report/dashboard level.
- Every KPI must drill to the underlying records and preserve filters.

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