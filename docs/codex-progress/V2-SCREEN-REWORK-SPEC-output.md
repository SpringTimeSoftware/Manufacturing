# V2-SCREEN-REWORK-SPEC Output

## Scope Completed

Created the V2 Deep Screen & Feature Rework Specification as a documentation-only pass. No runtime code, web components, backend code, SQL, seed scripts, deployment files, or P-series prompt execution were changed.

## Files Created

- `/06-v2-screen-rework/00_executive_summary.md`
- `/06-v2-screen-rework/01_screen_audit_matrix.csv`
- `/06-v2-screen-rework/02_visual_and_content_standards.md`
- `/06-v2-screen-rework/03_platform_admin_screen_spec.md`
- `/06-v2-screen-rework/04_organization_setup_screen_spec.md`
- `/06-v2-screen-rework/05_master_data_screen_spec.md`
- `/06-v2-screen-rework/06_engineering_screen_spec.md`
- `/06-v2-screen-rework/07_planning_screen_spec.md`
- `/06-v2-screen-rework/08_production_execution_screen_spec.md`
- `/06-v2-screen-rework/09_inventory_quality_dispatch_screen_spec.md`
- `/06-v2-screen-rework/10_integrations_ai_reporting_screen_spec.md`
- `/06-v2-screen-rework/11_mobile_screen_spec.md`
- `/06-v2-screen-rework/12_api_db_dependency_matrix.csv`
- `/06-v2-screen-rework/13_implementation_waves.md`
- `/06-v2-screen-rework/14_acceptance_checklist.md`
- `/docs/codex-progress/V2-SCREEN-REWORK-SPEC-output.md`

## Screens Audited

- Total required screens audited: 119
- Web screens audited: 95
- Mobile screens audited: 24
- Critical rework rows: 30
- Dependency matrix rows: 119

## Current Readiness Verdict

The application is **internal-only**. It is suitable for engineering/product walkthroughs and controlled architecture demos, but it is not yet serious customer-demo ready, pilot-ready, or production-ready as an ERP product. The main blockers are shallow screen depth, missing production copy discipline, remaining fallback/demo-backed surfaces, incomplete master/commercial depth, mobile execution hardening gaps, and missing audit/document/media depth.

## Top 20 Worst Screens Or Screen Groups

1. W041 Item Detail / Editor: missing V2 item tabs for media, catalog, packaging, physical specs, manufacturing, planning, inventory policy, quality, commercial, vendor, customer refs, documents, and audit.
2. W045 Customer Detail: lacks legal/site/contact/credit/terms/preferences/document depth.
3. W047 Supplier Detail: lacks site/contact/terms/compliance/performance depth.
4. W088 Production Receipt: critical stock transaction not deep enough for item tracking, QC, lot/serial/catch-weight, and audit.
5. W089 Scrap / By-product Entry: source quantity, reason, valuation placeholder, inventory impact, and costing hooks need strict controls.
6. W090 Rework Order: lifecycle and NCR/QC linkage are too shallow.
7. M008 Execution Action Sheet: idempotent mobile action sync and conflict handling are not production-ready.
8. M010 Material Issue Scan: live scan validation against stock/reservation/bin/lot is not complete.
9. M017 Production Receipt: irreversible mobile receipt needs server-side validation and duplicate protection.
10. M024 Settings / Sync Status / Language: offline queue, retry, failed-action visibility, and device diagnostics are not production-ready.
11. W005 Global Search: required cross-domain search screen is missing.
12. W049 Attachment / Document Viewer: document/media lifecycle is fallback-backed and not a cross-module subsystem.
13. W115 Audit Trail Viewer: required audit viewer is missing.
14. W056 ATP / Order Promise: promise logic is shallow and cannot be trusted for customer commitments.
15. W008 User Management: admin lifecycle, device access, and Super Admin seed/rule need deliberate hardening.
16. W009 Role & Permission Matrix: action/data/mobile scope governance is incomplete.
17. W011 Numbering / Workflow Setup: workflow versioning and numbering concurrency are shallow.
18. W110-W113 AI screens: backend draft concepts exist, but production admin/review UIs are missing.
19. W026-W028 resource setup: work center, machine, and tool setup screens are missing despite downstream planning dependence.
20. M001 Mobile Login: demo defaults and device binding gaps block production mobile trust.

## Top 20 Missing Or Deferred Features

1. Full V2 item media/gallery/document management.
2. Product catalog, catalog sections, visibility, and catalog media.
3. Item packaging and physical specifications.
4. Item aliases and customer/vendor item references.
5. Customer sites, contact points, credit profile, terms, and preferences.
6. Supplier sites, contact points, lead-time governance, and compliance documents.
7. Price lists, discount rules, tax, currency, and trade terms.
8. Global search across ERP objects.
9. Audit trail viewer and audit read model.
10. Super Admin seeded all-menu access with audit-safe role policy.
11. Work center, machine, and tool/resource setup screens.
12. Document template governance for travelers, labels, pack lists, and reports.
13. Attachment/media subsystem for web and mobile proof capture.
14. Mobile offline queue with idempotency, retry, and conflict handling.
15. Device binding and mobile trust model.
16. AI provider, prompt template, operations assistant, and daily summary review UIs.
17. Integration provider/webhook/import-export admin UIs.
18. Workflow versioning, status transition governance, and approval simulation.
19. Capacity/resource calendar setup and planning read models.
20. Costing, landed cost, and cost-sensitive inventory hooks remain deferred until master/commercial foundations are deep enough.

## Recommended First Implementation Wave

Wave 1: Critical Login, Auth, Shell, And Content Fixes.

Wave 1 must remove internal/dev copy, finalize stale-token handling, create or enforce a deliberate Super Admin all-menu path, compact the top context/header controls, keep sidebar groups collapsed by default, hide unsupported language/global controls where needed, and ensure production-facing pages never expose adapter/fallback/source-status language.

## Exact Next Recommended Prompt

`/06-v2-screen-rework/prompts/WAVE01_critical-login-auth-shell-content-hardening.md`

## Validation

No build, test, publish, or database validation was run because this pass created documentation and audit/specification files only.
