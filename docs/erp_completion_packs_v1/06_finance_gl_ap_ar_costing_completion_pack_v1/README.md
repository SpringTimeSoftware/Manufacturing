# Finance / GL / AP / AR / Costing Completion Pack v1

    Close ERP financial truth: chart of accounts, tax, AP/AR, journal posting, inventory valuation, landed cost, COGS/WIP costing, payment schedules, commercial price/discount/tax propagation, and period controls.

    ## Files in This Folder

    - `completion_pack.md` — full implementation specification.
    - `codex_prompt.md` — copy/paste prompt for a single Codex run.
    - `acceptance_gates_and_tests.md` — completion gates and rejection criteria.
    - `business_decisions_needed.md` — decisions and conservative defaults.
    - `codex_output_report_template.md` — required final report format.

    ## Recommended Use

    Run this pack by itself. Do not combine implementation with other packs unless Codex is only doing a planning/readiness pass.

    ## Main Completion Target

    Close ERP financial truth: chart of accounts, tax, AP/AR, journal posting, inventory valuation, landed cost, COGS/WIP costing, payment schedules, commercial price/discount/tax propagation, and period controls.

    ## High-Risk Areas

    - Quote and sales order must have salesperson/sales owner and remarks fields; if already in customer master they must still snapshot onto document header/line where needed.
- Price and discount must be picked from effective-dated rules, snapshotted, override-audited, and recalculated only when user explicitly refreshes pricing.
- Tax must calculate from tax code, place/supply/customer/item/HSN/GST category where configured, charges inclusion, rounding, and document date.
- Revisions of quotes, SOs, POs, BOM/routing, and released documents must apply to linked transactions through explicit revision references, not silent latest-version use.
- Every posting must produce a traceable subledger/accounting entry or explicit in-scope blocked reason.