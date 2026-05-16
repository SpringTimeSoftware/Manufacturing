# Codex Prompt — Service / Warranty / AMC Completion Pack v1

    ```text
    You are working in the ERP repository. Execute Service / Warranty / AMC Completion Pack v1 from this folder.

    First inspect the actual repo. Do not assume paths, table names, services, or components. Reuse existing conventions.

    Mission:
    Define and, if in scope, implement service management: installed base, warranty, AMC/contracts, service tickets, field visits, spare parts, RMA, SLA, customer sign-off, billing handoff, and service analytics.

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
    - Installed base/equipment
- Warranty registration
- AMC/service contracts
- Service ticketing
- Field visit scheduling
- Technician mobile
- Spare parts issue/return
- RMA/repair
- SLA/escalation
- Service billing handoff
- Customer sign-off

    Critical workflows:
    - Register installed asset
- Open service ticket
- Validate warranty/AMC coverage
- Assign technician
- Field visit update
- Issue/return spare parts
- Capture customer sign-off
- Create RMA/repair order
- Generate billing request
- Close service ticket

    Non-negotiable pack-specific fixes:
    - If implemented, service ticket must not be a simple complaint remark; it needs asset/customer/source, coverage, SLA, tasks, technician, parts, evidence, status, and closure reason.
- Warranty/AMC validation must be calculated from actual policy/contract snapshots, not free-text eligibility.
- Spare issue from service must use inventory controls: item/bin/lot/serial/LP, valuation, return/replacement reason.
- Customer sign-off must store evidence and cannot be a fake completed checkbox.

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