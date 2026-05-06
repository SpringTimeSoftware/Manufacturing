# R004 - Item packaging, barcode, variant, and reference V2 schema

## Phase
Remediation - Pre-P064

## Objective
Define the V2 packaging, barcode, variant, alias, template, and partner-reference schema that extends the canonical item master without breaking execution flows.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R002_Master_Data_V2_Canonical_Domain_Map.md`
- `/04-remediation/R003_Item_and_Catalog_V2_Schema.md`
- `/04-remediation/Architecture_V2_Delta_Matrix.md`
- `/docs/codex-progress/R003-output.md`

## Constraints
- Documentation-only. Do not modify runtime code or SQL assets.
- Preserve existing scan, engineering, planning, and manufacturing references until compatibility bridges are implemented.

## Work to do
- Write `/04-remediation/R004_Item_Packaging_Barcode_Variant_and_Reference_V2_Schema.md`.
- Define V2 packaging, barcode, variant, alias, template, and customer/vendor item-reference structures.
- Classify affected repo surfaces and define cutover and compatibility rules.

## Definition of done
- The schema document defines canonical entities, surface classifications, bridge strategy, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R004-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R005_customer-contact-credit-terms-v2-schema.md`
