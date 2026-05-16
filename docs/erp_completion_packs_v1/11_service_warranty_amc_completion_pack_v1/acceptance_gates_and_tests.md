# Acceptance Gates and Tests — Service / Warranty / AMC Completion Pack v1

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

    - If implemented, service ticket must not be a simple complaint remark; it needs asset/customer/source, coverage, SLA, tasks, technician, parts, evidence, status, and closure reason.
- Warranty/AMC validation must be calculated from actual policy/contract snapshots, not free-text eligibility.
- Spare issue from service must use inventory controls: item/bin/lot/serial/LP, valuation, return/replacement reason.
- Customer sign-off must store evidence and cannot be a fake completed checkbox.

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

    - Register serialised asset from sales/dispatch record and verify warranty start/end.
- Create service ticket, validate coverage, assign technician, capture visit update and photo.
- Issue serialised spare from stock and return defective part/RMA.
- Capture customer sign-off and close ticket; verify billing request if billable.
- Generate AMC renewal and SLA reports.

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