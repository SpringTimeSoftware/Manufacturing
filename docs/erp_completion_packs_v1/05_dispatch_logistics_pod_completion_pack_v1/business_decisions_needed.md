# Business Decisions Needed — Dispatch / Logistics / POD Completion Pack v1

    The implementation can start with the conservative defaults below, but the final report must record any assumption used.

    ## Decisions

    - Is bin selection mandatory in pilot for all warehouses or only barcode-enabled warehouses?
- Does dispatch create invoice first, shipment first, or both from a released sales order?
- Do you need Indian e-way/e-invoice integration now or only document placeholders and provider hooks?
- Can partial dispatch close a line or must it create backorder/open balance?

    ## Default Assumptions for Codex

    - Use FEFO/FIFO allocation by item traceability rules unless order line specifies exact lot/serial.
- Require bin/location selection for all stock-controlled dispatch lines.
- Allow partial dispatch with backorder balance and reason code.
- Require POD document/photo/signature before marking delivered, unless transporter API confirms delivery.

    ## Escalate Before Finalizing If

    - the choice changes accounting, valuation, tax, legal document output, warranty obligation, inventory ownership, or customer-facing commitment;
    - the repository has conflicting existing behavior;
    - a provider/device/secret is required to prove runtime behavior;
    - implementation would remove an existing workflow or break migration compatibility;
    - the pack discovers quote/SO missing salesperson/remarks/price/discount/tax in a touched flow;
    - bin/revision controls are absent in a touched stock or manufacturing flow.

    ## Safe Temporary Handling

    If a decision is not available:

    - implement a conservative, auditable default;
    - expose configuration where practical;
    - clearly document the assumption;
    - do not fake final posting/delivery/output;
    - keep risky external or financial action in pending/approval state instead of pretending completion.