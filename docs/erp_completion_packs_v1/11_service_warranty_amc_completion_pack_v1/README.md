# Service / Warranty / AMC Completion Pack v1

    Define and, if in scope, implement service management: installed base, warranty, AMC/contracts, service tickets, field visits, spare parts, RMA, SLA, customer sign-off, billing handoff, and service analytics.

    ## Files in This Folder

    - `completion_pack.md` — full implementation specification.
    - `codex_prompt.md` — copy/paste prompt for a single Codex run.
    - `acceptance_gates_and_tests.md` — completion gates and rejection criteria.
    - `business_decisions_needed.md` — decisions and conservative defaults.
    - `codex_output_report_template.md` — required final report format.

    ## Recommended Use

    Run this pack by itself. Do not combine implementation with other packs unless Codex is only doing a planning/readiness pass.

    ## Main Completion Target

    Define and, if in scope, implement service management: installed base, warranty, AMC/contracts, service tickets, field visits, spare parts, RMA, SLA, customer sign-off, billing handoff, and service analytics.

    ## High-Risk Areas

    - If implemented, service ticket must not be a simple complaint remark; it needs asset/customer/source, coverage, SLA, tasks, technician, parts, evidence, status, and closure reason.
- Warranty/AMC validation must be calculated from actual policy/contract snapshots, not free-text eligibility.
- Spare issue from service must use inventory controls: item/bin/lot/serial/LP, valuation, return/replacement reason.
- Customer sign-off must store evidence and cannot be a fake completed checkbox.