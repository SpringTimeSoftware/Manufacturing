# Dispatch / Logistics / POD Completion Pack v1

    ## Mission

    Complete dispatch execution from sales-order release through allocation, bin-level picking, packing, shipment, logistics documents, transporter handoff, proof of delivery, and dispatch closure.

    ## Pack Classification

    - Pack number: 05
    - Folder: `dispatch_logistics_pod_completion_pack_v1`
    - Wave: Wave 1
    - Completion level expected: P0 real implementation for touched scope, P1/P2 only if explicitly marked out of scope with reason.

    ## Modules in Scope

    - Dispatch planning
- Allocation and pick release
- Bin-level picking
- Packing/LP/PCID
- Shipping/transport
- Delivery challan/invoice handoff
- POD capture
- Claims/short delivery
- Freight tracking

    ## Business Decisions to Confirm

    Codex can start with conservative defaults, but these decisions must be captured in the final report.

    - Is bin selection mandatory in pilot for all warehouses or only barcode-enabled warehouses?
- Does dispatch create invoice first, shipment first, or both from a released sales order?
- Do you need Indian e-way/e-invoice integration now or only document placeholders and provider hooks?
- Can partial dispatch close a line or must it create backorder/open balance?

    ## Conservative Defaults if No Decision Is Provided

    - Use FEFO/FIFO allocation by item traceability rules unless order line specifies exact lot/serial.
- Require bin/location selection for all stock-controlled dispatch lines.
- Allow partial dispatch with backorder balance and reason code.
- Require POD document/photo/signature before marking delivered, unless transporter API confirms delivery.

    ## Core Data Entities / Tables to Inspect or Add

    The exact names should follow repository conventions. Do not blindly create duplicate tables if equivalent entities already exist.

    - dispatch_plan
- dispatch_plan_line
- pick_wave
- pick_task
- packing_header
- packing_line
- shipment_header
- shipment_line
- transporter_assignment
- pod_header
- pod_evidence
- delivery_exception
- freight_charge

    ## Transaction Workflows to Implement or Complete

    - SO allocation
- Pick release
- Bin picking
- Pack and label
- Shipment confirmation
- POD capture
- Delivery exception/shortage
- Return-to-stock from failed delivery

    ## Required Screens / UI Surfaces

    - Dispatch cockpit
- SO fulfillment queue
- Allocation and shortage screen
- Picker task grid
- Packing/LP screen
- Shipment and transporter screen
- POD upload/capture screen
- Dispatch document center

    ## Cross-Module Contracts

    - Sales: released SO lines, salesperson/remarks carried through dispatch documents.
- Inventory: bin/lot/serial reservation, pick, ship, stock decrement, return to stock.
- Quality: final QC and COA gate before shipment if applicable.
- Finance: invoice/tax/freight/round-off handoff; dispatch must not recalculate commercial terms inconsistently.
- Mobile: barcode pick/pack/POD photo/signature.
- Reports: OTIF, dispatch aging, POD pending, transporter performance.

    ## Non-Negotiable Fixes for This Pack

    - Bin/location selection must be real and persisted; no warehouse-only issue for bin-managed stock.
- Dispatch must preserve SO line commercial truth: price, discount, tax code, charges, salesperson, internal/external remarks.
- POD must store evidence metadata, attachment/category, captured-by, captured-at, and delivery result.
- Shipment confirmation must update stock and order fulfillment status atomically or roll back safely.

    ## Implementation Requirements

    ### Backend

    - Add or update migrations/schema/entities following current repo conventions.
    - Implement service-layer methods rather than hiding business rules in UI components.
    - Add validation for lifecycle status, role, numeric ranges, required fields, cross-entity references, and effective dates.
    - Add audit trail for state-changing actions.
    - Add idempotency where external/mobile/offline or retryable operations are involved.
    - Ensure failure paths return actionable error messages.

    ### Frontend

    - Use existing ERP layout, form, selector, modal, toast, and transaction-grid components.
    - Use governed selectors for governed fields.
    - Use numeric controls for numeric fields.
    - Keep save/reopen behavior reliable after refresh.
    - Show blocked actions with exact prerequisite, not vague text.
    - Preserve existing responsive/mobile behavior.

    ### Documents / Attachments / Reports

    - Use the shared attachment/document-output engine if available.
    - If not available and the feature is P0, implement the minimum real metadata/output path required for this pack.
    - Generated outputs must record template/version, requester, filters/entity, file metadata, and reissue/export log.

    ### Security and Audit

    - Enforce role-based access for create/edit/approve/post/cancel/reopen/export/send actions.
    - Store actor, timestamp, reason, prior state, next state, and related entity references for state transitions.
    - Do not leak restricted finance/customer/supplier/service data in reports, integrations, AI, or exports.

    ## Acceptance Tests Required

    - Create released SO with multiple lines and remarks; allocate stock from bins; verify bin reservations.
- Pick partial quantity with lot/serial; pack into PCID/LP; verify inventory and pack contents.
- Ship and generate delivery document; verify financial/tax values match source SO/invoice handoff.
- Capture POD with attachment/signature/photo metadata; verify delivered status and audit.
- Try to ship quality-held stock; verify blocked with reason.

    ## P0 Completion Gate

    This pack is not P0-complete until:

    - all P0 screens open without runtime errors;
    - every P0 action is real or explicitly outside P0;
    - all added fields persist and reopen;
    - all line grids calculate and save all lines;
    - linked transactions carry correct source references and revisions;
    - attachments/documents/reports are not fake;
    - tests/audits are run and reported;
    - a residual gap report is produced.