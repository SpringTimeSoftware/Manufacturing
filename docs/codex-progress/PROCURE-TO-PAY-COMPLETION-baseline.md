# PROCURE-TO-PAY-COMPLETION-01 Baseline

Date: 2026-05-14

Source pack:
- `docs/erp_completion_packs_v1/procure_to_pay_completion_pack_v1/PROCURE_TO_PAY_BENCHMARK_V1.xlsx`
- `docs/erp_completion_packs_v1/procure_to_pay_completion_pack_v1/PROCURE_TO_PAY_COMPLETION_SPEC.md`
- `docs/erp_completion_packs_v1/procure_to_pay_completion_pack_v1/PROCURE_TO_PAY_CODEX_PROMPT.txt`

## Scope Inventory

- Screens in scope: 10
- Transaction documents in scope: 9
- Existing implemented P0 flows found: Purchase Requisition, Purchase Order, GRN workspace, Supplier Invoice / 2-way or 3-way match, AP handoff bridge, Subcontract Plan / Receive Back
- Missing P0 flows found: RFQ, Supplier Quotation, Quote Comparison
- P1 flows requiring truthful block state: Vendor Return, Landed Cost, Buyer Queue

## Baseline Counts

- Line-depth violations: 3
- Governed-field violations: 10
- Numeric-field violations: 8
- Dead or ambiguous visible actions: 18
- Upload truth gaps: 2
- Workflow/posting gaps: 5

## Baseline Findings

- RFQ sourcing did not have additive API, DB, or web create/edit support.
- Supplier quotation capture did not support multiline RFQ line prices, discounts, tax, and lead time.
- Quote comparison could not persist a selection reason or convert the selected quote to a purchase order.
- Vendor return and landed cost should not be faked because they require approved return authorization, stock reversal, valuation, and cost posting contracts.
- Procurement buyer queue should not imply live consolidated operational read-model data until a persisted read model exists.
