# Adapter Fallback Inventory

## Reduced In This Wave

| Adapter | Previous behavior | New behavior | Remaining fallback reason |
| --- | --- | --- | --- |
| `src/web/src/organization/organizationAdapters.ts` | Demo sessions immediately returned seeded company/branch/department/warehouse/bin/shift rows. | Any session with an access token now attempts the live organization API first, then falls back to seeds on failure. | Anonymous/offline/demo-unavailable states still need a safe UI path and tests still need deterministic records. |
| `src/web/src/platform/platformAdapters.ts` | Forgot-password and approvals were always typed seeded adapters. | Forgot-password posts to `/api/auth/forgot-password`; approvals read `/api/approvals` and post decisions to `/api/approvals/{id}/decision` for live sessions. | Anonymous/offline/demo-unavailable states still need deterministic fallback. |
| `src/web/src/platform/platformAdminAdapters.ts` | User, role, workflow, and tenant-setting reads were always seeded. | Live sessions now read `/api/users`, `/api/roles`, `/api/settings/workflow-rules`, and `/api/settings/tenant-settings`. | Demo sessions and un-applied database packs still need fallback. |
| `src/web/src/notifications/NotificationProvider.tsx` | Notification center always used seeded in-memory notifications. | Live sessions now hydrate from `/api/notifications` and post mark-read actions. | Demo sessions and degraded backend states still need fallback. |

## Retained Fallbacks

| Adapter or module | Backend availability | Decision |
| --- | --- | --- |
| `dashboards/dashboardAdapters.ts` | Dashboard APIs exist for stage-wise, order-delivery, and executive cockpit. | Keep seeded fallback because P079 explicitly preserved degraded reads and role-home composition remains client-side. |
| `WorkspacePreferenceContext` | Warehouse preference persistence endpoint is missing. | Keep local preference storage while live company/branch context remains backend-backed. |
| Demo scenario and feature-flag surfaces | Demo UX is part of P077/P078 guardrails. | Preserve demo/mock paths unless a future prompt explicitly replaces them. |

## Cutover Rule

Fallbacks may be reduced only when all of these are true:

1. A backend controller and contract already exist.
2. The backing SQL object exists in an ordered DDL pack.
3. The web contract can be mapped without inventing new fields.
4. A seeded/demo fallback remains for unavailable backend and deterministic tests.

## Remaining Demo-Only Areas

- Full auth-user mutation and password reset completion.
- Approval workbench mutation beyond basic SQL decision capture.
- Notification delivery-channel synchronization beyond inbox read/acknowledgment.
- User, role, permission, workflow, numbering, and tenant-setting write administration.
- Web screens beyond the completed P083 point.
