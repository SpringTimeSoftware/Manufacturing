# Codex Prompt — Dispatch / Logistics / POD Completion Pack v1

    ```text
    You are working in the ERP repository. Execute Dispatch / Logistics / POD Completion Pack v1 from this folder.

    First inspect the actual repo. Do not assume paths, table names, services, or components. Reuse existing conventions.

    Mission:
    Complete dispatch execution from sales-order release through allocation, bin-level picking, packing, shipment, logistics documents, transporter handoff, proof of delivery, and dispatch closure.

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
    - Dispatch planning
- Allocation and pick release
- Bin-level picking
- Packing/LP/PCID
- Shipping/transport
- Delivery challan/invoice handoff
- POD capture
- Claims/short delivery
- Freight tracking

    Critical workflows:
    - SO allocation
- Pick release
- Bin picking
- Pack and label
- Shipment confirmation
- POD capture
- Delivery exception/shortage
- Return-to-stock from failed delivery

    Non-negotiable pack-specific fixes:
    - Bin/location selection must be real and persisted; no warehouse-only issue for bin-managed stock.
- Dispatch must preserve SO line commercial truth: price, discount, tax code, charges, salesperson, internal/external remarks.
- POD must store evidence metadata, attachment/category, captured-by, captured-at, and delivery result.
- Shipment confirmation must update stock and order fulfillment status atomically or roll back safely.

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