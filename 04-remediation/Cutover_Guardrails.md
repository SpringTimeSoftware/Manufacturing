# Cutover Guardrails

## Hard Cut Line

- The original prompt chain is frozen at `P063`.
- `P064` cannot be executed before `R001-R013` are completed.
- No remediation run may silently relax the pre-`P064` cut line.
- The only sanctioned continuation path is `R001` through `R013`, then re-verification, then `/02-prompts/P064_production-receipt-scrap-and-rework-apis.md`.

## Domain Boundaries

| Domain | Disposition | Guardrail |
| --- | --- | --- |
| Organization and scope | `KEEP` | Preserve company, branch, department, warehouse, bin, and shift foundations. Verify and extend only where V2 setup validation requires it. |
| Measurement foundation | `PATCH` | Preserve UOM classes, units, conversions, measurement profiles, formulas, and catch-weight foundations. Extend for packaging, physical specs, and pricing awareness without replacing the baseline. |
| Item master | `REPLACE` | Replace the shallow V1 item model with the V2 canonical item, catalog, media, text, packaging, barcode, alias, and customer/vendor reference model through a compatibility-led migration path. |
| Partner master | `REPLACE` | Replace the shallow customer and supplier model with V2 account, site, address, contact, contact-point, consent, credit, terms, and compliance structures. |
| Commercial transactions | `REPLACE` | Replace the shallow quote, sales-order, blanket-order, and forecast assumptions with V2 pricing, discount, tax, currency, trade-term, customer-site, and credit-aware contracts. |
| Procurement core | `PATCH` | Preserve PR, PO, and subcontract document skeletons. Patch them with supplier depth, compliance placeholders, vendor references, landed-cost hooks, and return foundations only after the V2 base is in place. |
| Inventory and traceability | `PATCH` | Preserve stock balances, stock ledger, reservations, lots, serials, and cycle counts. Extend them later for packaging, valuation, advanced barcode, and return lifecycles. |
| Engineering backbone | `KEEP` | Preserve routing, BOM, ECO, and alternate-item structures and APIs. Retrofit them to richer V2 master references only where required. |
| Planning backbone | `KEEP` | Preserve MPS, MRP, BOQ, and capacity scaffolding. Patch planning inputs and replenishment policy via the remediation path instead of rebuilding execution logic. |
| Manufacturing execution | `KEEP` | Preserve work orders, job cards, downtime, machine board, and execution dashboards as the backbone that survives the rebaseline. |
| Platform services | `PATCH` | Preserve auth, data scope, audit, attachments, notifications, and localization scaffolding. Patch them for item-media semantics, consent, templates, metadata, and setup verification. |
| SQL asset chain | `REPLACE` | Replace the ad hoc SQL delivery posture with ordered migration packs, DDL packs, and stored-procedure inventory discipline before further backend expansion. |

## Preservation Rules

- The manufacturing execution backbone is preserved: BOM, BOQ/MRP, Work Orders, Job Cards, Machine Board, Stage Wise Dashboard, Order Delivery Dashboard.
- The platform stack is preserved: ASP.NET Core, SQL Server, React web, React Native mobile, IIS publish-folder deployment.
- HR, payroll, and full accounting remain out of V1.
- Preserve the existing UI direction and reference screens. Remediation may enrich data contracts and setup flows, but it must not reset the reference visual language.
- Prefer extension over replacement where the V2 plan says `KEEP` or `PATCH`.
- Replace only where V2 explicitly marks `REPLACE`.

## Pre-P064 Gate

- Master-data and commercial foundations are remediated before further production receipt / inventory-cost flow expansion.
- No new production receipt, scrap, rework, landed cost, return, or costing-finalization work may be treated as complete before the pre-`P064` remediation sequence is finished.
- Before `P064` opens, the repo must complete `R001-R013` and re-verify `P057`, `P059`, `P062`, and `P063` against the V2 master and commercial contracts.
