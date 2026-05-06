# R008 - Replenishment and planning-input V2 schema

## Phase
Remediation - Pre-P064

## Objective
Define the canonical replenishment and planning-input model that preserves the current MPS, MRP, BOQ, and execution backbone while replacing shallow item-policy assumptions.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R002_Master_Data_V2_Canonical_Domain_Map.md`
- `/04-remediation/R004_Item_Packaging_Barcode_Variant_and_Reference_V2_Schema.md`
- `/04-remediation/R006_Supplier_Compliance_and_Reference_V2_Schema.md`
- `/04-remediation/R007_Pricing_Discount_Tax_and_Currency_V2_Schema.md`
- `/docs/codex-progress/R007-output.md`

## Constraints
- Documentation-only. Do not modify runtime code or SQL assets.
- Preserve the current MPS, MRP, BOQ, WO, and JC execution behavior.

## Work to do
- Write `/04-remediation/R008_Replenishment_and_Planning_Input_V2_Schema.md`.
- Define replenishment-policy, planning-input, sourcing, and packaging-aware planning aggregates.
- Classify affected repo surfaces and define compatibility and cutover rules.

## Definition of done
- The schema document names the canonical planning inputs, preserved planning and inventory shells, bridge rules, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R008-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R009_platform-extensibility-template-and-localization-v2-schema.md`
