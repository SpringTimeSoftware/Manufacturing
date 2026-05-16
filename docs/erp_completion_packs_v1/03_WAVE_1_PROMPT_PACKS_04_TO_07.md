# Wave 1 Prompt — Packs 04 to 07

Use this prompt only for planning, sequencing, or a tightly managed sequential implementation run. Best practice remains one pack at a time.

```text
You are working in the ERP repository. Review and sequence Wave 1 completion packs:

04_quality_ncr_coa_completion_pack_v1
05_dispatch_logistics_pod_completion_pack_v1
06_finance_gl_ap_ar_costing_completion_pack_v1
07_reports_dashboard_builder_completion_pack_v1

Important: Do not blur these packs together. Execute sequentially and produce a separate report after each pack.

Before implementation:
- Read 01_SHARED_NON_NEGOTIABLES.md.
- Read 02_CROSS_PACK_RESIDUAL_GAP_CLOSURE_AUDIT.md.
- Read each pack's README, completion_pack, acceptance gates, business decisions, and report template.
- Inspect repo structure and identify shared dependencies.

Wave 1 goals:
1. Close quality/NCR/COA truth.
2. Close dispatch/logistics/POD truth with bin-level picking/packing/shipping.
3. Close finance/commercial/accounting/costing truth, including quote/SO salesperson, remarks, price, discount, tax, charges, and revision snapshots.
4. Close report/dashboard/export truth using real persisted datasets.

Non-negotiable cross checks after every pack:
- salesperson/owner and remarks on quote/SO where touched;
- price/discount/tax/charges calculated, snapshotted, and audited where touched;
- bin/location/lot/serial/PCID enforced where stock is touched;
- revisions explicitly referenced in downstream transactions;
- generated documents/exports are real durable outputs;
- no fake provider/mobile/offline success.

Execution mode:
- Prefer one pack per commit/report.
- If you cannot complete all four deeply, stop after the last fully completed pack and report the rest as not executed.
- Do not claim Wave 1 complete until all four individual pack P0 gates pass.

Final answer must include four separate pack reports, not one blended summary.
```