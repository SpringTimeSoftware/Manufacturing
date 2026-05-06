# R009 - Platform extensibility, template, and localization V2 schema

## Phase
Remediation - Pre-P064

## Objective
Define the metadata, template, localization, consent, and setup-verification model that the V2 master and commercial domains depend on.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R002_Master_Data_V2_Canonical_Domain_Map.md`
- `/04-remediation/R003_Item_and_Catalog_V2_Schema.md`
- `/04-remediation/R005_Customer_Contact_Credit_and_Terms_V2_Schema.md`
- `/04-remediation/R008_Replenishment_and_Planning_Input_V2_Schema.md`
- `/docs/codex-progress/R008-output.md`

## Constraints
- Documentation-only. Do not modify runtime code, migrations, or SQL assets.
- Preserve current attachment, localization, notification, and setup scaffolding and extend it through additive platform ownership.

## Work to do
- Write `/04-remediation/R009_Platform_Extensibility_Template_and_Localization_V2_Schema.md`.
- Define metadata, template, localization, consent, and setup-verification aggregates.
- Classify affected repo surfaces and define compatibility and cutover rules.

## Definition of done
- The schema document names platform-owned aggregates, preserved scaffolding, bridge rules, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R009-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R010_costing-and-landed-cost-foundation-architecture.md`
