# Codex Prompt — UDF / Customization Completion Pack v1

    ```text
    You are working in the ERP repository. Execute UDF / Customization Completion Pack v1 from this folder.

    First inspect the actual repo. Do not assume paths, table names, services, or components. Reuse existing conventions.

    Mission:
    Build a safe user-defined-field and customization layer for masters, documents, line grids, reports, APIs, validations, formulas, defaults, permissions, and audit without schema chaos.

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
    - UDF metadata
- Form customization
- Line-grid custom columns
- Validation rules
- Formula/default engine
- Dropdown/reference UDFs
- UDF security
- UDF reporting
- UDF API
- Customization audit/versioning

    Critical workflows:
    - Create/publish UDF
- Attach UDF to entity/screen
- Enter UDF on master/document/header/line
- Validate required/range/pattern/list
- Use UDF in report/export
- Deprecate UDF
- Migrate/rename UDF safely

    Non-negotiable pack-specific fixes:
    - UDFs must persist and reopen across create/edit/detail/print/export/report paths; no UI-only local state.
- Header and line UDFs must work in compact transaction grids without breaking keyboard entry or calculations.
- Required UDFs must be enforced at the correct lifecycle point: draft save vs release vs posting.
- UDF deprecation must preserve historical document values and not corrupt old reports.

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