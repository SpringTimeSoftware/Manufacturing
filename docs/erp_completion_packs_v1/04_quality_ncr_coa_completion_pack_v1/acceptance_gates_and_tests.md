# Acceptance Gates and Tests — Quality / NCR / COA Completion Pack v1

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

    - No inspection pass/fail button may be fake: it must persist results, status, user, timestamp, and inventory/document consequences.
- NCR must not be a remark-only form; it must carry source reference, affected item/revision/lot/serial/qty, defect category, containment, root cause, disposition, and closure.
- COA must not be a static PDF mock; it must derive from approved inspection results and store generated document/version/log.
- Quality hold must block allocation, picking, shipment, and production consumption unless explicit authorised override exists.

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

    - Create inspection plan, reopen, edit characteristic grid, verify persistence.
- Create GRN-linked inspection lot, enter numeric/text/attribute results, approve, verify stock status transitions.
- Create NCR from failed lot, route through MRB disposition, verify inventory and linked document consequences.
- Generate COA from approved final inspection, reissue with reason, verify audit/version history.
- Verify rejected/quarantined lots cannot be picked or dispatched.

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