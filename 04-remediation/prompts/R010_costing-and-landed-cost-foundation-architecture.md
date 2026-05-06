# R010 - Costing and landed-cost foundation architecture

## Phase
Remediation - Pre-P064

## Objective
Define the cost and landed-cost foundation architecture, its extension points, and the exact runtime surfaces the later remediation wave may touch without breaking preserved execution flows.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R007_Pricing_Discount_Tax_and_Currency_V2_Schema.md`
- `/04-remediation/R008_Replenishment_and_Planning_Input_V2_Schema.md`
- `/04-remediation/R009_Platform_Extensibility_Template_and_Localization_V2_Schema.md`
- `/docs/codex-progress/R009-output.md`
- Current backend structure under `/src/server`

## Constraints
- Documentation-only. Do not modify runtime code, migrations, or SQL assets.
- Preserve work-order, job-card, machine-board, and production-receipt cut-line guardrails.

## Work to do
- Write `/04-remediation/R010_Costing_and_Landed_Cost_Foundation_Architecture.md`.
- Define cost and landed-cost aggregates, salvage versus replacement boundaries, compatibility rules, and the R013 runtime touch allowlist for cost hooks only.

## Definition of done
- The architecture document names the canonical foundations, preserved execution boundaries, allowed R013 touch surfaces, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R010-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R011_sql-migration-pack-and-cutover-strategy.md`
