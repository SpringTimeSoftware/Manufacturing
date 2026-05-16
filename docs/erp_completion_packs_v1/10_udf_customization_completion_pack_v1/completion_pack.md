# UDF / Customization Completion Pack v1

    ## Mission

    Build a safe user-defined-field and customization layer for masters, documents, line grids, reports, APIs, validations, formulas, defaults, permissions, and audit without schema chaos.

    ## Pack Classification

    - Pack number: 10
    - Folder: `udf_customization_completion_pack_v1`
    - Wave: Wave 2
    - Completion level expected: P0 real implementation for touched scope, P1/P2 only if explicitly marked out of scope with reason.

    ## Modules in Scope

    - UDF metadata
- Form customization
- Line-grid custom columns
- Validation rules
- Formula/default engine
- Dropdown/reference UDFs
- UDF security
- UDF reporting
- UDF API
- Customization audit/versioning

    ## Business Decisions to Confirm

    Codex can start with conservative defaults, but these decisions must be captured in the final report.

    - Which objects need UDF in V1: item, customer, supplier, quote/SO, PO, GRN, WO, QC, dispatch, service?
- Are UDFs tenant/company-specific or global?
- Can admin-created UDFs affect posting validation, or only capture extra info?
- Do UDFs need formulas referencing totals, quantities, tax, or dates?

    ## Conservative Defaults if No Decision Is Provided

    - Use metadata-driven fields with typed storage and validation; avoid runtime DDL per user change unless repository already supports it safely.
- Allow UDF on header and line separately.
- Require admin permission and versioned publish for UDF changes.
- Expose UDFs to reports only when marked reportable and permissioned.

    ## Core Data Entities / Tables to Inspect or Add

    The exact names should follow repository conventions. Do not blindly create duplicate tables if equivalent entities already exist.

    - udf_definition
- udf_option
- udf_assignment
- udf_value_header
- udf_value_line
- udf_validation_rule
- udf_formula
- udf_layout
- udf_permission
- udf_audit_log

    ## Transaction Workflows to Implement or Complete

    - Create/publish UDF
- Attach UDF to entity/screen
- Enter UDF on master/document/header/line
- Validate required/range/pattern/list
- Use UDF in report/export
- Deprecate UDF
- Migrate/rename UDF safely

    ## Required Screens / UI Surfaces

    - Customization admin
- UDF definition editor
- Form layout editor
- Line-grid custom column setup
- Validation/formula builder
- UDF audit/version viewer
- Report dataset UDF mapper

    ## Cross-Module Contracts

    - Reports: UDF columns and filters.
- Integrations/API: import/export and CRM mappings can include allowed UDFs.
- Transactions: UDF values must snapshot with document revisions.
- Workflow: UDF required fields can gate release/approval.
- Mobile: mobile screens must render required UDFs relevant to offline transactions.
- Security: sensitive UDFs hidden by role.

    ## Non-Negotiable Fixes for This Pack

    - UDFs must persist and reopen across create/edit/detail/print/export/report paths; no UI-only local state.
- Header and line UDFs must work in compact transaction grids without breaking keyboard entry or calculations.
- Required UDFs must be enforced at the correct lifecycle point: draft save vs release vs posting.
- UDF deprecation must preserve historical document values and not corrupt old reports.

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

    - Create text/number/date/dropdown/reference UDF and attach to quote header and line grid; save/reopen.
- Mark UDF required at release; verify draft can save but release blocks until filled.
- Expose reportable UDF in report builder and export.
- Deprecate UDF and verify old documents retain values.
- Run import with UDF columns and invalid rows; verify validation/error repair.

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