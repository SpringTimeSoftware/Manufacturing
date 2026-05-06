# R003 - Item and catalog V2 schema

## Phase
Remediation - Pre-P064

## Objective
Define the V2 operational item master, catalog separation, media, document, text, and physical-spec schema needed before commercial remediation.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Preservation_and_Compatibility_Rules.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R002_Master_Data_V2_Canonical_Domain_Map.md`
- `/04-remediation/Architecture_V2_Delta_Matrix.md`
- `/docs/codex-progress/R002-output.md`

## Constraints
- Documentation-only. Do not modify runtime code or database assets.
- Preserve engineering, planning, work-order, and job-card references to the current item identity until compatibility adapters are defined.

## Work to do
- Write `/04-remediation/R003_Item_and_Catalog_V2_Schema.md`.
- Define canonical V2 item and catalog aggregates, owned attributes, and cross-context references.
- Classify affected repo surfaces and document compatibility and cutover rules.

## Definition of done
- The schema document defines item and catalog entities, surface classifications, bridge strategy, deferred items, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R003-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R004_item-packaging-barcode-variant-reference-v2-schema.md`
