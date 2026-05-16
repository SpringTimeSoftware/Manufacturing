# Quality / NCR / COA Completion Pack v1

    Close quality-management depth across incoming, in-process, final inspection, NCR/MRB/CAPA, quarantine, COA generation, and quality-to-inventory/production/dispatch handoffs.

    ## Files in This Folder

    - `completion_pack.md` — full implementation specification.
    - `codex_prompt.md` — copy/paste prompt for a single Codex run.
    - `acceptance_gates_and_tests.md` — completion gates and rejection criteria.
    - `business_decisions_needed.md` — decisions and conservative defaults.
    - `codex_output_report_template.md` — required final report format.

    ## Recommended Use

    Run this pack by itself. Do not combine implementation with other packs unless Codex is only doing a planning/readiness pass.

    ## Main Completion Target

    Close quality-management depth across incoming, in-process, final inspection, NCR/MRB/CAPA, quarantine, COA generation, and quality-to-inventory/production/dispatch handoffs.

    ## High-Risk Areas

    - No inspection pass/fail button may be fake: it must persist results, status, user, timestamp, and inventory/document consequences.
- NCR must not be a remark-only form; it must carry source reference, affected item/revision/lot/serial/qty, defect category, containment, root cause, disposition, and closure.
- COA must not be a static PDF mock; it must derive from approved inspection results and store generated document/version/log.
- Quality hold must block allocation, picking, shipment, and production consumption unless explicit authorised override exists.