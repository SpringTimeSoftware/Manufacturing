# R012 - EF, domain, and contract refactor plan

## Phase
Remediation - Pre-P064

## Objective
Define the exact runtime refactor plan, salvage boundaries, compatibility adapters, and touch allowlist that a future `R013` implementation wave must follow.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Preservation_and_Compatibility_Rules.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R003_Item_and_Catalog_V2_Schema.md`
- `/04-remediation/R009_Platform_Extensibility_Template_and_Localization_V2_Schema.md`
- `/04-remediation/R010_Costing_and_Landed_Cost_Foundation_Architecture.md`
- `/04-remediation/R011_SQL_Migration_Pack_and_Cutover_Strategy.md`
- `/docs/codex-progress/R011-output.md`
- Current runtime surfaces under `/src/server`

## Constraints
- Documentation-only. Do not modify runtime code, migrations, or SQL assets.
- Preserve `P057`, `P062`, and `P063` behavior unless a compatibility adapter is explicitly required.

## Work to do
- Write `/04-remediation/R012_EF_Domain_and_Contract_Refactor_Plan.md`.
- Map the exact runtime files and modules that `R013` may touch, preserve, patch, or avoid.
- Define staged cutover, adapter, and regression-protection rules.

## Definition of done
- The refactor plan names the exact R013 touch allowlist, preserved surfaces, adapter strategy, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R012-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R013_backend-master-and-commercial-remediation-wave.md`
