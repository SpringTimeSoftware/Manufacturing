# MASTER-COMPLETION-CLUSTER-RUNNER-01 Cluster 1 Progress

Date: 2026-05-11

## Cluster 1 Prompt Updates

| Prompt | Screen | Progress update |
| --- | --- | --- |
| W001 | Login | Device registration controls are disabled with a visible business reason; sign-in and forgot-password navigation remain working. |
| W002 | Forgot Password / Reset | Recovery request remains working; direct token/password reset completion is rendered as disabled until approved verification workflow exists. |
| W003 | Company / Branch / Warehouse Switch | Company, branch, and preferred warehouse controls now use governed lookup controls; apply/reset actions remain working. |
| W004 | Role Home Dashboard | Live authenticated dashboard query failures no longer render seeded KPI, risk, or stage data; unavailable state is visible. |
| W005 | Global Search | Added `/search` route with governed search field, area selector, live scoped source fan-out, centered result preview, and working source navigation. |
| W006 | Notification Center | Rechecked existing modal/action truth; no new dead visible action introduced. |
| W007 | Approval Workbench | Rechecked existing modal/action truth; no new dead visible action introduced. |
| W008 | User Management | Added live-unavailable state and disabled review-only access fields; export is disabled when data is unavailable or empty. |
| W009 | Role & Permission Matrix | Added live-unavailable state and disabled review-only role label; export is disabled when data is unavailable or empty. |
| W010 | Language & Translation Setup | Added live-unavailable state and removed live translation registry mixing with bundled reference rows. |
| W011 | Numbering / Workflow Setup | Added live-unavailable state and retained disabled save/export/clone workflow actions with business-safe reasons. |
| W012 | Feature Flags & Tenant Settings | Added tenant settings unavailable state; implemented `/platform/settings` as a truthful platform settings landing workspace. |
| W049 | Attachment / Document Viewer | Wired upload, preview, download, and linked-record navigation to existing scoped attachment storage/metadata/authorization flow. |
| W114 | Executive Cockpit / Owner Dashboard | Removed live seeded fallback and moved intervention detail from right drawer to centered modal workspace. |
| W115 | Audit Trail Viewer | Added live-unavailable state; export is disabled when audit data is unavailable or empty. |

## Governance Updates

- Updated `SCREEN_COMPLETION_MATRIX.csv` rows for login, forgot password, context switch, role home dashboard, global search, platform settings, attachment viewer, and executive cockpit.
- Updated `07-ux-governance/action_truth_matrix.csv` for touched actions, including `WORKING`, `DISABLED WITH REASON`, and `HIDDEN` outcomes.
- Updated `07-governance/screen_field_violation_matrix.csv` with cluster 1 field/action/data truth fixes.
- Updated `docs/final-audit/07_screen_issue_register.csv` with `MCCR01-*` fixed issue rows.

## Verification So Far

- `npm run typecheck`: passed.
- Targeted web tests for search, dashboard, admin, master, and navigation: passed.
- `dotnet build src/server/STS.Mfg.sln`: passed after adding the missing attachment exception namespace.
