# Codex Prompt — Mobile / Barcode / Camera / Offline Completion Pack v1

    ```text
    You are working in the ERP repository. Execute Mobile / Barcode / Camera / Offline Completion Pack v1 from this folder.

    First inspect the actual repo. Do not assume paths, table names, services, or components. Reuse existing conventions.

    Mission:
    Close mobile runtime execution for barcode scanning, camera/photo capture, offline-first queues, device trust, sync conflicts, and shop-floor/warehouse/dispatch/service mobile workflows.

    Read these files before changing code:
    - README.md
    - completion_pack.md
    - acceptance_gates_and_tests.md
    - business_decisions_needed.md
    - ../../01_SHARED_NON_NEGOTIABLES.md
    - ../../02_CROSS_PACK_RESIDUAL_GAP_CLOSURE_AUDIT.md

    Non-negotiable rules:
    - No fake buttons, dead links, dummy success toasts, static sample data, or local-only state.
    - Every P0 field must persist, reopen, validate, and audit where business-critical.
    - Every P0 action must be implemented end-to-end or be explicitly outside P0 with precise reason.
    - Preserve quote/SO salesperson, remarks, price/discount/tax, charges, and revision truth wherever this pack touches sales/commercial flow.
    - Preserve warehouse/bin/lot/serial/PCID truth wherever this pack touches inventory.
    - Preserve exact revision references in related transactions.
    - Add migrations/services/APIs/UI/tests/audit updates as required.
    - Do not hardcode secrets or provider credentials.
    - Do not silently change old released/posted transactions.

    Required scope:
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

    Critical workflows:
    - Scan item/bin/lot/serial/LP
- Mobile material issue/return
- Mobile receiving/putaway
- Mobile picking/packing/POD
- Mobile inspection result
- Photo attachment capture
- Offline queue sync
- Conflict resolution

    Non-negotiable pack-specific fixes:
    - Barcode/camera must not be desktop-only placeholders; screens must support scan event handling, validation, manual fallback, and error feedback.
- Offline queues must be durable, idempotent, retryable, and conflict-aware; no silent loss when network changes.
- Device trust must store device identity, user, role, warehouse/plant scope, last seen, revoked/active status.
- Bin/lot/serial scans must be context-specific: a valid item barcode alone is not enough for bin-managed or serialised stock.

    Implementation sequence:
    1. Inspect current repo surfaces for this module and list existing gaps.
    2. Implement schema/model/service/API changes.
    3. Implement UI and workflow changes.
    4. Add tests/audit gates.
    5. Run available tests/audits.
    6. Produce final report using codex_output_report_template.md.

    Final report must explicitly answer:
    - What was completed?
    - Which files changed?
    - Which migrations/schema changes were made?
    - Which APIs/routes/services/jobs were added or changed?
    - Which screens changed?
    - Which tests/audits were run, with result?
    - Are any actions still disabled? If yes, why exactly and what next?
    - Did this pack preserve or fix salesperson/remarks, bin selection, revisions, price/discount/tax where touched?
    ```