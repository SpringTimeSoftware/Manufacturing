# STS Manufacturing ERP — Master Workstream Roadmap Pack

This pack replaces loose prompt-by-prompt development with a structured completion model.

It is designed for the current repository state where the product has broad coverage but is still not UAT/pilot-ready. The core rule is: **do not call a workstream complete unless its critical violations are zero, its workflows are proven, its screenshots exist, and validation passes.**

## How to use

1. Copy this folder into the repository, preferably under:
   - `docs/master-workstream-roadmap/`
2. Keep the workstream documents and prompts together.
3. Start with `01_MASTER_WORKSTREAM_ROADMAP.md`.
4. Run workstreams in the order defined in `02_WORKSTREAM_ORDER_AND_GATES.md`.
5. For each workstream, paste the matching prompt from `/prompts/` into Codex App on `main`.
6. Do not start the next workstream until the current one is marked `COMPLETE` or `BLOCKED` with exact blocker reasons.
7. Every workstream must generate:
   - output markdown under `docs/codex-progress/`
   - screenshots under `docs/codex-review-screens/<workstream-id>/`
   - updated matrices
   - review pack zip under `artifacts/review-packs/`

## Core completion rule

A workstream is not complete because screens exist.

A workstream is complete only when:

- required screens exist
- fields have correct control types
- governed references use lookup/select, not free text
- numeric/money/quantity fields are numeric controls
- multiline transaction screens support multiline entry where applicable
- add/edit/save/delete/inactivate/print/export/upload actions are working, disabled with reason, or hidden
- statuses and approvals behave correctly
- data saves, reloads, and survives reopen
- screenshots prove the work
- validation passes

## Files in this pack

- `01_MASTER_WORKSTREAM_ROADMAP.md` — complete revised roadmap.
- `02_WORKSTREAM_ORDER_AND_GATES.md` — order, dependency, and stop-gate policy.
- `03_GLOBAL_DEFINITION_OF_DONE.md` — non-negotiable definition of done.
- `04_FUNCTIONAL_COVERAGE_CONTRACT.md` — functional depth checklist across ERP domains.
- `05_FIELD_ACTION_DATA_TRUTH_CONTRACT.md` — exact field/action/data truth rules.
- `06_SCREEN_AND_EVIDENCE_RULES.md` — screenshot, review-pack, UAT evidence rules.
- `matrices/WORKSTREAM_SCOPE_MATRIX.csv` — summary matrix.
- `matrices/WORKSTREAM_DEPENDENCY_MATRIX.csv` — dependency matrix.
- `workstreams/WSxx_*.md` — detailed workstream plans.
- `prompts/WSxx_*.txt` — strict Codex prompts for each workstream.
- `MASTER_WORKSTREAM_RUNNER_PROMPT.txt` — generic runner prompt when a single workstream ID is specified.
