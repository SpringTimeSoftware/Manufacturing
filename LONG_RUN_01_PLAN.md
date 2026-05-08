# LONG-RUN-01 — Mainline Consolidation, Runtime UAT Repair, and Final Review Pack

## Objective

Use the merged `main` branch to:
1. refresh the final audit against the **actual merged state**,
2. fix the highest-value runtime/UAT blockers,
3. rerun localhost smoke and role-wise UAT,
4. capture screenshot evidence,
5. build one final review pack for human signoff.

This plan is designed for a long uninterrupted Codex run. It is not a feature-expansion plan. It is a finish-and-verify plan.

## Preconditions

Before execution:
- `main` must contain the merged work from:
  - `lane/eng-plan`
  - `lane/prod-exec`
- the database apply order in `database/README.md` must be current,
- localhost publish/run path must already exist,
- the repo must contain the latest:
  - action truth matrix,
  - UX standards,
  - smoke/UAT docs,
  - final-audit docs.

If either lane is not merged into `main`, stop and report that the plan cannot start safely.

## Non-Negotiable Gates

### Gate A — Action Truth
No visible touched action may remain dead.
Every touched action must end as one of:
- WORKING
- DISABLED WITH REASON
- HIDDEN

### Gate B — Evidence
For every touched primary screen and modal, capture screenshot evidence.
If a page scrolls, capture at most:
- top
- middle
- bottom

### Gate C — Validation
No phase can be declared complete unless the required validation set passes.

## Source Files To Read

Read these before doing any work:
- `AGENTS.md`
- `docs/codex-progress/README.md`
- `docs/final-audit/*`
- `docs/release/production-readiness-review.md`
- `docs/security/production-security-hardening-review.md`
- `docs/uat/*`
- `docs/design/erp-ui-interaction-standards.md`
- `07-ux-governance/action_truth_matrix.csv`
- `database/README.md`
- `deploy/iis/*`
- current source tree under `src/`
- tests under `tests/`

## Execution Phases

### Phase 0 — Merge State Verification
Verify that `main` already contains the lane work from Engineering/Planning and Production/Execution.

Checks:
- branch state,
- existence of merged outputs in `docs/codex-progress/`,
- key touched screens and APIs present on `main`.

If merge state is incomplete, stop immediately and report it.

### Phase 1 — FINAL-AUDIT-02 Refresh
Refresh the final audit on `main`.

Required files to create/update:
- `docs/final-audit/00_project_state_summary.md`
- `docs/final-audit/01_feature_inventory_matrix.csv`
- `docs/final-audit/02_v2_srs_traceability_matrix.csv`
- `docs/final-audit/03_modern_manufacturing_erp_gap_scan.md`
- `docs/final-audit/04_page_by_page_gap_matrix.csv`
- `docs/final-audit/05_completion_roadmap.md`
- `docs/final-audit/06_merge_readiness_and_release_gates.md`
- `docs/codex-progress/FINAL-AUDIT-02-output.md`

Classification vocabulary:
- COMPLETE
- PARTIAL
- BLOCKED
- DEMO-ONLY
- MISSING

Honesty rule:
Do not label anything COMPLETE if UI is scaffolded, persistence is missing, or actions are merely disabled.

### Phase 2 — Runtime UAT and Seed Repair
Fix the highest-value blockers exposed by the refreshed audit.

Priority order:
1. role-critical endpoint failures,
2. missing or weak seed identities/data needed for realistic smoke/UAT,
3. HTTP 500s or broken routes on core completed flows,
4. empty live runtime flows that force screenshots to rely on fake/demo data,
5. missing route/menu discoverability for implemented screens,
6. critical action-truth issues found during smoke/UAT.

Allowed change types:
- backend fixes,
- DB/seed fixes,
- route/menu fixes,
- safe additive runtime fixes,
- no speculative new domains,
- no cosmetic-only passes.

If SQL or seed changes occur:
- update `database/README.md` with exact apply order.

### Phase 3 — Validation
Run required validation after the runtime/UAT repair phase.

Web:
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run build:host`

Backend:
- `dotnet build src/server/STS.Mfg.sln`
- `dotnet test src/server/STS.Mfg.sln --no-build`
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`

If validation fails:
- stop immediately,
- report exact failing command,
- report blocking files.

### Phase 4 — Localhost Smoke Rerun
Use the established localhost publish/run path.

Minimum smoke scope:
- app starts,
- login works,
- home/dashboard loads,
- company/branch/department load,
- customer/supplier load,
- commercial setup screens load,
- one engineering/planning screen works,
- one production/execution screen works,
- no critical blocking runtime exception.

Required files to update:
- `docs/uat/LOCALHOST_SMOKE_TEST_REPORT.md`
- `docs/codex-progress/LOCALHOST-SMOKE-RERUN-output.md`

### Phase 5 — Role-Wise UAT Rerun
Use the current UAT matrix.

Required files to update:
- `docs/uat/LOCALHOST_ROLE_WISE_UAT_RESULTS.md`
- `docs/codex-progress/LOCALHOST-UAT-RERUN-output.md`

Each UAT line item must be marked as:
- PASS
- PARTIAL
- FAIL
- NOT-IN-SCOPE

### Phase 6 — Screenshot Evidence
Capture screenshots for all touched primary screens and modals.

Folder:
- `docs/codex-review-screens/LONG-RUN-01/`

Rules:
- max 3 screenshots per scrollable screen,
- no looping,
- capture both list and editor/modal where touched,
- prioritize screens touched by Phase 2 repairs and smoke/UAT rerun.

### Phase 7 — Final Review Pack
Build a single review pack zip containing:
- `docs/final-audit/*`
- `docs/uat/LOCALHOST_SMOKE_TEST_REPORT.md`
- `docs/uat/LOCALHOST_ROLE_WISE_UAT_RESULTS.md`
- `docs/release/production-readiness-review.md`
- `docs/security/production-security-hardening-review.md`
- `07-ux-governance/action_truth_matrix.csv`
- `docs/codex-review-screens/LONG-RUN-01/`
- changed DB README / DDL / seed files if any
- `docs/codex-progress/LONG-RUN-01-output.md`

Output:
- `artifacts/review-packs/LONG-RUN-01-review-pack.zip`

## Required Final Outputs

Create/update:
- `docs/codex-progress/LONG-RUN-01-output.md`
- `artifacts/review-packs/LONG-RUN-01-review-pack.zip`

`LONG-RUN-01-output.md` must include:
- phases completed,
- blockers fixed,
- files changed,
- validation results,
- smoke summary,
- UAT summary,
- final readiness judgment:
  - internal-only
  - demo-ready
  - UAT-ready
  - pilot-ready
- exact remaining blockers, if any.

## Stop Conditions

Stop immediately if:
- `main` does not contain the required merged lane work,
- validation fails,
- a critical runtime/UAT blocker cannot be repaired safely in this plan,
- continuing would require speculative new feature expansion instead of reliability/UAT repair.

## Success Definition

The run is successful only if:
- FINAL-AUDIT-02 is refreshed,
- critical runtime/UAT blockers are repaired,
- smoke test is rerun,
- role-wise UAT is rerun,
- screenshot evidence exists,
- review pack zip is built,
- final readiness state is clearly declared.
