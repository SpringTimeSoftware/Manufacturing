# Mobile / Barcode / Camera / Offline Completion Pack v1

    Close mobile runtime execution for barcode scanning, camera/photo capture, offline-first queues, device trust, sync conflicts, and shop-floor/warehouse/dispatch/service mobile workflows.

    ## Files in This Folder

    - `completion_pack.md` — full implementation specification.
    - `codex_prompt.md` — copy/paste prompt for a single Codex run.
    - `acceptance_gates_and_tests.md` — completion gates and rejection criteria.
    - `business_decisions_needed.md` — decisions and conservative defaults.
    - `codex_output_report_template.md` — required final report format.

    ## Recommended Use

    Run this pack by itself. Do not combine implementation with other packs unless Codex is only doing a planning/readiness pass.

    ## Main Completion Target

    Close mobile runtime execution for barcode scanning, camera/photo capture, offline-first queues, device trust, sync conflicts, and shop-floor/warehouse/dispatch/service mobile workflows.

    ## High-Risk Areas

    - Barcode/camera must not be desktop-only placeholders; screens must support scan event handling, validation, manual fallback, and error feedback.
- Offline queues must be durable, idempotent, retryable, and conflict-aware; no silent loss when network changes.
- Device trust must store device identity, user, role, warehouse/plant scope, last seen, revoked/active status.
- Bin/lot/serial scans must be context-specific: a valid item barcode alone is not enough for bin-managed or serialised stock.