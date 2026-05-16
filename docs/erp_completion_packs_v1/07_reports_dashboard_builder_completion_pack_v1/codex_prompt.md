# Codex Prompt — Reports / Dashboard Builder Completion Pack v1

    ```text
    You are working in the ERP repository. Execute Reports / Dashboard Builder Completion Pack v1 from this folder.

    First inspect the actual repo. Do not assume paths, table names, services, or components. Reuse existing conventions.

    Mission:
    Build a governed reporting and dashboard foundation with reusable datasets, filters, drill-downs, exports, scheduled delivery, role security, and module KPI dashboards.

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
    - Report catalog
- Dataset/data dictionary
- Dashboard builder
- KPI cards
- Pivot/table reports
- Charts
- Exports
- Scheduled reports
- Drill-through navigation
- Report permissions

    Critical workflows:
    - Create/edit report
- Run report
- Export report
- Schedule report
- Create dashboard
- Save filters
- Drill down to source record
- Audit report access

    Non-negotiable pack-specific fixes:
    - No report button can show static/sample data; every report must read from real persisted records or display a clear no-data state.
- Every export must create a durable export job with file metadata, requested-by, generated-at, filters, permissions, and expiry/retention.
- Dashboards must not hide calculation logic; widget definitions must store dataset, measure, grouping, filters, and drill route.
- Report totals must reconcile to source transaction totals, especially tax, discount, price, stock qty/value, AP/AR, and costing.

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