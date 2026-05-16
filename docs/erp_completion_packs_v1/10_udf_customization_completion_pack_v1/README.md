# UDF / Customization Completion Pack v1

    Build a safe user-defined-field and customization layer for masters, documents, line grids, reports, APIs, validations, formulas, defaults, permissions, and audit without schema chaos.

    ## Files in This Folder

    - `completion_pack.md` — full implementation specification.
    - `codex_prompt.md` — copy/paste prompt for a single Codex run.
    - `acceptance_gates_and_tests.md` — completion gates and rejection criteria.
    - `business_decisions_needed.md` — decisions and conservative defaults.
    - `codex_output_report_template.md` — required final report format.

    ## Recommended Use

    Run this pack by itself. Do not combine implementation with other packs unless Codex is only doing a planning/readiness pass.

    ## Main Completion Target

    Build a safe user-defined-field and customization layer for masters, documents, line grids, reports, APIs, validations, formulas, defaults, permissions, and audit without schema chaos.

    ## High-Risk Areas

    - UDFs must persist and reopen across create/edit/detail/print/export/report paths; no UI-only local state.
- Header and line UDFs must work in compact transaction grids without breaking keyboard entry or calculations.
- Required UDFs must be enforced at the correct lifecycle point: draft save vs release vs posting.
- UDF deprecation must preserve historical document values and not corrupt old reports.