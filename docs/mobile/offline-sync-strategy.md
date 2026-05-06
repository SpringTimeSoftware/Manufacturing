# Offline Sync Strategy

## Objective

Mobile execution must continue through short network outages while preserving correctness, auditability, and conflict visibility.

## Offline-Capable Actions

The following mobile actions must work offline:

- job card `Start`
- job card `Pause`
- job card `Resume`
- quantity entry for good, reject, and scrap
- downtime logging
- QC checkpoint capture
- photo and attachment capture
- shift handover notes

These actions are captured locally and synchronized when connectivity returns.

## Online-Preferred Actions

The following actions should prefer live connectivity and may be blocked offline or require stricter safeguards:

- work order release
- purchase approval
- dispatch final confirmation
- changes to master data
- AI assistant queries against fresh operational data

## Local Queue Design

- Every offline action becomes one queued operation record.
- Each record stores:
  - local operation ID
  - idempotency token
  - user ID
  - company and branch context
  - device timestamp
  - document type and ID
  - action payload
  - attachment references
  - retry count
  - queue state

## Queue States

`Queued`, `Syncing`, `Synced`, `Conflict`, `Rejected`, `RetryScheduled`

## Idempotency

- Every state-changing mobile request carries a stable idempotency token.
- The server stores processed tokens for replay protection.
- If the device retries after timeout, the server should return the original accepted result where possible.

## Retry Rules

- Use exponential backoff for transient failures.
- Do not silently retry validation or business-rule rejections forever.
- Surface queue health in the mobile settings or sync-status screen.
- Attachments should retry independently but remain linked to the parent operation.

## Conflict Detection

Conflicts occur when the server state changed in a way that makes the queued action unsafe or stale, for example:

- job card already completed or cancelled
- machine reassigned while device was offline
- QC hold applied before queued completion action syncs
- quantity totals exceed remaining open quantity

## Conflict Resolution Rules

- The server remains the source of truth.
- Conflicted actions are never auto-forced.
- The mobile client must show:
  - what was captured offline
  - what changed on the server
  - the recovery options

Recovery options:

- refresh and discard local action
- reapply with adjusted values
- escalate to supervisor if override is required

## Precedence Rules

- Server-side cancellation or completion outranks queued mobile progress updates.
- QC hold outranks queued completion if the process must stop pending inspection.
- A queued `Pause` may still be accepted after a server `Start` if sequence remains valid.
- Quantities already posted server-side reduce remaining allowable quantity for later queued entries.

## User Recovery Experience

- The mobile app must expose sync status clearly.
- Users should be able to inspect failed or conflicted actions individually.
- Conflict messages must use business language, not raw server exceptions.

## Observability Link

- Every synced action carries local operation ID plus server correlation ID.
- Sync attempts, conflicts, and retries flow into observability logs and support diagnostics.
