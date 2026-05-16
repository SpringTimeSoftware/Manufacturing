# Service / Warranty / AMC Completion Pack v1

    ## Mission

    Define and, if in scope, implement service management: installed base, warranty, AMC/contracts, service tickets, field visits, spare parts, RMA, SLA, customer sign-off, billing handoff, and service analytics.

    ## Pack Classification

    - Pack number: 11
    - Folder: `service_warranty_amc_completion_pack_v1`
    - Wave: Wave 2 / Later-scope ready
    - Completion level expected: P0 real implementation for touched scope, P1/P2 only if explicitly marked out of scope with reason.

    ## Modules in Scope

    - Installed base/equipment
- Warranty registration
- AMC/service contracts
- Service ticketing
- Field visit scheduling
- Technician mobile
- Spare parts issue/return
- RMA/repair
- SLA/escalation
- Service billing handoff
- Customer sign-off

    ## Business Decisions to Confirm

    Codex can start with conservative defaults, but these decisions must be captured in the final report.

    - Is Service/AMC in immediate pilot scope or only later?
- Warranty source: sales invoice, dispatch, serial registration, manual registration, or all?
- Do field technicians consume spare inventory from van stock/bin stock?
- Should service generate AR invoice or only billing request?

    ## Conservative Defaults if No Decision Is Provided

    - If later scope, create truthful navigation, data model skeleton, and disabled reasons without fake actions.
- Warranty derives from item/customer/serial/invoice/dispatch date rules and stores snapshot.
- AMC has contract period, coverage, preventive visits, exclusions, SLA, billing schedule.
- Spare part issues must reduce inventory and link to service ticket/equipment/technician.

    ## Core Data Entities / Tables to Inspect or Add

    The exact names should follow repository conventions. Do not blindly create duplicate tables if equivalent entities already exist.

    - installed_asset
- asset_serial_registration
- warranty_policy
- warranty_registration
- service_contract
- amc_schedule
- service_ticket
- service_visit
- service_task
- service_spare_issue
- service_rma
- service_signoff
- service_billing_request

    ## Transaction Workflows to Implement or Complete

    - Register installed asset
- Open service ticket
- Validate warranty/AMC coverage
- Assign technician
- Field visit update
- Issue/return spare parts
- Capture customer sign-off
- Create RMA/repair order
- Generate billing request
- Close service ticket

    ## Required Screens / UI Surfaces

    - Service workspace
- Installed-base registry
- Warranty/AMC setup
- Ticket workbench
- Technician schedule
- Mobile service visit
- Spare issue/return screen
- RMA/repair screen
- Customer sign-off/POD-like capture
- Service dashboard

    ## Cross-Module Contracts

    - Sales/dispatch: serial and warranty start date from invoice/dispatch/POD.
- Inventory: spare parts issue/return, van stock, serialised replacement.
- Finance: AMC billing schedule, service invoice/credit, warranty expense.
- Mobile: field visit photos/signature/offline.
- Quality: complaints and NCR linkage for recurring defects.
- Reports: SLA compliance, technician productivity, warranty cost, AMC renewal.

    ## Non-Negotiable Fixes for This Pack

    - If implemented, service ticket must not be a simple complaint remark; it needs asset/customer/source, coverage, SLA, tasks, technician, parts, evidence, status, and closure reason.
- Warranty/AMC validation must be calculated from actual policy/contract snapshots, not free-text eligibility.
- Spare issue from service must use inventory controls: item/bin/lot/serial/LP, valuation, return/replacement reason.
- Customer sign-off must store evidence and cannot be a fake completed checkbox.

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

    - Register serialised asset from sales/dispatch record and verify warranty start/end.
- Create service ticket, validate coverage, assign technician, capture visit update and photo.
- Issue serialised spare from stock and return defective part/RMA.
- Capture customer sign-off and close ticket; verify billing request if billable.
- Generate AMC renewal and SLA reports.

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