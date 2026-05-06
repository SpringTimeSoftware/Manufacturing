# Audit Strategy

## Objective

Audit must capture who changed what, when, why, and from where for sensitive configuration, planning, inventory, production, quality, and dispatch actions.

## What Must Be Audited

- master-data create, update, activate, deactivate
- workflow and numbering changes
- BOM and routing revisions
- work order release and re-release
- job card state changes
- material issue and return
- production receipt posting
- QC hold and release
- NCR decisions
- dispatch release and shipment confirmation
- approval decisions
- override actions
- AI draft approval and send actions

## Audit Record Fields

- audit log ID
- timestamp UTC
- user ID
- role
- company ID
- branch ID
- module
- entity type
- entity ID
- action code
- before snapshot reference or diff
- after snapshot reference or diff
- reason code where required
- correlation ID
- client type such as web, mobile, integration

## Audit Rules

- Audit logs are immutable.
- Sensitive state transitions must not occur without an audit record.
- Override actions require both reason code and free-text note when policy demands it.
- Bulk actions should create one batch parent audit entry plus child item details where needed.

## Read Access

- `CompanyAdmin` and `PlatformAdmin` get audit access by default within scope.
- `PlantHead` may receive limited operational audit visibility for execution actions.
- Ordinary transactional roles do not get broad audit visibility.

## Storage and Querying

- Audit data lives in dedicated immutable audit tables or append-only structures.
- Read models for audit screens should support filtering by:
  - entity type
  - entity ID
  - document number
  - user
  - role
  - date range
  - branch

## Redaction

- Audit records store enough detail for traceability, but secure fields must be masked in read views.
- Secrets and raw credentials never enter the audit log.
- Attachment binary content is not stored in audit logs; only metadata and linkage changes are.
