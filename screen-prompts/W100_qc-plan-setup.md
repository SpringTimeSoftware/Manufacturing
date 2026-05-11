Work only on branch main.

This is screen completion prompt: W100 — QC Plan Setup

Platform: Web
Module: Quality
Primary roles: QCInspector, CompanyAdmin
Business purpose: Inspection checkpoints and parameter libraries

Goal:
Bring this specific screen to ERP-grade completion according to the Master Completion Pack.
This screen is not complete until:
- its fields are correct
- its actions are truthful
- its layout/workspace behavior is correct
- its data truth is correct
- validation passes
- screenshots prove the result

Read first:
- AGENTS.md
- docs/codex-progress/README.md
- MASTER_COMPLETION_SPEC.md
- MASTER_ACTION_REGISTRY.csv
- MASTER_FIELD_REGISTRY.csv
- SCREEN_COMPLETION_MATRIX.csv
- DOMAIN_WAVE_EXECUTION_PLAN.md
- docs/design/erp-ui-interaction-standards.md
- docs/design/erp-field-governance-standards.md
- 07-ux-governance/master_lookup_field_rules.md
- 07-ux-governance/action_truth_matrix.csv
- 07-governance/entity_field_schema_matrix.csv
- 07-governance/screen_field_violation_matrix.csv
- docs/final-audit/07_screen_issue_register.csv
- current source tree under src/
- tests/
- database/README.md

Resolve the actual page/component file(s), modal file(s), adapter(s), contract(s), backend API(s), DB objects, and tests for this screen in the current repo before changing anything.
Resolve the actual web route/path from the current repo navigation/router. Do not guess.

Non-negotiable rules for this screen:
- No visible action may remain dead.
- Every visible action must end as WORKING, DISABLED WITH REASON, or HIDDEN.
- No governed master-linked field may remain unrestricted free text where a source exists.
- No numeric/decimal/weight/quantity/price/time field may remain unrestricted text.
- No silent seeded operational fallback in live authenticated mode.
- Deep create/edit/detail experiences must use centered modal workspace or full-page workspace, not right drawers.
- No internal/scaffold wording in production-facing UI.
- If upload/media/document workflow is not really available, the action must be disabled with a concise business-safe reason or hidden.
- If this screen depends on other masters, use governed lookup/select/search controls and never free text.

Screen-specific required sections / areas:
1. KPI strip
2. Filters
3. Inspection/NCR workspace
4. Status truth
5. Audit/history

Screen-specific fields to verify and complete:
- plan code
- parameters
- checkpoint linkage

Screen-specific actions to verify and complete:
- New QC plan
- Edit
- Save

Screen-specific additional notes:
- Use screen purpose and current implementation to derive additional completion needs. Do not stop at a superficial pass.

Required completion contract for this screen:
1. Scan all visible fields on this screen, modal, drawer, list, or board.
2. For each field, define and enforce:
   - business label
   - data type
   - control type
   - lookup source if governed
   - validation
   - dependency on other fields
   - create/edit/read-only behavior
3. For each visible action, enforce:
   - WORKING
   - DISABLED WITH REASON
   - HIDDEN
4. If this screen contains upload/media/document actions:
   - implement real workflow if it already exists and is in scope
   - otherwise disable or hide with business-safe reason
5. If this screen contains deep create/edit/detail behavior:
   - use centered modal workspace or full-page workspace
   - do not leave deep work in a right drawer
6. If this screen shows operational or live-looking data:
   - do not silently fall back to seeded fake operational data in live authenticated mode

Field truth checklist for this screen:
- governed master-linked fields must use governed selectors/lookups
- numeric/decimal/quantity/weight/price/time fields must use governed numeric controls
- date/effective-range/status transition fields must use governed date/status controls
- no unrestricted free text where governed source exists
- no unrestricted numeric text boxes where measurable value exists

Action truth checklist for this screen:
- no dead visible buttons
- no fake enabled save/upload/export/clone/run/convert/release/approve actions
- selection-dependent actions must be visibly disabled until selection exists
- workflow-dependent actions must obey state
- disabled reason must be short and business-safe

Layout truth checklist for this screen:
- filters compact and aligned
- action bar grouped and aligned
- grid rows/chips aligned
- deep editor centered modal/full-page if applicable
- validation summary compact/collapsible
- scroll/overflow correct
- no giant dead white space
- no awkward internal helper wording

Data truth checklist for this screen:
- no silent seeded operational fallback in live authenticated mode
- live data or business-safe empty/error state
- no misleading fake records pretending to be real

Required evidence for this screen:
- update 07-ux-governance/action_truth_matrix.csv for touched actions
- update 07-governance/entity_field_schema_matrix.csv if field governance changes
- update 07-governance/screen_field_violation_matrix.csv for this screen
- update docs/final-audit/07_screen_issue_register.csv for this screen
- create/update the correct screen-level wave output under docs/codex-progress/ if this screen belongs to an active wave
- capture screenshots under docs/codex-review-screens/W100/

Required screenshots for this screen:
- w100-primary

Validation:
- npm run typecheck
- npm test
- npm run build
- npm run build:host
- dotnet build src/server/STS.Mfg.sln
- dotnet test src/server/STS.Mfg.sln --no-build
- dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release

Before stopping:
1. Recount for this screen:
   - governed field violations remaining
   - numeric field violations remaining
   - dead visible actions remaining
   - upload truth issues remaining
   - layout/scroll issues remaining
   - wording issues remaining
2. If any critical violations remain, do not call this screen complete. Report exact blockers.
3. Commit all changes
4. Push main

At the end return only:
- files changed
- actual route/component files touched
- actions fixed / disabled / hidden
- field/control corrections made
- remaining blockers for this screen
- validation results
- screenshot folder path
