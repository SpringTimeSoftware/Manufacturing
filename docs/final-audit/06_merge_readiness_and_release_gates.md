# Merge Readiness And Release Gates

Date: 2026-05-08
Branch audited: `main`

## Merge Readiness For Any Completion Wave

Every future wave must satisfy these gates before merge to `main`:

1. Branch is up to date with `main`.
2. Scope is limited to the declared wave.
3. No unrelated domains or files are touched without explicit callout.
4. Every touched visible action is `WORKING`, `DISABLED WITH REASON`, or `HIDDEN`.
5. Action truth matrix is updated for every touched action.
6. Progress output is updated under `docs/codex-progress/`.
7. Screenshot evidence is created for every touched primary screen and modal/workspace.
8. Controlled master-linked fields use lookup/select controls where sources exist.
9. No internal/scaffold/debug/demo wording appears in production UI.
10. Tests cover the touched behavior at risk level appropriate to the change.

## Standard Validation Gate

Minimum validation before merging any product wave:

- `npm run typecheck` in `src/web`
- `npm test` in `src/web`
- `npm run build` in `src/web`
- `npm run build:host` in `src/web`
- `npm run typecheck` in `src/mobile` if mobile touched
- `npm run test:coverage-plan` in `src/mobile` if mobile touched
- `dotnet build src/server/STS.Mfg.sln`
- `dotnet test src/server/STS.Mfg.sln --no-build`
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`

## Before Serious Customer Demo

LONG-RUN-01 meets the runtime portion of this gate for a controlled web demo: the app starts, seeded web roles authenticate, and the previously failing role-critical read APIs returned HTTP 200. The product still needs explicit framing because many screens remain shallow and many actions are disabled with reason.

Must be true:

- Login, context switch, shell, navigation, and role menus work without stale-token friction.
- SuperAdmin/demo admin can access intended menus without bypassing role-governance design.
- No production-facing UI shows internal/scaffold/debug/demo copy.
- All customer-demo screens have screenshot evidence.
- Demo seed/reset data proves at least one make-to-order scenario from sales demand through planning, work order, job card, QC, and dispatch.
- Runtime smoke has no role-critical HTTP 500 endpoints.
- All visible actions on demo screens are working, hidden, or disabled with business-safe reasons.
- Item/customer/supplier/resource records are deep enough to make demo transactions believable.
- BOM, routing, MRP, BOQ, work order, job card, QC, dispatch, and dashboards show coherent linked data.

Can remain backlog for demo:

- Full production rate limiting if demo is offline/controlled.
- Full mobile offline conflict handling if mobile is clearly not demoed as pilot-ready.
- Real provider sending if integration screens are shown as configured placeholders with safe disabled actions.

## Before Role-Wise UAT Signoff

Must be true:

- Every UAT role in `docs/uat/role-wise-uat-and-acceptance-matrix.md` has a seeded login identity or documented exclusion.
- Each role's critical web route opens and loads live data.
- Each role's critical API probes return expected success or governed validation errors, not 500s.
- Role permissions and data scopes are verified for allowed and denied actions.
- UAT seed/reset data covers make-to-order, mixed UOM, outside processing, and overdue-risk scenarios.
- UAT evidence records screenshots, API results, and acceptance status.
- No role remains `PARTIAL` because of missing seed, broken endpoint, missing identity, or unimplemented critical action.

## Before Customer Pilot

Must be true:

- All serious customer-demo gates pass.
- All role-wise UAT gates pass.
- Production transaction flows are server-validated, audited, idempotent, and source-linked.
- Work order release cannot bypass BOM/routing/material/resource readiness.
- Job card state transitions cannot double-post or violate quantity rules.
- Material issue/return/transfer, production receipt, scrap, rework, cycle count, and dispatch movements write reconciled ledger/audit entries.
- Lot/serial/catch-weight/warehouse/bin rules are enforced by item policy.
- QC hold/release blocks inventory and dispatch according to policy.
- NCR lifecycle links source, root cause, disposition, rework/scrap, attachments, and audit.
- Dispatch proof links pack, shipment, vehicle/seal/customer proof, media, and audit.
- Mobile execution uses live assignments, device/session trust, scan validation, visible queue state, idempotency, retry, and conflict handling.
- Attachment preview/download authorization tests pass.
- Rate limiting is active for login, AI, import/export, and integration endpoints.
- Real provider adapters are either configured and tested or disabled with production-safe reasons.
- Audit viewer exists and least-privilege access is verified.
- Backup/restore and IIS deployment runbooks are tested.
- Performance smoke covers dashboards, lists, MRP/BOQ, machine board, reports, and traceability.

## Before Final Release

Must be true:

- Customer pilot gates pass.
- No critical or high security issues remain open.
- No critical UAT item remains open.
- No visible touched action remains dead.
- All release notes, known limitations, and customer-facing runbooks are complete.
- Monitoring, health checks, logs, backup, recovery, and support handoff are documented.
- Legal/product owner signs off on V1 exclusions: HR, payroll, and full accounting remain out of scope.

## Acceptable Backlog After Pilot

These may remain backlog if clearly excluded from pilot scope:

- Full accounting, HR, payroll.
- Advanced PLM/CAD sync.
- Full MES/PLC/OEE beyond approved OEE-lite and machine status.
- Full CMMS/preventive maintenance suite.
- Advanced AI autonomous actions.
- Deep external customer portal.
- Non-critical report variants.
- Secondary localization packs beyond pilot language needs.
- Advanced optimization algorithms after deterministic MRP/capacity rules are stable.

## Not Acceptable Backlog For Pilot

These must not be deferred for pilot:

- Broken login/context/auth.
- Any missing role identities for pilot roles.
- Any HTTP 500 in role-critical APIs.
- Dead visible actions.
- Irreversible transaction posting without server validation and audit.
- Mobile double-post or silent lost-action risk.
- Dispatch of held/unreleased stock.
- Missing attachment authorization.
- Missing audit path for lifecycle/status changes.
- Production secrets visible in UI/logs.
- Inability to rebuild/publish IIS output from source.
