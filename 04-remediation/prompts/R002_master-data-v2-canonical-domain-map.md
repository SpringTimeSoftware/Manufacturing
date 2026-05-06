# R002 - Master Data V2 canonical domain map

## Phase
Remediation - Pre-P064

## Objective
Define the canonical V2 bounded contexts, aggregate ownership, shared identities, and salvage boundaries for master data and adjacent planning foundations.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Preservation_and_Compatibility_Rules.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/Architecture_V2_Delta_Matrix.md`
- `/04-remediation/Superseded_Prompt_Map.md`
- `/04-remediation/R_Prompt_Index.csv`
- `/docs/codex-progress/R000-output.md`
- `/docs/codex-progress/R001-output.md`
- Current backend structure under `/src/server`

## Constraints
- Documentation-only. Do not modify runtime code, migrations, EF entities, controllers, services, DTOs, SQL scripts, tests, or app configuration.
- Preserve the manufacturing execution backbone and current UI direction.
- Prefer extension for `KEEP` and `PATCH` areas. Replace only where V2 explicitly marks `REPLACE`.

## Work to do
- Write `/04-remediation/R002_Master_Data_V2_Canonical_Domain_Map.md`.
- Classify affected repo surfaces as `KEEP`, `PATCH`, `REPLACE`, or `DEFER`.
- Define canonical aggregates, shared identifiers, compatibility bridges, and staged cutover boundaries.

## Definition of done
- The domain map names bounded contexts, aggregate keys, surface classifications, compatibility rules, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R002-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R003_item-and-catalog-v2-schema.md`
