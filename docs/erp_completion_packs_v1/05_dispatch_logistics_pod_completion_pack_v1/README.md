# Dispatch / Logistics / POD Completion Pack v1

    Complete dispatch execution from sales-order release through allocation, bin-level picking, packing, shipment, logistics documents, transporter handoff, proof of delivery, and dispatch closure.

    ## Files in This Folder

    - `completion_pack.md` — full implementation specification.
    - `codex_prompt.md` — copy/paste prompt for a single Codex run.
    - `acceptance_gates_and_tests.md` — completion gates and rejection criteria.
    - `business_decisions_needed.md` — decisions and conservative defaults.
    - `codex_output_report_template.md` — required final report format.

    ## Recommended Use

    Run this pack by itself. Do not combine implementation with other packs unless Codex is only doing a planning/readiness pass.

    ## Main Completion Target

    Complete dispatch execution from sales-order release through allocation, bin-level picking, packing, shipment, logistics documents, transporter handoff, proof of delivery, and dispatch closure.

    ## High-Risk Areas

    - Bin/location selection must be real and persisted; no warehouse-only issue for bin-managed stock.
- Dispatch must preserve SO line commercial truth: price, discount, tax code, charges, salesperson, internal/external remarks.
- POD must store evidence metadata, attachment/category, captured-by, captured-at, and delivery result.
- Shipment confirmation must update stock and order fulfillment status atomically or roll back safely.