# Acceptance Gates and Tests — Dispatch / Logistics / POD Completion Pack v1

    ## Gate 1 — Repo Inspection Evidence

    Codex must report what it inspected:

    - models/entities/tables;
    - API routes/controllers/services;
    - UI screens/components;
    - tests/audit scripts;
    - existing disabled actions or fake placeholders;
    - current data flow from source document to target document.

    ## Gate 2 — P0 Functional Completion

    Required P0 checks for this pack:

    - Bin/location selection must be real and persisted; no warehouse-only issue for bin-managed stock.
- Dispatch must preserve SO line commercial truth: price, discount, tax code, charges, salesperson, internal/external remarks.
- POD must store evidence metadata, attachment/category, captured-by, captured-at, and delivery result.
- Shipment confirmation must update stock and order fulfillment status atomically or roll back safely.

    ## Gate 3 — Save / Reopen / Refresh

    For every new or touched screen:

    - create record;
    - save;
    - refresh/reopen;
    - verify header values;
    - verify all line values;
    - verify attachments/documents if any;
    - verify status/action availability.

    ## Gate 4 — Cross-Pack Truth Checks

    Even when this pack is not primarily sales/finance/warehouse, Codex must state whether the pack touches these areas and verify accordingly.

    | Area | Required check |
    | --- | --- |
    | Salesperson / owner | Quote/SO/customer/service ownership preserved and visible where relevant. |
    | Remarks | Internal and customer-facing remarks persist and flow into documents where relevant. |
    | Price / discount / tax | Effective-dated source, snapshot, override reason, totals, rounding where touched. |
    | Bin / location / lot / serial / PCID | Required controls enforced for stock movements where touched. |
    | Revisions | Exact source revision references stored and shown where touched. |
    | Reports / exports | Outputs use real data and durable file/export job metadata. |
    | Attachments | Uploads use persisted entity metadata and permissions. |
    | Mobile / integration | Runtime success is not faked. |

    ## Gate 5 — Automated Tests

    Minimum tests/manual evidence required:

    - Create released SO with multiple lines and remarks; allocate stock from bins; verify bin reservations.
- Pick partial quantity with lot/serial; pack into PCID/LP; verify inventory and pack contents.
- Ship and generate delivery document; verify financial/tax values match source SO/invoice handoff.
- Capture POD with attachment/signature/photo metadata; verify delivered status and audit.
- Try to ship quality-held stock; verify blocked with reason.

    ## Gate 6 — Residual Gap Report

    Codex must produce a pack report with:

    - completed features;
    - files changed;
    - tests run;
    - remaining gaps;
    - business decisions required;
    - exact disabled actions left;
    - next recommended pack/action.

    ## Rejection Criteria

    Reject the pack if any of these happen:

    - success toast without persistence;
    - action opens empty modal without functional workflow;
    - fields save only in local component state;
    - totals calculate only first line;
    - governed field becomes free text;
    - numeric field is stored as arbitrary string;
    - old transaction mutates after revision/master change;
    - provider/mobile/offline success is marked without evidence;
    - final report omits tests or cross-pack truth checks.