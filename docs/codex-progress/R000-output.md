# R000 Output

## Objective Status

- Stopped the original prompt chain at `P063` as requested.
- Performed an ERP V2 rebaseline and delta-impact analysis instead of continuing implementation.
- Created the remediation matrix, superseded prompt map, and remediation prompt index under `/04-remediation`.
- Did not write or modify production runtime code.

## Files Read

- `/AGENTS.md`
- `/docs/codex-progress/README.md`
- `/docs/codex-progress/P000-output.md` through `/docs/codex-progress/P063-output.md`
- `/03-manifests/prompt_index.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/00-blueprint/screen_inventory.csv`
- `/04-remediation/STS_Manufacturing_Gap_Scan_Report.md`
- `/04-remediation/STS_Manufacturing_Gap_Scan_Report.csv`
- `/04-remediation/ERP_V2_NonNegotiables.md`
- Current backend implementation under `/src/server`

## Deliverables Completed

- Created `/04-remediation/Architecture_V2_Delta_Matrix.md`
- Created `/04-remediation/Superseded_Prompt_Map.md`
- Created `/04-remediation/R_Prompt_Index.csv`
- Created `/docs/codex-progress/R000-output.md`

## Rebaseline Summary

- The repo is a strong manufacturing execution bootstrap, but it is not yet a safe ERP architecture baseline.
- The strongest salvageable areas are organization scoping, measurements, engineering, planning scaffolding, work orders, job cards, inventory ledger behavior, and platform host wiring.
- The highest-risk under-modeling sits in item master depth, product catalog separation, partner master depth, pricing and discount architecture, customer commercial controls, replenishment policy, extensibility, and schema-first SQL delivery discipline.
- The safest cut line is to insert `R001` through `R013` before `P064`, then resume the original backend chain only after the V2 master and commercial contracts are stabilized.

## Top 15 Blockers

1. No ordered SQL migration pack, DDL pack, or stored-procedure pack exists in `/database`; the folder currently contains only a readme.
2. Item media, drawings, manuals, certificates, and controlled product-document semantics are missing; only generic attachments exist.
3. The repo has no separate product-catalog domain, so commercial and operational item responsibilities are collapsed.
4. Item texts and multilingual descriptions are not modeled as first-class item or catalog data.
5. Packaging hierarchy and UOM-aware pack configuration are missing.
6. Physical item data such as dimensions, weight, volume, and pack details are not stored in the item model.
7. The barcode model is too basic for ERP-grade scan, label, and packaging requirements.
8. Customer item references, vendor item references, item aliases, and item-template semantics are missing or too shallow.
9. Customer master still collapses legal entity, bill-to, ship-to, and site/location responsibilities into one shallow model.
10. Role-based contacts, contact points, WhatsApp, channel preference, and consent are absent.
11. Customer commercial controls are incomplete: no credit profile, temporary override, or order-hold model.
12. Pricing, discount, tax, currency, and trade-term engines are missing from quote and sales-order foundations.
13. Supplier depth is incomplete: compliance, scorecards, preferred-item mappings, and deeper terms are missing.
14. Replenishment policy, UDF extensibility, document-template management, and costing hooks are not modeled.
15. Continuing with `P064` now would multiply rework because the current master and commercial APIs encode the shallow V1 model directly.

## Top 15 Salvageable Assets

1. Company, branch, warehouse, bin, and shift entities and APIs provide a usable multi-company operating backbone.
2. UOM classes, units, conversions, measurement profiles, and formulas are a solid base for mixed-unit manufacturing.
3. Routing, work-center, machine, and tool modeling is structurally strong.
4. BOM, revision, ECO, and alternate-item engineering flows are worth preserving.
5. MPS, MRP, BOQ, and capacity prompt outputs remain a strong planning baseline.
6. Work-order lifecycle APIs are salvageable and should be regression-tested, not rewritten.
7. Job-card, downtime, and machine uniqueness logic should be kept.
8. Inventory balances, immutable stock ledger patterns, lot, serial, and cycle-count scaffolding are usable.
9. The machine-board stored-procedure wrapper and Dapper read-model pattern are reusable.
10. Auth, JWT, context switching, and policy-based scope enforcement are already in place.
11. Shared API envelope, validation middleware, and correlation handling are reusable.
12. Audit trail infrastructure is reusable.
13. Generic attachment storage is reusable as a binary store behind richer item-media and template metadata.
14. Localization bundle retrieval and translation fallback logic are reusable once richer entity-level text models exist.
15. The ASP.NET Core host, modular project layout, and IIS publish-folder deployment model are already aligned with the product guardrails.

## Assumptions Captured

- `R001` through `R013` are the mandatory remediation cut line before any continuation of the original backend implementation chain.
- Manufacturing execution prompts are preserved unless a new V2 schema forces a compatibility adapter.
- Deferred items such as landed cost, returns, print-template implementation, and full job-cost rollups can move behind foundation stabilization if the pre-`P064` cut line is honored first.

## Build / Test / Lint

- Not run for this pass. This was a documentation-only remediation analysis.

## Next Prompt

- `/04-remediation/prompts/R001_erp-v2-architecture-rebaseline-cutover-guardrails.md`
