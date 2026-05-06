# R001 - ERP V2 architecture rebaseline, cutover guardrails, and preservation rules

## Phase
Remediation - Pre-P064

## Objective
Convert the R000 rebaseline into enforceable repo-local guardrails before any schema, SQL, or API remediation begins.

## Read first
- `/AGENTS.md`
- `/04-remediation/Architecture_V2_Delta_Matrix.md`
- `/04-remediation/Superseded_Prompt_Map.md`
- `/04-remediation/R_Prompt_Index.csv`
- `/docs/codex-progress/R000-output.md`
- `/docs/codex-progress/README.md`
- The current backend structure under `/src/server`

## Constraints
- The original prompt chain is frozen at `P063`.
- `P064` cannot be executed before `R001-R013` are completed.
- Documentation-only pass. Do not modify runtime code, migrations, controllers, services, DTOs, EF entities, or SQL objects.
- Prefer extension over replacement where the V2 plan says `KEEP` or `PATCH`.
- Replace only where V2 explicitly marks `REPLACE`.
- Preserve ASP.NET Core, SQL Server, React web, React Native mobile, IIS publish-folder deployment, the reference UI direction, and the V1 exclusions.

## Work to do
- Write `/04-remediation/Cutover_Guardrails.md`.
- Write `/04-remediation/Preservation_and_Compatibility_Rules.md`.
- Write `/04-remediation/Pre_P064_Stoplist.md`.
- Write `/docs/codex-progress/R001-output.md`.

## Definition of done
- The guardrails state that `P063` is the freeze point and that `P064` is blocked until `R001-R013` finish.
- Keep, patch, and replace boundaries are documented by domain.
- Preserved manufacturing and platform assets are named explicitly.
- Blocked domains and file scopes are named explicitly.
- The progress output confirms that no runtime code changed and records the exact next prompt path.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record blockers, assumptions, preserved assets, and blocked areas explicitly.
- Next prompt path: `/04-remediation/prompts/R002_master-data-v2-canonical-domain-map.md`
- Do not execute the next prompt as part of `R001`.
