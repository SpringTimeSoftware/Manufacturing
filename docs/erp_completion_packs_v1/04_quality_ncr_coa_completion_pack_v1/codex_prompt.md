# Codex Prompt — Quality / NCR / COA Completion Pack v1

    ```text
    You are working in the ERP repository. Execute Quality / NCR / COA Completion Pack v1 from this folder.

    First inspect the actual repo. Do not assume paths, table names, services, or components. Reuse existing conventions.

    Mission:
    Close quality-management depth across incoming, in-process, final inspection, NCR/MRB/CAPA, quarantine, COA generation, and quality-to-inventory/production/dispatch handoffs.

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
    - Quality masters
- Inspection plans
- Incoming quality
- In-process inspection
- Final inspection
- NCR/MRB/CAPA
- Quarantine/hold release
- COA generation
- Supplier/customer quality evidence

    Critical workflows:
    - GRN inspection lot creation
- Production operation inspection
- Final QC before dispatch
- NCR from supplier/customer/internal source
- MRB disposition to release/rework/scrap/return/use-as-is
- COA generation and issue/reissue

    Non-negotiable pack-specific fixes:
    - No inspection pass/fail button may be fake: it must persist results, status, user, timestamp, and inventory/document consequences.
- NCR must not be a remark-only form; it must carry source reference, affected item/revision/lot/serial/qty, defect category, containment, root cause, disposition, and closure.
- COA must not be a static PDF mock; it must derive from approved inspection results and store generated document/version/log.
- Quality hold must block allocation, picking, shipment, and production consumption unless explicit authorised override exists.

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