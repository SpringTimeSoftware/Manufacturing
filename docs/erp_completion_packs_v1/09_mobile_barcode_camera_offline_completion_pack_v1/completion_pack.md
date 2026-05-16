# Mobile / Barcode / Camera / Offline Completion Pack v1

    ## Mission

    Close mobile runtime execution for barcode scanning, camera/photo capture, offline-first queues, device trust, sync conflicts, and shop-floor/warehouse/dispatch/service mobile workflows.

    ## Pack Classification

    - Pack number: 09
    - Folder: `mobile_barcode_camera_offline_completion_pack_v1`
    - Wave: Wave 2
    - Completion level expected: P0 real implementation for touched scope, P1/P2 only if explicitly marked out of scope with reason.

    ## Modules in Scope

    - Mobile shell/PWA/native integration
- Barcode scanner
- Camera/document capture
- Offline queue
- Sync engine
- Device trust
- Warehouse mobile
- Production mobile
- Quality mobile
- Dispatch/POD mobile
- Service mobile

    ## Business Decisions to Confirm

    Codex can start with conservative defaults, but these decisions must be captured in the final report.

    - Target devices: Android phones, tablets, Zebra/Honeywell scanners, iOS, browser-only?
- Offline tolerance: minutes, full shift, multi-day?
- Scanner mode: keyboard wedge, camera scanner, native scanner SDK, all?
- What transactions are allowed offline: inquiry only, draft capture, or posting?

    ## Conservative Defaults if No Decision Is Provided

    - Support browser/PWA plus keyboard-wedge scanner first; device-specific SDK hooks can be adapter-based.
- Offline can capture drafts/queues; final posting requires sync validation unless explicitly safe.
- Use idempotency keys for all mobile-posted transactions.
- Every scan must validate item/bin/lot/serial/context before accepting or queueing.

    ## Core Data Entities / Tables to Inspect or Add

    The exact names should follow repository conventions. Do not blindly create duplicate tables if equivalent entities already exist.

    - device_registration
- device_session
- offline_queue_item
- sync_checkpoint
- scan_event
- capture_attachment
- mobile_task
- mobile_exception
- sync_conflict
- device_trust_policy

    ## Transaction Workflows to Implement or Complete

    - Scan item/bin/lot/serial/LP
- Mobile material issue/return
- Mobile receiving/putaway
- Mobile picking/packing/POD
- Mobile inspection result
- Photo attachment capture
- Offline queue sync
- Conflict resolution

    ## Required Screens / UI Surfaces

    - Mobile home by role
- Scan-first transaction screen
- Offline queue monitor
- Device registration screen
- Warehouse mobile tasks
- Shop-floor operator terminal
- QC mobile result entry
- POD capture screen
- Conflict resolution screen

    ## Cross-Module Contracts

    - Inventory: bin selection, lot/serial/LP validation, stock moves.
- Production: operator issue/receipt/scrap/rework, job card context.
- Quality: photo evidence, inspection results, hold/release.
- Dispatch: pick/pack/POD photo/signature.
- Service: field visit, spare issue, customer signature.
- Integrations: sync logs and provider delivery after online restore.

    ## Non-Negotiable Fixes for This Pack

    - Barcode/camera must not be desktop-only placeholders; screens must support scan event handling, validation, manual fallback, and error feedback.
- Offline queues must be durable, idempotent, retryable, and conflict-aware; no silent loss when network changes.
- Device trust must store device identity, user, role, warehouse/plant scope, last seen, revoked/active status.
- Bin/lot/serial scans must be context-specific: a valid item barcode alone is not enough for bin-managed or serialised stock.

    ## Implementation Requirements

    ### Backend

    - Add or update migrations/schema/entities following current repo conventions.
    - Implement service-layer methods rather than hiding business rules in UI components.
    - Add validation for lifecycle status, role, numeric ranges, required fields, cross-entity references, and effective dates.
    - Add audit trail for state-changing actions.
    - Add idempotency where external/mobile/offline or retryable operations are involved.
    - Ensure failure paths return actionable error messages.

    ### Frontend

    - Use existing ERP layout, form, selector, modal, toast, and transaction-grid components.
    - Use governed selectors for governed fields.
    - Use numeric controls for numeric fields.
    - Keep save/reopen behavior reliable after refresh.
    - Show blocked actions with exact prerequisite, not vague text.
    - Preserve existing responsive/mobile behavior.

    ### Documents / Attachments / Reports

    - Use the shared attachment/document-output engine if available.
    - If not available and the feature is P0, implement the minimum real metadata/output path required for this pack.
    - Generated outputs must record template/version, requester, filters/entity, file metadata, and reissue/export log.

    ### Security and Audit

    - Enforce role-based access for create/edit/approve/post/cancel/reopen/export/send actions.
    - Store actor, timestamp, reason, prior state, next state, and related entity references for state transitions.
    - Do not leak restricted finance/customer/supplier/service data in reports, integrations, AI, or exports.

    ## Acceptance Tests Required

    - Scan bin+item+lot for inventory issue; verify validation and persisted scan events.
- Go offline, capture mobile transaction draft, reconnect, sync, verify idempotent posting.
- Capture photo for QC/POD/service; verify attachment metadata and entity link.
- Register/revoke device; verify revoked device cannot post.
- Create conflict by changing stock while offline; verify conflict queue and no silent bad posting.

    ## P0 Completion Gate

    This pack is not P0-complete until:

    - all P0 screens open without runtime errors;
    - every P0 action is real or explicitly outside P0;
    - all added fields persist and reopen;
    - all line grids calculate and save all lines;
    - linked transactions carry correct source references and revisions;
    - attachments/documents/reports are not fake;
    - tests/audits are run and reported;
    - a residual gap report is produced.