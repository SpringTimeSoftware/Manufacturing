# Mobile Screen Specification

## Mobile Principles

Mobile is for action and execution. It must be scan-first, role-aware, offline-aware, and proof-capable. Current mobile screens cover many concepts, but they are not yet pilot-ready because live API sync, device binding, conflict handling, and production transaction safeguards need deeper implementation.

## Screen Specifications

| Screen | Purpose And Role | Offline And Queue Behavior | Required Fields And Actions | Scanner/Media | API Sync Dependencies | Current Scaffold Gaps | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile login | Secure sign-in and device binding for all users. | Offline login only if a valid cached session exists and policy allows. | User ID, password, company/branch context, device trust. | Optional device identity proof. | `/api/auth/login`, `/api/auth/me`, device trust endpoint if added. | Defaults/demo credentials and seeded behavior are not production acceptable. | No demo defaults; stale token clears; device/session state is explicit. |
| Context switch | Switch company/branch/warehouse context. | Queue no business transaction while context is invalid. | Company, branch, warehouse, shift. | None. | `/api/auth/switch-context`, org APIs. | Needs live org selector and guard for queued work. | Context is applied before tasks are shown. |
| Home | Role-specific action dashboard. | Show queued actions and last sync. | My tasks, job cards, approvals, issue/return, QC, dispatch, alerts. | None. | Dashboards, notifications, job card APIs. | Seeded role navigation rules. | User only sees live assigned or authorized work. |
| Notifications/approvals | Inbox and quick decisions. | Queue read/decision only when policy allows. | Notification list, approval detail, decision reason. | Attach optional proof for approval if needed. | `/api/notifications`, `/api/approvals`. | Needs decision sync and conflict handling. | Decisions sync with audit and source document status. |
| Job cards | Assigned queue. | Cache queue for poor connectivity; warn if stale. | Job card, operation, machine, qty, due, readiness. | Scan job card QR. | `/api/job-cards`. | Seeded queue and limited live assignment. | Operator sees current assigned jobs only. |
| Job card detail | Operation context and instructions. | Cached docs allowed, actions queue with version check. | BOM/materials, route, drawings, QC flags, remaining qty. | View documents/photos, scan materials. | Job card, attachments, item, BOM/routing APIs. | Combined with queue/action in shallow flow. | Operator can execute without asking for paper docs. |
| Execution capture | Start/pause/resume/complete. | Queue actions with idempotency key and conflict retry. | Status action, reason, timestamp, qty, machine, shift. | Photo/voice note by reason. | Job card lifecycle/mobile replay. | Local queue concept exists but needs server sync proof. | Duplicate taps cannot double-post production events. |
| Material scan | Issue/return validation by scan. | Queue scan events with stock revalidation on sync. | Item, bin, lot/serial, qty, WO/job card, reason. | Barcode/QR scan required where configured. | Stock issue/return/transfer APIs. | Needs live validation and scanner SDK behavior. | Scan rejects wrong item/bin/lot before posting. |
| Inventory movement | Transfer/putaway/count. | Offline count allowed; transfer sync needs conflict check. | Source/destination, item, lot/serial, qty, reason. | Scan source and destination bins. | Inventory movement APIs. | Screen exists but data is seed-like. | Movements reconcile with live stock. |
| Downtime | Log machine stop. | Queue start/stop with local timestamp and server reconciliation. | Machine, job card, reason, start/end, escalation. | Optional photo. | `/api/downtime`, machine board. | Needs live machine assignments. | Downtime affects machine status and timeline. |
| QC capture | Parameter entry and pass/fail. | Queue draft results; final pass/fail sync requires validation. | QC plan, parameters, sample size, result, defect, disposition. | Photo proof and measurement attachment. | Quality inspection/NCR APIs. | Needs plan-driven parameter UI. | QC cannot close with missing required parameters. |
| Production receipt/rework | Receive output and capture rework/NCR. | Queue drafts only; irreversible receipts require server confirmation. | Item, qty, lot/serial/catch-weight, warehouse/bin, source job, reason. | Label scan/photo. | Production receipt, scrap/rework, inventory APIs. | Critical transaction flow not pilot-ready. | Receipt/rework posts only after server validates item tracking and source status. |
| Shift handover/media | End-of-shift summary. | Queue notes/media and sync when online. | Shift, open blockers, output summary, issues, next shift notes. | Photos, voice notes. | Shift/job card/media APIs. | Media upload is not production-hardened. | Handover is visible to next supervisor with media. |
| Dispatch proof | Loading/delivery proof. | Queue proof with shipment status recheck. | Shipment, packs, vehicle, seal, driver, proof, notes. | Scan packs, photo/signature. | Dispatch proof/shipment APIs. | Needs live shipment tasking and media proof. | Proof links to shipment and closes dispatch step. |
| Order stage board | Mobile blocked-stage overview. | Read-only cache allowed. | Orders, stages, blockers, owner, due date. | Optional photo on blocker note. | Stage dashboard APIs. | Needs live drilldown and role filters. | Plant head sees current critical blockers. |
| Device utilities | Scanner/camera/sync diagnostics. | Shows queue, retries, failed actions. | Device ID, app version, permission status, sync logs. | Test camera/scanner. | Device/sync endpoints if added. | Current utility is placeholder-like. | Support can diagnose mobile device issues. |
| Sync status | Queue health and language/settings. | Explicit pending/synced/failed/retry. | Queue list, retry all, discard draft where allowed, language. | None beyond queue/media. | Sync/status APIs or mobile local store. | Needs real persistent offline queue. | No user can unknowingly work with failed queued transactions. |

## Mobile Missing Or Combined Screens

- Material issue, material return, bin transfer, and cycle count need distinct flows or clearly separated tabs with scan-specific validation.
- My approvals should not be hidden inside a general notification page if approval volume is high.
- Production receipt and rework should be separated where transaction risk requires different approvals.
- Attachments/photo/voice upload should be a reusable subsystem across job card, QC, dispatch, handover, downtime, and NCR.
