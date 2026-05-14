# Procure-to-Pay Completion Pack V1

## Purpose

This pack is the detailed execution contract for the Manufacturing ERP procure-to-pay domain. It is intentionally written as a completion pack, not a summary. Codex must use this pack to scan the current product, write/adjust tests, implement gaps, and prove the Purchase Requisition → RFQ → Supplier Quotation → Quote Comparison → Purchase Order → GRN → Purchase Invoice / 3-way Match → Vendor Return / Landed Cost / Payment Schedule flow.

## Benchmark Basis

The pack is based on procure-to-pay concepts represented in major ERP platforms:

- SAP S/4HANA: demand determination, purchase order creation, goods receipt, invoice verification, payment processing, and GR/IR reconciliation.
- Oracle Cloud Procurement: requisition lifecycle and purchase-order lifecycle linking requisition lines, PO schedules, shipments, receipts, and invoices.
- Microsoft Dynamics 365: procurement and sourcing, purchase orders, product receipts, vendor invoices, and AP invoice matching.
- Epicor Kinetic: manufacturing supply-chain sourcing-to-delivery workflow visibility.
- NetSuite: 3-way match of purchase order, item receipt, and vendor bill.

Source URLs are stored in `PROCURE_TO_PAY_BENCHMARK_V1.xlsx` sheet `01_Source_References`.

## Scope

### Included screens and workflows

1. Purchase Requisition
2. RFQ
3. Supplier Quotation
4. Supplier Quote Comparison
5. Purchase Order
6. Subcontract Purchase Order / Outside Processing, where supported
7. Goods Receipt Note / GRN
8. Purchase Invoice / 2-way and 3-way match
9. Vendor Return
10. Landed Cost / freight and add-on charges
11. Payment Schedule / AP handoff
12. Procurement Dashboard / Buyer Queue
13. Supplier performance and lead-time feedback, where represented
14. Attachments / documents / audit for procurement flows

### Excluded unless already represented

- Full accounting subledger and payment posting, except AP handoff fields/actions.
- Full bank payment execution.
- Payroll or HRMS.
- Treasury.
- EDI/e-invoicing unless already represented.

## Non-Negotiable Completion Rules

### 1. Multiline transaction rule

Any procurement document that contains lines must support real line-grid behavior or be disabled with a clear reason. It is not acceptable to edit only one line (`lines[0]` / `firstLine`) when the document is inherently multi-line.

Applies to:

- Purchase Requisition
- RFQ
- Supplier Quotation
- Purchase Order
- Subcontract Purchase Order
- GRN
- Purchase Invoice
- Vendor Return
- Landed Cost charges

Minimum line behavior:

- Add Line
- Remove Line where draft edit is allowed
- Edit all lines
- Validate all lines
- Save all lines
- Reopen and show all saved lines
- No first-line-only save

### 2. Governed field rule

No free-text entry for governed values where a source master exists:

- Supplier
- Supplier Site
- Supplier Contact
- Buyer
- Requester
- Department
- Branch / Plant
- Item
- UOM
- Warehouse
- Bin
- Currency
- Tax Category / Tax Code
- Payment Terms
- Trade / Freight Terms
- Reason Code
- Cost Center / Profit Center
- Work Order / Sales Order / PR / PO / RFQ references
- Lot / Serial where controlled

### 3. Numeric truth rule

No unrestricted text entry for numeric values:

- Quantity
- Received Quantity
- Accepted Quantity
- Rejected Quantity
- Hold Quantity
- Return Quantity
- Unit Price
- Discount %
- Discount Amount
- Tax Amount / Tax %
- Freight / Charges
- Exchange Rate
- MOQ
- Lead Time Days
- Tolerance %
- Landed Cost Amount
- Variance Amount

### 4. Action truth rule

Every visible procurement action must be:

- WORKING
- DISABLED WITH REASON
- HIDDEN

No dead buttons.

Actions include:

- New
- Add line
- Remove line
- Save Draft
- Submit Approval
- Approve / Reject
- Convert to RFQ
- Convert to PO
- Send RFQ
- Record supplier quote
- Compare quotes
- Select supplier
- Release PO / Send to supplier
- Create GRN
- Receive line
- Putaway
- Send to QC
- Post receipt
- Match invoice
- Hold / Release hold
- Approve invoice
- Vendor return
- Landed cost allocation
- Print / Export / Email
- Attach document
- View audit
- Open related record

### 5. 3-way match truth

Purchase invoice cannot be called complete unless it can truthfully compare:

- Purchase Order: ordered quantity/rate
- GRN: received/accepted quantity
- Vendor Invoice: invoice quantity/rate/tax/charges

If full 3-way match is not implemented, the invoice match action must be disabled with reason. It must not present a fake matched status.

### 6. GRN truth

GRN cannot be called complete unless it supports:

- PO reference
- multiple receipt lines
- partial receipt
- accepted quantity
- rejected quantity
- hold/quarantine quantity
- pending quantity
- warehouse/bin
- lot/serial capture where item requires it, or disabled with reason
- QC route truth
- post/save/reopen truth

### 7. Landed cost truth

If landed cost is visible, it must support real allocation or be disabled with reason. Allocation methods should include at least one of:

- quantity
- value
- weight
- manual

### 8. Document and upload truth

Attachments must be:

- real upload/list/download with authorization
- or disabled with reason
- or hidden

No active upload placeholder.

## Completion Definition

The Procure-to-Pay pack is complete only when:

1. P0 screens either work or are explicitly blocked with exact reason.
2. Purchase Requisition, RFQ, Supplier Quote, Purchase Order, GRN, and Invoice Match have multiline line-grid proof or are clearly blocked.
3. All governed fields use lookup/select controls.
4. Numeric fields use governed numeric/decimal/money controls.
5. Create/save/reopen tests exist for P0 flows.
6. Action truth is updated in matrices.
7. Screenshots exist.
8. Validation passes.
9. Review pack is generated.

## Required Output Files

Codex must create/update:

- `docs/codex-progress/PROCURE-TO-PAY-COMPLETION-output.md`
- `docs/codex-review-screens/PROCURE-TO-PAY-COMPLETION/`
- updated `07-ux-governance/action_truth_matrix.csv`
- updated `07-governance/entity_field_schema_matrix.csv`
- updated `07-governance/screen_field_violation_matrix.csv`
- updated `docs/final-audit/07_screen_issue_register.csv`
- if DB/API changes are made: update `database/README.md`
- review pack: `artifacts/review-packs/PROCURE-TO-PAY-COMPLETION-review-pack.zip`
