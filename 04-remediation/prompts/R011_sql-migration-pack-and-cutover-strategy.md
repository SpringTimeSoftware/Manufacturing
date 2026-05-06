# R011 - SQL migration pack and cutover strategy

## Phase
Remediation - Pre-P064

## Objective
Define the ordered SQL pack layout, migration sequencing, stored-procedure strategy, and cutover rules needed before runtime remediation is allowed.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R010_Costing_and_Landed_Cost_Foundation_Architecture.md`
- `/04-remediation/Architecture_V2_Delta_Matrix.md`
- `/docs/codex-progress/R010-output.md`
- Current `database` posture and persistence surfaces under `/src/server`

## Constraints
- Documentation-only. Do not create SQL rollout files in this pass.
- Preserve the current machine-board wrapper and do not reopen `P064`.

## Work to do
- Write `/04-remediation/R011_SQL_Migration_Pack_and_Cutover_Strategy.md`.
- Define ordered DDL, migration, seed, backfill, and stored-procedure pack rules.
- Define compatibility and cutover rules and the exact runtime and SQL surfaces R013 may touch.

## Definition of done
- The strategy document names pack layout, ordered waves, preserved SQL consumers, R013 touch allowlist, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R011-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R012_ef-domain-contract-refactor-plan.md`
