# Quality / NCR / COA Completion Pack v1

    ## Mission

    Close quality-management depth across incoming, in-process, final inspection, NCR/MRB/CAPA, quarantine, COA generation, and quality-to-inventory/production/dispatch handoffs.

    ## Pack Classification

    - Pack number: 04
    - Folder: `quality_ncr_coa_completion_pack_v1`
    - Wave: Wave 1
    - Completion level expected: P0 real implementation for touched scope, P1/P2 only if explicitly marked out of scope with reason.

    ## Modules in Scope

    - Quality masters
- Inspection plans
- Incoming quality
- In-process inspection
- Final inspection
- NCR/MRB/CAPA
- Quarantine/hold release
- COA generation
- Supplier/customer quality evidence

    ## Business Decisions to Confirm

    Codex can start with conservative defaults, but these decisions must be captured in the final report.

    - How are sample sizes determined: fixed, percentage, AQL, skip-lot, or item/customer-specific?
- Who can approve MRB dispositions: quality manager, production manager, purchase head, or maker/checker?
- Can COA be generated from inspection results only, or can authorised users enter supplemental certificate values?
- Do NCR dispositions affect inventory valuation immediately or only after finance approval?

    ## Conservative Defaults if No Decision Is Provided

    - Use item/customer/supplier effective-dated inspection plan priority: customer-specific > item-revision-specific > item-category default.
- Use status flow Draft → In Review → Approved/Released → Closed, with Cancelled/Reopened only by authorised role.
- Quarantine inventory must be non-allocatable and non-dispatchable until released.
- COA must be generated from approved inspection evidence, with manual overrides audited field-by-field.

    ## Core Data Entities / Tables to Inspect or Add

    The exact names should follow repository conventions. Do not blindly create duplicate tables if equivalent entities already exist.

    - quality_plan
- quality_plan_characteristic
- inspection_lot
- inspection_result
- ncr_header
- ncr_line
- mrb_disposition
- capa_case
- quality_hold
- coa_header
- coa_line
- quality_attachment

    ## Transaction Workflows to Implement or Complete

    - GRN inspection lot creation
- Production operation inspection
- Final QC before dispatch
- NCR from supplier/customer/internal source
- MRB disposition to release/rework/scrap/return/use-as-is
- COA generation and issue/reissue

    ## Required Screens / UI Surfaces

    - Quality workspace dashboard
- Inspection plan editor
- Inspection lot result-entry grid
- NCR/MRB workbench
- CAPA workbench
- Quality hold/release screen
- COA generate/preview/issue screen
- Supplier/customer quality scorecard

    ## Cross-Module Contracts

    - Inventory: quarantine/hold location, lot/serial/batch status, non-allocatable stock.
- P2P: GRN inspection, supplier rejection, vendor return trigger, supplier quality score.
- Production: operation/final QC gates, scrap/rework reason and costing handoff.
- Dispatch: final QC passed and COA issued gate where customer/item requires certificate.
- Documents: inspection attachments, NCR evidence, COA PDF and reissue log.
- Reports: defect trends, supplier PPM, customer complaint, COA aging.

    ## Non-Negotiable Fixes for This Pack

    - No inspection pass/fail button may be fake: it must persist results, status, user, timestamp, and inventory/document consequences.
- NCR must not be a remark-only form; it must carry source reference, affected item/revision/lot/serial/qty, defect category, containment, root cause, disposition, and closure.
- COA must not be a static PDF mock; it must derive from approved inspection results and store generated document/version/log.
- Quality hold must block allocation, picking, shipment, and production consumption unless explicit authorised override exists.

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

    - Create inspection plan, reopen, edit characteristic grid, verify persistence.
- Create GRN-linked inspection lot, enter numeric/text/attribute results, approve, verify stock status transitions.
- Create NCR from failed lot, route through MRB disposition, verify inventory and linked document consequences.
- Generate COA from approved final inspection, reissue with reason, verify audit/version history.
- Verify rejected/quarantined lots cannot be picked or dispatched.

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