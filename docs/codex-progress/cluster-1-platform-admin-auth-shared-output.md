# Cluster 1 - Platform / Admin / Auth / Shared

Date: 2026-05-11  
Runner: MASTER-COMPLETION-CLUSTER-RUNNER-01  
Status: COMPLETE

## Scope

Screens scanned: 15

Screens touched: W001 Login; W002 Forgot Password / Reset; W003 Company / Branch / Warehouse Switch; W004 Role Home Dashboard; W005 Global Search; W006 Notification Center; W007 Approval Workbench; W008 User Management; W009 Role & Permission Matrix; W010 Language & Translation Setup; W011 Numbering / Workflow Setup; W012 Feature Flags & Tenant Settings; W049 Attachment / Document Viewer; W114 Executive Cockpit / Owner Dashboard; W115 Audit Trail Viewer.

Baseline counts for this cluster:

| Gate area | Baseline count |
| --- | ---: |
| Screens in scope | 15 |
| Deep editors / modal workspaces in scope | 8 |
| Governed lookup violations | 3 |
| Numeric field violations | 0 |
| Dead / untruthful touched actions | 17 |
| Upload / media / document truth violations | 1 |
| Seeded/live-data truth violations | 10 |
| Layout/modal violations | 2 |
| Scroll/overflow violations | 0 |
| Production wording violations | 2 |

## Completion Result

Screens fully compliant with cluster non-negotiable gates: 15

Screens still partial for non-critical product depth: W002 reset completion/provider delivery audit, W004 role KPI personalization/reporting depth, W005 dedicated search index, W006 notification delivery audit depth, W007 approval comments/delegation/history, W008 access-policy write workflow, W009 custom-role governance workflow, W049 attachment versioning, W114 executive export/drilldown depth, W115 audit export/report delivery.

Critical blockers: none.

## Fix Counts

| Fix area | Count |
| --- | ---: |
| Lookup violations fixed | 3 |
| Numeric field violations fixed | 0 |
| Dead actions removed / disabled / wired | 17 |
| Upload/media/document truth issues fixed | 1 |
| Seeded/live truth issues fixed | 10 |
| Layout/scroll issues fixed | 2 |

## Implemented

- Added `/search` with governed search/scope controls, live scoped fan-out where APIs exist, no seeded live fallback, centered result preview, and working source navigation.
- Disabled incomplete auth/device/reset actions with visible business-safe reasons while keeping sign-in and recovery request flows working.
- Converted context switch company/branch/warehouse selection to governed lookup controls.
- Removed live authenticated seeded operational fallback from home/order/stage/executive dashboard data paths and added unavailable states.
- Replaced executive/order dashboard right-drawer detail with centered modal workspace.
- Added explicit live-unavailable states and safe export gating across users, roles, translations, workflow/numbering, tenant settings, and audit trail.
- Replaced the platform settings route alias with a real platform settings workspace and working navigation actions.
- Wired attachment upload, preview, download, and linked-record navigation through the existing scoped storage/metadata/authorization/audit flow.
- Updated `SCREEN_COMPLETION_MATRIX.csv`, `07-ux-governance/action_truth_matrix.csv`, `07-governance/screen_field_violation_matrix.csv`, and `docs/final-audit/07_screen_issue_register.csv`.

## Validation

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm test` | Passed |
| `npm run build` | Passed |
| `npm run build:host` | Passed |
| `dotnet build src/server/STS.Mfg.sln` | Passed, 0 warnings/errors |
| `dotnet test src/server/STS.Mfg.sln --no-build` | Passed, 20 tests |
| `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` | Passed |

## Screenshot Evidence

Folder: `docs/codex-review-screens/MASTER-COMPLETION-CLUSTER-RUNNER-01/cluster-1-platform-admin-auth-shared/`

Captured primary screens and modals for login, forgot password, context switch, home dashboard, global search, notifications, approvals, users, roles, translations, workflow/numbering, tenant settings, platform settings, attachments, executive cockpit, and audit trail.

## Remaining Non-Blocking Dependencies

- Password reset completion still requires the approved verification/provider workflow.
- Device trust registration remains disabled until device trust policy is enabled.
- Dedicated search indexing is not present; global search uses navigation and existing scoped APIs.
- Access-policy, custom-role, workflow-numbering, tenant-publish, audit-export, and executive-reporting writes remain disabled with business-safe reasons.
- Attachment versioning remains partial, but upload/download/preview/open-linked-record actions are working.
