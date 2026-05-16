# Reports / Dashboard Builder Completion Pack v1

    Build a governed reporting and dashboard foundation with reusable datasets, filters, drill-downs, exports, scheduled delivery, role security, and module KPI dashboards.

    ## Files in This Folder

    - `completion_pack.md` — full implementation specification.
    - `codex_prompt.md` — copy/paste prompt for a single Codex run.
    - `acceptance_gates_and_tests.md` — completion gates and rejection criteria.
    - `business_decisions_needed.md` — decisions and conservative defaults.
    - `codex_output_report_template.md` — required final report format.

    ## Recommended Use

    Run this pack by itself. Do not combine implementation with other packs unless Codex is only doing a planning/readiness pass.

    ## Main Completion Target

    Build a governed reporting and dashboard foundation with reusable datasets, filters, drill-downs, exports, scheduled delivery, role security, and module KPI dashboards.

    ## High-Risk Areas

    - No report button can show static/sample data; every report must read from real persisted records or display a clear no-data state.
- Every export must create a durable export job with file metadata, requested-by, generated-at, filters, permissions, and expiry/retention.
- Dashboards must not hide calculation logic; widget definitions must store dataset, measure, grouping, filters, and drill route.
- Report totals must reconcile to source transaction totals, especially tax, discount, price, stock qty/value, AP/AR, and costing.