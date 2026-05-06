# R001 Output

## Objective Status

- Converted the R000 rebaseline into enforceable repo-local cutover guardrails and preservation rules.
- Created the pre-`P064` stoplist and the durable in-repo `R001` prompt file.
- Did not write or modify runtime code.

## Files Created or Changed

- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Preservation_and_Compatibility_Rules.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/prompts/R001_erp-v2-architecture-rebaseline-cutover-guardrails.md`
- `/docs/codex-progress/R001-output.md`

## Guardrails Decided

- The original prompt chain is frozen at `P063`.
- `P064` cannot be executed before `R001-R013` are completed.
- The manufacturing execution backbone is preserved: BOM, BOQ/MRP, Work Orders, Job Cards, Machine Board, Stage Wise Dashboard, Order Delivery Dashboard.
- The platform stack is preserved: ASP.NET Core, SQL Server, React web, React Native mobile, IIS publish-folder deployment.
- HR, payroll, and full accounting remain out of V1.
- Master-data and commercial foundations must be remediated before further production receipt or inventory-cost flow expansion.
- `KEEP` and `PATCH` areas are extended in place; `REPLACE` areas move through compatibility-led migration rather than destructive resets.

## Top 10 Preserved Assets

1. Company, branch, warehouse, bin, and shift backbone.
2. UOM classes, units, conversions, measurement profiles, and formulas.
3. Routing, work-center, machine, and tool modeling.
4. BOM, revision, ECO, and alternate-item engineering flows.
5. MPS, MRP, BOQ, and capacity planning shell.
6. `P057` engineering APIs.
7. `P062` work-order lifecycle APIs.
8. `P063` job-card and downtime execution APIs.
9. Inventory ledger, reservations, lot, serial, and cycle-count scaffolding.
10. ASP.NET Core host, auth, scope, audit, and IIS publish-folder deployment model.

## Top 10 Blocked Areas

1. V1-shaped item master expansion.
2. Customer legal-entity, site, contact, consent, credit, and terms expansion on the shallow model.
3. Supplier depth, compliance, and vendor-reference expansion on the shallow model.
4. Pricing, discount, tax, currency, and trade-term implementation on the current commercial shell.
5. Replenishment policy and planning-input expansion before canonical V2 inputs exist.
6. Template, controlled-document, and localization expansion before platform remediation.
7. UDF and metadata extensibility runtime work before `R009-R013`.
8. Costing hooks before the foundation architecture and SQL remediation wave.
9. Landed-cost and return foundations before the pre-`P064` remediation sequence finishes.
10. Production receipt, scrap, and rework finalization on V1 master-data assumptions.

## Runtime Code Change Status

- No runtime code was changed in this pass.
- No migrations, controllers, services, DTOs, EF entities, or SQL objects were modified.

## Build / Test / Lint

- Not run. This was a documentation-only guardrail pass.

## Next Prompt

- `/04-remediation/prompts/R002_master-data-v2-canonical-domain-map.md`
