# Reports / Dashboard Builder Completion Pack v1

    ## Mission

    Build a governed reporting and dashboard foundation with reusable datasets, filters, drill-downs, exports, scheduled delivery, role security, and module KPI dashboards.

    ## Pack Classification

    - Pack number: 07
    - Folder: `reports_dashboard_builder_completion_pack_v1`
    - Wave: Wave 1
    - Completion level expected: P0 real implementation for touched scope, P1/P2 only if explicitly marked out of scope with reason.

    ## Modules in Scope

    - Report catalog
- Dataset/data dictionary
- Dashboard builder
- KPI cards
- Pivot/table reports
- Charts
- Exports
- Scheduled reports
- Drill-through navigation
- Report permissions

    ## Business Decisions to Confirm

    Codex can start with conservative defaults, but these decisions must be captured in the final report.

    - Which reports are mandatory for pilot: sales, purchase, inventory, production, finance, quality, dispatch, service?
- Export formats: PDF, Excel, CSV, all?
- Can users build reports from governed datasets only, or can admins write SQL?
- Do scheduled reports need email/WhatsApp delivery now?

    ## Conservative Defaults if No Decision Is Provided

    - Use governed datasets/read models only; no arbitrary SQL for normal users.
- Support CSV/XLSX for tables and PDF for printable reports where print engine exists.
- Role-based permissions at dataset/report/dashboard level.
- Every KPI must drill to the underlying records and preserve filters.

    ## Core Data Entities / Tables to Inspect or Add

    The exact names should follow repository conventions. Do not blindly create duplicate tables if equivalent entities already exist.

    - report_dataset
- report_definition
- report_filter
- dashboard_definition
- dashboard_widget
- scheduled_report
- export_job
- report_permission
- report_audit_log
- kpi_definition

    ## Transaction Workflows to Implement or Complete

    - Create/edit report
- Run report
- Export report
- Schedule report
- Create dashboard
- Save filters
- Drill down to source record
- Audit report access

    ## Required Screens / UI Surfaces

    - Reports catalog
- Report builder
- Dashboard builder
- Saved filter panel
- Export/download center
- Scheduled report setup
- KPI dashboard home
- Admin dataset manager

    ## Cross-Module Contracts

    - Document output: shared export engine for BOM comparison, inventory export, RFQ comparison, traveler/labels where applicable.
- Finance: AP/AR aging, tax summary, valuation, margin, trial balance/subledger.
- Quality: NCR/CAPA/COA defect reports.
- Dispatch: POD pending, OTIF, freight/transporter.
- Mobile/integrations: scheduled reports and delivery logs.
- UDF: custom fields must be available in reports with safe metadata mapping.

    ## Non-Negotiable Fixes for This Pack

    - No report button can show static/sample data; every report must read from real persisted records or display a clear no-data state.
- Every export must create a durable export job with file metadata, requested-by, generated-at, filters, permissions, and expiry/retention.
- Dashboards must not hide calculation logic; widget definitions must store dataset, measure, grouping, filters, and drill route.
- Report totals must reconcile to source transaction totals, especially tax, discount, price, stock qty/value, AP/AR, and costing.

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

    - Create report from governed dataset, save filters, reopen, rerun.
- Export inventory/finance report; verify generated file metadata and permission checks.
- Create dashboard widget with drill-through to source transactions.
- Schedule a report and verify queued delivery/log even if provider credentials absent.
- Verify UDF appears in dataset only when field is reportable and user has permission.

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