# R007 - Pricing, discount, tax, and currency V2 schema

## Phase
Remediation - Pre-P064

## Objective
Define the commercial foundation for pricing, discount, tax, currency, and override behavior before any further quote, sales-order, or procurement remediation.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R002_Master_Data_V2_Canonical_Domain_Map.md`
- `/04-remediation/R005_Customer_Contact_Credit_and_Terms_V2_Schema.md`
- `/04-remediation/R006_Supplier_Compliance_and_Reference_V2_Schema.md`
- `/04-remediation/Architecture_V2_Delta_Matrix.md`
- `/docs/codex-progress/R006-output.md`

## Constraints
- Documentation-only. Do not modify runtime code, migrations, or SQL assets.
- Preserve current quote, sales-order, purchase-order, and blanket-order shells until bridge contracts are introduced.

## Work to do
- Write `/04-remediation/R007_Pricing_Discount_Tax_and_Currency_V2_Schema.md`.
- Define the canonical pricing, discount, tax, and currency aggregates and their current-surface classifications.
- Define compatibility and cutover rules and the exact next prompt path.

## Definition of done
- The schema document names owned entities, preserved commercial shells, bridge rules, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R007-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R008_replenishment-and-planning-input-v2-schema.md`
