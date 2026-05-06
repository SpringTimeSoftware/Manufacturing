# Observability

## Objective

Every critical business action must have a logging, tracing, and support-diagnostics path before implementation begins.

## Structured Logging Model

All server logs should emit structured fields rather than string-only messages.

### Core fields

- `timestampUtc`
- `level`
- `service`
- `environment`
- `correlationId`
- `userId`
- `companyId`
- `branchId`
- `module`
- `action`
- `documentType`
- `documentId`
- `result`
- `durationMs`

## Critical Log Streams

### API requests

- request start
- request completion
- authorization denial
- validation failure
- unhandled exception

### SQL procedure execution

- procedure name
- input scope context
- execution duration
- row count or key output
- failure reason when applicable

### Mobile sync

- queue submit
- queue retry
- conflict detected
- idempotent replay accepted
- attachment upload completion

### Integrations

- provider call start
- provider call result
- retry scheduled
- payload redacted preview

## Correlation IDs

- Every API request generates or propagates one correlation ID.
- The correlation ID must flow into:
  - server logs
  - downstream integration calls
  - stored procedure execution logs where relevant
  - response envelope metadata
- Offline mobile actions must preserve a device-side operation ID and receive a server correlation ID on sync.

## Health Checks

Minimum health checks:

- API host liveness
- SQL connectivity
- storage availability
- notification outbox health
- integration provider configuration sanity
- AI provider reachability where configured

Health endpoints should expose safe summaries for operators and more detailed diagnostics for privileged admins.

## Diagnostics Surfaces

Planned support-facing web surfaces:

- health and diagnostics page
- job and outbox monitor
- integration delivery monitor
- mobile sync diagnostics
- audit viewer

These screens must redact secrets and sensitive payload bodies by default.

## Redaction Rules

- Never log raw secrets, tokens, passwords, or connection strings.
- Redact personally identifying contact info unless operationally necessary.
- Attachment content is never logged; only metadata is.
- AI prompts or outputs containing sensitive content should be stored and viewed under controlled permissions.

## Metrics

Track at least:

- request rate and error rate by module
- stored procedure duration percentiles
- mobile sync success and retry counts
- queue depth for notifications and integrations
- dashboard refresh duration
- critical business action counts such as work order releases, job-card starts, QC holds, and dispatches

## Retention Guidance

- Audit logs should outlive standard application logs.
- High-volume debug logs should have shorter retention than business audit and exception logs.
- Support diagnostics should allow filtering by correlation ID, document ID, company, branch, and user.
