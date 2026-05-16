# Codex Prompt — Finance / GL / AP / AR / Costing Completion Pack v1

    ```text
    You are working in the ERP repository. Execute Finance / GL / AP / AR / Costing Completion Pack v1 from this folder.

    First inspect the actual repo. Do not assume paths, table names, services, or components. Reuse existing conventions.

    Mission:
    Close ERP financial truth: chart of accounts, tax, AP/AR, journal posting, inventory valuation, landed cost, COGS/WIP costing, payment schedules, commercial price/discount/tax propagation, and period controls.

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
    - Chart of accounts
- Tax engine
- AP invoice and matching
- AR invoice and receipts
- GL journals
- Cost centers
- Inventory valuation
- Landed cost
- WIP/COGS costing
- Credit/debit notes
- Period close

    Critical workflows:
    - Quote/SO commercial calculation
- PO/GRN/supplier invoice matching
- AP liability and payment schedule
- AR invoice and receipt allocation
- Inventory receipt/issue valuation
- Landed cost allocation
- Production WIP issue/receipt costing
- Journal posting and reversal
- Credit/debit note

    Non-negotiable pack-specific fixes:
    - Quote and sales order must have salesperson/sales owner and remarks fields; if already in customer master they must still snapshot onto document header/line where needed.
- Price and discount must be picked from effective-dated rules, snapshotted, override-audited, and recalculated only when user explicitly refreshes pricing.
- Tax must calculate from tax code, place/supply/customer/item/HSN/GST category where configured, charges inclusion, rounding, and document date.
- Revisions of quotes, SOs, POs, BOM/routing, and released documents must apply to linked transactions through explicit revision references, not silent latest-version use.
- Every posting must produce a traceable subledger/accounting entry or explicit in-scope blocked reason.

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