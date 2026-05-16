# Acceptance Gates and Tests — Finance / GL / AP / AR / Costing Completion Pack v1

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

    - Quote and sales order must have salesperson/sales owner and remarks fields; if already in customer master they must still snapshot onto document header/line where needed.
- Price and discount must be picked from effective-dated rules, snapshotted, override-audited, and recalculated only when user explicitly refreshes pricing.
- Tax must calculate from tax code, place/supply/customer/item/HSN/GST category where configured, charges inclusion, rounding, and document date.
- Revisions of quotes, SOs, POs, BOM/routing, and released documents must apply to linked transactions through explicit revision references, not silent latest-version use.
- Every posting must produce a traceable subledger/accounting entry or explicit in-scope blocked reason.

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

    - Create quote with customer price list, discount, tax, charges, remarks, salesperson; convert/order or save SO; verify snapshots.
- Change price list after SO; verify old SO remains locked unless repriced with audit.
- Create GRN→supplier invoice 3-way match; post AP liability/payment schedule/subledger.
- Create production material issue/receipt and verify WIP/cost movement or bridge entries.
- Allocate landed cost by quantity/value/manual split and verify inventory valuation impact.
- Run tax summary and margin report; verify totals reconcile to documents.

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